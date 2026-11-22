import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/states.dart';
import '../shared/support_screens.dart';
import 'detail_widgets.dart';
import 'private_trip_screen.dart';
import 'tourist_shell.dart';
import '../../widgets/contact.dart';
import '../../widgets/slideshow.dart';

/// The tourist's tickets (GET /bookings/tourist/{id}) and private-trip requests (GET /private-trips).
class BookingsTab extends StatefulWidget {
  const BookingsTab({super.key});

  @override
  State<BookingsTab> createState() => _BookingsTabState();
}

class _BookingsTabState extends State<BookingsTab> {
  List<Booking>? _bookings;
  List<PrivateTripRequest>? _private;
  /// Stars and comment the tourist already gave, by trip id
  Map<String, (int, String)> _reviews = {};
  bool _failed = false;
  bool _loading = false;
  int get _segment => _segmentSignal.value;
  late final ValueNotifier<int> _segmentSignal;
  late final ValueNotifier<int> _revision;

  bool get _isTourist => ApiService.currentSession?.isTourist ?? false;

  @override
  void initState() {
    super.initState();
    _revision = AppScope.read(context).bookingsRevision..addListener(_load);
    _segmentSignal = AppScope.read(context).bookingsSegment..addListener(_onSegment);
    if (_isTourist) _load();
  }

  @override
  void dispose() {
    _revision.removeListener(_load);
    _segmentSignal.removeListener(_onSegment);
    super.dispose();
  }

  void _onSegment() {
    if (mounted) setState(() {});
  }

  Future<void> _load() async {
    if (!_isTourist || _loading) return;
    setState(() {
      _loading = true;
      _failed = false;
    });
    final results = await Future.wait([ApiService.fetchMyBookings(), ApiService.fetchMyPrivateTrips(), ApiService.fetchMyTripReviews()]);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _reviews = (results[2] as Map<String, (int, String)>?) ?? _reviews;
      _bookings = (results[0] as List<Booking>?) ?? _bookings;
      _private = (results[1] as List<PrivateTripRequest>?) ?? _private;
      _failed = results[0] == null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        centerTitle: false,
        title: Text(context.tr('حجوزاتي', 'My bookings'), style: AppText.h1),
        bottom: !_isTourist
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(56),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, 10),
                  child: SizedBox(
                    width: double.infinity,
                    child: SegmentedButton<int>(
                      showSelectedIcon: false,
                      style: SegmentedButton.styleFrom(
                        backgroundColor: Colors.white,
                        selectedBackgroundColor: AppColors.primary,
                        selectedForegroundColor: Colors.white,
                        side: const BorderSide(color: AppColors.border),
                        textStyle: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w800, fontSize: 13),
                      ),
                      segments: [
                        ButtonSegment(value: 0, icon: const Icon(Icons.confirmation_number_outlined, size: 18), label: Text(context.tr('القادمة', 'Upcoming'))),
                        ButtonSegment(
                          value: 2,
                          icon: Badge(
                            isLabelVisible: _awaitingReview > 0,
                            label: Text('$_awaitingReview'),
                            backgroundColor: AppColors.brandOrange,
                            child: const Icon(Icons.history_rounded, size: 18),
                          ),
                          label: Text(context.tr('السجل', 'History')),
                        ),
                        ButtonSegment(value: 1, icon: const Icon(Icons.auto_awesome_outlined, size: 18), label: Text(context.tr('الخاصة', 'Private'))),
                      ],
                      selected: {_segment},
                      onSelectionChanged: (s) => _segmentSignal.value = s.first,
                    ),
                  ),
                ),
              ),
      ),
      body: !_isTourist
          ? EmptyState(
              icon: Icons.confirmation_number_outlined,
              title: context.tr('تذاكرك في مكان واحد', 'All your tickets in one place'),
              message: context.tr('سجّل الدخول بحساب سائح لعرض حجوزاتك وطلبات رحلاتك الخاصة.', 'Sign in with a tourist account to see your bookings and private-trip requests.'),
              actionLabel: context.tr('تسجيل الدخول', 'Sign in'),
              onAction: () => promptTouristLogin(context),
            )
          : switch (_segment) {
              0 => _tickets(context),
              2 => _history(context),
              _ => _privateTrips(context),
            },
    );
  }

  Widget _tickets(BuildContext context) {
    final list = _bookings;
    if (list == null) return _failed ? ErrorState(onRetry: _load) : const SkeletonList(count: 2, imageHeight: 90);
    if (list.isEmpty) {
      return RefreshIndicator(
        onRefresh: _load,
        child: ListView(children: [
          EmptyState(
            icon: Icons.luggage_outlined,
            title: context.tr('لا توجد حجوزات بعد', 'No bookings yet'),
            message: context.tr('احجز رحلتك الأولى وستظهر تذكرتك هنا.', 'Book your first trip and your ticket will appear here.'),
            actionLabel: context.tr('تصفح الرحلات', 'Browse trips'),
            onAction: () => openExplore(context, 0),
          ),
        ]),
      );
    }
    final upcoming = list.where((b) => !_inHistory(b)).toList();
    final past = list.length - upcoming.length;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.md, Gap.page, Gap.xxl),
        children: [
          if (_failed) ...[OfflineBanner(onRetry: _load, busy: _loading), const SizedBox(height: Gap.md)],
          if (upcoming.isNotEmpty) ...[
            SectionHeader(title: context.tr('رحلاتك القادمة', 'Your upcoming trips'), subtitle: context.tr('${upcoming.length} تذكرة', '${upcoming.length} tickets')),
            const SizedBox(height: Gap.md),
            ...upcoming.map((b) => Padding(padding: const EdgeInsets.only(bottom: Gap.lg), child: _TicketCard(booking: b, onChanged: _load))),
          ] else
            EmptyState(
              compact: true,
              icon: Icons.luggage_outlined,
              title: context.tr('لا توجد رحلات قادمة', 'No upcoming trips'),
              message: context.tr('رحلاتك المنتهية محفوظة في السجل، وتقدر تقيّمها من هناك.', 'Your finished trips are kept in History, where you can rate them.'),
              actionLabel: context.tr('تصفح الرحلات', 'Browse trips'),
              onAction: () => openExplore(context, 0),
            ),
          if (past > 0) ...[
            const SizedBox(height: Gap.sm),
            _HistoryLink(count: past, awaiting: _awaitingReview, onTap: () => _segmentSignal.value = 2),
          ],
        ],
      ),
    );
  }

  // Finished, past or cancelled bookings live in the history
  static bool _inHistory(Booking b) => b.isCancelled || b.isPast || b.isFinished;

  int get _awaitingReview => (_bookings ?? const <Booking>[]).where((b) => b.canReview && !_reviews.containsKey(b.tripId)).length;

  Widget _history(BuildContext context) {
    final list = _bookings;
    if (list == null) return _failed ? ErrorState(onRetry: _load) : const SkeletonList(count: 2, imageHeight: 90);
    final past = list.where(_inHistory).toList();
    // Trips waiting for a rating first, then the rest, newest first
    past.sort((a, b) {
      final ra = a.canReview && !_reviews.containsKey(a.tripId) ? 0 : 1;
      final rb = b.canReview && !_reviews.containsKey(b.tripId) ? 0 : 1;
      return ra != rb ? ra - rb : b.travelDate.compareTo(a.travelDate);
    });
    final attended = past.where((b) => !b.isCancelled && b.attended).length;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.md, Gap.page, Gap.xxl),
        children: [
          if (_failed) ...[OfflineBanner(onRetry: _load, busy: _loading), const SizedBox(height: Gap.md)],
          if (past.isEmpty)
            EmptyState(
              icon: Icons.history_rounded,
              title: context.tr('سجلّك فارغ حتى الآن', 'Your history is empty'),
              message: context.tr('عند انتهاء أي رحلة حجزتها ستظهر هنا، وتستطيع تقييمها ومشاركة تجربتك.',
                  'When a trip you booked is over it appears here, and you can rate it.'),
            )
          else ...[
            _HistorySummary(total: past.length, attended: attended, awaiting: _awaitingReview),
            const SizedBox(height: Gap.lg),
            for (var i = 0; i < past.length; i++)
              Padding(
                padding: const EdgeInsets.only(bottom: Gap.lg),
                child: _HistoryCard(
                  key: ValueKey(past[i].id),
                  booking: past[i],
                  index: i,
                  review: _reviews[past[i].tripId],
                  onOpenTicket: () => _showTicket(context, past[i], _load),
                  onReviewed: (r) => setState(() => _reviews = {..._reviews, past[i].tripId: r}),
                ),
              ),
          ],
        ],
      ),
    );
  }

  Widget _privateTrips(BuildContext context) {
    final list = _private;
    if (list == null) return _failed ? ErrorState(onRetry: _load) : const SkeletonList(count: 2, imageHeight: 70);
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.md, Gap.page, Gap.xxl),
        children: [
          AppButton(
            label: context.tr('طلب رحلة خاصة جديدة', 'New private trip request'),
            icon: Icons.add_rounded,
            variant: ButtonVariant.ghost,
            onPressed: () => openPrivateTripRequest(context),
          ),
          const SizedBox(height: Gap.lg),
          if (list.isEmpty)
            EmptyState(
              compact: true,
              icon: Icons.auto_awesome_outlined,
              title: context.tr('لا توجد طلبات رحلات خاصة', 'No private-trip requests'),
              message: context.tr('اطلب رحلة مصممة لك وستتابع حالتها من هنا.', 'Request a trip designed for you and follow it here.'),
            )
          else
            ...list.map((p) => Padding(padding: const EdgeInsets.only(bottom: Gap.lg), child: _PrivateTripCard(trip: p, onChanged: _load))),
        ],
      ),
    );
  }
}

