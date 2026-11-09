import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, MessageCircle, Phone } from "lucide-react";
import { useMemo, useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/i18n";
import { Icon } from "@/components/Icons";
import { Footer } from "@/components/Footer";
import { HotelDetailsModal, type HotelData } from "@/components/HotelDetailsModal";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { apiGetHotels } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";

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

const HOTEL_OFFERS: HotelOffer[] = [];

function getHotels(): HotelData[] { return []; }

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
        className="group relative rounded-3xl bg-[#FFF9F5] border-2 border-[#E8E2D6] p-6 sm:p-10 shadow-lg hover:shadow-md transition duration-300 cursor-pointer overflow-hidden select-none"
      >
        {/* Ambient Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-radial from-[#D96B27]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-radial from-amber-400/15 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Diagonal Corner Triangle / Ribbon for Discount */}
        <div className="absolute top-0 right-0 w-36 h-36 overflow-hidden pointer-events-none z-20">
          <div className="absolute top-6 -right-10 w-44 py-1.5 bg-red-600 text-white text-center text-xs font-black tracking-wider shadow-md rotate-45 border-y border-white/30">
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
              <span className="px-3 py-1 rounded-full bg-[#00736F]/10 text-[#00736F] border border-[#00736F]/20 text-xs font-bold">
                📍 {offer.city}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#00736F] tracking-tight leading-tight group-hover:text-[#D96B27] transition-colors">
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
                className="px-6 py-3.5 rounded-2xl bg-[#D96B27] hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
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
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-md rotate-12 translate-x-6 translate-y-3 opacity-60 transition duration-300">
                <img src={photo2} alt="Hotel view" className="w-full h-full object-cover" />
              </div>
              {/* Back card 1 */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-lg rotate-6 translate-x-3 translate-y-1.5 opacity-80 transition duration-300">
                <img src={photo1} alt="Hotel view" className="w-full h-full object-cover" />
              </div>
              {/* Front active card */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden border-4 border-white shadow-md rotate-0 hover:rotate-1 transition duration-300">
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
    { icon: "🏊", title: isAr ? "مسبح وإطلالات بانورامية" : "Scenic Pool & Views", desc: isAr ? "جلسات استرخاء شاطئية/جبلية بإطلالة خلابة" : "Scenic lounge and heated pool" },
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

  const hotelBio: Record<string, string> = {};

  const bio = hotelBio[hotel.id] || (isAr
    ? `${hotel.name} هو أحد أماكن الإقامة المعتمدة لدى منصة دلّني في مدينة ${hotel.city}. يتميز بمستوى خدمات راقٍ وموقع استراتيجي قريب من المعالم والخدمات، ويوفر لرواد المنصة خصومات حصرية وتجربة إقامة نموذجية ومريحة.`
    : `${hotel.name} is a verified partner stay on Dallani in ${hotel.city}.`);

  const nextPhoto = () => setActivePhoto((prev) => (prev + 1) % photos.length);
  const prevPhoto = () => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-[#00736F] selection:text-white" dir={dir}>
      {/* ── 1. LUXURY TOP FLOATING NAVIGATION ── */}
      <div className="bg-slate-950/80 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onBack}
            className="group inline-flex items-center gap-2.5 text-slate-300 hover:text-white text-xs sm:text-sm font-black transition cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-2xl border border-white/10"
          >
            <span className="w-6 h-6 rounded-full bg-white/10 group-hover:bg-[#00736F] flex items-center justify-center text-xs text-white transition-colors">
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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-black shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>{isAr ? "خصم 20% حصري لرواد منصة دلّني" : "20% Exclusive Dallani Perk"}</span>
          </div>
        </div>
      </div>

      {/* ── 2. HERO IDENTITY & CINEMA STAGE CONTAINER ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 pb-24">
        
        {/* Luxury Hero Header Bar */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-800/90 border border-white/15 p-6 sm:p-8 shadow-md backdrop-blur-xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-[#00736F]/20 rounded-full blur-3xl pointer-events-none" />
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
                <span className="px-3 py-1 rounded-xl bg-teal-500/20 border border-teal-400/30 text-teal-300 font-black">
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
            <div className="flex items-center gap-3 shrink-0 self-start lg:self-auto bg-white/5 border border-white/15 p-4 rounded-3xl backdrop-blur-xl shadow-md">
              <FavoriteButton
                itemType="hotel"
                itemId={hotel.id}
                itemTitle={hotel.name}
                size="md"
              />
              <div className="text-right">
                <div className="text-sm font-black text-amber-300">{isAr ? "معدل التقييم الرقمي" : "Rating Score"}</div>
                <div className="text-xs text-slate-400 font-bold">
                  {(hotel.reviewsCount || 0) > 0 ? `${hotel.reviewsCount} ${isAr ? "تقييم نزيل معتمد" : "verified reviews"}` : (isAr ? "لا توجد تقييمات بعد" : "No reviews yet")}
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-[#00736F] text-white flex flex-col items-center justify-center font-black shrink-0 shadow-lg ring-2 ring-white/20">
                <span className="text-lg leading-tight font-black">{(hotel.rating || 0) > 0 ? hotel.rating : "—"}</span>
                <span className="text-[11px] text-amber-300 font-bold">{(hotel.rating || 0) > 0 ? (isAr ? "من 10" : "/10") : (isAr ? "جديد" : "New")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 3. BENTO PHOTO SHOWCASE & LIGHTBOX PREVIEW ── */}
        <div className="space-y-4">
          
          {/* Main Photo Gallery Bento Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Featured Hero Photo (8 cols) - Fixed stable height & crisp presentation */}
            <div className="lg:col-span-8 relative h-[360px] sm:h-[460px] md:h-[500px] rounded-3xl overflow-hidden bg-slate-950 border border-white/15 shadow-md group cursor-pointer shrink-0"
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
                className="relative z-10 w-full h-full object-cover object-center transition duration-700 ease-out group-hover:scale-105"
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
                  className="pointer-events-auto bg-white/90 hover:bg-white text-slate-900 text-xs font-black px-3.5 py-1.5 rounded-full shadow-md transition hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
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
                className="absolute top-1/2 -translate-y-1/2 right-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-md flex items-center justify-center font-black text-xl transition hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
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
                className="absolute top-1/2 -translate-y-1/2 left-4 z-20 w-12 h-12 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 shadow-md flex items-center justify-center font-black text-xl transition hover:scale-110 active:scale-95 cursor-pointer backdrop-blur-md"
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
                      className={`h-2 rounded-full transition cursor-pointer ${
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
                    className={`relative h-28 sm:h-36 lg:h-[155px] rounded-3xl overflow-hidden cursor-pointer group transition duration-300 bg-slate-950 border ${
                      isSelected
                        ? "border-amber-400 ring-2 ring-amber-400/50 scale-[1.02] shadow-md"
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
                className={`px-4 py-2 rounded-2xl text-xs font-black transition flex items-center gap-2 cursor-pointer border ${
                  activePhoto === idx
                    ? "bg-[#00736F] text-white border-teal-400/40 shadow-lg scale-102"
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
                  className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#00736F] text-white shadow-md border border-teal-400/30"
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
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-4 backdrop-blur-xl animate-in fade-in duration-300 shadow-md">
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
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-md">
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
                    <div key={idx} className="p-5 rounded-2xl bg-white/5 hover:bg-white/10 transition border border-white/10 space-y-2.5">
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
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-md">
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
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 sm:p-8 space-y-5 backdrop-blur-xl animate-in fade-in duration-300 shadow-md">
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
                <div className="p-5 rounded-2xl bg-teal-900/40 border border-teal-400/30 flex flex-col sm:flex-row items-center justify-between gap-4">
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
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition shadow-lg text-center"
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
            <div className="relative overflow-hidden rounded-3xl bg-amber-500/20 border border-amber-400/30 p-6 shadow-md backdrop-blur-xl space-y-5">
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2.5 shadow-md active:scale-98 cursor-pointer"
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
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2.5 shadow-md active:scale-98 cursor-pointer"
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
                  className="w-full py-3 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-200 font-black text-xs transition flex items-center justify-center gap-2 border border-white/15"
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
              className="max-h-[70vh] max-w-full rounded-3xl object-contain shadow-md border border-white/20"
            />
            
            {/* Chevrons */}
            <button
              type="button"
              onClick={prevPhoto}
              className="absolute right-4 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-md flex items-center justify-center font-black text-xl transition cursor-pointer"
            >
              {dir === "rtl" ? "→" : "←"}
            </button>
            <button
              type="button"
              onClick={nextPhoto}
              className="absolute left-4 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-md flex items-center justify-center font-black text-xl transition cursor-pointer"
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
                className={`w-20 h-14 rounded-xl overflow-hidden cursor-pointer border-2 transition ${
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

  // a search sent from the home page search box (?q=...)
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) {
      setSearchQuery(q);
      setPropertyType("all");
    }
  }, []);

  const hotelsListingRef = useRef<HTMLElement>(null);
  const hotelsScrollRef = useRef<HTMLDivElement>(null);

  const scrollHotels = (direction: "left" | "right") => {
    if (hotelsScrollRef.current) {
      const offset = direction === "left" ? -460 : 460;
      hotelsScrollRef.current.scrollBy({ left: dir === "rtl" ? -offset : offset, behavior: "smooth" });
    }
  };

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
    const fetchHotels = async () => {
      try {
        const liveHotels = await apiGetHotels();
        if (Array.isArray(liveHotels)) {
          const mapped: HotelData[] = liveHotels.map((item: any) => {
            const rawType = item.property_type || item.propertyType || "hotel";
            const cleanType =
              rawType === "resort" || rawType.includes("منتجع") ? "resort" :
              rawType === "apartment" || rawType.includes("شقق") ? "apartment" :
              rawType === "heritage" || rawType.includes("تراث") ? "heritage" : "hotel";
            return {
              id: item.hotel_id || item.id,
              name: item.hotel_name || item.name,
              city: item.city,
              address: item.address || "",
              mapsQuery: item.google_maps_url || `${item.hotel_name || item.name}+${item.city}`,
              phone: item.phone_number || item.phone,
              stars: Number(item.star_rating) || Number(item.stars) || 4,
              partnership_status: item.partnership_status || "شريك معتمد",
              propertyType: cleanType,
              description: item.description || "",
              working_hours: item.working_hours || "",
              discountPct: Number(item.discount_percentage) || Number(item.discountPct) || 0,
              contract_start_date: item.contract_start_date || "",
              contract_end_date: item.contract_end_date || "",
              amenities: Array.isArray(item.amenities) ? item.amenities : [],
              rating: Number(item.rating_avg) || 0,
              reviewsCount: Number(item.reviews_count) || 0,
              photos: [
                item.hotel_photo_1 || item.photos?.[0] || "/assets/ai_hotel.jpg",
                item.hotel_photo_2 || item.photos?.[1] || "/assets/hotel_resort.jpg",
                item.hotel_photo_3 || item.photos?.[2] || "/assets/dest-tripoli.jpg",
                item.hotel_photo_4 || item.photos?.[3] || "/assets/dest-harbor-coast.jpg",
                item.hotel_photo_5 || item.photos?.[4] || "/assets/dest-ghadames-alleys.jpg",
              ].filter(Boolean),
            };
          });
          setDbHotels(mapped);
          return;
        }
      } catch {}

      try {
        const stored = localStorage.getItem("dalni_hotels");
        if (stored) {
          const data = JSON.parse(stored);
          if (Array.isArray(data) && data.length > 0) {
            const mapped: HotelData[] = data.map((item: any) => {
              const rawType = item.property_type || item.propertyType || "hotel";
              const cleanType =
                rawType === "resort" || rawType.includes("منتجع") ? "resort" :
                rawType === "apartment" || rawType.includes("شقق") ? "apartment" :
                rawType === "heritage" || rawType.includes("تراث") ? "heritage" : "hotel";
              return {
                id: item.hotel_id || item.id,
                name: item.hotel_name || item.name,
                city: item.city,
                address: item.address || "",
                mapsQuery: item.google_maps_url || `${item.hotel_name || item.name}+${item.city}`,
                phone: item.phone_number || item.phone,
                stars: Number(item.star_rating) || Number(item.stars) || 4,
                partnership_status: item.partnership_status || "شريك معتمد",
                propertyType: cleanType,
                description: item.description || "",
                working_hours: item.working_hours || "",
                discountPct: Number(item.discount_percentage) || Number(item.discountPct) || 0,
                contract_start_date: item.contract_start_date || "",
                contract_end_date: item.contract_end_date || "",
                amenities: Array.isArray(item.amenities) ? item.amenities : [],
                rating: Number(item.rating_avg) || 0,
                reviewsCount: Number(item.reviews_count) || 0,
                photos: [
                  item.hotel_photo_1 || item.photos?.[0] || "/assets/ai_hotel.jpg",
                  item.hotel_photo_2 || item.photos?.[1] || "/assets/hotel_resort.jpg",
                  item.hotel_photo_3 || item.photos?.[2] || "/assets/dest-tripoli.jpg",
                  item.hotel_photo_4 || item.photos?.[3] || "/assets/dest-harbor-coast.jpg",
                  item.hotel_photo_5 || item.photos?.[4] || "/assets/dest-ghadames-alleys.jpg",
                ].filter(Boolean),
              };
            });
            setDbHotels(mapped);
          }
        }
      } catch {}
    };

    fetchHotels();
  }, []);

  const hotels = useMemo(() => {
    return dbHotels;
  }, [dbHotels]);

  // Category cards show how many places of that type are registered (not fixed numbers)
  const countLabel = (type: string) => {
    const n = hotels.filter((h) => h.partnership_status !== "موقوف" && h.propertyType === type).length;
    if (!isAr) return `${n} available`;
    if (n === 0) return "لا توجد أماكن مسجلة بعد";
    if (n === 1) return "مكان واحد متاح";
    if (n === 2) return "مكانان متاحان";
    return n <= 10 ? `${n} أماكن متاحة` : `${n} مكاناً متاحاً`;
  };

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
      // Exclude suspended/inactive hotels from public platform display
      if (h.partnership_status === "موقوف") return false;
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
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#00736F]">
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
        <div className="absolute inset-0 bg-gradient-to-t from-[#00736F]/90 via-[#00736F]/45 to-transparent z-10" />
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
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-md border border-[#E8E2D6] text-[#0F172A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 bg-[#F0F4F8] rounded-2xl border border-teal-100">
            {/* Search Input */}
            <div className="lg:col-span-5 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#00736F] font-bold text-base">🔍</span>
              <div className="relative flex-1">
                <label className="text-[11px] font-black text-[#00736F] block mb-0.5">
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
              <span className="text-[#00736F] font-bold text-base">📍</span>
              <div className="flex-1">
                <label className="text-[11px] font-black text-[#00736F] block mb-0.5">
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
                <label className="text-[11px] font-black text-[#00736F] block mb-0.5">
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
                          ? "bg-[#00736F] text-white shadow-xs"
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

          {/* Categories Grid (2 cards per row) OR Full-width Expanded Card when selected */}
          {propertyType === "none" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  id: "hotel",
                  title: isAr ? "فنادق فاخرة" : "Luxury Hotels",
                  count: countLabel("hotel"),
                  img: "/assets/ai_hotel.jpg",
                  badge: isAr ? "خدمة 5 نجوم" : "5-Star Service",
                  badgeBg: "bg-[#00736F]",
                },
                {
                  id: "resort",
                  title: isAr ? "منتجعات سياحية" : "Touristic Resorts",
                  count: countLabel("resort"),
                  img: "/assets/hotel_resort.jpg",
                  badge: isAr ? "استجمام وشواطئ" : "Leisure & Beach",
                  badgeBg: "bg-teal-700",
                },
                {
                  id: "apartment",
                  title: isAr ? "شقق فندقية" : "Hotel Apartments",
                  count: countLabel("apartment"),
                  img: "/assets/dest-tripoli.jpg",
                  badge: isAr ? "خصوصية عائلية" : "Family Suites",
                  badgeBg: "bg-teal-700",
                },
                {
                  id: "heritage",
                  title: isAr ? "مخيمات صحراوية" : "Desert Camps",
                  count: countLabel("heritage"),
                  img: "/assets/dest-ghadames-alleys.jpg",
                  badge: isAr ? "تخييم وسفاري" : "Desert Safari",
                  badgeBg: "bg-amber-700",
                },
              ].map((prop) => (
                <div
                  key={prop.id}
                  onClick={() => setPropertyType(prop.id)}
                  className="group relative h-60 sm:h-64 rounded-3xl overflow-hidden shadow-md hover:shadow-md transition duration-300 cursor-pointer border border-slate-200 hover:border-[#D96B27] flex flex-col justify-between p-5"
                >
                  <img
                    src={prop.img}
                    alt={prop.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />

                  {/* Top Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-2.5 py-1 rounded-full text-white text-[11px] font-black shadow-xs ${prop.badgeBg}`}>
                      {prop.badge}
                    </span>
                  </div>

                  {/* Bottom Text */}
                  <div className="relative z-10 text-white space-y-1">
                    <h4 className="font-black text-xl group-hover:text-amber-300 transition-colors leading-snug drop-shadow-sm">
                      {prop.title}
                    </h4>
                    <div className="text-xs text-white/90 font-bold">
                      <span>{prop.count}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Full width expanded card when selected
            (() => {
              if (propertyType === "all") {
                return (
                  <div className="relative w-full h-52 sm:h-60 rounded-3xl overflow-hidden shadow-md border-2 border-[#D96B27] flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-300">
                    <img
                      src="/assets/ai_hotel.jpg"
                      alt="All accommodations"
                      className="absolute inset-0 w-full h-full object-cover brightness-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-3.5 py-1 rounded-full text-white text-xs font-black bg-amber-500 shadow-xs">
                        🌟 {isAr ? "عرض شامل (كافة الأماكن)" : "All Accommodations"}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPropertyType("none")}
                        className="px-4 py-2 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border border-white/30 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-md"
                      >
                        <span>✕</span>
                        <span>{isAr ? "العودة للتصنيفات" : "Show Categories"}</span>
                      </button>
                    </div>
                    <div className="relative z-10 text-white space-y-1">
                      <h4 className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-md">
                        {isAr ? "كافة أماكن الإقامة والفنادق في ليبيا" : "All Accommodations & Hotels in Libya"}
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                        {isAr
                          ? "استعراض شامل لكافة الفنادق والمنتجعات والشقق والنزل المصنفة عبر منصة دلّني في كافة المدن."
                          : "Browse all verified stays across Libyan destinations with direct contacts."}
                      </p>
                    </div>
                  </div>
                );
              }

              const activeCat = [
                {
                  id: "hotel",
                  title: isAr ? "فنادق فاخرة (5 نجوم)" : "Luxury Hotels",
                  count: countLabel("hotel"),
                  img: "/assets/ai_hotel.jpg",
                  badge: isAr ? "خدمة 5 نجوم" : "5-Star Service",
                  badgeBg: "bg-[#00736F]",
                  desc: isAr ? "أرقى الفنادق المصنفة بضيافة استثنائية وخدمة 5 نجوم في أهم المدن مع خصم 15% لرواد دلّني." : "Top luxury rated 5-star hotels.",
                },
                {
                  id: "resort",
                  title: isAr ? "منتجعات سياحية واستجمام" : "Touristic Resorts",
                  count: countLabel("resort"),
                  img: "/assets/hotel_resort.jpg",
                  badge: isAr ? "استجمام وشواطئ" : "Leisure & Beach",
                  badgeBg: "bg-teal-700",
                  desc: isAr ? "منتجعات ساحلية بإطلالات بحرية ومسابح ومرافق استجمام متكاملة." : "Coastal resorts and leisure destinations.",
                },
                {
                  id: "apartment",
                  title: isAr ? "شقق فندقية وأجنحة عائلية" : "Hotel Apartments",
                  count: countLabel("apartment"),
                  img: "/assets/dest-tripoli.jpg",
                  badge: isAr ? "خصوصية عائلية" : "Family Suites",
                  badgeBg: "bg-teal-700",
                  desc: isAr ? "شقق وأجنحة مفروشة بالكامل تمنحك راحة وخصوصية عائلية تامة." : "Furnished apartments with family privacy.",
                },
                {
                  id: "heritage",
                  title: isAr ? "مخيمات صحراوية وسفاري" : "Desert Camps & Safari",
                  count: countLabel("heritage"),
                  img: "/assets/dest-ghadames-alleys.jpg",
                  badge: isAr ? "تخييم وسفاري" : "Desert Safari",
                  badgeBg: "bg-amber-700",
                  desc: isAr ? "مخيمات وتخييم صحراوي أصيل في واحات وكثبان الصحراء الليبية." : "Authentic desert camping and lodges in Libyan desert and oases.",
                },
              ].find((c) => c.id === propertyType);

              if (!activeCat) return null;

              return (
                <div className="relative w-full h-56 sm:h-64 rounded-3xl overflow-hidden shadow-md border-2 border-[#D96B27] flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-300">
                  <img
                    src={activeCat.img}
                    alt={activeCat.title}
                    className="absolute inset-0 w-full h-full object-cover brightness-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />

                  {/* Top Bar inside expanded card */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className={`px-3 py-1 rounded-full text-white text-xs font-black shadow-xs ${activeCat.badgeBg}`}>
                      {activeCat.badge}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPropertyType("all")}
                        className="px-3.5 py-1.5 rounded-2xl bg-amber-500/80 hover:bg-amber-500 text-white backdrop-blur-md border border-white/30 text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>🌟</span>
                        <span>{isAr ? "عرض الكل" : "View All"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPropertyType("none")}
                        className="px-3.5 py-1.5 rounded-2xl bg-white/20 hover:bg-white text-white hover:text-slate-900 backdrop-blur-md border border-white/30 text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-md"
                      >
                        <span>✕</span>
                        <span>{isAr ? "عرض باقي التصنيفات" : "Show All"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom info inside expanded card */}
                  <div className="relative z-10 text-white space-y-1.5">
                    <h4 className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-md">
                      {activeCat.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium max-w-2xl leading-relaxed">
                      {activeCat.desc}
                    </p>
                    <div className="text-xs text-white/90 font-bold flex items-center gap-2 pt-1">
                      <span>✓ {activeCat.count}</span>
                      <span>·</span>
                      <span className="text-amber-400 font-bold">🏷️ خصم معتمد 15% لرواد منصة دلّني</span>
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </section>

        {/* ── 5. ALL HOTELS LISTING (Filtered by Selected Category) ── */}
        <section ref={hotelsListingRef} id="hotels-listing-section" className="space-y-5 scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F172A] flex items-center gap-2">
                <span>🏨</span>
                <span>
                  {propertyType === "none"
                    ? (isAr ? "أماكن الإقامة والفنادق في ليبيا" : "Accommodations in Libya")
                    : (isAr ? "نتائج البحث وأماكن الإقامة المصنفة" : "Filtered Properties")}
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isAr ? "معاينة الفنادق والمنتجعات الفاخرة، والاتصال المباشر دون عمولات وسيط" : "Explore properties, luxury rates, and direct contact with verified hosts"}
              </p>
            </div>
            {propertyType !== "none" && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => scrollHotels("right")}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-[#00736F] text-[#00736F] hover:text-white border border-slate-200 shadow-xs transition flex items-center justify-center font-black cursor-pointer text-sm"
                    title={isAr ? "تمرير لليمين" : "Scroll Right"}
                  >
                    <span>➔</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollHotels("left")}
                    className="w-8 h-8 rounded-xl bg-white hover:bg-[#00736F] text-[#00736F] hover:text-white border border-slate-200 shadow-xs transition flex items-center justify-center font-black cursor-pointer text-sm"
                    title={isAr ? "تمرير لليسار" : "Scroll Left"}
                  >
                    <span className="rotate-180 inline-block">➔</span>
                  </button>
                </div>
                <span className="text-xs font-black text-slate-700 bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xs shrink-0 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{filtered.length} {isAr ? "مكان متاح" : "properties found"}</span>
                </span>
              </div>
            )}
          </div>


          {/* Prompt banner when no category is selected yet */}
          {propertyType === "none" ? (
            <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border-2 border-dashed border-[#00736F]/20 shadow-xs space-y-4 my-4">
              <div className="text-4xl sm:text-5xl mb-2">🏨</div>
              <h4 className="text-lg sm:text-xl font-black text-[#00736F]">
                {isAr ? "يرجى اختيار نوع مكان الإقامة أعلاه لعرض الأماكن المتاحة" : "Please select a property category above to view available stays"}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold max-w-lg mx-auto leading-relaxed">
                {isAr
                  ? "اضغط على أي تصنيف بالأعلى (فنادق فاخرة، منتجعات سياحية، شقق فندقية، مخيمات صحراوية) أو انقر على 'عرض الكل' لعرض كافة الأماكن فوراً."
                  : "Pick from luxury hotels, touristic resorts, apartments, desert camps, or click 'View All' above."}
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {[
                  { id: "all", label: isAr ? "🌟 عرض الكل (كافة الأماكن)" : "🌟 View All" },
                  { id: "hotel", label: isAr ? "🏨 فنادق فاخرة" : "Hotels" },
                  { id: "resort", label: isAr ? "🏖️ منتجعات سياحية" : "Resorts" },
                  { id: "apartment", label: isAr ? "🏢 شقق فندقية" : "Apartments" },
                  { id: "heritage", label: isAr ? "⛺ مخيمات صحراوية" : "Desert Camps" },
                ].map((btn) => (
                  <button
                    key={btn.id}
                    type="button"
                    onClick={() => setPropertyType(btn.id)}
                    className="px-3.5 py-2 rounded-xl bg-[#FAF7F2] hover:bg-[#00736F] text-[#00736F] hover:text-white border border-[#E8E2D6] text-xs font-black transition cursor-pointer shadow-xs"
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Hotel Listing with Smooth Horizontal Scroll ("سكرول يمين ويسار لعرضهم") & Static Orange Shadow Without Movement */}
              <div
                ref={hotelsScrollRef}
                className="flex gap-6 overflow-x-auto pb-6 pt-2 px-1 snap-x snap-mandatory scroll-smooth [scrollbar-width:thin] [scrollbar-color:#D96B27_rgba(217,107,39,0.15)]"
              >
                {filtered.map((h) => {
                  const isFav = !!likedHotels[h.id];
                  return (
                    <article
                      key={h.id}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedHotel(h);
                      }}
                      className="group w-[320px] sm:w-[400px] md:w-[440px] shrink-0 snap-start bg-white rounded-[28px] border border-[#E8E2D6] shadow-[0_10px_30px_-12px_rgba(15,23,42,0.25)] hover:shadow-[0_24px_50px_-18px_rgba(15,23,42,0.35)] hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer flex flex-col"
                    >
                      {/* Photo */}
                      <div className="relative w-full h-56 sm:h-60 overflow-hidden bg-slate-100">
                        <img
                          src={h.photos[0]}
                          alt={h.name}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/75 via-[#0F172A]/10 to-transparent pointer-events-none" />

                        <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                          <span className="px-3 py-1 rounded-full bg-black/35 backdrop-blur-md text-amber-300 text-xs font-black tracking-wider ring-1 ring-white/20">
                            {"★".repeat(h.stars)}
                            <span className="sr-only">{h.stars} نجوم</span>
                          </span>
                          <FavoriteButton itemType="hotel" itemId={h.id} itemTitle={h.name} size="sm" />
                        </div>

                        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-2 z-10">
                          <span className="inline-flex items-center gap-1 text-white text-xs font-bold drop-shadow">
                            <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                            {h.city}
                          </span>
                          {(h.discountPct ?? 0) > 0 && (
                            <span className="px-3 py-1 rounded-full bg-gradient-to-l from-[#D96B27] to-[#C56A3D] text-white text-[11px] font-black shadow-lg">
                              {isAr ? `خصم ${h.discountPct}% لعملاء دلّني` : `${h.discountPct}% off with Dalni`}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Body */}
                      <div className="p-5 flex-1 flex flex-col gap-3">
                        <div>
                          <h4 className="text-lg sm:text-xl font-black text-[#0F172A] group-hover:text-[#00736F] transition-colors leading-snug line-clamp-1">
                            {h.name}
                          </h4>
                          {h.description && (
                            <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{h.description}</p>
                          )}
                        </div>

                        {Array.isArray(h.amenities) && h.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {h.amenities.slice(0, 4).map((a: string) => (
                              <span key={a} className="px-2.5 py-1 rounded-full bg-[#1ABC9C]/10 text-[#0E8C74] text-[11px] font-bold">
                                {a}
                              </span>
                            ))}
                            {h.amenities.length > 4 && (
                              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 text-[11px] font-bold">+{h.amenities.length - 4}</span>
                            )}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedHotel(h);
                            }}
                            className="flex-1 h-11 rounded-full bg-[#00736F] hover:bg-[#0F172A] text-white font-black text-xs transition-colors flex items-center justify-center gap-2 shadow-md cursor-pointer"
                          >
                            <span>{isAr ? "عرض التفاصيل" : "View details"}</span>
                            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
                          </button>
                          {h.phone && (
                            <a
                              href={`tel:${h.phone}`}
                              className="w-11 h-11 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center shadow-sm transition-colors"
                              title={isAr ? `اتصال: ${h.phone}` : `Call ${h.phone}`}
                              aria-label={isAr ? "اتصال بالفندق" : "Call the hotel"}
                            >
                              <Phone className="w-4 h-4" aria-hidden="true" />
                            </a>
                          )}
                          {h.phone && (
                            <a
                              href={`https://wa.me/218${h.phone.replace(/^0+/, "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="w-11 h-11 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 flex items-center justify-center transition-colors"
                              title={isAr ? "واتساب" : "WhatsApp"}
                              aria-label={isAr ? "مراسلة الفندق على واتساب" : "WhatsApp the hotel"}
                            >
                              <MessageCircle className="w-4 h-4" aria-hidden="true" />
                            </a>
                          )}
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(h.mapsQuery || `${h.name} ${h.city}`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="w-11 h-11 rounded-full bg-[#00736F]/8 hover:bg-[#00736F]/15 text-[#00736F] ring-1 ring-[#00736F]/15 flex items-center justify-center transition-colors"
                            title={isAr ? "الموقع على خرائط Google" : "Open in Google Maps"}
                            aria-label={isAr ? "الموقع على الخريطة" : "Map"}
                          >
                            <MapPin className="w-4 h-4" aria-hidden="true" />
                          </a>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

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
                    className="mt-4 px-4 py-2 bg-[#00736F] text-white text-xs font-black rounded-xl"
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
