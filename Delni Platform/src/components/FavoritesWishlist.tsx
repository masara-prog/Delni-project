import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Heart, MapPin, Search, Star, Users, Calendar, ArrowLeft, Undo2 } from "lucide-react";
import { getStoredSession } from "@/lib/api";
import { fetchTouristFavorites, useFavorites, type FavoriteRecord, type FavoriteType } from "@/lib/favorites";

/** A saved item as the server returns it: the favourite plus its name, place and first picture. */
type Item = FavoriteRecord & { title?: string | null; subtitle?: string | null; image?: string | null; extra?: string | number | null };

const KINDS: Record<FavoriteType, { label: string; icon: string; tone: string; fallback: string }> = {
  daily_trip: { label: "رحلة يومية", icon: "🧭", tone: "bg-teal-600", fallback: "/assets/dest-leptis-arch.jpg" },
  weekly_trip: { label: "رحلة أسبوعية", icon: "🗓️", tone: "bg-cyan-700", fallback: "/assets/dest-jabal-akhdar.jpg" },
  landmark: { label: "معلم سياحي", icon: "🏛️", tone: "bg-amber-600", fallback: "/assets/dest-ghadames.jpg" },
  hotel: { label: "فندق وإقامة", icon: "🏨", tone: "bg-indigo-600", fallback: "/assets/ai_hotel.jpg" },
  restaurant: { label: "مطعم ومقهى", icon: "🍽️", tone: "bg-rose-600", fallback: "/assets/category-libyan-real.jpg" },
  vehicle: { label: "مركبة نقل", icon: "🚍", tone: "bg-emerald-700", fallback: "/assets/dest-tripoli-harbor.jpg" },
};

const FILTERS: { id: "all" | "trips" | FavoriteType; label: string; icon: string }[] = [
  { id: "all", label: "الكل", icon: "❤️" },
  { id: "trips", label: "الرحلات", icon: "🧭" },
  { id: "landmark", label: "المعالم", icon: "🏛️" },
  { id: "hotel", label: "الفنادق", icon: "🏨" },
  { id: "restaurant", label: "المطاعم", icon: "🍽️" },
  { id: "vehicle", label: "المركبات", icon: "🚍" },
];

/** Where «عرض في الدليل» takes the tourist: the guide page with this exact item opened. */
function guideLink(it: Item): { to: string; search: Record<string, string> } {
  const id = String(it.item_id);
  switch (it.item_type) {
    case "daily_trip":
    case "weekly_trip":
      return { to: "/trips", search: { tripId: id } };
    case "hotel":
      return { to: "/hotels", search: { open: id } };
    case "restaurant":
      return { to: "/restaurants", search: { open: id } };
    case "vehicle":
      return { to: "/transport", search: { open: id } };
    default:
      return { to: "/attractions", search: { open: id } };
  }
}

function extraLine(it: Item) {
  const x = it.extra;
  if (x === null || x === undefined || x === "") return null;
  switch (it.item_type) {
    case "daily_trip":
      return { icon: <span className="font-black">د.ل</span>, text: `${Number(x)} للمقعد` };
    case "weekly_trip":
      return { icon: <Calendar className="w-3.5 h-3.5" />, text: `تبدأ ${String(x).slice(0, 10)}` };
    case "hotel":
      return { icon: <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />, text: `${Number(x)} نجوم` };
    case "vehicle":
      return { icon: <Users className="w-3.5 h-3.5" />, text: `${Number(x)} مقعداً` };
    default:
      return { icon: <span>•</span>, text: String(x) };
  }
}

