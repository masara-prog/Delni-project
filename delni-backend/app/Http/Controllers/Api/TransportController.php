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
use App\Support\Actor;
use App\Support\Base64Image;
use App\Support\Passwords;

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
    public const SEAT_OPTIONS = [15, 25, 50];
    public const VEHICLE_STATUSES = ['جاهزة', 'في رحلة', 'صيانة', 'خارج الخدمة'];
    private const PUBLIC_DRIVER_FIELDS = ['driver_license_number', 'full_name', 'contract_number', 'company_name',
        'assigned_vehicle_plate', 'operational_status', 'current_trip_stage'];
    // What a driver may change in their own record; the company keeps the rest (name, phone, email are official data)
    private const DRIVER_SELF_FIELDS = ['operational_status'];
    private const DRIVER_SELF_STATUSES = ['متاح', 'إجازة'];
    private const ACCOUNT_STATUSES = ['نشط', Driver::SUSPENDED];

    /* ===================== Companies ===================== */

    public function companies(): JsonResponse
    {
        // The email is the company's sign-in account: shown only to the admin and to the company itself
        $role = \App\Support\Actor::role();
        $ownId = \App\Support\Actor::id();
        $companies = TransportationCompany::orderBy('company_name')->get()->map(function (TransportationCompany $c) use ($role, $ownId) {
            $row = $c->toArray();
            if ($role !== 'admin' && !($role === 'transport' && $ownId === (string) $c->contract_number)) {
                unset($row['email']);
            }
            return $row;
        });
        return response()->json(['success' => true, 'data' => $companies]);
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
        $oldEnd = $existing?->contract_end_date ? (string) $existing->contract_end_date : null;
        if ($error = $this->pastDateError($data['contract_end_date'] ?? null, $oldEnd, 'تاريخ نهاية التعاقد')) {
            return $this->error($error, 422);
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
        $stage = $request->input('stage');
        if (!is_string($stage) || !in_array($stage, Driver::TRIP_STAGES, true)) {
            return $this->error('مرحلة الرحلة غير صحيحة', 422);
        }
        if (!$driver->assigned_vehicle_plate) {
            return $this->error('لا توجد مركبة مسندة إليك، فلا يمكن تحديث مرحلة رحلة', 409);
        }
        // Stages follow the order of a real trip (see Driver::STAGE_TRANSITIONS); repeating the current stage is harmless
        $current = $driver->current_trip_stage ?: 'في الانتظار';
        $next = Driver::STAGE_TRANSITIONS[$current] ?? [];
        if ($stage !== $current && !in_array($stage, $next, true)) {
            return $this->error("لا يمكن الانتقال من مرحلة «{$current}» إلى «{$stage}». المرحلة التالية: «" . implode('» أو «', $next) . '»', 422);
        }
        // A trip can only start when one is assigned to the vehicle, and with a valid driving licence
        if ($current === 'في الانتظار' && $stage === 'تم الانطلاق') {
            if (!$driver->assignedTrips()) {
                return $this->error('لا توجد رحلة مسندة لمركبتك حالياً، فلا يمكن بدء رحلة', 409);
            }
            $today = now('Africa/Tripoli')->toDateString();
            if ($driver->license_date_valid && $driver->license_date_valid->format('Y-m-d') < $today) {
                return $this->error('رخصة قيادتك منتهية منذ ' . $driver->license_date_valid->format('Y-m-d') . '، فلا يمكن بدء رحلة قبل تجديدها وتحديثها لدى شركة النقل', 409);
            }
        }

        // The driver's and the vehicle's statuses follow the trip: "في رحلة" on the road, back to normal when it is completed
        DB::transaction(function () use ($driver, $stage) {
            $onTrip = in_array($stage, Driver::ON_TRIP_STAGES, true);
            $values = ['current_trip_stage' => $stage];
            if ($onTrip) {
                $values['operational_status'] = 'في رحلة';
            } elseif ($stage === 'مكتملة' && $driver->operational_status === 'في رحلة') {
                $values['operational_status'] = 'متاح';
            }
            $driver->forceFill($values)->save();
            $vehicle = Vehicle::where('plate_number', $driver->assigned_vehicle_plate);
            if ($onTrip) {
                (clone $vehicle)->where('vehicle_status', 'جاهزة')->update(['vehicle_status' => 'في رحلة']);
            } elseif ($stage === 'مكتملة') {
                (clone $vehicle)->where('vehicle_status', 'في رحلة')->update(['vehicle_status' => 'جاهزة']);
            }
        });
        return response()->json(['success' => true, 'message' => "تم تحديث مرحلة الرحلة: {$stage}",
            'data' => ['current_trip_stage' => $stage, 'operational_status' => $driver->operational_status]]);
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
        // The insurance document is shown only to the admin and the owning company
        $data = $query->get()->map(fn (Vehicle $v) => $this->seesPrivate($v->contract_number) ? $v->toArray() : collect($v->toArray())->except('insurance_image')->all());
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function saveVehicle(Request $request): JsonResponse
    {
        try {
            $data = $request->validate([
                'plate_number' => ['required', 'string', 'max:30', 'regex:/^\d+$/'],
                'contract_number' => 'required|string|max:50',
                'vehicle_type' => 'required|string|max:100',
                'seating_capacity' => 'required|integer|in:' . implode(',', self::SEAT_OPTIONS),
                'daily_rate' => 'required|numeric|min:1',
                'category' => 'nullable|string|in:' . implode(',', self::VEHICLE_CATEGORIES),
                'vehicle_status' => 'nullable|string|in:' . implode(',', self::VEHICLE_STATUSES),
                'insurance_image' => 'nullable|string',
                'vehicle_image' => 'nullable|string',
                'isNew' => 'nullable|boolean',
                'driverInfo' => 'nullable|array',
                'driverInfo.licenseNumber' => 'nullable|string|max:50',
                'driverInfo.newDriver' => 'nullable|array',
            ], [
                'category.in' => 'فئة المركبة يجب أن تكون: حافلة سياحية أو ميني باص أو باص VIP',
                'plate_number.regex' => 'رقم لوحة المركبة يجب أن يتكون من أرقام فقط',
                'seating_capacity.required' => 'عدد مقاعد المركبة مطلوب',
                'seating_capacity.in' => 'عدد مقاعد المركبة يجب أن يكون 15 أو 25 أو 50',
                'daily_rate.required' => 'سعر اليوم الواحد للمركبة مطلوب',
                'daily_rate.min' => 'سعر اليوم الواحد يجب أن يكون أكبر من صفر',
                'vehicle_status.in' => 'حالة المركبة يجب أن تكون: جاهزة أو في رحلة أو صيانة أو خارج الخدمة',
            ]);
        } catch (ValidationException $e) {
            return $this->validationError($e);
        }

        $plate = trim($data['plate_number']);
        $existing = Vehicle::find($plate);
        if ($existing && !empty($data['isNew'])) {
            return $this->error('رقم لوحة المركبة مسجل مسبقاً لمركبة أخرى', 409);
        }
        if ($existing && $existing->contract_number !== $data['contract_number']) {
            return $this->error('هذه المركبة مسجلة لدى شركة نقل أخرى', 403);
        }
        $linkedDriver = $data['driverInfo']['licenseNumber'] ?? null;
        if ($linkedDriver && Driver::where('driver_license_number', $linkedDriver)->value('contract_number') !== $data['contract_number']) {
            return $this->error('السائق المختار غير مسجل لدى هذه الشركة', 403);
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
        // Keep the stored image when the form sends none; a new one is saved as a file (supported images only)
        foreach (['insurance_image', 'vehicle_image'] as $image) {
            if (!empty($data[$image])) {
                $values[$image] = Base64Image::store($data[$image], "{$image}-{$plate}", 'vehicles');
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

        if ($driverInfo !== null) {
            $linked = $newDriver ? null : ($driverInfo['licenseNumber'] ?? null);
            if ($error = $this->driverChangeDuringTrip($linked ? Driver::find($linked) : null, $plate, $linked)) {
                return $this->error($error, 409);
            }
        }

        $unassign = ['assigned_vehicle_plate' => null, 'current_trip_stage' => null];
        DB::transaction(function () use ($plate, $values, $driverInfo, $newDriver, $data, $unassign) {
            Vehicle::updateOrCreate(['plate_number' => $plate], $values);

            if ($driverInfo === null) {
                return;
            }
            if ($newDriver) {
                Driver::where('assigned_vehicle_plate', $plate)->update($unassign);
                $driver = Driver::create($this->driverValues($newDriver, $data['contract_number'], $plate, true));
                $this->notifyVehicleAssigned($driver->driver_license_number, $plate);
            } elseif (!empty($driverInfo['licenseNumber'])) {
                // One dedicated driver per vehicle
                Driver::where('assigned_vehicle_plate', $plate)
                    ->where('driver_license_number', '<>', $driverInfo['licenseNumber'])
                    ->update($unassign);
                $previousPlate = Driver::where('driver_license_number', $driverInfo['licenseNumber'])->value('assigned_vehicle_plate');
                if ($previousPlate !== $plate) {
                    Driver::where('driver_license_number', $driverInfo['licenseNumber'])->update(['assigned_vehicle_plate' => $plate, 'current_trip_stage' => null]);
                    $this->notifyVehicleAssigned($driverInfo['licenseNumber'], $plate);
                }
            } else {
                Driver::where('assigned_vehicle_plate', $plate)->update($unassign);
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
        // Visitors see who drives which vehicle; contact and identity details stay with the admin and the company
        $data = $query->get()->map(fn (Driver $d) => $this->seesPrivate($d->contract_number) ? $d->toArray()
            : collect($d->toArray())->only(self::PUBLIC_DRIVER_FIELDS)->all());
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function saveDriver(Request $request): JsonResponse
    {
        $input = $request->all();
        $license = trim((string) ($input['driver_license_number'] ?? ''));
        $existing = $license !== '' ? Driver::find($license) : null;
        if (Actor::role() === 'driver') {
            if (!$existing) {
                return $this->error('حساب السائق غير موجود', 404);
            }
            $status = $input['operational_status'] ?? null;
            if ($status !== null && !in_array($status, self::DRIVER_SELF_STATUSES, true)) {
                return $this->error('الحالة التشغيلية يجب أن تكون «متاح» أو «إجازة»', 422);
            }
            if ($status !== null && $status !== $existing->operational_status && $existing->isOnTrip()) {
                return $this->error('لا يمكن تغيير حالتك أثناء رحلة جارية؛ تعود حالتك إلى «متاح» تلقائياً عند اكتمال الرحلة', 409);
            }
            $input = array_merge($existing->toArray(), array_intersect_key($input, array_flip(self::DRIVER_SELF_FIELDS)), ['isNew' => false]);
        }
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

        // Only keep a plate that really exists ("غير مسند" and similar mean no vehicle), and only one of the company's own vehicles
        $plate = trim((string) ($input['assigned_vehicle_plate'] ?? ''));
        $vehicle = $plate !== '' ? Vehicle::find($plate) : null;
        if ($vehicle && $vehicle->contract_number !== $input['contract_number']) {
            return $this->error('المركبة المختارة ليست من مركبات هذه الشركة', 403);
        }
        $plate = $vehicle ? $plate : null;
        if ($error = $this->driverChangeDuringTrip($existing, $plate, $license)) {
            return $this->error($error, 409);
        }

        $values = $this->driverValues($input, $input['contract_number'], $plate, !$existing);
        if ($existing && $existing->assigned_vehicle_plate !== $plate) {
            $values['current_trip_stage'] = null; // the stage belonged to the previous vehicle's trip
        }
        DB::transaction(function () use ($license, $values, $plate, $existing) {
            if ($plate) {
                Driver::where('assigned_vehicle_plate', $plate)->where('driver_license_number', '<>', $license)
                    ->update(['assigned_vehicle_plate' => null, 'current_trip_stage' => null]);
            }
            Driver::updateOrCreate(['driver_license_number' => $license], $values);
            if ($plate && (!$existing || $existing->assigned_vehicle_plate !== $plate)) {
                $this->notifyVehicleAssigned($license, $plate);
            }
        });
        if (Actor::role() === 'driver' && $values['operational_status'] === 'إجازة' && $existing->operational_status !== 'إجازة') {
            $this->notifyDriverLeave($existing);
        }

        return response()->json(['success' => true, 'message' => 'تم حفظ بيانات السائق بنجاح',
            'data' => Driver::find($license)], 201);
    }

    /* ===================== Helpers ===================== */

    // A driver on the road keeps their vehicle until the trip is completed: neither of them can be moved meanwhile
    private function driverChangeDuringTrip(?Driver $driver, ?string $plate, ?string $license): ?string
    {
        if ($driver && $driver->isOnTrip() && $driver->assigned_vehicle_plate !== $plate) {
            return "السائق ({$driver->full_name}) في رحلة جارية الآن، فلا يمكن نقله إلى مركبة أخرى قبل اكتمال الرحلة";
        }
        $current = $plate ? Driver::where('assigned_vehicle_plate', $plate)->get()->first(fn (Driver $d) => $d->driver_license_number !== $license) : null;
        if ($current && $current->isOnTrip()) {
            return "سائق المركبة ({$current->full_name}) في رحلة جارية بها الآن، فلا يمكن تغيير سائقها قبل اكتمال الرحلة";
        }
        return null;
    }

    // Tells the driver which vehicle they now drive (from the driver form or the vehicle form)
    private function notifyVehicleAssigned(string $license, string $plate): void
    {
        $this->notify("driver-veh-{$license}-{$plate}", 'driver', $license, 'assignment',
            '🚍 تخصيص مركبة جديدة لك',
            "خصصت لك شركة النقل المركبة رقم ({$plate}). يمكنك الاطلاع على تفاصيلها من لوحتك.",
            '/dashboard/driver?tab=vehicle');
    }

    // A driver who goes on leave leaves their vehicle without a driver: the company is asked to assign another one, and the admin is informed
    private function notifyDriverLeave(Driver $driver): void
    {
        $plate = $driver->assigned_vehicle_plate;
        $trips = count($driver->assignedTrips());
        $vehicle = $plate ? "المركبة ({$plate})" : 'لا توجد مركبة مسندة إليه حالياً';
        $action = $plate ? 'يرجى إسناد سائق آخر لهذه المركبة' . ($trips ? " قبل موعد رحلاتها القادمة ({$trips})" : '') . '.' : '';
        $stamp = now('Africa/Tripoli')->format('YmdHis');
        $company = TransportationCompany::find($driver->contract_number);
        $this->notify("driver-leave-{$driver->driver_license_number}-{$stamp}", 'transport', $driver->contract_number, 'assignment',
            '🧳 سائق في إجازة: يلزم تغيير سائق المركبة',
            trim("غيّر السائق ({$driver->full_name}) حالته إلى «إجازة». {$vehicle}. {$action}"),
            '/dashboard/transport?tab=drivers');
        $this->notify("driver-leave-admin-{$driver->driver_license_number}-{$stamp}", 'admin', null, 'assignment',
            '🧳 سائق في إجازة',
            trim("السائق ({$driver->full_name}) لدى شركة (" . ($company?->company_name ?? $driver->contract_number) . ") في إجازة. {$vehicle}." . ($plate ? ' طُلب من الشركة إسناد سائق بديل.' : '')),
            '/dashboard/admin?tab=companies');
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
        // The same format rules as the company's form, so a direct request cannot store what the form refuses.
        // Phone and national id are checked when entered or changed (older records keep their stored values).
        $old = $existingLicense ? Driver::find($existingLicense) : null;
        if (!$old && (!ctype_digit($license) || strlen($license) > 50)) {
            return 'رقم رخصة القيادة يجب أن يتكون من أرقام فقط (50 رقماً على الأكثر)';
        }
        if (mb_strlen($name) > 150) {
            return 'اسم السائق يجب ألا يزيد على 150 حرفاً';
        }
        if ($phone !== $old?->phone_number && !preg_match('/^09\d{8}$/', $phone)) {
            return 'رقم هاتف السائق يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)';
        }
        if ($nid !== $old?->national_id_or_passport && !preg_match('/^\d{12}$/', $nid)) {
            return 'الرقم الوطني للسائق يجب أن يتكون من 12 رقماً بالضبط (أرقام فقط)';
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100) {
            return 'يرجى إدخال بريد إلكتروني صحيح للسائق، فهو المستخدم في تسجيل الدخول';
        }
        $date = $d['license_date_valid'] ?? null;
        if (!empty($date) && (!preg_match('/^(\d{4})-(\d{2})-(\d{2})/', (string) $date, $m) || !checkdate((int) $m[2], (int) $m[3], (int) $m[1]))) {
            return 'تاريخ صلاحية رخصة القيادة غير صحيح';
        }
        if (isset($d['operational_status']) && !in_array($d['operational_status'], Driver::OPERATIONAL_STATUSES, true)) {
            return 'الحالة التشغيلية يجب أن تكون: متاح أو في رحلة أو إجازة';
        }
        if (isset($d['account_status']) && !in_array($d['account_status'], self::ACCOUNT_STATUSES, true)) {
            return 'حالة حساب السائق يجب أن تكون: نشط أو موقوف';
        }
        if (!$existingLicense && !$this->newPassword($d['password'] ?? null)) {
            return 'كلمة المرور مطلوبة لحساب السائق الجديد (6 خانات على الأقل)';
        }
        // The driving licence must be valid: required for a new driver, and a newly entered expiry date must lie in the future
        $oldValid = $old?->license_date_valid?->format('Y-m-d');
        if (!$existingLicense && empty($d['license_date_valid'])) {
            return 'تاريخ صلاحية رخصة القيادة مطلوب';
        }
        if ($error = $this->pastDateError($d['license_date_valid'] ?? null, $oldValid, 'تاريخ صلاحية رخصة القيادة')) {
            return $error;
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
            'full_name' => trim(strip_tags((string) $d['full_name'])),
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
            // Column is NOT NULL; an update without a date keeps the stored one (a new driver must give it, see validateDriverFields)
            $values['license_date_valid'] = Driver::find($values['driver_license_number'])?->license_date_valid;
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
        if (!Passwords::matches($current, $account->password)) {
            return $this->error('كلمة المرور الحالية غير صحيحة', 403);
        }
        if (mb_strlen($new) < 6) {
            return $this->error('كلمة المرور الجديدة يجب أن تتكون من 6 خانات على الأقل', 422);
        }
        $account->forceFill(['password' => Hash::make($new)])->save();
        // Sessions opened elsewhere with the old password end; the session that made the change stays signed in
        $current = Actor::user()?->currentAccessToken();
        $account->tokens()->when($current?->id, fn ($q, $id) => $q->where('id', '<>', $id))->delete();
        return response()->json(['success' => true, 'message' => 'تم تغيير كلمة المرور بنجاح']);
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

    private function seesPrivate(?string $contractNumber): bool
    {
        return Actor::isAdmin() || (Actor::role() === 'transport' && Actor::id() === $contractNumber);
    }

    private function taken(string $model, string $column, string $value, string $keyColumn, string $key): bool
    {
        return $value !== '' && $model::where($column, $value)->where($keyColumn, '<>', $key)->exists();
    }
}
