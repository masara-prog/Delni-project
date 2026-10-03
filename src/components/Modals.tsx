import { useEffect, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";
import heroImg from "@/assets/hero-leptis.jpg";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import destTripoliOldCity from "@/assets/dest-tripoli-old-city.jpg";
import destSabratah from "@/assets/dest-sabratha.jpg";
import destGharyanCave from "@/assets/dest-gharyan-cave.jpg";
import destGharyanCourtyard from "@/assets/dest-gharyan-courtyard.jpg";
import destKsarDesert from "@/assets/dest-ksar-desert.jpg";
import destHarborCoast from "@/assets/dest-harbor-coast.jpg";
import destJabalAkhdarPanorama from "@/assets/dest-jabal-akhdar-panorama.jpg";
import destJabalAkhdarForest from "@/assets/dest-jabal-akhdar-forest.jpg";
import destJabalAkhdarBridge from "@/assets/dest-jabal-akhdar-bridge.jpg";
import destJabalAkhdarValley from "@/assets/dest-jabal-akhdar-valley.jpg";
import destJabalAkhdarPass from "@/assets/dest-jabal-akhdar-pass.jpg";
import destUbariGaberoun from "@/assets/dest-ubari-gaberoun.jpg";
import destUbariUmmAlMaa from "@/assets/dest-ubari-ummalmaa.jpg";
import destAcacusArch from "@/assets/dest-acacus-arch.jpg";
import destSaharaDunes from "@/assets/dest-sahara-dunes.jpg";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { getNearbyServices } from "@/lib/homeData";

function resolveTripImage(title?: string, kind?: string | null, customImage?: string): string {
  if (customImage) return customImage;
  const t = (title || "").toLowerCase();
  if (t.includes("صبراتة") || t.includes("sabratha")) return destSabratah;
  if (t.includes("غريان") || t.includes("gharyan") || t.includes("حفر")) return destGharyanCave;
  if (t.includes("نالوت") || t.includes("nalut") || t.includes("قصر") || t.includes("كاباو")) return destKsarDesert;
  if (t.includes("وادي الكوف") || t.includes("كوف") || t.includes("غابات الجبل")) return destJabalAkhdarBridge;
  if (t.includes("قورينا") || t.includes("cyrene") || t.includes("شحات") || t.includes("الجبل الأخضر") || t.includes("green mountain")) return destJabalAkhdarPanorama;
  if (t.includes("لبدة") || t.includes("leptis") || t.includes("الخمس")) return heroImg;
  if (t.includes("غدامس") || t.includes("ghadames")) return destGhadames;
  if (t.includes("أم الماء") || t.includes("umm al maa") || t.includes("المندرة")) return destUbariUmmAlMaa;
  if (t.includes("أوباري") || t.includes("ubari") || t.includes("قبر عون") || t.includes("قبرعون")) return destUbariGaberoun;
  if (t.includes("أكاكوس") || t.includes("acacus") || t.includes("تدرارت") || t.includes("تكهوري") || t.includes("غات")) return destAcacusArch;
  if (t.includes("صحراء") || t.includes("sahara") || t.includes("كثبان") || t.includes("مرزق")) return destSaharaDunes;
  if (t.includes("طرابلس") || t.includes("tripoli")) return destTripoli;
  if (kind === "weekly") return destUbariGaberoun;
  return destJabalAkhdarPanorama;
}

function resolveTripGallery(title?: string, kind?: string | null, customImage?: string): string[] {
  const t = (title || "").toLowerCase();
  
  if (t.includes("صبراتة") || t.includes("sabratha")) return [destSabratah, destHarborCoast, heroImg];
  if (t.includes("غريان") || t.includes("gharyan") || t.includes("نفوسة") || t.includes("حفر")) return [destGharyanCave, destKsarDesert, destGharyanCourtyard];
  if (t.includes("نالوت") || t.includes("nalut") || t.includes("قصر") || t.includes("كاباو")) return [destKsarDesert, destGharyanCave, destGhadames];
  if (t.includes("قورينا") || t.includes("cyrene") || t.includes("شحات") || t.includes("الجبل") || t.includes("كوف") || t.includes("green mountain")) {
    return [destJabalAkhdarPanorama, destJabalAkhdarForest, destJabalAkhdarBridge, destJabalAkhdarValley, destJabalAkhdarPass, destCyrene];
  }
  if (t.includes("لبدة") || t.includes("leptis") || t.includes("الخمس")) return [heroImg, destSabratah, destTripoli];
  if (t.includes("غدامس") || t.includes("ghadames")) return [destGhadames, destSaharaDunes, destKsarDesert, destUbariGaberoun];
  if (t.includes("أم الماء") || t.includes("المندرة")) return [destUbariUmmAlMaa, destUbariGaberoun, destSaharaDunes, destAcacusArch];
  if (t.includes("أوباري") || t.includes("ubari") || t.includes("قبر عون") || t.includes("قبرعون")) return [destUbariGaberoun, destUbariUmmAlMaa, destSaharaDunes, destAcacusArch];
  if (t.includes("أكاكوس") || t.includes("acacus") || t.includes("تدرارت") || t.includes("غات")) return [destAcacusArch, destSaharaDunes, destUbariGaberoun, destUbariUmmAlMaa];
  if (t.includes("صحراء") || t.includes("sahara") || t.includes("سفاري") || t.includes("كثبان")) return [destSaharaDunes, destUbariGaberoun, destAcacusArch, destUbariUmmAlMaa];
  if (t.includes("طرابلس") || t.includes("tripoli")) return [destTripoli, destTripoliOldCity, destHarborCoast];
  
  if (customImage) return [customImage, destHarborCoast, destSabratah];
  return [destJabalAkhdarPanorama, destJabalAkhdarForest, destJabalAkhdarBridge, destCyrene];
}

export function Modal({ open, onClose, children, size = "md" }: { open: boolean; onClose: () => void; children: ReactNode; size?: "md" | "lg" | "xl" }) {
  const { dir } = useLanguage();
  useEffect(() => {
    if (!open) {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return;
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [open, onClose]);
  if (!open) return null;
  const sizeClass = size === "xl" ? "max-w-4xl" : size === "lg" ? "max-w-3xl" : "max-w-lg";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4" dir={dir}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className={`relative bg-white rounded-3xl shadow-card overflow-hidden w-full ${sizeClass} max-h-[92vh] overflow-y-auto`}>
        <button onClick={onClose} aria-label="Close" className="absolute top-3 left-3 z-10 w-9 h-9 rounded-full bg-white shadow-soft grid place-items-center hover:bg-muted text-lg cursor-pointer">✕</button>
        {children}
      </div>
    </div>
  );
}

export type BookableItem = {
  title: string;
  subtitle?: string;
  image?: string;
  img?: string;
  images?: string[];
  gallery?: string[];
  departure?: string;
  details?: string;
  price?: number | string;
  currency?: string;
};

export function BookingModal({ open, onClose, item }: { open: boolean; onClose: () => void; item: BookableItem | null }) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [step, setStep] = useState<"form" | "success">("form");
  const [seats, setSeats] = useState("2");
  const [phone, setPhone] = useState("");
  const [date, setDate] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (open) {
      setStep("form");
      setSeats("2");
      setDate("");
      let initialPhone = "0912345678";
      let initialName = isAr ? "محمد أحمد" : "John Smith";
      try {
        const storedUser = localStorage.getItem("dalni_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.phone) initialPhone = parsed.phone;
          if (parsed.fullName) initialName = parsed.fullName;
        }
      } catch (e) {}
      setPhone(initialPhone);
      setAccountName(initialName);
    }
  }, [open, isAr]);

  if (!item) return null;

  const unit = typeof item.price === "number" ? item.price : Number(String(item.price ?? "0").replace(/[^\d]/g, ""));
  const total = unit * (parseInt(seats) || 1);
  const tripImage = item.image || item.img || resolveTripImage(item.title, item.subtitle);
  const slideshowImages = item.images || item.gallery || [tripImage];

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {step === "form" ? (
        <div className="grid md:grid-cols-2" dir={dir}>
          <div className="relative h-48 md:h-full min-h-[220px] bg-[#0B132B] overflow-hidden">
            <HeroSlideshow images={slideshowImages} alt={item.title} brightness="brightness-105" intervalMs={4000} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/35 to-transparent z-10" />
            <div className="absolute bottom-4 right-4 left-4 text-white z-20">
              <div className="text-xs opacity-80 font-bold mb-1">{isAr ? "📍 تفاصيل حجز الرحلة" : "📍 Trip Booking Details"}</div>
              <div className="text-xl md:text-2xl font-black drop-shadow-sm">{item.title}</div>
              {item.subtitle && <div className="text-xs opacity-90 mt-1 font-semibold">{item.subtitle}</div>}
              {item.departure && (
                <div className="mt-2 text-[11px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-md w-fit text-white">
                  🚌 {item.departure}
                </div>
              )}
            </div>
          </div>
          <form
            className="p-6 space-y-4"
            onSubmit={(e) => { e.preventDefault(); setStep("success"); }}
          >
            <div className="text-xs font-black text-primary">{isAr ? "إكمال الحجز · حساب مسجّل" : "Complete Booking · Registered Account"}</div>
            <h3 className="text-xl font-black text-foreground">{item.title}</h3>

            <div className="rounded-xl bg-[#F4F1EA] border border-[#E6E1D6] p-3 text-xs">
              <div className="font-black text-[#0B132B] mb-1">👤 {isAr ? `الحساب: ${accountName}` : `Account: ${accountName}`}</div>
              <div className="text-[#526078]">{isAr ? "بياناتك ورقم هاتفك المسجلين مسبقاً مرتبطان تلقائياً بهذا الحجز." : "Your registered account details and phone are automatically linked to this booking."}</div>
            </div>

            <Field label={isAr ? "عدد المقاعد المراد حجزها" : "Number of Seats"} value={seats} onChange={setSeats} type="number" required />
            <Field label={isAr ? "تاريخ الرحلة" : "Trip Date"} value={date} onChange={setDate} type="date" required />

            {unit > 0 && (
              <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#E6E1D6]">
                <div className="flex justify-between text-sm text-[#526078]">
                  <span>{isAr ? "سعر المقعد" : "Seat Price"}</span>
                  <span className="font-bold text-[#0B132B]">{unit} {isAr ? "د.ل" : "LYD"}</span>
                </div>
                <div className="flex justify-between text-sm text-[#526078] mt-1">
                  <span>{isAr ? "عدد المقاعد" : "Seats"}</span>
                  <span className="font-bold text-[#0B132B]">× {seats}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E6E1D6] flex justify-between items-center">
                  <span className="font-black text-[#0B132B]">{isAr ? "السعر الإجمالي" : "Total Price"}</span>
                  <span className="text-2xl font-black text-[#D96B27]">{total.toLocaleString()} <span className="text-sm text-[#526078]">{isAr ? "د.ل" : "LYD"}</span></span>
                </div>
              </div>
            )}

            <button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft hover:-translate-y-0.5 transition">
              {isAr ? "تأكيد واستكمال الحجز" : "Confirm & Complete Booking"}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-8 text-center" dir={dir}>
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-3xl">✅</div>
          <h3 className="mt-4 text-2xl font-black text-[#0B132B]">{isAr ? "تم إرسال وتأكيد الحجز!" : "Booking Confirmed!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr ? `رقم الحجز #BK-${Math.floor(Math.random() * 90000 + 10000)}. تم ربط الحجز بحسابك المسجل بنجاح وسيتواصل معك المرشد أو السائق في الموعد.` : `Booking ID #BK-${Math.floor(Math.random() * 90000 + 10000)}. Confirmed and linked to your registered account.`}
          </p>
          <button onClick={onClose} className="mt-6 px-6 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black shadow-soft">
            {isAr ? "إغلاق" : "Close"}
          </button>
        </div>
      )}
    </Modal>
  );
}

