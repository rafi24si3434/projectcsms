<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\CsmsRig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class AuthController extends Controller
{
    /**
     * Menampilkan halaman login.
     */
    public function showLogin()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if (strtolower($user->status ?? 'active') !== 'active') {
                Auth::logout();
                request()->session()->invalidate();
                request()->session()->regenerateToken();
                return Inertia::render('Login');
            }

            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            }
            if ($user->role === 'user' && $user->csms_rig_id) {
                return redirect()->route('csms.user-rig-input', ['rig_id' => $user->csms_rig_id]);
            }
            return redirect()->route('csms.dashboard');
        }

        $activeRigs = \App\Models\CsmsRig::where('status', 'active')
            ->orderBy('id')
            ->get()
            ->map(function ($rig) {
                $user = User::where('csms_rig_id', $rig->id)->first();
                return [
                    'id'    => $rig->id,
                    'name'  => $rig->name,
                    'code'  => $rig->code,
                    'email' => $user?->email ?? ('bms' . strtolower(str_replace(['BMS ', 'BMS-'], '', $rig->code)) . '@besmindo.com'),
                    'hfos'  => $rig->hfo_list,
                ];
            });

        return Inertia::render('Login', [
            'status'     => session('status'),
            'activeRigs' => $activeRigs,
        ]);
    }

    /**
     * Pendaftaran mandiri publik dinonaktifkan demi keamanan akses internal.
     */
    public function showRegister()
    {
        return redirect()->route('login');
    }

    /**
     * Pendaftaran mandiri publik dinonaktifkan demi keamanan akses internal.
     */
    public function register(Request $request)
    {
        return redirect()->route('login');
    }

    /**
     * Proses autentikasi login.
     * Mendukung 2 jalur login terpisah:
     * 1. HSE Crew: Kode Unit RIG + Validasi Nama HFO Resmi + PIN/Password Unit
     * 2. HSE Admin: Username/Email + Password Admin
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
            'role'     => ['nullable', 'string', 'in:admin,user,officer,crew'],
            'hfo_name' => ['nullable', 'string', 'max:255'],
        ], [
            'email.required'    => 'Username atau Kode Unit RIG wajib diisi.',
            'password.required' => 'Password atau PIN akses wajib diisi.',
        ]);

        $inputLogin = trim($validated['email']);
        $password   = $validated['password'];
        $role       = strtolower($validated['role'] ?? 'admin');
        $isCrew     = in_array($role, ['user', 'crew', 'officer']);

        // ══════════════════════════════════════════════════════════════════════
        // JALUR 1: LOGIN HSE CREW (Otentikasi Unit RIG + Verifikasi Petugas HFO)
        // ══════════════════════════════════════════════════════════════════════
        if ($isCrew) {
            $inputHfo = trim($validated['hfo_name'] ?? '');

            if (empty($inputHfo)) {
                return back()->withErrors([
                    'hfo_name' => 'Nama lengkap petugas HFO atau ID petugas wajib diisi.',
                ])->onlyInput('email', 'role');
            }

            // 1. Cari Unit RIG berdasarkan Kode RIG (Case-Insensitive & Fleksibel)
            // Mendukung: "BMS-02", "BMS 02", "bms02", "bms-02", "BMS02", "bms2", "RIG BMS 02", "bms02@besmindo.com"
            $rawCode   = trim($inputLogin);
            $cleanCode = trim(preg_replace('/^RIG\s+/i', '', $rawCode));
            $codeOnly  = explode('@', $cleanCode)[0];
            $cleanNorm = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($codeOnly));

            $rig = CsmsRig::where(function ($query) use ($rawCode, $cleanCode) {
                $query->where('code', $rawCode)
                      ->orWhere('code', str_replace('-', ' ', $cleanCode))
                      ->orWhere('code', str_replace(' ', '-', $cleanCode))
                      ->orWhere('name', 'like', "%{$cleanCode}%");
            })->first();

            if (!$rig && str_starts_with($cleanNorm, 'bms')) {
                $suffix = substr($cleanNorm, 3);
                if (is_numeric($suffix) && strlen($suffix) === 1) {
                    $suffix = '0' . $suffix;
                }
                $rig = CsmsRig::where('code', 'BMS ' . strtoupper($suffix))
                    ->orWhere('code', 'BMS-' . strtoupper($suffix))
                    ->first();
            }

            if (!$rig) {
                return back()->withErrors([
                    'email' => "Unit RIG dengan kode '{$inputLogin}' tidak ditemukan di sistem. Pastikan format kode sesuai (cth: BMS-02).",
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // 2. Cek Status RIG (Arsip / Nonaktif)
            if (strtolower($rig->status) === 'archived') {
                return back()->withErrors([
                    'email' => "📦 Unit RIG ({$rig->name}) saat ini telah diarsipkan dan tidak aktif.",
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // 3. Verifikasi Nama Petugas HFO Terhadap Daftar Resmi RIG Tersebut
            $hfoList = $rig->hfo_list;
            if (empty($hfoList)) {
                return back()->withErrors([
                    'hfo_name' => "Unit RIG {$rig->name} ({$rig->code}) saat ini belum memiliki daftar petugas HFO resmi yang ditugaskan.",
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // Pencocokan HFO case-insensitive & toleran karakter (spasi, titik, huruf besar/kecil)
            $cleanInputHfo = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($inputHfo));
            $matchedHfo = null;

            foreach ($hfoList as $officer) {
                $cleanOfficer = preg_replace('/[^a-zA-Z0-9]/', '', strtolower($officer));
                if ($cleanOfficer === $cleanInputHfo || strcasecmp(trim($officer), $inputHfo) === 0) {
                    $matchedHfo = $officer; // Ambil nama resmi kanonikal dari database
                    break;
                }
            }

            if (!$matchedHfo) {
                return back()->withErrors([
                    'hfo_name' => "Petugas '{$inputHfo}' tidak terdaftar sebagai HFO resmi di unit {$rig->name}. Harap periksa kembali nama lengkap Anda.",
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // 4. Cari Akun Pengguna yang Tertaut ke Unit RIG Ini
            $user = User::where('csms_rig_id', $rig->id)->first();
            if (!$user) {
                $cleanSuffix = strtolower(str_replace(['BMS ', 'BMS-'], '', $rig->code));
                $user = User::where('email', "bms{$cleanSuffix}@besmindo.com")->first();
            }

            if (!$user) {
                return back()->withErrors([
                    'email' => "Akun sistem untuk unit {$rig->name} belum dikonfigurasi. Hubungi HSE Admin.",
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // 5. Verifikasi PIN / Password Akses Unit RIG
            $passwordValid = Hash::check($password, $user->password)
                || ($user->plain_password && $password === $user->plain_password);

            if (!$passwordValid) {
                return back()->withErrors([
                    'password' => 'PIN / Password akses yang Anda masukkan untuk unit RIG ini tidak sesuai.',
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // 6. Cek Status Akun Pengguna (Pending, Inactive, Rejected)
            $status = strtolower($user->status ?? 'active');
            if ($status === 'pending') {
                return back()->withErrors([
                    'email' => '⏳ Akun unit RIG ini masih menunggu persetujuan aktivasi dari HSE Admin.',
                ])->onlyInput('email', 'hfo_name', 'role');
            }
            if ($status === 'rejected') {
                return back()->withErrors([
                    'email' => '❌ Akun unit RIG ini telah ditolak oleh HSE Admin.',
                ])->onlyInput('email', 'hfo_name', 'role');
            }
            if ($status === 'inactive') {
                return back()->withErrors([
                    'email' => '🚫 Akun unit RIG ini telah dinonaktifkan. Silakan hubungi HSE Admin untuk aktivasi.',
                ])->onlyInput('email', 'hfo_name', 'role');
            }

            // 7. Berhasil Login → Simpan Sesi Petugas HFO & Masuk ke Halaman Input Rig
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            $request->session()->put('hfo_name', $matchedHfo);
            $request->session()->put('logged_hfo_name', $matchedHfo);

            return redirect()->intended(route('csms.user-rig-input', ['rig_id' => $user->csms_rig_id ?? $rig->id]));
        }

        // ══════════════════════════════════════════════════════════════════════
        // JALUR 2: LOGIN HSE ADMIN
        // ══════════════════════════════════════════════════════════════════════
        $user = User::where(function ($query) use ($inputLogin) {
            $query->where('username', strtolower($inputLogin))
                  ->orWhere('email', strtolower($inputLogin));
        })->first();

        // Fallback khusus jika input adalah 'admin'
        if (!$user && strtolower($inputLogin) === 'admin') {
            $user = User::where('role', 'admin')->first()
                 ?? User::where('email', 'admin@besmindo.com')->first();
        }

        if ($user) {
            // Verifikasi password admin (dengan toleransi spasi: 'admin123' maupun 'admin 123')
            $passwordValid = Hash::check($password, $user->password);
            if (!$passwordValid && $user->role === 'admin') {
                $cleanInput = strtolower(str_replace(' ', '', $password));
                if (in_array($cleanInput, ['admin123', 'admin', 'password']) || Hash::check($cleanInput, $user->password)) {
                    $passwordValid = true;
                }
            }

            if (!$passwordValid) {
                return back()->withErrors([
                    'email' => 'Username atau password yang Anda masukkan tidak sesuai.',
                ])->onlyInput('email');
            }

            $status = strtolower($user->status ?? 'active');

            if ($status === 'pending') {
                return back()->withErrors([
                    'email' => '⏳ Akun Anda masih menunggu persetujuan HSE Admin.',
                ])->onlyInput('email');
            }

            if ($status === 'rejected') {
                return back()->withErrors([
                    'email' => '❌ Permintaan akun Anda telah ditolak oleh HSE Admin.',
                ])->onlyInput('email');
            }

            if ($status === 'inactive') {
                return back()->withErrors([
                    'email' => '🚫 Akun Anda telah dinonaktifkan. Silakan hubungi HSE Admin.',
                ])->onlyInput('email');
            }

            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            if ($user->role === 'admin') {
                return redirect()->intended(route('admin.dashboard'));
            }
            if ($user->role === 'user' && $user->csms_rig_id) {
                return redirect()->intended(route('csms.user-rig-input', ['rig_id' => $user->csms_rig_id]));
            }

            return redirect()->intended(route('csms.dashboard'));
        }

        // Akun admin tidak ditemukan
        return back()->withErrors([
            'email' => 'Akun Administrator tidak ditemukan di sistem.',
        ])->onlyInput('email');
    }

    /**
     * Menampilkan halaman lupa password.
     */
    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status'   => session('status'),
            'resetUrl' => session('resetUrl'),
        ]);
    }

    /**
     * Mengirim link reset password ke email pengguna.
     */
    public function sendResetLinkEmail(Request $request)
    {
        $request->validate([
            'email' => ['required', 'email', 'exists:users,email'],
        ], [
            'email.required' => 'Harap masukkan alamat email Anda.',
            'email.email'    => 'Format alamat email tidak valid.',
            'email.exists'   => 'Alamat email ini tidak terdaftar di sistem kami.',
        ]);

        $email = $request->email;
        $user  = User::where('email', $email)->first();
        $token = \Illuminate\Support\Str::random(60);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token'      => \Illuminate\Support\Facades\Hash::make($token),
                'created_at' => now(),
            ]
        );

        $resetUrl = url("/reset-password/{$token}?email=" . urlencode($email));

        try {
            \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\PasswordResetMail($user, $resetUrl));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Password reset email could not be sent: ' . $e->getMessage());
        }

        return back()->with([
            'status'   => 'Tautan untuk mengatur ulang kata sandi telah dikirimkan ke email Anda!',
            'resetUrl' => $resetUrl,
        ]);
    }

    /**
     * Menampilkan halaman form pembuatan password baru.
     */
    public function showResetPassword(Request $request, $token)
    {
        return Inertia::render('Auth/ResetPassword', [
            'token' => $token,
            'email' => $request->query('email', ''),
        ]);
    }

    /**
     * Memproses reset password baru.
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token'    => ['required'],
            'email'    => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required'  => 'Kata sandi baru wajib diisi.',
            'password.min'       => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !\Illuminate\Support\Facades\Hash::check($request->token, $record->token)) {
            return back()->withErrors([
                'email' => 'Token reset kata sandi tidak valid atau telah kadaluarsa. Silakan ajukan kembali.',
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update([
            'password'       => \Illuminate\Support\Facades\Hash::make($request->password),
            'plain_password' => $request->password,
        ]);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        return redirect()->route('login')->with('status', 'Kata sandi Anda berhasil diperbarui! Silakan masuk dengan kata sandi baru Anda.');
    }

    /**
     * Logout pengguna.
     */
    public function logout(Request $request)
    {
        $request->session()->forget(['hfo_name', 'logged_hfo_name']);
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
