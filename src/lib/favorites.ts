import { useState, useEffect, useCallback } from "react";
import { getStoredSession } from "./api";

export type FavoriteType = "hotel" | "restaurant" | "vehicle" | "daily_trip" | "weekly_trip" | "landmark";

export interface FavoriteRecord {
  favorite_id?: string;
  tourist_id: string;
  item_type: FavoriteType;
  item_id: string;
  created_at?: string;
}

const FAVORITES_EVENT = "delni_favorites_updated";

function getLocalKey(touristId: string) {
  return `delni_favorites_${touristId}`;
}

export function getCachedFavorites(touristId: string): Set<string> {
  if (typeof window === "undefined" || !touristId) return new Set();
  try {
    const raw = localStorage.getItem(getLocalKey(touristId));
    if (raw) {
      const arr = JSON.parse(raw);
      return new Set(Array.isArray(arr) ? arr : []);
    }
  } catch {}
  return new Set();
}

export function setCachedFavorites(touristId: string, favKeys: Set<string>) {
  if (typeof window === "undefined" || !touristId) return;
  try {
    localStorage.setItem(getLocalKey(touristId), JSON.stringify(Array.from(favKeys)));
    window.dispatchEvent(new CustomEvent(FAVORITES_EVENT, { detail: { touristId } }));
  } catch {}
}

export async function fetchTouristFavorites(touristId: string): Promise<FavoriteRecord[]> {
  if (!touristId) return [];
  try {
    const res = await fetch(`http://127.0.0.1:5001/api/db/favorites?tourist_id=${encodeURIComponent(touristId)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.data && Array.isArray(data.data)) {
        const keySet = new Set<string>(data.data.map((f: FavoriteRecord) => `${f.item_type}:${f.item_id}`));
        setCachedFavorites(touristId, keySet);
        return data.data;
      }
    }
  } catch {}
  return [];
}

export async function toggleFavorite(
  itemType: FavoriteType,
  itemId: string,
  itemTitle?: string
): Promise<{ isFavorite: boolean; message: string }> {
  const session = getStoredSession();
  const touristId = session.user?.tourist_id || session.user?.id || session.user?.phone_number || "guest";
  const compositeKey = `${itemType}:${itemId}`;

  const currentSet = getCachedFavorites(touristId);
  const willBeFav = !currentSet.has(compositeKey);

  if (willBeFav) {
    currentSet.add(compositeKey);
  } else {
    currentSet.delete(compositeKey);
  }
  setCachedFavorites(touristId, currentSet);

  if (session.user && touristId !== "guest") {
    try {
      const res = await fetch("http://127.0.0.1:5001/api/db/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourist_id: touristId,
          item_type: itemType,
          item_id: itemId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return {
          isFavorite: data.is_favorite ?? willBeFav,
          message: data.message || (willBeFav ? `تمت إضافة "${itemTitle || 'العنصر'}" إلى المفضلة ❤️` : `تمت إزالة "${itemTitle || 'العنصر'}" من المفضلة`),
        };
      }
    } catch (e) {
      console.warn("Favorite API sync failed, kept in local cache", e);
    }
  }

  return {
    isFavorite: willBeFav,
    message: willBeFav
      ? `تمت إضافة "${itemTitle || 'العنصر'}" إلى المفضلة ❤️`
      : `تمت إزالة "${itemTitle || 'العنصر'}" من المفضلة`,
  };
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const session = getStoredSession();
    const tid = session.user?.tourist_id || session.user?.id || session.user?.phone_number || "guest";
    return getCachedFavorites(tid);
  });

  const refresh = useCallback(() => {
    const session = getStoredSession();
    const tid = session.user?.tourist_id || session.user?.id || session.user?.phone_number || "guest";
    setFavorites(new Set(getCachedFavorites(tid)));
  }, []);

  useEffect(() => {
    const session = getStoredSession();
    const tid = session.user?.tourist_id || session.user?.id || session.user?.phone_number;
    if (tid) {
      fetchTouristFavorites(tid).then(() => refresh());
    }

    const handler = () => refresh();
    window.addEventListener(FAVORITES_EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, [refresh]);

  const isFavorite = useCallback(
    (itemType: FavoriteType, itemId: string) => {
      return favorites.has(`${itemType}:${itemId}`);
    },
    [favorites]
  );

  return {
    favorites,
    isFavorite,
    toggle: toggleFavorite,
  };
}
