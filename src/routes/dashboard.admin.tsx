import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { getStoredSession, apiGetAdminDashboard, apiVerifyGuide, apiDeleteGuide, apiCreateDailyTrip, apiUpdateDailyTrip, apiDeleteDailyTrip, apiCreateWeeklyTrip, apiUpdateWeeklyTrip, apiDeleteWeeklyTrip } from "@/lib/api";
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
  id: string; 
  contract_number: string; 
  name: string; 
  company_name?: string;
  phone: string; 
  phone_number?: string;
  address: string; 
  city?: string;
  email: string; 
  pass?: string; 
  password?: string;
  total_vehicles?: number; 
  available_cars?: number; 
  available_vehicles?: number; 
  contract_date?: string; 
  contract_start_date?: string; 
  contract_end_date?: string; 
  status?: "موثق" | "بانتظار" | "مرفوض" | string;
  verification_status?: "موثق" | "بانتظار التوثيق" | "بانتظار" | "مرفوض" | string;
};

type Driver = { 
  driver_license_number: string; 
  full_name: string; 
  phone_number: string; 
  national_id_or_passport?: string; 
  license_date_valid?: string; 
  contract_number?: string; 
  assigned_vehicle_plate?: string; 
  email?: string; 
  company_name?: string; 
  account_status?: "نشط" | "معلق" | "موقوف" | string;
  operational_status?: string;
  experience_years?: number;
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
  company_id?: string; 
  contract_number?: string;
  company_name?: string; 
  vehicle_type: string; 
  capacity: number; 
  seating_capacity?: number;
  daily_rate?: number; 
  status: "جاهزة" | "في رحلة" | "صيانة" | string; 
  vehicle_status?: string;
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
  bus_capacity?: 25 | 50; 
  destination?: string; 
  destination_city?: string;
  departure_city?: string; 
};

type WeeklyTrip = { 
  id: string; 
  weekly_trip_id?: string;
  title: string; 
  trip_title?: string;
  trip_description?: string;
  description?: string;
  start_date: string; 
  end_date: string; 
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
  bus_capacity?: 25 | 50; 
  destinations?: string[]; 
  destination_region?: string;
  departure_city?: string; 
  destination?: string; 
  hotel_id?: string; 
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
  status_order: "قيد الدراسة" | "مؤكدة" | "مرفوضة من الأدمن" | "ملغية" | string; 
};

