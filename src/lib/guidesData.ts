export type TourGuide = {
  id: string;
  licenseNumber: string;
  name: string;
  gender: "male" | "female";
  avatar: string;
  title: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  pricePerDay: number;
  primaryRegion: string;
  operatingRegions: string[];
  languages: { code: string; nameAr: string; nameEn: string }[];
  bio: string;
  phone: string;
  verified: boolean;
  totalToursCompleted: number;
  specialties: string[];
  workingDays: string[];
  onLeave?: boolean; // tour_guides.availability_status = إجازة
};

export const TOUR_GUIDES_DATA: TourGuide[] = [];

export function formatWorkingDays(workingDays: string[]): string {
  if (!workingDays || workingDays.length === 0) return "حسب الطلب";
  if (workingDays.includes("طوال أيام الأسبوع") || workingDays.length >= 7) {
    return "طوال الأسبوع (7 أيام)";
  }
  if (workingDays.length === 6 && workingDays.includes("سبت") && workingDays.includes("خميس")) {
    return "السبت إلى الخميس";
  }
  if (workingDays.includes("خميس") && workingDays.includes("جمعة") && workingDays.includes("سبت") && workingDays.length === 3) {
    return "الخميس، الجمعة، السبت";
  }
  if (workingDays.includes("جمعة") && workingDays.includes("سبت") && workingDays.includes("أحد") && workingDays.length === 3) {
    return "الجمعة، السبت، الأحد";
  }
  return workingDays.filter(d => d !== "طوال أيام الأسبوع").join("، ");
}

export const REGIONS_MAP: Record<string, string> = {
  all: "كل المناطق",
  tripoli: "طرابلس وضواحيها",
  leptis: "لبدة الكبرى والخمس",
  sabratha: "صبراتة والساحل الغربي",
  cyrene: "شحات وقورينا (الجبل الأخضر)",
  benghazi: "بنغازي والمنطقة الشرقية",
  ghadames: "غدامس والواحات",
  ubari: "أوباري وفزان والبحيرات",
  acacus: "جبال أكاكوس وغات",
  sousa: "سوسة وأبولونيا الأثرية",
  tobruk: "طبرق والمعالم التاريخية",
};

export function formatOperatingRegions(regions?: string[] | string): string {
  if (!regions) return "طرابلس وضواحيها";
  let list: string[] = [];
  if (Array.isArray(regions)) {
    list = regions;
  } else if (typeof regions === "string") {
    try {
      const parsed = JSON.parse(regions);
      if (Array.isArray(parsed)) list = parsed;
      else list = regions.split(",").map(s => s.trim());
    } catch {
      list = regions.split(",").map(s => s.trim());
    }
  }
  const translated = list
    .filter(Boolean)
    .map(r => REGIONS_MAP[r] || r);
  return translated.length > 0 ? translated.join(" • ") : "طرابلس وضواحيها";
}

