import 'package:flutter/material.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/contact.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/slideshow.dart';
import '../../widgets/states.dart';

/// DateTime.weekday of a stored day ("sat", "السبت", "الإثنين"...), or null.
int? _weekdayOf(String day) {
  final d = day.trim().toLowerCase().replaceAll('إ', 'ا');
  const map = {
    'sat': DateTime.saturday, 'السبت': DateTime.saturday,
    'sun': DateTime.sunday, 'الاحد': DateTime.sunday,
    'mon': DateTime.monday, 'الاثنين': DateTime.monday,
    'tue': DateTime.tuesday, 'الثلاثاء': DateTime.tuesday,
    'wed': DateTime.wednesday, 'الاربعاء': DateTime.wednesday,
    'thu': DateTime.thursday, 'الخميس': DateTime.thursday,
    'fri': DateTime.friday, 'الجمعة': DateTime.friday,
  };
  return map[d];
}

DateTime _day(DateTime d) => DateTime(d.year, d.month, d.day);

/// Whether the trip runs on [date]: a daily trip on its weekdays, a weekly / private trip inside its dates.
/// Trips the guide declined are left out.
bool guideTripRunsOn(GuideTrip t, DateTime date) {
  if (t.approvalStatus == GuideTrip.declined || !t.isActive) return false;
  final day = _day(date);
  if (t.kind == 'daily') {
    final weekdays = t.days.map(_weekdayOf).whereType<int>().toSet();
    return weekdays.isEmpty || weekdays.contains(day.weekday);
  }
  final start = DateTime.tryParse(t.startDate);
  if (start == null) return false;
  final end = t.kind == 'private'
      ? _day(start).add(Duration(days: (t.durationDays < 1 ? 1 : t.durationDays) - 1))
      : (DateTime.tryParse(t.endDate) ?? start);
  return !day.isBefore(_day(start)) && !day.isAfter(_day(end));
}

Color _kindColor(String kind) => switch (kind) {
      'weekly' => const Color(0xFF0D9488),
      'private' => AppColors.brandOrange,
      _ => AppColors.primary,
    };

String _kindLabel(BuildContext context, String kind) => switch (kind) {
      'weekly' => context.tr('أسبوعية', 'Weekly'),
      'private' => context.tr('خاصة', 'Private'),
      _ => context.tr('يومية', 'Daily'),
    };

/// "My trips calendar": a month with a coloured dot for each kind of trip on each day, and the chosen day's trips.
class GuideCalendarScreen extends StatefulWidget {
  final List<GuideTrip> trips;
  final void Function(GuideTrip) onOpen;
  final String Function(GuideTrip) titleOf;

  const GuideCalendarScreen({super.key, required this.trips, required this.onOpen, required this.titleOf});

  @override
  State<GuideCalendarScreen> createState() => _GuideCalendarScreenState();
}

class _GuideCalendarScreenState extends State<GuideCalendarScreen> {
  late DateTime _month = DateTime(DateTime.now().year, DateTime.now().month);
  late DateTime _selected = _day(DateTime.now());

  List<GuideTrip> _on(DateTime d) => widget.trips.where((t) => guideTripRunsOn(t, d)).toList();