export type DetailsItem = {
  refId?: string;
  title: string;
  subtitle?: string;
  image?: string;
  images?: string[];
  gallery?: string[];
  description?: string;
  meta?: string;
  address?: string;
  phone?: string;
  mapQuery?: string;
  info?: { label: string; value: string }[];
  features?: string[];
  price?: number | string;
  currency?: string;
  bookable?: boolean;
  schedules?: ScheduledTrip[];
  vehicle?: {
    model: string;
    company: string;
    driver: string;
  };
  guide?: {
    name: string;
    title?: string;
    phone?: string;
  };
};

export function DetailsModal({ open, onClose, item, onBook }: { open: boolean; onClose: () => void; item: DetailsItem | null; onBook?: () => void }) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [activeImg, setActiveImg] = useState(0);
  const [showPromo, setShowPromo] = useState(true);
  const [cityTab, setCityTab] = useState<"landmarks" | "food">("landmarks");

  useEffect(() => {
    if (open) {
      setActiveImg(0);
      setShowPromo(true);
      setCityTab("landmarks");
    }
  }, [open]);

  if (!item) return null;

  const nearbyData = getNearbyServices(item.title, language);
  const gallery = item.gallery && item.gallery.length > 0 ? item.gallery : item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
  const currentImg = gallery[activeImg] ?? gallery[0];
  const mapHref = item.mapQuery ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.mapQuery)}` : null;

  return (
    <Modal open={open} onClose={onClose} size="xl">
      <div dir={dir}>
        {/* 1. ANIMATED HIGH QUALITY PHOTO SHOWCASE & SLIDESHOW */}
        <div className="relative w-full h-72 sm:h-80 overflow-hidden bg-[#0B132B]">
          {gallery.length > 1 ? (
            <HeroSlideshow
              images={gallery}
              alt={item.title}
              intervalMs={3000}
              brightness="brightness-95"
            />
          ) : (
            <img
              src={currentImg}
              alt={item.title}
              className="w-full h-full object-cover animate-ken-burns-a brightness-95"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/80 via-transparent to-black/20 pointer-events-none z-10" />

          {/* Quick Info & Photos Badge Overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between text-white">
            <span className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-amber-300 font-black text-xs border border-white/20 shadow-md">
              📸 {gallery.length > 1 ? (isAr ? `${gallery.length} صور متحركة` : `${gallery.length} Animated Photos`) : (isAr ? "معرض الصور" : "Photo Gallery")}
            </span>

            {/* Thumbnail dots if multiple images */}
            {gallery.length > 1 && (
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                {gallery.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImg(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeImg === idx ? "bg-amber-400 w-5" : "bg-white/60 hover:bg-white w-2"
                    }`}
                    aria-label={`Photo ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Header Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full bg-[#003580]/10 text-[#003580] font-black text-xs border border-[#003580]/20">
                📍 {nearbyData.destination}
              </span>
              {item.subtitle && <span className="text-xs text-slate-500 font-bold">· {item.subtitle}</span>}
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0B132B] leading-tight">{item.title}</h3>
          </div>

          {item.description && <p className="text-slate-600 leading-relaxed text-sm font-medium">{item.description}</p>}

          {/* ── 2. VEHICLE & TRANSPORT DETAILS (بيانات المركبة المطلوبة فقط: نوع المركبة واسم الشركة وسائقها) ── */}
          {item.vehicle && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F8FAFC] border border-[#E2E8F0] shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-black text-[#003580]">
                <span className="text-base">🚌</span>
                <span>{isAr ? "بيانات وسيلة النقل السياحية" : "Tour Transport Details"}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. نوع المركبة */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                    {isAr ? "نوع المركبة" : "Vehicle Type"}
                  </div>
                  <div className="font-black text-xs sm:text-sm text-[#0F172A] leading-snug">
                    {item.vehicle.model}
                  </div>
                </div>
                {/* 2. اسم الشركة */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                    {isAr ? "اسم الشركة" : "Company Name"}
                  </div>
                  <div className="font-black text-xs sm:text-sm text-[#0F172A] leading-snug">
                    {item.vehicle.company}
                  </div>
                </div>
                {/* 3. السائق */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                    {isAr ? "السائق" : "Driver"}
                  </div>
                  <div className="font-black text-xs sm:text-sm text-[#0F172A] leading-snug">
                    {item.vehicle.driver}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Guide Card (if available) */}
          {item.guide && (
            <div className="p-3.5 rounded-2xl bg-white border border-[#E8E2D6] shadow-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#003580] flex items-center justify-center text-xl shrink-0">
                  👨‍✈️
                </div>
                <div>
                  <div className="text-[10px] font-bold text-[#526078]">{isAr ? "المرشد السياحي المرافق" : "Accompanying Tour Guide"}</div>
                  <div className="font-black text-xs sm:text-sm text-[#0F172A]">{item.guide.name}</div>
                </div>
              </div>
              {item.guide.title && (
                <span className="text-[10px] font-black text-[#003580] bg-[#003580]/10 px-2.5 py-1 rounded-full border border-[#003580]/15">
                  {item.guide.title}
                </span>
              )}
            </div>
          )}

          {/* ── 3. CITY LANDMARKS & SIGNATURE FOODS (معالم المدينة وأشهر الأكلات - أسلوب أبسط وأرقى) ── */}
          <div className="rounded-3xl bg-white border border-[#E8E2D6] p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE1] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏛️</span>
                <div>
                  <h4 className="font-black text-sm text-[#0F172A]">{nearbyData.cityName || nearbyData.destination}</h4>
                  <p className="text-[11px] text-[#526078]">{isAr ? "أبرز المعالم السياحية والمذاق الليبي الأصيل" : "Top sights & authentic Libyan cuisine"}</p>
                </div>
              </div>
              
              {/* Elegant Tabs Switcher */}
              <div className="flex items-center p-1 bg-[#FAF8F5] rounded-xl border border-[#E8E2D6] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCityTab("landmarks")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    cityTab === "landmarks"
                      ? "bg-[#003580] text-white shadow-xs"
                      : "text-[#526078] hover:text-[#0F172A]"
                  }`}
                >
                  <span>🏛️</span>
                  <span>{isAr ? "أبرز المعالم" : "Landmarks"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCityTab("food")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
                    cityTab === "food"
                      ? "bg-[#003580] text-white shadow-xs"
                      : "text-[#526078] hover:text-[#0F172A]"
                  }`}
                >
                  <span>🍽️</span>
                  <span>{isAr ? "أشهر الأكلات" : "Local Foods"}</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Landmarks */}
            {cityTab === "landmarks" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
                {nearbyData.landmarks?.slice(0, 3).map((lm: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE4D9] hover:border-[#003580]/30 transition space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1.5 mb-1">
                        <span className="font-black text-xs text-[#0F172A]">{lm.name}</span>
                        <span className="text-[9px] font-bold text-[#003580] bg-[#003580]/10 px-2 py-0.5 rounded-full shrink-0">
                          {lm.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#526078] leading-relaxed">
                        {lm.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Authentic Foods */}
            {cityTab === "food" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-in fade-in duration-200">
                {nearbyData.foods?.slice(0, 3).map((f: any, idx: number) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-[#FAF9F6] border border-[#EAE4D9] hover:border-[#D96B27]/30 transition space-y-1.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">🍲</span>
                        <span className="font-black text-xs text-[#0F172A]">{f.name}</span>
                      </div>
                      <p className="text-[11px] text-[#526078] leading-relaxed">
                        {f.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {(item.phone || item.address || mapHref) && (
            <div className="grid sm:grid-cols-2 gap-2">
              {item.address && (
                <div className="p-3 rounded-xl bg-muted border border-border col-span-full sm:col-span-1">
                  <div className="text-[11px] font-black text-primary">📍 {isAr ? "العنوان" : "Address"}</div>
                  <div className="text-sm font-bold text-foreground mt-1">{item.address}</div>
                  {mapHref && (
                    <a href={mapHref} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-black text-primary hover:underline">
                      {isAr ? "عرض على Google Maps ↗" : "View on Google Maps ↗"}
                    </a>
                  )}
                </div>
              )}
              {item.phone && (
                <div className="p-3 rounded-xl bg-muted border border-border">
                  <div className="text-[11px] font-black text-primary">📞 {isAr ? "رقم الهاتف" : "Phone Number"}</div>
                  <a href={`tel:${item.phone}`} className="text-sm font-black text-foreground mt-1 block hover:text-primary" dir="ltr">{item.phone}</a>
                </div>
              )}
            </div>
          )}

          {/* Key Metrics Pills */}
          {item.info && item.info.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {item.info.map((i) => (
                <div key={i.label} className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E8E2D6] shadow-xs">
                  <div className="text-[10px] font-bold text-[#526078] mb-0.5">{i.label}</div>
                  <div className="font-black text-[#0F172A] text-xs sm:text-sm">{i.value}</div>
                </div>
              ))}
            </div>
          )}
          {item.features && item.features.length > 0 && (
            <div>
              <div className="text-xs font-black text-muted-foreground mb-2">{isAr ? "ما يشمله" : "Includes"}</div>
              <div className="flex flex-wrap gap-2">
                {item.features.map((f) => (
                  <span key={f} className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#1ABC9C]/10 text-[#1ABC9C]">
                    <span className="text-emerald-500">✓</span> {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tourist Rating & Review Section */}
          <ReviewsSection itemId={item.refId || item.title} itemTitle={item.title} />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border">
            {item.price !== undefined ? (
              <div>
                <div className="text-xs text-muted-foreground">{isAr ? "السعر" : "Price"}</div>
                <div className="text-2xl font-black text-primary">{item.price} <span className="text-sm text-muted-foreground font-bold">{item.currency ?? (isAr ? "د.ل" : "LYD")}</span></div>
              </div>
            ) : <span />}
            {item.bookable && onBook ? (
              <button onClick={onBook} className="px-6 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft hover:-translate-y-0.5 transition">
                {isAr ? "احجز الرحلة الآن 🚀" : "Book Trip Now 🚀"}
              </button>
            ) : (
              <span className="text-[11px] font-black text-muted-foreground bg-muted px-3 py-2 rounded-lg">{isAr ? "للعرض فقط — غير قابل للحجز" : "Display only — Not bookable"}</span>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

function ReviewsSection({ itemId, itemTitle }: { itemId: string; itemTitle: string }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<{ id: string; name: string; rating: number; date: string; comment: string }[]>([
    {
      id: "rev-1",
      name: isAr ? "د. طارق السويح" : "Dr. Tarek Al-Sweih",
      rating: 5,
      date: isAr ? "منذ أسبوع" : "1 week ago",
      comment: isAr ? "تجربة ممتازة وخدمة استثنائية! التنظيم كان رائعاً والاهتمام بأدق التفاصيل ملحوظ جداً." : "Excellent experience and exceptional service! Very well organized.",
    },
    {
      id: "rev-2",
      name: isAr ? "سارة الزوي" : "Sara Al-Zway",
      rating: 5,
      date: isAr ? "منذ أسبوعين" : "2 weeks ago",
      comment: isAr ? "المكان والخدمات فاقت التوقعات، أنصح بشدة كل من يزور ليبيا بتجربتها." : "The place and services exceeded expectations, highly recommended!",
    },
  ]);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showForm, setShowForm] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      name: isAr ? "أحمد الشريف (سائح موثّق)" : "Ahmed Al-Sharif (Verified Tourist)",
      rating,
      date: isAr ? "الآن" : "Just now",
      comment: comment.trim(),
    };

    setReviews([newRev, ...reviews]);
    setComment("");
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setShowForm(false);
    }, 2000);
  }

  return (
    <div className="pt-2 border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-muted hover:bg-muted/80 border border-border transition text-xs font-black text-foreground"
      >
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-sm">⭐</span>
          <span>{isAr ? "تقييمات وآراء السياح والزوار" : "Tourist Reviews & Feedback"}</span>
          <span className="text-[11px] font-bold text-muted-foreground bg-white px-2 py-0.5 rounded-full border border-border">
            {reviews.length} {isAr ? "تقييمات" : "reviews"}
          </span>
        </div>
        <span className="text-muted-foreground transition-transform duration-200">
          {isOpen ? (isAr ? "▲ إخفاء" : "▲ Hide") : (isAr ? "▼ عرض التقييمات" : "▼ Show Reviews")}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 p-3 rounded-2xl bg-muted/50 border border-border animate-in fade-in">
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div key={r.id} className="p-3 rounded-xl bg-white border border-border space-y-1 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] grid place-items-center font-bold">
                      {r.name.charAt(0)}
                    </span>
                    {r.name}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-500 text-xs">{"★".repeat(r.rating)}</span>
                    <span className="text-[10px] text-muted-foreground">({r.date})</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.comment}</p>
              </div>
            ))}
          </div>

          {!showForm ? (
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="w-full py-2.5 rounded-xl border border-dashed border-primary/40 text-primary text-xs font-black hover:bg-primary/5 transition flex items-center justify-center gap-1.5"
            >
              ✍️ {isAr ? "أضف تقييمك وتجربتك" : "Write a Review"}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span>👤 {isAr ? "الحساب: أحمد الشريف" : "Account: Ahmed Sharif"}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-lg transition-transform ${star <= rating ? "text-amber-500 scale-110" : "text-slate-300"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                placeholder={isAr ? "اكتب انطباعك ورأيك حول هذه الخدمة..." : "Write your feedback..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-primary font-medium resize-none"
              />

              {submitted ? (
                <div className="text-center py-2 bg-emerald-100 text-emerald-800 text-xs font-black rounded-xl">
                  ✅ {isAr ? "شكراً لك! تم إضافة تقييمك بنجاح" : "Thank you! Review submitted successfully"}
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition shadow-sm"
                  >
                    {isAr ? "إرسال التقييم" : "Submit Review"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition"
                  >
                    {isAr ? "إلغاء" : "Cancel"}
                  </button>
                </div>
              )}
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder, required }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-sm font-bold text-foreground mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition text-sm font-semibold"
      />
    </div>
  );
}

export function useModalPair() {
  const [details, setDetails] = useState<DetailsItem | null>(null);
  const [booking, setBooking] = useState<BookableItem | null>(null);
  return {
    detailsItem: details,
    bookingItem: booking,
    openDetails: (i: DetailsItem) => setDetails(i),
    openBooking: (i: BookableItem) => setBooking(i),
    closeDetails: () => setDetails(null),
    closeBooking: () => setBooking(null),
    bookFromDetails: (onCustomBook?: (title: string, subtitle?: string) => void) => {
      if (details) {
        if (onCustomBook) {
          onCustomBook(details.title, details.subtitle);
        } else {
          setBooking({ title: details.title, subtitle: details.subtitle, image: details.image, price: details.price, currency: details.currency });
        }
      }
      setDetails(null);
    },
  };
}

export type ScheduledTrip = {
  id: string;
  date: string;
  time: string;
  seats: number;
  taken: number;
  guide: string;
  price: number;
};

export function TripScheduleModal({
  open,
  onClose,
  kind,
  customTitle,
  customPrice,
  customImage,
  customSchedules,
}: {
  open: boolean;
  onClose: () => void;
  kind: "daily" | "weekly" | null;
  customTitle?: string;
  customPrice?: number;
  customImage?: string;
  customSchedules?: ScheduledTrip[];
}) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [selected, setSelected] = useState<string | null>(null);
  const [seats, setSeats] = useState("1");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");

  useEffect(() => {
    if (open) { setSelected(null); setSeats("1"); setPhone(""); setStep("pick"); }
  }, [open]);

  if (!kind && !customSchedules) return null;

  const defaultDaily: ScheduledTrip[] = [
    { id: "d1", date: isAr ? "الأربعاء 23 يوليو 2026" : "Wed 23 Jul 2026", time: isAr ? "08:00 ص" : "08:00 AM", seats: 20, taken: 14, guide: isAr ? "خالد الورفلي" : "Khaled Al-Warfali", price: 180 },
    { id: "d2", date: isAr ? "الخميس 24 يوليو 2026" : "Thu 24 Jul 2026", time: isAr ? "08:00 ص" : "08:00 AM", seats: 20, taken: 7, guide: isAr ? "سامي العبيدي" : "Sami Al-Obaidi", price: 180 },
  ];

  const defaultWeekly: ScheduledTrip[] = [
    { id: "w1", date: isAr ? "السبت 26 يوليو 2026" : "Sat 26 Jul 2026", time: isAr ? "انطلاق صباحي" : "Morning Departure", seats: 12, taken: 8, guide: isAr ? "فريق دَلِّني الكامل" : "Dallani Full Team", price: 2400 },
    { id: "w2", date: isAr ? "السبت 2 أغسطس 2026" : "Sat 2 Aug 2026", time: isAr ? "انطلاق صباحي" : "Morning Departure", seats: 12, taken: 4, guide: isAr ? "أحمد الفيتوري" : "Ahmed Al-Fitouri", price: 2400 },
  ];

  const schedules = customSchedules || (kind === "daily" ? defaultDaily : defaultWeekly);
  const selectedTrip = schedules.find((s) => s.id === selected);
  const total = selectedTrip ? selectedTrip.price * (parseInt(seats) || 1) : 0;

  const kindLabel = customTitle || (kind === "daily" ? (isAr ? "الرحلات اليومية" : "Daily Trips") : (isAr ? "الرحلات الأسبوعية" : "Weekly Trips"));
  const kindIcon = kind === "daily" ? "☀️" : "🗓️";
  const slideshowImages = resolveTripGallery(kindLabel, kind, customImage);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {step === "pick" && (
        <div dir={dir}>
          <div className="relative h-48 overflow-hidden bg-[#0B132B]">
            <HeroSlideshow images={slideshowImages} alt={kindLabel} brightness="brightness-105" intervalMs={4000} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/35 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-white">
              <div className="text-xs opacity-80 mb-1 flex items-center gap-1.5 font-bold">
                <span>{kindIcon}</span>
                <span>{isAr ? "اختر موعد رحلتك" : "Select Your Trip Date"}</span>
              </div>
              <h3 className="text-2xl font-black drop-shadow-md">{kindLabel}</h3>
            </div>
          </div>

          <div className="p-6 space-y-3">
            <p className="text-sm text-[#526078] mb-4">
              {kind === "daily"
                ? (isAr ? "الرحلات اليومية تنطلق صباحاً وتعود مساءً — اختر الموعد الذي يناسبك:" : "Daily trips depart in the morning & return evening — select your date:")
                : (isAr ? "الرحلات الأسبوعية برنامج ٥-٧ أيام شامل — اختر أسبوع انطلاقك:" : "Weekly tours are 5-7 days all-inclusive — select your departure week:")}
            </p>
            {schedules.map((s) => {
              const avail = s.seats - s.taken;
              const full = avail === 0;
              const isSelected = selected === s.id;
              return (
                <button
                  key={s.id}
                  disabled={full}
                  onClick={() => setSelected(isSelected ? null : s.id)}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition ${
                    full
                      ? "border-[#E6E1D6] bg-stone-100 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-[#D96B27] bg-[#D96B27]/10 shadow-soft scale-[1.01]"
                      : "border-[#E6E1D6] bg-white hover:border-[#D96B27]/40 hover:shadow-soft"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-[#0B132B]">{s.date}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#0D9488]/10 text-[#0D9488] font-bold border border-[#0D9488]/20">{s.time}</span>
                        {full && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">{isAr ? "مكتمل" : "Full"}</span>}
                      </div>
                      <div className="mt-1 flex items-center gap-4 text-xs text-[#526078]">
                        <span>🧭 {s.guide}</span>
                        <span className={avail <= 3 ? "text-[#D96B27] font-bold" : ""}>
                          {full ? (isAr ? "لا توجد مقاعد" : "No seats left") : (isAr ? `${avail} مقعد متاح` : `${avail} seats available`)}
                        </span>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <div className="text-lg font-black text-[#D96B27]">{s.price.toLocaleString()}</div>
                      <div className="text-[10px] text-[#526078]">{isAr ? "د.ل / شخص" : "LYD / person"}</div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] grid place-items-center text-white text-xs font-black shrink-0">✓</div>
                    )}
                  </div>
                </button>
              );
            })}

            <button
              disabled={!selected}
              onClick={() => selected && setStep("form")}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft hover:-translate-y-0.5 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {selected ? (isAr ? "متابعة الحجز ←" : "Proceed to Booking →") : (isAr ? "اختر موعداً أولاً" : "Select a date first")}
            </button>
          </div>
        </div>
      )}

      {step === "form" && selectedTrip && (
        <div dir={dir}>
          <div className="relative h-48 overflow-hidden bg-[#0B132B]">
            <HeroSlideshow images={slideshowImages} alt={kindLabel} brightness="brightness-105" intervalMs={4000} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/90 via-[#0B132B]/35 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-white z-10">
              <button
                type="button"
                onClick={() => setStep("pick")}
                className="text-xs font-black bg-black/40 hover:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-white/90 hover:text-white mb-2 flex items-center gap-1.5 w-fit border border-white/20 transition cursor-pointer"
              >
                ← {isAr ? "العودة لاختيار الموعد" : "Back to Date Selection"}
              </button>
              <h3 className="text-2xl font-black drop-shadow-md">{kindLabel}</h3>
              <div className="mt-1 text-xs font-bold text-white/95 drop-shadow-xs flex items-center gap-2">
                <span>🗓️ {selectedTrip.date}</span>
                <span>·</span>
                <span>⏰ {selectedTrip.time}</span>
              </div>
            </div>
          </div>
          <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setStep("done"); }}>
            <Field label={isAr ? "عدد المقاعد *" : "Number of Seats *"} value={seats} onChange={setSeats} type="number" required />

            <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#E6E1D6]">
              <div className="flex justify-between text-sm text-[#526078]">
                <span>{isAr ? "سعر المقعد" : "Seat Price"}</span>
                <span className="font-bold text-[#0B132B]">{selectedTrip.price.toLocaleString()} {isAr ? "د.ل" : "LYD"}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E6E1D6] flex justify-between items-center">
                <span className="font-black text-[#0B132B]">{isAr ? "الإجمالي" : "Total"}</span>
                <span className="text-2xl font-black text-[#D96B27]">{total.toLocaleString()} <span className="text-sm text-[#526078] font-bold">{isAr ? "د.ل" : "LYD"}</span></span>
              </div>
            </div>

            <button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft hover:-translate-y-0.5 transition">
              {isAr ? "تأكيد الحجز والدفع" : "Confirm Booking"}
            </button>
          </form>
        </div>
      )}

      {step === "done" && selectedTrip && (
        <div className="p-10 text-center" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-4xl">✅</div>
          <h3 className="mt-5 text-2xl font-black text-[#0B132B]">{isAr ? "تم تأكيد حجزك!" : "Booking Confirmed!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr ? `رقم الحجز #DL-${Math.floor(Math.random() * 90000 + 10000)}. تم تأكيد حجزك بنجاح وربطه بحسابك المسجل في المنصة.` : `Booking #DL-${Math.floor(Math.random() * 90000 + 10000)}. Your booking has been confirmed and linked to your registered account.`}
          </p>
          <button onClick={onClose} className="mt-6 px-6 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black shadow-soft">{isAr ? "تم" : "Done"}</button>
        </div>
      )}
    </Modal>
  );
}

