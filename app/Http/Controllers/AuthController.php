<?php

namespace App\Http\Controllers;

use App\Models\User;
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
            return redirect()->route('csms.dashboard');
        }

        return Inertia::render('Login');
    }

    /**
     * Menampilkan halaman registrasi akun baru.
     */
    public function showRegister()
    {
        if (Auth::check()) {
            $user = Auth::user();
            if ($user->role === 'admin') {
                return redirect()->route('admin.dashboard');
            }
            return redirect()->route('csms.dashboard');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Menyimpan data pendaftaran akun baru.
     * Status default: PENDING — harus di-ACC oleh HSE Admin sebelum bisa login.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'              => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required'              => 'Nama lengkap wajib diisi.',
            'email.required'             => 'Alamat email wajib diisi.',
            'email.email'                => 'Format alamat email tidak valid.',
            'email.unique'               => 'Alamat email ini sudah terdaftar di sistem.',
            'password.required'          => 'Kata sandi wajib diisi.',
            'password.min'               => 'Kata sandi minimal harus 6 karakter.',
            'password.confirmed'         => 'Konfirmasi kata sandi tidak sesuai.',
        ]);

        User::create([
            'name'     => trim($validated['name']),
            'email'    => strtolower(trim($validated['email'])),
            'role'     => 'user',       // Semua registrasi mandiri = user biasa
            'status'   => 'Pending',    // ← WAJIB di-ACC admin sebelum bisa login
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()
            ->route('login')
            ->with('status', 'Pendaftaran berhasil! Akun Anda sedang menunggu persetujuan HSE Admin. Silakan hubungi Admin untuk proses aktivasi.');
    }

    /**
     * Proses autentikasi login.
     * Menolak akun Pending dan Inactive dengan pesan yang jelas.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
            'role'     => ['nullable', 'string', 'in:admin,user,officer,crew'],
        ]);

        $credentials = [
            'email'    => $validated['email'],
            'password' => $validated['password'],
        ];

        // Shortcut username → email resolusi
        if (!str_contains($credentials['email'], '@')) {
            $inputUser = strtolower(trim($credentials['email']));
            if ($inputUser === 'admin') {
                $credentials['email'] = 'admin@besmindo.com';
            } elseif ($inputUser === 'user') {
                $credentials['email'] = 'user@besmindo.com';
            } elseif (str_starts_with($inputUser, 'bms')) {
                $suffix = substr($inputUser, 3);
                if (is_numeric($suffix) && strlen($suffix) === 1) {
                    $suffix = '0' . $suffix;
                }
                $credentials['email'] = "bms{$suffix}@besmindo.com";
            }
        }

        // Cek user dulu sebelum Auth::attempt agar bisa berikan pesan status yang tepat
        $user = User::where('email', strtolower(trim($credentials['email'])))->first();

        if ($user) {
            // Verifikasi password terlebih dahulu
            if (!Hash::check($credentials['password'], $user->password)) {
                return back()->withErrors([
                    'email' => 'Email atau kata sandi yang Anda masukkan tidak sesuai.',
                ])->onlyInput('email');
            }

            $status = strtolower($user->status ?? 'active');

            // ── STATUS: PENDING ──────────────────────────────────────────────
            if ($status === 'pending') {
                return back()->withErrors([
                    'email' => '⏳ Akun Anda masih menunggu persetujuan HSE Admin. Silakan hubungi Admin untuk aktivasi.',
                ])->onlyInput('email');
            }

            // ── STATUS: REJECTED ─────────────────────────────────────────────
            if ($status === 'rejected') {
                $reason = $user->rejection_reason
                    ? " Alasan: {$user->rejection_reason}"
                    : '';
                return back()->withErrors([
                    'email' => "❌ Permintaan akun Anda telah ditolak oleh HSE Admin.{$reason} Hubungi Admin untuk informasi lebih lanjut.",
                ])->onlyInput('email');
            }

            // ── STATUS: INACTIVE ──────────────────────────────────────────────
            if ($status === 'inactive') {
                return back()->withErrors([
                    'email' => '🚫 Akun Anda telah dinonaktifkan. Silakan hubungi HSE Admin untuk mengaktifkan kembali.',
                ])->onlyInput('email');
            }

            // ── STATUS: ACTIVE → Proses login ────────────────────────────────
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            return redirect()->route('csms.dashboard');
        }

        // Akun tidak ditemukan
        return back()->withErrors([
            'email' => 'Email yang Anda masukkan tidak terdaftar di sistem.',
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
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
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
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }
}
