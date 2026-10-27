
// @ts-check
/**
 * Real-time Unified Notifications System for Delni Platform
 * Handles notifications for Super Admin, Transport Companies, Drivers, Guides, and Tourists
 */

import { getStoredSession } from "./api";

export type NotificationType =
  | "chat"
  | "trip"
  | "booking"
  | "system"
  | "offer"
  | "assignment"
  | "private_trip";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  recipientRole?: "all" | "admin" | "tourist" | "driver" | "guide" | "company";
  recipientId?: string; // target user id, tourist_id, passport, license_number, or contract_number
  link?: string;
  dedupeKey?: string;
  createdAt?: string;
};

const STORAGE_KEY = "dalni_notifications";
export const NOTIF_EVENT = "dalni_notification_event";
const API_BASE = "http://127.0.0.1:5001/api/db";

/**
 * Format timestamp to friendly Arabic relative time
 */
export function formatArabicTime(rawTime?: string | Date): string {
  if (!rawTime) return "الآن";
  try {
    const d = new Date(rawTime);
    if (isNaN(d.getTime())) return String(rawTime);
    const now = Date.now();
    const diffSec = Math.floor((now - d.getTime()) / 1000);

    if (diffSec < 45) return "منذ لحظات";
    if (diffSec < 90) return "منذ دقيقة";
    if (diffSec < 3600) return `منذ ${Math.floor(diffSec / 60)} دقيقة`;
    if (diffSec < 7200) return "منذ ساعة";
    if (diffSec < 86400) return `منذ ${Math.floor(diffSec / 3600)} ساعة`;
    if (diffSec < 172800) return "أمس";
    return d.toLocaleDateString("ar-LY", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(rawTime);
  }
}

export function getAllNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveAllNotifications(items: NotificationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(NOTIF_EVENT, { detail: items }));
  } catch { }
}

/**
 * Get cached notifications matching the active user session
 */
export function getUserNotifications(): NotificationItem[] {
  const all = getAllNotifications();
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId =
    session.user?.tourist_id ||
    session.user?.passport ||
    session.user?.license_number ||
    session.user?.contract_number ||
    session.user?.id;

  return all.filter((n) => {
    // If targeted to a specific user
    if (n.recipientId) {
      return currentUserId && String(n.recipientId).trim() === String(currentUserId).trim();
    }
    // If targeted to all
    if (!n.recipientRole || n.recipientRole === "all") return true;
    // If matches current role
    if (n.recipientRole === currentRole) return true;
    return false;
  });
}

/**
 * Fetch fresh notifications from the DelniDB SQL Server Bridge (with strict user isolation)
 */
export async function fetchUserNotifications(): Promise<NotificationItem[]> {
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId =
    session.user?.tourist_id ||
    session.user?.passport ||
    session.user?.license_number ||
    session.user?.contract_number ||
    session.user?.id ||
    "";

  try {
    const url = `${API_BASE}/notifications?role=${encodeURIComponent(currentRole)}&user_id=${encodeURIComponent(currentUserId)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("Failed to fetch notifications from bridge");
    const json = await res.json();

    if (json.success && Array.isArray(json.data)) {
      const serverItems: NotificationItem[] = json.data.map((item: any) => ({
        id: String(item.id),
        type: (item.type as NotificationType) || "system",
        title: item.title || "إشعار جديد",
        body: item.body || "",
        time: formatArabicTime(item.created_at || item.time),
        read: Boolean(item.read || item.is_read),
        recipientRole: item.recipient_role,
        recipientId: item.recipient_id,
        link: item.link,
        createdAt: item.created_at,
      }));

      // Cache locally and dispatch event
      saveAllNotifications(serverItems);
      return serverItems;
    }
  } catch (err) {
    // Fallback to local cache on network error
  }

  return getUserNotifications();
}

/**
 * Fetch count of unread notifications for current user
 */
export async function fetchUnreadCount(): Promise<number> {
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId =
    session.user?.tourist_id ||
    session.user?.passport ||
    session.user?.license_number ||
    session.user?.contract_number ||
    session.user?.id ||
    "";

  try {
    const url = `${API_BASE}/notifications/unread_count?role=${encodeURIComponent(currentRole)}&user_id=${encodeURIComponent(currentUserId)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (typeof json.count === "number") return json.count;
    }
  } catch { }

  // Fallback to local unread count
  return getUserNotifications().filter((n) => !n.read).length;
}

/**
 * Dispatch and save a new notification
 */
