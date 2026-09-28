<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Status Approval Laporan HSE' }}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #003824;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            color: #1e293b;
        }
        .card {
            background-color: #ffffff;
            border-radius: 16px;
            max-width: 520px;
            width: 90%;
            margin: 20px;
            padding: 40px 32px;
            text-align: center;
            box-shadow: 0 10px 35px rgba(0, 0, 0, 0.25);
            border: 2px solid #efff00;
        }
        .icon-circle {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 36px;
        }
        .success {
            background-color: #ecfdf5;
            color: #004d32;
            border: 2px solid #a7f3d0;
        }
        .reject {
            background-color: #fef2f2;
            color: #991b1b;
            border: 2px solid #fecaca;
        }
        h1 {
            margin: 0 0 10px;
            font-size: 22px;
            font-weight: 800;
            color: #004d32;
        }
        p {
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 24px;
        }
        .btn {
            display: inline-block;
            background-color: #004d32;
            color: #efff00;
            text-decoration: none;
            padding: 12px 28px;
            border-radius: 8px;
            font-weight: 800;
            font-size: 14px;
            border: 1px solid #efff00;
            box-shadow: 0 4px 12px rgba(239, 255, 0, 0.25);
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-circle {{ $status === 'approved' ? 'success' : 'reject' }}">
            {{ $status === 'approved' ? '✓' : '✕' }}
        </div>
        <h1>{{ $title }}</h1>
        <p>{{ $message }}</p>
        <a href="{{ url('/admin/dashboard') }}" class="btn">
            Buka Dashboard Admin
        </a>
    </div>
</body>
</html>
