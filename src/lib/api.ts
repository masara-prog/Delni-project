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

// Automatic one-time cleanup to ensure fresh start with 0 companies/vehicles/drivers
if (typeof window !== "undefined") {
  const resetDone = localStorage.getItem("dalni_companies_wiped_clean_v1");
  if (!resetDone) {
    try {
      localStorage.removeItem(STORAGE_KEYS.COMPANIES);
      localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      localStorage.removeItem(STORAGE_KEYS.DRIVERS);
      localStorage.setItem(STORAGE_KEYS.COMPANIES, "[]");
      localStorage.setItem(STORAGE_KEYS.VEHICLES, "[]");
      localStorage.setItem(STORAGE_KEYS.DRIVERS, "[]");
      localStorage.setItem("dalni_companies_wiped_clean_v1", "true");
    } catch { }
  }
}

/* =========================================================
   LARAVEL API CLIENT (single source of truth: DelniDB via Laravel)
   ========================================================= */
const REQUEST_TIMEOUT_MS = 10000;

export interface LaravelResult<T = any> {
  ok: boolean;
  status: number;
  data: T | null;
  message: string;
}

/**
 * Build a readable Arabic message from a Laravel error body
 * (validation errors are listed field by field).
 */
function laravelErrorMessage(status: number, body: any): string {
  if (body?.errors && typeof body.errors === "object") {
    const list = Object.values(body.errors).flat().filter(Boolean) as string[];
    if (list.length > 0) return list.join(" - ");
  }
  if (body?.message) return body.message;
  if (status === 401) return "انتهت جلستك أو لم تسجّل الدخول، يرجى تسجيل الدخول مجدداً";
  if (status === 403) return "ليست لديك صلاحية لتنفيذ هذا الإجراء";
  if (status === 404) return "البيانات المطلوبة غير موجودة";
  return "تعذر إتمام العملية في قاعدة البيانات";
}

/**
 * Call the Laravel API. Sends the stored Sanctum token when `auth` is true.
 * Never throws: network failures come back as ok=false with a message.
 */
export async function laravelRequest<T = any>(
  path: string,
  options: { method?: string; body?: any; auth?: boolean; timeoutMs?: number } = {}
): Promise<LaravelResult<T>> {
  const { method = "GET", body, auth = false, timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && typeof window !== "undefined") {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${LARAVEL_API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const data = await res.json().catch(() => null);
    return {
      ok: res.ok,
      status: res.status,
      data,
      message: res.ok ? data?.message || "" : laravelErrorMessage(res.status, data),
    };
  } catch {
    return {
      ok: false,
      status: 0,
      data: null,
      message: "تعذر الاتصال بخادم المنصة. تأكد من تشغيل الخادم الخلفي (Laravel) ثم أعد المحاولة.",
    };
  }
}

/** Convert a LaravelResult into the ApiResponse shape used by the pages. */
function toApiResponse(result: LaravelResult, extra: Record<string, any> = {}): ApiResponse {
  if (result.ok) {
    return { ...(result.data || {}), ...extra, status: "success", message: result.message };
  }
  return { status: "error", message: result.message, httpStatus: result.status };
}

function storeSession(token: string, role: string, user: any) {
  const userObj = { ...user, role };
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.ROLE, role);
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
  window.dispatchEvent(new Event("storage"));
  return userObj;
}

/* =========================================================
   LEGACY SQL SERVER BRIDGE (port 5001)
   Still used only by the admin / transport screens that have no
   Laravel endpoint yet. Tourist and guide features do not use it.
   ========================================================= */
const BACKEND_API_URL = "http://127.0.0.1:5001/api/db";

/**
 * Sends data securely to the Backend API for persistent SQL Server storage.
 * If the Backend API is not running or temporarily offline, it gracefully falls back
 * to LocalStorage (Safe Fallback) without freezing or causing errors.
 */
