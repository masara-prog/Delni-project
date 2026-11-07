
// @ts-check
/**
 * Real-time Unified Notifications System for Delni Platform
 * Handles notifications for Super Admin, Transport Companies, Drivers, Guides, and Tourists
 */

import { getStoredSession, LARAVEL_API_URL } from "./api";

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
const API_BASE = LARAVEL_API_URL;

// The id notifications are addressed to, by account type
export function recipientIdFor(session: ReturnType<typeof getStoredSession>): string | undefined {
  const u = session.user || {};
  const byRole: Record<string, unknown> = {
    tourist: u.tourist_id,
    guide: u.license_number,
    driver: u.driver_license_number,
    transport: u.contract_number,
    admin: u.id,
  };
  const id = byRole[session.role || ""];
  return id === undefined || id === null || id === "" ? undefined : String(id);
}

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
  const currentUserId = recipientIdFor(session);

  return all.filter((n) => {
    // If targeted to a specific user
    if (n.recipientId) {
      const roleMatches = n.recipientRole === currentRole || (currentRole === "transport" && n.recipientRole === "company");
      return roleMatches && currentUserId && String(n.recipientId).trim() === String(currentUserId).trim();
    }
    // If targeted to all
    if (!n.recipientRole || n.recipientRole === "all") return true;
    // If matches current role
    if (n.recipientRole === currentRole) return true;
    return false;
  });
}

/**
 * Fetch fresh notifications from DelniDB through Laravel (with strict user isolation)
 */
export async function fetchUserNotifications(): Promise<NotificationItem[]> {
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId = recipientIdFor(session) || "";

  try {
    const url = `${API_BASE}/notifications?role=${encodeURIComponent(currentRole)}&user_id=${encodeURIComponent(currentUserId)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("Failed to fetch notifications from the server");
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
  const currentUserId = recipientIdFor(session) || "";

  try {
    const url = `${API_BASE}/notifications/unread-count?role=${encodeURIComponent(currentRole)}&user_id=${encodeURIComponent(currentUserId)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(3000) });
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

  // Save in DelniDB through Laravel
  if (typeof window !== "undefined") {
    fetch(`${API_BASE}/notifications`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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

const ROLE_DASHBOARD: Record<string, string> = {
  tourist: "/dashboard/tourist",
  guide: "/dashboard/guide",
  driver: "/dashboard/driver",
  transport: "/dashboard/transport",
  admin: "/dashboard/admin",
};

// The dashboard section that shows a notification's content, for notifications whose link names no section
function sectionFor(path: string, n: NotificationItem): string | undefined {
  const t = n.title || "";
  switch (path) {
    case "/dashboard/admin":
      if (n.type === "chat") return "inquiries_chat";
      if (n.type === "private_trip") return "private_trips";
      if (n.type === "booking") return "bookings";
      if (n.type === "offer") return "offers";
      if (t.includes("شركة نقل")) return "companies";
      if (t.includes("مرشد")) return "guides";
      if (t.includes("سائح")) return "tourists";
      if ((n.type as string) === "contract") return "entities";
      if (n.type === "trip" || n.type === "assignment") return "trips";
      return undefined;
    case "/dashboard/tourist":
      if (n.type === "chat") return "support";
      if (n.type === "private_trip") return "private_trips";
      if (n.type === "booking" || n.type === "trip") return "bookings";
      return undefined;
    case "/dashboard/guide":
      if (n.type === "chat") return "support";
      if (n.type === "booking") return "active_tourists";
      if (n.type === "trip" || n.type === "assignment" || n.type === "private_trip") return "assigned_trips";
      return undefined;
    case "/dashboard/driver":
      if (n.type === "chat") return "support";
      if (n.type === "assignment" && t.includes("مركبة")) return "vehicle";
      if (n.type === "assignment" || n.type === "trip") return "live_trip";
      return "notifications";
    case "/dashboard/transport":
      if (n.type === "chat") return "support";
      if (n.type === "assignment" || n.type === "trip") return "trips";
      return undefined;
  }
  return undefined;
}

/**
 * Where clicking a notification leads: its page, with ?tab= naming the dashboard section that shows its content
 * (DashboardShell opens that section; "support" opens the support chat).
 */
export function notificationTarget(n: NotificationItem): { to: string; search?: Record<string, string> } | null {
  const [linkPath, linkQuery = ""] = (n.link || "").split("?");
  const path = linkPath || ROLE_DASHBOARD[getStoredSession().role || ""] || "";
  if (!path) return null;
  if (!path.startsWith("/dashboard/")) return { to: path };
  const tab = new URLSearchParams(linkQuery).get("tab") || sectionFor(path, n);
  // "n" makes a second click on the same notification open the section again
  return { to: path, search: tab ? { tab, n: n.id } : { n: n.id } };
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
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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
  const currentUserId = recipientIdFor(session);

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
      headers: { "Content-Type": "application/json", Accept: "application/json" },
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

const DASHBOARD_BY_ROLE: Record<string, string> = {
  tourist: "/dashboard/tourist",
  guide: "/dashboard/guide",
  driver: "/dashboard/driver",
  company: "/dashboard/transport",
  admin: "/dashboard/admin",
};

// The admin's reply reaches the account that wrote, whatever its type (tourist, guide, driver or transport company)
export function notifyAdminChatReply(replyText: string, recipientRole: NonNullable<NotificationItem["recipientRole"]>, recipientId: string) {
  addNotification({
    type: "chat",
    title: "💬 رد جديد من إدارة منصة دلّني",
    body: `رد المشرف الإداري: "${replyText}"`,
    recipientRole,
    recipientId,
    link: `${DASHBOARD_BY_ROLE[recipientRole] || "/"}?tab=support`,
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
