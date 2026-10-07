<?php

namespace App\Http\Controllers;

use App\Models\CsmsRig;
use App\Models\CsmsDocumentCategory;
use App\Models\CsmsRecord;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class CsmsController extends Controller
{
    /**
     * Dapatkan daftar tahun CSMS yang tersedia dari persistent storage & database.
     */
    public static function getAvailableYears(): array
    {
        $yearsFile = storage_path('app/csms_years.json');
        $customYears = [];
        $deletedYears = [];

        if (file_exists($yearsFile)) {
            $data = json_decode(file_get_contents($yearsFile), true) ?: [];
            $customYears = array_map('intval', $data['custom'] ?? []);
            $deletedYears = array_map('intval', $data['deleted'] ?? []);
        }

        $currentYear = (int) date('Y');
        $baseYears = range(2024, $currentYear + 5);

        // Ambil juga tahun-tahun yang sudah pernah diinput di database record
        try {
            $recordYears = CsmsRecord::distinct('periode_tahun')->pluck('periode_tahun')->map(fn($y) => (int)$y)->toArray();
        } catch (\Throwable $e) {
            $recordYears = [];
        }

        $allYears = array_unique(array_merge($baseYears, $recordYears, $customYears));
        $allYears = array_values(array_filter($allYears, fn($y) => !in_array((int)$y, $deletedYears, true)));

        sort($allYears);

        if (empty($allYears)) {
            $allYears = [$currentYear];
        }

        return $allYears;
    }

    /**
     * Tentukan tahun aktif (selected year) yang valid.
     * Jika request tahun tidak valid / tidak ada di daftar, fallback ke tahun berjalan atau tahun pertama/terbaru yang tersedia.
     */
    public static function resolveActiveYear(?int $requestedYear = null): int
    {
        $availableYears = self::getAvailableYears();
        $currentYear = (int) date('Y');

        if ($requestedYear && in_array($requestedYear, $availableYears, true)) {
            return $requestedYear;
        }

        // Fallback 1: Jika tahun berjalan ada di daftar
        if (in_array($currentYear, $availableYears, true)) {
            return $currentYear;
        }

        // Fallback 2: Tahun terbaru yang tersedia di daftar
        return !empty($availableYears) ? end($availableYears) : $currentYear;
    }

    /**
     * Dashboard CSMS - List of 20 RIGs and document overview.
     */
    public function index(Request $request)
    {
        $user = auth()->user();
        // Jika user lapangan biasa (bukan admin), alihkan langsung ke halaman input Rig miliknya
        if ($user && $user->role === 'user' && $user->csms_rig_id) {
            return redirect()->route('csms.user-rig-input', ['rig_id' => $user->csms_rig_id]);
        }

        $bulan = $request->query('bulan', 'Januari');
        $tahun = self::resolveActiveYear($request->query('tahun') ? (int)$request->query('tahun') : null);
        $selectedRigId = $request->query('rig_id');
        $availableYears = self::getAvailableYears();

        $rigs = CsmsRig::where('status', 'active')->orderBy('id')->get();
        $categories = CsmsDocumentCategory::orderBy('no')->get();

        // Get records for selected month & year
        $query = CsmsRecord::with(['rig', 'category'])
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun);

        if ($selectedRigId) {
            $query->where('csms_rig_id', $selectedRigId);
        }

        $records = $query->latest('updated_at')->get();

        // Calculate stats per RIG
        $rigStats = $rigs->map(function ($rig) use ($records, $categories) {
            $rigRecords = $records->where('csms_rig_id', $rig->id);
            $totalRequired = $categories->reduce(function ($carry, $cat) {
                return $carry + ($cat->scope === 'crew' ? 3 : 1);
            }, 0);
            $completed = $rigRecords->where('status', 'Lengkap')->count();
            $approvedCount = $rigRecords->where('approval_status', 'approved')->count();

            return [
                'id' => $rig->id,
                'name' => $rig->name,
                'code' => $rig->code,
                'completed_count' => $completed,
                'approved_count' => $approvedCount,
                'total_required' => $totalRequired,
                'percentage' => $totalRequired > 0 ? round(($completed / $totalRequired) * 100, 1) : 0,
            ];
        });

        // Overall statistics
        $totalRigCount = $rigs->count();
        $totalRecordsCount = $records->count();
        $lengkapCount = $records->where('status', 'Lengkap')->count();
        $pendingCount = $records->where('status', 'Pending')->count();
        $approvedCount = $records->where('approval_status', 'approved')->count();

        return Inertia::render('Csms/Dashboard', [
            'rigs' => $rigs,
            'categories' => $categories,
            'records' => $records,
            'rigStats' => $rigStats,
            'availableYears' => $availableYears,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
                'rig_id' => $selectedRigId ? (int)$selectedRigId : null,
            ],
            'summary' => [
                'total_rigs' => $totalRigCount,
                'total_uploaded' => $totalRecordsCount,
                'lengkap_count' => $lengkapCount,
                'pending_count' => $pendingCount,
                'approved_count' => $approvedCount,
            ],
        ]);
    }

    /**
     * View detail RIG CSMS document matrix.
     */
    public function showRig(Request $request, $id)
    {
        $user = auth()->user();
        // Proteksi: Jika user lapangan mencoba melihat rig lain, paksa kembali ke rig miliknya
        if ($user && $user->role === 'user' && $user->csms_rig_id && (int)$id !== (int)$user->csms_rig_id) {
            return redirect()->route('csms.rig-detail', ['id' => $user->csms_rig_id]);
        }

        $rig = CsmsRig::findOrFail($id);
        $bulan = $request->query('bulan', 'Januari');
        $tahun = self::resolveActiveYear($request->query('tahun') ? (int)$request->query('tahun') : null);
        $availableYears = self::getAvailableYears();

        $categories = CsmsDocumentCategory::orderBy('no')->get();
        $records = CsmsRecord::where('csms_rig_id', $rig->id)
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun)
            ->get();

        // Organize records into matrix indexed by [category_id][crew]
        $matrix = [];
        foreach ($records as $rec) {
            $crewKey = $rec->crew ?: 'Rig';
            $matrix[$rec->csms_document_category_id][$crewKey] = $rec;
        }

        // Jika user lapangan, hanya tampilkan rig miliknya pada daftar switcher
        $isRestricted = $user && $user->role === 'user' && (bool)$user->csms_rig_id;
        $allRigs = $isRestricted 
            ? CsmsRig::where('id', $user->csms_rig_id)->get() 
            : CsmsRig::where('status', 'active')->orderBy('id')->get();

        return Inertia::render('Csms/RigDetail', [
            'rig' => $rig,
            'categories' => $categories,
            'records' => $records,
            'matrix' => $matrix,
            'availableYears' => $availableYears,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
            'allRigs' => $allRigs,
            'isRestricted' => $isRestricted,
        ]);
    }

    /**
     * Halaman Khusus Admin: Verifikasi & ACC Dokumen CSMS
     */
    public function verificationIndex(Request $request): Response
    {
        $bulan = $request->query('bulan', 'Januari');
        $tahun = self::resolveActiveYear($request->query('tahun') ? (int)$request->query('tahun') : null);
        $rigId = $request->query('rig_id');
        $approvalStatus = $request->query('status', 'all');
        $availableYears = self::getAvailableYears();

        $rigs = CsmsRig::where('status', 'active')->orderBy('id')->get();
        $categories = CsmsDocumentCategory::orderBy('no')->get();

        $query = CsmsRecord::with(['rig', 'category'])
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun);

        if ($rigId) {
            $query->where('csms_rig_id', $rigId);
        }

        if ($approvalStatus && $approvalStatus !== 'all') {
            $query->where('approval_status', $approvalStatus);
        }

        $records = $query->latest('updated_at')->get();

        // Rekap Status Approval untuk Periode ini
        $baseQuery = CsmsRecord::where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun);
        if ($rigId) {
            $baseQuery->where('csms_rig_id', $rigId);
        }
        $allPeriodRecords = $baseQuery->get();

        $stats = [
            'total' => $allPeriodRecords->count(),
            'pending' => $allPeriodRecords->where('approval_status', 'pending')->count(),
            'approved' => $allPeriodRecords->where('approval_status', 'approved')->count(),
            'revision' => $allPeriodRecords->where('approval_status', 'revision')->count(),
            'rejected' => $allPeriodRecords->where('approval_status', 'rejected')->count(),
        ];

        return Inertia::render('Admin/CsmsVerification', [
            'records' => $records,
            'rigs' => $rigs,
            'categories' => $categories,
            'availableYears' => $availableYears,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
                'rig_id' => $rigId ? (int)$rigId : null,
                'status' => $approvalStatus,
            ],
            'stats' => $stats,
        ]);
    }

    /**
     * Aksi Verifikasi: ACC / Setujui / Minta Revisi Dokumen
     */
    public function verifyRecord(Request $request, $id)
    {
        $request->validate([
            'approval_status' => 'required|in:approved,revision,rejected,pending',
            'approval_notes' => 'nullable|string|max:1000',
        ]);

        $record = CsmsRecord::findOrFail($id);
        $record->approval_status = $request->approval_status;
        $record->approval_notes = $request->approval_notes;
        $record->approved_by = auth()->user()->name ?? 'Admin HSE';
        $record->approved_at = now();

        if ($request->approval_status === 'approved') {
            $record->status = 'Lengkap';
        } elseif ($request->approval_status === 'revision' || $request->approval_status === 'rejected') {
            $record->status = 'Pending';
        }

        $record->save();

        $pesan = $request->approval_status === 'approved' 
            ? 'Dokumen CSMS berhasil di-ACC (Disetujui)!' 
            : 'Status dokumen diperbarui (Catatan revisi telah disimpan).';

        return redirect()->back()->with('success', $pesan);
    }

    /**
     * Aksi Bulk ACC (Setujui Sekaligus Dokumen Terpilih)
     */
    public function verifyBulk(Request $request)
    {
        $request->validate([
            'record_ids' => 'required|array',
            'record_ids.*' => 'exists:csms_records,id',
            'approval_status' => 'required|in:approved,revision,rejected',
        ]);

        $adminName = auth()->user()->name ?? 'Admin HSE';

        CsmsRecord::whereIn('id', $request->record_ids)->update([
            'approval_status' => $request->approval_status,
            'status' => $request->approval_status === 'approved' ? 'Lengkap' : 'Pending',
            'approved_by' => $adminName,
            'approved_at' => now(),
        ]);

        return redirect()->back()->with('success', count($request->record_ids) . ' Dokumen berhasil diverifikasi sekaligus!');
    }

    /**
     * Halaman Khusus User Lapangan: Input Dokumen Per-RIG
     * (HANYA BISA MELIHAT & MENGISI RIG YANG DITUGASKAN KEPADA USER TERSEBUT)
     */
    public function userRigInput(Request $request, $rig_id = null)
    {
        $user = auth()->user();
        $isRestricted = $user && $user->role === 'user' && (bool)$user->csms_rig_id;

        if ($isRestricted) {
            $activeRigId = $user->csms_rig_id;
            // Jika user mencoba memasukkan ID Rig lain di URL, paksa kembali ke Rig miliknya
            if ($rig_id && (int)$rig_id !== (int)$user->csms_rig_id) {
                return redirect()->route('csms.user-rig-input', ['rig_id' => $user->csms_rig_id]);
            }
            // User hanya boleh melihat rig miliknya di allRigs
            $rigs = CsmsRig::where('id', $user->csms_rig_id)->get();
        } else {
            // Admin bebas melihat dan memilih unit Rig manapun
            $rigs = CsmsRig::where('status', 'active')->orderBy('id')->get();
            $activeRigId = $rig_id ?: $request->query('rig_id') ?: ($rigs->first()?->id ?? 1);
        }

        $rig = CsmsRig::findOrFail($activeRigId);

        $bulan = $request->query('bulan', 'Januari');
        $tahun = self::resolveActiveYear($request->query('tahun') ? (int)$request->query('tahun') : null);
        $availableYears = self::getAvailableYears();

        $categories = CsmsDocumentCategory::orderBy('no')->get();
        $records = CsmsRecord::where('csms_rig_id', $rig->id)
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun)
            ->get();

        // Organisasikan matriks per kategori & crew
        $matrix = [];
        foreach ($records as $rec) {
            $crewKey = $rec->crew ?: 'Rig';
            $matrix[$rec->csms_document_category_id][$crewKey] = $rec;
        }

        // Kalkulasi Statistik Kesiapan Rig Terpilih
        $totalRequired = $categories->reduce(function ($carry, $cat) {
            return $carry + ($cat->scope === 'crew' ? 3 : 1);
        }, 0);
        $totalUploaded = $records->whereNotNull('file_path')->count();
        $approvedCount = $records->where('approval_status', 'approved')->count();
        $revisionCount = $records->where('approval_status', 'revision')->count();
        $pendingCount = $records->where('approval_status', 'pending')->count();

        $rigSummary = [
            'total_required' => $totalRequired,
            'total_uploaded' => $totalUploaded,
            'approved_count' => $approvedCount,
            'revision_count' => $revisionCount,
            'pending_count' => $pendingCount,
            'compliance_percentage' => $totalRequired > 0 ? round(($approvedCount / $totalRequired) * 100, 1) : 0,
        ];

        return Inertia::render('Csms/UserRigInput', [
            'rig' => $rig,
            'allRigs' => $rigs,
            'categories' => $categories,
            'records' => $records,
            'matrix' => $matrix,
            'rigSummary' => $rigSummary,
            'isRestricted' => $isRestricted,
            'availableYears' => $availableYears,
            'filter' => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
        ]);
    }

    /**
     * Store or update document upload (User & Admin).
     */
    public function uploadRecord(Request $request)
    {
        $user = auth()->user();

        // Proteksi: Jika user lapangan biasa, pastikan dokumen WAJIB diunggah ke Rig miliknya
        if ($user && $user->role === 'user' && $user->csms_rig_id) {
            $request->merge(['csms_rig_id' => $user->csms_rig_id]);
        }

        $request->validate([
            'csms_rig_id' => 'required|exists:csms_rigs,id',
            'csms_document_category_id' => 'required|exists:csms_document_categories,id',
            'periode_bulan' => 'required|string',
            'periode_tahun' => 'required|integer',
            'crew' => 'nullable|string',
            'status' => 'required|in:Lengkap,Tidak Ada,Pending,In Progress',
            'keterangan' => 'nullable|string',
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:500', // max 500KB
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:500', // max 500KB per berkas
        ], [
            'file.max' => 'Ukuran berkas tidak boleh melebihi 500 KB.',
            'files.*.max' => 'Ukuran setiap berkas tidak boleh melebihi 500 KB.',
            'file.mimes' => 'Format berkas harus PDF, JPG, JPEG, PNG, atau Word (DOC/DOCX).',
            'files.*.mimes' => 'Format setiap berkas harus PDF, JPG, JPEG, PNG, atau Word (DOC/DOCX).',
        ]);

        $record = CsmsRecord::firstOrNew([
            'csms_rig_id' => $request->csms_rig_id,
            'csms_document_category_id' => $request->csms_document_category_id,
            'periode_bulan' => $request->periode_bulan,
            'periode_tahun' => $request->periode_tahun,
            'crew' => $request->crew,
        ]);

        $uploadedAttachments = [];

        // Tangani array files jika diunggah banyak sekaligus
        if ($request->hasFile('files')) {
            foreach ($request->file('files') as $f) {
                if ($f && $f->isValid()) {
                    $path = $f->store('csms_documents', 'public');
                    $uploadedAttachments[] = [
                        'name' => $f->getClientOriginalName(),
                        'path' => $path,
                        'size' => $f->getSize(),
                        'type' => strtolower($f->getClientOriginalExtension()),
                        'uploaded_at' => now()->toDateTimeString(),
                    ];
                }
            }
        }

        // Tangani single file jika dikirim
        if ($request->hasFile('file')) {
            $f = $request->file('file');
            if ($f && $f->isValid()) {
                $path = $f->store('csms_documents', 'public');
                $uploadedAttachments[] = [
                    'name' => $f->getClientOriginalName(),
                    'path' => $path,
                    'size' => $f->getSize(),
                    'type' => strtolower($f->getClientOriginalExtension()),
                    'uploaded_at' => now()->toDateTimeString(),
                ];
            }
        }

        if (!empty($uploadedAttachments)) {
            // Hapus berkas lama dari storage jika diunggah ulang
            if ($record->file_path && Storage::disk('public')->exists($record->file_path)) {
                Storage::disk('public')->delete($record->file_path);
            }
            if (!empty($record->attachments) && is_array($record->attachments)) {
                foreach ($record->attachments as $oldAtt) {
                    if (!empty($oldAtt['path']) && Storage::disk('public')->exists($oldAtt['path'])) {
                        Storage::disk('public')->delete($oldAtt['path']);
                    }
                }
            }

            // Simpan daftar attachments
            $record->attachments = $uploadedAttachments;

            // Berkas utama untuk kompatibilitas tampilan lama
            $primary = $uploadedAttachments[0];
            $record->file_path = $primary['path'];
            $record->file_name = count($uploadedAttachments) > 1
                ? count($uploadedAttachments) . ' Berkas Terlampir (' . $primary['name'] . ' dkk)'
                : $primary['name'];
            $record->file_size = array_sum(array_column($uploadedAttachments, 'size'));
            $record->file_type = $primary['type'];
        }

        $record->status = $request->status;
        $record->keterangan = $request->keterangan;
        $record->uploaded_by = $user->name ?? 'Operator Lapangan';
        
        // Saat diunggah ulang / baru, set approval_status menjadi 'pending' agar Admin memeriksa kembali
        $record->approval_status = 'pending';
        $record->save();

        $count = count($uploadedAttachments);
        $pesan = $count > 1 
            ? "{$count} berkas dokumen CSMS (Maks 500 KB) berhasil diunggah!"
            : "Dokumen CSMS (Maks 500 KB) berhasil diunggah!";

        return redirect()->back()->with('success', $pesan);
    }

    /**
     * Delete record file.
     */
    public function deleteRecord($id)
    {
        $user = auth()->user();
        $record = CsmsRecord::findOrFail($id);

        // Proteksi: User lapangan hanya boleh menghapus dokumen di Rig miliknya
        if ($user && $user->role === 'user' && $user->csms_rig_id && (int)$record->csms_rig_id !== (int)$user->csms_rig_id) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus dokumen Rig lain.');
        }

        if ($record->file_path && Storage::disk('public')->exists($record->file_path)) {
            Storage::disk('public')->delete($record->file_path);
        }
        if (!empty($record->attachments) && is_array($record->attachments)) {
            foreach ($record->attachments as $att) {
                if (!empty($att['path']) && Storage::disk('public')->exists($att['path'])) {
                    Storage::disk('public')->delete($att['path']);
                }
            }
        }

        $record->delete();

        return redirect()->back()->with('success', 'Dokumen CSMS berhasil dihapus!');
    }
    /**
     * [ADMIN ONLY] Tambah kategori dokumen CSMS baru.
     * Endpoint ini dilindungi middleware role:admin di routes,
     * namun tetap diverifikasi di sini sebagai lapisan keamanan ganda.
     */
    public function storeCategory(Request $request)
    {
        // Lapisan keamanan ganda: pastikan hanya admin yang bisa mengeksekusi
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menambah kategori dokumen.');
        }

        $request->validate([
            'nama_dokumen' => 'required|string|max:255',
            'durasi'       => 'required|string|max:100',
            'scope'        => 'required|in:crew,rig',
            'keterangan_default' => 'nullable|string|max:500',
        ], [
            'nama_dokumen.required' => 'Nama dokumen wajib diisi.',
            'durasi.required'       => 'Durasi wajib diisi.',
            'scope.required'        => 'Scope wajib dipilih.',
        ]);

        // Tentukan nomor urut berikutnya
        $maxNo = CsmsDocumentCategory::max('no') ?? 0;

        $category = CsmsDocumentCategory::create([
            'dept'               => 'Dokumen dan Rekaman HSE',
            'no'                 => $maxNo + 1,
            'nama_dokumen'       => $request->nama_dokumen,
            'durasi'             => $request->durasi,
            'scope'              => $request->scope,
            'keterangan_default' => $request->keterangan_default,
        ]);

        return redirect()->back()->with('success', "Kategori dokumen \"{$category->nama_dokumen}\" berhasil ditambahkan (No. {$category->no}).");
    }

    /**
     * [ADMIN ONLY] Ubah (edit/rename) kategori dokumen CSMS.
     * Endpoint ini dilindungi middleware role:admin di routes,
     * namun tetap diverifikasi di sini sebagai lapisan keamanan ganda.
     */
    public function updateCategory(Request $request, $id)
    {
        // Lapisan keamanan ganda: pastikan hanya admin yang bisa mengeksekusi
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mengubah kategori dokumen.');
        }

        $request->validate([
            'nama_dokumen'       => 'required|string|max:255',
            'durasi'             => 'nullable|string|max:100',
            'scope'              => 'nullable|in:crew,rig',
            'keterangan_default' => 'nullable|string|max:500',
        ], [
            'nama_dokumen.required' => 'Nama dokumen tidak boleh kosong.',
        ]);

        $category = CsmsDocumentCategory::findOrFail($id);
        $oldName  = $category->nama_dokumen;

        $updateData = ['nama_dokumen' => $request->nama_dokumen];
        if ($request->has('durasi') && $request->durasi !== null) {
            $updateData['durasi'] = $request->durasi;
        }
        if ($request->has('scope') && $request->scope !== null) {
            $updateData['scope'] = $request->scope;
        }
        if ($request->has('keterangan_default')) {
            $updateData['keterangan_default'] = $request->keterangan_default;
        }

        $category->update($updateData);

        return redirect()->back()->with('success', "Kategori dokumen \"{$oldName}\" berhasil diperbarui.");
    }

    /**
     * [ADMIN ONLY] Hapus kategori dokumen CSMS beserta berkas fisiknya.
     * Endpoint ini dilindungi middleware role:admin di routes,
     * namun tetap diverifikasi di sini sebagai lapisan keamanan ganda.
     */
    public function destroyCategory($id)
    {
        // Lapisan keamanan ganda: pastikan hanya admin yang bisa mengeksekusi
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menghapus kategori dokumen.');
        }

        $category = CsmsDocumentCategory::findOrFail($id);
        $catName = $category->nama_dokumen;

        // Bersihkan berkas fisik yang terikat pada kategori ini dari storage
        $records = CsmsRecord::where('csms_document_category_id', $category->id)->get();
        foreach ($records as $record) {
            if ($record->file_path && Storage::disk('public')->exists($record->file_path)) {
                Storage::disk('public')->delete($record->file_path);
            }
            if (!empty($record->attachments) && is_array($record->attachments)) {
                foreach ($record->attachments as $att) {
                    if (!empty($att['path']) && Storage::disk('public')->exists($att['path'])) {
                        Storage::disk('public')->delete($att['path']);
                    }
                }
            }
        }

        // Hapus kategori (relasi csms_records akan terhapus via database cascade)
        $category->delete();

        return redirect()->back()->with('success', "Kategori dokumen \"{$catName}\" berhasil dihapus.");
    }

    /**
     * [ADMIN ONLY] Tambah unit RIG baru.
     */
    public function storeRig(\Illuminate\Http\Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menambahkan unit RIG baru.');
        }

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:csms_rigs,name',
            'code' => 'required|string|max:50|unique:csms_rigs,code',
            'status' => 'nullable|string|in:active,inactive',
        ], [
            'name.required' => 'Nama RIG wajib diisi.',
            'name.unique' => 'Nama RIG sudah terdaftar.',
            'code.required' => 'Kode RIG wajib diisi.',
            'code.unique' => 'Kode RIG sudah terdaftar.',
        ]);

        $rig = CsmsRig::create([
            'name' => trim($validated['name']),
            'code' => strtoupper(trim($validated['code'])),
            'status' => $validated['status'] ?? 'active',
        ]);

        return redirect()->back()->with('success', "Unit RIG \"{$rig->name}\" ({$rig->code}) berhasil ditambahkan.");
    }

    /**
     * [ADMIN ONLY] Ubah data unit RIG.
     */
    public function updateRig(\Illuminate\Http\Request $request, $id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mengubah data unit RIG.');
        }

        $rig = CsmsRig::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:100|unique:csms_rigs,name,' . $rig->id,
            'code' => 'required|string|max:50|unique:csms_rigs,code,' . $rig->id,
            'status' => 'nullable|string|in:active,inactive',
        ]);

        $rig->update([
            'name' => trim($validated['name']),
            'code' => strtoupper(trim($validated['code'])),
            'status' => $validated['status'] ?? $rig->status,
        ]);

        return redirect()->back()->with('success', "Data unit RIG \"{$rig->name}\" berhasil diperbarui.");
    }

    /**
     * [ADMIN ONLY] Hapus unit RIG.
     */
    public function destroyRig($id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menghapus unit RIG.');
        }

        $rig = CsmsRig::findOrFail($id);
        $rigName = $rig->name;
        $rigCode = $rig->code;

        // Bersihkan berkas fisik yang terikat pada rig ini dari storage
        $records = CsmsRecord::where('csms_rig_id', $rig->id)->get();
        foreach ($records as $record) {
            if ($record->file_path && Storage::disk('public')->exists($record->file_path)) {
                Storage::disk('public')->delete($record->file_path);
            }
            if (!empty($record->attachments) && is_array($record->attachments)) {
                foreach ($record->attachments as $att) {
                    if (!empty($att['path']) && Storage::disk('public')->exists($att['path'])) {
                        Storage::disk('public')->delete($att['path']);
                    }
                }
            }
        }

        $rig->delete();

        return redirect()->back()->with('success', "Unit RIG \"{$rigName}\" ({$rigCode}) berhasil dihapus.");
    }

    /**
     * [ADMIN ONLY] Tambah opsi tahun ke pilihan dropdown CSMS.
     */
    public function storeYear(\Illuminate\Http\Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menambah pilihan tahun.');
        }

        $validated = $request->validate([
            'year' => 'required|integer|min:1900|max:2200',
        ]);

        $year = (int) $validated['year'];
        $yearsFile = storage_path('app/csms_years.json');
        $data = file_exists($yearsFile) ? (json_decode(file_get_contents($yearsFile), true) ?: []) : [];
        $custom = array_map('intval', $data['custom'] ?? []);
        $deleted = array_map('intval', $data['deleted'] ?? []);

        // Hapus dari daftar deleted jika sebelumnya pernah dihapus
        $deleted = array_values(array_filter($deleted, fn($y) => $y !== $year));
        // Tambahkan ke custom jika belum ada
        if (!in_array($year, $custom, true)) {
            $custom[] = $year;
        }

        if (!file_exists(storage_path('app'))) {
            @mkdir(storage_path('app'), 0755, true);
        }
        file_put_contents($yearsFile, json_encode(['custom' => $custom, 'deleted' => $deleted], JSON_PRETTY_PRINT));

        return redirect()->back()->with('success', "Opsi tahun {$year} berhasil ditambahkan.");
    }

    /**
     * [ADMIN ONLY] Hapus opsi tahun dari pilihan dropdown CSMS.
     * Endpoint ini dilindungi middleware role:admin di routes,
     * dan diverifikasi ganda dengan role check di controller.
     */
    public function deleteYear(\Illuminate\Http\Request $request, $year)
    {
        // Lapisan keamanan ganda: pastikan hanya admin yang bisa mengeksekusi
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menghapus pilihan tahun.');
        }

        $yearInt = (int) $year;
        if ($yearInt < 1900 || $yearInt > 2200) {
            return response()->json(['message' => 'Format tahun tidak valid.'], 422);
        }

        $yearsFile = storage_path('app/csms_years.json');
        $data = file_exists($yearsFile) ? (json_decode(file_get_contents($yearsFile), true) ?: []) : [];
        $custom = array_map('intval', $data['custom'] ?? []);
        $deleted = array_map('intval', $data['deleted'] ?? []);

        // Hapus dari custom
        $custom = array_values(array_filter($custom, fn($y) => $y !== $yearInt));
        // Tambahkan ke deleted
        if (!in_array($yearInt, $deleted, true)) {
            $deleted[] = $yearInt;
        }

        if (!file_exists(storage_path('app'))) {
            @mkdir(storage_path('app'), 0755, true);
        }
        file_put_contents($yearsFile, json_encode(['custom' => $custom, 'deleted' => $deleted], JSON_PRETTY_PRINT));

        // Dapatkan tahun fallback berikutnya yang masih tersedia
        $fallbackYear = self::resolveActiveYear();

        // Redirect dengan sinkronisasi parameter tahun baru
        $referer = $request->headers->get('referer');
        if ($referer) {
            $parsedUrl = parse_url($referer);
            $path = $parsedUrl['path'] ?? '/csms';
            parse_str($parsedUrl['query'] ?? '', $queryParams);

            // Ganti tahun jika sama dengan tahun yang dihapus atau jika tidak ada
            if (!isset($queryParams['tahun']) || (int)$queryParams['tahun'] === $yearInt) {
                $queryParams['tahun'] = $fallbackYear;
            }

            $newQuery = http_build_query($queryParams);
            $redirectUrl = $path . ($newQuery ? '?' . $newQuery : '');
            return redirect($redirectUrl)->with('success', "Opsi tahun {$yearInt} berhasil dihapus dari daftar pilihan.");
        }

        return redirect()->route('csms.dashboard', ['tahun' => $fallbackYear])
            ->with('success', "Opsi tahun {$yearInt} berhasil dihapus dari daftar pilihan.");
    }

    /**
     * [ADMIN ONLY] Download semua berkas dokumen dan data rekaman satu RIG dalam bentuk ZIP.
     * Struktur folder rapi per Kategori 21 CSMS + Rekapitulasi Data (CSV & HTML report).
     */
    public function downloadRigZip(\Illuminate\Http\Request $request, $rig_id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang memiliki hak akses untuk mengunduh arsip dokumen Rig.');
        }

        $rig = CsmsRig::findOrFail($rig_id);

        $year = $request->query('year');
        $month = $request->query('month');

        $query = CsmsRecord::with('category')->where('csms_rig_id', $rig->id);

        if ($year && $year !== 'all') {
            $query->where('periode_tahun', (int) $year);
        }
        if ($month && $month !== 'all') {
            $query->where('periode_bulan', $month);
        }

        $records = $query->orderBy('csms_document_category_id', 'asc')
                         ->orderBy('periode_tahun', 'desc')
                         ->orderBy('periode_bulan', 'asc')
                         ->get();

        // Nama folder & zip
        $cleanRigCode = preg_replace('/[^A-Za-z0-9_\-#]/', '_', $rig->code);
        $cleanRigName = preg_replace('/[^A-Za-z0-9_\-# ]/', '_', $rig->name);
        $periodLabel = ($year && $year !== 'all') ? (string)$year : 'Semua_Tahun';
        if ($month && $month !== 'all') {
            $periodLabel .= '_' . $month;
        }

        $folderPrefix = "CSMS_{$cleanRigCode}_{$periodLabel}";
        $zipFileName = "CSMS_{$cleanRigCode}_{$periodLabel}.zip";
        $tempZipPath = storage_path("app/temp_{$folderPrefix}_" . time() . ".zip");

        $zip = new \ZipArchive();
        if ($zip->open($tempZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            return response()->json(['message' => 'Gagal membuat arsip ZIP di server.'], 500);
        }

        // 1. Tambahkan seluruh berkas lampiran dokumen per folder kategori
        $fileCount = 0;
        $csvRows = [];
        $csvRows[] = ["No", "Kategori CSMS", "Scope", "Tahun", "Bulan", "Crew", "Nama Berkas", "Status Upload", "Status ACC / Verifikasi", "Catatan Verifikasi", "Diunggah Oleh", "Tanggal Upload"];

        $rowIdx = 1;
        foreach ($records as $rec) {
            $catNum = $rec->category ? str_pad($rec->category->nomor_kategori, 2, '0', STR_PAD_LEFT) : '00';
            $catName = $rec->category ? preg_replace('/[\\/\\\\:\*\?"<>\|]/', '_', $rec->category->nama_dokumen) : 'Lainnya';
            $categoryFolder = "{$folderPrefix}/{$catNum}. {$catName}";

            $attachments = [];
            if (!empty($rec->attachments) && is_array($rec->attachments)) {
                $attachments = $rec->attachments;
            } elseif ($rec->file_path) {
                $attachments[] = [
                    'name' => $rec->file_name ?: basename($rec->file_path),
                    'path' => $rec->file_path,
                    'size' => $rec->file_size,
                    'type' => $rec->file_type,
                    'uploaded_at' => $rec->created_at?->toDateTimeString(),
                ];
            }

            $crewLabel = $rec->crew ? "Crew_{$rec->crew}" : "Rig_Level";
            $monthLabel = $rec->periode_bulan ?: "Semua_Bulan";
            $yearLabel = $rec->periode_tahun ?: "";

            if (!empty($attachments)) {
                foreach ($attachments as $attIdx => $att) {
                    $relPath = $att['path'] ?? null;
                    $origName = $att['name'] ?? basename($relPath);
                    $cleanOrigName = preg_replace('/[\\/\\\\:\*\?"<>\|]/', '_', $origName);

                    if ($relPath && Storage::disk('public')->exists($relPath)) {
                        $fullDiskPath = Storage::disk('public')->path($relPath);
                        $zipEntryName = "{$categoryFolder}/[{$yearLabel}_{$monthLabel}_{$crewLabel}]_{$cleanOrigName}";

                        $zip->addFile($fullDiskPath, $zipEntryName);
                        $fileCount++;
                    }

                    $csvRows[] = [
                        $rowIdx++,
                        $rec->category?->nama_dokumen ?? '-',
                        $rec->category?->scope ?? 'rig',
                        $rec->periode_tahun,
                        $rec->periode_bulan,
                        $rec->crew ?: '1x/Bln/Rig',
                        $origName,
                        'Terunggah',
                        $rec->approval_status ?? 'pending',
                        $rec->approval_notes ?? '-',
                        $rec->uploaded_by ?? '-',
                        $rec->created_at?->format('Y-m-d H:i:s') ?? '-',
                    ];
                }
            } else {
                $csvRows[] = [
                    $rowIdx++,
                    $rec->category?->nama_dokumen ?? '-',
                    $rec->category?->scope ?? 'rig',
                    $rec->periode_tahun,
                    $rec->periode_bulan,
                    $rec->crew ?: '1x/Bln/Rig',
                    'Belum Diunggah',
                    'Kosong',
                    $rec->approval_status ?? 'pending',
                    $rec->approval_notes ?? '-',
                    '-',
                    '-',
                ];
            }
        }

        // 2. Buat File Rekapitulasi CSV (Excel-Compatible UTF-8 BOM)
        $csvContent = "\xEF\xBB\xBF"; // UTF-8 BOM
        foreach ($csvRows as $r) {
            $csvContent .= implode(';', array_map(function ($val) {
                return '"' . str_replace('"', '""', (string)$val) . '"';
            }, $r)) . "\r\n";
        }
        $zip->addFromString("{$folderPrefix}/00_REKAPITULASI_DOKUMEN_CSMS_{$cleanRigCode}.csv", $csvContent);

        // 3. Buat File Rekapitulasi HTML Interaktif Offline
        try {
            $htmlReport = view('reports.csms_rig_export', [
                'rig' => $rig,
                'year' => $year,
                'month' => $month,
                'records' => $records,
                'fileCount' => $fileCount,
                'generatedAt' => now()->format('d/m/Y H:i'),
            ])->render();
            $zip->addFromString("{$folderPrefix}/00_LAPORAN_REKAPITULASI_CSMS_{$cleanRigCode}.html", $htmlReport);
        } catch (\Throwable $e) {
            // fallback gracefully jika render template gagal
        }

        // 4. Buat File Petunjuk README.txt
        $readme = "=========================================================\r\n" .
                  "PAKET ARSIP DOKUMEN CSMS & HSE PER-RIG (PT BESMINDO MATERI SEWATAMA)\r\n" .
                  "=========================================================\r\n\r\n" .
                  "Unit Rig        : {$rig->name} ({$rig->code})\r\n" .
                  "Periode         : {$periodLabel}\r\n" .
                  "Total Berkas    : {$fileCount} Berkas Terlampir\r\n" .
                  "Tanggal Unduh   : " . now()->format('Y-m-d H:i:s') . "\r\n" .
                  "Diunduh Oleh    : " . (auth()->user()?->name ?? 'Admin HSE') . " (" . (auth()->user()?->email ?? 'admin') . ")\r\n\r\n" .
                  "STRUKTUR FOLDER:\r\n" .
                  "- Berkas tersusun rapi sesuai 21 Kategori Dokumen CSMS Resmi.\r\n" .
                  "- File 00_REKAPITULASI_DOKUMEN_CSMS_{$cleanRigCode}.csv dapat dibuka langsung di Microsoft Excel.\r\n" .
                  "- File 00_LAPORAN_REKAPITULASI_CSMS_{$cleanRigCode}.html dapat dibuka di peramban web (Google Chrome / Edge) untuk melihat rekapitulasi visual.\r\n\r\n" .
                  "PT Besmindo Materi Sewatama - Contractor Safety Management System (CSMS)\r\n";
        $zip->addFromString("{$folderPrefix}/README_PETUNJUK_ARSIP.txt", $readme);

        $zip->close();

        return response()->download($tempZipPath, $zipFileName, [
            'Content-Type' => 'application/zip',
        ])->deleteFileAfterSend(true);
    }
}


