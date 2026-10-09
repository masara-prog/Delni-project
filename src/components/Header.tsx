import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";
import { NotificationBell } from "@/components/NotificationBell";
import { getStoredSession, clearStoredSession } from "@/lib/api";
import {
  Home,
  Plane,
  Compass,
  Landmark,
  Building2,
  Bus,
  UtensilsCrossed,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

interface HeaderProps {
  active?: "home" | "trips" | "guides" | "hotels" | "transport" | "restaurants" | "attractions" | "offers" | "support";
}

const ROLE_DASHBOARDS: Record<string, { path: string; labelAr: string; labelEn: string; icon: string }> = {
  tourist: { path: "/dashboard/tourist", labelAr: "لوحة السائح", labelEn: "Tourist Panel", icon: "👤" },
  guide: { path: "/dashboard/guide", labelAr: "لوحة المرشد", labelEn: "Guide Panel", icon: "🗺️" },
  driver: { path: "/dashboard/driver", labelAr: "لوحة السائق", labelEn: "Driver Panel", icon: "🧑‍✈️" },
  transport: { path: "/dashboard/transport", labelAr: "لوحة النقل", labelEn: "Transport Co.", icon: "🚐" },
  admin: { path: "/dashboard/admin", labelAr: "لوحة الإدارة", labelEn: "Admin Panel", icon: "👑" },
};

export function Header({ active }: HeaderProps) {
  const { language, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{ token: string | null; role: string | null; user: any } | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const s = getStoredSession();
      if (s.token && s.user) {
        setSession(s);
      } else {
        setSession(null);
      }
    };
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟")) {
      clearStoredSession();
      setSession(null);
      window.location.href = "/";
    }
  };

  const currentRole = session?.role && ROLE_DASHBOARDS[session.role] ? ROLE_DASHBOARDS[session.role] : null;
  const userName = session?.user?.name || session?.user?.full_name || (language === 'ar' ? 'حسابي' : 'My Account');

  const navItems = [
    { key: "home", label: language === 'ar' ? 'الرئيسية' : 'Home', to: "/", icon: Home },
    { key: "attractions", label: language === 'ar' ? 'معالم ليبيا' : 'Landmarks', to: "/attractions", icon: Landmark },
    { key: "trips", label: language === 'ar' ? 'الرحلات السياحية' : 'Trips', to: "/trips", icon: Plane },
    { key: "hotels", label: language === 'ar' ? 'الفنادق' : 'Hotels', to: "/hotels", icon: Building2 },
    { key: "restaurants", label: language === 'ar' ? 'المقاهي والمطاعم' : 'Cafes & Dining', to: "/restaurants", icon: UtensilsCrossed },
    { key: "guides", label: language === 'ar' ? 'المرشدون السياحيون' : 'Guides', to: "/guides", icon: Compass },
    { key: "transport", label: language === 'ar' ? 'المركبات' : 'Transport', to: "/transport", icon: Bus },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-40 bg-gradient-to-b from-black/80 via-black/30 to-transparent border-b border-white/10 text-white" dir={dir}>
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20 gap-2 sm:gap-4">
        {/* Left/Right Logo Emblem Only */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
            aria-label="القائمة الرئيسية"
          >
            {mobileMenuOpen ? (
              <span className="text-xl leading-none">✕</span>
            ) : (
              <span className="text-xl leading-none">☰</span>
            )}
          </button>

          {/* Logo Emblem ONLY (showText=false) */}
          <Link to="/" className="flex items-center gap-2 shrink-0 hover:scale-105 transition-transform">
            <Logo size="lg" showText={false} />
          </Link>
        </div>

        {/* Desktop Pill Navigation Bar with pure white vector icons */}
        <nav className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs font-bold whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? "bg-white/25 text-white border border-white/50 shadow-sm font-black scale-105"
                    : "text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 border border-transparent"
                }`}
              >
                <Icon className="w-4 h-4 text-white shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          <div className="hidden sm:block shrink-0">
            <LanguageToggle className="p-2 text-white hover:bg-white/10" />
          </div>
          <div className="shrink-0 text-white">
            <NotificationBell />
          </div>

          {/* Dynamic Auth State: Dashboard + Logout if logged in, Sign In if guest */}
          {session && currentRole ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link
                to={currentRole.path}
                className="h-10 px-3 sm:px-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#1B5A78] to-[#13445C] hover:from-[#13445C] hover:to-[#0F3548] border border-white/20 text-white text-xs sm:text-sm font-black shadow-soft hover:scale-105 transition-all whitespace-nowrap"
                title={language === 'ar' ? currentRole.labelAr : currentRole.labelEn}
              >
                <span className="text-sm sm:text-base">{currentRole.icon}</span>
                <span className="max-w-[85px] sm:max-w-[120px] truncate">{userName}</span>
                <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white/90 font-bold hidden md:inline-block">
                  {language === 'ar' ? currentRole.labelAr : currentRole.labelEn}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="h-10 w-10 inline-flex items-center justify-center rounded-xl bg-red-500/20 hover:bg-red-500/35 border border-red-400/30 text-red-200 hover:text-white transition-all shadow-soft"
                title={language === 'ar' ? 'تسجيل الخروج' : 'Sign Out'}
                aria-label="تسجيل الخروج"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="h-10 px-4 sm:px-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white text-xs sm:text-sm font-black shadow-soft hover:scale-105 transition-all whitespace-nowrap shrink-0"
            >
              {language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#1B5A78] border-b border-white/15 animate-in slide-in-from-top-4 duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-1.5">
            <div className="flex items-center justify-between px-2 pb-2 mb-2 border-b border-white/15">
              <span className="text-[11px] font-black text-white/70 tracking-wider uppercase">
                {language === 'ar' ? 'أقسام المنصة' : 'Platform Navigation'}
              </span>
              <LanguageToggle className="text-xs py-1 px-2.5 bg-white/10 border-white/20 text-white" />
            </div>

            {/* Mobile Auth Status Card */}
            {session && currentRole ? (
              <div className="p-3 mb-2 rounded-xl bg-black/25 border border-white/15 flex items-center justify-between">
                <Link
                  to={currentRole.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 text-white font-bold text-sm"
                >
                  <span className="text-lg">{currentRole.icon}</span>
                  <div>
                    <div className="text-white font-black">{userName}</div>
                    <div className="text-[11px] text-teal-200">{language === 'ar' ? currentRole.labelAr : currentRole.labelEn}</div>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-red-500/30 hover:bg-red-500/50 text-red-100 text-xs font-bold transition"
                >
                  {language === 'ar' ? 'خروج' : 'Logout'}
                </button>
              </div>
            ) : (
              <Link
                to="/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full mb-2 h-11 flex items-center justify-center rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black text-sm shadow-soft"
              >
                {language === 'ar' ? 'تسجيل الدخول للمنصة' : 'Sign In'}
              </Link>
            )}

            {navItems.map((item) => {
              const isActive = active === item.key;
              const Icon = item.icon;
              return (
                <Link
                  key={item.key}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition ${
                    isActive
                      ? "bg-white/20 text-white border border-white/30"
                      : "text-white/80 hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-4 h-4 text-white shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}

