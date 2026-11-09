import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n";
import { clearStoredSession } from "@/lib/api";
import { DashboardSupportChatModal } from "@/components/DashboardSupportChatModal";
import { platformConfirm } from "@/components/PlatformAlert";
import { NotificationBell } from "@/components/NotificationBell";
import {
  BadgeCheck, BedDouble, Bell, Building2, Bus, CalendarDays, Car, ChartColumn, ClipboardCheck, Compass, Crown, Heart, House,
  IdCard, Landmark, LayoutDashboard, LogOut, MapPin, Megaphone, MessageCircle, ScanLine, Star, Ticket, UserRound, Users, UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

// One SVG icon set for every dashboard menu (by section id), so all roles share the same visual language.
// A section without an entry keeps the icon its dashboard passed.
const NAV_ICONS: Record<string, LucideIcon> = {
  overview: LayoutDashboard, scanner: ScanLine, companies: Bus, drivers: IdCard, guides: BadgeCheck, tourists: Users,
  trips: Compass, assigned_trips: Compass, bookings: Ticket, offers: Megaphone, private_trips: Crown, entities: Landmark,
  hotels: BedDouble, restaurants: UtensilsCrossed, landmarks: Landmark,
  reviews: Star, analytics: ChartColumn, inquiries_chat: MessageCircle, notifications: Bell, live_trip: MapPin,
  vehicle: Car, vehicles: Bus, profile: UserRound, calendar: CalendarDays, active_tourists: ClipboardCheck,
  favorites: Heart, company_payment: Building2,
};

export type NavItem = { id: string; label: string; icon: string; badge?: string | number; group?: string };

export function DashboardShell({
  role,
  roleLabel,
  userName,
  userAvatar,
  nav,
  active,
  onNavigate,
  children,
}: {
  role: string;
  roleLabel: string;
  userName: string;
  // The account's own photo; the first letter of the name is shown when there is none
  userAvatar?: string;
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const { dir, language } = useLanguage();
  const isAr = language === 'ar';

  // All tabs of the site share one stored session: signing in to another account in another tab replaces this
  // dashboard's token, and its requests would then be refused. Notice it and send this tab to sign in again.
  useEffect(() => {
    let warned = false;
    const check = () => {
      if (warned) return;
      const stored = localStorage.getItem("dalni_role");
      if (stored === role) return;
      warned = true;
      alert(
        stored
          ? "تم تسجيل الدخول بحساب آخر في نافذة أخرى من نفس المتصفح، فانتهت جلسة هذه اللوحة. يرجى تسجيل الدخول من جديد."
          : "انتهت جلستك أو تم تسجيل الخروج من نافذة أخرى. يرجى تسجيل الدخول من جديد."
      );
      window.location.href = "/auth/login";
    };
    window.addEventListener("storage", check);
    window.addEventListener("focus", check);
    return () => {
      window.removeEventListener("storage", check);
      window.removeEventListener("focus", check);
    };
  }, [role]);

  // ?tab=<section> (from a clicked notification) opens that section; "support" opens the support chat
  const searchStr = useRouterState({ select: (s) => s.location.searchStr });
  useEffect(() => {
    const tab = new URLSearchParams(searchStr).get("tab");
    if (!tab) return;
    if (tab === "support") setShowSupportChat(role !== "admin");
    else if (nav.some((item) => item.id === tab)) onNavigate(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchStr]);

  return (
    <div className="min-h-screen bg-gradient-sand" dir={dir}>
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-border shadow-soft">
        <div className="flex items-center justify-between px-4 md:px-6 h-16">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-muted transition"
              onClick={() => setOpen((o) => !o)}
              aria-label="menu"
            >
              <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
              </svg>
            </button>
            <Link to="/" className="flex items-center gap-2.5">
              <Logo size="sm" showText={false} />
              <div className="hidden md:block border-r border-border pr-3 mr-1">
                <div className="text-[11px] font-black text-muted-foreground tracking-wide uppercase">{roleLabel}</div>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 h-9 rounded-xl border border-border bg-white text-xs font-bold text-slate-700 hover:text-primary hover:border-primary transition shadow-2xs"
              title={isAr ? "الرجوع للصفحة الرئيسية للمنصة" : "Back to Home"}
              aria-label={isAr ? "الصفحة الرئيسية" : "Home"}
            >
              <House className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{isAr ? "الرئيسية" : "Home"}</span>
            </Link>
            {/* The admin answers support chats; he does not open one himself */}
            {role !== "admin" && (
              <button
                type="button"
                onClick={() => setShowSupportChat(true)}
                className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-border bg-white text-xs font-bold hover:border-primary/40 transition cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" aria-hidden="true" /> {isAr ? "الدعم" : "Support"}
              </button>
            )}
            <NotificationBell />
            <div className="flex items-center gap-2.5 px-3 border-x border-border">
              {userAvatar ? (
                <img src={userAvatar} alt={userName} className="w-9 h-9 rounded-full object-cover shadow-soft ring-2 ring-white" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-sea text-white grid place-items-center font-black text-sm shadow-soft">
                  {userName.charAt(0)}
                </div>
              )}
              <div className="hidden md:block">
                <div className="text-sm font-black text-foreground leading-none">{userName}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{roleLabel}</div>
              </div>
            </div>
            <button
              onClick={async () => {
                if (await platformConfirm("هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟")) {
                  clearStoredSession();
                  localStorage.removeItem("dalni_token");
                  localStorage.removeItem("dalni_role");
                  localStorage.removeItem("dalni_user");
                  window.location.href = "/";
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-500 text-red-600 hover:text-white border border-red-200 transition text-xs font-bold shadow-2xs cursor-pointer"
              title={isAr ? "تسجيل الخروج من المنصة بالكامل" : "Sign Out"}
              aria-label={isAr ? "تسجيل الخروج" : "Sign Out"}
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">{isAr ? "خروج" : "Logout"}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Overlay for mobile */}
        {open && (
          <div
            className="fixed inset-0 z-10 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`${
            dir === 'rtl'
              ? (open ? "translate-x-0" : "translate-x-full")
              : (open ? "translate-x-0" : "-translate-x-full")
          } lg:translate-x-0 fixed lg:sticky top-16 ${dir === 'rtl' ? 'right-0' : 'left-0'} z-20 h-[calc(100vh-4rem)] w-72 transition-transform duration-300 overflow-y-auto no-scrollbar`}
          style={{
            background: "#0F172A",
            borderLeft: dir === 'rtl' ? "1px solid rgba(26,188,156,0.2)" : undefined,
            borderRight: dir === 'ltr' ? "1px solid rgba(26,188,156,0.2)" : undefined,
          }}
        >
          {/* Sidebar header accent */}
          <div className="h-0.5 bg-[#1ABC9C] opacity-80" />

          <div className="p-4 space-y-1">
            {/* User card */}
            <div className="mb-5 p-3.5 rounded-2xl" style={{ background: "rgba(197,160,89,0.08)", border: "1px solid rgba(197,160,89,0.18)" }}>
              <div className="flex items-center gap-3">
                {userAvatar ? (
                  <img src={userAvatar} alt={userName} className="w-10 h-10 rounded-xl object-cover shadow-gold flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-gradient-sun text-gold-foreground grid place-items-center font-black text-base shadow-gold flex-shrink-0">
                    {userName.charAt(0)}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-sm font-black text-white leading-tight truncate">{userName}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: "rgba(197,160,89,0.8)" }}>{roleLabel}</div>
                </div>
                <div className="mr-auto flex-shrink-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                </div>
              </div>
            </div>

            {/* Nav */}
            <nav className="space-y-0.5">
              {nav.map((item) => {
                const isActive = item.id === active;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onNavigate(item.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition duration-200 group ${
                      isActive
                        ? "bg-primary text-white"
                        : "hover:bg-white/5"
                    }`}
                    style={!isActive ? { color: "rgba(255,255,255,0.72)" } : {}}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg grid place-items-center text-base flex-shrink-0 transition ${
                          isActive
                            ? "bg-white/25"
                            : "bg-white/5 group-hover:bg-white/10"
                        }`}
                      >
                        {(() => {
                          const Icon = role === "transport" && item.id === "profile" ? Building2 : NAV_ICONS[item.id];
                          return Icon ? <Icon className="w-[18px] h-[18px]" strokeWidth={2} aria-hidden="true" /> : item.icon;
                        })()}
                      </span>
                      <span className="text-[13px] font-bold leading-tight">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-500/80 text-white"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <button
              onClick={async () => {
                if (await platformConfirm("هل أنت متأكد من رغبتك في تسجيل الخروج من حسابك؟")) {
                  clearStoredSession();
                  localStorage.removeItem("dalni_token");
                  localStorage.removeItem("dalni_role");
                  localStorage.removeItem("dalni_user");
                  window.location.href = "/";
                }
              }}
              className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition duration-200 hover:bg-red-500/10 text-red-400 group cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg grid place-items-center text-base flex-shrink-0 transition bg-white/5 group-hover:bg-red-500/20">
                🚪
              </span>
              <span className="text-[13px] font-bold leading-tight">{isAr ? "تسجيل الخروج" : "Logout"}</span>
            </button>

            {/* Divider */}
            <div className="my-4 h-px" style={{ background: "rgba(197,160,89,0.12)" }} />

            {/* Help card (hidden for admin) */}
            {role !== "admin" && (
              <div
                className="p-4 rounded-2xl"
                style={{ background: "rgba(197,160,89,0.12)", border: "1px solid rgba(197,160,89,0.2)" }}
              >
                <div className="text-sm font-black text-white">{isAr ? "تحتاج مساعدة؟" : "Need Help?"}</div>
                <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {isAr ? "تواصل مع الدعم عبر المحادثة الفورية." : "Contact live support anytime."}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowSupportChat(true);
                    setOpen(false);
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-1.5 rounded-lg transition cursor-pointer shadow-xs hover:opacity-95"
                  style={{ background: "rgba(197,160,89,0.25)", color: "rgba(197,160,89,1)" }}
                >
                  {isAr ? "فتح المحادثة ←" : "Open Chat →"}
                </button>
              </div>
            )}

            {/* Version */}
            <div className="pt-3 text-center">
              <span className="text-[11px] font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>
                {isAr ? "منصة دَلِّني · v2.0.0" : "Dallani Platform · v2.0.0"}
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>

      {/* Embedded Live Support Chat Modal */}
      <DashboardSupportChatModal
        open={showSupportChat}
        onClose={() => setShowSupportChat(false)}
        userName={userName}
        userRole={roleLabel}
        role={role}
      />
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "sea",
  onClick,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  tone?: "sea" | "sun" | "clay" | "green";
  onClick?: () => void;
}) {
  const tones = {
    sea: { chip: "bg-[#1ABC9C]/12 text-[#0E8C74]", bar: "from-[#1ABC9C] to-[#0EA5AB]" },
    sun: { chip: "bg-amber-100 text-amber-700", bar: "from-amber-400 to-orange-400" },
    clay: { chip: "bg-[#C56A3D]/12 text-[#A4532B]", bar: "from-[#C56A3D] to-[#D96B27]" },
    green: { chip: "bg-emerald-100 text-emerald-700", bar: "from-emerald-400 to-teal-500" },
  }[tone];
  // Figures stay large; a text value (a trip name, "not set") gets a smaller font so it never overflows the card
  const isText = typeof value === "string" && !/^[\d\s.,%٠-٩]+$/.test(value) && value.length > 10;
  // "12 جولة", "200 د.ل / يوم": the figure stays large and its unit is written small beside it
  const unit = typeof value === "string" ? value.match(/^([\d.,٠-٩]+)\s+(.{1,16})$/) : null;
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden p-4 sm:p-5 rounded-2xl bg-white border border-border shadow-soft transition duration-200 ${
        onClick
          ? "cursor-pointer hover:shadow-card hover:-translate-y-0.5 hover:border-primary/40 active:translate-y-0 select-none group"
          : "hover:shadow-card"
      }`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-l ${tones.bar}`} aria-hidden="true" />
      <div className="flex items-start justify-between gap-3">
        <div className="text-[12px] sm:text-[13px] font-semibold text-muted-foreground group-hover:text-primary transition-colors leading-snug">{label}</div>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 ${tones.chip}`} aria-hidden="true">{icon}</span>
      </div>
      <div
        className={`mt-2 font-black text-foreground group-hover:text-primary transition-colors ${
          isText && !unit ? "text-base sm:text-lg leading-snug line-clamp-2" : "text-2xl sm:text-3xl tabular-nums tracking-tight"
        }`}
        title={typeof value === "string" ? value : undefined}
      >
        {unit ? (
          <>
            {unit[1]} <span className="text-sm sm:text-base font-bold text-muted-foreground">{unit[2]}</span>
          </>
        ) : (
          value
        )}
      </div>
      {hint && <div className="text-xs text-muted-foreground mt-1.5">{hint}</div>}
    </div>
  );
}

export function SectionCard({ title, action, children }: { title: ReactNode; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-soft">
      <div className="flex items-center justify-between p-5 border-b border-border">
        {typeof title === "string" ? (
          <h3 className="font-black text-foreground">{title}</h3>
        ) : (
          <div className="font-black text-foreground flex-1">{title}</div>
        )}
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export function Badge({ children, tone = "sea" }: { children: ReactNode; tone?: "sea" | "sun" | "clay" | "green" | "muted" | "red" }) {
  const map: Record<string, string> = {
    sea: "bg-primary/10 text-primary",
    sun: "bg-gold/20 text-gold-foreground",
    clay: "bg-secondary/15 text-secondary",
    green: "bg-emerald-100 text-emerald-700",
    muted: "bg-muted text-muted-foreground",
    red: "bg-red-100 text-red-700",
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-black ${map[tone]}`}>{children}</span>;
}
