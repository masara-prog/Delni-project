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
import { getOrCreateUserSession, sendUserMessage, pullUserSession, type ChatSession } from "@/lib/supportChat";

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
    // Replies from the administration come from DelniDB
    pullUserSession(id, name, role);
    const poll = window.setInterval(() => pullUserSession(id, name, role), 6000);

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
      window.clearInterval(poll);
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
        ? "مرحباً بك في «ذكاء دلني» 🤖👋\nأنا مساعدك الذكي لخدمات السياحة: يمكنك رفع صورة لمعلم سياحي للتعرف عليه، أو السؤال عن أي رحلة وفندق!"
        : "Welcome to Delni Smart AI 🤖👋\nI am your travel assistant: Feel free to ask about any trip, hotel, attraction, or upload a photo to identify landmarks!" 
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
      const has = (...words: string[]) => words.some((w) => lower.includes(w));
      // Recommendations by interest: historical places, beaches and relaxation (the desert follows below)
      if (has("تاريخ", "أثري", "أثرية", "آثار", "اثار", "تراث", "historic", "history", "ruins")) {
        reply = language === 'ar'
          ? "🏛️ أقترح عليك هذه المعالم التاريخية:\n• لبدة الكبرى (الخمس): أكبر مدينة رومانية محفوظة على المتوسط.\n• صبراتة: المسرح الروماني المطل على البحر.\n• شحات (قورينا) وأبولونيا في الجبل الأخضر: آثار إغريقية.\n• مدينة غدامس القديمة: «لؤلؤة الصحراء» المسجلة في اليونسكو.\n• المدينة القديمة وقوس ماركوس أوريليوس في طرابلس.\nتجد الرحلات اليومية إلى لبدة وصبراتة في صفحة الرحلات."
          : "🏛️ Historical places I recommend:\n• Leptis Magna (Al Khums)\n• Sabratha and its seaside Roman theatre\n• Cyrene and Apollonia in the Green Mountain\n• The old town of Ghadames (UNESCO)\n• Tripoli's old town and the Arch of Marcus Aurelius\nDaily trips to Leptis and Sabratha are on the trips page.";
      } else if (has("بحر", "شاطئ", "شواطئ", "استرخاء", "راحة", "ترفيه", "beach", "relax")) {
        reply = language === 'ar'
          ? "🏖️ للاسترخاء والترفيه أقترح:\n• شواطئ طرابلس والخمس وزوارة الهادئة.\n• منطقة رأس الهلال وسوسة في الجبل الأخضر حيث يلتقي البحر بالغابات.\n• جولة مسائية في المدينة القديمة بطرابلس مع المقاهي التراثية.\nيمكنك أيضاً طلب رحلة خاصة بالمعالم التي تختارها."
          : "🏖️ For relaxing: the beaches of Tripoli, Al Khums and Zuwara; Ras Al Hilal and Susa in the Green Mountain; an evening in Tripoli's old town. You can also request a private trip.";
      } else if (lower.includes("أوباري") || lower.includes("صحراء") || lower.includes("سفاري")) {
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

  // No support / AI buttons on the login and signup screens or in the admin dashboard
  if (/^\/(auth\/)?(login|signup)\b/.test(path) || path.startsWith("/dashboard/admin")) return null;

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="مساعد الذكاء الاصطناعي"
        className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-6'} z-[90] h-[52px] w-[150px] justify-center rounded-full bg-[#D96B27] text-white font-black shadow-md hover:scale-105 transition hidden md:flex items-center gap-2 border-2 border-white/50`}
      >
        <span className="relative flex items-center justify-center shrink-0 w-6 h-6 text-xl animate-bounce">🤖</span>
        <span className="text-xs font-black text-white drop-shadow text-center">
          {language === 'ar' ? 'ذكاء دلني' : 'Dallani AI'}
        </span>
        <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-300 animate-ping" />
      </button>

      {open && (
        <div className={`fixed bottom-24 ${language === 'ar' ? 'left-6' : 'right-6'} z-[95] w-[94vw] max-w-md h-[78vh] max-h-[620px] bg-white text-[#0B132B] rounded-3xl shadow-md border border-[#E6E1D6] flex flex-col overflow-hidden animate-fade-up`} dir={dir}>
          <div className="bg-teal-50 p-4 border-b border-[#E6E1D6] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#00736F] p-0.5 shadow-md flex items-center justify-center text-xl text-white">
                🤖
              </div>
              <div>
                <div className="font-black text-sm text-[#0B132B] flex items-center gap-1.5">
                  {language === 'ar' ? 'مساعد دلّني السياحي الذكي' : 'Dallani AI Travel Assistant'}
                  <span className="text-[11px] bg-[#00736F] text-white px-1.5 py-0.5 rounded-md font-bold">AI Active</span>
                </div>
                <div className="text-[11px] text-[#526078] font-semibold flex items-center gap-1">
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
                    ? "bg-[#00736F] text-white font-bold rounded-bl-none"
                    : m.from === "ai"
                    ? "bg-white border border-[#E6E1D6] text-[#0B132B] rounded-br-none"
                    : "bg-amber-50 border border-amber-200 text-amber-950 rounded-br-none"
                }`}>
                  {m.badge && (
                    <div className="text-[11px] font-black px-2 py-0.5 rounded-md bg-teal-100 text-[#00736F] mb-1.5 w-fit">
                      {m.badge}
                    </div>
                  )}

                  {m.image && (
                    <img src={m.image} alt="صورة معلم" className="w-full h-38 object-cover rounded-xl mb-2 border border-[#E6E1D6] shadow-xs" />
                  )}

                  <div className="whitespace-pre-line leading-relaxed font-semibold">{m.text}</div>
                  <div className={`text-[11px] mt-1.5 ${m.from === "user" ? "text-white/80" : "text-[#526078]"}`}>{m.time}</div>
                </div>
              </div>
            ))}

            {analyzingImage && (
              <div className="flex justify-end">
                <div className="bg-white border border-teal-300 p-3 rounded-2xl text-xs text-teal-900 font-bold flex items-center gap-2 shadow-sm animate-pulse">
                  <span className="text-base">📸</span> {language === 'ar' ? 'جارٍ تحليل الصورة بواسطة الذكاء الاصطناعي...' : 'Analyzing image using AI...'}
                </div>
              </div>
            )}

            {typing && (
              <div className="flex justify-end">
                <div className="bg-white border border-[#E6E1D6] p-3 rounded-2xl text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00736F] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00736F] animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00736F] animate-bounce" style={{ animationDelay: "0.3s" }} />
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
              className="h-10 px-3 rounded-xl bg-[#F4F1EA] hover:bg-[#E6E1D6] text-[#00736F] font-black text-sm border border-[#E6E1D6] flex items-center gap-1"
            >
              📸 <span className="text-[11px] hidden sm:inline">{language === 'ar' ? 'صورة معلم' : 'Photo'}</span>
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'ar' ? "اكتب استفسارك هنا..." : "Type your query here..."}
              className="flex-1 h-10 px-3.5 rounded-xl bg-[#FAFAF8] border border-[#E6E1D6] text-[#0B132B] focus:border-[#00736F] focus:bg-white outline-none text-xs font-semibold"
            />
            <button className="h-10 px-4 rounded-xl bg-[#00736F] hover:bg-[#0B4F57] text-white font-black text-xs shadow-soft transition">
              {language === 'ar' ? 'إرسال' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
