<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\CsmsRig;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Menampilkan daftar seluruh user dan master Rig dari MySQL.
     */
    public function index()
    {
        $users = User::with('rig')->orderByDesc('id')->get();
        $rigs  = CsmsRig::where('status', 'active')->orderBy('id')->get();

        $pendingCount = User::where('status', 'Pending')->count();

        return Inertia::render('Admin/UserManagement', [
            'users'        => $users,
            'rigs'         => $rigs,
            'pendingCount' => $pendingCount,
        ]);
    }

    /**
     * Menyimpan user baru ke MySQL (dibuat langsung Active oleh admin).
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role'        => ['required', 'string', 'in:admin,user'],
            'status'      => ['required', 'string', 'in:active,inactive,Active,Inactive,pending,Pending'],
            'password'    => ['required', 'string', 'min:6'],
            'csms_rig_id' => ['nullable', 'exists:csms_rigs,id'],
        ], [
            'name.required'     => 'Nama lengkap pengguna wajib diisi.',
            'email.required'    => 'Alamat email wajib diisi.',
            'email.email'       => 'Format alamat email tidak valid.',
            'email.unique'      => 'Alamat email ini sudah terdaftar di sistem.',
            'role.required'     => 'Pilih peran (role) pengguna.',
            'status.required'   => 'Status pengguna wajib ditentukan.',
            'password.required' => 'Kata sandi awal wajib diisi.',
            'password.min'      => 'Kata sandi minimal 6 karakter.',
            'csms_rig_id.exists'=> 'Unit Rig yang dipilih tidak valid di database.',
        ]);

        $rigId            = ($validated['role'] === 'user') ? ($validated['csms_rig_id'] ?? null) : null;
        $statusNormalized = ucfirst(strtolower($validated['status']));

        $user = User::create([
            'name'        => trim($validated['name']),
            'email'       => strtolower(trim($validated['email'])),
            'role'        => $validated['role'],
            'status'      => $statusNormalized,
            'csms_rig_id' => $rigId,
            'password'    => Hash::make($validated['password']),
        ]);

        // Jika admin membuat akun langsung active, tandai approved_by sebagai dirinya sendiri
        if ($statusNormalized === 'Active') {
            $user->update([
                'approved_by' => Auth::id(),
                'approved_at' => now(),
            ]);
        }

        $user->load('rig');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Pengguna baru {$user->name} berhasil ditambahkan ke database.",
                'data'    => $user,
            ], 201);
        }

        return redirect()->back()->with('success', "Pengguna baru {$user->name} berhasil ditambahkan.");
    }

    /**
     * Update data user di MySQL.
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'email'       => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role'        => ['required', 'string', 'in:admin,user'],
            'status'      => ['required', 'string', 'in:active,inactive,Active,Inactive,pending,Pending'],
            'password'    => ['nullable', 'string', 'min:6'],
            'csms_rig_id' => ['nullable', 'exists:csms_rigs,id'],
        ], [
            'name.required'      => 'Nama lengkap pengguna wajib diisi.',
            'email.required'     => 'Alamat email wajib diisi.',
            'email.email'        => 'Format email tidak valid.',
            'email.unique'       => 'Email ini sudah digunakan oleh akun lain.',
            'role.required'      => 'Pilih peran (role) pengguna.',
            'status.required'    => 'Status pengguna wajib ditentukan.',
            'password.min'       => 'Kata sandi baru minimal 6 karakter.',
            'csms_rig_id.exists' => 'Unit Rig yang dipilih tidak valid di database.',
        ]);

        // Cegah admin menonaktifkan / pending-kan akunnya sendiri
        if (auth()->id() === $user->id && in_array(strtolower($validated['status']), ['inactive', 'pending'])) {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Anda tidak dapat menonaktifkan atau men-pending akun Anda sendiri yang sedang aktif.',
                ], 422);
            }
            return redirect()->back()->withErrors(['status' => 'Anda tidak dapat mengubah status akun sendiri yang sedang digunakan.']);
        }

        $rigId            = ($validated['role'] === 'user') ? ($validated['csms_rig_id'] ?? null) : null;
        $statusNormalized = ucfirst(strtolower($validated['status']));

        $updateData = [
            'name'        => trim($validated['name']),
            'email'       => strtolower(trim($validated['email'])),
            'role'        => $validated['role'],
            'status'      => $statusNormalized,
            'csms_rig_id' => $rigId,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        // Jika admin mengubah status ke Active manual, rekam audit
        if ($statusNormalized === 'Active' && strtolower($user->status ?? '') !== 'active') {
            $updateData['approved_by'] = Auth::id();
            $updateData['approved_at'] = now();
        }

        $user->update($updateData);
        $user->load('rig');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Data pengguna {$user->name} berhasil diperbarui.",
                'data'    => $user,
            ]);
        }

        return redirect()->back()->with('success', "Data pengguna {$user->name} berhasil diperbarui.");
    }

    /**
     * ACC (Approve) akun yang sedang PENDING — hanya HSE Admin.
     */
    public function approve(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (strtolower($user->status ?? '') !== 'pending') {
            if ($request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Akun ini tidak dalam status Pending, tidak perlu di-ACC.',
                ], 422);
            }
            return redirect()->back()->withErrors(['status' => 'Akun ini tidak dalam status Pending.']);
        }

        $user->update([
            'status'      => 'Active',
            'approved_by' => Auth::id(),
            'approved_at' => now(),
            'rejection_reason' => null,
        ]);

        $user->load('rig');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Akun {$user->name} ({$user->email}) berhasil di-ACC dan sekarang aktif.",
                'data'    => $user,
            ]);
        }

        return redirect()->back()->with('success', "Akun {$user->name} berhasil di-ACC dan sekarang aktif.");
    }

    /**
     * Tolak akun yang sedang PENDING — hanya HSE Admin.
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:500'],
        ]);

        $user = User::findOrFail($id);

        $user->update([
            'status'           => 'Rejected',
            'rejection_reason' => $validated['reason'] ?? 'Ditolak oleh HSE Admin.',
        ]);

        $user->load('rig');

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Akun {$user->name} ({$user->email}) ditolak.",
                'data'    => $user,
            ]);
        }

        return redirect()->back()->with('success', "Akun {$user->name} telah ditolak.");
    }

    /**
     * Toggle status akun Active ↔ Inactive (tidak berlaku untuk Pending).
     */
    public function toggleStatus(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menonaktifkan akun Anda sendiri yang sedang aktif digunakan.',
            ], 422);
        }

        $currentStatus = strtolower($user->status ?? 'active');

        if ($currentStatus === 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'Gunakan tombol ACC/Tolak untuk akun dengan status Pending.',
            ], 422);
        }

        $isCurrentlyActive = $currentStatus === 'active';
        $newStatus         = $isCurrentlyActive ? 'Inactive' : 'Active';

        $updateData = ['status' => $newStatus];
        if ($newStatus === 'Active') {
            $updateData['approved_by'] = Auth::id();
            $updateData['approved_at'] = now();
        }

        $user->update($updateData);
        $user->load('rig');

        $statusLabel = $newStatus === 'Active' ? 'diaktifkan' : 'dinonaktifkan';

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Akun {$user->name} berhasil {$statusLabel}.",
                'data'    => $user,
            ]);
        }

        return redirect()->back()->with('success', "Akun {$user->name} berhasil {$statusLabel}.");
    }

    /**
     * Menghapus user dari database MySQL.
     */
    public function destroy(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if (auth()->id() === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif digunakan.',
            ], 422);
        }

        $name = $user->name;
        $user->delete();

        if ($request->wantsJson()) {
            return response()->json([
                'success' => true,
                'message' => "Pengguna {$name} berhasil dihapus dari database.",
            ]);
        }

        return redirect()->back()->with('success', "Pengguna {$name} berhasil dihapus.");
    }
}
