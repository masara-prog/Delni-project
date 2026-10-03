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
  description: string;
  activities: string[];
  attractions: TouristAttraction[];
  targetPersons: number;
  availableSeats: number;
  daysOfWeek: string;
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
  };
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
  };
  rating: number;
  reviews: number;
};

export type PrivateTemplate = {
  id: string;
  type: "private";
  title: string;
  img: string;
  description: string;
  sampleDays: string;
  note: string;
};

export type Trip = DailyTrip | WeeklyTrip | PrivateTemplate;

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

const tripOffers: TripOffer[] = [
  {
    id: "HO-1",
    title: "عرض رحلة لبدة الكبرى الرومانية",
    sub: "يوم كامل يشمل الغداء البحري الفاخر وزيارة المسرح وقوس النصر",
    oldPrice: "260",
    price: "180",
    discountPercent: "30%",
    tag: "خصم 30%",
    img: destLeptisTheater,
    gallery: [
      destLeptisTheater,
      destLeptisArch,
      destLeptisForum,
      destLeptisCoast,
    ],
    kind: "daily",
    departure: "مكتب طرابلس - النوفليين (08:30 ص)",
    perk: "🥗 شامل تذاكر الدخول ووجبة الغداء البحري والمرشد السياحي",
    schedules: [
      { id: "ho1-s1", date: "يومياً عدا الأحد", time: "08:30 AM", seats: 20, taken: 12, guide: "أ. محمد الفيتوري", price: 180 },
    ]
  },
  {
    id: "HO-2",
    title: "عرض مغامرة أوباري والرمال الذهبية",
    sub: "برنامج ٥ أيام شامل الإقامة في مخيم صحراوي ونقل 4x4 وسفاري",
    oldPrice: "2,400",
    price: "1,650",
    discountPercent: "30%",
    tag: "خصم 30%",
    img: destUbariGaberoun,
    gallery: [
      destUbariGaberoun,
      destUbariUmmAlMaa,
      destAcacusArch,
      destSaharaDunes,
    ],
    kind: "weekly",
    departure: "مكتب طرابلس / سبها",
    perk: "🎁 جلسة تصوير وسهرة طوارق وتزلج رملي ومخيم صحراوي مجاناً",
    schedules: [
      { id: "ho2-s1", date: "الخميس القادم", time: "07:00 AM", seats: 14, taken: 6, guide: "طارق التواتي", price: 1650 },
    ]
  },
  {
    id: "HO-3",
    title: "جولة آثار قورينا والجبل الأخضر",
    sub: "٤ أيام بين طبيعة الجبل الخلابة وآثار شحات ومعبد أبولو",
    oldPrice: "1,350",
    price: "950",
    discountPercent: "25%",
    tag: "خصم 25%",
    img: destCyreneApollo,
    gallery: [
      destCyreneApollo,
      destCyreneSanctuary,
      destJabalAkhdarPanorama,
      destJabalAkhdarForest,
      destJabalAkhdarBridge,
      destJabalAkhdarValley,
    ],
    kind: "weekly",
    departure: "مكتب بنغازي - شارع فينيسيا",
    perk: "🏨 إقامة منتجع جبلي فاخر مع وجبة إفطار ومشاوي",
    schedules: [
      { id: "ho3-s1", date: "الجمعة القادمة", time: "08:00 AM", seats: 16, taken: 9, guide: "خالد العبيدي", price: 950 },
    ]
  },
  {
    id: "HO-4",
    title: "جولة طرابلس القديمة والسرايا الحمراء",
    sub: "جولة يومية ممتعة في أسواق المدينة القديمة ومتحف السرايا والمقاهي",
    oldPrice: "120",
    price: "85",
    discountPercent: "30%",
    tag: "خصم 30%",
    img: destTripoliCastle,
    gallery: [
      destTripoliCastle,
      destTripoliArch,
      destTripoliMedina,
      destTripoliHarbor,
    ],
    kind: "daily",
    departure: "مكتب طرابلس - النوفليين (09:00 ص)",
    perk: "☕ استراحة ضيافة وتذوق وحلويات تراثية في زنقة الفندق",
    schedules: [
      { id: "ho4-s1", date: "كل ثلاثاء وجمعة", time: "09:00 AM", seats: 15, taken: 7, guide: "منى مصطفى", price: 85 },
    ]
  },
  {
    id: "HO-5",
    title: "جولة مسرح وآثار صبراتة الساحلية",
    sub: "يوم كامل لزيارة تحفة المسرح الروماني الأيقوني والمتحف والغداء البحري",
    oldPrice: "210",
    price: "150",
    discountPercent: "28%",
    tag: "خصم 28%",
    img: destSabrathaTheater,
    gallery: [
      destSabrathaTheater,
      destSabrathaCoast,
      destSabrathaTemple,
      destSabrathaRuins,
    ],
    kind: "daily",
    departure: "مكتب طرابلس (09:00 ص)",
    perk: "🏛️ تذاكر الموقع والمتحف وغداء سمك طازج على الكورنيش",
    schedules: [
      { id: "ho5-s1", date: "كل خميس وسبت", time: "09:00 AM", seats: 20, taken: 8, guide: "أ. عادل الزواوي", price: 150 },
    ]
  },
  {
    id: "HO-6",
    title: "جولة بيوت الحفر وقصور جبل نفوسة",
    sub: "رحلة يومية لبيوت الحفر التراثية بغريان ومصانع الفخار وقصر الحاج",
    oldPrice: "160",
    price: "110",
    discountPercent: "31%",
    tag: "خصم 31%",
    img: destGharyanCave,
    gallery: [
      destGharyanCave,
      destGharyanCourtyard,
      destKsarNalut,
      destNafusaFortress,
    ],
    kind: "daily",
    departure: "مكتب طرابلس (08:30 ص)",
    perk: "🏺 زيارة بيوت الحفر وورش الفخار مع غداء جبلي أصيل",
    schedules: [
      { id: "ho6-s1", date: "كل سبت وأحد", time: "08:30 AM", seats: 18, taken: 6, guide: "أ. أحمد الغرياني", price: 110 },
    ]
  },
];

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
    priceNote: "جلسات قهوة وغروب استثنائية",
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

