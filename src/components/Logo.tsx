import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  textColor?: "dark" | "light" | "auto";
}

export function Logo({
  className = "",
  size = "md",
  showText = true,
  textColor = "auto",
}: LogoProps) {
  const sizeMap = {
    sm: "h-10",
    md: "h-14",
    lg: "h-20",
    xl: "h-28",
  };

  const iconSizes = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  const textClasses =
    textColor === "light"
      ? "text-white"
      : textColor === "dark"
      ? "text-slate-900"
      : "text-foreground";

  const subtextClasses =
    textColor === "light"
      ? "text-amber-200 opacity-90"
      : "text-amber-600 dark:text-amber-400";

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Icon Emblem - Pure Borderless Image */}
      <div className={`relative ${iconSizes[size]} shrink-0 flex items-center justify-center group transition-all duration-300 hover:scale-105`}>
        <img
          src="/logo.png"
          alt="دَلِّني"
          className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.75)] transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500"></span>
        </span>
      </div>

      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col text-right justify-center gap-1">
          <span
            className={`font-black tracking-tight leading-none ${
              textColor === "light"
                ? "text-white"
                : textColor === "dark"
                ? "text-[#0F172A]"
                : "text-[#0F172A] dark:text-white"
            } drop-shadow-sm ${
              size === "sm"
                ? "text-xl"
                : size === "md"
                ? "text-2xl"
                : size === "lg"
                ? "text-3xl"
                : "text-4xl"
            }`}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            دَلِّــنِي
          </span>
          <span
            className={`font-bold tracking-wide mt-2 pt-0.5 block ${
              textColor === "light" ? "text-amber-200 opacity-95" : "text-[#D96B27]"
            } ${
              size === "sm"
                ? "text-[9px]"
                : size === "md"
                ? "text-[11px]"
                : size === "lg"
                ? "text-xs"
                : "text-sm"
            }`}
          >
            دليلُك لاكتشاف ليبيا
          </span>
        </div>
      )}
    </div>
  );
}
