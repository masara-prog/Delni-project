import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/i18n";
import { Icon } from "@/components/Icons";
import { Footer } from "@/components/Footer";
import { HotelDetailsModal, type HotelData } from "@/components/HotelDetailsModal";
import { HeroSlideshow } from "@/components/HeroSlideshow";

export const Route = createFileRoute("/hotels")({
  head: () => ({
    meta: [
      { title: "أماكن الإقامة والفنادق في ليبيا | منصة دلّني" },
      {
        name: "description",
        content: "استكشف أفضل الفنادق والنُزل في ليبيا مع عروض وخصومات حصرية عبر منصة دلّني.",
      },
    ],
  }),
  component: HotelsPage,
});

/* ───── هيكل بيانات عروض الفنادق ───── */
type HotelOffer = {
  offerId: string;
  hotelId: string;
  title: string;
  details: string;
  image: string;
  gallery: string[];
  city: string;
  price: number;
  oldPrice: number;
  discountPct: number;
  startDate: string;
  endDate: string;
  badge: string;
  emoji: string;
};

const HOTEL_OFFERS: HotelOffer[] = [
  {
    offerId: "HOFF-001",
    hotelId: "HTL-001",
    title: "عرض نهاية الأسبوع الفاخر - فندق الفصول الأربعة",
    details: "إقامة استثنائية مطلة على البحر الأبيض المتوسط مع إفطار بوفيه مفتوح وخدمة الواي فاي وساعة مجانية بالنادي الصحي.",
    image: "/assets/ai_city.jpg",
    gallery: [
      "/assets/ai_city.jpg",
      "/assets/ai_city.jpg",
      "/assets/ai_city.jpg",
    ],
    city: "طرابلس",
    price: 988,
    oldPrice: 1318,
    discountPct: 25,
    startDate: "2026-08-01",
    endDate: "2026-09-30",
    badge: "خصم حصري 25%",
    emoji: "🏨",
  },
  {
    offerId: "HOFF-002",
    hotelId: "HTL-002",
    title: "ليالٍ سياحية مخفضة في فندق تيبستي بنغازي",
    details: "إطلالة بانورامية ساحرة على بحيرة 23 يوليو والمدينة مع وجبة عشاء مجانية في مطعم الفندق وخصم 20% لرواد دلّني.",
    image: "/assets/ai_city.jpg",
    gallery: [
      "/assets/ai_city.jpg",
      "/assets/ai_city.jpg",
      "/assets/ai_city.jpg",
    ],
    city: "بنغازي",
    price: 1048,
    oldPrice: 1294,
    discountPct: 20,
    startDate: "2026-08-15",
    endDate: "2026-10-15",
    badge: "تخفيض خاص 20%",
    emoji: "⭐",
  },
  {
    offerId: "HOFF-003",
    hotelId: "HTL-004",
    title: "مغامرة الصحراء الملكية في مخيم بحيرات أوباري",
    details: "إقامة صحراوية فاخرة تحت النجوم مع خيام ملكية مجهزة وجولة سفاري بالدفع الرباعي وسهرة فلكلورية طوارقية.",
    image: "/assets/ai_desert.jpg",
    gallery: [
      "/assets/ai_desert.jpg",
      "/assets/ai_desert.jpg",
      "/assets/ai_desert.jpg",
    ],
    city: "أوباري",
    price: 3013,
    oldPrice: 4293,
    discountPct: 30,
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    badge: "مغامرة فزان 30%",
    emoji: "🏜️",
  },
  {
    offerId: "HOFF-004",
    hotelId: "HTL-005",
    title: "عطلة الجبل الأخضر الطبيعية - منتجع شحات الفاخر",
    details: "إقامة هادئة بين غابات الصنوبر ونسائم الجبل العليلة بالقرب من آثار قورينا ومعبد أبولو مع إفطار ريفي طازج.",
    image: "/assets/dest-jabal-akhdar-panorama.jpg",
    gallery: [
      "/assets/dest-jabal-akhdar-panorama.jpg",
      "/assets/dest-jabal-akhdar-panorama.jpg",
      "/assets/dest-jabal-akhdar-bridge.jpg",
    ],
    city: "شحات",
    price: 840,
    oldPrice: 1120,
    discountPct: 25,
    startDate: "2026-09-01",
    endDate: "2026-11-30",
    badge: "طبيعة وجبال 25%",
    emoji: "🌿",
  },
];

