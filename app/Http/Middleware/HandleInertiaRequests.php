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
        // Jumlah akun Pending — hanya dihitung jika ada user login sebagai admin
        $pendingUsersCount = 0;
        if ($request->user() && $request->user()->role === 'admin') {
            $pendingUsersCount = User::where('status', 'Pending')->count();
        }

        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id'          => $request->user()->id,
                    'name'        => $request->user()->name,
                    'email'       => $request->user()->email,
                    'role'        => $request->user()->role,
                    'status'      => $request->user()->status,
                    'csms_rig_id' => $request->user()->csms_rig_id,
                    'rig'         => $request->user()->rig ? [
                        'id'   => $request->user()->rig->id,
                        'name' => $request->user()->rig->name,
                        'code' => $request->user()->rig->code,
                    ] : null,
                ] : null,
            ],
            // Badge notifikasi akun pending untuk admin sidebar
            'pendingUsersCount' => $pendingUsersCount,
        ];
    }
}
