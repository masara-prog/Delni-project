import destTripoli from "@/assets/dest-tripoli.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destSabratah from "@/assets/dest-sabratha.jpg";
import destGharyanCave from "@/assets/dest-gharyan-cave.jpg";
import destKsarDesert from "@/assets/dest-ksar-desert.jpg";
import destTripoliOldCity from "@/assets/dest-tripoli-old-city.jpg";
import destHarborCoast from "@/assets/dest-harbor-coast.jpg";
import destJabalAkhdar from "@/assets/dest-jabal-akhdar.jpg";
import destJabalAkhdarPanorama from "@/assets/dest-jabal-akhdar-panorama.jpg";
import destJabalAkhdarForest from "@/assets/dest-jabal-akhdar-forest.jpg";
import destJabalAkhdarBridge from "@/assets/dest-jabal-akhdar-bridge.jpg";
import destJabalAkhdarValley from "@/assets/dest-jabal-akhdar-valley.jpg";
import destJabalAkhdarPass from "@/assets/dest-jabal-akhdar-pass.jpg";
import destUbariGaberoun from "@/assets/dest-ubari-gaberoun.jpg";
import destUbariUmmAlMaa from "@/assets/dest-ubari-ummalmaa.jpg";
import destAcacusArch from "@/assets/dest-acacus-arch.jpg";
import destSaharaDunes from "@/assets/dest-sahara-dunes.jpg";
import offerDesert from "@/assets/offer-desert.jpg";
import restaurantImg from "@/assets/restaurant-libya.jpg";
import cafeImg from "@/assets/cafe-libya.jpg";
import privateTripImg from "@/assets/private-trip.jpg";
import officeBusImg from "@/assets/office-bus.jpg";
import heroImg from "@/assets/hero-leptis.jpg";

export {
  destJabalAkhdar,
  destJabalAkhdarPanorama,
  destJabalAkhdarForest,
  destJabalAkhdarBridge,
  destJabalAkhdarValley,
  destJabalAkhdarPass,
  destUbariGaberoun,
  destUbariUmmAlMaa,
  destAcacusArch,
  destSaharaDunes,
};

export const getDestinations = (lang: string) => [
  { 
    name: lang === 'ar' ? "طرابلس" : "Tripoli", 
    tag: lang === 'ar' ? "المدينة القديمة وقوس ماركوس" : "Old City & Marcus Arch", 
    img: destTripoli, 
    count: lang === 'ar' ? "218 مكان إقامة" : "218 Stays", 
    price: lang === 'ar' ? "من 180 د.ل" : "From 180 LYD",
    description: lang === 'ar' 
      ? "طرابلس العاصمة النابضة بالحياة. استكشف السرايا الحمراء، قوس الإمبراطور ماركوس أوريليوس الروماني، أزقة جامع قرجي والأسواق العتيقة، وتناول الوجبات البحرية اللذيذة على الكورنيش."
      : "Tripoli, the vibrant capital. Explore the Red Castle, Marcus Aurelius Roman Arch, Gurgi Mosque alleys, and enjoy delicious seafood by the Mediterranean corniche.",
    features: lang === 'ar'
      ? ["📍 قوس ماركوس أوريليوس", "📍 السرايا الحمراء والمدينة القديمة", "📍 جامع قرجي وسوق العطارين", "📍 كورنيش وميناء طرابلس", "🏨 فنادق 5 نجوم متوفرة", "🚗 خدمات نقل مكيفة مخصصة", "🍽️ مطاعم شعبية وبحرية عريقة"]
      : ["📍 Marcus Aurelius Arch", "📍 Red Castle Citadel", "📍 Historic Gurgi Mosque", "📍 Tripoli Corniche & Port", "🏨 5-star Hotels", "🚗 AC Transfers", "🍽️ Local & Seafood Restaurants"]
  },
  { 
    name: lang === 'ar' ? "صبراتة" : "Sabratha", 
    tag: lang === 'ar' ? "المسرح الروماني الساحلي" : "Seaside Roman Amphitheater", 
    img: destSabratah, 
    count: lang === 'ar' ? "28 جولة سياحية" : "28 Tours", 
    price: lang === 'ar' ? "من 150 د.ل" : "From 150 LYD",
    description: lang === 'ar'
      ? "جوهرة الساحل الفينيقي والروماني. يشتهر مسرحها الروماني الأيقوني ذو الثلاثة طوابق من الأعمدة الرخامية البديعة المطلة مباشرة على زرقة البحر المتوسط."
      : "Jewel of the Phoenician and Roman coast. Renowned for its iconic three-tiered coastal Roman amphitheater with marble columns facing the azure Mediterranean horizon.",
    features: lang === 'ar'
      ? ["📍 المسرح الروماني المكون من 3 طوابق", "📍 معبد إيزيس ومعبد هرقل", "📍 متحف الفسيفساء والمرفأ الفينيقي", "🚗 انطلاق يومي بحافلات سياحية VIP", "🍽️ وجبات سمك طازجة على البحر"]
      : ["📍 3-Tiered Roman Amphitheater", "📍 Temples of Isis & Hercules", "📍 Sabratha Mosaic Museum", "🚗 Daily VIP Departures", "🍽️ Fresh Seafood Lunches"]
  },
  { 
    name: lang === 'ar' ? "بحيرات أوباري" : "Ubari Lakes", 
    tag: lang === 'ar' ? "قبرعون وأم الماء" : "Gaberoun & Desert Lakes", 
    img: destUbariGaberoun, 
    count: lang === 'ar' ? "42 رحلة مغامرة" : "42 Adventure Trips", 
    price: lang === 'ar' ? "من 950 د.ل" : "From 950 LYD",
    description: lang === 'ar'
      ? "عالم أسطوري من الواحات المائية وسط بحر الرمال الذهبية. زر بحيرة قبرعون ذات الانعكاس المرآتي الساحر، وبحيرة أم الماء المحاطة بالنخيل، وتزلج على الكثبان الرملية الشاهقة."
      : "A legendary world of desert lakes amid golden dunes. Visit mirror-like Gaberoun Lake, palm-fringed Umm al-Maa, and enjoy dunes sandboarding under the stars.",
    features: lang === 'ar'
      ? ["📍 بحيرة قبرعون ذات الانعكاس المرآتي", "📍 بحيرة أم الماء وواحات النخيل", "📍 التزلج على رمال الكثبان الذهبية", "⛺ مخيمات صحراوية فاخرة ومريحة", "🚗 سيارات دفع رباعي 4x4", "🧭 مرشدون محليون طوارق", "🍽️ وجبات شواء بدوية تقليدية"]
      : ["📍 Gaberoun Mirror-Reflection Lake", "📍 Palm-Fringed Umm al-Maa Oasis", "📍 Sandboarding on Golden Dunes", "⛺ Luxury Desert Camping", "🚗 4x4 Desert Safari Vehicles", "🧭 Local Tuareg Guides", "🍽️ Traditional Bedouin BBQ"]
  },
  { 
    name: lang === 'ar' ? "غدامس" : "Ghadames", 
    tag: lang === 'ar' ? "لؤلؤة الصحراء" : "Pearl of the Desert", 
    img: destGhadames, 
    count: lang === 'ar' ? "36 مكان إقامة" : "36 Stays", 
    price: lang === 'ar' ? "من 320 د.ل" : "From 320 LYD",
    description: lang === 'ar'
      ? "مدينة غدامس الأثرية المسجلة كأحد مواقع التراث العالمي. استكشف المنازل التقليدية ذات العمارة الفريدة والواحات التاريخية وعين الفرس."
      : "The ancient city of Ghadames, a UNESCO World Heritage site. Explore traditional homes with unique architecture, historic oases, and Ain al-Faras.",
    features: lang === 'ar'
      ? ["📍 المدينة القديمة المغطاة", "📍 عين الفرس التاريخية", "📍 متحف غدامس للتراث", "🏨 دور ضيافة تراثية دافئة", "🧭 مرشدون محليون متخصصون", "🍽️ عشاء فلكلوري تقليدي"]
      : ["📍 Covered Old City", "📍 Historic Ain al-Faras", "📍 Ghadames Heritage Museum", "🏨 Warm Heritage Guesthouses", "🧭 Specialized Local Guides", "🍽️ Traditional Folklore Dinner"]
  },
  { 
    name: lang === 'ar' ? "الجبل الأخضر وقورينا" : "Green Mountain & Cyrene", 
    tag: lang === 'ar' ? "غابات الصنوبر وبانوراما البحر" : "Pine Forests & Sea Panorama", 
    img: destJabalAkhdarPanorama, 
    count: lang === 'ar' ? "35 جولة سياحية" : "35 Tours", 
    price: lang === 'ar' ? "من 240 د.ل" : "From 240 LYD",
    description: lang === 'ar'
      ? "طبيعة الجبل الأخضر الخلابة وموطن الحضارة الإغريقية في قورينا (شحات). شاهد معبد أبولو الأثري المطل على البحر، جسر وادي الكوف الأيقوني، وغابات الصنوبر والعرعر الفاتنة."
      : "The breathtaking landscapes of the Green Mountain and ancient Cyrene. Discover Apollo's sanctuary facing the Mediterranean, the iconic Wadi Al-Kuf bridge, and virgin pine forests.",
    features: lang === 'ar'
      ? ["📍 بانوراما معبد أبولو ومدرج قورينا على قمة الجبل", "📍 جسر وادي الكوف والوديان المعلقة", "📍 غابات الصنوبر والعرعر الفينيقي", "📍 شلالات شحات ورأس الهلال", "🏨 منتجعات جبلية ممتازة", "🚗 سيارات رحلات مجهزة للجبال", "🍽️ مطاعم ومشاوي الجبل الأخضر"]
      : ["📍 Cyrene Apollo Sanctuary & Sea Panorama", "📍 Wadi Al-Kuf Monumental Canyon Bridge", "📍 Pristine Pine & Juniper Forests", "📍 Shahat & Ras Al-Helal Waterfalls", "🏨 Excellent Mountain Resorts", "🚗 Mountain-Ready Tour Vehicles", "🍽️ Green Mountain BBQ & Dining"]
  },
  { 
    name: lang === 'ar' ? "جبال أكاكوس" : "Acacus Mountains", 
    tag: lang === 'ar' ? "قوس تكهوري والنقوش" : "Takarkori Arch & Rock Art", 
    img: destAcacusArch, 
    count: lang === 'ar' ? "18 رحلة سفاري" : "18 Safaris", 
    price: lang === 'ar' ? "من 1200 د.ل" : "From 1200 LYD",
    description: lang === 'ar'
      ? "متحف مفتوح في قلب الصحراء الكبرى مسجل باليونسكو. شاهد قوس تكهوري الصخري العملاق والتكوينات الحجرية والرسوم الصخرية التي تعود لـ 12 ألف عام."
      : "A UNESCO open-air desert museum. Marvel at the colossal Takarkori Rock Arch, surreal sandstone cathedrals, and prehistoric cave art dating back 12,000 years.",
    features: lang === 'ar'
      ? ["📍 قوس تكهوري الصخري العملاق", "📍 كهوف ونقوش ما قبل التاريخ باليونسكو", "📍 رمال العوينات وعروق مرزق الذهبية", "⛺ مخيمات صحراوية وسهرات طوارق", "🚗 سيارات دفع رباعي مجهزة للصحراء", "🧭 أدلاء صحراويون خبراء"]
      : ["📍 Massive Takarkori Rock Arch", "📍 UNESCO Prehistoric Rock Art", "📍 Colorful Murzuk & Oweinat Dunes", "⛺ Desert Camps & Tuareg Music", "🚗 Heavy-Duty 4x4 Safari Vehicles", "🧭 Expert Desert Guides"]
  },
  { 
    name: lang === 'ar' ? "غريان وجبل نفوسة" : "Gharyan & Jebel Nafusa", 
    tag: lang === 'ar' ? "بيوت الحفر وقلاع الأمازيغ" : "Cave Houses & Ksars", 
    img: destGharyanCave, 
    count: lang === 'ar' ? "22 جولة تراثية" : "22 Heritage Tours", 
    price: lang === 'ar' ? "من 110 د.ل" : "From 110 LYD",
    description: lang === 'ar'
      ? "استكشف بيوت الحفر التراثية المحفورة تحت الأرض في غريان والتي توفر جواً طبيعياً معتدلاً طوال العام، وقصور نالوت وقصر الحاج الحجرية الشاهقة."
      : "Discover Gharyan's underground troglodyte cave houses keeping natural year-round cool temperatures, alongside historic Berber cliffside ksars in Nalut and Kabaw.",
    features: lang === 'ar'
      ? ["📍 بيوت الحفر التراثية بغريان", "📍 قصور وقلاع نالوت وكاباو", "📍 مصانع الفخار والخزف التقليدي", "🚗 رحلات جبلية يومية مجهزة", "🍽️ أكلات شعبية وزيت زيتون جبلي"]
      : ["📍 Gharyan Underground Caves", "📍 Nalut & Kabaw Granaries", "📍 Traditional Pottery Workshops", "🚗 Mountain Tour Vehicles", "🍽️ Local Mountain Dishes"]
  },
  { 
    name: lang === 'ar' ? "لبدة الكبرى" : "Leptis Magna", 
    tag: lang === 'ar' ? "المدرج الروماني" : "Roman Amphitheater", 
    img: heroImg, 
    count: lang === 'ar' ? "31 جولة تراثية" : "31 Heritage Tours", 
    price: lang === 'ar' ? "من 220 د.ل" : "From 220 LYD",
    description: lang === 'ar'
      ? "أكبر مدينة رومانية أثرية في أفريقيا. تجول في الفوروم الروماني والمسرح الضخم وقوس نصر سيبتيموس سيفيروس، على بعد خطوات من شاطئ البحر."
      : "The largest Roman archaeological city in Africa. Wander through the Roman Forum, the massive theater, and the Arch of Septimius Severus, steps from the sea.",
    features: lang === 'ar'
      ? ["📍 المسرح الروماني الضخم", "📍 حمامات هادريان الأثرية", "📍 قوس سيبتيموس سيفيروس", "🏨 فنادق قريبة مريحة", "🚗 نقل مباشر من العاصمة طرابلس", "🍽️ وجبات غداء بحرية طازجة"]
      : ["📍 Massive Roman Theater", "📍 Hadrian's Baths", "📍 Arch of Septimius Severus", "🏨 Comfortable Nearby Hotels", "🚗 Direct Transport from Tripoli", "🍽️ Fresh Seafood Lunches"]
  },
];

