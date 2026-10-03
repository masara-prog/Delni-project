import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, useMemo } from "react";
import logoAsset from "@/assets/dalni-logo.png.asset.json";
import { Header } from "@/components/Header";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "الدعم والمحادثة الفورية | دلّني" },
      { name: "description", content: "تواصل مع فريق دعم دلّني، أرسل بلاغاتك واستفساراتك مباشرة." },
    ],
  }),
  component: SupportChatPage,
});

type Msg = {
  id: number;
  from: "user" | "admin";
  text: string;
  time: string;
  attachment?: string;
};

function SupportChatPage() {
  const { language } = useLanguage();
  const quickReplies = useMemo(() => language === 'ar' ? [
    "🚨 إرسال بلاغ",
    "📅 تعديل حجز",
    "💳 مشكلة في الدفع",
    "🗺️ استفسار عن رحلة",
    "🚌 مشكلة مع سائق",
    "⭐ تقديم اقتراح",
  ] : [
    "🚨 Submit Report",
    "📅 Edit Booking",
    "💳 Payment Issue",
    "🗺️ Trip Inquiry",
    "🚌 Driver Issue",
    "⭐ Suggestion",
  ], [language]);

  const [messages, setMessages] = useState<Msg[]>([
    { 
      id: 1, 
      from: "admin", 
      time: "9:12", 
      text: language === 'ar' ? "أهلاً بك في دعم دلّني 👋 كيف يمكننا مساعدتك اليوم؟" : "Welcome to Dallani Support 👋 How can we help you today?" 
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  const send = (text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const time = now.toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
    setMessages((m) => [...m, { id: Date.now(), from: "user", text, time }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [
        ...m,
        {
          id: Date.now() + 1,
          from: "admin",
          text: language === 'ar' ? "شكراً لتواصلك، تم استلام رسالتك وسيتم الرد من قبل مسؤول الدعم خلال دقائق ⏳" : "Thank you for contacting us. Your message has been received and support will reply shortly ⏳",
          time: new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-gradient-sand">
      <Header active="support" />

      <div className="max-w-6xl mx-auto grid lg:grid-cols-[300px_1fr] gap-6 p-4 md:p-6">
        {/* Sidebar - report categories */}
        <aside className="space-y-4">
          <div className="bg-white rounded-2xl border border-border p-4 shadow-soft">
            <div className="text-xs font-black text-muted-foreground tracking-widest mb-3">
              {language === 'ar' ? "أرسل بلاغاً" : "Submit a Report"}
            </div>
            <div className="space-y-2">
              {[
                { i: "🚨", t: language === 'ar' ? "بلاغ عاجل" : "Urgent Report", d: language === 'ar' ? "مشكلة تحتاج تدخل فوري" : "Issue requiring immediate help" },
                { i: "🚌", t: language === 'ar' ? "مشكلة مع السائق" : "Driver Issue", d: language === 'ar' ? "سلوك أو تأخير" : "Behavior or delay" },
                { i: "🗺️", t: language === 'ar' ? "مشكلة مع المرشد" : "Guide Issue", d: language === 'ar' ? "الخبرة والتنظيم" : "Experience and organization" },
                { i: "💳", t: language === 'ar' ? "خلاف مالي" : "Payment Dispute", d: language === 'ar' ? "دفعات أو استرداد" : "Payments or refunds" },
                { i: "🏨", t: language === 'ar' ? "معلومات غير دقيقة" : "Inaccurate Info", d: language === 'ar' ? "فندق أو مطعم" : "Hotel or restaurant" },
              ].map((c) => (
                <button key={c.t} onClick={() => send(`${c.i} ${c.t}`)} className="w-full text-right p-3 rounded-xl hover:bg-muted transition group">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{c.i}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-sm text-foreground">{c.t}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{c.d}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-border p-4 shadow-soft">
            <div className="text-xs font-black text-muted-foreground tracking-widest mb-3">
              {language === 'ar' ? "مواعيد الدعم" : "Support Hours"}
            </div>
            <div className="text-sm text-foreground font-bold">
              {language === 'ar' ? "يومياً · 8:00 ص - 12:00 م" : "Daily · 8:00 AM - 12:00 PM"}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {language === 'ar' ? "متوسط زمن الرد: أقل من 5 دقائق" : "Avg response time: Under 5 mins"}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-700 font-black">
                {language === 'ar' ? "الدعم متصل الآن" : "Support is Online"}
              </span>
            </div>
          </div>
        </aside>

        {/* Chat */}
        <section className="bg-white rounded-2xl border border-border shadow-card overflow-hidden flex flex-col h-[calc(100vh-8rem)]">
          {/* Chat header */}
          <div className="bg-gradient-sea text-white p-4 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur grid place-items-center p-2">
              <img src={logoAsset.url} alt="دلّني" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1">
              <div className="font-black">{language === 'ar' ? "دعم دلّني" : "Dallani Support"}</div>
              <div className="text-xs opacity-80 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" /> 
                {language === 'ar' ? "متصل الآن · يرد عادةً خلال دقائق" : "Online now · Replies in minutes"}
              </div>
            </div>
            <button className="w-9 h-9 rounded-full bg-white/20 grid place-items-center">⋯</button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(0,0,0,0.02))]">
            <div className="text-center">
              <span className="text-[11px] px-3 py-1 rounded-full bg-muted text-muted-foreground">اليوم</span>
            </div>
            {messages.map((m) => (
              <MessageBubble key={m.id} msg={m} />
            ))}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-sea p-1.5 grid place-items-center">
                  <img src={logoAsset.url} alt="" className="w-full h-full object-contain" />
                </div>
                <div className="bg-muted px-4 py-3 rounded-2xl rounded-br-sm">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="border-t border-border p-3 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {quickReplies.map((q) => (
                <button key={q} onClick={() => send(q)} className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-black whitespace-nowrap hover:bg-primary/20">
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-border p-3 flex items-center gap-2 bg-white"
          >
            <button type="button" className="w-11 h-11 rounded-xl hover:bg-muted grid place-items-center text-lg" aria-label="attach">📎</button>
            <button type="button" className="w-11 h-11 rounded-xl hover:bg-muted grid place-items-center text-lg" aria-label="emoji">😊</button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={language === 'ar' ? "اكتب رسالتك للدعم..." : "Type your message to support..."}
              className="flex-1 h-11 px-4 rounded-xl border border-border bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm font-semibold"
            />
            <button className="h-11 px-4 rounded-xl bg-gradient-sea text-white font-black text-sm shadow-glow hover:-translate-y-0.5 transition">
              {language === 'ar' ? "إرسال ↩" : "Send ↩"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isAdmin = msg.from === "admin";
  return (
    <div className={`flex items-end gap-2 ${isAdmin ? "" : "flex-row-reverse"}`}>
      {isAdmin ? (
        <div className="w-8 h-8 rounded-full bg-gradient-sea p-1.5 grid place-items-center flex-shrink-0">
          <img src={logoAsset.url} alt="" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#D96B27] to-[#EA580C] text-white grid place-items-center text-xs font-black flex-shrink-0">أ</div>
      )}
      <div className={`max-w-[75%] px-4 py-2.5 text-sm ${isAdmin ? "bg-muted text-foreground rounded-2xl rounded-br-sm" : "bg-gradient-sea text-white rounded-2xl rounded-bl-sm shadow-soft"}`}>
        <div>{msg.text}</div>
        <div className={`text-[10px] mt-1 ${isAdmin ? "text-muted-foreground" : "text-white/70"}`}>{msg.time}</div>
      </div>
    </div>
  );
}
