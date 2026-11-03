import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-leptis.jpg";
import { useLanguage } from "@/lib/i18n";
import { getStoredSession } from "@/lib/api";
import { FavoriteButton } from "@/components/FavoriteButton";
import type { CityDestinationItem } from "@/lib/attractionsData";
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

/**
 * A landmark (places_tourist row from GET /api/places) in the shape the landmark details window reads.
 * Shared by the landmarks page and the trip pages, so a landmark opens the same window everywhere.
 */
export function placeToLandmark(p: any, idx = 0): CityDestinationItem {
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
    rating: Number(p.rating_avg) || 0,
    ratingLabel: (Number(p.rating_avg) || 0) > 0 ? "تقييم معتمد" : "معلم معتمد",
    ratingLabelEn: (Number(p.rating_avg) || 0) > 0 ? "Verified" : "Verified Landmark",
    reviewsCount: Number(p.reviews_count) || 0,
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
  } as CityDestinationItem;
}

interface LandmarkReviewItem {
  id: string;
  authorName: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

export function LandmarkDetailsModal({
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
    setReviewsList([]);
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
    : (city.rating && city.rating > 0 ? city.rating.toFixed(1) : "0.0");

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
            className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-105"
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
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
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
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs flex items-center justify-between gap-3 text-xs relative">
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
                      className="group relative p-4 rounded-2xl bg-white hover:bg-blue-50/40 border-2 border-slate-100 hover:border-blue-200 shadow-xs transition duration-300 flex items-center gap-3.5"
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
              <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
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
                {reviewsList.length > 0 ? (
                  reviewsList.map((rev) => (
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
                  ))
                ) : (
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                    <div className="text-3xl">⭐</div>
                    <div className="text-sm font-bold text-slate-700">
                      {isAr ? "لا توجد تقييمات مسجلة بعد لهذا المعلم" : "No reviews recorded yet for this landmark"}
                    </div>
                    <div className="text-xs text-slate-500">
                      {isAr ? "كن أول من يشارك تجربته بعد زيارة هذا المعلم السياحي!" : "Be the first to share your experience after visiting this attraction!"}
                    </div>
                  </div>
                )}
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
                          className={`text-xl transition cursor-pointer ${
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
              <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3 shadow-xs">
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
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs sm:text-sm shadow-lg transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
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

