import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { 
  getStoredSession, 
  apiGetAdminDashboard, 
  apiVerifyGuide, 
  apiCreateDailyTrip,
  apiUpdateDailyTrip,
  apiCancelDailyTrip,
  apiGetDailyTrips,
  apiCreateWeeklyTrip,
  apiUpdateWeeklyTrip,
  apiCancelWeeklyTrip,
  apiGetWeeklyTrips,
  apiCreateDailyOffer,
  apiEndDailyOffer,
  apiCreateWeeklyOffer,
  apiEndWeeklyOffer,
  apiGetDailyOffers,
  apiGetWeeklyOffers,
  apiReviewPrivateTrip,
  getAllGuides, 
  getTransportCompanies,
  saveTransportCompanies,
  addTransportCompany,
  updateTransportCompany,
  getDrivers,
  getVehicles,
  apiSetBookingPayment,
  apiSetBookingAttendance,
  apiCheckInBooking,
  apiFindTicket,
  laravelRequest,
  apiGetHotels,
  apiGetPlaces,
  apiGetRestaurants,
  apiSaveHotel,
  apiSaveRestaurant
} from "@/lib/api";
import { TOUR_GUIDES_DATA, formatWorkingDays, REGIONS_MAP, formatOperatingRegions } from "@/lib/guidesData";
import { getChatSessions, saveChatSessions, sendAdminReply } from "@/lib/supportChat";
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
import { VehicleDetailsModal, type VehicleDetailsData } from "@/components/VehicleDetailsModal";

export const formatTripDate = (rawDate?: string | null): string => {
  if (!rawDate) return "غير محدد";
  try {
    const cleanStr = String(rawDate).split("T")[0];
    const parts = cleanStr.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      const dateObj = new Date(y, m - 1, d);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString("ar-LY", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }
    return cleanStr;
  } catch {
    return String(rawDate);
  }
};

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
  current_trip_stage?: string | null; // drivers.current_trip_stage, reported by the driver
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
  places?: any[];
  place_ids?: string[];
  total_tours_completed?: number;
  city?: string | null;
  license_expiry_date?: string | null;
  availability_status?: string | null;
  rejection_reason?: string | null;
};

type Vehicle = { 
  plate_number: string; 
  company_id?: string | null; 
  contract_number?: string | null;
  company_name?: string | null; 
  city?: string | null;
  company_city?: string | null;
  vehicle_type: string; 
  capacity?: number | null; 
  seating_capacity?: number | null;
  daily_rate?: number | null; 
  status?: "جاهزة" | "في رحلة" | "صيانة" | string | null; 
  vehicle_status?: string | null;
};

type DailyTrip = {
  guide_approval_status?: string | null; // daily_trips.guide_approval_status 
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
  destinations?: string[];
  place_ids?: string[];
  places?: any[];
  departure_city?: string; 
  gallery?: string;
  images?: string[];
  vehicle_plate?: string | null;
  restaurant_id?: string | null;
  itinerary_steps?: any;
};

type WeeklyTrip = { 
  guide_approval_status?: string | null; // weekly_trips.guide_approval_status
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
  hotel_id?: string | null; 
  hotel_ids?: string[];
  gallery?: string;
  images?: string[];
  vehicle_plate?: string | null;
  restaurant_id?: string | null;
  restaurant_ids?: string[];
  itinerary_steps?: any;
};

type PrivateTripRequest = { 
  private_trip_id: string; 
  customer_name?: string; 
  customer_phone?: string; 
  customer_email?: string;
  customer_description?: string; 
  preferred_start_date: string; 
  duration_days: number; 
  number_of_companions: number; 
  quoted_price?: number; 
  additional_expenses?: number;
  admin_itinerary_plan?: string; 
  assigned_guide?: string; 
  assigned_guide_license?: string;
  guide_license_number?: string;
  guide_name?: string;
  guide_phone?: string;
  guide_daily_rate?: number;
  assigned_vehicle?: string; 
  assigned_vehicle_plate?: string;
  vehicle_plate?: string;
  vehicle_model?: string;
  vehicle_capacity?: number;
  vehicle_daily_rate?: number;
  vehicle_image?: string;
  vehicle_status?: string;
  transport_company_name?: string;
  transport_company_phone?: string;
  customer_requirements?: string;
  status_order: "قيد الدراسة" | "بانتظار رد المرشد" | "اعتذر المرشد" | "بانتظار تأكيد السائح" | "مؤكدة" | "مرفوضة من الأدمن" | "مرفوضة من السائح" | "ملغية" | "ملغاة من السائح" | string; 
  tourist_id?: string;
  places?: any[];
  place_ids?: string[];
  hotels?: any[];
  hotel_ids?: string[];
  stations?: any[];
};

// DelniDB rows (from Laravel) -> the admin view models; every stored field is kept so edit forms see real values
function mapCompanyRow(c: any) {
  return {
    ...c,
    id: c.contract_number,
    name: c.company_name,
    phone: c.phone_number,
    // The company location is stored in google_maps_url
    address: c.google_maps_url || "",
    city: c.city || "طرابلس",
    email: c.email || "",
    status: c.verification_status || "موثق",
    verification_status: c.verification_status || "موثق",
  };
}

function mapDriverRow(d: any) {
  return {
    ...d,
    assigned_vehicle_plate: d.assigned_vehicle_plate || "",
    email: d.email || "",
    account_status: d.account_status || "نشط",
    operational_status: d.operational_status || "متاح",
    company_name: d.company_name || "",
  };
}

function mapVehicleRow(v: any) {
  return {
    ...v,
    company_id: v.contract_number,
    company_name: v.company_name || "",
    vehicle_type: v.vehicle_type || "حافلة سياحية",
    capacity: v.seating_capacity,
    daily_rate: Number(v.daily_rate) || 0,
    vehicle_status: v.vehicle_status || "جاهزة",
    status: v.vehicle_status || "جاهزة",
  };
}

function mapHotelRow(h: any): Hotel {
  return {
    id: h.hotel_id,
    hotel_id: h.hotel_id,
    name: h.hotel_name,
    city: h.city,
    address: h.address_details || "",
    phone: h.phone_number || "",
    whatsapp: h.phone_number || "",
    stars: Number(h.star_rating) || 4,
    bookings_count: 0,
    rating_avg: Number(h.rating_avg) || 0,
    partnership_status: h.partnership_status || "نشط",
    property_type: h.property_type || "hotel",
    discount_percentage: Number(h.discount_percentage) || 0,
    description: h.description || "",
    working_hours: h.working_hours || "",
    google_maps_url: h.google_maps_url || "",
    amenities: Array.isArray(h.amenities) ? h.amenities : [],
    contract_start_date: h.contract_start_date || "",
    contract_end_date: h.contract_end_date || "",
    hotel_photo_1: h.hotel_photo_1 || "/assets/ai_hotel.jpg",
    hotel_photo_2: h.hotel_photo_2 || "",
    hotel_photo_3: h.hotel_photo_3 || "",
    hotel_photo_4: h.hotel_photo_4 || "",
    hotel_photo_5: h.hotel_photo_5 || "",
  };
}

function mapRestaurantRow(r: any): Restaurant {
  return {
    id: r.facility_id,
    facility_id: r.facility_id,
    name: r.facility_name,
    type: r.facility_type || "مطعم",
    city: r.city,
    address: r.address_details || "",
    phone: r.phone_number || "",
    whatsapp: r.phone_number || "",
    rating_avg: Number(r.rating_avg) || 0,
    partnership_status: r.partnership_status || "نشط",
    discount_percentage: Number(r.discount_percentage) || 0,
    description: r.description || "",
    working_hours: r.working_hours || "",
    google_maps_url: r.google_maps_url || "",
    features: Array.isArray(r.features) ? r.features : [],
    contract_start_date: r.contract_start_date || "",
    contract_end_date: r.contract_end_date || "",
    facility_image_1: r.facility_image_1 || "/assets/restaurant-libya.jpg",
    facility_image_2: r.facility_image_2 || "",
    facility_image_3: r.facility_image_3 || "",
    facility_image_4: r.facility_image_4 || "",
    facility_image_5: r.facility_image_5 || "",
  };
}

function mapGuideRow(g: any): Guide {
  return {
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
    daily_rate: Number(g.price_per_day) || 0,
    price_per_day: Number(g.price_per_day) || 0,
    primaryRegion: Array.isArray(g.operating_regions) ? (g.operating_regions[0] || "") : (g.operating_regions || ""),
    operating_regions: g.operating_regions || [],
    working_days: g.working_days || [],
    places: g.places || [],
    place_ids: g.place_ids || [],
    total_tours_completed: Number(g.total_tours_completed) || 0,
    license_expiry_date: g.license_expiry_date ? String(g.license_expiry_date).slice(0, 10) : null,
    availability_status: g.availability_status || "متاح",
    rejection_reason: g.rejection_reason || null,
  } as Guide;
}

function mapPlaceRow(p: any): Attraction {
  return {
    id: p.place_id,
    place_id: p.place_id,
    municipality_code: p.place_id,
    name: p.place_name,
    place_name: p.place_name,
    city: p.city,
    region: p.region || "المنطقة الغربية",
    category: p.category || "آثار تاريخية",
    description: p.description || "",
    place_image: p.place_image || "",
    visitors_count: 0,
    latitude: p.latitude,
    longitude: p.longitude,
    google_maps_url: p.google_maps_url || "",
    highlights: Array.isArray(p.highlights) ? p.highlights : [],
  } as Attraction;
}

function toPlacePayload(a: any) {
  return {
    place_id: String(a.place_id || a.municipality_code || a.id || "").trim(),
    place_name: a.place_name || a.name,
    description: a.description,
    city: a.city,
    region: a.region,
    category: a.category,
    latitude: a.latitude,
    longitude: a.longitude,
    place_image: a.place_image,
    google_maps_url: a.google_maps_url,
    highlights: a.highlights,
  };
}

// DelniDB trip/offer rows (from Laravel) -> admin view models; photos and days are kept so editing never resets them
function mapDailyTripRow(d: any): any {
  return {
    id: d.daily_trip_id,
    daily_trip_id: d.daily_trip_id,
    title: d.trip_title,
    trip_title: d.trip_title,
    description: d.description || "",
    price_per_seat: Number(d.price_per_seat) || 0,
    departure_city: d.departure_city || "طرابلس",
    destination: d.destination || d.destination_city || "",
    destination_city: d.destination_city || d.destination || "",
    destinations: d.destinations || (d.destination ? d.destination.split(' + ') : []),
    place_ids: d.place_ids || [],
    places: d.places || [],
    max_capacity: d.max_capacity || 25,
    available_seats: d.available_seats || d.max_capacity || 25,
    bus_capacity: d.max_capacity || 25,
    bookings_count: Number(d.bookings_count) || 0,
    rating_avg: Number(d.rating_avg) || 0,
    recurring_days: d.recurring_days || "السبت,الثلاثاء",
    guide_license: d.guide_license_number || "",
    guide_license_number: d.guide_license_number || "",
    guide_approval_status: d.guide_approval_status || "",
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
    images: Array.isArray(d.images) ? d.images : [],
  gallery: d.gallery || "",
  photo_1: d.photo_1, photo_2: d.photo_2, photo_3: d.photo_3, photo_4: d.photo_4, photo_5: d.photo_5,
  days: Array.isArray(d.days) ? d.days : [],
  hotel_ids: d.hotel_ids || [],
  restaurant_ids: d.restaurant_ids || [],
};
}

function mapWeeklyTripRow(w: any): any {
  return {
    id: w.weekly_trip_id,
    weekly_trip_id: w.weekly_trip_id,
    title: w.trip_title,
    trip_title: w.trip_title,
    description: w.trip_description || "",
    trip_description: w.trip_description || "",
    seat_per_price: Number(w.seat_per_price) || 0,
    departure_city: w.departure_city || "طرابلس",
    destination: w.destination || w.destination_region || "",
    destination_region: w.destination_region || w.destination || "",
    destinations: w.destinations || (w.destination ? w.destination.split(' + ') : []),
    place_ids: w.place_ids || [],
    places: w.places || [],
    max_capacity: w.max_capacity || 25,
    available_seats: w.available_seats || w.max_capacity || 25,
    bus_capacity: w.max_capacity || 25,
    bookings_count: Number(w.bookings_count) || 0,
    rating_avg: Number(w.rating_avg) || 0,
    start_date: w.start_date || "",
    end_date: w.end_date || "",
    weekly_day: "الجمعة",
    guide_license: w.guide_license_number || "",
    guide_license_number: w.guide_license_number || "",
    guide_approval_status: w.guide_approval_status || "",
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
    images: Array.isArray(w.images) ? w.images : [],
  gallery: w.gallery || "",
  photo_1: w.photo_1, photo_2: w.photo_2, photo_3: w.photo_3, photo_4: w.photo_4, photo_5: w.photo_5,
  days: Array.isArray(w.days) ? w.days : [],
  hotel_ids: w.hotel_ids || [],
  restaurant_ids: w.restaurant_ids || [],
};
}

function mapDailyOfferRow(o: any): any {
  return {
  ...o,
  id: o.offer_daily_id,
  date_start: o.start_date,
  date_end: o.end_date,
  title_offer: o.offer_title,
  url_image_offer: o.offer_image_url,
  percent_discount: Number(o.percent_discount) || 0,
};
}

function mapWeeklyOfferRow(o: any): any {
  return {
  ...o,
  id: o.offer_weekly_id,
  date_start: o.start_date,
  date_end: o.end_date,
  title_offer: o.offer_title,
  offer_title: o.offer_title,
  percent_discount: Number(o.discount_percentage) || 0,
  discount_percentage: Number(o.discount_percentage) || 0,
};
}

// Admin view models -> the DelniDB column names Laravel validates
function toHotelPayload(h: any) {
  return {
    hotel_id: String(h.hotel_id || h.id || "").trim(),
    hotel_name: h.name,
    city: h.city,
    address_details: h.address,
    phone_number: h.phone,
    star_rating: Number(h.stars),
    partnership_status: h.partnership_status || "نشط",
    property_type: h.property_type || "hotel",
    amenities: Array.isArray(h.amenities) ? h.amenities : [],
    discount_percentage: Number(h.discount_percentage) || 0,
    working_hours: h.working_hours,
    description: h.description,
    google_maps_url: h.google_maps_url,
    contract_start_date: h.contract_start_date,
    contract_end_date: h.contract_end_date,
    hotel_photo_1: h.hotel_photo_1,
    hotel_photo_2: h.hotel_photo_2,
    hotel_photo_3: h.hotel_photo_3,
    hotel_photo_4: h.hotel_photo_4,
    hotel_photo_5: h.hotel_photo_5,
  };
}

function toRestaurantPayload(r: any) {
  return {
    facility_id: String(r.facility_id || r.id || "").trim(),
    facility_name: r.name,
    facility_type: r.type,
    city: r.city,
    address_details: r.address,
    phone_number: r.phone,
    description: r.description,
    working_hours: r.working_hours,
    features: Array.isArray(r.features) ? r.features : [],
    google_maps_url: r.google_maps_url,
    discount_percentage: Number(r.discount_percentage) || 0,
    partnership_status: r.partnership_status || "نشط",
    contract_start_date: r.contract_start_date,
    contract_end_date: r.contract_end_date,
    facility_image_1: r.facility_image_1,
    facility_image_2: r.facility_image_2,
    facility_image_3: r.facility_image_3,
    facility_image_4: r.facility_image_4,
    facility_image_5: r.facility_image_5,
  };
}

type Hotel = { id: string; hotel_id?: string; name: string; city: string; address: string; phone: string; stars: number; bookings_count: number; rating_avg: number; partnership_status: "نشط" | "معلق" | "موقوف" | string; hotel_photo_1: string; hotel_photo_2: string; hotel_photo_3: string; hotel_photo_4: string; hotel_photo_5: string; description?: string; google_maps_url?: string; working_hours?: string; property_type?: "hotel" | "resort" | "apartment" | "heritage" | string; discount_percentage?: number; whatsapp?: string; amenities?: string[]; contract_start_date?: string; contract_end_date?: string };
type Restaurant = { id: string; facility_id?: string; name: string; type: string; category?: "seafood" | "traditional" | "fastfood" | "cafe" | string; city: string; address: string; phone: string; rating_avg: number; facility_image_1: string; facility_image_2: string; facility_image_3: string; facility_image_4: string; facility_image_5: string; description?: string; google_maps_url?: string; working_hours?: string; discount_percentage?: number; whatsapp?: string; partnership_status?: "نشط" | "معلق" | "موقوف" | string; contract_start_date?: string; contract_end_date?: string; features?: string | string[] };
// Names joined by the Laravel bookings list (tourist and trip)
type BookingNames = { tourist_name?: string; tourist_phone?: string; trip_title?: string };