export const getPopularTrips = (lang: string) => [
  { 
    name: lang === 'ar' ? "جولة مسرح وآثار صبراتة" : "Sabratha Roman Theatre Tour", 
    tag: lang === 'ar' ? "يومية" : "Daily", 
    tripType: lang === 'ar' ? "رحلة يومية" : "Daily Trip", 
    img: destSabratah, 
    duration: lang === 'ar' ? "يوم كامل" : "Full Day", 
    price: lang === 'ar' ? "من 150 د.ل" : "From 150 LYD",
    description: lang === 'ar'
      ? "رحلة يومية ساحلية تنطلق من طرابلس إلى مسرح صبراتة الروماني الساحلي ذو الأعمدة الثلاثية الطوابق مع زيارة المتحف الأثري والغداء البحري."
      : "A daily coastal excursion from Tripoli to the majestic 3-tiered Sabratha Roman theatre, Phoenician museum, and seaside lunch.",
    features: lang === 'ar' ? ["المسرح الروماني والمتحف", "غداء بحري فاخر", "مرشد أثري معتمد"] : ["Roman Amphitheater & Museum", "Seaside Lunch", "Certified Guide"],
    schedules: [
      { id: "pop-sab", date: lang === 'ar' ? "كل خميس وسبت" : "Every Thu & Sat", time: "09:00 AM", seats: 20, taken: 8, guide: lang === 'ar' ? "عادل الزواوي" : "Adel Al-Zawawi", price: 150 },
    ]
  },
  { 
    name: lang === 'ar' ? "رحلة بيوت حفر غريان وجبل نفوسة" : "Gharyan Caves & Nafusa Trip", 
    tag: lang === 'ar' ? "يومية" : "Daily", 
    tripType: lang === 'ar' ? "رحلة يومية" : "Daily Trip", 
    img: destGharyanCave, 
    duration: lang === 'ar' ? "يوم كامل" : "Full Day", 
    price: lang === 'ar' ? "من 110 د.ل" : "From 110 LYD",
    description: lang === 'ar'
      ? "جولة جبلية مشوقة لاستكشاف بيوت الحفر التراثية في غريان وورش الفخار اليدوي وقصر الحاج وقصور نالوت المعلقة."
      : "An exciting mountain excursion visiting Gharyan's troglodyte cave dwellings, handmade pottery souks, and historic Nafusa ksars.",
    features: lang === 'ar' ? ["زيارة بيوت الحفر", "ورش الفخار والقصور", "غداء جبلي تقليدي"] : ["Cave Dwellings", "Pottery Souk & Ksars", "Traditional Mountain Lunch"],
    schedules: [
      { id: "pop-ghr", date: lang === 'ar' ? "كل سبت وأحد" : "Every Sat & Sun", time: "08:30 AM", seats: 18, taken: 7, guide: lang === 'ar' ? "أحمد الغرياني" : "Ahmed Al-Gharyani", price: 110 },
    ]
  },
  { 
    name: lang === 'ar' ? "رحلة صحراء أوباري وغدامس" : "Ubari & Ghadames Desert Trip", 
    tag: lang === 'ar' ? "أسبوعية" : "Weekly", 
    tripType: lang === 'ar' ? "رحلة أسبوعية" : "Weekly Trip", 
    img: destUbariGaberoun, 
    duration: lang === 'ar' ? "5 أيام" : "5 Days", 
    price: lang === 'ar' ? "من 1,200 د.ل" : "From 1,200 LYD",
    description: lang === 'ar'
      ? "رحلة أسبوعية شاملة الانطلاق من طرابلس لزيارة لؤلؤة الصحراء غدامس ثم التوجه نحو رمال وبحيرات أوباري الساحرة."
      : "A comprehensive weekly trip departing from Tripoli to visit Ghadames, the Pearl of the Desert, and then heading to the enchanting sands and lakes of Ubari.",
    features: lang === 'ar' ? ["شامل المواصلات", "إقامة في مخيم وفندق", "وجبات كاملة"] : ["Transport Included", "Camp & Hotel Stay", "All Meals"],
    schedules: [
      { id: "pop-1", date: lang === 'ar' ? "الخميس 1 أغسطس 2026" : "Thu 1 Aug 2026", time: "06:00 AM", seats: 15, taken: 10, guide: lang === 'ar' ? "أحمد سعيد" : "Ahmed Saeed", price: 1200 },
    ]
  },
  { 
    name: lang === 'ar' ? "جولة لبدة الكبرى" : "Leptis Magna Tour", 
    tag: lang === 'ar' ? "يومية" : "Daily", 
    tripType: lang === 'ar' ? "رحلة يومية" : "Daily Trip", 
    img: heroImg, 
    duration: lang === 'ar' ? "يوم كامل" : "Full Day", 
    price: lang === 'ar' ? "من 180 د.ل" : "From 180 LYD",
    description: lang === 'ar'
      ? "جولة يومية مميزة في مدينة لبدة الكبرى الرومانية التاريخية، تتضمن الغداء البحري والاستمتاع بمعالم المدينة الخلابة."
      : "A wonderful daily tour in the historic Roman city of Leptis Magna, including a seafood lunch and enjoying the stunning city landmarks.",
    features: lang === 'ar' ? ["تذاكر الدخول", "غداء بحري", "مرشد سياحي مختص"] : ["Entry Tickets", "Seafood Lunch", "Specialized Guide"],
    schedules: [
      { id: "pop-2", date: lang === 'ar' ? "السبت 3 أغسطس 2026" : "Sat 3 Aug 2026", time: "08:30 AM", seats: 20, taken: 12, guide: lang === 'ar' ? "خالد وليد" : "Khaled Walid", price: 180 },
    ]
  },
  { 
    name: lang === 'ar' ? "استكشاف الجبل الأخضر وشحات" : "Green Mountain & Shahat Exploration", 
    tag: lang === 'ar' ? "أسبوعية" : "Weekly", 
    tripType: lang === 'ar' ? "رحلة أسبوعية" : "Weekly Trip", 
    img: destJabalAkhdarPanorama, 
    duration: lang === 'ar' ? "4 أيام" : "4 Days", 
    price: lang === 'ar' ? "من 950 د.ل" : "From 950 LYD",
    description: lang === 'ar'
      ? "رحلة غامرة لمدة ٤ أيام في طبيعة الجبل الأخضر الفاتنة وغابات الصنوبر وآثار قورينا الإغريقية المطلة على البحر."
      : "An immersive 4-day journey through the breathtaking nature of the Green Mountain, ancient Cyrene sanctuaries, and pine forests.",
    features: lang === 'ar' ? ["طيران داخلي (اختياري)", "إقامة منتجع جبلي", "جولات وادي الكوف وقورينا"] : ["Domestic Flight (Opt)", "Resort Stay", "Wadi Al-Kuf & Cyrene Tours"],
    schedules: [
      { id: "pop-grn", date: lang === 'ar' ? "كل أربعاء" : "Every Wednesday", time: "07:30 AM", seats: 16, taken: 9, guide: lang === 'ar' ? "مريم الفيتوري" : "Mariam Al-Fitouri", price: 950 },
    ]
  },
  { 
    name: lang === 'ar' ? "مغامرة طبيعة الجبل الأخضر ووادي الكوف" : "Wadi Al-Kuf & Green Mountain Nature Tour", 
    tag: lang === 'ar' ? "يومية" : "Daily", 
    tripType: lang === 'ar' ? "رحلة يومية" : "Daily Trip", 
    img: destJabalAkhdarBridge, 
    duration: lang === 'ar' ? "يوم كامل" : "Full Day", 
    price: lang === 'ar' ? "من 160 د.ل" : "From 160 LYD",
    description: lang === 'ar'
      ? "جولة استكشافية ليوم كامل في غابات الصنوبر والعرعر الطبيعية، وزيارة جسر وادي الكوف المعلق الشاهق، والمطلات الجبلية الساحرة."
      : "A full-day eco-adventure exploring virgin pine forests, the magnificent Wadi Al-Kuf canyon bridge, and panoramic viewpoints.",
    features: lang === 'ar' ? ["زيارة جسر وادي الكوف", "مسارات المشي بالغابات", "غداء مشويات جبلية"] : ["Wadi Al-Kuf Bridge", "Forest Trail Walk", "Mountain BBQ Lunch"],
    schedules: [
      { id: "pop-wkuf", date: lang === 'ar' ? "كل جمعة وسبت" : "Every Fri & Sat", time: "08:00 AM", seats: 18, taken: 6, guide: lang === 'ar' ? "خالد بن يونس" : "Khaled Ben Younis", price: 160 },
    ]
  },
  { 
    name: lang === 'ar' ? "يوم في طرابلس القديمة" : "A Day in Old Tripoli", 
    tag: lang === 'ar' ? "يومية" : "Daily", 
    tripType: lang === 'ar' ? "رحلة يومية" : "Daily Trip", 
    img: destTripoli, 
    duration: lang === 'ar' ? "نصف يوم" : "Half Day", 
    price: lang === 'ar' ? "من 75 د.ل" : "From 75 LYD",
    description: lang === 'ar'
      ? "جولة نصف يوم مشياً على الأقدام في أزقة المدينة القديمة، قوس ماركوس أوريليوس، والسرايا الحمراء والأسواق الشعبية، وتنتهي بقهوة في مقهى تراثي."
      : "A half-day walking tour in the alleys of the old city, Marcus Aurelius Arch, Red Castle, and traditional markets, ending with coffee at a heritage cafe.",
    features: lang === 'ar' ? ["مشروب محلي", "مرشد مرافق", "جولة مشي"] : ["Local Drink", "Escorting Guide", "Walking Tour"],
    schedules: [
      { id: "pop-4", date: lang === 'ar' ? "كل جمعة" : "Every Friday", time: "03:00 PM", seats: 10, taken: 5, guide: lang === 'ar' ? "منى مصطفى" : "Mona Mustafa", price: 75 },
    ]
  },
];

