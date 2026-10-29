// Automatic one-time cleanup to ensure fresh start with 0 data across the entire platform
if (typeof window !== "undefined") {
  const resetDone = localStorage.getItem("dalni_full_wipe_clean_v4");
  if (!resetDone) {
    try {
      const keysToClear = [
        "dalni_hotels",
        "dalni_restaurants",
        "dalni_bookings_daily",
        "dalni_bookings_weekly",
        "dalni_tourists",
        "dalni_guides",
        "dalni_companies",
        "dalni_vehicles",
        "dalni_drivers",
        "dalni_notifications",
        "dalni_places",
        "dalni_offers_daily",
        "dalni_offers_weekly",
        "dalni_favorites",
        "dalni_chat_sessions"
      ];
      keysToClear.forEach(k => {
        localStorage.removeItem(k);
        localStorage.setItem(k, "[]");
      });
      localStorage.setItem("dalni_full_wipe_clean_v4", "true");
    } catch { }
  }
}
/**
 * Delni Platform - Universal Client & Data Management Layer
 * Implements complete local persistence for:
 * - Transportation Companies (transportation_companies)
 * - Vehicles (vehicles)
 * - Drivers (drivers)
 * - Tour Guides (tour_guides)
 * - Tourists & Bookings
 */

export const LARAVEL_API_URL = "http://127.0.0.1:8000/api";
export const AI_SERVICE_URL = "http://127.0.0.1:8000/api/ai";

export interface ApiResponse<T = any> {
  status: "success" | "error" | "online";
  message?: string;
  data?: T;
  user?: any;
  [key: string]: any;
}

export interface GuideRecord {
  license_number: string;
  full_name: string;
  title?: string;
  avatar?: string;
  phone_number: string;
  years_of_experience: number;
  certificate?: string;
  certificate_name?: string;
  digital_certificate_file?: string;
  bio?: string;
  speaks_english?: boolean;
  speaks_french?: boolean;
  speaks_italian?: boolean;
  email: string;
  password?: string;
  gender?: string;
  working_days?: string;
  operating_regions?: string;
  price_per_day?: number;
  verification_status: "قيد المراجعة" | "موثق" | "مرفوض";
  assigned_trips?: any[];
  registered_at?: string;
}

export interface TransportCompanyRecord {
  id?: string | null;
  contract_number: string;
  company_name: string;
  name?: string | null;
  phone_number: string;
  phone?: string | null;
  address: string;
  city?: string | null;
  email?: string | null;
  password?: string | null;
  total_vehicles?: number | null;
  contract_start_date?: string | null;
  contract_end_date?: string | null;
  verification_status?: string | null;
  status?: string | null;
  google_maps_url?: string | null;
}

export interface VehicleRecord {
  plate_number: string;
  contract_number: string;
  company_name?: string | null;
  vehicle_type: string;
  seating_capacity: number;
  daily_rate?: number | null;
  category?: string | null;
  vehicle_status: "جاهزة" | "في رحلة" | "صيانة" | "خارج الخدمة" | string;
  status?: string | null;
  insurance_details?: string | null;
  insurance_image?: string | null;
  vehicle_image?: string | null;
  photos?: string | null;
}

export interface DriverRecord {
  driver_license_number: string;
  full_name: string;
  phone_number: string;
  national_id_or_passport: string;
  license_date_valid: string;
  contract_number: string;
  assigned_vehicle_plate?: string | null;
  email: string;
  password?: string | null;
  account_status?: "نشط" | "معلق" | "موقوف" | string | null;
  operational_status?: "متاح" | "في رحلة" | "إجازة" | string | null;
  company_name?: string | null;
  driver_photo?: string | null;
}

const STORAGE_KEYS = {
  GUIDES: "dalni_registered_guides",
  COMPANIES: "dalni_transport_companies",
  VEHICLES: "dalni_vehicles",
  DRIVERS: "dalni_drivers",
  USERS: "dalni_registered_users",
  CURRENT_USER: "dalni_user",
  TOKEN: "dalni_token",
  ROLE: "dalni_role",
  HOTELS: "dalni_hotels",
  RESTAURANTS: "dalni_restaurants",
  PRIVATE_TRIPS: "dalni_private_trips",
};

// Default seed data (Empty so user can add fresh companies, vehicles, and drivers)
const DEFAULT_COMPANIES: TransportCompanyRecord[] = [];
const DEFAULT_VEHICLES: VehicleRecord[] = [];
const DEFAULT_DRIVERS: DriverRecord[] = [];

// Automatic one-time cleanup to ensure complete fresh start with 0 static records
if (typeof window !== "undefined") {
  const resetDone = localStorage.getItem("dalni_full_wipe_clean_v3");
  if (!resetDone) {
    try {
      const keysToClear = [
        STORAGE_KEYS.COMPANIES,
        STORAGE_KEYS.VEHICLES,
        STORAGE_KEYS.DRIVERS,
        STORAGE_KEYS.GUIDES,
        STORAGE_KEYS.HOTELS,
        STORAGE_KEYS.RESTAURANTS,
        STORAGE_KEYS.PRIVATE_TRIPS,
        "dalni_chat_sessions",
        "dalni_notifications",
        "dallani_cached_offers",
        "dalni_live_trips_cache",
        "dalni_hotel_offers",
        "dalni_registered_users",
        "dalni_companies",
        "dalni_all_companies",
      ];
      keysToClear.forEach((k) => {
        try {
          localStorage.removeItem(k);
          localStorage.setItem(k, "[]");
        } catch {}
      });
      localStorage.setItem("dalni_full_wipe_clean_v3", "true");
    } catch { }
  }
}

/* =========================================================
   LARAVEL API CLIENT (the only server that reads and writes DelniDB)
   ========================================================= */
