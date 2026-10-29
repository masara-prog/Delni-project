import { useEffect, useState } from "react";

/**
 * Replaces the browser's alert() with an in-platform message box, so messages no longer show
 * the browser header with the server address (e.g. "192.168.1.180:8081 says").
 * Messages are queued and shown one at a time.
 */
export function PlatformAlert() {
  const [queue, setQueue] = useState<string[]>([]);

  useEffect(() => {
    const original = window.alert;
    window.alert = (message?: unknown) => {
      setQueue((q) => [...q, message === undefined ? "" : String(message)]);
    };
    return () => {
      window.alert = original;
    };
  }, []);

  const current = queue[0];
  useEffect(() => {
    if (current === undefined) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === "Escape") setQueue((q) => q.slice(1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current]);

  if (current === undefined) return null;

  const isError = /^\s*(❌|⚠️)/.test(current);
  const isSuccess = /^\s*(✅|🎉)/.test(current) || /✓\s*$/.test(current);
  const text = current.replace(/^\s*(❌|⚠️|✅|🎉)\s*/, "");

  return (
    <div className="fixed inset-0 z-[200] bg-black/45 backdrop-blur-sm grid place-items-center p-4" dir="rtl" onClick={() => setQueue((q) => q.slice(1))}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-right animate-in fade-in zoom-in-95">
        <div className={`px-5 py-3 text-white font-black text-sm flex items-center gap-2 ${isError ? "bg-red-600" : isSuccess ? "bg-emerald-600" : "bg-[#003580]"}`}>
          <span>{isError ? "⚠️" : isSuccess ? "✅" : "ℹ️"}</span>
          <span>منصة دَلِّني</span>
        </div>
        <div className="p-5 text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">{text}</div>
        <div className="px-5 pb-4 flex justify-end">
          <button
            type="button"
            autoFocus
            onClick={() => setQueue((q) => q.slice(1))}
            className="px-6 h-10 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition cursor-pointer"
          >
            حسناً
          </button>
        </div>
      </div>
    </div>
  );
}
