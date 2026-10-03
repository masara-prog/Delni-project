import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/driver")({
  head: () => ({
    meta: [
      { title: "لوحة السائق | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DriverDashboard,
});

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  trip_route: string;
  assigned_at: string;
  is_read: boolean;
};

type AssignedDriverTrip = {
  id: string;
  route: string;
  company_name: string;
  date: string;
  pickup_time: string;
  pax_count: number;
  status: "مجدولة" | "قيد التنفيذ" | "مكتملة";
  current_location: string;
  status_stage: "في الانتظار" | "تم الانطلاق" | "في الطريق - استراحة" | "وصلنا الوجهة" | "مكتملة";
};

function DriverDashboard() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [active, setActive] = useState("overview");
  const [available, setAvailable] = useState(true);

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "notifications", label: isAr ? "إشعارات التعيين" : "Assignments", icon: "🔔", badge: 2 },
    { id: "live_trip", label: isAr ? "متابعة الرحلة الحالية" : "Current Active Trip", icon: "📍" },
    { id: "vehicle", label: isAr ? "مركبتي المسندة" : "Assigned Vehicle", icon: "🚐" },
    { id: "profile", label: isAr ? "ملف السائق والرخصة" : "Driver License & Profile", icon: "👤" },
  ];

  // Driver details state (Data Dictionary: Drivers table)
  const [driverInfo, setDriverInfo] = useState({
    driver_license_number: "LB-88291",
    full_name: "علي التارقي",
    phone_number: "0912223344",
    national_id_or_passport: "119900223344",
    license_date_valid: "2029-12-10",
    contract_number: "CN-2026-01",
    assigned_vehicle_plate: "طرابلس 4517",
    email: "ali@dalni.ly",
    employer: "شركة الصحراء للنقل السياحي"
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: "N-1", title: "تم تعيينك لرحلة جديدة", message: "قامت شركة الصحراء بتعيينك لسياقة حافلة طرابلس ← لبدة الكبرى اليوم الساعة 9:00 صباحاً.", trip_route: "طرابلس ← لبدة الكبرى", assigned_at: "قبل 20 دقيقة", is_read: false },
    { id: "N-2", title: "تحديث جدول الأسبوع", message: "تمت إضافة مهمة قيادة لرحلة أوباري الصحراوية يوم 17 أغسطس.", trip_route: "طرابلس ← أوباري", assigned_at: "أمس", is_read: false }
  ]);

  // Trips & Live Status
  const [activeTrip, setActiveTrip] = useState<AssignedDriverTrip>({
    id: "TRP-101",
    route: "طرابلس ← الخمس (لبدة الكبرى)",
    company_name: "شركة الصحراء للنقل",
    date: "اليوم",
    pickup_time: "9:00 ص",
    pax_count: 12,
    status: "قيد التنفيذ",
    current_location: "طرابلس - طريق الشط (مقر الانطلاق)",
    status_stage: "في الانتظار"
  });

  const handleUpdateStatusStage = (newStage: AssignedDriverTrip["status_stage"], newLocation: string) => {
    setActiveTrip({
      ...activeTrip,
      status_stage: newStage,
      current_location: newLocation,
      status: newStage === "مكتملة" ? "مكتملة" : "قيد التنفيذ"
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم حفظ وتحديث البيانات الشخصية ورخصة القيادة بنجاح ✓");
  };

  return (
    <DashboardShell role="driver" roleLabel="سائق معتمد" userName={driverInfo.full_name} nav={nav} active={active} onNavigate={setActive}>
      {active === "overview" && (
        <>
          <div className="rounded-3xl p-6 md:p-8 bg-gradient-sea text-white shadow-glow mb-6 relative overflow-hidden text-right">
            <div className="relative flex flex-wrap items-center gap-4 justify-between">
              <div>
                <div className="text-sm opacity-80">صباح الخير 👋</div>
                <h1 className="text-2xl md:text-3xl font-black mt-1">{driverInfo.full_name}</h1>
                <p className="mt-1 text-sm text-white/90 font-semibold">{driverInfo.employer} · مركبة {driverInfo.assigned_vehicle_plate}</p>
              </div>
              <label className="flex items-center gap-3 bg-white/15 backdrop-blur px-4 h-12 rounded-xl cursor-pointer">
                <span className="text-sm font-black">{available ? "متاح للقيادة" : "في إجازة"}</span>
                <button
                  onClick={() => setAvailable(!available)}
                  className={`w-12 h-6 rounded-full relative transition ${available ? "bg-emerald-400" : "bg-white/30"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${available ? "right-0.5" : "right-6"}`} />
                </button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="إشعارات التعيين" value={notifications.filter(n => !n.is_read).length} icon="🔔" tone="sea" />
            <StatCard label="رحلة اليوم الحالية" value={activeTrip.status_stage} icon="🧭" tone="green" />
            <StatCard label="مسافة هذا الشهر" value="1,420 كم" icon="🛣️" tone="clay" />
            <StatCard label="تقييم القيادة" value="4.8 ⭐" icon="⭐" tone="sun" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 text-right">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="متابعة وتحديث حالة الرحلة الحالية">
                <div className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-foreground text-base">{activeTrip.route}</span>
                    <Badge tone="green">{activeTrip.status_stage}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">📍 الموقع الحالي: <span className="font-bold text-foreground">{activeTrip.current_location}</span></div>
                  <div className="pt-2 flex flex-wrap gap-2">
                    <button onClick={() => setActive("live_trip")} className="px-4 py-2 bg-gradient-sea text-white rounded-xl text-xs font-black shadow-glow">
                      تحديث الموقع وحالة الطريق الآن 📍
                    </button>
                  </div>
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="آخر إشعارات التعيين">
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3 rounded-xl bg-muted/40 text-xs text-right">
                      <div className="font-black text-foreground">{n.title}</div>
                      <p className="text-muted-foreground mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{n.assigned_at}</span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* Notifications Feed */}
      {active === "notifications" && (
        <SectionCard title="إشعارات تعيين الرحلات والمهام الجديدة (Assignment Notifications)">
          <div className="space-y-3 text-right">
            {notifications.map((n) => (
              <div key={n.id} className="p-4 rounded-xl border border-border bg-white flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-foreground text-sm">{n.title}</span>
                    <Badge tone="sea">{n.trip_route}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{n.message}</p>
                  <span className="text-xs font-bold text-primary mt-2 block">{n.assigned_at}</span>
                </div>
                <button
                  onClick={() => setNotifications(notifications.map(x => x.id === n.id ? { ...x, is_read: true } : x))}
                  className="px-3 py-1.5 bg-muted rounded-lg text-xs font-bold"
                >
                  تم الاطلاع
                </button>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Live Trip Tracker */}
      {active === "live_trip" && (
        <SectionCard title="لوحة التحكم وتحديث موقع وحالة الرحلة المباشرة">
          <div className="space-y-6 text-right">
            <div className="p-6 rounded-3xl bg-gradient-sea text-white space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs opacity-80">كود المهمة: {activeTrip.id} · {activeTrip.company_name}</div>
                  <h2 className="text-2xl font-black mt-1">{activeTrip.route}</h2>
                </div>
                <Badge tone="green">{activeTrip.status_stage}</Badge>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur text-sm">
                <div>📍 الموقع المسجل حالياً: <span className="font-bold">{activeTrip.current_location}</span></div>
                <div className="mt-1">🕘 وقت الانطلاق: {activeTrip.pickup_time} · 👥 الركاب: {activeTrip.pax_count} شخص</div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-black text-foreground text-sm">تحديث مرحلة وتطور الرحلة (Trip Status Control):</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                  { stage: "في الانتظار" as const, loc: "مقر الانطلاق (طرابلس)", icon: "⏳" },
                  { stage: "تم الانطلاق" as const, loc: "الطريق السريع / الساحلي", icon: "🚌" },
                  { stage: "في الطريق - استراحة" as const, loc: "محطة الاستراحة الوسطى", icon: "☕" },
                  { stage: "وصلنا الوجهة" as const, loc: "موقع المعالم السياحية (لبدة/غدامس)", icon: "📍" },
                  { stage: "مكتملة" as const, loc: "العودة والتسليم النهائي", icon: "🏁" },
                ].map((st) => (
                  <button
                    key={st.stage}
                    onClick={() => handleUpdateStatusStage(st.stage, st.loc)}
                    className={`p-4 rounded-2xl border text-right transition ${
                      activeTrip.status_stage === st.stage
                        ? "border-primary bg-primary/10 text-primary font-black shadow-soft"
                        : "border-border bg-white text-foreground hover:border-primary/40"
                    }`}
                  >
                    <div className="text-2xl">{st.icon}</div>
                    <div className="text-xs font-black mt-2">{st.stage}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{st.loc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Vehicle Info */}
      {active === "vehicle" && (
        <SectionCard title="تفاصيل المركبة واللوحة المسندة للسائق">
          <div className="max-w-xl space-y-4 text-right">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2">
              <div className="text-xs text-muted-foreground">شركة النقل التابع لها:</div>
              <div className="font-black text-foreground text-base">{driverInfo.employer}</div>
              <div className="text-xs text-muted-foreground">رقم العقد: {driverInfo.contract_number}</div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-white space-y-2">
              <div className="text-xs text-muted-foreground">رقم اللوحة المعدنية المسندة:</div>
              <div className="font-black text-xl text-primary font-mono">{driverInfo.assigned_vehicle_plate}</div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Driver Profile */}
      {active === "profile" && (
        <SectionCard title="تعديل الملف الشخصي وبيانات رخصة القيادة">
          <form className="max-w-xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <Field label="الاسم الكامل للسائق" value={driverInfo.full_name} onChange={(v) => setDriverInfo({ ...driverInfo, full_name: v })} />
            <Field label="رقم الهاتف" value={driverInfo.phone_number} onChange={(v) => setDriverInfo({ ...driverInfo, phone_number: v })} />
            <Field label="رقم رخصة القيادة" value={driverInfo.driver_license_number} onChange={(v) => setDriverInfo({ ...driverInfo, driver_license_number: v })} />
            <Field label="تاريخ صلاحية انتهاء الرخصة" type="date" value={driverInfo.license_date_valid} onChange={(v) => setDriverInfo({ ...driverInfo, license_date_valid: v })} />
            <Field label="الرقم الوطني أو رقم جواز السفر" value={driverInfo.national_id_or_passport} onChange={(v) => setDriverInfo({ ...driverInfo, national_id_or_passport: v })} />
            <Field label="البريد الإلكتروني لحساب السائق" type="email" value={driverInfo.email} onChange={(v) => setDriverInfo({ ...driverInfo, email: v })} />

            <button className="px-6 h-11 bg-gradient-sea text-white font-black text-sm rounded-xl shadow-glow">
              حفظ التغييرات ✓
            </button>
          </form>
        </SectionCard>
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
