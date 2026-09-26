<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Redirect users to their role home after login.
     */
    public function toResponse($request)
    {
        $user = $request->user();

        $home = $user && method_exists($user, 'isAdmin') && $user->isAdmin()
            ? '/admin/dashboard'
            : '/';

        return $request->wantsJson()
            ? response()->json(['two_factor' => false])
            : redirect()->intended($home);
    }
}
