import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";

export type RestaurantData = {
  id: string;
  name: string;
  category?: "seafood" | "traditional" | "fastfood" | "cafe";
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
  signatureDishes?: string[];
  features?: string[];
  description?: string;
  discountPct?: number;
  partnership_status?: string;
  whatsapp?: string;
  contract_start_date?: string;
  contract_end_date?: string;
};

export function RestaurantDetailsModal({
  restaurant,
  open,
  onClose,
}: {
  restaurant: RestaurantData | null;
  open: boolean;
  onClose: () => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [activePhoto, setActivePhoto] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

  // Fallback high quality Libyan dining images
  const defaultPhotos = [
    "/assets/restaurant-libya.jpg",
    "/assets/ai_food.jpg",
    "/assets/cafe-libya.jpg",
    "/assets/dest-tripoli-medina.jpg",
    "/assets/dest-harbor-coast.jpg",
  ];

  const photos = restaurant?.photos && restaurant.photos.length > 0 ? restaurant.photos : defaultPhotos;

  useEffect(() => {
    if (open) {
      setActivePhoto(0);
      setIsLiked(false);
      setAutoPlay(true);
    }
  }, [open, restaurant]);

  // Slideshow auto-advance every 3s (matches HotelDetailsModal)
  useEffect(() => {
    if (!open || !autoPlay || lightboxOpen || photos.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [open, autoPlay, lightboxOpen, photos.length]);

  // Keyboard navigation & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxOpen) setLightboxOpen(false);
        else onClose();
      }
      if (e.key === "ArrowLeft") {
        setActivePhoto((prev) => (dir === "rtl" ? (prev + 1) % photos.length : (prev - 1 + photos.length) % photos.length));
      }
      if (e.key === "ArrowRight") {
        setActivePhoto((prev) => (dir === "rtl" ? (prev - 1 + photos.length) % photos.length : (prev + 1) % photos.length));
      }
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, lightboxOpen, photos.length, dir]);

  if (!open || !restaurant) return null;

  const discountPct = restaurant.discountPct || 15;
  const partnershipStatus = restaurant.partnership_status || "شريك معتمد";

  const photoCaptions = [
    { title: isAr ? "الجلسات والأجواء العامة" : "Ambiance & Dining Hall", icon: "✨" },
    { title: isAr ? "الأطباق والوجبات الطازجة" : "Specialty Dishes & Menu", icon: "🍽️" },
    { title: isAr ? "المشروبات والضيافة الليبية" : "Beverages & Traditional Tea", icon: "☕" },
    { title: isAr ? "الواجهة والموقع الخارجي" : "Exterior & Venue", icon: "🏛️" },
    { title: isAr ? "جلسات العائلات والخصوصية" : "Family & Private Seating", icon: "👨‍👩‍👧‍👦" },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `${restaurant.name} في ${restaurant.city} على منصة دلّني السياحية`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const whatsappPhone = restaurant.whatsapp || restaurant.phone.replace(/[^0-9]/g, "");

  return (
    <>
      {/* ── BACKDROP OVERLAY WITH BLUR ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all duration-300 animate-in fade-in"
        dir={dir}
        onClick={onClose}
      >
        {/* ── MODAL CONTAINER (Compact, Exactly like HotelDetailsModal) ── */}
        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full z-10 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Perk Strip */}
          <div className="bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-amber-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${partnershipStatus === "غير نشط" ? "bg-slate-400" : "bg-emerald-400 animate-ping"}`} />
              <span>🍽️ {isAr ? `مطعم ومقهى سياحي معتمد (${partnershipStatus})` : `Verified Partner (${partnershipStatus})`}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold">
              <span>🏷️ {isAr ? `خصم حصري ${discountPct}% لرواد دلّني` : `Exclusive ${discountPct}% Perk`}</span>
            </div>
          </div>

          {/* Close & Share Floating Bar */}
          <div className="absolute top-12 left-4 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-700 dark:text-slate-200 shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700"
              title={isAr ? "مشاركة المطعم" : "Share"}
            >
              <span>{copiedLink ? "✓" : "🔗"}</span>
            </button>
            <button
              type="button"
              onClick={() => setIsLiked(!isLiked)}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-700 dark:text-slate-200 shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700"
              title={isAr ? "حفظ للمفضلة" : "Favorite"}
            >
              <span className={isLiked ? "text-red-500 text-lg" : "text-slate-400 text-lg"}>{isLiked ? "❤️" : "🤍"}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-red-50 hover:text-red-600 text-slate-700 dark:text-slate-200 shadow-lg flex items-center justify-center transition hover:scale-105 active:scale-95 font-black text-lg cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              ✕
            </button>
          </div>

          {/* ── 1. CINEMATIC SLIDESHOW STAGE (Compact & Crisp: h-56 sm:h-64) ── */}
          <div
            className="relative h-56 sm:h-64 w-full bg-slate-950 overflow-hidden group select-none shrink-0"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            {/* Ambient Blurred Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={photos[activePhoto]}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-40 scale-110 transition-all duration-700"
                aria-hidden="true"
              />
            </div>

            {/* Main Stage Image */}
            <img
              src={photos[activePhoto]}
              alt={restaurant.name}
              className="relative z-10 w-full h-full object-cover object-center transition-all duration-500 ease-out transform scale-100 group-hover:scale-105 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-black/40 pointer-events-none z-10" />

            {/* Photo Caption & Identity */}
            <div className="absolute bottom-3 right-4 left-4 z-20 flex flex-wrap items-end justify-between gap-3 text-white pointer-events-none">
              <div className="space-y-1 pointer-events-auto">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-[11px] font-bold text-amber-300">
                  <span>{photoCaptions[activePhoto % photoCaptions.length]?.icon}</span>
                  <span>{photoCaptions[activePhoto % photoCaptions.length]?.title}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>📍 {restaurant.address || restaurant.city}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">★ {restaurant.rating || 5.0}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">{restaurant.type}</span>
                </div>
              </div>

              {/* Lightbox Zoom Button & Auto-slideshow indicator dots */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
                  {photos.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        activePhoto === idx ? "w-4 bg-amber-400" : "w-1.5 bg-white/40"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-2.5 py-1 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-[11px] font-black text-white flex items-center gap-1 transition hover:scale-105 cursor-pointer shadow-lg"
                >
                  <span>🔍 {isAr ? "تكبير" : "Zoom"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 2. COMPACT OVERVIEW & WORKING HOURS FIRST (No scroll, purely display) ── */}
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Hours & Location Cards Grid (Primary View: ساعات العمل هيا الواجهة الأولى) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Working Hours */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/60 border border-amber-100 dark:border-slate-700 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#D96B27] text-white flex items-center justify-center text-base shrink-0 shadow-sm">
                  ⏱️
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                    {isAr ? "ساعات وفترات العمل:" : "Working Hours:"}
                  </div>
                  <div className="text-xs font-black text-amber-700 dark:text-amber-300">
                    {restaurant.hours || (isAr ? "09:00 ص — 12:00 م" : "09:00 AM — 12:00 AM")}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {isAr ? "مفتوح يومياً لخدمتكم" : "Open daily"}
                  </div>
                </div>
              </div>

              {/* Cuisine & Specialty */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-base shrink-0 shadow-sm">
                  🍲
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                    {isAr ? "نوع المأكولات والتخصص:" : "Cuisine & Specialty:"}
                  </div>
                  <div className="text-xs font-black text-blue-700 dark:text-blue-300 truncate">
                    {restaurant.type}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold truncate">
                    {restaurant.specialty || (isAr ? "أطباق طازجة ومشروبات" : "Fresh Food & Drinks")}
                  </div>
                </div>
              </div>

              {/* Location & City */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-100 dark:border-slate-700 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-base shrink-0 shadow-sm">
                  📍
                </div>
                <div className="truncate">
                  <div className="text-[10px] font-black text-emerald-800 dark:text-emerald-400">
                    {isAr ? "المدينة والموقع:" : "City & Location:"}
                  </div>
                  <div className="text-xs font-black text-emerald-700 dark:text-emerald-300 truncate">
                    {restaurant.city}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold truncate">
                    {restaurant.address || restaurant.city}
                  </div>
                </div>
              </div>
            </div>

            {/* Concise Bio ("نبذة تعريفية سريعة ومختصرة") */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-xs font-black text-[#D96B27] dark:text-amber-400 flex items-center gap-1.5">
                <span>🍽️</span>
                <span>{isAr ? "نبذة تعريفية سريعة:" : "Quick Overview:"}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {restaurant.description
                  ? restaurant.description.slice(0, 160) + (restaurant.description.length > 160 ? "..." : "")
                  : isAr
                  ? `أحد أرقى المطاعم والمقاهي في ${restaurant.city}، يقدم تشكيلة من أشهى الأطباق التراثية والمأكولات الطازجة مع ضيافة مجانية وخصم 15% لرواد منصة دلّني.`
                  : `Premier dining and cafe venue in ${restaurant.city} offering authentic Libyan cuisine and fresh beverages.`}
              </p>
            </div>

            {/* Quick Amenities / Dining Perks Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: isAr ? "شاي باللوز مجاناً" : "Free Almond Tea", icon: "☕" },
                { label: isAr ? "جلسات عائلية مريحة" : "Family Seating", icon: "👨‍👩‍👧‍👦" },
                { label: isAr ? "واي فاي سريع مجاني" : "Free WiFi", icon: "📶" },
                { label: isAr ? "تكييف هادئ" : "Climate Control", icon: "❄️" },
                { label: isAr ? "موقف سيارات" : "Parking", icon: "🅿️" },
                { label: isAr ? "دفع إلكتروني (سداد/تداول)" : "Digital Pay", icon: "💳" },
              ].map((am, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 shadow-xs"
                >
                  <span>{am.icon}</span>
                  <span>{am.label}</span>
                </span>
              ))}
            </div>
          </div>

          {/* ── 3. BOTTOM ACTION BAR (Direct Dining Contact - Links Icon Removed) ── */}
          <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl z-30">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 flex items-center justify-center text-base shrink-0">
                🍽️
              </div>
              <div>
                <div className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isAr ? "دليل سياحي تعريفي (عرض فقط)" : "Tourism Directory Showcase"}</span>
                  <span className="px-2 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[9px] font-black">
                    {isAr ? "استعلام مباشر" : "Direct"}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold">
                  {isAr ? "تواصل مباشرة مع إدارة المطعم" : "Contact restaurant directly"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {/* WhatsApp direct contact */}
              {whatsappPhone && (
                <a
                  href={`https://wa.me/218${whatsappPhone.replace(/^0/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
                >
                  <span>💬</span>
                  <span>{isAr ? "واتساب" : "WhatsApp"}</span>
                </a>
              )}

              {/* Direct phone call */}
              <a
                href={`tel:${restaurant.phone}`}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs transition flex items-center gap-1.5 shadow-sm hover:scale-105 active:scale-95"
              >
                <span>📞</span>
                <span>{restaurant.phone || (isAr ? "اتصال" : "Call")}</span>
              </a>

              {/* Google Maps link */}
              {restaurant.mapsQuery && (
                <a
                  href={
                    restaurant.mapsQuery.startsWith("http")
                      ? restaurant.mapsQuery
                      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.mapsQuery)}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs transition flex items-center gap-1 border border-slate-200 dark:border-slate-700"
                >
                  <span>🗺️</span>
                  <span>{isAr ? "الخريطة" : "Map"}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. LIGHTBOX ZOOM MODAL (High-Res View) ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[120] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-between p-4 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxOpen(false)}
          dir={dir}
        >
          {/* Top Bar */}
          <div className="w-full flex items-center justify-between text-white z-10 p-2" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3">
              <span className="text-sm font-black text-amber-400">
                {restaurant.name} · {restaurant.city}
              </span>
              <span className="text-xs text-slate-400">
                ({activePhoto + 1} / {photos.length})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white font-black text-xl flex items-center justify-center transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Main Zoomed Photo */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-5xl my-auto">
            <img
              src={photos[activePhoto]}
              alt={restaurant.name}
              className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Bottom Thumbnails */}
          <div className="flex items-center gap-2 overflow-x-auto p-2 max-w-full z-10" onClick={(e) => e.stopPropagation()}>
            {photos.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhoto(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                  activePhoto === idx ? "border-amber-400 scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
