import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/favorite_heart.dart';
import '../../widgets/cards.dart';
import '../../widgets/common.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/states.dart';
import '../shared/support_screens.dart';
import 'detail_screens.dart';
import 'detail_widgets.dart';
import '../../widgets/contact.dart';

class TripDetailsScreen extends StatelessWidget {
  final Trip trip;
  const TripDetailsScreen({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final closed = !t.isWeekly ? t.openDates.isEmpty : t.availableSeats <= 0;
    final offerNow = t.offerAppliesNow;
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          DetailHeader(photos: t.photos, title: t.title, action: FavoriteHeart(type: FavoriteHeart.tripType(t), itemId: t.id, size: 40)),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      StatusBadge(
                        label: tripKindLabel(context, t.type),
                        tone: t.isWeekly ? Tone.orange : Tone.primary,
                        icon: t.isWeekly ? Icons.date_range_rounded : Icons.wb_sunny_rounded,
                      ),
                      const Spacer(),
                      RatingLine(rating: t.ratingAvg, count: t.reviewsCount),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(t.title, style: AppText.h1),
                  const SizedBox(height: Gap.lg),
                  _FactsRow(trip: t),
                  if (t.activeOffer != null) ...[const SizedBox(height: Gap.lg), OfferCard(offer: t.activeOffer!)],
                  if (t.description.isNotEmpty) ...[
                    DetailSection(title: context.tr('عن الرحلة', 'About the trip')),
                    ExpandableText(t.description),
                  ],
                  if (!t.isWeekly && t.openDates.isNotEmpty) ...[
                    DetailSection(
                      title: context.tr('مواعيد الانطلاق', 'Departure dates'),
                      subtitle: context.tr(
                        'مواعيد الشهر الحالي، ويُغلق الحجز الساعة 7 صباحاً يوم الرحلة',
                        "This month's dates; booking closes at 7:00 AM on the trip day",
                      ),
                    ),
                    SizedBox(
                      height: 92,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: t.openDates.length,
                        separatorBuilder: (_, __) => const SizedBox(width: 10),
                        itemBuilder: (_, i) => _DateChip(date: t.openDates[i], trip: t),
                      ),
                    ),
                  ],
                  if (t.itinerary.isNotEmpty) ...[
                    DetailSection(title: context.tr('برنامج الرحلة', 'Itinerary')),
                    Timeline(steps: t.itinerary),
                  ],
                  if (t.places.isNotEmpty) ...[
                    DetailSection(
                      title: context.tr('المعالم التي تزورها الرحلة', 'Landmarks on this trip'),
                      subtitle: context.tr('اضغط على أي معلم للتعرف عليه أكثر', 'Tap a landmark to learn more'),
                    ),
                    _LandmarkCards(places: t.places),
                  ],
                  _IncludedPartners(trip: t),
                  if (t.guideName.isNotEmpty || t.hasVehicle || t.driverName.isNotEmpty) ...[
                    DetailSection(title: context.tr('فريق الرحلة', 'Trip team')),
                    _TeamCard(trip: t),
                  ],
                  _TripReviews(trip: t),
                  _NearbyPartners(trip: t),
                  const SizedBox(height: Gap.xl),
                  InlineMessage(
                    tone: Tone.neutral,
                    icon: Icons.payments_outlined,
                    text: context.tr(
                      'الدفع نقداً بمقر الشركة قبل موعد الرحلة. السعر النهائي يُحتسب تلقائياً شاملاً أي عرض ساري على موعد رحلتك.',
                      'Payment is in cash at the office before the trip. The final price is calculated automatically, including any offer on your date.',
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BookingBar(
        price: offerNow ? t.offerPrice : t.price,
        oldPrice: offerNow ? t.price : 0,
        unit: context.tr('/ مقعد', '/ seat'),
        label: closed ? context.tr('الحجز مغلق', 'Booking closed') : context.tr('احجز الآن', 'Book now'),
        onPressed: closed ? null : () => startBooking(context, t),
      ),
    );
  }
}

/// The trip's promotional offer and its period (the platform's orange offer card).
class OfferCard extends StatelessWidget {
  final TripOffer offer;
  const OfferCard({super.key, required this.offer});

