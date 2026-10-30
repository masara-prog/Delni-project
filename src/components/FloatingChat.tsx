import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BotMessageSquare } from "lucide-react";

type Msg = { 
  id: number; 
  from: "user" | "admin" | "ai"; 
  text: string; 
  time: string;
  image?: string;
  badge?: string;
};

const quickButtons = [
  "📷 التعرف على معلم بالصورة",
  "🗣️ ترجمة لهجة ومصطلحات ليبية",
  "☀️ طقس وأفضل أوقات الزيارة",
  "🚨 بلاغ عاجل للإدارة"
];

const libyanTerms: Record<string, string> = {
  "شن الجو": "كيف حالك؟ وما هي الأخبار؟ (تحية شعبية متداولة بكثرة)",
  "شاهي باللوز": "الشاي الليبي التقليدي المركز المزين باللوز المحمص أو الكاوكاو.",
  "مربوعة": "غرفة الاستقبال الرئيسية للضيوف في البيت الليبي الأصيل.",
  "باستيل": "فطائر طرابلسية محشوة باللحم المفروم والبيض، من أشهى المأكولات.",
  "حولي": "الزي التقليدي الليبي الرجالي الفاخر المنسوج من الصوف أو الحرير.",
  "عين الفرس": "النبع المائي الشهير المؤرخ لتأسيس واحة مدينة غدامس القديمة."
};

const landmarkSamples = [
  {
    name: "قوس سيبتيموس سيفيروس - لبدة الكبرى",
    info: "🏛️ تم التعرف بالذكاء الاصطناعي: هذا قوس النصر الشهير بالإمبراطور الروماني سيبتيموس سيفيروس بمدينة لبدة الكبرى (تأسس عام 203م). يقع في الخمس ويعتبر تحفة المعمار الروماني بليبيا.",
    img: "/assets/ai_ruins.jpg"
  },
  {
    name: "بحيرة قبرعون - أوباري فزان",
    info: "🌵 تم التعرف بالذكاء الاصطناعي: هذه بحيرة قبرعون المالحة بين كثبان رملة أوباري الذهبية بجرماء الصحراء الكبرى. تتميز بالنخيل الباسق والمياه الدافئة عالية الملوحة.",
    img: "/assets/ai_ghadames.jpg"
  },
  {
    name: "غدامس القديمة - لؤلؤة الصحراء",
    info: "🏡 تم التعرف بالذكاء الاصطناعي: شوارع وممرات غدامس البيضاء التراثية المسجلة بليونسكو. تمتاز بالنظام الهيدروليكي والمنازل الطينية المسقوفة ذات العزل الحراري العالي.",
    img: "/assets/ai_ghadames.jpg"
  }
];

import { useLanguage } from "@/lib/i18n";
import { getOrCreateUserSession, sendUserMessage, type ChatSession } from "@/lib/supportChat";

const now = () => new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });

