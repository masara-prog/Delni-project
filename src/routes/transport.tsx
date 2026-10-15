import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { getTransportCompanies, getVehicles as getApiVehicles, getDrivers } from "@/lib/api";

export const Route = createFileRoute("/transport")({
  head: () => ({
    meta: [
      { title: "السيارات ووسائل النقل السياحي | منصة دلّني" },
      {
        name: "description",
        content:
          "استكشف أسطول الحافلات السياحية الكبرى، ميني باص VIP، وسيارات الدفع الرباعي 4x4 المصنفة حسب الشركات المعتمدة.",
      },
    ],
  }),
  component: TransportPage,
});

type Vehicle = {
  id: string;
  plateNumber: string;
  vehicleType: string;
  name: string;
  category: "bus_large" | "minibus_vip" | "suv_4x4";
  categoryLabelAr: string;
  categoryLabelEn: string;
  vehicleStatus: string;
  seats: number;
  pricePerDay: number;
  insuranceDetails: string;
  insuranceDocument?: string | null;
  photos: string[];

  // Transport Company details (Real DB)
  company: string;
  companyContractNumber: string;
  companyPhone: string;
  companyEmail?: string;
  city: string;
  companyAddress: string;
  googleMapsUrl: string;
  contractStartDate: string;
  contractEndDate: string;
  companyStatus: string;

  // Assigned Driver details (Real DB)
  hasDriver: boolean;
  driverName: string;
  driverLicense: string;
  driverPhone: string;
  driverNationalId: string;
  driverLicenseExpiry: string;
  driverOperationalStatus: string;
  driverEmail?: string;
};

function formatDate(d?: string | null): string {
  if (!d) return "";
  const s = String(d).trim();
  if (s.includes("T")) return s.split("T")[0];
  return s;
}

function TransportPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [city, setCity] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});

  const [rawCompanies, setRawCompanies] = useState<any[]>(() => getTransportCompanies());
  const [rawVehicles, setRawVehicles] = useState<any[]>(() => getApiVehicles());
  const [rawDrivers, setRawDrivers] = useState<any[]>(() => getDrivers());

  // Real-time synchronization with Backend SQL Server if online
  useEffect(() => {
    let isMounted = true;
    async function fetchLiveData() {
      try {
        const compRes = await fetch("http://127.0.0.1:5001/api/db/companies", { signal: AbortSignal.timeout(3000) });
        if (compRes.ok) {
          const compData = await compRes.json();
          if (compData.success && Array.isArray(compData.data) && isMounted) {
            setRawCompanies(compData.data);
          }
        }
      } catch {}

      try {
        const vehRes = await fetch("http://127.0.0.1:5001/api/db/vehicles", { signal: AbortSignal.timeout(3000) });
        if (vehRes.ok) {
          const vehData = await vehRes.json();
          if (vehData.success && Array.isArray(vehData.data) && isMounted) {
            setRawVehicles(vehData.data);
          }
        }
      } catch {}

      try {
        const drvRes = await fetch("http://127.0.0.1:5001/api/db/drivers", { signal: AbortSignal.timeout(3000) });
        if (drvRes.ok) {
          const drvData = await drvRes.json();
          if (drvData.success && Array.isArray(drvData.data) && isMounted) {
            setRawDrivers(drvData.data);
          }
        }
      } catch {}
    }
    fetchLiveData();
    return () => { isMounted = false; };
  }, []);

  // ONLY verified companies ("موثق") are allowed to be shown!
  // Pending ("بانتظار") or rejected ("مرفوض") are strictly excluded
  const verifiedCompanies = useMemo(() => {
    return rawCompanies.filter((c) => {
      const st = String(c.verification_status || c.status || "").trim();
      return st === "موثق" || st === "معتمد";
    });
  }, [rawCompanies]);

  const verifiedContractNumbers = useMemo(() => {
    return new Set(verifiedCompanies.map((c) => String(c.contract_number || "").trim()));
  }, [verifiedCompanies]);

  const verifiedCompanyNames = useMemo(() => {
    return new Set(verifiedCompanies.map((c) => String(c.company_name || c.name || "").trim().toLowerCase()));
  }, [verifiedCompanies]);

  // Only vehicles belonging to verified companies are displayed
  const vehicles = useMemo(() => {
    const verifiedRawVehicles = rawVehicles.filter((v) => {
      const contractMatch = v.contract_number && verifiedContractNumbers.has(String(v.contract_number).trim());
      const nameMatch = v.company_name && verifiedCompanyNames.has(String(v.company_name).trim().toLowerCase());
      return contractMatch || nameMatch;
    });

    return verifiedRawVehicles.map((v) => {
      let cat: "bus_large" | "minibus_vip" | "suv_4x4" = "minibus_vip";
      const catLower = (v.category || "").toLowerCase();
      const typeLower = (v.vehicle_type || "").toLowerCase();
      if (catLower.includes("4x4") || catLower.includes("دفع رباعي") || typeLower.includes("دفع رباعي") || catLower.includes("صحراو")) {
        cat = "suv_4x4";
      } else if (catLower.includes("large") || catLower.includes("كبير") || (typeLower.includes("باص") && (v.seating_capacity || 0) >= 30)) {
        cat = "bus_large";
      }

      // Find company details
      const parentCompany = verifiedCompanies.find(
        (c) => String(c.contract_number).trim() === String(v.contract_number).trim() || (c.company_name && c.company_name === v.company_name)
      );

      // Find assigned driver from drivers table by assigned_vehicle_plate
      const assignedDriver = rawDrivers.find(
        (d) => d.assigned_vehicle_plate && String(d.assigned_vehicle_plate).trim() === String(v.plate_number).trim()
      );

      const hasDriver = !!assignedDriver;

      return {
        id: v.plate_number || `VEH-${Math.random()}`,
        plateNumber: v.plate_number || "",
        vehicleType: v.vehicle_type || (isAr ? "مركبة سياحية" : "Tour Vehicle"),
        name: `${v.vehicle_type || (isAr ? "مركبة سياحية" : "Tour Vehicle")} - ${v.plate_number || ""}`,
        category: cat,
        categoryLabelAr: cat === "bus_large" ? "باص سياحي كبير" : cat === "suv_4x4" ? "سيارة دفع رباعي 4x4" : "ميني باص VIP",
        categoryLabelEn: cat === "bus_large" ? "Large Tour Bus" : cat === "suv_4x4" ? "4x4 Desert SUV" : "VIP Minibus",
        vehicleStatus: v.vehicle_status || (isAr ? "جاهز للعمل ومفحوص دورياً" : "Ready for service"),
        seats: Number(v.seating_capacity) || 15,
        pricePerDay: Number(v.daily_rate) || 350,
        insuranceDetails: v.insurance_details || (isAr ? "تأمين شامل ساري المفعول" : "Comprehensive Insurance"),
        insuranceDocument: v.insurance_document || null,
        photos: v.vehicle_image ? [v.vehicle_image] : ["/assets/office-bus.jpg"],

        // Operating Transport Company (Real DB)
        company: v.company_name || parentCompany?.company_name || parentCompany?.name || (isAr ? "شركة النقل السياحي" : "Transport Co."),
        companyContractNumber: v.contract_number || parentCompany?.contract_number || "",
        companyPhone: parentCompany?.phone_number || parentCompany?.phone || "",
        companyEmail: parentCompany?.email || "",
        city: parentCompany?.city || (isAr ? "طرابلس" : "Tripoli"),
        companyAddress: parentCompany?.address && !parentCompany.address.startsWith("http")
          ? parentCompany.address
          : (parentCompany?.city ? `المقر الرئيسي - ${parentCompany.city}` : (isAr ? "المقر الرئيسي المعتمد" : "Headquarters")),
        googleMapsUrl: parentCompany?.google_maps_url || (parentCompany?.address && (parentCompany.address.startsWith("http") || parentCompany.address.includes("maps")) ? parentCompany.address : "") || "",
        contractStartDate: parentCompany?.contract_start_date ? String(parentCompany.contract_start_date).split("T")[0] : "",
        contractEndDate: parentCompany?.contract_end_date ? String(parentCompany.contract_end_date).split("T")[0] : "",
        companyStatus: parentCompany?.verification_status || parentCompany?.status || (isAr ? "موثق" : "Verified"),

        // Assigned Driver (Real DB)
        hasDriver,
        driverName: assignedDriver?.full_name || (isAr ? "لم يتم تعيين سائق بعد" : "No Driver Assigned"),
        driverLicense: assignedDriver?.driver_license_number || "",
        driverPhone: assignedDriver?.phone_number || parentCompany?.phone_number || "",
        driverNationalId: assignedDriver?.national_id_or_passport || "",
        driverLicenseExpiry: assignedDriver?.license_date_valid ? String(assignedDriver.license_date_valid).split("T")[0] : "",
        driverOperationalStatus: assignedDriver?.operational_status || (isAr ? "متاح" : "Available"),
        driverEmail: assignedDriver?.email || "",
      };
    });
  }, [rawVehicles, rawDrivers, verifiedContractNumbers, verifiedCompanyNames, verifiedCompanies, isAr]);

  // ONLY verified companies appear in the filter! No static fake companies!
  const companies = useMemo(() => {
    const list = [
      { key: "all", label: isAr ? "كافة شركات النقل المعتمدة" : "All Transport Companies" },
    ];
    verifiedCompanies.forEach((c) => {
      const name = c.company_name || c.name;
      if (name && !list.some((item) => item.key === name)) {
        list.push({
          key: name,
          label: name,
        });
      }
    });
    return list;
  }, [verifiedCompanies, isAr]);

  const categories = useMemo(
    () => [
      { key: "all", label: isAr ? "كافة أنواع المركبات" : "All Vehicle Types" },
      { key: "bus_large", label: isAr ? "باصات سياحية كبيرة VIP" : "Large VIP Tour Buses" },
      { key: "minibus_vip", label: isAr ? "ميني باص VIP كبار الشخصيات" : "VIP Minibuses" },
      { key: "suv_4x4", label: isAr ? "سيارات دفع رباعي صحراوية 4x4" : "4x4 Desert SUVs" },
    ],
    [isAr],
  );

  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchCity = city === "all" || v.city.toLowerCase().includes(city.toLowerCase());
      const matchComp =
        companyFilter === "all" ||
        v.company.toLowerCase().includes(companyFilter.toLowerCase()) ||
        companyFilter.toLowerCase().includes(v.company.toLowerCase());
      const matchCat = categoryFilter === "all" || v.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q);
      return matchCity && matchComp && matchCat && matchSearch;
    });
  }, [vehicles, city, companyFilter, categoryFilter, searchQuery]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]" dir={dir}>
      <Header active="transport" />

      {/* ── 1. HERO SECTION (Professional Animated Slideshow) ── */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#003580]">
        <HeroSlideshow
          images={[
            "/assets/transport-hero.jpg",
            "/assets/6692d389-47a4-48fc-a344-016619726724.jpg",
            "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg",
            "/assets/private-trip.jpg",
          ]}
          alt="أسطول النقل والمركبات السياحية"
          brightness="brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003580]/90 via-[#003580]/45 to-transparent z-10" />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-12 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit mb-2.5 border border-white/25">
            🚌 {isAr ? "أسطول النقل السياحي المعتمد في ليبيا" : "Certified Tourist Fleet in Libya"}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-lg tracking-tight">
            {isAr ? "باصات سياحية فاخرة وميني باص VIP وسفاري" : "Luxury Tourist Coaches, VIP Vans & 4x4s"}
          </h1>
          <p className="mt-2 text-white/95 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-sm">
            {isAr
              ? "استكشف أسطول المركبات المصنفة حسب كبرى شركات النقل السياحي المعتمدة مع أمهر السائقين المرخصين في ليبيا."
              : "Discover vetted tourist coaches, VIP executive minibuses, and 4x4 safari cruisers with top certified drivers."}
          </p>
        </div>
      </div>

      {/* ── 2. UNIFIED FLOATING FILTER PANEL (Matching Hotels & Attractions) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E8E2D6] text-[#0F172A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 bg-[#F0F4F8] rounded-2xl border border-blue-100">
            {/* Search Input */}
            <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🔍</span>
              <div className="relative flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "البحث عن مركبة أو سائق:" : "Search Vehicle or Driver:"}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحث باسم المركبة، الشركة، أو السائق..." : "Search by vehicle, company, or driver..."}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A6A85]"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Company Classification Select */}
            <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🏢</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "تصنيف شركات النقل:" : "Transport Company:"}
                </label>
                <select
                  value={companyFilter}
                  onChange={(e) => setCompanyFilter(e.target.value)}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  {companies.map((c) => (
                    <option key={c.key} value={c.key}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vehicle Type Classification Select */}
            <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🚌</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "نوع المركبة:" : "Vehicle Type:"}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  {categories.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* City Select */}
            <div className="lg:col-span-2 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center justify-between gap-2">
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "المدينة:" : "City:"}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">{isAr ? "كافة المدن" : "All Cities"}</option>
                  <option value="طرابلس">{isAr ? "طرابلس" : "Tripoli"}</option>
                  <option value="بنغازي">{isAr ? "بنغازي" : "Benghazi"}</option>
                  <option value="أوباري">{isAr ? "أوباري" : "Ubari"}</option>
                </select>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                {filtered.length} {isAr ? "مركبة" : "vehicles"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pb-16">
        {/* ── 3. TRANSPORT COMPANIES ── */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                {isAr ? "شركات النقل السياحي المعتمدة" : "Certified Transport Companies"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isAr ? "اختر الشركة لاستعراض أسطول مركباتها" : "Select a company to view their available fleet"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {companies.filter(c => c.key !== "all").length === 0 ? (
              <div className="col-span-full p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500 font-bold">
                {isAr ? "لا توجد شركات نقل موثقة حالياً. تظهر الشركات في هذه الواجهة تلقائياً بمجرد اعتمادها من الإدارة." : "No certified transport companies currently."}
              </div>
            ) : (
              companies.filter(c => c.key !== "all").map((c) => {
              const isSelected = companyFilter === c.key;
              const registeredComp = getTransportCompanies().find(rc => (rc.company_name || rc.name) === c.key);
              const count = vehicles.filter((v) => v.company.toLowerCase().includes(c.key.toLowerCase()) || c.key.toLowerCase().includes(v.company.toLowerCase())).length || registeredComp?.total_vehicles || 0;
              return (
                <div
                  key={c.key}
                  onClick={() => {
                    setCompanyFilter(isSelected ? "all" : c.key);
                  }}
                  className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center gap-3 text-center ${
                    isSelected
                      ? "bg-gradient-to-br from-[#D96B27] to-[#EA580C] text-white border-transparent shadow-lg shadow-[#D96B27]/30 scale-105"
                      : "bg-white text-[#0F172A] border-[#E8E2D6] hover:border-[#D96B27] hover:shadow-md hover:-translate-y-1"
                  }`}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-2xl transition-colors ${
                    isSelected ? "bg-white/20 text-white" : "bg-orange-50 text-[#D96B27]"
                  }`}>
                    🏢
                  </div>
                  <div>
                    <h3 className="font-black text-xs sm:text-sm">{c.label}</h3>
                    <p className={`text-[10px] sm:text-xs mt-1 font-bold ${
                      isSelected ? "text-white/90" : "text-slate-500"
                    }`}>
                      {count} {isAr ? "مركبات" : "vehicles"}
                    </p>
                  </div>
                </div>
              );
            }))}
          </div>
        </section>

        {/* ── 4. BROWSE BY VEHICLE TYPE (Matching Hotels Property Types) ── */}
        <section className="space-y-4">
          <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">
            {isAr ? "تصفح حسب تصنيف وسيلة النقل" : "Browse by vehicle category"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                title: isAr ? "باصات سياحية كبيرة VIP" : "Large VIP Tour Buses",
                desc: isAr ? "حافلات 25 - 50 مقعد مخصصة للأفواج الكبيرة والرحلات المدرسية والجامعية" : "25 to 50 passenger coaches for major tours",
                count: isAr ? "12 حافلة جاهزة" : "12 available",
                img: "/assets/6692d389-47a4-48fc-a344-016619726724.jpg",
                cat: "bus_large",
              },
              {
                title: isAr ? "ميني باص VIP كبار الشخصيات" : "VIP Minibuses",
                desc: isAr ? "حافلات صغيرة 9 - 14 مقعد كابتن فاخرة للوفود الرسمية والعائلات" : "9 to 14 VIP luxury vans for delegations & families",
                count: isAr ? "18 ميني باص جاهز" : "18 available",
                img: "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg",
                cat: "minibus_vip",
              },
              {
                title: isAr ? "سيارات دفع رباعي صحراوية 4x4" : "4x4 Desert Safari",
                desc: isAr ? "سيارات مجهزة لعبور رملة أوباري وكثبان الصحراء وأكاكوس" : "Heavy duty 4x4s for desert dunes and expeditions",
                count: isAr ? "15 سيارة مجهزة" : "15 available",
                img: "/assets/private-trip.jpg",
                cat: "suv_4x4",
              },
            ].map((prop, i) => (
              <div
                key={i}
                onClick={() => setCategoryFilter(prop.cat as any)}
                className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer border border-slate-200 bg-white"
              >
                <div className="h-36 overflow-hidden">
                  <img
                    src={prop.img}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5 space-y-1">
                  <div className="font-black text-sm text-[#0F172A] group-hover:text-[#003580] transition-colors">
                    {prop.title}
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    {prop.desc}
                  </p>
                  <div className="text-[11px] text-[#003580] font-black pt-1">
                    ✓ {prop.count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. ALL VEHICLES LISTING (Screenshot 3 Style Cards) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black text-[#0F172A]">
                {companyFilter === "all"
                  ? (isAr ? "جميع وسائل النقل السياحي المتاحة" : "All Available Tourist Vehicles")
                  : (isAr ? `مركبات ${companyFilter}` : `Vehicles from ${companyFilter}`)}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {isAr ? "مركبات مفحوصة ومعتمدة مع بيانات السائق والشركة" : "Inspected and certified vehicles with driver and company details"}
              </p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              {filtered.length} {isAr ? "مركبة متاحة" : "vehicles available"}
            </span>
          </div>

          <div className="space-y-4">
            {filtered.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <div className="text-5xl mb-3">🚌</div>
              <h3 className="text-lg font-black text-[#0F172A] mb-1">
                {isAr ? "لا توجد مركبات معروضة حالياً" : "No vehicles available currently"}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {isAr
                  ? "تظهر المركبات السياحية في هذه الواجهة تلقائياً بمجرد تسجيلها واعتماد وتوثيق شركات النقل التابعة لها من قبل إدارة المنصة."
                  : "Vehicles appear here once their transport companies are verified and approved by administration."}
              </p>
            </div>
          ) : (
            filtered.map((v) => {
              const isFav = !!likedMap[v.id];
              return (
                <article
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-orange-300 shadow-xs hover:shadow-xl transition-all p-3 sm:p-4 cursor-pointer flex flex-col md:flex-row gap-5"
                >
                  {/* Photo Section */}
                  <div className="relative w-full md:w-72 h-52 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-900 shadow-inner">
                    <img
                      src={v.photos[0]}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-80" />
                    
                    <button
                      type="button"
                      onClick={(e) => toggleLike(v.id, e)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md z-10 cursor-pointer ${
                        isFav ? "bg-white text-red-500" : "bg-black/30 text-white hover:bg-white hover:text-red-500"
                      }`}
                      title={isAr ? "إضافة للمفضلة" : "Save to wishlist"}
                    >
                      <span className="text-sm">{isFav ? "❤️" : "🤍"}</span>
                    </button>
                    
                    <div className="absolute top-3 left-3 bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
                      {isAr ? v.categoryLabelAr : v.categoryLabelEn}
                    </div>

                    <div className="absolute bottom-3 right-3 text-white text-xs font-bold bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 flex items-center gap-1.5">
                      <span>📍 {v.city}</span>
                      <span className="text-white/50">|</span>
                      <span>👥 {v.seats} {isAr ? "مقعد" : "seats"}</span>
                    </div>
                  </div>

                  {/* Main Content Section */}
                  <div className="flex-1 flex flex-col justify-between space-y-3 md:py-2">
                    {/* Header */}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <div className="text-[10px] font-black text-[#D96B27] bg-orange-50 px-2.5 py-1 rounded-md border border-orange-100 flex items-center gap-1.5">
                          <span>🏢</span>
                          <span>{v.company}</span>
                        </div>
                        <div className="text-[10px] font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 font-mono tracking-wide">
                          🇱🇾 {v.plateNumber}
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          ✓ {v.vehicleStatus}
                        </div>
                      </div>

                      <h4 className="text-xl font-black text-[#0F172A] group-hover:text-[#D96B27] transition-colors leading-tight">
                        {v.vehicleType}
                      </h4>
                      <p className="mt-1 text-xs text-slate-500 font-medium">
                        عقد شركة رقم: #{v.companyContractNumber} · {v.city}
                      </p>
                    </div>

                    {/* Driver Info */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 w-fit">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-lg shrink-0">
                        🧑‍✈️
                      </div>
                      <div>
                        <div className="text-xs font-black text-[#0F172A]">
                          {v.hasDriver ? v.driverName : (isAr ? "لم يتم تعيين سائق بعد" : "No Driver Assigned")}
                        </div>
                        <div className="text-[11px] font-medium text-slate-500">
                          {v.hasDriver ? (
                            <span>
                              رخصة: <strong className="text-slate-700">{v.driverLicense}</strong> · الحالة: <span className="text-emerald-700 font-bold">{v.driverOperationalStatus}</span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-bold">{isAr ? "جاهزة للتعيين أو الاستئجار" : "Ready for driver assignment"}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Action Section */}
                  <div className="md:w-52 flex flex-col justify-end items-end shrink-0 border-t md:border-t-0 md:border-s md:border-slate-100 pt-4 md:pt-0 md:ps-5">
                    <div className="text-right mb-4">
                      <div className="text-[10px] text-slate-400 font-bold mb-1">
                        {isAr ? "سعر التأجير اليومي" : "Daily Rate"}
                      </div>
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-2xl font-black text-[#0F172A]">
                          {v.pricePerDay}
                        </span>
                        <span className="text-xs text-slate-500 font-bold">
                          {isAr ? "د.ل / يوم" : "LYD / day"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicle(v);
                      }}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 active:scale-95"
                    >
                      <span>{isAr ? "عرض التفاصيل المعتمدة" : "View Verified Details"}</span>
                      <span dir="ltr">➔</span>
                    </button>
                  </div>
                </article>
              );
            }))}
          </div>
        </section>
      </div>

      {/* ── 6. SIMPLIFIED DYNAMIC VEHICLE DETAILS MODAL ── */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto" dir={dir}>
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in" onClick={() => setSelectedVehicle(null)} />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto z-10 border border-slate-100">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono bg-slate-900 text-white text-[11px] px-2.5 py-0.5 rounded-md font-bold">
                    🇱🇾 {selectedVehicle.plateNumber}
                  </span>
                  <span className="bg-orange-50 text-[#D96B27] border border-orange-100 text-[11px] px-2.5 py-0.5 rounded-md font-black">
                    {selectedVehicle.categoryLabelAr}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] px-2 py-0.5 rounded-md font-bold">
                    ✓ {selectedVehicle.vehicleStatus}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">
                  {selectedVehicle.vehicleType}
                </h3>
              </div>

              <button
                onClick={() => setSelectedVehicle(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition font-black text-sm cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 text-right">
              {/* Left Column: Image, Price, Quick Actions */}
              <div className="md:col-span-5 space-y-4">
                <div className="relative h-48 sm:h-52 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
                  <img
                    src={selectedVehicle.photos[0]}
                    alt={selectedVehicle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 right-2.5 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                    📍 {selectedVehicle.city} · 👥 {selectedVehicle.seats} مقعد
                  </div>
                </div>

                {/* Price Box */}
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] space-y-1 text-center">
                  <div className="text-[11px] font-bold text-slate-500">سعر التأجير اليومي</div>
                  <div className="text-2xl font-black text-[#0F172A]">
                    {selectedVehicle.pricePerDay} <span className="text-xs text-slate-500 font-bold">د.ل / يوم</span>
                  </div>
                  <div className="text-[10px] text-emerald-700 font-bold pt-1">
                    ✓ شامل فحص السلامة المعتمد
                  </div>
                </div>

                {/* Quick Call Actions */}
                <div className="space-y-2 pt-1">
                  {selectedVehicle.hasDriver && selectedVehicle.driverPhone && (
                    <a
                      href={`tel:${selectedVehicle.driverPhone}`}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:opacity-95 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>📞</span>
                      <span>اتصال بالسائق مباشرة</span>
                    </a>
                  )}

                  {selectedVehicle.companyPhone && (
                    <a
                      href={`tel:${selectedVehicle.companyPhone}`}
                      className="w-full py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>🏢</span>
                      <span>اتصال بشركة النقل</span>
                    </a>
                  )}

                  {selectedVehicle.googleMapsUrl && (
                    <a
                      href={selectedVehicle.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <span>📍</span>
                      <span>موقع الشركة على الخريطة</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Right Column: Essential Details (Dynamic) */}
              <div className="md:col-span-7 space-y-4">
                {/* 1. Vehicle Specifications */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                  <div className="text-xs font-black text-[#003580] flex items-center gap-1.5 pb-1 border-b border-slate-100">
                    <span>🚗</span>
                    <span>بيانات ومواصفات المركبة</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 text-right">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">رقم اللوحة</div>
                      <div className="text-xs font-black text-slate-900 font-mono">{selectedVehicle.plateNumber}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">السعة الاستيعابية</div>
                      <div className="text-xs font-black text-slate-900">{selectedVehicle.seats} مقعد</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">الفئة والتصنيف</div>
                      <div className="text-xs font-black text-slate-900">{selectedVehicle.categoryLabelAr}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">حالة المركبة</div>
                      <div className="text-xs font-black text-emerald-700">{selectedVehicle.vehicleStatus}</div>
                    </div>

                    <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">بيانات التأمين</div>
                        <div className="text-xs font-black text-slate-900">{selectedVehicle.insuranceDetails}</div>
                      </div>
                      {selectedVehicle.insuranceDocument && (
                        <a
                          href={selectedVehicle.insuranceDocument}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 hover:underline"
                        >
                          📄 وثيقة التأمين
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Driver Info (Dynamic) */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                  <div className="text-xs font-black text-emerald-800 flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <span>🧑‍✈️</span>
                      <span>السائق المعتمد</span>
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      selectedVehicle.hasDriver ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}>
                      {selectedVehicle.hasDriver ? "مسند للمركبة" : "غير مسند"}
                    </span>
                  </div>

                  {selectedVehicle.hasDriver ? (
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">اسم السائق</div>
                        <div className="text-xs font-black text-slate-900">{selectedVehicle.driverName}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">رقم الرخصة</div>
                        <div className="text-xs font-black text-slate-900 font-mono">{selectedVehicle.driverLicense}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">رقم الهاتف</div>
                        <div className="text-xs font-black text-slate-900 font-mono" dir="ltr">{selectedVehicle.driverPhone}</div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="text-[10px] text-slate-400 font-bold">الحالة التشغيلية</div>
                        <div className="text-xs font-black text-emerald-700">{selectedVehicle.driverOperationalStatus}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 text-xs font-medium leading-relaxed">
                      لم يتم تعيين سائق محدد لهذه المركبة بعد. المركبة متاحة للاستئجار أو يمكن لشركة النقل توفير سائق معتمد فور الحجز.
                    </div>
                  )}
                </div>

                {/* 3. Operating Company Info */}
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
                  <div className="text-xs font-black text-[#D96B27] flex items-center justify-between pb-1 border-b border-slate-100">
                    <span className="flex items-center gap-1.5">
                      <span>🏢</span>
                      <span>شركة النقل المشغلة</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ✓ {selectedVehicle.companyStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">اسم الشركة</div>
                      <div className="text-xs font-black text-slate-900">{selectedVehicle.company}</div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <div className="text-[10px] text-slate-400 font-bold">المدينة / المقر</div>
                      <div className="text-xs font-black text-slate-900">{selectedVehicle.city}</div>
                    </div>

                    <div className="col-span-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-slate-400 font-bold">هاتف الشركة</div>
                        <div className="text-xs font-black text-slate-900 font-mono" dir="ltr">
                          {selectedVehicle.companyPhone || "غير مسجل"}
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        عقد #{selectedVehicle.companyContractNumber}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default TransportPage;
