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
                : (isAr ? "تأكيد واستكمال الحجز" : "Confirm & Complete Booking")}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-8 text-center" dir={dir}>
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-3xl">✅</div>
          <h3 className="mt-4 text-2xl font-black text-[#0B132B]">{isAr ? "تم إرسال وتأكيد الحجز!" : "Booking Confirmed!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr
              ? `رقم الحجز #BK-${Math.floor(Math.random() * 90000 + 10000)}. تم حجز (${numSeats}) مقاعد على الحافلة سعة (${busCapacity} راكب). تم ربط الحجز بحسابك المسجل بنجاح وسيتواصل معك السائق أو المرشد في الموعد.`
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
                      : (isAr ? "تأكيد الحجز والدفع" : "Confirm Booking")}
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
          <h3 className="mt-5 text-2xl font-black text-[#0B132B]">{isAr ? "تم تأكيد حجزك!" : "Booking Confirmed!"}</h3>
          <p className="mt-2 text-[#526078] text-sm">
            {isAr ? `رقم الحجز #DL-${Math.floor(Math.random() * 90000 + 10000)}. تم حجز (${seats}) مقاعد بنجاح مع المرشد (${selectedTrip.guide}) وربطه بحسابك المسجل في المنصة.` : `Booking #DL-${Math.floor(Math.random() * 90000 + 10000)}. Your booking has been confirmed.`}
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
  const [cityFilter, setCityFilter] = useState("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [days, setDays] = useState("3");
  const [persons, setPersons] = useState("2");
  const [startDate, setStartDate] = useState("");
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
  const [guideName, setGuideName] = useState(initialGuide || "");
  const [vehicleId, setVehicleId] = useState("luxury-coach");
  const [showAllGuides, setShowAllGuides] = useState(false);

  // Libyan Cities and Tourism Regions for Filtering
  const CITIES_FILTER = [
    { id: "all", label: isAr ? "🌐 كافة المدن والوجهات" : "All Cities", key: "" },
    { id: "tripoli", label: isAr ? "طرابلس وضواحيها" : "Tripoli", key: "طرابلس" },
    { id: "leptis", label: isAr ? "لبدة الكبرى والخمس" : "Leptis Magna", key: "لبدة" },
    { id: "sabratha", label: isAr ? "صبراتة والساحل الغربي" : "Sabratha", key: "صبراتة" },
    { id: "cyrene", label: isAr ? "شحات وقورينا (الجبل الأخضر)" : "Cyrene", key: "شحات" },
    { id: "benghazi", label: isAr ? "بنغازي والمنطقة الشرقية" : "Benghazi", key: "بنغازي" },
    { id: "ghadames", label: isAr ? "غدامس القديمة (الواحات)" : "Ghadames", key: "غدامس" },
    { id: "ubari", label: isAr ? "أوباري والبحيرات وفزان" : "Ubari", key: "أوباري" },
    { id: "acacus", label: isAr ? "جبال تدرارت أكاكوس وغات" : "Acacus", key: "أكاكوس" },
  ];

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
      pricePerDay: 500,
      icon: "🚐",
      desc: isAr ? "سعة 14 راكب، مقاعد طيارة فارهة، ثلاجة ضيافة، إنترنت ورفاهية قصوى" : "14 executive seats, luxury amenities",
    },
    {
      id: "vip-sedan",
      name: isAr ? "سيارة سيدان عائلية فاخرة خاصة" : "Private Luxury Family Sedan",
      shortName: isAr ? "سيدان عائلية خاصة" : "Private Sedan",
      capacity: 4,
      pricePerDay: 200,
      icon: "🚗",
      desc: isAr ? "سعة 4 ركاب، خصوصية تامة وتنقلات مرنة وسريعة بين المعالم" : "4 seats, maximum privacy and flexibility",
    },
  ];

  // Popular Libyan destinations quick tags
  const POPULAR_DESTINATIONS = [
    { label: isAr ? "لبدة الكبرى (الخمس)" : "Leptis Magna", key: "لبدة", cityId: "leptis" },
    { label: isAr ? "بحيرات أوباري وفزان" : "Ubari Lakes", key: "أوباري", cityId: "ubari" },
    { label: isAr ? "غدامس القديمة (لؤلؤة الصحراء)" : "Ghadames", key: "غدامس", cityId: "ghadames" },
    { label: isAr ? "صبراتة والمسرح الروماني" : "Sabratha", key: "صبراتة", cityId: "sabratha" },
    { label: isAr ? "شحات وقورينا (الجبل الأخضر)" : "Cyrene", key: "شحات", cityId: "cyrene" },
    { label: isAr ? "جبال تدرارت أكاكوس وغات" : "Acacus", key: "أكاكوس", cityId: "acacus" },
    { label: isAr ? "طرابلس والمدينة القديمة" : "Tripoli", key: "طرابلس", cityId: "tripoli" },
    { label: isAr ? "بنغازي والمنطقة الشرقية" : "Benghazi", key: "بنغازي", cityId: "benghazi" },
  ];

  // Calculate day of the week from startDate
  const getDayName = (dateStr: string) => {
    if (!dateStr) return "";
    const dateObj = new Date(dateStr);
    const daysAr = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
    const daysEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return isAr ? daysAr[dateObj.getDay()] : daysEn[dateObj.getDay()];
  };

  const selectedDayName = getDayName(startDate);

  useEffect(() => {
    if (open) {
      setStep("form");
      setDestination(initialDestination || "");
      setCityFilter("all");
      setDayFilter("all");
      setDays("3");
      setPersons("2");
      setStartDate("");
      setVehicleId("luxury-coach");
      setShowAllGuides(false);
      if (initialGuide) {
        setGuideName(initialGuide);
        const match = TOUR_GUIDES_DATA.find(g => g.name === initialGuide || initialGuide.includes(g.name));
        setSelectedGuide(match || null);
      } else {
        setGuideName("");
        setSelectedGuide(null);
      }
    }
  }, [open, initialGuide, initialDestination]);

  // Selected vehicle object
  const selectedVehicle = VEHICLE_OPTIONS.find(v => v.id === vehicleId) || VEHICLE_OPTIONS[0];

  // Real-time dynamic calculation
  const durationDays = Math.max(1, parseInt(days) || 1);
  const guideDailyRate = selectedGuide ? selectedGuide.pricePerDay : 0;
  const vehicleDailyRate = selectedVehicle.pricePerDay;
  const totalDailyRate = guideDailyRate + vehicleDailyRate;
  const totalEstimatedCost = totalDailyRate * durationDays;

  // Dynamic Guides Filtering by City, Destination, and Working Days
  const filteredGuides = useMemo(() => {
    const destTerm = destination.trim().toLowerCase();
    const effectiveDay = dayFilter !== "all" ? dayFilter : selectedDayName;

    return TOUR_GUIDES_DATA.filter((g) => {
      // 1. City / Region Filter Match
      let cityMatch = true;
      if (cityFilter !== "all") {
        cityMatch = g.primaryRegion === cityFilter || g.operatingRegions.includes(cityFilter);
      }

      // 2. Destination text match
      let destMatch = true;
      if (destTerm) {
        destMatch =
          g.primaryRegion.toLowerCase().includes(destTerm) ||
          g.operatingRegions.some(r => r.toLowerCase().includes(destTerm)) ||
          g.specialties.some(s => s.toLowerCase().includes(destTerm)) ||
          g.bio.toLowerCase().includes(destTerm) ||
          g.title.toLowerCase().includes(destTerm);
      }

      // 3. Day of week match
      let dayMatch = true;
      if (effectiveDay) {
        dayMatch =
          g.workingDays.includes("طوال أيام الأسبوع") ||
          g.workingDays.some(wd => wd.includes(effectiveDay));
      }

      return cityMatch && destMatch && dayMatch;
    });
  }, [destination, cityFilter, dayFilter, selectedDayName]);

  const guidesToDisplay = showAllGuides ? TOUR_GUIDES_DATA : (filteredGuides.length > 0 ? filteredGuides : TOUR_GUIDES_DATA);

  return (
    <Modal open={open} onClose={onClose} size="xl">
      {step === "form" ? (
        <div dir={dir} className="max-h-[88vh] overflow-y-auto">
          {/* Header Banner */}
          <div className="relative h-44 sm:h-52 overflow-hidden bg-[#0B132B]">
            <img src={privateTripImg} alt="Private Trip VIP" className="absolute inset-0 w-full h-full object-cover brightness-105 animate-zoom-slow" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B]/95 via-[#0B132B]/50 to-transparent" />
            <div className="absolute bottom-4 right-4 left-4 text-white">
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 text-xs font-black mb-1.5 backdrop-blur-sm">
                👑 {isAr ? "خدمة الرحلات الخاصة المخصصة بالكامل" : "Tailored VIP Custom Expedition"}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black drop-shadow-md">
                {isAr ? "إنشاء رحلة خاصة حسب رغبتك" : "Create Custom Private Trip"}
              </h3>
              <p className="text-xs text-slate-200 mt-1 max-w-2xl font-medium">
                {isAr
                  ? "مرونة كاملة: حدد المدينة والوجهة، واختر المركبة المناسبة بسعرها اليومي الشفاف، والمرشد السياحي المعتمد المفضل، واطلع على إجمالي التكلفة فورياً."
                  : "Filter by city and days, choose your vehicle and certified guide with clear daily rates, and view instant price calculation."}
              </p>
            </div>
          </div>

          <form className="p-5 sm:p-7 space-y-6" onSubmit={(e) => { e.preventDefault(); setStep("done"); }}>
            
            {/* 1. CITY FILTER & DESTINATION SELECTION */}
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-xs font-black text-[#0F172A] dark:text-white flex items-center gap-1.5">
                  <span>📍</span>
                  <span>{isAr ? "تصفية الوجهة والمدينة المستهدفة للرحلة: *" : "Target City & Destination: *"}</span>
                </label>
                <span className="text-[11px] font-bold text-slate-500">
                  {isAr ? "فلترة المرشدين والمركبات المتاحة حسب المدينة" : "Filters guides & vehicles by region"}
                </span>
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {CITIES_FILTER.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCityFilter(c.id);
                      if (c.key) setDestination(c.key);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer border ${
                      cityFilter === c.id
                        ? "bg-[#003580] text-white border-[#003580] shadow-sm"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#003580]/40"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Custom Destination Input */}
              <div className="pt-2">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={isAr ? "أو اكتب المعالم المحددة (مثلاً: لبدة الكبرى، المسرح الروماني، أوباري، غدامس...)" : "Or enter specific attractions..."}
                  className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:border-[#D96B27]"
                  required
                />
              </div>

              {/* Quick Landmark Suggestions */}
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-black text-slate-400">
                  {isAr ? "معالم سياحية مقترحة:" : "Suggested Landmarks:"}
                </span>
                {POPULAR_DESTINATIONS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    onClick={() => {
                      setDestination(d.key);
                      setCityFilter(d.cityId);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer border ${
                      destination.includes(d.key)
                        ? "bg-amber-500 text-slate-950 font-black border-amber-600"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. DURATION, DATE & WORKING DAYS FILTER */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-black text-[#0F172A] dark:text-white block">
                  {isAr ? "تاريخ الانطلاق: *" : "Departure Date: *"}
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-[#E8E2D6] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white outline-none focus:border-[#D96B27]"
                  required
                />
                {selectedDayName && (
                  <div className="text-[11px] font-black text-[#003580] dark:text-blue-400 pt-0.5">
                    🗓️ {isAr ? `يوم الانطلاق: ${selectedDayName}` : `Departure Day: ${selectedDayName}`}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-black text-[#0F172A] dark:text-white block">
                  {isAr ? "أيام العمل المفضلة للرحلة:" : "Working Days Filter:"}
                </label>
                <select
                  value={dayFilter}
                  onChange={(e) => setDayFilter(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-[#E8E2D6] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-[#0F172A] dark:text-white outline-none cursor-pointer focus:border-[#003580]"
                >
                  <option value="all">{isAr ? "🌐 كافة أيام الأسبوع" : "All Weekdays"}</option>
                  <option value="السبت">{isAr ? "يوم السبت" : "Saturday"}</option>
                  <option value="الأحد">{isAr ? "يوم الأحد" : "Sunday"}</option>
                  <option value="الاثنين">{isAr ? "يوم الاثنين" : "Monday"}</option>
                  <option value="الثلاثاء">{isAr ? "يوم الثلاثاء" : "Tuesday"}</option>
                  <option value="الأربعاء">{isAr ? "يوم الأربعاء" : "Wednesday"}</option>
                  <option value="الخميس">{isAr ? "يوم الخميس" : "Thursday"}</option>
                  <option value="الجمعة">{isAr ? "يوم الجمعة" : "Friday"}</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Field label={isAr ? "عدد الأيام" : "Days"} value={days} onChange={setDays} type="number" required />
                <Field label={isAr ? "المسافرون" : "Travelers"} value={persons} onChange={setPersons} type="number" required />
              </div>
            </div>

            {/* 3. VEHICLE SELECTION WITH DAILY RATE (سعر اليوم للمركبة) */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🚌</span>
                  <h4 className="text-sm font-black text-[#0F172A] dark:text-white">
                    {isAr ? "اختيار المركبة المناسبة وسعرها لليوم الواحد:" : "Select Vehicle & Daily Rate:"}
                  </h4>
                </div>
                <span className="text-xs font-bold text-[#D96B27]">
                  {isAr ? "تسعير يومي شفاف ومحدد سلفاً" : "Transparent Daily Vehicle Pricing"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {VEHICLE_OPTIONS.map((v) => {
                  const isSelected = vehicleId === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setVehicleId(v.id)}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2 relative ${
                        isSelected
                          ? "border-[#D96B27] bg-orange-50/50 dark:bg-orange-950/20 shadow-sm ring-2 ring-[#D96B27]/30"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#003580]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{v.icon}</span>
                          <div>
                            <div className="font-black text-xs text-slate-900 dark:text-white">{v.shortName}</div>
                            <div className="text-[10px] text-slate-500 font-bold">👥 {v.capacity} {isAr ? "راكب" : "seats"}</div>
                          </div>
                        </div>

                        {/* Vehicle Daily Price Badge */}
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-[#D96B27]">
                            {v.pricePerDay} <span className="text-[10px] font-bold text-slate-500">د.ل / {isAr ? "يوم" : "day"}</span>
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-snug">
                        {v.desc}
                      </p>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] font-bold text-slate-400">
                          {isAr ? `إجمالي المركبة (${durationDays} أيام):` : "Vehicle Total:"}
                        </span>
                        <span className="font-black text-slate-900 dark:text-white text-xs">
                          {v.pricePerDay * durationDays} د.ل
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4. CERTIFIED TOUR GUIDE SELECTION WITH DAILY RATE (سعر اليوم للمرشد) */}
            <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🧭</span>
                    <h4 className="text-sm font-black text-[#0F172A] dark:text-white">
                      {isAr ? "اختيار المرشد السياحي المعتمد وسعره لليوم الواحد:" : "Select Certified Guide & Daily Rate:"}
                    </h4>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    {destination || cityFilter !== "all" || dayFilter !== "all" || startDate
                      ? (isAr ? `مطابقة للمدينة والوجهة المحددة مع أيام العمل المتاحة` : "Filtered by destination & working days")
                      : (isAr ? "عرض نخبة المرشدين المعتمدين بالمنصة" : "Showing all verified guides")}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    {guidesToDisplay.length} {isAr ? "مرشد متاح" : "guides"}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAllGuides(!showAllGuides)}
                    className="text-xs text-[#003580] hover:underline font-bold"
                  >
                    {showAllGuides ? (isAr ? "عرض المطابقين فقط" : "Show Filtered") : (isAr ? "عرض الكل" : "Show All")}
                  </button>
                </div>
              </div>

              {/* Selected Guide Banner */}
              {selectedGuide && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <img src={selectedGuide.avatar} alt={selectedGuide.name} className="w-12 h-12 rounded-xl object-cover border border-amber-500/30" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-[#0F172A] dark:text-white text-sm">{selectedGuide.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                          ✓ {isAr ? "تم اختياره لرحلتك" : "Selected"}
                        </span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-300 text-[11px] font-bold mt-0.5">{selectedGuide.title}</div>
                      <div className="text-[10px] text-slate-500 font-bold flex items-center gap-2 mt-0.5">
                        <span>⭐ {selectedGuide.rating}</span>
                        <span>·</span>
                        <span>⏳ {selectedGuide.experienceYears} {isAr ? "سنوات خبرة" : "yrs"}</span>
                        <span>·</span>
                        <span className="text-[#D96B27] font-black">
                          💰 {selectedGuide.pricePerDay} {isAr ? "د.ل / يوم" : "LYD / day"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setSelectedGuide(null); setGuideName(""); }}
                    className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-bold text-xs cursor-pointer"
                  >
                    {isAr ? "إلغاء التحديد" : "Deselect"}
                  </button>
                </div>
              )}

              {/* Guide Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto p-1">
                {guidesToDisplay.map((guide: TourGuide) => {
                  const isSelected = selectedGuide?.id === guide.id || guideName.includes(guide.name);
                  return (
                    <div
                      key={guide.id}
                      onClick={() => {
                        setSelectedGuide(guide);
                        setGuideName(`${guide.name} (${guide.title})`);
                      }}
                      className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                        isSelected
                          ? "border-[#D96B27] bg-[#D96B27]/5 shadow-sm ring-2 ring-[#D96B27]/20"
                          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-[#003580]/40 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={guide.avatar}
                          alt={guide.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 flex-wrap">
                            <span className="font-black text-xs text-[#0F172A] dark:text-white truncate">{guide.name}</span>
                            <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                              ✓ {guide.licenseNumber}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 dark:text-slate-300 font-bold line-clamp-1 mt-0.5">{guide.title}</div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-1">
                            <span>⭐ {guide.rating} ({guide.reviewsCount})</span>
                            <span>·</span>
                            <span>⏳ {guide.experienceYears} {isAr ? "سنوات خبرة" : "yrs"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Specialties, Working Days & Daily Rate */}
                      <div className="text-[10px] text-slate-600 dark:text-slate-300 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                        <div className="flex items-center gap-1 font-bold">
                          <span>📍</span>
                          <span className="truncate">{guide.specialties.slice(0, 3).join("، ")}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-slate-500">
                            📅 {formatWorkingDays(guide.workingDays)}
                          </span>
                          <span className="font-black text-[#D96B27] text-xs">
                            {guide.pricePerDay} {isAr ? "د.ل / يوم" : "LYD/day"}
                          </span>
                        </div>
                      </div>

                      {/* Select Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuide(guide);
                          setGuideName(`${guide.name} (${guide.title})`);
                        }}
                        className={`w-full py-1.5 px-3 rounded-xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-100 dark:bg-slate-700 hover:bg-[#003580] hover:text-white text-slate-800 dark:text-slate-100"
                        }`}
                      >
                        <span>{isSelected ? "✓ " + (isAr ? "تم اختيار هذا المرشد" : "Selected") : (isAr ? "اختيار هذا المرشد" : "Select Guide")}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5. DYNAMIC REAL-TIME PRICE BREAKDOWN & ESTIMATE (حساب التكلفة التقديرية بالوقت الفعلي) */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 via-[#003580] to-slate-950 text-white shadow-xl space-y-3 border border-white/10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  <div>
                    <h5 className="font-black text-sm text-white">
                      {isAr ? "حساب التكلفة التقديرية للرحلة الخاصة (بالوقت الفعلي)" : "Estimated Trip Pricing Breakdown"}
                    </h5>
                    <p className="text-[11px] text-slate-300 font-medium">
                      {isAr ? `محسوبة لعدد ${durationDays} أيام لرحلة مخصصة متكاملة` : `Calculated for ${durationDays} days custom itinerary`}
                    </p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">
                  {durationDays} {isAr ? "أيام" : "days"}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Vehicle Cost Item */}
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">🚌 {isAr ? "المركبة:" : "Vehicle:"} {selectedVehicle.shortName}</span>
                    <span className="font-black text-amber-300">{selectedVehicle.pricePerDay} د.ل / يوم</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {selectedVehicle.pricePerDay} × {durationDays} أيام = <b className="text-white">{selectedVehicle.pricePerDay * durationDays} د.ل</b>
                  </div>
                </div>

                {/* Guide Cost Item */}
                <div className="p-3 rounded-2xl bg-white/10 border border-white/10 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 font-bold">🧭 {isAr ? "المرشد المعتمد:" : "Guide:"} {selectedGuide ? selectedGuide.name : (isAr ? "اختياري" : "Optional")}</span>
                    <span className="font-black text-amber-300">{guideDailyRate} د.ل / يوم</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {guideDailyRate} × {durationDays} أيام = <b className="text-white">{guideDailyRate * durationDays} د.ل</b>
                  </div>
                </div>
              </div>

              {/* Total Calculated Row */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-300 font-bold">{isAr ? "المجموع التقديري الإجمالي:" : "Total Estimated Trip Price:"}</div>
                  <div className="text-[10px] text-slate-400">{isAr ? "شامل المركبة بسائقها والمرشد السياحي المعتمد" : "Includes vehicle with driver & certified guide"}</div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300">
                  {totalEstimatedCost} <span className="text-sm text-white">د.ل</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#FAFAF8] dark:bg-slate-800 border border-[#E6E1D6] dark:border-slate-700 text-xs text-[#526078] dark:text-slate-300 flex items-center gap-2">
              <span className="text-xl">👑</span>
              <div>
                <b className="text-[#0B132B] dark:text-white block">{isAr ? "ربط فوري ومباشر بحسابك المسجل:" : "Linked to account:"}</b>
                <span>{isAr ? "سيتم التواصل معك عبر رقم هاتفك وبياناتك المسجلة فور اعتماد الترتيبات مع المرشد وشركة النقل لتأكيد المسار الزمني." : "Our travel specialist will contact you with the finalized custom itinerary."}</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition cursor-pointer text-sm"
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
              <span className="font-mono font-black text-[#003580]">#PR-{Math.floor(Math.random() * 90000 + 10000)}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "الوجهة المستهدفة:" : "Destination:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{destination || (isAr ? "حسب برنامج السائح" : "Custom")}</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المركبة المختارة:" : "Selected Vehicle:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{selectedVehicle.name} ({selectedVehicle.pricePerDay} د.ل/يوم)</span>
            </div>
            <div className="flex justify-between border-b pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المرشد السياحي:" : "Tour Guide:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{selectedGuide ? `${selectedGuide.name} (${selectedGuide.pricePerDay} د.ل/يوم)` : (isAr ? "سيتم التعيين من الإدارة" : "To be assigned")}</span>
            </div>
            <div className="flex justify-between pt-1 text-sm">
              <span className="text-slate-700 font-black">{isAr ? "التكلفة التقديرية الإجمالية:" : "Total Estimate:"}</span>
              <span className="font-black text-[#D96B27]">{totalEstimatedCost} د.ل ({durationDays} أيام)</span>
            </div>
          </div>

          <p className="mt-4 text-[#526078] dark:text-slate-300 text-xs max-w-lg mx-auto leading-relaxed">
            {isAr
              ? "سيقوم منسق الرحلات السياحية بالمنصة بالتواصل معك هاتفياً وعبر واتساب لتأكيد مسار الرحلة واعتماد الحجز."
              : "Our dedicated travel consultant will contact you to finalize arrangements and confirm the booking."}
          </p>
          <button onClick={onClose} className="mt-6 px-8 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black shadow-soft cursor-pointer">
            {isAr ? "تم" : "Done"}
          </button>
        </div>
      )}
    </Modal>
  );
}

