import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import heroImg from "@/assets/hero-leptis.jpg";
import destSabratah from "@/assets/dest-sabratah.png";
import destCyrene from "@/assets/dest-cyrene.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destUbari from "@/assets/dest-ubari.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import destTripoli from "@/assets/dest-tripoli.jpg";
import { BackHome } from "@/components/BackHome";
import { useLanguage } from "@/lib/i18n";
import { MapPin, Award, FileText, Check, Camera, DollarSign, X, Trash2, Plus, User, Phone, Mail, Lock, Shield, Sparkles, UploadCloud, ChevronLeft, ChevronRight, Compass } from "lucide-react";
import { apiRegisterTourist, apiRegisterGuide, LARAVEL_API_URL } from "@/lib/api";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "إنشاء حساب جديد | منصة دَلِّني" },
      { name: "description", content: "سجّل حساب سائح أو مرشد سياحي في منصة دَلِّني للسياحة في ليبيا" },
    ],
  }),
  component: SignupPage,
});

type Role = "tourist" | "guide";

const LANDMARK_SLIDES = [
  { img: destAcacus, titleAr: "جبال تدرارت أكاكوس — سحر الصحراء", locationAr: "غات" },
  { img: heroImg, titleAr: "لبدة الكبرى — تحفة البحر المتوسط", locationAr: "الخمس" },
  { img: destSabratah, titleAr: "مسرح وآثار صبراتة الرومانية", locationAr: "صبراتة" },
  { img: destCyrene, titleAr: "قورينا وشحات — عبق الجبل الأخضر", locationAr: "شحات" },
  { img: destGhadames, titleAr: "غدامس — لؤلؤة الصحراء والتراث", locationAr: "غدامس" },
  { img: destUbari, titleAr: "بحيرات أوباري — واحة الرمال الذهبية", locationAr: "أوباري" },
  { img: destTripoli, titleAr: "السراي الحمراء والمدينة القديمة", locationAr: "طرابلس" },
];

const WEEKDAYS = [
  { id: "sat", nameAr: "السبت", code: "Sa" },
  { id: "sun", nameAr: "الأحد", code: "Su" },
  { id: "mon", nameAr: "الاثنين", code: "Mo" },
  { id: "tue", nameAr: "الثلاثاء", code: "Tu" },
  { id: "wed", nameAr: "الأربعاء", code: "We" },
  { id: "thu", nameAr: "الخميس", code: "Th" },
  { id: "fri", nameAr: "الجمعة", code: "Fr" },
];