type Attraction = { 
  id: string; 
  place_id?: string; // رقم البلدية / المفتاح الرئيسي Primary Key
  municipality_code?: string;
  name: string; 
  place_name?: string;
  city: string; 
  region?: string;
  category: string; 
  description: string; 
  place_image: string; 
  visitors_count: number; 
  latitude?: number; 
  longitude?: number; 
  google_maps_url?: string; 
  highlights?: string | string[];
};
type ItemReview = { id: string; target_type: "رحلة يومية" | "رحلة أسبوعية" | "فندق" | "مطعم/مقهى" | "مرشد سياحي" | "شركة نقل"; target_name: string; tourist_name: string; stars_rating: number; comment_text: string; created_at: string };
type SupportTicket = { id: string; user_name: string; user_role: "سائح" | "مرشد" | "سائق" | "شركة نقل"; subject: string; message: string; status: "جديد" | "تم الرد" | "مغلق"; reply?: string; created_at: string };
type ChatMessage = { id: string; from: "user" | "bot" | "admin"; text: string; time: string };
type ChatSession = { id: string; user_name: string; user_type: "سائح" | "زائر" | string; last_message: string; time: string; unread: boolean; messages: ChatMessage[] };

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

  // Live synchronization is handled directly by fetchAdminData from Laravel API (DelniDB)


  /* ---- STATE DATA (1:1 with DelniDB schema) ---- */
  const [companies, setCompanies] = useState<Company[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);

  /* ALL PLATFORM VEHICLES ACROSS ALL TRANSPORT COMPANIES (DelniDB vehicles) */
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  /* DelniDB daily_trips */
  const [dailyTrips, setDailyTrips] = useState<DailyTrip[]>([]);

  /* DelniDB weekly_trips */
  const [weeklyTrips, setWeeklyTrips] = useState<WeeklyTrip[]>([]);

  /* DelniDB private_trips */
  const [privateTrips, setPrivateTrips] = useState<PrivateTripRequest[]>([]);

  /* DelniDB tourists */
  const [tourists, setTourists] = useState<any[]>([]);
  const [touristSearch, setTouristSearch] = useState("");
  const [touristStatusFilter, setTouristStatusFilter] = useState<"all" | "active" | "restricted">("all");
  const [selectedTouristDetail, setSelectedTouristDetail] = useState<any | null>(null);
  const [loadingTouristDetail, setLoadingTouristDetail] = useState(false);

  /* DelniDB bookings_daily & bookings_weekly */
  const [dailyBookings, setDailyBookings] = useState<(BookingDaily & BookingNames)[]>([]);

  const [weeklyBookings, setWeeklyBookings] = useState<(BookingWeekly & BookingNames)[]>([]);

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

  /* ---- DelniDB OFFERS STATE (offers_daily_trips, offers_weekly_trips) ---- */
  const [dailyOffers, setDailyOffers] = useState<DailyOffer[]>([]);
  const [weeklyOffers, setWeeklyOffers] = useState<WeeklyOffer[]>([]);

  /* ---- MODAL STATES ---- */
  const [showAddCompany, setShowAddCompany] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [viewingGuide, setViewingGuide] = useState<Guide | null>(null);
  const [showAddTrip, setShowAddTrip] = useState<"daily" | "weekly" | null>(null);
  const [editingDailyTrip, setEditingDailyTrip] = useState<DailyTrip | null>(null);
  const [editingWeeklyTrip, setEditingWeeklyTrip] = useState<WeeklyTrip | null>(null);
  const [evaluatingPrivateTrip, setEvaluatingPrivateTrip] = useState<PrivateTripRequest | null>(null);
  const [selectedVehicleForModal, setSelectedVehicleForModal] = useState<VehicleDetailsData | null>(null);
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

  /* ---- HANDLERS ---- */
  // Company handlers return an error message (or null) so the modal can stay open and show it when the save fails
  const handleAddCompany = async (c: any): Promise<string | null> => {
    const result = await addTransportCompany(c);
    if (!result.ok) return result.error;
    const saved = result.record;
    const mapped: Company = {
      ...saved,
      name: saved.company_name || saved.name || "شركة نقل",
      phone: saved.phone_number || saved.phone || "",
      status: saved.verification_status || saved.status || "موثق",
    };
    setCompanies((prev) => [mapped, ...prev]);
    setShowAddCompany(false);
    return null;
  };
  const handleUpdateCompany = async (updated: Company): Promise<string | null> => {
    const result = await updateTransportCompany(updated.contract_number, updated);
    if (!result.ok) return result.error;
    setCompanies((prev) => prev.map(c => c.contract_number === updated.contract_number ? updated : c));
    setEditingCompany(null);
    return null;
  };
  const handleVerifyGuide = async (lic: string, status: "موثق" | "مرفوض") => {
    const targetGuide = guides.find(g => g.license_number === lic);
    const res = await apiVerifyGuide(lic, status);
    if (res.status !== "success") {
      alert("❌ لم يتم تحديث حالة المرشد في قاعدة البيانات.\n" + res.message);
      return;
    }
    setGuides(prev => prev.map(g => g.license_number === lic ? { ...g, verification_status: status } : g));
    setViewingGuide(null);
    alert(status === "موثق"
      ? `✅ تم اعتماد وتفعيل حساب المرشد (${targetGuide?.full_name || lic}) بنجاح، ويمكنه الآن تسجيل الدخول ببريده الإلكتروني.`
      : `❌ تم رفض طلب المرشد (${targetGuide?.full_name || lic}) وتحديث حالته بنجاح.`);
  };

  // Transport directory, hotels and restaurants are read from DelniDB through Laravel only
  const reloadDirectory = async () => {
    const [comp, veh, drv, hotelRows, restaurantRows, guideRows, touristRows, placeRows] = await Promise.all([
      laravelRequest<any[]>("GET", "/transport/companies"),
      laravelRequest<any[]>("GET", "/transport/vehicles"),
      laravelRequest<any[]>("GET", "/transport/drivers"),
      apiGetHotels(),
      apiGetRestaurants(),
      laravelRequest<any[]>("GET", "/guides"),
      laravelRequest<any[]>("GET", "/tourists"),
      apiGetPlaces(),
    ]);
    if (comp.ok && Array.isArray(comp.data)) setCompanies(comp.data.map(mapCompanyRow));
    if (veh.ok && Array.isArray(veh.data)) setVehicles(veh.data.map(mapVehicleRow));
    if (drv.ok && Array.isArray(drv.data)) setDrivers(drv.data.map(mapDriverRow));
    setHotels(hotelRows.map(mapHotelRow));
    setRestaurants(restaurantRows.map(mapRestaurantRow));
    if (guideRows.ok && Array.isArray(guideRows.data)) setGuides(guideRows.data.map(mapGuideRow));
    if (touristRows.ok && Array.isArray(touristRows.data)) setTourists(touristRows.data);
    setAttractions(placeRows.map(mapPlaceRow));
  };

  // Re-reads all trips (active and cancelled) from DelniDB after a confirmed change
  const reloadTrips = async () => {
    const [daily, weekly] = await Promise.all([apiGetDailyTrips(true), apiGetWeeklyTrips(true)]);
    setDailyTrips(daily.map(mapDailyTripRow));
    setWeeklyTrips(weekly.map(mapWeeklyTripRow));
  };

  // Fetch live guides and admin data from DelniDB
  useEffect(() => {
    async function fetchAdminData() {
      reloadDirectory();
      const res = await apiGetAdminDashboard();
      if (!res) return;

      if (Array.isArray(res.daily_trips)) setDailyTrips(res.daily_trips.map(mapDailyTripRow));
      if (Array.isArray(res.weekly_trips)) setWeeklyTrips(res.weekly_trips.map(mapWeeklyTripRow));

      if (res.private_trips && Array.isArray(res.private_trips)) {
        setPrivateTrips(res.private_trips);
      }

      if (res.daily_bookings && Array.isArray(res.daily_bookings)) {
        setDailyBookings(res.daily_bookings);
      }

      if (res.weekly_bookings && Array.isArray(res.weekly_bookings)) {
        setWeeklyBookings(res.weekly_bookings);
      }

      if (Array.isArray(res.daily_offers)) setDailyOffers(res.daily_offers.map(mapDailyOfferRow));
      if (Array.isArray(res.weekly_offers)) setWeeklyOffers(res.weekly_offers.map(mapWeeklyOfferRow));

    }
    fetchAdminData();
  }, []);



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
          destination: data.destination || data.destination_city || "",
          destinations: data.destinations || [],
          place_ids: data.place_ids || [],
          places: data.places || [],
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
        if (res.status === "error") {
          alert("❌ لم يتم حفظ الرحلة في قاعدة البيانات.\n" + res.message);
          return;
        }
        await reloadTrips();
        alert("✅ " + (res.message || "تم حفظ الرحلة اليومية بنجاح"));
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
          place_ids: data.place_ids || [],
          destinations: data.destinations || [],
          is_active: data.is_active !== undefined ? Boolean(data.is_active) : true,
        };
        const res = await apiCreateWeeklyTrip(payload);
        if (res.status === "error") {
          alert("❌ لم يتم حفظ الرحلة.\n" + res.message);
          return;
        }
        await reloadTrips();
        alert("✅ " + (res.message || "تم حفظ الرحلة الأسبوعية بنجاح"));
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
      if (res.status === "error") {
        alert("❌ لم يتم حفظ التعديل في قاعدة البيانات.\n" + res.message);
        return;
      }
      await reloadTrips();
      alert("✅ " + (res.message || "تم تحديث الرحلة اليومية بنجاح"));
    } catch (err: any) {
      alert("حدث خطأ أثناء تعديل الرحلة: " + (err.message || "فشل الاتصال"));
      return;
    }
    setEditingDailyTrip(null);
  };

  const handleCancelDailyTrip = async (id: string) => {
    if (!confirm("سيتم إلغاء هذه الرحلة وإيقاف الحجز عليها وإشعار المرشد والسائق والشركة والسياح المحجوزين.\nلن يُحذف أي شيء من قاعدة البيانات. هل تريد المتابعة؟")) return;
    const res = await apiCancelDailyTrip(id);
    alert((res.ok ? "✅ " : "❌ ") + res.message);
    if (res.ok) await reloadTrips();
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
        place_ids: (updated as any).place_ids || [],
        destinations: (updated as any).destinations || [],
        is_active: (updated as any).is_active !== undefined ? Boolean((updated as any).is_active) : true,
      };
      const res = await apiUpdateWeeklyTrip(tripId, payload);
      if (res.status === "error") {
        alert("❌ لم يتم حفظ التعديل في قاعدة البيانات.\n" + res.message);
        return;
      }
      await reloadTrips();
      alert("✅ " + (res.message || "تم تعديل الرحلة الأسبوعية بنجاح"));
    } catch (err: any) {
      alert("حدث خطأ أثناء تعديل الرحلة: " + (err.message || "فشل الاتصال"));
      return;
    }
    setEditingWeeklyTrip(null);
  };

  const handleCancelWeeklyTrip = async (id: string) => {
    if (!confirm("سيتم إلغاء هذه الرحلة وإيقاف الحجز عليها وإشعار المرشد والسائق والشركة والسياح المحجوزين.\nلن يُحذف أي شيء من قاعدة البيانات. هل تريد المتابعة؟")) return;
    const res = await apiCancelWeeklyTrip(id);
    alert((res.ok ? "✅ " : "❌ ") + res.message);
    if (res.ok) await reloadTrips();
  };
  const handleSavePrivate = async (
    id: string,
    status: string,
    price?: number,
    plan?: string,
    guide?: string,
    vehicle?: string,
    selectedHotelIds?: string[],
    structuredStations?: any[],
    additionalExpenses?: number
  ) => {
    const existing = privateTrips.find(p => p.private_trip_id === id);
    const updatedTrip = {
      ...(existing || {}),
      private_trip_id: id,
      status_order: status,
      quoted_price: price !== undefined ? price : existing?.quoted_price,
      additional_expenses: additionalExpenses !== undefined ? additionalExpenses : (existing?.additional_expenses || 0),
      admin_itinerary_plan: plan !== undefined ? plan : existing?.admin_itinerary_plan,
      guide_license_number: guide || existing?.guide_license_number,
      assigned_guide: guide || existing?.assigned_guide,
      assigned_vehicle: vehicle || existing?.assigned_vehicle,
      vehicle_plate: vehicle || existing?.vehicle_plate || existing?.assigned_vehicle,
      hotel_ids: selectedHotelIds || existing?.hotel_ids || [],
      stations: structuredStations || existing?.stations || [],
    };

    const res = await apiReviewPrivateTrip(id, {
      status_order: status,
      quoted_price: updatedTrip.quoted_price,
      additional_expenses: updatedTrip.additional_expenses,
      guide_license_number: updatedTrip.guide_license_number || undefined,
      vehicle_plate: updatedTrip.vehicle_plate || undefined,
      hotel_ids: updatedTrip.hotel_ids,
      stations: updatedTrip.stations,
      admin_notes: plan || undefined,
    });
    if (!res.success) {
      alert("❌ لم يتم حفظ مراجعة الرحلة الخاصة.\n" + res.error);
      return;
    }
    setPrivateTrips((prev: any) => prev.map((p: any) => p.private_trip_id === id ? res.data : p));
    setEvaluatingPrivateTrip(null);

    if (res.data?.status_order === "بانتظار رد المرشد") {
      alert(`✅ تم اعتماد جدول المحطات وتسعيرة الرحلة (${price} د.ل) وإرسالها للمرشد للموافقة عليها.\nبعد موافقة المرشد يصل العرض للسائح تلقائياً، وإذا اعتذر يصلك إشعار لتعيين مرشد آخر.${res.warning ? "\n\n" + res.warning : ""}`);
    } else if (status === "مرفوضة من الأدمن") {
      alert(`تم تسجيل رفض طلب الرحلة الخاصة (#${id}).`);
    }
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

  // Returns an error message for the form, or null once DelniDB confirmed the save
  const handleSaveHotel = async (h: any, isNew: boolean): Promise<string | null> => {
    const res = await apiSaveHotel(toHotelPayload(h), isNew);
    if (!res.success) return res.error;
    const row = mapHotelRow(res.data);
    setHotels((prev) => isNew ? [row, ...prev] : prev.map(x => x.id === row.id ? row : x));
    if (isNew) setShowAddHotel(false);
    else setEditingHotel(null);
    return null;
  };
  const handleSaveRestaurant = async (r: any, isNew: boolean): Promise<string | null> => {
    const res = await apiSaveRestaurant(toRestaurantPayload(r), isNew);
    if (!res.success) return res.error;
    const row = mapRestaurantRow(res.data);
    setRestaurants((prev) => isNew ? [row, ...prev] : prev.map(x => x.id === row.id ? row : x));
    if (isNew) setShowAddRestaurant(false);
    else setEditingRestaurant(null);
    return null;
  };

  const handleToggleTouristStatus = async (touristId: string, currentStatus: string) => {
    const newStatus = currentStatus === "مقيّد" ? "نشط" : "مقيّد";
    const actionText = newStatus === "مقيّد"
      ? "تقييد حساب هذا السائح ومنعه من حجز أي رحلات جديدة على المنصة"
      : "إلغاء التقييد وتنشيط حساب السائح للسماح له بالحجز مجدداً";

    if (!confirm(`هل أنت متأكد من ${actionText}؟\n(رقم الجواز / المعرف: ${touristId})`)) return;

    const res = await laravelRequest("PUT", `/tourists/${encodeURIComponent(touristId)}/status`, { account_status: newStatus });
    if (!res.ok) {
      alert("❌ لم يتم تحديث حالة السائح في قاعدة البيانات.\n" + res.error);
      return;
    }
    setTourists(prev => prev.map(t => t.tourist_id === touristId ? { ...t, account_status: newStatus } : t));
    if (selectedTouristDetail && selectedTouristDetail.tourist_id === touristId) {
      setSelectedTouristDetail((prev: any) => ({ ...prev, account_status: newStatus }));
    }
    alert(res.body?.message || `تم تغيير حالة الحساب إلى: ${newStatus}`);
  };

  const handleViewTourist = async (t: any) => {
    setSelectedTouristDetail(t);
    setLoadingTouristDetail(true);
    const res = await laravelRequest("GET", `/tourists/${encodeURIComponent(t.tourist_id)}`);
    if (res.ok && res.data) setSelectedTouristDetail(res.data);
    setLoadingTouristDetail(false);
  };

  const handleSaveAttraction = async (a: any, isNew: boolean) => {
    const res = await laravelRequest("POST", "/places", { ...toPlacePayload(a), isNew });
    if (!res.ok) {
      alert("❌ " + (isNew ? "لم تتم إضافة المعلم السياحي." : "لم يتم تعديل بيانات المعلم السياحي.") + "\n" + res.error);
      return;
    }
    const row = mapPlaceRow(res.data);
    setAttractions((prev) => isNew ? [...prev, row] : prev.map(x => x.place_id === row.place_id ? row : x));
    if (isNew) setShowAddAttraction(false);
    else setEditingAttraction(null);
    alert(isNew ? `✅ تمت إضافة المعلم السياحي (${row.place_name}) بنجاح.` : `✅ تم تعديل بيانات المعلم السياحي (${row.place_name}) بنجاح.`);
  };
  const handleReplyTicket = (ticketId: string, reply: string) => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, reply, status: "تم الرد" as const } : t);
    setTickets(updated);
    try {
      localStorage.setItem("dalni_support_tickets", JSON.stringify(updated));
    } catch {}
  };
  // Daily Trip Offers (DelniDB offers_daily_trips)
  const saveOffer = async (kind: "daily" | "weekly", o: any, isNew: boolean) => {
    const res = kind === "daily" ? await apiCreateDailyOffer(o) : await apiCreateWeeklyOffer(o);
    if (!res.success) {
      alert("❌ لم يتم حفظ العرض في قاعدة البيانات.\n" + res.error);
      return;
    }
    if (kind === "daily") {
      const row = mapDailyOfferRow(res.offer);
      setDailyOffers(prev => isNew ? [row, ...prev] : prev.map(x => (x.offer_daily_id || x.id) === row.offer_daily_id ? row : x));
      if (isNew) setShowAddDailyOffer(false); else setEditingDailyOffer(null);
    } else {
      const row = mapWeeklyOfferRow(res.offer);
      setWeeklyOffers(prev => isNew ? [row, ...prev] : prev.map(x => (x.offer_weekly_id || x.id) === row.offer_weekly_id ? row : x));
      if (isNew) setShowAddWeeklyOffer(false); else setEditingWeeklyOffer(null);
    }
  };
  const endOffer = async (kind: "daily" | "weekly", id: string) => {
    if (!confirm("سيتم إنهاء هذا العرض ولن يظهر للسياح بعد الآن، دون حذفه من قاعدة البيانات. هل تريد المتابعة؟")) return;
    const res = kind === "daily" ? await apiEndDailyOffer(id) : await apiEndWeeklyOffer(id);
    alert((res.ok ? "✅ " : "❌ ") + res.message);
    if (!res.ok) return;
    const all = kind === "daily" ? await apiGetDailyOffers(true) : await apiGetWeeklyOffers(true);
    if (kind === "daily") setDailyOffers(all.map(mapDailyOfferRow));
    else setWeeklyOffers(all.map(mapWeeklyOfferRow));
  };
  // Bot & Live Support Chat Override
  const handleBotSend = () => {
    if (!botInput.trim() || !activeChatId) return;
    sendAdminReply(activeChatId, botInput.trim());
    setChatSessions(getChatSessions());
    setBotInput("");
  };

  /* ---- BOOKINGS HANDLERS (DelniDB bookings_daily & bookings_weekly) ---- */
  // Payment and attendance are saved in DelniDB; the list changes only after the server confirms
  const replaceBooking = (kind: "daily" | "weekly", row: any) => {
    if (kind === "daily") setDailyBookings(prev => prev.map(b => (b.booking_daily_id === row.booking_daily_id ? { ...b, ...row } : b)));
    else setWeeklyBookings(prev => prev.map(b => (b.booking_weekly_id === row.booking_weekly_id ? { ...b, ...row } : b)));
  };
  const updateBooking = async (kind: "daily" | "weekly", id: string, field: "payment" | "attendance") => {
    const list: any[] = kind === "daily" ? dailyBookings : weeklyBookings;
    const current = list.find(b => (kind === "daily" ? b.booking_daily_id : b.booking_weekly_id) === id);
    if (!current) return;
    const res = field === "payment"
      ? await apiSetBookingPayment(kind, id, current.payment_status !== "paid")
      : await apiSetBookingAttendance(kind, id, !current.attended);
    if (!res.success) {
      alert("❌ لم يتم حفظ التعديل في قاعدة البيانات.\n" + res.error);
      return;
    }
    replaceBooking(kind, res.data);
  };
  const handleTogglePaymentDaily = (id: string) => updateBooking("daily", id, "payment");
  const handleToggleAttendedDaily = (id: string) => updateBooking("daily", id, "attendance");
  const handleTogglePaymentWeekly = (id: string) => updateBooking("weekly", id, "payment");
  const handleToggleAttendedWeekly = (id: string) => updateBooking("weekly", id, "attendance");

  /* ---- TICKET SCANNER & VERIFICATION (DelniDB e-ticket validation) ---- */
  const [scanCode, setScanCode] = useState("");
  const [scannedTicket, setScannedTicket] = useState<any | null>(null);
  const [scanStatusMsg, setScanStatusMsg] = useState<{ type: "success" | "error" | "info"; msg: string } | null>(null);

  const handleVerifyTicketCode = async (codeToSearch: string) => {
    const raw = codeToSearch.trim();
    if (!raw) {
      setScanStatusMsg({ type: "error", msg: "يرجى كتابة أو مسح رمز التذكرة والباركود أولاً." });
      return;
    }
    const res = await apiFindTicket(raw);
    if (!res.success) {
      setScannedTicket(null);
      setScanStatusMsg({ type: "error", msg: `❌ ${res.error} (${raw})` });
      return;
    }
    const b = res.data;
    const isDaily = res.kind === "daily";
    setScannedTicket({
      code: isDaily ? b.booking_daily_id : b.booking_weekly_id,
      isDaily,
      touristName: b.tourist_name || b.tourist_id,
      touristId: b.tourist_id,
      tripTitle: b.trip_title || (isDaily ? "رحلة يومية" : "رحلة أسبوعية"),
      seats: Number(b.number_of_seats) || 1,
      totalPrice: Number(b.total_price) || 0,
      paymentStatus: b.payment_status || "unpaid",
      attended: !!b.attended,
      bookingStatus: b.booking_status || "",
      // A daily ticket is for one run date; otherwise show when it was booked
      date: isDaily && b.trip_date ? String(b.trip_date).slice(0, 10) : (b.booking_date ? new Date(b.booking_date).toLocaleDateString("ar-LY") : ""),
      guideName: b.guide_name || "—",
      rawBooking: b,
    });
    setScanStatusMsg({ type: "success", msg: "✅ تم العثور على التذكرة ومطابقتها بنجاح في قاعدة بيانات منصة دلّني!" });
  };

  // Cash received and tourist checked in, saved in DelniDB (the server notifies the tourist)
  const handleConfirmAndPayTicket = async () => {
    if (!scannedTicket) return;
    const kind = scannedTicket.isDaily ? "daily" : "weekly";
    const res = await apiCheckInBooking(kind, scannedTicket.code);
    if (!res.success) {
      setScanStatusMsg({ type: "error", msg: "❌ لم يتم تأكيد التذكرة في قاعدة البيانات: " + res.error });
      return;
    }
    replaceBooking(kind, res.data);
    setScannedTicket((prev: any) => ({ ...prev, paymentStatus: "paid", attended: true, bookingStatus: res.data.booking_status }));
    setScanStatusMsg({
      type: "success",
      msg: `🎉 ممتاز! تم تأكيد تسجيل السائح (${scannedTicket.touristName}) وسداد التذكرة (${scannedTicket.code}) لعدد (${scannedTicket.seats}) مقاعد بنجاح، وتم إرسال إشعار فوري للسائح!`
    });
  };

  const { language } = useLanguage();
  const isAr = language === 'ar';

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "📊" },
    // Badges count only items waiting for the admin (hidden at zero)
    { id: "scanner", label: isAr ? "مسح الباركود وتأكيد التذاكر" : "QR Ticket Scanner", icon: "📷" },
    { id: "companies", label: isAr ? "شركات النقل" : "Transport Companies", icon: "🚌" },
    { id: "drivers", label: isAr ? "السائقون المسجلون" : "Registered Drivers", icon: "🧑‍✈️" },
    { id: "guides", label: isAr ? "اعتماد وثائق المرشدين" : "Guide Verification", icon: "🗺️", badge: guides.filter(g => g.verification_status?.includes("بانتظار") || g.verification_status?.includes("انتظار") || g.verification_status?.includes("مراجعة")).length || undefined },
    { id: "tourists", label: isAr ? "إدارة وتقييد السياح" : "Tourists Management", icon: "👥" },
    { id: "trips", label: isAr ? "إدارة وتعيين الرحلات" : "Manage & Assign Tours", icon: "🧭", badge: [...weeklyTrips, ...dailyTrips].filter(t => t.guide_approval_status === "اعتذر المرشد").length || undefined },
    { id: "bookings", label: isAr ? "سجل الحجوزات والدفع" : "Bookings & Payments", icon: "🎟️", badge: [...dailyBookings, ...weeklyBookings].filter(b => b.payment_status !== "paid").length || undefined },
    { id: "offers", label: isAr ? "العروض الترويجية" : "Promotions & Offers", icon: "🎯" },
    { id: "private_trips", label: isAr ? "الرحلات الخاصة" : "Private Custom Trips", icon: "👑", badge: privateTrips.filter(p => p.status_order === "قيد الدراسة" || p.status_order === "اعتذر المرشد").length || undefined },
    { id: "entities", label: isAr ? "المرافق والوجهات" : "Entities & Stays", icon: "🏛️" },
    { id: "reviews", label: isAr ? "التقييمات والمراجعات" : "Reviews & Ratings", icon: "⭐" },
    { id: "analytics", label: isAr ? "إحصائيات الأكثر حجزاً وتقييماً" : "Analytics & Stats", icon: "📈" },
    { id: "inquiries_chat", label: isAr ? "الاستفسارات والشات بوت" : "Inquiries & AI Chat", icon: "💬", badge: chatSessions.filter(s => s.unread).length || undefined },
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
        <StatCard label={isAr ? "طلبات اعتماد المرشدين" : "Guide Verification Requests"} value={guides.filter(g => g.verification_status?.includes("بانتظار") || g.verification_status?.includes("انتظار") || g.verification_status?.includes("مراجعة")).length} hint={isAr ? "وثائق بانتظار المراجعة" : "Pending documents review"} icon="🗺️" tone="sun" />
        <StatCard label={isAr ? "الرحلات الخاصة VIP" : "VIP Custom Trips"} value={privateTrips.length} hint={isAr ? `${privateTrips.filter(p => p.status_order === "قيد الدراسة").length} طلبات جديدة` : `${privateTrips.filter(p => p.status_order === "قيد الدراسة").length} New Requests`} icon="👑" tone="green" />
      </div>

      {/* OVERVIEW TAB */}
      {active === "overview" && (
        <div className="grid lg:grid-cols-3 gap-6 text-right">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="أحدث طلبات توثيق المرشدين السياحيين الواردة" action={<button onClick={() => setActive("guides")} className="text-primary text-sm font-black hover:underline cursor-pointer">عرض الكل ({guides.length})</button>}>
              {guides.filter(g => g.verification_status?.includes("بانتظار") || g.verification_status?.includes("انتظار") || g.verification_status?.includes("مراجعة") || g.verification_status === "معلق").length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-muted-foreground bg-slate-50 rounded-xl border border-slate-200">
                  لا توجد طلبات توثيق مرشدين معلقة حالياً. {guides.length > 0 && <button onClick={() => setActive("guides")} className="text-primary underline mr-1 cursor-pointer">عرض سجل المرشدين المعتمدين ({guides.length})</button>}
                </div>
              ) : (
                <div className="space-y-3">
                  {guides.filter(g => g.verification_status?.includes("بانتظار") || g.verification_status?.includes("انتظار") || g.verification_status?.includes("مراجعة") || g.verification_status === "معلق").map((g) => (
                    <div key={g.license_number} className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                        {g.avatar ? (
                          <img src={g.avatar} alt={g.full_name} className="w-11 h-11 rounded-full object-cover border border-amber-300" />
                        ) : (
                          <div className="w-11 h-11 rounded-full bg-amber-100 text-amber-800 grid place-items-center text-lg font-black">
                            🗺️
                          </div>
                        )}
                        <div>
                          <div className="font-black text-foreground text-sm flex items-center gap-2">
                            <span>{g.full_name}</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200 font-bold">{g.license_number}</span>
                          </div>
                          {g.email && <div className="text-xs text-primary font-bold mt-0.5">✉️ {g.email} • 📞 {g.phone_number}</div>}
                          <div className="text-xs text-muted-foreground mt-0.5">📜 {g.certificate_name || g.certificate || "ترخيص سياحي رسمي"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setViewingGuide(g)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-xs hover:opacity-95 transition cursor-pointer">
                          معاينة الوثائق والاعتماد 📄
                        </button>
                        <button onClick={() => handleVerifyGuide(g.license_number, "موثق")} className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs transition cursor-pointer">
                          قبول فوري ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                <QuickAction icon="🏛️" label="معلم سياحي" onClick={() => setShowAddAttraction(true)} />
                <QuickAction icon="🎯" label="عرض يومي" onClick={() => setShowAddDailyOffer(true)} />
                <QuickAction icon="🎁" label="عرض أسبوعي" onClick={() => setShowAddWeeklyOffer(true)} />
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* SCANNER & VERIFICATION TAB */}
      {active === "scanner" && (
        <div className="space-y-6 text-right animate-in fade-in duration-200">
          {/* Header Explanation Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-[#003580] to-indigo-900 text-white shadow-md relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-lg">📷</span>
                  <h2 className="text-xl font-black">محطة مسح الباركود وتأكيد التذاكر الإلكترونية</h2>
                </div>
                <p className="text-xs sm:text-sm text-blue-100 max-w-2xl font-medium leading-relaxed">
                  عند حضور السائح لمقر الشركة أو نقطة الانطلاق، امسح رمز الـ QR من شاشة هاتف السائح بواسطة قارئ الباركود أو كاميرا الهاتف، أو أدخل رقم التذكرة لمطابقة بيانات الحجز وتأكيد الدفع والتسجيل فورياً في قاعدة البيانات.
                </p>
              </div>
              <div className="shrink-0 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-center">
                <div className="text-[10px] text-blue-200 font-bold">الحجوزات النشطة</div>
                <div className="text-xl font-black text-white">{dailyBookings.length + weeklyBookings.length}</div>
              </div>
            </div>
          </div>

          {/* Scanner Input Station */}
          <SectionCard title="🔍 إدخال أو مسح رمز التذكرة والباركود">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerifyTicketCode(scanCode);
              }}
              className="space-y-4"
            >
              <div className="flex flex-col sm:flex-row gap-3 items-stretch">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                    placeholder="امسح الباركود بجهاز الماسح الضوئي أو اكتب رقم التذكرة (مثال: DL-68835 أو BK-D-101)..."
                    className="w-full h-13 px-4 pl-12 rounded-2xl border-2 border-slate-200 focus:border-[#003580] focus:ring-4 focus:ring-blue-100 font-mono text-base font-black text-slate-800 outline-none transition bg-white"
                    autoFocus
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                    📷
                  </span>
                </div>
                <button
                  type="submit"
                  className="px-8 h-13 rounded-2xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  <span>تحقق من التذكرة 🔍</span>
                </button>
              </div>

              {/* Quick sample chips from real bookings */}
              <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
                <span className="text-slate-500 font-bold">تذاكر سريعة للتجربة:</span>
                {[...dailyBookings.slice(0, 3), ...weeklyBookings.slice(0, 2)].map((b: any, idx) => {
                  const c = b.booking_daily_id || b.booking_weekly_id || `DL-${10000 + idx}`;
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setScanCode(c);
                        handleVerifyTicketCode(c);
                      }}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition border border-slate-200 cursor-pointer"
                    >
                      {c} ({b.tourist_name || b.tourist_id || "سائح"})
                    </button>
                  );
                })}
              </div>

              {/* Status Message */}
              {scanStatusMsg && (
                <div
                  className={`p-4 rounded-2xl border-2 text-xs sm:text-sm font-bold flex items-center gap-2.5 animate-in fade-in duration-200 ${
                    scanStatusMsg.type === "success"
                      ? "bg-emerald-50 border-emerald-300 text-emerald-900"
                      : scanStatusMsg.type === "error"
                      ? "bg-red-50 border-red-300 text-red-900"
                      : "bg-blue-50 border-blue-300 text-blue-900"
                  }`}
                >
                  <span className="text-lg">
                    {scanStatusMsg.type === "success" ? "✅" : scanStatusMsg.type === "error" ? "⚠️" : "ℹ️"}
                  </span>
                  <span>{scanStatusMsg.msg}</span>
                </div>
              )}
            </form>
          </SectionCard>

          {/* Verified Scanned Ticket Card */}
          {scannedTicket && (
            <SectionCard title="🎫 بيانات التذكرة المفحوصة والمطابقة">
              <div className="p-6 rounded-2xl bg-white border-2 border-slate-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#003580] text-white flex items-center justify-center text-2xl font-black shadow-sm">
                      🎫
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-black text-slate-900 font-mono">{scannedTicket.code}</h3>
                        <Badge tone={scannedTicket.isDaily ? "sea" : "sun"}>
                          {scannedTicket.isDaily ? "رحلة يومية" : "رحلة أسبوعية"}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{scannedTicket.tripTitle}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-xl font-black text-xs border ${
                        scannedTicket.paymentStatus === "paid"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {scannedTicket.paymentStatus === "paid" ? "✓ مسدد ومؤكد" : "⏳ بانتظار السداد الميداني"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-xl font-black text-xs border ${
                        scannedTicket.attended
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-stone-50 text-stone-600 border-stone-200"
                      }`}
                    >
                      {scannedTicket.attended ? "✓ تم الحضور" : "لم يسجل الحضور"}
                    </span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">👤 السائح / المسافر</div>
                    <div className="font-black text-slate-800 text-sm truncate">{scannedTicket.touristName}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{scannedTicket.touristId}</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">👥 المقاعد المحجوزة</div>
                    <div className="font-black text-[#003580] text-sm">{scannedTicket.seats} مقاعد معتمدة</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5">شاملة التأمين المعتمد</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">💰 إجمالي المبلغ</div>
                    <div className="font-black text-emerald-600 text-base">{scannedTicket.totalPrice} د.ل</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">الدفع نقداً أو إلكترونياً</div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">🧭 المرشد المرافق</div>
                    <div className="font-black text-slate-800 text-sm truncate">{scannedTicket.guideName}</div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">مرشد سياحي معتمد</div>
                  </div>
                </div>

                {/* Confirm & Settle Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="text-xs text-slate-600 font-medium">
                    {scannedTicket.paymentStatus === "paid" && scannedTicket.attended ? (
                      <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                        <span>✅</span>
                        <span>هذه التذكرة مؤكدة ومسددة ومسجلة في قاعدة البيانات بالفعل.</span>
                      </span>
                    ) : (
                      <span className="text-slate-700 font-bold flex items-center gap-1.5">
                        <span>💡</span>
                        <span>انقر على الزر لتأكيد استلام الدفع وتثبيت مقاعد السائح رسمياً في النظام.</span>
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmAndPayTicket}
                    className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    <span>✅ تأكيد سداد الحجز وتثبيت الحضور في النظام</span>
                  </button>
                </div>
              </div>
            </SectionCard>
          )}
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
                    <td className="py-3 text-muted-foreground font-bold">
                      {d.assigned_vehicle_plate}
                      {d.current_trip_stage && <div className="text-[10px] font-bold text-primary mt-0.5">🧭 {d.current_trip_stage}</div>}
                    </td>
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
        <SectionCard 
          title="سجل وجدول المرشدين السياحيين المسجلين في المنصة"
          action={
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-muted-foreground">
                إجمالي المرشدين: <span className="font-mono text-primary font-black">{guides.length}</span> (
                <span className="text-emerald-600">{guides.filter(g => g.verification_status === "موثق").length} معتمد</span> — 
                <span className="text-amber-600 mr-1">{guides.filter(g => g.verification_status?.includes("بانتظار") || g.verification_status?.includes("انتظار") || g.verification_status?.includes("مراجعة")).length} بانتظار الاعتماد</span>
                )
              </span>
            </div>
          }
        >
          <div className="mb-4 p-3 rounded-xl bg-sun-soft/30 border border-sun/20 text-xs text-muted-foreground font-semibold text-right flex flex-wrap justify-between items-center gap-2">
            <span>📌 جدول تفصيلي شامل لكافة المرشدين السياحيين المسجلين في قاعدة بيانات دِلني (سواء تم اعتمادهم وتوثيقهم أو بانتظار موافقة الإدارة).</span>
          </div>

          {guides.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-border text-muted-foreground text-xs font-bold">
              لا يوجد مرشدين مسجلين في قاعدة البيانات حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto text-right">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-right text-xs text-muted-foreground border-b border-border bg-slate-50/60">
                    <th className="py-3 px-3 font-bold">المرشد السياحي</th>
                    <th className="py-3 px-3 font-bold">رقم الرخصة</th>
                    <th className="py-3 px-3 font-bold">المعالم المعتمدة والأيام</th>
                    <th className="py-3 px-3 font-bold">الهاتف والبريد</th>
                    <th className="py-3 px-3 font-bold">الخبرة والأجر</th>
                    <th className="py-3 px-3 font-bold">وثيقة الترخيص المرفقة</th>
                    <th className="py-3 px-3 font-bold">حالة الحساب</th>
                    <th className="py-3 px-3 font-bold text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {guides.map((g) => (
                    <tr key={g.license_number} className="hover:bg-slate-50/70 transition">
                      {/* Name & Avatar */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          {g.avatar ? (
                            <img src={g.avatar} alt={g.full_name} className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 grid place-items-center text-base shrink-0 border border-slate-200">
                              👤
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-black text-foreground text-sm">{g.full_name}</div>
                            {g.title && <div className="text-[11px] text-primary font-bold">{g.title}</div>}
                          </div>
                        </div>
                      </td>

                      {/* License Number */}
                      <td className="py-3 px-3 font-mono text-xs font-bold text-slate-800">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {g.license_number}
                        </span>
                      </td>

                      {/* Normalized Landmarks & Days */}
                      <td className="py-3 px-3 max-w-[220px]">
                        <div className="flex flex-col gap-1">
                          {g.places && g.places.length > 0 ? (
                            <span className="text-xs font-bold text-[#EA580C] bg-orange-50/80 px-2.5 py-0.5 rounded-lg border border-orange-200/60 block truncate" title={g.places.map((p: any) => p.place_name).join('، ')}>
                              🏛️ {g.places.length} معالم: {g.places.map((p: any) => p.place_name).slice(0, 2).join('، ')}{g.places.length > 2 ? '...' : ''}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-200 block truncate">
                              🏛️ غير محدد
                            </span>
                          )}
                          {Array.isArray(g.working_days) && g.working_days.length > 0 ? (
                            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 block truncate">
                              📅 {g.working_days.slice(0, 3).join('، ')}{g.working_days.length > 3 ? '...' : ''}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-semibold text-slate-700">{g.phone_number || "—"}</div>
                        {g.email && <div className="text-[11px] text-muted-foreground">{g.email}</div>}
                      </td>

                      {/* Experience & Daily Rate */}
                      <td className="py-3 px-3">
                        <div className="text-xs font-bold text-foreground">
                          {g.years_of_experience ? `${g.years_of_experience} سنوات خبرة` : "—"}
                        </div>
                        <div className="text-[11px] font-black text-emerald-700">
                          {(g.daily_rate || g.price_per_day) ? `${g.daily_rate || g.price_per_day} د.ل / اليوم` : "السعر غير محدد"}
                        </div>
                      </td>

                      {/* Certificate Document */}
                      <td className="py-3 px-3">
                        {g.digital_certificate_file || g.certificate_name ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold text-slate-800 truncate max-w-[170px]" title={g.certificate_name || g.certificate}>
                              📄 {g.certificate_name || "مستند ترخيص"}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-bold">✓ وثيقة مرفوعة</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">لا يوجد ملف مرفق</span>
                        )}
                      </td>

                      {/* Verification Status Badge */}
                      <td className="py-3 px-3">
                        <Badge tone={g.verification_status === "موثق" ? "green" : g.verification_status === "مرفوض" ? "red" : "sun"}>
                          {g.verification_status || "بانتظار التوثيق"}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setViewingGuide(g)}
                            className="px-3 py-1.5 bg-gradient-sea text-white rounded-lg text-xs font-black shadow-xs hover:opacity-95 transition cursor-pointer flex items-center gap-1"
                            title="معاينة الوثائق واعتماد الحساب"
                          >
                            <span>فحص واعتماد</span>
                            <span>📄</span>
                          </button>
                          {g.verification_status !== "موثق" && (
                            <button
                              onClick={() => handleVerifyGuide(g.license_number, "موثق")}
                              className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-black transition cursor-pointer"
                              title="اعتماد فوري"
                            >
                              قبول ✓
                            </button>
                          )}
                          {g.verification_status === "موثق" && (
                            <button
                              onClick={() => {
                                // Admin preview / direct access to guide dashboard
                                const guideUser = {
                                  license_number: g.license_number,
                                  full_name: g.full_name,
                                  phone_number: g.phone_number,
                                  email: g.email || `${g.license_number.toLowerCase()}@dalni.ly`,
                                  verification_status: "موثق",
                                  role: "guide",
                                  years_of_experience: g.years_of_experience,
                                  price_per_day: g.price_per_day,
                                  avatar: g.avatar,
                                };
                                localStorage.setItem("dalni_user", JSON.stringify(guideUser));
                                localStorage.setItem("dalni_role", "guide");
                                window.dispatchEvent(new Event("storage"));
                                window.open("/dashboard/guide", "_blank");
                              }}
                              className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1"
                              title="فتح لوحة تحكم المرشد في نافذة جديدة"
                            >
                              <span>الداش بورد</span>
                              <span>🧭</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}

      {/* TOURISTS TAB (إدارة وتقييد حسابات السياح) */}
      {active === "tourists" && (
        <div className="space-y-6 text-right">
          {/* Information & Privacy Notice */}
          <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50/70 text-xs font-semibold text-blue-950 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl flex-shrink-0">👥</span>
              <div>
                <span className="font-black block text-sm mb-0.5 text-[#003580]">
                  إدارة ورقابة حسابات السياح المسجلين في منصة دلّني:
                </span>
                البحث الفوري بالاسم الكامل أو برقم الجواز، متابعة سجل الحجوزات والتقييمات، مع إمكانية تقييد الحساب فورياً لمنع الحجز غير الجاد وحماية خصوصية بيانات المرور وكلمات السر 100%.
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <span className="px-3 py-1 rounded-xl bg-white border border-blue-200 text-[#003580] font-black text-xs">
                إجمالي السياح: {tourists.length}
              </span>
            </div>
          </div>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl border border-border bg-white shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground font-bold">إجمالي حسابات السياح</div>
                <div className="text-2xl font-black text-foreground mt-1">{tourists.length} سائح</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black">
                👥
              </div>
            </div>

            <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-2xs flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-800 font-bold">إجمالي حجوزات السياح المسجلة</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">
                  {tourists.reduce((acc, t) => acc + (Number(t.daily_bookings_count) || 0) + (Number(t.weekly_bookings_count) || 0), 0)} حجز
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-black">
                🎟️
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <SectionCard
            title="قائمة حسابات السياح وتفاصيل الحجوزات والملفات"
            action={
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <input
                    type="text"
                    value={touristSearch}
                    onChange={(e) => setTouristSearch(e.target.value)}
                    placeholder="🔍 ابحث بالاسم أو برقم الجواز..."
                    className="w-64 h-10 px-3.5 pr-8 rounded-xl border border-border text-xs font-bold text-right outline-none focus:border-primary bg-white shadow-2xs"
                  />
                  {touristSearch && (
                    <button
                      onClick={() => setTouristSearch("")}
                      className="absolute left-2.5 top-2.5 text-xs text-slate-400 hover:text-slate-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            }
          >
            {/* Filtered Tourists Table */}
            {tourists.filter(t => {
              const q = touristSearch.trim().toLowerCase();
              return !q ||
                (t.full_name && t.full_name.toLowerCase().includes(q)) ||
                (t.tourist_id && t.tourist_id.toLowerCase().includes(q)) ||
                (t.email && t.email.toLowerCase().includes(q)) ||
                (t.phone_number && t.phone_number.includes(q));
            }).length === 0 ? (
              <div className="p-12 text-center text-muted-foreground space-y-2">
                <div className="text-4xl">🔍</div>
                <div className="font-bold text-sm">لم يتم العثور على أي سائح يطابق معايير البحث</div>
                <p className="text-xs">تأكد من كتابة الاسم أو رقم الجواز بشكل صحيح أو قم بمسح حقل البحث.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground font-black">
                      <th className="p-3">السائح</th>
                      <th className="p-3">رقم الجواز / المعرف</th>
                      <th className="p-3">البريد الإلكتروني</th>
                      <th className="p-3">رقم الهاتف</th>
                      <th className="p-3 text-center">إجمالي الحجوزات</th>
                      <th className="p-3 text-center">الإجراءات والتحكم</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {tourists
                      .filter(t => {
                        const q = touristSearch.trim().toLowerCase();
                        return !q ||
                          (t.full_name && t.full_name.toLowerCase().includes(q)) ||
                          (t.tourist_id && t.tourist_id.toLowerCase().includes(q)) ||
                          (t.email && t.email.toLowerCase().includes(q)) ||
                          (t.phone_number && t.phone_number.includes(q));
                      })
                      .map((t) => {
                        const totalBookings = (Number(t.daily_bookings_count) || 0) + (Number(t.weekly_bookings_count) || 0);
                        return (
                          <tr key={t.tourist_id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-3 font-bold text-foreground">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-xs">
                                  {t.full_name ? t.full_name[0] : "س"}
                                </div>
                                <div className="font-black text-slate-900">{t.full_name}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-mono font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                                {t.tourist_id}
                              </span>
                            </td>
                            <td className="p-3 text-muted-foreground font-semibold">{t.email}</td>
                            <td className="p-3 text-muted-foreground font-mono font-semibold" dir="ltr">{t.phone_number}</td>
                            <td className="p-3 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 font-black text-xs">
                                🎟️ {totalBookings} حجز
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                onClick={() => handleViewTourist(t)}
                                className="px-3 py-1.5 rounded-xl bg-[#003580] hover:bg-blue-900 text-white font-black text-xs transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                              >
                                <span>👁️</span>
                                <span>عرض الحجوزات والملف</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </div>
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
                      {d.guide_approval_status === "بانتظار رد المرشد" && <Badge tone="sun">⏳ بانتظار موافقة المرشد (غير منشورة)</Badge>}
                      {d.guide_approval_status === "اعتذر المرشد" && <Badge tone="red">⚠️ اعتذر المرشد — عيّن مرشداً آخر</Badge>}
                      {d.guide_approval_status === "وافق المرشد" && <Badge tone="green">✓ وافق المرشد</Badge>}
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-black">
                        📅 أيام الانطلاق: {Array.isArray(d.recurring_days) ? d.recurring_days.join(" و ") : (d.recurring_days || "غير محددة")}
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
                    {d.is_active !== false ? <button onClick={() => handleCancelDailyTrip(d.daily_trip_id || d.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black">إلغاء الرحلة</button> : <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-black">ملغاة</span>}
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
                      {w.guide_approval_status === "بانتظار رد المرشد" && <Badge tone="sun">⏳ بانتظار موافقة المرشد (غير منشورة)</Badge>}
                      {w.guide_approval_status === "اعتذر المرشد" && <Badge tone="red">⚠️ اعتذر المرشد — عيّن مرشداً آخر</Badge>}
                      {w.guide_approval_status === "وافق المرشد" && <Badge tone="green">✓ وافق المرشد</Badge>}
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
                    {w.is_active !== false ? <button onClick={() => handleCancelWeeklyTrip(w.weekly_trip_id || w.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-black">إلغاء الرحلة</button> : <span className="px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-black">ملغاة</span>}
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
                    <th className="pb-3 font-bold">السائح</th>
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
                          <div>{b.tourist_name || b.tourist_id}</div>
                        </td>
                        <td className="py-3 text-xs font-bold text-slate-700">
                          <div>{trip?.trip_title || trip?.title || b.daily_trip_id}</div>
                          {(b as any).trip_date && <div className="text-[11px] font-medium text-slate-500">📅 {String((b as any).trip_date).slice(0, 10)}</div>}
                          {String(b.booking_status || "").startsWith("ملغ") && <Badge tone="red">{b.booking_status}</Badge>}
                        </td>
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
                        <td className="py-3 flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700">{b.booking_status}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setScanCode(b.booking_daily_id);
                              handleVerifyTicketCode(b.booking_daily_id);
                              setActive("scanner");
                            }}
                            className="px-2.5 py-1 bg-[#003580]/10 hover:bg-[#003580]/20 text-[#003580] rounded-lg text-xs font-black transition cursor-pointer"
                          >
                            📷 مسح وتحقق
                          </button>
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
                    <th className="pb-3 font-bold">السائح</th>
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
                          <div>{b.tourist_name || b.tourist_id}</div>
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
                        <td className="py-3 flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-700">{b.booking_status}</span>
                          <button
                            type="button"
                            onClick={() => {
                              setScanCode(b.booking_weekly_id);
                              handleVerifyTicketCode(b.booking_weekly_id);
                              setActive("scanner");
                            }}
                            className="px-2.5 py-1 bg-[#003580]/10 hover:bg-[#003580]/20 text-[#003580] rounded-lg text-xs font-black transition cursor-pointer"
                          >
                            📷 مسح وتحقق
                          </button>
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
          <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 text-xs font-semibold text-muted-foreground flex items-center justify-between">
            <span>🎯 إدارة العروض الترويجية والخصومات الحصرية — ربط العروض بالرحلات اليومية والأسبوعية المسجلة في DelniDB مع نسبة الخصم وتاريخ الصلاحية.</span>
            <span className="px-3 py-1 bg-primary text-white rounded-xl text-xs font-black">
              {dailyOffers.length + weeklyOffers.length} عرض نشط
            </span>
          </div>

          {/* Daily Offers */}
          <SectionCard title="🎯 عروض الرحلات اليومية (offers_daily_trips)" action={<button onClick={() => setShowAddDailyOffer(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-soft">+ إضافة عرض يومي</button>}>
            {dailyOffers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                لا توجد عروض رحلات يومية منشأة حالياً. يمكنك إنشاء عرض جديد وربطه برحلة يومية الآن.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {dailyOffers.map(o => {
                  const trip = dailyTrips.find(t => t.id === o.daily_trip_id);
                  const img = o.offer_image_url || o.url_image_offer || trip?.photo;
                  const discount = o.percent_discount || (o as any).discount_percentage || 15;
                  const originalPrice = trip?.price_per_seat || (o as any).price_per_seat;
                  const discountedPrice = originalPrice ? Math.round(originalPrice * (1 - discount / 100)) : null;

                  return (
                    <div key={o.offer_daily_id || o.id} className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft flex flex-col justify-between">
                      {img && <img src={img} alt="" className="w-full h-40 object-cover" />}
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-black text-foreground text-sm flex-1">{o.offer_title || o.title_offer}</h4>
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-lg shrink-0">
                              -{discount}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{o.description}</p>
                          <div className="text-xs font-bold text-primary">🧭 الرحلة: {trip?.title || (o as any).trip_title || o.daily_trip_id}</div>
                          {originalPrice && (
                            <div className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 inline-block">
                              السعر بعد الخصم: {discountedPrice} د.ل (بدلاً من {originalPrice} د.ل)
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground font-bold">📅 الصلاحية: {o.start_date || o.date_start || "—"} ← {o.end_date || o.date_end || "—"}</div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                          <button onClick={() => setEditingDailyOffer(o)} className="flex-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition">تعديل</button>
                          <button onClick={() => endOffer("daily", o.offer_daily_id || o.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg hover:bg-red-100 transition">إنهاء العرض</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Weekly Offers */}
          <SectionCard title="🎁 عروض الرحلات الأسبوعية (offers_weekly_trips)" action={<button onClick={() => setShowAddWeeklyOffer(true)} className="px-4 py-2 bg-gradient-sun text-gold-foreground rounded-xl text-xs font-black shadow-soft">+ إضافة عرض أسبوعي</button>}>
            {weeklyOffers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                لا توجد عروض رحلات أسبوعية منشأة حالياً. يمكنك إنشاء عرض جديد وربطه برحلة أسبوعية الآن.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {weeklyOffers.map(o => {
                  const trip = weeklyTrips.find(t => t.id === o.weekly_trip_id);
                  const img = o.offer_image_url || trip?.photo;
                  const discount = o.discount_percentage || o.percent_discount || 15;
                  const originalPrice = trip?.seat_per_price || (o as any).seat_per_price;
                  const discountedPrice = originalPrice ? Math.round(originalPrice * (1 - discount / 100)) : null;

                  return (
                    <div key={o.offer_weekly_id || o.id} className="rounded-2xl border border-border bg-white overflow-hidden shadow-soft flex flex-col justify-between">
                      {img && <img src={img} alt="" className="w-full h-40 object-cover" />}
                      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-black text-foreground text-sm flex-1">{o.offer_title}</h4>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-900 text-xs font-black rounded-lg shrink-0">
                              -{discount}%
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{o.description}</p>
                          <div className="text-xs font-bold text-amber-800">🗓️ الرحلة: {trip?.title || (o as any).trip_title || o.weekly_trip_id}</div>
                          {originalPrice && (
                            <div className="text-xs font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 inline-block">
                              السعر بعد الخصم: {discountedPrice} د.ل (بدلاً من {originalPrice} د.ل)
                            </div>
                          )}
                           <div className="text-xs text-muted-foreground font-bold">📅 الصلاحية: {o.start_date || o.date_start || "—"} ← {o.end_date || o.date_end || "—"}</div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-slate-100">
                          <button onClick={() => setEditingWeeklyOffer(o)} className="flex-1 px-3 py-1.5 bg-primary/10 text-primary text-xs font-black rounded-lg hover:bg-primary/20 transition">تعديل</button>
                          <button onClick={() => endOffer("weekly", o.offer_weekly_id || o.id || "")} className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-black rounded-lg hover:bg-red-100 transition">إنهاء العرض</button>
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
        <SectionCard title="إدارة ومراجعة طلبات الرحلات الخاصة (دراسة المسار، تعيين المركبة، جدولة المحطات، واعتماد التسعيرة)">
          <div className="space-y-4 text-right">
            {privateTrips.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-xs font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                لا توجد طلبات رحلات خاصة VIP حالياً. الطلبات المقدمة من السياح ستظهر هنا لمراجعتها وجدولتها.
              </div>
            ) : (
              privateTrips.map((pt) => {
                let parsedSteps: ItineraryStepItem[] | null = null;
                if (pt.admin_itinerary_plan) {
                  try {
                    const p = JSON.parse(pt.admin_itinerary_plan);
                    if (Array.isArray(p) && p.length > 0 && p[0].title) parsedSteps = p;
                  } catch {}
                }

                const isConfirmed = pt.status_order === "مؤكدة" || pt.status_order === "مؤكدة ومسددة";
                const isPendingTourist = pt.status_order === "بانتظار تأكيد السائح" || pt.status_order?.includes("موافقة");
                const isCancelled = pt.status_order?.includes("ملغاة") || pt.status_order?.includes("مرفوضة");

                return (
                  <div key={pt.private_trip_id} className="p-5 rounded-2xl border border-border bg-white space-y-3.5 shadow-xs">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-foreground text-base">{pt.customer_name || "سائح دلّني"}</h3>
                          {pt.customer_phone && (
                            <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                              📞 {pt.customer_phone}
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 font-mono text-[11px] font-black text-amber-900">
                            #{pt.private_trip_id}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3 font-bold">
                          <span>
                            👨‍✈️ المرشد السياحي المطلوب:{" "}
                            <span className="text-primary font-black">
                              {pt.guide_name ? `${pt.guide_name} (${pt.guide_license_number || ""})` : (pt.guide_license_number || "غير محدد (بمعرفة الإدارة)")}
                            </span>
                          </span>
                        </div>
                      </div>
                      <Badge
                        tone={
                          isConfirmed
                            ? "green"
                            : isPendingTourist
                            ? "sea"
                            : isCancelled
                            ? "red"
                            : "sun"
                        }
                      >
                        {pt.status_order || "بانتظار تسعير الإدارة"}
                      </Badge>
                    </div>

                    {/* Clean Destination Landmarks Tags */}
                    <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl font-medium border border-slate-100 space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-slate-900 flex items-center gap-1">
                          <span>📍</span>
                          <span>المعالم السياحية المستهدفة:</span>
                        </span>
                        {pt.places && pt.places.length > 0 ? (
                          pt.places.map((pl: any, pidx: number) => (
                            <span key={pidx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1 shadow-2xs">
                              <span>🏛️</span>
                              <span>{pl.place_name || pl.name} ({pl.city})</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-800 font-bold">{pt.customer_description || "برنامج رحلة خاصة مخصص"}</span>
                        )}
                      </div>
                    </div>

                    {/* Tourist Requirements and Notes (Deduplicated) */}
                    {pt.customer_requirements && (
                      <div className="text-xs text-amber-950 bg-amber-50/70 p-3 rounded-xl border border-amber-200/60 font-semibold leading-relaxed">
                        <span className="font-black text-amber-900 block mb-1">📝 متطلبات وملاحظات السائح:</span>
                        <span>
                          {Array.from(new Set(pt.customer_requirements.split(" - ").map(s => s.trim()))).filter(Boolean).join(" • ")}
                        </span>
                      </div>
                    )}

                    {/* Assigned Vehicle Rich Card with View Specs Modal Button */}
                    {pt.assigned_vehicle && (
                      <div className="flex items-center justify-between gap-3 flex-wrap p-3 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="p-1.5 rounded-lg bg-blue-100 text-blue-900 text-base">🚍</span>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-black text-blue-950">
                                {pt.vehicle_model || "مركبة نقل سياحي معتمدة"}
                              </span>
                              <span className="font-mono font-bold text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200 text-[11px]">
                                لوحة: {pt.assigned_vehicle}
                              </span>
                              {pt.vehicle_capacity && (
                                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 text-slate-700 font-bold text-[11px]">
                                  👥 سعة {pt.vehicle_capacity} راكب
                                </span>
                              )}
                            </div>
                            {pt.transport_company_name && (
                              <div className="text-[11px] text-blue-700 font-medium mt-0.5">
                                🏢 التابعة لـ: <span className="font-bold">{pt.transport_company_name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const foundVeh = vehicles.find(v => v.plate_number === pt.assigned_vehicle);
                            setSelectedVehicleForModal({
                              plate_number: pt.assigned_vehicle,
                              vehicle_type: pt.vehicle_model || foundVeh?.vehicle_type || "مركبة نقل سياحي",
                              capacity: pt.vehicle_capacity || foundVeh?.capacity || 25,
                              daily_rate: pt.vehicle_daily_rate || foundVeh?.daily_rate || 500,
                              company_name: pt.transport_company_name || foundVeh?.company_name || "شركة نقل سياحي معتمدة",
                              phone_number: pt.transport_company_phone,
                              vehicle_image: pt.vehicle_image,
                              vehicle_status: pt.vehicle_status || "جاهزة",
                            });
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          <span>👁️</span>
                          <span>عرض تفاصيل المركبة</span>
                        </button>
                      </div>
                    )}

                    {/* Trip Parameters & Quoted Pricing */}
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-muted-foreground items-center pt-1">
                      <span className="text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                        📅 تاريخ الانطلاق: <b className="text-foreground">{formatTripDate(pt.preferred_start_date)}</b>
                      </span>
                      <span>⏱️ مدة الرحلة: {pt.duration_days} {pt.duration_days > 1 ? "أيام" : "يوم واحد"}</span>
                      <span>👥 عدد المرافقين: {pt.number_of_companions} أفراد</span>
                      {pt.quoted_price && (
                        <span className="text-emerald-700 font-black bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                          💰 السعر الإجمالي المعتمد: {pt.quoted_price} د.ل
                        </span>
                      )}
                      {Number(pt.additional_expenses) > 0 && (
                        <span className="text-blue-800 font-black bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                          🛠️ مصروفات الخدمات: {pt.additional_expenses} د.ل
                        </span>
                      )}
                    </div>

                    {/* Step-by-Step Stations Itinerary Preview */}
                    {parsedSteps && parsedSteps.length > 0 && (
                      <div className="bg-[#FAF7F2] border border-[#E8E2D6] rounded-xl p-3 text-xs space-y-2">
                        <div className="font-black text-slate-800 flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-[#003580]">
                            <span>🧭</span>
                            <span>
                              جدول محطات الرحلة المقترح ({parsedSteps.length} محطات - {pt.duration_days > 1 ? "نظام الأيام" : "نظام الساعات"}):
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">جاهز ومعتمد للعرض على السائح</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {parsedSteps.map((st, sidx) => (
                            <div key={sidx} className="bg-white p-2 rounded-lg border border-slate-200 flex items-start gap-2 shadow-2xs">
                              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono font-black text-[10px] shrink-0">
                                {st.time}
                              </span>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 truncate">{st.title}</div>
                                <div className="text-[10px] text-slate-500 line-clamp-1">{st.desc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!parsedSteps && pt.admin_itinerary_plan && (
                      <div className="text-xs bg-emerald-50/70 border border-emerald-200 p-2.5 rounded-xl text-emerald-950 font-semibold">
                        <b>خطة البرنامج:</b> {pt.admin_itinerary_plan}
                      </div>
                    )}

                    {/* Actions and Cancellation Notice */}
                    <div className="flex justify-between items-center gap-2 pt-2 border-t border-slate-100 flex-wrap">
                      <div>
                        {isCancelled ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3.5 py-1.5 rounded-xl">
                            <span>⛔</span>
                            <span>هذه الرحلة ملغاة من قبل السائح — تم إغلاق الطلب ولا يمكن جدولتها أو تعديل تسعيرتها.</span>
                          </div>
                        ) : pt.status_order === "اعتذر المرشد" ? (
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl">
                            <span>⚠️</span>
                            <span>اعتذر المرشد عن هذه الرحلة — يرجى تعيين مرشد آخر وإعادة الإرسال.</span>
                          </div>
                        ) : pt.status_order === "بانتظار رد المرشد" ? (
                          <span className="text-[11px] text-slate-500 font-bold">⏳ أُرسلت الرحلة للمرشد وبانتظار رده، وبعد موافقته تصل للسائح.</span>
                        ) : (
                          <span className="text-[11px] text-slate-400">يمكنك إعداد جدول المحطات واحتساب التسعيرة ثم إرسالها للمرشد للموافقة، وبعد موافقته تصل للسائح</span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mr-auto">
                        {!isCancelled && (
                          <button
                            type="button"
                            onClick={() => setEvaluatingPrivateTrip(pt)}
                            className="px-4 py-1.5 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow hover:opacity-95 cursor-pointer flex items-center gap-1.5"
                          >
                            <span>🧭</span>
                            <span>{pt.quoted_price ? "مراجعة وتعديل جدول المحطات والتسعيرة" : "إعداد جدول المحطات واحتساب التسعيرة ↗"}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
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
                            🏷️ خصم {h.discount_percentage ?? 0}% دلّني
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
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="🏛️ المعالم والوجهات السياحية المعتمدة (برقم البلدية ID + خريطة Google Maps)" action={<button onClick={() => setShowAddAttraction(true)} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow cursor-pointer hover:opacity-95 transition">+ إضافة وتوثيق معلم</button>}>
            <div className="grid md:grid-cols-2 gap-4">
              {attractions.map((a) => {
                const munId = a.place_id || a.municipality_code || a.id;
                return (
                  <div key={a.id} className="p-4 rounded-2xl border border-border bg-white space-y-3 shadow-2xs hover:shadow-xs transition">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg bg-blue-100/80 text-blue-900 font-mono text-xs font-black border border-blue-200">
                          🏛️ رقم البلدية: {munId}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">(المفتاح الرئيسي ID)</span>
                      </div>
                      <Badge tone="sea">{a.category || "مدينة سياحية"}</Badge>
                    </div>

                    <div className="flex gap-3">
                      <img src={a.place_image || (a as any).photo || "/assets/dest-leptis-theater.jpg"} alt="" className="w-24 h-24 rounded-xl object-cover flex-shrink-0 border border-slate-200 shadow-2xs" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-foreground text-sm truncate">{a.name}</h4>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          📍 {a.city} {a.region ? `· ${a.region}` : ""}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{a.description}</p>
                      </div>
                    </div>

                    {/* Historical snippet or Highlights */}
                    {Array.isArray(a.highlights) && a.highlights.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-700 leading-snug space-y-1.5">
                        {a.highlights && (
                          <div>
                            <strong className="text-[#003580] font-bold">✨ أبرز المحطات: </strong>
                            <span>{Array.isArray(a.highlights) ? a.highlights.join("، ") : a.highlights}</span>
                          </div>
                        )}
                      </div>
                    )}

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

                    <div className="flex justify-between items-center pt-1 border-t border-slate-100">
                      <span className="text-[11px] text-slate-400 font-medium">👥 {a.visitors_count || 0} استعلام وزيارة</span>
                      <div className="flex gap-2">
                        <button onClick={() => setEditingAttraction(a)} className="px-3 py-1 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-black rounded-lg transition cursor-pointer">تعديل</button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
            <SectionCard
              title={
                <div className="flex items-center justify-between w-full">
                  <span>محادثات الشات بوت 🤖</span>
                  {chatSessions.filter(s => s.unread).length > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-black shadow-xs animate-pulse">
                      {chatSessions.filter(s => s.unread).length} غير مقروءة
                    </span>
                  )}
                </div>
              }
            >
              <div className="space-y-2.5">
                {chatSessions.map(s => (
                  <button
                    key={s.id}
                    onClick={() => {
                      setActiveChatId(s.id);
                      const updated = chatSessions.map(x => x.id === s.id ? { ...x, unread: false } : x);
                      setChatSessions(updated);
                      saveChatSessions(updated);
                    }}
                    className={`w-full text-right p-3.5 rounded-xl border transition-all cursor-pointer ${
                      activeChatId === s.id
                        ? "border-primary bg-primary/10 shadow-xs"
                        : s.unread
                        ? "border-red-300 bg-red-50/40 border-r-4 border-r-red-500 hover:bg-red-50/60"
                        : "border-border hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`text-xs ${s.unread ? "font-black text-[#0F172A]" : "font-bold text-foreground"}`}>
                        {s.user_name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {s.unread && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-xs animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span>جديد</span>
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-semibold">{s.time}</span>
                      </div>
                    </div>
                    <div className={`text-xs mt-0.5 truncate ${s.unread ? "font-black text-slate-900" : "text-muted-foreground"}`}>
                      {s.last_message}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <Badge tone={s.user_type === "سائح" ? "sea" : "sun"}>{s.user_type}</Badge>
                      {s.unread && (
                        <span className="text-[10px] font-black text-red-600 bg-red-100/60 px-2 py-0.5 rounded-md">
                          بانتظار رد الإدارة ⏳
                        </span>
                      )}
                    </div>
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
      {showAddTrip && <CreateTripModal type={showAddTrip} guides={guides} vehicles={vehicles} hotels={hotels} restaurants={restaurants} drivers={drivers} attractions={attractions} dailyTrips={dailyTrips} weeklyTrips={weeklyTrips} onClose={() => setShowAddTrip(null)} onCreate={handleCreateTrip} />}
      {editingDailyTrip && <DailyTripEditModal trip={editingDailyTrip} guides={guides} vehicles={vehicles} hotels={hotels} restaurants={restaurants} drivers={drivers} attractions={attractions} dailyTrips={dailyTrips} weeklyTrips={weeklyTrips} onClose={() => setEditingDailyTrip(null)} onSave={handleUpdateDailyTrip} />}
      {editingWeeklyTrip && <WeeklyTripEditModal trip={editingWeeklyTrip} guides={guides} vehicles={vehicles} hotels={hotels} restaurants={restaurants} drivers={drivers} attractions={attractions} dailyTrips={dailyTrips} weeklyTrips={weeklyTrips} onClose={() => setEditingWeeklyTrip(null)} onSave={handleUpdateWeeklyTrip} />}
      {evaluatingPrivateTrip && <EvaluatePrivateTripModal trip={evaluatingPrivateTrip} guides={guides} vehicles={vehicles} hotels={hotels} onClose={() => setEvaluatingPrivateTrip(null)} onSave={handleSavePrivate} />}
      {selectedVehicleForModal && <VehicleDetailsModal vehicle={selectedVehicleForModal} onClose={() => setSelectedVehicleForModal(null)} />}
      {showAddHotel && <HotelModal title="إضافة فندق جديد" existingHotels={hotels} onClose={() => setShowAddHotel(false)} onSave={(h) => handleSaveHotel(h, true)} />}
      {editingHotel && <HotelModal title={`تعديل: ${editingHotel.name}`} hotel={editingHotel} existingHotels={hotels} onClose={() => setEditingHotel(null)} onSave={(h) => handleSaveHotel(h, false)} />}
      {showAddRestaurant && <RestaurantModal title="إضافة مطعم/مقهى جديد" existingRestaurants={restaurants} onClose={() => setShowAddRestaurant(false)} onSave={(r) => handleSaveRestaurant(r, true)} />}
      {editingRestaurant && <RestaurantModal title={`تعديل: ${editingRestaurant.name}`} restaurant={editingRestaurant} existingRestaurants={restaurants} onClose={() => setEditingRestaurant(null)} onSave={(r) => handleSaveRestaurant(r, false)} />}
      {showAddAttraction && <AttractionModal title="إضافة معلم سياحي جديد" existingAttractions={attractions} onClose={() => setShowAddAttraction(false)} onSave={(a: any) => handleSaveAttraction(a, true)} />}
      {editingAttraction && <AttractionModal title={`تعديل المعلم: ${editingAttraction.name}`} attraction={editingAttraction} existingAttractions={attractions} onClose={() => setEditingAttraction(null)} onSave={(a: any) => handleSaveAttraction(a, false)} />}
      {showAddDailyOffer && <DailyOfferModal title="إضافة عرض رحلة يومية" dailyTrips={dailyTrips} onClose={() => setShowAddDailyOffer(false)} onSave={(o: any) => saveOffer("daily", o, true)} />}
      {editingDailyOffer && <DailyOfferModal title="تعديل العرض اليومي" offer={editingDailyOffer} dailyTrips={dailyTrips} onClose={() => setEditingDailyOffer(null)} onSave={(o: any) => saveOffer("daily", o, false)} />}
      {showAddWeeklyOffer && <WeeklyOfferModal title="إضافة عرض رحلة أسبوعية" weeklyTrips={weeklyTrips} onClose={() => setShowAddWeeklyOffer(false)} onSave={(o: any) => saveOffer("weekly", o, true)} />}
      {editingWeeklyOffer && <WeeklyOfferModal title="تعديل العرض الأسبوعي" offer={editingWeeklyOffer} weeklyTrips={weeklyTrips} onClose={() => setEditingWeeklyOffer(null)} onSave={(o: any) => saveOffer("weekly", o, false)} />}
      {selectedTouristDetail && (
        <TouristDetailsModal
          tourist={selectedTouristDetail}
          isLoading={loadingTouristDetail}
          onClose={() => setSelectedTouristDetail(null)}
          onToggleStatus={(tid, status) => handleToggleTouristStatus(tid, status)}
        />
      )}
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

function AddPrivateTripModal({ onClose, onAdd, guides, tourists = [] }: { onClose: () => void; onAdd: (p: any) => void; guides: Guide[]; tourists?: any[] }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Database fields for private_trips
  const [tripId] = useState(() => `${Math.floor(1000 + Math.random() * 9000)}`);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerDescription, setCustomerDescription] = useState("");
  const [preferredStartDate, setPreferredStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("1");
  const [numberOfCompanions, setNumberOfCompanions] = useState("0");
  const [quotedPrice, setQuotedPrice] = useState("");
  const [adminItineraryPlan, setAdminItineraryPlan] = useState("");
  const [guideLicenseNumber, setGuideLicenseNumber] = useState("");
  const [touristId, setTouristId] = useState("");
  const [customerRequirements, setCustomerRequirements] = useState("");
  const [statusOrder, setStatusOrder] = useState<string>("قيد الدراسة");

  // Selection from existing registered tourists
  const handleSelectTourist = (selectedId: string) => {
    if (!selectedId) {
      setTouristId("");
      return;
    }
    const found = tourists.find((t: any) => t.tourist_id === selectedId);
    if (found) {
      setTouristId(found.tourist_id);
      setCustomerName(found.full_name);
      if (found.phone_number) {
        setCustomerPhone(found.phone_number);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      return alert(isAr ? "يرجى إدخال اسم العميل ورقم الهاتف" : "Please enter customer name and phone");
    }

    const fullId = `PT-${tripId}`;

    const newTrip = {
      private_trip_id: fullId,
      status_order: statusOrder,
      customer_description: customerDescription || (isAr ? "طلب رحلة خاصة جديدة" : "New private trip request"),
      preferred_start_date: preferredStartDate || new Date().toISOString().split("T")[0],
      duration_days: Math.max(1, parseInt(durationDays, 10) || 1),
      number_of_companions: Math.max(0, parseInt(numberOfCompanions, 10) || 0),
      quoted_price: quotedPrice ? parseFloat(quotedPrice) : null,
      admin_itinerary_plan: adminItineraryPlan || null,
      guide_license_number: guideLicenseNumber || null,
      assigned_guide: guideLicenseNumber || null,
      assigned_guide_license: guideLicenseNumber || null,
      tourist_id: touristId || null,
      customer_name: customerName.trim(),
      customer_phone: customerPhone.trim(),
      customer_requirements: customerRequirements || null,
    };

    onAdd(newTrip);
  };

  return (
    <ModalShell title={isAr ? "إضافة طلب رحلة خاصة" : "Add Private Trip"} onClose={onClose}>
      <form className="space-y-3.5 text-right" onSubmit={handleSubmit}>

        {/* معرف الرحلة والحالة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/30 rounded-xl border border-border/60">
          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
              {isAr ? "معرّف الرحلة" : "Trip ID"}
            </label>
            <input
              type="text"
              readOnly
              value={tripId}
              className="w-full h-9 px-3 rounded-xl border border-border bg-muted/60 text-xs font-mono font-bold text-foreground text-center"
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-muted-foreground block mb-1">
              {isAr ? "حالة الطلب" : "Order Status"}
            </label>
            <select
              value={statusOrder}
              onChange={e => setStatusOrder(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right"
            >
              <option value="قيد الدراسة">{isAr ? "قيد الدراسة" : "Under Review"}</option>
              <option value="مؤكدة">{isAr ? "مؤكدة" : "Confirmed"}</option>
              <option value="مرفوضة من الأدمن">{isAr ? "مرفوضة من الأدمن" : "Rejected by Admin"}</option>
              <option value="ملغية">{isAr ? "ملغية" : "Cancelled"}</option>
            </select>
          </div>
        </div>

        {/* اختيار سريع للسائح المسجل بالبحث أو القائمة */}
        {tourists.length > 0 && (
          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-primary flex items-center gap-1.5">
                <span>🔍</span>
                {isAr ? "اختيار سائح مسجل (تعبئة الـ ID والبيانات تلقائياً):" : "Select Registered Tourist (Auto-fills ID & Info):"}
              </span>
              {touristId && (
                <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  ID: {touristId}
                </span>
              )}
            </div>
            <select
              value={touristId}
              onChange={e => handleSelectTourist(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right"
            >
              <option value="">{isAr ? "— اختر سائحاً من المسجلين في النظام أو املأ البيانات يدوياً —" : "— Select tourist or enter manually —"}</option>
              {tourists.map((t: any) => (
                <option key={t.tourist_id} value={t.tourist_id}>
                  {t.full_name} {t.phone_number ? `(${t.phone_number})` : ""} — [ID: {t.tourist_id}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* بيانات العميل والتواصل */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label={isAr ? "اسم العميل / السائح *" : "Customer Name *"}
            placeholder={isAr ? "مثال: عبد الرحمن الطرابلسي" : "e.g. John Doe"}
            value={customerName}
            onChange={setCustomerName}
          />
          <LibyanPhoneField
            label={isAr ? "هاتف التواصل *" : "Customer Phone *"}
            value={customerPhone}
            onChange={setCustomerPhone}
          />
          <Field
            label={isAr ? "معرّف السائح (Tourists ID)" : "Tourist ID"}
            placeholder={isAr ? "اختياري أو يملأ تلقائياً" : "Optional or Auto"}
            value={touristId}
            onChange={setTouristId}
          />
        </div>

        {/* التواريخ والمدة والمرافقين */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field
            label={isAr ? "تاريخ البدء المفضل" : "Preferred Start Date"}
            type="date"
            value={preferredStartDate}
            onChange={setPreferredStartDate}
          />
          <Field
            label={isAr ? "مدة الرحلة (بالأيام)" : "Duration (days)"}
            type="number"
            min="1"
            value={durationDays}
            onChange={v => setDurationDays(v)}
          />
          <Field
            label={isAr ? "عدد المرافقين" : "Companions Count"}
            type="number"
            min="0"
            value={numberOfCompanions}
            onChange={v => setNumberOfCompanions(v)}
          />
        </div>

        {/* وصف العميل للرحلة */}
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            {isAr ? "وصف العميل للرحلة" : "Trip Description"}
          </label>
          <textarea
            value={customerDescription}
            onChange={e => setCustomerDescription(e.target.value)}
            rows={2}
            placeholder={isAr ? "تفاصيل الوجهات المرغوبة، المدن، طبيعة الجولة..." : "Trip details..."}
            className="w-full p-2.5 rounded-xl border border-border text-xs font-semibold text-right focus:border-primary focus:outline-none"
          />
        </div>

        {/* المتطلبات الخاصة */}
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            {isAr ? "المتطلبات والاشتراطات الخاصة" : "Special Requirements"}
          </label>
          <textarea
            value={customerRequirements}
            onChange={e => setCustomerRequirements(e.target.value)}
            rows={2}
            placeholder={isAr ? "نوع السيارة (4x4)، لغة المرشد المطلوبة، وجبات معينة..." : "Special requirements..."}
            className="w-full p-2.5 rounded-xl border border-border text-xs font-semibold text-right focus:border-primary focus:outline-none"
          />
        </div>

        {/* بيانات الإدارة: المرشد والسعر وخطة السير */}
        <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-3">
          <div className="text-xs font-black text-primary">⚙️ تخصيص الإدارة وتعيين المرشد والسعر:</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-foreground block mb-1">
                {isAr ? "تعيين المرشد السياحي المعتمد للرحلة" : "Assigned Tour Guide"}
              </label>
              <select
                value={guideLicenseNumber}
                onChange={e => setGuideLicenseNumber(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right shadow-2xs focus:border-primary"
              >
                <option value="">{isAr ? "بدون تعيين مرشد حالياً (يحدد لاحقاً)" : "None (Assign Later)"}</option>
                {guides.map(g => (
                  <option key={g.license_number} value={g.license_number}>
                    {g.full_name} ({g.license_number}) {g.daily_rate ? `— ${g.daily_rate} د.ل/يوم` : ""}
                  </option>
                ))}
              </select>
            </div>
            <Field
              label={isAr ? "السعر الإجمالي المعتمد (د.ل)" : "Quoted Price (LYD)"}
              type="number"
              placeholder={isAr ? "يحدد بعد دراسة التكاليف" : "Quoted price"}
              value={quotedPrice}
              onChange={v => setQuotedPrice(v)}
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-foreground block mb-1">
              {isAr ? "خطة سير الرحلة وبرنامج الإدارة" : "Admin Itinerary Plan"}
            </label>
            <textarea
              value={adminItineraryPlan}
              onChange={e => setAdminItineraryPlan(e.target.value)}
              rows={2}
              placeholder={isAr ? "البرنامج المعتمد، توقيت التحرك، نقاط التجمع..." : "Detailed itinerary plan..."}
              className="w-full p-2.5 rounded-xl border border-border bg-white text-xs font-semibold text-right focus:border-primary focus:outline-none"
            />
          </div>
        </div>

        {/* أزرار الإجراء */}
        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border border-border hover:bg-muted font-black text-xs transition-colors">
            {isAr ? "إلغاء" : "Cancel"}
          </button>
          <button type="submit" className="px-6 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow hover:opacity-95 transition-opacity">
            {isAr ? "حفظ طلب الرحلة الخاصة" : "Save Private Trip"}
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

function AddCompanyModal({ companies = [], onClose, onAdd }: { companies?: Company[]; onClose: () => void; onAdd: (c: any) => Promise<string | null> }) {
  const [contractNo, setContractNo] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("طرابلس");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [vehiclesCount, setVehiclesCount] = useState<number | string>(5);
  const contractStartDate = new Date().toLocaleDateString("en-CA");
  const [contractEndDate, setContractEndDate] = useState("");
  const [companyStatus, setCompanyStatus] = useState("نشطة");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!contractEndDate) {
      setErrorMsg("يرجى تحديد تاريخ انتهاء التعاقد.");
      return;
    }
    if (contractEndDate <= contractStartDate) {
      setErrorMsg("تاريخ انتهاء التعاقد يجب أن يكون بعد تاريخ بداية التعاقد (اليوم).");
      return;
    }
    if (isNewPastDate(contractEndDate, null)) {
      setErrorMsg("تاريخ انتهاء التعاقد يجب أن يكون تاريخاً قادماً.");
      return;
    }

    setSaving(true);
    const saveError = await onAdd({
      contract_number: cleanContract,
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
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
      status: companyStatus,
      verification_status: companyStatus,
    });
    setSaving(false);
    if (saveError) setErrorMsg("لم يتم حفظ الشركة في قاعدة البيانات: " + saveError);
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

          {/* 3. سعة الأسطول وفترة التعاقد والحالة */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📊</span>
              <span>الأسطول والتعاقد</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3.5 gap-y-3">
              <Field label="عدد مركبات الأسطول *" type="number" min={1} value={String(vehiclesCount)} onChange={v => setVehiclesCount(v)} required />
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">حالة الشركة *</label>
                <select
                  value={companyStatus}
                  onChange={e => setCompanyStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
                >
                  <option value="نشطة">نشطة</option>
                  <option value="موقوفة">موقوفة</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">تاريخ بداية التعاقد</label>
                <input
                  type="text"
                  value={contractStartDate}
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-border bg-slate-100 text-slate-600 text-right outline-none text-xs font-semibold font-mono cursor-not-allowed"
                />
              </div>
              <Field label="تاريخ انتهاء التعاقد *" type="date" min={minFutureDate(null)} value={contractEndDate} onChange={setContractEndDate} required />
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
              disabled={saving}
              className="px-6 h-11 rounded-xl bg-[#003580] hover:bg-[#00224f] disabled:opacity-60 disabled:cursor-wait text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>{saving ? "جاري الحفظ في قاعدة البيانات..." : "حفظ واعتماد الشركة في المنظومة"}</span>
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

function EditCompanyModal({ company, onClose, onUpdate }: { company: Company; onClose: () => void; onUpdate: (c: Company) => Promise<string | null> }) {
  const [contractNo, setContractNo] = useState(company.contract_number || "");
  const [name, setName] = useState(company.company_name || company.name || "");
  const [phone, setPhone] = useState(company.phone_number || company.phone || "");
  const [city, setCity] = useState(company.city === "بنغازي" ? "بنغازي" : "طرابلس");
  const [address, setAddress] = useState(company.google_maps_url || company.address || "");
  const [email, setEmail] = useState(company.email || "");
  const [vehiclesCount, setVehiclesCount] = useState<number | string>(company.total_vehicles ?? 5);
  const [contractStartDate] = useState(
    company.contract_start_date ? String(company.contract_start_date).split("T")[0] : new Date().toLocaleDateString("en-CA")
  );
  const [contractEndDate, setContractEndDate] = useState(
    company.contract_end_date ? String(company.contract_end_date).split("T")[0] : ""
  );
  const [status, setStatus] = useState(company.status === "موقوفة" || company.verification_status === "موقوفة" || company.status === "مرفوض" ? "موقوفة" : "نشطة");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (!contractEndDate) {
      setErrorMsg("يرجى تحديد تاريخ انتهاء التعاقد.");
      return;
    }
    if (contractEndDate <= contractStartDate) {
      setErrorMsg("تاريخ انتهاء التعاقد يجب أن يكون بعد تاريخ بداية التعاقد.");
      return;
    }
    if (isNewPastDate(contractEndDate, company.contract_end_date)) {
      setErrorMsg("تاريخ انتهاء التعاقد الجديد يجب أن يكون تاريخاً قادماً.");
      return;
    }

    setSaving(true);
    const saveError = await onUpdate({
      ...company,
      contract_number: contractNo.trim(),
      contract_start_date: contractStartDate,
      contract_end_date: contractEndDate,
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
      verification_status: status,
      status: status,
    });
    setSaving(false);
    if (saveError) setErrorMsg("لم يتم حفظ التعديلات في قاعدة البيانات: " + saveError);
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

          {/* 1. البيانات الأساسية والعقد */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>🏢</span>
              <span>البيانات الرسمية والتعاقد</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <Field label="اسم شركة النقل السياحي *" value={name} onChange={setName} required />
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>رقم العقد الورقي (المعرف) 🔒</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">رقم ثابت</span>
                </label>
                <input
                  type="text"
                  value={contractNo}
                  disabled
                  readOnly
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold text-xs text-right cursor-not-allowed shadow-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. بيانات التواصل والمدينة */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📞</span>
              <span>بيانات التواصل والمقر الجغرافي</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <LibyanPhoneField label="رقم هاتف الشركة *" value={phone} onChange={setPhone} />
              <Field label="البريد الإلكتروني للشركة" type="email" value={email} onChange={setEmail} placeholder="company@dalni.ly" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
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

          {/* 3. سعة الأسطول وفترة التعاقد والحالة */}
          <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/90 space-y-3.5">
            <div className="flex items-center gap-2 text-xs font-black text-[#003580] border-b border-slate-200/80 pb-2">
              <span>📊</span>
              <span>الأسطول والتعاقد</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3.5 gap-y-3">
              <Field label="عدد مركبات الأسطول *" type="number" min={1} value={String(vehiclesCount)} onChange={v => setVehiclesCount(v)} required />
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">حالة الشركة *</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
                >
                  <option value="نشطة">نشطة</option>
                  <option value="موقوفة">موقوفة</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">تاريخ بداية التعاقد</label>
                <input
                  type="text"
                  value={contractStartDate}
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-border bg-slate-100 text-slate-600 text-right outline-none text-xs font-semibold font-mono cursor-not-allowed"
                />
              </div>
              <Field label="تاريخ انتهاء التعاقد *" type="date" min={minFutureDate(company.contract_end_date)} value={contractEndDate} onChange={setContractEndDate} required />
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
              disabled={saving}
              className="px-6 h-11 rounded-xl bg-[#003580] hover:bg-[#00224f] disabled:opacity-60 disabled:cursor-wait text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <span>{saving ? "جاري الحفظ في قاعدة البيانات..." : "حفظ وتحديث في قاعدة البيانات"}</span>
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
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
            <div className="flex items-center gap-3">
              {guide.avatar ? (
                <img
                  src={guide.avatar}
                  alt={guide.full_name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary/20 shadow-xs"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-xl border-2 border-primary/20">
                  {guide.full_name ? guide.full_name.charAt(0) : "م"}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-muted-foreground text-xs">اسم المرشد: </span>
                  <span className="font-black text-foreground text-base">{guide.full_name}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  مرشد سياحي معتمد ومسجل
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
              <b>تاريخ انتهاء الترخيص:</b>{" "}
              {guide.license_expiry_date ? (
                <span className={`font-bold ${guide.license_expiry_date <= new Date().toLocaleDateString("en-CA") ? "text-red-600" : "text-foreground"}`}>
                  {guide.license_expiry_date}
                  {guide.license_expiry_date <= new Date().toLocaleDateString("en-CA") ? " (منتهٍ)" : ""}
                </span>
              ) : (
                <span className="text-amber-700 font-bold">غير مسجل</span>
              )}
            </div>
            <div>
              <b>حالة التوافر:</b> <span className="text-foreground font-bold">{guide.availability_status || "متاح"}</span>
            </div>
            {guide.rejection_reason && (
              <div className="sm:col-span-2">
                <b>سبب الرفض السابق:</b> <span className="text-red-700 font-bold">{guide.rejection_reason}</span>
              </div>
            )}
            <div>
              <b>السعر اليومي المقترح:</b>{" "}
              <span className="text-emerald-700 font-bold">{(guide.daily_rate || guide.price_per_day) ? `${guide.daily_rate || guide.price_per_day} د.ل / اليوم` : "السعر غير محدد"}</span>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <b>المعالم السياحية والآثار المعتمدة لخبرته:</b>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {guide.places && guide.places.length > 0 ? (
                  guide.places.map((p: any) => (
                    <span key={p.place_id || p.id} className="text-xs font-bold text-[#D96B27] bg-[#D96B27]/10 px-2 py-0.5 rounded-lg border border-[#D96B27]/30">
                      🏛️ {p.place_name || p.name} {p.city ? `(${p.city})` : ""}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">لم يتم تحديد معالم</span>
                )}
              </div>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <b>أيام الجاهزية للجولات السياحية:</b>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {Array.isArray(guide.working_days) && guide.working_days.length > 0 ? (
                  guide.working_days.map((day: string, idx: number) => (
                    <span key={idx} className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                      📅 {day}
                    </span>
                  ))
                ) : (
                  <span className="text-muted-foreground">طوال أيام الأسبوع</span>
                )}
              </div>
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
          {guide.verification_status === "موثق" && (
            <button
              type="button"
              onClick={() => {
                const guideUser = {
                  license_number: guide.license_number,
                  full_name: guide.full_name,
                  phone_number: guide.phone_number,
                  email: guide.email || `${guide.license_number.toLowerCase()}@dalni.ly`,
                  verification_status: "موثق",
                  role: "guide",
                  years_of_experience: guide.years_of_experience,
                  price_per_day: guide.price_per_day,
                  avatar: guide.avatar,
                };
                localStorage.setItem("dalni_user", JSON.stringify(guideUser));
                localStorage.setItem("dalni_role", "guide");
                window.dispatchEvent(new Event("storage"));
                window.open("/dashboard/guide", "_blank");
              }}
              className="px-4 h-10 border border-sky-300 bg-sky-50 hover:bg-sky-100 text-sky-800 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <span>معاينة لوحة المرشد 🧭</span>
            </button>
          )}
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

const DEFAULT_DAILY_ITINERARY_STEPS: ItineraryStepItem[] = [];

function TripItineraryTimelineEditor({
  steps,
  onChange,
  selectedRestaurant,
  mode = "time",
}: {
  steps: ItineraryStepItem[];
  onChange: (steps: ItineraryStepItem[]) => void;
  selectedRestaurant?: Restaurant | null;
  mode?: "time" | "days";
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
      title: mode === "days" ? `محطة اليوم ${nextNum} - وجهة استكشاف جديدة` : `المحطة ${nextNum} - وجهة استكشاف جديدة`,
      time: mode === "days" ? `اليوم ${nextNum}` : "09:00 ص",
      desc: mode === "days" ? `تفاصيل ومسار اليوم ${nextNum}...` : "تفاصيل وبرنامج الزيارة لهذه المحطة السياحية...",
    };
    onChange([...steps, newStep]);
    setIsEditing(true);
  };

  const handleDeleteStep = (index: number) => {
    const next = steps.filter((_, idx) => idx !== index);
    onChange(next);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D6] shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#003580] flex items-center gap-2">
            <span>{mode === "days" ? "📅" : "⏱️"}</span>
            <span>{mode === "days" ? "محطات وجدول الأيام خطوة بخطوة" : "محطات وخط سير الرحلة خطوة بخطوة"}</span>
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-0.5">
            {mode === "days"
              ? `إمكانية إضافة محطات الأيام أو حذفها وتعديل خطة كل يوم بدقة (${steps.length} محطات/أيام حالية)`
              : `إمكانية إضافة محطات أو حذف محطات وتعديل المواعيد والشرح بدقة (${steps.length} محطات حالية)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleAddStep}
            className="px-3 py-1.5 text-xs font-black rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <span>➕</span>
            <span>{mode === "days" ? "إضافة محطة يوم" : "إضافة محطة"}</span>
          </button>
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
      {steps.length === 0 ? (
        <div className="text-center py-7 px-4 bg-amber-50/70 border-2 border-dashed border-amber-300 rounded-2xl space-y-2">
          <span className="text-3xl block">📍</span>
          <p className="text-sm font-black text-amber-900">
            النموذج فارغ: لم تتم إضافة أي محطات لخط سير الرحلة بعد
          </p>
          <p className="text-xs text-amber-700 font-bold">
            يرجى النقر على زر &quot;{mode === "days" ? "➕ إضافة محطة يوم" : "➕ إضافة محطة"}&quot; أعلاه لإدخال محطات المسار وتفاصيلها.
          </p>
        </div>
      ) : (
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
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          {mode === "days" ? `عنوان محطة اليوم ${idx + 1}` : `عنوان المحطة ${idx + 1}`}
                        </label>
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(idx, "title", e.target.value)}
                          placeholder={mode === "days" ? `مثال: استكشاف الآثار والمبيت` : "عنوان المحطة..."}
                          className="w-full h-8 px-2.5 rounded-lg border border-slate-300 text-xs font-bold text-right bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-0.5">
                          {mode === "days" ? "اليوم" : "التوقيت"}
                        </label>
                        <input
                          type="text"
                          value={step.time}
                          onChange={(e) => handleStepChange(idx, "time", e.target.value)}
                          className="w-full h-8 px-2 rounded-lg border border-slate-300 text-xs font-bold text-right bg-white"
                          placeholder={mode === "days" ? `اليوم ${idx + 1}` : "09:00 ص"}
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
      )}
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
  departureCity,
  startDate,
  endDate,
  existingTrips,
  currentTripId,
}: {
  vehicles: Vehicle[];
  drivers: Driver[];
  busCapacity: 15 | 25 | 50;
  onCapacityChange: (cap: 15 | 25 | 50) => void;
  selectedPlate: string;
  onSelectPlate: (plate: string) => void;
  departureCity?: string;
  startDate?: string;
  endDate?: string;
  existingTrips?: {
    dailyTrips?: any[];
    weeklyTrips?: any[];
  };
  currentTripId?: string;
}) {
  // Check vehicle status and conflict with existing trips in the trip dates
  const vehicleAvailability = useMemo(() => {
    const map = new Map<string, { isAvailable: boolean; reason?: string }>();

    const targetStart = startDate ? new Date(startDate) : null;
    const targetEnd = endDate ? new Date(endDate) : (targetStart || null);

    vehicles.forEach((v) => {
      // 1. Maintenance / Broken status check
      if (v.status === "صيانة" || v.vehicle_status === "صيانة" || (v as any).status === "معطلة") {
        map.set(v.plate_number, { isAvailable: false, reason: "المركبة في الصيانة الفنية حالياً" });
        return;
      }

      // 2. Check weekly trips overlap
      if (existingTrips?.weeklyTrips && targetStart && !isNaN(targetStart.getTime())) {
        const conflict = existingTrips.weeklyTrips.find((wt: any) => {
          if (currentTripId && (wt.weekly_trip_id === currentTripId || wt.id === currentTripId)) return false;
          const assigned = wt.vehicle_plate === v.plate_number || (Array.isArray(wt.vehicle_plates) && wt.vehicle_plates.includes(v.plate_number));
          if (!assigned) return false;
          if (!wt.start_date) return false;
          const wtStart = new Date(wt.start_date);
          const wtEnd = wt.end_date ? new Date(wt.end_date) : wtStart;
          if (isNaN(wtStart.getTime()) || isNaN(wtEnd.getTime())) return false;
          const s = targetStart.getTime();
          const e = (targetEnd || targetStart)!.getTime();
          return !(wtEnd.getTime() < s || wtStart.getTime() > e);
        });

        if (conflict) {
          map.set(v.plate_number, {
            isAvailable: false,
            reason: `محجوزة في رحلة أسبوعية (${conflict.trip_title || conflict.title}) من ${conflict.start_date} إلى ${conflict.end_date || conflict.start_date}`,
          });
          return;
        }
      }

      // 3. Check daily trips overlap
      if (existingTrips?.dailyTrips && startDate) {
        const conflict = existingTrips.dailyTrips.find((dt: any) => {
          if (currentTripId && (dt.daily_trip_id === currentTripId || dt.id === currentTripId)) return false;
          if (dt.vehicle_plate !== v.plate_number) return false;
          return dt.date === startDate || (dt.days_of_week && dt.days_of_week.includes(startDate));
        });
        if (conflict) {
          map.set(v.plate_number, {
            isAvailable: false,
            reason: `محجوزة في رحلة يومية (${conflict.trip_title || conflict.title})`,
          });
          return;
        }
      }

      map.set(v.plate_number, { isAvailable: true });
    });

    return map;
  }, [vehicles, existingTrips, startDate, endDate, currentTripId]);

  const matchingVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // 1. Filter by departure city if provided (e.g. طرابلس vs بنغازي)
      if (departureCity) {
        const vCity = String(v.city || (v as any).company_city || (v as any).location || "").trim();
        if (vCity && !departureCity.includes(vCity) && !vCity.includes(departureCity)) {
          return false;
        }
      }

      // 2. Filter by capacity
      const cap = Number(v.seating_capacity || (v as any).capacity || 0);
      if (busCapacity === 15) return cap <= 18;
      if (busCapacity === 25) return cap > 18 && cap <= 32;
      if (busCapacity === 50) return cap > 32;
      return false;
    });
  }, [vehicles, busCapacity, departureCity]);

  // Show vacant/available vehicles first
  const vacantVehicles = useMemo(() => {
    return matchingVehicles.filter((v) => {
      const info = vehicleAvailability.get(v.plate_number);
      return info?.isAvailable || v.plate_number === selectedPlate;
    });
  }, [matchingVehicles, vehicleAvailability, selectedPlate]);

  const unavailableVehicles = useMemo(() => {
    return matchingVehicles.filter((v) => {
      const info = vehicleAvailability.get(v.plate_number);
      return !info?.isAvailable && v.plate_number !== selectedPlate;
    });
  }, [matchingVehicles, vehicleAvailability, selectedPlate]);

  const [showUnavailable, setShowUnavailable] = useState(false);

  return (
    <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="font-black text-emerald-950 text-sm flex items-center gap-1.5">
          <span>🚌</span>
          <span>تحديد سعة الحافلة وفلترة المركبات الشاغرة فقط</span>
        </div>
        <div className="flex items-center gap-2">
          {startDate && (
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[11px] font-black border border-blue-200">
              📅 تاريخ الانطلاق: {startDate}
            </span>
          )}
          <span className="px-3 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-xs font-black">
            السعة المختارة: {busCapacity} راكب
          </span>
        </div>
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

      <div className="p-2.5 bg-blue-50/80 rounded-xl border border-blue-200 text-[11px] text-blue-900 font-bold flex items-center gap-2">
        <span>🔒</span>
        <span>
          نظام حجز الأسطول: تظهر المركبات الشاغرة فقط في موعد الانطلاق، وبمجرد اختيار الحافلة تصبح محجوزة وغير متاحة لأي رحلة أخرى طوال مدة الرحلة.
        </span>
      </div>

      <div className="space-y-2 pt-2 border-t border-emerald-100">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 block">
            المركبات الشاغرة المتاحة للحجز بسعة {busCapacity} راكب ({vacantVehicles.length} شاغرة):
          </label>
          {unavailableVehicles.length > 0 && (
            <button
              type="button"
              onClick={() => setShowUnavailable(!showUnavailable)}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
            >
              {showUnavailable ? "إخفاء المركبات غير الشاغرة" : `عرض المركبات المشغولة (${unavailableVehicles.length})`}
            </button>
          )}
        </div>

        {vacantVehicles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {vacantVehicles.map((v) => {
              const isSelected = selectedPlate === v.plate_number;
              const assignedDriver = drivers.find((d) => d.assigned_vehicle_plate === v.plate_number);
              const cap = v.seating_capacity || (v as any).capacity || busCapacity;

              return (
                <div
                  key={v.plate_number}
                  onClick={() => onSelectPlate(v.plate_number)}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition text-right flex items-start gap-2.5 ${
                    isSelected
                      ? "bg-emerald-50/90 border-emerald-600 shadow-sm ring-2 ring-emerald-500/30"
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
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {cap} راكب
                        </span>
                        {isSelected ? (
                          <span className="text-[10px] font-black text-white bg-emerald-700 px-1.5 py-0.5 rounded">
                            مختارة ومحجوزة ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            شاغرة ومتاحة
                          </span>
                        )}
                      </div>
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
                    {isSelected && (
                      <div className="mt-1 text-[9px] text-emerald-800 font-bold bg-emerald-100/60 px-2 py-0.5 rounded">
                        🔒 تصبح غير متاحة طوال فترة الرحلة لضمان التفرغ الكامل.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center font-bold">
            ⚠️ لا توجد مركبات شاغرة ومتاحة حالياً بسعة {busCapacity} راكب في هذا التاريخ.
          </div>
        )}

        {/* Unavailable Vehicles list (collapsible) */}
        {showUnavailable && unavailableVehicles.length > 0 && (
          <div className="pt-2 border-t border-slate-200 space-y-1.5">
            <span className="text-[11px] font-bold text-red-700 block">
              ⚠️ مركبات مشغولة في رحلات أخرى أو في الصيانة:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 opacity-65">
              {unavailableVehicles.map((v) => {
                const info = vehicleAvailability.get(v.plate_number);
                return (
                  <div key={v.plate_number} className="p-2.5 rounded-xl border border-red-200 bg-red-50/50 text-[10px]">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{v.vehicle_type} ({v.plate_number})</span>
                      <span className="text-red-700 font-black">غير شاغرة</span>
                    </div>
                    <div className="text-red-600 mt-0.5">{info?.reason || "مشغولة في رحلة أخرى"}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function resolveCitiesFromDestinations(destinations: string[], attractionsList: Attraction[] = []): string[] {
  const result = new Set<string>();
  destinations.forEach(dest => {
    if (!dest) return;
    const clean = dest.trim();
    if (!clean) return;
    result.add(clean);
    
    // Look up in attractions
    const matched = attractionsList.find(a => 
      (a.name && (a.name === clean || clean.includes(a.name) || a.name.includes(clean))) ||
      (a.place_name && (a.place_name === clean || clean.includes(a.place_name) || a.place_name.includes(clean)))
    );
    if (matched && matched.city) {
      result.add(matched.city.trim());
    }

    // Common Libyan landmark-to-city aliases
    if (clean.includes("لبدة")) result.add("الخمس");
    if (clean.includes("صبراتة")) result.add("صبراتة");
    if (clean.includes("أوباري") || clean.includes("قبر عون") || clean.includes("الصحراء")) {
      result.add("أوباري");
      result.add("سبها");
      result.add("فزان");
    }
    if (clean.includes("شحات") || clean.includes("قورينا") || clean.includes("أبولونيا") || clean.includes("الجبل الأخضر")) {
      result.add("شحات");
      result.add("البيضاء");
    }
    if (clean.includes("غدامس")) result.add("غدامس");
    if (clean.includes("غريان")) result.add("غريان");
    if (clean.includes("طرابلس") || clean.includes("السرايا") || clean.includes("المدينة القديمة")) result.add("طرابلس");
    if (clean.includes("بنغازي")) result.add("بنغازي");
    if (clean.includes("طبرق")) result.add("طبرق");
  });
  return Array.from(result);
}

function TripRestaurantSelector({
  restaurants,
  selectedId,
  selectedIds = [],
  targetCity,
  targetCities = [],
  attractions = [],
  onSelect,
  onToggleSelect,
}: {
  restaurants: Restaurant[];
  selectedId?: string;
  selectedIds?: string[];
  targetCity?: string;
  targetCities?: string[];
  attractions?: Attraction[];
  onSelect?: (id: string) => void;
  onToggleSelect?: (id: string) => void;
}) {
  const [categoryFilter, setCategoryFilter] = useState<"all" | "restaurant" | "cafe">("all");
  const [cityFilterOverride, setCityFilterOverride] = useState<string>("auto");

  // Effective target cities resolved to parent municipality/city names
  const effectiveTargetCities = useMemo(() => {
    const list: string[] = [];
    if (targetCity) list.push(targetCity);
    if (targetCities && targetCities.length > 0) {
      targetCities.forEach(c => { if (!list.includes(c)) list.push(c); });
    }
    return resolveCitiesFromDestinations(list, attractions);
  }, [targetCity, targetCities, attractions]);

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
          r.city.toLowerCase().includes(dest.toLowerCase()) || 
          dest.toLowerCase().includes(r.city.toLowerCase()) || 
          (r.address && r.address.toLowerCase().includes(dest.toLowerCase()))
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
                  📍 {r.address || "ليبيا"} | خصم {r.discount_percentage ?? 0}%
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
  attractions = [],
}: {
  hotels: Hotel[];
  selectedHotelIds: string[];
  onToggleHotel: (id: string) => void;
  targetCities?: string[];
  attractions?: Attraction[];
}) {
  const [showAllCities, setShowAllCities] = useState(false);

  const effectiveTargetCities = useMemo(() => {
    return resolveCitiesFromDestinations(targetCities, attractions);
  }, [targetCities, attractions]);

  const filteredHotels = useMemo(() => {
    if (showAllCities || effectiveTargetCities.length === 0) return hotels;
    return hotels.filter(h => 
      effectiveTargetCities.some(dest => 
        h.city.toLowerCase().includes(dest.toLowerCase()) || 
        dest.toLowerCase().includes(h.city.toLowerCase()) || 
        (h.address && h.address.toLowerCase().includes(dest.toLowerCase()))
      )
    );
  }, [hotels, showAllCities, effectiveTargetCities]);

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

// Guide working-day names <-> codes, shared by the trip create and edit modals
const arabicToCodeMap: Record<string, string> = {
  "السبت": "sat",
  "الأحد": "sun",
  "الإثنين": "mon",
  "الثلاثاء": "tue",
  "الأربعاء": "wed",
  "الخميس": "thu",
  "الجمعة": "fri",
};
const codeToArabicMap: Record<string, string> = {
  "sat": "السبت",
  "sun": "الأحد",
  "mon": "الإثنين",
  "tue": "الثلاثاء",
  "wed": "الأربعاء",
  "thu": "الخميس",
  "fri": "الجمعة",
};

function CreateTripModal({
  type,
  guides,
  vehicles,
  hotels,
  restaurants = [],
  drivers = [],
  attractions = [],
  dailyTrips = [],
  weeklyTrips = [],
  onClose,
  onCreate,
}: {
  type: "daily" | "weekly";
  guides: Guide[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  restaurants?: Restaurant[];
  drivers?: Driver[];
  attractions?: Attraction[];
  dailyTrips?: DailyTrip[];
  weeklyTrips?: WeeklyTrip[];
  onClose: () => void;
  onCreate: (t: "daily" | "weekly", d: any) => void;
}) {
  const isDaily = type === "daily";
  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [multiDestinations, setMultiDestinations] = useState<string[]>([]);
  const [departureCity, setDepartureCity] = useState("طرابلس");
  const [price, setPrice] = useState("");
  const [busCapacity, setBusCapacity] = useState<15 | 25 | 50>(25);
  const [guideLic, setGuideLic] = useState(guides[0]?.license_number || "");
  const [selectedPlate, setSelectedPlate] = useState<string>("");
  
  // Multi-select restaurants & cafes
  const [selectedRestaurantIds, setSelectedRestaurantIds] = useState<string[]>([]);
  const handleToggleRestaurant = (id: string) => {
    setSelectedRestaurantIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  // Multi-select hotels
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>([]);
  const handleToggleHotel = (id: string) => {
    setSelectedHotelIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const [itinerarySteps, setItinerarySteps] = useState<ItineraryStepItem[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Daily Trips schedule: ALLOWS 1 day OR 2 days in a week!
  const [recurringDays, setRecurringDays] = useState<string[]>(["الأحد", "الأربعاء"]);

  // Weekly Trips schedule: 1 day in a week
  const [weeklyDay, setWeeklyDay] = useState<string>("الجمعة");

  const handleStartDateChange = (date: string) => {
    setStartDate(date);
    if (!isDaily && date) {
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        const days = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
        setWeeklyDay(days[d.getDay()]);
      }
    }
  };

  const handleMultiDestToggle = (attractionName: string) => {
    setMultiDestinations(prev => {
      const next = prev.includes(attractionName)
        ? prev.filter(c => c !== attractionName)
        : [...prev, attractionName];
      if (next.length > 0) {
        setDestination(next[0]);
      } else {
        setDestination("");
      }
      return next;
    });
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

  const [showAllGuides, setShowAllGuides] = useState(false);


  const filteredGuidesList = useMemo(() => {
    return guides.filter((g) => {
      if (g.verification_status === "مرفوض") return false;

      // City filter for weekly trips / daily trips if guide has city specified
      if (g.city) {
        const destCities = isDaily ? [destination, departureCity] : [departureCity, ...multiDestinations];
        const match = destCities.some((c) => c && (g.city!.includes(c) || c.includes(g.city!)));
        if (!match && g.city !== departureCity) return false;
      }

      // Daily trips schedule filter: match guide's working_days with trip recurringDays
      if (isDaily && !showAllGuides && recurringDays.length > 0 && g.working_days) {
        let gDays: string[] = [];
        try {
          gDays = typeof g.working_days === "string" ? JSON.parse(g.working_days) : g.working_days;
        } catch {
          gDays = String(g.working_days).split(",").map(s => s.trim().toLowerCase());
        }
        if (Array.isArray(gDays) && gDays.length > 0) {
          const gDaysLower = gDays.map(d => String(d).toLowerCase().trim());
          if (!gDaysLower.includes("all") && !gDaysLower.includes("جميع الأيام")) {
            // Check if guide works on all selected trip days
            const availableOnAllDays = recurringDays.every(day => {
              const code = arabicToCodeMap[day] || "";
              return gDaysLower.includes(code) || gDaysLower.includes(day);
            });
            if (!availableOnAllDays) return false;
          }
        }
      }

      // Weekly trips schedule filter: ensure guide is not already booked during this trip's dates
      if (!isDaily && startDate) {
        const targetStart = new Date(startDate);
        const targetEnd = endDate ? new Date(endDate) : targetStart;
        if (!isNaN(targetStart.getTime())) {
          const s = targetStart.getTime();
          const e = targetEnd.getTime();
          const conflict = weeklyTrips.find((wt: any) => {
            const assigned = wt.guide_license_number === g.license_number || wt.guide_license === g.license_number;
            if (!assigned || !wt.start_date) return false;
            const wtStart = new Date(wt.start_date);
            const wtEnd = wt.end_date ? new Date(wt.end_date) : wtStart;
            if (isNaN(wtStart.getTime()) || isNaN(wtEnd.getTime())) return false;
            return !(wtEnd.getTime() < s || wtStart.getTime() > e);
          });
          if (conflict) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (multiDestinations.length > 0) {
        const aMatches = (a.places || []).filter((p: any) => multiDestinations.includes(p.place_name || p.name)).length;
        const bMatches = (b.places || []).filter((p: any) => multiDestinations.includes(p.place_name || p.name)).length;
        if (aMatches !== bMatches) return bMatches - aMatches;
      }
      return 0;
    });
  }, [guides, isDaily, destination, departureCity, multiDestinations, recurringDays, showAllGuides, startDate, endDate, weeklyTrips]);

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

    if (!title.trim()) {
      alert("تنبيه: يرجى إدخال عنوان الرحلة السياحية!");
      return;
    }

    const effectiveDestinations = multiDestinations.length > 0
      ? multiDestinations
      : (destination ? [destination] : []);

    if (effectiveDestinations.length === 0) {
      alert("تنبيه: يجب اختيار معلم سياحي واحد على الأقل للرحلة من المعالم المسجلة بالمنصة!");
      return;
    }

    if (isDaily && (recurringDays.length < 1 || recurringDays.length > 2)) {
      alert("تنبيه: يجب اختيار يوم واحد أو يومين أسبوعياً للرحلة اليومية!");
      return;
    }

    if (!isDaily && (!startDate || !endDate)) {
      alert("تنبيه: يرجى إدخال تاريخ الانطلاق وتاريخ العودة إلى مدينة الانطلاق!");
      return;
    }

    if (!price) {
      alert("تنبيه: يرجى إدخال سعر الرحلة!");
      return;
    }

    if (!itinerarySteps || itinerarySteps.length === 0) {
      alert("تنبيه: يرجى إضافة محطة واحدة على الأقل لجدول مسار الرحلة وتعبئة بياناتها!");
      return;
    }

    const hasIncompleteStep = itinerarySteps.some(s => !s.title || !s.title.trim());
    if (hasIncompleteStep) {
      alert("تنبيه: يرجى إدخال عنوان واضح ومحدد لكافة محطات خط سير الرحلة!");
      return;
    }

    const selectedAttractionObjects = (attractions || []).filter(a => effectiveDestinations.includes(a.name || a.place_name || ""));
    const placeIds = selectedAttractionObjects.map(a => a.place_id || a.id);

    const payload: any = {
      trip_title: title.trim(),
      title: title.trim(),
      description: title.trim(),
      destination: effectiveDestinations.join(" + "),
      destination_city: selectedAttractionObjects[0]?.city || effectiveDestinations[0] || departureCity,
      destinations: effectiveDestinations,
      place_ids: placeIds,
      places: selectedAttractionObjects,
      departure_city: departureCity,
      price_per_seat: +price,
      seat_per_price: +price,
      bus_capacity: busCapacity,
      max_capacity: busCapacity,
      available_seats: busCapacity,
      recurring_days: recurringDays.join(","),
      weekly_day: weeklyDay,
      start_date: startDate || new Date().toISOString().split("T")[0],
      end_date: endDate || new Date(Date.now() + 5 * 86400000).toISOString().split("T")[0],
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
      activities: null,
      is_active: isActive,
    };

    onCreate(type, payload);
  };

  return (
    <ModalShell
      maxWidth="max-w-5xl"
      title={
        isDaily
          ? `إنشاء رحلة يومية جديدة (حافلة ${busCapacity} راكب)`
          : `إنشاء رحلة أسبوعية جديدة (حافلة ${busCapacity} راكب)`
      }
      onClose={onClose}
    >
      <form className="space-y-5 text-right text-xs" onSubmit={handleSubmit}>
        
        {/* 1. Basic Info */}
        <div className="space-y-3.5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="font-black text-slate-800 text-sm flex items-center gap-1.5">
            <span>🏷️</span>
            <span>البيانات الأساسية للرحلة</span>
          </div>

          <Field
            label="عنوان الرحلة السياحية *"
            placeholder={isDaily ? "مثال: جولة استكشاف آثار لبدة الكبرى والمسرح الروماني" : "مثال: مغامرة الصحراء الكبرى وبحيرات أوباري"}
            value={title}
            onChange={setTitle}
            onKeyDown={handleEnterKeyNext}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block">
                {isDaily ? "مدينة الانطلاق" : "مدينة الانطلاق والعودة إليها *"}
              </label>
              <select
                value={departureCity}
                onChange={(e) => setDepartureCity(e.target.value)}
                onKeyDown={handleEnterKeyNext}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right mb-2 bg-white"
              >
                <option value="طرابلس">طرابلس</option>
                <option value="بنغازي">بنغازي</option>
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-800">
                  {isDaily
                    ? "معالم ووجهات الرحلة اليومية (يمكنك اختيار معلَم أو أكثر) *"
                    : "معالم ووجهات الرحلة الأسبوعية (يمكنك اختيار معلَم أو أكثر) *"}
                </label>
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                  {multiDestinations.length} {multiDestinations.length === 1 ? "معلم مختار" : "معالم مختارة"}
                </span>
              </div>
              <div className="w-full min-h-11 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-right mb-2 bg-white flex flex-wrap gap-1.5 items-center">
                {multiDestinations.length === 0 && (
                  <span className="text-slate-400 font-normal">اضغط على المعالم المسجلة بالأسفل لاختيارها (يمكنك اختيار معلَم واحد أو عدة معالم)...</span>
                )}
                {multiDestinations.map(d => (
                  <span key={d} className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 border border-blue-200 shadow-2xs">
                    <span>🏛️ {d}</span>
                    <button type="button" onClick={() => handleMultiDestToggle(d)} className="text-blue-500 hover:text-red-600 font-black cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-slate-600 block">
                اضغط لاختيار أو إلغاء المعالم السياحية المسجلة في المنصة:
              </label>
              <span className="text-[10px] text-slate-400">يمكن تحديد أكثر من معلَم سياحي</span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-white rounded-xl border border-slate-200">
              {(attractions || []).length === 0 ? (
                <span className="text-xs text-slate-400 font-bold">لا توجد معالم مسجلة بعد. يمكنك إضافتها من قسم المعالم السياحية.</span>
              ) : (
                (attractions || []).map((a) => {
                  const aName = a.name || a.place_name || "";
                  const isSelected = multiDestinations.includes(aName);
                  return (
                    <button
                      key={a.id || a.place_id || aName}
                      type="button"
                      onClick={() => handleMultiDestToggle(aName)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                        isSelected ? "bg-[#003580] text-white border-[#003580] shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                      }`}
                    >
                      <span>📍 {aName}</span>
                      {a.city && <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-slate-400"}`}>({a.city})</span>}
                      {isSelected && <span className="mr-1 text-emerald-300 font-black">✓</span>}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Field
              label="سعر المقعد الواحد (د.ل) *"
              type="number"
              placeholder={isDaily ? "مثال: 120" : "مثال: 1650"}
              value={price}
              onChange={setPrice}
              onKeyDown={handleEnterKeyNext}
              required
            />
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
              {weeklyDay && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-200 text-amber-900 text-[11px] font-black">
                  تنطلق الرحلة كل يوم {weeklyDay}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  📅 تاريخ الانطلاق من مدينة الانطلاق *:
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 text-right outline-none focus:border-amber-600"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-amber-900 block mb-1">
                  🏁 تاريخ العودة إلى مدينة الانطلاق *:
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  required
                  className="w-full h-10 px-3 rounded-xl border border-amber-300 bg-white text-xs font-bold text-slate-900 text-right outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Vehicles & Drivers Filtered by Capacity & Date Vacancy */}
        <TripVehicleAndDriverSelector
          vehicles={vehicles}
          drivers={drivers}
          busCapacity={busCapacity}
          onCapacityChange={(cap) => setBusCapacity(cap)}
          selectedPlate={selectedPlate}
          onSelectPlate={setSelectedPlate}
          departureCity={departureCity}
          startDate={startDate}
          endDate={endDate}
          existingTrips={{ dailyTrips, weeklyTrips }}
        />

        {/* 4. Multi-Select Restaurants & Cafes Filtered by Landmark / Destination */}
        <TripRestaurantSelector
          restaurants={restaurants}
          selectedIds={selectedRestaurantIds}
          onToggleSelect={handleToggleRestaurant}
          targetCity={multiDestinations[0] || destination || undefined}
          targetCities={multiDestinations.length > 0 ? multiDestinations : (destination ? [destination] : [])}
          attractions={attractions}
        />

        {/* 5. Multi-Select Hotels (for Weekly Trips) */}
        {!isDaily && (
          <TripHotelSelector
            hotels={hotels}
            selectedHotelIds={selectedHotelIds}
            onToggleHotel={handleToggleHotel}
            targetCities={multiDestinations}
            attractions={attractions}
          />
        )}

        {/* 6. Step-by-Step Itinerary Editor with Add / Delete Stops */}
        <TripItineraryTimelineEditor
          steps={itinerarySteps}
          onChange={setItinerarySteps}
          selectedRestaurant={selectedPrimaryRestaurant}
          mode={isDaily ? "time" : "days"}
        />

        {/* 7. Tour Guide Selector Filtered by Working Days */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
            <label className="text-xs font-bold text-slate-800 block">
              👨‍🏫 المرشد السياحي المعين للرحلة {isDaily && !showAllGuides && (
                <span className="text-blue-700 font-black">
                  (مفلتر تلقائياً وفقاً لأيام عمل المرشد لتناسب أيام الرحلة: {recurringDays.join(" و ")})
                </span>
              )}:
            </label>
            {isDaily && (
              <button
                type="button"
                onClick={() => setShowAllGuides(!showAllGuides)}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition"
              >
                {showAllGuides ? "🔍 إعادة تفعيل فلترة أيام العمل فقط" : "👁️ عرض كافة المرشدين"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
            {filteredGuidesList.length === 0 && (
              <div className="col-span-full text-center text-xs text-amber-800 py-3 font-bold bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <div>لا يوجد مرشدين متاحين يطابق جدول عملهم الأيام المختارة ({recurringDays.join(" و ")}).</div>
                <button
                  type="button"
                  onClick={() => setShowAllGuides(true)}
                  className="text-xs text-blue-700 font-black hover:underline cursor-pointer"
                >
                  اضغط هنا لعرض كافة المرشدين وتجاوز الفلترة
                </button>
              </div>
            )}
            {filteredGuidesList.map((g) => {
              const isSelected = guideLic === g.license_number;
              let gDaysArr: string[] = [];
              try {
                gDaysArr = typeof g.working_days === "string" ? JSON.parse(g.working_days) : (g.working_days || []);
              } catch {
                gDaysArr = String(g.working_days || "").split(",").map(s => s.trim());
              }
              const arabicDays = gDaysArr.map(d => codeToArabicMap[d.toLowerCase()] || d);
              const daysLabel = arabicDays.length > 0 && !arabicDays.includes("all") ? arabicDays.join("، ") : "طوال أيام الأسبوع";

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
                    <div className="text-[9px] text-slate-600 font-bold mt-0.5 flex items-center gap-1">
                      <span>📅 أيام العمل:</span>
                      <span className="text-slate-800 font-black">{daysLabel}</span>
                    </div>
                    <div className="text-[9px] text-emerald-700 font-black mt-0.5">
                      {(g.daily_rate || g.price_per_day) ? `${g.daily_rate || g.price_per_day} د.ل / اليوم` : "السعر غير محدد"}
                    </div>
                    {g.places && g.places.length > 0 && (
                      <div className="text-[9px] text-amber-900 font-bold mt-1 bg-amber-50 p-1 rounded-lg border border-amber-200">
                        <span>🏛️ المعالم المعتمدة: </span>
                        <span>{g.places.map((p: any) => p.place_name || p.name).join("، ")}</span>
                      </div>
                    )}
                    {multiDestinations.length > 0 && (g.places || []).some((p: any) => multiDestinations.includes(p.place_name || p.name)) && (
                      <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                        <span>🌟</span>
                        <span>خبير بمعالم هذه الرحلة</span>
                      </div>
                    )}
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
  attractions = [],
  dailyTrips = [],
  weeklyTrips = [],
  onClose,
  onSave,
}: {
  trip: DailyTrip;
  guides: Guide[];
  vehicles: Vehicle[];
  hotels?: Hotel[];
  restaurants?: Restaurant[];
  drivers?: Driver[];
  attractions?: Attraction[];
  dailyTrips?: DailyTrip[];
  weeklyTrips?: WeeklyTrip[];
  onClose: () => void;
  onSave: (t: DailyTrip) => void;
}) {
  const [title, setTitle] = useState(trip.trip_title || trip.title || "");
  const [multiDestinations, setMultiDestinations] = useState<string[]>(() => {
    if (Array.isArray(trip.destinations) && trip.destinations.length > 0) return trip.destinations;
    if (Array.isArray((trip as any).places) && (trip as any).places.length > 0) {
      return (trip as any).places.map((p: any) => p.place_name || p.name).filter(Boolean);
    }
    if (trip.destination) return trip.destination.split(" + ").map(s => s.trim()).filter(Boolean);
    return [];
  });
  const handleMultiDestToggle = (name: string) => {
    setMultiDestinations(prev => {
      if (prev.includes(name)) return prev.filter(c => c !== name);
      return [...prev, name];
    });
  };
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
    return [];
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

  const [showAllGuides, setShowAllGuides] = useState(false);

  const filteredGuidesList = useMemo(() => {
    return guides.filter(g => {
      if (g.verification_status === "مرفوض") return false;
      if (!showAllGuides && recurringDays.length > 0 && g.working_days) {
        let gDays: string[] = [];
        try {
          gDays = typeof g.working_days === "string" ? JSON.parse(g.working_days) : (g.working_days || []);
        } catch {
          gDays = String(g.working_days || "").split(",").map(s => s.trim().toLowerCase());
        }
        if (Array.isArray(gDays) && gDays.length > 0) {
          const gDaysLower = gDays.map(d => String(d).toLowerCase().trim());
          if (!gDaysLower.includes("all") && !gDaysLower.includes("جميع الأيام")) {
            const availableOnAllDays = recurringDays.every(day => {
              const code = arabicToCodeMap[day] || "";
              return gDaysLower.includes(code) || gDaysLower.includes(day);
            });
            if (!availableOnAllDays) return false;
          }
        }
      }
      return true;
    });
  }, [guides, showAllGuides, recurringDays]);

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
          if (multiDestinations.length === 0) {
            alert("يرجى اختيار معلَم سياحي واحد على الأقل للرحلة اليومية من المعالم المسجلة بالمنصة.");
            return;
          }
          if (!itinerarySteps || itinerarySteps.length === 0) {
            alert("تنبيه: يرجى إضافة محطة واحدة على الأقل لجدول مسار الرحلة وتعبئة بياناتها!");
            return;
          }
          const hasIncompleteEditDailyStep = itinerarySteps.some(s => !s.title || !s.title.trim());
          if (hasIncompleteEditDailyStep) {
            alert("تنبيه: يرجى كتابة عنوان واضح لكافة محطات خط سير الرحلة!");
            return;
          }
          const selectedAttractionObjects = (attractions || []).filter(a => multiDestinations.includes(a.name || a.place_name || ""));
          const selectedPlaceIds = selectedAttractionObjects.map(a => a.id || a.place_id);
          onSave({
            ...trip,
            trip_title: title,
            title,
            description: title,
            destination: multiDestinations.join(" + "),
            destination_city: selectedAttractionObjects[0]?.city || multiDestinations[0] || departureCity,
            destinations: multiDestinations,
            place_ids: selectedPlaceIds,
            places: selectedAttractionObjects,
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
            activities: null,
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
              className="w-full h-10 px-3 rounded-xl border border-slate-300 text-xs font-bold text-right bg-white"
            >
              <option value="طرابلس">طرابلس</option>
              <option value="بنغازي">بنغازي</option>
            </select>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">
                المعالم والوجهات السياحية للرحلة اليومية (يمكنك اختيار معلَم أو أكثر) *
              </label>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {multiDestinations.length} {multiDestinations.length === 1 ? "معلم مختار" : "معالم مختارة"}
              </span>
            </div>
            <div className="w-full min-h-11 px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-right mb-2 bg-white flex flex-wrap gap-1.5 items-center">
              {multiDestinations.length === 0 && (
                <span className="text-slate-400 font-normal">اضغط على المعالم بالأسفل لاختيارها (يمكنك اختيار معلَم واحد أو عدة معالم)...</span>
              )}
              {multiDestinations.map(d => (
                <span key={d} className="bg-blue-100 text-blue-900 px-2.5 py-1 rounded-lg text-xs font-black flex items-center gap-1.5 border border-blue-200 shadow-2xs">
                  <span>🏛️ {d}</span>
                  <button type="button" onClick={() => handleMultiDestToggle(d)} className="text-blue-500 hover:text-red-600 font-black cursor-pointer">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Click Landmark Selector for Daily Trips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold text-slate-600 block">
              اضغط لاختيار أو إلغاء المعالم السياحية المسجلة في المنصة للرحلة اليومية:
            </label>
            <span className="text-[10px] text-slate-400">يمكن تحديد أكثر من معلَم سياحي</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-white rounded-xl border border-slate-200">
            {(attractions || []).length === 0 ? (
              <span className="text-xs text-slate-400 font-bold">لا توجد معالم مسجلة بعد. يمكنك إضافتها من قسم المعالم السياحية.</span>
            ) : (
              (attractions || []).map((a) => {
                const aName = a.name || a.place_name || "";
                const isSelected = multiDestinations.includes(aName);
                return (
                  <button
                    key={a.id || a.place_id || aName}
                    type="button"
                    onClick={() => handleMultiDestToggle(aName)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected ? "bg-[#003580] text-white border-[#003580] shadow-xs" : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    <span>📍 {aName}</span>
                    {a.city && <span className={`text-[10px] ${isSelected ? "text-blue-200" : "text-slate-400"}`}>({a.city})</span>}
                    {isSelected && <span className="mr-1 text-emerald-300 font-black">✓</span>}
                  </button>
                );
              })
            )}
          </div>
        </div>
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
          departureCity={departureCity}
          existingTrips={{ dailyTrips, weeklyTrips }}
          currentTripId={trip.daily_trip_id || trip.id}
        />

        {/* Multi-Select Restaurants & Cafes Filtered by Landmark / Destination */}
        <TripRestaurantSelector
          restaurants={restaurants}
          selectedIds={selectedRestaurantIds}
          onToggleSelect={handleToggleRestaurant}
          targetCity={multiDestinations[0] || undefined}
          targetCities={multiDestinations}
          attractions={attractions}
        />

        {/* Step-by-Step Itinerary Editor with Add/Delete Stops */}
        <TripItineraryTimelineEditor
          steps={itinerarySteps}
          onChange={setItinerarySteps}
          selectedRestaurant={selectedPrimaryRestaurant}
        />

        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1 mb-0.5">
            <label className="text-xs font-bold text-slate-800 block">
              👨‍🏫 المرشد السياحي المعين للرحلة {!showAllGuides && (
                <span className="text-blue-700 font-black">
                  (مفلتر تلقائياً وفقاً لأيام عمل المرشد: {recurringDays.join(" و ")})
                </span>
              )}:
            </label>
            <button
              type="button"
              onClick={() => setShowAllGuides(!showAllGuides)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 cursor-pointer transition"
            >
              {showAllGuides ? "🔍 إعادة تفعيل فلترة أيام العمل فقط" : "👁️ عرض كافة المرشدين"}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {filteredGuidesList.length === 0 && (
              <div className="col-span-full text-center text-xs text-amber-800 py-3 font-bold bg-amber-50 rounded-xl border border-amber-200 space-y-1">
                <div>لا يوجد مرشدين متاحين يطابق جدول عملهم الأيام المختارة ({recurringDays.join(" و ")}).</div>
                <button
                  type="button"
                  onClick={() => setShowAllGuides(true)}
                  className="text-xs text-blue-700 font-black hover:underline cursor-pointer"
                >
                  اضغط هنا لعرض كافة المرشدين وتجاوز الفلترة
                </button>
              </div>
            )}
            {filteredGuidesList.map((g) => {
              let gDaysArr: string[] = [];
              try {
                gDaysArr = typeof g.working_days === "string" ? JSON.parse(g.working_days) : (g.working_days || []);
              } catch {
                gDaysArr = String(g.working_days || "").split(",").map(s => s.trim());
              }
              const arabicDays = gDaysArr.map(d => codeToArabicMap[d.toLowerCase()] || d);
              const daysLabel = arabicDays.length > 0 && !arabicDays.includes("all") ? arabicDays.join("، ") : "طوال أيام الأسبوع";

              return (
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
                    <div className="text-[9px] text-slate-600 font-bold mt-0.5 flex items-center gap-1">
                      <span>📅 أيام العمل:</span>
                      <span className="text-slate-800 font-black">{daysLabel}</span>
                    </div>
                    <div className="text-[9px] text-emerald-700 font-black mt-0.5">
                      {(g.daily_rate || g.price_per_day) ? `${g.daily_rate || g.price_per_day} د.ل / اليوم` : "السعر غير محدد"}
                    </div>
                  </div>
                </div>
              );
            })}
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
  attractions = [],
  dailyTrips = [],
  weeklyTrips = [],
  onClose,
  onSave,
}: {
  trip: WeeklyTrip;
  guides: Guide[];
  vehicles: Vehicle[];
  hotels: Hotel[];
  restaurants?: Restaurant[];
  drivers?: Driver[];
  attractions?: Attraction[];
  dailyTrips?: DailyTrip[];
  weeklyTrips?: WeeklyTrip[];
  onClose: () => void;
  onSave: (w: WeeklyTrip) => void;
}) {
  const [title, setTitle] = useState(trip.trip_title || trip.title || "");
  const [multiDestinations, setMultiDestinations] = useState<string[]>(trip.destinations || (trip.destination ? trip.destination.split(" + ") : ["أوباري"]));
  const [departureCity, setDepartureCity] = useState(trip.departure_city || "طرابلس");
  const [price, setPrice] = useState(String(trip.seat_per_price));

  const handleMultiDestToggle = (name: string) => {
    setMultiDestinations(prev => {
      if (prev.includes(name)) return prev.filter(c => c !== name);
      return [...prev, name];
    });
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
    return [];
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
    return guides.filter((g) => {
      if (g.verification_status === "مرفوض") return false;

      // Check conflict with other weekly trips during this trip's dates
      if (startDate) {
        const targetStart = new Date(startDate);
        const targetEnd = endDate ? new Date(endDate) : targetStart;
        if (!isNaN(targetStart.getTime())) {
          const s = targetStart.getTime();
          const e = targetEnd.getTime();
          const currentId = trip.weekly_trip_id || trip.id;
          const conflict = weeklyTrips.find((wt: any) => {
            if ((wt.weekly_trip_id || wt.id) === currentId) return false;
            const assigned = wt.guide_license_number === g.license_number || wt.guide_license === g.license_number;
            if (!assigned || !wt.start_date) return false;
            const wtStart = new Date(wt.start_date);
            const wtEnd = wt.end_date ? new Date(wt.end_date) : wtStart;
            if (isNaN(wtStart.getTime()) || isNaN(wtEnd.getTime())) return false;
            return !(wtEnd.getTime() < s || wtStart.getTime() > e);
          });
          if (conflict) return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (multiDestinations.length > 0) {
        const aMatches = (a.places || []).filter((p: any) => multiDestinations.includes(p.place_name || p.name)).length;
        const bMatches = (b.places || []).filter((p: any) => multiDestinations.includes(p.place_name || p.name)).length;
        if (aMatches !== bMatches) return bMatches - aMatches;
      }
      return 0;
    });
  }, [guides, startDate, endDate, weeklyTrips, trip, multiDestinations]);

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
          if (!itinerarySteps || itinerarySteps.length === 0) {
            alert("تنبيه: يرجى إضافة محطة واحدة على الأقل لجدول مسار الرحلة وتعبئة بياناتها!");
            return;
          }
          const hasIncompleteEditWeeklyStep = itinerarySteps.some(s => !s.title || !s.title.trim());
          if (hasIncompleteEditWeeklyStep) {
            alert("تنبيه: يرجى كتابة عنوان واضح لكافة محطات خط سير الرحلة!");
            return;
          }
          const selectedPlaceIds = (attractions || [])
            .filter(a => {
              const an = a.name || (a as any).place_name;
              return !!an && multiDestinations.includes(an);
            })
            .map(a => a.id || (a as any).place_id);

          onSave({
            ...trip,
            trip_title: title,
            title,
            destinations: multiDestinations,
            destination: multiDestinations.join(" + "),
            place_ids: selectedPlaceIds,
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
            hotel_id: selectedHotelIds[0] || undefined,
            hotel_ids: selectedHotelIds,
            vehicle_plate: selectedPlate || null,
            vehicle_plates: selectedPlate ? [selectedPlate] : [],
            restaurant_id: selectedRestaurantIds[0] || null,
            restaurant_ids: selectedRestaurantIds,
            itinerary_steps: itinerarySteps,
            photo: images[0] || trip.photo || "/assets/dest-ubari-gaberoun.jpg",
            gallery: images.filter(Boolean).join(","),
            images: images,
          } as any);
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
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-800">
                الوجهات والمعالم السياحية للرحلة الأسبوعية (يمكنك اختيار معلَم أو أكثر)
              </label>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 border border-blue-200">
                {multiDestinations.length} {multiDestinations.length === 1 ? "معلم مختار" : "معالم مختارة"}
              </span>
            </div>
            <div className="w-full min-h-10 px-3 py-2 rounded-xl border border-slate-200 bg-white flex flex-wrap gap-1">
              {multiDestinations.length === 0 && <span className="text-slate-400 text-[10px]">اختر معلماً أو أكثر من المعالم المسجلة أدناه...</span>}
              {multiDestinations.map(d => (
                <span key={d} className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1">
                  🏛️ {d}
                  <button type="button" onClick={() => handleMultiDestToggle(d)} className="text-blue-500 hover:text-red-500 font-bold mr-1">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[10px] text-slate-500 font-bold">
            اختر المعالم السياحية من منصة دلني (تم اختيار {multiDestinations.length} معالم):
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50">
            {(!attractions || attractions.length === 0) ? (
              <div className="text-slate-400 text-xs py-1">لا توجد معالم مسجلة في المنصة حالياً</div>
            ) : (
              attractions.map((attr) => {
                const name = attr.name || (attr as any).place_name || "";
                const isSelected = !!name && multiDestinations.includes(name);
                return (
                  <button
                    key={attr.id || (attr as any).place_id || name}
                    type="button"
                    onClick={() => handleMultiDestToggle(name)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-black transition cursor-pointer ${
                      isSelected ? "bg-[#003580] text-white border-[#003580]" : "bg-white text-slate-700 hover:bg-slate-100 border-slate-200"
                    }`}
                  >
                    🏛️ {name} {attr.city ? `(${attr.city})` : ""} {isSelected && "✓"}
                  </button>
                );
              })
            )}
          </div>
        </div>
        <Field label="السعر (د.ل)" type="number" value={price} onChange={setPrice} />

        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
          <div className="font-black text-amber-900 text-xs flex justify-between items-center">
            <span>🗓️ موعد الانطلاق (يوم واحد أسبوعياً):</span>
            <span className="px-3 py-1 bg-amber-200/50 rounded-lg text-amber-900 font-black">يتم تحديده تلقائياً: كل {weeklyDay}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="تاريخ الانطلاق من مدينة الانطلاق" type="date" value={startDate} onChange={handleStartDateChange} />
          <Field label="تاريخ العودة إلى مدينة الانطلاق" type="date" value={endDate} onChange={setEndDate} />
        </div>

        {/* Bus Capacity & Fleet */}
        <TripVehicleAndDriverSelector
          vehicles={vehicles}
          drivers={drivers}
          busCapacity={busCapacity}
          onCapacityChange={(cap) => setBusCapacity(cap)}
          selectedPlate={selectedPlate}
          onSelectPlate={setSelectedPlate}
          departureCity={departureCity}
          startDate={startDate}
          endDate={endDate}
          existingTrips={{ dailyTrips, weeklyTrips }}
          currentTripId={trip.weekly_trip_id || trip.id}
        />

        {/* Multi-Select Restaurants & Cafes Filtered by Destination Cities */}
        <TripRestaurantSelector
          restaurants={restaurants}
          selectedIds={selectedRestaurantIds}
          onToggleSelect={handleToggleRestaurant}
          targetCities={multiDestinations}
          attractions={attractions}
        />

        {/* Multi-Select Hotels Filtered by Destination Cities */}
        <TripHotelSelector
          hotels={hotels}
          selectedHotelIds={selectedHotelIds}
          onToggleHotel={handleToggleHotel}
          targetCities={multiDestinations}
          attractions={attractions}
        />

        {/* Dynamic Itinerary Timeline with Add/Delete Stops */}
        <TripItineraryTimelineEditor
          steps={itinerarySteps}
          onChange={setItinerarySteps}
          selectedRestaurant={selectedPrimaryRestaurant}
          mode="days"
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
                    {(g.daily_rate || g.price_per_day) ? `${g.daily_rate || g.price_per_day} د.ل / اليوم` : "السعر غير محدد"}
                  </div>
                  {g.places && g.places.length > 0 && (
                    <div className="text-[9px] text-amber-900 font-bold mt-1 bg-amber-50 p-1 rounded-lg border border-amber-200">
                      <span>🏛️ المعالم المعتمدة: </span>
                      <span>{g.places.map((p: any) => p.place_name || p.name).join("، ")}</span>
                    </div>
                  )}
                  {multiDestinations.length > 0 && (g.places || []).some((p: any) => multiDestinations.includes(p.place_name || p.name)) && (
                    <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-black">
                      <span>🌟</span>
                      <span>خبير بمعالم هذه الرحلة</span>
                    </div>
                  )}
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

function EvaluatePrivateTripModal({
  trip,
  guides,
  vehicles,
  hotels = [],
  onClose,
  onSave,
}: {
  trip: PrivateTripRequest;
  guides: Guide[];
  vehicles: Vehicle[];
  hotels?: Hotel[];
  onClose: () => void;
  onSave: (
    id: string,
    status: string,
    price?: number,
    plan?: string,
    guide?: string,
    vehicle?: string,
    selectedHotelIds?: string[],
    structuredStations?: any[],
    additionalExpenses?: number
  ) => void;
}) {
  const durationDays = trip.duration_days || 1;
  const isMultiDay = durationDays > 1;

  // Tourist preferred guide or existing assigned guide
  const initialGuideLic = trip.guide_license_number || trip.assigned_guide || guides[0]?.license_number || "";
  const [guide, setGuide] = useState(initialGuideLic);
  const [vehicle, setVehicle] = useState(trip.assigned_vehicle || trip.vehicle_plate || vehicles[0]?.plate_number || "");
  const [servicesFee, setServicesFee] = useState(
    trip.additional_expenses !== undefined && trip.additional_expenses !== null && Number(trip.additional_expenses) > 0
      ? String(trip.additional_expenses)
      : "150"
  ); // الخدمات المقدمة (ضيافة، تصاريح، لوجستيات)
  const [selectedHotelIds, setSelectedHotelIds] = useState<string[]>(trip.hotel_ids || (trip.hotels ? trip.hotels.map((h: any) => h.hotel_id || h.id) : []));

  const selectedGuide = guides.find((g) => g.license_number === guide) || guides[0];
  const selectedVehicle = vehicles.find((v) => v.plate_number === vehicle) || vehicles[0];
  const guideDailyRate = Number(selectedGuide?.daily_rate) || 0;
  const vehicleDailyRate = selectedVehicle?.daily_rate || 500;
  const servCost = Number(servicesFee) || 0;

  const totalGuideCost = guideDailyRate * durationDays;
  const totalVehicleCost = vehicleDailyRate * durationDays;
  const autoCalculatedTotal = totalGuideCost + totalVehicleCost + servCost;

  const [price, setPrice] = useState(trip.quoted_price ? String(trip.quoted_price) : String(autoCalculatedTotal));
  const [inspectVehicle, setInspectVehicle] = useState<VehicleDetailsData | null>(null);

  // Initialize itinerary stations matching Daily (mode="time") or Weekly (mode="days")
  const initialSteps: ItineraryStepItem[] = useMemo(() => {
    if (trip.stations && Array.isArray(trip.stations) && trip.stations.length > 0) {
      return trip.stations.map((st: any) => ({
        time: st.station_time || (st.day_number ? `اليوم ${st.day_number}` : "09:00 ص"),
        title: st.station_title,
        desc: st.station_desc || "",
      }));
    }

    if (trip.admin_itinerary_plan) {
      try {
        const parsed = JSON.parse(trip.admin_itinerary_plan);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
          return parsed;
        }
      } catch {}
    }

    // Default hourly stops for 1-day trip
    if (!isMultiDay) {
      return [
        {
          time: "08:30 ص",
          title: `نقطة التجمع والانطلاق (${trip.customer_description || "الرحلة الخاصة"})`,
          desc: "التجمع ومقابلة المرشد السياحي المعتمد وصعود مركبة النقل الخاصة والانطلاق نحو الوجهة.",
        },
        {
          time: "10:30 ص",
          title: `المحطة السياحية الأولى: استكشاف معالم ${trip.customer_description || "الموقع الأثري"}`,
          desc: "جولة ميدانية استكشافية برفقة المرشد السياحي المعتمد مع شرح تاريخي وتوثيقي للموقع والتقاط الصور.",
        },
        {
          time: "02:00 م",
          title: "استراحة وتناول وجبة الغداء التقليدية",
          desc: "استراحة ضيافة وتناول وجبة طعام ليبية أصيلة بمطعم سياحي معتمد بالمنطقة المزارة.",
        },
        {
          time: "05:00 م",
          title: "المحطة الختامية والعودة بسلامة الله",
          desc: "اختتام فعاليات البرنامج الخاص والعودة بالمركبة المخصصة إلى نقطة الانطلاق.",
        },
      ];
    }

    // Default day-by-day stops for multi-day trip
    return Array.from({ length: durationDays }).map((_, i) => ({
      time: `اليوم ${i + 1}`,
      title:
        i === 0
          ? `محطة اليوم 1 - الانطلاق نحو ${trip.customer_description || "الوجهة السياحية"}`
          : i === durationDays - 1
          ? `محطة اليوم ${durationDays} - الجولة الختامية والعودة بسلامة الله`
          : `محطة اليوم ${i + 1} - استكشاف المعالم والأنشطة الميدانية`,
      desc: `برنامج ومسار اليوم ${i + 1} يشمل الجولات الميدانية التراثية مع المرشد السياحي وسيارة النقل المخصصة والإقامة والخدمات.`,
    }));
  }, [trip.stations, trip.admin_itinerary_plan, isMultiDay, durationDays, trip.customer_description]);

  const [itinerarySteps, setItinerarySteps] = useState<ItineraryStepItem[]>(initialSteps);

  const applyAutoPrice = () => {
    setPrice(String(autoCalculatedTotal));
  };

  const handleSendProposal = () => {
    if (!price || Number(price) <= 0) {
      alert("يرجى إدخال سعر معتمد صالح للرحلة الخاصة.");
      return;
    }
    if (itinerarySteps.length === 0) {
      alert("يرجى إضافة محطة واحدة على الأقل في خط سير الرحلة.");
      return;
    }

    // Convert ItineraryStepItem into normalized structured stations for DelniDB
    const structuredStations = itinerarySteps.map((st, idx) => ({
      station_id: `PTS-${trip.private_trip_id}-${idx + 1}`,
      private_trip_id: trip.private_trip_id,
      day_number: isMultiDay ? (idx < durationDays ? idx + 1 : durationDays) : 1,
      station_order: idx + 1,
      station_title: st.title,
      station_time: st.time,
      station_desc: st.desc || "",
    }));

    const serializedPlan = JSON.stringify(itinerarySteps);
    // Explicit status: "بانتظار تأكيد السائح"
    onSave(
      trip.private_trip_id,
      "بانتظار تأكيد السائح",
      +price,
      serializedPlan,
      guide,
      vehicle,
      selectedHotelIds,
      structuredStations,
      Number(servicesFee) || 0
    );
  };

  return (
    <ModalShell maxWidth="max-w-4xl sm:max-w-5xl" title={`دراسة وجدولة طلب الرحلة الخاصة: ${trip.private_trip_id}`} onClose={onClose}>
      <div className="space-y-5 text-right p-1 sm:p-2">
        {/* Tourist Request Details Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 text-xs space-y-3 border border-slate-200 shadow-2xs">
          <div className="flex justify-between items-center flex-wrap gap-2 pb-2.5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-foreground">
                👤 العميل: {trip.customer_name || "سائح دلّني"}
              </span>
              {trip.customer_phone && (
                <span className="font-mono text-xs font-bold text-slate-600 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  📞 {trip.customer_phone}
                </span>
              )}
            </div>
            <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary font-black text-xs">
              ⏱️ نظام الجدولة: {isMultiDay ? `متعددة الأيام (${durationDays} أيام)` : "يومية بالساعات (يوم واحد)"}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-muted-foreground font-bold">
            <span className="text-slate-800">
              📅 تاريخ الانطلاق المفضل: <b className="text-primary font-black">{formatTripDate(trip.preferred_start_date)}</b>
            </span>
            <span>👥 عدد المرافقين: <b className="text-slate-800">{trip.number_of_companions} أفراد</b></span>
            <span>⏳ مدة الرحلة: <b className="text-slate-800">{trip.duration_days} {trip.duration_days > 1 ? "أيام" : "يوم"}</b></span>
          </div>

          {/* Clean Destinations Tags */}
          <div className="flex items-center gap-2 flex-wrap pt-1">
            <span className="font-black text-slate-900 text-xs">🏛️ المعالم السياحية المستهدفة:</span>
            {trip.places && trip.places.length > 0 ? (
              trip.places.map((pl: any, idx: number) => (
                <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-xs flex items-center gap-1">
                  <span>📍</span>
                  <span>{pl.place_name || pl.name} ({pl.city})</span>
                </span>
              ))
            ) : (
              <span className="text-slate-700 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                {trip.customer_description || "رحلة خاصة مخصصة"}
              </span>
            )}
          </div>

          {/* Clean Tourist Requirements */}
          {trip.customer_requirements && (
            <div className="text-xs text-amber-950 bg-amber-50/90 p-3 rounded-xl border border-amber-200 leading-relaxed font-semibold">
              <b className="text-amber-900 block mb-1">📝 متطلبات وملاحظات السائح:</b>
              <span>
                {Array.from(new Set(trip.customer_requirements.split(" - ").map(s => s.trim()))).filter(Boolean).join(" • ")}
              </span>
            </div>
          )}
        </div>

        {/* Tourist Selected Guide Display & Confirmation */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
          <label className="text-xs font-black text-foreground block">
            👨‍✈️ المرشد السياحي المعين للرحلة:
          </label>
          <select
            value={guide}
            onChange={(e) => setGuide(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-right focus:bg-white transition"
          >
            {guides.map((g) => (
              <option key={g.license_number} value={g.license_number}>
                {g.full_name} ({g.license_number}) — {g.daily_rate ? `${g.daily_rate} د.ل / اليوم` : "السعر غير محدد"} {g.license_number === trip.guide_license_number ? "⭐ (اختيار السائح المفضل)" : ""}
              </option>
            ))}
          </select>
          {trip.guide_license_number && (
            <p className="text-[11px] text-emerald-700 font-bold mt-1">
              ✓ تم تثبيت المرشد ({trip.guide_license_number}) بناءً على رغبة واختيار السائح المسبق.
            </p>
          )}
        </div>

        {/* Vehicle Selection - Admin Duty */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2">
          <label className="text-xs font-black text-foreground block">
            🚌 سيارة النقل المخصصة (تحديد الإدارة بحسب عدد الركاب والمسار):
          </label>
          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-right focus:bg-white transition"
          >
            {vehicles.map((v) => (
              <option key={v.plate_number} value={v.plate_number}>
                {v.vehicle_type} ({v.plate_number}) — {v.company_name} — سعة {v.capacity || "—"} ركاب — {v.daily_rate} د.ل / اليوم
              </option>
            ))}
          </select>

          {/* Live Vehicle Preview Card with Inspect Modal Trigger */}
          {selectedVehicle && (
            <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3 flex-wrap mt-2">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-900 text-xl">🚍</span>
                <div>
                  <div className="font-black text-xs text-blue-950">
                    {selectedVehicle.vehicle_type} — {selectedVehicle.company_name}
                  </div>
                  <div className="text-[11px] text-blue-800 flex items-center gap-2 mt-0.5 font-bold">
                    <span className="font-mono">لوحة: {selectedVehicle.plate_number}</span>
                    <span>•</span>
                    <span>سعة {selectedVehicle.capacity || 25} راكب</span>
                    <span>•</span>
                    <span>{selectedVehicle.daily_rate} د.ل / اليوم</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setInspectVehicle({
                    plate_number: selectedVehicle.plate_number,
                    vehicle_type: selectedVehicle.vehicle_type,
                    capacity: selectedVehicle.capacity ?? undefined,
                    daily_rate: selectedVehicle.daily_rate ?? undefined,
                    company_name: selectedVehicle.company_name ?? undefined,
                    vehicle_status: selectedVehicle.status || "جاهزة",
                  });
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs cursor-pointer shadow-xs transition flex items-center gap-1.5"
              >
                <span>👁️</span>
                <span>فحص مواصفات وتفاصيل المركبة</span>
              </button>
            </div>
          )}
        </div>

        {inspectVehicle && (
          <VehicleDetailsModal vehicle={inspectVehicle} onClose={() => setInspectVehicle(null)} />
        )}

        {/* Multi-Hotel Selection - Admin Duty (M:N Relational Table: hotels_trip_private) */}
        <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-blue-900 block flex items-center gap-1.5">
              <span>🏨</span>
              <span>تخصيص أماكن الإقامة والفنادق المقترحة (يمكن اختيار أكثر من فندق):</span>
            </label>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              {selectedHotelIds.length} فنادق مختارة
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            اختر الفنادق المعتمدة التي سيقيم فيها السائح خلال مسار الرحلة لتظهر في جدوله المقترح:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
            {hotels.map((h) => {
              const hid = h.hotel_id || h.id;
              const isSelected = selectedHotelIds.includes(hid);
              return (
                <div
                  key={hid}
                  onClick={() => {
                    setSelectedHotelIds((prev) =>
                      prev.includes(hid) ? prev.filter((id) => id !== hid) : [...prev, hid]
                    );
                  }}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? "bg-white border-blue-600 shadow-xs ring-1 ring-blue-600 font-bold"
                      : "bg-white/80 border-slate-200 hover:bg-white text-slate-700"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="truncate font-black text-[11px] text-slate-900">{h.name}</div>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1">
                      <span>📍 {h.city}</span>
                      <span>•</span>
                      <span>{"★".repeat(h.stars || 4)}</span>
                    </div>
                  </div>
                  <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black shrink-0 ${
                    isSelected ? "bg-blue-600 text-white" : "border border-slate-300"
                  }`}>
                    {isSelected ? "✓" : ""}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Services Fee */}
        <div>
          <label className="text-xs font-black text-foreground mb-1 block">
            🛠️ مصروفات الخدمات المقدمة (لوجستيات، تصاريح، ضيافة) (د.ل):
          </label>
          <input
            type="number"
            value={servicesFee}
            onChange={(e) => setServicesFee(e.target.value)}
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
              <span>مصروفات الخدمات اللوجستية:</span>
              <span className="font-bold text-foreground">{servCost} د.ل</span>
            </div>
            <div className="flex justify-between border-t border-emerald-200/80 pt-1.5 font-black text-emerald-900">
              <span>المجموع الكلي التقديري:</span>
              <span className="text-sm font-black">{autoCalculatedTotal} د.ل</span>
            </div>
          </div>
        </div>

        <Field label="السعر الإجمالي النهائي المعروض للسائح (د.ل) *" type="number" value={price} onChange={setPrice} />

        {/* REUSED ITINERARY TIMELINE EDITOR */}
        <div className="pt-2 border-t border-border">
          <div className="mb-2">
            <span className="text-xs font-black text-foreground flex items-center gap-1.5">
              <span>🧭</span>
              <span>إعداد جدول محطات الرحلة المقترح ({isMultiDay ? "آلية الرحلات الأسبوعية بالأيام" : "آلية الرحلات اليومية بالساعات"}):</span>
            </span>
            <p className="text-[11px] text-muted-foreground">
              {isMultiDay
                ? "يتم تنظيم المحطات حسب الأيام لكل يوم مساره وأنشطته الخاصة."
                : "يتم جدولة المحطات بالساعات وتوقيت ومسار كل محطة بدقة."}
            </p>
          </div>
          <TripItineraryTimelineEditor
            steps={itinerarySteps}
            onChange={setItinerarySteps}
            mode={isMultiDay ? "days" : "time"}
          />
        </div>

        <div className="flex gap-2 justify-end pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => {
              if (confirm("هل تريد بالتأكيد رفض طلب هذه الرحلة الخاصة؟")) {
                onSave(trip.private_trip_id, "مرفوضة من الأدمن");
              }
            }}
            className="px-4 h-10 border border-red-200 text-red-600 rounded-xl font-black text-xs hover:bg-red-50 cursor-pointer"
          >
            رفض الطلب
          </button>
          <button
            type="button"
            onClick={handleSendProposal}
            className="px-5 h-10 bg-gradient-sea text-white rounded-xl font-black text-xs shadow-glow hover:opacity-95 cursor-pointer flex items-center gap-2"
          >
            <span>↗</span>
            <span>اعتماد الجدول وإرسال العرض المقترح للسائح ({price} د.ل)</span>
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
  onSave: (h: any) => Promise<string | null>;
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
  const [discountPct, setDiscountPct] = useState(hotel?.discount_percentage ?? 15);
  const [description, setDescription] = useState(hotel?.description || "");
  const [mapsUrl, setMapsUrl] = useState(hotel?.google_maps_url || "");
  const [workingHours, setWorkingHours] = useState(hotel?.working_hours || "خدمة استقبال 24/7 (تسجيل وصول 14:00 - مغادرة 12:00)");
  const [amenities, setAmenities] = useState<string[]>(hotel?.amenities || ["مسبح", "واي فاي", "موقف"]);

  // Local (Libya) date, not UTC
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [contractStartDate] = useState(hotel?.contract_start_date || todayStr);
  const [contractEndDate, setContractEndDate] = useState(hotel?.contract_end_date || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [p1, setP1] = useState(hotel?.hotel_photo_1 || "/assets/ai_hotel.jpg");
  const [p2, setP2] = useState(hotel?.hotel_photo_2 || "/assets/hotel_resort.jpg");
  const [p3, setP3] = useState(hotel?.hotel_photo_3 || "/assets/dest-tripoli.jpg");
  const [p4, setP4] = useState(hotel?.hotel_photo_4 || "/assets/dest-harbor-coast.jpg");
  const [p5, setP5] = useState(hotel?.hotel_photo_5 || "/assets/dest-ghadames-alleys.jpg");

  const propertyOptions = [
    { id: "hotel", label: "🏨 فندق فاخر", desc: "فنادق مصنفة وضيافة راقية ومتميزة" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = hotelIdInput.trim();
    if (!cleanId) {
      setErrorMsg("يرجى إدخال رقم البلدية");
      return;
    }

    // Unique Primary Key Check
    const isDup = existingHotels.some(
      h => (String(h.hotel_id || h.id).trim() === cleanId) && h.id !== hotel?.id
    );
    if (isDup) {
      setErrorMsg(`رقم البلدية (${cleanId}) مسجل مسبقاً لفندق آخر`);
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
    if (isNewPastDate(contractEndDate, hotel?.contract_end_date)) {
      setErrorMsg("تاريخ نهاية العقد يجب أن يكون تاريخاً قادماً.");
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

    setSaving(true);
    const saveError = await onSave({
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
      discount_percentage: Number(discountPct),
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
    setSaving(false);
    if (saveError) setErrorMsg("لم يتم الحفظ في قاعدة البيانات: " + saveError);
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
              يبدأ العقد تلقائياً من يوم التسجيل.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-[#003580] text-white text-[11px] font-black shrink-0">
            خصم {discountPct}% معتمد
          </span>
        </div>

        {/* Municipal ID (primary key) */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-800 block">رقم البلدية *</label>
          <input
            type="text"
            value={hotelIdInput}
            onChange={(e) => {
              setHotelIdInput(e.target.value);
              setErrorMsg(null);
            }}
            disabled={!isNew}
            className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-right transition ${
              !isNew
                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 border-slate-200 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            }`}
          />
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
                min={minFutureDate(hotel?.contract_end_date)}
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
            disabled={saving}
            className="px-6 h-11 rounded-xl bg-[#003580] hover:bg-blue-900 text-white font-black text-xs shadow-md shadow-blue-950/20 cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{saving ? "جارٍ الحفظ في قاعدة البيانات..." : "حفظ مكان الإقامة بالدليل ✓"}</span>
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
  onSave: (r: any) => Promise<string | null>;
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
  const [discountPct, setDiscountPct] = useState(restaurant?.discount_percentage ?? 20);
  const [workingHours, setWorkingHours] = useState(restaurant?.working_hours || "11:00 ص – 11:30 م");
  const [description, setDescription] = useState(restaurant?.description || "");
  const [mapsUrl, setMapsUrl] = useState(restaurant?.google_maps_url || "");

  // Local (Libya) date, not UTC
  const todayStr = new Date().toLocaleDateString("en-CA");
  const [contractStartDate] = useState(restaurant?.contract_start_date || todayStr);
  const [contractEndDate, setContractEndDate] = useState(restaurant?.contract_end_date || "");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanId = facilityIdInput.trim();
    if (!cleanId) {
      setErrorMsg("يرجى إدخال رقم البلدية");
      return;
    }

    // Unique Primary Key Check
    const isDup = existingRestaurants.some(
      r => (String(r.facility_id || r.id).trim() === cleanId) && r.id !== restaurant?.id
    );
    if (isDup) {
      setErrorMsg(`رقم البلدية (${cleanId}) مسجل مسبقاً لمنشأة أخرى`);
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
    if (isNewPastDate(contractEndDate, restaurant?.contract_end_date)) {
      setErrorMsg("تاريخ نهاية العقد يجب أن يكون تاريخاً قادماً.");
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

    setSaving(true);
    const saveError = await onSave({
      id: cleanId,
      facility_id: cleanId,
      name: name.trim(),
      category,
      type: restaurant?.type || categoryTypeMap[category] || "مطعم وكافيه",
      city: city.trim(),
      address: address.trim(),
      phone: phone.trim(),
      whatsapp: phone.trim(),
      discount_percentage: Number(discountPct),
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
    setSaving(false);
    if (saveError) setErrorMsg("لم يتم الحفظ في قاعدة البيانات: " + saveError);
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
              يبدأ العقد تلقائياً من يوم التسجيل.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-800 text-white text-[11px] font-black shrink-0">
            خصم {discountPct}% لرواد دلّني
          </span>
        </div>

        {/* Municipal ID (primary key) */}
        <div className="space-y-1.5">
          <label className="text-xs font-black text-slate-800 block">رقم البلدية *</label>
          <input
            type="text"
            value={facilityIdInput}
            onChange={(e) => {
              setFacilityIdInput(e.target.value);
              setErrorMsg(null);
            }}
            disabled={!isNew}
            className={`w-full h-11 px-3.5 rounded-xl border text-xs font-bold text-right transition ${
              !isNew
                ? "bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed"
                : "bg-white text-slate-900 border-slate-200 focus:border-[#003580] focus:ring-2 focus:ring-[#003580]/10"
            }`}
          />
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
                min={minFutureDate(restaurant?.contract_end_date)}
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
            disabled={saving}
            className="px-6 h-11 rounded-xl bg-gradient-sun text-gold-foreground font-black text-xs shadow-md shadow-amber-900/20 cursor-pointer transition disabled:opacity-50 flex items-center gap-1.5"
          >
            <span>{saving ? "جارٍ الحفظ في قاعدة البيانات..." : "حفظ المطعم/المقهى بالدليل ✓"}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

const LANDMARK_REGIONS = [
  "المنطقة الغربية (ساحل البحر المتوسط)",
  "المنطقة الشرقية (الجبل الأخضر والساحل)",
  "المنطقة الجنوبية (الصحراء الكبرى والواحات)",
];

function AttractionModal({
  title,
  attraction,
  existingAttractions,
  onClose,
  onSave,
}: {
  title: string;
  attraction?: Attraction;
  existingAttractions?: Attraction[];
  onClose: () => void;
  onSave: (a: any) => void;
}) {
  const isEditing = !!attraction;
  const [municipalityId, setMunicipalityId] = useState(
    attraction?.place_id || attraction?.municipality_code || attraction?.id || ""
  );
  const [cityName, setCityName] = useState(
    attraction?.city || ""
  );
  const [region, setRegion] = useState(LANDMARK_REGIONS.includes(attraction?.region || "") ? attraction!.region! : "");
  const [category, setCategory] = useState(attraction?.category || "");
  const [desc, setDesc] = useState(attraction?.description || "");
  const [highlights, setHighlights] = useState(
    Array.isArray(attraction?.highlights)
      ? attraction.highlights.join("، ")
      : attraction?.highlights || ""
  );
  // Coordinates & Google Maps
  const [lat, setLat] = useState(attraction?.latitude ? String(attraction.latitude) : "");
  const [lng, setLng] = useState(attraction?.longitude ? String(attraction.longitude) : "");
  const [mapsUrl, setMapsUrl] = useState(attraction?.google_maps_url || "");

  // Main photo (no default image: it must be chosen)
  const [imgMain, setImgMain] = useState(attraction?.place_image || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMunId = String(municipalityId || "").trim();
    if (!cleanMunId) return alert("⚠️ يرجى إدخال رمز المعلم.");
    if (!isEditing && existingAttractions?.some((a) => String(a.place_id || a.id).trim().toLowerCase() === cleanMunId.toLowerCase())) {
      return alert(`⚠️ رمز المعلم (${cleanMunId}) مستخدم لمعلم آخر، يرجى اختيار رمز مختلف.`);
    }
    // Every field is required; nothing is filled with default text, images or coordinates
    const highlightList = highlights.split(/[،,\n]+/).map((h) => h.trim()).filter(Boolean);
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!cityName.trim()) return alert("⚠️ يرجى إدخال اسم المدينة السياحية.");
    if (!region) return alert("⚠️ يرجى اختيار المنطقة الجغرافية.");
    if (!category) return alert("⚠️ يرجى اختيار التصنيف السياحي.");
    if (highlightList.length === 0) return alert("⚠️ يرجى إدخال أبرز المحطات والمعالم في المدينة (محطة واحدة على الأقل).");
    if (desc.trim().length < 20) return alert("⚠️ يرجى كتابة وصف للمعلم لا يقل عن 20 حرفاً.");
    if (!lat.trim() || !lng.trim() || isNaN(latNum) || isNaN(lngNum) || Math.abs(latNum) > 90 || Math.abs(lngNum) > 180) {
      return alert("⚠️ يرجى إدخال خط العرض وخط الطول بأرقام صحيحة.");
    }
    if (!imgMain) return alert("⚠️ يرجى اختيار صورة المعلم السياحي.");

    onSave({
      id: cleanMunId,
      place_id: cleanMunId,
      city: cityName.trim(),
      region,
      category,
      description: desc.trim(),
      highlights: highlightList,
      place_image: imgMain,
      latitude: latNum,
      longitude: lngNum,
    });
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-4xl">
      <form className="space-y-4 text-right max-h-[82vh] overflow-y-auto px-2" onSubmit={handleSubmit}>
        {/* 1. Landmark code */}
        <div>
          <label className="text-xs font-bold mb-1 block text-foreground">رمز المعلم *</label>
          <input
            type="text"
            value={municipalityId}
            onChange={(e) => setMunicipalityId(e.target.value)}
            placeholder="مثال: KHO-001"
            disabled={isEditing}
            className={`w-full h-10 px-3 rounded-xl border text-sm font-bold text-right outline-none transition ${
              isEditing ? "bg-slate-100 text-slate-500 border-slate-300 cursor-not-allowed" : "bg-white border-border focus:border-primary"
            }`}
            required
          />
        </div>

        {/* 2. Tourist city */}
        <div className="space-y-3 pt-1">
          <Field
            label="المدينة السياحية *"
            value={cityName}
            onChange={setCityName}
            placeholder="مثال: الخمس، صبراتة، طرابلس، شحات، غدامس"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold mb-1 block text-foreground">المنطقة الجغرافية *</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
              >
                <option value="">اختر المنطقة</option>
                {LANDMARK_REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block text-foreground">التصنيف السياحي *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
              >
                <option value="">اختر التصنيف</option>
                <option value="آثار تاريخية ورومانية">🏛️ آثار تاريخية ورومانية</option>
                <option value="واحات صحراوية">🏜️ واحات وكثبان صحراوية</option>
                <option value="مدن قديمة وقلاع">🏰 مدن قديمة وتراث عريق</option>
                <option value="طبيعة وجبال">⛰️ طبيعة وجبال وشواطئ</option>
                <option value="متاحف ومعالم حضارية">🏺 متاحف ومعالم حضارية</option>
              </select>
            </div>
          </div>


          <div>
            <label className="text-xs font-bold mb-1 block text-foreground">
              أبرز المحطات والمعالم في المدينة * (افصل بينها بفاصلة)
            </label>
            <input
              type="text"
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              required
              placeholder="مثال: المسرح الروماني الكبير، قوس سيبتيموس سيفيروس، الحمامات الأثرية"
              className="w-full h-10 px-3 rounded-xl border border-border text-xs font-semibold text-right outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="text-xs font-bold mb-1 block text-foreground">
              وصف المعلم * (20 حرفاً على الأقل)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              rows={4}
              placeholder="اكتب وصفاً ثرياً وموثقاً للمعلم السياحي ومميزاته الجغرافية والتاريخية..."
              className="w-full p-3 rounded-xl border border-border text-xs font-semibold text-right outline-none focus:border-primary leading-relaxed"
            />
          </div>
        </div>

        {/* 3. Coordinates & Google Maps */}
        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-foreground block">📍 الإحداثيات الجغرافية *</label>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              ✓ يُولّد رابط الخريطة تلقائياً
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Field
              label="خط العرض (Latitude)"
              value={lat}
              onChange={(val) => {
                setLat(val);
                if (val && lng) setMapsUrl(`https://maps.google.com/?q=${val},${lng}`);
              }}
              placeholder="مثال: 32.6381"
            />
            <Field
              label="خط الطول (Longitude)"
              value={lng}
              onChange={(val) => {
                setLng(val);
                if (lat && val) setMapsUrl(`https://maps.google.com/?q=${lat},${val}`);
              }}
              placeholder="مثال: 14.2936"
            />
          </div>
          <p className="text-[11px] text-slate-500">
            💡 يتم عرض موقع المعلم على الخريطة التفاعلية وتوليد رابط خرائط Google تلقائياً.
          </p>
        </div>

        {/* 4. Photo */}
        <div className="pt-3 border-t border-border space-y-3">
          <label className="text-xs font-black text-foreground block">📸 صورة المعلم السياحي *</label>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <ImageFilePicker label="🌟 الصورة الرئيسية للمعلم السياحي" value={imgMain} onChange={setImgMain} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-end pt-3 border-t border-border sticky bottom-0 bg-white py-2">
          <button
            type="button"
            onClick={onClose}
            className="px-5 h-11 rounded-xl border border-border hover:bg-muted font-black text-xs transition cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="submit"
            className="px-6 h-11 rounded-xl bg-gradient-sea hover:opacity-95 text-white font-black text-xs shadow-glow transition cursor-pointer flex items-center gap-2"
          >
            <span>💾</span>
            <span>{isEditing ? "حفظ التعديلات" : "إضافة المعلم السياحي"}</span>
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============ TOURIST DETAILS MODAL ============ */
function TouristDetailsModal({
  tourist,
  isLoading,
  onClose,
  onToggleStatus,
}: {
  tourist: any;
  isLoading: boolean;
  onClose: () => void;
  onToggleStatus: (touristId: string, currentStatus: string) => void;
}) {
  const isRestricted = tourist.account_status === "مقيّد";
  const dailyBookings = tourist.daily_bookings || [];
  const weeklyBookings = tourist.weekly_bookings || [];
  const reviews = tourist.reviews || [];
  const totalBookings = dailyBookings.length + weeklyBookings.length;

  return (
    <ModalShell title={`ملف السائح: ${tourist.full_name || tourist.tourist_id}`} onClose={onClose} maxWidth="max-w-4xl">
      <div className="space-y-5 text-right max-h-[82vh] overflow-y-auto px-2">
        {/* Tourist Profile Card (Zero Passwords Exposed) */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#003580] text-white flex items-center justify-center text-lg font-black shadow-xs">
                {tourist.full_name ? tourist.full_name[0] : "س"}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">{tourist.full_name}</h3>
                <div className="text-xs text-slate-500 font-bold">
                  سائح مسجل في المنصة
                </div>
              </div>
            </div>
            <span className="font-mono text-xs font-black px-3 py-1 rounded-xl bg-blue-100 text-blue-900 border border-blue-200">
              جواز السفر / ID: {tourist.tourist_id}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold">البريد الإلكتروني</span>
              <span className="font-bold text-slate-800">{tourist.email || "غير مسجل"}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white border border-slate-200">
              <span className="text-slate-400 block text-[10px] font-bold">رقم الهاتف</span>
              <span className="font-mono font-bold text-slate-800" dir="ltr">{tourist.phone_number || "غير مسجل"}</span>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <span>🎟️</span>
              <span>سجل حجوزات الرحلات ({totalBookings})</span>
            </h4>
            <span className="text-xs text-slate-500 font-bold">
              {dailyBookings.length} رحلة يومية · {weeklyBookings.length} رحلة أسبوعية
            </span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-xs font-bold text-slate-500">
              جاري تحميل سجل الحجوزات والتقييمات من قاعدة البيانات...
            </div>
          ) : totalBookings === 0 ? (
            <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs font-bold text-slate-400">
              لا توجد أي حجوزات مسجلة لهذا السائح حتى الآن.
            </div>
          ) : (
            <div className="space-y-3">
              {/* Daily Bookings */}
              {dailyBookings.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-black text-blue-900">الرحلات اليومية:</div>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 border-b border-border text-[11px] text-slate-500">
                        <tr>
                          <th className="p-2.5">رقم الحجز</th>
                          <th className="p-2.5">الرحلة</th>
                          <th className="p-2.5">تاريخ الحجز</th>
                          <th className="p-2.5 text-center">المقاعد</th>
                          <th className="p-2.5 text-center">المبلغ</th>
                          <th className="p-2.5 text-center">حالة السداد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {dailyBookings.map((b: any) => (
                          <tr key={b.booking_daily_id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono font-bold text-blue-800">{b.booking_daily_id}</td>
                            <td className="p-2.5 font-bold text-slate-900">{b.trip_title || b.daily_trip_id}</td>
                            <td className="p-2.5 text-slate-500">
                              {b.booking_date ? new Date(b.booking_date).toLocaleDateString('ar-LY') : "-"}
                            </td>
                            <td className="p-2.5 text-center font-black">{b.number_of_seats} مقاعد</td>
                            <td className="p-2.5 text-center font-black text-emerald-700">{b.total_price} د.ل</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                b.payment_status === "paid" || b.payment_status === "مسدد"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {b.payment_status === "paid" ? "تم السداد" : (b.payment_status || "بانتظار السداد")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Weekly Bookings */}
              {weeklyBookings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-black text-purple-900">الرحلات الأسبوعية:</div>
                  <div className="overflow-x-auto border border-border rounded-xl">
                    <table className="w-full text-xs text-right">
                      <thead className="bg-slate-50 border-b border-border text-[11px] text-slate-500">
                        <tr>
                          <th className="p-2.5">رقم الحجز</th>
                          <th className="p-2.5">الرحلة</th>
                          <th className="p-2.5">تاريخ الحجز</th>
                          <th className="p-2.5 text-center">المقاعد</th>
                          <th className="p-2.5 text-center">المبلغ</th>
                          <th className="p-2.5 text-center">حالة السداد</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {weeklyBookings.map((b: any) => (
                          <tr key={b.booking_weekly_id} className="hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono font-bold text-purple-800">{b.booking_weekly_id}</td>
                            <td className="p-2.5 font-bold text-slate-900">{b.trip_title || b.weekly_trip_id}</td>
                            <td className="p-2.5 text-slate-500">
                              {b.booking_date ? new Date(b.booking_date).toLocaleDateString('ar-LY') : "-"}
                            </td>
                            <td className="p-2.5 text-center font-black">{b.number_of_seats} مقاعد</td>
                            <td className="p-2.5 text-center font-black text-emerald-700">{b.total_price} د.ل</td>
                            <td className="p-2.5 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                b.payment_status === "paid" || b.payment_status === "مسدد"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}>
                                {b.payment_status === "paid" ? "تم السداد" : (b.payment_status || "بانتظار السداد")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tourist Reviews Section */}
        <div className="space-y-3 pt-3 border-t border-border">
          <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <span>⭐</span>
            <span>تقييمات ومراجعات السائح ({reviews.length})</span>
          </h4>
          {reviews.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs font-semibold text-slate-400">
              لم يقم السائح بكتابة أي تقييمات حتى الآن.
            </div>
          ) : (
            <div className="space-y-2">
              {reviews.map((r: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl border border-border bg-white flex items-start justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-slate-900">{r.target_name || "عنصر سياحي"}</span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold">
                        {r.target_type}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-1">{r.comment_text || "لا يوجد تعليق"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-amber-500 font-bold">{"★".repeat(Math.max(1, Math.min(5, Number(r.stars_rating) || 1)))}</span>
                    <span className="text-[10px] text-slate-400">{r.created_at || ""}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-3 border-t border-border sticky bottom-0 bg-white py-2">
          <button
            onClick={onClose}
            className="px-6 h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition cursor-pointer"
          >
            إغلاق الملف
          </button>
        </div>
      </div>
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

  const [ot, setOt] = useState(offer?.offer_title || offer?.title_offer || (selectedTrip ? `عرض خاص: ${selectedTrip.title}` : ""));
  const [desc, setDesc] = useState(offer?.description || (selectedTrip ? `خصم حصري ومميز على رحلة ${selectedTrip.title} المنشأة ضمن برنامج دلّني للسياحة اليومية.` : ""));
  const [disc, setDisc] = useState(String(offer?.percent_discount || 15));
  const [img, setImg] = useState(offer?.offer_image_url || offer?.url_image_offer || selectedTrip?.photo || "");
  const [ds, setDs] = useState(offer?.start_date || offer?.date_start || new Date().toISOString().slice(0, 10));
  const [de, setDe] = useState(offer?.end_date || offer?.date_end || "2026-10-30");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    if (errors.tripId) setErrors(e => ({ ...e, tripId: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!tripId) newErrors.tripId = "يرجى اختيار الرحلة اليومية المستهدفة بالعرض";
    if (!ot.trim()) newErrors.ot = "يرجى إدخال عنوان العرض";
    if (!desc.trim()) newErrors.desc = "يرجى إدخال وصف العرض";
    const discNum = Number(disc);
    if (!disc || isNaN(discNum) || discNum < 1 || discNum > 100) newErrors.disc = "يجب أن تكون نسبة الخصم بين 1 و 100";
    if (!ds) newErrors.ds = "يرجى تحديد تاريخ بداية العرض";
    if (!de) newErrors.de = "يرجى تحديد تاريخ نهاية العرض";
    if (ds && de && de < ds) newErrors.de = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    setErrors(newErrors);
    return Object.values(newErrors).every(v => !v);
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-2xl">
      <form
        className="space-y-3.5 text-right"
        onKeyDown={handleEnterKeyNext}
        onSubmit={(e) => {
          e.preventDefault();
          if (!validate()) return;
          onSave({
            ...(offer ? { id: offer.id, offer_daily_id: offer.offer_daily_id } : {}),
            offer_title: ot.trim(),
            title_offer: ot.trim(),
            description: desc.trim(),
            percent_discount: Number(disc),
            offer_image_url: img,
            url_image_offer: img,
            daily_trip_id: tripId,
            start_date: ds,
            end_date: de,
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
          <label className="text-xs font-bold mb-1 block">اختر الرحلة اليومية المنشأة المستهدفة بالعرض <span className="text-red-500">*</span></label>
          <select
            value={tripId}
            onChange={(e) => handleTripChange(e.target.value)}
            className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right bg-white transition-colors ${
              errors.tripId ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          >
            {dailyTrips.length === 0 && <option value="">لا توجد رحلات يومية منشأة حالياً</option>}
            {dailyTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — وجهة: {t.destination || "ليبيا"} — انطلاق: {t.departure_city || "طرابلس"} ({t.price_per_seat} د.ل)
              </option>
            ))}
          </select>
          {errors.tripId && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.tripId}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">عنوان العرض الترويجي <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={ot}
            onChange={e => { setOt(e.target.value); if (errors.ot) setErrors(ex => ({ ...ex, ot: "" })); }}
            placeholder="مثال: عرض خاص على رحلة لبدة الكبرى"
            className={`w-full h-11 px-3 rounded-xl border text-xs font-semibold text-right transition-colors ${
              errors.ot ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.ot && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.ot}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">وصف وتفاصيل العرض <span className="text-red-500">*</span></label>
          <textarea
            value={desc}
            onChange={e => { setDesc(e.target.value); if (errors.desc) setErrors(ex => ({ ...ex, desc: "" })); }}
            rows={2}
            placeholder="وصف تفصيلي للعرض والخصم المقدم..."
            className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-right transition-colors ${
              errors.desc ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.desc && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.desc}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold mb-1 block">نسبة الخصم % (1-100) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1" max="100"
              value={disc}
              onChange={e => { setDisc(e.target.value); if (errors.disc) setErrors(ex => ({ ...ex, disc: "" })); }}
              className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right transition-colors ${
                errors.disc ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.disc && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.disc}</p>}
          </div>
          <div className="pt-5 text-xs text-slate-500 font-bold">
            {selectedTrip && (
              <span className="text-emerald-700 font-black">
                السعر بعد الخصم: {Math.round(selectedTrip.price_per_seat * (1 - (Number(disc) || 0) / 100))} د.ل (بدلاً من {selectedTrip.price_per_seat} د.ل)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold mb-1 block">تاريخ بداية العرض <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={ds}
              onChange={e => { setDs(e.target.value); if (errors.ds) setErrors(ex => ({ ...ex, ds: "" })); }}
              className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right transition-colors ${
                errors.ds ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.ds && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.ds}</p>}
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block">تاريخ نهاية العرض <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={de}
              onChange={e => { setDe(e.target.value); if (errors.de) setErrors(ex => ({ ...ex, de: "" })); }}
              className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right transition-colors ${
                errors.de ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.de && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.de}</p>}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة وبوستر العرض اليومي" value={img} onChange={setImg} />
        </div>

        {/* Validation summary */}
        {Object.values(errors).some(v => v) && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 font-bold">
            ⚠️ يرجى استكمال جميع الحقول المطلوبة المشار إليها ب☆ قبل حفظ العرض.
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            إلغاء
          </button>
          <button type="submit" className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">
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
  const [desc, setDesc] = useState(offer?.description || (selectedTrip ? `خصم مميز وحصري على رحلة ${selectedTrip.title} المنشأة في دلّني شاملة المبيت والجولات.` : ""));
  const [disc, setDisc] = useState(String(offer?.percent_discount || offer?.discount_percentage || 15));
  const [img, setImg] = useState(offer?.offer_image_url || selectedTrip?.photo || "");
  const [ds, setDs] = useState(offer?.start_date || offer?.date_start || new Date().toISOString().slice(0, 10));
  const [de, setDe] = useState(offer?.end_date || offer?.date_end || "2026-10-30");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTripChange = (newTripId: string) => {
    setTripId(newTripId);
    const trip = weeklyTrips.find(t => t.id === newTripId);
    if (trip) {
      if (!ot || ot.startsWith("عرض الأسبوع:")) {
        setOt(`عرض الأسبوع: ${trip.title}`);
      }
      if (!desc || desc.includes("شاملة المبيت")) {
        setDesc(`خصم مميز وحصري على رحلة ${trip.title} المنشأة في دلّني شاملة المبيت والجولات.`);
      }
      if (!img || img === "/assets/hero-leptis.jpg") {
        setImg(trip.photo || "/assets/dest-ubari-gaberoun.jpg");
      }
    }
    if (errors.tripId) setErrors(e => ({ ...e, tripId: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!tripId) newErrors.tripId = "يرجى اختيار الرحلة الأسبوعية المستهدفة بالعرض";
    if (!ot.trim()) newErrors.ot = "يرجى إدخال عنوان العرض";
    if (!desc.trim()) newErrors.desc = "يرجى إدخال وصف العرض";
    const discNum = Number(disc);
    if (!disc || isNaN(discNum) || discNum < 1 || discNum > 100) newErrors.disc = "يجب أن تكون نسبة الخصم بين 1 و 100";
    if (!ds) newErrors.ds = "يرجى تحديد تاريخ بداية العرض";
    if (!de) newErrors.de = "يرجى تحديد تاريخ نهاية العرض";
    if (ds && de && de < ds) newErrors.de = "تاريخ النهاية يجب أن يكون بعد تاريخ البداية";
    setErrors(newErrors);
    return Object.values(newErrors).every(v => !v);
  };

  return (
    <ModalShell title={title} onClose={onClose} maxWidth="max-w-2xl">
      <form
        className="space-y-3.5 text-right"
        onKeyDown={handleEnterKeyNext}
        onSubmit={(e) => {
          e.preventDefault();
          if (!validate()) return;
          onSave({
            ...(offer ? { id: offer.id, offer_weekly_id: offer.offer_weekly_id } : {}),
            offer_title: ot.trim(),
            description: desc.trim(),
            discount_percentage: Number(disc),
            percent_discount: Number(disc),
            offer_image_url: img,
            weekly_trip_id: tripId,
            start_date: ds,
            end_date: de,
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
          <label className="text-xs font-bold mb-1 block">اختر الرحلة الأسبوعية المنشأة المستهدفة بالعرض <span className="text-red-500">*</span></label>
          <select
            value={tripId}
            onChange={(e) => handleTripChange(e.target.value)}
            className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right bg-white transition-colors ${
              errors.tripId ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          >
            {weeklyTrips.length === 0 && <option value="">لا توجد رحلات أسبوعية منشأة حالياً</option>}
            {weeklyTrips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} — وجهات: {t.destination || (t.destinations ? t.destinations.join(" + ") : "ليبيا")} — ({t.seat_per_price} د.ل)
              </option>
            ))}
          </select>
          {errors.tripId && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.tripId}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">عنوان العرض الأسبوعي <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={ot}
            onChange={e => { setOt(e.target.value); if (errors.ot) setErrors(ex => ({ ...ex, ot: "" })); }}
            placeholder="مثال: عرض الأسبوع على رحلة غدامس التراثية"
            className={`w-full h-11 px-3 rounded-xl border text-xs font-semibold text-right transition-colors ${
              errors.ot ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.ot && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.ot}</p>}
        </div>

        <div>
          <label className="text-xs font-bold mb-1 block">وصف وتفاصيل العرض <span className="text-red-500">*</span></label>
          <textarea
            value={desc}
            onChange={e => { setDesc(e.target.value); if (errors.desc) setErrors(ex => ({ ...ex, desc: "" })); }}
            rows={2}
            placeholder="وصف تفصيلي للعرض والخصم المقدم وما يشمله..."
            className={`w-full p-2.5 rounded-xl border text-xs font-semibold text-right transition-colors ${
              errors.desc ? "border-red-400 bg-red-50" : "border-slate-300"
            }`}
          />
          {errors.desc && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.desc}</p>}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold mb-1 block">نسبة الخصم % (1-100) <span className="text-red-500">*</span></label>
            <input
              type="number"
              min="1" max="100"
              value={disc}
              onChange={e => { setDisc(e.target.value); if (errors.disc) setErrors(ex => ({ ...ex, disc: "" })); }}
              className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right transition-colors ${
                errors.disc ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.disc && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.disc}</p>}
          </div>
          <div className="pt-5 text-xs text-slate-500 font-bold">
            {selectedTrip && (
              <span className="text-amber-800 font-black">
                السعر بعد الخصم: {Math.round(selectedTrip.seat_per_price * (1 - (Number(disc) || 0) / 100))} د.ل (بدلاً من {selectedTrip.seat_per_price} د.ل)
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold mb-1 block">تاريخ بداية العرض <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={ds}
              onChange={e => { setDs(e.target.value); if (errors.ds) setErrors(ex => ({ ...ex, ds: "" })); }}
              className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right transition-colors ${
                errors.ds ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.ds && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.ds}</p>}
          </div>
          <div>
            <label className="text-xs font-bold mb-1 block">تاريخ نهاية العرض <span className="text-red-500">*</span></label>
            <input
              type="date"
              value={de}
              onChange={e => { setDe(e.target.value); if (errors.de) setErrors(ex => ({ ...ex, de: "" })); }}
              className={`w-full h-11 px-3 rounded-xl border text-xs font-bold text-right transition-colors ${
                errors.de ? "border-red-400 bg-red-50" : "border-slate-300"
              }`}
            />
            {errors.de && <p className="text-red-500 text-[10px] font-bold mt-1">{errors.de}</p>}
          </div>
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة وبوستر العرض الأسبوعي" value={img} onChange={setImg} />
        </div>

        {/* Validation summary */}
        {Object.values(errors).some(v => v) && (
          <div className="p-3 bg-red-50 rounded-xl border border-red-200 text-xs text-red-700 font-bold">
            ⚠️ يرجى استكمال جميع الحقول المطلوبة المشار إليها ب☆ قبل حفظ العرض.
          </div>
        )}

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">
            إلغاء
          </button>
          <button type="submit" className="px-5 h-10 rounded-xl bg-gradient-sun text-gold-foreground font-black text-xs shadow-glow">
            حفظ العرض الأسبوعي
          </button>
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
      const dataUrl = e.target?.result as string;
      if (!dataUrl) return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1200;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL("image/jpeg", 0.82);
          updateSlot(idx, compressed);
          return;
        }
        updateSlot(idx, dataUrl);
      };
      img.onerror = () => updateSlot(idx, dataUrl);
      img.src = dataUrl;
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
    "صورة 1 (⭐ صورة الغلاف الرئيسية البارزة)",
    "صورة 2 (المعالم الرئيسية للرحلة)",
    "صورة 3 (الطبيعة والاستكشاف)",
    "صورة 4 (الضيافة والاستراحة)",
    "صورة 5 (التفاصيل والأنشطة التراثية)",
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto">
      <div className={`w-full ${maxWidth} bg-white rounded-3xl shadow-glow overflow-hidden my-6`}>
        <div className="p-4 bg-gradient-sea text-white flex justify-between items-center">
          <h3 className="text-base font-black">{title}</h3>
          <button type="button" onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-xs transition">✕</button>
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

// Expiry dates (contract end, licence) must be in the future when entered or changed; an unchanged stored date stays allowed
const tomorrowIso = () => new Date(Date.now() + 86400000).toLocaleDateString("en-CA");
function minFutureDate(original?: string | null): string {
  const stored = original ? String(original).slice(0, 10) : "";
  return stored && stored < tomorrowIso() ? stored : tomorrowIso();
}
function isNewPastDate(value: string, original?: string | null): boolean {
  return !!value && value !== (original ? String(original).slice(0, 10) : "") && value < tomorrowIso();
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  onKeyDown,
  placeholder,
  required,
  min,
  max,
  step,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
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
        min={min}
        max={max}
        step={step}
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
      />
    </div>
  );
}
