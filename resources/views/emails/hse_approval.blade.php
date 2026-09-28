<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Permohonan Approval Laporan HSE</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f7f6;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
        }
        .container {
            max-width: 620px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 77, 50, 0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #004d32;
            padding: 26px 30px;
            color: #ffffff;
            border-bottom: 4px solid #efff00;
        }
        .header h1 {
            margin: 0 0 6px 0;
            font-size: 20px;
            font-weight: 800;
            letter-spacing: -0.01em;
        }
        .header p {
            margin: 0;
            color: #d1fae5;
            font-size: 13px;
        }
        .badge {
            display: inline-block;
            background-color: #efff00;
            color: #004d32;
            font-weight: 800;
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }
        .body {
            padding: 26px 30px;
        }
        .info-table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
            font-size: 13px;
        }
        .info-table td {
            padding: 9px 12px;
            border-bottom: 1px solid #f1f5f9;
        }
        .info-table td.label {
            width: 38%;
            color: #64748b;
            font-weight: 600;
            background-color: #f8fafc;
        }
        .info-table td.value {
            color: #0f172a;
            font-weight: 700;
        }
        .actions {
            margin: 28px 0 10px 0;
            text-align: center;
        }
        .btn {
            display: inline-block;
            padding: 13px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 800;
            font-size: 14px;
            margin: 6px 8px;
        }
        .btn-approve {
            background-color: #004d32;
            color: #efff00 !important;
            border: 2px solid #efff00;
            box-shadow: 0 4px 12px rgba(0, 77, 50, 0.25);
        }
        .btn-reject {
            background-color: #fee2e2;
            color: #991b1b !important;
            border: 1px solid #f87171;
        }
        .footer {
            background-color: #f8fafc;
            padding: 18px 30px;
            font-size: 11.5px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <span class="badge">Permohonan Approval Data HSE</span>
            <h1>PT BESMINDO MATERI SEWATAMA</h1>
            <p>Sistem Informasi Manajemen Kinerja Keselamatan Kerja (HSE)</p>
        </div>

        <!-- BODY -->
        <div class="body">
            <p style="font-size: 14px; line-height: 1.5; margin-top: 0;">
                Yth. <strong>HSE Administrator / Manager</strong>,
            </p>
            <p style="font-size: 13.5px; line-height: 1.5; color: #334155;">
                Telah diinputkan laporan kinerja HSE terbaru dari kru / PIC lapangan dengan rincian sebagai berikut:
            </p>

            <table class="info-table">
                <tr>
                    <td class="label">Nomor Rig</td>
                    <td class="value">{{ $report->rig_no ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Nomor Kontrak</td>
                    <td class="value">{{ $report->contract_no ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Lokasi / Distrik</td>
                    <td class="value">{{ $report->location_district ?? '-' }}</td>
                </tr>
                <tr>
                    <td class="label">Periode Kinerja</td>
                    <td class="value">Bulan {{ $report->period }} - Tahun {{ $report->year }}</td>
                </tr>
                <tr>
                    <td class="label">Tanggal Laporan</td>
                    <td class="value">{{ $report->report_date ? $report->report_date->format('d F Y') : '-' }}</td>
                </tr>
                @if($report->manHours)
                <tr>
                    <td class="label">Total Man Hours Actual</td>
                    <td class="value">{{ number_format(($report->manHours->premises_actual ?? 0) + ($report->manHours->non_premises_actual ?? 0)) }} Jam</td>
                </tr>
                <tr>
                    <td class="label">Total Karyawan / Kendaraan</td>
                    <td class="value">{{ $report->manHours->total_employees ?? 0 }} Org / {{ $report->manHours->total_vehicles ?? 0 }} Unit</td>
                </tr>
                @endif
                <tr>
                    <td class="label">Diinputkan Oleh</td>
                    <td class="value">
                        <strong>{{ $report->submitter_name ?? 'PIC Lapangan' }}</strong>
                        @if($report->submitter_email)
                            <div style="font-size: 12px; color: #64748b; font-weight: normal; margin-top: 2px;">{{ $report->submitter_email }}</div>
                        @endif
                    </td>
                </tr>
                @if($report->remarks)
                <tr>
                    <td class="label">Catatan Lapangan</td>
                    <td class="value">{{ $report->remarks }}</td>
                </tr>
                @endif
            </table>

            <div style="background-color: #f0fdf4; border-left: 4px solid #004d32; padding: 12px 16px; border-radius: 4px; font-size: 12.5px; color: #166534; margin: 18px 0;">
                ℹ <em>Data ini saat ini berstatus <strong>Pending Approval</strong> dan belum masuk ke kalkulasi Dashboard KPI atau Laporan hingga disetujui.</em>
            </div>

            <!-- ACTION BUTTONS -->
            <div class="actions">
                <a href="{{ $approveUrl }}" class="btn btn-approve">
                    ✓ SETUJUI LAPORAN (APPROVE)
                </a>
                <a href="{{ $rejectUrl }}" class="btn btn-reject">
                    ✕ TOLAK (REJECT)
                </a>
            </div>
            
            <p style="text-align: center; font-size: 11.5px; color: #94a3b8; margin-top: 14px;">
                Atau Anda juga dapat melakukan approval langsung melalui dashboard menu <strong>Approval</strong> pada aplikasi web.
            </p>
        </div>

        <!-- FOOTER -->
        <div class="footer">
            Email ini dikirim secara otomatis oleh Sistem HSE PT Besmindo Materi Sewatama.<br>
            Harap tidak membalas email ini secara langsung.
        </div>
    </div>
</body>
</html>
