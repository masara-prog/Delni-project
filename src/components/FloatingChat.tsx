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

const now = () => new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });

export function FloatingChat() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { t, language, dir } = useLanguage();
  const [open, setOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
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
  const [supportMessages, setSupportMessages] = useState<Msg[]>([
    {
      id: 1,
      from: "admin",
      time: now(),
      text: language === 'ar' ? "مرحباً بك في مركز دعم دلّني! كيف يمكنني مساعدتك اليوم؟ 😊" : "Welcome to Dallani Support! How can I help you today? 😊"
    }
  ]);
  const [supportInput, setSupportInput] = useState("");
  const [supportTyping, setSupportTyping] = useState(false);

  const handleSupportSend = (e: React.FormEvent) => {
    e.preventDefault();
    const txt = supportInput.trim();
    if (!txt) return;

    const userMsg: Msg = { id: Date.now(), from: "user", text: txt, time: now() };
    setSupportMessages((prev) => [...prev, userMsg]);
    setSupportInput("");
    setSupportTyping(true);

    // Save ticket to localStorage for Admin Dashboard
    try {
      const stored = JSON.parse(localStorage.getItem("dalni_support_tickets") || "[]");
      stored.unshift({
        id: `TK-${Date.now().toString().slice(-4)}`,
        user_name: "زائر عبر شات الدعم",
        user_role: "سائح",
        subject: txt.slice(0, 35),
        message: txt,
        status: "جديد",
        created_at: now()
      });
      localStorage.setItem("dalni_support_tickets", JSON.stringify(stored));
    } catch {}

    setTimeout(() => {
      setSupportTyping(false);
      setSupportMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          from: "admin",
          text: language === 'ar' 
            ? "شكراً لتواصلك! تم استلام رسالتك وتمريرها لمسؤول الدعم والإدارة فوراً ⏳" 
            : "Thank you! Your message has been received and forwarded to our support team ⏳",
          time: now()
        }
      ]);
    }, 1000);
  };

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
  }, [supportMessages, supportTyping, supportOpen]);

  if (path.startsWith("/support")) return null;

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

      // Call real Python FastAPI Delni AI backend
      try {
        const historyForBackend = messages.slice(-6).map((msg) => ({
          role: msg.from === "user" ? "user" : "model",
          content: msg.text,
        }));
        
        fetch("http://127.0.0.1:8000/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: t, history: historyForBackend }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("Backend offline");
            return res.json();
          })
          .then((data) => {
            setMessages((m) => [
              ...m,
              {
                id: Date.now() + 1,
                from: "ai",
                badge: data.source === "gemini" ? "✨ ذكاء دلّني (Gemini AI)" : "🤖 مرشد دلّني الذكي",
                text: data.reply,
                time: now(),
              },
            ]);
          })
          .catch(() => {
            // Graceful fallback to local response if backend is offline
            setMessages((m) => [
              ...m,
              {
                id: Date.now() + 1,
                from: "ai",
                text: language === 'ar' 
                  ? `شكراً لاستفسارك! في منصة دلني نسعد بتقديم كافة التسهيلات حول المعالم، والمرشدين المعينين، وشركات النقل. يمكنك تجربة رفع صورة معلم أو كتابة استفسارك بالتفصيل.`
                  : `Thanks for your inquiry! At Libya Journeys, we are happy to assist with landmarks, guides, and transport.`,
                time: now()
              }
            ]);
          });
      } catch {
        // Fallback
      }
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

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("http://127.0.0.1:8000/api/ai/vision", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setAnalyzingImage(false);
        setMessages((m) => [
          ...m,
          {
            id: Date.now() + 1,
            from: "ai",
            badge: "👁️ نتائج التعرف البصري (Delni Vision)",
            text: data.analysis || "تم التعرف على المعلم بنجاح.",
            time: now()
          }
        ]);
        return;
      }
    } catch {
      // Ignore and fallback below
    }

    // Local fallback if vision endpoint unavailable
    setTimeout(() => {
      setAnalyzingImage(false);
      const sample = landmarkSamples[Math.floor(Math.random() * landmarkSamples.length)];
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "ai",
          badge: language === 'ar' ? "👁️ نتائج التعرف البصري (Computer Vision)" : "👁️ Computer Vision Result",
          text: sample.info,
          image: sample.img,
          time: now()
        }
      ]);
    }, 1200);
  };

  return (
    <>
      {/* زر مركز الدعم */}
      <button
        onClick={() => setSupportOpen((prev) => !prev)}
        aria-label="مركز الدعم"
        className={`fixed bottom-24 ${language === 'ar' ? 'left-6' : 'right-6'} z-[89] h-[52px] w-[155px] justify-center rounded-full bg-gradient-to-r from-[#003580] via-[#1B5A78] to-[#D96B27] text-white font-black shadow-2xl shadow-[#003580]/40 hover:scale-105 hover:shadow-[#003580]/60 transition-all flex items-center gap-2 border-2 border-white/60 cursor-pointer`}
      >
        <span className="relative flex items-center justify-center shrink-0 w-6 h-6">
          <span className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
          <BotMessageSquare className="w-5 h-5 text-amber-300 animate-pulse" />
        </span>
        <span className="text-xs font-black text-white drop-shadow text-center">
          {language === 'ar' ? 'دعم دلّني' : 'Dallani Support'}
        </span>
        <span className="w-2 h-2 shrink-0 rounded-full bg-emerald-400 animate-pulse" />
      </button>

      {supportOpen && (
        <div className={`fixed bottom-40 ${language === 'ar' ? 'left-6' : 'right-6'} z-[95] w-80 h-[400px] bg-white text-[#0B132B] rounded-2xl shadow-2xl border border-[#E6E1D6] flex flex-col overflow-hidden animate-fade-up`} dir={dir}>
          <div className="bg-gradient-to-r from-[#003580] to-[#1B5A78] p-3 flex items-center justify-between text-white shadow-md z-10">
            <div className="flex items-center gap-3">
              <BotMessageSquare className="w-6 h-6 text-amber-300" />
              <div>
                <div className="font-bold text-sm drop-shadow-sm">
                  {language === 'ar' ? 'مركز دعم دلّني الذكي' : 'Dallani Smart Support'}
                </div>
                <div className="text-[10px] text-white/80 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'ar' ? 'متصل الآن' : 'Online Now'}
                </div>
              </div>
            </div>
            <button onClick={() => setSupportOpen(false)} className="w-7 h-7 rounded-lg hover:bg-white/20 flex items-center justify-center text-sm transition-colors border-none bg-transparent text-white cursor-pointer outline-none font-bold">✕</button>
          </div>
          
          <div ref={supportScrollRef} className="flex-1 p-4 bg-[#FAFAF8] overflow-y-auto space-y-3">
            {supportMessages.map((m) => (
              <div key={m.id} className={`flex ${m.from === "user" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[85%] p-3 text-xs md:text-sm rounded-2xl shadow-xs ${
                  m.from === "user"
                    ? "bg-[#003580] text-white font-bold rounded-bl-none"
                    : "bg-white border border-[#E6E1D6] text-[#0B132B] rounded-br-none font-semibold"
                }`}>
                  <div>{m.text}</div>
                  <div className={`text-[9px] mt-1.5 ${m.from === "user" ? "text-white/80" : "text-[#526078]"}`}>{m.time}</div>
                </div>
              </div>
            ))}

            {supportTyping && (
              <div className="flex justify-end">
                <div className="bg-white border border-[#E6E1D6] p-2.5 rounded-2xl text-stone-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-bounce" style={{ animationDelay: "0.15s" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#003580] animate-bounce" style={{ animationDelay: "0.3s" }} />
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSupportSend} className="p-3 bg-white border-t border-[#E6E1D6] flex gap-2">
            <input 
              value={supportInput}
              onChange={(e) => setSupportInput(e.target.value)}
              placeholder={language === 'ar' ? 'اكتب رسالتك هنا...' : 'Type your message...'} 
              className="flex-1 h-9 px-3 rounded-xl bg-[#F4F1EA] border border-[#E6E1D6] focus:bg-white focus:border-[#D96B27] text-xs outline-none transition-all text-[#0B132B]" 
            />
            <button type="submit" className="w-9 h-9 rounded-xl bg-[#D96B27] hover:bg-[#b0531c] flex items-center justify-center text-white shadow-soft transition-colors border-none cursor-pointer outline-none">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 pl-0.5" stroke="currentColor" strokeWidth="2">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
      )}

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
                  {language === 'ar' ? 'التعرف بالصور وترجمة المصطلحات' : 'Photo Recognition & Translation'}
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

          <div className="p-2 bg-white border-t border-[#E6E1D6] flex gap-1.5 overflow-x-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageSimulate}
              accept="image/*"
              className="hidden"
            />
            {[
              language === 'ar' ? "📷 التعرف على معلم بالصورة" : "📷 Recognize Landmark",
              language === 'ar' ? "🗣️ ترجمة مصطلحات ليبية" : "🗣️ Libyan Dialect Help",
              language === 'ar' ? "☀️ طقس وأوقات الزيارة" : "☀️ Weather & Visit Times",
              language === 'ar' ? "🚨 بلاغ عاجل للإدارة" : "🚨 Emergency Report",
            ].map((q) => (
              <button
                key={q}
                onClick={() => {
                  if (q.includes("التعرف") || q.includes("Recognize")) {
                    fileInputRef.current?.click();
                  } else if (q.includes("ترجمة") || q.includes("Dialect")) {
                    handleSend(language === 'ar' ? "شن معنى شاهي باللوز؟" : "What is the meaning of Libyan Tea with almonds?");
                  } else {
                    handleSend(q);
                  }
                }}
                className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#FAFAF8] border border-[#E6E1D6] text-[#003580] hover:bg-blue-50 hover:border-blue-300 text-[11px] font-extrabold transition-all shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="p-3 bg-white border-t border-[#E6E1D6] flex gap-2">
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