export const getOffers = (lang: string) => [
  {
    title: lang === 'ar' ? "عرض رحلة أوباري والأهرامات الصحراوية الأسبوعية" : "Ubari & Desert Pyramids Weekly Trip Offer",
    sub: lang === 'ar' ? "برنامج ٥ أيام شامل الإقامة والنقل بالجنوب" : "5-Day Program including accommodation and transport in the South",
    oldPrice: "2,400",
    price: "1,650",
    tag: lang === 'ar' ? "خصم 30%" : "30% Off",
    img: destUbariUmmAlMaa,
    kind: "trip" as const,
    tripKind: "weekly" as const,
    departure: lang === 'ar' ? "مكتب طرابلس" : "Tripoli Office",
    perk: lang === 'ar' ? "🎁 جلسة تصوير احترافية مجانية وتزلج رملي" : "🎁 Free professional photoshoot and sandboarding",
    entertainment: lang === 'ar' ? "سهرة موسيقى طوارق شعبية، شواء بدوي، تزلج على الكثبان الرملية الذهبية" : "Traditional Tuareg music night, Bedouin BBQ, sandboarding on golden dunes",
    schedules: [
      { id: "o1-s1", date: lang === 'ar' ? "السبت 26 يوليو 2026" : "Sat 26 July 2026", time: "07:00 AM", seats: 12, taken: 4, guide: lang === 'ar' ? "طارق التواتي (خبير طوارق)" : "Tariq Al-Tawati (Tuareg Expert)", price: 1650 },
      { id: "o1-s2", date: lang === 'ar' ? "السبت 2 أغسطس 2026" : "Sat 2 Aug 2026", time: "07:00 AM", seats: 12, taken: 6, guide: lang === 'ar' ? "أحمد الفيتوري" : "Ahmed Al-Fitouri", price: 1650 },
    ]
  },
  {
    title: lang === 'ar' ? "عرض رحلة لبدة الكبرى والمسرح الروماني اليومية" : "Leptis Magna & Roman Theater Daily Trip",
    sub: lang === 'ar' ? "يوم ترفيهي ثقافي كامل يشمل الغداء الفاخر وشواطئ الخمس" : "Full cultural fun day including luxury lunch and Khoms beaches",
    oldPrice: "260",
    price: "180",
    tag: lang === 'ar' ? "خصم 30%" : "30% Off",
    img: heroImg,
    kind: "trip" as const,
    tripKind: "daily" as const,
    departure: lang === 'ar' ? "مكتب طرابلس" : "Tripoli Office",
    perk: lang === 'ar' ? "🥗 وجبة مأكولات بحرية فاخرة طازجة مجاناً" : "🥗 Free fresh luxury seafood meal",
    entertainment: lang === 'ar' ? "أنشطة سباحة وألعاب شاطئية عائلية، جولة على شاطئ الخمس، كافيهات مطلة على البحر" : "Family swimming & beach games, tour on Khoms beach, sea-view cafes",
    schedules: [
      { id: "o2-s1", date: lang === 'ar' ? "الأربعاء 23 يوليو 2026" : "Wed 23 July 2026", time: "08:00 AM", seats: 20, taken: 14, guide: lang === 'ar' ? "أ. محمد الفيتوري" : "Mr. Mohamed Al-Fitouri", price: 180 },
    ]
  },
  {
    title: lang === 'ar' ? "يوم ترفيهي عائلي باليخوت بطرابلس" : "Family Yacht Entertainment Day in Tripoli",
    sub: lang === 'ar' ? "رحلة بحرية ٣ ساعات على متن يخت VIP مع غداء طازج" : "3-hour sea trip on a VIP yacht with fresh lunch",
    oldPrice: "900",
    price: "650",
    tag: lang === 'ar' ? "شعبية كبيرة" : "Highly Popular",
    img: officeBusImg,
    kind: "entertainment" as const,
    tripKind: "daily" as const,
    departure: lang === 'ar' ? "مكتب طرابلس" : "Tripoli Office",
    perk: lang === 'ar' ? "🥂 مشروبات ترحيبية مجانية وضيافة طوال الرحلة" : "🥂 Free welcome drinks and hospitality throughout the trip",
    entertainment: lang === 'ar' ? "جولة بحرية باليخت، عروض سينمائية وموسيقى حية، أنشطة غوص ترفيهية عائلية" : "Yacht cruise, cinematic shows, live music, family recreational diving",
    schedules: [
      { id: "o3-s1", date: lang === 'ar' ? "الجمعة 25 يوليو 2026" : "Fri 25 July 2026", time: "04:00 PM", seats: 15, taken: 8, guide: lang === 'ar' ? "الكابتن طارق الورفلي" : "Captain Tariq Al-Werfalli", price: 650 },
    ]
  },
  {
    title: lang === 'ar' ? "خصم فندق قصر النخيل طرابلس" : "Palm Palace Hotel Tripoli Discount",
    sub: lang === 'ar' ? "عرض تعريفي للاطلاع · ليلتان في جناح فاخر بإطلالة بحرية" : "Introductory Offer · 2 nights in a luxury suite with sea view",
    oldPrice: "1,600",
    price: "990",
    tag: lang === 'ar' ? "فندق" : "Hotel",
    img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    kind: "stay" as const,
    tripKind: "daily" as const,
    departure: lang === 'ar' ? "مكتب طرابلس" : "Tripoli Office",
    perk: lang === 'ar' ? "🍳 إفطار مفتوح ودخول للسبا الفندقي مجاناً" : "🍳 Open breakfast & free access to hotel spa",
    entertainment: lang === 'ar' ? "مسبح خارجي، مركز استجمام صحي، إطلالة بحرية بانورامية" : "Outdoor pool, wellness center, panoramic sea view",
    schedules: []
  },
  {
    title: lang === 'ar' ? "عشاء فاخر في مطعم الأصالة الليبي" : "Luxury Dinner at Al-Asala Restaurant",
    sub: lang === 'ar' ? "عرض خاص للزوجين يشمل المشروبات الترحيبية" : "Special offer for couples including welcome drinks",
    oldPrice: "180",
    price: "120",
    tag: lang === 'ar' ? "مطعم" : "Restaurant",
    img: restaurantImg,
    kind: "restaurant" as const,
    tripKind: "daily" as const,
    departure: lang === 'ar' ? "طرابلس" : "Tripoli",
    perk: lang === 'ar' ? "🍽️ خصم إضافي على قائمة الحلويات" : "🍽️ Extra discount on dessert menu",
    entertainment: lang === 'ar' ? "أجواء عائلية، ديكور تراثي، عزف عود خفيف" : "Family atmosphere, heritage decor, light oud music",
    schedules: []
  }
];

