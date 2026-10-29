import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { useLanguage } from "@/lib/i18n";
import type { Driver, Vehicle } from "@/lib/dbSchema";
import {
  getStoredSession,
  getDrivers,
  apiUpdateDriver,
  apiChangeDriverPassword,
  apiGetDriverDashboard,
  apiUpdateDriverTripStage,
  getVehicles,
  type DriverTrip,
} from "@/lib/api";
import { fetchUserNotifications, markNotificationRead, notificationTarget, type NotificationItem } from "@/lib/notifications";

// Trip stages the driver reports; saved in drivers.current_trip_stage
const TRIP_STAGES = [
  { stage: "في الانتظار", icon: "⏳" },
  { stage: "تم الانطلاق", icon: "🚌" },
  { stage: "في الطريق - استراحة", icon: "☕" },
  { stage: "وصلنا الوجهة", icon: "📍" },
  { stage: "مكتملة", icon: "🏁" },
];

export const Route = createFileRoute("/dashboard/driver")({
  head: () => ({
    meta: [
      { title: "لوحة السائق | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: DriverDashboard,
});

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

  // Trips the admin assigned to this driver's vehicle, and the driver's own notifications (from DelniDB)
  const [trips, setTrips] = useState<DriverTrip[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!driverInfo.driver_license_number) return;
    apiGetDriverDashboard(driverInfo.driver_license_number).then((data) => {
      if (!data) return;
      setDriverInfo((prev) => ({ ...prev, ...data.driver } as Driver));
      setTrips(data.trips || []);
      setAssignedVehicle(data.vehicle ? ({ ...data.vehicle, vehicle_status: data.vehicle.vehicle_status || "جاهزة" } as Vehicle) : null);
    });
    fetchUserNotifications().then(setNotifications);
  }, [driverInfo.driver_license_number, active]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tripStage: string = (driverInfo as any).current_trip_stage || "في الانتظار";
  const [savingStage, setSavingStage] = useState(false);
  const handleTripStage = async (stage: string) => {
    setSavingStage(true);
    const res = await apiUpdateDriverTripStage(driverInfo.driver_license_number, stage);
    setSavingStage(false);
    if (!res.success) {
      alert("❌ " + res.error);
      return;
    }
    setDriverInfo((prev) => ({ ...prev, current_trip_stage: stage } as Driver));
  };

  const openNotification = (n: NotificationItem) => {
    if (!n.read) {
      markNotificationRead(n.id);
      setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    }
    const target = notificationTarget(n);
    if (target) navigate({ to: target.to as any, search: target.search as any });
  };

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "notifications", label: isAr ? "الإشعارات" : "Notifications", icon: "🔔", badge: unreadCount || undefined },
    { id: "live_trip", label: isAr ? "الرحلات المسندة لمركبتي" : "Assigned Trips", icon: "📍" },
    { id: "vehicle", label: isAr ? "مركبتي المسندة" : "Assigned Vehicle", icon: "🚐" },
    { id: "profile", label: isAr ? "ملف السائق والرخصة" : "Driver License & Profile", icon: "👤" },
  ];

  const handleToggleOperationalStatus = async () => {
    const nextStatus: "متاح" | "إجازة" = driverInfo.operational_status === "متاح" ? "إجازة" : "متاح";
    const res = await apiUpdateDriver(driverInfo.driver_license_number, { operational_status: nextStatus });
    if (!res.success) {
      alert("❌ لم يتم تحديث الحالة.\n" + res.error);
      return;
    }
    setDriverInfo({ ...driverInfo, operational_status: nextStatus });
  };

  const [driverCurrentPassword, setDriverCurrentPassword] = useState("");
  const [driverNewPassword, setDriverNewPassword] = useState("");
  const [driverConfirmPassword, setDriverConfirmPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driverNewPassword) {
      alert("يرجى كتابة كلمة المرور الجديدة.");
      return;
    }
    if (!driverCurrentPassword) {
      alert("يرجى كتابة كلمة المرور الحالية لتأكيد أنك صاحب الحساب.");
      return;
    }
    if (driverNewPassword.length < 6) {
      alert("كلمة المرور يجب أن تتكون من 6 خانات على الأقل");
      return;
    }
    if (driverNewPassword !== driverConfirmPassword) {
      alert("كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة");
      return;
    }
    const res = await apiChangeDriverPassword(driverInfo.driver_license_number, driverCurrentPassword, driverNewPassword);
    if (!res.success) {
      alert("❌ " + res.error);
      return;
    }
    setDriverCurrentPassword("");
    setDriverNewPassword("");
    setDriverConfirmPassword("");
    alert("✅ تم تغيير كلمة المرور بنجاح");
  };

  const stageControl = trips.length > 0 && (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <h3 className="font-black text-foreground text-sm">مرحلة الرحلة الحالية:</h3>
        <Badge tone={tripStage === "مكتملة" ? "green" : "sea"}>{tripStage}</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {TRIP_STAGES.map((st) => (
          <button
            key={st.stage}
            disabled={savingStage}
            onClick={() => handleTripStage(st.stage)}
            className={`p-3 rounded-2xl border text-center transition disabled:opacity-60 ${
              tripStage === st.stage ? "border-primary bg-primary/10 text-primary font-black shadow-soft" : "border-border bg-white text-foreground hover:border-primary/40"
            }`}
          >
            <div className="text-xl">{st.icon}</div>
            <div className="text-xs font-black mt-1">{st.stage}</div>
          </button>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground">تُحفظ المرحلة فوراً وتظهر لشركة النقل وإدارة المنصة.</p>
    </div>
  );

  const tripsList = (
    trips.length === 0 ? (
      <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
        <div className="text-2xl">🗓️</div>
        <div className="font-bold text-sm text-foreground">لا توجد رحلات مسندة لمركبتك حالياً</div>
        <p className="text-xs text-muted-foreground">تظهر هنا الرحلات فقط عندما تسند إدارة المنصة رحلة لمركبتك.</p>
      </div>
    ) : (
      <div className="space-y-3">
        {trips.map((t) => (
          <div key={`${t.kind}-${t.id}`} className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-1.5">
            <div className="flex justify-between items-center gap-2">
              <span className="font-black text-foreground text-sm">{t.title}</span>
              <Badge tone="sea">رحلة {t.kind}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              🗓️ {t.schedule}
              {t.departure_city ? ` · 📍 الانطلاق من ${t.departure_city}` : ""} · 👥 الركاب: {t.passengers}
            </div>
          </div>
        ))}
      </div>
    )
  );

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
                  {driverInfo.company_name}{driverInfo.assigned_vehicle_plate ? ` · مركبة ${driverInfo.assigned_vehicle_plate}` : ""}
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
            <StatCard label="إشعارات غير مقروءة" value={unreadCount} icon="🔔" tone="sea" />
            <StatCard label="الرحلات المسندة" value={trips.length} icon="🧭" tone="green" />
            <StatCard label="المركبة المسندة" value={driverInfo.assigned_vehicle_plate || "غير محدد"} icon="🚐" tone="clay" />
            <StatCard label="حالة الحساب" value={driverInfo.account_status} icon="🛡️" tone="sun" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 text-right">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="الرحلات المسندة لمركبتي">
                {stageControl}
                {tripsList}
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="آخر الإشعارات">
                <div className="space-y-2">
                  {notifications.length === 0 && <div className="text-xs text-muted-foreground text-center py-4">لا توجد إشعارات</div>}
                  {notifications.slice(0, 5).map((n) => (
                    <div key={n.id} onClick={() => openNotification(n)} className="p-3 rounded-xl bg-muted/40 text-xs text-right cursor-pointer hover:bg-muted/70 transition">
                      <div className="font-black text-foreground">{n.title}</div>
                      <p className="text-muted-foreground mt-0.5">{n.body}</p>
                      <span className="text-[10px] text-muted-foreground mt-1 block">{n.time}</span>
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
        <SectionCard title="إشعاراتي">
          <div className="space-y-3 text-right">
            {notifications.length === 0 && (
              <div className="p-8 text-center text-xs text-muted-foreground bg-slate-50 rounded-2xl border border-slate-200">لا توجد إشعارات لحسابك حتى الآن</div>
            )}
            {notifications.map((n) => (
              <div key={n.id} onClick={() => openNotification(n)} className={`p-4 rounded-xl border bg-white flex justify-between items-start gap-3 cursor-pointer hover:shadow-md transition ${n.read ? "border-border" : "border-primary/40"}`}>
                <div>
                  <span className="font-black text-foreground text-sm">{n.title}</span>
                  <p className="text-xs text-muted-foreground mt-1">{n.body}</p>
                  <span className="text-xs font-bold text-primary mt-2 block">{n.time}</span>
                </div>
                {!n.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(n.id);
                      setNotifications(notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                    }}
                    className="px-3 py-1.5 bg-muted rounded-lg text-xs font-bold shrink-0"
                  >
                    تم الاطلاع
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Live Trip Tracker */}
      {active === "live_trip" && (
        <SectionCard title="الرحلات المسندة لمركبتي">
          <div className="text-right">
            {stageControl}
            {tripsList}
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
                الاسم، رقم الهاتف، رقم الرخصة، تاريخ الانتهاء، الرقم الوطني والبريد الإلكتروني هي بيانات رسمية معتمدة عبر شركة النقل، ولا يمكن تعديلها من حساب السائق. يمكنك هنا فقط تغيير كلمة المرور لحسابك، ولا يستطيع أحد غيرك تغييرها.
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

            {/* Password change: only the driver, who must enter the current password */}
            <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-3 pt-4">
              <div className="text-xs font-black text-primary flex items-center gap-1.5">
                <span>🔑</span>
                <span>تغيير كلمة المرور:</span>
              </div>
              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={driverCurrentPassword}
                  onChange={(e) => setDriverCurrentPassword(e.target.value)}
                  placeholder="اكتب كلمة المرور الحالية..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={driverNewPassword}
                    onChange={(e) => setDriverNewPassword(e.target.value)}
                    placeholder="6 خانات على الأقل"
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
            </div>

            <button className="px-6 h-11 bg-gradient-sea text-white font-black text-sm rounded-xl shadow-glow cursor-pointer hover:opacity-95 transition">
              تغيير كلمة المرور ✓
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
