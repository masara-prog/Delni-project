export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Navbar & Common
    platform_name: "ليبيا رحلات Pro",
    home: "الرئيسية",
    trips: "الرحلات السياحية",
    hotels: "أماكن الإقامة",
    transport: "السيارات والمركبات",
    restaurants: "المطاعم والمقاهي",
    attractions: "المعالم والآثار",
    support: "مركز الدعم",
    login: "تسجيل الدخول",
    signup: "إنشاء حساب",
    dashboards: "لوحات التحكم",
    admin_dash: "لوحة الإدارة",
    tourist_dash: "لوحة السائح",
    guide_dash: "لوحة المرشد",
    driver_dash: "لوحة السائق",
    transport_dash: "لوحة النقل",

    // Search & Filter
    search_placeholder: "ابحث عن رحلة، فندق، مطعم، أو معلم سياحي...",
    all_regions: "جميع المناطق",
    search_button: "بحث",
    filter_by: "تصفية حسب",
    price: "السعر",
    rating: "التقييم",
    category: "التصنيف",
    book_now: "احجز الآن",
    details: "التفاصيل",
    per_person: "للشخص",
    per_night: "لليلة",

    // Hero & Landing Page
    hero_title: "استكشف سحر وسر جمال ليبيا مع رحلات Pro",
    hero_subtitle: "منصتك الأولى الشاملة لحجز الرحلات الصحراوية، الفنادق الفاخرة، وسائل النقل والتنقلات مع مرشدين معتمدين.",
    explore_trips: "استكشف الرحلات",
    view_hotels: "استعرض الفنادق",
    popular_destinations: "وجهات شائعة في ليبيا",
    featured_trips: "أحدث الرحلات المتميزة",
    why_us: "لماذا تختار منصتنا؟",
    safe_booking: "حجز آمن وضمان كامل",
    verified_guides: "مرشدون محليون معتمدون",
    best_prices: "أفضل الأسعار والعروض",
    support_24: "دعم موثوق 24/7",

    // Footer
    footer_desc: "المنصة السياحية المتكاملة الأولى في ليبيا لحجز وتأمين الرحلات والفنادق والنقل بكفاءة عالية.",
    quick_links: "روابط سريعة",
    contact_us: "تواصل معنا",
    all_rights_reserved: "جميع الحقوق محفوظة © 2026 ليبيا رحلات Pro",

    // Chatbot
    chat_title: "المساعد السياحي الذكي",
    chat_placeholder: "اكتب استفسارك هنا...",
    send: "إرسال",

    // Auth
    welcome_back: "مرحباً بك مجدداً",
    create_account: "إنشاء حساب جديد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    full_name: "الاسم الكامل",
    phone: "رقم الهاتف",
    account_type: "نوع الحساب",
    tourist_role: "سائح",
    guide_role: "مرشد سياحي",
    driver_role: "سائق",
    company_role: "شركة نقل / فندق",
  },
  en: {
    // Navbar & Common
    platform_name: "Libya Journeys Pro",
    home: "Home",
    trips: "Trips & Tours",
    hotels: "Stays & Hotels",
    transport: "Transport & Buses",
    restaurants: "Restaurants & Cafes",
    attractions: "Attractions & Heritage",
    support: "Support Center",
    login: "Sign In",
    signup: "Register",
    dashboards: "Dashboards",
    admin_dash: "Admin Panel",
    tourist_dash: "Tourist Panel",
    guide_dash: "Guide Panel",
    driver_dash: "Driver Panel",
    transport_dash: "Transport Panel",

    // Search & Filter
    search_placeholder: "Search trips, hotels, restaurants, or attractions...",
    all_regions: "All Regions",
    search_button: "Search",
    filter_by: "Filter by",
    price: "Price",
    rating: "Rating",
    category: "Category",
    book_now: "Book Now",
    details: "Details",
    per_person: "per person",
    per_night: "per night",

    // Hero & Landing Page
    hero_title: "Explore the Hidden Magic of Libya with Journeys Pro",
    hero_subtitle: "Your premier all-in-one platform to book desert safaris, luxury hotels, transportation & certified local guides.",
    explore_trips: "Explore Tours",
    view_hotels: "View Hotels",
    popular_destinations: "Popular Destinations in Libya",
    featured_trips: "Featured Trips",
    why_us: "Why Choose Our Platform?",
    safe_booking: "Secure Booking & Guarantee",
    verified_guides: "Certified Local Guides",
    best_prices: "Best Prices & Offers",
    support_24: "24/7 Dedicated Support",

    // Footer
    footer_desc: "Libya's premier integrated tourism platform for booking tours, stays, and transportation with top quality.",
    quick_links: "Quick Links",
    contact_us: "Contact Us",
    all_rights_reserved: "All rights reserved © 2026 Libya Journeys Pro",

    // Chatbot
    chat_title: "Smart Travel Assistant",
    chat_placeholder: "Type your query here...",
    send: "Send",

    // Auth
    welcome_back: "Welcome Back",
    create_account: "Create New Account",
    email: "Email Address",
    password: "Password",
    full_name: "Full Name",
    phone: "Phone Number",
    account_type: "Account Type",
    tourist_role: "Tourist / Visitor",
    guide_role: "Tour Guide",
    driver_role: "Driver",
    company_role: "Transport Co. / Hotel",
  }
};

export type TranslationKey = keyof typeof translations.ar;
