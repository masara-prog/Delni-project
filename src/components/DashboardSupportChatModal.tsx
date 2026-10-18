import { useState, useEffect, useRef } from "react";
import { getOrCreateUserSession, sendUserMessage, type ChatSession } from "@/lib/supportChat";
import { useLanguage } from "@/lib/i18n";

export function DashboardSupportChatModal({
  open,
  onClose,
  userName,
  userRole,
  role,
}: {
  open: boolean;
  onClose: () => void;
  userName: string;
  userRole: string;
  role: string;
}) {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const [session, setSession] = useState<ChatSession | null>(null);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const sessionId = `session-${role}-${userName.replace(/\s+/g, "_")}`;

  // Load and subscribe to chat updates
  useEffect(() => {
    if (!open) return;

    const currentSession = getOrCreateUserSession(sessionId, userName, userRole);
    setSession(currentSession);

    const handleSync = (e: any) => {
      const all: ChatSession[] = e?.detail || [];
      const updated = all.find((s) => s.id === sessionId || s.user_name === userName);
      if (updated) {
        setSession(updated);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "dalni_chat_sessions" && e.newValue) {
        try {
          const all: ChatSession[] = JSON.parse(e.newValue);
          const updated = all.find((s) => s.id === sessionId || s.user_name === userName);
          if (updated) setSession(updated);
        } catch {}
      }
    };

    window.addEventListener("dalni_chat_sync", handleSync);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("dalni_chat_sync", handleSync);
      window.removeEventListener("storage", handleStorage);
    };
  }, [open, sessionId, userName, userRole]);

  // Auto scroll to bottom
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      }, 100);
    }
  }, [session?.messages, open]);

  if (!open) return null;

  const handleSend = (text: string) => {
    const t = text.trim();
    if (!t) return;
    const updated = sendUserMessage(sessionId, userName, userRole, t);
    setSession({ ...updated });
    setInput("");
  };

  const quickPrompts = [
    "🚨 مشكلة عاجلة بحاجة لمساعدة الإدارة",
    "💳 استفسار بخصوص الدفع أو المستحقات",
    "📅 تعديل موعد رحلة أو بيانات حسابي",
    "⭐ اقتراح لتحسين خدمات المنصة",
  ];

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      dir={dir}
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full flex flex-col h-[600px] max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003580] via-[#1E293B] to-[#003580] text-white p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-sun text-gold-foreground grid place-items-center text-lg font-black shadow-soft">
              💬
            </div>
            <div>
              <div className="font-black text-sm flex items-center gap-1.5">
                <span>{isAr ? "محادثة الدعم المباشر مع إدارة دلّني" : "Direct Admin Support Chat"}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-white/80 font-medium">
                {isAr
                  ? `أنت تتحدث بصفتك: ${userName} (${userRole})`
                  : `Chatting as: ${userName} (${userRole})`}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white grid place-items-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Live Admin Online Notice */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{isAr ? "مشرفو المنصة متاحون للرد المباشر" : "Admin team is online to assist"}</span>
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold">{isAr ? "متوسط الرد: دقيقة" : "Avg response: 1 min"}</span>
        </div>

        {/* Messages Body */}
        <div ref={scrollRef} className="flex-1 p-4 bg-[#FAFAF8] overflow-y-auto space-y-3">
          {session?.messages.map((m) => {
            const isMe = m.from === "user";
            return (
              <div key={m.id} className={`flex ${isMe ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] p-3.5 text-xs sm:text-sm rounded-2xl shadow-xs ${
                    isMe
                      ? "bg-[#003580] text-white font-semibold rounded-bl-xs"
                      : m.from === "admin"
                      ? "bg-emerald-700 text-white rounded-br-xs font-semibold shadow-emerald-700/20"
                      : "bg-white border border-slate-200 text-slate-800 rounded-br-xs font-medium"
                  }`}
                >
                  {!isMe && (
                    <div className="text-[10px] font-black text-amber-300 mb-1 flex items-center gap-1">
                      <span>👤</span>
                      <span>{isAr ? "مشرف إدارة دلّني" : "Dalni Admin Support"}</span>
                    </div>
                  )}
                  <div className="whitespace-pre-line leading-relaxed">{m.text}</div>
                  <div
                    className={`text-[9px] mt-1.5 font-mono ${
                      isMe ? "text-white/75" : "text-white/80"
                    }`}
                  >
                    {m.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-[#003580] hover:text-[#003580] text-[11px] font-bold shrink-0 transition cursor-pointer shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAr ? "اكتب رسالتك للإدارة هنا..." : "Type your message to Admin here..."}
            className="flex-1 h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 focus:bg-white focus:border-[#003580] outline-none transition"
          />
          <button
            type="submit"
            className="h-11 px-5 rounded-xl bg-gradient-sea text-white font-black text-xs shadow-glow hover:opacity-95 transition flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>{isAr ? "إرسال" : "Send"}</span>
            <span>📤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
