<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (!Auth::check()) {
            return redirect()->route('login')->withErrors([
                'email' => 'Sesi Anda belum aktif atau telah berakhir. Harap login terlebih dahulu.',
            ]);
        }

        $user = Auth::user();

        // Normalisasi dan split roles jika didefinisikan sebagai string terpisah koma atau pipe (misal 'role:user,admin')
        $allowedRoles = [];
        foreach ($roles as $role) {
            foreach (preg_split('/[,|]/', (string)$role) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $allowedRoles[] = $trimmed;
                }
            }
        }

        // If specific roles are required and user does not have any of them
        if (!empty($allowedRoles) && !in_array($user->role, $allowedRoles, true)) {
            // If user is field user trying to access admin area
            if ($user->role === 'user') {
                $targetRigId = $user->csms_rig_id ?? 1;
                return redirect()->route('csms.user-rig-input', ['rig_id' => $targetRigId])
                    ->with('error', 'Akses ditolak: Akun Anda tidak memiliki hak akses Administrator.');
            }

            // If admin trying to access restricted user area (or other roles)
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