function SignupPage() {
  const { dir } = useLanguage();
  const [role, setRole] = useState<Role>("tourist");
  const [guideStep, setGuideStep] = useState<1 | 2>(1);
  const [submitted, setSubmitted] = useState<null | "tourist" | "guide">(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % LANDMARK_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = LANDMARK_SLIDES[slideIdx];

  // Tourist fields
  const initialTouristState = { fullName: "", phone: "", passport: "", email: "", password: "" };
  const [tourist, setTourist] = useState(initialTouristState);

  // Landmarks registered on the platform (the guide's workplaces are chosen from these only)
  const [attractionsList, setAttractionsList] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${LARAVEL_API_URL}/places`, { headers: { Accept: "application/json" } })
      .then((r) => r.json())
      .then((res) => {
        if (res && res.success && Array.isArray(res.data)) {
          setAttractionsList(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Guide fields (with photo upload & daily rate cost)
  const initialGuideState = {
    licenseNumber: "",
    fullName: "",
    gender: "male" as "male" | "female",
    avatar: "",
    phone: "",
    years: "",
    pricePerDay: "150",
    email: "",
    password: "",
    bio: "",
    placeIds: [] as string[],
    workingDays: ["sat", "sun", "mon", "tue", "wed", "thu"] as string[],
    speaksEnglish: true,
    speaksFrench: false,
    speaksItalian: false,
    certs: [] as string[],
    certDataUrls: [] as string[],
    approvalStatus: "بانتظار الاعتماد والتوثيق من الإدارة",
  };
  const [guide, setGuide] = useState(initialGuideState);

  const togglePlaceId = (pid: string) => {
    setGuide((g) => {
      const exists = g.placeIds.includes(pid);
      return {
        ...g,
        placeIds: exists ? g.placeIds.filter((p) => p !== pid) : [...g.placeIds, pid],
      };
    });
  };

  const toggleDay = (dayId: string) => {
    setGuide((g) => {
      const exists = g.workingDays.includes(dayId);
      return {
        ...g,
        workingDays: exists
          ? g.workingDays.filter((d) => d !== dayId)
          : [...g.workingDays, dayId],
      };
    });
  };

  const toggleAllDays = () => {
    setGuide((g) => {
      const allSelected = g.workingDays.length === WEEKDAYS.length;
      return {
        ...g,
        workingDays: allSelected ? [] : WEEKDAYS.map((d) => d.id),
      };
    });
  };

  // Handle Enter key to navigate to the next input field
  const handleEnterKeyNext = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
      e.preventDefault();
      const form = (e.target as HTMLElement).closest("form");
      if (!form) return;
      const focusables = Array.from(
        form.querySelectorAll<HTMLElement>("input:not([type='hidden']):not([type='file']), select, textarea, button[type='submit']")
      ).filter(el => !el.hasAttribute("disabled") && el.offsetParent !== null);
      const currentIndex = focusables.indexOf(e.target as HTMLElement);
      if (currentIndex > -1 && currentIndex + 1 < focusables.length) {
        focusables[currentIndex + 1].focus();
      }
    }
  };

  const validateTouristForm = () => {
    if (!tourist.fullName.trim() || tourist.fullName.trim().length < 3) {
      setErrorMsg("يرجى إدخال الاسم بالكامل بشكل صحيح (٣ أحرف على الأقل).");
      return false;
    }
    const cleanPhone = tourist.phone.trim();
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setErrorMsg("رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678).");
      return false;
    }
    const cleanPassport = tourist.passport.trim();
    if (!cleanPassport || cleanPassport.length < 6) {
      setErrorMsg("رقم جواز السفر / الرقم الوطني يجب أن يحتوي على 6 خانات على الأقل.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tourist.email.trim())) {
      setErrorMsg("يرجى إدخال بريد إلكتروني صحيح ومعتمد.");
      return false;
    }
    if (tourist.password.length < 8) {
      setErrorMsg("كلمة المرور يجب أن لا تقل عن 8 خانات للحفاظ على أمان حسابك.");
      return false;
    }
    return true;
  };

  const validateGuideStep1 = () => {
    if (!guide.avatar) {
      setErrorMsg("يرجى اختيار صورة شخصية رسمية للمرشد.");
      return false;
    }
    if (!guide.fullName.trim() || guide.fullName.trim().length < 3) {
      setErrorMsg("يرجى إدخال الاسم بالكامل للمرشد (٣ أحرف على الأقل).");
      return false;
    }
    if (!guide.licenseNumber.trim() || guide.licenseNumber.trim().length < 3) {
      setErrorMsg("يرجى إدخال رقم ترخيص مزاولة الإرشاد المعتمد.");
      return false;
    }
    const cleanPhone = guide.phone.trim();
    if (!/^09\d{8}$/.test(cleanPhone)) {
      setErrorMsg("رقم هاتف المرشد يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678).");
      return false;
    }
    const price = Number(guide.pricePerDay);
    if (isNaN(price) || price < 50) {
      setErrorMsg("التكلفة اليومية للمرشد يجب أن تكون 50 د.ل على الأقل.");
      return false;
    }
    const exp = Number(guide.years);
    if (isNaN(exp) || exp < 2) {
      setErrorMsg("سنوات الخبرة السياحية للمرشد يجب أن تكون سنتين على الأقل (2 سنوات فأكثر).");
      return false;
    }
    if (!guide.bio.trim() || guide.bio.trim().length < 15) {
      setErrorMsg("يرجى كتابة نبذة تعريفية وافية عن خبرتك السياحية (15 حرف على الأقل).");
      return false;
    }
    return true;
  };

  const validateGuideStep2 = () => {
    if (!guide.placeIds || guide.placeIds.length === 0) {
      setErrorMsg("يرجى اختيار معلم سياحي واحد على الأقل تمتلك به خبرة إرشادية معتمدة من المعالم المسجلة بالمنصة.");
      return false;
    }
    if (guide.workingDays.length === 0) {
      setErrorMsg("يرجى تحديد يوم عمل واحد على الأقل في أسبوع المرشد.");
      return false;
    }
    if (guide.certs.length === 0) {
      setErrorMsg("يرجى إرفاق صورة أو مستند الترخيص الرسمي / الشهادة.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(guide.email.trim())) {
      setErrorMsg("يرجى إدخال بريد إلكتروني صحيح ومعتمد للمرشد.");
      return false;
    }
    if (guide.password.length < 8) {
      setErrorMsg("كلمة المرور يجب أن لا تقل عن 8 خانات للحفاظ على أمان حسابك.");
      return false;
    }
    return true;
  };

  if (submitted) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#FAF7F2] p-6" dir={dir}>
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-card border border-[#E8E2D6] p-8 text-center animate-in fade-in zoom-in-95">
          <div className="py-2 flex justify-center mb-4">
            <Logo size="xl" showText={false} className="scale-125 hover:scale-130 transition-transform" />
          </div>
          {submitted === "tourist" ? (
            <>
              <h1 className="mt-2 text-2xl font-black text-[#0F172A]">تم إنشاء حسابك بنجاح! 🎉</h1>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed font-medium">
                أهلاً بك في منصة دَلِّني. تم تسجيل حسابك بنجاح! يمكنك الآن استكشاف وحجز كافة الرحلات والمعالم السياحية.
              </p>
              <div className="mt-6">
                <Link
                  to="/trips"
                  className="w-full h-12 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#1B5A78] hover:from-[#C2581A] hover:to-[#13445C] text-white font-black shadow-lg hover:shadow-xl transition-all text-base cursor-pointer"
                >
                  استكشف الرحلات السياحية الآن 🧭
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black text-[#0F172A]">تم إرسال طلب انضمامك كمرشد سياحي! 📋</h1>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed font-medium">
                شكراً لتسجيلك في منصة دَلِّني. تم استلام بياناتك وصورتك ورخصة الإرشاد بنجاح. طلبك الآن <b>قيد المراجعة والتدقيق</b> من قبل إدارة المنصة للتحقق من الرخصة والاعتماد، ولا يمكنك تسجيل الدخول حتى تتم الموافقة على حسابك وتوثيقه.
              </p>
              <div className="mt-4 p-3.5 rounded-2xl bg-[#D96B27]/10 border border-[#D96B27]/30 text-xs font-bold text-[#D96B27] flex items-center justify-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D96B27] animate-pulse" />
                <span>حالة الحساب: قيد المراجعة — سيتم تفعيل الدخول فور اعتمادك من الإدارة</span>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Link
                  to="/auth/login"
                  className="w-full h-12 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#1B5A78] hover:from-[#C2581A] hover:to-[#13445C] text-white font-black text-base shadow-lg hover:shadow-xl transition-all cursor-pointer"
                >
                  الانتقال لتسجيل الدخول 🔑
                </Link>
                <Link
                  to="/"
                  className="w-full h-10 inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                >
                  العودة للرئيسية 🏠
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  const roles = [
    { id: "tourist" as const, label: "سائح", desc: "استكشاف وحجز الرحلات", emoji: "🧳" },
    { id: "guide" as const, label: "مرشد سياحي", desc: "تقديم وإدارة الجولات", emoji: "🗺️" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2]" dir={dir}>
      <div className="grid lg:grid-cols-2 min-h-screen items-start">
        {/* Visual side - Crisp Slideshow of Libyan Landmarks (Sticky & 100% fixed on desktop during scrolling) */}
        <div className="hidden lg:block sticky top-0 h-screen w-full overflow-hidden select-none z-10">
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
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/90 via-[#1B5A78]/35 to-transparent z-1" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#D96B27]/20 via-transparent to-transparent z-1" />

          <div className="relative z-10 h-full flex flex-col justify-between p-8 xl:p-10 text-white">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-xs font-bold text-white shadow-sm transition-all duration-300">
                <MapPin className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>{currentSlide.titleAr}</span>
              </span>
            </div>

            <div className="max-w-md space-y-3.5">
              <div className="inline-block px-3 py-1 rounded-lg bg-gradient-to-r from-[#D96B27] to-[#1B5A78] text-white text-[11px] font-black tracking-wide shadow-md">
                انضم إلى منصة دَلِّني
              </div>
              <h2 className="text-2xl xl:text-3xl font-black leading-tight text-white drop-shadow-md">
                ابدأ رحلتك<br />واستكشف كنوز ليبيا
              </h2>
              <p className="text-white/95 text-xs xl:text-sm leading-relaxed drop-shadow-sm font-medium">
                سجّل مجاناً وتمتع بأفضل عروض الرحلات السياحية، المرشدين المعتمدين، وحجوزات الفنادق والنقل الفوري.
              </p>

              <ul className="space-y-2 pt-1">
                {[
                  "حجز فوري وآمن بنسبة 100%",
                  "مرشدون محليون معتمدون وموثقون رسمياً",
                  "تحديد مرن لمناطق وأيام والتكلفة اليومية للمرشدين",
                  "دعم ومساعدة سياحية ذكية على مدار الساعة",
                ].map((t) => (
                  <li key={t} className="flex items-center gap-2.5 text-xs font-semibold text-white/95 drop-shadow-xs">
                    <span className="w-4.5 h-4.5 rounded-full bg-[#D96B27] text-white grid place-items-center text-[10px] font-black shrink-0 shadow-sm">✓</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>

              {/* Slideshow Indicator Dots */}
              <div className="flex items-center gap-1.5 pt-1">
                {LANDMARK_SLIDES.map((slide, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setSlideIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                      i === slideIdx ? "w-6 bg-[#D96B27]" : "w-1.5 bg-white/40 hover:bg-white/70"
                    }`}
                    title={slide.titleAr}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form side - Natural smooth scrolling, Logo & Arrow fully visible with generous top padding */}
        <div className="w-full min-h-screen flex flex-col justify-start px-6 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <div className="w-full max-w-xl mx-auto text-right pb-16">
            {/* Header Row: Clear Prominent Logo on Right, Clear Navigation Arrow on Left */}
            <div className="flex items-center justify-between mb-8 pt-2">
              <Logo size="lg" showText={false} className="hover:scale-105 transition-transform" />
              <BackHome className="w-11 h-11 border-2 border-[#E2E8F0] shadow-sm hover:border-[#1B5A78] hover:scale-105 transition-all text-[#1B5A78]" />
            </div>

            <div className="mb-4 text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#D96B27]/15 to-[#1B5A78]/15 text-[#D96B27] text-xs font-black border border-[#D96B27]/30 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>منصة دَلِّني — السياحة الليبية بأبهى صورها</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] flex items-center justify-start gap-2 tracking-tight">
                <span>إنشاء حساب جديد</span>
                <span className="text-xl sm:text-2xl">✨</span>
              </h1>
              <p className="text-[#64748B] text-xs sm:text-sm font-semibold mt-1 text-right">
                اختر نوع الحساب واملأ بياناتك بسهولة لبدء تجربتك السياحية الرائعة.
              </p>
            </div>

            {/* Interactive Top Destination Showcase Bar */}
            <div className="mb-5 p-3 rounded-2xl bg-gradient-to-r from-[#1B5A78] via-[#13445C] to-[#0F172A] text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D96B27]/25 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-1 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D96B27] to-[#EA580C] grid place-items-center text-white shrink-0 shadow-sm">
                    <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: "12s" }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
                      <span>وجهة سياحية مميزة</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D96B27] animate-ping" />
                    </div>
                    <div className="text-xs sm:text-sm font-black text-white truncate">
                      {currentSlide.titleAr}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {LANDMARK_SLIDES.map((s, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSlideIdx(i)}
                      className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                        i === slideIdx ? "w-6 bg-[#D96B27]" : "w-2 bg-white/40 hover:bg-white/80"
                      }`}
                      title={s.titleAr}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Account Role Selector */}
            {!submitted && (
              <div className="grid grid-cols-2 gap-3 mb-5">
                {roles.map((r) => {
                  const isSelected = role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-3.5 rounded-2xl text-right transition-all duration-200 cursor-pointer flex items-center justify-between gap-2.5 ${
                        isSelected
                          ? "bg-white border-2 border-[#D96B27] shadow-md ring-4 ring-[#D96B27]/15"
                          : "bg-white/80 border border-[#E2E8F0] shadow-2xs hover:border-[#D96B27]/50 hover:bg-white"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-black text-xs sm:text-sm ${isSelected ? "text-[#D96B27]" : "text-[#0F172A]"}`}>
                            {r.label}
                          </span>
                          {isSelected && (
                            <span className="w-2 h-2 rounded-full bg-[#D96B27]" />
                          )}
                        </div>
                        <div className="text-[10px] sm:text-xs text-[#64748B] font-medium truncate mt-0.5">
                          {r.desc}
                        </div>
                      </div>
                      <span className="text-2xl shrink-0 p-1 rounded-xl bg-[#FAF7F2] border border-[#E2E8F0]">{r.emoji}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {!submitted && errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs font-bold text-red-700 flex items-center gap-2 shadow-xs">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {submitted ? (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#E2E8F0] shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-inner font-black">
                  ✓
                </div>
                {submitted === "guide" ? (
                  <div className="space-y-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-black">
                      طلب معلّق بانتظار تدقيق واعتماد الإدارة
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                      تم إرسال طلب انضمام المرشد السياحي بنجاح!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-semibold leading-relaxed max-w-md mx-auto">
                      تم تفريغ الحقول وحفظ وثائقك وبياناتك بنجاح في قاعدة البيانات. بمجرد مراجعة واعتماد حسابك من قبل إدارة منصة دَلّني، سيتم تفعيل حسابك فوراً بالبريد الإلكتروني ورقم الهاتف المسجل لتتمكن من تسجيل الدخول إلى لوحة تحكم المرشد الخاصة بك، وسيتم إضافة ملفك تلقائياً إلى واجهة المرشدين السياحيين.
                    </p>
                    <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E8E2D6] text-right space-y-2.5 text-xs font-bold text-[#0F172A]">
                      <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-2">
                        <span className="text-[#64748B]">حالة الطلب:</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-black">قيد المراجعة والتدقيق</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-[#E8E2D6] pb-2">
                        <span className="text-[#64748B]">تفعيل الحساب ولوحة التحكم:</span>
                        <span className="text-emerald-700 font-black">تلقائي بالبريد ورقم الهاتف فور اعتماد الأدمن</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[#64748B]">الظهور في دليل المرشدين:</span>
                        <span className="text-[#1B5A78] font-black">يظهر تلقائياً في صفحة المرشدين بعد التوثيق</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <Link
                        to="/auth/login"
                        className="py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1B5A78] to-[#13445C] hover:from-[#13445C] hover:to-[#0F172A] text-white font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
                      >
                        <span>الانتقال لصفحة تسجيل الدخول</span>
                        <span>←</span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setSubmitted(null);
                          setGuide(initialGuideState);
                          setGuideStep(1);
                        }}
                        className="py-3.5 px-4 rounded-2xl border border-[#CBD5E0] bg-white hover:bg-slate-50 text-[#0F172A] font-black text-xs sm:text-sm shadow-2xs transition cursor-pointer"
                      >
                        تقديم طلب مرشد جديد
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black">
                      تم إنشاء الحساب بنجاح
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                      أهلاً بك في منصة دَلّني!
                    </h2>
                    <p className="text-xs sm:text-sm text-[#64748B] font-semibold leading-relaxed max-w-md mx-auto">
                      تم إنشاء وتفعيل حسابك السياحي بنجاح. يمكنك الآن تسجيل الدخول واستكشاف الرحلات السياحية، حجز الفنادق، واختيار المرشدين المعتمدين.
                    </p>
                    <div className="pt-2">
                      <Link
                        to="/auth/login"
                        className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white font-black text-xs sm:text-sm shadow-md transition"
                      >
                        <span>تسجيل الدخول إلى حسابك الآن</span>
                        <span>←</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ) : role === "tourist" ? (
            <form className="space-y-3.5 text-right" onSubmit={async (e) => {
              e.preventDefault();
              setErrorMsg("");
              if (!validateTouristForm()) return;
              try {
                const res = await apiRegisterTourist({
                  tourist_id: tourist.passport.trim() || undefined,
                  passport: tourist.passport.trim(),
                  full_name: tourist.fullName,
                  phone_number: tourist.phone,
                  email: tourist.email,
                  password: tourist.password,
                });
                if (res && (res.status === "success" || res.token)) {
                  setTourist(initialTouristState);
                  setSubmitted("tourist");
                } else {
                  setErrorMsg(res?.message || "حدث خطأ أثناء التسجيل. يرجى التأكد من صحة البيانات وأن البريد ورقم الهاتف غير مسجلين مسبقاً.");
                }
              } catch (err: any) {
                setErrorMsg("تعذر إتمام عملية التسجيل، يرجى التأكد من تشغيل الخادم والاتصال بالشبكة.");
              }
            }}>
              <Field
                label="الاسم بالكامل"
                value={tourist.fullName}
                onChange={(v) => setTourist({ ...tourist, fullName: v })}
                onKeyDown={handleEnterKeyNext}
                placeholder="محمد أحمد"
                required
                icon={User}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="رقم الهاتف للتواصل"
                  type="tel"
                  value={tourist.phone}
                  onChange={(v) => setTourist({ ...tourist, phone: v })}
                  onKeyDown={handleEnterKeyNext}
                  placeholder="0912345678"
                  required
                  icon={Phone}
                />
                <Field
                  label="رقم جواز السفر / الرقم الوطني"
                  value={tourist.passport}
                  onChange={(v) => setTourist({ ...tourist, passport: v })}
                  onKeyDown={handleEnterKeyNext}
                  placeholder="A12345678"
                  required
                  icon={Shield}
                />
              </div>
              <Field
                label="البريد الإلكتروني"
                type="email"
                value={tourist.email}
                onChange={(v) => setTourist({ ...tourist, email: v })}
                onKeyDown={handleEnterKeyNext}
                placeholder="example@dalni.ly"
                required
                icon={Mail}
              />
              <Field
                label="كلمة المرور"
                type="password"
                value={tourist.password}
                onChange={(v) => setTourist({ ...tourist, password: v })}
                onKeyDown={handleEnterKeyNext}
                placeholder="٨ أحرف على الأقل"
                required
                icon={Lock}
              />

              <div className="flex items-center justify-start gap-2 pt-1">
                <label className="flex items-start gap-2 text-xs text-[#64748B] font-semibold cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-2 border-[#CBD5E0] accent-[#D96B27] cursor-pointer" required />
                  <span>
                    أوافق على <a href="#" className="text-[#D96B27] font-bold hover:underline">الشروط والأحكام</a> و <a href="#" className="text-[#D96B27] font-bold hover:underline">سياسة الخصوصية</a> لمنصة دَلِّني.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#1B5A78] hover:from-[#C2581A] hover:to-[#13445C] text-white font-black text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
              >
                <span>إنشاء الحساب والتسجيل الآن</span>
                <span className="text-lg">←</span>
              </button>
            </form>
          ) : (
            <div className="space-y-3 text-right">
              {/* 2-Step Compact Progress Indicator */}
              <div className="flex items-center gap-2 mb-3 p-1 bg-white rounded-xl border border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setGuideStep(1)}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    guideStep === 1
                      ? "bg-[#1B5A78] text-white shadow-xs"
                      : "text-[#718096] hover:text-[#0F172A]"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] font-black ${guideStep === 1 ? "bg-white text-[#1B5A78]" : "bg-[#E2E8F0] text-[#0F172A]"}`}>1</span>
                  <span>البيانات والتكلفة والترخيص</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (guide.licenseNumber && guide.fullName && guide.phone) {
                      setGuideStep(2);
                    }
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    guideStep === 2
                      ? "bg-[#1B5A78] text-white shadow-xs"
                      : "text-[#718096] hover:text-[#0F172A]"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full grid place-items-center text-[10px] font-black ${guideStep === 2 ? "bg-white text-[#1B5A78]" : "bg-[#E2E8F0] text-[#0F172A]"}`}>2</span>
                  <span>نطاق العمل والجدول</span>
                </button>
              </div>

              {/* STEP 1: Personal & License Information & Photo & Cost */}
              {guideStep === 1 && (
                <form
                  className="space-y-3.5 text-right animate-in fade-in duration-200"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setErrorMsg("");
                    if (!validateGuideStep1()) return;
                    setGuideStep(2);
                  }}
                >
                  {/* Modern Guide Avatar Upload Zone with Brand Orange Accents (No default placeholder image) */}
                  <div className="p-3.5 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        {guide.avatar ? (
                          <img
                            src={guide.avatar}
                            alt="Guide Avatar"
                            className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D96B27] shadow-sm"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FAF7F2] to-[#F1ECE1] border-2 border-dashed border-[#D96B27]/40 flex flex-col items-center justify-center text-[#D96B27] shrink-0 shadow-2xs">
                            <Camera className="w-5 h-5 text-[#D96B27]" />
                            <span className="text-[9px] font-bold mt-0.5 text-[#64748B]">صورة شخصية</span>
                          </div>
                        )}
                        {guide.avatar && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white grid place-items-center text-[9px] text-white font-bold">
                            ✓
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs sm:text-sm font-black text-[#0F172A] flex items-center gap-1.5">
                          <span>الصورة الشخصية الرسمية</span>
                          <span className="text-red-500 font-black">*</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">
                          {guide.avatar ? "تم رفع الصورة بنجاح وتثبيتها بملفك" : "ارفع صورتك الرسمية لتظهر في ملفك للمسافرين"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="cursor-pointer shrink-0">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onClick={(e) => (e.currentTarget.value = '')}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setGuide((g) => ({ ...g, avatar: reader.result as string }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        <div className="h-10 px-3.5 rounded-xl border border-[#D96B27]/40 bg-gradient-to-r from-[#D96B27]/10 to-[#EA580C]/10 hover:from-[#D96B27]/20 hover:to-[#EA580C]/20 text-[#D96B27] flex items-center gap-1.5 transition font-black text-xs shadow-2xs">
                          <UploadCloud className="w-4 h-4" />
                          <span>{guide.avatar ? "استبدال" : "اختيار صورة"}</span>
                        </div>
                      </label>
                      {guide.avatar && (
                        <button
                          type="button"
                          onClick={() => setGuide((g) => ({ ...g, avatar: "" }))}
                          className="h-10 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                          title="إلغاء الصورة المختارة"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>إلغاء</span>
                        </button>
                      )}
                    </div>
                  </div>

                  <Field
                    label="الاسم بالكامل للمرشد"
                    value={guide.fullName}
                    onChange={(v) => setGuide({ ...guide, fullName: v })}
                    onKeyDown={handleEnterKeyNext}
                    placeholder="أحمد محمد"
                    required
                    icon={User}
                  />

                  {/* 2-Column: License Number + Phone Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="رقم ترخيص مزاولة الإرشاد"
                      value={guide.licenseNumber}
                      onChange={(v) => setGuide({ ...guide, licenseNumber: v })}
                      onKeyDown={handleEnterKeyNext}
                      placeholder="G-4421"
                      required
                      icon={FileText}
                    />
                    <Field
                      label="رقم الهاتف للتواصل"
                      type="tel"
                      value={guide.phone}
                      onChange={(v) => setGuide({ ...guide, phone: v })}
                      onKeyDown={handleEnterKeyNext}
                      placeholder="0912345678"
                      required
                      icon={Phone}
                    />
                  </div>

                  {/* 2-Column: Daily Rate (Cost) + Years of Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="التكلفة اليومية للإرشاد (د.ل)"
                      type="number"
                      value={guide.pricePerDay}
                      onChange={(v) => setGuide({ ...guide, pricePerDay: v })}
                      onKeyDown={handleEnterKeyNext}
                      placeholder="150"
                      required
                      suffix="د.ل / اليوم"
                      icon={DollarSign}
                    />
                    <Field
                      label="سنوات الخبرة السياحية (سنتان كحد أدنى)"
                      type="number"
                      value={guide.years}
                      onChange={(v) => setGuide({ ...guide, years: v })}
                      onKeyDown={handleEnterKeyNext}
                      placeholder="2"
                      min={2}
                      required
                      suffix="سنوات"
                      icon={Award}
                    />
                  </div>

                  {/* Gender Segmented Toggle */}
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] mb-1.5 block text-right">
                      جنس المرشد <span className="text-red-500 font-black">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 h-11 p-1 bg-white rounded-2xl border border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={() => setGuide({ ...guide, gender: "male" })}
                        className={`rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          guide.gender === "male"
                            ? "bg-[#D96B27] text-white shadow-xs font-black"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        <span>ذكر</span>
                        <span>👨</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGuide({ ...guide, gender: "female" })}
                        className={`rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                          guide.gender === "female"
                            ? "bg-[#D96B27] text-white shadow-xs font-black"
                            : "text-[#64748B] hover:text-[#0F172A]"
                        }`}
                      >
                        <span>أنثى</span>
                        <span>👩</span>
                      </button>
                    </div>
                  </div>

                  {/* Bio Field */}
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] mb-1.5 flex items-center justify-start gap-1.5 text-right">
                      <FileText className="w-3.5 h-3.5 text-[#D96B27]" />
                      <span>نبذة تعريفية عن خبرتك السياحية</span>
                      <span className="text-red-500 font-black">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={guide.bio}
                      onChange={(e) => setGuide({ ...guide, bio: e.target.value })}
                      placeholder="اكتب نبذة موجزة عن الجولات والمناطق التي ترشد بها واهتماماتك السياحية..."
                      className="w-full px-4 py-3 rounded-2xl border border-[#E2E8F0] bg-white hover:border-[#D96B27]/50 focus:border-[#D96B27] focus:ring-4 focus:ring-[#D96B27]/15 outline-none transition text-xs sm:text-sm font-semibold text-[#0F172A] placeholder:text-[#94A3B8] text-right resize-none shadow-2xs"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-12 rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#1B5A78] hover:from-[#C2581A] hover:to-[#13445C] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer mt-1 flex items-center justify-center gap-2"
                  >
                    <span>المتابعة إلى نطاق العمل والمستندات (خطوة 2 من 2)</span>
                    <span className="text-base">←</span>
                  </button>
                </form>
              )}

              {/* STEP 2: Operating Regions & Schedule */}
              {guideStep === 2 && (
                <form
                  className="space-y-3 text-right animate-in fade-in duration-200"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setErrorMsg("");
                    if (!validateGuideStep2()) return;
                    try {
                      const res = await apiRegisterGuide({
                        license_number: guide.licenseNumber,
                        full_name: guide.fullName,
                        avatar: guide.avatar || undefined,
                        phone_number: guide.phone,
                        years_of_experience: Number(guide.years) || 2,
                        email: guide.email,
                        password: guide.password,
                        gender: guide.gender,
                        price_per_day: Number(guide.pricePerDay) || 150,
                        bio: guide.bio,
                        place_ids: guide.placeIds,
                        working_days: JSON.stringify(guide.workingDays),
                        speaks_english: guide.speaksEnglish,
                        speaks_french: guide.speaksFrench,
                        speaks_italian: guide.speaksItalian,
                        certificate: guide.certs.length > 0 ? `ترخيص سياحي (${guide.certs.join('، ')})` : "ترخيص رسمي صادر من وزارة السياحة والآثار",
                        certificate_name: guide.certs[0] || "ترخيص_سياحي.pdf",
                        digital_certificate_file: guide.certDataUrls[0] || undefined,
                      });
                      if (res && res.status === "error") {
                        setErrorMsg(res.message || "حدث خطأ أثناء حفظ بيانات المرشد");
                        return;
                      }
                      setGuide(initialGuideState);
                      setGuideStep(1);
                      setSubmitted("guide");
                    } catch (err: any) {
                      setErrorMsg(err.message || "فشل الاتصال بالخادم لحفظ بيانات المرشد السياحي.");
                    }
                  }}
                >
                  {/* Registered Tourist Landmarks of Expertise */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D96B27]" />
                        <span>المعالم السياحية والآثار المعتمدة لخبرتك (اختر معلماً أو أكثر من المعالم المسجلة):</span>
                        <span className="text-red-500 font-black">*</span>
                      </label>
                      <span className="text-[11px] font-black text-[#D96B27]">
                        {guide.placeIds.length} معالم مختارة
                      </span>
                    </div>

                    {attractionsList.length === 0 && (
                      <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] font-bold text-amber-800">
                        لا توجد معالم سياحية مسجلة في المنصة حالياً، لذلك لا يمكن إكمال تسجيل المرشد الآن. تضيف إدارة المنصة المعالم أولاً.
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-white rounded-2xl border border-[#E2E8F0] max-h-44 overflow-y-auto shadow-2xs empty:hidden">
                      {attractionsList.map((attr) => {
                        const pid = attr.place_id || attr.id;
                        const pname = attr.place_name || attr.name;
                        const isChecked = guide.placeIds.includes(pid);
                        return (
                          <div
                            key={pid}
                            onClick={() => togglePlaceId(pid)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-right transition-all cursor-pointer select-none text-[11px] font-bold ${
                              isChecked
                                ? "border-[#D96B27] bg-[#D96B27]/10 text-[#D96B27] shadow-xs"
                                : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#D96B27]/40"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 text-[10px] font-black ${isChecked ? "bg-[#D96B27] border-[#D96B27] text-white" : "border-[#CBD5E0]"}`}>
                              {isChecked && "✓"}
                            </div>
                            <span className="truncate flex-1">🏛️ {pname} {attr.city ? `(${attr.city})` : ""}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Working Days */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-[#0F172A]">
                        أيام الجاهزية للجولات السياحية: <span className="text-red-500 font-black">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllDays}
                        className="text-[11px] font-bold text-[#D96B27] hover:underline cursor-pointer"
                      >
                        {guide.workingDays.length === WEEKDAYS.length ? "أيام محددة" : "طوال أيام الأسبوع"}
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1.5 p-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs">
                      {WEEKDAYS.map((day) => {
                        const isChecked = guide.workingDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`py-2 px-1 rounded-xl border text-center transition-all cursor-pointer ${
                              isChecked
                                ? "bg-[#D96B27] border-[#D96B27] text-white shadow-2xs font-black"
                                : "bg-white border-[#E2E8F0] text-[#64748B] hover:bg-stone-50 font-bold"
                            }`}
                          >
                            <span className="text-[11px] block">{day.nameAr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] mb-1.5 block text-right">اللغات المتقنة:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "speaksEnglish" as const, labelAr: "الإنجليزية", code: "EN" },
                        { key: "speaksFrench" as const, labelAr: "الفرنسية", code: "FR" },
                        { key: "speaksItalian" as const, labelAr: "الإيطالية", code: "IT" },
                      ].map((lang) => {
                        const isSelected = guide[lang.key];
                        return (
                          <button
                            key={lang.key}
                            type="button"
                            onClick={() => setGuide({ ...guide, [lang.key]: !isSelected })}
                            className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? "border-[#D96B27] bg-[#D96B27]/10 text-[#D96B27] shadow-xs font-black"
                                : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#D96B27]/40"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-[#FAF7F2] text-[#0F172A]">{lang.code}</span>
                              <span className="text-xs">{lang.labelAr}</span>
                            </span>
                            <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                              isSelected ? "bg-[#D96B27] text-white border-[#D96B27]" : "border-[#CBD5E0]"
                            }`}>
                              {isSelected && "✓"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certificate Upload with Cancellation and Replacement */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0F172A] text-right flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-[#D96B27]" />
                        <span>إرفاق صورة أو مستند الترخيص الرسمي / الشهادة</span>
                        <span className="text-red-500 font-black">*</span>
                      </label>
                      {guide.certs.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setGuide((g) => ({ ...g, certs: [], certDataUrls: [] }))}
                          className="text-[11px] text-red-600 hover:text-red-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>إلغاء وحذف الكل</span>
                        </button>
                      )}
                    </div>

                    {guide.certs.length === 0 ? (
                      <label className="block cursor-pointer">
                        <input
                          type="file"
                          multiple
                          accept="image/*,application/pdf"
                          className="hidden"
                          onClick={(e) => (e.currentTarget.value = '')}
                          onChange={async (e) => {
                            const filesArr = Array.from(e.target.files ?? []);
                            if (filesArr.length > 0) {
                              const readPromises = filesArr.map(file => {
                                return new Promise<string>((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (loadEv) => resolve((loadEv.target?.result as string) || "");
                                  reader.onerror = () => resolve("");
                                  reader.readAsDataURL(file);
                                });
                              });
                              const urls = await Promise.all(readPromises);
                              setGuide((g) => ({
                                ...g,
                                certs: filesArr.map(f => f.name),
                                certDataUrls: urls.filter(Boolean),
                              }));
                            }
                          }}
                        />
                        <div className="p-4 rounded-2xl border-2 border-dashed border-[#D96B27]/40 bg-white hover:border-[#D96B27] hover:bg-[#D96B27]/5 transition flex flex-col items-center justify-center gap-2 text-center group cursor-pointer shadow-2xs">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D96B27]/15 to-[#EA580C]/15 text-[#D96B27] grid place-items-center transition group-hover:scale-110">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-xs sm:text-sm text-[#0F172A]">
                            انقر هنا لرفع صورة الترخيص السياحي أو الشهادة المعتمدة
                          </span>
                          <span className="text-[10px] text-[#64748B]">
                            يدعم ملفات الصور (JPG, PNG) أو مستندات PDF
                          </span>
                        </div>
                      </label>
                    ) : (
                      <div className="space-y-2 p-3 rounded-2xl border border-[#E2E8F0] bg-slate-50/70">
                        <div className="flex flex-col gap-2">
                          {guide.certs.map((c, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#D96B27]/40 transition"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                <span className="w-7 h-7 rounded-lg bg-[#D96B27]/10 text-[#D96B27] grid place-items-center shrink-0">
                                  <FileText className="w-4 h-4" />
                                </span>
                                <div className="min-w-0 text-right">
                                  <div className="text-xs font-bold text-[#0F172A] truncate max-w-[200px] sm:max-w-[260px]" title={c}>
                                    {c}
                                  </div>
                                  <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                    <Check className="w-3 h-3" />
                                    <span>جاهز للإرفاق والاعتماد</span>
                                  </div>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  setGuide((g) => ({
                                    ...g,
                                    certs: g.certs.filter((_, idx) => idx !== i),
                                    certDataUrls: g.certDataUrls.filter((_, idx) => idx !== i),
                                  }))
                                }
                                className="h-8 px-2.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 border border-red-200/60"
                                title="إلغاء واختيار ملف آخر"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>إلغاء</span>
                              </button>
                            </div>
                          ))}
                        </div>

                        {/* Button to add or replace files */}
                        <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0]">
                          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#D96B27]/40 hover:border-[#D96B27] text-[#D96B27] text-xs font-bold transition hover:bg-[#D96B27]/5 shadow-2xs">
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة مستند إضافي</span>
                            <input
                              type="file"
                              multiple
                              accept="image/*,application/pdf"
                              className="hidden"
                              onClick={(e) => (e.currentTarget.value = '')}
                              onChange={async (e) => {
                                const filesArr = Array.from(e.target.files ?? []);
                                if (filesArr.length > 0) {
                                  const readPromises = filesArr.map(file => {
                                    return new Promise<string>((resolve) => {
                                      const reader = new FileReader();
                                      reader.onload = (loadEv) => resolve((loadEv.target?.result as string) || "");
                                      reader.onerror = () => resolve("");
                                      reader.readAsDataURL(file);
                                    });
                                  });
                                  const urls = await Promise.all(readPromises);
                                  setGuide((g) => ({
                                    ...g,
                                    certs: [...g.certs, ...filesArr.map(f => f.name)],
                                    certDataUrls: [...g.certDataUrls, ...urls.filter(Boolean)],
                                  }));
                                }
                              }}
                            />
                          </label>
                          <span className="text-[10px] text-[#64748B]">
                            يمكنك إضافة أو استبدال أي ملف بسهولة
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Credentials: Email + Password in 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field
                      label="البريد الإلكتروني لتسجيل الدخول"
                      type="email"
                      value={guide.email}
                      onChange={(v) => setGuide({ ...guide, email: v })}
                      onKeyDown={handleEnterKeyNext}
                      placeholder="guide@dalni.ly"
                      required
                      icon={Mail}
                    />
                    <Field
                      label="كلمة المرور للحساب"
                      type="password"
                      value={guide.password}
                      onChange={(v) => setGuide({ ...guide, password: v })}
                      onKeyDown={handleEnterKeyNext}
                      placeholder="٨ أحرف على الأقل"
                      required
                      icon={Lock}
                    />
                  </div>

                  {/* Step 2 Action Buttons */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setGuideStep(1)}
                      className="py-3 px-3 rounded-2xl border border-[#E2E8F0] bg-white hover:bg-[#F3ECE1] text-[#0F172A] font-black text-xs transition cursor-pointer shadow-2xs"
                    >
                      → السابق
                    </button>
                    <button
                      type="submit"
                      className="col-span-2 py-3 rounded-2xl bg-gradient-to-r from-[#D96B27] via-[#EA580C] to-[#1B5A78] hover:from-[#C2581A] hover:to-[#13445C] text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>إرسال طلب التسجيل والاعتماد</span>
                      <span className="text-base">✨</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Right-aligned Footer Link */}
          <div className="mt-5 text-right text-xs text-[#64748B] font-medium">
            لديك حساب مسجل بالفعل؟{" "}
            <Link to="/auth/login" className="text-[#D96B27] font-black hover:underline mr-1">
              تسجيل الدخول إلى حسابك ←
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  onKeyDown,
  required,
  suffix,
  min,
  icon: Icon,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  required?: boolean;
  suffix?: string;
  min?: number | string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const isNumber = type === "number";

  const handleStep = (delta: number) => {
    const current = parseFloat(value) || 0;
    const stepSize = label.includes("التكلفة") ? 10 : 1;
    const minVal = min !== undefined ? Number(min) : 0;
    const nextVal = Math.max(minVal, current + delta * stepSize);
    onChange(String(nextVal));
  };

  return (
    <div className="text-right">
      <label className="text-xs font-bold text-[#0F172A] mb-1.5 flex items-center justify-start gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#D96B27]" />}
        <span>{label}</span>
        {required && <span className="text-red-500 font-black">*</span>}
      </label>
      <div className="flex items-stretch rounded-xl border border-[#E2E8F0] bg-white focus-within:border-[#1B5A78] focus-within:ring-2 focus-within:ring-[#1B5A78]/15 transition overflow-hidden shadow-xs">
        {/* Left Side (Addon): Unit Suffix Badge & Dedicated Stepper Buttons */}
        {(suffix || isNumber) && (
          <div className="flex items-center bg-[#F8FAFC] border-l border-[#E2E8F0] shrink-0 select-none">
            {isNumber && (
              <div className="flex flex-col border-r border-[#E2E8F0] h-full justify-center px-1 bg-white/60">
                <button
                  type="button"
                  onClick={() => handleStep(1)}
                  className="px-1 text-[9px] font-black text-slate-500 hover:text-[#1B5A78] hover:bg-slate-200/80 rounded transition cursor-pointer leading-tight select-none"
                  title="زيادة القيمة"
                  tabIndex={-1}
                >
                  ▲
                </button>
                <button
                  type="button"
                  onClick={() => handleStep(-1)}
                  className="px-1 text-[9px] font-black text-slate-500 hover:text-[#1B5A78] hover:bg-slate-200/80 rounded transition cursor-pointer leading-tight select-none"
                  title="إنقاص القيمة"
                  tabIndex={-1}
                >
                  ▼
                </button>
              </div>
            )}
            {suffix && (
              <span className="px-2.5 py-1 text-[10px] sm:text-[11px] font-black text-[#64748B] whitespace-nowrap">
                {suffix}
              </span>
            )}
          </div>
        )}

        {/* Input text / number */}
        <input
          type={type}
          value={value}
          required={required}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="flex-1 h-10 sm:h-11 px-3.5 bg-transparent outline-none text-xs sm:text-sm font-semibold text-[#0F172A] text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}