export const getTrips = (lang: string) => [
  { name: lang === 'ar' ? "فندق قصر النخيل" : "Palm Palace Hotel", city: lang === 'ar' ? "طرابلس" : "Tripoli", rating: 4.8, reviews: 1240, price: 420, tag: lang === 'ar' ? "فندق ٥ نجوم" : "5-Star Hotel", img: destTripoli, feats: lang === 'ar' ? ["إفطار مجاني", "واي فاي", "مسبح"] : ["Free Breakfast", "Wi-Fi", "Pool"] },
  { name: lang === 'ar' ? "منتجع أوباري الصحراوي" : "Ubari Desert Resort", city: lang === 'ar' ? "فزان" : "Fezzan", rating: 4.9, reviews: 682, price: 890, tag: lang === 'ar' ? "فاخر" : "Luxury", img: destUbari, feats: lang === 'ar' ? ["خيام فاخرة", "جولة جمال", "عشاء بدوي"] : ["Luxury Tents", "Camel Ride", "Bedouin Dinner"] },
  { name: lang === 'ar' ? "نزل غدامس التراثي" : "Ghadames Heritage Inn", city: lang === 'ar' ? "غدامس" : "Ghadames", rating: 4.7, reviews: 415, price: 260, tag: lang === 'ar' ? "تراثي" : "Heritage", img: destGhadames, feats: lang === 'ar' ? ["مرشد سياحي", "إفطار محلي"] : ["Tour Guide", "Local Breakfast"] },
  { name: lang === 'ar' ? "استراحة شاطئ التلال" : "Hills Beach Resort", city: lang === 'ar' ? "درنة" : "Derna", rating: 4.6, reviews: 328, price: 340, tag: lang === 'ar' ? "على البحر" : "Beachfront", img: destCyrene, feats: lang === 'ar' ? ["إطلالة بحر", "شاطئ خاص"] : ["Sea View", "Private Beach"] },
];

export const getTripTypesData = (lang: string) => [
  { 
    id: "daily", 
    tag: lang === 'ar' ? "يومية قصيرة" : "Short Daily", 
    title: lang === 'ar' ? "جولات سريعة داخل المدينة" : "Quick City Tours", 
    desc: lang === 'ar' ? "استكشف معالم طرابلس أو بنغازي في نصف يوم أو يوم كامل." : "Explore the landmarks of Tripoli or Benghazi in half a day or a full day.", 
    price: lang === 'ar' ? "يبدأ من 50 د.ل" : "Starts from 50 LYD", 
    duration: lang === 'ar' ? "4 - 8 ساعات" : "4 - 8 Hours", 
    img: heroImg, 
    accent: "from-sky-500/70 to-blue-600/70", 
    features: lang === 'ar' ? ["مرشد محلي", "وجبة خفيفة", "مواصلات ذهاب وعودة"] : ["Local Guide", "Snack", "Round-trip Transport"] 
  },
  { 
    id: "weekly", 
    tag: lang === 'ar' ? "برامج أسبوعية" : "Weekly Programs", 
    title: lang === 'ar' ? "مغامرات في الصحراء والجبال" : "Adventures in Desert & Mountains", 
    desc: lang === 'ar' ? "رحلات شاملة لعدة أيام إلى غدامس، أوباري، والجبل الأخضر." : "Comprehensive multi-day trips to Ghadames, Ubari, and the Green Mountain.", 
    price: lang === 'ar' ? "يبدأ من 600 د.ل" : "Starts from 600 LYD", 
    duration: lang === 'ar' ? "3 - 7 أيام" : "3 - 7 Days", 
    img: destGhadames, 
    accent: "from-gold/70 to-amber-600/70", 
    features: lang === 'ar' ? ["إقامة كاملة", "جميع الوجبات", "برنامج ترفيهي"] : ["Full Accommodation", "All Meals", "Entertainment Program"] 
  },
  { 
    id: "private", 
    tag: lang === 'ar' ? "رحلات خاصة" : "Private Trips", 
    title: lang === 'ar' ? "رحلتك مفصلة على ذوقك" : "Tailor-made Trips Just for You", 
    desc: lang === 'ar' ? "اختر وجهتك ومرافقيك ونحن نجهز لك كل التفاصيل باحترافية." : "Choose your destination and companions, and we prepare all details professionally.", 
    price: lang === 'ar' ? "حسب الطلب" : "On Demand", 
    duration: lang === 'ar' ? "مرن جداً" : "Very Flexible", 
    img: privateTripImg, 
    accent: "from-primary/70 to-secondary/70", 
    features: lang === 'ar' ? ["سيارة خاصة VIP", "مرشد خاص", "تخصيص كامل للجدول"] : ["VIP Private Car", "Private Guide", "Fully Customized Schedule"] 
  },
];

export const getOffices = (lang: string) => [
  {
    city: lang === 'ar' ? "طرابلس" : "Tripoli",
    role: lang === 'ar' ? "المكتب الرئيسي" : "Main Office",
    address: lang === 'ar' ? "شارع عمر المختار، وسط طرابلس" : "Omar Al-Mukhtar St, Downtown Tripoli",
    phone: "+218 21 333 4444",
    hours: lang === 'ar' ? "السبت – الخميس · 8:00 ص – 8:00 م" : "Sat – Thu · 8:00 AM – 8:00 PM",
    coords: "32.8872° N · 13.1913° E",
  },
  {
    city: lang === 'ar' ? "بنغازي" : "Benghazi",
    role: lang === 'ar' ? "المكتب الشرقي" : "Eastern Office",
    address: lang === 'ar' ? "شارع جمال عبد الناصر، بنغازي" : "Gamal Abdel Nasser St, Benghazi",
    phone: "+218 61 222 3333",
    hours: lang === 'ar' ? "السبت – الخميس · 8:00 ص – 8:00 م" : "Sat – Thu · 8:00 AM – 8:00 PM",
    coords: "32.1194° N · 20.0868° E",
  },
];

