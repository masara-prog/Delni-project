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
import { TOUR_GUIDES_DATA, type TourGuide, formatWorkingDays, REGIONS_MAP } from "@/lib/guidesData";
import { LIBYAN_ATTRACTIONS, LIBYAN_CITIES, type AttractionItem } from "@/lib/attractionsData";
import { apiBookDailyTrip, apiBookWeeklyTrip, apiRequestPrivateTrip, getStoredSession, LARAVEL_API_URL } from "@/lib/api";

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
  id?: string;
  trip_id?: string;
  daily_trip_id?: string;
  weekly_trip_id?: string;
  refId?: string;
  title: string;
  subtitle?: string;
  image?: string;
  img?: string;
  images?: string[];
  gallery?: string[];
  departure?: string;
  details?: string;
  price?: number | string;
  seatPrice?: number | string;
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
  const [bookingError, setBookingError] = useState<string | null>(null);

  const session = getStoredSession();
  const isTourist = Boolean(session?.token && (session?.role === "tourist" || session?.user?.role === "tourist"));

  const minBookingDate = useMemo(() => {
    // 24 hours in the future
    const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return d.toISOString().split("T")[0];
  }, []);

  const isWithin24h = useMemo(() => {
    if (!date) return false;
    const picked = new Date(date).getTime();
    return picked - Date.now() < 24 * 60 * 60 * 1000;
  }, [date]);

  useEffect(() => {
    if (open) {
      setStep("form");
      setSeats("2");
      setDate("");
      setBookingError(null);
      let initialPhone = "0912345678";
      let initialName = isAr ? "محمد أحمد" : "John Smith";
      try {
        const s = getStoredSession();
        if (s?.user) {
          if (s.user.phone_number || s.user.phone) {
            initialPhone = s.user.phone_number || s.user.phone;
          }
          if (s.user.full_name || s.user.name) {
            initialName = s.user.full_name || s.user.name;
          }
        } else {
          const storedUser = localStorage.getItem("dalni_user");
          if (storedUser) {
            const parsed = JSON.parse(storedUser);
            if (parsed.phone) initialPhone = parsed.phone;
            if (parsed.fullName) initialName = parsed.fullName;
          }
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

  const itemAny = item as any;
  const rawPrice = item.price !== undefined ? item.price : itemAny.seatPrice;
  const unit = typeof rawPrice === "number" ? rawPrice : Number(String(rawPrice ?? "0").replace(/[^\d.]/g, ""));
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
              if (!isTourist) {
                setBookingError(isAr ? "عذراً، حجز الرحلات متاح حصرياً لحسابات السياح المعتمدة. يرجى تسجيل الدخول أو إنشاء حساب كسائح." : "Trip bookings are reserved for tourist accounts.");
                return;
              }
              if (hasSeatError) return;
              if (isWithin24h) {
                setBookingError(isAr ? "عذراً، يُقفل الحجز تلقائياً قبل انطلاق الرحلة بـ 24 ساعة لترتيب الحافلات والمرشدين." : "Bookings close 24 hours prior to departure.");
                return;
              }
              if (!phone.match(/^09\d{8}$/)) return;
              setBookingError(null);

              // Connect to real DelniDB
              try {
                const s = getStoredSession();
                const touristId = s.user?.tourist_id || "";
                const nSeats = parseInt(seats, 10) || 1;
                const isWeekly = item.id?.startsWith("w") || item.subtitle?.includes("أسبوع") || item.title?.includes("أسبوع");

                let res: any;
                if (isWeekly) {
                  res = await apiBookWeeklyTrip({
                    tourist_id: touristId,
                    weekly_trip_id: item.id || "",
                    number_of_seats: nSeats,
                  });
                } else {
                  res = await apiBookDailyTrip({
                    tourist_id: touristId,
                    daily_trip_id: item.id || "",
                    number_of_seats: nSeats,
                  });
                }

                if (res && res.status === "error") {
                  setBookingError(res.message || (isAr ? "تعذر إتمام الحجز" : "Booking failed"));
                  return;
                }
              } catch (err: any) {
                console.error("Booking API error:", err);
                setBookingError(err?.message || (isAr ? "حدث خطأ أثناء الاتصال بالخادم" : "Database error"));
                return;
              }

              setStep("success");
            }}
          >
            <div className="text-xs font-black text-primary">{isAr ? "إكمال الحجز · حساب مسجّل" : "Complete Booking · Registered Account"}</div>
            <h3 className="text-xl font-black text-foreground">{item.title}</h3>

            {!isTourist ? (
              <div className="rounded-xl bg-amber-50 border-2 border-amber-300 p-3.5 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-black text-amber-900">
                  <span>🔒</span>
                  <span>{isAr ? "تنبيه: حجز الرحلات متاح لحسابات السياح" : "Tourist Account Required"}</span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed font-medium">
                  {isAr
                    ? "حجز الرحلات السياحية بجميع أنواعها متاح للمسجلين بحساب سائح لأخذ بياناتك وربط معلوماتك تلقائياً بالحجز. يرجى تسجيل الدخول أو إنشاء حساب كسائح للمتابعة:"
                    : "Trip bookings are reserved for tourist accounts to automatically link passenger details. Please log in or sign up as a tourist:"}
                </p>
                <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                  <a
                    href="/auth/login?role=tourist"
                    className="px-3 py-1.5 rounded-lg bg-[#003580] hover:bg-[#00224f] text-white font-black text-[11px] transition shadow-xs"
                  >
                    {isAr ? "تسجيل الدخول كسائح" : "Log In as Tourist"}
                  </a>
                  <a
                    href="/auth/signup?role=tourist"
                    className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-black text-[11px] transition shadow-xs"
                  >
                    {isAr ? "إنشاء حساب سائح" : "Sign Up as Tourist"}
                  </a>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#F4F1EA] border border-[#E6E1D6] p-3 text-xs">
                <div className="font-black text-[#0B132B] mb-1">👤 {isAr ? `الحساب: ${accountName}` : `Account: ${accountName}`}</div>
                <div className="text-[#526078]">{isAr ? "بياناتك ورقم هاتفك المسجلين مسبقاً مرتبطان تلقائياً بهذا الحجز." : "Your registered account details and phone are automatically linked to this booking."}</div>
              </div>
            )}

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

            <Field 
              label={isAr ? "تاريخ الرحلة *" : "Trip Date *"} 
              value={date} 
              onChange={setDate} 
              type="date" 
              min={minBookingDate}
              required 
            />

            {/* 24-Hour Advance Cutoff Notice */}
            {isWithin24h && date && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold flex items-start gap-2 animate-in fade-in">
                <span className="text-base leading-none">⏳</span>
                <div>
                  <span className="font-black block">
                    {isAr ? "إغلاق الحجوزات قبل 24 ساعة:" : "24-Hour Cutoff:"}
                  </span>
                  <span>
                    {isAr
                      ? `عذراً، يُغلق الحجز تلقائياً قبل انطلاق الرحلة بـ 24 ساعة لترتيب المركبات والمرشدين وقوائم الركاب. يرجى اختيار تاريخ يبدأ من (${minBookingDate}) فصاعداً.`
                      : `Bookings close 24 hours prior to departure. Please choose a date on or after ${minBookingDate}.`}
                  </span>
                </div>
              </div>
            )}

            {/* Server Error Alert */}
            {bookingError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-300 text-red-700 text-xs font-bold flex items-start gap-2 animate-in fade-in">
                <span className="text-base leading-none">⚠️</span>
                <div>
                  <span className="font-black block">{isAr ? "تعذر إتمام الحجز" : "Booking Error"}</span>
                  <span>{bookingError}</span>
                </div>
              </div>
            )}

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
              disabled={hasSeatError || isWithin24h}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer"
            >
              {hasSeatError
                ? (isAr ? "حدد عدد مقاعد متاح للاستمرار" : "Select valid seats to continue")
                : isWithin24h
                ? (isAr ? "اختر موعداً يبعد 24 ساعة على الأقل" : "Select a date at least 24h away")
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

function Field({ label, value, onChange, type = "text", placeholder, required, min, max }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; min?: string | number; max?: string | number }) {
  return (
    <div>
      <label className="text-sm font-bold text-foreground mb-1 block">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input
        type={type}
        value={value}
        required={required}
        min={min}
        max={max}
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
  tripId?: string;
  date: string;
  time: string;
  seats: number;
  taken: number;
  guide: string;
  price: number;
  tripTitle?: string;
  kind?: string;
};

export function TripScheduleModal({
  open,
  onClose,
  kind,
  tripId,
  tripTitle,
  customTitle,
  customPrice,
  customImage,
  customSchedules,
  trip,
}: {
  open: boolean;
  onClose: () => void;
  kind: "daily" | "weekly" | null;
  tripId?: string;
  tripTitle?: string;
  customTitle?: string;
  customPrice?: number;
  customImage?: string;
  customSchedules?: ScheduledTrip[];
  trip?: any;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';
  const [selected, setSelected] = useState<string | null>(null);
  const [seats, setSeats] = useState("1");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"pick" | "form" | "done">("pick");
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [priorBookedSeats, setPriorBookedSeats] = useState<number>(0);
  const [bookingConfirmedCode, setBookingConfirmedCode] = useState<string>("");
  const [totalSeatsAfterBooking, setTotalSeatsAfterBooking] = useState<number>(0);
  const [isAccountRestricted, setIsAccountRestricted] = useState(false);

  useEffect(() => {
    if (open) {
      setSeats("1");
      setPhone("");
      setStep("pick");
      setShowAuthWarning(false);
      setIsAccountRestricted(false);
      setBookingConfirmedCode(`DL-${Math.floor(Math.random() * 90000 + 10000)}`);

      // Check account restriction status & prior bookings for this tourist
      try {
        const session = getStoredSession();
        const touristId = session.user?.tourist_id || session.user?.passport || session.user?.id;
        const targetTripId = trip?.id || trip?.daily_trip_id || trip?.weekly_trip_id || tripId;
        const targetTitle = customTitle || tripTitle || trip?.title;

        if (session.role === "tourist" && touristId) {
          if (session.user?.account_status === "مقيّد") {
            setIsAccountRestricted(true);
          }
          fetch(`${LARAVEL_API_URL}/tourists/${encodeURIComponent(touristId)}`, { headers: { Accept: "application/json" } })
            .then(r => r.json())
            .then(res => {
              if (res && res.success && res.data) {
                const restricted = res.data.account_status === "مقيّد";
                setIsAccountRestricted(restricted);
                if (session.user) {
                  session.user.account_status = res.data.account_status;
                  localStorage.setItem("delni_session", JSON.stringify(session));
                }
              }
            })
            .catch(() => {});

          const localDaily = JSON.parse(localStorage.getItem("dalni_bookings_daily") || "[]");
          const localWeekly = JSON.parse(localStorage.getItem("dalni_bookings_weekly") || "[]");
          const allUserBookings = [...localDaily, ...localWeekly].filter(
            (b: any) =>
              (b.tourist_id === touristId) &&
              (b.daily_trip_id === targetTripId ||
                b.weekly_trip_id === targetTripId ||
                b.trip_title === targetTitle)
          );

          const totalPrev = allUserBookings.reduce(
            (sum: number, b: any) => sum + (Number(b.number_of_seats) || 0),
            0
          );
          setPriorBookedSeats(totalPrev);
        } else {
          setPriorBookedSeats(0);
        }
      } catch {
        setPriorBookedSeats(0);
      }
    }
  }, [open, trip, tripId, customTitle, tripTitle]);

  const defaultDaily: ScheduledTrip[] = [
    { id: "d1", date: isAr ? "يوم السبت" : "Saturday", time: isAr ? "09:00 ص حتى 09:00 م (جولة كاملة)" : "09:00 AM - 09:00 PM", seats: 20, taken: 14, guide: isAr ? "خالد الورفلي" : "Khaled Al-Warfali", price: 180 },
    { id: "d2", date: isAr ? "يوم الثلاثاء" : "Tuesday", time: isAr ? "09:00 ص حتى 09:00 م (جولة كاملة)" : "09:00 AM - 09:00 PM", seats: 20, taken: 7, guide: isAr ? "سامي العبيدي" : "Sami Al-Obaidi", price: 180 },
  ];

  const defaultWeekly: ScheduledTrip[] = [
    { id: "w1", date: isAr ? "الانطلاق: السبت 31 أكتوبر 2026 ⬅ العودة: الجمعة 06 نوفمبر 2026" : "Depart: 2026-10-31 — Return: 2026-11-06", time: isAr ? "انطلاق 07:00 ص — برنامج 7 أيام شامل" : "07:00 AM — 7 Days All-Inclusive", seats: 12, taken: 8, guide: isAr ? "فريق دَلِّني الكامل" : "Dallani Full Team", price: 2400 },
    { id: "w2", date: isAr ? "الانطلاق: السبت 07 نوفمبر 2026 ⬅ العودة: الجمعة 13 نوفمبر 2026" : "Depart: 2026-11-07 — Return: 2026-11-13", time: isAr ? "انطلاق 07:00 ص — برنامج 7 أيام شامل" : "07:00 AM — 7 Days All-Inclusive", seats: 12, taken: 4, guide: isAr ? "أحمد الفيتوري" : "Ahmed Al-Fitouri", price: 2400 },
  ];

  let schedules: ScheduledTrip[];
  if (customSchedules && customSchedules.length > 0) {
    schedules = customSchedules;
  } else if (trip || tripId || customPrice !== undefined || customTitle || tripTitle) {
    const realId = trip?.id || trip?.daily_trip_id || trip?.weekly_trip_id || tripId || (kind === "weekly" ? "WT-220" : "DT-366");
    const realPrice = customPrice !== undefined
      ? customPrice
      : (trip?.type === "daily" ? trip.price : (trip?.seatPrice ?? (trip?.price ?? (kind === "weekly" ? 1200 : 120))));
    const realTitle = customTitle || tripTitle || trip?.title || (kind === "daily" ? "رحلة يومية" : "رحلة أسبوعية");
    const realGuide = trip?.guide?.name || "مرشد سياحي معتمد";
    const realSeats = trip?.targetPersons || trip?.max_capacity || 25;
    const realAvail = trip?.availableSeats !== undefined ? trip.availableSeats : (trip?.available_seats !== undefined ? trip.available_seats : realSeats);

    if (kind === "daily" || trip?.type === "daily") {
      const recurringStr = trip?.daysOfWeek || trip?.recurring_days || "السبت, الثلاثاء";
      const rawDays = String(recurringStr).replace(/أيام:\s*/, "").split(/[,،]+/).map((d: string) => d.trim()).filter(Boolean);
      const daysList = rawDays.length > 0 ? rawDays : ["السبت", "الثلاثاء"];

      schedules = daysList.map((day: string, idx: number) => ({
        id: `${realId}-day-${idx}`,
        tripId: realId,
        date: isAr ? `يوم ${day.startsWith("يوم") ? day : day}` : `Day: ${day}`,
        time: isAr ? "09:00 ص حتى 09:00 م (12 ساعة كاملة)" : "09:00 AM - 09:00 PM (Full Day)",
        seats: realSeats,
        taken: Math.max(0, realSeats - realAvail),
        guide: realGuide,
        price: Number(realPrice) || 120,
        tripTitle: realTitle,
        kind: "daily",
      }));
    } else {
      const cleanStart = trip?.startDate ? String(trip.startDate).split("T")[0] : "2026-10-31";
      const cleanEnd = trip?.endDate ? String(trip.endDate).split("T")[0] : "2026-11-06";
      schedules = [
        {
          id: realId,
          tripId: realId,
          date: isAr ? `الانطلاق: ${cleanStart} ⬅ العودة: ${cleanEnd}` : `Depart: ${cleanStart} — Return: ${cleanEnd}`,
          time: isAr ? "انطلاق 07:00 ص — برنامج 7 أيام شامل" : "07:00 AM — 7 Days All-Inclusive",
          seats: realSeats,
          taken: Math.max(0, realSeats - realAvail),
          guide: realGuide,
          price: Number(realPrice) || 1200,
          tripTitle: realTitle,
          kind: "weekly",
        }
      ];
    }
  } else {
    schedules = kind === "daily" ? defaultDaily : defaultWeekly;
  }

  // Auto-select schedule so the date is instantly active and button enabled if seats available
  const firstAvailSchedule = schedules.find(s => (s.seats - s.taken) > 0);
  const effectiveSelectedId = (selected && schedules.some(s => s.id === selected && (s.seats - s.taken) > 0))
    ? selected
    : (firstAvailSchedule?.id || (schedules.length === 1 ? schedules[0].id : null));

  useEffect(() => {
    if (open && effectiveSelectedId && selected !== effectiveSelectedId) {
      setSelected(effectiveSelectedId);
    }
  }, [open, effectiveSelectedId, selected]);

  const selectedTrip = schedules.find((s) => s.id === effectiveSelectedId) || schedules[0];
  const total = selectedTrip ? selectedTrip.price * (parseInt(seats) || 1) : 0;

  const kindLabel = customTitle || tripTitle || (kind === "daily" ? (isAr ? "الرحلات اليومية" : "Daily Trips") : (isAr ? "الرحلات الأسبوعية" : "Weekly Trips"));
  const kindIcon = kind === "daily" ? "☀️" : "🗓️";
  const slideshowImages = resolveTripGallery(kindLabel, kind, customImage);

  if (!open) return null;

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
                ? (isAr ? "الرحلات اليومية تنطلق في يوم واحد وتعود مساءً (09:00 ص - 09:00 م) — اختر اليوم المناسب لك:" : "Daily trips take place on a single day & return evening — select day:")
                : (isAr ? "الرحلات الأسبوعية برنامج متكامل 7 أيام شامل الإقامة والنقل — حدد موعد الانطلاق والعودة:" : "Weekly tours are 7 days all-inclusive — select departure & return:")}
            </p>
            {schedules.map((s) => {
              const avail = s.seats - s.taken;
              const full = avail === 0;
              const isSelected = effectiveSelectedId === s.id;
              return (
                <button
                  key={s.id}
                  disabled={full}
                  onClick={() => setSelected(s.id)}
                  className={`w-full text-right p-4 rounded-2xl border-2 transition cursor-pointer ${
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

            {/* Tourist Only Verification Notice */}
            {showAuthWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-black text-sm text-amber-900">
                  <span>🔒</span>
                  <span>{isAr ? "الحجز متاح لحسابات السياح فقط" : "Booking restricted to tourist accounts"}</span>
                </div>
                <p className="text-[11px] font-medium leading-relaxed text-amber-900">
                  {isAr
                    ? "عذراً، يجب أن تمتلك حساب سائح لإتمام حجز المقاعد في الرحلات. يرجى تسجيل الدخول أو إنشاء حساب سائح جديد للمتابعة."
                    : "You must be logged in as a tourist to complete this booking."}
                </p>
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <a
                    href="/auth/login"
                    className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition shadow-sm inline-block"
                  >
                    {isAr ? "تسجيل الدخول كسائح" : "Log In as Tourist"}
                  </a>
                  <a
                    href="/auth/signup"
                    className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-black text-xs transition shadow-sm inline-block"
                  >
                    {isAr ? "إنشاء حساب سائح جديد" : "Sign Up"}
                  </a>
                </div>
              </div>
            )}

            <button
              disabled={!effectiveSelectedId || Boolean(selectedTrip && (selectedTrip.seats - selectedTrip.taken) <= 0)}
              onClick={() => {
                const targetId = selected || effectiveSelectedId;
                if (!targetId) return;
                const session = getStoredSession();
                if (!session.token || session.role !== "tourist") {
                  setShowAuthWarning(true);
                  return;
                }
                setSelected(targetId);
                setStep("form");
              }}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft hover:-translate-y-0.5 transition disabled:opacity-40 disabled:cursor-not-allowed mt-2 cursor-pointer"
            >
              {selectedTrip && (selectedTrip.seats - selectedTrip.taken) <= 0
                ? (isAr ? "عذراً، هذه الرحلة مكتملة المقاعد بالكامل" : "Sorry, this tour is fully booked")
                : effectiveSelectedId
                ? (isAr ? "متابعة الحجز ←" : "Proceed to Booking →")
                : (isAr ? "اختر موعداً متاحاً أولاً" : "Select an available date first")}
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
          {/* Tourist Account Restricted Warning */}
          {isAccountRestricted && (
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-red-50 border-2 border-red-500 text-red-950 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 font-black text-sm text-red-900">
                <span className="text-xl">⛔</span>
                <span>{isAr ? "تنبيه أمني: حساب السائح مقيّد حالياً من قِبل الإدارة" : "Tourist Account Restricted"}</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-red-900">
                {isAr
                  ? "عذراً، لقد تم تقييد حسابك من قِبل إدارة المنصة ولا يمكنك إتمام أي حجوزات جديدة في الوقت الحالي. للمساعدة أو إعادة التنشيط، يرجى مراجعة إدارة الدعم الفني."
                  : "Your tourist account is currently restricted from booking trips by platform administration. Please contact support."}
              </p>
            </div>
          )}

          {/* Tourist Only Verification Notice */}
          {(!getStoredSession().token || getStoredSession().role !== "tourist") && (
            <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-black text-sm text-amber-900">
                <span>🔒</span>
                <span>{isAr ? "تنبيه: يجب التسجيل في المنصة كسائح" : "Tourist Account Required"}</span>
              </div>
              <p className="text-xs font-semibold leading-relaxed text-amber-900">
                {isAr
                  ? "عذراً، أنت مسجل حالياً بحساب إداري أو غير مسجل كسائح. حجز الرحلات السياحية متاح حصرياً لحسابات السياح. يرجى تسجيل الدخول أو إنشاء حساب كسائح للمتابعة."
                  : "You are currently not logged in as a tourist. Please register or log in with a tourist account."}
              </p>
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <a
                  href="/auth/signup?role=tourist"
                  className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition shadow-sm inline-block"
                >
                  {isAr ? "سجل في المنصة كسائح ➔" : "Sign Up as Tourist ➔"}
                </a>
                <a
                  href="/auth/login?role=tourist"
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-black text-xs transition shadow-sm inline-block"
                >
                  {isAr ? "تسجيل الدخول كسائح" : "Log In as Tourist"}
                </a>
              </div>
            </div>
          )}

          <form
            className="p-6 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (isAccountRestricted) {
                alert("⛔ عذراً، حسابك مقيّد حالياً من قِبل إدارة المنصة ولا يمكنك إتمام أي حجوزات جديدة.");
                return;
              }
              const session = getStoredSession();
              if (!session.token || session.role !== "tourist") {
                setShowAuthWarning(true);
                return;
              }
              const avail = selectedTrip ? (selectedTrip.seats - selectedTrip.taken) : 0;
              const n = parseInt(seats, 10);
              if (isNaN(n) || n < 1 || n > avail) return;

              // Connect to real DelniDB
              try {
                const session = getStoredSession();
                const touristId = session.user?.tourist_id || "";
                const isWeekly = selectedTrip.kind === "weekly" || selectedTrip.id?.startsWith("w") || kindLabel.includes("أسبوع");
                const targetTripId = selectedTrip?.tripId || selectedTrip?.id || tripId || trip?.id || "";

                const res = isWeekly
                  ? await apiBookWeeklyTrip({ tourist_id: touristId, weekly_trip_id: targetTripId, number_of_seats: n })
                  : await apiBookDailyTrip({ tourist_id: touristId, daily_trip_id: targetTripId, number_of_seats: n });
                if (res.status !== "success") {
                  alert("❌ لم يتم تسجيل الحجز.\n" + (res.message || ""));
                  return;
                }
                // The ticket number is the booking id stored in DelniDB
                setBookingConfirmedCode(res.booking_id || "");
                setTotalSeatsAfterBooking(priorBookedSeats + n);
              } catch (err: any) {
                alert("❌ تعذر الاتصال بخادم المنصة لإتمام الحجز.\n" + (err?.message || ""));
                return;
              }

              setStep("done");
            }}
          >
            {/* Prior Booking Alert Notification */}
            {priorBookedSeats > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 text-xs flex items-center justify-between gap-2 shadow-xs animate-in fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">🔔</span>
                  <span className="font-black text-amber-900">
                    {isAr
                      ? `تنبيه: لديك حجز مسبق في هذه الرحلة بمجموع (${priorBookedSeats}) مقاعد.`
                      : `You have a prior booking on this trip with (${priorBookedSeats}) seats.`}
                  </span>
                </div>
                <span className="text-[11px] font-black text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full border border-amber-300">
                  {isAr ? `حجز مسبق: ${priorBookedSeats} مقاعد` : `${priorBookedSeats} booked`}
                </span>
              </div>
            )}

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

                  {(() => {
                    const session = getStoredSession();
                    const isTourist = !!session.token && session.role === "tourist";
                    const isBtnDisabled = hasErr || !isTourist || isAccountRestricted;
                    return (
                      <button
                        disabled={isBtnDisabled}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer"
                      >
                        {isAccountRestricted
                          ? (isAr ? "⛔ حسابك مقيّد من قِبل الإدارة ولا يمكنك الحجز" : "Account Restricted from Booking")
                          : !isTourist
                          ? (isAr ? "🔒 يجب التسجيل في المنصة كسائح لتأكيد الحجز" : "Tourist account required to book")
                          : hasErr
                          ? (isAr ? "يرجى تحديد مقاعد متاحة" : "Select valid seats")
                          : (isAr ? "تأكيد الحجز (الدفع بموقع الشركة)" : "Confirm Booking (Pay at Company Office)")}
                      </button>
                    );
                  })()}
                </div>
              );
            })()}
          </form>
        </div>
      )}

      {step === "done" && selectedTrip && (
        <div className="p-8 sm:p-10 text-center" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 grid place-items-center text-4xl shadow-inner">
            ✅
          </div>
          <h3 className="mt-5 text-2xl font-black text-[#0B132B]">
            {isAr ? "تمت عملية الحجز بنجاح" : "Booking Completed Successfully"}
          </h3>
          <p className="mt-3 text-sm sm:text-base leading-relaxed max-w-md mx-auto font-bold text-slate-700">
            {isAr
              ? "الرجاء استكمال الدفع بموقع الشركة قبل 24 ساعة من الانطلاق على الأقل لضمان موقعك."
              : "Please complete payment at the company office at least 24 hours prior to departure to guarantee your seat."}
          </p>

          <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200 max-w-md mx-auto text-right space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-bold">{isAr ? "رقم الحجز والتذكرة:" : "Booking Code:"}</span>
              <span className="font-mono text-[#003580] font-black text-sm">{bookingConfirmedCode}</span>
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-bold">{isAr ? "المقاعد المحجوزة:" : "Booked Seats:"}</span>
              <span className="font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                {isAr ? `حجز عدد ${seats} مقاعد` : `${seats} Seats`}
              </span>
            </div>
            {priorBookedSeats > 0 && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-black flex items-center justify-between">
                <span>⚠️ {isAr ? "تنبيه (حجز مسبق):" : "Notice (Prior Booking):"}</span>
                <span>{isAr ? `إجمالي حجزك الآن: حجز عدد ${priorBookedSeats + (parseInt(seats, 10) || 1)} مقاعد` : `Total booked: ${priorBookedSeats + (parseInt(seats, 10) || 1)} seats`}</span>
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-8 h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black shadow-soft cursor-pointer transition text-sm"
            >
              {isAr ? "تم" : "Done"}
            </button>
            <a
              href="/dashboard/tourist"
              className="w-full sm:w-auto px-6 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm inline-flex items-center justify-center transition"
            >
              {isAr ? "عرض تذكرتي الإلكترونية 🎫" : "View My E-Ticket"}
            </a>
          </div>
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

  // User session state
  const [sessionData, setSessionData] = useState(() => getStoredSession());
  const currentRole = sessionData?.user?.role || sessionData?.role || null;
  const isTourist = Boolean(sessionData?.token && currentRole === "tourist");
  const isAdmin = currentRole === "admin";
  const userRoleTitle = isAdmin
    ? (isAr ? "مدير النظام (Admin)" : "System Administrator")
    : currentRole === "driver"
    ? (isAr ? "سائق حافلة" : "Driver")
    : currentRole === "guide"
    ? (isAr ? "مرشد سياحي" : "Tour Guide")
    : currentRole === "transport"
    ? (isAr ? "شركة نقل سياحي" : "Transport Company")
    : (isAr ? "زائر غير مسجل" : "Guest");

  // Dynamic attractions state fetched directly from MySQL / DelniDB places_tourist
  const [dbPlaces, setDbPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState<string | null>(null);

  // Modal prompt when unauthenticated user attempts to confirm
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch genuine landmarks from database
  const loadLandmarks = () => {
    setLoadingPlaces(true);
    setPlacesError(null);
    fetch(`${LARAVEL_API_URL}/places`, { headers: { Accept: "application/json" } })
      .then((r) => {
        if (!r.ok) throw new Error("تعذر جلب المعالم من خادم المنصة");
        return r.json();
      })
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setDbPlaces(res.data);
        } else {
          throw new Error("لم يتم العثور على معالم مسجلة");
        }
      })
      .catch((err) => {
        console.warn("[PrivateTripModal] DB places load error:", err.message);
        setPlacesError(
          isAr
            ? "تعذر الاتصال بقاعدة بيانات المعالم السياحية. يرجى التحقق من تشغيل الخادم والمحاولة مجدداً."
            : "Failed to load landmarks from database. Please verify connection and retry."
        );
      })
      .finally(() => {
        setLoadingPlaces(false);
      });
  };

  // Canonical landmark items derived purely from database records
  const allAttractions = useMemo(() => {
    return dbPlaces.map((p) => {
      const pid = String(p.place_id || p.id || "").trim();
      return {
        id: pid,
        name: p.place_name || p.name || pid,
        nameEn: p.place_name || p.name || pid,
        city: p.city || "ليبيا",
        cityEn: p.city || "Libya",
        region: p.region || p.city || "ليبيا",
        category: p.category || "معلم سياحي",
        image: p.place_image || p.photo || resolveTripImage(p.place_name),
      };
    });
  }, [dbPlaces]);

  // Extract available cities for filtering
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allAttractions.forEach((a) => {
      if (a.city && a.city.trim()) set.add(a.city.trim());
    });
    return Array.from(set);
  }, [allAttractions]);

  // Multi-select state for tourist landmarks (stores genuine database IDs)
  const [selectedLandmarkIds, setSelectedLandmarkIds] = useState<string[]>([]);
  const [landmarkSearch, setLandmarkSearch] = useState("");
  const [landmarkCityFilter, setLandmarkCityFilter] = useState("all");
  const [landmarkCategoryFilter, setLandmarkCategoryFilter] = useState("all");

  // Dynamic guides state
  const [dbGuides, setDbGuides] = useState<any[]>([]);
  useEffect(() => {
    if (open) {
      fetch(`${LARAVEL_API_URL}/guides?status=${encodeURIComponent("موثق")}`, { headers: { Accept: "application/json" } })
        .then((r) => r.json())
        .then((res) => {
          if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
            setDbGuides(res.data);
          }
        })
        .catch(() => {});
    }
  }, [open]);

  const allGuides = useMemo(() => {
    const map = new Map<string, {
      licenseNumber: string;
      name: string;
      gender: "male" | "female";
      avatar: string;
      title: string;
      experienceYears: number;
      rating: number;
      reviewsCount: number;
      pricePerDay: number;
      primaryRegion: string;
      operatingRegions: string[];
      languages: { code: string; nameAr: string; nameEn: string }[];
    }>();

    TOUR_GUIDES_DATA.forEach((g) => {
      map.set(g.licenseNumber, {
        licenseNumber: g.licenseNumber,
        name: g.name,
        gender: g.gender || "male",
        avatar: g.avatar,
        title: g.title,
        experienceYears: g.experienceYears,
        rating: g.rating,
        reviewsCount: g.reviewsCount,
        pricePerDay: g.pricePerDay,
        primaryRegion: g.primaryRegion,
        operatingRegions: g.operatingRegions || [],
        languages: g.languages || [{ code: "AR", nameAr: "العربية", nameEn: "Arabic" }],
      });
    });

    dbGuides.forEach((g) => {
      const lic = g.license_number || g.licenseNumber;
      if (!lic) return;
      if (!map.has(lic)) {
        const langs: { code: string; nameAr: string; nameEn: string }[] = [
          { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
        ];
        if (g.speaks_english) langs.push({ code: "EN", nameAr: "الإنجليزية", nameEn: "English" });
        if (g.speaks_french) langs.push({ code: "FR", nameAr: "الفرنسية", nameEn: "French" });
        if (g.speaks_italian) langs.push({ code: "IT", nameAr: "الإيطالية", nameEn: "Italian" });

        map.set(lic, {
          licenseNumber: lic,
          name: g.full_name || g.name || lic,
          gender: g.gender === "female" ? "female" : "male",
          avatar: g.avatar || "/assets/guide-mohammed.jpg",
          title: g.title || "مرشد سياحي معتمد",
          experienceYears: g.years_of_experience || 2,
          rating: Number(g.rating_avg) || Number(g.rating) || 0,
          reviewsCount: Number(g.reviews_count) || Number(g.reviewsCount) || 0,
          pricePerDay: g.price_per_day || 180,
          primaryRegion: g.primaryRegion || "tripoli",
          operatingRegions: Array.isArray(g.operating_regions) ? g.operating_regions : ["tripoli"],
          languages: langs,
        });
      }
    });

    return Array.from(map.values());
  }, [dbGuides]);

  // Guide filtering states
  const [selectedGuideLicense, setSelectedGuideLicense] = useState<string>("");
  const [guideGenderFilter, setGuideGenderFilter] = useState<"all" | "male" | "female">("all");
  const [guideLanguageFilter, setGuideLanguageFilter] = useState<string>("all");
  const [guideRegionFilter, setGuideRegionFilter] = useState<string>("all");
  const [guideSearchTerm, setGuideSearchTerm] = useState<string>("");

  // Trip intake form fields
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split("T")[0];
  });
  const [durationDays, setDurationDays] = useState("3");
  const [companions, setCompanions] = useState("2");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [createdTripId, setCreatedTripId] = useState("");

  // Auto-fill and pending state restoration on modal open
  useEffect(() => {
    if (open) {
      setStep("form");
      setFormError(null);
      setShowAuthModal(false);
      const session = getStoredSession();
      setSessionData(session);
      loadLandmarks();

      // Check for saved pending private trip choices in sessionStorage
      try {
        const savedPending = sessionStorage.getItem("delni_pending_private_trip");
        if (savedPending) {
          const parsed = JSON.parse(savedPending);
          if (Array.isArray(parsed.selectedLandmarkIds) && parsed.selectedLandmarkIds.length > 0) {
            setSelectedLandmarkIds(parsed.selectedLandmarkIds);
          }
          if (parsed.startDate) setStartDate(parsed.startDate);
          if (parsed.durationDays) setDurationDays(parsed.durationDays);
          if (parsed.companions) setCompanions(parsed.companions);
          if (parsed.selectedGuideLicense) setSelectedGuideLicense(parsed.selectedGuideLicense);
          if (parsed.notes) setNotes(parsed.notes);
          if (parsed.phone) setPhone(parsed.phone);
          if (parsed.customerName) setCustomerName(parsed.customerName);
          sessionStorage.removeItem("delni_pending_private_trip");
        }
      } catch (_) {}

      // Auto-fill tourist details from active authenticated account
      if (session?.user && session?.role === "tourist") {
        setCustomerName((prev) => prev || session.user.full_name || session.user.fullName || session.user.name || "");
        setPhone((prev) => prev || session.user.phone_number || session.user.phone || "");
      }

      if (initialDestination) {
        const clean = initialDestination.toLowerCase();
        const found = allAttractions.find(
          (a) =>
            a.name.toLowerCase().includes(clean) ||
            clean.includes(a.name.toLowerCase()) ||
            (a.city && clean.includes(a.city.toLowerCase()))
        );
        if (found) setSelectedLandmarkIds([found.id]);
      }

      if (initialGuide) {
        const foundG = TOUR_GUIDES_DATA.find((g) => g.name.includes(initialGuide) || initialGuide.includes(g.name));
        if (foundG) setSelectedGuideLicense(foundG.licenseNumber);
      }
    }
  }, [open, initialDestination, initialGuide]);

  // Set default landmark when database landmarks arrive if none selected yet
  useEffect(() => {
    if (allAttractions.length > 0 && selectedLandmarkIds.length === 0) {
      setSelectedLandmarkIds([allAttractions[0].id]);
    }
  }, [allAttractions, selectedLandmarkIds.length]);

  // Selected landmarks array derived from database IDs
  const selectedLandmarks = useMemo(() => {
    return allAttractions.filter((a) => selectedLandmarkIds.includes(a.id));
  }, [allAttractions, selectedLandmarkIds]);

  // Filtered landmarks for search, city, and category
  const filteredLandmarks = useMemo(() => {
    return allAttractions.filter((lm) => {
      if (landmarkCityFilter !== "all" && lm.city !== landmarkCityFilter) {
        return false;
      }
      if (landmarkCategoryFilter !== "all") {
        if (!lm.category || !lm.category.includes(landmarkCategoryFilter)) return false;
      }
      if (landmarkSearch.trim()) {
        const term = landmarkSearch.toLowerCase();
        const matchName = lm.name && lm.name.toLowerCase().includes(term);
        const matchCity = lm.city && lm.city.toLowerCase().includes(term);
        const matchRegion = lm.region && lm.region.toLowerCase().includes(term);
        if (!matchName && !matchCity && !matchRegion) return false;
      }
      return true;
    });
  }, [allAttractions, landmarkCityFilter, landmarkCategoryFilter, landmarkSearch]);

  const toggleLandmark = (id: string) => {
    setSelectedLandmarkIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) {
          return prev; // keep at least one
        }
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Filtered guides list
  const filteredGuides = useMemo(() => {
    return allGuides.filter((g) => {
      if (guideGenderFilter !== "all" && g.gender !== guideGenderFilter) {
        return false;
      }
      if (guideLanguageFilter !== "all") {
        const hasLang = g.languages?.some(
          (l) => l.code === guideLanguageFilter || l.nameAr.includes(guideLanguageFilter)
        );
        if (!hasLang) return false;
      }
      if (guideRegionFilter !== "all") {
        const matchPrimary = g.primaryRegion === guideRegionFilter;
        const matchOps = Array.isArray(g.operatingRegions) && g.operatingRegions.includes(guideRegionFilter);
        if (!matchPrimary && !matchOps) return false;
      }
      if (guideSearchTerm.trim()) {
        const term = guideSearchTerm.toLowerCase();
        const matchName = g.name.toLowerCase().includes(term);
        const matchTitle = g.title?.toLowerCase().includes(term);
        const matchLic = g.licenseNumber.toLowerCase().includes(term);
        if (!matchName && !matchTitle && !matchLic) return false;
      }
      return true;
    });
  }, [allGuides, guideGenderFilter, guideLanguageFilter, guideRegionFilter, guideSearchTerm]);

  // Selected tour guide object
  const selectedGuide = useMemo(() => {
    if (!selectedGuideLicense) return null;
    return allGuides.find((g) => g.licenseNumber === selectedGuideLicense) || null;
  }, [allGuides, selectedGuideLicense]);

  // Submission handler with comprehensive role, activation, and session verification
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Validate destination landmarks selection
    if (selectedLandmarkIds.length === 0) {
      setFormError(
        isAr
          ? "يرجى اختيار معلم سياحي واحد على الأقل من قائمة المعالم لتحديد مسار الرحلة الخاصة."
          : "Please select at least one tourist destination landmark."
      );
      return;
    }

    // 2. Strict 10-day Start Date Validation (يجب أن يكون موعد الانطلاق بعد 10 أيام على الأقل)
    const minDateAllowed = new Date();
    minDateAllowed.setHours(0, 0, 0, 0);
    minDateAllowed.setDate(minDateAllowed.getDate() + 10);

    const chosenDate = startDate ? new Date(startDate) : new Date();
    chosenDate.setHours(0, 0, 0, 0);

    if (chosenDate < minDateAllowed) {
      setFormError(
        isAr
          ? "تنبيه: يجب أن يكون تاريخ بدء الرحلة الخاصة بعد 10 أيام على الأقل من اليوم لإعطاء الإدارة والمرشدين الوقت الكافي لدراسة المسار واعتماده وتجهيز المركبات."
          : "Start date must be at least 10 days from today to allow adequate planning and logistics."
      );
      return;
    }

    // 3. Authentication & Account Status Verification
    const session = getStoredSession();
    const token = session?.token;
    const role = session?.role || session?.user?.role;

    // Case 2: User is NOT logged in -> Save pending trip data & show login prompt
    if (!token || !role) {
      try {
        sessionStorage.setItem(
          "delni_pending_private_trip",
          JSON.stringify({
            selectedLandmarkIds,
            startDate,
            durationDays,
            companions,
            selectedGuideLicense,
            notes,
            customerName,
            phone,
          })
        );
      } catch (_) {}

      setShowAuthModal(true);
      return;
    }

    // Case 4: Logged in with a NON-TOURIST role (Admin, Driver, Guide, Transport)
    if (role !== "tourist") {
      setFormError(
        isAr
          ? `عذراً، طلب وحجز الرحلات الخاصة متاح حصرياً لحسابات السياح المعتمدة. حسابك الحالي مسجل كـ (${userRoleTitle}). يرجى تسجيل الدخول بحساب سائح لإتمام الطلب.`
          : "Custom private tour booking is reserved exclusively for tourist accounts."
      );
      return;
    }

    // Case 3: Tourist account is suspended / inactive
    const touristStatus = session?.user?.account_status;
    if (touristStatus && (touristStatus === "معلق" || touristStatus === "محظور" || touristStatus === "غير نشط")) {
      setFormError(
        isAr
          ? "عذراً، حسابك بحاجة إلى تفعيل من قبل إدارة المنصة قبل تأكيد طلب الرحلة الخاصة. يرجى مراجعة إدارة المنصة أو الدعم الفني."
          : "Your tourist account requires activation before submitting private tour requests. Please contact platform support."
      );
      return;
    }

    // Case 1: Active Logged-in Tourist -> Process and Save to Database
    setIsSubmitting(true);

    const touristId = session?.user?.tourist_id || session?.user?.id || session?.user?.username || null;
    const placesNames = selectedLandmarks.map((l) => l.name).join(" • ");
    const placesWithCities = selectedLandmarks.map((l) => `${l.name} (${l.city})`).join("، ");

    const guideRequirement = selectedGuide
      ? `المرشد المفضل: ${selectedGuide.name} [ترخيص: ${selectedGuide.licenseNumber} - ${selectedGuide.gender === "female" ? "مرشدة" : "مرشد"}]. `
      : "المرشد: تكليف مرشد سياحي معتمد بمعرفة إدارة المنصة. ";

    const requirements = `المعالم السياحية المستهدفة: ${placesWithCities}. ${guideRequirement}${notes ? `ملاحظات ومتطلبات السائح: ${notes}` : ""}`.trim();

    // The id, status and price are set by the server; the tourist only sends the request details
    const payload = {
      preferred_start_date: startDate,
      duration_days: Math.max(1, parseInt(durationDays, 10) || 1),
      number_of_companions: Math.max(1, parseInt(companions, 10) || 1),
      guide_license_number: selectedGuideLicense || null,
      tourist_id: touristId,
      customer_requirements: requirements,
      place_ids: selectedLandmarkIds,
    };

    try {
      const res = await apiRequestPrivateTrip(payload);
      if (!res.success) {
        throw new Error(res.error);
      }
      setCreatedTripId(res.tripId || "");
      sessionStorage.removeItem("delni_pending_private_trip");
      setStep("done");
    } catch (err: any) {
      setFormError(err.message || "حدث خطأ أثناء إرسال وتأكيد الطلب. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} size="2xl">
      {step === "form" ? (
        <div className="p-5 sm:p-8 pb-10 sm:pb-12 bg-[#FAF7F2] dark:bg-slate-950 text-slate-800 dark:text-slate-100 space-y-6 relative" dir={dir}>
          
          {/* ── 1. Header Banner: Clean Libyan Heritage Aesthetic (NO LOGIN BANNER AT TOP) ── */}
          <div className="text-center pt-1 border-b border-[#E8E2D6] dark:border-slate-800 pb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="h-px w-12 sm:w-24 bg-[#D4A373]/60" />
              <span className="text-xs sm:text-sm font-bold text-[#B85D36] flex items-center gap-1.5 tracking-wide">
                <span>🏛️</span>
                <span>{isAr ? "السياحة والتراث في ليبيا • رحلات كبار الشخصيات VIP" : "Libyan Heritage & VIP Custom Tours"}</span>
              </span>
              <span className="h-px w-12 sm:w-24 bg-[#D4A373]/60" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#0B132B] dark:text-white tracking-tight">
              {isAr ? "طلب رحلة سياحية خاصة مخصصة" : "Custom Private Tour Request"}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 max-w-2xl mx-auto leading-relaxed">
              {isAr
                ? "صمّم خط سير رحلتك الخاصة باختيار معالمك المفضلة من قاعدة بيانات المنصة وتحديد مواصفات المرشد السياحي، لتتولى إدارة المنصة دراسة المسار وتقديم تسعيرة رسمية معتمدة."
                : "Curate your bespoke private itinerary across Libyan landmarks with tailor-fit tour guide filtering and official administration quotation."}
            </p>
          </div>

          {formError && (
            <div className="p-4 rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <span className="text-base shrink-0">⚠️</span>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ══════════════════════════════════════════════════════════════════════
                قسم 1: اختيار المعالم السياحية
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#B85D36]/15 text-[#B85D36] flex items-center justify-center font-black text-sm">
                    1
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B132B] dark:text-white">
                      {isAr ? "اختيار المعالم والوجهات السياحية" : "Select Destinations from Database"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr
                        ? "معالم حقيقية مسجلة بالمنصة. يمكنك اختيار معلم واحد أو عدة معالم لتشكيل مسار متكامل"
                        : "Live landmarks from platform catalog. Select one or multiple to curate your custom route"}
                    </p>
                  </div>
                </div>

                <div className="text-xs font-black px-3 py-1 rounded-full bg-[#FAF7F2] dark:bg-slate-800 text-[#B85D36] border border-[#E8E2D6] dark:border-slate-700">
                  {isAr ? `تم اختيار (${selectedLandmarkIds.length}) معالم` : `(${selectedLandmarkIds.length}) Selected`}
                </div>
              </div>

              {/* Selected Landmarks Chips Bar */}
              <div className="p-3 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8E2D6] dark:border-slate-700/80">
                <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-2">
                  {isAr ? "المعالم المحددة في مسارك الحالي:" : "Selected Landmarks in your Itinerary:"}
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {selectedLandmarks.map((lm) => (
                    <span
                      key={lm.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-900 border border-[#B85D36]/40 text-slate-800 dark:text-slate-100 text-xs font-bold shadow-2xs"
                    >
                      <span className="text-amber-600">🏛️</span>
                      <span>{isAr ? lm.name : lm.nameEn}</span>
                      <span className="text-[10px] text-slate-400">({isAr ? lm.city : lm.cityEn})</span>
                      <button
                        type="button"
                        onClick={() => toggleLandmark(lm.id)}
                        title={isAr ? "إزالة من المسار" : "Remove"}
                        className="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white flex items-center justify-center text-[10px] transition cursor-pointer"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  {selectedLandmarks.length === 0 && (
                    <span className="text-xs text-rose-500 font-bold">
                      {isAr ? "يرجى اختيار معلم سياحي واحد على الأقل من القائمة أدناه" : "Please select at least one landmark"}
                    </span>
                  )}
                </div>
              </div>

              {/* Search & City Filter Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                {/* Search Text Input */}
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={landmarkSearch}
                    onChange={(e) => setLandmarkSearch(e.target.value)}
                    placeholder={isAr ? "🔍 ابحث عن معلم أو مدينة (طرابلس، الخمس، غريان، أوباري، بنغازي...)" : "Search landmark or city..."}
                    className="w-full h-9 px-3 text-xs font-bold rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 outline-none focus:border-[#B85D36]"
                  />
                  {landmarkSearch && (
                    <button
                      type="button"
                      onClick={() => setLandmarkSearch("")}
                      className="absolute left-2.5 top-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* City Filter Dropdown */}
                {availableCities.length > 0 && (
                  <div className="sm:w-44">
                    <select
                      value={landmarkCityFilter}
                      onChange={(e) => setLandmarkCityFilter(e.target.value)}
                      className="w-full h-9 px-2.5 rounded-xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="all">{isAr ? "جميع المدن" : "All Cities"}</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          📍 {city}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Multi-Select Landmarks Grid with Loading / Error / Dynamic Cards */}
              {loadingPlaces ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 p-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-slate-200/60 dark:bg-slate-800 animate-pulse border border-slate-200/50" />
                  ))}
                </div>
              ) : placesError ? (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs flex flex-col items-center justify-center gap-2 text-center">
                  <span>⚠️ {placesError}</span>
                  <button
                    type="button"
                    onClick={loadLandmarks}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition text-xs cursor-pointer shadow-sm"
                  >
                    {isAr ? "إعادة المحاولة" : "Retry"}
                  </button>
                </div>
              ) : filteredLandmarks.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 font-bold border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl">
                  {isAr ? "لا توجد معالم تطابق معايير البحث والفلترة المحددة." : "No landmarks match your search criteria."}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto p-1.5 border border-[#E8E2D6]/80 dark:border-slate-800 rounded-2xl bg-[#FAF7F2]/40 dark:bg-slate-900/50">
                  {filteredLandmarks.map((lm) => {
                    const isChecked = selectedLandmarkIds.includes(lm.id);
                    return (
                      <div
                        key={lm.id}
                        onClick={() => toggleLandmark(lm.id)}
                        className={`p-3 rounded-2xl border text-right transition cursor-pointer select-none flex items-center justify-between gap-3 ${
                          isChecked
                            ? "bg-amber-50/70 dark:bg-slate-800 border-[#B85D36] ring-2 ring-[#B85D36]/30 shadow-xs"
                            : "bg-white dark:bg-slate-900 border-[#E8E2D6] dark:border-slate-800 hover:border-[#B85D36]/50"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {lm.image ? (
                            <img
                              src={lm.image}
                              alt={lm.name}
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200 dark:border-slate-700 shadow-2xs"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-[#B85D36]/10 text-[#B85D36] flex items-center justify-center text-xl shrink-0 font-bold">
                              🏛️
                            </div>
                          )}
                          <div className="space-y-0.5 min-w-0 flex-1">
                            <div className="font-black text-xs text-slate-900 dark:text-white truncate">
                              {isAr ? lm.name : lm.nameEn}
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                              <span>📍 {isAr ? lm.city : lm.cityEn}</span>
                              {lm.category && <span>• {lm.category}</span>}
                            </div>
                          </div>
                        </div>

                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-xs font-black shrink-0 transition ${
                          isChecked ? "bg-[#B85D36] text-white" : "border border-slate-300 dark:border-slate-600"
                        }`}>
                          {isChecked ? "✓" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
                قسم 2: توقيت الرحلة، المدة، وعدد المسافرين
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#B85D36]/15 text-[#B85D36] flex items-center justify-center font-black text-sm">
                  2
                </span>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0B132B] dark:text-white">
                    {isAr ? "توقيت وتفاصيل الرحلة والمرافقين" : "Trip Schedule & Party Details"}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isAr ? "حدد تاريخ الانطلاق المفضل والمدة التقديرية وعدد الركاب" : "Specify start date, duration, and number of passengers"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Preferred Start Date */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 space-y-1.5">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block flex items-center justify-between">
                    <span>📅 {isAr ? "تاريخ الانطلاق المفضل" : "Preferred Start Date"}</span>
                    <span className="text-[10px] text-[#B85D36] font-bold">({isAr ? "بعد 10 أيام كحد أدنى" : "Min 10 days ahead"})</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-transparent font-black text-xs text-slate-800 dark:text-slate-100 outline-none"
                  />
                </div>

                {/* Duration in Days */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 space-y-1.5">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">
                    ⏱️ {isAr ? "مدة الرحلة (بالأيام)" : "Duration (Days)"}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationDays(String(Math.max(1, (parseInt(durationDays, 10) || 1) - 1)))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      required
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="w-14 text-center bg-transparent font-black text-xs text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setDurationDays(String(Math.min(30, (parseInt(durationDays, 10) || 1) + 1)))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-400 font-bold">{isAr ? "أيام" : "days"}</span>
                  </div>
                </div>

                {/* Companions Count */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 space-y-1.5">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">
                    👥 {isAr ? "عدد المسافرين / المرافقين" : "Companions / Pax"}
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCompanions(String(Math.max(1, (parseInt(companions, 10) || 1) - 1)))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      required
                      value={companions}
                      onChange={(e) => setCompanions(e.target.value)}
                      className="w-14 text-center bg-transparent font-black text-xs text-slate-800 dark:text-slate-100 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setCompanions(String(Math.min(50, (parseInt(companions, 10) || 1) + 1)))}
                      className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 font-black text-sm flex items-center justify-center hover:bg-slate-100 cursor-pointer"
                    >
                      +
                    </button>
                    <span className="text-xs text-slate-400 font-bold">{isAr ? "أفراد" : "pax"}</span>
                  </div>
                </div>
              </div>

              {/* Dedicated Vehicle & Driver Notice */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5 text-xs">
                <span className="text-base text-emerald-700 dark:text-emerald-300">🚍</span>
                <div>
                  <span className="font-black text-emerald-900 dark:text-emerald-200 block">
                    {isAr ? "وسيلة النقل والسائق السياحي المعتمد:" : "Vehicle & Professional Driver:"}
                  </span>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed font-medium">
                    {isAr
                      ? "تُعين وسيلة النقل (حافلة سياحية VIP حديثة أو سيارة دفع رباعي 4x4 للطرق الصحراوية) مع سائق محترف مرخص بمعرفة إدارة المنصة بناءً على عدد الأفراد وطبيعة تضاريس المعالم المختارة."
                      : "Vehicles (VIP modern van or 4x4 desert SUV) and licensed professional drivers are assigned directly by platform administration based on itinerary terrain and party size."}
                  </p>
                </div>
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
                قسم 3: المرشد السياحي والفلترة الذكية (Gender & Language Filters)
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#B85D36]/15 text-[#B85D36] flex items-center justify-center font-black text-sm">
                    3
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B132B] dark:text-white">
                      {isAr ? "اختيار المرشد السياحي المعتمد والفلترة الذكية" : "Tour Guide Selection & Smart Filters"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr
                        ? "فلترة واختيار المرشد الأنسب لرحلتك من حيث الجنس (مرشد / مرشدة)، اللغات المتحدثة، والمنطقة"
                        : "Filter guides by gender, spoken languages, and operating regions to match your group"}
                    </p>
                  </div>
                </div>

                {selectedGuide && (
                  <div className="text-xs font-black px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                    {isAr ? `المرشد المفضل: ${selectedGuide.name}` : `Selected: ${selectedGuide.name}`}
                  </div>
                )}
              </div>

              {/* Guide Filters Toolbar */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800/60 border border-[#E8E2D6] dark:border-slate-700 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                  
                  {/* Filter: Gender (ذكور / إناث) */}
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      👤 {isAr ? "تفضيل جنس المرشد السياحي:" : "Guide Gender Preference:"}
                    </label>
                    <div className="grid grid-cols-3 gap-1 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setGuideGenderFilter("all")}
                        className={`h-8 rounded-xl transition cursor-pointer ${
                          guideGenderFilter === "all"
                            ? "bg-[#B85D36] text-white shadow-xs"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {isAr ? "الكل" : "All"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideGenderFilter("male")}
                        className={`h-8 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                          guideGenderFilter === "male"
                            ? "bg-[#0B132B] text-white shadow-xs"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <span>👨</span>
                        <span>{isAr ? "مرشد (ذكر)" : "Male"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideGenderFilter("female")}
                        className={`h-8 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
                          guideGenderFilter === "female"
                            ? "bg-emerald-700 text-white shadow-xs"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        <span>👩</span>
                        <span>{isAr ? "مرشدة (أنثى)" : "Female"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter: Spoken Language */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      🌐 {isAr ? "اللغات المتحدثة:" : "Spoken Languages:"}
                    </label>
                    <select
                      value={guideLanguageFilter}
                      onChange={(e) => setGuideLanguageFilter(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="all">{isAr ? "جميع اللغات" : "All Languages"}</option>
                      <option value="AR">{isAr ? "العربية" : "Arabic"}</option>
                      <option value="EN">{isAr ? "الإنجليزية" : "English"}</option>
                      <option value="FR">{isAr ? "الفرنسية" : "French"}</option>
                      <option value="IT">{isAr ? "الإيطالية" : "Italian"}</option>
                    </select>
                  </div>

                  {/* Filter: Operating Region */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                      📍 {isAr ? "المنطقة / التخصص:" : "Region:"}
                    </label>
                    <select
                      value={guideRegionFilter}
                      onChange={(e) => setGuideRegionFilter(e.target.value)}
                      className="w-full h-8 px-2.5 rounded-xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 outline-none cursor-pointer"
                    >
                      <option value="all">{isAr ? "جميع المناطق" : "All Regions"}</option>
                      <option value="tripoli">{isAr ? "طرابلس وضواحيها" : "Tripoli"}</option>
                      <option value="leptis">{isAr ? "لبدة والخمس" : "Leptis Magna"}</option>
                      <option value="sabratha">{isAr ? "صبراتة والساحل الغربي" : "Sabratha"}</option>
                      <option value="cyrene">{isAr ? "شحات وقورينا (الجبل الأخضر)" : "Cyrene"}</option>
                      <option value="ghadames">{isAr ? "غدامس والواحات" : "Ghadames"}</option>
                      <option value="ubari">{isAr ? "أوباري والجنوب" : "Ubari / South"}</option>
                      <option value="benghazi">{isAr ? "بنغازي والمنطقة الشرقية" : "Benghazi"}</option>
                    </select>
                  </div>
                </div>

                {/* Guide Name Search */}
                <div>
                  <input
                    type="text"
                    value={guideSearchTerm}
                    onChange={(e) => setGuideSearchTerm(e.target.value)}
                    placeholder={isAr ? "🔍 ابحث باسم المرشد أو الترخيص..." : "Search guide by name or license..."}
                    className="w-full h-8 px-3 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-700 outline-none"
                  />
                </div>
              </div>

              {/* Guide Selection Options */}
              <div className="space-y-2 max-h-56 overflow-y-auto p-1">
                {/* Default Choice: No Guide Preference (Platform Assigns) */}
                <div
                  onClick={() => setSelectedGuideLicense("")}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                    selectedGuideLicense === ""
                      ? "bg-amber-50/80 dark:bg-amber-950/40 border-[#B85D36] ring-1 ring-[#B85D36] shadow-xs"
                      : "bg-[#FAF7F2] dark:bg-slate-800/50 border-[#E8E2D6] dark:border-slate-700 hover:border-[#B85D36]/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[#B85D36]/15 text-[#B85D36] flex items-center justify-center font-bold text-sm shrink-0">
                      ⭐
                    </span>
                    <div>
                      <div className="font-black text-xs text-slate-900 dark:text-white">
                        {isAr ? "بدون مرشد مفضل (تكليف مرشد معتمد بمعرفة إدارة المنصة)" : "No Guide Preference (Assigned by Platform Admin)"}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isAr
                          ? "ستقوم الإدارة باختيار المرشد الأنسب تلقائياً بناءً على طبيعة المعالم ولغات الفوج السياحي"
                          : "Administration will automatically pair you with the best available guide for your itinerary"}
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                    selectedGuideLicense === "" ? "bg-[#B85D36] text-white" : "border border-slate-300 dark:border-slate-600"
                  }`}>
                    {selectedGuideLicense === "" ? "✓" : ""}
                  </div>
                </div>

                {/* Filtered Guide Cards */}
                {filteredGuides.map((g) => {
                  const isSelected = selectedGuideLicense === g.licenseNumber;
                  return (
                    <div
                      key={g.licenseNumber}
                      onClick={() => setSelectedGuideLicense(g.licenseNumber)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? "bg-white dark:bg-slate-800 border-[#B85D36] ring-1 ring-[#B85D36] shadow-xs"
                          : "bg-white dark:bg-slate-900 border-[#E8E2D6] dark:border-slate-800 hover:border-[#B85D36]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-200 shrink-0">
                          {g.gender === "female" ? "👩" : "👨"}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-xs text-slate-900 dark:text-white">{g.name}</span>
                            <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${
                              g.gender === "female"
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : "bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300"
                            }`}>
                              {g.gender === "female" ? (isAr ? "مرشدة سياحية" : "Female Guide") : (isAr ? "مرشد سياحي" : "Male Guide")}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">({g.licenseNumber})</span>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span>{g.reviewsCount > 0 ? `★ ${g.rating.toFixed(1)} (${g.reviewsCount})` : (isAr ? "مرشد معتمد جديد" : "New Certified Guide")}</span>
                            <span>•</span>
                            <span>{g.title}</span>
                            <span>•</span>
                            <span className="text-[#B85D36] font-bold">{g.pricePerDay} د.ل / يوم</span>
                          </div>

                          <div className="flex items-center gap-1 pt-0.5 flex-wrap">
                            {g.languages?.map((lang) => (
                              <span key={lang.code} className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-300 font-medium">
                                {isAr ? lang.nameAr : lang.nameEn}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        isSelected ? "bg-[#B85D36] text-white" : "border border-slate-300 dark:border-slate-600"
                      }`}>
                        {isSelected ? "✓" : ""}
                      </div>
                    </div>
                  );
                })}

                {filteredGuides.length === 0 && (
                  <div className="text-center py-4 text-xs text-slate-400 font-bold">
                    {isAr ? "لا توجد مرشدين يطابقون معايير الفلترة المحددة. يمكنك تعديل خيارات الفلترة أو اختيار (بدون مرشد مفضل)." : "No guides match your filter."}
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
                قسم 4: بيانات التواصل وملاحظات السائح (Auto-populated for tourists)
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="rounded-3xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-[#B85D36]/15 text-[#B85D36] flex items-center justify-center font-black text-sm">
                    4
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-[#0B132B] dark:text-white">
                      {isAr ? "بيانات التواصل وملاحظات السائح" : "Contact Information & Tourist Notes"}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isAr ? "يرجى التحقق من صحة رقم الهاتف لتلقي إشعار التسعيرة الرسمية" : "Ensure contact number is correct to receive your official quote"}
                    </p>
                  </div>
                </div>

                {isTourist && (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300/60 flex items-center gap-1.5">
                    <span>✓</span>
                    <span>{isAr ? "تم جلب بياناتك تلقائياً من حسابك" : "Auto-filled from account"}</span>
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tourist Name (Auto-fetched from account) */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block flex items-center justify-between">
                    <span>👤 {isAr ? "اسم السائح صاحب الحساب" : "Tourist Account Holder"}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">🔒 {isAr ? "موثق من الحساب" : "Verified"}</span>
                  </label>
                  <div className="font-black text-xs text-slate-800 dark:text-slate-100 py-1">
                    {customerName || sessionData?.user?.full_name || sessionData?.user?.name || (isAr ? "سائح دلّني المعتمد" : "Verified Tourist")}
                  </div>
                </div>

                {/* Phone (Auto-fetched from account) */}
                <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 space-y-1">
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block flex items-center justify-between">
                    <span>📞 {isAr ? "رقم الهاتف المعتمد بالحساب" : "Registered Phone"}</span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">🔒 {isAr ? "من ملفك الشخصي" : "Profile"}</span>
                  </label>
                  <div className="font-black text-xs text-slate-800 dark:text-slate-100 py-1 font-mono">
                    {phone || sessionData?.user?.phone_number || (isAr ? "مسجل في حسابك" : "On file")}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] dark:bg-slate-800 border border-[#E8E2D6] dark:border-slate-700 space-y-1.5">
                <label className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">
                  📝 {isAr ? "ملاحظات أو متطلبات خاصة (اختياري)" : "Special Requests or Notes (Optional)"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isAr
                    ? "أي تفاصيل إضافية تود إبلاغ إدارة المنصة بها (حجز فنادق محددة، معدات تخييم، سيارات دفع رباعي صحراوية، تصاريح أمنية، وجبات غذائية)..."
                    : "Any specific accommodation, 4x4 desert permits, or dietary requirements..."}
                  className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 outline-none font-medium resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════════════════════
                زر تأكيد طلب الرحلة الخاصة للإدارة
            ══════════════════════════════════════════════════════════════════════ */}
            <div className="pt-2 space-y-2 text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 rounded-full font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer bg-[#B85D36] hover:bg-[#a04e2c] text-white hover:shadow-lg active:scale-[0.99] disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isAr ? "جارٍ معالجة وتأكيد الطلب..." : "Processing Custom Tour Request..."}</span>
                  </>
                ) : (
                  <>
                    <span>{isAr ? "تأكيد طلب الرحلة الخاصة للإدارة (تسعير واعتماد المسار)" : "Confirm Custom Tour Request"}</span>
                    <span className="text-base">➔</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg mx-auto">
                {isAr
                  ? "💡 بمجرد تأكيد الطلب، ستتولى إدارة المنصة دراسة مسار المعالم المختارة وإعداد البرنامج المقترح والتسعيرة الرسمية وإشعارك فوراً عبر المنصة."
                  : "Platform administration will review your requested landmarks, create an itinerary, and notify you with an official price quote."}
              </p>
            </div>
          </form>

          {/* ══════════════════════════════════════════════════════════════════════
              نافذة التحقق والمصادقة عند الضغط على تأكيد الطلب (Case 2: Not logged in)
          ══════════════════════════════════════════════════════════════════════ */}
          {showAuthModal && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-amber-300 dark:border-amber-700 text-center space-y-4 animate-in zoom-in-95 duration-200" dir={dir}>
                <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-3xl shadow-xs">
                  🔒
                </div>
                
                <div className="space-y-1.5">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {isAr ? "تسجيل الدخول مطلوب لتأكيد الطلب" : "Tourist Account Required"}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {isAr
                      ? "حجز وتأكيد الرحلات الخاصة متاح حصرياً لحسابات السياح المعتمدة في نظام دلني. لقد قمنا بحفظ اختياراتك ومعالمك المحددة لتستكمل تأكيد الطلب فور تسجيل الدخول دون أن تضطر لإعادة إدخالها."
                      : "Booking is reserved for tourist accounts. Your selected landmarks and options have been temporarily saved."}
                  </p>
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <a
                    href="/auth/login?role=tourist"
                    className="w-full py-3 rounded-2xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition shadow-md flex items-center justify-center gap-2"
                  >
                    <span>🔑</span>
                    <span>{isAr ? "تسجيل الدخول بحساب سائح" : "Log In as Tourist"}</span>
                  </a>

                  <a
                    href="/auth/signup?role=tourist"
                    className="w-full py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-50 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-black text-xs transition shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>✨</span>
                    <span>{isAr ? "إنشاء حساب سائح جديد" : "Create Tourist Account"}</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setShowAuthModal(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold py-1.5 transition cursor-pointer"
                  >
                    {isAr ? "الرجوع ومواصلة تعديل الطلب" : "Cancel & Keep Editing"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* ══════════════════════════════════════════════════════════════════════
            شاشة النجاح والتأكيد (Done Screen)
        ══════════════════════════════════════════════════════════════════════ */
        <div className="p-8 sm:p-12 text-center bg-[#FAF7F2] dark:bg-slate-950 text-slate-800 dark:text-slate-100 space-y-5" dir={dir}>
          <div className="w-20 h-20 mx-auto rounded-full bg-[#B85D36]/15 text-[#B85D36] grid place-items-center text-4xl shadow-sm border border-[#B85D36]/30">
            🏛️
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-[#0B132B] dark:text-white">
              {isAr ? "تم استلام طلب رحلتك الخاصة بنجاح!" : "Private Tour Request Submitted!"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
              {isAr
                ? "تم توجيه طلبك مباشرة إلى لوحة إدارة المنصة (Admin) لجدولة المعالم السياحية المختارة وإعداد خطة السير والتسعيرة المعتمدة."
                : "Your request is now queued for administrative route coordination and official quotation."}
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-[#E8E2D6] dark:border-slate-800 max-w-lg mx-auto text-right text-xs space-y-3 shadow-xs">
            <div className="flex justify-between border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold">{isAr ? "رقم الطلب المرجعي:" : "Reference #:"}</span>
              <span className="font-mono font-black text-[#B85D36]">#{createdTripId}</span>
            </div>

            <div className="border-b border-[#E8E2D6] dark:border-slate-800 pb-2">
              <span className="text-slate-500 font-bold block mb-1">
                {isAr ? `المعالم السياحية المستهدفة (${selectedLandmarks.length}):` : `Landmarks (${selectedLandmarks.length}):`}
              </span>
              <div className="flex flex-wrap gap-1">
                {selectedLandmarks.map((lm) => (
                  <span key={lm.id} className="px-2 py-0.5 rounded-md bg-[#FAF7F2] dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-[11px] border border-[#E8E2D6] dark:border-slate-700">
                    🏛️ {isAr ? lm.name : lm.nameEn} ({isAr ? lm.city : lm.cityEn})
                  </span>
                ))}
              </div>
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
              <span className="text-slate-500 font-bold">{isAr ? "المرشد السياحي المفضل:" : "Tour Guide:"}</span>
              <span className="font-black text-slate-800 dark:text-slate-200">
                {selectedGuide ? `${selectedGuide.name} (${selectedGuide.licenseNumber})` : (isAr ? "تكليف بمعرفة إدارة المنصة" : "Assigned by Platform Admin")}
              </span>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-slate-500 font-bold">{isAr ? "حالة الطلب:" : "Status:"}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                {isAr ? "بانتظار تسعير الإدارة" : "Pending Admin Quote"}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-8 h-11 rounded-full bg-[#B85D36] hover:bg-[#a04e2c] text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              {isAr ? "تم، إغلاق" : "Done, Close"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