export function addNotification(notif: {
  type: NotificationItem["type"];
  title: string;
  body: string;
  recipientRole?: NotificationItem["recipientRole"];
  recipientId?: string;
  link?: string;
  dedupeKey?: string;
}): NotificationItem {
  const all = getAllNotifications();
  const newItem: NotificationItem = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: notif.type,
    title: notif.title,
    body: notif.body,
    time: "منذ لحظات",
    read: false,
    recipientRole: notif.recipientRole || "all",
    recipientId: notif.recipientId,
    link: notif.link,
    dedupeKey: notif.dedupeKey,
    createdAt: new Date().toISOString(),
  };

  const updated = [newItem, ...all.slice(0, 59)]; // keep latest 60
  saveAllNotifications(updated);

  // Sync to DelniDB SQL Server Bridge
  if (typeof window !== "undefined") {
    fetch(`${API_BASE}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newItem.id,
        type: newItem.type,
        title: newItem.title,
        body: newItem.body,
        recipient_role: newItem.recipientRole,
        recipient_id: newItem.recipientId,
        link: newItem.link,
        dedupe_key: newItem.dedupeKey,
      }),
      signal: AbortSignal.timeout(3000),
    }).catch(() => { });
  }

  return newItem;
}

/**
 * Mark a single notification as read
 */
export function markNotificationRead(id: string): void {
  const all = getAllNotifications();
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveAllNotifications(updated);

  if (typeof window !== "undefined") {
    fetch(`${API_BASE}/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => { });
  }
}

/**
 * Mark all notifications for the active user as read
 */
export function markAllNotificationsRead(): void {
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId =
    session.user?.tourist_id ||
    session.user?.passport ||
    session.user?.license_number ||
    session.user?.contract_number ||
    session.user?.id;

  const all = getAllNotifications();
  const updated = all.map((n) => {
    if (
      !n.recipientRole ||
      n.recipientRole === "all" ||
      n.recipientRole === currentRole ||
      (n.recipientId && currentUserId && String(n.recipientId) === String(currentUserId))
    ) {
      return { ...n, read: true };
    }
    return n;
  });
  saveAllNotifications(updated);

  if (typeof window !== "undefined") {
    fetch(`${API_BASE}/notifications/read`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true, role: currentRole, user_id: currentUserId }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => { });
  }
}

// Helpers for specific platform events
export function notifyChatbotUserMessage(userName: string, userRole: string, text: string) {
  addNotification({
    type: "chat",
    title: "💬 رسالة جديدة في الشات بوت",
    body: `أرسل ${userName || "مستخدم"} (${userRole || "سائح"}): "${text.slice(0, 50)}${text.length > 50 ? "..." : ""}"`,
    recipientRole: "admin",
    link: "/dashboard/admin",
    dedupeKey: `chat-${Date.now()}`,
  });
}

export function notifyAdminChatReply(userName: string, replyText: string, recipientId?: string) {
  addNotification({
    type: "chat",
    title: "💬 رد جديد من إدارة منصة دلّني",
    body: `رد المشرف الإداري: "${replyText.slice(0, 50)}${replyText.length > 50 ? "..." : ""}"`,
    recipientRole: "tourist",
    recipientId,
    link: "/dashboard/tourist",
  });
}

export function notifyTripAssigned(tripTitle: string, guideName?: string, driverName?: string) {
  addNotification({
    type: "trip",
    title: "🧭 تعيين رحلة سياحية جديدة",
    body: `تم تعيين رحلة (${tripTitle}) بنجاح للمرشد ${guideName || "المعتمد"} والناقل المعتمد.`,
    recipientRole: "admin",
    link: "/dashboard/admin",
  });

  addNotification({
    type: "trip",
    title: "🎉 رحلة جديدة متاحة للحجز!",
    body: `تم إطلاق وتعيين رحلة (${tripTitle}) - المقاعد متاحة الآن للسياح والمشتركين للحجز المباشر.`,
    recipientRole: "all",
    link: "/trips",
  });
}

export function notifyTicketVerified(
  ticketCode: string,
  tripTitle: string,
  touristName: string,
  seats: number,
  touristId?: string
) {
  addNotification({
    type: "booking",
    title: "✅ تم مسح التذكرة وتأكيد الحجز بنجاح!",
    body: `تم تأكيد تسجيل وحضور (${touristName}) في رحلة (${tripTitle}) لعدد (${seats}) مقاعد بالرمز (${ticketCode}).`,
    recipientRole: "tourist",
    recipientId: touristId,
    link: "/dashboard/tourist",
  });
}
