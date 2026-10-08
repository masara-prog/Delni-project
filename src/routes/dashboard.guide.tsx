import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Check } from "lucide-react";
import type { TourGuide } from "@/lib/dbSchema";
import { getStoredSession } from "@/lib/api";

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
  const isAr = language === 'ar';
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const session = getStoredSession();
    if (!session.token || (session.role !== "guide" && session.role !== "admin")) {
      navigate({ to: "/auth/login" });
    }
  }, [navigate]);

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "assigned_trips", label: isAr ? "الرحلات المسندة والقبول" : "Assigned Tours", icon: "🧭", badge: 2 },
    { id: "active_tourists", label: isAr ? "تأكيد حضور سياح الرحلة النشطة" : "Active Tourist Manifest", icon: "☑️" },
    { id: "profile", label: isAr ? "الملف والشهادات الرقمية" : "Profile & Certificates", icon: "📄" },
  ];

  // Guide Profile Details according to DelniDB: tour_guides table
  const [guideInfo, setGuideInfo] = useState<TourGuide>(() => {
    const session = getStoredSession();
    if (session.user && session.role === "guide") {
      const u = session.user;
      return {
        license_number: u.license_number || "G-9901",
        full_name: u.full_name || u.name || "سالم القذافي",
        phone_number: u.phone_number || "0917778888",
        years_of_experience: u.years_of_experience || 7,
        certificate: u.certificate || "ترخيص وزارة السياحة والآثار رقم 4421",
        bio: u.bio || "مرشد سياحي معتمد ومحب لاستكشاف معالم ليبيا التاريخية والطبيعية.",
        speaks_english: u.speaks_english ?? true,
        speaks_french: u.speaks_french ?? false,
        speaks_italian: u.speaks_italian ?? true,
        verification_status: u.verification_status || "موثق",
        email: u.email || "salem@dalni.ly",
        gender: u.gender || "male",
        working_days: typeof u.working_days === 'string' ? u.working_days : JSON.stringify(["sat", "sun", "mon", "tue", "wed", "thu"]),
        operating_regions: typeof u.operating_regions === 'string' ? u.operating_regions : JSON.stringify(["tripoli", "leptis", "sabratha"]),
        primaryRegion: u.primaryRegion || "طرابلس والساحل الغربي",
        price_per_day: u.price_per_day || 150,
        avatar: u.avatar || "/assets/ai_desert.jpg",
        title: u.title || "خبير الإرشاد الأثري والصحراوي",
        specialties: u.specialties || "آثار رومانية، سفاري الواحات، جولات تاريخية",
        total_tours_completed: u.total_tours_completed || 48,
        digital_certificate_file: u.digital_certificate_file || "https://example.com/certificates/salem_license.pdf",
      };
    }
    return {
      license_number: "G-9901",
      full_name: "سالم القذافي",
      phone_number: "0917778888",
      years_of_experience: 7,
      certificate: "ترخيص وزارة السياحة والآثار رقم 4421، شهادة إسعات أولية",
      bio: "مرشد سياحي معتمد ومحب لاستكشاف معالم ليبيا التاريخية والطبيعية.",
      speaks_english: true,
      speaks_french: false,
      speaks_italian: true,
      verification_status: "موثق",
      email: "salem@dalni.ly",
      gender: "male",
      working_days: JSON.stringify(["sat", "sun", "mon", "tue", "wed", "thu"]),
      operating_regions: JSON.stringify(["tripoli", "leptis", "sabratha"]),
      primaryRegion: "طرابلس والساحل الغربي",
      price_per_day: 150,
      avatar: "/assets/ai_desert.jpg",
      title: "خبير الإرشاد الأثري والصحراوي",
      specialties: "آثار رومانية، سفاري الواحات، جولات تاريخية",
      total_tours_completed: 48,
      digital_certificate_file: "https://example.com/certificates/salem_license.pdf",
    };
  });

  useEffect(() => {
    const session = getStoredSession();
    if (session.user && (session.role === "guide" || session.user.license_number)) {
      const u = session.user;
      setGuideInfo(prev => ({
        ...prev,
        license_number: u.license_number || prev.license_number,
        full_name: u.full_name || u.name || prev.full_name,
        phone_number: u.phone_number || prev.phone_number,
        email: u.email || prev.email,
        bio: u.bio || prev.bio,
        certificate: u.certificate || prev.certificate,
        verification_status: u.verification_status || prev.verification_status,
      }));
    }
  }, []);

  // Assigned Trips State (DelniDB: daily_trips, weekly_trips, private_trips)
  const [assignedTrips, setAssignedTrips] = useState<AssignedTrip[]>([
    { id: "DT-101", trip_name: "رحلة لبدة الكبرى الأثرية", type: "يومية", date: "اليوم (قيد الإجراء)", time_or_duration: "9:00 ص - 3:00 م", tourist_group_name: "عائلة المصراتي والعجيلي", seats_booked: 8, status: "مقبولة", is_active_now: true },
    { id: "WT-201", trip_name: "سفاري بحيرات أوباري والصحراء", type: "أسبوعية", date: "17 أغسطس 2026", time_or_duration: "6 أيام كاملة", tourist_group_name: "حجز جماعي صحراوي", seats_booked: 12, status: "بانتظار القبول", is_active_now: false },
    { id: "PT-501", trip_name: "جولة خاصة للآثار والمدينة القديمة", type: "خاصة VIP", date: "22 أغسطس 2026", time_or_duration: "يومان", tourist_group_name: "وفد إيطالي سياحي", seats_booked: 4, status: "بانتظار القبول", is_active_now: false }
  ]);

  // Active Trip Tourists Manifest & Attendance State (DelniDB: bookings_daily & bookings_weekly)
  const [tourists, setTourists] = useState<TouristManifestItem[]>([
    { booking_id: "BK-D-101", tourist_id: "T-881", tourist_name: "أحمد بن علي المصراتي", phone_number: "0912229988", nationality: "ليبي", seats_count: 4, trip_name: "رحلة لبدة الكبرى الأثرية", payment_status: "cash_at_office", attended: true, passengers_names: "أحمد المصراتي، عائشة المصراتي، يوسف، فاطمة" },
    { booking_id: "BK-D-102", tourist_id: "T-882", tourist_name: "عمر خالد العجيلي", phone_number: "0924441122", nationality: "ليبي", seats_count: 4, trip_name: "رحلة لبدة الكبرى الأثرية", payment_status: "paid", attended: true, passengers_names: "عمر العجيلي، خديجة، كمال، سامي" },
    { booking_id: "BK-W-201", tourist_id: "T-883", tourist_name: "Marco Rossi", phone_number: "+39 340 556677", nationality: "إيطالي", seats_count: 2, trip_name: "جولة خاصة للآثار والمدينة القديمة", payment_status: "paid", attended: false, passengers_names: "Marco Rossi, Laura Rossi" },
    { booking_id: "BK-W-202", tourist_id: "T-884", tourist_name: "Giovanni Bianchi", phone_number: "+39 342 998811", nationality: "إيطالي", seats_count: 2, trip_name: "جولة خاصة للآثار والمدينة القديمة", payment_status: "paid", attended: false, passengers_names: "Giovanni Bianchi, Sofia Bianchi" }
  ]);

  const [rejectionModalTrip, setRejectionModalTrip] = useState<AssignedTrip | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const activeTrip = assignedTrips.find(t => t.is_active_now);
  const activeTripTourists = tourists.filter(t => activeTrip && t.trip_name === activeTrip.trip_name);
  const attendedCount = activeTripTourists.filter(t => t.attended).reduce((acc, curr) => acc + curr.seats_count, 0);

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

  const handleTripResponse = (tripId: string, status: "مقبولة" | "مرفوضة", reason?: string) => {
    setAssignedTrips(assignedTrips.map(t => t.id === tripId ? { ...t, status, rejection_reason: reason } : t));
    setRejectionModalTrip(null);
    setRejectionReasonInput("");
  };

  const handleToggleAttendance = (bookingId: string) => {
    setTourists(tourists.map(t => t.booking_id === bookingId ? { ...t, attended: !t.attended } : t));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setGuideInfo({ ...guideInfo, digital_certificate_file: ev.target.result as string });
          alert("تم تحميل نسخة الملف الرقمي للشهادة بنجاح وسيتم إرسالها للأدمن ✓");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideInfo.phone_number.match(/^09\d{8}$/)) {
      alert("الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)");
      return;
    }
    if (!guideInfo.operating_regions || guideInfo.operating_regions.length === 0) {
      alert("الرجاء اختيار منطقة عمل واحدة على الأقل.");
      return;
    }
    if (!guideInfo.working_days || guideInfo.working_days.length === 0) {
      alert("الرجاء اختيار يوم عمل واحد على الأقل.");
      return;
    }
    if (!guideInfo.full_name || !guideInfo.license_number) {
      alert("الرجاء تعبئة كافة الحقول المطلوبة (الاسم الكامل، رقم الترخيص).");
      return;
    }
    alert("تم حفظ التعديلات وإرسال البيانات بنجاح!");
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guideInfo.phone_number.match(/^09\d{8}$/)) {
      alert("الرجاء إدخال رقم هاتف ليبي صحيح (مثال: 0912345678)");
      return;
    }
    if (!guideInfo.operating_regions || guideInfo.operating_regions.length === 0) {
      alert("الرجاء اختيار منطقة عمل واحدة على الأقل.");
      return;
    }
    if (!guideInfo.working_days || guideInfo.working_days.length === 0) {
      alert("الرجاء اختيار يوم عمل واحد على الأقل.");
      return;
    }
    if (!guideInfo.full_name || !guideInfo.license_number) {
      alert("الرجاء تعبئة كافة الحقول المطلوبة (الاسم الكامل، رقم الترخيص).");
      return;
    }
    alert("تم حفظ التعديلات وتحديث ملفك الشخصي بنجاح ✓");
  };

  return (
    <DashboardShell role="guide" roleLabel="مرشد سياحي معتمد" userName={guideInfo.full_name} nav={nav} active={active} onNavigate={setActive}>
      {active === "overview" && (
        <>
          <div className="rounded-3xl p-6 md:p-8 bg-gradient-sun text-gold-foreground shadow-gold mb-6 relative overflow-hidden text-right">
            <div className="relative flex flex-wrap items-center gap-4 justify-between">
              <div>
                <div className="text-sm opacity-80">أهلاً وسهلاً 👋</div>
                <h1 className="text-2xl md:text-3xl font-black mt-1">{guideInfo.full_name}</h1>
                <p className="mt-1 text-sm opacity-90 font-semibold">
                  ترخيص المزاولة: {guideInfo.license_number} · إجمالي الجولات المنفذة: {guideInfo.total_tours_completed} رحلة
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-xs bg-black/15 px-2.5 py-0.5 rounded-full font-bold">
                    🗣️ اللغات: {[guideInfo.speaks_english && "الإنجليزية", guideInfo.speaks_french && "الفرنسية", guideInfo.speaks_italian && "الإيطالية"].filter(Boolean).join("، ") || "العربية فقط"}
                  </span>
                  <span className="text-xs bg-black/15 px-2.5 py-0.5 rounded-full font-bold">
                    📍 المنطقة الأساسية: {guideInfo.primaryRegion}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone={guideInfo.verification_status === "موثق" ? "green" : "sun"}>{guideInfo.verification_status}</Badge>
                <Badge tone="sea">📜 {guideInfo.years_of_experience} سنوات خبرة</Badge>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="الرحلة النشطة الحالية" value={activeTrip ? activeTrip.trip_name : "لا يوجد رحلة حالياً"} icon="🧭" tone="sea" />
            <StatCard label="الرحلات بانتظار القبول" value={assignedTrips.filter(t => t.status === "بانتظار القبول").length} icon="📥" tone="sun" />
            <StatCard label="أجر اليوم الواحد للرحلات الخاصة" value={`${guideInfo.price_per_day || 150} د.ل / يوم`} icon="💰" tone="green" />
            <StatCard label="إجمالي الجولات المكتملة" value={`${guideInfo.total_tours_completed} جولة`} icon="🏆" tone="clay" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 text-right">
            <div className="lg:col-span-2 space-y-6">
              {activeTrip && (
                <SectionCard title="تأكيد حضور سياح الرحلة النشطة قيد الإجراء الآن">
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-black text-foreground text-base">{activeTrip.trip_name}</h3>
                        <div className="text-xs text-muted-foreground">⏱️ الموعد: {activeTrip.time_or_duration} · 👥 المقاعد المحجوزة: {activeTrip.seats_booked}</div>
                      </div>
                      <Badge tone="green">الرحلة قيد الإجراء 🟢</Badge>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold p-2.5 rounded-xl bg-white border border-border">
                      <span>تعداد الحضور الفعلي:</span>
                      <span className="text-primary font-black text-sm">{attendedCount} من أصل {activeTrip.seats_booked} حاضرون</span>
                    </div>
                    <button onClick={() => setActive("active_tourists")} className="w-full py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow">
                      فتح قائمة تأكيد الحضور التفصيلية ☑️
                    </button>
                  </div>
                </SectionCard>
              )}

              <SectionCard title="طلبات الرحلات المسندة حديثاً من الإدارة">
                <div className="space-y-3">
                  {assignedTrips.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl border border-border bg-white flex flex-wrap justify-between items-center gap-3 text-right">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-foreground text-base">{t.trip_name}</span>
                          <Badge tone={t.type === "خاصة VIP" ? "sun" : "sea"}>{t.type}</Badge>
                          <Badge tone={t.status === "مقبولة" ? "green" : t.status === "مرفوضة" ? "red" : "sun"}>{t.status}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">🗓️ {t.date} · ⏱️ {t.time_or_duration} · 👥 {t.seats_booked} سياح</div>
                      </div>
                      {t.status === "بانتظار القبول" && (
                        <div className="flex gap-2">
                          <button onClick={() => handleTripResponse(t.id, "مقبولة")} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black">
                            قبول الرحلة
                          </button>
                          <button onClick={() => setRejectionModalTrip(t)} className="px-3 py-2 border border-border text-red-600 rounded-xl text-xs font-black">
                            رفض
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="بيانات الترخيص والوثائق">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs text-right">
                  <div className="font-black text-primary">توثيق وترخيص وزارة السياحة</div>
                  <p className="text-muted-foreground">رقم الترخيص: <span className="font-bold text-foreground">{guideInfo.license_number}</span></p>
                  <p className="text-muted-foreground">{guideInfo.certificate}</p>
                  <button onClick={() => setActive("profile")} className="w-full py-2 bg-white border border-border rounded-lg text-primary font-black">
                    تحديث الملف والشهادات
                  </button>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* Assigned Trips & Acceptance */}
      {active === "assigned_trips" && (
        <SectionCard title="إدارة قبول ورفض الرحلات المسندة من الأدمن">
          <div className="space-y-4 text-right">
            {assignedTrips.map((t) => (
              <div key={t.id} className="p-5 rounded-2xl border border-border bg-white shadow-soft space-y-3">
                <div className="flex flex-wrap justify-between items-start gap-2">
                  <div>
                    <span className="text-xs font-mono font-bold text-muted-foreground">{t.id}</span>
                    <h3 className="font-black text-foreground text-lg">{t.trip_name}</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={t.type === "خاصة VIP" ? "sun" : "sea"}>{t.type}</Badge>
                    <Badge tone={t.status === "مقبولة" ? "green" : t.status === "مرفوضة" ? "red" : "sun"}>{t.status}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-bold text-foreground">
                  <div>🗓️ الموعد: {t.date}</div>
                  <div>⏱️ المدة: {t.time_or_duration}</div>
                  <div>👥 السياح المحجوزون: {t.seats_booked} فرد</div>
                </div>
                {t.rejection_reason && (
                  <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-bold">
                    سبب الاعتذار: {t.rejection_reason}
                  </div>
                )}
                <div className="pt-2 flex justify-between items-center">
                  {t.is_active_now && (
                    <button onClick={() => setActive("active_tourists")} className="text-primary text-xs font-black hover:underline">
                      تأكيد وتعداد حضور سياح هذه الرحلة النشطة الآن ←
                    </button>
                  )}
                  {t.status === "بانتظار القبول" && (
                    <div className="flex gap-2 mr-auto">
                      <button onClick={() => handleTripResponse(t.id, "مقبولة")} className="px-5 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow">
                        قبول ومباشرة الإشراف
                      </button>
                      <button onClick={() => setRejectionModalTrip(t)} className="px-4 py-2 border border-red-200 text-red-600 rounded-xl text-xs font-black">
                        اعتذار ورفض
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ACTIVE TRIP TOURISTS & ATTENDANCE CHECK-IN (DelniDB: bookings_daily / bookings_weekly) */}
      {active === "active_tourists" && (
        <SectionCard title={`كشف حضور سياح الرحلة النشطة (${activeTrip ? activeTrip.trip_name : "لا يوجد رحلة جارية"})`}>
          {activeTrip ? (
            <div className="space-y-4 text-right">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <h4 className="font-black text-emerald-950 text-sm">الرحلة الحالية: {activeTrip.trip_name}</h4>
                  <p className="text-xs text-emerald-800 mt-0.5">⏱️ الموعد: {activeTrip.time_or_duration} · يرجى التحقق من صعود كافة السياح للحافلة وتأكيد حضورهم.</p>
                </div>
                <div className="text-left">
                  <div className="text-2xl font-black text-emerald-700">{attendedCount} / {activeTrip.seats_booked}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">سائح تم تسجيل حضورهم</div>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-xs text-right">
                  <thead className="bg-muted/60 text-foreground font-black border-b border-border">
                    <tr>
                      <th className="p-3">رقم الحجز</th>
                      <th className="p-3">اسم السائح</th>
                      <th className="p-3">رقم الهاتف</th>
                      <th className="p-3">عدد المقاعد</th>
                      <th className="p-3">أسماء المرافقين</th>
                      <th className="p-3">حالة الدفع</th>
                      <th className="p-3">إجراء الحضور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {activeTripTourists.map((tr) => (
                      <tr key={tr.booking_id} className={tr.attended ? "bg-emerald-50/40" : ""}>
                        <td className="p-3 font-mono font-bold">{tr.booking_id}</td>
                        <td className="p-3 font-black text-foreground">{tr.tourist_name}</td>
                        <td className="p-3 font-mono font-bold text-muted-foreground" dir="ltr">{tr.phone_number}</td>
                        <td className="p-3 font-black text-primary">{tr.seats_count} مقاعد</td>
                        <td className="p-3 text-muted-foreground">{tr.passengers_names || "-"}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${tr.payment_status === "paid" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                            {tr.payment_status === "paid" ? "مدفوع" : "نقداً بالفرع"}
                          </span>
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => handleToggleAttendance(tr.booking_id)}
                            className={`px-3 py-1.5 rounded-xl font-black text-xs transition ${
                              tr.attended
                                ? "bg-emerald-600 text-white shadow-soft"
                                : "bg-muted text-foreground hover:bg-emerald-100"
                            }`}
                          >
                            {tr.attended ? "☑️ تم تأكيد الحضور" : "❌ تسجيل حضور السائح"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد رحلة نشطة قيد الإجراء حالياً. يتم إظهار قائمة السياح وتعداد الحضور فقط للرحلات الجارية الآن.
            </div>
          )}
        </SectionCard>
      )}

      {/* Guide Profile & Credentials (DelniDB: tour_guides) */}
      {active === "profile" && (
        <SectionCard title="إدخال واستكمال بيانات المرشد ورفع ملفات الشهادات الرقمية (DelniDB: tour_guides)">
          <form className="max-w-2xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <div className="grid grid-cols-2 gap-3">
              <Field label="الاسم الكامل للمرشد (full_name)" value={guideInfo.full_name} onChange={(v) => setGuideInfo({ ...guideInfo, full_name: v })} />
              <Field label="المسمى الوظيفي واللقب (title)" value={guideInfo.title || ""} onChange={(v) => setGuideInfo({ ...guideInfo, title: v })} />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">الجنس (gender):</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGuideInfo({ ...guideInfo, gender: "male" })}
                  className={`p-3 rounded-2xl border text-right transition flex items-center gap-3 cursor-pointer ${
                    guideInfo.gender === "male"
                      ? "border-[#D96B27] bg-amber-50/50 shadow-soft ring-2 ring-[#D96B27]/20"
                      : "border-border bg-white"
                  }`}
                >
                  <span className="text-2xl">👨</span>
                  <div>
                    <div className="font-black text-xs text-foreground">ذكر</div>
                    <span className="text-[10px] text-muted-foreground">مرشد سياحي</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setGuideInfo({ ...guideInfo, gender: "female" })}
                  className={`p-3 rounded-2xl border text-right transition flex items-center gap-3 cursor-pointer ${
                    guideInfo.gender === "female"
                      ? "border-[#D96B27] bg-amber-50/50 shadow-soft ring-2 ring-[#D96B27]/20"
                      : "border-border bg-white"
                  }`}
                >
                  <span className="text-2xl">👩</span>
                  <div>
                    <div className="font-black text-xs text-foreground">أنثى</div>
                    <span className="text-[10px] text-muted-foreground">مرشدة سياحية</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الهاتف (phone_number)" value={guideInfo.phone_number} onChange={(v) => setGuideInfo({ ...guideInfo, phone_number: v })} />
              <Field label="البريد الإلكتروني (email)" type="email" value={guideInfo.email} onChange={(v) => setGuideInfo({ ...guideInfo, email: v })} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Field label="سنوات الخبرة (years_of_experience)" type="number" value={String(guideInfo.years_of_experience)} onChange={(v) => setGuideInfo({ ...guideInfo, years_of_experience: Number(v) })} />
              <Field label="رقم ترخيص الإرشاد (license_number)" value={guideInfo.license_number} onChange={(v) => setGuideInfo({ ...guideInfo, license_number: v })} />
              <Field label="سعر اليوم بالدينار (price_per_day)" type="number" value={String(guideInfo.price_per_day || 150)} onChange={(v) => setGuideInfo({ ...guideInfo, price_per_day: Number(v) })} />
            </div>

            {/* Languages (BIT columns in DelniDB) */}
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">اللغات الأجنبية المتقنة (Languages - BIT Flags):</label>
              <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAFAF8] rounded-xl border border-border">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={guideInfo.speaks_english}
                    onChange={(e) => setGuideInfo({ ...guideInfo, speaks_english: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>الإنجليزية (speaks_english)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={guideInfo.speaks_french}
                    onChange={(e) => setGuideInfo({ ...guideInfo, speaks_french: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>الفرنسية (speaks_french)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold">
                  <input
                    type="checkbox"
                    checked={guideInfo.speaks_italian}
                    onChange={(e) => setGuideInfo({ ...guideInfo, speaks_italian: e.target.checked })}
                    className="w-4 h-4 rounded text-primary"
                  />
                  <span>الإيطالية (speaks_italian)</span>
                </label>
              </div>
            </div>

            {/* Operating Regions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-foreground">مناطق ووجهات العمل (operating_regions):</label>
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = selectedRegions.length === REGIONS_LIST.length;
                    setGuideInfo({ ...guideInfo, operating_regions: JSON.stringify(allSelected ? [] : REGIONS_LIST.map((r) => r.id)) });
                  }}
                  className="text-xs font-bold text-[#D96B27] hover:underline cursor-pointer"
                >
                  {selectedRegions.length === REGIONS_LIST.length ? "✕ إلغاء تحديد الكل" : "✓ تحديد كافة المناطق"}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAFAF8] rounded-2xl border border-[#E6E1D6] max-h-48 overflow-y-auto">
                {REGIONS_LIST.map((reg) => {
                  const isChecked = selectedRegions.includes(reg.id);
                  return (
                    <div
                      key={reg.id}
                      onClick={() => {
                        const next = isChecked ? selectedRegions.filter((r) => r !== reg.id) : [...selectedRegions, reg.id];
                        setGuideInfo({ ...guideInfo, operating_regions: JSON.stringify(next) });
                      }}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-right transition cursor-pointer ${
                        isChecked ? "border-[#D96B27] bg-white text-[#0B132B]" : "border-border bg-white/70 text-muted-foreground"
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 ${isChecked ? "text-[#D96B27]" : "text-muted-foreground"}`} />
                      <span className="text-xs font-bold flex-1 truncate">{reg.nameAr}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-[#D96B27]" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Working Days */}
            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">أيام العمل المتاحة (working_days):</label>
              <div className="grid grid-cols-7 gap-1 p-2 bg-[#FAFAF8] rounded-2xl border border-border">
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
                      className={`py-2 px-1 rounded-xl border text-center transition ${
                        isChecked ? "bg-gradient-to-br from-[#D96B27] to-[#EA580C] text-white" : "bg-white border-border text-muted-foreground"
                      }`}
                    >
                      <span className="text-[10px] font-black block">{day.nameAr}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">الشهادات والتراخيص (certificate)</label>
              <textarea
                value={guideInfo.certificate}
                onChange={(e) => setGuideInfo({ ...guideInfo, certificate: e.target.value })}
                rows={2}
                className="w-full p-3 rounded-xl border border-border text-sm font-semibold text-right"
              />
            </div>

            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-2">
              <label className="text-xs font-black text-primary block">📜 تحميل نسخ الشهادات الرقمية (digital_certificate_file):</label>
              <p className="text-xs text-muted-foreground">قم بتحميل نسخة رقمية من الشهادة ليتم إرسالها للأدمن لمعاينتها وتوثيق حسابك.</p>
              <div className="flex items-center gap-3 pt-1">
                <label className="px-4 py-2 rounded-xl bg-gradient-sea text-white text-xs font-black cursor-pointer shadow-soft">
                  📁 اختيار ملف الشهادة من جهازك
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleFileUpload} />
                </label>
                {guideInfo.digital_certificate_file && (
                  <span className="text-xs text-emerald-600 font-bold">✓ تم إرفاق ملف الشهادة الرقمية</span>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">النبذة التعريفية (bio)</label>
              <textarea
                value={guideInfo.bio || ""}
                onChange={(e) => setGuideInfo({ ...guideInfo, bio: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl border border-border text-sm font-semibold text-right"
              />
            </div>

            <button type="submit" className="px-6 h-11 bg-gradient-sea text-white font-black text-sm rounded-xl shadow-glow hover:scale-105 transition-transform">
              حفظ وتحديث الملف الشخصي ✓
            </button>
          </form>
        </SectionCard>
      )}

      {/* Rejection Modal */}
      {rejectionModalTrip && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4 shadow-glow text-right">
            <h3 className="text-lg font-black text-foreground">اعتذار عن رحلة: {rejectionModalTrip.trip_name}</h3>
            <div>
              <label className="text-xs font-bold text-foreground mb-1 block">سبب الاعتذار أو عدم الجاهزية</label>
              <textarea
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                placeholder="مثال: تعارض مع موعد رحلة أخرى..."
                rows={3}
                className="w-full p-3 rounded-xl border border-border text-xs font-semibold text-right"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setRejectionModalTrip(null)} className="px-4 py-2 border border-border rounded-xl text-xs font-black">إلغاء</button>
              <button onClick={() => handleTripResponse(rejectionModalTrip.id, "مرفوضة", rejectionReasonInput || "تعارض بالمواعيد")} className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-black">
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-sm font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-11 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-sm font-semibold"
      />
    </div>
  );
}
