import 'package:flutter/material.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
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

/// "Trip manifest": each assigned daily / weekly trip with its bookings and seats; opening one shows its passengers.
class GuideManifestScreen extends StatelessWidget {
  final List<GuideTrip> trips;
  final void Function(GuideTrip) onOpen;
  final String Function(GuideTrip) titleOf;

  const GuideManifestScreen({super.key, required this.trips, required this.onOpen, required this.titleOf});

  @override
  Widget build(BuildContext context) {
    final list = trips.where((t) => t.kind != 'private' && t.approvalStatus != GuideTrip.declined).toList()
      ..sort((a, b) => b.bookedSeats.compareTo(a.bookedSeats));
    final seats = list.fold<int>(0, (s, t) => s + t.bookedSeats);
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('كشف سياح الرحلة', 'Trip manifest'))),
      body: list.isEmpty
          ? EmptyState(
              icon: Icons.groups_outlined,
              title: context.tr('لا توجد رحلات مسندة', 'No assigned trips'),
              message: context.tr('يظهر هنا كشف المسافرين لكل رحلة يومية أو أسبوعية مسندة إليك.', 'The passenger list of each daily or weekly trip assigned to you appears here.'),
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
              children: [
                InlineMessage(
                  tone: Tone.neutral,
                  icon: Icons.groups_rounded,
                  text: context.tr('${list.length} رحلات • $seats مقعد محجوز. اضغط على رحلة لعرض أسماء المسافرين وأرقامهم.',
                      '${list.length} trips • $seats booked seats. Tap a trip for the passengers and their numbers.'),
                ),
                const SizedBox(height: Gap.lg),
                for (final t in list)
                  Padding(
                    padding: const EdgeInsets.only(bottom: Gap.md),
                    child: AppCard(
                      padding: const EdgeInsets.all(12),
                      onTap: () => onOpen(t),
                      child: Row(
                        children: [
                          Container(
                            width: 52,
                            height: 52,
                            alignment: Alignment.center,
                            decoration: BoxDecoration(color: _kindColor(t.kind).withValues(alpha: 0.12), borderRadius: BorderRadius.circular(16)),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text('${t.bookedSeats}', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: _kindColor(t.kind), height: 1.1)),
                                Text(context.tr('مقعد', 'seats'), style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: _kindColor(t.kind))),
                              ],
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(titleOf(t), maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3),
                                const SizedBox(height: 2),
                                Text(
                                  context.tr(
                                    '${_kindLabel(context, t.kind)} • ${t.passengers.where((p) => !p.isCancelled).length} حجز • ${t.passengers.where((p) => p.attended).length} حضروا',
                                    '${_kindLabel(context, t.kind)} • ${t.passengers.where((p) => !p.isCancelled).length} bookings • ${t.passengers.where((p) => p.attended).length} checked in',
                                  ),
                                  style: AppText.caption,
                                ),
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
}
