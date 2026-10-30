import { useEffect, useState } from "react";

type Dialog = { kind: "alert"; message: string } | { kind: "confirm"; message: string; resolve: (ok: boolean) => void };

let pushDialog: ((d: Dialog) => void) | null = null;

/**
 * Asks a yes/no question in the platform's own dialog (the browser's confirm() shows the server address,
 * e.g. "192.168.1.180:8081 says"). Resolves true when the user confirms.
 */
export function platformConfirm(message: string): Promise<boolean> {
  if (!pushDialog) return Promise.resolve(window.confirm(message));
  return new Promise((resolve) => pushDialog!({ kind: "confirm", message, resolve }));
}

/**
 * Replaces the browser's alert() with an in-platform message box, and shows platformConfirm() questions.
 * Dialogs are queued and shown one at a time.
 */
export function PlatformAlert() {
  const [queue, setQueue] = useState<Dialog[]>([]);

  useEffect(() => {
    const original = window.alert;
    pushDialog = (d) => setQueue((q) => [...q, d]);
    window.alert = (message?: unknown) => pushDialog!({ kind: "alert", message: message === undefined ? "" : String(message) });
    return () => {
      window.alert = original;
      pushDialog = null;
    };
  }, []);

  const current = queue[0];
  const close = (ok: boolean) => {
    if (current?.kind === "confirm") current.resolve(ok);
    setQueue((q) => q.slice(1));
  };

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter") close(true);
      if (e.key === "Escape") close(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!current) return null;

  const isConfirm = current.kind === "confirm";
  const isError = !isConfirm && /^\s*(❌|⚠️)/.test(current.message);
  const isSuccess = !isConfirm && (/^\s*(✅|🎉)/.test(current.message) || /✓\s*$/.test(current.message));
  const text = current.message.replace(/^\s*(❌|⚠️|✅|🎉)\s*/, "");

  return (
    <div className="fixed inset-0 z-[200] bg-black/45 backdrop-blur-sm grid place-items-center p-4" dir="rtl" onClick={() => close(false)}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden text-right animate-in fade-in zoom-in-95">
        <div className={`px-5 py-3 text-white font-black text-sm flex items-center gap-2 ${isError ? "bg-red-600" : isSuccess ? "bg-emerald-600" : "bg-[#003580]"}`}>
          <span>{isConfirm ? "❓" : isError ? "⚠️" : isSuccess ? "✅" : "ℹ️"}</span>
          <span>منصة دَلِّني</span>
        </div>
        <div className="p-5 text-sm font-semibold text-slate-800 leading-relaxed whitespace-pre-line">{text}</div>
        <div className="px-5 pb-4 flex justify-end gap-2">
          {isConfirm && (
            <button
              type="button"
              onClick={() => close(false)}
              className="px-5 h-10 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-black text-xs transition cursor-pointer"
            >
              إلغاء
            </button>
          )}
          <button
            type="button"
            autoFocus
            onClick={() => close(true)}
            className="px-6 h-10 rounded-xl bg-[#003580] hover:bg-[#00224f] text-white font-black text-xs transition cursor-pointer"
          >
            {isConfirm ? "نعم، متأكد" : "حسناً"}
          </button>
        </div>
      </div>
    </div>
  );
}
