import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useLanguage } from "@/lib/i18n";
import {
  Bell,
  Check,
  CheckCheck,
  ExternalLink,
  Ticket,
  Compass,
  Sparkles,
  Bus,
  MessageSquare,
  Tag,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
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
  type NotificationType,
} from "@/lib/notifications";
import { getStoredSession } from "@/lib/api";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "سجل الإشعارات والتنبيهات | منصة دلّني" },
      {
        name: "description",
        content: "مركز التنبيهات وسجل الإشعارات المتكامل لمتابعة الحجوزات والتكليفات وتحديثات الرحلات في ليبيا.",
      },
    ],
  }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { language, dir } = useLanguage();
  const isAr = language === "ar";
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(12);

  const session = getStoredSession();
  const role = session.role || "tourist";

  const loadNotifications = async (showLoading = false) => {
    if (showLoading) setIsRefreshing(true);
    try {
      // Show local immediately
      const local = getUserNotifications();
      setNotifications(local);

      // Fetch fresh
      const fresh = await fetchUserNotifications();
      if (Array.isArray(fresh)) {
        setNotifications(fresh);
      }
    } catch {
      // Fallback
    } finally {
      if (showLoading) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  };

  useEffect(() => {
    loadNotifications();

    const handleEvent = () => {
      setNotifications(getUserNotifications());
    };

    window.addEventListener(NOTIF_EVENT, handleEvent);
    window.addEventListener("storage", handleEvent);

    return () => {
      window.removeEventListener(NOTIF_EVENT, handleEvent);
      window.removeEventListener("storage", handleEvent);
    };
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  // Filtered & Searched list
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Type filtering
      if (filterType === "unread" && item.read) return false;
      if (filterType === "booking" && item.type !== "booking") return false;
      if (filterType === "trips" && item.type !== "trip" && item.type !== "assignment") return false;
      if (filterType === "private" && item.type !== "private_trip") return false;
      if (filterType === "system" && item.type !== "system" && item.type !== "chat" && item.type !== "offer") return false;

      // Search query filtering
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(query);
        const matchesBody = item.body?.toLowerCase().includes(query);
        return matchesTitle || matchesBody;
      }

      return true;
    });
  }, [notifications, filterType, searchQuery]);

  const displayedItems = useMemo(
    () => filteredNotifications.slice(0, displayLimit),
    [filteredNotifications, displayLimit]
  );

  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getCategoryMeta = (type: NotificationType) => {
    switch (type) {
      case "booking":
        return {
          icon: <Ticket className="w-5 h-5 text-emerald-600" />,
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: isAr ? "حجز وتذاكر" : "Booking & Tickets",
        };
      case "trip":
        return {
          icon: <Compass className="w-5 h-5 text-amber-600" />,
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          label: isAr ? "رحلة سياحية" : "Tour Trip",
        };
      case "private_trip":
        return {
          icon: <Sparkles className="w-5 h-5 text-orange-600" />,
          bg: "bg-orange-50 text-orange-700 border-orange-200",
          label: isAr ? "رحلة خاصة VIP" : "Private VIP Trip",
        };
      case "assignment":
        return {
          icon: <Bus className="w-5 h-5 text-sky-600" />,
          bg: "bg-sky-50 text-sky-700 border-sky-200",
          label: isAr ? "تكليف ومهمة" : "Assignment",
        };
      case "chat":
        return {
          icon: <MessageSquare className="w-5 h-5 text-blue-600" />,
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          label: isAr ? "محادثة ودعم" : "Chat & Support",
        };
      case "offer":
        return {
          icon: <Tag className="w-5 h-5 text-purple-600" />,
          bg: "bg-purple-50 text-purple-700 border-purple-200",
          label: isAr ? "عرض سياحي" : "Promo Offer",
        };
      default:
        return {
          icon: <ShieldAlert className="w-5 h-5 text-slate-600" />,
          bg: "bg-slate-50 text-slate-700 border-slate-200",
          label: isAr ? "إشعار نظام" : "System Alert",
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Tajawal',sans-serif]" dir={dir}>
      <Header />

      {/* Hero Header */}
      <section className="pt-28 pb-10 bg-gradient-to-r from-slate-900 via-[#1B5A78] to-[#0F3649] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-bold mb-3 border border-white/15">
                <Bell className="w-3.5 h-3.5 text-[#D96B27]" />
                <span>{isAr ? "مركز الإشعارات الحية" : "Live Notifications Center"}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                {isAr ? "سجل الإشعارات والتنبيهات" : "Notifications History"}
              </h1>
              <p className="text-sm text-teal-100/90 mt-2 max-w-xl leading-relaxed">
                {isAr
                  ? "متابعة فورية وموثقة لكافة تحديثات الحجوزات، اعتمادات التذاكر، تكليفات المرشدين والسائقين، وبرامج الرحلات الخاصة."
                  : "Track all updates regarding your bookings, confirmed tickets, assignments, and tailored itinerary proposals."}
              </p>
            </div>

            {/* Quick Stats in Hero */}
            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[110px]">
                <div className="text-2xl font-black text-white">{notifications.length}</div>
                <div className="text-[11px] text-teal-200 font-medium">{isAr ? "إجمالي التنبيهات" : "Total Alerts"}</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center min-w-[110px]">
                <div className="text-2xl font-black text-[#D96B27]">{unreadCount}</div>
                <div className="text-[11px] text-teal-200 font-medium">{isAr ? "غير مقروءة" : "Unread"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Controls Toolbar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? "بحث في عنوان أو محتوى الإشعار..." : "Search notification title or body..."}
                className="w-full pr-10 pl-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => loadNotifications(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer disabled:opacity-50"
                title={isAr ? "تحديث التنبيهات من قاعدة البيانات" : "Refresh from database"}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-primary" : "text-slate-500"}`} />
                <span>{isAr ? "تحديث" : "Refresh"}</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>{isAr ? "تحديد الكل كمقروء" : "Mark All as Read"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100 text-xs font-bold">
            <span className="text-slate-400 shrink-0 text-[11px] font-medium flex items-center gap-1">
              <Filter className="w-3 h-3" />
              <span>{isAr ? "تصفية:" : "Filter:"}</span>
            </span>

            {[
              { id: "all", labelAr: "كافة الإشعارات", labelEn: "All", count: notifications.length },
              { id: "unread", labelAr: "غير المقروءة", labelEn: "Unread", count: unreadCount },
              {
                id: "booking",
                labelAr: "الحجوزات والتذاكر",
                labelEn: "Bookings",
                count: notifications.filter((n) => n.type === "booking").length,
              },
              {
                id: "trips",
                labelAr: "الرحلات والتكليفات",
                labelEn: "Trips & Tasks",
                count: notifications.filter((n) => n.type === "trip" || n.type === "assignment").length,
              },
              {
                id: "private",
                labelAr: "الرحلات الخاصة VIP",
                labelEn: "VIP Proposals",
                count: notifications.filter((n) => n.type === "private_trip").length,
              },
              {
                id: "system",
                labelAr: "إشعارات النظام والدعم",
                labelEn: "System & Chat",
                count: notifications.filter((n) => n.type === "system" || n.type === "chat" || n.type === "offer").length,
              },
            ].map((tab) => {
              const active = filterType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterType(tab.id)}
                  className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? "bg-slate-900 text-white shadow-xs font-black"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <span>{isAr ? tab.labelAr : tab.labelEn}</span>
                  {tab.count > 0 && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        active ? "bg-white/25 text-white" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications List */}
        {displayedItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-xs">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100 mb-3">
              <Bell className="w-8 h-8 text-slate-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-base font-bold text-slate-700">
              {searchQuery || filterType !== "all"
                ? isAr
                  ? "لا توجد إشعارات مطابقة للتصفية الحالية"
                  : "No notifications match current filter"
                : isAr
                ? "سجل الإشعارات فارغ حالياً"
                : "Your notifications inbox is empty"}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
              {searchQuery || filterType !== "all"
                ? isAr
                  ? "جرّب تغيير كلمات البحث أو إعادة ضبط الفلتر لعرض المزيد من التنبيهات."
                  : "Try clearing search keywords or switching filters."
                : isAr
                ? "ستصلك الإشعارات المتعلقة بتأكيد التذاكر ومواعيد الرحلات وتكليفات العمل فور إجرائها في النظام."
                : "Live alerts about your bookings, ticket confirmations, and assignments will appear here."}
            </p>
            {(searchQuery || filterType !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setFilterType("all");
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              >
                {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map((item) => {
              const meta = getCategoryMeta(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    handleMarkAsRead(item.id);
                    if (item.link) navigate({ to: item.link as any });
                  }}
                  className={`bg-white rounded-2xl border transition-all p-4.5 sm:p-5 flex flex-col sm:flex-row sm:items-start gap-4 cursor-pointer hover:shadow-md ${
                    !item.read
                      ? "border-[#D96B27]/40 bg-gradient-to-l from-amber-50/20 to-white shadow-2xs ring-1 ring-[#D96B27]/10"
                      : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  {/* Category Icon */}
                  <div className="flex items-center gap-3 sm:block shrink-0">
                    <div className="w-11 h-11 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-200/70 shadow-2xs">
                      {meta.icon}
                    </div>
                    <span className="sm:hidden text-xs font-bold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.time}</span>
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${meta.bg}`}>
                          {meta.label}
                        </span>
                        <h4
                          className={`text-sm sm:text-base leading-snug ${
                            !item.read ? "text-slate-900 font-black" : "text-slate-700 font-bold"
                          }`}
                        >
                          {item.title}
                        </h4>
                      </div>

                      <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{item.time}</span>
                        </span>
                        {!item.read && (
                          <span className="w-2.5 h-2.5 rounded-full bg-[#D96B27] shrink-0" title="غير مقروء" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal mt-1">
                      {item.body}
                    </p>

                    {/* Bottom Action Footer of Card */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                      {item.link ? (
                        <div className="inline-flex items-center gap-1 text-primary hover:text-primary-dark font-black">
                          <span>{isAr ? "الانتقال إلى التفاصيل المعنية" : "View Details"}</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {isAr ? "إشعار إعلامي رسمي" : "Official notification"}
                        </span>
                      )}

                      {!item.read && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(item.id, e)}
                          className="inline-flex items-center gap-1 text-slate-500 hover:text-emerald-700 font-bold text-[11px] hover:underline"
                        >
                          <Check className="w-3 h-3" />
                          <span>{isAr ? "تحديد كمقروء" : "Mark as read"}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More Button */}
        {filteredNotifications.length > displayLimit && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setDisplayLimit((prev) => prev + 12)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-2xs transition inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{isAr ? "عرض المزيد من الإشعارات السابقة" : "Load older notifications"}</span>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                {filteredNotifications.length - displayLimit}+
              </span>
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
