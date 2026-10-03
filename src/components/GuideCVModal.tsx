import React from "react";
import { X, Award, Star, ShieldCheck, Languages, CheckCircle2, MapPin, Calendar, User } from "lucide-react";
import { Link } from "@tanstack/react-router";

export type GuideCVData = {
  id?: string;
  name: string;
  title?: string;
  licenseNumber?: string;
  avatar?: string;
  experienceYears?: number | string;
  rating?: number;
  reviewsCount?: number;
  pricePerDay?: number | string;
  phone?: string;
  bio?: string;
  specialties?: string[];
  languages?: { code: string; nameAr: string }[] | string[];
  operatingRegions?: string[];
  workingDays?: string[];
  primaryRegion?: string;
};

const REGIONS_LABELS: Record<string, string> = {
  tripoli: "طرابلس وضواحيها",
  leptis: "لبدة الكبرى والخمس",
  sabratha: "صبراتة والساحل الغربي",
  cyrene: "شحات وقورينا (الجبل الأخضر)",
  benghazi: "بنغازي والمنطقة الشرقية",
  ghadames: "غدامس والواحات",
  ubari: "أوباري وفزان",
  acacus: "جبال أكاكوس وغات",
};

interface GuideCVModalProps {
  open: boolean;
  onClose: () => void;
  guide: GuideCVData | null;
  onSelectForPrivateTrip?: (guideName: string) => void;
}

