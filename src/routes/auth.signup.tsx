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
import { MapPin, Award, FileText, Check, Camera, DollarSign } from "lucide-react";
import { apiRegisterTourist, apiRegisterGuide } from "@/lib/api";

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

const REGIONS_LIST = [
  { id: "tripoli", nameAr: "طرابلس وضواحيها" },
  { id: "leptis", nameAr: "لبدة الكبرى والخمس" },
  { id: "sabratha", nameAr: "صبراتة والساحل الغربي" },
  { id: "cyrene", nameAr: "شحات وقورينا (الجبل الأخضر)" },
  { id: "benghazi", nameAr: "بنغازي والمنطقة الشرقية" },
  { id: "ghadames", nameAr: "غدامس والواحات" },
  { id: "ubari", nameAr: "أوباري وفزان والبحيرات" },
  { id: "acacus", nameAr: "جبال تدرارت أكاكوس وغات" },
  { id: "sousa", nameAr: "سوسة وأبولونيا الأثرية" },
  { id: "tobruk", nameAr: "طبرق والمعالم التاريخية" },
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
  const [slideIdx, setSlideIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % LANDMARK_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const currentSlide = LANDMARK_SLIDES[slideIdx];

  // Tourist fields
  const [tourist, setTourist] = useState({ fullName: "", phone: "", passport: "", email: "", password: "" });

  // Guide fields (with photo upload & daily rate cost)
  const [guide, setGuide] = useState({
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
    operatingRegions: ["tripoli", "leptis"] as string[],
    workingDays: ["sat", "sun", "mon", "tue", "wed", "thu"] as string[],
    speaksEnglish: true,
    speaksFrench: false,
    speaksItalian: false,
    certs: [] as string[],
    approvalStatus: "بانتظار الاعتماد والتوثيق من الإدارة",
  });

  const toggleRegion = (regId: string) => {
    setGuide((g) => {
      const exists = g.operatingRegions.includes(regId);
      return {
        ...g,
        operatingRegions: exists
          ? g.operatingRegions.filter((r) => r !== regId)
          : [...g.operatingRegions, regId],
      };
    });
  };

  const toggleAllRegions = () => {
    setGuide((g) => {
      const allSelected = g.operatingRegions.length === REGIONS_LIST.length;
      return {
        ...g,
        operatingRegions: allSelected ? [] : REGIONS_LIST.map((r) => r.id),
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

  if (submitted) {
    return (
      <div className="min-h-screen grid place-items-center bg-[#FAF7F2] p-6" dir={dir}>
        <div className="max-w-lg w-full bg-white rounded-3xl shadow-card border border-[#E8E2D6] p-8 text-center animate-in fade-in zoom-in-95">
          <Logo size="lg" showText={false} className="mx-auto justify-center mb-4" />
          {submitted === "tourist" ? (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1B5A78]/15 text-[#1B5A78] grid place-items-center">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>
              <h1 className="mt-4 text-2xl font-black text-[#0F172A]">تم إنشاء حسابك بنجاح! 🎉</h1>
              <p className="mt-2 text-sm text-[#5A6A85] leading-relaxed font-medium">
                أهلاً بك في منصة دَلِّني. يمكنك الآن تسجيل الدخول وبدء استكشاف أجمل معالم ورحلات ليبيا.
              </p>
              <Link to="/auth/login" className="mt-6 inline-flex px-8 h-13 items-center justify-center rounded-2xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-black shadow-soft transition">
                تسجيل الدخول الآن
              </Link>
            </>
          ) : (
            <>
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#1B5A78]/15 text-[#1B5A78] grid place-items-center">
                <Award className="w-8 h-8 stroke-[2]" />
              </div>
              <h1 className="mt-4 text-2xl font-black text-[#0F172A]">طلبك قيد المراجعة والاعتماد</h1>
              <p className="mt-2 text-sm text-[#5A6A85] leading-relaxed font-medium">
                تم استلام طلب تسجيلك كمرشد سياحي معتمد بالتكلفة اليومية ({guide.pricePerDay} د.ل/اليوم). سيقوم فريق الإدارة بمراجعة رخصتك وبياناتك وسنبلغك فور اعتماد الحساب.
              </p>
              <div className="mt-4 rounded-xl bg-[#F3ECE1] p-3 text-xs text-[#5A6A85]">
                رقم الطلب المرجعي: <b className="text-[#0F172A]">#GD-{Math.floor(Math.random() * 90000 + 10000)}</b>
              </div>
              <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900">
                حالة الاعتماد: {guide.approvalStatus}
              </div>
              <Link to="/" className="mt-6 inline-flex px-8 h-13 items-center justify-center rounded-2xl bg-[#1B5A78] text-white font-black hover:bg-[#13445C] transition">
                العودة للرئيسية
              </Link>
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

            <div className="mb-5 text-right">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A] flex items-center justify-start gap-2 tracking-tight">
                <span>إنشاء حساب جديد</span>
                <span className="text-xl sm:text-2xl">✨</span>
              </h1>
              <p className="text-[#718096] text-xs sm:text-sm font-semibold mt-1 text-right">
                اختر نوع الحساب وأكمل بياناتك للبدء.
              </p>
            </div>

          {/* Account Role Selector - Compact */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            {roles.map((r) => {
              const isSelected = role === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={`p-2.5 sm:p-3 rounded-2xl bg-white text-right transition-all duration-200 cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? "border-2 border-[#1B5A78] shadow-sm ring-1 ring-[#1B5A78]/20 bg-[#1B5A78]/5"
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
                  <span className="text-xl sm:text-2xl shrink-0">{r.emoji}</span>
                </button>
              );
            })}
          </div>

          {role === "tourist" ? (
            <form className="space-y-3.5 text-right" onSubmit={async (e) => {
              e.preventDefault();
              try {
                await apiRegisterTourist({
                  full_name: tourist.fullName,
                  phone_number: tourist.phone,
                  email: tourist.email,
                  password: tourist.password,
                });
              } catch (err) {}
              setSubmitted("tourist");
            }}>
              <Field label="الاسم بالكامل" value={tourist.fullName} onChange={(v) => setTourist({ ...tourist, fullName: v })} placeholder="محمد أحمد" required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="رقم الهاتف للتواصل" type="tel" value={tourist.phone} onChange={(v) => setTourist({ ...tourist, phone: v })} placeholder="0912345678" required />
                <Field label="رقم جواز السفر / الرقم الوطني" value={tourist.passport} onChange={(v) => setTourist({ ...tourist, passport: v })} placeholder="A12345678" required />
              </div>
              <Field label="البريد الإلكتروني" type="email" value={tourist.email} onChange={(v) => setTourist({ ...tourist, email: v })} placeholder="example@dalni.ly" required />
              <Field label="كلمة المرور" type="password" value={tourist.password} onChange={(v) => setTourist({ ...tourist, password: v })} placeholder="٨ أحرف على الأقل" required />

              <div className="flex items-center justify-start gap-2 pt-0.5">
                <label className="flex items-start gap-2 text-xs text-[#718096] font-semibold cursor-pointer select-none">
                  <input type="checkbox" className="w-4 h-4 mt-0.5 rounded border-2 border-[#CBD5E0] accent-[#1B5A78] cursor-pointer" required />
                  <span>
                    أوافق على <a href="#" className="text-[#1B5A78] font-bold hover:underline">الشروط والأحكام</a> و <a href="#" className="text-[#1B5A78] font-bold hover:underline">سياسة الخصوصية</a>.
                  </span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg hover:-translate-y-0.5 transition cursor-pointer mt-1"
              >
                إنشاء الحساب والتسجيل ←
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
                  className="space-y-3 text-right animate-in fade-in duration-200"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setGuideStep(2);
                  }}
                >
                  {/* Compact Avatar Photo Upload Bar */}
                  <div className="p-2.5 bg-white rounded-xl border border-[#E2E8F0] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        {guide.avatar ? (
                          <img src={guide.avatar} alt="Guide Avatar" className="w-11 h-11 rounded-xl object-cover border-2 border-[#1B5A78] shadow-xs" />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-[#1B5A78]/10 border border-[#1B5A78]/20 grid place-items-center text-lg shrink-0">
                            👤
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-[#0F172A] flex items-center gap-1">
                          <span>الصورة الشخصية للمرشد</span>
                          <span className="text-red-500">*</span>
                        </div>
                        <p className="text-[10px] text-[#718096] truncate">
                          {guide.avatar ? "تم اختيار الصورة الشخصية بنجاح" : "صورة رسمية تظهر في ملفك التعريفي"}
                        </p>
                      </div>
                    </div>
                    <label className="cursor-pointer shrink-0">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
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
                      <div className="h-9 px-3 rounded-lg border border-[#1B5A78]/30 bg-[#1B5A78]/5 hover:bg-[#1B5A78]/15 text-[#1B5A78] flex items-center gap-1.5 transition font-bold text-xs">
                        <Camera className="w-3.5 h-3.5" />
                        <span>{guide.avatar ? "تغيير" : "رفع صورة"}</span>
                      </div>
                    </label>
                  </div>

                  {/* 2-Column: Full Name + License Number */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Field
                      label="الاسم بالكامل للمرشد"
                      value={guide.fullName}
                      onChange={(v) => setGuide({ ...guide, fullName: v })}
                      placeholder="أحمد محمد"
                      required
                    />
                    <Field
                      label="رقم ترخيص مزاولة الإرشاد"
                      value={guide.licenseNumber}
                      onChange={(v) => setGuide({ ...guide, licenseNumber: v })}
                      placeholder="G-4421"
                      required
                    />
                  </div>

                  {/* 2-Column: Phone + Gender Segmented Toggle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 items-end">
                    <Field
                      label="رقم الهاتف للتواصل"
                      type="tel"
                      value={guide.phone}
                      onChange={(v) => setGuide({ ...guide, phone: v })}
                      placeholder="0912345678"
                      required
                    />
                    <div>
                      <label className="text-xs font-bold text-[#0F172A] mb-1 block text-right">
                        جنس المرشد <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-2 gap-1.5 h-11 p-1 bg-white rounded-xl border border-[#E2E8F0]">
                        <button
                          type="button"
                          onClick={() => setGuide({ ...guide, gender: "male" })}
                          className={`rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            guide.gender === "male"
                              ? "bg-[#1B5A78] text-white shadow-xs"
                              : "text-[#718096] hover:text-[#0F172A]"
                          }`}
                        >
                          <span>ذكر</span>
                          <span>👨</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuide({ ...guide, gender: "female" })}
                          className={`rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            guide.gender === "female"
                              ? "bg-[#1B5A78] text-white shadow-xs"
                              : "text-[#718096] hover:text-[#0F172A]"
                          }`}
                        >
                          <span>أنثى</span>
                          <span>👩</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2-Column: Daily Rate (Cost) + Years of Experience */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Field
                      label="التكلفة اليومية للإرشاد (د.ل)"
                      type="number"
                      value={guide.pricePerDay}
                      onChange={(v) => setGuide({ ...guide, pricePerDay: v })}
                      placeholder="150"
                      required
                      suffix="د.ل / اليوم"
                    />
                    <Field
                      label="سنوات الخبرة السياحية"
                      type="number"
                      value={guide.years}
                      onChange={(v) => setGuide({ ...guide, years: v })}
                      placeholder="5"
                      required
                      suffix="سنوات"
                    />
                  </div>

                  {/* Bio Field - Compact 2 Rows */}
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] mb-1 block text-right">
                      نبذة تعريفية عن خبرتك السياحية <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={guide.bio}
                      onChange={(e) => setGuide({ ...guide, bio: e.target.value })}
                      placeholder="اكتب نبذة موجزة عن الجولات والمناطق التي ترشد بها واهتماماتك..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#E2E8F0] bg-white focus:border-[#1B5A78] focus:ring-2 focus:ring-[#1B5A78]/15 outline-none transition text-xs font-semibold text-[#0F172A] text-right resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 sm:h-12 rounded-xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-black text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition cursor-pointer mt-1"
                  >
                    التالي: نطاق العمل والمستندات (خطوة 2 من 2) ←
                  </button>
                </form>
              )}

              {/* STEP 2: Operating Regions & Schedule */}
              {guideStep === 2 && (
                <form
                  className="space-y-3 text-right animate-in fade-in duration-200"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    try {
                      await apiRegisterGuide({
                        license_number: guide.licenseNumber,
                        full_name: guide.fullName,
                        phone_number: guide.phone,
                        years_of_experience: Number(guide.years) || 2,
                        email: guide.email,
                        password: guide.password,
                        gender: guide.gender,
                        price_per_day: Number(guide.pricePerDay) || 150,
                        bio: guide.bio,
                        operating_regions: JSON.stringify(guide.operatingRegions),
                        working_days: JSON.stringify(guide.workingDays),
                        speaks_english: guide.speaksEnglish,
                        speaks_french: guide.speaksFrench,
                        speaks_italian: guide.speaksItalian,
                      });
                    } catch (err) {}
                    setSubmitted("guide");
                  }}
                >
                  {/* Operating Regions */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#0F172A]">
                        مناطق ووجهات الإرشاد السياحي: <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllRegions}
                        className="text-[11px] font-bold text-[#1B5A78] hover:underline cursor-pointer"
                      >
                        {guide.operatingRegions.length === REGIONS_LIST.length ? "إلغاء الكل" : "تحديد الكل"}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5 p-2 bg-white rounded-xl border border-[#E2E8F0] max-h-36 overflow-y-auto">
                      {REGIONS_LIST.map((reg) => {
                        const isChecked = guide.operatingRegions.includes(reg.id);
                        return (
                          <div
                            key={reg.id}
                            onClick={() => toggleRegion(reg.id)}
                            className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-right transition-all cursor-pointer select-none text-[11px] font-bold ${
                              isChecked
                                ? "border-[#1B5A78] bg-[#1B5A78]/10 text-[#1B5A78]"
                                : "border-[#E2E8F0] bg-white text-[#718096] hover:border-stone-300"
                            }`}
                          >
                            <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 text-[9px] ${isChecked ? "bg-[#1B5A78] border-[#1B5A78] text-white" : "border-[#CBD5E0]"}`}>
                              {isChecked && "✓"}
                            </div>
                            <span className="truncate flex-1">{reg.nameAr}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Working Days */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#0F172A]">
                        أيام الجاهزية للجولات: <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllDays}
                        className="text-[11px] font-bold text-[#1B5A78] hover:underline cursor-pointer"
                      >
                        {guide.workingDays.length === WEEKDAYS.length ? "أيام محددة" : "طوال الأسبوع"}
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 p-1.5 bg-white rounded-xl border border-[#E2E8F0]">
                      {WEEKDAYS.map((day) => {
                        const isChecked = guide.workingDays.includes(day.id);
                        return (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleDay(day.id)}
                            className={`py-1.5 px-0.5 rounded-lg border text-center transition-all cursor-pointer ${
                              isChecked
                                ? "bg-[#1B5A78] border-[#1B5A78] text-white shadow-2xs"
                                : "bg-white border-[#E2E8F0] text-[#718096] hover:bg-stone-50"
                            }`}
                          >
                            <span className="text-[11px] font-black block">{day.nameAr}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Languages */}
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] mb-1 block text-right">اللغات المتقنة:</label>
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
                            className={`flex items-center justify-between p-2 rounded-xl border text-xs font-bold transition cursor-pointer ${
                              isSelected
                                ? "border-[#1B5A78] bg-[#1B5A78]/10 text-[#1B5A78]"
                                : "border-[#E2E8F0] bg-white text-[#718096] hover:border-stone-300"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <span className="text-[9px] font-black px-1 py-0.5 rounded bg-[#FAF7F2] text-[#0F172A]">{lang.code}</span>
                              <span className="text-xs">{lang.labelAr}</span>
                            </span>
                            <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] ${
                              isSelected ? "bg-[#1B5A78] text-white border-[#1B5A78]" : "border-[#CBD5E0]"
                            }`}>
                              {isSelected && "✓"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Certificate Upload */}
                  <div>
                    <label className="text-xs font-bold text-[#0F172A] mb-1 block text-right">
                      إرفاق صورة أو ملف الترخيص / الشهادة <span className="text-red-500">*</span>
                    </label>
                    <label className="block cursor-pointer">
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files ?? []).map((f) => f.name);
                          setGuide((g) => ({ ...g, certs: [...g.certs, ...files] }));
                        }}
                      />
                      <div className="p-2.5 rounded-xl border-2 border-dashed border-[#E2E8F0] bg-white hover:border-[#1B5A78] hover:bg-[#1B5A78]/5 transition flex items-center justify-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#1B5A78]" />
                        <span className="font-bold text-xs text-[#0F172A]">
                          {guide.certs.length > 0 ? `تم اختيار (${guide.certs.length}) ملفات (انقر للإضافة)` : "انقر لاختيار ملف الشهادة أو الترخيص (PDF أو صورة)"}
                        </span>
                      </div>
                    </label>
                    {guide.certs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {guide.certs.map((c, i) => (
                          <span key={i} className="text-[11px] text-[#0F172A] bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 flex items-center gap-1">
                            <FileText className="w-3 h-3 text-[#1B5A78]" />
                            <span className="truncate max-w-[160px]">{c}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Credentials: Email + Password in 2-Column Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Field
                      label="البريد الإلكتروني"
                      type="email"
                      value={guide.email}
                      onChange={(v) => setGuide({ ...guide, email: v })}
                      placeholder="guide@dalni.ly"
                      required
                    />
                    <Field
                      label="كلمة المرور"
                      type="password"
                      value={guide.password}
                      onChange={(v) => setGuide({ ...guide, password: v })}
                      placeholder="٨ أحرف على الأقل"
                      required
                    />
                  </div>

                  {/* Step 2 Action Buttons */}
                  <div className="grid grid-cols-3 gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setGuideStep(1)}
                      className="py-2.5 px-3 rounded-xl border border-[#E2E8F0] bg-white hover:bg-[#F3ECE1] text-[#0F172A] font-black text-xs transition cursor-pointer"
                    >
                      → السابق
                    </button>
                    <button
                      type="submit"
                      className="col-span-2 py-2.5 rounded-xl bg-[#1B5A78] hover:bg-[#13445C] text-white font-black text-xs sm:text-sm shadow-md hover:-translate-y-0.5 transition cursor-pointer"
                    >
                      إرسال طلب التسجيل والاعتماد ✨
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Right-aligned Footer Link */}
          <div className="mt-4 text-right text-xs text-[#718096] font-medium">
            لديك حساب بالفعل؟{" "}
            <Link to="/auth/login" className="text-[#1B5A78] font-black hover:underline mr-1">
              تسجيل الدخول
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
  required,
  suffix,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-bold text-[#0F172A] mb-1 block text-right">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="relative flex items-center">
        <input
          type={type}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 sm:h-11 px-3.5 rounded-xl border border-[#E2E8F0] bg-white focus:border-[#1B5A78] focus:ring-2 focus:ring-[#1B5A78]/15 outline-none transition text-xs sm:text-sm font-semibold text-[#0F172A] text-right ${
            suffix ? "pl-16" : ""
          }`}
        />
        {suffix && (
          <span className="absolute left-2.5 text-[10px] font-bold text-[#718096] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E2E8F0] pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

