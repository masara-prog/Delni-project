import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/states.dart';

/// The signed-in account's notifications (GET /notifications), newest first, grouped by day.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<AppNotification>? _items;
  bool _failed = false;
  bool _markingAll = false;

  bool get _isGuest => ApiService.currentSession?.isGuest ?? true;

  @override
  void initState() {
    super.initState();
    if (!_isGuest) _load();
  }

  Future<void> _load() async {
    setState(() => _failed = false);
    final items = await ApiService.fetchNotifications();
    if (!mounted) return;
    setState(() {
      _items = items ?? _items;
      _failed = items == null;
    });
    if (items != null) AppScope.read(context).setUnread(items.where((n) => !n.read).length);
  }

  Future<void> _open(AppNotification n) async {
    if (!n.read) {
      setState(() => _items = _items!.map((x) => x.id == n.id ? x.copyWith(read: true) : x).toList());
      AppScope.read(context).setUnread(_items!.where((x) => !x.read).length);
      ApiService.markNotificationRead(n.id);
    }
    // A tourist's booking or private-trip notification opens "My bookings" on its section
    final code = _codeOf(n);
    final isTourist = ApiService.currentSession?.isTourist ?? false;
    if (isTourist && code != null) {
      final state = AppScope.read(context);
      state.bookingsSegment.value = code.startsWith('PRV') ? 1 : 0;
      state.touristTab.value = 2;
      state.bookingsRevision.value++;
      Navigator.of(context).popUntil((r) => r.isFirst);
      return;
    }
    // A guide's trip notification opens "My trips"
    final isGuide = ApiService.currentSession?.role == 'guide';
    if (isGuide && (code != null || n.type == 'trip' || n.type == 'private_trip')) {
      AppScope.read(context).guideTab.value = 1;
      Navigator.of(context).popUntil((r) => r.isFirst);
      return;
    }
    await showAppSheet<void>(context, builder: (ctx) => _NotificationSheet(n: n, outer: context));
  }

  Future<void> _markAll() async {
    setState(() => _markingAll = true);
    final res = await ApiService.markAllNotificationsRead();
    if (!mounted) return;
    setState(() => _markingAll = false);
    if (res.success) {
      setState(() => _items = _items?.map((x) => x.copyWith(read: true)).toList());
      AppScope.read(context).setUnread(0);
    } else {
      showAppSnack(context, res.message, tone: Tone.danger);
    }
  }

  /// Today / yesterday / this week / older, from the notification's time.
  String _group(BuildContext context, String time) {
    final d = DateTime.tryParse(time.replaceFirst(' ', 'T'));
    if (d == null) return context.tr('أقدم', 'Earlier');
    final now = DateTime.now();
    final days = DateTime(now.year, now.month, now.day).difference(DateTime(d.year, d.month, d.day)).inDays;
    if (days <= 0) return context.tr('اليوم', 'Today');
    if (days == 1) return context.tr('أمس', 'Yesterday');
    if (days < 7) return context.tr('هذا الأسبوع', 'This week');
    return context.tr('أقدم', 'Earlier');
  }

  @override
  Widget build(BuildContext context) {
    final unread = _items?.where((n) => !n.read).length ?? 0;
    return Scaffold(
      appBar: AppBar(
        centerTitle: false,
        title: Row(
          children: [
            Flexible(child: Text(context.tr('الإشعارات', 'Notifications'), style: AppText.h1, overflow: TextOverflow.ellipsis)),
            if (unread > 0) ...[
              const SizedBox(width: 8),
              StatusBadge(label: context.tr('$unread جديد', '$unread new'), tone: Tone.orange, dense: true),
            ],
          ],
        ),
        actions: [
          if (unread > 0)
            _markingAll
                ? const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 18),
                    child: SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2)),
                  )
                : TextButton.icon(
                    onPressed: _markAll,
                    icon: const Icon(Icons.done_all_rounded, size: 18),
                    label: Text(context.tr('قراءة الكل', 'Mark all read')),
                  ),
          const SizedBox(width: 8),
        ],
      ),
      body: _body(context),
    );
  }

  Widget _body(BuildContext context) {
    if (_isGuest) {
      return EmptyState(
        icon: Icons.notifications_off_outlined,
        title: context.tr('الإشعارات للحسابات المسجلة', 'Notifications need an account'),
        message: context.tr('سجّل الدخول لتصلك إشعارات حجوزاتك وردود الإدارة.', 'Sign in to receive updates on your bookings and replies from the team.'),
      );
    }
    if (_items == null) {
      return _failed ? ErrorState(onRetry: _load) : const SkeletonList(count: 5, imageHeight: 40);
    }
    if (_items!.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(children: [
          EmptyState(
            icon: Icons.notifications_none_rounded,
            title: context.tr('لا توجد إشعارات', 'No notifications'),
            message: context.tr('ستظهر هنا تحديثات حجوزاتك ورحلاتك ورسائل الإدارة.', 'Updates about your bookings, trips and messages will appear here.'),
          ),
        ]),
      );
    }
    final rows = <Widget>[];
    String? last;
    for (final n in _items!) {
      final g = _group(context, n.time);
      if (g != last) {
        last = g;
        rows.add(Padding(
          padding: EdgeInsets.only(top: rows.isEmpty ? 4 : 18, bottom: 10),
          child: Text(g, style: AppText.label.copyWith(color: AppColors.mutedText, fontSize: 13)),
        ));
      }
      final index = rows.length;
      rows.add(Padding(
        padding: const EdgeInsets.only(bottom: 12),
        // Cards slide in one after another
        child: TweenAnimationBuilder<double>(
          tween: Tween(begin: 0, end: 1),
          duration: Duration(milliseconds: 380 + (index.clamp(0, 10) * 60)),
          curve: Curves.easeOutCubic,
          builder: (_, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, (1 - v) * 18), child: child)),
          child: _NotificationTile(n: n, onTap: () => _open(n)),
        ),
      ));
    }
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl), children: rows),
    );
  }
}

