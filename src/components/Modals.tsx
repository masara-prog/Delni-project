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
import { apiBookDailyTrip, apiBookWeeklyTrip, apiGetDailyDepartures, apiGetTouristBookings, apiRequestPrivateTrip, getStoredSession, apiGetReviews, apiAddReview, type DailyDeparture, type PublicReview, type ReviewType } from "@/lib/api";

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
  const [bookingId, setBookingId] = useState("");
  // Daily trips are booked for one of their departure days (from the server, 24h cutoff applied there).
  const [departures, setDepartures] = useState<DailyDeparture[]>([]);
  const [departuresLoading, setDeparturesLoading] = useState(false);
  const isWeekly = !!item?.id && /^WT-/i.test(item.id);
  const selectedDeparture = departures.find((d) => d.date === date);

  useEffect(() => {
    if (!open || !item?.id || isWeekly) return;
    let cancelled = false;
    setDeparturesLoading(true);
    apiGetDailyDepartures(item.id).then((list) => {
      if (cancelled) return;
      setDepartures(list);
      setDeparturesLoading(false);
    });
    return () => { cancelled = true; };
  }, [open, item?.id, isWeekly]);

  useEffect(() => {
    if (open) {
      setStep("form");
      setSeats("2");
      setDate("");
      setDepartures([]);
      setBookingError(null);
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

  // Available seats: per departure day for daily trips, trip-wide for weekly trips
  const maxAvailable = !isWeekly
    ? (selectedDeparture ? selectedDeparture.remaining : 0)
    : typeof item.availableSeats === "number" ? item.availableSeats : 0;

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
              if (!isWeekly && !selectedDeparture) {
                setBookingError(isAr ? "يرجى اختيار يوم انطلاق من المواعيد المتاحة" : "Please choose one of the available departure days");
                return;
              }
              if (hasSeatError) return;
              if (!phone.match(/^09\d{8}$/)) return;
              setBookingError(null);

              // Save the booking in DelniDB through Laravel
              try {
                const session = getStoredSession();
                if (!session.token || session.role !== "tourist") {
                  setBookingError(isAr ? "يجب تسجيل الدخول بحساب سائح لإتمام الحجز" : "Please sign in with a tourist account to book");
                  return;
                }
                if (!item.id) {
                  setBookingError(isAr ? "هذه الرحلة غير مسجلة في قاعدة البيانات ولا يمكن حجزها" : "This trip is not in the database");
                  return;
                }
                const nSeats = parseInt(seats, 10) || 1;

                const res = isWeekly
                  ? await apiBookWeeklyTrip({ weekly_trip_id: item.id, number_of_seats: nSeats })
                  : await apiBookDailyTrip({ daily_trip_id: item.id, trip_date: date, number_of_seats: nSeats });

                if (res.status !== "success") {
                  setBookingError(res.message || (isAr ? "تعذر إتمام الحجز" : "Booking failed"));
                  return;
                }
                setBookingId(res.booking?.booking_daily_id || res.booking?.booking_weekly_id || "");
              } catch (err: any) {
                console.error("Booking API error:", err);
                setBookingError(err?.message || (isAr ? "حدث خطأ أثناء الاتصال بقاعدة البيانات" : "Database error"));
                return;
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

            {!isWeekly && (
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#0F172A]">{isAr ? "يوم الانطلاق *" : "Departure Day *"}</label>
                <select
                  value={date}
                  onChange={(e) => { setDate(e.target.value); setBookingError(null); }}
                  required
                  disabled={departuresLoading || departures.length === 0}
                  className="w-full h-11 px-3 rounded-xl border-2 border-[#E8E2D6] bg-white text-sm font-bold outline-none focus:border-[#D96B27]"
                >
                  <option value="">
                    {departuresLoading
                      ? (isAr ? "جارٍ تحميل المواعيد..." : "Loading departures...")
                      : departures.length === 0
                        ? (isAr ? "لا توجد مواعيد متاحة حالياً" : "No departures available")
                        : (isAr ? "اختر يوم الانطلاق" : "Choose a departure day")}
                  </option>
                  {departures.map((d) => (
                    <option key={d.date} value={d.date} disabled={d.remaining < 1}>
                      {`${d.weekday} ${d.date} · ${d.departure_time} · ${d.remaining < 1 ? (isAr ? "مكتمل" : "full") : (isAr ? `${d.remaining} مقعد متبقٍ` : `${d.remaining} seats left`)}`}
                    </option>
                  ))}
                </select>
                <div className="text-[11px] text-slate-500 font-semibold">
                  {isAr ? "يُغلق الحجز قبل موعد الانطلاق بـ 24 ساعة." : "Booking closes 24 hours before departure."}
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
              disabled={hasSeatError || (!isWeekly && !selectedDeparture)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer"
            >
              {hasSeatError
                ? (isAr ? "حدد عدد مقاعد متاح للاستمرار" : "Select valid seats to continue")
                : !isWeekly && !selectedDeparture
                ? (isAr ? "اختر يوم الانطلاق للاستمرار" : "Choose a departure day to continue")
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
              ? `رقم الحجز ${bookingId}${selectedDeparture ? ` ليوم ${selectedDeparture.weekday} ${selectedDeparture.date}` : ""}. تم حجز (${numSeats}) مقاعد على الحافلة سعة (${busCapacity} راكب). يرجى التوجه إلى مقر وموقع الشركة لإتمام الدفع الفيزيائي نقداً وتأكيد تذكرتك النهائية قبل موعد الانطلاق.`
              : `Booking ID ${bookingId}${selectedDeparture ? ` for ${selectedDeparture.date}` : ""}. (${numSeats}) seats booked on ${busCapacity}-passenger coach. Linked to your account.`}
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
          {reviewTypeOf(item.refId) && <ReviewsSection type={reviewTypeOf(item.refId)!} itemId={item.refId!} />}

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

/** Review type of a DelniDB id, from its prefix (DT- daily trip, WT- weekly trip). */
export function reviewTypeOf(id?: string): ReviewType | null {
  if (!id) return null;
  if (/^DT-/i.test(id)) return "daily";
  if (/^WT-/i.test(id)) return "weekly";
  return null;
}

/**
 * Visible reviews of one item from DelniDB, and a form for a signed-in tourist.
 * The server accepts a review only after a documented booking or stay.
 */
export function ReviewsSection({ type, itemId }: { type: ReviewType; itemId: string }) {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [average, setAverage] = useState<number | null>(null);
  const [loadError, setLoadError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  const session = getStoredSession();
  const isTourist = !!session.token && session.role === "tourist";

  const load = async () => {
    const res = await apiGetReviews(type, itemId);
    setLoadError(res.error || "");
    setReviews(res.reviews);
    setAverage(res.average);
  };

  useEffect(() => {
    load();
  }, [type, itemId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    const res = await apiAddReview(type, itemId, rating, comment.trim());
    setSubmitting(false);
    if (res.status !== "success") {
      setSubmitMessage({ ok: false, text: res.message || (isAr ? "تعذر حفظ التقييم" : "Could not save the review") });
      return;
    }
    setComment("");
    setSubmitMessage({ ok: true, text: res.message || (isAr ? "تم حفظ تقييمك" : "Review saved") });
    setShowForm(false);
    load();
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
            {average !== null ? `${average} / 5 · ` : ""}{reviews.length} {isAr ? "تقييمات" : "reviews"}
          </span>
        </div>
        <span className="text-muted-foreground transition-transform duration-200">
          {isOpen ? (isAr ? "▲ إخفاء" : "▲ Hide") : (isAr ? "▼ عرض التقييمات" : "▼ Show Reviews")}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 space-y-3 p-3 rounded-2xl bg-muted/50 border border-border animate-in fade-in">
          {loadError && (
            <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
              {isAr ? "تعذر تحميل التقييمات: " : "Could not load reviews: "}{loadError}
            </div>
          )}
          {!loadError && reviews.length === 0 && (
            <div className="p-2.5 rounded-xl bg-white border border-border text-xs text-muted-foreground">
              {isAr ? "لا توجد تقييمات بعد." : "No reviews yet."}
            </div>
          )}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {reviews.map((r) => {
              const name = r.tourist_name || (isAr ? "سائح" : "Tourist");
              return (
                <div key={r.id} className="p-3 rounded-xl bg-white border border-border space-y-1 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-xs text-foreground flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] grid place-items-center font-bold">
                        {name.charAt(0)}
                      </span>
                      {name}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-amber-500 text-xs">{"★".repeat(r.stars_rating)}</span>
                      <span className="text-[10px] text-muted-foreground">({String(r.created_at || "").slice(0, 10)})</span>
                    </div>
                  </div>
                  {r.comment_text && <p className="text-xs text-muted-foreground leading-relaxed">{r.comment_text}</p>}
                </div>
              );
            })}
          </div>

          {submitMessage && (
            <div className={`text-center py-2 text-xs font-black rounded-xl ${submitMessage.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-50 text-red-700"}`}>
              {submitMessage.text}
            </div>
          )}

          {!isTourist ? (
            <div className="text-[11px] text-muted-foreground text-center">
              {isAr ? "يمكن للسائح المسجل تقييم هذه الخدمة بعد حجز موثّق وانتهاء الرحلة." : "Registered tourists can review after a documented, completed booking."}
            </div>
          ) : !showForm ? (
            <button
              type="button"
              onClick={() => { setShowForm(true); setSubmitMessage(null); }}
              className="w-full py-2.5 rounded-xl border border-dashed border-primary/40 text-primary text-xs font-black hover:bg-primary/5 transition flex items-center justify-center gap-1.5"
            >
              ✍️ {isAr ? "أضف تقييمك وتجربتك" : "Write a Review"}
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <span>👤 {isAr ? `الحساب: ${session.user?.full_name || ""}` : `Account: ${session.user?.full_name || ""}`}</span>
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
                placeholder={isAr ? "اكتب انطباعك ورأيك حول هذه الخدمة (اختياري)..." : "Write your feedback (optional)..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={2000}
                rows={2}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white outline-none focus:border-primary font-medium resize-none"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-black hover:bg-primary/90 transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? (isAr ? "جارٍ الإرسال..." : "Submitting...") : (isAr ? "إرسال التقييم" : "Submit Review")}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-3 py-2 rounded-xl bg-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-300 transition"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
              </div>
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
  tripDate?: string; // YYYY-MM-DD departure day of a daily trip
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
  const [scheduleBookingError, setScheduleBookingError] = useState<string | null>(null);
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  // Daily trips: one schedule per bookable departure day, read from the server.
  const dailyTripId: string | undefined = (() => {
    const id = trip?.daily_trip_id || trip?.id || tripId;
    return id && (kind === "daily" || /^DT-/i.test(id)) && !/^WT-/i.test(id) ? id : undefined;
  })();
  const [departures, setDepartures] = useState<DailyDeparture[] | null>(null);

  useEffect(() => {
    if (!open || !dailyTripId) return;
    let cancelled = false;
    setDepartures(null);
    apiGetDailyDepartures(dailyTripId).then((list) => {
      if (!cancelled) setDepartures(list);
    });
    return () => { cancelled = true; };
  }, [open, dailyTripId]);

  useEffect(() => {
    if (open) {
      setSeats("1");
      setPhone("");
      setStep("pick");
      setShowAuthWarning(false);
      setIsAccountRestricted(false);
      setScheduleBookingError(null);
      setIsSubmittingBooking(false);
      setBookingConfirmedCode("");

      // Check account restriction status & prior bookings for this tourist
      try {
        const session = getStoredSession();
        const touristId = session.user?.tourist_id || session.user?.passport || session.user?.id;
        const targetTripId = trip?.id || trip?.daily_trip_id || trip?.weekly_trip_id || tripId;

        if (session.role === "tourist" && touristId) {
          // Seats this tourist already booked on this trip, read from DelniDB.
          setPriorBookedSeats(0);
          apiGetTouristBookings(touristId).then((res) => {
            const allUserBookings = [...res.daily, ...res.weekly].filter(
              (b: any) => b.daily_trip_id === targetTripId || b.weekly_trip_id === targetTripId
            );
            const totalPrev = allUserBookings.reduce(
              (sum: number, b: any) => sum + (Number(b.number_of_seats) || 0),
              0
            );
            setPriorBookedSeats(totalPrev);
          });
        } else {
          setPriorBookedSeats(0);
        }
      } catch {
        setPriorBookedSeats(0);
      }
    }
  }, [open, trip, tripId, customTitle, tripTitle]);

  let schedules: ScheduledTrip[];
  if (dailyTripId) {
    const realPrice = customPrice !== undefined ? customPrice : Number(trip?.price ?? trip?.price_per_seat) || 0;
    const realTitle = customTitle || tripTitle || trip?.title || (isAr ? "رحلة يومية" : "Daily trip");
    const realGuide = trip?.guide?.name || trip?.guide?.full_name || (isAr ? "مرشد سياحي معتمد" : "Certified guide");
    schedules = (departures || []).map((d) => ({
      id: `${dailyTripId}|${d.date}`,
      tripId: dailyTripId,
      tripDate: d.date,
      date: `${d.weekday} ${d.date}`,
      time: d.departure_time,
      seats: d.max_capacity,
      taken: d.booked,
      guide: realGuide,
      price: realPrice,
      tripTitle: realTitle,
      kind: "daily",
    }));
  } else if (customSchedules && customSchedules.length > 0) {
    schedules = customSchedules;
  } else if (trip || tripId) {
    const realId = trip?.id || trip?.daily_trip_id || trip?.weekly_trip_id || tripId;
    const realPrice = customPrice !== undefined
      ? customPrice
      : (trip?.type === "daily" ? trip.price : (trip?.seatPrice ?? (trip?.price ?? (kind === "weekly" ? 1200 : 120))));
    const realTitle = customTitle || tripTitle || trip?.title || (kind === "daily" ? "رحلة يومية" : "رحلة أسبوعية");
    const realGuide = trip?.guide?.name || "مرشد سياحي معتمد";
    const realSeats = trip?.targetPersons || trip?.max_capacity || 25;
    const realAvail = trip?.availableSeats !== undefined ? trip.availableSeats : (trip?.available_seats !== undefined ? trip.available_seats : realSeats);
    const realDate = trip?.startDate ? `${trip.startDate} إلى ${trip.endDate}` : (trip?.start_date ? `${trip.start_date} إلى ${trip.end_date}` : (isAr ? "الموعد القادم المتاح" : "Upcoming Scheduled Date"));
    const realTime = isAr ? "حسب برنامج الرحلة" : "Per trip itinerary";

    schedules = [
      {
        id: realId,
        tripId: realId,
        date: realDate,
        time: realTime,
        seats: realSeats,
        taken: Math.max(0, realSeats - realAvail),
        guide: realGuide,
        price: Number(realPrice) || (kind === "weekly" ? 1200 : 120),
        tripTitle: realTitle,
        kind: kind || "daily",
      }
    ];
  } else {
    // No trip from DelniDB was passed in: nothing can be booked.
    schedules = [];
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
                ? (isAr ? "الرحلات اليومية تنطلق صباحاً وتعود مساءً — تم تحديد الموعد المتاح أدناه:" : "Daily trips depart in the morning & return evening — date selected:")
                : (isAr ? "الرحلات الأسبوعية برنامج ٥-٧ أيام شامل — اختر أسبوع انطلاقك:" : "Weekly tours are 5-7 days all-inclusive — select your departure week:")}
            </p>
            {dailyTripId && departures === null && (
              <div className="p-4 rounded-2xl bg-muted/30 text-xs text-[#526078] font-bold">{isAr ? "جارٍ تحميل مواعيد الانطلاق..." : "Loading departures..."}</div>
            )}
            {dailyTripId && departures !== null && departures.length === 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold">
                {isAr ? "لا توجد مواعيد انطلاق متاحة للحجز حالياً (يُغلق الحجز قبل الانطلاق بـ 24 ساعة)." : "No bookable departures right now (booking closes 24h before departure)."}
              </div>
            )}
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

              // Save the booking in DelniDB; only a confirmed save shows the ticket.
              const targetTripId = selectedTrip?.tripId || selectedTrip?.id || tripId || trip?.id;
              const isWeekly = selectedTrip.kind === "weekly" || /^WT-/i.test(targetTripId || "") || kindLabel.includes("أسبوع");
              setScheduleBookingError(null);
              setIsSubmittingBooking(true);
              const res = isWeekly
                ? await apiBookWeeklyTrip({ weekly_trip_id: targetTripId, number_of_seats: n })
                : await apiBookDailyTrip({ daily_trip_id: targetTripId, trip_date: selectedTrip.tripDate || "", number_of_seats: n });
              setIsSubmittingBooking(false);

              if (res.status !== "success") {
                setScheduleBookingError(res.message || (isAr ? "تعذر إتمام الحجز" : "Booking failed"));
                return;
              }

              const savedBooking = res.booking || {};
              setBookingConfirmedCode(savedBooking.booking_daily_id || savedBooking.booking_weekly_id || "");
              setTotalSeatsAfterBooking(priorBookedSeats + n);
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
                    const isBtnDisabled = hasErr || !isTourist || isAccountRestricted || isSubmittingBooking;
                    return (
                      <>
                      {scheduleBookingError && (
                        <div className="mb-2 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                          ⚠️ {scheduleBookingError}
                        </div>
                      )}
                      <button
                        disabled={isBtnDisabled}
                        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] disabled:opacity-40 disabled:cursor-not-allowed text-white font-black shadow-soft hover:-translate-y-0.5 transition cursor-pointer"
                      >
                        {isSubmittingBooking
                          ? (isAr ? "جاري حفظ الحجز في قاعدة البيانات..." : "Saving booking...")
                          : isAccountRestricted
                          ? (isAr ? "⛔ حسابك مقيّد من قِبل الإدارة ولا يمكنك الحجز" : "Account Restricted from Booking")
                          : !isTourist
                          ? (isAr ? "🔒 يجب التسجيل في المنصة كسائح لتأكيد الحجز" : "Tourist account required to book")
                          : hasErr
                          ? (isAr ? "يرجى تحديد مقاعد متاحة" : "Select valid seats")
                          : (isAr ? "تأكيد الحجز (الدفع بموقع الشركة)" : "Confirm Booking (Pay at Company Office)")}
                      </button>
                      </>
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
        setCustomerName((prev) => prev || session.user.name || "");
        setPhone((prev) => prev || session.user.phone || "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.match(/^09\d{8}$/)) {
      alert(isAr ? "الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)" : "Please enter a valid Libyan phone number (e.g. 0912345678)");
      return;
    }

    const session = getStoredSession();
    if (!session.token || session.role !== "tourist") {
      alert(isAr ? "يجب تسجيل الدخول بحساب سائح لإرسال طلب الرحلة الخاصة" : "Please sign in with a tourist account to request a private trip");
      return;
    }
    if (!startDate) {
      alert(isAr ? "يرجى تحديد تاريخ بداية الرحلة" : "Please choose the trip start date");
      return;
    }

    // Saved in DelniDB (private_trips) for the signed-in tourist; the admin prices it later.
    const res = await apiRequestPrivateTrip({
      customer_description: selectedLandmark ? (isAr ? selectedLandmark.name : selectedLandmark.nameEn) : "رحلة سياحية خاصة",
      preferred_start_date: startDate,
      duration_days: Math.max(1, parseInt(durationDays, 10) || 1),
      number_of_companions: Math.max(0, parseInt(companions, 10) || 0),
      guide_license_number: selectedGuideLicense || null,
      customer_phone: phone.trim(),
      customer_requirements: `وسيلة النقل: ${vehicleType}.${selectedGuide ? ` المرشد المفضل: ${selectedGuide.name} (${selectedGuide.licenseNumber}).` : ''}${notes ? ` ملاحظات: ${notes}` : ''}`.trim(),
    });

    if (res.status !== "success") {
      alert(res.message || (isAr ? "تعذر حفظ طلب الرحلة الخاصة" : "Could not save the private trip request"));
      return;
    }

    setCreatedTripId(res.trip?.private_trip_id || "");
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
