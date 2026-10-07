import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { HeroSlideshow } from "@/components/HeroSlideshow";

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
  name: string;
  category: "bus_large" | "minibus_vip" | "suv_4x4";
  categoryLabelAr: string;
  categoryLabelEn: string;
  company: string;
  companyPhone: string;
  city: string;
  driverName: string;
  driverPhone: string;
  driverExperience: string;
  seats: number;
  rating: number;
  ratingWord: string;
  reviewsCount: number;
  pricePerDay: number;
  originalPricePerDay: number;
  photos: string[];
  desc: string;
  features: string[];
};

function getVehicles(lang: "ar" | "en"): Vehicle[] {
  const isAr = lang === "ar";
  return [
    {
      id: "VEH-001",
      name: isAr ? "مرسيدس سبرنتر VIP كبار الشخصيات 2024" : "Mercedes-Benz Sprinter VIP 2024",
      category: "minibus_vip",
      categoryLabelAr: "ميني باص VIP",
      categoryLabelEn: "VIP Minibus",
      company: isAr ? "شركة السهم الذهبي للنقل السياحي" : "Golden Arrow Transport Co.",
      companyPhone: "+218 91 333 4455",
      city: isAr ? "طرابلس" : "Tripoli",
      driverName: isAr ? "الكابتن عادل المقرحي" : "Capt. Adel Al-Meqrahi",
      driverPhone: "+218 91 333 4455",
      driverExperience: isAr ? "خبرة 12 سنة في نقل الوفود والشخصيات المهمة" : "12 years VIP delegation driver",
      seats: 12,
      rating: 9.6,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 840,
      pricePerDay: 580,
      originalPricePerDay: 720,
      photos: [
        "/assets/office-bus.jpg",
        "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg",
        "/assets/transport-hero.jpg",
      ],
      desc: isAr
        ? "ميني باص مخصص لكبار الشخصيات ورجال الأعمال والعائلات الراقية، مقاعد جلدية فاخرة متحركة، شاشات ترفيه فردية، طاولات اجتماعات، وثلاجة مشروبات."
        : "Luxury VIP minibus with leather reclining captain seats, entertainment screens, and refrigerator.",
      features: [
        isAr ? "مقاعد جلدية متحركة فاخرة" : "Luxury Reclining Leather Seats",
        isAr ? "تكييف حراري فائق وموزع" : "Climate Dual AC",
        isAr ? "واي فاي وإنترنت فضائي" : "Satellite WiFi",
        isAr ? "شاشات وشواحن لكل مقعد" : "Screens & USB Ports",
      ],
    },
    {
      id: "VEH-002",
      name: isAr ? "حافلة يوتونغ السياحية الملكية 50 مقعد" : "Yutong Royal Tour Coach 50 Seats",
      category: "bus_large",
      categoryLabelAr: "باص سياحي كبير",
      categoryLabelEn: "Large Tour Coach",
      company: isAr ? "شركة الأفق الدولية للنقل والرحلات" : "Al-Ofoq International Transport",
      companyPhone: "+218 92 111 8899",
      city: isAr ? "بنغازي" : "Benghazi",
      driverName: isAr ? "الكابتن عمران الفيتوري" : "Capt. Omran Al-Fitouri",
      driverPhone: "+218 92 111 8899",
      driverExperience: isAr ? "خبرة 16 سنة في الرحلات الكبرى بين المدن" : "16 years intercity coach experience",
      seats: 50,
      rating: 9.3,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 1290,
      pricePerDay: 1150,
      originalPricePerDay: 1450,
      photos: [
        "/assets/6692d389-47a4-48fc-a344-016619726724.jpg",
        "/assets/transport-hero.jpg",
        "/assets/office-bus.jpg",
      ],
      desc: isAr
        ? "حافلة سياحية ضخمة ومجهزة بأحدث وسائل الراحة للمجموعات السياحية والمؤتمرات، كراسي مريحة، حمام داخلي، ميكروفون سياحي، ومساحة شحن أمتعة عملاقة."
        : "Full-sized 50-passenger long distance tourist coach with onboard restroom and guide mic.",
      features: [
        isAr ? "حمام داخلي مجهز" : "Onboard Restroom",
        isAr ? "نظام صوتي وسماعات للمرشد" : "Guide Microphone & Sound System",
        isAr ? "مستودعات أمتعة ضخمة" : "Huge Luggage Compartments",
        isAr ? "كاميرات مراقبة وأمان" : "Safety Security Cameras",
      ],
    },
    {
      id: "VEH-003",
      name: isAr ? "تويوتا كوستر سياحية VIP 24 مقعد" : "Toyota Coaster VIP 24 Seats",
      category: "bus_large",
      categoryLabelAr: "باص سياحي متوسط",
      categoryLabelEn: "Medium Tour Bus",
      company: isAr ? "شركة السهم الذهبي للنقل السياحي" : "Golden Arrow Transport Co.",
      companyPhone: "+218 91 555 1122",
      city: isAr ? "طرابلس" : "Tripoli",
      driverName: isAr ? "الكابتن مصطفى الشريف" : "Capt. Mustafa Al-Sharif",
      driverPhone: "+218 91 555 1122",
      driverExperience: isAr ? "خبرة 10 سنوات في مسارات لبدة وصبراتة" : "10 years tourist tours experience",
      seats: 24,
      rating: 9.1,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 710,
      pricePerDay: 490,
      originalPricePerDay: 620,
      photos: [
        "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg",
        "/assets/office-bus.jpg",
        "/assets/transport-hero.jpg",
      ],
      desc: isAr
        ? "حافلة كوستر حديثة ومريحة جداً مثالية للجولات اليومية والأفواج المتوسطة، تكييف قوي ومقاعد مريحة وعوازل صوتية."
        : "Modern Toyota Coaster bus ideal for medium tour groups and day excursions.",
      features: [
        isAr ? "تكييف هواء مركزي قوي" : "Strong Central AC",
        isAr ? "شاشة ترفيه وإرشاد" : "Tour Display Screen",
        isAr ? "ثلاجة مياه ومشروبات" : "Water Cooler",
      ],
    },
    {
      id: "VEH-004",
      name: isAr ? "هيونداي H1 رويال VIP 9 مقاعد" : "Hyundai H1 Royal VIP 9 Seats",
      category: "minibus_vip",
      categoryLabelAr: "ميني باص VIP",
      categoryLabelEn: "VIP Minibus",
      company: isAr ? "شركة برقة للنقل الفاخر" : "Barqa Luxury Transport",
      companyPhone: "+218 92 666 3311",
      city: isAr ? "بنغازي" : "Benghazi",
      driverName: isAr ? "الكابتن فتحي الدرسي" : "Capt. Fathi Al-Dersi",
      driverPhone: "+218 92 666 3311",
      driverExperience: isAr ? "خبرة 9 سنوات في رحلات الجبل الأخضر وشحات" : "9 years Green Mountain specialist",
      seats: 9,
      rating: 9.0,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 560,
      pricePerDay: 350,
      originalPricePerDay: 440,
      photos: [
        "/assets/office-bus.jpg",
        "/assets/69262c03-9b5e-485f-88ef-723c7bd432bc.jpg",
        "/assets/transport-hero.jpg",
      ],
      desc: isAr
        ? "ميني باص عائلي فخم ومريح بمقاعد فردية واسعة، مناسب جداً للرحلات العائلية والجولات السياحية الخاصة بين المدن والمواقع الأثرية."
        : "Spacious comfortable VIP family van with captain seats.",
      features: [
        isAr ? "مقاعد كابتن مريحة" : "Captain Seats",
        isAr ? "تكييف مزدوج أمامي وخلفي" : "Dual Front/Rear AC",
        isAr ? "زجاج مظلل عازل للحرارة" : "Tinted Solar Glass",
      ],
    },
    {
      id: "VEH-005",
      name: isAr ? "تويوتا لاندكروزر 4x4 صحراوي V8" : "Toyota Land Cruiser 4x4 Sahara V8",
      category: "suv_4x4",
      categoryLabelAr: "دفع رباعي صحراوي",
      categoryLabelEn: "4x4 Desert SUV",
      company: isAr ? "شركة الرمال الذهبية لخدمات السفاري" : "Golden Sands Safari Co.",
      companyPhone: "+218 91 888 2211",
      city: isAr ? "أوباري" : "Ubari",
      driverName: isAr ? "الكابتن إبراهيم الطارقي" : "Capt. Ibrahim Tuareg",
      driverPhone: "+218 91 888 2211",
      driverExperience: isAr ? "خبرة 15 سنة في مسارات رملة أوباري وجبال أكاكوس" : "15 years Erg Ubari desert master",
      seats: 6,
      rating: 9.7,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 1540,
      pricePerDay: 620,
      originalPricePerDay: 780,
      photos: [
        "/assets/private-trip.jpg",
        "/assets/transport-hero.jpg",
        "/assets/dest-sahara-dunes.jpg",
      ],
      desc: isAr
        ? "سيارة دفع رباعي مجهزة بكامل معدات عبور الكثبان الرملية العالية في أوباري وأكاكوس وغدامس، جهاز ملاحة GPS بالأقمار الصناعية ومعدات تخييم."
        : "Heavy duty 4x4 safari cruiser fully fitted for Sahara sand dunes and Acacus expedition.",
      features: [
        isAr ? "دفع رباعي كامل 4x4 Diff-Lock" : "Full 4x4 Diff-Lock",
        isAr ? "جهاز اتصال وملاحة بالصحراء" : "Satellite GPS Navigation",
        isAr ? "معدات إنقاذ وضغط إطارات" : "Desert Recovery Kit",
      ],
    },
    {
      id: "VEH-006",
      name: isAr ? "تويوتا لاندكروزر برادو VIP دفع رباعي وسياحي" : "Toyota Prado Luxury SUV VIP",
      category: "suv_4x4",
      categoryLabelAr: "دفع رباعي وصالون فاخر",
      categoryLabelEn: "Luxury SUV VIP",
      company: isAr ? "شركة السهم الذهبي للنقل السياحي" : "Golden Arrow Transport Co.",
      companyPhone: "+218 91 333 4455",
      city: isAr ? "طرابلس" : "Tripoli",
      driverName: isAr ? "الكابتن طارق الورفلي" : "Capt. Tariq Al-Warfali",
      driverPhone: "+218 91 333 4455",
      driverExperience: isAr ? "خبرة 11 سنة في الجولات الساحلية الخاصة والدبلوماسية" : "11 years VIP tourist driver",
      seats: 7,
      rating: 9.5,
      ratingWord: isAr ? "استثنائي" : "Superb",
      reviewsCount: 920,
      pricePerDay: 480,
      originalPricePerDay: 600,
      photos: [
        "/assets/transport-hero.jpg",
        "/assets/office-bus.jpg",
        "/assets/dest-harbor-coast.jpg",
      ],
      desc: isAr
        ? "سيارة دفع رباعي وصالون راقية تجمع بين الفخامة والراحة على الطرق السريعة والقدرة على عبور مختلف التضاريس السياحية."
        : "Luxury SUV ideal for corporate delegations, family coastal tours and highway travel.",
      features: [
        isAr ? "مقاعد جلدية مريحة 7 ركاب" : "7-Passenger Leather Seating",
        isAr ? "نظام ملاحة وتكييف ثلاثي" : "Tri-Zone Climate Control",
        isAr ? "ثلاجة مشروبات وواي فاي" : "Drinks Cooler & WiFi",
      ],
    },
  ];
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

  const vehicles = useMemo(() => getVehicles(language), [language]);

  const companies = useMemo(
    () => [
      { key: "all", label: isAr ? "كافة شركات النقل المعتمدة" : "All Transport Companies" },
      { key: "السهم الذهبي", label: isAr ? "شركة السهم الذهبي للنقل" : "Golden Arrow Co." },
      { key: "الأفق", label: isAr ? "شركة الأفق الدولية" : "Al-Ofoq Co." },
      { key: "برقة", label: isAr ? "شركة برقة للنقل الفاخر" : "Barqa Luxury Co." },
      { key: "الرمال الذهبية", label: isAr ? "شركة الرمال الذهبية للسفاري" : "Golden Sands Safari" },
    ],
    [isAr],
  );

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
      const matchComp = companyFilter === "all" || v.company.includes(companyFilter);
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
        {/* ── 3. TOP FLEET SHOWCASE (Matching Hotels Top Deals Row) ── */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                {isAr ? "أفضل أسطول نقل ومركبات سياحية VIP" : "Top Luxury Tourist Fleet"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                {isAr
                  ? "مركبات سياحية حديثة ومكيفة تخضع لأعلى معايير السلامة والفحص الدوري مع سائقين محترفين"
                  : "State-of-the-art air conditioned tourist vehicles maintained to the highest safety standards"}
              </p>
            </div>
            <span className="text-xs font-black text-[#003580] bg-[#003580]/10 px-3 py-1 rounded-full border border-[#003580]/20">
              🛡️ {vehicles.length} {isAr ? "مركبات مرخصة" : "Licensed Fleet"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.slice(0, 3).map((v) => {
              const isFav = !!likedMap[v.id];
              return (
                <article
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="group bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between"
                >
                  <div className="relative h-48 overflow-hidden bg-slate-900">
                    <img
                      src={v.photos[0]}
                      alt={v.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70" />

                    {/* Favorite Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleLike(v.id, e)}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-sm z-10 cursor-pointer ${
                        isFav ? "bg-white text-red-500" : "bg-black/35 text-white hover:bg-white hover:text-red-500"
                      }`}
                      title={isAr ? "إضافة للمفضلة" : "Save to wishlist"}
                    >
                      <span className="text-sm">{isFav ? "❤️" : "🤍"}</span>
                    </button>

                    <div className="absolute top-2.5 left-2.5 bg-[#003580] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-sm">
                      {isAr ? v.categoryLabelAr : v.categoryLabelEn}
                    </div>

                    <div className="absolute bottom-2.5 right-2.5 text-white text-xs font-bold bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-white/15">
                      📍 {v.city} · 👥 {v.seats} {isAr ? "مقعد" : "seats"}
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-[#003580] bg-[#003580]/10 px-2 py-0.5 rounded w-fit mb-1">
                        🏢 {v.company}
                      </div>
                      <h3 className="font-black text-base text-[#0F172A] group-hover:text-[#003580] transition-colors leading-snug">
                        {v.name}
                      </h3>
                      <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                        <span>🧑‍✈️</span>
                        <span>{v.driverName}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      {/* Booking.com Blue Rating Badge */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#003580] text-white font-black text-xs flex items-center justify-center">
                          {v.rating}
                        </div>
                        <div className="text-[11px] font-bold text-[#0F172A]">
                          <span>{v.ratingWord}</span>
                          <span className="text-slate-400 font-normal mr-1 block text-[10px]">
                            {v.reviewsCount} {isAr ? "تقييم" : "reviews"}
                          </span>
                        </div>
                      </div>

                      <div className="text-left" dir="ltr">
                        <span className="text-xs text-red-400 line-through font-bold block">
                          LYD {v.originalPricePerDay}
                        </span>
                        <span className="text-sm font-black text-[#0F172A]">
                          LYD {v.pricePerDay} / {isAr ? "يوم" : "day"}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
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
            {filtered.map((v) => {
              const isFav = !!likedMap[v.id];
              return (
                <article
                  key={v.id}
                  onClick={() => setSelectedVehicle(v)}
                  className="group bg-white rounded-2xl border border-slate-200 hover:border-[#003580]/40 shadow-xs hover:shadow-lg transition-all p-3 sm:p-4 cursor-pointer flex flex-col md:flex-row gap-4"
                >
                  {/* Photo */}
                  <div className="relative w-full md:w-64 h-48 sm:h-52 rounded-xl overflow-hidden shrink-0 bg-slate-900">
                    <img
                      src={v.photos[0]}
                      alt={v.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <button
                      type="button"
                      onClick={(e) => toggleLike(v.id, e)}
                      className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition shadow-xs z-10 cursor-pointer ${
                        isFav ? "bg-white text-red-500" : "bg-black/40 text-white hover:bg-white hover:text-red-500"
                      }`}
                      title={isAr ? "إضافة للمفضلة" : "Save to wishlist"}
                    >
                      <span className="text-sm">{isFav ? "❤️" : "🤍"}</span>
                    </button>
                    <div className="absolute top-2.5 left-2.5 bg-[#003580] text-white text-[10px] font-black px-2.5 py-0.5 rounded-full">
                      {isAr ? v.categoryLabelAr : v.categoryLabelEn}
                    </div>
                  </div>

                  {/* Middle Column: Details, Specs, Company & Driver */}
                  <div className="flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="text-lg font-black text-[#003580] group-hover:underline">
                          {v.name}
                        </h4>
                        <span className="text-[10px] font-black text-[#003580] bg-[#003580]/10 border border-[#003580]/20 px-2 py-0.5 rounded-md">
                          🏢 {v.company}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>📍 {v.city}</span>
                        <span>·</span>
                        <span>👥 {v.seats} {isAr ? "مقعد مريح" : "comfortable seats"}</span>
                        <span>·</span>
                        <span className="text-emerald-700 font-bold">✓ {isAr ? "فحص دوري معتمد" : "Certified Safety"}</span>
                      </div>

                      {/* Driver & Company Spec Card */}
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                        <div className="font-black text-[#0F172A] flex items-center gap-1.5">
                          <span>🧑‍✈️</span>
                          <span>{v.driverName}</span>
                          <span className="text-slate-400 font-normal text-[11px]">({v.driverExperience})</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
                      <span>📞 {v.driverPhone}</span>
                      <span>·</span>
                      <span className="text-[#003580] font-black">{v.company}</span>
                    </div>
                  </div>

                  {/* Right Column: Rating & Price & Action Button */}
                  <div className="md:w-52 flex flex-col justify-between items-end shrink-0 border-t md:border-t-0 md:border-s md:border-slate-100 pt-3 md:pt-0 md:ps-4">
                    {/* Score Header */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <div className="font-black text-xs text-[#0F172A]">{v.ratingWord}</div>
                        <div className="text-[10px] text-slate-400">{v.reviewsCount} {isAr ? "تقييم" : "reviews"}</div>
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-[#003580] text-white font-black text-sm flex items-center justify-center">
                        {v.rating}
                      </div>
                    </div>

                    <div className="text-right my-2">
                      <div className="text-[10px] text-slate-400 font-bold">
                        {isAr ? "سعر التأجير اليومي مع السائق" : "Daily Rate with Driver"}
                      </div>
                      <div className="flex items-baseline justify-end gap-1.5">
                        <span className="text-xs text-red-500 line-through font-bold">
                          {v.originalPricePerDay} {isAr ? "د.ل" : "LYD"}
                        </span>
                        <span className="text-xl font-black text-[#0F172A]">
                          {v.pricePerDay} <span className="text-xs text-slate-500 font-bold">{isAr ? "د.ل/يوم" : "LYD/day"}</span>
                        </span>
                      </div>
                      <div className="text-[10px] text-emerald-600 font-bold">
                        ✓ {isAr ? "شامل الوقود والسائق" : "Driver & Fuel Included"}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicle(v);
                      }}
                      className="w-full py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <span>{isAr ? "عرض التفاصيل وطلب المركبة" : "View Details & Hire"}</span>
                      <span>➔</span>
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>

      {/* ── 6. VEHICLE DETAILS MODAL (Matching Hotels Booking.com Style) ── */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto" dir={dir}>
          <div className="fixed inset-0 bg-black/65 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedVehicle(null)} />

          <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto z-10 border border-slate-200">
            <button
              onClick={() => setSelectedVehicle(null)}
              aria-label="Close"
              className="absolute top-4 left-4 z-30 w-10 h-10 rounded-full bg-white/95 text-slate-800 shadow-md flex items-center justify-center hover:bg-slate-100 transition font-black text-xl cursor-pointer"
            >
              ✕
            </button>

            <div className="p-5 sm:p-7 space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black bg-[#003580] text-white px-2.5 py-0.5 rounded-md">
                      {isAr ? selectedVehicle.categoryLabelAr : selectedVehicle.categoryLabelEn}
                    </span>
                    <span className="text-xs font-black bg-amber-500/10 text-amber-700 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                      🏢 {selectedVehicle.company}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                    {selectedVehicle.name}
                  </h2>
                  <p className="text-xs text-slate-600 font-medium">
                    📍 {selectedVehicle.city} · 👥 {selectedVehicle.seats} {isAr ? "مقعد مريح" : "seats"}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-end md:self-start">
                  <a
                    href={`tel:${selectedVehicle.driverPhone}`}
                    className="px-5 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs sm:text-sm shadow-md transition inline-flex items-center gap-1.5"
                  >
                    <span>📞 {isAr ? "اتصال بالسائق مباشرة" : "Call Driver Directly"}</span>
                  </a>
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 h-64 sm:h-72 rounded-2xl overflow-hidden">
                <div className="md:col-span-2 h-full">
                  <img src={selectedVehicle.photos[0]} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-rows-2 gap-2.5 h-full">
                  <img src={selectedVehicle.photos[1 % selectedVehicle.photos.length]} alt="" className="w-full h-full object-cover" />
                  <img src={selectedVehicle.photos[2 % selectedVehicle.photos.length]} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              {/* Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-2">
                <div className="md:col-span-8 space-y-4">
                  {/* Vehicle Description */}
                  <div>
                    <h3 className="text-base font-black text-[#0F172A] mb-2">
                      {isAr ? "مواصفات وسيلة النقل" : "Vehicle Specifications"}
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {selectedVehicle.desc}
                    </p>
                  </div>

                  {/* Required Info Card: Vehicle type, company, driver */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <div className="text-xs font-black text-[#003580]">
                      🚌 {isAr ? "بيانات المركبة والجهة المشغلة:" : "Vehicle & Operator Data:"}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                          {isAr ? "نوع المركبة" : "Vehicle Type"}
                        </div>
                        <div className="font-black text-xs text-[#0F172A]">{selectedVehicle.name}</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                          {isAr ? "شركة النقل" : "Transport Co."}
                        </div>
                        <div className="font-black text-xs text-[#0F172A]">{selectedVehicle.company}</div>
                      </div>
                      <div className="p-3 bg-white rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 mb-0.5">
                          {isAr ? "السائق المعتمد" : "Driver"}
                        </div>
                        <div className="font-black text-xs text-[#0F172A]">{selectedVehicle.driverName}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-4 space-y-4">
                  {/* Rating Score Card */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
                    <div>
                      <div className="font-black text-sm text-[#0F172A]">{selectedVehicle.ratingWord}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {selectedVehicle.reviewsCount} {isAr ? "تقييم معتمد" : "verified reviews"}
                      </div>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-[#003580] text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {selectedVehicle.rating}
                    </div>
                  </div>

                  {/* Pricing Box */}
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D6] space-y-2">
                    <div className="text-xs font-bold text-slate-500">{isAr ? "سعر التأجير اليومي" : "Daily Rate"}</div>
                    <div className="text-2xl font-black text-[#0F172A]">
                      {selectedVehicle.pricePerDay} <span className="text-xs text-slate-500">{isAr ? "د.ل / يوم" : "LYD/day"}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      ✓ {isAr ? "شامل السائق والوقود والتأمين" : "Driver, Fuel & Insurance Included"}
                    </div>
                  </div>

                  {/* Direct Contact Button */}
                  <div className="space-y-2">
                    <a
                      href={`tel:${selectedVehicle.driverPhone}`}
                      className="w-full py-3 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>📞 {isAr ? "حجز وتواصل مع السائق" : "Call & Hire Driver"}</span>
                    </a>
                    <a
                      href={`tel:${selectedVehicle.companyPhone}`}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-black text-xs transition flex items-center justify-center gap-2"
                    >
                      <span>🏢 {isAr ? "الاتصال بالشركة المشغلة" : "Contact Company"}</span>
                    </a>
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
