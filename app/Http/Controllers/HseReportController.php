<?php

namespace App\Http\Controllers;

use App\Models\HseLaggingIndicator;
use App\Models\HseLeadingIndicator;
use App\Models\HseManHour;
use App\Models\HseReport;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class HseReportController extends Controller
{
    /**
     * Menyiapkan data reports dan filters dari database.
     */
    private function getReportData(Request $request): array
    {
        $query = HseReport::with([
            'manHours',
            'laggingIndicators',
            'leadingIndicators',
        ]);

        if ($request->filled('year')) {
            $query->where('year', $request->year);
        }

        if ($request->filled('period') && $request->period !== 'all') {
            $query->where('period', $request->period);
        }

        if ($request->filled('rig_no') && $request->rig_no !== 'all') {
            $query->where('rig_no', $request->rig_no);
        }

        // Focus Corp / Project pada form = contract_no di database.
        if ($request->filled('contract_no') && $request->contract_no !== 'all') {
            $query->where('contract_no', $request->contract_no);
        }

        if ($request->filled('location_district') && $request->location_district !== 'all') {
            $query->where('location_district', $request->location_district);
        }

        if ($request->filled('report_date') && $request->report_date !== 'all') {
            $query->whereDate('report_date', $request->report_date);
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $reports = $query
            ->orderByDesc('report_date')
            ->orderByDesc('id')
            ->get();

        // Tambahkan quarter_data agar bisa dipakai bila diperlukan oleh React.
        $reports->transform(function ($report) {
            $quarterData = [
                'Q1' => [],
                'Q2' => [],
                'Q3' => [],
                'Q4' => [],
            ];

            foreach ($report->laggingIndicators as $indicator) {
                $month = (int) ($indicator->month ?? 0);

                if ($month >= 1 && $month <= 3) {
                    $quarter = 'Q1';
                } elseif ($month >= 4 && $month <= 6) {
                    $quarter = 'Q2';
                } elseif ($month >= 7 && $month <= 9) {
                    $quarter = 'Q3';
                } elseif ($month >= 10 && $month <= 12) {
                    $quarter = 'Q4';
                } else {
                    continue;
                }

                $quarterData[$quarter][] = [
                    'id' => $indicator->id,
                    'indicator_no' => $indicator->indicator_no,
                    'indicator_name' => $indicator->indicator_name,
                    'definition' => $indicator->definition,
                    'unit' => $indicator->unit,
                    'plan' => (float) ($indicator->plan ?? 0),
                    'actual' => (float) ($indicator->actual ?? 0),
                    'frequency_rate' => $indicator->frequency_rate !== null
                        ? (float) $indicator->frequency_rate
                        : null,
                    'month' => $indicator->month,
                    'year' => $indicator->year,
                    'notes' => $indicator->notes,
                ];
            }

            $report->quarter_data = $quarterData;

            return $report;
        });

        $years = HseReport::query()
            ->whereNotNull('year')
            ->where('year', '!=', '')
            ->distinct()
            ->orderByDesc('year')
            ->pluck('year')
            ->values();

        $periods = HseReport::query()
            ->whereNotNull('period')
            ->where('period', '!=', '')
            ->distinct()
            ->orderBy('period')
            ->pluck('period')
            ->values();

        $rigs = HseReport::query()
            ->whereNotNull('rig_no')
            ->where('rig_no', '!=', '')
            ->distinct()
            ->orderBy('rig_no')
            ->pluck('rig_no')
            ->values();

        $focusCorps = HseReport::query()
            ->whereNotNull('contract_no')
            ->where('contract_no', '!=', '')
            ->distinct()
            ->orderBy('contract_no')
            ->pluck('contract_no')
            ->values();

        $locations = HseReport::query()
            ->whereNotNull('location_district')
            ->where('location_district', '!=', '')
            ->distinct()
            ->orderBy('location_district')
            ->pluck('location_district')
            ->values();

        $statuses = HseReport::query()
            ->whereNotNull('status')
            ->where('status', '!=', '')
            ->distinct()
            ->orderBy('status')
            ->pluck('status')
            ->values();

        $reportDates = HseReport::query()
            ->whereNotNull('report_date')
            ->select('report_date')
            ->distinct()
            ->orderByDesc('report_date')
            ->pluck('report_date')
            ->map(fn ($date) => \Carbon\Carbon::parse($date)->format('Y-m-d'))
            ->values();

        return [
            'reports' => $reports,
            'filters' => [
                'years' => $years,
                'periods' => $periods,
                'rigs' => $rigs,
                'focusCorps' => $focusCorps,
                'locations' => $locations,
                'statuses' => $statuses,
                'reportDates' => $reportDates,
            ],
            'selected' => [
                'year' => $request->year,
                'period' => $request->period,
                'rig_no' => $request->rig_no,
                'contract_no' => $request->contract_no,
                'location_district' => $request->location_district,
                'report_date' => $request->report_date,
                'status' => $request->status,
            ],
        ];
    }

    /**
     * Menampilkan halaman Admin Dashboard dengan live data.
     */
    public function dashboard(Request $request)
    {
        return Inertia::render('Admin/AdminDashboard', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman Reports utama.
     */
    public function index(Request $request)
    {
        return Inertia::render('Admin/Reports', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman Plan Report.
     */
    public function plan(Request $request)
    {
        return Inertia::render('Admin/PlanReport', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman Actual Report.
     */
    public function actual(Request $request)
    {
        return Inertia::render('Admin/ActualReport', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman KPI Per Rig.
     */
    public function kpiPerRig(Request $request)
    {
        return Inertia::render('Admin/KPIPerRig', $this->getReportData($request));
    }

    /**
     * Menampilkan halaman HSE Performance.
     */
    public function performance(Request $request)
    {
        return Inertia::render('Admin/HSEPerformance', $this->getReportData($request));
    }

    /**
     * Menyimpan report utama sekaligus data Man Hours, Lagging, dan Leading.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'date' => ['required', 'date'],
            'contractNo' => ['required', 'string', 'max:100'],
            'rigNo' => ['required', 'string', 'max:100'],
            'workPeriod' => ['nullable', 'string', 'max:100'],
            'period' => ['required', 'string', 'max:10'],
            'focusProject' => ['nullable', 'string', 'max:150'],
            'locationDistrict' => ['required', 'string', 'max:150'],
            'issuedDate' => ['nullable', 'date'],
            'revisionNo' => ['nullable', 'string', 'max:50'],
            'programReference' => ['nullable', 'string'],
            'submitterRole' => ['nullable', 'string'],
            'submitterName' => ['nullable', 'string', 'max:255'],
            'submitterEmail' => ['nullable', 'string', 'max:255'],

            'manHoursPremisesPlan' => ['required', 'numeric', 'min:0'],
            'manHoursNonPremisesPlan' => ['required', 'numeric', 'min:0'],
            'manHoursPremisesActual' => ['required', 'numeric', 'min:0'],
            'manHoursNonPremisesActual' => ['required', 'numeric', 'min:0'],

            'totalEmployees' => ['required', 'numeric', 'min:0'],
            'totalVehicles' => ['required', 'numeric', 'min:0'],

            'kilometerPremisesPlan' => ['required', 'numeric', 'min:0'],
            'kilometerNonPremisesPlan' => ['required', 'numeric', 'min:0'],
            'kilometerPremisesActual' => ['required', 'numeric', 'min:0'],
            'kilometerNonPremisesActual' => ['required', 'numeric', 'min:0'],

            'lagging' => ['nullable', 'array'],
            'lagging.*.indicator_name' => ['required', 'string', 'max:255'],
            'lagging.*.indicator_no' => ['nullable', 'integer'],
            'lagging.*.definition' => ['nullable', 'string'],
            'lagging.*.unit' => ['nullable', 'string', 'max:100'],
            'lagging.*.plan' => ['required', 'numeric', 'min:0'],
            'lagging.*.actual' => ['required', 'numeric', 'min:0'],
            'lagging.*.frequency_rate' => ['nullable', 'numeric', 'min:0'],
            'lagging.*.notes' => ['nullable', 'string'],

            'leading' => ['nullable', 'array'],
            'leading.*.indicator_name' => ['required', 'string', 'max:255'],
            'leading.*.indicator_no' => ['nullable', 'integer'],
            'leading.*.definition' => ['nullable', 'string'],
            'leading.*.unit' => ['nullable', 'string', 'max:100'],
            'leading.*.target_month' => ['nullable', 'numeric', 'min:0'],
            'leading.*.target_year' => ['nullable', 'numeric', 'min:0'],
            'leading.*.plan' => ['required', 'numeric', 'min:0'],
            'leading.*.actual' => ['required', 'numeric', 'min:0'],
            'leading.*.notes' => ['nullable', 'string'],

            'remarks' => ['nullable', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first() ?: 'Validasi data gagal. Silakan periksa kembali isian formulir.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validated = $validator->validated();

        try {
            $report = DB::transaction(function () use ($validated, $request) {
                $year = (int) date('Y', strtotime($validated['date']));
                $month = (int) date('n', strtotime($validated['date']));
                $approvalToken = \Illuminate\Support\Str::random(40);
                $submitterRole = $validated['submitterRole'] ?? ($request->is('admin/*') ? 'admin' : 'user');

                $report = HseReport::create([
                    'report_date' => $validated['date'],
                    'contract_no' => $validated['contractNo'],
                    'rig_no' => $validated['rigNo'],
                    'work_period' => $validated['workPeriod'] ?? null,
                    'year' => $year,
                    'period' => $validated['period'],
                    'focus_project' => $validated['focusProject'] ?? $validated['contractNo'],
                    'location_district' => $validated['locationDistrict'],
                    'issued_date' => $validated['issuedDate'] ?? $validated['date'],
                    'revision_no' => $validated['revisionNo'] ?? '00',
                    'program_reference' => $validated['programReference'] ?? null,
                    'status' => 'pending',
                    'approval_token' => $approvalToken,
                    'remarks' => $validated['remarks'],
                    'submitter_role' => $submitterRole,
                    'submitter_name' => $validated['submitterName'] ?? (auth()->user()?->name ?? 'User Lapangan'),
                    'submitter_email' => $validated['submitterEmail'] ?? (auth()->user()?->email ?? null),
                    'created_by' => auth()->id(),
                ]);

                /*
                |--------------------------------------------------------------------------
                | MAN HOURS
                |--------------------------------------------------------------------------
                */

                HseManHour::create([
                    'report_id' => $report->id,

                    'premises_plan' =>
                        $validated['manHoursPremisesPlan'] ?? 0,

                    'non_premises_plan' =>
                        $validated['manHoursNonPremisesPlan'] ?? 0,

                    'premises_actual' =>
                        $validated['manHoursPremisesActual'] ?? 0,

                    'non_premises_actual' =>
                        $validated['manHoursNonPremisesActual'] ?? 0,

                    'kilometer_premises_plan' =>
                        $validated['kilometerPremisesPlan'] ?? 0,

                    'kilometer_non_premises_plan' =>
                        $validated['kilometerNonPremisesPlan'] ?? 0,

                    'kilometer_premises_actual' =>
                        $validated['kilometerPremisesActual'] ?? 0,

                    'kilometer_non_premises_actual' =>
                        $validated['kilometerNonPremisesActual'] ?? 0,

                    'total_employees' =>
                        $validated['totalEmployees'] ?? 0,

                    'total_vehicles' =>
                        $validated['totalVehicles'] ?? 0,
                ]);

                /*
                |--------------------------------------------------------------------------
                | TOTAL MAN HOURS ACTUAL
                |--------------------------------------------------------------------------
                */

                $totalManHoursActual =
                    (float) ($validated['manHoursPremisesActual'] ?? 0)
                    +
                    (float) ($validated['manHoursNonPremisesActual'] ?? 0);

                /*
                |--------------------------------------------------------------------------
                | TOTAL KILOMETER ACTUAL
                |--------------------------------------------------------------------------
                */

                $totalKilometerActual =
                    (float) ($validated['kilometerPremisesActual'] ?? 0)
                    +
                    (float) ($validated['kilometerNonPremisesActual'] ?? 0);

                /*
                |--------------------------------------------------------------------------
                | LAGGING INDICATORS / HES PERFORMANCE
                |--------------------------------------------------------------------------
                */

                foreach ($validated['lagging'] ?? [] as $indicator) {

                    $indicatorNo = (int) ($indicator['indicator_no'] ?? 0);

                    $actual = (float) ($indicator['actual'] ?? 0);

                    /*
                    |--------------------------------------------------------------------------
                    | TAMBAHAN:
                    | DEFINISI OTOMATIS UNTUK 12 HES PERFORMANCE
                    |--------------------------------------------------------------------------
                    */

                    $definition = $indicator['definition'] ?? null;

                    switch ($indicatorNo) {

                        // 1.1 - 1.5
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                            $definition =
                                'Frequency rate = (kasus cedera x 200.000) / Jam Kerja';
                            break;

                        // 1.6
                        case 6:
                            $definition =
                                'MVC FR = (kasus x 1.000.000) / kilometer Perjalanan Kendaraan';
                            break;

                        // 1.7
                        case 7:
                            $definition =
                                'Record case > 1 barrel';
                            break;

                        // 1.8
                        case 8:
                            $definition =
                                'Record case > Rp. 100 Jt';
                            break;

                        // 1.9
                        case 9:
                            $definition =
                                'Record case > Rp. 100 Jt';
                            break;

                        // 1.10
                        case 10:
                            $definition =
                                'Record case';
                            break;

                        // 1.11
                        case 11:
                            $definition =
                                'Record case';
                            break;

                        // 1.12
                        case 12:
                            $definition =
                                'Reportable case';
                            break;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | FREQUENCY RATE
                    |--------------------------------------------------------------------------
                    */

                    $frequencyRate = null;

                    /*
                    |--------------------------------------------------------------------------
                    | 1.1 - 1.5
                    |
                    | Frequency rate =
                    | (kasus cedera x 200.000) / Jam Kerja
                    |--------------------------------------------------------------------------
                    */

                    if ($indicatorNo >= 1 && $indicatorNo <= 5) {

                        if ($totalManHoursActual > 0) {

                            $frequencyRate =
                                ($actual * 200000)
                                / $totalManHoursActual;

                        } else {

                            $frequencyRate = 0;
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | 1.6 MOTOR VEHICLE CRASH
                    |
                    | MVC FR =
                    | (kasus x 1.000.000) / kilometer Perjalanan Kendaraan
                    |--------------------------------------------------------------------------
                    */

                    elseif ($indicatorNo === 6) {

                        if ($totalKilometerActual > 0) {

                            $frequencyRate =
                                ($actual * 1000000)
                                / $totalKilometerActual;

                        } else {

                            $frequencyRate = 0;
                        }
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | 1.7 - 1.12
                    |
                    | Record case.
                    |--------------------------------------------------------------------------
                    */

                    elseif ($indicatorNo >= 7 && $indicatorNo <= 12) {

                        $frequencyRate = null;
                    }

                    /*
                    |--------------------------------------------------------------------------
                    | SIMPAN LAGGING
                    |--------------------------------------------------------------------------
                    */

                    HseLaggingIndicator::create([
                        'report_id' => $report->id,

                        'indicator_no' =>
                            $indicator['indicator_no'] ?? null,

                        'indicator_name' =>
                            $indicator['indicator_name'],

                        /*
                        |--------------------------------------------------------------------------
                        | DEFINISI OTOMATIS
                        |--------------------------------------------------------------------------
                        */
                        'definition' =>
                            $definition,

                        'unit' =>
                            $indicator['unit'] ?? 'Case',

                        'plan' =>
                            $indicator['plan'] ?? 0,

                        'actual' =>
                            $actual,

                        /*
                        |--------------------------------------------------------------------------
                        | HASIL PERHITUNGAN FREQUENCY RATE
                        |--------------------------------------------------------------------------
                        */
                        'frequency_rate' =>
                            $frequencyRate,

                        'month' =>
                            $month,

                        'year' =>
                            $year,

                        'notes' =>
                            $indicator['notes']
                            ?? ($validated['remarks'] ?? null),
                    ]);
                }

                /*
                |--------------------------------------------------------------------------
                | LEADING INDICATORS
                |--------------------------------------------------------------------------
                */

                foreach ($validated['leading'] ?? [] as $indicator) {

                    HseLeadingIndicator::create([
                        'report_id' =>
                            $report->id,

                        'indicator_no' =>
                            $indicator['indicator_no'] ?? null,

                        'indicator_name' =>
                            $indicator['indicator_name'],

                        'definition' =>
                            $indicator['definition'] ?? null,

                        'unit' =>
                            $indicator['unit'] ?? 'Activity',

                        'target_month' =>
                            $indicator['target_month']
                            ?? 0,

                        'target_year' =>
                            $indicator['target_year']
                            ?? 0,

                        'plan' =>
                            $indicator['plan'] ?? 0,

                        'actual' =>
                            $indicator['actual'] ?? 0,

                        'month' =>
                            $month,

                        'year' =>
                            $year,

                        'notes' =>
                            $indicator['notes']
                            ?? ($validated['remarks'] ?? null),
                    ]);
                }

                return $report;
            });

            // Kirim email permohonan approval ke admin
            $adminEmail = config('hse.admin_email', env('ADMIN_HSE_EMAIL', 'admin@besmindo.com'));
            try {
                if ($adminEmail) {
                    \Illuminate\Support\Facades\Mail::to($adminEmail)->send(new \App\Mail\HseReportApprovalMail($report));
                }
            } catch (\Throwable $mailError) {
                \Illuminate\Support\Facades\Log::warning('HSE Approval Email could not be sent: ' . $mailError->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Data HSE berhasil disimpan dan dikirimkan untuk permohonan approval admin.',
                'data' => $report->load([
                    'manHours',
                    'laggingIndicators',
                    'leadingIndicators',
                ]),
            ], 201);

        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Data HSE gagal disimpan.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Handle approval langsung dari link email.
     */
    public function emailApprove($id, $token)
    {
        $report = HseReport::where('id', $id)
            ->where('approval_token', $token)
            ->firstOrFail();

        $report->update([
            'status' => 'approved',
            'approved_at' => now(),
            'approved_by' => auth()->id() ?? 1,
        ]);

        return view('emails.approval_result', [
            'title' => 'Laporan HSE Berhasil Disetujui!',
            'message' => "Laporan HSE Rig {$report->rig_no} Periode Bulan {$report->period} ({$report->year}) telah disetujui. Data kini aktif di seluruh dashboard dan laporan.",
            'status' => 'approved',
        ]);
    }

    /**
     * Handle penolakan langsung dari link email.
     */
    public function emailReject($id, $token)
    {
        $report = HseReport::where('id', $id)
            ->where('approval_token', $token)
            ->firstOrFail();

        $report->update([
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);

        return view('emails.approval_result', [
            'title' => 'Laporan HSE Ditolak',
            'message' => "Laporan HSE Rig {$report->rig_no} Periode Bulan {$report->period} ({$report->year}) telah ditandai sebagai Ditolak.",
            'status' => 'rejected',
        ]);
    }

    /**
     * Menampilkan halaman Approval di Admin Dashboard.
     */
    public function approvalIndex(Request $request)
    {
        $reports = HseReport::with([
            'manHours',
            'laggingIndicators',
            'leadingIndicators',
            'approver',
            'creator',
        ])
        ->orderByRaw("CASE WHEN status = 'pending' THEN 1 WHEN status = 'draft' THEN 2 WHEN status = 'approved' THEN 3 ELSE 4 END")
        ->orderByDesc('created_at')
        ->get();

        return Inertia::render('Admin/Approval', [
            'reports' => $reports,
        ]);
    }

    /**
     * Update status approval via Admin UI dashboard.
     */
    public function updateApprovalStatus(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected,pending'],
            'rejection_reason' => ['nullable', 'string'],
        ]);

        $report = HseReport::findOrFail($id);

        $updateData = [
            'status' => $validated['status'],
        ];

        if ($validated['status'] === 'approved') {
            $updateData['approved_at'] = now();
            $updateData['approved_by'] = auth()->id() ?? 1;
        } elseif ($validated['status'] === 'rejected') {
            $updateData['rejected_at'] = now();
            $updateData['rejection_reason'] = $validated['rejection_reason'] ?? 'Ditolak oleh administrator';
        }

        $report->update($updateData);

        return response()->json([
            'success' => true,
            'message' => "Status laporan HSE berhasil diubah menjadi {$validated['status']}.",
            'data' => $report,
        ]);
    }

    /**
     * Detail report.
     */
    public function show($id)
    {
        $report = HseReport::with([
            'manHours',
            'laggingIndicators',
            'leadingIndicators',
        ])->findOrFail($id);

        return Inertia::render('Admin/Reports', [
            'reports' => [$report],

            'filters' => [
                'years' => [],
                'periods' => [],
                'rigs' => [],
                'focusCorps' => [],
                'locations' => [],
                'statuses' => [],
                'reportDates' => [],
            ],

            'selected' => [
                'year' =>
                    $report->year,

                'period' =>
                    $report->period,

                'rig_no' =>
                    $report->rig_no,

                'contract_no' =>
                    $report->contract_no,

                'location_district' =>
                    $report->location_district,

                'report_date' =>
                    $report->report_date,

                'status' =>
                    $report->status,
            ],
        ]);
    }

    /**
     * Menghapus report HSE dan data terkait (CRUD Delete).
     */
    public function destroy($id)
    {
        $report = HseReport::findOrFail($id);

        DB::transaction(function () use ($report) {
            $report->manHours()->delete();
            $report->laggingIndicators()->delete();
            $report->leadingIndicators()->delete();
            $report->delete();
        });

        return response()->json([
            'success' => true,
            'message' => 'Laporan HSE berhasil dihapus.',
        ]);
    }
}