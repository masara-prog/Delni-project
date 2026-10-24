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
import { VehicleDetailsModal, VehicleData } from "@/components/VehicleDetailsModal";
import { Footer } from "@/components/Footer";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { 
  apiGetDailyTrips, 
  apiGetWeeklyTrips, 
  apiGetHotels, 
  apiGetRestaurants, 
  apiGetDailyOffers, 
  apiGetWeeklyOffers 
} from "@/lib/api";
import { UtensilsCrossed } from "lucide-react";

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
};

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
  upcomingDepartures?: { date: string; weekday: string; departure_time: string; remaining: number }[];
  departure: "طرابلس" | "بنغازي";
  entertainment?: string;
  guide: {
    name: string;
    title: string;
    phone: string;
    cv?: GuideCVData;
  };
  vehicle: {
    model: string;
    company: string;
    driver: string;
    plateNumber?: string;
    driverPhone?: string;
    capacity?: number;
    year?: number;
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
  guide: {
    name: string;
    title: string;
    phone: string;
    cv?: GuideCVData;
  };
  vehicle: {
    model: string;
    company: string;
    driver: string;
    plateNumber?: string;
    driverPhone?: string;
    capacity?: number;
    year?: number;
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

const nearbyPlaces: NearbyPlace[] = [
  // طرابلس
  {
    id: "np-t1",
    name: "فندق باب البحر وكورنثيا طرابلس",
    category: "hotel",
    city: "طرابلس",
    area: "طريق الشط - قرب الميناء والمدينة القديمة",
    img: "/assets/ai_city.jpg",
    rating: 4.9,
    phone: "0213352999",
    priceNote: "ابتداءً من 480 د.ل / الليلة",
    perk: "خصم 20% خاص برواد رحلات دلّني",
  },
  {
    id: "np-t2",
    name: "أجنحة النوفليين الفندقية المجهزة",
    category: "apartment",
    city: "طرابلس",
    area: "النوفليين - بجوار نقطة انطلاق الرحلات مباشرة",
    img: "/assets/ai_city.jpg",
    rating: 4.8,
    phone: "0914445522",
    priceNote: "شقق فندقية عائلية 320 د.ل",
    perk: "موقع استراتيجي عند نقطة التجمع والانطلاق",
  },
  {
    id: "np-t3",
    name: "منتجع راديسون المهاري والواجهة البحرية",
    category: "resort",
    city: "طرابلس",
    area: "الواجهة البحرية - طريق الشط",
    img: "/assets/ai_city.jpg",
    rating: 4.85,
    phone: "0213407878",
    priceNote: "غرف وأجنحة مطلة 450 د.ل",
    perk: "إفطار بوفيه مجاني مع حجز الرحلة",
  },
  {
    id: "np-t4",
    name: "نزل السراي العتيق بالمدينة القديمة",
    category: "heritage",
    city: "طرابلس",
    area: "زنقة الفرنسيس - المدينة القديمة",
    img: "/assets/ai_city.jpg",
    rating: 4.92,
    phone: "0925556611",
    priceNote: "نُزل تراثي معماري 240 د.ل",
    perk: "أصالة تاريخية وجولات مشي مجانية",
  },
  {
    id: "np-t5",
    name: "مطعم الحوش للتراث والمأكولات الشعبية",
    category: "restaurant",
    city: "طرابلس",
    area: "المدينة القديمة - قرب قوس ماركوس",
    img: "/assets/ai_city.jpg",
    rating: 4.95,
    phone: "0914445566",
    priceNote: "وجبات شعبية وبازين وكسكسي",
    perk: "وجبة غداء مشمولة في الرحلة اليومية",
  },
  {
    id: "np-t6",
    name: "مقهى زنقة الفندق التاريخي للشاي باللوز",
    category: "cafe",
    city: "طرابلس",
    area: "المدينة القديمة - زنقة الفندق",
    img: "/assets/ai_city.jpg",
    rating: 4.9,
    phone: "0927778899",
    priceNote: "شاي باللوز برغوته وحلويات مقروض",
    perk: "استراحة شاي مجانية لرواد الرحلة",
  },

  // بنغازي
  {
    id: "np-b1",
    name: "فندق تيبستي العريق بنغازي",
    category: "hotel",
    city: "بنغازي",
    area: "ميدان الشجرة - وسط بنغازي",
    img: "/assets/ai_city.jpg",
    rating: 4.75,
    phone: "0619092211",
    priceNote: "ابتداءً من 350 د.ل / الليلة",
    perk: "خصم 20% لحاملي تذاكر رحلات دلّني",
  },
  {
    id: "np-b2",
    name: "أجنحة فينيسيا الفندقية الحديثة",
    category: "apartment",
    city: "بنغازي",
    area: "شارع فينيسيا - بجوار مقر انطلاق الرحلات مباشرة",
    img: "/assets/ai_city.jpg",
    rating: 4.88,
    phone: "0923334411",
    priceNote: "شقق فندقية مجهزة 290 د.ل",
    perk: "موقع ملاصق لمكتب الانطلاق بشارع فينيسيا",
  },
  {
    id: "np-b3",
    name: "منتجع شاطئ النخيل السياحي",
    category: "resort",
    city: "بنغازي",
    area: "الساحل الشمالي - الصابري",
    img: "/assets/ai_city.jpg",
    rating: 4.8,
    phone: "0918889900",
    priceNote: "شاليهات عائلية 380 د.ل",
    perk: "أجواء بحرية ومسابح عائلية",
  },
  {
    id: "np-b4",
    name: "مطعم ومشاوي عروس الجبل",
    category: "restaurant",
    city: "بنغازي",
    area: "شارع فينيسيا",
    img: "/assets/ai_city.jpg",
    rating: 4.9,
    phone: "0912227788",
    priceNote: "مشويات لحم وطني وأطباق شرقية",
    perk: "غداء مشمول برحلات المنطقة الشرقية",
  },
  {
    id: "np-b5",
    name: "مقهى ريتاج الفاخر والجلسات الهادئة",
    category: "cafe",
    city: "بنغازي",
    area: "شارع فينيسيا - قرب الدائري",
    img: "/assets/ai_ruins.jpg",
    rating: 4.85,
    phone: "0926661122",
    priceNote: "قهوة مختصة وشاي منعنع وحلويات",
    perk: "خصم 15% لرواد المنصة",
  },

  // الخمس / لبدة
  {
    id: "np-k1",
    name: "فندق ومنتجع لبدة السياحي المطل",
    category: "hotel",
    city: "الخمس",
    area: "الخمس - على مقربة من آثار لبدة الكبرى",
    img: "/assets/ai_ruins.jpg",
    rating: 4.8,
    phone: "0536224411",
    priceNote: "غرف سياحية 260 د.ل",
    perk: "خصم 20% لعملاء رحلة لبدة",
  },
  {
    id: "np-k2",
    name: "شقق كورنيش الخمس البحرية",
    category: "apartment",
    city: "الخمس",
    area: "كورنيش الخمس الساحلي",
    img: "/assets/ai_ruins.jpg",
    rating: 4.7,
    phone: "0913337722",
    priceNote: "أجنحة وشقق 220 د.ل",
    perk: "إطلالة مباشرة على البحر",
  },
  {
    id: "np-k3",
    name: "مطعم القلعة للمأكولات البحرية الطازجة",
    category: "restaurant",
    city: "الخمس",
    area: "شاطئ الخمس - قرب مسرح لبدة",
    img: "/assets/ai_ruins.jpg",
    rating: 4.92,
    phone: "0925558833",
    priceNote: "أسماك طازجة من صيد اليوم",
    perk: "وجبة غداء مشمولة في رحلة لبدة الكبرى",
  },
  {
    id: "np-k4",
    name: "كافيه واحة لبدة الأثرية",
    category: "cafe",
    city: "الخمس",
    area: "مدخل مدينة لبدة الرومانية",
    img: "/assets/ai_ruins.jpg",
    rating: 4.75,
    phone: "0917774433",
    priceNote: "عصائر طبيعية وشاي باللوز",
    perk: "جلسات مريحة قبل انطلاق الجولة الميدانية",
  },

  // شحات / الجبل الأخضر
  {
    id: "np-s1",
    name: "منتجع قورينا الجبلي الفاخر",
    category: "resort",
    city: "شحات",
    area: "قمم شحات المطلة على البحر المتوسط",
    img: "/assets/ai_ruins.jpg",
    rating: 4.95,
    phone: "0684623344",
    priceNote: "أجنحة جبلية فاخرة 420 د.ل",
    perk: "إطلالة ساحرة على معبد أبولو والبحر",
  },
  {
    id: "np-s2",
    name: "نزل صنوبر الجبل التراثي",
    category: "heritage",
    city: "شحات",
    area: "غابات المنصورة - الجبل الأخضر",
    img: "/assets/ai_ruins.jpg",
    rating: 4.88,
    phone: "0914449911",
    priceNote: "أكواخ صنوبر دافئة 280 د.ل",
    perk: "خصم 20% وإفطار جبلي بلدي",
  },
  {
    id: "np-s3",
    name: "مطعم ومشاوي نبع الحمام الوطني",
    category: "restaurant",
    city: "شحات",
    area: "شحات - قرب عين قورينا التاريخية",
    img: "/assets/ai_ruins.jpg",
    rating: 4.9,
    phone: "0928883355",
    priceNote: "لحم وطني مشوي ومأكولات جبلية",
    perk: "غداء مشمول بالرحلة مع جلسات غابات",
  },
  {
    id: "np-s4",
    name: "كافيه مطل قورينا البانورامي",
    category: "cafe",
    city: "شحات",
    area: "شرفات الجبل الأخضر المطلة على أبولونيا",
    img: "/assets/ai_ruins.jpg",
    rating: 4.85,
    phone: "0915556622",
    priceNote: "جلسات قهوة وغروب ساحرة ومميزة",
    perk: "خصم 15% لعملاء رحلة قورينا",
  },

  // غدامس
  {
    id: "np-g1",
    name: "فندق ونزل عين الفرس السياحي",
    category: "hotel",
    city: "غدامس",
    area: "مدخل الواحة وعين الفرس الأسطورية",
    img: "/assets/ai_ruins.jpg",
    rating: 4.85,
    phone: "0484622200",
    priceNote: "غرف تراثية مكيفة 250 د.ل",
    perk: "إقامة مشمولة بالرحلة الأسبوعية",
  },
  {
    id: "np-g2",
    name: "نزل دار تيلفين الطيني التراثي",
    category: "heritage",
    city: "غدامس",
    area: "قلب المدينة القديمة المسقوفة",
    img: "/assets/ai_ghadames.jpg",
    rating: 4.95,
    phone: "0918883344",
    priceNote: "بيوت طينية تقليدية عريقة 220 د.ل",
    perk: "معايشة تراثية حقيقية لليونسكو",
  },
  {
    id: "np-g3",
    name: "مطعم ومضافة الواحة التراثية",
    category: "restaurant",
    city: "غدامس",
    area: "شارع النخيل - غدامس",
    img: "/assets/ai_ghadames.jpg",
    rating: 4.9,
    phone: "0924441177",
    priceNote: "وجبات غدامسية (فتات، بازين، كسكسي)",
    perk: "وجبات يومية مشمولة بالبرنامج",
  },
  {
    id: "np-g4",
    name: "مقهى ساحة الظل التقليدي",
    category: "cafe",
    city: "غدامس",
    area: "أزقة غدامس المسقوفة",
    img: "/assets/ai_ghadames.jpg",
    rating: 4.8,
    phone: "0912226688",
    priceNote: "شاي الواحة بالحبق والتمور الغدامسية",
    perk: "جلسات واحات أصيلة ومجانية للوفد",
  },

  // أوباري / فزان
  {
    id: "np-u1",
    name: "مخيم تدرارت أكاكوس الصحراوي الملكي",
    category: "resort",
    city: "أوباري",
    area: "بين الكثبان الذهبية وجبال أكاكوس",
    img: destAcacusArch,
    rating: 4.98,
    phone: "0916664422",
    priceNote: "خيام ملكية مجهزة بالكامل 380 د.ل",
    perk: "شامل وجبات الشواء وسهرات الفلكلور",
  },
  {
    id: "np-u2",
    name: "نزل بحيرة قبر عون الصحراوي",
    category: "heritage",
    city: "أوباري",
    area: "شاطئ بحيرة قبر عون المحاطة بالنخيل",
    img: destUbariGaberoun,
    rating: 4.9,
    phone: "0927773311",
    priceNote: "جلسات وأكواخ صحراوية 200 د.ل",
    perk: "سباحة في البحيرة المالحة وتزلج رملي",
  },
  {
    id: "np-u3",
    name: "مطعم المائدة الصحراوية والمندي الفزاني",
    category: "restaurant",
    city: "أوباري",
    area: "أوباري المركز - طريق سبها",
    img: destUbariUmmAlMaa,
    rating: 4.88,
    phone: "0919992255",
    priceNote: "مندي ولحم حنيد وشواء مدفون",
    perk: "وجبات مشمولة ببرنامج سفاري الصحراء",
  },
  {
    id: "np-u4",
    name: "خيمة الشاي الطوارقي تحت النجوم",
    category: "cafe",
    city: "أوباري",
    area: "كثبان أوباري العالية",
    img: destSaharaDunes,
    rating: 4.95,
    phone: "0921118844",
    priceNote: "شاي أخضر طوارقي على الجمر برغوة ثلاثية",
    perk: "سهرات نار وموسيقى تيناريوين مجاناً",
  },

  // صبراتة
  {
    id: "np-sb1",
    name: "فندق صبراتة السياحي المطل على البحر",
    category: "hotel",
    city: "صبراتة",
    area: "كورنيش صبراتة - بجوار الآثار الفينيقية",
    img: "/assets/ai_ruins.jpg",
    rating: 4.8,
    phone: "0246221199",
    priceNote: "غرف بحرية مريحة 240 د.ل",
    perk: "خصم 20% لحاملي تذاكر الرحلة",
  },
  {
    id: "np-sb2",
    name: "شقق ومنتجع شاطئ تليل العائلي",
    category: "apartment",
    city: "صبراتة",
    area: "شاطئ تليل السياحي",
    img: "/assets/ai_ruins.jpg",
    rating: 4.75,
    phone: "0913332266",
    priceNote: "شقق وشاليهات بحرية 290 د.ل",
    perk: "جلسات عائلية وشاطئ رملي نظيف",
  },
  {
    id: "np-sb3",
    name: "مطعم مرسى الصيادين للأسماك الطازجة",
    category: "restaurant",
    city: "صبراتة",
    area: "ميناء وممشى صبراتة القديم",
    img: "/assets/ai_ruins.jpg",
    rating: 4.92,
    phone: "0924449933",
    priceNote: "أطباق سمك دنديس ووقار مشوي",
    perk: "وجبة غداء بحرية مشمولة في رحلة صبراتة",
  },
  {
    id: "np-sb4",
    name: "مقهى واجهة المسرح الروماني",
    category: "cafe",
    city: "صبراتة",
    area: "بوابة المسرح الروماني المطلة على البحر",
    img: "/assets/ai_ruins.jpg",
    rating: 4.82,
    phone: "0918884477",
    priceNote: "شاي وقهوة ومثلجات",
    perk: "إطلالة مباشرة على أعمدة المسرح والغروب",
  },
];

// Live trips loaded dynamically from DelniDB SQL Server (static mock trips removed)
const dailyTrips: DailyTrip[] = [];
const weeklyTrips: WeeklyTrip[] = [];

const privateTemplates: PrivateTemplate[] = [
  {
    id: "p1",
    type: "private",
    title: "رحلة رجال الأعمال والوفود المخصصة",
    img: destAcacusArch,
    description: "تصميم مسار خاص وحصري وفق جداول الأعمال والوفود مع مرشد محترف وسيارات VIP وفاخرة.",
    sampleDays: "حسب الطلب",
    note: "إمكانية اختيار المرشد والسيارة والفنادق بدقة متناهية.",
  },
  {
    id: "p2",
    type: "private",
    title: "رحلة شهر العسل والاسترخاء الساحلي",
    img: privateTripImg,
    description: "تجربة رومانسية على الساحل الليبي: فنادق 5 نجوم، سيارة VIP بسائق، وجولات هادئة في طرابلس ولبدة.",
    sampleDays: "4 - 7 أيام",
    note: "يصلك رد مفصل بخطة الرحلة والسعر خلال أقل من 24 ساعة.",
  },
];

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

  const itinerary = customSteps || (t.type === "daily" ? [
    {
      time: "09:00 ص",
      title: isAr ? "نقطة التجمع والانطلاق من موقعنا" : "Assembly & Departure",
      desc: isAr ? `التجمع في ${departurePoint} والصعود للمركبة السياحية المجهزة والانطلاق في تمام 09:00 صباحاً.` : `Gather at ${departurePoint} and depart sharply at 09:00 AM.`
    },
    {
      time: "10:30 ص",
      title: isAr ? "الجولة الميدانية الأولى واستكشاف المعالم الأثرية" : "Morning Historical Walking Tour",
      desc: isAr ? "استكشاف المعالم الرئيسية رفقة المرشد السياحي المعتمد مع شرح تاريخي موثق." : "Guided exploration of primary landmarks with deep historical insights."
    },
    {
      time: "01:30 م",
      title: isAr ? "استراحة وتناول وجبة الغداء التراثية المشمولة" : "Authentic Lunch Gathering",
      desc: isAr
        ? (restaurantName
            ? `تناول وجبة غداء ليبية تقليدية كاملة في ${restaurantName} (${restaurantData?.city || departurePoint}) مشمولة بالكامل بالرحلة.`
            : "تناول وجبة غداء ليبية تقليدية كاملة (أطباق رئيسية، سلطات طازجة، عصائر، ومياه معدنية) في مطعم تراثي معتمد مشمول بالرحلة.")
        : "Complete traditional Libyan meal with fresh salads and beverages included in the tour."
    },
    {
      time: "04:30 م",
      title: isAr ? "جولة المعالم الترفيهية والطبيعية / حديقة الحيوان" : "Scenic & Zoo Visit",
      desc: isAr ? "زيارة حديقة الحيوان أو المعالم الطبيعية والساحلية، وأخذ صور تذكارية في أجواء مريحة وممتعة." : "Visit scenic local parks, zoo, or coastal promenades."
    },
    {
      time: "07:00 م",
      title: isAr ? "استراحة ضيافة وتذوق ووقت حر للتسوق" : "Local Hospitality & Souk Shopping",
      desc: isAr ? "استراحة ضيافة وتذوق حلويات تقليدية، مع وقت مخصص لشراء التذكارات والصناعات اليدوية." : "Traditional hospitality break and free time for artisanal shopping."
    },
    {
      time: "09:00 م",
      title: isAr ? "العودة وختام الرحلة في نقطة الانطلاق" : "Return & Tour Conclusion",
      desc: isAr ? `العودة بسلامة الله بالمركبة السياحية إلى ${departurePoint} في تمام الساعة 09:00 مساءً.` : `Safe return back to ${departurePoint} sharply at 09:00 PM.`
    }
  ] : [
    {
      time: "08:30 ص",
      title: isAr ? "نقطة التجمع والانطلاق من موقعنا" : "Assembly & Departure",
      desc: isAr ? `التجمع عند: ${departurePoint} والصعود للمركبة السياحية المجهزة.` : `Meet at ${departurePoint} and board the VIP transport.`
    },
    {
      time: "10:00 ص",
      title: isAr ? "انطلاق المسار الاستكشافي والمعالم الأولى" : "Expedition Path",
      desc: isAr ? "بدء البرنامج الاستكشافي المجدول رفقة المرشد السياحي وسيارات الدفع الرباعي أو الحافلة." : "Expedition kickoff with guides."
    },
    {
      time: "02:00 م",
      title: isAr ? "وجبة الغداء والاستراحة" : "Lunch & Rest",
      desc: isAr
        ? (restaurantName ? `تناول وجبة غداء تراثية شهية مشمولة في ${restaurantName}.` : "تناول وجبة غداء تراثية شهية مشمولة في البرنامج.")
        : "Traditional meal included in program."
    },
    {
      time: "05:00 م",
      title: isAr ? "المسار المسائي / التخييم أو الإقامة" : "Evening Program",
      desc: isAr ? "الوصول لمكان الإقامة المعتمد أو المخيم الصحراوي الفاخر والاستمتاع بأجواء الغروب." : "Arrival at lodge or luxury camp."
    },
    {
      time: "08:30 م",
      title: isAr ? "العشاء وجلسة السمر الفلكلورية" : "Dinner & Campfire",
      desc: isAr ? "وجبة عشاء مشويات مع شاي طوارقي وجلسة فلكلورية تحت النجوم." : "Dinner and folklore tea under the stars."
    }
  ]);

  const vehicle = "vehicle" in t && t.vehicle ? {
    model: t.vehicle.model,
    company: t.vehicle.company,
    driver: t.vehicle.driver,
    plateNumber: t.vehicle.plateNumber,
    driverPhone: t.vehicle.driverPhone,
    capacity: t.vehicle.capacity || totalSeats,
  } : {
    model: "مرسيدس سبرينتر سياحي VIP مكيف ومجهز",
    company: "شركة السهم الذهبي للنقل السياحي",
    driver: "الكابتن علي الرجباني",
    plateNumber: "طرابلس 4222",
    driverPhone: "0915647786",
    capacity: 25,
  };

  const guide = "guide" in t && t.guide ? t.guide : {
    name: "أ. محمد الفيتوري",
    title: "مرشد سياحي معتمد من هيئة السياحة",
    phone: "+218 91 333 4455"
  };

  const priceFormatted = t.type === "daily" ? `${t.price} د.ل` : t.type === "weekly" ? `${t.seatPrice} د.ل` : t.sampleDays;

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
  onOpenVehicleDetails?: (v: VehicleData) => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const info = getTripFullInfo(trip, isAr);

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

  const filteredHotels = useMemo(() => {
    if (platformHotels.length === 0) return [];
    const assigned = platformHotels.filter(
      (h) => (trip as any).hotel_ids?.includes(h.hotel_id) || (trip as any).hotel_id === h.hotel_id
    );
    if (assigned.length > 0) return assigned;

    const matched = platformHotels.filter((h) => {
      const hCity = String(h.city || h.address || h.hotel_name || "").toLowerCase();
      return destinationKeywords.some((kw) => kw.includes(hCity) || hCity.includes(kw));
    });
    return matched.slice(0, 4);
  }, [platformHotels, destinationKeywords, trip]);

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

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] pb-20 relative" dir={dir}>
      {/* 1. Sleek Full-Width Panoramic Image Slideshow Banner with Elegant Ken Burns Motion */}
      <div className="w-full relative h-[360px] sm:h-[460px] lg:h-[540px] bg-slate-950 overflow-hidden shadow-lg group">
        {/* Stacked animated city images with crossfade & elegant Ken Burns motion */}
        {cityImages.map((imgSrc, idx) => (
          <div
            key={idx}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: idx === activeSlide ? 1 : 0, zIndex: idx === activeSlide ? 2 : 1 }}
          >
            <img
              src={imgSrc}
              alt={`${trip.title} - ${idx + 1}`}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
                idx === activeSlide ? KB_CLASSES[idx % KB_CLASSES.length] : "scale-100"
              }`}
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src !== heroImg) {
                  target.src = heroImg;
                }
              }}
            />
          </div>
        ))}

        {/* Clean subtle bottom gradient for text contrast only */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent z-10 pointer-events-none" />

        {/* Prev / Next Manual Navigation Arrows on Banner ONLY if multiple images */}
        {cityImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev - 1 + cityImages.length) % cityImages.length)}
              aria-label="Previous Slide"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-25 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/25 flex items-center justify-center text-xl transition opacity-0 group-hover:opacity-100 shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => setActiveSlide((prev) => (prev + 1) % cityImages.length)}
              aria-label="Next Slide"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-25 w-10 h-10 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/25 flex items-center justify-center text-xl transition opacity-0 group-hover:opacity-100 shadow-md cursor-pointer hover:scale-105 active:scale-95"
            >
              ›
            </button>

            {/* Slide indicator dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/45 backdrop-blur-md border border-white/20">
              {cityImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveSlide(idx)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    idx === activeSlide
                      ? "w-5 h-1.5 bg-amber-400 shadow-md"
                      : "w-1.5 h-1.5 bg-white/45 hover:bg-white/75"
                  }`}
                  aria-label={`الصورة ${idx + 1}`}
                />
              ))}
              <span className="text-[10px] text-white/90 font-bold ml-1 font-mono">
                {activeSlide + 1}/{cityImages.length}
              </span>
            </div>
          </>
        )}

        {/* Floating Top Luxury Glass Navigation Bar with High Contrast & Clear Exit Button */}
        <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-5 flex items-center justify-between gap-3 pointer-events-none">
          {/* Back/Exit Button: Highly Visible, High-Contrast Luxury Glass Button */}
          <button
            type="button"
            onClick={onBack}
            className="pointer-events-auto group px-4 sm:px-5 py-2.5 rounded-2xl bg-white/95 hover:bg-white text-slate-900 font-black text-xs sm:text-sm shadow-[0_8px_30px_rgb(0,0,0,0.4)] backdrop-blur-md border-2 border-[#D96B27]/40 hover:border-[#D96B27] flex items-center gap-2.5 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer ring-4 ring-black/20"
            title={isAr ? "العودة إلى قائمة الرحلات" : "Back to Tours"}
          >
            <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#D96B27] to-[#EA580C] text-white flex items-center justify-center text-sm font-black shadow-md transition-transform group-hover:-translate-x-1">
              {dir === "rtl" ? "➔" : "←"}
            </span>
            <div className="flex flex-col text-right leading-tight">
              <span className="text-[#003580] font-black">{isAr ? "العودة لقائمة الرحلات" : "Back to Tours"}</span>
              <span className="text-[10px] text-[#D96B27] font-bold">{isAr ? "خروج وتصفح المزيد" : "Exit & Browse"}</span>
            </div>
          </button>

          {/* Dallani Tourism Center Brand Badge */}
          <div className="pointer-events-auto hidden md:inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-black/65 backdrop-blur-md border border-amber-500/30 text-white font-black text-xs shadow-xl">
            <span className="text-amber-400 text-base">🧭</span>
            <span className="tracking-wide">{isAr ? "منصة دلّني للسياحة والتجارب الليبية" : "Dallani Tourism Experiences"}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
          </div>

          {/* Tour Type & Live Availability Status Badge */}
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#003580]/90 to-[#1B5A78]/90 text-white text-xs font-black shadow-xl backdrop-blur-md border border-white/20 flex items-center gap-1.5">
              <span>{trip.type === "daily" ? "☀️" : trip.type === "weekly" ? "🗓️" : "👑"}</span>
              <span>
                {trip.type === "daily"
                  ? (isAr ? "رحلة يومية" : "Daily Tour")
                  : trip.type === "weekly"
                  ? (isAr ? "رحلة أسبوعية" : "Weekly Tour")
                  : (isAr ? "رحلة خاصة VIP" : "Private Tour")}
              </span>
            </span>

            {info.availableSeats <= 0 ? (
              <span className="px-3.5 py-2 rounded-2xl bg-red-600/95 text-white text-xs font-black shadow-xl backdrop-blur-md border border-red-400/40 animate-pulse">
                {isAr ? "مكتملة الحجز" : "Fully Booked"}
              </span>
            ) : (
              <span className="hidden sm:inline-flex px-3.5 py-2 rounded-2xl bg-emerald-950/80 backdrop-blur-md border border-emerald-400/40 text-emerald-300 text-xs font-black shadow-xl">
                {isAr ? `متبقي ${info.availableSeats} مقاعد` : `${info.availableSeats} seats left`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Trip Header & Key Highlights Section with Elegant Orange Top Border */}
      <div className="bg-white border-b border-[#E8E2D6] border-t-4 border-t-[#D96B27] py-6 sm:py-8 shadow-xs relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#EBF3FF] text-[#003580] text-xs font-black border border-blue-100">
                  <span>📍</span>
                  <span>{info.departurePoint}</span>
                </span>
                {trip.type === "daily" && (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                      <span>⏰</span>
                      <span>{isAr ? "09:00 ص - 09:00 م (12 ساعة كاملة)" : "09:00 AM - 09:00 PM"}</span>
                    </span>
                    {"daysOfWeek" in trip && (
                      <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 text-[#003580] text-xs font-black border border-blue-200">
                        <span>🗓️</span>
                        <span>{isAr ? `أيام الانطلاق المحددة: ${(trip as any).daysOfWeek}` : `Days: ${(trip as any).daysOfWeek}`}</span>
                      </span>
                    )}
                  </>
                )}
                <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black border ${
                  info.availableSeats <= 0
                    ? "bg-red-50 text-red-800 border-red-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}>
                  <span>🪑</span>
                  <span>
                    {info.availableSeats <= 0
                      ? (isAr ? "الرحلة مكتملة المقاعد" : "Fully Booked")
                      : (isAr ? `متبقي ${info.availableSeats} مقاعد` : `${info.availableSeats} seats left`)}
                  </span>
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0F172A] tracking-tight">
                {trip.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D6] shrink-0">
              <div>
                <div className="text-[11px] text-slate-400 font-bold">{isAr ? "السعر للمقعد شامل" : "All inclusive price"}</div>
                <div className="text-2xl sm:text-3xl font-black text-[#003580]">{info.priceFormatted}</div>
              </div>
              <button
                type="button"
                disabled={info.availableSeats <= 0}
                onClick={onBook}
                className={`px-6 py-3.5 rounded-xl font-black text-sm shadow-md transition flex items-center gap-2 ${
                  info.availableSeats <= 0
                    ? "bg-stone-300 text-stone-500 cursor-not-allowed border border-stone-400"
                    : "bg-[#D96B27] hover:bg-[#c25a1b] text-white cursor-pointer hover:shadow-lg active:scale-95"
                }`}
              >
                <span>
                  {info.availableSeats <= 0
                    ? (isAr ? "مكتملة بالكامل" : "Fully Booked")
                    : trip.type === "private"
                    ? (isAr ? "طلب تصميم الرحلة" : "Request Custom Tour")
                    : (isAr ? "حجز مقعدك الآن" : "Book Your Seat")}
                </span>
                {info.availableSeats > 0 && <span>➔</span>}
              </button>
            </div>
          </div>
        </div>
      </div>



      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Right Main Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 1. Seats Progress Bar Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#E8E2D6] shadow-sm">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs sm:text-sm font-black text-[#003580] flex items-center gap-2">
                  <span>🪑</span>
                  <span>{isAr ? "حالة حجز المقاعد المتاحة في الرحلة:" : "Trip Seats Availability:"}</span>
                </span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  info.availableSeats <= 0
                    ? "text-red-700 bg-red-50 border-red-200 animate-pulse"
                    : "text-emerald-700 bg-emerald-50 border-emerald-200"
                }`}>
                  {info.availableSeats <= 0
                    ? (isAr ? "الرحلة مكتملة بالكامل (0 مقاعد متبقية)" : "Fully booked - 0 seats left")
                    : (isAr ? `متبقي ${info.availableSeats} مقاعد فقط للحجز!` : `Only ${info.availableSeats} seats left!`)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 mb-2">
                <div
                  className="h-full bg-gradient-to-r from-[#003580] to-emerald-600 rounded-full transition-all duration-300"
                  style={{ width: `${info.percentBooked}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 font-bold">
                <span>{isAr ? `تم حجز ${info.bookedSeats} مقعد` : `${info.bookedSeats} seats booked`}</span>
                <span>{isAr ? `إجمالي سعة الرحلة: ${info.totalSeats} مقعد` : `Total Capacity: ${info.totalSeats} seats`}</span>
              </div>
            </div>

            {/* 2. Realistic Description Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF3FF] text-[#003580] text-xs font-black border border-blue-100">
                <span>📖</span>
                <span>{isAr ? "نبذة وتفاصيل الرحلة الواقعية" : "Detailed Trip Overview"}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-snug">
                {isAr ? "برنامج وتفاصيل الجولة السياحية الميدانية:" : "Tour Program & Field Experience:"}
              </h2>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#E8E2D6]">
                {info.realisticOverview}
              </p>

              {/* Departure Feature Chip */}
              <div className="pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="font-black text-xs text-[#0F172A]">{isAr ? "نقطة وموعد الانطلاق بدقة" : "Exact Departure Point"}</div>
                    <div className="text-xs text-slate-600 font-medium mt-0.5">
                      {info.departurePoint}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Itinerary Timeline Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#003580] flex items-center gap-2">
                    <span>⏱️</span>
                    <span>{isAr ? "محطات وخط سير الرحلة خطوة بخطوة" : "Step-by-Step Itinerary Timeline"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isAr ? (trip.type === "daily" ? "مواعيد الرحلة اليومية المنظمة: من 09:00 صباحاً حتى 09:00 مساءً بدقة" : "مواعيد منظمة تضمن قضاء وقت ممتع واستكشاف حقيقي دون إرهاق") : "Paced schedule for maximum comfort & discovery"}
                  </p>
                </div>
              </div>

              <div className="space-y-4 relative before:absolute before:inset-0 before:left-auto before:right-3.5 before:w-0.5 before:bg-[#E8E2D6] pt-2">
                {info.itinerary.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-4 pr-9">
                    <div className="absolute right-1 top-1 w-5 h-5 rounded-full bg-[#003580] text-white flex items-center justify-center text-[10px] font-black shadow-xs ring-4 ring-white">
                      {idx + 1}
                    </div>

                    <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E8E2D6] flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h4 className="font-black text-sm text-[#0F172A]">{step.title}</h4>
                        <span className="text-xs font-black text-[#003580] bg-white px-2.5 py-0.5 rounded-lg border border-blue-100">
                          {step.time}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>



            {/* 4. Included Attractions & City Landmarks (Weekly Trips only — Daily trips visit 1 landmark/city) */}
            {trip.type !== "daily" && "attractions" in trip && trip.attractions && trip.attractions.length > 0 && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-4">
                <h3 className="text-lg font-black text-[#003580] flex items-center gap-2">
                  <span>🏛️</span>
                  <span>{isAr ? "أبرز المعالم المشمولة في الزيارة:" : "Included Heritage Landmarks:"}</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {trip.attractions.map((attr, aIdx) => (
                    <div key={aIdx} className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6]">
                      <div className="font-black text-sm text-[#0F172A] mb-1">{attr.name}</div>
                      <div className="text-[11px] text-[#003580] font-bold mb-1.5">📍 {attr.location}</div>
                      <div className="text-xs text-slate-600 font-medium leading-relaxed">{attr.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Recommended Accommodations & Stays (Weekly Tours with overnight stay only — Daily trips have no stay) */}
            {trip.type !== "daily" && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-[#003580] flex items-center gap-2">
                      <span>🏨</span>
                      <span>
                        {isAr ? "فنادق وأماكن الإقامة المشمولة في برنامج الرحلة الأسبوعية:" : "Included Accommodations & Hotels for Weekly Tour:"}
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
                    className="text-xs font-black text-[#003580] hover:underline flex items-center gap-1"
                  >
                    <span>{isAr ? "استعراض جميع الفنادق" : "View All"}</span>
                    <span>➔</span>
                  </Link>
                </div>

                {filteredHotels.length > 0 ? (
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
                                <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                                  {isAr ? "مشمول بالرحلة ✓" : "Included ✓"}
                                </span>
                              </div>
                              <div className="text-xs text-amber-500 font-bold">
                                {"★".repeat(Math.min(5, Math.max(1, hStars)))} · {isAr ? `فندق ${hStars} نجوم` : `${hStars} Stars`}
                              </div>
                              <div className="text-[11px] text-[#003580] font-black mt-1">
                                📍 {hCity} {h.address_details || h.address ? `— ${h.address_details || h.address}` : ""}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D6]">
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
                              className="py-1.5 px-3 rounded-xl bg-[#003580] text-white font-black text-xs text-center transition"
                            >
                              {isAr ? "تفاصيل الفندق" : "Details"}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center text-xs font-bold text-slate-600 space-y-1">
                    <div>🏨 {isAr ? "أماكن الإقامة والفنادق المعتمدة يتم ترتيبها وتجهيزها في المعالم والمدن المزارة لهذه الرحلة." : "Accommodations are arranged directly within the destination landmarks."}</div>
                    <Link to="/hotels" className="text-[#003580] underline font-black inline-block mt-1">
                      {isAr ? "استعراض شبكة فنادق منصة دلّني في ليبيا ➔" : "Browse all partner hotels ➔"}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* 6. Partner Dining & Restaurants (Filtered by visited destinations) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#003580] flex items-center gap-2">
                    <span>🍽️</span>
                    <span>{isAr ? "المطاعم والمقاهي المتواجدة في المعالم المزارة والمشمولة بالرحلة:" : "Restaurants & Cafes in Visited Destinations:"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isAr
                      ? "وجبات وأطباق شعبية وضيافة قهوة وشاي في أرقى المطاعم المسجلة بالمنصة في المعالم المزارة"
                      : "Authentic local dining and hospitality in the visited landmarks"}
                  </p>
                </div>
                <Link
                  to="/restaurants"
                  className="text-xs font-black text-[#003580] hover:underline flex items-center gap-1"
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
                              <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
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
                        <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] text-xs font-bold text-[#003580]">
                          <span>📍 {rCity} {r.address_details || r.address ? `— ${r.address_details || r.address}` : ""}</span>
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
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
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
                    <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] text-xs font-bold text-[#003580]">
                      <span>📍 {info.restaurant.city || "طرابلس"} {info.restaurant.address ? `— ${info.restaurant.address}` : ""}</span>
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
              ) : (
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center text-xs font-bold text-slate-600 space-y-1">
                  <div>🍽️ {isAr ? "الوجبات والضيافة مشمولة ضمن البرنامج في المطاعم المتواجدة في المعالم المزارة." : "Dining and local hospitality are included in the visited landmarks."}</div>
                  <Link to="/restaurants" className="text-[#003580] underline font-black inline-block mt-1">
                    {isAr ? "استعراض دليل المطاعم والمقاهي في المنصة ➔" : "Browse all platform restaurants ➔"}
                  </Link>
                </div>
              )}

              {/* Promotional Partner Restaurants (Dismissible Box with ✕ exit button) */}
              {promoRestaurants.filter(r => !dismissedPromoIds.includes(r.id || r.facility_id)).length > 0 && (
                <div className="pt-4 border-t border-[#E8E2D6] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 text-sm">✨</span>
                      <h4 className="text-xs font-black text-slate-800">
                        {isAr ? "مقاهي ومطاعم مقترحة بالوجهة (ترويج — اضغط ✕ للإزالة):" : "Suggested Dining in Destination (Promo — Click ✕ to remove):"}
                      </h4>
                    </div>
                    <span className="text-[10px] text-amber-800 bg-amber-100 font-bold px-2 py-0.5 rounded-full">إعلانات ترويجية</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {promoRestaurants
                      .filter(r => !dismissedPromoIds.includes(r.id || r.facility_id))
                      .map((r, rIdx) => {
                        const rId = r.facility_id || r.id || String(rIdx);
                        const rName = r.facility_name || r.name || "مطعم ومقهى مميز";
                        const rImg = r.facility_image_1 || r.image || "/assets/restaurant-libya.jpg";
                        const rType = r.facility_type || r.type || "مطعم ومقهى";
                        const rCity = r.city || "ليبيا";
                        return (
                          <div
                            key={rId}
                            className="relative p-3.5 rounded-2xl bg-amber-50/40 border border-amber-200 hover:border-amber-300 transition shadow-xs group"
                          >
                            <button
                              type="button"
                              onClick={() => setDismissedPromoIds(prev => [...prev, rId])}
                              aria-label="إزالة الإعلان"
                              className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white flex items-center justify-center text-xs font-black text-slate-700 transition shadow-xs cursor-pointer z-10"
                              title={isAr ? "إزالة هذا الاقتراح الترويجي" : "Dismiss suggestion"}
                            >
                              ✕
                            </button>

                            <div className="flex items-start gap-3">
                              <img
                                src={rImg}
                                alt={rName}
                                className="w-14 h-14 rounded-xl object-cover border border-amber-200 shrink-0"
                              />
                              <div className="flex-1 min-w-0 pr-1">
                                <div className="flex items-center gap-1.5 mb-0.5">
                                  <span className="font-black text-xs text-[#0F172A] truncate">{rName}</span>
                                  <span className="text-[9px] font-black text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full shrink-0">
                                    {isAr ? "ترويج" : "Promo"}
                                  </span>
                                </div>
                                <div className="text-[10px] text-amber-800 font-bold">
                                  🍲 {rType}
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium truncate mt-0.5">
                                  📍 {rCity} {r.address_details || r.address ? `— ${r.address_details || r.address}` : ""}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Left Sidebar Column (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Quick Booking Box */}
            <div className="bg-gradient-to-b from-[#003580] to-[#0A2540] text-white rounded-3xl p-6 shadow-xl border border-white/20 sticky top-20 space-y-5">
              <div>
                <span className="text-[11px] font-bold text-amber-300 block mb-1">
                  {isAr ? "تأكيد المقاعد الفوري" : "Instant Seat Reservation"}
                </span>
                <div className="text-3xl font-black text-white">
                  {info.priceFormatted}
                </div>
                <div className="text-xs text-white/80 font-medium mt-1">
                  {isAr ? "يشمل النقل السياحي، التذاكر، وجبة الغداء، والمرشد المعتمد." : "Includes VIP transport, museum passes, lunch, and certified guide."}
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-2xl border border-white/15 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <span>{isAr ? "المقاعد المتبقية:" : "Available seats:"}</span>
                  <span className="text-amber-300 font-black">{info.availableSeats} {isAr ? "مقاعد" : "seats"}</span>
                </div>
                <div className="flex items-center justify-between font-bold">
                  <span>{isAr ? "مدينة الانطلاق:" : "Departure:"}</span>
                  <span className="text-white">{"departure" in trip ? trip.departure : "طرابلس"}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={info.availableSeats <= 0}
                onClick={onBook}
                className={`w-full py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 ${
                  info.availableSeats <= 0
                    ? "bg-stone-500/50 text-white/70 cursor-not-allowed border border-white/20"
                    : "bg-[#D96B27] hover:bg-[#c25a1b] text-white hover:shadow-xl cursor-pointer active:scale-98"
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
            <div className="bg-white rounded-3xl p-5 border border-[#E8E2D6] shadow-sm space-y-3">
              <span className="text-xs font-black text-[#003580] flex items-center gap-1.5">
                <span>🧭</span>
                <span>{isAr ? "المرشد السياحي المرافق:" : "Assigned Tour Guide:"}</span>
              </span>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-black text-[#0F172A] text-sm">{info.guide.name}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{info.guide.title}</div>
                  <div className="text-xs text-[#003580] font-bold mt-1">📞 {info.guide.phone}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenGuideCV?.((info.guide as any).cv || {
                  name: info.guide.name,
                  title: info.guide.title,
                  phone: info.guide.phone,
                  bio: `مرشد سياحي معتمد ومخصص لرحلة ${trip.title}.`,
                  licenseNumber: "G-8821",
                  experienceYears: 10,
                  rating: 4.9,
                  pricePerDay: 180,
                  specialties: ["إرشاد الرحلات", "التاريخ والآثار"],
                })}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-[#003580] font-black text-xs border border-[#E8E2D6] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>👨‍✈️</span>
                <span>{isAr ? "عرض السيرة الذاتية ورخصة الإرشاد" : "View Certified CV"}</span>
              </button>
            </div>

            {/* Vehicle & Driver Card (Directly below Tour Guide for all trips) */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8E2D6] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#003580] flex items-center gap-1.5">
                  <span>🚌</span>
                  <span>{isAr ? "مركبة وسائق الرحلة:" : "Trip Vehicle & Driver:"}</span>
                </span>
                <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {isAr ? "معتمدة ✓" : "Certified ✓"}
                </span>
              </div>

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
                  <span className="text-[#003580]">{info.vehicle.company}</span>
                  <span className="text-slate-400">·</span>
                  <span className="font-mono text-slate-700">{(info.vehicle.plateNumber || "").replace(/\?+/g, "").trim() || (isAr ? "لوحة معتمدة" : "Verified")}</span>
                </div>

                <div className="pt-1.5 border-t border-[#E8E2D6]/60 flex items-center justify-between text-xs">
                  <div className="font-bold text-slate-700 flex items-center gap-1">
                    <span>👨‍✈️</span>
                    <span>{info.vehicle.driver}</span>
                  </div>
                  {info.vehicle.driverPhone && (
                    <div className="text-[#003580] font-mono font-bold text-[11px]">
                      📞 {info.vehicle.driverPhone}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenVehicleDetails?.({
                  model: info.vehicle.model,
                  company: info.vehicle.company,
                  driver: info.vehicle.driver,
                  licensePlate: (info.vehicle.plateNumber || "").replace(/\?+/g, "").trim() || "ليبيا - 5-99214",
                  seats: info.vehicle.capacity,
                  phone: info.vehicle.driverPhone || "091-2345678",
                  features: [
                    "تكييف هوائي مركزي متطور",
                    "مقاعد مريحة مخصصة للجولات السياحية",
                    "حقيبة إسعافات أولية وطفاية حريق",
                    "شاشات عرض ونظام صوتي متكامل",
                    "سائق ذو خبرة ورخصة قيادة عمومية معتمدة"
                  ],
                })}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-[#003580] font-black text-xs border border-[#E8E2D6] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔍</span>
                <span>{isAr ? "معاينة تفاصيل المركبة والسائق" : "Inspect Vehicle & Driver"}</span>
              </button>
            </div>

          </div>

        </div>
      </div>

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
        className="bg-gradient-to-br from-[#FFF9F5] via-white to-[#FEF3EB] rounded-3xl p-6 sm:p-10 border-2 border-orange-100 shadow-xl relative overflow-hidden"
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
            className="relative w-full h-[300px] sm:h-[400px] rounded-[30px] overflow-hidden group shadow-2xl border-4 border-white cursor-pointer transition-all duration-500"
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
              <div className="absolute transform rotate-45 bg-gradient-to-r from-red-600 via-[#EA580C] to-[#D96B27] text-white font-black text-xl py-3 right-[-60px] top-[45px] w-[260px] text-center shadow-2xl border-b-4 border-white/40 drop-shadow-xl tracking-wide">
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
                    className="py-3 px-8 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-sm md:text-base shadow-lg transition cursor-pointer hover:scale-105 active:scale-95 flex items-center gap-2"
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
                className={`h-2.5 rounded-full transition-all cursor-pointer ${
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
      <div className="bg-gradient-to-r from-[#FFF8F3] via-white to-[#F6F9FD] rounded-3xl p-6 sm:p-8 border-2 border-[#E8E2D6] shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-6">
        
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
          <h3 className="text-lg sm:text-xl font-black text-[#003580] tracking-tight">
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
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#D96B27] via-[#EA580C] to-[#C25A1B] hover:brightness-110 text-white shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 border-2 border-orange-300/40 group relative"
            title={isAr ? "الانتقال إلى مطاعم وفنادق ليبيا" : "Explore Libya Stays & Dining"}
            aria-label={isAr ? "الانتقال إلى مطاعم وفنادق ليبيا" : "Explore Libya Stays & Dining"}
          >
            <UtensilsCrossed className="w-8 h-8 sm:w-10 sm:h-10 text-white drop-shadow-md group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
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
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleData | null>(null);

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
            description: t.description || `رحلة يومية تنطلق من ${t.departure_city || 'طرابلس'} باتجاه ${t.destination_city || 'المعلم الأثري'}.`,
            activities: t.activities ? (Array.isArray(t.activities) ? t.activities : String(t.activities).split(',')) : ["جولة ميدانية مع مرشد سياحي", "نقل سياحي مريح ومكيف", "شرح تاريخي وأثري متكامل"],
            attractions: [
              {
                name: t.destination_city || "المعلم الأثري",
                location: `${t.departure_city || 'طرابلس'} - ليبيا`,
                description: t.description || "معلم سياحي وتاريخي بارز يزخر بالتراث والأصالة الليبية العريقة.",
              }
            ],
            targetPersons: t.max_capacity || 25,
            // Seats are counted per departure day: show the best remaining count among upcoming departures.
            availableSeats: Array.isArray(t.upcoming_departures) && t.upcoming_departures.length > 0
              ? Math.max(...t.upcoming_departures.map((d: any) => Number(d.remaining) || 0))
              : 0,
            daysOfWeek: t.recurring_days || "",
            upcomingDepartures: Array.isArray(t.upcoming_departures) ? t.upcoming_departures : [],
            departure: (t.departure_city && t.departure_city.includes("بنغازي") ? "بنغازي" : "طرابلس") as "طرابلس" | "بنغازي",
            entertainment: "توقف واستراحة ضيافة، وجلسات تصوير تذكارية",
            guide: {
              name: t.guide_name || t.guide?.full_name || "لم يُعيَّن مرشد بعد",
              title: t.guide_title || t.guide?.title || "سيتم تعيين مرشد معتمد من الإدارة",
              phone: t.guide_phone || t.guide?.phone_number || "—",
              cv: {
                name: t.guide_name || t.guide?.full_name || "لم يُعيَّن مرشد بعد",
                title: t.guide_title || t.guide?.title || "سيتم تعيين مرشد معتمد من الإدارة",
                licenseNumber: t.guide_license_number || t.guide?.license_number || "—",
                experienceYears: Number(t.guide?.years_of_experience) || 0,
                rating: 5.0,
                pricePerDay: Number(t.guide?.price_per_day) || 0,
                phone: t.guide_phone || t.guide?.phone_number || "—",
                bio: t.guide?.bio || "مرشد سياحي معتمد ومختص بآثار لبدة الكبرى وصبراتة والمدن التاريخية.",
                specialties: ["إرشاد سياحي", "آثار ومعالم تاريخية", "جولات عائلية"],
              }
            },
            vehicle: {
              model: t.vehicle_model || (t.max_capacity === 50 ? "حافلة سياحية كبرى VIP 50 راكب" : t.max_capacity === 15 ? "مرسيدس فان سياحي 15 راكب" : "حافلة ميني باص سياحي 25 راكب"),
              company: t.transport_company_name || "شركة النقل السياحي المعتمدة",
              driver: t.driver_name || "سائق مرخص ومحترف",
              plateNumber: t.vehicle_plate || undefined,
              driverPhone: t.driver_phone || undefined,
              capacity: t.vehicle_capacity || t.max_capacity || 25,
            },
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
            // Visible reviews in DelniDB (0 when the trip has none yet)
            rating: t.reviews_avg ? Math.round(Number(t.reviews_avg) * 10) / 10 : 0,
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
            description: t.trip_description || t.description || `برنامج رحلة أسبوعية متكامل يشمل الإقامة والنقل.`,
            startDate: t.start_date || "2026-10-25",
            endDate: t.end_date || "2026-10-31",
            targetPersons: t.max_capacity || 20,
            availableSeats: t.available_seats !== undefined ? t.available_seats : (t.max_capacity || 20),
            seatPrice: Number(t.seat_per_price) || 1500,
            cities: (t.destinations && Array.isArray(t.destinations) && t.destinations.length > 0)
              ? t.destinations
              : (t.destination ? t.destination.split(" + ") : [t.departure_city || "طرابلس", t.destination_region || "الصحراء"]),
            attractions: (t.places && Array.isArray(t.places) && t.places.length > 0)
              ? t.places.map((p: any) => ({
                  name: p.place_name || p.name,
                  location: p.city || "ليبيا",
                  description: p.description || "معلم سياحي وتاريخي بارز يزخر بالتراث والأصالة الليبية العريقة.",
                }))
              : [
                  {
                    name: t.destination_region || "الواحات والآثار",
                    location: "ليبيا",
                    description: "وجهة استكشافية وتجربة سياحية فريدة تشمل معالم التراث والطبيعة.",
                  }
                ],
            hotels: (t.hotels && Array.isArray(t.hotels) && t.hotels.length > 0)
              ? t.hotels.map((h: any) => h.hotel_name || h.name)
              : ["فندق مبيت معتمد"],
            departure: (t.departure_city && t.departure_city.includes("بنغازي") ? "بنغازي" : "طرابلس") as "طرابلس" | "بنغازي",
            entertainment: "سهرة تراثية، مخيمات وجولات استكشافية",
            guide: {
              name: t.guide_name || t.guide?.full_name || "لم يُعيَّن مرشد بعد",
              title: t.guide_title || t.guide?.title || "سيتم تعيين مرشد معتمد من الإدارة",
              phone: t.guide_phone || t.guide?.phone_number || "—",
            },
            vehicle: {
              model: t.vehicle_model || (t.max_capacity === 50 ? "حافلة سياحية كبرى VIP 50 راكب" : t.max_capacity === 15 ? "مرسيدس فان سياحي 15 راكب" : "حافلة سياحية مجهزة للمسافات الطويلة"),
              company: t.transport_company_name || "شركة النقل السياحي الدولية",
              driver: t.driver_name || "سائق خبير بالمسارات السياحية",
              plateNumber: t.vehicle_plate || undefined,
              driverPhone: t.driver_phone || undefined,
              capacity: t.vehicle_capacity || t.max_capacity || 20,
            },
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
            // Visible reviews in DelniDB (0 when the trip has none yet)
            rating: t.reviews_avg ? Math.round(Number(t.reviews_avg) * 10) / 10 : 0,
            reviews: Number(t.reviews_count) || 0,
          };
        });

        // Map live Daily Trip Offers from DelniDB
        const mappedDailyOffers: TripOffer[] = (Array.isArray(resDailyOffers) ? resDailyOffers : []).map((o: any) => {
          const trip = mappedDaily.find((t) => t.id === o.daily_trip_id);
          const basePrice = Number(o.price_per_seat || trip?.price || 120);
          const discount = Number(o.percent_discount) || 15;
          const finalPrice = Math.round(basePrice * (1 - discount / 100));
          const primaryImg = o.offer_image_url || trip?.img || destLeptisTheater;

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
          const primaryImg = w.offer_image_url || trip?.img || destUbariGaberoun;

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

        if (allCombinedTrips.length > 0) {
          setLiveDbTrips(allCombinedTrips);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("dallani_cached_trips", JSON.stringify(allCombinedTrips));
            }
          } catch {}
        }

        if (allCombinedOffers.length > 0) {
          setDbOffers(allCombinedOffers);
          try {
            if (typeof window !== "undefined") {
              localStorage.setItem("dallani_cached_offers", JSON.stringify(allCombinedOffers));
            }
          } catch {}
        }
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
          `${t.title} ${t.description} ${attractionsText} ${guideText} ${vehicleText}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allTrips, selectedTypes, selectedDepartures, appliedQuery]);

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
          open={!!selectedVehicle}
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
            heroImg,
            destCyrene,
            destGhadames,
            destUbari,
            destTripoli,
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-xl tracking-tight leading-tight">
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
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E8E2D6] text-[#0F172A] space-y-4">
          
          {/* Top Bar: Search Input & Result Count */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Box */}
            <form onSubmit={handleSearchSubmit} className="flex-1 relative">
              <div className="bg-[#FAF7F2] p-2.5 px-3.5 rounded-2xl border border-[#E8E2D6] flex items-center gap-2.5 shadow-xs focus-within:border-[#003580] focus-within:bg-white transition-all">
                <span className="text-[#003580] font-black text-sm">🔍</span>
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
              <span className="text-xs font-black text-[#003580] flex items-center gap-1.5">
                <span>🗓️</span>
                <span>{isAr ? "نوع الرحلة (حدد نوع أو أكثر):" : "Tour Type:"}</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "daily", label: isAr ? "رحلات يومية" : "Daily Tours", icon: "☀️", count: allTrips.filter(t => t.type === "daily").length },
                  { id: "weekly", label: isAr ? "رحلات أسبوعية" : "Weekly Tours", icon: "🗺️", count: allTrips.filter(t => t.type === "weekly").length },
                  { id: "private", label: isAr ? "رحلات خاصة" : "Private Tours", icon: "⭐", count: privateTemplates.length },
                ].map((item) => {
                  const isChecked = selectedTypes.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleType(item.id)}
                      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border select-none ${
                        isChecked
                          ? "bg-[#003580] text-white border-[#003580] shadow-sm"
                          : "bg-[#FAF7F2] text-[#1B5A78] border-[#E8E2D6] hover:bg-white hover:border-[#003580]/40"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                          isChecked
                            ? "bg-white text-[#003580] border-white"
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
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
              <span className="text-xs font-black text-[#003580] flex items-center gap-1.5">
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
                      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border select-none ${
                        isChecked
                          ? "bg-[#1B5A78] text-white border-[#1B5A78] shadow-sm"
                          : "bg-[#FAF7F2] text-[#1B5A78] border-[#E8E2D6] hover:bg-white hover:border-[#1B5A78]/40"
                      }`}
                    >
                      {/* Checkbox Icon */}
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center transition-colors border ${
                          isChecked
                            ? "bg-white text-[#1B5A78] border-white"
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
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
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
          <span className="px-4 py-1.5 rounded-full bg-[#D96B27]/10 text-[#D96B27] border border-[#D96B27]/30 text-xs font-black tracking-wider uppercase inline-block mb-2">
            OUR GALLERY
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-[#003580] tracking-tight">
            {isAr ? "معرض دروب وتجارب الرحلات " : "Tours & Expeditions "}
            <span className="text-[#D96B27]">{isAr ? "السياحية" : "Gallery"}</span>
          </h3>
          <p className="text-xs text-slate-500 font-bold mt-1.5 max-w-lg mx-auto">
            {isAr
              ? "تصفح الرحلات المعروضة في شريط أفقي مريح مع تصميم الكروت المتموجة"
              : "Browse through our curated staggered tour cards in an organic floating flow"}
          </p>
        </div>

        {/* Scroll Controls with Orange Buttons */}
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-black text-[#D96B27] bg-orange-50 px-3.5 py-1.5 rounded-full border border-orange-200">
            {isAr ? `إجمالي الرحلات المعروضة: ${filtered.length}` : `Showing ${filtered.length} tours`}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollHorizontally("left")}
              className="w-11 h-11 rounded-full bg-[#D96B27] hover:bg-[#c25a1b] text-white flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
              aria-label={isAr ? "السابق" : "Previous"}
              title={isAr ? "تحريك لليسار" : "Scroll Left"}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => scrollHorizontally("right")}
              className="w-11 h-11 rounded-full bg-[#D96B27] hover:bg-[#c25a1b] text-white flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
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

        {!isLoading && filtered.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D6] shadow-sm my-8">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="text-lg font-black text-[#003580] mb-1">
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
              className="px-5 py-2.5 rounded-xl bg-[#003580] text-white text-xs font-black shadow-md cursor-pointer hover:bg-[#1B5A78] transition"
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
        <div className="rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#003580] to-[#1B5A78] text-white p-6 sm:p-10 shadow-2xl border border-white/20 relative overflow-hidden">
          {/* Decorative background accents */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-radial from-[#D96B27]/25 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-radial from-[#003580]/40 to-transparent rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

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
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#F59E0B] text-white font-black text-sm sm:text-base shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2.5 border border-amber-300/40"
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
        open={!!selectedVehicle}
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
      vehicle: {
        model: t.vehicle.model,
        company: t.vehicle.company,
        driver: t.vehicle.driver,
      },
      guide: {
        name: t.guide.name,
        title: t.guide.title,
        phone: t.guide.phone,
      },
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
      vehicle: {
        model: t.vehicle.model,
        company: t.vehicle.company,
        driver: t.vehicle.driver,
      },
      guide: {
        name: t.guide.name,
        title: t.guide.title,
        phone: t.guide.phone,
      },
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
      className={`group relative w-[290px] sm:w-[315px] min-w-[290px] sm:min-w-[315px] h-[450px] sm:h-[480px] rounded-[34px] overflow-hidden shadow-[0_20px_55px_rgba(217,107,39,0.32)] hover:shadow-[0_28px_70px_rgba(217,107,39,0.55)] transition-all duration-300 cursor-pointer select-none flex flex-col justify-between ${stagger}`}
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
              className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 brightness-100 contrast-100 ${
                i === activeImgIndex ? "opacity-100 z-0 scale-100" : "opacity-0 -z-10 pointer-events-none"
              }`}
            />
          ))}

          {/* Prev / Next 5-Image Navigation Arrows on Card Sides for Weekly Trips */}
          <button
            type="button"
            onClick={handlePrevImage}
            aria-label="Previous Image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 z-25 w-8 h-8 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer text-base font-bold select-none"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={handleNextImage}
            aria-label="Next Image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 z-25 w-8 h-8 rounded-full bg-black/45 hover:bg-black/80 backdrop-blur-md text-white border border-white/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md hover:scale-110 active:scale-95 cursor-pointer text-base font-bold select-none"
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
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-all duration-700 brightness-100 contrast-100 z-0"
        />
      )}

      {/* Clean Subtle Gradient for High Contrast Typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/30 pointer-events-none z-5" />

      {/* Offer Badge — shown when this trip has an active offer */}
      {offer && (
        <div className="absolute top-14 left-3 z-20 pointer-events-none">
          <div className="flex flex-col items-start gap-1">
            <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-red-600 to-[#EA580C] text-white font-black text-[11px] shadow-lg border border-white/20 animate-pulse">
              🔥 {offer.discountPercent} خصم
            </span>
            <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-bold text-[10px] border border-amber-400/30">
              {offer.price} <span className="text-white/70">{isAr ? "د.ل" : "LYD"}</span>
              <span className="line-through text-white/50 mr-1">{offer.oldPrice}</span>
            </span>
          </div>
        </div>
      )}

      {/* Top Floating Badges & Image Indicators */}
      <div className="relative z-10 p-5 pb-2 flex items-center justify-between gap-1.5">
        <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white font-black text-xs shadow-md border border-white/25">
          {t.type === "daily"
            ? (isAr ? "☀️ رحلة يومية" : "☀️ Daily Tour")
            : t.type === "weekly"
            ? (isAr ? "🗓️ أسبوعية" : "🗓️ Weekly")
            : (isAr ? "👑 خاصة VIP" : "👑 Private VIP")}
        </span>

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
                className={`transition-all rounded-full cursor-pointer ${
                  i === activeImgIndex
                    ? "w-3.5 h-1.5 bg-amber-400"
                    : "w-1.5 h-1.5 bg-white/50 hover:bg-white"
                }`}
              />
            ))}
            <span className="text-[10px] text-amber-300 font-black ml-1 select-none">
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
            <span className={`shrink-0 text-[10px] px-2.5 py-0.5 rounded-full font-black backdrop-blur-md border ${
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
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/25 text-amber-200 border border-amber-300/40 text-[10px] font-black backdrop-blur-xs">
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
                <div className="text-[9px] text-white/70 font-semibold">{isAr ? "سعر المقعد" : "Seat Price"}</div>
                <div className="text-lg font-black text-amber-300">
                  {t.price} <span className="text-xs font-bold text-white/80">{isAr ? "د.ل" : "LYD"}</span>
                </div>
              </div>
            )}
            {t.type === "weekly" && (
              <div>
                <div className="text-[9px] text-white/70 font-semibold">{isAr ? "شامل الإقامة" : "All Inclusive"}</div>
                <div className="text-lg font-black text-amber-300">
                  {t.seatPrice} <span className="text-xs font-bold text-white/80">{isAr ? "د.ل" : "LYD"}</span>
                </div>
              </div>
            )}
            {t.type === "private" && (
              <div>
                <div className="text-[9px] text-white/70 font-semibold">{isAr ? "المدة المقترحة" : "Duration"}</div>
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