(Tone, IconData) _bookingTone(Booking b) {
  if (b.isCancelled) return (Tone.danger, Icons.cancel_outlined);
  if (b.attended) return (Tone.success, Icons.how_to_reg_rounded);
  if (b.isPast) return (Tone.neutral, Icons.history_rounded);
  return (Tone.success, Icons.check_circle_rounded);
}

/// Boarding-pass style ticket.
/// A ticket in the list, like the platform's e-ticket: the trip's photo as the header, its facts,
/// a torn edge and the stub with a real QR of the booking number.
class _TicketCard extends StatelessWidget {
  final Booking booking;
  final VoidCallback onChanged;

  const _TicketCard({required this.booking, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final (tone, icon) = _bookingTone(b);
    final dim = b.isCancelled || b.isPast;
    return Opacity(
      opacity: dim ? 0.72 : 1,
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.xl),
        clipBehavior: Clip.antiAlias,
        elevation: 0,
        child: InkWell(
          onTap: () => _showTicket(context, b, onChanged),
          child: Column(
            children: [
              SizedBox(
                height: 124,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    DelniImage(b.photo),
                    DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: AlignmentDirectional.centerStart,
                          end: AlignmentDirectional.centerEnd,
                          colors: dim
                              ? [const Color(0xE6475569), const Color(0x99475569)]
                              : [AppColors.navy.withValues(alpha: 0.92), AppColors.primary.withValues(alpha: 0.55)],
                        ),
                      ),
                    ),
                    Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Expanded(
                                child: Wrap(
                                  spacing: 6,
                                  runSpacing: 4,
                                  children: [
                                    _HeaderChip(context.tr('🎫 تذكرة إلكترونية', '🎫 E-ticket')),
                                    _HeaderChip(b.kind == 'weekly' ? context.tr('أسبوعية', 'Weekly') : context.tr('يومية', 'Daily')),
                                  ],
                                ),
                              ),
                              const SizedBox(width: 6),
                              StatusBadge(label: context.sv(b.status), tone: tone, icon: icon, dense: true),
                            ],
                          ),
                          const Spacer(),
                          Text(
                            b.tripTitle,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, height: 1.35),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 14, 14, 4),
                child: Row(
                  children: [
                    _TicketFact(icon: Icons.event_rounded, label: context.tr('التاريخ', 'Date'), value: b.travelDate.isEmpty ? '—' : context.date(b.travelDate)),
                    _TicketFact(icon: Icons.event_seat_rounded, label: context.tr('المقاعد', 'Seats'), value: '${b.seats}'),
                    _TicketFact(icon: Icons.payments_rounded, label: context.tr('الإجمالي', 'Total'), value: context.money(b.totalPrice)),
                  ],
                ),
              ),
              const _Perforation(),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(context.tr('رقم التذكرة', 'Ticket number'), style: AppText.caption.copyWith(fontSize: 10.5)),
                          Text(b.id, textDirection: TextDirection.ltr, style: AppText.label.copyWith(fontSize: 12.5, letterSpacing: 0.4)),
                          Text(context.tr('اضغط لعرض التذكرة كاملة', 'Tap to open the full ticket'),
                              style: AppText.caption.copyWith(fontSize: 11, color: AppColors.primary)),
                        ],
                      ),
                    ),
                    StatusBadge(
                      label: b.isPaid ? context.tr('مدفوع', 'Paid') : context.tr('غير مدفوع', 'Unpaid'),
                      tone: b.isPaid ? Tone.success : Tone.warning,
                      dense: true,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _HeaderChip extends StatelessWidget {
  final String text;
  const _HeaderChip(this.text);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(30)),
        child: Text(text, style: const TextStyle(color: Colors.white, fontSize: 10.5, fontWeight: FontWeight.w800)),
      );
}

