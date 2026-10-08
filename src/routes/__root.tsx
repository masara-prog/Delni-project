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

import appCss from "../styles.css?url";
import { FloatingChat } from "@/components/FloatingChat";
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
  { label: "🧑‍✈️ لوحة تحكم السائق", labelEn: "🧑‍✈️ Driver Panel", to: "/dashboard/driver", badge: "سائق" },
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
          className={`bg-gradient-to-b from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] text-white py-3.5 px-2.5 shadow-soft transition-all duration-300 flex flex-col items-center gap-2 group border-y border-white/20 ${
            language === 'ar' ? 'rounded-l-2xl border-l' : 'rounded-r-2xl border-r'
          }`}
          title={t('dashboards')}
        >
          <span className="text-xl animate-bounce">🧭</span>
          <span className="[writing-mode:vertical-lr] text-[10px] font-black tracking-widest text-white/95 group-hover:text-white transition uppercase">
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
              <p className="text-[10px] text-teal-200/70 font-bold">{language === 'ar' ? 'التنقل السريع بين حسابات المنصة' : 'Quick role switcher'}</p>
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
          <div className="text-[10px] font-black text-slate-500 tracking-wider mb-2 px-2">{language === 'ar' ? 'التنقل العام' : 'General Navigation'}</div>
          {GENERAL_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
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

          <div className="text-[10px] font-black text-slate-500 tracking-wider mb-2 px-2">{language === 'ar' ? 'لوحات التحكم للأدوار' : 'Role Dashboards'}</div>
          {DASHBOARD_LINKS.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <a
                key={link.to}
                href={link.to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-sun text-gold-foreground shadow-gold"
                    : "text-slate-350 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span>{language === 'ar' ? link.label : link.labelEn}</span>
                {link.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md ${
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
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-[10px] text-slate-450 leading-relaxed">
          <div className="font-bold text-slate-400">💡 {language === 'ar' ? 'تلميح للمعاينة:' : 'Preview Tip:'}</div>
          {language === 'ar' ? 'تتيح لك هذه اللوحة التنقل السريع بين أدوار المستخدمين المختلفة لمحاكاة تجربة الاستخدام بشكل كامل.' : 'Easily switch roles (Admin, Driver, Guide, Tourist, Transport) to simulate the full user experience.'}
        </div>
      </div>
    </>
  );
}

function NotFoundComponent() {
  const { t } = useLanguage();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {t('home')}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "ليبيا رحلات Pro | حجز الرحلات، الفنادق والمغامرات" },
      {
        name: "description",
        content:
          "منصة ليبيا رحلات Pro للسياحة والخدمات — احجز رحلاتك، فنادقك، ووسائل النقل بتجربة عصرية وموثوقة.",
      },
      { property: "og:title", content: "ليبيا رحلات Pro — اكتشف ليبيا" },
      {
        property: "og:description",
        content: "احجز رحلات ليبيا الداخلية بسهولة: فنادق، سيارات، ومعالم لا تُنسى.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/logo.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700&display=swap",
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
      </LanguageProvider>
    </QueryClientProvider>
  );
}