  @override
  Widget build(BuildContext context) {
    final pct = offer.discount == offer.discount.roundToDouble() ? offer.discount.toInt().toString() : offer.discount.toString();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.lg),
        gradient: const LinearGradient(colors: [AppColors.brandOrange, Color(0xFFC56A3D)]),
        boxShadow: AppShadows.soft,
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  context.tr('🏷️ عرض ترويجي على هذه الرحلة', '🏷️ Promotion on this trip'),
                  style: const TextStyle(color: Colors.white70, fontSize: 11.5, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 2),
                if (offer.title.isNotEmpty)
                  Text(offer.title, style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900, height: 1.4)),
                const SizedBox(height: 4),
                Text(
                  context.tr(
                    'من ${context.date(offer.startDate)} إلى ${context.date(offer.endDate)} — يُطبق الخصم تلقائياً عند حجز موعد ضمن هذه الفترة',
                    '${context.date(offer.startDate)} → ${context.date(offer.endDate)} — applied automatically to dates in this period',
                  ),
                  style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w600, height: 1.5),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(18)),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  '-$pct%',
                  textDirection: TextDirection.ltr,
                  style: const TextStyle(color: Color(0xFFC56A3D), fontSize: 20, fontWeight: FontWeight.w900, height: 1),
                ),
                const SizedBox(height: 4),
                Text(
                  context.tr('خصم', 'off'),
                  style: const TextStyle(color: Color(0xFFC56A3D), fontSize: 10.5, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// The trip's key facts as a grid of small cards, each with its own colour.
class _FactsRow extends StatelessWidget {
  final Trip trip;
  const _FactsRow({required this.trip});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final facts = <(IconData, Tone, String, String)>[
      if (t.departureCity.isNotEmpty) (Icons.place_rounded, Tone.primary, context.tr('الانطلاق', 'Departs'), t.departureCity),
      if (t.isWeekly && t.durationDays > 0)
        (Icons.schedule_rounded, Tone.orange, context.tr('المدة', 'Duration'), context.tr('${t.durationDays} أيام', '${t.durationDays} days')),
      if (t.isWeekly && t.startDate.isNotEmpty) (Icons.event_rounded, Tone.success, context.tr('البداية', 'Starts'), context.date(t.startDate)),
      if (t.isWeekly && t.endDate.isNotEmpty) (Icons.flag_rounded, Tone.warning, context.tr('العودة', 'Returns'), context.date(t.endDate)),
      if (!t.isWeekly && t.days.isNotEmpty) (Icons.event_repeat_rounded, Tone.success, context.tr('أيام الانطلاق', 'Runs on'), t.days.map(context.sv).join(context.isAr ? '، ' : ', ')),
      (Icons.event_seat_rounded, t.availableSeats > 0 ? Tone.success : Tone.danger, context.tr('المقاعد', 'Seats'), tripSeatsLabel(context, t)),
    ];
    return LayoutBuilder(
      builder: (context, c) {
        final w = (c.maxWidth - 10) / 2;
        return Wrap(
          spacing: 10,
          runSpacing: 10,
          children: [
            for (final f in facts)
              Container(
                width: w,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: toneColors(f.$2).$1, borderRadius: BorderRadius.circular(AppRadius.md)),
                child: Row(
                  children: [
                    Container(
                      width: 36,
                      height: 36,
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: Icon(f.$1, size: 19, color: toneColors(f.$2).$2),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(f.$3, style: AppText.caption.copyWith(fontSize: 11, color: toneColors(f.$2).$2)),
                          Text(f.$4, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 13, height: 1.3)),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
          ],
        );
      },
    );
  }
}

class _DateChip extends StatelessWidget {
  final DepartureDate date;
  final Trip trip;
  const _DateChip({required this.date, required this.trip});

  @override
  Widget build(BuildContext context) {
    final full = date.seatsLeft <= 0;
    final offer = trip.activeOffer != null && trip.activeOffer!.covers(date.date);
    return Container(
      width: 96,
      padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
      decoration: BoxDecoration(
        color: full ? AppColors.muted : (offer ? AppColors.accentSoft : AppColors.primarySoft),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: full ? AppColors.border : (offer ? AppColors.accent.withValues(alpha: 0.35) : AppColors.primary.withValues(alpha: 0.2)),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(context.sv(date.day), style: AppText.caption.copyWith(fontSize: 11)),
          Text(
            context.date(date.date).split(' ').take(2).join(' '),
            style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w900, color: full ? AppColors.mutedText : AppColors.primary),
          ),
          Text(
            full ? context.tr('مكتمل', 'Full') : context.tr('${date.seatsLeft} مقعد', '${date.seatsLeft} seats'),
            style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: full ? AppColors.destructive : AppColors.accent),
          ),
          if (offer && !full)
            Text(
              context.tr(
                'عرض -${trip.activeOffer!.discount.toStringAsFixed(0)}%',
                'Offer -${trip.activeOffer!.discount.toStringAsFixed(0)}%',
              ),
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Color(0xFF047857)),
            ),
        ],
      ),
    );
  }
}

/// Photo cards of the landmarks the trip visits; each opens the landmark's details.
class _LandmarkCards extends StatelessWidget {
  final List<TripPlace> places;
  const _LandmarkCards({required this.places});

  @override
  Widget build(BuildContext context) {
    final catalog = AppScope.of(context).catalog.places ?? const <Place>[];
    Place placeFor(TripPlace p) =>
        catalog.firstWhere((x) => x.id == p.id, orElse: () => Place(id: p.id, name: p.name, category: p.category, image: p.image));
    return SizedBox(
      height: 168,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: places.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (_, i) {
          final place = placeFor(places[i]);
          return PlaceCard(
            place: place,
            width: places.length == 1 ? MediaQuery.of(context).size.width - Gap.page * 2 : 180,
            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => PlaceDetailsScreen(place: place))),
          );
        },
      ),
    );
  }
}

class _TeamCard extends StatelessWidget {
  final Trip trip;
  const _TeamCard({required this.trip});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 6),
      child: Column(
        children: [
          if (t.guideName.isNotEmpty)
            _TeamRow(
              leading: DelniAvatar(path: t.guideAvatar, name: t.guideName, size: 44),
              label: context.tr('المرشد السياحي', 'Tour guide'),
              title: t.guideName,
              subtitle: t.guideYears > 0 ? context.tr('${t.guideYears} سنوات خبرة', '${t.guideYears} years experience') : null,
              onTap: () => _showGuide(context, t),
            ),
          if (t.guideName.isNotEmpty && t.hasVehicle) const Divider(indent: 64),
          if (t.hasVehicle)
            _TeamRow(
              leading: _VehicleAvatar(path: t.vehicleImage, size: 44),
              label: context.tr('المركبة والناقل', 'Vehicle & carrier'),
              title: [t.vehicleModel, t.transportCompany].where((s) => s.isNotEmpty).join(' • '),
              subtitle: t.driverName.isNotEmpty ? context.tr('السائق: ${t.driverName}', 'Driver: ${t.driverName}') : null,
              onTap: () => _showVehicle(context, t),
            ),
        ],
      ),
    );
  }
}

class _TeamRow extends StatelessWidget {
  final Widget leading;
  final String label;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;

  const _TeamRow({required this.leading, required this.label, required this.title, this.subtitle, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      borderRadius: BorderRadius.circular(14),
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: Row(
          children: [
            leading,
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: AppText.caption.copyWith(fontSize: 11.5)),
                  Text(title, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 14)),
                  if (subtitle != null) Text(subtitle!, style: AppText.caption.copyWith(fontSize: 11.5)),
                ],
              ),
            ),
            Text(
              context.tr('التفاصيل', 'Details'),
              style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.w800),
            ),
            Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: AppColors.primary, size: 18),
          ],
        ),
      ),
    );
  }
}

