import React, { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FavoriteButton } from "./FavoriteButton";

interface FloatingNearbyPromoProps {
  tripId: string;
  tripCity: string;
  tripTitle?: string;
  // Cities of the landmarks the trip visits; offers are shown only for hotels / restaurants in these cities
  landmarkCities: string[];
  platformHotels: any[];
  platformRestaurants: any[];
  isAr?: boolean;
}

// Same city whatever the spelling: صبراتة / صبراته, أ / ا, ى / ي
function normalizeCity(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/\s+/g, " ");
}

interface PromoItem {
  id: string;
  type: "hotel" | "restaurant";
  name: string;
  city: string;
  image: string;
  category: string;
  discount: number;
  stars: number;
}

const FALLBACK = { hotel: "/assets/ai_hotel.jpg", restaurant: "/assets/restaurant-libya.jpg" };
const COLLAPSED_COUNT = 2;

/**
 * Partner hotels and restaurants in the cities the trip visits, as a stack of cards in the corner of the trip page.
 * Each card opens that exact hotel / restaurant (/hotels?open=<id>); the stack can be folded, expanded or closed.
 */
export const FloatingNearbyPromo: React.FC<FloatingNearbyPromoProps> = ({
  tripId,
  tripCity,
  landmarkCities,
  platformHotels = [],
  platformRestaurants = [],
  isAr = true,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(`delni_promo_dismissed_${tripId}`) === "true";
    } catch {
      return false;
    }
  });
  const [folded, setFolded] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState<string[]>([]);

  const promos: PromoItem[] = useMemo(() => {
    const cities = landmarkCities.map(normalizeCity).filter(Boolean);
    const inTripCities = (city: unknown) => {
      const c = normalizeCity(city);
      return !!c && cities.some((t) => c === t || c.includes(t) || t.includes(c));
    };
    const hotels: PromoItem[] = platformHotels
      .filter((h: any) => h.partnership_status !== "موقوف" && (h.hotel_id || h.id) && inTripCities(h.city))
      .map((h: any) => ({
        id: String(h.hotel_id || h.id),
        type: "hotel" as const,
        name: h.hotel_name || h.name || (isAr ? "فندق شريك" : "Partner hotel"),
        city: h.city || tripCity,
        image: h.hotel_photo_1 || h.photo || FALLBACK.hotel,
        category: h.property_type === "resort" ? (isAr ? "منتجع" : "Resort") : isAr ? "فندق" : "Hotel",
        discount: Number(h.discount_percentage) || 0,
        stars: Number(h.star_rating) || 0,
      }));
    const restaurants: PromoItem[] = platformRestaurants
      .filter((r: any) => r.partnership_status !== "موقوف" && (r.facility_id || r.id) && inTripCities(r.city))
      .map((r: any) => ({
        id: String(r.facility_id || r.id),
        type: "restaurant" as const,
        name: r.facility_name || r.name || (isAr ? "مطعم شريك" : "Partner restaurant"),
        city: r.city || tripCity,
        image: r.facility_image_1 || r.image || FALLBACK.restaurant,
        category: r.facility_type || (isAr ? "مطعم" : "Restaurant"),
        discount: Number(r.discount_percentage) || 0,
        stars: 0,
      }));
    // Alternate hotel / restaurant so both kinds show in the first cards
    const mixed: PromoItem[] = [];
    for (let i = 0; i < Math.max(hotels.length, restaurants.length); i++) {
      if (hotels[i]) mixed.push(hotels[i]);
      if (restaurants[i]) mixed.push(restaurants[i]);
    }
    return mixed.slice(0, 8);
  }, [platformHotels, platformRestaurants, tripCity, landmarkCities, isAr]);

  const visible = promos.filter((p) => !hidden.includes(`${p.type}:${p.id}`));
  if (dismissed || visible.length === 0) return null;
  const shown = expanded ? visible : visible.slice(0, COLLAPSED_COUNT);
  const more = visible.length - shown.length;

  const closeAll = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`delni_promo_dismissed_${tripId}`, "true");
    } catch {
      /* closed for this page only */
    }
  };

  // Folded: one round button with the number of offers
  if (folded) {
    return (
      <button
        type="button"
        onClick={() => setFolded(false)}
        className="fixed bottom-4 right-4 z-40 flex items-center gap-2 pl-4 pr-2 h-12 rounded-full bg-[#00736F] text-white shadow-[0_10px_30px_rgba(0,115,111,0.4)] hover:scale-105 active:scale-95 transition cursor-pointer animate-in fade-in zoom-in-90 duration-300"
        aria-label={isAr ? "عرض العروض القريبة" : "Show nearby offers"}
      >
        <span className="relative w-8 h-8 rounded-full bg-white/15 grid place-items-center text-base">
          🎁
          <span className="absolute -top-1 -left-1 min-w-4 h-4 px-1 rounded-full bg-amber-400 text-[#0B1727] text-[10px] font-black grid place-items-center">
            {visible.length}
          </span>
        </span>
        <span className="text-xs font-black">{isAr ? "عروض قرب وجهتك" : "Offers nearby"}</span>
      </button>
    );
  }

  return (
    <aside
      aria-label={isAr ? "فنادق ومطاعم قريبة من مسار الرحلة" : "Hotels and restaurants near the trip"}
      className="fixed bottom-4 right-4 z-40 w-[calc(100vw-2rem)] max-w-[330px] text-right select-none"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 px-3 py-2 rounded-2xl bg-[#0B1727]/95 backdrop-blur text-white shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base animate-pulse">✨</span>
          <div className="min-w-0">
            <div className="text-[12px] font-black truncate">{isAr ? "إقامة وطعام قرب وجهتك" : "Stay & dine near your trip"}</div>
            <div className="text-[10.5px] text-white/60 font-bold">
              {isAr ? `${visible.length} عروض من شركاء دلّني` : `${visible.length} Delni partner offers`}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => setFolded(true)}
            title={isAr ? "تصغير" : "Minimise"}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/25 grid place-items-center text-sm font-black transition cursor-pointer"
          >
            –
          </button>
          <button
            type="button"
            onClick={closeAll}
            title={isAr ? "إغلاق العروض لهذه الجلسة" : "Close offers"}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500 grid place-items-center text-xs font-black transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Cards stacked one above the other */}
      <div className={`flex flex-col gap-2 ${expanded ? "max-h-[60vh] overflow-y-auto pr-0.5" : ""}`}>
        {shown.map((p, i) => (
          <div
            key={`${p.type}:${p.id}`}
            style={{ animationDelay: `${i * 90}ms`, animationFillMode: "both" }}
            className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
          >
            <Link
              to={p.type === "hotel" ? "/hotels" : "/restaurants"}
              search={{ open: p.id } as any}
              className="flex items-center gap-3 p-2 pl-3 rounded-2xl bg-white/95 backdrop-blur border border-amber-200/80 shadow-[0_8px_24px_rgba(15,23,42,0.14)] hover:shadow-[0_14px_34px_rgba(15,23,42,0.22)] hover:-translate-y-0.5 hover:border-[#00736F]/50 transition-all duration-300"
            >
              <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK[p.type];
                  }}
                />
                {p.discount > 0 && (
                  <span className="absolute bottom-0 inset-x-0 text-center bg-emerald-600/95 text-white text-[10px] font-black py-0.5">
                    -{p.discount}%
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${p.type === "hotel" ? "bg-sky-100 text-sky-800" : "bg-orange-100 text-orange-800"}`}
                  >
                    {p.type === "hotel" ? "🏨" : "🍽️"} {p.category}
                  </span>
                  {p.stars > 0 && <span className="text-[10px] text-amber-500 font-black">{"★".repeat(Math.min(5, p.stars))}</span>}
                </div>
                <h4 className="font-black text-[13px] text-[#0F172A] truncate">{p.name}</h4>
                <div className="text-[11px] text-slate-500 font-bold truncate">📍 {p.city}</div>
                <div className="text-[11px] font-black text-[#00736F] mt-0.5 flex items-center gap-1 group-hover:gap-2 transition-all">
                  {p.discount > 0 ? (isAr ? `خصم ${p.discount}% لعملاء دلّني` : `${p.discount}% off with Delni`) : isAr ? "شاهد التفاصيل" : "View details"}
                  <span>{isAr ? "←" : "→"}</span>
                </div>
              </div>
            </Link>
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition">
              <FavoriteButton itemType={p.type} itemId={p.id} itemTitle={p.name} size="sm" />
              <button
                type="button"
                onClick={() => setHidden((h) => [...h, `${p.type}:${p.id}`])}
                title={isAr ? "إخفاء هذا العرض" : "Hide this offer"}
                className="w-6 h-6 rounded-full bg-white shadow border border-slate-200 text-slate-500 hover:bg-red-500 hover:text-white text-[10px] font-black grid place-items-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>

      {(more > 0 || expanded) && visible.length > COLLAPSED_COUNT && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 w-full h-9 rounded-xl bg-white/95 border border-slate-200 text-[#00736F] text-[11.5px] font-black shadow hover:bg-[#00736F] hover:text-white transition cursor-pointer"
        >
          {expanded ? (isAr ? "عرض أقل ▲" : "Show less ▲") : isAr ? `+${more} عروض أخرى ▼` : `+${more} more ▼`}
        </button>
      )}
    </aside>
  );
};
