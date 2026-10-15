import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import type { Driver, Vehicle } from "@/lib/dbSchema";
import { 
  getStoredSession, 
  getDrivers, 
  updateDriver, 
  getVehicles 
} from "@/lib/api";

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
  contract_number: string;
  plate_number: string;
  date: string;
  pickup_time: string;
  pax_count: number;
  status: "مجدولة" | "قيد التنفيذ" | "مكتملة";
  current_location: string;
  status_stage: "في الانتظار" | "تم الانطلاق" | "في الطريق - استراحة" | "وصلنا الوجهة" | "مكتملة";
};

function DriverDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const session = getStoredSession();
    if (!session.token || (session.role !== "driver" && session.role !== "admin")) {
      navigate({ to: "/auth/login" });
    }
  }, [navigate]);

  // Driver details state according to DelniDB: drivers table
  const [driverInfo, setDriverInfo] = useState<Driver>(() => {
    const session = getStoredSession();
    const allDrivers = getDrivers();
    if (session.user && (session.role === "driver" || session.user.driver_license_number)) {
      const u = session.user;
      const matched = allDrivers.find(d => d.driver_license_number === u.driver_license_number || d.email === u.email);
      const data = matched || u;
      return {
        driver_license_number: data.driver_license_number || "",
        full_name: data.full_name || data.name || "سائق مسجل",
        phone_number: data.phone_number || "",
        national_id_or_passport: data.national_id_or_passport || "",
        license_date_valid: data.license_date_valid || "",
        contract_number: data.contract_number || "",
        assigned_vehicle_plate: data.assigned_vehicle_plate || null,
        email: data.email || "",
        account_status: data.account_status || "نشط",
        operational_status: data.operational_status || "متاح",
        company_name: data.company_name || "",
      };
    }
    const first = allDrivers[0];
    return {
      driver_license_number: first?.driver_license_number || "",
      full_name: first?.full_name || "سائق مسجل",
      phone_number: first?.phone_number || "",
      national_id_or_passport: first?.national_id_or_passport || "",
      license_date_valid: first?.license_date_valid || "",
      contract_number: first?.contract_number || "",
      assigned_vehicle_plate: first?.assigned_vehicle_plate || null,
      email: first?.email || "",
      account_status: first?.account_status || "نشط",
      operational_status: first?.operational_status || "متاح",
      company_name: first?.company_name || "",
    };
  });

  // Assigned Vehicle details according to DelniDB: vehicles table
  const [assignedVehicle, setAssignedVehicle] = useState<Vehicle | null>(() => {
    const allVehicles = getVehicles();
    const matched = allVehicles.find(v => v.plate_number === driverInfo.assigned_vehicle_plate);
    if (matched) {
      return {
        plate_number: matched.plate_number,
        vehicle_type: matched.vehicle_type,
        seating_capacity: matched.seating_capacity,
        vehicle_status: (matched.vehicle_status as any) || "جاهزة",
        insurance_details: matched.insurance_details,
        contract_number: matched.contract_number,
        daily_rate: matched.daily_rate,
        category: matched.category,
        vehicle_image: matched.vehicle_image || "/assets/ai_city.jpg",
        insurance_image: matched.insurance_image || "/assets/ai_city.jpg",
      };
    }
    return null;
  });

  useEffect(() => {
    const session = getStoredSession();
    if (session.user && (session.role === "driver" || session.user.driver_license_number)) {
      const u = session.user;
      const allDrivers = getDrivers();
      const matched = allDrivers.find(d => d.driver_license_number === u.driver_license_number || d.email === u.email);
      const data = matched || u;
      setDriverInfo(prev => ({
        ...prev,
        driver_license_number: data.driver_license_number || prev.driver_license_number,
        full_name: data.full_name || data.name || prev.full_name,
        phone_number: data.phone_number || prev.phone_number,
        email: data.email || prev.email,
        assigned_vehicle_plate: data.assigned_vehicle_plate || prev.assigned_vehicle_plate,
        company_name: data.company_name || prev.company_name,
        contract_number: data.contract_number || prev.contract_number,
      }));
    }
  }, [active]);

  useEffect(() => {
    const allVehicles = getVehicles();
    const matched = allVehicles.find(v => v.plate_number === driverInfo.assigned_vehicle_plate);
    if (matched) {
      setAssignedVehicle({
        plate_number: matched.plate_number,
        vehicle_type: matched.vehicle_type,
        seating_capacity: matched.seating_capacity,
        vehicle_status: (matched.vehicle_status as any) || "جاهزة",
        insurance_details: matched.insurance_details,
        contract_number: matched.contract_number,
        daily_rate: matched.daily_rate,
        category: matched.category,
        vehicle_image: matched.vehicle_image || "/assets/ai_city.jpg",
        insurance_image: matched.insurance_image || "/assets/ai_city.jpg",
      });
    }
  }, [driverInfo.assigned_vehicle_plate, active]);

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "notifications", label: isAr ? "إشعارات التعيين" : "Assignments", icon: "🔔", badge: 2 },
    { id: "live_trip", label: isAr ? "متابعة الرحلة الحالية" : "Current Active Trip", icon: "📍" },
    { id: "vehicle", label: isAr ? "مركبتي المسندة" : "Assigned Vehicle", icon: "🚐" },
    { id: "profile", label: isAr ? "ملف السائق والرخصة" : "Driver License & Profile", icon: "👤" },
  ];

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Trips & Live Status
  const [activeTrip, setActiveTrip] = useState<AssignedDriverTrip>({
    id: `TRP-${driverInfo.driver_license_number || '101'}`,
    route: driverInfo.assigned_vehicle_plate ? `جولة سياحية — حافلة ${driverInfo.assigned_vehicle_plate}` : "لا توجد رحلة مسندة حالياً",
    company_name: driverInfo.company_name || "شركة النقل السياحي",
    contract_number: driverInfo.contract_number || "",
    plate_number: driverInfo.assigned_vehicle_plate || "غير محدد",
    date: "اليوم",
    pickup_time: "09:00 ص",
    pax_count: 0,
    status: driverInfo.assigned_vehicle_plate ? "قيد التنفيذ" : "مجدولة",
    current_location: "مقر الشركة",
    status_stage: "في الانتظار"
  });

  const handleToggleOperationalStatus = () => {
    const nextStatus: "متاح" | "إجازة" = driverInfo.operational_status === "متاح" ? "إجازة" : "متاح";
    const updated: Driver = { ...driverInfo, operational_status: nextStatus };
    setDriverInfo(updated);
    updateDriver(driverInfo.driver_license_number, updated);
  };

  const handleUpdateStatusStage = (newStage: AssignedDriverTrip["status_stage"], newLocation: string) => {
    setActiveTrip({
      ...activeTrip,
      status_stage: newStage,
      current_location: newLocation,
      status: newStage === "مكتملة" ? "مكتملة" : "قيد التنفيذ"
    });
  };

  const [driverNewPassword, setDriverNewPassword] = useState("");
  const [driverConfirmPassword, setDriverConfirmPassword] = useState("");

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (driverNewPassword) {
      if (driverNewPassword.length < 4) {
        alert("كلمة المرور يجب أن تتكون من 4 خانات على الأقل");
        return;
      }
      if (driverNewPassword !== driverConfirmPassword) {
        alert("كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة");
        return;
      }
      updateDriver(driverInfo.driver_license_number, {
        ...driverInfo,
        password: driverNewPassword,
      });
      setDriverNewPassword("");
      setDriverConfirmPassword("");
      alert("تم تحديث كلمة المرور الخاصة بحساب السائق بنجاح ✓");
      return;
    }
    alert("لم يتم إدخال كلمة مرور جديدة. باقي بيانات الحساب معتمدة ومحمية.");
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
                <p className="mt-1 text-sm text-white/90 font-semibold">
                  {driverInfo.company_name} · عقد {driverInfo.contract_number} · مركبة {driverInfo.assigned_vehicle_plate}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs bg-white/20 px-2.5 py-0.5 rounded-full font-bold">
                    حالة الحساب: {driverInfo.account_status}
                  </span>
                </div>
              </div>
              <label className="flex items-center gap-3 bg-white/15 backdrop-blur px-4 h-12 rounded-xl cursor-pointer">
                <span className="text-sm font-black">
                  {driverInfo.operational_status === "متاح" ? "متاح للقيادة" : "في إجازة"}
                </span>
                <button
                  onClick={handleToggleOperationalStatus}
                  className={`w-12 h-6 rounded-full relative transition ${driverInfo.operational_status === "متاح" ? "bg-emerald-400" : "bg-white/30"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition ${driverInfo.operational_status === "متاح" ? "right-0.5" : "right-6"}`} />
                </button>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="إشعارات التعيين" value={notifications.filter(n => !n.is_read).length} icon="🔔" tone="sea" />
            <StatCard label="حالة رحلة اليوم" value={activeTrip.status_stage} icon="🧭" tone="green" />
            <StatCard label="المركبة المسندة" value={driverInfo.assigned_vehicle_plate || "غير محدد"} icon="🚐" tone="clay" />
            <StatCard label="حالة الحساب" value={driverInfo.account_status} icon="🛡️" tone="sun" />
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
                  <div className="text-xs opacity-80">كود المهمة: {activeTrip.id} · {activeTrip.company_name} (عقد {activeTrip.contract_number})</div>
                  <h2 className="text-2xl font-black mt-1">{activeTrip.route}</h2>
                </div>
                <Badge tone="green">{activeTrip.status_stage}</Badge>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur text-sm">
                <div>📍 الموقع المسجل حالياً: <span className="font-bold">{activeTrip.current_location}</span></div>
                <div className="mt-1">🕘 وقت الانطلاق: {activeTrip.pickup_time} · 👥 الركاب: {activeTrip.pax_count} شخص · 🚐 اللوحة: {activeTrip.plate_number}</div>
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
        <SectionCard title="تفاصيل المركبة واللوحة المسندة">
          {assignedVehicle ? (
            <div className="grid lg:grid-cols-12 gap-6 text-right items-start">
              {/* Left Column: Assigned Vehicle Image & Dedicated Company Badge */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-3xl overflow-hidden border-2 border-primary/20 bg-white shadow-soft relative group">
                  <img
                    src={assignedVehicle.vehicle_image || "/assets/office-bus.jpg"}
                    alt={assignedVehicle.vehicle_type}
                    className="w-full h-56 object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge tone="sea">🚌 الحافلة المخصصة للسائق</Badge>
                  </div>
                  <div className="p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent absolute inset-x-0 bottom-0 text-white">
                    <div className="text-xs text-white/80 font-bold">لوحة المركبة المخصصة:</div>
                    <div className="text-xl font-mono font-black">{assignedVehicle.plate_number}</div>
                  </div>
                </div>

                {/* Company Affiliation Card on the Left */}
                <div className="p-4 rounded-2xl border-2 border-[#1B5A78]/25 bg-gradient-to-br from-[#1B5A78]/5 via-[#1B5A78]/10 to-transparent space-y-2">
                  <div className="text-[11px] font-black text-[#1B5A78] flex items-center gap-1.5">
                    <span>🏢</span>
                    <span>شركة النقل السياحي المعتمدة التابع لها:</span>
                  </div>
                  <div className="font-black text-foreground text-lg flex items-center justify-between">
                    <span>{driverInfo.company_name || "شركة النقل السياحي"}</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">✓ معتمد</span>
                  </div>
                  <div className="text-xs text-muted-foreground font-semibold flex items-center justify-between pt-1 border-t border-[#1B5A78]/15">
                    <span>رقم العقد الرسمي:</span>
                    <span className="font-mono font-bold text-foreground">{driverInfo.contract_number}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Vehicle Technical Specs */}
              <div className="lg:col-span-7 space-y-4">
                <div className="p-4 rounded-2xl border border-border bg-muted/20 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-muted-foreground">نوع وطراز المركبة:</div>
                    <div className="font-black text-foreground text-lg">{assignedVehicle.vehicle_type}</div>
                  </div>
                  <Badge tone={assignedVehicle.vehicle_status === "جاهزة" ? "green" : "sun"}>{assignedVehicle.vehicle_status}</Badge>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl border border-border bg-white space-y-1">
                    <div className="text-xs text-muted-foreground font-bold">رقم اللوحة المعدنية:</div>
                    <div className="font-black text-lg text-primary font-mono">{assignedVehicle.plate_number}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-white space-y-1">
                    <div className="text-xs text-muted-foreground font-bold">سعة المقاعد:</div>
                    <div className="font-black text-base text-foreground">{assignedVehicle.seating_capacity} راكب</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-white space-y-1">
                    <div className="text-xs text-muted-foreground font-bold">فئة المركبة:</div>
                    <div className="font-black text-base text-foreground">{assignedVehicle.category}</div>
                  </div>
                  <div className="p-3.5 rounded-2xl border border-border bg-white space-y-1">
                    <div className="text-xs text-muted-foreground font-bold">سعر التأجير اليومي:</div>
                    <div className="font-black text-base text-foreground">{assignedVehicle.daily_rate} د.ل/يوم</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-border bg-white space-y-2">
                  <div className="text-xs text-muted-foreground font-bold flex items-center gap-1.5">
                    <span>🛡️</span>
                    <span>وثيقة التأمين الشامل للمركبة:</span>
                  </div>
                  <div className="text-xs text-slate-700 font-semibold">{assignedVehicle.insurance_details}</div>
                  {assignedVehicle.insurance_image && (
                    <div className="mt-2 pt-2 border-t border-border flex items-center gap-2">
                      <span className="text-xs text-emerald-700 font-bold">✓ مرفق صورة وثيقة التأمين سارية المفعول</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <span className="text-3xl">🚘</span>
              <div className="font-bold text-sm text-foreground">لا توجد مركبة مسندة لهذا السائق حالياً</div>
              <p className="text-xs text-muted-foreground">تقوم شركة النقل بتعيين المركبة وإسناد رقم اللوحة من خلال لوحة تحكم الشركة.</p>
            </div>
          )}
        </SectionCard>
      )}

      {/* Driver Profile */}
      {active === "profile" && (
        <SectionCard title="الملف الشخصي للسائق وكلمة المرور">
          <form className="max-w-xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1.5">
              <div className="font-black flex items-center gap-1.5 text-slate-900">
                <span>🔒</span>
                <span>بيانات السائق ورخصة القيادة (معتمدة ومحمية من التعديل):</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                الاسم، رقم الهاتف، رقم الرخصة، تاريخ الانتهاء، الرقم الوطني والبريد الإلكتروني هي بيانات رسمية معتمدة عبر شركة النقل، ولا يمكن تعديلها من حساب السائق. يمكنك هنا فقط تحديث كلمة المرور (الرمز) لحسابك.
              </p>
            </div>

            {/* Read-only official driver fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">الاسم الكامل للسائق 🔒</label>
                <input
                  type="text"
                  value={driverInfo.full_name}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">رقم الهاتف 🔒</label>
                <input
                  type="text"
                  value={driverInfo.phone_number}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">رقم رخصة القيادة 🔒</label>
                <input
                  type="text"
                  value={driverInfo.driver_license_number}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">تاريخ صلاحية انتهاء الرخصة 🔒</label>
                <input
                  type="text"
                  value={driverInfo.license_date_valid ? String(driverInfo.license_date_valid).split("T")[0] : ""}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">الرقم الوطني للسائق (12 رقماً) 🔒</label>
                <input
                  type="text"
                  value={driverInfo.national_id_or_passport || ""}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">البريد الإلكتروني للحساب 🔒</label>
                <input
                  type="email"
                  value={driverInfo.email || ""}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
            </div>

            {/* Editable Password Section */}
            <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-3 pt-4">
              <div className="text-xs font-black text-primary flex items-center gap-1.5">
                <span>🔑</span>
                <span>تحديث رمز الدخول (كلمة المرور):</span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={driverNewPassword}
                    onChange={(e) => setDriverNewPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور جديدة..."
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={driverConfirmPassword}
                    onChange={(e) => setDriverConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور..."
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
                  />
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">
                * اترك الحقل فارغاً إذا كنت لا ترغب في تغيير كلمة المرور الحالية.
              </p>
            </div>

            <button className="px-6 h-11 bg-gradient-sea text-white font-black text-sm rounded-xl shadow-glow cursor-pointer hover:opacity-95 transition">
              حفظ وتحديث كلمة المرور ✓
            </button>
          </form>
        </SectionCard>
      )}
    </DashboardShell>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, pattern, errorMessage, maxLength }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; pattern?: RegExp; errorMessage?: string; maxLength?: number }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    if (maxLength && val.length > maxLength) return;
    onChange(val);
    if (pattern && val) {
      setError(!pattern.test(val) ? (errorMessage || "إدخال غير صحيح") : "");
    } else {
      setError("");
    }
  };
  return (
    <div>
      <label className="text-sm font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-11 px-3 rounded-xl border bg-white text-right focus:outline-none text-sm font-semibold ${error ? "border-red-500" : "border-border focus:border-primary"}`}
      />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}