/// The guide's card, built only from the columns the trips API returns.
void _showGuide(BuildContext context, Trip t) {
  final languages = [
    context.tr('العربية', 'Arabic'),
    if (t.guideSpeaksEnglish) context.tr('الإنجليزية', 'English'),
    if (t.guideSpeaksFrench) context.tr('الفرنسية', 'French'),
    if (t.guideSpeaksItalian) context.tr('الإيطالية', 'Italian'),
  ];
  showAppSheet<void>(
    context,
    builder:
        (ctx) => SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(child: DelniAvatar(path: t.guideAvatar, name: t.guideName, size: 88, ring: AppColors.primarySoft)),
              const SizedBox(height: 10),
              Center(
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Flexible(child: Text(t.guideName, style: AppText.h2)),
                    const SizedBox(width: 4),
                    const Icon(Icons.verified_rounded, color: AppColors.primaryGlow, size: 20),
                  ],
                ),
              ),
              Center(child: Text(ctx.tr('مرشد سياحي معتمد', 'Licensed tour guide'), style: AppText.caption)),
              const SizedBox(height: Gap.lg),
              AppCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                child: Column(
                  children: [
                    if (t.guideLicense.isNotEmpty)
                      InfoRow(icon: Icons.badge_outlined, label: ctx.tr('رقم الترخيص', 'Licence'), value: t.guideLicense, ltrValue: true),
                    InfoRow(
                      icon: Icons.workspace_premium_outlined,
                      label: ctx.tr('سنوات الخبرة', 'Experience'),
                      value: t.guideYears > 0 ? ctx.tr('${t.guideYears} سنوات', '${t.guideYears} years') : '—',
                    ),
                    InfoRow(icon: Icons.translate_rounded, label: ctx.tr('اللغات', 'Languages'), value: languages.join(ctx.isAr ? '، ' : ', ')),
                    if (t.guidePricePerDay > 0)
                      InfoRow(
                        icon: Icons.payments_outlined,
                        label: ctx.tr('الأجر اليومي', 'Daily rate'),
                        value: ctx.money(t.guidePricePerDay),
                      ),
                    if (t.guidePhone.isNotEmpty)
                      InfoRow(
                        icon: Icons.phone_outlined,
                        label: ctx.tr('الهاتف', 'Phone'),
                        value: t.guidePhone,
                        ltrValue: true,
                        trailing: CallButton(phone: t.guidePhone),
                      ),
                  ],
                ),
              ),
              if (t.guideBio.isNotEmpty) ...[DetailSection(title: ctx.tr('نبذة', 'About')), Text(t.guideBio, style: AppText.body)],
            ],
          ),
        ),
  );
}