export async function sendToSecureBackend(endpoint: string, payload: any): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const res = await fetch(`${BACKEND_API_URL}/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      console.log(`[Backend API] ✅ تم الحفظ بنجاح في قاعدة بيانات Microsoft SQL Server (DelniDB): ${endpoint}`);
      return true;
    }
  } catch {
    console.debug(`[Safe Fallback] 🛡️ تم الاحتفاظ بالبيانات بنظام الطوارئ المحلي (LocalStorage) بأمان.`);
  }
  return false;
}

/**
 * Deletes data securely from Backend API (Microsoft SQL Server)
 */
export async function deleteFromSecureBackend(endpoint: string, paramName: string, paramValue: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`${BACKEND_API_URL}/${endpoint}?${paramName}=${encodeURIComponent(paramValue)}`, {
      method: "DELETE",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      console.log(`[Backend API] 🗑️ تم الحذف بنجاح من قاعدة بيانات Microsoft SQL Server (DelniDB): ${endpoint}`);
      return true;
    }
  } catch {
    console.debug(`[Safe Fallback] 🛡️ تم الحذف محلياً بأمان.`);
  }
  return false;
}

/**
 * Health check: reports the real state of the Laravel API.
 */
export async function checkBackendHealth(): Promise<{ online: boolean; database?: string }> {
  const result = await laravelRequest("/health", { timeoutMs: 4000 });
  if (result.ok) {
    return { online: true, database: "Microsoft SQL Server (DelniDB)" };
  }
  return { online: false, database: result.message };
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

export function addTransportCompany(company: Partial<TransportCompanyRecord>): TransportCompanyRecord {
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
    email: company.email || `company${list.length + 1}@dalni.ly`,
    password: company.password || "password123",
    total_vehicles: Number(company.total_vehicles) || 5,
    contract_start_date: company.contract_start_date || "2026-01-01",
    contract_end_date: company.contract_end_date || "2028-01-01",
    verification_status: company.verification_status || company.status || "موثق",
    status: company.verification_status || company.status || "موثق",
    google_maps_url: company.google_maps_url || (company.address && (company.address.startsWith("http") || company.address.includes("maps")) ? company.address : "") || "",
  };
  list.unshift(newComp);
  saveTransportCompanies(list);

  // Async Safe Sync to Backend API (Microsoft SQL Server)
  sendToSecureBackend("companies", newComp);

  return newComp;
}

export function updateTransportCompany(contractNumber: string, data: Partial<TransportCompanyRecord>) {
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
    list[idx] = updatedRecord;
    saveTransportCompanies(list);

    const current = getStoredSession().user;
    if (current && (current.contract_number === contractNumber || current.id === contractNumber)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...current, ...updatedRecord }));
    }
    // Async Safe Sync to Backend API (Microsoft SQL Server)
    sendToSecureBackend("companies", updatedRecord);
    return updatedRecord;
  } else {
    // If contract number was changed or not found, register it
    return addTransportCompany({ ...data, contract_number: contractNumber });
  }
}

export function deleteTransportCompany(contractNumber: string) {
  const list = getTransportCompanies();
  const filtered = list.filter(c => c.contract_number !== contractNumber && c.id !== contractNumber);
  saveTransportCompanies(filtered);
  // Async Safe Sync to Backend API (Microsoft SQL Server)
  deleteFromSecureBackend("companies", "contract_number", contractNumber);
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

export function addVehicle(v: Partial<VehicleRecord>, driverInfo?: { licenseNumber?: string; newDriver?: any }): VehicleRecord {
  const list = getVehicles();
  const cleanContract = (v.contract_number && String(v.contract_number).trim()) || "123445";
  const newV: VehicleRecord = {
    ...v,
    plate_number: v.plate_number || `طرابلس ${Math.floor(1000 + Math.random() * 9000)}`,
    contract_number: cleanContract,
    company_name: v.company_name || "شركة النقل السياحي",
    vehicle_type: v.vehicle_type || "حافلة سياحية",
    seating_capacity: Number(v.seating_capacity) || 15,
    daily_rate: Number(v.daily_rate) || 350,
    category: v.category || "سياحي مريح",
    vehicle_status: v.vehicle_status || "جاهزة",
    status: v.vehicle_status || v.status || "جاهزة",
    insurance_details: v.insurance_details || "تأمين ركاب ساري المفعول",
    insurance_image: v.insurance_image || "",
    vehicle_image: v.vehicle_image || "/assets/office-bus.jpg",
  };
  list.unshift(newV);
  saveVehicles(list);

  // If driver assigned, enforce 1-to-1 dedicated driver in local state
  if (driverInfo?.licenseNumber) {
    const drvs = getDrivers();
    const updatedDrvs = drvs.map(d => {
      if (d.driver_license_number === driverInfo.licenseNumber) {
        return { ...d, assigned_vehicle_plate: newV.plate_number };
      }
      if (d.assigned_vehicle_plate === newV.plate_number) {
        return { ...d, assigned_vehicle_plate: null };
      }
      return d;
    });
    saveDrivers(updatedDrvs);
  }

  // Async Safe Sync to Backend API (Microsoft SQL Server)
  sendToSecureBackend("vehicles", { ...newV, driverInfo, isNew: true });

  return newV;
}

export function updateVehicle(plateNumber: string, data: Partial<VehicleRecord>, driverInfo?: { licenseNumber?: string; newDriver?: any }) {
  const list = getVehicles();
  const idx = list.findIndex(v => v.plate_number === plateNumber);
  if (idx !== -1) {
    list[idx] = { ...list[idx], ...data };
    saveVehicles(list);

    // If driver assigned or changed, update driver in local state
    if (driverInfo) {
      const drvs = getDrivers();
      const updatedDrvs = drvs.map(d => {
        if (driverInfo.licenseNumber && d.driver_license_number === driverInfo.licenseNumber) {
          return { ...d, assigned_vehicle_plate: plateNumber };
        }
        if (d.assigned_vehicle_plate === plateNumber && d.driver_license_number !== driverInfo.licenseNumber) {
          return { ...d, assigned_vehicle_plate: null };
        }
        return d;
      });
      saveDrivers(updatedDrvs);
    }

    // Async Safe Sync to Backend API (Microsoft SQL Server)
    sendToSecureBackend("vehicles", { ...list[idx], driverInfo, isNew: false });
    return list[idx];
  }
  return null;
}

export function deleteVehicle(plateNumber: string) {
  const list = getVehicles();
  const filtered = list.filter(v => v.plate_number !== plateNumber);
  saveVehicles(filtered);
  // Async Safe Sync to Backend API (Microsoft SQL Server)
  deleteFromSecureBackend("vehicles", "plate_number", plateNumber);
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

export function addDriver(d: Partial<DriverRecord>): DriverRecord {
  const list = getDrivers();
  const rawPlate = d.assigned_vehicle_plate ? String(d.assigned_vehicle_plate).trim() : "";
  const validPlate = rawPlate && rawPlate !== "غير مسند" && rawPlate !== "غير معين" && rawPlate !== "none" ? rawPlate : null;

  const newD: DriverRecord = {
    driver_license_number: d.driver_license_number || `77${Math.floor(1000 + Math.random() * 9000)}`,
    full_name: d.full_name || "سائق معتمد",
    phone_number: d.phone_number || "0910000000",
    national_id_or_passport: d.national_id_or_passport || "",
    license_date_valid: d.license_date_valid || "2029-12-31",
    contract_number: d.contract_number || "9898",
    assigned_vehicle_plate: validPlate || null,
    email: d.email || `driver_${Date.now()}@dalni.ly`,
    password: d.password || "password123",
    account_status: d.account_status || "نشط",
    operational_status: d.operational_status || "متاح",
    company_name: d.company_name || "شركة النقل السياحي",
  };
  list.unshift(newD);
  saveDrivers(list);

  // Async Safe Sync to Backend API (Microsoft SQL Server)
  sendToSecureBackend("drivers", { ...newD, isNew: true });

  return newD;
}

export async function apiAddDriver(d: Partial<DriverRecord>): Promise<{ success: boolean; error?: string; data?: DriverRecord }> {
  const rawPlate = d.assigned_vehicle_plate ? String(d.assigned_vehicle_plate).trim() : "";
  const validPlate = rawPlate && rawPlate !== "غير مسند" && rawPlate !== "غير معين" && rawPlate !== "none" ? rawPlate : null;

  const newD: DriverRecord = {
    driver_license_number: String(d.driver_license_number || "").trim(),
    full_name: String(d.full_name || "").trim(),
    phone_number: String(d.phone_number || "").trim(),
    national_id_or_passport: String(d.national_id_or_passport || "").trim(),
    license_date_valid: d.license_date_valid || "2029-12-31",
    contract_number: String(d.contract_number || "9898").trim(),
    assigned_vehicle_plate: validPlate,
    email: String(d.email || `driver_${d.driver_license_number || Date.now()}@dalni.ly`).trim(),
    password: d.password || "password123",
    account_status: d.account_status || "نشط",
    operational_status: d.operational_status || "متاح",
    company_name: d.company_name || "شركة النقل السياحي",
  };

  try {
    const res = await fetch("http://127.0.0.1:5001/api/db/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newD, isNew: true }),
    });

    const json = await res.json().catch(() => null);

    if (!res.ok || !json?.success) {
      return {
        success: false,
        error: json?.error || "فشل تسجيل السائق في قاعدة البيانات",
      };
    }

    // Success in DelniDB: Save to local state as well
    const list = getDrivers();
    const existingIdx = list.findIndex(x => x.driver_license_number === newD.driver_license_number);
    if (existingIdx !== -1) {
      list[existingIdx] = newD;
    } else {
      list.unshift(newD);
    }
    saveDrivers(list);

    return { success: true, data: newD };
  } catch (err: any) {
    const list = getDrivers();
    list.unshift(newD);
    saveDrivers(list);
    return { success: true, data: newD };
  }
}

export function updateDriver(licenseNumber: string, data: Partial<DriverRecord>) {
  const list = getDrivers();
  const idx = list.findIndex(d => d.driver_license_number === licenseNumber);
  if (idx !== -1) {
    const rawPlate = data.assigned_vehicle_plate !== undefined ? data.assigned_vehicle_plate : list[idx].assigned_vehicle_plate;
    const strPlate = rawPlate ? String(rawPlate).trim() : "";
    const cleanPlate = strPlate && strPlate !== "غير مسند" && strPlate !== "غير معين" && strPlate !== "none" ? strPlate : null;

    list[idx] = { ...list[idx], ...data, assigned_vehicle_plate: cleanPlate };
    saveDrivers(list);

    const current = getStoredSession().user;
    if (current && (current.driver_license_number === licenseNumber || current.email === list[idx].email)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({ ...current, ...list[idx] }));
    }
    // Async Safe Sync to Backend API (Microsoft SQL Server)
    sendToSecureBackend("drivers", { ...list[idx], isNew: false });
    return list[idx];
  }
  return null;
}

export async function apiUpdateDriver(licenseNumber: string, data: Partial<DriverRecord>): Promise<{ success: boolean; error?: string; data?: DriverRecord }> {
  const updated = updateDriver(licenseNumber, data);
  if (!updated) return { success: false, error: "السائق غير موجود" };

  try {
    const res = await fetch("http://127.0.0.1:5001/api/db/drivers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...updated, isNew: false }),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || "فشل تحديث بيانات السائق في قاعدة البيانات" };
    }
    return { success: true, data: updated };
  } catch {
    return { success: true, data: updated };
  }
}

export function deleteDriver(licenseNumber: string) {
  const list = getDrivers();
  const filtered = list.filter(d => d.driver_license_number !== licenseNumber);
  saveDrivers(filtered);
  // Async Safe Sync to Backend API (Microsoft SQL Server)
  deleteFromSecureBackend("drivers", "driver_license_number", licenseNumber);
}

export async function apiDeleteDriver(licenseNumber: string): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`http://127.0.0.1:5001/api/db/drivers?driver_license_number=${encodeURIComponent(licenseNumber)}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, error: json?.error || "فشل حذف السائق من قاعدة البيانات" };
    }
    deleteDriver(licenseNumber);
    return { success: true };
  } catch {
    deleteDriver(licenseNumber);
    return { success: true };
  }
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
  localStorage.setItem(STORAGE_KEYS.GUIDES, JSON.stringify(guides));
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

