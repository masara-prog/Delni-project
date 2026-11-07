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

export const getDestinations = (_lang: string): any[] => [];

export const getPopularTrips = (_lang: string): any[] => [];

export const getOffers = (_lang: string): any[] => [];

export const getTrips = (_lang: string): any[] => [];

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

export const getOffices = (_lang: string): any[] => [];

export const getPlaces = (_lang: string): any[] => [];

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
