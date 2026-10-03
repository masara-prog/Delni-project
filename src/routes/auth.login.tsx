import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import heroImg from "@/assets/hero-leptis.jpg";
import destSabratah from "@/assets/dest-sabratah.png";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import { BackHome } from "@/components/BackHome";
import { Logo } from "@/components/Logo";
import { useLanguage } from "@/lib/i18n";
import { MapPin } from "lucide-react";

export const Route = createFileRoute("/auth/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول | دَلِّني" },
      { name: "description", content: "سجّل دخولك إلى منصة دَلِّني لخدمات السياحة والسفر في ليبيا." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

type Role = "tourist" | "guide" | "transport" | "driver";

const LANDMARK_SLIDES = [
  { img: heroImg, titleAr: "لبدة الكبرى — تحفة البحر المتوسط", locationAr: "الخمس" },
  { img: destSabratah, titleAr: "مسرح وآثار صبراتة الرومانية", locationAr: "صبراتة" },
  { img: destCyrene, titleAr: "قورينا وشحات — عبق الجبل الأخضر", locationAr: "شحات" },
  { img: destGhadames, titleAr: "غدامس — لؤلؤة الصحراء والتراث", locationAr: "غدامس" },
  { img: destUbari, titleAr: "بحيرات أوباري — واحة الرمال الذهبية", locationAr: "أوباري" },
  { img: destAcacus, titleAr: "جبال تدرارت أكاكوس — سحر الصحراء", locationAr: "غات" },
  { img: destTripoli, titleAr: "السراي الحمراء والمدينة القديمة", locationAr: "طرابلس" },
];

function LoginPage() {
  const [role, setRole] = useState<Role>("tourist");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);
  const { dir } = useLanguage();

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % LANDMARK_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = LANDMARK_SLIDES[slideIdx];

  const roles = [
    { id: "tourist" as const, label: "سائح", desc: "استكشف واحجز رحلاتك", emoji: "🧳" },
    { id: "guide" as const, label: "مرشد سياحي", desc: "أدر جولاتك ومواعيدك", emoji: "🗺️" },
    { id: "transport" as const, label: "شركة نقل", desc: "أدر أسطولك وسائقيك", emoji: "🚌" },
    { id: "driver" as const, label: "سائق", desc: "استقبل الرحلات المخصصة", emoji: "🚗" },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#FAF7F2]" dir={dir}>
      {/* Visual side - Crisp Landmark Slideshow without blur */}
      <div className="relative hidden lg:block overflow-hidden h-full">
        {LANDMARK_SLIDES.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
              idx === slideIdx ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.img}
              alt={slide.titleAr}
              className={`w-full h-full object-cover brightness-[1.05] contrast-[1.03] transition-transform duration-[6000ms] ease-out ${
                idx === slideIdx ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        ))}

        {/* Crisp Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#1B5A78]/40 to-transparent z-1" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#D96B27]/20 via-transparent to-transparent z-1" />

        <div className="relative z-10 h-full flex flex-col justify-between p-10 xl:p-12 text-white">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 w-fit group">
              <Logo size="lg" textColor="light" />
            </Link>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold text-white shadow-sm transition-all duration-300">
              <MapPin className="w-4 h-4 text-[#D96B27]" />
              <span>{currentSlide.titleAr}</span>
            </span>
          </div>

          <div className="max-w-lg space-y-4">
            <div className="inline-block px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-[#D96B27] to-[#1B5A78] text-white text-xs font-black tracking-wide shadow-md">
              بوابة السياحة الذكية
            </div>
            <h2 className="text-3xl xl:text-4xl font-black leading-tight text-white drop-shadow-md">
              اكتشف روعة ليبيا بكل أمان وموثوقية
            </h2>
            <p className="text-white/95 text-sm xl:text-base leading-relaxed drop-shadow-sm font-medium">
              انضم إلى مجتمع دَلِّني — منصتك الشاملة لحجز الرحلات، الفنادق، النقل السياحي وخدمات المرشدين المعتمدين.
            </p>

            {/* Slideshow Indicator Dots */}
            <div className="flex items-center gap-2 pt-1">
              {LANDMARK_SLIDES.map((slide, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlideIdx(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === slideIdx ? "w-8 bg-[#D96B27]" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  title={slide.titleAr}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form side - All Text Right-Aligned & Icon-Only Logo */}
      <div className="flex items-center justify-center p-6 md:p-10 lg:p-12 min-h-screen bg-[#FAF7F2] overflow-y-auto">
        <div className="w-full max-w-lg my-auto text-right">
          {/* Header Row: Icon-only Logo on Right, Navigation Arrow Button on Left */}
          <div className="flex items-center justify-between mb-8">
            <Logo size="lg" showText={false} />
            <BackHome />
          </div>

          {/* Right-aligned Headings */}
          <div className="mb-6 text-right">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F172A] flex items-center justify-start gap-2 tracking-tight">
              <span>أهلاً بعودتك</span>
              <span className="animate-wave inline-block origin-bottom-right">👋</span>
            </h1>
            <p className="text-[#718096] text-xs sm:text-sm font-semibold mt-2 text-right">
              اختر نوع حسابك وسجّل دخولك للمتابعة.
            </p>
          </div>

          {/* 2x2 Role Selector Cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            {roles.map((r) => {
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-3.5 sm:p-4 rounded-[22px] bg-white text-right transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "border-2 border-[#1B5A78] shadow-sm ring-1 ring-[#1B5A78]/20"
                      : "border border-[#E2E8F0] shadow-2xs hover:border-[#1B5A78]/40"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-black text-xs sm:text-sm text-[#0F172A] truncate">
                      {r.label}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[#718096] font-medium truncate mt-0.5">
                      {r.desc}
                    </div>
                  </div>
                  <span className="text-2xl sm:text-3xl shrink-0">{r.emoji}</span>
                </button>
              );
            })}
          </div>

          {/* Form Controls - Right Aligned */}
          <form className="space-y-4 text-right" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs sm:text-sm font-bold text-[#0F172A] mb-1.5 block text-right">
                البريد الإلكتروني أو رقم الهاتف
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@dalni.ly"
                className="w-full h-13 sm:h-14 px-5 rounded-2xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0F172A] placeholder:text-[#A0AEC0] outline-none focus:border-[#1B5A78] focus:ring-2 focus:ring-[#1B5A78]/15 transition shadow-2xs text-right"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs sm:text-sm font-bold text-[#0F172A]">كلمة المرور</label>
                <a href="#" className="text-xs sm:text-sm font-bold text-[#1B5A78] hover:underline">
                  نسيت كلمة المرور؟
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-13 sm:h-14 px-5 pl-20 rounded-2xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0F172A] placeholder:text-[#A0AEC0] outline-none focus:border-[#1B5A78] focus:ring-2 focus:ring-[#1B5A78]/15 transition shadow-2xs text-right"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-[#1B5A78] hover:underline transition cursor-pointer py-1"
                >
                  {showPass ? "إخفاء" : "إظهار"}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-start gap-2.5 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs sm:text-sm text-[#718096] font-semibold">
                <input
                  type="checkbox"
                  className="w-5 h-5 rounded-md border-2 border-[#CBD5E0] accent-[#1B5A78] cursor-pointer"
                />
                <span>تذكرني على هذا الجهاز</span>
              </label>
            </div>

            <Link
              to={
                role === "guide"
                  ? "/dashboard/guide"
                  : role === "transport"
                  ? "/dashboard/transport"
                  : role === "driver"
                  ? "/dashboard/driver"
                  : "/dashboard/tourist"
              }
              className="w-full h-13 sm:h-14 rounded-2xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-black text-base sm:text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition flex items-center justify-center mt-2 cursor-pointer"
            >
              تسجيل الدخول
            </Link>
          </form>

          {/* Right-aligned Signup Footer */}
          <div className="mt-6 text-right text-xs sm:text-sm text-[#718096] font-medium">
            ليس لديك حساب؟{" "}
            <Link to="/auth/signup" className="text-[#1B5A78] font-black hover:underline mr-1">
              أنشئ حساباً جديداً
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
