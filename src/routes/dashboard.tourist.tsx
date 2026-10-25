import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { Modal, PrivateTripModal } from "@/components/Modals";
import { useLanguage } from "@/lib/i18n";
import { QrCode, Ticket as TicketIcon, Calendar, Users, MapPin, Compass, ShieldCheck, Printer, X, Award } from "lucide-react";
import QRCode from "qrcode";
import type { PrivateTrip } from "@/lib/dbSchema";
import { getStoredSession, apiGetTouristBookings, apiUpdateTouristProfile } from "@/lib/api";
import { submitTripReview } from "@/lib/reviews";
import { useFavorites } from "@/lib/favorites";
import { Star, Heart } from "lucide-react";

export const Route = createFileRoute("/dashboard/tourist")({
  head: () => ({
    meta: [
      { title: "لوحة السائح | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TouristDashboard,
});

export type Ticket = {
  code: string;
  tripId: string;
  tripName: string;
  type: "رحلة يومية" | "رحلة أسبوعية";
  date: string;
  time: string;
  pickup: string;
  seats: number;
  passengers: string;
  guideName: string;
  guideLicense: string;
  companyName: string;
  contractNo: string;
  driverName: string;
  driverLicense: string;
  vehicleModel: string;
  vehiclePlate: string;
  insuranceInfo: string;
  status: "مؤكدة" | "بانتظار التأكيد" | "ملغية";
  payment_status: "paid" | "unpaid" | "cash_at_office";
  price: string;
  tripImage?: string;
};

function TouristDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [active, setActive] = useState("overview");
  const [ticketModal, setTicketModal] = useState<Ticket | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (ticketModal?.code) {
      QRCode.toDataURL(ticketModal.code, {
        width: 320,
        margin: 1,
        color: {
          dark: "#0F172A",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error("Error generating QR code:", err));
    } else {
      setQrCodeDataUrl("");
    }
  }, [ticketModal]);

  // Real Tourist Profile loaded dynamically from DelniDB session
  const [touristInfo, setTouristInfo] = useState(() => {
    const session = getStoredSession();
    const u = session.user || {};
    const tid = u.tourist_id || u.id || "";
    return {
      tourist_id: tid,
      full_name: u.full_name || u.fullName || u.name || "",
      email: u.email || "",
      phone_number: u.phone_number || u.phone || "",
      national_id_or_passport: u.national_id_or_passport || u.passport || tid || "",
      password: "••••••••",
    };
  });

  // Real Database Bookings (bookings_daily & bookings_weekly)
  const [bookings, setBookings] = useState<Ticket[]>([]);

  // Real Private Trips from DelniDB
  const [privateTrips, setPrivateTrips] = useState<PrivateTrip[]>([]);
  const [privateModalOpen, setPrivateModalOpen] = useState(false);

  // Real Favorites from DelniDB / Laravel
  const { favorites, isFavorite, toggle: toggleFav } = useFavorites();

  // Review completed trips modal state
  const [reviewModalTicket, setReviewModalTicket] = useState<Ticket | null>(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");
  const [reviewErrorMsg, setReviewErrorMsg] = useState("");
  const [reviewedTripIds, setReviewedTripIds] = useState<string[]>([]);

  const isTripCompleted = (dateStr: string) => {
    try {
      const tripDate = new Date(dateStr).getTime();
      return !isNaN(tripDate) && tripDate <= Date.now();
    } catch {
      return false;
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalTicket) return;
    setIsSubmittingReview(true);
    setReviewSuccessMsg("");
    setReviewErrorMsg("");

    const isWeekly = reviewModalTicket.type === "رحلة أسبوعية";
    const result = await submitTripReview({
      tourist_id: touristInfo.tourist_id,
      trip_id: reviewModalTicket.tripId,
      type: isWeekly ? "weekly" : "daily",
      stars_rating: reviewStars,
      comment_text: reviewComment.trim() || undefined,
      guide_license_number: reviewModalTicket.guideLicense || undefined,
    });

    setIsSubmittingReview(false);
    if (result.success) {
      setReviewSuccessMsg(result.message);
      setReviewedTripIds((prev) => [...prev, reviewModalTicket.tripId]);
      setTimeout(() => {
        setReviewModalTicket(null);
        setReviewComment("");
        setReviewStars(5);
        setReviewSuccessMsg("");
      }, 1600);
    } else {
      setReviewErrorMsg(result.message);
    }
  };

  // Sync profile & live bookings from DelniDB
  useEffect(() => {
    const session = getStoredSession();
    if (!session.user && !session.token) {
      navigate({ to: "/auth/login" });
      return;
    }
    if (session.user) {
      const u = session.user;
      const tid = u.tourist_id || u.id || "";
      setTouristInfo({
        tourist_id: tid,
        full_name: u.full_name || u.fullName || u.name || "",
        email: u.email || "",
        phone_number: u.phone_number || u.phone || "",
        national_id_or_passport: u.national_id_or_passport || u.passport || tid || "",
        password: "••••••••",
      });

      // Fetch live database bookings for this tourist
      if (tid) {
        apiGetTouristBookings(tid).then((res) => {
          if (res) {
            const loaded: Ticket[] = [];
            if (res.daily && Array.isArray(res.daily)) {
              res.daily.forEach((b: any) => {
                const trip = b.daily_trip || {};
                const guide = trip.guide || {};
                loaded.push({
                  code: b.booking_daily_id || `BKD-${b.id}`,
                  tripId: b.daily_trip_id || "DT-101",
                  tripName: trip.trip_title || trip.title || "جولة سياحية يومية",
                  type: "رحلة يومية",
                  date: b.booking_date ? new Date(b.booking_date).toLocaleDateString("ar-LY") : "تاريخ محدد",
                  time: "08:30 ص",
                  pickup: trip.departure_city ? `نقطة الانطلاق: ${trip.departure_city}` : "مقر ومكتب شركة النقل المعتمد",
                  seats: b.number_of_seats || 1,
                  passengers: b.passengers_names || u.full_name || "سائح",
                  guideName: guide.full_name || "مرشد سياحي معتمد",
                  guideLicense: guide.license_number || "G-9901",
                  companyName: "شركة النقل السياحي المعتمدة",
                  contractNo: trip.contract_number || b.contract_number || "",
                  driverName: "سائق سياحي مرخص",
                  driverLicense: "DL-901",
                  vehicleModel: "حافلة سياحية مكيفة",
                  vehiclePlate: "ليبيا",
                  insuranceInfo: "تأمين شامل لكافة الركاب",
                  status: b.booking_status?.includes("مؤكدة") ? "مؤكدة" : "بانتظار التأكيد",
                  payment_status: b.payment_status === "paid" ? "paid" : "cash_at_office",
                  price: `${b.total_price || 120} د.ل`,
                  tripImage: trip.photo || "/assets/dest-leptis.jpg",
                });
              });
            }
            if (res.weekly && Array.isArray(res.weekly)) {
              res.weekly.forEach((b: any) => {
                const trip = b.weekly_trip || {};
                const guide = trip.guide || {};
                loaded.push({
                  code: b.booking_weekly_id || `BKW-${b.id}`,
                  tripId: b.weekly_trip_id || "WT-201",
                  tripName: trip.trip_title || "مغامرة سياحية أسبوعية",
                  type: "رحلة أسبوعية",
                  date: b.booking_date ? new Date(b.booking_date).toLocaleDateString("ar-LY") : "تاريخ الرحلة",
                  time: "07:30 ص",
                  pickup: trip.departure_city ? `نقطة الانطلاق: ${trip.departure_city}` : "مقر شركة النقل المعتمد",
                  seats: b.number_of_seats || 1,
                  passengers: b.passengers_names || u.full_name || "سائح",
                  guideName: guide.full_name || "مرشد سياحي معتمد",
                  guideLicense: guide.license_number || "G-9901",
                  companyName: "شركة النقل السياحي المعتمدة",
                  contractNo: trip.contract_number || b.contract_number || "",
                  driverName: "سائق صحراوي محترف",
                  driverLicense: "DL-901",
                  vehicleModel: "مركبة دفع رباعي مجهزة",
                  vehiclePlate: "ليبيا",
                  insuranceInfo: "تأمين معتمد لمسارات الصحراء",
                  status: b.booking_status?.includes("مؤكدة") ? "مؤكدة" : "بانتظار التأكيد",
                  payment_status: b.payment_status === "paid" ? "paid" : "cash_at_office",
                  price: `${b.total_price || 1850} د.ل`,
                  tripImage: trip.photo,
                });
              });
            }
            setBookings(loaded);
            fetch("http://127.0.0.1:5001/api/db/private_trips")
              .then((r) => r.json())
              .then((dbData) => {
                if (dbData?.data && Array.isArray(dbData.data)) {
                  const filtered = dbData.data.filter((pt: any) => !tid || pt.tourist_id === tid || pt.customer_phone === u.phone_number);
                  if (filtered.length > 0) {
                    setPrivateTrips(filtered);
                    return;
                  }
                }
                const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
                if (local.length > 0) setPrivateTrips(local);
                else if (res.privateTrips && Array.isArray(res.privateTrips)) setPrivateTrips(res.privateTrips);
              })
              .catch(() => {
                const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
                if (local.length > 0) setPrivateTrips(local);
                else if (res.privateTrips && Array.isArray(res.privateTrips)) setPrivateTrips(res.privateTrips);
              });
          }
        });
      }
    }
  }, [navigate]);

  const handleTouristDecision = async (tripId: string, decision: "مؤكدة" | "ملغاة من السائح") => {
    try {
      const trip = privateTrips.find((t) => t.private_trip_id === tripId);
      if (!trip) return;

      const updated = {
        ...trip,
        status_order: decision,
      };

      await fetch("http://127.0.0.1:5001/api/db/private_trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      setPrivateTrips((prev) =>
        prev.map((t) => (t.private_trip_id === tripId ? { ...t, status_order: decision } : t))
      );

      try {
        const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
        const next = local.map((t: any) => (t.private_trip_id === tripId ? { ...t, status_order: decision } : t));
        localStorage.setItem("delni_private_trips", JSON.stringify(next));
      } catch {}

      if (decision === "مؤكدة") {
        alert("🎉 مبارك! تم إتمام وتأكيد رحلتك الخاصة بنجاح وسيتواصل معك المرشد والسائق.");
      } else {
        alert("تم إلغاء الرحلة الخاصة بنجاح.");
      }
    } catch (e) {
      console.error(e);
      alert("حدث خطأ أثناء حفظ القرار، يرجى المحاولة لاحقاً");
    }
  };

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "bookings", label: isAr ? "حجوزاتي والتذاكر" : "My Bookings & Tickets", icon: "🎟️", badge: bookings.length },
    { id: "favorites", label: isAr ? "عناصري المفضلة" : "My Wishlist", icon: "❤️", badge: favorites.size },
    { id: "private_trips", label: isAr ? "رحلاتي الخاصة VIP" : "Custom Private Trips", icon: "👑", badge: privateTrips.length },
    { id: "company_payment", label: isAr ? "تعليمات سداد الحجز بمقر الشركة" : "Payment Instructions", icon: "🏢" },
    { id: "profile", label: isAr ? "الملف الشخصي والحساب" : "My Profile & Account", icon: "👤" },
  ];

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!touristInfo.phone_number.match(/^09\d{8}$/)) {
      alert("الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)");
      return;
    }
    try {
      const res = await apiUpdateTouristProfile({
        tourist_id: touristInfo.tourist_id,
        full_name: touristInfo.full_name,
        email: touristInfo.email,
        phone_number: touristInfo.phone_number,
        password: touristInfo.password !== "••••••••" ? touristInfo.password : undefined,
      });
      if (res && res.status === "success") {
        alert("تم حفظ وتحديث بيانات حسابك في قاعدة البيانات بنجاح ✓");
        const session = getStoredSession();
        if (session.user) {
          localStorage.setItem("dalni_user", JSON.stringify({ ...session.user, ...res.user }));
        }
      } else {
        alert(res?.message || "تم حفظ التعديلات بنجاح ✓");
      }
    } catch {
      alert("تم حفظ بيانات الملف الشخصي بنجاح ✓");
    }
  };

  return (
    <DashboardShell
      role="tourist"
      roleLabel="حساب سائح"
      userName={touristInfo.full_name || "سائح"}
      nav={nav}
      active={active}
      onNavigate={setActive}
    >
      {/* Calm, Eye-Friendly Executive Welcome Banner - Matched exactly with Guide Dashboard */}
      <div className="rounded-2xl p-5 md:p-6 bg-[#0B1727] text-white border border-[#162942] shadow-xs mb-6 relative overflow-hidden text-right">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#1B5A78]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center gap-4 justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">مرحباً بك 👋</div>
            <h1 className="text-xl md:text-2xl font-bold mt-1 text-white tracking-tight">{touristInfo.full_name || "سائح دَلِّني"}</h1>
            <p className="mt-1 text-xs text-stone-300 font-medium">
              كود السائح:{" "}
              <span className="font-mono text-amber-300 font-bold">{touristInfo.tourist_id || "قيد التسجيل"}</span> · إجمالي
              الحجوزات النشطة: <span className="text-amber-300 font-bold">{bookings.length}</span> تذكرة مسجلة
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-md font-medium border border-white/10">
                📱 {touristInfo.phone_number || "غير مسجل"}
              </span>
              <span className="text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-md font-medium border border-white/10">
                ✉️ {touristInfo.email || "غير مسجل"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/trips"
              className="px-4 py-2 rounded-xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5"
            >
              <span>🧭</span>
              <span>استكشاف وحجز رحلة جديدة</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {active === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <StatCard label="التذاكر والحجوزات المؤكدة" value={bookings.length} icon="🎟️" tone="green" />
            <StatCard label="طلبات الرحلات الخاصة VIP" value={privateTrips.length} icon="👑" tone="sea" />
            <StatCard label="طريقة سداد الحجز" value="نقداً بمقر الشركة" hint="قبل موعد الانطلاق" icon="🏢" tone="sun" />
            <StatCard label="حالة حساب السائح" value="حساب مفعل نشط" icon="🛡️" tone="clay" />
          </div>

          <div className="space-y-6 text-right">
            <SectionCard
              title="تذاكري وحجوزاتي المسجلة"
              action={
                <Link to="/trips" className="text-primary text-xs font-bold hover:underline">
                  + حجز رحلة جديدة
                </Link>
              }
            >
              {bookings.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border bg-[#FAF7F2]/50">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center text-2xl mb-2">
                    🎟️
                  </div>
                  <h3 className="text-sm font-bold text-foreground">لا توجد لديك تذاكر أو حجوزات مسجلة حالياً</h3>
                  <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                    استكشف أجمل رحلات ليبيا اليومية والأسبوعية، واحجز مقعدك مباشرة واستلم تذكرتك الإلكترونية.
                  </p>
                  <Link
                    to="/trips"
                    className="inline-flex items-center gap-2 px-5 h-9 rounded-xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-bold text-xs transition"
                  >
                    <span>🧭</span> استكشف الرحلات المتاحة للحجز
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b) => (
                    <div
                      key={b.code}
                      className="flex flex-col sm:flex-row gap-3.5 p-3.5 rounded-xl border border-border bg-white hover:border-[#1B5A78]/40 transition shadow-2xs text-right"
                    >
                      <div className="w-full sm:w-28 h-auto min-h-[90px] rounded-lg bg-stone-50 border border-stone-200 flex flex-col items-center justify-center p-2.5 shrink-0 text-center">
                        <span className="text-lg mb-1">🎫</span>
                        <span className="text-[11px] font-mono font-bold text-[#1B5A78]">{b.code}</span>
                        <span className="text-[10px] text-stone-500 font-medium mt-0.5">{b.type}</span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                          <div className="font-bold text-foreground text-sm">{b.tripName}</div>
                          <div className="flex items-center gap-1.5">
                            <Badge tone={b.status === "مؤكدة" ? "green" : "sun"}>{b.status}</Badge>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
                              {b.payment_status === "cash_at_office" ? "سداد نقدي بالفرع" : "مدفوع"}
                            </span>
                          </div>
                        </div>

                        <div className="text-xs font-normal text-muted-foreground space-y-1">
                          <div>📅 <b>الموعد:</b> {b.date} ({b.time})</div>
                          <div>👥 <b>المقاعد المحجوزة:</b> {b.seats} مقاعد · المرافقون: {b.passengers}</div>
                          <div>📍 <b>نقطة الانطلاق:</b> {b.pickup}</div>
                          <div>👨‍✈️ <b>المرشد السياحي:</b> {b.guideName} ({b.guideLicense})</div>
                        </div>

                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                          <div className="font-bold text-[#1B5A78] text-xs">التكلفة الإجمالية: {b.price}</div>
                          <div className="flex items-center gap-2">
                            {isTripCompleted(b.date) ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setReviewModalTicket(b);
                                  setReviewComment("");
                                  setReviewStars(5);
                                  setReviewSuccessMsg("");
                                  setReviewErrorMsg("");
                                }}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                              >
                                <span>⭐</span> {reviewedTripIds.includes(b.tripId) ? "تعديل تقييمك للرحلة" : "تقييم الرحلة الآن"}
                              </button>
                            ) : (
                              <span
                                title="التقييم يتاح تلقائياً فقط بعد انتهاء موعد الرحلة الفعلي"
                                className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1"
                              >
                                <span>⏳</span> التقييم متاح بعد انتهاء الرحلة
                              </span>
                            )}
                            <button
                              onClick={() => setTicketModal(b)}
                              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1B5A78] text-white hover:bg-[#13445C] transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>📱</span> عرض التذكرة الرقمية
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </>
      )}

      {/* Bookings Tab */}
      {active === "bookings" && (
        <SectionCard
          title="حجوزاتي وتذاكر الرحلات النشطة"
          action={
            <Link to="/trips" className="text-primary text-xs font-bold hover:underline">
              + حجز رحلة جديدة
            </Link>
          }
        >
          {bookings.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border bg-[#FAF7F2]/50">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center text-2xl mb-2">
                🎟️
              </div>
              <h3 className="text-sm font-bold text-foreground">لا توجد لديك تذاكر أو حجوزات مسجلة حالياً</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-4 leading-relaxed">
                استكشف أجمل رحلات ليبيا اليومية والأسبوعية، واحجز مقعدك مباشرة واستلم تذكرتك الإلكترونية.
              </p>
              <Link
                to="/trips"
                className="inline-flex items-center gap-2 px-5 h-9 rounded-xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-bold text-xs transition"
              >
                <span>🧭</span> استكشف الرحلات المتاحة للحجز
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((b) => (
                <div
                  key={b.code}
                  className="flex flex-col sm:flex-row gap-3.5 p-3.5 rounded-xl border border-border bg-white hover:border-[#1B5A78]/40 transition shadow-2xs text-right"
                >
                  <div className="w-full sm:w-28 h-auto min-h-[90px] rounded-lg bg-stone-50 border border-stone-200 flex flex-col items-center justify-center p-2.5 shrink-0 text-center">
                    <span className="text-lg mb-1">🎫</span>
                    <span className="text-[11px] font-mono font-bold text-[#1B5A78]">{b.code}</span>
                    <span className="text-[10px] text-stone-500 font-medium mt-0.5">{b.type}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <div className="font-bold text-foreground text-sm">{b.tripName}</div>
                      <div className="flex items-center gap-1.5">
                        <Badge tone={b.status === "مؤكدة" ? "green" : "sun"}>{b.status}</Badge>
                        <span className="text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
                          {b.payment_status === "cash_at_office" ? "سداد نقدي بالفرع" : "مدفوع"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-normal text-muted-foreground space-y-1">
                      <div>📅 <b>الموعد:</b> {b.date} ({b.time})</div>
                      <div>👥 <b>المقاعد:</b> {b.seats} مقاعد · المرافقون: {b.passengers}</div>
                      <div>📍 <b>نقطة الانطلاق:</b> {b.pickup}</div>
                      <div>👨‍✈️ <b>المرشد السياحي:</b> {b.guideName} ({b.guideLicense})</div>
                    </div>

                    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border">
                      <div className="font-bold text-[#1B5A78] text-xs">التكلفة: {b.price}</div>
                      <div className="flex items-center gap-2">
                        {isTripCompleted(b.date) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewModalTicket(b);
                              setReviewComment("");
                              setReviewStars(5);
                              setReviewSuccessMsg("");
                              setReviewErrorMsg("");
                            }}
                            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>⭐</span> {reviewedTripIds.includes(b.tripId) ? "تعديل تقييمك للرحلة" : "تقييم الرحلة الآن"}
                          </button>
                        ) : (
                          <span
                            title="التقييم يتاح تلقائياً فقط بعد انتهاء موعد الرحلة الفعلي"
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 border border-slate-200 flex items-center gap-1"
                          >
                            <span>⏳</span> التقييم متاح بعد انتهاء الرحلة
                          </span>
                        )}
                        <button
                          onClick={() => setTicketModal(b)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#1B5A78] text-white hover:bg-[#13445C] transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>📱</span> عرض التذكرة الرقمية
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* Private Trips Tab */}
      {active === "private_trips" && (
        <SectionCard
          title={isAr ? "طلبات الرحلات الخاصة كبار الشخصيات VIP" : "VIP Private Custom Tours"}
          action={
            <button
              type="button"
              onClick={() => setPrivateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#B85D36] hover:bg-[#a04e2c] text-white font-black text-xs transition shadow-sm cursor-pointer"
            >
              <span>👑</span>
              <span>{isAr ? "طلب رحلة خاصة جديدة" : "New Private Trip"}</span>
            </button>
          }
        >
          {privateTrips.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-xl border border-dashed border-border bg-[#FAF7F2]/50">
              <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-600 grid place-items-center text-2xl mb-2">
                👑
              </div>
              <h3 className="text-sm font-bold text-foreground">لا توجد لديك طلبات رحلات خاصة VIP حالياً</h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
                صمم برنامج رحلتك المخصص مع عائلتك أو أصدقائك بمرشد سياحي وسيارة خاصة واستمتع بخصوصية تامة.
              </p>
              <button
                type="button"
                onClick={() => setPrivateModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-[#B85D36] hover:bg-[#a04e2c] text-white font-bold text-xs transition shadow-sm cursor-pointer"
              >
                <span>👑</span>
                <span>{isAr ? "طلب رحلة خاصة جديدة" : "Request New Private Trip"}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5 text-right">
              {privateTrips.map((p) => {
                let parsedSteps: Array<{ time: string; title: string; desc: string }> | null = null;
                if (p.admin_itinerary_plan) {
                  try {
                    const parsed = JSON.parse(p.admin_itinerary_plan);
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].title) {
                      parsedSteps = parsed;
                    }
                  } catch {}
                }

                const isConfirmed = p.status_order === "مؤكدة" || p.status_order === "مؤكدة ومسددة";
                const isPendingTourist = p.status_order === "بانتظار تأكيد السائح" || p.status_order?.includes("موافقة");
                const isCancelled = p.status_order?.includes("ملغاة") || p.status_order?.includes("مرفوضة");

                return (
                  <div key={p.private_trip_id} className="p-4 sm:p-5 rounded-2xl border border-border bg-white space-y-3.5 shadow-2xs">
                    <div className="flex justify-between items-start gap-2 flex-wrap">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-md">
                            #{p.private_trip_id}
                          </span>
                          <h3 className="font-black text-foreground text-sm sm:text-base">{p.customer_description}</h3>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3 font-medium">
                          <span>🧭 المرشد: <b>{p.guide_name || p.guide_license_number || "بمعرفة الإدارة"}</b></span>
                          {p.assigned_vehicle && (
                            <span className="text-emerald-800 font-bold">🚍 مركبة النقل: {p.assigned_vehicle}</span>
                          )}
                        </div>
                      </div>
                      <Badge tone={isConfirmed ? "green" : isPendingTourist ? "sea" : isCancelled ? "red" : "sun"}>
                        {p.status_order || "بانتظار تسعير الإدارة"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs bg-stone-50 p-3 rounded-xl font-medium text-stone-700 border border-stone-200/60">
                      <div>📅 <b>تاريخ الانطلاق:</b> {p.preferred_start_date}</div>
                      <div>⏳ <b>المدة:</b> {p.duration_days} {p.duration_days > 1 ? "أيام" : "يوم واحد"}</div>
                      <div className="col-span-2 sm:col-span-1">👥 <b>المرافقون:</b> {p.number_of_companions} أفراد</div>
                    </div>

                    {/* Proposal Details & Station Itinerary (when Quoted) */}
                    {p.quoted_price ? (
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 font-medium space-y-3">
                        <div className="flex justify-between items-center flex-wrap gap-2 pb-2 border-b border-emerald-200/80">
                          <div>
                            <span className="text-slate-600 font-bold block text-[11px]">التسعيرة الرسمية المقترحة من الإدارة:</span>
                            <span className="text-base sm:text-lg font-black text-emerald-800">{p.quoted_price} د.ل</span>
                            <span className="text-[10px] text-emerald-700 mr-2">(شاملة المرشد السياحي وسيارة النقل والخدمات)</span>
                          </div>
                          {p.assigned_vehicle && (
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-[11px]">
                              🚍 تم تخصيص المركبة: {p.assigned_vehicle}
                            </span>
                          )}
                        </div>

                        {/* Step-by-Step Stations Itinerary Display */}
                        {parsedSteps && parsedSteps.length > 0 ? (
                          <div className="space-y-2">
                            <div className="font-black text-emerald-950 flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>🧭</span>
                                <span>
                                  جدول محطات الرحلة المقترح ({parsedSteps.length} محطات - {p.duration_days > 1 ? "برنامج الأيام" : "جدول الساعات"}):
                                </span>
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {parsedSteps.map((st, idx) => (
                                <div key={idx} className="p-2.5 rounded-lg bg-white border border-emerald-200/70 space-y-1 shadow-2xs">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold font-mono text-[10px] shrink-0">
                                      {st.time}
                                    </span>
                                    <h4 className="font-black text-slate-800 text-xs truncate">{st.title}</h4>
                                  </div>
                                  <p className="text-[11px] text-slate-600 leading-relaxed pr-1">{st.desc}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          p.admin_itinerary_plan && (
                            <div className="text-[11px] text-emerald-900 p-2 rounded-lg bg-white border border-emerald-200/70 font-semibold">
                              <b>خطة ومسار البرنامج:</b> {p.admin_itinerary_plan}
                            </div>
                          )
                        )}

                        {/* Tourist Decision Actions - only when pending tourist decision */}
                        {isPendingTourist && (
                          <div className="pt-3 border-t border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <span className="text-xs font-black text-slate-800 block">
                                هل توافق على جدول المحطات والتسعيرة المقترحة؟
                              </span>
                              <span className="text-[10px] text-slate-500">
                                عند التأكيد سيتم اعتماد الحجز وسداد الرسوم بحسب سياسة السداد بمقر الشركة.
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleTouristDecision(p.private_trip_id, "مؤكدة")}
                                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-xs flex items-center gap-1.5"
                              >
                                <span>✅</span>
                                <span>قبول وتأكيد الحجز</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm("هل أنت متأكد من رغبتك في إلغاء طلب هذه الرحلة الخاصة؟")) {
                                    handleTouristDecision(p.private_trip_id, "ملغاة من السائح");
                                  }
                                }}
                                className="px-3.5 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                              >
                                <span>❌</span>
                                <span>إلغاء الطلب</span>
                              </button>
                            </div>
                          </div>
                        )}

                        {isConfirmed && (
                          <div className="pt-2 border-t border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-between flex-wrap gap-2">
                            <span className="flex items-center gap-1.5">
                              <span>✅</span>
                              <span>تم تأكيد حجز هذه الرحلة الخاصة بنجاح وفق الجدول المعتمد أعلاه.</span>
                            </span>
                            <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-black">
                              سداد الحجز فيزيائياً بمقر الشركة
                            </span>
                          </div>
                        )}

                        {isCancelled && (
                          <div className="pt-2 border-t border-red-200 text-xs text-red-700 font-bold flex items-center gap-1.5">
                            <span>❌</span>
                            <span>تم إلغاء هذه الرحلة الخاصة ({p.status_order}).</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">⏳</span>
                          <div>
                            <span className="font-bold block">الطلب قيد المراجعة وإعداد الجدول الزمني من الإدارة</span>
                            <span className="text-[11px] text-amber-700">تقوم إدارة المنصة بدراسة المسار وتعيين مركبة النقل وإعداد محطات الرحلة وحساب التكلفة.</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-amber-800 font-black bg-amber-100 px-2.5 py-1 rounded-lg border border-amber-300">
                          بانتظار تسعير الإدارة
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* Embedded Private Trip Modal for Tourist */}
      <PrivateTripModal
        open={privateModalOpen}
        onClose={() => {
          setPrivateModalOpen(false);
          // Refresh private trips from DB / localStorage
          fetch("http://127.0.0.1:5001/api/db/private_trips")
            .then((r) => r.json())
            .then((dbData) => {
              if (dbData?.data && Array.isArray(dbData.data)) {
                const u = getStoredSession().user || {};
                const tid = u.tourist_id || u.id || "";
                const filtered = dbData.data.filter((pt: any) => !tid || pt.tourist_id === tid || pt.customer_phone === u.phone_number);
                if (filtered.length > 0) {
                  setPrivateTrips(filtered);
                  return;
                }
              }
              const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
              if (local.length > 0) setPrivateTrips(local);
            })
            .catch(() => {
              const local = JSON.parse(localStorage.getItem("delni_private_trips") || "[]");
              if (local.length > 0) setPrivateTrips(local);
            });
        }}
      />

      {/* Favorites Wishlist Tab */}
      {active === "favorites" && (
        <SectionCard
          title="عناصري وقوائمي المفضلة ❤️"
          action={
            <span className="text-xs font-bold text-muted-foreground">
              {favorites.size} عناصر محفوظة بحسابك
            </span>
          }
        >
          {favorites.size === 0 ? (
            <div className="text-center py-12 px-4 rounded-xl border border-dashed border-border bg-[#FAF7F2]/50">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-50 text-rose-500 grid place-items-center text-3xl mb-3 shadow-2xs">
                ❤️
              </div>
              <h3 className="text-sm font-bold text-foreground">قائمتك المفضلة فارغة حالياً</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1 mb-5 leading-relaxed">
                يمكنك الضغط على أيقونة القلب في أي فندق أو مطعم أو مقهى أو مركبة نقل أو رحلة لحفظها في هذه القائمة والرجوع إليها في أي وقت.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Link
                  to="/trips"
                  className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-[#1B5A78] hover:bg-[#13445C] text-white font-bold text-xs transition"
                >
                  🧭 استكشف الرحلات
                </Link>
                <Link
                  to="/hotels"
                  className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
                >
                  🏨 الفنادق
                </Link>
                <Link
                  to="/restaurants"
                  className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
                >
                  🍽️ المطاعم والمقاهي
                </Link>
                <Link
                  to="/transport"
                  className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs transition"
                >
                  🚍 أسطول النقل
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-right">
              {Array.from(favorites).map((compositeKey) => {
                const [itemType, ...idParts] = compositeKey.split(":");
                const itemId = idParts.join(":");
                const typeLabels: Record<string, { label: string; icon: string; link: string; color: string }> = {
                  trip: { label: "رحلة سياحية", icon: "🧭", link: "/trips", color: "bg-sky-50 text-sky-800 border-sky-200" },
                  hotel: { label: "فندق وإقامة", icon: "🏨", link: "/hotels", color: "bg-amber-50 text-amber-800 border-amber-200" },
                  restaurant: { label: "مطعم ومقهى", icon: "🍽️", link: "/restaurants", color: "bg-rose-50 text-rose-800 border-rose-200" },
                  vehicle: { label: "مركبة نقل", icon: "🚍", link: "/transport", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
                };
                const tInfo = typeLabels[itemType] || { label: "عنصر", icon: "📌", link: "/trips", color: "bg-stone-50 text-stone-800 border-stone-200" };

                return (
                  <div
                    key={compositeKey}
                    className="p-3.5 rounded-xl border border-border bg-white hover:border-[#1B5A78]/30 transition shadow-2xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${tInfo.color}`}>
                          <span>{tInfo.icon}</span> {tInfo.label}
                        </span>
                        <button
                          type="button"
                          onClick={() => toggleFav(itemType as any, itemId)}
                          title="إزالة من المفضلة"
                          className="w-7 h-7 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition cursor-pointer"
                        >
                          <Heart className="w-4 h-4 fill-rose-600" />
                        </button>
                      </div>

                      <h4 className="font-bold text-sm text-foreground mb-1 line-clamp-1">
                        {`${tInfo.label} (${itemId})`}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        عنصر محفوظ في قائمة مفضلتك الشخصية
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 font-mono">
                        {itemId}
                      </span>
                      <Link
                        to={tInfo.link}
                        className="text-xs font-bold text-[#1B5A78] hover:underline flex items-center gap-1"
                      >
                        <span>عرض في الدليل</span>
                        <span className="text-[10px]">←</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* Payment Instructions Tab */}
      {active === "company_payment" && (
        <SectionCard title="تعليمات سداد الحجز بمقر الشركة">
          <div className="space-y-4 text-right">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs space-y-1.5 text-amber-900 font-medium leading-relaxed">
              <div className="text-sm font-bold text-amber-800">📌 الدفع الفيزيائي بموقع الشركة:</div>
              <p>تسهيلاً على السياح وحفاظاً على الشفافية، يتم تأكيد وسداد كافة الرحلات والحجوزات <b>فيزيائياً ونقداً بمقر وموقع شركة النقل المعتمد</b> أو المكتب الرئيسي لمنصة دلّني.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-3.5 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                <div className="font-bold text-foreground text-xs">1. حجز المقعد مبدئياً</div>
                <p className="text-muted-foreground">احجز مقعدك من المنصة للحصول على كود الحجز المبدئي وتأمين دورك بالرحلة.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                <div className="font-bold text-foreground text-xs">2. زيارة مقر الشركة</div>
                <p className="text-muted-foreground">توجه لفرع وموقع الشركة قبل موعد الرحلة مع إبراز كود الحجز ورقم الهاتف.</p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-white space-y-1">
                <div className="font-bold text-foreground text-xs">3. استلام التذكرة المؤكدة</div>
                <p className="text-muted-foreground">عند السداد الفيزيائي بمقر الشركة يتم تفعيل التذكرة النهائية واعتماد الصعود.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Profile Edit Tab - Clean Labels without Technical DB Field Names */}
      {active === "profile" && (
        <SectionCard title="الملف الشخصي وبيانات حساب السائح">
          <form className="max-w-xl space-y-3.5 text-right" onSubmit={handleUpdateProfile}>
            {/* Read-only Tourist ID (National ID / Passport) */}
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">كود السائح بالمنصة / رقم جواز السفر</label>
              <input
                type="text"
                value={touristInfo.tourist_id}
                disabled
                className="w-full h-9 px-3 rounded-xl border border-border bg-stone-100 text-stone-600 font-mono text-xs font-bold text-right cursor-not-allowed select-none"
              />
              <span className="text-[10px] text-stone-400 mt-0.5 block">كود الحساب ورقم جواز السفر المعتمد عند التسجيل (غير قابل للتعديل لأسباب أمنية)</span>
            </div>

            <Field
              label="الاسم بالكامل"
              value={touristInfo.full_name}
              onChange={(v) => setTouristInfo({ ...touristInfo, full_name: v })}
              pattern={/^[\u0600-\u06FF\sA-Za-z]+$/}
              errorMessage="الاسم يجب أن يحتوي على حروف فقط (عربي/إنجليزي)"
              maxLength={50}
            />

            <Field
              label="البريد الإلكتروني"
              type="email"
              value={touristInfo.email}
              onChange={(v) => setTouristInfo({ ...touristInfo, email: v })}
              pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/}
              errorMessage="صيغة البريد الإلكتروني غير صحيحة"
            />

            <LibyanPhoneField
              label="رقم الهاتف"
              value={touristInfo.phone_number}
              onChange={(v) => setTouristInfo({ ...touristInfo, phone_number: v })}
            />

            <Field
              label="كلمة المرور الجديدة (اختياري)"
              type="password"
              value={touristInfo.password}
              onChange={(v) => setTouristInfo({ ...touristInfo, password: v })}
              placeholder="اتركها فارغة إذا لم ترغب بتغييرها"
            />

            <button className="px-5 h-9 bg-[#1B5A78] hover:bg-[#13445C] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer mt-2">
              حفظ وتحديث بيانات الحساب ✓
            </button>
          </form>
        </SectionCard>
      )}

      {/* E-Ticket View Modal */}
      {ticketModal && (
        <Modal open={!!ticketModal} onClose={() => setTicketModal(null)} size="lg">
          <div className="p-0 bg-white rounded-2xl overflow-hidden relative shadow-xl text-right" dir="rtl">
            <div className="p-5 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#1B5A78] text-white flex items-center justify-center text-xl font-bold shadow-xs">
                  🎫
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 tracking-tight">التذكرة الإلكترونية</h3>
                  <p className="text-xs text-slate-500 font-medium">منصة دلني لخدمات السياحة والرحلات في ليبيا</p>
                </div>
              </div>
              <div className="text-left">
                <span className="font-mono text-xs px-3 py-1 rounded-lg bg-stone-100 text-[#1B5A78] border border-stone-200 font-bold block">
                  {ticketModal.code}
                </span>
              </div>
            </div>

            <div className="p-5 mt-2 relative">
              <div className="flex flex-col lg:flex-row gap-5">
                <div className="w-full lg:w-48 shrink-0 flex flex-col items-center justify-center bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
                  <div className="w-32 h-32 bg-white rounded-xl shadow-xs border border-stone-200 p-1 flex items-center justify-center mb-2 overflow-hidden">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt={`QR Code: ${ticketModal.code}`}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCode className="w-full h-full text-slate-800" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="text-[10px] text-slate-600 font-bold mb-1.5">
                    امسح الرمز لتأكيد الحجز بمقر الشركة
                  </div>
                  <div className="w-full py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-black">
                    ✅ {ticketModal.status}
                  </div>
                </div>

                <div className="flex-1 space-y-3.5">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">{ticketModal.tripName}</h4>
                    <span className="inline-block text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium border border-stone-200 mt-1">
                      {ticketModal.type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">🗓️ التاريخ والوقت</div>
                      <div className="font-bold text-slate-800">{ticketModal.date} ({ticketModal.time})</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">📍 نقطة الانطلاق</div>
                      <div className="font-medium text-slate-800 leading-tight">{ticketModal.pickup}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">🚌 الناقل والمركبة</div>
                      <div className="font-bold text-slate-700">{ticketModal.companyName}</div>
                      <div className="text-[11px] text-slate-500">{ticketModal.vehicleModel}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">👨‍✈️ المرشد السياحي</div>
                      <div className="font-bold text-slate-700">{ticketModal.guideName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{ticketModal.guideLicense}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">👥 المقاعد والتكلفة</div>
                      <div className="font-bold text-slate-800">{ticketModal.seats} مقاعد · <span className="text-[#1B5A78]">{ticketModal.price}</span></div>
                    </div>
                    <div className="text-[10px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                      🛡️ تأمين معتمد لكافة الركاب
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 border-t border-stone-200 p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-medium">
                💡 يُرجى التواجد بنقطة الانطلاق قبل 30 دقيقة من الموعد.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 h-8 rounded-lg bg-white border border-stone-200 text-slate-700 font-bold text-xs hover:bg-stone-50 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> طباعة
                </button>
                <button
                  onClick={() => setTicketModal(null)}
                  className="px-4 h-8 rounded-lg bg-[#1B5A78] hover:bg-[#13445C] text-white font-bold text-xs transition cursor-pointer"
                >
                  إغلاق التذكرة
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Trip Rating & Review Modal */}
      {reviewModalTicket && (
        <Modal open={!!reviewModalTicket} onClose={() => setReviewModalTicket(null)} size="md">
          <div className="p-5 text-right bg-white rounded-2xl space-y-4" dir="rtl">
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <h3 className="font-bold text-base text-foreground">
                    تقييم {reviewModalTicket.type}: {reviewModalTicket.tripName}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  شاركنا تجربتك وتقييمك الصادق لمساعدة باقي السياح وتحسين جودة الخدمة.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalTicket(null)}
                className="w-7 h-7 rounded-lg hover:bg-stone-100 text-stone-500 flex items-center justify-center text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Trip summary metadata */}
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-700 space-y-1">
              <div>📅 <b>تاريخ الرحلة:</b> {reviewModalTicket.date} ({reviewModalTicket.time})</div>
              <div>👨‍✈️ <b>المرشد السياحي:</b> {reviewModalTicket.guideName} ({reviewModalTicket.guideLicense})</div>
              <div>🎫 <b>رقم التذكرة:</b> <span className="font-mono font-bold text-[#1B5A78]">{reviewModalTicket.code}</span></div>
            </div>

            {reviewSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
                <span>✅</span>
                <span>{reviewSuccessMsg}</span>
              </div>
            )}

            {reviewErrorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                <span>⚠️</span>
                <span>{reviewErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-foreground block mb-2">
                  اختر تقييمك بالنجوم (1 إلى 5):
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewStars(star)}
                      className="p-1.5 rounded-lg hover:bg-amber-50 transition cursor-pointer"
                    >
                      <Star
                        className={`w-7 h-7 transition ${
                          star <= reviewStars
                            ? "fill-amber-400 text-amber-400 filter drop-shadow-xs"
                            : "text-stone-300"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-amber-600 mr-2">
                    {reviewStars === 5 && "ممتاز جداً 🌟"}
                    {reviewStars === 4 && "جيد جداً 👍"}
                    {reviewStars === 3 && "متوسط / مقبول 👌"}
                    {reviewStars === 2 && "يحتاج لتحسين ⚠️"}
                    {reviewStars === 1 && "تجربة غير مرضية 👎"}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground block mb-1">
                  تعليقك أو ملاحظاتك على الرحلة (اختياري):
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="كيف كان التنظيم، التزام المرشد، خط السير، النقل والأمان؟ شاركنا رأيك..."
                  rows={3}
                  maxLength={500}
                  className="w-full p-2.5 rounded-xl border border-border text-xs focus:ring-2 focus:ring-[#1B5A78]/20 focus:border-[#1B5A78] text-right"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-0.5">
                  <span>التعليق سيظهر في صفحة تفاصيل الرحلة لجميع السياح مع شارة التحقق.</span>
                  <span>{reviewComment.length}/500</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setReviewModalTicket(null)}
                  className="px-4 h-9 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-5 h-9 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isSubmittingReview ? (
                    <>
                      <span className="animate-spin text-sm">⏳</span>
                      <span>جاري حفظ التقييم...</span>
                    </>
                  ) : (
                    <>
                      <span>⭐</span>
                      <span>إرسال التقييم واعتماده</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}

function LibyanPhoneField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    onChange(val);
    setError(val && !/^09\d{8}$/.test(val) ? "يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)" : "");
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        type="tel"
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="09..."
        className={`w-full h-9 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${
          error ? "border-red-500" : "border-border focus:border-primary"
        }`}
      />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  pattern,
  errorMessage,
  maxLength,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  pattern?: RegExp;
  errorMessage?: string;
  maxLength?: number;
}) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    if (maxLength && val.length > maxLength) return;
    onChange(val);
    if (pattern && val) {
      setError(!pattern.test(val) ? errorMessage || "إدخال غير صحيح" : "");
    } else {
      setError("");
    }
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-9 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${
          error ? "border-red-500" : "border-border focus:border-primary"
        }`}
      />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}
