import { Link } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import { Logo } from "@/components/Logo";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/i18n";

export type NavItem = { id: string; label: string; icon: string; badge?: string | number; group?: string };

export function DashboardShell({
  role,
  roleLabel,
  userName,
  nav,
  active,
  onNavigate,
  children,
}: {
  role: string;
  roleLabel: string;
  userName: string;
  nav: NavItem[];
  active: string;
  onNavigate: (id: string) => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { dir, language } = useLanguage();
  const isAr = language === 'ar';

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
            <Link to="/support" className="hidden md:inline-flex items-center gap-2 px-3 h-9 rounded-xl border border-border bg-white text-xs font-bold hover:border-primary/40 transition">
              💬 {isAr ? "الدعم" : "Support"}
            </Link>
            <button className="relative p-2 rounded-xl hover:bg-muted transition" aria-label="notifications">
              <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
            </button>
            <div className="flex items-center gap-2.5 px-3 border-x border-border">
              <div className="w-9 h-9 rounded-full bg-gradient-sea text-white grid place-items-center font-black text-sm shadow-soft">
                {userName.charAt(0)}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-black text-foreground leading-none">{userName}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{roleLabel}</div>
              </div>
            </div>
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
            background: "linear-gradient(165deg, #0F172A 0%, #1E293B 40%, #0F172A 100%)",
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
                <div className="w-10 h-10 rounded-xl bg-gradient-sun text-gold-foreground grid place-items-center font-black text-base shadow-gold flex-shrink-0">
                  {userName.charAt(0)}
                </div>
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
                    className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
                      isActive
                        ? "bg-gradient-sun text-gold-foreground shadow-gold"
                        : "hover:bg-white/5"
                    }`}
                    style={!isActive ? { color: "rgba(255,255,255,0.72)" } : {}}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`w-8 h-8 rounded-lg grid place-items-center text-base flex-shrink-0 transition-all ${
                          isActive
                            ? "bg-white/25"
                            : "bg-white/5 group-hover:bg-white/10"
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="text-[13px] font-bold leading-tight">{item.label}</span>
                    </span>
                    {item.badge !== undefined && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-black flex-shrink-0 ${
                          isActive
                            ? "bg-gold-foreground/20 text-gold-foreground"
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
              onClick={() => {
                if (window.confirm("هل أنت متأكد من تسجيل الخروج؟")) {
                  window.location.href = "/";
                }
              }}
              className="w-full mt-2 flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 hover:bg-red-500/10 text-red-400 group"
            >
              <span className="w-8 h-8 rounded-lg grid place-items-center text-base flex-shrink-0 transition-all bg-white/5 group-hover:bg-red-500/20">
                🚪
              </span>
              <span className="text-[13px] font-bold leading-tight">{isAr ? "تسجيل الخروج" : "Logout"}</span>
            </button>

            {/* Divider */}
            <div className="my-4 h-px" style={{ background: "rgba(197,160,89,0.12)" }} />

            {/* Help card */}
            <div
              className="p-4 rounded-2xl"
              style={{ background: "linear-gradient(135deg, rgba(197,160,89,0.15) 0%, rgba(168,131,68,0.1) 100%)", border: "1px solid rgba(197,160,89,0.2)" }}
            >
              <div className="text-sm font-black text-white">{isAr ? "تحتاج مساعدة؟" : "Need Help?"}</div>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
                {isAr ? "تواصل مع الدعم عبر المحادثة الفورية." : "Contact live support anytime."}
              </p>
              <Link
                to="/support"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg transition"
                style={{ background: "rgba(197,160,89,0.25)", color: "rgba(197,160,89,1)" }}
              >
                {isAr ? "فتح المحادثة ←" : "Open Chat →"}
              </Link>
            </div>

            {/* Version */}
            <div className="pt-3 text-center">
              <span className="text-[10px] font-bold" style={{ color: "rgba(255,255,255,0.2)" }}>
                {isAr ? "منصة دَلِّني · v2.0.0" : "Dallani Platform · v2.0.0"}
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "sea",
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: string;
  tone?: "sea" | "sun" | "clay" | "green";
}) {
  const tones: Record<string, string> = {
    sea: "bg-gradient-sea text-white",
    sun: "bg-gradient-sun text-gold-foreground",
    clay: "bg-secondary text-white",
    green: "bg-emerald-500 text-white",
  };
  return (
    <div className="p-5 rounded-2xl bg-white border border-border shadow-soft hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold text-muted-foreground">{label}</div>
          <div className="text-2xl md:text-3xl font-black text-foreground mt-1">{value}</div>
          {hint && <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>}
        </div>
        <div className={`w-11 h-11 rounded-xl grid place-items-center text-xl ${tones[tone]} shadow-soft`}>{icon}</div>
      </div>
    </div>
  );
}

export function SectionCard({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-2xl shadow-soft">
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-black text-foreground">{title}</h3>
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