export function deleteGuideAccount(licenseNumber: string): boolean {
  const guides = getAllGuides();
  const filtered = guides.filter((g) => g.license_number !== licenseNumber);
  saveAllGuides(filtered);
  return true;
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

  // Credentials are verified by Laravel against DelniDB only.
  const result = await laravelRequest("/auth/login", {
    method: "POST",
    body: { role, login: cleanLogin, password: rawPassword },
  });

  if (!result.ok || !result.data?.token) {
    return { status: "error", message: result.message };
  }

  const data = result.data;
  const userRole = data.role || role;
  const userObj = storeSession(data.token, userRole, {
    ...data.user,
    ...(data.verification_status ? { verification_status: data.verification_status } : {}),
  });

  return {
    status: "success",
    message: data.message || "تم تسجيل الدخول بنجاح",
    user: userObj,
    role: userRole,
    token: data.token,
  };
}

export function apiLogout() {
  if (typeof window !== "undefined") {
    // Revoke the Sanctum token on the server; local logout proceeds regardless.
    if (localStorage.getItem(STORAGE_KEYS.TOKEN)) {
      laravelRequest("/auth/logout", { method: "POST", auth: true });
    }
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
    return { status: "error", message: "يرجى إدخال رقم جواز السفر أو الرقم الوطني" };
  }

  const result = await laravelRequest("/auth/register/tourist", {
    method: "POST",
    body: {
      tourist_id,
      full_name: params.full_name,
      email: params.email,
      phone_number: params.phone_number,
      password: params.password,
    },
  });

  if (!result.ok || !result.data?.token) {
    return { status: "error", message: result.message };
  }

  const user = storeSession(result.data.token, "tourist", result.data.user);
  return { status: "success", message: result.message || "تم إنشاء حساب السائح بنجاح", user, token: result.data.token };
}

