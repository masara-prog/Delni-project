<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tourist;
use App\Models\TourGuide;
use App\Models\TransportationCompany;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Support\Base64Image;
use App\Support\Actor;
use App\Support\Passwords;

class AuthController extends Controller
{
    use JsonApiResponses;

    /**
     * Unified Login for all 5 roles: tourist, guide, transport, driver, admin
     */
    // When a token issued now stops working (config/sanctum.php "expiration", in minutes)
    private static function tokenExpiresAt(): \Illuminate\Support\Carbon
    {
        return now()->addMinutes((int) config('sanctum.expiration', 43200));
    }

    /**
     * GET /auth/me — the signed-in account (from its token only): role, id and basic profile.
     * Nobody can read another account here: there is no id parameter.
     */
    public function me(Request $request)
    {
        $user = Actor::user();
        $token = $user?->currentAccessToken();
        $profile = $user->toArray();
        // documents and images can be large; the app loads them where it needs them
        unset($profile['digital_certificate_file']);
        return response()->json([
            'success' => true,
            'role' => Actor::role(),
            'id' => Actor::id() ?? (string) $user->getKey(),
            'user' => $profile,
            'token_expires_at' => $token?->expires_at?->toIso8601String(),
        ]);
    }

    /**
     * POST /auth/logout — ends this device's session on the server: the token is expired now, so it is
     * refused from then on. The token row is kept (records are not deleted), only its expiry is set.
     */
    public function logout(Request $request)
    {
        $token = Actor::user()?->currentAccessToken();
        if ($token && method_exists($token, 'forceFill')) {
            $token->forceFill(['expires_at' => now()])->save();
        }
        return response()->json(['success' => true, 'status' => 'success', 'message' => 'تم تسجيل الخروج بنجاح']);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:tourist,guide,transport,driver,admin',
            'login' => 'required|email', // every account type signs in with its email only
            'password' => 'required|string',
        ]);

        $role = $validated['role'];
        $login = $validated['login'];
        $password = $validated['password'];

        $user = null;
        $token = null;

        switch ($role) {
            case 'tourist':
                $user = Tourist::where('email', $login)->first();

                if ($user && Passwords::matches($password, $user->password)) {
                    $token = $user->createToken('tourist-token', ['role:tourist'], self::tokenExpiresAt())->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'tourist',
                        'user' => $user,
                        'token' => $token,
                        'expires_at' => self::tokenExpiresAt()->toIso8601String(),
                    ]);
                }
                break;

            case 'guide':
                $user = TourGuide::where('email', $login)->first();

                if ($user && Passwords::matches($password, $user->password)) {
                    // Only guides approved by the admin can sign in
                    if ($user->verification_status !== 'موثق') {
                        // A rejected guide is told here and can resubmit (POST /auth/guide/resubmit)
                        $rejected = $user->verification_status === 'مرفوض';
                        return response()->json([
                            'status' => 'error',
                            'message' => $rejected
                                ? 'تم رفض طلب اعتماد حسابك كمرشد سياحي. يمكنك تصحيح وثيقة الترخيص وإعادة تقديم الطلب.'
                                : 'الحساب قيد المراجعة: لم تعتمد إدارة المنصة حسابك كمرشد سياحي بعد، ولا يمكنك الدخول إلى لوحتك قبل الاعتماد. سيتم إشعارك فور اعتماده.',
                            'verification_status' => $user->verification_status,
                            'can_resubmit' => $rejected,
                        ], 403);
                    }
                    $token = $user->createToken('guide-token', ['role:guide'], self::tokenExpiresAt())->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'guide',
                        'user' => $user,
                        'token' => $token,
                        'expires_at' => self::tokenExpiresAt()->toIso8601String(),
                    ]);
                }
                break;

            case 'transport':
                $user = TransportationCompany::where('email', $login)->first();

                if ($user && Passwords::matches($password, $user->password)) {
                    // A company the admin suspended keeps its records but cannot use the platform
                    if ($user->verification_status === 'موقوفة') {
                        return response()->json([
                            'status' => 'error',
                            'message' => 'حساب شركة النقل موقوف من قبل إدارة المنصة. يرجى التواصل مع الإدارة.',
                        ], 403);
                    }
                    $token = $user->createToken('transport-token', ['role:transport'], self::tokenExpiresAt())->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'transport',
                        'user' => $user,
                        'token' => $token,
                        'expires_at' => self::tokenExpiresAt()->toIso8601String(),
                    ]);
                }
                break;

            case 'driver':
                $user = Driver::where('email', $login)->first();

                if ($user && Passwords::matches($password, $user->password)) {
                    // A driver suspended by the company, or working for a suspended company, cannot sign in
                    if ($blocked = $user->blockedReason()) {
                        return response()->json(['status' => 'error', 'message' => $blocked], 403);
                    }
                    $token = $user->createToken('driver-token', ['role:driver'], self::tokenExpiresAt())->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'driver',
                        'user' => $user,
                        'token' => $token,
                        'expires_at' => self::tokenExpiresAt()->toIso8601String(),
                    ]);
                }
                break;

            case 'admin':
                $user = User::where('email', $login)->first();
                if ($user && Passwords::matches($password, $user->password)) {
                    $token = $user->createToken('admin-token', ['role:admin'], self::tokenExpiresAt())->plainTextToken;
                    return response()->json([
                        'status' => 'success',
                        'role' => 'admin',
                        'user' => $user,
                        'token' => $token,
                        'expires_at' => self::tokenExpiresAt()->toIso8601String(),
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
            'full_name' => 'required|string|max:150',
            'email' => 'required|email|max:100|unique:tourists,email',
            'phone_number' => 'required|string|max:20|unique:tourists,phone_number',
            'password' => 'required|string|min:6',
        ], [
            'tourist_id.required' => 'رقم جواز السفر أو الرقم الوطني مطلوب',
            'tourist_id.unique' => 'رقم جواز السفر / الرقم الوطني مسجل مسبقاً',
            'full_name.required' => 'الاسم الكامل مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً',
            'phone_number.required' => 'رقم الهاتف مطلوب',
            'phone_number.unique' => 'رقم الهاتف مسجل مسبقاً',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن لا تقل عن 6 أحرف',
        ]);

        $tourist = Tourist::create([
            'tourist_id' => trim($validated['tourist_id']),
            'full_name' => $validated['full_name'],
            'email' => strtolower($validated['email']),
            'phone_number' => $validated['phone_number'],
            'password' => bcrypt($validated['password']),
        ]);

        $token = $tourist->createToken('tourist-token', ['role:tourist'], self::tokenExpiresAt())->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء حساب السائح بنجاح',
            'user' => $tourist,
            'token' => $token,
            'expires_at' => self::tokenExpiresAt()->toIso8601String(),
        ], 201);
    }

    /**
     * Update Tourist Profile in DelniDB
     */
    public function updateTouristProfile(Request $request)
    {
        $touristId = (string) $request->input('tourist_id');
        $validated = $request->validate([
            'tourist_id' => 'required|string|exists:tourists,tourist_id',
            'full_name' => 'required|string|max:150',
            'email' => ['required', 'email', 'max:100', Rule::unique('tourists', 'email')->ignore($touristId, 'tourist_id')],
            'phone_number' => ['required', 'string', 'max:20', Rule::unique('tourists', 'phone_number')->ignore($touristId, 'tourist_id')],
            'password' => 'nullable|string|min:6',
        ], [
            'tourist_id.exists' => 'حساب السائح غير موجود',
            'full_name.required' => 'الاسم الكامل مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً لحساب آخر',
            'phone_number.required' => 'رقم الهاتف مطلوب',
            'phone_number.unique' => 'رقم الهاتف مسجل مسبقاً لحساب آخر',
            'password.min' => 'كلمة المرور يجب أن لا تقل عن 6 أحرف',
        ]);

        $tourist = Tourist::where('tourist_id', $validated['tourist_id'])->firstOrFail();

        $updateData = [
            'full_name' => $validated['full_name'],
            'email' => strtolower($validated['email']),
            'phone_number' => $validated['phone_number'],
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = bcrypt($validated['password']);
        }

        $tourist->update($updateData);

        return response()->json([
            'status' => 'success',
            'message' => 'تم تحديث بيانات ملف السائح بنجاح',
            'user' => $tourist->fresh(),
        ]);
    }

    /**
     * Register a new Tour Guide. The account stays «قيد المراجعة» until the admin approves it, so no token is issued here.
     */
    public function registerGuide(Request $request)
    {
        $validated = $request->validate([
            'license_number' => 'required|string|max:50|unique:tour_guides,license_number',
            'full_name' => 'required|string|max:150',
            'phone_number' => 'required|string|max:20|unique:tour_guides,phone_number',
            'years_of_experience' => 'required|integer|min:2|max:40',
            'digital_certificate_file' => 'nullable|string',
            'bio' => 'nullable|string',
            'speaks_english' => 'boolean',
            'speaks_french' => 'boolean',
            'speaks_italian' => 'boolean',
            'email' => 'required|email|max:100|unique:tour_guides,email',
            'password' => 'required|string|min:6',
            'gender' => 'nullable|string|max:10',
            'license_expiry_date' => 'required|date_format:Y-m-d|after:today',
            'working_days' => 'nullable',
            'place_ids' => 'required|array|min:1',
            'place_ids.*' => 'string|max:50|exists:places_tourist,place_id',
            'price_per_day' => 'nullable|numeric|min:0',
            'avatar' => 'nullable|string',
        ], [
            'place_ids.required' => 'يرجى اختيار مكان عمل واحد على الأقل من المعالم السياحية المسجلة في المنصة',
            'place_ids.min' => 'يرجى اختيار مكان عمل واحد على الأقل من المعالم السياحية المسجلة في المنصة',
            'place_ids.*.exists' => 'أحد أماكن العمل المختارة غير مسجل ضمن معالم المنصة',
            'license_number.required' => 'رقم ترخيص المرشد مطلوب',
            'license_number.unique' => 'رقم ترخيص المرشد مسجل مسبقاً في المنصة',
            'full_name.required' => 'الاسم الكامل مطلوب',
            'phone_number.required' => 'رقم الهاتف مطلوب',
            'phone_number.unique' => 'رقم الهاتف مسجل مسبقاً لمرشد آخر',
            'years_of_experience.required' => 'سنوات الخبرة مطلوبة',
            'years_of_experience.min' => 'سنوات الخبرة السياحية للمرشد يجب أن تكون سنتين على الأقل',
            'years_of_experience.max' => 'سنوات الخبرة لا يمكن أن تتجاوز 40 سنة',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'صيغة البريد الإلكتروني غير صحيحة',
            'email.unique' => 'البريد الإلكتروني مسجل مسبقاً لمرشد آخر',
            'password.required' => 'كلمة المرور مطلوبة',
            'password.min' => 'كلمة المرور يجب أن لا تقل عن 6 أحرف',
            'license_expiry_date.required' => 'تاريخ انتهاء ترخيص الإرشاد مطلوب',
            'license_expiry_date.date_format' => 'تاريخ انتهاء الترخيص غير صحيح',
            'license_expiry_date.after' => 'تاريخ انتهاء الترخيص يجب أن يكون تاريخاً قادماً؛ الترخيص المنتهي لا يُقبل',
        ]);

        // Working days and workplaces (landmarks registered on the platform) live in guide_working_days / guide_places
        $guide = DB::transaction(function () use ($validated) {
            $lic = trim($validated['license_number']);
            $guide = TourGuide::create([
                'license_number' => $lic,
                'full_name' => trim($validated['full_name']),
                'phone_number' => trim($validated['phone_number']),
                'years_of_experience' => $validated['years_of_experience'],
                'digital_certificate_file' => $validated['digital_certificate_file'] ?? null,
                'bio' => $validated['bio'] ?? null,
                'speaks_english' => $validated['speaks_english'] ?? false,
                'speaks_french' => $validated['speaks_french'] ?? false,
                'speaks_italian' => $validated['speaks_italian'] ?? false,
                'verification_status' => 'قيد المراجعة',
                'password' => Hash::make($validated['password']),
                'email' => strtolower(trim($validated['email'])),
                'gender' => $validated['gender'] ?? null,
                'price_per_day' => $validated['price_per_day'] ?? null,
                'license_expiry_date' => $validated['license_expiry_date'],
                'availability_status' => TourGuide::AVAILABLE,
                'avatar' => Base64Image::store($validated['avatar'] ?? null, "guide-{$lic}", 'guides'),
            ]);
            $guide->replaceWorkingDays($validated['working_days'] ?? null);
            $guide->replacePlaces($validated['place_ids'] ?? []);

            $this->notify("guide_reg_{$lic}", 'admin', null, 'system',
                "🧑‍💼 طلب تسجيل مرشد سياحي جديد ({$guide->full_name})",
                "قدم المرشد ({$guide->full_name}) برقم ترخيص ({$lic}) طلباً للانضمام إلى منصة دَلّني، وبياناته ووثائقه بانتظار مراجعة وتدقيق الإدارة لاتخاذ قرار الاعتماد أو الرفض.",
                '/dashboard/admin');
            return $guide;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'تم إرسال طلب تسجيلك كمرشد سياحي بنجاح، وهو الآن قيد مراجعة وتدقيق الإدارة',
            'user' => $guide->fresh(),
        ], 201);
    }

    /**
     * A rejected guide sends a corrected licence document (and its expiry date) with their sign-in credentials;
     * the application goes back to «قيد المراجعة» and the admin is told. No token is issued.
     */
    public function resubmitGuide(Request $request)
    {
        $data = $this->validateArabic($request, [
            'login' => 'required|email',
            'password' => 'required|string',
            'digital_certificate_file' => 'required|string',
            'license_expiry_date' => 'required|date_format:Y-m-d|after:today',
            'note' => 'nullable|string|max:1000',
        ], ['login' => 'البريد الإلكتروني', 'password' => 'كلمة المرور', 'digital_certificate_file' => 'وثيقة الترخيص',
            'license_expiry_date' => 'تاريخ انتهاء الترخيص', 'note' => 'الملاحظة']);
        if ($data instanceof \Illuminate\Http\JsonResponse) {
            return $data;
        }
        $guide = TourGuide::where('email', $data['login'])->first();
        if (!$guide || !Passwords::matches($data['password'], $guide->password)) {
            return $this->error('بيانات تسجيل الدخول غير صحيحة', 401);
        }
        if ($guide->verification_status !== 'مرفوض') {
            return $this->error('إعادة تقديم الطلب متاحة للطلبات المرفوضة فقط', 409);
        }

        DB::transaction(function () use ($guide, $data) {
            $guide->update([
                'digital_certificate_file' => $data['digital_certificate_file'],
                'license_expiry_date' => $data['license_expiry_date'],
                'verification_status' => 'قيد المراجعة',
            ]);
            $note = trim((string) ($data['note'] ?? ''));
            $this->notify("guide_resubmit_{$guide->license_number}_" . now('Africa/Tripoli')->format('YmdHis'), 'admin', null, 'system',
                "🔁 أعاد المرشد ({$guide->full_name}) تقديم طلب الاعتماد",
                "حدّث المرشد ({$guide->full_name}) برقم ترخيص ({$guide->license_number}) وثيقة الترخيص بعد رفض طلبه، والطلب الآن بانتظار المراجعة."
                    . ($note !== '' ? " ملاحظة المرشد: {$note}" : ''),
                '/dashboard/admin');
        });

        return response()->json(['success' => true, 'status' => 'success',
            'message' => 'تم إرسال طلبك من جديد، وهو الآن قيد مراجعة الإدارة. سيتم إشعارك فور اتخاذ القرار.']);
    }
}
