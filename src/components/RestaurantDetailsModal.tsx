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
  signatureDishes: string[];
  features: string[];
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
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "features" | "location" | "reviews">("overview");
  const [isLiked, setIsLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);

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
      setActiveTab("overview");
      setIsLiked(false);
      setAutoPlay(true);
    }
  }, [open, restaurant]);

  // Slideshow timer
  useEffect(() => {
    if (!open || !autoPlay || lightboxOpen || photos.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [open, autoPlay, lightboxOpen, photos.length]);

  // Keyboard navigation
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

  const photoCaptions = [
    { title: isAr ? "الجلسات والأجواء العامة" : "Ambiance & Seating", icon: "✨" },
    { title: isAr ? "الأطباق والولائم المميزة" : "Signature Dishes", icon: "🍽️" },
    { title: isAr ? "المشروبات والحلويات التراثية" : "Beverages & Desserts", icon: "☕" },
    { title: isAr ? "الموقع والواجهة الخارجية" : "Exterior & Venue", icon: "🏛️" },
  ];

  // Extended signature dishes with descriptions
  const detailedDishes = (restaurant.signatureDishes && restaurant.signatureDishes.length > 0
    ? restaurant.signatureDishes
    : [
        isAr ? "كسكسي بالبصلة ولحم الخروف الوطني" : "Traditional Lamb Couscous",
        isAr ? "شربة ليبية أصيلة مع خبز الفرن" : "Traditional Libyan Soup",
        isAr ? "مبطن طرابلسي وبوريك بالجبن" : "Crispy Mbatten & Burek",
        isAr ? "شاي رغوي باللوز المحمص" : "Frothy Almond Tea",
      ]
  ).map((title, idx) => ({
    id: `dish-${idx}`,
    name: title,
    badge: idx === 0 ? (isAr ? "الأكثر طلباً" : "Chef's Choice") : (isAr ? "طبق مميز" : "Signature"),
    desc: isAr
      ? "مُعد يومياً بمكونات طازجة محلية 100% وفق وصفات المطبخ الليبي التقليدي المتوارث."
      : "Prepared fresh daily with premium local ingredients.",
    price: idx === 0 ? "45 - 65 د.ل" : idx === 1 ? "18 - 25 د.ل" : idx === 2 ? "22 - 30 د.ل" : "10 - 15 د.ل",
  }));

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: restaurant.name,
        text: `${restaurant.name} في ${restaurant.city} على منصة دلّني`,
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
      {/* ── BACKDROP OVERLAY ── */}
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all duration-300 animate-in fade-in"
        dir={dir}
        onClick={onClose}
      >
        {/* ── MODAL CONTAINER ── */}
        <div
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden z-10 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Banner */}
          <div className="bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-amber-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>🍽️ {isAr ? "مطعم ومقهى سياحي معتمد لدى منصة دلّني" : "Verified Tourism Dining Partner"}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-3 py-0.5 rounded-full text-[11px] font-bold">
              <span>☕ {isAr ? "ضيافة شاي باللوز مجاناً لرواد دلّني" : "Free Mint/Almond Tea Perk"}</span>
            </div>
          </div>

          {/* Floating Action Controls */}
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

          {/* ── 1. CINEMATIC SLIDESHOW STAGE WITH FIXED STABLE SIZE & CRISP CLARITY ── */}
          <div
            className="relative h-80 sm:h-96 md:h-[420px] w-full bg-slate-950 overflow-hidden group select-none shrink-0"
            onMouseEnter={() => setAutoPlay(false)}
            onMouseLeave={() => setAutoPlay(true)}
          >
            {/* Ambient Blurred Background for perfect lighting and zero distortion */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <img
                src={photos[activePhoto]}
                alt=""
                className="w-full h-full object-cover blur-2xl opacity-40 scale-110 transition-all duration-700"
                aria-hidden="true"
              />
            </div>

            {/* Main Stage Image (Fixed, perfectly proportioned, crisp object-cover) */}
            <img
              src={photos[activePhoto]}
              alt={restaurant.name}
              className="relative z-10 w-full h-full object-cover object-center transition-all duration-500 ease-out transform scale-100 group-hover:scale-105 cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-black/40 pointer-events-none z-10" />

            {/* Slideshow Arrows */}
            <button
              type="button"
              onClick={() => setActivePhoto((prev) => (prev - 1 + photos.length) % photos.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center font-black text-xl transition hover:scale-110 opacity-80 group-hover:opacity-100 shadow-xl border border-white/20 cursor-pointer"
            >
              {dir === "rtl" ? "→" : "←"}
            </button>
            <button
              type="button"
              onClick={() => setActivePhoto((prev) => (prev + 1) % photos.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md flex items-center justify-center font-black text-xl transition hover:scale-110 opacity-80 group-hover:opacity-100 shadow-xl border border-white/20 cursor-pointer"
            >
              {dir === "rtl" ? "←" : "→"}
            </button>

            {/* Photo Caption & Identity */}
            <div className="absolute bottom-14 sm:bottom-16 right-4 left-4 z-20 flex flex-wrap items-end justify-between gap-3 text-white pointer-events-none">
              <div className="space-y-1 pointer-events-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-amber-300">
                  <span>{photoCaptions[activePhoto % photoCaptions.length]?.icon}</span>
                  <span>{photoCaptions[activePhoto % photoCaptions.length]?.title}</span>
                </div>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white drop-shadow-md">
                  {restaurant.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <span>📍 {restaurant.city}</span>
                  <span>·</span>
                  <span className="text-amber-400 font-bold">★ {restaurant.rating}</span>
                  <span>·</span>
                  <span className="text-emerald-400 font-bold">{restaurant.type}</span>
                </div>
              </div>

              {/* Lightbox Zoom Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-black text-white flex items-center gap-1.5 transition hover:scale-105 cursor-pointer shadow-lg"
                >
                  <span>🔍 {isAr ? "معاينة الصور" : "Zoom"}</span>
                  <span className="bg-[#D96B27] px-2 py-0.5 rounded-full text-[10px]">
                    {activePhoto + 1} / {photos.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Visual Thumbnail Navigation Strip (Fixed Stable Thumbnails) */}
            <div className="absolute bottom-2 right-0 left-0 z-20 flex justify-center gap-2 px-4 overflow-x-auto py-1 pointer-events-auto">
              {photos.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActivePhoto(idx)}
                  className={`w-14 h-9 sm:w-16 sm:h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shadow-md shrink-0 ${
                    activePhoto === idx ? "border-amber-400 scale-105 ring-2 ring-amber-400/50" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* ── 2. DYNAMIC TABBED NAVIGATION ── */}
          {/* ── 2. DYNAMIC TABBED NAVIGATION ── */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs sm:text-sm font-black">
              {[
                { id: "overview", label: isAr ? "🍽️ نوع الطعام وتجربة التذوق" : "Cuisine & Dining", icon: "🍽️" },
                { id: "location", label: isAr ? "📍 الموقع وساعات العمل" : "Location & Hours", icon: "📍" },
                { id: "reviews", label: isAr ? "⭐ تقييمات الذواقة" : "Reviews", icon: "⭐" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-5 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-[#D96B27] text-white shadow-md shadow-orange-900/20 scale-102"
                        : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/60 hover:text-slate-900"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 3. TAB CONTENT ── */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 flex-1">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Informational Directory Notice */}
                <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200 font-bold">
                  <span className="text-xl shrink-0">ℹ️</span>
                  <span>
                    {isAr
                      ? "دليل تعريفي استكشافي: توفر منصة دلّني هذا العرض لتعريف الزوار بنوع الطعام وأوقات العمل ووسائل الاتصال المباشر بالمطعم."
                      : "Directory Showcase: Dallani provides this guide to introduce visitors to cuisine types, hours, and direct venue contacts."}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rating Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-800 dark:to-slate-800/60 border border-orange-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{isAr ? "تقييم الذواقة" : "Rating"}</div>
                      <div className="text-xl font-black text-[#D96B27]">{restaurant.ratingWord}</div>
                      <div className="text-xs text-slate-500 font-semibold">{restaurant.reviewsCount} {isAr ? "تقييم موثق" : "reviews"}</div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#D96B27] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-orange-900/30">
                      {restaurant.rating}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{isAr ? "متوسط التكلفة للوجبة" : "Average Price"}</div>
                      <div className="text-lg font-black text-[#003580] dark:text-blue-400">{restaurant.priceRange}</div>
                      <div className="text-xs text-slate-500 font-semibold">{isAr ? "وجبة متكاملة للشخص" : "Full Meal / Person"}</div>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>

                  {/* Hours */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-800 dark:text-emerald-400 font-black">{isAr ? "أوقات العمل اليومية" : "Opening Hours"}</div>
                      <div className="text-base font-black text-emerald-700 dark:text-emerald-300">{restaurant.hours}</div>
                      <div className="text-[11px] text-slate-500 font-bold">{isAr ? "مفتوح طوال أيام الأسبوع" : "Open 7 Days a Week"}</div>
                    </div>
                    <div className="text-3xl">⏱️</div>
                  </div>
                </div>

                {/* 🍲 PROMINENT CUISINE & FOOD TYPE SECTION */}
                <div className="space-y-4 p-5 rounded-2xl bg-gradient-to-br from-orange-50/50 via-white to-amber-50/30 dark:from-slate-800/60 dark:to-slate-800/30 border border-orange-200/70 dark:border-slate-700">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-100 dark:border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🍲</span>
                      <div>
                        <h4 className="text-base font-black text-[#D96B27]">
                          {isAr ? "نوع وتصنيف الطعام المقدم" : "Cuisine Type & Specialty"}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {isAr ? "طبيعة المأكولات وأسلوب الضيافة المقدم في هذا المطعم" : "Style of food and hospitality offered"}
                        </p>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-xl bg-[#D96B27] text-white text-xs font-black shadow-xs">
                      {restaurant.type || (isAr ? "مأكولات شعبية وتراثية" : "Traditional Dining")}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-100 dark:bg-slate-700 text-[#D96B27] flex items-center justify-center font-black text-lg shrink-0">
                        🥘
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? "تخصص المطعم والمذاق الفريد:" : "Primary Specialty:"}
                        </div>
                        <div className="text-xs text-[#D96B27] font-black mt-0.5">
                          {restaurant.specialty}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-slate-700 text-emerald-700 flex items-center justify-center font-black text-lg shrink-0">
                        🌿
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? "طازجة ومحلية:" : "Fresh & Local:"}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                          {isAr ? "لحوم بلدية طازجة ومكونات ليبية مختارة يومياً" : "Fresh daily local ingredients and meats"}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-slate-700 text-[#003580] flex items-center justify-center font-black text-lg shrink-0">
                        👨‍👩‍👧
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? "أجواء الجلسات:" : "Atmosphere:"}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                          {isAr ? "جلسات عائلية مريحة مع خصوصية وتكييف هادئ" : "Comfortable family seating with privacy"}
                        </div>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-slate-700 text-amber-700 flex items-center justify-center font-black text-lg shrink-0">
                        ☕
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {isAr ? "الضيافة والمشروبات:" : "Hospitality & Drinks:"}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 font-bold mt-0.5">
                          {isAr ? "شاي ليبي تراثي باللوز وقهوة ومشروبات منعشة" : "Libyan almond tea, coffee & fresh drinks"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Culinary Story */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <h4 className="text-base font-black text-[#D96B27] flex items-center gap-2">
                    <span>📖</span>
                    <span>{isAr ? "عن المطعم وتجربة التذوق" : "Culinary Heritage & Dining Experience"}</span>
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    {isAr
                      ? `يقدم ${restaurant.name} تجربة طعام استثنائية في قلب ${restaurant.city}. يشتهر بـ (${restaurant.specialty}) مع التزام صارم بأعلى معايير الجودة والنظافة وكرم الضيافة الليبية. يتميز المطعم بجلسات مريحة وتصميم يجمع بين الأصالة والحداثة، مما يجعله وجهة مثالية للعائلات والوفود السياحية وزوار المدينة.`
                      : `${restaurant.name} provides an exceptional Libyan dining experience in ${restaurant.city}, renowned for ${restaurant.specialty}.`}
                  </p>
                </div>
              </div>
            )}

            {/* LOCATION TAB */}
            {activeTab === "location" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-900 via-slate-900 to-slate-950 text-white border border-white/10 relative overflow-hidden shadow-xl space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-black">
                        <span>📍</span>
                        <span>{restaurant.city}</span>
                      </div>
                      <h5 className="text-xl font-black">{restaurant.name}</h5>
                      <p className="text-xs text-slate-300 font-medium">{restaurant.address}</p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        restaurant.mapsQuery || `${restaurant.name} ${restaurant.city} ليبيا`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer shrink-0"
                    >
                      <span>🗺️ {isAr ? "فتح المسار في خرائط Google" : "Open in Google Maps"}</span>
                      <span>↗</span>
                    </a>
                  </div>

                  <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-amber-400 font-black">⏱️ {isAr ? "ساعات الدوام:" : "Working Hours:"}</span>
                      <p className="text-slate-300">{restaurant.hours}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-emerald-400 font-black">📞 {isAr ? "هاتف الحجز المباشر:" : "Phone:"}</span>
                      <p className="text-slate-300">{restaurant.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-orange-50/70 dark:bg-slate-800/50 border border-orange-100 dark:border-slate-700">
                  <div className="w-16 h-16 rounded-2xl bg-[#D96B27] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-orange-900/30">
                    {restaurant.rating}
                  </div>
                  <div>
                    <div className="text-lg font-black text-[#D96B27]">{restaurant.ratingWord}</div>
                    <div className="text-xs text-slate-500">
                      {isAr ? `استناداً إلى ${restaurant.reviewsCount} تقييم حقيقي من رواد دلّني` : `Based on ${restaurant.reviewsCount} verified reviews`}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      name: isAr ? "صلاح الورفلي" : "Salah W.",
                      date: isAr ? "قبل يومين" : "2 days ago",
                      rate: 5,
                      comment: isAr ? "الأكل لذيذ جداً والخدمة سريعة ونظيفة، طعم الكسكسي بالبصلة أصيل والشاي باللوز كان ضيافة ممتازة." : "Delicious Libyan traditional meals and great hospitality.",
                    },
                    {
                      name: isAr ? "فاطمة الترهوني" : "Fatima T.",
                      date: isAr ? "قبل 5 أيام" : "5 days ago",
                      rate: 5,
                      comment: isAr ? "مكان عائلي مريح وهادئ، الأسعار مناسبة جداً والأجواء رائعة. نكرر الزيارة بالتأكيد." : "Very cozy and family friendly!",
                    },
                  ].map((rev, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-slate-800 dark:text-slate-100">{rev.name}</span>
                        <span className="text-amber-400 text-xs">{"★".repeat(rev.rate)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">"{rev.comment}"</p>
                      <div className="text-[10px] text-slate-400">{rev.date}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── 4. STICKY BOTTOM LUXURY CONCIERGE BAR ── */}
          {/* ── 4. STICKY BOTTOM ACTION BAR (Directory Showcase & Direct Venue Contact) ── */}
          <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl z-30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 flex items-center justify-center text-xl shrink-0">
                🍽️
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isAr ? "دليل سياحي تعريفي بالأماكن (عرض فقط)" : "Tourism Directory Showcase (Display Only)"}</span>
                  <span className="px-2 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px] font-black">
                    {isAr ? "استعلام مباشر" : "Direct Contact"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-bold">
                  {isAr ? "المنصة تقدم دليلاً للتعريف بالمنشأة — يمكنك التواصل مباشرة عبر الهاتف والواتساب" : "Contact the venue management directly for inquiries"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${restaurant.phone}`}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-90 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20 active:scale-95 cursor-pointer"
              >
                <span>📞</span>
                <span>{isAr ? `اتصال (${restaurant.phone})` : `Call ${restaurant.phone}`}</span>
              </a>

              <a
                href={`https://wa.me/218${restaurant.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                  `مرحباً، أود الاستفسار عن نوع الطعام وساعات العمل لدى ${restaurant.name} بعد الاطلاع عليه عبر منصة دلّني السياحية.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <span>💬</span>
                <span>{isAr ? "واتساب المطعم" : "WhatsApp"}</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  restaurant.mapsQuery || `${restaurant.name} ${restaurant.city} ليبيا`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 cursor-pointer"
                title={isAr ? "فتح في الخرائط" : "Open in Maps"}
              >
                <span>📍</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. FULL-SCREEN LIGHTBOX ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-0.5">
              <h3 className="font-black text-base sm:text-lg">{restaurant.name}</h3>
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

          <div className="relative max-w-5xl mx-auto w-full my-auto flex items-center justify-center max-h-[72vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={photos[activePhoto]}
              alt={restaurant.name}
              className="max-h-[72vh] max-w-full rounded-2xl object-contain shadow-2xl border border-white/20"
            />
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