class _TicketFact extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _TicketFact({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) => Expanded(
        child: Row(
          children: [
            Icon(icon, size: 18, color: AppColors.brandOrange),
            const SizedBox(width: 6),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AppText.caption.copyWith(fontSize: 10.5)),
                  Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 13)),
                ],
              ),
            ),
          ],
        ),
      );
}

class _Perforation extends StatelessWidget {
  const _Perforation();

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 20,
      child: Stack(
        alignment: Alignment.center,
        children: [
          LayoutBuilder(
            builder: (_, c) => Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(
                (c.maxWidth / 10).floor(),
                (_) => Container(width: 5, height: 1.5, color: AppColors.border),
              ),
            ),
          ),
          PositionedDirectional(start: -10, child: _notch()),
          PositionedDirectional(end: -10, child: _notch()),
        ],
      ),
    );
  }

  Widget _notch() => Container(
        width: 20,
        height: 20,
        decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.background),
      );
}

/// The e-ticket, as on Delni: header band, trip facts, seats and total, and a QR stub.
/// The QR holds the booking number only — the code the administration's camera scanner reads.
Future<void> _showTicket(BuildContext context, Booking b, VoidCallback onChanged) {
  final canCancel = !b.isCancelled && !b.isPaid && !b.isPast;
  return showAppSheet<void>(
    context,
    builder: (ctx) {
      final facts = <(IconData, String, String, String?)>[
        (
          Icons.event_rounded,
          ctx.tr('التاريخ', 'Date'),
          b.travelDate.isEmpty
              ? '—'
              : (b.kind == 'weekly' && b.endDate.isNotEmpty ? '${ctx.date(b.startDate)} — ${ctx.date(b.endDate)}' : ctx.date(b.travelDate)),
          b.departureTime.isEmpty ? null : (b.departureTime.length > 5 ? b.departureTime.substring(0, 5) : b.departureTime),
        ),
        (Icons.place_outlined, ctx.tr('الانطلاق', 'Departure'), b.departureCity.isEmpty ? '—' : b.departureCity, null),
        (Icons.explore_outlined, ctx.tr('المرشد السياحي', 'Tour guide'), b.guideName.isEmpty ? '—' : b.guideName, null),
        (
          Icons.directions_bus_rounded,
          ctx.tr('الناقل', 'Carrier'),
          b.companyName.isEmpty ? '—' : b.companyName,
          [b.vehicleType, b.vehiclePlate].where((s) => s.isNotEmpty).join(' • ').ifEmpty(null),
        ),
      ];
      return SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(26),
                border: Border.all(color: AppColors.border),
                boxShadow: AppShadows.card,
              ),
              clipBehavior: Clip.antiAlias,
              child: Column(
                children: [
                  // Header band: the trip's photos and landmarks move behind the brand colours
                  Stack(
                    children: [
                      Positioned.fill(child: PhotoSlideshow(photos: _ticketPhotos(ctx, b), showDots: false)),
                      Positioned.fill(
                        child: DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: AlignmentDirectional.centerEnd,
                              end: AlignmentDirectional.centerStart,
                              colors: [
                                AppColors.navy.withValues(alpha: 0.92),
                                AppColors.primary.withValues(alpha: 0.78),
                                const Color(0xFF1B5A78).withValues(alpha: 0.55),
                              ],
                            ),
                          ),
                        ),
                      ),
                  Container(
                    width: double.infinity,
                    constraints: const BoxConstraints(minHeight: 150),
                    padding: const EdgeInsets.all(18),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Wrap(spacing: 6, runSpacing: 6, children: [
                                _BandChip(ctx.tr('🎫 تذكرة إلكترونية', '🎫 E-ticket')),
                                _BandChip(b.kind == 'weekly' ? ctx.tr('رحلة أسبوعية', 'Weekly trip') : ctx.tr('رحلة يومية', 'Day trip')),
                              ]),
                              const SizedBox(height: 8),
                              Text(b.tripTitle, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900, height: 1.35)),
                              const SizedBox(height: 2),
                              Text(ctx.tr('دلّني · السياحة الليبية بأبهى صورها', 'Delni · Libyan tourism at its best'),
                                  style: const TextStyle(color: AppColors.onDarkSoft, fontSize: 11, fontWeight: FontWeight.w600)),
                            ],
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                          decoration: BoxDecoration(
                            color: b.isCancelled ? AppColors.destructive : const Color(0xFF34D399),
                            borderRadius: BorderRadius.circular(30),
                          ),
                          child: Text(
                            b.isCancelled ? '✕ ${ctx.sv(b.status)}' : ctx.tr('✓ مؤكدة', '✓ Confirmed'),
                            style: TextStyle(color: b.isCancelled ? Colors.white : AppColors.navy, fontSize: 11.5, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ],
                    ),
                  ),
                    ],
                  ),
                  // Facts: two per row, each row as tall as its longest text
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 14, 14, 0),
                    child: Column(
                      children: [
                        for (var r = 0; r < facts.length; r += 2)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: IntrinsicHeight(
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.stretch,
                                children: [
                                  Expanded(child: _ticketFactTile(facts[r])),
                                  const SizedBox(width: 10),
                                  Expanded(child: r + 1 < facts.length ? _ticketFactTile(facts[r + 1]) : const SizedBox()),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.accent.withValues(alpha: 0.10),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.accent.withValues(alpha: 0.2)),
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                              Text(ctx.tr('👥 المقاعد', '👥 Seats'), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF0E8C74))),
                              Text(ctx.tr('${b.seats} ${b.seats == 1 ? 'مقعد' : 'مقاعد'}', '${b.seats} seat${b.seats == 1 ? '' : 's'}'), style: AppText.h3),
                            ]),
                          ),
                          Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
                            Text(ctx.tr('💰 الإجمالي', '💰 Total'), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, color: Color(0xFF0E8C74))),
                            Text(ctx.money(b.totalPrice), style: AppText.h3),
                            Text(b.isPaid ? ctx.tr('مدفوع', 'Paid') : ctx.tr('يُدفع نقداً بمقر الشركة', 'Pay in cash at the office'),
                                style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: b.isPaid ? const Color(0xFF047857) : const Color(0xFFB45309))),
                          ]),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 6),
                  const _Perforation(),
                  // Ticket number stub (the ticket is identified by its number only)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(14, 0, 14, 16),
                    child: Column(
                      children: [
                        Text(ctx.tr('رقم التذكرة', 'Ticket number'), style: AppText.caption.copyWith(fontSize: 11.5)),
                        const SizedBox(height: 6),
                        Opacity(
                          opacity: b.isCancelled ? 0.4 : 1,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                            decoration: BoxDecoration(
                              color: AppColors.primarySoft,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.border),
                            ),
                            child: SelectableText(b.id,
                                textAlign: TextAlign.center,
                                textDirection: TextDirection.ltr,
                                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.primary, letterSpacing: 1.2)),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          b.isCancelled
                              ? ctx.tr('هذه التذكرة ملغاة ولا يمكن استخدامها', 'This ticket is cancelled and cannot be used')
                              : ctx.tr('اذكر رقم التذكرة عند نقطة الانطلاق أو بمقر الشركة لتأكيد الحجز', 'Give this ticket number at the departure point or the office to confirm your booking'),
                          textAlign: TextAlign.center,
                          style: AppText.caption.copyWith(fontSize: 11.5),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    color: const Color(0xFFF8FAFC),
                    child: Text(
                      ctx.tr('💡 يُرجى التواجد بنقطة الانطلاق قبل 30 دقيقة من الموعد', '💡 Please be at the departure point 30 minutes early'),
                      style: AppText.caption.copyWith(fontSize: 11.5),
                    ),
                  ),
                ],
              ),
            ),
            if (b.driverName.isNotEmpty || b.guidePhone.isNotEmpty) ...[
              const SizedBox(height: Gap.lg),
              AppCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                child: Column(
                  children: [
                    if (b.guidePhone.isNotEmpty)
                      InfoRow(
                        icon: Icons.badge_outlined,
                        label: ctx.tr('هاتف المرشد', 'Guide phone'),
                        value: b.guidePhone,
                        ltrValue: true,
                        trailing: CallButton(phone: b.guidePhone),
                      ),
                    if (b.driverName.isNotEmpty)
                      InfoRow(
                        icon: Icons.person_pin_circle_outlined,
                        label: ctx.tr('السائق', 'Driver'),
                        value: b.driverName,
                        trailing: b.driverPhone.isEmpty ? null : CallButton(phone: b.driverPhone),
                      ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: Gap.xl),
            if (canCancel)
              AppButton(
                label: ctx.tr('إلغاء الحجز', 'Cancel booking'),
                icon: Icons.cancel_outlined,
                variant: ButtonVariant.danger,
                onPressed: () async {
                  final ok = await confirmDialog(
                    ctx,
                    title: ctx.tr('إلغاء الحجز', 'Cancel booking'),
                    message: ctx.tr('سيتم إلغاء حجزك وإتاحة المقاعد للحجز من جديد. هل أنت متأكد؟', 'Your booking will be cancelled and the seats released. Are you sure?'),
                    confirmLabel: ctx.tr('نعم، ألغِ الحجز', 'Yes, cancel'),
                    danger: true,
                    icon: Icons.cancel_outlined,
                  );
                  if (!ok || !ctx.mounted) return;
                  final res = await ApiService.cancelBooking(b);
                  if (!ctx.mounted) return;
                  Navigator.pop(ctx);
                  showAppSnack(
                    context,
                    res.success ? (res.message.isEmpty ? ctx.tr('تم إلغاء الحجز', 'Booking cancelled') : res.message) : res.message,
                    tone: res.success ? Tone.success : Tone.danger,
                  );
                  if (res.success) onChanged();
                },
              )
            else if (b.isPaid && !b.isCancelled && !b.isPast)
              InlineMessage(
                tone: Tone.neutral,
                text: ctx.tr('تم سداد هذا الحجز؛ الإلغاء والاسترداد يتمان عن طريق إدارة دلّني.', 'This booking is paid; cancellation and refund are handled by the Delni team.'),
              ),
          ],
        ),
      );
    },
  );
}