export function PrivateTripModal({
  open,
  onClose,
  initialGuide,
}: {
  open: boolean;
  onClose: () => void;
  initialGuide?: string;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [step, setStep] = useState<"form" | "done">("form");
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("3");
  const [persons, setPersons] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [guideName, setGuideName] = useState(initialGuide || "");
  const [vehicleType, setVehicleType] = useState("luxury-coach");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (open) {
      setStep("form");
      setDestination("");
      setDays("3");
      setPersons("2");
      setStartDate("");
      setGuideName(initialGuide || "");
      setVehicleType("luxury-coach");
      let initialPhone = "0912345678";
      try {
        const storedUser = localStorage.getItem("dalni_user");
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          if (parsed.phone) initialPhone = parsed.phone;
        }
      } catch (e) {}
      setPhone(initialPhone);
    }
  }, [open, initialGuide]);

  return (
    <Modal open={open} onClose={onClose} size="lg">
      {step === "form" ? (
        <div dir={dir}>
          <div className="relative h-48 overflow-hidden bg-[#0B132B]">
            <img src={privateTripImg} alt="Private Trip VIP" className="absolute inset-0 w-full h-full object-cover brightness-105 animate-zoom-slow" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/85 via-[#0B132B]/30 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 text-xs font-black mb-1.5 backdrop-blur-sm">
                👑 {isAr ? "باقة VIP المخصصة لك تماماً" : "Tailored VIP Custom Package"}
              </div>
              <h3 className="text-2xl font-black">{isAr ? "طلب رحلة خاصة VIP" : "Request VIP Private Tour"}</h3>
            </div>
          </div>

          <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setStep("done"); }}>
            {guideName && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧭</span>
                  <div>
                    <span className="font-bold text-[#5A6A85] block text-[11px]">{isAr ? "المرشد السياحي المفضل المختَار:" : "Selected Guide:"}</span>
                    <span className="font-black text-[#0F172A] text-sm">{guideName}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#1B5A78] text-white text-[10px] font-bold">
                  {isAr ? "مرشد معتمد" : "Verified Guide"}
                </span>
              </div>
            )}

            <Field label={isAr ? "الوجهة / المعالم المطلوبة *" : "Destination / Heritage Sites *"} value={destination} onChange={setDestination} placeholder={isAr ? "غدامس، أوباري، أكاكوس..." : "Ghadames, Ubari, Acacus..."} required />

            {/* Select Tour Guide Option */}
            <div className="space-y-1">
              <label className="text-xs font-black text-[#5A6A85] block">
                {isAr ? "اختيار المرشد السياحي المفضل (اختياري):" : "Select Preferred Tour Guide (Optional):"}
              </label>
              <select
                value={guideName}
                onChange={(e) => setGuideName(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E8E2D6] bg-white text-xs font-bold text-[#0F172A] outline-none cursor-pointer focus:border-[#1B5A78]"
              >
                <option value="">{isAr ? "أي مرشد معتمد متاح (نخبة المرشدين)" : "Any available certified guide"}</option>
                <option value="د. عبد السلام المجدوب (خبير آثار لبدة وطابلس)">د. عبد السلام المجدوب (خبير آثار لبدة وطرابلس)</option>
                <option value="أ. مريم الفيتوري (دليلة الجبل الأخضر وشحات)">أ. مريم الفيتوري (دليلة الجبل الأخضر وشحات)</option>
                <option value="أ. طارق التواتي (خبير سفاري غدامس وأوباري)">أ. طارق التواتي (خبير سفاري غدامس وأوباري)</option>
                <option value="أ. يوسف الطوارقي (دليل صحراء أكاكوس وغات)">أ. يوسف الطوارقي (دليل صحراء أكاكوس وغات)</option>
                <option value="أ. هند الدرسي (مرافقة جولات التراث والمدينة القديمة)">أ. هند الدرسي (مرافقة جولات التراث والمدينة القديمة)</option>
              </select>
            </div>

            {/* Select Vehicle Type Option (باصات عادية، حافلات فاخرة، سيارات دفع رباعي) */}
            <div className="space-y-1">
              <label className="text-xs font-black text-[#5A6A85] block">
                {isAr ? "نوعية المركبة والسيارة المطلوبة للرحلة: *" : "Preferred Vehicle Type for the Trip: *"}
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-[#E8E2D6] bg-white text-xs font-bold text-[#0F172A] outline-none cursor-pointer focus:border-[#1B5A78]"
              >
                <option value="luxury-coach">
                  {isAr ? "🚌 مركبات وحافلات سياحية كبرى فاخرة VIP" : "Luxury VIP Large Coaches"}
                </option>
                <option value="standard-bus">
                  {isAr ? "🚐 باصات عادية مريحة ومكيفة" : "Standard Air-Conditioned Tourist Buses"}
                </option>
                <option value="4x4-suv">
                  {isAr ? "🚙 مجموعة من سيارات الدفع الرباعي 4x4 وسائقيها" : "Group of 4x4 Desert SUVs & Drivers"}
                </option>
                <option value="vip-sprinter">
                  {isAr ? "🚐 ميني باص VIP (مرسيدس سبرينتر فاخر)" : "VIP Sprinter Luxury Mini-Bus"}
                </option>
                <option value="vip-sedan">
                  {isAr ? "🚗 سيارات سيدان عائلية فاخرة خاصة VIP" : "Private Luxury Family Sedan"}
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label={isAr ? "عدد الأيام" : "Duration (Days)"} value={days} onChange={setDays} type="number" required />
              <Field label={isAr ? "عدد الأشخاص" : "Number of Travelers"} value={persons} onChange={setPersons} type="number" required />
            </div>
            <Field label={isAr ? "تاريخ الانطلاق *" : "Departure Date *"} value={startDate} onChange={setStartDate} type="date" required />

            <div className="p-3 rounded-xl bg-[#FAFAF8] border border-[#E6E1D6] text-xs text-[#526078]">
              👑 <b className="text-[#0B132B]">{isAr ? "ربط فوري بالحساب:" : "Linked to account:"}</b> {isAr ? "سيتم التواصل معك عبر رقم الهاتف والبريد المسجلين في حسابك." : "We will contact you via your registered account details."}
            </div>

            <button className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer">
              {isAr ? "إرسال طلب رحلة VIP للإدارة ✨" : "Submit VIP Private Tour Request ✨"}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-10 text-center" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 text-amber-600 grid place-items-center text-4xl">👑</div>
          <h3 className="mt-5 text-2xl font-black text-[#0B132B]">{isAr ? "تم استلام طلبك بنجاح!" : "Request Received Successfully!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr
              ? `رقم طلب الرحلة الخاصة #PR-${Math.floor(Math.random() * 90000 + 10000)}.` +
                (guideName ? ` تم تخصيص الطلب برفقة المرشد: (${guideName}).` : "") +
                ` ونوع المركبة: (${vehicleType === 'luxury-coach' ? 'حافلات فاخرة VIP' : vehicleType === 'standard-bus' ? 'باصات عادية' : vehicleType === '4x4-suv' ? 'مجموعة من سيارات الدفع الرباعي وسائقيها' : 'ميني باص VIP'}). سيتواصل معك مستشار السفر الخاص بنا خلال أقل من 24 ساعة لتجهيز المسار.`
              : `Private Tour Request #PR-${Math.floor(Math.random() * 90000 + 10000)}. Our dedicated travel consultant will contact you within 24h.`}
          </p>
          <button onClick={onClose} className="mt-6 px-8 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black shadow-soft cursor-pointer">
            {isAr ? "تم" : "Done"}
          </button>
        </div>
      )}
    </Modal>
  );
}