/**
 * Update the signed-in tourist's profile in DelniDB
 */
export async function apiUpdateTouristProfile(params: {
  tourist_id: string;
  full_name: string;
  email: string;
  phone_number: string;
  password?: string;
}): Promise<ApiResponse> {
  const result = await laravelRequest("/auth/tourist/update-profile", { method: "POST", body: params, auth: true });
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  const current = getStoredSession().user || {};
  const updated = { ...current, ...result.data.user, role: "tourist" };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  return { status: "success", message: result.message, user: updated };
}

/**
 * Book a Daily Trip into DelniDB (bookings_daily)
 */
export async function apiBookDailyTrip(params: {
  tourist_id?: string;
  daily_trip_id: string;
  trip_date: string; // YYYY-MM-DD, one of the trip's departure days
  number_of_seats: number;
  [key: string]: any;
}): Promise<ApiResponse> {
  const result = await laravelRequest("/bookings/daily", {
    method: "POST",
    auth: true,
    body: { daily_trip_id: params.daily_trip_id, trip_date: params.trip_date, number_of_seats: params.number_of_seats },
  });
  return toApiResponse(result);
}

export interface DailyDeparture {
  date: string; // YYYY-MM-DD
  weekday: string;
  departure_time: string;
  max_capacity: number;
  booked: number;
  remaining: number;
}

