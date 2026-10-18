import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { 
  getStoredSession, 
  apiGetAdminDashboard, 
  apiVerifyGuide, 
  apiDeleteGuide,
  apiCreateDailyTrip,
  apiUpdateDailyTrip,
  apiDeleteDailyTrip,
  apiCreateWeeklyTrip,
  apiUpdateWeeklyTrip,
  apiDeleteWeeklyTrip,
  getAllGuides, 
  updateGuideVerification, 
  deleteGuideAccount,
  getTransportCompanies,
  saveTransportCompanies,
  addTransportCompany,
  updateTransportCompany,
  deleteTransportCompany,
  getDrivers,
  getVehicles,
  sendToSecureBackend,
  deleteFromSecureBackend
} from "@/lib/api";
import { TOUR_GUIDES_DATA, formatWorkingDays, REGIONS_MAP } from "@/lib/guidesData";
import { getChatSessions, sendAdminReply } from "@/lib/supportChat";
import type {
  TransportationCompany,
  Driver as DbDriver,
  TourGuide as DbTourGuide,
  Vehicle as DbVehicle,
  DailyTrip as DbDailyTrip,
  WeeklyTrip as DbWeeklyTrip,
  PrivateTrip as DbPrivateTrip,
  Hotel as DbHotel,
  RestaurantCafe as DbRestaurantCafe,
  PlaceTourist as DbPlaceTourist,
  OfferDailyTrip,
  OfferWeeklyTrip,
  OfferFacility,
  BookingDaily,
  BookingWeekly,
} from "@/lib/dbSchema";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة الشاملة | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminDashboard,
});

/* ============ TYPES ============ */
type Company = { 
  id?: string | null; 
  contract_number: string; 
  name: string; 
  company_name?: string;
  phone: string; 
  phone_number?: string;
  address: string; 
  city?: string | null;
  email?: string | null; 
  pass?: string | null; 
  password?: string | null; 
  total_vehicles?: number | null; 
  available_cars?: number | null;
contract_start_date?: string | null; 
  contract_end_date?: string | null; 
  status?: "موثق" | "بانتظار" | "مرفوض" | string;
  verification_status?: "موثق" | "بانتظار التوثيق" | "بانتظار" | "مرفوض" | string | null;
  google_maps_url?: string | null;
};

type Driver = { 
  driver_license_number: string; 
  full_name: string; 
  phone_number: string; 
  national_id_or_passport?: string; 
  license_date_valid?: string; 
  contract_number?: string; 
  assigned_vehicle_plate?: string | null; 
  email?: string; 
  company_name?: string | null; 
  account_status?: "نشط" | "معلق" | "موقوف" | string | null;
  operational_status?: string | null;
};

type Guide = { 
  license_number: string; 
  full_name: string; 
  title?: string;
  avatar?: string;
  phone_number: string; 
  years_of_experience: number; 
  certificate: string; 
  certificate_name?: string;
  digital_certificate_file?: string; 
  bio?: string; 
  speaks_english?: boolean; 
  speaks_french?: boolean; 
  speaks_italian?: boolean; 
  verification_status?: "موثق" | "بانتظار التوثيق" | "مرفوض" | string; 
  email?: string; 
  daily_rate?: number; 
  price_per_day?: number;
  primaryRegion?: string;
  operating_regions?: string | string[];
  working_days?: string | string[];
  total_tours_completed?: number;
};

type Vehicle = { 
  plate_number: string; 
  company_id?: string | null; 
  contract_number?: string | null;
  company_name?: string | null; 
  vehicle_type: string; 
  capacity?: number | null; 
  seating_capacity?: number | null;
  daily_rate?: number | null; 
  status?: "جاهزة" | "في رحلة" | "صيانة" | string | null; 
  vehicle_status?: string | null;
};

type DailyTrip = { 
  id: string; 
  daily_trip_id?: string;
  title: string; 
  trip_title?: string;
  description: string; 
  price_per_seat: number; 
  max_capacity: number; 
  available_seats: number; 
  bookings_count: number; 
  rating_avg: number; 
  guide_license?: string; 
  guide_license_number?: string;
  vehicle_plates?: string[]; 
  is_active: boolean; 
  photo?: string; 
  recurring_days?: string[] | string; 
  bus_capacity?: 15 | 25 | 50; 
  destination?: string; 
  destination_city?: string;
  departure_city?: string; 
  gallery?: string;
  images?: string[];
  vehicle_plate?: string | null;
  restaurant_id?: string | null;
  itinerary_steps?: any;
};

type WeeklyTrip = { 
  id: string; 
  weekly_trip_id?: string;
  title: string; 
  trip_title?: string;
  trip_description?: string;
  description?: string;
  start_date?: string; 
  end_date?: string; 
  seat_per_price: number; 
  max_capacity: number; 
  available_seats?: number; 
  bookings_count: number; 
  rating_avg: number; 
  guide_license?: string; 
  guide_license_number?: string;
  vehicle_plates?: string[]; 
  is_active: boolean; 
  photo?: string; 
  weekly_day?: string; 
  bus_capacity?: 15 | 25 | 50; 
  destinations?: string[]; 
  destination_region?: string;
  departure_city?: string; 
  destination?: string; 
  hotel_id?: string; 
  gallery?: string;
  images?: string[];
  vehicle_plate?: string | null;
  restaurant_id?: string | null;
  itinerary_steps?: any;
};

type PrivateTripRequest = { 
  private_trip_id: string; 
  customer_name: string; 
  customer_phone: string; 
  customer_description: string; 
  preferred_start_date: string; 
  duration_days: number; 
  number_of_companions: number; 
  quoted_price?: number; 
  admin_itinerary_plan?: string; 
  assigned_guide?: string; 
  assigned_guide_license?: string;
  guide_license_number?: string;
  assigned_vehicle?: string; 
  assigned_vehicle_plate?: string;
  customer_requirements?: string;
  status_order: "قيد الدراسة" | "مؤكدة" | "مرفوضة من الأدمن" | "ملغية" | string; 
};

type Hotel = { id: string; name: string; city: string; address: string; phone: string; stars: number; bookings_count: number; rating_avg: number; partnership_status: "نشط" | "معلق" | "موقوف" | string; hotel_photo_1: string; hotel_photo_2: string; hotel_photo_3: string; hotel_photo_4: string; hotel_photo_5: string; description?: string; google_maps_url?: string; working_hours?: string; property_type?: "hotel" | "resort" | "apartment" | "heritage" | string; discount_percentage?: number; whatsapp?: string; amenities?: string[]; contract_start_date?: string; contract_end_date?: string };
type Restaurant = { id: string; name: string; type: string; category?: "seafood" | "traditional" | "fastfood" | "cafe" | string; city: string; address: string; phone: string; rating_avg: number; facility_image_1: string; facility_image_2: string; facility_image_3: string; facility_image_4: string; facility_image_5: string; description?: string; google_maps_url?: string; working_hours?: string; discount_percentage?: number; whatsapp?: string; partnership_status?: "نشط" | "معلق" | "موقوف" | string; contract_start_date?: string; contract_end_date?: string; features?: string | string[] };
type Attraction = { 
  id: string; 
  place_id?: string;
  name: string; 
  place_name?: string;
  city: string; 
  category: string; 
  description: string; 
  place_image: string; 
  visitors_count: number; 
  latitude?: number; 
  longitude?: number; 
  google_maps_url?: string; 
  is_unesco?: boolean;
  unesco_year?: number;
};
type ItemReview = { id: string; target_type: "رحلة يومية" | "رحلة أسبوعية" | "فندق" | "مطعم/مقهى" | "مرشد سياحي" | "شركة نقل"; target_name: string; tourist_name: string; stars_rating: number; comment_text: string; created_at: string };
type SupportTicket = { id: string; user_name: string; user_role: "سائح" | "مرشد" | "سائق" | "شركة نقل"; subject: string; message: string; status: "جديد" | "تم الرد" | "مغلق"; reply?: string; created_at: string };
type ChatMessage = { id: string; from: "user" | "bot" | "admin"; text: string; time: string };
type ChatSession = { id: string; user_name: string; user_type: "سائح" | "زائر"; last_message: string; time: string; unread: boolean; messages: ChatMessage[] };

type DailyOffer = OfferDailyTrip & {
  id?: string;
  title_offer?: string;
  url_image_offer?: string;
  date_start?: string;
  date_end?: string;
};

type WeeklyOffer = OfferWeeklyTrip & {
  id?: string;
  date_start?: string;
  date_end?: string;
  percent_discount?: number;
};

type FacilityOffer = OfferFacility & {
  id?: string;
  title_offer?: string;
  date_start?: string;
  date_end?: string;
  percent_discount?: number;
};

const handleEnterKeyNext = (e: React.KeyboardEvent<HTMLElement>) => {
  if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
    e.preventDefault();
    const form = (e.target as HTMLElement).closest("form");
    if (!form) return;
    const focusables = Array.from(
      form.querySelectorAll<HTMLElement>("input:not([type='hidden']):not([type='file']), select, textarea, button[type='submit']")
    ).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
    const currentIndex = focusables.indexOf(e.target as HTMLElement);
    if (currentIndex > -1 && currentIndex + 1 < focusables.length) {
      focusables[currentIndex + 1].focus();
    }
  }
};

