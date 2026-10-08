import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import { PrivateTripModal } from "@/components/Modals";
import { GuideCVModal } from "@/components/GuideCVModal";
import {
  Search,
  MapPin,
  Award,
  ChevronLeft,
  ChevronRight,
  Heart,
  Calendar,
  User,
  ArrowUpRight,
} from "lucide-react";
import { HeroSlideshow } from "@/components/HeroSlideshow";

import guideHeroImg from "@/assets/guide-hero.jpg";

export const Route = createFileRoute("/guides")({
  head: () => ({
    meta: [
      { title: "المرشدون السياحيون المعتمدون في ليبيا | منصة دَلِّني" },
      {
        name: "description",
        content:
          "دليل المرشدين السياحيين المعتمدين في ليبيا: تصفح وفلتر حسب الجنس، اللغات، المنطقة، وسنوات الخبرة واختيار المرشد للرحلات الخاصة.",
      },
    ],
  }),
  component: GuidesPage,
});

import { TourGuide, TOUR_GUIDES_DATA, formatWorkingDays, REGIONS_MAP } from "@/lib/guidesData";
import { apiGetGuidesCatalog } from "@/lib/api";

function GuidesPage() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  // Live Database Guides from DelniDB
  const [dbGuides, setDbGuides] = useState<TourGuide[]>([]);

  useEffect(() => {
    async function fetchLiveGuides() {
      const data = await apiGetGuidesCatalog();
      if (Array.isArray(data) && data.length > 0) {
        const mapped: TourGuide[] = data.map((g: any, idx: number) => {
          let opRegions: string[] = [];
          try {
            opRegions = typeof g.operating_regions === 'string' ? JSON.parse(g.operating_regions) : (g.operating_regions || []);
          } catch {
            opRegions = [];
          }

          let wDays: string[] = [];
          try {
            wDays = typeof g.working_days === 'string' ? JSON.parse(g.working_days) : (g.working_days || []);
          } catch {
            wDays = [];
          }

          const langs: { code: string; nameAr: string; nameEn: string }[] = [
            { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
          ];
          if (g.speaks_english) langs.push({ code: "EN", nameAr: "الإنجليزية", nameEn: "English" });
          if (g.speaks_french) langs.push({ code: "FR", nameAr: "الفرنسية", nameEn: "French" });
          if (g.speaks_italian) langs.push({ code: "IT", nameAr: "الإيطالية", nameEn: "Italian" });

          return {
            id: g.license_number || `guide-${idx}`,
            licenseNumber: g.license_number || `LIC-${idx}`,
            name: g.full_name || "مرشد سياحي معتمد",
            gender: g.gender === "female" ? "female" : "male",
            avatar: g.avatar || (g.gender === "female" ? "/assets/guide-souad.jpg" : "/assets/guide-mohammed.jpg"),
            title: g.title || (g.gender === "female" ? "مرشدة سياحية معتمدة" : "مرشد سياحي معتمد"),
            experienceYears: Number(g.years_of_experience) || 0,
            rating: 5.0,
            reviewsCount: 12 + (Number(g.total_tours_completed) || 0) * 2,
            pricePerDay: Number(g.price_per_day) || 150,
            primaryRegion: g.primaryRegion || (opRegions[0] || "tripoli"),
            operatingRegions: opRegions.length > 0 ? opRegions : ["tripoli"],
            languages: langs,
            bio: g.bio || "مرشد سياحي معتمد ومسجل في منصة دَلّني السياحية.",
            phone: g.phone_number || "",
            verified: g.verification_status === "موثق",
            totalToursCompleted: Number(g.total_tours_completed) || 0,
            specialties: g.specialties
              ? (typeof g.specialties === 'string' ? g.specialties.split("، ") : g.specialties)
              : ["جولات تاريخية", "إرشاد سياحي"],
            workingDays: wDays.length > 0 ? wDays : ["طوال أيام الأسبوع"],
          };
        });
        setDbGuides(mapped);
      }
    }
    fetchLiveGuides();
  }, []);

  const guidesSource = useMemo(() => {
    return dbGuides.length > 0 ? dbGuides : TOUR_GUIDES_DATA;
  }, [dbGuides]);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");
  const [langFilter, setLangFilter] = useState<string>("all");
  const [regionFilter, setRegionFilter] = useState<string>("all");
  const [expFilter, setExpFilter] = useState<string>("all");
  const [filterTab, setFilterTab] = useState<"all" | "gender" | "region">("all");
  const [workDaysFilter, setWorkDaysFilter] = useState<"all" | "full" | "weekend">("all");

  // Selected Guide Detail Modal State
  const [selectedGuide, setSelectedGuide] = useState<TourGuide | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Private Custom Trip Modal with Pre-selected Guide
  const [privateTripModalOpen, setPrivateTripModalOpen] = useState(false);
  const [selectedGuideForTrip, setSelectedGuideForTrip] = useState<string | undefined>(undefined);

  // 3D Stacked Photo Deck Spotlight State & Auto-rotation (5 Seconds)
  const [spotlightIndex, setSpotlightIndex] = useState(0);

  // Carousel Scroll Controls Ref & Functions
  const carouselRef = useRef<HTMLDivElement>(null);
  const cardsSectionRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  const scrollToCards = () => {
    setTimeout(() => {
      cardsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleFilterSelect = (setter: Function, value: any) => {
    setter(value);
    scrollToCards();
  };

  useEffect(() => {
    if (guidesSource.length === 0) return;
    const timer = setInterval(() => {
      setSpotlightIndex((prev) => (prev + 1) % guidesSource.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [guidesSource]);

  const currentSpotlightGuide = guidesSource[spotlightIndex] || guidesSource[0];

  function handleNextSpotlight() {
    if (guidesSource.length === 0) return;
    setSpotlightIndex((prev) => (prev + 1) % guidesSource.length);
  }

  // Filter Logic
  const filteredGuides = useMemo(() => {
    return guidesSource.filter((g) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = g.name.toLowerCase().includes(q);
        const matchTitle = g.title.toLowerCase().includes(q);
        const matchLicense = g.licenseNumber.toLowerCase().includes(q);
        const matchSpec = g.specialties.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchTitle && !matchLicense && !matchSpec) return false;
      }

      // Gender
      if (genderFilter !== "all" && g.gender !== genderFilter) return false;

      // Spoken Language
      if (langFilter !== "all") {
        const hasLang = g.languages.some((l) => l.code === langFilter);
        if (!hasLang) return false;
      }

      // Region
      if (regionFilter !== "all") {
        const hasRegion = g.operatingRegions.includes(regionFilter);
        if (!hasRegion) return false;
      }

      // Experience Level
      if (expFilter === "1-3" && (g.experienceYears < 1 || g.experienceYears > 3)) return false;
      if (expFilter === "4-8" && (g.experienceYears < 4 || g.experienceYears > 8)) return false;
      if (expFilter === "9+" && g.experienceYears < 9) return false;

      // Work Days
      if (workDaysFilter === "full" && !g.workingDays.includes("طوال أيام الأسبوع")) return false;

      return true;
    });
  }, [searchQuery, genderFilter, langFilter, regionFilter, expFilter, workDaysFilter]);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      {/* Standardized Balanced Hero Container */}
      <div className="relative h-80 sm:h-96 overflow-hidden bg-[#0F172A]">
        {/* Professional Animated Slideshow */}
        <HeroSlideshow
          images={[
            guideHeroImg,
            "/assets/guide-mohammed.jpg",
            "/assets/guide-souad.jpg",
            "/assets/guide-tariq.jpg",
          ]}
          alt="المرشدون السياحيون في ليبيا"
          brightness="brightness-105"
        />

        {/* Natural Smooth Gradient Mask */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent z-10" />

        {/* Floating Transparent Header Directly OVER the Photo */}
        <Header active="guides" />

        {/* Hero Text & Badge Content */}
        <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-16 text-white space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-black w-fit border border-white/30 shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>{isAr ? "المرشدون السياحيون المعتمدون" : "Certified Tour Guides"}</span>
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black drop-shadow-xl tracking-tight leading-tight">
            {isAr ? "المرشدون السياحيون في جميع مناطق ليبيا" : "Certified Tour Guides Across Libya"}
          </h1>
          <p className="text-white/95 max-w-2xl text-xs sm:text-sm md:text-base font-semibold leading-relaxed drop-shadow-md">
            {isAr
              ? "تصفح السير الذاتية ورخص الإرشاد للمحترفين في طرابلس، لبدة، غدامس، أوباري والجبل الأخضر. يمكنك اختيار المرشد المفضل لديك لتصميم رحلة خاصة مخصصة بالكامل."
              : "Browse verified credentials & licenses of experts in Tripoli, Leptis, Ghadames, Ubari & Green Mountain."}
          </p>
        </div>
      </div>

      {/* Clean Filter Panel Floating Gracefully Below Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 mb-8">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-5 sm:p-6 shadow-xl border border-[#E8E2D6] text-[#0F172A] space-y-4">
            {/* Sub Radio Options Row (Screenshot Style) */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A]">
                <span className="text-[#5A6A85]">{isAr ? "جنس المرشد:" : "Gender:"}</span>
                {[
                  { value: "all", label: isAr ? "الكل (ذكور وإناث)" : "All" },
                  { value: "male", label: isAr ? "مرشدون ذكور 👨" : "Male Guides" },
                  { value: "female", label: isAr ? "مرشدات إناث 👩" : "Female Guides" },
                ].map((g) => (
                  <label key={g.value} className="flex items-center gap-1.5 cursor-pointer hover:text-[#1B5A78]">
                    <input
                      type="radio"
                      name="genderFilter"
                      checked={genderFilter === g.value}
                      onChange={() => handleFilterSelect(setGenderFilter, g.value as any)}
                      className="w-4 h-4 accent-[#1B5A78]"
                    />
                    <span>{g.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A]">
                <span className="text-[#5A6A85]">{isAr ? "أيام الجاهزية:" : "Availability:"}</span>
                {[
                  { value: "all", label: isAr ? "بداية الأسبوع فقط" : "Early Week Only" },
                  { value: "full", label: isAr ? "طوال الأسبوع (7 أيام)" : "All Week" },
                  { value: "weekend", label: isAr ? "نهاية الأسبوع فقط" : "Weekends Only" },
                ].map((w) => (
                  <label key={w.value} className="flex items-center gap-1.5 cursor-pointer hover:text-[#1B5A78]">
                    <input
                      type="radio"
                      name="workDaysFilter"
                      checked={workDaysFilter === w.value}
                      onChange={() => handleFilterSelect(setWorkDaysFilter, w.value as any)}
                      className="w-4 h-4 accent-[#1B5A78]"
                    />
                    <span>{w.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Main Inputs Row (Screenshot Style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 p-3.5 bg-[#FAF7F2] rounded-2xl border border-[#E8E2D6]">
              {/* Search Keyword - Name Only */}
              <div className="lg:col-span-4 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs">
                <label className="text-[10px] font-black text-[#5A6A85] block mb-1">اسم المرشد فقط:</label>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      if (e.target.value.length >= 2) scrollToCards();
                    }}
                    placeholder="ابحث باسم المرشد فقط..."
                    className="w-full h-8 text-xs font-bold text-[#0F172A] outline-none bg-transparent"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery("")} className="absolute left-0 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5A6A85]">
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Languages (Pure Arabic Text) */}
              <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs">
                <label className="text-[10px] font-black text-[#5A6A85] block mb-1">اللغات المتقنة:</label>
                <select
                  value={langFilter}
                  onChange={(e) => handleFilterSelect(setLangFilter, e.target.value)}
                  className="w-full h-8 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">كل اللغات</option>
                  <option value="AR">العربية</option>
                  <option value="EN">الإنجليزية</option>
                  <option value="FR">الفرنسية</option>
                  <option value="IT">الإيطالية</option>
                </select>
              </div>

              {/* Region */}
              <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs">
                <label className="text-[10px] font-black text-[#5A6A85] block mb-1">المنطقة والمدينة:</label>
                <select
                  value={regionFilter}
                  onChange={(e) => handleFilterSelect(setRegionFilter, e.target.value)}
                  className="w-full h-8 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">جميع المناطق والمدن</option>
                  <option value="tripoli">طرابلس وضواحيها</option>
                  <option value="leptis">لبدة الكبرى والخمس</option>
                  <option value="sabratha">صبراتة والساحل الغربي</option>
                  <option value="cyrene">شحات وقورينا (الجبل الأخضر)</option>
                  <option value="benghazi">بنغازي والمنطقة الشرقية</option>
                  <option value="ghadames">غدامس والواحات</option>
                  <option value="ubari">أوباري وفزان</option>
                  <option value="acacus">جبال أكاكوس وغات</option>
                </select>
              </div>

              {/* Experience */}
              <div className="lg:col-span-2 bg-white p-3 rounded-xl border border-[#E8E2D6] shadow-xs">
                <label className="text-[10px] font-black text-[#5A6A85] block mb-1">سنوات الخبرة:</label>
                <select
                  value={expFilter}
                  onChange={(e) => handleFilterSelect(setExpFilter, e.target.value)}
                  className="w-full h-8 text-xs font-bold text-[#0F172A] outline-none bg-transparent cursor-pointer"
                >
                  <option value="all">كافة مستويات الخبرة</option>
                  <option value="1-3">1 - 3 سنوات</option>
                  <option value="4-8">4 - 8 سنوات</option>
                  <option value="9+">+9 سنوات (خبراء)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-12">

        {/* Results Counter & Transparent View All Toggle Header */}
        <div ref={cardsSectionRef} className="flex flex-wrap items-center justify-between gap-4 pt-4 scroll-mt-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] flex items-center gap-2">
              <span>المرشدون السياحيون المتاحون</span>
              <span className="px-3 py-0.5 rounded-full bg-[#1B5A78] text-white text-xs font-bold">
                {filteredGuides.length} مرشد
              </span>
            </h2>
          </div>

          {/* Transparent "عرض الكل" Button & Scroll Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setViewMode(viewMode === "carousel" ? "grid" : "carousel")}
              className="px-4 py-2 rounded-full bg-transparent hover:bg-[#1B5A78]/10 text-[#1B5A78] border border-[#1B5A78]/30 text-xs font-black flex items-center gap-1.5 backdrop-blur-xs shadow-2xs transition cursor-pointer"
              title={viewMode === "carousel" ? "عرض جميع المرشدين كـ قائمة تحت بعض في نفس الصفحة" : "العودة للشريط الأفقي"}
            >
              <span>{viewMode === "carousel" ? "📜" : "↔️"}</span>
              <span>{viewMode === "carousel" ? `عرض الكل (${filteredGuides.length})` : "عرض كـ شريط أفقي"}</span>
            </button>

            {/* Scroll Arrow Buttons (Active in Carousel Mode) */}
            {viewMode === "carousel" && filteredGuides.length > 0 && (
              <div className="flex items-center gap-1.5 mr-1">
                <button
                  type="button"
                  onClick={scrollRight}
                  className="w-9 h-9 rounded-full bg-transparent border border-[#E8E2D6] hover:bg-[#1B5A78]/10 hover:text-[#1B5A78] text-[#0F172A] grid place-items-center transition cursor-pointer"
                  title="التمرير لليمين"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={scrollLeft}
                  className="w-9 h-9 rounded-full bg-transparent border border-[#E8E2D6] hover:bg-[#1B5A78]/10 hover:text-[#1B5A78] text-[#0F172A] grid place-items-center transition cursor-pointer"
                  title="التمرير لليسار"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Cards Display (Horizontal Scroll by default, OR Full Grid when clicking View All) */}
        {filteredGuides.length > 0 ? (
          <div
            ref={carouselRef}
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4 pb-8"
                : "flex gap-6 overflow-x-auto no-scrollbar snap-x scroll-smooth pb-6 pt-3"
            }
          >
            {filteredGuides.map((guide) => {
              const daysText = formatWorkingDays(guide.workingDays);
              const isFav = favorites.has(guide.id);

              return (
                <div
                  key={guide.id}
                  onClick={() => setSelectedGuide(guide)}
                  className={`${
                    viewMode === "grid" ? "w-full" : "w-72 sm:w-[285px] shrink-0 snap-start"
                  } bg-white rounded-[24px] shadow-card hover:shadow-2xl hover:-translate-y-1.5 border border-[#E8E2D6] transition-all duration-300 flex flex-col group cursor-pointer overflow-hidden relative`}
                >
                  {/* Top Image Section with DISTINCT Photo */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100">
                    <img
                      src={guide.avatar}
                      alt={guide.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                    {/* Floating Heart Favorite Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleFavorite(guide.id, e)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md flex items-center justify-center text-stone-600 hover:text-red-500 transition-colors cursor-pointer border border-white/50 z-10"
                      title="إضافة للمفضلة"
                    >
                      <Heart className={`w-4 h-4 ${isFav ? "fill-red-500 text-red-500" : ""}`} />
                    </button>

                    {/* Rating & Verified Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-white font-black text-[11px] border border-white/20 flex items-center gap-1 shadow-xs">
                        ★ {guide.rating} ({guide.reviewsCount})
                      </span>
                    </div>
                  </div>

                  {/* Bottom Content Card */}
                  <div className="p-4 bg-white space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Guide Name */}
                      <h3 className="font-black text-lg text-[#0F172A] leading-snug group-hover:text-[#1B5A78] transition-colors truncate">
                        {guide.name}
                      </h3>

                      {/* Title / Specialty */}
                      <p className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                        {guide.title}
                      </p>

                      {/* Location / Work Place (مكان العمل) */}
                      <div className="flex items-center gap-1.5 text-xs font-black text-[#EA580C] mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                        <span className="truncate">{REGIONS_MAP[guide.primaryRegion]}</span>
                      </div>
                    </div>

                    {/* Explicit Working Days Highlight Badge */}
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-stone-700 bg-amber-50/90 px-2.5 py-1 rounded-lg border border-amber-200/80">
                      <Calendar className="w-3.5 h-3.5 text-[#EA580C] shrink-0" />
                      <span className="truncate">أيام العمل: {daysText}</span>
                    </div>

                    {/* Info Bar & Orange CV Arrow Button */}
                    <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 text-[11px] font-bold text-stone-600">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-orange-400" />
                          <span>{guide.experienceYears} س</span>
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="text-emerald-700 font-black text-[11px] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          ✓ مرخص ومعتمد
                        </span>
                      </div>

                      {/* Orange Circle Arrow Button -> Opens Guide CV Card Modal */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedGuide(guide);
                        }}
                        className="w-8 h-8 rounded-full bg-[#EA580C] hover:bg-[#C25B1E] text-white flex items-center justify-center shadow-md shadow-orange-500/25 hover:scale-110 active:scale-95 transition-all cursor-pointer shrink-0"
                        title="عرض كرت السيرة الذاتية"
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#E8E2D6] max-w-md mx-auto my-12">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-[#5A6A85] grid place-items-center mx-auto text-2xl mb-4">
              🔍
            </div>
            <h3 className="text-lg font-black text-[#0F172A]">لم يتم العثور على مرشدين مطابقين للبحث</h3>
            <p className="text-xs text-[#5A6A85] mt-2 font-medium">
              جرب مراجعة الفلاتر أو البحث باسم مرشد آخر أو إعادة ضبط خيارات البحث.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setGenderFilter("all");
                setLangFilter("all");
                setRegionFilter("all");
                setExpFilter("all");
              }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-[#1B5A78] text-white font-bold text-xs hover:bg-[#13445C] transition cursor-pointer"
            >
              عرض كافة المرشدين ↺
            </button>
          </div>
        )}

        {/* Guide Registration CTA Banner Card (Image 2 style) */}
        <section className="bg-gradient-to-r from-[#1B5A78] to-[#0F394D] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl border border-white/10 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left Image (Image 2 style Traveller/Guide) */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-4 border-white/20 shadow-2xl transform -rotate-3 hover:rotate-0 transition duration-300">
                <img
                  src="/assets/guide-mohammed.jpg"
                  alt="انضم كمرشد سياحي"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black">
                  📜 مرشد معتمد
                </span>
              </div>
            </div>

            {/* Center / Right Content */}
            <div className="lg:col-span-8 space-y-4 text-right">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-black border border-white/20">
                <span>🤝 انضم إلى عائلة دَلِّني</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                هل تريد التسجيل معنا كمرشد سياحي معتمد؟
              </h2>
              <p className="text-white/90 text-sm sm:text-base font-medium leading-relaxed max-w-2xl">
                سجل معنا الآن واستقبل طلبات الرحلات الخاصة والوفود السياحية في مدينتك. صمم جولاتك بنفسك وحدد أسعارك بكل مرونة وشفافية.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/auth/signup"
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black text-sm shadow-xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>تسجيل الدخول / الانضمام كمرشد سياحي</span>
                  <span className="text-lg">🧭</span>
                </Link>
                <Link
                  to="/auth/login"
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm transition"
                >
                  تسجيل الدخول لحسابك 🔑
                </Link>
              </div>
            </div>
          </div>

          {/* Decorative Ambient Lighting */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#D96B27]/20 blur-3xl" />
        </section>
      </main>


      {/* Guide Detail & CV Modal */}
      <GuideCVModal
        open={!!selectedGuide}
        onClose={() => setSelectedGuide(null)}
        guide={selectedGuide}
        onSelectForPrivateTrip={(gName) => {
          setSelectedGuideForTrip(gName);
          setPrivateTripModalOpen(true);
        }}
      />

      {/* Private Custom Trip Modal with Pre-selected Guide */}
      <PrivateTripModal
        open={privateTripModalOpen}
        onClose={() => setPrivateTripModalOpen(false)}
        initialGuide={selectedGuideForTrip}
      />

      <Footer />
    </div>
  );
}