class _BandChip extends StatelessWidget {
  final String text;
  const _BandChip(this.text);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(30)),
        child: Text(text, style: const TextStyle(color: AppColors.onDarkSoft, fontSize: 11, fontWeight: FontWeight.w700)),
      );
}

extension on String {
  String? ifEmpty(String? other) => isEmpty ? other : this;
}

class _PrivateTripCard extends StatefulWidget {
  final PrivateTripRequest trip;
  final VoidCallback onChanged;

  const _PrivateTripCard({required this.trip, required this.onChanged});

  @override
  State<_PrivateTripCard> createState() => _PrivateTripCardState();
}

class _PrivateTripCardState extends State<_PrivateTripCard> {
  bool _busy = false;

  Tone get _tone {
    final t = widget.trip;
    if (t.isClosed) return Tone.danger;
    if (t.status == PrivateTripRequest.confirmed) return Tone.success;
    if (t.awaitsTouristDecision) return Tone.orange;
    return Tone.primary;
  }

  Future<void> _decide(String decision) async {
    final confirm = decision == PrivateTripRequest.confirmed;
    final ok = await confirmDialog(
      context,
      title: confirm ? context.tr('تأكيد الرحلة', 'Confirm trip') : context.tr('إلغاء الطلب', 'Cancel request'),
      message: confirm
          ? context.tr('بتأكيدك توافق على البرنامج والتسعيرة المرسلة من الإدارة.', 'By confirming you accept the program and price sent by the team.')
          : context.tr('هل تريد إلغاء طلب الرحلة الخاصة؟', 'Do you want to cancel this private-trip request?'),
      confirmLabel: confirm ? context.tr('تأكيد', 'Confirm') : context.tr('إلغاء الطلب', 'Cancel request'),
      danger: !confirm,
      icon: confirm ? Icons.check_circle_outline_rounded : Icons.cancel_outlined,
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    final res = await ApiService.decidePrivateTrip(widget.trip.id, decision);
    if (!mounted) return;
    setState(() => _busy = false);
    showAppSnack(context, res.message.isEmpty ? context.tr('تم التحديث', 'Updated') : res.message, tone: res.success ? Tone.success : Tone.danger);
    if (res.success) widget.onChanged();
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.trip;
    final title = t.places.isNotEmpty ? t.places.join(context.isAr ? '، ' : ', ') : (t.description.isNotEmpty ? t.description : context.tr('رحلة خاصة', 'Private trip'));
    final total = t.quotedPrice + t.additionalExpenses;
    return AppCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const IconBubble(icon: Icons.auto_awesome_rounded, tone: Tone.orange, size: 42),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3),
                    Text(t.id, textDirection: TextDirection.ltr, style: AppText.caption.copyWith(fontSize: 11)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          StatusBadge(label: context.sv(t.status), tone: _tone),
          const SizedBox(height: 12),
          Wrap(
            spacing: 14,
            runSpacing: 6,
            children: [
              if (t.startDate.isNotEmpty) MetaItem(icon: Icons.event_rounded, text: context.date(t.startDate)),
              MetaItem(icon: Icons.schedule_rounded, text: context.tr('${t.durationDays} أيام', '${t.durationDays} days')),
              MetaItem(icon: Icons.groups_rounded, text: context.tr('${t.companions} أشخاص', '${t.companions} people')),
              if (t.guideName.isNotEmpty) MetaItem(icon: Icons.badge_outlined, text: t.guideName),
            ],
          ),
          if (t.stations.isNotEmpty) ...[
            const SizedBox(height: 12),
            ExpansionTile(
              tilePadding: EdgeInsets.zero,
              childrenPadding: const EdgeInsets.only(bottom: 8),
              shape: const Border(),
              collapsedShape: const Border(),
              title: Text(context.tr('البرنامج المقترح', 'Proposed program'), style: AppText.label),
              children: [Timeline(steps: t.stations)],
            ),
          ],
          if (total > 0) ...[
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  Expanded(child: Text(context.tr('التسعيرة المقترحة', 'Quoted price'), style: AppText.bodyMuted)),
                  Text(context.money(total), style: AppText.price.copyWith(fontSize: 17)),
                ],
              ),
            ),
          ],
          if (!t.isClosed) ...[
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: context.tr('إلغاء الطلب', 'Cancel'),
                    variant: ButtonVariant.danger,
                    height: 44,
                    onPressed: _busy ? null : () => _decide(PrivateTripRequest.cancelledByTourist),
                  ),
                ),
                if (t.awaitsTouristDecision) ...[
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: context.tr('تأكيد الرحلة', 'Confirm'),
                      variant: ButtonVariant.success,
                      height: 44,
                      loading: _busy,
                      onPressed: () => _decide(PrivateTripRequest.confirmed),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}


