import React, { useState } from "react";

type Notification = {
  id: string;
  type: "offer" | "trip" | "booking" | "system";
  title: string;
  body: string;
  time: string;
  read: boolean;
};

const demoNotifications: Notification[] = [
  {
    id: "1",
    type: "offer",
    title: "🔥 عرض حصري جديد",
    body: "خصم 20% في فندق الفصول الأربعة لهذا الأسبوع فقط!",
    time: "منذ 5 دقائق",
    read: false,
  },
  {
    id: "2",
    type: "trip",
    title: "🧭 رحلة أسبوعية جديدة",
    body: "رحلة الجبل الأخضر والبحر المتوسط تبدأ من 15 سبتمبر.",
    time: "منذ ساعة",
    read: false,
  },
  {
    id: "3",
    type: "booking",
    title: "✅ تأكيد الحجز",
    body: "تم تأكيد حجزك في رحلة لبدة العظمة اليومية بنجاح.",
    time: "منذ 3 ساعات",
    read: true,
  },
  {
    id: "4",
    type: "system",
    title: "📢 إشعار من الإدارة",
    body: "تم إضافة خدمة استئجار السيارات الخاصة إلى المنصة.",
    time: "أمس",
    read: true,
  },
];

const typeColors: Record<Notification["type"], string> = {
  offer: "bg-amber-100 text-amber-600",
  trip: "bg-emerald-100 text-emerald-600",
  booking: "bg-blue-100 text-blue-600",
  system: "bg-slate-100 text-slate-600",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications);

  const unread = notifications.filter((n) => !n.read).length;

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 flex items-center justify-center rounded-xl bg-transparent hover:bg-white/10 text-white transition-colors cursor-pointer"
        aria-label="الإشعارات"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#D96B27] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
            {unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          <div
            dir="rtl"
            className="absolute left-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-[#E6E1D6] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#0B132B] text-white">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="text-sm font-black">الإشعارات</span>
                {unread > 0 && (
                  <span className="bg-[#D96B27] text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                    {unread} جديد
                  </span>
                )}
              </div>
              {unread > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-[11px] text-[#A0ABBA] hover:text-white transition"
                >
                  تعليم الكل كمقروء
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div className="divide-y divide-[#E6E1D6] max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-right px-4 py-3 hover:bg-[#FAFAF8] transition-colors flex gap-3 ${!n.read ? "bg-primary/5" : ""}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${typeColors[n.type]}`}>
                    {n.type === "offer" ? "🔥" : n.type === "trip" ? "🧭" : n.type === "booking" ? "✅" : "📢"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-xs leading-snug ${!n.read ? "font-black text-[#0B132B]" : "font-bold text-[#526078]"}`}>
                        {n.title}
                      </p>
                      {!n.read && (
                        <span className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-[#526078] mt-0.5 line-clamp-2 text-right">
                      {n.body}
                    </p>
                    <p className="text-[10px] text-stone-400 mt-1">{n.time}</p>
                  </div>
                </button>
              ))}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-[#E6E1D6] bg-[#FAFAF8]">
              <button className="text-xs font-black text-primary hover:underline w-full text-center">
                عرض كل الإشعارات
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