IconData _iconFor(String type) => switch (type) {
      'booking' => Icons.confirmation_number_rounded,
      'chat' || 'support' => Icons.chat_bubble_rounded,
      'trip' || 'private_trip' => Icons.route_rounded,
      'offer' => Icons.local_offer_rounded,
      'alert' || 'warning' => Icons.warning_amber_rounded,
      _ => Icons.notifications_rounded,
    };

Tone _toneFor(String type) => switch (type) {
      'booking' => Tone.success,
      'chat' || 'support' => Tone.primary,
      'offer' => Tone.orange,
      'alert' || 'warning' => Tone.warning,
      _ => Tone.primary,
    };

String _typeLabel(BuildContext context, String type) => switch (type) {
      'booking' => context.tr('حجز', 'Booking'),
      'chat' || 'support' => context.tr('رسالة', 'Message'),
      'trip' || 'private_trip' => context.tr('رحلة', 'Trip'),
      'offer' => context.tr('عرض', 'Offer'),
      'alert' || 'warning' => context.tr('تنبيه', 'Alert'),
      _ => context.tr('إشعار', 'Notice'),
    };

final _codePattern = RegExp(r'(?:BK[DW]|PRV)-[0-9-]+');

/// The ticket or private-trip number a notification is about, if any.
String? _codeOf(AppNotification n) => _codePattern.firstMatch('${n.title} ${n.body}')?.group(0);

/// The title without the emoji the server puts first (the icon says it) and without the trip / ticket number,
/// which is shown as its own tag.
String _cleanTitle(String title) => title
    .replaceFirst(RegExp(r'^[^\p{L}\p{N}(]+', unicode: true), '')
    .replaceAll(RegExp(r'\s*\(#?(?:BK[DW]|PRV)-[0-9-]+\)'), '')
    .trim();

/// The body as readable Arabic: numbers keep their left-to-right order inside the sentence and lose the stray "#".
String _cleanBody(String body) => body
    // replaceAllMapped: a plain replacement string would print "$1" instead of the number
    .replaceAllMapped(RegExp(r'\(#?((?:BK[DW]|PRV)-[0-9-]+)\)'), (m) => '\u2066${m.group(1)}\u2069')
    .replaceAll('#', '')
    .replaceAll(RegExp(r'\s+'), ' ')
    .trim();

/// Small left-to-right tag with the ticket / trip number.
class _CodeTag extends StatelessWidget {
  final String code;
  const _CodeTag(this.code);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(color: AppColors.primarySoft, borderRadius: BorderRadius.circular(8)),
        child: Text(code,
            textDirection: TextDirection.ltr,
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: AppColors.primary, letterSpacing: 0.3)),
      );
}

class _NotificationTile extends StatelessWidget {
  final AppNotification n;
  final VoidCallback onTap;

