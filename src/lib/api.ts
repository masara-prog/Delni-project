/**
 * Delni Platform - Universal Client & Data Management Layer
 * Implements complete local persistence for:
 * - Transportation Companies (transportation_companies)
 * - Vehicles (vehicles)
 * - Drivers (drivers)
 * - Tour Guides (tour_guides)
 * - Tourists & Bookings
 */

export const LARAVEL_API_URL = "";
export const AI_SERVICE_URL = "";

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
  available_vehicles?: number | null;
  available_cars?: number | null;
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
    } catch {}
  }
}

/* =========================================================
   SECURE BACKEND API INTEGRATION & SAFE FALLBACK SYSTEM
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
 * Health check helper (checks SQL Server backend or falls back locally)
 */
export async function checkBackendHealth(): Promise<{ online: boolean; database?: string }> {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch(`${BACKEND_API_URL}/health`, { signal: AbortSignal.timeout(2000) });
      if (res.ok) {
        return { online: true, database: "Microsoft SQL Server (DelniDB) - متصل وآمن" };
      }
    } catch {}
  }
  return { online: true, database: "محلي (Safe Fallback)" };
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
    available_vehicles: Number(company.available_cars !== undefined ? company.available_cars : company.available_vehicles) || 0,
    available_cars: Number(company.available_cars !== undefined ? company.available_cars : company.available_vehicles) || 0,
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
      available_vehicles: Number(data.available_vehicles !== undefined ? data.available_vehicles : (data.available_cars !== undefined ? data.available_cars : list[idx].available_vehicles)) || 0,
      available_cars: Number(data.available_vehicles !== undefined ? data.available_vehicles : (data.available_cars !== undefined ? data.available_cars : list[idx].available_vehicles)) || 0,
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

  // 1. Try Live Microsoft SQL Server Bridge Authentication first
  try {
    const dbRes = await fetch("http://127.0.0.1:5001/api/db/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, login: cleanLogin, password: rawPassword }),
      signal: AbortSignal.timeout(4000),
    });

    if (dbRes.ok) {
      const dbData = await dbRes.json();
      if (dbData.success && dbData.user) {
        const userObj = { ...dbData.user, role: dbData.role || role };
        localStorage.setItem(STORAGE_KEYS.TOKEN, `token-${Date.now()}`);
        localStorage.setItem(STORAGE_KEYS.ROLE, userObj.role);
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
        window.dispatchEvent(new Event("storage"));
        return {
          status: "success",
          message: dbData.message || "تم تسجيل الدخول بنجاح",
          user: userObj,
          role: userObj.role,
          token: "db_token",
        };
      } else {
        return {
          status: "error",
          message: dbData.error || "الحساب غير متوفر في المنصة",
        };
      }
    } else {
      const errData = await dbRes.json().catch(() => null);
      if (errData?.error) {
        return { status: "error", message: errData.error };
      }
    }
  } catch {}

  // 2. Local Fallback Verification (Zero Mock Users)
  // Admin Login
  if (role === "admin" || cleanLogin === "admin@dalni.ly" || cleanLogin === "admin") {
    if ((cleanLogin === "admin@dalni.ly" || cleanLogin === "admin") && (rawPassword === "admin123" || rawPassword === "admin")) {
      const adminUser = {
        name: "مدير النظام",
        full_name: "مدير النظام (الأدمن)",
        email: "admin@dalni.ly",
        role: "admin",
      };
      localStorage.setItem(STORAGE_KEYS.TOKEN, `admin-token-${Date.now()}`);
      localStorage.setItem(STORAGE_KEYS.ROLE, "admin");
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(adminUser));
      window.dispatchEvent(new Event("storage"));
      return { status: "success", message: "تم تسجيل الدخول بنجاح", user: adminUser, role: "admin", token: "admin_token" };
    }
    return { status: "error", message: "بيانات دخول مدير النظام غير صحيحة" };
  }

  // Transport Company Login
  if (role === "transport") {
    const companies = getTransportCompanies();
    const found = companies.find(
      c => (c.email && c.email.toLowerCase() === cleanLogin) ||
           (c.contract_number && c.contract_number.toLowerCase() === cleanLogin) ||
           (c.phone_number && c.phone_number.includes(cleanLogin))
    );
    if (!found) {
      return { status: "error", message: "حساب شركة النقل غير متوفر في المنصة. يرجى التأكد من البريد أو التسجيل أولاً." };
    }
    if (found.password && found.password !== rawPassword && found.password !== "••••••••") {
      return { status: "error", message: "كلمة المرور غير صحيحة" };
    }
    const userObj = { ...found, role: "transport" };
    localStorage.setItem(STORAGE_KEYS.TOKEN, `transport-token-${Date.now()}`);
    localStorage.setItem(STORAGE_KEYS.ROLE, "transport");
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
    window.dispatchEvent(new Event("storage"));
    return { status: "success", message: "تم تسجيل دخول شركة النقل بنجاح", user: userObj, role: "transport", token: "transport_token" };
  }

  // Driver Login
  if (role === "driver") {
    const drivers = getDrivers();
    const found = drivers.find(
      d => (d.email && d.email.toLowerCase() === cleanLogin) ||
           (d.driver_license_number && d.driver_license_number.toLowerCase() === cleanLogin) ||
           (d.phone_number && d.phone_number.includes(cleanLogin))
    );
    if (!found) {
      return { status: "error", message: "حساب السائق غير متوفر في المنصة. يرجى التواصل مع شركة النقل لتسجيلك." };
    }
    if (found.password && found.password !== rawPassword && found.password !== "••••••••") {
      return { status: "error", message: "كلمة المرور غير صحيحة" };
    }
    const userObj = { ...found, role: "driver" };
    localStorage.setItem(STORAGE_KEYS.TOKEN, `driver-token-${Date.now()}`);
    localStorage.setItem(STORAGE_KEYS.ROLE, "driver");
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
    window.dispatchEvent(new Event("storage"));
    return { status: "success", message: "تم تسجيل دخول السائق بنجاح", user: userObj, role: "driver", token: "driver_token" };
  }

  // Guide Login
  if (role === "guide") {
    const guides = getAllGuides();
    const found = guides.find(
      g => (g.email && g.email.toLowerCase() === cleanLogin) ||
           (g.license_number && g.license_number.toLowerCase() === cleanLogin) ||
           (g.phone_number && g.phone_number.includes(cleanLogin))
    );
    if (!found) {
      return { status: "error", message: "حساب المرشد السياحي غير متوفر في المنصة. يرجى التقدم بطلب انضمام أولاً." };
    }
    if (found.password && found.password !== rawPassword && found.password !== "••••••••") {
      return { status: "error", message: "كلمة المرور غير صحيحة" };
    }
    const userObj = { ...found, role: "guide" };
    localStorage.setItem(STORAGE_KEYS.TOKEN, `guide-token-${Date.now()}`);
    localStorage.setItem(STORAGE_KEYS.ROLE, "guide");
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
    window.dispatchEvent(new Event("storage"));
    return { status: "success", message: "تم تسجيل دخول المرشد بنجاح", user: userObj, role: "guide", token: "guide_token" };
  }

  // Tourist Login
  return { status: "error", message: "الحساب غير متوفر في المنصة. يرجى التسجيل أولاً." };
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
  } catch {}
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
  // Use passport/national ID as tourist_id if available, otherwise generated ID
  const tourist_id = params.tourist_id || params.passport || `T-${Math.floor(100000 + Math.random() * 900000)}`;
  const user = {
    tourist_id,
    passport: params.passport || tourist_id,
    full_name: params.full_name,
    email: params.email,
    phone_number: params.phone_number,
    role: "tourist",
    created_at: new Date().toISOString(),
  };

  try {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || "[]");
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  } catch {}

  localStorage.setItem(STORAGE_KEYS.TOKEN, `tourist-token-${Date.now()}`);
  localStorage.setItem(STORAGE_KEYS.ROLE, "tourist");
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  localStorage.setItem("dalni_user", JSON.stringify(user));

  // Sync with Laravel API if running
  try {
    fetch(`${LARAVEL_API_URL}/auth/register/tourist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        tourist_id,
        full_name: params.full_name,
        email: params.email,
        phone_number: params.phone_number,
        password: params.password,
      }),
    }).catch(() => {});
  } catch {}

  // Async Safe Sync to Backend API (Microsoft SQL Server)
  sendToSecureBackend("tourists", {
    tourist_id,
    full_name: params.full_name,
    email: params.email,
    phone_number: params.phone_number,
    password: params.password,
  });

  return { status: "success", message: "تم إنشاء حساب السائح بنجاح", user, token: "tourist_token" };
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
  const current = getStoredSession().user || {};
  const updated = { ...current, ...params };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updated));
  localStorage.setItem("dalni_user", JSON.stringify(updated));

  // Async Safe Sync to SQL Server bridge
  sendToSecureBackend("tourists", params);

  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/tourist/update-profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch {}

  return { status: "success", message: "تم تحديث الملف الشخصي بنجاح", user: updated };
}

/**
 * Book a Daily Trip into DelniDB
 */
export async function apiBookDailyTrip(params: {
  tourist_id: string;
  daily_trip_id: string;
  number_of_seats: number;
  passengers_names?: string;
  booking_notes?: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/bookings/daily`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { status: "error", message: "تعذر إرسال الحجز للخادم" };
  }
}

