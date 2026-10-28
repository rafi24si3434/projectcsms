<?php

namespace App\Http\Controllers;

use App\Models\CsmsRig;
use App\Models\CsmsDocumentCategory;
use App\Models\DokumenMatriks;
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
                $scope = is_array($cat) ? ($cat['scope'] ?? 'crew') : ($cat->scope ?? 'crew');
                return $carry + ($scope === 'crew' ? 3 : 1);
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

        // Pastikan rig memiliki matriks dokumen jika belum ada (auto-seed fallback)
        $hasMatrix = DokumenMatriks::where('rig_id', $rig->id)->exists();
        if (!$hasMatrix) {
            $allCats = CsmsDocumentCategory::orderBy('no')->get();
            foreach ($allCats as $cat) {
                DokumenMatriks::create([
                    'rig_id'             => $rig->id,
                    'category_id'        => $cat->id,
                    'no'                 => $cat->no,
                    'nama_dokumen'       => $cat->nama_dokumen,
                    'durasi'             => $cat->durasi,
                    'scope'              => $cat->scope,
                    'keterangan_default' => $cat->keterangan_default,
                ]);
            }
        }

        // Ambil pemetaan seluruh rig yang memiliki masing-masing dokumen dalam 1 query cepat
        $allRigAssignments = DokumenMatriks::select('category_id', 'rig_id')
            ->get()
            ->groupBy('category_id')
            ->map(fn($g) => $g->pluck('rig_id')->toArray());

        $categories = DokumenMatriks::where('rig_id', $rig->id)
            ->orderBy('no')
            ->get()
            ->map(function ($dm) use ($allRigAssignments, $rig) {
                return [
                    'id'                 => $dm->category_id,
                    'matrix_id'          => $dm->id,
                    'no'                 => $dm->no,
                    'nama_dokumen'       => $dm->nama_dokumen,
                    'durasi'             => $dm->durasi,
                    'scope'              => $dm->scope,
                    'keterangan_default' => $dm->keterangan_default,
                    'assigned_rig_ids'   => $allRigAssignments->get($dm->category_id, [$rig->id]),
                ];
            });

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
     * [ADMIN & HSE] Halaman Ringkasan & Matriks Statistik Kepatuhan Seluruh RIG (Compliance Heatmap / Cross-Tab)
     */
    public function complianceOverview(Request $request): Response
    {
        $bulan = $request->query('bulan', 'Januari');
        $tahun = self::resolveActiveYear($request->query('tahun') ? (int)$request->query('tahun') : null);
        $availableYears = self::getAvailableYears();

        $rigs = CsmsRig::where('status', 'active')->orderBy('id')->get();
        $categories = CsmsDocumentCategory::orderBy('no')->get();

        // Ambil penugasan matriks per rig dari DokumenMatriks
        $matrixAssignments = DokumenMatriks::select('rig_id', 'category_id')->get();
        $assignedMap = [];
        foreach ($matrixAssignments as $asgn) {
            $assignedMap[$asgn->rig_id][$asgn->category_id] = true;
        }

        // Ambil semua records untuk periode ini dalam 1 query efisien tanpa N+1
        $records = CsmsRecord::whereIn('csms_rig_id', $rigs->pluck('id'))
            ->where('periode_bulan', $bulan)
            ->where('periode_tahun', $tahun)
            ->get();

        // Kelompokkan records berdasarkan [csms_rig_id][csms_document_category_id]
        $recordsGrouped = [];
        foreach ($records as $rec) {
            $recordsGrouped[$rec->csms_rig_id][$rec->csms_document_category_id][] = [
                'id'              => $rec->id,
                'csms_rig_id'     => $rec->csms_rig_id,
                'csms_document_category_id' => $rec->csms_document_category_id,
                'crew'            => $rec->crew ?: 'Rig',
                'status'          => $rec->status,
                'approval_status' => $rec->approval_status,
                'approval_notes'  => $rec->approval_notes,
                'file_name'       => $rec->file_name,
                'file_path'       => $rec->file_path,
                'file_size'       => $rec->file_size,
                'file_type'       => $rec->file_type,
                'attachments'     => $rec->attachments,
                'uploaded_by'     => $rec->uploaded_by,
                'updated_at'      => $rec->updated_at ? $rec->updated_at->format('d/m/Y H:i') : null,
            ];
        }

        $globalTotalRequired = 0;
        $globalTotalApproved = 0;
        $globalTotalUploaded = 0;
        $globalTotalPending  = 0;
        $globalTotalRevision = 0;

        $rigMatrixData = [];

        foreach ($rigs as $rig) {
            $rigId = $rig->id;
            $rigRequired = 0;
            $rigApproved = 0;
            $rigUploaded = 0;
            $rigPending  = 0;
            $rigRevision = 0;

            $cellData = [];

            foreach ($categories as $cat) {
                $catId = $cat->id;
                // Jika belum ada di tabel DokumenMatriks, anggap assigned sebagai fallback
                $isAssigned = empty($assignedMap) || !empty($assignedMap[$rigId][$catId]);
                $recs = $recordsGrouped[$rigId][$catId] ?? [];
                $isCrew = $cat->scope === 'crew';
                $requiredForCat = $isAssigned ? ($isCrew ? 3 : 1) : 0;

                $hasRevision = false;
                $hasPending  = false;
                $approvedCount = 0;
                $uploadedCount = 0;

                foreach ($recs as $r) {
                    $appStatus = strtolower($r['approval_status'] ?? '');
                    if (!empty($r['file_path']) || !empty($r['attachments'])) {
                        $uploadedCount++;
                    }
                    if (in_array($appStatus, ['revision', 'revisi', 'rejected', 'ditolak'])) {
                        $hasRevision = true;
                    } elseif ($appStatus === 'pending') {
                        $hasPending = true;
                    } elseif ($appStatus === 'approved') {
                        $approvedCount++;
                    }
                }

                if (!$isAssigned) {
                    $cellStatus = 'not_assigned';
                } elseif (empty($recs) || $uploadedCount === 0) {
                    $cellStatus = 'empty';
                } elseif ($hasRevision) {
                    $cellStatus = 'revision';
                } elseif ($hasPending) {
                    $cellStatus = 'pending';
                } elseif ($isCrew ? ($approvedCount >= 3) : ($approvedCount >= 1)) {
                    $cellStatus = 'approved';
                } elseif ($approvedCount > 0) {
                    $cellStatus = 'partial_approved';
                } elseif ($uploadedCount > 0) {
                    $cellStatus = 'pending';
                } else {
                    $cellStatus = 'empty';
                }

                $rigRequired += $requiredForCat;
                $rigApproved += $approvedCount;
                $rigUploaded += $uploadedCount;
                if ($hasPending) $rigPending++;
                if ($hasRevision) $rigRevision++;

                // Ambil uploader & waktu terbaru jika ada
                $latestRec = !empty($recs) ? $recs[count($recs) - 1] : null;

                $cellData[$catId] = [
                    'category_id'    => $catId,
                    'status'         => $cellStatus,
                    'is_assigned'    => $isAssigned,
                    'records'        => $recs,
                    'uploaded_count' => $uploadedCount,
                    'approved_count' => $approvedCount,
                    'required_count' => $requiredForCat,
                    'uploader'       => $latestRec['uploaded_by'] ?? null,
                    'date'           => $latestRec['updated_at'] ?? null,
                    'notes'          => $latestRec['approval_notes'] ?? null,
                    'scope'          => $cat->scope,
                ];
            }

            $percentage = $rigRequired > 0 ? round(($rigApproved / $rigRequired) * 100, 1) : 0;

            $globalTotalRequired += $rigRequired;
            $globalTotalApproved += $rigApproved;
            $globalTotalUploaded += $rigUploaded;
            $globalTotalPending  += $rigPending;
            $globalTotalRevision += $rigRevision;

            $rigMatrixData[] = [
                'rig'             => [
                    'id'   => $rig->id,
                    'name' => $rig->name,
                    'code' => $rig->code,
                ],
                'cells'           => $cellData,
                'stats'           => [
                    'required'    => $rigRequired,
                    'approved'    => $rigApproved,
                    'uploaded'    => $rigUploaded,
                    'pending'     => $rigPending,
                    'revision'    => $rigRevision,
                    'percentage'  => $percentage,
                ],
            ];
        }

        // Cari Top Performer & Needs Attention
        $sortedRigs = collect($rigMatrixData)->sortByDesc(fn($item) => $item['stats']['percentage'])->values();
        $topRig = $sortedRigs->first();
        $attentionRig = $sortedRigs->last();

        $globalPercentage = $globalTotalRequired > 0 
            ? round(($globalTotalApproved / $globalTotalRequired) * 100, 1) 
            : 0;

        $summaryStats = [
            'global_compliance_rate' => $globalPercentage,
            'total_approved'         => $globalTotalApproved,
            'total_required'         => $globalTotalRequired,
            'total_uploaded'         => $globalTotalUploaded,
            'total_pending'          => $globalTotalPending,
            'total_revision'         => $globalTotalRevision,
            'total_rigs'             => $rigs->count(),
            'top_rig'                => $topRig ? [
                'id'         => $topRig['rig']['id'],
                'name'       => $topRig['rig']['name'],
                'code'       => $topRig['rig']['code'],
                'percentage' => $topRig['stats']['percentage'],
                'approved'   => $topRig['stats']['approved'],
                'required'   => $topRig['stats']['required'],
            ] : null,
            'attention_rig'          => $attentionRig ? [
                'id'         => $attentionRig['rig']['id'],
                'name'       => $attentionRig['rig']['name'],
                'code'       => $attentionRig['rig']['code'],
                'percentage' => $attentionRig['stats']['percentage'],
                'approved'   => $attentionRig['stats']['approved'],
                'required'   => $attentionRig['stats']['required'],
                'pending'    => $attentionRig['stats']['pending'],
            ] : null,
        ];

        // Format kategori dengan nama pendek untuk header tabel
        $formattedCategories = $categories->map(function ($cat) {
            $short = preg_replace('/^(Bukti\s+Inspeksi\s+|Bukti\s+|Form\s+)/i', '', $cat->nama_dokumen);
            return [
                'id'           => $cat->id,
                'no'           => $cat->no,
                'nama_dokumen' => $cat->nama_dokumen,
                'short_name'   => trim($short),
                'durasi'       => $cat->durasi,
                'scope'        => $cat->scope,
            ];
        });

        // ── AGREGASI STATISTIK KEAKTIFAN PETUGAS HFO ──────────────────────────
        $hfoStats = self::buildHfoActivityStats($bulan, $tahun);

        return Inertia::render('Csms/ComplianceOverview', [
            'summaryStats'   => $summaryStats,
            'rigMatrix'      => $rigMatrixData,
            'categories'     => $formattedCategories,
            'availableYears' => $availableYears,
            'filter'         => [
                'bulan' => $bulan,
                'tahun' => $tahun,
            ],
            'hfoStats'       => $hfoStats,
            'activeTab'      => $request->query('tab', 'matrix'),
        ]);
    }

    /**
     * Hitung statistik dan agregasi keaktifan personil HFO pengunggah berkas K3.
     */
    public static function buildHfoActivityStats(?string $bulan = null, ?int $tahun = null): array
    {
        $activeRigs = CsmsRig::where('status', 'active')->orderBy('id')->get();

        // 1. Kumpulkan seluruh master HFO dari rig aktif
        $hfoMaster = [];
        foreach ($activeRigs as $rig) {
            $officers = array_filter([$rig->hfo_1, $rig->hfo_2, $rig->hfo_3]);
            foreach ($officers as $officer) {
                $name = trim($officer);
                if (!empty($name)) {
                    $hfoMaster[$name] = [
                        'name'     => $name,
                        'rig_id'   => $rig->id,
                        'rig_code' => $rig->code,
                        'rig_name' => $rig->name,
                    ];
                }
            }
        }

        // 2. Query data csms_records yang memiliki uploaded_by
        $records = CsmsRecord::with(['category', 'rig'])
            ->whereNotNull('uploaded_by')
            ->orderBy('updated_at', 'desc')
            ->get();

        $hfoAgg = [];
        foreach ($hfoMaster as $name => $meta) {
            $hfoAgg[$name] = [
                'name'               => $name,
                'rig_id'             => $meta['rig_id'],
                'rig_code'           => $meta['rig_code'],
                'rig_name'           => $meta['rig_name'],
                'total_uploaded'     => 0,
                'period_uploaded'    => 0,
                'approved_count'     => 0,
                'revision_count'     => 0,
                'rejected_count'     => 0,
                'pending_count'      => 0,
                'last_activity_date' => null,
                'last_activity_raw'  => null,
                'last_activity_doc'  => null,
                'activity_status'    => 'Belum Aktif',
            ];
        }

        $monthsIndo = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr', 5 => 'Mei', 6 => 'Jun',
            7 => 'Jul', 8 => 'Agu', 9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des'
        ];

        foreach ($records as $r) {
            $uploader = trim($r->uploaded_by);
            if (empty($uploader)) continue;

            if (!isset($hfoAgg[$uploader])) {
                $hfoAgg[$uploader] = [
                    'name'               => $uploader,
                    'rig_id'             => $r->csms_rig_id,
                    'rig_code'           => $r->rig ? $r->rig->code : 'RIG',
                    'rig_name'           => $r->rig ? $r->rig->name : 'Unit Rig',
                    'total_uploaded'     => 0,
                    'period_uploaded'    => 0,
                    'approved_count'     => 0,
                    'revision_count'     => 0,
                    'rejected_count'     => 0,
                    'pending_count'      => 0,
                    'last_activity_date' => null,
                    'last_activity_raw'  => null,
                    'last_activity_doc'  => null,
                    'activity_status'    => 'Belum Aktif',
                ];
            }

            $hfoAgg[$uploader]['total_uploaded']++;
            
            if ($bulan && $tahun && $r->periode_bulan === $bulan && (int)$r->periode_tahun === (int)$tahun) {
                $hfoAgg[$uploader]['period_uploaded']++;
            }

            $appStatus = strtolower($r->approval_status ?? 'pending');
            if (in_array($appStatus, ['approved', 'acc', 'sah'])) {
                $hfoAgg[$uploader]['approved_count']++;
            } elseif (in_array($appStatus, ['revision', 'revisi'])) {
                $hfoAgg[$uploader]['revision_count']++;
            } elseif (in_array($appStatus, ['rejected', 'ditolak'])) {
                $hfoAgg[$uploader]['rejected_count']++;
            } else {
                $hfoAgg[$uploader]['pending_count']++;
            }

            if (!$hfoAgg[$uploader]['last_activity_raw'] && $r->updated_at) {
                $hfoAgg[$uploader]['last_activity_raw'] = $r->updated_at->toISOString();
                $m = (int)$r->updated_at->format('n');
                $hfoAgg[$uploader]['last_activity_date'] = $r->updated_at->format('d') . ' ' . ($monthsIndo[$m] ?? '') . ' ' . $r->updated_at->format('Y, H:i');
                $hfoAgg[$uploader]['last_activity_doc'] = $r->category ? $r->category->nama_dokumen : $r->file_name;
            }
        }

        // Tentukan status keaktifan
        $sangatAktifCount = 0;
        $cukupAktifCount = 0;
        $belumAktifCount = 0;
        $totalUploads = 0;

        foreach ($hfoAgg as &$item) {
            $totalUploads += $item['total_uploaded'];
            if ($item['total_uploaded'] >= 5) {
                $item['activity_status'] = 'Sangat Aktif';
                $sangatAktifCount++;
            } elseif ($item['total_uploaded'] >= 1) {
                $item['activity_status'] = 'Cukup Aktif';
                $cukupAktifCount++;
            } else {
                $item['activity_status'] = 'Belum Aktif';
                $belumAktifCount++;
            }
        }
        unset($item);

        // Sorting
        $sortedDesc = collect($hfoAgg)->sortByDesc('total_uploaded')->values();

        // 3. Top 5 Aktif
        $top5 = $sortedDesc->filter(fn($x) => $x['total_uploaded'] > 0)->take(5)->map(function ($item, $idx) {
            $item['rank'] = $idx + 1;
            return $item;
        })->values()->all();

        // 4. Low Activity (unggah 0 atau terendah)
        $lowActivity = $sortedDesc->filter(fn($x) => $x['total_uploaded'] === 0)->take(5)->values()->all();
        if (count($lowActivity) < 5) {
            $lowActivity = collect($hfoAgg)->sortBy('total_uploaded')->take(5)->values()->all();
        }

        $fullList = $sortedDesc->all();

        return [
            'top_active'     => $top5,
            'low_activity'   => $lowActivity,
            'full_list'      => $fullList,
            'total_hfos'     => count($hfoAgg),
            'active_count'   => $sangatAktifCount,
            'moderate_count' => $cukupAktifCount,
            'inactive_count' => $belumAktifCount,
            'total_uploads'  => $totalUploads,
        ];
    }
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
            if ($approvalStatus === 'ditolak' || $approvalStatus === 'rejected') {
                $query->whereIn('approval_status', ['ditolak', 'rejected']);
            } elseif ($approvalStatus === 'revision' || $approvalStatus === 'revisi') {
                $query->whereIn('approval_status', ['revision', 'revisi']);
            } else {
                $query->where('approval_status', $approvalStatus);
            }
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
            'revision' => $allPeriodRecords->whereIn('approval_status', ['revision', 'revisi'])->count(),
            'rejected' => $allPeriodRecords->whereIn('approval_status', ['rejected', 'ditolak'])->count(),
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
            'approval_status' => 'required|in:approved,revision,rejected,ditolak,revisi,pending',
            'approval_notes' => 'nullable|string|max:1000',
        ]);

        $record = CsmsRecord::findOrFail($id);
        $record->approval_status = $request->approval_status;
        $record->approval_notes = $request->approval_notes;
        $record->approved_by = auth()->user()->name ?? 'Admin HSE';
        $record->approved_at = now();

        if ($request->approval_status === 'approved') {
            $record->status = 'Lengkap';
        } elseif (in_array($request->approval_status, ['revision', 'revisi', 'rejected', 'ditolak'])) {
            $record->status = 'Pending';
        }

        $record->save();

        if ($request->approval_status === 'approved') {
            $pesan = 'Dokumen CSMS berhasil di-ACC (Disetujui)!';
        } elseif (in_array($request->approval_status, ['rejected', 'ditolak'])) {
            $pesan = 'Dokumen CSMS ditolak (Instruksi penolakan telah disimpan).';
        } else {
            $pesan = 'Status dokumen diperbarui (Catatan revisi telah disimpan).';
        }

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
            'approval_status' => 'required|in:approved,revision,rejected,ditolak,revisi',
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

        // Pastikan rig memiliki matriks dokumen jika belum ada (auto-seed fallback)
        $hasMatrix = DokumenMatriks::where('rig_id', $rig->id)->exists();
        if (!$hasMatrix) {
            $allCats = CsmsDocumentCategory::orderBy('no')->get();
            foreach ($allCats as $cat) {
                DokumenMatriks::create([
                    'rig_id'             => $rig->id,
                    'category_id'        => $cat->id,
                    'no'                 => $cat->no,
                    'nama_dokumen'       => $cat->nama_dokumen,
                    'durasi'             => $cat->durasi,
                    'scope'              => $cat->scope,
                    'keterangan_default' => $cat->keterangan_default,
                ]);
            }
        }

        // Ambil pemetaan seluruh rig yang memiliki masing-masing dokumen dalam 1 query cepat
        $allRigAssignments = DokumenMatriks::select('category_id', 'rig_id')
            ->get()
            ->groupBy('category_id')
            ->map(fn($g) => $g->pluck('rig_id')->toArray());

        $categories = DokumenMatriks::where('rig_id', $rig->id)
            ->orderBy('no')
            ->get()
            ->map(function ($dm) use ($allRigAssignments, $rig) {
                return [
                    'id'                 => $dm->category_id,
                    'matrix_id'          => $dm->id,
                    'no'                 => $dm->no,
                    'nama_dokumen'       => $dm->nama_dokumen,
                    'durasi'             => $dm->durasi,
                    'scope'              => $dm->scope,
                    'keterangan_default' => $dm->keterangan_default,
                    'assigned_rig_ids'   => $allRigAssignments->get($dm->category_id, [$rig->id]),
                ];
            });

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
            $scope = is_array($cat) ? ($cat['scope'] ?? 'crew') : ($cat->scope ?? 'crew');
            return $carry + ($scope === 'crew' ? 3 : 1);
        }, 0);
        $totalUploaded = $records->whereNotNull('file_path')->count();
        $approvedCount = $records->where('approval_status', 'approved')->count();
        $revisionCount = $records->whereIn('approval_status', ['revision', 'revisi'])->count();
        $rejectedCount = $records->whereIn('approval_status', ['rejected', 'ditolak'])->count();
        $pendingCount = $records->where('approval_status', 'pending')->count();

        $rigSummary = [
            'total_required' => $totalRequired,
            'total_uploaded' => $totalUploaded,
            'approved_count' => $approvedCount,
            'revision_count' => $revisionCount,
            'rejected_count' => $rejectedCount,
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
            'file' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120', // max 5MB (5120 KB)
            'files' => 'nullable|array',
            'files.*' => 'nullable|file|mimes:pdf,jpg,jpeg,png,doc,docx|max:5120', // max 5MB per berkas
        ], [
            'file.max' => 'Ukuran file dokumen tidak boleh melebihi 5 MB.',
            'files.*.max' => 'Ukuran file dokumen tidak boleh melebihi 5 MB.',
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

        // Catat nama personil HFO aktif dari sesi login kru ke audit trail
        $hfoName = session('logged_hfo_name') ?: (session('hfo_name') ?: ($user->hfo_name ?? null));
        if (!$hfoName) {
            $hfoName = ($user && $user->role === 'user') ? ($user->name ?? 'Kru Lapangan') : ($user->name ?? 'Kru Lapangan');
        }
        $record->uploaded_by = $hfoName;
        
        // Saat diunggah ulang / baru, set approval_status menjadi 'pending' agar Admin memeriksa kembali
        $record->approval_status = 'pending';
        $record->save();

        $count = count($uploadedAttachments);
        $pesan = $count > 1 
            ? "{$count} berkas dokumen CSMS (Maks 5 MB) berhasil diunggah!"
            : "Dokumen CSMS (Maks 5 MB) berhasil diunggah!";

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
     * Mendukung opsi simpan spesifik per-rig atau multi-rig.
     */
    public function storeCategory(Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menambah kategori dokumen.');
        }

        $request->validate([
            'nama_dokumen'       => 'required|string|max:255',
            'durasi'             => 'required|string|max:100',
            'scope'              => 'required|in:crew,rig',
            'keterangan_default' => 'nullable|string|max:500',
            'rig_ids'            => 'nullable|array',
            'apply_mode'         => 'nullable|string|in:current,selected,all',
            'current_rig_id'     => 'nullable|integer',
        ], [
            'nama_dokumen.required' => 'Nama dokumen wajib diisi.',
            'durasi.required'       => 'Durasi wajib diisi.',
            'scope.required'        => 'Scope wajib dipilih.',
        ]);

        $applyMode = $request->input('apply_mode', 'selected');
        $currentRigId = $request->input('current_rig_id') ?: $request->input('rig_id');
        $selectedRigIds = $request->input('rig_ids', []);

        if ($applyMode === 'current' && $currentRigId) {
            $targetRigIds = [(int)$currentRigId];
        } elseif ($applyMode === 'all') {
            $targetRigIds = CsmsRig::where('status', 'active')->pluck('id')->toArray();
        } else {
            $targetRigIds = !empty($selectedRigIds) 
                ? array_map('intval', (array)$selectedRigIds) 
                : ($currentRigId ? [(int)$currentRigId] : CsmsRig::where('status', 'active')->pluck('id')->toArray());
        }

        if (empty($targetRigIds)) {
            $targetRigIds = CsmsRig::where('status', 'active')->pluck('id')->toArray();
        }

        // Tentukan nomor urut berikutnya
        $maxNo = CsmsDocumentCategory::max('no') ?? 0;

        $category = CsmsDocumentCategory::create([
            'dept'               => 'Dokumen dan Rekaman HSE',
            'no'                 => $maxNo + 1,
            'nama_dokumen'       => trim($request->nama_dokumen),
            'durasi'             => trim($request->durasi),
            'scope'              => $request->scope,
            'keterangan_default' => $request->keterangan_default,
        ]);

        // Terapkan ke DokumenMatriks setiap rig yang dipilih
        foreach ($targetRigIds as $rigId) {
            $rigMaxNo = DokumenMatriks::where('rig_id', $rigId)->max('no') ?? 0;
            DokumenMatriks::updateOrCreate(
                [
                    'rig_id'      => $rigId,
                    'category_id' => $category->id,
                ],
                [
                    'no'                 => $rigMaxNo + 1,
                    'nama_dokumen'       => $category->nama_dokumen,
                    'durasi'             => $category->durasi,
                    'scope'              => $category->scope,
                    'keterangan_default' => $category->keterangan_default,
                ]
            );
        }

        $rigNames = CsmsRig::whereIn('id', $targetRigIds)->pluck('code')->implode(', ');
        return redirect()->back()->with('success', "Dokumen \"{$category->nama_dokumen}\" berhasil ditambahkan untuk: {$rigNames}.");
    }

    /**
     * [ADMIN ONLY] Ubah (edit/rename) kategori dokumen CSMS.
     * Mendukung opsi edit hanya rig aktif atau sinkronisasi multi-rig.
     */
    public function updateCategory(Request $request, $id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mengubah kategori dokumen.');
        }

        $request->validate([
            'nama_dokumen'       => 'required|string|max:255',
            'durasi'             => 'nullable|string|max:100',
            'scope'              => 'nullable|in:crew,rig',
            'keterangan_default' => 'nullable|string|max:500',
            'sync_mode'          => 'nullable|string|in:current,selected,all',
            'current_rig_id'     => 'nullable|integer',
            'rig_ids'            => 'nullable|array',
        ], [
            'nama_dokumen.required' => 'Nama dokumen tidak boleh kosong.',
        ]);

        $category = CsmsDocumentCategory::find($id);
        $catId = $category ? $category->id : $id;
        $oldName = $category ? $category->nama_dokumen : 'Dokumen';

        $syncMode = $request->input('sync_mode', 'current');
        $currentRigId = $request->input('current_rig_id') ?: $request->input('rig_id');
        $selectedRigIds = $request->input('rig_ids', []);

        if ($syncMode === 'current' && $currentRigId) {
            $targetRigIds = [(int)$currentRigId];
        } elseif ($syncMode === 'all') {
            $targetRigIds = DokumenMatriks::where('category_id', $catId)->pluck('rig_id')->toArray();
        } else {
            $targetRigIds = !empty($selectedRigIds) 
                ? array_map('intval', (array)$selectedRigIds) 
                : ($currentRigId ? [(int)$currentRigId] : []);
        }

        if (empty($targetRigIds)) {
            $targetRigIds = DokumenMatriks::where('category_id', $catId)->pluck('rig_id')->toArray();
        }

        $updateData = ['nama_dokumen' => trim($request->nama_dokumen)];
        if ($request->filled('durasi')) {
            $updateData['durasi'] = trim($request->durasi);
        }
        if ($request->filled('scope')) {
            $updateData['scope'] = $request->scope;
        }
        if ($request->has('keterangan_default')) {
            $updateData['keterangan_default'] = $request->keterangan_default;
        }

        // Update DokumenMatriks untuk rig yang dipilih
        DokumenMatriks::whereIn('rig_id', $targetRigIds)
            ->where(function ($q) use ($catId) {
                $q->where('category_id', $catId)
                  ->orWhere('id', $catId);
            })
            ->update($updateData);

        // Jika update global / sync all, update juga master
        if ($syncMode === 'all' && $category) {
            $category->update($updateData);
        }

        $rigNames = CsmsRig::whereIn('id', $targetRigIds)->pluck('code')->implode(', ');
        return redirect()->back()->with('success', "Dokumen \"{$oldName}\" berhasil diperbarui pada: {$rigNames}.");
    }

    /**
     * [ADMIN ONLY] Hapus kategori dokumen CSMS beserta berkas fisiknya.
     * Mendukung opsi hapus tunggal untuk RIG ini saja atau multi-RIG.
     */
    public function destroyCategory(Request $request, $id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menghapus kategori dokumen.');
        }

        $deleteMode     = $request->input('delete_mode', 'current');
        $currentRigId   = $request->input('rig_id');
        $selectedRigIds = $request->input('rig_ids', []);

        if ($deleteMode === 'current' && $currentRigId) {
            $rigIds = [(int)$currentRigId];
        } elseif ($deleteMode === 'all') {
            $rigIds = CsmsRig::pluck('id')->toArray();
        } else {
            $rigIds = !empty($selectedRigIds) 
                ? array_map('intval', (array)$selectedRigIds) 
                : ($currentRigId ? [(int)$currentRigId] : []);
        }

        if (empty($rigIds)) {
            return redirect()->back()->with('error', 'Tidak ada unit Rig yang dipilih untuk penghapusan dokumen.');
        }

        $category = CsmsDocumentCategory::find($id);
        $catId = $category ? $category->id : $id;
        $catName = $category ? $category->nama_dokumen : 'Dokumen';

        // 1. Hapus dari DokumenMatriks HANYA untuk rig yang dipilih!
        DokumenMatriks::whereIn('rig_id', $rigIds)
            ->where(function ($q) use ($catId) {
                $q->where('category_id', $catId)
                  ->orWhere('id', $catId);
            })
            ->delete();

        // 2. Hapus berkas rekaman K3 fisik dan data di csms_records HANYA untuk rig yang dipilih!
        $records = CsmsRecord::whereIn('csms_rig_id', $rigIds)
            ->where('csms_document_category_id', $catId)
            ->get();

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
            $record->delete();
        }

        // Cek apakah dokumen ini masih ada di rig lain
        $remainingInRigs = DokumenMatriks::where('category_id', $catId)->count();
        if ($remainingInRigs === 0 && $category) {
            $category->delete();
        }

        $rigNames = CsmsRig::whereIn('id', $rigIds)->pluck('code')->implode(', ');
        return redirect()->back()->with('success', "Dokumen \"{$catName}\" berhasil dihapus dari: {$rigNames}.");
    }

    /**
     * [ADMIN ONLY] Tambah unit RIG baru beserta personil HFO.
     */
    public function storeRig(\Illuminate\Http\Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat menambahkan unit RIG baru.');
        }

        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:csms_rigs,name',
            'code'   => 'required|string|max:50|unique:csms_rigs,code',
            'status' => 'nullable|string|in:active,inactive,archived',
            'hfo_1'  => 'nullable|string|max:255',
            'hfo_2'  => 'nullable|string|max:255',
            'hfo_3'  => 'nullable|string|max:255',
        ], [
            'name.required' => 'Nama RIG wajib diisi.',
            'name.unique'   => 'Nama RIG sudah terdaftar.',
            'code.required' => 'Kode RIG wajib diisi.',
            'code.unique'   => 'Kode RIG sudah terdaftar.',
        ]);

        $rig = CsmsRig::create([
            'name'   => trim($validated['name']),
            'code'   => strtoupper(trim($validated['code'])),
            'status' => $validated['status'] ?? 'active',
            'hfo_1'  => !empty($validated['hfo_1']) ? trim($validated['hfo_1']) : null,
            'hfo_2'  => !empty($validated['hfo_2']) ? trim($validated['hfo_2']) : null,
            'hfo_3'  => !empty($validated['hfo_3']) ? trim($validated['hfo_3']) : null,
        ]);

        // Buat akun kru default untuk RIG baru jika belum ada
        $cleanCode = strtolower(str_replace([' ', '-'], '', $rig->code));
        $bmsNum = substr($cleanCode, 3) ?: '00';
        $rigPassword = str_repeat($bmsNum, 4) ?: '12345678';
        $email = "{$cleanCode}@besmindo.com";

        \App\Models\User::firstOrCreate(
            ['email' => $email],
            [
                'name'           => "Crew {$rig->name}",
                'role'           => 'user',
                'status'         => 'Active',
                'csms_rig_id'    => $rig->id,
                'password'       => \Illuminate\Support\Facades\Hash::make($rigPassword),
                'plain_password' => $rigPassword,
            ]
        );

        return redirect()->back()->with('success', "Unit RIG \"{$rig->name}\" ({$rig->code}) dan 3 personil HFO berhasil didaftarkan.");
    }

    /**
     * [ADMIN ONLY] Ubah data unit RIG & Personil HFO.
     */
    public function updateRig(\Illuminate\Http\Request $request, $id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mengubah data unit RIG.');
        }

        $rig = CsmsRig::findOrFail($id);

        $validated = $request->validate([
            'name'   => 'required|string|max:100|unique:csms_rigs,name,' . $rig->id,
            'code'   => 'required|string|max:50|unique:csms_rigs,code,' . $rig->id,
            'status' => 'nullable|string|in:active,inactive,archived',
            'hfo_1'  => 'nullable|string|max:255',
            'hfo_2'  => 'nullable|string|max:255',
            'hfo_3'  => 'nullable|string|max:255',
        ]);

        $rig->update([
            'name'   => trim($validated['name']),
            'code'   => strtoupper(trim($validated['code'])),
            'status' => $validated['status'] ?? $rig->status,
            'hfo_1'  => !empty($validated['hfo_1']) ? trim($validated['hfo_1']) : null,
            'hfo_2'  => !empty($validated['hfo_2']) ? trim($validated['hfo_2']) : null,
            'hfo_3'  => !empty($validated['hfo_3']) ? trim($validated['hfo_3']) : null,
        ]);

        // Perbarui juga nama display user kru jika ada
        $user = \App\Models\User::where('csms_rig_id', $rig->id)->first();
        if ($user) {
            $user->update([
                'name' => "Crew {$rig->name}",
            ]);
        }

        return redirect()->back()->with('success', "Data unit RIG \"{$rig->name}\" dan data personil HFO berhasil diperbarui.");
    }

    /**
     * [ADMIN ONLY] Arsipkan unit RIG (Berkas dokumen K3 tetap utuh & aman tersimpan).
     */
    public function archiveRig($id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mengarsipkan unit RIG.');
        }

        $rig = CsmsRig::findOrFail($id);
        $rig->update(['status' => 'archived']);

        // Nonaktifkan user kru terkait agar tidak dapat login
        \App\Models\User::where('csms_rig_id', $rig->id)->update(['status' => 'Inactive']);

        return redirect()->back()->with('success', "Unit RIG \"{$rig->name}\" ({$rig->code}) berhasil diarsipkan. Seluruh riwayat dan berkas dokumen K3 tetap tersimpan utuh di sistem.");
    }

    /**
     * [ADMIN ONLY] Pulihkan unit RIG dari arsip ke status aktif.
     */
    public function unarchiveRig($id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat memulihkan unit RIG.');
        }

        $rig = CsmsRig::findOrFail($id);
        $rig->update(['status' => 'active']);

        // Aktifkan kembali user kru terkait
        \App\Models\User::where('csms_rig_id', $rig->id)->update(['status' => 'Active']);

        return redirect()->back()->with('success', "Unit RIG \"{$rig->name}\" ({$rig->code}) berhasil dipulihkan ke daftar aktif operasional.");
    }

    /**
     * [ADMIN ONLY] Halaman Pusat Arsip Unit RIG.
     */
    public function archivedRigs(\Illuminate\Http\Request $request)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Akses terbatas untuk Admin.');
        }

        $archivedRigs = CsmsRig::where('status', 'archived')
            ->withCount('records')
            ->orderBy('id')
            ->get();

        $totalArchivedRecords = CsmsRecord::whereIn('csms_rig_id', $archivedRigs->pluck('id'))->count();

        return \Inertia\Inertia::render('Admin/ArchivedRigs', [
            'archivedRigs'         => $archivedRigs,
            'totalArchivedRecords' => $totalArchivedRecords,
        ]);
    }

    /**
     * [ADMIN ONLY] Hapus unit RIG dialihkan menjadi Arsipkan sesuai kebijakan K3 perusahaan.
     */
    public function destroyRig($id)
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Hanya Admin yang dapat mengelola unit RIG.');
        }

        return $this->archiveRig($id);
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


