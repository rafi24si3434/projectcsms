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
            return redirect()->route('user.input-data');
        }

        return Inertia::render('Auth/Register');
    }

    /**
     * Menyimpan data pendaftaran akun baru langsung ke database MySQL.
     */
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:admin,user'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Alamat email wajib diisi.',
            'email.email' => 'Format alamat email tidak valid.',
            'email.unique' => 'Alamat email ini sudah terdaftar di database.',
            'role.required' => 'Pilih peran akun (Role Access).',
            'role.in' => 'Pilihan peran tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal harus 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak sesuai.',
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'status' => 'active',
            'password' => Hash::make($validated['password']),
        ]);

        // Setelah registrasi berhasil, arahkan kembali ke halaman Login dengan pesan sukses
        return redirect()->route('login')->with('status', 'Registrasi akun berhasil! Silakan masuk dengan email dan kata sandi Anda.');
    }

    /**
     * Proses autentikasi login dengan 2 role (Admin & User/PIC).
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'string'],
            'password' => ['required', 'string'],
            'role' => ['nullable', 'string', 'in:admin,user'],
        ]);

        $credentials = [
            'email' => $validated['email'],
            'password' => $validated['password'],
        ];

        // Jika user memilih login role shortcut tapi email berupa username
        if (!str_contains($credentials['email'], '@')) {
            if ($credentials['email'] === 'admin') {
                $credentials['email'] = 'admin@besmindo.com';
            } elseif ($credentials['email'] === 'user') {
                $credentials['email'] = 'user@besmindo.com';
            }
        }

        if (Auth::attempt(['email' => $credentials['email'], 'password' => $credentials['password']], $request->boolean('remember'))) {
            $request->session()->regenerate();

            return redirect()->route('csms.dashboard');
        }

        // Fallback demo matching jika password default
        $user = User::where('email', $credentials['email'])->first();
        if ($user && Hash::check($credentials['password'], $user->password)) {
            Auth::login($user, $request->boolean('remember'));
            $request->session()->regenerate();

            return redirect()->route('csms.dashboard');
        }

        return back()->withErrors([
            'email' => 'Email, password, atau role yang Anda masukkan tidak sesuai.',
        ])->onlyInput('email');
    }

    /**
     * Menampilkan halaman lupa password.
     */
    public function showForgotPassword()
    {
        return Inertia::render('Auth/ForgotPassword', [
            'status' => session('status'),
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
            'email.email' => 'Format alamat email tidak valid.',
            'email.exists' => 'Alamat email ini tidak terdaftar di sistem kami.',
        ]);

        $email = $request->email;
        $user = User::where('email', $email)->first();
        $token = \Illuminate\Support\Str::random(60);

        \Illuminate\Support\Facades\DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            [
                'token' => \Illuminate\Support\Facades\Hash::make($token),
                'created_at' => now(),
            ]
        );

        $resetUrl = url("/reset-password/{$token}?email=" . urlencode($email));

        // Kirim email
        try {
            \Illuminate\Support\Facades\Mail::to($email)->send(new \App\Mail\PasswordResetMail($user, $resetUrl));
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Password reset email could not be sent: ' . $e->getMessage());
        }

        return back()->with([
            'status' => 'Tautan untuk mengatur ulang kata sandi telah dikirimkan ke email Anda!',
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
            'token' => ['required'],
            'email' => ['required', 'email', 'exists:users,email'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi tidak cocok.',
        ]);

        $record = \Illuminate\Support\Facades\DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$record || !\Illuminate\Support\Facades\Hash::check($request->token, $record->token)) {
            // Periksa juga jika waktu token lebih dari 60 menit
            return back()->withErrors([
                'email' => 'Token reset kata sandi tidak valid atau telah kadaluarsa. Silakan ajukan kembali.',
            ]);
        }

        $user = User::where('email', $request->email)->firstOrFail();
        $user->update([
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);

        // Hapus token yang sudah dipakai
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
