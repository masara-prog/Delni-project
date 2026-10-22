import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Ticket, Compass, MessageSquare, Tag, ShieldAlert } from "lucide-react";
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/lib/notifications";
import { useNavigate } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const refreshNotifications = () => {
    try {
      const list = getUserNotifications();
      setNotifications(list);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshNotifications();

    const handleEvent = () => refreshNotifications();
    window.addEventListener("dalni_notification_event", handleEvent);
    window.addEventListener("storage", handleEvent);

    // Periodic check every 10 seconds for real-time responsiveness
    const timer = setInterval(refreshNotifications, 10000);

    return () => {
      window.removeEventListener("dalni_notification_event", handleEvent);
      window.removeEventListener("storage", handleEvent);
      clearInterval(timer);
    };
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleItemClick = (notif: NotificationItem) => {
    markNotificationRead(notif.id);
    refreshNotifications();
    if (notif.link) {
      setIsOpen(false);
      navigate({ to: notif.link as any });
    }
  };

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllNotificationsRead();
    refreshNotifications();
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "booking":
        return <Ticket className="w-4 h-4 text-emerald-600" />;
      case "trip":
        return <Compass className="w-4 h-4 text-amber-600" />;
      case "chat":
        return <MessageSquare className="w-4 h-4 text-blue-600" />;
      case "offer":
        return <Tag className="w-4 h-4 text-purple-600" />;
      default:
        return <ShieldAlert className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs group flex items-center justify-center"
        aria-label={isAr ? "الإشعارات والتنبيهات" : "Notifications"}
        title={isAr ? "الإشعارات والتنبيهات الحية" : "Notifications"}
      >
        <Bell className="w-4.5 h-4.5 text-slate-600 group-hover:text-primary transition" />
        
        {unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 min-w-[19px] h-[19px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white shadow-xs animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
        )}
      </button>

      {/* Notifications Dropdown Drawer */}
      {isOpen && (
        <div
          className={`absolute ${
            isAr ? "left-0 sm:left-auto sm:right-0" : "right-0 sm:right-auto sm:left-0"
          } mt-2 w-80 sm:w-96 max-w-[90vw] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200`}
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-slate-900 to-[#1B5A78] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-base">🔔</span>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-white">
                  {isAr ? "التنبيهات والإشعارات الحية" : "Live Notifications"}
                </h4>
                <p className="text-[10px] text-teal-200/80 font-medium">
                  {isAr ? "متابعة الحجوزات، التأكيدات، والرسائل" : "Bookings, confirmations & alerts"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[10px] font-black bg-white/15 hover:bg-white/25 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                title={isAr ? "تحديد كافة الإشعارات كمقروءة" : "Mark all as read"}
              >
                <Check className="w-3 h-3" />
                <span>{isAr ? "تحديد الكل كمقروء" : "Mark read"}</span>
              </button>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-84 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-slate-400 space-y-2">
                <Bell className="w-8 h-8 mx-auto text-slate-300" strokeWidth={1.5} />
                <p className="text-xs font-bold">{isAr ? "لا توجد تنبيهات حالياً" : "No notifications right now"}</p>
                <p className="text-[10px] text-slate-400">{isAr ? "سيتم إشعارك فور حدوث أي تحديث جديد" : "You're all caught up"}</p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                    !item.read ? "bg-amber-50/40 border-r-3 border-r-[#D96B27]" : ""
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/60 shadow-2xs">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h5 className={`text-xs font-bold truncate ${!item.read ? "text-[#0F172A] font-black" : "text-slate-700"}`}>
                        {item.title}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-mono shrink-0">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    {item.link && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary font-bold">
                        <span>{isAr ? "انقر للذهاب للتفاصيل" : "Click to view"}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>

                  {!item.read && (
                    <span className="w-2 h-2 rounded-full bg-[#D96B27] shrink-0 mt-2" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium">
            <span>{isAr ? `إجمالي الإشعارات: ${notifications.length}` : `Total alerts: ${notifications.length}`}</span>
            {unreadCount > 0 && (
              <span className="font-bold text-amber-700">
                {isAr ? `${unreadCount} غير مقروء` : `${unreadCount} unread`}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