/// The trip vehicle's card (VehicleDetailsModal on Delni).
void _showVehicle(BuildContext context, Trip t) {
  showAppSheet<void>(
    context,
    builder:
        (ctx) => SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (t.vehicleImage.isNotEmpty) ...[
                DelniImage(
                  t.vehicleImage,
                  height: 170,
                  width: double.infinity,
                  fallbackIcon: Icons.directions_bus_rounded,
                  borderRadius: BorderRadius.circular(AppRadius.lg),
                ),
                const SizedBox(height: Gap.lg),
              ],
              SheetHeader(
                title: t.vehicleModel.isEmpty ? ctx.tr('مركبة نقل', 'Transport vehicle') : t.vehicleModel,
                subtitle: t.transportCompany.isEmpty ? null : t.transportCompany,
                icon: Icons.directions_bus_rounded,
              ),
              const SizedBox(height: Gap.lg),
              AppCard(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                child: Column(
                  children: [
                    if (t.vehiclePlate.isNotEmpty)
                      InfoRow(icon: Icons.pin_outlined, label: ctx.tr('رقم اللوحة', 'Plate'), value: t.vehiclePlate, ltrValue: true),
                    if (t.vehicleCapacity > 0)
                      InfoRow(icon: Icons.event_seat_outlined, label: ctx.tr('عدد المقاعد', 'Seats'), value: '${t.vehicleCapacity}'),
                    if (t.vehicleCategory.isNotEmpty)
                      InfoRow(icon: Icons.category_outlined, label: ctx.tr('الفئة', 'Category'), value: t.vehicleCategory),
                    if (t.vehicleStatus.isNotEmpty)
                      InfoRow(icon: Icons.info_outline_rounded, label: ctx.tr('الحالة', 'Status'), value: t.vehicleStatus),
                    if (t.vehicleDailyRate > 0)
                      InfoRow(
                        icon: Icons.payments_outlined,
                        label: ctx.tr('سعر التأجير اليومي', 'Daily rental'),
                        value: ctx.money(t.vehicleDailyRate),
                      ),
                    if (t.driverName.isNotEmpty)
                      InfoRow(
                        icon: Icons.person_pin_circle_outlined,
                        label: ctx.tr('السائق', 'Driver'),
                        value: t.driverName,
                        trailing: t.driverPhone.isEmpty ? null : CallButton(phone: t.driverPhone),
                      ),
                    if (t.companyPhone.isNotEmpty)
                      InfoRow(
                        icon: Icons.business_rounded,
                        label: ctx.tr('هاتف شركة النقل', 'Company phone'),
                        value: t.companyPhone,
                        ltrValue: true,
                        trailing: CallButton(phone: t.companyPhone),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
  );
}

/// Travellers' reviews of the trip: the average with a bar per star level (tap a bar to show only those
/// reviews) and the review cards, three at first.
class _TripReviews extends StatefulWidget {
  final Trip trip;
  const _TripReviews({required this.trip});

  @override
  State<_TripReviews> createState() => _TripReviewsState();
}

class _TripReviewsState extends State<_TripReviews> {
  List<(int, String, String, String)>? _reviews;
  int? _filter; // show only this many stars
  bool _all = false;

  @override
  void initState() {
    super.initState();
    ApiService.fetchTripReviews(widget.trip).then((r) {
      if (mounted) setState(() => _reviews = r ?? const []);
    });
  }

  @override
  Widget build(BuildContext context) {
    final list = _reviews;
    if (list == null || list.isEmpty) return const SizedBox.shrink();
    final avg = list.fold<int>(0, (s, r) => s + r.$1) / list.length;
    final counts = List.generate(5, (i) => list.where((r) => r.$1 == 5 - i).length);
    final filtered = _filter == null ? list : list.where((r) => r.$1 == _filter).toList();
    final shown = _all ? filtered : filtered.take(3).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DetailSection(
          title: context.tr('آراء المسافرين', 'Travellers’ reviews'),
          subtitle: context.tr('من سياح حجزوا الرحلة فعلاً', 'From travellers who booked this trip'),
        ),
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            gradient: const LinearGradient(colors: [Color(0xFFFFFBEB), Color(0xFFFFF7ED)]),
            border: Border.all(color: const Color(0xFFFDE68A)),
          ),
          child: Row(
            children: [
              Column(
                children: [
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0, end: avg),
                    duration: const Duration(milliseconds: 900),
                    curve: Curves.easeOutCubic,
                    builder: (_, v, __) => Text(v.toStringAsFixed(1),
                        style: const TextStyle(fontSize: 34, fontWeight: FontWeight.w900, color: Color(0xFF92400E), height: 1)),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      for (var i = 1; i <= 5; i++)
                        Icon(i <= avg.round() ? Icons.star_rounded : Icons.star_outline_rounded, size: 15, color: const Color(0xFFF59E0B)),
                    ],
                  ),
                  Text(context.tr('${list.length} تقييم', '${list.length} reviews'), style: AppText.caption.copyWith(fontSize: 11)),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  children: [
                    for (var i = 0; i < 5; i++)
                      InkWell(
                        borderRadius: BorderRadius.circular(8),
                        onTap: counts[i] == 0 ? null : () => setState(() => _filter = _filter == 5 - i ? null : 5 - i),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 2, horizontal: 4),
                          child: Row(
                            children: [
                              Text('${5 - i}',
                                  style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: FontWeight.w900,
                                      color: _filter == 5 - i ? const Color(0xFFB45309) : AppColors.mutedText)),
                              const Icon(Icons.star_rounded, size: 12, color: Color(0xFFF59E0B)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: ClipRRect(
                                  borderRadius: BorderRadius.circular(10),
                                  child: TweenAnimationBuilder<double>(
                                    tween: Tween(begin: 0, end: counts[i] / list.length),
                                    duration: Duration(milliseconds: 700 + i * 120),
                                    curve: Curves.easeOutCubic,
                                    builder: (_, v, __) => LinearProgressIndicator(
                                      value: v,
                                      minHeight: _filter == 5 - i ? 9 : 7,
                                      backgroundColor: Colors.white,
                                      color: _filter == null || _filter == 5 - i ? const Color(0xFFF59E0B) : const Color(0xFFFCD34D),
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 6),
                              SizedBox(width: 18, child: Text('${counts[i]}', style: AppText.caption.copyWith(fontSize: 11))),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
        if (_filter != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: InputChip(
              label: Text(context.tr('تقييمات $_filter نجوم فقط', '$_filter-star reviews only'),
                  style: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w800, fontSize: 12)),
              onDeleted: () => setState(() => _filter = null),
            ),
          ),
        const SizedBox(height: 10),
        AnimatedSize(
          duration: const Duration(milliseconds: 300),
          alignment: Alignment.topCenter,
          child: Column(
            children: [
              for (var i = 0; i < shown.length; i++) _ReviewCard(review: shown[i], index: i, key: ValueKey('${shown[i].$3}${shown[i].$4}')),
            ],
          ),
        ),
        if (filtered.length > 3)
          Center(
            child: TextButton.icon(
              onPressed: () => setState(() => _all = !_all),
              icon: Icon(_all ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded),
              label: Text(
                _all ? context.tr('عرض أقل', 'Show less') : context.tr('عرض كل التقييمات (${filtered.length})', 'Show all (${filtered.length})'),
                style: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w800),
              ),
            ),
          ),
      ],
    );
  }
}

class _ReviewCard extends StatelessWidget {
  final (int, String, String, String) review;
  final int index;
  const _ReviewCard({super.key, required this.review, required this.index});

  @override
  Widget build(BuildContext context) {
    final (stars, comment, name, date) = review;
    final who = name.trim().isEmpty ? context.tr('سائح', 'Traveller') : name.trim();
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 350 + index * 90),
      curve: Curves.easeOutCubic,
      builder: (_, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 14 * (1 - v)), child: child)),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.md),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                DelniAvatar(name: who, size: 36),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Flexible(child: Text(who, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label)),
                          const SizedBox(width: 4),
                          const Icon(Icons.verified_rounded, size: 14, color: AppColors.accent),
                        ],
                      ),
                      if (date.length >= 10) Text(context.date(date.substring(0, 10)), style: AppText.caption.copyWith(fontSize: 11)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: const Color(0xFFFEF3C7), borderRadius: BorderRadius.circular(20)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star_rounded, size: 14, color: Color(0xFFF59E0B)),
                      const SizedBox(width: 2),
                      Text('$stars', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Color(0xFF92400E))),
                    ],
                  ),
                ),
              ],
            ),
            if (comment.trim().isNotEmpty) ...[
              const SizedBox(height: 8),
              Text(comment.trim(), style: AppText.body.copyWith(fontSize: 13, height: 1.6)),
            ],
          ],
        ),
      ),
    );
  }
}

/// The trip vehicle's photo in a small circle (a bus icon when the vehicle has no photo).
class _VehicleAvatar extends StatelessWidget {
  final String path;
  final double size;
  const _VehicleAvatar({required this.path, this.size = 44});

  @override
  Widget build(BuildContext context) {
    if (path.trim().isEmpty) return IconBubble(icon: Icons.directions_bus_rounded, size: size);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: AppColors.primarySoft, width: 2)),
      child: ClipOval(child: DelniImage(path, width: size, height: size, fallbackIcon: Icons.directions_bus_rounded)),
    );
  }
}

// Same city whatever the spelling: صبراتة / صبراته, أ / ا, ى / ي
String _normCity(String v) =>
    v.trim().toLowerCase().replaceAll(RegExp('[أإآ]'), 'ا').replaceAll('ة', 'ه').replaceAll('ى', 'ي').replaceAll(RegExp(r'\s+'), ' ');

