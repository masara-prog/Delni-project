import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import heroImg from "@/assets/hero-leptis.jpg";
import destLeptisTheater from "@/assets/dest-leptis-theater.jpg";
import destLeptisArch from "@/assets/dest-leptis-arch.jpg";
import destLeptisForum from "@/assets/dest-leptis-forum.jpg";
import destLeptisCoast from "@/assets/dest-leptis-coast.jpg";

import destSabratah from "@/assets/dest-sabratha.jpg";
import destSabrathaTheater from "@/assets/dest-sabratha-theater.jpg";
import destSabrathaCoast from "@/assets/dest-sabratha-coast.jpg";
import destSabrathaTemple from "@/assets/dest-sabratha-temple.jpg";
import destSabrathaRuins from "@/assets/dest-sabratha-ruins.jpg";

import destTripoli from "@/assets/dest-tripoli.jpg";
import destTripoliArch from "@/assets/dest-tripoli-arch.jpg";
import destTripoliCastle from "@/assets/dest-tripoli-castle.jpg";
import destTripoliHarbor from "@/assets/dest-tripoli-harbor.jpg";
import destTripoliMedina from "@/assets/dest-tripoli-medina.jpg";
import destTripoliOldCity from "@/assets/dest-tripoli-old-city.jpg";
import destHarborCoast from "@/assets/dest-harbor-coast.jpg";

import destCyrene from "@/assets/dest-cyrene.jpg";
import destCyreneApollo from "@/assets/dest-cyrene-apollo.jpg";
import destCyreneSanctuary from "@/assets/dest-cyrene-sanctuary.jpg";
import destCyrenePanorama from "@/assets/dest-cyrene-panorama.jpg";

import destGhadames from "@/assets/dest-ghadames.jpg";
import destGhadamesAlleys from "@/assets/dest-ghadames-alleys.jpg";
import destGhadamesOasis from "@/assets/dest-ghadames-oasis.jpg";

import destGharyanCave from "@/assets/dest-gharyan-cave.jpg";
import destGharyanCourtyard from "@/assets/dest-gharyan-courtyard.jpg";
import destKsarDesert from "@/assets/dest-ksar-desert.jpg";
import destKsarNalut from "@/assets/dest-ksar-nalut.jpg";
import destNafusaFortress from "@/assets/dest-nafusa-fortress.jpg";

import destJabalAkhdarPanorama from "@/assets/dest-jabal-akhdar-panorama.jpg";
import destJabalAkhdarForest from "@/assets/dest-jabal-akhdar-forest.jpg";
import destJabalAkhdarBridge from "@/assets/dest-jabal-akhdar-bridge.jpg";
import destJabalAkhdarValley from "@/assets/dest-jabal-akhdar-valley.jpg";
import destJabalAkhdarPass from "@/assets/dest-jabal-akhdar-pass.jpg";

import destUbari from "@/assets/dest-ubari.jpg";
import destUbariGaberoun from "@/assets/dest-ubari-gaberoun.jpg";
import destUbariUmmAlMaa from "@/assets/dest-ubari-ummalmaa.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destAcacusArch from "@/assets/dest-acacus-arch.jpg";
import destSaharaDunes from "@/assets/dest-sahara-dunes.jpg";

import offerDesert from "@/assets/offer-desert.jpg";
import privateTripImg from "@/assets/private-trip.jpg";
import videoPromoDallani from "@/assets/video-promo-dallani.mp4";
import {
  BookingModal,
  DetailsModal,
  useModalPair,
  TripScheduleModal,
  PrivateTripModal,
  DetailsItem,
} from "@/components/Modals";
import { Header } from "@/components/Header";
import { TRIP_VIDEO_DATABASE, TripVideoTrailerModal } from "@/components/TripVideoShowcase";
import { useLanguage } from "@/lib/i18n";
import { GuideCVModal, GuideCVData } from "@/components/GuideCVModal";
import { VehicleDetailsModal, type VehicleDetailsData } from "@/components/VehicleDetailsModal";
import { LandmarkDetailsModal, placeToLandmark } from "@/components/LandmarkDetailsModal";
import type { CityDestinationItem } from "@/lib/attractionsData";
import { Footer } from "@/components/Footer";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { 
  apiGetDailyTrips, 
  apiGetWeeklyTrips, 
  apiGetHotels, 
  apiGetRestaurants, 
  apiGetDailyOffers, 
  apiGetWeeklyOffers,
  apiGetPlaces,
} from "@/lib/api";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, Flag, MapPin, Users, UtensilsCrossed, type LucideIcon } from "lucide-react";
import { FavoriteButton } from "@/components/FavoriteButton";
import { FloatingNearbyPromo } from "@/components/FloatingNearbyPromo";
import { fetchTripReviews, type TripReview } from "@/lib/reviews";

export const Route = createFileRoute("/trips")({
  head: () => ({
    meta: [
      { title: "الرحلات السياحية في ليبيا | منصة دلّني" },
      {
        name: "description",
        content:
          "رحلات يومية وأسبوعية وخاصة داخل ليبيا: طرابلس، بحيرات أوباري، غدامس، لبدة، وأكاكوس مع المرشدين والمركبات وأماكن الإقامة.",
      },
    ],
  }),
  component: TripsPage,
});

export type TouristAttraction = {
  name: string;
  location: string;
  description: string;
  placeId?: string;
  image?: string;
  category?: string;
};

/* The landmarks a trip visits, exactly as linked to it in the database (places_trip_daily / places_trip_weekly) */
function tripAttractionsFromRow(t: any): TouristAttraction[] {
  return (Array.isArray(t.places) ? t.places : []).map((p: any) => ({
    name: p.place_name || p.city || "",
    location: p.city || "",
    description: "",
    placeId: p.place_id,
    image: p.place_image || undefined,
    category: p.category || undefined,
  }));
}

/* Guide and vehicle of a trip, built only from the columns the trips API returns (no invented values) */
function tripGuideFromRow(t: any) {
  if (!t.guide_name) return undefined;
  const languages = ["العربية", t.guide_speaks_english && "الإنجليزية", t.guide_speaks_french && "الفرنسية", t.guide_speaks_italian && "الإيطالية"]
    .filter(Boolean) as string[];
  const avatar = t.guide_avatar || undefined;
  return {
    name: t.guide_name,
    title: "مرشد سياحي معتمد",
    phone: t.guide_phone || "",
    avatar,
    cv: {
      name: t.guide_name,
      title: "مرشد سياحي معتمد",
      licenseNumber: t.guide_license_number || "",
      avatar,
      experienceYears: t.guide_years ? Number(t.guide_years) : undefined,
      pricePerDay: t.guide_price_per_day ? Number(t.guide_price_per_day) : undefined,
      phone: t.guide_phone || "",
      bio: t.guide_bio || undefined,
      languages,
    } as GuideCVData,
  };
}

function tripVehicleFromRow(t: any) {
  if (!t.vehicle_plate && !t.vehicle_model) return undefined;
  return {
    model: t.vehicle_model || "",
    company: t.transport_company_name || "",
    driver: t.driver_name || "",
    plateNumber: t.vehicle_plate || undefined,
    driverPhone: t.driver_phone || undefined,
    capacity: t.vehicle_capacity ? Number(t.vehicle_capacity) : undefined,
    image: t.vehicle_image || undefined,
    category: t.vehicle_category || undefined,
    dailyRate: t.vehicle_daily_rate ? Number(t.vehicle_daily_rate) : undefined,
    status: t.vehicle_status || undefined,
    companyPhone: t.transport_company_phone || undefined,
  };
}

export type DailyTrip = {
  id: string;
  type: "daily";
  title: string;
  img: string;
  images?: string[];
  gallery?: string;
  description: string;
  activities: string[];
  attractions: TouristAttraction[];
  targetPersons: number;
  availableSeats: number;
  daysOfWeek: string;
  openDates?: string[]; // bookable run dates of this month
  departure: "طرابلس" | "بنغازي";
  entertainment?: string;
  // The trip's current or next promotional offer (applies to run dates inside its period)
  activeOffer?: { title: string; discount: number; start_date: string; end_date: string };
  guide?: {
    name: string;
    title: string;
    phone: string;
    avatar?: string;
    cv?: GuideCVData;
  };
  vehicle?: {
    model: string;
    company: string;
    driver: string;
    plateNumber?: string;
    driverPhone?: string;
    capacity?: number;
    year?: number;
    image?: string;
    category?: string;
    dailyRate?: number;
    status?: string;
    companyPhone?: string;
  };
  restaurant?: {
    id?: string;
    name: string;
    type?: string;
    city?: string;
    address?: string;
    phone?: string;
    image?: string;
  };
  itinerary_steps?: Array<{ time: string; title: string; desc: string }>;
  accommodation?: string;
  price: number;
  rating: number;
  reviews: number;
};

export type WeeklyTrip = {
  id: string;
  type: "weekly";
  title: string;
  img: string;
  images?: string[];
  gallery?: string;
  description: string;
  startDate: string;
  endDate: string;
  targetPersons: number;
  availableSeats: number;
  seatPrice: number;
  cities: string[];
  attractions: TouristAttraction[];
  hotels: string[];
  departure: "طرابلس" | "بنغازي";
  entertainment?: string;
  // The trip's current or next promotional offer (applies to run dates inside its period)
  activeOffer?: { title: string; discount: number; start_date: string; end_date: string };
  guide?: {
    name: string;
    title: string;
    phone: string;
    avatar?: string;
    cv?: GuideCVData;
  };
  vehicle?: {
    model: string;
    company: string;
    driver: string;
    plateNumber?: string;
    driverPhone?: string;
    capacity?: number;
    year?: number;
    image?: string;
    category?: string;
    dailyRate?: number;
    status?: string;
    companyPhone?: string;
  };
  restaurant?: {
    id?: string;
    name: string;
    type?: string;
    city?: string;
    address?: string;
    phone?: string;
    image?: string;
  };
  itinerary_steps?: Array<{ time: string; title: string; desc: string }>;
  rating: number;
  reviews: number;
};

export type PrivateTemplate = {
  id: string;
  type: "private";
  title: string;
  img: string;
  images?: string[];
  gallery?: string;
  description: string;
  sampleDays: string;
  note: string;
};

export type Trip = DailyTrip | WeeklyTrip | PrivateTemplate;

export function safeParseGallery(gallery: any): string[] {
  if (!gallery) return [];
  if (Array.isArray(gallery)) {
    return gallery.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof gallery !== "string") return [];
  const str = gallery.trim();
  if (!str) return [];

  if (str.startsWith("[") && str.endsWith("]")) {
    try {
      const p = JSON.parse(str);
      if (Array.isArray(p)) return p.map((s) => String(s).trim()).filter(Boolean);
    } catch {}
  }
  if (str.includes("|||")) {
    return str.split("|||").map((s) => s.trim()).filter(Boolean);
  }
  if (str.includes("data:image")) {
    const images: string[] = [];
    const parts = str.split(/,(?=(?:data:image|\/assets|\/|https?:\/\/))/);
    for (let i = 0; i < parts.length; i++) {
      let p = parts[i].trim();
      if (p.startsWith("data:image") && p.includes(";base64") && !p.includes(";base64,") && parts[i + 1]) {
        p = p + "," + parts[i + 1].trim();
        i++;
      }
      if (p && (p.startsWith("data:image") || p.startsWith("/assets") || p.startsWith("/") || p.startsWith("http"))) {
        images.push(p);
      }
    }
    if (images.length > 0) return images;
  }
  return str.split(",").map((s) => s.trim()).filter(Boolean);
}

export function getTripImages(t: Trip | any): string[] {
  if (!t) return [heroImg];

  const validImgs: string[] = [];

  const isValidUrl = (url: any) =>
    url && typeof url === "string" && url.trim().length > 10 &&
    (url.startsWith("data:image") || url.startsWith("/assets") || url.startsWith("/") || url.startsWith("http"));

  // 1. Check primary photo / img
  if (isValidUrl(t.photo) && !validImgs.includes(t.photo.trim())) {
    validImgs.push(t.photo.trim());
  }
  if (isValidUrl(t.img) && !validImgs.includes(t.img.trim())) {
    validImgs.push(t.img.trim());
  }

  // 2. Check images array
  if (Array.isArray(t.images)) {
    t.images.forEach((img: any) => {
      if (isValidUrl(img) && !validImgs.includes(img.trim())) {
        validImgs.push(img.trim());
      }
    });
  }

  // 3. Check gallery string or array
  if (t.gallery) {
    const list = safeParseGallery(t.gallery);
    list.forEach((img: string) => {
      if (isValidUrl(img) && !validImgs.includes(img)) {
        validImgs.push(img);
      }
    });
  }

  // If valid images were added to the trip, return them directly
  if (validImgs.length > 0) {
    return validImgs;
  }

  // Curated Libyan fallback presets
  const PRESETS: Record<string, string[]> = {
    d1: [heroImg, destLeptisTheater, destLeptisArch, destLeptisForum, destLeptisCoast],
    d2: [destTripoli, destTripoliCastle, destTripoliArch, destTripoliMedina, destTripoliHarbor],
    d3: [destCyreneApollo, destCyrene, destCyreneSanctuary, destCyrenePanorama, destJabalAkhdarValley],
    d4: [destSabratah, destSabrathaTheater, destSabrathaCoast, destSabrathaTemple, destSabrathaRuins],
    d5: [destGharyanCave, destGharyanCourtyard, destKsarDesert, destKsarNalut, destNafusaFortress],
    d6: [destJabalAkhdarPanorama, destJabalAkhdarBridge, destJabalAkhdarForest, destJabalAkhdarValley, destJabalAkhdarPass],
    w1: [destUbariGaberoun, destUbari, destUbariUmmAlMaa, destAcacusArch, destSaharaDunes],
    w2: [destGhadamesOasis, destGhadames, destGhadamesAlleys, destKsarDesert, offerDesert],
    p1: [destAcacusArch, destAcacus, destUbariGaberoun, destUbariUmmAlMaa, destSaharaDunes],
    p2: [heroImg, destLeptisTheater, destSabratah, destSabrathaTheater, destTripoliCastle],
  };

  if (t?.id && PRESETS[t.id]) return PRESETS[t.id];

  const title = String(t?.title || t?.trip_title || "").toLowerCase();
  if (title.includes("لبدة") || title.includes("رومان") || title.includes("الخمس")) return [heroImg, destLeptisTheater, destLeptisArch];
  if (title.includes("صبراتة")) return [destSabratah, destSabrathaTheater, destSabrathaCoast];
  if (title.includes("أوباري") || title.includes("صحراء") || title.includes("رمال")) return [destUbariGaberoun, destUbari, destUbariUmmAlMaa];
  if (title.includes("غدامس")) return [destGhadamesOasis, destGhadames, destGhadamesAlleys];
  if (title.includes("شحات") || title.includes("قورينا") || title.includes("أخضر")) return [destCyreneApollo, destCyrene, destCyreneSanctuary];
  if (title.includes("طرابلس")) return [destTripoli, destTripoliCastle, destTripoliArch];

  return [t?.img || heroImg];
}

