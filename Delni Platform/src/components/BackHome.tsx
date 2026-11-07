import { useRouter } from "@tanstack/react-router";

export function BackHome({ className = "" }: { className?: string }) {
  const router = useRouter();
  
  return (
    <button
      type="button"
      onClick={() => router.history.back()}
      title="الرجوع للخلف"
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-border text-slate-700 hover:border-primary hover:text-primary shadow-sm hover:shadow-md transition ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </button>
  );
}