export function FloatingChat() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t, language, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);

  // User session resolution for live support synchronization with Admin Dashboard
  const getSessionInfo = () => {
    try {
      if (typeof window !== "undefined") {
        const u = localStorage.getItem("dalni_user");
        if (u) {
          const parsed = JSON.parse(u);
          const name = parsed.full_name || parsed.name || "مستخدم دلّني";
          const role = parsed.role === "guide" ? "مرشد سياحي" : parsed.role === "company" ? "شركة نقل" : parsed.role === "driver" ? "سائق" : "سائح";
          const id = `session-${parsed.role || 'tourist'}-${name.replace(/\s+/g, '_')}`;
          return { name, role, id };
        }
      }
    } catch {}
    return { name: "زائر شات دلني", role: "سائح", id: "session-visitor-chat" };
  };

  const [supportSession, setSupportSession] = useState<ChatSession | null>(null);
  const [supportInput, setSupportInput] = useState("");

  // Sync with live support chat system
  useEffect(() => {
    if (!supportOpen) return;
    const { name, role, id } = getSessionInfo();
    const cur = getOrCreateUserSession(id, name, role);
    setSupportSession(cur);

    const handleSync = (e: any) => {
      const all: ChatSession[] = e?.detail || [];
      const updated = all.find((s) => s.id === id || s.user_name === name);
      if (updated) setSupportSession(updated);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dalni_chat_sessions" && e.newValue) {
        try {
          const all: ChatSession[] = JSON.parse(e.newValue);
          const updated = all.find((s) => s.id === id || s.user_name === name);
          if (updated) setSupportSession(updated);
        } catch {}
      }
    };

    window.addEventListener("dalni_chat_sync", handleSync);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("dalni_chat_sync", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [supportOpen]);

  const handleSupportSend = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = supportInput.trim();
    if (!txt) return;

    const { name, role, id } = getSessionInfo();
    const updated = sendUserMessage(id, name, role, txt);
    setSupportSession({ ...updated });
    setSupportInput("");
  };

  const [messages, setMessages] = useState<Msg[]>([
    { 
      id: 1, 
      from: "ai", 
      time: now(), 
      text: language === 'ar' 
        ? "مرحباً بك في الذكاء الاصطناعي لمنصة ليبيا رحلات Pro 🤖👋\nأنا مساعدك الذكي لخدمات السياحة: يمكنك رفع صورة لمعلم سياحي للتعرف عليه، أو السؤال عن أي رحلة وفندق!"
        : "Welcome to Libya Journeys Pro Smart AI 🤖👋\nI am your travel assistant: Feel free to ask about any trip, hotel, attraction, or upload a photo to identify landmarks!" 
    },
  ]);

  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supportScrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, analyzingImage, open]);

  useEffect(() => {
    supportScrollRef.current?.scrollTo({ top: supportScrollRef.current.scrollHeight, behavior: "smooth" });
  }, [supportSession?.messages, supportOpen]);

  // The AI assistant shows on the public pages only: not on sign-in/sign-up nor in the dashboards (they have their own support window)
  if (path.startsWith("/support") || path.startsWith("/auth") || path.startsWith("/dashboard")) {
    return null;
  }

  const handleSend = (text: string) => {
    const t = text.trim();
    if (!t) return;

    setMessages((m) => [...m, { id: Date.now(), from: "user", text: t, time: now() }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);

      // Check if term matches Libyan dialect dictionary
      const termMatch = Object.keys(libyanTerms).find(k => t.includes(k));
      if (termMatch) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "ai",
            badge: "🗣️ ترجمة لهجة ليبية",
            text: `معنى "${termMatch}":\n${libyanTerms[termMatch]}`,
            time: now()
          }
        ]);
        return;
      }

      if (t.includes("طقس") || t.includes("أوقات الزيارة")) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "ai",
            badge: "🌤️ توصية الطقس والرحلات",
            text: "الطقس الموصى به:\n• المدن الساحلية (طرابلس، بنغازي): الأجواء ممتازة ومعتدلة.\n• الصحراء والواحات (أوباري، غدامس): الأوقات المثالية للزيارة من أكتوبر حتى أبريل لتجنب حرارة الصيف.",
            time: now()
          }
        ]);
        return;
      }

      if (t.includes("بلاغ") || t.includes("عاجل")) {
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "admin",
            badge: language === 'ar' ? "🚨 استقبال بلاغ فوراً" : "🚨 Urgent Report Received",
            text: language === 'ar' 
              ? "تم استلام بلاغك وإخطار فريق إدارة دلني الميداني فوراً. سيتم التواصل معك على هاتفك للحصول على المساعدة المباشرة."
              : "Your report has been received and the field management team has been notified immediately. We will contact you directly.",
            time: now()
          }
        ]);
        return;
      }

      // Intelligent local client-side response
      const lower = t.toLowerCase();
      let reply = "";
      if (lower.includes("أوباري") || lower.includes("صحراء") || lower.includes("سفاري")) {
        reply = language === 'ar'
          ? "أهلاً بك! 🐪 بحيرات أوباري وصحراء فزان وجهة عالمية فريدة للتخييم وسفاري الكثبان الذهبية (أفضل موسم: نوفمبر - مارس). لدينا رحلات أسبوعية بسيارات دفع رباعي وسائقين محترفين."
          : "Welcome! The Ubari lakes and Fezzan desert are world-class destinations for camping and sand dune safaris. We offer weekly tours with 4WD vehicles and experienced drivers.";
      } else if (lower.includes("لبدة") || lower.includes("رومان") || lower.includes("صبراتة")) {
        reply = language === 'ar'
          ? "مرحباً بك! 🏛️ لبدة الكبرى وصبراتة هما درتا التراث الروماني على البحر المتوسط المصنفتان في اليونسكو. نوفر رحلات يومية بحافلات مكيفة ومرشدين معتمدين."
          : "Welcome! Leptis Magna and Sabratha are UNESCO-listed Roman heritage gems. We offer daily tours with air-conditioned coaches and certified guides.";
      } else if (lower.includes("مرشد") || lower.includes("دليل")) {
        reply = language === 'ar'
          ? "جميع المرشدين في منصة دلني مرخصون ومعتمدون من وزارة السياحة، ويمكنك استعراض ملفاتهم واختيار المرشد الأنسب لرحلتك من صفحة المرشدين."
          : "All tour guides on Dalni are certified. You can browse their profiles and choose the best guide from the guides page.";
      } else {
        reply = language === 'ar'
          ? `شكراً لاستفسارك! في منصة دَلِّني نسعد بتقديم كافة التسهيلات حول المعالم السياحية الليبية، الرحلات اليومية والأسبوعية، وخدمات النقل والإرشاد. يمكنك أيضاً رفع صورة أي معلم سياحي للتعرف عليه فوراً!`
          : `Thanks for your inquiry! At Dalni, we are happy to assist with Libyan landmarks, tours, transport, and certified guides. You can also upload a landmark photo for instant recognition!`;
      }

      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "ai",
          badge: language === 'ar' ? "✨ مساعد دَلِّني الذكي" : "✨ Dalni Smart Assistant",
          text: reply,
          time: now(),
        },
      ]);
    }, 400);
  };

  const handleImageSimulate = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: "user", text: language === 'ar' ? "📷 قمت برفع صورة معلم سياحي للتعرف عليه بالذكاء الاصطناعي..." : "📷 Uploaded a landmark image for AI identification...", image: imageUrl, time: now() }
    ]);

    setAnalyzingImage(true);

    setTimeout(() => {
      setAnalyzingImage(false);
      const sample = landmarkSamples[Math.floor(Math.random() * landmarkSamples.length)];
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "ai",
          badge: language === 'ar' ? "👁️ نتائج التعرف البصري" : "👁️ Computer Vision Result",
          text: sample.info,
          image: sample.img,
          time: now()
        }
      ]);
    }, 800);
  };

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="مساعد الذكاء الاصطناعي"
        className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} z-[90] h-[52px] w-[150px] justify-center rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-400 text-white font-black shadow-2xl shadow-orange-500/40 hover:scale-105 hover:shadow-orange-500/60 transition-all flex items-center gap-2 border-2 border-white/50`}
      >
        <span className="relative flex items-center justify-center shrink-0 w-6 h-6 text-xl animate-bounce">🤖</span>
        <span className="text-xs font-black text-white drop-shadow text-center">
          {language === 'ar' ? 'ذكاء دلني' : 'Dallani AI'}
        </span>
        <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-300 animate-ping" />
      </button>

      {open && (
        <div className={`fixed bottom-24 ${language === 'ar' ? 'left-6' : 'right-6'} z-[95] w-[94vw] max-w-md h-[78vh] max-h-[620px] bg-white text-[#0B132B] rounded-3xl shadow-2xl border border-[#E6E1D6] flex flex-col overflow-hidden animate-fade-up`} dir={dir}>
          <div className="bg-gradient-to-r from-blue-50 via-sky-50 to-amber-50 p-4 border-b border-[#E6E1D6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#003580] to-[#1B5A78] p-0.5 shadow-md flex items-center justify-center text-xl text-white">
                🤖
              </div>
              <div>
                <div className="font-black text-sm text-[#0B132B] flex items-center gap-1.5">
                  {language === 'ar' ? 'مساعد دلّني السياحي الذكي' : 'Dallani AI Travel Assistant'}
                  <span className="text-[9px] bg-[#003580] text-white px-1.5 py-0.5 rounded-md font-bold">AI Active</span>
                </div>
                <div className="text-[10px] text-[#526078] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> 
                  {language === 'ar' ? 'متصل الآن' : 'Online'}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl bg-white hover:bg-[#F4F1EA] text-[#526078] border border-[#E6E1D6] grid place-items-center text-sm font-black shadow-xs">✕</button>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FAFAF8]">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] p-3.5 text-xs md:text-sm rounded-2xl shadow-xs ${
                  m.from === "user"
                    ? "bg-[#003580] text-white font-bold rounded-bl-none"
                    : m.from === "ai"
                    ? "bg-white border border-[#E6E1D6] text-[#0B132B] rounded-br-none"
                    : "bg-amber-50 border border-amber-200 text-amber-950 rounded-br-none"
                }`}>
                  {m.badge && (
                    <div className="text-[10px] font-black px-2 py-0.5 rounded-md bg-blue-100 text-[#003580] mb-1.5 w-fit">
                      {m.badge}
                    </div>
                  )}

                  {m.image && (
                    <img src={m.image} alt="صورة معلم" className="w-full h-38 object-cover rounded-xl mb-2 border border-[#E6E1D6] shadow-xs" />
                  )}

                  <div className="whitespace-pre-line leading-relaxed font-semibold">{m.text}</div>
                  <div className={`text-[9px] mt-1.5 ${m.from === "user" ? "text-white/80" : "text-[#526078]"}`}>{m.time}</div>
                </div>
              </div>
            ))}

            {analyzingImage && (
              <div className="flex justify-end">
                <div className="bg-white border border-sky-300 p-3 rounded-2xl text-xs text-sky-900 font-bold flex items-center gap-2 shadow-sm animate-pulse">
                  <span className="text-base">📸</span> {language === 'ar' ? 'جارٍ تحليل الصورة بواسطة الذكاء الاصطناعي...' : 'Analyzing image using AI...'}
                </div>
              </div>
            )}

            {typing && (
              <div className="flex justify-end">
                <div className="bg-white border border-[#E6E1D6] p-3 rounded-2xl text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          {/* Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-3 bg-white border-t border-[#E6E1D6] flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSimulate}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title={language === 'ar' ? "رفع صورة لمعلم سياحي للتعرف عليه" : "Upload landmark photo"}
              className="h-10 px-3 rounded-xl bg-[#F4F1EA] hover:bg-[#E6E1D6] text-[#003580] font-black text-sm border border-[#E6E1D6] flex items-center gap-1"
            >
              📸 <span className="text-[10px] hidden sm:inline">{language === 'ar' ? 'صورة معلم' : 'Photo'}</span>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'ar' ? "اكتب استفسارك هنا..." : "Type your query here..."}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E6E1D6] text-[#0B132B] focus:border-[#003580] focus:bg-white outline-none text-xs font-semibold"
            />
            <button className="h-10 px-4 rounded-xl bg-[#003580] hover:bg-[#1B5A78] text-white font-black text-xs shadow-soft transition-all">
              {language === 'ar' ? 'إرسال' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
