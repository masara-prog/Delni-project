import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import { MapPin, User, Check } from "lucide-react";

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

type TouristBooking = {
  booking_id: string;
  tourist_name: string;
  phone_number: string;
  nationality: string;
  seats_count: number;
  trip_name: string;
  attended: boolean;
};

function GuideDashboard() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [active, setActive] = useState("overview");

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "assigned_trips", label: isAr ? "الرحلات المسندة والقبول" : "Assigned Tours", icon: "🧭", badge: 2 },
    { id: "active_tourists", label: isAr ? "تأكيد حضور سياح الرحلة النشطة" : "Active Tourist Manifest", icon: "☑️" },
    { id: "profile", label: isAr ? "الملف والشهادات الرقمية" : "Profile & Certificates", icon: "📄" },
  ];

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

  // Guide Profile Details
  const [guideInfo, setGuideInfo] = useState({
    license_number: "G-9901",
    full_name: "سالم القذافي",
    gender: "male" as "male" | "female",
    phone_number: "0917778888",
    years_of_experience: 7,
    daily_rate: 150,
    operating_regions: ["tripoli", "leptis", "sabratha"] as string[],
    working_days: ["sat", "sun", "mon", "tue", "wed", "thu"] as string[],
    certificate_description: "ترخيص وزارة السياحة والآثار رقم 4421، شهادة إسعافات أولية من الهلال الأحمر",
    digital_certificate_file: "https://example.com/certificates/salem_license.pdf",
    bio: "مرشد سياحي معتمد ومحب لاستكشاف معالم ليبيا التاريخية والطبيعية. متخصص في الجولات الأثرية في لبدة وصبراتة وقورينا، بالإضافة إلى تنظيم رحلات السفاري في أوباري وغدامس.",
    speaks_english: true,
    speaks_french: false,
    speaks_italian: true,
    verification_status: "موثق",
    email: "salem@dalni.ly"
  });

  // Assigned Trips State
  const [assignedTrips, setAssignedTrips] = useState<AssignedTrip[]>([
    { id: "TRP-8801", trip_name: "رحلة لبدة الكبرى الأثرية", type: "يومية", date: "اليوم (قيد الإجراء)", time_or_duration: "9:00 ص - 3:00 م", tourist_group_name: "عائلة المصراتي والعجيلي", seats_booked: 8, status: "مقبولة", is_active_now: true },
    { id: "TRP-8802", trip_name: "سفاري بحيرات أوباري والصحراء", type: "أسبوعية", date: "17 أغسطس 2026", time_or_duration: "6 أيام كاملة", tourist_group_name: "حجز جماعي صحراوي", seats_booked: 12, status: "بانتظار القبول", is_active_now: false },
    { id: "TRP-8803", trip_name: "جولة خاصة للآثار والمدينة القديمة", type: "خاصة VIP", date: "22 أغسطس 2026", time_or_duration: "يومان", tourist_group_name: "وفد إيطالي سياحي", seats_booked: 4, status: "بانتظار القبول", is_active_now: false }
  ]);

  // Active Trip Tourists Manifest & Attendance State
  const [tourists, setTourists] = useState<TouristBooking[]>([
    { booking_id: "BK-1001", tourist_name: "أحمد بن علي المصراتي", phone_number: "0912229988", nationality: "ليبي", seats_count: 4, trip_name: "رحلة لبدة الكبرى الأثرية", attended: true },
    { booking_id: "BK-1002", tourist_name: "عمر خالد العجيلي", phone_number: "0924441122", nationality: "ليبي", seats_count: 4, trip_name: "رحلة لبدة الكبرى الأثرية", attended: true },
    { booking_id: "BK-1003", tourist_name: "Marco Rossi", phone_number: "+39 340 556677", nationality: "إيطالي", seats_count: 2, trip_name: "جولة خاصة للآثار والمدينة القديمة", attended: false },
    { booking_id: "BK-1004", tourist_name: "Giovanni Bianchi", phone_number: "+39 342 998811", nationality: "إيطالي", seats_count: 2, trip_name: "جولة خاصة للآثار والمدينة القديمة", attended: false }
  ]);

  const [rejectionModalTrip, setRejectionModalTrip] = useState<AssignedTrip | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState("");

  const activeTrip = assignedTrips.find(t => t.is_active_now);
  const activeTripTourists = tourists.filter(t => activeTrip && t.trip_name === activeTrip.trip_name);
  const attendedCount = activeTripTourists.filter(t => t.attended).reduce((acc, curr) => acc + curr.seats_count, 0);

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
    if (guideInfo.operating_regions.length === 0) {
      alert("الرجاء اختيار منطقة عمل واحدة على الأقل.");
      return;
    }
    if (guideInfo.working_days.length === 0) {
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
    if (guideInfo.operating_regions.length === 0) {
      alert("الرجاء اختيار منطقة عمل واحدة على الأقل.");
      return;
    }
    if (guideInfo.working_days.length === 0) {
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
                <p className="mt-1 text-sm opacity-90 font-semibold">ترخيص المزاولة: {guideInfo.license_number} · تقييمك 4.9 ⭐</p>
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
            <StatCard label="أجر اليوم الواحد للرحلات الخاصة" value={`${guideInfo.daily_rate || 150} د.ل / يوم`} icon="💰" tone="green" />
            <StatCard label="متوسط تقييم المرشد" value="4.9 ⭐" icon="⭐" tone="clay" />
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
              <SectionCard title="إشعار الملف والترخيص">
                <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-2 text-xs text-right">
                  <div className="font-black text-primary">تحميل الشهادات والترخيص</div>
                  <p className="text-muted-foreground">يقوم المرشد بإدخال بياناته وتأكيد نسخ الملفات الرقمية للشهادات لتصل مباشرة للأدمن للمعاينة والتأكيد.</p>
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

      {/* ACTIVE TRIP TOURISTS & ATTENDANCE CHECK-IN */}
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
                      <th className="p-3">الجنسية</th>
                      <th className="p-3">رقم الهاتف</th>
                      <th className="p-3">عدد المقاعد</th>
                      <th className="p-3">إجراء الحضور</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-white">
                    {activeTripTourists.map((tr) => (
                      <tr key={tr.booking_id} className={tr.attended ? "bg-emerald-50/40" : ""}>
                        <td className="p-3 font-mono font-bold">{tr.booking_id}</td>
                        <td className="p-3 font-black text-foreground">{tr.tourist_name}</td>
                        <td className="p-3 font-bold">{tr.nationality}</td>
                        <td className="p-3 font-mono font-bold text-muted-foreground" dir="ltr">{tr.phone_number}</td>
                        <td className="p-3 font-black text-primary">{tr.seats_count} مقاعد</td>
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

      {/* Guide Profile & Credentials File Upload */}
      {active === "profile" && (
        <SectionCard title="إدخال واستكمال بيانات المرشد ورفع ملفات الشهادات الرقمية للأدمن">
          <form className="max-w-2xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <Field label="الاسم الكامل للمرشد" value={guideInfo.full_name} onChange={(v) => setGuideInfo({ ...guideInfo, full_name: v })} />

            {/* Gender Selection (الجنس) */}
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">جنس المرشد:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGuideInfo({ ...guideInfo, gender: "male" })}
                  className={`group relative p-3 rounded-2xl border text-right transition-all duration-300 flex items-center gap-3 cursor-pointer select-none ${
                    guideInfo.gender === "male"
                      ? "border-[#D96B27] bg-gradient-to-br from-amber-50 via-orange-50/40 to-white shadow-soft ring-2 ring-[#D96B27]/20"
                      : "border-[#E6E1D6] bg-white hover:border-[#D96B27]/40 hover:bg-[#FAFAF8]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 ${
                    guideInfo.gender === "male" ? "bg-gradient-to-br from-[#D96B27] to-[#EA580C] text-white shadow-soft" : "bg-[#F4F1EA] text-[#0B132B]"
                  }`}>
                    👨
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#0B132B]">ذكر</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        guideInfo.gender === "male" ? "border-[#D96B27] bg-[#D96B27] text-white shadow-xs" : "border-[#D0C9B8]"
                      }`}>
                        {guideInfo.gender === "male" && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#526078] block truncate mt-0.5">مرشد سياحي</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGuideInfo({ ...guideInfo, gender: "female" })}
                  className={`group relative p-3 rounded-2xl border text-right transition-all duration-300 flex items-center gap-3 cursor-pointer select-none ${
                    guideInfo.gender === "female"
                      ? "border-[#D96B27] bg-gradient-to-br from-amber-50 via-orange-50/40 to-white shadow-soft ring-2 ring-[#D96B27]/20"
                      : "border-[#E6E1D6] bg-white hover:border-[#D96B27]/40 hover:bg-[#FAFAF8]"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 transition-transform group-hover:scale-110 ${
                    guideInfo.gender === "female" ? "bg-gradient-to-br from-[#D96B27] to-[#EA580C] text-white shadow-soft" : "bg-[#F4F1EA] text-[#0B132B]"
                  }`}>
                    👩
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xs text-[#0B132B]">أنثى</span>
                      <span className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        guideInfo.gender === "female" ? "border-[#D96B27] bg-[#D96B27] text-white shadow-xs" : "border-[#D0C9B8]"
                      }`}>
                        {guideInfo.gender === "female" && <span className="w-1.5 h-1.5 rounded-full bg-white block" />}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#526078] block truncate mt-0.5">مرشدة سياحية</span>
                  </div>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم الهاتف" value={guideInfo.phone_number} onChange={(v) => setGuideInfo({ ...guideInfo, phone_number: v })} />
              <Field label="سنوات الخبرة العملية" type="number" value={String(guideInfo.years_of_experience)} onChange={(v) => setGuideInfo({ ...guideInfo, years_of_experience: Number(v) })} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="رقم ترخيص مزاولة الإرشاد" value={guideInfo.license_number} onChange={(v) => setGuideInfo({ ...guideInfo, license_number: v })} />
              <Field label="أجر الإرشاد لليوم الواحد للرحلات الخاصة (د.ل)" type="number" value={String(guideInfo.daily_rate || 150)} onChange={(v) => setGuideInfo({ ...guideInfo, daily_rate: Number(v) })} />
            </div>

            {/* Operating Regions (مناطق العمل) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-foreground">مناطق ووجهات العمل المرغوبة:</label>
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = guideInfo.operating_regions.length === REGIONS_LIST.length;
                    setGuideInfo({ ...guideInfo, operating_regions: allSelected ? [] : REGIONS_LIST.map((r) => r.id) });
                  }}
                  className="text-xs font-bold text-[#D96B27] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>{guideInfo.operating_regions.length === REGIONS_LIST.length ? "✕ إلغاء تحديد الكل" : "✓ تحديد كافة المناطق"}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2.5 bg-[#FAFAF8] rounded-2xl border border-[#E6E1D6] max-h-48 overflow-y-auto">
                {REGIONS_LIST.map((reg) => {
                  const isChecked = guideInfo.operating_regions.includes(reg.id);
                  return (
                    <div
                      key={reg.id}
                      onClick={() => {
                        const exists = guideInfo.operating_regions.includes(reg.id);
                        setGuideInfo({
                          ...guideInfo,
                          operating_regions: exists
                            ? guideInfo.operating_regions.filter((r) => r !== reg.id)
                            : [...guideInfo.operating_regions, reg.id],
                        });
                      }}
                      className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border text-right transition-all duration-200 cursor-pointer select-none ${
                        isChecked
                          ? "border-[#D96B27] bg-white shadow-xs ring-1 ring-[#D96B27]/30 text-[#0B132B]"
                          : "border-[#E6E1D6]/80 bg-white/70 hover:border-[#D96B27]/40 hover:bg-white text-[#526078]"
                      }`}
                    >
                      <MapPin className={`w-3.5 h-3.5 shrink-0 transition-colors ${isChecked ? "text-[#D96B27]" : "text-[#8C9AA8] group-hover:text-[#D96B27]"}`} />
                      <div className="flex-1 min-w-0">
                        <span className={`text-[11px] font-black block truncate ${isChecked ? "text-[#0B132B]" : "text-[#475569]"}`}>
                          {reg.nameAr}
                        </span>
                      </div>
                      <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                        isChecked
                          ? "bg-gradient-to-br from-[#D96B27] to-[#EA580C] border-[#D96B27] text-white shadow-xs"
                          : "border-[#D0C9B8] bg-white group-hover:border-[#D96B27]/50"
                      }`}>
                        {isChecked && (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Working Days (أيام العمل) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-bold text-foreground">أيام العمل والجاهزية للجولات:</label>
                <button
                  type="button"
                  onClick={() => {
                    const allSelected = guideInfo.working_days.length === WEEKDAYS.length;
                    setGuideInfo({ ...guideInfo, working_days: allSelected ? [] : WEEKDAYS.map((d) => d.id) });
                  }}
                  className="text-xs font-bold text-[#D96B27] hover:underline cursor-pointer"
                >
                  {guideInfo.working_days.length === WEEKDAYS.length ? "تحديد أيام معينة" : "طوال أيام الأسبوع"}
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 p-2 bg-[#FAFAF8] rounded-2xl border border-[#E6E1D6]">
                {WEEKDAYS.map((day) => {
                  const isChecked = guideInfo.working_days.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => {
                        const exists = guideInfo.working_days.includes(day.id);
                        setGuideInfo({
                          ...guideInfo,
                          working_days: exists
                            ? guideInfo.working_days.filter((d) => d !== day.id)
                            : [...guideInfo.working_days, day.id],
                        });
                      }}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                        isChecked
                          ? "bg-gradient-to-br from-[#D96B27] to-[#EA580C] border-[#D96B27] text-white shadow-soft scale-[1.02]"
                          : "bg-white border-[#E6E1D6]/80 text-[#526078] hover:border-[#D96B27]/40 hover:bg-[#FAFAF8]"
                      }`}
                    >
                      <span className={`text-[8px] font-bold block ${isChecked ? "text-white/85" : "text-[#8C9AA8]"}`}>
                        {day.nameEn.slice(0, 2)}
                      </span>
                      <span className="text-[10px] font-black mt-0.5">
                        {day.nameAr}
                      </span>
                      <span className={`w-1.5 h-1.5 rounded-full mt-1 ${isChecked ? "bg-white" : "bg-transparent"}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-foreground mb-1 block">تفاصيل وتوصيف الشهادات والترخيص</label>
              <textarea
                value={guideInfo.certificate_description}
                onChange={(e) => setGuideInfo({ ...guideInfo, certificate_description: e.target.value })}
                rows={3}
                className="w-full p-3 rounded-xl border border-border text-sm font-semibold text-right"
              />
            </div>

            {/* Digital Certificate File Upload */}
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5 space-y-2">
              <label className="text-xs font-black text-primary block">📜 تحميل نسخ ملفات الشهادات والترخيص الرقمية (Digital Certificate File):</label>
              <p className="text-xs text-muted-foreground">قم بتحميل نسخة رقمية من ملف الشهادة (PDF أو صورة) ليتم إرسالها للأدمن لمعاينتها وتوثيق حسابك.</p>
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
              <label className="text-sm font-bold text-foreground mb-1 block">النبذة التعريفية (Bio)</label>
              <textarea
                value={guideInfo.bio}
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
