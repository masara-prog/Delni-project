<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\Driver;
use App\Models\TransportationCompany;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Transport module (companies, vehicles, drivers) stored through Laravel.
 * Responses keep the bridge's shape ({ success, data | message | error }) so the frontend contract stays the same.
 * Saved records are never deleted; companies, vehicles and drivers are deactivated through their status fields.
 */
class TransportController extends Controller
{
    use JsonApiResponses;

    // Placeholder the forms send when a password was not changed
    private const MASKED_PASSWORD = '••••••••';
    public const VEHICLE_CATEGORIES = ['حافلة سياحية', 'ميني باص', 'باص VIP'];

    /* ===================== Companies ===================== */

    public function companies(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => TransportationCompany::orderBy('company_name')->get()]);
    }

    public function saveCompany(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'contract_number' => 'required|string|max:50',
                'company_name' => 'required|string|max:150',
                'phone_number' => 'required|string|max:20',
                'email' => 'required|email|max:100',
                'password' => 'nullable|string',
                'total_vehicles' => 'nullable|integer|min:0',
                'city' => 'nullable|string|max:100',
                'verification_status' => 'nullable|string|max:50',
                'google_maps_url' => 'nullable|string|max:500',
                'address' => 'nullable|string',
                'contract_start_date' => 'nullable|date',
                'contract_end_date' => 'nullable|date',
                'isNew' => 'nullable|boolean',
            ]);
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        $contract = trim($data['contract_number']);
        $existing = TransportationCompany::find($contract);
        if ($existing && !empty($data['isNew'])) {
            return $this->error('رقم عقد شركة النقل مسجل مسبقاً لشركة أخرى', 409);
        }
        if ($this->taken(TransportationCompany::class, 'phone_number', $data['phone_number'], 'contract_number', $contract)) {
            return $this->error('رقم هاتف الشركة مسجل مسبقاً لشركة أخرى', 409);
        }

        // The password is set once when the account is created; afterwards only the company changes it (changePassword)
        $password = $existing ? null : $this->newPassword($data['password'] ?? null);
        if (!$existing && !$password) {
            return $this->error('كلمة المرور مطلوبة لحساب الشركة الجديد (6 خانات على الأقل)', 422);
        }
        $totalVehicles = $data['total_vehicles'] ?? null;
        if ($existing && $totalVehicles !== null && $totalVehicles < ($registered = Vehicle::where('contract_number', $contract)->count())) {
            return $this->error("لا يمكن أن يكون عدد مركبات العقد أقل من المركبات المسجلة فعلياً للشركة ({$registered})", 422);
        }

        // The map link may arrive in "address" from older forms
        $mapsUrl = $data['google_maps_url'] ?? null;
        if (!$mapsUrl && !empty($data['address']) && (str_contains($data['address'], 'http') || str_contains($data['address'], 'maps'))) {
            $mapsUrl = $data['address'];
        }

        $values = [
            'company_name' => trim($data['company_name']),
            'phone_number' => trim($data['phone_number']),
            'email' => trim($data['email']),
            'total_vehicles' => $data['total_vehicles'] ?? ($existing->total_vehicles ?? 1),
            'city' => $data['city'] ?? ($existing->city ?? 'طرابلس'),
            'verification_status' => $data['verification_status'] ?? ($existing->verification_status ?? 'نشطة'),
            'contract_start_date' => $data['contract_start_date'] ?? ($existing->contract_start_date ?? now('Africa/Tripoli')->toDateString()),
            'contract_end_date' => $data['contract_end_date'] ?? ($existing->contract_end_date ?? null),
        ];
        if ($mapsUrl) {
            $values['google_maps_url'] = $mapsUrl;
        }
        if ($password) {
            $values['password'] = $password;
        }

        DB::transaction(function () use ($contract, $values, $existing) {
            TransportationCompany::updateOrCreate(['contract_number' => $contract], $values);
            if (!$existing) {
                $this->notify('company-reg-' . $contract, 'admin', null, 'system',
                    "🏢 تسجيل شركة نقل سياحي جديدة ({$values['company_name']})",
                    "تم تسجيل وتوثيق شركة نقل جديدة ({$values['company_name']}) برقم عقد ({$contract}) في مدينة ({$values['city']}).",
                    '/dashboard/admin');
                $this->notify('company-welcome-' . $contract, 'company', $contract, 'system',
                    '🎉 مرحباً بكم في منصة دلني للسياحة الليبية',
                    "تم توثيق وتفعيل حساب شركة ({$values['company_name']}) بنجاح. يمكنك الآن إدارة أسطول الحافلات والمركبات والسائقين واستقبال طلبات النقل.",
                    '/dashboard/transport');
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ شركة النقل بنجاح',
            'data' => TransportationCompany::find($contract)], 201);
    }

    // Only the account owner changes its password: the current password must be entered first
    public function changeCompanyPassword(Request $request, string $contractNumber): JsonResponse
    {
        return $this->changePassword($request, TransportationCompany::find($contractNumber), 'حساب شركة النقل غير موجود');
    }

    public function changeDriverPassword(Request $request, string $licenseNumber): JsonResponse
    {
        return $this->changePassword($request, Driver::find($licenseNumber), 'حساب السائق غير موجود');
    }

    // The driver reports the current stage of the trip on their vehicle; the company and the admin see it
    public function updateTripStage(Request $request, string $licenseNumber): JsonResponse
    {
        $driver = Driver::find($licenseNumber);
        if (!$driver) {
            return $this->error('حساب السائق غير موجود', 404);
        }
        $stage = (string) $request->input('stage', '');
        if (!in_array($stage, Driver::TRIP_STAGES, true)) {
            return $this->error('مرحلة الرحلة غير صحيحة', 422);
        }
        if (!$driver->assigned_vehicle_plate) {
            return $this->error('لا توجد مركبة مسندة إليك، فلا يمكن تحديث مرحلة رحلة', 409);
        }
        $driver->forceFill(['current_trip_stage' => $stage])->save();
        return response()->json(['success' => true, 'message' => "تم تحديث مرحلة الرحلة: {$stage}", 'data' => ['current_trip_stage' => $stage]]);
    }

    /* ===================== Vehicles ===================== */

    public function vehicles(Request $request): JsonResponse
    {
        $query = Vehicle::query()
            ->leftJoin('transportation_companies as c', 'vehicles.contract_number', '=', 'c.contract_number')
            ->select('vehicles.*', 'c.company_name', 'c.city as company_city', 'c.city as city')
            ->orderBy('vehicles.plate_number');
        if ($request->filled('contract_number')) {
            $query->where('vehicles.contract_number', $request->input('contract_number'));
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function saveVehicle(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'plate_number' => 'required|string|max:30',
                'contract_number' => 'required|string|max:50',
                'vehicle_type' => 'required|string|max:100',
                'seating_capacity' => 'nullable|integer|min:1',
                'daily_rate' => 'nullable|numeric|min:0',
                'category' => 'nullable|string|in:' . implode(',', self::VEHICLE_CATEGORIES),
                'vehicle_status' => 'nullable|string|max:50',
                'insurance_image' => 'nullable|string',
                'vehicle_image' => 'nullable|string',
                'isNew' => 'nullable|boolean',
                'driverInfo' => 'nullable|array',
                'driverInfo.licenseNumber' => 'nullable|string|max:50',
                'driverInfo.newDriver' => 'nullable|array',
            ], ['category.in' => 'فئة المركبة يجب أن تكون: حافلة سياحية أو ميني باص أو باص VIP']);
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        $plate = trim($data['plate_number']);
        $existing = Vehicle::find($plate);
        if ($existing && !empty($data['isNew'])) {
            return $this->error('رقم لوحة المركبة مسجل مسبقاً لمركبة أخرى', 409);
        }
        $company = TransportationCompany::find($data['contract_number']);
        if (!$company) {
            return $this->error('شركة النقل المرتبطة بهذه المركبة غير موجودة', 422);
        }
        // A company cannot register more vehicles than the number agreed in its contract
        if (!$existing && Vehicle::where('contract_number', $company->contract_number)->count() >= (int) $company->total_vehicles) {
            return $this->error("وصلت الشركة إلى الحد الأقصى لعدد المركبات المتفق عليه في العقد ({$company->total_vehicles} مركبات). لزيادة العدد يرجى التواصل مع إدارة المنصة.", 409);
        }

        $values = [
            'contract_number' => $data['contract_number'],
            'vehicle_type' => trim($data['vehicle_type']),
            'seating_capacity' => $data['seating_capacity'] ?? ($existing->seating_capacity ?? 15),
            'daily_rate' => $data['daily_rate'] ?? ($existing->daily_rate ?? null),
            'category' => $data['category'] ?? ($existing->category ?? null),
            'vehicle_status' => $data['vehicle_status'] ?? ($existing->vehicle_status ?? 'جاهزة'),
        ];
        // Keep the stored image when the form sends none
        foreach (['insurance_image', 'vehicle_image'] as $image) {
            if (!empty($data[$image])) {
                $values[$image] = $data[$image];
            }
        }

        $driverInfo = $data['driverInfo'] ?? null;
        $newDriver = $driverInfo['newDriver'] ?? null;
        if ($newDriver) {
            $error = $this->validateDriverFields($newDriver, null);
            if ($error) {
                return $this->error($error, 422);
            }
        }

        DB::transaction(function () use ($plate, $values, $driverInfo, $newDriver, $data) {
            Vehicle::updateOrCreate(['plate_number' => $plate], $values);

            if ($driverInfo === null) {
                return;
            }
            if ($newDriver) {
                Driver::where('assigned_vehicle_plate', $plate)->update(['assigned_vehicle_plate' => null]);
                $driver = Driver::create($this->driverValues($newDriver, $data['contract_number'], $plate, true));
                $this->notifyVehicleAssigned($driver->driver_license_number, $plate);
            } elseif (!empty($driverInfo['licenseNumber'])) {
                // One dedicated driver per vehicle
                Driver::where('assigned_vehicle_plate', $plate)
                    ->where('driver_license_number', '<>', $driverInfo['licenseNumber'])
                    ->update(['assigned_vehicle_plate' => null]);
                $previousPlate = Driver::where('driver_license_number', $driverInfo['licenseNumber'])->value('assigned_vehicle_plate');
                Driver::where('driver_license_number', $driverInfo['licenseNumber'])->update(['assigned_vehicle_plate' => $plate]);
                if ($previousPlate !== $plate) {
                    $this->notifyVehicleAssigned($driverInfo['licenseNumber'], $plate);
                }
            } else {
                Driver::where('assigned_vehicle_plate', $plate)->update(['assigned_vehicle_plate' => null]);
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ المركبة وربط السائق بها بنجاح',
            'data' => Vehicle::find($plate)], 201);
    }

    /* ===================== Drivers ===================== */

    public function drivers(Request $request): JsonResponse
    {
        $query = Driver::query()
            ->leftJoin('transportation_companies as c', 'drivers.contract_number', '=', 'c.contract_number')
            ->select('drivers.*', 'c.company_name')
            ->orderBy('drivers.full_name');
        if ($request->filled('contract_number')) {
            $query->where('drivers.contract_number', $request->input('contract_number'));
        }
        return response()->json(['success' => true, 'data' => $query->get()]);
    }

    public function saveDriver(Request $request): JsonResponse
    {
        $input = $request->all();
        $license = trim((string) ($input['driver_license_number'] ?? ''));
        $existing = $license !== '' ? Driver::find($license) : null;
        if ($existing && !empty($input['isNew'])) {
            return $this->error('رقم رخصة القيادة مسجل مسبقاً لسائق آخر', 409);
        }
        if ($error = $this->validateDriverFields($input, $existing ? $license : null)) {
            return $this->error($error, 422);
        }
        if (!TransportationCompany::find($input['contract_number'] ?? '')) {
            return $this->error('شركة النقل المرتبطة بهذا السائق غير موجودة', 422);
        }
        if ($existing && $existing->contract_number !== $input['contract_number']) {
            return $this->error('هذا السائق مسجل لدى شركة نقل أخرى', 403);
        }

        // Only keep a plate that really exists; "غير مسند" and similar mean no vehicle
        $plate = trim((string) ($input['assigned_vehicle_plate'] ?? ''));
        $plate = $plate !== '' && Vehicle::find($plate) ? $plate : null;

        $values = $this->driverValues($input, $input['contract_number'], $plate, !$existing);
        DB::transaction(function () use ($license, $values, $plate, $existing) {
            if ($plate) {
                Driver::where('assigned_vehicle_plate', $plate)->where('driver_license_number', '<>', $license)
                    ->update(['assigned_vehicle_plate' => null]);
            }
            Driver::updateOrCreate(['driver_license_number' => $license], $values);
            if ($plate && (!$existing || $existing->assigned_vehicle_plate !== $plate)) {
                $this->notifyVehicleAssigned($license, $plate);
            }
        });

        return response()->json(['success' => true, 'message' => 'تم حفظ بيانات السائق بنجاح',
            'data' => Driver::find($license)], 201);
    }

    /* ===================== Helpers ===================== */

    // Tells the driver which vehicle they now drive (from the driver form or the vehicle form)
    private function notifyVehicleAssigned(string $license, string $plate): void
    {
        $this->notify("driver-veh-{$license}-{$plate}", 'driver', $license, 'assignment',
            '🚍 تخصيص مركبة جديدة لك',
            "خصصت لك شركة النقل المركبة رقم ({$plate}). يمكنك الاطلاع على تفاصيلها من لوحتك.",
            '/dashboard/driver?tab=vehicle');
    }

    // Returns an Arabic error message, or null when the driver fields are valid and unique
    private function validateDriverFields(array $d, ?string $existingLicense): ?string
    {
        $license = trim((string) ($d['driver_license_number'] ?? ''));
        $name = trim((string) ($d['full_name'] ?? ''));
        $phone = trim((string) ($d['phone_number'] ?? ''));
        $email = trim((string) ($d['email'] ?? ''));
        $nid = trim((string) ($d['national_id_or_passport'] ?? ''));

        if ($license === '' || $name === '' || $phone === '' || $nid === '') {
            return 'بيانات السائق غير مكتملة (رقم الرخصة، الاسم، الهاتف، الرقم الوطني)';
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'يرجى إدخال بريد إلكتروني صحيح للسائق، فهو المستخدم في تسجيل الدخول';
        }
        if (!$existingLicense && !$this->newPassword($d['password'] ?? null)) {
            return 'كلمة المرور مطلوبة لحساب السائق الجديد (6 خانات على الأقل)';
        }
        if (!$existingLicense && Driver::find($license)) {
            return 'رقم رخصة القيادة مسجل مسبقاً لسائق آخر';
        }
        foreach (['phone_number' => [$phone, 'رقم هاتف السائق'], 'national_id_or_passport' => [$nid, 'الرقم الوطني للسائق'], 'email' => [$email, 'البريد الإلكتروني']] as $column => [$value, $label]) {
            if ($this->taken(Driver::class, $column, $value, 'driver_license_number', $license)) {
                return "{$label} مسجل مسبقاً لسائق آخر";
            }
        }
        return null;
    }

    private function driverValues(array $d, string $contract, ?string $plate, bool $isNew): array
    {
        $values = [
            'driver_license_number' => trim((string) $d['driver_license_number']),
            'full_name' => trim((string) $d['full_name']),
            'phone_number' => trim((string) $d['phone_number']),
            'national_id_or_passport' => trim((string) $d['national_id_or_passport']),
            'license_date_valid' => $d['license_date_valid'] ?? null,
            'contract_number' => $contract,
            'assigned_vehicle_plate' => $plate,
            'email' => trim((string) $d['email']),
            'account_status' => $d['account_status'] ?? 'نشط',
            'operational_status' => $d['operational_status'] ?? 'متاح',
        ];
        if (empty($values['license_date_valid'])) {
            // Column is NOT NULL; keep the stored date on update, otherwise the forms' default
            $values['license_date_valid'] = Driver::find($values['driver_license_number'])->license_date_valid ?? '2029-12-31';
        }
        // The password is set once by the company when the driver is created; afterwards only the driver changes it
        if ($isNew) {
            $values['password'] = $this->newPassword($d['password'] ?? null)
                ?? throw new \LogicException('password required for a new driver');
        }
        return $values;
    }

    private function changePassword(Request $request, ?Model $account, string $notFound): JsonResponse
    {
        if (!$account) {
            return $this->error($notFound, 404);
        }
        $current = (string) $request->input('current_password', '');
        $new = trim((string) $request->input('new_password', ''));
        if (!$this->hashMatches($current, $account->password)) {
            return $this->error('كلمة المرور الحالية غير صحيحة', 403);
        }
        if (mb_strlen($new) < 6) {
            return $this->error('كلمة المرور الجديدة يجب أن تتكون من 6 خانات على الأقل', 422);
        }
        $account->forceFill(['password' => Hash::make($new)])->save();
        return response()->json(['success' => true, 'message' => 'تم تغيير كلمة المرور بنجاح']);
    }

    private function hashMatches(string $plain, ?string $hash): bool
    {
        try {
            return $plain !== '' && !empty($hash) && Hash::check($plain, $hash);
        } catch (\Throwable) {
            return false; // not a bcrypt hash
        }
    }

    // Bcrypt hash of a newly entered password, or null when unchanged / too short
    private function newPassword(?string $raw): ?string
    {
        $raw = trim((string) $raw);
        if ($raw === '' || $raw === self::MASKED_PASSWORD || mb_strlen($raw) < 6) {
            return null;
        }
        return Hash::make($raw);
    }

    private function taken(string $model, string $column, string $value, string $keyColumn, string $key): bool
    {
        return $value !== '' && $model::where($column, $value)->where($keyColumn, '<>', $key)->exists();
    }
}
