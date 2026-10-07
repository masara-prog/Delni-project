<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tourist;
use App\Models\TourGuide;
use App\Models\TransportationCompany;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Unified Login for all 5 roles: tourist, guide, transport, driver, admin
     */
    public function login(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:tourist,guide,transport,driver,admin',
            'login' => 'required|string', // email, phone, or license/contract number
            'password' => 'required|string',
        ]);

        $role = $validated['role'];
        $login = $validated['login'];
        $password = $validated['password'];

        $user = null;
        $token = null;

        switch ($role) {
            case 'tourist':
                $user = Tourist::where('email', $login)
                    ->orWhere('phone_number', $login)
                    ->orWhere('tourist_id', $login)
                    ->first();

                if ($user && ($user->password === $password || Hash::check($password, $user->password))) {
                    $token = $user->createToken('tourist-token', ['role:tourist'])->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'tourist',
                        'user' => $user,
                        'token' => $token,
                    ]);
                }
                break;

            case 'guide':
                $user = TourGuide::where('email', $login)
                    ->orWhere('phone_number', $login)
                    ->orWhere('license_number', $login)
                    ->first();

                if ($user && ($user->password === $password || Hash::check($password, $user->password))) {
                    $token = $user->createToken('guide-token', ['role:guide'])->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'guide',
                        'user' => $user,
                        'token' => $token,
                    ]);
                }
                break;

            case 'transport':
                $user = TransportationCompany::where('email', $login)
                    ->orWhere('phone_number', $login)
                    ->orWhere('contract_number', $login)
                    ->first();

                if ($user && ($user->password === $password || Hash::check($password, $user->password))) {
                    $token = $user->createToken('transport-token', ['role:transport'])->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'transport',
                        'user' => $user,
                        'token' => $token,
                    ]);
                }
                break;

            case 'driver':
                $user = Driver::where('email', $login)
                    ->orWhere('phone_number', $login)
                    ->orWhere('driver_license_number', $login)
                    ->first();

                if ($user && ($user->password === $password || Hash::check($password, $user->password))) {
                    $token = $user->createToken('driver-token', ['role:driver'])->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'driver',
                        'user' => $user,
                        'token' => $token,
                    ]);
                }
                break;

            case 'admin':
                $user = User::where('email', $login)->first();
                if ($user && ($user->password === $password || Hash::check($password, $user->password))) {
                    $token = $user->createToken('admin-token', ['role:admin'])->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'admin',
                        'user' => $user,
                        'token' => $token,
                    ]);
                }
                break;
        }

        return response()->json([
            'status' => 'error',
            'message' => 'بيانات تسجيل الدخول غير صحيحة، يرجى التأكد من البريد أو كلمة المرور',
        ], 401);
    }

    /**
     * Register a new Tourist
     */
    public function registerTourist(Request $request)
    {
        $validated = $request->validate([
            'tourist_id' => 'required|string|max:50|unique:tourists,tourist_id',
            'full_name' => 'required|string|max:100',
            'email' => 'required|email|max:100|unique:tourists,email',
            'phone_number' => 'required|string|max:20|unique:tourists,phone_number',
            'password' => 'required|string|min:6',
        ]);

        $tourist = Tourist::create([
            'tourist_id' => $validated['tourist_id'],
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone_number' => $validated['phone_number'],
            'password' => bcrypt($validated['password']),
        ]);

        $token = $tourist->createToken('tourist-token', ['role:tourist'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء حساب السائح بنجاح',
            'user' => $tourist,
            'token' => $token,
        ], 201);
    }

    /**
     * Register a new Tour Guide
     */
    public function registerGuide(Request $request)
    {
        $validated = $request->validate([
            'license_number' => 'required|string|max:50|unique:tour_guides,license_number',
            'full_name' => 'required|string|max:100',
            'phone_number' => 'required|string|max:20|unique:tour_guides,phone_number',
            'years_of_experience' => 'required|integer|min:2',
            'certificate' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'speaks_english' => 'boolean',
            'speaks_french' => 'boolean',
            'speaks_italian' => 'boolean',
            'email' => 'required|email|max:100|unique:tour_guides,email',
            'password' => 'required|string|min:6',
            'gender' => 'nullable|string|max:10',
            'working_days' => 'nullable|string',
            'operating_regions' => 'nullable|string',
            'primaryRegion' => 'nullable|string|max:50',
            'price_per_day' => 'nullable|numeric|min:0',
            'title' => 'nullable|string|max:100',
            'specialties' => 'nullable|string',
        ]);

        $guide = TourGuide::create([
            'license_number' => $validated['license_number'],
            'full_name' => $validated['full_name'],
            'phone_number' => $validated['phone_number'],
            'years_of_experience' => $validated['years_of_experience'],
            'certificate' => $validated['certificate'],
            'bio' => $validated['bio'] ?? null,
            'speaks_english' => $validated['speaks_english'] ?? false,
            'speaks_french' => $validated['speaks_french'] ?? false,
            'speaks_italian' => $validated['speaks_italian'] ?? false,
            'verification_status' => 'بانتظار التحقق',
            'password' => bcrypt($validated['password']),
            'email' => $validated['email'],
            'gender' => $validated['gender'] ?? null,
            'working_days' => $validated['working_days'] ?? null,
            'operating_regions' => $validated['operating_regions'] ?? null,
            'primaryRegion' => $validated['primaryRegion'] ?? null,
            'price_per_day' => $validated['price_per_day'] ?? null,
            'title' => $validated['title'] ?? null,
            'specialties' => $validated['specialties'] ?? null,
            'total_tours_completed' => 0,
        ]);

        $token = $guide->createToken('guide-token', ['role:guide'])->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'تم تسجيل طلب انضمام المرشد السياحي وهو قيد المراجعة',
            'user' => $guide,
            'token' => $token,
        ], 201);
    }
}
