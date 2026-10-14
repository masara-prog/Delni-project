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
import { apiBookDailyTrip, apiBookWeeklyTrip, getStoredSession } from "@/lib/api";

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

export function Modal({ open, onClose, children, size = "md" }: { open: boolean; onClose: () => void; children: ReactNode; size?: "md" | "lg" | "xl" | "2xl" }) {
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
  const sizeClass = size === "2xl" ? "max-w-5xl" : size === "xl" ? "max-w-4xl" : size === "lg" ? "max-w-3xl" : "max-w-lg";
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
            onSubmit={async (e) => {
              e.preventDefault();
              if (hasSeatError) return;
              if (!phone.match(/^09\d{8}$/)) return;

              // Connect to real DelniDB
              try {
                const session = getStoredSession();
                const touristId = session.user?.tourist_id || session.user?.passport || session.user?.id || `T-${phone}`;
                const nSeats = parseInt(seats, 10) || 1;
                const anyItem = item as any;
                const isWeekly = anyItem.id?.startsWith("w") || anyItem.subtitle?.includes("أسبوع") || anyItem.title?.includes("أسبوع");

                if (isWeekly) {
                  await apiBookWeeklyTrip({
                    tourist_id: touristId,
                    weekly_trip_id: anyItem.id || "WT-201",
                    number_of_seats: nSeats,
                    passengers_names: accountName || "سائح",
                    booking_notes: `تاريخ الرحلة المطلوب: ${date} - الهاتف: ${phone}`,
                  });
                } else {
                  await apiBookDailyTrip({
                    tourist_id: touristId,
                    daily_trip_id: anyItem.id || "DT-101",
                    number_of_seats: nSeats,
                    passengers_names: accountName || "سائح",
                    booking_notes: `تاريخ الرحلة المطلوب: ${date} - الهاتف: ${phone}`,
                  });
                }
              } catch (err) {
                console.error("Booking API error:", err);
              }

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

  // Landmarks & Tourist Attractions: Spacious, Luxurious View with Private Tour Booking
  const isLandmark = !item.vehicle && !item.schedules && (item.price === undefined || item.price === null || item.price === 0);

  if (isLandmark) {
    return (
      <Modal open={open} onClose={onClose} size="2xl">
        <div dir={dir} className="p-6 sm:p-8 text-right bg-gradient-to-br from-white via-slate-50/90 to-blue-50/30 relative overflow-hidden">
          {/* Subtle Ambient Corner Flares */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-start relative z-10">
            
            {/* 1. Details Column (Placed FIRST in DOM -> Renders on the RIGHT in Arabic RTL) */}
            <div className="md:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full bg-[#003580]/10 text-[#003580] text-xs font-black border border-[#003580]/20 flex items-center gap-1.5 shadow-2xs">
                    <span>📍</span>
                    <span>{item.subtitle || nearbyData.destination}</span>
                  </span>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{isAr ? "الدخول: مجاني بدون تذاكر" : "Free Entry"}</span>
                  </span>
                  <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    🏛️ {isAr ? "معلم أثري محمي" : "Protected Heritage"}
                  </span>
                </div>
                
                <h3 className="text-2xl sm:text-3xl font-black text-[#003580] leading-snug tracking-tight">
                  {item.title}
                </h3>
              </div>

              {item.description && (
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {item.description}
                </p>
              )}

              {/* Info Metrics Grid: Full spacious cards with vibrant color accents */}
              {item.info && item.info.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs pt-1">
                  {item.info.map((i) => (
                    <div key={i.label} className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
                      <span className="text-[10px] text-[#003580] font-bold block mb-0.5">{i.label}</span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm leading-snug block">{i.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Key Highlights / Features tags if available */}
              {item.features && item.features.length > 0 && (
                <div className="pt-1">
                  <span className="text-[11px] font-bold text-[#003580] block mb-1.5">
                    {isAr ? "أبرز المعالم والتفاصيل المعمارية:" : "Key Highlights:"}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-blue-50/70 text-[#003580] text-xs font-bold border border-blue-200/70 hover:bg-blue-100/70 transition shadow-2xs"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: Vibrant Orange Private Trip Booking & Close Button */}
              <div className="pt-4 flex flex-wrap items-center gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onBook?.();
                  }}
                  className="flex-1 min-w-[200px] px-7 py-3.5 rounded-full bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#C2410C] hover:from-[#C2410C] hover:to-[#D96B27] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>🧭</span>
                  <span>{isAr ? "ذهاب برحلة خاصة لهذا المعلم" : "Book Private Tour to this Site"}</span>
                  <span className="text-sm">➔</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3.5 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs sm:text-sm transition cursor-pointer shadow-2xs"
                >
                  {isAr ? "إغلاق النافذة" : "Close"}
                </button>
              </div>
            </div>

            {/* 2. Image Showcase (Placed SECOND in DOM -> Renders on the LEFT in Arabic RTL) */}
            <div className="md:col-span-5 relative h-72 sm:h-80 md:h-[420px] rounded-3xl overflow-hidden shadow-md border border-slate-200 shrink-0 w-full group">
              <img
                src={currentImg}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
              
              <div className="absolute top-3.5 right-3.5 left-3.5 flex items-center justify-between pointer-events-none text-white">
                <span className="px-3 py-1 rounded-full bg-[#003580]/90 backdrop-blur-md text-[11px] font-black border border-white/20 shadow-md">
                  📍 {nearbyData.destination}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-[11px] font-black text-white border border-white/20 shadow-md">
                  ✨ {isAr ? "دخول مجاني" : "Free Entry"}
                </span>
              </div>

              {gallery.length > 1 && (
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-2 z-10 pointer-events-auto px-2">
                  {gallery.slice(0, 5).map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setActiveImg(idx)}
                      className={`w-10 h-8 rounded-lg overflow-hidden border-2 transition cursor-pointer shadow-md ${activeImg === idx ? "border-[#EA580C] scale-110 ring-2 ring-white/50" : "border-white/50 opacity-70 hover:opacity-100"}`}
                    >
                      <img src={p} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </Modal>
    );
  }

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
            onSubmit={async (e) => {
              e.preventDefault();
              const avail = selectedTrip ? (selectedTrip.seats - selectedTrip.taken) : 0;
              const n = parseInt(seats, 10);
              if (isNaN(n) || n < 1 || n > avail) return;

              // Connect to real DelniDB
              try {
                const session = getStoredSession();
                const touristId = session.user?.tourist_id || session.user?.passport || session.user?.id || `T-GUEST-${Date.now().toString().slice(-4)}`;
                const isWeekly = (selectedTrip as any).kind === "weekly" || selectedTrip.id?.startsWith("w") || kindLabel.includes("أسبوع");

                if (isWeekly) {
                  await apiBookWeeklyTrip({
                    tourist_id: touristId,
                    weekly_trip_id: selectedTrip.id || "WT-201",
                    number_of_seats: n,
                    passengers_names: session.user?.full_name || session.user?.name || "سائح",
                    booking_notes: `موعد الرحلة: ${selectedTrip.date} ${selectedTrip.time} - المرشد: ${selectedTrip.guide}`,
                  });
                } else {
                  await apiBookDailyTrip({
                    tourist_id: touristId,
                    daily_trip_id: selectedTrip.id || "DT-101",
                    number_of_seats: n,
                    passengers_names: session.user?.full_name || session.user?.name || "سائح",
                    booking_notes: `موعد الرحلة: ${selectedTrip.date} ${selectedTrip.time} - المرشد: ${selectedTrip.guide}`,
                  });
                }
              } catch (err) {
                console.error("TripScheduleModal Booking API error:", err);
              }

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

  // Determine initial landmark from initialDestination or default to Sabratha
  const [selectedLandmarkId, setSelectedLandmarkId] = useState<string>(() => {
    if (initialDestination) {
      const clean = initialDestination.toLowerCase();
      const found = LIBYAN_ATTRACTIONS.find(
        (a) =>
          a.name.toLowerCase().includes(clean) ||
          clean.includes(a.name.toLowerCase()) ||
          (a.city && clean.includes(a.city.toLowerCase()))
      );
      if (found) return found.id;
    }
    return "sabratha";
  });

  // Form fields strictly aligned with SQL Server DelniDB private_trips table
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [durationDays, setDurationDays] = useState("3");
  const [companions, setCompanions] = useState("2");
  const [vehicleType, setVehicleType] = useState("دفع رباعي 4x4 (سفاري وطرق وعرة)");
  const [selectedGuideLicense, setSelectedGuideLicense] = useState<string>("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [createdTripId, setCreatedTripId] = useState("");

  // Sync state whenever modal opens or initial props change
  useEffect(() => {
    if (open) {
      setStep("form");
      const session = getStoredSession();
      if (session?.user) {
        if (!customerName) setCustomerName(session.user.name || "");
        if (!phone) setPhone(session.user.phone || "");
      }
      if (initialDestination) {
        const clean = initialDestination.toLowerCase();
        const found = LIBYAN_ATTRACTIONS.find(
          (a) =>
            a.name.toLowerCase().includes(clean) ||
            clean.includes(a.name.toLowerCase()) ||
            (a.city && clean.includes(a.city.toLowerCase()))
        );
        if (found) setSelectedLandmarkId(found.id);
      }
      if (initialGuide) {
        const foundG = TOUR_GUIDES_DATA.find((g) => g.name.includes(initialGuide) || initialGuide.includes(g.name));
        if (foundG) setSelectedGuideLicense(foundG.licenseNumber);
      }
    }
  }, [open, initialDestination, initialGuide]);

  // Selected landmark object
  const selectedLandmark = useMemo(() => {
    return LIBYAN_ATTRACTIONS.find((a) => a.id === selectedLandmarkId) || LIBYAN_ATTRACTIONS[0];
  }, [selectedLandmarkId]);

  // Selected tour guide object
  const selectedGuide = useMemo(() => {
    if (!selectedGuideLicense) return null;
    return TOUR_GUIDES_DATA.find((g) => g.licenseNumber === selectedGuideLicense) || null;
  }, [selectedGuideLicense]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.match(/^09\d{8}$/)) {
      alert(isAr ? "الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)" : "Please enter a valid Libyan phone number (e.g. 0912345678)");
      return;
    }

    const tripId = `PRV-${Date.now().toString().slice(-5)}`;
    setCreatedTripId(tripId);

    const session = getStoredSession();
    const touristId = session?.user?.role === "tourist" ? (session?.user?.id || session?.user?.username) : null;

    // Payload strictly matching SQL Server DelniDB private_trips columns
    const payload = {
      private_trip_id: tripId,
      status_order: "بانتظار تسعير الإدارة",
      customer_description: selectedLandmark ? (isAr ? selectedLandmark.name : selectedLandmark.nameEn) : "رحلة سياحية خاصة",
      preferred_start_date: startDate || new Date().toISOString().split("T")[0],
      duration_days: Math.max(1, parseInt(durationDays, 10) || 1),
      number_of_companions: Math.max(1, parseInt(companions, 10) || 1),
      guide_license_number: selectedGuideLicense || null,
      tourist_id: touristId,
      customer_name: (customerName || session?.user?.name || "سائح دلّني").trim(),
      customer_phone: phone.trim(),
      customer_requirements: `وسيلة النقل: ${vehicleType}.${selectedGuide ? ` المرشد: ${selectedGuide.name} (${selectedGuide.licenseNumber}).` : ''}${notes ? ` ملاحظات: ${notes}` : ''}`.trim(),
      quoted_price: null,
      admin_itinerary_plan: null,
    };

    // Save directly to SQL Server DelniDB private_trips endpoint
    fetch("http://127.0.0.1:5001/api/db/private_trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(console.error);

    // Save locally for instant rendering in tourist & admin dashboards
    try {
      const existing = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
      existing.unshift({
        ...payload,
        guide_name: selectedGuide ? selectedGuide.name : null,
        created_at: new Date().toISOString(),
      });
      localStorage.setItem("delni_private_trips", JSON.stringify(existing));
      localStorage.setItem("dalni_private_trips", JSON.stringify(existing));
    } catch {}

    setStep("done");
  };

  return (
    <Modal open={open} onClose={onClose} size="2xl">
      {step === "form" ? (
        <div className="p-5 sm:p-8 pb-10 sm:pb-12 bg-[#FAF7F2] dark:bg-slate-950 text-slate-800 dark:text-slate-100 space-y-5" dir={dir}>
          {/* Header Banner - Libyan Heritage Aesthetic with decorative lines */}
          <div className="text-center pt-1">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px w-12 sm:w-20 bg-[#D4A373]/60" />
              <span className="text-xs sm:text-sm font-bold text-[#B85D36] flex items-center gap-1.5 tracking-wide">
                <span>🏛️</span>
                <span>{isAr ? "التراث في ليبيا" : "Heritage in Libya"}</span>
              </span>
              <span className="h-px w-12 sm:w-20 bg-[#D4A373]/60" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B] dark:text-white tracking-tight">
              {isAr ? "طلب رحلة سياحية خاصة" : "Custom Private Tour Request"}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg mx-auto">
              {isAr
                ? "صمّم رحلتك المخصصة للمعالم التاريخية والطبيعية بإشراف مباشر وتسعير معتمد من إدارة المنصة"
                : "Design your bespoke journey to Libyan heritage sites with direct coordination from administration"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Heritage Card Container matching Reference Design */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 p-5 sm:p-7 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                
                {/* Visual Landmark Side: BIG, Clean, Cinematic (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="relative rounded-2xl overflow-hidden h-56 sm:h-64 lg:h-72 border border-[#E8E2D6] dark:border-slate-700 shadow-sm group">
                    <img
                      src={selectedLandmark.img}
                      alt={selectedLandmark.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                    {/* Single Clean Heritage Badge */}
                    <div className="absolute top-3 right-3 z-10 pointer-events-none">
                      <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[11px] font-black flex items-center gap-1.5 shadow-sm">
                        <span>🏛️</span>
                        <span>
                          {selectedLandmark.isUnesco
                            ? (isAr ? `مسجل باليونسكو • ${selectedLandmark.unescoYear || 1982}` : `UNESCO Inscribed`)
                            : (isAr ? "معلم أثري محمي" : "Protected Landmark")}
                        </span>
                      </span>
                    </div>

                    {/* Bottom Caption Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-3.5 text-white pointer-events-none">
                      <h4 className="font-black text-sm text-white drop-shadow">
                        {isAr ? selectedLandmark.name : selectedLandmark.nameEn}
                      </h4>
                      <p className="text-[11px] text-slate-200 mt-0.5">
                        📍 {isAr ? selectedLandmark.city : selectedLandmark.cityEn} • ليبيا
                      </p>
                    </div>
                  </div>

                  {/* Clean Landmark Switcher */}
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800/80 border border-[#E8E2D6] dark:border-slate-700">
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                      {isAr ? "تغيير الوجهة أو المعلم المستهدف:" : "Change Destination Landmark:"}
                    </label>
                    <select
                      value={selectedLandmarkId}
                      onChange={(e) => setSelectedLandmarkId(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-[#B85D36] cursor-pointer"
                    >
                      {LIBYAN_ATTRACTIONS.map((lm) => (
                        <option key={lm.id} value={lm.id}>
                          {isAr ? lm.name : lm.nameEn} ({isAr ? lm.city : lm.cityEn})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Form Fields Side strictly matching SQL Server private_trips (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-[#0B132B] dark:text-white leading-snug">
                      {isAr ? selectedLandmark.name : selectedLandmark.nameEn}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-1 line-clamp-2">
                      {isAr ? selectedLandmark.description : selectedLandmark.descriptionEn}
                    </p>
                  </div>

                  {/* 4 Structured Information Boxes matching Reference Design Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Box 1: Preferred Start Date */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        📅 {isAr ? "تاريخ الانطلاق المفضل" : "Preferred Start Date"}
                      </span>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none"
                      />
                    </div>

                    {/* Box 2: Duration in Days */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        ⏱️ {isAr ? "مدة الرحلة (بالأيام)" : "Duration (Days)"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="30"
                          required
                          value={durationDays}
                          onChange={(e) => setDurationDays(e.target.value)}
                          className="w-16 bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">{isAr ? "أيام" : "days"}</span>
                      </div>
                    </div>

                    {/* Box 3: Number of Companions */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        👥 {isAr ? "عدد المسافرين / المرافقين" : "Companions / Pax"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          required
                          value={companions}
                          onChange={(e) => setCompanions(e.target.value)}
                          className="w-16 bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none"
                        />
                        <span className="text-xs text-slate-400 font-bold">{isAr ? "أفراد" : "pax"}</span>
                      </div>
                    </div>

                    {/* Box 4: Vehicle Type */}
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        🚍 {isAr ? "وسيلة النقل المفضلة" : "Preferred Vehicle"}
                      </span>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer truncate"
                      >
                        <option value="دفع رباعي 4x4 (سفاري وطرق وعرة)">{isAr ? "دفع رباعي 4x4 (سفاري وطرق وعرة)" : "4x4 Desert SUV"}</option>
                        <option value="حافلة سياحية كبرى فاخرة VIP (50 راكب)">{isAr ? "حافلة كبرى فاخرة VIP (50 راكب)" : "VIP Coach (50 seats)"}</option>
                        <option value="ميني باص سياحي حديث (25 راكب)">{isAr ? "ميني باص سياحي (25 راكب)" : "Tourist Minibus (25 seats)"}</option>
                        <option value="مرسيدس سبرينتر VIP (14 راكب)">{isAr ? "مرسيدس سبرينتر VIP (14 راكب)" : "Mercedes Sprinter VIP"}</option>
                        <option value="سيارة سيدان عائلية خاصة">{isAr ? "سيارة سيدان عائلية خاصة" : "Family Sedan"}</option>
                      </select>
                    </div>
                  </div>

                  {/* Tourist Contact Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        👤 {isAr ? "اسم السائح أو الجهة الطالبة" : "Tourist / Client Name"}
                      </span>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder={isAr ? "الاسم الكامل" : "Full Name"}
                        className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none"
                        maxLength={50}
                      />
                    </div>

                    <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                      <span className="text-[10px] text-slate-500 font-bold block mb-1">
                        📞 {isAr ? "رقم الهاتف / واتساب" : "Phone (WhatsApp)"}
                      </span>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="09XXXXXXXX"
                        className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none font-mono"
                        maxLength={15}
                      />
                    </div>
                  </div>

                  {/* Tour Guide Selection */}
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      🧭 {isAr ? "المرشد السياحي المعتمد (اختياري)" : "Certified Tour Guide (Optional)"}
                    </span>
                    <select
                      value={selectedGuideLicense}
                      onChange={(e) => setSelectedGuideLicense(e.target.value)}
                      className="w-full bg-transparent font-bold text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="">{isAr ? "بدون مرشد مخصص (سائق الرحلة فقط)" : "Driver only (No dedicated guide)"}</option>
                      {TOUR_GUIDES_DATA.map((g) => (
                        <option key={g.licenseNumber} value={g.licenseNumber}>
                          {g.name} - ترخيص ({g.licenseNumber}) - {g.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Special Requests or Notes */}
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 shadow-2xs">
                    <span className="text-[10px] text-slate-500 font-bold block mb-1">
                      📝 {isAr ? "ملاحظات أو متطلبات خاصة (اختياري)" : "Special Requests or Notes"}
                    </span>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={isAr ? "أية تفاصيل إضافية تود إبلاغ إدارة المنصة بها (فنادق، تصاريح)..." : "Any special requirements..."}
                      className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none font-medium"
                    />
                  </div>

                  {/* Terracotta Action Button matching Reference Mockup */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full h-12 rounded-full bg-[#B85D36] hover:bg-[#a04e2c] text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                    >
                      <span>{isAr ? "إرسال طلب الرحلة للإدارة" : "Submit Request to Admin"}</span>
                      <span className="text-base">➔</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Done Screen matching Heritage Aesthetic */
        <div className="p-8 sm:p-12 text-center bg-[#FAF7F2] dark:bg-slate-950 text-slate-800 dark:text-slate-100" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-[#B85D36]/15 text-[#B85D36] grid place-items-center text-4xl shadow-sm border border-[#B85D36]/30">
            🏛️
          </div>

          <h3 className="mt-5 text-2xl font-black text-[#0B132B] dark:text-white">
            {isAr ? "تم استلام طلب رحلتك الخاصة بنجاح!" : "Private Tour Request Submitted!"}
          </h3>

          <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {isAr
              ? "تم تحويل طلبك مباشرة إلى لوحة إدارة المنصة (Admin) لدراسة المسار وتجهيز التسعيرة الرسمية وخطة الرحلة."
              : "Your request has been routed to platform administration for itinerary planning and official quotation."}
          </p>

          <div className="mt-6 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 max-w-lg mx-auto text-right text-xs space-y-2.5 shadow-xs">
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "رقم الطلب المرجعي:" : "Reference #:"}</span>
              <span className="font-mono font-black text-[#B85D36]">#{createdTripId}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المعلم والوجهة:" : "Landmark:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{isAr ? selectedLandmark.name : selectedLandmark.nameEn}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "تاريخ الانطلاق والمدة:" : "Start Date & Duration:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{startDate} ({durationDays} {isAr ? "أيام" : "days"})</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "عدد المسافرين:" : "Travelers:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{companions} {isAr ? "أفراد" : "pax"}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "وسيلة النقل:" : "Vehicle:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">{vehicleType}</span>
            </div>
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "المرشد السياحي:" : "Tour Guide:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">
                {selectedGuide ? `${selectedGuide.name} (${selectedGuide.licenseNumber})` : (isAr ? "سائق الرحلة فقط" : "Driver only")}
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-bold">{isAr ? "حالة التسعيرة:" : "Pricing Status:"}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                {isAr ? "بانتظار تسعير الإدارة" : "Pending Admin Quote"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-8 h-11 rounded-full bg-[#B85D36] hover:bg-[#a04e2c] text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
