import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { Home, RotateCw } from "lucide-react";

import appCss from "../styles.css?url";
import { FloatingChat } from "@/components/FloatingChat";
import { PlatformAlert } from "@/components/PlatformAlert";
import { LanguageProvider, useLanguage } from "@/lib/i18n";
import { LanguageToggle } from "@/components/LanguageToggle";

// ========= شريط جانبي مؤقت للوحات التحكم (Role Dashboards Sidebar) =========
const GENERAL_LINKS = [
  { label: "🏠 الرئيسية", labelEn: "🏠 Home", to: "/" },
  { label: "🏛️ معالم ليبيا", labelEn: "🏛️ Landmarks", to: "/attractions" },
  { label: "✈️ الرحلات السياحية", labelEn: "✈️ Trips", to: "/trips" },
  { label: "🏨 الفنادق", labelEn: "🏨 Hotels", to: "/hotels" },
  { label: "🍽️ المطاعم والمقاهي", labelEn: "🍽️ Dining & Cafes", to: "/restaurants" },
  { label: "🗺️ المرشدون السياحيون", labelEn: "🗺️ Guides", to: "/guides" },
  { label: "🚌 المركبات والنقل", labelEn: "🚌 Transport", to: "/transport" },
];

const DASHBOARD_LINKS = [
  { label: "🛡️ لوحة الإدارة", labelEn: "🛡️ Admin Panel", to: "/dashboard/admin", badge: "أدمن" },
  { label: "🚐 لوحة شركة النقل", labelEn: "🚐 Transport Co.", to: "/dashboard/transport", badge: "شركة" },
  { label: "🚘 لوحة تحكم السائق", labelEn: "🚘 Driver Panel", to: "/dashboard/driver", badge: "سائق" },
  { label: "🗺️ لوحة تحكم المرشد", labelEn: "🗺️ Guide Panel", to: "/dashboard/guide", badge: "مرشد" },
  { label: "👤 لوحة تحكم السائح", labelEn: "👤 Tourist Panel", to: "/dashboard/tourist", badge: "سائح" },
];

function RoleDashboardsSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { language, t } = useLanguage();

  return (
    <>
      {/* Floating Language & Dashboard Buttons Container */}
      <div className={`fixed top-1/3 -translate-y-1/2 z-[90] flex flex-col gap-2 ${language === 'ar' ? 'right-0' : 'left-0'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className={`bg-gradient-to-b from-[#D96B27] to-[#EA580C] hover:bg-[#C25B1E] text-white py-3.5 px-2.5 shadow-soft transition duration-300 flex flex-col items-center gap-2 group border-y border-white/20 ${
            language === 'ar' ? 'rounded-l-2xl border-l' : 'rounded-r-2xl border-r'
          }`}
          title={t('dashboards')}
        >
          <span className="text-xl animate-bounce">🧭</span>
          <span className="[writing-mode:vertical-lr] text-[11px] font-black tracking-widest text-white/95 group-hover:text-white transition uppercase">
            {language === 'ar' ? 'لوحات التحكم' : 'Dashboards'}
          </span>
        </button>

        <div className="px-1">
          <LanguageToggle className="shadow-lg text-[11px] py-2 px-2" />
        </div>
      </div>

      {/* Slide-out Sidebar Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[110] bg-black/50 backdrop-blur-sm animate-in fade-in"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Body */}
      <div
        className={`fixed top-0 bottom-0 z-[120] w-76 max-w-[85vw] bg-[#0F172A] text-white shadow-card border-[#1ABC9C]/20 flex flex-col transition-transform duration-300 ease-out ${
          language === 'ar' ? 'right-0 border-l' : 'left-0 border-r'
        } ${
          isOpen ? "translate-x-0" : language === 'ar' ? "translate-x-full" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-[#1ABC9C]/20 bg-[#0B1120] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧭</span>
            <div>
              <h3 className="font-black text-sm text-white">{language === 'ar' ? 'لوحات التحكم والأدوار' : 'Role Dashboards'}</h3>
              <p className="text-[11px] text-teal-200/70 font-bold">{language === 'ar' ? 'التنقل السريع بين حسابات المنصة' : 'Quick role switcher'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white grid place-items-center text-sm transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Links list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          <div className="text-[11px] font-black text-slate-500 tracking-wider mb-2 px-2">{language === 'ar' ? 'التنقل العام' : 'General Navigation'}</div>
          {GENERAL_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-soft"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{language === 'ar' ? link.label : link.labelEn}</span>
              </a>
            );
          })}

          <div className="border-t border-slate-800 my-4" />

          <div className="text-[11px] font-black text-slate-500 tracking-wider mb-2 px-2">{language === 'ar' ? 'لوحات التحكم للأدوار' : 'Role Dashboards'}</div>
          {DASHBOARD_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition duration-200 ${
                  isActive
                    ? "bg-gradient-sun text-gold-foreground shadow-gold"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{language === 'ar' ? link.label : link.labelEn}</span>
                {link.badge && (
                  <span className={`text-[11px] font-black px-1.5 py-0.5 rounded-md ${
                    isActive ? "bg-white/30 text-gold-foreground" : "bg-slate-800 text-slate-400 group-hover:text-slate-300"
                  }`}>
                    {link.badge}
                  </span>
                )}
              </a>
            );
          })}
        </div>

        {/* Footer info inside sidebar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-450 leading-relaxed">
          <div className="font-bold text-slate-400">💡 {language === 'ar' ? 'تلميح للمعاينة:' : 'Preview Tip:'}</div>
          {language === 'ar' ? 'تتيح لك هذه اللوحة التنقل السريع بين أدوار المستخدمين المختلفة لمحاكاة تجربة الاستخدام بشكل كامل.' : 'Easily switch roles (Admin, Driver, Guide, Tourist, Transport) to simulate the full user experience.'}
        </div>
      </div>
    </>
  );
}

// One simple screen for "page not found" and "page could not load": logo, icon, a short title and one action
function StatusScreen({ dir, title, actions }: { dir: "rtl" | "ltr"; title: string; actions: ReactNode }) {
  return (
    <div dir={dir} className="relative min-h-screen overflow-hidden bg-[#F7F5F0] px-4 py-12 flex items-center justify-center">
      <div aria-hidden className="pointer-events-none absolute -top-40 -start-32 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(0,115,111,0.14),transparent_65%)]" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -end-32 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,107,39,0.12),transparent_65%)]" />
      <div className="relative w-full max-w-[380px] text-center">
        <div className="rounded-[28px] bg-white px-8 pt-8 pb-10 ring-1 ring-black/[0.05] shadow-[0_24px_60px_-28px_rgba(11,27,43,0.25)]">
          <img src="/logo.png" alt="دلّني" className="mx-auto h-28 w-auto object-contain" />
          <h1 className="mt-4 text-[22px] leading-snug font-extrabold text-[#0B1B2B]">{title}</h1>
          <div className="mt-7 flex flex-col items-center gap-3">{actions}</div>
        </div>
      </div>
    </div>
  );
}

const btnPrimary = "inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-full bg-[#00736F] px-7 text-[15px] font-bold text-white transition-[background-color,transform] hover:bg-[#0B4F57] active:scale-[0.97] cursor-pointer";
const linkQuiet = "text-[13.5px] font-semibold text-[#5B6B70] hover:text-[#00736F] transition-colors";

function NotFoundComponent() {
  const { language } = useLanguage();
  const isAr = language === "ar";

  useEffect(() => {
    document.title = isAr ? "دلّني | الصفحة غير متوفرة" : "Delni | Page not found";
  }, [isAr]);

  return (
    <StatusScreen
      dir={isAr ? "rtl" : "ltr"}
      title={isAr ? "الصفحة غير متوفرة" : "Page not found"}
      actions={
        <Link to="/" className={btnPrimary}>
          <Home className="h-[18px] w-[18px]" strokeWidth={2.25} />
          {isAr ? "العودة إلى الرئيسية" : "Back to home"}
        </Link>
      }
    />
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    document.title = "دلّني | حاول مجدداً";
    console.error("[Dalni Error Caught]:", error);
  }, [error]);

  return (
    <StatusScreen
      dir="rtl"
      title="حدث خطأ، حاول مجدداً"
      actions={
        <>
          <button
            type="button"
            onClick={() => {
              try {
                router.invalidate();
              } catch { }
              reset();
            }}
            className={btnPrimary}
          >
            <RotateCw className="h-[18px] w-[18px]" strokeWidth={2.25} />
            إعادة تحميل الصفحة
          </button>
          <a href="/" className={linkQuiet}>العودة إلى الرئيسية</a>
        </>
      }
    />
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "منصة دَلِّني للخدمات السياحية | حجز الرحلات والفنادق في ليبيا" },
      {
        name: "description",
        content:
          "منصة دَلِّني للخدمات السياحية — احجز رحلاتك، فنادقك، ووسائل النقل السياحية بتجربة عصرية وموثوقة.",
      },
      { property: "og:title", content: "منصة دَلِّني السياحية — اكتشف ليبيا" },
      {
        property: "og:description",
        content: "دليلك المتكامل لحجز الرحلات السياحية، الفنادق، والمركبات في كافة المدن الليبية.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "shortcut icon", href: "/logo.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/logo.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <Outlet />
        <FloatingChat />
        <PlatformAlert />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

