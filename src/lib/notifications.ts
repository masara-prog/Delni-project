// @ts-check
/**
 * Real-time Unified Notifications System for Delni Platform
 * Handles notifications for Super Admin, Transport Companies, Drivers, Guides, and Tourists
 */

import { getStoredSession } from "./api";

export type NotificationItem = {
  id: string;
  type: "chat" | "trip" | "booking" | "system" | "offer";
  title: string;
  body: string;
  time: string;
  read: boolean;
  recipientRole?: "all" | "admin" | "tourist" | "driver" | "guide" | "company";
  recipientId?: string; // target user id, tourist_id, passport, or session id
  link?: string;
};

const STORAGE_KEY = "dalni_notifications";
const NOTIF_EVENT = "dalni_notification_event";

const defaultInitialNotifications: NotificationItem[] = [
  {
    id: "notif-init-1",
    type: "trip",
    title: "🧭 تعيين رحلة أسبوعية جديدة",
    body: "تم تعيين وإطلاق رحلة الجبل الأخضر وسوسة للمرشد المعتمد خالد الورفلي.",
    time: "منذ 10 دقائق",
    read: false,
    recipientRole: "all",
  },
  {
    id: "notif-init-2",
    type: "chat",
    title: "💬 استفسار شات بوت جديد",
    body: "أرسل السائح محمد عبد الله استفساراً عن مواعيد الانطلاق والتحقق.",
    time: "منذ 25 دقيقة",
    read: false,
    recipientRole: "admin",
  },
  {
    id: "notif-init-3",
    type: "booking",
    title: "🎫 سداد وحجز مقاعد",
    body: "تم تسجيل حجز جديد وتأكيد الحضور بمقر الشركة.",
    time: "منذ ساعة",
    read: true,
    recipientRole: "all",
  },
];

export function getAllNotifications(): NotificationItem[] {
  if (typeof window === "undefined") return defaultInitialNotifications;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultInitialNotifications));
      return defaultInitialNotifications;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultInitialNotifications;
  } catch {
    return defaultInitialNotifications;
  }
}

export function saveAllNotifications(items: NotificationItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent(NOTIF_EVENT, { detail: items }));
  } catch {}
}

export function getUserNotifications(): NotificationItem[] {
  const all = getAllNotifications();
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId = session.user?.tourist_id || session.user?.passport || session.user?.id || session.user?.license_number;

  return all.filter((n) => {
    // If targeted to a specific user
    if (n.recipientId && currentUserId && n.recipientId === currentUserId) return true;
    // If targeted to all
    if (!n.recipientRole || n.recipientRole === "all") return true;
    // If matches current role
    if (n.recipientRole === currentRole) return true;
    return false;
  });
}

export function addNotification(notif: {
  type: NotificationItem["type"];
  title: string;
  body: string;
  recipientRole?: NotificationItem["recipientRole"];
  recipientId?: string;
  link?: string;
}): NotificationItem {
  const all = getAllNotifications();
  const newItem: NotificationItem = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    type: notif.type,
    title: notif.title,
    body: notif.body,
    time: new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" }),
    read: false,
    recipientRole: notif.recipientRole || "all",
    recipientId: notif.recipientId,
    link: notif.link,
  };

  const updated = [newItem, ...all.slice(0, 49)]; // keep latest 50
  saveAllNotifications(updated);

  // Sync to DelniDB SQL Server Bridge
  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:5001/api/db/notifications", {
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
      }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }

  return newItem;
}

export function markNotificationRead(id: string): void {
  const all = getAllNotifications();
  const updated = all.map((n) => (n.id === id ? { ...n, read: true } : n));
  saveAllNotifications(updated);

  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:5001/api/db/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
  }
}

export function markAllNotificationsRead(): void {
  const session = getStoredSession();
  const currentRole = session.role || "guest";
  const currentUserId = session.user?.tourist_id || session.user?.passport || session.user?.id;

  const all = getAllNotifications();
  const updated = all.map((n) => {
    if (
      !n.recipientRole ||
      n.recipientRole === "all" ||
      n.recipientRole === currentRole ||
      (n.recipientId && n.recipientId === currentUserId)
    ) {
      return { ...n, read: true };
    }
    return n;
  });
  saveAllNotifications(updated);

  if (typeof window !== "undefined") {
    fetch("http://127.0.0.1:5001/api/db/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true, role: currentRole, user_id: currentUserId }),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {});
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
  // Notify Admin & Companies
  addNotification({
    type: "trip",
    title: "🧭 تعيين رحلة سياحية جديدة",
    body: `تم تعيين رحلة (${tripTitle}) بنجاح للمرشد ${guideName || "المعتمد"} والناقل المعتمد.`,
    recipientRole: "admin",
    link: "/dashboard/admin",
  });

  // Notify Tourists / Subscribers
  addNotification({
    type: "trip",
    title: "🎉 رحلة جديدة متاحة للحجز!",
    body: `تم إطلاق وتعيين رحلة (${tripTitle}) - المقاعد متاحة الآن للسياح والمشتركين للحجز المباشر.`,
    recipientRole: "all",
    link: "/trips",
  });
}

export function notifyTicketVerified(ticketCode: string, tripTitle: string, touristName: string, seats: number, touristId?: string) {
  addNotification({
    type: "booking",
    title: "✅ تم مسح التذكرة وتأكيد الحجز بنجاح!",
    body: `تم تأكيد تسجيل وحضور (${touristName}) في رحلة (${tripTitle}) لعدد (${seats}) مقاعد بالرمز (${ticketCode}).`,
    recipientRole: "tourist",
    recipientId: touristId,
    link: "/dashboard/tourist",
  });
}
