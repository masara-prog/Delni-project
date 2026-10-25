import React, { useState } from "react";
import { FavoriteType, useFavorites } from "@/lib/favorites";

interface FavoriteButtonProps {
  itemType: FavoriteType;
  itemId: string;
  itemTitle?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemType,
  itemId,
  itemTitle,
  className = "",
  size = "md",
  showLabel = false,
}) => {
  const { isFavorite, toggle } = useFavorites();
  const [animating, setAnimating] = useState(false);
  const active = isFavorite(itemType, itemId);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    const res = await toggle(itemType, itemId, itemTitle);
    
    // Non-intrusive toast notification
    const existingToast = document.getElementById("delni-fav-toast");
    if (existingToast) existingToast.remove();

    const toast = document.createElement("div");
    toast.id = "delni-fav-toast";
    toast.className =
      "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md shadow-2xl text-xs font-black flex items-center gap-2 border border-white/10 animate-in fade-in slide-in-from-bottom-2 duration-200";
    toast.innerHTML = `<span>${active ? "🤍" : "❤️"}</span><span>${res.message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 2200);
  };

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 sm:w-10 sm:h-10 text-sm",
    lg: "w-11 h-11 text-base",
  };

  const heartSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      title={active ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
      className={`rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer select-none ${
        active
          ? "bg-rose-600 text-white border-2 border-rose-500 hover:bg-rose-700 shadow-md"
          : "bg-white/95 text-rose-600 hover:text-rose-700 hover:bg-white border-2 border-rose-200/90 hover:border-rose-400 shadow-md backdrop-blur-md"
      } ${showLabel ? "px-3.5 h-9 w-auto gap-1.5" : sizeClasses[size]} ${animating ? "scale-125" : "hover:scale-105 active:scale-95"} ${className}`}
    >
      <svg
        className={`${heartSizes[size]} transition-all duration-200 drop-shadow-xs ${
          active
            ? "fill-white stroke-white stroke-[1.8]"
            : "fill-transparent stroke-rose-600 hover:fill-rose-50/80 stroke-[2.4]"
        }`}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
      {showLabel && (
        <span className="text-[11px] font-black mr-1 text-inherit">
          {active ? "بالمفضلة" : "إضافة للمفضلة"}
        </span>
      )}
    </button>
  );
};