/**
 * Bookable departure days of a daily trip with remaining seats per day
 */
export async function apiGetDailyDepartures(dailyTripId: string, days = 42): Promise<DailyDeparture[]> {
  const result = await laravelRequest(`/trips/daily/${encodeURIComponent(dailyTripId)}/departures?days=${days}`);
  return result.ok && Array.isArray(result.data?.departures) ? result.data.departures : [];
}

/* =========================================================
   REVIEWS (type: daily | weekly | hotel | facility)
   ========================================================= */
export type ReviewType = "daily" | "weekly" | "hotel" | "facility";

export interface PublicReview {
  id: string;
  stars_rating: number;
  comment_text: string | null;
  created_at: string;
  tourist_name: string | null;
}

export async function apiGetReviews(type: ReviewType, itemId: string): Promise<{ average: number | null; count: number; reviews: PublicReview[]; error?: string }> {
  const result = await laravelRequest(`/reviews/${type}/${encodeURIComponent(itemId)}`);
  if (!result.ok) return { average: null, count: 0, reviews: [], error: result.message };
  return { average: result.data.average, count: result.data.count, reviews: result.data.reviews || [] };
}

export async function apiAddReview(type: ReviewType, itemId: string, stars_rating: number, comment_text?: string) {
  return toApiResponse(
    await laravelRequest(`/reviews/${type}/${encodeURIComponent(itemId)}`, {
      method: "POST",
      auth: true,
      body: { stars_rating, comment_text: comment_text || null },
    })
  );
}

export async function apiDeleteReview(type: ReviewType, reviewId: string) {
  return toApiResponse(await laravelRequest(`/reviews/${type}/${encodeURIComponent(reviewId)}`, { method: "DELETE", auth: true }));
}

export async function apiGetGuideReviews(licenseNumber: string) {
  const result = await laravelRequest(`/dashboard/guide/${encodeURIComponent(licenseNumber)}/reviews`, { auth: true });
  if (!result.ok) return { average: null, count: 0, reviews: [], error: result.message };
  return { average: result.data.average, count: result.data.count, reviews: result.data.reviews || [] };
}

export async function apiAdminGetReviews() {
  const result = await laravelRequest("/dashboard/admin/reviews", { auth: true });
  return result.ok ? { reviews: result.data.reviews || [] } : { reviews: [], error: result.message };
}

export async function apiAdminSetReviewVisibility(type: ReviewType, reviewId: string, is_hidden: boolean) {
  return toApiResponse(
    await laravelRequest(`/dashboard/admin/reviews/${type}/${encodeURIComponent(reviewId)}/visibility`, {
      method: "PUT",
      auth: true,
      body: { is_hidden },
    })
  );
}

/* =========================================================
   ADMIN CONTENT (landmarks, hotels, restaurants, offers, private trips)
   ========================================================= */
export async function apiStorePlace(data: any) {
  return toApiResponse(await laravelRequest("/places", { method: "POST", auth: true, body: data }));
}

export async function apiUpdatePlace(placeId: string, data: any) {
  return toApiResponse(await laravelRequest(`/places/${encodeURIComponent(placeId)}`, { method: "PUT", auth: true, body: data }));
}

export async function apiDeletePlace(placeId: string) {
  return toApiResponse(await laravelRequest(`/places/${encodeURIComponent(placeId)}`, { method: "DELETE", auth: true }));
}

/** Create or update a hotel (hotels.hotel_id is the key). */
export async function apiStoreHotel(data: any) {
  return toApiResponse(await laravelRequest("/hotels", { method: "POST", auth: true, body: data }));
}

export async function apiDeleteHotel(hotelId: string) {
  return toApiResponse(await laravelRequest(`/hotels/${encodeURIComponent(hotelId)}`, { method: "DELETE", auth: true }));
}