  const _NotificationTile({required this.n, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(_toneFor(n.type));
    final code = _codeOf(n);
    final session = ApiService.currentSession;
    final action = code == null
        ? null
        : (session?.isTourist ?? false)
            ? (code.startsWith('PRV') ? context.tr('رحلاتي الخاصة', 'My private trips') : context.tr('عرض التذكرة', 'View ticket'))
            : session?.role == 'guide'
                ? context.tr('عرض الرحلة', 'View trip')
                : null;
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: n.read ? null : [BoxShadow(color: fg.withValues(alpha: 0.12), blurRadius: 18, offset: const Offset(0, 6))],
      ),
      child: Material(
        color: n.read ? Colors.white : Color.alphaBlend(bg.withValues(alpha: 0.35), Colors.white),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Container(
            decoration: BoxDecoration(
              border: BorderDirectional(start: BorderSide(color: n.read ? Colors.transparent : AppColors.brandOrange, width: 4)),
            ),
            padding: const EdgeInsetsDirectional.fromSTEB(12, 14, 14, 14),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Stack(
                  clipBehavior: Clip.none,
                  children: [
                    Container(
                      width: 46,
                      height: 46,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(colors: [bg, Color.alphaBlend(fg.withValues(alpha: 0.18), bg)]),
                        borderRadius: BorderRadius.circular(15),
                      ),
                      child: Icon(_iconFor(n.type), color: fg, size: 23),
                    ),
                    if (!n.read)
                      PositionedDirectional(
                        top: -2,
                        end: -2,
                        child: Container(
                          width: 12,
                          height: 12,
                          decoration: BoxDecoration(color: AppColors.brandOrange, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                        ),
                      ),
                  ],
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(20)),
                            child: Text(_typeLabel(context, n.type), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: fg)),
                          ),
                          const Spacer(),
                          Icon(Icons.schedule_rounded, size: 13, color: AppColors.mutedText.withValues(alpha: 0.8)),
                          const SizedBox(width: 3),
                          Text(context.ago(n.time), style: AppText.caption.copyWith(fontSize: 11)),
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text(
                        _cleanTitle(n.title),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.label.copyWith(fontSize: 14.5, fontWeight: n.read ? FontWeight.w700 : FontWeight.w900, height: 1.45),
                      ),
                      const SizedBox(height: 3),
                      Text(_cleanBody(n.body), maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.bodyMuted.copyWith(fontSize: 12.5, height: 1.6)),
                      if (code != null) ...[
                        const SizedBox(height: 10),
                        Row(
                          children: [
                            Flexible(child: FittedBox(fit: BoxFit.scaleDown, alignment: AlignmentDirectional.centerStart, child: _CodeTag(code))),
                            if (action != null) ...[
                              const SizedBox(width: 8),
                              Container(
                                padding: const EdgeInsetsDirectional.fromSTEB(10, 4, 4, 4),
                                decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Text(action, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Colors.white)),
                                    Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, size: 16, color: Colors.white),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NotificationSheet extends StatelessWidget {
  final AppNotification n;

  /// The screen under the sheet (to navigate after the sheet closes).
  final BuildContext outer;

  const _NotificationSheet({required this.n, required this.outer});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(_toneFor(n.type));
    final code = RegExp(r'BK[DW]-\d+-\d+').firstMatch('${n.title} ${n.body}')?.group(0);
    final isTourist = ApiService.currentSession?.isTourist ?? false;
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(16)),
                child: Icon(_iconFor(n.type), color: fg, size: 26),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_typeLabel(context, n.type), style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: fg)),
                    Text(context.dateTime(n.time), style: AppText.caption),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Text(_cleanTitle(n.title), style: AppText.h2),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(AppRadius.md)),
            child: Text(_cleanBody(n.body), style: AppText.body.copyWith(height: 1.75)),
          ),
          if (code != null) ...[
            const SizedBox(height: 14),
            Material(
              color: AppColors.primarySoft,
              borderRadius: BorderRadius.circular(AppRadius.md),
              child: InkWell(
                borderRadius: BorderRadius.circular(AppRadius.md),
                onTap: () {
                  Clipboard.setData(ClipboardData(text: code));
                  showAppSnack(context, context.tr('تم نسخ رقم التذكرة', 'Ticket number copied'), tone: Tone.success);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  child: Row(
                    children: [
                      const Icon(Icons.qr_code_2_rounded, color: AppColors.primary),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(context.tr('رقم التذكرة', 'Ticket number'), style: AppText.caption.copyWith(fontSize: 11)),
                            Text(code, textDirection: TextDirection.ltr, style: const TextStyle(fontWeight: FontWeight.w900, color: AppColors.primary, letterSpacing: 0.5)),
                          ],
                        ),
                      ),
                      const Icon(Icons.copy_rounded, size: 18, color: AppColors.primary),
                    ],
                  ),
                ),
              ),
            ),
          ],
          if (code != null && isTourist) ...[
            const SizedBox(height: Gap.lg),
            AppButton(
              label: context.tr('عرض تذاكري', 'View my tickets'),
              icon: Icons.confirmation_number_outlined,
              onPressed: () {
                Navigator.pop(context);
                Navigator.of(outer).popUntil((r) => r.isFirst);
                AppScope.read(outer).touristTab.value = 2;
              },
            ),
          ],
        ],
      ),
    );
  }
}
