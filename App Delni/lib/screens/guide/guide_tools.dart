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
  final d = day.trim().toLowerCase().replaceAll(RegExp('[أإآ]'), 'ا'); // الأحد، الأربعاء، الإثنين in any spelling
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

/// "Trip manifest", laid out like the platform's: one run date at a time (chosen from the dates on top),
/// each trip of that date in a summary card with its tourists under it.
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
  String? _date; // the chosen run date (yyyy-mm-dd)

  @override
  Widget build(BuildContext context) {
    final today = isoDate(DateTime.now());
    // a booking's date: its run date (daily) or the trip's start date (weekly)
    String dateOf(GuideTrip t, Passenger p) => (p.tripDate.isNotEmpty ? p.tripDate : t.startDate).split('T').first;
    bool coming(GuideTrip t, String d) {
      if (t.kind == 'weekly' && t.endDate.isNotEmpty) return t.endDate.split('T').first.compareTo(today) >= 0;
      return d.isEmpty || d.compareTo(today) >= 0;
    }

    // date -> trip -> passengers, only the chosen period
    final byDate = <String, Map<GuideTrip, List<Passenger>>>{};
    for (final t in widget.trips.where((t) => t.kind != 'private' && t.approvalStatus != GuideTrip.declined)) {
      for (final p in t.passengers.where((p) => !p.isCancelled)) {
        final d = dateOf(t, p);
        if (coming(t, d) == _past) continue;
        byDate.putIfAbsent(d, () => {}).putIfAbsent(t, () => []).add(p);
      }
    }
    // Coming: a button for every day left in this month on which one of the guide's trips runs (booked or not yet)
    if (!_past) {
      final now = DateTime.now();
      final last = DateTime(now.year, now.month + 1, 0);
      final shown = widget.trips.where((t) => t.kind != 'private' && t.approvalStatus != GuideTrip.declined).toList();
      for (var d = DateTime(now.year, now.month, now.day); !d.isAfter(last); d = d.add(const Duration(days: 1))) {
        final iso = isoDate(d);
        for (final t in shown.where((t) => guideTripRunsOn(t, d))) {
          final group = byDate.putIfAbsent(iso, () => {});
          if (t.kind == 'weekly') {
            // a weekly trip's tourists travel every day of it
            group[t] = t.passengers.where((p) => !p.isCancelled).toList();
          } else {
            group.putIfAbsent(t, () => []);
          }
        }
      }
    }
    final dates = byDate.keys.toList()..sort((a, b) => _past ? b.compareTo(a) : a.compareTo(b));
    final chosen = (_date != null && byDate.containsKey(_date)) ? _date! : (dates.isEmpty ? null : dates.first);

    String label(String d) => d.isEmpty ? context.tr('بدون تاريخ', 'No date') : (d == today ? context.tr('اليوم', 'Today') : context.date(d));

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
            onSelectionChanged: (v) => setState(() {
              _past = v.first;
              _date = null;
            }),
          ),
          const SizedBox(height: Gap.md),
          if (chosen == null)
            EmptyState(
              icon: Icons.groups_outlined,
              title: _past ? context.tr('لا توجد حجوزات سابقة', 'No earlier bookings') : context.tr('لا يوجد سياح محجوزون بعد', 'No tourists booked yet'),
              message: context.tr('تظهر هنا أسماء السياح المحجوزين في رحلاتك اليومية والأسبوعية فور حجزهم.',
                  'The tourists booked on your daily and weekly trips appear here as soon as they book.'),
            )
          else ...[
            // one chip per run date
            SizedBox(
              height: 44,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: dates.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, i) {
                  final d = dates[i];
                  final seats = byDate[d]!.values.expand((l) => l).fold<int>(0, (s, p) => s + p.seats);
                  return ChoiceChip(
                    label: Text('${label(d)} • ${context.tr('$seats مقعد', '$seats seats')}'),
                    selected: d == chosen,
                    onSelected: (_) => setState(() => _date = d),
                    selectedColor: AppColors.primary,
                    labelStyle: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: d == chosen ? Colors.white : AppColors.navy),
                    showCheckmark: false,
                  );
                },
              ),
            ),
            const SizedBox(height: Gap.lg),
            for (final entry in byDate[chosen]!.entries) ...[
              _ManifestHeader(
                title: widget.titleOf(entry.key),
                kind: entry.key.kind,
                date: label(chosen),
                seats: entry.value.fold<int>(0, (s, p) => s + p.seats),
                attendedSeats: entry.value.where((p) => p.attended).fold<int>(0, (s, p) => s + p.seats),
                onOpen: () => widget.onOpen(entry.key),
              ),
              if (entry.value.isEmpty)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    context.tr('لا توجد حجوزات في هذا الموعد بعد.', 'No bookings on this date yet.'),
                    style: AppText.caption,
                  ),
                ),
              for (final p in entry.value) _PassengerCard(p: p),
              const SizedBox(height: Gap.lg),
            ],
          ],
        ],
      ),
    );
  }
}

/// The trip's summary for the chosen date, like the platform's green card: name, date, attended / booked seats.
class _ManifestHeader extends StatelessWidget {
  final String title, kind, date;
  final int seats, attendedSeats;
  final VoidCallback onOpen;

  const _ManifestHeader({
    required this.title,
    required this.kind,
    required this.date,
    required this.seats,
    required this.attendedSeats,
    required this.onOpen,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
      decoration: BoxDecoration(
        color: const Color(0xFFECFDF5),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFA7F3D0)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(color: const Color(0xFF064E3B))),
                const SizedBox(height: 4),
                Text(
                  context.tr('${_kindLabel(context, kind)} • الموعد: $date', '${_kindLabel(context, kind)} • $date'),
                  style: AppText.caption.copyWith(color: const Color(0xFF065F46), fontSize: 11.5),
                ),
                const SizedBox(height: 4),
                Text(
                  context.tr('يُسجَّل الحضور عند تدقيق التذكرة في مكتب التذاكر.', 'Check-in is recorded when the ticket is checked at the office.'),
                  style: AppText.caption.copyWith(color: const Color(0xFF047857), fontSize: 10.5),
                ),
              ],
            ),
          ),
          Column(
            children: [
              Text('$attendedSeats / $seats', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: Color(0xFF065F46))),
              Text(context.tr('مقعد حضر', 'seats in'), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Color(0xFF059669))),
              IconButton(
                tooltip: context.tr('تفاصيل الرحلة', 'Trip details'),
                visualDensity: VisualDensity.compact,
                onPressed: onOpen,
                icon: const Icon(Icons.info_outline_rounded, color: Color(0xFF047857), size: 20),
              ),
            ],
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
                  Row(children: [
                    StatusBadge(
                      label: p.paid ? context.tr('مدفوع', 'Paid') : context.tr('نقداً بالفرع', 'Cash at office'),
                      tone: p.paid ? Tone.success : Tone.warning,
                      dense: true,
                    ),
                    const SizedBox(width: 10),
                    // a status, not a button: set by the ticket office
                    Container(
                      width: 7,
                      height: 7,
                      decoration: BoxDecoration(color: p.attended ? const Color(0xFF10B981) : AppColors.border, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      p.attended ? context.tr('حضر', 'Checked in') : context.tr('لم يحضر بعد', 'Not in yet'),
                      style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: p.attended ? const Color(0xFF047857) : AppColors.mutedText),
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