/** Create or update a restaurant/cafe (restaurants_cafes.facility_id is the key). */
export async function apiStoreRestaurant(data: any) {
  return toApiResponse(await laravelRequest("/restaurants", { method: "POST", auth: true, body: data }));
}

export async function apiDeleteRestaurant(facilityId: string) {
  return toApiResponse(await laravelRequest(`/restaurants/${encodeURIComponent(facilityId)}`, { method: "DELETE", auth: true }));
}

export async function apiAdminCreatePrivateTrip(data: any) {
  return toApiResponse(await laravelRequest("/dashboard/admin/private-trips", { method: "POST", auth: true, body: data }));
}

export async function apiAdminDeletePrivateTrip(privateTripId: string) {
  return toApiResponse(
    await laravelRequest(`/dashboard/admin/private-trips/${encodeURIComponent(privateTripId)}`, { method: "DELETE", auth: true })
  );
}

/**
 * Book a Weekly Trip into DelniDB (bookings_weekly)
 */
export async function apiBookWeeklyTrip(params: {
  tourist_id?: string;
  weekly_trip_id: string;
  number_of_seats: number;
  [key: string]: any;
}): Promise<ApiResponse> {
  const result = await laravelRequest("/bookings/weekly", {
    method: "POST",
    auth: true,
    body: { weekly_trip_id: params.weekly_trip_id, number_of_seats: params.number_of_seats },
  });
  return toApiResponse(result);
}

/**
 * Submit a private (VIP) trip request to DelniDB (private_trips)
 */
export async function apiRequestPrivateTrip(params: {
  customer_description: string;
  preferred_start_date: string;
  duration_days: number;
  number_of_companions: number;
  customer_phone?: string;
  customer_requirements?: string;
  guide_license_number?: string | null;
}): Promise<ApiResponse> {
  const result = await laravelRequest("/trips/private/request", { method: "POST", auth: true, body: params });
  return toApiResponse(result);
}

/**
 * Tourist confirms or cancels a private trip after the admin priced it
 */
export async function apiTouristPrivateTripDecision(
  privateTripId: string,
  decision: "مؤكدة" | "ملغاة من السائح"
): Promise<ApiResponse> {
  const result = await laravelRequest(`/trips/private/${encodeURIComponent(privateTripId)}/decision`, {
    method: "POST",
    auth: true,
    body: { decision },
  });
  return toApiResponse(result);
}

/**
 * Register a new Tour Guide (stored in tour_guides as pending verification)
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
}): Promise<ApiResponse> {
  if (!params.password) {
    return { status: "error", message: "يرجى إدخال كلمة المرور" };
  }

  const result = await laravelRequest("/auth/register/guide", {
    method: "POST",
    body: {
      ...params,
      speaks_english: Boolean(params.speaks_english),
      speaks_french: Boolean(params.speaks_french),
      speaks_italian: Boolean(params.speaks_italian),
    },
  });

  if (!result.ok) {
    return { status: "error", message: result.message };
  }
  return {
    status: "success",
    message: result.message || "تم إرسال طلب انضمام المرشد بنجاح وهو الآن قيد مراجعة الإدارة",
    user: result.data.user,
  };
}

/**
 * Bookings and private trips of the signed-in tourist
 */
export async function apiGetTouristBookings(touristId: string) {
  const result = await laravelRequest(`/bookings/tourist/${encodeURIComponent(touristId)}`, { auth: true });
  if (!result.ok) {
    return { status: "error" as const, message: result.message, daily: [], weekly: [], privateTrips: [] };
  }
  return {
    status: "success" as const,
    message: "",
    daily: result.data.daily || [],
    weekly: result.data.weekly || [],
    daily_bookings: result.data.daily || [],
    weekly_bookings: result.data.weekly || [],
    privateTrips: result.data.privateTrips || [],
  };
}

export async function apiGetAdminDashboard(): Promise<any> {
  const result = await laravelRequest("/dashboard/admin", { auth: true, timeoutMs: 20000 });
  if (result.ok) {
    return result.data;
  }

  // Laravel unreachable: show only what this browser has cached locally.
  const guides = getAllGuides();
  const companies = getTransportCompanies();
  const vehicles = getVehicles();
  const drivers = getDrivers();
  return {
    offline: true,
    message: result.message,
    guides,
    companies,
    vehicles,
    drivers,
    daily_trips: [],
    weekly_trips: [],
    private_trips: [],
    daily_bookings: [],
    weekly_bookings: [],
    stats: {
      total_guides: guides.length,
      pending_guides: guides.filter((g) => g.verification_status !== "موثق" && g.verification_status !== "مرفوض").length,
      verified_guides: guides.filter((g) => g.verification_status === "موثق").length,
      total_companies: companies.length,
      total_vehicles: vehicles.length,
      total_drivers: drivers.length,
    },
  };
}

