import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Badge, DashboardShell, SectionCard, StatCard, type NavItem } from "@/components/DashboardShell";
import { Modal } from "@/components/Modals";
import destUbari from "@/assets/dest-ubari.jpg";
import destGhadames from "@/assets/dest-ghadames.jpg";
import destAcacus from "@/assets/dest-acacus.jpg";
import privateTripImg from "@/assets/private-trip.jpg";
import { useLanguage } from "@/lib/i18n";
import type { Tourist, BookingDaily, BookingWeekly, PrivateTrip, ReviewDailyTrip, ReviewHotel } from "@/lib/dbSchema";

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
  tripId: string;
  tripName: string;
  type: "رحلة يومية" | "رحلة أسبوعية";
  date: string;
  time: string;
  pickup: string;
  seats: number;
  passengers: string;
  guideName: string;
  guideLicense: string;
  companyName: string;
  contractNo: string;
  driverName: string;
  driverLicense: string;
  vehicleModel: string;
  vehiclePlate: string;
  insuranceInfo: string;
  status: "مؤكدة" | "بانتظار التأكيد" | "ملغية";
  payment_status: "paid" | "unpaid" | "cash_at_office";
  price: string;
  tripImage?: string;
};

function TouristDashboard() {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [active, setActive] = useState("overview");
  const [ticketModal, setTicketModal] = useState<Ticket | null>(null);

  // Tourist Profile Data according to DelniDB: tourists table
  const [touristInfo, setTouristInfo] = useState<Tourist>({
    tourist_id: "T-8812903",
    full_name: "أحمد بن علي المصراتي",
    email: "ahmed.misrati@dalni.ly",
    phone_number: "0912345678",
    password: "••••••••",
  });

  // Daily & Weekly Bookings according to DelniDB: bookings_daily & bookings_weekly
  const [bookings, setBookings] = useState<Ticket[]>([
    {
      code: "BK-D-2026-9812",
      tripId: "DT-101",
      tripName: "جولة لبدة الكبرى اليومية والآثار الرومانية",
      type: "رحلة يومية",
      date: "الجمعة 25 أغسطس 2026",
      time: "التجمع 08:30 ص | الانطلاق 09:00 ص",
      pickup: "طرابلس - طريق الشط (مقر شركة دلني الرئيسي)",
      seats: 2,
      passengers: "أحمد المصراتي، عائشة المصراتي",
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
      payment_status: "cash_at_office",
      price: "360 د.ل",
      tripImage: "/assets/ai_desert.jpg"
    },
    {
      code: "BK-W-2026-4410",
      tripId: "WT-201",
      tripName: "مغامرة أوباري وبحيرات الصحراء (6 أيام)",
      type: "رحلة أسبوعية",
      date: "السبت 1 سبتمبر 2026",
      time: "التجمع 07:00 ص | الانطلاق 07:30 ص",
      pickup: "مطار معيتيقة الدولي / مقر الشركة",
      seats: 1,
      passengers: "أحمد المصراتي",
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
      payment_status: "cash_at_office",
      price: "1,850 د.ل",
      tripImage: destUbari
    }
  ]);

  // Private custom trip requests according to DelniDB: private_trips table
  const [privateTrips, setPrivateTrips] = useState<PrivateTrip[]>([
    {
      private_trip_id: "PT-501",
      status_order: "مؤكدة",
      customer_description: "طلب رحلة VIP عائلية إلى الجبل الأخضر وشحات مع حافلة خاصة ومرشد معتمد",
      preferred_start_date: "2026-09-15",
      duration_days: 4,
      number_of_companions: 5,
      quoted_price: 3200,
      admin_itinerary_plan: "اليوم 1: الاستقبال والانطلاق، اليوم 2: آثار قورينا، اليوم 3: وادي الكوف ورأس الهلال، اليوم 4: العودة",
      assigned_guide_license: "G-9901",
      assigned_vehicle_plate: "طرابلس 4517",
      customer_name: "أحمد بن علي المصراتي",
      customer_phone: "0912345678",
      tourist_id: "T-8812903",
    }
  ]);

  // Reviews submitted by this tourist according to DelniDB: reviews_* tables
  const [myReviews, setMyReviews] = useState<{ id: string; target: string; type: string; rating: number; comment: string; date: string }[]>([
    { id: "REV-101", target: "رحلة لبدة الكبرى الأثرية", type: "رحلة يومية (daily_trips)", rating: 5, comment: "تنظيم ممتاز جداً ومرشد متمكن من تاريخ الآثار الرومانية.", date: "2026-07-20" },
    { id: "REV-102", target: "فندق الفندق الكبير طرابلس", type: "فندق (hotels)", rating: 4, comment: "إطلالة ساحرة وخدمة راقية ونظافة ممتازة.", date: "2026-07-15" },
  ]);

  const nav: NavItem[] = [
    { id: "overview", label: isAr ? "نظرة عامة" : "Overview", icon: "🏠" },
    { id: "bookings", label: isAr ? "حجوزاتي والتذاكر" : "My Bookings & Tickets", icon: "🎟️", badge: bookings.length },
    { id: "private_trips", label: isAr ? "رحلاتي الخاصة VIP" : "Custom Private Trips", icon: "👑", badge: privateTrips.length },
    { id: "reviews", label: isAr ? "تقييماتي وآرائي" : "My Reviews", icon: "⭐", badge: myReviews.length },
    { id: "company_payment", label: isAr ? "تعليمات سداد الحجز بمقر الشركة" : "Payment Instructions", icon: "🏢" },
    { id: "profile", label: isAr ? "الملف الشخصي والحساب" : "My Profile & Account", icon: "👤" },
  ];

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    alert("تم حفظ وتحديث بيانات حساب السائح في قاعدة البيانات (DelniDB: tourists) بنجاح ✓");
  };

  return (
    <DashboardShell role="tourist" roleLabel="حساب سائح" userName={touristInfo.full_name.split(" ")[0]} nav={nav} active={active} onNavigate={setActive}>
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
          <h1 className="text-2xl md:text-3xl font-black mt-1">{touristInfo.full_name}، رحلاتك المؤكدة جاهزة</h1>
          <p className="mt-2 text-white/80 max-w-lg text-sm">
            كود السائح: <span className="font-mono font-bold bg-white/20 px-2 py-0.5 rounded">{touristInfo.tourist_id}</span> · لديك {bookings.length} حجوزات نشطة بالمنصة.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-start">
            <Link to="/trips" className="bg-white text-primary font-black px-4 py-2 rounded-xl hover:-translate-y-0.5 transition text-sm">استكشف رحلات أخرى 🧭</Link>
            <Link to="/support" className="bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2 rounded-xl text-sm">💬 تواصل مع الدعم</Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="تذاكر مؤكدة" value={bookings.length} icon="🎟️" tone="green" />
        <StatCard label="طلبات رحلات خاصة" value={privateTrips.length} icon="👑" tone="sea" />
        <StatCard label="تقييماتي المسجلة" value={myReviews.length} icon="⭐" tone="clay" />
        <StatCard label="طريقة السداد" value="نقداً بالفرع" hint="قبل 24 ساعة من الانطلاق" icon="🏢" tone="sun" />
      </div>

      {/* OVERVIEW & BOOKINGS TAB */}
      {(active === "overview" || active === "bookings") && (
        <div className="grid lg:grid-cols-3 gap-6 text-right">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="تذاكري وحجوزاتي (DelniDB: bookings_daily & bookings_weekly)" action={<Link to="/trips" className="text-primary text-sm font-black hover:underline">+ حجز جديد</Link>}>
              <div className="space-y-4">
                {bookings.map((b) => (
                  <div key={b.code} className="flex flex-col sm:flex-row gap-4 p-4 rounded-2xl border border-border bg-white hover:border-amber-400 transition shadow-sm text-right">
                    <div className="w-full sm:w-28 h-28 rounded-xl bg-[#D96B27] text-white flex flex-col items-center justify-center p-2 shrink-0 border border-[#C56A30] text-center shadow-soft">
                      <span className="text-2xl mb-1">🎟️</span>
                      <span className="text-[10px] font-mono font-black text-amber-200">{b.code}</span>
                      <span className="text-[9px] text-white/80 mt-1">{b.type}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                        <div className="font-black text-foreground text-base">{b.tripName}</div>
                        <div className="flex items-center gap-1.5">
                          <Badge tone={b.status === "مؤكدة" ? "green" : "sun"}>{b.status}</Badge>
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">
                            {b.payment_status === "cash_at_office" ? "سداد كاش بالفرع" : "مدفوع"}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-semibold text-muted-foreground space-y-1">
                        <div>📅 <b>التاريخ والتوقيت:</b> {b.date} ({b.time})</div>
                        <div>👥 <b>المقاعد ({b.seats}) والمرافقون:</b> {b.passengers}</div>
                        <div>📍 <b>نقطة الانطلاق:</b> {b.pickup}</div>
                        <div>👨‍✈️ <b>المرشد والناقل:</b> {b.guideName} • {b.companyName}</div>
                      </div>

                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="font-black text-primary text-sm">التكلفة: {b.price}</div>
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
                <div className="text-xs text-muted-foreground">كود السائح: {touristInfo.tourist_id}</div>
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

      {/* PRIVATE TRIPS TAB (DelniDB: private_trips) */}
      {active === "private_trips" && (
        <SectionCard title="طلبات الرحلات الخاصة كبار الشخصيات (DelniDB: private_trips)">
          <div className="space-y-4 text-right">
            {privateTrips.map((p) => (
              <div key={p.private_trip_id} className="p-5 rounded-2xl border border-border bg-white space-y-3 shadow-soft">
                <div className="flex justify-between items-start gap-2 flex-wrap">
                  <div>
                    <span className="text-xs font-mono font-bold text-muted-foreground">{p.private_trip_id}</span>
                    <h3 className="font-black text-foreground text-lg">{p.customer_description}</h3>
                  </div>
                  <Badge tone={p.status_order === "مؤكدة" ? "green" : "sun"}>{p.status_order}</Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-3 text-xs bg-muted/20 p-3 rounded-xl font-bold">
                  <div>📅 تاريخ الانطلاق المفضل: <span className="font-normal">{p.preferred_start_date}</span></div>
                  <div>⏳ المدة: <span className="font-normal">{p.duration_days} أيام</span></div>
                  <div>👥 عدد المرافقين: <span className="font-normal">{p.number_of_companions} أفراد</span></div>
                </div>
                {p.quoted_price && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex justify-between items-center">
                    <span>السعر المعتمد من الإدارة: <b className="text-sm">{p.quoted_price} د.ل</b></span>
                    <span>المرشد المعين: {p.assigned_guide_license || "قيد التعيين"} · الحافلة: {p.assigned_vehicle_plate || "قيد التعيين"}</span>
                  </div>
                )}
                {p.admin_itinerary_plan && (
                  <div className="text-xs text-muted-foreground bg-[#FAFAF8] p-3 rounded-xl border border-border">
                    <b className="text-foreground block mb-1">البرنامج ومسار الرحلة المعتمد من الإدارة:</b>
                    {p.admin_itinerary_plan}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* REVIEWS TAB (DelniDB: reviews_* tables) */}
      {active === "reviews" && (
        <SectionCard title="تقييماتي وآرائي المسجلة (DelniDB: reviews_daily_trips / reviews_hotels / etc.)">
          <div className="space-y-3 text-right">
            {myReviews.map((r) => (
              <div key={r.id} className="p-4 rounded-xl border border-border bg-white space-y-1 shadow-soft">
                <div className="flex justify-between items-center">
                  <span className="font-black text-foreground text-sm">{r.target}</span>
                  <span className="text-amber-500 font-bold text-sm">{"⭐".repeat(r.rating)}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">{r.type} · تاريخ التقييم: {r.date}</div>
                <p className="text-xs text-slate-700 font-semibold pt-1">"{r.comment}"</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* COMPANY PAYMENT INSTRUCTIONS */}
      {active === "company_payment" && (
        <SectionCard title="🏢 تعليمات وآلية سداد التكلفة بمقر الشركة (الدفع النقدي)">
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
                <p className="text-muted-foreground">توجه لفرع وموقع الشركة قبل موعد الرحلة مع إبراز كود الحجز ورقم الهاتف.</p>
              </div>
              <div className="p-4 rounded-xl border border-border bg-white space-y-1">
                <div className="font-black text-foreground text-sm">3. استلام التذكرة المؤكدة</div>
                <p className="text-muted-foreground">عند السداد الفيزيائي بمقر الشركة يتم تفعيل التذكرة النهائية واعتماد الصعود.</p>
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* PROFILE EDIT TAB FOR TOURIST (DelniDB: tourists) */}
      {active === "profile" && (
        <SectionCard title="تعديل الملف الشخصي وبيانات حساب السائح (DelniDB: tourists)">
          <form className="max-w-xl space-y-4 text-right" onSubmit={handleUpdateProfile}>
            <Field label="كود السائح بالمنصة (tourist_id)" value={touristInfo.tourist_id} onChange={() => {}} />
            <Field label="الاسم الكامل للسائح (full_name)" value={touristInfo.full_name} onChange={(v) => setTouristInfo({ ...touristInfo, full_name: v })} />
            <Field label="البريد الإلكتروني (email)" type="email" value={touristInfo.email} onChange={(v) => setTouristInfo({ ...touristInfo, email: v })} />
            <Field label="رقم الهاتف (phone_number)" value={touristInfo.phone_number} onChange={(v) => setTouristInfo({ ...touristInfo, phone_number: v })} />
            <Field label="كلمة المرور (password)" type="password" value={touristInfo.password || ""} onChange={(v) => setTouristInfo({ ...touristInfo, password: v })} />

            <button className="px-6 h-11 bg-gradient-sea text-white font-black text-sm rounded-xl shadow-glow">
              حفظ وتحديث الملف الشخصي في DelniDB ✓
            </button>
          </form>
        </SectionCard>
      )}

      {/* E-Ticket View Modal */}
      {ticketModal && (
        <Modal open={!!ticketModal} onClose={() => setTicketModal(null)} size="lg">
          <div className="p-6 dir-rtl space-y-5 bg-slate-950 text-slate-100 rounded-3xl overflow-hidden relative shadow-glow" dir="rtl">
            <div className="flex items-center justify-between border-b border-amber-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-sun text-gold-foreground grid place-items-center text-2xl font-black shadow-gold">
                  🎫
                </div>
                <div>
                  <h3 className="font-black text-lg text-amber-400 tracking-wide">التذكرة الإلكترونية الرسمية (E-Ticket Boarding Pass)</h3>
                  <p className="text-xs text-slate-400 font-bold">منصة دلني لخدمات السياحة والرحلات في ليبيا · Delni Journeys</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-xs px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black block">
                  {ticketModal.code}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold mt-1 block">✅ حجز مؤكد ومسدد فيزيائياً بمقر الشركة</span>
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
              {ticketModal.tripImage && (
                <div className="h-32 w-full relative overflow-hidden">
                  <img src={ticketModal.tripImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
                  <div className="absolute bottom-3 right-4 left-4 flex justify-between items-end">
                    <h4 className="text-lg font-black text-white drop-shadow-md">{ticketModal.tripName}</h4>
                    <span className="text-xs bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg font-black">{ticketModal.type}</span>
                  </div>
                </div>
              )}

              <div className="p-5 space-y-4 text-xs font-semibold text-right">
                <div className="grid md:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-amber-400 font-bold text-[11px]">🗓️ التاريخ ووقت الانطلاق:</div>
                    <div className="text-white font-black text-sm">{ticketModal.date}</div>
                    <div className="text-slate-400 font-mono text-[11px]">{ticketModal.time}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                    <div className="text-amber-400 font-bold text-[11px]">📍 نقطة التجمع والانطلاق الثابتة:</div>
                    <div className="text-white font-bold">{ticketModal.pickup}</div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3 text-slate-300">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="text-amber-400 font-bold text-[11px]">🚌 الناقل وشركة النقل:</div>
                    <div><b>الشركة:</b> {ticketModal.companyName} (<span className="font-mono text-amber-300">{ticketModal.contractNo}</span>)</div>
                    <div><b>السائق المكلف:</b> {ticketModal.driverName} (<span className="font-mono">{ticketModal.driverLicense}</span>)</div>
                    <div><b>السيارة واللوحة:</b> {ticketModal.vehicleModel} · <span className="font-bold text-amber-300 font-mono">{ticketModal.vehiclePlate}</span></div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                    <div className="text-amber-400 font-bold text-[11px]">👨‍✈️ المرشد السياحي والتأمين:</div>
                    <div><b>المرشد المعتمد:</b> {ticketModal.guideName} (<span className="font-mono">{ticketModal.guideLicense}</span>)</div>
                    <div><b>عدد المقاعد:</b> {ticketModal.seats} مقعد ({ticketModal.passengers})</div>
                    <div className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 p-1.5 rounded border border-emerald-500/20">
                      🛡️ {ticketModal.insuranceInfo}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl text-slate-950 flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-amber-400">
                  <div className="space-y-1 text-center md:text-right">
                    <div className="text-xs font-black text-slate-800 uppercase tracking-widest">تذكرة سفر وصعود معتمدة</div>
                    <div className="text-lg font-black text-slate-900 font-mono tracking-wider">{ticketModal.code}</div>
                    <div className="text-[11px] text-slate-600 font-bold">يرجى إبراز رقم التذكرة والهوية الرسمية عند الوصول لمقر الشركة أو الصعود للحافلة</div>
                  </div>

                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black shrink-0">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <span className="block font-black">الدفع فيزيائي بمقر الشركة</span>
                      <span className="text-[10px] text-emerald-600 font-bold">تم تأكيد السداد الفعلي ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                <span>💡</span> يُرجى التواجد في نقطة الانطلاق قبل 30 دقيقة من الموعد إبراز الهوية الرسمية.
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 h-10 rounded-xl bg-[#1ABC9C] text-white font-black text-xs hover:bg-[#16A085] transition shadow-soft"
                >
                  🖨️ طباعة التذكرة
                </button>
                <button
                  onClick={() => setTicketModal(null)}
                  className="px-5 h-10 rounded-xl bg-gradient-sun text-gold-foreground font-black text-xs shadow-gold hover:scale-105 transition"
                >
                  تم والاحتفاظ بالتذكرة ✓
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </DashboardShell>
  );
}

function Field({ label, type = "text", value, onChange, placeholder }: { label: string; type?: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-foreground mb-1 block">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 px-3 rounded-xl border border-border bg-white text-right focus:border-primary outline-none text-xs font-semibold"
      />
    </div>
  );
}