type Hotel = { id: string; name: string; city: string; address: string; phone: string; stars: number; bookings_count: number; rating_avg: number; partnership_status: "نشط" | "معلق" | "موقوف"; hotel_photo_1: string; hotel_photo_2: string; hotel_photo_3: string; hotel_photo_4: string; hotel_photo_5: string; description?: string; google_maps_url?: string; working_hours?: string };
type Restaurant = { id: string; name: string; type: string; city: string; address: string; phone: string; rating_avg: number; facility_image_1: string; facility_image_2: string; facility_image_3: string; facility_image_4: string; facility_image_5: string; description?: string; google_maps_url?: string; working_hours?: string };
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

  /* ---- STATE DATA (1:1 with DelniDB schema) ---- */
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [dailyTrips, setDailyTrips] = useState<DailyTrip[]>([]);
  const [weeklyTrips, setWeeklyTrips] = useState<WeeklyTrip[]>([]);
  const [privateTrips, setPrivateTrips] = useState<PrivateTripRequest[]>([]);
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
    setCompanies([...companies, { contract_number: c.contract_number, status: c.status || "موثق", contract_end_date: c.contract_end_date || "", available_cars: c.available_cars || 0, ...c }]);
    setShowAddCompany(false);
  };
  const handleUpdateCompany = (updated: Company) => { setCompanies(companies.map(c => c.contract_number === updated.contract_number ? updated : c)); setEditingCompany(null); };
  const handleVerifyGuide = async (lic: string, status: "موثق" | "مرفوض") => {
    setGuides(guides.map(g => g.license_number === lic ? { ...g, verification_status: status } : g));
    setViewingGuide(null);
    try {
      await apiVerifyGuide(lic, status);
    } catch {}
  };

  const handleDeleteGuide = async (lic: string) => {
    if (!confirm(`هل أنت متأكد من حذف المرشد السياحي (رخصة: ${lic}) نهائياً من قاعدة البيانات؟`)) return;
    try {
      const res = await apiDeleteGuide(lic);
      setGuides(prev => prev.filter(g => g.license_number !== lic));
      alert(res.message || "تم حذف المرشد السياحي بنجاح من قاعدة البيانات");
    } catch (err: any) {
      alert("حدث خطأ أثناء حذف المرشد: " + (err.message || "فشلت العملية"));
    }
  };

  // Fetch live guides and admin data from DelniDB
  useEffect(() => {
    async function fetchAdminData() {
      const res = await apiGetAdminDashboard();
      if (!res) return;

      if (res.guides) {
        const dbGuides: Guide[] = res.guides.map((g: any) => ({
          license_number: g.license_number,
          full_name: g.full_name,
          title: g.title || "",
          avatar: g.avatar || "",
          phone_number: g.phone_number,
          years_of_experience: Number(g.years_of_experience) || 2,
          certificate: g.certificate || "ترخيص رسمي صادر من وزارة السياحة",
          certificate_name: g.certificate_name,
          digital_certificate_file: g.digital_certificate_file,
          bio: g.bio || "",
          speaks_english: Boolean(g.speaks_english),
          speaks_french: Boolean(g.speaks_french),
          speaks_italian: Boolean(g.speaks_italian),
          verification_status: g.verification_status || "بانتظار التوثيق",
          email: g.email,
          daily_rate: Number(g.price_per_day) || 150,
          price_per_day: Number(g.price_per_day) || 150,
          primaryRegion: g.primaryRegion || "tripoli",
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
          is_active: d.is_active !== false,
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
    }
    fetchAdminData();
  }, []);

  const handleCreateTrip = async (type: "daily" | "weekly", data: any) => {
    try {
      const cleanGuideLic = data.guide_license_number?.trim() || data.guide_license?.trim() || null;
      if (type === "daily") {
        const payload = {
          trip_title: data.trip_title || data.title,
          description: data.description || "",
          price_per_seat: Number(data.price_per_seat) || 100,
          departure_city: data.departure_city || "طرابلس",
          destination_city: data.destination || data.destination_city || "المعلم الأثري",
          max_capacity: Number(data.max_capacity) || 25,
          recurring_days: data.recurring_days || "السبت,الثلاثاء",
          guide_license_number: cleanGuideLic,
          photo: data.photo || "/assets/dest-leptis.jpg",
          activities: data.activities || null,
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
            bookings_count: 0,
            rating_avg: 5.0,
            is_active: true,
          },
          ...prev,
        ]);
        alert("تم حفظ الرحلة اليومية بنجاح في قاعدة البيانات!");
      } else {
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
          photo: data.photo || "/assets/dest-ubari.jpg",
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
            bookings_count: 0,
            rating_avg: 5.0,
            is_active: true,
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
      const payload = {
        trip_title: updated.trip_title || updated.title,
        description: updated.description || "",
        price_per_seat: Number(updated.price_per_seat) || 100,
        departure_city: updated.departure_city || "طرابلس",
        destination_city: updated.destination || updated.destination_city || "المعلم الأثري",
        max_capacity: Number(updated.max_capacity) || 25,
        recurring_days: Array.isArray(updated.recurring_days) ? updated.recurring_days.join(",") : (updated.recurring_days || "السبت,الثلاثاء"),
        guide_license_number: updated.guide_license_number || updated.guide_license || null,
        photo: updated.photo || "/assets/dest-leptis.jpg",
        activities: Array.isArray((updated as any).activities) ? (updated as any).activities.join(" • ") : ((updated as any).activities || null),
      };
      const res = await apiUpdateDailyTrip(tripId, payload);
      if (res && res.status === "success") {
        setDailyTrips(dailyTrips.map(d => (d.daily_trip_id || d.id) === tripId ? { ...d, ...updated, ...res.trip } : d));
        alert("تم تحديث الرحلة اليومية بنجاح في قاعدة البيانات!");
      } else {
        alert("تنبيه: " + (res?.message || "تعذر حفظ التعديل في السيرفر"));
        setDailyTrips(dailyTrips.map(d => (d.daily_trip_id || d.id) === tripId ? updated : d));
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
      const payload = {
        trip_title: updated.trip_title || updated.title,
        trip_description: updated.trip_description || updated.description || "",
        seat_per_price: Number(updated.seat_per_price) || 1200,
        departure_city: updated.departure_city || "طرابلس",
        destination_region: updated.destination || updated.destination_region || "الصحراء",
        max_capacity: Number(updated.max_capacity) || 25,
        start_date: updated.start_date || undefined,
        end_date: updated.end_date || undefined,
        guide_license_number: updated.guide_license_number || updated.guide_license || null,
        photo: updated.photo || "/assets/dest-ubari.jpg",
      };
      const res = await apiUpdateWeeklyTrip(tripId, payload);
      if (res && res.status === "success") {
        setWeeklyTrips(weeklyTrips.map(w => (w.weekly_trip_id || w.id) === tripId ? { ...w, ...updated, ...res.trip } : w));
        alert("تم تحديث الرحلة الأسبوعية بنجاح في قاعدة البيانات!");
      } else {
        alert("تنبيه: " + (res?.message || "تعذر حفظ التعديل في السيرفر"));
        setWeeklyTrips(weeklyTrips.map(w => (w.weekly_trip_id || w.id) === tripId ? updated : w));
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
  const handleSavePrivate = (id: string, status: "مؤكدة" | "مرفوضة من الأدمن", price?: number, plan?: string, guide?: string, vehicle?: string) => {
    setPrivateTrips(privateTrips.map(p => p.private_trip_id === id ? { ...p, status_order: status, quoted_price: price, admin_itinerary_plan: plan, assigned_guide: guide, assigned_vehicle: vehicle } : p));
    setEvaluatingPrivateTrip(null);
  };
  const handleAddPrivateTrip = (p: any) => { setPrivateTrips([...privateTrips, p]); setShowAddPrivateTrip(false); };
  const handleDeletePrivate = (id: string) => { if (confirm("هل تريد حذف طلب الرحلة الخاصة؟")) setPrivateTrips(privateTrips.filter(p => p.private_trip_id !== id)); };
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
    } catch {}

    fetch("http://127.0.0.1:8000/api/hotels")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map((item: any) => ({
            id: item.hotel_id,
            name: item.hotel_name,
            city: item.city,
            address: item.address_details,
            phone: item.phone_number,
            stars: item.star_rating,
            bookings_count: 0,
            rating_avg: 5.0,
            partnership_status: item.partnership_status || "نشط",
            hotel_photo_1: item.hotel_photo_1 || "/assets/ai_city.jpg",
            hotel_photo_2: item.hotel_photo_2 || "/assets/ai_city.jpg",
            hotel_photo_3: item.hotel_photo_3 || "/assets/ai_city.jpg",
            hotel_photo_4: item.hotel_photo_4 || "/assets/ai_city.jpg",
            hotel_photo_5: item.hotel_photo_5 || "/assets/ai_city.jpg",
          }));
          setHotels((prev) => {
            const ids = new Set(mapped.map((m) => m.id));
            return [...mapped, ...prev.filter((x) => !ids.has(x.id))];
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAddHotel = (h: any) => {
    const hotelId = `HTL-00${hotels.length + 1}`;
    const newHotelObj = { id: hotelId, bookings_count: 0, rating_avg: 5.0, ...h };
    setHotels((prev) => [...prev, newHotelObj]);
    setShowAddHotel(false);

    fetch("http://127.0.0.1:8000/api/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotel_id: hotelId,
        hotel_name: h.name,
        city: h.city || "طرابلس",
        address_details: h.address || "العنوان الرئيسي",
        phone_number: h.phone || "0910000000",
        star_rating: parseInt(h.stars, 10) || 4,
        partnership_status: "نشط",
        property_type: "فندق",
        hotel_photo_1: h.hotel_photo_1 || "/assets/ai_city.jpg",
      }),
    }).catch(() => {});
  };
  const handleUpdateHotel = (h: Hotel) => { setHotels(hotels.map(x => x.id === h.id ? h : x)); setEditingHotel(null); };
  const handleDeleteHotel = (id: string) => { if (confirm("هل تريد حذف الفندق؟")) setHotels(hotels.filter(h => h.id !== id)); };
  const handleAddRestaurant = (r: any) => {
    const newRest = { id: `R-0${restaurants.length + 1}`, rating_avg: 5.0, ...r };
    setRestaurants((prev) => [newRest, ...prev]);
    setShowAddRestaurant(false);

    try {
      const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
      localStorage.setItem("dalni_restaurants", JSON.stringify([newRest, ...storedRests]));
    } catch {}

    fetch("http://127.0.0.1:8000/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        facility_id: newRest.id,
        facility_name: r.name,
        facility_type: r.type || "مأكولات شعبية",
        city: r.city || "طرابلس",
        address_details: r.address || "العنوان الرئيسي",
        phone_number: r.phone || "0910000000",
        description: r.description || "",
        google_maps_url: r.google_maps_url || "",
        working_hours: r.working_hours || "",
        facility_image_1: r.facility_image_1 || "/assets/ai_food.jpg",
      }),
    }).catch(() => {});
  };
  const handleUpdateRestaurant = (r: Restaurant) => {
    setRestaurants(restaurants.map(x => x.id === r.id ? r : x));
    setEditingRestaurant(null);
    try {
      const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
      const updated = storedRests.map((item: any) => item.id === r.id ? { ...item, ...r } : item);
      localStorage.setItem("dalni_restaurants", JSON.stringify(updated));
    } catch {}
  };
  const handleDeleteRestaurant = (id: string) => {
    if (confirm("هل تريد حذف المطعم؟")) {
      setRestaurants(restaurants.filter(r => r.id !== id));
      try {
        const storedRests = JSON.parse(localStorage.getItem("dalni_restaurants") || "[]");
        localStorage.setItem("dalni_restaurants", JSON.stringify(storedRests.filter((r: any) => r.id !== id)));
      } catch {}
    }
  };
  const handleAddAttraction = (a: any) => { setAttractions([...attractions, { id: `A-0${attractions.length + 1}`, visitors_count: 0, ...a }]); setShowAddAttraction(false); };
  const handleUpdateAttraction = (a: Attraction) => { setAttractions(attractions.map(x => x.id === a.id ? a : x)); setEditingAttraction(null); };
  const handleDeleteAttraction = (id: string) => { if (confirm("هل تريد حذف المعلم السياحي؟")) setAttractions(attractions.filter(a => a.id !== id)); };
  const handleReplyTicket = (ticketId: string, reply: string) => { setTickets(tickets.map(t => t.id === ticketId ? { ...t, reply, status: "تم الرد" } : t)); };
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
  // Bot
  const handleBotSend = () => {
    if (!botInput.trim() || !activeChatId) return;
    const now = new Date().toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" });
    setChatSessions(prev => prev.map(s => {
      if (s.id !== activeChatId) return s;
      const msg: ChatMessage = { id: `m${s.messages.length + 1}`, from: "admin", text: botInput, time: now };
      return { ...s, messages: [...s.messages, msg], last_message: botInput };
    }));
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
                <th className="pb-3 font-bold">رقم العقد</th><th className="pb-3 font-bold">اسم الشركة</th><th className="pb-3 font-bold">الهاتف</th><th className="pb-3 font-bold">الأسطول</th><th className="pb-3 font-bold">الحالة</th><th className="pb-3 font-bold">إجراءات</th>
              </tr></thead>
              <tbody className="divide-y divide-border">
                {companies.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 font-mono text-xs font-bold">{c.contract_number}</td>
                    <td className="py-3 font-bold text-foreground">{c.name}</td>
                    <td className="py-3 text-muted-foreground">{c.phone}</td>
                    <td className="py-3 font-bold">{c.total_vehicles} مركبة</td>
                    <td className="py-3"><Badge tone={c.status === "موثق" ? "green" : "sun"}>{c.status}</Badge></td>
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
              متابعة مباشرة لمدفوعات السياح وحالة الحضور والتأكيد وفق جداول قاعدة بيانات DelniDB (bookings_daily و bookings_weekly).
            </div>
          </div>

          {/* Daily Trips Bookings */}
          <SectionCard title="🎟️ حجوزات الرحلات اليومية (bookings_daily)">
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
          <SectionCard title="🗓️ حجوزات الرحلات الأسبوعية (bookings_weekly)">
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
        <SectionCard title="إدارة الرحلات الخاصة VIP">
          <div className="space-y-4 text-right">
            {privateTrips.map((pt) => (
              <div key={pt.private_trip_id} className="p-5 rounded-2xl border border-border bg-white space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-foreground text-base">{pt.customer_name} ({pt.customer_phone})</h3>
                  <Badge tone={pt.status_order === "مؤكدة" ? "green" : "sun"}>{pt.status_order}</Badge>
                </div>
                <p className="text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl">" {pt.customer_description} "</p>
                <div className="flex gap-4 text-xs font-bold text-muted-foreground">
                  <span>📅 {pt.preferred_start_date}</span>
                  <span>⏱️ {pt.duration_days} أيام</span>
                  <span>👥 {pt.number_of_companions} رفيق</span>
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => handleDeletePrivate(pt.private_trip_id)} className="px-4 py-1.5 border border-red-200 text-red-600 rounded-xl text-xs font-black">حذف</button>
                  <button onClick={() => setEvaluatingPrivateTrip(pt)} className="px-4 py-1.5 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow">تقييم وتحديد السعر والحافلة والمرشد</button>
                </div>
              </div>
            ))}
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

          <SectionCard title="🏨 دليل الفنادق وأماكن الإقامة (دليل تعريفي — نبذة وساعات عمل وخرائط و5 صور)" action={<button onClick={() => setShowAddHotel(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">+ إضافة فندق بالدليل</button>}>
            <div className="grid md:grid-cols-2 gap-4">
              {hotels.map((h) => (
                <div key={h.id} className="p-4 rounded-2xl border border-border bg-white space-y-3 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-foreground text-base">{h.name}</h4>
                      <div className="text-xs font-bold text-gold-foreground mt-0.5">{"⭐".repeat(h.stars)} · ⭐ {h.rating_avg} ({h.bookings_count} زيارة)</div>
                      <div className="text-xs text-muted-foreground mt-0.5 font-semibold">📍 {h.city} — {h.address}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <Badge tone="green">{h.partnership_status}</Badge>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-black border border-slate-200">
                        دليل تعريفي
                      </span>
                    </div>
                  </div>

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
              ))}
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
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-black border border-amber-200">
                      دليل تعريفي
                    </span>
                  </div>

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
      {showAddCompany && <AddCompanyModal onClose={() => setShowAddCompany(false)} onAdd={handleAddCompany} />}
      {editingCompany && <EditCompanyModal company={editingCompany} onClose={() => setEditingCompany(null)} onUpdate={handleUpdateCompany} />}
      {viewingGuide && <GuideVerificationModal guide={viewingGuide} onClose={() => setViewingGuide(null)} onVerify={handleVerifyGuide} />}
      {showAddTrip && <CreateTripModal type={showAddTrip} guides={guides} vehicles={vehicles} hotels={hotels} onClose={() => setShowAddTrip(null)} onCreate={handleCreateTrip} />}
      {editingDailyTrip && <DailyTripEditModal trip={editingDailyTrip} guides={guides} vehicles={vehicles} onClose={() => setEditingDailyTrip(null)} onSave={handleUpdateDailyTrip} />}
      {editingWeeklyTrip && <WeeklyTripEditModal trip={editingWeeklyTrip} guides={guides} vehicles={vehicles} hotels={hotels} onClose={() => setEditingWeeklyTrip(null)} onSave={handleUpdateWeeklyTrip} />}
      {evaluatingPrivateTrip && <EvaluatePrivateTripModal trip={evaluatingPrivateTrip} guides={guides} vehicles={vehicles} onClose={() => setEvaluatingPrivateTrip(null)} onSave={handleSavePrivate} />}
      {showAddHotel && <HotelModal title="إضافة فندق جديد" onClose={() => setShowAddHotel(false)} onSave={handleAddHotel} />}
      {editingHotel && <HotelModal title={`تعديل: ${editingHotel.name}`} hotel={editingHotel} onClose={() => setEditingHotel(null)} onSave={handleUpdateHotel} />}
      {showAddRestaurant && <RestaurantModal title="إضافة مطعم/مقهى جديد" onClose={() => setShowAddRestaurant(false)} onSave={handleAddRestaurant} />}
      {editingRestaurant && <RestaurantModal title={`تعديل: ${editingRestaurant.name}`} restaurant={editingRestaurant} onClose={() => setEditingRestaurant(null)} onSave={handleUpdateRestaurant} />}
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

function AddCompanyModal({ onClose, onAdd }: { onClose: () => void; onAdd: (c: any) => void }) {
  const [contractNo] = useState(`CN-2026-${Math.floor(10 + Math.random() * 90)}`);
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [address, setAddress] = useState("");
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [vehiclesCount, setVehiclesCount] = useState(5);
  const [availableCars, setAvailableCars] = useState(0);
  const [contractEndDate, setContractEndDate] = useState("");
  const [companyStatus, setCompanyStatus] = useState("موثق");
  return (
    <ModalShell title="إضافة شركة نقل سياحي جديدة" onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={(e) => { e.preventDefault(); onAdd({ contract_number: contractNo, name, phone, address, email, pass, total_vehicles: vehiclesCount, available_cars: availableCars, contract_date: new Date().toISOString().split("T")[0], contract_end_date: contractEndDate, status: companyStatus }); }}>
        <Field label="رقم العقد (تلقائي)" value={contractNo} onChange={() => {}} />
        <Field label="اسم شركة النقل" value={name} onChange={setName} />
        <LibyanPhoneField label="الهاتف" value={phone} onChange={setPhone} />
        <Field label="العنوان" value={address} onChange={setAddress} />
        <Field label="البريد الإلكتروني" type="email" value={email} onChange={setEmail} />
        <Field label="كلمة المرور" type="password" value={pass} onChange={setPass} />
        <Field label="عدد مركبات الأسطول" type="number" value={String(vehiclesCount)} onChange={v => setVehiclesCount(Number(v))} />
        <Field label="عدد السيارات المتاحة" type="number" value={String(availableCars)} onChange={v => setAvailableCars(Number(v))} />
        <Field label="تاريخ انتهاء التعاقد" type="date" value={contractEndDate} onChange={setContractEndDate} />
        <div className="mb-2">
          <label className="text-xs font-bold block mb-1">حالة اعتماد الشركة</label>
          <select value={companyStatus} onChange={e => setCompanyStatus(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right">
            <option value="موثق">موثق</option>
            <option value="بانتظار">بانتظار</option>
            <option value="مرفوض">مرفوض</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ الشركة</button>
        </div>
      </form>
    </ModalShell>
  );
}

function EditCompanyModal({ company, onClose, onUpdate }: { company: Company; onClose: () => void; onUpdate: (c: Company) => void }) {
  const [name, setName] = useState(company.company_name || company.name || "");
  const [phone, setPhone] = useState(company.phone_number || company.phone || "");
  const [address, setAddress] = useState(company.address || "");
  const [status, setStatus] = useState(company.verification_status || company.status || "موثق");
  return (
    <ModalShell title={`تعديل شركة: ${company.company_name || company.name || ""}`} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={(e) => { e.preventDefault(); onUpdate({ ...company, name, phone, address, status }); }}>
        <Field label="اسم الشركة" value={name} onChange={setName} />
        <LibyanPhoneField label="الهاتف" value={phone} onChange={setPhone} />
        <Field label="العنوان" value={address} onChange={setAddress} />
        <div><label className="text-xs font-bold mb-1 block">الحالة</label>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right">
            <option value="موثق">موثق</option><option value="بانتظار">بانتظار</option><option value="مرفوض">مرفوض</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ التعديلات</button>
        </div>
      </form>
    </ModalShell>
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
            راجع الوثيقة المرفوعة وتأكد من صحة رقم الترخيص والاسم. عند الضغط على <b>[قبول واعتماد المرشد]</b>، يتغير حسابه إلى 'موثق' فوراً في قاعدة البيانات ويصبح نشطاً في المنصة. عند الضغط على <b>[رفض الطلب]</b>، يُرفض الحساب.
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

function CreateTripModal({
  type,
  guides,
  vehicles,
  hotels,
  onClose,
  onCreate,
}: {
  type: "daily" | "weekly";
  guides: Guide[];
  vehicles: Vehicle[];
  hotels: Hotel[];
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
  const [busCapacity, setBusCapacity] = useState<25 | 50>(isDaily ? 50 : 25);
  const [guideLic, setGuideLic] = useState(guides[0]?.license_number || "");
  const [selVehicles, setSelVehicles] = useState<string[]>(vehicles[0]?.plate_number ? [vehicles[0].plate_number] : []);
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-09-06");
  const [photo, setPhoto] = useState(isDaily ? "/assets/ai_ruins.jpg" : "/assets/ai_ghadames.jpg");
  const [isActive, setIsActive] = useState(true);
  const [hotelId, setHotelId] = useState("");

  // Daily Trips schedule: MUST be exactly 2 days in a week
  const [recurringDays, setRecurringDays] = useState<string[]>(["الأحد", "الأربعاء"]);

  // Weekly Trips schedule: MUST be exactly 1 day in a week
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
        // Replace oldest or keep max 2
        setRecurringDays([recurringDays[1], day]);
      } else {
        setRecurringDays([...recurringDays, day]);
      }
    }
  };

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => g.verification_status !== "مرفوض");
  }, [guides]);


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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || title.trim().length < 4) {
      alert("يرجى إدخال عنوان واضح وشامل للرحلة (٤ أحرف على الأقل).");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      alert("يرجى إدخال سعر صحيح لمقعد الرحلة (أكبر من 0 د.ل).");
      return;
    }
    if (isDaily && recurringDays.length !== 2) {
      alert("تنبيه: الرحلات اليومية يجب أن تكون يومين بالضبط في الأسبوع (مثلاً: الأحد والأربعاء)!");
      return;
    }
    if (!isDaily && !weeklyDay) {
      alert("تنبيه: الرحلات الأسبوعية يجب تحديد يوم انطلاق أسبوعي واحد لها!");
      return;
    }
    if (!isDaily && multiDestinations.length === 0) {
      alert("تنبيه: يجب اختيار وجهة سياحية واحدة على الأقل في الرحلات الأسبوعية!");
      return;
    }

    const base = {
      daily_trip_id: `DT-${100 + Math.floor(Math.random() * 890 + 10)}`,
      weekly_trip_id: `WT-${200 + Math.floor(Math.random() * 790 + 10)}`,
      trip_title: title.trim(),
      title: title.trim(),
      description: desc,
      max_capacity: busCapacity,
      available_seats: busCapacity,
      bus_capacity: busCapacity,
      guide_license_number: guideLic,
      guide_license: guideLic,
      vehicle_plates: selVehicles,
      is_active: isActive,
      photo,
      departure_city: departureCity,
      activities: activities.trim() || null,
    };

    if (isDaily) {
      onCreate("daily", {
        ...base,
        destination,
        destination_city: destination,
        price_per_seat: +price,
        recurring_days: recurringDays.join(","),
        recurring_days_list: recurringDays,
      });
    } else {
      onCreate("weekly", {
        ...base,
        destinations: multiDestinations,
        destination: multiDestinations.join(" + "),
        seat_per_price: +price,
        start_date: startDate,
        end_date: endDate,
        hotel_id: hotelId,
        weekly_day: weeklyDay,
        trip_description: desc,
      });
    }
  };

  const selectedGuideObj = guides.find((g) => g.license_number === guideLic);

  return (
    <ModalShell
      title={
        isDaily
          ? "إنشاء رحلة يومية جديدة (يومان في الأسبوع — حافلة 25 أو 50 راكب)"
          : "إنشاء رحلة أسبوعية جديدة (يوم واحد في الأسبوع — حافلة 25 أو 50 راكب)"
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
              <select
                value={isActive ? "true" : "false"}
                onChange={(e) => setIsActive(e.target.value === "true")}
                className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right"
              >
                <option value="true">نشطة ومعروضة للحجز</option>
                <option value="false">موقوفة ومخفية مؤقتاً</option>
              </select>
            </div>
          </div>
        </div>

        {/* 2. Days Schedule: Daily = 2 Days / Weekly = 1 Day */}
        <div className="p-3.5 bg-blue-50/70 rounded-2xl border border-blue-200 space-y-3">
          {isDaily ? (
            <>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="font-black text-blue-900 text-sm flex items-center gap-1.5">
                    <span>📅</span>
                    <span>اختيار يومي الانطلاق للرحلة</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                    recurringDays.length === 2 ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                  }`}>
                    {recurringDays.length === 2 ? "✓ تم الاختيار" : "اختر يومين"}
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {allWeekDays.map((d) => {
                    const isSel = recurringDays.includes(d);
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => toggleDailyDay(d)}
                        className={`py-2 px-1 rounded-xl text-xs font-black border transition cursor-pointer flex flex-col items-center gap-1 ${
                          isSel
                            ? "bg-blue-600 text-white border-blue-700 shadow-md scale-105"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>{isSel ? "✓" : ""}</span>
                        <span>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                  <span>🗓️</span>
                  <span>جدول الرحلة الأسبوعية: يوم واحد في الأسبوع</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black">
                  يوم الانطلاق: {weeklyDay}
                </span>
              </div>

              {/* 1 Day Selector Chips */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {allWeekDays.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setWeeklyDay(d)}
                    className={`py-2 px-1 rounded-xl text-xs font-black border transition cursor-pointer flex flex-col items-center gap-1 ${
                      weeklyDay === d
                        ? "bg-amber-600 text-white border-amber-700 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <span>{weeklyDay === d ? "✓" : "○"}</span>
                    <span>{d}</span>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-blue-100">
                <Field label="تاريخ الانطلاق المعتمد" type="date" value={startDate} onChange={handleStartDateChange} />
                <Field label="تاريخ العودة والانتهاء" type="date" value={endDate} onChange={setEndDate} />
              </div>
            </>
          )}
        </div>

        {/* 3. Bus Capacity & Driver Fleet: 25 or 50 Passengers */}
        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-black text-emerald-900 text-sm flex items-center gap-1.5">
              <span>🚌</span>
              <span>سعة الحافلة المتاحة (25 أو 50 راكب حسب السائق والمركبة)</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[11px] font-black">
              السعة: {busCapacity} راكب
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => {
                setBusCapacity(25);
                setSelVehicles(["طرابلس 8291"]);
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                busCapacity === 25
                  ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white/60 border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div className="text-3xl">🚐</div>
              <div>
                <div className="font-black text-sm text-slate-900">25 راكب</div>
                <div className="text-[11px] text-slate-500 font-bold">ميني باص سياحي مريح</div>
                <div className="text-[10px] text-emerald-700 font-black">سائق: مفتاح الفزاني</div>
              </div>
            </div>

            <div
              onClick={() => {
                setBusCapacity(50);
                setSelVehicles(["طرابلس 4517"]);
              }}
              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 ${
                busCapacity === 50
                  ? "bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20"
                  : "bg-white/60 border-slate-200 hover:border-emerald-300"
              }`}
            >
              <div className="text-3xl">🚍</div>
              <div>
                <div className="font-black text-sm text-slate-900">50 راكب</div>
                <div className="text-[11px] text-slate-500 font-bold">حافلة سياحية كبرى VIP</div>
                <div className="text-[10px] text-emerald-700 font-black">سائق: علي التارقي</div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-100">
            <VehiclesMultiSelect vehicles={vehicles} selected={selVehicles} onChange={setSelVehicles} />
          </div>
        </div>

        {/* 4. Simple Guide Assignment */}
        <div className="p-3.5 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2">
          <div className="font-black text-amber-900 text-sm flex items-center gap-1.5 mb-1">
            <span>🧭</span>
            <span>تعيين المرشد السياحي للرحلة</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {filteredGuidesList.length === 0 && (
              <div className="col-span-full text-center text-xs text-amber-700 py-3 font-bold bg-amber-100/50 rounded-xl">
                لا يوجد مرشدين حقيقيين متاحين في قاعدة البيانات.
              </div>
            )}
            {filteredGuidesList.map((g) => (
              <div
                key={g.license_number}
                onClick={() => setGuideLic(prev => prev === g.license_number ? "" : g.license_number)}
                className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                  guideLic === g.license_number
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
                    {guideLic === g.license_number && <div className="text-amber-600 text-xs">✅</div>}
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
          
          {selectedGuideObj && (
            <div className="flex items-center gap-2 mt-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm overflow-hidden shrink-0 border border-emerald-300">
                {selectedGuideObj.avatar ? <img src={selectedGuideObj.avatar} alt={selectedGuideObj.full_name} className="w-full h-full object-cover" /> : "👤"}
              </div>
              <div>
                <div className="text-xs font-black text-emerald-900">تم تعيين: {selectedGuideObj.full_name} {selectedGuideObj.title && `(${selectedGuideObj.title})`}</div>
                <div className="text-[10px] text-emerald-700 font-semibold">رقم الرخصة: {selectedGuideObj.license_number} | الأجر اليومي: {selectedGuideObj.daily_rate || selectedGuideObj.price_per_day || 150} د.ل</div>
              </div>
            </div>
          )}
        </div>

        {/* Hotel Selection for Weekly Trips */}
        {!isDaily && (
          <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-2">
            <div className="font-black text-sky-900 text-sm flex items-center gap-1.5 mb-1">
              <span>🏨</span>
              <span>تعيين فندق المبيت للرحلة</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {hotels.filter(h => multiDestinations.some(d => d.includes(h.city) || h.city.includes(d))).length === 0 && (
                <div className="col-span-full text-center text-xs text-sky-700 py-3 font-bold bg-sky-100/50 rounded-xl">
                  لا توجد فنادق مسجلة في وجهات الرحلة.
                </div>
              )}
              {hotels.filter(h => multiDestinations.some(d => d.includes(h.city) || h.city.includes(d))).map((h) => (
                <div
                  key={h.id}
                  onClick={() => setHotelId(h.id)}
                  className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                    hotelId === h.id
                      ? "bg-sky-50/50 border-sky-500 ring-1 ring-sky-500"
                      : "bg-white border-slate-200 hover:border-sky-300"
                  }`}
                >
                  <img src={h.hotel_photo_1} alt={h.name} className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <div className="font-black text-xs text-slate-900 truncate">{h.name}</div>
                      {hotelId === h.id && <div className="text-sky-600 text-xs">✅</div>}
                    </div>
                    <div className="text-[9px] text-slate-500 font-bold mb-1">⭐ {h.rating_avg} ({h.stars} نجوم)</div>
                    <div className="text-[9px] text-slate-500 leading-relaxed truncate">
                      <span className="text-sky-700 font-black">المدينة:</span> {h.city} — {h.address}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Photo Picker */}
        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة الرحلة (للعرض والترويج)" value={photo} onChange={setPhoto} />
        </div>

        {/* 6. Form Actions */}
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
  onClose,
  onSave,
}: {
  trip: DailyTrip;
  guides: Guide[];
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (t: DailyTrip) => void;
}) {
  const [title, setTitle] = useState(trip.trip_title || trip.title || "");
  const [desc, setDesc] = useState(trip.description);
  const [destination, setDestination] = useState(trip.destination || "لبدة الكبرى");
  const [departureCity, setDepartureCity] = useState(trip.departure_city || "طرابلس");
  const [price, setPrice] = useState(String(trip.price_per_seat));
  const [busCapacity, setBusCapacity] = useState<25 | 50>(trip.bus_capacity || (trip.max_capacity === 50 ? 50 : 25));
  const [guide, setGuide] = useState(trip.guide_license || "");
  const [recurringDays, setRecurringDays] = useState<string[]>(
    Array.isArray(trip.recurring_days)
      ? trip.recurring_days
      : typeof trip.recurring_days === "string"
      ? trip.recurring_days.split(",")
      : ["الأحد", "الأربعاء"]
  );
  const [photo, setPhoto] = useState(trip.photo || "");
  const [activities, setActivities] = useState((trip as any).activities || "جولة أثرية بمرشد موثق • شرح تاريخي مفصل • غداء طازج • جلسة تصوير");

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => g.verification_status !== "مرفوض");
  }, [guides]);
  const [selVehicles, setSelVehicles] = useState<string[]>(trip.vehicle_plates || []);

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
    <ModalShell title={`تعديل الرحلة اليومية: ${trip.trip_title || trip.title || ""}`} onClose={onClose}>
      <form
        className="space-y-4 text-right text-xs"
        onSubmit={(e) => {
          e.preventDefault();
          if (recurringDays.length !== 2) {
            alert("يرجى اختيار يومين أسبوعياً للرحلة اليومية.");
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
            photo,
            vehicle_plates: selVehicles,
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

        {/* 2 Days Selector */}
        <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
          <div className="font-black text-blue-900 text-xs flex justify-between">
            <span>📅 جدول الأيام (يومان أسبوعياً):</span>
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

        {/* Bus Capacity */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
          <div className="font-black text-emerald-900 text-xs">🚌 سعة الحافلة (25 أو 50 راكب):</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBusCapacity(25)}
              className={`py-2 rounded-xl border font-black text-xs ${
                busCapacity === 25 ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              🚐 25 راكب (ميني باص)
            </button>
            <button
              type="button"
              onClick={() => setBusCapacity(50)}
              className={`py-2 rounded-xl border font-black text-xs ${
                busCapacity === 50 ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              🚍 50 راكب (حافلة كبرى)
            </button>
          </div>
        </div>

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

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة الرحلة اليومية" value={photo} onChange={setPhoto} />
        </div>
        <div className="pt-2 border-t border-border">
          <VehiclesMultiSelect vehicles={vehicles} selected={selVehicles} onChange={setSelVehicles} />
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
  onClose,
  onSave,
}: {
  trip: WeeklyTrip;
  guides: Guide[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  onClose: () => void;
  onSave: (w: WeeklyTrip) => void;
}) {
  const [title, setTitle] = useState(trip.title);
  const [multiDestinations, setMultiDestinations] = useState<string[]>(trip.destinations || (trip.destination ? trip.destination.split(" + ") : ["أوباري"]));
  const [departureCity, setDepartureCity] = useState(trip.departure_city || "طرابلس");
  const [price, setPrice] = useState(String(trip.seat_per_price));

  const handleMultiDestToggle = (city: string) => {
    setMultiDestinations(prev => prev.includes(city) ? prev.filter(c => c !== city) : [...prev, city]);
  };
  const [busCapacity, setBusCapacity] = useState<25 | 50>(trip.bus_capacity || (trip.max_capacity === 50 ? 50 : 25));
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
  const [guide, setGuide] = useState(trip.guide_license || "");
  const [hotelId, setHotelId] = useState(trip.hotel_id || "");
  const [photo, setPhoto] = useState(trip.photo || "");
  const [selVehicles, setSelVehicles] = useState<string[]>(trip.vehicle_plates || []);

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => g.verification_status !== "مرفوض");
  }, [guides]);

  const allWeekDays = ["السبت", "الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  return (
    <ModalShell title={`تعديل الرحلة الأسبوعية: ${trip.trip_title || trip.title || ""}`} onClose={onClose}>
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
            hotel_id: hotelId,
            photo,
            vehicle_plates: selVehicles,
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

        {/* 1 Day Selector */}
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

        {/* Bus Capacity */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
          <div className="font-black text-emerald-900 text-xs">🚍 سعة الحافلة (25 أو 50 راكب):</div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setBusCapacity(25)}
              className={`py-2 rounded-xl border font-black text-xs ${
                busCapacity === 25 ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              🚐 25 راكب (ميني باص)
            </button>
            <button
              type="button"
              onClick={() => setBusCapacity(50)}
              className={`py-2 rounded-xl border font-black text-xs ${
                busCapacity === 50 ? "bg-emerald-600 text-white border-emerald-700" : "bg-white text-slate-700 border-slate-200"
              }`}
            >
              🚍 50 راكب (حافلة كبرى)
            </button>
          </div>
        </div>

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

        {/* Hotel Selection */}
        <div className="p-3.5 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-2">
          <div className="font-black text-sky-900 text-sm flex items-center gap-1.5 mb-1">
            <span>🏨</span>
            <span>تعيين فندق المبيت للرحلة</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {hotels.filter(h => multiDestinations.some(d => d.includes(h.city) || h.city.includes(d))).length === 0 && (
              <div className="col-span-full text-center text-xs text-sky-700 py-3 font-bold bg-sky-100/50 rounded-xl">
                لا توجد فنادق مسجلة في وجهات الرحلة.
              </div>
            )}
            {hotels.filter(h => multiDestinations.some(d => d.includes(h.city) || h.city.includes(d))).map((h) => (
              <div
                key={h.id}
                onClick={() => setHotelId(h.id)}
                className={`p-2.5 rounded-2xl border cursor-pointer transition flex items-start gap-2.5 ${
                  hotelId === h.id
                    ? "bg-sky-50/50 border-sky-500 ring-1 ring-sky-500"
                    : "bg-white border-slate-200 hover:border-sky-300"
                }`}
              >
                <img src={h.hotel_photo_1} alt={h.name} className="w-10 h-10 rounded-xl object-cover shadow-sm bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <div className="font-black text-xs text-slate-900 truncate">{h.name}</div>
                    {hotelId === h.id && <div className="text-sky-600 text-xs">✅</div>}
                  </div>
                  <div className="text-[9px] text-slate-500 font-bold mb-1">⭐ {h.rating_avg} ({h.stars} نجوم)</div>
                  <div className="text-[9px] text-slate-500 leading-relaxed truncate">
                    <span className="text-sky-700 font-black">المدينة:</span> {h.city} — {h.address}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة الرحلة الأسبوعية (للعرض)" value={photo} onChange={setPhoto} />
        </div>
        <div className="pt-2 border-t border-border">
          <VehiclesMultiSelect vehicles={vehicles} selected={selVehicles} onChange={setSelVehicles} />
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

function EvaluatePrivateTripModal({ trip, guides, vehicles, onClose, onSave }: { trip: PrivateTripRequest; guides: Guide[]; vehicles: Vehicle[]; onClose: () => void; onSave: (id: string, status: "مؤكدة" | "مرفوضة من الأدمن", price?: number, plan?: string, guide?: string, vehicle?: string) => void }) {
  const [guide, setGuide] = useState(trip.assigned_guide || guides[0]?.license_number || "");
  const [vehicle, setVehicle] = useState(trip.assigned_vehicle || vehicles[0]?.plate_number || "");
  
  const selectedGuide = guides.find(g => g.license_number === guide) || guides[0];
  const selectedVehicle = vehicles.find(v => v.plate_number === vehicle) || vehicles[0];
  const guideDailyRate = selectedGuide?.daily_rate || 150;
  const vehicleDailyRate = selectedVehicle?.daily_rate || 450;
  const durationDays = trip.duration_days || 1;
  const autoCalculatedTotal = (guideDailyRate + vehicleDailyRate) * durationDays;

  const [price, setPrice] = useState(trip.quoted_price ? String(trip.quoted_price) : String(autoCalculatedTotal));
  const [plan, setPlan] = useState(trip.admin_itinerary_plan || `برنامج رحلة سياحية خاصة لمدة ${durationDays} أيام يشمل التنقلات والمرشد الخاص.`);

  const applyAutoPrice = () => {
    setPrice(String(autoCalculatedTotal));
  };

  return (
    <ModalShell title={`تقييم واحتساب تسعيرة الرحلة الخاصة: ${trip.private_trip_id}`} onClose={onClose}>
      <div className="space-y-4 text-right">
        {/* Tourist Request Details */}
        <div className="p-3.5 rounded-xl bg-muted/40 text-xs space-y-1.5 border border-border/70">
          <div className="flex justify-between items-center">
            <div><b>العميل:</b> {trip.customer_name} ({trip.customer_phone})</div>
            <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary font-black">⏱️ المدة: {durationDays} أيام</span>
          </div>
          <div className="flex gap-4 text-muted-foreground font-bold">
            <span>📅 تاريخ الانطلاق المفضل: {trip.preferred_start_date}</span>
            <span>👥 عدد المرافقين: {trip.number_of_companions}</span>
          </div>
          <div className="mt-1 font-semibold text-muted-foreground p-2 rounded-lg bg-white border border-border/40">
            "{trip.customer_description}"
          </div>
        </div>

        {/* Guide Selection with Daily Rate */}
        <div>
          <label className="text-xs font-black text-foreground mb-1 block">👨‍✈️ اختيار وتعيين المرشد المكلف (مع السعر اليومي):</label>
          <select
            value={guide}
            onChange={e => setGuide(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right"
          >
            {guides.map(g => (
              <option key={g.license_number} value={g.license_number}>
                {g.full_name} ({g.license_number}) — {g.daily_rate} د.ل / اليوم
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Selection with Daily Rate */}
        <div>
          <label className="text-xs font-black text-foreground mb-1 block">🚌 اختيار وتعيين المركبة أو الحافلة (مع السعر اليومي):</label>
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

        {/* Breakdown Calculation Box */}
        <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-black text-emerald-900">🧾 الحسبة التلقائية حسب أسعار اليوم الواحد:</span>
            <button
              type="button"
              onClick={applyAutoPrice}
              className="text-[11px] font-black text-emerald-700 underline hover:text-emerald-900"
            >
              🔄 تطبيق السعر المحسوب في الحقل
            </button>
          </div>
          <div className="text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>أجر المرشد اليومي:</span>
              <span className="font-bold text-foreground">{guideDailyRate} د.ل / يوم</span>
            </div>
            <div className="flex justify-between">
              <span>أجر المركبة اليومي:</span>
              <span className="font-bold text-foreground">{vehicleDailyRate} د.ل / يوم</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي اليوم الواحد (مرشد + مركبة):</span>
              <span className="font-bold text-foreground">{guideDailyRate + vehicleDailyRate} د.ل / يوم</span>
            </div>
            <div className="flex justify-between border-t border-emerald-200/80 pt-1.5 font-black text-emerald-900">
              <span>الإجمالي التقديري لـ {durationDays} أيام:</span>
              <span className="text-sm font-black">{autoCalculatedTotal} د.ل</span>
            </div>
          </div>
        </div>

        <Field label="السعر الإجمالي النهائي المعتمد للرحلة (د.ل)" type="number" value={price} onChange={setPrice} />

        <div>
          <label className="text-xs font-bold mb-1 block">خطة مسار الرحلة الخاصة</label>
          <textarea value={plan} onChange={e => setPlan(e.target.value)} rows={3} className="w-full p-2.5 rounded-xl border border-border text-xs font-semibold text-right" />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button onClick={() => onSave(trip.private_trip_id, "مرفوضة من الأدمن")} className="px-4 h-10 border border-red-200 text-red-600 rounded-xl font-black text-xs">رفض الطلب</button>
          <button onClick={() => onSave(trip.private_trip_id, "مؤكدة", +price, plan, guide, vehicle)} className="px-5 h-10 bg-gradient-sea text-white rounded-xl font-black text-xs shadow-glow">تأكيد الموارد والسعر ({price} د.ل)</button>
        </div>
      </div>
    </ModalShell>
  );
}

function HotelModal({ title, hotel, onClose, onSave }: { title: string; hotel?: Hotel; onClose: () => void; onSave: (h: any) => void }) {
  const [name, setName] = useState(hotel?.name || "");
  const [city, setCity] = useState(hotel?.city || "طرابلس");
  const [address, setAddress] = useState(hotel?.address || "");
  const [phone, setPhone] = useState(hotel?.phone || "");
  const [stars, setStars] = useState(hotel?.stars ? String(hotel.stars) : "4");
  const [status, setStatus] = useState(hotel?.partnership_status || "نشط");
  const [description, setDescription] = useState(hotel?.description || "");
  const [mapsUrl, setMapsUrl] = useState(hotel?.google_maps_url || "");
  const [workingHours, setWorkingHours] = useState(hotel?.working_hours || "24 ساعة (تسجيل الوصول: 02:00 م | المغادرة: 12:00 ظ)");
  const [p1, setP1] = useState(hotel?.hotel_photo_1 || "/assets/ai_city.jpg");
  const [p2, setP2] = useState(hotel?.hotel_photo_2 || "/assets/ai_city.jpg");
  const [p3, setP3] = useState(hotel?.hotel_photo_3 || "/assets/ai_city.jpg");
  const [p4, setP4] = useState(hotel?.hotel_photo_4 || "/assets/ai_ghadames.jpg");
  const [p5, setP5] = useState(hotel?.hotel_photo_5 || "/assets/ai_ghadames.jpg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city || !address) return alert("يرجى إدخال البيانات الأساسية للفندق");
    onSave({
      ...(hotel ? { id: hotel.id } : {}),
      name,
      city,
      address,
      phone,
      stars: +stars,
      partnership_status: status,
      description,
      google_maps_url: mapsUrl,
      working_hours: workingHours,
      hotel_photo_1: p1,
      hotel_photo_2: p2 || p1,
      hotel_photo_3: p3 || p1,
      hotel_photo_4: p4 || p1,
      hotel_photo_5: p5 || p1,
    });
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3.5 text-right" onSubmit={handleSubmit}>
        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 font-semibold">
          ℹ️ <b>دليل تعريفي استكشافي:</b> الفنادق للعرض والتعريف بالمنشأة ومميزاتها فقط دون حجز مباشر للغرف عبر المنصة.
        </div>
        <Field label="اسم الفندق الرسمي" value={name} onChange={setName} placeholder="مثال: فندق الفندق الكبير طرابلس" />
        <div className="grid grid-cols-2 gap-2">
          <Field label="المدينة" value={city} onChange={setCity} placeholder="طرابلس / بنغازي / غدامس..." />
          <Field label="التصنيف بالنجوم (1-5)" type="number" value={stars} onChange={setStars} />
        </div>
        <div>
          <label className="text-xs font-bold block mb-1">حالة العرض بالدليل السياحي</label>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right outline-none focus:border-primary">
            <option value="نشط">نشط (ظاهر بالدليل)</option>
            <option value="معلق">معلق</option>
            <option value="موقوف">موقوف</option>
          </select>
        </div>
        <Field label="العنوان التفصيلي" value={address} onChange={setAddress} placeholder="المنطقة - الشارع الرئيسي" />
        <LibyanPhoneField label="هاتف الاستعلام والتواصل المباشر" value={phone} onChange={setPhone} />
        <Field label="مواعيد وساعات العمل وتسجيل الوصول (Check-in / Check-out)" value={workingHours} onChange={setWorkingHours} placeholder="مثال: 24 ساعة (تسجيل وصول 2:00 م - مغادرة 12:00 ظ)" />
        
        {/* Google Maps URL */}
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">📍 رابط موقع الفندق على خرائط جوجل (Google Maps URL)</label>
          <div className="flex gap-2">
            <input type="text" value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..." className="flex-1 h-10 px-3 rounded-xl border border-border text-xs outline-none focus:border-primary text-right" />
            {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="px-3 h-10 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center shrink-0 hover:bg-blue-700">🗺️ فتح ↗</a>}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">نبذة ووصف الفندق والمميزات والخدمات</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="اكتب نبذة تعريفية عن الفندق وأجنحته والإطلالات والخدمات..." className="w-full p-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary" />
        </div>

        {/* 5 Photos Section */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-xs font-black text-foreground block">🖼️ الصور الخمسة للفندق (معرض الصور بالدليل):</label>
          <div className="space-y-2">
            <ImageFilePicker label="الصورة 1 (الواجهة الرئيسية)" value={p1} onChange={setP1} />
            <ImageFilePicker label="الصورة 2 (الأجنحة والغرف)" value={p2} onChange={setP2} />
            <ImageFilePicker label="الصورة 3 (الاستقبال والمطعم)" value={p3} onChange={setP3} />
            <ImageFilePicker label="الصورة 4 (المرافق والخدمات)" value={p4} onChange={setP4} />
            <ImageFilePicker label="الصورة 5 (الإطلالة والمسبح)" value={p5} onChange={setP5} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ الفندق بالدليل ✓</button>
        </div>
      </form>
    </ModalShell>
  );
}

function RestaurantModal({ title, restaurant, onClose, onSave }: { title: string; restaurant?: Restaurant; onClose: () => void; onSave: (r: any) => void }) {
  const [name, setName] = useState(restaurant?.name || "");
  const [type, setType] = useState(restaurant?.type || "مأكولات شعبية ومقهى وتراثية");
  const [city, setCity] = useState(restaurant?.city || "طرابلس");
  const [address, setAddress] = useState(restaurant?.address || "");
  const [phone, setPhone] = useState(restaurant?.phone || "");
  const [description, setDescription] = useState(restaurant?.description || "");
  const [mapsUrl, setMapsUrl] = useState(restaurant?.google_maps_url || "");
  const [workingHours, setWorkingHours] = useState(restaurant?.working_hours || "09:00 صباحاً — 12:00 ليلاً");
  const [i1, setI1] = useState(restaurant?.facility_image_1 || "/assets/ai_food.jpg");
  const [i2, setI2] = useState(restaurant?.facility_image_2 || "/assets/ai_ruins.jpg");
  const [i3, setI3] = useState(restaurant?.facility_image_3 || "/assets/ai_city.jpg");
  const [i4, setI4] = useState(restaurant?.facility_image_4 || "/assets/ai_ruins.jpg");
  const [i5, setI5] = useState(restaurant?.facility_image_5 || "/assets/ai_food.jpg");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !city) return alert("يرجى كتابة الاسم والمدينة للمطعم/المقهى");
    onSave({
      ...(restaurant ? { id: restaurant.id } : {}),
      name,
      type,
      city,
      address,
      phone,
      description,
      google_maps_url: mapsUrl,
      working_hours: workingHours,
      facility_image_1: i1,
      facility_image_2: i2 || i1,
      facility_image_3: i3 || i1,
      facility_image_4: i4 || i1,
      facility_image_5: i5 || i1,
    });
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3.5 text-right" onSubmit={handleSubmit}>
        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 font-semibold">
          ℹ️ <b>دليل تعريفي:</b> المطاعم والمقاهي للعرض والتعريف بنوع الطعام وساعات العمل والتواصل دون حجز مسبق.
        </div>
        <Field label="اسم المطعم / المقهى" value={name} onChange={setName} placeholder="مثال: مطعم و كافيه السراياء التراثي" />
        <div className="grid grid-cols-2 gap-2">
          <Field label="نوع وتصنيف الطعام والمنشأة (مأكولات شعبية، مقهى، بحرية...)" value={type} onChange={setType} />
          <Field label="المدينة" value={city} onChange={setCity} />
        </div>
        <Field label="العنوان التفصيلي" value={address} onChange={setAddress} placeholder="المنطقة - الشارع - المعلم القريب" />
        <LibyanPhoneField label="هاتف التواصل والتوصيل والاستعلام" value={phone} onChange={setPhone} />
        <Field label="⏰ ساعات وفترات العمل اليومية" value={workingHours} onChange={setWorkingHours} placeholder="مثال: 08:00 صباحاً — 12:00 ليلاً" />

        {/* Google Maps URL */}
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">📍 رابط موقع المطعم/المقهى على خرائط جوجل (Google Maps URL)</label>
          <div className="flex gap-2">
            <input type="text" value={mapsUrl} onChange={e => setMapsUrl(e.target.value)} placeholder="https://maps.google.com/?q=..." className="flex-1 h-10 px-3 rounded-xl border border-border text-xs outline-none focus:border-primary text-right" />
            {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="px-3 h-10 bg-blue-600 text-white rounded-xl text-xs font-black flex items-center shrink-0 hover:bg-blue-700">🗺️ فتح ↗</a>}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">نبذة ومميزات المطعم/المقهى والوجبات والمنيو</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="اكتب نبذة عن أصناف الوجبات والمشروبات والجلسات التراثية..." className="w-full p-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary" />
        </div>

        {/* 5 Photos Section */}
        <div className="pt-2 border-t border-border space-y-2">
          <label className="text-xs font-black text-foreground block">🖼️ الصور الخمسة للمطعم/المقهى (معرض الصور):</label>
          <div className="space-y-2">
            <ImageFilePicker label="الصورة 1 (الواجهة والمظهر)" value={i1} onChange={setI1} />
            <ImageFilePicker label="الصورة 2 (الجلسات الداخلية والسيور)" value={i2} onChange={setI2} />
            <ImageFilePicker label="الصورة 3 (الأطباق والوجبات الرئيسية)" value={i3} onChange={setI3} />
            <ImageFilePicker label="الصورة 4 (المشروبات والمأكولات)" value={i4} onChange={setI4} />
            <ImageFilePicker label="الصورة 5 (المنيو والأجواء الخارجية)" value={i5} onChange={setI5} />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ المطعم/المقهى بالدليل ✓</button>
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

function DailyOfferModal({ title, offer, dailyTrips, onClose, onSave }: { title: string; offer?: DailyOffer; dailyTrips: DailyTrip[]; onClose: () => void; onSave: (o: any) => void }) {
  const [ot, setOt] = useState(offer?.title_offer || ""); const [desc, setDesc] = useState(offer?.description || "");
  const [disc, setDisc] = useState(String(offer?.percent_discount || 10)); const [img, setImg] = useState(offer?.url_image_offer || "");
  const [tripId, setTripId] = useState(offer?.daily_trip_id || dailyTrips[0]?.id || "");
  const [ds, setDs] = useState(offer?.date_start || "2026-08-01"); const [de, setDe] = useState(offer?.date_end || "2026-08-31");
  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={e => { e.preventDefault(); onSave({ ...(offer ? { id: offer.id } : {}), title_offer: ot, description: desc, percent_discount: +disc, url_image_offer: img, daily_trip_id: tripId, date_start: ds, date_end: de }); }}>
        <Field label="عنوان العرض" value={ot} onChange={setOt} />
        <div><label className="text-xs font-bold mb-1 block">الوصف</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border text-xs font-semibold text-right" /></div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="نسبة الخصم % (1-100)" type="number" value={disc} onChange={setDisc} />
          <div><label className="text-xs font-bold mb-1 block">الرحلة اليومية</label>
            <select value={tripId} onChange={e => setTripId(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right">
              {dailyTrips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ البداية" type="date" value={ds} onChange={setDs} />
          <Field label="تاريخ الانتهاء" type="date" value={de} onChange={setDe} />
        </div>
        <div className="pt-2 border-t border-border"><ImageFilePicker label="صورة العرض" value={img} onChange={setImg} /></div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ العرض</button>
        </div>
      </form>
    </ModalShell>
  );
}

function WeeklyOfferModal({ title, offer, weeklyTrips, onClose, onSave }: { title: string; offer?: WeeklyOffer; weeklyTrips: WeeklyTrip[]; onClose: () => void; onSave: (o: any) => void }) {
  const [ot, setOt] = useState(offer?.offer_title || ""); const [desc, setDesc] = useState(offer?.description || "");
  const [disc, setDisc] = useState(String(offer?.percent_discount || 10)); const [img, setImg] = useState(offer?.offer_image_url || "");
  const [tripId, setTripId] = useState(offer?.weekly_trip_id || weeklyTrips[0]?.id || "");
  const [ds, setDs] = useState(offer?.date_start || "2026-08-01"); const [de, setDe] = useState(offer?.date_end || "2026-09-30");
  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={e => { e.preventDefault(); onSave({ ...(offer ? { id: offer.id } : {}), offer_title: ot, description: desc, percent_discount: +disc, offer_image_url: img, weekly_trip_id: tripId, date_start: ds, date_end: de }); }}>
        <Field label="عنوان العرض الأسبوعي" value={ot} onChange={setOt} />
        <div><label className="text-xs font-bold mb-1 block">الوصف</label><textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} className="w-full p-2.5 rounded-xl border text-xs font-semibold text-right" /></div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="نسبة الخصم %" type="number" value={disc} onChange={setDisc} />
          <div><label className="text-xs font-bold mb-1 block">الرحلة الأسبوعية</label>
            <select value={tripId} onChange={e => setTripId(e.target.value)} className="w-full h-10 px-3 rounded-xl border text-xs font-bold text-right">
              {weeklyTrips.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ البداية" type="date" value={ds} onChange={setDs} />
          <Field label="تاريخ الانتهاء" type="date" value={de} onChange={setDe} />
        </div>
        <div className="pt-2 border-t border-border"><ImageFilePicker label="صورة العرض الأسبوعي" value={img} onChange={setImg} /></div>
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sun text-gold-foreground font-black text-xs shadow-glow">حفظ العرض الأسبوعي</button>
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
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
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
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
      />
    </div>
  );
}