const dailyTrips: DailyTrip[] = [
  {
    id: "d1",
    type: "daily",
    title: "لبدة الكبرى وسبل الرومان",
    img: heroImg,
    description:
      "رحلة يومية شاملة لاستكشاف جوهرة الآثار الرومانية في لبدة الكبرى مع شرح تاريخي متألق، جولة بالمسرح الضخم، والغداء الساحلي.",
    activities: ["جولة أثرية بمرشد موثق", "شرح تاريخي مفصل", "غداء طازج على الشاطئ", "جلسة تصوير احترافية"],
    attractions: [
      {
        name: "لبدة الكبرى",
        location: "الخمس - ليبيا",
        description:
          "أعظم مدينة رومانية أثرية محفوظة في أفريقيا. تضم المسرح الروماني الأثري الضخم، قوس سيبتيموس سيفيروس، وحمامات هادريان ذات الموزاييك التاريخي النادر.",
      },
      {
        name: "المسرح الروماني بقورينا والساحل",
        location: "لبدة الكبرى",
        description: "مدرج روماني عملاق يطل مباشرة على زرقة البحر المتوسط، يتميز بهندسة صوتية مذهلة تعود إلى القرن الأول الميلادي.",
      },
    ],
    targetPersons: 20,
    availableSeats: 12,
    daysOfWeek: "كل سبت، اثنين، وأربعاء",
    departure: "طرابلس",
    entertainment: "ألعاب مائية على شاطئ الخمس، كافيهات عائلية مطلة على البحر، وجلسة تصوير واستراحة عند الغروب",
    guide: {
      name: "أ. محمد الفيتوري",
      title: "خبير الآثار الرومانية والتاريخ الليبي (خبرة 12 سنة)",
      phone: "+218 91 333 4455",
      cv: {
        name: "أ. محمد الفيتوري",
        title: "خبير الآثار الرومانية والتراث الساحلي",
        licenseNumber: "G-8821",
        experienceYears: 12,
        rating: 4.9,
        pricePerDay: 180,
        phone: "+218 91 333 4455",
        bio: "مرشد سياحي معتمد ومؤرخ متخصص في الآثار الرومانية والفينيقية في لبدة الكبرى وصبراتة. خبرة أكثر من 12 عاماً في مرافقة الوفود الدبلوماسية والمجموعات السياحية.",
        specialties: ["الآثار الرومانية", "التاريخ الفينيقي", "الجولات التاريخية"],
      },
    },
    vehicle: {
      model: "تويوتا كوستر 2024 سياحية مكيفة",
      company: "شركة الصحراء للنقل والخدمات",
      driver: "الكابتن سالم الورفلي",
    },
    accommodation: "إقامة يومية - عودة مساءً إلى طرابلس",
    price: 180,
    rating: 4.9,
    reviews: 84,
  },
  {
    id: "d2",
    type: "daily",
    title: "طرابلس القديمة ومعالم السراي",
    img: destTripoli,
    description:
      "جولة سحرية في دروب طرابلس القديمة والقلعة الحمراء وقوس ماركوس أوريليوس مع تذوق المأكولات الشعبية الطرابلسية الشهيرة.",
    activities: ["جولة حنطور ترفيهية", "استراحة ضيافة وتذوق في زنقة الفندوق", "زيارة القلعة الحمراء والمتحف"],
    attractions: [
      {
        name: "السراي الحمراء والمدينة القديمة",
        location: "طرابلس",
        description: "قلعة تاريخية مجاورة لميناء طرابلس تروي تاريخ الحضارات الفينيقية، الرومانية، والإسلامية.",
      },
      {
        name: "قوس ماركوس أوريليوس",
        location: "طرابلس القديمة",
        description: "قوس نصر روماني من الرخام الأبيض يعود للقرن الثاني الميلادي في قلب طرابلس القديمة.",
      },
    ],
    targetPersons: 25,
    availableSeats: 8,
    daysOfWeek: "كل ثلاثاء، خميس، وجمعة",
    departure: "طرابلس",
    entertainment: "جولة حنطور، كافيهات المدينة القديمة الأثرية، وعرض فني تراثي طرابلسي عريق",
    guide: {
      name: "أ. سعاد الورفلي",
      title: "دليلة التراث الطرابلسي والمدينة القديمة (خبرة 9 سنوات)",
      phone: "+218 92 555 7788",
      cv: {
        name: "أ. سعاد الورفلي",
        title: "دليلة التراث الطرابلسي والمدينة القديمة",
        licenseNumber: "G-9410",
        experienceYears: 9,
        rating: 4.95,
        pricePerDay: 150,
        phone: "+218 92 555 7788",
        bio: "متخصصة في السراي الحمراء والأسواق التاريخية والعمارة الإسلامية. أقدم جولات مشي ساحرة في أزقة المدينة القديمة مع ضيافة المأكولات الشعبية.",
        specialties: ["تراث طرابلس القديمة", "السراي الحمراء", "المأكولات الشعبية"],
      },
    },
    vehicle: {
      model: "مرسيدس سبرينتر سياحي VIP",
      company: "شركة عروس البحر للنقل",
      driver: "الكابتن طارق الكيلاني",
    },
    price: 120,
    rating: 4.8,
    reviews: 62,
  },
  {
    id: "d3",
    type: "daily",
    title: "شحات وقورينا الإغريقية",
    img: destCyreneApollo,
    description:
      "استكشاف الآثار الإغريقية الساحرة فوق قمم الجبل الأخضر، زيارة معبد أبولو، وإطلالة على شواطئ سوسة وأبولونيا.",
    activities: ["جولة أثرية بموقع قورينا", "استراحة غداء جبلية", "زيارة عين شحات الشافية"],
    attractions: [
      {
        name: "آثار قورينا وشحات",
        location: "شحات - الجبل الأخضر",
        description: "مدينة إغريقية أثرية تقف على قمم الجبل الأخضر الساحر مع مشاهد بانورامية لمعبد أبولو ومدرجات الإغريق.",
      },
    ],
    targetPersons: 18,
    availableSeats: 5,
    daysOfWeek: "كل جمعة، سبت، وأحد",
    departure: "بنغازي",
    entertainment: "جلسة تصوير جبلية، مشويات بين الغابات الطبيعية، وزيارة شلالات المنصورة",
    guide: {
      name: "أ. فاطمة الزهراء الشريف",
      title: "مرشدة الطبيعة والآثار الإغريقية بالجبل الأخضر (خبرة 7 سنوات)",
      phone: "+218 61 909 3322",
      cv: {
        name: "أ. فاطمة الزهراء الشريف",
        title: "مرشدة الطبيعة والآثار الإغريقية بالجبل الأخضر",
        licenseNumber: "G-6512",
        experienceYears: 7,
        rating: 4.85,
        pricePerDay: 170,
        phone: "+218 61 909 3322",
        bio: "متخصصة في التاريخ الإغريقي بقورينا (شحات) ومعبد أبولو وشلالات الجبل الأخضر. أسلوب مميز في السرد التاريخي وإرشاد العائلات.",
        specialties: ["آثار قورينا وشحات", "طبيعة الجبل الأخضر", "جولات عائلية"],
      },
    },
    vehicle: {
      model: "تويوتا هايس 2024 مكيفة",
      company: "شركة الجبل الأخضر للخدمات السياحية",
      driver: "الكابتن خالد البرعصي",
    },
    price: 210,
    rating: 4.95,
    reviews: 47,
  },
  {
    id: "d4",
    type: "daily",
    title: "صبراتة الأثرية ومسرح البحر",
    img: destSabratah,
    description:
      "رحلة ساحلية ليوم كامل لاستكشاف مسرح صبراتة الروماني المطل على مياه المتوسط والمتحف الأثري وتناول المأكولات البحرية.",
    activities: ["جولة المسرح الروماني", "زيارة المتحف الفينيقي", "غداء مأكولات بحرية طازجة", "استراحة بحرية عند المغيب"],
    attractions: [
      {
        name: "مسرح صبراتة الروماني",
        location: "صبراتة - الساحل الغربي",
        description: "تحفة معمارية رومانية شهيرة بواجهتها ذات الأعمدة الرخامية متعددة الطبقات والمطلة مباشرة على زرقة البحر.",
      },
    ],
    targetPersons: 22,
    availableSeats: 10,
    daysOfWeek: "كل خميس وسبت",
    departure: "طرابلس",
    entertainment: "مشاهدة غروب الشمس على كورنيش صبراتة، مقاهي شاطئية وجلسة مأكولات بحرية طازجة",
    guide: {
      name: "أ. عادل الزواوي",
      title: "مرشد أثري متخصص في حضارات الساحل الفينيقية (خبرة 8 سنوات)",
      phone: "+218 92 666 4411",
      cv: {
        name: "أ. عادل الزواوي",
        title: "مرشد أثري متخصص في حضارات الساحل الفينيقية",
        licenseNumber: "G-7104",
        experienceYears: 8,
        rating: 4.88,
        pricePerDay: 160,
        phone: "+218 92 666 4411",
        bio: "دليل سياحي مرخص متخصص في مدينة صبراتة التاريخية والتراث البحري.",
        specialties: ["مسرح صبراتة", "الآثار الرومانية", "جولات شاطئية"],
      },
    },
    vehicle: {
      model: "تويوتا هايس سياحي 2024 VIP",
      company: "شركة المتوسط للنقل السياحي",
      driver: "الكابتن كمال الفرجاني",
    },
    accommodation: "رحلة يومية - عودة في المساء إلى طرابلس",
    price: 150,
    rating: 4.88,
    reviews: 53,
  },
  {
    id: "d5",
    type: "daily",
    title: "جبل نفوسة وبيوت الحفر بغريان",
    img: destGharyanCave,
    description:
      "جولة جبلية مشوقة تنطلق من طرابلس لزيارة بيوت الحفر الأثرية في باطن جبل نفوسة، وورش الفخار اليدوي الشهيرة وقصور نالوت وقصر الحاج الحجرية.",
    activities: ["استكشاف بيوت الحفر التراثية", "ورش ومصانع الفخار اليدوي", "زيارة قصر الحاج وقصور نالوت", "إطلالة بانورامية من رأس اللفعة"],
    attractions: [
      {
        name: "بيوت الحفر التراثية بغريان",
        location: "غريان - جبل نفوسة",
        description: "مساكن بيئية فريدة محفورة في باطن الجبل تمتاز باعتدال حرارتها المستمر وفنائها المفتوح للسماء.",
      },
      {
        name: "قصور وقلاع الجبل الغربي",
        location: "نالوت وقصر الحاج",
        description: "قلاع تاريخية لتخزين الحبوب شيدها الأمازيغ على حواف الجبال الشاهقة منذ مئات السنين.",
      },
    ],
    targetPersons: 20,
    availableSeats: 8,
    daysOfWeek: "كل سبت وأربعاء",
    departure: "طرابلس",
    entertainment: "مشاهدة صناعة الفخار المباشرة، غداء جبلي أصيل بزيت الزيتون النفوسي، وجلسة شاي بالنعناع الجبلي",
    guide: {
      name: "أ. أحمد الغرياني",
      title: "مرشد التراث والمسالك الجبلية بنفوسة (خبرة 10 سنوات)",
      phone: "+218 91 777 8899",
      cv: {
        name: "أ. أحمد الغرياني",
        title: "مرشد التراث والمسالك الجبلية بنفوسة",
        licenseNumber: "G-8220",
        experienceYears: 10,
        rating: 4.92,
        pricePerDay: 140,
        phone: "+218 91 777 8899",
        bio: "دليل محلي خبير في تاريخ جبل نفوسة وبيوت الحفر الأثرية والقصور الأمازيغية والمسارات الجبلية الطبيعية.",
        specialties: ["بيوت الحفر بغريان", "قصور وقلاع نفوسة", "التراث الجبلي"],
      },
    },
    vehicle: {
      model: "تويوتا هايس 2024 سياحي مريح",
      company: "شركة الجبل للنقل والسياحة",
      driver: "الكابتن مراد الباروني",
    },
    accommodation: "رحلة يومية - عودة في المساء إلى طرابلس",
    price: 110,
    rating: 4.92,
    reviews: 41,
  },
  {
    id: "d6",
    type: "daily",
    title: "طبيعة وغابات الجبل الأخضر ووادي الكوف",
    img: destJabalAkhdarBridge,
    description:
      "مغامرة طبيعية استثنائية في قلب غابات الصنوبر والعرعر بالجبل الأخضر، وزيارة جسر وادي الكوف المعلق الشاهق ومطلات عقبة الجبل.",
    activities: ["مسار المشي بين أشجار الصنوبر", "التوقف عند جسر وادي الكوف الأيقوني", "إطلالات بانورامية على السهول والبحر", "غداء مشويات جبلية"],
    attractions: [
      {
        name: "جسر وادي الكوف المعلق",
        location: "وادي الكوف - الجبل الأخضر",
        description: "أحد أشهر الجسور المعلقة في أفريقيا يرتفع فوق وادٍ سحيق محاط بالغابات الكثيفة والمنحدرات الجبلية.",
      },
      {
        name: "غابات الجبل الأخضر ومطلات السهول",
        location: "البيضاء والمنصورة",
        description: "غطاء نباتي طبيعي فريد يجمع بين الصنوبر الحلبي والبطم والعرعر مع هواء جبلي نقي ومنعش.",
      },
    ],
    targetPersons: 16,
    availableSeats: 6,
    daysOfWeek: "كل خميس، جمعة، وسبت",
    departure: "بنغازي",
    entertainment: "جلسة شاي جبلية بالأعشاب الطبيعية، مشويات على الفحم في الغابة، وتصوير بانورامي",
    guide: {
      name: "أ. خالد بن يونس",
      title: "دليل المغامرات البيئية بالجبل الأخضر (خبرة 6 سنوات)",
      phone: "+218 92 111 2233",
      cv: {
        name: "أ. خالد بن يونس",
        title: "دليل المغامرات البيئية بالجبل الأخضر",
        licenseNumber: "G-9902",
        experienceYears: 6,
        rating: 4.9,
        pricePerDay: 160,
        phone: "+218 92 111 2233",
        bio: "متخصص في المسارات الطبيعية وغابات الجبل الأخضر وجسر وادي الكوف والتخييم الجبلي.",
        specialties: ["مسارات غابات الصنوبر", "جسر وادي الكوف", "سياحة بيئية"],
      },
    },
    vehicle: {
      model: "تويوتا هايس 2024 دفع رباعي مكيفة",
      company: "شركة نسائم الجبل للسياحة",
      driver: "الكابتن طارق الورفلي",
    },
    accommodation: "رحلة يومية - عودة في المساء",
    price: 160,
    rating: 4.96,
    reviews: 58,
  },
];

