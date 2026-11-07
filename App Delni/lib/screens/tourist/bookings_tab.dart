import 'package:flutter/material.dart';
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
    final results = await Future.wait([ApiService.fetchMyBookings(), ApiService.fetchMyPrivateTrips()]);
    if (!mounted) return;
    setState(() {
      _loading = false;
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
                        ButtonSegment(value: 0, icon: const Icon(Icons.confirmation_number_outlined, size: 18), label: Text(context.tr('التذاكر', 'Tickets'))),
                        ButtonSegment(value: 1, icon: const Icon(Icons.auto_awesome_outlined, size: 18), label: Text(context.tr('الرحلات الخاصة', 'Private trips'))),
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
          : _segment == 0
              ? _tickets(context)
              : _privateTrips(context),
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
    final upcoming = list.where((b) => !b.isCancelled && !b.isPast).toList();
    final other = list.where((b) => b.isCancelled || b.isPast).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.md, Gap.page, Gap.xxl),
        children: [
          if (_failed) ...[OfflineBanner(onRetry: _load, busy: _loading), const SizedBox(height: Gap.md)],
          if (upcoming.isNotEmpty) ...[
            SectionHeader(title: context.tr('القادمة', 'Upcoming'), subtitle: context.tr('${upcoming.length} تذكرة', '${upcoming.length} tickets')),
            const SizedBox(height: Gap.md),
            ...upcoming.map((b) => Padding(padding: const EdgeInsets.only(bottom: Gap.lg), child: _TicketCard(booking: b, onChanged: _load))),
          ],
          if (other.isNotEmpty) ...[
            const SizedBox(height: Gap.sm),
            SectionHeader(title: context.tr('السابقة والملغاة', 'Past & cancelled')),
            const SizedBox(height: Gap.md),
            ...other.map((b) => Padding(padding: const EdgeInsets.only(bottom: Gap.lg), child: _TicketCard(booking: b, onChanged: _load))),
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
                                  style: const TextStyle(color: Color(0xFFBFDBFE), fontSize: 11, fontWeight: FontWeight.w600)),
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
        child: Text(text, style: const TextStyle(color: Color(0xFFDBEAFE), fontSize: 11, fontWeight: FontWeight.w700)),
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
    final title = t.places.isNotEmpty ? t.places.join('، ') : (t.description.isNotEmpty ? t.description : context.tr('رحلة خاصة', 'Private trip'));
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