export type TripOffer = {
  id: string;
  title: string;
  sub: string;
  oldPrice: string;
  price: string;
  tag: string;
  discountPercent: string;
  img: string;
  gallery: string[];
  kind: "daily" | "weekly";
  departure: string;
  perk: string;
  schedules?: any[];
};

const tripOffers: TripOffer[] = [];

export type NearbyPlace = {
  id: string;
  name: string;
  category: "hotel" | "apartment" | "resort" | "heritage" | "restaurant" | "cafe";
  city: "طرابلس" | "بنغازي" | "الخمس" | "شحات" | "غدامس" | "أوباري" | "صبراتة";
  area: string;
  img: string;
  rating: number;
  phone: string;
  priceNote: string;
  perk: string;
};

const nearbyPlaces: NearbyPlace[] = [];

// Live trips loaded dynamically from DelniDB SQL Server (static mock trips removed)
const dailyTrips: DailyTrip[] = [];
const weeklyTrips: WeeklyTrip[] = [];

// Private trip templates removed from public catalog per strict separation requirements
const privateTemplates: PrivateTemplate[] = [];

export function getTripFullInfo(t: Trip, isAr: boolean) {
  const isPrivate = t.type === "private";
  const isTripoli = !("departure" in t) || t.departure === "طرابلس";
  const departurePoint = ("departurePoint" in t && (t as any).departurePoint)
    ? (t as any).departurePoint
    : isTripoli
    ? (isAr ? "موقعنا في طرابلس - النوفليين" : "Our Tripoli Location - Al-Nawfaliyin")
    : (isAr ? "موقعنا في بنغازي - شارع فينيسيا" : "Our Benghazi Location - Venice Street");

  const totalSeats = "targetPersons" in t ? t.targetPersons : 20;
  const availableSeats = "availableSeats" in t ? t.availableSeats : 8;
  const bookedSeats = Math.max(0, totalSeats - availableSeats);
  const percentBooked = Math.min(100, Math.round((bookedSeats / totalSeats) * 100));

  const realisticOverview = ("realisticOverview" in t && (t as any).realisticOverview) || t.description || "";

  // Daily Tours STRICTLY 09:00 AM to 09:00 PM (12 hours) as explicitly demanded by user
  let customSteps: any[] | null = null;
  if ((t as any).itinerary_steps) {
    try {
      const parsed = typeof (t as any).itinerary_steps === "string" ? JSON.parse((t as any).itinerary_steps) : (t as any).itinerary_steps;
      if (Array.isArray(parsed) && parsed.length > 0) {
        customSteps = parsed;
      }
    } catch {}
  }

  const restaurantData = (t as any).restaurant || null;
  const restaurantName = restaurantData?.name || null;

  const itinerary = customSteps || [];

  const vehicle = "vehicle" in t && t.vehicle ? {
    ...t.vehicle,
    capacity: t.vehicle.capacity || totalSeats,
  } : null;

  const guide = "guide" in t && t.guide ? t.guide : null;

  const priceFormatted = t.type === "daily" ? `${t.price} د.ل` : t.type === "weekly" ? `${t.seatPrice} د.ل` : t.sampleDays;
  // Running offer: a weekly trip is discounted when it starts inside the offer period;
  // a daily trip on its run dates inside the period (the booking window prices each date)
  const offer = "activeOffer" in t ? t.activeOffer : undefined;
  const basePrice = t.type === "daily" ? Number(t.price) : t.type === "weekly" ? Number(t.seatPrice) : 0;
  const offerApplies = !!offer && (t.type === "daily" || (t.type === "weekly" && !!t.startDate
    && t.startDate.slice(0, 10) >= offer.start_date && t.startDate.slice(0, 10) <= offer.end_date));
  const offerPrice = offerApplies && basePrice ? Math.round(basePrice * (1 - offer!.discount / 100)) : null;

  return {
    departurePoint,
    totalSeats,
    availableSeats,
    bookedSeats,
    percentBooked,
    realisticOverview,
    itinerary,
    vehicle,
    guide,
    restaurant: restaurantData,
    priceFormatted,
    basePrice,
    offerPrice,
    offerDiscount: offerApplies ? offer!.discount : 0,
    isPrivate,
  };
}

