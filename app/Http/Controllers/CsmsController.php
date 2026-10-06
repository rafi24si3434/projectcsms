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
        $tahun = (int) $request->query('tahun', 2025);
        $selectedRigId = $request->query('rig_id');

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
        $tahun = (int) $request->query('tahun', 2025);

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
        $tahun = (int) $request->query('tahun', 2025);
        $rigId = $request->query('rig_id');
        $approvalStatus = $request->query('status', 'all');

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
        $tahun = (int) $request->query('tahun', 2025);

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
}
