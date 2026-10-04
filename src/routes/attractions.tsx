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
  BookingModal,
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
} from "lucide-react";

export const Route = createFileRoute("/attractions")({
  head: () => ({
    meta: [
      { title: "معالم ليبيا الخالدة | منصة دلّني للخدمات السياحية" },
      {
        name: "description",
        content:
          "استكشف أبرز المعالم السياحية والأثرية ومواقع التراث العالمي لليونسكو في ليبيا: لبدة الكبرى، صبراتة، قورينا شحات، غدامس، بحيرات أوباري وأكاكوس مع مواعيد ونقاط الانطلاق اليومية.",
      },
      { property: "og:title", content: "معالم ليبيا الخالدة — منصة دلّني" },
      {
        property: "og:description",
        content: "دليلك الشامل لآثار ومعالم ليبيا التاريخية والطبيعية مع برامج الانطلاق اليومية والرحلات الخاصة.",
      },
    ],
  }),
  component: AttractionsPage,
});

export type AttractionItem = {
  id: string;
  name: string;
  nameEn: string;
  city: string;
  cityEn: string;
  region: string;
  regionEn: string;
  category: "آثار تاريخية" | "واحات صحراوية" | "طبيعة وجبال" | "مدن قديمة وقلاع";
  categoryEn: "Historical & Ancient Ruins" | "Desert Oases & Dunes" | "Mountains & Nature" | "Old Cities & Fortresses";
  isUnesco: boolean;
  unescoYear?: string;
  img: string;
  gallery: string[];
  description: string;
  descriptionEn: string;
  historySnippet: string;
  historySnippetEn: string;
  rating: number;
  reviewsCount: number;
  hasDailyTrip: boolean;
  departureCity?: "طرابلس" | "بنغازي";
  departureCityEn?: "Tripoli" | "Benghazi";
  departureTime: string;
  departureTimeEn: string;
  entryFee: string;
  entryFeeEn: string;
  bestSeason: string;
  bestSeasonEn: string;
  highlights: string[];
  highlightsEn: string[];
  mapsQuery: string;
  approxTripPrice?: number;
};

