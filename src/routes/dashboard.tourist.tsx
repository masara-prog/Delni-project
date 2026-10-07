import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { Modal } from "@/components/Modals";
import destUbari from "@/assets/dest-ubari.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import privateTripImg from "@/assets/private-trip.jpg";

import { useLanguage } from "@/lib/i18n";
import { QrCode } from "lucide-react";

export const Route = createFileRoute("/dashboard/tourist")({
  head: () => ({
    meta: [
      { title: "لوحة السائح | منصة دلّني" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: TouristDashboard,
});

export type Ticket = {
  code: string;
  tripName: string;
  type: string;
  date: string;
  time: string;
  pickup: string;
  seats: number;
  guideName: string;
  guideLicense: string;
  companyName: string;
  contractNo: string;
  driverName: string;
  driverLicense: string;
  vehicleModel: string;
  vehiclePlate: string;
  insuranceInfo: string;
  status: "مؤكدة" | "بانتظار التأكيد";
  price: string;
  tripImage?: string;
};

function TouristDashboard() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [active, setActive] = useState("overview");
  const [ticketModal, setTicketModal] = useState<Ticket | null>(null);

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "bookings", label: isAr ? "حجوزاتي والتذاكر" : "My Bookings & Tickets", icon: "🎟️", badge: 2 },
    { id: "trips", label: isAr ? "استكشاف الرحلات" : "Explore Tours", icon: "🧭" },
    { id: "favorites", label: isAr ? "المفضلة" : "Favorites", icon: "❤️", badge: 3 },
    { id: "company_payment", label: isAr ? "تعليمات" : "Instructions", icon: "🏢" },
    { id: "messages", label: isAr ? "الرسائل والتنبيهات" : "Messages & Alerts", icon: "💬", badge: 2 },
    { id: "reviews", label: isAr ? "تقييماتي" : "My Reviews", icon: "⭐" },
    { id: "profile", label: isAr ? "الملف الشخصي والحساب" : "My Profile & Account", icon: "👤" },
  ];

  // Tourist Profile Data (Data Dictionary: Tourists table)
  const [touristInfo, setTouristInfo] = useState({
    tourist_id: "P-8812903",
    name_full: "أحمد بن علي المصراتي",
    email: "ahmed.misrati@dalni.ly",
    phone_number: "0912345678",
    national_id_or_passport: "A9920198",
    password: "••••••••",
    city: "طرابلس - حي الأندلس"
  });

  const myBookings: Ticket[] = [
    {
      code: "DLN-2026-9812",
      tripName: "جولة لبدة الكبرى اليومية والآثار الرومانية",
      type: "رحلة يومية ثابته (trips_daily)",
      date: "الجمعة 25 أغسطس 2026",
      time: "التجمع 08:30 ص | الانطلاق 09:00 ص",
      pickup: "طرابلس - طريق الشط (مقر شركة دلني الرئيسي)",
      seats: 2,
      guideName: "سالم القذافي",
      guideLicense: "G-9901 (مرشد معتمد)",
      companyName: "شركة الصحراء للنقل السياحي",
      contractNo: "CN-2026-01",
      driverName: "علي التارقي",
      driverLicense: "LB-88291",
      vehicleModel: "هيونداي H1 VIP 2024",
      vehiclePlate: "طرابلس 4517",
      insuranceInfo: "تأمين شامل للركاب والمسافرين ساري حتى 2028 (INS-44120)",
      status: "مؤكدة",
      price: "360 د.ل",
      tripImage: "/assets/ai_desert.jpg"
    },
    {
      code: "DLN-2026-4410",
      tripName: "مغامرة أوباري وبحيرات الصحراء (6 أيام)",
      type: "رحلة أسبوعية (trips_weekly)",
      date: "السبت 1 سبتمبر 2026",
      time: "التجمع 07:00 ص | الانطلاق 07:30 ص",
      pickup: "مطار معيتيقة الدولي / مقر الشركة",
      seats: 1,
      guideName: "سالم القذافي",
      guideLicense: "G-9901",
      companyName: "شركة الصحراء للنقل السياحي",
      contractNo: "CN-2026-01",
      driverName: "مفتاح الفزاني",
      driverLicense: "LB-77452",
      vehicleModel: "تويوتا كوستر 2025",
      vehiclePlate: "طرابلس 8291",
      insuranceInfo: "تأمين صحاري وشامل للركاب ساري حتى 2027 (INS-99210)",
      status: "مؤكدة",
      price: "1,850 د.ل",
      tripImage: destUbari
    }
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم حفظ وتحديث بيانات حساب السائح بنجاح ✓");
  };

  return (
    <DashboardShell role="tourist" roleLabel="حساب سائح" userName={touristInfo.name_full.split(" ")[0]} nav={nav} active={active} onNavigate={setActive}>
      {/* Policy Banner: In-person Payment Only */}
      <div className="mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex items-start gap-3 text-xs leading-relaxed text-right">
        <span className="text-xl">🏢</span>
        <div>
          <div className="font-black text-amber-600 dark:text-amber-400 text-sm mb-0.5">سداد الحجز والتأكيد المالي (نقداً بمقر الشركة)</div>
          <div className="text-slate-600 dark:text-slate-300 font-bold">
            المنصة لا تدعم الدفع الإلكتروني. يُرجى التوجه لمقر الشركة لسداد تكلفة الرحلة نقداً قبل <b>24 ساعة على الأقل</b> من موعد الانطلاق للحفاظ على تأكيد الحجز وتفعيل التذكرة.
          </div>
        </div>
      </div>

      {/* Welcome */}
      <div className="rounded-3xl p-6 md:p-8 bg-gradient-sea text-white shadow-glow relative overflow-hidden mb-6 text-right">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_right,white,transparent_60%)]" />
        <div className="relative">
          <div className="text-sm opacity-80">أهلاً بعودتك 👋</div>
          <h1 className="text-2xl md:text-3xl font-black mt-1">{touristInfo.name_full}، رحلاتك المؤكدة جاهزة</h1>
          <p className="mt-2 text-white/80 max-w-lg text-sm">لديك رحلة قادمة إلى لبدة الكبرى. التجمع متاح بمقر فرع شركة دلني طرابلس الساعة 08:30 صباحاً.</p>
          <div className="mt-4 flex flex-wrap gap-2 justify-start">
            <Link to="/trips" className="bg-white text-primary font-black px-4 py-2 rounded-xl hover:-translate-y-0.5 transition text-sm">استكشف رحلات أخرى 🧭</Link>
            <Link to="/support" className="bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2 rounded-xl text-sm">💬 تواصل مع الدعم</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="رحلات قادمة" value={2} icon="🗓️" tone="sea" />
        <StatCard label="تذاكر مؤكدة" value={2} icon="🎟️" tone="green" />
        <StatCard label="طريقة السداد" value="نقداً بمقر الشركة" hint="قبل 24 ساعة من الانطلاق" icon="🏢" tone="sun" />
        <StatCard label="نقاط الاستكشاف" value="1,240" icon="🏆" tone="clay" />
      </div>

      {/* OVERVIEW & BOOKINGS TAB */}
      {(active === "overview" || active === "bookings") && (
        <div className="grid lg:grid-cols-3 gap-6 text-right">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="تذاكري وحجوزاتي القادمة" action={<Link to="/trips" className="text-primary text-sm font-black hover:underline">+ حجز جديد</Link>}>
              <div className="space-y-4">
                {myBookings.map((b) => (
                  <div key={b.code} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border bg-white hover:border-amber-400 transition shadow-sm text-right">
                    <div className="w-full sm:w-32 h-auto min-h-[110px] rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/60 flex flex-col items-center justify-center p-3 shrink-0 text-center shadow-sm relative overflow-hidden">
                      {/* Decorative elements */}
                      <div className="absolute -right-4 -top-4 w-12 h-12 bg-orange-500/10 rounded-full blur-xl"></div>
                      <div className="absolute -left-4 -bottom-4 w-12 h-12 bg-amber-500/10 rounded-full blur-xl"></div>
                      
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-orange-100 flex items-center justify-center mb-2 z-10">
                        <span className="text-lg">🎫</span>
                      </div>
                      <span className="text-[11px] font-mono font-black text-orange-700 z-10 tracking-tight">{b.code}</span>
                      <span className="text-[9px] text-orange-600/80 mt-1 font-bold z-10 leading-tight">{b.type.split(' (')[0]}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="font-black text-foreground text-base">{b.tripName}</div>
                        <Badge tone={b.status === "مؤكدة" ? "green" : "sun"}>{b.status}</Badge>
                      </div>

                      <div className="text-xs font-semibold text-muted-foreground space-y-1">
                        <div>📅 <b>التاريخ والتوقيت:</b> {b.date} ({b.time})</div>
                        <div>📍 <b>نقطة الانطلاق الثابتة:</b> {b.pickup}</div>
                        <div>👨‍✈️ <b>المرشد والناقل:</b> {b.guideName} • {b.companyName}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="font-black text-primary text-sm">التكلفة: {b.price} (مسددة كاش)</div>
                        <button
                          onClick={() => setTicketModal(b)}
                          className="text-xs font-black px-4 py-2 rounded-xl bg-gradient-sun text-gold-foreground shadow-gold hover:scale-105 transition flex items-center gap-1.5"
                        >
                          <span>📱</span> عرض التذكرة الرقمية (E-Ticket)
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="عروض ومقترحات سياحية" action={<span className="text-xs text-muted-foreground">توصيات دلني الذكية</span>}>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { img: destGhadames, name: "غدامس القديمة", price: "د.ل 350" },
                  { img: privateTripImg, name: "رحلة صحراوية VIP", price: "د.ل 1,200" },
                  { img: destAcacus, name: "أكاكوس - 3 أيام", price: "د.ل 900" },
                ].map((s) => (
                  <div key={s.name} className="rounded-xl overflow-hidden border border-border group cursor-pointer text-right">
                    <div className="relative h-32 overflow-hidden">
                      <img src={s.img} alt={s.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                    </div>
                    <div className="p-3">
                      <div className="font-black text-sm text-foreground">{s.name}</div>
                      <div className="text-primary font-black text-sm mt-1">{s.price}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            <SectionCard title="جواز الاستكشاف وشهادة السائح">
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-sun mx-auto grid place-items-center text-4xl shadow-gold">🏆</div>
                <div className="mt-3 font-black text-foreground">مسافر فضي معتمد</div>
                <div className="text-xs text-muted-foreground">760 نقطة لبلوغ المستوى الذهبي</div>
                <div className="mt-3 h-2.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-sun" style={{ width: "62%" }} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="إشعارات الرحلة والمرشد" action={<Link to="/support" className="text-primary text-xs font-black hover:underline">الدعم</Link>}>
              <div className="space-y-3">
                {[
                  { name: "أ. سالم القذافي (المرشد)", msg: "سنلتقي عند فرع طرابلس 8:30ص لا تنسوا إحضار الهوية الرسمية", t: "قبل ساعة" },
                  { name: "إدارة منصة دلني", msg: "تم تأكيد حجزك كاش بمقر الشركة وتفعيل التذكرة ✓", t: "أمس" },
                ].map((m) => (
                  <div key={m.name} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-sea text-white grid place-items-center text-sm font-black shrink-0">{m.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs mb-0.5">
                        <span className="font-black text-foreground">{m.name}</span>
                        <span className="text-muted-foreground">{m.t}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-snug">{m.msg}</p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </div>
      )}

      {/* COMPANY PAYMENT INSTRUCTIONS */}
      {active === "company_payment" && (
        <SectionCard title="🏢 تعليمات السداد">
          <div className="space-y-4 text-right">
            <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2 text-amber-900 font-bold">
              <div className="text-sm font-black text-amber-800">📌 الدفع الفيزيائي بموقع الشركة:</div>
              <p>تسهيلاً على السياح وحفاظاً على الشفافية، يتم تأكيد وسداد كافة الرحلات والحجوزات <b>فيزيائياً ونقداً بمقر وموقع شركة النقل المعتمد</b> أو المكتب الرئيسي لمنصة دلّني.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 text-xs font-semibold">
              <div className="p-4 rounded-xl border border-border bg-white space-y-1">
                <div className="font-black text-foreground text-sm">1. حجز المقعد مبدئياً</div>
                <p className="text-muted-foreground">احجز مقعدك من المنصة للحصول على كود الحجز المبدئي وتأمين دورك بالرحلة.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white space-y-1">
                <div className="font-black text-foreground text-sm">2. زيارة مقر الشركة</div>
                <p className="text-muted-foreground">توجه لفرع وموقع الشركة قبل موعد الرحلة مع إبراز كود الحجز ورقم الهوية.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white space-y-1">
                <div className="font-black text-foreground text-sm">3. استلام التذكرة المؤكدة</div>
                <p className="text-muted-foreground">عند السداد الفيزيائي بمقر الشركة يتم تفعيل التذكرة النهائية واعتماد الصعود.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* PROFILE EDIT TAB FOR TOURIST */}
      {active === "profile" && (
        <SectionCard title="تعديل الملف الشخصي ورقم جواز السفر/الهوية للسائح">
          <form className="max-w-xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <Field label="كود السائح بالمنصة (tourist_id)" value={touristInfo.tourist_id} onChange={() => {}} />
            <Field 
              label="الاسم الكامل للسائح (name_full)" 
              value={touristInfo.name_full} 
              onChange={(v) => setTouristInfo({ ...touristInfo, name_full: v })} 
              pattern={/^[\u0600-\u06FF\sA-Za-z]+$/} 
              errorMessage="الاسم يجب أن يحتوي على حروف فقط (عربي/إنجليزي)" 
              maxLength={50} 
            />
            <Field 
              label="البريد الإلكتروني (email)" 
              type="email" 
              value={touristInfo.email} 
              onChange={(v) => setTouristInfo({ ...touristInfo, email: v })} 
              pattern={/^[^\s@]+@[^\s@]+\.[^\s@]+$/} 
              errorMessage="صيغة البريد الإلكتروني غير صحيحة" 
            />
            <LibyanPhoneField label="رقم الهاتف (phone_number)" value={touristInfo.phone_number} onChange={(v) => setTouristInfo({ ...touristInfo, phone_number: v })} />
            <Field 
              label="رقم جواز السفر أو الرقم الوطني (national_id_or_passport)" 
              value={touristInfo.national_id_or_passport} 
              onChange={(v) => setTouristInfo({ ...touristInfo, national_id_or_passport: v })} 
              pattern={/^[A-Za-z0-9]{6,15}$/} 
              errorMessage="يجب أن يتكون من 6 إلى 15 حرفاً أو رقماً" 
              maxLength={15} 
            />

            <Field label="كلمة المرور الحالية أو الجديدة" type="password" value={touristInfo.password} onChange={(v) => setTouristInfo({ ...touristInfo, password: v })} />

            <button className="px-6 h-11 bg-gradient-sea text-white font-black text-sm rounded-xl shadow-glow">
              حفظ وتحديث الملف الشخصي ✓
            </button>
          </form>
        </SectionCard>
      )}

      {/* E-Ticket View Modal */}
      {ticketModal && (
        <Modal open={!!ticketModal} onClose={() => setTicketModal(null)} size="lg">
          <div className="p-0 dir-rtl bg-white rounded-3xl overflow-hidden relative shadow-2xl" dir="rtl">
            
            {/* Header / Brand */}
            <div className="p-6 pb-0 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#D96B27] to-[#F3A150] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-orange-500/30">
                  🎫
                </div>
                <div>
                  <h3 className="font-black text-xl text-slate-900 tracking-tight">التذكرة الإلكترونية (E-Ticket)</h3>
                  <p className="text-xs text-slate-500 font-bold">منصة دلني لخدمات السياحة والرحلات في ليبيا</p>
                </div>
              </div>
              <div className="text-left">
                <span className="font-mono text-sm px-4 py-1.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200 font-black block">
                  {ticketModal.code}
                </span>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6 mt-4 relative">
              {/* Divider lines imitating a real ticket */}
              <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-slate-200"></div>
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-slate-900/50 rounded-full" style={{ mixBlendMode: 'overlay' }}></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-slate-900/50 rounded-full" style={{ mixBlendMode: 'overlay' }}></div>

              <div className="flex flex-col lg:flex-row gap-6 mt-4">
                {/* Left Side: QR Code & Status */}
                <div className="w-full lg:w-48 shrink-0 flex flex-col items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl p-5 text-center">
                  <div className="w-32 h-32 bg-white rounded-xl shadow-sm border border-slate-200 p-2 flex items-center justify-center mb-3">
                    <QrCode className="w-full h-full text-slate-800" strokeWidth={1.5} />
                  </div>
                  <div className="text-[10px] text-slate-500 font-bold mb-2">يرجى إبراز هذا الرمز عند الدفع بمقر الشركة للتحقق</div>
                  <div className="w-full py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-xs font-black">
                    ✅ {ticketModal.status}
                  </div>
                </div>

                {/* Right Side: Details */}
                <div className="flex-1 space-y-5">
                  <div className="space-y-1">
                    <h4 className="text-xl font-black text-slate-900">{ticketModal.tripName}</h4>
                    <span className="inline-block text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-bold border border-slate-200">{ticketModal.type}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🗓️ التاريخ والوقت</div>
                      <div className="text-sm font-black text-slate-800">{ticketModal.date}</div>
                      <div className="text-xs font-bold text-[#D96B27]">{ticketModal.time}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">📍 نقطة التجمع والانطلاق</div>
                      <div className="text-sm font-bold text-slate-800 leading-tight">{ticketModal.pickup}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">🚌 الناقل والمركبة</div>
                      <div className="text-xs font-bold text-slate-700">{ticketModal.companyName}</div>
                      <div className="text-[11px] text-slate-500">{ticketModal.vehicleModel} · <span className="font-mono text-slate-700 font-bold">{ticketModal.vehiclePlate}</span></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">👨‍✈️ المرشد السياحي</div>
                      <div className="text-xs font-bold text-slate-700">{ticketModal.guideName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{ticketModal.guideLicense}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">👥 المقاعد والسعر</div>
                      <div className="text-sm font-black text-slate-800">{ticketModal.seats} مقاعد · <span className="text-[#003580]">{ticketModal.price}</span></div>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                        🛡️ {ticketModal.insuranceInfo.split('(')[0].trim()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-200 p-5 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-500 font-bold flex items-center gap-1.5">
                <span>💡</span> يُرجى التواجد في نقطة الانطلاق قبل 30 دقيقة من الموعد.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 h-10 rounded-xl bg-white border border-slate-200 text-slate-700 font-black text-xs hover:bg-slate-50 hover:text-slate-900 transition flex items-center gap-2"
                >
                  🖨️ طباعة التذكرة
                </button>
                <button
                  onClick={() => setTicketModal(null)}
                  className="px-5 h-10 rounded-xl bg-gradient-to-r from-[#D96B27] to-[#F3A150] text-white font-black text-xs shadow-md shadow-orange-500/20 hover:scale-105 transition"
                >
                  إغلاق التذكرة
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}

function LibyanPhoneField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    onChange(val);
    setError(val && !/^09\d{8}$/.test(val) ? "يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)" : "");
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input type="tel" value={value} onChange={e => handleChange(e.target.value)} placeholder="09..." className={`w-full h-10 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${error ? "border-red-500" : "border-border focus:border-primary"}`} />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}

function Field({ label, type = "text", value, onChange, placeholder, pattern, errorMessage, maxLength }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string; pattern?: RegExp; errorMessage?: string; maxLength?: number }) {
  const [error, setError] = useState("");
  const handleChange = (val: string) => {
    if (maxLength && val.length > maxLength) return;
    onChange(val);
    if (pattern && val) {
      setError(!pattern.test(val) ? (errorMessage || "إدخال غير صحيح") : "");
    } else {
      setError("");
    }
  };
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-10 px-3 rounded-xl border bg-white text-right focus:outline-none text-xs font-semibold ${error ? "border-red-500" : "border-border focus:border-primary"}`}
      />
      {error && <div className="text-[10px] text-red-500 mt-1 font-bold">{error}</div>}
    </div>
  );
}
