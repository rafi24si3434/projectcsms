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

        // If specific roles are required and user does not have any of them
        if (!empty($roles) && !in_array($user->role, $roles)) {
            // If user is field user trying to access admin area
            if ($user->role === 'user') {
                return redirect()->route('user.input-data')->with('error', 'Akses ditolak: Akun Anda tidak memiliki hak akses Administrator.');
            }

            // If admin trying to access restricted user area (or other roles)
            return redirect()->route('admin.dashboard');
        }

        return $next($request);
    }
}