export function GuideCVModal({ open, onClose, guide, onSelectForPrivateTrip }: GuideCVModalProps) {
  if (!open || !guide) return null;

  const defaultAvatar = "/assets/ai_city.jpg";

  const daysText = guide.workingDays
    ? guide.workingDays.includes("طوال أيام الأسبوع")
      ? "7 أيام/أسبوع"
      : `${guide.workingDays.length} أيام/أسبوع`
    : "طوال الأسبوع";

  const regionDisplay = guide.primaryRegion && REGIONS_LABELS[guide.primaryRegion]
    ? REGIONS_LABELS[guide.primaryRegion]
    : guide.operatingRegions?.[0]
    ? REGIONS_LABELS[guide.operatingRegions[0]] || guide.operatingRegions[0]
    : "جميع مناطق ليبيا";

  return (
    <div className="fixed inset-0 z-50 bg-[#0F172A]/75 backdrop-blur-md grid place-items-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="relative w-full max-w-xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#E8E2D6] my-auto max-h-[92vh] flex flex-col">
        {/* Cover Header Banner */}
        <div className="relative h-32 sm:h-36 bg-gradient-to-r from-[#0F172A] via-[#1B5A78] to-[#0F172A] p-6 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-white text-xs font-black shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>كرت السيرة الذاتية - مرشد معتمد</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white grid place-items-center text-sm font-black transition cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating Profile Info Header */}
        <div className="px-6 sm:px-8 -mt-14 sm:-mt-16 shrink-0">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div className="relative">
              <img
                src={guide.avatar || defaultAvatar}
                alt={guide.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-4 border-white shadow-xl bg-white"
              />
              <span className="absolute bottom-1 left-1 w-6 h-6 rounded-full bg-[#1B5A78] text-white grid place-items-center text-xs font-black border-2 border-white shadow-xs" title="معتمد">
                ✓
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#E8E2D6] text-[#0F172A] font-black text-xs">
                📜 ترخيص رقم: {guide.licenseNumber || "G-8821"}
              </span>
            </div>
          </div>

          {/* Guide Name & Title */}
          <div className="mt-4">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0F172A] tracking-tight">{guide.name}</h2>
            <p className="text-xs sm:text-sm text-[#D96B27] font-bold mt-0.5">
              {guide.title || "مرشد سياحي معتمد ومؤرخ متخصص"}
            </p>
            
            {/* Work Location Badge */}
            <div className="flex items-center gap-1.5 text-xs font-black text-[#EA580C] mt-2">
              <MapPin className="w-4 h-4 text-[#EA580C] shrink-0" />
              <span>مكان العمل والمنطقة: {regionDisplay}</span>
            </div>
          </div>

          {/* Minimalist Stats Grid */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 mt-4">
            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center">
              <div className="text-[10px] text-[#718096] font-bold flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3 text-orange-500" />
                <span>أيام العمل</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-[#0F172A] mt-1">
                {daysText}
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center">
              <div className="text-[10px] text-[#718096] font-bold flex items-center justify-center gap-1">
                <User className="w-3 h-3 text-orange-500" />
                <span>الخبرة</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-[#0F172A] mt-1">
                {guide.experienceYears || 10} سنوات
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center">
              <div className="text-[10px] text-[#718096] font-bold flex items-center justify-center gap-1">
                <Star className="w-3 h-3 text-amber-500 fill-current" />
                <span>التقييم</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-amber-600 mt-1">
                ★ {guide.rating || 4.9}
              </div>
            </div>

            <div className="p-2.5 sm:p-3 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-center">
              <div className="text-[10px] text-[#718096] font-bold flex items-center justify-center gap-1">
                <span>🛡️</span>
                <span>الاعتماد</span>
              </div>
              <div className="text-xs sm:text-sm font-black text-emerald-700 mt-1">
                مرخص رسمي
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 sm:p-8 space-y-4 overflow-y-auto">
          {/* Bio Section */}
          {guide.bio && (
            <div className="p-4 rounded-2xl bg-[#FAF7F2] border-r-4 border-r-[#1B5A78] border border-[#E8E2D6]">
              <div className="text-xs font-black text-[#1B5A78] mb-1.5">نبذة عن خبرات المرشد والسيرة الذاتية:</div>
              <p className="text-xs sm:text-sm text-[#0F172A] leading-relaxed font-semibold">
                {guide.bio}
              </p>
            </div>
          )}

          {/* Specialties */}
          {guide.specialties && guide.specialties.length > 0 && (
            <div>
              <div className="text-xs font-bold text-[#718096] mb-2">التخصصات والمهارات المميزة:</div>
              <div className="flex flex-wrap gap-2">
                {guide.specialties.map((s, idx) => (
                  <span key={idx} className="px-4 py-1.5 rounded-full bg-amber-50/90 border border-amber-200/90 text-amber-950 font-bold text-xs shadow-2xs">
                    ✨ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Spoken Languages */}
          <div>
            <div className="text-xs font-bold text-[#718096] mb-2">اللغات المتقنة:</div>
            <div className="flex flex-wrap gap-2">
              {guide.languages && Array.isArray(guide.languages) ? (
                guide.languages.map((l: any, idx: number) => {
                  const label = typeof l === "string" ? l : `${l.nameAr} (${l.code})`;
                  return (
                    <span key={idx} className="px-4 py-1.5 rounded-full bg-stone-100/90 border border-stone-200/90 font-bold text-xs text-[#0F172A]">
                      {label}
                    </span>
                  );
                })
              ) : (
                <>
                  <span className="px-4 py-1.5 rounded-full bg-stone-100/90 border border-stone-200/90 font-bold text-xs text-[#0F172A]">العربية (اللغة الأم)</span>
                  <span className="px-4 py-1.5 rounded-full bg-stone-100/90 border border-stone-200/90 font-bold text-xs text-[#0F172A]">الإنجليزية (English)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-5 bg-[#FAF7F2] border-t border-[#E8E2D6] flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-7 py-2.5 rounded-full border border-[#CBD5E1] bg-white text-xs font-black text-[#0F172A] hover:bg-stone-50 transition cursor-pointer shadow-xs"
          >
            إغلاق
          </button>

          {onSelectForPrivateTrip ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectForPrivateTrip(guide.name);
              }}
              className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#EA580C] to-[#D96B27] text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition cursor-pointer"
            >
              اختيار المرشد لرحلة خاصة 🧭
            </button>
          ) : (
            <Link
              to="/trips"
              onClick={onClose}
              className="px-7 py-2.5 rounded-full bg-gradient-to-r from-[#EA580C] to-[#D96B27] text-white font-black text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>اختيار المرشد لرحلة خاصة</span>
              <span>🧭</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

