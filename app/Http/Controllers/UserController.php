<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Menampilkan daftar seluruh user dari MySQL.
     */
    public function index()
    {
        $users = User::orderByDesc('id')->get();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
        ]);
    }

    /**
     * Menyimpan user baru ke MySQL.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', 'string', 'in:admin,user'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'status' => $validated['status'],
            'password' => Hash::make($validated['password'] ?? 'password'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'User baru berhasil ditambahkan ke database MySQL.',
            'data' => $user,
        ], 201);
    }

    /**
     * Update data user di MySQL.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['required', 'string', 'in:admin,user'],
            'status' => ['required', 'string', 'in:active,inactive'],
            'password' => ['nullable', 'string', 'min:6'],
        ]);

        $updateData = [
            'name' => trim($validated['name']),
            'email' => strtolower(trim($validated['email'])),
            'role' => $validated['role'],
            'status' => $validated['status'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return response()->json([
            'success' => true,
            'message' => 'Data user berhasil diperbarui.',
            'data' => $user,
        ]);
    }

    /**
     * Mengubah status aktif/non-aktif user di MySQL.
     */
    public function toggleStatus($id)
    {
        $user = User::findOrFail($id);

        $newStatus = ($user->status === 'active') ? 'inactive' : 'active';
        $user->update(['status' => $newStatus]);

        return response()->json([
            'success' => true,
            'message' => "Status user {$user->name} berhasil diubah menjadi {$newStatus}.",
            'data' => $user,
        ]);
    }

    /**
     * Menghapus user dari database MySQL.
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
            ], 422);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => "User {$user->name} berhasil dihapus dari database.",
        ]);
    }
}
