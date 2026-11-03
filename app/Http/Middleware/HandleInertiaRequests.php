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
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user() ? [
                    'id'          => $request->user()->id,
                    'name'        => $request->user()->name,
                    'email'       => $request->user()->email,
                    'role'        => $request->user()->role,
                    'status'      => $request->user()->status,
                    'hfo_name'    => session('hfo_name') ?: session('logged_hfo_name'),
                    'csms_rig_id' => $request->user()->csms_rig_id,
                    'rig'         => $request->user()->rig ? [
                        'id'   => $request->user()->rig->id,
                        'name' => $request->user()->rig->name,
                        'code' => $request->user()->rig->code,
                    ] : null,
                ] : null,
            ],
            // Badge notifikasi untuk admin sidebar — dihitung secara lazy hanya jika user login sebagai admin
            'pendingUsersCount' => fn () => ($request->user() && $request->user()->role === 'admin')
                ? User::where('status', 'Pending')->count()
                : 0,
            'archivedRigsCount' => fn () => ($request->user() && $request->user()->role === 'admin')
                ? \App\Models\CsmsRig::where('status', 'archived')->count()
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
