import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useRef } from "react";
import heroImg from "@/assets/hero-leptis.jpg";
import destLeptisArch from "@/assets/dest-leptis-arch.jpg";
import destLeptisTheater from "@/assets/dest-leptis-theater.jpg";
import destLeptisCoast from "@/assets/dest-leptis-coast.jpg";
import destSabratah from "@/assets/dest-sabratha.jpg";
import destSabratahTheater from "@/assets/dest-sabratha-theater.jpg";
import destSabratahTemple from "@/assets/dest-sabratha-temple.jpg";
import destSabratahCoast from "@/assets/dest-sabratha-coast.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import destTripoliCastle from "@/assets/dest-tripoli-castle.jpg";
import destTripoliArch from "@/assets/dest-tripoli-arch.jpg";
import destTripoliMedina from "@/assets/dest-tripoli-medina.jpg";
import destTripoliOldCity from "@/assets/dest-tripoli-old-city.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destGhadamesAlleys from "@/assets/dest-ghadames-alleys.jpg";
import destGhadamesOasis from "@/assets/dest-ghadames-oasis.jpg";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destCyreneApollo from "@/assets/dest-cyrene-apollo.jpg";
import destCyreneSanctuary from "@/assets/dest-cyrene-sanctuary.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destGharyanCave from "@/assets/dest-gharyan-cave.jpg";
import destGharyanCourtyard from "@/assets/dest-gharyan-courtyard.jpg";
import destKsarDesert from "@/assets/dest-ksar-desert.jpg";
import destKsarNalut from "@/assets/dest-ksar-nalut.jpg";
import destNafusaFortress from "@/assets/dest-nafusa-fortress.jpg";
import destHarborCoast from "@/assets/dest-harbor-coast.jpg";
import destJabalAkhdarPanorama from "@/assets/dest-jabal-akhdar-panorama.jpg";
import destJabalAkhdarForest from "@/assets/dest-jabal-akhdar-forest.jpg";
import destJabalAkhdarBridge from "@/assets/dest-jabal-akhdar-bridge.jpg";
import destJabalAkhdarValley from "@/assets/dest-jabal-akhdar-valley.jpg";
import destJabalAkhdarPass from "@/assets/dest-jabal-akhdar-pass.jpg";
import destUbariGaberoun from "@/assets/dest-ubari-gaberoun.jpg";
import destUbariUmmAlMaa from "@/assets/dest-ubari-ummalmaa.jpg";
import destAcacusArch from "@/assets/dest-acacus-arch.jpg";
import destSaharaDunes from "@/assets/dest-sahara-dunes.jpg";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import {
  DetailsModal,
  PrivateTripModal,
  useModalPair,
} from "@/components/Modals";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  MapPin,
  Calendar,
  Heart,
  X,
} from "lucide-react";

export const Route = createFileRoute("/attractions")({
  head: () => ({
    meta: [
      { title: "معالم ليبيا الخالدة | منصة دلّني للخدمات السياحية" },
      {
        name: "description",
        content:
          "استكشف أبرز المعالم السياحية والأثرية ومواقع التراث العالمي لليونسكو في ليبيا مع إمكانية تصميم وإنشاء رحلات سياحية خاصة مخصصة بالكامل.",
      },
      { property: "og:title", content: "معالم ليبيا الخالدة — منصة دلّني" },
      {
        property: "og:description",
        content: "دليلك الشامل لآثار ومعالم ليبيا التاريخية والطبيعية مع خدمة إنشاء وتصميم الرحلات الخاصة.",
      },
    ],
  }),
  component: AttractionsPage,
});

import {
  LIBYAN_ATTRACTIONS,
  LIBYAN_CITIES,
  type AttractionItem,
  type CityDestinationItem,
} from "@/lib/attractionsData";

export { LIBYAN_ATTRACTIONS, LIBYAN_CITIES, type AttractionItem, type CityDestinationItem };


