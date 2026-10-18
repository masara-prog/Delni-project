import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { HeroSlideshow } from "@/components/HeroSlideshow";
import { getTransportCompanies, getVehicles as getApiVehicles, getDrivers } from "@/lib/api";
import {
  Car,
  ShieldCheck,
  MapPin,
  Users,
  Phone,
  Sparkles,
  Heart,
  ExternalLink,
  Building2,
  UserCheck,
  Eye,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Columns3,
} from "lucide-react";

export const Route = createFileRoute("/transport")({
  head: () => ({
    meta: [
      { title: "السيارات ووسائل النقل السياحي | منصة دلّني" },
      {
        name: "description",
        content:
          "استكشف أسطول الحافلات السياحية الكبرى، ميني باص VIP، وسيارات الدفع الرباعي 4x4 المعتمدة مع أمهر السائقين في طرابلس وبنغازي.",
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
  category: "حافلة سياحية" | "ميني باص" | "فان" | "سيارة دفع رباعي (4x4)" | "سيدان" | string;
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
  companyPhone: string;
  companyEmail?: string;
  city: string;
  companyAddress: string;
  googleMapsUrl: string;
  companyStatus: string;

  // Assigned Driver details (Real DB)
  hasDriver: boolean;
  driverName: string;
  driverLicense: string;
  driverPhone: string;
  driverOperationalStatus: string;
  driverEmail?: string;
};

function TransportPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [city, setCity] = useState("all");

  // Display Mode: Slider (horizontal carousel) vs Grid (View All)
  const [isViewAll, setIsViewAll] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  // Modal States
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [modalTab, setModalTab] = useState<"specs" | "driver">("specs");
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [previewDocUrl, setPreviewDocUrl] = useState<string | null>(null);

  // Data Sources (Fallback local + Live Sync with SQL Server)
  const [rawCompanies, setRawCompanies] = useState<any[]>(() => getTransportCompanies());
  const [rawVehicles, setRawVehicles] = useState<any[]>(() => getApiVehicles());
  const [rawDrivers, setRawDrivers] = useState<any[]>(() => getDrivers());

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
    return () => {
      isMounted = false;
    };
  }, []);

  // Verified & Active Companies Filter:
  // A company and its fleet are visible ONLY if:
  // 1. Operational status is "موثق" or "معتمد" or "نشط" (NOT "معلق", "بانتظار", "مرفوض", or "غير نشط")
  // 2. Its contract has not expired (contract_end_date >= today)
  const verifiedCompanies = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return rawCompanies.filter((c) => {
      const st = String(c.verification_status || c.status || "").trim();
      const isActive = st === "موثق" || st === "معتمد" || st === "نشط";
      if (!isActive) return false;

      // Contract Expiration Check:
      if (c.contract_end_date) {
        const endDate = new Date(c.contract_end_date);
        if (!isNaN(endDate.getTime())) {
          endDate.setHours(23, 59, 59, 999);
          if (endDate < today) {
            return false; // Contract expired! Company and vehicles automatically hidden.
          }
        }
      }

      return true;
    });
  }, [rawCompanies]);

  const verifiedContractNumbers = useMemo(() => {
    return new Set(verifiedCompanies.map((c) => String(c.contract_number || "").trim()));
  }, [verifiedCompanies]);

  const verifiedCompanyNames = useMemo(() => {
    return new Set(verifiedCompanies.map((c) => String(c.company_name || c.name || "").trim().toLowerCase()));
  }, [verifiedCompanies]);

  // Clean formatted vehicle list (No confidential dates/contracts, no static dummy text)
  const vehicles = useMemo(() => {
    const verifiedRawVehicles = rawVehicles.filter((v) => {
      const contractMatch = v.contract_number && verifiedContractNumbers.has(String(v.contract_number).trim());
      const nameMatch = v.company_name && verifiedCompanyNames.has(String(v.company_name).trim().toLowerCase());
      return contractMatch || nameMatch;
    });

    return verifiedRawVehicles.map((v, idx) => {
      // 5 Exact Standard Categories matching Dashboard Transport:
      // 1. حافلة سياحية  2. ميني باص  3. فان  4. سيارة دفع رباعي (4x4)  5. سيدان
      let cat = "ميني باص";
      const rawCat = String(v.category || "").trim();
      const catLower = rawCat.toLowerCase();
      const typeLower = String(v.vehicle_type || "").toLowerCase();

      if (rawCat === "حافلة سياحية" || rawCat === "ميني باص" || rawCat === "فان" || rawCat === "سيارة دفع رباعي (4x4)" || rawCat === "سيدان") {
        cat = rawCat;
      } else if (
        catLower.includes("4x4") ||
        catLower.includes("دفع رباعي") ||
        typeLower.includes("دفع رباعي") ||
        catLower.includes("صحراو") ||
        typeLower.includes("لاند")
      ) {
        cat = "سيارة دفع رباعي (4x4)";
      } else if (
        catLower.includes("large") ||
        catLower.includes("كبير") ||
        catLower.includes("حافلة") ||
        (typeLower.includes("باص") && (v.seating_capacity || 0) >= 30)
      ) {
        cat = "حافلة سياحية";
      } else if (catLower.includes("فان") || typeLower.includes("van") || typeLower.includes("فان")) {
        cat = "فان";
      } else if (catLower.includes("سيدان") || typeLower.includes("sedan") || typeLower.includes("سيدان")) {
        cat = "سيدان";
      } else if (catLower.includes("ميني") || typeLower.includes("ميني") || typeLower.includes("كوستر") || typeLower.includes("coaster")) {
        cat = "ميني باص";
      } else {
        cat = "ميني باص";
      }

      const catLabels: Record<string, { ar: string; en: string }> = {
        "حافلة سياحية": { ar: "حافلة سياحية", en: "Tourist Bus" },
        "ميني باص": { ar: "ميني باص", en: "Mini Bus" },
        "فان": { ar: "فان", en: "Van" },
        "سيارة دفع رباعي (4x4)": { ar: "سيارة دفع رباعي (4x4)", en: "4x4 SUV" },
        "سيدان": { ar: "سيدان", en: "Sedan" },
      };

      const parentCompany = verifiedCompanies.find(
        (c) =>
          String(c.contract_number).trim() === String(v.contract_number).trim() ||
          (c.company_name && c.company_name === v.company_name),
      );

      const assignedDriver = rawDrivers.find(
        (d) => d.assigned_vehicle_plate && String(d.assigned_vehicle_plate).trim() === String(v.plate_number).trim(),
      );

      const hasDriver = !!(
        assignedDriver &&
        assignedDriver.full_name &&
        String(assignedDriver.full_name).trim() !== "" &&
        !String(assignedDriver.full_name).includes("غير مسند") &&
        !String(assignedDriver.full_name).includes("متاح للرحلات")
      );

      let defaultPhoto = "/assets/office-bus.jpg";
      if (cat === "سيارة دفع رباعي (4x4)") defaultPhoto = "/assets/private-trip.jpg";
      else if (cat === "حافلة سياحية") defaultPhoto = "/assets/6692d389-47a4-48fc-a344-016619726724.jpg";
      else if (cat === "فان") defaultPhoto = "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg";
      else if (cat === "سيدان") defaultPhoto = "/assets/ai_hotel.jpg";
      else defaultPhoto = "/assets/office-bus.jpg";

      // City strictly normalized to Tripoli or Benghazi
      const rawCity = parentCompany?.city || v.city || "طرابلس";
      const normalizedCity = String(rawCity).includes("بنغازي") ? (isAr ? "بنغازي" : "Benghazi") : (isAr ? "طرابلس" : "Tripoli");

      // Clean plate string without encoding artifacts (remove ?????)
      const cleanPlate = String(v.plate_number || "")
        .replace(/\?+/g, "")
        .trim();
      const finalPlate = cleanPlate || `${idx + 101}`;

      // Clean insurance details (remove any static years like 2028)
      const cleanInsurance = v.insurance_details
        ? String(v.insurance_details)
            .replace(/حتى\s*\d{4}/g, "")
            .replace(/سارية\s*المفعول\s*حتى\s*\d{4}/g, "ساري المفعول")
            .replace(/\b202\d\b/g, "")
            .trim()
        : isAr
        ? "تأمين شامل ساري المفعول"
        : "Comprehensive Insurance";

      return {
        id: v.plate_number || `VEH-${idx}`,
        plateNumber: finalPlate,
        vehicleType: v.vehicle_type || (isAr ? "مركبة سياحية فاخرة" : "Luxury Tour Vehicle"),
        name: `${v.vehicle_type || (isAr ? "مركبة سياحية" : "Tour Vehicle")}`,
        category: cat,
        categoryLabelAr: catLabels[cat]?.ar || cat,
        categoryLabelEn: catLabels[cat]?.en || cat,
        vehicleStatus: v.vehicle_status || (isAr ? "جاهزة" : "Ready"),
        seats: Number(v.seating_capacity) || (cat === "حافلة سياحية" ? 45 : cat === "سيارة دفع رباعي (4x4)" ? 6 : 14),
        pricePerDay: Number(v.daily_rate) || 350,
        insuranceDetails: cleanInsurance,
        insuranceDocument: v.insurance_image || v.insurance_document || "/assets/test-enhanced.jpg",
        photos: v.vehicle_image ? [v.vehicle_image] : [defaultPhoto],

        company:
          v.company_name || parentCompany?.company_name || parentCompany?.name || (isAr ? "شركة النقل السياحي" : "Transport Co."),
        companyPhone: parentCompany?.phone_number || parentCompany?.phone || "",
        companyEmail: parentCompany?.email || "",
        city: normalizedCity,
        companyAddress:
          parentCompany?.address && !parentCompany.address.startsWith("http")
            ? parentCompany.address
            : isAr
            ? `المقر الرئيسي - ${normalizedCity}`
            : `Headquarters - ${normalizedCity}`,
        googleMapsUrl:
          parentCompany?.google_maps_url ||
          (parentCompany?.address && (parentCompany.address.startsWith("http") || parentCompany.address.includes("maps"))
            ? parentCompany.address
            : "") ||
          "",
        companyStatus: parentCompany?.verification_status || parentCompany?.status || (isAr ? "موثق" : "Verified"),

        hasDriver,
        driverName: hasDriver ? assignedDriver!.full_name : (isAr ? "لم يتم تعيين سائق لهذه المركبة" : "No driver assigned"),
        driverLicense: hasDriver ? (assignedDriver!.driver_license_number || "") : "",
        driverPhone: hasDriver ? (assignedDriver!.phone_number || "") : "",
        driverOperationalStatus: hasDriver ? (assignedDriver!.operational_status || (isAr ? "جاهز" : "Available")) : (isAr ? "لم يتم تعيين سائق" : "Unassigned"),
        driverEmail: hasDriver ? (assignedDriver!.email || "") : "",
      };
    });
  }, [rawVehicles, rawDrivers, verifiedContractNumbers, verifiedCompanyNames, verifiedCompanies, isAr]);

  // Filtered vehicles
  const filtered = useMemo(() => {
    return vehicles.filter((v) => {
      const matchCity =
        city === "all" ||
        v.city.toLowerCase().includes(city.toLowerCase()) ||
        (city === "طرابلس" && (v.city.includes("طرابلس") || v.city.toLowerCase().includes("tripoli"))) ||
        (city === "بنغازي" && (v.city.includes("بنغازي") || v.city.toLowerCase().includes("benghazi")));

      const matchCat = categoryFilter === "all" || v.category === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.company.toLowerCase().includes(q) ||
        v.driverName.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.plateNumber.toLowerCase().includes(q);
      return matchCity && matchCat && matchSearch;
    });
  }, [vehicles, city, categoryFilter, searchQuery]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openVehicleModal = (v: Vehicle, tab: "specs" | "driver" = "specs") => {
    setSelectedVehicle(v);
    setModalTab(tab);
  };

  const [isHovered, setIsHovered] = useState(false);

  // Auto-scroll smooth motion from Right to Left as explicitly requested by user
  useEffect(() => {
    if (isViewAll || filtered.length <= 1) return;
    const timer = setInterval(() => {
      if (isHovered || !sliderRef.current) return;
      const el = sliderRef.current;
      const maxScroll = el.scrollWidth - el.clientWidth;
      const step = 360;

      // In RTL (Arabic), scroll moves leftwards (negative or towards end)
      const currentScroll = Math.abs(el.scrollLeft);
      if (currentScroll >= maxScroll - 40) {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        el.scrollBy({ left: isAr ? -step : step, behavior: "smooth" });
      }
    }, 2800);

    return () => clearInterval(timer);
  }, [isViewAll, filtered.length, isHovered, isAr]);

  // Horizontal Scroll Handlers
  const scrollSlider = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    const scrollAmount = 380;
    const factor = direction === "left" ? -scrollAmount : scrollAmount;
    sliderRef.current.scrollBy({ left: isAr ? -factor : factor, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA]" dir={dir}>
      <Header active="transport" />

      {/* ── 1. UNIFIED HERO SECTION (Identical Standard Height & Aesthetics as Hotels, Attractions & Restaurants) ── */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#003580]">
        <HeroSlideshow
          images={[
            "/assets/transport-hero.jpg",
            "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg",
            "/assets/private-trip.jpg",
            "/assets/6692d389-47a4-48fc-a344-016619726724.jpg",
          ]}
          alt="السيارات ووسائل النقل السياحي في ليبيا"
          brightness="brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#003580]/90 via-[#003580]/45 to-transparent z-10" />
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-12 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit mb-2.5 border border-white/25">
            🚌 {isAr ? "أسطول النقل والمواصلات السياحية المعتمد في ليبيا" : "Certified Tourist Fleet in Libya"}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black drop-shadow-lg tracking-tight">
            {isAr ? "السيارات ووسائل النقل السياحي" : "Tourist Transport & Vehicles"}
          </h1>
          <p className="mt-2 text-white/95 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-sm">
            {isAr
              ? "استكشف أسطول الحافلات السياحية الكبرى، ميني باص VIP، وسيارات الدفع الرباعي 4x4 مع بيانات السائقين والشركات المعتمدة في طرابلس وبنغازي."
              : "Discover certified tour coaches, VIP minibuses, and 4x4 cruisers with vetted drivers and registered transport companies in Tripoli and Benghazi."}
          </p>
        </div>
      </div>

      {/* ── 2. UNIFIED FLOATING FILTER PANEL (Matching Hotels, Attractions & Restaurants) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E8E2D6] text-[#0F172A]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 bg-[#F0F4F8] rounded-2xl border border-blue-100">
            {/* 1. Search Input */}
            <div className="lg:col-span-5 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🔍</span>
              <div className="relative flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "البحث عن وسيلة نقل أو شركة:" : "Search Transport or Company:"}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? "ابحث باسم المركبة، الشركة، أو السائق..." : "Search by vehicle, company, driver..."}
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

            {/* 2. Vehicle Category Select */}
            <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">🚌</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "نوع وسيلة النقل:" : "Vehicle Type:"}
                </label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">{isAr ? "كافة أنواع المركبات" : "All Vehicle Types"}</option>
                  <option value="حافلة سياحية">{isAr ? "حافلة سياحية" : "Tourist Bus"}</option>
                  <option value="ميني باص">{isAr ? "ميني باص" : "Mini Bus"}</option>
                  <option value="فان">{isAr ? "فان" : "Van"}</option>
                  <option value="سيارة دفع رباعي (4x4)">{isAr ? "سيارة دفع رباعي (4x4)" : "4x4 SUV"}</option>
                  <option value="سيدان">{isAr ? "سيدان" : "Sedan"}</option>
                </select>
              </div>
            </div>

            {/* 3. City Select - Strictly Tripoli & Benghazi per user requirement */}
            <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-[#003580] font-bold text-base">📍</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">
                  {isAr ? "المدينة:" : "City:"}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">{isAr ? "كافة المدن (طرابلس وبنغازي)" : "All Cities (Tripoli & Benghazi)"}</option>
                  <option value="طرابلس">{isAr ? "طرابلس" : "Tripoli"}</option>
                  <option value="بنغازي">{isAr ? "بنغازي" : "Benghazi"}</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. CREATIVE FLEET SHOWCASE: HORIZONTAL LUXURY SLIDER (No Native Scrollbar Arrows) + VIEW ALL TOGGLE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {/* Showcase Header with Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-xl sm:text-2xl font-black text-[#003580] tracking-tight">
                {isAr ? "معرض أسطول النقل المعتمد" : "Certified Fleet Showcase"}
              </h3>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-blue-50 text-[#003580] border border-blue-200">
                {filtered.length} {isAr ? "مركبة" : "vehicles"}
              </span>
              {!isViewAll && filtered.length > 1 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold animate-pulse">
                  <span>🚗</span>
                  <span>{isAr ? "حركة انسيابية للسيارات (من اليمين إلى اليسار)" : "Moving Fleet (Right to Left)"}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {isAr
                ? "تصفح أسطول المركبات بمواصفاتها الميكانيكية المعتمدة وبيانات السائق والشركة المشغلة"
                : "Browse verified vehicle specifications, assigned drivers, and registered transport companies"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View All / Slider Toggle Button */}
            <button
              type="button"
              onClick={() => setIsViewAll(!isViewAll)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                isViewAll
                  ? "bg-[#D96B27] text-white shadow-orange-500/20"
                  : "bg-white hover:bg-slate-50 text-[#003580] border-2 border-blue-200"
              }`}
            >
              {isViewAll ? <Columns3 className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
              <span>
                {isViewAll
                  ? isAr
                    ? "العودة للشريط الأفقي (سلايدر)"
                    : "Back to Slider"
                  : isAr
                  ? `عرض كافة الأسطول (${filtered.length})`
                  : `View All (${filtered.length})`}
              </span>
            </button>

            {/* Carousel Arrows (only in slider mode) */}
            {!isViewAll && filtered.length > 0 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollSlider("left")}
                  aria-label="Previous"
                  className="w-9 h-9 rounded-xl bg-white hover:bg-blue-50 text-[#003580] border-2 border-blue-200 flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider("right")}
                  aria-label="Next"
                  className="w-9 h-9 rounded-xl bg-white hover:bg-blue-50 text-[#003580] border-2 border-blue-200 flex items-center justify-center transition shadow-xs cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-slate-200 shadow-xs max-w-md mx-auto my-8">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#D96B27] flex items-center justify-center text-3xl mx-auto mb-3">
              🚌
            </div>
            <h4 className="text-base font-black text-[#003580] mb-1">
              {isAr ? "لا توجد مركبات مطابقة للبحث" : "No matching vehicles found"}
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              {isAr ? "جرّب تغيير التصنيف أو اختيار مدينة أخرى." : "Try resetting your category or city filter."}
            </p>
            <button
              onClick={() => {
                setCategoryFilter("all");
                setCity("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white text-xs font-bold transition shadow-sm"
            >
              {isAr ? "عرض كل الأسطول" : "Show All Fleet"}
            </button>
          </div>
        ) : !isViewAll ? (
          /* ── 3A. HORIZONTAL SLIDER (Auto-moving Right-to-Left, Pause on hover) ── */
          <div className="relative">
            <div
              ref={sliderRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {filtered.map((v) => {
                const isFav = !!likedMap[v.id];
                return (
                  <div
                    key={v.id}
                    onClick={() => openVehicleModal(v, "specs")}
                    className="w-[320px] sm:w-[350px] shrink-0 snap-start group bg-white rounded-3xl border-2 border-[#D8DEE4] hover:border-[#003580] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                  >
                    {/* Photo Container */}
                    <div className="relative h-52 bg-slate-800 overflow-hidden">
                      <img
                        src={v.photos[0]}
                        alt={v.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                      {/* Category Badge */}
                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white text-[10px] font-black shadow-md flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {isAr ? v.categoryLabelAr : v.categoryLabelEn}
                        </span>
                      </div>

                      {/* Wishlist Button */}
                      <button
                        type="button"
                        onClick={(e) => toggleLike(v.id, e)}
                        className={`absolute top-3.5 left-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md cursor-pointer ${
                          isFav ? "bg-white text-red-500" : "bg-black/30 text-white hover:bg-white hover:text-red-500"
                        }`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
                      </button>

                      {/* Libyan Plate Frame + City Badge */}
                      <div className="absolute bottom-3 right-3 left-3 z-10 flex items-center justify-between">
                        <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg border-2 border-[#003580]/30 shadow-md flex items-center gap-1 font-mono text-[10px] font-black text-[#003580] tracking-wider">
                          <span>🇱🇾</span>
                          <span>{v.plateNumber}</span>
                        </div>

                        <div className="flex items-center gap-1 text-white text-[11px] font-bold bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20">
                          <MapPin className="w-3.5 h-3.5 text-amber-300" />
                          <span>{v.city}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                      <div>
                        {/* Company Badge */}
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="text-[11px] font-black text-[#003580] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 flex items-center gap-1">
                            <Building2 className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{v.company}</span>
                          </div>
                          <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                            ✓ {v.vehicleStatus}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-base font-black text-[#0F172A] group-hover:text-[#003580] transition-colors leading-tight line-clamp-1">
                          {v.vehicleType}
                        </h4>

                        {/* Specs row */}
                        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center text-xs">
                          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <div className="text-[9px] font-bold text-slate-400">{isAr ? "السعة" : "Seats"}</div>
                            <div className="font-black text-slate-800 text-xs flex items-center justify-center gap-1 mt-0.5">
                              <Users className="w-3 h-3 text-[#D96B27]" />
                              <span>{v.seats}</span>
                            </div>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <div className="text-[9px] font-bold text-slate-400">{isAr ? "التكييف" : "AC"}</div>
                            <div className="font-black text-emerald-700 text-[10px] mt-0.5">
                              {isAr ? "مركزي ❄️" : "Central"}
                            </div>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                            <div className="text-[9px] font-bold text-slate-400">{isAr ? "التأمين" : "Insurance"}</div>
                            <div className="font-black text-blue-700 text-[10px] mt-0.5">
                              {isAr ? "شامل 🛡️" : "Full"}
                            </div>
                          </div>
                        </div>

                        {/* Dedicated Driver Snippet */}
                        <div className="mt-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                            v.hasDriver ? "bg-orange-100 text-[#D96B27]" : "bg-slate-200 text-slate-500"
                          }`}>
                            🧑‍✈️
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[9px] font-bold text-slate-400">{isAr ? "السائق المعتمد" : "Driver"}</div>
                            <div className={`text-[11px] font-black truncate ${v.hasDriver ? "text-slate-900" : "text-amber-800"}`}>
                              {v.hasDriver ? v.driverName : (isAr ? "لم يتم تعيين سائق لهذه المركبة" : "No driver assigned")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer: Specs CTA (Delni Blue instead of black) */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[9px] font-bold text-slate-400">{isAr ? "التسعير الاسترشادي" : "Tour Rate"}</div>
                          <div className="text-base font-black text-[#003580]">
                            {v.pricePerDay} <span className="text-[10px] font-bold text-slate-500">{isAr ? "د.ل/يوم" : "LYD"}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            openVehicleModal(v, "specs");
                          }}
                          className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isAr ? "المواصفات والاعتماد" : "View Specs"}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── 3B. EXPANDED ALL FLEET GRID (When clicking "عرض الكل") ── */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((v) => {
              const isFav = !!likedMap[v.id];
              return (
                <div
                  key={v.id}
                  onClick={() => openVehicleModal(v, "specs")}
                  className="group bg-white rounded-3xl border-2 border-[#D8DEE4] hover:border-[#003580] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  {/* Photo Container */}
                  <div className="relative h-56 bg-slate-800 overflow-hidden">
                    <img
                      src={v.photos[0]}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                    <div className="absolute top-3.5 right-3.5 z-10">
                      <span className="px-2.5 py-1 rounded-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white text-[10px] font-black shadow-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        {isAr ? v.categoryLabelAr : v.categoryLabelEn}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => toggleLike(v.id, e)}
                      className={`absolute top-3.5 left-3.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-md cursor-pointer ${
                        isFav ? "bg-white text-red-500" : "bg-black/30 text-white hover:bg-white hover:text-red-500"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-red-500" : ""}`} />
                    </button>

                    <div className="absolute bottom-3 right-3 left-3 z-10 flex items-center justify-between">
                      <div className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-lg border-2 border-[#003580]/30 shadow-md flex items-center gap-1 font-mono text-[10px] font-black text-[#003580] tracking-wider">
                        <span>🇱🇾</span>
                        <span>{v.plateNumber}</span>
                      </div>

                      <div className="flex items-center gap-1 text-white text-xs font-bold bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-lg border border-white/20">
                        <MapPin className="w-3.5 h-3.5 text-amber-300" />
                        <span>{v.city}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <div className="text-[11px] font-black text-[#003580] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span className="truncate max-w-[150px]">{v.company}</span>
                        </div>
                        <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ {v.vehicleStatus}
                        </div>
                      </div>

                      <h4 className="text-lg font-black text-[#0F172A] group-hover:text-[#003580] transition-colors leading-tight">
                        {v.vehicleType}
                      </h4>

                      <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">{isAr ? "السعة" : "Seats"}</div>
                          <div className="font-black text-slate-800 flex items-center justify-center gap-1 mt-0.5">
                            <Users className="w-3.5 h-3.5 text-[#D96B27]" />
                            <span>{v.seats}</span>
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">{isAr ? "التكييف" : "AC"}</div>
                          <div className="font-black text-emerald-700 text-[11px] mt-0.5">
                            {isAr ? "مركزي ❄️" : "Central"}
                          </div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                          <div className="text-[10px] font-bold text-slate-400">{isAr ? "التأمين" : "Insurance"}</div>
                          <div className="font-black text-blue-700 text-[11px] mt-0.5">
                            {isAr ? "شامل 🛡️" : "Full"}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                          v.hasDriver ? "bg-orange-100 text-[#D96B27]" : "bg-slate-200 text-slate-500"
                        }`}>
                          🧑‍✈️
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] font-bold text-slate-400">{isAr ? "السائق المعتمد" : "Driver"}</div>
                          <div className={`text-xs font-black truncate ${v.hasDriver ? "text-slate-900" : "text-amber-800"}`}>
                            {v.hasDriver ? v.driverName : (isAr ? "لم يتم تعيين سائق لهذه المركبة" : "No driver assigned")}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-[10px] font-bold text-slate-400">{isAr ? "التسعير الاسترشادي" : "Tour Rate"}</div>
                        <div className="text-lg font-black text-[#003580]">
                          {v.pricePerDay} <span className="text-xs font-bold text-slate-500">{isAr ? "د.ل/يوم" : "LYD"}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openVehicleModal(v, "specs");
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white text-xs font-black transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{isAr ? "المواصفات والاعتماد" : "View Specs"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── 4. VERIFIED TRANSPORT PARTNERS ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-br from-[#0B1E38] via-[#00224F] to-[#003580] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-black text-amber-300 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>{isAr ? "شركاء النقل السياحي المعتمدون" : "Official Transport Partners"}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {isAr ? "الشركات المرخصة والمشغلة للأسطول" : "Certified Fleet Operators"}
              </h3>
            </div>

            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-black text-amber-300 border border-white/20 w-fit">
              {verifiedCompanies.length} {isAr ? "شركة معتمدة" : "Operators"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
            {verifiedCompanies.map((c) => {
              const name = c.company_name || c.name;
              const count = vehicles.filter(
                (v) => v.company.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(v.company.toLowerCase()),
              ).length;
              const compCity = c.city?.includes("بنغازي") ? (isAr ? "بنغازي" : "Benghazi") : (isAr ? "طرابلس" : "Tripoli");

              return (
                <div
                  key={c.contract_number || name}
                  className="p-4 rounded-2xl bg-white/5 border border-white/15 hover:border-white/30 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0">
                      🏢
                    </div>
                    <div>
                      <h4 className="font-black text-sm tracking-tight text-white">{name}</h4>
                      <p className="text-[11px] text-slate-300 mt-0.5">
                        📍 {compCity}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-black text-amber-300 bg-white/10 px-2.5 py-1 rounded-lg shrink-0">
                    {count} {isAr ? "مركبات" : "vehicles"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5. VEHICLE SPECS MODAL (No Black Color, No Fake Dates/Static Clutter) ── */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto" dir={dir}>
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedVehicle(null)}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] overflow-y-auto z-10 border-2 border-slate-200 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#003580] flex items-center justify-center font-black text-lg">
                  🚌
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono bg-[#003580] text-white text-[10px] px-2.5 py-0.5 rounded-md font-bold">
                      🇱🇾 {selectedVehicle.plateNumber}
                    </span>
                    <span className="bg-orange-50 text-[#D96B27] text-[10px] font-black px-2 py-0.5 rounded-md">
                      {selectedVehicle.categoryLabelAr}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                      ✓ {selectedVehicle.vehicleStatus}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#003580] mt-0.5">{selectedVehicle.vehicleType}</h3>
                </div>
              </div>

              <button
                onClick={() => setSelectedVehicle(null)}
                aria-label="Close"
                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition font-black text-sm cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="px-6 border-b border-slate-100 bg-slate-50 flex items-center gap-4 text-xs font-black">
              <button
                type="button"
                onClick={() => setModalTab("specs")}
                className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  modalTab === "specs"
                    ? "border-[#003580] text-[#003580]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>{isAr ? "المواصفات الفنية والراحة" : "Vehicle Specs"}</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("driver")}
                className={`py-3 px-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  modalTab === "driver"
                    ? "border-[#003580] text-[#003580]"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>{isAr ? "السائق والشركة المشغلة" : "Driver & Company"}</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {modalTab === "specs" && (
                <div className="space-y-6">
                  {/* Photo & Quick Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-7 h-60 rounded-2xl overflow-hidden bg-slate-800 relative">
                      <img
                        src={selectedVehicle.photos[0]}
                        alt={selectedVehicle.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl text-white text-xs font-bold">
                        📍 {selectedVehicle.city} · 👥 {selectedVehicle.seats} مقعد
                      </div>
                    </div>

                    <div className="md:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] space-y-4">
                      <div>
                        <div className="text-[11px] font-bold text-slate-500">{isAr ? "التسعير الاسترشادي للرحلات" : "Tour Rate"}</div>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-3xl font-black text-[#003580]">{selectedVehicle.pricePerDay}</span>
                          <span className="text-xs font-bold text-slate-500">{isAr ? "د.ل / يوم" : "LYD / day"}</span>
                        </div>
                        <div className="text-xs text-emerald-700 font-bold mt-1">✓ فحص فني ساري وتأمين ركاب</div>
                      </div>

                      {selectedVehicle.companyPhone && (
                        <a
                          href={`tel:${selectedVehicle.companyPhone}`}
                          className="w-full py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{isAr ? "اتصال للاستفسار المباشر" : "Direct Inquiry"}</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Technical Specs Table */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <h4 className="text-sm font-black text-[#003580] flex items-center gap-2">
                      <Car className="w-4 h-4 text-[#D96B27]" />
                      <span>{isAr ? "جدول المواصفات الفنية المعتمدة" : "Technical Specifications"}</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "رقم اللوحة السياحية" : "Plate Number"}</div>
                        <div className="font-mono font-black text-[#003580] mt-0.5">{selectedVehicle.plateNumber}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "سعة المقاعد" : "Seats"}</div>
                        <div className="font-black text-slate-900 mt-0.5">{selectedVehicle.seats} مقعد</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "الفئة والتصنيف" : "Category"}</div>
                        <div className="font-black text-slate-900 mt-0.5">{selectedVehicle.categoryLabelAr}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "التكييف" : "AC"}</div>
                        <div className="font-black text-emerald-700 mt-0.5">مركزي فائق البرودة ❄️</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "حالة الفحص" : "Inspection"}</div>
                        <div className="font-black text-emerald-700 mt-0.5">{selectedVehicle.vehicleStatus}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "المدينة" : "Base City"}</div>
                        <div className="font-black text-slate-900 mt-0.5">{selectedVehicle.city}</div>
                      </div>
                    </div>

                    {/* Insurance Row with Instant Image Lightbox Preview */}
                    <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0" />
                        <div>
                          <div className="font-black text-blue-900">{isAr ? "وثيقة التأمين والركاب" : "Insurance"}</div>
                          <div className="text-[11px] text-blue-800">{selectedVehicle.insuranceDetails}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPreviewDocUrl(selectedVehicle.insuranceDocument || "/assets/test-enhanced.jpg")}
                        className="px-3.5 py-1.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                      >
                        <span>📄</span>
                        <span>{isAr ? "معاينة ورقة التأمين" : "Preview Document"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === "driver" && (
                <div className="space-y-6">
                  {/* Driver Dossier */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-[#003580] flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-[#D96B27]" />
                        <span>{isAr ? "بيانات السائق المعتمد" : "Dedicated Driver"}</span>
                      </h4>
                      <span
                        className={`text-[10px] font-black px-2.5 py-1 rounded-md ${
                          selectedVehicle.hasDriver ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {selectedVehicle.hasDriver ? (isAr ? "مسند للمركبة" : "Assigned") : (isAr ? "لم يتم تعيين سائق" : "Unassigned")}
                      </span>
                    </div>

                    {selectedVehicle.hasDriver ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold">{isAr ? "اسم السائق" : "Driver Name"}</div>
                          <div className="font-black text-slate-900 text-sm mt-0.5">{selectedVehicle.driverName}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold">{isAr ? "المدينة التابع لها" : "Base City"}</div>
                          <div className="font-black text-slate-800 mt-0.5">{selectedVehicle.city}</div>
                        </div>
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold">{isAr ? "الحالة التشغيلية" : "Status"}</div>
                          <div className="font-black text-emerald-700 mt-0.5">{selectedVehicle.driverOperationalStatus}</div>
                        </div>
                        {selectedVehicle.driverPhone && (
                          <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] text-slate-400 font-bold">{isAr ? "هاتف السائق" : "Phone"}</div>
                              <div className="font-mono font-black text-slate-900 mt-0.5" dir="ltr">{selectedVehicle.driverPhone}</div>
                            </div>
                            <a
                              href={`tel:${selectedVehicle.driverPhone}`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              اتصال
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2.5">
                        <span className="text-base">⚠️</span>
                        <span>{isAr ? "لم يتم تعيين سائق لهذه المركبة حتى الآن من قبل شركة النقل المشغلة." : "No dedicated driver has been assigned to this vehicle yet."}</span>
                      </div>
                    )}
                  </div>

                  {/* Company Dossier */}
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-4">
                    <h4 className="text-sm font-black text-[#003580] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#003580]" />
                      <span>{isAr ? "بيانات شركة النقل المشغلة" : "Operating Company"}</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "اسم الشركة" : "Company"}</div>
                        <div className="font-black text-[#003580] text-sm mt-0.5">{selectedVehicle.company}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "البريد الإلكتروني للشركة" : "Company Email"}</div>
                        <div className="font-mono font-bold text-slate-800 text-xs mt-0.5 truncate">{selectedVehicle.companyEmail || "transport@dalni.ly"}</div>
                      </div>
                      <div className="p-3 rounded-xl bg-white border border-slate-200">
                        <div className="text-[10px] text-slate-400 font-bold">{isAr ? "المدينة والمقر" : "City & HQ"}</div>
                        <div className="font-black text-slate-800 mt-0.5">{selectedVehicle.companyAddress}</div>
                      </div>
                      {selectedVehicle.companyPhone && (
                        <div className="p-3 rounded-xl bg-white border border-slate-200">
                          <div className="text-[10px] text-slate-400 font-bold">{isAr ? "هاتف الشركة" : "Phone"}</div>
                          <div className="font-mono font-black text-slate-900 mt-0.5" dir="ltr">{selectedVehicle.companyPhone}</div>
                        </div>
                      )}
                    </div>

                    {selectedVehicle.googleMapsUrl && (
                      <a
                        href={selectedVehicle.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-100 text-[#003580] border border-slate-200 font-black text-xs transition flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4 text-red-500" />
                        <span>{isAr ? "عرض موقع مقر الشركة على خرائط Google" : "View HQ on Google Maps"}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── 6. INSURANCE DOCUMENT LIGHTBOX PREVIEW MODAL ── */}
      {previewDocUrl && (
        <div
          className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
          onClick={() => setPreviewDocUrl(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-[#003580] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛡️</span>
                <span className="font-black text-sm">
                  {isAr ? "معاينة ورقة وثيقة التأمين المعتمدة" : "Insurance Document Preview"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDocUrl(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center font-black transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 max-h-[72vh] overflow-auto flex items-center justify-center bg-slate-100">
              <img
                src={previewDocUrl}
                alt="وثيقة التأمين"
                className="max-h-[68vh] w-auto max-w-full object-contain rounded-xl shadow-md border border-slate-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/assets/test-enhanced.jpg";
                }}
              />
            </div>

            <div className="p-3.5 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">
                {selectedVehicle ? `لوحة المركبة: ${selectedVehicle.plateNumber} (${selectedVehicle.company})` : ""}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewDocUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>↗</span>
                  <span>{isAr ? "فتح في نافذة كاملة" : "Full View"}</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewDocUrl(null)}
                  className="px-4 py-1.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black transition cursor-pointer"
                >
                  {isAr ? "إغلاق" : "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
