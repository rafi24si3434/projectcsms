<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingController extends Controller
{
    /**
     * Menampilkan halaman Settings.
     */
    public function index(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Admin/Settings', [
            'currentUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
                'created_at' => $user->created_at ? $user->created_at->format('d M Y, H:i') : '-',
            ],
            'systemInfo' => [
                'appName' => 'Besmindo HSE Portal',
                'companyName' => 'PT BESMINDO MATERI SEWATAMA',
                'appVersion' => 'v2.4.0 (Enterprise)',
                'environment' => config('app.env'),
                'phpVersion' => PHP_VERSION,
                'database' => config('database.default'),
                'emailNotification' => true,
                'autoBackup' => true,
            ],
        ]);
    }

    /**
     * Update profil akun yang sedang login.
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email wajib diisi.',
            'email.unique' => 'Email ini sudah digunakan oleh akun lain.',
        ]);

        $user->update([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Profil akun Anda berhasil diperbarui di database MySQL.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
        ]);
    }

    /**
     * Ganti kata sandi akun login.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ], [
            'current_password.required' => 'Kata sandi saat ini wajib diisi.',
            'password.required' => 'Kata sandi baru wajib diisi.',
            'password.min' => 'Kata sandi baru minimal 6 karakter.',
            'password.confirmed' => 'Konfirmasi kata sandi baru tidak cocok.',
        ]);

        if (!Hash::check($validated['current_password'], $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kata sandi saat ini yang Anda masukkan salah.',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kata sandi berhasil diperbarui dengan aman.',
        ]);
    }
}