export function AttractionsPage() {
  const { language, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [tripSystemFilter, setTripSystemFilter] = useState<"all" | "daily" | "private" | "unesco">("all");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");

  const modals = useModalPair();
  const [privateTripModalOpen, setPrivateTripModalOpen] = useState(false);
  const [privateTripDest, setPrivateTripDest] = useState("");

  // City Details & Video Modal State
  const [selectedCityForModal, setSelectedCityForModal] = useState<CityDestinationItem | null>(null);
  const [showPromoModalBanner, setShowPromoModalBanner] = useState(true);

  // City Carousel vs Grid View Mode State ("عرض الكل")
  const [cityViewMode, setCityViewMode] = useState<"carousel" | "grid">("carousel");
  const cityCarouselRef = useRef<HTMLDivElement>(null);
  
  const heroImages = useMemo(() => [
    destSabratah, destJabalAkhdarPanorama, destUbariGaberoun, destJabalAkhdarForest, destAcacusArch, destTripoli, heroImg, destUbariUmmAlMaa, destGhadames, destSaharaDunes, destJabalAkhdarBridge, destGharyanCave, destKsarDesert
  ], []);
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [heroImages.length]);
  const scrollCityCarouselLeft = () => {
    if (cityCarouselRef.current) {
      cityCarouselRef.current.scrollBy({ left: -340, behavior: "smooth" });
    }
  };

  const scrollCityCarouselRight = () => {
    if (cityCarouselRef.current) {
      cityCarouselRef.current.scrollBy({ left: 340, behavior: "smooth" });
    }
  };

  const isAr = language === "ar";

  // Categories list
  const categoryFilters = useMemo(() => [
    { id: "all", label: isAr ? "جميع المعالم" : "All Landmarks", icon: "✨" },
    { id: "آثار تاريخية", label: isAr ? "آثار رومانية وإغريقية" : "Roman & Greek Ruins", icon: "🏛️" },
    { id: "واحات صحراوية", label: isAr ? "واحات وكثبان صحراوية" : "Desert Oases & Dunes", icon: "🏜️" },
    { id: "مدن قديمة وقلاع", label: isAr ? "مدن وقلاع تاريخية" : "Old Cities & Castles", icon: "🏰" },
    { id: "طبيعة وجبال", label: isAr ? "جبال وشواطئ طبيعية" : "Mountains & Coastlines", icon: "⛰️" },
  ], [isAr]);

  // Cities list
  const cities = useMemo(() => {
    const rawCities = Array.from(new Set(LIBYAN_ATTRACTIONS.map((a) => (isAr ? a.city : a.cityEn))));
    return ["all", ...rawCities];
  }, [isAr]);

  // UNESCO World Heritage Sites count & items
  const unescoSites = useMemo(() => LIBYAN_ATTRACTIONS.filter((a) => a.isUnesco), []);
  const [unescoDeckIndex, setUnescoDeckIndex] = useState(0);

  // Auto-rotate 3D cards deck every 5 seconds
  useEffect(() => {
    if (unescoSites.length === 0) return;
    const timer = setInterval(() => {
      setUnescoDeckIndex((prev) => (prev + 1) % unescoSites.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [unescoSites.length]);

  const activeUnescoSite = unescoSites[unescoDeckIndex] || unescoSites[0];

  // Filtered & Sorted items
  const filteredAttractions = useMemo(() => {
    let list = LIBYAN_ATTRACTIONS.filter((item) => {
      // Category filter
      if (selectedCategory !== "all" && item.category !== selectedCategory) return false;

      // City filter
      if (selectedCity !== "all") {
        const itemCity = isAr ? item.city : item.cityEn;
        if (itemCity !== selectedCity) return false;
      }

      // Trip system filter
      if (tripSystemFilter === "daily" && !item.hasDailyTrip) return false;
      if (tripSystemFilter === "private" && item.hasDailyTrip) return false;
      if (tripSystemFilter === "unesco" && !item.isUnesco) return false;

      // Keyword search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const fullSearchable = `${item.name} ${item.nameEn} ${item.city} ${item.cityEn} ${item.region} ${item.regionEn} ${item.description} ${item.descriptionEn}`.toLowerCase();
        if (!fullSearchable.includes(query)) return false;
      }

      return true;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "reviews") return b.reviewsCount - a.reviewsCount;
      if (sortBy === "name") {
        const nameA = isAr ? a.name : a.nameEn;
        const nameB = isAr ? b.name : b.nameEn;
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }, [selectedCategory, selectedCity, tripSystemFilter, searchQuery, sortBy, isAr]);

  function handleOpenDetails(att: AttractionItem) {
    modals.openDetails({
      title: isAr ? att.name : att.nameEn,
      subtitle: `${isAr ? att.city : att.cityEn} · ${isAr ? att.category : att.categoryEn}`,
      image: att.img,
      description: isAr ? att.description : att.descriptionEn,
      bookable: true,
      bookLabel: isAr ? "إنشاء رحلة خاصة لهذا المعلم 🧭" : "Create Private Trip 🧭",
      info: [
        { label: isAr ? "المدينة والمنطقة" : "City & Region", value: `${isAr ? att.city : att.cityEn} (${isAr ? att.region : att.regionEn})` },
        { label: isAr ? "نظام الانطلاق والرحلات" : "Tour Access", value: isAr ? "عبر تصميم رحلة خاصة مخصصة بالكامل" : "Via Fully Customized Private Tour" },
        { label: isAr ? "رسوم الدخول التقديرية" : "Estimated Entry Fee", value: isAr ? att.entryFee : att.entryFeeEn },
        { label: isAr ? "موقع التراث العالمي لليونسكو" : "UNESCO Status", value: att.isUnesco ? (isAr ? `مسجل باليونسكو عام ${att.unescoYear}` : `Inscribed UNESCO ${att.unescoYear}`) : (isAr ? "معلم وطني طبيعي/تاريخي" : "National Heritage Site") },
      ],
      features: isAr ? att.highlights : att.highlightsEn,
    });
  }

  function handleOpenCityDetails(city: CityDestinationItem) {
    const tripSystemSummary = isAr ? "🧭 إمكانية حجز وتصميم رحلات خاصة مخصصة" : "🧭 Custom Private Trips Available";

    modals.openDetails({
      title: isAr ? city.name : city.nameEn,
      subtitle: `${isAr ? city.subtitle : city.subtitleEn} — ${city.region}`,
      image: city.img,
      description: isAr ? city.description : city.descriptionEn,
      bookable: true,
      bookLabel: isAr ? "إنشاء رحلة خاصة لهذه الوجهة 🧭" : "Create Private Trip 🧭",
      info: [
        { label: isAr ? "المنطقة والإقليم" : "Region", value: city.region },
        { label: isAr ? "نظام الرحلات المتوفرة" : "Available Trip System", value: tripSystemSummary },
        { label: isAr ? "عدد المعالم السياحية" : "Documented Landmarks", value: isAr ? `${city.landmarksCount} معالم موثقة بالكامل` : `${city.landmarksCount} Documented Sites` },
        { label: isAr ? "تقييم السياح والزوار" : "Guest Rating", value: `⭐ ${city.rating} / 5 (${city.ratingLabel} — ${city.reviewsCount} تقييم)` },
      ],
      features: city.highlights,
    });
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans" dir={dir}>
      {/* Unified Main Navigation Header */}
      <Header active="attractions" />

      {/* Hero Banner with Cinematic Layer & High Quality Asset - Standardized Height */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#0F172A]">
        {heroImages.map((src, idx) => (
          <img
            key={src}
            src={src}
            alt={isAr ? "معالم ليبيا الخالدة" : "Immortal Landmarks of Libya"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              idx === heroIndex ? "opacity-100 animate-zoom-slow" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/40 to-transparent" />
        <div className="relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit mb-2 border border-white/30 shadow-lg">
            <span>🏛️</span>
            <span>{isAr ? "معالم ليبيا الخالدة وأسرار التاريخ" : "Immortal Landmarks of Libya & Ancient Wonders"}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black drop-shadow-xl tracking-tight leading-tight">
            {isAr ? "اكتشف أعظم آثار وحضارات ليبيا" : "Discover Libya's Greatest Historical Wonders"}
          </h1>

          <p className="mt-2 text-white/95 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed drop-shadow-md">
            {isAr
              ? "دليلك المتكامل لمواقع التراث العالمي لليونسكو، الآثار الرومانية والإغريقية، الواحات الصحراوية، والمدن القديمة مع إمكانية تصميم وإنشاء رحلتك الخاصة بالكامل."
              : "Your comprehensive guide to UNESCO World Heritage Sites, Roman & Greek marvels, Sahara desert oases, and ancient fortified towns with custom private tours."}
          </p>

          {/* Quick Stats Strip inside Hero */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-white/90">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <span className="text-amber-400 font-black text-xs sm:text-sm">5</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "مواقع تراث عالمي (UNESCO)" : "UNESCO World Heritage Sites"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <span className="text-amber-400 font-black text-xs sm:text-sm">🧭</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "إنشاء رحلات خاصة مخصصة بالكامل" : "Customized Private Trips"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <span className="text-teal-300 font-black text-xs sm:text-sm">{LIBYAN_ATTRACTIONS.length}</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "معالم موثقة وموصوفة" : "Documented Iconic Sites"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Filter Panel Floating Gracefully Below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 shadow-xl border border-[#E8E2D6] text-[#0F172A]">
          {/* Main Inputs Row (Simple Search & City Select with Booking.com Blue Theme) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3 bg-[#F0F4F8] rounded-2xl border border-blue-100">
            {/* Search Input */}
            <div className="lg:col-span-6 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-blue-900 font-bold text-base">🔍</span>
              <div className="relative flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">البحث عن مدينة أو معلم سياحي:</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث باسم المدينة، الموقع الأثري أو الواحة..."
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A6A85]">
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* City / Region Select */}
            <div className="lg:col-span-6 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs flex items-center gap-2">
              <span className="text-blue-900 font-bold text-base">📍</span>
              <div className="flex-1">
                <label className="text-[10px] font-black text-[#003580] block mb-0.5">اختر المدينة والمنطقة:</label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-7 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">{isAr ? "جميع المدن والمناطق السياحية" : "All Cities & Destinations"}</option>
                  {cities.filter((c) => c !== "all").map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-10">
        {/* ── UNESCO World Heritage Showcase (Left Aligned Title & Button, Booking.com Blue Theme) ── */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 text-[#0F172A] shadow-md relative overflow-hidden border border-blue-100">
          {/* Header Row Aligned to Left */}
          <div className="border-b border-blue-100 pb-5 mb-8 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#003580]/10 text-[#003580] border border-[#003580]/20 text-xs font-black mb-2">
              <span>🏛️</span>
              <span>{isAr ? "مواقع التراث العالمي لليونسكو في ليبيا" : "UNESCO World Heritage Sites"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003580]">
              {isAr ? "معالم خالدة مسجلة في قائمة اليونسكو" : "UNESCO World Heritage Masterpieces"}
            </h2>
          </div>

          {/* UNESCO Showcase Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Column 1 (Right in RTL): Stacked Cards Deck */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[440px] sm:min-h-[480px]">
              <div className="relative w-64 h-[380px] sm:w-[300px] sm:h-[440px] flex items-center justify-center">
                {unescoSites.map((site, idx) => {
                  const total = unescoSites.length;
                  const offset = (idx - unescoDeckIndex + total) % total;

                  let transform = "";
                  let opacity = 0;
                  let zIndex = 0;
                  let pointerEvents: "auto" | "none" = "none";

                  if (offset === 0) {
                    transform = "translateY(0px) translateX(0px) scale(1) rotate(0deg)";
                    opacity = 1;
                    zIndex = 30;
                    pointerEvents = "auto";
                  } else if (offset === 1) {
                    transform = "translateY(14px) translateX(-20px) scale(0.92) rotate(-6deg)";
                    opacity = 0.92;
                    zIndex = 20;
                    pointerEvents = "auto";
                  } else if (offset === 2) {
                    transform = "translateY(24px) translateX(20px) scale(0.85) rotate(6deg)";
                    opacity = 0.75;
                    zIndex = 10;
                    pointerEvents = "auto";
                  } else {
                    transform = "translateY(36px) translateX(0px) scale(0.78) rotate(0deg)";
                    opacity = 0;
                    zIndex = 0;
                    pointerEvents = "none";
                  }

                  return (
                    <div
                      key={site.id}
                      onClick={() => setUnescoDeckIndex(idx)}
                      style={{ transform, opacity, zIndex, pointerEvents }}
                      className="absolute inset-0 rounded-[36px] overflow-hidden border-4 border-white shadow-2xl bg-stone-900 cursor-pointer transition-all duration-300 ease-out group select-none"
                    >
                      <img
                        src={site.img}
                        alt={isAr ? site.name : site.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-[1.02] contrast-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      <div className="absolute bottom-4 right-4 left-4 bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-white shadow-md">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#003580] text-white font-black text-[10px]">
                            {isAr ? site.city : site.cityEn}
                          </span>
                          <span className="text-[10px] text-blue-200 font-bold">
                            🏛️ {site.unescoYear || "1982"}
                          </span>
                        </div>
                        <div className="text-sm font-black text-white truncate">
                          {isAr ? site.name : site.nameEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Progress Indicator Dots */}
              <div className="flex items-center gap-2 mt-6 z-30">
                {unescoSites.map((site, idx) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setUnescoDeckIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      unescoDeckIndex === idx
                        ? "w-8 bg-[#003580] shadow-xs"
                        : "w-2 bg-[#E8E2D6] hover:bg-stone-400"
                    }`}
                    title={isAr ? site.city : site.cityEn}
                  />
                ))}
              </div>
            </div>

            {/* Column 2 (Left in RTL): Information Aligned to Left */}
            <div className="lg:col-span-7 space-y-6 flex flex-col items-start text-left">
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#003580]/10 text-[#003580] font-black text-xs border border-[#003580]/20 shadow-xs">
                  📜 {isAr ? `مسجل باليونسكو عام ${activeUnescoSite.unescoYear || "1982"}` : `UNESCO ${activeUnescoSite.unescoYear || "1982"}`}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1B5A78] font-bold text-xs border border-blue-200 shadow-xs">
                  📍 {isAr ? activeUnescoSite.city : activeUnescoSite.cityEn} — {isAr ? activeUnescoSite.region : activeUnescoSite.regionEn}
                </span>
              </div>

              {/* Main City Title */}
              <h3 className="text-3xl sm:text-4xl font-black text-[#003580] leading-tight transition-all duration-300">
                {isAr ? activeUnescoSite.name : activeUnescoSite.nameEn}
              </h3>

              {/* Simple & Elegant Overview / النبذة */}
              <div className="bg-[#F0F4F8] p-5 rounded-2xl border border-blue-100 shadow-xs space-y-2 w-full text-right">
                <div className="text-xs font-black text-[#003580]">
                  {isAr ? "💡 نبذة عن المدينة المعلم:" : "Overview:"}
                </div>
                <p className="text-sm text-[#334155] leading-relaxed font-semibold">
                  "{isAr ? activeUnescoSite.description : activeUnescoSite.descriptionEn}"
                </p>
              </div>

              {/* Book Private Trip Action Button Aligned to Left in Orange */}
              <div className="pt-2 flex justify-start w-full">
                <button
                  type="button"
                  onClick={() => setPrivateTripModalOpen(true)}
                  className="px-8 py-4 rounded-2xl bg-[#D96B27] hover:bg-[#C25B1E] text-white font-black text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-3 border border-orange-400/30"
                >
                  <span>{isAr ? "حجز رحلة خاصة لهذه المدينة" : "Book Private Tour to this City"}</span>
                  <span className="text-lg">🧭</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Custom Private Trips System Notice ── */}
        <section className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/50 rounded-3xl p-5 border border-[#E6E1D6] shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D96B27]/10 text-[#D96B27] text-2xl font-black grid place-items-center shrink-0 border border-[#D96B27]/20 shadow-xs">
              🧭
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#0B132B] flex items-center gap-2">
                <span>{isAr ? "تصميم وإنشاء الرحلات الخاصة للمعالم السياحية" : "Create & Customize Private Tours to Landmarks"}</span>
                <span className="text-[10px] bg-[#D96B27]/10 text-[#D96B27] font-black px-2.5 py-0.5 rounded-full border border-[#D96B27]/20">
                  {isAr ? "رحلات خاصة 100%" : "100% Private Tours"}
                </span>
              </h3>
              <p className="text-xs text-[#526078] mt-1 leading-relaxed">
                {isAr
                  ? "صمم برنامج رحلتك الخاصة لزيارة أي معلم أثري أو طبيعي في ليبيا مع حرية تامة في اختيار نوع المركبة، السائق، المرشد السياحي المعتمد، وتوقيت الانطلاق المناسب لك."
                  : "Design your custom private tour to visit any historical or natural landmark in Libya with full freedom to choose vehicle, driver, certified guide, and preferred schedule."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setPrivateTripModalOpen(true)}
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black text-xs sm:text-sm shadow-soft transition flex items-center justify-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>🧭</span>
              <span>{isAr ? "إنشاء رحلة خاصة الآن" : "Create Private Tour Now"}</span>
            </button>
          </div>
        </section>

        {/* ── Pure Photo Cards Cities & Destinations Showcase ── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8E2D6] pb-5">
            <div>
              <span className="px-3.5 py-1 rounded-full bg-[#D96B27]/10 text-[#D96B27] border border-[#D96B27]/30 text-xs font-black tracking-wider uppercase inline-block mb-2">
                {isAr ? "مدن ووجهات ليبيا السياحية" : "OUR DESTINATIONS"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#003580] tracking-tight">
                {isAr ? "استكشف المدن والوجهات " : "Explore Cities & "}
                <span className="text-[#D96B27]">{isAr ? "السياحية" : "Destinations"}</span>
              </h2>
              <p className="text-xs text-slate-500 font-bold mt-1.5">
                {isAr
                  ? "تصفح أبرز المدن والواحات التاريخية في شريط أفقي مريح مع تصميم الكروت الصامتة"
                  : "Browse featured cities and oases in an organic floating flow"}
              </p>
            </div>

            {/* Carousel Navigation Controls matching Trips page (Solid Orange, Borderless) */}
            {cityViewMode === "carousel" && (
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={scrollCityCarouselLeft}
                  className="w-11 h-11 rounded-full bg-[#D96B27] hover:bg-[#c25a1b] text-white flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-none"
                  aria-label={isAr ? "السابق" : "Previous"}
                  title={isAr ? "تحريك لليمين" : "Scroll Right"}
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={scrollCityCarouselRight}
                  className="w-11 h-11 rounded-full bg-[#D96B27] hover:bg-[#c25a1b] text-white flex items-center justify-center text-xl shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer border-none"
                  aria-label={isAr ? "التالي" : "Next"}
                  title={isAr ? "تحريك لليسار" : "Scroll Left"}
                >
                  ←
                </button>
              </div>
            )}
          </div>

          {/* Pure Photo Cards Showcase (Simple, Calm, Clean Short City Name at Bottom) */}
          {cityViewMode === "carousel" ? (
            <div ref={cityCarouselRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1">
              {LIBYAN_CITIES.map((city) => (
                <div
                  key={city.id}
                  onClick={() => setSelectedCityForModal(city)}
                  className="min-w-[280px] sm:min-w-[310px] max-w-[330px] h-[440px] sm:h-[500px] rounded-[32px] overflow-hidden relative shadow-xl hover:shadow-2xl border-2 border-white/80 cursor-pointer transition-all duration-300 group shrink-0 select-none bg-stone-900"
                >
                  {/* Full Background Photo */}
                  <img
                    src={city.img}
                    alt={isAr ? city.name : city.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-[1.02] contrast-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

                  {/* Top Overlay: Wishlist Heart Button Only */}
                  <div className="absolute top-5 right-5 left-5 flex items-center justify-between text-white">
                    <div />
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 grid place-items-center text-white hover:text-red-500 hover:scale-110 transition cursor-pointer shadow-md"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bottom Content Area: Short City Name + Soft White Subtitle on Right, "اعرف أكثر" on Left */}
                  <div className="absolute bottom-5 right-5 left-5 flex items-end justify-between gap-3 text-white">
                    <div className="text-right flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md tracking-wide truncate">
                        {isAr ? city.shortName : city.shortNameEn}
                      </h3>
                      <p className="text-[11px] font-semibold text-white/85 drop-shadow-sm truncate mt-0.5">
                        {isAr ? city.subtitle : city.subtitleEn}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCityForModal(city);
                      }}
                      className="py-2.5 px-4 rounded-2xl bg-[#D96B27] hover:bg-[#C25B1E] text-white font-black text-xs shadow-lg border border-white/20 transition duration-300 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>{isAr ? "اعرف أكثر" : "Know More"}</span>
                      <span className="text-xs">➔</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-3">
              {LIBYAN_CITIES.map((city) => (
                <div
                  key={city.id}
                  onClick={() => setSelectedCityForModal(city)}
                  className="w-full h-[440px] sm:h-[500px] rounded-[32px] overflow-hidden relative shadow-xl hover:shadow-2xl border-2 border-white/80 cursor-pointer transition-all duration-300 group select-none bg-stone-900"
                >
                  {/* Full Background Photo */}
                  <img
                    src={city.img}
                    alt={isAr ? city.name : city.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-[1.02] contrast-[1.02]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

                  {/* Top Overlay: Wishlist Heart Button Only */}
                  <div className="absolute top-5 right-5 left-5 flex items-center justify-between text-white">
                    <div />
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 grid place-items-center text-white hover:text-red-500 hover:scale-110 transition cursor-pointer shadow-md"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Bottom Content Area: Short City Name + Soft White Subtitle on Right, "اعرف أكثر" on Left */}
                  <div className="absolute bottom-5 right-5 left-5 flex items-end justify-between gap-3 text-white">
                    <div className="text-right flex-1 min-w-0">
                      <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md tracking-wide truncate">
                        {isAr ? city.shortName : city.shortNameEn}
                      </h3>
                      <p className="text-[11px] font-semibold text-white/85 drop-shadow-sm truncate mt-0.5">
                        {isAr ? city.subtitle : city.subtitleEn}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCityForModal(city);
                      }}
                      className="py-2.5 px-4 rounded-2xl bg-[#D96B27] hover:bg-[#C25B1E] text-white font-black text-xs shadow-lg border border-white/20 transition duration-300 flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>{isAr ? "اعرف أكثر" : "Know More"}</span>
                      <span className="text-xs">➔</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Centered "عرض الكل" Button Under the Photos */}
          <div className="flex justify-center pt-6 pb-2">
            <button
              type="button"
              onClick={() => setCityViewMode((prev) => (prev === "carousel" ? "grid" : "carousel"))}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-[#003580] text-[#003580] hover:text-white border-2 border-[#003580] font-black text-xs sm:text-sm shadow-md hover:shadow-xl transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-105 active:scale-95"
            >
              <span className="text-base">{cityViewMode === "carousel" ? "✨" : "🔄"}</span>
              <span>
                {cityViewMode === "carousel"
                  ? (isAr ? "عرض الكل ⬇" : "View All ⬇")
                  : (isAr ? "العودة للشريط الأفقي ⬅" : "Back to Carousel View ⬅")}
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* ── Details and Private Modals ── */}
      <DetailsModal
        open={!!modals.detailsItem}
        onClose={modals.closeDetails}
        item={modals.detailsItem}
        onBook={() => {
          const itemTitle = modals.detailsItem?.title || "";
          modals.closeDetails();
          setPrivateTripDest(itemTitle);
          setPrivateTripModalOpen(true);
        }}
      />

      <PrivateTripModal
        open={privateTripModalOpen}
        onClose={() => setPrivateTripModalOpen(false)}
        initialDestination={privateTripDest}
      />

      {/* ── Landmark Details Modal (Single Photo Only) ── */}
      <LandmarkDetailsModal
        city={selectedCityForModal}
        onClose={() => setSelectedCityForModal(null)}
        onBookPrivate={() => {
          const destName = selectedCityForModal ? selectedCityForModal.name : "";
          setSelectedCityForModal(null);
          setPrivateTripDest(destName);
          setPrivateTripModalOpen(true);
        }}
      />

      {/* Footer Component */}
      <Footer />
    </div>
  );
}

function LandmarkDetailsModal({
  city,
  onClose,
  onBookPrivate,
}: {
  city: CityDestinationItem | null;
  onClose: () => void;
  onBookPrivate: () => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [activeModalTab, setActiveModalTab] = useState<"history" | "highlights" | "trips">("history");
  const [showPromo, setShowPromo] = useState(true);

  if (!city) return null;

  const photo = city.img || heroImg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" dir={dir}>
      <div className="bg-slate-950/95 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-white/20 max-h-[92vh] flex flex-col relative text-slate-100 backdrop-blur-2xl">
        
        {/* 1. Single Elegant Hero Photo Showcase */}
        <div className="relative h-72 sm:h-96 md:h-[430px] w-full overflow-hidden bg-slate-950 shrink-0 group">
          <img
            src={photo}
            alt={city.name}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 pointer-events-none" />

          {/* Floating Top Controls */}
          <div className="absolute top-4 right-4 left-4 z-30 flex items-center justify-between">
            <span className="bg-black/70 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5">
              <span>🏛️</span>
              <span>{isAr ? "معلم سياحي موثق" : "Verified Landmark"}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-white hover:text-slate-950 flex items-center justify-center transition cursor-pointer shadow-2xl border border-white/20"
              title={isAr ? "إغلاق" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 right-4 left-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div className="drop-shadow-lg space-y-1">
              <div className="text-xl sm:text-3xl font-black text-white">{isAr ? city.name : city.nameEn}</div>
              <div className="text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2">
                <span>✨</span>
                <span>{isAr ? city.subtitle : city.subtitleEn}</span>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-slate-200">
              📍 {city.region}
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body Content Below Showcase */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-right">
          
          {/* Header Section: City Title + Region Badges + Rating */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#003580] text-white font-black text-xs shadow-md border border-blue-400/30">
                📍 {city.region}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-400/30 shadow-xs">
                🏛️ {isAr ? city.categoryTag : city.categoryTagEn}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-amber-300 border border-white/10 text-xs font-black">
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black text-[11px]">
                  {city.rating}
                </span>
                <span>{city.ratingLabel}</span>
                <span className="text-slate-400 font-medium text-[11px]">({city.reviewsCount} تقييم)</span>
              </div>
            </div>

            {/* Google Maps link button */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.mapQuery || city.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-black text-xs border border-white/15 shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>🗺️</span>
              <span>{isAr ? "عرض الموقع في خرائط Google ↗" : "View Map ↗"}</span>
            </a>
          </div>

          {/* Interactive Modal Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            {[
              { id: "history", label: isAr ? "📖 نبذة وتاريخ المعلم" : "History & Heritage", icon: "🏛️" },
              { id: "highlights", label: isAr ? "✨ أبرز ٤ محطات وتجارب" : "Top 4 Highlights", icon: "⭐" },
              { id: "trips", label: isAr ? "🧭 تفاصيل الرحلات الخاصة" : "Private Tours Info", icon: "🧭" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModalTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === tab.id
                    ? "bg-gradient-to-r from-[#003580] to-blue-600 text-white shadow-md border border-blue-400/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab 1: Detailed City Overview & History */}
          {activeModalTab === "history" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <span>📖</span>
                  <span>{isAr ? "عن المعلم وأهميته التاريخية:" : "About the Landmark & Heritage:"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {isAr ? city.description : city.descriptionEn}
                </p>
              </div>

              {/* VIP Offer Card */}
              {showPromo && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-blue-900/40 to-slate-900 border border-amber-400/30 flex items-center justify-between gap-3 text-xs relative shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                      🎁
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm block text-amber-300">
                        {isAr ? `عروض ترويجية حصرية للفنادق والمطاعم في ${city.shortName}` : `Exclusive Hotel & Dining Offers in ${city.shortNameEn}`}
                      </span>
                      <span className="text-slate-300 text-[11px] sm:text-xs">
                        {isAr ? "خصم 20% على الإقامة والمأكولات بالتعاون مع حجز الفنادق والمطاعم لعملاء دلّني." : "20% discount on stays and local restaurants for Dallani travelers."}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPromo(false)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition shrink-0"
                    title={isAr ? "إغلاق العرض" : "Dismiss"}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Highlights & Top Landmarks Section */}
          {activeModalTab === "highlights" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <span>✨</span>
                  <span>{isAr ? "أبرز المعالم والمحطات الرئيسية (٤ محطات):" : "Top 4 Highlights & Stations:"}</span>
                </h4>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isAr ? "معالم موثقة 100%" : "Verified 100%"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {city.highlights.slice(0, 4).map((hl, idx) => {
                  const icons = ["🏛️", "🌊", "🏺", "🌴"];
                  return (
                    <div
                      key={idx}
                      className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 shadow-md transition-all duration-300 flex items-center gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003580] to-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        <span>{icons[idx % icons.length]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                          <span>{isAr ? `المعلم ${idx + 1}` : `Station #${idx + 1}`}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-white leading-snug block truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                          {hl}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Custom Private Tours */}
          {activeModalTab === "trips" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-400/30 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                    🧭 {isAr ? "رحلات خاصة مخصصة بالكامل" : "Custom Private Tours"}
                  </span>
                  <span className="text-xs font-bold text-amber-200">{isAr ? "سيارة خاصة + مرشد معتمد" : "Private Vehicle + Guide"}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed">
                  {isAr 
                    ? "يمكنك إنشاء وتصميم رحلتك الخاصة لزيارة هذا المعلم بكامل الخصوصية والراحة، مع اختيار وسيلة النقل المناسبة والمرشد السياحي المرافق وتحديد وقت ومكان الانطلاق المناسب لك."
                    : "You can create and customize your own private tour to this landmark with full privacy and flexibility, choosing your vehicle, certified guide, and departure time."}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Action Button: ONLY Private Trip Creation */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 flex items-center justify-center shrink-0">
          <button
            type="button"
            onClick={onBookPrivate}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-[#D96B27] hover:from-amber-400 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>🧭</span>
            <span>{isAr ? "إنشاء رحلة خاصة لهذا المعلم (مع اختيار المرشد والمركبة)" : "Create Custom Trip for this Landmark"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

