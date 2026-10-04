import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useRef, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { RestaurantDetailsModal } from "@/components/RestaurantDetailsModal";

export const Route = createFileRoute("/restaurants")({
  head: () => ({
    meta: [
      { title: "المطاعم والمقاهي في ليبيا | منصة دلّني" },
      { name: "description", content: "اكتشف أفضل المطاعم والمقاهي في ليبيا مع دليل المأكولات والتقييمات المعتمدة." },
    ],
  }),
  component: RestaurantsPage,
});

type Restaurant = {
  id: string;
  name: string;
  category: "seafood" | "traditional" | "fastfood" | "cafe";
  type: string;
  city: string;
  address: string;
  phone: string;
  mapsQuery: string;
  rating: number;
  ratingWord: string;
  reviewsCount: number;
  priceRange: string;
  hours: string;
  specialty: string;
  photos: string[];
  signatureDishes: string[];
  features: string[];
};

function getRestaurants(lang: "ar" | "en"): Restaurant[] {
  const isAr = lang === "ar";
  return [
    // 1. مأكولات شعبية وتراثية
    {
      id: "REST-001",
      name: isAr ? "مطعم السراي القديم" : "Old Saraya Restaurant",
      category: "traditional",
      type: isAr ? "مأكولات شعبية وتراثية" : "Traditional Libyan Food",
      city: isAr ? "طرابلس" : "Tripoli",
      address: isAr ? "المدينة القديمة، بجوار السرايا الحمراء، طرابلس" : "Old City, near Red Castle, Tripoli",
      phone: "0915556677",
      mapsQuery: "Old+City+Tripoli+Libya",
      rating: 9.2,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 1420,
      priceRange: isAr ? "35 - 85 د.ل للشخص" : "35 - 85 LYD / person",
      hours: isAr ? "11:00 ص – 11:30 م" : "11:00 AM – 11:30 PM",
      specialty: isAr ? "كسكسي بالبصلة، مبطن، حساء الدشيشة الطرابلسي" : "Couscous, Mbatten, Libyan Soup",
      signatureDishes: [
        isAr ? "كسكسي طرابلسي باللحم الوطني" : "Traditional Couscous with Local Lamb",
        isAr ? "مبطن طرابلسي مقرمش وبوريك" : "Crispy Mbatten & Burek",
        isAr ? "شاي رغوي باللوز المحمص" : "Almond Foam Tea",
      ],
      features: [
        isAr ? "جلسات عائلية خاصة" : "Private Family Seating",
        isAr ? "أجواء أثرية وتاريخية" : "Historic Atmosphere",
        isAr ? "واي فاي مجاني" : "Free WiFi",
      ],
      photos: [
        "/assets/restaurant-libya.jpg",
        "/assets/dest-tripoli-medina.jpg",
        "/assets/dest-tripoli-old-city.jpg",
      ],
    },
    {
      id: "REST-003",
      name: isAr ? "مطعم ومشاوي الجبل الأخضر" : "Green Mountain Grill & Lodge",
      category: "traditional",
      type: isAr ? "مشاوي وأكلات شعبية جبلية" : "Mountain BBQ & Steaks",
      city: isAr ? "شحات" : "Shahhat",
      address: isAr ? "شحات، بجوار الآثار الإغريقية" : "Shahhat, near Cyrene Ruins",
      phone: "0911112233",
      mapsQuery: "Shahhat+Libya",
      rating: 9.4,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 1680,
      priceRange: isAr ? "45 - 95 د.ل للشخص" : "45 - 95 LYD / person",
      hours: isAr ? "10:00 ص – 11:00 م" : "10:00 AM – 11:00 PM",
      specialty: isAr ? "لحم وطني حولي مشوي، شربة ليبية، خبز تنور" : "Pit Roast Lamb, Mountain Herbs, Tannur Bread",
      signatureDishes: [
        isAr ? "مشوي حولي برقاوي على الفحم" : "Traditional Pit Roasted Lamb",
        isAr ? "شربة ليبية جبلية بالأعشاب" : "Wild Herb Libyan Soup",
        isAr ? "شاي الجبل الأخضر بالزعتر" : "Mountain Thyme Green Tea",
      ],
      features: [
        isAr ? "جلسات في الهواء الطلق وسط الغابات" : "Outdoor Forest Seating",
        isAr ? "ألعاب أطفال وحديقة" : "Kids Play Area & Garden",
      ],
      photos: [
        "/assets/restaurant-libya.jpg",
        "/assets/dest-jabal-akhdar-valley.jpg",
        "/assets/dest-jabal-akhdar-forest.jpg",
      ],
    },
    {
      id: "REST-004",
      name: isAr ? "مطعم دار غدامس للضيافة" : "Dar Ghadames Hospitality Restaurant",
      category: "traditional",
      type: isAr ? "مأكولات صحراوية وتراثية" : "Desert Oasis Traditional Food",
      city: isAr ? "غدامس" : "Ghadames",
      address: isAr ? "المدينة القديمة، غدامس" : "Old Town, Ghadames",
      phone: "0918883344",
      mapsQuery: "Old+Town+Ghadames+Libya",
      rating: 9.1,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 750,
      priceRange: isAr ? "40 - 80 د.ل للشخص" : "40 - 80 LYD / person",
      hours: isAr ? "12:00 م – 10:30 م" : "12:00 PM – 10:30 PM",
      specialty: isAr ? "بازين باللحم، فتات غدامسي، تمر باللوز" : "Bazin with Lamb, Ghadames Fteat",
      signatureDishes: [
        isAr ? "البازين التراثي بزيت الزيتون واللحم" : "Authentic Bazin with Lamb",
        isAr ? "فتات غدامسي تقليدي" : "Traditional Ghadames Flatbread",
      ],
      features: [
        isAr ? "جلسات أرضية تراثية مغطاة" : "Traditional Floor Seating",
        isAr ? "طقوس شاي بدوية أصيلة" : "Nomadic Tea Ceremony",
      ],
      photos: [
        "/assets/restaurant-libya.jpg",
        "/assets/dest-ghadames-oasis.jpg",
        "/assets/dest-ghadames-clean.jpg",
      ],
    },

    // 2. مأكولات بحرية
    {
      id: "REST-002",
      name: isAr ? "مقهى ومطعم الأندلس البحري" : "Al Andalus Seafood & Cafe",
      category: "seafood",
      type: isAr ? "مأكولات بحرية وعالمية" : "Fresh Seafood & Mediterranean",
      city: isAr ? "بنغازي" : "Benghazi",
      address: isAr ? "طريق الكورنيش، بنغازي" : "Corniche Road, Benghazi",
      phone: "0929998877",
      mapsQuery: "Corniche+Benghazi+Libya",
      rating: 8.9,
      ratingWord: isAr ? "ممتاز جداً" : "Very Good",
      reviewsCount: 980,
      priceRange: isAr ? "50 - 130 د.ل للشخص" : "50 - 130 LYD / person",
      hours: isAr ? "12:00 م – 12:00 منتصف الليل" : "12:00 PM – 12:00 Midnight",
      specialty: isAr ? "أسماك طازجة صيد يومي، جمبري مشوي، كسكسي بالحوت" : "Fresh Catch, Grilled Prawns, Seafood Couscous",
      signatureDishes: [
        isAr ? "دندوش وقاروص مشوي على الفحم" : "Charcoal Grilled Mediterranean Fish",
        isAr ? "طبق فواكه البحر المشكلة" : "Seafood Mixed Platter",
      ],
      features: [
        isAr ? "إطلالة بانورامية مباشرة على البحر" : "Direct Sea View",
        isAr ? "موقف سيارات مجاني" : "Free Parking",
      ],
      photos: [
        "/assets/ai_food.jpg",
        "/assets/dest-harbor-coast.jpg",
        "/assets/cafe-libya.jpg",
      ],
    },
    {
      id: "REST-005",
      name: isAr ? "مطعم الشاطئ البحري بالخمس" : "Khoms Seaside Seafood Restaurant",
      category: "seafood",
      type: isAr ? "مأكولات بحرية طازجة" : "Seafood & Grill",
      city: isAr ? "الخمس" : "Al-Khoms",
      address: isAr ? "شاطئ الخمس، بالقرب من لبدة الكبرى" : "Khoms Beach, near Leptis Magna",
      phone: "0924445566",
      mapsQuery: "Leptis+Magna+Al+Khoms+Libya",
      rating: 8.8,
      ratingWord: isAr ? "ممتاز" : "Excellent",
      reviewsCount: 890,
      priceRange: isAr ? "40 - 110 د.ل للشخص" : "40 - 110 LYD / person",
      hours: isAr ? "11:30 ص – 11:00 م" : "11:30 AM – 11:00 PM",
      specialty: isAr ? "سمك متوسطي مشوي ومقلي، أرز بالخلطة، حساء بحري" : "Fresh Catch Fish, Spiced Rice, Seafood Soup",
      signatureDishes: [
        isAr ? "سمك دندوش ومرجان صيد اليوم" : "Fresh Mediterranean Catch",
        isAr ? "أرز بالخلطة والمكسرات" : "Spiced Rice with Nuts",
      ],
      features: [
        isAr ? "إطلالة شاطئية مباشرة" : "Direct Seafront",
        isAr ? "استقبال المجموعات والوفود" : "Group Friendly",
      ],
      photos: [
        "/assets/ai_food.jpg",
        "/assets/dest-harbor-coast.jpg",
        "/assets/cafe-libya.jpg",
      ],
    },
    {
      id: "REST-006",
      name: isAr ? "مطعم مرسى الصيادين للأسماك" : "Fishermen Marina Seafood",
      category: "seafood",
      type: isAr ? "مأكولات بحرية طازجة" : "Seafood Market & Grill",
      city: isAr ? "طرابلس" : "Tripoli",
      address: isAr ? "ميناء طرابلس البحري، طريق الشط" : "Tripoli Port, Coast Road",
      phone: "0913339900",
      mapsQuery: "Tripoli+Port+Libya",
      rating: 9.3,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 1150,
      priceRange: isAr ? "45 - 120 د.ل للشخص" : "45 - 120 LYD / person",
      hours: isAr ? "12:00 م – 12:30 ص" : "12:00 PM – 12:30 AM",
      specialty: isAr ? "شوربة بحرية، كلماري مقرمش، وقار مشوي" : "Seafood Soup, Crispy Calamari, Grilled Grouper",
      signatureDishes: [
        isAr ? "وقار وبوري مشوي صيد الفجر" : "Fresh Dawn Catch Grouper",
        isAr ? "شوربة ثمار البحر الفاخرة" : "Rich Seafood Bisque",
      ],
      features: [
        isAr ? "جلسات مطلة على حوض الميناء" : "Harbor Views",
        isAr ? "اختيار السمك الطازج بالوزن" : "Weigh & Choose Fish",
      ],
      photos: [
        "/assets/ai_food.jpg",
        "/assets/dest-tripoli-harbor.jpg",
        "/assets/dest-harbor-coast.jpg",
      ],
    },

    // 3. وجبات سريعة وعصرية / الفاست فود
    {
      id: "REST-007",
      name: isAr ? "برجر بارك وكرانشي تاون" : "Burger Park & Crunchy Town",
      category: "fastfood",
      type: isAr ? "وجبات سريعة وبرجر عصري" : "Fast Food & Gourmet Burgers",
      city: isAr ? "طرابلس" : "Tripoli",
      address: isAr ? "منطقة النوفليين، بالقرب من مكتب الانطلاق" : "Nouflieen, Tripoli",
      phone: "0912224488",
      mapsQuery: "Nouflieen+Tripoli+Libya",
      rating: 9.0,
      ratingWord: isAr ? "ممتاز جداً" : "Superb",
      reviewsCount: 1320,
      priceRange: isAr ? "20 - 45 د.ل للوجبة" : "20 - 45 LYD / meal",
      hours: isAr ? "12:00 م – 02:00 ص" : "12:00 PM – 02:00 AM",
      specialty: isAr ? "سماش برجر باللحم الوطني، دجاج كرانشي، بطاطا مقرمشة" : "Smash Burgers, Crispy Chicken, Loaded Fries",
      signatureDishes: [
        isAr ? "دبل سماش ترافل برجر" : "Double Smash Truffle Burger",
        isAr ? "تندرز كرانشي مع صلصة البافلو" : "Crunchy Chicken Tenders",
        isAr ? "بطاطا مغطاة بالجبن والهالبينو" : "Loaded Cheddar Fries",
      ],
      features: [
        isAr ? "خدمة سريعة وسفري وتوصيل" : "Takeaway & Fast Service",
        isAr ? "جلسات شبابية وعائلية مريحة" : "Casual Indoor Seating",
      ],
      photos: [
        "/assets/ai_food.jpg",
        "/assets/restaurant-libya.jpg",
      ],
    },
    {
      id: "REST-008",
      name: isAr ? "مستر فاست فود وشاورما الساحل" : "Mr Fast Food & Shawarma",
      category: "fastfood",
      type: isAr ? "وجبات سريعة وشاورما" : "Fast Food & Shawarma",
      city: isAr ? "بنغازي" : "Benghazi",
      address: isAr ? "شارع فينيسيا، بنغازي" : "Venice Street, Benghazi",
      phone: "0925553311",
      mapsQuery: "Venice+Street+Benghazi+Libya",
      rating: 8.9,
      ratingWord: isAr ? "ممتاز" : "Very Good",
      reviewsCount: 940,
      priceRange: isAr ? "15 - 38 د.ل للوجبة" : "15 - 38 LYD / meal",
      hours: isAr ? "01:00 م – 01:30 ص" : "01:00 PM – 01:30 AM",
      specialty: isAr ? "شاورما عربي بالخبز الصاج، كريسبي رول، برجر" : "Arabic Shawarma, Crispy Rolls, Burgers",
      signatureDishes: [
        isAr ? "شاورما عربي مقطعة مع بطاطا وثومية" : "Arabic Shawarma Platter",
        isAr ? "ساندوتش فاهيتا زنجر حار" : "Spicy Zinger Fajita",
      ],
      features: [
        isAr ? "موقع استراتيجي بشارع فينيسيا" : "Prime Venice St Location",
        isAr ? "خدمة سريعة" : "Fast Takeout",
      ],
      photos: [
        "/assets/ai_food.jpg",
        "/assets/restaurant-libya.jpg",
      ],
    },

    // 4. مقاهي ومشاريب راقية
    {
      id: "REST-009",
      name: isAr ? "مقهى زنقة الفندق التراثي" : "Zanqat Al-Fondouk Heritage Cafe",
      category: "cafe",
      type: isAr ? "مقهى تراثي وشاي باللوز" : "Historic Cafe & Almond Tea",
      city: isAr ? "طرابلس" : "Tripoli",
      address: isAr ? "المدينة القديمة، زنقة الفندق، طرابلس" : "Old Town, Tripoli",
      phone: "0917772211",
      mapsQuery: "Old+City+Tripoli+Libya",
      rating: 9.5,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 1850,
      priceRange: isAr ? "8 - 25 د.ل" : "8 - 25 LYD",
      hours: isAr ? "08:00 ص – 11:30 م" : "08:00 AM – 11:30 PM",
      specialty: isAr ? "شاي باللوز رغوي، قهوة تركية، مقروض وغريبة" : "Foam Almond Tea, Turkish Coffee, Maqroudh",
      signatureDishes: [
        isAr ? "الشاي الطرابلسي الرغوي باللوز المحمص" : "Authentic Frothy Almond Tea",
        isAr ? "حلويات المقروض بالعسل والتمر" : "Honey Date Maqroudh",
      ],
      features: [
        isAr ? "أجواء أندلسية عريقة" : "Historic Andalusian Vibe",
        isAr ? "جلسات مشهورة في قلب أزقة المدينة" : "Cobblestone Alley Seating",
      ],
      photos: [
        "/assets/cafe-libya.jpg",
        "/assets/dest-tripoli-medina.jpg",
        "/assets/dest-tripoli-old-city.jpg",
      ],
    },
    {
      id: "REST-010",
      name: isAr ? "ريتاج كافيه وسبيشالتي كوفي" : "Retaj Specialty Cafe",
      category: "cafe",
      type: isAr ? "مقهى عصري وقهوة مختصة" : "Specialty Coffee & Pastry",
      city: isAr ? "بنغازي" : "Benghazi",
      address: isAr ? "شارع فينيسيا، بنغازي" : "Venice Street, Benghazi",
      phone: "0926661122",
      mapsQuery: "Venice+Street+Benghazi+Libya",
      rating: 9.1,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 820,
      priceRange: isAr ? "12 - 35 د.ل" : "12 - 35 LYD",
      hours: isAr ? "08:30 ص – 12:00 منتصف الليل" : "08:30 AM – 12:00 AM",
      specialty: isAr ? "قهوة V60 مختصة، فلات وايت، تشيز كيك التوت" : "V60 Drip Coffee, Flat White, Cheesecake",
      signatureDishes: [
        isAr ? "فلات وايت وحبوب بن أثيوبية فاخرة" : "Ethiopian Single Origin Flat White",
        isAr ? "سان سيباستيان تشيز كيك مع الشوكولاتة" : "San Sebastian Cheesecake",
      ],
      features: [
        isAr ? "بيئة عمل دراسية هادئة مع واي فاي" : "Work-Friendly with Fast WiFi",
        isAr ? "جلسات داخلية وخارجية راقية" : "Indoor & Outdoor Patios",
      ],
      photos: [
        "/assets/cafe-libya.jpg",
        "/assets/ai_food.jpg",
      ],
    },
  ];
}