function getHotels(lang: "ar" | "en"): HotelData[] {
  return [
    {
      id: "HTL-001",
      name: lang === "ar" ? "فندق الفصول الأربعة طرابلس" : "Four Seasons Hotel Tripoli",
      city: lang === "ar" ? "طرابلس" : "Tripoli",
      address: lang === "ar" ? "شارع الشاطئ، طرابلس" : "Beach Street, Tripoli",
      mapsQuery: "Tripoli+Sea+Street+Libya",
      phone: "0912345678",
      stars: 5,
      partnership_status: "نشط",
      propertyType: "hotel",
      price: 988,
      originalPrice: 1318,
      rating: 9.2,
      ratingWord: lang === "ar" ? "استثنائي" : "Superb",
      reviewsCount: 2003,
      discountPct: 25,
      photos: [
        "/assets/ai_hotel.jpg",
        "/assets/dest-harbor-coast.jpg",
        "/assets/cafe-libya.jpg",
      ],
    },
    {
      id: "HTL-002",
      name: lang === "ar" ? "فندق تيبستي الدولي" : "Tibesti International Hotel",
      city: lang === "ar" ? "بنغازي" : "Benghazi",
      address: lang === "ar" ? "شارع جمال عبد الناصر، بنغازي" : "Gamal Abdel Nasser St, Benghazi",
      mapsQuery: "Tibesti+Hotel+Benghazi+Libya",
      phone: "0921112233",
      stars: 4,
      partnership_status: "نشط",
      propertyType: "hotel",
      price: 1048,
      originalPrice: 1294,
      rating: 8.6,
      ratingWord: lang === "ar" ? "ممتاز" : "Excellent",
      reviewsCount: 3238,
      discountPct: 20,
      photos: [
        "/assets/ai_hotel.jpg",
        "/assets/dest-harbor-coast.jpg",
        "/assets/ai_food.jpg",
        "/assets/cafe-libya.jpg",
        "/assets/dest-tripoli-harbor.jpg",
      ],
    },
    {
      id: "HTL-003",
      name: lang === "ar" ? "نزل غدامس التراثي الأصيل" : "Ghadames Authentic Heritage Lodge",
      city: lang === "ar" ? "غدامس" : "Ghadames",
      address: lang === "ar" ? "المدينة القديمة، غدامس" : "Old Town, Ghadames",
      mapsQuery: "Old+Town+Ghadames+Libya",
      phone: "0919998877",
      stars: 3,
      partnership_status: "نشط",
      propertyType: "heritage",
      price: 840,
      originalPrice: 1120,
      rating: 8.9,
      ratingWord: lang === "ar" ? "ممتاز جداً" : "Very Good",
      reviewsCount: 915,
      discountPct: 25,
      photos: [
        "/assets/dest-ghadames-oasis.jpg",
        "/assets/dest-ghadames-alleys.jpg",
        "/assets/dest-ghadames-clean.jpg",
        "/assets/dest-ksar-desert.jpg",
        "/assets/restaurant-libya.jpg",
      ],
    },
    {
      id: "HTL-004",
      name: lang === "ar" ? "مخيم بحيرات أوباري الفاخر" : "Ubari Lakes Luxury Desert Camp",
      city: lang === "ar" ? "أوباري" : "Ubari",
      address: lang === "ar" ? "بحيرة قبرعون، أوباري" : "Gaberoun Lake, Ubari",
      mapsQuery: "Gaberoun+Lake+Ubari+Libya",
      phone: "0923334455",
      stars: 5,
      partnership_status: "نشط",
      propertyType: "camp",
      price: 3013,
      originalPrice: 4293,
      rating: 9.5,
      ratingWord: lang === "ar" ? "استثنائي" : "Superb",
      reviewsCount: 4151,
      discountPct: 30,
      photos: [
        "/assets/dest-ubari-gaberoun.jpg",
        "/assets/dest-ubari-ummalmaa.jpg",
        "/assets/dest-sahara-dunes.jpg",
        "/assets/private-trip.jpg",
        "/assets/offer-desert.jpg",
      ],
    },
    {
      id: "HTL-005",
      name: lang === "ar" ? "منتجع شحات وقورينا الجبلي" : "Cyrene Mountain Panoramic Resort",
      city: lang === "ar" ? "شحات" : "Shahhat",
      address: lang === "ar" ? "الجبل الأخضر، شحات" : "Green Mountain, Shahhat",
      mapsQuery: "Cyrene+Shahhat+Libya",
      phone: "0925556677",
      stars: 5,
      partnership_status: "نشط",
      propertyType: "resort",
      price: 1245,
      originalPrice: 1550,
      rating: 9.1,
      ratingWord: lang === "ar" ? "استثنائي" : "Superb",
      reviewsCount: 1870,
      discountPct: 20,
      photos: [
        "/assets/dest-jabal-akhdar-panorama.jpg",
        "/assets/dest-jabal-akhdar-forest.jpg",
        "/assets/dest-jabal-akhdar-valley.jpg",
        "/assets/dest-jabal-akhdar-bridge.jpg",
        "/assets/restaurant-libya.jpg",
      ],
    },
    {
      id: "HTL-006",
      name: lang === "ar" ? "فندق ساحل الخمس (لبدة الكبرى)" : "Leptis Coast Seafront Hotel",
      city: lang === "ar" ? "الخمس" : "Al-Khoms",
      address: lang === "ar" ? "شاطئ الخمس، بالقرب من لبدة الأثرية" : "Al-Khoms Coast, near Leptis Magna",
      mapsQuery: "Leptis+Magna+Al+Khoms+Libya",
      phone: "0914443322",
      stars: 3,
      partnership_status: "نشط",
      propertyType: "hotel",
      price: 760,
      originalPrice: 950,
      rating: 8.7,
      ratingWord: lang === "ar" ? "ممتاز" : "Excellent",
      reviewsCount: 1120,
      discountPct: 20,
      photos: [
        "/assets/dest-leptis-coast.jpg",
        "/assets/dest-harbor-coast.jpg",
        "/assets/ai_hotel.jpg",
        "/assets/ai_food.jpg",
        "/assets/dest-tripoli-harbor.jpg",
      ],
    },
    {
      id: "HTL-007",
      name: lang === "ar" ? "أجنحة السرايا الفندقية الفاخرة" : "Al-Saraya Luxury Hotel Suites",
      city: lang === "ar" ? "طرابلس" : "Tripoli",
      address: lang === "ar" ? "شارع عمر المختار، طرابلس" : "Omar Al-Mokhtar St, Tripoli",
      mapsQuery: "Tripoli+Omar+Mokhtar+Libya",
      phone: "0913337722",
      stars: 4,
      partnership_status: "نشط",
      propertyType: "apartment",
      price: 680,
      originalPrice: 850,
      rating: 9.0,
      ratingWord: lang === "ar" ? "استثنائي" : "Superb",
      reviewsCount: 640,
      discountPct: 20,
      photos: [
        "/assets/ai_hotel.jpg",
        "/assets/dest-tripoli-harbor.jpg",
        "/assets/cafe-libya.jpg",
      ],
    },
    {
      id: "HTL-008",
      name: lang === "ar" ? "منتجع شاطئ زوارة السياحي" : "Zuwara Beachfront Tourist Resort",
      city: lang === "ar" ? "زوارة" : "Zuwara",
      address: lang === "ar" ? "طريق الساحل، شاطئ زوارة" : "Coastal Rd, Zuwara Beach",
      mapsQuery: "Zuwara+Beach+Libya",
      phone: "0926661144",
      stars: 5,
      partnership_status: "نشط",
      propertyType: "resort",
      price: 1150,
      originalPrice: 1450,
      rating: 9.3,
      ratingWord: lang === "ar" ? "استثنائي" : "Superb",
      reviewsCount: 1420,
      discountPct: 20,
      photos: [
        "/assets/dest-sabratha-coast.jpg",
        "/assets/dest-harbor-coast.jpg",
        "/assets/ai_hotel.jpg",
        "/assets/ai_food.jpg",
        "/assets/dest-tripoli-harbor.jpg",
      ],
    },
    {
      id: "HTL-009",
      name: lang === "ar" ? "فيلا ونزل وادي درنة التراثي" : "Derna Valley Heritage Villa & Lodge",
      city: lang === "ar" ? "درنة" : "Derna",
      address: lang === "ar" ? "وادي درنة، بالقرب من الشلال" : "Derna Valley, near Waterfall",
      mapsQuery: "Derna+Waterfall+Libya",
      phone: "0915559988",
      stars: 4,
      partnership_status: "نشط",
      propertyType: "heritage",
      price: 920,
      originalPrice: 1150,
      rating: 9.2,
      ratingWord: lang === "ar" ? "استثنائي" : "Superb",
      reviewsCount: 810,
      discountPct: 20,
      photos: [
        "/assets/dest-jabal-akhdar-valley.jpg",
        "/assets/dest-jabal-akhdar-bridge.jpg",
        "/assets/dest-jabal-akhdar-forest.jpg",
        "/assets/restaurant-libya.jpg",
        "/assets/cafe-libya.jpg",
      ],
    },
  ];
}