/// Loads the hotels and restaurants once if the catalog has not been loaded yet (a trip opened from a link or a ticket).
void _ensureCatalog(BuildContext context) {
  final catalog = AppScope.read(context).catalog;
  if (catalog.hotels == null && !catalog.loading) {
    WidgetsBinding.instance.addPostFrameCallback((_) => catalog.load());
  }
}

/// One hotel / restaurant card: photo, kind, name, city and the Delni discount; it slides in, presses down
/// when touched and opens the hotel's / restaurant's page.
class _PartnerCard extends StatefulWidget {
  final String type; // 'hotel' | 'restaurant' (favourites item_type)
  final String itemId;
  final String image;
  final String name;
  final String city;
  final String kindLabel;
  final int discount;
  final int stars;
  final String? badge;
  final int index;
  final VoidCallback? onTap;

  const _PartnerCard({
    required this.type,
    required this.itemId,
    required this.image,
    required this.name,
    required this.city,
    required this.kindLabel,
    this.discount = 0,
    this.stars = 0,
    this.badge,
    this.index = 0,
    this.onTap,
  });

  @override
  State<_PartnerCard> createState() => _PartnerCardState();
}

class _PartnerCardState extends State<_PartnerCard> {
  bool _pressed = false;

  @override
  Widget build(BuildContext context) {
    final hotel = widget.type == 'hotel';
    final tone = hotel ? Tone.primary : Tone.orange;
    final (soft, strong) = toneColors(tone);
    final card = AnimatedScale(
      scale: _pressed ? 0.97 : 1,
      duration: const Duration(milliseconds: 120),
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: _pressed ? strong.withValues(alpha: 0.5) : AppColors.border),
          boxShadow: AppShadows.soft,
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(14),
              child: SizedBox(
                width: 78,
                height: 78,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    DelniImage(widget.image, fallbackIcon: hotel ? Icons.hotel_rounded : Icons.restaurant_rounded),
                    if (widget.discount > 0)
                      Positioned(
                        left: 0,
                        right: 0,
                        bottom: 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 2),
                          color: const Color(0xF2059669),
                          child: Text(
                            '-${widget.discount}%',
                            textAlign: TextAlign.center,
                            textDirection: TextDirection.ltr,
                            style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w900),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 6,
                    runSpacing: 4,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                        decoration: BoxDecoration(color: soft, borderRadius: BorderRadius.circular(20)),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(hotel ? Icons.hotel_rounded : Icons.restaurant_rounded, size: 12, color: strong),
                            const SizedBox(width: 3),
                            Text(widget.kindLabel, style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, color: strong)),
                          ],
                        ),
                      ),
                      if (widget.badge != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(color: const Color(0xFFD1FAE5), borderRadius: BorderRadius.circular(20)),
                          child: Text(widget.badge!,
                              style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w900, color: Color(0xFF047857))),
                        ),
                      if (widget.stars > 0)
                        Text('★' * widget.stars.clamp(1, 5), style: const TextStyle(fontSize: 11, color: Color(0xFFF59E0B))),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(widget.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 14)),
                  if (widget.city.isNotEmpty) MetaItem(icon: Icons.place_outlined, text: widget.city),
                  const SizedBox(height: 2),
                  Text(
                    widget.discount > 0
                        ? context.tr('خصم ${widget.discount}% لعملاء دلّني', '${widget.discount}% off with Delni')
                        : context.tr('اضغط لعرض التفاصيل', 'Tap for details'),
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: widget.discount > 0 ? const Color(0xFF047857) : AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Column(
              children: [
                if (widget.itemId.isNotEmpty) FavoriteHeart(type: widget.type, itemId: widget.itemId, size: 32),
                const SizedBox(height: 8),
                Container(
                  width: 30,
                  height: 30,
                  decoration: BoxDecoration(color: soft, shape: BoxShape.circle),
                  child: Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: strong, size: 20),
                ),
              ],
            ),
          ],
        ),
      ),
    );
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 380 + widget.index * 90),
      curve: Curves.easeOutCubic,
      builder: (_, v, child) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, 18 * (1 - v)), child: child)),
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTapDown: (_) => setState(() => _pressed = true),
        onTapCancel: () => setState(() => _pressed = false),
        onTapUp: (_) => setState(() => _pressed = false),
        onTap: widget.onTap ??
            () => showAppSnack(context, context.tr('هذا الشريك غير متاح حالياً في الدليل', 'This partner is not listed right now'),
                tone: Tone.warning),
        child: card,
      ),
    );
  }
}

Widget _hotelCard(BuildContext context, Hotel h, int index, {String? badge}) => _PartnerCard(
      type: 'hotel',
      itemId: h.id,
      image: h.imageUrl,
      name: h.name,
      city: h.city,
      kindLabel: context.tr('فندق', 'Hotel'),
      discount: h.discountPercentage,
      stars: h.starRating,
      badge: badge,
      index: index,
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => HotelDetailsScreen(hotel: h))),
    );

Widget _restaurantCard(BuildContext context, Restaurant r, int index, {String? badge}) => _PartnerCard(
      type: 'restaurant',
      itemId: r.id,
      image: r.imageUrl,
      name: r.name,
      city: r.city,
      kindLabel: r.type.isNotEmpty ? r.type : context.tr('مطعم', 'Restaurant'),
      discount: r.discountPercentage,
      badge: badge,
      index: index,
      onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => RestaurantDetailsScreen(restaurant: r))),
    );

/// The hotels / restaurant the trip includes, as cards that open their pages.
class _IncludedPartners extends StatefulWidget {
  final Trip trip;
  const _IncludedPartners({required this.trip});

  @override
  State<_IncludedPartners> createState() => _IncludedPartnersState();
}

class _IncludedPartnersState extends State<_IncludedPartners> {
  @override
  void initState() {
    super.initState();
    if (widget.trip.hotelNames.isNotEmpty || widget.trip.restaurantName.isNotEmpty) _ensureCatalog(context);
  }