export function FavoritesWishlist() {
  const { favorites, toggle } = useFavorites();
  const [items, setItems] = useState<Item[] | null>(null);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [leaving, setLeaving] = useState<Set<string>>(new Set());
  const [undo, setUndo] = useState<Item | null>(null);
  const undoTimer = useRef<number | null>(null);

  // The saved items with their details; reloaded when a heart anywhere on the platform changes the list
  const key = useMemo(() => Array.from(favorites).sort().join("|"), [favorites]);
  useEffect(() => {
    const tid = getStoredSession().user?.tourist_id || "";
    let alive = true;
    fetchTouristFavorites(tid).then((rows) => alive && setItems(rows as Item[]));
    return () => {
      alive = false;
    };
  }, [key]);

  const keyOf = (it: Item) => `${it.item_type}:${it.item_id}`;
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter((it) => {
      const okType = filter === "all" || (filter === "trips" ? it.item_type.endsWith("_trip") : it.item_type === filter);
      const text = `${it.title ?? ""} ${it.subtitle ?? ""} ${KINDS[it.item_type]?.label ?? ""}`.toLowerCase();
      return okType && (!q || text.includes(q));
    });
  }, [items, filter, query]);

  const count = (id: (typeof FILTERS)[number]["id"]) =>
    (items ?? []).filter((it) => id === "all" || (id === "trips" ? it.item_type.endsWith("_trip") : it.item_type === id)).length;

  // Removing: the card shrinks away first, then the item leaves the list; «تراجع» puts it back for a few seconds
  const remove = (it: Item) => {
    const k = keyOf(it);
    setLeaving((s) => new Set(s).add(k));
    window.setTimeout(async () => {
      await toggle(it.item_type, String(it.item_id), it.title ?? undefined);
      setItems((list) => (list ?? []).filter((x) => keyOf(x) !== k));
      setLeaving((s) => {
        const n = new Set(s);
        n.delete(k);
        return n;
      });
      setUndo(it);
      if (undoTimer.current) window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setUndo(null), 5000);
    }, 280);
  };
  const restore = async () => {
    if (!undo) return;
    const it = undo;
    setUndo(null);
    await toggle(it.item_type, String(it.item_id), it.title ?? undefined);
  };

  if (items === null) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-border overflow-hidden bg-white">
            <div className="h-40 bg-stone-100 animate-pulse" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-2/3 rounded bg-stone-100 animate-pulse" />
              <div className="h-3 w-1/3 rounded bg-stone-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="relative overflow-hidden text-center py-14 px-4 rounded-2xl border border-dashed border-rose-200 bg-gradient-to-b from-rose-50/70 to-white">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <span className="absolute inset-0 rounded-full bg-rose-200/60 animate-ping" />
          <span className="relative w-20 h-20 rounded-full bg-white shadow-md grid place-items-center">
            <Heart className="w-9 h-9 text-rose-500" />
          </span>
        </div>
        <h3 className="text-base font-black text-foreground">لم تحفظ شيئاً بعد</h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
          اضغط على القلب في أي رحلة أو معلم أو فندق أو مطعم أو مركبة، فيُحفظ هنا لترجع إليه متى شئت.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {[
            ["/trips", "🧭 الرحلات"],
            ["/attractions", "🏛️ المعالم"],
            ["/hotels", "🏨 الفنادق"],
            ["/restaurants", "🍽️ المطاعم"],
            ["/transport", "🚍 النقل"],
          ].map(([to, label]) => (
            <Link
              key={to}
              to={to}
              className="px-4 h-9 inline-flex items-center rounded-full bg-white border border-stone-200 text-stone-700 font-bold text-xs hover:border-[#0B4F57] hover:text-[#0B4F57] hover:-translate-y-0.5 transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters and search */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const n = count(f.id);
            if (f.id !== "all" && n === 0) return null;
            const on = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`h-9 px-3.5 rounded-full text-xs font-bold inline-flex items-center gap-1.5 border transition-all duration-200 cursor-pointer ${
                  on
                    ? "bg-[#0B4F57] text-white border-[#0B4F57] shadow-md scale-[1.03]"
                    : "bg-white text-stone-700 border-stone-200 hover:border-[#0B4F57]/40 hover:bg-[#0B4F57]/5"
                }`}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
                <span className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] grid place-items-center ${on ? "bg-white/20" : "bg-stone-100 text-stone-600"}`}>{n}</span>
              </button>
            );
          })}
        </div>
        <label className="relative w-full lg:w-72">
          <Search className="w-4 h-4 absolute top-1/2 -translate-y-1/2 right-3 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في مفضلتك…"
            className="w-full h-10 rounded-full border border-stone-200 bg-white pr-9 pl-4 text-sm focus:outline-none focus:border-[#0B4F57] focus:ring-2 focus:ring-[#0B4F57]/15 transition"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">لا توجد عناصر تطابق البحث.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map((it, i) => {
            const kind = KINDS[it.item_type] ?? KINDS.landmark;
            const k = keyOf(it);
            const going = leaving.has(k);
            const link = guideLink(it);
            const extra = extraLine(it);
            return (
              <article
                key={k}
                style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                className={`group rounded-2xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 fill-mode-both ${
                  going ? "opacity-0 scale-90 -translate-y-2 pointer-events-none" : ""
                }`}
              >
                <div className="relative h-44 overflow-hidden bg-stone-100">
                  <img
                    src={it.image || kind.fallback}
                    onError={(e) => ((e.currentTarget as HTMLImageElement).src = kind.fallback)}
                    alt={it.title ?? kind.label}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className={`absolute top-3 right-3 px-2.5 h-7 rounded-full text-white text-[11px] font-bold inline-flex items-center gap-1 shadow ${kind.tone}`}>
                    <span>{kind.icon}</span>
                    {kind.label}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(it)}
                    title="إزالة من المفضلة"
                    aria-label="إزالة من المفضلة"
                    className="absolute top-3 left-3 w-9 h-9 rounded-full bg-white/95 grid place-items-center shadow-md hover:scale-110 active:scale-90 transition cursor-pointer"
                  >
                    <Heart className="w-[18px] h-[18px] fill-rose-500 text-rose-500 group-hover:animate-pulse" />
                  </button>
                  <h4 className="absolute bottom-3 right-3 left-3 text-white font-black text-base leading-snug line-clamp-2 drop-shadow">
                    {it.title || `${kind.label} ${it.item_id}`}
                  </h4>
                </div>
                <div className="p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0 space-y-1 text-xs text-stone-600">
                    {it.subtitle && (
                      <p className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#D96B27] shrink-0" />
                        <span className="truncate">{it.subtitle}</span>
                      </p>
                    )}
                    {extra && (
                      <p className="flex items-center gap-1.5 text-stone-500">
                        {extra.icon}
                        <span>{extra.text}</span>
                      </p>
                    )}
                  </div>
                  <Link
                    to={link.to}
                    search={link.search as never}
                    className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full bg-[#0B4F57] text-white text-xs font-bold hover:bg-[#13445C] hover:gap-2.5 transition-all"
                  >
                    عرض في الدليل
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Undo after removing */}
      {undo && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 h-12 rounded-2xl bg-slate-900/95 text-white shadow-2xl animate-in fade-in slide-in-from-bottom-3">
          <span className="text-sm font-bold">أُزيل «{undo.title || KINDS[undo.item_type]?.label}» من المفضلة</span>
          <button type="button" onClick={restore} className="inline-flex items-center gap-1 text-amber-300 font-black text-sm hover:text-amber-200 cursor-pointer">
            <Undo2 className="w-4 h-4" />
            تراجع
          </button>
        </div>
      )}
    </div>
  );
}
