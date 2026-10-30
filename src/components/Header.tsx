import { platformConfirm } from "@/components/PlatformAlert";
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

export const ROLE_DASHBOARDS: Record<string, { path: string; labelAr: string; labelEn: string; icon: string }> = {
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

  const handleLogout = async () => {
    if (await platformConfirm("هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟")) {
      clearStoredSession();
      setSession(null);
      window.location.href = "/";
    }
  };

  const currentRole = session?.role && ROLE_DASHBOARDS[session.role] ? ROLE_DASHBOARDS[session.role] : null;
  const accountName = session?.user?.company_name || session?.user?.name || session?.user?.full_name || (language === 'ar' ? 'حسابي' : 'My Account');

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
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto no-scrollbar py-1 text-xs font-bold whitespace-nowrap">
          {navItems.map((item) => {
            const isActive = active === item.key;
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                to={item.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? "bg-white/25 text-white border border-white/50 shadow-sm font-black scale-105"
                    : "text-white/80 hover:text-white hover:bg-white/15 hover:border-white/30 border border-transparent"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-white shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Auth State Control */}
        <div className="flex items-center gap-2 shrink-0">
          {session && <NotificationBell />}
          {session ? (
            <div className="flex items-center gap-1.5 p-1 bg-black/35 hover:bg-black/45 backdrop-blur-xl rounded-full border border-white/20 shadow-md">
              <Link
                to={currentRole ? currentRole.path : "/trips"}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:brightness-110 text-white text-xs sm:text-sm font-bold font-['Tajawal',sans-serif] shadow-sm hover:scale-105 transition-all border border-white/20 antialiased whitespace-nowrap"
                title={language === 'ar' ? "الانتقال إلى لوحة التحكم" : "Go to dashboard"}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse shadow-[0_0_6px_rgba(110,231,183,0.9)]" />
                <span className="leading-tight drop-shadow-sm max-w-[130px] truncate">{accountName}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-red-500 text-white/90 hover:text-white grid place-items-center transition-all border border-white/15 hover:border-red-400 cursor-pointer"
                title={language === 'ar' ? 'تسجيل الخروج من المنصة' : 'Logout'}
                aria-label="تسجيل الخروج"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <Link
              to="/auth/login"
              className="h-9 px-4 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white text-xs sm:text-sm font-bold font-['Tajawal',sans-serif] shadow-soft hover:scale-105 transition-all whitespace-nowrap shrink-0"
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
                    <div className="text-white font-black">{accountName}</div>
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

