import React, { useState, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { FavoriteButton } from "./FavoriteButton";

interface FloatingNearbyPromoProps {
  tripId: string;
  tripCity: string;
  tripTitle?: string;
  destinationKeywords: string[];
  platformHotels: any[];
  platformRestaurants: any[];
  isAr?: boolean;
}

interface PromoItem {
  id: string;
  type: "hotel" | "restaurant";
  name: string;
  city: string;
  image: string;
  category: string;
  discountText?: string;
  description?: string;
  detailsUrl: string;
}

export const FloatingNearbyPromo: React.FC<FloatingNearbyPromoProps> = ({
  tripId,
  tripCity,
  destinationKeywords,
  platformHotels = [],
  platformRestaurants = [],
  isAr = true,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem(`delni_promo_dismissed_${tripId}`) === "true";
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter real hotels and restaurants close to the trip's destination
  const nearbyPromos: PromoItem[] = useMemo(() => {
    const list: PromoItem[] = [];
    const searchTerms = [tripCity, ...destinationKeywords].filter(Boolean).map(s => s.toLowerCase());

    // 1. Matching Hotels
    platformHotels.forEach((h: any) => {
      const hCity = String(h.city || h.address || h.hotel_name || "").toLowerCase();
      const isMatch = searchTerms.some(term => hCity.includes(term) || term.includes(hCity));
      if (isMatch) {
        list.push({
          id: h.hotel_id || h.id || `h-${Math.random()}`,
          type: "hotel",
          name: h.hotel_name || h.name || "فندق معتمد",
          city: h.city || tripCity,
          image: h.hotel_photo_1 || h.photo || "/assets/ai_hotel.jpg",
          category: h.property_type === "resort" ? "منتجع سياحي" : "فندق إقامة",
          discountText: h.discount_percentage ? `خصم ${h.discount_percentage}%` : "عرض إقامة مميز",
          description: h.description ? h.description.slice(0, 65) + "..." : `إقامة مريحة في قلب ${h.city || tripCity}.`,
          detailsUrl: "/hotels",
        });
      }
    });

    // 2. Matching Restaurants
    platformRestaurants.forEach((r: any) => {
      const rCity = String(r.city || r.address || r.facility_name || "").toLowerCase();
      const isMatch = searchTerms.some(term => rCity.includes(term) || term.includes(rCity));
      if (isMatch) {
        list.push({
          id: r.facility_id || r.id || `r-${Math.random()}`,
          type: "restaurant",
          name: r.facility_name || r.name || "مطعم ومقهى",
          city: r.city || tripCity,
          image: r.facility_image_1 || r.image || "/assets/restaurant-libya.jpg",
          category: r.facility_type || "مطعم تراثي",
          discountText: "أطباق وضيافة ليبية",
          description: r.description ? r.description.slice(0, 65) + "..." : `تذوق أشهى المأكولات في ${r.city || tripCity}.`,
          detailsUrl: "/restaurants",
        });
      }
    });

    return list.slice(0, 6);
  }, [platformHotels, platformRestaurants, tripCity, destinationKeywords]);

  if (dismissed || nearbyPromos.length === 0) {
    return null;
  }

  const current = nearbyPromos[currentIndex % nearbyPromos.length];

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`delni_promo_dismissed_${tripId}`, "true");
    } catch {}
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % nearbyPromos.length);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + nearbyPromos.length) % nearbyPromos.length);
  };

  return (
    <aside
      aria-label={isAr ? "عروض قريبة من مسار الرحلة" : "Nearby Promotions"}
      className="fixed bottom-4 right-4 z-40 max-w-[320px] sm:max-w-[340px] w-full bg-white/95 backdrop-blur-md rounded-2xl border-2 border-amber-300/80 shadow-[0_12px_40px_rgba(0,0,0,0.18)] p-3 text-right animate-in fade-in slide-in-from-bottom-4 duration-300 select-none group"
    >
      {/* Top Header with Badge, Carousel nav and Close (✕) button */}
      <div className="flex items-center justify-between gap-1.5 pb-2 mb-2 border-b border-amber-100">
        <div className="flex items-center gap-1.5">
          <span className="text-amber-500 text-sm animate-pulse">✨</span>
          <span className="text-[11px] font-black text-[#003580]">
            {isAr ? "عرض مقترح قريب بالوجهة" : "Nearby Destination Offer"}
          </span>
          <span className="text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full font-bold">
            {current.type === "hotel" ? "🏨 فندق" : "🍽️ مطعم"}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {nearbyPromos.length > 1 && (
            <div className="flex items-center gap-0.5 text-slate-500 font-bold text-[10px] bg-slate-100 rounded-lg px-1.5 py-0.5">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="السابق"
                className="hover:text-black px-1 cursor-pointer"
              >
                ‹
              </button>
              <span>{currentIndex + 1}/{nearbyPromos.length}</span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="التالي"
                className="hover:text-black px-1 cursor-pointer"
              >
                ›
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="إغلاق العرض الترويجي"
            title={isAr ? "إغلاق هذا العرض طوال الجلسة" : "Dismiss promo"}
            className="w-5 h-5 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 flex items-center justify-center text-xs font-black transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Promo Body */}
      <div className="flex items-start gap-2.5 relative">
        <div className="relative shrink-0">
          <img
            src={current.image}
            alt={current.name}
            className="w-14 h-14 rounded-xl object-cover border border-amber-200"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = current.type === "hotel" ? "/assets/ai_hotel.jpg" : "/assets/restaurant-libya.jpg";
            }}
          />
          <div className="absolute -top-1 -right-1">
            <FavoriteButton
              itemType={current.type}
              itemId={current.id}
              itemTitle={current.name}
              size="sm"
            />
          </div>
        </div>

        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="font-black text-xs text-[#0F172A] truncate">{current.name}</h4>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold">
            🏷️ {current.discountText}
          </div>
          <p className="text-[10px] text-slate-600 font-medium line-clamp-1 mt-0.5">
            {current.description}
          </p>
          <div className="text-[9px] text-slate-400 font-bold mt-1">
            📍 {current.city} · بالقرب من مسار الرحلة
          </div>
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
        <span className="text-[9px] text-slate-400 font-medium">
          {isAr ? "عرض حصري لسياح المنصة" : "Delni Exclusive"}
        </span>
        <Link
          to={current.detailsUrl as any}
          className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#003580] to-[#1B5A78] hover:from-[#002860] hover:to-[#13445C] text-white text-[11px] font-black rounded-lg transition shadow-xs"
        >
          <span>{isAr ? "استكشاف العرض" : "Explore"}</span>
          <span>➔</span>
        </Link>
      </div>
    </aside>
  );
};
