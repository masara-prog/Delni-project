import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Check,
  ExternalLink,
  Ticket,
  Compass,
  MessageSquare,
  Tag,
  ShieldAlert,
  Sparkles,
  Bus,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import {
  getUserNotifications,
  fetchUserNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  NOTIF_EVENT,
  type NotificationItem,
} from "@/lib/notifications";
import { useNavigate, Link } from "@tanstack/react-router";
import { useLanguage } from "@/lib/i18n";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isAr = language === "ar";

  const refreshNotifications = async () => {
    try {
      // First, immediately show local cached notifications
      const local = getUserNotifications();
      setNotifications(local);

      // Then fetch fresh data from the server bridge
      const fresh = await fetchUserNotifications();
      if (Array.isArray(fresh)) {
        setNotifications(fresh);
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    refreshNotifications();

    const handleEvent = () => {
      const local = getUserNotifications();
      setNotifications(local);
    };

    window.addEventListener(NOTIF_EVENT, handleEvent);
    window.addEventListener("storage", handleEvent);

    // Periodic check every 10 seconds for real-time responsiveness
    const timer = setInterval(() => {
      refreshNotifications();
    }, 10000);

    return () => {
      window.removeEventListener(NOTIF_EVENT, handleEvent);
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
    setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    if (notif.link) {
      setIsOpen(false);
      navigate({ to: notif.link as any });
    }
  };

  const handleMarkAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: NotificationItem["type"]) => {
    switch (type) {
      case "booking":
        return <Ticket className="w-4 h-4 text-emerald-600" />;
      case "trip":
        return <Compass className="w-4 h-4 text-amber-600" />;
      case "private_trip":
        return <Sparkles className="w-4 h-4 text-orange-600" />;
      case "assignment":
        return <Bus className="w-4 h-4 text-sky-600" />;
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
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) refreshNotifications();
        }}
        className="relative p-2 sm:p-2.5 rounded-xl border border-border bg-white hover:bg-slate-50 transition cursor-pointer shadow-2xs group flex items-center justify-center"
        aria-label={isAr ? "الإشعارات والتنبيهات" : "Notifications"}
        title={isAr ? "الإشعارات والتنبيهات الحية" : "Notifications"}
      >
        <Bell className="w-4.5 h-4.5 text-slate-700 group-hover:text-primary transition" />

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
          className="absolute left-0 mt-2 w-80 sm:w-[390px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[120] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 font-['Tajawal',sans-serif]"
          dir={isAr ? "rtl" : "ltr"}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 to-[#1B5A78] text-white flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0">🔔</span>
              <div className="min-w-0">
                <h4 className="font-black text-xs sm:text-sm text-white truncate">
                  {isAr ? "التنبيهات والإشعارات الحية" : "Live Notifications"}
                </h4>
                <p className="text-[10px] text-teal-200/90 font-medium truncate">
                  {isAr ? "متابعة الحجوزات والتكليفات والتحديثات" : "Bookings, assignments & alerts"}
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAll}
                className="text-[10px] font-black bg-white/20 hover:bg-white/30 text-white px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer shadow-2xs"
                title={isAr ? "تحديد كافة الإشعارات كمقروءة" : "Mark all as read"}
              >
                <Check className="w-3 h-3" />
                <span className="whitespace-nowrap">{isAr ? "تحديد الكل كمقروء" : "Mark read"}</span>
              </button>
            )}
          </div>

          {/* List of items */}
          <div className="max-h-88 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2 px-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Bell className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
                </div>
                <p className="text-xs font-bold text-slate-600">{isAr ? "لا توجد إشعارات جديدة حالياً" : "No notifications right now"}</p>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isAr
                    ? "ستظهر هنا التنبيهات المتعلقة بحجوزاتك وتكليفات الرحلات فور صدورها"
                    : "You're all caught up! Updates will appear here automatically."}
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50 ${
                    !item.read ? "bg-amber-50/50 border-r-3 border-r-[#D96B27]" : "bg-white"
                  }`}
                >
                  <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 border border-slate-200/70 shadow-2xs">
                    {getIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h5
                        className={`text-xs leading-tight ${
                          !item.read ? "text-[#0F172A] font-black" : "text-slate-700 font-bold"
                        }`}
                      >
                        {item.title}
                      </h5>
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0 whitespace-nowrap">
                        {item.time}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>

                    {item.link && (
                      <div className="mt-1.5 flex items-center gap-1 text-[10px] text-primary font-bold">
                        <span>{isAr ? "انقر للمتابعة والتفاصيل" : "Click to view details"}</span>
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

          {/* Footer with link to Full Notifications Page */}
          <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 font-medium">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="inline-flex items-center gap-1.5 text-primary hover:text-primary-dark font-black hover:underline"
            >
              <span>{isAr ? "عرض سجل الإشعارات بالكامل" : "View all notifications"}</span>
              {isAr ? <ChevronLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </Link>

            {unreadCount > 0 ? (
              <span className="font-bold text-amber-700 text-[10px] bg-amber-100/80 px-2 py-0.5 rounded-full">
                {isAr ? `${unreadCount} غير مقروء` : `${unreadCount} unread`}
              </span>
            ) : (
              <span className="text-[10px] text-slate-400">{isAr ? "محدث بالكامل" : "Up to date"}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