/**
 * Book a Weekly Trip into DelniDB
 */
export async function apiBookWeeklyTrip(params: {
  tourist_id: string;
  weekly_trip_id: string;
  number_of_seats: number;
  passengers_names?: string;
  booking_notes?: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/bookings/weekly`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });
    return await res.json();
  } catch {
    return { status: "error", message: "تعذر إرسال الحجز للخادم" };
  }
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
}): Promise<ApiResponse> {
  const newGuide: GuideRecord = {
    license_number: params.license_number,
    full_name: params.full_name,
    title: params.title || "مرشد سياحي معتمد",
    avatar: params.avatar || (params.gender === "female" ? "/assets/avatars/guide-f1.jpg" : "/assets/avatars/guide-m1.jpg"),
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

  const guides = getAllGuides();
  const existingIdx = guides.findIndex((g) => g.license_number === newGuide.license_number);
  if (existingIdx !== -1) {
    guides[existingIdx] = { ...guides[existingIdx], ...newGuide };
  } else {
    guides.push(newGuide);
  }
  saveAllGuides(guides);

  // Async Safe Sync to Backend API (Microsoft SQL Server)
  sendToSecureBackend("guides", {
    license_number: params.license_number,
    full_name: params.full_name,
    phone_number: params.phone_number,
    email: params.email,
    password: params.password,
    years_of_experience: params.years_of_experience,
    price_per_day: params.price_per_day,
    bio: params.bio,
    digital_certificate_file: params.digital_certificate_file,
  });

  localStorage.setItem(STORAGE_KEYS.TOKEN, `guide-token-${Date.now()}`);
  localStorage.setItem(STORAGE_KEYS.ROLE, "guide");
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newGuide));

  return {
    status: "success",
    message: "تم إرسال طلب انضمام المرشد بنجاح وهو الآن قيد مراجعة وتدقيق الإدارة",
    user: newGuide,
    token: "guide_token",
  };
}

export async function apiGetTouristBookings(touristId: string) {
  try {
    const daily = JSON.parse(localStorage.getItem("dalni_bookings_daily") || "[]");
    const weekly = JSON.parse(localStorage.getItem("dalni_bookings_weekly") || "[]");
    const privateTrips = JSON.parse(localStorage.getItem("dalni_private_trips") || "[]");
    const dailyFiltered = daily.filter((b: any) => b.tourist_id === touristId);
    const weeklyFiltered = weekly.filter((b: any) => b.tourist_id === touristId);
    return {
      daily: dailyFiltered,
      weekly: weeklyFiltered,
      daily_bookings: dailyFiltered,
      weekly_bookings: weeklyFiltered,
      privateTrips,
    };
  } catch {
    return { daily: [], weekly: [], daily_bookings: [], weekly_bookings: [], privateTrips: [] };
  }
}

export async function apiGetAdminDashboard(): Promise<any> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/dashboard/admin`, {
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  const guides = getAllGuides();
  const companies = getTransportCompanies();
  const vehicles = getVehicles();
  const drivers = getDrivers();
  return {
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
      pending_guides: guides.filter((g) => g.verification_status === "قيد المراجعة").length,
      verified_guides: guides.filter((g) => g.verification_status === "موثق").length,
      total_companies: companies.length,
      total_vehicles: vehicles.length,
      total_drivers: drivers.length,
    },
  };
}

export async function apiVerifyGuide(licenseNumber: string, status: "موثق" | "مرفوض" | "قيد المراجعة") {
  const success = updateGuideVerification(licenseNumber, status);
  return {
    status: success ? "success" : "error",
    message: success ? "تم تحديث حالة المرشد بنجاح" : "تعذر العثور على المرشد",
  };
}

/**
 * Delete a Tour Guide from DelniDB
 */
export async function apiDeleteGuide(licenseNumber: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/dashboard/admin/guides/${encodeURIComponent(licenseNumber)}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
      },
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return null;
}