  @override
  Widget build(BuildContext context) {
    final t = widget.trip;
    if (t.hotelNames.isEmpty && t.hotelIds.isEmpty && t.restaurantName.isEmpty) return const SizedBox.shrink();
    final catalog = AppScope.of(context).catalog;
    return ListenableBuilder(
      listenable: catalog,
      builder: (context, _) {
        final included = context.tr('مشمول ✓', 'Included ✓');
        final cards = <Widget>[];
        var i = 0;
        // Hotels by id, or by name when the trip only sends names
        final names = {...t.hotelNames};
        for (final h in catalog.hotels ?? const <Hotel>[]) {
          if (t.hotelIds.contains(h.id) || names.contains(h.name)) {
            names.remove(h.name);
            cards.add(_hotelCard(context, h, i++, badge: included));
          }
        }
        for (final n in names) {
          cards.add(_PartnerCard(type: 'hotel', itemId: '', image: '', name: n, city: '', kindLabel: context.tr('فندق', 'Hotel'), badge: included, index: i++));
        }
        if (t.restaurantName.isNotEmpty || t.restaurantId.isNotEmpty) {
          Restaurant? r;
          for (final x in catalog.restaurants ?? const <Restaurant>[]) {
            if ((t.restaurantId.isNotEmpty && x.id == t.restaurantId) || x.name == t.restaurantName) {
              r = x;
              break;
            }
          }
          cards.add(r != null
              ? _restaurantCard(context, r, i++, badge: included)
              : _PartnerCard(
                  type: 'restaurant',
                  itemId: '',
                  image: '',
                  name: t.restaurantName,
                  city: '',
                  kindLabel: context.tr('مطعم', 'Restaurant'),
                  badge: included,
                  index: i++,
                ));
        }
        if (cards.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DetailSection(
              title: t.isWeekly ? context.tr('الإقامة والوجبات', 'Stay & meals') : context.tr('وجبة الرحلة', 'Trip meal'),
              subtitle: context.tr('اضغط على أي بطاقة لعرض صفحة الفندق أو المطعم', 'Tap a card to open the hotel or restaurant'),
            ),
            for (final c in cards) Padding(padding: const EdgeInsets.only(bottom: 10), child: c),
          ],
        );
      },
    );
  }
}

/// Partner hotels and restaurants in the cities of the trip's landmarks (the platform's "nearby" offers),
/// stacked one above the other; the first three show and the rest open with "show more".
class _NearbyPartners extends StatefulWidget {
  final Trip trip;
  const _NearbyPartners({required this.trip});

  @override
  State<_NearbyPartners> createState() => _NearbyPartnersState();
}

class _NearbyPartnersState extends State<_NearbyPartners> {
  static const _collapsed = 3;
  bool _expanded = false;

  @override
  void initState() {
    super.initState();
    _ensureCatalog(context);
  }

