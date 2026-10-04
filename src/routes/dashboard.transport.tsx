import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import destUbari from "@/assets/dest-ubari.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import officeBusImg from "@/assets/office-bus.jpg";
import privateTripImg from "@/assets/private-trip.jpg";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/dashboard/transport")({
  head: () => ({
    meta: [
      { title: "لوحة شركة النقل | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TransportDashboard,
});

export type Driver = {
  driver_license_number: string;
  name_full: string;
  number_phone: string;
  license_date_vaild: string;
  national_id_or_passport: string;
  email: string;
  pass: string;
  company_id: string;
  company_name: string;
  assigned_vehicle_plate: string;
  status: "متاح" | "في رحلة" | "إجازة";
};

export type Vehicle = {
  numbe_plater: string;
  company_id: string;
  company_name: string;
  typ_vehiclee: string;
  capacit_seatingy: number;
  daily_rate?: number;
  statu_vehicles: "جاهزة" | "في رحلة" | "صيانة" | "خارج الخدمة";
  vehicle_image: string;
  insurance_details: string;
  insurance_image?: string;
};

function TransportDashboard() {
  const [active, setActive] = useState("overview");
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Profile state
  const [companyInfo, setCompanyInfo] = useState({
    contract_number: "CN-2026-01",
    name_company: "شركة الصحراء للنقل السياحي",
    number_phone: "0911234567",
    address: "طرابلس - طريق الشط، بالقرب من الميناء",
    email: "sahara@dalni.ly",
    pass: "123456"
  });

  // Drivers state (Database Schema: Drivers table)
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      driver_license_number: "LB-88291",
      name_full: "علي التارقي",
      number_phone: "0912223344",
      license_date_vaild: "2029-12-10",
      national_id_or_passport: "119900223344",
      email: "ali@dalni.ly",
      pass: "ali2026",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      assigned_vehicle_plate: "طرابلس 4517",
      status: "متاح"
    },
    {
      driver_license_number: "LB-77452",
      name_full: "مفتاح الفزاني",
      number_phone: "0923334455",
      license_date_vaild: "2028-05-14",
      national_id_or_passport: "119850334455",
      email: "miftah@dalni.ly",
      pass: "miftah20",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      assigned_vehicle_plate: "طرابلس 8291",
      status: "في رحلة"
    },
    {
      driver_license_number: "LB-99381",
      name_full: "أنور الترهوني",
      number_phone: "0915556677",
      license_date_vaild: "2030-08-22",
      national_id_or_passport: "119920112233",
      email: "anwar@dalni.ly",
      pass: "anwar99",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      assigned_vehicle_plate: "بنغازي 3382",
      status: "متاح"
    }
  ]);

  // Vehicles state (Database Schema: Vehicles table)
  const [vehicles, setVehicles] = useState<Vehicle[]>([
    {
      numbe_plater: "طرابلس 8291",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      typ_vehiclee: "تويوتا كوستر 2025",
      capacit_seatingy: 22,
      daily_rate: 450,
      statu_vehicles: "جاهزة",
      insurance_details: "وثيقة تأمين شامل رقم INS-99210 سارية حتى سبتمبر 2027",
      insurance_image: "/assets/ai_city.jpg",
      vehicle_image: officeBusImg
    },
    {
      numbe_plater: "طرابلس 4517",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      typ_vehiclee: "هيونداي H1 VIP 2024",
      capacit_seatingy: 12,
      daily_rate: 350,
      statu_vehicles: "جاهزة",
      insurance_details: "تأمين ركاب ومسافرين رقم INS-44120 ساري حتى يناير 2028",
      insurance_image: "/assets/ai_city.jpg",
      vehicle_image: privateTripImg
    },
    {
      numbe_plater: "بنغازي 3382",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      typ_vehiclee: "ميرسيدس سبرنتر 2024",
      capacit_seatingy: 15,
      daily_rate: 500,
      statu_vehicles: "جاهزة",
      insurance_details: "تأمين شامل وبطاقة برتقالية دولية سارية حتى ديسمبر 2026",
      insurance_image: "/assets/ai_desert.jpg",
      vehicle_image: destAcacus
    },
    {
      numbe_plater: "بنغازي 1298",
      company_id: "CN-2026-01",
      company_name: "شركة الصحراء للنقل",
      typ_vehiclee: "تويوتا لاندكروزر 4x4",
      capacit_seatingy: 7,
      daily_rate: 400,
      statu_vehicles: "صيانة",
      insurance_details: "تأمين صحاري وسفاري رقم INS-88120 ساري حتى مارس 2027",
      insurance_image: "/assets/ai_desert.jpg",
      vehicle_image: destUbari
    }
  ]);

  const { language } = useLanguage();
  const isAr = language === 'ar';

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "📊" },
    { id: "drivers", label: isAr ? "السائقون المسجلون" : "Drivers", icon: "🧑‍✈️", badge: drivers.length },
    { id: "vehicles", label: isAr ? "الأسطول والسيارات" : "Fleet & Vehicles", icon: "🚌", badge: vehicles.length },
    { id: "trips", label: isAr ? "الرحلات المسنّدة" : "Assigned Tours", icon: "🧭" },
    { id: "profile", label: isAr ? "بيانات الشركة" : "Company Profile", icon: "🏢" },
  ];

  /* ---- HANDLERS DRIVERS ---- */
  const handleAddDriver = (newDrv: Driver) => {
    setDrivers([...drivers, newDrv]);
    setShowAddDriver(false);
  };
  const handleUpdateDriver = (updated: Driver) => {
    setDrivers(drivers.map(d => d.driver_license_number === updated.driver_license_number ? updated : d));
    setEditingDriver(null);
  };
  const handleDeleteDriver = (lic: string) => {
    if (confirm("هل أنت متأكد من حذف حساب هذا السائق من الشركة؟")) {
      setDrivers(drivers.filter(d => d.driver_license_number !== lic));
    }
  };

  /* ---- HANDLERS VEHICLES ---- */
  const handleAddVehicle = (newVeh: Vehicle) => {
    setVehicles([...vehicles, newVeh]);
    setShowAddVehicle(false);
  };
  const handleUpdateVehicle = (updated: Vehicle) => {
    setVehicles(vehicles.map(v => v.numbe_plater === updated.numbe_plater ? updated : v));
    setEditingVehicle(null);
  };
  const handleDeleteVehicle = (plate: string) => {
    if (confirm("هل تريد حذف هذه المركبة نهائياً من أسطول الشركة؟")) {
      setVehicles(vehicles.filter(v => v.numbe_plater !== plate));
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم تحديث بيانات الشركة والرابط بقاعدة البيانات بنجاح ✓");
  };

  return (
    <DashboardShell role="transport" roleLabel="شركة نقل سياحي" userName={companyInfo.name_company.split(" ")[0]} nav={nav} active={active} onNavigate={setActive}>
      {active === "overview" && (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 text-right">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-foreground">{companyInfo.name_company}</h1>
              <p className="text-muted-foreground text-sm mt-1">عقد رقم: <span className="font-mono font-bold text-primary">{companyInfo.contract_number}</span> · أدر أسطولك وسائقيك برعايتنا.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddVehicle(true)}
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
            <StatCard label="حجم الأسطول" value={vehicles.length} hint={`${vehicles.filter(v => v.statu_vehicles === "جاهزة").length} جاهزة · ${vehicles.filter(v => v.statu_vehicles === "صيانة").length} صيانة`} icon="🚌" tone="clay" />
            <StatCard label="رحلات نشطة" value={3} icon="🧭" tone="green" />
            <StatCard label="إيرادات الشهر" value="د.ل 42,300" icon="💰" tone="sun" />
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
                        <th className="pb-3 font-bold">الحالة</th>
                        <th className="pb-3 font-bold">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {drivers.map((d) => (
                        <tr key={d.driver_license_number}>
                          <td className="py-3 font-bold text-foreground">{d.name_full}</td>
                          <td className="py-3 font-mono text-xs text-muted-foreground">{d.driver_license_number}</td>
                          <td className="py-3 text-muted-foreground">{d.number_phone}</td>
                          <td className="py-3 font-bold text-primary text-xs">{d.assigned_vehicle_plate}</td>
                          <td className="py-3">
                            <Badge tone={d.status === "متاح" ? "green" : d.status === "في رحلة" ? "sea" : "muted"}>
                              {d.status}
                            </Badge>
                          </td>
                          <td className="py-3 flex items-center gap-1.5">
                            <button onClick={() => setEditingDriver(d)} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                            <button onClick={() => handleDeleteDriver(d.driver_license_number)} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard title="أسطول السيارات والسيارات المسجلة" action={<button onClick={() => setShowAddVehicle(true)} className="text-primary text-sm font-black hover:underline">+ إضافة مركبة</button>}>
                <div className="grid md:grid-cols-2 gap-4">
                  {vehicles.map((v) => (
                    <div key={v.numbe_plater} className="p-4 rounded-2xl border border-border bg-white flex flex-col justify-between hover:border-primary/40 transition shadow-sm space-y-3 text-right">
                      <div className="flex gap-3 items-center">
                        <img src={v.vehicle_image} alt={v.typ_vehiclee} className="w-16 h-16 rounded-xl object-cover border" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-black text-foreground text-sm">{v.typ_vehiclee}</span>
                            <Badge tone={v.statu_vehicles === "جاهزة" ? "green" : v.statu_vehicles === "صيانة" ? "sun" : "red"}>{v.statu_vehicles}</Badge>
                          </div>
                          <div className="text-xs text-primary font-bold mt-0.5">🏷️ {v.numbe_plater} · 👥 {v.capacit_seatingy} مقعد</div>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground bg-muted/40 p-2 rounded-xl border border-border/50">
                        🛡️ {v.insurance_details}
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button onClick={() => setEditingVehicle(v)} className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل البيانات والتأمين</button>
                        <button onClick={() => handleDeleteVehicle(v.numbe_plater)} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <div className="space-y-6">
              <SectionCard title="الرحلات المسنّدة اليوم">
                <div className="space-y-3">
                  {[
                    { r: "طرابلس ← لبدة", t: "9:00 ص", drv: "علي التارقي", v: "طرابلس 4517" },
                    { r: "طرابلس ← غدامس", t: "8:00 ص", drv: "أنور الترهوني", v: "بنغازي 3382" },
                    { r: "بنغازي ← شحات", t: "9:30 ص", drv: "مفتاح الفزاني", v: "طرابلس 8291" },
                  ].map((t) => (
                    <div key={t.r} className="p-3 rounded-xl bg-muted/50 text-right">
                      <div className="font-black text-sm text-foreground">{t.r}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">🗓️ {t.t} · 🧑‍✈️ {t.drv} (لوحة: {t.v})</div>
                    </div>
                  ))}
                </div>
              </SectionCard>

              <SectionCard title="بيانات الربط مع الإدارة">
                <div className="p-3.5 rounded-xl bg-primary/5 border border-primary/20 space-y-1 text-xs text-right">
                  <div className="font-black text-primary text-sm">عقد شركة النقل المعين:</div>
                  <div className="font-bold text-foreground">رقم العقد: {companyInfo.contract_number}</div>
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
          title="إدارة جميع السائقين التابعين لشركة النقل (إضافة، تعديل، حذف)"
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
                <tr className="text-right text-xs text-muted-foreground border-b border-border">
                  <th className="pb-3 font-bold">الاسم الكامل</th>
                  <th className="pb-3 font-bold">الهاتف</th>
                  <th className="pb-3 font-bold">رقم الرخصة والصلاحية</th>
                  <th className="pb-3 font-bold">الهوية/الجواز</th>
                  <th className="pb-3 font-bold">البريد الإلكتروني</th>
                  <th className="pb-3 font-bold">كلمة المرور</th>
                  <th className="pb-3 font-bold">المركبة المسندة</th>
                  <th className="pb-3 font-bold">الحالة</th>
                  <th className="pb-3 font-bold">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {drivers.map((d) => (
                  <tr key={d.driver_license_number}>
                    <td className="py-3 font-bold text-foreground">{d.name_full}</td>
                    <td className="py-3 font-mono text-xs text-muted-foreground">{d.number_phone}</td>
                    <td className="py-3 text-muted-foreground">
                      <div className="font-mono font-bold text-foreground text-xs">{d.driver_license_number}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">ينتهي: {d.license_date_vaild}</div>
                    </td>
                    <td className="py-3 text-muted-foreground font-mono text-xs">{d.national_id_or_passport}</td>
                    <td className="py-3 text-muted-foreground text-xs">{d.email}</td>
                    <td className="py-3 font-mono text-xs bg-muted/40 px-2 rounded">{d.pass}</td>
                    <td className="py-3 text-primary font-bold text-xs">{d.assigned_vehicle_plate}</td>
                    <td className="py-3">
                      <Badge tone={d.status === "متاح" ? "green" : d.status === "في رحلة" ? "sea" : "muted"}>
                        {d.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditingDriver(d)} className="px-3 py-1 bg-primary/10 text-primary text-xs font-black rounded-lg">تعديل</button>
                        <button onClick={() => handleDeleteDriver(d.driver_license_number)} className="px-3 py-1 bg-red-50 text-red-600 text-xs font-black rounded-lg">حذف</button>
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
          title="أسطول السيارات والحافلات (جدول المركبات - الباب الرابع)"
          action={
            <button
              onClick={() => setShowAddVehicle(true)}
              className="px-4 py-2 rounded-xl bg-gradient-sea text-white text-xs font-black shadow-glow"
            >
              + إضافة مركبة جديدة 🚌
            </button>
          }
        >
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 text-right">
            {vehicles.map((v) => (
              <div key={v.numbe_plater} className="border border-border rounded-2xl overflow-hidden hover:shadow-soft transition flex flex-col bg-white">
                <div className="h-44 relative">
                  <img src={v.vehicle_image} alt={v.typ_vehiclee} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3">
                    <Badge tone={v.statu_vehicles === "جاهزة" ? "green" : v.statu_vehicles === "صيانة" ? "sun" : "red"}>{v.statu_vehicles}</Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/70 text-white text-xs font-mono px-2.5 py-1 rounded-lg backdrop-blur">
                    🏷️ {v.numbe_plater}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs text-muted-foreground font-bold">نوع وموديل السيارة:</div>
                    <h4 className="font-black text-foreground text-base mt-0.5">{v.typ_vehiclee}</h4>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="font-bold text-primary">👥 عدد المقاعد: {v.capacit_seatingy} مقعد</span>
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
                          <a href={v.insurance_image} target="_blank" rel="noreferrer" className="underline hover:text-primary-dark">معاينة وثيقة التأمين ↗</a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-border">
                    <button onClick={() => setEditingVehicle(v)} className="flex-1 py-2 bg-primary/10 text-primary rounded-xl text-xs font-black hover:bg-primary/20 transition">تعديل المركبة والتأمين</button>
                    <button onClick={() => handleDeleteVehicle(v.numbe_plater)} className="px-3 py-2 bg-red-50 text-red-600 rounded-xl text-xs font-black hover:bg-red-100 transition">حذف</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* TRIPS TAB */}
      {active === "trips" && (
        <SectionCard title="الرحلات المسنّدة للشركة وسائقينها">
          <div className="space-y-4 text-right">
            {[
              { id: "T-881", route: "طرابلس ← لبدة الكبرى", driver: "علي التارقي", vehicle: "طرابلس 4517", date: "اليوم", time: "9:00 ص", status: "مؤكدة" },
              { id: "T-882", route: "طرابلس ← غدامس", driver: "أنور الترهوني", vehicle: "بنغازي 3382", date: "غداً", time: "8:00 ص", status: "مؤكدة" },
              { id: "T-883", route: "بنغازي ← شحات", driver: "مفتاح الفزاني", vehicle: "طرابلس 8291", date: "19 أغسطس", time: "9:30 ص", status: "بانتظار التحرك" },
            ].map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-border flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">رقم الرحلة: {t.id}</div>
                  <h4 className="font-black text-foreground text-base mt-0.5">{t.route}</h4>
                  <div className="text-xs text-muted-foreground mt-1">
                    👤 السائق: <b>{t.driver}</b> · المركبة واللوحة: <b>{t.vehicle}</b>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-foreground">{t.date} · {t.time}</div>
                  <Badge tone={t.status === "مؤكدة" ? "green" : "sun"}>{t.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {active === "profile" && (
        <SectionCard title="تعديل بيانات ملف شركة النقل ورقم العقد">
          <form className="max-w-xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <Field label="رقم العقد الرسمي بالمنصة (Contract Number)" value={companyInfo.contract_number} onChange={(v) => setCompanyInfo({ ...companyInfo, contract_number: v })} />
            <Field label="اسم الشركة الرسمي" value={companyInfo.name_company} onChange={(v) => setCompanyInfo({ ...companyInfo, name_company: v })} />
            <LibyanPhoneField label="رقم هاتف التواصل الرئيسي" value={companyInfo.number_phone} onChange={(v) => setCompanyInfo({ ...companyInfo, number_phone: v })} />
            <Field label="العنوان الرئيسي للمقر" value={companyInfo.address} onChange={(v) => setCompanyInfo({ ...companyInfo, address: v })} />
            <Field label="البريد الإلكتروني لحساب الشركة" type="email" value={companyInfo.email} onChange={(v) => setCompanyInfo({ ...companyInfo, email: v })} />
            <Field label="كلمة مرور الحساب" type="password" value={companyInfo.pass} onChange={(v) => setCompanyInfo({ ...companyInfo, pass: v })} />
            <button className="px-6 h-11 rounded-xl bg-gradient-sea text-white font-black text-sm shadow-glow">
              حفظ وتحديث الملف ✓
            </button>
          </form>
        </SectionCard>
      )}

      {/* ===== MODALS ===== */}
      {showAddDriver && <DriverModal title="إضافة سائق جديد لشركة النقل" companyId={companyInfo.contract_number} companyName={companyInfo.name_company} vehicles={vehicles} onClose={() => setShowAddDriver(false)} onSave={handleAddDriver} />}
      {editingDriver && <DriverModal title={`تعديل بيانات السائق: ${editingDriver.name_full}`} driver={editingDriver} companyId={companyInfo.contract_number} companyName={companyInfo.name_company} vehicles={vehicles} onClose={() => setEditingDriver(null)} onSave={handleUpdateDriver} />}

      {showAddVehicle && <VehicleModal title="إضافة مركبة جديدة لأسطول الشركة" companyId={companyInfo.contract_number} companyName={companyInfo.name_company} onClose={() => setShowAddVehicle(false)} onSave={handleAddVehicle} />}
      {editingVehicle && <VehicleModal title={`تعديل المركبة: ${editingVehicle.numbe_plater}`} vehicle={editingVehicle} companyId={companyInfo.contract_number} companyName={companyInfo.name_company} onClose={() => setEditingVehicle(null)} onSave={handleUpdateVehicle} />}
    </DashboardShell>
  );
}

/* ============ DRIVER MODAL ============ */
function DriverModal({ title, driver, companyId, companyName, vehicles, onClose, onSave }: { title: string; driver?: Driver; companyId: string; companyName: string; vehicles: Vehicle[]; onClose: () => void; onSave: (d: Driver) => void }) {
  const [lic, setLic] = useState(driver?.driver_license_number || `LB-${Math.floor(10000 + Math.random() * 90000)}`);
  const [name, setName] = useState(driver?.name_full || "");
  const [phone, setPhone] = useState(driver?.number_phone || "");
  const [expire, setExpire] = useState(driver?.license_date_vaild || "2029-12-31");
  const [nid, setNid] = useState(driver?.national_id_or_passport || "");
  const [email, setEmail] = useState(driver?.email || "");
  const [pass, setPass] = useState(driver?.pass || "");
  const [assignedPlate, setAssignedPlate] = useState(driver?.assigned_vehicle_plate || vehicles[0]?.numbe_plater || "");
  const [status, setStatus] = useState<Driver["status"]>(driver?.status || "متاح");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !nid || !email || !pass) return alert("يرجى تعبئة كافة الحقول المطلوبة لضمان صحة البيانات");
    onSave({
      driver_license_number: lic,
      name_full: name,
      number_phone: phone,
      license_date_vaild: expire,
      national_id_or_passport: nid,
      email,
      pass,
      company_id: companyId,
      company_name: companyName,
      assigned_vehicle_plate: assignedPlate,
      status
    });
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="اسم السائق الكامل" value={name} onChange={setName} placeholder="مثال: صالح الورفلي" />
          <LibyanPhoneField label="رقم الهاتف" value={phone} onChange={setPhone} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="رقم رخصة القيادة" value={lic} onChange={setLic} placeholder="LB-77452" />
          <Field label="تاريخ انقضاء صلاحية الرخصة" type="date" value={expire} onChange={setExpire} />
        </div>
        <Field label="الرقم الوطني أو رقم جواز السفر" value={nid} onChange={setNid} placeholder="119900..." />
        
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">المركبة واللوحة المسندة للسائق</label>
          <select value={assignedPlate} onChange={e => setAssignedPlate(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold outline-none focus:border-primary text-right">
            {vehicles.map(v => (
              <option key={v.numbe_plater} value={v.numbe_plater}>{v.typ_vehiclee} - {v.numbe_plater}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="البريد الإلكتروني للسائق" type="email" value={email} onChange={setEmail} placeholder="driver@dalni.ly" />
          <Field label="كلمة المرور" type="password" value={pass} onChange={setPass} />
        </div>

        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">حالة العمل</label>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right">
            <option value="متاح">متاح وجاهز للقيادة</option>
            <option value="في رحلة">في رحلة حالياً</option>
            <option value="إجازة">في إجازة</option>
          </select>
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ بيانات السائق</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ============ VEHICLE MODAL ============ */
function VehicleModal({ title, vehicle, companyId, companyName, onClose, onSave }: { title: string; vehicle?: Vehicle; companyId: string; companyName: string; onClose: () => void; onSave: (v: Vehicle) => void }) {
  const [plate, setPlate] = useState(vehicle?.numbe_plater || "");
  const [type, setType] = useState(vehicle?.typ_vehiclee || "تويوتا كوستر 2025");
  const [seats, setSeats] = useState(vehicle?.capacit_seatingy ? String(vehicle.capacit_seatingy) : "20");
  const [dailyRate, setDailyRate] = useState(vehicle?.daily_rate ? String(vehicle.daily_rate) : "450");
  const [status, setStatus] = useState<Vehicle["statu_vehicles"]>(vehicle?.statu_vehicles || "جاهزة");
  const [insuranceText, setInsuranceText] = useState(vehicle?.insurance_details || "وثيقة تأمين شامل سارية المفعول");
  const [insuranceImg, setInsuranceImg] = useState(vehicle?.insurance_image || "");
  const [vehicleImg, setVehicleImg] = useState(vehicle?.vehicle_image || officeBusImg);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate || !type || !seats) return alert("يرجى كتابة رقم اللوحة ونوع السيارة وعدد المقاعد");
    onSave({
      numbe_plater: plate,
      company_id: companyId,
      company_name: companyName,
      typ_vehiclee: type,
      capacit_seatingy: Number(seats),
      daily_rate: Number(dailyRate) || 450,
      statu_vehicles: status,
      insurance_details: insuranceText,
      insurance_image: insuranceImg,
      vehicle_image: vehicleImg
    });
  };

  return (
    <ModalShell title={title} onClose={onClose}>
      <form className="space-y-3 text-right" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="رقم اللوحة المعدنية والمدينة" value={plate} onChange={setPlate} placeholder="مثال: طرابلس 8291" />
          <Field label="عدد المقاعد (capacit_seatingy)" type="number" value={seats} onChange={setSeats} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Field label="نوع السيارة وموديلها (typ_vehiclee)" value={type} onChange={setType} placeholder="مثال: تويوتا كوستر 2025" />
          <Field label="سعر اليوم الواحد للرحلات الخاصة (د.ل)" type="number" value={dailyRate} onChange={setDailyRate} placeholder="مثال: 450" />
        </div>
        
        <div>
          <label className="text-xs font-bold text-foreground mb-1 block">حالة السيارة (statu_vehicles)</label>
          <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full h-10 px-3 rounded-xl border border-border bg-white text-xs font-semibold text-right">
            <option value="جاهزة">جاهزة للرحلات</option>
            <option value="في رحلة">في رحلة حالية</option>
            <option value="صيانة">قيد الصيانة</option>
            <option value="خارج الخدمة">خارج الخدمة</option>
          </select>
        </div>

        <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2">
          <label className="text-xs font-black text-foreground block">🛡️ بيانات ووثيقة التأمين الصحي للركاب والسيارة:</label>
          <Field label="تفاصيل وثيقة التأمين" value={insuranceText} onChange={setInsuranceText} placeholder="رقم وتفاصيل التأمين..." />
          <ImageFilePicker label="صورة وثيقة التأمين (تأمين المركبة والركاب)" value={insuranceImg} onChange={setInsuranceImg} />
        </div>

        <div className="pt-2 border-t border-border">
          <ImageFilePicker label="صورة السيارة (عرض الصورة بالبطاقة والتذكرة)" value={vehicleImg} onChange={setVehicleImg} />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <button type="button" onClick={onClose} className="px-4 h-10 rounded-xl border font-black text-xs">إلغاء</button>
          <button className="px-5 h-10 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow">حفظ السيارة والتأمين</button>
        </div>
      </form>
    </ModalShell>
  );
}

/* ---- HELPER COMPONENTS ---- */
function ImageFilePicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { const r = new FileReader(); r.onload = ev => { if (ev.target?.result) onChange(ev.target.result as string); }; r.readAsDataURL(file); }
  };
  return (
    <div className="p-2.5 rounded-xl border border-border bg-muted/20 space-y-1.5 text-right">
      <div className="flex justify-between items-center">
        <label className="text-xs font-bold text-foreground">{label}</label>
        {value && <span className="text-[10px] text-emerald-600 font-bold">✓ تم التحميل</span>}
      </div>
      <div className="flex items-center gap-2">
        {value ? <img src={value} alt="" className="w-12 h-12 rounded-lg object-cover border border-primary/40 shadow-xs flex-shrink-0" /> : <div className="w-12 h-12 rounded-lg bg-muted border border-dashed border-border grid place-items-center text-xs text-muted-foreground flex-shrink-0">📷</div>}
        <div className="flex-1 space-y-1">
          <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-sea text-white text-xs font-black cursor-pointer hover:opacity-90 transition shadow-soft">
            📁 اختيار صورة من الجهاز
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder="أو ضع رابط الصورة..." className="w-full h-8 px-2 text-[10px] rounded-lg border border-border bg-white outline-none font-mono text-right" />
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

function LibyanPhoneField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    onChange(val);
    setError(val && !/^09\d{8}$/.test(val) ? "يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)" : "");
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input type="tel" value={value} onChange={e => handleChange(e.target.value)} placeholder="09..." className={`w-full h-10 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${error ? "border-red-500" : "border-border focus:border-primary"}`} />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
      />
    </div>
  );
}
