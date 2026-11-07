import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
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
          DetailHeader(photos: t.photos, title: t.title),
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
                  if (t.isWeekly && (t.hotelNames.isNotEmpty || t.restaurantName.isNotEmpty)) ...[
                    DetailSection(title: context.tr('الإقامة والوجبات', 'Stay & meals')),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        ...t.hotelNames.map((h) => StatusBadge(label: h, tone: Tone.success, icon: Icons.hotel_rounded)),
                        if (t.restaurantName.isNotEmpty)
                          StatusBadge(label: t.restaurantName, tone: Tone.orange, icon: Icons.restaurant_rounded),
                      ],
                    ),
                  ] else if (!t.isWeekly && t.restaurantName.isNotEmpty) ...[
                    DetailSection(title: context.tr('وجبة الرحلة', 'Trip meal')),
                    StatusBadge(label: t.restaurantName, tone: Tone.orange, icon: Icons.restaurant_rounded),
                  ],
                  if (t.guideName.isNotEmpty || t.hasVehicle || t.driverName.isNotEmpty) ...[
                    DetailSection(title: context.tr('فريق الرحلة', 'Trip team')),
                    _TeamCard(trip: t),
                  ],
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
      if (!t.isWeekly && t.days.isNotEmpty) (Icons.event_repeat_rounded, Tone.success, context.tr('أيام الانطلاق', 'Runs on'), t.days.map(context.sv).join('، ')),
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
              leading: const IconBubble(icon: Icons.directions_bus_rounded, size: 44),
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
                    InfoRow(icon: Icons.translate_rounded, label: ctx.tr('اللغات', 'Languages'), value: languages.join('، ')),
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

/// Partner hotels and restaurants in the cities of the trip's landmarks (the platform's "nearby" offers).
class _NearbyPartners extends StatelessWidget {
  final Trip trip;
  const _NearbyPartners({required this.trip});

  // Same city whatever the spelling: صبراتة / صبراته, أ / ا, ى / ي
  static String _norm(String v) =>
      v.trim().toLowerCase().replaceAll(RegExp('[أإآ]'), 'ا').replaceAll('ة', 'ه').replaceAll('ى', 'ي').replaceAll(RegExp(r'\s+'), ' ');

  @override
  Widget build(BuildContext context) {
    final cities = trip.places.map((p) => _norm(p.city)).where((c) => c.isNotEmpty && c != 'ليبيا').toSet();
    if (cities.isEmpty) return const SizedBox.shrink();
    bool inCities(String city) {
      final c = _norm(city);
      return c.isNotEmpty && cities.any((t) => c == t || c.contains(t) || t.contains(c));
    }

    final catalog = AppScope.of(context).catalog;
    final hotels = (catalog.hotels ?? []).where((h) => inCities(h.city)).toList();
    final restaurants = (catalog.restaurants ?? []).where((r) => inCities(r.city)).toList();
    if (hotels.isEmpty && restaurants.isEmpty) return const SizedBox.shrink();

    Widget tile({
      required String image,
      required String name,
      required String city,
      required int discount,
      required IconData icon,
      required VoidCallback onTap,
    }) {
      return InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: onTap,
        child: Container(
          width: 210,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              DelniImage(image, width: 58, height: 58, fallbackIcon: icon, borderRadius: BorderRadius.circular(12)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label),
                    MetaItem(icon: Icons.place_outlined, text: city),
                    if (discount > 0)
                      Text(
                        context.tr('خصم $discount% لعملاء دلّني', '$discount% off with Delni'),
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF047857)),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }

    final tiles = <Widget>[
      ...hotels.map(
        (h) => tile(
          image: h.imageUrl,
          name: h.name,
          city: h.city,
          discount: h.discountPercentage,
          icon: Icons.hotel_rounded,
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => HotelDetailsScreen(hotel: h))),
        ),
      ),
      ...restaurants.map(
        (r) => tile(
          image: r.imageUrl,
          name: r.name,
          city: r.city,
          discount: r.discountPercentage,
          icon: Icons.restaurant_rounded,
          onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => RestaurantDetailsScreen(restaurant: r))),
        ),
      ),
    ];
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        DetailSection(
          title: context.tr('فنادق ومطاعم قرب وجهتك', 'Hotels & dining near your destination'),
          subtitle: context.tr('شركاء دلّني في مدن معالم الرحلة', 'Delni partners in the trip’s landmark cities'),
        ),
        SizedBox(
          height: 76,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            itemCount: tiles.length,
            separatorBuilder: (_, __) => const SizedBox(width: 10),
            itemBuilder: (_, i) => tiles[i],
          ),
        ),
      ],
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