interface RestaurantOffer {
  id: string;
  restId: string;
  title: string;
  category: string;
  badge: string;
  city: string;
  priceRange: string;
  details: string;
  discountPct: number;
  image: string;
  gallery: string[];
}

const RESTAURANT_OFFERS: RestaurantOffer[] = [
  {
    id: "RO-01",
    restId: "REST-001",
    title: "مأكولات القلعة البحرية — عرض صيد اليوم",
    category: "مأكولات بحرية",
    badge: "صيد بحري طازج",
    city: "طرابلس",
    priceRange: "45 - 85 د.ل",
    details: "عرض خاص يشمل سمك وقار صيد الفجر مشوي على الفحم مع شوربة ثمار البحر الفاخرة وسلطة الكلماري المقرمشة، بالإضافة إلى ضيافة الشاي باللوز.",
    discountPct: 20,
    image: "/assets/ai_food.jpg",
    gallery: [
      "/assets/ai_food.jpg",
      "/assets/dest-harbor-coast.jpg",
      "/assets/dest-tripoli-harbor.jpg",
    ],
  },
  {
    id: "RO-02",
    restId: "REST-003",
    title: "مطعم السرايا التراثي — وجبة البازين والكسكسي الفاخر",
    category: "مأكولات شعبية وتراثية",
    badge: "تراث ليبي أصيل",
    city: "طرابلس",
    priceRange: "35 - 65 د.ل",
    details: "وجبة تراثية طرابلسية متكاملة تضم قصعة بازين بلحم الضأن الوطني أو كسكسي بالبصلة، مصحوبة بالمبطن والسلطة العربية وشوربة الدشيشة الحارة.",
    discountPct: 25,
    image: "/assets/restaurant-libya.jpg",
    gallery: [
      "/assets/restaurant-libya.jpg",
      "/assets/dest-tripoli-medina.jpg",
      "/assets/dest-tripoli-old-city.jpg",
    ],
  },
  {
    id: "RO-03",
    restId: "REST-007",
    title: "برجر بارك وكرانشي تاون — كومبو السماش والجبن",
    category: "الفاست فود",
    badge: "وجبات سريعة وعصرية",
    city: "طرابلس",
    priceRange: "25 - 45 د.ل",
    details: "كومبو مزدوج من سماش برجر اللحم الوطني مع دجاج كرانشي حار وبطاطا لوديد بالجبن السائل، مع مشروب منعش وصوص الترافل الخاص.",
    discountPct: 20,
    image: "/assets/ai_food.jpg",
    gallery: [
      "/assets/ai_food.jpg",
      "/assets/restaurant-libya.jpg",
      "/assets/cafe-libya.jpg",
    ],
  },
  {
    id: "RO-04",
    restId: "REST-009",
    title: "مقهى زنقة الفندق التراثي — شاي باللوز ومقروض طرابلسي",
    category: "مقاهي ومشاريب",
    badge: "أجواء أندلسية عريقة",
    city: "طرابلس",
    priceRange: "12 - 25 د.ل",
    details: "جلسة شاي طرابلسي بالرغوة الغنية واللوز المحمص مع طبق حلويات مقروض بالتمر والعسل، في قلب أزقة المدينة القديمة التاريخية.",
    discountPct: 30,
    image: "/assets/cafe-libya.jpg",
    gallery: [
      "/assets/cafe-libya.jpg",
      "/assets/dest-tripoli-medina.jpg",
      "/assets/dest-tripoli-old-city.jpg",
    ],
  },
];

