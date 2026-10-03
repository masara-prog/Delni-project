import { createFileRoute, Link } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import heroImg from "@/assets/hero-leptis.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import destTripoliOldCity from "@/assets/dest-tripoli-old-city.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destSabratah from "@/assets/dest-sabratha.jpg";
import destGharyanCave from "@/assets/dest-gharyan-cave.jpg";
import destKsarDesert from "@/assets/dest-ksar-desert.jpg";
import destHarborCoast from "@/assets/dest-harbor-coast.jpg";
import destJabalAkhdarPanorama from "@/assets/dest-jabal-akhdar-panorama.jpg";
import destJabalAkhdarBridge from "@/assets/dest-jabal-akhdar-bridge.jpg";
import destJabalAkhdarForest from "@/assets/dest-jabal-akhdar-forest.jpg";
import destUbariGaberoun from "@/assets/dest-ubari-gaberoun.jpg";
import destUbariUmmAlMaa from "@/assets/dest-ubari-ummalmaa.jpg";
import destAcacusArch from "@/assets/dest-acacus-arch.jpg";
import destSaharaDunes from "@/assets/dest-sahara-dunes.jpg";
import offerDesert from "@/assets/offer-desert.jpg";
import restaurantImg from "@/assets/restaurant-libya.jpg";
import cafeImg from "@/assets/cafe-libya.jpg";
import privateTripImg from "@/assets/private-trip.jpg";
import officeBusImg from "@/assets/office-bus.jpg";
import transportHero from "@/assets/transport-hero.jpg";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";



export const Route = createFileRoute("/")({
  component: HomePage,
});

import { Icon } from "@/components/Icons";

/* ---------- Reveal on scroll ---------- */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setShown(true), io.disconnect()),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return { ref, shown };
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, shown } = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-300 ${shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {children}
    </div>
  );
}

/* ---------- Data ---------- */
import { getOffers, getTrips, getTripTypesData, getOffices, getPlaces, getPopularTrips } from "@/lib/homeData";

import { BookingModal, DetailsModal, useModalPair, type DetailsItem, type BookableItem, TripScheduleModal, PrivateTripModal } from "@/components/Modals";

/* ---------- Modals context ---------- */
type ModalsCtx = { 
  openDetails: (i: DetailsItem) => void; 
  openBooking: (i: BookableItem) => void;
  openSchedule: (kind: "daily" | "weekly", customSchedules?: any[], customTitle?: string, customImage?: string) => void;
  openPrivate: () => void;
};
const ModalsContext = createContext<ModalsCtx | null>(null);
const useModals = () => useContext(ModalsContext)!;


/* ---------- Component ---------- */
function HomePage() {
  const modals = useModalPair();
  const [scheduleKind, setScheduleKind] = useState<"daily" | "weekly" | null>(null);
  const [customSchedules, setCustomSchedules] = useState<any[] | undefined>(undefined);
  const [customTitle, setCustomTitle] = useState<string | undefined>(undefined);
  const [customImage, setCustomImage] = useState<string | undefined>(undefined);
  const [privateOpen, setPrivateOpen] = useState(false);

  return (
    <ModalsContext.Provider value={{ 
      openDetails: modals.openDetails, 
      openBooking: modals.openBooking,
      openSchedule: (kind, schedules, title, image) => {
        setCustomSchedules(schedules);
        setCustomTitle(title);
        setCustomImage(image);
        setScheduleKind(kind);
      },
      openPrivate: () => setPrivateOpen(true)
    }}>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Hero />
        <TrustStrip />
        <DepartureOffices />
        <WhyUs />
        <Testimonials />
        <CTABanner />
        <Footer />
      </div>
      <DetailsModal open={!!modals.detailsItem} onClose={modals.closeDetails} item={modals.detailsItem} onBook={() => {
        const item = modals.detailsItem;
        modals.bookFromDetails((title, subtitle) => {
          if (subtitle && (subtitle.includes("خاصة") || subtitle.includes("Private"))) {
            setPrivateOpen(true);
          } else if (item?.schedules && item.schedules.length > 0) {
            setCustomSchedules(item.schedules);
            setCustomTitle(item.title);
            setCustomImage(item.image);
            setScheduleKind(subtitle && subtitle.includes("أسبوعية") ? "weekly" : "daily");
          } else {
            setCustomSchedules(undefined);
            setCustomTitle(undefined);
            setCustomImage(undefined);
            setScheduleKind(subtitle && subtitle.includes("أسبوعية") ? "weekly" : "daily");
          }
        });
      }} />
      <BookingModal open={!!modals.bookingItem} onClose={modals.closeBooking} item={modals.bookingItem} />
      <TripScheduleModal 
        open={!!scheduleKind} 
        onClose={() => {
          setScheduleKind(null);
          setCustomSchedules(undefined);
          setCustomTitle(undefined);
          setCustomImage(undefined);
        }} 
        kind={scheduleKind} 
        customSchedules={customSchedules}
        customTitle={customTitle}
        customImage={customImage}
      />
      <PrivateTripModal open={privateOpen} onClose={() => setPrivateOpen(false)} />
    </ModalsContext.Provider>
  );
}





import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