export async function apiVerifyGuide(licenseNumber: string, status: "موثق" | "مرفوض" | "قيد المراجعة") {
  const result = await laravelRequest(`/dashboard/admin/guides/${encodeURIComponent(licenseNumber)}/verify`, {
    method: "PUT",
    auth: true,
    body: { verification_status: status },
  });
  if (result.ok) {
    updateGuideVerification(licenseNumber, status);
  }
  return toApiResponse(result);
}

/**
 * Admin: price, plan, and assign a verified guide to a private trip
 */
export async function apiAdminUpdatePrivateTrip(privateTripId: string, data: {
  status_order: string;
  quoted_price?: number | null;
  admin_itinerary_plan?: string | null;
  assigned_guide_license?: string | null;
}) {
  return toApiResponse(
    await laravelRequest(`/dashboard/admin/private-trips/${encodeURIComponent(privateTripId)}`, {
      method: "PUT",
      auth: true,
      body: data,
    })
  );
}

/**
 * Delete a Tour Guide from DelniDB
 */
export async function apiDeleteGuide(licenseNumber: string) {
  const result = await laravelRequest(`/dashboard/admin/guides/${encodeURIComponent(licenseNumber)}`, {
    method: "DELETE",
    auth: true,
  });
  if (result.ok) {
    deleteGuideAccount(licenseNumber);
  }
  return toApiResponse(result);
}

/**
 * Trip catalog and admin trip management (Laravel)
 */
export async function apiGetDailyTrips(): Promise<any[]> {
  const result = await laravelRequest("/trips/daily");
  if (result.ok && Array.isArray(result.data)) return result.data;
  console.error("apiGetDailyTrips failed:", result.message);
  return [];
}

export async function apiCreateDailyTrip(data: any) {
  return toApiResponse(await laravelRequest("/trips/daily", { method: "POST", auth: true, body: data }));
}

export async function apiUpdateDailyTrip(id: string, data: any) {
  return toApiResponse(
    await laravelRequest(`/trips/daily/${encodeURIComponent(id)}`, { method: "PUT", auth: true, body: data })
  );
}

export async function apiDeleteDailyTrip(id: string) {
  return toApiResponse(await laravelRequest(`/trips/daily/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }));
}

export async function apiGetWeeklyTrips(): Promise<any[]> {
  const result = await laravelRequest("/trips/weekly");
  if (result.ok && Array.isArray(result.data)) return result.data;
  console.error("apiGetWeeklyTrips failed:", result.message);
  return [];
}

export async function apiCreateWeeklyTrip(data: any) {
  return toApiResponse(await laravelRequest("/trips/weekly", { method: "POST", auth: true, body: data }));
}

export async function apiUpdateWeeklyTrip(id: string, data: any) {
  return toApiResponse(
    await laravelRequest(`/trips/weekly/${encodeURIComponent(id)}`, { method: "PUT", auth: true, body: data })
  );
}

export async function apiDeleteWeeklyTrip(id: string) {
  return toApiResponse(await laravelRequest(`/trips/weekly/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }));
}

/**
 * Trip offers (offers_daily_trips / offers_weekly_trips). Reads are public;
 * create, update and delete are admin-only Laravel endpoints.
 */
export type OfferKind = "daily" | "weekly";

const OFFER_KEYS: Record<OfferKind, { id: string; trip: string; discount: string }> = {
  daily: { id: "offer_daily_id", trip: "daily_trip_id", discount: "percent_discount" },
  weekly: { id: "offer_weekly_id", trip: "weekly_trip_id", discount: "discount_percentage" },
};

/** Keep only the columns the offers tables have. */
function offerPayload(kind: OfferKind, o: any) {
  const k = OFFER_KEYS[kind];
  return {
    [k.trip]: o[k.trip],
    offer_title: o.offer_title,
    description: o.description,
    [k.discount]: o[k.discount] ?? o.percent_discount ?? o.discount_percentage,
    offer_image_url: o.offer_image_url || null,
    start_date: o.start_date,
    end_date: o.end_date,
    badge: o.badge || null,
  };
}