/// One fact of the e-ticket (icon, label, value and an optional second line).
Widget _ticketFactTile((IconData, String, String, String?) f) => Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF8FAFC),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFF1F5F9)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Icon(f.$1, size: 13, color: AppColors.mutedText),
            const SizedBox(width: 4),
            Flexible(child: Text(f.$2, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption.copyWith(fontSize: 10.5))),
          ]),
          const SizedBox(height: 3),
          Text(f.$3, style: AppText.label.copyWith(fontSize: 12.5, height: 1.35)),
          if (f.$4 != null) ...[
            const SizedBox(height: 2),
            Text(f.$4!, style: AppText.caption.copyWith(fontSize: 10.5, height: 1.3)),
          ],
        ],
      ),
    );

/// The booked trip's photos and its landmarks' pictures (from the loaded catalog), the booking photo first.
List<String> _ticketPhotos(BuildContext context, Booking b) {
  final trips = AppScope.read(context).catalog.trips ?? const <Trip>[];
  Trip? trip;
  for (final t in trips) {
    if (t.id == b.tripId) {
      trip = t;
      break;
    }
  }
  return [
    b.photo,
    ...?trip?.photos,
    ...?trip?.places.map((p) => p.image),
  ].where((p) => p.trim().isNotEmpty).toList();
}

