import { useState, useEffect } from "react";
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
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedPhoto(0);
      setIsLiked(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !hotel) return null;

  const photos = hotel.photos && hotel.photos.length > 0
    ? hotel.photos
    : [
        "/assets/ai_city.jpg",
        "/assets/ai_city.jpg",
        "/assets/ai_city.jpg",
        "/assets/ai_city.jpg",
        "/assets/ai_city.jpg",
      ];

  const ratingScore = hotel.rating || (hotel.stars === 5 ? 9.2 : hotel.stars === 4 ? 8.6 : 7.8);
  const ratingWord = hotel.ratingWord || (ratingScore >= 9 ? (isAr ? "استثنائي" : "Superb") : ratingScore >= 8.5 ? (isAr ? "ممتاز" : "Excellent") : (isAr ? "جيد جداً" : "Good"));
  const reviewsCount = hotel.reviewsCount || 540;
  const currentPrice = hotel.price || (hotel.stars === 5 ? 450 : hotel.stars === 4 ? 280 : 180);
  const originalPrice = hotel.originalPrice || Math.round(currentPrice * 1.3);

  const roomsList = [
    {
      id: "rm-1",
      name: isAr ? "غرفة مزدوجة مع إطلالة بحرية وسرير مزدوج كبير" : "Double Room with Sea View - King Bed",
      bed: isAr ? "1 سرير مزدوج كبير جداً" : "1 extra-large double bed",
      specs: isAr ? "تكييف هواء · حمام خاص رخامي · واي فاي مجاني · شاشة مسطحة" : "Air conditioning · Marble en suite · Free WiFi · Flat screen TV",
      perk: isAr ? "شامل وجبة إفطار فاخرة" : "Breakfast included",
      price: currentPrice,
      originalPrice: originalPrice,
      leftCount: 2,
    },
    {
      id: "rm-2",
      name: isAr ? "غرفة مفردة ديلوكس لرجال الأعمال" : "Deluxe Single Room - Non Smoking",
      bed: isAr ? "1 سرير مفرد مريح" : "1 comfortable single bed",
      specs: isAr ? "تكييف هواء · مكتب عمل · عازل للصوت · ميني بار" : "Air conditioning · Work desk · Soundproofing · Minibar",
      perk: isAr ? "إلغاء مجاني قبل 48 ساعة" : "Free cancellation within 48h",
      price: Math.round(currentPrice * 0.75),
      originalPrice: Math.round(originalPrice * 0.75),
      leftCount: 4,
    },
    {
      id: "rm-3",
      name: isAr ? "جناح عائلي ملكي بإطلالة بانورامية كاملة" : "Royal Family Suite with Panoramic View",
      bed: isAr ? "2 غرف نوم منفصلة + صالة جلوس" : "2 separate bedrooms + lounge",
      specs: isAr ? "جاكوزي خاص · بلكونة خاصة · ماكينة قهوة إسبريسو" : "Private jacuzzi · Private balcony · Espresso machine",
      perk: isAr ? "شامل الإفطار والعشاء مجاناً" : "Free Breakfast & Dinner included",
      price: Math.round(currentPrice * 1.6),
      originalPrice: Math.round(originalPrice * 1.6),
      leftCount: 1,
    },
  ];

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hotel.name,
        text: `${hotel.name} في ${hotel.city} على منصة رحلات ليبيا`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert(isAr ? "تم نسخ رابط الفندق بنجاح!" : "Hotel link copied!");
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto" dir={dir}>
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in" onClick={onClose} />

        <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[94vh] overflow-y-auto overflow-x-hidden z-10 border border-slate-200">
          {/* Diagonal Corner Triangle / Ribbon for Discount */}
          <div className="absolute top-0 right-0 w-32 h-32 overflow-hidden pointer-events-none z-30">
            <div className="absolute top-5 -right-10 w-40 py-1 bg-gradient-to-r from-red-600 via-[#EA580C] to-[#D96B27] text-white text-center text-[11px] font-black tracking-wider shadow-md rotate-45 border-y border-white/30">
              {isAr ? `خصم ${hotel.discountPct || 20}%` : `${hotel.discountPct || 20}% OFF`}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/95 text-slate-800 shadow-md flex items-center justify-center hover:bg-slate-100 transition font-black text-xl cursor-pointer"
          >
            ✕
          </button>

          <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* ── 1. HEADER (Booking.com style) ── */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1.5 flex-1">
                {/* Stars Rating & Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex text-amber-400 text-sm">
                    {"★".repeat(hotel.stars)}
                  </div>
                  {hotel.discountPct && (
                    <span className="bg-[#D96B27] text-white text-[11px] font-black px-2 py-0.5 rounded-md">
                      -{hotel.discountPct}%
                    </span>
                  )}
                  <span className="text-[11px] font-black bg-[#003580]/10 text-[#003580] px-2 py-0.5 rounded-md">
                    {isAr ? "شريك معتمد" : "Verified Partner"}
                  </span>
                  <span className="text-[11px] font-black bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                    {isAr ? "🏢 للعرض والاستعلام فقط (غير قابل للحجز المباشر)" : "Display & Direct Inquiry Only"}
                  </span>
                </div>

                {/* Hotel Title */}
                <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">
                  {hotel.name}
                </h2>

                {/* Address & Show on Map Link */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-medium">
                  <span>📍 {hotel.address}, {hotel.city}</span>
                  <span>·</span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.mapsQuery || `${hotel.name} ${hotel.city}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#003580] font-black hover:underline inline-flex items-center gap-1"
                  >
                    <span>{isAr ? "موقع استثنائي - إظهار الخريطة" : "Great location - show map"}</span>
                    <span className="text-[10px]">↗</span>
                  </a>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2.5 self-end md:self-start">
                <button
                  type="button"
                  onClick={() => setIsLiked(!isLiked)}
                  className={`w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center transition cursor-pointer shadow-xs ${
                    isLiked ? "bg-red-50 text-red-500 border-red-200" : "bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                  title={isAr ? "إضافة للمفضلة" : "Save to wishlist"}
                >
                  <span className="text-lg">{isLiked ? "❤️" : "🤍"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 flex items-center justify-center transition cursor-pointer shadow-xs"
                  title={isAr ? "مشاركة" : "Share"}
                >
                  <span className="text-base">🔗</span>
                </button>

                <a
                  href={`tel:${hotel.phone}`}
                  className="px-5 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-sm shadow-md transition inline-flex items-center gap-2"
                >
                  <span>📞 {isAr ? "اتصال واستعلام" : "Call Hotel"}</span>
                </a>
              </div>
            </div>

            {/* Price Match Guarantee Tag */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <span className="text-emerald-600 text-sm">🏷️</span>
              <span>{isAr ? "نحن نطابق الأسعار: ضمان أفضل سعر حجز فندقي في ليبيا" : "We Price Match: Best rate guarantee in Libya"}</span>
            </div>

            {/* ── 2. BOOKING.COM STYLE PHOTO GALLERY GRID ── */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 h-72 sm:h-96 rounded-2xl overflow-hidden shadow-xs">
                {/* Main Large Photo */}
                <div className="md:col-span-8 relative h-full group overflow-hidden bg-slate-900 cursor-pointer" onClick={() => setSelectedPhoto(0)}>
                  <img
                    src={photos[selectedPhoto] || photos[0]}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                    📷 {selectedPhoto + 1} / {photos.length}
                  </div>
                </div>

                {/* Two Stacked Photos */}
                <div className="hidden md:grid md:col-span-4 grid-rows-2 gap-2 h-full">
                  <div className="relative h-full overflow-hidden bg-slate-900 cursor-pointer group" onClick={() => setSelectedPhoto(1 % photos.length)}>
                    <img
                      src={photos[1 % photos.length]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="relative h-full overflow-hidden bg-slate-900 cursor-pointer group" onClick={() => setSelectedPhoto(2 % photos.length)}>
                    <img
                      src={photos[2 % photos.length]}
                      alt=""
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Thumbnails Row Below */}
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 h-16 sm:h-20">
                {photos.slice(0, 4).map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedPhoto(idx)}
                    className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer h-full ${
                      selectedPhoto === idx ? "border-[#003580] ring-2 ring-[#003580]/30" : "border-transparent opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img src={p} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
                {/* Last thumbnail with +Photos badge */}
                <div
                  className="relative rounded-xl overflow-hidden bg-slate-900 cursor-pointer h-full group"
                  onClick={() => setSelectedPhoto((selectedPhoto + 1) % photos.length)}
                >
                  <img src={photos[4 % photos.length]} alt="" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition" />
                  <div className="absolute inset-0 flex items-center justify-center text-white font-black text-xs sm:text-sm">
                    +{photos.length} {isAr ? "صورة" : "photos"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3. TWO COLUMN MAIN BODY & SIDEBAR (Booking.com style) ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
              {/* Left/Main Column: About, Facilities, Available Rooms */}
              <div className="lg:col-span-8 space-y-6">
                {/* About this property */}
                <div className="space-y-3">
                  <h3 className="text-xl font-black text-[#0F172A]">
                    {isAr ? "عن مكان الإقامة" : "About this property"}
                  </h3>
                  <div className="text-slate-600 text-sm leading-relaxed space-y-2.5">
                    <p>
                      <strong className="text-slate-900 font-black">
                        {isAr ? "إقامة مريحة وفخمة: " : "Comfortable Accommodations: "}
                      </strong>
                      {isAr
                        ? `يقدم ${hotel.name} في ${hotel.city} غرفاً وأجنحة مكيفة ومجهزة بحمامات رخامية خاصة، إطلالات ساحرة على المدينة أو البحر، وشاشات مسطحة ذكية وميني بار مع خدمة تنظيف يومية.`
                        : `${hotel.name} in ${hotel.city} offers spacious air-conditioned rooms and suites with private marble bathrooms, city or sea views, and free high-speed WiFi.`}
                    </p>
                    <p>
                      <strong className="text-slate-900 font-black">
                        {isAr ? "المطاعم والضيافة: " : "Dining & Amenities: "}
                      </strong>
                      {isAr
                        ? "يستمتع النزلاء بمطعم يقدم أشهى المأكولات الليبية التقليدية والأطباق العالمية، بوفيه إفطار مفتوح صباحاً، ومقهى هادئ يقدم المشروبات والحلويات التراثية."
                        : "Guests can enjoy an on-site restaurant serving traditional Libyan dishes and continental buffet breakfast."}
                    </p>
                    <p>
                      <strong className="text-slate-900 font-black">
                        {isAr ? "موقع استراتيجي: " : "Strategic Location: "}
                      </strong>
                      {isAr
                        ? `يقع الفندق في قلب ${hotel.city} بالقرب من أهم المعالم السياحية ومراكز التسوق، ويوفر مكتب استقبال يعمل على مدار 24 ساعة ومواقف سيارات خاصة مجانية وآمنة.`
                        : `Centrally situated in ${hotel.city} with 24-hour reception, free private secure parking, and concierge assistance.`}
                    </p>
                  </div>
                </div>

                {/* Most Popular Facilities */}
                <div className="pt-2">
                  <h4 className="text-sm font-black text-[#0F172A] mb-3">
                    {isAr ? "أكثر المرافق رواجاً" : "Most popular facilities"}
                  </h4>
                  <div className="flex flex-wrap gap-2.5">
                    {[
                      { icon: "🚭", label: isAr ? "غرف لغير المدخنين" : "Non-smoking rooms" },
                      { icon: "🅿️", label: isAr ? "موقف سيارات مجاني" : "Free Parking" },
                      { icon: "📶", label: isAr ? "واي فاي مجاني فائق السرعة" : "Free high-speed WiFi" },
                      { icon: "🍽️", label: isAr ? "مطعم ومقهى" : "Restaurant & Cafe" },
                      { icon: "☕", label: isAr ? "إفطار استثنائي مشمول" : "Very Good Breakfast" },
                      { icon: "❄️", label: isAr ? "تكييف هواء مركزي" : "Air conditioning" },
                      { icon: "🛎️", label: isAr ? "استقبال 24 ساعة" : "24h front desk" },
                    ].map((f, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0FDF4] border border-emerald-200 text-emerald-800 text-xs font-black shadow-2xs"
                      >
                        <span>{f.icon}</span>
                        <span>{f.label}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Available Rooms Section (Screenshot 3 style) */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-[#0F172A]">
                      {isAr ? "خيارات الغرف والحجز المتوفرة" : "Available Room Types"}
                    </h3>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      ✓ {isAr ? "تأكيد فوري للحجز" : "Instant Confirmation"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {roomsList.map((room) => (
                      <div
                        key={room.id}
                        className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-[#003580]/40 transition shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1 flex-1">
                          <h4 className="font-black text-sm text-[#003580] leading-snug">
                            {room.name}
                          </h4>
                          <div className="text-xs text-slate-500 font-medium">
                            🛏️ {room.bed} · {room.specs}
                          </div>
                          <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 mt-1">
                            <span>✓</span>
                            <span>{room.perk}</span>
                          </div>
                          <div className="text-[11px] font-black text-red-500">
                            {isAr ? `متبقي ${room.leftCount} غرف فقط بهذا السعر!` : `We have ${room.leftCount} left at this price!`}
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                              <span>✓</span>
                              <span>{isAr ? "مشمول بخصم دلّني 20%" : "20% Dallani Perk"}</span>
                            </span>
                          </div>

                          <a
                            href={`tel:${hotel.phone}`}
                            className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#002860] text-white font-black text-xs transition inline-flex items-center gap-1.5 shadow-xs"
                          >
                            <span>📞 {isAr ? "استعلام وحجز فوري" : "Inquire & Book"}</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Review Score, Guest Quotes, Mini Map, Highlights */}
              <div className="lg:col-span-4 space-y-4">
                {/* Review Score Card */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="font-black text-sm text-[#0F172A]">{ratingWord}</div>
                    <div className="text-xs text-slate-500 font-medium">
                      {reviewsCount} {isAr ? "تقييم حقيقي من النزلاء" : "verified reviews"}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-[#003580] text-white font-black text-lg flex items-center justify-center shadow-xs">
                    {ratingScore}
                  </div>
                </div>

                {/* Guests who stayed here loved (Quote card) */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] space-y-3">
                  <div className="text-xs font-black text-[#0F172A]">
                    {isAr ? "أحب الضيوف الذين أقاموا هنا:" : "Guests who stayed here loved:"}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed italic">
                    {isAr
                      ? "“الغرفة فسيحة ومريحة جداً مع إطلالة رائعة، وطاقم الاستقبال في غاية التعاون والرقي. تجربة فندقية فاخرة أنصح بها بشدة في ليبيا!”"
                      : "“Very generous room size, good temperature control and fantastic staff. One of the best hospitality experiences in Libya.”"}
                  </p>
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="w-8 h-8 rounded-full bg-[#003580] text-white text-xs font-black flex items-center justify-center">
                      M
                    </div>
                    <div>
                      <div className="text-xs font-black text-[#0F172A]">
                        {isAr ? "م. عبد السلام الفيتوري" : "Abdulsalam F."}
                      </div>
                      <div className="text-[10px] text-slate-500">🇱🇾 {isAr ? "ليبيا" : "Libya"}</div>
                    </div>
                  </div>
                </div>

                {/* Staff & Location Rating */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">{isAr ? "طاقم العمل" : "Staff"}</span>
                    <span className="text-xs font-black text-[#003580] bg-[#003580]/10 px-2 py-0.5 rounded-md">8.8</span>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">{isAr ? "الموقع" : "Location"}</span>
                    <span className="text-xs font-black text-[#003580] bg-[#003580]/10 px-2 py-0.5 rounded-md">9.4</span>
                  </div>
                </div>

                {/* Mini Map Preview with Button */}
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 h-36 bg-slate-100 flex items-center justify-center">
                  <img
                    src="/assets/ai_ruins.jpg"
                    alt="Map Preview"
                    className="absolute inset-0 w-full h-full object-cover brightness-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  
                  {/* Pin Graphic */}
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-2xl animate-bounce">📍</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.mapsQuery || `${hotel.name} ${hotel.city}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 px-4 py-1.5 rounded-xl bg-[#003580] text-white text-xs font-black shadow-md hover:bg-[#00224f] transition flex items-center gap-1"
                    >
                      <span>{isAr ? "إظهار على الخريطة" : "Show on map"}</span>
                      <span className="text-[10px]">↗</span>
                    </a>
                  </div>
                </div>

                {/* Property Highlights Box */}
                <div className="p-4 rounded-2xl bg-[#EBF3FF] border border-blue-200 space-y-2.5">
                  <h4 className="text-xs font-black text-[#003580]">
                    {isAr ? "أبرز مميزات مكان الإقامة" : "Property highlights"}
                  </h4>
                  <div className="space-y-2 text-xs text-slate-700 font-medium">
                    <div className="font-black text-slate-900">
                      {isAr ? "مثالي لإقامة ليلتين أو أكثر!" : "Perfect for a 2-night stay!"}
                    </div>
                    <div className="flex items-start gap-2">
                      <span>📍</span>
                      <span>{isAr ? "موقع في القمة: حاصل على تقييم 9.4 من أحدث النزلاء" : "Top location: Highly rated by recent guests (9.4)"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>🍳</span>
                      <span>{isAr ? "معلومات الإفطار: بوفيه صباحي فاخر متكامل" : "Breakfast info: Fresh Continental & Libyan Buffet"}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span>🌊</span>
                      <span>{isAr ? "غرف مع: إطلالة بحرية أو بانورامية على معالم المدينة" : "Rooms with: Sea or historic city landmarks view"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