/* ============================================================ */
/* 3D RESTAURANT OFFERS SPOTLIGHT (MATCHING HOTELS DECK)        */
/* ============================================================ */
function RestaurantOffersSpotlight({
  offers,
  onSelectRestaurant,
}: {
  offers: RestaurantOffer[];
  onSelectRestaurant: (restId: string) => void;
}) {
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [activeIdx, setActiveIdx] = useState(0);

  const offer = offers[activeIdx % offers.length];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % offers.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [offers.length]);

  const cycleNext = () => {
    setActiveIdx((prev) => (prev + 1) % offers.length);
  };

  const photos = offer.gallery && offer.gallery.length > 0 ? offer.gallery : [offer.image];
  const photo0 = photos[0];
  const photo1 = photos[1 % photos.length];
  const photo2 = photos[2 % photos.length];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-6">
      <div
        onClick={cycleNext}
        className="group relative rounded-3xl bg-gradient-to-br from-[#FFF9F5] via-white to-[#FEF3EB] border-2 border-[#E8E2D6] p-6 sm:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden select-none"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-radial from-[#D96B27]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-radial from-amber-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Diagonal Corner Triangle / Ribbon for Discount */}
        <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-20">
          <div className="absolute top-6 -right-10 w-44 py-1.5 bg-gradient-to-r from-red-600 via-[#EA580C] to-[#D96B27] text-white text-center text-xs font-black tracking-wider shadow-md rotate-45 border-y border-white/30">
            {isAr ? `خصم ${offer.discountPct}%` : `${offer.discountPct}% OFF`}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Details on Right (RTL) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3.5 py-1 rounded-full bg-[#D96B27]/10 text-[#D96B27] border border-[#D96B27]/25 text-xs font-black">
                {offer.badge}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#003580]/10 text-[#003580] border border-[#003580]/20 text-xs font-bold">
                📍 {offer.city}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                🍽️ {offer.category}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003580] tracking-tight leading-tight group-hover:text-[#D96B27] transition-colors">
              {offer.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
              {offer.details}
            </p>

            {/* Price & Savings */}
            <div className="flex items-baseline gap-3 pt-2">
              <div>
                <span className="text-xs text-slate-400 font-bold block">
                  {isAr ? "متوسط التكلفة للوجبة:" : "Average Price:"}
                </span>
                <div className="text-2xl sm:text-3xl font-black text-[#D96B27]">
                  {offer.priceRange}
                </div>
              </div>
              <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
                {isAr ? "ضيافة شاي باللوز مجاناً لرواد دلّني" : "Free Mint/Almond Tea Perk"}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onSelectRestaurant(offer.restId)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>🍽️</span>
                <span>{isAr ? "معاينة المطعم وقائمة الأطباق" : "View Menu & Details"}</span>
                <span>➔</span>
              </button>

              <div className="text-xs text-slate-500 font-bold">
                {isAr ? "(انقر على البطاقة للتنقل بين العروض)" : "(Click card to cycle deals)"}
              </div>
            </div>
          </div>

          {/* 3D Stacked Deck of Photos */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-64 sm:w-72 h-80 sm:h-96">
              {/* Back card 2 */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-md rotate-12 translate-x-6 translate-y-3 opacity-60 transition-all duration-300">
                <img src={photo2} alt="Culinary dish" className="w-full h-full object-cover" />
              </div>
              {/* Back card 1 */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-lg rotate-6 translate-x-3 translate-y-1.5 opacity-80 transition-all duration-300">
                <img src={photo1} alt="Culinary dish" className="w-full h-full object-cover" />
              </div>
              {/* Front active card */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-2xl rotate-0 hover:rotate-1 transition-all duration-300">
                <img src={photo0} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white text-xs font-bold">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    📷 {photos.length} {isAr ? "صور للأطباق" : "photos"}
                  </span>
                  <span className="bg-[#D96B27] px-3 py-1 rounded-full font-black text-white shadow-sm">
                    {activeIdx + 1} / {offers.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ============================================================ */
/* DEDICATED FULL DETAILS VIEW FOR RESTAURANTS & CAFES          */
/* ============================================================ */
/* ============================================================ */
/* DEDICATED FULL DETAILS VIEW FOR RESTAURANTS & CAFES          */
/* ============================================================ */
const CATEGORY_DEFAULT_PHOTOS: Record<string, string[]> = {
  seafood: [
    "/assets/ai_food.jpg",
    "/assets/dest-harbor-coast.jpg",
    "/assets/dest-tripoli-harbor.jpg",
    "/assets/dest-leptis-coast.jpg",
    "/assets/dest-sabratha-coast.jpg",
  ],
  traditional: [
    "/assets/restaurant-libya.jpg",
    "/assets/dest-tripoli-medina.jpg",
    "/assets/dest-tripoli-old-city.jpg",
    "/assets/cafe-libya.jpg",
    "/assets/dest-ghadames-oasis.jpg",
  ],
  fastfood: [
    "/assets/ai_food.jpg",
    "/assets/restaurant-libya.jpg",
    "/assets/cafe-libya.jpg",
    "/assets/dest-tripoli-medina.jpg",
    "/assets/dest-harbor-coast.jpg",
  ],
  cafe: [
    "/assets/cafe-libya.jpg",
    "/assets/dest-tripoli-medina.jpg",
    "/assets/dest-tripoli-old-city.jpg",
    "/assets/restaurant-libya.jpg",
    "/assets/ai_food.jpg",
  ],
};

const RESTAURANT_DESCRIPTIONS: Record<string, string> = {
  "REST-001":
    "يقع مطعم السراي القديم في قلب المدينة القديمة بطرابلس بجوار السرايا الحمراء وأزقة الحرف التقليدية. يقدم تجربة طعام ليبية عريقة تمتد لأجيال، حيث تُطهى أطباق الكسكسي بالبصلة والمبطن والشربة الطرابلسية في أوانٍ فخارية تقليدية باستخدام زيت الزيتون واللحم الوطني، وسط ديكورات أندلسية وأجواء عائلية راقية.",
  "REST-002":
    "يُعد مقهى ومطعم الأندلس البحري من أبرز معالم الضيافة الساحلية في بنغازي على طريق الكورنيش. يطل مباشرة على البحر المتوسط ويتميز بتقديم أرقى أطباق الأسماك الطازجة من صيد الفجر (الوقار، الدندوش، القاروص، والجمبري المشوي) مع تشكيلة مقبلات بحرية ومشروبات منعشة وسط نسائم البحر.",
  "REST-003":
    "يتربع مطعم ومشاوي الجبل الأخضر في أحضان الطبيعة الجبلية الساحرة بشحات بالقرب من آثار قورينا الإغريقية. يشتهر بمشاوي الحولي البرقاوي على الفحم المتبل بأعشاب الجبل العطرية، مصحوباً بالخبز الساخن من التنور وشربة الأعشاب البرية، في جلسات خارجية مطلة على الغابات والوديان.",
  "REST-004":
    "واحة كرم وضيافة صحراوية في أزقة مدينة غدامس العتيقة (لؤلؤة الصحراء). يستقبل المطعم زواره بجلسات أرضية مريحة مفروشة بالسجاد الحريري والوسائد التراثية، ويقدم أطباق البازين باللحم الوطني والفتات الغدامسي والتمر الفاخر، مع طقوس شاي بدوية أصيلة بالرغوة الغنية.",
  "REST-005":
    "موقع بحري استثنائي على شاطئ الخمس بالقرب من لبدة الكبرى، يقدم أشهى أطباق السمك المشوي والمقلي صيد اليوم مع أرز الخلطة بالمكسرات وحساء ثمار البحر، ويعتبر المحطة المثالية للراحة وتناول وجبة فاخرة لزوار آثار لبدة الكبرى.",
  "REST-006":
    "في ميناء طرابلس البحري، يقدم مطعم مرسى الصيادين تجربة فريدة لاختيار الأسماك الطازجة صيد الفجر بالوزن وطهيها فوراً على الفحم أو القلي الذهبي المقرمش، مصحوبة بشوربة ثمار البحر الفاخرة وسلطة الكلماري وجلسات تشرف على حركة زوارق الصيد.",
  "REST-007":
    "وجهة عصرية لعشاق السماش برجر والدجاج الكرانشي في طرابلس بالنوفليين. لحوم وطنية طازجة 100% يومياً مع بطاطا لوديد بالجبن وصلصات الترافل والبافلو الخاصة، في بيئة شبابية وعائلية مريحة وخدمة سريعة وسفري.",
  "REST-008":
    "أحد أشهر مطاعم الوجبات السريعة والشاورما في شارع فينيسيا الحيوي ببنغازي. يتميز بالشاورما العربي بخبز الصاج الطازج مع البطاطا المقرمشة والثومية الأصلية، إلى جانب ساندوتشات الزنجر والبرجر والوجبات السريعة.",
  "REST-009":
    "أحد أعرق وأجمل المقاهي التاريخية في أزقة طرابلس القديمة. أجواء أندلسية أصيلة تفوح بعبق الشاي الأخضر الرغوي باللوز المحمص والقهوة التركية، مع تشكيلة من الحلويات الشرقية والمقروض بالعسل والتمر في زنقة الفندق التاريخية.",
  "REST-010":
    "مقهى راقٍ ومتخصص في القهوة المختصة والحلويات الفاخرة بشارع فينيسيا في بنغازي. يقدم مشروبات قهوة V60 المقطرة وفلات وايت من حبوب بن أثيوبية وكولومبية منتقاة، مع كيكة سان سيباستيان وجلسات هادئة ملائمة للعمل والقراءة.",
};

function RestaurantDetailsView({
  restaurant,
  onBack,
}: {
  restaurant: Restaurant;
  onBack: () => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "features" | "location">("overview");

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Guarantee distinct curated photos matching the restaurant's cuisine
  const fallbackPhotos = CATEGORY_DEFAULT_PHOTOS[restaurant.category] || CATEGORY_DEFAULT_PHOTOS.traditional;
  const rawPhotos = restaurant.photos && restaurant.photos.length > 0 ? restaurant.photos : [];
  const uniquePhotos = Array.from(new Set([...rawPhotos, ...fallbackPhotos, "/assets/cafe-libya.jpg"]));
  const photos = uniquePhotos.slice(0, 4);

  const photoCaptions = [
    { title: isAr ? "الأطباق الرئيسية والأجواء" : "Main Dishes & Ambiance", icon: "🍽️" },
    { title: isAr ? "الجلسات والديكور الداخلي" : "Seating & Interior Décor", icon: "🛋️" },
    { title: isAr ? "الضيافة والحلويات والمشروبات" : "Beverages & Traditional Tea", icon: "☕" },
    { title: isAr ? "الواجهة والموقع الخارجي" : "Exterior & Surroundings", icon: "✨" },
  ];

  const description =
    RESTAURANT_DESCRIPTIONS[restaurant.id] ||
    (isAr
      ? `يقدم ${restaurant.name} تجربة طعام استثنائية في قلب ${restaurant.city}، حيث تجتمع معايير الجودة والضيافة الأصيلة مع باقة من أشهى المأكولات والمشروبات المحضرة من مكونات طازجة يومياً لرواد منصة دلّني.`
      : `${restaurant.name} provides an exceptional dining experience in ${restaurant.city} with fresh local culinary traditions.`);

  const nextPhoto = () => setActivePhoto((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#D96B27] selection:text-white" dir={dir}>
      {/* ── 1. LUXURY TOP FLOATING NAVIGATION ── */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2.5 text-slate-300 hover:text-white text-xs sm:text-sm font-black transition-all cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10"
          >
            <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#D96B27] flex items-center justify-center text-xs text-white transition-colors">
              {dir === "rtl" ? "→" : "←"}
            </span>
            <span>{isAr ? "العودة إلى قائمة المطاعم والمقاهي" : "Back to Restaurants"}</span>
          </button>

          {/* Breadcrumb pills */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-bold">
            <span className="text-slate-500">{isAr ? "الرئيسية" : "Home"}</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-500">{isAr ? "المطاعم والمقاهي" : "Restaurants"}</span>
            <span className="text-slate-700">/</span>
            <span className="text-amber-400 font-black truncate max-w-[220px]">{restaurant.name}</span>
          </div>

          {/* VIP Perk Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-emerald-500/20 border border-amber-400/30 text-amber-300 text-xs font-black shadow-lg shadow-amber-500/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isAr ? "خصم 20% لرواد منصة دلّني" : "20% Dallani Guest Perk"}</span>
          </div>
        </div>
      </div>

      {/* ── 2. HERO IDENTITY & CINEMA STAGE CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
        
        {/* Luxury Hero Header Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-950/95 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-black">
                {/* Type Pill */}
                <span className="px-3 py-1 rounded-xl bg-orange-500/20 border border-orange-400/30 text-orange-300 font-black flex items-center gap-1.5 shadow-xs">
                  <span>🍽️</span>
                  <span>{restaurant.type}</span>
                </span>
                
                {/* Verified Partner */}
                <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-black flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>✓ {isAr ? "مطعم معتمد في دلّني" : "Verified Dallani Partner"}</span>
                </span>

                {/* City Tag */}
                <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-black">
                  📍 {restaurant.city}
                </span>

                {/* Hours Tag */}
                <span className="px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-bold">
                  🕒 {restaurant.hours}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {restaurant.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-semibold">
                <span className="flex items-center gap-1 text-slate-400">
                  <span>📍</span>
                  <span>{restaurant.address}</span>
                </span>
                <span className="text-slate-600">•</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    restaurant.mapsQuery || `${restaurant.name} ${restaurant.city}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline font-black inline-flex items-center gap-1 transition-colors"
                >
                  <span>{isAr ? "عرض الموقع في خرائط Google ↗" : "View Map on Google ↗"}</span>
                </a>
              </div>
            </div>

            {/* Rating Box & Gourmet Score */}
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto bg-white/5 border border-white/15 p-4 rounded-3xl backdrop-blur-xl shadow-xl">
              <div className="text-right">
                <div className="text-sm font-black text-white">{restaurant.ratingWord || (isAr ? "تقييم استثنائي" : "Superb")}</div>
                <div className="text-xs text-slate-400 font-bold">{restaurant.reviewsCount || 450} {isAr ? "تقييم زائر معتمد" : "verified reviews"}</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D96B27] via-amber-600 to-orange-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-lg ring-2 ring-white/20">
                <span className="text-lg leading-tight font-black">{restaurant.rating}</span>
                <span className="text-[9px] text-amber-200 font-bold">{isAr ? "من 10" : "/10"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. BENTO PHOTO SHOWCASE & LIGHTBOX PREVIEW ── */}
        <div className="space-y-4">
          
          {/* Main Photo Gallery Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Featured Hero Photo (8 cols) */}
            <div className="lg:col-span-8 relative h-[360px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl group cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            >
              <img
                src={photos[activePhoto]}
                alt={restaurant.name}
                key={activePhoto}
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

              {/* Top Bar Badges */}
              <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="bg-black/70 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
                    <span>{photoCaptions[activePhoto]?.icon || "🍽️"}</span>
                    <span>{photoCaptions[activePhoto]?.title || (isAr ? `صورة ${activePhoto + 1}` : `Photo ${activePhoto + 1}`)}</span>
                  </span>
                  <span className="hidden sm:inline-flex bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    4K Gourmet HD
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                  className="pointer-events-auto bg-white/90 hover:bg-white text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔍</span>
                  <span>{isAr ? "تكبير واستعراض الشاشة الكاملة" : "Expand Fullscreen"}</span>
                </button>
              </div>

              {/* Nav Chevrons */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevPhoto();
                }}
                className="absolute top-1/2 -translate-y-1/2 right-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-2xl flex items-center justify-center font-black text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
                title={isAr ? "الصورة السابقة" : "Previous photo"}
              >
                {dir === "rtl" ? "→" : "←"}
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextPhoto();
                }}
                className="absolute top-1/2 -translate-y-1/2 left-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-2xl flex items-center justify-center font-black text-xl transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
                title={isAr ? "الصورة التالية" : "Next photo"}
              >
                {dir === "rtl" ? "←" : "→"}
              </button>

              {/* Bottom Info Bar */}
              <div className="absolute bottom-4 right-4 left-4 z-20 flex flex-wrap items-center justify-between gap-3 text-white">
                <div className="text-xs sm:text-sm font-black drop-shadow-lg flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{restaurant.name} — {restaurant.specialty}</span>
                </div>
                
                {/* Dots indicator */}
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePhoto(idx);
                      }}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        activePhoto === idx ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 3 Secondary Stacked Bento Tiles (4 cols on desktop) */}
            <div className="lg:col-span-4 grid grid-cols-3 lg:grid-cols-1 gap-3">
              {photos.map((p, idx) => {
                const isSelected = activePhoto === idx;
                return (
                  <div
                    key={idx}
                    onClick={() => setActivePhoto(idx)}
                    className={`relative h-28 sm:h-36 lg:h-[155px] rounded-3xl overflow-hidden cursor-pointer group transition-all duration-300 bg-slate-950 border ${
                      isSelected
                        ? "border-amber-400 ring-2 ring-amber-400/50 scale-[1.02] shadow-xl"
                        : "border-white/10 hover:border-white/40 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={p}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Badge & Label */}
                    <div className="absolute bottom-2.5 right-3 left-3 z-10 flex items-center justify-between text-white">
                      <div className="text-[11px] sm:text-xs font-black truncate drop-shadow-md flex items-center gap-1">
                        <span>{photoCaptions[idx]?.icon || "🍽️"}</span>
                        <span>{photoCaptions[idx]?.title || `صورة ${idx + 1}`}</span>
                      </div>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-black shadow-lg">
                          ✓
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

          {/* Quick Category Selector Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {photoCaptions.map((cap, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhoto(idx)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer border ${
                  activePhoto === idx
                    ? "bg-gradient-to-r from-[#D96B27] to-amber-600 text-white border-amber-400/40 shadow-lg shadow-amber-500/20 scale-102"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border-white/10"
                }`}
              >
                <span>{cap.icon}</span>
                <span>{cap.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. TWO-COLUMN BENTO CONTENT & VIP CONCIERGE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Interactive Tab Navigator */}
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
              {[
                { id: "overview", label: isAr ? "نبذة وتجربة التذوق" : "Culinary Story", icon: "🍽️" },
                { id: "menu", label: isAr ? "الأطباق المميزة" : "Signature Dishes", icon: "⭐" },
                { id: "features", label: isAr ? "الأجواء والجلسات" : "Atmosphere", icon: "🌟" },
                { id: "location", label: isAr ? "الموقع والمواعيد" : "Hours & Map", icon: "📍" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#D96B27] to-amber-600 text-white shadow-md border border-amber-400/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* A. Overview & Heritage */}
            {activeTab === "overview" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-4 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>🍽️</span>
                  <h2>{isAr ? "نبذة عن المطعم وفلسفة الطهي" : "About the Dining Experience"}</h2>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {description}
                </p>

                {/* Culinary Highlights */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  {[
                    { title: isAr ? "مكونات طازجة ولحوم وطنية يومية" : "100% Fresh Daily Local Ingredients", icon: "🥩" },
                    { title: isAr ? "أجواء عائلية راقية وخصوصية تامة" : "Family Private Dining Booths", icon: "👨‍👩‍👧‍👦" },
                    { title: isAr ? "جلسات شاي وتحلية تراثية أصيلة" : "Authentic Tea & Heritage Sweets", icon: "🫖" },
                    { title: isAr ? "خدمة سريعة واهتمام فائق بالزبائن" : "Attentive Hospitality & Rapid Service", icon: "⚡" },
                  ].map((hl, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm font-bold text-slate-200">
                      <span className="text-lg">{hl.icon}</span>
                      <span>{hl.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B. Signature Dishes (ZERO PRICES) */}
            {activeTab === "menu" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>⭐</span>
                  <h2>{isAr ? "أبرز الأطباق والتخصصات الموصى بها" : "Signature Dishes & Specialties"}</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(restaurant.signatureDishes && restaurant.signatureDishes.length > 0
                    ? restaurant.signatureDishes
                    : [
                        isAr ? "كسكسي بالبصلة واللحم الوطني" : "Couscous with Lamb",
                        isAr ? "شربة ليبية بالأعشاب والليمون" : "Traditional Libyan Soup",
                        isAr ? "مشاوي مشكلة على الفحم" : "Mixed Charcoal Grill",
                        isAr ? "مبطن طرابلسي وبراك مقلي" : "Stuffed Mbaten & Burek",
                      ]
                  ).map((dish, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 flex items-start gap-3.5"
                    >
                      <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#D96B27] to-amber-600 text-white flex items-center justify-center font-black text-sm shrink-0 mt-0.5 shadow-md">
                        {i + 1}
                      </span>
                      <div className="space-y-1">
                        <div className="font-black text-sm text-white">{dish}</div>
                        <div className="text-xs text-amber-300/80 font-bold">
                          {isAr ? "طبق مميز موصى به من الشيف ورواد دلّني" : "Chef Special Recommendation"}
                        </div>
                        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-0.5">
                          <span>✓</span>
                          <span>{isAr ? "محضر يومياً بمكونات طازجة 100%" : "Fresh Daily Preparation"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. Atmosphere & Seating */}
            {activeTab === "features" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>🌟</span>
                  <h2>{isAr ? "المميزات وتجهيزات الجلسات" : "Dining Atmosphere & Amenities"}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {restaurant.features.map((f, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 flex items-center gap-3.5"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-400/20 text-emerald-300 flex items-center justify-center font-black text-xs shrink-0">
                        ✓
                      </span>
                      <span className="font-bold text-sm text-slate-200">{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D. Location & Timings */}
            {activeTab === "location" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>📍</span>
                  <h2>{isAr ? "الموقع الجغرافي وساعات العمل" : "Location & Operating Hours"}</h2>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="text-slate-400 font-bold flex items-center gap-1.5">
                      <span>🕒</span>
                      <span>{isAr ? "ساعات العمل اليومية:" : "Daily Hours:"}</span>
                    </div>
                    <div className="font-black text-white text-base">{restaurant.hours}</div>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="text-slate-400 font-bold flex items-center gap-1.5">
                      <span>💡</span>
                      <span>{isAr ? "أفضل أوقات الزيارة:" : "Best Visiting Time:"}</span>
                    </div>
                    <div className="font-black text-amber-300">
                      {restaurant.category === "cafe"
                        ? (isAr ? "بعد العصر وفترات المساء الهادئة" : "Late afternoon & evening")
                        : (isAr ? "الغداء 01:00م - 04:00م / العشاء بعد 08:30م" : "Lunch 1-4 PM / Dinner after 8:30 PM")}
                    </div>
                  </div>
                </div>

                {/* Map Action Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900/60 border border-amber-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-right w-full sm:w-auto">
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>🗺️</span>
                      <span>{isAr ? "الوصول عبر خرائط Google" : "Google Maps Navigation"}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {restaurant.address}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      restaurant.mapsQuery || `${restaurant.name} ${restaurant.city}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg text-center"
                  >
                    {isAr ? "فتح الموقع في خرائط Google ↗" : "Open Google Maps ↗"}
                  </a>
                </div>
              </div>
            )}

          </div>

          {/* Sticky Sidebar Column (4 cols) (ZERO PRICES - GOURMET CONCIERGE) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            
            {/* VIP Dallani Pass Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-800/80 to-slate-900/90 border border-amber-400/30 p-6 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                  <span>🏷️</span>
                  <span>{isAr ? "ضيافة خاصة لرواد دلّني" : "Exclusive Dallani Perk"}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {isAr ? "خصم 20% أو ضيافة شاي مجانية" : "20% Discount / Free Tea"}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {isAr
                    ? "أبلغ المضيف أو أرسل استفسارك لحجز طاولتك موضحاً أنك من رواد (منصة دلّني) للاستفادة الفورية من الخصم والضيافة."
                    : "Mention Dallani upon arrival or booking to claim your exclusive 20% hospitality perk directly."}
                </p>
              </div>

              {/* Direct Actions */}
              <div className="space-y-3">
                <a
                  href={`tel:${restaurant.phone}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-[#003580] hover:from-blue-500 hover:to-blue-700 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 active:scale-98 cursor-pointer"
                >
                  <span className="text-base">📞</span>
                  <span>{isAr ? `اتصال مباشر وحجز طاولة (${restaurant.phone})` : `Call Restaurant (${restaurant.phone})`}</span>
                </a>

                <a
                  href={`https://wa.me/218${restaurant.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                    `مرحباً، أود الاستفسار عن تفاصيل وقائمة الطعام وحجز طاولة لدى ${restaurant.name} عبر منصة دلّني السياحية للاستفادة من خصم الـ 20%.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-98 cursor-pointer"
                >
                  <span className="text-base">💬</span>
                  <span>{isAr ? "مراسلة واستعلام عبر واتساب" : "WhatsApp Table Reservation"}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    restaurant.mapsQuery || `${restaurant.name} ${restaurant.city}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-black text-xs transition-all flex items-center justify-center gap-2 border border-white/15"
                >
                  <span>📍</span>
                  <span>{isAr ? "عرض الموقع في خرائط Google" : "Open in Google Maps"}</span>
                </a>
              </div>

              {/* Verified Quick Stats */}
              <div className="pt-4 border-t border-white/10 text-xs text-slate-400 space-y-2.5 font-bold">
                <div className="flex items-center justify-between">
                  <span>🍽️ {isAr ? "نوع الجلسات:" : "Seating:"}</span>
                  <span className="text-amber-300 font-black">{isAr ? "عائلية + خاصة + شبابية" : "Family & Private"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>💳 {isAr ? "طرق الدفع:" : "Payment:"}</span>
                  <span className="text-white font-black">{isAr ? "نقداً، بطاقات، سداد، تداول" : "Cash, Cards, Sadad"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🚗 {isAr ? "مواقف السيارات:" : "Parking:"}</span>
                  <span className="text-emerald-400 font-black">{isAr ? "متوفرة ومجانية" : "Free Onsite"}</span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ── 5. FULL-SCREEN LIGHTBOX MODAL ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-300"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-7xl mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-0.5">
              <h3 className="font-black text-base sm:text-lg">{restaurant.name}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {photoCaptions[activePhoto]?.title} ({activePhoto + 1} / {photos.length})
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl font-black transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Main Stage Image */}
          <div className="relative max-w-5xl mx-auto w-full my-auto flex items-center justify-center max-h-[70vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[activePhoto]}
              alt={restaurant.name}
              className="max-h-[70vh] max-w-full rounded-3xl object-contain shadow-2xl border border-white/20"
            />
            
            {/* Chevrons */}
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute right-4 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-2xl flex items-center justify-center font-black text-xl transition-all cursor-pointer"
            >
              {dir === "rtl" ? "→" : "←"}
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute left-4 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-2xl flex items-center justify-center font-black text-xl transition-all cursor-pointer"
            >
              {dir === "rtl" ? "←" : "→"}
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="max-w-xl mx-auto w-full flex items-center justify-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.map((p, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(idx)}
                className={`w-20 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activePhoto === idx ? "border-amber-400 scale-110 shadow-lg" : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

function RestaurantsPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [city, setCity] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRest, setSelectedRest] = useState<Restaurant | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const resultsSectionRef = useRef<HTMLElement>(null);
  const scrollToResults = () => {
    setTimeout(() => {
      resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const restScrollRef = useRef<HTMLDivElement>(null);
  const scrollRest = (direction: "left" | "right") => {
    if (!restScrollRef.current) return;
    const scrollAmount = direction === "left" ? -350 : 350;
    restScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  const restaurants = useMemo(() => getRestaurants(language), [language]);

  const cities = useMemo(
    () => [
      { key: "all", label: isAr ? "جميع المدن والمناطق" : "All Cities" },
      { key: isAr ? "طرابلس" : "Tripoli", label: isAr ? "طرابلس" : "Tripoli" },
      { key: isAr ? "بنغازي" : "Benghazi", label: isAr ? "بنغازي" : "Benghazi" },
      { key: isAr ? "شحات" : "Shahhat", label: isAr ? "شحات (الجبل الأخضر)" : "Shahhat (Cyrene)" },
      { key: isAr ? "غدامس" : "Ghadames", label: isAr ? "غدامس" : "Ghadames" },
      { key: isAr ? "الخمس" : "Al-Khoms", label: isAr ? "الخمس (لبدة الكبرى)" : "Al-Khoms (Leptis)" },
    ],
    [isAr],
  );

  const filtered = useMemo(() => {
    // Under the requested rules: DO NOT SHOW RESTAURANTS UNTIL A CATEGORY IS CLICKED (or searched)
    if (!selectedCategory && !searchQuery.trim()) return [];

    return restaurants.filter((r) => {
      const matchCategory = !selectedCategory || selectedCategory === "all" || r.category === selectedCategory;
      const matchCity = city === "all" || r.city.toLowerCase().includes(city.toLowerCase());
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.specialty.toLowerCase().includes(q);
      return matchCategory && matchCity && matchSearch;
    });
  }, [restaurants, city, selectedCategory, searchQuery]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };


  return (
    <div className="min-h-screen bg-[#F7F8FA]" dir={dir}>
      <Header active="restaurants" />

      {/* ── 1. HERO SECTION (Professional Animated Slideshow) ── */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#003580]">
        <HeroSlideshow
          images={[
            "/assets/restaurant-libya.jpg",
            "/assets/cafe-libya.jpg",
            "/assets/ai_food.jpg",
            "/assets/dest-tripoli-medina.jpg",
          ]}
          alt="المطاعم والمقاهي في ليبيا"
          brightness="brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003580]/90 via-[#003580]/45 to-transparent z-10" />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-12 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit mb-2.5 border border-white/25">
            🍽️ {isAr ? "دليل واستعراض المطاعم والمقاهي في ليبيا (للعرض والتعريف فقط)" : "Dining & Cafes Directory in Libya (Showcase Only)"}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-lg tracking-tight">
            {isAr ? "تذوق أشهى المأكولات الليبية والمتوسطية" : "Taste the finest culinary delights in Libya"}
          </h1>
          <p className="mt-2 text-white/95 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-sm">
            {isAr
              ? "استكشف أروع المطاعم الشعبية، المأكولات البحرية الطازجة، الفاست فود، والمقاهي مع تفاصيل الأطباق ومواقع خرائط Google وأرقام التواصل المباشرة."
              : "Discover authentic traditional restaurants, fresh seafood spots, fast food, and historic cafes across all Libyan cities with verified contacts."}
          </p>
        </div>
      </div>

      {/* ── 2. UNIFIED FLOATING FILTER PANEL (Matching Hotels & Attractions) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E8E2D6] text-[#0F172A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 bg-[#F0F4F8] rounded-2xl border border-blue-100">
            {/* Search Input */}
            <div className="lg:col-span-5 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🔍</span>
              <div className="relative flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "البحث عن مطعم أو طبق:" : "Search Restaurant or Dish:"}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (!selectedCategory && val.trim()) setSelectedCategory("all");
                    if (val.trim()) scrollToResults();
                  }}
                  placeholder={isAr ? "ابحث باسم المطعم، المدينة، أو نوع الوجبة..." : "Search by name, city, or cuisine..."}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A6A85]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* City / Destination Select */}
            <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">📍</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "المدينة والمنطقة:" : "City & Region:"}
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCity(val);
                    if (!selectedCategory) setSelectedCategory("all");
                    scrollToResults();
                  }}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  {cities.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cuisine Category Dropdown Filter */}
            <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center justify-between gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "تصنيف المأكولات:" : "Cuisine Category:"}
                </label>
                <select
                  value={selectedCategory || "none"}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedCategory(val === "none" ? null : val);
                    if (val !== "none") scrollToResults();
                  }}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="none">{isAr ? "اختر تصنيفاً..." : "Select category..."}</option>
                  <option value="all">{isAr ? "جميع الخيارات (الكل)" : "All Categories"}</option>
                  <option value="seafood">{isAr ? "مأكولات بحرية" : "Fresh Seafood"}</option>
                  <option value="traditional">{isAr ? "مأكولات شعبية وتراثية" : "Traditional Libyan"}</option>
                  <option value="fastfood">{isAr ? "الفاست فود (وجبات سريعة)" : "Fast Food"}</option>
                  <option value="cafe">{isAr ? "مقاهي ومشاريب راقية" : "Cafes & Coffee"}</option>
                </select>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 shrink-0">
                {filtered.length} {isAr ? "أماكن" : "spots"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16">
        
        {/* ── 4. BROWSE BY 4 STRICT CUISINE CATEGORIES (USER DEMAND) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] flex items-center gap-2">
                <span>🍱</span>
                <span>{isAr ? "اختر نوع وتصنيف المأكولات والمقاهي" : "Browse by Dining Categories"}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isAr
                  ? "انقر على أي تصنيف أدناه لفتح الخيارات وعرض المطاعم والمقاهي التابعة له فوراً"
                  : "Click any category below to immediately reveal its curated restaurants"}
              </p>
            </div>
            {selectedCategory && (
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className="text-xs font-black text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition cursor-pointer"
              >
                ✕ {isAr ? "إلغاء التحديد" : "Clear Filter"}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                id: "seafood",
                title: isAr ? "مأكولات بحرية" : "Fresh Seafood",
                sub: isAr ? "أسماك طازجة، جمبري، وقار صيد اليوم" : "Fresh Daily Catch, Grilled Prawns",
                count: restaurants.filter((x) => x.category === "seafood").length,
                img: "/assets/ai_food.jpg",
                badge: isAr ? "صيد بحري طازج" : "Fresh Catch",
                badgeBg: "bg-[#003580]",
                border: "border-blue-500 ring-4 ring-blue-500/25",
              },
              {
                id: "traditional",
                title: isAr ? "مأكولات شعبية" : "Traditional Libyan",
                sub: isAr ? "كسكسي، بازين، مبطن، حساء تراثي" : "Couscous, Bazin, Mbatten",
                count: restaurants.filter((x) => x.category === "traditional").length,
                img: "/assets/restaurant-libya.jpg",
                badge: isAr ? "أصالة وتراث ليبي" : "Heritage Libyan",
                badgeBg: "bg-amber-700",
                border: "border-amber-600 ring-4 ring-amber-600/25",
              },
              {
                id: "fastfood",
                title: isAr ? "الفاست فود (وجبات سريعة)" : "Fast Food & Burgers",
                sub: isAr ? "سماش برجر، شاورما، كرانشي تاون" : "Smash Burgers, Crispy Rolls",
                count: restaurants.filter((x) => x.category === "fastfood").length,
                img: "/assets/ai_food.jpg",
                badge: isAr ? "سريع وعصري" : "Fast & Casual",
                badgeBg: "bg-[#D96B27]",
                border: "border-[#D96B27] ring-4 ring-[#D96B27]/25",
              },
              {
                id: "cafe",
                title: isAr ? "مقاهي ومشاريب راقية" : "Cafes & Specialty Coffee",
                sub: isAr ? "شاي باللوز رغوي، قهوة مختصة، حلويات" : "Almond Tea, V60 Coffee",
                count: restaurants.filter((x) => x.category === "cafe").length,
                img: "/assets/cafe-libya.jpg",
                badge: isAr ? "شاي باللوز وقهوة" : "Specialty Coffee",
                badgeBg: "bg-teal-700",
                border: "border-teal-600 ring-4 ring-teal-600/25",
              },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    scrollToResults();
                  }}
                  className={`group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border select-none flex flex-col justify-between p-4 ${
                    isSelected
                      ? `${cat.border} scale-[1.02]`
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <img
                    src={cat.img}
                    alt={cat.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-white text-[10px] font-black shadow-xs ${cat.badgeBg}`}>
                      {cat.badge}
                    </span>
                    {isSelected && (
                      <span className="w-6 h-6 rounded-full bg-white text-[#003580] flex items-center justify-center text-xs font-black shadow-md">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Bottom Text */}
                  <div className="relative z-10 text-white space-y-1">
                    <h4 className="font-black text-lg sm:text-xl group-hover:text-amber-300 transition-colors leading-snug drop-shadow-sm">
                      {cat.title}
                    </h4>
                    <p className="text-[11px] text-white/80 line-clamp-1 font-medium">
                      {cat.sub}
                    </p>
                    <div className="text-xs text-amber-300 font-bold flex items-center justify-between pt-1">
                      <span>{cat.count} {isAr ? "أماكن معتمدة" : "spots"}</span>
                      <span className="text-sm">➔</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. RESTAURANTS RESULTS LISTING (SHOWN ONLY WHEN A CATEGORY IS CLICKED) ── */}
        <section ref={resultsSectionRef} id="restaurants-results-section" className="space-y-4 scroll-mt-24">
          
          {/* A. If NO Category Selected -> Friendly Prompt */}
          {!selectedCategory ? (
            <div className="text-center py-14 px-4 bg-white rounded-3xl border-2 border-dashed border-amber-300 shadow-sm space-y-3 my-4">
              <div className="text-5xl">🍽️</div>
              <h4 className="text-lg sm:text-xl font-black text-[#003580]">
                {isAr ? "اختر أحد تصنيفات المأكولات والمقاهي أعلاه لعرض الخيارات المتاحة" : "Select a Dining Category Above"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 font-semibold max-w-lg mx-auto leading-relaxed">
                {isAr
                  ? "انقر على أحد الكروت أعلاه (مأكولات بحرية، مأكولات شعبية، الفاست فود، أو مقاهي ومشاريب راقية) ليتم نقلك فوراً إلى خيارات المطاعم وقوائم الطعام وأرقام التواصل المباشرة."
                  : "Click any category above (Seafood, Traditional, Fast Food, or Cafes) to immediately view matching verified spots, menus, and phone contacts."}
              </p>
            </div>
          ) : (
            /* B. When Category IS Selected -> Show Filtered Results */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#EBF3FF] rounded-2xl border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#003580]">
                      {isAr ? "قائمة الخيارات المتاحة لـ: " : "Available Places for: "}
                      <span className="text-[#D96B27]">
                        {selectedCategory === "seafood"
                          ? (isAr ? "مأكولات بحرية" : "Fresh Seafood")
                          : selectedCategory === "traditional"
                          ? (isAr ? "مأكولات شعبية وتراثية" : "Traditional Libyan")
                          : selectedCategory === "fastfood"
                          ? (isAr ? "الفاست فود والوجبات السريعة" : "Fast Food & Burgers")
                          : (isAr ? "مقاهي ومشاريب راقية" : "Cafes & Specialty Coffee")}
                      </span>
                    </h3>
                    <div className="text-xs text-slate-500 font-bold">
                      {filtered.length} {isAr ? "أماكن معتمدة تطابق بحثك" : "verified places found"}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCategory(null)}
                  className="self-start sm:self-auto px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-[#003580] text-xs font-black border border-[#003580]/30 transition cursor-pointer"
                >
                  {isAr ? "اختيار تصنيف آخر ✕" : "Change Category ✕"}
                </button>
              </div>

              {/* Cards List */}
              <div className="space-y-4">
                {filtered.map((r) => {
                  const isFav = !!likedMap[r.id];
                  return (
                    <article
                      key={r.id}
                      onClick={() => setSelectedRest(r)}
                      className="group bg-white rounded-3xl border border-slate-200 hover:border-[#D96B27]/50 shadow-sm hover:shadow-xl transition-all p-4 sm:p-5 cursor-pointer flex flex-col md:flex-row gap-5"
                    >
                      {/* Photo */}
                      <div className="relative w-full md:w-72 h-52 sm:h-56 rounded-2xl overflow-hidden shrink-0 bg-slate-900">
                        <img
                          src={r.photos[0]}
                          alt={r.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={(e) => toggleLike(r.id, e)}
                          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-xs z-10 cursor-pointer ${
                            isFav ? "bg-white text-red-500" : "bg-black/40 text-white hover:bg-white hover:text-red-500"
                          }`}
                          title={isAr ? "إضافة للمفضلة" : "Save to wishlist"}
                        >
                          <span className="text-sm">{isFav ? "❤️" : "🤍"}</span>
                        </button>
                        <div className="absolute top-2.5 left-2.5 bg-[#003580] text-white text-[10px] font-black px-3 py-1 rounded-full shadow-sm">
                          {r.type}
                        </div>
                      </div>

                      {/* Details Column */}
                      <div className="flex-1 flex flex-col justify-between space-y-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <h4 className="text-lg sm:text-xl font-black text-[#003580] group-hover:text-[#D96B27] transition-colors">
                              {r.name}
                            </h4>
                            <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              مفتوح الآن · {r.hours}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                            <span className="text-[#003580] font-bold">📍 {r.city}</span>
                            <span>·</span>
                            <span>{r.address}</span>
                          </div>

                          <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                            <div className="font-black text-[#0F172A]">
                              🍽️ {isAr ? "نوع وتصنيف المأكولات:" : "Cuisine Type & Specialty:"}
                            </div>
                            <div className="text-slate-600 text-xs leading-relaxed font-semibold">
                              {r.type} · {r.specialty}
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
                            <span>📞 {r.phone}</span>
                            <span>·</span>
                            <span className="text-emerald-700 font-black bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                              ✓ {isAr ? "خصم 20% لرواد دلّني" : "20% Dallani Perk"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRest(r);
                            }}
                            className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                          >
                            <span>{isAr ? "معرفة المزيد" : "Learn More"}</span>
                            <span>➔</span>
                          </button>
                        </div>
                      </div>

                    </article>
                  );
                })}

                {filtered.length === 0 && (
                  <div className="text-center py-12 bg-white rounded-3xl border border-slate-200">
                    <div className="text-4xl mb-2">🍽️</div>
                    <h4 className="font-black text-slate-800 text-base">
                      {isAr ? "لا توجد مطاعم مطابقة لبحثك في هذه المدينة" : "No restaurants found for this filter"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      {isAr ? "جرب مسح حقل البحث أو اختيار (جميع المدن)." : "Try clearing search query or choosing All Cities."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

      </div>

      {/* Dynamic Animated Restaurant Details Popup Modal */}
      <RestaurantDetailsModal
        restaurant={selectedRest}
        open={Boolean(selectedRest)}
        onClose={() => setSelectedRest(null)}
      />

      <Footer />
    </div>
  );
}

export default RestaurantsPage;