const LIBYAN_ATTRACTIONS: AttractionItem[] = [
  {
    id: "att-leptis",
    name: "مدينة لبدة الكبرى (Leptis Magna)",
    nameEn: "Leptis Magna Ancient City",
    city: "الخمس",
    cityEn: "Al-Khoms",
    region: "المنطقة الغربية (ساحل البحر المتوسط)",
    regionEn: "Western Region (Mediterranean Coast)",
    category: "آثار تاريخية",
    categoryEn: "Historical & Ancient Ruins",
    isUnesco: true,
    unescoYear: "1982",
    img: heroImg,
    gallery: [
      heroImg,
      destSabratah,
      destCyrene,
    ],
    description:
      "أعظم مدينة رومانية محفوظة في حوض البحر المتوسط ومسقط رأس الإمبراطور سيبتيموس سيفيروس. تضم قوس النصر السيفيري البديع، المسرح الروماني المطل على الساحل، حمامات هادريان ذات الأرضيات الرخامية، والسوق البونيقي القديم.",
    descriptionEn:
      "The greatest preserved Roman city in the Mediterranean basin and birthplace of Emperor Septimius Severus. Featuring the grand Severan Arch, colossal Roman theatre overlooking the sea, Hadrianic Baths, and the ancient forum.",
    historySnippet: "بلغت ذروة مجدها وتوسّعها المذهل في عهد السلالة السيفيرية عام 193 ميلادية.",
    historySnippetEn: "Reached its apex of monumental grandeur during the Severan dynasty in 193 AD.",
    rating: 5.0,
    reviewsCount: 480,
    hasDailyTrip: true,
    departureCity: "طرابلس",
    departureCityEn: "Tripoli",
    departureTime: "09:00 صباحاً",
    departureTimeEn: "09:00 AM",
    entryFee: "20 د.ل",
    entryFeeEn: "20 LYD",
    bestSeason: "طوال العام (أكتوبر — مايو الأفضل)",
    bestSeasonEn: "Year-round (Best: Oct — May)",
    highlights: ["قوس سيبتيموس سيفيروس", "المسرح الروماني الساحلي", "حمامات هادريان الفاخرة", "السوق البونيقي التاريخي"],
    highlightsEn: ["Severan Triumphal Arch", "Coastal Roman Theatre", "Hadrianic Thermal Baths", "Ancient Forum & Market"],
    mapsQuery: "Leptis+Magna+Al-Khoms+Libya",
    approxTripPrice: 180,
  },
  {
    id: "att-sabratha",
    name: "مسرح وآثار صبراتة الرومانية",
    nameEn: "Sabratha Roman Theatre & Ruins",
    city: "صبراتة",
    cityEn: "Sabratha",
    region: "المنطقة الغربية (ساحل البحر المتوسط)",
    regionEn: "Western Region (Mediterranean Coast)",
    category: "آثار تاريخية",
    categoryEn: "Historical & Ancient Ruins",
    isUnesco: true,
    unescoYear: "1982",
    img: destSabratah,
    gallery: [
      destSabratah,
      destHarborCoast,
      heroImg,
    ],
    description:
      "واحدة من أهم المدن الأثرية الفينيقية ثم الرومانية على ساحل البحر المتوسط. يشتهر مسرحها الروماني الأيقوني المكون من ثلاثة طوابق من الأعمدة الرخامية البديعة وأعمدة الكورنثية المطلة مباشرة على أمواج البحر.",
    descriptionEn:
      "One of the Mediterranean's finest archaeological sites. World-famous for its three-story coastal Roman theatre reconstructed with 96 Corinthian marble columns facing the azure Mediterranean horizon.",
    historySnippet: "تأسست في القرن السابع قبل الميلاد كمرفأ فينيقي لتبادل التجارة مع أعماق أفريقيا.",
    historySnippetEn: "Founded in the 7th century BC as a Phoenician trading post connecting Africa to the Mediterranean.",
    rating: 4.9,
    reviewsCount: 360,
    hasDailyTrip: true,
    departureCity: "طرابلس",
    departureCityEn: "Tripoli",
    departureTime: "09:00 صباحاً",
    departureTimeEn: "09:00 AM",
    entryFee: "15 د.ل",
    entryFeeEn: "15 LYD",
    bestSeason: "أكتوبر — مايو",
    bestSeasonEn: "October — May",
    highlights: ["المسرح الروماني المكون من 3 طوابق", "معبد إيزيس ومعبد هرقل", "لوحات الفسيفساء البحرية", "المتحف الأثري بصبراتة"],
    highlightsEn: ["3-Tiered Coastal Amphitheatre", "Temples of Isis & Hercules", "Rare Roman Sea Mosaics", "Sabratha Museum"],
    mapsQuery: "Sabratha+Roman+Theater+Libya",
    approxTripPrice: 160,
  },
  {
    id: "att-cyrene",
    name: "قورينا وآثار شحات الإغريقية",
    nameEn: "Cyrene & Ancient Greek Ruins",
    city: "شحات",
    cityEn: "Shahhat",
    region: "الجبل الأخضر (المنطقة الشرقية)",
    regionEn: "Green Mountain (Eastern Region)",
    category: "آثار تاريخية",
    categoryEn: "Historical & Ancient Ruins",
    isUnesco: true,
    unescoYear: "1982",
    img: destJabalAkhdarPanorama,
    gallery: [
      destJabalAkhdarPanorama,
      destCyrene,
      destJabalAkhdarPass,
      destJabalAkhdarValley,
      destHarborCoast,
    ],
    description:
      "أقدم وأعظم مدينة إغريقية في شمال أفريقيا (أثينا أفريقيا)، تقع على حافة هضبة جبلية شاهقة بارتفاع 600 متر مطلة على مزارع وشواطئ سوسة الخضراء، وتضم معبد أبولو، الأكروبوليس، ونبع أبولو المقدس بين الشلالات.",
    descriptionEn:
      "Known as the 'Athens of Africa', the ancient Greek capital perched 600m high atop the lush Green Mountain. Features the Sanctuary of Apollo, the massive Acropolis, Zeus Temple, and panoramic views over the Mediterranean.",
    historySnippet: "تأسست عام 631 قبل الميلاد بواسطة مستوطنين إغريق قادمين من جزيرة ثيرا الإغريقية.",
    historySnippetEn: "Founded in 631 BC by Greek colonists from the island of Thera (modern Santorini).",
    rating: 4.9,
    reviewsCount: 390,
    hasDailyTrip: true,
    departureCity: "بنغازي",
    departureCityEn: "Benghazi",
    departureTime: "09:00 صباحاً",
    departureTimeEn: "09:00 AM",
    entryFee: "15 د.ل",
    entryFeeEn: "15 LYD",
    bestSeason: "سبتمبر — يونيو",
    bestSeasonEn: "September — June",
    highlights: ["بانوراما معبد أبولو والبحر", "معبد زيوس الأضخم في أفريقيا", "المدرج الإغريقي الجبلي", "طبيعة وشلالات الجبل الأخضر"],
    highlightsEn: ["Apollo Sanctuary & Coastal Panorama", "Colossal Temple of Zeus", "Cliffside Greek Theatre", "Green Mountain Waterfalls"],
    mapsQuery: "Cyrene+Shahhat+Libya",
    approxTripPrice: 200,
  },
  {
    id: "att-jabal-akhdar-nature",
    name: "طبيعة وغابات الجبل الأخضر وجسر وادي الكوف",
    nameEn: "Green Mountain Forests & Wadi Al-Kuf Canyon",
    city: "البيضاء وشحات",
    cityEn: "Al-Bayda & Shahhat",
    region: "الجبل الأخضر (المنطقة الشرقية)",
    regionEn: "Green Mountain (Eastern Region)",
    category: "طبيعة وجبال",
    categoryEn: "Mountains & Nature",
    isUnesco: false,
    img: destJabalAkhdarForest,
    gallery: [
      destJabalAkhdarForest,
      destJabalAkhdarBridge,
      destJabalAkhdarValley,
      destJabalAkhdarPass,
      destJabalAkhdarPanorama,
    ],
    description:
      "تعتبر غابات الجبل الأخضر ووادي الكوف من أروع المحميات الطبيعية البكر في شمال أفريقيا. تتسم بغابات الصنوبر والعرعر الفينيقي والبطم، والتربة الحمراء الخصبة، وتضم جسر وادي الكوف الأيقوني العملاق، مع مسارات التخييم والمطلات البانورامية الشاهقة على السهول الزراعية والبحر المتوسط.",
    descriptionEn:
      "The pristine forests of the Green Mountain and Wadi Al-Kuf are among North Africa's most breathtaking natural reserves, featuring dense pine and juniper woodlands, the monumental Wadi Al-Kuf canyon bridge, and panoramic lookouts over coastal plains.",
    historySnippet: "يعد الجبل الأخضر رئة ليبيا الخضراء بمناخه المعتدل شتاءً وصيفاً وجسره المعلق التاريخي الذي صممه المعماري العالمي ريكاردو موراندي.",
    historySnippetEn: "The Green Mountain is Libya's verdant ecological jewel, home to diverse flora, misty mountain passes, and the historic Morandi canyon bridge.",
    rating: 4.95,
    reviewsCount: 420,
    hasDailyTrip: true,
    departureCity: "بنغازي",
    departureCityEn: "Benghazi",
    departureTime: "08:30 صباحاً",
    departureTimeEn: "08:30 AM",
    entryFee: "مجاني",
    entryFeeEn: "Free Access",
    bestSeason: "طوال العام (الربيع والشتاء الأروع بالطبيعة والغيوم)",
    bestSeasonEn: "Year-round (Spring & misty Winter are most scenic)",
    highlights: ["غابات الصنوبر الحلبي والعرعر الفينيقي", "جسر وادي الكوف الأيقوني المعلق", "مطلات عقبة الجبل والسهول الخضراء", "مسارات المشي والتخييم الجبلي"],
    highlightsEn: ["Aleppo Pine & Juniper Forests", "Iconic Wadi Al-Kuf Canyon Bridge", "Mountain Pass Viewpoints", "Eco-Hiking & Camping Trails"],
    mapsQuery: "Wadi+Al-Kuf+Bridge+Libya",
    approxTripPrice: 190,
  },
  {
    id: "att-ghadames",
    name: "مدينة غدامس القديمة (لؤلؤة الصحراء)",
    nameEn: "Old Town of Ghadames (Pearl of the Sahara)",
    city: "غدامس",
    cityEn: "Ghadames",
    region: "الجنوب الغربي (الواحات)",
    regionEn: "Southwestern Oases",
    category: "مدن قديمة وقلاع",
    categoryEn: "Old Cities & Fortresses",
    isUnesco: true,
    unescoYear: "1986",
    img: destGhadames,
    gallery: [
      destGhadames,
      destAcacus,
      destUbari,
    ],
    description:
      "واحة تاريخية مسجلة بالتراث العالمي لليونسكو. تتميز بعمارتها الصحراوية الهندسية الفريدة، الممرات المسقوفة المكيفة طبيعياً لحماية الأهالي من الحرارة، البيوت الطينية المزخرفة بالألوان، وعين الفرس التاريخية التي تروي بساتين النخيل.",
    descriptionEn:
      "An extraordinary UNESCO World Heritage oasis. Celebrated for its unique domed architecture, covered white passages with natural climate cooling, vibrant multi-level Berber mud-brick homes, and the historic Ain Al-Faras spring.",
    historySnippet: "عرفت قدماً باسم 'كيداموس' وكانت محطة التلاقي المركزية لقوافل تجارة الذهب والحرير عبر الصحراء الكبرى.",
    historySnippetEn: "Known in antiquity as Cydamus, the vital crossroads for trans-Saharan gold and silk caravans.",
    rating: 5.0,
    reviewsCount: 340,
    hasDailyTrip: false,
    departureTime: "رحلة أسبوعية / خاصة",
    departureTimeEn: "Weekly / Private Expedition",
    entryFee: "مجاني",
    entryFeeEn: "Free Access",
    bestSeason: "أكتوبر — أبريل",
    bestSeasonEn: "October — April",
    highlights: ["الممرات المسقوفة البيضاء", "عين الفرس التاريخية ونظام السواقي", "المنازل التراثية والمرايا الجدارية", "متحف غدامس للتراث الشعبي"],
    highlightsEn: ["Covered Architectural Alleyways", "Ain Al-Faras Ancient Spring", "Traditional Decorated Rooftops", "Ghadames Folkloric Museum"],
    mapsQuery: "Old+Town+Ghadames+Libya",
  },
  {
    id: "att-ubari",
    name: "بحيرات أوباري الصحراوية وبحيرة قبرعون",
    nameEn: "Ubari Desert Lakes & Gaberoun Oasis",
    city: "أوباري",
    cityEn: "Ubari",
    region: "فزان الصحراوية (الجنوب)",
    regionEn: "Fezzan Sahara (Southern Region)",
    category: "واحات صحراوية",
    categoryEn: "Desert Oases & Dunes",
    isUnesco: false,
    img: destUbariGaberoun,
    gallery: [
      destUbariGaberoun,
      destUbariUmmAlMaa,
      destSaharaDunes,
      destAcacusArch,
    ],
    description:
      "أعجوبة طبيعية استثنائية في قلب رملة أوباري، حيث ترقد بحيرات مائية زرقاء محاطة بأشجار النخيل وسط كثبان رملية ذهبية شاهقة يصل ارتفاعها لأكثر من 120 متراً. تشتهر بحيرة قبرعون بمياهها شديدة الملوحة والتزلج على الرمال وسهرات التخييم الفاخرة.",
    descriptionEn:
      "A stunning natural wonder deep in the Erg Ubari desert. Shimmering sapphire saltwater lakes fringed with green palm groves amidst soaring golden sand dunes over 120m high. Perfect for sandboarding, desert camping, and stargazing.",
    historySnippet: "مستوطنات ومسارات واحات سكنتها قبائل الصحراء الطوارق منذ آلاف السنين.",
    historySnippetEn: "Ancient desert oases inhabited by local Tuareg tribes for thousands of years.",
    rating: 5.0,
    reviewsCount: 420,
    hasDailyTrip: false,
    departureTime: "رحلة مغامرة خاصة / أسبوعية",
    departureTimeEn: "Private 4x4 / Weekly Tour",
    entryFee: "مجاني",
    entryFeeEn: "Free Access",
    bestSeason: "أكتوبر — مارس",
    bestSeasonEn: "October — March",
    highlights: ["بحيرة قبرعون فائقة الملوحة", "كثبان رملية ذهبية عملاقة", "تزلج الرمال وسفاري 4x4", "سهرات شاي الطوارق والمخيمات الفاخرة"],
    highlightsEn: ["High-salinity Gaberoun Lake", "Mega Golden Sand Dunes", "4x4 Desert Dune Bashing", "Authentic Tuareg Camp Nights"],
    mapsQuery: "Gaberoun+Lake+Ubari+Libya",
  },
  {
    id: "att-acacus",
    name: "جبال ورسومات تادرارت أكاكوس الصخرية",
    nameEn: "Tadrart Acacus Rock Art Mountains",
    city: "غات",
    cityEn: "Ghat",
    region: "أقصى الجنوب الغربي (الصحراء الكبرى)",
    regionEn: "Deep Southwestern Sahara",
    category: "طبيعة وجبال",
    categoryEn: "Mountains & Nature",
    isUnesco: true,
    unescoYear: "1985",
    img: destAcacusArch,
    gallery: [
      destAcacusArch,
      destSaharaDunes,
      destUbariGaberoun,
      destUbariUmmAlMaa,
    ],
    description:
      "سلسلة جبلية ساحرة من التكوينات الصخرية والأقواس الطبيعية تضم آلاف النقوش واللوحات الجدارية الملونة التي تعود لأكثر من 14,000 سنة، توثق تحول الصحراء من مروج خضراء مليئة بالزرافات والأفيال إلى الطبيعة الصحراوية الساحرة.",
    descriptionEn:
      "A breathtaking mountain range filled with dramatic natural arches and canyons. Home to thousands of prehistoric rock paintings dating back 14,000+ years, documenting the green savanna era when elephants and giraffes roamed the Sahara.",
    historySnippet: "مدرجة على قائمة التراث العالمي كأحد أقدم وأعظم المتاحف المفتوحة للفن الصخري في تاريخ البشرية.",
    historySnippetEn: "Inscribed as a UNESCO World Heritage site as one of the world's most significant open-air rock art museums.",
    rating: 4.9,
    reviewsCount: 260,
    hasDailyTrip: false,
    departureTime: "رحلة استكشافية خاصة 4x4",
    departureTimeEn: "Special 4x4 Expedition",
    entryFee: "مجاني (يتطلب تصريح ومرشد)",
    entryFeeEn: "Free (Permit & Guide required)",
    bestSeason: "نوفمبر — فبراير",
    bestSeasonEn: "November — February",
    highlights: ["أقواس صخرية وتكوينات جيولوجية نادرة", "نقوش صخرية لحيوانات ما قبل التاريخ", "كهوف ووديان أواندر", "أجواء فلكية ونقاء نجوم استثنائي"],
    highlightsEn: ["Towering Natural Stone Arches", "Prehistoric Animal Rock Paintings", "Wadi Awander Gorges", "Unmatched Dark Sky Stargazing"],
    mapsQuery: "Tadrart+Acacus+Libya",
  },
  {
    id: "att-tripoli-citadel",
    name: "قلعة السراي الحمراء والمدينة القديمة",
    nameEn: "Red Castle (Assaraya Al-Hamra) & Old Tripoli",
    city: "طرابلس",
    cityEn: "Tripoli",
    region: "المنطقة الغربية (العاصمة)",
    regionEn: "Western Region (Capital)",
    category: "مدن قديمة وقلاع",
    categoryEn: "Old Cities & Fortresses",
    isUnesco: false,
    img: destTripoli,
    gallery: [
      destTripoli,
      destTripoliOldCity,
      destHarborCoast,
    ],
    description:
      "قلعة تاريخية مهيبة تشرف على ميناء طرابلس وميدان الشهداء. تحتضن متاحف الآثار الوطنية وجوارها قوس ماركوس أوريليوس الروماني، أزقة أسواق الصاغة والعطارين، وجامع قورجي، ونزل خان فندق الزيت المعماري.",
    descriptionEn:
      "A grand historic citadel overlooking Tripoli harbor and Martyrs' Square. Houses national archaeological treasures, alongside the Roman Arch of Marcus Aurelius, vibrant spice souks, and Ottoman-era Gurgi Mosque.",
    historySnippet: "شهدت تتابع الحضارات الفينيقية، الرومانية، البيزنطية، الإسبانية، وفرسان القديس يوحنا، والعهد العثماني.",
    historySnippetEn: "Witnessed centuries of rule from Phoenicians and Romans to Spaniards, Knights of St. John, and Ottomans.",
    rating: 4.8,
    reviewsCount: 450,
    hasDailyTrip: true,
    departureCity: "طرابلس",
    departureCityEn: "Tripoli",
    departureTime: "09:00 صباحاً",
    departureTimeEn: "09:00 AM",
    entryFee: "10 د.ل",
    entryFeeEn: "10 LYD",
    bestSeason: "طوال العام",
    bestSeasonEn: "Year-round",
    highlights: ["متحف السراي الحمراء الوطني", "قوس ماركوس أوريليوس الروماني (163 م)", "جامع ومئذنة قرجي التاريخية", "أسواق الحرفيين والأزقة التقليدية"],
    highlightsEn: ["Red Castle National Museum", "Marcus Aurelius Roman Arch (163 AD)", "Historic Gurgi Mosque", "Old Souks & Artisan Alleys"],
    mapsQuery: "Red+Castle+Tripoli+Libya",
    approxTripPrice: 120,
  },
  {
    id: "att-gharyan-caves",
    name: "بيوت الحفر التراثية في غريان",
    nameEn: "Gharyan Troglodyte Underground Cave Houses",
    city: "غريان",
    cityEn: "Gharyan",
    region: "جبل نفوسة (المنطقة الغربية)",
    regionEn: "Jebel Nafusa (Western Region)",
    category: "مدن قديمة وقلاع",
    categoryEn: "Old Cities & Fortresses",
    isUnesco: false,
    img: destGharyanCave,
    gallery: [
      destGharyanCave,
      destGharyanCourtyard,
      destKsarDesert,
    ],
    description:
      "عمارة بيئية وهندسية فريدة محفورة في باطن الجبل بعمق يصل لـ 10 أمتار تحافظ على درجات حرارة معتدلة صيفاً وشتاءً، مع ساحات مركزية مفتوحة للسماء تعكس التراث الأمازيغي والجبلي الأصيل.",
    descriptionEn:
      "Extraordinary subterranean vernacular architecture excavated up to 10 meters deep into the earth. Naturally climate-controlled throughout the seasons with sunlit courtyards, embodying the rich Berber heritage of Jebel Nafusa.",
    historySnippet: "تاريخ عريق يعود لمئات السنين حيث استخدم السكان صخور جبل نفوسة لبناء مساكن بيئية مذهلة.",
    historySnippetEn: "Centuries-old troglodyte dwellings carved into mountain rock providing natural thermal comfort and security.",
    rating: 4.9,
    reviewsCount: 310,
    hasDailyTrip: true,
    departureCity: "طرابلس",
    departureCityEn: "Tripoli",
    departureTime: "08:30 صباحاً",
    departureTimeEn: "08:30 AM",
    entryFee: "10 د.ل",
    entryFeeEn: "10 LYD",
    bestSeason: "طوال العام",
    bestSeasonEn: "Year-round",
    highlights: ["حوش الحفر والغرف الدائرية المنحوتة", "الفناء الداخلي المفتوح للشمس", "سوق الفخار اليدوي الشهير بغريان", "منحدرات رأس اللفعة البانورامية"],
    highlightsEn: ["Subterranean Dugout Rooms", "Sunlit Central Courtyard", "Famous Handmade Pottery Souk", "Ras Al-Lafaa Panoramic Peaks"],
    mapsQuery: "Gharyan+Cave+Houses+Libya",
    approxTripPrice: 110,
  },
  {
    id: "att-ksar-nafusa",
    name: "قصور وقلاع الجبل الغربي (نالوت وكاباو)",
    nameEn: "Historic Berber Granary Ksars (Nalut & Kabaw)",
    city: "نالوت / كاباو",
    cityEn: "Nalut / Kabaw",
    region: "جبل نفوسة (المنطقة الغربية)",
    regionEn: "Jebel Nafusa (Western Region)",
    category: "مدن قديمة وقلاع",
    categoryEn: "Old Cities & Fortresses",
    isUnesco: false,
    img: destKsarDesert,
    gallery: [
      destKsarDesert,
      destGharyanCave,
      destGhadames,
    ],
    description:
      "قلاع وحصون حجرية شاهقة ذات طبقات متعددة شيدها الأمازيغ على حواف الجرف لتخزين الحبوب والمحاصيل وزيت الزيتون، تعد شواهد حية على عبقرية العمارة الدفاعية والتراثية.",
    descriptionEn:
      "Towering multi-story fortified cliffside granaries built from stone and plaster by the Berbers to safeguard olive oil and harvests, standing as magnificent medieval engineering marvels.",
    historySnippet: "شيدت في القرون الوسطى كقلاع جماعية ومخازن محصنة ضد الغزوات وتقلبات المناخ.",
    historySnippetEn: "Erected in medieval times as communal fortified storage towers perched on rugged mountain edges.",
    rating: 4.85,
    reviewsCount: 240,
    hasDailyTrip: true,
    departureCity: "طرابلس",
    departureCityEn: "Tripoli",
    departureTime: "07:30 صباحاً",
    departureTimeEn: "07:30 AM",
    entryFee: "10 د.ل",
    entryFeeEn: "10 LYD",
    bestSeason: "أكتوبر — مايو",
    bestSeasonEn: "October — May",
    highlights: ["غرف التخزين متعددة الطبقات", "إطلالات الحافة الجبلية الساحرة", "مسجد كاباو العتيق", "قصر الحاج الدائري المعماري"],
    highlightsEn: ["Multi-tiered Granary Cells", "Spectacular Cliffside Vistas", "Ancient Kabaw Mosque", "Circular Qasr Al-Hajj Fortress"],
    mapsQuery: "Qasr+Nalut+Libya",
    approxTripPrice: 180,
  },
  {
    id: "att-slonta-soussa",
    name: "مدينة أبولونيا ومنحوتات اسلونطة الصخرية",
    nameEn: "Apollonia Coastal Ruins & Slonta Rock Carvings",
    city: "سوسة / شحات",
    cityEn: "Sousa / Shahhat",
    region: "الجبل الأخضر (الساحل الشرقي)",
    regionEn: "Green Mountain (Eastern Coast)",
    category: "طبيعة وجبال",
    categoryEn: "Mountains & Nature",
    isUnesco: false,
    img: destHarborCoast,
    gallery: [
      destHarborCoast,
      destCyrene,
      heroImg,
    ],
    description:
      "مزيج رائع يجمع بين ميناء أبولونيا الإغريقي القديم بمياهه الفيروزية والآثار الغارقة تحت البحر، وكهف اسلونطة الأثري المنحوت في الصخر الجبلي بوجوه ورموز دينية غامضة وفريدة.",
    descriptionEn:
      "A coastal blend of the ancient Greek port of Apollonia with crystal turquoise waters and submerged ruins, paired with the mystical cliff-carved rock sanctuaries and human-shaped faces of Slonta.",
    historySnippet: "كانت أبولونيا الميناء البحري الرئيسي لمملكة قورينا الإغريقية منذ القرن السادس قبل الميلاد.",
    historySnippetEn: "Served as the primary port for the Greek Cyrenaican Kingdom from the 6th century BC.",
    rating: 4.8,
    reviewsCount: 220,
    hasDailyTrip: true,
    departureCity: "بنغازي",
    departureCityEn: "Benghazi",
    departureTime: "09:00 صباحاً",
    departureTimeEn: "09:00 AM",
    entryFee: "15 د.ل",
    entryFeeEn: "15 LYD",
    bestSeason: "أبريل — نوفمبر",
    bestSeasonEn: "April — November",
    highlights: ["ميناء أبولونيا الأثري على البحر", "الآثار والمسارح الغارقة", "منحوتات اسلونطة الجبلية النادرة", "شواطئ سوسة البحرية النقية"],
    highlightsEn: ["Ancient Apollonia Seaport", "Submerged Maritime Ruins", "Mystic Slonta Mountain Carvings", "Pristine Sousa Coast"],
    mapsQuery: "Apollonia+Sousa+Libya",
    approxTripPrice: 190,
  },
  {
    id: "att-villa-silin",
    name: "فيلا سيلين والموزاييك الروماني الفاخر",
    nameEn: "Villa Silin & Roman Seaside Mosaics",
    city: "الخمس",
    cityEn: "Al-Khoms",
    region: "المنطقة الغربية",
    regionEn: "Western Region",
    category: "آثار تاريخية",
    categoryEn: "Historical & Ancient Ruins",
    isUnesco: false,
    img: destSabratah,
    gallery: [
      destSabratah,
      heroImg,
      destTripoli,
    ],
    description:
      "قصر أثري روماني فخم يقع مباشرة على البحر بالقرب من لبدة الكبرى، يشتهر بلوحات الفسيفساء (الموزاييك) الأرضية النادرة الملونة التي تصور سباقات العربات في سيرك روما، والحدائق الرومانية الداخلية المحاطة بالأعمدة.",
    descriptionEn:
      "A luxurious beachfront Roman seaside villa near Leptis Magna. Renowned for its exceptionally preserved, colorful floor mosaics depicting chariot races and mythology, along with peristyle gardens facing the waves.",
    historySnippet: "كانت قصراً صيفياً لأحد كبار نبلاء وسيناتورات لبدة الكبرى في القرن الثاني الميلادي.",
    historySnippetEn: "A lavish coastal retreat for a wealthy Roman senator of Leptis Magna during the 2nd century AD.",
    rating: 4.8,
    reviewsCount: 180,
    hasDailyTrip: true,
    departureCity: "طرابلس",
    departureCityEn: "Tripoli",
    departureTime: "09:00 صباحاً",
    departureTimeEn: "09:00 AM",
    entryFee: "10 د.ل",
    entryFeeEn: "10 LYD",
    bestSeason: "طوال العام",
    bestSeasonEn: "Year-round",
    highlights: ["لوحات فسيفساء سباق العربات النادرة", "إطلالة شاطئية رومانية مباشرة", "غرف الحمامات الرخامية القديمة", "تدرج معماري محفوظ بامتياز"],
    highlightsEn: ["Famous Chariot Race Mosaics", "Direct Seaside Roman Terrace", "Preserved Thermal Baths", "Intact Columned Courtyards"],
    mapsQuery: "Villa+Silin+Al-Khoms+Libya",
    approxTripPrice: 160,
  },
];