  @override
  Widget build(BuildContext context) {
    final trip = widget.trip;
    final cities = trip.places.map((p) => _normCity(p.city)).where((c) => c.isNotEmpty && c != 'ليبيا').toSet();
    if (cities.isEmpty) return const SizedBox.shrink();
    bool inCities(String city) {
      final c = _normCity(city);
      return c.isNotEmpty && cities.any((t) => c == t || c.contains(t) || t.contains(c));
    }

    final catalog = AppScope.of(context).catalog;
    return ListenableBuilder(
      listenable: catalog,
      builder: (context, _) {
        // Those already included in the trip are shown above, not again here
        final hotels = (catalog.hotels ?? [])
            .where((h) => inCities(h.city) && !trip.hotelIds.contains(h.id) && !trip.hotelNames.contains(h.name))
            .toList();
        final restaurants = (catalog.restaurants ?? [])
            .where((r) => inCities(r.city) && r.id != trip.restaurantId && r.name != trip.restaurantName)
            .toList();
        if (hotels.isEmpty && restaurants.isEmpty) {
          return catalog.loading && catalog.hotels == null
              ? const Padding(padding: EdgeInsets.only(top: Gap.lg), child: SkeletonList(count: 1, imageHeight: 70))
              : const SizedBox.shrink();
        }
        // Hotel, restaurant, hotel, ... so both kinds show in the first cards
        final all = <Widget Function(int)>[];
        for (var i = 0; i < hotels.length || i < restaurants.length; i++) {
          if (i < hotels.length) all.add((n) => _hotelCard(context, hotels[i], n));
          if (i < restaurants.length) all.add((n) => _restaurantCard(context, restaurants[i], n));
        }
        final shown = _expanded ? all.length : all.length.clamp(0, _collapsed);
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            DetailSection(
              title: context.tr('فنادق ومطاعم قرب وجهتك', 'Hotels & dining near your destination'),
              subtitle: context.tr('عروض شركاء دلّني في مدن معالم الرحلة', 'Delni partner offers in the trip’s landmark cities'),
            ),
            AnimatedSize(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeOutCubic,
              alignment: Alignment.topCenter,
              child: Column(
                children: [
                  for (var i = 0; i < shown; i++)
                    Padding(padding: const EdgeInsets.only(bottom: 10), child: all[i](i < _collapsed ? i : i - _collapsed)),
                ],
              ),
            ),
            if (all.length > _collapsed)
              Center(
                child: TextButton.icon(
                  onPressed: () => setState(() => _expanded = !_expanded),
                  icon: Icon(_expanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded),
                  label: Text(
                    _expanded
                        ? context.tr('عرض أقل', 'Show less')
                        : context.tr('عرض ${all.length - _collapsed} عروض أخرى', 'Show ${all.length - _collapsed} more'),
                    style: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
          ],
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Booking flow
// ---------------------------------------------------------------------------

Future<void> startBooking(BuildContext context, Trip trip) async {
  final session = ApiService.currentSession;
  if (session == null || !session.isTourist) {
    await promptTouristLogin(
      context,
      reason: context.tr('سجّل الدخول بحساب سائح لحجز مقعدك في هذه الرحلة.', 'Sign in with a tourist account to book a seat on this trip.'),
    );
    return;
  }
  final code = await showAppSheet<String>(context, builder: (_) => _BookingSheet(trip: trip));
  if (code == null || !context.mounted) return;
  final state = AppScope.read(context);
  state.bookingsRevision.value++;
  state.refreshUnread();
  await showDialog<void>(
    context: context,
    builder:
        (ctx) => AlertDialog(
          icon: const IconBubble(icon: Icons.confirmation_number_rounded, tone: Tone.success, size: 60),
          title: Text(ctx.tr('تم تأكيد حجزك', 'Booking confirmed'), textAlign: TextAlign.center),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(ctx.tr('رقم التذكرة', 'Ticket number'), style: AppText.caption),
              const SizedBox(height: 4),
              SelectableText(
                code,
                textDirection: TextDirection.ltr,
                style: AppText.h2.copyWith(color: AppColors.primary, letterSpacing: 0.5),
              ),
              const SizedBox(height: 12),
              Text(
                ctx.tr('يُرجى سداد التكلفة نقداً بمقر الشركة قبل موعد الرحلة.', 'Please pay in cash at the office before the trip.'),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
          actions: [
            AppButton(
              label: ctx.tr('عرض تذاكري', 'View my tickets'),
              icon: Icons.confirmation_number_outlined,
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.of(context).popUntil((r) => r.isFirst);
                state.touristTab.value = 2;
              },
            ),
          ],
        ),
  );
}

class _BookingSheet extends StatefulWidget {
  final Trip trip;
  const _BookingSheet({required this.trip});

  @override
  State<_BookingSheet> createState() => _BookingSheetState();
}

class _BookingSheetState extends State<_BookingSheet> {
  List<DepartureDate>? _dates;
  bool _loadingDates = false;
  bool _datesFailed = false;
  String? _date;
  int _seats = 1;
  bool _sending = false;
  String? _error;

  Trip get _trip => widget.trip;

  @override
  void initState() {
    super.initState();
    if (!_trip.isWeekly) _loadDates();
  }

  Future<void> _loadDates() async {
    setState(() {
      _loadingDates = true;
      _datesFailed = false;
    });
    final dates = await ApiService.fetchDailyDepartures(_trip.id);
    if (!mounted) return;
    setState(() {
      _loadingDates = false;
      _dates = dates;
      _datesFailed = dates == null;
      final open = dates?.where((d) => d.seatsLeft > 0).toList() ?? [];
      if (open.isNotEmpty && (_date == null || !open.any((d) => d.date == _date))) _date = open.first.date;
    });
  }

  DepartureDate? get _selected => _dates?.where((d) => d.date == _date).firstOrNull;

  /// Seat price for the chosen date: the server prices each daily date (an offer running on it lowers it);
  /// a weekly trip's offer counts when it covers the start date.
  (double price, double original, double discount) get _unitPrice {
    if (_trip.isWeekly) {
      return _trip.offerAppliesNow ? (_trip.offerPrice, _trip.price, _trip.activeOffer!.discount) : (_trip.price, 0, 0);
    }
    final d = _selected;
    if (d == null || d.price <= 0) return (_trip.price, 0, 0);
    return (d.price, d.discount > 0 ? _trip.price : 0, d.discount);
  }

  int get _maxSeats {
    final left =
        _trip.isWeekly
            ? _trip.availableSeats
            : (_dates?.firstWhere((d) => d.date == _date, orElse: () => DepartureDate(date: '', day: '', seatsLeft: 0)).seatsLeft ?? 0);
    return left.clamp(0, 50);
  }

  Future<void> _confirm() async {
    setState(() {
      _sending = true;
      _error = null;
    });
    final res = await ApiService.createBooking(tripId: _trip.id, tripType: _trip.type, seats: _seats, tripDate: _date);
    if (!mounted) return;
    setState(() => _sending = false);
    if (res.success) {
      Navigator.pop(context, res.code.isEmpty ? '—' : res.code);
    } else {
      setState(() => _error = res.message);
      if (!_trip.isWeekly) _loadDates();
    }
  }

  @override
  Widget build(BuildContext context) {
    final max = _maxSeats;
    final unit = _unitPrice;
    if (_seats > max && max > 0) _seats = max;
    final canBook = max > 0 && (_trip.isWeekly || _date != null);
    return SingleChildScrollView(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SheetHeader(title: context.tr('تأكيد الحجز', 'Confirm booking'), subtitle: _trip.title, icon: Icons.event_seat_rounded),
            const SizedBox(height: Gap.xl),
            if (!_trip.isWeekly) ...[
              Text(context.tr('اختر يوم الانطلاق', 'Choose a departure day'), style: AppText.label),
              const SizedBox(height: 10),
              if (_loadingDates && _dates == null)
                const Row(
                  children: [
                    Expanded(child: SkeletonBox(height: 64)),
                    SizedBox(width: 8),
                    Expanded(child: SkeletonBox(height: 64)),
                    SizedBox(width: 8),
                    Expanded(child: SkeletonBox(height: 64)),
                  ],
                )
              else if (_datesFailed)
                ErrorState(compact: true, onRetry: _loadDates)
              else if (_dates!.isEmpty)
                InlineMessage(
                  tone: Tone.warning,
                  text: context.tr(
                    'لا توجد مواعيد متاحة للحجز هذا الشهر. يُغلق الحجز الساعة 7 صباحاً يوم الرحلة، وتُفتح مواعيد الشهر القادم مع بدايته.',
                    'No dates are open this month. Booking closes at 7:00 AM on the trip day; next month opens on its 1st.',
                  ),
                )
              else
                // Same as the platform's booking window: one wide card per run date, the price at the end
                Column(
                  children: [
                    for (final d in _dates!)
                      _ScheduleRow(
                        date: d,
                        basePrice: _trip.price,
                        selected: d.date == _date,
                        onTap: d.seatsLeft <= 0 ? null : () => setState(() => _date = d.date),
                      ),
                  ],
                ),
              const SizedBox(height: Gap.xl),
            ],
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(context.tr('عدد المقاعد', 'Seats'), style: AppText.label),
                      Text(
                        max > 0 ? context.tr('المتاح: $max', 'Available: $max') : context.tr('لا توجد مقاعد متاحة', 'No seats available'),
                        style: AppText.caption,
                      ),
                    ],
                  ),
                ),
                _Stepper(
                  value: _seats,
                  onMinus: _seats > 1 ? () => setState(() => _seats--) : null,
                  onPlus: _seats < max ? () => setState(() => _seats++) : null,
                ),
              ],
            ),
            const SizedBox(height: Gap.lg),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(context.tr('التكلفة التقديرية', 'Estimated cost'), style: AppText.bodyMuted),
                        Text(
                          context.tr('${context.money(unit.$1)} × $_seats', '${context.money(unit.$1)} × $_seats'),
                          style: AppText.caption.copyWith(fontSize: 11),
                        ),
                      ],
                    ),
                  ),
                  if (unit.$2 > unit.$1)
                    Padding(
                      padding: const EdgeInsetsDirectional.only(end: 8),
                      child: Text(
                        context.money(unit.$2 * _seats),
                        style: AppText.caption.copyWith(decoration: TextDecoration.lineThrough, fontSize: 12.5),
                      ),
                    ),
                  Text(context.money(unit.$1 * _seats), style: AppText.price),
                ],
              ),
            ),
            const SizedBox(height: 6),
            Text(
              unit.$3 > 0
                  ? context.tr(
                    '🏷️ عرض ترويجي: خصم ${unit.$3.toStringAsFixed(0)}% على موعد هذه الرحلة. الدفع نقداً بمقر الشركة.',
                    '🏷️ Promotion: ${unit.$3.toStringAsFixed(0)}% off this date. Payment is in cash at the office.',
                  )
                  : context.tr(
                    'السعر النهائي يُحتسب تلقائياً عند الحجز، والدفع نقداً بمقر الشركة.',
                    'The final price is calculated automatically; payment is in cash at the office.',
                  ),
              style: AppText.caption.copyWith(fontSize: 11),
            ),
            const SizedBox(height: Gap.lg),
            if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
            AppButton(
              label: context.tr('تأكيد الحجز', 'Confirm booking'),
              icon: Icons.check_circle_outline_rounded,
              loading: _sending,
              onPressed: canBook ? _confirm : null,
            ),
          ],
        ),
      ),
    );
  }
}

