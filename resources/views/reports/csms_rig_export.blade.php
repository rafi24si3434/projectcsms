<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rekapitulasi Dokumen CSMS - {{ $rig->name }}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1e293b;
            margin: 0;
            padding: 30px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            border: 1px solid #e2e8f0;
            box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05);
            padding: 32px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 24px;
        }
        .brand-title {
            font-size: 20px;
            font-weight: 900;
            color: #0b3c74;
            letter-spacing: 0.05em;
        }
        .brand-sub {
            font-size: 12px;
            color: #64748b;
            font-weight: 600;
            text-transform: uppercase;
        }
        .badge-rig {
            background: #ecfdf5;
            color: #047857;
            border: 1px solid #a7f3d0;
            padding: 6px 14px;
            border-radius: 9999px;
            font-weight: 800;
            font-size: 13px;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 28px;
        }
        .stat-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px;
        }
        .stat-label {
            font-size: 11px;
            font-weight: 700;
            color: #64748b;
            text-transform: uppercase;
        }
        .stat-val {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 4px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 12px;
            margin-top: 12px;
        }
        th {
            background-color: #0f172a;
            color: #ffffff;
            font-weight: 700;
            text-align: left;
            padding: 10px 12px;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
        }
        td {
            padding: 10px 12px;
            border-bottom: 1px solid #e2e8f0;
        }
        tr:nth-child(even) td {
            background-color: #f8fafc;
        }
        .badge-status {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 10.5px;
        }
        .status-approved { background: #dcfce7; color: #15803d; }
        .status-revision { background: #fee2e2; color: #b91c1c; }
        .status-pending { background: #fef3c7; color: #b45309; }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #e2e8f0;
            padding-top: 16px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div>
                <div class="brand-title">PT BESMINDO MATERI SEWATAMA</div>
                <div class="brand-sub">Contractor Safety Management System (CSMS) &bull; Laporan Rekapitulasi Dokumen</div>
            </div>
            <div class="badge-rig">{{ $rig->name }} ({{ $rig->code }})</div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Unit RIG</div>
                <div class="stat-val">{{ $rig->code }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Periode Dokumen</div>
                <div class="stat-val">{{ $month && $month !== 'all' ? $month : 'Semua Bln' }} {{ $year && $year !== 'all' ? $year : 'Semua Thn' }}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Total Berkas Fisik</div>
                <div class="stat-val">{{ $fileCount }} Berkas</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Waktu Export</div>
                <div class="stat-val" style="font-size: 14px; margin-top: 8px;">{{ $generatedAt }}</div>
            </div>
        </div>

        <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Daftar Rekaman & Status Matriks 21 Dokumen CSMS</h3>
        <table>
            <thead>
                <tr>
                    <th style="width: 35px;">No</th>
                    <th>Kategori Dokumen CSMS</th>
                    <th>Scope</th>
                    <th>Bulan / Tahun</th>
                    <th>Crew</th>
                    <th>Nama Berkas Terlampir</th>
                    <th>Status ACC / Verifikasi</th>
                    <th>Catatan Reviewer</th>
                </tr>
            </thead>
            <tbody>
                @forelse($records as $index => $rec)
                <tr>
                    <td style="font-weight: 800; text-align: center;">{{ $index + 1 }}</td>
                    <td style="font-weight: 700; color: #0f172a;">{{ $rec->category?->nomor_kategori }}. {{ $rec->category?->nama_dokumen }}</td>
                    <td>{{ $rec->category?->scope === 'crew' ? 'Per-Crew' : '1x/Bln/Rig' }}</td>
                    <td>{{ $rec->periode_bulan }} {{ $rec->periode_tahun }}</td>
                    <td><strong style="color: #047857;">{{ $rec->crew ?: 'Semua Crew' }}</strong></td>
                    <td>
                        @if($rec->file_path || !empty($rec->attachments))
                            <span style="color: #0369a1; font-weight: 600;">
                                {{ $rec->file_name ?: 'Berkas Terlampir' }}
                            </span>
                        @else
                            <span style="color: #94a3b8; font-style: italic;">Belum diunggah</span>
                        @endif
                    </td>
                    <td>
                        @if($rec->approval_status === 'approved')
                            <span class="badge-status status-approved">ACC Terverifikasi</span>
                        @elseif($rec->approval_status === 'revision')
                            <span class="badge-status status-revision">Perlu Revisi</span>
                        @else
                            <span class="badge-status status-pending">Menunggu Verifikasi</span>
                        @endif
                    </td>
                    <td style="color: #64748b; font-size: 11px;">{{ $rec->approval_notes ?: '-' }}</td>
                </tr>
                @empty
                <tr>
                    <td colspan="8" style="text-align: center; padding: 24px; color: #64748b;">Belum ada data rekaman dokumen yang tercatat untuk unit Rig ini.</td>
                </tr>
                @endforelse
            </tbody>
        </table>

        <div class="footer">
            &copy; {{ date('Y') }} PT Besmindo Materi Sewatama &bull; Dokumen Rahasia Perusahaan &bull; Contractor Safety Management System
        </div>
    </div>
</body>
</html>