export type CityDestinationItem = {
  id: string;
  name: string;
  nameEn: string;
  shortName: string;
  shortNameEn: string;
  subtitle: string;
  subtitleEn: string;
  region: string;
  categoryTag: string;
  categoryTagEn: string;
  img: string;
  photos: string[];
  videoUrl?: string;
  mapQuery: string;
  rating: number;
  reviewsCount: number;
  ratingLabel: string;
  ratingLabelEn: string;
  hasDailyTrip: boolean;
  hasWeeklyTrip: boolean;
  hasPrivateTrip: boolean;
  startPriceLYD: number;
  landmarksCount: number;
  description: string;
  descriptionEn: string;
  dailyTripsInfo: string;
  dailyTripsInfoEn: string;
  highlights: string[];
};

const LIBYAN_CITIES: CityDestinationItem[] = [
  {
    id: "city-khoms",
    name: "مدينة الخمس (لبدة الكبرى)",
    nameEn: "Al-Khoms City (Leptis Magna)",
    shortName: "الخمس",
    shortNameEn: "Al-Khoms",
    subtitle: "عاصمة الآثار الرومانية الساحلية",
    subtitleEn: "Capital of Coastal Roman Heritage",
    region: "المنطقة الغربية",
    categoryTag: "ساحلية ورومانية تاريخية",
    categoryTagEn: "Coastal & Historic Roman",
    img: heroImg,
    photos: [
      heroImg,
      destLeptisArch,
      destLeptisTheater,
      destLeptisCoast,
    ],
    mapQuery: "Leptis+Magna+Al+Khoms+Libya",
    rating: 4.9,
    reviewsCount: 480,
    ratingLabel: "استثنائي جداً",
    ratingLabelEn: "Exceptional",
    hasDailyTrip: true,
    hasWeeklyTrip: false,
    hasPrivateTrip: true,
    startPriceLYD: 180,
    landmarksCount: 12,
    description: "مدينة الخمس الساحلية تحتضن أعظم مدينة رومانية محفوظة في البحر المتوسط (لبدة الكبرى) وفيلا سيلين وميناء لبدة القديم.",
    descriptionEn: "Al-Khoms hosts Leptis Magna, the finest preserved Roman city in the Mediterranean, alongside Villa Silin and the ancient harbor.",
    dailyTripsInfo: "رحلة يومية منتظمة تنطلق من العاصمة طرابلس يومياً الساعة 09:00 صباحاً في حافلة سياحية مكيفة شاملة تذاكر الدخول للموقع الأثري والمرشد السياحي المعتمد ووجبة الغداء.",
    dailyTripsInfoEn: "Daily departures from Tripoli at 09:00 AM in air-conditioned coaches, including site tickets, certified guide, and lunch.",
    highlights: ["آثار لبدة الكبرى وقوس سيفيروس", "المسرح الروماني الساحلي الأثري", "فيلا سيلين وموزاييك العربات", "ميناء ومخازن لبدة البحرية القديمة"],
  },
  {
    id: "city-tripoli",
    name: "طرابلس (عروس البحر)",
    nameEn: "Tripoli (Bride of the Sea)",
    shortName: "طرابلس",
    shortNameEn: "Tripoli",
    subtitle: "العاصمة والمدينة القديمة التاريخية",
    subtitleEn: "Capital & Historic Old Citadel",
    region: "المنطقة الغربية",
    categoryTag: "ساحلية وإسلامية عريقة",
    categoryTagEn: "Coastal & Historic Citadel",
    img: destTripoli,
    photos: [
      destTripoli,
      destTripoliCastle,
      destTripoliArch,
      destTripoliMedina,
    ],
    mapQuery: "Red+Castle+Tripoli+Libya",
    rating: 4.8,
    reviewsCount: 450,
    ratingLabel: "ممتاز جداً",
    ratingLabelEn: "Wonderful",
    hasDailyTrip: true,
    hasWeeklyTrip: false,
    hasPrivateTrip: true,
    startPriceLYD: 120,
    landmarksCount: 18,
    description: "تتميز طرابلس بقلعة السراي الحمراء التاريخية، قوس ماركوس أوريليوس الروماني، أزقة أسواق الصاغة، والمباني المعمارية الإيطالية والعثمانية.",
    descriptionEn: "Features the iconic Red Castle Citadel, Marcus Aurelius Arch, vibrant artisan souks, and historic Mediterranean harbors.",
    dailyTripsInfo: "جولات يومية مكثفة تنطلق يومياً الساعة 09:00 ص من ميدان الشهداء تشمل زيارة السراي الحمراء، قوس ماركوس أوريليوس، وأسواق المدينة القديمة مع وجبة غداء تراثية.",
    dailyTripsInfoEn: "Daily tours departing at 09:00 AM from Martyrs' Square covering Red Castle, Marcus Aurelius Arch, and old souks.",
    highlights: ["قلعة السراي الحمراء التاريخية", "قوس الإمبراطور ماركوس أوريليوس", "أسواق الصاغة وسوق الحرير القديم", "جامع أحمد باشا القره مانلي العريق"],
  },
  {
    id: "city-sabratha",
    name: "مدينة صبراتة التاريخية",
    nameEn: "Sabratha Ancient City",
    shortName: "صبراتة",
    shortNameEn: "Sabratha",
    subtitle: "جوهرة الساحل الفينيقي والروماني",
    subtitleEn: "Jewel of Phoenician & Roman Coast",
    region: "المنطقة الغربية",
    categoryTag: "ساحلية ورومانية تاريخية",
    categoryTagEn: "Coastal & Historic Roman",
    img: destSabratah,
    photos: [
      destSabratah,
      destSabratahTheater,
      destSabratahTemple,
      destSabratahCoast,
    ],
    mapQuery: "Sabratha+Roman+Theatre+Libya",
    rating: 4.9,
    reviewsCount: 360,
    ratingLabel: "ممتاز جداً",
    ratingLabelEn: "Wonderful",
    hasDailyTrip: true,
    hasWeeklyTrip: false,
    hasPrivateTrip: true,
    startPriceLYD: 160,
    landmarksCount: 8,
    description: "تضم أعظم مسرح روماني ساحلي مكون من ثلاثة طوابق من الأعمدة الكورنثية المطلة على البحر مباشرة ومعابد إيزيس وهرقل.",
    descriptionEn: "Home to the famous 3-tiered coastal Roman theatre, ancient Phoenician harbour ruins, and stunning sea mosaic temples.",
    dailyTripsInfo: "تنطلق رحلات يومية من طرابلس الساعة 09:00 ص إلى مسرح وآثار صبراتة الساحلية والمتحف الأثري شاملة المرشد والنقل الفاخر.",
    dailyTripsInfoEn: "Daily trips depart from Tripoli at 09:00 AM to Sabratha Roman Theatre and archaeological museum.",
    highlights: ["المسرح الروماني ذو الطبقات الثلاث", "معبد إيزيس ومعبد هرقل الأثري", "متحف الفسيفساء والمرفأ الفينيقي", "الحمامات الرومانية الشاطئية المطلة على البحر"],
  },
  {
    id: "city-shahhat",
    name: "مدينة شحات (قورينا)",
    nameEn: "Shahhat City (Cyrene)",
    shortName: "شحات",
    shortNameEn: "Shahhat",
    subtitle: "أثينا أفريقيا فوق الجبل الأخضر",
    subtitleEn: "Athens of Africa atop Green Mountain",
    region: "الجبل الأخضر",
    categoryTag: "جبلية وإغريقية أثرية",
    categoryTagEn: "Mountain & Ancient Greek",
    img: destJabalAkhdarPanorama,
    photos: [
      destJabalAkhdarPanorama,
      destCyreneApollo,
      destCyreneSanctuary,
      destCyrene,
    ],
    mapQuery: "Cyrene+Shahhat+Libya",
    rating: 4.9,
    reviewsCount: 390,
    ratingLabel: "استثنائي",
    ratingLabelEn: "Exceptional",
    hasDailyTrip: true,
    hasWeeklyTrip: false,
    hasPrivateTrip: true,
    startPriceLYD: 200,
    landmarksCount: 14,
    description: "مدينة إغريقية تاريخية بارتفاع 600 متر على الجبل الأخضر، تضم معبد أبولو ونبعه المقدس، معبد زيوس العملاق، وشلالات الطبيعة.",
    descriptionEn: "Ancient Greek capital perched 600m high atop the lush Green Mountain. Features Apollo Sanctuary, Zeus Temple, and mountain waterfalls.",
    dailyTripsInfo: "رحلات يومية منتظمة تنطلق من مدينة بنغازي الساعة 09:00 صباحاً نحو الجبل الأخضر وشحات، شاملة زيارة معبد أبولو والأكروبوليس والشلالات.",
    dailyTripsInfoEn: "Daily trips departing Benghazi at 09:00 AM to Green Mountain, Cyrene ruins, and Apollo sanctuary.",
    highlights: ["معبد ونبع أبولو المقدس", "معبد زيوس الأضخم في شمال أفريقيا", "أكروبوليس قورينا والمدرج الإغريقي", "شلالات وادي المنصورة بين الغابات"],
  },
  {
    id: "city-jabal-akhdar",
    name: "الجبل الأخضر ووادي الكوف",
    nameEn: "Green Mountain & Wadi Al-Kuf",
    shortName: "الجبل الأخضر",
    shortNameEn: "Green Mountain",
    subtitle: "غابات الصنوبر وجسر وادي الكوف الأيقوني",
    subtitleEn: "Pine Forests & Iconic Canyon Bridge",
    region: "المنطقة الشرقية",
    categoryTag: "طبيعة ومحميات جبلية",
    categoryTagEn: "Nature & Mountain Reserves",
    img: destJabalAkhdarForest,
    photos: [
      destJabalAkhdarForest,
      destJabalAkhdarBridge,
      destJabalAkhdarPanorama,
      destJabalAkhdarValley,
    ],
    mapQuery: "Wadi+Al-Kuf+Bridge+Libya",
    rating: 4.95,
    reviewsCount: 420,
    ratingLabel: "وجهة ساحرة",
    ratingLabelEn: "Magical Destination",
    hasDailyTrip: true,
    hasWeeklyTrip: true,
    hasPrivateTrip: true,
    startPriceLYD: 190,
    landmarksCount: 16,
    description: "أكبر محمية طبيعية خضراء في ليبيا، تتميز بغابات الصنوبر الشاهقة، جسر وادي الكوف المعلق، ومسارات المشي والاستجمام في الهواء الجبلي النقي.",
    descriptionEn: "Libya's premier green natural reserve, featuring dense pine woodlands, caves, the famous Wadi Al-Kuf suspension bridge, and scenic mountain trails.",
    dailyTripsInfo: "رحلات يومية وأسبوعية تنطلق من بنغازي نحو غابات ووديان الجبل الأخضر وجسر وادي الكوف ومطلات عقبة الجبل.",
    dailyTripsInfoEn: "Daily and weekly tours departing Benghazi exploring the Green Mountain pine forests, canyon bridge, and lookouts.",
    highlights: ["جسر وادي الكوف المعلق", "غابات الصنوبر والعرعر الطبيعية", "مطلات عقبة الجبل على السهول الزراعية", "أودية المنصورة والينابيع الجبلية"],
  },
  {
    id: "city-ghadames",
    name: "مدينة غدامس (لؤلؤة الصحراء)",
    nameEn: "Ghadames Old Town (Sahara Pearl)",
    shortName: "غدامس",
    shortNameEn: "Ghadames",
    subtitle: "معمار صحراوي مسجل بالتراث العالمي",
    subtitleEn: "UNESCO Desert Oasis Architecture",
    region: "الجنوب الغربي",
    categoryTag: "صحراوية وتراث اليونسكو",
    categoryTagEn: "Desert & UNESCO Heritage",
    img: destGhadames,
    photos: [
      destGhadames,
      destGhadamesAlleys,
      destGhadamesOasis,
      destSaharaDunes,
    ],
    mapQuery: "Ghadames+Old+Town+Libya",
    rating: 5.0,
    reviewsCount: 340,
    ratingLabel: "ممتاز وباهر",
    ratingLabelEn: "Out-of-this-World",
    hasDailyTrip: false,
    hasWeeklyTrip: true,
    hasPrivateTrip: true,
    startPriceLYD: 350,
    landmarksCount: 10,
    description: "واحة تاريخية بالممرات المسقوفة المكيفة بيئياً، المنازل الطينية الملونة، عين الفرس التاريخية، وبساتين النخيل في عمق الصحراء.",
    descriptionEn: "Historic UNESCO oasis celebrated for covered cool alleys, colorful Berber homes, Ain Al-Faras spring, and rich desert folklore.",
    dailyTripsInfo: "رحلة أسبوعية / خاصة استكشافية لمدة 3 أيام تنطلق نهاية كل أسبوع شاملة الإقامة في المنازل التراثية والوجبات الغدامسية وجولات عين الفرس والممر المسقوف.",
    dailyTripsInfoEn: "3-day weekly / private expedition including traditional home stays, desert meals, and guided oasis tours.",
    highlights: ["الممرات المسقوفة المكيفة بيئياً", "عين الفرس الكبريتية التاريخية", "المنازل التراثية البربرية الملونة", "متحف التراث وواحات بساتين النخيل"],
  },
  {
    id: "city-ubari",
    name: "واحة أوباري وبحيرة قبرعون",
    nameEn: "Ubari Oases & Gaberoun Lake",
    shortName: "أوباري",
    shortNameEn: "Ubari",
    subtitle: "بحيرات زرقاء وسط الكثبان الذهبية",
    subtitleEn: "Sapphire Lakes in Golden Dunes",
    region: "فزان الصحراوية",
    categoryTag: "واحات صحراوية وبحيرات طبيعية",
    categoryTagEn: "Sahara Oasis & Nature Lakes",
    img: destUbariGaberoun,
    photos: [
      destUbariGaberoun,
      destUbariUmmAlMaa,
      destUbari,
      destSaharaDunes,
    ],
    mapQuery: "Gaberoun+Lake+Ubari+Libya",
    rating: 5.0,
    reviewsCount: 420,
    ratingLabel: "استثنائي باهر",
    ratingLabelEn: "Unmatched",
    hasDailyTrip: false,
    hasWeeklyTrip: true,
    hasPrivateTrip: true,
    startPriceLYD: 400,
    landmarksCount: 7,
    description: "أعجوبة طبيعية ترقد بها بحيرات زرقاء فائقة الملوحة بين كثبان رملية بارتفاع 120 متراً مع تزلج الرمال ومخيمات الطوارق.",
    descriptionEn: "Nature wonder with deep blue lakes nestled in 120m high golden dunes. Ideal for dune bashing, sandboarding, and Tuareg nights.",
    dailyTripsInfo: "رحلات مغامرة أسبوعية وخاصة سيارات 4x4 عبر كثبان رملة أوباري، شاملة التزلج على الرمال وتجربة مياه قبرعون ومخيمات الشاي الطوارقية.",
    dailyTripsInfoEn: "4x4 weekly dune adventure including sandboarding, Gaberoun salt lake, and Tuareg camp tea nights.",
    highlights: ["بحيرة قبرعون فائقة الملوحة والجمال", "كثبان بحر الرمال العظيم (ارتفاع 120م)", "واحات أم الماء والمفرو والطرونة", "مخيمات الطوارق وسفاري الدفع الرباعي 4x4"],
  },
  {
    id: "city-ghat",
    name: "مدينة غات وجبال أكاكوس",
    nameEn: "Ghat City & Acacus Mountains",
    shortName: "غات",
    shortNameEn: "Ghat",
    subtitle: "متحف الفن الصخري الطبيعي المفتوح",
    subtitleEn: "Open-Air Prehistoric Rock Art Museum",
    region: "أقصى الجنوب الغربي",
    categoryTag: "جبال صحراوية ونقوش تاريخية",
    categoryTagEn: "Desert Mountains & Rock Art",
    img: destAcacusArch,
    photos: [
      destAcacusArch,
      destAcacus,
      destSaharaDunes,
      destKsarDesert,
    ],
    mapQuery: "Acacus+Mountains+Ghat+Libya",
    rating: 4.9,
    reviewsCount: 260,
    ratingLabel: "استثنائي",
    ratingLabelEn: "Exceptional",
    hasDailyTrip: false,
    hasWeeklyTrip: true,
    hasPrivateTrip: true,
    startPriceLYD: 450,
    landmarksCount: 9,
    description: "تضم جبال وتكوينات أكاكوس الصخرية ونقوش ما قبل التاريخ التي تعود لأكثر من 14,000 سنة وقلعة غات التاريخية.",
    descriptionEn: "Gate to the UNESCO Tadrart Acacus prehistoric rock paintings, natural arches, Awander canyons, and historic Ghat fortress.",
    dailyTripsInfo: "رحلات خاصة وأسبوعية استكشافية 4x4 إلى جبال ورسومات أكاكوس الصخرية ووادي أواندر، مع تصاريح ومرافقين محليين وتخييم تحت النجوم.",
    dailyTripsInfoEn: "4x4 weekly / private expeditions to Acacus rock art, Awander canyon, camping under the desert stars.",
    highlights: ["رسومات ونقوش أكاكوس (14,000 سنة)", "الأقواس والجسور الصخرية الطبيعية العملاقة", "قلعة غات الطينية والمدينة العتيقة", "وادي أواندر وعيون الصحراء العذبة"],
  },
  {
    id: "city-gharyan",
    name: "مدينة غريان (جبل نفوسة)",
    nameEn: "Gharyan City (Jebel Nafusa)",
    shortName: "غريان",
    shortNameEn: "Gharyan",
    subtitle: "عاصمة بيوت الحفر والفخار التراثي",
    subtitleEn: "Capital of Cave Houses & Pottery",
    region: "جبل نفوسة",
    categoryTag: "جبلية وتراث أصيل",
    categoryTagEn: "Mountain & Heritage",
    img: destGharyanCave,
    photos: [
      destGharyanCave,
      destGharyanCourtyard,
      destNafusaFortress,
      destKsarDesert,
    ],
    mapQuery: "Gharyan+Libya",
    rating: 4.9,
    reviewsCount: 310,
    ratingLabel: "ممتاز جداً",
    ratingLabelEn: "Wonderful",
    hasDailyTrip: true,
    hasWeeklyTrip: false,
    hasPrivateTrip: true,
    startPriceLYD: 110,
    landmarksCount: 8,
    description: "مدينة جبلية عريقة تشتهر ببيوت الحفر التراثية الفريدة المحفورة تحت الأرض، وأسواق الفخار اليدوي الشهيرة، وإطلالات رأس اللفعة الشاهقة.",
    descriptionEn: "Historic mountain town world-famous for subterranean troglodyte cave dwellings, handmade pottery kilns, and cliffside panoramas.",
    dailyTripsInfo: "رحلات يومية منتظمة تنطلق من طرابلس الساعة 08:30 صباحاً شاملة زيارة بيوت الحفر، وورش الفخار، مع وجبة غداء جبلية تقليدية.",
    dailyTripsInfoEn: "Daily departures from Tripoli at 08:30 AM including cave houses tour, pottery workshops, and traditional lunch.",
    highlights: ["بيوت الحفر التراثية المحفورة في الجبل", "ورش ومصانع الفخار والخزف التقليدي", "إطلالات رأس اللفعة الجبلية الخلابة", "أكلات جبلية أصيلة وزيت زيتون نفوسي"],
  },
  {
    id: "city-nalut",
    name: "نالوت وقصور الجبل الغربي",
    nameEn: "Nalut & Berber Mountain Ksars",
    shortName: "نالوت",
    shortNameEn: "Nalut",
    subtitle: "قلاع وقصور تخزين الحبوب الأمازيغية",
    subtitleEn: "Historic Berber Cliffside Granaries",
    region: "جبل نفوسة",
    categoryTag: "قلاع وتراث تاريخي",
    categoryTagEn: "Fortress & History",
    img: destKsarDesert,
    photos: [
      destKsarDesert,
      destKsarNalut,
      destNafusaFortress,
      destGharyanCourtyard,
    ],
    mapQuery: "Qasr+Nalut+Libya",
    rating: 4.85,
    reviewsCount: 240,
    ratingLabel: "تاريخي أصيل",
    ratingLabelEn: "Authentic Heritage",
    hasDailyTrip: true,
    hasWeeklyTrip: true,
    hasPrivateTrip: true,
    startPriceLYD: 180,
    landmarksCount: 6,
    description: "تضم أعظم القصور الأمازيغية التاريخية لتخزين المحاصيل (قصر نالوت وقصر كاباو وقصر الحاج) المعلقة فوق حواف الجبل السحيقة.",
    descriptionEn: "Home to the greatest medieval Berber granaries and storage towers (Nalut, Kabaw, and Qasr Al-Hajj) dramatically perched over cliff edges.",
    dailyTripsInfo: "رحلات جبلية متكاملة لزيارة قصر نالوت وقصر كاباو ومسجدها العتيق مع إطلالات بانورامية على السهل والجبال.",
    dailyTripsInfoEn: "Full-day mountain tours visiting Nalut and Kabaw ksars with panoramic clifftop views.",
    highlights: ["قصر نالوت الأثري ذو الطبقات الست", "قصر كاباو والمسجد العتيق", "قصر الحاج الدائري الفريد", "إطلالات الحافة الجبلية الشاهقة"],
  },
];