// ---------------------------------------------------------------------------
// Trip history: finished and cancelled bookings, rated from here
// ---------------------------------------------------------------------------

const _starGold = Color(0xFFF59E0B);

String _starsLabel(BuildContext context, int n) => switch (n) {
      5 => context.tr('ممتازة جداً 🌟', 'Excellent 🌟'),
      4 => context.tr('جيدة جداً 👍', 'Very good 👍'),
      3 => context.tr('مقبولة 👌', 'Okay 👌'),
      2 => context.tr('تحتاج تحسين ⚠️', 'Needs work ⚠️'),
      _ => context.tr('غير مرضية 👎', 'Disappointing 👎'),
    };

/// "History" shortcut under the upcoming tickets.
class _HistoryLink extends StatelessWidget {
  final int count;
  final int awaiting;
  final VoidCallback onTap;
  const _HistoryLink({required this.count, required this.awaiting, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppRadius.lg), border: Border.all(color: AppColors.border)),
          child: Row(
            children: [
              const IconBubble(icon: Icons.history_rounded, tone: Tone.primary, size: 42),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(context.tr('سجل رحلاتك السابقة', 'Your trip history'), style: AppText.label),
                    Text(
                      awaiting > 0
                          ? context.tr('$count رحلة · $awaiting تنتظر تقييمك ⭐', '$count trips · $awaiting waiting for your rating ⭐')
                          : context.tr('$count رحلة في السجل', '$count trips in history'),
                      style: AppText.caption.copyWith(color: awaiting > 0 ? AppColors.brandOrange : null, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
              Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: AppColors.primary),
            ],
          ),
        ),
      ),
    );
  }
}

/// The history's header: how many trips, how many attended and how many still to rate.
class _HistorySummary extends StatelessWidget {
  final int total;
  final int attended;
  final int awaiting;
  const _HistorySummary({required this.total, required this.attended, required this.awaiting});

  @override
  Widget build(BuildContext context) {
    Widget stat(String value, String label) => Expanded(
          child: Column(
            children: [
              Text(value, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900, height: 1.1)),
              const SizedBox(height: 2),
              Text(label, textAlign: TextAlign.center, style: const TextStyle(color: AppColors.onDarkSoft, fontSize: 11, fontWeight: FontWeight.w700)),
            ],
          ),
        );
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        gradient: const LinearGradient(colors: [AppColors.navy, AppColors.primary]),
        boxShadow: AppShadows.soft,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.history_rounded, color: Colors.white, size: 20),
              const SizedBox(width: 6),
              Text(context.tr('سجل رحلاتك', 'Your trip history'),
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w900)),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              stat('$total', context.tr('رحلة في السجل', 'trips')),
              stat('$attended', context.tr('شاركت فيها', 'attended')),
              stat('$awaiting', context.tr('تنتظر تقييمك', 'to rate')),
            ],
          ),
          if (awaiting > 0) ...[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(12)),
              child: Text(
                context.tr('⭐ اضغط على النجوم في بطاقة الرحلة لتقييمها، فرأيك يساعد السياح الآخرين.',
                    '⭐ Tap the stars on a trip to rate it — it helps other travellers.'),
                style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700, height: 1.5),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// A finished (or cancelled) trip: its photo, date and status, and the stars the tourist gave or can give.
class _HistoryCard extends StatelessWidget {
  final Booking booking;
  final int index;
  final (int, String)? review;
  final VoidCallback onOpenTicket;
  final ValueChanged<(int, String)> onReviewed;

  const _HistoryCard({
    super.key,
    required this.booking,
    required this.index,
    required this.review,
    required this.onOpenTicket,
    required this.onReviewed,
  });

  Future<void> _rate(BuildContext context, int stars) async {
    final result = await showAppSheet<(int, String)>(
      context,
      builder: (_) => _ReviewSheet(booking: booking, initialStars: stars, initialComment: review?.$2 ?? ''),
    );
    if (result == null || !context.mounted) return;
    onReviewed(result);
    showAppSnack(context, context.tr('شكراً لك! تم حفظ تقييمك ⭐', 'Thank you! Your rating is saved ⭐'), tone: Tone.success);
  }