/* ---------- Navbar ---------- */
function Navbar() {
  const { language } = useLanguage();

  return (
    <div className="absolute top-6 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12">
      <Link to="/" className="flex items-center drop-shadow-xl hover:scale-105 transition-transform">
        <Logo size="xl" showText={false} />
      </Link>
      <div className="flex items-center gap-3">
        <Link
          to="/auth/login"
          className="px-5 py-2.5 rounded-full bg-white/15 backdrop-blur-md border border-white/30 text-white text-sm font-black hover:bg-white/25 transition-all shadow-md"
        >
          {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
        </Link>
        <Link
          to="/auth/signup"
          className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#D96B27] hover:brightness-110 text-white text-sm font-black shadow-lg hover:scale-105 transition-all border border-white/20"
        >
          {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
        </Link>
      </div>
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const { language, t } = useLanguage();

  const heroLandmarks = [
    { img: heroImg, titleAr: "لبدة الكبرى — تحفة البحر المتوسط الرومانية", titleEn: "Leptis Magna Roman Ruins" },
    { img: destSabratah, titleAr: "مسرح صبراتة الروماني الساحلي الأيقوني", titleEn: "Sabratha Coastal Roman Theatre" },
    { img: destUbariGaberoun, titleAr: "بحيرات أوباري وقبرعون — واحة الرمال الذهبية", titleEn: "Ubari Lakes & Gaberoun Oasis" },
    { img: destJabalAkhdarPanorama, titleAr: "الجبل الأخضر وقورينا — بانوراما الطبيعة الخلابة والبحر", titleEn: "Green Mountain & Cyrene Coastal Panorama" },
    { img: destAcacusArch, titleAr: "جبال تدرارت أكاكوس — قوس تكهوري والنقوش الصخرية", titleEn: "Tadrart Acacus & Takarkori Rock Arch" },
    { img: destTripoli, titleAr: "قوس ماركوس أوريليوس والمدينة القديمة بطرابلس", titleEn: "Marcus Aurelius Arch & Old Tripoli" },
    { img: destJabalAkhdarBridge, titleAr: "الجبل الأخضر — جسر وادي الكوف والغابات الشاهقة", titleEn: "Wadi Al-Kuf Canyon Bridge & Green Mountain Forests" },
    { img: destGhadames, titleAr: "غدامس — لؤلؤة الصحراء والتراث العالمي", titleEn: "Old Town of Ghadames Oasis" },
    { img: destGharyanCave, titleAr: "بيوت الحفر التراثية وعمارة جبل نفوسة", titleEn: "Gharyan Troglodyte Cave Houses" },
  ];

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % heroLandmarks.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [heroLandmarks.length]);

  const activeLandmark = heroLandmarks[currentIdx];

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden pb-12">
      {/* Changing Background Image Slideshow with Silky Smooth Crossfade */}
      {heroLandmarks.map((item, index) => (
        <img
          key={item.img}
          src={item.img}
          alt={language === 'ar' ? item.titleAr : item.titleEn}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out brightness-105 contrast-[1.02] ${
            index === currentIdx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
        />
      ))}
      {/* Completely clear with no white fog or haze */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/50 via-black/20 to-transparent pointer-events-none" />
      <Navbar />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-36 pb-10 md:pt-44 md:pb-16">
        <div className="max-w-3xl text-white animate-fade-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-sm font-medium mb-6">
            <Icon.Sparkle className="w-4 h-4 text-amber-300" />
            {language === 'ar' ? 'اكتشف ليبيا كما لم تراها من قبل' : 'Discover Libya like never before'}
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6 drop-shadow-lg">
            {language === 'ar' ? (
              <>
                رحلتك تبدأ من
                <span className="block text-[#D96B27] drop-shadow-md">دَلِّــنِي</span>
              </>
            ) : (
              <>
                Your Journey Begins With
                <span className="block text-[#D96B27] drop-shadow-md">Dallani</span>
              </>
            )}
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl leading-relaxed">
            {language === 'ar'
              ? 'احجز فنادقك، رحلاتك، ووسائل نقلك في أجمل معالم ليبيا — من صخور أكاكوس إلى مدرج صبراتة، تجربة سياحية عصرية وموثوقة بين يديك.'
              : 'Book your hotels, desert tours, and transportation across Libya’s finest heritage & natural wonders — a modern & secure travel experience.'}
          </p>

          {/* Clean Inline Stats */}
          <div className="flex items-center gap-4 mt-6">
            <FloatingStat 
              icon={<Icon.Pin className="w-5 h-5" />} 
              value="+120" 
              label={language === 'ar' ? "وجهة سياحية" : "Tourist Destinations"} 
            />
            <FloatingStat 
              icon={<Icon.Users className="w-5 h-5" />} 
              value="+45K" 
              label={language === 'ar' ? "مسافر سعيد" : "Happy Travelers"} 
            />
          </div>
        </div>

        {/* Search Card */}
        <div className="relative mt-8 md:mt-10 animate-fade-up" style={{ animationDelay: "200ms" }}>
          <SearchCard />
        </div>
      </div>
    </section>
  );
}

function FloatingStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="animate-float-slow bg-white/95 backdrop-blur-md rounded-2xl px-5 py-3 shadow-card flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-sea grid place-items-center text-primary-foreground">{icon}</div>
      <div>
        <div className="text-lg font-black text-foreground leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    </div>
  );
}

function SearchCard() {
  const { language, t } = useLanguage();
  const [tab, setTab] = useState<"attractions" | "trips" | "stays" | "restaurants" | "guides" | "cars">("attractions");
  const tabs = [
    { id: "attractions", label: language === 'ar' ? "معالم ليبيا" : "Timeless Landmarks", icon: <Icon.Sparkle className="w-4 h-4" />, to: "/attractions" },
    { id: "trips", label: language === 'ar' ? "الرحلات السياحية" : "Trips & Tours", icon: <Icon.Compass className="w-4 h-4" />, to: "/trips" },
    { id: "stays", label: language === 'ar' ? "الفنادق والإقامة" : "Stays & Hotels", icon: <Icon.Bed className="w-4 h-4" />, to: "/hotels" },
    { id: "restaurants", label: language === 'ar' ? "المطاعم والمقاهي" : "Dining & Cafes", icon: <Icon.Utensils className="w-4 h-4" />, to: "/restaurants" },
    { id: "guides", label: language === 'ar' ? "المرشدون السياحيون" : "Tour Guides", icon: <Icon.Users className="w-4 h-4" />, to: "/guides" },
    { id: "cars", label: language === 'ar' ? "المركبات والنقل" : "Transport & Vehicles", icon: <Icon.Car className="w-4 h-4" />, to: "/transport" },
  ] as const;

  return (
    <div className="bg-white rounded-3xl shadow-card p-2 md:p-3">
      <div className="flex gap-1.5 p-1.5 mb-2 overflow-x-auto no-scrollbar">
        {tabs.map((tItem) => (
          <Link
            key={tItem.id}
            to={tItem.to}
            onClick={() => setTab(tItem.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-300 cursor-pointer ${
              tab === tItem.id
                ? "bg-[#003580] text-white shadow-md border border-[#003580] scale-105"
                : "text-slate-700 hover:text-[#003580] hover:bg-slate-100/80 border border-transparent"
            }`}
            style={{ fontFamily: "'Cairo', sans-serif" }}
          >
            {tItem.icon}
            <span>{tItem.label}</span>
          </Link>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        <SearchField 
          className="md:col-span-4" 
          icon={<Icon.Pin className="w-5 h-5" />} 
          label={language === 'ar' ? "الوجهة" : "Destination"} 
          placeholder={t('search_placeholder')} 
          iconColor="bg-blue-600/10 text-blue-600 border-blue-500/25"
        />
        <SearchField 
          className="md:col-span-3" 
          icon={<Icon.Cal className="w-5 h-5" />} 
          label={language === 'ar' ? "بداية الرحلة" : "Start Date"} 
          placeholder={language === 'ar' ? "اختر التاريخ" : "Select date"} 
          type="date" 
          iconColor="bg-emerald-500/10 text-emerald-600 border-emerald-500/25"
        />
        <SearchField 
          className="md:col-span-3" 
          icon={<Icon.Cal className="w-5 h-5" />} 
          label={language === 'ar' ? "نهاية الرحلة" : "End Date"} 
          placeholder={language === 'ar' ? "اختر التاريخ" : "Select date"} 
          type="date" 
          iconColor="bg-blue-600/10 text-blue-600 border-blue-500/25"
        />
        <div className="md:col-span-2 flex">
          <Link
            to={tab === "stays" ? "/hotels" : tab === "cars" ? "/transport" : tab === "restaurants" ? "/restaurants" : tab === "guides" ? "/guides" : tab === "attractions" ? "/attractions" : "/trips"}
            className="w-full h-full min-h-[56px] rounded-2xl bg-gradient-to-r from-[#003580] to-[#0D5C96] hover:from-[#002866] hover:to-[#003580] text-white font-black text-base shadow-md hover:-translate-y-0.5 transition flex items-center justify-center gap-2"
          >
            <Icon.Search className="w-5 h-5" />
            {t('search_button')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function SearchField({
  icon,
  label,
  placeholder,
  type = "text",
  className = "",
  iconColor = "bg-[#D96B27]/10 text-[#D96B27] border-[#D96B27]/25",
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  type?: string;
  className?: string;
  iconColor?: string;
}) {
  return (
    <label className={`group flex items-center gap-3 p-3 rounded-2xl border border-border hover:border-primary/50 hover:bg-muted/40 transition cursor-pointer ${className}`}>
      <div className={`w-11 h-11 shrink-0 rounded-xl border grid place-items-center ${iconColor}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-[11px] font-black text-foreground/70 uppercase tracking-wide">{label}</div>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-sm font-bold text-foreground placeholder:text-muted-foreground/60 py-0.5"
        />
      </div>
    </label>
  );
}

/* ---------- Trust strip ---------- */
function TrustStrip() {
  const { language } = useLanguage();
  const items = [
    { 
      icon: <Icon.Shield className="w-6 h-6" />, 
      title: language === 'ar' ? "حجز آمن ١٠٠٪" : "100% Secure Booking", 
      sub: language === 'ar' ? "دفع محمي ومضمون" : "Protected & Guaranteed",
      color: "bg-emerald-500/10 text-emerald-600"
    },
    { 
      icon: <Icon.Star className="w-6 h-6" />, 
      title: language === 'ar' ? "تقييمات موثوقة" : "Verified Reviews", 
      sub: language === 'ar' ? "من زوار حقيقيين" : "By Real Travelers",
      color: "bg-amber-500/10 text-amber-600"
    },
    { 
      icon: <Icon.Car className="w-6 h-6" />, 
      title: language === 'ar' ? "مرشدون وسائقون معتمدون" : "Certified Guides & Drivers", 
      sub: language === 'ar' ? "تغطية في كافة المدن" : "Full Coverage Across Libya",
      color: "bg-blue-600/10 text-blue-600"
    },
    { 
      icon: <Icon.Users className="w-6 h-6" />, 
      title: language === 'ar' ? "دعم على مدار الساعة" : "24/7 Dedicated Support", 
      sub: language === 'ar' ? "فريق متخصص" : "Expert Team",
      color: "bg-[#D96B27]/10 text-[#D96B27]"
    },
  ];

  return (
    <div className="border-y border-border bg-white py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${it.color}`}>
              {it.icon}
            </div>
            <div>
              <div className="font-bold text-foreground text-sm md:text-base">{it.title}</div>
              <div className="text-xs text-muted-foreground">{it.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ---------- Destinations ---------- */
function Destinations() {
  const modals = useModals();
  const { language } = useLanguage();
  const popularTrips = getPopularTrips(language);
  return (
    <section id="destinations" className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={language === 'ar' ? "اكتشف ليبيا" : "Explore Libya"}
          title={language === 'ar' ? "وجهات لا تفوتها" : "Unmissable Destinations"}
          desc={language === 'ar' ? "من ساحل المتوسط إلى قلب الصحراء الكبرى — كنوز ليبيا تنتظرك." : "From the Mediterranean coast to the heart of the Sahara — Libya's treasures await."}
        />
        <div className="mt-8 relative">
          <div className="flex gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 -mx-4 px-4 scroll-smooth">
            {popularTrips.map((d, i) => (
              <Reveal key={d.name} delay={i * 80}>
                <button
                  onClick={() => modals.openDetails({
                    title: d.name,
                    subtitle: d.tripType,
                    image: d.img,
                    description: d.description,
                    bookable: true,
                    schedules: d.schedules,
                    info: [
                      { label: "النوع", value: d.tripType },
                      { label: "التصنيف", value: d.tag },
                      { label: "المدة", value: d.duration },
                      { label: "التكلفة", value: d.price },
                    ],
                    features: d.features,
                  })}
                  className="group relative overflow-hidden rounded-3xl shadow-card cursor-pointer h-80 w-[300px] md:w-[340px] shrink-0 snap-start text-right"
                >
                  <img src={d.img} alt={d.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.2s] group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-xs font-bold text-primary">{d.tripType}</div>
                  <div className="absolute bottom-0 inset-x-0 p-6 text-white">
                    <div className="text-xs opacity-80">{d.tag}</div>
                    <h3 className="text-2xl font-black mt-1 mb-2">{d.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-gold font-bold text-sm">{d.price}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-black bg-white/20 backdrop-blur px-3 py-1 rounded-full group-hover:bg-gold group-hover:text-gold-foreground transition-all">
                        احجز
                        <Icon.Chevron className="w-4 h-4 rotate-180" />
                      </span>
                    </div>
                  </div>
                </button>
              </Reveal>
            ))}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-2">← اسحب لعرض المزيد →</div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Why Us ---------- */
function WhyUs() {
  const { language } = useLanguage();
  const feats = language === 'ar' ? [
    { icon: <Icon.Shield className="w-7 h-7" />, title: "حجوزات محمية", desc: "دفعات آمنة مع ضمان استرداد الأموال في حال الإلغاء." },
    { icon: <Icon.Car className="w-7 h-7" />, title: "شركات نقل موثوقة", desc: "أسطول متكامل من السيارات مع سائقين معتمدين ومقيمين." },
    { icon: <Icon.Star className="w-7 h-7" />, title: "تقييمات حقيقية", desc: "تقييمات من مسافرين فعليين لضمان جودة الخدمة." },
    { icon: <Icon.Sparkle className="w-7 h-7" />, title: "خدمات ذكية بالذكاء الاصطناعي", desc: "توصيات مخصصة تناسب اهتماماتك وميزانيتك." },
  ] : [
    { icon: <Icon.Shield className="w-7 h-7" />, title: "Protected Bookings", desc: "Secure payments with money-back guarantee on cancellation." },
    { icon: <Icon.Car className="w-7 h-7" />, title: "Reliable Transport", desc: "A full fleet of vehicles with certified resident drivers." },
    { icon: <Icon.Star className="w-7 h-7" />, title: "Real Reviews", desc: "Reviews from actual travelers to ensure service quality." },
    { icon: <Icon.Sparkle className="w-7 h-7" />, title: "AI-Powered Services", desc: "Personalized recommendations to suit your interests and budget." },
  ];
  return (
    <section id="why" className="py-10 md:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <div className="relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-card aspect-[4/5]">
              <img src={destAcacus} alt={language === 'ar' ? "جبال تدرارت أكاكوس" : "Acacus Mountains"} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden md:block w-56 rounded-3xl overflow-hidden shadow-card rotate-[-4deg] hover:rotate-0 transition-transform">
              <img src={destUbariGaberoun} alt={language === 'ar' ? "بحيرة قبرعون بأوباري" : "Gaberoun Lake, Ubari"} className="w-full h-40 object-cover" />
              <div className="p-3 bg-white">
                <div className="text-xs text-muted-foreground">{language === 'ar' ? "الأكثر شعبية" : "Most Popular"}</div>
                <div className="font-black text-sm">{language === 'ar' ? "بحيرات أوباري وقبرعون" : "Ubari Lakes"}</div>
              </div>
            </div>
            <div className="absolute -top-6 -right-4 hidden md:flex items-center gap-2 bg-white rounded-2xl px-4 py-3 shadow-card animate-float-slow">
              <div className="w-10 h-10 rounded-full bg-gradient-sun grid place-items-center">
                <Icon.Star className="w-5 h-5 text-gold-foreground" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">{language === 'ar' ? "تقييم المستخدمين" : "User Rating"}</div>
                <div className="font-black text-foreground">4.9 / 5</div>
              </div>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/25 text-xs font-black uppercase tracking-wider">
              {language === 'ar' ? "لماذا دلني" : "Why Dallani"}
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-black leading-tight text-foreground">
              {language === 'ar' ? "خبرة ليبية،" : "Libyan Expertise,"}
              <br />
              <span className="text-gradient-sea">{language === 'ar' ? "تقنية عصرية." : "Modern Technology."}</span>
            </h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              {language === 'ar' 
                ? "دلّني منصة متكاملة تجمع لك أفضل مقدمي الخدمات السياحية في ليبيا — من الفنادق وشركات النقل إلى المرشدين المحليين، بواجهة سهلة وتجربة موثوقة." 
                : "Dallani is an integrated platform bringing you the best tourism service providers in Libya — from hotels and transport to local guides, with an easy interface and reliable experience."}
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {feats.map((f, i) => {
              const bgColors = [
                "bg-emerald-600 text-white",
                "bg-blue-600 text-white",
                "bg-amber-500 text-white",
                "bg-[#D96B27] text-white"
              ];
              return (
                <Reveal key={f.title} delay={i * 90}>
                  <div className="group p-5 rounded-2xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition">
                    <div className={`w-12 h-12 rounded-xl grid place-items-center shadow-md mb-3 group-hover:scale-110 transition ${bgColors[i % 4]}`}>
                      {f.icon}
                    </div>
                    <div className="font-black text-foreground">{f.title}</div>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{f.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const { language } = useLanguage();
  const items = [
    {
      name: language === 'ar' ? "أحمد الفيتوري" : "Ahmed Al-Fitouri",
      city: language === 'ar' ? "بنغازي" : "Benghazi",
      role: language === 'ar' ? "مسافر / سائح" : "Traveler",
      avatar: "أ",
      stars: 5,
      text: language === 'ar'
        ? "تجربة رائعة! حجزت رحلة إلى أوباري عبر دلني وكل شيء كان منظماً — من السائق إلى الفندق. أنصح به بشدة."
        : "Amazing experience! Booked an Ubari trip via Dallani and everything was organized — from driver to hotel. Highly recommend!",
      gradient: "from-teal-500 to-sky-500",
    },
    {
      name: language === 'ar' ? "سارة الطرابلسي" : "Sarah Al-Tripoli",
      city: language === 'ar' ? "طرابلس" : "Tripoli",
      role: language === 'ar' ? "مسافرة / عائلية" : "Family Traveler",
      avatar: "س",
      stars: 5,
      text: language === 'ar'
        ? "أسهل منصة استخدمتها لحجز فندق داخل ليبيا. الأسعار ممتازة والدعم الفني سريع جداً."
        : "Easiest platform to book a hotel in Libya. Great prices and very fast support. Will definitely use again!",
      gradient: "from-orange-500 to-amber-400",
    },
    {
      name: "Omar M.",
      city: language === 'ar' ? "مصراتة" : "Misrata",
      role: language === 'ar' ? "مسافر / مغامرة" : "Adventure Seeker",
      avatar: "O",
      stars: 5,
      text: language === 'ar'
        ? "منصة رائعة لاكتشاف كنوز ليبيا الخفية. جولة الصحراء إلى أكاكوس لن تُنسى."
        : "Great platform to discover hidden gems in Libya. The desert tour to Acacus Mountains was absolutely unforgettable.",
      gradient: "from-violet-500 to-purple-600",
    },
    {
      name: language === 'ar' ? "خالد المصراتي" : "Khaled Al-Misrati",
      city: language === 'ar' ? "مصراتة" : "Misrata",
      role: language === 'ar' ? "رجل أعمال" : "Business Traveler",
      avatar: "خ",
      stars: 5,
      text: language === 'ar'
        ? "استخدمت دلني لحجز سيارة خاصة وسائق احترافي. الخدمة ممتازة والتواصل سريع."
        : "Used Dallani to book a private car with a professional driver. Excellent service and fast communication!",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      name: language === 'ar' ? "فاطمة الجديدي" : "Fatima Al-Jadidi",
      city: language === 'ar' ? "غدامس" : "Ghadames",
      role: language === 'ar' ? "مرشدة سياحية" : "Tour Guide",
      avatar: "ف",
      stars: 5,
      text: language === 'ar'
        ? "كمرشدة سياحية، دلني غيّر طريقة تواصلي مع السلح وتنظيم جولاتي."
        : "As a tour guide, Dallani transformed how I connect with tourists and manage my tours professionally.",
      gradient: "from-rose-500 to-pink-500",
    },
  ];

  return (
    <section className="py-14 md:py-20 bg-slate-50 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider border border-primary/20">
            <Icon.Star className="w-3.5 h-3.5 text-gold" />
            {language === 'ar' ? 'آراء المسافرين' : 'Traveler Reviews'}
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            {language === 'ar' ? 'قصص من زوارنا' : 'Stories from our visitors'}
          </h2>
          <p className="mt-3 text-slate-600 text-lg">
            {language === 'ar' ? '+45,000 مسافر وثقوا بدلّني' : 'Over 45,000 travelers trusted Dallani'}
          </p>
          {/* Overall rating bar */}
          <div className="mt-6 inline-flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-3 shadow-sm">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(s => <Icon.Star key={s} className="w-5 h-5 text-gold" />)}
            </div>
            <div className="text-slate-900">
              <span className="text-2xl font-black">4.9</span>
              <span className="text-slate-500 text-sm ms-1">/ 5</span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <span className="text-slate-600 text-sm font-bold">45K+ {language === 'ar' ? 'تقييم' : 'reviews'}</span>
          </div>
        </div>

        {/* Scrollable cards */}
        <div className="flex gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-6 -mx-4 px-4 scroll-smooth">
          {items.map((item, i) => (
            <div
              key={item.name + i}
              className="group shrink-0 w-[300px] md:w-[340px] snap-start bg-white border border-slate-200 rounded-3xl p-7 hover:border-primary/40 hover:shadow-card hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Quote icon */}
              <div className="text-4xl text-slate-200 font-black leading-none mb-3">&ldquo;</div>
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: item.stars }).map((_, k) => (
                  <Icon.Star key={k} className="w-4 h-4 text-gold" />
                ))}
              </div>
              {/* Text */}
              <p className="text-slate-700 leading-relaxed flex-1 text-sm font-semibold">{item.text}</p>
              {/* Divider */}
              <div className="my-5 h-px bg-slate-100" />
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white font-black text-lg shadow-md`}>
                  {item.avatar}
                </div>
                <div>
                  <div className="font-black text-slate-900 text-sm">{item.name}</div>
                  <div className="text-xs text-slate-500 flex items-center gap-1 font-medium mt-0.5">
                    <Icon.Pin className="w-3 h-3" />
                    {item.city} · {item.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center text-xs text-slate-500 mt-2 font-medium">
          {language === 'ar' ? '← اسحب لرؤية المزيد →' : '← Scroll for more →'}
        </div>
      </div>
    </section>
  );
}

/* ---------- CTA banner ---------- */
function CTABanner() {
  const { language } = useLanguage();
  const modals = useModals();

  return (
    <section className="py-10 md:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] shadow-card">
          <img src={destHarborCoast} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 backdrop-contrast-[1.02]" />
          <div className="relative p-10 md:p-16 text-white text-center">
            <Reveal>
              <h2 className="text-3xl md:text-5xl font-black leading-tight max-w-3xl mx-auto drop-shadow-md">
                {language === 'ar' ? "جاهز لاكتشاف ليبيا؟" : "Ready to discover Libya?"}
              </h2>
              <p className="mt-4 text-white/95 max-w-xl mx-auto text-lg font-bold drop-shadow-sm">
                {language === 'ar' ? "انضم إلى آلاف المسافرين الذين يخططون لرحلاتهم بذكاء عبر دلني." : "Join thousands of travelers who plan their trips smartly via Dallani."}
              </p>
              <div className="mt-8 flex flex-wrap gap-4 justify-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    alert(language === 'ar' ? "تطبيق دلّني متوفر حالياً كنسخة ويب متجاوبة بالكامل. سيتم إطلاق تطبيقات الأندرويد والآيفون على المتاجر قريباً!" : "The Dallani app is currently available as a fully responsive web version. Android and iPhone apps will be launched in stores soon!");
                  }}
                  className="px-8 py-4 rounded-full bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#D96B27] hover:brightness-110 text-white font-black text-sm sm:text-base shadow-xl hover:scale-105 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>📱</span>
                  {language === 'ar' ? "حمّل التطبيق" : "Download App"}
                </button>
                <Link
                  to="/trips"
                  className="px-8 py-4 rounded-full bg-white/15 backdrop-blur-md border border-white/40 text-white font-black text-sm sm:text-base hover:bg-white/25 transition-all shadow-md hover:scale-105"
                >
                  {language === 'ar' ? "ابدأ رحلتك الآن" : "Start your journey now"}
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}



/* ---------- Section heading ---------- */
function SectionHeading({ eyebrow, title, desc }: { eyebrow: string; title: string; desc: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003580]/10 border border-[#003580]/20 text-[#003580] text-xs font-black uppercase tracking-wider">
        <Icon.Sparkle className="w-3.5 h-3.5" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-4xl md:text-5xl font-black text-[#0B132B] leading-tight">{title}</h2>
      <p className="mt-3 text-muted-foreground text-lg">{desc}</p>
    </div>
  );
}

/* ---------- Trip Types (Daily / Weekly / Private) ---------- */
const tripTypesData = [
  {
    id: "daily",
    tag: "رحلات يومية",
    title: "استكشف طرابلس ومعالمها في يوم واحد",
    desc: "جولة يومية ممتعة داخل طرابلس لزيارة أبرز المعالم السياحية والترفيهية: حديقة الحيوان، المتحف الوطني، السرايا الحمراء، كورنيش طرابلس، وأزقة المدينة القديمة العريقة.",
    price: "من 180 د.ل / للشخص",
    duration: "من 8 إلى 10 ساعات",
    features: ["حديقة الحيوان", "المتحف الوطني والسرايا الحمراء", "كورنيش طرابلس والمدينة القديمة", "نقل مكيف بمرشد سياحي"],
    img: destTripoli,
    accent: "from-sky-500/40 to-primary/40",
  },
  {
    id: "weekly",
    tag: "رحلات أسبوعية",
    title: "أسبوع كامل بين معالم ليبيا",
    desc: "برنامج متكامل لمدة ٥ إلى ٧ أيام يشمل الإقامة والتنقل بين طرابلس، غدامس، أوباري، وأكاكوس.",
    price: "من 2,400 د.ل / للشخص",
    duration: "من 5 إلى 7 أيام",
    features: ["إقامة فندقية", "٣ وجبات يومياً", "دليل مقيم", "برنامج مرن"],
    img: destGhadames,
    accent: "from-[#F59E0B]/30 to-[#D96B27]/30",
  },
  {
    id: "private",
    tag: "رحلات خاصة",
    title: "رحلتك على مقاسك",
    desc: "خطط رحلة خاصة بك مع سائق ومرشد مخصص — اختر الوجهات، المدة، وأسلوب السفر الذي يناسبك.",
    price: "حسب الطلب",
    duration: "مرونة كاملة",
    features: ["مسار مخصص", "سيارة خاصة", "مرشد مخصص", "دعم 24/7"],
    img: privateTripImg,
    accent: "from-[#F59E0B]/40 via-[#D96B27]/20 to-transparent",
  },
];

function TripTypes() {
  const [active, setActive] = useState("daily");
  const { language } = useLanguage();
  const tripTypesData = getTripTypesData(language);
  const current = tripTypesData.find((t) => t.id === active)!;

  return (
    <section id="trip-types" className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={language === 'ar' ? "أنواع الرحلات" : "Trip Types"}
          title={language === 'ar' ? "اختر رحلتك المثالية" : "Choose Your Ideal Trip"}
          desc={language === 'ar' ? "رحلات يومية سريعة، برامج أسبوعية شاملة، أو رحلات خاصة مصممة لك." : "Quick daily trips, comprehensive weekly programs, or private trips tailored for you."}
        />

        <div className="mt-10 flex flex-wrap justify-center gap-2">
          {tripTypesData.map((t) => (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              className={`px-6 py-3 rounded-full text-sm font-black transition-all duration-200 ${
                active === t.id
                  ? "bg-gradient-to-r from-[#003580] to-[#0D5C96] text-white shadow-lg shadow-blue-900/30 scale-105"
                  : "bg-white text-foreground border border-border hover:border-blue-500 hover:text-blue-700"
              }`}
            >
              {t.tag}
            </button>
          ))}
        </div>

        <Reveal>
          <div className="mt-10 grid lg:grid-cols-2 gap-8 items-center bg-gradient-sand rounded-[2.5rem] overflow-hidden shadow-card">
            <div className="relative h-72 lg:h-[480px] overflow-hidden">
              <img src={current.img} alt={current.title} className="absolute inset-0 w-full h-full object-cover animate-zoom-slow" />
              <div className={`absolute inset-0 bg-gradient-to-tr ${current.accent}`} />
              <div className="absolute bottom-6 right-6 px-4 py-2 rounded-full bg-white/95 backdrop-blur text-primary font-black text-sm">
                {current.tag}
              </div>
            </div>
            <div className="p-8 lg:p-12">
              <h3 className="text-3xl md:text-4xl font-black text-foreground leading-tight">{current.title}</h3>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">{current.desc}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200">
                  <div className="text-xs text-orange-600 font-bold">{language === 'ar' ? "السعر" : "Price"}</div>
                  <div className="font-black text-orange-600 mt-1">{current.price}</div>
                </div>
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
                  <div className="text-xs text-amber-700 font-bold">{language === 'ar' ? "المدة" : "Duration"}</div>
                  <div className="font-black text-foreground mt-1">{current.duration}</div>
                </div>
              </div>
              <ul className="mt-5 grid grid-cols-2 gap-2">
                {current.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-foreground font-semibold">
                    <span className="w-5 h-5 rounded-full bg-gold text-gold-foreground grid place-items-center text-[10px] font-black">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/trips"
                  className="px-6 py-3 rounded-xl border border-border bg-white text-foreground font-bold hover:border-primary transition"
                >
                  {language === 'ar' ? "عرض التفاصيل" : "View Details"}
                </Link>
              </div>

            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function DepartureOffices() {
  const { language } = useLanguage();
  const offices = getOffices(language);
  return (
    <section className="py-20 md:py-28 bg-gradient-sand">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <Reveal>
            <div className="relative rounded-[2rem] overflow-hidden shadow-card">
              <img src={transportHero} alt="مكتب دلني" className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 right-6 text-white">
                <div className="text-xs opacity-80">{language === 'ar' ? "من مكاتبنا الرسمية" : "From Our Official Offices"}</div>
                <div className="text-2xl font-black">{language === 'ar' ? "نقاط الانطلاق" : "Departure Points"}</div>
              </div>
            </div>
          </Reveal>
          <div>
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#003580]/10 text-[#003580] border border-[#003580]/20 text-xs font-black uppercase tracking-wider">
              <Icon.Pin className="w-3.5 h-3.5" />
              {language === 'ar' ? "نقاط الانطلاق" : "Departure Points"}
            </span>
            <h2 className="mt-4 text-4xl md:text-5xl font-black text-foreground leading-tight">
              {language === 'ar' ? "انطلق من أقرب " : "Depart From Your Nearest "}
              <span className="text-gradient-sea">{language === 'ar' ? "مكتب لك" : "Office"}</span>
            </h2>
            <p className="mt-3 text-muted-foreground text-lg leading-relaxed">
              {language === 'ar' 
                ? "جميع الرحلات اليومية والأسبوعية والخاصة تنطلق من مكاتب الشركة الرسمية في طرابلس وبنغازي — لضمان أعلى مستويات الأمان والتنظيم." 
                : "All daily, weekly, and private trips depart from our official company offices in Tripoli and Benghazi — to ensure the highest levels of safety and organization."}
            </p>
            <div className="mt-8 space-y-3">
              {offices.map((o, i) => (
                <Reveal key={o.city} delay={i * 100}>
                  <div className="group p-5 rounded-2xl bg-white border border-border hover:border-primary/40 hover:shadow-card transition">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-xl grid place-items-center shrink-0 shadow-sm ${i === 0 ? 'bg-[#003580] text-white' : 'bg-[#D96B27] text-white'}`}>
                          <Icon.Pin className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-black text-lg text-foreground">{o.city}</h3>
                            <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 border border-amber-500/30 font-black uppercase">{o.role}</span>
                          </div>
                          <div className="text-sm text-muted-foreground mt-0.5">{o.address}</div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-foreground/80">
                            <span className="font-semibold">📞 {o.phone}</span>
                            <span>{o.hours}</span>
                          </div>
                        </div>
                      </div>
                      <button className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-[#003580]/10 text-[#003580] border border-[#003580]/20 text-xs font-black hover:bg-[#003580] hover:text-white transition">
                        الاتجاهات
                      </button>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Places() {
  const { language } = useLanguage();
  const places = getPlaces(language);
  const modals = useModals();

  return (
    <section id="places" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={language === 'ar' ? "الأماكن السياحية" : "Tourist Attractions"}
          title={language === 'ar' ? "معالم ليبيا الخالدة" : "Timeless Landmarks of Libya"}
          desc={language === 'ar' ? "جولة بصرية بين أهم المعالم الأثرية والطبيعية — تعرّف قبل أن تزور." : "A visual tour among the most key historical and natural landmarks — discover before you visit."}
        />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {places.map((p, i) => (
            <Reveal key={p.name} delay={i * 70}>
              <article className="group relative bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition h-full flex flex-col">
                <div className="relative h-56 overflow-hidden">
                  <img src={p.img} alt={p.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gold text-gold-foreground text-[11px] font-black">
                    {p.tag}
                  </div>
                  <div className="absolute bottom-3 right-4 text-white">
                    <div className="text-xs opacity-80 flex items-center gap-1">
                      <Icon.Pin className="w-3 h-3" /> {p.city}
                    </div>
                    <h3 className="text-xl font-black">{p.name}</h3>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-muted-foreground">{language === 'ar' ? "النوع" : "Type"}</div>
                    <div className="font-black text-sm text-foreground">{p.type}</div>
                  </div>
                  {(p as any).hasTrips ? (
                    <button
                      onClick={() => modals.openSchedule("daily", (p as any).schedules, p.name)}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-white bg-primary hover:bg-primary/90 text-xs font-black transition"
                    >
                      {language === 'ar' ? "عرض الرحلات" : "View Trips"}
                      <Icon.Chevron className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  ) : (
                    <button
                      onClick={() => modals.openPrivate()}
                      className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-primary bg-accent hover:bg-primary hover:text-white text-xs font-black transition border border-primary/20"
                    >
                      {language === 'ar' ? "طلب رحلة خاصة" : "Request Private Trip"}
                      <Icon.Chevron className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  )}

                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Restaurants & Cafes (view-only) ---------- */
function RestaurantsCafes() {
  const { language } = useLanguage();
  const modals = useModals();
  const restaurants = [
    { name: language === 'ar' ? "مطعم الأصالة الليبي" : "Al-Asala Libyan Restaurant", city: language === 'ar' ? "طرابلس" : "Tripoli", cuisine: language === 'ar' ? "ليبي تقليدي" : "Traditional Libyan", rating: 4.8, img: restaurantImg, price: "$$" },
    { name: language === 'ar' ? "مطعم النخيل" : "Al-Nakheel Restaurant", city: language === 'ar' ? "بنغازي" : "Benghazi", cuisine: language === 'ar' ? "مأكولات بحرية" : "Seafood", rating: 4.7, img: restaurantImg, price: "$$$" },
    { name: language === 'ar' ? "مقهى الفنون" : "Arts Cafe", city: language === 'ar' ? "طرابلس المدينة القديمة" : "Tripoli Old City", cuisine: language === 'ar' ? "قهوة وحلويات" : "Coffee & Sweets", rating: 4.9, img: cafeImg, price: "$" },
    { name: language === 'ar' ? "مقهى الواحة" : "Oasis Cafe", city: language === 'ar' ? "غدامس" : "Ghadames", cuisine: language === 'ar' ? "شاي وأتاي" : "Tea & Atay", rating: 4.6, img: cafeImg, price: "$" },
  ];

  return (

    <section id="restaurants" className="py-20 md:py-28 bg-accent/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow={language === 'ar' ? "ذوق ليبيا" : "Taste of Libya"}
          title={language === 'ar' ? "مطاعم ومقاهي مختارة" : "Selected Restaurants & Cafes"}
          desc={language === 'ar' ? "أفضل الوجهات لتذوق نكهات ليبيا الأصيلة — العرض هنا للتعريف فقط، والحجز يتم مباشرة مع المكان." : "Top destinations to taste authentic Libyan flavors — shown here for informational purposes only, booking is done directly with the place."}
        />
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/20 text-primary text-xs font-black">
            <Icon.Shield className="w-4 h-4" />
            {language === 'ar' ? "المطاعم والمقاهي غير قابلة للحجز عبر المنصة — للعرض فقط" : "Restaurants and cafes are not bookable via the platform — for display only"}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {restaurants.map((r, i) => (
            <Reveal key={r.name} delay={i * 80}>
              <article className="group bg-white rounded-3xl overflow-hidden shadow-soft hover:shadow-card transition h-full flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img src={r.img} alt={r.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur text-[11px] font-black text-primary">
                    {r.price}
                  </div>
                  <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gold text-gold-foreground text-[11px] font-black">
                    <Icon.Star className="w-3 h-3" />
                    {r.rating}
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <Icon.Pin className="w-3 h-3" /> {r.city}
                  </div>
                  <h3 className="font-black text-foreground mt-1">{r.name}</h3>
                  <div className="text-xs text-muted-foreground mt-1">{r.cuisine}</div>
                  <button
                    onClick={() => modals.openDetails({
                      title: r.name,
                      subtitle: `${r.city} · ${r.cuisine}`,
                      image: r.img,
                      description: language === 'ar' ? `${r.name} — أحد أفضل الأماكن لتجربة نكهات ${r.cuisine}. للعرض فقط والحجز يتم مباشرة مع المكان.` : `${r.name} — One of the best places to experience ${r.cuisine} flavors. For display only, booking is direct.`,
                      bookable: false,
                      info: [
                        { label: language === 'ar' ? "المدينة" : "City", value: r.city },
                        { label: language === 'ar' ? "المطبخ" : "Cuisine", value: r.cuisine },
                        { label: language === 'ar' ? "الأسعار" : "Prices", value: r.price },
                        { label: language === 'ar' ? "التقييم" : "Rating", value: `${r.rating} / 5` },
                      ],
                    })}
                    className="mt-auto pt-3 text-primary text-xs font-black inline-flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    {language === 'ar' ? "عرض التفاصيل" : "View Details"}
                    <Icon.Chevron className="w-3.5 h-3.5 rotate-180" />
                  </button>

                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}