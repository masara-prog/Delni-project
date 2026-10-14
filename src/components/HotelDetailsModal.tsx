import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";

export type HotelData = {
  id: string;
  name: string;
  city: string;
  address: string;
  mapsQuery: string;
  phone: string;
  stars: number;
  partnership_status: string;
  photos: string[];
  price?: number;
  originalPrice?: number;
  rating?: number;
  ratingWord?: string;
  reviewsCount?: number;
  discountPct?: number;
  propertyType?: string;
  badge?: string;
  description?: string;
};

export function HotelDetailsModal({
  hotel,
  open,
  onClose,
}: {
  hotel: HotelData | null;
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

  // Fallback high quality Libyan hotel images
  const defaultPhotos = [
    "/assets/ai_hotel.jpg",
    "/assets/ai_city.jpg",
    "/assets/dest-tripoli-harbor.jpg",
    "/assets/dest-harbor-coast.jpg",
    "/assets/ai_food.jpg",
  ];

  const photos = hotel?.photos && hotel.photos.length > 0 ? hotel.photos : defaultPhotos;

  useEffect(() => {
    if (open) {
      setActivePhoto(0);
      setIsLiked(false);
      setAutoPlay(true);
    }
  }, [open, hotel]);

  // Slideshow auto-advance every 3s
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

  if (!open || !hotel) return null;

  const discountPct = hotel.discountPct || 20;

  const photoCaptions = [
    { title: isAr ? "الإطلالة البانورامية والواجهة الرئيسية" : "Main Façade & Panoramic View", icon: "🏛️" },
    { title: isAr ? "الأجنحة والغرف الفاخرة المطلة" : "Luxury Sea/Mountain Suites", icon: "🛏️" },
    { title: isAr ? "صالة الاستقبال والبهو الأندلسي" : "Lobby & Reception", icon: "✨" },
    { title: isAr ? "مطعم الفندق وبوفيه الإفطار" : "Fine Dining & Breakfast", icon: "🍽️" },
    { title: isAr ? "المرافق والاستجمام وحمام السباحة" : "Wellness & Leisure Facilities", icon: "🏊‍♂️" },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `${hotel.name} في ${hotel.city} على منصة دلّني السياحية`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <>
      {/* ── BACKDROP OVERLAY WITH BLUR ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all duration-300 animate-in fade-in"
        dir={dir}
        onClick={onClose}
      >
        {/* ── MODAL CONTAINER ── */}
        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full z-10 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Perk Strip */}
          <div className="bg-gradient-to-r from-[#003580] via-[#0284C7] to-amber-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${hotel.partnership_status === "غير نشط" ? "bg-slate-400" : "bg-emerald-400 animate-ping"}`} />
              <span>{isAr ? `حالة الشراكة: ${hotel.partnership_status === "غير نشط" ? "غير نشط" : "نشط"}` : `Partnership: ${hotel.partnership_status === "غير نشط" ? "Inactive" : "Active"}`}</span>
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
              title={isAr ? "مشاركة الفندق" : "Share"}
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

          {/* ── 1. CINEMATIC SLIDESHOW STAGE (Compact & Crisp) ── */}
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
              alt={hotel.name}
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
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>📍 {hotel.address || hotel.city}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">{"★".repeat(hotel.stars)}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">✓ {hotel.partnership_status}</span>
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
              <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#003580] text-white flex items-center justify-center text-base shrink-0 shadow-sm">
                  ⏱️
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                    {isAr ? "ساعات العمل والاستقبال:" : "Front Desk Hours:"}
                  </div>
                  <div className="text-xs font-black text-[#003580] dark:text-blue-300">
                    {isAr ? "خدمة 24/7 على مدار الساعة" : "24/7 Round the Clock"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {isAr ? "استقبال وخدمة مستمرة" : "Always open"}
                  </div>
                </div>
              </div>

              {/* Check-in / Check-out */}
              <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/60 border border-amber-100 dark:border-slate-700 flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shrink-0 shadow-sm">
                  🛎️
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-500 dark:text-slate-400">
                    {isAr ? "تسجيل الوصول والمغادرة:" : "Check-in / Out:"}
                  </div>
                  <div className="text-xs font-black text-amber-700 dark:text-amber-300">
                    {isAr ? "وصول 14:00 · مغادرة 12:00" : "In: 14:00 · Out: 12:00"}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {isAr ? "مرونة بالتنسيق المباشر" : "Flexible timing"}
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
                    {hotel.city}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold truncate">
                    {hotel.address || hotel.city}
                  </div>
                </div>
              </div>
            </div>

            {/* Concise Bio ("نبده بسيطه قلصاها") */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="text-xs font-black text-[#003580] dark:text-blue-300 flex items-center gap-1.5">
                <span>🏨</span>
                <span>{isAr ? "نبذة تعريفية سريعة:" : "Quick Overview:"}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {hotel.description
                  ? hotel.description.slice(0, 160) + (hotel.description.length > 160 ? "..." : "")
                  : isAr
                  ? `أحد أبرز مرافق الإقامة والضيافة في ${hotel.city}، يقدم غرفاً مجهزة ومرافق متكاملة مع خصم 15% لرواد منصة دلّني.`
                  : `Premier hospitality venue in ${hotel.city} offering modern rooms and verified contacts.`}
              </p>
            </div>

            {/* Quick Amenities Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: isAr ? "استقبال 24 ساعة" : "24/7 Front Desk", icon: "🛎️" },
                { label: isAr ? "واي فاي فايبر مجاني" : "Free WiFi", icon: "📶" },
                { label: isAr ? "تكييف مركزي هادئ" : "Climate Control", icon: "❄️" },
                { label: isAr ? "موقف سيارات محروس" : "Secure Parking", icon: "🅿️" },
                { label: isAr ? "خدمة غرف ونظافة" : "Daily Housekeeping", icon: "✨" },
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

          {/* ── 3. BOTTOM ACTION BAR (Direct Hotel Contact - Links Icon Removed) ── */}
          <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 p-3 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl z-30">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-200 dark:border-slate-700 flex items-center justify-center text-base shrink-0">
                🏨
              </div>
              <div>
                <div className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isAr ? "دليل سياحي تعريفي (عرض فقط)" : "Tourism Directory Showcase"}</span>
                  <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[9px] font-black">
                    {isAr ? "استعلام مباشر" : "Direct"}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold">
                  {isAr ? "تواصل مباشرة مع إدارة الفندق دون عمولة" : "Contact hotel directly"}
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons (Link icon removed as requested: وحول ايقونه الرابط يلي في الاسفل) */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${hotel.phone}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-blue-900/20 active:scale-95 cursor-pointer"
              >
                <span>📞</span>
                <span>{isAr ? `اتصال (${hotel.phone})` : `Call ${hotel.phone}`}</span>
              </a>

              <a
                href={`https://wa.me/218${hotel.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                  `مرحباً، أود الاستفسار والتواصل المباشر مع إدارة ${hotel.name} بعد الاطلاع عليه عبر منصة دلّني السياحية.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <span>💬</span>
                <span>{isAr ? "واتساب الفندق" : "WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. FULL-SCREEN LIGHTBOX MODAL ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <h3 className="font-black text-base sm:text-lg">{hotel.name}</h3>
              <p className="text-xs text-slate-400 font-medium">
                {photoCaptions[activePhoto % photoCaptions.length]?.title} ({activePhoto + 1} / {photos.length})
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
          <div className="relative max-w-5xl mx-auto w-full my-auto flex items-center justify-center max-h-[72vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[activePhoto]}
              alt={hotel.name}
              className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
            {/* Prev/Next arrows */}
            <button
              type="button"
              onClick={() => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length)}
              className="absolute left-3 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-2xl flex items-center justify-center font-black text-xl transition-all cursor-pointer"
            >
              {dir === "rtl" ? "→" : "←"}
            </button>
            <button
              type="button"
              onClick={() => setActivePhoto((prev) => (prev + 1) % photos.length)}
              className="absolute right-3 w-12 h-12 rounded-full bg-black/70 hover:bg-black text-white border border-white/20 shadow-2xl flex items-center justify-center font-black text-xl transition-all cursor-pointer"
            >
              {dir === "rtl" ? "←" : "→"}
            </button>
          </div>

          {/* Bottom Thumbnail Strip */}
          <div className="max-w-xl mx-auto w-full flex items-center justify-center gap-2 overflow-x-auto py-2" onClick={(e) => e.stopPropagation()}>
            {photos.map((p, idx) => (
              <div
                key={idx}
                onClick={() => setActivePhoto(idx)}
                className={`w-16 h-12 rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                  activePhoto === idx ? "border-amber-400 scale-110 shadow-lg" : "border-white/20 opacity-60 hover:opacity-100"
                }`}
              >
                <img src={p} alt="" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