  @override
  Widget build(BuildContext context) {
    final first = DateTime(_month.year, _month.month, 1);
    final daysInMonth = DateTime(_month.year, _month.month + 1, 0).day;
    // Saturday first, as in Libya
    final lead = (first.weekday - DateTime.saturday + 7) % 7;
    final today = _day(DateTime.now());
    final names = context.isAr ? ['س', 'ح', 'ن', 'ث', 'ر', 'خ', 'ج'] : ['Sa', 'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr'];
    final dayTrips = _on(_selected);
    final monthLabel = context.isAr
        ? '${const ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][_month.month - 1]} ${_month.year}'
        : '${const ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][_month.month - 1]} ${_month.year}';

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('تقويم رحلاتي', 'My trips calendar'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          AppCard(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 14),
            child: Column(
              children: [
                Row(
                  children: [
                    IconButton(
                      tooltip: context.tr('الشهر السابق', 'Previous month'),
                      icon: Icon(context.isAr ? Icons.chevron_right_rounded : Icons.chevron_left_rounded),
                      onPressed: () => setState(() => _month = DateTime(_month.year, _month.month - 1)),
                    ),
                    Expanded(child: Text(monthLabel, textAlign: TextAlign.center, style: AppText.h2)),
                    IconButton(
                      tooltip: context.tr('الشهر التالي', 'Next month'),
                      icon: Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded),
                      onPressed: () => setState(() => _month = DateTime(_month.year, _month.month + 1)),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(children: [
                  for (final n in names) Expanded(child: Center(child: Text(n, style: AppText.caption.copyWith(fontWeight: FontWeight.w800)))),
                ]),
                const SizedBox(height: 6),
                GridView.count(
                  crossAxisCount: 7,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 4,
                  crossAxisSpacing: 4,
                  children: [
                    for (var i = 0; i < lead; i++) const SizedBox(),
                    for (var d = 1; d <= daysInMonth; d++) _dayCell(DateTime(_month.year, _month.month, d), today),
                  ],
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 14,
                  runSpacing: 6,
                  alignment: WrapAlignment.center,
                  children: [
                    for (final k in ['daily', 'weekly', 'private'])
                      Row(mainAxisSize: MainAxisSize.min, children: [
                        Container(width: 9, height: 9, decoration: BoxDecoration(color: _kindColor(k), shape: BoxShape.circle)),
                        const SizedBox(width: 5),
                        Text(_kindLabel(context, k), style: AppText.caption.copyWith(fontSize: 11.5)),
                      ]),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: Gap.lg),
          Text(context.date(isoDate(_selected)), style: AppText.h3),
          const SizedBox(height: Gap.md),
          if (dayTrips.isEmpty)
            EmptyState(
              compact: true,
              icon: Icons.event_available_outlined,
              title: context.tr('لا توجد رحلات في هذا اليوم', 'No trips on this day'),
              message: context.tr('اختر يوماً عليه نقطة لعرض رحلاته.', 'Pick a day with a dot to see its trips.'),
            )
          else
            for (final t in dayTrips)
              Padding(
                padding: const EdgeInsets.only(bottom: Gap.md),
                child: AppCard(
                  padding: const EdgeInsets.all(10),
                  onTap: () => widget.onOpen(t),
                  child: Row(
                    children: [
                      SizedBox(
                        width: 64,
                        height: 64,
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(14),
                          child: DelniImage(t.photos.isNotEmpty ? t.photos.first : libyaSlides[t.id.hashCode.abs() % libyaSlides.length]),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                              decoration: BoxDecoration(color: _kindColor(t.kind).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(20)),
                              child: Text(_kindLabel(context, t.kind), style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: _kindColor(t.kind))),
                            ),
                            const SizedBox(height: 4),
                            Text(widget.titleOf(t), maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3),
                          ],
                        ),
                      ),
                      Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: AppColors.mutedText),
                    ],
                  ),
                ),
              ),
        ],
      ),
    );
  }

  Widget _dayCell(DateTime date, DateTime today) {
    final trips = _on(date);
    final kinds = trips.map((t) => t.kind).toSet().toList();
    final selected = date == _selected;
    final isToday = date == today;
    return InkWell(
      borderRadius: BorderRadius.circular(12),
      onTap: () => setState(() => _selected = date),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : (trips.isNotEmpty ? AppColors.primarySoft : Colors.transparent),
          borderRadius: BorderRadius.circular(12),
          border: isToday && !selected ? Border.all(color: AppColors.primary, width: 1.4) : null,
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('${date.day}',
                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: selected ? Colors.white : AppColors.navy)),
            const SizedBox(height: 2),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                for (final k in kinds.take(3))
                  Container(
                    width: 5,
                    height: 5,
                    margin: const EdgeInsets.symmetric(horizontal: 1),
                    decoration: BoxDecoration(color: selected ? Colors.white : _kindColor(k), shape: BoxShape.circle),
                  ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

/// "Trip manifest": the tourists booked on the guide's daily / weekly trips, shown straight away,
/// grouped by trip and by run date (coming dates first; past dates under "Earlier").
class GuideManifestScreen extends StatefulWidget {
  final List<GuideTrip> trips;
  final void Function(GuideTrip) onOpen;
  final String Function(GuideTrip) titleOf;

  const GuideManifestScreen({super.key, required this.trips, required this.onOpen, required this.titleOf});

  @override
  State<GuideManifestScreen> createState() => _GuideManifestScreenState();
}

class _GuideManifestScreenState extends State<GuideManifestScreen> {
  bool _past = false; // false = coming dates, true = earlier dates

  @override
  Widget build(BuildContext context) {
    final now = DateTime.now();
    final today = '${now.year.toString().padLeft(4, '0')}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')}';
    // a booking's date: its run date (daily) or the trip's start date (weekly)
    String dateOf(GuideTrip t, Passenger p) => (p.tripDate.isNotEmpty ? p.tripDate : t.startDate).split('T').first;
    bool upcoming(GuideTrip t, Passenger p) {
      if (t.kind == 'weekly' && t.endDate.isNotEmpty) return t.endDate.split('T').first.compareTo(today) >= 0;
      final d = dateOf(t, p);
      return d.isEmpty || d.compareTo(today) >= 0;
    }

    // one group per trip and date, only the chosen period
    final groups = <(GuideTrip, String, List<Passenger>)>[];
    for (final t in widget.trips.where((t) => t.kind != 'private' && t.approvalStatus != GuideTrip.declined)) {
      final byDate = <String, List<Passenger>>{};
      for (final p in t.passengers.where((p) => !p.isCancelled && upcoming(t, p) != _past)) {
        byDate.putIfAbsent(dateOf(t, p), () => []).add(p);
      }
      for (final e in byDate.entries) {
        groups.add((t, e.key, e.value));
      }
    }
    groups.sort((a, b) => _past ? b.$2.compareTo(a.$2) : a.$2.compareTo(b.$2));
    final bookings = groups.fold<int>(0, (s, g) => s + g.$3.length);
    final seats = groups.fold<int>(0, (s, g) => s + g.$3.fold<int>(0, (x, p) => x + p.seats));

    return Scaffold(
      appBar: AppBar(title: Text(context.tr('كشف سياح الرحلة', 'Trip manifest'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          SegmentedButton<bool>(
            segments: [
              ButtonSegment(value: false, label: Text(context.tr('القادمة', 'Coming')), icon: const Icon(Icons.upcoming_rounded)),
              ButtonSegment(value: true, label: Text(context.tr('السابقة', 'Earlier')), icon: const Icon(Icons.history_rounded)),
            ],
            selected: {_past},
            onSelectionChanged: (v) => setState(() => _past = v.first),
          ),
          const SizedBox(height: Gap.md),
          if (groups.isEmpty)
            EmptyState(
              icon: Icons.groups_outlined,
              title: _past ? context.tr('لا توجد حجوزات سابقة', 'No earlier bookings') : context.tr('لا يوجد سياح محجوزون بعد', 'No tourists booked yet'),
              message: context.tr('تظهر هنا أسماء السياح المحجوزين في رحلاتك اليومية والأسبوعية فور حجزهم.',
                  'The tourists booked on your daily and weekly trips appear here as soon as they book.'),
            )
          else ...[
            InlineMessage(
              tone: Tone.neutral,
              icon: Icons.groups_rounded,
              text: context.tr('$bookings حجز • $seats مقعد', '$bookings bookings • $seats seats'),
            ),
            const SizedBox(height: Gap.lg),
            for (final (trip, date, list) in groups) ...[
              _ManifestHeader(
                title: widget.titleOf(trip),
                kind: trip.kind,
                date: date.isEmpty ? '' : (date == today ? context.tr('اليوم', 'Today') : context.date(date)),
                seats: list.fold<int>(0, (s, p) => s + p.seats),
                attended: list.where((p) => p.attended).length,
                count: list.length,
                onOpen: () => widget.onOpen(trip),
              ),
              for (final p in list) _PassengerCard(p: p),
              const SizedBox(height: Gap.lg),
            ],
          ],
        ],
      ),
    );
  }
}

class _ManifestHeader extends StatelessWidget {
  final String title, kind, date;
  final int seats, attended, count;
  final VoidCallback onOpen;

  const _ManifestHeader({
    required this.title,
    required this.kind,
    required this.date,
    required this.seats,
    required this.attended,
    required this.count,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    final color = _kindColor(kind);
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.fromLTRB(12, 10, 6, 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(color: AppColors.navy)),
                const SizedBox(height: 6),
                Wrap(spacing: 6, runSpacing: 6, children: [
                  StatusBadge(label: _kindLabel(context, kind), tone: kind == 'weekly' ? Tone.success : Tone.primary, dense: true),
                  if (date.isNotEmpty) StatusBadge(label: date, tone: Tone.warning, icon: Icons.event_rounded, dense: true),
                  StatusBadge(label: context.tr('$seats مقعد', '$seats seats'), tone: Tone.neutral, icon: Icons.event_seat_rounded, dense: true),
                  StatusBadge(label: context.tr('حضر $attended من $count', '$attended of $count in'), tone: Tone.neutral, icon: Icons.how_to_reg_rounded, dense: true),
                ]),
              ],
            ),
          ),
          IconButton(
            tooltip: context.tr('تفاصيل الرحلة', 'Trip details'),
            onPressed: onOpen,
            icon: Icon(Icons.info_outline_rounded, color: color),
          ),
        ],
      ),
    );
  }
}

