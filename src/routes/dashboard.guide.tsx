import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Check, Eye, Lock, ShieldCheck, AlertCircle, FileText, Upload, RefreshCw, Trash2, X } from "lucide-react";
import type { TourGuide } from "@/lib/dbSchema";
import {
  getStoredSession,
  apiGetGuideDashboard,
  apiUpdateGuideProfile,
  apiGuideRespondTrip,
  apiToggleAttendance,
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
  rejection_reason?: string;
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
  passengers_names?: string;
};

const REGIONS_LIST = [
  { id: "tripoli", nameAr: "طرابلس وضواحيها", nameEn: "Tripoli & Suburbs" },
  { id: "leptis", nameAr: "لبدة الكبرى والخمس", nameEn: "Leptis Magna & Al-Khoms" },
  { id: "sabratha", nameAr: "صبراتة والساحل الغربي", nameEn: "Sabratha & West Coast" },
  { id: "cyrene", nameAr: "شحات وقورينا (الجبل الأخضر)", nameEn: "Cyrene & Shahhat (Green Mtn)" },
  { id: "benghazi", nameAr: "بنغازي والمنطقة الشرقية", nameEn: "Benghazi & Eastern Region" },
  { id: "ghadames", nameAr: "غدامس والواحات", nameEn: "Ghadames & Oases" },
  { id: "ubari", nameAr: "أوباري وفزان والبحيرات", nameEn: "Ubari, Fezzan & Lakes" },
  { id: "acacus", nameAr: "جبال تدرارت أكاكوس وغات", nameEn: "Tadrart Acacus & Ghat" },
  { id: "sousa", nameAr: "سوسة وأبولونيا الأثرية", nameEn: "Sousa & Apollonia" },
  { id: "tobruk", nameAr: "طبرق والمعالم التاريخية", nameEn: "Tobruk & Historic Sites" },
];

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

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "assigned_trips", label: isAr ? "الرحلات المسندة والقبول" : "Assigned Tours", icon: "🧭" },
    { id: "active_tourists", label: isAr ? "كشف حضور سياح الرحلة" : "Active Manifest", icon: "☑️" },
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
    };
  });

  const [previewCertificateModal, setPreviewCertificateModal] = useState(false);
  const isVerified = guideInfo.verification_status === "موثق";

  // Real Assigned Trips (Empty until actually assigned in DelniDB)
  const [assignedTrips, setAssignedTrips] = useState<AssignedTrip[]>([]);

  // Real Active Trip Tourists (Empty until actual bookings in DelniDB)
  const [tourists, setTourists] = useState<TouristManifestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Live Data from DelniDB on mount
  useEffect(() => {
    async function loadGuideData() {
      setIsLoading(true);
      const session = getStoredSession();
      const lic = session.user?.license_number || session.user?.email;
      if (!lic) {
        setIsLoading(false);
        return;
      }

      const data = await apiGetGuideDashboard(lic);
      if (data && data.guide) {
        const g = data.guide;
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
        });

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
              seats_booked: d.bookings ? d.bookings.length : 0,
              status: "مقبولة",
              is_active_now: Boolean(d.is_active),
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
              time_or_duration: "6 أيام",
              tourist_group_name: w.trip_title || w.title || "رحلة أسبوعية",
              seats_booked: w.bookings ? w.bookings.length : 0,
              status: "مقبولة",
              is_active_now: Boolean(w.is_active),
            });
          });
        }
        if (data.private_trips && Array.isArray(data.private_trips)) {
          data.private_trips.forEach((p: any) => {
            realTrips.push({
              id: p.private_trip_id || `PT-${p.id}`,
              trip_name: p.customer_description || "رحلة خاصة VIP",
              type: "خاصة VIP",
              date: p.preferred_start_date || "تاريخ مفضل",
              time_or_duration: `${p.duration_days || 1} أيام`,
              tourist_group_name: p.customer_name || "عميل VIP",
              seats_booked: (Number(p.number_of_companions) || 0) + 1,
              status: p.status_order === "مؤكدة" ? "مقبولة" : "بانتظار القبول",
              is_active_now: false,
            });
          });
        }
        setAssignedTrips(realTrips);

        // Map Real Tourist Manifest from bookings in DelniDB
        const realTourists: TouristManifestItem[] = [];
        if (data.daily_trips && Array.isArray(data.daily_trips)) {
          data.daily_trips.forEach((d: any) => {
            if (d.bookings && Array.isArray(d.bookings)) {
              d.bookings.forEach((b: any) => {
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
                  passengers_names: b.passengers_names || b.notes || "",
                });
              });
            }
          });
        }
        if (data.weekly_trips && Array.isArray(data.weekly_trips)) {
          data.weekly_trips.forEach((w: any) => {
            if (w.bookings && Array.isArray(w.bookings)) {
              w.bookings.forEach((b: any) => {
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
                  passengers_names: b.passengers_names || b.notes || "",
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
  }, []);

  const [rejectionModalTrip, setRejectionModalTrip] = useState<AssignedTrip | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const activeTrip = assignedTrips.find((t) => t.is_active_now);
  const activeTripTourists = tourists.filter((t) => activeTrip && t.trip_name === activeTrip.trip_name);
  const attendedCount = activeTripTourists.filter((t) => t.attended).reduce((acc, curr) => acc + curr.seats_count, 0);

  const selectedRegions: string[] = (() => {
    try {
      return guideInfo.operating_regions ? JSON.parse(guideInfo.operating_regions) : [];
    } catch {
      return [];
    }
  })();

  const selectedDays: string[] = (() => {
    try {
      return guideInfo.working_days ? JSON.parse(guideInfo.working_days) : [];
    } catch {
      return [];
    }
  })();

  const handleTripResponse = async (tripId: string, status: "مقبولة" | "مرفوضة", reason?: string) => {
    try {
      await apiGuideRespondTrip(guideInfo.license_number, {
        trip_id: tripId,
        status,
        rejection_reason: reason,
      });
    } catch (err) {
      console.error(err);
    }
    setAssignedTrips(assignedTrips.map((t) => (t.id === tripId ? { ...t, status, rejection_reason: reason } : t)));
    setRejectionModalTrip(null);
    setRejectionReasonInput("");
  };

  const handleToggleAttendance = async (bookingId: string) => {
    const current = tourists.find((t) => t.booking_id === bookingId);
    if (!current) return;
    const newAttended = !current.attended;
    const type = bookingId.startsWith("BK-D") ? "daily" : "weekly";
    const rawBookingId = bookingId.replace(/^BK-[DW]-/, "");
    try {
      await apiToggleAttendance({ type, booking_id: rawBookingId, attended: newAttended });
    } catch (err) {
      console.error(err);
    }
    setTourists(tourists.map((t) => (t.booking_id === bookingId ? { ...t, attended: newAttended } : t)));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setGuideInfo({
            ...guideInfo,
            digital_certificate_file: ev.target.result as string,
            certificate_name: file.name,
          });
          alert("تم تحميل الوثيقة وتجهيز المعاينة بنجاح ✓ انقر على 'معاينة الوثيقة' للتأكد منها، ثم احفظ التعديلات في أسفل الصفحة.");
        }
      };
      reader.readAsDataURL(file);
    }
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

    try {
      const res = await apiUpdateGuideProfile(guideInfo.license_number, guideInfo);
      if (res && res.status === "success") {
        alert("تم حفظ التعديلات وتحديث ملفك في قاعدة البيانات DelniDB بنجاح ✓");
        const session = getStoredSession();
        if (session.user) {
          localStorage.setItem("dalni_user", JSON.stringify({ ...session.user, ...guideInfo }));
        }
      } else {
        alert(res?.message || "تم حفظ البيانات بنجاح");
      }
    } catch {
      alert("تم حفظ البيانات محلياً");
    }
  };

  return (
    <DashboardShell
      role="guide"
      roleLabel="مرشد سياحي معتمد"
      userName={guideInfo.full_name}
      nav={nav}
      active={active}
      onNavigate={setActive}
    >
      {/* Calm, Eye-Friendly Executive Welcome Banner */}
      <div className="rounded-2xl p-5 md:p-6 bg-[#0B1727] text-white border border-[#162942] shadow-xs mb-6 relative overflow-hidden text-right">
        <div className="absolute top-0 left-0 w-80 h-80 bg-[#1B5A78]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-wrap items-center gap-4 justify-between">
          <div>
            <div className="text-xs text-stone-400 font-medium">مرحباً بك 👋</div>
            <h1 className="text-xl md:text-2xl font-bold mt-1 text-white tracking-tight">{guideInfo.full_name}</h1>
            <p className="mt-1 text-xs text-stone-300 font-medium">
              ترخيص المزاولة:{" "}
              <span className="font-mono text-amber-300 font-bold">{guideInfo.license_number || "قيد المراجعة"}</span> · إجمالي
              الجولات المنفذة: <span className="text-amber-300 font-bold">{guideInfo.total_tours_completed || 0}</span> رحلة
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-md font-medium border border-white/10">
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
                <span className="text-[11px] bg-white/10 text-stone-200 px-2.5 py-0.5 rounded-md font-medium border border-white/10">
                  📍 {guideInfo.primaryRegion}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone={guideInfo.verification_status === "موثق" ? "green" : "sun"}>{guideInfo.verification_status}</Badge>
            <Badge tone="sea">📜 {guideInfo.years_of_experience || 0} سنوات خبرة</Badge>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {active === "overview" && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
            <StatCard label="الرحلة النشطة الحالية" value={activeTrip ? activeTrip.trip_name : "لا يوجد رحلة حالياً"} icon="🧭" tone="sea" />
            <StatCard label="الرحلات بانتظار القبول" value={assignedTrips.filter((t) => t.status === "بانتظار القبول").length} icon="📥" tone="sun" />
            <StatCard label="أجر اليوم للرحلات الخاصة" value={guideInfo.price_per_day ? `${guideInfo.price_per_day} د.ل / يوم` : "غير محدد"} icon="💰" tone="green" />
            <StatCard label="إجمالي الجولات المكتملة" value={`${guideInfo.total_tours_completed || 0} جولة`} icon="🏆" tone="clay" />
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

              <SectionCard title="طلبات الرحلات المسندة حديثاً من الإدارة">
                {assignedTrips.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-stone-200 text-center space-y-1.5 bg-stone-50/50">
                    <div className="text-2xl">📭</div>
                    <div className="font-bold text-stone-800 text-xs">لا توجد رحلات مسندة إليك حالياً من الإدارة</div>
                    <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                      عندما تقوم إدارة المنصة بإسناد رحلة جديدة لك، ستظهر تفاصيلها هنا فوراً لتتمكن من مراجعتها وقبولها ومباشرة الإشراف.
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
                        {t.status === "بانتظار القبول" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleTripResponse(t.id, "مقبولة")}
                              className="px-3.5 py-1.5 bg-gradient-sea text-white rounded-lg text-xs font-bold shadow-2xs"
                            >
                              قبول الرحلة
                            </button>
                            <button
                              onClick={() => setRejectionModalTrip(t)}
                              className="px-3 py-1.5 border border-stone-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold"
                            >
                              اعتذار
                            </button>
                          </div>
                        )}
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
                  <p className="text-stone-600 text-[11px]">{guideInfo.certificate || "لا يوجد وصف إضافي مسجل للترخيص"}</p>

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
        <SectionCard title="إدارة قبول ورفض الرحلات المسندة من الأدمن">
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
                  {t.rejection_reason && (
                    <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      سبب الاعتذار: {t.rejection_reason}
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                    {t.is_active_now && (
                      <button onClick={() => setActive("active_tourists")} className="text-primary text-xs font-bold hover:underline">
                        تأكيد وتعداد حضور سياح هذه الرحلة النشطة الآن ←
                      </button>
                    )}
                    {t.status === "بانتظار القبول" && (
                      <div className="flex gap-2 mr-auto">
                        <button
                          onClick={() => handleTripResponse(t.id, "مقبولة")}
                          className="px-4 py-1.5 bg-gradient-sea text-white rounded-lg text-xs font-bold shadow-2xs"
                        >
                          قبول ومباشرة الإشراف
                        </button>
                        <button
                          onClick={() => setRejectionModalTrip(t)}
                          className="px-3 py-1.5 border border-stone-200 text-red-600 hover:bg-red-50 rounded-lg text-xs font-bold"
                        >
                          اعتذار
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
                  <p className="text-[11px] text-emerald-800 mt-0.5">⏱️ الموعد: {activeTrip.time_or_duration} · يرجى التحقق من صعود السياح للحافلة وتأكيد حضورهم.</p>
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
                        <th className="p-2.5">أسماء المرافقين</th>
                        <th className="p-2.5">حالة الدفع</th>
                        <th className="p-2.5">إجراء الحضور</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {activeTripTourists.map((tr) => (
                        <tr key={tr.booking_id} className={tr.attended ? "bg-emerald-50/30" : ""}>
                          <td className="p-2.5 font-mono text-[11px] font-bold text-stone-600">{tr.booking_id}</td>
                          <td className="p-2.5 font-bold text-stone-900">{tr.tourist_name}</td>
                          <td className="p-2.5 font-mono text-stone-600 text-[11px]" dir="ltr">{tr.phone_number}</td>
                          <td className="p-2.5 font-bold text-[#1B5A78]">{tr.seats_count} مقاعد</td>
                          <td className="p-2.5 text-stone-500 text-[11px]">{tr.passengers_names || "-"}</td>
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
                            <button
                              onClick={() => handleToggleAttendance(tr.booking_id)}
                              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition ${
                                tr.attended
                                  ? "bg-emerald-600 text-white shadow-2xs"
                                  : "bg-stone-100 text-stone-700 hover:bg-emerald-50 hover:text-emerald-700"
                              }`}
                            >
                              {tr.attended ? "✓ حاضر" : "تسجيل الحضور"}
                            </button>
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
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="رقم الهاتف المحمول"
                  value={guideInfo.phone_number}
                  onChange={(v) => setGuideInfo({ ...guideInfo, phone_number: v })}
                  placeholder="0912345678"
                />
                <Field
                  label="المسمى المهني واللقب"
                  value={guideInfo.title || ""}
                  onChange={(v) => setGuideInfo({ ...guideInfo, title: v })}
                  placeholder="مثال: خبير الآثار الرومانية والتراث"
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

            {/* Section 4: Operating Regions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-stone-700">مناطق ووجهات العمل الرئيسية:</label>
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = selectedRegions.length === REGIONS_LIST.length;
                    setGuideInfo({ ...guideInfo, operating_regions: JSON.stringify(allSelected ? [] : REGIONS_LIST.map((r) => r.id)) });
                  }}
                  className="text-[11px] font-bold text-[#1B5A78] hover:underline cursor-pointer"
                >
                  {selectedRegions.length === REGIONS_LIST.length ? "✕ إلغاء تحديد الكل" : "✓ تحديد كافة المناطق"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-stone-50/70 rounded-xl border border-stone-200 max-h-44 overflow-y-auto">
                {REGIONS_LIST.map((reg) => {
                  const isChecked = selectedRegions.includes(reg.id);
                  return (
                    <div
                      key={reg.id}
                      onClick={() => {
                        const next = isChecked ? selectedRegions.filter((r) => r !== reg.id) : [...selectedRegions, reg.id];
                        setGuideInfo({ ...guideInfo, operating_regions: JSON.stringify(next) });
                      }}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-right transition cursor-pointer ${
                        isChecked ? "border-[#1B5A78] bg-white text-[#0B132B] font-bold shadow-2xs" : "border-stone-200 bg-white/70 text-stone-500"
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 ${isChecked ? "text-[#1B5A78]" : "text-stone-400"}`} />
                      <span className="text-xs flex-1 truncate">{reg.nameAr}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#1B5A78]" />}
                    </div>
                  );
                })}
              </div>
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

            {/* Section 6: Certificate Notes */}
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1 block">بيانات الشهادة والترخيص:</label>
              <textarea
                value={guideInfo.certificate}
                onChange={(e) => setGuideInfo({ ...guideInfo, certificate: e.target.value })}
                rows={2}
                placeholder="تفاصيل جهة الإصدار وتاريخ الصلاحية..."
                className="w-full p-2.5 rounded-xl border border-stone-200 bg-white text-xs font-medium text-stone-800 text-right outline-none focus:border-[#1B5A78]"
              />
            </div>

            {/* Section 7: Dedicated Certificate Preview & Upload Widget */}
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

            {/* Section 8: Bio */}
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
              <span>حفظ وتحديث الملف الشخصي في قاعدة البيانات ✓</span>
            </button>
          </form>
        </SectionCard>
      )}

      {/* Certificate Lightbox Inspection Modal */}
      {previewCertificateModal && guideInfo.digital_certificate_file && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl border border-stone-200 text-right">
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

      {/* Rejection Modal */}
      {rejectionModalTrip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs grid place-items-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl p-5 space-y-3.5 shadow-xl text-right border border-stone-200">
            <h3 className="text-sm font-bold text-stone-900">اعتذار عن رحلة: {rejectionModalTrip.trip_name}</h3>
            <div>
              <label className="text-xs font-semibold text-stone-700 mb-1 block">سبب الاعتذار أو عدم الجاهزية:</label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="مثال: تعارض مع موعد رحلة أخرى..."
                rows={3}
                className="w-full p-2.5 rounded-xl border border-stone-200 text-xs font-medium text-right outline-none focus:border-[#1B5A78]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setRejectionModalTrip(null)}
                className="px-3.5 py-1.5 border border-stone-200 rounded-lg text-xs font-bold text-stone-600 cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleTripResponse(rejectionModalTrip.id, "مرفوضة", rejectionReasonInput || "تعارض بالمواعيد")}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
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
}: {
  label: string;
  type?: string;
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  badge?: string;
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
        className={`w-full h-10 px-3 rounded-xl border text-right outline-none text-xs sm:text-sm font-medium transition ${
          disabled
            ? "bg-stone-100/80 border-stone-200 text-stone-500 cursor-not-allowed select-none"
            : "bg-white border-stone-200 text-stone-800 hover:border-stone-300 focus:border-[#1B5A78] focus:ring-2 focus:ring-[#1B5A78]/10"
        }`}
      />
    </div>
  );
}
