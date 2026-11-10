import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BotMessageSquare } from "lucide-react";
import { laravelRequest } from "@/lib/api";
import { fileToCompressedDataUrl } from "@/lib/imageCompress";

// The assistant writes light Markdown: **bold** words, "### " headings and "- " bullets (rendered as React text, never as HTML)
function richText(text: string) {
  return text.split("\n").map((line, i) => {
    const heading = /^#{1,4}\s+/.test(line);
    const bullet = /^\s*[-*]\s+/.test(line);
    const body = line.replace(/^#{1,4}\s+/, "").replace(/^\s*[-*]\s+/, "");
    const parts = body.split(/(\*\*[^*]+\*\*)/g).map((part, k) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={k} className="font-black">{part.slice(2, -2)}</strong> : part,
    );
    return (
      <span key={i} className={`block ${heading ? "font-black mt-1.5" : ""}`}>
        {bullet ? "• " : ""}
        {parts}
        {line === "" ? " " : null}
      </span>
    );
  });
}

type Msg = { 
  id: number; 
  from: "user" | "admin" | "ai"; 
  text: string; 
  time: string;
  image?: string;
  badge?: string;
};




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
        ? "مرحباً بك في «ذكاء دلني» 👋\nاسألني عن أي شيء في ليبيا: المعالم، الطقس، الزي والأكلات، الرحلات… أو ارفع صورة وسأتعرف عليها."
        : "Welcome to Delni AI 👋\nAsk me anything about Libya: landmarks, weather, dress and food, trips… or upload a photo and I will tell you what it is."
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

  // The last turns sent with each question, so follow-up questions are understood
  const historyFor = (list: Msg[]) =>
    list
      .filter((m) => (m.from === "user" || m.from === "ai") && m.id !== 1 && m.text)
      .slice(-8)
      .map((m) => ({ role: m.from === "user" ? "user" : "model", text: m.text.slice(0, 4000) }));

  const ask = async (text: string, image?: string) => {
    const history = historyFor(messages);
    setTyping(!image);
    setAnalyzingImage(Boolean(image));
    const res = await laravelRequest<any>("POST", "/ai/chat", { message: text, image, history });
    setTyping(false);
    setAnalyzingImage(false);
    const body: any = res.ok ? res.body : null;
    const sources: { title: string; url: string }[] = Array.isArray(body?.sources) ? body.sources : [];
    setMessages((m) => [
      ...m,
      res.ok && body?.reply
        ? {
            id: Date.now() + 1,
            from: "ai",
            badge: language === "ar" ? "✨ ذكاء دلني" : "✨ Delni AI",
            text: body.reply + (sources.length ? "\n\n" + (language === "ar" ? "المصادر: " : "Sources: ") + sources.map((x) => x.title || x.url).join(" · ") : ""),
            time: now(),
          }
        : {
            id: Date.now() + 1,
            from: "admin",
            text: res.ok ? (language === "ar" ? "لم يصل رد، حاول مرة أخرى." : "No answer came back, please try again.") : res.error,
            time: now(),
          },
    ]);
  };

  const handleSend = (text: string) => {
    const t = text.trim();
    if (!t || typing || analyzingImage) return;
    setMessages((m) => [...m, { id: Date.now(), from: "user", text: t, time: now() }]);
    setInput("");
    void ask(t);
  };

  // A photo is shrunk in the browser (at most 1280 px) and sent with the typed text, if any
  const handleImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || typing || analyzingImage) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setMessages((m) => [...m, { id: Date.now(), from: "admin", text: language === "ar" ? "يرجى اختيار صورة JPG أو PNG أو WEBP." : "Please choose a JPG, PNG or WEBP photo.", time: now() }]);
      return;
    }
    const dataUrl = await fileToCompressedDataUrl(file, { maxSide: 1280, quality: 0.82 });
    const caption = input.trim();
    setInput("");
    setMessages((m) => [
      ...m,
      { id: Date.now(), from: "user", text: caption || (language === "ar" ? "📷 ما الذي في هذه الصورة؟" : "📷 What is in this photo?"), image: dataUrl, time: now() },
    ]);
    void ask(caption, dataUrl);
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

                  <div className="whitespace-pre-line leading-relaxed font-medium">{richText(m.text)}</div>
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
              onChange={handleImage}
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