const weeklyTrips: WeeklyTrip[] = [
  {
    id: "w1",
    type: "weekly",
    title: "سحر الصحراء: أوباري وتدرارت أكاكوس",
    img: destUbariGaberoun,
    description:
      "رحلة أسبوعية استكشافية متكاملة لرمال الجنوب الساحرة، التخييم الفاخر تحت النجوم، وبحيرة قبر عون العجيبة.",
    startDate: "2026-10-10",
    endDate: "2026-10-17",
    targetPersons: 15,
    availableSeats: 6,
    seatPrice: 1850,
    cities: ["طرابلس", "سبها", "أوباري", "غات"],
    attractions: [
      {
        name: "بحيرات أوباري وقبر عون",
        location: "أوباري - الجنوب الليبي",
        description: "واحات مائية مالحة في قلب الرمال الذهبية تحيط بها النخيل والكثبان العملاقة.",
      },
      {
        name: "جبال تدرارت أكاكوس",
        location: "غات - فزان",
        description: "سلسلة جبلية صخرية تضم نقوشاً جدارية نادرة تعود لآلاف السنين قبل الميلاد.",
      },
    ],
    hotels: ["مخيم أوباري الصحراوي الفاخر", "فندق غات السياحي"],
    departure: "طرابلس",
    guide: {
      name: "أ. طارق التواتي",
      title: "خبير الصحراء الكبرى والجغرافيا الطوارقية (خبرة 15 سنة)",
      phone: "+218 91 888 2211",
      cv: {
        name: "أ. طارق التواتي",
        title: "خبير الصحراء الكبرى والجغرافيا الطوارقية",
        licenseNumber: "G-7734",
        experienceYears: 15,
        rating: 5.0,
        pricePerDay: 250,
        phone: "+218 91 888 2211",
        bio: "دليل صحراوي محترف من أهالي الجنوب. خبير في مسارات الكثبان الرملية بأوباري، التخييم في جبال أكاكوس، وسهرات الفلكلور الطوارقي وشواء الصحراء.",
        specialties: ["سفاري الصحراء 4x4", "تخييم أكاكوس", "نقوش ما قبل التاريخ"],
      },
    },
    vehicle: {
      model: "مجموعة من سيارات الدفع الرباعي وسائقيها",
      company: "شركة الفزان لسفاري الصحراء",
      driver: "الكابتن عمر الطوارقي ونخبة السائقين",
    },
    rating: 5.0,
    reviews: 112,
  },
  {
    id: "w2",
    type: "weekly",
    title: "لؤلؤة الصحراء: غدامس والواحات القديمة",
    img: destGhadames,
    description: "أسبوع ثقافي وتراثي في مدينة غدامس المسجلة باليونسكو مع المأكولات التراثية والعمارة الطينية.",
    startDate: "2026-11-01",
    endDate: "2026-11-07",
    targetPersons: 20,
    availableSeats: 9,
    seatPrice: 1450,
    cities: ["طرابلس", "نالوت", "غدامس"],
    attractions: [
      {
        name: "مدينة غدامس القديمة",
        location: "غدامس",
        description: "لؤلؤة الصحراء المسجلة بتراث اليونسكو، تمتاز بعمارتها الطينية الأسطورية وشوارعها المسقوفة.",
      },
    ],
    hotels: ["فندق عين الفرس غدامس"],
    departure: "طرابلس",
    guide: {
      name: "أ. المبروك الغدامسي",
      title: "دليل العمارة الطينية وتراث غدامس (خبرة 14 سنة)",
      phone: "+218 484 622 111",
      cv: {
        name: "أ. المبروك الغدامسي",
        title: "دليل العمارة الطينية وتراث مدينة غدامس",
        licenseNumber: "G-5519",
        experienceYears: 14,
        rating: 4.92,
        pricePerDay: 200,
        phone: "+218 484 622 111",
        bio: "دليل محلي معتمد لمدينة غدامس القديمة. خبير بالعمارة الطينية الفريدة وعين الفرس وعادات الزفاف التراثية الغدامسية.",
        specialties: ["عمارة غدامس الطينية", "متحف التراث", "عين الفرس"],
      },
    },
    vehicle: {
      model: "حافلة هيونداي يونيفرس الحديثة",
      company: "شركة الواحات للنقل الدولي",
      driver: "الكابتن جمال النفوسي",
    },
    rating: 4.9,
    reviews: 79,
  },
];

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

  let realisticOverview = "";
  if ("realisticOverview" in t && (t as any).realisticOverview) {
    realisticOverview = (t as any).realisticOverview;
  } else if (t.id === "d2") {
    realisticOverview = isAr
      ? "رحلة العاصمة الليبية طرابلس تشمل جولة ميدانية متكاملة لزيارة المعالم التراثية بالمدينة القديمة وقوس ماركوس أوريليوس وزنقة الفرنسيس ومدرسة عثمان باشا، وزيارة قلعة السرايا الحمراء والمتحف الوطني، بالإضافة إلى زيارة حديقة الحيوان والاستمتاع بالمساحات الخضراء، وتناول وجبة الغداء في إحدى المطاعم التراثية العريقة بالمدينة (أكلات شعبية ليبية أصيلة تشمل الكسكسي بالبصلة، البازين، أو الأسماك الطازجة مع الشاي باللوز)، مع وقت حر للتسوق في أسواق المدينة القديمة."
      : "Tripoli capital tour covers walking exploration of the historic Old Medina, Marcus Aurelius Arch, the Red Castle & National Museum, followed by a visit to the Tripoli Zoo & botanical gardens, and an authentic Libyan traditional lunch at an iconic heritage restaurant with almond mint tea.";
  } else if (t.id === "d1") {
    realisticOverview = isAr
      ? "رحلة يومية شاملة إلى مدينة لبدة الكبرى الأثرية بالخمس، تشمل استكشاف المسرح الروماني الأضخم في شمال أفريقيا، وقوس سيبتيموس سيفيروس، وحمامات هادريان ذات الموزاييك الرخامي، والسوق الروماني القديم، يعقبها تناول وجبة غداء بحرية طازجة في مطعم شاطئي مطل على البحر المتوسط، مع استراحة شاي عند الغروب."
      : "Full-day archaeological tour to Leptis Magna, exploring the Roman amphitheater, Arch of Septimius Severus, and Hadrianic baths, complemented by a fresh seafood lunch at a seaside restaurant.";
  } else if (t.id === "d3") {
    realisticOverview = isAr
      ? "رحلة جبلية وأثرية ليوم كامل إلى قمم الجبل الأخضر وآثار قورينا (شحات)، تشمل زيارة معبد أبولو، والمدرج الإغريقي، وعين شحات التاريخية، مع إطلالة بانورامية على شواطئ سوسة وأبولونيا، وتناول وجبة غداء لحم وطني مشوي على الطريقة الجبلية وسط غابات الجبل الأخضر الطبيعية."
      : "Full-day scenic & historical expedition to Cyrene (Shahhat) on the Green Mountain, visiting the Temple of Apollo, Greek theater, and ancient springs, paired with a traditional mountain pit-roasted barbecue lunch.";
  } else if (t.id === "d4") {
    realisticOverview = isAr
      ? "رحلة ساحلية ليوم كامل لمدينة صبراتة الأثرية، تشمل زيارة مسرح صبراتة الروماني الشهير بواجهته الرخامية المطلة على البحر المتوسط، والمتحف الأثري الفينيقي، وتناول وجبة غداء أسماك طازجة بمطعم على الشاطئ، وجولة حرة على الكورنيش."
      : "Coastal day tour to ancient Sabratha, featuring the iconic seaside Roman theater, Phoenician museum, and a fresh Mediterranean catch lunch.";
  } else if (t.id === "w1") {
    realisticOverview = isAr
      ? "رحلة أسبوعية استكشافية متكاملة لرمال الجنوب الليبي وسفاري الصحراء، تشمل سيارات الدفع الرباعي 4x4 مع سائقين محترفين من أهالي الصحراء، زيارة بحيرات أوباري الساحرة (قبرعون والمندرة)، التخييم الفاخر في جبال تدرارت أكاكوس، مشاهدة النقوش الصخرية القديمة، وتناول وجبات الشواء الصحراوية وسهرات الشاي الطوارقي الفلكلورية."
      : "Complete 7-day desert safari into Ubari sand dunes and Tadrart Acacus mountains with 4x4 SUVs, native Tuareg desert guides, luxury camp stay, and barbecue feasts.";
  } else if (t.id === "w2") {
    realisticOverview = isAr
      ? "رحلة أسبوعية ثقافية متكاملة إلى لؤلؤة الصحراء غدامس المسجلة باليونسكو، تشمل التجول في شوارع المدينة القديمة المسقوفة، زيارة عين الفرس، والمتحف التراثي، وتناول الوجبات التراثية الغدامسية (بازين، فتات، وتمور الواحات) مع الإقامة في فندق تراثي."
      : "7-day cultural journey to the UNESCO-listed mud-brick oasis of Ghadames, with heritage walks, Ain al-Faras spring, and authentic oasis feasts.";
  } else {
    realisticOverview = t.description;
  }

  // Daily Tours STRICTLY 09:00 AM to 09:00 PM (12 hours) as explicitly demanded by user
  const itinerary = t.type === "daily" ? [
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
      desc: isAr ? "تناول وجبة غداء ليبية تقليدية كاملة (أطباق رئيسية، سلطات طازجة، عصائر، ومياه معدنية) في مطعم تراثي معتمد مشمول بالرحلة." : "Complete traditional Libyan meal with fresh salads and beverages included in the tour."
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
      desc: isAr ? "تناول وجبة غداء تراثية شهية مشمولة في البرنامج." : "Traditional meal included in program."
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
  ];

  const vehicle = "vehicle" in t && t.vehicle ? t.vehicle : {
    model: "مرسيدس سبرينتر سياحي VIP مكيف ومجهز",
    company: "شركة السهم الذهبي للنقل السياحي",
    driver: "الكابتن عادل المقرحي"
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

  const cityImages = CITY_IMAGES[trip.id] ?? [
    trip.img,
  ];

  // Slideshow state for city images
  const [activeSlide, setActiveSlide] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % cityImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [cityImages.length]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#0F172A] pb-20 relative" dir={dir}>
      {/* 1. Sleek Compact Image Slideshow Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative w-full h-[260px] sm:h-[320px] lg:h-[360px] bg-black rounded-3xl overflow-hidden shadow-lg border border-[#E8E2D6]">
          {/* Stacked animated city images with crossfade */}
          {cityImages.map((imgSrc, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity duration-[1000ms] ease-in-out"
              style={{ opacity: idx === activeSlide ? 1 : 0, zIndex: idx === activeSlide ? 1 : 0 }}
            >
              <img
                src={imgSrc}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Clean subtle bottom gradient for text contrast only */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent z-10 pointer-events-none" />

          {/* Slide indicator dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {cityImages.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveSlide(idx)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  idx === activeSlide
                    ? "w-6 h-2 bg-white shadow-md"
                    : "w-2 h-2 bg-white/45 hover:bg-white/75"
                }`}
                aria-label={`الصورة ${idx + 1}`}
              />
            ))}
          </div>

          {/* Floating Transparent Top Navigation Bar Directly Over Image */}
          <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 flex items-center justify-between pointer-events-none">
            {/* Back Button: Round Transparent Glass Arrow */}
            <button
              type="button"
              onClick={onBack}
              className="pointer-events-auto w-10 h-10 rounded-full bg-black/40 hover:bg-black/65 text-white backdrop-blur-md border border-white/25 flex items-center justify-center text-xl transition shadow-md cursor-pointer hover:scale-105 active:scale-95"
              title={isAr ? "العودة للرحلات" : "Back to Tours"}
            >
              <span>{dir === "rtl" ? "➔" : "←"}</span>
            </button>

            {/* Dallani Logo with Transparent Glass */}
            <div className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white font-black text-xs drop-shadow-md">
              <span className="text-amber-400 text-sm">🧭</span>
              <span>{isAr ? "منصة دلّني" : "Dallani"}</span>
            </div>

            {/* Tour Type Badge with Transparent Glass */}
            <div className="pointer-events-auto flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white text-[11px] font-black drop-shadow-md">
                {trip.type === "daily"
                  ? (isAr ? "☀️ رحلة يومية (9 ص - 9 م)" : "Daily Tour (9 AM - 9 PM)")
                  : trip.type === "weekly"
                  ? (isAr ? "🗓️ رحلة أسبوعية" : "Weekly Tour")
                  : (isAr ? "👑 رحلة خاصة" : "Private Tour")}
              </span>
              {"rating" in trip && (
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/25 text-white text-[11px] font-black">
                  <span className="text-amber-300">★ {trip.rating}</span>
                  <span className="text-white/80">({trip.reviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Trip Header & Key Highlights Section (Cleanly below video - ZERO text covering video) */}
      <div className="bg-white border-b border-[#E8E2D6] py-6 sm:py-8 shadow-xs relative z-10">
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
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-black border border-amber-200">
                  <span>🪑</span>
                  <span>{isAr ? `متبقي ${info.availableSeats} مقاعد` : `${info.availableSeats} seats left`}</span>
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
                onClick={onBook}
                className="px-6 py-3.5 rounded-xl bg-[#D96B27] hover:bg-[#c25a1b] text-white font-black text-sm shadow-md transition cursor-pointer flex items-center gap-2"
              >
                <span>{trip.type === "private" ? (isAr ? "طلب تصميم الرحلة" : "Request Custom Tour") : (isAr ? "حجز مقعدك الآن" : "Book Your Seat")}</span>
                <span>➔</span>
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
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  {isAr ? `متبقي ${info.availableSeats} مقاعد فقط للحجز!` : `Only ${info.availableSeats} seats left!`}
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

              {/* Features Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="text-xl">🍽️</span>
                  <div>
                    <div className="font-black text-xs text-[#0F172A]">{isAr ? "وجبة الغداء مشمولة بالكامل" : "Lunch Included"}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {isAr ? "وجبة غداء ليبية متكاملة (كسكسي، بازين، أو أسماك طازجة) في مطعم تراثي." : "Traditional multi-course lunch at a vetted heritage restaurant."}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                  <span className="text-xl">📍</span>
                  <div>
                    <div className="font-black text-xs text-[#0F172A]">{isAr ? "نقطة وموعد الانطلاق بدقة" : "Exact Departure Point"}</div>
                    <div className="text-[11px] text-slate-500 font-medium mt-0.5">
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

            {/* 4. Included Attractions & City Landmarks */}
            {"attractions" in trip && trip.attractions && trip.attractions.length > 0 && (
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

            {/* 5. Recommended Nearby Partner Hotels */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#003580] flex items-center gap-2">
                    <span>🏨</span>
                    <span>{isAr ? "الفنادق وأماكن الإقامة المجاورة المقترحة للرحلة:" : "Recommended Nearby Partner Hotels:"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isAr ? "فنادق ونُزل معتمدة قريبة من مسار الرحلة مع خصم خاص 20% لعملاء منصة دلّني" : "Vetted hotels near trip route with 20% partner discount"}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/ai_city.jpg"
                      alt="فندق شريك"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-black text-sm text-[#0F172A]">
                        {isAr ? "فندق ومنتجع الشاطئ الفاخر" : "Luxury Seafront Resort"}
                      </div>
                      <div className="text-xs text-amber-500 font-bold">★★★★★ · {isAr ? "خدمة 5 نجوم" : "5 Stars"}</div>
                      <div className="text-[11px] text-[#003580] font-black mt-0.5">
                        {isAr ? "ابتداءً من 450 د.ل (خصم 20%)" : "From 450 LYD (20% OFF)"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D6]">
                    <a
                      href="tel:0912223344"
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <span>📞</span>
                      <span>0912223344</span>
                    </a>
                    <Link
                      to="/hotels"
                      className="py-1.5 px-3 rounded-xl bg-[#003580] text-white font-black text-xs text-center transition"
                    >
                      {isAr ? "تفاصيل الفندق" : "Details"}
                    </Link>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] flex flex-col justify-between space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="/assets/ai_city.jpg"
                      alt="نزل تراثي"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="font-black text-sm text-[#0F172A]">
                        {isAr ? "نزل وأجنحة التراث العريق" : "Heritage Boutique Suites"}
                      </div>
                      <div className="text-xs text-amber-500 font-bold">★★★★☆ · {isAr ? "أصالة وأجواء تراثية" : "Heritage Stay"}</div>
                      <div className="text-[11px] text-[#003580] font-black mt-0.5">
                        {isAr ? "ابتداءً من 320 د.ل (خصم خاص)" : "From 320 LYD"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-[#E8E2D6]">
                    <a
                      href="tel:0925556677"
                      className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs text-center transition flex items-center justify-center gap-1"
                    >
                      <span>📞</span>
                      <span>0925556677</span>
                    </a>
                    <Link
                      to="/hotels"
                      className="py-1.5 px-3 rounded-xl bg-[#003580] text-white font-black text-xs text-center transition"
                    >
                      {isAr ? "تفاصيل الفندق" : "Details"}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* 6. Partner Dining & Restaurants Included Section */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E8E2D6] shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-[#003580] flex items-center gap-2">
                    <span>🍽️</span>
                    <span>{isAr ? "المطاعم والمقاهي الشريكة المشمولة في برنامج الرحلة:" : "Included Partner Restaurants & Cafes:"}</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">
                    {isAr ? "وجبات غداء شعبية ليبية ومأكولات بحرية طازجة وشاي باللوز في أرقى المطاعم" : "Authentic Libyan feasts & fresh seafood"}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0F172A]">
                      {isAr ? "مطعم الحوش للتراث والمأكولات الشعبية" : "Al-Housh Heritage Restaurant"}
                    </span>
                    <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {isAr ? "شامل الغداء بالرحلة" : "Lunch Included"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {isAr ? "أشهى أطباق الكسكسي بالبصلة، البازين، والمشروبات الليبية والشوربة مع جلسات عربية مريحة." : "Authentic couscous, bazeen, and traditional hospitality."}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] text-xs font-bold text-[#003580]">
                    <span>📍 {info.departurePoint.includes("طرابلس") ? "طرابلس - المدينة القديمة" : "بنغازي - شارع فينيسيا"}</span>
                    <a href="tel:0914445566" className="text-emerald-700 font-black hover:underline">📞 0914445566</a>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-[#0F172A]">
                      {isAr ? "مقهى زنقة الفندق التراثي والضيافة" : "Traditional Heritage Cafe"}
                    </span>
                    <span className="text-[10px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full">
                      {isAr ? "شامل الضيافة والتذوق" : "Hospitality Included"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {isAr ? "جلسة استراحة وضيافة حلويات مقروض وغريبة ليبية في أجواء ساحرة." : "Traditional hospitality break with authentic Libyan sweets."}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-[#E8E2D6] text-xs font-bold text-[#003580]">
                    <span>☕ {isAr ? "ضيافة تراثية خاصة لرواد الرحلة" : "Special Hospitality"}</span>
                    <Link to="/restaurants" className="font-black underline">{isAr ? "قائمة المقاهي" : "Cafes"}</Link>
                  </div>
                </div>
              </div>
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
                onClick={onBook}
                className="w-full py-3.5 rounded-2xl bg-[#D96B27] hover:bg-[#c25a1b] text-white font-black text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{trip.type === "private" ? (isAr ? "طلب تصميم الرحلة الخاصة" : "Request Custom Tour") : (isAr ? "حجز مقاعدك الآن" : "Book Your Seat Now")}</span>
                <span>➔</span>
              </button>
            </div>

            {/* Transport Card - STRICTLY: Vehicle, Company, Driver */}
            <div className="bg-white rounded-3xl p-5 border border-[#E8E2D6] shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-[#003580] flex items-center gap-1.5">
                  <span>🚌</span>
                  <span>{isAr ? "المركبة الناقلة المعتمدة للرحلة:" : "Approved Transport Vehicle:"}</span>
                </span>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {isAr ? "مفحوصة ومعتمدة" : "Inspected"}
                </span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6] space-y-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">{isAr ? "نوع وموديل المركبة:" : "Vehicle Type:"}</span>
                  <span className="font-black text-[#0F172A]">{info.vehicle.model}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">{isAr ? "الشركة المشغلة:" : "Operating Company:"}</span>
                  <span className="font-bold text-[#003580]">{info.vehicle.company}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold">{isAr ? "السائق المكلف:" : "Assigned Driver:"}</span>
                  <span className="font-black text-emerald-800">👨‍✈️ {info.vehicle.driver}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenVehicleDetails?.({
                  model: info.vehicle.model,
                  company: info.vehicle.company,
                  driver: info.vehicle.driver,
                })}
                className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 text-[#003580] font-black text-xs border border-[#E8E2D6] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>🔍</span>
                <span>{isAr ? "فحص مواصفات الأمان والسلامة" : "Inspect Safety Specs"}</span>
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

          </div>

        </div>
      </div>

      <FloatingRecommendations trip={trip} />
    </div>
  );
}

/* ============================================================ */
/* FLOATING RECOMMENDATIONS WIDGET (RESTAURANTS & HOTELS)       */
/* ============================================================ */
function FloatingRecommendations({ trip }: { trip: Trip }) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [isOpen, setIsOpen] = useState(false);

  // Extract cities/locations related to the trip
  const tripLocations: string[] = [];
  if ("departure" in trip && trip.departure) tripLocations.push(trip.departure);
  if ("cities" in trip && trip.cities) tripLocations.push(...trip.cities);
  
  // Also check keywords in title/desc
  const searchStr = `${trip.title} ${trip.description}`.toLowerCase();
  ["طرابلس", "بنغازي", "الخمس", "لبدة", "شحات", "غدامس", "أوباري", "صبراتة"].forEach(city => {
    if (searchStr.includes(city) && !tripLocations.includes(city)) tripLocations.push(city);
  });
  
  // Map some names and get relevant places
  const relevantPlaces = nearbyPlaces.filter(place => 
    tripLocations.some(loc => 
      place.city.includes(loc) || loc.includes(place.city) || (loc.includes("لبدة") && place.city.includes("الخمس"))
    )
  );

  // Fallback to top 4 places if none matched
  const displayPlaces = relevantPlaces.length > 0 ? relevantPlaces.slice(0, 5) : nearbyPlaces.slice(0, 5);

  return (
    <>
      {/* Floating Action Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-tr from-[#D96B27] to-[#EA580C] text-white shadow-[0_10px_25px_rgba(217,107,39,0.5)] hover:scale-110 active:scale-95 transition-all cursor-pointer animate-bounce border-2 border-white/50"
        title={isAr ? "مطاعم وفنادق قريبة" : "Nearby Dining & Stays"}
      >
        <span className="text-3xl drop-shadow-md">✨</span>
        {/* Notification badge */}
        <span className="absolute -top-1 -right-1 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-400 border-2 border-white items-center justify-center text-[10px] font-black text-[#003580]">{displayPlaces.length}</span>
        </span>
      </button>

      {/* Pop-up Modal / Side Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-end sm:justify-start p-4 sm:p-10 pointer-events-none" dir={dir}>
          {/* Backdrop for mobile */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm sm:hidden pointer-events-auto" onClick={() => setIsOpen(false)} />
          
          <div className="relative bg-white w-full sm:w-[420px] rounded-[32px] shadow-2xl border border-[#E8E2D6] overflow-hidden pointer-events-auto flex flex-col max-h-[75vh] animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#003580] to-[#1B5A78] p-5 text-white flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
              <div className="relative z-10">
                <h3 className="font-black text-xl flex items-center gap-2">
                  <span>🗺️</span>
                  <span>{isAr ? "اكتشف الجوار" : "Discover Nearby"}</span>
                </h3>
                <p className="text-xs text-blue-100 font-bold mt-1.5 opacity-90">
                  {isAr ? "فنادق ومطاعم مقترحة بالقرب من مسار رحلتك" : "Recommended hotels & restaurants near your trip"}
                </p>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors cursor-pointer text-lg shrink-0 relative z-10 border border-white/20"
                title={isAr ? "إغلاق" : "Close"}
              >
                ✕
              </button>
            </div>
            
            {/* List */}
            <div className="overflow-y-auto p-5 space-y-4 bg-[#FAF7F2]">
              {displayPlaces.map(place => (
                <div key={place.id} className="group flex gap-4 p-4 rounded-3xl bg-white border border-[#E8E2D6] hover:border-[#D96B27] hover:shadow-lg transition-all cursor-pointer items-center">
                  <div className="relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden shadow-sm">
                    <img src={place.img} alt={place.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-md px-1.5 py-0.5 rounded-lg text-[10px] font-black text-amber-500 shadow-sm flex items-center gap-0.5">
                      ★ {place.rating}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-black text-[#003580] mb-1">
                      <span className="bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                        {place.category === 'hotel' || place.category === 'resort' || place.category === 'heritage' || place.category === 'apartment' ? '🏨' : '🍽️'}
                        {place.city}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-[#0F172A] leading-tight mb-1 group-hover:text-[#D96B27] transition-colors">{place.name}</h4>
                    <p className="text-[11px] text-slate-500 font-bold line-clamp-1 mb-1">📍 {place.area}</p>
                    <div className="text-[11px] font-black text-[#D96B27] bg-orange-50 inline-block px-2 py-0.5 rounded-full border border-orange-100">
                      🎁 {place.perk}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 text-center">
                <Link
                  to="/hotels"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#003580] hover:bg-[#1B5A78] text-white text-xs font-black shadow-md transition-all cursor-pointer w-full"
                >
                  <span>{isAr ? "تصفح جميع الفنادق والمطاعم" : "Browse all places"}</span>
                  <span>➔</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================ */
/* 3. SPECIAL OFFERS SPOTLIGHT (STACKED CARDS DECK & CORNER TAG) */
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
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [offerIndex, setOfferIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentOffer = offers[offerIndex] || offers[0];

  // Auto-rotate every 5 seconds if not hovered
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setOfferIndex((prev) => (prev + 1) % offers.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isPaused, offers.length]);

  const handleNextOffer = () => {
    setOfferIndex((prev) => (prev + 1) % offers.length);
  };

  const handlePrevOffer = () => {
    setOfferIndex((prev) => (prev - 1 + offers.length) % offers.length);
  };

  // Stack of photos for the offer
  const photos = currentOffer.gallery && currentOffer.gallery.length > 0
    ? currentOffer.gallery
    : [currentOffer.img, heroImg, destTripoli];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="bg-gradient-to-br from-[#FFF9F5] via-white to-[#FEF3EB] rounded-3xl p-6 sm:p-10 border-2 border-orange-100 shadow-xl relative overflow-hidden transition-all"
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
          <p className="text-xs text-[#5A6A85] font-semibold">
            {isAr
              ? "انقر على كروت العرض أو انتظر 5 ثوانٍ للتقليب التلقائي بين العروض المخفضة"
              : "Click the cards deck or wait 5 seconds to auto-rotate between offers"}
          </p>
        </div>

        {/* Main Grid: Info on Right (RTL), 3D Stacked Deck on Left */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Offer Info Side (7 cols) */}
          <div className="lg:col-span-7 space-y-4 text-right">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-gradient-to-r from-red-600 to-[#D96B27] text-white font-black text-xs shadow-xs">
                🔥 {currentOffer.tag}
              </span>
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-xs border border-amber-200">
                {currentOffer.kind === "daily" ? (isAr ? "☀️ رحلة يومية (9 ص - 9 م)" : "☀️ Daily Tour") : (isAr ? "🗓️ رحلة أسبوعية" : "🗓️ Weekly Tour")}
              </span>
              <span className="text-xs font-bold text-[#003580] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                📍 {currentOffer.departure}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-[#0F172A] leading-snug">
              {currentOffer.title}
            </h3>

            <div className="text-sm font-bold text-[#D96B27]">
              {currentOffer.sub}
            </div>

            <p className="text-xs sm:text-sm text-[#526078] leading-relaxed font-medium bg-white p-4 rounded-2xl border border-[#E8E2D6] shadow-xs">
              {currentOffer.perk}
            </p>

            {/* Price & Action Row */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-[#E8E2D6]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#5A6A85] font-bold line-through">
                    {isAr ? `السعر السابق: ${currentOffer.oldPrice} د.ل` : `Was: ${currentOffer.oldPrice}`}
                  </span>
                  <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
                    {isAr ? `وفر ${Number(currentOffer.oldPrice.replace(/,/g, "")) - Number(currentOffer.price.replace(/,/g, ""))} د.ل` : "Discounted"}
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-[#D96B27] mt-0.5">
                  {currentOffer.price} <span className="text-xs font-bold text-slate-600">{isAr ? "د.ل / للمقعد" : "LYD"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onDetails(currentOffer)}
                  className="py-3 px-5 rounded-2xl bg-white hover:bg-slate-50 text-[#003580] font-black text-xs border border-[#E8E2D6] shadow-xs transition cursor-pointer"
                >
                  {isAr ? "تفاصيل العرض" : "Offer Details"}
                </button>
                <button
                  type="button"
                  onClick={() => onBook(currentOffer)}
                  className="py-3 px-6 rounded-2xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs shadow-md transition cursor-pointer flex items-center gap-1.5"
                >
                  <span>{isAr ? "احجز هذا العرض الآن" : "Book Offer Now"}</span>
                  <span className="text-sm">➔</span>
                </button>
              </div>
            </div>

            {/* Carousel Dots & Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-1.5">
                {offers.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setOfferIndex(dotIdx)}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === offerIndex ? "w-7 bg-[#D96B27]" : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                    title={`عرض ${dotIdx + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                <button
                  type="button"
                  onClick={handlePrevOffer}
                  className="w-8 h-8 rounded-full bg-white border border-[#E8E2D6] hover:bg-slate-50 flex items-center justify-center text-sm cursor-pointer shadow-xs"
                  title="السابق"
                >
                  {dir === "rtl" ? "→" : "←"}
                </button>
                <span>{offerIndex + 1} / {offers.length}</span>
                <button
                  type="button"
                  onClick={handleNextOffer}
                  className="w-8 h-8 rounded-full bg-white border border-[#E8E2D6] hover:bg-slate-50 flex items-center justify-center text-sm cursor-pointer shadow-xs"
                  title="التالي"
                >
                  {dir === "rtl" ? "←" : "→"}
                </button>
              </div>
            </div>
          </div>

          {/* Interactive 3D Stacked Photos Deck (5 cols) with Corner Triangle Ribbon */}
          <div className="lg:col-span-5 relative flex justify-center py-6">
            <div
              onClick={handleNextOffer}
              className="relative w-64 h-80 sm:w-72 sm:h-96 cursor-pointer group select-none"
              title={isAr ? "انقر للتقليب للعرض التالي" : "Click to view next offer"}
            >
              {photos.slice(0, 4).map((photoUrl, pIdx) => {
                const diff = pIdx;

                let styleClass = "";
                if (diff === 0) {
                  styleClass = "translate-x-0 translate-y-0 rotate-0 scale-100 shadow-2xl border-4 border-white opacity-100 z-30";
                } else if (diff === 1) {
                  styleClass = "translate-x-5 -translate-y-3 rotate-6 scale-95 shadow-xl border-4 border-white/90 opacity-90 z-20";
                } else if (diff === 2) {
                  styleClass = "translate-x-10 -translate-y-6 rotate-12 scale-90 shadow-md border-4 border-white/80 opacity-75 z-10";
                } else {
                  styleClass = "translate-x-12 -translate-y-8 rotate-18 scale-85 opacity-0 z-0";
                }

                return (
                  <div
                    key={`${currentOffer.id}-${pIdx}`}
                    className={`absolute inset-0 rounded-[30px] overflow-hidden transition-all duration-300 transform ${styleClass}`}
                  >
                    <img
                      src={photoUrl}
                      alt={currentOffer.title}
                      loading="lazy"
                      className="w-full h-full object-cover brightness-100 group-hover:scale-108 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />

                    {/* Prominent Corner Triangle Discount Ribbon on Top-Right */}
                    {diff === 0 && (
                      <div className="absolute top-0 right-0 w-24 h-24 overflow-hidden z-30 pointer-events-none">
                        <div className="absolute transform rotate-45 bg-gradient-to-r from-red-600 via-[#EA580C] to-[#D96B27] text-white font-black text-[11px] py-1 right-[-35px] top-[20px] w-[130px] text-center shadow-lg border-b border-white/40">
                          {currentOffer.tag}
                        </div>
                      </div>
                    )}

                    {/* Card Footer Info */}
                    {diff === 0 && (
                      <div className="absolute bottom-4 inset-x-4 text-white z-20">
                        <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-amber-300 text-[10px] font-black border border-white/20 inline-block mb-1">
                          📍 {currentOffer.departure}
                        </span>
                        <h4 className="font-black text-sm text-white drop-shadow-md truncate">
                          {currentOffer.title}
                        </h4>
                        <div className="text-xs text-amber-300 font-black mt-0.5">
                          {currentOffer.price} د.ل
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D96B27]/10 text-[#D96B27] text-xs font-black border border-[#D96B27]/25">
            <span>📍</span>
            <span>{isAr ? "تحديد الموقع الجغرافي المباشر" : "Nearby Accommodation & Dining"}</span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#003580] tracking-tight">
            {isAr ? "حدد موقعك واستكشف الفنادق والمطاعم المجاورة" : "Locate Nearby Hotels, Resorts & Partner Dining"}
          </h3>
          <p className="text-xs text-slate-600 font-medium">
            {isAr
              ? "استكشف أماكن الإقامة والنزل والمطاعم والمقاهي المتعاقد معها القريبة من موقعك أو نقطة انطلاق رحلتك."
              : "Find partner hotels and dining near your trip departure point or current location."}
          </p>

          {/* Quick Location Action & Status */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isDetecting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#003580] text-xs font-black border border-[#003580]/30 shadow-xs transition cursor-pointer hover:border-[#003580]"
            >
              <span>{isDetecting ? "⏳" : "📡"}</span>
              <span>{isAr ? "تحديد موقعي الجغرافي تلقائياً" : "Auto-detect My Location"}</span>
            </button>

            {geoStatus && (
              <span className="text-xs font-black text-[#D96B27] bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {geoStatus}
              </span>
            )}
          </div>
        </div>

        {/* Right Side (RTL Left): Direct Redirection Arrow Button To Hotels Page with Location Filter */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/hotels"
            search={{ city: selectedCity } as any}
            onClick={() => {
              sessionStorage.setItem("dallani_selected_city", selectedCity);
            }}
            className="px-7 py-4 rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#D96B27] hover:brightness-110 text-white font-black text-xs sm:text-sm shadow-lg shadow-orange-500/25 transition-all flex items-center justify-center gap-2.5 cursor-pointer hover:scale-105 active:scale-95 text-center"
            title={isAr ? "الانتقال لواجهة الفنادق" : "Go to Hotels"}
          >
            <span>{isAr ? `الانتقال إلى فنادق ومطاعم ${selectedCity}` : `Explore Stays in ${selectedCity}`}</span>
            <span className="text-lg font-black transition-transform group-hover:translate-x-1">➔</span>
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

  const allTrips = useMemo(
    () => [...dailyTrips, ...weeklyTrips, ...privateTemplates],
    []
  );

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
          }}
          kind={scheduleKind}
          customTitle={scheduleTripTitle}
          customImage={scheduleTripImage}
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
              <div className="text-xs font-black text-[#003580] bg-[#EBF3FF] px-3.5 py-2 rounded-xl border border-blue-100 flex items-center gap-1.5">
                <span>🎯</span>
                <span>{isAr ? `إجمالي الرحلات المتاحة: ${filtered.length}` : `Available Tours: ${filtered.length}`}</span>
              </div>

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
                  { id: "daily", label: isAr ? "رحلات يومية" : "Daily Tours", icon: "☀️", count: dailyTrips.length },
                  { id: "weekly", label: isAr ? "رحلات أسبوعية" : "Weekly Tours", icon: "🗺️", count: weeklyTrips.length },
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
                    label: isAr ? "طرابلس (المنطقة الغربية)" : "Tripoli",
                    count: allTrips.filter((t) => "departure" in t && t.departure === "طرابلس").length,
                  },
                  {
                    id: "بنغازي",
                    label: isAr ? "بنغازي (المنطقة الشرقية)" : "Benghazi",
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
      {/* 2. ATTRACTIVE TOURS OVERVIEW SECTION (نبذة عن الرحلات)       */}
      {/* ============================================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="text-center max-w-3xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3FF] text-[#003580] text-xs font-black border border-blue-100 mb-2">
            <span>✨</span>
            <span>{isAr ? "دليلك الشامل لبرامج وتجارب دلّني" : "Your Comprehensive Guide to Dallani Tours"}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#003580] tracking-tight">
            {isAr ? "رحلات صُممت لتمنحك استكشافاً ليبياً أصيلاً" : "Tailored Expeditions for Authentic Discovery"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
            {isAr
              ? "سواء كنت تبحث عن جولة يومية متكاملة لزيارة المعالم التاريخية والتراثية، أو بعثة أسبوعية لمغامرات الصحراء الكبرى، أو تريد تصميم رحلتك الخاصة بكل تفاصيلها، نحن هنا لنضمن لك تجربة استثنائية."
              : "Whether you seek daily cultural excursions, weekly multi-day desert safaris, or custom private tours designed by you."}
          </p>
        </div>

        {/* 3 Interactive Cards - Compact & Concise */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Daily Tours */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#E8E2D6] hover:border-[#003580] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                ☀️
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100/70 text-amber-900 text-[10px] font-black">
                {isAr ? "من 09:00 ص إلى 09:00 م" : "09:00 AM - 09:00 PM"}
              </div>
              <h3 className="text-base font-black text-[#003580]">
                {isAr ? "الرحلات اليومية المنظمة" : "Daily Organized Tours"}
              </h3>
              <p className="text-[11px] text-slate-600 leading-normal font-medium">
                {isAr
                  ? "جولات يومية مكثفة للمعالم الأثرية والمنتزهات مع وجبة غداء فاخرة."
                  : "Comprehensive 12-hour day tours covering historical landmarks & heritage lunch."}
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-[#1B5A78] space-y-1">
                <div>📍 {isAr ? "انطلاق من طرابلس وبنغازي" : "Departs from Tripoli & Benghazi"}</div>
                <div>🚌 {isAr ? "مركبات سياحية VIP مكيفة" : "VIP air-conditioned transport"}</div>
              </div>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-[#003580]">{isAr ? "تبدأ من 120 د.ل" : "From 120 LYD"}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedTypes(["daily"]);
                  scrollContainerRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-black text-[#D96B27] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "استعراض اليومية" : "View Tours"}</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          {/* Pillar 2: Weekly Expeditions */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border-2 border-[#E8E2D6] hover:border-[#1B5A78] shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                🗓️
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-100/70 text-[#003580] text-[10px] font-black">
                {isAr ? "برامج ٤ إلى ٧ أيام" : "4 - 7 Days All-Inclusive"}
              </div>
              <h3 className="text-base font-black text-[#003580]">
                {isAr ? "الرحلات والبعثات الأسبوعية" : "Weekly Expeditions"}
              </h3>
              <p className="text-[11px] text-slate-600 leading-normal font-medium">
                {isAr
                  ? "مغامرات متعددة الأيام لاستكشاف سحر الصحراء (أوباري، أكاكوس) وغدامس والجبل الأخضر."
                  : "Multi-day expeditions across Sahara dunes, Acacus, and UNESCO Ghadames."}
              </p>
              <div className="pt-2 border-t border-slate-100 text-[11px] font-bold text-[#1B5A78] space-y-1">
                <div>🏕️ {isAr ? "إقامة مخيمات صحراوية ونزل تراثية" : "Desert camps & heritage lodges"}</div>
                <div>🚙 {isAr ? "سيارات دفع رباعي وسائقون معتمدون" : "4x4 SUVs & native desert drivers"}</div>
              </div>
            </div>
            <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-black text-[#003580]">{isAr ? "شامل الإقامة والنقل" : "All inclusive"}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedTypes(["weekly"]);
                  scrollContainerRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-black text-[#D96B27] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isAr ? "استعراض الأسبوعية" : "View Expeditions"}</span>
                <span>➔</span>
              </button>
            </div>
          </div>

          {/* Pillar 3: Custom Private Tours */}
          <div className="bg-gradient-to-br from-[#0B132B] via-[#003580] to-[#1B5A78] text-white rounded-2xl p-4 sm:p-5 border-2 border-white/20 shadow-lg flex flex-col justify-between group">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-xl shadow-xs group-hover:scale-105 transition-transform">
                👑
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                {isAr ? "تصميم مخصص بالكامل" : "100% Customized"}
              </div>
              <h3 className="text-base font-black text-white">
                {isAr ? "أنشئ رحلتك الخاصة بنفسك" : "Create Private Tour"}
              </h3>
              <p className="text-[11px] text-slate-200 leading-normal font-medium">
                {isAr
                  ? "صمّم رحلتك بحرية! حدد الوجهات والمواعيد والمسار، وسيلة النقل، والمرشد بالاسم."
                  : "Design your tour! Pick destinations, dates, transport mode, and certified guide."}
              </p>
              <div className="pt-2 border-t border-white/15 text-[11px] font-bold text-amber-200 space-y-1">
                <div>✓ {isAr ? "خصوصية تامة لعائلتك أو مجموعتك" : "Full Privacy"}</div>
                <div>✓ {isAr ? "عرض سعر وخطة خلال 24 ساعة" : "Plan & quote in 24 hrs"}</div>
              </div>
            </div>
            <div className="pt-3 mt-2 border-t border-white/15 flex items-center justify-between">
              <span className="text-xs font-black text-amber-300">{isAr ? "تخصيص فوري" : "Instant"}</span>
              <button
                type="button"
                onClick={() => setPrivateOpen(true)}
                className="py-1.5 px-3.5 rounded-lg bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white text-xs font-black shadow-md transition cursor-pointer flex items-center gap-1"
              >
                <span>{isAr ? "صمم رحلتك الآن" : "Design Tour"}</span>
                <span>✨</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. SPECIAL OFFERS SPOTLIGHT (INTERACTIVE 3D STACKED DECK)    */}
      {/* ============================================================ */}
      <SpecialOffersSpotlight
        offers={tripOffers}
        onDetails={(offer) => {
          const cleanTitle = offer.title.replace("عرض ", "").replace("رحلة ", "").trim();
          const matchingTrip = allTrips.find((t) =>
            t.title.includes(cleanTitle) || cleanTitle.includes(t.title) ||
            ("cities" in t && t.cities.some((c) => offer.title.includes(c)))
          ) || allTrips[0];
          setActiveTripDetails(matchingTrip);
          window.scrollTo({ top: 0, behavior: "instant" });
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
            {filtered.map((t, idx) => (
              <div key={t.id} className="shrink-0">
                <TripCard
                  t={t}
                  index={idx}
                  onDetails={() => {
                    setActiveTripDetails(t);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  onBook={() => {
                    if (t.type === "private") {
                      setPrivateOpen(true);
                      return;
                    }
                    setScheduleKind(t.type);
                    setScheduleTripTitle(t.title);
                    setScheduleTripImage(t.img);
                    setCustomSchedules((t as any).schedules);
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {filtered.length === 0 && (
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
                  ? "أنت من يحدد مسار الرحلة والوجهات التي ترغب بزيارتها، وتاريخ الانطلاق، ونوع سيارة الدفع الرباعي أو الحافلة، والمرشد السياحي المعتمد الذي ترغب بمرافقته. نحن نتولى التنفيذ بكل احترافية."
                  : "You define the route, destinations, departure dates, 4x4 or luxury vehicle, and personal certified guide. We execute every detail to perfection."}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-1 text-xs font-bold text-amber-200">
                <span className="flex items-center gap-1.5">✓ {isAr ? "خصوصية تامة لعائلتك أو مجموعتك" : "Full Privacy"}</span>
                <span className="flex items-center gap-1.5">✓ {isAr ? "اختيار مرشدك وسائقك المفضل" : "Pick Your Guide & Driver"}</span>
                <span className="flex items-center gap-1.5">✓ {isAr ? "مرونة كاملة في المسار والمواعيد" : "Flexible Itinerary"}</span>
              </div>
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
        }}
        kind={scheduleKind}
        customTitle={scheduleTripTitle}
        customImage={scheduleTripImage}
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
  onDetails,
  onBook,
}: {
  t: Trip;
  index?: number;
  onDetails: () => void;
  onBook: () => void;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const seatsAvailable = "availableSeats" in t ? t.availableSeats : undefined;
  const targetPersons = "targetPersons" in t ? t.targetPersons : undefined;

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
      {/* Full Bleed Photo Background */}
      <img
        src={t.img}
        alt={t.title}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-100 contrast-100"
      />

      {/* Clean Subtle Gradient for High Contrast Typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Top Floating Badges */}
      <div className="relative z-10 p-5 flex items-center justify-between gap-2">
        <span className="px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white font-black text-xs shadow-md border border-white/25">
          {t.type === "daily"
            ? (isAr ? "☀️ رحلة يومية" : "☀️ Daily Tour")
            : t.type === "weekly"
            ? (isAr ? "🗓️ أسبوعية" : "🗓️ Weekly")
            : (isAr ? "👑 خاصة VIP" : "👑 Private VIP")}
        </span>

        {t.type !== "private" ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 backdrop-blur-md text-white font-black text-xs shadow-md border border-white/25">
            <span className="text-amber-300 font-black">★ {t.rating}</span>
            <span className="text-[10px] text-white/80 font-bold">{isAr ? "ممتاز" : "Superb"}</span>
          </div>
        ) : (
          <span className="px-3 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-white font-black text-xs shadow-md border border-white/25">
            👑 {isAr ? "تخصيص كامل" : "Customized"}
          </span>
        )}
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
            <span className="shrink-0 text-[10px] bg-white/25 px-2.5 py-0.5 rounded-full text-white font-bold backdrop-blur-md border border-white/20">
              {isAr ? `متبقي ${seatsAvailable} مقاعد` : `${seatsAvailable} left`}
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

          {/* Action Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDetails();
            }}
            className="py-2 px-4 rounded-2xl bg-white hover:bg-slate-100 text-[#003580] font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
          >
            <span>{isAr ? "عرض التفاصيل" : "Details"}</span>
            <span className="text-sm">➔</span>
          </button>
        </div>
      </div>
    </article>
  );
}