export function AttractionsPage() {
  const { language, dir } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [tripSystemFilter, setTripSystemFilter] = useState<"all" | "daily" | "private" | "unesco">("all");
  const [sortBy, setSortBy] = useState<"rating" | "reviews" | "name">("rating");

  const modals = useModalPair();
  const [privateTripModalOpen, setPrivateTripModalOpen] = useState(false);
  const [privateTripDest, setPrivateTripDest] = useState("");
  const [bookingTripModalOpen, setBookingTripModalOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<AttractionItem | null>(null);

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

  // Cities list
  const cities = useMemo(() => {
    const rawCities = Array.from(new Set(LIBYAN_ATTRACTIONS.map((a) => (isAr ? a.city : a.cityEn))));
    return ["all", ...rawCities];
  }, [isAr]);

  // UNESCO World Heritage Sites count & items
  const unescoSites = useMemo(() => LIBYAN_ATTRACTIONS.filter((a) => a.isUnesco), []);
  const [unescoDeckIndex, setUnescoDeckIndex] = useState(0);

  // Auto-rotate 3D cards deck every 5 seconds
  useEffect(() => {
    if (unescoSites.length === 0) return;
    const timer = setInterval(() => {
      setUnescoDeckIndex((prev) => (prev + 1) % unescoSites.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [unescoSites.length]);

  const activeUnescoSite = unescoSites[unescoDeckIndex] || unescoSites[0];

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
      bookable: att.hasDailyTrip,
      info: [
        { label: isAr ? "المدينة والمنطقة" : "City & Region", value: `${isAr ? att.city : att.cityEn} (${isAr ? att.region : att.regionEn})` },
        { label: isAr ? "مكان وموعد الانطلاق" : "Departure Info", value: att.hasDailyTrip ? `${isAr ? `تنطلق من ${att.departureCity}` : `Departs from ${att.departureCityEn}`} (${isAr ? att.departureTime : att.departureTimeEn})` : (isAr ? "عبر رحلة خاصة / أسبوعية مخصصة" : "Via Private / Weekly Tour") },
        { label: isAr ? "رسوم الدخول التقديرية" : "Estimated Entry Fee", value: isAr ? att.entryFee : att.entryFeeEn },
        { label: isAr ? "أفضل مواسم الزيارة" : "Best Season to Visit", value: isAr ? att.bestSeason : att.bestSeasonEn },
        { label: isAr ? "موقع التراث العالمي لليونسكو" : "UNESCO Status", value: att.isUnesco ? (isAr ? `مسجل باليونسكو عام ${att.unescoYear}` : `Inscribed UNESCO ${att.unescoYear}`) : (isAr ? "معلم وطني طبيعي/تاريخي" : "National Heritage Site") },
      ],
      features: isAr ? att.highlights : att.highlightsEn,
      price: att.hasDailyTrip ? (att.approxTripPrice || 180) : 0,
    });
  }

  function handleOpenCityDetails(city: CityDestinationItem) {
    const tripSystemSummary = [
      city.hasDailyTrip ? (isAr ? "☀️ رحلات يومية منتظمة (09:00 ص)" : "☀️ Regular Daily Trips (09:00 AM)") : "",
      city.hasWeeklyTrip ? (isAr ? "🗓️ رحلات أسبوعية المواعيد" : "🗓️ Weekly Expeditions") : "",
      city.hasPrivateTrip ? (isAr ? "🧭 إمكانية حجز رحلات خاصة مخصصة" : "🧭 Custom Private Trips Available") : "",
    ].filter(Boolean).join(" · ");

    modals.openDetails({
      title: isAr ? city.name : city.nameEn,
      subtitle: `${isAr ? city.subtitle : city.subtitleEn} — ${city.region}`,
      image: city.img,
      description: isAr ? city.description : city.descriptionEn,
      bookable: true,
      info: [
        { label: isAr ? "المنطقة والإقليم" : "Region", value: city.region },
        { label: isAr ? "نظام الرحلات المتوفرة" : "Available Trip System", value: tripSystemSummary },
        { label: isAr ? "عدد المعالم السياحية" : "Documented Landmarks", value: isAr ? `${city.landmarksCount} معالم موثقة بالكامل` : `${city.landmarksCount} Documented Sites` },
        { label: isAr ? "سعر الانطلاق التقديري" : "Starting Price", value: isAr ? `تبدأ الرحلات من ${city.startPriceLYD} د.ل` : `From ${city.startPriceLYD} LYD` },
        { label: isAr ? "تقييم السياح والزوار" : "Guest Rating", value: `⭐ ${city.rating} / 5 (${city.ratingLabel} — ${city.reviewsCount} تقييم)` },
      ],
      features: city.highlights,
      price: city.startPriceLYD,
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
              ? "دليلك المتكامل لمواقع التراث العالمي لليونسكو، الآثار الرومانية والإغريقية، الواحات الصحراوية، والمدن القديمة مع جدول الانطلاق اليومي الدقيق والرحلات المنظمة."
              : "Your comprehensive guide to UNESCO World Heritage Sites, Roman & Greek marvels, Sahara desert oases, and ancient fortified towns with live daily departure schedules."}
          </p>

          {/* Quick Stats Strip inside Hero */}
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-bold text-white/90">
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <span className="text-amber-400 font-black text-xs sm:text-sm">5</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "مواقع تراث عالمي (UNESCO)" : "UNESCO World Heritage Sites"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <span className="text-emerald-400 font-black text-xs sm:text-sm">09:00 ص</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "انطلاق يومي منتظم من طرابلس وبنغازي" : "Daily 9:00 AM Departures"}</span>
            </div>
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
              <span className="text-teal-300 font-black text-xs sm:text-sm">{LIBYAN_ATTRACTIONS.length}</span>
              <span className="text-[11px] sm:text-xs">{isAr ? "معالم موثقة وموصوفة" : "Documented Iconic Sites"}</span>
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
        {/* ── UNESCO World Heritage Showcase (Left Aligned Title & Button, Booking.com Blue Theme) ── */}
        <section className="bg-white rounded-[32px] p-6 sm:p-10 text-[#0F172A] shadow-md relative overflow-hidden border border-blue-100">
          {/* Header Row Aligned to Left */}
          <div className="border-b border-blue-100 pb-5 mb-8 flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#003580]/10 text-[#003580] border border-[#003580]/20 text-xs font-black mb-2">
              <span>🏛️</span>
              <span>{isAr ? "مواقع التراث العالمي لليونسكو في ليبيا" : "UNESCO World Heritage Sites"}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#003580]">
              {isAr ? "معالم خالدة مسجلة في قائمة اليونسكو" : "UNESCO World Heritage Masterpieces"}
            </h2>
          </div>

          {/* UNESCO Showcase Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Column 1 (Right in RTL): Stacked Cards Deck */}
            <div className="lg:col-span-5 relative flex flex-col items-center justify-center min-h-[440px] sm:min-h-[480px]">
              <div className="relative w-64 h-[380px] sm:w-[300px] sm:h-[440px] flex items-center justify-center">
                {unescoSites.map((site, idx) => {
                  const total = unescoSites.length;
                  const offset = (idx - unescoDeckIndex + total) % total;

                  let transform = "";
                  let opacity = 0;
                  let zIndex = 0;
                  let pointerEvents: "auto" | "none" = "none";

                  if (offset === 0) {
                    transform = "translateY(0px) translateX(0px) scale(1) rotate(0deg)";
                    opacity = 1;
                    zIndex = 30;
                    pointerEvents = "auto";
                  } else if (offset === 1) {
                    transform = "translateY(14px) translateX(-20px) scale(0.92) rotate(-6deg)";
                    opacity = 0.92;
                    zIndex = 20;
                    pointerEvents = "auto";
                  } else if (offset === 2) {
                    transform = "translateY(24px) translateX(20px) scale(0.85) rotate(6deg)";
                    opacity = 0.75;
                    zIndex = 10;
                    pointerEvents = "auto";
                  } else {
                    transform = "translateY(36px) translateX(0px) scale(0.78) rotate(0deg)";
                    opacity = 0;
                    zIndex = 0;
                    pointerEvents = "none";
                  }

                  return (
                    <div
                      key={site.id}
                      onClick={() => setUnescoDeckIndex(idx)}
                      style={{ transform, opacity, zIndex, pointerEvents }}
                      className="absolute inset-0 rounded-[36px] overflow-hidden border-4 border-white shadow-2xl bg-stone-900 cursor-pointer transition-all duration-300 ease-out group select-none"
                    >
                      <img
                        src={site.img}
                        alt={isAr ? site.name : site.nameEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300 brightness-[1.02] contrast-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />

                      <div className="absolute bottom-4 right-4 left-4 bg-black/50 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-white shadow-md">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#003580] text-white font-black text-[10px]">
                            {isAr ? site.city : site.cityEn}
                          </span>
                          <span className="text-[10px] text-blue-200 font-bold">
                            🏛️ {site.unescoYear || "1982"}
                          </span>
                        </div>
                        <div className="text-sm font-black text-white truncate">
                          {isAr ? site.name : site.nameEn}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Progress Indicator Dots */}
              <div className="flex items-center gap-2 mt-6 z-30">
                {unescoSites.map((site, idx) => (
                  <button
                    key={site.id}
                    type="button"
                    onClick={() => setUnescoDeckIndex(idx)}
                    className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                      unescoDeckIndex === idx
                        ? "w-8 bg-[#003580] shadow-xs"
                        : "w-2 bg-[#E8E2D6] hover:bg-stone-400"
                    }`}
                    title={isAr ? site.city : site.cityEn}
                  />
                ))}
              </div>
            </div>

            {/* Column 2 (Left in RTL): Information Aligned to Left */}
            <div className="lg:col-span-7 space-y-6 flex flex-col items-start text-left">
              {/* Badges Row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1.5 rounded-xl bg-[#003580]/10 text-[#003580] font-black text-xs border border-[#003580]/20 shadow-xs">
                  📜 {isAr ? `مسجل باليونسكو عام ${activeUnescoSite.unescoYear || "1982"}` : `UNESCO ${activeUnescoSite.unescoYear || "1982"}`}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#1B5A78] font-bold text-xs border border-blue-200 shadow-xs">
                  📍 {isAr ? activeUnescoSite.city : activeUnescoSite.cityEn} — {isAr ? activeUnescoSite.region : activeUnescoSite.regionEn}
                </span>
              </div>

              {/* Main City Title */}
              <h3 className="text-3xl sm:text-4xl font-black text-[#003580] leading-tight transition-all duration-300">
                {isAr ? activeUnescoSite.name : activeUnescoSite.nameEn}
              </h3>

              {/* Simple & Elegant Overview / النبذة */}
              <div className="bg-[#F0F4F8] p-5 rounded-2xl border border-blue-100 shadow-xs space-y-2 w-full text-right">
                <div className="text-xs font-black text-[#003580]">
                  {isAr ? "💡 نبذة عن المدينة المعلم:" : "Overview:"}
                </div>
                <p className="text-sm text-[#334155] leading-relaxed font-semibold">
                  "{isAr ? activeUnescoSite.description : activeUnescoSite.descriptionEn}"
                </p>
              </div>

              {/* Book Private Trip Action Button Aligned to Left in Orange */}
              <div className="pt-2 flex justify-start w-full">
                <button
                  type="button"
                  onClick={() => setPrivateTripModalOpen(true)}
                  className="px-8 py-4 rounded-2xl bg-[#D96B27] hover:bg-[#C25B1E] text-white font-black text-sm shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer flex items-center gap-3 border border-orange-400/30"
                >
                  <span>{isAr ? "حجز رحلة خاصة لهذه المدينة" : "Book Private Tour to this City"}</span>
                  <span className="text-lg">🧭</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Daily Trip Departure System Notice ── */}
        <section className="bg-gradient-to-r from-amber-50/80 via-white to-orange-50/50 rounded-3xl p-5 border border-[#E6E1D6] shadow-soft flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#D96B27]/10 text-[#D96B27] text-2xl font-black grid place-items-center shrink-0 border border-[#D96B27]/20 shadow-xs">
              ☀️
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#0B132B] flex items-center gap-2">
                <span>{isAr ? "مواعيد ونقاط الانطلاق اليومية المنظمة" : "Organized Daily Departure Schedules"}</span>
                <span className="text-[10px] bg-[#D96B27]/10 text-[#D96B27] font-black px-2.5 py-0.5 rounded-full border border-[#D96B27]/20">
                  {isAr ? "09:00 صباحاً يومياً" : "09:00 AM Daily"}
                </span>
              </h3>
              <p className="text-xs text-[#526078] mt-1 leading-relaxed">
                {isAr
                  ? "تنطلق رحلات معالم المنطقة الغربية (لبدة الكبرى، صبراتة، السراي الحمراء) من طرابلس الساعة 9:00 ص، ورحلات معالم الجبل الأخضر (شحات وقورينا، أبولونيا) من بنغازي الساعة 9:00 ص شاملة النقل السياحي المكيف والمرشد المعتمد."
                  : "Western region tours (Leptis Magna, Sabratha, Red Castle) depart from Tripoli at 9:00 AM. Eastern tours (Cyrene, Apollonia) depart from Benghazi at 9:00 AM with luxury transport and certified guides."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              onClick={() => setPrivateTripModalOpen(true)}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white font-black text-xs shadow-soft transition flex items-center justify-center gap-2"
            >
              <span>👑</span>
              <span>{isAr ? "طلب رحلة خاصة مخصصة" : "Request Custom Tour"}</span>
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
          {cityViewMode === "carousel" ? (
            <div ref={cityCarouselRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth py-3 px-1">
              {LIBYAN_CITIES.map((city) => (
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

                  {/* Top Overlay: Wishlist Heart Button Only */}
                  <div className="absolute top-5 right-5 left-5 flex items-center justify-between text-white">
                    <div />
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 grid place-items-center text-white hover:text-red-500 hover:scale-110 transition cursor-pointer shadow-md"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
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
              {LIBYAN_CITIES.map((city) => (
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

                  {/* Top Overlay: Wishlist Heart Button Only */}
                  <div className="absolute top-5 right-5 left-5 flex items-center justify-between text-white">
                    <div />
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/20 grid place-items-center text-white hover:text-red-500 hover:scale-110 transition cursor-pointer shadow-md"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
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

      {/* ── Details, Booking, and Private Modals ── */}
      <DetailsModal
        open={!!modals.detailsItem}
        onClose={modals.closeDetails}
        item={modals.detailsItem}
        onBook={() => {
          modals.closeDetails();
          setBookingTripModalOpen(true);
        }}
      />

      <BookingModal
        open={bookingTripModalOpen}
        onClose={() => setBookingTripModalOpen(false)}
        item={{
          title: selectedAttraction ? (isAr ? selectedAttraction.name : selectedAttraction.nameEn) : (isAr ? "رحلة معالم ليبيا اليومية" : "Libya Landmarks Daily Tour"),
          subtitle: selectedAttraction ? (isAr ? `${selectedAttraction.city} — تنطلق 09:00 صباحاً` : `${selectedAttraction.cityEn} — Departs 09:00 AM`) : "",
          price: selectedAttraction?.approxTripPrice || 180,
          departure: selectedAttraction?.departureCity ? (isAr ? `فرع منصة دلّني (${selectedAttraction.departureCity})` : `Dallani Branch (${selectedAttraction.departureCityEn})`) : (isAr ? "فرع طرابلس الرئيسي" : "Tripoli Main Office"),
          image: selectedAttraction?.img || "",
          img: selectedAttraction?.img || "",
          details: isAr
            ? "رحلة يومية لزيارة المعلم السياحي شاملة النقل المكيف، المرشد المعتمد، وتذاكر الدخول من 9:00 ص وحتى 9:00 م."
            : "Full day tour including luxury air-conditioned transport, certified tour guide, and entry tickets from 09:00 AM to 09:00 PM.",
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
        onBookDaily={() => {
          setSelectedCityForModal(null);
          setBookingTripModalOpen(true);
        }}
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

function LandmarkDetailsModal({
  city,
  onClose,
  onBookDaily,
  onBookPrivate,
}: {
  city: CityDestinationItem | null;
  onClose: () => void;
  onBookDaily: () => void;
  onBookPrivate: () => void;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [activeModalTab, setActiveModalTab] = useState<"history" | "highlights" | "trips">("history");
  const [showPromo, setShowPromo] = useState(true);

  if (!city) return null;

  const photo = city.img || heroImg;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xl animate-fade-in" dir={dir}>
      <div className="bg-slate-950/95 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-white/20 max-h-[92vh] flex flex-col relative text-slate-100 backdrop-blur-2xl">
        
        {/* 1. Single Elegant Hero Photo Showcase */}
        <div className="relative h-72 sm:h-96 md:h-[430px] w-full overflow-hidden bg-slate-950 shrink-0 group">
          <img
            src={photo}
            alt={city.name}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-black/60 pointer-events-none" />

          {/* Floating Top Controls */}
          <div className="absolute top-4 right-4 left-4 z-30 flex items-center justify-between">
            <span className="bg-black/70 backdrop-blur-md text-white text-xs font-black px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl flex items-center gap-1.5">
              <span>🏛️</span>
              <span>{isAr ? "معلم سياحي موثق" : "Verified Landmark"}</span>
            </span>

            <button
              type="button"
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-white hover:text-slate-950 flex items-center justify-center transition cursor-pointer shadow-2xl border border-white/20"
              title={isAr ? "إغلاق" : "Close"}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Title Overlay */}
          <div className="absolute bottom-4 right-4 left-4 z-20 flex flex-col sm:flex-row sm:items-end justify-between gap-3 text-white">
            <div className="drop-shadow-lg space-y-1">
              <div className="text-xl sm:text-3xl font-black text-white">{isAr ? city.name : city.nameEn}</div>
              <div className="text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2">
                <span>✨</span>
                <span>{isAr ? city.subtitle : city.subtitleEn}</span>
              </div>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/20 text-xs font-bold text-slate-200">
              📍 {city.region}
            </div>
          </div>
        </div>

        {/* 2. Scrollable Body Content Below Showcase */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-right">
          
          {/* Header Section: City Title + Region Badges + Rating */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#003580] text-white font-black text-xs shadow-md border border-blue-400/30">
                📍 {city.region}
              </span>
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-black text-xs border border-amber-400/30 shadow-xs">
                🏛️ {isAr ? city.categoryTag : city.categoryTagEn}
              </span>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 text-amber-300 border border-white/10 text-xs font-black">
                <span className="bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded-md font-black text-[11px]">
                  {city.rating}
                </span>
                <span>{city.ratingLabel}</span>
                <span className="text-slate-400 font-medium text-[11px]">({city.reviewsCount} تقييم)</span>
              </div>
            </div>

            {/* Google Maps link button */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(city.mapQuery || city.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-amber-300 font-black text-xs border border-white/15 shadow-md flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>🗺️</span>
              <span>{isAr ? "عرض الموقع في خرائط Google ↗" : "View Map ↗"}</span>
            </a>
          </div>

          {/* Interactive Modal Tab Switcher */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            {[
              { id: "history", label: isAr ? "📖 نبذة وتاريخ المعلم" : "History & Heritage", icon: "🏛️" },
              { id: "highlights", label: isAr ? "✨ أبرز ٤ محطات وتجارب" : "Top 4 Highlights", icon: "⭐" },
              { id: "trips", label: isAr ? "🧭 تفاصيل الرحلات والوصول" : "Tours & Access", icon: "🚌" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveModalTab(tab.id as any)}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeModalTab === tab.id
                    ? "bg-gradient-to-r from-[#003580] to-blue-600 text-white shadow-md border border-blue-400/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
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
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-2">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <span>📖</span>
                  <span>{isAr ? "عن المعلم وأهميته التاريخية:" : "About the Landmark & Heritage:"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                  {isAr ? city.description : city.descriptionEn}
                </p>
              </div>

              {/* VIP Offer Card */}
              {showPromo && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-blue-900/40 to-slate-900 border border-amber-400/30 flex items-center justify-between gap-3 text-xs relative shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                      🎁
                    </div>
                    <div>
                      <span className="font-black text-xs sm:text-sm block text-amber-300">
                        {isAr ? `عروض ترويجية حصرية للفنادق والمطاعم في ${city.shortName}` : `Exclusive Hotel & Dining Offers in ${city.shortNameEn}`}
                      </span>
                      <span className="text-slate-300 text-[11px] sm:text-xs">
                        {isAr ? "خصم 20% على الإقامة والمأكولات بالتعاون مع حجز الفنادق والمطاعم لعملاء دلّني." : "20% discount on stays and local restaurants for Dallani travelers."}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPromo(false)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-xs cursor-pointer transition shrink-0"
                    title={isAr ? "إغلاق العرض" : "Dismiss"}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Highlights & Top Landmarks Section (Exactly 4 Cards with Elite Design) */}
          {activeModalTab === "highlights" && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-amber-400 flex items-center gap-2">
                  <span>✨</span>
                  <span>{isAr ? "أبرز المعالم والمحطات الرئيسية (٤ محطات):" : "Top 4 Highlights & Stations:"}</span>
                </h4>
                <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {isAr ? "معالم موثقة 100%" : "Verified 100%"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {city.highlights.slice(0, 4).map((hl, idx) => {
                  const icons = ["🏛️", "🌊", "🏺", "🌴"];
                  return (
                    <div
                      key={idx}
                      className="group relative p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/50 shadow-md transition-all duration-300 flex items-center gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003580] to-blue-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        <span>{icons[idx % icons.length]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-black text-amber-300 uppercase tracking-wider">
                          <span>{isAr ? `المعلم ${idx + 1}` : `Station #${idx + 1}`}</span>
                        </div>
                        <span className="text-xs sm:text-sm font-black text-white leading-snug block truncate mt-0.5 group-hover:text-amber-300 transition-colors">
                          {hl}
                        </span>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-white/10 text-emerald-400 flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Tours & Linked Daily Trips */}
          {activeModalTab === "trips" && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {city.hasDailyTrip ? (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border border-amber-400/30 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs shadow-md">
                      ☀️ {isAr ? "رحلة يومية منتظمة (يومان في الأسبوع)" : "Scheduled Daily Tour (2 Days a Week)"}
                    </span>
                    <span className="text-xs font-bold text-amber-200">{isAr ? "انطلاق الساعة 09:00 صباحاً" : "Departs 09:00 AM"}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 font-semibold leading-relaxed pt-1">
                    {isAr ? city.dailyTripsInfo : city.dailyTripsInfoEn}
                  </p>
                </div>
              ) : (
                <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                  <div className="text-sm font-black text-amber-300">
                    🧭 {isAr ? "رحلات استكشافية خاصة وأسبوعية" : "Private & Expedition Tours"}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-normal">
                    {isAr ? city.dailyTripsInfo : city.dailyTripsInfoEn}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Action Buttons */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div>
            {city.hasDailyTrip ? (
              <button
                type="button"
                onClick={onBookDaily}
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-[#003580] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white font-black text-xs sm:text-sm shadow-xl transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
              >
                <span>☀️</span>
                <span>{isAr ? "الاطلاع على الرحلات اليومية المتوفرة لهذه الوجهة" : "View Daily Tours for this Landmark"}</span>
              </button>
            ) : (
              <span className="text-xs font-bold text-slate-400">
                {isAr ? "رحلات خاصة وسفاري حصرية لهذا المعلم" : "Exclusive Private Expedition Only"}
              </span>
            )}
          </div>

          {/* Private Trip Button (Golden/Orange) */}
          <button
            type="button"
            onClick={onBookPrivate}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-[#D96B27] hover:from-amber-400 hover:to-orange-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <span>🧭</span>
            <span>{isAr ? "إنشاء رحلة خاصة لهذا المعلم (مع اختيار المرشد والمركبة)" : "Create Custom Trip for this Landmark"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

