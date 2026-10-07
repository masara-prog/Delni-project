import { useEffect, useState, useMemo, type ReactNode } from "react";
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
import privateTripImg from "@/assets/private-trip.jpg";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { getNearbyServices } from "@/lib/homeData";
import { TOUR_GUIDES_DATA, type TourGuide, formatWorkingDays } from "@/lib/guidesData";
import { LIBYAN_ATTRACTIONS, LIBYAN_CITIES, type AttractionItem } from "@/lib/attractionsData";

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
  availableSeats?: number;
  totalSeats?: number;
  busCapacity?: number;
  driverName?: string;
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

  // Determine bus capacity: strictly 25 or 50 passengers as requested
  const busCapacity = item.busCapacity
    ? (item.busCapacity >= 35 ? 50 : 25)
    : (item.totalSeats && item.totalSeats >= 35 ? 50 : (item.subtitle && (item.subtitle.includes("أسبوعية") || item.subtitle.includes("سفاري")) ? 50 : 25));

  // Determine available seats
  const maxAvailable = typeof item.availableSeats === "number" && item.availableSeats > 0
    ? Math.min(item.availableSeats, busCapacity)
    : (busCapacity === 50 ? 32 : 18);

  const numSeats = parseInt(seats, 10);
  const isSeatExceeded = !isNaN(numSeats) && numSeats > maxAvailable;
  const isSeatTooLow = isNaN(numSeats) || numSeats < 1;
  const hasSeatError = isSeatExceeded || isSeatTooLow;

  const unit = typeof item.price === "number" ? item.price : Number(String(item.price ?? "0").replace(/[^\d]/g, ""));
  const total = unit * (hasSeatError ? 0 : numSeats);
  const tripImage = item.image || item.img || resolveTripImage(item.title, item.subtitle);
  const slideshowImages = item.images || item.gallery || [tripImage];

  const handleSeatsChange = (val: string) => {
    setSeats(val);
  };

  const handleIncrement = () => {
    const current = parseInt(seats, 10) || 0;
    if (current < maxAvailable) {
      setSeats(String(current + 1));
    }
  };

  const handleDecrement = () => {
    const current = parseInt(seats, 10) || 1;
    if (current > 1) {
      setSeats(String(current - 1));
    }
  };

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
            onSubmit={(e) => {
              e.preventDefault();
              if (hasSeatError) return;
              if (!phone.match(/^09\d{8}$/)) return;
              setStep("success");
            }}
          >
            <div className="text-xs font-black text-primary">{isAr ? "إكمال الحجز · حساب مسجّل" : "Complete Booking · Registered Account"}</div>
            <h3 className="text-xl font-black text-foreground">{item.title}</h3>

            <div className="rounded-xl bg-[#F4F1EA] border border-[#E6E1D6] p-3 text-xs">
              <div className="font-black text-[#0B132B] mb-1">👤 {isAr ? `الحساب: ${accountName}` : `Account: ${accountName}`}</div>
              <div className="text-[#526078]">{isAr ? "بياناتك ورقم هاتفك المسجلين مسبقاً مرتبطان تلقائياً بهذا الحجز." : "Your registered account details and phone are automatically linked to this booking."}</div>
            </div>

            {/* Capacity & Driver Badge */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-sky-50/70 border border-blue-200/80 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-black text-[#003580] flex items-center gap-1.5 text-xs">
                  <span>🚌</span>
                  <span>{isAr ? `سعة الحافلة: ${busCapacity} راكب` : `Coach Capacity: ${busCapacity} Passengers`}</span>
                </span>
                <span className="font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] border border-emerald-200">
                  {isAr ? `المتاح للحجز: ${maxAvailable} مقعد` : `${maxAvailable} seats available`}
                </span>
              </div>
              <div className="text-[11px] text-slate-600 font-medium">
                {isAr
                  ? `مركبة سياحية معتمدة (${busCapacity === 50 ? "حافلة كبرى 50 راكب" : "ميني باص سياحي 25 راكب"}) بإشراف سائق مرخص.`
                  : `Certified tourist bus (${busCapacity} seats) with licensed driver.`}
              </div>
            </div>

            {/* Seats Input with Stepper and Validation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="font-black text-[#0F172A]">
                  {isAr ? "عدد المقاعد المراد حجزها *" : "Number of Seats *"}
                </label>
                <span className="text-[11px] text-slate-500 font-bold">
                  {isAr ? `الحد الأقصى: ${maxAvailable} مقاعد` : `Max: ${maxAvailable} seats`}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={numSeats <= 1}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-black text-lg transition flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={maxAvailable}
                  value={seats}
                  onChange={(e) => handleSeatsChange(e.target.value)}
                  className={`w-full h-11 px-4 text-center rounded-xl border-2 font-black text-base outline-none transition ${
                    hasSeatError
                      ? "border-red-400 bg-red-50/50 text-red-700 focus:border-red-500"
                      : "border-[#E8E2D6] bg-white text-[#0F172A] focus:border-[#D96B27]"
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={numSeats >= maxAvailable}
                  className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-black text-lg transition flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                >
                  +
                </button>
              </div>

              {/* Real-time Error Alert */}
              {isSeatExceeded && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-start gap-2 animate-in fade-in duration-200">
                  <span className="text-base leading-none">⚠️</span>
                  <div>
                    <span className="font-black block">{isAr ? "تجاوزت المقاعد المتاحة!" : "Seats limit exceeded!"}</span>
                    <span>
                      {isAr
                        ? `عذراً، المقاعد المتبقية المتاحة لهذه الرحلة هي (${maxAvailable}) مقاعد فقط من إجمالي سعة الحافلة (${busCapacity} راكب). يرجى تقليل العدد.`
                        : `Only ${maxAvailable} seats are available out of ${busCapacity} coach capacity.`}
                    </span>
                  </div>
                </div>
              )}

              {isSeatTooLow && (
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{isAr ? "يرجى تحديد مقعد واحد (1) على الأقل لإكمال الحجز." : "Please select at least 1 seat."}</span>
                </div>
              )}
            </div>

            <Field label={isAr ? "تاريخ الرحلة *" : "Trip Date *"} value={date} onChange={setDate} type="date" required />
            <Field 
              label={isAr ? "رقم الهاتف (الواتساب) *" : "Phone Number (WhatsApp) *"} 
              value={phone} 
              onChange={setPhone} 
              type="tel" 
              placeholder={isAr ? "مثال: 0912345678" : "e.g., 0912345678"} 
              required 
            />
            {phone && !phone.match(/^09\d{8}$/) && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{isAr ? "الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)" : "Please enter a valid Libyan phone number (e.g., 0912345678)"}</span>
              </div>
            )}

            {unit > 0 && !hasSeatError && (
              <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#E6E1D6]">
                <div className="flex justify-between text-sm text-[#526078]">
                  <span>{isAr ? "سعر المقعد" : "Seat Price"}</span>
                  <span className="font-bold text-[#0B132B]">{unit} {isAr ? "د.ل" : "LYD"}</span>
                </div>
                <div className="flex justify-between text-sm text-[#526078] mt-1">
                  <span>{isAr ? "عدد المقاعد" : "Seats"}</span>
                  <span className="font-bold text-[#0B132B]">× {numSeats}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[#E6E1D6] flex justify-between items-center">
                  <span className="font-black text-[#0B132B]">{isAr ? "السعر الإجمالي" : "Total Price"}</span>
                  <span className="text-2xl font-black text-[#D96B27]">{total.toLocaleString()} <span className="text-sm text-[#526078]">{isAr ? "د.ل" : "LYD"}</span></span>
                </div>
              </div>
            )}

            <button
              disabled={hasSeatError}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer"
            >
              {hasSeatError
                ? (isAr ? "حدد عدد مقاعد متاح للاستمرار" : "Select valid seats to continue")
                : (isAr ? "تأكيد الحجز (الدفع فيزيائي بموقع الشركة)" : "Confirm Booking (Pay at Company Office)")}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-8 text-center" dir={dir}>
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-3xl">✅</div>
          <h3 className="mt-4 text-2xl font-black text-[#0B132B]">{isAr ? "تم تسجيل حجزك المبدئي!" : "Booking Registered!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr
              ? `رقم الحجز #BK-${Math.floor(Math.random() * 90000 + 10000)}. تم حجز (${numSeats}) مقاعد على الحافلة سعة (${busCapacity} راكب). يرجى التوجه إلى مقر وموقع الشركة لإتمام الدفع الفيزيائي نقداً وتأكيد تذكرتك النهائية قبل موعد الانطلاق.`
              : `Booking ID #BK-${Math.floor(Math.random() * 90000 + 10000)}. (${numSeats}) seats booked on ${busCapacity}-passenger coach. Linked to your account.`}
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
  bookLabel?: string;
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
        {/* 1. ANIMATED HIGH QUALITY PHOTO SHOWCASE & SLIDESHOW (FIXED STABLE SIZE) */}
        <div className="relative w-full h-80 sm:h-96 md:h-[420px] overflow-hidden bg-slate-950 shrink-0">
          {/* Ambient Blurred Background for perfect clarity & zero distortion */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <img
              src={currentImg}
              alt=""
              className="w-full h-full object-cover blur-2xl opacity-40 scale-110"
              aria-hidden="true"
            />
          </div>

          {gallery.length > 1 ? (
            <HeroSlideshow
              images={gallery}
              alt={item.title}
              intervalMs={3500}
              brightness="brightness-95"
            />
          ) : (
            <img
              src={currentImg}
              alt={item.title}
              className="relative z-10 w-full h-full object-cover object-center animate-ken-burns-a brightness-95"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-black/30 pointer-events-none z-10" />

          {/* Quick Info & Photos Badge Overlay */}
          <div className="absolute bottom-14 sm:bottom-16 left-4 right-4 z-20 flex items-center justify-between text-white pointer-events-none">
            <span className="px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-amber-300 font-black text-xs border border-white/20 shadow-md">
              📸 {gallery.length > 1 ? (isAr ? `${gallery.length} صور متحركة` : `${gallery.length} Animated Photos`) : (isAr ? "معرض الصور" : "Photo Gallery")}
            </span>
          </div>

          {/* Visual Thumbnail Navigation Strip if multiple images */}
          {gallery.length > 1 && (
            <div className="absolute bottom-2 right-0 left-0 z-20 flex justify-center gap-2 px-4 overflow-x-auto py-1 pointer-events-auto">
              {gallery.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImg(idx)}
                  className={`w-14 h-9 sm:w-16 sm:h-10 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer shadow-md shrink-0 ${
                    activeImg === idx ? "border-amber-400 scale-105 ring-2 ring-amber-400/50" : "border-white/30 opacity-60 hover:opacity-100"
                  }`}
                  aria-label={`Photo ${idx + 1}`}
                >
                  <img src={p} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
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
                {item.bookLabel || (isAr ? "احجز الرحلة الآن 🚀" : "Book Trip Now 🚀")}
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
          <form
            className="p-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              const avail = selectedTrip ? (selectedTrip.seats - selectedTrip.taken) : 0;
              const n = parseInt(seats, 10);
              if (isNaN(n) || n < 1 || n > avail) return;
              setStep("done");
            }}
          >
            {/* Bus Capacity and Schedule Info */}
            {(() => {
              const avail = selectedTrip ? (selectedTrip.seats - selectedTrip.taken) : 0;
              const busCap = selectedTrip && selectedTrip.seats >= 35 ? 50 : 25;
              const n = parseInt(seats, 10);
              const isExceeded = !isNaN(n) && n > avail;
              const isLow = isNaN(n) || n < 1;
              const hasErr = isExceeded || isLow;

              return (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/90 to-sky-50/70 border border-blue-200/80 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#003580] flex items-center gap-1.5 text-xs">
                        <span>🚌</span>
                        <span>{isAr ? `سعة الحافلة: ${busCap} راكب` : `Coach: ${busCap} Seats`}</span>
                      </span>
                      <span className="font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] border border-emerald-200">
                        {isAr ? `المتاح للحجز: ${avail} مقعد` : `${avail} seats available`}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600 font-medium">
                      {isAr
                        ? `المرشد المرافق: ${selectedTrip.guide} · حافلة ${busCap === 50 ? "سياحية كبرى 50 راكب" : "ميني باص 25 راكب"}.`
                        : `Guide: ${selectedTrip.guide} · ${busCap}-passenger certified coach.`}
                    </div>
                  </div>

                  {/* Seat Stepper and Real-Time Error */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-black text-[#0F172A]">
                        {isAr ? "عدد المقاعد المراد حجزها *" : "Number of Seats *"}
                      </label>
                      <span className="text-[11px] text-slate-500 font-bold">
                        {isAr ? `المتاح: ${avail} مقاعد` : `Available: ${avail} seats`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(seats, 10) || 1;
                          if (cur > 1) setSeats(String(cur - 1));
                        }}
                        disabled={n <= 1}
                        className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-black text-lg transition flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={avail}
                        value={seats}
                        onChange={(e) => setSeats(e.target.value)}
                        className={`w-full h-11 px-4 text-center rounded-xl border-2 font-black text-base outline-none transition ${
                          hasErr
                            ? "border-red-400 bg-red-50/50 text-red-700 focus:border-red-500"
                            : "border-[#E8E2D6] bg-white text-[#0F172A] focus:border-[#D96B27]"
                        }`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const cur = parseInt(seats, 10) || 0;
                          if (cur < avail) setSeats(String(cur + 1));
                        }}
                        disabled={n >= avail}
                        className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-slate-800 font-black text-lg transition flex items-center justify-center cursor-pointer border border-slate-200 shrink-0"
                      >
                        +
                      </button>
                    </div>

                    {isExceeded && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-start gap-2">
                        <span className="text-base leading-none">⚠️</span>
                        <div>
                          <span className="font-black block">{isAr ? "تجاوزت المقاعد المتاحة!" : "Limit exceeded!"}</span>
                          <span>
                            {isAr
                              ? `عذراً، المقاعد المتبقية في هذا الموعد هي (${avail}) مقاعد فقط من أصل سعة الحافلة (${busCap} راكب).`
                              : `Only ${avail} seats left in this schedule out of ${busCap}.`}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {!hasErr && (
                    <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#E6E1D6]">
                      <div className="flex justify-between text-sm text-[#526078]">
                        <span>{isAr ? "سعر المقعد" : "Seat Price"}</span>
                        <span className="font-bold text-[#0B132B]">{selectedTrip.price.toLocaleString()} {isAr ? "د.ل" : "LYD"}</span>
                      </div>
                      <div className="mt-3 pt-3 border-t border-[#E6E1D6] flex justify-between items-center">
                        <span className="font-black text-[#0B132B]">{isAr ? "الإجمالي" : "Total"}</span>
                        <span className="text-2xl font-black text-[#D96B27]">{(selectedTrip.price * n).toLocaleString()} <span className="text-sm text-[#526078] font-bold">{isAr ? "د.ل" : "LYD"}</span></span>
                      </div>
                    </div>
                  )}

                  <button
                    disabled={hasErr}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer"
                  >
                    {hasErr
                      ? (isAr ? "يرجى تحديد مقاعد متاحة" : "Select valid seats")
                      : (isAr ? "تأكيد الحجز (الدفع فيزيائي بموقع الشركة)" : "Confirm Booking (Physical Payment at Office)")}
                  </button>
                </div>
              );
            })()}
          </form>
        </div>
      )}

      {step === "done" && selectedTrip && (
        <div className="p-10 text-center" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-4xl">✅</div>
          <h3 className="mt-5 text-2xl font-black text-[#0B132B]">{isAr ? "تم تسجيل حجزك المبدئي بنجاح!" : "Booking Registered!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr ? `رقم الحجز #DL-${Math.floor(Math.random() * 90000 + 10000)}. تم حجز (${seats}) مقاعد بنجاح مع المرشد (${selectedTrip.guide}). يرجى زيارة مقر وموقع الشركة لإتمام الدفع الفيزيائي وتثبيت الحجز النهائي قبل موعد الانطلاق.` : `Booking #DL-${Math.floor(Math.random() * 90000 + 10000)}. Your booking has been confirmed.`}
          </p>
          <button onClick={onClose} className="mt-6 px-6 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black shadow-soft cursor-pointer">{isAr ? "تم" : "Done"}</button>
        </div>
      )}
    </Modal>
  );
}

export function PrivateTripModal({
  open,
  onClose,
  initialGuide,
  initialDestination,
}: {
  open: boolean;
  onClose: () => void;
  initialGuide?: string;
  initialDestination?: string;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [step, setStep] = useState<"form" | "done">("form");
  const [destination, setDestination] = useState(initialDestination || "");
  const [selectedLandmarkIds, setSelectedLandmarkIds] = useState<string[]>(() => {
    if (!initialDestination) return ["leptis-magna"];
    const found = LIBYAN_ATTRACTIONS.find(
      (a) => a.name.includes(initialDestination) || initialDestination.includes(a.name) || (a.city && initialDestination.includes(a.city))
    );
    return found ? [found.id] : ["leptis-magna"];
  });
  const [landmarkCityFilter, setLandmarkCityFilter] = useState("all");
  const [days, setDays] = useState("3");
  const [persons, setPersons] = useState("4");
  const [startDate, setStartDate] = useState("");
  const [phone, setPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(() => {
    if (!initialGuide) return null;
    return TOUR_GUIDES_DATA.find((g) => g.name.includes(initialGuide) || initialGuide.includes(g.name)) || null;
  });
  const [guideName, setGuideName] = useState(initialGuide || "");
  const [vehicleId, setVehicleId] = useState("luxury-coach");
  const [isVehicleListOpen, setIsVehicleListOpen] = useState(false);
  const [isGuideListOpen, setIsGuideListOpen] = useState(false);
  const [guideCityFilter, setGuideCityFilter] = useState("all");

  // Vehicles with clear transparent daily rate
  const VEHICLE_OPTIONS = [
    {
      id: "luxury-coach",
      name: isAr ? "حافلة سياحية كبرى فاخرة VIP" : "Luxury VIP Large Coach",
      shortName: isAr ? "حافلة 50 راكب" : "50-Seat Coach",
      capacity: 50,
      pricePerDay: 750,
      icon: "🚍",
      desc: isAr ? "سعة 50 راكب، مكيفة بالكامل، شاشات عرض، مقاعد مريحة للوفود الكبيرة" : "50 seats, full AC, panoramic view for delegations",
    },
    {
      id: "minibus-25",
      name: isAr ? "ميني باص سياحي مكيف حديث" : "Modern Tourist Minibus",
      shortName: isAr ? "ميني باص 25 راكب" : "25-Seat Minibus",
      capacity: 25,
      pricePerDay: 450,
      icon: "🚐",
      desc: isAr ? "سعة 25 راكب، مرونة عالية وسرعة ومثالي للمجموعات المتوسطة" : "25 seats, fast & comfortable for medium groups",
    },
    {
      id: "4x4-suv",
      name: isAr ? "مركبة دفع رباعي 4x4 وسفاري صحراوية" : "4x4 Desert SUV Expedition Spec",
      shortName: isAr ? "دفع رباعي 4x4" : "4x4 Desert SUV",
      capacity: 6,
      pricePerDay: 350,
      icon: "🚙",
      desc: isAr ? "سعة 6 ركاب، مجهزة للرمال والمسارات الصحراوية والوعرة مع سائق محترف" : "6 seats, desert-equipped with veteran driver",
    },
    {
      id: "vip-sprinter",
      name: isAr ? "مرسيدس سبرينتر VIP مقاعد رجال أعمال" : "VIP Mercedes Sprinter Executive",
      shortName: isAr ? "سبرينتر VIP" : "Mercedes Sprinter",
      capacity: 14,
      pricePerDay: 550,
      icon: "🚐",
      desc: isAr ? "سعة 14 راكب، مقاعد جلدية فاخرة، واي فاي، ثلاجة، راحة استثنائية" : "14 seats luxury leather, wifi, minibar",
    },
    {
      id: "sedan-family",
      name: isAr ? "سيارة سيدان عائلية مريحة" : "Comfortable Family Sedan",
      shortName: isAr ? "سيدان عائلية" : "Family Sedan",
      capacity: 4,
      pricePerDay: 200,
      icon: "🚗",
      desc: isAr ? "سعة 4 ركاب، خصوصية تامة وتنقلات مرنة وسريعة بين المعالم" : "4 seats, maximum privacy and flexibility",
    },
  ];

  const selectedVehicle = VEHICLE_OPTIONS.find((v) => v.id === vehicleId) || VEHICLE_OPTIONS[0];
  const durationDays = Math.max(1, parseInt(days, 10) || 1);
  const numCompanions = parseInt(persons, 10) || 1;
  const vehicleCost = selectedVehicle.pricePerDay * durationDays;
  const guideCost = selectedGuide ? selectedGuide.pricePerDay * durationDays : 0;
  const ticketsCost = selectedLandmarkIds.length * 20 * numCompanions;
  const foodCost = 50 * numCompanions * durationDays;
  const hotelCost = durationDays > 1 ? (100 * numCompanions * (durationDays - 1)) : 0;
  
  const subtotal = vehicleCost + guideCost + ticketsCost + foodCost + hotelCost;
  const platformProfit = subtotal * 0.10;
  const totalEstimatedCost = subtotal + platformProfit;

  // Filtered Platform Attractions
  const availableLandmarks = useMemo(() => {
    if (landmarkCityFilter === "all") return LIBYAN_ATTRACTIONS;
    return LIBYAN_ATTRACTIONS.filter((a) => a.city.includes(landmarkCityFilter) || a.cityEn.toLowerCase().includes(landmarkCityFilter.toLowerCase()));
  }, [landmarkCityFilter]);

  // Selected Landmark Items
  const selectedLandmarks = useMemo(() => {
    return LIBYAN_ATTRACTIONS.filter((a) => selectedLandmarkIds.includes(a.id));
  }, [selectedLandmarkIds]);

  const toggleLandmark = (landmarkId: string) => {
    setSelectedLandmarkIds((prev) => {
      const exists = prev.includes(landmarkId);
      const next = exists ? prev.filter((id) => id !== landmarkId) : [...prev, landmarkId];
      const names = LIBYAN_ATTRACTIONS.filter((a) => next.includes(a.id)).map((a) => (isAr ? a.name : a.nameEn));
      setDestination(names.join(" • "));
      return next;
    });
  };

  const availableGuides = useMemo(() => {
    if (guideCityFilter === "all") return TOUR_GUIDES_DATA;
    return TOUR_GUIDES_DATA.filter((g) => g.primaryRegion.includes(guideCityFilter) || g.operatingRegions.some(r => r.includes(guideCityFilter)));
  }, [guideCityFilter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLandmarkIds.length === 0) {
      alert(isAr ? "يرجى اختيار معلم سياحي واحد على الأقل" : "Please select at least one landmark");
      return;
    }
    if (!phone.match(/^09\d{8}$/)) {
      alert(isAr ? "الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)" : "Please enter a valid Libyan phone number (e.g., 0912345678)");
      return;
    }
    // Send to Python FastAPI & MySQL Backend
    fetch("http://127.0.0.1:8000/api/trips/private", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: customerName || "عميل دلّني VIP",
        customer_phone: phone,
        preferred_start_date: startDate || new Date().toISOString().split("T")[0],
        duration_days: durationDays,
        number_of_companions: parseInt(persons, 10) || 1,
        customer_requirements: `المعالم: ${destination}. المركبة: ${selectedVehicle.name}. المرشد: ${selectedGuide ? selectedGuide.name : 'بدون مرشد'}. ملاحظات: ${notes}`
      })
    }).catch(() => {
      // Offline fallback
    });
    setStep("done");
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
    >
      {step === "form" ? (
        <div className="p-6 sm:p-8 space-y-6" dir={dir}>
          {/* Header Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-700/50 text-white shadow-lg">
            <div className="absolute inset-0 opacity-30 mix-blend-overlay">
              <img src={privateTripImg} alt="Private Tour" className="w-full h-full object-cover" />
            </div>
            <div className="relative p-5 sm:p-6 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  ✨ {isAr ? "خدمة الوفود والعائلات المخصصة VIP" : "Exclusive Custom Itinerary"}
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-2 text-white">
                  {isAr ? "صمّم رحلتك الخاصة بالمعالم التي تختارها" : "Design Your Bespoke Journey"}
                </h3>
                <p className="text-xs text-slate-300 mt-1 max-w-lg">
                  {isAr
                    ? "اختر المعالم السياحية المعتمدة في ليبيا، نوع المركبة المناسبة، والمرشد السياحي المفضل لديك مع تسعير فوري وشفاف."
                    : "Pick official platform landmarks, your vehicle of choice, and licensed guide with transparent daily pricing."}
                </p>
              </div>
              <div className="shrink-0 p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                <span className="text-[11px] block text-slate-300">{isAr ? "التكلفة التقديرية الحالية" : "Current Estimate"}</span>
                <span className="text-2xl font-black text-amber-300">{totalEstimatedCost} <span className="text-xs text-white">د.ل</span></span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. TOURIST ATTRACTIONS FROM PLATFORM (الاماكن السياحية من معالم المنصة المعتمدة) */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🏛️</span>
                    <span>{isAr ? "المعالم السياحية المستهدفة بالزيارة (من المنصة)" : "Target Platform Landmarks"}</span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      ({selectedLandmarkIds.length} {isAr ? "معالم مختارة" : "selected"})
                    </span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isAr
                      ? "اختر المعالم والآثار والمواقع الطبيعية الرسمية المسجلة بالمنصة لتضمينها بمسارك:"
                      : "Select from our curated verified Libyan heritage & scenic landmarks:"}
                  </p>
                </div>

                {/* Filter landmarks by city */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 whitespace-nowrap">{isAr ? "تصفية بالمدينة:" : "City:"}</span>
                  <select
                    value={landmarkCityFilter}
                    onChange={(e) => setLandmarkCityFilter(e.target.value)}
                    className="h-8 px-2.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 outline-none focus:border-[#D96B27]"
                  >
                    <option value="all">{isAr ? "🌐 كافة المدن والمناطق" : "All Cities"}</option>
                    <option value="طرابلس">{isAr ? "طرابلس" : "Tripoli"}</option>
                    <option value="الخمس">{isAr ? "الخمس (لبدة الكبرى)" : "Leptis Magna / Al-Khums"}</option>
                    <option value="شحات">{isAr ? "شحات وقورينا (الجبل الأخضر)" : "Cyrene / Shahhat"}</option>
                    <option value="صبراتة">{isAr ? "صبراتة" : "Sabratha"}</option>
                    <option value="غدامس">{isAr ? "غدامس القديمة" : "Ghadames"}</option>
                    <option value="أوباري">{isAr ? "أوباري والبحيرات" : "Ubari Lakes"}</option>
                    <option value="غات">{isAr ? "غات وتدرارت أكاكوس" : "Ghat & Acacus"}</option>
                    <option value="بنغازي">{isAr ? "بنغازي" : "Benghazi"}</option>
                  </select>
                </div>
              </div>

              {/* Landmark Dropdown Selector */}
              <div>
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      toggleLandmark(e.target.value);
                    }
                  }}
                  className="w-full h-11 px-3.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-[#D96B27]/40 focus:border-[#D96B27] text-slate-800 dark:text-slate-100 text-sm font-bold shadow-sm outline-none transition cursor-pointer"
                >
                  <option value="">
                    {isAr ? "➕ اضغط هنا لاختيار معلم سياحي وإضافته للمسار..." : "➕ Click to select a platform landmark to add..."}
                  </option>
                  {availableLandmarks.map((lm) => {
                    const isAlreadySelected = selectedLandmarkIds.includes(lm.id);
                    return (
                      <option key={lm.id} value={lm.id} disabled={isAlreadySelected}>
                        {isAlreadySelected ? "✓ " : "+ "}
                        {isAr ? lm.name : lm.nameEn} ({isAr ? lm.category : lm.categoryEn} - {isAr ? lm.city : lm.cityEn})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Selected Landmarks List (Badges/Chips with images) */}
              {selectedLandmarks.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-xs font-black text-slate-700 dark:text-slate-300">
                    {isAr ? "المسار المعتمد لرحلتك:" : "Your Selected Tour Route:"}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {selectedLandmarks.map((landmark) => (
                      <div
                        key={landmark.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={landmark.img}
                            alt={landmark.name}
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-900 dark:text-white truncate">
                              {isAr ? landmark.name : landmark.nameEn}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <span>📍 {isAr ? landmark.city : landmark.cityEn}</span>
                              <span>•</span>
                              <span className="text-[#D96B27] font-semibold">{isAr ? landmark.category : landmark.categoryEn}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleLandmark(landmark.id)}
                          className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 flex items-center justify-center shrink-0 transition text-sm cursor-pointer"
                          title={isAr ? "إزالة هذا المعلم" : "Remove"}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>{isAr ? "يرجى اختيار معلم سياحي واحد على الأقل من القائمة أعلاه لتأكيد طلب الرحلة." : "Please select at least one platform landmark."}</span>
                </div>
              )}

              {/* Quick Tags for Top Famous Libyan Platform Landmarks */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
                  {isAr ? "⚡ إضافة سريعة لأشهر معالم ليبيا بالمنصة:" : "⚡ Quick Add Famous Landmarks:"}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {LIBYAN_ATTRACTIONS.slice(0, 7).map((lm) => {
                    const isSelected = selectedLandmarkIds.includes(lm.id);
                    return (
                      <button
                        key={lm.id}
                        type="button"
                        onClick={() => toggleLandmark(lm.id)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold border transition flex items-center gap-1 cursor-pointer ${
                          isSelected
                            ? "bg-[#D96B27] text-white border-[#D96B27]"
                            : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#D96B27]"
                        }`}
                      >
                        <span>{isSelected ? "✓" : "+"}</span>
                        <span>{isAr ? lm.name : lm.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. VEHICLE SELECTION - COLLAPSIBLE LIST FORMAT (قائمة مدمجة ومريحة تختفي فور الاختيار لتقليل الزحمة) */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <div>
                  <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🚍</span>
                    <span>{isAr ? "نوع وسيلة النقل المخصصة" : "Dedicated Transport Vehicle"}</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isAr ? "مركبات سياحية مرخصة ومكيفة مع سائق محترف" : "Licensed tourist transport with professional driver"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsVehicleListOpen((prev) => !prev)}
                  className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-black text-[#D96B27] hover:bg-orange-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>{isVehicleListOpen ? (isAr ? "إغلاق القائمة ✕" : "Close ✕") : (isAr ? "تغيير المركبة 🔄" : "Change Vehicle 🔄")}</span>
                </button>
              </div>

              {/* CURRENT SELECTED VEHICLE SUMMARY (عرض مدمج بدون زحمة) */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-2xl grid place-items-center shrink-0 border border-orange-200 dark:border-orange-800">
                    {selectedVehicle.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        {selectedVehicle.name}
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {isAr ? `سعة حتى ${selectedVehicle.capacity} ركاب` : `Up to ${selectedVehicle.capacity} seats`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {selectedVehicle.desc}
                    </p>
                  </div>
                </div>

                <div className="text-left shrink-0 pl-2">
                  <span className="text-[10px] block text-slate-400 font-bold">{isAr ? "سعر اليوم" : "Daily Rate"}</span>
                  <span className="text-base font-black text-[#D96B27] whitespace-nowrap">
                    {selectedVehicle.pricePerDay} {isAr ? "د.ل / يوم" : "LYD/day"}
                  </span>
                </div>
              </div>

              {/* VEHICLE EXPANDABLE LIST - WHEN OPEN: CLICKING ANY OPTION SELECTS IT AND IMMEDIATELY CLOSES THE LIST */}
              {isVehicleListOpen && (
                <div className="mt-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#D96B27]/40 shadow-xl space-y-2">
                  <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs font-black text-slate-700 dark:text-slate-300">
                    <span>{isAr ? "اختر وسيلة النقل المناسبة من القائمة (ستختفي القائمة فور الاختيار):" : "Select vehicle from list (auto-collapses upon selection):"}</span>
                    <button
                      type="button"
                      onClick={() => setIsVehicleListOpen(false)}
                      className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {VEHICLE_OPTIONS.map((veh) => {
                      const isSelected = veh.id === vehicleId;
                      return (
                        <div
                          key={veh.id}
                          onClick={() => {
                            setVehicleId(veh.id);
                            setIsVehicleListOpen(false); // Collapses immediately upon selection as requested!
                          }}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-orange-50/70 dark:bg-orange-950/30 border-[#D96B27]"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-orange-300"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{veh.icon}</span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {veh.name}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                                  {veh.shortName}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {veh.desc}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-left">
                              <span className="font-black text-sm text-[#D96B27]">
                                {veh.pricePerDay} {isAr ? "د.ل" : "LYD"}
                              </span>
                              <span className="text-[10px] block text-slate-400">{isAr ? "لكل يوم" : "per day"}</span>
                            </div>
                            <button
                              type="button"
                              className={`px-3 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#D96B27] text-white"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              {isSelected ? "✓ " + (isAr ? "تم الاختيار" : "Selected") : (isAr ? "اختيار" : "Select")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. TOUR GUIDE SELECTION - COLLAPSIBLE FORMAT (يختفي فور الاختيار لتقليل الزحمة) */}
            <div className="rounded-2xl p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2.5">
                <div>
                  <label className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span>🧭</span>
                    <span>{isAr ? "المرشد السياحي المعتمد (اختياري)" : "Certified Tour Guide (Optional)"}</span>
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isAr ? "مرشدون محترفون مرخصون من وزارة السياحة الليبية" : "Licensed certified local guides with cultural expertise"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {selectedGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedGuide(null);
                        setGuideName("");
                      }}
                      className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                      title={isAr ? "المتابعة بسائق فقط بدون مرشد" : "Remove guide"}
                    >
                      {isAr ? "بدون مرشد ✕" : "No Guide ✕"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsGuideListOpen((prev) => !prev)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-black text-[#003580] dark:text-blue-400 hover:bg-blue-50 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <span>
                      {isGuideListOpen
                        ? (isAr ? "إغلاق القائمة ✕" : "Close ✕")
                        : selectedGuide
                        ? (isAr ? "تغيير المرشد 🔄" : "Change Guide 🔄")
                        : (isAr ? "اختيار مرشد سياحي 🧭" : "Pick a Guide 🧭")}
                    </span>
                  </button>
                </div>
              </div>

              {/* CURRENT SELECTED GUIDE SUMMARY OR NO-GUIDE STATE (عرض مدمج ومريح جداً) */}
              {selectedGuide ? (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedGuide.avatar}
                      alt={selectedGuide.name}
                      className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500 shrink-0"
                    />
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {selectedGuide.name}
                        </h4>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          ✓ {isAr ? "معتمد رسمياً" : "Certified"}
                        </span>
                        <span className="text-xs text-amber-500 font-bold">⭐ {selectedGuide.rating}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex-wrap">
                        <span>📍 {selectedGuide.primaryRegion}</span>
                        <span>•</span>
                        <span>🗣️ {selectedGuide.languages.map((l:any) => isAr ? l.nameAr : l.nameEn).join("، ")}</span>
                        <span>•</span>
                        <span>📅 {formatWorkingDays(selectedGuide.workingDays)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0 pl-2">
                    <span className="text-[10px] block text-slate-400 font-bold">{isAr ? "أجر المرشد" : "Guide Rate"}</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      {selectedGuide.pricePerDay} {isAr ? "د.ل / يوم" : "LYD/day"}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-xl shrink-0">
                      🚗
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                        {isAr ? "الرحلة حالياً بدون مرشد سياحي إضافي (تتضمن السائق فقط)" : "Tour currently with driver only (no dedicated guide)"}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {isAr ? "يمكنك إضافة مرشد سياحي خبير في أي وقت للحصول على جولة تاريخية وثقافية معمقة." : "You can optionally attach a certified guide anytime."}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsGuideListOpen(true)}
                    className="px-3 py-1.5 rounded-lg bg-[#003580] hover:bg-[#002660] text-white text-xs font-black transition cursor-pointer shrink-0"
                  >
                    {isAr ? "+ إضافة مرشد" : "+ Add Guide"}
                  </button>
                </div>
              )}

              {/* GUIDES EXPANDABLE LIST - WHEN OPEN: CLICKING ANY GUIDE IMMEDIATELY SELECTS AND COLLAPSES */}
              {isGuideListOpen && (
                <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#003580]/40 shadow-xl space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {isAr ? "اختر مرشدك المفضل (تختفي القائمة فور النقر):" : "Pick your guide (collapses upon click):"}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={guideCityFilter}
                        onChange={(e) => setGuideCityFilter(e.target.value)}
                        className="h-7 px-2 rounded-lg text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 outline-none"
                      >
                        <option value="all">{isAr ? "كافة المدن" : "All Cities"}</option>
                        <option value="طرابلس">{isAr ? "طرابلس" : "Tripoli"}</option>
                        <option value="شحات">{isAr ? "شحات / الجبل الأخضر" : "Shahhat"}</option>
                        <option value="غدامس">{isAr ? "غدامس" : "Ghadames"}</option>
                        <option value="صبراتة">{isAr ? "صبراتة" : "Sabratha"}</option>
                        <option value="بنغازي">{isAr ? "بنغازي" : "Benghazi"}</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => setIsGuideListOpen(false)}
                        className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer px-1"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {/* Option to clear guide */}
                    <div
                      onClick={() => {
                        setSelectedGuide(null);
                        setGuideName("");
                        setIsGuideListOpen(false); // Collapses immediately
                      }}
                      className="p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400"
                    >
                      <div className="flex items-center gap-2">
                        <span>❌</span>
                        <span>{isAr ? "المتابعة بدون مرشد سياحي (السائق فقط - توفير أجر المرشد)" : "Continue with driver only (No guide)"}</span>
                      </div>
                      <span className="text-emerald-600 font-black">{isAr ? "0 د.ل" : "0 LYD"}</span>
                    </div>

                    {availableGuides.map((guide) => {
                      const isSelected = selectedGuide?.id === guide.id;
                      return (
                        <div
                          key={guide.id}
                          onClick={() => {
                            setSelectedGuide(guide);
                            setGuideName(`${guide.name} (${guide.title})`);
                            setIsGuideListOpen(false); // Collapses immediately upon selection as requested!
                          }}
                          className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? "bg-blue-50/70 dark:bg-blue-950/40 border-[#003580]"
                              : "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-blue-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={guide.avatar}
                              alt={guide.name}
                              className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {guide.name}
                                </span>
                                <span className="text-[10px] text-amber-500 font-bold">⭐ {guide.rating}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                📍 {guide.primaryRegion} • 🗣️ {guide.languages.map((l:any) => isAr ? l.nameAr : l.nameEn).join("، ")}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                📅 {formatWorkingDays(guide.workingDays)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-left">
                              <span className="font-black text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                                {guide.pricePerDay} {isAr ? "د.ل" : "LYD"}
                              </span>
                              <span className="text-[10px] block text-slate-400">{isAr ? "لكل يوم" : "per day"}</span>
                            </div>
                            <button
                              type="button"
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition cursor-pointer ${
                                isSelected
                                  ? "bg-[#003580] text-white"
                                  : "bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              {isSelected ? "✓ " + (isAr ? "مختار" : "Selected") : (isAr ? "اختيار" : "Select")}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 4. DURATION, TRAVELERS & DATE */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  ⏱️ {isAr ? "مدة الرحلة (بالأيام)" : "Duration (Days)"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={days}
                    onChange={(e) => setDays(e.target.value)}
                    className="w-full h-11 px-3 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm outline-none focus:border-[#D96B27]"
                    required
                  />
                  <span className="text-xs text-slate-500 font-bold whitespace-nowrap">{isAr ? "أيام" : "days"}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  👥 {isAr ? "عدد الأفراد المتوقع" : "Persons"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max={selectedVehicle.capacity}
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                    className="w-full h-11 px-3 text-center rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-black text-sm outline-none focus:border-[#D96B27]"
                    required
                  />
                  <span className="text-xs text-slate-500 font-bold whitespace-nowrap">{isAr ? "أفراد" : "pax"}</span>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  📅 {isAr ? "تاريخ الانطلاق المقترح" : "Start Date"}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-[#D96B27]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  👤 {isAr ? "الاسم الكامل" : "Full Name"}
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={isAr ? "الاسم" : "Name"}
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-[#D96B27]"
                  required
                  pattern="^[\u0600-\u06FF\sA-Za-z]+$"
                  title={isAr ? "الاسم يجب أن يحتوي على حروف فقط (عربي/إنجليزي)" : "Name must contain only letters"}
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                  📞 {isAr ? "رقم الهاتف (واتساب)" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs outline-none focus:border-[#D96B27]"
                  required
                />
                {phone && !phone.match(/^09\d{8}$/) && (
                  <p className="text-[10px] text-red-500 font-bold mt-1">
                    {isAr ? "الرجاء إدخال رقم هاتف ليبي صحيح" : "Valid Libyan phone required"}
                  </p>
                )}
              </div>
            </div>

            {/* Additional notes */}
            <div>
              <label className="block text-xs font-black text-slate-700 dark:text-slate-300 mb-1">
                📝 {isAr ? "ملاحظات أو متطلبات خاصة (فنادق، تصاريح، مسارات فرعية)" : "Special Requests or Notes"}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={isAr ? "أية تفاصيل إضافية تود إبلاغ إدارة المنصة بها لتجهيز الرحلة..." : "Any specific preferences..."}
                rows={2}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-xs outline-none focus:border-[#D96B27] resize-none"
              />
            </div>

            {/* 5. TRANSPARENT PRICING BREAKDOWN */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#003580] to-slate-950 text-white shadow-xl space-y-3 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="text-xs text-slate-300 font-bold">
                  {isAr ? "تفاصيل التسعير التقديري الشفاف بالوقت الفعلي:" : "Transparent Real-Time Pricing Summary:"}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 font-black">
                  {durationDays} {isAr ? "أيام" : "days"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-200">
                <div className="flex justify-between items-center">
                  <span>
                    🚘 {selectedVehicle.name} ({selectedVehicle.pricePerDay} د.ل × {durationDays} يوم):
                  </span>
                  <span className="font-mono font-black text-white">{vehicleCost} د.ل</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>
                    🧭 {selectedGuide ? `${isAr ? "المرشد السياحي" : "Guide"} (${selectedGuide.name}) (${selectedGuide.pricePerDay} د.ل × ${durationDays} يوم):` : (isAr ? "المرشد السياحي (بدون مرشد مخصص):" : "Guide (None):")}
                  </span>
                  <span className="font-mono font-black text-white">{guideCost} د.ل</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>🎟️ {isAr ? "تذاكر المعالم (مقدرة)" : "Tickets (Est.)"}:</span>
                  <span className="font-mono font-black text-white">{ticketsCost} د.ل</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>🍔 {isAr ? "مصاريف الإعاشة والمأكولات" : "Food & Meals"}:</span>
                  <span className="font-mono font-black text-white">{foodCost} د.ل</span>
                </div>

                {hotelCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span>🏨 {isAr ? "حجز الفنادق (مقدر)" : "Hotels (Est.)"}:</span>
                    <span className="font-mono font-black text-white">{hotelCost} د.ل</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t border-white/10 text-emerald-300">
                  <span className="flex items-center gap-1.5">
                    <span>💼</span>
                    <span className="font-bold">{isAr ? "نسبة المنصة (10%)" : "Platform Fee (10%)"}:</span>
                  </span>
                  <span className="font-mono font-black">{platformProfit} د.ل</span>
                </div>
              </div>

              {/* تنبيه شفاف حول تسعيرات الأدمن */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] leading-relaxed text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 text-sm shrink-0">⚖️</span>
                <span>
                  {isAr
                    ? "تنبيه التسعير: تكلفة المركبة والمرشد أعلاه تمثل تسعيرة تشغيلية مبدئية، وتخضع الرحلات الخاصة VIP لتسعيرات إضافية واعتماد يحدده مسؤول إدارة المنصة (Admin) وفق متطلبات المسار والتصاريح والخدمات الميدانية."
                    : "Pricing Notice: Vehicle and guide rates represent the baseline. The final comprehensive itinerary quotation is reviewed, customized, and finalized by the Platform Admin."}
                </span>
              </div>

              <div className="pt-2.5 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-300 block">{isAr ? "المجموع التقديري المبدئي:" : "Total Estimated Cost:"}</span>
                  <span className="text-[10px] text-amber-300 font-bold">{isAr ? "شامل جميع المصاريف ونسبة المنصة" : "Including all expenses & fee"}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {totalEstimatedCost} <span className="text-sm text-white">د.ل</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={selectedLandmarkIds.length === 0}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition cursor-pointer text-sm"
            >
              {isAr ? "إرسال وتأكيد طلب رحلة VIP للإدارة ✨" : "Submit VIP Private Tour Request ✨"}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-8 sm:p-10 text-center" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 text-amber-600 grid place-items-center text-4xl shadow-md">👑</div>
          <h3 className="mt-5 text-2xl font-black text-[#0B132B] dark:text-white">{isAr ? "تم استلام طلب الرحلة الخاصة VIP بنجاح!" : "Request Received Successfully!"}</h3>
          
          <div className="mt-4 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 max-w-lg mx-auto text-right text-xs space-y-2">
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "رقم الطلب:" : "Order #:"}</span>
              <span className="font-mono font-black text-[#003580] dark:text-blue-400">#PR-{Math.floor(Math.random() * 90000 + 10000)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المعالم السياحية المختارة بالمنصة:" : "Platform Landmarks:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200 max-w-[280px] truncate">{destination || (isAr ? "معالم مختارة بالمنصة" : "Platform Landmarks")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المركبة المختارة:" : "Selected Vehicle:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{selectedVehicle.name} ({selectedVehicle.pricePerDay} د.ل/يوم)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المرشد السياحي:" : "Tour Guide:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{selectedGuide ? `${selectedGuide.name} (${selectedGuide.pricePerDay} د.ل/يوم)` : (isAr ? "بدون مرشد (سائق فقط)" : "Driver only")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "طريقة الدفع والسداد:" : "Payment Method:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{isAr ? "دفع فيزيائي نقداً بمقر وموقع الشركة" : "Physical Payment at Company Office"}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "تسعيرات واعتماد الإدارة (Admin):" : "Admin Quotation Status:"}</span>
              <span className="font-black text-amber-600 dark:text-amber-400">{isAr ? "قيد المراجعة وتحديد التسعيرة النهائية من الأدمن" : "Pending Admin Review & Final Quote"}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm">
              <span className="text-slate-700 dark:text-slate-300 font-black">{isAr ? "التكلفة المبدئية (مركبة + مرشد):" : "Baseline Estimate:"}</span>
              <span className="font-black text-[#D96B27]">{totalEstimatedCost} د.ل ({durationDays} {isAr ? "أيام" : "days"})</span>
            </div>
          </div>

          <p className="mt-4 text-[#526078] dark:text-slate-300 text-xs max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "تم إرسال تفاصيل المعالم والمركبة والمرشد لإدارة المنصة (Admin). سيقوم مسؤول الرحلات بتدقيق المسار وتحديد التسعيرة النهائية المعتمدة والتواصل معك هاتفياً وعبر واتساب لتأكيد الحجز."
              : "Your request has been routed to the Platform Admin. Our travel specialist will review logistics, finalize the quotation, and contact you directly."}
          </p>
          <button onClick={onClose} className="mt-6 px-8 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black shadow-soft cursor-pointer">
            {isAr ? "تم" : "Done"}
          </button>
        </div>
      )}
    </Modal>
  );
}