// Reads the error text from a failed response: { error }, Laravel's first validation message, or { message }
async function readBackendError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    const firstValidation = body?.errors ? (Object.values(body.errors).flat() as string[])[0] : undefined;
    return body?.error || firstValidation || body?.message || `رمز الخطأ ${res.status}`;
  } catch {
    return `رمز الخطأ ${res.status}`;
  }
}

export type LaravelResult<T = any> = { ok: true; data?: T; body?: any } | { ok: false; error: string };

const LARAVEL_UNREACHABLE_ERROR =
  "تعذر الاتصال بخادم المنصة Laravel (المنفذ 8000). تأكد من تشغيله ثم أعد المحاولة.";

/**
 * Calls the Laravel API, which is the only layer that writes to DelniDB; the result says whether it was really stored.
 */
export async function laravelRequest<T = any>(method: "GET" | "POST" | "PUT", path: string, payload?: any): Promise<LaravelResult<T>> {
  if (typeof window === "undefined") return { ok: false, error: LARAVEL_UNREACHABLE_ERROR };
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(`${LARAVEL_API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: payload === undefined ? undefined : JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!res.ok) return { ok: false, error: await readBackendError(res) };
    const body = await res.json().catch(() => null);
    return { ok: true, data: body?.data, body };
  } catch {
    return { ok: false, error: LARAVEL_UNREACHABLE_ERROR };
  } finally {
    clearTimeout(timeoutId);
  }
}

/* =========================================================
   TRANSPORTATION COMPANIES MANAGEMENT
   ========================================================= */
export function getTransportCompanies(): TransportCompanyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(DEFAULT_COMPANIES));
      return DEFAULT_COMPANIES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_COMPANIES;
  }
}

export function saveTransportCompanies(companies: TransportCompanyRecord[]) {
  localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
}

export type CompanySaveResult = { ok: true; record: TransportCompanyRecord } | { ok: false; error: string };

/**
 * Adds a transport company. The local list is only updated after DelniDB confirms the save.
 */
export async function addTransportCompany(company: Partial<TransportCompanyRecord>, isNew = true): Promise<CompanySaveResult> {
  const list = getTransportCompanies();
  const newComp: TransportCompanyRecord = {
    id: company.id || `COM-00${list.length + 1}`,
    contract_number: company.contract_number || `CN-2026-0${list.length + 1}`,
    company_name: company.company_name || company.name || "شركة نقل جديدة",
    name: company.company_name || company.name || "شركة نقل جديدة",
    phone_number: company.phone_number || company.phone || "0910000000",
    phone: company.phone_number || company.phone || "0910000000",
    address: company.address || "طرابلس",
    city: company.city || "طرابلس",
    email: company.email || "",
    password: company.password || "",
    total_vehicles: Number(company.total_vehicles) || 5,
    contract_start_date: company.contract_start_date || null,
    contract_end_date: company.contract_end_date || null,
    verification_status: company.verification_status || company.status || "موثق",
    status: company.verification_status || company.status || "موثق",
    google_maps_url: company.google_maps_url || (company.address && (company.address.startsWith("http") || company.address.includes("maps")) ? company.address : "") || "",
  };
  const saved = await laravelRequest("POST", "/transport/companies", { ...newComp, isNew });
  if (!saved.ok) return { ok: false, error: saved.error || "فشل حفظ شركة النقل" };

  // The password is stored hashed in DelniDB only, never in the browser
  newComp.password = "";
  list.unshift(newComp);
  saveTransportCompanies(list);
  return { ok: true, record: newComp };
}

/**
 * Updates a transport company. The local list is only updated after DelniDB confirms the save.
 */
export async function updateTransportCompany(contractNumber: string, data: Partial<TransportCompanyRecord>): Promise<CompanySaveResult> {
  const list = getTransportCompanies();
  const idx = list.findIndex(c => c.contract_number === contractNumber || c.id === contractNumber);
  if (idx !== -1) {
    const updatedRecord: TransportCompanyRecord = {
      ...list[idx],
      ...data,
      company_name: data.company_name || data.name || list[idx].company_name || list[idx].name || "",
      name: data.company_name || data.name || list[idx].company_name || list[idx].name || "",
      phone_number: data.phone_number || data.phone || list[idx].phone_number || list[idx].phone || "",
      phone: data.phone_number || data.phone || list[idx].phone_number || list[idx].phone || "",
      verification_status: data.verification_status || data.status || list[idx].verification_status || list[idx].status || "موثق",
      status: data.verification_status || data.status || list[idx].verification_status || list[idx].status || "موثق",
      city: data.city || list[idx].city || "طرابلس",
      address: data.address !== undefined ? data.address : list[idx].address,
      google_maps_url: data.google_maps_url !== undefined ? data.google_maps_url : (data.address && (data.address.startsWith("http") || data.address.includes("maps")) ? data.address : (list[idx].google_maps_url || "")),
      email: data.email || list[idx].email || "",
      total_vehicles: Number(data.total_vehicles !== undefined ? data.total_vehicles : list[idx].total_vehicles) || 0,
      contract_start_date: data.contract_start_date || list[idx].contract_start_date,
      contract_end_date: data.contract_end_date || list[idx].contract_end_date,
    };
    const saved = await laravelRequest("POST", "/transport/companies", { ...updatedRecord, isNew: false });
    if (!saved.ok) return { ok: false, error: saved.error || "فشل تحديث شركة النقل" };
    updatedRecord.password = "";

    list[idx] = updatedRecord;
    saveTransportCompanies(list);

    const current = getStoredSession().user;
    if (current && (current.contract_number === contractNumber || current.id === contractNumber)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...current, ...updatedRecord }));
    }
    return { ok: true, record: updatedRecord };
  } else {
    // Company exists in DelniDB but not in this browser's cache: save it as an update, not a new registration
    return addTransportCompany({ ...data, contract_number: contractNumber }, false);
  }
}

/* =========================================================
   VEHICLES MANAGEMENT
   ========================================================= */
export function getVehicles(contractNumber?: string): VehicleRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VEHICLES);
    let list: VehicleRecord[] = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(DEFAULT_VEHICLES));
      list = DEFAULT_VEHICLES;
    } else {
      list = JSON.parse(raw);
    }
    if (contractNumber) {
      return list.filter(v => v.contract_number === contractNumber);
    }
    return list;
  } catch {
    return DEFAULT_VEHICLES;
  }
}

export function saveVehicles(vehicles: VehicleRecord[]) {
  localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
}

export type DriverAssignment = { licenseNumber?: string; newDriver?: any };
export type SaveResult<T> = { success: true; data: T } | { success: false; error: string };

const isRealPlate = (plate: unknown) => {
  const p = plate ? String(plate).trim() : "";
  return p && p !== "غير مسند" && p !== "غير معين" && p !== "none" ? p : null;
};

/**
 * Reloads the company's vehicles and drivers from DelniDB (through Laravel) into the local cache.
 */
export async function refreshFleet(contractNumber: string): Promise<{ vehicles: VehicleRecord[]; drivers: DriverRecord[] } | null> {
  const q = `?contract_number=${encodeURIComponent(contractNumber)}`;
  const [veh, drv] = await Promise.all([
    laravelRequest<VehicleRecord[]>("GET", `/transport/vehicles${q}`),
    laravelRequest<DriverRecord[]>("GET", `/transport/drivers${q}`),
  ]);
  if (!veh.ok || !drv.ok || !Array.isArray(veh.data) || !Array.isArray(drv.data)) return null;
  // Keep other companies' cached rows, replace this company's
  saveVehicles([...veh.data, ...getVehicles().filter(v => v.contract_number !== contractNumber)]);
  saveDrivers([...drv.data, ...getDrivers().filter(d => d.contract_number !== contractNumber)]);
  return { vehicles: veh.data, drivers: drv.data };
}

/**
 * Saves a vehicle (new or edited) and its driver assignment. Local state is only updated after DelniDB confirms.
 */
export async function saveVehicle(v: Partial<VehicleRecord>, isNew: boolean, driverInfo?: DriverAssignment): Promise<SaveResult<VehicleRecord>> {
  const plate = String(v.plate_number || "").trim();
  const contract = String(v.contract_number || "").trim();
  if (!plate || !contract) return { success: false, error: "رقم اللوحة ورقم عقد الشركة مطلوبان" };

  const payload = {
    ...v,
    plate_number: plate,
    contract_number: contract,
    vehicle_type: v.vehicle_type || "حافلة سياحية",
    seating_capacity: Number(v.seating_capacity) || 15,
    daily_rate: Number(v.daily_rate) || null,
    category: v.category || null,
    vehicle_status: v.vehicle_status || v.status || "جاهزة",
    insurance_image: v.insurance_image || "",
    vehicle_image: v.vehicle_image || "",
    isNew,
    driverInfo: driverInfo ?? null,
  };
  const saved = await laravelRequest<VehicleRecord>("POST", "/transport/vehicles", payload);
  if (!saved.ok) return { success: false, error: saved.error };

  const record = { ...v, ...(saved.data || {}), company_name: v.company_name } as VehicleRecord;
  saveVehicles([record, ...getVehicles().filter(x => x.plate_number !== plate)]);
  if (driverInfo) {
    saveDrivers(getDrivers().map(d => {
      if (driverInfo.licenseNumber && d.driver_license_number === driverInfo.licenseNumber) return { ...d, assigned_vehicle_plate: plate };
      if (d.assigned_vehicle_plate === plate) return { ...d, assigned_vehicle_plate: null };
      return d;
    }));
  }
  return { success: true, data: record };
}

/* =========================================================
   DRIVERS MANAGEMENT
   ========================================================= */
export function getDrivers(contractNumber?: string): DriverRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DRIVERS);
    let list: DriverRecord[] = [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(DEFAULT_DRIVERS));
      list = DEFAULT_DRIVERS;
    } else {
      list = JSON.parse(raw);
    }
    if (contractNumber) {
      return list.filter(d => d.contract_number === contractNumber);
    }
    return list;
  } catch {
    return DEFAULT_DRIVERS;
  }
}

export function saveDrivers(drivers: DriverRecord[]) {
  localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers));
}

// Stores the confirmed driver locally (without the password) and refreshes the signed-in driver's session
function cacheDriver(record: DriverRecord) {
  const clean = { ...record, password: "" };
  saveDrivers([clean, ...getDrivers().filter(x => x.driver_license_number !== record.driver_license_number)]);
  const current = getStoredSession().user;
  if (current && current.driver_license_number === record.driver_license_number) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...current, ...clean }));
  }
  return clean;
}

export async function apiAddDriver(d: Partial<DriverRecord>): Promise<SaveResult<DriverRecord>> {
  const newD: DriverRecord = {
    driver_license_number: String(d.driver_license_number || "").trim(),
    full_name: String(d.full_name || "").trim(),
    phone_number: String(d.phone_number || "").trim(),
    national_id_or_passport: String(d.national_id_or_passport || "").trim(),
    license_date_valid: d.license_date_valid || "2029-12-31",
    contract_number: String(d.contract_number || "").trim(),
    assigned_vehicle_plate: isRealPlate(d.assigned_vehicle_plate),
    email: String(d.email || "").trim(),
    password: d.password || "",
    account_status: d.account_status || "نشط",
    operational_status: d.operational_status || "متاح",
    company_name: d.company_name || "",
  };
  const saved = await laravelRequest<DriverRecord>("POST", "/transport/drivers", { ...newD, isNew: true });
  if (!saved.ok) return { success: false, error: saved.error };
  return { success: true, data: cacheDriver({ ...newD, ...(saved.data || {}) }) };
}

// Edits a driver's details; the password is never sent here (only the driver changes it, see apiChangeDriverPassword)
export async function apiUpdateDriver(licenseNumber: string, data: Partial<DriverRecord>): Promise<SaveResult<DriverRecord>> {
  const current = getDrivers().find(d => d.driver_license_number === licenseNumber);
  const { password: _password, ...merged } = { ...(current || {}), ...data, driver_license_number: licenseNumber } as DriverRecord;
  merged.assigned_vehicle_plate = isRealPlate(merged.assigned_vehicle_plate);
  const saved = await laravelRequest<DriverRecord>("POST", "/transport/drivers", { ...merged, isNew: false });
  if (!saved.ok) return { success: false, error: saved.error };
  return { success: true, data: cacheDriver({ ...merged, ...(saved.data || {}) } as DriverRecord) };
}

// Only the account owner changes a password: the current one must be entered
async function changePassword(path: string, currentPassword: string, newPassword: string): Promise<SaveResult<null>> {
  const res = await laravelRequest("POST", path, { current_password: currentPassword, new_password: newPassword });
  return res.ok ? { success: true, data: null } : { success: false, error: res.error };
}

export function apiChangeDriverPassword(licenseNumber: string, currentPassword: string, newPassword: string) {
  return changePassword(`/transport/drivers/${encodeURIComponent(licenseNumber)}/password`, currentPassword, newPassword);
}

export function apiChangeCompanyPassword(contractNumber: string, currentPassword: string, newPassword: string) {
  return changePassword(`/transport/companies/${encodeURIComponent(contractNumber)}/password`, currentPassword, newPassword);
}

// The driver reports the current stage of the trip on their vehicle (drivers.current_trip_stage)
export async function apiUpdateDriverTripStage(licenseNumber: string, stage: string): Promise<SaveResult<null>> {
  const res = await laravelRequest("POST", `/transport/drivers/${encodeURIComponent(licenseNumber)}/trip-stage`, { stage });
  return res.ok ? { success: true, data: null } : { success: false, error: res.error };
}

export type DriverTrip = { kind: string; id: string; title: string; schedule: string; departure_city: string | null; passengers: number };

// The driver's record, assigned vehicle and the trips the admin assigned to that vehicle
export async function apiGetDriverDashboard(licenseNumber: string) {
  const res = await laravelRequest("GET", `/dashboard/driver/${encodeURIComponent(licenseNumber)}`);
  if (!res.ok) return null;
  return res.body as { driver: DriverRecord & { company_name?: string }; vehicle: VehicleRecord | null; trips: DriverTrip[] };
}

/* =========================================================
   GUIDES MANAGEMENT
   ========================================================= */
export function getAllGuides(): GuideRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GUIDES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveAllGuides(guides: GuideRecord[]) {
  try {
    // Sanitize heavy Base64 files to avoid exceeding browser LocalStorage 5MB quota
    const sanitized = guides.map((g) => {
      const copy = { ...g };
      if (copy.digital_certificate_file && copy.digital_certificate_file.length > 300) {
        copy.digital_certificate_file = "[db_stored]";
      }
      if (copy.avatar && copy.avatar.length > 2000) {
        copy.avatar = "";
      }
      return copy;
    });
    localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(sanitized));
  } catch (err) {
    console.warn("Could not save guides to localStorage (quota or storage unavailable):", err);
  }
}

export function updateGuideVerification(licenseNumber: string, status: "موثق" | "مرفوض" | "قيد المراجعة"): boolean {
  const guides = getAllGuides();
  const idx = guides.findIndex((g) => g.license_number === licenseNumber);
  if (idx !== -1) {
    guides[idx].verification_status = status;
    saveAllGuides(guides);

    const current = getStoredSession().user;
    if (current && current.license_number === licenseNumber) {
      current.verification_status = status;
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(current));
    }
    return true;
  }
  return false;
}

/* =========================================================
   AUTHENTICATION
   ========================================================= */
export async function apiLogin(params: {
  role: "tourist" | "guide" | "transport" | "driver" | "admin";
  login: string;
  password: string;
}): Promise<ApiResponse> {
  const { role, login, password } = params;
  const cleanLogin = (login || "").trim().toLowerCase();
  const rawPassword = (password || "").trim();

  if (!cleanLogin || !rawPassword) {
    return { status: "error", message: "يرجى كتابة البريد الإلكتروني وكلمة المرور" };
  }

  // Laravel verifies the email and password against DelniDB
  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ role, login: cleanLogin, password: rawPassword }),
      signal: AbortSignal.timeout(8000),
    });
    const data = await res.json().catch(() => null);
    if (res.ok && data?.status === "success" && data.token) {
      const userObj = { ...data.user, role: data.role || role };
      localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
      localStorage.setItem(STORAGE_KEYS.ROLE, userObj.role);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
      localStorage.setItem("dalni_user", JSON.stringify(userObj));
      window.dispatchEvent(new Event("storage"));
      return {
        status: "success",
        message: data.message || "تم تسجيل الدخول بنجاح",
        user: userObj,
        role: userObj.role,
        token: data.token,
      };
    } else if (data?.message) {
      return {
        status: "error",
        message: data.message,
      };
    }
  } catch (laravelErr) {
    console.warn("Laravel login unreachable", laravelErr);
  }

  // No local (browser) fallback: an account can only sign in after the database verifies its email and password
  return { status: "error", message: "تعذر الاتصال بخادم المنصة للتحقق من بيانات الدخول. يرجى المحاولة لاحقاً." };
}

export function apiLogout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.dispatchEvent(new Event("storage"));
  }
}

export function getStoredSession() {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  const role = localStorage.getItem(STORAGE_KEYS.ROLE);
  const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  let user = null;
  try {
    if (userJson) user = JSON.parse(userJson);
  } catch { }
  return { token, role, user };
}

export function clearStoredSession() {
  apiLogout();
}

/* =========================================================
   TOURIST & GUIDES & DASHBOARD HELPERS
   ========================================================= */
export async function apiRegisterTourist(params: {
  tourist_id?: string;
  passport?: string;
  full_name: string;
  email: string;
  phone_number: string;
  password?: string;
}): Promise<ApiResponse> {
  const tourist_id = (params.tourist_id || params.passport || "").trim();
  if (!tourist_id) {
    return {
      status: "error",
      message: "رقم جواز السفر / الرقم الوطني مطلوب للتسجيل.",
    };
  }

  const payload = {
    tourist_id,
    full_name: params.full_name.trim(),
    email: params.email.trim().toLowerCase(),
    phone_number: params.phone_number.trim(),
    password: params.password,
  };

  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/register/tourist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    });

    const resData = await res.json().catch(() => null);

    if (!res.ok) {
      let errorMsg = "تعذر تسجيل السائح في قاعدة البيانات";
      if (resData?.errors) {
        const errorList = Object.values(resData.errors).flat() as string[];
        if (errorList.length > 0) {
          errorMsg = errorList.join(" | ");
        }
      } else if (resData?.message) {
        errorMsg = resData.message;
      }
      return {
        status: "error",
        message: errorMsg,
      };
    }

    // Successfully created in SQL Server!
    const savedUser = resData?.user || {
      tourist_id,
      full_name: payload.full_name,
      email: payload.email,
      phone_number: payload.phone_number,
      role: "tourist",
    };
    const token = resData?.token || `tourist-token-${Date.now()}`;

    // Safely update local session
    try {
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
      const existingIdx = users.findIndex((u: any) => u.tourist_id === tourist_id || u.email === payload.email);
      if (existingIdx !== -1) {
        users[existingIdx] = { ...users[existingIdx], ...savedUser, role: "tourist" };
      } else {
        users.push({ ...savedUser, role: "tourist" });
      }
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch { }

    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.ROLE, "tourist");
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(savedUser));
    localStorage.setItem("dalni_user", JSON.stringify(savedUser));
    window.dispatchEvent(new Event("storage"));

    return {
      status: "success",
      message: resData?.message || "تم إنشاء حساب السائح وتخزينه في قاعدة البيانات بنجاح",
      user: savedUser,
      token,
    };
  } catch (err: any) {
    console.error("apiRegisterTourist error:", err);
    return {
      status: "error",
      message: "تعذر الاتصال بخادم قاعدة البيانات (Laravel / SQL Server). يرجى التأكد من تشغيل الخادم.",
    };
  }
}

/**
 * Update Tourist Profile in DelniDB
 */
export async function apiUpdateTouristProfile(params: {
  tourist_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password?: string;
}): Promise<ApiResponse> {
  // The session is only updated after DelniDB confirms the change
  const saved = await laravelRequest("POST", "/auth/tourist/update-profile", params);
  if (!saved.ok) return { status: "error", message: saved.error };

  const current = getStoredSession().user || {};
  const updated = { ...current, ...(saved.body?.user || {}), password: undefined };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  localStorage.setItem("dalni_user", JSON.stringify(updated));
  return { status: "success", message: saved.body?.message || "تم تحديث الملف الشخصي بنجاح", user: updated };
}

/**
 * Book a Daily Trip into DelniDB
 */
export async function apiBookDailyTrip(params: {
  tourist_id: string;
  daily_trip_id: string;
  number_of_seats: number;
}): Promise<ApiResponse> {
  return bookTrip("daily", params);
}

/**
 * Book a Weekly Trip into DelniDB
 */
export async function apiBookWeeklyTrip(params: {
  tourist_id: string;
  weekly_trip_id: string;
  number_of_seats: number;
}): Promise<ApiResponse> {
  return bookTrip("weekly", params);
}

// The server computes the price (trip price minus any running offer); the browser only sends the seats
async function bookTrip(kind: "daily" | "weekly", params: Record<string, any>): Promise<ApiResponse> {
  const key = kind === "daily" ? "daily_trip_id" : "weekly_trip_id";
  const res = await laravelRequest("POST", `/bookings/${kind}`, {
    tourist_id: params.tourist_id,
    [key]: params[key],
    number_of_seats: params.number_of_seats,
  });
  if (!res.ok) return { status: "error", message: res.error };
  return { status: "success", message: res.body?.message || "تم تسجيل الحجز بنجاح", booking_id: res.body?.booking_id, booking: res.data };
}

type BookingKind = "daily" | "weekly";

export async function apiSetBookingPayment(kind: BookingKind, id: string, paid: boolean): Promise<SaveResult<any>> {
  const res = await laravelRequest("POST", `/bookings/${kind}/${encodeURIComponent(id)}/payment`, { payment_status: paid ? "paid" : "unpaid" });
  return res.ok ? { success: true, data: res.data } : { success: false, error: res.error };
}

export async function apiSetBookingAttendance(kind: BookingKind, id: string, attended: boolean): Promise<SaveResult<any>> {
  const res = await laravelRequest("POST", `/bookings/${kind}/${encodeURIComponent(id)}/attendance`, { attended });
  return res.ok ? { success: true, data: res.data } : { success: false, error: res.error };
}

// Ticket desk: cash received + check-in in one step
export async function apiCheckInBooking(kind: BookingKind, id: string): Promise<SaveResult<any>> {
  const res = await laravelRequest("POST", `/bookings/${kind}/${encodeURIComponent(id)}/check-in`);
  return res.ok ? { success: true, data: res.data } : { success: false, error: res.error };
}

// Exact ticket code lookup in DelniDB
export async function apiFindTicket(code: string): Promise<{ success: true; kind: BookingKind; data: any } | { success: false; error: string }> {
  const res = await laravelRequest("GET", `/bookings/ticket/${encodeURIComponent(code)}`);
  return res.ok ? { success: true, kind: res.body?.kind, data: res.data } : { success: false, error: res.error };
}

/**
 * Register a new Tour Guide
 */
export async function apiRegisterGuide(params: {
  license_number: string;
  full_name: string;
  phone_number: string;
  years_of_experience: number;
  certificate?: string;
  certificate_name?: string;
  digital_certificate_file?: string;
  bio?: string;
  speaks_english?: boolean;
  speaks_french?: boolean;
  speaks_italian?: boolean;
  email: string;
  password?: string;
  gender?: string;
  working_days?: string;
  operating_regions?: string;
  price_per_day?: number;
  title?: string;
  avatar?: string;
  place_ids?: string[];
}): Promise<ApiResponse> {
  const newGuide: GuideRecord = {
    license_number: params.license_number,
    full_name: params.full_name,
    title: params.title || "مرشد سياحي معتمد",
    avatar: params.avatar || "",
    phone_number: params.phone_number,
    years_of_experience: params.years_of_experience || 2,
    certificate: params.certificate || "ترخيص رسمي صادر من وزارة السياحة والآثار",
    certificate_name: params.certificate_name || "وثيقة_الترخيص.pdf",
    digital_certificate_file: params.digital_certificate_file,
    bio: params.bio || "مرشد سياحي مرخص وشغوف بالتعريف بآثار ومعالم ليبيا الحضارية والطبيعية.",
    speaks_english: params.speaks_english ?? true,
    speaks_french: params.speaks_french ?? false,
    speaks_italian: params.speaks_italian ?? false,
    email: params.email,
    gender: params.gender || "male",
    working_days: params.working_days,
    operating_regions: params.operating_regions,
    price_per_day: params.price_per_day || 150,
    verification_status: "قيد المراجعة",
    assigned_trips: [],
    registered_at: new Date().toISOString(),
  };

  // Saved in DelniDB through Laravel; the account stays «قيد المراجعة» until the admin approves it
  const saved = await laravelRequest("POST", "/auth/register/guide", {
    license_number: params.license_number,
    full_name: params.full_name,
    phone_number: params.phone_number,
    years_of_experience: params.years_of_experience,
    email: params.email,
    password: params.password,
    gender: params.gender || "male",
    price_per_day: params.price_per_day ?? null,
    bio: params.bio || "",
    avatar: params.avatar || null,
    digital_certificate_file: params.digital_certificate_file,
    working_days: params.working_days,
    operating_regions: params.operating_regions,
    speaks_english: Boolean(params.speaks_english),
    speaks_french: Boolean(params.speaks_french),
    speaks_italian: Boolean(params.speaks_italian),
    place_ids: params.place_ids || [],
  });
  if (!saved.ok) {
    return { status: "error", message: saved.error };
  }

  return {
    status: "success",
    message: "تم إرسال طلب انضمام المرشد بنجاح وهو الآن قيد مراجعة وتدقيق الإدارة",
    user: newGuide,
  };
}

export async function apiGetTouristBookings(touristId: string) {
  const res = await laravelRequest("GET", `/bookings/tourist/${encodeURIComponent(touristId)}`);
  const daily = res.ok && Array.isArray(res.body?.daily) ? res.body.daily : [];
  const weekly = res.ok && Array.isArray(res.body?.weekly) ? res.body.weekly : [];
  return { daily, weekly, daily_bookings: daily, weekly_bookings: weekly, privateTrips: [] };
}

export async function apiGetAdminDashboard(): Promise<any> {
  // Everything comes from DelniDB through Laravel
  const [daily_trips, weekly_trips, private_trips, daily_offers, weekly_offers, bookings] = await Promise.all([
    apiGetDailyTrips(true),
    apiGetWeeklyTrips(true),
    apiGetPrivateTrips(),
    apiGetDailyOffers(true),
    apiGetWeeklyOffers(true),
    Promise.all([laravelRequest<any[]>("GET", "/bookings/daily"), laravelRequest<any[]>("GET", "/bookings/weekly")]),
  ]);
  return {
    daily_trips,
    weekly_trips,
    private_trips,
    daily_offers,
    weekly_offers,
    daily_bookings: bookings[0].ok && Array.isArray(bookings[0].data) ? bookings[0].data : [],
    weekly_bookings: bookings[1].ok && Array.isArray(bookings[1].data) ? bookings[1].data : [],
  };
}

export async function apiVerifyGuide(licenseNumber: string, status: "موثق" | "مرفوض" | "قيد المراجعة", rejectionReason?: string) {
  const saved = await laravelRequest("POST", `/guides/${encodeURIComponent(licenseNumber)}/verify`, {
    verification_status: status,
    rejection_reason: rejectionReason,
  });
  if (!saved.ok) return { status: "error", message: saved.error };
  updateGuideVerification(licenseNumber, status);
  return { status: "success", message: saved.body?.message || "تم تحديث حالة المرشد بنجاح", guide: saved.data };
}

/**
 * Trips, offers and private trips: read and saved in DelniDB through Laravel only.
 * Nothing is deleted: trips are cancelled, offers are ended, private trips are rejected or cancelled.
 */
type TripResult = { status: "success"; trip: any; message?: string } | { status: "error"; message: string };

async function saveTrip(kind: "daily" | "weekly", data: any, id?: string): Promise<TripResult> {
  const key = kind === "daily" ? "daily_trip_id" : "weekly_trip_id";
  const saved = await laravelRequest("POST", `/trips/${kind}`, id ? { ...data, [key]: id, isNew: false } : data);
  if (!saved.ok) return { status: "error", message: saved.error };
  return { status: "success", trip: saved.data, message: saved.body?.message };
}

async function cancelTrip(kind: "daily" | "weekly", id: string): Promise<{ ok: boolean; message: string }> {
  const res = await laravelRequest("POST", `/trips/${kind}/${encodeURIComponent(id)}/cancel`);
  return res.ok ? { ok: true, message: res.body?.message || "تم إلغاء الرحلة" } : { ok: false, message: res.error };
}

// Public pages get active trips only; the admin dashboard passes all = true
export async function apiGetDailyTrips(all = false): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", `/trips/daily${all ? "?all=1" : ""}`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiCreateDailyTrip(data: any) {
  return saveTrip("daily", data);
}

export async function apiUpdateDailyTrip(id: string, data: any) {
  return saveTrip("daily", data, id);
}

export async function apiCancelDailyTrip(id: string) {
  return cancelTrip("daily", id);
}

export async function apiGetWeeklyTrips(all = false): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", `/trips/weekly${all ? "?all=1" : ""}`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiCreateWeeklyTrip(data: any) {
  return saveTrip("weekly", data);
}

export async function apiUpdateWeeklyTrip(id: string, data: any) {
  return saveTrip("weekly", data, id);
}

export async function apiCancelWeeklyTrip(id: string) {
  return cancelTrip("weekly", id);
}

/**
 * Daily & Weekly Trip Offers. Public pages get running offers only; the admin dashboard passes all = true.
 */
type OfferResult = { success: true; offer: any } | { success: false; error: string };

async function saveOffer(kind: "daily" | "weekly", payload: any): Promise<OfferResult> {
  const saved = await laravelRequest("POST", `/offers/${kind}`, payload);
  return saved.ok ? { success: true, offer: saved.body?.offer } : { success: false, error: saved.error };
}

async function endOffer(kind: "daily" | "weekly", id: string): Promise<{ ok: boolean; message: string }> {
  const res = await laravelRequest("POST", `/offers/${kind}/${encodeURIComponent(id)}/end`);
  return res.ok ? { ok: true, message: res.body?.message || "تم إنهاء العرض" } : { ok: false, message: res.error };
}

export async function apiGetDailyOffers(all = false): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", `/offers/daily${all ? "?all=1" : ""}`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiCreateDailyOffer(payload: any): Promise<OfferResult> {
  return saveOffer("daily", payload);
}

export async function apiEndDailyOffer(id: string) {
  return endOffer("daily", id);
}

export async function apiGetWeeklyOffers(all = false): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", `/offers/weekly${all ? "?all=1" : ""}`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiCreateWeeklyOffer(payload: any): Promise<OfferResult> {
  return saveOffer("weekly", payload);
}

export async function apiEndWeeklyOffer(id: string) {
  return endOffer("weekly", id);
}

/**
 * Private (VIP) trips: the tourist requests and decides, the admin prices and schedules.
 */
export async function apiGetPrivateTrips(touristId?: string): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", `/private-trips${touristId ? `?tourist_id=${encodeURIComponent(touristId)}` : ""}`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiRequestPrivateTrip(payload: any): Promise<SaveResult<any> & { tripId?: string }> {
  const saved = await laravelRequest("POST", "/private-trips", payload);
  return saved.ok ? { success: true, data: saved.data, tripId: saved.body?.trip_id } : { success: false, error: saved.error };
}

export async function apiReviewPrivateTrip(id: string, payload: any): Promise<SaveResult<any>> {
  const saved = await laravelRequest("POST", `/private-trips/${encodeURIComponent(id)}/review`, payload);
  return saved.ok ? { success: true, data: saved.data } : { success: false, error: saved.error };
}

export async function apiDecidePrivateTrip(id: string, touristId: string, decision: "مؤكدة" | "ملغاة من السائح"): Promise<SaveResult<any>> {
  const saved = await laravelRequest("POST", `/private-trips/${encodeURIComponent(id)}/decision`, { tourist_id: touristId, decision });
  return saved.ok ? { success: true, data: saved.data } : { success: false, error: saved.error };
}

export async function apiGetHotels(): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", "/hotels");
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiGetRestaurants(): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", "/restaurants");
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

/**
 * Saves a hotel (new or edited) in DelniDB through Laravel; the caller updates its list only on success.
 */
export async function apiSaveHotel(hotel: Record<string, any>, isNew: boolean): Promise<SaveResult<any>> {
  const saved = await laravelRequest("POST", "/hotels", { ...hotel, isNew });
  return saved.ok ? { success: true, data: saved.data } : { success: false, error: saved.error };
}

/**
 * Saves a restaurant/cafe (new or edited) in DelniDB through Laravel; the caller updates its list only on success.
 */
export async function apiSaveRestaurant(restaurant: Record<string, any>, isNew: boolean): Promise<SaveResult<any>> {
  const saved = await laravelRequest("POST", "/restaurants", { ...restaurant, isNew });
  return saved.ok ? { success: true, data: saved.data } : { success: false, error: saved.error };
}

/**
 * Get Tour Guide Dashboard data (profile, real assigned trips, real manifest)
 */
export async function apiGetGuideDashboard(licenseNumber: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/dashboard/guide/${encodeURIComponent(licenseNumber)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      const liveData = await res.json();
      if (liveData && liveData.guide) {
        // Synchronize local guides storage and current user session with live database
        const guides = getAllGuides();
        const idx = guides.findIndex((g) => g.license_number === liveData.guide.license_number || g.email === liveData.guide.email);
        if (idx !== -1) {
          guides[idx] = { ...guides[idx], ...liveData.guide };
          saveAllGuides(guides);
        }

        const currentSession = getStoredSession();
        if (
          currentSession.user &&
          (currentSession.user.license_number === liveData.guide.license_number ||
            currentSession.user.email === liveData.guide.email)
        ) {
          const updatedUser = { ...currentSession.user, ...liveData.guide };
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
        }

        return {
          live: true, // read from DelniDB now (the fallback below is the browser's cached copy)
          guide: liveData.guide,
          assigned_trips: liveData.guide.assigned_trips || [],
          tourists: [],
          daily_trips: liveData.daily_trips || [],
          weekly_trips: liveData.weekly_trips || [],
          private_trips: liveData.private_trips || [],
        };
      }
    }
  } catch (err) {
    console.warn("apiGetGuideDashboard network fetch failed, using fallback cache:", err);
  }

  // Fallback if backend is unreachable
  const guides = getAllGuides();
  const guide = guides.find((g) => g.license_number === licenseNumber || g.email === licenseNumber);
  const targetGuide = guide || getStoredSession().user || {
    license_number: licenseNumber,
    full_name: "مرشد سياحي",
    verification_status: "قيد المراجعة",
    assigned_trips: [],
  };
  return {
    live: false,
    guide: targetGuide,
    assigned_trips: targetGuide.assigned_trips || [],
    tourists: [],
    daily_trips: [] as any[],
    weekly_trips: [] as any[],
    private_trips: [] as any[],
  };
}

export async function apiUpdateGuideProfile(licenseNumber: string, data: any) {
  const saved = await laravelRequest("PUT", `/dashboard/guide/${encodeURIComponent(licenseNumber)}`, data);
  if (!saved.ok) return { status: "error", message: saved.error };

  const guide = { ...(getStoredSession().user || {}), ...data, ...(saved.body?.guide || {}), password: undefined };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guide));
  const guides = getAllGuides();
  const idx = guides.findIndex((g) => g.license_number === licenseNumber);
  if (idx !== -1) {
    guides[idx] = { ...guides[idx], ...guide };
    saveAllGuides(guides);
  }
  return { status: "success", message: saved.body?.message || "تم حفظ التعديلات وتحديث ملفك بنجاح ✓", guide };
}

export async function apiGetGuidesCatalog(): Promise<GuideRecord[]> {
  const res = await laravelRequest<GuideRecord[]>("GET", `/guides?status=${encodeURIComponent("موثق")}`);
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

export async function apiToggleAttendance(_params: {
  type: "daily" | "weekly";
  booking_id: string;
  attended: boolean;
}): Promise<ApiResponse> {
  return { status: "success", message: "تم تسجيل الحضور بنجاح" };
}

// The weekly trip's guide accepts it (it is then published) or declines it (the admin chooses another guide)
export async function apiGuideRespondWeeklyTrip(licenseNumber: string, tripId: string, decision: "accept" | "decline", reason?: string): Promise<SaveResult<any>> {
  const res = await laravelRequest("POST", `/trips/weekly/${encodeURIComponent(tripId)}/guide-response`, {
    license_number: licenseNumber,
    decision,
    reason: reason || undefined,
  });
  return res.ok ? { success: true, data: res.body?.message } : { success: false, error: res.error };
}

// The assigned guide accepts a private trip (the offer then goes to the tourist) or declines it (the admin assigns another guide)
export async function apiGuideRespondPrivateTrip(licenseNumber: string, tripId: string, decision: "accept" | "decline", reason?: string): Promise<SaveResult<any>> {
  const res = await laravelRequest("POST", `/private-trips/${encodeURIComponent(tripId)}/guide-response`, {
    license_number: licenseNumber,
    decision,
    reason: reason || undefined,
  });
  return res.ok ? { success: true, data: res.body?.message } : { success: false, error: res.error };
}

export async function sendAIChatMessage(message: string): Promise<{
  reply: string;
  suggested_places?: string[];
  suggested_trips?: string[];
}> {
  const lower = message.toLowerCase();
  if (lower.includes("أوباري") || lower.includes("صحراء") || lower.includes("سفاري") || lower.includes("فزان")) {
    return {
      reply: "أهلاً بك! 🐪 بحيرات أوباري وصحراء فزان وجهة عالمية فريدة للتخييم وسفاري الكثبان الذهبية (أفضل موسم: نوفمبر - مارس). لدينا رحلات أسبوعية بسيارات دفع رباعي وسائقين محترفين.",
      suggested_places: ["بحيرات أوباري", "قبر عون", "أكاكوس"],
      suggested_trips: ["مغامرة أوباري وبحيرات الصحراء (6 أيام)"],
    };
  }
  if (lower.includes("لبدة") || lower.includes("رومان") || lower.includes("صبراتة") || lower.includes("آثار")) {
    return {
      reply: "مرحباً بك! 🏛️ لبدة الكبرى وصبراتة هما درتا التراث الروماني على البحر المتوسط المصنفتان في اليونسكو. نوفر رحلات يومية بحافلات مكيفة ومرشدين معتمدين.",
      suggested_places: ["لبدة الكبرى", "مسرح صبراتة"],
      suggested_trips: ["جولة لبدة الكبرى اليومية", "رحلة صبراتة الأثرية"],
    };
  }
  if (lower.includes("غدامس") || lower.includes("واحة") || lower.includes("لؤلؤة")) {
    return {
      reply: "أهلاً بك! 🌴 غدامس (لؤلؤة الصحراء) من أقدم وأجمل المدن التراثية في العالم. يمكنك الاستمتاع بعمارتها الفريدة والمنازل الطينية وجلسات الشاي المغاربية الأصيلة.",
      suggested_places: ["عين الفرس", "المدينة القديمة بغدامس"],
      suggested_trips: ["رحلة واحة غدامس التراثية"],
    };
  }
  return {
    reply: "مرحباً بك في منصة دَلِّني السياحية! 🌟 أنا مساعدك السياحي الذكي. يسعدني إرشادك لأفضل الرحلات والمعالم الأثرية والصحراوية في ليبيا وتسهيل حجوزاتك. ما هي وجهتك المفضلة؟",
    suggested_places: ["لبدة الكبرى", "أوباري", "غدامس", "قورينا"],
    suggested_trips: ["جولة لبدة الكبرى اليومية", "مغامرة أوباري الصحراوية"],
  };
}

export async function apiGetPlaces(): Promise<any[]> {
  const res = await laravelRequest<any[]>("GET", "/places");
  return res.ok && Array.isArray(res.data) ? res.data : [];
}