function TripDetailsView({
  trip,
  onBack,
  onBook,
  onOpenGuideCV,
  onOpenVehicleDetails,
}: {
  trip: Trip;
  onBack: () => void;
  onBook: () => void;
  onOpenGuideCV?: (cv: GuideCVData) => void;
  onOpenVehicleDetails?: (v: VehicleDetailsData) => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const info = getTripFullInfo(trip, isAr);
  // Stations start folded: two are shown, the rest on demand
  const [showAllStops, setShowAllStops] = useState(false);

  // A landmark of the trip opens the same details window as the landmarks page
  const [platformPlaces, setPlatformPlaces] = useState<any[]>([]);
  const [openedLandmark, setOpenedLandmark] = useState<CityDestinationItem | null>(null);
  const [privateTripDest, setPrivateTripDest] = useState<string | null>(null);
  useEffect(() => {
    apiGetPlaces().then(setPlatformPlaces);
  }, []);
  const openLandmark = (a: TouristAttraction) => {
    const index = platformPlaces.findIndex((x) => x.place_id === a.placeId);
    const row = index >= 0 ? platformPlaces[index] : { place_id: a.placeId, place_name: a.name, city: a.location, category: a.category, place_image: a.image };
    setOpenedLandmark(placeToLandmark(row, Math.max(index, 0)));
  };

  // Auto-playing authentic video for this trip
  const videoData = TRIP_VIDEO_DATABASE[trip.id];
  const videoSource = videoData?.videoUrl || videoPromoDallani;

  // City-specific animated images for this trip - strictly authentic to each destination
  const CITY_IMAGES: Record<string, string[]> = {
    d1: [
      destLeptisTheater,
      destLeptisArch,
      destLeptisForum,
      destLeptisCoast,
    ],
    d2: [
      destTripoliCastle,
      destTripoliArch,
      destTripoliMedina,
      destTripoliHarbor,
    ],
    d3: [
      destCyreneApollo,
      destCyreneSanctuary,
      destCyrenePanorama,
      destJabalAkhdarValley,
    ],
    d4: [
      destSabrathaTheater,
      destSabrathaCoast,
      destSabrathaTemple,
      destSabrathaRuins,
    ],
    d5: [
      destGharyanCave,
      destGharyanCourtyard,
      destKsarNalut,
      destNafusaFortress,
    ],
    d6: [
      destJabalAkhdarBridge,
      destJabalAkhdarForest,
      destJabalAkhdarValley,
      destJabalAkhdarPass,
      destJabalAkhdarPanorama,
    ],
    w1: [
      destUbariGaberoun,
      destUbariUmmAlMaa,
      destAcacusArch,
      destSaharaDunes,
    ],
    w2: [
      destGhadamesAlleys,
      destGhadamesOasis,
      destGhadames,
      destGhadamesAlleys,
    ],
    p1: [
      destAcacusArch,
      destUbariGaberoun,
      destUbariUmmAlMaa,
      destSaharaDunes,
    ],
    p2: [
      destLeptisTheater,
      destSabrathaTheater,
      destTripoliCastle,
      destGharyanCave,
    ],
  };

  const KB_CLASSES = [
    "animate-ken-burns-a",
    "animate-ken-burns-b",
    "animate-ken-burns-c",
    "animate-ken-burns-d",
  ] as const;

  const cityImages = useMemo(() => getTripImages(trip), [trip]);

  // Dynamic platform hotels and restaurants filtered by visited landmarks
  const [platformHotels, setPlatformHotels] = useState<any[]>([]);
  const [platformRestaurants, setPlatformRestaurants] = useState<any[]>([]);

  useEffect(() => {
    apiGetHotels().then((list) => {
      if (Array.isArray(list)) setPlatformHotels(list);
    });
    apiGetRestaurants().then((list) => {
      if (Array.isArray(list)) setPlatformRestaurants(list);
    });
  }, []);

  const destinationKeywords = useMemo(() => {
    const list: string[] = [];
    if (trip.title) list.push(trip.title);
    if ((trip as any).destination) list.push((trip as any).destination);
    if ((trip as any).destination_city) list.push((trip as any).destination_city);
    if (Array.isArray((trip as any).cities)) list.push(...(trip as any).cities);
    if (Array.isArray((trip as any).destinations)) list.push(...(trip as any).destinations);
    if (Array.isArray((trip as any).attractions)) {
      (trip as any).attractions.forEach((a: any) => {
        if (a.name) list.push(a.name);
        if (a.location) list.push(a.location);
      });
    }
    return list.map((s) => String(s).toLowerCase().trim()).filter(Boolean);
  }, [trip]);

  // Hotels belong to weekly trips only, and only those chosen when the trip was created
  const filteredHotels = useMemo(() => {
    if (trip.type !== "weekly" || platformHotels.length === 0) return [];
    const ids: string[] = (trip as any).hotel_ids || [];
    return platformHotels.filter((h) => ids.includes(h.hotel_id));
  }, [platformHotels, trip]);

  const { includedRestaurants, promoRestaurants } = useMemo(() => {
    if (platformRestaurants.length === 0) return { includedRestaurants: [], promoRestaurants: [] };

    const tripRestIds = (trip as any).restaurant_ids || [];
    const tripSingleRestId = (trip as any).restaurant_id;

    const assigned = platformRestaurants.filter(
      (r) =>
        tripRestIds.includes(r.id || r.facility_id) ||
        tripSingleRestId === (r.id || r.facility_id) ||
        tripRestIds.includes(String(r.id || r.facility_id))
    );

    const promo = platformRestaurants.filter((r) => {
      const isAssigned = assigned.some((a) => (a.id || a.facility_id) === (r.id || r.facility_id));
      if (isAssigned) return false;
      const rCity = String(r.city || r.address || r.name || "").toLowerCase();
      return destinationKeywords.some((kw) => kw.includes(rCity) || rCity.includes(kw));
    }).slice(0, 4);

    return { includedRestaurants: assigned, promoRestaurants: promo };
  }, [platformRestaurants, destinationKeywords, trip]);

  const [dismissedPromoIds, setDismissedPromoIds] = useState<string[]>([]);

  // Verified Trip Reviews loaded from DelniDB / Laravel
  const [reviews, setReviews] = useState<TripReview[]>([]);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setIsLoadingReviews(true);
    fetchTripReviews(trip.id, trip.type === "weekly" ? "weekly" : "daily")
      .then((data) => {
        if (isMounted) setReviews(data);
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoadingReviews(false);
      });
    return () => {
      isMounted = false;
    };
  }, [trip.id, trip.type]);

  // Slideshow state for city images with elegant smooth motion
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    if (cityImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % cityImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [cityImages.length]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Dates read as "28 أكتوبر 2026": an ISO date inside Arabic text is shown reversed by the bidi algorithm
  const formatTripDate = (raw?: string) => {
    const s = String(raw || "").split("T")[0];
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString(isAr ? "ar-LY-u-nu-latn" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  };
  // The length of a weekly trip comes from its own dates (it was a fixed "7 days")
  const tripDays = (() => {
    if (trip.type !== "weekly") return 0;
    const start = new Date(`${String((trip as any).startDate || "").split("T")[0]}T00:00:00`);
    const end = new Date(`${String((trip as any).endDate || "").split("T")[0]}T00:00:00`);
    const n = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
    return Number.isFinite(n) && n > 0 ? n : 0;
  })();
  const daysLabel = (n: number) =>
    isAr ? (n === 1 ? "يوم واحد" : n === 2 ? "يومان" : n <= 10 ? `${n} أيام` : `${n} يوماً`) : `${n} day${n === 1 ? "" : "s"}`;
  const tripKindLabel = trip.type === "daily"
    ? (isAr ? "رحلة يومية" : "Day tour")
    : trip.type === "weekly"
    ? (isAr ? "رحلة أسبوعية" : "Multi-day tour")
    : (isAr ? "رحلة خاصة" : "Private tour");
  const seatsFact = {
    icon: Users,
    label: isAr ? "المقاعد المتبقية" : "Seats left",
    value: info.availableSeats <= 0
      ? (isAr ? "مكتملة الحجز" : "Fully booked")
      : (isAr ? `${info.availableSeats} من ${info.totalSeats}` : `${info.availableSeats} of ${info.totalSeats}`),
    tone: info.availableSeats <= 0 ? "text-red-700" : undefined,
    bar: info.totalSeats > 0 ? Math.round((Math.max(0, info.availableSeats) / info.totalSeats) * 100) : 0,
  };
  const tripFacts: { icon: LucideIcon; label: string; value: string; tone?: string; bar?: number }[] =
    trip.type === "weekly"
      ? [
          { icon: CalendarDays, label: isAr ? "الانطلاق" : "Departs", value: formatTripDate((trip as any).startDate) },
          { icon: Flag, label: isAr ? "العودة" : "Returns", value: formatTripDate((trip as any).endDate) },
          { icon: Clock, label: isAr ? "المدة" : "Duration", value: tripDays ? daysLabel(tripDays) : "—" },
          seatsFact,
        ]
      : trip.type === "daily"
      ? [
          { icon: MapPin, label: isAr ? "نقطة الانطلاق" : "Departure", value: info.departurePoint || "—" },
          { icon: CalendarDays, label: isAr ? "أيام الانطلاق" : "Runs on", value: String((trip as any).daysOfWeek || "—") },
          { icon: Clock, label: isAr ? "التوقيت" : "Hours", value: isAr ? "9:00 ص – 9:00 م" : "9:00 AM – 9:00 PM" },
          seatsFact,
        ]
      : [
          { icon: MapPin, label: isAr ? "نقطة الانطلاق" : "Departure", value: info.departurePoint || "—" },
          seatsFact,
        ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] pb-20 relative" dir={dir}>
      {/* 1. Hero: the trip's photographs full width, the title set over their lower edge */}
      <header className="relative w-full h-[440px] sm:h-[520px] lg:h-[600px] bg-slate-950 overflow-hidden group">
        {cityImages.map((imgSrc, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === activeSlide ? 1 : 0, zIndex: idx === activeSlide ? 2 : 1 }}
          >
            <img
              src={imgSrc}
              alt={`${trip.title} - ${idx + 1}`}
              className={`w-full h-full object-cover ${idx === activeSlide ? KB_CLASSES[idx % KB_CLASSES.length] : ""}`}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== heroImg) {
                  target.src = heroImg;
                }
              }}
            />
          </div>
        ))}

        {/* Neutral scrims: darker at the foot for the title, lightly at the top for the controls */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

        {/* Controls over the photograph: back and favourite only */}
        <div className="absolute top-0 inset-x-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onBack}
              className="group inline-flex items-center gap-2.5 h-11 ps-1.5 pe-5 rounded-full bg-white/95 hover:bg-white text-[#0F172A] text-sm font-black shadow-lg shadow-black/20 ring-1 ring-white/60 hover:shadow-md transition-all duration-200 cursor-pointer"
              aria-label={isAr ? "العودة إلى قائمة الرحلات" : "Back to tours"}
            >
              <span className="w-8 h-8 rounded-full bg-[#00736F] text-white flex items-center justify-center transition-transform duration-200 group-hover:scale-110">
                {dir === "rtl" ? <ArrowRight className="w-4 h-4" aria-hidden="true" /> : <ArrowLeft className="w-4 h-4" aria-hidden="true" />}
              </span>
              <span>{isAr ? "كل الرحلات" : "All tours"}</span>
            </button>
            <FavoriteButton
              itemType={trip.type === "weekly" ? "weekly_trip" : "daily_trip"}
              itemId={trip.id}
              itemTitle={trip.title}
              size="md"
              className="bg-white/15 hover:bg-white/25 backdrop-blur-md text-white border border-white/25"
            />
          </div>
        </div>

        {/* Previous / next on desktop hover */}
        {cityImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + cityImages.length) % cityImages.length)}
              aria-label={isAr ? "الصورة السابقة" : "Previous photo"}
              className="hidden md:flex absolute left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % cityImages.length)}
              aria-label={isAr ? "الصورة التالية" : "Next photo"}
              className="hidden md:flex absolute right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/25 backdrop-blur-md border border-white/25 text-white items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </>
        )}

        {/* Title block on the photograph */}
        <div className="absolute bottom-0 inset-x-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 sm:pb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
            <div className="max-w-3xl text-white">
              <p className="text-sm sm:text-base font-medium text-white/85">
                {tripKindLabel}
                {info.departurePoint ? <span className="text-white/60">{"  ·  "}</span> : null}
                {info.departurePoint}
              </p>
              <h1 className="mt-2 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] tracking-tight [text-wrap:balance]">
                {trip.title}
              </h1>
            </div>

            {cityImages.length > 1 && (
              <div className="flex items-center gap-1.5 shrink-0" aria-label={isAr ? "صور الرحلة" : "Trip photos"}>
                {cityImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    aria-label={isAr ? `الصورة ${idx + 1}` : `Photo ${idx + 1}`}
                    aria-current={idx === activeSlide}
                    className="py-2 cursor-pointer"
                  >
                    <span className={`block h-1 rounded-full transition-[width,background-color] duration-300 ${idx === activeSlide ? "w-8 bg-white" : "w-4 bg-white/40 hover:bg-white/70"}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. The facts a visitor decides on, then the price and the one action */}
      <section className="bg-white border-b border-[#E8E2D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-7 grid lg:grid-cols-12 gap-6 lg:gap-10 items-center">
          <dl className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
            {tripFacts.map((f) => (
              <div key={f.label} className="min-w-0">
                <dt className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <f.icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  {f.label}
                </dt>
                <dd className={`mt-1 text-[15px] font-bold truncate ${f.tone || "text-[#0F172A]"}`} title={f.value}>{f.value}</dd>
                {f.bar !== undefined && (
                  <div className="mt-2 h-1 rounded-full bg-slate-100 overflow-hidden flex">
                    <div className="h-full rounded-full bg-[#00736F] transition-[width] duration-500" style={{ width: `${f.bar}%` }} />
                  </div>
                )}
              </div>
            ))}
          </dl>

          <div className="lg:col-span-4 flex items-center justify-between lg:justify-end gap-5 pt-5 lg:pt-0 border-t lg:border-t-0 lg:border-s border-[#E8E2D6] lg:ps-10">
            <div>
              <div className="text-xs font-medium text-slate-500">{isAr ? "السعر للمقعد" : "Price per seat"}</div>
              {info.offerPrice ? (
                <div className="mt-0.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#C2410C] tabular-nums tracking-tight">{info.offerPrice} د.ل</span>
                  <span className="text-sm font-bold text-slate-400 line-through tabular-nums">{info.basePrice}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#D96B27]/10 text-[#C2410C] text-[11px] font-black">-{info.offerDiscount}%</span>
                </div>
              ) : (
                <div className="mt-0.5 text-2xl sm:text-3xl font-bold text-[#00736F] tabular-nums tracking-tight">{info.priceFormatted}</div>
              )}
            </div>
            <button
              type="button"
              disabled={info.availableSeats <= 0}
              onClick={onBook}
              className={`h-12 px-6 rounded-xl font-bold text-sm inline-flex items-center gap-2 shrink-0 ${
                info.availableSeats <= 0
                  ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                  : "bg-[#D96B27] hover:bg-[#c25a1b] text-white cursor-pointer"
              }`}
            >
              {info.availableSeats <= 0
                ? (isAr ? "مكتملة الحجز" : "Fully booked")
                : trip.type === "private"
                ? (isAr ? "طلب تصميم الرحلة" : "Request custom tour")
                : (isAr ? "احجز مقعدك" : "Book your seat")}
              {info.availableSeats > 0 && (dir === "rtl" ? <ArrowLeft className="w-4 h-4" aria-hidden="true" /> : <ArrowRight className="w-4 h-4" aria-hidden="true" />)}
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Right Main Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 2. Description card: skipped when the description only repeats the trip title */}
            {info.realisticOverview && info.realisticOverview.trim() !== trip.title.trim() && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D6] space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] leading-snug">
                  {isAr ? "عن الرحلة" : "About this tour"}
                </h2>

                <p className="text-base text-slate-700 leading-loose">
                  {info.realisticOverview}
                </p>
              </div>
            )}

            {/* Promotional offer of this trip, with its period */}
            {"activeOffer" in trip && trip.activeOffer && (
              <div className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-l from-[#D96B27] to-[#C56A3D] text-white shadow-lg">
                <div className="absolute -left-6 -top-6 w-28 h-28 rounded-full bg-white/10" aria-hidden="true" />
                <div className="relative flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white/80">🏷️ {isAr ? "عرض ترويجي على هذه الرحلة" : "Promotion on this tour"}</div>
                    <div className="mt-1 text-lg font-black leading-snug">{trip.activeOffer.title}</div>
                    <div className="mt-1.5 text-xs font-bold text-white/90">
                      {isAr
                        ? `من ${trip.activeOffer.start_date} إلى ${trip.activeOffer.end_date} — يُطبق الخصم تلقائياً عند حجز موعد ضمن هذه الفترة`
                        : `${trip.activeOffer.start_date} → ${trip.activeOffer.end_date} — applied automatically to dates in this period`}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-white text-[#C56A3D] flex flex-col items-center justify-center shadow-md">
                    <span className="text-2xl font-black leading-none">-{trip.activeOffer.discount}%</span>
                    <span className="text-[11px] font-black mt-1">{isAr ? "خصم" : "off"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Itinerary Timeline Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D6] space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] flex items-center gap-2">
                    <span>{isAr ? "محطات وخط سير الرحلة خطوة بخطوة" : "Step-by-Step Itinerary Timeline"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isAr ? (trip.type === "daily" ? "مواعيد الرحلة اليومية المنظمة: من 09:00 صباحاً حتى 09:00 مساءً بدقة" : "مواعيد منظمة تضمن قضاء وقت ممتع واستكشاف حقيقي دون إرهاق") : "Paced schedule for maximum comfort & discovery"}
                  </p>
                </div>
              </div>

              {info.itinerary.length === 0 ? (
                <div className="py-8 px-4 text-center bg-[#FAF7F2] border border-dashed border-[#E8E2D6] rounded-2xl space-y-2">
                  <span className="text-3xl block">📍</span>
                  <h4 className="text-xs sm:text-sm font-black text-[#00736F]">
                    {isAr ? "لم يتم تسجيل محطات تفصيلية لهذا المسار بعد." : "No detailed itinerary stations registered for this tour yet."}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {isAr ? "سيتم تزويد المشتركين بجدول المحطات المعتمد قبل موعد الانطلاق." : "A detailed schedule will be shared with verified attendees."}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-black">
                    <span className="px-3 py-1 rounded-full bg-[#00736F]/10 text-[#00736F]">📍 {info.itinerary.length} {isAr ? "محطات" : "stops"}</span>
                    {info.itinerary[0]?.time && (
                      <span className="px-3 py-1 rounded-full bg-[#D96B27]/10 text-[#B4541A]">
                        🕘 {info.itinerary[0].time} ← {info.itinerary[info.itinerary.length - 1].time}
                      </span>
                    )}
                  </div>

                  <ol className="relative space-y-2.5 before:absolute before:top-2 before:bottom-2 before:right-[15px] before:w-0.5 before:bg-gradient-to-b before:from-[#1ABC9C] before:to-[#D96B27]">
                    {(showAllStops ? info.itinerary : info.itinerary.slice(0, 2)).map((step, idx) => (
                      <li key={idx} className="relative flex items-start gap-3 pr-10">
                        <span className="absolute right-0 top-2 w-8 h-8 rounded-full bg-white border-2 border-[#1ABC9C] text-[#00736F] flex items-center justify-center text-[11px] font-black shadow-xs">
                          {idx + 1}
                        </span>
                        <div className="flex-1 p-3.5 rounded-2xl bg-gradient-to-l from-[#FAF7F2] to-white border border-[#E8E2D6] hover:border-[#1ABC9C]/50 hover:shadow-xs transition">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-black text-sm text-[#0F172A] leading-snug">{step.title}</h4>
                            {step.time && (
                              <span className="flex-shrink-0 text-[11px] font-black text-white bg-[#00736F] px-2.5 py-0.5 rounded-full">{step.time}</span>
                            )}
                          </div>
                          {step.desc && <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1">{step.desc}</p>}
                        </div>
                      </li>
                    ))}
                  </ol>

                  {info.itinerary.length > 2 && (
                    <button
                      type="button"
                      onClick={() => setShowAllStops((v) => !v)}
                      className="w-full py-2.5 rounded-xl border border-[#00736F]/20 bg-[#00736F]/5 hover:bg-[#00736F]/10 text-[#00736F] text-xs font-black transition cursor-pointer"
                    >
                      {showAllStops
                        ? (isAr ? "إخفاء المحطات ▲" : "Show fewer stops ▲")
                        : (isAr ? `عرض كل المحطات (${info.itinerary.length - 2} أخرى) ▼` : `Show all stops (${info.itinerary.length - 2} more) ▼`)}
                    </button>
                  )}
                </div>
              )}
            </div>



            {/* 4. Landmarks the trip visits (daily and weekly): photo cards that open the landmark's details */}
            {"attractions" in trip && trip.attractions && trip.attractions.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D6] space-y-5">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0F172A]">
                      {isAr ? "المعالم التي تزورها الرحلة" : "Landmarks on this tour"}
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {isAr ? "اضغط على أي معلم للتعرف عليه أكثر" : "Tap a landmark to learn more about it"}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[#1ABC9C]/10 text-[#0E8C74] text-xs font-black">
                    🏛️ {trip.attractions.length} {isAr ? (trip.attractions.length === 1 ? "معلم" : "معالم") : "sites"}
                  </span>
                </div>
                <div className={`grid gap-4 ${trip.attractions.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
                  {trip.attractions.map((attr, aIdx) => (
                    <button
                      key={attr.placeId || aIdx}
                      type="button"
                      onClick={() => openLandmark(attr)}
                      className="group relative h-48 rounded-2xl overflow-hidden text-right shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-[#1ABC9C]/40"
                    >
                      <img
                        src={attr.image || destLeptisTheater}
                        alt={attr.name}
                        loading="lazy"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#0F172A]/35 to-transparent" />
                      {attr.category && (
                        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[#00736F] text-[11px] font-black shadow-sm">
                          {attr.category}
                        </span>
                      )}
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-xl font-black text-white drop-shadow">{attr.name}</div>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          {attr.location && attr.location !== attr.name ? (
                            <span className="text-xs font-bold text-white/80">📍 {attr.location}</span>
                          ) : <span />}
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#D96B27] text-white text-[11px] font-black transition-transform duration-300 group-hover:-translate-x-1">
                            {isAr ? "اعرف المزيد ←" : "Learn more →"}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Recommended Accommodations & Stays (Only rendered when trip actually has linked hotels - Requirement 3) */}
            {filteredHotels.length > 0 && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D6] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] flex items-center gap-2">
                      <span>
                        {isAr ? "فنادق وأماكن الإقامة المشمولة في برنامج الرحلة الأسبوعية" : "Included Accommodations & Hotels for Weekly Tour"}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {isAr
                        ? "أماكن إقامة مختارة ومجهزة للمبيت طوال أيام الرحلة الأسبوعية في المعالم المزارة"
                        : "Handpicked hotels and stays at the tour destination"}
                    </p>
                  </div>
                  <Link
                    to="/hotels"
                    className="text-xs font-black text-[#00736F] hover:underline flex items-center gap-1"
                  >
                    <span>{isAr ? "استعراض جميع الفنادق" : "View All"}</span>
                    <span>➔</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filteredHotels.map((h, hIdx) => {
                      const hName = h.hotel_name || h.name || "فندق معتمد";
                      const hImg = h.hotel_photo_1 || h.photo || "/assets/ai_hotel.jpg";
                      const hStars = Number(h.star_rating || h.stars || 4);
                      const hCity = h.city || "ليبيا";
                      const hPhone = h.phone_number || h.phone;
                      return (
                        <div key={h.hotel_id || h.id || hIdx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] flex flex-col justify-between space-y-3">
                          <div className="flex items-start gap-3">
                            <img
                              src={hImg}
                              alt={hName}
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1 mb-0.5">
                                <h4 className="font-black text-sm text-[#0F172A] truncate">{hName}</h4>
                                <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                  {isAr ? "مشمول بالرحلة ✓" : "Included ✓"}
                                </span>
                              </div>
                              <div className="text-xs text-amber-500 font-bold">
                                {"★".repeat(Math.min(5, Math.max(1, hStars)))} · {isAr ? `فندق ${hStars} نجوم` : `${hStars} Stars`}
                              </div>
                              <div className="text-[11px] text-[#00736F] font-black mt-1">
                                📍 {hCity}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D6]">
                            <FavoriteButton
                              itemType="hotel"
                              itemId={h.hotel_id || h.id}
                              itemTitle={hName}
                              size="sm"
                            />
                            {hPhone ? (
                              <a
                                href={`tel:${hPhone}`}
                                className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition flex items-center justify-center gap-1"
                              >
                                <span>📞</span>
                                <span>{hPhone}</span>
                              </a>
                            ) : (
                              <span className="flex-1 py-1.5 px-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs text-center">
                                {isAr ? "حجز مسبق معتمد" : "Confirmed Stay"}
                              </span>
                            )}
                            <Link
                              to="/hotels"
                              className="py-1.5 px-3 rounded-xl bg-[#00736F] text-white font-black text-xs text-center transition"
                            >
                              {isAr ? "تفاصيل الفندق" : "Details"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* 6. Partner Dining & Restaurants (Only rendered when trip actually has linked restaurants - Requirement 4) */}
            {(includedRestaurants.length > 0 || Boolean(info.restaurant)) && (
              <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D6] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] flex items-center gap-2">
                      <span>{isAr ? "المطاعم والمقاهي المشمولة ضمن برنامج الرحلة" : "Included Dining & Restaurants"}</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-bold mt-0.5">
                      {isAr
                        ? "وجبات وأطباق شعبية وضيافة قهوة وشاي في أرقى المطاعم المسجلة بالمنصة"
                        : "Authentic local dining and hospitality in the visited landmarks"}
                    </p>
                  </div>
                <Link
                  to="/restaurants"
                  className="text-xs font-black text-[#00736F] hover:underline flex items-center gap-1"
                >
                  <span>{isAr ? "استعراض المطاعم" : "View Dining"}</span>
                  <span>➔</span>
                </Link>
              </div>

              {includedRestaurants.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {includedRestaurants.map((r, rIdx) => {
                    const rName = r.facility_name || r.name || "مطعم ومقهى تراثي";
                    const rImg = r.facility_image_1 || r.image || "/assets/restaurant-libya.jpg";
                    const rType = r.facility_type || r.type || "مطعم ليبي تراثي";
                    const rCity = r.city || "ليبيا";
                    const rPhone = r.phone_number || r.phone;
                    return (
                      <div key={r.facility_id || r.id || rIdx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] space-y-2.5 shadow-xs">
                        <div className="flex items-start gap-3">
                          <img
                            src={rImg}
                            alt={rName}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span className="font-black text-sm text-[#0F172A] truncate">{rName}</span>
                              <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                {isAr ? "مشمول بالرحلة ✓" : "Included ✓"}
                              </span>
                            </div>
                            <div className="text-[11px] text-amber-700 font-bold">
                              🍲 {rType}
                            </div>
                            <div className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1 line-clamp-2">
                              {r.description || `مطعم معتمد لتقديم أشهى الوجبات والضيافة في ${rCity}.`}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] text-xs font-bold text-[#00736F]">
                          <span>📍 {rCity}</span>
                          <div className="flex items-center gap-2">
                            <FavoriteButton
                              itemType="restaurant"
                              itemId={r.facility_id || r.id}
                              itemTitle={rName}
                              size="sm"
                            />
                            {rPhone ? (
                              <a href={`tel:${rPhone}`} className="text-emerald-700 font-black hover:underline flex items-center gap-1">
                                <span>📞</span>
                                <span>{rPhone}</span>
                              </a>
                            ) : (
                              <span className="text-emerald-700 font-bold">شامل بالرحلة ✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : info.restaurant ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] space-y-2.5 shadow-xs">
                    <div className="flex items-start gap-3">
                      {info.restaurant.image ? (
                        <img
                          src={info.restaurant.image}
                          alt={info.restaurant.name}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-2xl shrink-0">
                          🍽️
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span className="font-black text-sm text-[#0F172A] truncate">
                            {info.restaurant.name}
                          </span>
                          <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                            {isAr ? "مشمول بالرحلة ✓" : "Included ✓"}
                          </span>
                        </div>
                        <div className="text-[11px] text-amber-700 font-bold">
                          {info.restaurant.type || "مطعم ومقهى سياحي معتمد"}
                        </div>
                        <div className="text-[11px] text-slate-600 font-medium leading-relaxed mt-1">
                          {info.restaurant.address || `مطعم معتمد لتقديم وجبة الغداء التراثية المشمولة بالرحلة في ${info.restaurant.city || 'ليبيا'}.`}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] text-xs font-bold text-[#00736F]">
                      <span>📍 {info.restaurant.city || "طرابلس"} {info.restaurant.address ? `— ${info.restaurant.address}` : ""}</span>
                      <div className="flex items-center gap-2">
                        <FavoriteButton
                          itemType="restaurant"
                          itemId={info.restaurant.name}
                          itemTitle={info.restaurant.name}
                          size="sm"
                        />
                        {info.restaurant.phone ? (
                          <a href={`tel:${info.restaurant.phone}`} className="text-emerald-700 font-black hover:underline flex items-center gap-1">
                            <span>📞</span>
                            <span>{info.restaurant.phone}</span>
                          </a>
                        ) : (
                          <span className="text-emerald-700 font-bold">شامل بالرحلة ✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

            {/* 7. Verified Tourist Reviews (التقييمات المعتمدة من السياح بعد انتهاء الرحلة) */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E2D6] space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0F172A] flex items-center gap-2">
                    <span>{isAr ? "تقييمات وتجارب السياح المشاركين في الرحلة" : "Verified Tourist Reviews & Ratings"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isAr
                      ? "تقييمات حقيقية موثقة من سياح شاركوا بالفعل في هذه الرحلة بعد اكتمال موعدها"
                      : "Genuine verified reviews from tourists who completed this trip"}
                  </p>
                </div>
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-2xl border border-amber-200">
                    <span className="text-amber-500 text-base">★</span>
                    <span className="text-sm font-black text-amber-900">
                      {(reviews.reduce((sum, r) => sum + r.stars_rating, 0) / reviews.length).toFixed(1)} / 5
                    </span>
                    <span className="text-xs text-slate-500 font-bold">({reviews.length} {isAr ? "تقييم" : "reviews"})</span>
                  </div>
                )}
              </div>

              {isLoadingReviews ? (
                <div className="text-center py-8 text-xs text-slate-500 font-bold animate-pulse">
                  جاري تحميل التقييمات المعتمدة...
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((rev) => (
                    <div key={rev.review_id} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#00736F] text-white flex items-center justify-center font-black text-xs">
                            {(rev.tourist_name || "س").slice(0, 1)}
                          </div>
                          <div>
                            <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                              <span>{rev.tourist_name || (isAr ? "سائح معتمد" : "Verified Tourist")}</span>
                              <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2 py-0.2 rounded-full font-bold">
                                {isAr ? "مشارك مؤكد ✓" : "Verified ✓"}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              {rev.created_at ? new Date(rev.created_at).toLocaleDateString('ar-LY') : ""}
                            </div>
                          </div>
                        </div>
                        <div className="text-amber-500 text-sm font-black">
                          {"★".repeat(Math.max(1, Math.min(5, rev.stars_rating)))}
                          <span className="text-slate-300 text-xs mr-1">
                            {"☆".repeat(Math.max(0, 5 - rev.stars_rating))}
                          </span>
                        </div>
                      </div>
                      {rev.comment_text && (
                        <p className="text-xs text-slate-700 font-medium leading-relaxed pr-10">
                          «{rev.comment_text}»
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center space-y-1.5">
                  <div className="text-2xl">🌟</div>
                  <h4 className="text-xs font-black text-slate-800">
                    {isAr ? "كن أول من يقيّم هذه الرحلة بعد خوض تجربتك السياحية معنا!" : "Be the first to review this tour after your experience!"}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium max-w-md mx-auto">
                    {isAr
                      ? "يتاح خيار التقييم تلقائياً في لوحة تحكم السائح بعد اكتمال موعد الرحلة للمشاركين المؤكدين."
                      : "Reviews become available in your Tourist Dashboard once the trip is completed."}
                  </p>
                </div>
              )}
            </div>

          </div>

          {/* Left Sidebar Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Booking Box */}
            <div className="bg-white rounded-2xl p-6 border border-[#E8E2D6] shadow-card sticky top-20 space-y-5">
              <div>
                <span className="text-xs font-medium text-slate-500 block mb-1">
                  {isAr ? "السعر للمقعد" : "Price per seat"}
                </span>
                {info.offerPrice ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-[#C2410C] tabular-nums tracking-tight">{info.offerPrice} د.ل</span>
                      <span className="text-base font-bold text-slate-400 line-through tabular-nums">{info.basePrice} د.ل</span>
                    </div>
                    <div className="mt-1 text-xs font-black text-emerald-700">
                      {isAr
                        ? `وفّر ${info.basePrice - info.offerPrice} د.ل بخصم ${info.offerDiscount}%${trip.type === "daily" ? " على مواعيد فترة العرض" : ""}`
                        : `Save ${info.basePrice - info.offerPrice} LYD (${info.offerDiscount}% off)`}
                    </div>
                  </>
                ) : (
                  <div className="text-3xl font-bold text-[#00736F] tabular-nums tracking-tight">
                    {info.priceFormatted}
                  </div>
                )}
                <div className="text-xs text-slate-500 leading-relaxed mt-2">
                  {isAr ? "يشمل النقل السياحي، التذاكر، وجبة الغداء، والمرشد المعتمد." : "Includes VIP transport, museum passes, lunch, and certified guide."}
                </div>
              </div>

              <dl className="text-sm divide-y divide-[#E8E2D6] border-y border-[#E8E2D6]">
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-slate-500">{isAr ? "المقاعد المتبقية" : "Seats left"}</dt>
                  <dd className="font-bold text-[#0F172A] tabular-nums">{info.availableSeats}</dd>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <dt className="text-slate-500">{isAr ? "مدينة الانطلاق" : "Departs from"}</dt>
                  <dd className="font-bold text-[#0F172A]">{"departure" in trip ? trip.departure : "طرابلس"}</dd>
                </div>
              </dl>

              <button
                type="button"
                disabled={info.availableSeats <= 0}
                onClick={onBook}
                className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 ${
                  info.availableSeats <= 0
                    ? "bg-stone-200 text-stone-500 cursor-not-allowed"
                    : "bg-[#D96B27] hover:bg-[#c25a1b] text-white cursor-pointer"
                }`}
              >
                <span>
                  {info.availableSeats <= 0
                    ? (isAr ? "عذراً، هذه الرحلة مكتملة" : "Fully Booked")
                    : trip.type === "private"
                    ? (isAr ? "طلب تصميم الرحلة الخاصة" : "Request Custom Tour")
                    : (isAr ? "حجز مقاعدك الآن" : "Book Your Seat Now")}
                </span>
                {info.availableSeats > 0 && <span>➔</span>}
              </button>
            </div>



            {/* Tour Guide Card */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D6] space-y-3">
              <h3 className="text-sm font-bold text-[#0F172A]">
                {isAr ? "المرشد السياحي المرافق" : "Your tour guide"}
              </h3>

              {info.guide ? (
                <>
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] flex items-center gap-3 text-xs">
                    {info.guide.avatar ? (
                      <img src={info.guide.avatar} alt={info.guide.name} className="w-12 h-12 rounded-xl object-cover border border-white shadow-xs flex-shrink-0" />
                    ) : (
                      <span className="w-12 h-12 rounded-xl bg-white border border-[#E8E2D6] flex items-center justify-center text-xl flex-shrink-0">👤</span>
                    )}
                    <div className="min-w-0">
                      <div className="font-black text-[#0F172A] text-sm">{info.guide.name}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{info.guide.title || (isAr ? "مرشد سياحي معتمد" : "Certified Guide")}</div>
                      {info.guide.phone && <div className="text-xs text-[#00736F] font-bold mt-1">📞 {info.guide.phone}</div>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenGuideCV?.(info.guide!.cv || {
                      name: info.guide!.name,
                      title: info.guide!.title,
                      phone: info.guide!.phone,
                      avatar: info.guide!.avatar,
                    })}
                    className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-[#00736F] font-black text-xs border border-[#E8E2D6] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🚘</span>
                    <span>{isAr ? "عرض السيرة الذاتية ورخصة الإرشاد" : "View Certified CV"}</span>
                  </button>
                </>
              ) : (
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] text-xs text-slate-600 font-bold">
                  {isAr ? "سيتم تعيين مرشد سياحي معتمد لهذه الرحلة قريباً من قبل إدارة المنصة." : "A certified tour guide will be assigned shortly."}
                </div>
              )}
            </div>

            {/* Vehicle & Driver Card (Directly below Tour Guide for all trips) */}
            <div className="bg-white rounded-2xl p-5 border border-[#E8E2D6] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0F172A]">
                  {isAr ? "مركبة وسائق الرحلة" : "Vehicle and driver"}
                </h3>
                <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isAr ? "معتمدة ✓" : "Certified ✓"}
                </span>
              </div>

              {info.vehicle ? (
                <>
                  <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-black text-[#0F172A] text-sm flex items-center gap-1.5">
                        <span>{info.vehicle.model.includes("50") ? "🚍" : info.vehicle.model.includes("15") ? "🚐" : "🚌"}</span>
                        <span>{info.vehicle.model}</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-lg border border-[#E8E2D6]">
                        {isAr ? `${info.vehicle.capacity} راكب` : `${info.vehicle.capacity} seats`}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                      <span>🏢</span>
                      <span className="text-[#00736F]">{info.vehicle.company}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono text-slate-700">{(info.vehicle.plateNumber || "").replace(/\?+/g, "").trim() || (isAr ? "لوحة معتمدة" : "Verified")}</span>
                    </div>

                    <div className="pt-1.5 border-t border-[#E8E2D6]/60 flex items-center justify-between text-xs">
                      <div className="font-bold text-slate-700 flex items-center gap-1">
                        <span>🚘</span>
                        <span>{info.vehicle.driver}</span>
                      </div>
                      {info.vehicle.driverPhone && (
                        <div className="text-[#00736F] font-mono font-bold text-[11px]">
                          📞 {info.vehicle.driverPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenVehicleDetails?.({
                      // Field names the vehicle details modal reads; no invented plate or phone
                      name: info.vehicle!.model,
                      companyName: info.vehicle!.company,
                      plateNumber: (info.vehicle!.plateNumber || "").replace(/\?+/g, "").trim() || undefined,
                      seats: info.vehicle!.capacity,
                      companyPhone: info.vehicle!.companyPhone,
                      vehicle_image: info.vehicle!.image,
                      category: info.vehicle!.category,
                      dailyRate: info.vehicle!.dailyRate,
                      vehicle_status: info.vehicle!.status,
                    })}
                    className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-[#00736F] font-black text-xs border border-[#E8E2D6] transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>🚍</span>
                    <span>{isAr ? "عرض بيانات المركبة والسائق والتأمين" : "View Details"}</span>
                  </button>
                </>
              ) : (
                <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] text-xs text-slate-600 font-bold">
                  {isAr ? "حافلة سياحية معتمدة ومكيفة سيتم تحديد بياناتها وسائقها قبل موعد الانطلاق." : "Certified AC vehicle will be assigned before departure."}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>

      <LandmarkDetailsModal
        city={openedLandmark}
        onClose={() => setOpenedLandmark(null)}
        onBookPrivate={() => {
          setPrivateTripDest(openedLandmark?.name || "");
          setOpenedLandmark(null);
        }}
      />
      <PrivateTripModal
        open={privateTripDest !== null}
        onClose={() => setPrivateTripDest(null)}
        initialDestination={privateTripDest || ""}
      />

      {/* 8. Floating Promotional Cards for Nearby Stays & Dining (خامساً: عروض ترويجية قريبة عائمة) */}
      <FloatingNearbyPromo
        tripId={trip.id}
        tripCity={"departure" in trip ? trip.departure : "ليبيا"}
        landmarkCities={("attractions" in trip ? trip.attractions : []).map((a: TouristAttraction) => a.location).filter((c: string) => c && c !== "ليبيا")}
        platformHotels={platformHotels}
        platformRestaurants={platformRestaurants}
      />

    </div>
  );
}

/* ============================================================ */
/* 3. SPECIAL OFFERS SPOTLIGHT (SINGLE ROTATING LARGE CARD) */
/* ============================================================ */
function SpecialOffersSpotlight({
  offers,
  onBook,
  onDetails,
}: {
  offers: TripOffer[];
  onBook: (offer: TripOffer) => void;
  onDetails: (offer: TripOffer) => void;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [offerIndex, setOfferIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentOffer = offers[offerIndex] || offers[0];

  // Auto-rotate every 5 seconds if not hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused, offers.length]);

  const handleNextOffer = () => {
    setOfferIndex((prev) => (prev + 1) % offers.length);
  };

  const displayImg = currentOffer.gallery && currentOffer.gallery.length > 0 ? currentOffer.gallery[0] : currentOffer.img;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div 
        className="bg-[#FFF9F5] rounded-3xl p-6 sm:p-10 border-2 border-orange-100 shadow-md relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-[#D96B27]/10 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-radial from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        {/* Section Top Tag & Title */}
        <div className="text-center max-w-xl mx-auto mb-8 space-y-1 relative z-10">
          <span className="px-3.5 py-1 rounded-full bg-[#D96B27]/10 text-[#D96B27] text-xs font-black border border-[#D96B27]/25 inline-flex items-center gap-1.5">
            <span>🔥</span>
            <span>{isAr ? "عروض حصرية وخصومات قوية على الرحلات" : "Exclusive Trip Discounts"}</span>
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
            {isAr ? "عروض الرحلات السياحية المميزة" : "Featured Special Tour Offers"}
          </h2>
        </div>

        {/* Single Rotating Large Image Card */}
        <div className="relative z-10">
          <div 
            className="relative w-full h-[300px] sm:h-[400px] rounded-[30px] overflow-hidden group shadow-md border-4 border-white cursor-pointer transition duration-500"
            onClick={handleNextOffer}
          >
            <img
              key={currentOffer.id} // Forces re-render/animation on image change
              src={displayImg}
              alt={currentOffer.title}
              loading="lazy"
              className="w-full h-full object-cover brightness-95 animate-in fade-in zoom-in-95 duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

            {/* Prominent Corner Triangle Discount Ribbon on Top-Right */}
            <div className="absolute top-0 right-0 w-48 h-48 overflow-hidden z-30 pointer-events-none">
              <div className="absolute transform rotate-45 bg-red-600 text-white font-black text-xl py-3 right-[-60px] top-[45px] w-[260px] text-center shadow-md border-b-4 border-white/40 drop-shadow-md tracking-wide">
                {currentOffer.tag}
              </div>
            </div>

            {/* Card Footer Info */}
            <div className="absolute bottom-6 inset-x-6 text-white z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-xs font-black border border-white/20 inline-block">
                    📍 {currentOffer.departure}
                  </span>
                </div>
                <h4 className="font-black text-2xl md:text-4xl text-white drop-shadow-md">
                  {currentOffer.title}
                </h4>
                <p className="text-sm md:text-base text-slate-200 mt-2 max-w-2xl">{currentOffer.sub}</p>
              </div>
              
              <div className="flex flex-col items-start md:items-end shrink-0">
                <div className="flex flex-col items-start md:items-end mb-2">
                  <span className="text-sm md:text-base text-slate-300 font-bold line-through">
                    {isAr ? `السعر السابق: ${currentOffer.oldPrice} د.ل` : `Was: ${currentOffer.oldPrice}`}
                  </span>
                  <div className="text-4xl md:text-5xl font-black text-amber-400 drop-shadow-md">
                    {currentOffer.price} <span className="text-lg md:text-xl font-bold text-slate-300">{isAr ? "د.ل" : "LYD"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetails(currentOffer);
                    }}
                    className="py-3 px-8 rounded-xl bg-[#D96B27] hover:opacity-95 text-white font-black text-sm md:text-base shadow-lg transition cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    <span>{isAr ? "عرض تفاصيل العرض" : "View Offer Details"}</span>
                    <span>➔</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Dot Indicators */}
          <div className="flex justify-center items-center gap-2 mt-6">
            {offers.map((_, dotIdx) => (
              <button
                key={dotIdx}
                type="button"
                onClick={() => setOfferIndex(dotIdx)}
                className={`h-2.5 rounded-full transition cursor-pointer ${
                  dotIdx === offerIndex ? "w-8 bg-[#D96B27]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`عرض ${dotIdx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================ */
/* COMPACT NEARBY HOTELS & RESTAURANTS FINDER (GEOLOCATION)     */
/* ============================================================ */
function CompactLocationHotelsFinder() {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [selectedCity, setSelectedCity] = useState("طرابلس");
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);

  const cityOptions = [
    { id: "طرابلس", label: isAr ? "طرابلس (النوفليين)" : "Tripoli", lat: 32.8872, lng: 13.1913 },
    { id: "بنغازي", label: isAr ? "بنغازي (شارع فينيسيا)" : "Benghazi", lat: 32.1167, lng: 20.0667 },
    { id: "الخمس", label: isAr ? "الخمس / لبدة الكبرى" : "Al-Khoms", lat: 32.6500, lng: 14.2667 },
    { id: "شحات", label: isAr ? "شحات / الجبل الأخضر" : "Shahhat", lat: 32.8333, lng: 21.8667 },
    { id: "غدامس", label: isAr ? "غدامس (لؤلؤة الصحراء)" : "Ghadames", lat: 30.1333, lng: 9.2000 },
    { id: "أوباري", label: isAr ? "أوباري / فزان" : "Ubari", lat: 26.5833, lng: 12.7833 },
    { id: "صبراتة", label: isAr ? "صبراتة والساحل الغربي" : "Sabratha", lat: 32.7933, lng: 12.4839 },
  ];

  // Geolocation detector to find closest city
  const handleDetectLocation = () => {
    if (!("geolocation" in navigator)) {
      setGeoStatus(isAr ? "المتصفح لا يدعم تحديد الموقع الجغرافي." : "Geolocation not supported.");
      return;
    }

    setIsDetecting(true);
    setGeoStatus(isAr ? "جاري رصد موقعك الجغرافي..." : "Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetecting(false);
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        let closest = cityOptions[0];
        let minDist = Infinity;
        for (const city of cityOptions) {
          const d = Math.hypot(city.lat - userLat, city.lng - userLng);
          if (d < minDist) {
            minDist = d;
            closest = city;
          }
        }
        setSelectedCity(closest.id);
        setGeoStatus(isAr ? `📍 تم رصد موقعك: ${closest.label}` : `📍 Detected: ${closest.label}`);
      },
      () => {
        setIsDetecting(false);
        setSelectedCity("طرابلس");
        setGeoStatus(isAr ? "📍 تم اختيار طرابلس (النوفليين) كوجهة انطلاق." : "Set to Tripoli.");
      },
      { timeout: 8000 }
    );
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-8">
      <div className="bg-[#FFF8F3] rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D6] shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        
        {/* Left Side (RTL Right): Info & Geolocation Button */}
        <div className="space-y-2 flex-1">
          <button 
            type="button"
            onClick={handleDetectLocation}
            disabled={isDetecting}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D96B27]/10 hover:bg-[#D96B27]/20 text-[#D96B27] text-xs font-black border border-[#D96B27]/25 transition cursor-pointer"
          >
            <span>{isDetecting ? "⏳" : "📍"}</span>
            <span>{isAr ? "تحديد الموقع الجغرافي المباشر" : "Nearby Accommodation & Dining"}</span>
          </button>
          <h3 className="text-lg sm:text-xl font-black text-[#00736F] tracking-tight">
            {isAr ? "حدد موقعك واستكشف الفنادق والمطاعم المجاورة" : "Locate Nearby Hotels, Resorts & Partner Dining"}
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            {isAr
              ? "استكشف أماكن الإقامة والنزل والمطاعم والمقاهي المتعاقد معها القريبة من موقعك أو نقطة انطلاق رحلتك."
              : "Find partner hotels and dining near your trip departure point or current location."}
          </p>

          {/* Location Status */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {geoStatus && (
              <span className="text-xs font-black text-[#D96B27] bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {geoStatus}
              </span>
            )}
          </div>
        </div>

        {/* Right Side (RTL Left): Prominent Large Icon Button To Hotels & Dining Page */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/hotels"
            search={{ city: selectedCity } as any}
            onClick={() => {
              sessionStorage.setItem("dallani_selected_city", selectedCity);
            }}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-[#D96B27] hover:brightness-110 text-white shadow-md transition flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 border-2 border-orange-300/40 group relative"
            title={isAr ? "الانتقال إلى مطاعم وفنادق ليبيا" : "Explore Libya Stays & Dining"}
            aria-label={isAr ? "الانتقال إلى مطاعم وفنادق ليبيا" : "Explore Libya Stays & Dining"}
          >
            <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md group-hover:rotate-12 group-hover:scale-110 transition duration-300" />
            <span className="absolute -bottom-1 -left-1 w-5 h-5 rounded-full bg-white text-[#D96B27] shadow-md flex items-center justify-center text-xs font-black group-hover:-translate-x-0.5 transition-transform">
              ➔
            </span>
          </Link>
        </div>

      </div>
    </section>
  );
}

function TripsPage() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  // Checkbox filters state
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDepartures, setSelectedDepartures] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  // a period sent from the home page search box (?from=&to=): only trips running inside it are shown
  const [dateRange, setDateRange] = useState<{ from: string; to: string } | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const q = p.get("q");
    if (q) { setSearchInput(q); setAppliedQuery(q); }
    const from = p.get("from") || "";
    const to = p.get("to") || "";
    if (from || to) setDateRange({ from, to });
  }, []);

  // Dedicated Full Trip Details View State
  const [activeTripDetails, setActiveTripDetails] = useState<Trip | null>(null);
  const [selectedBookingTrip, setSelectedBookingTrip] = useState<Trip | null>(null);

  const modals = useModalPair();
  const [scheduleKind, setScheduleKind] = useState<"daily" | "weekly" | null>(null);
  const [scheduleTripTitle, setScheduleTripTitle] = useState<string | undefined>(undefined);
  const [scheduleTripImage, setScheduleTripImage] = useState<string | undefined>(undefined);
  const [customSchedules, setCustomSchedules] = useState<any[] | undefined>(undefined);
  const [privateOpen, setPrivateOpen] = useState(false);
  const [trailerModalTripId, setTrailerModalTripId] = useState<string | null>(null);

  // Guide CV & Vehicle Inspector Modals State
  const [selectedGuideCV, setSelectedGuideCV] = useState<GuideCVData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleDetailsData | null>(null);

  // Horizontal Scroll Container Ref for Trips
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollHorizontally = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = direction === "left" ? -340 : 340;
    scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  // Live Database Trips with Instant Cache
  const [liveDbTrips, setLiveDbTrips] = useState<Trip[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("dallani_cached_trips");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [dbOffers, setDbOffers] = useState<TripOffer[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const cached = localStorage.getItem("dallani_cached_offers");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return [];
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => liveDbTrips.length === 0);

  useEffect(() => {
    const fetchDbTrips = async () => {
      try {
        const [resDaily, resWeekly, resDailyOffers, resWeeklyOffers] = await Promise.all([
          apiGetDailyTrips(),
          apiGetWeeklyTrips(),
          apiGetDailyOffers(),
          apiGetWeeklyOffers(),
        ]);

        const mappedDaily: DailyTrip[] = (Array.isArray(resDaily) ? resDaily : []).map((t: any) => {
          const galleryList = safeParseGallery(t.gallery);
          const primaryImg = t.photo || (galleryList[0] || heroImg);
          const fiveImgs = [primaryImg, ...galleryList.filter((x: string) => x !== primaryImg)];
          while (fiveImgs.length < 5) fiveImgs.push(fiveImgs[fiveImgs.length - 1] || primaryImg);

          return {
            id: t.daily_trip_id || `DT-${t.id}`,
            type: "daily" as const,
            title: t.trip_title,
            img: primaryImg,
            images: fiveImgs.slice(0, 5),
            gallery: t.gallery,
            description: "",
            activities: t.activities ? (Array.isArray(t.activities) ? t.activities : String(t.activities).split(',')) : ["جولة ميدانية مع مرشد سياحي", "نقل سياحي مريح ومكيف", "شرح تاريخي وأثري متكامل"],
            attractions: tripAttractionsFromRow(t),
            targetPersons: t.max_capacity || 25,
            availableSeats: t.available_seats !== undefined ? t.available_seats : (t.max_capacity || 25),
            daysOfWeek: t.recurring_days ? `أيام: ${t.recurring_days}` : "السبت,الثلاثاء",
            openDates: Array.isArray(t.open_dates) ? t.open_dates.map((d: any) => String(d.date)) : [],
            departure: (t.departure_city && t.departure_city.includes("بنغازي") ? "بنغازي" : "طرابلس") as "طرابلس" | "بنغازي",
            entertainment: "توقف واستراحة ضيافة، وجلسات تصوير تذكارية",
            activeOffer: t.active_offer || undefined,
            guide: tripGuideFromRow(t),
            vehicle: tripVehicleFromRow(t),
            restaurant: t.restaurant_name ? {
              id: t.restaurant_id,
              name: t.restaurant_name,
              type: t.restaurant_type || "مطعم تراثي",
              city: t.restaurant_city || t.departure_city || "طرابلس",
              address: t.restaurant_address || "",
              phone: t.restaurant_phone || "",
              image: t.restaurant_image || "/assets/dest-tripoli-old-city.jpg",
            } : undefined,
            itinerary_steps: t.itinerary_steps,
            accommodation: "رحلة يومية — عودة مساءً",
            price: Number(t.price_per_seat) || 120,
            rating: Number(t.rating_avg) || 0,
            reviews: Number(t.reviews_count) || 0,
          };
        });

        const mappedWeekly: WeeklyTrip[] = (Array.isArray(resWeekly) ? resWeekly : []).map((t: any) => {
          const galleryList = safeParseGallery(t.gallery);
          const primaryImg = t.photo || (galleryList[0] || destUbari);
          const fiveImgs = [primaryImg, ...galleryList.filter((x: string) => x !== primaryImg)];
          while (fiveImgs.length < 5) fiveImgs.push(fiveImgs[fiveImgs.length - 1] || primaryImg);

          return {
            id: t.weekly_trip_id || `WT-${t.id}`,
            type: "weekly" as const,
            title: t.trip_title,
            img: primaryImg,
            images: fiveImgs.slice(0, 5),
            gallery: t.gallery,
            description: "",
            startDate: t.start_date || "2026-10-25",
            endDate: t.end_date || "2026-10-31",
            targetPersons: t.max_capacity || 20,
            availableSeats: t.available_seats !== undefined ? t.available_seats : (t.max_capacity || 20),
            seatPrice: Number(t.seat_per_price) || 1500,
            cities: (t.destinations && Array.isArray(t.destinations) && t.destinations.length > 0)
              ? t.destinations
              : (t.destination ? t.destination.split(" + ") : [t.departure_city || "طرابلس", t.destination_region || "الصحراء"]),
            attractions: tripAttractionsFromRow(t),
            hotels: (t.hotels && Array.isArray(t.hotels) && t.hotels.length > 0)
              ? t.hotels.map((h: any) => h.hotel_name || h.name)
              : [],
            // Hotels chosen for this weekly trip when it was created (hotels_trip_weekly)
            hotel_ids: Array.isArray(t.hotels) ? t.hotels.map((h: any) => h.hotel_id) : [],
            departure: (t.departure_city && t.departure_city.includes("بنغازي") ? "بنغازي" : "طرابلس") as "طرابلس" | "بنغازي",
            entertainment: "سهرة تراثية، مخيمات وجولات استكشافية",
            activeOffer: t.active_offer || undefined,
            guide: tripGuideFromRow(t),
            vehicle: tripVehicleFromRow(t),
            restaurant: t.restaurant_name ? {
              id: t.restaurant_id,
              name: t.restaurant_name,
              type: t.restaurant_type || "مطعم تراثي",
              city: t.restaurant_city || t.departure_city || "طرابلس",
              address: t.restaurant_address || "",
              phone: t.restaurant_phone || "",
              image: t.restaurant_image || "/assets/dest-tripoli-old-city.jpg",
            } : undefined,
            itinerary_steps: t.itinerary_steps,
            rating: Number(t.rating_avg) || 0,
            reviews: Number(t.reviews_count) || 0,
          };
        });

        // Map live Daily Trip Offers from DelniDB
        const mappedDailyOffers: TripOffer[] = (Array.isArray(resDailyOffers) ? resDailyOffers : []).map((o: any) => {
          const trip = mappedDaily.find((t) => t.id === o.daily_trip_id);
          const basePrice = Number(o.price_per_seat || trip?.price || 120);
          const discount = Number(o.percent_discount) || 15;
          const finalPrice = Math.round(basePrice * (1 - discount / 100));
          // An offer shows its trip's own photo
          const primaryImg = trip?.img || o.offer_image_url || destLeptisTheater;

          return {
            id: o.offer_daily_id || `DO-${o.id}`,
            daily_trip_id: o.daily_trip_id,
            title: o.offer_title || (trip ? `عرض: ${trip.title}` : "عرض رحلة يومية"),
            sub: o.description || (trip ? `خصم مميز ${discount}% على رحلة ${trip.title}.` : "عرض سياحي مميز لفترة محدودة."),
            oldPrice: String(basePrice),
            price: String(finalPrice),
            discountPercent: `${discount}%`,
            tag: o.badge || `خصم ${discount}%`,
            img: primaryImg,
            gallery: [primaryImg, ...(trip?.images || [])],
            kind: "daily" as const,
            departure: trip?.departure ? `مكتب ${trip.departure}` : (o.departure_city ? `مكتب ${o.departure_city}` : "مكتب طرابلس"),
            perk: `🎯 يشمل برنامج الجولة المتكامل مع مرشد سياحي ونقل مريح`,
            schedules: [
              {
                id: `sch-${o.offer_daily_id}`,
                date: trip?.daysOfWeek || "أيام الرحلة المحددة",
                time: "09:00 ص",
                seats: trip?.availableSeats || 20,
                taken: 0,
                guide: trip?.guide?.name || "مرشد سياحي معتمد",
                price: finalPrice,
              }
            ],
          } as any;
        });

        // Map live Weekly Trip Offers from DelniDB
        const mappedWeeklyOffers: TripOffer[] = (Array.isArray(resWeeklyOffers) ? resWeeklyOffers : []).map((w: any) => {
          const trip = mappedWeekly.find((t) => t.id === w.weekly_trip_id);
          const basePrice = Number(w.seat_per_price || trip?.seatPrice || 1500);
          const discount = Number(w.discount_percentage) || 15;
          const finalPrice = Math.round(basePrice * (1 - discount / 100));
          const primaryImg = trip?.img || w.offer_image_url || destUbariGaberoun;

          return {
            id: w.offer_weekly_id || `WO-${w.id}`,
            weekly_trip_id: w.weekly_trip_id,
            title: w.offer_title || (trip ? `عرض أسبوعي: ${trip.title}` : "عرض رحلة أسبوعية"),
            sub: w.description || (trip ? `خصم استثنائي ${discount}% على رحلة ${trip.title} شاملة الإقامة والتنقل.` : "برنامج أسبوعي استكشافي متكامل."),
            oldPrice: String(basePrice),
            price: String(finalPrice),
            discountPercent: `${discount}%`,
            tag: w.badge || `خصم ${discount}%`,
            img: primaryImg,
            gallery: [primaryImg, ...(trip?.images || [])],
            kind: "weekly" as const,
            departure: trip?.departure ? `مكتب ${trip.departure}` : (w.departure_city ? `مكتب ${w.departure_city}` : "مكتب طرابلس"),
            perk: `🏨 شامل الإقامة الفندقية والمخيمات ووجبات البرنامج والمركبات السياحية`,
            schedules: [
              {
                id: `sch-${w.offer_weekly_id}`,
                date: trip?.startDate ? `انطلاق: ${trip.startDate}` : "الجمعة القادمة",
                time: "08:00 ص",
                seats: trip?.availableSeats || 15,
                taken: 0,
                guide: trip?.guide?.name || "مرشد سياحي معتمد",
                price: finalPrice,
              }
            ],
          } as any;
        });

        const allCombinedTrips = [...mappedDaily, ...mappedWeekly];
        const allCombinedOffers = [...mappedDailyOffers, ...mappedWeeklyOffers];

        // Strict DB Synchronization: Show only real admin-created trips from DelniDB
        setLiveDbTrips(allCombinedTrips);
        setDbOffers(allCombinedOffers);
        try {
          if (typeof window !== "undefined") {
            if (allCombinedTrips.length > 0) {
              localStorage.setItem("dallani_cached_trips", JSON.stringify(allCombinedTrips));
            } else {
              localStorage.removeItem("dallani_cached_trips");
            }
            if (allCombinedOffers.length > 0) {
              localStorage.setItem("dallani_cached_offers", JSON.stringify(allCombinedOffers));
            } else {
              localStorage.removeItem("dallani_cached_offers");
            }
          }
        } catch {}
      } catch (err) {
        console.error("Failed to load live database trips:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDbTrips();
  }, []);

  const allTrips = useMemo(
    () => liveDbTrips,
    [liveDbTrips]
  );

  // Auto-detect and open trip if specified in URL query params
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tripParam = urlParams.get("tripId") || urlParams.get("trip") || urlParams.get("id");
      if (tripParam && allTrips.length > 0 && !activeTripDetails) {
        const found = allTrips.find((t) => t.id === tripParam || (t as any).daily_trip_id === tripParam || (t as any).weekly_trip_id === tripParam);
        if (found) {
          setActiveTripDetails(found);
          window.scrollTo({ top: 0, behavior: "instant" });
        }
      }
    } catch {}
  }, [allTrips, activeTripDetails]);

  const gallerySectionRef = useRef<HTMLElement>(null);

  const scrollToGallery = () => {
    setTimeout(() => {
      gallerySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const toggleType = (t: string) => {
    setSelectedTypes((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
    scrollToGallery();
  };

  const toggleDeparture = (dep: string) => {
    setSelectedDepartures((prev) =>
      prev.includes(dep) ? prev.filter((x) => x !== dep) : [...prev, dep]
    );
    scrollToGallery();
  };

  const resetFilters = () => {
    setSelectedTypes([]);
    setSelectedDepartures([]);
    setSearchInput("");
    setAppliedQuery("");
    setDateRange(null);
    scrollToGallery();
  };

  const filtered = useMemo(() => {
    return allTrips.filter((t) => {
      // Type Checkboxes Filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(t.type)) {
        return false;
      }
      // Departure Checkboxes Filter
      if (selectedDepartures.length > 0) {
        if (t.type === "daily" || t.type === "weekly") {
          if (!selectedDepartures.includes(t.departure)) return false;
        }
      }
      // Period Filter: a daily trip with a run date inside it, a weekly trip running at any time inside it
      // (one that started before the period and is still running counts too)
      if (dateRange) {
        const inRange = (d: string) => (!dateRange.from || d >= dateRange.from) && (!dateRange.to || d <= dateRange.to);
        if (t.type === "daily") {
          if (!(t.openDates || []).some(inRange)) return false;
        } else if (t.type === "weekly") {
          const start = (t.startDate || "").slice(0, 10);
          const end = (t.endDate || t.startDate || "").slice(0, 10);
          if (!start || (dateRange.to && start > dateRange.to) || (dateRange.from && end < dateRange.from)) return false;
        } else {
          return false;
        }
      }
      // Search Query Filter
      const q = appliedQuery.toLowerCase().trim();
      if (q) {
        const attractionsText =
          "attractions" in t && t.attractions
            ? t.attractions.map((a) => `${a.name} ${a.description}`).join(" ")
            : "";
        const guideText =
          "guide" in t && t.guide ? `${t.guide.name} ${t.guide.title}` : "";
        const vehicleText =
          "vehicle" in t && t.vehicle
            ? `${t.vehicle.model} ${t.vehicle.company} ${t.vehicle.driver}`
            : "";
        const hay =
          `${t.title} ${t.description} ${"departure" in t ? t.departure : ""} ${attractionsText} ${guideText} ${vehicleText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allTrips, selectedTypes, selectedDepartures, appliedQuery, dateRange]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedQuery(searchInput);
    scrollToGallery();
  };

  // If a trip is selected for full details, render the Dedicated Full View
  if (activeTripDetails) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A]" dir={dir}>
        <TripDetailsView
          trip={activeTripDetails}
          onBack={() => {
            // Drop ?trip= from the address too, otherwise the effect that opens a linked trip reopens it at once
            const url = new URL(window.location.href);
            ["tripId", "trip", "id"].forEach((k) => url.searchParams.delete(k));
            window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
            setActiveTripDetails(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onBook={() => {
            if (activeTripDetails.type === "private") {
              setPrivateOpen(true);
              return;
            }
            setSelectedBookingTrip(activeTripDetails);
            setScheduleKind(activeTripDetails.type);
            setScheduleTripTitle(activeTripDetails.title);
            setScheduleTripImage(activeTripDetails.img);
            setCustomSchedules((activeTripDetails as any).schedules);
          }}
          onOpenGuideCV={(cvData) => setSelectedGuideCV(cvData)}
          onOpenVehicleDetails={(vData) => setSelectedVehicle(vData)}
        />

        {/* Modals & Components */}
        <GuideCVModal
          open={!!selectedGuideCV}
          onClose={() => setSelectedGuideCV(null)}
          guide={selectedGuideCV}
          onSelectForPrivateTrip={() => {
            setSelectedGuideCV(null);
            setPrivateOpen(true);
          }}
        />

        <VehicleDetailsModal
          onClose={() => setSelectedVehicle(null)}
          vehicle={selectedVehicle}
        />

        <TripScheduleModal
          open={!!scheduleKind}
          onClose={() => {
            setScheduleKind(null);
            setScheduleTripTitle(undefined);
            setScheduleTripImage(undefined);
            setCustomSchedules(undefined);
            setSelectedBookingTrip(null);
          }}
          kind={scheduleKind}
          trip={selectedBookingTrip || activeTripDetails}
          tripId={(selectedBookingTrip || activeTripDetails)?.id}
          tripTitle={scheduleTripTitle || (selectedBookingTrip || activeTripDetails)?.title}
          customTitle={scheduleTripTitle || (selectedBookingTrip || activeTripDetails)?.title}
          customImage={scheduleTripImage || (selectedBookingTrip || activeTripDetails)?.img}
          customPrice={
            (selectedBookingTrip || activeTripDetails)?.type === "daily"
              ? ((selectedBookingTrip || activeTripDetails) as DailyTrip)?.price
              : (selectedBookingTrip || activeTripDetails)?.type === "weekly"
              ? ((selectedBookingTrip || activeTripDetails) as WeeklyTrip)?.seatPrice
              : undefined
          }
          customSchedules={customSchedules}
        />

        <PrivateTripModal
          open={privateOpen}
          onClose={() => setPrivateOpen(false)}
        />

        <Footer />
      </div>
    );
  }

  const hasActiveFilters =
    selectedTypes.length > 0 ||
    selectedDepartures.length > 0 ||
    appliedQuery.trim() !== "";

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A]" dir={dir}>
      <Header active="trips" />

      {/* Hero Banner - Professional Animated Slideshow */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#0F172A]">
        <HeroSlideshow
          images={[
            // Trips use their own photos (the landmarks page uses different ones)
            "/assets/libya/ubari-lake-dunes.jpg",
            "/assets/libya/sabratha-turquoise-sea.jpg",
            "/assets/libya/acacus-pillar.jpg",
            "/assets/libya/ghadames-spring.jpg",
            "/assets/libya/ubari-palm-lake.jpg",
            "/assets/libya/nalut-red-sky.jpg",
            "/assets/libya/sabratha-bay.jpg",
            "/assets/libya/ubari-oasis-dunes.jpg",
            "/assets/libya/leptis-aerial-green.jpg",
          ]}
          alt="الرحلات السياحية في ليبيا"
          brightness="brightness-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent z-10" />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-12 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit mb-2 text-amber-300 border border-white/30 shadow-md">
            <span>🧭</span>
            <span>{isAr ? "اكتشف دروب ليبيا الساحرة" : "Discover Libya's Enchanting Paths"}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-md tracking-tight leading-tight">
            {isAr ? "الرحلات والتجارب السياحية المنظمة" : "All Organized Tours & Expeditions"}
          </h1>
          <p className="mt-2 text-white/95 max-w-2xl text-xs sm:text-sm font-semibold leading-relaxed drop-shadow-md">
            {isAr
              ? "استكشف المرشد السياحي المكلف والمركبات الناقلة والسائق لكل رحلة، مع تفحص السيرة الذاتية وفحص السلامة الفنية."
              : "Integrated connection between transport, certified tour guides, driver inspection, and destinations."}
          </p>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. FILTER PANEL (Floating Gracefully Over Hero Bottom)       */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-md border border-[#E8E2D6] text-[#0F172A] space-y-4">
          
          {dateRange && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-black text-emerald-800">
              <span>
                📅 {isAr ? "الرحلات التي تنطلق" : "Trips running"}
                {dateRange.from ? (isAr ? ` من ${dateRange.from}` : ` from ${dateRange.from}`) : ""}
                {dateRange.to ? (isAr ? ` إلى ${dateRange.to}` : ` to ${dateRange.to}`) : ""}
              </span>
              <button type="button" onClick={() => setDateRange(null)} className="px-3 h-7 rounded-lg bg-white border border-emerald-200 hover:bg-emerald-100 cursor-pointer">
                {isAr ? "إلغاء فلتر التاريخ ✕" : "Clear dates ✕"}
              </button>
            </div>
          )}
          {/* Top Bar: Search Input & Result Count */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="bg-[#FAF7F2] p-2.5 px-3.5 rounded-2xl border border-[#E8E2D6] flex items-center gap-2.5 shadow-xs focus-within:border-[#00736F] focus-within:bg-white transition">
                <span className="text-[#00736F] font-black text-sm">🔍</span>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => {
                    setSearchInput(e.target.value);
                    setAppliedQuery(e.target.value);
                  }}
                  placeholder={
                    isAr
                      ? "ابحث باسم الرحلة، المرشد، المركبة، المعلم الأثري..."
                      : "Search by tour, guide, vehicle or attraction..."
                  }
                  className="w-full text-xs sm:text-sm font-bold text-[#0F172A] outline-none bg-transparent placeholder:text-slate-400"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchInput("");
                      setAppliedQuery("");
                    }}
                    className="text-xs font-black text-slate-400 hover:text-slate-700 px-1"
                  >
                    ✕
                  </button>
                )}
              </div>
            </form>

            {/* Counter & Reset Actions */}
            <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">


              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs font-black text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl border border-red-200 transition cursor-pointer flex items-center gap-1"
                >
                  <span>↺</span>
                  <span>{isAr ? "إلغاء التحديد" : "Reset"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Checkboxes Section: Trip Types & Departure Cities */}
          <div className="pt-3 border-t border-[#E8E2D6] grid grid-cols-1 lg:grid-cols-2 gap-4">
            
            {/* 1. Trip Type Checkboxes */}
            <div className="space-y-2">
              <span className="text-xs font-black text-[#00736F] flex items-center gap-1.5">
                <span>🗓️</span>
                <span>{isAr ? "نوع الرحلة (حدد نوع أو أكثر):" : "Tour Type:"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "daily", label: isAr ? "رحلات يومية" : "Daily Tours", icon: "☀️", count: allTrips.filter(t => t.type === "daily").length },
                  { id: "weekly", label: isAr ? "رحلات أسبوعية" : "Weekly Tours", icon: "🗺️", count: allTrips.filter(t => t.type === "weekly").length },
                ].map((item) => {
                  const isChecked = selectedTypes.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleType(item.id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer border select-none ${
                        isChecked
                          ? "bg-[#00736F] text-white border-[#00736F] shadow-sm"
                          : "bg-[#FAF7F2] text-[#0B4F57] border-[#E8E2D6] hover:bg-white hover:border-[#00736F]/40"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                          isChecked
                            ? "bg-white text-[#00736F] border-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <svg className="w-3 h-3 stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                          isChecked ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Departure City Checkboxes */}
            <div className="space-y-2">
              <span className="text-xs font-black text-[#00736F] flex items-center gap-1.5">
                <span>📍</span>
                <span>{isAr ? "مدينة الانطلاق:" : "Departure City:"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    id: "طرابلس",
                    label: isAr ? "طرابلس" : "Tripoli",
                    count: allTrips.filter((t) => "departure" in t && t.departure === "طرابلس").length,
                  },
                  {
                    id: "بنغازي",
                    label: isAr ? "بنغازي" : "Benghazi",
                    count: allTrips.filter((t) => "departure" in t && t.departure === "بنغازي").length,
                  },
                ].map((item) => {
                  const isChecked = selectedDepartures.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleDeparture(item.id)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer border select-none ${
                        isChecked
                          ? "bg-[#0B4F57] text-white border-[#0B4F57] shadow-sm"
                          : "bg-[#FAF7F2] text-[#0B4F57] border-[#E8E2D6] hover:bg-white hover:border-[#0B4F57]/40"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                          isChecked
                            ? "bg-white text-[#0B4F57] border-white"
                            : "border-slate-300 bg-white text-transparent"
                        }`}
                      >
                        <svg className="w-3 h-3 stroke-current stroke-[3]" viewBox="0 0 24 24" fill="none">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span>📍</span>
                      <span>{item.label}</span>
                      <span
                        className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                          isChecked ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>



      {/* ============================================================ */}
      {/* 3. SPECIAL OFFERS SPOTLIGHT (LIVE DELNIDB OFFERS)            */}
      {/* ============================================================ */}
      {dbOffers.length > 0 && (
        <SpecialOffersSpotlight
          offers={dbOffers}
          onDetails={(offer) => {
            // Navigate to the linked trip by ID (daily_trip_id / weekly_trip_id stored in offer)
            const linkedTripId = (offer as any).daily_trip_id || (offer as any).weekly_trip_id;
            let matchingTrip: Trip | undefined;
            if (linkedTripId) {
              matchingTrip = allTrips.find((t) => t.id === linkedTripId);
            }
            // Fallback: fuzzy title match
            if (!matchingTrip) {
              const cleanTitle = offer.title.replace("عرض ", "").replace("رحلة ", "").trim();
              matchingTrip = allTrips.find((t) =>
                t.title.includes(cleanTitle) || cleanTitle.includes(t.title) ||
                ("cities" in t && t.cities.some((c) => offer.title.includes(c)))
              ) || allTrips[0];
            }
            if (matchingTrip) {
              setActiveTripDetails(matchingTrip);
              window.scrollTo({ top: 0, behavior: "instant" });
            }
          }}
          onBook={(offer) => {
            if (offer.schedules && offer.schedules.length > 0) {
              setScheduleKind(offer.kind);
              setScheduleTripTitle(offer.title);
              setScheduleTripImage(offer.img);
              setCustomSchedules(offer.schedules);
            } else {
              modals.openBooking({
                title: offer.title,
                subtitle: offer.sub,
                image: offer.img,
                price: Number(offer.price.replace(/,/g, "")),
              });
            }
          }}
        />
      )}

      {/* ============================================================ */}
      {/* 4. OUR GALLERY: STAGGERED TRIP CARDS SHOWCASE (IMAGE 1)      */}
      {/* ============================================================ */}
      <section ref={gallerySectionRef} id="trips-gallery" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-14 scroll-mt-24">
        {/* Header with Centered Title & Orange Styling */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {isAr ? "الرحلات المتاحة" : "Available trips"}
          </h3>
        </div>

        {/* Scroll controls only when there is something to scroll */}
        <div className={`${filtered.length === 0 ? "hidden" : "flex"} items-center justify-between mb-4 px-2`}>
          <span className="text-xs font-black text-[#D96B27] bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200">
            {isAr ? `${filtered.length} رحلة` : `${filtered.length} trips`}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollHorizontally("left")}
              className="w-11 h-11 rounded-full bg-[#D96B27] hover:bg-[#c25a1b] text-white flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition cursor-pointer"
              aria-label={isAr ? "السابق" : "Previous"}
              title={isAr ? "تحريك لليسار" : "Scroll Left"}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollHorizontally("right")}
              className="w-11 h-11 rounded-full bg-[#D96B27] hover:bg-[#c25a1b] text-white flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition cursor-pointer"
              aria-label={isAr ? "التالي" : "Next"}
              title={isAr ? "تحريك لليمين" : "Scroll Right"}
            >
              →
            </button>
          </div>
        </div>

        {/* Floating open cards container */}
        <div className="relative py-6 overflow-visible">

          <div
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pt-6 pb-20 px-4 items-center relative z-10"
          >
            {filtered.map((t, idx) => {
              // Find if this trip has an active offer
              const tripOffer = dbOffers.find((o) =>
                (o.kind === "daily" && (o as any).daily_trip_id === t.id) ||
                (o.kind === "weekly" && (o as any).weekly_trip_id === t.id)
              );
              return (
                <div key={t.id} className="shrink-0">
                  <TripCard
                    t={t}
                    index={idx}
                    offer={tripOffer}
                    onDetails={() => {
                      setActiveTripDetails(t);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    onBook={() => {
                      if (t.type === "private") {
                        setPrivateOpen(true);
                        return;
                      }
                      setSelectedBookingTrip(t);
                      setScheduleKind(t.type);
                      setScheduleTripTitle(t.title);
                      setScheduleTripImage(t.img);
                      setCustomSchedules((t as any).schedules);
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Loading Skeletons when fetching initial data */}
        {isLoading && filtered.length === 0 && (
          <div className="flex gap-6 overflow-x-auto no-scrollbar py-6 px-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="w-[320px] sm:w-[350px] shrink-0 rounded-3xl bg-white border border-[#E8E2D6] p-4 space-y-4 shadow-sm animate-pulse"
              >
                <div className="w-full h-52 bg-slate-200 rounded-2xl" />
                <div className="flex justify-between items-center">
                  <div className="w-20 h-5 bg-slate-200 rounded-full" />
                  <div className="w-16 h-5 bg-slate-200 rounded-full" />
                </div>
                <div className="w-3/4 h-6 bg-slate-200 rounded-lg" />
                <div className="w-full h-4 bg-slate-100 rounded" />
                <div className="w-2/3 h-4 bg-slate-100 rounded" />
                <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                  <div className="w-24 h-7 bg-slate-200 rounded-xl" />
                  <div className="w-20 h-7 bg-slate-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && allTrips.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D6] shadow-sm my-8">
            <div className="text-4xl mb-3">🧭</div>
            <h3 className="text-lg font-black text-[#00736F] mb-1">
              {isAr ? "لا توجد رحلات سياحية مجدولة حالياً" : "No Scheduled Tours Available Yet"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto mb-4">
              {isAr
                ? "سيتم إدراج الرحلات اليومية والأسبوعية هنا فور قيام إدارة المنصة بإنشائها ونشرها. يمكنك أيضاً طلب رحلة خاصة مخصصة بالكامل."
                : "Trips created by the administration will appear here live. You can also design your own custom private tour."}
            </p>
            <button
              type="button"
              onClick={() => setPrivateOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-[#D96B27] text-white text-xs font-black shadow-md cursor-pointer hover:brightness-105 transition"
            >
              {isAr ? "تصميم رحلة خاصة مخصصة ✨" : "Design Custom Private Tour ✨"}
            </button>
          </div>
        )}

        {!isLoading && allTrips.length > 0 && filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D6] shadow-sm my-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-black text-[#00736F] mb-1">
              {isAr ? "لا توجد رحلات تطابق هذا التحديد" : "No Trips Matched Your Filter"}
            </h3>
            <p className="text-xs text-slate-500 font-semibold max-w-md mx-auto mb-4">
              {isAr
                ? "جرب تعديل خيارات التحديد أو اختيار مدينة انطلاق أخرى لعرض الرحلات المتاحة."
                : "Try adjusting your checkbox selections or choosing another departure city."}
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="px-5 py-2.5 rounded-xl bg-[#00736F] text-white text-xs font-black shadow-md cursor-pointer hover:bg-[#0B4F57] transition"
            >
              {isAr ? "إظهار جميع الرحلات" : "Show All Trips"}
            </button>
          </div>
        )}
      </section>

      {/* ============================================================ */}
      {/* 5. COMPACT NEARBY HOTELS & RESTAURANTS FINDER                */}
      {/* ============================================================ */}
      <CompactLocationHotelsFinder />

      {/* ============================================================ */}
      {/* 6. CUSTOM PRIVATE TRIP VIP CALLOUT BOX (USER BUILDS IT)      */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="rounded-3xl bg-[#0B132B] text-white p-6 sm:p-10 shadow-md border border-white/20 relative overflow-hidden">
          {/* Decorative background accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#D96B27]/25 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-[#00736F]/40 to-transparent rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center lg:text-right max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black">
                <span>✨</span>
                <span>{isAr ? "خدمة الـ VIP والرحلات الخاصة المخصصة" : "VIP & Customized Private Expeditions"}</span>
              </div>
              <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug">
                {isAr
                  ? "صمّم رحلتك الخاصة بنفسك بحرية تامة ووفق جدولك"
                  : "Design your bespoke private trip freely tailored for you and your family"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {isAr
                  ? "أنت من يحدد مسار الرحلة والوجهات التي ترغب بزيارتها، وتاريخ الانطلاق، ونوع شركة النقل، والمرشد السياحي المعتمد الذي ترغب بمرافقته. نحن نتولى التنفيذ بكل احترافية."
                  : "You define the route, destinations, departure dates, transport company, and personal certified guide. We execute every detail to perfection."}
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setPrivateOpen(true)}
                className="px-8 py-4 rounded-2xl bg-[#D96B27] text-white font-black text-sm sm:text-base shadow-md hover:shadow-md hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-2.5 border border-amber-300/40"
              >
                <span>🧭</span>
                <span>{isAr ? "صمّم رحلتك الخاصة الآن" : "Build Your Private Trip Now"}</span>
                <span className="text-lg">✨</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modals & Components */}
      <GuideCVModal
        open={!!selectedGuideCV}
        onClose={() => setSelectedGuideCV(null)}
        guide={selectedGuideCV}
        onSelectForPrivateTrip={() => {
          setSelectedGuideCV(null);
          setPrivateOpen(true);
        }}
      />

      <VehicleDetailsModal
        onClose={() => setSelectedVehicle(null)}
        vehicle={selectedVehicle}
      />

      <DetailsModal
        open={!!modals.detailsItem}
        onClose={modals.closeDetails}
        item={modals.detailsItem}
        onBook={() => {
          const item = modals.detailsItem;
          modals.bookFromDetails((title, subtitle) => {
            if (subtitle && (subtitle.includes("خاصة") || subtitle.includes("Private"))) {
              setPrivateOpen(true);
            } else {
              setScheduleKind(subtitle && subtitle.includes("أسبوعية") ? "weekly" : "daily");
              setScheduleTripTitle(item?.title || title);
              setScheduleTripImage(item?.image);
              setCustomSchedules(item?.schedules);
            }
          });
        }}
      />

      <BookingModal
        open={!!modals.bookingItem}
        onClose={modals.closeBooking}
        item={modals.bookingItem}
      />

      <TripScheduleModal
        open={!!scheduleKind}
        onClose={() => {
          setScheduleKind(null);
          setScheduleTripTitle(undefined);
          setScheduleTripImage(undefined);
          setCustomSchedules(undefined);
          setSelectedBookingTrip(null);
        }}
        kind={scheduleKind}
        trip={selectedBookingTrip}
        tripId={selectedBookingTrip?.id}
        tripTitle={scheduleTripTitle || selectedBookingTrip?.title}
        customTitle={scheduleTripTitle || selectedBookingTrip?.title}
        customImage={scheduleTripImage || selectedBookingTrip?.img}
        customPrice={
          selectedBookingTrip?.type === "daily"
            ? (selectedBookingTrip as DailyTrip)?.price
            : selectedBookingTrip?.type === "weekly"
            ? (selectedBookingTrip as WeeklyTrip)?.seatPrice
            : undefined
        }
        customSchedules={customSchedules}
      />

      <PrivateTripModal open={privateOpen} onClose={() => setPrivateOpen(false)} />

      <TripVideoTrailerModal
        isOpen={!!trailerModalTripId}
        tripId={trailerModalTripId || "d1"}
        onClose={() => setTrailerModalTripId(null)}
      />

      <Footer />
    </div>
  );
}

function buildDetails(t: Trip, lang: "ar" | "en" = "ar"): DetailsItem {
  const isAr = lang === "ar";
  if (t.type === "daily") {
    return {
      title: t.title,
      subtitle: isAr ? "رحلة يومية" : "Daily Tour",
      image: t.img,
      description: t.description,
      price: t.price,
      currency: isAr ? "د.ل / مقعد" : "LYD / seat",
      bookable: true,
      refId: t.id,
      vehicle: t.vehicle ? {
        model: t.vehicle.model,
        company: t.vehicle.company,
        driver: t.vehicle.driver,
      } : undefined,
      guide: t.guide ? {
        name: t.guide.name,
        title: t.guide.title,
        phone: t.guide.phone,
      } : undefined,
      info: [
        { label: isAr ? "نوع الرحلة" : "Tour Type", value: isAr ? "يومية" : "Daily" },
        { label: isAr ? "نقطة الانطلاق" : "Departure", value: t.departure },
        { label: isAr ? "السعة القصوى" : "Max Capacity", value: isAr ? `${t.targetPersons} مقعد` : `${t.targetPersons} seats` },
        { label: isAr ? "المقاعد المتاحة" : "Available Seats", value: isAr ? `${t.availableSeats} مقعد` : `${t.availableSeats} seats` },
      ],
      features: [],
    };
  }

  if (t.type === "weekly") {
    return {
      title: t.title,
      subtitle: isAr ? "رحلة أسبوعية" : "Weekly Tour",
      image: t.img,
      description: t.description,
      price: t.seatPrice,
      currency: isAr ? "د.ل / مقعد" : "LYD / seat",
      bookable: true,
      refId: t.id,
      vehicle: t.vehicle ? {
        model: t.vehicle.model,
        company: t.vehicle.company,
        driver: t.vehicle.driver,
      } : undefined,
      guide: t.guide ? {
        name: t.guide.name,
        title: t.guide.title,
        phone: t.guide.phone,
      } : undefined,
      info: [
        { label: isAr ? "تاريخ البداية" : "Start Date", value: t.startDate || "" },
        { label: isAr ? "تاريخ النهاية" : "End Date", value: t.endDate || "" },
        { label: isAr ? "نقطة الانطلاق" : "Departure", value: t.departure },
        { label: isAr ? "السعة القصوى" : "Max Capacity", value: isAr ? `${t.targetPersons} مقعد` : `${t.targetPersons} seats` },
        { label: isAr ? "المقاعد المتاحة" : "Available Seats", value: isAr ? `${t.availableSeats} مقعد` : `${t.availableSeats} seats` },
      ],
      features: [],
    };
  }

  return {
    title: t.title,
    subtitle: isAr ? "رحلة خاصة" : "Private Custom Tour",
    image: t.img,
    description: t.description,
    bookable: true,
    refId: t.id,
    info: [
      { label: isAr ? "المدة المقترحة" : "Suggested Duration", value: t.sampleDays || "" },
      { label: isAr ? "ملاحظة" : "Note", value: t.note || "" },
    ],
  };
}

/* ============================================================ */
/* TRIP CARD: UNCLUTTERED, ELEGANT & FOCUSED                    */
/* ============================================================ */
function TripCard({
  t,
  index = 0,
  offer,
  onDetails,
  onBook,
}: {
  t: Trip;
  index?: number;
  offer?: TripOffer;
  onDetails: () => void;
  onBook: () => void;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const seatsAvailable = "availableSeats" in t ? t.availableSeats : undefined;
  const targetPersons = "targetPersons" in t ? t.targetPersons : undefined;
  const tripImages = useMemo(() => getTripImages(t), [t]);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev - 1 + tripImages.length) % tripImages.length);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImgIndex((prev) => (prev + 1) % tripImages.length);
  };

  // Alternating staggered offsets like the gallery showcase in Image 1
  const staggerClasses = [
    "lg:translate-y-0",
    "lg:translate-y-3",
    "lg:-translate-y-4",
    "lg:translate-y-2",
    "lg:-translate-y-2",
    "lg:translate-y-4",
  ];
  const stagger = staggerClasses[index % staggerClasses.length];

  return (
    <article
      onClick={onDetails}
      className={`group relative w-[290px] sm:w-[315px] min-w-[290px] sm:min-w-[315px] h-[450px] sm:h-[480px] rounded-[34px] overflow-hidden shadow-lg hover:shadow-lg transition duration-300 cursor-pointer select-none flex flex-col justify-between ${stagger}`}
    >
      {/* Photo Background: Single Clean Photo for Daily Trips, 5 Navigable Transition Photos for Weekly Trips */}
      {t.type === "weekly" ? (
        <>
          {tripImages.map((imgSrc, i) => (
            <img
              key={i}
              src={imgSrc}
              alt={`${t.title} - ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-100 contrast-100 ${
                i === activeImgIndex ? "opacity-100 z-0 scale-100" : "opacity-0 -z-10 pointer-events-none"
              }`}
            />
          ))}

          {/* Prev / Next 5-Image Navigation Arrows on Card Sides for Weekly Trips */}
          <button
            type="button"
            onClick={handlePrevImage}
            aria-label="Previous Image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-25 w-8 h-8 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:scale-110 active:scale-95 cursor-pointer text-base font-bold select-none"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextImage}
            aria-label="Next Image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-25 w-8 h-8 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md hover:scale-110 active:scale-95 cursor-pointer text-base font-bold select-none"
          >
            ›
          </button>
        </>
      ) : (
        /* Daily Trips: One single clean primary photo on card face */
        <img
          src={t.img || tripImages[0]}
          alt={t.title}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 brightness-100 contrast-100 z-0"
        />
      )}

      {/* Clean Subtle Gradient for High Contrast Typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/30 pointer-events-none z-5" />

      {/* Offer Badge — shown when this trip has an active offer */}
      {offer && (
        <div className="absolute top-16 left-0 z-20 pointer-events-none">
          <div className="ps-3 pe-4 py-2 rounded-e-2xl bg-gradient-to-l from-[#E11D48] to-[#D96B27] text-white shadow-md">
            <div className="text-[11px] font-bold text-white/85 leading-none">{isAr ? "عرض لفترة محدودة" : "Limited offer"}</div>
            <div className="text-xl font-black leading-tight">{isAr ? `خصم ${offer.discountPercent}` : `${offer.discountPercent} OFF`}</div>
          </div>
        </div>
      )}

      {/* Top Floating Badges & Image Indicators */}
      <div className="relative z-10 p-5 pb-2 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white font-black text-xs shadow-md border border-white/25">
            {t.type === "daily"
              ? (isAr ? "☀️ رحلة يومية" : "☀️ Daily Tour")
              : (isAr ? "🗓️ أسبوعية" : "🗓️ Weekly")}
          </span>
          <FavoriteButton
            itemType={t.type === "weekly" ? "weekly_trip" : "daily_trip"}
            itemId={t.id}
            itemTitle={t.title}
            size="sm"
          />
        </div>

        {t.type === "weekly" ? (
          /* 5-Image Dots / Indicator for Weekly Trips (5 images navigate) */
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/25 shadow-md">
            {tripImages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImgIndex(i);
                }}
                aria-label={`الصورة ${i + 1}`}
                className={`transition rounded-full cursor-pointer ${
                  i === activeImgIndex
                    ? "w-3.5 h-1.5 bg-amber-400"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
            <span className="text-[11px] text-amber-300 font-black ml-1 select-none">
              {activeImgIndex + 1}/5
            </span>
          </div>
        ) : null}
      </div>

      {/* Bottom Floating Information: Title, Departure, Seats, Price, Action */}
      <div className="relative z-10 p-5 pt-0 flex flex-col justify-end text-white">
        {/* Departure & Seats Tag */}
        <div className="flex items-center justify-between gap-1.5 mb-1.5 text-[11px] text-amber-300 font-black">
          <span className="flex items-center gap-1 truncate">
            <span>📍</span>
            <span>
              {"departure" in t
                ? (isAr ? `انطلاق من ${t.departure}` : `Departs from ${t.departure}`)
                : (isAr ? "جميع الوجهات" : "All Destinations")}
            </span>
          </span>

          {seatsAvailable !== undefined && targetPersons !== undefined && (
            <span className={`shrink-0 text-[11px] px-2.5 py-0.5 rounded-full font-black backdrop-blur-md border ${
              seatsAvailable <= 0
                ? "bg-red-600/90 text-white border-red-400/40 animate-pulse"
                : "bg-white/25 text-white border-white/20"
            }`}>
              {seatsAvailable <= 0
                ? (isAr ? "مكتملة بالكامل" : "Fully Booked")
                : (isAr ? `متبقي ${seatsAvailable} مقاعد` : `${seatsAvailable} left`)}
            </span>
          )}
        </div>

        {/* Operating Days for Daily Trips */}
        {t.type === "daily" && "daysOfWeek" in t && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[11px] font-black backdrop-blur-xs">
              <span>🗓️</span>
              <span>{isAr ? `أيام الانطلاق: ${(t as any).daysOfWeek}` : `Days: ${(t as any).daysOfWeek}`}</span>
            </span>
          </div>
        )}

        {/* Big Clear Title */}
        <h3 className="font-black text-white text-lg sm:text-xl leading-snug drop-shadow-md group-hover:text-amber-300 transition-colors mb-3">
          {t.title}
        </h3>

        {/* Divider & Bottom Actions */}
        <div className="pt-3 border-t border-white/25 flex items-center justify-between gap-2">
          {/* Price Tag */}
          <div>
            {t.type === "daily" && (
              <div>
                <div className="text-[11px] text-white/70 font-semibold">{isAr ? "سعر المقعد" : "Seat Price"}</div>
                {offer ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-amber-300">
                        {offer.price} <span className="text-xs font-bold text-white/80">{isAr ? "د.ل" : "LYD"}</span>
                      </span>
                      <span className="text-sm font-bold text-white/60 line-through">{offer.oldPrice}</span>
                    </div>
                    <div className="text-[11px] font-black text-emerald-300">
                      {isAr ? `وفّر ${Number(offer.oldPrice) - Number(offer.price)} د.ل` : `Save ${Number(offer.oldPrice) - Number(offer.price)} LYD`}
                    </div>
                  </>
                ) : (
                  <div className="text-lg font-black text-amber-300">
                    {t.price} <span className="text-xs font-bold text-white/80">{isAr ? "د.ل" : "LYD"}</span>
                  </div>
                )}
              </div>
            )}
            {t.type === "weekly" && (
              <div>
                <div className="text-[11px] text-white/70 font-semibold">{isAr ? "شامل الإقامة" : "All Inclusive"}</div>
                {offer && <div className="text-sm font-bold text-white/60 line-through leading-none">{offer.oldPrice}</div>}
                <div className="text-lg font-black text-amber-300">
                  {offer ? offer.price : t.seatPrice} <span className="text-xs font-bold text-white/80">{isAr ? "د.ل" : "LYD"}</span>
                </div>
              </div>
            )}
            {t.type === "private" && (
              <div>
                <div className="text-[11px] text-white/70 font-semibold">{isAr ? "المدة المقترحة" : "Duration"}</div>
                <div className="text-sm font-black text-amber-300">{t.sampleDays}</div>
              </div>
            )}
          </div>

          {/* Action Buttons: Details + Direct Booking if seats available */}
          <div className="flex items-center gap-1.5">
            {seatsAvailable !== undefined && seatsAvailable > 0 && t.type !== "private" && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
                className="py-1.5 px-3 rounded-xl bg-[#D96B27] hover:bg-[#c25a1b] text-white font-black text-xs transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 shadow-md"
                title={isAr ? "حجز مقعد الآن" : "Book Seat"}
              >
                <span>🪑</span>
                <span>{isAr ? "حجز" : "Book"}</span>
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDetails();
              }}
              className="py-1.5 px-3 rounded-xl bg-white/20 hover:bg-white/35 border border-white/60 text-white font-black text-xs transition flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <span>{isAr ? "التفاصيل" : "Details"}</span>
              <span className="text-xs">➔</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
