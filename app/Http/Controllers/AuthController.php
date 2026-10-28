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
     * Menolak akun Pending dan Inactive dengan pesan yang jelas.
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email'    => ['required', 'string'],
            'password' => ['required', 'string'],
            'role'     => ['nullable', 'string', 'in:admin,user,officer,crew'],
            'hfo_name' => ['nullable', 'string', 'max:255'],
        ], [
            'email.required'    => 'Username atau email wajib diisi.',
            'password.required' => 'Password wajib diisi.',
        ]);

        $inputLogin = trim($validated['email']);
        $password = $validated['password'];

        // 1. Cek user berdasarkan username (misal 'admin') ATAU email (misal 'admin@besmindo.com')
        $user = User::where(function ($query) use ($inputLogin) {
            $query->where('username', strtolower($inputLogin))
                  ->orWhere('email', strtolower($inputLogin));
        })->first();

        // 2. Fallback khusus jika input adalah 'admin'
        if (!$user && strtolower($inputLogin) === 'admin') {
            $user = User::where('role', 'admin')->first()
                 ?? User::where('email', 'admin@besmindo.com')->first();
        }

        // 3. Fallback shortcut format kru (misal 'bms1' -> 'bms01@besmindo.com')
        if (!$user && !str_contains($inputLogin, '@')) {
            $lower = strtolower($inputLogin);
            if (str_starts_with($lower, 'bms')) {
                $suffix = substr($lower, 3);
                if (is_numeric($suffix) && strlen($suffix) === 1) {
                    $suffix = '0' . $suffix;
                }
                $user = User::where('email', "bms{$suffix}@besmindo.com")->first();
            }
        }

        if ($user) {
            // Verifikasi password terlebih dahulu
            if (!Hash::check($password, $user->password)) {
                return back()->withErrors([
                    'email' => 'Username atau password yang Anda masukkan tidak sesuai.',
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

            // ── CEK STATUS RIG: ARSIP ────────────────────────────────────────
            if ($user->rig && strtolower($user->rig->status) === 'archived') {
                return back()->withErrors([
                    'email' => '📦 Unit RIG ini (' . $user->rig->name . ') telah diarsipkan dan tidak aktif. Hubungi HSE Admin untuk informasi lebih lanjut.',
                ])->onlyInput('email');
            }

            // ── STATUS: ACTIVE → Proses login ────────────────────────────────
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            // ── SIMPAN PETUGAS HFO KE SESSION JIKA ADA ───────────────────────
            if (!empty($validated['hfo_name'])) {
                $hfo = trim($validated['hfo_name']);
                $request->session()->put('hfo_name', $hfo);
                $request->session()->put('logged_hfo_name', $hfo);
            }

            if ($user->role === 'admin') {
                return redirect()->intended(route('admin.dashboard'));
            }
            if ($user->role === 'user' && $user->csms_rig_id) {
                return redirect()->intended(route('csms.user-rig-input', ['rig_id' => $user->csms_rig_id]));
            }

            return redirect()->intended(route('csms.dashboard'));
        }

        // Akun tidak ditemukan
        return back()->withErrors([
            'email' => 'Username atau email tidak terdaftar di sistem.',
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