class _ScheduleRow extends StatelessWidget {
  final DepartureDate date;
  final double basePrice;
  final bool selected;
  final VoidCallback? onTap;

  const _ScheduleRow({required this.date, required this.basePrice, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final d = date;
    final full = d.seatsLeft <= 0;
    final price = d.price > 0 ? d.price : basePrice;
    final few = !full && d.seatsLeft <= 3;
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Opacity(
        opacity: full ? 0.5 : 1,
        child: Material(
          color: full ? AppColors.muted : (selected ? AppColors.orangeSoft : Colors.white),
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: InkWell(
            borderRadius: BorderRadius.circular(AppRadius.md),
            onTap: onTap,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(AppRadius.md),
                border: Border.all(color: selected ? AppColors.brandOrange : AppColors.border, width: 2),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: 8,
                          runSpacing: 4,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text(
                              context.date(d.date),
                              style: AppText.label.copyWith(
                                fontSize: 14.5,
                                fontWeight: FontWeight.w900,
                                decoration: d.isClosed ? TextDecoration.lineThrough : null,
                              ),
                            ),
                            StatusBadge(label: context.sv(d.day), tone: Tone.success, dense: true),
                            if (full)
                              StatusBadge(
                                label: d.isClosed ? context.tr('غير متاح', 'Not available') : context.tr('مكتمل', 'Full'),
                                tone: Tone.danger,
                                dense: true,
                              ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Text(
                          d.isClosed
                              ? context.tr(d.closedReason, 'The guide is away on a private trip on this date')
                              : full
                                  ? context.tr('لا توجد مقاعد', 'No seats left')
                                  : context.tr('${d.seatsLeft} مقعد متاح', '${d.seatsLeft} seats available'),
                          style: AppText.caption.copyWith(
                            fontSize: 12,
                            color: few ? AppColors.brandOrange : AppColors.mutedText,
                            fontWeight: few ? FontWeight.w800 : FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      if (d.discount > 0)
                        StatusBadge(
                          label: context.tr('عرض -${d.discount.toStringAsFixed(0)}%', 'Offer -${d.discount.toStringAsFixed(0)}%'),
                          tone: Tone.success,
                          dense: true,
                        ),
                      if (d.discount > 0 && basePrice > price)
                        Text(
                          context.money(basePrice),
                          style: AppText.caption.copyWith(fontSize: 11, decoration: TextDecoration.lineThrough),
                        ),
                      Text(
                        context.money(price),
                        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: AppColors.brandOrange, height: 1.2),
                      ),
                      Text(context.tr('للشخص', 'per person'), style: AppText.caption.copyWith(fontSize: 10.5)),
                    ],
                  ),
                  if (selected) ...[
                    const SizedBox(width: 10),
                    Container(
                      width: 26,
                      height: 26,
                      decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.brandOrange),
                      child: const Icon(Icons.check_rounded, color: Colors.white, size: 17),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _Stepper extends StatelessWidget {
  final int value;
  final VoidCallback? onMinus;
  final VoidCallback? onPlus;

  const _Stepper({required this.value, this.onMinus, this.onPlus});

  @override
  Widget build(BuildContext context) {
    Widget btn(IconData icon, VoidCallback? onTap) => IconButton(
      tooltip: icon == Icons.add_rounded ? context.tr('زيادة مقعد', 'Add a seat') : context.tr('إنقاص مقعد', 'Remove a seat'),
      onPressed: onTap,
      style: IconButton.styleFrom(
        backgroundColor: onTap == null ? AppColors.muted : AppColors.primarySoft,
        foregroundColor: AppColors.primary,
      ),
      icon: Icon(icon, size: 20),
    );
    return Row(
      children: [
        btn(Icons.remove_rounded, onMinus),
        SizedBox(width: 44, child: Text('$value', textAlign: TextAlign.center, style: AppText.h2)),
        btn(Icons.add_rounded, onPlus),
      ],
    );
  }
}
