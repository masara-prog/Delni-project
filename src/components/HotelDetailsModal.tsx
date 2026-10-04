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
  const [activeTab, setActiveTab] = useState<"overview" | "rooms" | "amenities" | "location" | "reviews">("overview");
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
      setActiveTab("overview");
      setIsLiked(false);
      setAutoPlay(true);
    }
  }, [open, hotel]);

  // Slideshow auto-advance every 4.5s if not paused
  useEffect(() => {
    if (!open || !autoPlay || lightboxOpen || photos.length <= 1) return;
    const timer = setInterval(() => {
      setActivePhoto((prev) => (prev + 1) % photos.length);
    }, 4500);
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

  const ratingScore = hotel.rating || (hotel.stars === 5 ? 9.2 : hotel.stars === 4 ? 8.6 : 7.8);
  const ratingWord = hotel.ratingWord || (ratingScore >= 9 ? (isAr ? "استثنائي" : "Superb") : ratingScore >= 8.5 ? (isAr ? "ممتاز" : "Excellent") : (isAr ? "جيد جداً" : "Good"));
  const reviewsCount = hotel.reviewsCount || 540;
  const currentPrice = hotel.price || (hotel.stars === 5 ? 450 : hotel.stars === 4 ? 280 : 180);
  const originalPrice = hotel.originalPrice || Math.round(currentPrice * 1.25);
  const discountPct = hotel.discountPct || 20;

  const photoCaptions = [
    { title: isAr ? "الإطلالة البانورامية والواجهة الرئيسية" : "Main Façade & Panoramic View", icon: "🏛️" },
    { title: isAr ? "الأجنحة والغرف الفاخرة المطلة" : "Luxury Sea/Mountain Suites", icon: "🛏️" },
    { title: isAr ? "صالة الاستقبال والبهو الأندلسي" : "Lobby & Reception", icon: "✨" },
    { title: isAr ? "مطعم الفندق وبوفيه الإفطار" : "Fine Dining & Breakfast", icon: "🍽️" },
    { title: isAr ? "المرافق والاستجمام وحمام السباحة" : "Wellness & Leisure Facilities", icon: "🏊‍♂️" },
  ];

  const roomsList = [
    {
      id: "rm-1",
      name: isAr ? "غرفة ديلوكس كينغ مع إطلالة بحرية" : "Deluxe King Room with Sea View",
      badge: isAr ? "الأكثر طلباً" : "Most Popular",
      bed: isAr ? "1 سرير مزدوج كبير جداً (King Size)" : "1 extra-large double bed",
      specs: isAr ? "تكييف هواء ذكي · حمام رخامي خاص · واي فاي فايبر · شاشة ذكية 55 بوصة" : "Smart AC · Marble Bath · Fiber WiFi · 55' 4K TV",
      perk: isAr ? "شامل بوفيه إفطار فاخر لشخصين" : "Buffet breakfast included for 2",
      capacity: isAr ? "شخصين بالغين + طفل" : "2 Adults + 1 Child",
      price: currentPrice,
      originalPrice: originalPrice,
      availableCount: 3,
    },
    {
      id: "rm-2",
      name: isAr ? "جناح السفير الملكي الفسيح" : "Ambassador Royal Suite",
      badge: isAr ? "VIP حصري" : "VIP Exclusive",
      bed: isAr ? "غرفة نوم ماستر + صالة معيشة مستقلة" : "Master bedroom + separate lounge",
      specs: isAr ? "شرفة بانورامية خاصة · جاكوزي · آلة قهوة Nespresso · خدمة غسيل سريعة" : "Private balcony · Jacuzzi · Nespresso · Valet laundry",
      perk: isAr ? "إفطار + عشاء فاخر مجاناً لرواد دلّني" : "Free Breakfast & Dinner for Dallani",
      capacity: isAr ? "4 أفراد" : "Up to 4 Guests",
      price: Math.round(currentPrice * 1.55),
      originalPrice: Math.round(originalPrice * 1.55),
      availableCount: 1,
    },
    {
      id: "rm-3",
      name: isAr ? "غرفة أعمال فاخرة مفردة" : "Executive Business Single Room",
      badge: isAr ? "رجال أعمال" : "Business",
      bed: isAr ? "1 سرير مفرد كوين مريح" : "1 Queen single bed",
      specs: isAr ? "مكتب عمل تنفيذي · عزل صوتي كامل · ميني بار مجاني · خزنة رقمية" : "Work desk · Acoustic soundproofing · Free minibar · Safe",
      perk: isAr ? "إلغاء مجاني حتى 24 ساعة قبل الوصول" : "Free cancellation up to 24h",
      capacity: isAr ? "شخص واحد" : "1 Adult",
      price: Math.round(currentPrice * 0.72),
      originalPrice: Math.round(originalPrice * 0.72),
      availableCount: 4,
    },
  ];

  const amenities = [
    { icon: "📶", title: isAr ? "واي فاي ألياف بصرية مجاني" : "High-Speed Fiber WiFi", desc: isAr ? "تغطية كاملة وسريعة في الغرف وكافة المرافق" : "High-speed coverage everywhere" },
    { icon: "🏊‍♂️", title: isAr ? "مسبح ونادٍ صحي متكامل" : "Pool & Health Spa", desc: isAr ? "مسبح بإطلالة ساحرة مع ساونا وجاكوزي" : "Scenic pool with sauna & jacuzzi" },
    { icon: "🍽️", title: isAr ? "مطعم وبوفيه إفطار عالمي" : "Fine Dining Restaurant", desc: isAr ? "أشهى المأكولات الليبية والعالمية الطازجة" : "Libyan & Mediterranean delicacies" },
    { icon: "🅿️", title: isAr ? "مواقف سيارات خاصة ومحروسة" : "Free Secure Parking", desc: isAr ? "مواقف مجانية 24/7 مراقبة بالكاميرات" : "24/7 CCTV surveillance parking" },
    { icon: "❄️", title: isAr ? "تكييف هواء رقمي هادئ" : "Silent Smart AC", desc: isAr ? "تحكم بدرجات الحرارة لراحة فائقة" : "Personalized smart climate control" },
    { icon: "🛎️", title: isAr ? "خدمة غرف وكونسيرج 24/7" : "24/7 VIP Concierge", desc: isAr ? "فريق ضيافة متفانٍ لخدمتك على مدار الساعة" : "Round-the-clock room service" },
    { icon: "☕", title: isAr ? "مقهى وتراس بانورامي" : "Panoramic Café Lounge", desc: isAr ? "جلسات خارجية هادئة مع قهوة مختصة وشاي باللوز" : "Specialty coffee & sunset views" },
    { icon: "🛡️", title: isAr ? "أمان وحراسة مشددة" : "Top Tier Safety & Security", desc: isAr ? "أنظمة أمان حديثة وبوابات إلكترونية" : "Electronic keycards & certified safety" },
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
          className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[92vh] overflow-y-auto overflow-x-hidden z-10 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 flex flex-col my-auto transition-transform duration-300 scale-100 animate-in zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Top Decorative Perk Strip */}
          <div className="bg-gradient-to-r from-[#003580] via-[#0284C7] to-amber-600 text-white px-4 py-2 text-xs font-black flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>👑 {isAr ? "منشأة سياحية معتمدة رسميّاً لدى منصة دلّني" : "Verified Official Partner Stay on Dallani"}</span>
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
              alt={hotel.name}
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

              {/* Lightbox Zoom Button */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-xs font-black text-white flex items-center gap-1.5 transition hover:scale-105 cursor-pointer shadow-lg"
                >
                  <span>🔍 {isAr ? "تكبير الصور" : "Zoom"}</span>
                  <span className="bg-[#003580] px-2 py-0.5 rounded-full text-[10px]">
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
          <div className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 sticky top-0 z-20 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar text-xs sm:text-sm font-black">
              {[
                { id: "overview", label: isAr ? "🌟 نبذة وتجربة الإقامة" : "Overview & Story", icon: "🌟" },
                { id: "rooms", label: isAr ? "🛏️ الغرف والأجنحة الفاخرة" : "Luxury Rooms & Suites", icon: "🛏️" },
                { id: "amenities", label: isAr ? "✨ المرافق والخدمات الحصرية" : "Amenities & Facilities", icon: "✨" },
                { id: "location", label: isAr ? "📍 الموقع وساعات العمل" : "Location & Map", icon: "📍" },
                { id: "reviews", label: isAr ? "⭐ تقييمات الضيوف والرواد" : "Guest Reviews", icon: "⭐" },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-2xl whitespace-nowrap transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                      isActive
                        ? "bg-[#003580] text-white shadow-md shadow-blue-900/20 scale-102"
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

          {/* ── 3. TAB CONTENT WITH DYNAMIC ANIMATIONS ── */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 flex-1">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Score & Highlights Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rating Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{isAr ? "تقييم النزلاء العام" : "Guest Rating"}</div>
                      <div className="text-xl font-black text-[#003580] dark:text-blue-400">{ratingWord}</div>
                      <div className="text-xs text-slate-500 font-semibold">{reviewsCount} {isAr ? "نزيل موثق" : "verified reviews"}</div>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[#003580] text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                      {ratingScore}
                    </div>
                  </div>

                  {/* Star Category */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-800 dark:to-slate-800/60 border border-amber-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-bold">{isAr ? "تصنيف النجوم الرسمي" : "Official Category"}</div>
                      <div className="text-lg font-black text-amber-700 dark:text-amber-400">
                        {hotel.stars} {isAr ? "نجوم معتمدة" : "Stars Luxury"}
                      </div>
                      <div className="text-xs text-slate-500 font-semibold">{isAr ? "وزارة السياحة الليبية" : "Libyan Tourism Dept"}</div>
                    </div>
                    <div className="text-3xl text-amber-500">{"★".repeat(hotel.stars)}</div>
                  </div>

                  {/* Dallani Pass Card */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/60 border border-emerald-100 dark:border-slate-700 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-emerald-800 dark:text-emerald-400 font-black flex items-center gap-1">
                        <span>👑</span>
                        <span>{isAr ? "ميزة دلّني المعتمدة" : "Dallani Guest Perk"}</span>
                      </div>
                      <div className="text-lg font-black text-emerald-700 dark:text-emerald-300">
                        {isAr ? `خصم ${discountPct}% فوري` : `Instant ${discountPct}% Off`}
                      </div>
                      <div className="text-[11px] text-slate-500 font-bold">{isAr ? "عند إبراز الحجز بالمنصة" : "Upon showing Dallani booking"}</div>
                    </div>
                    <div className="text-3xl">🏷️</div>
                  </div>
                </div>

                {/* About Bio */}
                <div className="space-y-3 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60">
                  <h4 className="text-base font-black text-[#003580] dark:text-blue-300 flex items-center gap-2">
                    <span>🏨</span>
                    <span>{isAr ? "حول مكان الإقامة وتجربة الضيافة" : "About Property & Hospitality Experience"}</span>
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
                    {hotel.description || (isAr
                      ? `يُعد ${hotel.name} أحد أرقى صروح الضيافة في مدينة ${hotel.city}، حيث يجمع بين راحة الإقامة الفندقية الحديثة وعبق الضيافة الليبية الأصيلة. يتميز الفندق بموقع استراتيجي محاط بأهم المعالم السياحية والخدمية، ويوفر غرفاً وأجنحة فسيحة بإطلالات بانورامية خلابة، وخدمات استقبال وإرشاد سياحي متكاملة لرواد منصة دلّني.`
                      : `${hotel.name} is one of the premier hospitality stays in ${hotel.city}, offering luxury accommodations and seamless connectivity to cultural attractions.`)}
                  </p>
                </div>

                {/* Highlights tags */}
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-500 uppercase tracking-wider">{isAr ? "أبرز مميزات الإقامة:" : "Key Highlights:"}</div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      isAr ? "✓ إطلالة ساحرة ومباشرة" : "Scenic Views",
                      isAr ? "✓ بوفيه إفطار محلي وعالمي فاخر" : "Luxury Buffet Breakfast",
                      isAr ? "✓ خدمة غرف واستقبال 24/7" : "24/7 Front Desk",
                      isAr ? "✓ إنترنت ألياف بصرية سريع ومجاني" : "Free Fiber WiFi",
                      isAr ? "✓ حراسة ومواقف خاصة مؤمنة" : "Secure Gated Parking",
                      isAr ? "✓ موقع قريب من المواصلات والمعالم" : "Prime Strategic Location",
                    ].map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs hover:border-[#003580] transition"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ROOMS TAB */}
            {activeTab === "rooms" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-base font-black text-slate-900 dark:text-white">
                      {isAr ? "خيارات الغرف والأجنحة المتاحة للإقامة" : "Available Rooms & Suites"}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {isAr ? "جميع الغرف مكيفة وشاملة للخدمة الفندقية ومطابقة لمعايير منصة دلّني" : "All rooms feature luxury amenities and daily housekeeping"}
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 px-3 py-1 rounded-full">
                    ✓ {isAr ? "أسعار خاصة لرواد دلّني" : "Dallani Verified Rates"}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {roomsList.map((room) => (
                    <div
                      key={room.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-[#003580] bg-white dark:bg-slate-800/70 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#003580]/10 text-[#003580] dark:text-blue-300 text-xs font-black">
                            {room.badge}
                          </span>
                          <h5 className="text-base font-black text-slate-900 dark:text-white group-hover:text-[#003580] transition">
                            {room.name}
                          </h5>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          <div className="flex items-center gap-2">
                            <span>🛏️</span>
                            <span className="font-bold">{room.bed}</span>
                            <span>·</span>
                            <span>👥</span>
                            <span>{room.capacity}</span>
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">{room.specs}</div>
                        </div>

                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 text-xs font-bold border border-emerald-200/60">
                          <span>✨</span>
                          <span>{room.perk}</span>
                        </div>
                      </div>

                      {/* Room Price & Direct Inquiry */}
                      <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-s md:border-slate-100 dark:md:border-slate-700 pt-3 md:pt-0 md:ps-6 shrink-0 gap-3">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400 line-through font-bold">
                            {room.originalPrice} د.ل / {isAr ? "ليلة" : "night"}
                          </div>
                          <div className="text-2xl font-black text-[#D96B27]">
                            {room.price} <span className="text-xs text-slate-500">د.ل / {isAr ? "ليلة" : "night"}</span>
                          </div>
                          <div className="text-[10px] text-emerald-600 font-bold">
                            {isAr ? `وفرت ${room.originalPrice - room.price} د.ل عبر دلّني` : `Save ${room.originalPrice - room.price} LYD`}
                          </div>
                        </div>

                        <a
                          href={`https://wa.me/218${hotel.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                            `مرحباً، أود حجز (${room.name}) في ${hotel.name} عبر منصة دلّني السياحية والاستفادة من خصم الـ ${discountPct}%.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-blue-900/20 active:scale-95 cursor-pointer"
                        >
                          <span>💬 {isAr ? "طلب حجز الغرفة" : "Book Room"}</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AMENITIES TAB */}
            {activeTab === "amenities" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? "المرافق والتسهيلات الفندقية المعتمدة" : "Verified Hotel Amenities"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {isAr ? "تم التحقق من جاهزية كافة المرافق لتوفير أعلى درجات الراحة للضيوف" : "All facilities are verified and operational"}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {amenities.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 transition shadow-xs space-y-1.5 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      <div className="font-black text-xs text-slate-900 dark:text-white group-hover:text-[#003580] transition">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LOCATION TAB */}
            {activeTab === "location" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="space-y-1">
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {isAr ? "الموقع الجغرافي والمعالم المجاورة" : "Location & Surrounding Landmarks"}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {hotel.address || hotel.city} · {hotel.city}، ليبيا
                  </p>
                </div>

                <div className="p-6 rounded-3xl bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white border border-white/10 relative overflow-hidden shadow-xl space-y-5">
                  <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-black">
                        <span>📍</span>
                        <span>{hotel.city}</span>
                      </div>
                      <h5 className="text-xl font-black">{hotel.name}</h5>
                      <p className="text-xs text-slate-300 font-medium">{hotel.address}</p>
                    </div>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        hotel.mapsQuery || `${hotel.name} ${hotel.city} ليبيا`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 cursor-pointer shrink-0"
                    >
                      <span>🗺️ {isAr ? "فتح المسار في خرائط Google" : "Open in Google Maps"}</span>
                      <span>↗</span>
                    </a>
                  </div>

                  {/* Nearby Attractions */}
                  <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-amber-400 font-black">🚗 {isAr ? "المطار والميناء:" : "Transit:"}</span>
                      <p className="text-slate-300">{isAr ? "25 دقيقة بالسيارة من المطار" : "25 min to airport"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-emerald-400 font-black">🏛️ {isAr ? "المدينة القديمة والآثار:" : "Old City Ruins:"}</span>
                      <p className="text-slate-300">{isAr ? "10 دقائق سيراً على الأقدام" : "10 min walking"}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-0.5">
                      <span className="text-blue-400 font-black">🌊 {isAr ? "الشاطئ والكورنيش:" : "Beachfront:"}</span>
                      <p className="text-slate-300">{isAr ? "إطلالة مباشرة على البحر" : "Direct waterfront view"}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REVIEWS TAB */}
            {activeTab === "reviews" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-blue-50/70 dark:bg-slate-800/50 border border-blue-100 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-[#003580] text-white font-black text-3xl flex items-center justify-center shadow-lg shadow-blue-900/30">
                      {ratingScore}
                    </div>
                    <div>
                      <div className="text-lg font-black text-[#003580] dark:text-blue-300">{ratingWord}</div>
                      <div className="text-xs text-slate-500">
                        {isAr ? `بناءً على تقييمات ${reviewsCount} ضيفاً موثقاً عبر دلّني` : `Based on ${reviewsCount} verified reviews`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-emerald-600 font-black text-xs bg-white dark:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-600">
                      ✓ {isAr ? "تقييمات سياحية موثقة 100%" : "100% Verified Guests"}
                    </span>
                  </div>
                </div>

                {/* Rating category bars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {[
                    { label: isAr ? "النظافة والتعقيم" : "Cleanliness", score: 9.4 },
                    { label: isAr ? "طاقم العمل والضيافة" : "Staff & Hospitality", score: 9.6 },
                    { label: isAr ? "الموقع وسهولة الوصول" : "Location", score: 9.5 },
                    { label: isAr ? "الراحة والهدوء" : "Comfort", score: 9.1 },
                    { label: isAr ? "المرافق والخدمات" : "Facilities", score: 8.9 },
                    { label: isAr ? "القيمة مقابل السعر" : "Value for Money", score: 9.2 },
                  ].map((bar, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between">
                        <span>{bar.label}</span>
                        <span className="font-black text-[#003580] dark:text-blue-400">{bar.score} / 10</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${(bar.score / 10) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Testimonials */}
                <div className="space-y-3 pt-2">
                  {[
                    {
                      name: isAr ? "عبد السلام الزنتاني" : "Abdelsalam Z.",
                      date: isAr ? "قبل 3 أيام" : "3 days ago",
                      rate: 5,
                      comment: isAr ? "إقامة ممتازة واستقبال راقٍ جداً، الإفطار متنوع والغرف مطلة وواسعة، وتم تطبيق خصم منصة دلّني فوراً." : "Superb stay and outstanding staff!",
                    },
                    {
                      name: isAr ? "مريم الفيتوري" : "Mariam F.",
                      date: isAr ? "قبل أسبوع" : "1 week ago",
                      rate: 5,
                      comment: isAr ? "المكان هادئ ونظيف للغاية، والسرير مريح جداً بعد يوم طويل من الجولات السياحية. أنصح به بشدة." : "Clean, cozy, and very peaceful location.",
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
          <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 p-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xl z-30">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-xl shrink-0">
                🏷️
              </div>
              <div>
                <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{isAr ? "حجز واستعلام مباشر معتمد" : "Direct Verified Concierge"}</span>
                  <span className="px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[10px] font-black">
                    -{discountPct}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-bold">
                  {isAr ? "بدون عمولات إضافية + ضمان أفضل سعر" : "Zero extra fees + Best Price Match"}
                </div>
              </div>
            </div>

            {/* Direct Contact Buttons */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={`tel:${hotel.phone}`}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-95 cursor-pointer"
              >
                <span>📞</span>
                <span>{isAr ? `اتصال (${hotel.phone})` : `Call ${hotel.phone}`}</span>
              </a>

              <a
                href={`https://wa.me/218${hotel.phone.replace(/^0+/, "")}?text=${encodeURIComponent(
                  `مرحباً، أود الاستفسار عن إمكانية الحجز وتوافر الغرف لدى ${hotel.name} بعد الاطلاع عليه عبر منصة دلّني السياحية للاستفادة من خصم الـ ${discountPct}%.`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 cursor-pointer"
              >
                <span>💬</span>
                <span>{isAr ? "واتساب الفندق" : "WhatsApp"}</span>
              </a>

              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  hotel.mapsQuery || `${hotel.name} ${hotel.city} ليبيا`
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