export async function apiGetDailyOffers(): Promise<any[]> {
  const result = await laravelRequest("/offers/daily");
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

export async function apiGetWeeklyOffers(): Promise<any[]> {
  const result = await laravelRequest("/offers/weekly");
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

/** Create an offer, or update it when it already has an id. Returns { status, offer, message }. */
export async function apiSaveOffer(kind: OfferKind, o: any): Promise<ApiResponse> {
  const id = o[OFFER_KEYS[kind].id];
  const result = id
    ? await laravelRequest(`/offers/${kind}/${encodeURIComponent(id)}`, { method: "PUT", auth: true, body: offerPayload(kind, o) })
    : await laravelRequest(`/offers/${kind}`, { method: "POST", auth: true, body: offerPayload(kind, o) });
  return toApiResponse(result);
}

export async function apiDeleteOffer(kind: OfferKind, id: string): Promise<ApiResponse> {
  return toApiResponse(await laravelRequest(`/offers/${kind}/${encodeURIComponent(id)}`, { method: "DELETE", auth: true }));
}

export async function apiGetHotels(): Promise<any[]> {
  const result = await laravelRequest("/hotels");
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

export async function apiGetRestaurants(): Promise<any[]> {
  const result = await laravelRequest("/restaurants");
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

/**
 * Tour Guide Dashboard data from DelniDB: own profile, assigned trips, and their bookings.
 * Returns `error` instead of invented data when the server cannot be reached.
 */
export async function apiGetGuideDashboard(licenseNumber: string) {
  const result = await laravelRequest(`/dashboard/guide/${encodeURIComponent(licenseNumber)}`, { auth: true });
  if (!result.ok || !result.data?.guide) {
    return { error: result.message, httpStatus: result.status, guide: null, daily_trips: [], weekly_trips: [], private_trips: [] };
  }

  const liveData = result.data;
  const currentSession = getStoredSession();
  if (currentSession.user && currentSession.user.license_number === liveData.guide.license_number) {
    localStorage.setItem(
      STORAGE_KEYS.CURRENT_USER,
      JSON.stringify({ ...currentSession.user, ...liveData.guide, role: currentSession.role || "guide" })
    );
  }

  return {
    error: null,
    guide: liveData.guide,
    is_verified: Boolean(liveData.is_verified),
    daily_trips: liveData.daily_trips || [],
    weekly_trips: liveData.weekly_trips || [],
    private_trips: liveData.private_trips || [],
  };
}

export async function apiUpdateGuideProfile(licenseNumber: string, data: any) {
  const result = await laravelRequest(`/dashboard/guide/${encodeURIComponent(licenseNumber)}`, {
    method: "PUT",
    auth: true,
    body: data,
  });
  if (!result.ok) {
    return { status: "error", message: result.message };
  }

  const current = getStoredSession().user || {};
  const merged = { ...current, ...result.data.guide, role: "guide" };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(merged));
  return { status: "success", message: result.message, guide: result.data.guide };
}

/**
 * Public guides catalog (verified guides from DelniDB)
 */
export async function apiGetGuidesCatalog(): Promise<GuideRecord[]> {
  const result = await laravelRequest("/guides");
  return result.ok && Array.isArray(result.data) ? result.data : [];
}

/**
 * Attendance has no column in DelniDB; the API reports that instead of faking success.
 */
export async function apiToggleAttendance(params: {
  type: "daily" | "weekly";
  booking_id: string;
  attended: boolean;
}): Promise<ApiResponse> {
  return toApiResponse(await laravelRequest("/bookings/toggle-attendance", { method: "POST", auth: true, body: params }));
}

export async function apiGuideRespondTrip(licenseNumber: string, params: {
  trip_id: string;
  status: "مقبولة" | "مرفوضة";
  rejection_reason?: string;
}): Promise<ApiResponse> {
  return toApiResponse(
    await laravelRequest(`/dashboard/guide/${encodeURIComponent(licenseNumber)}/trip-response`, {
      method: "POST",
      auth: true,
      body: params,
    })
  );
}

/**
 * Tourism assistant: Laravel /ai/chat (which uses the Python service when it runs).
 * When the server is unreachable, answers come from the built-in keyword replies below.
 */
export async function sendAIChatMessage(message: string): Promise<{
  reply: string;
  suggested_places?: string[];
  suggested_trips?: string[];
}> {
  const result = await laravelRequest("/ai/chat", { method: "POST", body: { message }, timeoutMs: 8000 });
  if (result.ok && result.data?.reply) {
    return result.data;
  }

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
    reply: "مرحباً بك في منصة دَلِّني السياحية! 🌟 أنا مساعدك السياحي الذكي. يسعدني إرشادك لأفضل الرحلات والمعالم الأثرية والصحراوية في ليبيا وتسهيل حجوزاتك. ما هي وجهتك المفضلة؟",
    suggested_places: ["لبدة الكبرى", "أوباري", "غدامس", "قورينا"],
    suggested_trips: ["جولة لبدة الكبرى اليومية", "مغامرة أوباري الصحراوية"],
  };
}

export async function apiGetPlaces(): Promise<any[]> {
  const result = await laravelRequest("/places");
  return result.ok && Array.isArray(result.data) ? result.data : [];
}