class _PassengerCard extends StatelessWidget {
  final Passenger p;
  const _PassengerCard({required this.p});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        padding: const EdgeInsets.all(12),
        child: Row(
          children: [
            DelniAvatar(name: p.name, size: 42),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(p.name.isEmpty ? p.bookingId : p.name, style: AppText.label),
                  const SizedBox(height: 2),
                  Text(
                    [context.tr('${p.seats} مقعد', '${p.seats} seats'), if (p.phone.isNotEmpty) p.phone].join(' • '),
                    style: AppText.caption.copyWith(fontSize: 11.5),
                  ),
                  const SizedBox(height: 6),
                  Wrap(spacing: 6, children: [
                    StatusBadge(
                      label: p.paid ? context.tr('مدفوع', 'Paid') : context.tr('غير مدفوع', 'Unpaid'),
                      tone: p.paid ? Tone.success : Tone.warning,
                      dense: true,
                    ),
                    StatusBadge(
                      label: p.attended ? context.tr('حضر', 'Checked in') : context.tr('لم يحضر بعد', 'Not in yet'),
                      tone: p.attended ? Tone.primary : Tone.neutral,
                      dense: true,
                    ),
                  ]),
                ],
              ),
            ),
            if (p.phone.isNotEmpty) CallButton(phone: p.phone, size: 40),
          ],
        ),
      ),
    );
  }
}