/* ============ MAIN COMPONENT ============ */
function AdminDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const session = getStoredSession();
    if (!session.token || session.role !== "admin") {
      navigate({ to: "/auth/login" });
    }
  }, [navigate]);

  // Live synchronization with Microsoft SQL Server (DelniDB)
  useEffect(() => {
    let isMounted = true;
    async function syncFromDb() {
      try {
        const compRes = await fetch("http://127.0.0.1:5001/api/db/companies", { signal: AbortSignal.timeout(3000) });
        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData.success && Array.isArray(compData.data) && isMounted) {
            const mapped = compData.data.map((c: any) => ({
              ...c,
              name: c.company_name || c.name || "شركة نقل",
              phone: c.phone_number || c.phone || "",
              status: c.verification_status || c.status || "موثق",
            }));
            setCompanies(mapped);
            saveTransportCompanies(compData.data);
          }
        }
      } catch {}

      try {
        const vehRes = await fetch("http://127.0.0.1:5001/api/db/vehicles", { signal: AbortSignal.timeout(3000) });
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          if (vehData.success && Array.isArray(vehData.data) && isMounted) {
            setVehicles(vehData.data);
          }
        }
      } catch {}

      try {
        const dRes = await fetch("http://127.0.0.1:5001/api/db/drivers", { signal: AbortSignal.timeout(3000) });
        if (dRes.ok) {
          const dData = await dRes.json();
          if (dData.success && Array.isArray(dData.data) && isMounted) {
            setDrivers(dData.data);
          }
        }
      } catch {}

      try {
        const gRes = await fetch("http://127.0.0.1:5001/api/db/guides", { signal: AbortSignal.timeout(3000) });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.success && Array.isArray(gData.data) && gData.data.length > 0 && isMounted) {
            const mapped = gData.data.map((g: any) => ({
              ...g,
              daily_rate: Number(g.price_per_day) || 150,
              price_per_day: Number(g.price_per_day) || 150,
              primaryRegion: g.operating_regions?.includes("tripoli") ? "tripoli" : "tripoli",
            }));
            setGuides(mapped);
          }
        }
      } catch {}

      try {
        const hRes = await fetch("http://127.0.0.1:5001/api/db/hotels", { signal: AbortSignal.timeout(3000) });
        if (hRes.ok) {
          const hData = await hRes.json();
          if (hData.success && Array.isArray(hData.data) && hData.data.length > 0 && isMounted) {
            const mapped = hData.data.map((h: any) => ({
              ...h,
              id: h.hotel_id || h.id,
              name: h.hotel_name || h.name,
              address: h.address_details || h.address,
              phone: h.phone_number || h.phone,
              stars: h.star_rating || h.stars,
            }));
            setHotels(mapped);
          }
        }
      } catch {}

      try {
        const rRes = await fetch("http://127.0.0.1:5001/api/db/restaurants", { signal: AbortSignal.timeout(3000) });
        if (rRes.ok) {
          const rData = await rRes.json();
          if (rData.success && Array.isArray(rData.data) && rData.data.length > 0 && isMounted) {
            const mapped = rData.data.map((r: any) => ({
              ...r,
              id: r.facility_id || r.id,
              name: r.facility_name || r.name,
              type: r.facility_type || r.type,
              address: r.address_details || r.address,
              phone: r.phone_number || r.phone,
            }));
            setRestaurants(mapped);
          }
        }
      } catch {}

      try {
        const pRes = await fetch("http://127.0.0.1:5001/api/db/places", { signal: AbortSignal.timeout(3000) });
        if (pRes.ok) {
          const pData = await pRes.json();
          if (pData.success && Array.isArray(pData.data) && pData.data.length > 0 && isMounted) {
            const mapped = pData.data.map((p: any) => ({
              ...p,
              id: p.place_id || p.id,
              name: p.place_name || p.name,
            }));
            setAttractions(mapped);
          }
        }
      } catch {}

      try {
        const prvRes = await fetch("http://127.0.0.1:5001/api/db/private_trips", { signal: AbortSignal.timeout(3000) });
        if (prvRes.ok) {
          const prvData = await prvRes.json();
          if (prvData.success && Array.isArray(prvData.data) && isMounted) {
            setPrivateTrips((prev) => {
              const ids = new Set(prvData.data.map((p: any) => p.private_trip_id));
              const nonDb = prev.filter((p) => !ids.has(p.private_trip_id));
              return [...prvData.data, ...nonDb];
            });
          }
        }
      } catch {}
    }
    syncFromDb();
    return () => { isMounted = false; };
  }, []);

  /* ---- STATE DATA (1:1 with DelniDB schema) ---- */
  const [companies, setCompanies] = useState<Company[]>(() => {
    return getTransportCompanies().map(c => ({
      ...c,
      name: c.company_name || c.name || "شركة نقل",
      phone: c.phone_number || c.phone || "",
      status: c.verification_status || c.status || "موثق",
    }));
  });

  const [drivers, setDrivers] = useState<Driver[]>(() => {
    return getDrivers();
  });

  const [guides, setGuides] = useState<Guide[]>([]);

  /* ALL PLATFORM VEHICLES ACROSS ALL TRANSPORT COMPANIES (DelniDB vehicles) */
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => getVehicles());

  /* DelniDB daily_trips */
  const [dailyTrips, setDailyTrips] = useState<DailyTrip[]>([]);

  /* DelniDB weekly_trips */
  const [weeklyTrips, setWeeklyTrips] = useState<WeeklyTrip[]>([]);

  /* DelniDB private_trips */
  const [privateTrips, setPrivateTrips] = useState<PrivateTripRequest[]>([]);

  /* DelniDB bookings_daily & bookings_weekly */
  const [dailyBookings, setDailyBookings] = useState<BookingDaily[]>([]);

  const [weeklyBookings, setWeeklyBookings] = useState<BookingWeekly[]>([]);

  /* DelniDB hotels */
  const [hotels, setHotels] = useState<Hotel[]>([]);

  /* DelniDB restaurants_cafes */
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  /* DelniDB places_tourist */
  const [attractions, setAttractions] = useState<Attraction[]>([]);

  const [reviews, setReviews] = useState<ItemReview[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  /* ---- CHATBOT STATE ---- */
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [botInput, setBotInput] = useState("");

  /* ---- DelniDB OFFERS STATE (offers_daily_trips, offers_weekly_trips, offers_facilities) ---- */
  const [dailyOffers, setDailyOffers] = useState<DailyOffer[]>([]);
  const [weeklyOffers, setWeeklyOffers] = useState<WeeklyOffer[]>([]);
  const [facilityOffers, setFacilityOffers] = useState<FacilityOffer[]>([]);

  /* ---- MODAL STATES ---- */
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);
  const [showAddTrip, setShowAddTrip] = useState<"daily" | "weekly" | null>(null);
  const [editingDailyTrip, setEditingDailyTrip] = useState<DailyTrip | null>(null);
  const [editingWeeklyTrip, setEditingWeeklyTrip] = useState<WeeklyTrip | null>(null);
  const [evaluatingPrivateTrip, setEvaluatingPrivateTrip] = useState<PrivateTripRequest | null>(null);
  const [showAddPrivateTrip, setShowAddPrivateTrip] = useState(false);
  const [showAddHotel, setShowAddHotel] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [showAddRestaurant, setShowAddRestaurant] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  const [showAddAttraction, setShowAddAttraction] = useState(false);
  const [editingAttraction, setEditingAttraction] = useState<Attraction | null>(null);
  const [showAddDailyOffer, setShowAddDailyOffer] = useState(false);
  const [editingDailyOffer, setEditingDailyOffer] = useState<DailyOffer | null>(null);
  const [showAddWeeklyOffer, setShowAddWeeklyOffer] = useState(false);
  const [editingWeeklyOffer, setEditingWeeklyOffer] = useState<WeeklyOffer | null>(null);
  const [showAddFacilityOffer, setShowAddFacilityOffer] = useState(false);
  const [editingFacilityOffer, setEditingFacilityOffer] = useState<FacilityOffer | null>(null);

  /* ---- HANDLERS ---- */
  const handleAddCompany = (c: any) => {
    const saved = addTransportCompany(c);
    const mapped: Company = {
      ...saved,
      name: saved.company_name || saved.name || "شركة نقل",
      phone: saved.phone_number || saved.phone || "",
      status: saved.verification_status || saved.status || "موثق",
    };
    setCompanies([mapped, ...companies]);
    setShowAddCompany(false);
  };
  const handleUpdateCompany = (updated: Company) => { 
    updateTransportCompany(updated.contract_number, updated);
    setCompanies(companies.map(c => c.contract_number === updated.contract_number ? updated : c)); 
    setEditingCompany(null); 
  };
  const handleDeleteCompany = (contractNumber: string) => {
    if (confirm("هل تريد حذف شركة النقل؟")) {
      deleteTransportCompany(contractNumber);
      setCompanies(companies.filter(c => c.contract_number !== contractNumber));
    }
  };
  const handleVerifyGuide = async (lic: string, status: "موثق" | "مرفوض") => {
    setGuides(prev => prev.map(g => g.license_number === lic ? { ...g, verification_status: status } : g));
    setViewingGuide(null);
    updateGuideVerification(lic, status);
    const targetGuide = guides.find(g => g.license_number === lic);
    
    // Live update to Laravel backend database
    try {
      await fetch(`http://127.0.0.1:8000/api/dashboard/admin/guides/${encodeURIComponent(lic)}/verify`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          verification_status: status,
          full_name: targetGuide?.full_name,
          phone_number: targetGuide?.phone_number,
          email: targetGuide?.email,
          years_of_experience: targetGuide?.years_of_experience,
          price_per_day: targetGuide?.price_per_day,
          bio: targetGuide?.bio,
          title: targetGuide?.title,
          certificate: targetGuide?.certificate,
          certificate_name: targetGuide?.certificate_name,
        }),
      });
    } catch (err) {
      console.error("Failed to verify guide in Laravel API:", err);
    }

    sendToSecureBackend("guides", {
      license_number: lic,
      full_name: targetGuide?.full_name || "مرشد سياحي",
      phone_number: targetGuide?.phone_number || "0910000000",
      verification_status: status,
    });
  };

  const handleDeleteGuide = async (lic: string) => {
    if (!confirm(`هل أنت متأكد من حذف المرشد السياحي (رخصة: ${lic}) نهائياً من قاعدة البيانات؟`)) return;
    try {
      setGuides(prev => prev.filter(g => g.license_number !== lic));
      deleteGuideAccount(lic);
      deleteFromSecureBackend("guides", "license_number", lic);
      await apiDeleteGuide(lic);
      alert("تم حذف المرشد السياحي بنجاح من قاعدة البيانات");
    } catch (err: any) {
      alert("حدث خطأ أثناء حذف المرشد: " + (err.message || "فشلت العملية"));
    }
  };

  // Fetch live guides and admin data from DelniDB
  useEffect(() => {
    async function fetchAdminData() {
      const res = await apiGetAdminDashboard();
      if (!res) {
        const loadedGuides = getAllGuides();
        if (loadedGuides.length > 0) {
          const customLicenses = new Set(loadedGuides.map(g => g.license_number));
          const mapped: Guide[] = loadedGuides.map((g: any) => ({
            license_number: g.license_number,
            full_name: g.full_name,
            title: g.title || "",
            avatar: g.avatar || "",
            phone_number: g.phone_number,
            years_of_experience: Number(g.years_of_experience) || 2,
            certificate: g.certificate || "ترخيص رسمي صادر من وزارة السياحة والآثار",
            certificate_name: g.certificate_name,
            digital_certificate_file: g.digital_certificate_file,
            bio: g.bio || "",
            speaks_english: Boolean(g.speaks_english),
            speaks_french: Boolean(g.speaks_french),
            speaks_italian: Boolean(g.speaks_italian),
            verification_status: g.verification_status || "قيد المراجعة",
            email: g.email,
            daily_rate: Number(g.price_per_day) || 150,
            price_per_day: Number(g.price_per_day) || 150,
            primaryRegion: g.operating_regions?.includes("tripoli") ? "tripoli" : (g.primaryRegion || "tripoli"),
            operating_regions: g.operating_regions || "tripoli",
            working_days: g.working_days || "الأحد,الأربعاء",
            total_tours_completed: Number(g.total_tours_completed) || 0,
          }));
          setGuides(prev => [...mapped, ...prev.filter(x => !customLicenses.has(x.license_number))]);
        }
        return;
      }

      if (res.guides) {
        const dbGuides: Guide[] = res.guides.map((g: any) => ({
          license_number: g.license_number,
          full_name: g.full_name,
          title: g.title || "",
          avatar: g.avatar || "",
          phone_number: g.phone_number,
          years_of_experience: Number(g.years_of_experience) || 2,
          certificate: g.certificate || "ترخيص رسمي صادر من وزارة السياحة والآثار",
          certificate_name: g.certificate_name,
          digital_certificate_file: g.digital_certificate_file,
          bio: g.bio || "",
          speaks_english: Boolean(g.speaks_english),
          speaks_french: Boolean(g.speaks_french),
          speaks_italian: Boolean(g.speaks_italian),
          verification_status: g.verification_status || "قيد المراجعة",
          email: g.email,
          daily_rate: Number(g.price_per_day) || 150,
          price_per_day: Number(g.price_per_day) || 150,
          primaryRegion: g.operating_regions?.includes("tripoli") ? "tripoli" : (g.primaryRegion || "tripoli"),
          operating_regions: g.operating_regions || "tripoli",
          working_days: g.working_days || "الأحد,الأربعاء",
          total_tours_completed: Number(g.total_tours_completed) || 0,
        }));
        setGuides(dbGuides);
      }

      if (res.daily_trips) {
        const mappedDaily = res.daily_trips.map((d: any) => ({
          id: d.daily_trip_id,
          daily_trip_id: d.daily_trip_id,
          title: d.trip_title,
          trip_title: d.trip_title,
          description: d.description || "",
          price_per_seat: Number(d.price_per_seat) || 0,
          departure_city: d.departure_city || "طرابلس",
          destination: d.destination_city || "",
          destination_city: d.destination_city || "",
          max_capacity: d.max_capacity || 25,
          available_seats: d.available_seats || d.max_capacity || 25,
          bus_capacity: d.max_capacity || 25,
          bookings_count: 0,
          rating_avg: 5.0,
          recurring_days: d.recurring_days || "السبت,الثلاثاء",
          guide_license: d.guide_license_number || "",
          guide_license_number: d.guide_license_number || "",
          photo: d.photo || "/assets/ai_ruins.jpg",
          activities: d.activities || "",
          is_active: d.is_active !== false,
          vehicle_plate: d.vehicle_plate || "",
          vehicle_model: d.vehicle_model || "",
          vehicle_capacity: d.vehicle_capacity || d.max_capacity || 25,
          transport_company_name: d.transport_company_name || "",
          driver_name: d.driver_name || "",
          driver_phone: d.driver_phone || "",
          driver_license_number: d.driver_license_number || "",
          restaurant_id: d.restaurant_id || "",
          restaurant_name: d.restaurant_name || "",
          restaurant_type: d.restaurant_type || "",
          restaurant_city: d.restaurant_city || "",
          restaurant_address: d.restaurant_address || "",
          restaurant_phone: d.restaurant_phone || "",
          itinerary_steps: d.itinerary_steps || null,
        }));
        setDailyTrips(mappedDaily);
      }

      if (res.weekly_trips) {
        const mappedWeekly = res.weekly_trips.map((w: any) => ({
          id: w.weekly_trip_id,
          weekly_trip_id: w.weekly_trip_id,
          title: w.trip_title,
          trip_title: w.trip_title,
          description: w.trip_description || "",
          trip_description: w.trip_description || "",
          seat_per_price: Number(w.seat_per_price) || 0,
          departure_city: w.departure_city || "طرابلس",
          destination: w.destination_region || "",
          destination_region: w.destination_region || "",
          max_capacity: w.max_capacity || 25,
          available_seats: w.available_seats || w.max_capacity || 25,
          bus_capacity: w.max_capacity || 25,
          bookings_count: 0,
          rating_avg: 5.0,
          start_date: w.start_date || "",
          end_date: w.end_date || "",
          weekly_day: "الجمعة",
          guide_license: w.guide_license_number || "",
          guide_license_number: w.guide_license_number || "",
          photo: w.photo || "/assets/ai_ghadames.jpg",
          is_active: w.is_active !== false,
          vehicle_plate: w.vehicle_plate || "",
          vehicle_model: w.vehicle_model || "",
          vehicle_capacity: w.vehicle_capacity || w.max_capacity || 25,
          transport_company_name: w.transport_company_name || "",
          driver_name: w.driver_name || "",
          driver_phone: w.driver_phone || "",
          driver_license_number: w.driver_license_number || "",
          restaurant_id: w.restaurant_id || "",
          restaurant_name: w.restaurant_name || "",
          restaurant_type: w.restaurant_type || "",
          restaurant_city: w.restaurant_city || "",
          restaurant_address: w.restaurant_address || "",
          restaurant_phone: w.restaurant_phone || "",
          itinerary_steps: w.itinerary_steps || null,
        }));
        setWeeklyTrips(mappedWeekly);
      }

      if (res.companies && Array.isArray(res.companies)) {
        setCompanies(res.companies.map((c: any) => ({
          id: c.contract_number,
          contract_number: c.contract_number,
          name: c.company_name,
          company_name: c.company_name,
          phone: c.phone_number,
          phone_number: c.phone_number,
          address: c.address_details || "",
          city: c.city || "طرابلس",
          email: c.email || "",
          status: c.verification_status || "موثق",
          verification_status: c.verification_status || "موثق",
        })));
      }

      if (res.drivers && Array.isArray(res.drivers)) {
        setDrivers(res.drivers.map((d: any) => ({
          driver_license_number: d.driver_license_number,
          full_name: d.full_name,
          phone_number: d.phone_number,
          national_id_or_passport: d.national_id || "",
          license_date_valid: d.license_expiry_date || "",
          contract_number: d.contract_number,
          assigned_vehicle_plate: d.assigned_vehicle_plate || "",
          email: d.email || "",
          account_status: d.account_status || "نشط",
          operational_status: d.operational_status || "متاح",
          experience_years: d.experience_years || 5,
          company_name: d.company?.company_name || "",
        })));
      }

      if (res.vehicles && Array.isArray(res.vehicles)) {
        setVehicles(res.vehicles.map((v: any) => ({
          plate_number: v.plate_number,
          contract_number: v.contract_number,
          company_id: v.contract_number,
          company_name: v.company?.company_name || "",
          vehicle_type: v.model_name || v.vehicle_type || "حافلة سياحية",
          seating_capacity: v.passenger_capacity || 25,
          capacity: v.passenger_capacity || 25,
          daily_rate: Number(v.daily_rental_rate) || 500,
          vehicle_status: v.vehicle_status || "جاهزة",
          status: v.vehicle_status || "جاهزة",
        })));
      }

      if (res.private_trips && Array.isArray(res.private_trips)) {
        setPrivateTrips(res.private_trips);
      }

      if (res.daily_bookings && Array.isArray(res.daily_bookings)) {
        setDailyBookings(res.daily_bookings);
      }

      if (res.weekly_bookings && Array.isArray(res.weekly_bookings)) {
        setWeeklyBookings(res.weekly_bookings);
      }

      if (res.hotels && Array.isArray(res.hotels)) {
        setHotels(res.hotels.map((h: any) => ({
          id: h.hotel_id || h.id,
          name: h.hotel_name || h.name,
          city: h.city,
          address: h.address_details || h.address || "",
          phone: h.phone_number || h.phone || "",
          stars: Number(h.star_rating) || Number(h.stars) || 4,
          bookings_count: 0,
          rating_avg: 5.0,
          partnership_status: h.partnership_status || "نشط",
          hotel_photo_1: h.hotel_photo_1 || "/assets/ai_hotel.jpg",
          hotel_photo_2: h.hotel_photo_2 || "/assets/dest-harbor-coast.jpg",
          hotel_photo_3: h.hotel_photo_3 || "/assets/cafe-libya.jpg",
          hotel_photo_4: h.hotel_photo_4 || "",
          hotel_photo_5: h.hotel_photo_5 || "",
          google_maps_url: h.google_maps_url || "",
        })));
      }

      if (res.restaurants && Array.isArray(res.restaurants)) {
        setRestaurants(res.restaurants.map((r: any) => ({
          id: r.facility_id || r.id,
          name: r.facility_name || r.name,
          type: r.facility_type || r.type || "مطعم",
          city: r.city,
          address: r.address_details || r.address || "",
          phone: r.phone_number || r.phone || "",
          rating_avg: 5.0,
          facility_image_1: r.facility_image_1 || "/assets/restaurant-libya.jpg",
          facility_image_2: r.facility_image_2 || "",
          facility_image_3: r.facility_image_3 || "",
          facility_image_4: r.facility_image_4 || "",
          facility_image_5: r.facility_image_5 || "",
          description: r.description || "",
          working_hours: r.working_hours || "09:00 ص - 12:00 م",
          google_maps_url: r.google_maps_url || "",
        })));
      }

      if (res.places && Array.isArray(res.places)) {
        setAttractions(res.places.map((p: any) => ({
          id: p.place_id || p.id,
          place_id: p.place_id || p.id,
          name: p.place_name || p.name,
          place_name: p.place_name || p.name,
          city: p.city,
          category: p.category || "معلم تاريخي",
          description: p.description || "",
          place_image: p.place_image || "/assets/dest-leptis-theater.jpg",
          visitors_count: 0,
          latitude: p.latitude,
          longitude: p.longitude,
          google_maps_url: p.google_maps_url || "",
          is_unesco: p.is_unesco,
          unesco_year: p.unesco_year,
          entry_fee: p.entry_fee || "مجاني",
        })));
      }
    }
  }, []);

  useEffect(() => {
    const loadedCompanies = getTransportCompanies();
    if (loadedCompanies && loadedCompanies.length > 0) {
      setCompanies(loadedCompanies.map(c => ({
        ...c,
        name: c.company_name || c.name || "شركة نقل",
        phone: c.phone_number || c.phone || "",
        status: c.verification_status || c.status || "موثق",
      })));
    }

    const loadedDrivers = getDrivers();
    if (loadedDrivers && loadedDrivers.length > 0) {
      setDrivers(loadedDrivers);
    }
  }, [active]);

  const handleCreateTrip = async (type: "daily" | "weekly", data: any) => {
    try {
      const cleanGuideLic = data.guide_license_number?.trim() || data.guide_license?.trim() || null;
      if (type === "daily") {
        const imgList = (data.images && data.images.length > 0)
          ? data.images
          : (data.gallery ? (typeof data.gallery === 'string' ? data.gallery.split(',') : data.gallery) : [data.photo]);
        const primary = imgList[0] || data.photo || "/assets/dest-leptis-theater.jpg";
        const galleryStr = imgList.filter(Boolean).join(",");

        const payload = {
          trip_title: data.trip_title || data.title,
          description: data.description || "",
          price_per_seat: Number(data.price_per_seat) || 100,
          departure_city: data.departure_city || "طرابلس",
          destination_city: data.destination || data.destination_city || "المعلم الأثري",
          max_capacity: Number(data.max_capacity) || 25,
          recurring_days: data.recurring_days || "السبت,الثلاثاء",
          guide_license_number: cleanGuideLic,
          photo: primary,
          gallery: galleryStr,
          images: imgList,
          activities: data.activities || null,
          vehicle_plate: data.vehicle_plate || (Array.isArray(data.vehicle_plates) ? data.vehicle_plates[0] : null),
          restaurant_id: data.restaurant_id || null,
          itinerary_steps: data.itinerary_steps ? (typeof data.itinerary_steps === 'string' ? data.itinerary_steps : JSON.stringify(data.itinerary_steps)) : null,
        };
        const res = await apiCreateDailyTrip(payload);
        if (!res || res.status === "error" || res.errors || !res.trip) {
          const errMsg = res?.message || (res?.errors ? Object.values(res.errors).flat().join(" - ") : "فشل في حفظ الرحلة في قاعدة البيانات");
          alert("خطأ: " + errMsg);
          return;
        }
        const createdTrip = res.trip;
        setDailyTrips(prev => [
          {
            ...createdTrip,
            id: createdTrip.daily_trip_id,
            title: createdTrip.trip_title,
            photo: primary,
            gallery: galleryStr,
            images: imgList,
            bookings_count: 0,
            rating_avg: 5.0,
            is_active: true,
            vehicle_plate: data.vehicle_plate || (Array.isArray(data.vehicle_plates) ? data.vehicle_plates[0] : ""),
            restaurant_id: data.restaurant_id || "",
            itinerary_steps: data.itinerary_steps || null,
          },
          ...prev,
        ]);
        alert("تم حفظ الرحلة اليومية بنجاح في قاعدة البيانات!");
      } else {
        const imgList = (data.images && data.images.length > 0)
          ? data.images
          : (data.gallery ? (typeof data.gallery === 'string' ? data.gallery.split(',') : data.gallery) : [data.photo]);
        const primary = imgList[0] || data.photo || "/assets/dest-ubari-gaberoun.jpg";
        const galleryStr = imgList.filter(Boolean).join(",");

        const payload = {
          trip_title: data.trip_title || data.title,
          trip_description: data.trip_description || data.description || "",
          seat_per_price: Number(data.seat_per_price) || 1200,
          departure_city: data.departure_city || "طرابلس",
          destination_region: data.destination || data.destination_region || "الصحراء",
          max_capacity: Number(data.max_capacity) || 25,
          start_date: data.start_date || undefined,
          end_date: data.end_date || undefined,
          guide_license_number: cleanGuideLic,
          photo: primary,
          gallery: galleryStr,
          images: imgList,
          vehicle_plate: data.vehicle_plate || (Array.isArray(data.vehicle_plates) ? data.vehicle_plates[0] : null),
          restaurant_id: data.restaurant_id || null,
          itinerary_steps: data.itinerary_steps ? (typeof data.itinerary_steps === 'string' ? data.itinerary_steps : JSON.stringify(data.itinerary_steps)) : null,
        };
        const res = await apiCreateWeeklyTrip(payload);
        if (!res || res.status === "error" || res.errors || !res.trip) {
          const errMsg = res?.message || (res?.errors ? Object.values(res.errors).flat().join(" - ") : "فشل في حفظ الرحلة في قاعدة البيانات");
          alert("خطأ: " + errMsg);
          return;
        }
        const createdTrip = res.trip;
        setWeeklyTrips(prev => [
          {
            ...createdTrip,
            id: createdTrip.weekly_trip_id,
            title: createdTrip.trip_title,
            photo: primary,
            gallery: galleryStr,
            images: imgList,
            bookings_count: 0,
            rating_avg: 5.0,
            is_active: true,
            vehicle_plate: data.vehicle_plate || (Array.isArray(data.vehicle_plates) ? data.vehicle_plates[0] : ""),
            restaurant_id: data.restaurant_id || "",
            itinerary_steps: data.itinerary_steps || null,
          },
          ...prev,
        ]);
        alert("تم حفظ الرحلة الأسبوعية بنجاح في قاعدة البيانات!");
      }
      setShowAddTrip(null);
    } catch (err: any) {
      alert("حدث خطأ أثناء حفظ الرحلة: " + (err.message || "فشل الاتصال"));
    }
  };

  const handleUpdateDailyTrip = async (updated: DailyTrip) => {
    const tripId = updated.daily_trip_id || updated.id;
    try {
      const imgList = (updated as any).images && (updated as any).images.length > 0
        ? (updated as any).images
        : (updated.gallery ? (typeof updated.gallery === 'string' ? updated.gallery.split(',') : updated.gallery) : [updated.photo]);
      const primary = imgList[0] || updated.photo || "/assets/dest-leptis-theater.jpg";
      const galleryStr = imgList.filter(Boolean).join(",");

      const payload = {
        trip_title: updated.trip_title || updated.title,
        description: updated.description || "",
        price_per_seat: Number(updated.price_per_seat) || 100,
        departure_city: updated.departure_city || "طرابلس",
        destination_city: updated.destination || updated.destination_city || "المعلم الأثري",
        max_capacity: Number(updated.max_capacity) || 25,
        recurring_days: Array.isArray(updated.recurring_days) ? updated.recurring_days.join(",") : (updated.recurring_days || "السبت,الثلاثاء"),
        guide_license_number: updated.guide_license_number || updated.guide_license || undefined,
        photo: primary,
        gallery: galleryStr,
        images: imgList,
        activities: Array.isArray((updated as any).activities) ? (updated as any).activities.join(" • ") : ((updated as any).activities || null),
        vehicle_plate: (updated as any).vehicle_plate || (Array.isArray((updated as any).vehicle_plates) ? (updated as any).vehicle_plates[0] : null),
        restaurant_id: (updated as any).restaurant_id || null,
        itinerary_steps: (updated as any).itinerary_steps ? (typeof (updated as any).itinerary_steps === 'string' ? (updated as any).itinerary_steps : JSON.stringify((updated as any).itinerary_steps)) : null,
      };
      const res = await apiUpdateDailyTrip(tripId, payload);
      if (res && res.status === "success") {
        setDailyTrips(dailyTrips.map(d => (d.daily_trip_id || d.id) === tripId ? { ...d, ...updated, ...payload, ...res.trip } : d));
        alert("تم تحديث الرحلة اليومية بنجاح في قاعدة البيانات!");
      } else {
        alert("تنبيه: " + (res?.message || "تعذر حفظ التعديل في السيرفر"));
        setDailyTrips(dailyTrips.map(d => (d.daily_trip_id || d.id) === tripId ? { ...updated, ...payload } : d));
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء تعديل الرحلة: " + (err.message || "فشل الاتصال"));
    }
    setEditingDailyTrip(null);
  };

  const handleDeleteDailyTrip = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الرحلة اليومية نهائياً من قاعدة البيانات؟")) return;
    setDailyTrips(prev => prev.filter(d => (d.daily_trip_id || d.id) !== id));
    try {
      await apiDeleteDailyTrip(id);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleUpdateWeeklyTrip = async (updated: WeeklyTrip) => {
    const tripId = updated.weekly_trip_id || updated.id;
    try {
      const imgList = (updated as any).images && (updated as any).images.length > 0
        ? (updated as any).images
        : (updated.gallery ? (typeof updated.gallery === 'string' ? updated.gallery.split(',') : updated.gallery) : [updated.photo]);
      const primary = imgList[0] || updated.photo || "/assets/dest-ubari-gaberoun.jpg";
      const galleryStr = imgList.filter(Boolean).join(",");

      const payload = {
        trip_title: updated.trip_title || updated.title,
        trip_description: updated.trip_description || updated.description || "",
        seat_per_price: Number(updated.seat_per_price) || 1200,
        departure_city: updated.departure_city || "طرابلس",
        destination_region: updated.destination || updated.destination_region || "الصحراء",
        max_capacity: Number(updated.max_capacity) || 25,
        start_date: updated.start_date || undefined,
        end_date: updated.end_date || undefined,
        guide_license_number: updated.guide_license_number || updated.guide_license || undefined,
        photo: primary,
        gallery: galleryStr,
        images: imgList,
        vehicle_plate: (updated as any).vehicle_plate || (Array.isArray((updated as any).vehicle_plates) ? (updated as any).vehicle_plates[0] : null),
        restaurant_id: (updated as any).restaurant_id || null,
        itinerary_steps: (updated as any).itinerary_steps ? (typeof (updated as any).itinerary_steps === 'string' ? (updated as any).itinerary_steps : JSON.stringify((updated as any).itinerary_steps)) : null,
      };
      const res = await apiUpdateWeeklyTrip(tripId, payload);
      if (res && res.status === "success") {
        setWeeklyTrips(weeklyTrips.map(w => (w.weekly_trip_id || w.id) === tripId ? ({ ...w, ...updated, ...payload, ...res.trip } as any) : w));
        alert("تم تحديث الرحلة الأسبوعية بنجاح في قاعدة البيانات!");
      } else {
        alert("تنبيه: " + (res?.message || "تعذر حفظ التعديل في السيرفر"));
        setWeeklyTrips(weeklyTrips.map(w => (w.weekly_trip_id || w.id) === tripId ? ({ ...updated, ...payload } as any) : w));
      }
    } catch (err: any) {
      alert("حدث خطأ أثناء تعديل الرحلة: " + (err.message || "فشل الاتصال"));
    }
    setEditingWeeklyTrip(null);
  };

  const handleDeleteWeeklyTrip = async (id: string) => {
    if (!confirm("هل تريد حذف هذه الرحلة الأسبوعية نهائياً من قاعدة البيانات؟")) return;
    setWeeklyTrips(prev => prev.filter(w => (w.weekly_trip_id || w.id) !== id));
    try {
      await apiDeleteWeeklyTrip(id);
    } catch (err: any) {
      console.error(err);
    }
  };
  const handleSavePrivate = async (id: string, status: string, price?: number, plan?: string, guide?: string, vehicle?: string) => {
    const existing = privateTrips.find(p => p.private_trip_id === id);
    const updatedTrip = {
      ...(existing || {}),
      private_trip_id: id,
      status_order: status,
      quoted_price: price !== undefined ? price : existing?.quoted_price,
      admin_itinerary_plan: plan !== undefined ? plan : existing?.admin_itinerary_plan,
      guide_license_number: guide || existing?.guide_license_number,
      assigned_guide: guide || existing?.assigned_guide,
      assigned_vehicle: vehicle || existing?.assigned_vehicle,
    };

    setPrivateTrips((prev: any) => prev.map((p: any) => p.private_trip_id === id ? updatedTrip : p));
    setEvaluatingPrivateTrip(null);

    try {
      await fetch("http://127.0.0.1:5001/api/db/private_trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTrip),
      });
    } catch (e) {
      console.error("Failed to sync private trip with SQL Server", e);
    }

    try {
      const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
      const next = local.map((p: any) => p.private_trip_id === id ? updatedTrip : p);
      if (!local.find((p: any) => p.private_trip_id === id)) next.unshift(updatedTrip);
      localStorage.setItem("delni_private_trips", JSON.stringify(next));
      localStorage.setItem("dalni_private_trips", JSON.stringify(next));
    } catch {}
  };

  const handleAddPrivateTrip = (p: any) => { setPrivateTrips([...privateTrips, p]); setShowAddPrivateTrip(false); };
  const handleDeletePrivate = async (id: string) => {
    if (!confirm("هل تريد حذف طلب الرحلة الخاصة؟")) return;
    setPrivateTrips(prev => prev.filter(p => p.private_trip_id !== id));
    try {
      await fetch(`http://127.0.0.1:5001/api/db/private_trips?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    } catch {}
    try {
      const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
      const next = local.filter((p: any) => p.private_trip_id !== id);
      localStorage.setItem("delni_private_trips", JSON.stringify(next));
      localStorage.setItem("dalni_private_trips", JSON.stringify(next));
    } catch {}
  };
  useEffect(() => {
    try {
      const storedTickets = JSON.parse(localStorage.getItem("dalni_support_tickets") || "[]");
      if (Array.isArray(storedTickets) && storedTickets.length > 0) {
        setTickets((prev) => {
          const ids = new Set(prev.map((t) => t.id));
          return [...storedTickets.filter((t: any) => !ids.has(t.id)), ...prev];
        });
      }

      const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
      if (Array.isArray(storedRests) && storedRests.length > 0) {
        setRestaurants((prev) => {
          const ids = new Set(prev.map((r) => r.id));
          return [...storedRests.filter((r: any) => !ids.has(r.id)), ...prev];
        });
      }

      const storedPrivate = JSON.parse(localStorage.getItem("delni_private_trips") || localStorage.getItem("dalni_private_trips") || "[]");
      if (Array.isArray(storedPrivate) && storedPrivate.length > 0) {
        setPrivateTrips((prev) => {
          const ids = new Set(prev.map((p) => p.private_trip_id));
          return [...storedPrivate.filter((p: any) => !ids.has(p.private_trip_id)), ...prev];
        });
      }

      // Live Support Chat Sessions
      const sessions = getChatSessions();
      setChatSessions(sessions);
      if (sessions.length > 0) {
        setActiveChatId(sessions[0].id);
      }
    } catch {}

    const handleChatSync = (e: any) => {
      const all = e?.detail || getChatSessions();
      setChatSessions([...all]);
    };
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === "dalni_chat_sessions") {
        setChatSessions(getChatSessions());
      }
      if (e.key === "dalni_support_tickets" && e.newValue) {
        try {
          setTickets(JSON.parse(e.newValue));
        } catch {}
      }
    };
    window.addEventListener("dalni_chat_sync", handleChatSync);
    window.addEventListener("storage", handleStorageSync);

    return () => {
      window.removeEventListener("dalni_chat_sync", handleChatSync);
      window.removeEventListener("storage", handleStorageSync);
    };
  }, []);

  const handleAddHotel = (h: any) => {
    const hotelId = h.hotel_id || h.id || `HTL-${Date.now().toString().slice(-4)}`;
    const newHotelObj: Hotel = {
      id: hotelId,
      bookings_count: 0,
      rating_avg: 5.0,
      property_type: h.property_type || "hotel",
      discount_percentage: Number(h.discount_percentage) || 15,
      amenities: h.amenities || ["مسبح", "واي فاي", "موقف"],
      whatsapp: h.whatsapp || h.phone,
      ...h,
    };
    setHotels((prev) => [newHotelObj, ...prev]);
    setShowAddHotel(false);

    try {
      const storedHotels = JSON.parse(localStorage.getItem("dalni_hotels") || "[]");
      localStorage.setItem("dalni_hotels", JSON.stringify([newHotelObj, ...storedHotels]));
    } catch {}

    sendToSecureBackend("hotels", {
      hotel_id: hotelId,
      hotel_name: newHotelObj.name,
      city: newHotelObj.city,
      address_details: newHotelObj.address,
      phone_number: newHotelObj.phone,
      star_rating: newHotelObj.stars,
      partnership_status: newHotelObj.partnership_status || "نشط",
      property_type: newHotelObj.property_type || "hotel",
      discount_percentage: newHotelObj.discount_percentage || 15,
      working_hours: newHotelObj.working_hours,
      description: newHotelObj.description,
      google_maps_url: newHotelObj.google_maps_url,
      whatsapp: newHotelObj.whatsapp,
      contract_start_date: newHotelObj.contract_start_date,
      contract_end_date: newHotelObj.contract_end_date,
      hotel_photo_1: newHotelObj.hotel_photo_1,
      hotel_photo_2: newHotelObj.hotel_photo_2,
      hotel_photo_3: newHotelObj.hotel_photo_3,
      hotel_photo_4: newHotelObj.hotel_photo_4,
      hotel_photo_5: newHotelObj.hotel_photo_5,
      verification_status: "موثق",
    });
  };
  const handleUpdateHotel = (h: Hotel) => {
    setHotels(hotels.map(x => x.id === h.id ? h : x));
    setEditingHotel(null);
    try {
      const stored = JSON.parse(localStorage.getItem("dalni_hotels") || "[]");
      const updated = stored.map((item: any) => item.id === h.id ? { ...item, ...h } : item);
      localStorage.setItem("dalni_hotels", JSON.stringify(updated));
    } catch {}

    sendToSecureBackend("hotels", {
      hotel_id: h.id,
      hotel_name: h.name,
      city: h.city,
      address_details: h.address,
      phone_number: h.phone,
      star_rating: h.stars,
      partnership_status: h.partnership_status || "نشط",
      property_type: h.property_type || "hotel",
      discount_percentage: h.discount_percentage || 15,
      working_hours: h.working_hours,
      description: h.description,
      google_maps_url: h.google_maps_url,
      whatsapp: h.whatsapp,
      contract_start_date: h.contract_start_date,
      contract_end_date: h.contract_end_date,
      hotel_photo_1: h.hotel_photo_1,
      hotel_photo_2: h.hotel_photo_2,
      hotel_photo_3: h.hotel_photo_3,
      hotel_photo_4: h.hotel_photo_4,
      hotel_photo_5: h.hotel_photo_5,
      verification_status: "موثق",
    });
  };
  const handleDeleteHotel = (id: string) => {
    if (confirm("هل تريد حذف الفندق؟")) {
      setHotels(hotels.filter(h => h.id !== id));
      try {
        const stored = JSON.parse(localStorage.getItem("dalni_hotels") || "[]");
        localStorage.setItem("dalni_hotels", JSON.stringify(stored.filter((item: any) => item.id !== id)));
      } catch {}
      deleteFromSecureBackend("hotels", "hotel_id", id);
    }
  };
  const handleAddRestaurant = (r: any) => {
    const facilityId = r.facility_id || r.id || `R-0${restaurants.length + 1}`;
    const newRest = { id: facilityId, rating_avg: 5.0, ...r };
    setRestaurants((prev) => [newRest, ...prev]);
    setShowAddRestaurant(false);

    try {
      const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
      localStorage.setItem("dalni_restaurants", JSON.stringify([newRest, ...storedRests]));
    } catch {}

    sendToSecureBackend("restaurants", {
      facility_id: facilityId,
      facility_name: newRest.name || newRest.facility_name,
      facility_type: newRest.type || newRest.facility_type,
      city: newRest.city,
      address_details: newRest.address || newRest.address_details,
      phone_number: newRest.phone || newRest.phone_number,
      description: newRest.description,
      facility_image_1: newRest.facility_image_1,
      facility_image_2: newRest.facility_image_2,
      facility_image_3: newRest.facility_image_3,
      facility_image_4: newRest.facility_image_4,
      facility_image_5: newRest.facility_image_5,
      verification_status: newRest.verification_status || "موثق",
      working_hours: newRest.working_hours,
      features: Array.isArray(newRest.features) ? newRest.features.join("، ") : newRest.features,
      google_maps_url: newRest.google_maps_url,
      discount_percentage: newRest.discount_percentage || 20,
      whatsapp: newRest.whatsapp,
      partnership_status: newRest.partnership_status || "نشط",
      contract_start_date: newRest.contract_start_date,
      contract_end_date: newRest.contract_end_date,
    });
  };
  const handleUpdateRestaurant = (r: Restaurant) => {
    setRestaurants(restaurants.map(x => x.id === r.id ? r : x));
    setEditingRestaurant(null);
    try {
      const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
      const updated = storedRests.map((item: any) => item.id === r.id ? { ...item, ...r } : item);
      localStorage.setItem("dalni_restaurants", JSON.stringify(updated));
    } catch {}

    sendToSecureBackend("restaurants", {
      facility_id: r.id || (r as any).facility_id,
      facility_name: r.name || (r as any).facility_name,
      facility_type: r.type || (r as any).facility_type,
      city: r.city,
      address_details: r.address || (r as any).address_details,
      phone_number: r.phone || (r as any).phone_number,
      description: r.description,
      facility_image_1: r.facility_image_1,
      facility_image_2: r.facility_image_2,
      facility_image_3: r.facility_image_3,
      facility_image_4: r.facility_image_4,
      facility_image_5: r.facility_image_5,
      verification_status: (r as any).verification_status,
      working_hours: r.working_hours,
      features: Array.isArray((r as any).features) ? (r as any).features.join("، ") : (r as any).features,
      google_maps_url: r.google_maps_url,
      discount_percentage: (r as any).discount_percentage || 20,
      whatsapp: (r as any).whatsapp,
      partnership_status: r.partnership_status || "نشط",
      contract_start_date: r.contract_start_date,
      contract_end_date: r.contract_end_date,
    });
  };
  const handleDeleteRestaurant = (id: string) => {
    if (confirm("هل تريد حذف المطعم؟")) {
      setRestaurants(restaurants.filter(r => r.id !== id));
      try {
        const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
        localStorage.setItem("dalni_restaurants", JSON.stringify(storedRests.filter((r: any) => r.id !== id)));
      } catch {}
      deleteFromSecureBackend("restaurants", "facility_id", id);
    }
  };
  const handleAddAttraction = (a: any) => { 
    const placeId = a.place_id || a.id || `A-0${attractions.length + 1}`;
    const newPlace = { id: placeId, place_id: placeId, visitors_count: 0, ...a };
    setAttractions([...attractions, newPlace]); 
    setShowAddAttraction(false); 
    sendToSecureBackend("places", {
      place_id: placeId,
      place_name: newPlace.name || newPlace.place_name,
      description: newPlace.description,
      city: newPlace.city,
      longitude: newPlace.longitude,
      latitude: newPlace.latitude,
      category: newPlace.category,
      place_image: newPlace.place_image,
      is_unesco: newPlace.is_unesco,
      unesco_year: newPlace.unesco_year,
      entry_fee: newPlace.entry_fee,
      google_maps_url: newPlace.google_maps_url,
      gallery: newPlace.gallery,
    });
  };
  const handleUpdateAttraction = (a: Attraction) => { 
    setAttractions(attractions.map(x => x.id === a.id ? a : x)); 
    setEditingAttraction(null); 
    sendToSecureBackend("places", {
      place_id: a.id || (a as any).place_id,
      place_name: a.name || (a as any).place_name,
      description: a.description,
      city: a.city,
      longitude: a.longitude,
      latitude: a.latitude,
      category: a.category,
      place_image: a.place_image,
      is_unesco: a.is_unesco,
      unesco_year: a.unesco_year,
      entry_fee: (a as any).entry_fee,
      google_maps_url: a.google_maps_url,
      gallery: (a as any).gallery,
    });
  };
  const handleDeleteAttraction = (id: string) => { 
    if (confirm("هل تريد حذف المعلم السياحي؟")) {
      setAttractions(attractions.filter(a => a.id !== id)); 
      deleteFromSecureBackend("places", "place_id", id);
    }
  };
  const handleReplyTicket = (ticketId: string, reply: string) => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, reply, status: "تم الرد" as const } : t);
    setTickets(updated);
    try {
      localStorage.setItem("dalni_support_tickets", JSON.stringify(updated));
    } catch {}
  };
  // Offers
  const handleAddDailyOffer = (o: any) => { const newId = `DO-${String(dailyOffers.length + 1).padStart(3, "0")}`; setDailyOffers([...dailyOffers, { ...o, offer_daily_id: newId, id: newId }]); setShowAddDailyOffer(false); };
  const handleUpdateDailyOffer = (o: DailyOffer) => { setDailyOffers(dailyOffers.map(x => (x.offer_daily_id || x.id) === (o.offer_daily_id || o.id) ? o : x)); setEditingDailyOffer(null); };
  const handleDeleteDailyOffer = (id: string) => { if (confirm("حذف العرض؟")) setDailyOffers(dailyOffers.filter(o => (o.offer_daily_id || o.id) !== id)); };
  const handleAddWeeklyOffer = (o: any) => { const newId = `WO-${String(weeklyOffers.length + 1).padStart(3, "0")}`; setWeeklyOffers([...weeklyOffers, { ...o, offer_weekly_id: newId, id: newId }]); setShowAddWeeklyOffer(false); };
  const handleUpdateWeeklyOffer = (o: WeeklyOffer) => { setWeeklyOffers(weeklyOffers.map(x => (x.offer_weekly_id || x.id) === (o.offer_weekly_id || o.id) ? o : x)); setEditingWeeklyOffer(null); };
  const handleDeleteWeeklyOffer = (id: string) => { if (confirm("حذف العرض؟")) setWeeklyOffers(weeklyOffers.filter(o => (o.offer_weekly_id || o.id) !== id)); };
  const handleAddFacilityOffer = (o: any) => { const newId = `FO-${String(facilityOffers.length + 1).padStart(3, "0")}`; setFacilityOffers([...facilityOffers, { ...o, facility_offer_id: newId, id: newId }]); setShowAddFacilityOffer(false); };
  const handleUpdateFacilityOffer = (o: FacilityOffer) => { setFacilityOffers(facilityOffers.map(x => (x.facility_offer_id || x.id) === (o.facility_offer_id || o.id) ? o : x)); setEditingFacilityOffer(null); };
  const handleDeleteFacilityOffer = (id: string) => { if (confirm("حذف العرض؟")) setFacilityOffers(facilityOffers.filter(o => (o.facility_offer_id || o.id) !== id)); };
  // Bot & Live Support Chat Override
  const handleBotSend = () => {
    if (!botInput.trim() || !activeChatId) return;
    sendAdminReply(activeChatId, botInput.trim());
    setChatSessions(getChatSessions());
    setBotInput("");
  };

  /* ---- BOOKINGS HANDLERS (DelniDB bookings_daily & bookings_weekly) ---- */
  const handleTogglePaymentDaily = (id: string) => {
    setDailyBookings(prev =>
      prev.map(b => (b.booking_daily_id === id ? { ...b, payment_status: b.payment_status === "paid" ? "unpaid" : "paid" } : b))
    );
  };

  const handleToggleAttendedDaily = (id: string) => {
    setDailyBookings(prev =>
      prev.map(b => (b.booking_daily_id === id ? { ...b, attended: !b.attended } : b))
    );
  };

  const handleTogglePaymentWeekly = (id: string) => {
    setWeeklyBookings(prev =>
      prev.map(b => (b.booking_weekly_id === id ? { ...b, payment_status: b.payment_status === "paid" ? "unpaid" : "paid" } : b))
    );
  };

  const handleToggleAttendedWeekly = (id: string) => {
    setWeeklyBookings(prev =>
      prev.map(b => (b.booking_weekly_id === id ? { ...b, attended: !b.attended } : b))
    );
  };

  const { language } = useLanguage();
  const isAr = language === 'ar';

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "📊" },
    { id: "companies", label: isAr ? "شركات النقل" : "Transport Companies", icon: "🚌", badge: 3 },
    { id: "drivers", label: isAr ? "السائقون المسجلون" : "Registered Drivers", icon: "🧑‍✈️" },
    { id: "guides", label: isAr ? "اعتماد وثائق المرشدين" : "Guide Verification", icon: "🗺️", badge: guides.filter(g => g.verification_status?.includes("بانتظار")).length || undefined },
    { id: "trips", label: isAr ? "إدارة وتعيين الرحلات" : "Manage & Assign Tours", icon: "🧭" },
    { id: "bookings", label: isAr ? "سجل الحجوزات والدفع" : "Bookings & Payments", icon: "🎟️", badge: dailyBookings.length + weeklyBookings.length },
    { id: "offers", label: isAr ? "العروض الترويجية" : "Promotions & Offers", icon: "🎯" },
    { id: "private_trips", label: isAr ? "الرحلات الخاصة" : "Private Custom Trips", icon: "👑", badge: 2 },
    { id: "entities", label: isAr ? "المرافق والوجهات" : "Entities & Stays", icon: "🏛️" },
    { id: "reviews", label: isAr ? "التقييمات والمراجعات" : "Reviews & Ratings", icon: "⭐" },
    { id: "analytics", label: isAr ? "إحصائيات الأكثر حجزاً وتقييماً" : "Analytics & Stats", icon: "📈" },
    { id: "inquiries_chat", label: isAr ? "الاستفسارات والشات بوت" : "Inquiries & AI Chat", icon: "💬", badge: 2 },
  ];

  /* ============ RENDER ============ */
  return (
    <DashboardShell role="admin" roleLabel={isAr ? "مدير النظام الرئيسي" : "Super Admin"} userName={isAr ? "فريق إدارة دلّني" : "Libya Journeys Admin"} nav={nav} active={active} onNavigate={setActive}>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-black text-foreground">
          {isAr ? "لوحة الإدارة الشاملة والإحصائيات" : "Comprehensive Admin Dashboard & Analytics"}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isAr
            ? "الرقابة الكلية ومتابعة السيارات المتاحة بالمنصة من مختلف الشركات وتعيينها على الرحلات."
            : "Complete oversight, fleet tracking, guide approvals, and trip assignment management."}
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={isAr ? "شركات النقل" : "Transport Cos."} value={companies.length} hint={isAr ? `${companies.filter(c => c.status === "موثق").length} موثقة` : `${companies.filter(c => c.status === "موثق").length} Verified`} icon="🚌" tone="clay" />
        <StatCard label={isAr ? "السائقون المسجلون" : "Registered Drivers"} value={drivers.length} hint={isAr ? "مسجلون عبر شركات النقل" : "Registered via Transport Cos"} icon="🧑‍✈️" tone="sea" />
        <StatCard label={isAr ? "طلبات اعتماد المرشدين" : "Guide Verification Requests"} value={guides.filter(g => g.verification_status?.includes("بانتظار")).length} hint={isAr ? "وثائق بانتظار المراجعة" : "Pending documents review"} icon="🗺️" tone="sun" />
        <StatCard label={isAr ? "الرحلات الخاصة VIP" : "VIP Custom Trips"} value={privateTrips.length} hint={isAr ? `${privateTrips.filter(p => p.status_order === "قيد الدراسة").length} طلبات جديدة` : `${privateTrips.filter(p => p.status_order === "قيد الدراسة").length} New Requests`} icon="👑" tone="green" />
      </div>

      {/* OVERVIEW TAB */}
      {active === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6 text-right">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="أحدث طلبات توثيق المرشدين السياحيين الواردة" action={<button onClick={() => setActive("guides")} className="text-primary text-sm font-black hover:underline">عرض الكل</button>}>
              <div className="space-y-3">
                {guides.filter(g => g.verification_status?.includes("بانتظار")).map((g) => (
                  <div key={g.license_number} className="p-4 rounded-xl border border-border bg-white flex flex-wrap justify-between items-center gap-3">
                    <div>
                      <div className="font-black text-foreground text-sm">{g.full_name} ({g.license_number})</div>
                      {g.email && <div className="text-xs text-primary font-bold mt-0.5">✉️ {g.email}</div>}
                      <div className="text-xs text-muted-foreground mt-0.5">📜 {g.certificate}</div>
                    </div>
                    <button onClick={() => setViewingGuide(g)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black cursor-pointer">معاينة الوثائق والاعتماد 📄</button>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="أحدث التقييمات الواردة من السياح">
              <div className="space-y-3">
                {reviews.slice(0, 3).map((r) => (
                  <div key={r.id} className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground text-xs">{r.tourist_name} عن {r.target_type}: <span className="text-primary">{r.target_name}</span></span>
                      <span className="text-gold-foreground text-xs font-bold">{"⭐".repeat(r.stars_rating)} ({r.stars_rating}/5)</span>
                    </div>
                    <p className="text-xs text-muted-foreground">" {r.comment_text} "</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <div className="space-y-6">
            <SectionCard title="إجراءات سريعة للأدمن">
              <div className="grid grid-cols-2 gap-2">
                <QuickAction icon="🚌" label="إضافة شركة نقل" onClick={() => setShowAddCompany(true)} />
                <QuickAction icon="🧭" label="رحلة يومية" onClick={() => setShowAddTrip("daily")} />
                <QuickAction icon="🗓️" label="رحلة أسبوعية" onClick={() => setShowAddTrip("weekly")} />
                <QuickAction icon="🏨" label="إضافة فندق" onClick={() => setShowAddHotel(true)} />
                <QuickAction icon="🍽️" label="إضافة مطعم" onClick={() => setShowAddRestaurant(true)} />
                          <QuickAction icon="👑" label={isAr ? "إضافة رحلة خاصة" : "Add Private Trip"} onClick={() => setShowAddPrivateTrip(true)} />
                <QuickAction icon="🏛️" label="معلم سياحي" onClick={() => setShowAddAttraction(true)} />
                <QuickAction icon="🎯" label="عرض يومي" onClick={() => setShowAddDailyOffer(true)} />
                <QuickAction icon="🎁" label="عرض أسبوعي" onClick={() => setShowAddWeeklyOffer(true)} />
                <QuickAction icon="🍕" label="عرض مطعم" onClick={() => setShowAddFacilityOffer(true)} />
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* COMPANIES TAB */}
      {active === "companies" && (
        <SectionCard title="إدارة شركات النقل السياحي المتعاقد معها بالمنصة" action={<button onClick={() => setShowAddCompany(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">+ إضافة شركة جديدة</button>}>
          <div className="overflow-x-auto text-right">
            <table className="w-full text-sm">
              <thead><tr className="text-right text-xs text-muted-foreground border-b border-border">
                <th className="pb-3 font-bold">رقم العقد</th>
                <th className="pb-3 font-bold">اسم الشركة</th>
                <th className="pb-3 font-bold">المدينة ونقطة الانطلاق</th>
                <th className="pb-3 font-bold">الموقع (Google Maps)</th>
                <th className="pb-3 font-bold">الهاتف</th>
                <th className="pb-3 font-bold">الأسطول</th>
                <th className="pb-3 font-bold">الحالة</th>
                <th className="pb-3 font-bold">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {companies.map((c) => (
                  <tr key={c.id || c.contract_number}>
                    <td className="py-3 font-mono text-xs font-bold">{c.contract_number}</td>
                    <td className="py-3 font-bold text-foreground">{c.name || c.company_name}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${c.city === "بنغازي" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
                        📍 {c.city || "طرابلس"}
                      </span>
                    </td>
                    <td className="py-3">
                      {c.address && (c.address.startsWith("http") || c.address.includes("maps")) ? (
                        <a
                          href={c.address.startsWith("http") ? c.address : `https://${c.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold inline-flex items-center gap-1 transition"
                        >
                          🗺️ الخريطة ↗
                        </a>
                      ) : (
                        <span className="text-xs text-muted-foreground">{c.address || "غير محدد"}</span>
                      )}
                    </td>
                    <td className="py-3 text-muted-foreground">{c.phone || c.phone_number}</td>
                    <td className="py-3 font-bold">{c.total_vehicles} مركبة</td>
                    <td className="py-3"><Badge tone={c.status === "موثق" || c.verification_status === "موثق" ? "green" : "sun"}>{c.status || c.verification_status || "موثق"}</Badge></td>
                    <td className="py-3 flex gap-2">
                      <button onClick={() => setEditingCompany(c)} className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                      <button onClick={() => handleDeleteCompany(c.contract_number || c.id || "")} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* DRIVERS TAB */}
      {active === "drivers" && (
        <SectionCard title="السائقون المسجلون في المنصة عبر الشركات">
          <div className="mb-4 p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground font-semibold text-right">📌 إضافة السائق وتعيين المركبات من صلاحيات شركات النقل. هنا يطلع الأدمن على الجميع.</div>
          <div className="overflow-x-auto text-right">
            <table className="w-full text-sm">
              <thead><tr className="text-right text-xs text-muted-foreground border-b border-border">
                <th className="pb-3 font-bold">اسم السائق</th><th className="pb-3 font-bold">رقم الرخصة</th><th className="pb-3 font-bold">الهاتف</th><th className="pb-3 font-bold">شركة النقل</th><th className="pb-3 font-bold">المركبة</th><th className="pb-3 font-bold">الحالة</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {drivers.map((d) => (
                  <tr key={d.driver_license_number}>
                    <td className="py-3 font-bold text-foreground">{d.full_name}</td>
                    <td className="py-3 font-mono text-xs font-bold">{d.driver_license_number}</td>
                    <td className="py-3 text-muted-foreground">{d.phone_number}</td>
                    <td className="py-3 font-bold text-primary text-xs">{d.contract_number}</td>
                    <td className="py-3 text-muted-foreground font-bold">{d.assigned_vehicle_plate}</td>
                    <td className="py-3"><Badge tone={d.account_status === "نشط" ? "green" : "red"}>{d.account_status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* GUIDES TAB */}
      {active === "guides" && (
        <SectionCard title="معاينة وثائق المرشدين واعتمادهم">
          <div className="mb-4 p-3 rounded-xl bg-sun-soft/30 border border-sun/20 text-xs text-muted-foreground font-semibold text-right">
            📌 يعرض هذا القسم فقط المرشدين الحقيقيين المسجلين في قاعدة بيانات دِلني (DelniDB).
          </div>
          {guides.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-border text-muted-foreground text-xs font-bold">
              لا يوجد مرشدين مسجلين في قاعدة البيانات حالياً.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-right">
              {guides.map((g) => (
                <div key={g.license_number} className="p-5 rounded-2xl border border-border bg-white shadow-soft space-y-3 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          {g.avatar ? (
                            <img src={g.avatar} alt={g.full_name} className="w-9 h-9 rounded-full object-cover border shrink-0" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-slate-100 grid place-items-center text-sm shrink-0 border">
                              👤
                            </div>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-black text-foreground text-sm truncate">{g.full_name}</h3>
                            {g.title && <div className="text-[11px] text-primary font-bold truncate">{g.title}</div>}
                          </div>
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-1">رقم الرخصة: <span className="font-mono font-bold text-slate-800">{g.license_number}</span></div>
                        {g.email && <div className="text-[11px] text-slate-600 font-semibold mt-0.5 truncate">✉️ {g.email}</div>}
                        {g.phone_number && <div className="text-[11px] text-slate-600 font-semibold mt-0.5">📱 {g.phone_number}</div>}
                      </div>
                      <Badge tone={g.verification_status === "موثق" ? "green" : g.verification_status === "مرفوض" ? "red" : "sun"}>
                        {g.verification_status || "بانتظار التوثيق"}
                      </Badge>
                    </div>

                    {g.bio && <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{g.bio}</p>}

                    <div className="text-xs space-y-1.5 pt-1 border-t border-slate-100">
                      <div className="font-bold text-foreground truncate">📜 {g.certificate}</div>
                      {g.certificate_name && (
                        <div className="text-[11px] text-primary font-black bg-primary/5 px-2 py-0.5 rounded border border-primary/20 inline-flex items-center gap-1">
                          <span>📎 ملف الشهادة المرفق:</span>
                          <span className="underline">{g.certificate_name}</span>
                        </div>
                      )}
                      <div className="font-bold text-foreground">⏳ الخبرة: <span className="font-normal text-muted-foreground">{g.years_of_experience} سنوات</span></div>
                      <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                        💰 أجر المرشد اليومي: {g.daily_rate || g.price_per_day || 150} د.ل / اليوم
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 flex gap-2 border-t border-slate-100">
                    <button 
                      onClick={() => setViewingGuide(g)} 
                      className="flex-1 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow hover:opacity-95 transition cursor-pointer"
                    >
                      معاينة الوثائق والاعتماد 📄
                    </button>
                    <button 
                      onClick={() => handleDeleteGuide(g.license_number)} 
                      className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-black transition cursor-pointer border border-red-200"
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* TRIPS TAB */}
      {active === "trips" && (
        <div className="space-y-6 text-right">
          {/* Daily Trips */}
          <SectionCard title="إدارة الرحلات اليومية (يومان في الأسبوع + حافلة 25 أو 50 راكب)" action={<button onClick={() => setShowAddTrip("daily")} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">+ رحلة يومية جديدة (يومان/أسبوع)</button>}>
            <div className="space-y-4">
              {dailyTrips.map((d) => (
                <div key={d.id} className="p-4 rounded-2xl border border-border bg-white flex flex-wrap gap-4 hover:shadow-soft transition-shadow text-right">
                  {d.photo && <img src={d.photo} alt={d.title} className="w-24 h-20 rounded-xl object-cover border flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-foreground text-sm">{d.title}</h4>
                      <Badge tone={d.is_active ? "green" : "muted"}>{d.is_active ? "نشطة" : "موقوفة"}</Badge>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black">
                        📅 يومان أسبوعياً: {Array.isArray(d.recurring_days) ? d.recurring_days.join(" و ") : (d.recurring_days || "الأحد والأربعاء")}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                        🚌 حافلة {d.bus_capacity || 50} راكب
                      </span>
                      {d.destination && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black">
                          📍 {d.destination}
                        </span>
                      )}
                      {(d as any).activities && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                          🎯 {(d as any).activities}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{d.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-foreground mt-2">
                      <span>💰 د.ل {d.price_per_seat}</span>
                      <span>👥 {d.bookings_count} حجز</span>
                      <span>⭐ {d.rating_avg}</span>
                      <span>🪑 {d.available_seats} مقعد متاح من أصل {d.max_capacity}</span>
                      {d.guide_license && <span>👨‍✈️ مرشد: {d.guide_license}</span>}
                    </div>
                    {d.vehicle_plates && d.vehicle_plates.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-black text-muted-foreground">🚌 الحافلة المعينة:</span>
                        {d.vehicle_plates.map(plate => (
                          <span key={plate} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black border border-blue-100">{plate}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditingDailyTrip(d)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black">تعديل وتعيين الحافلة</button>
                    <button onClick={() => handleDeleteDailyTrip(d.daily_trip_id || d.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Weekly Trips */}
          <SectionCard title="إدارة الرحلات الأسبوعية (يوم في الأسبوع + حافلة 25 أو 50 راكب)" action={<button onClick={() => setShowAddTrip("weekly")} className="px-4 py-2 bg-gradient-sun text-gold-foreground rounded-xl text-xs font-black">+ رحلة أسبوعية جديدة (يوم/أسبوع)</button>}>
            <div className="space-y-4">
              {weeklyTrips.map((w) => (
                <div key={w.id} className="p-4 rounded-2xl border border-border bg-white flex flex-wrap gap-4 hover:shadow-soft transition-shadow text-right">
                  {w.photo && <img src={w.photo} alt={w.title} className="w-28 h-20 rounded-xl object-cover border flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-foreground text-sm">{w.title}</h4>
                      <Badge tone={w.is_active ? "green" : "muted"}>{w.is_active ? "نشطة" : "موقوفة"}</Badge>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-black">
                        🗓️ كل {w.weekly_day || "جمعة"} (يوم في الأسبوع)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                        🚍 حافلة {w.bus_capacity || 25} راكب
                      </span>
                      {w.destination && (
                        <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-black">
                          📍 {w.destination}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs font-bold text-foreground mt-2">
                      <span>🗓️ {w.start_date} ← {w.end_date}</span>
                      <span>💰 د.ل {w.seat_per_price}</span>
                      <span>👥 {w.bookings_count} حجز</span>
                      <span>⭐ {w.rating_avg}</span>
                      <span>🪑 {w.available_seats || w.max_capacity} مقعد متاح من أصل {w.max_capacity}</span>
                      {w.guide_license && <span>👨‍✈️ مرشد: {w.guide_license}</span>}
                    </div>
                    {w.vehicle_plates && w.vehicle_plates.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-black text-muted-foreground">🚌 الحافلة المعينة:</span>
                        {w.vehicle_plates.map(plate => (
                          <span key={plate} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full text-[10px] font-black border border-amber-100">{plate}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setEditingWeeklyTrip(w)} className="px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-xs font-black">تعديل وتعيين الحافلة</button>
                    <button onClick={() => handleDeleteWeeklyTrip(w.weekly_trip_id || w.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* All Platform Vehicles Overview */}
          <SectionCard title="🚌 أسطول المركبات المتاحة بالمنصة (من كل الشركات المشتركة)">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 text-right">
              {vehicles.map((v) => (
                <div key={v.plate_number} className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-black text-foreground text-sm">{v.plate_number}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{v.vehicle_type}</div>
                    </div>
                    <Badge tone={v.status === "جاهزة" ? "green" : v.status === "في رحلة" ? "sun" : "red"}>{v.status}</Badge>
                  </div>
                  <div className="text-xs font-bold text-primary">🏢 {v.company_name} · 👥 {v.capacity} مقعد</div>
                  <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span>💰 سعر التأجير اليومي:</span>
                    <span>{v.daily_rate} د.ل / اليوم</span>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* BOOKINGS TAB (DelniDB bookings_daily & bookings_weekly) */}
      {active === "bookings" && (
        <div className="space-y-6 text-right">
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70 text-xs font-semibold text-blue-950 flex items-center gap-3">
            <span className="text-2xl">🎟️</span>
            <div>
              <span className="font-black block text-sm mb-0.5">سجل الحجوزات الميدانية (حجوزات الرحلات اليومية والأسبوعية):</span>
              متابعة مباشرة لمدفوعات السياح وحالة الحضور والتأكيد لجميع الرحلات اليومية والأسبوعية.
            </div>
          </div>

          {/* Daily Trips Bookings */}
          <SectionCard title="🎟️ حجوزات الرحلات اليومية">
            <div className="overflow-x-auto text-right">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 font-bold">رقم الحجز</th>
                    <th className="pb-3 font-bold">السائح / المرافقون</th>
                    <th className="pb-3 font-bold">الرحلة اليومية</th>
                    <th className="pb-3 font-bold">المقاعد</th>
                    <th className="pb-3 font-bold">المبلغ الإجمالي</th>
                    <th className="pb-3 font-bold">حالة الدفع</th>
                    <th className="pb-3 font-bold">حالة الحضور</th>
                    <th className="pb-3 font-bold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {dailyBookings.map((b) => {
                    const trip = dailyTrips.find((t) => (t.daily_trip_id || t.id) === b.daily_trip_id);
                    return (
                      <tr key={b.booking_daily_id}>
                        <td className="py-3 font-mono text-xs font-bold text-primary">{b.booking_daily_id}</td>
                        <td className="py-3 font-bold text-foreground">
                          <div>{b.tourist_id}</div>
                          {b.passengers_names && <div className="text-[11px] text-muted-foreground font-normal">{b.passengers_names}</div>}
                        </td>
                        <td className="py-3 text-xs font-bold text-slate-700">{trip?.trip_title || trip?.title || b.daily_trip_id}</td>
                        <td className="py-3 font-bold">{b.number_of_seats} مقاعد</td>
                        <td className="py-3 font-black text-emerald-600">{b.total_price} د.ل</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentDaily(b.booking_daily_id)}
                            className="cursor-pointer"
                          >
                            <Badge tone={b.payment_status === "paid" ? "green" : "red"}>
                              {b.payment_status === "paid" ? "✓ مدفوع" : "غير مدفوع (اضغط للدفع)"}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendedDaily(b.booking_daily_id)}
                            className="cursor-pointer"
                          >
                            <Badge tone={b.attended ? "green" : "muted"}>
                              {b.attended ? "✓ حضر" : "لم يحضر بعد"}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-bold text-blue-700">{b.booking_status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Weekly Trips Bookings */}
          <SectionCard title="🗓️ حجوزات الرحلات الأسبوعية">
            <div className="overflow-x-auto text-right">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-xs text-muted-foreground border-b border-border">
                    <th className="pb-3 font-bold">رقم الحجز</th>
                    <th className="pb-3 font-bold">السائح / المرافقون</th>
                    <th className="pb-3 font-bold">الرحلة الأسبوعية</th>
                    <th className="pb-3 font-bold">المقاعد</th>
                    <th className="pb-3 font-bold">المبلغ الإجمالي</th>
                    <th className="pb-3 font-bold">حالة الدفع</th>
                    <th className="pb-3 font-bold">حالة الحضور</th>
                    <th className="pb-3 font-bold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {weeklyBookings.map((b) => {
                    const trip = weeklyTrips.find((t) => (t.weekly_trip_id || t.id) === b.weekly_trip_id);
                    return (
                      <tr key={b.booking_weekly_id}>
                        <td className="py-3 font-mono text-xs font-bold text-primary">{b.booking_weekly_id}</td>
                        <td className="py-3 font-bold text-foreground">
                          <div>{b.tourist_id}</div>
                          {b.passengers_names && <div className="text-[11px] text-muted-foreground font-normal">{b.passengers_names}</div>}
                        </td>
                        <td className="py-3 text-xs font-bold text-slate-700">{trip?.trip_title || trip?.title || b.weekly_trip_id}</td>
                        <td className="py-3 font-bold">{b.number_of_seats} مقاعد</td>
                        <td className="py-3 font-black text-emerald-600">{b.total_price} د.ل</td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleTogglePaymentWeekly(b.booking_weekly_id)}
                            className="cursor-pointer"
                          >
                            <Badge tone={b.payment_status === "paid" ? "green" : "red"}>
                              {b.payment_status === "paid" ? "✓ مدفوع" : "غير مدفوع (اضغط للدفع)"}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendedWeekly(b.booking_weekly_id)}
                            className="cursor-pointer"
                          >
                            <Badge tone={b.attended ? "green" : "muted"}>
                              {b.attended ? "✓ حضر" : "لم يحضر بعد"}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-3">
                          <span className="text-xs font-bold text-blue-700">{b.booking_status}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      )}

      {/* OFFERS TAB */}
      {active === "offers" && (
        <div className="space-y-6 text-right">
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs font-semibold text-muted-foreground">
            🎯 إدارة العروض الترويجية لجذب السياح — يمكنك إضافة عروض للرحلات اليومية والأسبوعية والمطاعم والكافيهات مع صورة وتاريخ الصلاحية ونسبة الخصم.
          </div>

          {/* Daily Offers */}
          <SectionCard title="🎯 عروض الرحلات اليومية (trips_daily_offers)" action={<button onClick={() => setShowAddDailyOffer(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">+ إضافة عرض يومي</button>}>
            {dailyOffers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">لا توجد عروض يومية حالياً.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {dailyOffers.map(o => {
                  const trip = dailyTrips.find(t => t.id === o.daily_trip_id);
                  return (
                    <div key={o.id} className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft">
                      {o.url_image_offer && <img src={o.url_image_offer} alt="" className="w-full h-36 object-cover" />}
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-foreground text-sm flex-1">{o.title_offer}</h4>
                          <span className="text-xl font-black text-emerald-600 flex-shrink-0 mr-2">-{o.percent_discount}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{o.description}</p>
                        <div className="text-xs font-bold text-primary">🧭 {trip?.title || o.daily_trip_id}</div>
                        <div className="text-xs text-muted-foreground font-bold">📅 {o.date_start} ← {o.date_end}</div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setEditingDailyOffer(o)} className="flex-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                          <button onClick={() => handleDeleteDailyOffer(o.offer_daily_id || o.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Weekly Offers */}
          <SectionCard title="🎁 عروض الرحلات الأسبوعية (trips_weekly_offers)" action={<button onClick={() => setShowAddWeeklyOffer(true)} className="px-4 py-2 bg-gradient-sun text-gold-foreground rounded-xl text-xs font-black">+ إضافة عرض أسبوعي</button>}>
            {weeklyOffers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">لا توجد عروض أسبوعية حالياً.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {weeklyOffers.map(o => {
                  const trip = weeklyTrips.find(t => t.id === o.weekly_trip_id);
                  return (
                    <div key={o.id} className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft">
                      {o.offer_image_url && <img src={o.offer_image_url} alt="" className="w-full h-36 object-cover" />}
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-foreground text-sm flex-1">{o.offer_title}</h4>
                          <span className="text-xl font-black text-amber-600 flex-shrink-0 mr-2">-{o.percent_discount}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{o.description}</p>
                        <div className="text-xs font-bold text-primary">🗓️ {trip?.title || o.weekly_trip_id}</div>
                        <div className="text-xs text-muted-foreground font-bold">📅 {o.date_start} ← {o.date_end}</div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setEditingWeeklyOffer(o)} className="flex-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                          <button onClick={() => handleDeleteWeeklyOffer(o.offer_weekly_id || o.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Facility Offers */}
          <SectionCard title="🍕 عروض المطاعم والكافيهات (facilities_offers)" action={<button onClick={() => setShowAddFacilityOffer(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">+ إضافة عرض مطعم/كافيه</button>}>
            {facilityOffers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">لا توجد عروض منشآت حالياً.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {facilityOffers.map(o => {
                  const fac = restaurants.find(r => r.id === o.facility_id);
                  return (
                    <div key={o.id} className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft">
                      {o.offer_image_url && <img src={o.offer_image_url} alt="" className="w-full h-36 object-cover" />}
                      <div className="p-4 space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-foreground text-sm flex-1">{o.title_offer}</h4>
                          <span className="text-xl font-black text-rose-600 flex-shrink-0 mr-2">-{o.percent_discount}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{o.description}</p>
                        <div className="text-xs font-bold text-primary">🍽️ {fac?.name || o.facility_id}</div>
                        <div className="text-xs text-muted-foreground font-bold">📅 {o.date_start} ← {o.date_end}</div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setEditingFacilityOffer(o)} className="flex-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                          <button onClick={() => handleDeleteFacilityOffer(o.facility_offer_id || o.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>
      )}

      {/* PRIVATE TRIPS */}
      {active === "private_trips" && (
        <SectionCard title="إدارة الرحلات الخاصة VIP (تسعير وتحديد تكاليف المرشد والنقل والخدمات)">
          <div className="space-y-4 text-right">
            {privateTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">لا توجد طلبات رحلات خاصة VIP حالياً.</div>
            ) : (
              privateTrips.map((pt) => (
                <div key={pt.private_trip_id} className="p-5 rounded-2xl border border-border bg-white space-y-3 shadow-xs">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-black text-foreground text-base">{pt.customer_name} ({pt.customer_phone})</h3>
                      <div className="text-xs text-muted-foreground mt-0.5 font-bold">
                        👨‍✈️ المرشد المطلوب: <span className="text-primary font-black">{pt.guide_license_number || "غير محدد"}</span>
                      </div>
                    </div>
                    <Badge tone={pt.status_order === "مؤكدة" ? "green" : pt.status_order?.includes("موافقة") ? "sea" : pt.status_order === "ملغاة من السائح" ? "red" : "sun"}>
                      {pt.status_order || "بانتظار تسعير الإدارة"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl font-medium">" {pt.customer_description} "</p>
                  {pt.customer_requirements && (
                    <div className="text-xs text-amber-900 bg-amber-50/70 p-2 rounded-xl border border-amber-200/60 font-semibold">
                      <b>متطلبات السائح الخاصة:</b> {pt.customer_requirements}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground">
                    <span>📅 تاريخ الانطلاق: {pt.preferred_start_date}</span>
                    <span>⏱️ المدة: {pt.duration_days} أيام</span>
                    <span>👥 عدد المرافقين: {pt.number_of_companions}</span>
                    {pt.quoted_price && <span className="text-emerald-700 font-black">💰 التسعيرة المعتمدة: {pt.quoted_price} د.ل</span>}
                  </div>
                  {pt.admin_itinerary_plan && (
                    <div className="text-xs bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-emerald-950 font-semibold">
                      <b>خطة البرنامج:</b> {pt.admin_itinerary_plan}
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => handleDeletePrivate(pt.private_trip_id)} className="px-4 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-black hover:bg-red-50 cursor-pointer">
                      حذف
                    </button>
                    <button onClick={() => setEvaluatingPrivateTrip(pt)} className="px-4 py-1.5 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow hover:opacity-95 cursor-pointer">
                      {pt.quoted_price ? "تعديل الحسبة والتسعيرة" : "احتساب التكلفة واعتماد التسعيرة"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      )}

      {/* ENTITIES */}
      {active === "entities" && (
        <div className="space-y-6 text-right">
          {/* Information Notice */}
          <div className="p-4 rounded-2xl border border-amber-200 bg-amber-50/70 text-xs font-semibold text-amber-900 flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">🏛️</span>
            <div>
              <span className="font-black block text-sm mb-0.5">تنويه هام بشأن الفنادق والمطاعم والمعالم:</span>
              الفنادق والمطاعم في منصة دلّني هي أدلة استكشافية وتعريفية فقط (عرض المنشأة ونوع الطعام والتواصل المباشر مع المنشأة)، وهي غير قابلة للحجز المباشر للغرف أو الطاولات عبر المنصة. المعالم السياحية تظهر بصورة رئيسية واحدة مع خرائط Google Maps.
            </div>
          </div>

          <SectionCard
            title="🏨 دليل أماكن الإقامة والفنادق في ليبيا (فنادق فاخرة — منتجعات — شقق فندقية — مخيمات صحراوية)"
            action={
              <button
                onClick={() => setShowAddHotel(true)}
                className="px-4 py-2 bg-[#003580] hover:bg-blue-900 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer transition"
              >
                + إضافة مكان إقامة جديد
              </button>
            }
          >
            <div className="grid md:grid-cols-2 gap-4">
              {hotels.map((h) => {
                const propTypeLabel =
                  h.property_type === "resort"
                    ? "🏖️ منتجع سياحي"
                    : h.property_type === "apartment"
                    ? "🏢 شقق فندقية"
                    : h.property_type === "heritage"
                    ? "⛺ مخيمات صحراوية"
                    : "🏨 فندق فاخر";
                return (
                  <div key={h.id} className="p-4 rounded-2xl border border-border bg-white space-y-3 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003580] text-[10px] font-black border border-blue-200">
                            {propTypeLabel}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200">
                            🏷️ خصم {h.discount_percentage || 15}% دلّني
                          </span>
                        </div>
                        <h4 className="font-black text-[#003580] text-base">{h.name}</h4>
                        <div className="text-xs font-bold text-amber-500 mt-0.5">{"★".repeat(h.stars)} ({h.stars} نجوم)</div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-semibold">📍 {h.city} — {h.address}</div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {h.partnership_status === "موقوف" ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black border border-red-200">
                            🔴 موقوف (مخفي من المنصة)
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                            🟢 نشط (معروض بالمنصة)
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200">
                          دليل تعريفي
                        </span>
                      </div>
                    </div>

                    {(h.contract_start_date || h.contract_end_date) && (
                      <div className="text-[11px] font-bold text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200">
                        <span>📅 فترة العقد:</span>
                        <span className="font-mono text-slate-900 font-bold">{h.contract_start_date || 'تاريخ التسجيل'}</span>
                        <span>إلى</span>
                        <span className="font-mono text-blue-900 font-black">{h.contract_end_date || 'مستمر'}</span>
                      </div>
                    )}

                  {/* Main & Thumbnails Gallery (5 Photos) */}
                  <div className="space-y-1.5">
                    <img src={h.hotel_photo_1} alt={h.name} className="w-full h-40 rounded-xl object-cover border shadow-2xs" />
                    <div className="grid grid-cols-5 gap-1.5">
                      {[h.hotel_photo_1, h.hotel_photo_2, h.hotel_photo_3, h.hotel_photo_4, h.hotel_photo_5].map((imgUrl, idx) => (
                        <div key={idx} className="h-10 rounded-lg overflow-hidden border border-border bg-muted/30">
                          <img src={imgUrl || h.hotel_photo_1} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio Description */}
                  {h.description && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed text-slate-800 font-semibold">
                      <span className="font-bold text-slate-900 block mb-0.5">📝 نبذة الفندق والمميزات:</span>
                      {h.description}
                    </div>
                  )}

                  {/* Working Hours & Check-in */}
                  {h.working_hours && (
                    <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                      <span>⏰</span>
                      <span className="text-amber-950 font-bold">{h.working_hours}</span>
                    </div>
                  )}

                  {/* Google Maps Location */}
                  {h.google_maps_url && (
                    <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1">📍 موقع الفندق الجغرافي:</span>
                      <a href={h.google_maps_url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-black hover:bg-blue-700 transition">
                        🗺️ فتح في خرائط جوجل ↗
                      </a>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">📞 {h.phone}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingHotel(h)} className="px-3.5 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition">تعديل</button>
                      <button onClick={() => handleDeleteHotel(h.id)} className="px-3.5 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg hover:bg-red-100 transition">حذف</button>
                    </div>
                  </div>
                </div>
              ); })}
            </div>
          </SectionCard>

          <SectionCard title="🍽️ دليل المطاعم والمقاهي (دليل تعريفي — نبذة وساعات عمل وخرائط و5 صور)" action={<button onClick={() => setShowAddRestaurant(true)} className="px-4 py-2 bg-gradient-sun text-gold-foreground rounded-xl text-xs font-black">+ إضافة مطعم/مقهى بالدليل</button>}>
            <div className="grid md:grid-cols-2 gap-4">
              {restaurants.map((r) => (
                <div key={r.id} className="p-4 rounded-2xl border border-border bg-white space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-foreground text-base">{r.name}</h4>
                      <div className="text-xs font-bold text-emerald-700 mt-0.5">🍲 {r.type} · ⭐ {r.rating_avg}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-semibold">📍 {r.city} — {r.address}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {r.partnership_status === "موقوف" ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-black border border-red-200">
                          🔴 موقوف (مخفي من المنصة)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black border border-emerald-200">
                          🟢 نشط (معروض بالمنصة)
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200">
                        دليل تعريفي
                      </span>
                    </div>
                  </div>

                  {(r.contract_start_date || r.contract_end_date) && (
                    <div className="text-[11px] font-bold text-slate-600 bg-slate-100/90 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border border-slate-200">
                      <span>📅 فترة العقد:</span>
                      <span className="font-mono text-slate-900 font-bold">{r.contract_start_date || 'تاريخ التسجيل'}</span>
                      <span>إلى</span>
                      <span className="font-mono text-blue-900 font-black">{r.contract_end_date || 'مستمر'}</span>
                    </div>
                  )}

                  {/* Main & Thumbnails Gallery (5 Photos) */}
                  <div className="space-y-1.5">
                    <img src={r.facility_image_1} alt={r.name} className="w-full h-40 rounded-xl object-cover border shadow-2xs" />
                    <div className="grid grid-cols-5 gap-1.5">
                      {[r.facility_image_1, r.facility_image_2, r.facility_image_3, r.facility_image_4, r.facility_image_5].map((imgUrl, idx) => (
                        <div key={idx} className="h-10 rounded-lg overflow-hidden border border-border bg-muted/30">
                          <img src={imgUrl || r.facility_image_1} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bio Description */}
                  {r.description && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs leading-relaxed text-slate-800 font-semibold">
                      <span className="font-bold text-slate-900 block mb-0.5">📜 نبذة الوجبات والخدمات:</span>
                      {r.description}
                    </div>
                  )}

                  {/* Working Hours */}
                  {r.working_hours && (
                    <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 bg-amber-50/60 p-2 rounded-xl border border-amber-200/60">
                      <span>⏰</span>
                      <span className="text-amber-950 font-bold">ساعات العمل: {r.working_hours}</span>
                    </div>
                  )}

                  {/* Google Maps Location */}
                  {r.google_maps_url && (
                    <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs font-bold text-blue-900">
                      <span className="flex items-center gap-1">📍 موقع المطعم/المقهى على الخريطة:</span>
                      <a href={r.google_maps_url} target="_blank" rel="noreferrer" className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-black hover:bg-blue-700 transition">
                        🗺️ فتح في خرائط جوجل ↗
                      </a>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    <span className="font-bold text-foreground">📞 {r.phone}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setEditingRestaurant(r)} className="px-3.5 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition">تعديل</button>
                      <button onClick={() => handleDeleteRestaurant(r.id)} className="px-3.5 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg hover:bg-red-100 transition">حذف</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="🏛️ المعالم والوجهات السياحية (صورة رئيسية واحدة + Google Maps)" action={<button onClick={() => setShowAddAttraction(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">+ إضافة معلم</button>}>
            <div className="grid md:grid-cols-2 gap-4">
              {attractions.map((a) => (
                <div key={a.id} className="p-4 rounded-2xl border border-border bg-white space-y-3">
                  <div className="flex gap-3">
                    <img src={a.place_image || "/assets/ai_ruins.jpg"} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-foreground text-sm">{a.name}</h4>
                      <div className="text-xs text-muted-foreground mt-0.5">📍 {a.city} · 👥 {a.visitors_count} استعلام وزيارة</div>
                      <div className="mt-1">
                        <Badge tone="sea">{a.category}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{a.description}</p>
                    </div>
                  </div>
                  {(a.latitude || a.google_maps_url) && (
                    <div className="p-2.5 rounded-xl flex items-center justify-between gap-2" style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)" }}>
                      <div className="text-xs font-bold text-blue-700">
                        📍 {a.latitude && a.longitude ? `${a.latitude}°N, ${a.longitude}°E` : "موقع مضاف"}
                      </div>
                      {a.google_maps_url && (
                        <a href={a.google_maps_url} target="_blank" rel="noreferrer" className="flex-shrink-0 px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black hover:bg-blue-700 transition">
                          🗺️ فتح الخريطة
                        </a>
                      )}
                    </div>
                  )}
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingAttraction(a)} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                    <button onClick={() => handleDeleteAttraction(a.place_id || a.id || "")} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* REVIEWS */}
      {active === "reviews" && (
        <SectionCard title="إدارة تقييمات السياح (الرحلات، الفنادق، المطاعم، المرشدون، الشركات)">
          <div className="space-y-4 text-right">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl border border-border bg-white space-y-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge tone="sea">{rev.target_type}</Badge>
                    <span className="font-black text-foreground text-sm">{rev.target_name}</span>
                  </div>
                  <div className="text-gold-foreground font-black text-sm">{"⭐".repeat(rev.stars_rating)} ({rev.stars_rating}/5)</div>
                </div>
                <div className="text-xs text-muted-foreground">👤 {rev.tourist_name} · 🗓️ {rev.created_at}</div>
                <p className="p-3 rounded-xl bg-muted/30 text-xs font-semibold text-foreground">" {rev.comment_text} "</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ANALYTICS */}
      {active === "analytics" && (
        <div className="space-y-6 text-right">
          <div className="grid md:grid-cols-2 gap-6">
            <SectionCard title="🔥 الرحلات الأكثر حجزاً">
              <div className="space-y-3">
                {[...dailyTrips, ...weeklyTrips].sort((a, b) => (b.bookings_count ?? 0) - (a.bookings_count ?? 0)).map((t, idx) => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/40">
                    <div>
                      <div className="font-black text-sm text-foreground">#{idx + 1} - {t.title}</div>
                      <div className="text-xs text-muted-foreground">💰 د.ل {('price_per_seat' in t) ? t.price_per_seat : t.seat_per_price}</div>
                    </div>
                    <Badge tone="green">{t.bookings_count} حجز</Badge>
                  </div>
                ))}
              </div>
            </SectionCard>
            <SectionCard title="⭐ الأعلى تقييماً">
              <div className="space-y-3">
                {[
                  { name: "مغامرة أوباري وبحيرات الصحراء", rate: 4.95, type: "رحلة أسبوعية" },
                  { name: "جولة لبدة الكبرى اليومية", rate: 4.90, type: "رحلة يومية" },
                  { name: "مطعم السراياء التراثي", rate: 4.90, type: "مطعم" },
                  { name: "فندق الفندق الكبير طرابلس", rate: 4.85, type: "فندق 5 نجوم" },
                  { name: "المرشد سالم القذافي", rate: 4.90, type: "مرشد معتمد" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-muted/40">
                    <div>
                      <div className="font-black text-sm text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.type}</div>
                    </div>
                    <div className="text-gold-foreground font-black text-xs">⭐ {item.rate}/5</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
          <SectionCard title="🏨 الفنادق الأكثر حجزاً">
            <div className="grid md:grid-cols-2 gap-4">
              {hotels.map(h => (
                <div key={h.id} className="p-4 rounded-xl border border-border flex justify-between items-center">
                  <div>
                    <h4 className="font-black text-foreground text-sm">{h.name}</h4>
                    <div className="text-xs text-muted-foreground">📍 {h.city} · ⭐ {h.rating_avg}</div>
                  </div>
                  <Badge tone="sea">{h.bookings_count} ليلة</Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      )}

      {/* CHATBOT TAB */}
      {active === "inquiries_chat" && (
        <div className="grid lg:grid-cols-5 gap-6 text-right">
          {/* Left panel */}
          <div className="lg:col-span-2 space-y-4">
            <SectionCard title="محادثات الشات بوت 🤖">
              <div className="space-y-2">
                {chatSessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { setActiveChatId(s.id); setChatSessions(prev => prev.map(x => x.id === s.id ? { ...x, unread: false } : x)); }}
                    className={`w-full text-right p-3 rounded-xl border transition-all ${activeChatId === s.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground text-xs">{s.user_name}</span>
                      <div className="flex items-center gap-1.5">
                        {s.unread && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                        <span className="text-[10px] text-muted-foreground">{s.time}</span>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{s.last_message}</div>
                    <Badge tone={s.user_type === "سائح" ? "sea" : "sun"}>{s.user_type}</Badge>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="الاستفسارات الواردة">
              <div className="space-y-3">
                {tickets.map((tk) => (
                  <div key={tk.id} className="p-3 rounded-xl border border-border bg-white space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-foreground text-xs">{tk.user_name} ({tk.user_role})</span>
                      <Badge tone={tk.status === "جديد" ? "sun" : "green"}>{tk.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">{tk.message}</p>
                    {tk.reply ? (
                      <div className="p-2 rounded-lg bg-primary/10 text-primary text-xs font-bold">💬 {tk.reply}</div>
                    ) : (
                      <div className="flex gap-2">
                        <input id={`reply-${tk.id}`} type="text" placeholder="اكتب رداً..." className="flex-1 h-8 px-2 text-xs rounded-lg border outline-none text-right" />
                        <button onClick={() => { const el = document.getElementById(`reply-${tk.id}`) as HTMLInputElement; if (el?.value) handleReplyTicket(tk.id, el.value); }} className="px-3 h-8 bg-primary text-white rounded-lg text-xs font-black">إرسال</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Chat window */}
          <div className="lg:col-span-3">
            {activeChatId ? (() => {
              const session = chatSessions.find(s => s.id === activeChatId);
              if (!session) return null;
              return (
                <div className="bg-white border border-border rounded-2xl flex flex-col shadow-card overflow-hidden" style={{ height: "640px" }}>
                  {/* Header */}
                  <div className="p-4 bg-gradient-sea text-white flex items-center gap-3 flex-shrink-0">
                    <div className="w-9 h-9 rounded-full bg-white/20 grid place-items-center font-black text-sm">{session.user_name.charAt(0)}</div>
                    <div>
                      <div className="font-black text-sm">{session.user_name}</div>
                      <div className="text-xs text-white/70">{session.user_type}</div>
                    </div>
                    <div className="mr-auto flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs text-white/80">متصل</span>
                    </div>
                  </div>

                  {/* Bot status bar */}
                  <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-black text-emerald-700">🤖 الشات بوت نشط</span>
                    <span className="text-[10px] text-emerald-600">— يرد تلقائياً ويحول المعقد للمشرف</span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 p-4 space-y-3 overflow-y-auto" style={{ background: "rgba(250,248,245,0.5)" }}>
                    {session.messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.from === "user" ? "justify-start" : "justify-end"}`}>
                        <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-xs font-semibold ${
                          msg.from === "user"
                            ? "bg-white border border-border text-foreground rounded-br-sm"
                            : msg.from === "admin"
                            ? "bg-emerald-600 text-white rounded-bl-sm"
                            : "bg-gradient-sea text-white rounded-bl-sm"
                        }`}>
                          {msg.from !== "user" && (
                            <div className="text-[10px] opacity-70 mb-0.5">
                              {msg.from === "admin" ? "👤 مشرف" : "🤖 دلّني بوت"}
                            </div>
                          )}
                          <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                          <div className="text-[10px] opacity-60 mt-1">{msg.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-border flex-shrink-0">
                    <div className="text-[10px] font-black text-muted-foreground mb-1.5">رد المشرف (يظهر كـ Admin Override):</div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={botInput}
                        onChange={e => setBotInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") handleBotSend(); }}
                        placeholder="اكتب رداً..."
                        className="flex-1 h-10 px-3 rounded-xl border border-border text-xs font-semibold outline-none focus:border-primary text-right"
                      />
                      <button onClick={handleBotSend} className="px-4 h-10 bg-gradient-sea text-white rounded-xl text-xs font-black">إرسال 📤</button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {["أهلاً وسهلاً! كيف يمكنني مساعدتك؟", "سيتواصل معك أحد المشرفين قريباً", "يمكنك الحجز من صفحة الرحلات"].map(q => (
                        <button key={q} onClick={() => setBotInput(q)} className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black hover:bg-primary/20 transition">{q}</button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })() : (
              <div className="bg-white border border-border rounded-2xl h-full min-h-80 grid place-items-center text-muted-foreground text-sm">
                اختر محادثة لعرضها
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== MODALS ===== */}
      {showAddCompany && <AddCompanyModal companies={companies} onClose={() => setShowAddCompany(false)} onAdd={handleAddCompany} />}
      {editingCompany && <EditCompanyModal company={editingCompany} onClose={() => setEditingCompany(null)} onUpdate={handleUpdateCompany} />}
      {viewingGuide && <GuideVerificationModal guide={viewingGuide} onClose={() => setViewingGuide(null)} onVerify={handleVerifyGuide} />}
      {showAddTrip && <CreateTripModal type={showAddTrip} guides={guides} vehicles={vehicles} hotels={hotels} restaurants={restaurants} drivers={drivers} onClose={() => setShowAddTrip(null)} onCreate={handleCreateTrip} />}
      {editingDailyTrip && <DailyTripEditModal trip={editingDailyTrip} guides={guides} vehicles={vehicles} hotels={hotels} restaurants={restaurants} drivers={drivers} onClose={() => setEditingDailyTrip(null)} onSave={handleUpdateDailyTrip} />}
      {editingWeeklyTrip && <WeeklyTripEditModal trip={editingWeeklyTrip} guides={guides} vehicles={vehicles} hotels={hotels} restaurants={restaurants} drivers={drivers} onClose={() => setEditingWeeklyTrip(null)} onSave={handleUpdateWeeklyTrip} />}
      {evaluatingPrivateTrip && <EvaluatePrivateTripModal trip={evaluatingPrivateTrip} guides={guides} vehicles={vehicles} onClose={() => setEvaluatingPrivateTrip(null)} onSave={handleSavePrivate} />}
      {showAddHotel && <HotelModal title="إضافة فندق جديد" existingHotels={hotels} onClose={() => setShowAddHotel(false)} onSave={handleAddHotel} />}
      {editingHotel && <HotelModal title={`تعديل: ${editingHotel.name}`} hotel={editingHotel} existingHotels={hotels} onClose={() => setEditingHotel(null)} onSave={handleUpdateHotel} />}
      {showAddRestaurant && <RestaurantModal title="إضافة مطعم/مقهى جديد" existingRestaurants={restaurants} onClose={() => setShowAddRestaurant(false)} onSave={handleAddRestaurant} />}
      {editingRestaurant && <RestaurantModal title={`تعديل: ${editingRestaurant.name}`} restaurant={editingRestaurant} existingRestaurants={restaurants} onClose={() => setEditingRestaurant(null)} onSave={handleUpdateRestaurant} />}
      {showAddAttraction && <AttractionModal title="إضافة معلم سياحي جديد" onClose={() => setShowAddAttraction(false)} onSave={handleAddAttraction} />}
      {editingAttraction && <AttractionModal title={`تعديل: ${editingAttraction.name}`} attraction={editingAttraction} onClose={() => setEditingAttraction(null)} onSave={handleUpdateAttraction} />}
      {showAddDailyOffer && <DailyOfferModal title="إضافة عرض رحلة يومية" dailyTrips={dailyTrips} onClose={() => setShowAddDailyOffer(false)} onSave={handleAddDailyOffer} />}
      {editingDailyOffer && <DailyOfferModal title="تعديل العرض اليومي" offer={editingDailyOffer} dailyTrips={dailyTrips} onClose={() => setEditingDailyOffer(null)} onSave={handleUpdateDailyOffer} />}
      {showAddWeeklyOffer && <WeeklyOfferModal title="إضافة عرض رحلة أسبوعية" weeklyTrips={weeklyTrips} onClose={() => setShowAddWeeklyOffer(false)} onSave={handleAddWeeklyOffer} />}
      {editingWeeklyOffer && <WeeklyOfferModal title="تعديل العرض الأسبوعي" offer={editingWeeklyOffer} weeklyTrips={weeklyTrips} onClose={() => setEditingWeeklyOffer(null)} onSave={handleUpdateWeeklyOffer} />}
      {showAddFacilityOffer && <FacilityOfferModal title="إضافة عرض مطعم/كافيه" restaurants={restaurants} onClose={() => setShowAddFacilityOffer(false)} onSave={handleAddFacilityOffer} />}
      {editingFacilityOffer && <FacilityOfferModal title="تعديل عرض المطعم" offer={editingFacilityOffer} restaurants={restaurants} onClose={() => setEditingFacilityOffer(null)} onSave={handleUpdateFacilityOffer} />}
      {showAddPrivateTrip && <AddPrivateTripModal guides={guides} onClose={() => setShowAddPrivateTrip(false)} onAdd={handleAddPrivateTrip} />}
    </DashboardShell>
  );
}

/* ============ QUICK ACTION ============ */
function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="p-3 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all text-right w-full group">
      <div className="text-xl group-hover:scale-110 transition-transform">{icon}</div>
      <div className="text-[11px] font-black text-foreground mt-1 leading-tight">{label}</div>
    </button>
  );
}

/* ============ VEHICLE MULTI-SELECT FOR ALL PLATFORM COMPANIES ============ */
function VehiclesMultiSelect({ vehicles, selected, onChange }: { vehicles: Vehicle[]; selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (plate: string) =>
    selected.includes(plate) ? onChange(selected.filter(p => p !== plate)) : onChange([...selected, plate]);

  return (
    <div className="text-right">
      <label className="text-xs font-black text-foreground mb-1 block">🚌 تعيين السيارات للرحلة (اختر واحدة أو أكثر من شركات المنصة)</label>
      <p className="text-[11px] text-muted-foreground mb-2">تظهر هنا جميع السيارات والحافلات المسجلة بالمنصة من مختلف الشركات المتعاقدة:</p>
      <div className="space-y-1.5 max-h-52 overflow-y-auto p-1">
        {vehicles.map(v => (
          <button
            key={v.plate_number}
            type="button"
            onClick={() => toggle(v.plate_number)}
            className={`w-full flex items-center justify-between gap-3 p-2.5 rounded-xl border text-right transition-all ${
              selected.includes(v.plate_number) ? "border-primary bg-primary/5 shadow-xs" : "border-border hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-4 h-4 rounded border-2 flex-shrink-0 grid place-items-center text-[9px] font-black transition-all ${
                selected.includes(v.plate_number) ? "bg-primary border-primary text-white" : "border-muted-foreground/30"
              }`}>
                {selected.includes(v.plate_number) && "✓"}
              </div>
              <div className="min-w-0">
                <div className="font-black text-foreground text-xs flex items-center gap-1.5">
                  <span>{v.plate_number}</span>
                  <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold">🏢 {v.company_name}</span>
                </div>
                <div className="text-[10px] text-muted-foreground truncate mt-0.5">{v.vehicle_type} · 👥 سعة {v.capacity} مقعد</div>
              </div>
            </div>
            <span className={`flex-shrink-0 text-[10px] font-black px-2 py-0.5 rounded-full ${
              v.status === "جاهزة" ? "bg-emerald-100 text-emerald-700" : v.status === "في رحلة" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
            }`}>{v.status}</span>
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="mt-2 p-2 bg-primary/8 rounded-xl text-xs font-bold text-primary">
          ✅ السيارات المختارة: {selected.join(" · ")}
        </div>
      )}
    </div>
  );
}

/* ============ MODALS ============ */

function AddPrivateTripModal({ onClose, onAdd, guides }: { onClose: () => void; onAdd: (p: any) => void; guides: Guide[] }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [duration, setDuration] = useState("1");
  const [companions, setCompanions] = useState("1");
  const [guideLicense, setGuideLicense] = useState("");
  const [price, setPrice] = useState("");
  const [plan, setPlan] = useState("");
  const [status, setStatus] = useState("قيد الدراسة");
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) return alert(isAr ? "يرجى إدخال الاسم ورقم الهاتف" : "Please enter name and phone");
    const newTrip = {
      private_trip_id: `PT-${Math.floor(Math.random() * 900) + 100}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_description: description,
      preferred_start_date: startDate,
      duration_days: Number(duration),
      number_of_companions: Number(companions),
      assigned_guide: guideLicense || undefined,
      quoted_price: price ? Number(price) : undefined,
      admin_itinerary_plan: plan || undefined,
      status_order: status,
    };
    onAdd(newTrip);
    onClose();
  };
  return (
    <ModalShell title={isAr ? "إضافة رحلة خاصة" : "Add Private Trip"} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={handleSubmit}>
        <Field label={isAr ? "اسم العميل" : "Customer Name"} value={customerName} onChange={setCustomerName} />
        <LibyanPhoneField label={isAr ? "هاتف العميل" : "Customer Phone"} value={customerPhone} onChange={setCustomerPhone} />
        <Field label={isAr ? "وصف الطلب" : "Description"} value={description} onChange={setDescription} />
        <Field label={isAr ? "تاريخ البدء" : "Start Date"} type="date" value={startDate} onChange={setStartDate} />
        <Field label={isAr ? "عدد أيام الرحلة" : "Duration (days)"} type="number" value={duration} onChange={v => setDuration(v)} />
        <Field label={isAr ? "عدد المصاحبين" : "Companions"} type="number" value={companions} onChange={v => setCompanions(v)} />
        {/* Guide selection */}
        <select
          value={guideLicense}
          onChange={e => setGuideLicense(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right"
        >
          <option value="">{isAr ? "اختر مرشدًا" : "Select Guide"}</option>
          {guides.map(g => (
            <option key={g.license_number} value={g.license_number}>
              {g.full_name} ({g.license_number})
            </option>
          ))}
        </select>
        <Field label={isAr ? "السعر المقترح" : "Proposed Price"} type="number" value={price} onChange={v => setPrice(v)} />
        <Field label={isAr ? "خطة الترتيب" : "Itinerary Plan"} value={plan} onChange={setPlan} />
        <select
          value={status}
          onChange={e => setStatus(e.target.value as any)}
          className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right"
        >
          <option value="قيد الدراسة">{isAr ? "قيد الدراسة" : "Under Review"}</option>
          <option value="مؤكدة">{isAr ? "مؤكدة" : "Confirmed"}</option>
          <option value="مرفوضة من الأدمن">{isAr ? "مرفوضة من الأدمن" : "Rejected by Admin"}</option>
          <option value="ملغية">{isAr ? "ملغية" : "Cancelled"}</option>
        </select>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">
            {isAr ? "حفظ الرحلة" : "Save Trip"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function LocationMapPickerModal({
  initialCity = "طرابلس",
  currentUrl = "",
  onSelect,
  onClose,
}: {
  initialCity?: string;
  currentUrl?: string;
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const defaultCoords = initialCity === "بنغازي" 
    ? { lat: 32.1194, lng: 20.0868 } 
    : { lat: 32.8872, lng: 13.1913 };
    
  let initLat = defaultCoords.lat;
  let initLng = defaultCoords.lng;
  if (currentUrl) {
    const match = currentUrl.match(/q=([0-9.-]+),([0-9.-]+)/) || currentUrl.match(/@([0-9.-]+),([0-9.-]+)/);
    if (match) {
      initLat = parseFloat(match[1]);
      initLng = parseFloat(match[2]);
    }
  }

  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>({ lat: initLat, lng: initLng });
  const [manualInput, setManualInput] = useState(currentUrl);

  useEffect(() => {
    const handleMsg = (e: MessageEvent) => {
      if (e.data && e.data.type === "DELNI_MAP_PICK") {
        const lat = Number(e.data.lat);
        const lng = Number(e.data.lng);
        if (!isNaN(lat) && !isNaN(lng)) {
          setSelectedCoords({ lat, lng });
          setManualInput(`https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`);
        }
      }
    };
    window.addEventListener("message", handleMsg);
    return () => window.removeEventListener("message", handleMsg);
  }, []);

  const generatedUrl = `https://maps.google.com/?q=${selectedCoords.lat.toFixed(6)},${selectedCoords.lng.toFixed(6)}`;

  const mapHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; font-family: sans-serif; }</style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map').setView([${initLat}, ${initLng}], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
    var marker = L.marker([${initLat}, ${initLng}], { draggable: true }).addTo(map);
    marker.bindPopup("مقر شركة النقل").openPopup();
    function send(lat, lng) {
      window.parent.postMessage({ type: 'DELNI_MAP_PICK', lat: lat, lng: lng }, '*');
    }
    map.on('click', function(e) {
      marker.setLatLng(e.latlng);
      send(e.latlng.lat, e.latlng.lng);
    });
    marker.on('dragend', function(e) {
      var p = e.target.getLatLng();
      send(p.lat, p.lng);
    });
  </script>
</body>
</html>`;

  return (
    <ModalShell title={`🗺️ تحديد مقر الشركة على الخريطة (${initialCity})`} onClose={onClose}>
      <div className="space-y-3 text-right">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 leading-relaxed font-semibold">
          📍 انقر في أي مكان داخل الخريطة أو اسحب العلامة لتحديد المقر بدقة، وسيتولد الرابط تلقائياً.
        </div>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(initialCity + ' ليبيا')}`}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 cursor-pointer"
          >
            ↗️ فتح خرائط Google في نافذة جديدة
          </a>
          <span className="text-[11px] font-mono text-muted-foreground font-bold">
            الإحداثيات: {selectedCoords.lat.toFixed(5)}, {selectedCoords.lng.toFixed(5)}
          </span>
        </div>

        <div className="w-full h-72 rounded-xl overflow-hidden border border-border shadow-inner relative bg-slate-100">
          <iframe
            title="Interactive Map Picker"
            srcDoc={mapHtml}
            className="w-full h-full border-0"
          />
        </div>

        <div>
          <label className="text-xs font-bold block mb-1">رابط خرائط Google المعتمد:</label>
          <input
            type="text"
            value={manualInput || generatedUrl}
            onChange={(e) => setManualInput(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border text-xs font-mono text-left bg-slate-50 focus:bg-white outline-none"
            placeholder="https://maps.google.com/?q=..."
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 rounded-xl border font-black text-xs hover:bg-slate-50 transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => {
              onSelect(manualInput.trim() || generatedUrl);
              onClose();
            }}
            className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow hover:opacity-95 transition cursor-pointer"
          >
            ✓ اعتماد وتثبيت هذا الموقع
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

function AddCompanyModal({ companies = [], onClose, onAdd }: { companies?: Company[]; onClose: () => void; onAdd: (c: any) => void }) {
  const [contractNo, setContractNo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("طرابلس");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [vehiclesCount, setVehiclesCount] = useState<number | string>(5);
  const [contractEndDate, setContractEndDate] = useState("");
  const [companyStatus, setCompanyStatus] = useState("موثق");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanContract = contractNo.trim();
    if (!cleanContract) {
      setErrorMsg("يرجى إدخال رقم العقد المطابق للعقد الورقي (حقل إلزامي).");
      return;
    }
    if (!/^\d+$/.test(cleanContract)) {
      setErrorMsg("رقم عقد شركة النقل يجب أن يتكون من أرقام فقط.");
      return;
    }
    if (companies.some(c => c.contract_number === cleanContract)) {
      setErrorMsg("رقم عقد شركة النقل هذا مسجل مسبقاً لشركة أخرى في المنصة.");
      return;
    }

    if (!name.trim()) {
      setErrorMsg("يرجى إدخال اسم شركة النقل السياحي (حقل إلزامي).");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("يرجى إدخال رقم هاتف الشركة (حقل إلزامي).");
      return;
    }
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (cleanPhone.length < 9) {
      setErrorMsg("رقم الهاتف غير مكتمل، يرجى إدخال رقم هاتف ليبي صحيح لا يقل عن 9 أرقام.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("يرجى تحديد موقع مقر شركة النقل على خرائط Google Maps (حقل إلزامي).");
      return;
    }
    const cleanAddress = address.trim();
    if (!cleanAddress.startsWith("http://") && !cleanAddress.startsWith("https://") && !cleanAddress.includes("maps.app.goo.gl") && !cleanAddress.includes("google.com/maps") && !cleanAddress.includes("maps.google.com")) {
      setErrorMsg("يرجى إدخال أو تحديد رابط خرائط Google Maps صحيح لمقر الشركة.");
      return;
    }
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setErrorMsg("يرجى إدخال بريد إلكتروني رسمي وصحيح للشركة (مثال: info@company.ly).");
      return;
    }
    if (!pass.trim() || pass.trim().length < 6) {
      setErrorMsg("كلمة المرور مطلوبة ويجب ألا تقل عن 6 خانات لتأمين حساب الشركة.");
      return;
    }
    const totalV = Number(vehiclesCount);
    if (isNaN(totalV) || totalV <= 0) {
      setErrorMsg("إجمالي عدد مركبات الأسطول يجب أن يكون رقماً صحيحاً أكبر من الصفر.");
      return;
    }
    if (!contractEndDate.trim()) {
      setErrorMsg("يرجى تحديد تاريخ انتهاء التعاقد المعتمد.");
      return;
    }

    onAdd({
      contract_number: cleanContract,
      name: name.trim(),
      company_name: name.trim(),
      phone: phone.trim(),
      phone_number: phone.trim(),
      city: city.trim(),
      address: cleanAddress,
      google_maps_url: cleanAddress,
      email: email.trim(),
      pass: pass.trim(),
      password: pass.trim(),
      total_vehicles: totalV,
      available_cars: totalV,
contract_start_date: new Date().toISOString().split("T")[0],
      contract_end_date: contractEndDate.trim(),
      status: companyStatus,
      verification_status: companyStatus,
    });
  };

  return (
    <>
      <ModalShell title="إضافة شركة نقل سياحي جديدة (كافة الحقول إلزامية)" onClose={onClose} maxWidth="max-w-3xl">
        <form className="space-y-4 text-right" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2.5 animate-in fade-in">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. البيانات الأساسية والعقد */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>🏢</span>
              <span>بيانات الشركة والتعاقد الرسمي</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">
                  رقم العقد الورقي (أرقام فقط) *
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={contractNo}
                  onChange={(e) => setContractNo(e.target.value.replace(/\D/g, ""))}
                  placeholder="أرقام فقط (مثال: 123445)"
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-right focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none text-xs font-semibold shadow-xs"
                />
              </div>

              <Field label="اسم شركة النقل السياحي *" value={name} onChange={setName} placeholder="شركة السهم الذهبي للنقل" required />

              <LibyanPhoneField label="رقم هاتف الشركة *" value={phone} onChange={setPhone} />

              <div>
                <label className="text-xs font-bold text-slate-800 mb-1.5 block">المدينة المعتمدة *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-right bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none shadow-xs"
                >
                  <option value="طرابلس">طرابلس</option>
                  <option value="بنغازي">بنغازي</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. الموقع الجغرافي وحساب الدخول */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📍</span>
              <span>الموقع الجغرافي وبيانات الحساب</span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-slate-800">موقع مقر الشركة (خرائط Google Maps) *</label>
                <button
                  type="button"
                  onClick={() => setShowMapPicker(true)}
                  className="text-xs font-bold text-[#003580] hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition shadow-xs"
                >
                  🗺️ تحديد دقيق من الخريطة
                </button>
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="https://maps.google.com/?q=... أو اختر من الخريطة مباشرة"
                required
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-right focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none text-xs font-semibold shadow-xs"
              />
              <div className="flex justify-between items-center mt-1.5">
                {address && (address.startsWith("http") || address.includes("maps")) ? (
                  <a
                    href={address.startsWith("http") ? address : `https://${address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                  >
                    📍 معاينة رابط المقر في Google Maps ↗
                  </a>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">
                    انقر "تحديد دقيق من الخريطة" لتحديد مقر الشركة بدقة
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
              <Field label="البريد الإلكتروني للشركة *" type="email" value={email} onChange={setEmail} placeholder="transport@company.ly" required />
              <Field label="كلمة المرور للدخول *" type="password" value={pass} onChange={setPass} placeholder="6 خانات على الأقل" required />
            </div>
          </div>

          {/* 3. سعة الأسطول والتعاقد */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📊</span>
              <span>سعة الأسطول وصلاحية التعاقد</span>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200/90 text-right space-y-1">
              <p className="text-[11px] text-blue-900 font-bold flex items-center gap-1.5">
                <span>💡</span>
                <span><b>عدد مركبات الأسطول:</b> إجمالي عدد المركبات المعتمدة رسمياً في العقد (تكون جميعها متاحة للتشغيل).</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Field label="عدد مركبات الأسطول المعتمدة في العقد *" type="number" value={String(vehiclesCount)} onChange={v => setVehiclesCount(v)} required />
              <Field label="تاريخ انتهاء التعاقد *" type="date" value={contractEndDate} onChange={setContractEndDate} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">حالة التوثيق والتشغيل *</label>
              <select
                value={companyStatus}
                onChange={e => setCompanyStatus(e.target.value as any)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-right bg-white focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/15 outline-none shadow-xs"
              >
                <option value="موثق">موثق (نشط يظهر للعلن ويعرض سياراته)</option>
                <option value="بانتظار">بانتظار المراجعة (معلق لا يظهر)</option>
                <option value="مرفوض">مرفوض / غير نشط (يختفي من المنصة)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl border border-slate-200 font-black text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 h-11 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>حفظ واعتماد الشركة في المنظومة</span>
              <span>✓</span>
            </button>
          </div>
        </form>
      </ModalShell>

      {showMapPicker && (
        <LocationMapPickerModal
          initialCity={city}
          currentUrl={address}
          onSelect={(url) => setAddress(url)}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </>
  );
}

function EditCompanyModal({ company, onClose, onUpdate }: { company: Company; onClose: () => void; onUpdate: (c: Company) => void }) {
  const [contractNo, setContractNo] = useState(company.contract_number || "");
  const [name, setName] = useState(company.company_name || company.name || "");
  const [phone, setPhone] = useState(company.phone_number || company.phone || "");
  const [city, setCity] = useState(company.city === "بنغازي" ? "بنغازي" : "طرابلس");
  const [address, setAddress] = useState(company.google_maps_url || company.address || "");
  const [email, setEmail] = useState(company.email || "");
  const [vehiclesCount, setVehiclesCount] = useState<number | string>(company.total_vehicles ?? 5);
  const [contractStartDate, setContractStartDate] = useState(company.contract_start_date || "2026-01-01");
  const [contractEndDate, setContractEndDate] = useState(company.contract_end_date || "2028-01-01");
  const [status, setStatus] = useState(company.verification_status || company.status || "موثق");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!name.trim()) {
      setErrorMsg("يرجى إدخال اسم شركة النقل.");
      return;
    }
    if (!phone.trim()) {
      setErrorMsg("يرجى إدخال رقم هاتف الشركة.");
      return;
    }
    const cleanPhone = phone.replace(/[\s-]/g, "");
    if (cleanPhone.length < 9) {
      setErrorMsg("رقم الهاتف غير مكتمل، يرجى إدخال رقم هاتف ليبي صحيح.");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("يرجى تحديد رابط موقع مقر شركة النقل على خرائط Google Maps.");
      return;
    }
    const cleanAddress = address.trim();
    if (!cleanAddress.startsWith("http://") && !cleanAddress.startsWith("https://") && !cleanAddress.includes("maps.app.goo.gl") && !cleanAddress.includes("google.com/maps") && !cleanAddress.includes("maps.google.com")) {
      setErrorMsg("يرجى إدخال رابط Google Maps صالح لمقر الشركة.");
      return;
    }
    const totalV = Number(vehiclesCount);
    if (isNaN(totalV) || totalV <= 0) {
      setErrorMsg("إجمالي عدد مركبات الأسطول يجب أن يكون رقماً صحيحاً أكبر من الصفر.");
      return;
    }

    onUpdate({
      ...company,
      contract_number: contractNo.trim(),
      company_name: name.trim(),
      name: name.trim(),
      phone_number: phone.trim(),
      phone: phone.trim(),
      city: city.trim(),
      address: cleanAddress,
      google_maps_url: cleanAddress,
      email: email.trim(),
      total_vehicles: totalV,
available_cars: totalV,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
      verification_status: status,
      status: status,
    });
  };

  return (
    <>
      <ModalShell title={`تعديل بيانات شركة: ${company.company_name || company.name || ""}`} onClose={onClose} maxWidth="max-w-3xl">
        <form className="space-y-4 text-right" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2.5 animate-in fade-in">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1. البيانات الأساسية */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>🏢</span>
              <span>بيانات الشركة والتعاقد الرسمي</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Field label="رقم العقد الورقي (المعرف) *" value={contractNo} onChange={setContractNo} required />
              <Field label="اسم شركة النقل السياحي *" value={name} onChange={setName} required />
              <LibyanPhoneField label="رقم هاتف الشركة *" value={phone} onChange={setPhone} />
              <Field label="البريد الإلكتروني للشركة" type="email" value={email} onChange={setEmail} placeholder="company@dalni.ly" />
            </div>
          </div>

          {/* 2. المقر والمدينة */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📍</span>
              <span>المقر والمدينة المعتمدة</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">المدينة المعتمدة *</label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-right bg-white focus:border-[#003580] outline-none shadow-xs"
                >
                  <option value="طرابلس">طرابلس</option>
                  <option value="بنغازي">بنغازي</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-slate-800">موقع المقر (خرائط Google Maps) *</label>
                  <button
                    type="button"
                    onClick={() => setShowMapPicker(true)}
                    className="text-xs font-bold text-[#003580] hover:bg-blue-100 flex items-center gap-1.5 cursor-pointer bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition shadow-xs"
                  >
                    🗺️ تحديد دقيق من الخريطة
                  </button>
                </div>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="https://maps.google.com/?q=..."
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-right focus:border-[#003580] outline-none text-xs font-semibold shadow-xs"
                />
                <div className="flex justify-between items-center mt-1.5">
                  {address && (address.startsWith("http") || address.includes("maps")) && (
                    <a
                      href={address.startsWith("http") ? address : `https://${address}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1"
                    >
                      📍 معاينة رابط المقر في Google Maps ↗
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. الأسطول والتعاقد */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📊</span>
              <span>سعة الأسطول وحالة التوثيق والتشغيل</span>
            </div>
            <div>
              <Field label="عدد مركبات الأسطول المعتمدة في العقد *" type="number" value={String(vehiclesCount)} onChange={v => setVehiclesCount(v)} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Field label="تاريخ بدء التعاقد" type="date" value={contractStartDate} onChange={setContractStartDate} />
              <Field label="تاريخ انتهاء التعاقد" type="date" value={contractEndDate} onChange={setContractEndDate} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 mb-1.5 block">حالة التوثيق والتشغيل *</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-bold text-right bg-white focus:border-[#003580] outline-none shadow-xs"
              >
                <option value="موثق">موثق (نشط يظهر للعلن ويعرض سياراته)</option>
                <option value="بانتظار">بانتظار المراجعة (معلق لا يظهر)</option>
                <option value="مرفوض">مرفوض / غير نشط (يختفي من المنصة)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-11 rounded-xl border border-slate-200 font-black text-xs text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 h-11 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>حفظ وتحديث في قاعدة البيانات</span>
              <span>✓</span>
            </button>
          </div>
        </form>
      </ModalShell>

      {showMapPicker && (
        <LocationMapPickerModal
          initialCity={city}
          currentUrl={address}
          onSelect={(url) => setAddress(url)}
          onClose={() => setShowMapPicker(false)}
        />
      )}
    </>
  );
}

function GuideVerificationModal({
  guide,
  onClose,
  onVerify,
}: {
  guide: Guide;
  onClose: () => void;
  onVerify: (lic: string, status: "موثق" | "مرفوض") => void;
}) {
  const isImage =
    guide.digital_certificate_file?.startsWith("data:image/") ||
    /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(guide.digital_certificate_file || "");
  const isPdf =
    guide.digital_certificate_file?.startsWith("data:application/pdf") ||
    /\.pdf$/i.test(guide.digital_certificate_file || "");

  const handleOpenInNewTab = () => {
    if (!guide.digital_certificate_file) return;
    try {
      if (guide.digital_certificate_file.startsWith("data:")) {
        const parts = guide.digital_certificate_file.split(",");
        const mime = parts[0].match(/:(.*?);/)?.[1] || (isPdf ? "application/pdf" : "image/jpeg");
        const byteCharacters = atob(parts[1]);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
      } else {
        window.open(guide.digital_certificate_file, "_blank");
      }
    } catch {
      window.open(guide.digital_certificate_file, "_blank");
    }
  };

  return (
    <ModalShell
      title={`فحص ومراجعة وثائق المرشد: ${guide.full_name}`}
      onClose={onClose}
      maxWidth="max-w-2xl sm:max-w-3xl"
    >
      <div className="space-y-4 text-right">
        {/* Guide Information Summary Card */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-border text-xs space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-2">
            <div>
              <span className="font-bold text-muted-foreground">اسم المرشد: </span>
              <span className="font-black text-foreground text-sm">{guide.full_name}</span>
            </div>
            <div>
              <span className="font-bold text-muted-foreground">رقم الترخيص: </span>
              <span className="font-black text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                {guide.license_number}
              </span>
            </div>
            <div>
              <span className="font-bold text-muted-foreground">الحالة الحالية: </span>
              <Badge tone={guide.verification_status === "موثق" ? "green" : guide.verification_status === "مرفوض" ? "red" : "sun"}>
                {guide.verification_status || "بانتظار التوثيق"}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-muted-foreground">
            {guide.email && (
              <div>
                <b>البريد الإلكتروني:</b> <span className="text-foreground font-bold">{guide.email}</span>
              </div>
            )}
            <div>
              <b>رقم الهاتف:</b> <span className="text-foreground font-bold">{guide.phone_number}</span>
            </div>
            <div>
              <b>سنوات الخبرة:</b> <span className="text-foreground font-bold">{guide.years_of_experience} سنوات</span>
            </div>
            <div>
              <b>السعر اليومي المقترح:</b>{" "}
              <span className="text-emerald-700 font-bold">{guide.daily_rate || guide.price_per_day || 150} د.ل / اليوم</span>
            </div>
          </div>
          {guide.bio && (
            <div className="pt-1 text-muted-foreground border-t border-border/40">
              <b>نبذة عن المرشد:</b> {guide.bio}
            </div>
          )}
        </div>

        {/* Uploaded Document Review Section */}
        <div className="p-4 rounded-2xl bg-white border border-border shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-foreground flex items-center gap-2">
              <span>📄</span>
              <span>الملف والوثيقة المرفوعة من المرشد:</span>
            </h4>
            {guide.digital_certificate_file && (
              <button
                type="button"
                onClick={handleOpenInNewTab}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>فتح الملف بالحجم الكامل في نافذة جديدة</span>
                <span>↗</span>
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground bg-muted/30 px-3 py-2 rounded-xl">
            <b>اسم المستند المرفق:</b> {guide.certificate || "وثيقة ترخيص"}
          </div>

          {/* Actual File Display */}
          {guide.digital_certificate_file ? (
            <div className="rounded-xl border border-border overflow-hidden bg-slate-900/5">
              {isImage ? (
                /* Display Uploaded Image */
                <div className="p-3 flex flex-col items-center justify-center gap-2 bg-slate-100/50">
                  <img
                    src={guide.digital_certificate_file}
                    alt="وثيقة المرشد المرفوعة"
                    className="max-h-[420px] w-auto max-w-full rounded-lg object-contain shadow-md border bg-white"
                  />
                  <div className="text-[11px] text-muted-foreground font-medium pt-1">
                    صورة المستند المرفقة من قبل المرشد (جاهزة للمراجعة)
                  </div>
                </div>
              ) : isPdf ? (
                /* Display Uploaded PDF */
                <div className="flex flex-col">
                  <iframe
                    src={guide.digital_certificate_file}
                    title="معاينة ملف PDF المرفوع"
                    className="w-full h-[400px] border-0 bg-white"
                  />
                  <div className="p-2.5 bg-slate-100 border-t border-border flex justify-between items-center text-xs">
                    <span className="font-bold text-foreground">ملف PDF مرفق من المرشد</span>
                    <button
                      type="button"
                      onClick={handleOpenInNewTab}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition text-xs"
                    >
                      تكبير وقراءة الـ PDF ↗
                    </button>
                  </div>
                </div>
              ) : (
                /* Fallback generic document link */
                <div className="p-6 text-center space-y-2">
                  <div className="text-3xl">📎</div>
                  <div className="font-bold text-sm text-foreground">مستند مرفق بصيغة رقمية</div>
                  <button
                    type="button"
                    onClick={handleOpenInNewTab}
                    className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-xs"
                  >
                    عرض وتحميل المستند المرفق ↗
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* No file uploaded notice */
            <div className="p-5 rounded-2xl border-2 border-dashed border-amber-300 bg-amber-50/60 text-center space-y-2">
              <div className="text-2xl">⚠️</div>
              <div className="font-black text-amber-900 text-xs">
                لم يقم هذا المرشد برفع ملف رقمي أثناء التسجيل
              </div>
              <p className="text-[11px] text-amber-800 max-w-md mx-auto">
                قام المرشد بالتسجيل برقم الرخصة ({guide.license_number}) فقط دون إرفاق صورة أو مستند PDF من جهازه.
              </p>
            </div>
          )}
        </div>

        {/* Admin Instructions and Actions */}
        <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-200/60 text-xs text-blue-950 space-y-1">
          <div className="font-black flex items-center gap-1.5">
            <span>💡</span>
            <span>ماذا تفعل كمسؤول للمنصة (أدمن)؟</span>
          </div>
          <p className="text-[11px] leading-relaxed text-blue-900">
            راجع الوثيقة المرفوعة وتأكد من صحة رقم الترخيص والاسم. عند الضغط على <b>[قبول واعتماد المرشد]</b>، يتغير حسابه إلى 'موثق' فوراً ويصبح معتمداً ومتاحاً في قائمة المرشدين العامة. عند الضغط على <b>[رفض الطلب]</b>، يُرفض الحساب.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 justify-end pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="px-4 h-10 border border-border bg-white text-muted-foreground hover:bg-muted rounded-xl font-bold text-xs transition cursor-pointer"
          >
            إلغاء وإغلاق
          </button>
          <button
            type="button"
            onClick={() => onVerify(guide.license_number, "مرفوض")}
            className="px-5 h-10 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-black text-xs transition cursor-pointer"
          >
            ❌ رفض الطلب
          </button>
          <button
            type="button"
            onClick={() => onVerify(guide.license_number, "موثق")}
            className="px-6 h-10 bg-gradient-sea text-white hover:opacity-95 rounded-xl font-black text-xs shadow-glow transition cursor-pointer"
          >
            ✅ قبول واعتماد المرشد
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

/* =========================================================================
   TRIP COMPONENTS: ITINERARY, VEHICLE FLEET & RESTAURANT SELECTORS
   ========================================================================= */

interface ItineraryStepItem {
  time: string;
  title: string;
  desc: string;
}

const DEFAULT_DAILY_ITINERARY_STEPS: ItineraryStepItem[] = [
  {
    time: "09:00 ص",
    title: "نقطة التجمع والانطلاق من موقعنا",
    desc: "التجمع في موقعنا في طرابلس - النوفليين والصعود للمركبة السياحية المجهزة والانطلاق في تمام 09:00 صباحاً.",
  },
  {
    time: "10:30 ص",
    title: "الجولة الميدانية الأولى واستكشاف المعالم الأثرية",
    desc: "استكشاف المعالم الرئيسية رفقة المرشد السياحي المعتمد مع شرح تاريخي موثق.",
  },
  {
    time: "01:30 م",
    title: "استراحة وتناول وجبة الغداء التراثية المشمولة",
    desc: "تناول وجبة غداء ليبية تقليدية كاملة (أطباق رئيسية، سلطات طازجة، عصائر، ومياه معدنية) في مطعم تراثي معتمد مشمول بالرحلة.",
  },
  {
    time: "04:30 م",
    title: "جولة المعالم الترفيهية والطبيعية / حديقة الحيوان",
    desc: "زيارة حديقة الحيوان أو المعالم الطبيعية والساحلية، وأخذ صور تذكارية في أجواء مريحة وممتعة.",
  },
  {
    time: "07:00 م",
    title: "استراحة ضيافة وتذوق ووقت حر للتسوق",
    desc: "استراحة ضيافة وتذوق حلويات تقليدية، مع وقت مخصص لشراء التذكارات والصناعات اليدوية.",
  },
  {
    time: "09:00 م",
    title: "العودة وختام الرحلة في نقطة الانطلاق",
    desc: "العودة بسلامة الله بالمركبة السياحية إلى موقعنا في طرابلس - النوفليين في تمام الساعة 09:00 مساءً.",
  },
];

function TripItineraryTimelineEditor({
  steps,
  onChange,
  selectedRestaurant,
}: {
  steps: ItineraryStepItem[];
  onChange: (steps: ItineraryStepItem[]) => void;
  selectedRestaurant?: Restaurant | null;
}) {
  const [isEditing, setIsEditing] = useState(false);

  const handleStepChange = (index: number, field: keyof ItineraryStepItem, val: string) => {
    const next = [...steps];
    next[index] = { ...next[index], [field]: val };
    onChange(next);
  };

  const handleAddStep = () => {
    const nextNum = steps.length + 1;
    const newStep: ItineraryStepItem = {
      title: `المحطة ${nextNum} - وجهة استكشاف جديدة`,
      time: "02:00 م",
      desc: "تفاصيل وبرنامج الزيارة لهذه المحطة السياحية...",
    };
    onChange([...steps, newStep]);
    setIsEditing(true);
  };

  const handleDeleteStep = (index: number) => {
    if (steps.length <= 1) {
      alert("يجب الإبقاء على محطة واحدة على الأقل في خط سير الرحلة.");
      return;
    }
    const next = steps.filter((_, idx) => idx !== index);
    onChange(next);
  };

  const handleResetDefaults = () => {
    onChange(DEFAULT_DAILY_ITINERARY_STEPS);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D6] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#003580] flex items-center gap-2">
            <span>⏱️</span>
            <span>محطات وخط سير الرحلة خطوة بخطوة</span>
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            إمكانية إضافة محطات أو حذف محطات وتعديل المواعيد والشرح بدقة ({steps.length} محطات حالية)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddStep}
            className="px-3 py-1.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>➕</span>
            <span>إضافة محطة</span>
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
            >
              استعادة الافتراضي
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 text-xs font-black rounded-xl border transition cursor-pointer flex items-center gap-1.5 ${
              isEditing ? "bg-blue-600 text-white border-blue-700" : "bg-white text-[#003580] border-blue-200 hover:bg-blue-50"
            }`}
          >
            <span>{isEditing ? "✓ تم التعديل" : "✏️ تخصيص وتعديل المحطات"}</span>
          </button>
        </div>
      </div>

      {/* Steps List */}
      <div className="space-y-3.5 relative before:absolute before:inset-0 before:left-auto before:right-3.5 before:w-0.5 before:bg-[#E8E2D6] pt-1">
        {steps.map((step, idx) => {
          const isLunchStep = idx === 2;
          const displayDesc = isLunchStep && selectedRestaurant
            ? `تناول وجبة غداء ليبية تقليدية كاملة في (${selectedRestaurant.name} - ${selectedRestaurant.type || 'مطعم معتمد'}) بمدينة ${selectedRestaurant.city || 'طرابلس'} مشمول بالرحلة.`
            : step.desc;

          return (
            <div key={idx} className="relative flex items-start gap-3.5 pr-8">
              <div className="absolute right-1 top-2 w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-black shadow-xs ring-4 ring-white">
                {idx + 1}
              </div>

              <div className="bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E8E2D6] flex-1">
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-black text-slate-700">المحطة رقم {idx + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteStep(idx)}
                        className="px-2 py-0.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 text-[10px] font-black transition cursor-pointer flex items-center gap-1"
                        title="حذف هذه المحطة من خط السير"
                      >
                        <span>🗑️</span>
                        <span>حذف المحطة</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">عنوان المحطة {idx + 1}</label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-bold text-right bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">التوقيت</label>
                        <input
                          type="text"
                          value={step.time}
                          onChange={(e) => handleStepChange(idx, "time", e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold text-right bg-white"
                          placeholder="09:00 ص"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-0.5">شرح وتفاصيل المحطة</label>
                      <textarea
                        value={step.desc}
                        onChange={(e) => handleStepChange(idx, "desc", e.target.value)}
                        rows={2}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs text-right bg-white"
                      />
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-xs sm:text-sm text-[#0F172A]">{step.title}</h4>
                        <button
                          type="button"
                          onClick={() => handleDeleteStep(idx)}
                          className="text-red-400 hover:text-red-600 text-xs px-1"
                          title="حذف المحطة"
                        >
                          ✕
                        </button>
                      </div>
                      <span className="text-[11px] font-black text-[#003580] bg-white px-2 py-0.5 rounded-md border border-blue-100 shadow-xs">
                        {step.time}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {displayDesc}
                    </p>
                    {isLunchStep && selectedRestaurant && (
                      <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/70 border border-amber-300 text-amber-900 rounded-lg text-[10px] font-black">
                        <span>🍽️ المطعم المعتمد:</span>
                        <span>{selectedRestaurant.name} ({selectedRestaurant.city})</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TripVehicleAndDriverSelector({
  vehicles,
  drivers,
  busCapacity,
  onCapacityChange,
  selectedPlate,
  onSelectPlate,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
  busCapacity: 15 | 25 | 50;
  onCapacityChange: (cap: 15 | 25 | 50) => void;
  selectedPlate: string;
  onSelectPlate: (plate: string) => void;
}) {
  const matchingVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const cap = Number(v.seating_capacity || (v as any).capacity || 0);
      if (busCapacity === 15) return cap <= 18;
      if (busCapacity === 25) return cap > 18 && cap <= 30;
      if (busCapacity === 50) return cap > 30;
      return true;
    });
  }, [vehicles, busCapacity]);

  const vehiclesToDisplay = matchingVehicles.length > 0 ? matchingVehicles : vehicles;

  return (
    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-black text-emerald-950 text-sm flex items-center gap-1.5">
          <span>🚌</span>
          <span>تحديد سعة الحافلة وفلترة المركبات والسائقين</span>
        </div>
        <span className="px-3 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black">
          السعة المختارة: {busCapacity} راكب
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          type="button"
          onClick={() => onCapacityChange(15)}
          className={`p-3 rounded-2xl border-2 cursor-pointer transition text-right flex items-center gap-2.5 ${
            busCapacity === 15
              ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white/60 border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="text-2xl">🚐</div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-xs text-slate-900">15 راكب</div>
            <div className="text-[10px] text-slate-500 font-bold truncate">فان سياحي مجهز (تويوتا/مرسيدس)</div>
          </div>
          {busCapacity === 15 && <span className="text-emerald-600 text-sm font-black">✓</span>}
        </button>

        <button
          type="button"
          onClick={() => onCapacityChange(25)}
          className={`p-3 rounded-2xl border-2 cursor-pointer transition text-right flex items-center gap-2.5 ${
            busCapacity === 25
              ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white/60 border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="text-2xl">🚌</div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-xs text-slate-900">25 راكب</div>
            <div className="text-[10px] text-slate-500 font-bold truncate">ميني باص سياحي (كوستر فاخر)</div>
          </div>
          {busCapacity === 25 && <span className="text-emerald-600 text-sm font-black">✓</span>}
        </button>

        <button
          type="button"
          onClick={() => onCapacityChange(50)}
          className={`p-3 rounded-2xl border-2 cursor-pointer transition text-right flex items-center gap-2.5 ${
            busCapacity === 50
              ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
              : "bg-white/60 border-slate-200 hover:border-emerald-300"
          }`}
        >
          <div className="text-2xl">🚍</div>
          <div className="min-w-0 flex-1">
            <div className="font-black text-xs text-slate-900">50 راكب</div>
            <div className="text-[10px] text-slate-500 font-bold truncate">حافلة سياحية كبرى VIP</div>
          </div>
          {busCapacity === 50 && <span className="text-emerald-600 text-sm font-black">✓</span>}
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-emerald-100">
        <label className="text-xs font-bold text-slate-700 block">
          المركبات المتاحة في قاعدة البيانات بسعة {busCapacity} راكب مع السائق المسند:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {vehiclesToDisplay.map((v) => {
            const isSelected = selectedPlate === v.plate_number;
            const assignedDriver = drivers.find((d) => d.assigned_vehicle_plate === v.plate_number);
            const cap = v.seating_capacity || (v as any).capacity || busCapacity;

            return (
              <div
                key={v.plate_number}
                onClick={() => onSelectPlate(v.plate_number)}
                className={`p-3 rounded-xl border-2 cursor-pointer transition text-right flex items-start gap-2.5 ${
                  isSelected
                    ? "bg-emerald-50/80 border-emerald-600 shadow-sm ring-1 ring-emerald-500"
                    : "bg-white border-slate-200 hover:border-emerald-300"
                }`}
              >
                <div className="text-xl mt-0.5">
                  {cap > 30 ? "🚍" : cap > 18 ? "🚌" : "🚐"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-black text-xs text-slate-900 truncate">
                      {v.vehicle_type || "مركبة سياحية"}
                    </span>
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {cap} راكب
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold">
                    لوحة: <span className="text-slate-800 font-black">{v.plate_number}</span> | {v.company_name || "شركة النقل"}
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-100 text-[10px] flex items-center justify-between">
                    <span className="text-emerald-900 font-black truncate">
                      👨‍✈️ {assignedDriver ? assignedDriver.full_name : "سائق معتمد من الشركة"}
                    </span>
                    {assignedDriver?.phone_number && (
                      <span className="text-slate-600 font-bold text-[9px] mr-1">
                        📞 {assignedDriver.phone_number}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TripRestaurantSelector({
  restaurants,
  selectedId,
  selectedIds = [],
  targetCity,
  targetCities = [],
  onSelect,
  onToggleSelect,
}: {
  restaurants: Restaurant[];
  selectedId?: string;
  selectedIds?: string[];
  targetCity?: string;
  targetCities?: string[];
  onSelect?: (id: string) => void;
  onToggleSelect?: (id: string) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<"all" | "restaurant" | "cafe">("all");
  const [cityFilterOverride, setCityFilterOverride] = useState<string>("auto");

  // Effective target cities to filter by
  const effectiveTargetCities = useMemo(() => {
    const list: string[] = [];
    if (targetCity) list.push(targetCity);
    if (targetCities && targetCities.length > 0) {
      targetCities.forEach(c => { if (!list.includes(c)) list.push(c); });
    }
    return list;
  }, [targetCity, targetCities]);

  // Combined active selected IDs
  const activeSelectedIds = useMemo(() => {
    const set = new Set<string>();
    if (selectedId) set.add(selectedId);
    if (selectedIds && selectedIds.length > 0) {
      selectedIds.forEach(id => set.add(id));
    }
    return Array.from(set);
  }, [selectedId, selectedIds]);

  const handleToggle = (id: string) => {
    if (onToggleSelect) {
      onToggleSelect(id);
    } else if (onSelect) {
      onSelect(activeSelectedIds.includes(id) ? "" : id);
    }
  };

  // Filter restaurants by category and city
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter(r => {
      // 1. Category Filter (Restaurant vs Cafe)
      if (categoryFilter === "restaurant") {
        if (r.category === "cafe" || (r.type && r.type.includes("مقهى"))) return false;
      } else if (categoryFilter === "cafe") {
        if (r.category !== "cafe" && !(r.type && (r.type.includes("مقهى") || r.type.includes("كافيه")))) return false;
      }

      // 2. City Filter
      if (cityFilterOverride === "all") return true;
      if (cityFilterOverride !== "auto" && cityFilterOverride !== "") {
        return r.city === cityFilterOverride;
      }
      if (effectiveTargetCities.length > 0) {
        return effectiveTargetCities.some(dest => 
          r.city.includes(dest) || dest.includes(r.city) || (r.address && r.address.includes(dest))
        );
      }
      return true;
    });
  }, [restaurants, categoryFilter, cityFilterOverride, effectiveTargetCities]);

  return (
    <div className="p-4 bg-orange-50/70 rounded-2xl border border-orange-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-black text-orange-950 text-sm flex items-center gap-1.5">
          <span>🍽️</span>
          <span>مطاعم ومقاهي الرحلة (اختيار متعدد وتصفية ذكية حسب المدينة)</span>
        </div>
        <div className="flex items-center gap-2">
          {activeSelectedIds.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-orange-600 text-white text-[11px] font-black">
              تم تحديد ({activeSelectedIds.length}) منشأة
            </span>
          )}
          {activeSelectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (onSelect) onSelect("");
                if (onToggleSelect && selectedIds) {
                  selectedIds.forEach(id => onToggleSelect(id));
                }
              }}
              className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
            >
              إلغاء التحديد بالكامل
            </button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-orange-900/90 font-medium">
        يمكنك تصفية المطاعم والمقاهي حسب مدينة الرحلة المختارة وتحديد أكثر من مطعم أو مقهى لبرنامج الرحلة.
      </p>

      {/* Filter Tabs: Category & City */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-orange-100">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-orange-200">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
              categoryFilter === "all" ? "bg-orange-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            الكل ({restaurants.length})
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("restaurant")}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
              categoryFilter === "restaurant" ? "bg-orange-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>🍽️</span>
            <span>مطاعم</span>
          </button>
          <button
            type="button"
            onClick={() => setCategoryFilter("cafe")}
            className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1 ${
              categoryFilter === "cafe" ? "bg-orange-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>☕</span>
            <span>مقاهي وكافيهات</span>
          </button>
        </div>

        {/* City Filter Override */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950">
          <span>📍 تصفية المدينة:</span>
          <select
            value={cityFilterOverride}
            onChange={(e) => setCityFilterOverride(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-orange-200 bg-white text-xs font-bold text-right"
          >
            <option value="auto">تلقائي (حسب وجهة الرحلة: {effectiveTargetCities.join("، ") || "الكل"})</option>
            <option value="all">عرض كافة المدن</option>
            {["طرابلس", "بنغازي", "مصراتة", "الخمس", "غدامس", "أوباري", "سبها", "شحات", "صبراتة", "درنة", "طبرق"].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Facilities Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {filteredRestaurants.length === 0 && (
          <div className="col-span-full text-center text-xs text-orange-800 py-4 font-bold bg-orange-100/60 rounded-xl space-y-1">
            <p>لا توجد منشآت مطابقة في مدينة الوجهة المحددة ({effectiveTargetCities.join("، ")}).</p>
            <button
              type="button"
              onClick={() => setCityFilterOverride("all")}
              className="text-orange-700 underline font-black text-xs hover:text-orange-950"
            >
              انقر هنا لعرض منشآت كافة المدن
            </button>
          </div>
        )}
        {filteredRestaurants.map((r) => {
          const isSelected = activeSelectedIds.includes(r.id);
          const isCafe = r.category === "cafe" || (r.type && (r.type.includes("مقهى") || r.type.includes("كافيه")));
          return (
            <div
              key={r.id}
              onClick={() => handleToggle(r.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                isSelected
                  ? "bg-orange-50 border-orange-600 shadow-sm ring-2 ring-orange-500/20"
                  : "bg-white border-slate-200 hover:border-orange-300"
              }`}
            >
              <img
                src={r.facility_image_1 || (isCafe ? "/assets/cafe-libya.jpg" : "/assets/restaurant-libya.jpg")}
                alt={r.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>{isCafe ? "☕" : "🍽️"}</span>
                    <span className="font-black text-xs text-slate-900 truncate">{r.name}</span>
                  </div>
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 bg-orange-600 text-white text-[10px] font-black rounded-md">مختار ✓</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">+ تحديد</span>
                  )}
                </div>
                <div className="text-[10px] text-orange-900 font-bold mb-0.5">
                  {r.type || (isCafe ? "كافيه ومقهى" : "مطعم مأكولات")} · <span className="text-orange-700 font-black">مدينة {r.city}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  📍 {r.address || "ليبيا"} | خصم {r.discount_percentage || 15}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TripHotelSelector({
  hotels,
  selectedHotelIds = [],
  onToggleHotel,
  targetCities = [],
}: {
  hotels: Hotel[];
  selectedHotelIds: string[];
  onToggleHotel: (id: string) => void;
  targetCities?: string[];
}) {
  const [showAllCities, setShowAllCities] = useState(false);

  const filteredHotels = useMemo(() => {
    if (showAllCities || targetCities.length === 0) return hotels;
    return hotels.filter(h => 
      targetCities.some(dest => h.city.includes(dest) || dest.includes(h.city) || (h.address && h.address.includes(dest)))
    );
  }, [hotels, showAllCities, targetCities]);

  return (
    <div className="p-4 bg-sky-50/70 rounded-2xl border border-sky-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-black text-sky-950 text-sm flex items-center gap-1.5">
          <span>🏨</span>
          <span>فنادق ومخيمات الإقامة (إمكانية اختيار أكثر من فندق وتصفية بالمدينة)</span>
        </div>
        <div className="flex items-center gap-2">
          {selectedHotelIds.length > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-sky-700 text-white text-[11px] font-black">
              تم تحديد ({selectedHotelIds.length}) أماكن إقامة
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowAllCities(!showAllCities)}
            className="text-[11px] font-bold text-sky-700 hover:underline cursor-pointer"
          >
            {showAllCities ? "تصفية بمدن الرحلة فقط" : "عرض كافة المدن"}
          </button>
        </div>
      </div>

      <p className="text-[11px] text-sky-900/90 font-medium">
        اختر مكان إقامة أو أكثر (فنادق، منتجعات، مخيمات صحراوية) للمبيت وتوزيع النزلاء أثناء الرحلة الأسبوعية.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
        {filteredHotels.length === 0 && (
          <div className="col-span-full text-center text-xs text-sky-800 py-4 font-bold bg-sky-100/60 rounded-xl space-y-1">
            <p>لا توجد فنادق مسجلة في مدينة الوجهة المحددة ({targetCities.join("، ")}).</p>
            <button
              type="button"
              onClick={() => setShowAllCities(true)}
              className="text-sky-700 underline font-black text-xs hover:text-sky-950"
            >
              عرض فنادق كافة المدن
            </button>
          </div>
        )}
        {filteredHotels.map((h) => {
          const isSelected = selectedHotelIds.includes(h.id);
          return (
            <div
              key={h.id}
              onClick={() => onToggleHotel(h.id)}
              className={`p-3 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                isSelected
                  ? "bg-sky-50 border-sky-600 shadow-sm ring-2 ring-sky-500/20"
                  : "bg-white border-slate-200 hover:border-sky-300"
              }`}
            >
              <img
                src={h.hotel_photo_1 || "/assets/ai_hotel.jpg"}
                alt={h.name}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 bg-slate-100"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-black text-xs text-slate-900 truncate">{h.name}</span>
                  {isSelected ? (
                    <span className="px-1.5 py-0.5 bg-sky-700 text-white text-[10px] font-black rounded-md">مختار ✓</span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">+ تحديد</span>
                  )}
                </div>
                <div className="text-[10px] text-sky-900 font-bold mb-0.5">
                  ⭐ {h.stars || 4} نجوم · <span className="text-sky-700 font-black">مدينة {h.city}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium truncate">
                  📍 {h.address} | خصم {h.discount_percentage || 15}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CreateTripModal({
  type,
  guides,
  vehicles,
  hotels,
  restaurants = [],
  drivers = [],
  onClose,
  onCreate,
}: {
  type: "daily" | "weekly";
  guides: Guide[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  restaurants?: Restaurant[];
  drivers?: Driver[];
  onClose: () => void;
  onCreate: (t: "daily" | "weekly", d: any) => void;
}) {
  const isDaily = type === "daily";
  const [title, setTitle] = useState(isDaily ? "جولة لبدة الكبرى والآثار الرومانية" : "مغامرة الصحراء وبحيرات أوباري الكبرى");
  const [desc, setDesc] = useState(isDaily ? "رحلة سياحية يومية متكاملة تشمل جولة أثرية مرشدة والنقل السياحي الفاخر" : "رحلة استكشاف أسبوعية متكاملة تشمل الإقامة والمخيمات ومرشد سياحي متخصص");
  const [destination, setDestination] = useState(isDaily ? "لبدة الكبرى" : "أوباري");
  const [multiDestinations, setMultiDestinations] = useState<string[]>(isDaily ? [] : ["أوباري"]);
  const [departureCity, setDepartureCity] = useState("طرابلس");
  const [price, setPrice] = useState(isDaily ? "120" : "1650");
  const [busCapacity, setBusCapacity] = useState<15 | 25 | 50>(25);
  const [guideLic, setGuideLic] = useState(guides[0]?.license_number || "");
  const [selectedPlate, setSelectedPlate] = useState<string>(vehicles[0]?.plate_number || "");
  
  // Multi-select restaurants & cafes
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>(() => {
    return restaurants[0] ? [restaurants[0].id] : [];
  });
  const handleToggleRestaurant = (id: string) => {
    setSelectedRestaurantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Multi-select hotels
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>(() => {
    return hotels[0] ? [hotels[0].id] : [];
  });
  const handleToggleHotel = (id: string) => {
    setSelectedHotelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const [itinerarySteps, setItinerarySteps] = useState<ItineraryStepItem[]>(DEFAULT_DAILY_ITINERARY_STEPS);
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-06");
  const [images, setImages] = useState<string[]>(
    isDaily
      ? [
          "/assets/dest-leptis-theater.jpg",
          "/assets/dest-leptis-arch.jpg",
          "/assets/dest-leptis-forum.jpg",
          "/assets/dest-leptis-coast.jpg",
          "/assets/hero-leptis.jpg",
        ]
      : [
          "/assets/dest-ubari-gaberoun.jpg",
          "/assets/dest-ubari-ummalmaa.jpg",
          "/assets/dest-acacus-arch.jpg",
          "/assets/dest-sahara-dunes.jpg",
          "/assets/dest-ubari.jpg",
        ]
  );
  const [isActive, setIsActive] = useState(true);

  // Daily Trips schedule: ALLOWS 1 day OR 2 days in a week!
  const [recurringDays, setRecurringDays] = useState<string[]>(["الأحد", "الأربعاء"]);

  // Weekly Trips schedule: 1 day in a week
  const [weeklyDay, setWeeklyDay] = useState<string>("الجمعة");

  const [activities, setActivities] = useState(
    isDaily
      ? "جولة أثرية بمرشد موثق • شرح تاريخي مفصل • غداء طازج • جلسة تصوير احترافية"
      : "إقامة فندقية ومخيمات صحراوية • جولات سيارات رباعية الدفع • استكشاف البحيرات • وجبات تقليدية كاملة"
  );

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (!isDaily) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        setWeeklyDay(days[d.getDay()]);
      }
    }
  };

  const handleMultiDestToggle = (city: string) => {
    setMultiDestinations(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };

  const allWeekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  const toggleDailyDay = (day: string) => {
    if (recurringDays.includes(day)) {
      if (recurringDays.length === 1) return; // Keep at least 1
      setRecurringDays(recurringDays.filter((d) => d !== day));
    } else {
      if (recurringDays.length >= 2) {
        setRecurringDays([recurringDays[1], day]);
      } else {
        setRecurringDays([...recurringDays, day]);
      }
    }
  };

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => g.verification_status !== "مرفوض");
  }, [guides]);

  const selectedPrimaryRestaurant = useMemo(() => {
    return restaurants.find(r => selectedRestaurantIds.includes(r.id)) || null;
  }, [restaurants, selectedRestaurantIds]);

  const handleEnterKeyNext = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest("form");
      if (!form) return;
      const elements = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button[type="button"]'
        )
      );
      const currentIndex = elements.indexOf(e.target as HTMLElement);
      if (currentIndex > -1 && currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isDaily && (recurringDays.length < 1 || recurringDays.length > 2)) {
      alert("تنبيه: يجب اختيار يوم واحد أو يومين أسبوعياً للرحلة اليومية!");
      return;
    }

    if (!isDaily && multiDestinations.length === 0) {
      alert("تنبيه: يجب اختيار وجهة سياحية واحدة على الأقل للرحلة الأسبوعية!");
      return;
    }

    const payload: any = {
      trip_title: title,
      title,
      description: desc,
      destination: isDaily ? destination : multiDestinations.join(" + "),
      destination_city: isDaily ? destination : multiDestinations[0] || "ليبيا",
      destinations: !isDaily ? multiDestinations : [destination],
      departure_city: departureCity,
      price_per_seat: +price,
      seat_per_price: +price,
      bus_capacity: busCapacity,
      max_capacity: busCapacity,
      available_seats: busCapacity,
      recurring_days: recurringDays.join(","),
      weekly_day: weeklyDay,
      start_date: startDate,
      end_date: endDate,
      guide_license_number: guideLic,
      vehicle_plate: selectedPlate || null,
      vehicle_plates: selectedPlate ? [selectedPlate] : [],
      restaurant_id: selectedRestaurantIds[0] || null,
      restaurant_ids: selectedRestaurantIds,
      hotel_id: selectedHotelIds[0] || null,
      hotel_ids: selectedHotelIds,
      itinerary_steps: itinerarySteps,
      photo: images[0] || (isDaily ? "/assets/dest-leptis-theater.jpg" : "/assets/dest-ubari-gaberoun.jpg"),
      gallery: images.filter(Boolean).join(","),
      images: images,
      activities: activities.trim() || null,
      is_active: isActive,
    };

    onCreate(type, payload);
  };

  return (
    <ModalShell
      maxWidth="max-w-5xl"
      title={
        isDaily
          ? `إنشاء رحلة يومية جديدة (${recurringDays.length} يوم/أيام — حافلة ${busCapacity} راكب)`
          : `إنشاء رحلة أسبوعية جديدة (يوم واحد في الأسبوع — حافلة ${busCapacity} راكب)`
      }
      onClose={onClose}
    >
      <form className="space-y-5 text-right text-xs" onSubmit={handleSubmit}>
        
        {/* 1. Basic Info */}
        <div className="space-y-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="font-black text-slate-800 text-sm flex items-center gap-1.5">
            <span>🏷️</span>
            <span>البيانات الأساسية للرحلة</span>
          </div>

          <Field label="عنوان الرحلة السياحية" value={title} onChange={setTitle} onKeyDown={handleEnterKeyNext} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold mb-1 block">مدينة الانطلاق</label>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                onKeyDown={handleEnterKeyNext}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right mb-2"
              >
                <option value="طرابلس">طرابلس</option>
                <option value="بنغازي">بنغازي</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold mb-1 block">
                {isDaily ? "المكان / الوجهة السياحية" : "الوجهات السياحية (اختر أكثر من معلم)"}
              </label>
              {isDaily ? (
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={handleEnterKeyNext}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right mb-2"
                  placeholder="مثال: لبدة الكبرى..."
                />
              ) : (
                <div className="w-full min-h-10 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-right mb-2 bg-white flex flex-wrap gap-1">
                  {multiDestinations.length === 0 && <span className="text-slate-400">اختر المعالم أدناه...</span>}
                  {multiDestinations.map(d => (
                    <span key={d} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                      {d}
                      <button type="button" onClick={() => handleMultiDestToggle(d)} className="text-blue-500 hover:text-red-500">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {["لبدة الكبرى", "غدامس", "أوباري", "شحات", "صبراتة", "طرابلس", "بنغازي", "سوسة"].map((city) => {
              const isSelected = isDaily ? destination === city : multiDestinations.includes(city);
              return (
                <button
                  key={city}
                  type="button"
                  onClick={() => isDaily ? setDestination(city) : handleMultiDestToggle(city)}
                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition cursor-pointer ${
                    isSelected ? "bg-[#003580] text-white border-[#003580]" : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  {city} {isSelected && !isDaily && "✓"}
                </button>
              );
            })}
          </div>

          <Field label="وصف الرحلة وبرنامجها" value={desc} onChange={setDesc} onKeyDown={handleEnterKeyNext} />
          
          <Field 
            label="الأنشطة المتاحة ضمن الرحلة (افصل بينها بنقطة • أو فاصلة)" 
            value={activities} 
            onChange={setActivities} 
            onKeyDown={handleEnterKeyNext} 
          />

          <div className="grid grid-cols-2 gap-2">
            <Field label="سعر المقعد الواحد (د.ل)" type="number" value={price} onChange={setPrice} onKeyDown={handleEnterKeyNext} />
            <div>
              <label className="text-xs font-bold mb-1 block">حالة تفعيل الرحلة</label>
              <div className="grid grid-cols-2 gap-1 h-10 p-1 bg-slate-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setIsActive(true)}
                  className={`h-full rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                    isActive ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🟢</span>
                  <span>نشطة ومتاحة</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  className={`h-full rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1 ${
                    !isActive ? "bg-slate-700 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>⚪</span>
                  <span>مسودة</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Schedule Selector */}
        {isDaily ? (
          <div className="p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-black text-blue-900 text-xs flex items-center gap-1.5">
                <span>📅</span>
                <span>جدول أيام الانطلاق الأسبوعية (اختر يوماً واحداً أو يومين):</span>
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-200 text-blue-900 text-[11px] font-black">
                {recurringDays.length} يوم مختار ({recurringDays.join(" و ")})
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {allWeekDays.map((d) => {
                const isSelected = recurringDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDailyDay(d)}
                    className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-700 shadow-sm ring-2 ring-blue-500/20"
                        : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
                    }`}
                  >
                    <span>{d}</span>
                    {isSelected && <span className="text-[10px]">✓</span>}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-blue-700 font-bold">
              * النظام يتيح للرحلة اليومية أن تنطلق في يوم واحد أو يومين ثابتين كل أسبوع (مثال: الأحد والأربعاء).
            </p>
          </div>
        ) : (
          <div className="p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-black text-amber-950 text-xs flex items-center gap-1.5">
                <span>🗓️</span>
                <span>فترة وموعد الرحلة الأسبوعية:</span>
              </label>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-black">
                تنطلق الرحلة كل يوم {weeklyDay}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  📅 تاريخ الانطلاق (يبدأ منه جدول الأسبوع):
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 text-right outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  🏁 تاريخ نهاية الرحلة الأسبوعية:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 text-right outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Vehicles & Drivers Filtered by Capacity */}
        <TripVehicleAndDriverSelector
          vehicles={vehicles}
          drivers={drivers}
          busCapacity={busCapacity}
          onCapacityChange={(cap) => setBusCapacity(cap)}
          selectedPlate={selectedPlate}
          onSelectPlate={setSelectedPlate}
        />

        {/* 4. Multi-Select Restaurants & Cafes Filtered by Destination City */}
        <TripRestaurantSelector
          restaurants={restaurants}
          selectedIds={selectedRestaurantIds}
          onToggleSelect={handleToggleRestaurant}
          targetCity={isDaily ? destination : undefined}
          targetCities={!isDaily ? multiDestinations : [destination]}
        />

        {/* 5. Multi-Select Hotels (for Weekly Trips) */}
        {!isDaily && (
          <TripHotelSelector
            hotels={hotels}
            selectedHotelIds={selectedHotelIds}
            onToggleHotel={handleToggleHotel}
            targetCities={multiDestinations}
          />
        )}

        {/* 6. Step-by-Step Itinerary Editor with Add / Delete Stops */}
        <TripItineraryTimelineEditor
          steps={itinerarySteps}
          onChange={setItinerarySteps}
          selectedRestaurant={selectedPrimaryRestaurant}
        />

        {/* 7. Tour Guide Selector */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <label className="text-xs font-bold text-slate-800 block">
            👨‍🏫 المرشد السياحي المعين للرحلة (مرخص وموثق بالمنصة):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {filteredGuidesList.length === 0 && (
              <div className="col-span-full text-center text-xs text-amber-700 py-3 font-bold bg-amber-100/50 rounded-xl">
                لا يوجد مرشدين حقيقيين متاحين في قاعدة البيانات.
              </div>
            )}
            {filteredGuidesList.map((g) => {
              const isSelected = guideLic === g.license_number;
              return (
                <div
                  key={g.license_number}
                  onClick={() => setGuideLic(g.license_number)}
                  className={`p-2.5 rounded-xl border-2 cursor-pointer transition flex items-start gap-2.5 ${
                    isSelected
                      ? "bg-amber-50/70 border-amber-600 shadow-sm ring-1 ring-amber-500"
                      : "bg-white border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-slate-200">
                    {g.avatar ? <img src={g.avatar} alt={g.full_name} className="w-full h-full object-cover" /> : "👤"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="font-black text-xs text-slate-900 truncate">{g.full_name}</div>
                      {isSelected && <span className="text-amber-600 text-xs font-black">✅</span>}
                    </div>
                    {g.title && <div className="text-[10px] text-blue-700 font-bold truncate">{g.title}</div>}
                    <div className="text-[9px] text-slate-500 font-bold">
                      رخصة: {g.license_number} | خبرة {g.years_of_experience} سنوات
                    </div>
                    <div className="text-[9px] text-emerald-700 font-black">
                      {g.daily_rate || g.price_per_day || 150} د.ل / اليوم
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 8. 5-Image Manager */}
        <div className="pt-2 border-t border-slate-200">
          <TripImagesFiveManager images={images} onChange={setImages} />
        </div>

        {/* Modal Submit Actions */}
        <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
          <button type="button" onClick={onClose} className="px-5 h-10 rounded-xl border border-slate-300 font-black text-xs hover:bg-slate-50 cursor-pointer">
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow hover:opacity-95 cursor-pointer flex items-center gap-2"
          >
            <span>✓</span>
            <span>إنشاء وحفظ الرحلة</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function DailyTripEditModal({
  trip,
  guides,
  vehicles,
  hotels: _hotels,
  restaurants = [],
  drivers = [],
  onClose,
  onSave,
}: {
  trip: DailyTrip;
  guides: Guide[];
  vehicles: Vehicle[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  drivers?: Driver[];
  onClose: () => void;
  onSave: (t: DailyTrip) => void;
}) {
  const [title, setTitle] = useState(trip.trip_title || trip.title || "");
  const [desc, setDesc] = useState(trip.description);
  const [destination, setDestination] = useState(trip.destination || "لبدة الكبرى");
  const [departureCity, setDepartureCity] = useState(trip.departure_city || "طرابلس");
  const [price, setPrice] = useState(String(trip.price_per_seat));
  const [busCapacity, setBusCapacity] = useState<15 | 25 | 50>(
    trip.bus_capacity === 50 || trip.max_capacity === 50 ? 50 : trip.bus_capacity === 15 || trip.max_capacity === 15 ? 15 : 25
  );
  const [selectedPlate, setSelectedPlate] = useState<string>(
    (trip as any).vehicle_plate || trip.vehicle_plates?.[0] || vehicles[0]?.plate_number || ""
  );

  // Multi-select restaurants & cafes
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>(() => {
    if ((trip as any).restaurant_ids && Array.isArray((trip as any).restaurant_ids) && (trip as any).restaurant_ids.length > 0) {
      return (trip as any).restaurant_ids;
    }
    if ((trip as any).restaurant_id) return [(trip as any).restaurant_id];
    return [];
  });
  const handleToggleRestaurant = (id: string) => {
    setSelectedRestaurantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const [itinerarySteps, setItinerarySteps] = useState<ItineraryStepItem[]>(() => {
    if ((trip as any).itinerary_steps) {
      try {
        const parsed = typeof (trip as any).itinerary_steps === "string" ? JSON.parse((trip as any).itinerary_steps) : (trip as any).itinerary_steps;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_DAILY_ITINERARY_STEPS;
  });

  const [guide, setGuide] = useState(trip.guide_license_number || trip.guide_license || "");
  const [recurringDays, setRecurringDays] = useState<string[]>(
    Array.isArray(trip.recurring_days)
      ? trip.recurring_days
      : typeof trip.recurring_days === "string"
      ? trip.recurring_days.split(",")
      : ["الأحد", "الأربعاء"]
  );
  const [images, setImages] = useState<string[]>(() => {
    if ((trip as any).images && Array.isArray((trip as any).images) && (trip as any).images.length > 0) {
      return (trip as any).images;
    }
    if (trip.gallery) {
      const parts = (typeof trip.gallery === "string" ? trip.gallery.split(",") : trip.gallery).map((s: string) => s.trim()).filter(Boolean);
      if (parts.length >= 5) return parts.slice(0, 5);
      while (parts.length < 5) parts.push(parts[0] || trip.photo || "/assets/dest-leptis-theater.jpg");
      return parts;
    }
    const p = trip.photo || "/assets/dest-leptis-theater.jpg";
    return [p, "/assets/dest-leptis-arch.jpg", "/assets/dest-leptis-forum.jpg", "/assets/dest-leptis-coast.jpg", "/assets/hero-leptis.jpg"];
  });
  const [activities, setActivities] = useState((trip as any).activities || "جولة أثرية بمرشد موثق • شرح تاريخي مفصل • غداء طازج • جلسة تصوير");

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => g.verification_status !== "مرفوض");
  }, [guides]);

  const selectedPrimaryRestaurant = useMemo(() => {
    return restaurants.find(r => selectedRestaurantIds.includes(r.id)) || null;
  }, [restaurants, selectedRestaurantIds]);

  const allWeekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  const toggleDailyDay = (day: string) => {
    if (recurringDays.includes(day)) {
      if (recurringDays.length === 1) return;
      setRecurringDays(recurringDays.filter((d) => d !== day));
    } else {
      if (recurringDays.length >= 2) {
        setRecurringDays([recurringDays[1], day]);
      } else {
        setRecurringDays([...recurringDays, day]);
      }
    }
  };

  return (
    <ModalShell maxWidth="max-w-5xl" title={`تعديل الرحلة اليومية: ${trip.trip_title || trip.title || ""}`} onClose={onClose}>
      <form
        className="space-y-4 text-right text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (recurringDays.length < 1 || recurringDays.length > 2) {
            alert("يرجى اختيار يوم واحد أو يومين أسبوعياً للرحلة اليومية.");
            return;
          }
          onSave({
            ...trip,
            trip_title: title,
            title,
            description: desc,
            destination,
            destination_city: destination,
            departure_city: departureCity,
            price_per_seat: +price,
            bus_capacity: busCapacity,
            max_capacity: busCapacity,
            available_seats: busCapacity,
            recurring_days: recurringDays.join(","),
            guide_license_number: guide,
            guide_license: guide,
            vehicle_plate: selectedPlate || null,
            vehicle_plates: selectedPlate ? [selectedPlate] : [],
            restaurant_id: selectedRestaurantIds[0] || null,
            restaurant_ids: selectedRestaurantIds,
            itinerary_steps: itinerarySteps,
            photo: images[0] || trip.photo || "/assets/dest-leptis-theater.jpg",
            gallery: images.filter(Boolean).join(","),
            images: images,
            activities: activities.trim() || null,
          } as any);
        }}
      >
        <Field label="عنوان الرحلة" value={title} onChange={setTitle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold mb-1 block">مدينة الانطلاق</label>
            <select
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right"
            >
              <option value="طرابلس">طرابلس</option>
              <option value="بنغازي">بنغازي</option>
            </select>
          </div>
          <Field label="الوجهة / المكان السياحي" value={destination} onChange={setDestination} />
        </div>
        <Field label="الوصف" value={desc} onChange={setDesc} />
        <Field label="الأنشطة المتاحة ضمن الرحلة" value={activities} onChange={setActivities} />
        <Field label="السعر (د.ل)" type="number" value={price} onChange={setPrice} />

        {/* 1 or 2 Days Selector */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
          <div className="font-black text-blue-900 text-xs flex justify-between">
            <span>📅 جدول الأيام (يوم واحد أو يومين أسبوعياً):</span>
            <span className="text-emerald-700">المختار: {recurringDays.join(" و ")}</span>
          </div>
          <div className="grid grid-cols-7 gap-1">
            {allWeekDays.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDailyDay(d)}
                className={`py-1.5 rounded-lg text-xs font-black border transition ${
                  recurringDays.includes(d) ? "bg-blue-600 text-white border-blue-700" : "bg-white text-slate-700 border-slate-200"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Bus Capacity & Fleet Selector */}
        <TripVehicleAndDriverSelector
          vehicles={vehicles}
          drivers={drivers}
          busCapacity={busCapacity}
          onCapacityChange={(cap) => setBusCapacity(cap)}
          selectedPlate={selectedPlate}
          onSelectPlate={setSelectedPlate}
        />

        {/* Multi-Select Restaurants & Cafes Filtered by Destination City */}
        <TripRestaurantSelector
          restaurants={restaurants}
          selectedIds={selectedRestaurantIds}
          onToggleSelect={handleToggleRestaurant}
          targetCity={destination}
        />

        {/* Step-by-Step Itinerary Editor with Add/Delete Stops */}
        <TripItineraryTimelineEditor
          steps={itinerarySteps}
          onChange={setItinerarySteps}
          selectedRestaurant={selectedPrimaryRestaurant}
        />

        <div>
          <label className="text-xs font-bold mb-2 block">المرشد السياحي المعين</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {filteredGuidesList.length === 0 && (
              <div className="col-span-full text-center text-xs text-amber-700 py-3 font-bold bg-amber-100/50 rounded-xl">
                لا يوجد مرشدين حقيقيين متاحين في قاعدة البيانات.
              </div>
            )}
            {filteredGuidesList.map((g) => (
              <div
                key={g.license_number}
                onClick={() => setGuide(g.license_number)}
                className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                  guide === g.license_number
                    ? "bg-amber-50/50 border-amber-500 ring-1 ring-amber-500"
                    : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border">
                  {g.avatar ? <img src={g.avatar} alt={g.full_name} className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="font-black text-xs text-slate-900 truncate">{g.full_name}</div>
                    {guide === g.license_number && <div className="text-amber-600 text-xs">✅</div>}
                  </div>
                  {g.title && <div className="text-[10px] text-primary font-bold truncate">{g.title}</div>}
                  <div className="text-[9px] text-slate-500 font-bold">
                    رخصة: {g.license_number} | خبرة {g.years_of_experience} سنوات
                  </div>
                  <div className="text-[9px] text-emerald-700 font-black">
                    {g.daily_rate || g.price_per_day || 150} د.ل / اليوم
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <TripImagesFiveManager images={images} onChange={setImages} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            إلغاء
          </button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">
            حفظ التعديلات
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function WeeklyTripEditModal({
  trip,
  guides,
  vehicles,
  hotels,
  restaurants = [],
  drivers = [],
  onClose,
  onSave,
}: {
  trip: WeeklyTrip;
  guides: Guide[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  restaurants?: Restaurant[];
  drivers?: Driver[];
  onClose: () => void;
  onSave: (w: WeeklyTrip) => void;
}) {
  const [title, setTitle] = useState(trip.trip_title || trip.title || "");
  const [multiDestinations, setMultiDestinations] = useState<string[]>(trip.destinations || (trip.destination ? trip.destination.split(" + ") : ["أوباري"]));
  const [departureCity, setDepartureCity] = useState(trip.departure_city || "طرابلس");
  const [price, setPrice] = useState(String(trip.seat_per_price));

  const handleMultiDestToggle = (city: string) => {
    setMultiDestinations(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };
  const [busCapacity, setBusCapacity] = useState<15 | 25 | 50>(
    trip.bus_capacity === 50 || trip.max_capacity === 50 ? 50 : trip.bus_capacity === 15 || trip.max_capacity === 15 ? 15 : 25
  );
  const [weeklyDay, setWeeklyDay] = useState(trip.weekly_day || "الجمعة");
  const [startDate, setStartDate] = useState(trip.start_date || "2026-09-01");
  const [endDate, setEndDate] = useState(trip.end_date || "2026-09-06");

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
      setWeeklyDay(days[d.getDay()]);
    }
  };
  const [guide, setGuide] = useState(trip.guide_license_number || trip.guide_license || "");
  
  // Multi-select hotels
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>(() => {
    if ((trip as any).hotel_ids && Array.isArray((trip as any).hotel_ids) && (trip as any).hotel_ids.length > 0) {
      return (trip as any).hotel_ids;
    }
    if (trip.hotel_id) return [trip.hotel_id];
    return [];
  });
  const handleToggleHotel = (id: string) => {
    setSelectedHotelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const [selectedPlate, setSelectedPlate] = useState<string>(
    (trip as any).vehicle_plate || trip.vehicle_plates?.[0] || vehicles[0]?.plate_number || ""
  );

  // Multi-select restaurants & cafes
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>(() => {
    if ((trip as any).restaurant_ids && Array.isArray((trip as any).restaurant_ids) && (trip as any).restaurant_ids.length > 0) {
      return (trip as any).restaurant_ids;
    }
    if ((trip as any).restaurant_id) return [(trip as any).restaurant_id];
    return [];
  });
  const handleToggleRestaurant = (id: string) => {
    setSelectedRestaurantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const [itinerarySteps, setItinerarySteps] = useState<ItineraryStepItem[]>(() => {
    if ((trip as any).itinerary_steps) {
      try {
        const parsed = typeof (trip as any).itinerary_steps === "string" ? JSON.parse((trip as any).itinerary_steps) : (trip as any).itinerary_steps;
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    return DEFAULT_DAILY_ITINERARY_STEPS;
  });

  const [images, setImages] = useState<string[]>(() => {
    if ((trip as any).images && Array.isArray((trip as any).images) && (trip as any).images.length > 0) {
      return (trip as any).images;
    }
    if (trip.gallery) {
      const parts = (typeof trip.gallery === "string" ? trip.gallery.split(",") : trip.gallery).map((s: string) => s.trim()).filter(Boolean);
      if (parts.length >= 5) return parts.slice(0, 5);
      while (parts.length < 5) parts.push(parts[0] || trip.photo || "/assets/dest-ubari-gaberoun.jpg");
      return parts;
    }
    const p = trip.photo || "/assets/dest-ubari-gaberoun.jpg";
    return [p, "/assets/dest-ubari-ummalmaa.jpg", "/assets/dest-acacus-arch.jpg", "/assets/dest-sahara-dunes.jpg", "/assets/dest-ubari.jpg"];
  });

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => g.verification_status !== "مرفوض");
  }, [guides]);

  const selectedPrimaryRestaurant = useMemo(() => {
    return restaurants.find(r => selectedRestaurantIds.includes(r.id)) || null;
  }, [restaurants, selectedRestaurantIds]);

  return (
    <ModalShell maxWidth="max-w-5xl" title={`تعديل الرحلة الأسبوعية: ${trip.trip_title || trip.title || ""}`} onClose={onClose}>
      <form
        className="space-y-4 text-right text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (multiDestinations.length === 0) {
            alert("تنبيه: يجب اختيار وجهة سياحية واحدة على الأقل!");
            return;
          }
          onSave({
            ...trip,
            trip_title: title,
            title,
            destinations: multiDestinations,
            destination: multiDestinations.join(" + "),
            departure_city: departureCity,
            seat_per_price: +price,
            bus_capacity: busCapacity,
            max_capacity: busCapacity,
            available_seats: busCapacity,
            weekly_day: weeklyDay,
            start_date: startDate,
            end_date: endDate,
            guide_license_number: guide,
            guide_license: guide,
            hotel_id: selectedHotelIds[0] || null,
            hotel_ids: selectedHotelIds,
            vehicle_plate: selectedPlate || null,
            vehicle_plates: selectedPlate ? [selectedPlate] : [],
            restaurant_id: selectedRestaurantIds[0] || null,
            restaurant_ids: selectedRestaurantIds,
            itinerary_steps: itinerarySteps,
            photo: images[0] || trip.photo || "/assets/dest-ubari-gaberoun.jpg",
            gallery: images.filter(Boolean).join(","),
            images: images,
          });
        }}
      >
        <Field label="عنوان الرحلة الأسبوعية" value={title} onChange={setTitle} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold mb-1 block">مدينة الانطلاق</label>
            <select
              value={departureCity}
              onChange={(e) => setDepartureCity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right"
            >
              <option value="طرابلس">طرابلس</option>
              <option value="بنغازي">بنغازي</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block">الوجهات السياحية (المعالم المستهدفة)</label>
            <div className="w-full min-h-10 px-3 py-2 rounded-xl border border-slate-200 bg-white flex flex-wrap gap-1">
              {multiDestinations.length === 0 && <span className="text-slate-400 text-[10px]">اختر من الأسفل...</span>}
              {multiDestinations.map(d => (
                <span key={d} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1">
                  {d}
                  <button type="button" onClick={() => handleMultiDestToggle(d)} className="text-blue-500 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["لبدة الكبرى", "غدامس", "أوباري", "شحات", "صبراتة", "طرابلس", "بنغازي", "سوسة"].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => handleMultiDestToggle(city)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition cursor-pointer ${
                multiDestinations.includes(city) ? "bg-[#003580] text-white border-[#003580]" : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {city} {multiDestinations.includes(city) && "✓"}
            </button>
          ))}
        </div>
        <Field label="السعر (د.ل)" type="number" value={price} onChange={setPrice} />

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
          <div className="font-black text-amber-900 text-xs flex justify-between items-center">
            <span>🗓️ موعد الانطلاق (يوم واحد أسبوعياً):</span>
            <span className="px-3 py-1 bg-amber-200/50 rounded-lg text-amber-900 font-black">يتم تحديده تلقائياً: كل {weeklyDay}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ الانطلاق" type="date" value={startDate} onChange={handleStartDateChange} />
          <Field label="تاريخ العودة" type="date" value={endDate} onChange={setEndDate} />
        </div>

        {/* Bus Capacity & Fleet */}
        <TripVehicleAndDriverSelector
          vehicles={vehicles}
          drivers={drivers}
          busCapacity={busCapacity}
          onCapacityChange={(cap) => setBusCapacity(cap)}
          selectedPlate={selectedPlate}
          onSelectPlate={setSelectedPlate}
        />

        {/* Multi-Select Restaurants & Cafes Filtered by Destination Cities */}
        <TripRestaurantSelector
          restaurants={restaurants}
          selectedIds={selectedRestaurantIds}
          onToggleSelect={handleToggleRestaurant}
          targetCities={multiDestinations}
        />

        {/* Multi-Select Hotels Filtered by Destination Cities */}
        <TripHotelSelector
          hotels={hotels}
          selectedHotelIds={selectedHotelIds}
          onToggleHotel={handleToggleHotel}
          targetCities={multiDestinations}
        />

        {/* Dynamic Itinerary Timeline with Add/Delete Stops */}
        <TripItineraryTimelineEditor
          steps={itinerarySteps}
          onChange={setItinerarySteps}
          selectedRestaurant={selectedPrimaryRestaurant}
        />

        <div>
          <label className="text-xs font-bold mb-2 block">المرشد السياحي المعين</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {filteredGuidesList.length === 0 && (
              <div className="col-span-full text-center text-xs text-amber-700 py-3 font-bold bg-amber-100/50 rounded-xl">
                لا يوجد مرشدين حقيقيين متاحين في قاعدة البيانات.
              </div>
            )}
            {filteredGuidesList.map((g) => (
              <div
                key={g.license_number}
                onClick={() => setGuide(g.license_number)}
                className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                  guide === g.license_number
                    ? "bg-amber-50/50 border-amber-500 ring-1 ring-amber-500"
                    : "bg-white border-slate-200 hover:border-amber-300"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border">
                  {g.avatar ? <img src={g.avatar} alt={g.full_name} className="w-full h-full object-cover" /> : "👤"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="font-black text-xs text-slate-900 truncate">{g.full_name}</div>
                    {guide === g.license_number && <div className="text-amber-600 text-xs">✅</div>}
                  </div>
                  {g.title && <div className="text-[10px] text-primary font-bold truncate">{g.title}</div>}
                  <div className="text-[9px] text-slate-500 font-bold">
                    رخصة: {g.license_number} | خبرة {g.years_of_experience} سنوات
                  </div>
                  <div className="text-[9px] text-emerald-700 font-black">
                    {g.daily_rate || g.price_per_day || 150} د.ل / اليوم
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-200">
          <TripImagesFiveManager images={images} onChange={setImages} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            إلغاء
          </button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">
            حفظ التغييرات
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function EvaluatePrivateTripModal({ trip, guides, vehicles, onClose, onSave }: { trip: PrivateTripRequest; guides: Guide[]; vehicles: Vehicle[]; onClose: () => void; onSave: (id: string, status: string, price?: number, plan?: string, guide?: string, vehicle?: string) => void }) {
  // Tourist chose the guide (guide_license_number)
  const initialGuideLic = trip.guide_license_number || trip.assigned_guide || guides[0]?.license_number || "";
  const [guide, setGuide] = useState(initialGuideLic);
  const [vehicle, setVehicle] = useState(trip.assigned_vehicle || vehicles[0]?.plate_number || "");
  const [servicesFee, setServicesFee] = useState("150"); // الخدمات المقدمة (ضيافة، تصاريح، لوجستيات)
  
  const selectedGuide = guides.find(g => g.license_number === guide) || guides[0];
  const selectedVehicle = vehicles.find(v => v.plate_number === vehicle) || vehicles[0];
  const guideDailyRate = selectedGuide?.daily_rate || 150;
  const vehicleDailyRate = selectedVehicle?.daily_rate || 450;
  const durationDays = trip.duration_days || 1;
  const servCost = Number(servicesFee) || 0;
  
  const totalGuideCost = guideDailyRate * durationDays;
  const totalVehicleCost = vehicleDailyRate * durationDays;
  const autoCalculatedTotal = totalGuideCost + totalVehicleCost + servCost;

  const [price, setPrice] = useState(trip.quoted_price ? String(trip.quoted_price) : String(autoCalculatedTotal));
  const [plan, setPlan] = useState(trip.admin_itinerary_plan || `برنامج رحلة سياحية خاصة لمدة ${durationDays} أيام يشمل المرشد السياحي المختار وسيارة النقل الخاصة والخدمات الميدانية.`);

  const applyAutoPrice = () => {
    setPrice(String(autoCalculatedTotal));
  };

  return (
    <ModalShell title={`احتساب تسعيرة الرحلة الخاصة واعتمادها: ${trip.private_trip_id}`} onClose={onClose}>
      <div className="space-y-4 text-right">
        {/* Tourist Request Details */}
        <div className="p-3.5 rounded-xl bg-muted/40 text-xs space-y-1.5 border border-border/70">
          <div className="flex justify-between items-center">
            <div><b>العميل:</b> {trip.customer_name} ({trip.customer_phone})</div>
            <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-black">⏱️ المدة: {durationDays} أيام</span>
          </div>
          <div className="flex gap-4 text-muted-foreground font-bold">
            <span>📅 تاريخ الانطلاق: {trip.preferred_start_date}</span>
            <span>👥 المرافقين: {trip.number_of_companions}</span>
          </div>
          <div className="mt-1 font-semibold text-muted-foreground p-2 rounded-lg bg-white border border-border/40">
            "{trip.customer_description}"
          </div>
          {trip.customer_requirements && (
            <div className="text-[11px] text-amber-900 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <b>متطلبات السائح الخاصة:</b> {trip.customer_requirements}
            </div>
          )}
        </div>

        {/* Tourist Selected Guide Display & Confirmation */}
        <div>
          <label className="text-xs font-black text-foreground mb-1 block">
            👨‍✈️ المرشد السياحي (الذي اختاره السائح):
          </label>
          <select
            value={guide}
            onChange={e => setGuide(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right"
          >
            {guides.map(g => (
              <option key={g.license_number} value={g.license_number}>
                {g.full_name} ({g.license_number}) — {g.daily_rate || 150} د.ل / اليوم {g.license_number === trip.guide_license_number ? "⭐ (اختيار السائح)" : ""}
              </option>
            ))}
          </select>
          {trip.guide_license_number && (
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              ✓ تم اختيار المرشد ({trip.guide_license_number}) بناءً على رغبة السائح.
            </p>
          )}
        </div>

        {/* Vehicle Selection */}
        <div>
          <label className="text-xs font-black text-foreground mb-1 block">🚌 سيارة النقل المخصصة (تحديد الإدارة):</label>
          <select
            value={vehicle}
            onChange={e => setVehicle(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right"
          >
            {vehicles.map(v => (
              <option key={v.plate_number} value={v.plate_number}>
                {v.vehicle_type} ({v.plate_number}) — {v.company_name} — {v.daily_rate} د.ل / اليوم
              </option>
            ))}
          </select>
        </div>

        {/* Services Fee */}
        <div>
          <label className="text-xs font-black text-foreground mb-1 block">🛠️ مصروفات الخدمات المقدمة (لوجستيات، تصاريح، ضيافة) (د.ل):</label>
          <input
            type="number"
            value={servicesFee}
            onChange={e => setServicesFee(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right"
          />
        </div>

        {/* Breakdown Calculation Box */}
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-emerald-900">🧾 تفاصيل جمع الحسبة التلقائية:</span>
            <button
              type="button"
              onClick={applyAutoPrice}
              className="text-[11px] font-black text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
            >
              🔄 تطبيق السعر المحسوب في الإجمالي
            </button>
          </div>
          <div className="text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>مصروفات المرشد ({guideDailyRate} د.ل × {durationDays} يوم):</span>
              <span className="font-bold text-foreground">{totalGuideCost} د.ل</span>
            </div>
            <div className="flex justify-between">
              <span>مصروفات سيارة النقل ({vehicleDailyRate} د.ل × {durationDays} يوم):</span>
              <span className="font-bold text-foreground">{totalVehicleCost} د.ل</span>
            </div>
            <div className="flex justify-between">
              <span>مصروفات الخدمات المقدمة:</span>
              <span className="font-bold text-foreground">{servCost} د.ل</span>
            </div>
            <div className="flex justify-between border-t border-emerald-200/80 pt-1.5 font-black text-emerald-900">
              <span>المجموع الكلي التقديري:</span>
              <span className="text-sm font-black">{autoCalculatedTotal} د.ل</span>
            </div>
          </div>
        </div>

        <Field label="السعر الإجمالي النهائي المعروض للسائح (د.ل)" type="number" value={price} onChange={setPrice} />

        <div>
          <label className="text-xs font-bold mb-1 block">برنامج ومسار الرحلة المقترح من الإدارة:</label>
          <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={3} className="w-full p-2.5 rounded-xl border border-border text-xs font-semibold text-right" />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={() => onSave(trip.private_trip_id, "مرفوضة من الأدمن")} className="px-4 h-10 border border-red-200 text-red-600 rounded-xl font-black text-xs hover:bg-red-50 cursor-pointer">
            رفض الطلب
          </button>
          <button onClick={() => onSave(trip.private_trip_id, "تم التسعير - بانتظار موافقة السائح", +price, plan, guide, vehicle)} className="px-5 h-10 bg-gradient-sea text-white rounded-xl font-black text-xs shadow-glow hover:opacity-95 cursor-pointer">
            اعتماد الحسبة وإرسال التسعيرة للسائح ({price} د.ل) ↗
          </button>
        </div>
      </div>
    </ModalShell>
  );
}


function HotelModal({
  title,
  hotel,
  onClose,
  onSave,
  existingHotels = [],
}: {
  title: string;
  hotel?: Hotel;
  onClose: () => void;
  onSave: (h: any) => void;
  existingHotels?: Hotel[];
}) {
  const isNew = !hotel;
  const [hotelIdInput, setHotelIdInput] = useState(hotel?.hotel_id || hotel?.id || "");
  const [propertyType, setPropertyType] = useState<string>(hotel?.property_type || "hotel");
  const [name, setName] = useState(hotel?.name || "");
  const [city, setCity] = useState(hotel?.city || "طرابلس");
  const [address, setAddress] = useState(hotel?.address || "");
  const [phone, setPhone] = useState(hotel?.phone || "");
  const [stars, setStars] = useState(hotel?.stars ? Number(hotel.stars) : 4);
  const [status, setStatus] = useState<"نشط" | "موقوف">(hotel?.partnership_status === "موقوف" ? "موقوف" : "نشط");
  const [discountPct, setDiscountPct] = useState(hotel?.discount_percentage || 15);
  const [description, setDescription] = useState(hotel?.description || "");
  const [mapsUrl, setMapsUrl] = useState(hotel?.google_maps_url || "");
  const [workingHours, setWorkingHours] = useState(hotel?.working_hours || "خدمة استقبال 24/7 (تسجيل وصول 14:00 - مغادرة 12:00)");
  const [amenities, setAmenities] = useState<string[]>(hotel?.amenities || ["مسبح", "واي فاي", "موقف"]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const [contractStartDate] = useState(hotel?.contract_start_date || todayStr);
  const [contractEndDate, setContractEndDate] = useState(hotel?.contract_end_date || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [p1, setP1] = useState(hotel?.hotel_photo_1 || "/assets/ai_hotel.jpg");
  const [p2, setP2] = useState(hotel?.hotel_photo_2 || "/assets/hotel_resort.jpg");
  const [p3, setP3] = useState(hotel?.hotel_photo_3 || "/assets/dest-tripoli.jpg");
  const [p4, setP4] = useState(hotel?.hotel_photo_4 || "/assets/dest-harbor-coast.jpg");
  const [p5, setP5] = useState(hotel?.hotel_photo_5 || "/assets/dest-ghadames-alleys.jpg");

  const propertyOptions = [
    { id: "hotel", label: "🏨 فندق فاخر", desc: "فنادق مصنفة وضيافة استثنائية" },
    { id: "resort", label: "🏖️ منتجع سياحي", desc: "منتجعات ساحلية واستجمام وشواطئ" },
    { id: "apartment", label: "🏢 شقق فندقية", desc: "أجنحة وشقق مفروشة بخصوصية عائلية" },
    { id: "heritage", label: "⛺ مخيمات صحراوية", desc: "إقامة صحراوية وتخييم أصيل في الواحات والصحراء" },
  ];

  const libyanCities = [
    "طرابلس", "بنغازي", "مصراتة", "الزاوية", "غدامس", "أوباري",
    "سبها", "شحات", "الخمس", "زوارة", "درنة", "طبرق", "البيضاء", "صبراتة"
  ];

  const availableAmenities = [
    { id: "مسبح", icon: "🏊" },
    { id: "واي فاي", icon: "📶" },
    { id: "موقف", icon: "🅿️" },
    { id: "خدمة غرف", icon: "🛎️" },
    { id: "صالة رياضية", icon: "🏋️" },
    { id: "إطلالة بحرية", icon: "🌊" },
    { id: "شاطئ خاص", icon: "🏖️" },
    { id: "مطعم فاخر", icon: "🍽️" },
  ];

  const toggleAmenity = (id: string) => {
    setAmenities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleEnterKeyNext = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest("form");
      if (!form) return;
      const elements = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button[type="button"]'
        )
      );
      const currentIndex = elements.indexOf(e.target as HTMLElement);
      if (currentIndex > -1 && currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = hotelIdInput.trim();
    if (!cleanId) {
      setErrorMsg("يرجى إدخال ترقيم البلدية / رقم القيد البلدي (المفتاح الأساسي ID) لمنع التكرار");
      return;
    }

    // Unique Primary Key Check
    const isDup = existingHotels.some(
      h => (String(h.hotel_id || h.id).trim() === cleanId) && h.id !== hotel?.id
    );
    if (isDup) {
      setErrorMsg(`رقم القيد البلدي (${cleanId}) مسجل مسبقاً لمنشأة إقامة أخرى. ترقيم البلدية فريد وغير مكرر نهائياً.`);
      return;
    }

    // Strict Field Validations
    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg("يرجى إدخال اسم مكان الإقامة الرسمي بدقة (3 أحرف على الأقل)");
      return;
    }
    if (!city.trim() || !address.trim() || address.trim().length < 4) {
      setErrorMsg("يرجى إدخال المدينة والعنوان التفصيلي بدقة");
      return;
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (!phone.trim() || digitsOnly.length < 8) {
      setErrorMsg("يرجى إدخال رقم هاتف اتصال معتمد وصحيح (8 أرقام على الأقل)");
      return;
    }
    if (!contractEndDate) {
      setErrorMsg("يرجى تحديد تاريخ نهاية العقد مع المنشأة");
      return;
    }
    if (contractEndDate < contractStartDate) {
      setErrorMsg("تاريخ نهاية العقد لا يمكن أن يكون قبل تاريخ بداية العقد");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg("يرجى كتابة وصف ونبذة تعريفية وافية عن مكان الإقامة");
      return;
    }
    if (!workingHours.trim()) {
      setErrorMsg("يرجى تحديد أوقات العمل والاستقبال");
      return;
    }
    if (Number(discountPct) < 0 || Number(discountPct) > 100) {
      setErrorMsg("نسبة الخصم يجب أن تكون بين 0% و 100%");
      return;
    }
    if (!p1 || !p2 || !p3 || !p4 || !p5) {
      setErrorMsg("يرجى استكمال رفع الصور الخمسة بالكامل لمكان الإقامة");
      return;
    }

    onSave({
      id: cleanId,
      hotel_id: cleanId,
      name: name.trim(),
      property_type: propertyType,
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      stars: Number(stars),
      partnership_status: status,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
      discount_percentage: Number(discountPct) || 15,
      description: description.trim(),
      google_maps_url: mapsUrl.trim(),
      working_hours: workingHours.trim(),
      amenities,
      hotel_photo_1: p1,
      hotel_photo_2: p2 || p1,
      hotel_photo_3: p3 || p1,
      hotel_photo_4: p4 || p1,
      hotel_photo_5: p5 || p1,
      isNew,
    });
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-3xl">
      <form className="space-y-4 text-right p-1" onSubmit={handleSubmit} onKeyDown={handleEnterKeyNext}>
        {/* Validation Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-xs font-black flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-800 font-black px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs text-[#003580] flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-black text-sm block">🏨 إدارة عقد وبيانات مكان الإقامة:</span>
            <p className="text-[11px] text-blue-900/90 font-medium">
              يبدأ العقد تلقائياً من يوم التسجيل، مع التحقق الإلزامي من كافة المتطلبات وترقيم البلدية الفريد.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#003580] text-white text-[11px] font-black shrink-0">
            خصم {discountPct}% معتمد
          </span>
        </div>

        {/* Municipal ID (Primary Key) */}
        <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🏛️</span>
              <span>رقم القيد البلدي / ترقيم البلدية (المفتاح الأساسي ID) *</span>
            </label>
            <span className="text-[10px] font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-lg">إلزامي لمنع التكرار</span>
          </div>
          <input
            type="text"
            value={hotelIdInput}
            onChange={(e) => {
              setHotelIdInput(e.target.value);
              setErrorMsg(null);
            }}
            disabled={!isNew}
            placeholder="مثال: HTL-TRP-2026 أو 10452..."
            className={`w-full h-11 px-3.5 rounded-xl border text-xs font-black text-right transition ${
              !isNew
                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
            }`}
          />
          <p className="text-[10px] text-amber-800 font-bold">
            {isNew
              ? "⚠️ يتم إدخال ترقيم البلدية يدوياً بواسطة الإدارة ويمثل المفتاح الأساسي لمنع التكرار نهائياً في قاعدة البيانات."
              : "🔒 ترقيم البلدية مسجل كمفتاح أساسي فريد غير قابل للتعديل بعد التثبيت."}
          </p>
        </div>

        {/* Contract Dates & Activity Status */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 block">
              📑 فترة العقد وحالة النشاط بالمنصة:
            </label>
            <span className="text-[10px] font-bold text-slate-500">
              * البداية تلقائياً من يوم التسجيل
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                📅 تاريخ بداية العقد (يوم التسجيل)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contractStartDate || todayStr}
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-800 text-right outline-none cursor-default font-mono select-none"
                />
                <span className="absolute left-2.5 top-2.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black">
                  تلقائي
                </span>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                🏁 تاريخ نهاية العقد <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={contractEndDate}
                onChange={e => {
                  setContractEndDate(e.target.value);
                  setErrorMsg(null);
                }}
                min={contractStartDate}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 text-right outline-none focus:border-[#003580] font-mono focus:ring-1 focus:ring-[#003580]"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                ⚡ حالة المنشأة والعرض بالمنصة
              </label>
              <div className="grid grid-cols-2 gap-1.5 h-10 p-1 bg-slate-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus("نشط")}
                  className={`h-full rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    status === "نشط"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🟢</span>
                  <span>نشط</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("موقوف")}
                  className={`h-full rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    status === "موقوف"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🔴</span>
                  <span>موقوف</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Category Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-800 block">
            ⭐ نوع مكان الإقامة (التصنيف بالمنصة):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {propertyOptions.map((opt) => {
              const isSelected = propertyType === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setPropertyType(opt.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-center space-y-1 select-none ${
                    isSelected
                      ? "border-2 border-[#003580] bg-blue-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-black text-slate-900">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Field label="اسم مكان الإقامة الرسمي *" value={name} onChange={v => { setName(v); setErrorMsg(null); }} />
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-bold text-foreground mb-1 block">المدينة *</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right outline-none focus:border-[#003580] bg-white"
            >
              {libyanCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="sm:col-span-3">
            <label className="text-xs font-bold text-foreground mb-1 block">التصنيف الفندقي</label>
            <select
              value={stars}
              onChange={e => setStars(Number(e.target.value))}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right outline-none focus:border-[#003580] bg-white"
            >
              <option value={5}>⭐⭐⭐⭐⭐ 5 نجوم (فاخر)</option>
              <option value={4}>⭐⭐⭐⭐ 4 نجوم (ممتاز)</option>
              <option value={3}>⭐⭐⭐ 3 نجوم (جيد جداً)</option>
              <option value={2}>⭐⭐ 2 نجوم (اقتصادي)</option>
              <option value={1}>⭐ نجمة واحدة</option>
            </select>
          </div>
        </div>

        <Field label="العنوان التفصيلي وموقع المنشأة *" value={address} onChange={v => { setAddress(v); setErrorMsg(null); }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LibyanPhoneField label="رقم الهاتف للتواصل والواتساب *" value={phone} onChange={v => { setPhone(v); setErrorMsg(null); }} />
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">
              🏷️ نسبة الخصم المقدمة لرواد منصة دلّني (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right outline-none focus:border-[#003580] bg-white font-mono"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>
        </div>

        <Field label="أوقات العمل وتسجيل الوصول والمغادرة *" value={workingHours} onChange={setWorkingHours} />

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            📍 رابط موقع مكان الإقامة على خرائط Google Maps
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mapsUrl}
              onChange={e => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-[#003580] text-right font-mono"
            />
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 h-10 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center shrink-0 hover:bg-blue-700"
              >
                🗺️ فتح ↗
              </a>
            )}
          </div>
        </div>

        {/* Amenities */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 block">
            🛎️ المرافق والخدمات المتاحة:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableAmenities.map(am => {
              const isChecked = amenities.includes(am.id);
              return (
                <button
                  type="button"
                  key={am.id}
                  onClick={() => toggleAmenity(am.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isChecked
                      ? "bg-[#003580] text-white border-[#003580] shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{am.icon}</span>
                  <span>{am.id}</span>
                  {isChecked && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            📝 نبذة تعريفية موجزة ومميزات مكان الإقامة *
          </label>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setErrorMsg(null); }}
            rows={2}
            placeholder="اكتب نبذة تعريفية عن المنشأة، موقعها، الغرف والأجنحة الفاخرة، والإطلالات..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-right outline-none focus:border-[#003580] leading-relaxed"
          />
        </div>

        {/* 5 Photos Section */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 block">
              🖼️ معرض الصور الخمسة لمكان الإقامة (تظهر في الكرت والمعاينة):
            </label>
            <span className="text-[10px] text-slate-500 font-bold">5 صور مطلوبة *</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ImageFilePicker label="الصورة 1 (الواجهة الرئيسية للكرت)" value={p1} onChange={setP1} />
            <ImageFilePicker label="الصورة 2 (الغرف والأجنحة الفندقية)" value={p2} onChange={setP2} />
            <ImageFilePicker label="الصورة 3 (الاستقبال والبهو والمطعم)" value={p3} onChange={setP3} />
            <ImageFilePicker label="الصورة 4 (المرافق والمسابح والخدمات)" value={p4} onChange={setP4} />
          </div>
          <div className="max-w-md mx-auto">
            <ImageFilePicker label="الصورة 5 (الإطلالة الخارجية والحدائق)" value={p5} onChange={setP5} />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-xl border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 h-11 rounded-xl bg-[#003580] hover:bg-blue-900 text-white font-black text-xs shadow-md shadow-blue-950/20 cursor-pointer transition flex items-center gap-1.5"
          >
            <span>حفظ مكان الإقامة بالدليل ✓</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function RestaurantModal({
  title,
  restaurant,
  onClose,
  onSave,
  existingRestaurants = [],
}: {
  title: string;
  restaurant?: Restaurant;
  onClose: () => void;
  onSave: (r: any) => void;
  existingRestaurants?: Restaurant[];
}) {
  const isNew = !restaurant;
  const [facilityIdInput, setFacilityIdInput] = useState(restaurant?.facility_id || restaurant?.id || "");
  const [name, setName] = useState(restaurant?.name || "");
  const [category, setCategory] = useState<string>(restaurant?.category || "traditional");
  const [city, setCity] = useState(restaurant?.city || "طرابلس");
  const [address, setAddress] = useState(restaurant?.address || "");
  const [phone, setPhone] = useState(restaurant?.phone || "");
  const [status, setStatus] = useState<"نشط" | "موقوف">(restaurant?.partnership_status === "موقوف" ? "موقوف" : "نشط");
  const [discountPct, setDiscountPct] = useState(restaurant?.discount_percentage || 20);
  const [workingHours, setWorkingHours] = useState(restaurant?.working_hours || "11:00 ص – 11:30 م");
  const [description, setDescription] = useState(restaurant?.description || "");
  const [mapsUrl, setMapsUrl] = useState(restaurant?.google_maps_url || "");

  const todayStr = new Date().toISOString().slice(0, 10);
  const [contractStartDate] = useState(restaurant?.contract_start_date || todayStr);
  const [contractEndDate, setContractEndDate] = useState(restaurant?.contract_end_date || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const categoryTypeMap: Record<string, string> = {
    traditional: "مأكولات شعبية وتراثية",
    seafood: "مأكولات بحرية وأسماك",
    cafe: "كافيه ومقهى عصري",
    fastfood: "وجبات سريعة وعالمية",
  };

  const availableFeatures = [
    { id: "واي فاي وإنترنت مجاني", icon: "📶" },
    { id: "مواقف سيارات خاصة", icon: "🅿️" },
    { id: "خدمة دفع إلكتروني (بطاقات)", icon: "💳" },
    { id: "جلسات خارجية بالهواء الطلق", icon: "🌿" },
  ];

  const initialFeatures = Array.isArray(restaurant?.features)
    ? restaurant.features
    : typeof restaurant?.features === "string" && restaurant.features.trim()
    ? (restaurant.features as string).split("،").map(s => s.trim())
    : ["واي فاي وإنترنت مجاني", "مواقف سيارات خاصة", "خدمة دفع إلكتروني (بطاقات)", "جلسات خارجية بالهواء الطلق"];

  const [features, setFeatures] = useState<string[]>(initialFeatures);

  const [i1, setI1] = useState(restaurant?.facility_image_1 || "/assets/restaurant-libya.jpg");
  const [i2, setI2] = useState(restaurant?.facility_image_2 || "/assets/ai_food.jpg");
  const [i3, setI3] = useState(restaurant?.facility_image_3 || "/assets/cafe-libya.jpg");
  const [i4, setI4] = useState(restaurant?.facility_image_4 || "/assets/dest-tripoli-medina.jpg");
  const [i5, setI5] = useState(restaurant?.facility_image_5 || "/assets/dest-harbor-coast.jpg");

  const categoryOptions = [
    { id: "traditional", label: "🍲 مطعم تراثي وشعبي", desc: "أكلات ليبية أصيلة (كسكسي، بازين، مبطن)" },
    { id: "seafood", label: "🐟 مأكولات بحرية وأسماك", desc: "أسماك طازجة، جمبري، صيد يومي ومحار" },
    { id: "cafe", label: "☕ كافيه ومقهى عصري", desc: "قهوة مختصة وجلسات هادئة" },
    { id: "fastfood", label: "🍔 وجبات سريعة وعالمية", desc: "برجر، بيتزا، شاورما وأطباق عالمية" },
  ];

  const libyanCities = [
    "طرابلس", "بنغازي", "مصراتة", "الزاوية", "غدامس", "أوباري",
    "سبها", "شحات", "الخمس", "زوارة", "درنة", "طبرق", "البيضاء", "صبراتة"
  ];

  const toggleFeature = (id: string) => {
    setFeatures(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleEnterKeyNext = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest("form");
      if (!form) return;
      const elements = Array.from(
        form.querySelectorAll<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled]), button[type="button"]'
        )
      );
      const currentIndex = elements.indexOf(e.target as HTMLElement);
      if (currentIndex > -1 && currentIndex < elements.length - 1) {
        elements[currentIndex + 1].focus();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = facilityIdInput.trim();
    if (!cleanId) {
      setErrorMsg("يرجى إدخال ترقيم البلدية / رقم القيد البلدي (المفتاح الأساسي ID) لمنع التكرار");
      return;
    }

    // Unique Primary Key Check
    const isDup = existingRestaurants.some(
      r => (String(r.facility_id || r.id).trim() === cleanId) && r.id !== restaurant?.id
    );
    if (isDup) {
      setErrorMsg(`رقم القيد البلدي (${cleanId}) مسجل مسبقاً لمنشأة أخرى. ترقيم البلدية فريد وغير مكرر نهائياً.`);
      return;
    }

    // Strict Field Validations
    if (!name.trim() || name.trim().length < 3) {
      setErrorMsg("يرجى إدخال اسم المطعم أو المقهى بدقة (3 أحرف على الأقل)");
      return;
    }
    if (!city.trim() || !address.trim() || address.trim().length < 4) {
      setErrorMsg("يرجى إدخال المدينة والعنوان التفصيلي بدقة");
      return;
    }
    const digitsOnly = phone.replace(/\D/g, "");
    if (!phone.trim() || digitsOnly.length < 8) {
      setErrorMsg("يرجى إدخال رقم هاتف اتصال معتمد وصحيح (8 أرقام على الأقل)");
      return;
    }
    if (!contractEndDate) {
      setErrorMsg("يرجى تحديد تاريخ نهاية العقد مع المطعم/المقهى");
      return;
    }
    if (contractEndDate < contractStartDate) {
      setErrorMsg("تاريخ نهاية العقد لا يمكن أن يكون قبل تاريخ بداية العقد");
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg("يرجى كتابة نبذة تعريفية ووصف وافٍ لقائمة المأكولات والمشروبات");
      return;
    }
    if (!workingHours.trim()) {
      setErrorMsg("يرجى تحديد أوقات وساعات العمل الرسمية");
      return;
    }
    if (Number(discountPct) < 0 || Number(discountPct) > 100) {
      setErrorMsg("نسبة الخصم يجب أن تكون بين 0% و 100%");
      return;
    }
    if (!i1 || !i2 || !i3 || !i4 || !i5) {
      setErrorMsg("يرجى استكمال رفع الصور الخمسة بالكامل للمطعم أو المقهى");
      return;
    }

    onSave({
      id: cleanId,
      facility_id: cleanId,
      name: name.trim(),
      category,
      type: restaurant?.type || categoryTypeMap[category] || "مطعم وكافيه",
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      discount_percentage: Number(discountPct) || 20,
      working_hours: workingHours.trim(),
      features,
      partnership_status: status,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
      google_maps_url: mapsUrl.trim(),
      description: description.trim(),
      facility_image_1: i1,
      facility_image_2: i2 || i1,
      facility_image_3: i3 || i1,
      facility_image_4: i4 || i1,
      facility_image_5: i5 || i1,
      isNew,
    });
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-3xl">
      <form className="space-y-4 text-right p-1" onSubmit={handleSubmit} onKeyDown={handleEnterKeyNext}>
        {/* Validation Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-red-50 border-2 border-red-300 text-red-800 text-xs font-black flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-200">
            <span className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>{errorMsg}</span>
            </span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-500 hover:text-red-800 font-black px-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Notice Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <span className="font-black text-sm block">🍽️ إدارة عقد وبيانات المطاعم والمقاهي بالدليل:</span>
            <p className="text-[11px] text-amber-900/90 font-medium">
              يبدأ العقد تلقائياً من يوم التسجيل، مع التحقق الإلزامي من كافة المتطلبات وترقيم البلدية الفريد.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-800 text-white text-[11px] font-black shrink-0">
            خصم {discountPct}% لرواد دلّني
          </span>
        </div>

        {/* Municipal ID (Primary Key) */}
        <div className="p-3.5 bg-amber-50/80 rounded-2xl border border-amber-300 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-amber-950 flex items-center gap-1.5">
              <span>🏛️</span>
              <span>رقم القيد البلدي / ترقيم البلدية (المفتاح الأساسي ID) *</span>
            </label>
            <span className="text-[10px] font-black text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-lg">إلزامي لمنع التكرار</span>
          </div>
          <input
            type="text"
            value={facilityIdInput}
            onChange={(e) => {
              setFacilityIdInput(e.target.value);
              setErrorMsg(null);
            }}
            disabled={!isNew}
            placeholder="مثال: RST-TRP-2026 أو 20381..."
            className={`w-full h-11 px-3.5 rounded-xl border text-xs font-black text-right transition ${
              !isNew
                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 border-amber-300 focus:border-amber-600 focus:ring-2 focus:ring-amber-500/20"
            }`}
          />
          <p className="text-[10px] text-amber-800 font-bold">
            {isNew
              ? "⚠️ يتم إدخال ترقيم البلدية يدوياً بواسطة الإدارة ويمثل المفتاح الأساسي لمنع التكرار نهائياً في قاعدة البيانات."
              : "🔒 ترقيم البلدية مسجل كمفتاح أساسي فريد غير قابل للتعديل بعد التثبيت."}
          </p>
        </div>

        {/* Contract Dates & Activity Status */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-800 block">
              📑 فترة العقد وحالة النشاط بالمنصة:
            </label>
            <span className="text-[10px] font-bold text-slate-500">
              * البداية تلقائياً من يوم التسجيل
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                📅 تاريخ بداية العقد (يوم التسجيل)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contractStartDate || todayStr}
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-800 text-right outline-none cursor-default font-mono select-none"
                />
                <span className="absolute left-2.5 top-2.5 text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-black">
                  تلقائي
                </span>
              </div>
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                🏁 تاريخ نهاية العقد <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={contractEndDate}
                onChange={e => {
                  setContractEndDate(e.target.value);
                  setErrorMsg(null);
                }}
                min={contractStartDate}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 text-right outline-none focus:border-amber-600 font-mono focus:ring-1 focus:ring-amber-600"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="text-[11px] font-bold text-slate-700 block mb-1">
                ⚡ حالة المنشأة والعرض بالمنصة
              </label>
              <div className="grid grid-cols-2 gap-1.5 h-10 p-1 bg-slate-200/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStatus("نشط")}
                  className={`h-full rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    status === "نشط"
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🟢</span>
                  <span>نشط</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStatus("موقوف")}
                  className={`h-full rounded-lg text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    status === "موقوف"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>🔴</span>
                  <span>موقوف</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Category Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-800 block">
            🍴 تصنيف ونوع المنشأة (مطعم أو كافيه):
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {categoryOptions.map((opt) => {
              const isSelected = category === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => setCategory(opt.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all text-center space-y-1 select-none ${
                    isSelected
                      ? "border-2 border-amber-600 bg-amber-50/80 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="text-sm font-black text-slate-900">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight">{opt.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Basic Details */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Field label="اسم المطعم أو الكافيه الرسمي *" value={name} onChange={v => { setName(v); setErrorMsg(null); }} />
          </div>
          <div className="sm:col-span-4">
            <label className="text-xs font-bold text-foreground mb-1 block">المدينة *</label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right outline-none focus:border-amber-600 bg-white"
            >
              {libyanCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <Field label="العنوان التفصيلي وموقع المنشأة *" value={address} onChange={v => { setAddress(v); setErrorMsg(null); }} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <LibyanPhoneField label="رقم الهاتف للتواصل والواتساب *" value={phone} onChange={v => { setPhone(v); setErrorMsg(null); }} />
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">
              🏷️ نسبة الخصم المقدمة لرواد منصة دلّني (%) *
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={100}
                value={discountPct}
                onChange={e => setDiscountPct(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-bold text-right outline-none focus:border-amber-600 bg-white font-mono"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>
        </div>

        <Field label="ساعات وأوقات العمل اليومية *" value={workingHours} onChange={setWorkingHours} />

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            📍 رابط موقع المطعم/المقهى على خرائط Google Maps
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={mapsUrl}
              onChange={e => setMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/?q=..."
              className="flex-1 h-10 px-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-amber-600 text-right font-mono"
            />
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 h-10 bg-amber-600 text-white rounded-xl text-xs font-black flex items-center shrink-0 hover:bg-amber-700"
              >
                🗺️ فتح ↗
              </a>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-800 block">
            🌿 الخدمات والمميزات المتاحة:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {availableFeatures.map(f => {
              const isChecked = features.includes(f.id);
              return (
                <button
                  type="button"
                  key={f.id}
                  onClick={() => toggleFeature(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                    isChecked
                      ? "bg-amber-700 text-white border-amber-700 shadow-xs"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <span>{f.icon}</span>
                  <span>{f.id}</span>
                  {isChecked && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            📝 نبذة تعريفية ووصف لقائمة المأكولات والمشروبات *
          </label>
          <textarea
            value={description}
            onChange={e => { setDescription(e.target.value); setErrorMsg(null); }}
            rows={2}
            placeholder="اكتب نبذة عن أصناف الطعام، جودة المكونات، الأجواء العامة، والجلسات..."
            className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-right outline-none focus:border-amber-600 leading-relaxed"
          />
        </div>

        {/* 5 Photos Section */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-slate-900 block">
              🖼️ معرض الصور الخمسة للمنشأة (تظهر في الكرت والمعاينة):
            </label>
            <span className="text-[10px] text-slate-500 font-bold">5 صور مطلوبة *</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ImageFilePicker label="الصورة 1 (الواجهة الرئيسية للكرت)" value={i1} onChange={setI1} />
            <ImageFilePicker label="الصورة 2 (أطباق المأكولات والمشروبات)" value={i2} onChange={setI2} />
            <ImageFilePicker label="الصورة 3 (الجلسات الداخلية والديكور)" value={i3} onChange={setI3} />
            <ImageFilePicker label="الصورة 4 (الجلسات الخارجية أو الإطلالة)" value={i4} onChange={setI4} />
          </div>
          <div className="max-w-md mx-auto">
            <ImageFilePicker label="الصورة 5 (الضيافة والتقديم)" value={i5} onChange={setI5} />
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex gap-2 justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-xl border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50 cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 h-11 rounded-xl bg-gradient-sun text-gold-foreground font-black text-xs shadow-md shadow-amber-900/20 cursor-pointer transition flex items-center gap-1.5"
          >
            <span>حفظ المطعم/المقهى بالدليل ✓</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AttractionModal({ title, attraction, onClose, onSave }: { title: string; attraction?: Attraction; onClose: () => void; onSave: (a: any) => void }) {
  const [name, setName] = useState(attraction?.name || ""); const [city, setCity] = useState(attraction?.city || "الخمس");
  const [category, setCategory] = useState(attraction?.category || "آثار تاريخية"); const [desc, setDesc] = useState(attraction?.description || "");
  const [img, setImg] = useState(attraction?.place_image || "/assets/ai_ruins.jpg");
  const [lat, setLat] = useState(attraction?.latitude ? String(attraction.latitude) : "");
  const [lng, setLng] = useState(attraction?.longitude ? String(attraction.longitude) : "");
  const [mapsUrl, setMapsUrl] = useState(attraction?.google_maps_url || "");

  const genMapUrl = () => { if (lat && lng) setMapsUrl(`https://maps.google.com/?q=${lat},${lng}`); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city) return alert("يرجى كتابة الاسم والمدينة");
    onSave({ ...(attraction ? { id: attraction.id } : {}), name, city, category, description: desc, place_image: img, latitude: lat ? +lat : undefined, longitude: lng ? +lng : undefined, google_maps_url: mapsUrl || undefined });
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={handleSubmit}>
        <Field label="اسم المعلم السياحي" value={name} onChange={setName} />
        <div className="grid grid-cols-2 gap-2">
          <Field label="المدينة" value={city} onChange={setCity} />
          <Field label="التصنيف" value={category} onChange={setCategory} />
        </div>
        <div><label className="text-xs font-bold mb-1 block">الوصف التفصيلي</label>
          <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} className="w-full p-2.5 rounded-xl border text-xs font-semibold text-right" />
        </div>

        {/* Google Maps Section */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-xs font-black text-foreground block">📍 الموقع الجغرافي (Google Maps)</label>
          <div className="grid grid-cols-2 gap-2">
            <Field label="خط العرض (Latitude)" value={lat} onChange={setLat} placeholder="مثال: 32.6381" />
            <Field label="خط الطول (Longitude)" value={lng} onChange={setLng} placeholder="مثال: 14.2936" />
          </div>
          <div className="flex gap-2">
            <input type="text" value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} placeholder="رابط Google Maps أو اضغط توليد تلقائي..." className="flex-1 h-9 px-3 rounded-xl border border-border text-[11px] outline-none focus:border-primary text-right" />
            <button type="button" onClick={genMapUrl} className="px-3 h-9 bg-blue-600 text-white rounded-xl text-xs font-black whitespace-nowrap">🗺️ توليد</button>
          </div>
          {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-600 font-bold hover:underline">🔗 معاينة في خرائط جوجل ↗</a>}
        </div>

        <div className="pt-2 border-t border-border"><ImageFilePicker label="الصورة الرئيسية للمعلم" value={img} onChange={setImg} /></div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ المعلم السياحي</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---- OFFER MODALS ---- */

function DailyOfferModal({
  title,
  offer,
  dailyTrips,
  onClose,
  onSave,
}: {
  title: string;
  offer?: DailyOffer;
  dailyTrips: DailyTrip[];
  onClose: () => void;
  onSave: (o: any) => void;
}) {
  const [tripId, setTripId] = useState(offer?.daily_trip_id || dailyTrips[0]?.id || "");
  const selectedTrip = dailyTrips.find(t => t.id === tripId) || dailyTrips[0];

  const [ot, setOt] = useState(offer?.title_offer || (selectedTrip ? `عرض خاص: ${selectedTrip.title}` : ""));
  const [desc, setDesc] = useState(offer?.description || (selectedTrip ? `خصم حصري ومميز على رحلة ${selectedTrip.title} المنشأة ضمن برنامج دلّني للسياحة اليومية.` : ""));
  const [disc, setDisc] = useState(String(offer?.percent_discount || 15));
  const [img, setImg] = useState(offer?.url_image_offer || selectedTrip?.photo || "");
  const [ds, setDs] = useState(offer?.date_start || new Date().toISOString().slice(0, 10));
  const [de, setDe] = useState(offer?.date_end || "2026-10-30");

  const handleTripChange = (newTripId: string) => {
    setTripId(newTripId);
    const trip = dailyTrips.find(t => t.id === newTripId);
    if (trip) {
      if (!ot || ot.startsWith("عرض خاص:")) {
        setOt(`عرض خاص: ${trip.title}`);
      }
      if (!desc || desc.includes("ضمن برنامج دلّني")) {
        setDesc(`خصم حصري ومميز على رحلة ${trip.title} المنشأة ضمن برنامج دلّني للسياحة اليومية.`);
      }
      if (!img || img === "/assets/hero-leptis.jpg") {
        setImg(trip.photo || "/assets/dest-leptis-theater.jpg");
      }
    }
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-2xl">
      <form
        className="space-y-3.5 text-right"
        onSubmit={(e) => {
          e.preventDefault();
          if (!tripId) {
            alert("يرجى اختيار رحلة يومية منشأة لربط العرض بها.");
            return;
          }
          onSave({
            ...(offer ? { id: offer.id } : {}),
            title_offer: ot,
            description: desc,
            percent_discount: +disc,
            url_image_offer: img,
            daily_trip_id: tripId,
            date_start: ds,
            date_end: de,
          });
        }}
      >
        {/* Notice of binding to created daily trip */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-black text-sm block">🏷️ ربط العرض بالرحلات اليومية المنشأة:</span>
            <p className="text-[11px] text-emerald-800">
              يتم تطبيق العرض الترويجي والخصم على الرحلات اليومية المسجلة مسبقاً في المنصة.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white font-black text-xs">
            {dailyTrips.length} رحلة منشأة
          </span>
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">اختر الرحلة اليومية المنشأة المستهدفة بالعرض *</label>
          <select
            value={tripId}
            onChange={(e) => handleTripChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right bg-white"
          >
            {dailyTrips.length === 0 && <option value="">لا توجد رحلات يومية منشأة حالياً</option>}
            {dailyTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — وجهة: {t.destination || "ليبيا"} — انطلاق: {t.departure_city || "طرابلس"} ({t.price_per_seat} د.ل)
              </option>
            ))}
          </select>
        </div>

        <Field label="عنوان العرض الترويجي" value={ot} onChange={setOt} />
        <div>
          <label className="text-xs font-bold mb-1 block">وصف وتفاصيل العرض</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="w-full p-2.5 rounded-xl border text-xs font-semibold text-right"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="نسبة الخصم % (1-100)" type="number" value={disc} onChange={setDisc} />
          <div className="pt-5 text-xs text-slate-500 font-bold">
            {selectedTrip && (
              <span className="text-emerald-700 font-black">
                السعر بعد الخصم: {Math.round(selectedTrip.price_per_seat * (1 - (Number(disc) || 0) / 100))} د.ل (بدلاً من {selectedTrip.price_per_seat} د.ل)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ بداية العرض" type="date" value={ds} onChange={setDs} />
          <Field label="تاريخ نهاية العرض" type="date" value={de} onChange={setDe} />
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة وبوستر العرض اليومي" value={img} onChange={setImg} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            إلغاء
          </button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">
            حفظ العرض اليومي
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function WeeklyOfferModal({
  title,
  offer,
  weeklyTrips,
  onClose,
  onSave,
}: {
  title: string;
  offer?: WeeklyOffer;
  weeklyTrips: WeeklyTrip[];
  onClose: () => void;
  onSave: (o: any) => void;
}) {
  const [tripId, setTripId] = useState(offer?.weekly_trip_id || weeklyTrips[0]?.id || "");
  const selectedTrip = weeklyTrips.find(t => t.id === tripId) || weeklyTrips[0];

  const [ot, setOt] = useState(offer?.offer_title || (selectedTrip ? `عرض الأسبوع: ${selectedTrip.title}` : ""));
  const [desc, setDesc] = useState(offer?.description || (selectedTrip ? `خصم استثنائي على رحلة ${selectedTrip.title} المنشأة في دلّني شاملة المبيت والجولات.` : ""));
  const [disc, setDisc] = useState(String(offer?.percent_discount || 15));
  const [img, setImg] = useState(offer?.offer_image_url || selectedTrip?.photo || "");
  const [ds, setDs] = useState(offer?.date_start || new Date().toISOString().slice(0, 10));
  const [de, setDe] = useState(offer?.date_end || "2026-10-30");

  const handleTripChange = (newTripId: string) => {
    setTripId(newTripId);
    const trip = weeklyTrips.find(t => t.id === newTripId);
    if (trip) {
      if (!ot || ot.startsWith("عرض الأسبوع:")) {
        setOt(`عرض الأسبوع: ${trip.title}`);
      }
      if (!desc || desc.includes("شاملة المبيت")) {
        setDesc(`خصم استثنائي على رحلة ${trip.title} المنشأة في دلّني شاملة المبيت والجولات.`);
      }
      if (!img || img === "/assets/hero-leptis.jpg") {
        setImg(trip.photo || "/assets/dest-ubari-gaberoun.jpg");
      }
    }
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-2xl">
      <form
        className="space-y-3.5 text-right"
        onSubmit={(e) => {
          e.preventDefault();
          if (!tripId) {
            alert("يرجى اختيار رحلة أسبوعية منشأة لربط العرض بها.");
            return;
          }
          onSave({
            ...(offer ? { id: offer.id } : {}),
            offer_title: ot,
            description: desc,
            percent_discount: +disc,
            offer_image_url: img,
            weekly_trip_id: tripId,
            date_start: ds,
            date_end: de,
          });
        }}
      >
        {/* Notice of binding to created weekly trip */}
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="font-black text-sm block">🗓️ ربط العرض بالرحلات الأسبوعية المنشأة:</span>
            <p className="text-[11px] text-amber-800">
              يتم تطبيق العرض الترويجي والخصم على الرحلات الأسبوعية المسجلة مسبقاً في المنصة.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-700 text-white font-black text-xs">
            {weeklyTrips.length} رحلة منشأة
          </span>
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">اختر الرحلة الأسبوعية المنشأة المستهدفة بالعرض *</label>
          <select
            value={tripId}
            onChange={(e) => handleTripChange(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right bg-white"
          >
            {weeklyTrips.length === 0 && <option value="">لا توجد رحلات أسبوعية منشأة حالياً</option>}
            {weeklyTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — وجهات: {t.destination || (t.destinations ? t.destinations.join(" + ") : "ليبيا")} — ({t.seat_per_price} د.ل)
              </option>
            ))}
          </select>
        </div>

        <Field label="عنوان العرض الأسبوعي" value={ot} onChange={setOt} />
        <div>
          <label className="text-xs font-bold mb-1 block">وصف وتفاصيل العرض</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            className="w-full p-2.5 rounded-xl border text-xs font-semibold text-right"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="نسبة الخصم % (1-100)" type="number" value={disc} onChange={setDisc} />
          <div className="pt-5 text-xs text-slate-500 font-bold">
            {selectedTrip && (
              <span className="text-amber-800 font-black">
                السعر بعد الخصم: {Math.round(selectedTrip.seat_per_price * (1 - (Number(disc) || 0) / 100))} د.ل (بدلاً من {selectedTrip.seat_per_price} د.ل)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ بداية العرض" type="date" value={ds} onChange={setDs} />
          <Field label="تاريخ نهاية العرض" type="date" value={de} onChange={setDe} />
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة وبوستر العرض الأسبوعي" value={img} onChange={setImg} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            إلغاء
          </button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sun text-gold-foreground font-black text-xs shadow-glow">
            حفظ العرض الأسبوعي
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function FacilityOfferModal({ title, offer, restaurants, onClose, onSave }: { title: string; offer?: FacilityOffer; restaurants: Restaurant[]; onClose: () => void; onSave: (o: any) => void }) {
  const [ot, setOt] = useState(offer?.title_offer || ""); const [desc, setDesc] = useState(offer?.description || "");
  const [disc, setDisc] = useState(String(offer?.percent_discount || 10)); const [img, setImg] = useState(offer?.offer_image_url || "");
  const [facId, setFacId] = useState(offer?.facility_id || restaurants[0]?.id || "");
  const [ds, setDs] = useState(offer?.date_start || "2026-08-01"); const [de, setDe] = useState(offer?.date_end || "2026-08-31");
  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={e => { e.preventDefault(); onSave({ ...(offer ? { id: offer.id } : {}), title_offer: ot, description: desc, percent_discount: +disc, offer_image_url: img, facility_id: facId, date_start: ds, date_end: de }); }}>
        <Field label="عنوان عرض المطعم/الكافيه" value={ot} onChange={setOt} />
        <div><label className="text-xs font-bold mb-1 block">الوصف</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border text-xs font-semibold text-right" /></div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="نسبة الخصم %" type="number" value={disc} onChange={setDisc} />
          <div><label className="text-xs font-bold mb-1 block">المطعم/الكافيه</label>
            <select value={facId} onChange={e => setFacId(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right">
              {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ البداية" type="date" value={ds} onChange={setDs} />
          <Field label="تاريخ الانتهاء" type="date" value={de} onChange={setDe} />
        </div>
        <div className="pt-2 border-t border-border"><ImageFilePicker label="صورة عرض المطعم" value={img} onChange={setImg} /></div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ عرض المطعم</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---- SHARED UI COMPONENTS ---- */

function TripImagesFiveManager({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [activeSlot, setActiveSlot] = useState(0);

  // Guarantee 5 slots
  const safeImages = useMemo(() => {
    const arr = [...(images || [])];
    while (arr.length < 5) arr.push("");
    return arr.slice(0, 5);
  }, [images]);

  const updateSlot = (idx: number, val: string) => {
    const updated = [...safeImages];
    updated[idx] = val;
    onChange(updated);
  };

  const handleFileUpload = (idx: number, file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        updateSlot(idx, e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const PRESET_PACKS = [
    {
      name: "🏛️ لبدة الكبرى",
      photos: [
        "/assets/dest-leptis-theater.jpg",
        "/assets/dest-leptis-arch.jpg",
        "/assets/dest-leptis-forum.jpg",
        "/assets/dest-leptis-coast.jpg",
        "/assets/hero-leptis.jpg",
      ],
    },
    {
      name: "🏛️ آثار صبراتة",
      photos: [
        "/assets/dest-sabratha-theater.jpg",
        "/assets/dest-sabratha-coast.jpg",
        "/assets/dest-sabratha-temple.jpg",
        "/assets/dest-sabratha-ruins.jpg",
        "/assets/dest-sabratha.jpg",
      ],
    },
    {
      name: "🏜️ أوباري والبحيرات",
      photos: [
        "/assets/dest-ubari-gaberoun.jpg",
        "/assets/dest-ubari-ummalmaa.jpg",
        "/assets/dest-acacus-arch.jpg",
        "/assets/dest-sahara-dunes.jpg",
        "/assets/dest-ubari.jpg",
      ],
    },
    {
      name: "🌴 واحة غدامس",
      photos: [
        "/assets/dest-ghadames-oasis.jpg",
        "/assets/dest-ghadames-alleys.jpg",
        "/assets/dest-ghadames.jpg",
        "/assets/dest-ksar-desert.jpg",
        "/assets/offer-desert.jpg",
      ],
    },
    {
      name: "⛰️ قورينا وشحات",
      photos: [
        "/assets/dest-cyrene-apollo.jpg",
        "/assets/dest-cyrene.jpg",
        "/assets/dest-cyrene-sanctuary.jpg",
        "/assets/dest-cyrene-panorama.jpg",
        "/assets/dest-jabal-akhdar-valley.jpg",
      ],
    },
    {
      name: "🏰 طرابلس القديمة",
      photos: [
        "/assets/dest-tripoli.jpg",
        "/assets/dest-tripoli-castle.jpg",
        "/assets/dest-tripoli-arch.jpg",
        "/assets/dest-tripoli-medina.jpg",
        "/assets/dest-tripoli-harbor.jpg",
      ],
    },
  ];

  const applyPreset = (photos: string[]) => {
    onChange(photos.slice(0, 5));
  };

  const slotLabels = [
    "صورة 1 (الغلاف الرئيسي للكرت)",
    "صورة 2 (المعالم الرئيسية)",
    "صورة 3 (الطبيعة والاستكشاف)",
    "صورة 4 (الإقامة / الضيافة)",
    "صورة 5 (التفاصيل والأنشطة)",
  ];

  return (
    <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/90 space-y-3 text-right">
      <div className="flex items-center justify-between">
        <div className="font-black text-slate-800 text-xs flex items-center gap-1.5">
          <span>📸</span>
          <span>معرض صور الرحلة (5 صور إلزامية للتنقل بينها في كرت وصفحة الرحلة)</span>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
          {safeImages.filter(Boolean).length}/5 صور جاهزة
        </span>
      </div>

      {/* Quick Preset Packs */}
      <div>
        <label className="text-[11px] font-bold text-slate-500 mb-1 block">
          ⚡ تعبئة سريعة بحزم صور ليبية أصلية جاهزة:
        </label>
        <div className="flex flex-wrap gap-1.5">
          {PRESET_PACKS.map((pack) => (
            <button
              key={pack.name}
              type="button"
              onClick={() => applyPreset(pack.photos)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 text-[10px] font-black transition cursor-pointer shadow-2xs"
            >
              {pack.name}
            </button>
          ))}
        </div>
      </div>

      {/* 5 Thumbnails Strip */}
      <div className="grid grid-cols-5 gap-2">
        {safeImages.map((src, i) => (
          <div
            key={i}
            onClick={() => setActiveSlot(i)}
            className={`relative rounded-xl overflow-hidden border-2 cursor-pointer transition flex flex-col items-center justify-center h-20 bg-white ${
              activeSlot === i
                ? "border-blue-600 shadow-md ring-2 ring-blue-500/20"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            {src ? (
              <img src={src} alt={`صورة ${i + 1}`} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center p-1 text-center">
                <span className="text-sm text-slate-400">📷</span>
                <span className="text-[9px] text-slate-400 font-bold">صورة {i + 1}</span>
              </div>
            )}
            <div className="absolute top-1 right-1 px-1.5 py-0.2 rounded-md bg-black/60 text-white text-[9px] font-black backdrop-blur-xs">
              {i + 1}
            </div>
            {i === 0 && (
              <div className="absolute bottom-0 inset-x-0 bg-blue-600/90 text-white text-[8px] font-black py-0.5 text-center">
                الغلاف
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Slot Editor */}
      <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-black text-slate-800">
            تعديل: <span className="text-blue-700">{slotLabels[activeSlot]}</span>
          </label>
          {safeImages[activeSlot] && (
            <button
              type="button"
              onClick={() => updateSlot(activeSlot, "")}
              className="text-[10px] text-red-600 hover:text-red-700 font-bold cursor-pointer"
            >
              مسح الصورة
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {safeImages[activeSlot] ? (
            <img
              src={safeImages[activeSlot]}
              alt=""
              className="w-14 h-14 rounded-lg object-cover border border-slate-200 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-lg bg-slate-100 border border-dashed border-slate-300 grid place-items-center text-xs text-slate-400 shrink-0">
              فارغ
            </div>
          )}

          <div className="flex-1 space-y-1.5">
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-sea text-white text-xs font-black cursor-pointer hover:opacity-90 transition shadow-xs">
              📁 اختيار ملف من الجهاز
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileUpload(activeSlot, e.target.files?.[0])}
              />
            </label>

            <input
              type="text"
              value={safeImages[activeSlot]}
              onChange={(e) => updateSlot(activeSlot, e.target.value)}
              placeholder="أو اكتب/الصق رابط الصورة أو مسارها..."
              className="w-full h-8 px-2.5 text-xs rounded-lg border border-slate-200 bg-slate-50 outline-none text-right font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ImageFilePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onload = ev => { if (ev.target?.result) onChange(ev.target.result as string); }; r.readAsDataURL(file); }
  };
  return (
    <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1.5 text-right">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-foreground">{label}</label>
        {value && <span className="text-[10px] text-emerald-600 font-bold">✓ تم التحميل</span>}
      </div>
      <div className="flex items-center gap-2">
        {value ? <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-primary/40 shadow-xs flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-muted border border-dashed border-border grid place-items-center text-xs text-muted-foreground flex-shrink-0">📷</div>}
        <div className="flex-1 space-y-1">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-sea text-white text-xs font-black cursor-pointer hover:opacity-90 transition shadow-soft">
            📁 اختيار من الجهاز
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="أو ضع رابط الصورة..." className="w-full h-8 px-2 text-[10px] rounded-lg border border-border bg-white outline-none font-mono text-right" />
        </div>
      </div>
    </div>
  );
}

function ModalShell({ title, children, onClose, maxWidth = "max-w-lg" }: { title: string; children: React.ReactNode; onClose: () => void; maxWidth?: string }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className={`w-full ${maxWidth} bg-white rounded-3xl shadow-glow overflow-hidden my-6`}>
        <div className="p-4 bg-gradient-sea text-white flex justify-between items-center">
          <h3 className="text-base font-black">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-xs transition">✕</button>
        </div>
        <div className="p-5 max-h-[85vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function LibyanPhoneField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    onChange(val);
    setError(val && !/^09\d{8}$/.test(val) ? "يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)" : "");
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input type="tel" pattern="^09\d{8}$" required title="يجب أن يبدأ بـ 09 ويتكون من 10 أرقام" value={value} onChange={e => handleChange(e.target.value)} placeholder="09..." className={`w-full h-10 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${error ? "border-red-500" : "border-border focus:border-primary"}`} />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
      />
    </div>
  );
}
