<?php

namespace App\Http\Middleware;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user();
        $isAdmin = $user && $user->role === 'admin';

        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $user ? [
                    'id'          => $user->id,
                    'name'        => $user->name,
                    'email'       => $user->email,
                    'role'        => $user->role,
                    'status'      => $user->status,
                    'hfo_name'    => session('hfo_name') ?: session('logged_hfo_name'),
                    'csms_rig_id' => $user->csms_rig_id,
                    'rig'         => ($user->csms_rig_id && $user->rig) ? [
                        'id'   => $user->rig->id,
                        'name' => $user->rig->name,
                        'code' => $user->rig->code,
                    ] : null,
                ] : null,
            ],
            // Badge notifikasi admin di-cache 30-60 detik agar tidak query berulang di setiap klik menu
            'pendingUsersCount' => fn () => $isAdmin
                ? cache()->remember('admin_pending_users_count', 30, fn () => User::where('status', 'Pending')->count())
                : 0,
            'archivedRigsCount' => fn () => $isAdmin
                ? cache()->remember('admin_archived_rigs_count', 60, fn () => \App\Models\CsmsRig::where('status', 'archived')->count())
                : 0,
            // Flash messages global
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error'   => fn () => $request->session()->get('error'),
                'warning' => fn () => $request->session()->get('warning'),
                'info'    => fn () => $request->session()->get('info'),
                'status'  => fn () => $request->session()->get('status'),
            ],
        ];
    }
}
