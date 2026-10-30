<?php

namespace App\Http\Middleware;

use App\Support\Actor;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * role:tourist,admin — the request needs a valid token of one of these roles (the admin may always be listed).
 * For every role except the admin, the account can only act as itself:
 *  - an id in the URL ({touristId}, {licenseNumber}, {contractNumber}, {driverLicenseNumber}) must be its own id
 *  - its own id is written into the request field the controllers read (tourist_id, license_number, ...),
 *    so a body that names another account is ignored.
 */
class RequireRole
{
    private const ROUTE_IDS = ['touristId', 'licenseNumber', 'contractNumber', 'driverLicenseNumber'];

    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $role = Actor::role();
        if ($role === null) {
            return response()->json(['success' => false, 'status' => 'error',
                'message' => 'يرجى تسجيل الدخول أولاً', 'error' => 'يرجى تسجيل الدخول أولاً'], 401);
        }
        if (!in_array($role, $roles, true)) {
            return $this->forbidden();
        }
        if ($role === 'admin') {
            return $next($request);
        }

        $user = Actor::user();
        // A guide whose approval was withdrawn keeps no access, even with an older token
        if ($role === 'guide' && $user->verification_status !== 'موثق') {
            return $this->forbidden('حسابك كمرشد غير معتمد من إدارة المنصة');
        }

        $id = Actor::id();
        foreach (self::ROUTE_IDS as $param) {
            $value = $request->route($param);
            if ($value !== null && (string) $value !== $id) {
                return $this->forbidden();
            }
        }
        $request->merge([Actor::ID_FIELDS[$role] => $id]);
        $request->query->set(Actor::ID_FIELDS[$role], $id);

        return $next($request);
    }

    private function forbidden(string $message = 'ليست لديك صلاحية لتنفيذ هذا الإجراء'): Response
    {
        return response()->json(['success' => false, 'status' => 'error', 'message' => $message, 'error' => $message], 403);
    }
}
