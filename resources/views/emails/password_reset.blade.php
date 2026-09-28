<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Kata Sandi</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f4f7f6;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1e293b;
        }
        .container {
            max-width: 580px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 77, 50, 0.08);
            border: 1px solid #e2e8f0;
        }
        .header {
            background-color: #004d32;
            padding: 24px 30px;
            color: #ffffff;
            border-bottom: 4px solid #efff00;
        }
        .header h1 {
            margin: 0 0 4px 0;
            font-size: 18px;
            font-weight: 800;
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
        .btn {
            display: inline-block;
            background-color: #004d32;
            color: #efff00 !important;
            padding: 13px 28px;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 800;
            font-size: 14px;
            border: 2px solid #efff00;
            box-shadow: 0 4px 12px rgba(0, 77, 50, 0.25);
            margin: 20px 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 16px 30px;
            font-size: 11.5px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <span class="badge">Keamanan Akun HSE</span>
            <h1>PT BESMINDO MATERI SEWATAMA</h1>
            <p style="margin: 0; color: #d1fae5; font-size: 12.5px;">Permintaan Pengaturan Ulang Kata Sandi (Password Reset)</p>
        </div>

        <div class="body">
            <p style="font-size: 14px; line-height: 1.5; margin-top: 0;">
                Halo <strong>{{ $user->name }}</strong>,
            </p>
            <p style="font-size: 13.5px; line-height: 1.6; color: #334155;">
                Kami menerima permintaan untuk mereset kata sandi akun Anda pada <strong>Portal HSE PT Besmindo Materi Sewatama</strong>. Klik tombol di bawah ini untuk membuat kata sandi baru:
            </p>

            <div style="text-align: center;">
                <a href="{{ $resetUrl }}" class="btn">
                    BUAT KATA SANDI BARU
                </a>
            </div>

            <p style="font-size: 12.5px; color: #64748b; line-height: 1.5;">
                Tautan ini berlaku selama 60 menit. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini dan kata sandi Anda akan tetap aman.
            </p>
        </div>

        <div class="footer">
            Email ini dikirim secara otomatis oleh Sistem HSE PT Besmindo Materi Sewatama.
        </div>
    </div>
</body>
</html>
