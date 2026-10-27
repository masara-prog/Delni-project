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
  CheckCircle2,
  Award,
  Sparkles,
  Star,
  Eye,
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
import { apiGetPlaces, getStoredSession } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";

export { LIBYAN_ATTRACTIONS, LIBYAN_CITIES, type AttractionItem, type CityDestinationItem };


function AttractionsPage() {
  const { language, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [tripSystemFilter, setTripSystemFilter] = useState<"all" | "daily" | "private" | "unesco">("all");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");

  // Dynamic touristic cities from DelniDB
  const [dbPlaces, setDbPlaces] = useState<any[]>([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(true);

  useEffect(() => {
    let isSubscribed = true;
    apiGetPlaces()
      .then((res) => {
        if (isSubscribed && Array.isArray(res) && res.length > 0) {
          setDbPlaces(res);
        }
        if (isSubscribed) setIsLoadingPlaces(false);
      })
      .catch(() => {
        if (isSubscribed) setIsLoadingPlaces(false);
      });
    return () => {
      isSubscribed = false;
    };
  }, []);

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

  // Dynamic touristic cities from DelniDB
  const dynamicCities: CityDestinationItem[] = useMemo(() => {
    if (!dbPlaces || dbPlaces.length === 0) {
      return [];
    }
    return dbPlaces.map((p, idx) => {
      let hl: string[] = [];
      if (Array.isArray(p.highlights)) {
        hl = p.highlights;
      } else if (typeof p.highlights === "string") {
        hl = p.highlights.split(/[،,\n]+/).map((s: string) => s.trim()).filter(Boolean);
      }
      if (hl.length === 0) {
        hl = ["أبرز المعالم الأثرية والمحطات التاريخية", "المعالم الطبيعية والواحات", "الأسواق التراثية والمقاهي الأصيلة"];
      }

      const cityName = p.place_name || p.city || `مدينة سياحية ${idx + 1}`;
      const region = p.region || "ليبيا";
      const image = p.place_image || heroImg;

      return {
        id: String(p.place_id || p.id || idx),
        name: cityName,
        nameEn: p.nameEn || cityName,
        shortName: cityName,
        shortNameEn: p.nameEn || cityName,
        subtitle: p.city && p.city !== cityName ? `${p.city} — ${region}` : `${region}`,
        subtitleEn: p.region || "Libya",
        region: region,
        img: image,
        description: p.description || `استكشف مدينة ${cityName} وأبرز معالمها ومحطاتها السياحية في ليبيا.`,
        descriptionEn: p.description || `Explore the historical highlights and landmarks of ${cityName}.`,
        rating: 4.9,
        ratingLabel: "استثنائي",
        ratingLabelEn: "Exceptional",
        reviewsCount: 120 + idx * 8,
        landmarksCount: hl.length,
        categoryTag: p.category || "مدينة سياحية",
        categoryTagEn: p.category || "Touristic City",
        mapQuery: `${cityName} ليبيا`,
        highlights: hl,
        highlightsEn: hl,
        photos: [image],
        hasDailyTrip: true,
        hasWeeklyTrip: true,
        hasPrivateTrip: true,
        startPriceLYD: 120,
        dailyTripsInfo: "رحلات يومية منتظمة ورحلات خاصة مخصصة",
        dailyTripsInfoEn: "Regular daily trips & custom private tours",
        availableTripTypes: ["private", "daily"],
      };
    });
  }, [dbPlaces]);

  // Cities list for filter
  const cities = useMemo(() => {
    const rawCities = Array.from(new Set(dynamicCities.map((c) => (isAr ? c.shortName : c.shortNameEn))));
    return ["all", ...rawCities];
  }, [dynamicCities, isAr]);

  // Filtered & displayed cities
  const displayedCities = useMemo(() => {
    let list = dynamicCities;
    if (selectedCity !== "all") {
      list = list.filter((c) => {
        const itemCity = isAr ? c.shortName : c.shortNameEn;
        return itemCity === selectedCity || c.name === selectedCity || c.region === selectedCity;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => {
        const searchable = `${c.name} ${c.shortName} ${c.region} ${c.description} ${c.highlights.join(" ")}`.toLowerCase();
        return searchable.includes(q);
      });
    }
    return list;
  }, [dynamicCities, selectedCity, searchQuery, isAr]);

  // UNESCO World Heritage Sites & minimalist showcase state
  const unescoSites = useMemo(() => LIBYAN_ATTRACTIONS.filter((a) => a.isUnesco), []);
  const [unescoIndex, setUnescoIndex] = useState(0);
  const [isUnescoAutoPlay, setIsUnescoAutoPlay] = useState(true);

  // Gentle 6s auto-play rotation
  useEffect(() => {
    if (!isUnescoAutoPlay || unescoSites.length === 0) return;
    const timer = setInterval(() => {
      setUnescoIndex((prev) => (prev + 1) % unescoSites.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isUnescoAutoPlay, unescoSites.length]);

  const activeUnescoSite = unescoSites[unescoIndex] || unescoSites[0];

  const handlePrevUnesco = () => {
    setUnescoIndex((prev) => (prev - 1 + unescoSites.length) % unescoSites.length);
  };

  const handleNextUnesco = () => {
    setUnescoIndex((prev) => (prev + 1) % unescoSites.length);
  };

  const getUnescoShortName = (site: (typeof unescoSites)[0], isArabic: boolean) => {
    if (site.id.includes("leptis")) return isArabic ? "لبدة الكبرى" : "Leptis Magna";
    if (site.id.includes("sabratha")) return isArabic ? "آثار صبراتة" : "Sabratha";
    if (site.id.includes("cyrene")) return isArabic ? "قورينا (شحات)" : "Cyrene";
    if (site.id.includes("ghadames")) return isArabic ? "غدامس القديمة" : "Old Ghadames";
    if (site.id.includes("acacus") || site.id.includes("akakus")) return isArabic ? "تادرارت أكاكوس" : "Tadrart Acacus";
    return isArabic ? site.name.split(" ")[0] : site.cityEn;
  };

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
      bookLabel: isAr ? "ذهاب برحلة خاصة لهذا المعلم 🧭" : "Book Private Tour to this Site 🧭",
      info: [
        { label: isAr ? "المدينة والمنطقة" : "City & Region", value: `${isAr ? att.city : att.cityEn} (${isAr ? att.region : att.regionEn})` },
        { label: isAr ? "رسوم الدخول" : "Entry Fee", value: isAr ? "مجاني للجميع (بدون تذاكر)" : "Free for Everyone (No Tickets)" },
        { label: isAr ? "أفضل موسم للزيارة" : "Best Season", value: isAr ? att.bestSeason : att.bestSeasonEn },
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
        { label: isAr ? "تقييم السياح والزوار" : "Guest Rating", value: `⭐ ${city.rating} / 5 (${city.reviewsCount} تقييم)` },
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
              <span className="text-teal-300 font-black text-xs sm:text-sm">{dynamicCities.length}</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "مدن ووجهات سياحية موثقة" : "Documented Destinations"}</span>
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
        {/* ── UNESCO World Heritage Showcase (Vibrant Pro, No Prev/Next Buttons, 5s Auto-Rotation, Expanded Width) ── */}
        <div className="max-w-6xl mx-auto">
          <section className="relative rounded-3xl bg-gradient-to-br from-white via-[#F8FAFC] to-blue-50/30 border border-blue-900/15 p-6 sm:p-9 shadow-[0_20px_50px_-12px_rgba(0,53,128,0.15)] overflow-hidden text-[#0F172A]">
            {/* Dynamic Ambient Royal Blue & Vibrant Orange Glows */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-500/10 via-indigo-500/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-500/10 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

            {/* Header Banner - Royal Blue & Vibrant Orange Vibrancy */}
            <div className="text-center mb-7 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#003580]/10 text-[#003580] text-xs font-black border border-[#003580]/20 shadow-2xs mb-2.5">
                <span>🏛️</span>
                <span>{isAr ? "التراث العالمي لليونسكو في ليبيا" : "UNESCO World Heritage in Libya"}</span>
                <span className="w-2 h-2 rounded-full bg-[#EA580C] animate-pulse" />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#003580] tracking-tight">
                {isAr ? "اكتشف كنوز ليبيا التاريخية" : "Discover Libya's Ancient Treasures"}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-xl mx-auto font-medium">
                {isAr
                  ? "معالم ومواقع أثرية وتاريخية مدرجة على قائمة التراث العالمي لليونسكو تتغير تلقائياً كل 5 ثوانٍ"
                  : "Archaeological and historical landmarks inscribed on UNESCO list - auto-rotating every 5 seconds"}
              </p>

              {/* City Navigation Pills: Royal Blue Inactive & Vibrant Orange Active */}
              <div className="flex items-center justify-center gap-2 flex-wrap mt-4">
                {unescoSites.map((site, idx) => {
                  const isActive = unescoIndex === idx;
                  return (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => setUnescoIndex(idx)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? "bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#C2410C] text-white shadow-md shadow-orange-500/30 scale-105 font-black ring-2 ring-orange-300/50"
                          : "bg-white hover:bg-blue-50/70 text-[#003580] border border-blue-900/15 shadow-2xs hover:border-[#003580]/40 font-bold"
                      }`}
                    >
                      <span>{isActive ? "📍" : "🏛️"}</span>
                      <span>{getUnescoShortName(site, isAr)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main Showcase Grid: Exactly Equal Heights (lg:h-[395px] for both columns) */}
            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch z-10">
              
              {/* Column 1: Structured Details & Action Controls (Matched Height Flush with Photo) */}
              <div className="lg:col-span-5 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md flex flex-col justify-between text-right lg:h-[395px]">
                {/* All Text Content Grouped at Top */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black border border-emerald-200/80 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{isAr ? "مفتوح ومتاح للزيارة" : "Open for Visitors"}</span>
                    </span>
                    <span className="text-[11px] font-bold text-slate-400">
                      • {activeUnescoSite.region}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#003580] tracking-tight leading-snug">
                    {isAr ? activeUnescoSite.name : activeUnescoSite.nameEn}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed font-normal line-clamp-3">
                    {isAr ? activeUnescoSite.description : activeUnescoSite.descriptionEn}
                  </p>
                </div>

                {/* Structured Specifications Grid (Compact, High-Contrast & Clean) */}
                <div className="grid grid-cols-2 gap-2 my-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 shadow-2xs">
                    <span className="text-[10px] text-[#003580] font-bold block mb-0.5">
                      📍 {isAr ? "الموقع" : "Location"}
                    </span>
                    <strong className="text-slate-900 font-black text-xs block truncate">
                      {isAr ? activeUnescoSite.city : activeUnescoSite.cityEn}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-orange-50/60 border border-orange-100 shadow-2xs">
                    <span className="text-[10px] text-[#EA580C] font-bold block mb-0.5">
                      📅 {isAr ? "أفضل وقت للزيارة" : "Best Season"}
                    </span>
                    <strong className="text-slate-900 font-black text-xs block truncate">
                      {isAr ? activeUnescoSite.bestSeason : activeUnescoSite.bestSeasonEn}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100 shadow-2xs">
                    <span className="text-[10px] text-emerald-700 font-bold block mb-0.5">
                      🎟️ {isAr ? "الدخول" : "Entry"}
                    </span>
                    <strong className="text-emerald-800 font-black text-xs block truncate">
                      {isAr ? "معلومات الزيارة / مجاني" : "Free Access"}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 shadow-2xs">
                    <span className="text-[10px] text-amber-800 font-bold block mb-0.5">
                      🛡️ {isAr ? "الحالة" : "Status"}
                    </span>
                    <strong className="text-slate-900 font-black text-xs block truncate">
                      {isAr ? "معلم أثري محمي" : "Protected Site"}
                    </strong>
                  </div>
                </div>

                {/* UNESCO Heritage Info Notice (Private tours excluded from UNESCO per user specification) */}
                <div className="pt-1">
                  <div className="w-full p-3.5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs font-bold flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🏛️</span>
                      <div>
                        <span className="font-black block text-amber-900">
                          {isAr ? "معلم تراث عالمي معتمد (اليونسكو)" : "UNESCO World Heritage Site"}
                        </span>
                        <span className="text-[11px] text-amber-800 font-medium">
                          {isAr
                            ? "تتم زيارة هذا المعلم حصرياً عبر الرحلات السياحية المجدولة المعتمدة للمحافظة على التراث."
                            : "Visits to this site are conducted exclusively via certified scheduled tours to preserve ancient heritage."}
                        </span>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-amber-200/80 text-amber-900 text-[10px] font-black shrink-0 border border-amber-300">
                      {isAr ? "محمي دولياً 🛡️" : "Protected 🛡️"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: BIG Photographic Display (Equal Height Flush with Details) */}
              <div className="lg:col-span-7 relative h-72 sm:h-80 lg:h-[395px] rounded-3xl overflow-hidden shadow-lg group border border-slate-200/90">
                <img
                  key={activeUnescoSite.id}
                  src={activeUnescoSite.img}
                  alt={isAr ? activeUnescoSite.name : activeUnescoSite.nameEn}
                  className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                {/* Top Badges on Photo */}
                <div className="absolute top-3.5 right-3.5 z-10 pointer-events-none flex items-center gap-2">
                  <span className="px-3.5 py-1.5 rounded-full bg-[#003580]/90 backdrop-blur-md text-amber-300 border border-amber-400/30 text-[11px] font-black flex items-center gap-1.5 shadow-md">
                    <span>🏛️</span>
                    <span>{isAr ? `مسجل في اليونسكو • ${activeUnescoSite.unescoYear || 1982}` : `UNESCO Inscribed ${activeUnescoSite.unescoYear}`}</span>
                  </span>
                </div>

                {/* Bottom Caption on Photo */}
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white pointer-events-none">
                  <div>
                    <h4 className="font-black text-base sm:text-lg text-white drop-shadow">
                      {isAr ? activeUnescoSite.name : activeUnescoSite.nameEn}
                    </h4>
                    <p className="text-xs text-slate-200 mt-0.5 flex items-center gap-1 font-medium">
                      <span className="text-[#EA580C]">📍</span>
                      <span>{isAr ? activeUnescoSite.city : activeUnescoSite.cityEn} • ليبيا</span>
                    </p>
                  </div>

                  <span className="text-[11px] px-3 py-1 rounded-full bg-white/20 backdrop-blur-md border border-white/25 font-bold text-white shadow-xs">
                    {activeUnescoSite.category}
                  </span>
                </div>
              </div>
            </div>

            {/* Sleek Dynamic 5s Auto-Play Indicator Strip (No Prev/Next buttons as requested!) */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-3">
              <span className="text-xs font-mono font-black text-[#003580]">
                {(unescoIndex + 1).toString().padStart(2, "0")} / {unescoSites.length.toString().padStart(2, "0")}
              </span>

              <div className="flex items-center gap-1.5">
                {unescoSites.map((site, i) => {
                  const isActive = unescoIndex === i;
                  return (
                    <button
                      key={site.id}
                      type="button"
                      onClick={() => setUnescoIndex(i)}
                      className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                        isActive
                          ? "w-8 bg-gradient-to-r from-[#D96B27] to-[#EA580C] shadow-sm shadow-orange-500/30"
                          : "w-2 bg-blue-200 hover:bg-[#EA580C]/50"
                      }`}
                      title={site.name}
                    />
                  );
                })}
              </div>

              <span className="text-[11px] font-bold text-slate-400">
                {isAr ? "دوران تلقائي كل 5 ثوانٍ" : "Auto-rotates every 5s"}
              </span>
            </div>
          </section>
        </div>

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
          {displayedCities.length === 0 ? (
            <div className="w-full text-center py-12 bg-white/90 backdrop-blur-md rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <div className="text-4xl">🏛️</div>
              <h3 className="text-base font-black text-slate-800">
                {isAr ? "لا توجد مدن أو وجهات سياحية مطابقة للبحث" : "No touristic destinations match your search"}
              </h3>
              <p className="text-xs text-slate-500">
                {isAr ? "جرّب البحث باسم مدينة أو إزالة عامل التصفية." : "Try clearing filters or search for another city."}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCity("all");
                }}
                className="px-5 py-2 rounded-xl bg-[#003580] text-white font-black text-xs cursor-pointer hover:bg-[#00224f] transition"
              >
                {isAr ? "إلغاء التصفية وعرض الكل" : "Reset Filters"}
              </button>
            </div>
          ) : cityViewMode === "carousel" ? (
            <div ref={cityCarouselRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1">
              {displayedCities.map((city) => (
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

                  {/* Top Overlay: Rating Badge & Wishlist Favorite Button */}
                  <div className="absolute top-5 right-5 left-5 flex items-center justify-between text-white z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 text-white font-black text-xs shadow-md">
                      <span className="text-amber-400 text-sm">★</span>
                      <span>{city.rating || "4.9"}</span>
                      <span className="text-[10px] text-white/75 font-semibold">({city.reviewsCount || 120} {isAr ? "تقييم" : "reviews"})</span>
                    </div>

                    <div className="pointer-events-auto">
                      <FavoriteButton
                        itemType="landmark"
                        itemId={city.id}
                        itemTitle={city.name}
                        size="md"
                      />
                    </div>
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
              {displayedCities.map((city) => (
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

                  {/* Top Overlay: Rating Badge & Wishlist Favorite Button */}
                  <div className="absolute top-5 right-5 left-5 flex items-center justify-between text-white z-10 pointer-events-none">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-black/55 backdrop-blur-md border border-white/20 text-white font-black text-xs shadow-md">
                      <span className="text-amber-400 text-sm">★</span>
                      <span>{city.rating || "4.9"}</span>
                      <span className="text-[10px] text-white/75 font-semibold">({city.reviewsCount || 120} {isAr ? "تقييم" : "reviews"})</span>
                    </div>

                    <div className="pointer-events-auto">
                      <FavoriteButton
                        itemType="landmark"
                        itemId={city.id}
                        itemTitle={city.name}
                        size="md"
                      />
                    </div>
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

interface LandmarkReviewItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

const DEFAULT_LANDMARK_REVIEWS: Record<string, LandmarkReviewItem[]> = {
  default: [
    {
      id: "rev-1",
      authorName: "م. سالم الترهوني",
      rating: 5,
      date: "2026-10-12",
      comment: "معلم أثري مهيب وغاية في الإبهار والجمال، التنظيم والنظافة ممتازة جداً. تجربة لا غنى عنها لكل زائر.",
      isVerified: true,
    },
    {
      id: "rev-2",
      authorName: "فاطمة الورفلي",
      rating: 5,
      date: "2026-09-28",
      comment: "تفاصيل النقوش والمعمار القديم تأسر القلوب، وجود المرشد السياحي أضاف قيمة تاريخية عظيمة لمعرفة تفاصيل المكان.",
      isVerified: true,
    },
    {
      id: "rev-3",
      authorName: "د. عبد السلام المبروك",
      rating: 5,
      date: "2026-08-15",
      comment: "فخر السياحة والتاريخ الليبي، معلم يستحق التصنيف العالمي بامتياز. أنصح بزيارته في الصباح الباكر للاستمتاع بالإطلالة.",
      isVerified: true,
    },
  ],
};

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
  const [activeModalTab, setActiveModalTab] = useState<"history" | "highlights" | "reviews" | "trips">("history");
  const [showPromo, setShowPromo] = useState(true);

  // Reviews state
  const [reviewsList, setReviewsList] = useState<LandmarkReviewItem[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState("");

  const session = getStoredSession();
  const isTourist = Boolean(session?.token && (session?.role === "tourist" || session?.user?.role === "tourist"));

  // Check if site is UNESCO
  const isUnescoSite = Boolean(
    (city as any)?.isUnesco ||
    city?.id === "city-khoms" ||
    city?.id === "city-sabratha" ||
    city?.id === "city-ghadames" ||
    city?.id === "city-cyrene" ||
    city?.id === "city-tadrart" ||
    city?.name?.includes("لبدة") ||
    city?.name?.includes("صبراتة") ||
    city?.name?.includes("غدامس") ||
    city?.name?.includes("شحات") ||
    city?.name?.includes("أكاكوس")
  );

  useEffect(() => {
    if (!city) return;
    try {
      const stored = localStorage.getItem(`delni_landmark_reviews_${city.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setReviewsList(parsed);
          return;
        }
      }
    } catch {}
    setReviewsList(DEFAULT_LANDMARK_REVIEWS[city.id] || DEFAULT_LANDMARK_REVIEWS.default);
  }, [city?.id]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !city) return;
    setIsSubmittingReview(true);

    const touristName = session?.user?.full_name || session?.user?.name || (isAr ? "سائح معتمد" : "Verified Tourist");
    const newRev: LandmarkReviewItem = {
      id: `rev-${Date.now()}`,
      authorName: touristName,
      rating: newRating,
      date: new Date().toISOString().split("T")[0],
      comment: newComment.trim(),
      isVerified: true,
    };

    const updated = [newRev, ...reviewsList];
    setReviewsList(updated);
    try {
      localStorage.setItem(`delni_landmark_reviews_${city.id}`, JSON.stringify(updated));
    } catch {}

    setNewComment("");
    setIsSubmittingReview(false);
    setReviewSuccessMsg(isAr ? "تم نشر تقييمك بنجاح! شكراً لمشاركتك تجربتك." : "Your review has been posted successfully! Thank you.");
    setTimeout(() => setReviewSuccessMsg(""), 4000);
  };

  if (!city) return null;

  const photo = city.img || heroImg;
  const avgRating = reviewsList.length > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
    : (city.rating || 4.9).toFixed(1);

  const modalTabs = [
    { id: "history", label: isAr ? "📖 نبذة وتاريخ المعلم" : "History & Heritage", icon: "🏛️" },
    { id: "highlights", label: isAr ? "✨ أبرز ٤ محطات وتجارب" : "Top 4 Highlights", icon: "⭐" },
    { id: "reviews", label: isAr ? `⭐ التقييمات (${reviewsList.length})` : `⭐ Reviews (${reviewsList.length})`, icon: "⭐" },
    ...(!isUnescoSite ? [{ id: "trips", label: isAr ? "🧭 تفاصيل الرحلات الخاصة" : "Private Tours Info", icon: "🧭" }] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fade-in" dir={dir}>
      <div className="bg-white rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col relative text-slate-900 animate-in fade-in zoom-in-95 duration-200">
        
        {/* 1. Grand Hero Photo Showcase for the City Landmark */}
        <div className="relative h-72 sm:h-96 md:h-[420px] w-full overflow-hidden bg-slate-900 shrink-0 group">
          <img
            src={photo}
            alt={city.name}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/25 pointer-events-none" />

          {/* Floating Top Controls */}
          <div className="absolute top-4 right-4 left-4 z-30 flex items-center justify-between">
            <span className="bg-white/95 backdrop-blur-md text-[#003580] text-xs font-black px-3.5 py-1.5 rounded-full border border-blue-100 shadow-md flex items-center gap-1.5">
              <span>🏛️</span>
              <span>{isAr ? "معلم سياحي موثق" : "Verified Landmark"}</span>
            </span>

            <div className="flex items-center gap-2">
              <FavoriteButton
                itemType="landmark"
                itemId={city.id}
                itemTitle={city.name}
                size="md"
                className="bg-white/95 backdrop-blur-md text-slate-700 hover:text-red-500 shadow-md border border-slate-200"
              />
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-md text-slate-700 hover:text-black hover:bg-white flex items-center justify-center transition cursor-pointer shadow-md border border-slate-200"
                title={isAr ? "إغلاق" : "Close"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 right-4 left-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div className="drop-shadow-lg space-y-1">
              <div className="text-xl sm:text-3xl font-black text-white">{isAr ? city.name : city.nameEn}</div>
              <div className="text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2 drop-shadow">
                <span>✨</span>
                <span>{isAr ? city.subtitle : city.subtitleEn}</span>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-slate-100">
              📍 {city.region}
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body Content Below Showcase */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-right bg-[#FAFBFD]">
          
          {/* Header Section: City Title + Region Badges + Rating */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#003580] text-white font-black text-xs shadow-xs">
                📍 {city.region}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-50 text-[#D96B27] font-black text-xs border border-amber-200 shadow-xs">
                🏛️ {isAr ? city.categoryTag : city.categoryTagEn}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black shadow-xs">
                <span className="text-amber-500">★</span>
                <span>{avgRating} / 5</span>
                <span className="text-slate-500 font-bold">({reviewsList.length} {isAr ? "تقييم" : "reviews"})</span>
              </div>
            </div>

            {/* Google Maps link button */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.mapQuery || city.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#003580] font-black text-xs border border-blue-200 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>🗺️</span>
              <span>{isAr ? "عرض الموقع في خرائط Google ↗" : "View Map ↗"}</span>
            </a>
          </div>

          {/* Interactive Modal Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-200/70 border border-slate-300/60 overflow-x-auto">
            {modalTabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModalTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                  activeModalTab === tab.id
                    ? "bg-[#003580] text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
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
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
                <h4 className="text-sm font-black text-[#003580] flex items-center gap-2">
                  <span>📖</span>
                  <span>{isAr ? "عن المعلم وأهميته التاريخية:" : "About the Landmark & Heritage:"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal">
                  {isAr ? city.description : city.descriptionEn}
                </p>
              </div>

              {/* VIP Offer Card */}
              {showPromo && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-100/50 border border-amber-300 shadow-xs flex items-center justify-between gap-3 text-xs relative">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#D96B27] text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
                      🎁
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm block text-amber-950">
                        {isAr ? `عروض ترويجية حصرية للفنادق والمطاعم في ${city.shortName}` : `Exclusive Hotel & Dining Offers in ${city.shortNameEn}`}
                      </span>
                      <span className="text-amber-800 text-[11px] sm:text-xs font-medium">
                        {isAr ? "خصم 20% على الإقامة والمأكولات بالتعاون مع حجز الفنادق والمطاعم لعملاء دلّني." : "20% discount on stays and local restaurants for Dallani travelers."}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPromo(false)}
                    className="w-7 h-7 rounded-full bg-amber-200/60 hover:bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs cursor-pointer transition shrink-0"
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
                <h4 className="text-sm font-black text-[#003580] flex items-center gap-2">
                  <span>✨</span>
                  <span>{isAr ? "أبرز المعالم والمحطات الرئيسية (٤ محطات):" : "Top 4 Highlights & Stations:"}</span>
                </h4>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {isAr ? "معالم موثقة 100%" : "Verified 100%"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {city.highlights.slice(0, 4).map((hl, idx) => {
                  const icons = ["🏛️", "🌊", "🏺", "🌴"];
                  return (
                    <div
                      key={idx}
                      className="group relative p-4 rounded-2xl bg-white hover:bg-blue-50/40 border-2 border-slate-100 hover:border-blue-200 shadow-xs transition-all duration-300 flex items-center gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-[#003580] text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                        <span>{icons[idx % icons.length]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black text-[#D96B27] uppercase tracking-wider">
                          <span>{isAr ? `المعلم ${idx + 1}` : `Station #${idx + 1}`}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-slate-800 leading-snug block truncate mt-0.5 group-hover:text-[#003580] transition-colors">
                          {hl}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center text-[11px] font-black shrink-0">
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Verified Visitor Reviews & Tourist Rating Form (Matching Trips Page) */}
          {activeModalTab === "reviews" && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Summary Rating Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-[#003580] flex items-center gap-2">
                    <span>⭐</span>
                    <span>{isAr ? "تقييمات وتجارب الزوار المعتمدة لهذا المعلم:" : "Verified Visitor Reviews & Ratings:"}</span>
                  </h4>
                  <p className="text-xs text-slate-500 font-bold mt-1">
                    {isAr
                      ? "تقييمات وآراء السياح والزوار الحقيقيين الموثقة في منصة دلّني"
                      : "Genuine verified visitor reviews and feedback on Dallani"}
                  </p>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-amber-200 shadow-xs">
                  <span className="text-amber-500 text-2xl font-black">★</span>
                  <div>
                    <div className="text-base font-black text-amber-950">
                      {avgRating} / 5
                    </div>
                    <div className="text-[10px] text-slate-500 font-bold">
                      {reviewsList.length} {isAr ? "تقييم معتمد" : "reviews"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviewsList.map((rev) => (
                  <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#003580] text-white flex items-center justify-center font-black text-xs shadow-xs">
                          {(rev.authorName || "س").slice(0, 1)}
                        </div>
                        <div>
                          <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                            <span>{rev.authorName}</span>
                            <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                              {isAr ? "زائر موثق ✓" : "Verified ✓"}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-medium">
                            {rev.date}
                          </div>
                        </div>
                      </div>

                      <div className="text-amber-500 text-sm font-black">
                        {"★".repeat(Math.max(1, Math.min(5, rev.rating)))}
                        <span className="text-slate-300 text-xs mr-1">
                          {"☆".repeat(Math.max(0, 5 - rev.rating))}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed pr-10">
                      «{rev.comment}»
                    </p>
                  </div>
                ))}
              </div>

              {/* Tourist Review Submission Form */}
              {isTourist ? (
                <form onSubmit={handleAddReview} className="p-5 rounded-2xl bg-white border-2 border-blue-100 shadow-xs space-y-3">
                  <h5 className="text-xs sm:text-sm font-black text-[#003580] flex items-center gap-1.5">
                    <span>✍️</span>
                    <span>{isAr ? "أضف تقييمك وتجربتك لهذا المعلم السياحي:" : "Add Your Review for this Landmark:"}</span>
                  </h5>

                  {reviewSuccessMsg && (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                      <span>✓</span>
                      <span>{reviewSuccessMsg}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">{isAr ? "التقييم:" : "Rating:"}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`text-xl transition-all cursor-pointer ${
                            star <= newRating ? "text-amber-500 scale-110" : "text-slate-300 hover:text-amber-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <span className="text-xs font-black text-amber-700">{newRating} / 5</span>
                  </div>

                  <textarea
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={isAr ? "اكتب رأيك وانطباعك عن زيارة هذا المعلم..." : "Write your thoughts and experience about visiting this landmark..."}
                    className="w-full p-3 rounded-xl border border-slate-300 focus:border-[#003580] focus:ring-1 focus:ring-[#003580] text-xs sm:text-sm text-slate-900 outline-none resize-none"
                    required
                  />

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !newComment.trim()}
                      className="px-6 py-2.5 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? (isAr ? "جاري النشر..." : "Posting...") : (isAr ? "نشر التقييم ⭐" : "Submit Review ⭐")}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <span className="text-lg">💡</span>
                    <span>
                      {isAr
                        ? "هل قمت بزيارة هذا المعلم؟ سجّل الدخول بحساب سائح لإضافة تقييمك ورأيك وتجربتك."
                        : "Have you visited this landmark? Log in as a tourist to add your rating and review."}
                    </span>
                  </div>
                  <a
                    href="/auth/login?role=tourist"
                    className="px-4 py-2 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs shrink-0 transition"
                  >
                    {isAr ? "تسجيل الدخول كسائح ➔" : "Login as Tourist ➔"}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Custom Private Tours (ONLY if not UNESCO) */}
          {!isUnescoSite && activeModalTab === "trips" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/60 via-white to-amber-50/40 border border-blue-200/80 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#003580] text-white font-black text-xs shadow-xs">
                    🧭 {isAr ? "رحلات خاصة مخصصة بالكامل" : "Custom Private Tours"}
                  </span>
                  <span className="text-xs font-bold text-slate-700">{isAr ? "سيارة خاصة + مرشد معتمد" : "Private Vehicle + Guide"}</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed">
                  {isAr 
                    ? "يمكنك إنشاء وتصميم رحلتك الخاصة لزيارة هذا المعلم بكامل الخصوصية والراحة، مع اختيار وسيلة النقل المناسبة والمرشد السياحي المرافق وتحديد وقت ومكان الانطلاق المناسب لك."
                    : "You can create and customize your own private tour to this landmark with full privacy and flexibility, choosing your vehicle, certified guide, and departure time."}
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Action Button: ONLY for NON-UNESCO landmarks */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-center shrink-0">
          {isUnescoSite ? (
            <div className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs text-center">
              <span className="text-base">🏛️</span>
              <span>
                {isAr
                  ? "موقع تراث عالمي محمي (اليونسكو) — متاح للزيارة حصرياً عبر الرحلات المجدولة المعتمدة ولا تقام رحلات خاصة فردية حمايةً للآثار"
                  : "UNESCO Protected World Heritage Site — Accessible exclusively via authorized scheduled tours to ensure heritage preservation"}
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onBookPrivate}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs sm:text-sm shadow-lg shadow-blue-900/15 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <span>🧭</span>
              <span>{isAr ? "إنشاء رحلة خاصة لهذا المعلم (مع اختيار المرشد والمركبة)" : "Create Custom Trip for this Landmark"}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