export const getPlaces = (lang: string) => [
  { 
    name: lang === 'ar' ? "لبدة الكبرى" : "Leptis Magna", 
    type: lang === 'ar' ? "أثري روماني" : "Roman Ruins", 
    city: lang === 'ar' ? "الخمس" : "Khoms", 
    img: heroImg, 
    tag: lang === 'ar' ? "تراث عالمي" : "World Heritage",
    hasTrips: true,
    schedules: [
      { id: "pl-1", date: lang === 'ar' ? "الأحد 4 أغسطس 2026" : "Sun 4 Aug 2026", time: "08:00 AM", seats: 20, taken: 10, guide: lang === 'ar' ? "عادل صالح" : "Adel Saleh", price: 150 }
    ]
  },
  { 
    name: lang === 'ar' ? "مدينة صبراتة" : "Sabratha City", 
    type: lang === 'ar' ? "مدرج روماني ساحلي" : "Roman Theater", 
    city: lang === 'ar' ? "صبراتة" : "Sabratha", 
    img: destSabratah, 
    tag: lang === 'ar' ? "تراث عالمي" : "World Heritage",
    hasTrips: true,
    schedules: [
      { id: "pl-sab", date: lang === 'ar' ? "السبت 10 أغسطس 2026" : "Sat 10 Aug 2026", time: "09:00 AM", seats: 20, taken: 8, guide: lang === 'ar' ? "عادل الزواوي" : "Adel Al-Zawawi", price: 150 }
    ]
  },
  { 
    name: lang === 'ar' ? "بيوت الحفر في غريان" : "Gharyan Cave Houses", 
    type: lang === 'ar' ? "معمار بيئي وتراث أصيل" : "Cave Architecture", 
    city: lang === 'ar' ? "غريان" : "Gharyan", 
    img: destGharyanCave, 
    tag: lang === 'ar' ? "تراث جبلي" : "Mountain Heritage",
    hasTrips: true,
    schedules: [
      { id: "pl-ghr", date: lang === 'ar' ? "الجمعة 16 أغسطس 2026" : "Fri 16 Aug 2026", time: "08:30 AM", seats: 16, taken: 6, guide: lang === 'ar' ? "أحمد الغرياني" : "Ahmed Al-Gharyani", price: 110 }
    ]
  },
  { 
    name: lang === 'ar' ? "قصور نالوت وكاباو" : "Nalut & Kabaw Ksars", 
    type: lang === 'ar' ? "قلاع تخزين أمازيغية" : "Berber Granaries", 
    city: lang === 'ar' ? "نالوت" : "Nalut", 
    img: destKsarDesert, 
    tag: lang === 'ar' ? "قلاع تاريخية" : "Historic Fortress",
    hasTrips: true,
    schedules: [
      { id: "pl-ksar", date: lang === 'ar' ? "الخميس 22 أغسطس 2026" : "Thu 22 Aug 2026", time: "07:30 AM", seats: 14, taken: 5, guide: lang === 'ar' ? "يوسف النفوسي" : "Yousef Al-Nafusi", price: 190 }
    ]
  },
  { 
    name: lang === 'ar' ? "قورينا (شحات)" : "Cyrene (Shahat)", 
    type: lang === 'ar' ? "أثري إغريقي" : "Greek Ruins", 
    city: lang === 'ar' ? "الجبل الأخضر" : "Green Mountain", 
    img: destCyrene, 
    tag: lang === 'ar' ? "تراث عالمي" : "World Heritage",
    hasTrips: true,
    schedules: [
      { id: "pl-2", date: lang === 'ar' ? "الخميس 15 أغسطس 2026" : "Thu 15 Aug 2026", time: "07:00 AM", seats: 15, taken: 15, guide: lang === 'ar' ? "محمود سالم" : "Mahmoud Salem", price: 200 }
    ]
  },
  { 
    name: lang === 'ar' ? "غدامس القديمة" : "Old Ghadames", 
    type: lang === 'ar' ? "مدينة تراثية" : "Heritage City", 
    city: lang === 'ar' ? "غدامس" : "Ghadames", 
    img: destGhadames, 
    tag: lang === 'ar' ? "لؤلؤة الصحراء" : "Desert Pearl",
    hasTrips: true,
    schedules: [
      { id: "pl-3", date: lang === 'ar' ? "الإثنين 12 أغسطس 2026" : "Mon 12 Aug 2026", time: "06:00 AM", seats: 12, taken: 4, guide: lang === 'ar' ? "طارق التواتي" : "Tariq Al-Tawati", price: 300 }
    ]
  },
  { 
    name: lang === 'ar' ? "بحيرات أوباري" : "Ubari Lakes", 
    type: lang === 'ar' ? "بحيرات طبيعية" : "Natural Lakes", 
    city: lang === 'ar' ? "فزان" : "Fezzan", 
    img: destUbari, 
    tag: lang === 'ar' ? "طبيعي" : "Nature",
    hasTrips: false 
  },
  { 
    name: lang === 'ar' ? "جبال أكاكوس" : "Acacus Mountains", 
    type: lang === 'ar' ? "رسوم ما قبل التاريخ" : "Prehistoric Art", 
    city: lang === 'ar' ? "غات" : "Ghat", 
    img: destAcacus, 
    tag: lang === 'ar' ? "تراث عالمي" : "World Heritage",
    hasTrips: false 
  },
];

export const TRIP_VIDEOS = {
  leptis: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  tripoli: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  cyrene: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
  ubari: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  sabratha: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
};