  @override
  Widget build(BuildContext context) {
    final b = booking;
    final cancelled = b.isCancelled;
    final (chipColor, chipText, chipLabel) = cancelled
        ? (AppColors.destructive, Colors.white, context.sv(b.status))
        : b.attended
            ? (const Color(0xFF34D399), AppColors.navy, context.tr('✓ شاركت فيها', '✓ Attended'))
            : (const Color(0xFFBAE6FD), AppColors.navy, context.tr('✓ رحلة منتهية', '✓ Completed'));

    final card = Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppRadius.xl),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onOpenTicket,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 118,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  ColorFiltered(
                    colorFilter: cancelled
                        ? const ColorFilter.matrix([0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0.33, 0.33, 0.33, 0, 0, 0, 0, 0, 1, 0])
                        : const ColorFilter.mode(Colors.transparent, BlendMode.dst),
                    child: DelniImage(b.photo),
                  ),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.bottomCenter,
                        end: Alignment.topCenter,
                        colors: [Color(0xE60B1727), Color(0x330B1727)],
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            _HeaderChip(b.kind == 'weekly' ? context.tr('أسبوعية', 'Weekly') : context.tr('يومية', 'Daily')),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                              decoration: BoxDecoration(color: chipColor, borderRadius: BorderRadius.circular(30)),
                              child: Text(chipLabel, style: TextStyle(color: chipText, fontSize: 10.5, fontWeight: FontWeight.w900)),
                            ),
                          ],
                        ),
                        const Spacer(),
                        Text(
                          b.tripTitle,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontSize: 15.5, fontWeight: FontWeight.w900),
                        ),
                        Text(
                          '${b.travelDate.isEmpty ? '—' : context.date(b.travelDate)}  ·  ${b.id}',
                          style: const TextStyle(color: AppColors.onDarkSoft, fontSize: 11, fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12),
              child: b.canReview
                  ? _rateBox(context)
                  : Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFFF8FAFC), borderRadius: BorderRadius.circular(12)),
                      child: Text(
                        cancelled
                            ? context.tr('🚫 أُلغي هذا الحجز، لذلك لا يمكن تقييم الرحلة.', '🚫 This booking was cancelled, so it cannot be rated.')
                            : !b.isFinished
                                ? context.tr('⏳ التقييم يُتاح بعد انتهاء الرحلة.', '⏳ Rating opens once the trip is over.')
                                : context.tr('ℹ️ التقييم متاح لمن حضر الرحلة فقط (يُسجَّل الحضور عند تأكيد التذكرة بمكتب الشركة).',
                                    'ℹ️ Only travellers whose attendance was recorded can rate the trip.'),
                        style: AppText.caption.copyWith(fontSize: 11.5, height: 1.5),
                      ),
                    ),
            ),
          ],
        ),
      ),
    );

    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 350 + (index.clamp(0, 6)) * 80),
      curve: Curves.easeOutCubic,
      builder: (_, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 20 * (1 - v)), child: child)),
      child: card,
    );
  }

  Widget _rateBox(BuildContext context) {
    final mine = review;
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 10),
      decoration: BoxDecoration(
        color: mine != null ? const Color(0xFFFFFBEB) : const Color(0xFFFFF7ED),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: _starGold.withValues(alpha: mine != null ? 0.35 : 0.6)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  mine != null ? context.tr('تقييمك لهذه الرحلة', 'Your rating') : context.tr('كيف كانت رحلتك؟ قيّمها', 'How was it? Rate this trip'),
                  style: AppText.label.copyWith(fontSize: 12.5, color: const Color(0xFF92400E)),
                ),
              ),
              _StarRow(value: mine?.$1 ?? 0, size: 28, onTap: (n) => _rate(context, n)),
            ],
          ),
          if (mine != null) ...[
            if (mine.$2.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text('«${mine.$2}»', maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.caption.copyWith(fontSize: 11.5)),
            ],
            Align(
              alignment: AlignmentDirectional.centerEnd,
              child: TextButton.icon(
                onPressed: () => _rate(context, mine.$1),
                icon: const Icon(Icons.edit_rounded, size: 16),
                label: Text(context.tr('تعديل تقييمك', 'Edit your rating'),
                    style: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w800, fontSize: 12)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Five stars that grow when touched; [onTap] gets the star number (1–5).
class _StarRow extends StatelessWidget {
  final int value;
  final double size;
  final ValueChanged<int> onTap;
  const _StarRow({required this.value, required this.onTap, this.size = 28});

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.ltr,
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          for (var n = 1; n <= 5; n++)
            GestureDetector(
              behavior: HitTestBehavior.opaque,
              onTap: () => onTap(n),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 1.5),
                child: AnimatedScale(
                  scale: n <= value ? 1.08 : 1,
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.easeOutBack,
                  child: Icon(
                    n <= value ? Icons.star_rounded : Icons.star_outline_rounded,
                    size: size,
                    color: n <= value ? _starGold : const Color(0xFFCBD5E1),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Stars and an optional comment for a finished trip; pops (stars, comment) once the server saved it.
class _ReviewSheet extends StatefulWidget {
  final Booking booking;
  final int initialStars;
  final String initialComment;
  const _ReviewSheet({required this.booking, required this.initialStars, required this.initialComment});

  @override
  State<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends State<_ReviewSheet> with SingleTickerProviderStateMixin {
  late int _stars = widget.initialStars.clamp(1, 5);
  late final _comment = TextEditingController(text: widget.initialComment);
  final Set<String> _tags = {};
  bool _busy = false;
  bool _done = false;
  String? _error;
  // the face pops each time the rating changes
  late final AnimationController _pop = AnimationController(vsync: this, duration: const Duration(milliseconds: 380));

  static const _faces = ['😞', '😕', '😐', '😊', '🤩'];
    static const _inks = [Color(0xFFB91C1C), Color(0xFFC2410C), Color(0xFFA16207), Color(0xFF15803D), Color(0xFF047857)];

  // Quick words: good things for 4–5 stars, things to improve below that
  List<String> _quickTags(BuildContext context) => _stars >= 4
      ? [
          context.tr('تنظيم ممتاز', 'Well organised'),
          context.tr('مرشد رائع', 'Great guide'),
          context.tr('نقل مريح', 'Comfortable transport'),
          context.tr('معالم مذهلة', 'Amazing sights'),
          context.tr('يستحق السعر', 'Worth the price'),
          context.tr('أنصح بها', 'Recommended'),
        ]
      : [
          context.tr('تأخر في المواعيد', 'Delays'),
          context.tr('النقل يحتاج تحسين', 'Transport needs work'),
          context.tr('البرنامج مزدحم', 'Too packed'),
          context.tr('السعر مرتفع', 'Too pricey'),
          context.tr('ضعف التواصل', 'Poor communication'),
        ];

  @override
  void dispose() {
    _comment.dispose();
    _pop.dispose();
    super.dispose();
  }

  void _setStars(int n) {
    if (n == _stars) return;
    HapticFeedback.selectionClick();
    setState(() {
      // the quick words of the other mood no longer fit
      if ((n >= 4) != (_stars >= 4)) _tags.clear();
      _stars = n;
    });
    _pop.forward(from: 0);
  }

  Future<void> _submit() async {
    setState(() {
      _busy = true;
      _error = null;
    });
    final text = [if (_tags.isNotEmpty) _tags.join(' • '), _comment.text.trim()].where((s) => s.isNotEmpty).join('\n');
    final res = await ApiService.submitTripReview(widget.booking, stars: _stars, comment: text);
    if (!mounted) return;
    if (res.success) {
      HapticFeedback.mediumImpact();
      setState(() => _done = true);
      await Future.delayed(const Duration(milliseconds: 1100));
      if (mounted) Navigator.pop(context, (_stars, text));
    } else {
      setState(() {
        _busy = false;
        _error = res.message.isEmpty ? context.tr('تعذّر حفظ التقييم، حاول مرة أخرى.', 'Could not save the rating, try again.') : res.message;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final b = widget.booking;
    final k = _stars - 1;
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 350),
      child: _done ? _successView(context) : SingleChildScrollView(
        key: const ValueKey('form'),
        padding: EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl + MediaQuery.of(context).viewInsets.bottom),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(context.tr('كيف كانت رحلتك؟', 'How was your trip?'), textAlign: TextAlign.center, style: AppText.h3),
            Text(b.tripTitle, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption),
            const SizedBox(height: Gap.lg),
            // Stars, with one soft line under them that follows the rating
            AnimatedBuilder(
              animation: _pop,
              builder: (_, child) {
                final t = _pop.value;
                final s = t == 0 ? 1.0 : 1 + 0.06 * Curves.easeOut.transform((t < 0.4 ? t / 0.4 : (1 - t) / 0.6).clamp(0.0, 1.0));
                return Transform.scale(scale: s, child: child);
              },
              child: Center(child: _StarRow(value: _stars, size: 38, onTap: _setStars)),
            ),
            const SizedBox(height: 6),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Text(
                '${_faces[k]}  ${_starsLabel(context, _stars).replaceAll(RegExp(r'\s*[^\s؀-ۿa-zA-Z]+$'), '')}',
                key: ValueKey(_stars),
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: _inks[k]),
              ),
            ),
            const SizedBox(height: Gap.lg),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 250),
              child: Wrap(
                key: ValueKey(_stars >= 4),
                alignment: WrapAlignment.center,
                spacing: 6,
                runSpacing: 6,
                children: [
                  for (final t in _quickTags(context))
                    GestureDetector(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        setState(() => _tags.contains(t) ? _tags.remove(t) : _tags.add(t));
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: _tags.contains(t) ? AppColors.primarySoft : Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _tags.contains(t) ? AppColors.primary.withValues(alpha: 0.4) : AppColors.border),
                        ),
                        child: Text(
                          t,
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: _tags.contains(t) ? AppColors.primary : AppColors.mutedText,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: Gap.lg),
            TextField(
              controller: _comment,
              maxLines: 2,
              maxLength: 400,
              decoration: InputDecoration(
                hintText: context.tr('أضف تفاصيل تجربتك (اختياري)', 'Add details of your experience (optional)'),
              ),
            ),
            if (_error != null) ...[
              const SizedBox(height: Gap.sm),
              InlineMessage(tone: Tone.danger, text: _error!),
            ],
            const SizedBox(height: Gap.md),
            AppButton(
              label: context.tr('إرسال التقييم', 'Send rating'),
              icon: Icons.send_rounded,
              loading: _busy,
              onPressed: _busy ? null : _submit,
            ),
            const SizedBox(height: 6),
            Text(
              context.tr('يظهر تقييمك في صفحة الرحلة لباقي السياح.', 'Your rating appears on the trip page for other travellers.'),
              textAlign: TextAlign.center,
              style: AppText.caption.copyWith(fontSize: 11),
            ),
          ],
        ),
      ),
    );
  }

  Widget _successView(BuildContext context) => Padding(
        key: const ValueKey('done'),
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xxl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TweenAnimationBuilder<double>(
              tween: Tween(begin: 0, end: 1),
              duration: const Duration(milliseconds: 600),
              curve: Curves.elasticOut,
              builder: (_, v, child) => Transform.scale(scale: v, child: child),
              child: Container(
                width: 96,
                height: 96,
                decoration: const BoxDecoration(color: Color(0xFFD1FAE5), shape: BoxShape.circle),
                child: const Icon(Icons.check_rounded, size: 58, color: Color(0xFF047857)),
              ),
            ),
            const SizedBox(height: Gap.lg),
            Text(context.tr('شكراً لك! 🎉', 'Thank you! 🎉'), style: AppText.h2),
            const SizedBox(height: 4),
            Text(
              context.tr('تم حفظ تقييمك ويساعد السياح الآخرين على الاختيار.', 'Your rating is saved and helps other travellers choose.'),
              textAlign: TextAlign.center,
              style: AppText.bodyMuted,
            ),
            const SizedBox(height: Gap.md),
            _StarRow(value: _stars, size: 30, onTap: (_) {}),
          ],
        ),
      );
}