/* ============================================================ */
/* HOTEL OFFERS SPOTLIGHT (INTERACTIVE 3D STACKED DECK)        */
/* ============================================================ */
function HotelOffersSpotlight({
  offers,
  onSelectHotel,
}: {
  offers: HotelOffer[];
  onSelectHotel: (hotelId: string) => void;
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
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003580] tracking-tight leading-tight group-hover:text-[#D96B27] transition-colors">
              {offer.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-semibold">
              {offer.details}
            </p>

            {/* Verified Dallani Perk */}
            <div className="flex items-center gap-3 pt-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black flex items-center gap-1.5">
                <span>🏷️</span>
                <span>{isAr ? "خصم معتمد 20% لرواد منصة دلّني · حجز واستفسار مباشر" : "20% Verified Perk for Dallani Guests · Direct Concierge"}</span>
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => onSelectHotel(offer.hotelId)}
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>🏨</span>
                <span>{isAr ? "معاينة الفندق والتفاصيل" : "View Hotel Details"}</span>
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
                <img src={photo2} alt="Hotel view" className="w-full h-full object-cover" />
              </div>
              {/* Back card 1 */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-lg rotate-6 translate-x-3 translate-y-1.5 opacity-80 transition-all duration-300">
                <img src={photo1} alt="Hotel view" className="w-full h-full object-cover" />
              </div>
              {/* Front active card */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-2xl rotate-0 hover:rotate-1 transition-all duration-300">
                <img src={photo0} alt={offer.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-4 right-4 left-4 flex items-center justify-between text-white text-xs font-bold">
                  <span className="bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                    📷 {photos.length} {isAr ? "صور للعرض" : "photos"}
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
/* DEDICATED FULL DETAILS VIEW FOR HOTELS (DYNAMIC GALLERY & ZERO PRICES) */
/* ============================================================ */
const DEFAULT_HOTEL_PHOTOS = [
  "/assets/ai_hotel.jpg",
  "/assets/dest-harbor-coast.jpg",
  "/assets/cafe-libya.jpg",
  "/assets/dest-tripoli-medina.jpg",
];

function HotelDetailsView({
  hotel,
  onBack,
}: {
  hotel: HotelData;
  onBack: () => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "amenities" | "location">("overview");

  // Scroll to the very beginning of the page when opening details
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // Curate at least 4 high-res photos for rich dynamic gallery
  const rawPhotos = hotel.photos && hotel.photos.length > 0 ? hotel.photos : [];
  const uniquePhotos = Array.from(new Set([...rawPhotos, ...DEFAULT_HOTEL_PHOTOS]));
  const photos = uniquePhotos.slice(0, 4);

  const amenities = [
    { icon: "📶", title: isAr ? "واي فاي فائق السرعة" : "Ultra-Fast WiFi", desc: isAr ? "تغطية ألياف بصرية مجانية في جميع الغرف والمرافق" : "High speed fiber throughout property" },
    { icon: "🏊‍♂️", title: isAr ? "مسبح وإطلالات بانورامية" : "Scenic Pool & Views", desc: isAr ? "جلسات استرخاء شاطئية/جبلية بإطلالة خلابة" : "Scenic lounge and heated pool" },
    { icon: "🍽️", title: isAr ? "مطعم وبوفيه إفطار فاخر" : "Fine Dining & Breakfast", desc: isAr ? "أشهى المأكولات الليبية والعالمية والمشروبات الطازجة" : "Local & international cuisines" },
    { icon: "🅿️", title: isAr ? "مواقف خاصة وآمنة" : "Secure VIP Parking", desc: isAr ? "مواقف مجانية ومحروسة بكاميرات مراقبة 24/7" : "Secure free onsite parking" },
    { icon: "❄️", title: isAr ? "تكييف مركزي ذكي" : "Smart Climate Control", desc: isAr ? "تحكم رقمي فائق الهدوء في درجات الحرارة" : "Quiet personalized room control" },
    { icon: "🛡️", title: isAr ? "كونسيرج واستقبال 24/7" : "24/7 VIP Concierge", desc: isAr ? "فريق ضيافة متكامل لخدمتك على مدار الساعة" : "Round-the-clock guest concierge" },
  ];

  const photoCaptions = [
    { title: isAr ? "الواجهة الرئيسية والإطلالة" : "Main Façade & Panoramic View", icon: "🏛️" },
    { title: isAr ? "الأجنحة والغرف الفاخرة" : "Luxury Suites & Bedrooms", icon: "🛏️" },
    { title: isAr ? "صالة الاستقبال والمطعم" : "Lobby & Fine Dining", icon: "🍽️" },
    { title: isAr ? "المرافق والاستجمام" : "Amenities & Wellness", icon: "✨" },
  ];

  const hotelBio: Record<string, string> = {
    "HTL-001": isAr
      ? "يُعد فندق الفصول الأربعة طرابلس أحد أبرز صروح الإقامة الفاخرة على الواجهة البحرية للعاصمة. يتميز بإطلالات ساحرة مباشرة على البحر الأبيض المتوسط، ويجمع بين فخامة العمارة الكلاسيكية ووسائل الراحة العصرية. يقع الفندق على مقربة من كورنيش طرابلس وميدان الشهداء والمدينة القديمة، ويوفر بيئة هادئة ومثالية للوفود ورجال الأعمال والعائلات الباحثين عن أعلى مستويات الراحة والخدمة الفندقية."
      : "Four Seasons Hotel Tripoli is a premier luxury waterfront landmark in Tripoli overlooking the Mediterranean.",
    "HTL-002": isAr
      ? "فندق تيبستي الدولي هو أيقونة الضيافة التاريخية في قلب مدينة بنغازي. يتميز بموقعه الاستراتيجي في ميدان الشجرة وإطلالاته البانورامية على بحيرة 23 يوليو والمدينة. يضم مرافق متكاملة وقاعات مؤتمرات ومطاعم متنوعة تخدم الزوار وتوفر استراحة مريحة لزوار المنطقة الشرقية."
      : "Tibesti International Hotel is a historic landmark in central Benghazi overlooking July 23 Lake.",
    "HTL-003": isAr
      ? "يقدم نزل غدامس التراثي تجربة إقامة أصيلة تعكس عبق العمارة الطينية الفريدة للؤلؤة الصحراء المسجلة على لائحة التراث العالمي (اليونسكو). غرف تراثية مريحة تحافظ على البرودة الطبيعية صيفاً والدفء شتاءً، مع أسقف من خشب النخيل وجلسات شاي صحراوي تحت ضوء القمر."
      : "Ghadames Authentic Heritage Lodge offers traditional mud-brick architecture and UNESCO heritage hospitality.",
    "HTL-004": isAr
      ? "يقدم مخيم بحيرات أوباري الفاخر تجربة صحراوية استثنائية وسط الكثبان الذهبية لبحر الرمال العظيم في فزان. خيام ملكية مجهزة بأعلى معايير الراحة والخصوصية، مع جلسات شاي طوارقي فلكلورية تحت النجوم وسهرات سمر أصيلة ورحلات سفاري 4x4 لبحيرة قبرعون وأم الماء."
      : "Ubari Desert Camp offers an authentic Sahara glamping experience near Gaberoun and Umm al-Maa lakes.",
    "HTL-005": isAr
      ? "يتربع منتجع شحات وقورينا الجبلي على قمم الجبل الأخضر وسط غابات الصنوبر البديعة ونسائم البحر العليلة، مطلاً على المعالم الأثرية لمدينة قورينا الإغريقية، ويوفر إقامة جبلية هادئة لعشاق الطبيعة والتاريخ مع مأكولات ريفية طازجة."
      : "Cyrene Mountain Panoramic Resort offers alpine tranquility and views over Cyrene ancient temples.",
    "HTL-006": isAr
      ? "يتمتع فندق ساحل الخمس بموقع استراتيجي على شاطئ البحر الأبيض المتوسط على بعد دقائق قليلة من مدينة لبدة الكبرى الأثرية الرومانية. غرف فسيحة ومطلة على البحر مع مطعم أسماك بحري طازج وخدمات راقية للوفود والباحثين والمصطافين."
      : "Leptis Coast Seafront Hotel offers sea views and proximity to Leptis Magna UNESCO Roman ruins.",
    "HTL-007": isAr
      ? "أجنحة السرايا الفندقية بطرابلس تجمع بين راحة الشقق السكنية الفسيحة والخدمة الفندقية الراقية في شارع عمر المختار. مناسبة جداً للعائلات ورجال الأعمال، وتتضمن صالات جلوس خاصة ومطابخ تحضيرية مجهزة ومواقف سيارات آمنة."
      : "Al-Saraya Luxury Suites provide spacious serviced accommodations in central Tripoli.",
    "HTL-008": isAr
      ? "منتجع شاطئ زوارة السياحي يمتد على شريط ساحلي بكر يتميز بالرمال البيضاء ومياه البحر الفيروزية الصافية. يوفر شاليهات بحرية خاصة، وأنشطة رياضات مائية، ومطاعم بحرية، ومساحات لعب للأطفال لعطلات عائلية لا تُنسى."
      : "Zuwara Beachfront Resort offers white sand private beaches and seaside chalets.",
    "HTL-009": isAr
      ? "فيلا ونزل وادي درنة التراثي يقع في قلب الطبيعة الغناء لوادي درنة بالقرب من الشلال التاريخي. محاط بأشجار الفواكه والنخيل مع جلسات شرفة جبلية هادئة ومأكولات برقاوبة أصيلة لعشاق الاستجمام والهدوء."
      : "Derna Valley Heritage Villa offers peaceful stays surrounded by waterfalls and lush nature.",
  };

  const bio = hotelBio[hotel.id] || (isAr
    ? `${hotel.name} هو أحد أماكن الإقامة المعتمدة لدى منصة دلّني في مدينة ${hotel.city}. يتميز بمستوى خدمات راقٍ وموقع استراتيجي قريب من المعالم والخدمات، ويوفر لرواد المنصة خصومات حصرية وتجربة إقامة نموذجية ومريحة.`
    : `${hotel.name} is a verified partner stay on Dallani in ${hotel.city}.`);

  const nextPhoto = () => setActivePhoto((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#003580] selection:text-white" dir={dir}>
      {/* ── 1. LUXURY TOP FLOATING NAVIGATION ── */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2.5 text-slate-300 hover:text-white text-xs sm:text-sm font-black transition-all cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10"
          >
            <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#003580] flex items-center justify-center text-xs text-white transition-colors">
              {dir === "rtl" ? "→" : "←"}
            </span>
            <span>{isAr ? "العودة إلى قائمة الفنادق" : "Back to Hotels"}</span>
          </button>

          {/* Breadcrumb pills */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 font-bold">
            <span className="text-slate-500">{isAr ? "الرئيسية" : "Home"}</span>
            <span className="text-slate-700">/</span>
            <span className="text-slate-500">{isAr ? "الفنادق وأماكن الإقامة" : "Hotels"}</span>
            <span className="text-slate-700">/</span>
            <span className="text-amber-400 font-black truncate max-w-[220px]">{hotel.name}</span>
          </div>

          {/* VIP Dallani Perk Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-blue-500/20 border border-amber-400/30 text-amber-300 text-xs font-black shadow-lg shadow-amber-500/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isAr ? "خصم 20% حصري لرواد منصة دلّني" : "20% Exclusive Dallani Perk"}</span>
          </div>
        </div>
      </div>

      {/* ── 2. HERO IDENTITY & CINEMA STAGE CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
        
        {/* Luxury Hero Header Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/90 via-slate-900/90 to-slate-950/95 border border-white/15 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#003580]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-black">
                {/* Golden Stars */}
                <span className="px-3 py-1 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 tracking-widest text-sm flex items-center gap-1 shadow-xs">
                  <span>★</span>
                  <span>{hotel.stars || 5} {isAr ? "نجوم" : "Stars"}</span>
                </span>
                
                {/* Category Pill */}
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 border border-blue-400/30 text-blue-300 font-black">
                  {hotel.propertyType === "hotel"
                    ? (isAr ? "🏨 فندق مصنف" : "Certified Hotel")
                    : hotel.propertyType === "camp"
                    ? (isAr ? "⛺ مخيم صحراوي فاخر" : "Luxury Desert Camp")
                    : (isAr ? "🏛️ منتجع / نُزل تراثي" : "Resort / Heritage Stay")}
                </span>

                {/* Partnership Status Badge (نشط أو غير نشط) */}
                <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 ${
                  hotel.partnership_status === "غير نشط"
                    ? "bg-slate-500/20 border border-slate-400/30 text-slate-300"
                    : "bg-emerald-500/20 border border-emerald-400/30 text-emerald-300"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${hotel.partnership_status === "غير نشط" ? "bg-slate-400" : "bg-emerald-400 animate-pulse"}`} />
                  <span>{isAr ? `حالة الشراكة: ${hotel.partnership_status || "نشط"}` : `Partnership: ${hotel.partnership_status === "غير نشط" ? "Inactive" : "Active"}`}</span>
                </span>

                {/* City Tag */}
                <span className="px-3 py-1 rounded-xl bg-white/10 border border-white/15 text-slate-200 font-black">
                  📍 {hotel.city}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight drop-shadow-md">
                {hotel.name}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-semibold">
                <span className="flex items-center gap-1 text-slate-400">
                  <span>📍</span>
                  <span>{hotel.address || `${hotel.city}، ليبيا`}</span>
                </span>
                <span className="text-slate-600">•</span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    hotel.mapsQuery || `${hotel.name} ${hotel.city} ليبيا`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-amber-400 hover:text-amber-300 underline font-black inline-flex items-center gap-1 transition-colors"
                >
                  <span>{isAr ? "عرض الموقع في خرائط Google ↗" : "View Map on Google ↗"}</span>
                </a>
              </div>
            </div>

            {/* Rating Box & Quick Action Pod */}
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto bg-white/5 border border-white/15 p-4 rounded-3xl backdrop-blur-xl shadow-xl">
              <div className="text-right">
                <div className="text-sm font-black text-amber-300">{isAr ? "معدل التقييم الرقمي" : "Rating Score"}</div>
                <div className="text-xs text-slate-400 font-bold">{hotel.reviewsCount || 120} {isAr ? "تقييم نزيل معتمد" : "verified reviews"}</div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#003580] via-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-lg ring-2 ring-white/20">
                <span className="text-lg leading-tight font-black">{hotel.rating || 9.1}</span>
                <span className="text-[9px] text-amber-300 font-bold">{isAr ? "من 10" : "/10"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. BENTO PHOTO SHOWCASE & LIGHTBOX PREVIEW ── */}
        <div className="space-y-4">
          
          {/* Main Photo Gallery Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Featured Hero Photo (8 cols) - Fixed stable height & crisp presentation */}
            <div className="lg:col-span-8 relative h-[360px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-2xl group cursor-pointer shrink-0"
              onClick={() => setLightboxOpen(true)}
            >
              {/* Ambient Blurred Background for perfect clarity & lighting */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={photos[activePhoto]}
                  alt=""
                  className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
                  aria-hidden="true"
                />
              </div>

              <img
                src={photos[activePhoto]}
                alt={hotel.name}
                key={activePhoto}
                className="relative z-10 w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none z-10" />

              {/* Top Bar Badges */}
              <div className="absolute top-4 right-4 left-4 z-20 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2 pointer-events-auto">
                  <span className="bg-black/70 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg flex items-center gap-1.5">
                    <span>{photoCaptions[activePhoto]?.icon || "📷"}</span>
                    <span>{photoCaptions[activePhoto]?.title || (isAr ? `صورة ${activePhoto + 1}` : `Photo ${activePhoto + 1}`)}</span>
                  </span>
                  <span className="hidden sm:inline-flex bg-white/20 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                    4K Ultra HD
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
                  <span>{hotel.name} — {isAr ? "معاينة حقيقية للمرافق والغرف" : "Authentic Property Preview"}</span>
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
                        <span>{photoCaptions[idx]?.icon || "📷"}</span>
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
                    ? "bg-gradient-to-r from-[#003580] to-blue-600 text-white border-blue-400/40 shadow-lg shadow-blue-500/20 scale-102"
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
                { id: "overview", label: isAr ? "نبذة وتجربة الإقامة" : "Overview & Stay", icon: "🏨" },
                { id: "rooms", label: isAr ? "خيارات وتجهيزات الغرف" : "Room Comfort", icon: "🛏️" },
                { id: "amenities", label: isAr ? "المرافق والخدمات" : "Amenities", icon: "✨" },
                { id: "location", label: isAr ? "الموقع والمعالم" : "Location", icon: "📍" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-[#003580] to-blue-600 text-white shadow-md border border-blue-400/30"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* A. Property Overview */}
            {activeTab === "overview" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-4 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>🏨</span>
                  <h2>{isAr ? "نبذة عن الفندق والضيافة" : "About the Hotel & Stay"}</h2>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  {bio}
                </p>

                {/* Highlights tags */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-white/10">
                  {[
                    { title: isAr ? "إطلالة بانورامية ساحرة" : "Scenic Panoramic Views", icon: "🌅" },
                    { title: isAr ? "مستوى نظافة وتعقيم فندقي عالمي" : "Hospitality Grade Cleanliness", icon: "🧼" },
                    { title: isAr ? "خدمة غرف وسرعة استجابة فورية" : "Rapid Concierge & Room Service", icon: "🛎️" },
                    { title: isAr ? "قريب من المعالم والمراكز الحيوية" : "Prime Access to Highlights", icon: "📍" },
                  ].map((hl, i) => (
                    <div key={i} className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/5 text-xs sm:text-sm font-bold text-slate-200">
                      <span className="text-lg">{hl.icon}</span>
                      <span>{hl.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* B. Room Standards & Showcase */}
            {activeTab === "rooms" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>🛏️</span>
                  <h2>{isAr ? "خيارات وتجهيزات الغرف والأجنحة الفاخرة" : "Room Categories & Comfort"}</h2>
                </div>
                
                {/* 3 Room Tier Cards (ZERO PRICES) */}
                <div className="space-y-3.5">
                  {[
                    {
                      name: isAr ? "غرفة ديلوكس بسرير مزدوج وإطلالة" : "Deluxe Double Room with Scenic View",
                      bed: isAr ? "سرير مزدوج كبير جداً (King Size)" : "1 Extra-Large King Bed",
                      specs: isAr ? "تكييف هواء ذكي · حمام رخامي خاص · واي فاي فائق السرعة · شاشة ذكية 55 بوصة" : "Smart AC · Marble bath · WiFi · 55' TV",
                      perk: isAr ? "شامل الإفطار الصباحي الفاخر" : "Complimentary Breakfast Included",
                      tag: isAr ? "الأكثر طلباً" : "Most Popular",
                    },
                    {
                      name: isAr ? "جناح السفير الملكي الفسيح" : "Royal Ambassador Executive Suite",
                      bed: isAr ? "غرفة نوم ماستر منفصلة + صالة جلوس خاصة" : "Master Bedroom + Separate Lounge",
                      specs: isAr ? "جاكوزي استرخاء · بلكونة خاصة مطلة · ماكينة قهوة إسبريسو · ميني بار مجاني" : "Jacuzzi · Private Balcony · Espresso · Minibar",
                      perk: isAr ? "تسجيل وصول مبكر ومغادرة متأخرة مجاناً" : "Early Check-in & Late Checkout",
                      tag: isAr ? "فخامة استثنائية" : "VIP Luxury",
                    },
                    {
                      name: isAr ? "شقة فندقية عائلية متكاملة" : "Family Residential Serviced Suite",
                      bed: isAr ? "غرفتان نوم منفصلتان + منطقة طعام ومطبخ" : "2 Separate Bedrooms + Dining Area",
                      specs: isAr ? "مطبخ تحضيري متكامل · غسالة ملابس · أمان وخصوصية تامة للعائلات" : "Kitchenette · Washing machine · Family Privacy",
                      perk: isAr ? "خصم خاص على الوجبات الإضافية" : "Special Dining Perks",
                      tag: isAr ? "مثالي للعائلات" : "Family Choice",
                    },
                  ].map((room, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/10 space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h4 className="text-sm sm:text-base font-black text-white">{room.name}</h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/30">
                          {room.tag}
                        </span>
                      </div>
                      <div className="text-xs text-amber-200/90 font-bold flex items-center gap-1.5">
                        <span>🛏️</span>
                        <span>{room.bed}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed">
                        {room.specs}
                      </p>
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-black pt-1">
                        <span>✓</span>
                        <span>{room.perk}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* C. Amenities */}
            {activeTab === "amenities" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>✨</span>
                  <h2>{isAr ? "المرافق والخدمات المتوفرة" : "Key Amenities & Facilities"}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 flex items-start gap-3.5"
                    >
                      <span className="text-3xl shrink-0 mt-0.5">{item.icon}</span>
                      <div className="space-y-0.5">
                        <div className="font-black text-sm text-white">{item.title}</div>
                        <div className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* D. Location */}
            {activeTab === "location" && (
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-xl">
                <div className="flex items-center gap-2.5 text-amber-400 font-black text-lg sm:text-xl">
                  <span>📍</span>
                  <h2>{isAr ? "الموقع الجغرافي والمعالم المجاورة" : "Location & Surroundings"}</h2>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  {isAr
                    ? `يتمتع فندق ${hotel.name} بموقع استراتيجي متميز في ${hotel.city}، مع توفر خيارات وصول سهلة لشبكات الطرق ومواقف سيارات آمنة، وقرب تام من الأسواق والمعالم التاريخية.`
                    : `${hotel.name} offers a strategic location in ${hotel.city} with convenient transport access and secure parking.`}
                </p>

                {/* Map Action Box */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-900/40 to-slate-900/60 border border-blue-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1 text-right w-full sm:w-auto">
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>🗺️</span>
                      <span>{isAr ? "توجيه نظام الملاحة (GPS)" : "GPS Direct Navigation"}</span>
                    </div>
                    <div className="text-xs text-slate-400 font-medium">
                      {hotel.address || `${hotel.city}، ليبيا`}
                    </div>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      hotel.mapsQuery || `${hotel.name} ${hotel.city} ليبيا`
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

          {/* Sticky Sidebar Column (4 cols) (ZERO PRICE NUMBERS - LUXURY CONCIERGE) */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            
            {/* VIP Dallani Pass Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/20 via-slate-800/80 to-slate-900/90 border border-amber-400/30 p-6 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                  <span>👑</span>
                  <span>{isAr ? "بطاقة الضيافة الحصرية" : "Dallani VIP Pass"}</span>
                </div>
                <div className="text-xl sm:text-2xl font-black text-white">
                  {isAr ? "خصم معتمد 20% لرواد دلّني" : "Exclusive 20% Guest Perk"}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                  {isAr
                    ? "أبلغ موظف الاستقبال أو أرسل استفسارك عبر واتساب موضحاً أنك من رواد (منصة دلّني) للاستفادة الفورية من الخصم المعتمد."
                    : "Mention Dallani upon reservation to claim your exclusive 20% hospitality perk directly."}
                </p>
              </div>

              {/* Direct Actions (Ultra-Polished) */}
              <div className="space-y-3">
                <a
                  href={`tel:${hotel.phone}`}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-[#003580] hover:from-blue-500 hover:to-blue-700 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-blue-600/30 active:scale-98 cursor-pointer"
                >
                  <span className="text-base">📞</span>
                  <span>{isAr ? `اتصال فوري بالاستقبال (${hotel.phone})` : `Call Front Desk (${hotel.phone})`}</span>
                </a>

                <a
                  href={`https://wa.me/218${hotel.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                    `مرحباً، أود الاستفسار عن إمكانية الحجز وتوافر الغرف لدى ${hotel.name} بعد الاطلاع عليه عبر منصة دلّني السياحية للاستفادة من خصم الـ 20%.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-600/30 active:scale-98 cursor-pointer"
                >
                  <span className="text-base">💬</span>
                  <span>{isAr ? "مراسلة واستعلام عبر واتساب" : "WhatsApp VIP Inquiry"}</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    hotel.mapsQuery || `${hotel.name} ${hotel.city} ليبيا`
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
                  <span>🛎️ {isAr ? "خدمة الاستقبال والكونسيرج:" : "Front Desk:"}</span>
                  <span className="text-emerald-400 font-black">{isAr ? "24 ساعة يومياً" : "24/7 Active"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>💳 {isAr ? "طرق الدفع المعتمدة:" : "Payment:"}</span>
                  <span className="text-white font-black">{isAr ? "نقداً، بطاقات، سداد، تداول" : "Cash, Cards, Sadad"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>🛡️ {isAr ? "حالة الاعتماد:" : "Status:"}</span>
                  <span className="text-amber-300 font-black">{isAr ? "شريك معتمد وموثق" : "Verified Partner"}</span>
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
              <h3 className="font-black text-base sm:text-lg">{hotel.name}</h3>
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
              alt={hotel.name}
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

function HotelsPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [city, setCity] = useState("all");
  const [stars, setStars] = useState(0);
  const [propertyType, setPropertyType] = useState<string>("none");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHotel, setSelectedHotel] = useState<HotelData | null>(null);
  const [likedHotels, setLikedHotels] = useState<Record<string, boolean>>({});

  const hotelsListingRef = useRef<HTMLElement>(null);

  const scrollToListing = () => {
    setTimeout(() => {
      hotelsListingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  // Check URL query parameters or sessionStorage for location passed from trips page
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const queryCity = urlParams.get("city") || sessionStorage.getItem("dallani_selected_city");
      if (queryCity) {
        setCity(queryCity);
        setPropertyType("all"); // Immediately show all hotels for this location!
        sessionStorage.removeItem("dallani_selected_city");
        scrollToListing();
      }
    } catch {}
  }, []);

  const [dbHotels, setDbHotels] = useState<HotelData[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/hotels")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: HotelData[] = data.map((item: any) => ({
            id: item.hotel_id,
            name: item.hotel_name,
            city: item.city,
            address: item.address_details,
            mapsQuery: `${item.hotel_name}+${item.city}`,
            phone: item.phone_number,
            stars: item.star_rating,
            partnership_status: item.partnership_status || "نشط",
            propertyType: "hotel",
            photos: [
              item.hotel_photo_1 || "/assets/ai_hotel.jpg",
              item.hotel_photo_2 || "/assets/dest-harbor-coast.jpg",
              item.hotel_photo_3 || "/assets/cafe-libya.jpg",
            ],
          }));
          setDbHotels(mapped);
        }
      })
      .catch(() => {});
  }, []);

  const hotels = useMemo(() => {
    const defaultList = getHotels(language);
    if (dbHotels.length === 0) return defaultList;
    const dbIds = new Set(dbHotels.map((h) => h.id));
    return [...dbHotels, ...defaultList.filter((h) => !dbIds.has(h.id))];
  }, [language, dbHotels]);

  const cities = useMemo(
    () => [
      { key: "all", label: language === "ar" ? "جميع المدن والمناطق" : "All Cities" },
      { key: language === "ar" ? "طرابلس" : "Tripoli", label: language === "ar" ? "طرابلس" : "Tripoli" },
      { key: language === "ar" ? "بنغازي" : "Benghazi", label: language === "ar" ? "بنغازي" : "Benghazi" },
      { key: language === "ar" ? "غدامس" : "Ghadames", label: language === "ar" ? "غدامس" : "Ghadames" },
      { key: language === "ar" ? "أوباري" : "Ubari", label: language === "ar" ? "أوباري" : "Ubari" },
      { key: language === "ar" ? "شحات" : "Shahhat", label: language === "ar" ? "شحات (الجبل الأخضر)" : "Shahhat (Cyrene)" },
      { key: language === "ar" ? "الخمس" : "Al-Khoms", label: language === "ar" ? "الخمس (لبدة الكبرى)" : "Al-Khoms (Leptis)" },
    ],
    [language],
  );

  const filtered = useMemo(() => {
    if (propertyType === "none") return [];
    return hotels.filter((h) => {
      const matchCity = city === "all" || h.city.toLowerCase().includes(city.toLowerCase());
      const matchStars = stars === 0 || h.stars >= stars;
      const matchType = propertyType === "all" || h.propertyType === propertyType;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.address.toLowerCase().includes(q);
      return matchCity && matchStars && matchType && matchSearch;
    });
  }, [hotels, city, stars, propertyType, searchQuery]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedHotels((prev) => ({ ...prev, [id]: !prev[id] }));
  };


  return (
    <div className="min-h-screen bg-[#F7F8FA]" dir={dir}>
      <Header active="hotels" />

      {/* ── 1. HERO SECTION (Professional Animated Slideshow) ── */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#003580]">
        <HeroSlideshow
          images={[
            "/assets/ai_city.jpg",
            "/assets/ai_ruins.jpg",
            "/assets/ai_ruins.jpg",
            "/assets/ai_ruins.jpg",
          ]}
          alt="الفنادق والإقامة في ليبيا"
          brightness="brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003580]/90 via-[#003580]/45 to-transparent z-10" />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-12 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit mb-2.5 border border-white/25">
            🏨 {isAr ? "دليل واستعراض الفنادق وأماكن الإقامة في ليبيا (للعرض والتعريف فقط)" : "Hotels & Stays Directory in Libya (Showcase Only)"}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-lg tracking-tight">
            {isAr ? "اختر مكان إقامتك واستكشف خدمات الفنادق" : "Discover premier verified stays across Libya"}
          </h1>
          <p className="mt-2 text-white/95 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-sm">
            {isAr
              ? "استكشف أفضل الفنادق والنُزل في طرابلس، بنغازي، غدامس، وأوباري وتعرف على مرافقها ومواقعها وأرقام التواصل المباشرة."
              : "Discover premier hotels, heritage lodges, and desert camps across Libya with verified contacts and location maps."}
          </p>
        </div>
      </div>


      {/* ── 2. UNIFIED FLOATING FILTER PANEL (Matching Attractions & Guides) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E8E2D6] text-[#0F172A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 bg-[#F0F4F8] rounded-2xl border border-blue-100">
            {/* Search Input */}
            <div className="lg:col-span-5 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🔍</span>
              <div className="relative flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "البحث عن فندق أو وجهة:" : "Search Hotel or City:"}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSearchQuery(val);
                    if (propertyType === "none" && val.trim()) setPropertyType("all");
                  }}
                  placeholder={isAr ? "ابحث باسم الفندق، المدينة، أو العنوان..." : "Search by hotel name or city..."}
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
                  {isAr ? "المدينة والوجهة:" : "City & Destination:"}
                </label>
                <select
                  value={city}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCity(val);
                    if (propertyType === "none") setPropertyType("all");
                    scrollToListing();
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

            {/* Star Rating Select */}
            <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center justify-between gap-2">
              <div>
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "تصنيف النجوم:" : "Star Rating:"}
                </label>
                <div className="flex items-center gap-1">
                  {[0, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setStars(s);
                        if (propertyType === "none") setPropertyType("all");
                        scrollToListing();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                        stars === s
                          ? "bg-[#003580] text-white shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {s === 0 ? (isAr ? "الكل" : "All") : `${s}★`}
                    </button>
                  ))}
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                {filtered.length} {isAr ? "أماكن متاحة" : "Available"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16">
        
        {/* ── 4. BROWSE BY PROPERTY TYPE (TALL CARDS WITH RICH STYLING & LINKED FILTERING) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] flex items-center gap-2">
                <span>🏨</span>
                <span>{isAr ? "تصفح حسب نوع مكان الإقامة في ليبيا" : "Browse by Property Type in Libya"}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isAr
                  ? "اضغط على أي تصنيف أدناه لتصفية وعرض الفنادق والمنتجعات التابعة له فوراً"
                  : "Click any category to filter and view matching stays immediately"}
              </p>
            </div>
            {propertyType !== "none" && (
              <button
                type="button"
                onClick={() => setPropertyType("none")}
                className="text-xs font-black text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3.5 py-1.5 rounded-xl border border-red-200 transition cursor-pointer flex items-center gap-1"
              >
                <span>✕</span>
                <span>{isAr ? "إلغاء التصفية" : "Clear Filter"}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              {
                id: "hotel",
                title: isAr ? "فنادق فاخرة" : "Luxury Hotels",
                count: isAr ? "24 مكان متاح" : "24 available",
                img: "/assets/ai_city.jpg",
                badge: isAr ? "خدمة 5 نجوم" : "5-Star Service",
                badgeBg: "bg-[#003580]",
                activeBorder: "border-[#003580] ring-4 ring-[#003580]/25",
              },
              {
                id: "resort",
                title: isAr ? "منتجعات سياحية" : "Touristic Resorts",
                count: isAr ? "10 أماكن متاحة" : "10 available",
                img: "/assets/ai_city.jpg",
                badge: isAr ? "استجمام وشواطئ" : "Leisure & Beach",
                badgeBg: "bg-teal-700",
                activeBorder: "border-teal-700 ring-4 ring-teal-700/25",
              },
              {
                id: "apartment",
                title: isAr ? "شقق فندقية" : "Hotel Apartments",
                count: isAr ? "16 مكان متاح" : "16 available",
                img: "/assets/ai_city.jpg",
                badge: isAr ? "خصوصية عائلية" : "Family Suites",
                badgeBg: "bg-indigo-700",
                activeBorder: "border-indigo-700 ring-4 ring-indigo-700/25",
              },
              {
                id: "heritage",
                title: isAr ? "نزل وفلل تراثية" : "Heritage Villas & Lodges",
                count: isAr ? "12 مكان متاح" : "12 available",
                img: "/assets/ai_city.jpg",
                badge: isAr ? "أصالة وتاريخ" : "Heritage",
                badgeBg: "bg-amber-700",
                activeBorder: "border-amber-700 ring-4 ring-amber-700/25",
              },
              {
                id: "camp",
                title: isAr ? "مخيمات صحراوية" : "Desert Camps",
                count: isAr ? "8 أماكن متاحة" : "8 available",
                img: "/assets/ai_ruins.jpg",
                badge: isAr ? "سفاري ومغامرة" : "Desert Safari",
                badgeBg: "bg-[#D96B27]",
                activeBorder: "border-[#D96B27] ring-4 ring-[#D96B27]/25",
              },
            ].map((prop) => {
              const isSelected = propertyType === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => {
                    setPropertyType(prop.id === propertyType ? "none" : prop.id);
                  }}
                  className={`group relative h-64 sm:h-72 rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer border select-none flex flex-col justify-between p-4 ${
                    isSelected
                      ? `${prop.activeBorder} scale-[1.02]`
                      : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {/* Photo with zoom */}
                  <img
                    src={prop.img}
                    alt={prop.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-100"
                  />
                  {/* Dark gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-white text-[10px] font-black shadow-xs ${prop.badgeBg}`}>
                      {prop.badge}
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-white text-[#003580] flex items-center justify-center text-xs font-black shadow-xs">
                        ✓
                      </span>
                    )}
                  </div>

                  {/* Bottom Text */}
                  <div className="relative z-10 text-white space-y-1">
                    <h4 className="font-black text-base sm:text-lg group-hover:text-amber-300 transition-colors leading-snug drop-shadow-sm">
                      {prop.title}
                    </h4>
                    <div className="text-xs text-white/85 font-bold flex items-center justify-between">
                      <span>{prop.count}</span>
                      <span className="text-amber-300 text-xs">➔</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. ALL HOTELS LISTING (Filtered by Selected Category) ── */}
        <section ref={hotelsListingRef} id="hotels-listing-section" className="space-y-4 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-black text-[#0F172A]">
                {propertyType === "none"
                  ? (isAr ? "أماكن الإقامة والفنادق في ليبيا" : "Accommodations in Libya")
                  : (isAr ? "نتائج البحث وأماكن الإقامة المصنفة" : "Filtered Properties")}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr ? "معاينة الفنادق والمنتجعات، الأسعار، وأرقام الهواتف للتواصل المباشر" : "Explore properties, rates, and direct telephone contact for booking"}
              </p>
            </div>
            {propertyType !== "none" && (
              <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
                {filtered.length} {isAr ? "مكان متاح" : "properties found"}
              </span>
            )}
          </div>

          {/* Active Category Filter Indicator */}
          {propertyType !== "none" && (
            <div className="p-3.5 bg-[#EBF3FF] rounded-2xl border border-blue-200 flex items-center justify-between text-xs">
              <span className="font-black text-[#003580] flex items-center gap-2">
                <span>🏷️</span>
                <span>
                  {isAr ? "أماكن الإقامة المعروضة مصنفة حسب:" : "Filtered By:"}
                  {" "}
                  <strong className="text-sm underline">
                    {propertyType === "hotel"
                      ? (isAr ? "فنادق فاخرة" : "Luxury Hotels")
                      : propertyType === "resort"
                      ? (isAr ? "منتجعات سياحية" : "Touristic Resorts")
                      : propertyType === "apartment"
                      ? (isAr ? "شقق فندقية" : "Hotel Apartments")
                      : propertyType === "heritage"
                      ? (isAr ? "نزل وفلل تراثية" : "Heritage Villas & Lodges")
                      : (isAr ? "مخيمات صحراوية" : "Desert Camps")}
                  </strong>
                </span>
              </span>
              <button
                type="button"
                onClick={() => setPropertyType("none")}
                className="text-xs font-bold text-red-600 hover:text-red-800 bg-white px-3 py-1 rounded-xl border border-red-200 transition cursor-pointer"
              >
                ✕ {isAr ? "إلغاء التصفية" : "Clear Filter"}
              </button>
            </div>
          )}

          {/* Prompt banner when no category is selected yet */}
          {propertyType === "none" ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-[#003580]/20 shadow-xs space-y-3 my-4">
              <div className="text-4xl sm:text-5xl mb-2">🏨</div>
              <h4 className="text-lg sm:text-xl font-black text-[#003580]">
                {isAr ? "يرجى اختيار نوع مكان الإقامة أعلاه لعرض الأماكن المتاحة" : "Please select a property category above to view available stays"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
                {isAr
                  ? "اضغط على أي تصنيف بالأعلى (فنادق فاخرة، منتجعات سياحية، شقق فندقية، نزل وفلل تراثية، أو مخيمات صحراوية) لعرض قائمة الأماكن والتفاصيل فوراً."
                  : "Pick from luxury hotels, touristic resorts, apartments, heritage lodges, or desert camps above."}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  { id: "hotel", label: isAr ? "🏨 فنادق فاخرة" : "Hotels" },
                  { id: "resort", label: isAr ? "🏖️ منتجعات سياحية" : "Resorts" },
                  { id: "apartment", label: isAr ? "🏢 شقق فندقية" : "Apartments" },
                  { id: "heritage", label: isAr ? "🏛️ نزل وفلل تراثية" : "Heritage" },
                  { id: "camp", label: isAr ? "⛺ مخيمات صحراوية" : "Camps" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setPropertyType(btn.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#003580] text-[#003580] hover:text-white border border-[#E8E2D6] text-xs font-black transition cursor-pointer shadow-xs"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((h) => {
                const isFav = !!likedHotels[h.id];
                return (
                  <article
                    key={h.id}
                    onClick={() => setSelectedHotel(h)}
                    className="group bg-white rounded-2xl border border-slate-200 hover:border-[#003580]/40 shadow-xs hover:shadow-lg transition-all p-3 sm:p-4 cursor-pointer flex flex-col md:flex-row gap-4"
                  >
                    {/* Photo with Heart Favorite */}
                    <div className="relative w-full md:w-64 h-48 sm:h-52 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                      <img
                        src={h.photos[0]}
                        alt={h.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={(e) => toggleLike(h.id, e)}
                        className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-xs z-10 cursor-pointer ${
                          isFav ? "bg-white text-red-500" : "bg-black/40 text-white hover:bg-white hover:text-red-500"
                        }`}
                        title={isAr ? "إضافة للمفضلة" : "Save to wishlist"}
                      >
                        <span className="text-sm">{isFav ? "❤️" : "🤍"}</span>
                      </button>
                      {h.discountPct && (
                        <div className="absolute top-2.5 left-2.5 bg-[#D96B27] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full">
                          -{h.discountPct}%
                        </div>
                      )}
                    </div>

                    {/* Middle Column: Details, Location, Specs (Decluttered as requested) */}
                    <div className="flex-1 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h4 className="text-lg font-black text-[#003580] group-hover:underline">
                            {h.name}
                          </h4>
                          <span className="text-xs text-amber-500 font-bold">
                            {"★".repeat(h.stars)}
                          </span>
                        </div>

                        {/* Location link */}
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-2">
                          <span className="text-[#003580] font-bold underline">{h.city}</span>
                          <span>·</span>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.mapsQuery || `${h.name} ${h.city}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[#003580] hover:underline"
                          >
                            {isAr ? "إظهار على الخريطة" : "Show on map"}
                          </a>
                        </div>

                        {/* Clean Subtitle & Status (No paragraph clutter) */}
                        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500 pt-1">
                          <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            ✓ {h.partnership_status}
                          </span>
                          <span>·</span>
                          <span className="text-[#003580]">
                            {h.propertyType === "hotel"
                              ? (isAr ? "فندق فاخر معتمد" : "Luxury Hotel")
                              : h.propertyType === "resort"
                              ? (isAr ? "منتجع سياحي متكامل" : "Touristic Resort")
                              : h.propertyType === "apartment"
                              ? (isAr ? "شقق وأجنحة فندقية" : "Hotel Suites")
                              : h.propertyType === "heritage"
                              ? (isAr ? "نزل تراثي أصيل" : "Heritage Lodge")
                              : (isAr ? "مخيم صحراوي وسفاري" : "Desert Camp")}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${
                          h.partnership_status === "غير نشط"
                            ? "bg-slate-100 text-slate-600 border border-slate-300"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}>
                          {isAr ? `حالة الشراكة: ${h.partnership_status || "نشط"}` : `Partnership: ${h.partnership_status === "غير نشط" ? "Inactive" : "Active"}`}
                        </span>
                        <span className="text-slate-400 font-bold">· 📞 {h.phone}</span>
                      </div>
                    </div>

                  {/* Right Column: Rating & Price & Action Button */}
                  <div className="md:w-56 flex flex-col justify-between items-end shrink-0 border-t md:border-t-0 md:border-s md:border-slate-100 pt-3 md:pt-0 md:ps-4">
                    {/* Score Header (Numerical Score Only) */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-black text-xs text-[#003580]">{isAr ? "معدل التقييم" : "Rating"}</div>
                        <div className="text-[10px] text-slate-400">{h.reviewsCount} {isAr ? "تقييم" : "reviews"}</div>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[#003580] text-white font-black text-sm flex items-center justify-center shadow-xs">
                        {h.rating}
                      </div>
                    </div>

                    {/* Verified Perk Badge (Zero Price Display) */}
                    <div className="text-right my-2 w-full">
                      <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-right space-y-0.5">
                        <div className="text-[10px] text-emerald-800 font-black flex items-center justify-end gap-1">
                          <span>✓ {isAr ? "خصم معتمد 20%" : "20% Verified Perk"}</span>
                          <span>🏷️</span>
                        </div>
                        <div className="text-[9px] text-slate-500 font-semibold">
                          {isAr ? "لحجوزات رواد منصة دلّني" : "For Dallani Guests"}
                        </div>
                      </div>
                    </div>

                    {/* Blue Booking.com Button & Direct Contacts */}
                    <div className="w-full space-y-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        <a
                          href={`tel:${h.phone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          title={isAr ? "اتصال مباشر برقم هاتف الفندق للحجز" : "Call Hotel Phone"}
                        >
                          <span>📞</span>
                          <span>{h.phone}</span>
                        </a>

                        <a
                          href={`https://wa.me/218${h.phone.replace(/^0+/, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-black text-xs transition flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                          title={isAr ? "تواصل واتساب" : "WhatsApp"}
                        >
                          <span>💬</span>
                        </a>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedHotel(h);
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <span>{isAr ? "معرفة المزيد" : "Learn More"}</span>
                        <span>➔</span>
                      </button>

                      <div className="text-[10px] text-slate-400 font-bold text-center">
                        🏢 {isAr ? "للعرض والاستعلام المباشر فقط" : "Direct Inquiry Only"}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            {filtered.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
                <div className="text-4xl mb-2">🏨</div>
                <h4 className="font-black text-slate-800 text-base">
                  {isAr ? "لم نجد فنادق تطابق معايير بحثك" : "No hotels matched your criteria"}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  {isAr ? "جرب تغيير المدينة أو مسح حقل البحث لإظهار جميع الفنادق." : "Try clearing your search or selecting all cities."}
                </p>
                <button
                  onClick={() => {
                    setCity("all");
                    setStars(0);
                    setSearchQuery("");
                  }}
                  className="mt-4 px-4 py-2 bg-[#003580] text-white text-xs font-black rounded-xl"
                >
                  {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>

      {/* Dynamic Animated Hotel Details Popup Modal */}
      <HotelDetailsModal
        hotel={selectedHotel}
        open={Boolean(selectedHotel)}
        onClose={() => setSelectedHotel(null)}
      />

      <Footer />
    </div>
  );
}

export default HotelsPage;
