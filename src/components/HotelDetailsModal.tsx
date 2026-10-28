import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { FavoriteButton } from "@/components/FavoriteButton";

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
  working_hours?: string;
  contract_start_date?: string;
  contract_end_date?: string;
  whatsapp?: string;
  amenities?: string[];
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

  // High quality Libyan hotel images fallback
  const defaultPhotos = [
    "/assets/ai_hotel.jpg",
    "/assets/dest-tripoli-harbor.jpg",
    "/assets/dest-harbor-coast.jpg",
    "/assets/hotel_resort.jpg",
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

  // Slideshow auto-advance every 3.5s
  useEffect(() => {
    if (!open || !autoPlay || lightboxOpen || photos.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }, 3500);
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

  const discountPct = hotel.discountPct || 15;
  const whatsappNumber = (hotel.whatsapp || hotel.phone || "0912345678").replace(/\D/g, "");

  const photoCaptions = [
    { title: isAr ? "الإطلالة البانورامية والواجهة الفندقية" : "Main Façade & Panoramic View", icon: "🏛️" },
    { title: isAr ? "الأجنحة والغرف الفندقية الفاخرة" : "Luxury Suites & Rooms", icon: "🛏️" },
    { title: isAr ? "بهو الاستقبال والاستراحة الرئيسية" : "Lobby & Reception Lounge", icon: "✨" },
    { title: isAr ? "المطعم وخدمات الضيافة المتميزة" : "Dining & Gourmet Services", icon: "🍽️" },
    { title: isAr ? "المرافق والخدمات الترفيهية" : "Leisure & Wellness Amenities", icon: "🏊‍♂️" },
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
      {/* ── BACKDROP OVERLAY WITH LUXURY BLUR ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md transition-all duration-300 animate-in fade-in"
        dir={dir}
        onClick={onClose}
      >
        {/* ── MODAL CONTAINER WITH DELNI IDENTITY ── */}
        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-3xl w-full z-10 border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Brand & Partnership Strip (Matching Delni Petrol & Amber identity) */}
          <div className="bg-gradient-to-r from-[#1B5A78] via-[#144258] to-[#D97706] text-white px-5 py-2.5 text-xs font-bold flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${hotel.partnership_status === "غير نشط" ? "bg-slate-400" : "bg-emerald-400 ring-4 ring-emerald-400/20 animate-pulse"}`} />
              <span className="font-black">
                {isAr ? `شراكة دلّني: ${hotel.partnership_status || "شريك معتمد"}` : `Delni Partner: ${hotel.partnership_status || "Verified"}`}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-black border border-white/20">
              <span>⭐ {isAr ? `خصم حصري ${discountPct}% لرواد دلّني` : `Exclusive ${discountPct}% Perk`}</span>
            </div>
          </div>

          {/* Floating Actions (Share, Like, Close) */}
          <div className="absolute top-14 left-4 z-30 flex items-center gap-2">
            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-700 dark:text-slate-200 shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer border border-slate-200 dark:border-slate-700"
              title={isAr ? "مشاركة الفندق" : "Share"}
            >
              <span>{copiedLink ? "✓" : "🔗"}</span>
            </button>
            <FavoriteButton
              itemType="hotel"
              itemId={hotel.id}
              itemTitle={hotel.name}
              size="md"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-10 h-10 rounded-full bg-white/90 dark:bg-slate-800/90 hover:bg-rose-50 hover:text-rose-600 text-slate-700 dark:text-slate-200 shadow-md flex items-center justify-center transition hover:scale-105 active:scale-95 font-black text-lg cursor-pointer border border-slate-200 dark:border-slate-700"
            >
              ✕
            </button>
          </div>

          {/* ── 1. CINEMATIC SLIDESHOW STAGE ── */}
          <div
            className="relative h-60 sm:h-72 w-full bg-slate-950 overflow-hidden group select-none shrink-0"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            {/* Ambient Blurred Aura */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={photos[activePhoto]}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-35 scale-110 transition-all duration-700"
                aria-hidden="true"
              />
            </div>

            {/* Main Stage Image */}
            <img
              src={photos[activePhoto]}
              alt={hotel.name}
              className="relative z-10 w-full h-full object-cover object-center transition-all duration-700 ease-out transform scale-100 group-hover:scale-105 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Cinematic Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-black/30 pointer-events-none z-10" />

            {/* Photo Caption & Hotel Identity */}
            <div className="absolute bottom-4 right-5 left-5 z-20 flex flex-wrap items-end justify-between gap-3 text-white pointer-events-none">
              <div className="space-y-1.5 pointer-events-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-amber-400/30 text-xs font-bold text-amber-300">
                  <span>{photoCaptions[activePhoto % photoCaptions.length]?.icon}</span>
                  <span>{photoCaptions[activePhoto % photoCaptions.length]?.title}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                  {hotel.name}
                </h3>
                <div className="flex items-center gap-2.5 text-xs text-slate-200 font-semibold">
                  <span>📍 {hotel.address || hotel.city}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-black tracking-widest">
                    {"★".repeat(Math.min(5, Math.max(1, hotel.stars || 4)))}
                  </span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">✓ {hotel.partnership_status || "موثق"}</span>
                </div>
              </div>

              {/* Lightbox Zoom Button & Auto-slideshow indicator dots */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-full border border-white/20">
                  {photos.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActivePhoto(idx)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        activePhoto === idx ? "w-5 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-3 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-black text-white flex items-center gap-1.5 transition hover:scale-105 cursor-pointer shadow-lg"
                >
                  <span>🔍 {isAr ? "تكبير" : "Zoom"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── 2. ELEGANT OVERVIEW & HOURS (Aligned with Delni Theme) ── */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Hours & Check-in Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Working Hours */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#1B5A78]/5 to-[#1B5A78]/15 dark:from-slate-800 dark:to-slate-800/60 border border-[#1B5A78]/20 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B5A78] text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                  ⏱️
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {isAr ? "ساعات العمل والاستقبال:" : "Front Desk Hours:"}
                  </div>
                  <div className="text-xs font-black text-[#1B5A78] dark:text-sky-300">
                    {hotel.working_hours || (isAr ? "خدمة 24/7 على مدار الساعة" : "24/7 Round the Clock")}
                  </div>
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {isAr ? "استقبال وخدمة مستمرة" : "Always open"}
                  </div>
                </div>
              </div>

              {/* Check-in / Check-out */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/5 to-amber-500/15 dark:from-slate-800 dark:to-slate-800/60 border border-amber-500/20 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#D97706] text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                  🛎️
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
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
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-emerald-500/15 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-500/20 dark:border-slate-700 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0 shadow-sm">
                  📍
                </div>
                <div className="truncate">
                  <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400">
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

            {/* Bio / Description */}
            {hotel.description && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="text-xs font-black text-[#1B5A78] dark:text-sky-300 flex items-center gap-2">
                  <span>🏨</span>
                  <span>{isAr ? "نبذة تعريفية:" : "Overview:"}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {hotel.description}
                </p>
              </div>
            )}

            {/* Real Hotel Amenities Pills from Database (1NF) */}
            {Array.isArray(hotel.amenities) && hotel.amenities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {hotel.amenities.map((am, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                  >
                    <span>✨</span>
                    <span>{am}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ── 3. BOTTOM CONTACT & ACTION BAR ── */}
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-inner z-30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-9 h-9 rounded-xl bg-[#1B5A78]/10 text-[#1B5A78] dark:text-sky-300 flex items-center justify-center text-lg shrink-0 border border-[#1B5A78]/20">
                🏨
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isAr ? "دليل سياحي تعريفي (تواصل مباشر)" : "Direct Tourism Showcase"}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                    {isAr ? "معتمد" : "Verified"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {isAr ? "تواصل مباشرة مع إدارة الفندق للاستعلام والحجز" : "Inquire directly with hotel management"}
                </div>
              </div>
            </div>

            {/* Direct Phone & WhatsApp buttons */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <a
                href={`tel:${hotel.phone}`}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-[#1B5A78] hover:bg-[#144258] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-[#1B5A78]/20 active:scale-95 cursor-pointer"
              >
                <span>📞</span>
                <span>{isAr ? `اتصال (${hotel.phone})` : `Call ${hotel.phone}`}</span>
              </a>

              <a
                href={`https://wa.me/218${whatsappNumber.replace(/^0+/, "")}?text=${encodeURIComponent(
                  `مرحباً، أود الاستفسار والتواصل المباشر مع إدارة ${hotel.name} بعد الاطلاع عليه عبر منصة دلّني السياحية.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <span>💬</span>
                <span>{isAr ? "واتساب الفندق" : "WhatsApp"}</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FULL-SCREEN LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[150] bg-slate-950/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <h3 className="font-black text-lg sm:text-xl">{hotel.name}</h3>
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
            {/* Prev/Next */}
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

          {/* Bottom Thumbnails */}
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