export const getNearbyServices = (title: string, lang: string = "ar") => {
  const isAr = lang === "ar";
  const t = (title || "").toLowerCase();

  // 1. Ubari & Acacus / Grand Sahara
  if (t.includes("أوباري") || t.includes("ubari") || t.includes("أكاكوس") || t.includes("acacus") || t.includes("صحراء") || t.includes("فزان")) {
    return {
      destination: isAr ? "أوباري وتدرارت أكاكوس (الصحراء الكبرى)" : "Ubari & Tadrart Acacus (Grand Sahara)",
      cityName: isAr ? "واحات أوباري وصحراء فزان" : "Ubari Oases & Fezzan Desert",
      cityBadge: isAr ? "واحات صحراوية وعجائب طبيعية" : "Desert Oases & Natural Wonders",
      cityIntro: isAr
        ? "أعجوبة طبيعية استثنائية في قلب رمال الجنوب، تلتقي فيها بحيرات مائية فيروزية محاطة بالنخيل مع كثبان رملية ذهبية شاهقة، ونقوش صخرية تاريخية باليونسكو تعود إلى 12,000 عام."
        : "An extraordinary natural wonder in the southern Sahara, featuring sapphire desert lakes fringed with palm trees amidst soaring golden dunes and 12,000-year-old UNESCO rock art.",
      landmarks: [
        {
          name: isAr ? "بحيرة قبر عون الأسطورية" : "Gaberoun Desert Oasis Lake",
          tag: isAr ? "عجيبة طبيعية" : "Natural Wonder",
          desc: isAr ? "بحيرة مائية مالحة ساحرة في قلب الكثبان الذهبية، تشتهر بخصائصها العلاجية وأشجار النخيل المحيطة بها وسهرات التخييم." : "Salt lake oasis surrounded by massive sand dunes and palm trees.",
        },
        {
          name: isAr ? "نقوش جبال تدرارت أكاكوس (UNESCO)" : "Tadrart Acacus Rock Art (UNESCO)",
          tag: isAr ? "تراث عالمي" : "UNESCO Heritage",
          desc: isAr ? "معرض فني مفتوح على الصخور يوثق الحياة الصحراوية والحيوانات البرية وتطور الإنسان منذ أكثر من 12 ألف سنة." : "Open-air prehistoric rock art gallery spanning thousands of years.",
        },
        {
          name: isAr ? "أقواس وجبال غات المنحوتة بالرياح" : "Natural Stone Arches of Ghat",
          tag: isAr ? "تشكيلات صخرية" : "Geological Marvel",
          desc: isAr ? "تكوينات جيولوجية مدهشة كقوس الفيل وأعمدة الصخر الأسود الشامخة وسط الرمال الذهبية." : "Spectacular stone arches carved by desert winds over millions of years.",
        },
      ],
      foods: [
        {
          name: isAr ? "عشاء المظبي والزرب الصحراوي" : "Bedouin Zarb & Charcoal BBQ",
          desc: isAr ? "لحم وخضار طازجة تُدفن وتُطهى على حرارة الجمر البطيء تحت الرمال لساعات لتذوب كالحرير." : "Tender meats and vegetables slow-cooked in underground sand embers.",
        },
        {
          name: isAr ? "خبزة الملة التقليدية" : "Traditional Desert Mella Bread",
          desc: isAr ? "خبز صحراوي طازج يُطهى بحرفية على الرمال الساخنة والجمر ويُقدم مع حساء الخضار اللذيذ." : "Authentic desert bread baked on clean hot coals and served with savory soup.",
        },
        {
          name: isAr ? "شاي الطوارق الصحراوي الثلاثي" : "Three Rounds of Foaming Tuareg Tea",
          desc: isAr ? "طقس صحراوي أصيل لتقديم الشاي الأخضر المركز برغوة بيضاء كثيفة تحت سماء الصحراء المرصعة بالنجوم." : "Ceremonial desert green tea with rich foaming cream served around the campfire.",
        },
      ],
      tips: [
        {
          title: isAr ? "أفضل موسم للزيارة" : "Best Travel Season",
          desc: isAr ? "الفترة من أكتوبر إلى أبريل مثالية جداً حيث تكون درجات الحرارة نهاراً معتدلة ولطيفة (22-26°)." : "October to April offers pleasant daytime weather (22-26°C).",
          icon: "☀️",
        },
        {
          title: isAr ? "الملابس الموصى بها" : "Recommended Attire",
          desc: isAr ? "ملابس قطنية مريحة نهاراً، مع ضرورة اصطحاب سترة شتوية دافئة جداً لأن ليالي الصحراء باردة." : "Light cotton for daytime; very warm winter jackets for freezing desert nights.",
          icon: "🧥",
        },
        {
          title: isAr ? "نصيحة التصوير" : "Photography Advice",
          desc: isAr ? "لحظات شروق الشمس وغروبها فوق بحيرة قبر عون والكثبان الذهبية توفر إضاءة سينمائية لا تتكرر." : "Golden hour sunrise and sunset over Gaberoun Lake create unforgettable shots.",
          icon: "📸",
        },
      ],
      promoOffer: {
        title: isAr ? "🔥 خصم 30% عائلي + سهرة فلكلور وتزلج رملي مجاني" : "🔥 30% Off Family + Free Folklore Night & Sandboarding",
        code: "DESERT2026",
        expires: isAr ? "ينتهي خلال 48 ساعة" : "Expires in 48h",
      },
      hotels: [
        { name: isAr ? "منتجع أوباري الصحراوي 5★" : "Ubari Desert Resort 5★", price: isAr ? "890 د.ل / ليلة" : "890 LYD/night", rating: 4.9, img: destUbariGaberoun, perk: isAr ? "إفطار بدوي ومسبح صحراوي" : "Bedouin Breakfast & Pool" },
        { name: isAr ? "مخيم أكاكوس الفاخر VIP" : "Acacus VIP Desert Camp", price: isAr ? "450 د.ل / ليلة" : "450 LYD/night", rating: 4.85, img: destAcacusArch, perk: isAr ? "خيام مكيفة وسهرات فلكلور" : "Glamping Tents & Campfires" },
      ],
      restaurants: [
        { name: isAr ? "مطعم الواحة البدوي" : "Al-Waha Bedouin Restaurant", type: isAr ? "شواء بدوي ومندي صحراوي" : "Bedouin BBQ & Mandi", rating: 4.9, perk: isAr ? "شاي باللوز مجاناً مع الوجبة" : "Free Almond Tea" },
        { name: isAr ? "جلسة رملة أوباري السياحية" : "Ubari Dunes Sunset Lounge", type: isAr ? "شاي ومكسرات ومأكولات خفيفة" : "Tea, Nuts & Snacks", rating: 4.7, perk: isAr ? "إطلالة بانورامية على الكثبان" : "Panoramic Dunes View" },
      ],
    };
  }

  // 2. Ghadames Old Town
  if (t.includes("غدامس") || t.includes("ghadames")) {
    return {
      destination: isAr ? "مدينة غدامس القديمة (لؤلؤة الصحراء)" : "Old Town of Ghadames (Pearl of the Sahara)",
      cityName: isAr ? "غدامس التاريخية والواحات" : "Historic Ghadames & Oases",
      cityBadge: isAr ? "موقع تراث عالمي لليونسكو" : "UNESCO World Heritage Site",
      cityIntro: isAr
        ? "واحة تاريخية متفردة مسجلة باليونسكو، اشتهرت بعمارتها الصحراوية الهندسية المبتكرة ذات الممرات المسقوفة المكيفة طبيعياً، وبيوتها الطينية المزينة بنقوش الجبس والمرايا الملونة، ونبع عين الفرس الدائم."
        : "A unique UNESCO World Heritage oasis renowned for its ingenious climate-adapted covered alleyways, colorful mud-brick homes with brass mirrors, and the ancient Ain Al-Faras spring.",
      landmarks: [
        {
          name: isAr ? "الممرات المسقوفة البيضاء" : "Covered Whitewashed Alleyways",
          tag: isAr ? "عمارة فريدة" : "Architectural Marvel",
          desc: isAr ? "شبكة شوارع مبردة طبيعياً تحت الأرض تحمي السكان والزوار من حرارة الصيف ورياح الصحراء." : "Cool underground-style covered streets providing natural climate cooling.",
        },
        {
          name: isAr ? "نبع وسواقي عين الفرس التاريخية" : "Historic Ain Al-Faras Spring",
          tag: isAr ? "هندسة مائية قديمة" : "Ancient Hydro-System",
          desc: isAr ? "النبع الحيوي الذي بنيت حوله غدامس ونظام توزيع مياه الري الهندسي بالساعة المائية العتيقة." : "The historic life-giving spring that irrigated palm groves via clock water systems.",
        },
        {
          name: isAr ? "المنازل التراثية والأسطح المفتوحة" : "Decorated Heritage Homes & Rooftops",
          tag: isAr ? "فنون تراثية" : "Folkloric Art",
          desc: isAr ? "بيوت مكونة من عدة طوابق مزينة بالأطباق النحاسية والمرايا، وأسطح علوية متصلة كانت مخصصة لتنقل النساء." : "Multi-tiered homes adorned with copper crafts, mirrors, and interlinked roofs.",
        },
      ],
      foods: [
        {
          name: isAr ? "الكسكسي الغدامسي بالخضار والقديد" : "Traditional Ghadames Couscous",
          desc: isAr ? "كسكسي ناعم مطهو على البخار مع خضار الواحات الطازجة ولحم القديد المجفف بنكهة غدامسية عريقة." : "Fine steamed couscous with fresh oasis vegetables and savory preserved meat.",
        },
        {
          name: isAr ? "تمور الدقلة الغدامسية الفاخرة" : "Premium Ghadames Deglet Dates",
          desc: isAr ? "أجود أنواع التمور الشقراء من بساتين نخيل عين الفرس، تُقدم مع القهوة العربية واللوز." : "Luscious golden dates harvested from historic groves, served with Arabic coffee.",
        },
        {
          name: isAr ? "فطائر التنور والشاي بالنعناع الصحراوي" : "Tandoor Flatbreads & Mint Tea",
          desc: isAr ? "خبز تنور ساخن يُؤكل مع العسل والزيت وجلسة شاي عند الغروب فوق الكثبان الرملية." : "Fresh oven-baked bread with local honey, oil, and desert sunset mint tea.",
        },
      ],
      tips: [
        {
          title: isAr ? "احترام خصوصية التراث" : "Cultural Heritage Etiquette",
          desc: isAr ? "يُفضل دائماً التجول برفقة مرشد محلي من أهالي غدامس للتعرف على أسرار العمارة وتاريخ العائلات." : "Always tour with a certified local guide to learn the intimate history and customs.",
          icon: "🧭",
        },
        {
          title: isAr ? "الصناعات الحرفية" : "Local Souvenirs",
          desc: isAr ? "لا تفوت اقتناء النعال الجلدية الغدامسية المطرزة يدوياً والمرايا التراثية من سوق الواحة." : "Buy authentic handmade embroidered leather slippers and decorative wall mirrors.",
          icon: "🛍️",
        },
        {
          title: isAr ? "أفضل لقطة تصوير" : "Top Photo Opportunity",
          desc: isAr ? "مشهد الضوء النافذ من فتحات السقف داخل الممرات المسقوفة وغروب الشمس من رملة غدامس الكبرى." : "Sunbeams cutting through covered alley ceiling skylights and grand sand dunes.",
          icon: "📷",
        },
      ],
      promoOffer: {
        title: isAr ? "🏛️ باقة استكشاف غدامس + جولة متحف التراث مجاناً" : "🏛️ Ghadames Discovery Package + Free Museum Tour",
        code: "GHADAMES26",
        expires: isAr ? "ساري للموسم السياحي" : "Valid for Current Season",
      },
      hotels: [
        { name: isAr ? "نزل غدامس التراثي 4★" : "Ghadames Heritage Inn 4★", price: isAr ? "360 د.ل / ليلة" : "360 LYD/night", rating: 4.8, img: destGhadames, perk: isAr ? "إقامة في المنازل التاريخية" : "Heritage Home Stay" },
        { name: isAr ? "فندق واحة الفرس السياحي 4★" : "Ain Al-Faras Oasis Hotel 4★", price: isAr ? "290 د.ل / ليلة" : "290 LYD/night", rating: 4.6, img: destGhadames, perk: isAr ? "إطلالة على بساتين النخيل" : "Palm Grove Views" },
      ],
      restaurants: [
        { name: isAr ? "مطعم لؤلؤة الصحراء التراثي" : "Desert Pearl Traditional Dining", type: isAr ? "مأكولات تراثية وكسكسي غدامسي" : "Traditional Ghadames Cuisine", rating: 4.85, perk: isAr ? "جلسة تراثية على السجاد التقليدي" : "Traditional Carpet Dining" },
        { name: isAr ? "مقهى عين الفرس التراثي" : "Ain Al-Faras Heritage Cafe", type: isAr ? "مشروبات شعبية وحلويات" : "Traditional Coffee & Pastries", rating: 4.7, perk: isAr ? "جلسة مطلة على الواحة" : "Oasis View Seating" },
      ],
    };
  }

  // 3. Cyrene & Shahhat (Green Mountain)
  if (t.includes("قورينا") || t.includes("cyrene") || t.includes("شحات") || t.includes("الجبل الأخضر") || t.includes("green mountain")) {
    return {
      destination: isAr ? "شحات وقورينا (الجبل الأخضر وسوسة)" : "Shahat & Cyrene (Green Mountain & Apollonia)",
      cityName: isAr ? "مدينة قورينا التاريخية وشحات" : "Historic Cyrene & Shahhat",
      cityBadge: isAr ? "مهد الحضارة الإغريقية باليونسكو" : "Cradle of Greek Antiquities (UNESCO)",
      cityIntro: isAr
        ? "مدينة إغريقية أثرية مهيبة تأسست عام 631 قبل الميلاد فوق قمم الجبل الأخضر الساحر، تجمع بين خضرة الغابات الطبيعية وزرقة مياه البحر الأبيض المتوسط، وتضم أعظم المعابد والمدرجات الأثرية."
        : "A magnificent ancient Greek metropolis founded in 631 BC perched on Green Mountain peaks, blending lush cedar forests with the azure Mediterranean Sea and majestic temples.",
      landmarks: [
        {
          name: isAr ? "معبد أبولو ومجمع المقادس" : "Sanctuary & Temple of Apollo",
          tag: isAr ? "معلم رئيسي" : "Iconic Temple",
          desc: isAr ? "أقدم وأهم معابد قورينا الإغريقية المطلة على الساحل مع نبع أبولو المقدس والأكروبوليس." : "The ancient sacred center of Cyrene overlooking the Mediterranean coast.",
        },
        {
          name: isAr ? "المسرح الإغريقي والروماني" : "Greek & Roman Amphitheatre",
          tag: isAr ? "هندسة صوتية" : "Acoustic Wonder",
          desc: isAr ? "مدرج حجري أثري عملاق يطل مباشرة على البحر المتوسط بين أحضان الغابات الجبلية." : "Grand hillside theatre cascading down with breathtaking panoramic sea vistas.",
        },
        {
          name: isAr ? "مدينة أبولونيا والآثار الغارقة (سوسة)" : "Apollonia Ancient Seaport",
          tag: isAr ? "آثار ساحلية" : "Coastal Ruins",
          desc: isAr ? "ميناء قورينا التاريخي على شاطئ سوسة مع المسرح المحاذي للأمواج والقصور البيزنطية." : "Cyrene's historic maritime port with seaside theatre and sunken ruins.",
        },
      ],
      foods: [
        {
          name: isAr ? "مشويات اللحم الوطني الجبلي" : "Fresh Green Mountain Lamb BBQ",
          desc: isAr ? "لحم ضأن طازج بنكهة الأعشاب الطبيعية والزعتر الجبلي البري، مشوي على الفحم." : "Fresh lamb seasoned with wild mountain thyme and herbs, charcoal-grilled.",
        },
        {
          name: isAr ? "عسل السدر والزعتر الجبلي الأصلي" : "Pure Wild Thyme & Sidr Honey",
          desc: isAr ? "من أثمن وأجود أنواع العسل الطبيعي في العالم، يُنتج في غابات الجبل الأخضر الطبيعية." : "World-renowned pure honey harvested from pristine Green Mountain flora.",
        },
        {
          name: isAr ? "الشاي الأخضر بالزعتر الجبلي والمكسرات" : "Mountain Thyme Green Tea",
          desc: isAr ? "شاي دافئ متبل بأعشاب الجبل الأخضر، مثالي للأجواء الجبلية اللطيفة والباردة." : "Aromatic wild herbal tea served with roasted nuts in scenic mountain view cafes.",
        },
      ],
      tips: [
        {
          title: isAr ? "الطقس ودرجات الحرارة" : "Climate & Temperature",
          desc: isAr ? "شحات أكثر اعتدالاً وبرودة من الساحل؛ يُنصح باصطحاب سترة دافئة خفيفة حتى في الربيع والخريف." : "Temperatures are 5-8°C cooler than coast; carry a warm light jacket.",
          icon: "🧥",
        },
        {
          title: isAr ? "أحذية المشي" : "Footwear Advice",
          desc: isAr ? "الموقع الأثري واسع وتضاريسه جبلية؛ ارتدِ أحذية رياضية مريحة للمشي على المسارات الحجرية." : "The archaeological park is vast; wear sturdy hiking or walking sneakers.",
          icon: "👟",
        },
        {
          title: isAr ? "ساعة التصوير الذهبية" : "Golden Hour Photography",
          desc: isAr ? "وقت الغروب عند معبد أبولو المطل على بحر سوسة يمنح أروع انعكاسات ضوئية على الأعمدة الرخامية." : "Sunset over Temple of Apollo facing the Mediterranean provides dreamlike lighting.",
          icon: "📸",
        },
      ],
      promoOffer: {
        title: isAr ? "🌿 خصم 25% + جولة إرشادية مجانية لمعبد أبولو" : "🌿 25% Off + Free Guided Tour to Temple of Apollo",
        code: "CYRENE25",
        expires: isAr ? "عرض الموسم الجبلي" : "Seasonal Mountain Offer",
      },
      hotels: [
        { name: isAr ? "منتجع الجبل الأخضر الفاخر 4★" : "Green Mountain Luxury Resort 4★", price: isAr ? "520 د.ل / ليلة" : "520 LYD/night", rating: 4.8, img: destJabalAkhdarForest, perk: isAr ? "إطلالة بانورامية على الشلالات والغابات" : "Panoramic Forest & Waterfall View" },
        { name: isAr ? "فندق قورينا السياحي 4★" : "Cyrene Tourist Hotel 4★", price: isAr ? "310 د.ل / ليلة" : "310 LYD/night", rating: 4.7, img: destJabalAkhdarPanorama, perk: isAr ? "قريب 5 دقائق من الآثار والبحر" : "5 mins to ruins & coast" },
      ],
      restaurants: [
        { name: isAr ? "مطعم المطل الجبلي" : "Mountain View Restaurant", type: isAr ? "مشويات جبلية ومأكولات طازجة" : "Mountain BBQ & Fresh Food", rating: 4.8, perk: isAr ? "خصم 15% لمشتركي الرحلة" : "15% Off for Tour Members" },
        { name: isAr ? "كافيه الصنوبر السياحي" : "Pine Forest Cafe", type: isAr ? "قهوة مختصة وعصائر طبيعية" : "Specialty Coffee & Juices", rating: 4.6, perk: isAr ? "جلسة وسط غابات الصنوبر" : "Seating in Pine Woods" },
      ],
    };
  }

  // 4. Tripoli Old Town & Capital
  if (t.includes("طرابلس") || t.includes("tripoli")) {
    return {
      destination: isAr ? "طرابلس العاصمة والمدينة القديمة" : "Tripoli Capital & Old Medina",
      cityName: isAr ? "عروس البحر المتوسط: طرابلس" : "Bride of the Mediterranean: Tripoli",
      cityBadge: isAr ? "العاصمة التاريخية النابضة" : "Vibrant Historic Capital",
      cityIntro: isAr
        ? "عاصمة ليبيا التاريخية العريقة ذات الطراز الأندلسي والعثماني والإيطالي، تتميز بقلعة السراي الحمراء، أسواق الذهب والنحاس العتيقة، مقاهي الكورنيش، وقوس ماركوس أوريليوس الرخامي."
        : "Libya's historic seaside capital blending Ottoman, Andalusian, and Mediterranean heritage, featuring the Red Castle, gold & copper souks, and Marcus Aurelius Roman arch.",
      landmarks: [
        {
          name: isAr ? "قلعة السرايا الحمراء التاريخية" : "Red Castle Fortress (Assaraya Al-Hamra)",
          tag: isAr ? "حصن أثري" : "Historic Fortress",
          desc: isAr ? "أشهر معالم طرابلس المطلة على البحر والمدينة القديمة، يعود تاريخها إلى العصور الفينيقية والرومانية." : "Iconic fortress overlooking Martyrs' Square and the Mediterranean harbor.",
        },
        {
          name: isAr ? "قوس ماركوس أوريليوس الرخامي" : "Arch of Marcus Aurelius",
          tag: isAr ? "أثر روماني" : "Roman Monument",
          desc: isAr ? "قوس نصر تاريخي شيد عام 163 ميلادي من الرخام الأبيض الخالص، يقع عند مدخل المدينة القديمة." : "Sole surviving Roman triumphal arch erected in 163 AD entirely of white marble.",
        },
        {
          name: isAr ? "أسواق المدينة القديمة التقليدية" : "Historic Covered Medina Souks",
          tag: isAr ? "أسواق حية" : "Living Souks",
          desc: isAr ? "سوق الترك، سوق القزديرة، وسوق الصياغ مع المقاهي العتيقة ومساجد العهد العثماني المزخرفة." : "Bustling traditional craft markets for copperware, jewelry, and textiles.",
        },
      ],
      foods: [
        {
          name: isAr ? "المبطن والبوريك وحساء الدشيشة" : "Authentic Mbatten & Libyan Soup",
          desc: isAr ? "أيقونة المطبخ الطرابلسي: بطاطا محشوة باللحم المفروم مع التوابل الليبية وشوربة طماطم بالنعناع." : "Crispy stuffed potato patties with spiced minced meat and mint soup.",
        },
        {
          name: isAr ? "الكسكسي الطرابلسي بالبصلة والحمص" : "Tripoli Steamed Couscous with Onions",
          desc: isAr ? "وجبة الاحتفال والضيافة الأولى، تُطهى بمرق اللحم والخضار وحبات الحمص بالبصل المعسل." : "Steamed couscous with caramelized onions, chickpeas, and tender meat.",
        },
        {
          name: isAr ? "شاي الكشك باللوز والحلويات الطرابلسية" : "Almond Tea & Traditional Sweets",
          desc: isAr ? "شاي رغوي باللوز المحمص مع مقروض التمر والغريبة في أزقة المدينة القديمة التراثية." : "Foaming mint tea with roasted whole almonds, paired with date maqroudh pastries.",
        },
      ],
      tips: [
        {
          title: isAr ? "التجول في الأسواق" : "Best Souk Exploration Time",
          desc: isAr ? "أفضل وقت لزيارة المدينة القديمة هو من العصر وحتى المساء، حيث تنشط حركة الحرفيين والمقاهي." : "Late afternoon to evening is the best time for vibrant bustling souks.",
          icon: "🌆",
        },
        {
          title: isAr ? "جولة الحنطور التراثي" : "Horse Carriage Experience",
          desc: isAr ? "يمكنك أخذ جولة حنطور سياحية ممتعة حول ميدان الشهداء والكورنيش بأسعار رمزية وممتعة." : "Enjoy a traditional horse-drawn carriage ride along Martyrs' Square and the corniche.",
          icon: "🐴",
        },
        {
          title: isAr ? "التسوق والهدايا" : "Handcrafted Souvenirs",
          desc: isAr ? "سوق القزديرة وسوق الفضة بالمدينة القديمة هو أفضل مكان لشراء أواني الشاي النحاسية والفضيات." : "Copper souk is ideal for handcrafted brass tea sets, trays, and silver jewelry.",
          icon: "🎁",
        },
      ],
      promoOffer: {
        title: isAr ? "🏰 خصم 30% على جولة السرايا + عشاء بحري مجاني" : "🏰 30% Off Red Castle Tour + Free Seafood Dinner",
        code: "TRIPOLI30",
        expires: isAr ? "عرض اليوم الحصري" : "Exclusive Today Offer",
      },
      hotels: [
        { name: isAr ? "فندق قصر النخيل 5★" : "Palm Palace Hotel 5★", price: isAr ? "420 د.ل / ليلة" : "420 LYD/night", rating: 4.9, img: destTripoli, perk: isAr ? "إفطار مفتوح وإطلالة على الكورنيش" : "Open Breakfast & Sea View" },
        { name: isAr ? "الفندق الكبير طرابلس 5★" : "Grand Hotel Tripoli 5★", price: isAr ? "550 د.ل / ليلة" : "550 LYD/night", rating: 4.85, img: destTripoli, perk: isAr ? "مسبح وسبا فاخر" : "Pool & Luxury Spa" },
      ],
      restaurants: [
        { name: isAr ? "مطعم السرايا التراثي" : "Al-Saraya Heritage Restaurant", type: isAr ? "مأكولات ليبية شعبية وعريقة" : "Authentic Libyan Cuisine", rating: 4.9, perk: isAr ? "طبق مبطن وحساء مجاناً" : "Free Traditional Starter" },
        { name: isAr ? "مقهى العتيق بالمدينة القديمة" : "Al-Ateeq Heritage Cafe", type: isAr ? "قهوة وعصائر وشاي باللوز" : "Coffee, Juices & Almond Tea", rating: 4.8, perk: isAr ? "عزف عود مباشر مساءً" : "Live Evening Oud Music" },
      ],
    };
  }

  // 5. Default: Leptis Magna & Al-Khoms Coast
  return {
    destination: isAr ? "لبدة الكبرى والساحل المتوسطي (الخمس)" : "Leptis Magna & Mediterranean Coast (Al-Khoms)",
    cityName: isAr ? "مدينة الخمس ولبدة الكبرى" : "Al-Khoms City & Leptis Magna",
    cityBadge: isAr ? "جوهرة الآثار الرومانية في أفريقيا (UNESCO)" : "Roman Jewel of Africa (UNESCO)",
    cityIntro: isAr
      ? "أعظم وأكمل مدينة رومانية محفوظة في العالم، تقع على ساحل مدينة الخمس الخلاب، موطن الإمبراطور سيبتيموس سيفيروس، وتضم المسرح الروماني الأسطوري، المرفأ القديم، وحمامات هادريان الفاخرة."
      : "The greatest and best-preserved Roman archaeological city in Africa, situated along the azure coast of Al-Khoms, birthplace of Emperor Septimius Severus.",
    landmarks: [
      {
        name: isAr ? "المسرح الروماني الأثري الضخم" : "The Grand Roman Theatre",
        tag: isAr ? "هندسة معمارية" : "Architectural Wonder",
        desc: isAr ? "مدرج روماني عملاق منحوت يطل مباشرة على البحر الأبيض المتوسط بهندسة صوتية فريدة من القرن الأول." : "Colossal Roman theatre facing the blue sea with incredible 2,000-year-old acoustics.",
      },
      {
        name: isAr ? "قوس سيبتيموس سيفيروس الرخامي" : "Arch of Septimius Severus",
        tag: isAr ? "نصب تذكاري" : "Monumental Arch",
        desc: isAr ? "بوابة نصر رباعية الجوانب من الرخام الأبيض الفاخر تزينها نقوش موكبية للأسرة الإمبراطورية." : "Monumental tetrapylon arch with intricate reliefs celebrating the Severan dynasty.",
      },
      {
        name: isAr ? "حمامات هادريان والميدان الجديد" : "Hadrianic Baths & Severan Forum",
        tag: isAr ? "فسيفساء ورخام" : "Mosaics & Columns",
        desc: isAr ? "مجمع حمامات إمبراطوري ضخم يضم أحواض سباحة رخامية وأعمدة مرمرية وأرضيات فسيفساء نادرة." : "Vast thermal bath complex featuring green cipollino columns and historic pools.",
      },
    ],
    foods: [
      {
        name: isAr ? "وجبة السمك المتوسطي الطازج بالخمس" : "Fresh Catch Mediterranean Fish Meal",
        desc: isAr ? "أسماك صيد يومي طازجة (دندوش، قروش، قاروص) مشوية على الفحم مع الليمون وزيت الزيتون البكر." : "Daily fresh catch fish grilled over open charcoal with local olive oil and lemon.",
      },
      {
        name: isAr ? "الكسكسي الساحلي بالحوت والشرمولة" : "Coastal Seafood Couscous & Sharmoula",
        desc: isAr ? "كسكسي مطهو بمرق السمك الطازج مع خلطة الشرمولة الحارة والخيار والطماطم." : "Traditional steamed couscous infused with rich seafood broth and spicy vegetable salsa.",
      },
      {
        name: isAr ? "جلسة الشاي باللوز على شاطئ الخمس" : "Seaside Almond Tea at Sunset",
        desc: isAr ? "شاي أحمر ليبي مطهو على الفحم ومزين باللوز المقشر المقرمش عند أمواج البحر." : "Traditional charcoal-brewed tea garnished with whole peeled crunchy almonds.",
      },
    ],
    tips: [
      {
        title: isAr ? "ساعات الزيارة والتجول" : "Best Time to Explore",
        desc: isAr ? "ابدأ الجولة في الصباح الباكر (08:30 - 11:30) أو بعد العصر لتجنب حرارة الظهيرة والاستمتاع بإضاءة المسرح." : "Start early morning or late afternoon for pleasant walking temperatures.",
        icon: "🌅",
      },
      {
        title: isAr ? "الأحذية والحماية من الشمس" : "Shoes & Sun Protection",
        desc: isAr ? "مسارات لبدة الكبرى حجرية ورخامية واسعة؛ احرص على حذاء رياضي مريح وقبعة شمسية وماء كافٍ." : "Paths are paved stone and marble; sturdy sneakers and sun hats are essential.",
        icon: "👟",
      },
      {
        title: isAr ? "أفضل زوايا التصوير" : "Iconic Photo Angles",
        desc: isAr ? "أعلى صف في مدرجات المسرح يمنحك لقطة تجمع المسرح بالكامل وأعمدته مع البحر المتوسط في الخلفية." : "The top row of the theatre captures both ancient architecture and sea.",
        icon: "📸",
      },
    ],
    promoOffer: {
      title: isAr ? "🏛️ خصم 30% يومي + وجبة مأكولات بحرية فاخرة طازجة مجاناً" : "🏛️ 30% Daily Off + Free Fresh Luxury Seafood Lunch",
      code: "LEPTIS30",
      expires: isAr ? "متاح للحجز الفوري" : "Instant Booking Available",
    },
    hotels: [
      { name: isAr ? "فندق التلال الخمس 4★" : "Khoms Hills Hotel 4★", price: isAr ? "280 د.ل / ليلة" : "280 LYD/night", rating: 4.7, img: heroImg, perk: isAr ? "نقل مباشر إلى موقع لبدة الأثري" : "Direct Transport to Ruins" },
      { name: isAr ? "نزل شاطئ الخمس 3★" : "Khoms Beach Resort 3★", price: isAr ? "190 د.ل / ليلة" : "190 LYD/night", rating: 4.5, img: heroImg, perk: isAr ? "إطلالة مباشرة على البحر" : "Direct Sea Front" },
    ],
    restaurants: [
      { name: isAr ? "مطعم البحار للمأكولات البحرية" : "Al-Bahar Seafood Restaurant", type: isAr ? "سمك طازج ومشويات ساحلية" : "Fresh Fish & Coastal BBQ", rating: 4.9, perk: isAr ? "غداء طازج مشمول مع الرحلة" : "Fresh Lunch Included" },
      { name: isAr ? "كافيه الشاطئ السياحي" : "Beachfront Cafe Khoms", type: isAr ? "مشروبات باردة وحلويات" : "Cool Drinks & Sweets", rating: 4.6, perk: isAr ? "جلسة ساحلية ومظلات شمسية" : "Seaside Umbrellas" },
    ],
  };
};
