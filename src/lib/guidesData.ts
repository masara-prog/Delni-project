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
};

export const TOUR_GUIDES_DATA: TourGuide[] = [
  {
    id: "g1",
    licenseNumber: "G-8821",
    name: "أ. محمد الفيتوري",
    gender: "male",
    avatar: "/assets/guide-mohammed.jpg",
    title: "خبير الآثار الرومانية والتراث الساحلي",
    experienceYears: 12,
    rating: 4.9,
    reviewsCount: 142,
    pricePerDay: 180,
    primaryRegion: "leptis",
    operatingRegions: ["leptis", "tripoli", "sabratha"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
      { code: "IT", nameAr: "الإيطالية", nameEn: "Italian" },
    ],
    bio: "مرشد سياحي معتمد ومؤرخ متخصص في الآثار الرومانية والفينيقية في لبدة الكبرى وصبراتة. خبرة أكثر من 12 عاماً في مرافقة الوفود الدبلوماسية والمجموعات السياحية.",
    phone: "+218 91 333 4455",
    verified: true,
    totalToursCompleted: 380,
    specialties: ["الآثار الرومانية", "التاريخ الفينيقي", "الجولات التاريخية", "لبدة الكبرى", "صبراتة"],
    workingDays: ["سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس"],
  },
  {
    id: "g2",
    licenseNumber: "G-9410",
    name: "أ. سعاد الورفلي",
    gender: "female",
    avatar: "/assets/guide-souad.jpg",
    title: "دليلة التراث الطرابلسي والمدينة القديمة",
    experienceYears: 9,
    rating: 4.95,
    reviewsCount: 198,
    pricePerDay: 150,
    primaryRegion: "tripoli",
    operatingRegions: ["tripoli", "leptis"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
      { code: "FR", nameAr: "الفرنسية", nameEn: "French" },
    ],
    bio: "ابنة طرابلس القديمة ومتخصصة في السراي الحمراء والأسواق التاريخية والعمارة الإسلامية. أقدم جولات مشي ساحرة في أزقة المدينة القديمة مع ضيافة الشاي والمأكولات الشعبية.",
    phone: "+218 92 555 7788",
    verified: true,
    totalToursCompleted: 420,
    specialties: ["تراث طرابلس القديمة", "السراي الحمراء", "المأكولات الشعبية", "طرابلس"],
    workingDays: ["طوال أيام الأسبوع", "سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"],
  },
  {
    id: "g3",
    licenseNumber: "G-7734",
    name: "أ. طارق التواتي",
    gender: "male",
    avatar: "/assets/guide-tariq.jpg",
    title: "خبير الصحراء الكبرى والجغرافيا الطوارقية",
    experienceYears: 15,
    rating: 5.0,
    reviewsCount: 230,
    pricePerDay: 250,
    primaryRegion: "ubari",
    operatingRegions: ["ubari", "acacus", "ghadames"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
      { code: "FR", nameAr: "الفرنسية", nameEn: "French" },
    ],
    bio: "دليل صحراوي محترف من أهالي الجنوب. خبير في مسارات الكثبان الرملية بأوباري، التخييم في جبال أكاكوس، وسهرات الفلكلور الطوارقي وشواء الصحراء.",
    phone: "+218 91 888 2211",
    verified: true,
    totalToursCompleted: 510,
    specialties: ["سفاري الصحراء 4x4", "تخييم أكاكوس", "نقوش ما قبل التاريخ", "أوباري", "أكاكوس", "غدامس"],
    workingDays: ["طوال أيام الأسبوع", "سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"],
  },
  {
    id: "g4",
    licenseNumber: "G-6512",
    name: "أ. فاطمة الزهراء الشريف",
    gender: "female",
    avatar: "/assets/guide-souad.jpg",
    title: "مرشدة الطبيعة والآثار الإغريقية بالجبل الأخضر",
    experienceYears: 7,
    rating: 4.85,
    reviewsCount: 115,
    pricePerDay: 170,
    primaryRegion: "cyrene",
    operatingRegions: ["cyrene", "benghazi"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
      { code: "IT", nameAr: "الإيطالية", nameEn: "Italian" },
    ],
    bio: "خريجة كلية الآثار ومتخصصة في التاريخ الإغريقي بقورينا (شحات) ومعبد أبولو وشلالات الجبل الأخضر. أسلوب مميز في السرد التاريخي وإرشاد العائلات.",
    phone: "+218 61 909 3322",
    verified: true,
    totalToursCompleted: 240,
    specialties: ["آثار قورينا وشحات", "طبيعة الجبل الأخضر", "جولات عائلية", "شحات", "سوسة", "الجبل الأخضر"],
    workingDays: ["خميس", "جمعة", "سبت", "أحد"],
  },
  {
    id: "g5",
    licenseNumber: "G-5519",
    name: "أ. المبروك الغدامسي",
    gender: "male",
    avatar: "/assets/guide-tariq.jpg",
    title: "دليل العمارة الطينية وتراث مدينة غدامس",
    experienceYears: 14,
    rating: 4.92,
    reviewsCount: 176,
    pricePerDay: 200,
    primaryRegion: "ghadames",
    operatingRegions: ["ghadames", "ubari"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
    ],
    bio: "دليل محلي معتمد لمدينة غدامس القديمة (لؤلؤة الصحراء المسجلة باليونسكو). خبير بالعمارة الطينية الفريدة وعين الفرس وعادات الزفاف التراثية الغدامسية.",
    phone: "+218 484 622 111",
    verified: true,
    totalToursCompleted: 390,
    specialties: ["عمارة غدامس الطينية", "متحف التراث", "عين الفرس", "غدامس"],
    workingDays: ["طوال أيام الأسبوع", "سبت", "أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة"],
  },
  {
    id: "g6",
    licenseNumber: "G-4402",
    name: "أ. مريم العبيدي",
    gender: "female",
    avatar: "/assets/guide-souad.jpg",
    title: "مرشدة المعالم التاريخية والتصوير الفوتوغرافي",
    experienceYears: 5,
    rating: 4.88,
    reviewsCount: 89,
    pricePerDay: 140,
    primaryRegion: "benghazi",
    operatingRegions: ["benghazi", "cyrene"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
    ],
    bio: "مرشدة سياحية ومصورة محترفة متخصصة في توثيق الجولات الاستكشافية في بنغازي، المنار، وشواطئ سوسة الأثرية. توفر جلسات تصوير تذكارية للجولات.",
    phone: "+218 61 777 9900",
    verified: true,
    totalToursCompleted: 165,
    specialties: ["التصوير الفوتوغرافي", "معالم بنغازي", "سوسة الأثرية", "بنغازي"],
    workingDays: ["جمعة", "سبت", "أحد", "ثلاثاء"],
  },
  {
    id: "g7",
    licenseNumber: "G-3310",
    name: "أ. عادل الترهوني",
    gender: "male",
    avatar: "/assets/guide-mohammed.jpg",
    title: "مرشد الآثار الفينيقية والرومانية في صبراتة",
    experienceYears: 10,
    rating: 4.89,
    reviewsCount: 134,
    pricePerDay: 160,
    primaryRegion: "sabratha",
    operatingRegions: ["sabratha", "tripoli"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
    ],
    bio: "مرشد محترف متخصص في مسرح صبراتة الأثري ومعابد الفينيقيين والمتحف البحري. تنظيم جولات شاملة للوفود والعائلات.",
    phone: "+218 91 444 8822",
    verified: true,
    totalToursCompleted: 290,
    specialties: ["مسرح صبراتة", "المتاحف البحرية", "التاريخ الفينيقي", "صبراتة"],
    workingDays: ["سبت", "اثنين", "أربعاء", "خميس"],
  },
  {
    id: "g8",
    licenseNumber: "G-2280",
    name: "أ. آمال المنصوري",
    gender: "female",
    avatar: "/assets/guide-souad.jpg",
    title: "خبيرة الجولات الثقافية والحرف التراثية",
    experienceYears: 8,
    rating: 4.91,
    reviewsCount: 156,
    pricePerDay: 155,
    primaryRegion: "tripoli",
    operatingRegions: ["tripoli", "leptis"],
    languages: [
      { code: "AR", nameAr: "العربية", nameEn: "Arabic" },
      { code: "EN", nameAr: "الإنجليزية", nameEn: "English" },
      { code: "FR", nameAr: "الفرنسية", nameEn: "French" },
    ],
    bio: "مرشدة ثقافة وتراث ترافق الزوار في ورش الحرف التقليدية وأسواق الفضة والنحاس والمدينة القديمة. تجربة غنية بضيافة الأصالة الليبية.",
    phone: "+218 92 666 3311",
    verified: true,
    totalToursCompleted: 310,
    specialties: ["الحرف التراثية", "أسواق الفضة", "الجولات الثقافية", "طرابلس"],
    workingDays: ["أحد", "ثلاثاء", "خميس", "جمعة"],
  },
];

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
  ubari: "أوباري وفزان",
  acacus: "جبال أكاكوس وغات",
};
