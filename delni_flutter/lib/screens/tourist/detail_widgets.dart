import 'package:flutter/material.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/delni_image.dart';

/// Collapsing photo header with a page indicator, used by every details page.
class DetailHeader extends StatefulWidget {
  final List<String> photos;
  final String title;
  final IconData fallbackIcon;

  const DetailHeader({super.key, required this.photos, required this.title, this.fallbackIcon = Icons.landscape_rounded});

  @override
  State<DetailHeader> createState() => _DetailHeaderState();
}

class _DetailHeaderState extends State<DetailHeader> {
  int _page = 0;

  @override
  Widget build(BuildContext context) {
    final photos = widget.photos.isEmpty ? [''] : widget.photos;
    return SliverAppBar(
      pinned: true,
      expandedHeight: 300,
      backgroundColor: AppColors.primary,
      foregroundColor: Colors.white,
      leading: Padding(
        padding: const EdgeInsets.all(6),
        child: IconButton(
          tooltip: context.tr('رجوع', 'Back'),
          style: IconButton.styleFrom(backgroundColor: Colors.black26),
          icon: Icon(context.isAr ? Icons.arrow_forward_rounded : Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.of(context).maybePop(),
        ),
      ),
      flexibleSpace: FlexibleSpaceBar(
        collapseMode: CollapseMode.parallax,
        background: Stack(
          fit: StackFit.expand,
          children: [
            PageView.builder(
              itemCount: photos.length,
              onPageChanged: (i) => setState(() => _page = i),
              itemBuilder: (_, i) => DelniImage(photos[i], fallbackIcon: widget.fallbackIcon),
            ),
            const IgnorePointer(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    stops: [0, 0.3, 0.75, 1],
                    colors: [Color(0x66000000), Colors.transparent, Colors.transparent, Color(0x55000000)],
                  ),
                ),
              ),
            ),
            if (photos.length > 1)
              Positioned(
                bottom: 14,
                left: 0,
                right: 0,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(
                    photos.length,
                    (i) => AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      margin: const EdgeInsets.symmetric(horizontal: 3),
                      width: i == _page ? 18 : 7,
                      height: 7,
                      decoration: BoxDecoration(color: i == _page ? Colors.white : Colors.white54, borderRadius: BorderRadius.circular(8)),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class DetailSection extends StatelessWidget {
  final String title;
  final String? subtitle;

  const DetailSection({super.key, required this.title, this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: Gap.xl, bottom: Gap.md),
      child: Row(
        children: [
          Container(width: 4, height: 20, decoration: BoxDecoration(color: AppColors.brandOrange, borderRadius: BorderRadius.circular(4))),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppText.h3.copyWith(fontSize: 16)),
                if (subtitle != null) Text(subtitle!, style: AppText.caption.copyWith(fontSize: 11.5)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class ExpandableText extends StatefulWidget {
  final String text;
  const ExpandableText(this.text, {super.key});

  @override
  State<ExpandableText> createState() => _ExpandableTextState();
}

class _ExpandableTextState extends State<ExpandableText> {
  bool _open = false;

  @override
  Widget build(BuildContext context) {
    final long = widget.text.length > 220;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AnimatedSize(
          duration: const Duration(milliseconds: 250),
          alignment: Alignment.topCenter,
          child: Text(
            widget.text,
            maxLines: _open || !long ? null : 4,
            overflow: _open || !long ? null : TextOverflow.ellipsis,
            style: AppText.body.copyWith(color: const Color(0xFF334155)),
          ),
        ),
        if (long)
          TextButton(
            style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(0, 34)),
            onPressed: () => setState(() => _open = !_open),
            child: Text(_open ? context.tr('عرض أقل', 'Show less') : context.tr('اقرأ المزيد', 'Read more')),
          ),
      ],
    );
  }
}

/// Vertical itinerary like the platform's: a summary (stops, time range), the first two stops,
/// and the rest on demand. Weekly / private steps are grouped by day number.
class Timeline extends StatefulWidget {
  final List<ItineraryStep> steps;
  final bool collapsible;

  const Timeline({super.key, required this.steps, this.collapsible = true});

  @override
  State<Timeline> createState() => _TimelineState();
}

class _TimelineState extends State<Timeline> {
  bool _all = false;

  static String _hhmm(String t) => t.length > 5 ? t.substring(0, 5) : t;

  @override
  Widget build(BuildContext context) {
    final steps = widget.steps;
    final folded = widget.collapsible && !_all && steps.length > 2;
    final shown = folded ? steps.take(2).toList() : steps;
    final timed = steps.where((s) => s.dayNumber == 0 && s.time.isNotEmpty).toList();

    final widgets = <Widget>[
      Wrap(
        spacing: 8,
        runSpacing: 6,
        children: [
          StatusBadge(label: context.tr('${steps.length} محطات', '${steps.length} stops'), tone: Tone.primary, icon: Icons.place_rounded, dense: true),
          if (timed.length > 1 && _hhmm(timed.first.time) != _hhmm(timed.last.time))
            StatusBadge(
              label: '${_hhmm(timed.first.time)} ← ${_hhmm(timed.last.time)}',
              tone: Tone.orange,
              icon: Icons.schedule_rounded,
              dense: true,
            ),
        ],
      ),
      const SizedBox(height: 14),
    ];
    int? lastDay;
    for (var i = 0; i < shown.length; i++) {
      final s = shown[i];
      if (s.dayNumber > 0 && s.dayNumber != lastDay) {
        lastDay = s.dayNumber;
        widgets.add(Padding(
          padding: EdgeInsets.only(top: i == 0 ? 0 : 4, bottom: 8),
          child: StatusBadge(label: context.tr('اليوم ${s.dayNumber}', 'Day ${s.dayNumber}'), tone: Tone.orange, dense: true),
        ));
      }
      final last = i == shown.length - 1;
      final time = s.dayNumber > 0 ? '' : s.time;
      widgets.add(IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              width: 32,
              child: Column(
                children: [
                  Container(
                    width: 30,
                    height: 30,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                      border: Border.all(color: AppColors.accent, width: 2),
                    ),
                    child: Text('${steps.indexOf(s) + 1}',
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: AppColors.primary)),
                  ),
                  if (!last)
                    Expanded(
                      child: Container(
                        width: 2,
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [AppColors.accent, AppColors.brandOrange],
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Container(
                margin: EdgeInsets.only(bottom: last ? 0 : 10),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.background,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(child: Text(s.title, style: AppText.label.copyWith(fontSize: 14))),
                        if (time.isNotEmpty)
                          Container(
                            margin: const EdgeInsetsDirectional.only(start: 8),
                            padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 2),
                            decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(20)),
                            child: Text(_hhmm(time),
                                textDirection: TextDirection.ltr,
                                style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: Colors.white)),
                          ),
                      ],
                    ),
                    if (s.description.isNotEmpty) ...[
                      const SizedBox(height: 3),
                      Text(s.description, style: AppText.bodyMuted.copyWith(fontSize: 12.5)),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ));
    }
    if (widget.collapsible && steps.length > 2) {
      widgets.add(Padding(
        padding: const EdgeInsets.only(top: 12),
        child: SizedBox(
          width: double.infinity,
          child: TextButton.icon(
            style: TextButton.styleFrom(
              backgroundColor: AppColors.primarySoft,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => setState(() => _all = !_all),
            icon: Icon(_all ? Icons.expand_less_rounded : Icons.expand_more_rounded),
            label: Text(_all
                ? context.tr('إخفاء المحطات', 'Show fewer stops')
                : context.tr('عرض كل المحطات (${steps.length - 2} أخرى)', 'Show all stops (${steps.length - 2} more)')),
          ),
        ),
      ));
    }
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: widgets);
  }
}

/// Bottom bar with the price and the main action.
class BookingBar extends StatelessWidget {
  final double price;

  /// Price before a running offer (shown struck through), 0 when there is no offer.
  final double oldPrice;
  final String unit;
  final String label;
  final VoidCallback? onPressed;
  final IconData icon;

  const BookingBar({
    super.key,
    required this.price,
    this.oldPrice = 0,
    required this.unit,
    required this.label,
    required this.onPressed,
    this.icon = Icons.event_seat_rounded,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 12 + MediaQuery.of(context).padding.bottom),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: AppColors.border)),
        boxShadow: [BoxShadow(color: Color(0x14000000), blurRadius: 20, offset: Offset(0, -4))],
      ),
      child: Row(
        children: [
          if (price > 0)
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(context.tr('السعر', 'Price'), style: AppText.caption.copyWith(fontSize: 11.5)),
                  Text.rich(TextSpan(children: [
                    if (oldPrice > price)
                      TextSpan(
                        text: '${context.money(oldPrice)}  ',
                        style: AppText.caption.copyWith(decoration: TextDecoration.lineThrough, fontSize: 12),
                      ),
                    TextSpan(text: context.money(price), style: AppText.price.copyWith(fontSize: 20)),
                    TextSpan(text: ' $unit', style: AppText.caption),
                  ])),
                ],
              ),
            ),
          Expanded(
            flex: price > 0 ? 1 : 2,
            child: AppButton(label: label, icon: icon, onPressed: onPressed),
          ),
        ],
      ),
    );
  }
}
