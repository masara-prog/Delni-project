import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import destUbari from "@/assets/dest-ubari.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import officeBusImg from "@/assets/office-bus.jpg";
import privateTripImg from "@/assets/private-trip.jpg";
import { useLanguage } from "@/lib/i18n";
import type { TransportationCompany, Vehicle, Driver } from "@/lib/dbSchema";
import { 
  getStoredSession,
  getTransportCompanies,
  apiChangeCompanyPassword,
  getVehicles,
  saveVehicle,
  getDrivers,
  refreshFleet,
  apiAddDriver,
  apiUpdateDriver,
  laravelRequest
} from "@/lib/api";

export const Route = createFileRoute("/dashboard/transport")({
  head: () => ({
    meta: [
      { title: "لوحة شركة النقل | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TransportDashboard,
});

function TransportDashboard() {
  const navigate = useNavigate();
  const [active, setActive] = useState("overview");

  useEffect(() => {
    const session = getStoredSession();
    if (!session.token || (session.role !== "transport" && session.role !== "admin")) {
      navigate({ to: "/auth/login" });
    }
  }, [navigate]);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Profile state according to DelniDB: transportation_companies table
  const [companyInfo, setCompanyInfo] = useState<TransportationCompany>(() => {
    const session = getStoredSession();
    const companies = getTransportCompanies();
    if (session.user && (session.role === "transport" || session.user.contract_number)) {
      const u = session.user;
      const matched = companies.find(c => c.contract_number === u.contract_number || c.email === u.email);
      const data = matched || u;
      return {
        contract_number: data.contract_number || "",
        company_name: data.company_name || data.name || "شركة النقل السياحي",
        phone_number: data.phone_number || data.phone || "",
        address: data.address || "",
        city: data.city || "طرابلس",
        total_vehicles: Number(data.total_vehicles) || 0,
        verification_status: data.verification_status || data.status || "موثق",
        contract_start_date: data.contract_start_date || "",
        contract_end_date: data.contract_end_date || "",
        email: data.email || "",
        password: "••••••••",
      };
    }
    const first = companies[0];
    return {
      contract_number: first?.contract_number || "",
      company_name: first?.company_name || first?.name || "شركة النقل السياحي",
      phone_number: first?.phone_number || first?.phone || "",
      address: first?.address || "",
      city: first?.city || "طرابلس",
      total_vehicles: Number(first?.total_vehicles) || 0,
      verification_status: first?.verification_status || "بانتظار التوثيق",
      contract_start_date: first?.contract_start_date || "",
      contract_end_date: first?.contract_end_date || "",
      email: first?.email || "",
      password: "••••••••",
    };
  });

  // Drivers state according to DelniDB: drivers table
  const [drivers, setDrivers] = useState<Driver[]>(() => {
    return getDrivers(companyInfo.contract_number) as Driver[];
  });

  // Vehicles state according to DelniDB: vehicles table
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    return getVehicles(companyInfo.contract_number) as Vehicle[];
  });
  const [previewInsuranceDoc, setPreviewInsuranceDoc] = useState<string | null>(null);

  // Reload data when company or active changes
  useEffect(() => {
    const session = getStoredSession();
    if (session.user && (session.role === "transport" || session.user.contract_number)) {
      const u = session.user;
      const companies = getTransportCompanies();
      const matched = companies.find(c => c.contract_number === u.contract_number || c.email === u.email);
      const data = matched || u;
      setCompanyInfo(prev => ({
        ...prev,
        contract_number: data.contract_number || prev.contract_number,
        company_name: data.company_name || data.name || prev.company_name,
        phone_number: data.phone_number || data.phone || prev.phone_number,
        email: data.email || prev.email,
        address: data.address || prev.address,
        city: data.city || prev.city,
      }));
    }
    const loadedVehicles = getVehicles(companyInfo.contract_number) as Vehicle[];
    setVehicles(loadedVehicles);
    const loadedDrivers = getDrivers(companyInfo.contract_number) as Driver[];
    setDrivers(loadedDrivers);

    // Live sync with DelniDB through Laravel
    if (companyInfo.contract_number) {
      // The contract terms (agreed vehicle count, dates) are set by the admin and may have changed
      laravelRequest<any[]>("GET", "/transport/companies").then(res => {
        const mine = res.ok && Array.isArray(res.data) ? res.data.find(c => c.contract_number === companyInfo.contract_number) : null;
        if (mine) {
          setCompanyInfo(prev => ({
            ...prev,
            total_vehicles: Number(mine.total_vehicles) || 0,
            contract_start_date: mine.contract_start_date || prev.contract_start_date,
            contract_end_date: mine.contract_end_date || prev.contract_end_date,
            verification_status: mine.verification_status || prev.verification_status,
          }));
        }
      });
      refreshFleet(companyInfo.contract_number).then(fleet => {
        if (fleet) {
          setVehicles(fleet.vehicles as Vehicle[]);
          setDrivers(fleet.drivers as Driver[]);
        }
      });
    }
  }, [active, companyInfo.contract_number]);

  const { language } = useLanguage();
  const isAr = language === 'ar';

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "📊" },
    { id: "drivers", label: isAr ? "السائقون المسجلون" : "Drivers", icon: "🧑‍✈️", badge: drivers.length },
    { id: "vehicles", label: isAr ? "الأسطول والسيارات" : "Fleet & Vehicles", icon: "🚌", badge: vehicles.length },
    { id: "trips", label: isAr ? "الرحلات المسنّدة" : "Assigned Tours", icon: "🧭" },
    { id: "profile", label: isAr ? "بيانات الشركة" : "Company Profile", icon: "🏢" },
  ];

  // A company cannot register more vehicles than the number agreed in its contract (also enforced by the server)
  const vehicleLimitReached = companyInfo.total_vehicles > 0 && vehicles.length >= companyInfo.total_vehicles;
  const openAddVehicle = () => {
    if (vehicleLimitReached) {
      alert(`⚠️ وصلت شركتك إلى الحد الأقصى لعدد المركبات المتفق عليه في العقد (${companyInfo.total_vehicles} مركبات). لزيادة العدد يرجى التواصل مع إدارة المنصة.`);
      return;
    }
    setShowAddVehicle(true);
  };

  /* ---- HANDLERS DRIVERS ---- */
  // Reloads vehicles and drivers from DelniDB after a confirmed change
  const reloadFleet = async () => {
    const fleet = await refreshFleet(companyInfo.contract_number);
    if (fleet) {
      setVehicles(fleet.vehicles as Vehicle[]);
      setDrivers(fleet.drivers as Driver[]);
    }
  };

  const handleAddDriver = async (newDrv: Driver) => {
    const res = await apiAddDriver({
      ...newDrv,
      contract_number: companyInfo.contract_number,
      company_name: companyInfo.company_name,
    });
    if (!res.success) {
      alert("⚠️ " + res.error);
      return;
    }
    await reloadFleet();
    setShowAddDriver(false);
    alert(isAr ? "✅ تمت إضافة السائق بنجاح، وهو متاح الآن للتعيين على المركبات." : "✅ Driver added successfully.");
  };

  const handleUpdateDriver = async (updated: Driver) => {
    const res = await apiUpdateDriver(updated.driver_license_number, updated);
    if (!res.success) {
      alert("⚠️ " + res.error);
      return;
    }
    await reloadFleet();
    setEditingDriver(null);
    alert(isAr ? "✅ تم تحديث بيانات السائق بنجاح." : "✅ Driver updated successfully.");
  };

  /* ---- HANDLERS VEHICLES ---- */
  // Returns an error message for the form, or null once DelniDB confirmed the save
  const handleSaveVehicle = async (veh: Vehicle, isNew: boolean, driverInfo?: { licenseNumber?: string; newDriver?: Driver }) => {
    const res = await saveVehicle({
      ...veh,
      contract_number: companyInfo.contract_number,
      company_name: companyInfo.company_name,
    }, isNew, driverInfo);
    if (!res.success) return res.error;
    await reloadFleet();
    if (isNew) setShowAddVehicle(false);
    else setEditingVehicle(null);
    return null;
  };
  const [companyCurrentPassword, setCompanyCurrentPassword] = useState("");
  const [companyNewPassword, setCompanyNewPassword] = useState("");
  const [companyConfirmPassword, setCompanyConfirmPassword] = useState("");

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyNewPassword) {
      alert("يرجى كتابة كلمة المرور الجديدة.");
      return;
    }
    if (!companyCurrentPassword) {
      alert("يرجى كتابة كلمة المرور الحالية لتأكيد أنك صاحب الحساب.");
      return;
    }
    if (companyNewPassword.length < 6) {
      alert("كلمة المرور يجب أن تتكون من 6 خانات على الأقل");
      return;
    }
    if (companyNewPassword !== companyConfirmPassword) {
      alert("كلمتا المرور غير متطابقتين، يرجى التأكد وإعادة المحاولة");
      return;
    }
    const result = await apiChangeCompanyPassword(companyInfo.contract_number, companyCurrentPassword, companyNewPassword);
    if (!result.success) {
      alert("❌ " + result.error);
      return;
    }
    setCompanyCurrentPassword("");
    setCompanyNewPassword("");
    setCompanyConfirmPassword("");
    alert("✅ تم تغيير كلمة مرور حساب الشركة بنجاح");
  };

  return (
    <DashboardShell role="transport" roleLabel="شركة نقل سياحي" userName={companyInfo.company_name} nav={nav} active={active} onNavigate={setActive}>
      {active === "overview" && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-right">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">{companyInfo.company_name}</h1>
              <p className="text-muted-foreground text-sm mt-1">
                عقد رقم: <span className="font-mono font-bold text-primary">{companyInfo.contract_number}</span> · المدينة: <b>{companyInfo.city}</b> · أدر أسطولك وسائقيك برعايتنا.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={openAddVehicle}
                className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl border border-primary text-primary font-bold text-sm bg-white hover:bg-primary/5 transition shadow-sm"
              >
                + إضافة مركبة جديدة 🚌
              </button>
              <button
                onClick={() => setShowAddDriver(true)}
                className="inline-flex items-center gap-1.5 px-4 h-11 rounded-xl bg-gradient-sea text-white font-black text-sm shadow-glow hover:-translate-y-0.5 transition"
              >
                + إضافة سائق جديد 🧑‍✈️
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard label="عدد السائقين" value={drivers.length} icon="🧑‍✈️" tone="sea" />
            <StatCard label="حجم الأسطول" value={`${vehicles.length} / ${companyInfo.total_vehicles}`} hint={`${vehicles.filter(v => v.vehicle_status === "جاهزة" || v.status === "جاهزة").length} جاهزة · ${vehicles.filter(v => v.vehicle_status === "صيانة" || v.status === "صيانة").length} صيانة`} icon="🚌" tone="clay" />
            <StatCard label="السيارات المتاحة" value={vehicles.filter(v => v.vehicle_status === "جاهزة" || v.status === "جاهزة").length} icon="🚗" tone="green" />
            <StatCard label="حالة توثيق العقد" value={companyInfo.verification_status || "موثق"} icon="📜" tone="sun" />
          </div>

          <div className="grid lg:grid-cols-3 gap-6 text-right">
            <div className="lg:col-span-2 space-y-6">
              <SectionCard title="سائقو الشركة المسجلون" action={<button onClick={() => setShowAddDriver(true)} className="text-primary text-sm font-black hover:underline">+ إضافة سائق</button>}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-right text-xs text-muted-foreground border-b border-border">
                        <th className="pb-3 font-bold">اسم السائق</th>
                        <th className="pb-3 font-bold">رقم الرخصة</th>
                        <th className="pb-3 font-bold">الهاتف</th>
                        <th className="pb-3 font-bold">المركبة المسندة</th>
                        <th className="pb-3 font-bold">حالة العمل</th>
                        <th className="pb-3 font-bold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {drivers.map((d) => (
                        <tr key={d.driver_license_number}>
                          <td className="py-3 font-bold text-foreground">{d.full_name}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{d.driver_license_number}</td>
                          <td className="py-3 text-muted-foreground">{d.phone_number}</td>
                          <td className="py-3 font-bold text-primary text-xs">{d.assigned_vehicle_plate || "غير مسند"}</td>
                          <td className="py-3">
                            <Badge tone={d.operational_status === "متاح" ? "green" : d.operational_status === "في رحلة" ? "sea" : "muted"}>
                              {d.operational_status || "متاح"}
                            </Badge>
                          </td>
                          <td className="py-3 flex items-center gap-1.5">
                            <button onClick={() => setEditingDriver(d)} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="أسطول السيارات والحافلات" action={<button onClick={openAddVehicle} className="text-primary text-sm font-black hover:underline">+ إضافة مركبة</button>}>
                <div className="grid md:grid-cols-2 gap-4">
                  {vehicles.map((v) => (
                    <div key={v.plate_number} className="p-4 rounded-2xl border border-border bg-white flex flex-col justify-between hover:border-primary/40 transition shadow-sm space-y-3 text-right">
                      <div className="flex gap-3 items-center">
                        <img src={v.vehicle_image || officeBusImg} alt={v.vehicle_type} className="w-16 h-16 rounded-xl object-cover border" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-foreground text-sm">{v.vehicle_type}</span>
                            <Badge tone={v.vehicle_status === "جاهزة" ? "green" : v.vehicle_status === "صيانة" ? "sun" : "red"}>{v.vehicle_status}</Badge>
                          </div>
                          <div className="text-xs text-primary font-bold mt-0.5">🏷️ {v.plate_number} · 👥 {v.seating_capacity} مقعد</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-xl border border-border/50">
                        🛡️ {v.insurance_details}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setEditingVehicle(v)} className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل البيانات والتأمين</button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="الرحلات المسنّدة اليوم">
                {vehicles.length === 0 ? (
                  <div className="p-6 text-center text-xs text-muted-foreground bg-muted/30 rounded-xl">
                    لا توجد رحلات مسندة حالياً. ستظهر الرحلات هنا فور اعتماد الأسطول وتعيين السائقين.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {vehicles.slice(0, 3).map((v) => {
                      const d = drivers.find((dr) => dr.assigned_vehicle_plate === v.plate_number);
                      return (
                        <div key={v.plate_number} className="p-3 rounded-xl bg-muted/50 text-right">
                          <div className="font-black text-sm text-foreground">{v.vehicle_type}</div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            🧑‍✈️ {d ? d.full_name : "بانتظار تعيين سائق"} · 🚘 لوحة: {v.plate_number}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>

              <SectionCard title="بيانات الربط مع الإدارة (العقد الرسمي)">
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-xs text-right">
                  <div className="font-black text-primary text-sm">عقد شركة النقل المعين:</div>
                  <div className="font-bold text-foreground">رقم العقد: {companyInfo.contract_number}</div>
                  <div className="text-muted-foreground font-semibold">
                    تاريخ سريان العقد: {companyInfo.contract_start_date ? String(companyInfo.contract_start_date).split("T")[0] : "ساري"} {companyInfo.contract_end_date ? `إلى ${String(companyInfo.contract_end_date).split("T")[0]}` : ""}
                  </div>
                  <p className="text-muted-foreground mt-1">تتيح هذه اللوحة إدارة كافة السيارات المسجلة برقم العقد وإسناد السائقين ورفع صور التأمين الموثقة.</p>
                </div>
              </SectionCard>
            </div>
          </div>
        </>
      )}

      {/* DRIVERS TAB */}
      {active === "drivers" && (
        <SectionCard
          title="إدارة جميع السائقين التابعين لشركة النقل"
          action={
            <button
              onClick={() => setShowAddDriver(true)}
              className="px-4 py-2 rounded-xl bg-gradient-sea text-white text-xs font-black shadow-glow"
            >
              + إضافة سائق جديد 🧑‍✈️
            </button>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right text-xs text-muted-foreground border-b border-border bg-slate-50/70">
                  <th className="py-3.5 px-3 font-black text-foreground">السائق</th>
                  <th className="py-3.5 px-3 font-black text-foreground">رقم الهاتف</th>
                  <th className="py-3.5 px-3 font-black text-foreground">رقم رخصة القيادة</th>
                  <th className="py-3.5 px-3 font-black text-foreground">الحافلة المخصصة</th>
                  <th className="py-3.5 px-3 font-black text-foreground">الحالة التشغيلية</th>
                  <th className="py-3.5 px-3 font-black text-foreground text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {drivers.map((d) => (
                  <tr key={d.driver_license_number} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-sea text-white grid place-items-center text-xs font-black shadow-xs flex-shrink-0">
                          🧑‍✈️
                        </div>
                        <div>
                          <div className="font-black text-foreground text-xs">{d.full_name}</div>
                          <div className="text-[10px] text-muted-foreground font-mono">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs font-bold text-foreground text-right" dir="ltr">
                      {d.phone_number}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded-md border border-slate-200">
                        {d.driver_license_number}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {d.assigned_vehicle_plate && d.assigned_vehicle_plate !== "غير مسند" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
                          🚌 لوحة: {d.assigned_vehicle_plate}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-bold bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-lg">
                          غير مخصصة بعد
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <Badge tone={d.operational_status === "متاح" ? "green" : d.operational_status === "في رحلة" ? "sea" : "muted"}>
                        {d.operational_status || "متاح"}
                      </Badge>
                      {(d as any).current_trip_stage && (
                        <div className="text-[10px] font-bold text-primary mt-1">🧭 مرحلة الرحلة: {(d as any).current_trip_stage}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setEditingDriver(d)}
                          className="px-3 py-1.5 bg-[#1B5A78]/10 text-[#1B5A78] hover:bg-[#1B5A78]/20 transition text-xs font-black rounded-xl cursor-pointer flex items-center gap-1 shadow-xs"
                          title="عرض وتعديل كافة البيانات"
                        >
                          <span>✏️</span>
                          <span>تعديل واطلاع</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      {/* VEHICLES TAB */}
      {active === "vehicles" && (
        <SectionCard
          title="أسطول السيارات والحافلات"
          action={
            <button
              onClick={openAddVehicle}
              className="px-4 py-2 rounded-xl bg-gradient-sea text-white text-xs font-black shadow-glow"
            >
              + إضافة مركبة جديدة 🚌
            </button>
          }
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
            {vehicles.map((v) => (
              <div key={v.plate_number} className="border border-border rounded-2xl overflow-hidden hover:shadow-soft transition flex flex-col bg-white">
                <div className="h-44 relative">
                  <img src={v.vehicle_image || officeBusImg} alt={v.vehicle_type} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge tone={v.vehicle_status === "جاهزة" ? "green" : v.vehicle_status === "صيانة" ? "sun" : "red"}>{v.vehicle_status}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-mono px-2.5 py-1 rounded-lg backdrop-blur">
                    🏷️ {v.plate_number}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground font-bold">نوع وموديل السيارة:</div>
                    <h4 className="font-black text-foreground text-base mt-0.5">{v.vehicle_type}</h4>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-bold text-primary">👥 عدد المقاعد: {v.seating_capacity} مقعد</span>
                      <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        💰 {v.daily_rate || 450} د.ل / اليوم
                      </span>
                    </div>
                    
                    <div className="mt-3 p-3 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1">
                      <div className="font-black text-foreground">🛡️ تفاصيل التأمين:</div>
                      <p className="text-muted-foreground">{v.insurance_details}</p>
                      {v.insurance_image && (
                        <div className="mt-1 flex items-center gap-1.5 text-primary text-[11px] font-bold">
                          <span>📄 صورة الوثيقة:</span>
                          <button
                            type="button"
                            onClick={() => setPreviewInsuranceDoc(v.insurance_image || "/assets/test-enhanced.jpg")}
                            className="underline hover:text-primary-dark cursor-pointer bg-transparent border-0 p-0 text-primary font-bold text-[11px]"
                          >
                            معاينة وثيقة التأمين ↗
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button onClick={() => setEditingVehicle(v)} className="flex-1 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary/20 transition">تعديل المركبة والتأمين</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* TRIPS TAB */}
      {active === "trips" && (
        <SectionCard title="الرحلات المسنّدة للشركة وسائقيها">
          {vehicles.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border">
              <span className="text-3xl block mb-2">🚌</span>
              <div className="font-bold text-sm text-foreground">لا توجد رحلات مسندة حالياً لأسطول الشركة</div>
              <div className="text-xs text-muted-foreground mt-1">ستظهر الرحلات المجدولة تلقائياً فور تعيين المركبات والسائقين على الرحلات السياحية.</div>
            </div>
          ) : (
            <div className="space-y-4 text-right">
              {vehicles.map((v, i) => {
                const d = drivers.find((dr) => dr.assigned_vehicle_plate === v.plate_number);
                return (
                  <div key={v.plate_number} className="p-4 rounded-xl border border-border flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <div className="text-xs text-muted-foreground">مركبة مسجلة #{i + 1}</div>
                      <h4 className="font-black text-foreground text-base mt-0.5">{v.vehicle_type}</h4>
                      <div className="text-xs text-muted-foreground mt-1">
                        👤 السائق: <b>{d ? d.full_name : "غير معين"}</b> · اللوحة: <b>{v.plate_number}</b> · السعة: <b>{v.seating_capacity} راكب</b>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge tone={v.vehicle_status === "جاهزة" ? "green" : "sun"}>{v.vehicle_status || "جاهزة"}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* PROFILE TAB */}
      {active === "profile" && (
        <SectionCard title="بيانات ملف شركة النقل وكلمة المرور">
          <form className="max-w-xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            {/* Note banner explaining locked fields */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <div className="font-black flex items-center gap-1.5 text-slate-900">
                <span>🔒</span>
                <span>بيانات العقد والاعتماد الرسمي (محمية ومطابقة للعقد الورقي):</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                رقم العقد، اسم الشركة، إجمالي المركبات وتواريخ سريان العقد ورقم الهاتف والبريد الإلكتروني هي بيانات رسمية معتمدة من الإدارة العامة، ولا يمكن تغييرها إلا عبر إدارة المنصة. يمكنك هنا فقط تحديث كلمة المرور الخاصة بحساب الشركة.
              </p>
            </div>

            {/* Read-only primary contract fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                  <span>رقم العقد الرسمي 🔒</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">معتمد</span>
                </label>
                <input
                  type="text"
                  value={companyInfo.contract_number}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold text-xs text-right cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                  <span>اسم الشركة الرسمي 🔒</span>
                  <span className="text-[10px] text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md font-bold">مسجل</span>
                </label>
                <input
                  type="text"
                  value={companyInfo.company_name}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">إجمالي المركبات 🔒</label>
                <input
                  type="number"
                  value={String(companyInfo.total_vehicles)}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">بداية العقد 🔒</label>
                <input
                  type="date"
                  value={companyInfo.contract_start_date ? String(companyInfo.contract_start_date).split("T")[0] : ""}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">نهاية العقد 🔒</label>
                <input
                  type="date"
                  value={companyInfo.contract_end_date ? String(companyInfo.contract_end_date).split("T")[0] : ""}
                  disabled
                  readOnly
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                />
              </div>
            </div>

            {/* Read-only Contact & Location Details */}
            <div className="pt-3 border-t border-border space-y-3">
              <div className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <span>📍</span>
                <span>بيانات المقر والتواصل (ثابتة ومعتمدة):</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">رقم هاتف التواصل الرئيسي 🔒</label>
                  <input
                    type="text"
                    value={companyInfo.phone_number}
                    disabled
                    readOnly
                    dir="ltr"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono font-bold text-xs text-right cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">البريد الإلكتروني للشركة 🔒</label>
                  <input
                    type="email"
                    value={companyInfo.email || ""}
                    disabled
                    readOnly
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">المدينة (طرابلس أو بنغازي) 🔒</label>
                  <select
                    value={companyInfo.city === "بنغازي" ? "بنغازي" : "طرابلس"}
                    disabled
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold text-xs text-right cursor-not-allowed"
                  >
                    <option value="طرابلس">طرابلس</option>
                    <option value="بنغازي">بنغازي</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 flex items-center justify-between">
                    <span>رابط موقع المقر (خرائط Google) 🔒</span>
                    {companyInfo.address && companyInfo.address.startsWith("http") && (
                      <a
                        href={companyInfo.address}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        معاينة الخريطة 📍
                      </a>
                    )}
                  </label>
                  <input
                    type="text"
                    value={companyInfo.address}
                    disabled
                    readOnly
                    placeholder="https://maps.google.com/..."
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-mono text-xs text-right cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Editable Password Section */}
            <div className="p-4 rounded-2xl border-2 border-primary/20 bg-primary/5 space-y-3 pt-4">
              <div className="text-xs font-black text-primary flex items-center gap-1.5">
                <span>🔑</span>
                <span>تغيير كلمة مرور حساب شركة النقل:</span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground mb-1 block">كلمة المرور الحالية</label>
                <input
                  type="password"
                  value={companyCurrentPassword}
                  onChange={(e) => setCompanyCurrentPassword(e.target.value)}
                  placeholder="اكتب كلمة المرور الحالية..."
                  className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={companyNewPassword}
                    onChange={(e) => setCompanyNewPassword(e.target.value)}
                    placeholder="اكتب كلمة مرور جديدة..."
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-foreground mb-1 block">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={companyConfirmPassword}
                    onChange={(e) => setCompanyConfirmPassword(e.target.value)}
                    placeholder="أعد كتابة كلمة المرور..."
                    className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>

            <button className="px-6 h-11 rounded-xl bg-gradient-sea text-white font-black text-sm shadow-glow cursor-pointer hover:opacity-95 transition">
              تغيير كلمة المرور ✓
            </button>
          </form>
        </SectionCard>
      )}

      {/* ===== MODALS ===== */}
      {showAddDriver && (
        <DriverModal
          title="إضافة سائق جديد لشركة النقل"
          contractNumber={companyInfo.contract_number}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setShowAddDriver(false)}
          onSave={handleAddDriver}
        />
      )}
      {editingDriver && (
        <DriverModal
          title={`تعديل بيانات السائق: ${editingDriver.full_name}`}
          driver={editingDriver}
          contractNumber={companyInfo.contract_number}
          vehicles={vehicles}
          drivers={drivers}
          onClose={() => setEditingDriver(null)}
          onSave={handleUpdateDriver}
        />
      )}

      {showAddVehicle && (
        <VehicleModal
          title="إضافة مركبة جديدة لأسطول الشركة"
          contractNumber={companyInfo.contract_number}
          drivers={drivers}
          vehicles={vehicles}
          onClose={() => setShowAddVehicle(false)}
          onSave={(v, driverInfo) => handleSaveVehicle(v, true, driverInfo)}
        />
      )}
      {editingVehicle && (
        <VehicleModal
          title={`تعديل المركبة: ${editingVehicle.plate_number}`}
          vehicle={editingVehicle}
          contractNumber={companyInfo.contract_number}
          drivers={drivers}
          vehicles={vehicles}
          onClose={() => setEditingVehicle(null)}
          onSave={(v, driverInfo) => handleSaveVehicle(v, false, driverInfo)}
        />
      )}

      {previewInsuranceDoc && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
          onClick={() => setPreviewInsuranceDoc(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#003580] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span className="font-black text-sm">معاينة ورقة وثيقة التأمين</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewInsuranceDoc(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-[72vh] overflow-auto flex items-center justify-center bg-slate-100">
              <img
                src={previewInsuranceDoc}
                alt="وثيقة التأمين"
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/test-enhanced.jpg";
                }}
              />
            </div>
            <div className="p-3.5 bg-white border-t border-slate-200 flex justify-end items-center">
              <button
                type="button"
                onClick={() => setPreviewInsuranceDoc(null)}
                className="px-4 py-1.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

/* ============ DRIVER MODAL (DelniDB: drivers) ============ */
function DriverModal({
  title,
  driver,
  contractNumber,
  vehicles,
  drivers = [],
  onClose,
  onSave,
}: {
  title: string;
  driver?: Driver;
  contractNumber: string;
  vehicles: Vehicle[];
  drivers?: Driver[];
  onClose: () => void;
  onSave: (d: Driver) => void | Promise<void>;
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  const [lic, setLic] = useState(driver?.driver_license_number || "");
  const [name, setName] = useState(driver?.full_name || "");
  const [phone, setPhone] = useState(driver?.phone_number || "");
  const [expire, setExpire] = useState(driver?.license_date_valid || "2029-12-31");
  const [nid, setNid] = useState(driver?.national_id_or_passport || "");
  const [email, setEmail] = useState(driver?.email || "");
  // Set only when the driver is created; afterwards only the driver can change it
  const [pass, setPass] = useState("");
  const [assignedPlate, setAssignedPlate] = useState(driver?.assigned_vehicle_plate || "");
  const [operationalStatus, setOperationalStatus] = useState<Driver["operational_status"]>(driver?.operational_status || "متاح");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !nid.trim() || !email.trim() || !lic.trim()) {
      return alert(isAr ? "يرجى تعبئة كافة الحقول المطلوبة لضمان صحة البيانات" : "Please fill all required fields");
    }

    // 1. License Number validation: NUMBERS ONLY
    if (!/^\d+$/.test(lic.trim())) {
      return alert(isAr ? "رقم رخصة القيادة يجب أن يتكون من أرقام فقط" : "Driver license number must contain digits only");
    }

    // Check duplicate primary key
    if (!driver && drivers.some(d => d.driver_license_number === lic.trim())) {
      return alert(isAr ? "رقم رخصة القيادة هذا مسجل مسبقاً لسائق آخر" : "This license number is already registered for another driver");
    }

    // 2. National ID validation: NUMBERS ONLY & EXACTLY 12 DIGITS
    if (!/^\d{12}$/.test(nid.trim())) {
      return alert(isAr ? "الرقم الوطني للسائق يجب أن يتكون من 12 رقماً بالضبط (أرقام فقط)" : "National ID must be exactly 12 digits");
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return alert(isAr ? "يرجى إدخال بريد إلكتروني صحيح" : "Please enter a valid email address");
    }
    if (!driver && pass.trim().length < 6) {
      return alert(isAr ? "كلمة مرور السائق مطلوبة (6 خانات على الأقل)" : "Driver password is required (at least 6 characters)");
    }

    setIsSubmitting(true);
    try {
      await onSave({
        driver_license_number: lic.trim(),
        full_name: name.trim(),
        phone_number: phone.trim(),
        license_date_valid: expire,
        national_id_or_passport: nid.trim(),
        email: email.trim(),
        ...(driver ? {} : { password: pass }),
        contract_number: contractNumber,
        assigned_vehicle_plate: driver ? (assignedPlate.trim() || null) : null,
        account_status: driver?.account_status || "نشط",
        operational_status: operationalStatus,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <Field label={isAr ? "الاسم الكامل للسائق *" : "Driver Full Name *"} value={name} onChange={setName} placeholder={isAr ? "مثال: صالح الورفلي" : "e.g., Saleh Al-Warfali"} required />
          <LibyanPhoneField label={isAr ? "رقم الهاتف *" : "Phone Number *"} value={phone} onChange={setPhone} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">
              {isAr ? "رقم رخصة القيادة (أرقام فقط) *" : "Driver License (Digits only) *"}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={lic}
              onChange={(e) => setLic(e.target.value.replace(/\D/g, ""))}
              placeholder="مثال: 77452"
              required
              disabled={Boolean(driver)}
              title={driver ? "رقم الرخصة هو معرّف السائق ولا يمكن تغييره" : undefined}
              className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed"
            />
          </div>
          <Field label={isAr ? "تاريخ صلاحية الرخصة *" : "License Expiry Date *"} type="date" value={expire} onChange={setExpire} required />
        </div>
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">
            {isAr ? "الرقم الوطني للسائق (12 رقماً) *" : "National ID (12 Digits) *"}
          </label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]{12}"
            maxLength={12}
            value={nid}
            onChange={(e) => setNid(e.target.value.replace(/\D/g, ""))}
            placeholder="12 رقماً (مثال: 119900123456)"
            required
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
          />
        </div>
        
        {driver && (
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">
              {isAr ? "المركبة المخصصة للسائق (لكل حافلة سائق مخصص)" : "Assigned Vehicle (Dedicated Driver)"}
            </label>
            <select
              value={assignedPlate}
              onChange={e => setAssignedPlate(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold outline-none focus:border-primary text-right"
            >
              <option value="">{isAr ? "-- بدون حافلة مخصصة --" : "-- None --"}</option>
              {vehicles.map(v => {
                const otherDriver = drivers.find(d => d.assigned_vehicle_plate === v.plate_number && d.driver_license_number !== driver.driver_license_number);
                if (otherDriver) {
                  return (
                    <option key={v.plate_number} value={v.plate_number} disabled>
                      {v.vehicle_type} - لوحة: {v.plate_number} (مخصصة للسائق: {otherDriver.full_name})
                    </option>
                  );
                }
                return (
                  <option key={v.plate_number} value={v.plate_number}>
                    {v.vehicle_type} - لوحة: {v.plate_number} {assignedPlate === v.plate_number ? "(الحافلة الحالية)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className={`grid gap-2 ${driver ? "grid-cols-1" : "grid-cols-2"}`}>
          <Field label={isAr ? "البريد الإلكتروني *" : "Email Address *"} type="email" value={email} onChange={setEmail} placeholder="driver@dalni.ly" required />
          {!driver && (
            <Field label={isAr ? "كلمة المرور (تُحدد مرة واحدة عند الإنشاء) *" : "Password (set once) *"} type="password" value={pass} onChange={setPass} required />
          )}
        </div>
        {driver && (
          <p className="text-[10px] text-muted-foreground">🔒 كلمة مرور السائق لا تُعدّل من هنا؛ يغيّرها السائق بنفسه من لوحته.</p>
        )}

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">{isAr ? "الحالة التشغيلية *" : "Operational Status *"}</label>
          <select value={operationalStatus || "متاح"} onChange={e => setOperationalStatus(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right">
            <option value="متاح">{isAr ? "متاح وجاهز للقيادة" : "Available & Ready"}</option>
            <option value="في رحلة">{isAr ? "في رحلة حالياً" : "On a Trip"}</option>
            <option value="إجازة">{isAr ? "في إجازة" : "On Leave"}</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} disabled={isSubmitting} className="px-4 h-10 rounded-xl border font-black text-xs cursor-pointer">{isAr ? "إلغاء" : "Cancel"}</button>
          <button type="submit" disabled={isSubmitting} className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow cursor-pointer disabled:opacity-50">
            {isSubmitting ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ بيانات السائق" : "Save Driver Details")}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============ VEHICLE MODAL (DelniDB: vehicles) ============ */
const VEHICLE_CATEGORIES = ["حافلة سياحية", "ميني باص", "باص VIP"];

function VehicleModal({
  title,
  vehicle,
  contractNumber,
  drivers = [],
  vehicles = [],
  onClose,
  onSave,
}: {
  title: string;
  vehicle?: Vehicle;
  contractNumber: string;
  drivers?: Driver[];
  vehicles?: Vehicle[];
  onClose: () => void;
  onSave: (v: Vehicle, driverInfo?: { licenseNumber?: string; newDriver?: Driver }) => Promise<string | null>;
}) {
  const { language } = useLanguage();
  const isAr = language === 'ar';

  // Empty fields by default when adding a new vehicle (only fill if editing existing vehicle)
  const [plate, setPlate] = useState(vehicle?.plate_number || "");
  const [type, setType] = useState(vehicle?.vehicle_type || "");
  const [seats, setSeats] = useState(vehicle?.seating_capacity ? String(vehicle.seating_capacity) : "15");
  const [dailyRate, setDailyRate] = useState(vehicle?.daily_rate ? String(vehicle.daily_rate) : "");
  const [category, setCategory] = useState(VEHICLE_CATEGORIES.includes(vehicle?.category || "") ? vehicle!.category! : "حافلة سياحية");
  const [status, setStatus] = useState<Vehicle["vehicle_status"]>(vehicle?.vehicle_status || "جاهزة");
  const [insuranceImg, setInsuranceImg] = useState(vehicle?.insurance_image || "");
  const [vehicleImg, setVehicleImg] = useState(vehicle?.vehicle_image || (vehicle ? officeBusImg : ""));

  // Refs for seamless Enter-key navigation between inputs
  const plateRef = useRef<HTMLInputElement>(null);
  const seatsRef = useRef<HTMLSelectElement>(null);
  const typeRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const rateRef = useRef<HTMLInputElement>(null);
  const driverRef = useRef<HTMLSelectElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);

  const handleKeyDownNext = (nextRef: React.RefObject<HTMLInputElement | HTMLSelectElement | null>) => (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      nextRef.current?.focus();
    }
  };

  // Driver Assignment: Check which drivers are unassigned or assigned to this vehicle
  const isDriverAvailable = (d: Driver) => {
    if (vehicle && d.assigned_vehicle_plate === vehicle.plate_number) return true;
    if (!d.assigned_vehicle_plate) return true;
    const p = String(d.assigned_vehicle_plate).trim();
    return p === "" || p === "غير مسند" || p === "غير معين" || p === "none" || p === "null" || p === "غير مسندة";
  };

  // Dedicated driver policy: each vehicle has a dedicated driver and cannot repeat
  const selectableDrivers = drivers.filter(isDriverAvailable);

  const initiallyAssigned = drivers.find(d => d.assigned_vehicle_plate === vehicle?.plate_number);
  const [selectedDriverLic, setSelectedDriverLic] = useState(
    initiallyAssigned?.driver_license_number || ""
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanPlate = plate.trim();
    if (!cleanPlate) {
      setErrorMsg(isAr ? "يرجى إدخال رقم اللوحة المعدنية للمركبة." : "Please enter plate number.");
      plateRef.current?.focus();
      return;
    }

    // Plate number must be numbers only
    if (!/^\d+$/.test(cleanPlate)) {
      setErrorMsg(isAr ? "رقم اللوحة المعدنية للمركبة يجب أن يتكون من أرقام فقط." : "Plate number must contain digits only.");
      plateRef.current?.focus();
      return;
    }

    // Check duplicate plate
    if (!vehicle && vehicles.some(v => v.plate_number === cleanPlate)) {
      setErrorMsg(isAr ? "رقم اللوحة المعدنية مسجل مسبقاً لمركبة أخرى في الأسطول." : "This plate number already exists.");
      plateRef.current?.focus();
      return;
    }

    if (!type.trim()) {
      setErrorMsg(isAr ? "يرجى إدخال نوع وموديل المركبة." : "Please enter vehicle make and model.");
      typeRef.current?.focus();
      return;
    }
    const seatsNum = Number(seats) || 15;
    if (seatsNum !== 15 && seatsNum !== 25 && seatsNum !== 50) {
      setErrorMsg(isAr ? "سعة الركاب يجب أن تكون 15 أو 25 أو 50 راكب فقط." : "Capacity must be either 15, 25, or 50 passengers.");
      return;
    }
    const rateNum = Number(dailyRate);
    if (isNaN(rateNum) || rateNum <= 0) {
      setErrorMsg(isAr ? "سعر التأجير اليومي يجب أن يكون رقماً أكبر من 0." : "Daily rate must be greater than 0.");
      rateRef.current?.focus();
      return;
    }

    setIsSaving(true);
    const saveError = await onSave({
      plate_number: cleanPlate,
      contract_number: contractNumber,
      vehicle_type: type.trim(),
      seating_capacity: seatsNum,
      daily_rate: rateNum,
      category,
      vehicle_status: status,
      insurance_image: insuranceImg,
      vehicle_image: vehicleImg,
    }, { licenseNumber: selectedDriverLic });
    setIsSaving(false);
    if (saveError) setErrorMsg((isAr ? "لم يتم حفظ المركبة: " : "Vehicle was not saved: ") + saveError);
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3.5 text-right" onSubmit={handleSubmit}>
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-2 animate-in fade-in">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">
              {isAr ? "رقم اللوحة المعدنية (أرقام فقط) *" : "Plate Number (Digits only) *"}
            </label>
            <input
              ref={plateRef}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={plate}
              onChange={(e) => setPlate(e.target.value.replace(/\D/g, ""))}
              onKeyDown={handleKeyDownNext(seatsRef)}
              placeholder="مثال: 58214"
              required
              className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">
              {isAr ? "عدد ركاب المركبة (سعة محددة) *" : "Passenger Capacity *"}
            </label>
            <select
              ref={seatsRef}
              value={seats}
              onChange={(e) => setSeats(e.target.value)}
              onKeyDown={handleKeyDownNext(typeRef)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-bold text-right outline-none focus:border-primary cursor-pointer"
            >
              <option value="15">👥 15 راكب (فان / ميني باص صغير)</option>
              <option value="25">👥 25 راكب (ميني باص سياحي متوسط)</option>
              <option value="50">👥 50 راكب (حافلة سياحية كبرى)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field
            inputRef={typeRef}
            label={isAr ? "نوع وموديل السيارة *" : "Vehicle Make & Model *"}
            value={type}
            onChange={setType}
            onKeyDown={handleKeyDownNext(categoryRef)}
            placeholder={isAr ? "مثال: تويوتا كوستر 2025" : "e.g., Toyota Coaster 2025"}
            required
          />
          <div>
            <label className="text-xs font-bold text-foreground mb-1 block">{isAr ? "فئة المركبة *" : "Vehicle Category *"}</label>
            <select
              ref={categoryRef}
              value={category}
              onChange={e => setCategory(e.target.value)}
              onKeyDown={handleKeyDownNext(rateRef)}
              className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary cursor-pointer"
            >
              <option value="حافلة سياحية">{isAr ? "حافلة سياحية" : "Tourist Bus"}</option>
              <option value="ميني باص">{isAr ? "ميني باص" : "Mini Bus"}</option>
              <option value="باص VIP">{isAr ? "باص VIP" : "VIP Bus"}</option>
            </select>
          </div>
        </div>

        <div>
          <Field
            inputRef={rateRef}
            label={isAr ? "سعر اليوم الواحد (د.ل) *" : "Daily Rate (LYD) *"}
            type="number"
            value={dailyRate}
            onChange={setDailyRate}
            onKeyDown={handleKeyDownNext(driverRef)}
            placeholder="مثال: 450"
            required
          />
        </div>
        
        {/* DRIVER ASSIGNMENT SECTION */}
        <div className="p-3.5 rounded-2xl border-2 border-[#1B5A78]/30 bg-[#1B5A78]/5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#1B5A78] flex items-center gap-1.5">
              🧑‍✈️ {isAr ? "تعيين سائق مخصص للمركبة (سائق مخصص لا يتكرر):" : "Assign Dedicated Driver:"}
            </span>
            <span className="text-[11px] font-bold text-slate-500">
              {selectableDrivers.length} {isAr ? "سائق متاح" : "available"}
            </span>
          </div>

          {selectableDrivers.length > 0 ? (
            <div>
              <select
                ref={driverRef}
                value={selectedDriverLic}
                onChange={(e) => setSelectedDriverLic(e.target.value)}
                onKeyDown={handleKeyDownNext(statusRef)}
                className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold text-right outline-none focus:border-[#1B5A78]"
              >
                <option value="">{isAr ? "-- بدون تعيين سائق حالياً --" : "-- No Driver Assigned --"}</option>
                {selectableDrivers.map((d) => (
                  <option key={d.driver_license_number} value={d.driver_license_number}>
                    {d.full_name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">
                {isAr ? "✓ سياسة التخصيص: لكل حافلة سائق مخصص واحد فقط ولا يتكرر لمركبة أخرى." : "Dedicated policy: Each vehicle has a dedicated driver only."}
              </p>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold space-y-1">
              <div>⚠️ {isAr ? "كافة السائقين مخصصون لحافلات أخرى بالفعل!" : "All drivers are dedicated to other vehicles!"}</div>
              <p className="text-[11px] font-normal text-amber-800 leading-relaxed">
                {isAr
                  ? "وفقاً للنظام: لكل حافلة سائق مخصص لا يتكرر. لإسناد سائق لهذه المركبة، يرجى إضافة سائق جديد أولاً من تبويب (السائقون المسجلون)."
                  : "Each vehicle has a dedicated driver. Please add a driver from the Drivers tab first."}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">{isAr ? "حالة السيارة *" : "Vehicle Status *"}</label>
          <select
            ref={statusRef}
            value={status}
            onChange={e => setStatus(e.target.value as any)}
            className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right outline-none focus:border-primary cursor-pointer"
          >
            <option value="جاهزة">{isAr ? "جاهزة للرحلات" : "Ready for Trips"}</option>
            <option value="في رحلة">{isAr ? "في رحلة حالية" : "On a Trip"}</option>
            <option value="صيانة">{isAr ? "قيد الصيانة" : "Under Maintenance"}</option>
            <option value="خارج الخدمة">{isAr ? "خارج الخدمة" : "Out of Service"}</option>
          </select>
        </div>

        <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
          <label className="text-xs font-black text-foreground block">{isAr ? "🛡️ إضافة صورة وثيقة التأمين أو كتيّب السيارة" : "🛡️ Add Insurance Document or Vehicle Booklet Image"}</label>
          <ImageFilePicker label={isAr ? "صورة الوثيقة أو الكتيّب" : "Document or Booklet Image"} value={insuranceImg} onChange={setInsuranceImg} />
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label={isAr ? "صورة السيارة" : "Vehicle Image"} value={vehicleImg} onChange={setVehicleImg} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs hover:bg-slate-50 transition cursor-pointer">{isAr ? "إلغاء" : "Cancel"}</button>
          <button type="submit" disabled={isSaving} className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow hover:opacity-95 transition cursor-pointer disabled:opacity-50">{isSaving ? (isAr ? "جارٍ الحفظ..." : "Saving...") : (isAr ? "حفظ وتعيين المركبة بالسائق ✓" : "Save Vehicle with Driver ✓")}</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---- HELPER COMPONENTS ---- */
function ImageFilePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so choosing the same file again still triggers onChange
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      if (!src) return;

      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 1200;
        let w = img.width;
        let h = img.height;
        if (w > h && w > MAX_DIM) {
          h = Math.round((h * MAX_DIM) / w);
          w = MAX_DIM;
        } else if (h > MAX_DIM) {
          w = Math.round((w * MAX_DIM) / h);
          h = MAX_DIM;
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL("image/jpeg", 0.85);
          onChange(compressed);
        } else {
          onChange(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const isBase64 = value && value.startsWith("data:");

  return (
    <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1.5 text-right">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-foreground">{label}</label>
        {value && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-600 font-bold">✓ تم التحميل والحفظ</span>
            <button
              type="button"
              onClick={() => onChange("")}
              className="text-[10px] text-red-500 hover:text-red-700 font-bold underline cursor-pointer"
            >
              حذف
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        {value ? (
          <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-primary/40 shadow-xs flex-shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-muted border border-dashed border-border grid place-items-center text-xs text-muted-foreground flex-shrink-0">📷</div>
        )}
        <div className="flex-1 space-y-1">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-sea text-white text-xs font-black cursor-pointer hover:opacity-90 transition shadow-soft">
            📁 اختيار صورة من الجهاز
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <input
            type="text"
            value={isBase64 ? "صورة مخصصة مرفوعة من الجهاز ✓" : value}
            onChange={e => onChange(e.target.value)}
            placeholder="أو ضع رابط الصورة..."
            readOnly={Boolean(isBase64)}
            className="w-full h-8 px-2 text-[10px] rounded-lg border border-border bg-white outline-none font-mono text-right"
          />
        </div>
      </div>
    </div>
  );
}

function ModalShell({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm grid place-items-center p-4 overflow-y-auto" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg bg-white rounded-3xl shadow-glow overflow-hidden my-6">
        <div className="p-4 bg-gradient-sea text-white flex justify-between items-center">
          <h3 className="text-base font-black">{title}</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center text-xs transition">✕</button>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

function LibyanPhoneField({ label, value, onChange, onKeyDown, inputRef }: { label: string; value: string; onChange: (v: string) => void; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; inputRef?: React.Ref<HTMLInputElement> }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    onChange(val);
    setError(val && !/^09\d{8}$/.test(val) ? "يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)" : "");
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        ref={inputRef}
        type="tel"
        value={value}
        onChange={e => handleChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="09..."
        className={`w-full h-10 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${error ? "border-red-500" : "border-border focus:border-primary"}`}
      />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, required, onKeyDown, inputRef }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; inputRef?: React.Ref<HTMLInputElement> }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        ref={inputRef}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        required={required}
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
      />
    </div>
  );
}
