import { useEffect, useRef, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { ArrowUp, ImagePlus, Sparkles, X } from "lucide-react";
import { laravelRequest } from "@/lib/api";
import { fileToCompressedDataUrl } from "@/lib/imageCompress";
import { useLanguage } from "@/lib/i18n";

// Answers use light Markdown: **bold** words, "### " headings and "- " bullets (rendered as React text, never as HTML)
function richText(text: string) {
  return text.split("\n").map((line, i) => {
    const heading = /^#{1,4}\s+/.test(line);
    const bullet = /^\s*[-*]\s+/.test(line);
    const body = line.replace(/^#{1,4}\s+/, "").replace(/^\s*[-*]\s+/, "");
    const parts = body.split(/(\*\*[^*]+\*\*)/g).map((part, k) =>
      part.startsWith("**") && part.endsWith("**") ? <strong key={k} className="font-bold">{part.slice(2, -2)}</strong> : part,
    );
    return (
      <span key={i} className={`block ${heading ? "font-bold mt-1.5" : ""}`}>
        {bullet ? "• " : ""}
        {parts}
        {line === "" ? " " : null}
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
  sources?: { title: string; url: string }[];
};

const now = () => new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });

export function FloatingChat() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { language, dir } = useLanguage();
  const [open, setOpen] = useState(false);

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const ar = language === "ar";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open, pendingImage]);

  // The assistant shows on the public pages only: not on sign-in/sign-up nor in the dashboards (they have their own support window)
  if (path.startsWith("/support") || path.startsWith("/auth") || path.startsWith("/dashboard")) {
    return null;
  }
  if (/^\/(login|signup)\b/.test(path)) return null;

  // The last turns sent with each question, so follow-up questions are understood
  const historyFor = (list: Msg[]) =>
    list
      .filter((m) => (m.from === "user" || m.from === "ai") && m.text)
      .slice(-8)
      .map((m) => ({ role: m.from === "user" ? "user" : "model", text: m.text.slice(0, 4000) }));

  const ask = async (text: string, image?: string) => {
    const history = historyFor(messages);
    setTyping(true);
    const res = await laravelRequest<any>("POST", "/ai/chat", { message: text, image, history }, 90000);
    setTyping(false);
    const body: any = res.ok ? res.body : null;
    if (!res.ok) console.warn("Delni assistant:", res.error);
    setMessages((m) => [
      ...m,
      res.ok && body?.reply
        ? { id: Date.now() + 1, from: "ai", text: body.reply, sources: Array.isArray(body?.sources) ? body.sources : [], time: now() }
        : {
            id: Date.now() + 1,
            from: "admin",
            text: ar ? "تعذّر الحصول على إجابة الآن، يرجى المحاولة بعد لحظات." : "We couldn't get an answer right now, please try again in a moment.",
            time: now(),
          },
    ]);
  };

  // Sends the typed text, the attached photo, or both together; a photo alone is sent with no text bubble
  const send = (text: string) => {
    const t = text.trim();
    const img = pendingImage;
    if ((!t && !img) || typing) return;
    setMessages((m) => [...m, { id: Date.now(), from: "user", text: t, image: img ?? undefined, time: now() }]);
    setInput("");
    setPendingImage(null);
    void ask(t, img ?? undefined);
  };

  // A chosen photo is shrunk in the browser (at most 1280 px) and waits above the text box until it is sent
  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || typing) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
      setMessages((m) => [
        ...m,
        { id: Date.now(), from: "admin", text: ar ? "يرجى اختيار صورة بصيغة JPG أو PNG أو WEBP." : "Please choose a JPG, PNG or WEBP photo.", time: now() },
      ]);
      return;
    }
    setPendingImage(await fileToCompressedDataUrl(file, { maxSide: 1280, quality: 0.82 }));
    textRef.current?.focus();
  };

  const suggestions = ar
    ? ["ما أجمل المعالم في ليبيا؟", "ماذا أرتدي عند زيارة غدامس؟", "أشهر الأكلات الليبية", "ما الرحلات المتاحة الآن؟"]
    : ["Must-see places in Libya?", "What should I wear in Ghadames?", "Famous Libyan dishes", "Which trips are open now?"];
  const side = ar ? "left-6" : "right-6";

  return (
    <>
      {/* Launcher: a round orange button with the sparkle (the assistant) */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={ar ? "ذكاء دلّني" : "Delni AI"}
        title={ar ? "ذكاء دلّني" : "Delni AI"}
        aria-expanded={open}
        className={`fixed bottom-6 ${side} z-[90] hidden md:grid place-items-center w-[60px] h-[60px] rounded-full text-white bg-gradient-to-l from-[#EE8A45] to-[#D2621F] shadow-[0_12px_30px_-10px_rgba(210,98,31,0.8)] ring-1 ring-white/25 transition-[transform,box-shadow] duration-200 ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-10px_rgba(210,98,31,0.9)] active:translate-y-0 active:scale-[0.95]`}
      >
        {open ? <X className="w-6 h-6" strokeWidth={2.5} /> : <Sparkles className="w-7 h-7" strokeWidth={2} />}
      </button>

      {open && (
        <div
          dir={dir}
          style={{ transformOrigin: ar ? "bottom left" : "bottom right", animation: "delni-chat-in 220ms var(--ease-out) both" }}
          className={`fixed bottom-[88px] ${side} z-[95] w-[94vw] max-w-[400px] h-[76vh] max-h-[640px] flex flex-col overflow-hidden rounded-[28px] bg-white text-[#0B1B2B] ring-1 ring-black/[0.06] shadow-[0_30px_70px_-25px_rgba(11,27,43,0.45)]`}
        >
          <style>{`@keyframes delni-chat-in{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}`}</style>

          {/* Header */}
          <div className="px-5 pt-5 pb-4 bg-gradient-to-br from-[#0B4F57] to-[#00736F] text-white">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="grid place-items-center w-11 h-11 rounded-full bg-gradient-to-l from-[#EE8A45] to-[#D2621F] ring-2 ring-white/30 shadow-[0_4px_12px_-4px_rgba(210,98,31,0.8)]">
                  <Sparkles className="w-[22px] h-[22px] text-white" strokeWidth={2} />
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-[#0B4F57]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-extrabold text-[15px] leading-tight">{ar ? "دلني" : "Delni"}</div>
                <div className="text-[12px] text-white/75 mt-0.5">{ar ? "مرشدك لاكتشاف ليبيا · متاح الآن" : "Your guide to Libya · Online"}</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label={ar ? "إغلاق" : "Close"}
                className="grid place-items-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Conversation */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-3 bg-[#F7F6F2]">
            {messages.length === 0 && (
              <div className="pt-1">
                <div className="bg-white rounded-2xl rounded-ss-md px-4 py-3.5 ring-1 ring-black/[0.05] text-[13.5px] leading-relaxed max-w-[90%]">
                  <div className="font-bold mb-1">{ar ? "أهلاً بك 👋" : "Welcome 👋"}</div>
                  {ar
                    ? "اسألني عن أي شيء في ليبيا: المعالم والطقس والزي والأكلات والرحلات، أو أرسل صورة وأخبرك بما فيها."
                    : "Ask me anything about Libya: places, weather, dress, food and trips, or send a photo and I'll tell you what's in it."}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suggestions.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="px-3.5 py-2 rounded-full bg-white text-[12.5px] font-semibold text-[#0B4F57] ring-1 ring-[#00736F]/20 hover:ring-[#00736F]/50 hover:bg-teal-50/60 transition-[background-color,box-shadow,transform] active:scale-[0.97]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => {
              const mine = m.from === "user";
              const photoOnly = Boolean(m.image && !m.text);
              return (
                <div key={m.id} className={`flex ${mine ? "justify-start" : "justify-end"}`}>
                  <div
                    className={`max-w-[85%] text-[13.5px] leading-relaxed ${
                      mine
                        ? `bg-[#00736F] text-white rounded-2xl rounded-ss-md ${m.image ? "p-1.5" : "px-4 py-2.5"}`
                        : m.from === "ai"
                        ? "bg-white ring-1 ring-black/[0.05] rounded-2xl rounded-se-md px-4 py-3"
                        : "bg-[#FFF6EE] ring-1 ring-[#D96B27]/20 text-[#7A3B12] rounded-2xl rounded-se-md px-4 py-2.5"
                    }`}
                  >
                    {m.image && <img src={m.image} alt="" className="w-full max-h-56 object-cover rounded-xl" />}
                    {m.text && <div className={`whitespace-pre-line ${m.image ? "px-2.5 pt-2" : ""}`}>{richText(m.text)}</div>}
                    {m.sources && m.sources.length > 0 && (
                      <div className="mt-2.5 pt-2.5 border-t border-black/[0.06] flex flex-wrap gap-1.5">
                        {m.sources.map((x) => (
                          <a
                            key={x.url}
                            href={x.url}
                            target="_blank"
                            rel="noreferrer"
                            className="max-w-full truncate text-[11px] font-semibold text-[#00736F] bg-teal-50 px-2 py-1 rounded-md hover:underline"
                          >
                            {x.title || x.url}
                          </a>
                        ))}
                      </div>
                    )}
                    <div
                      className={`text-[10.5px] mt-1 tabular-nums ${m.image ? (photoOnly ? "px-1.5 pb-0.5" : "px-2.5 pb-1") : ""} ${
                        mine ? "text-white/70" : "text-[#8A93A3]"
                      }`}
                    >
                      {m.time}
                    </div>
                  </div>
                </div>
              );
            })}

            {typing && (
              <div className="flex justify-end">
                <div className="bg-white ring-1 ring-black/[0.05] rounded-2xl rounded-se-md px-4 py-3.5 flex items-center gap-1.5" aria-label={ar ? "جارٍ الكتابة" : "Typing"}>
                  {[0, 0.15, 0.3].map((d) => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#00736F]/70 animate-bounce" style={{ animationDelay: `${d}s` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Composer: an attached photo waits here so a caption can be added to it */}
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="p-3 bg-white border-t border-black/[0.05]">
            {pendingImage && (
              <div className="relative w-20 h-20 mb-2.5 ms-1">
                <img src={pendingImage} alt="" className="w-full h-full object-cover rounded-xl ring-1 ring-black/10" />
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  aria-label={ar ? "إزالة الصورة" : "Remove photo"}
                  className="absolute -top-2 -end-2 grid place-items-center w-6 h-6 rounded-full bg-[#0B1B2B] text-white ring-2 ring-white"
                >
                  <X className="w-3 h-3" strokeWidth={3} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 rounded-full bg-[#F4F3EF] ring-1 ring-black/[0.04] focus-within:ring-[#00736F]/40 focus-within:bg-white transition-[background-color,box-shadow] p-1.5">
              <input type="file" ref={fileInputRef} onChange={pickImage} accept="image/jpeg,image/png,image/webp" className="hidden" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title={ar ? "إرفاق صورة" : "Attach a photo"}
                aria-label={ar ? "إرفاق صورة" : "Attach a photo"}
                className="grid place-items-center w-9 h-9 shrink-0 rounded-full text-[#526078] hover:text-[#00736F] hover:bg-white transition-colors"
              >
                <ImagePlus className="w-[19px] h-[19px]" strokeWidth={2} />
              </button>
              <input
                ref={textRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pendingImage ? (ar ? "أضف تعليقاً على الصورة (اختياري)" : "Add a caption (optional)") : ar ? "اكتب سؤالك…" : "Type your question…"}
                className="flex-1 min-w-0 h-9 bg-transparent outline-none text-[13.5px] placeholder:text-[#8A93A3]"
              />
              <button
                disabled={(!input.trim() && !pendingImage) || typing}
                aria-label={ar ? "إرسال" : "Send"}
                className="grid place-items-center w-9 h-9 shrink-0 rounded-full bg-[#00736F] text-white transition-[background-color,transform,opacity] hover:bg-[#0B4F57] active:scale-[0.94] disabled:opacity-35 disabled:active:scale-100"
              >
                <ArrowUp className="w-[18px] h-[18px]" strokeWidth={2.5} />
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
