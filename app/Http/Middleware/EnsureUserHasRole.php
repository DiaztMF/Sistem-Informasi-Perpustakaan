<?php

namespace App\Http\Middleware;

use App\Enums\Role;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return redirect()->guest(route('login'));
        }

        $userRole = $user->role instanceof Role ? $user->role->value : (string) $user->role;

        $allowedRoles = array_map(
            fn ($r) => $r instanceof Role ? $r->value : (string) $r,
            $roles
        );

        if (! in_array($userRole, $allowedRoles, true)) {
            if (in_array('admin', $allowedRoles, true) && $userRole !== 'admin') {
                abort(403, 'Akses khusus administrator.');
            }

            if (in_array('siswa', $allowedRoles, true) && $userRole !== 'siswa') {
                abort(403, 'Akses khusus siswa.');
            }

            abort(403, 'Akses ditolak.');
        }

        return $next($request);
    }
}