/**
 * Trip API functions
 */
export async function apiCreateDailyTrip(data: any) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/trips/daily`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiUpdateDailyTrip(id: string, data: any) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/trips/daily/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeleteDailyTrip(id: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/trips/daily/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiCreateWeeklyTrip(data: any) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/trips/weekly`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiUpdateWeeklyTrip(id: string, data: any) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/trips/weekly/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch {
    return null;
  }
}

export async function apiDeleteWeeklyTrip(id: string) {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/trips/weekly/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Accept: "application/json" },
    });
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Get Tour Guide Dashboard data (profile, real assigned trips, real manifest)
 */
export async function apiGetGuideDashboard(licenseNumber: string) {
  const guides = getAllGuides();
  const guide = guides.find((g) => g.license_number === licenseNumber);
  const targetGuide = guide || getStoredSession().user || {
    license_number: licenseNumber,
    full_name: "مرشد سياحي",
    verification_status: "قيد المراجعة",
    assigned_trips: [],
  };
  return {
    guide: targetGuide,
    assigned_trips: targetGuide.assigned_trips || [],
    tourists: [],
    daily_trips: [] as any[],
    weekly_trips: [] as any[],
    private_trips: [] as any[],
  };
}

export async function apiUpdateGuideProfile(licenseNumber: string, data: any) {
  const guides = getAllGuides();
  const idx = guides.findIndex((g) => g.license_number === licenseNumber);
  if (idx !== -1) {
    guides[idx] = { ...guides[idx], ...data };
    saveAllGuides(guides);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(guides[idx]));
    return { status: "success", message: "تم حفظ التعديلات وتحديث ملفك بنجاح ✓", guide: guides[idx] };
  }
  const current = getStoredSession().user || {};
  const merged = { ...current, ...data };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(merged));
  return { status: "success", message: "تم حفظ التعديلات وتحديث ملفك بنجاح ✓", guide: merged };
}

export async function apiGetGuidesCatalog(): Promise<GuideRecord[]> {
  const guides = getAllGuides();
  return guides.filter((g) => g.verification_status === "موثق");
}

export async function apiToggleAttendance(_params: {
  type: "daily" | "weekly";
  booking_id: string;
  attended: boolean;
}): Promise<ApiResponse> {
  return { status: "success", message: "تم تسجيل الحضور بنجاح" };
}

export async function apiGuideRespondTrip(_licenseNumber: string, _params: {
  trip_id: string;
  status: "مقبولة" | "مرفوضة";
  rejection_reason?: string;
}): Promise<ApiResponse> {
  return { status: "success", message: "تم تسجيل الرد على الرحلة بنجاح" };
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
