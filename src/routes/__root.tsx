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
  const { language } = useLanguage();
  const isAr = language === "ar";

  useEffect(() => {
    document.title = isAr ? "منصة دَلّني | الصفحة غير موجودة (404)" : "Dalni Platform | Page Not Found (404)";
  }, [isAr]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12" dir={isAr ? "rtl" : "ltr"}>
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
        <div className="flex justify-center">
          <img src="/logo.png" alt="دلني" className="h-16 w-auto object-contain" />
        </div>
        <div className="inline-block px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-black">
          {isAr ? "خطأ 404 — الصفحة غير متوفرة" : "Error 404 — Not Found"}
        </div>
        <h1 className="text-xl font-black text-slate-900">
          {isAr ? "الصفحة التي تبحث عنها غير موجودة" : "The page you are looking for does not exist"}
        </h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          {isAr
            ? "ربما تم تغيير مسار الصفحة أو لم تعد متوفرة. يمكنك العودة إلى الصفحة الرئيسية لمتابعة التصفح."
            : "The page may have been moved or is no longer available. You can head back to the home page."}
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] hover:from-[#C25B1E] hover:to-[#D96B27] px-6 py-3 text-xs font-black text-white shadow-soft transition-all cursor-pointer"
          >
            <span>🏠</span>
            <span>{isAr ? "العودة إلى الصفحة الرئيسية" : "Back to Home"}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  useEffect(() => {
    document.title = "منصة دَلّني للخدمات السياحية | تنبيه";
    console.error("[Dalni Error Caught]:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12" dir="rtl">
      <div className="max-w-lg w-full text-center bg-white p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-4">
        <div className="flex justify-center">
          <img src="/logo.png" alt="منصة دلني" className="h-16 w-auto object-contain" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-black border border-red-200">
          <span>⚠️</span>
          <span>منصة دَلِّني للخدمات السياحية</span>
        </div>

        <h1 className="text-xl font-black text-slate-900">
          تعذر تحميل هذه الصفحة مؤقتاً
        </h1>

        <p className="text-xs text-slate-600 leading-relaxed font-medium">
          حدث خطأ غير متوقع أثناء معالجة بيانات هذه الصفحة. البيانات آمنة في قاعدة بيانات المنصة، ويمكنك إعادة المحاولة لتحديث الجلسة أو العودة للرئيسية.
        </p>

        {error?.message && (
          <div className="text-[11px] text-slate-500 font-mono bg-slate-100 p-2.5 rounded-xl text-left ltr break-all border border-slate-200">
            {error.message}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              try {
                router.invalidate();
              } catch { }
              reset();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#003580] hover:bg-[#00224f] px-6 py-2.5 text-xs font-black text-white shadow-md transition cursor-pointer"
          >
            <span>🔄</span>
            <span>إعادة المحاولة الآن</span>
          </button>
          <a
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border-2 border-slate-200 hover:border-slate-300 bg-white px-6 py-2.5 text-xs font-black text-slate-800 transition cursor-pointer"
          >
            <span>🏠</span>
            <span>العودة للرئيسية</span>
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
        href: "https://fonts.googleapis.com/css2?family=Alexandria:wght@400;500;600;700;800&family=Cairo:wght@400;500;600;700;800;900&family=Tajawal:wght@400;500;600;700;800;900&family=Poppins:wght@400;500;600;700&display=swap",
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

