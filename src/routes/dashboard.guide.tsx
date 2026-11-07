import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { splitTripNotes } from "@/lib/privateTripNotes";
import { useState, useEffect } from "react";
import { platformConfirm } from "@/components/PlatformAlert";
import { fileToCompressedDataUrl } from "@/lib/imageCompress";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Check, Eye, Lock, ShieldCheck, AlertCircle, FileText, Upload, RefreshCw, Trash2, X, CalendarDays, Wallet, Users, Bus, Phone, Clock, type LucideIcon } from "lucide-react";
import type { TourGuide } from "@/lib/dbSchema";
import {
  getStoredSession,
  apiGetGuideDashboard,
  apiUpdateGuideProfile,
  apiGuideRespondPrivateTrip,
  apiGuideRespondWeeklyTrip,
  apiGuideRespondDailyTrip,
  apiGetPlaces,
  apiLogout,
} from "@/lib/api";

export const Route = createFileRoute("/dashboard/guide")({
  head: () => ({
    meta: [
      { title: "لوحة المرشد السياحي | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GuideDashboard,
});

type AssignedTrip = {
  id: string;
  trip_name: string;
  type: "يومية" | "أسبوعية" | "خاصة VIP";
  date: string;
  time_or_duration: string;
  tourist_group_name: string;
  seats_booked: number;
  status: "بانتظار القبول" | "مقبولة" | "مرفوضة";
  is_active_now?: boolean;
  raw: any; // full trip record from DelniDB, shown read-only in TripDetailsModal
};

type TouristManifestItem = {
  booking_id: string;
  tourist_id: string;
  tourist_name: string;
  phone_number: string;
  nationality: string;
  seats_count: number;
  trip_name: string;
  payment_status: "paid" | "unpaid" | "cash_at_office";
  attended: boolean;
};

const WEEKDAYS = [
  { id: "sat", nameAr: "السبت", nameEn: "Saturday" },
  { id: "sun", nameAr: "الأحد", nameEn: "Sunday" },
  { id: "mon", nameAr: "الاثنين", nameEn: "Monday" },
  { id: "tue", nameAr: "الثلاثاء", nameEn: "Tuesday" },
  { id: "wed", nameAr: "الأربعاء", nameEn: "Wednesday" },
  { id: "thu", nameAr: "الخميس", nameEn: "Thursday" },
  { id: "fri", nameAr: "الجمعة", nameEn: "Friday" },
];

function GuideDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const session = getStoredSession();
    if (!session.token || (session.role !== "guide" && session.role !== "admin")) {
      navigate({ to: "/auth/login" });
    }
  }, [navigate]);

  // A guide the admin has not approved (still under review, or rejected) cannot use the dashboard
  const blockUnapprovedGuide = (status: string | undefined) => {
    if (getStoredSession().role !== "guide" || (status || "").trim() === "موثق") return false;
    apiLogout();
    alert((status || "").trim() === "مرفوض"
      ? "⚠️ تم رفض طلب اعتماد حسابك كمرشد سياحي. يرجى التواصل مع إدارة المنصة."
      : "⚠️ حسابك قيد المراجعة من إدارة المنصة، وسيتم إشعارك فور اعتماده.");
    navigate({ to: "/auth/login" });
    return true;
  };

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "assigned_trips", label: isAr ? "الرحلات المسندة إليّ" : "Assigned Tours", icon: "🧭" },
    { id: "calendar", label: isAr ? "تقويم رحلاتي" : "My Trips Calendar", icon: "📅" },
    { id: "active_tourists", label: isAr ? "كشف سياح الرحلة" : "Active Manifest", icon: "☑️" },
    { id: "profile", label: isAr ? "الملف الشخصي والشهادات" : "Profile & Credentials", icon: "📄" },
  ];

  // Real Guide Profile State (populated purely from DelniDB: tour_guides table)
  const [guideInfo, setGuideInfo] = useState<TourGuide>(() => {
    const session = getStoredSession();
    const u = session.user || {};
    return {
      license_number: u.license_number || "",
      full_name: u.full_name || u.name || "",
      phone_number: u.phone_number || "",
      years_of_experience: Number(u.years_of_experience) || 0,
      certificate: u.certificate || "",
      certificate_name: u.certificate_name || null,
      bio: u.bio || "",
      speaks_english: Boolean(u.speaks_english),
      speaks_french: Boolean(u.speaks_french),
      speaks_italian: Boolean(u.speaks_italian),
      verification_status: u.verification_status || "بانتظار التوثيق",
      email: u.email || "",
      gender: u.gender || "male",
      working_days: typeof u.working_days === "string" ? u.working_days : JSON.stringify(u.working_days || []),
      operating_regions: typeof u.operating_regions === "string" ? u.operating_regions : JSON.stringify(u.operating_regions || []),
      primaryRegion: u.primaryRegion || "",
      price_per_day: Number(u.price_per_day) || 0,
      avatar: u.avatar || "",
      title: u.title || "",
      specialties: u.specialties || "",
      total_tours_completed: Number(u.total_tours_completed) || 0,
      digital_certificate_file: u.digital_certificate_file,
      license_expiry_date: u.license_expiry_date ? String(u.license_expiry_date).slice(0, 10) : "",
      availability_status: u.availability_status || "متاح",
    };
  });

  const [previewCertificateModal, setPreviewCertificateModal] = useState(false);
  const isVerified = (guideInfo.verification_status || "").trim() === "موثق" || (guideInfo.verification_status || "").trim() === "verified";

  // Real Assigned Trips (Empty until actually assigned in DelniDB)
  const [assignedTrips, setAssignedTrips] = useState<AssignedTrip[]>([]);

  // Real Active Trip Tourists (Empty until actual bookings in DelniDB)
  const [tourists, setTourists] = useState<TouristManifestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Live Data from DelniDB on mount
  useEffect(() => {
    async function loadGuideData(silent = false) {
      if (!silent) setIsLoading(true);
      const session = getStoredSession();
      const lic = session.user?.license_number || session.user?.email;
      if (!lic) {
        setIsLoading(false);
        return;
      }

      const data = await apiGetGuideDashboard(lic);
      if (data && data.live && blockUnapprovedGuide(data.guide?.verification_status)) return;
      if (data && data.guide) {
        const g = data.guide;
        setSelectedPlaceIds(Array.isArray(g.place_ids) ? g.place_ids : []);
        setGuideInfo({
          license_number: g.license_number || "",
          full_name: g.full_name || "",
          phone_number: g.phone_number || "",
          years_of_experience: Number(g.years_of_experience) || 0,
          certificate: g.certificate || "",
          certificate_name: g.certificate_name || null,
          bio: g.bio || "",
          speaks_english: Boolean(g.speaks_english),
          speaks_french: Boolean(g.speaks_french),
          speaks_italian: Boolean(g.speaks_italian),
          verification_status: g.verification_status || "بانتظار التوثيق",
          email: g.email || "",
          gender: g.gender || "male",
          working_days: typeof g.working_days === "string" ? g.working_days : JSON.stringify(g.working_days || []),
          operating_regions: typeof g.operating_regions === "string" ? g.operating_regions : JSON.stringify(g.operating_regions || []),
          primaryRegion: g.primaryRegion || "",
          price_per_day: Number(g.price_per_day) || 0,
          avatar: g.avatar || "",
          title: g.title || "",
          specialties: g.specialties || "",
          total_tours_completed: Number(g.total_tours_completed) || 0,
          digital_certificate_file: g.digital_certificate_file,
          license_expiry_date: g.license_expiry_date ? String(g.license_expiry_date).slice(0, 10) : "",
          availability_status: g.availability_status || "متاح",
        });

        // Bookings that still count: not cancelled, and for a daily trip (it runs every week) only today's run date
        const today = new Date().toLocaleDateString("en-CA");
        const liveBookings = (trip: any, daily: boolean) =>
          (Array.isArray(trip.bookings) ? trip.bookings : []).filter((b: any) =>
            !String(b.booking_status || "").startsWith("ملغ") && (!daily || String(b.trip_date || "").slice(0, 10) === today));
        const seatsOf = (rows: any[]) => rows.reduce((sum, b) => sum + (Number(b.number_of_seats) || 0), 0);

        // Map Real Assigned Trips from DelniDB
        const realTrips: AssignedTrip[] = [];
        if (data.daily_trips && Array.isArray(data.daily_trips)) {
          data.daily_trips.forEach((d: any) => {
            realTrips.push({
              id: d.daily_trip_id || `DT-${d.id}`,
              trip_name: d.trip_title || d.title || "رحلة يومية",
              type: "يومية",
              date: d.recurring_days || "أسبوعياً",
              time_or_duration: "يوم كامل",
              tourist_group_name: d.trip_title || d.title || "رحلة يومية",
              seats_booked: seatsOf(liveBookings(d, true)),
              // Like weekly trips, a daily trip waits for the guide's answer (empty = trip from before this step)
              status: d.guide_approval_status === "بانتظار رد المرشد" ? "بانتظار القبول" : d.guide_approval_status === "اعتذر المرشد" ? "مرفوضة" : "مقبولة",
              is_active_now: Boolean(d.is_active) && (!d.guide_approval_status || d.guide_approval_status === "وافق المرشد"),
              raw: d,
            });
          });
        }
        if (data.weekly_trips && Array.isArray(data.weekly_trips)) {
          data.weekly_trips.forEach((w: any) => {
            realTrips.push({
              id: w.weekly_trip_id || `WT-${w.id}`,
              trip_name: w.trip_title || w.title || "رحلة أسبوعية",
              type: "أسبوعية",
              date: `${w.start_date ? new Date(w.start_date).toLocaleDateString("ar-LY") : ""} - ${w.end_date ? new Date(w.end_date).toLocaleDateString("ar-LY") : ""}`,
              time_or_duration: w.start_date && w.end_date
                ? `${Math.round((new Date(String(w.end_date).slice(0, 10)).getTime() - new Date(String(w.start_date).slice(0, 10)).getTime()) / 86400000) + 1} أيام`
                : "",
              tourist_group_name: w.trip_title || w.title || "رحلة أسبوعية",
              seats_booked: seatsOf(liveBookings(w, false)),
              // guide_approval_status: empty for trips created before the guide's approval step
              status: w.guide_approval_status === "بانتظار رد المرشد" ? "بانتظار القبول" : w.guide_approval_status === "اعتذر المرشد" ? "مرفوضة" : "مقبولة",
              is_active_now: Boolean(w.is_active) && (!w.guide_approval_status || w.guide_approval_status === "وافق المرشد"),
              raw: w,
            });
          });
        }
        if (data.private_trips && Array.isArray(data.private_trips)) {
          data.private_trips.forEach((p: any) => {
            const places = Array.isArray(p.places) ? p.places.map((pl: any) => pl.place_name).filter(Boolean).join("، ") : "";
            realTrips.push({
              id: p.private_trip_id || `PT-${p.id}`,
              trip_name: places ? `رحلة خاصة: ${places}` : "رحلة خاصة VIP",
              type: "خاصة VIP",
              date: p.preferred_start_date ? String(p.preferred_start_date).split("T")[0] : "تاريخ مفضل",
              time_or_duration: `${p.duration_days || 1} أيام`,
              tourist_group_name: p.tourist?.full_name || "عميل VIP",
              seats_booked: Number(p.number_of_companions) || 1,
              status: p.status_order === "بانتظار رد المرشد" ? "بانتظار القبول" : p.status_order === "اعتذر المرشد" ? "مرفوضة" : "مقبولة",
              is_active_now: false,
              raw: p,
            });
          });
        }
        setAssignedTrips(realTrips);

        // Map Real Tourist Manifest from bookings in DelniDB
        const realTourists: TouristManifestItem[] = [];
        if (data.daily_trips && Array.isArray(data.daily_trips)) {
          data.daily_trips.forEach((d: any) => {
            {
              liveBookings(d, true).forEach((b: any) => {
                realTourists.push({
                  booking_id: `BK-D-${b.booking_daily_id || b.id}`,
                  tourist_id: b.tourist_id,
                  tourist_name: b.tourist?.full_name || `سائح (${b.tourist_id})`,
                  phone_number: b.tourist?.phone_number || "-",
                  nationality: "ليبي",
                  seats_count: Number(b.number_of_seats || b.seats_booked) || 1,
                  trip_name: d.trip_title || d.title,
                  payment_status: b.payment_status || (b.is_paid ? "paid" : "cash_at_office"),
                  attended: Boolean(b.attended ?? b.attendance_status),
                });
              });
            }
          });
        }
        if (data.weekly_trips && Array.isArray(data.weekly_trips)) {
          data.weekly_trips.forEach((w: any) => {
            {
              liveBookings(w, false).forEach((b: any) => {
                realTourists.push({
                  booking_id: `BK-W-${b.booking_weekly_id || b.id}`,
                  tourist_id: b.tourist_id,
                  tourist_name: b.tourist?.full_name || `سائح (${b.tourist_id})`,
                  phone_number: b.tourist?.phone_number || "-",
                  nationality: "ليبي",
                  seats_count: Number(b.number_of_seats || b.seats_booked) || 1,
                  trip_name: w.trip_title || w.title,
                  payment_status: b.payment_status || (b.is_paid ? "paid" : "cash_at_office"),
                  attended: Boolean(b.attended ?? b.attendance_status),
                });
              });
            }
          });
        }
        setTourists(realTourists);
      }
      setIsLoading(false);
    }
    loadGuideData();
    // Trips the admin assigns (private trips included) arrive while the dashboard is open:
    // re-read them quietly whenever the guide comes back to this tab
    const onVisible = () => {
      if (document.visibilityState === "visible") loadGuideData(true);
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  const [detailsTrip, setDetailsTrip] = useState<AssignedTrip | null>(null);

  // Landmarks registered on the platform; the guide picks the ones they work at (guide_places)
  const [platformPlaces, setPlatformPlaces] = useState<any[]>([]);
  const [selectedPlaceIds, setSelectedPlaceIds] = useState<string[]>([]);
  useEffect(() => {
    apiGetPlaces().then(setPlatformPlaces);
  }, []);

  const [respondingTripId, setRespondingTripId] = useState<string | null>(null);
  const respondToTrip = async (trip: AssignedTrip, decision: "accept" | "decline") => {
    if (decision === "decline" && !(await platformConfirm(`هل تريد الاعتذار عن الرحلة «${trip.trip_name}»؟ سيتم إشعار الإدارة.`))) return;
    setRespondingTripId(trip.id);
    const respond = trip.type === "يومية" ? apiGuideRespondDailyTrip : trip.type === "أسبوعية" ? apiGuideRespondWeeklyTrip : apiGuideRespondPrivateTrip;
    const res = await respond(guideInfo.license_number, trip.id, decision);
    setRespondingTripId(null);
    if (!res.success) {
      alert("❌ " + res.error);
      return;
    }
    setAssignedTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, status: decision === "accept" ? "مقبولة" : "مرفوضة" } : t)));
    alert(decision === "accept"
      ? (trip.type === "خاصة VIP" ? "✅ تم قبول الرحلة، وأُرسل البرنامج والتسعيرة للسائح." : "✅ تم قبول الرحلة، وأصبحت منشورة للسياح.")
      : "تم تسجيل اعتذارك عن الرحلة وإبلاغ الإدارة لتعيين مرشد آخر.");
  };

  // Every assigned trip waits for the guide's answer before it is published (private: before it goes to the tourist)
  const tripActions = (t: AssignedTrip) =>
    t.status === "بانتظار القبول" ? (
      <div className="flex gap-2">
        <button
          disabled={respondingTripId === t.id}
          onClick={() => respondToTrip(t, "accept")}
          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs disabled:opacity-50"
        >
          ✓ قبول الرحلة
        </button>
        <button
          disabled={respondingTripId === t.id}
          onClick={() => respondToTrip(t, "decline")}
          className="px-3.5 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold disabled:opacity-50"
        >
          ✕ اعتذار
        </button>
      </div>
    ) : null;

  const activeTrip = assignedTrips.find((t) => t.is_active_now);
  // Tours already run: accepted weekly trips past their end date, confirmed private trips past their last day
  const today = new Date().toISOString().slice(0, 10);
  const completedTours = assignedTrips.filter((t) => {
    if (t.type === "أسبوعية") return t.status === "مقبولة" && !!t.raw?.end_date && String(t.raw.end_date).slice(0, 10) < today;
    if (t.type === "خاصة VIP" && t.raw?.status_order === "مؤكدة" && t.raw?.preferred_start_date) {
      const end = new Date(String(t.raw.preferred_start_date).slice(0, 10));
      end.setDate(end.getDate() + (Number(t.raw.duration_days) || 1) - 1);
      return end.toISOString().slice(0, 10) < today;
    }
    return false;
  }).length;
  const activeTripTourists = tourists.filter((t) => activeTrip && t.trip_name === activeTrip.trip_name);
  const attendedCount = activeTripTourists.filter((t) => t.attended).reduce((acc, curr) => acc + curr.seats_count, 0);

  const selectedDays: string[] = (() => {
    try {
      const days = guideInfo.working_days;
      return Array.isArray(days) ? days : days ? JSON.parse(days) : [];
    } catch {
      return [];
    }
  })();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      fileToCompressedDataUrl(file).then((data) => {
        if (data) {
          setGuideInfo({
            ...guideInfo,
            digital_certificate_file: data,
            certificate_name: file.name,
          });
          alert("تم تحميل الوثيقة وتجهيز المعاينة بنجاح ✓ انقر على 'معاينة الوثيقة' للتأكد منها، ثم احفظ التعديلات في أسفل الصفحة.");
        }
      });
    }
  };

  const tomorrow = new Date(Date.now() + 86400000).toLocaleDateString("en-CA");
  const licenceDaysLeft = guideInfo.license_expiry_date
    ? Math.ceil((new Date(guideInfo.license_expiry_date).getTime() - new Date(new Date().toLocaleDateString("en-CA")).getTime()) / 86400000)
    : null;

  // متاح / إجازة: a guide on leave gets no new trips; the server refuses leave while trips are still assigned
  const toggleAvailability = async () => {
    const next = guideInfo.availability_status === "إجازة" ? "متاح" : "إجازة";
    const res = await apiUpdateGuideProfile(guideInfo.license_number, { availability_status: next });
    if (res.status !== "success") {
      alert("❌ " + res.message);
      return;
    }
    setGuideInfo({ ...guideInfo, availability_status: next });
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideInfo.phone_number.match(/^09\d{8}$/)) {
      alert("الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)");
      return;
    }
    if (!guideInfo.full_name || !guideInfo.license_number) {
      alert("الرجاء تعبئة كافة الحقول المطلوبة.");
      return;
    }
    if (guideInfo.years_of_experience < 2 || guideInfo.years_of_experience > 40) {
      alert("سنوات الخبرة يجب أن تكون بين سنتين و40 سنة.");
      return;
    }

    if (selectedPlaceIds.length === 0) {
      alert("يرجى اختيار معلم سياحي واحد على الأقل من أماكن العمل.");
      return;
    }
    // A changed licence expiry date must be in the future (an unchanged stored one is accepted by the server)
    const storedExpiry = String(getStoredSession().user?.license_expiry_date || "").slice(0, 10);
    if (guideInfo.license_expiry_date && guideInfo.license_expiry_date !== storedExpiry && guideInfo.license_expiry_date < tomorrow) {
      alert("تاريخ انتهاء الترخيص يجب أن يكون تاريخاً قادماً.");
      return;
    }
    const { operating_regions: _regions, ...profile } = guideInfo;
    const res = await apiUpdateGuideProfile(guideInfo.license_number, { ...profile, place_ids: selectedPlaceIds });
    if (res.status !== "success") {
      alert("❌ لم يتم حفظ التعديلات.\n" + res.message);
      return;
    }
    alert("تم حفظ التعديلات وتحديث ملفك بنجاح ✓");
    const session = getStoredSession();
    if (session.user) {
      localStorage.setItem("dalni_user", JSON.stringify({ ...session.user, ...res.guide }));
    }
  };

  return (
    <DashboardShell
      role="guide"
      roleLabel="مرشد سياحي معتمد"
      userName={guideInfo.full_name}
      userAvatar={guideInfo.avatar || undefined}
      nav={nav}
      active={active}
      onNavigate={setActive}
    >
      {/* Calm, Eye-Friendly Executive Welcome Banner */}
      <div className="rounded-3xl p-5 md:p-6 bg-[#0B1727] text-white border border-[#162942] shadow-sm mb-6 relative overflow-hidden text-right">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D96B27]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center gap-4 justify-between">
          <div className="flex items-center gap-4">
            {/* The guide's own photo, as tourists see it on the platform */}
            {guideInfo.avatar ? (
              <img
                src={guideInfo.avatar}
                alt={guideInfo.full_name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-2xl object-cover ring-4 ring-white/15 shadow-lg flex-shrink-0"
              />
            ) : (
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#003580] text-white grid place-items-center text-3xl font-black ring-4 ring-white/15 flex-shrink-0">
                {(guideInfo.full_name || "?").charAt(0)}
              </div>
            )}
          <div>
            <div className="text-xs text-stone-400 font-medium">مرحباً بك 👋</div>
            <h1 className="text-xl md:text-2xl font-black mt-1 text-white tracking-tight">{guideInfo.full_name}</h1>
            <p className="mt-1 text-xs text-stone-300 font-medium">
              ترخيص المزاولة:{" "}
              <span className="font-mono text-[#D96B27] font-bold">{guideInfo.license_number || "قيد المراجعة"}</span> · إجمالي
              الجولات المنفذة: <span className="text-[#D96B27] font-bold">{completedTours}</span> رحلة
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-lg font-medium border border-white/10">
                🗣️{" "}
                {[
                  guideInfo.speaks_english && "الإنجليزية",
                  guideInfo.speaks_french && "الفرنسية",
                  guideInfo.speaks_italian && "الإيطالية",
                ]
                  .filter(Boolean)
                  .join("، ") || "العربية فقط"}
              </span>
              {guideInfo.primaryRegion && (
                <span className="text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-lg font-medium border border-white/10">
                  📍 {guideInfo.primaryRegion}
                </span>
              )}
            </div>
          </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAvailability}
              title="المرشد في إجازة لا تُسند إليه رحلات جديدة"
              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer transition ${
                guideInfo.availability_status === "إجازة"
                  ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200"
              }`}
            >
              {guideInfo.availability_status === "إجازة" ? "🌙 في إجازة — اضغط للعودة متاحاً" : "✅ متاح — اضغط لتفعيل الإجازة"}
            </button>
            <Badge tone={guideInfo.verification_status === "موثق" ? "green" : "sun"}>{guideInfo.verification_status}</Badge>
            <Badge tone="sea">📜 {guideInfo.years_of_experience || 0} سنوات خبرة</Badge>
          </div>
        </div>
      </div>

      {/* Verification Status Banner if pending */}
      {!isVerified && (
        <div className="mb-6 p-4 rounded-2xl bg-orange-50/90 border border-orange-200/80 text-right flex items-start gap-3.5 text-stone-900 shadow-xs animate-in fade-in">
          <div className="w-9 h-9 rounded-xl bg-[#D96B27]/15 text-[#D96B27] grid place-items-center text-lg shrink-0 mt-0.5 shadow-2xs">
            ⏳
          </div>
          <div>
            <h3 className="font-black text-sm text-[#0F172A]">حسابك قيد المراجعة والتدقيق من قبل إدارة المنصة</h3>
            <p className="text-xs text-stone-600 mt-1 leading-relaxed font-medium">
              تم استلام وثائقك وبيانات ترخيص الإرشاد بنجاح. يقوم فريق إدارة دَلِّني حالياً بمراجعة رخصة الإرشاد السياحي واعتماد حسابك. فور الاعتماد سيصبح ملفك نشطاً في قائمة المرشدين العامة وستتمكن من استلام وإدارة الرحلات السياحية.
            </p>
          </div>
        </div>
      )}

      {/* Overview Tab */}
      {active === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <StatCard label="الرحلة النشطة الحالية" value={activeTrip ? activeTrip.trip_name : "لا يوجد رحلة حالياً"} icon="🧭" tone="sea" />
            <StatCard label="الرحلات بانتظار القبول" value={assignedTrips.filter((t) => t.status === "بانتظار القبول").length} icon="📥" tone="sun" />
            <StatCard label="أجر اليوم للرحلات الخاصة" value={guideInfo.price_per_day ? `${guideInfo.price_per_day} د.ل / يوم` : "غير محدد"} icon="💰" tone="green" />
            <StatCard label="إجمالي الجولات المكتملة" value={`${completedTours} جولة`} icon="🏆" tone="clay" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 text-right">
            <div className="lg:col-span-2 space-y-6">
              {activeTrip && (
                <SectionCard title="تأكيد حضور سياح الرحلة النشطة قيد الإجراء الآن">
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold text-foreground text-sm">{activeTrip.trip_name}</h3>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          ⏱️ الموعد: {activeTrip.time_or_duration} · 👥 المقاعد المحجوزة: {activeTrip.seats_booked}
                        </div>
                      </div>
                      <Badge tone="green">قيد الإجراء 🟢</Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs font-semibold p-2.5 rounded-lg bg-white border border-border">
                      <span>تعداد الحضور الفعلي:</span>
                      <span className="text-primary font-bold">
                        {attendedCount} من أصل {activeTrip.seats_booked} حاضرون
                      </span>
                    </div>
                    <button
                      onClick={() => setActive("active_tourists")}
                      className="w-full py-2 bg-gradient-sea text-white rounded-lg text-xs font-bold shadow-soft"
                    >
                      فتح كشف تأكيد الحضور التفصيلي ☑️
                    </button>
                  </div>
                </SectionCard>
              )}

              <SectionCard title="الرحلات المسندة إليك من الإدارة">
                {assignedTrips.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-stone-200 text-center space-y-1.5 bg-stone-50/50">
                    <div className="text-2xl">📭</div>
                    <div className="font-bold text-stone-800 text-xs">لا توجد رحلات مسندة إليك حالياً من الإدارة</div>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                      عندما تقوم إدارة المنصة بإسناد رحلة جديدة لك، ستظهر هنا فوراً ويمكنك الاطلاع على تفاصيلها كاملة.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {assignedTrips.map((t) => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-xl border border-stone-200 bg-white flex flex-wrap justify-between items-center gap-3 text-right"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900 text-sm">{t.trip_name}</span>
                            <Badge tone={t.type === "خاصة VIP" ? "sun" : "sea"}>{t.type}</Badge>
                            <Badge tone={t.status === "مقبولة" ? "green" : t.status === "مرفوضة" ? "red" : "sun"}>{t.status}</Badge>
                          </div>
                          <div className="text-[11px] text-stone-500 mt-1">
                            🗓️ {t.date} · ⏱️ {t.time_or_duration} · 👥 {t.seats_booked} سياح
                          </div>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          {tripActions(t)}
                          <button
                            onClick={() => setDetailsTrip(t)}
                            className="px-3.5 py-1.5 bg-gradient-sea text-white rounded-lg text-xs font-bold shadow-2xs"
                          >
                            📋 عرض تفاصيل الرحلة
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="بيانات الترخيص والوثائق الرسمية">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2.5 text-xs text-right">
                  <div className="font-bold text-stone-800 flex items-center justify-between">
                    <span>ترخيص وزارة السياحة والآثار</span>
                    <Badge tone={isVerified ? "green" : "sun"}>{guideInfo.verification_status}</Badge>
                  </div>
                  <p className="text-stone-600">
                    رقم الترخيص: <span className="font-mono font-bold text-stone-900">{guideInfo.license_number || "قيد المراجعة"}</span>
                  </p>

                  {guideInfo.digital_certificate_file && (
                    <button
                      type="button"
                      onClick={() => setPreviewCertificateModal(true)}
                      className="w-full py-1.5 rounded-lg bg-white border border-stone-200 text-stone-700 hover:text-stone-900 text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                    >
                      <span>👁️</span>
                      <span>معاينة وثيقة الترخيص المرفقة</span>
                    </button>
                  )}

                  <button
                    onClick={() => setActive("profile")}
                    className="w-full py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                  >
                    إدارة الملف والوثائق
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* Assigned Trips Tab */}
      {active === "assigned_trips" && (
        <SectionCard title="الرحلات المسندة إليك من الإدارة">
          {assignedTrips.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-stone-200 text-center space-y-2 bg-stone-50/50">
              <div className="text-3xl">📭</div>
              <div className="font-bold text-stone-800 text-sm">لا توجد رحلات مسندة إليك حالياً</div>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                لم يتم إسناد أي رحلات جديدة لك من إدارة المنصة حتى الآن. تابع هنا باستمرار لتلقي الرحلات ومباشرة الإشراف.
              </p>
            </div>
          ) : (
            <div className="space-y-3.5 text-right">
              {assignedTrips.map((t) => (
                <div key={t.id} className="p-4 rounded-xl border border-stone-200 bg-white shadow-2xs space-y-2.5">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div>
                      <span className="text-[11px] font-mono font-bold text-stone-400">{t.id}</span>
                      <h3 className="font-bold text-stone-900 text-base">{t.trip_name}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge tone={t.type === "خاصة VIP" ? "sun" : "sea"}>{t.type}</Badge>
                      <Badge tone={t.status === "مقبولة" ? "green" : t.status === "مرفوضة" ? "red" : "sun"}>{t.status}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-medium text-stone-700">
                    <div>🗓️ الموعد: {t.date}</div>
                    <div>⏱️ المدة: {t.time_or_duration}</div>
                    <div>👥 السياح المحجوزون: {t.seats_booked} فرد</div>
                  </div>
                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                    {t.is_active_now && (
                      <button onClick={() => setActive("active_tourists")} className="text-primary text-xs font-bold hover:underline">
                        عرض كشف سياح هذه الرحلة النشطة ←
                      </button>
                    )}
                    <div className="mr-auto flex gap-2 flex-wrap">
                      {tripActions(t)}
                      <button
                        onClick={() => setDetailsTrip(t)}
                        className="px-4 py-1.5 bg-gradient-sea text-white rounded-lg text-xs font-bold shadow-2xs"
                      >
                        📋 عرض تفاصيل الرحلة كاملة
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {/* My trips calendar: the trip days ahead and each date's tourists */}
      {active === "calendar" && (
        <SectionCard title="تقويم رحلاتي (الثلاثون يوماً القادمة)">
          <GuideCalendar trips={assignedTrips} onDetails={setDetailsTrip} />
        </SectionCard>
      )}

      {/* Active Tourists Manifest Tab */}
      {active === "active_tourists" && (
        <SectionCard title={`كشف حضور سياح الرحلة النشطة (${activeTrip ? activeTrip.trip_name : "لا يوجد رحلة جارية"})`}>
          {activeTrip ? (
            <div className="space-y-4 text-right">
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">الرحلة الحالية: {activeTrip.trip_name}</h4>
                  <p className="text-[11px] text-emerald-800 mt-0.5">⏱️ الموعد: {activeTrip.time_or_duration} · قائمة السياح المحجوزين في هذه الرحلة (للاطلاع فقط).</p>
                </div>
                <div className="text-left">
                  <div className="text-xl font-bold text-emerald-800">{attendedCount} / {activeTrip.seats_booked}</div>
                  <div className="text-[10px] text-emerald-600 font-medium">سائح تم تسجيل حضورهم</div>
                </div>
              </div>

              {activeTripTourists.length === 0 ? (
                <div className="p-8 rounded-xl border border-dashed border-stone-200 text-center space-y-1.5 bg-stone-50/50">
                  <div className="text-2xl">👥</div>
                  <div className="font-bold text-stone-800 text-xs">لا توجد حجوزات أو سياح مسجلون على هذه الرحلة حتى الآن</div>
                  <p className="text-[11px] text-stone-500">عندما يحجز السياح مقاعدهم في هذه الرحلة، ستظهر أسماؤهم وتأكيد حضورهم هنا.</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-stone-200">
                  <table className="w-full text-xs text-right">
                    <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                      <tr>
                        <th className="p-2.5">رقم الحجز</th>
                        <th className="p-2.5">اسم السائح</th>
                        <th className="p-2.5">رقم الهاتف</th>
                        <th className="p-2.5">عدد المقاعد</th>
                        <th className="p-2.5">حالة الدفع</th>
                        <th className="p-2.5">الحضور</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {activeTripTourists.map((tr) => (
                        <tr key={tr.booking_id} className={tr.attended ? "bg-emerald-50/30" : ""}>
                          <td className="p-2.5 font-mono text-[11px] font-bold text-stone-600">{tr.booking_id}</td>
                          <td className="p-2.5 font-bold text-stone-900">{tr.tourist_name}</td>
                          <td className="p-2.5 font-mono text-stone-600 text-[11px]" dir="ltr">{tr.phone_number}</td>
                          <td className="p-2.5 font-bold text-[#1B5A78]">{tr.seats_count} مقاعد</td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                tr.payment_status === "paid"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {tr.payment_status === "paid" ? "مدفوع" : "نقداً بالفرع"}
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] ${
                                tr.attended ? "bg-emerald-600 text-white" : "bg-stone-100 text-stone-600"
                              }`}
                            >
                              {tr.attended ? "✓ حاضر" : "لم يُسجَّل"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-stone-500 text-xs">
              لا توجد رحلة نشطة قيد الإجراء حالياً. يتم إظهار قائمة السياح وتعداد الحضور فقط للرحلات الجارية الآن.
            </div>
          )}
        </SectionCard>
      )}

      {/* Profile & Credentials Tab */}
      {active === "profile" && (
        <SectionCard title="الملف الشخصي والبيانات المهنية للمرشد السياحي">
          {/* Security Alert Banner */}
          <div className="mb-5">
            {isVerified ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 text-right">
                <span className="text-xl">🛡️</span>
                <div>
                  <span className="font-bold block">الملف موثق ومعتمد رسمياً في السجل السياحي</span>
                  <span className="text-[11px] text-emerald-700">
                    البيانات الأساسية ورقم الترخيص مقفلة لأسباب أمنية وقانونية. يمكنك تحديث بيانات التواصل والأسعار ومناطق العمل والنبذة، أو إرفاق شهادات جديدة.
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-3 text-right">
                <span className="text-xl">⏳</span>
                <div>
                  <span className="font-bold block">الملف قيد المراجعة والتوثيق من إدارة المنصة</span>
                  <span className="text-[11px] text-amber-700">
                    يرجى التأكد من رفع نسخة واضحة من ترخيص مزاولة الإرشاد الصادر من وزارة السياحة لاعتماد حسابك رسمياً.
                  </span>
                </div>
              </div>
            )}
          </div>

          <form className="max-w-2xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            {/* Section 1: Official Identity (Locked for security if verified) */}
            <div className="space-y-3 pb-3 border-b border-stone-100">
              <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-500" />
                <span>بيانات الهوية والترخيص الرسمي (مقيدة أمنياً):</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="الاسم الرباعي الكامل"
                  value={guideInfo.full_name}
                  onChange={(v) => setGuideInfo({ ...guideInfo, full_name: v })}
                  disabled={isVerified}
                  badge={isVerified ? "🔒 معتمد رسمياً" : undefined}
                />
                <Field
                  label="رقم ترخيص مزاولة الإرشاد"
                  value={guideInfo.license_number}
                  disabled={true}
                  badge="🔒 معتمد بالسجل"
                />
              </div>
              <Field
                label="تاريخ انتهاء ترخيص الإرشاد"
                type="date"
                min={tomorrow}
                value={guideInfo.license_expiry_date || ""}
                onChange={(v) => setGuideInfo({ ...guideInfo, license_expiry_date: v })}
                badge={licenceDaysLeft !== null && licenceDaysLeft <= 30 ? `⏰ ينتهي خلال ${Math.max(licenceDaysLeft, 0)} يوماً` : undefined}
              />

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="البريد الإلكتروني"
                  type="email"
                  value={guideInfo.email}
                  disabled={true}
                  badge="🔒 معتمد للحساب"
                />
                <div>
                  <label className="text-xs font-semibold text-stone-700 mb-1 block">الجنس:</label>
                  {isVerified ? (
                    <div className="h-10 px-3 rounded-xl border border-stone-200 bg-stone-100/80 flex items-center justify-between text-xs font-semibold text-stone-600">
                      <span>{guideInfo.gender === "female" ? "👩 أنثى (مرشدة سياحية)" : "👨 ذكر (مرشد سياحي)"}</span>
                      <span className="text-[10px] text-stone-400">🔒 معتمد</span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGuideInfo({ ...guideInfo, gender: "male" })}
                        className={`h-10 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          guideInfo.gender === "male"
                            ? "border-[#1B5A78] bg-[#1B5A78]/5 text-[#1B5A78]"
                            : "border-stone-200 bg-white text-stone-600"
                        }`}
                      >
                        <span>👨 ذكر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuideInfo({ ...guideInfo, gender: "female" })}
                        className={`h-10 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                          guideInfo.gender === "female"
                            ? "border-[#1B5A78] bg-[#1B5A78]/5 text-[#1B5A78]"
                            : "border-stone-200 bg-white text-stone-600"
                        }`}
                      >
                        <span>👩 أنثى</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 2: Contact & Professional details */}
            <div className="space-y-3 pb-3 border-b border-stone-100">
              <div className="text-xs font-bold text-stone-800">معلومات التواصل والعمل الميداني:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="رقم الهاتف المحمول"
                  value={guideInfo.phone_number}
                  onChange={(v) => setGuideInfo({ ...guideInfo, phone_number: v })}
                  placeholder="0912345678"
                />
                <Field
                  label="البريد الإلكتروني المعتمد"
                  value={guideInfo.email || ""}
                  disabled
                  placeholder="guide@dalni.ly"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="سنوات الخبرة الميدانية"
                  type="number"
                  value={String(guideInfo.years_of_experience || 0)}
                  onChange={(v) => setGuideInfo({ ...guideInfo, years_of_experience: Number(v) })}
                />
                <Field
                  label="سعر اليوم الواحد (دينار ليبي)"
                  type="number"
                  value={guideInfo.price_per_day ? String(guideInfo.price_per_day) : ""}
                  onChange={(v) => setGuideInfo({ ...guideInfo, price_per_day: Number(v) })}
                  placeholder="0"
                />
              </div>
            </div>

            {/* Section 3: Spoken Languages */}
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">اللغات الأجنبية التي تجيد التحدث بها:</label>
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-50/70 rounded-xl border border-stone-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={guideInfo.speaks_english}
                    onChange={(e) => setGuideInfo({ ...guideInfo, speaks_english: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>الإنجليزية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={guideInfo.speaks_french}
                    onChange={(e) => setGuideInfo({ ...guideInfo, speaks_french: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>الفرنسية</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                  <input
                    type="checkbox"
                    checked={guideInfo.speaks_italian}
                    onChange={(e) => setGuideInfo({ ...guideInfo, speaks_italian: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>الإيطالية</span>
                </label>
              </div>
            </div>

            {/* Section 4: Workplaces = landmarks registered on the platform */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700">أماكن العمل (من المعالم السياحية المسجلة في المنصة):</label>
                <span className="text-[11px] font-bold text-[#1B5A78]">{selectedPlaceIds.length} معالم مختارة</span>
              </div>
              {platformPlaces.length === 0 ? (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 font-semibold">
                  لا توجد معالم سياحية مسجلة في المنصة حالياً. تضيفها إدارة المنصة، ثم يمكنك اختيار أماكن عملك منها.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50/70 rounded-xl border border-stone-200 max-h-52 overflow-y-auto">
                  {platformPlaces.map((place) => {
                    const pid = String(place.place_id);
                    const isChecked = selectedPlaceIds.includes(pid);
                    return (
                      <div
                        key={pid}
                        onClick={() => setSelectedPlaceIds(isChecked ? selectedPlaceIds.filter((p) => p !== pid) : [...selectedPlaceIds, pid])}
                        className={`flex items-center gap-2 p-2 rounded-lg border text-right transition cursor-pointer ${
                          isChecked ? "border-[#1B5A78] bg-white text-[#0B132B] font-bold shadow-2xs" : "border-stone-200 bg-white/70 text-stone-500"
                        }`}
                      >
                        <MapPin className={`w-3.5 h-3.5 ${isChecked ? "text-[#1B5A78]" : "text-stone-400"}`} />
                        <span className="text-xs flex-1 truncate">{place.place_name}{place.city ? ` (${place.city})` : ""}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 text-[#1B5A78]" />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 5: Available Days */}
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1.5 block">أيام العمل المتاحة أسبوعياً:</label>
              <div className="grid grid-cols-7 gap-1.5 p-2 bg-stone-50/70 rounded-xl border border-stone-200">
                {WEEKDAYS.map((day) => {
                  const isChecked = selectedDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        const next = isChecked ? selectedDays.filter((d) => d !== day.id) : [...selectedDays, day.id];
                        setGuideInfo({ ...guideInfo, working_days: JSON.stringify(next) });
                      }}
                      className={`py-2 px-1 rounded-lg border text-center transition ${
                        isChecked ? "bg-[#1B5A78] text-white font-bold border-[#1B5A78]" : "bg-white border-stone-200 text-stone-500 hover:bg-stone-50"
                      }`}
                    >
                      <span className="text-[11px] block">{day.nameAr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Dedicated Certificate Preview & Upload Widget */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50/60 space-y-3 text-right">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <span>📜</span>
                    <span>وثيقة ترخيص الإرشاد الرسمية المرفقة</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    النسخة الرقمية لشهادة الترخيص أو بطاقة المزاولة الصادرة من وزارة السياحة والآثار.
                  </p>
                </div>
                {guideInfo.digital_certificate_file && (
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ✓ الوثيقة مرفقة
                  </span>
                )}
              </div>

              {guideInfo.digital_certificate_file ? (
                <div className="p-3 bg-white rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Visual Thumbnail */}
                    {guideInfo.digital_certificate_file.startsWith("data:image") ||
                    guideInfo.digital_certificate_file.startsWith("http") ||
                    guideInfo.digital_certificate_file.includes("/assets/") ? (
                      <div
                        onClick={() => setPreviewCertificateModal(true)}
                        className="w-14 h-14 rounded-lg overflow-hidden border border-stone-200 bg-stone-100 shrink-0 cursor-pointer hover:opacity-90 relative group"
                        title="انقر لتكبير ومعاينة الوثيقة"
                      >
                        <img src={guideInfo.digital_certificate_file} alt="وثيقة الترخيص" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs transition">
                          🔍
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => setPreviewCertificateModal(true)}
                        className="w-14 h-14 rounded-lg border border-red-200 bg-red-50 text-red-700 grid place-items-center shrink-0 cursor-pointer text-xl font-bold"
                        title="انقر لمعاينة ملف PDF"
                      >
                        📄
                      </div>
                    )}

                    <div className="text-right">
                      <div className="text-xs font-bold text-stone-800">
                        {guideInfo.certificate_name || "وثيقة_الترخيص_الرسمية"}
                      </div>
                      <div className="text-[11px] text-stone-500 mt-0.5">
                        {guideInfo.digital_certificate_file.startsWith("data:application/pdf")
                          ? "مستند رقمي بتنسيق PDF"
                          : "صورة رقمية واضحة للترخيص"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewCertificateModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الوثيقة</span>
                    </button>

                    <label className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>استبدال الملف</span>
                      <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
                    </label>

                    {!isVerified && (
                      <button
                        type="button"
                        onClick={() =>
                          setGuideInfo({ ...guideInfo, digital_certificate_file: undefined, certificate_name: undefined })
                        }
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="إلغاء الملف"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-white rounded-xl border border-dashed border-stone-300 text-center space-y-2">
                  <div className="text-xl">📁</div>
                  <div className="text-xs font-bold text-stone-700">لم تقم بإرفاق نسخة رقمية من الترخيص بعد</div>
                  <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                    ارفع صورة واضحة لترخيصك أو ملف PDF من جهازك ليتمكن مدير المنصة من مطابقة بياناتك وتوثيق حسابك رسمياً.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer transition shadow-2xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>اختيار ملف الترخيص (صورة أو PDF)</span>
                    <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
                  </label>
                </div>
              )}
            </div>

            {/* Section 7: Bio */}
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1 block">النبذة التعريفية عن خبراتك وجولاتك:</label>
              <textarea
                value={guideInfo.bio || ""}
                onChange={(e) => setGuideInfo({ ...guideInfo, bio: e.target.value })}
                rows={3}
                placeholder="اكتب نبذة عن مسيرتك في الإرشاد السياحي..."
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 text-right outline-none focus:border-[#1B5A78]"
              />
            </div>

            <button
              type="submit"
              className="px-6 h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>حفظ وتحديث الملف الشخصي ✓</span>
            </button>
          </form>
        </SectionCard>
      )}

      {/* Certificate Lightbox Inspection Modal */}
      {previewCertificateModal && guideInfo.digital_certificate_file && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs grid place-items-center p-4 animate-overlay-in">
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-200 text-right animate-dialog-in">
            <div className="p-3.5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <button
                type="button"
                onClick={() => setPreviewCertificateModal(false)}
                className="w-7 h-7 rounded-lg bg-white border border-stone-200 text-stone-600 hover:text-stone-900 grid place-items-center font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
              <div className="text-right">
                <h3 className="text-xs font-bold text-stone-900 flex items-center gap-1.5 justify-end">
                  <span>معاينة وثيقة الترخيص الرسمية</span>
                  <span>📜</span>
                </h3>
                <p className="text-[11px] text-stone-500">
                  مرشد: {guideInfo.full_name} · رقم الترخيص: {guideInfo.license_number}
                </p>
              </div>
            </div>

            <div className="p-4 max-h-[70vh] overflow-y-auto flex items-center justify-center bg-stone-100/60">
              {guideInfo.digital_certificate_file.startsWith("data:application/pdf") ? (
                <iframe
                  src={guideInfo.digital_certificate_file}
                  className="w-full h-[60vh] rounded-lg border border-stone-200"
                  title="معاينة PDF"
                />
              ) : (
                <img
                  src={guideInfo.digital_certificate_file}
                  alt="الشهادة الرقمية"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg border border-stone-200 shadow-sm"
                />
              )}
            </div>

            <div className="p-3 border-t border-stone-200 bg-stone-50 flex items-center justify-between text-xs">
              <span className="text-stone-500 text-[11px]">
                تم إرفاق الوثيقة لمراجعتها وتوثيقها من قبل إدارة منصة دلّني
              </span>
              <button
                type="button"
                onClick={() => setPreviewCertificateModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {detailsTrip && <TripDetailsModal trip={detailsTrip} onClose={() => setDetailsTrip(null)} />}
    </DashboardShell>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  badge,
  min,
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  badge?: string;
  min?: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-stone-700">{label}</label>
        {badge && (
          <span className="text-[10px] font-medium text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1">
            {badge}
          </span>
        )}
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        className={`w-full h-10 px-3 rounded-xl border text-right outline-none text-xs sm:text-sm font-medium transition ${
          disabled
            ? "bg-stone-100/80 border-stone-200 text-stone-500 cursor-not-allowed select-none"
            : "bg-white border-stone-200 text-stone-800 hover:border-stone-300 focus:border-[#1B5A78] focus:ring-2 focus:ring-[#1B5A78]/10"
        }`}
      />
    </div>
  );
}

/* ---- READ-ONLY TRIP DETAILS (the guide can view everything about an assigned trip but change nothing) ---- */
/* ============ تقويم رحلاتي: the guide's trip days ahead, with the tourists booked for each date ============ */

const WEEK_DAY_NAMES = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const CALENDAR_DAYS = 30;
const normalizeDay = (d: string) => String(d || "").trim().replace("إ", "ا");
const isoDay = (d: Date) => d.toLocaleDateString("en-CA");

type CalendarEntry = { trip: AssignedTrip; passengers: { id: string; name: string; phone: string; seats: number; paid: boolean; attended: boolean }[] };

// Trips the guide has accepted (or were assigned before the approval step) that run on this date
function tripsOn(date: Date, trips: AssignedTrip[]): CalendarEntry[] {
  const day = isoDay(date);
  const weekday = normalizeDay(WEEK_DAY_NAMES[date.getDay()]);
  const live = (rows: any[], daily: boolean) =>
    (Array.isArray(rows) ? rows : []).filter(
      (b: any) => !String(b.booking_status || "").startsWith("ملغ") && (!daily || String(b.trip_date || "").slice(0, 10) === day),
    );
  const fromBookings = (rows: any[]) =>
    rows.map((b: any) => ({
      id: b.booking_daily_id || b.booking_weekly_id,
      name: b.tourist?.full_name || b.tourist_id,
      phone: b.tourist?.phone_number || "",
      seats: Number(b.number_of_seats) || 0,
      paid: b.payment_status === "paid",
      attended: Boolean(b.attended),
    }));

  const entries: CalendarEntry[] = [];
  for (const t of trips) {
    const r = t.raw || {};
    if (t.status !== "مقبولة") continue;
    if (t.type === "يومية") {
      if (!r.is_active) continue;
      const days: string[] = (Array.isArray(r.days) ? r.days : []).map((d: any) => normalizeDay(d.day_of_week ?? d));
      if (days.length && !days.includes(weekday)) continue;
      entries.push({ trip: t, passengers: fromBookings(live(r.bookings, true)) });
    } else if (t.type === "أسبوعية") {
      const start = String(r.start_date || "").slice(0, 10);
      const end = String(r.end_date || "").slice(0, 10);
      if (!r.is_active || !start || day < start || day > end) continue;
      entries.push({ trip: t, passengers: fromBookings(live(r.bookings, false)) });
    } else if (r.status_order === "مؤكدة" && r.preferred_start_date) {
      const start = String(r.preferred_start_date).slice(0, 10);
      const last = new Date(start);
      last.setDate(last.getDate() + (Number(r.duration_days) || 1) - 1);
      if (day < start || day > isoDay(last)) continue;
      entries.push({
        trip: t,
        passengers: [{ id: r.private_trip_id, name: r.tourist?.full_name || r.tourist_id, phone: r.tourist?.phone_number || "",
          seats: Number(r.number_of_companions) || 0, paid: true, attended: false }],
      });
    }
  }
  return entries;
}

function GuideCalendar({ trips, onDetails }: { trips: AssignedTrip[]; onDetails: (t: AssignedTrip) => void }) {
  const dates = Array.from({ length: CALENDAR_DAYS }, (_, i) => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + i);
    return d;
  });
  const busy = dates.map((d) => ({ date: d, entries: tripsOn(d, trips) })).filter((x) => x.entries.length > 0);
  const [selected, setSelected] = useState<string | null>(null);
  const current = busy.find((x) => isoDay(x.date) === selected) || busy[0];

  if (busy.length === 0) {
    return (
      <div className="text-center py-10 text-stone-500 text-xs">
        لا توجد رحلات مقبولة مسندة إليك خلال الثلاثين يوماً القادمة.
      </div>
    );
  }

  return (
    <div className="space-y-4 text-right">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {busy.map(({ date, entries }) => {
          const key = isoDay(date);
          const on = current && isoDay(current.date) === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              className={`shrink-0 px-3 py-2 rounded-xl border text-center cursor-pointer transition ${
                on ? "bg-[#1B5A78] text-white border-[#1B5A78]" : "bg-white text-stone-700 border-stone-200 hover:border-[#1B5A78]/50"
              }`}
            >
              <div className="text-[10px] font-bold">{WEEK_DAY_NAMES[date.getDay()]}</div>
              <div className="text-sm font-black font-mono">{key.slice(5).replace("-", "/")}</div>
              <div className={`text-[10px] font-bold ${on ? "text-white/80" : "text-[#D96B27]"}`}>{entries.length} رحلة</div>
            </button>
          );
        })}
      </div>

      {current?.entries.map(({ trip, passengers }) => {
        const seats = passengers.reduce((sum, p) => sum + p.seats, 0);
        return (
          <div key={trip.id} className="rounded-xl border border-stone-200 bg-white overflow-hidden">
            <div className="p-3 flex flex-wrap items-center justify-between gap-2 bg-stone-50 border-b border-stone-200">
              <div>
                <div className="font-bold text-stone-900 text-xs sm:text-sm">{trip.trip_name}</div>
                <div className="text-[11px] text-stone-500">
                  رحلة {trip.type} · {trip.type === "خاصة VIP" ? `${seats} مرافق` : `${seats} مقعد محجوز`}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDetails(trip)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 cursor-pointer"
              >
                التفاصيل
              </button>
            </div>
            {passengers.length === 0 ? (
              <div className="p-4 text-center text-[11px] text-stone-500">لا توجد حجوزات على هذه الرحلة في هذا التاريخ.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="text-stone-600 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-2">رقم الحجز</th>
                      <th className="p-2">السائح</th>
                      <th className="p-2">الهاتف</th>
                      <th className="p-2">المقاعد</th>
                      <th className="p-2">الدفع</th>
                      <th className="p-2">الحضور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {passengers.map((p) => (
                      <tr key={p.id}>
                        <td className="p-2 font-mono text-[11px] text-stone-600">{p.id}</td>
                        <td className="p-2 font-bold text-stone-900">{p.name}</td>
                        <td className="p-2 font-mono text-[11px] text-stone-600" dir="ltr">{p.phone || "—"}</td>
                        <td className="p-2 font-bold">{p.seats}</td>
                        <td className="p-2">{trip.type === "خاصة VIP" ? "—" : p.paid ? "مدفوع" : "نقداً بالفرع"}</td>
                        <td className="p-2">{trip.type === "خاصة VIP" ? "—" : p.attended ? "✓ حاضر" : "لم يُسجَّل"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function TripDetailsModal({ trip, onClose }: { trip: AssignedTrip; onClose: () => void }) {
  const r = trip.raw || {};
  // Stations start folded: two are shown, the rest on demand
  const [showAllStations, setShowAllStations] = useState(false);
  const fmtDate = (v?: string) => (v ? new Date(v).toLocaleDateString("ar-LY") : "—");
  const money = (v: any) => (v !== null && v !== undefined && v !== "" ? `${Number(v).toLocaleString("ar-LY")} د.ل` : "—");
  const list = (v: any): any[] => (Array.isArray(v) ? v : []);
  const stations = [...list(r.stations)].sort(
    (a, b) => (a.day_number || 1) - (b.day_number || 1) || (a.station_order || 0) - (b.station_order || 0)
  );
  const restaurants = r.restaurant ? [r.restaurant, ...list(r.restaurants)] : list(r.restaurants);
  const bookings = list(r.bookings);

  const info: [string, string][] = [];
  if (trip.type === "يومية") {
    info.push(["أيام التشغيل", list(r.days).map((d) => d.day_of_week).join("، ") || trip.date]);
    info.push(["سعر المقعد", money(r.price_per_seat)]);
  } else if (trip.type === "أسبوعية") {
    info.push(["من", fmtDate(r.start_date)], ["إلى", fmtDate(r.end_date)]);
    info.push(["سعر المقعد", money(r.seat_per_price)]);
  } else {
    info.push(["تاريخ البدء المفضل", fmtDate(r.preferred_start_date)], ["المدة", `${r.duration_days || 1} أيام`]);
    info.push(["عدد المرافقين", String(r.number_of_companions ?? "—")], ["حالة الطلب", r.status_order || "—"]);
    info.push(["السعر المعتمد", money(r.quoted_price)]);
    if (Number(r.additional_expenses) > 0) info.push(["مصروفات الخدمات", money(r.additional_expenses)]);
    if (r.tourist) info.push(["العميل", `${r.tourist.full_name || ""} — ${r.tourist.phone_number || ""}`]);
  }
  if (r.departure_city) info.push(["مدينة الانطلاق", r.departure_city]);
  // A daily trip's free seats depend on the run date, so only its capacity is shown
  if (r.max_capacity) info.push(trip.type === "يومية" ? ["سعة الرحلة", `${r.max_capacity} مقعد`] : ["السعة / المقاعد المتاحة", `${r.max_capacity} / ${r.available_seats ?? "—"}`]);
  const vehicle = r.vehicle || (r.vehicle_plate ? { plate_number: r.vehicle_plate } : null);
  const driver = r.vehicle?.driver || null;
  // Icon and colour per fact; anything else falls back to the calendar
  const factStyle: Record<string, { icon: LucideIcon; tone: string }> = {
    "من": { icon: CalendarDays, tone: "bg-[#1ABC9C]/12 text-[#0E8C74]" },
    "إلى": { icon: CalendarDays, tone: "bg-[#1ABC9C]/12 text-[#0E8C74]" },
    "أيام التشغيل": { icon: CalendarDays, tone: "bg-[#1ABC9C]/12 text-[#0E8C74]" },
    "تاريخ البدء المفضل": { icon: CalendarDays, tone: "bg-[#1ABC9C]/12 text-[#0E8C74]" },
    "المدة": { icon: Clock, tone: "bg-sky-100 text-sky-700" },
    "سعر المقعد": { icon: Wallet, tone: "bg-[#D96B27]/12 text-[#B4541A]" },
    "السعر المعتمد": { icon: Wallet, tone: "bg-[#D96B27]/12 text-[#B4541A]" },
    "مصروفات الخدمات": { icon: Wallet, tone: "bg-[#D96B27]/12 text-[#B4541A]" },
    "مدينة الانطلاق": { icon: MapPin, tone: "bg-[#003580]/10 text-[#003580]" },
    "سعة الرحلة": { icon: Users, tone: "bg-violet-100 text-violet-700" },
    "السعة / المقاعد المتاحة": { icon: Users, tone: "bg-violet-100 text-violet-700" },
    "عدد المرافقين": { icon: Users, tone: "bg-violet-100 text-violet-700" },
  };
  const tripDays = trip.type === "أسبوعية" && r.start_date && r.end_date
    ? Math.round((new Date(String(r.end_date).slice(0, 10)).getTime() - new Date(String(r.start_date).slice(0, 10)).getTime()) / 86400000) + 1
    : 0;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-2.5">
      <h4 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
        <span className="w-1 h-4 rounded-full bg-gradient-to-b from-[#1ABC9C] to-[#D96B27]" aria-hidden="true" />
        {title}
      </h4>
      {children}
    </div>
  );

  // The tourist's own words and the admin's notes are stored together ("... - ملاحظات الإدارة: ..."); an old
  // notes value that is structured data (the stations as JSON) is not shown
  const { customerNeeds, adminNotes } = splitTripNotes(r.customer_requirements);

  // Header photos: the chosen landmarks' own pictures, cycling; the trip photo when it has no landmark pictures
  const placePhotos: string[] = Array.isArray(r.places) ? r.places.map((pl: any) => pl.place_image).filter(Boolean) : [];
  const fallbackCover = r.photo_1 || r.photo || r.trip_photo_1;
  const headerPhotos: string[] = placePhotos.length > 0 ? placePhotos : fallbackCover ? [fallbackCover] : [];
  const [photoIndex, setPhotoIndex] = useState(0);
  useEffect(() => {
    if (headerPhotos.length < 2 || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setPhotoIndex((i) => (i + 1) % headerPhotos.length), 4000);
    return () => window.clearInterval(timer);
  }, [headerPhotos.length]);
  const shownStations = showAllStations ? stations : stations.slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4 animate-overlay-in" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-white rounded-3xl shadow-xl text-right border border-stone-200 animate-dialog-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: trip photo with title */}
        <div className="relative h-48 sm:h-56 bg-gradient-to-l from-[#1B5A78] to-[#0F172A] overflow-hidden rounded-t-3xl">
          {headerPhotos.map((src, i) => (
            <img
              key={src + i}
              src={src}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              style={{
                opacity: i === photoIndex ? 1 : 0,
                transform: i === photoIndex ? "scale(1.08)" : "scale(1)",
                transition: "opacity 1s ease-in-out, transform 5s ease-out",
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          {headerPhotos.length > 1 && (
            <div className="absolute top-4 right-4 flex gap-1.5">
              {headerPhotos.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPhotoIndex(i)}
                  aria-label={`الصورة ${i + 1}`}
                  className={`h-1.5 rounded-full transition-all ${i === photoIndex ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          )}
          <button onClick={onClose} className="absolute top-3 left-3 p-1.5 rounded-full bg-white/90 hover:bg-white text-stone-700" aria-label="إغلاق">
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-3 right-4 left-4">
            <div className="flex gap-1.5 mb-1.5">
              <Badge tone={trip.type === "خاصة VIP" ? "sun" : "sea"}>{trip.type}</Badge>
              <Badge tone="green">للاطلاع فقط</Badge>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white leading-snug drop-shadow">{trip.trip_name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              {tripDays > 0 && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur text-white text-[11px] font-bold">
                  🗓️ {fmtDate(r.start_date)} ← {fmtDate(r.end_date)} · {tripDays} أيام
                </span>
              )}
              <span className="text-[10px] font-mono text-white/70">{trip.id}</span>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {(customerNeeds.length > 0 || adminNotes.length > 0) && (
            <div className="grid gap-2.5">
              {customerNeeds.length > 0 && (
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#FFF7ED] to-white border border-[#D96B27]/20 p-4 pr-5">
                  <span className="absolute right-0 top-0 bottom-0 w-1.5 bg-[#D96B27]" aria-hidden="true" />
                  <div className="flex items-center gap-2 text-[11px] font-black text-[#B4541A] mb-1.5">
                    <span className="w-6 h-6 rounded-lg bg-[#D96B27]/15 grid place-items-center">💬</span>
                    متطلبات العميل
                  </div>
                  <ul className="space-y-1">
                    {customerNeeds.map((x, i) => (
                      <li key={i} className="text-sm font-bold text-[#0F172A] leading-relaxed">« {x} »</li>
                    ))}
                  </ul>
                </div>
              )}
              {adminNotes.length > 0 && (
                <div className="rounded-2xl bg-[#F4F8FA] border border-[#1B5A78]/10 p-3.5">
                  <div className="text-[11px] font-black text-[#1B5A78] mb-1">🛈 ملاحظات الإدارة</div>
                  {adminNotes.map((x, i) => (
                    <p key={i} className="text-xs text-stone-700 leading-relaxed">{x}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {info.map(([k, v]) => {
              const st = factStyle[k] || { icon: CalendarDays, tone: "bg-stone-100 text-stone-600" };
              const Icon = st.icon;
              return (
                <div key={k} className="p-3 rounded-2xl bg-white border border-stone-200/80 shadow-[0_4px_14px_-8px_rgba(15,23,42,0.25)] flex items-center gap-2.5 min-w-0">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${st.tone}`}>
                    <Icon className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-bold text-stone-500">{k}</div>
                    <div className="text-[13px] font-black text-stone-900 leading-snug truncate" title={v}>{v}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {(vehicle || driver) && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-l from-[#003580] to-[#0F172A] text-white flex flex-wrap items-center gap-3">
              <span className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                <Bus className="w-5 h-5" aria-hidden="true" />
              </span>
              <div className="flex-1 min-w-[140px]">
                <div className="text-[10px] font-bold text-blue-200">المركبة</div>
                <div className="text-sm font-black">
                  {vehicle?.vehicle_type || "مركبة الرحلة"}
                  {vehicle?.plate_number && <span className="font-mono text-blue-200 text-xs"> · {vehicle.plate_number}</span>}
                  {vehicle?.seating_capacity && <span className="text-blue-200 text-xs"> · {vehicle.seating_capacity} مقعد</span>}
                </div>
              </div>
              {driver && (
                <div className="flex items-center gap-2.5 ps-3 sm:border-s border-white/15">
                  <div>
                    <div className="text-[10px] font-bold text-blue-200">السائق</div>
                    <div className="text-sm font-black">{driver.full_name}</div>
                  </div>
                  {driver.phone_number && (
                    <a
                      href={`tel:${driver.phone_number}`}
                      className="w-9 h-9 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center transition-colors"
                      title={driver.phone_number}
                      aria-label="اتصال بالسائق"
                    >
                      <Phone className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {stations.length > 0 && (
            <Section title={`🗺️ برنامج الرحلة والمحطات (${stations.length})`}>
              <ol className="relative space-y-2 before:absolute before:top-2 before:bottom-2 before:right-[13px] before:w-0.5 before:bg-gradient-to-b before:from-[#1ABC9C] before:to-[#D96B27]">
                {shownStations.map((st, i) => (
                  <li key={st.station_id || i} className="relative pr-9">
                    <span className="absolute right-0 top-2 w-7 h-7 rounded-full bg-white border-2 border-[#1ABC9C] text-[#1B5A78] grid place-items-center text-[10px] font-black">
                      {st.station_order || i + 1}
                    </span>
                    <div className="p-3 rounded-xl bg-gradient-to-l from-stone-50 to-white border border-stone-200 text-xs">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-black text-stone-900 leading-snug">
                          {st.day_number ? `اليوم ${st.day_number} · ` : ""}{st.station_title}
                        </span>
                        {st.station_time && (
                          <span className="flex-shrink-0 text-[10px] font-black text-white bg-[#1B5A78] px-2 py-0.5 rounded-full">{st.station_time}</span>
                        )}
                      </div>
                      {st.station_desc && <div className="text-stone-600 mt-1 leading-relaxed">{st.station_desc}</div>}
                    </div>
                  </li>
                ))}
              </ol>
              {stations.length > 2 && (
                <button
                  type="button"
                  onClick={() => setShowAllStations((v) => !v)}
                  className="w-full mt-1 py-2 rounded-xl border border-[#1B5A78]/20 bg-[#1B5A78]/5 hover:bg-[#1B5A78]/10 text-[#1B5A78] text-xs font-black transition cursor-pointer"
                >
                  {showAllStations ? "إخفاء المحطات ▲" : `عرض كل المحطات (${stations.length - 2} أخرى) ▼`}
                </button>
              )}
            </Section>
          )}

          {list(r.places).length > 0 && (
            <Section title="🏛️ المعالم السياحية">
              <div className="flex flex-wrap gap-1.5">
                {list(r.places).map((p) => (
                  <span key={p.place_id} className="px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-[11px] font-bold">
                    {p.place_name || p.city}
                    {p.city && p.place_name && p.city !== p.place_name ? ` — ${p.city}` : ""}
                  </span>
                ))}
              </div>
            </Section>
          )}

        {list(r.hotels).length > 0 && (
          <Section title="🏨 الإقامة">
            <ul className="text-xs text-stone-700 space-y-1">
              {list(r.hotels).map((h) => (
                <li key={h.hotel_id}>• {h.hotel_name} — {h.city}{h.star_rating ? ` (${h.star_rating}★)` : ""}</li>
              ))}
            </ul>
          </Section>
        )}

        {restaurants.length > 0 && (
          <Section title="🍽️ المطاعم والمقاهي">
            <ul className="text-xs text-stone-700 space-y-1">
              {restaurants.map((f) => (
                <li key={f.facility_id}>• {f.facility_name} — {f.city}</li>
              ))}
            </ul>
          </Section>
        )}

        {list(r.offers).length > 0 && (
          <Section title="🏷️ العروض">
            <ul className="text-xs text-stone-700 space-y-1">
              {list(r.offers).map((o, i) => (
                <li key={o.offer_daily_id || o.offer_weekly_id || i}>
                  • {o.offer_title} — خصم {Number(o.percent_discount ?? o.discount_percentage ?? 0)}%
                </li>
              ))}
            </ul>
          </Section>
        )}

        {bookings.length > 0 && (
          <Section title={`👥 السياح المحجوزون (${bookings.length})`}>
            <div className="overflow-x-auto rounded-lg border border-stone-100">
              <table className="w-full text-[11px] text-right">
                <thead className="bg-stone-50 text-stone-600">
                  <tr>
                    <th className="p-2">السائح</th>
                    <th className="p-2">الهاتف</th>
                    <th className="p-2">المقاعد</th>
                    <th className="p-2">الدفع</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bookings.map((b, i) => (
                    <tr key={b.booking_daily_id || b.booking_weekly_id || i}>
                      <td className="p-2 font-bold text-stone-900">{b.tourist?.full_name || b.tourist_id}</td>
                      <td className="p-2 font-mono" dir="ltr">{b.tourist?.phone_number || "—"}</td>
                      <td className="p-2">{b.number_of_seats}</td>
                      <td className="p-2">{b.payment_status || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        )}

        <div className="flex justify-end pt-1">
          <button onClick={onClose} className="px-4 py-1.5 border border-stone-200 rounded-lg text-xs font-bold text-stone-700 hover:bg-stone-50">
            إغلاق
          </button>
        </div>
        </div>
      </div>
    </div>
  );
}
