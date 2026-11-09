import 'package:flutter/material.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/cards.dart';
import '../../widgets/common.dart';
import '../../widgets/contact.dart';
import '../../widgets/delni_image.dart';
import 'detail_widgets.dart';
import 'private_trip_screen.dart';
import 'trip_details_screen.dart';

/// An icon for an amenity / feature from its words (falls back to a check mark).
IconData amenityIcon(String text) {
  final t = text.toLowerCase();
  if (t.contains('واي') || t.contains('wifi') || t.contains('wi-fi') || t.contains('انترنت') || t.contains('إنترنت')) return Icons.wifi_rounded;
  if (t.contains('مسبح') || t.contains('pool')) return Icons.pool_rounded;
  if (t.contains('موقف') || t.contains('parking')) return Icons.local_parking_rounded;
  if (t.contains('مطعم') || t.contains('restaurant')) return Icons.restaurant_rounded;
  if (t.contains('إفطار') || t.contains('افطار') || t.contains('فطور') || t.contains('breakfast')) return Icons.free_breakfast_rounded;
  if (t.contains('إطلالة') || t.contains('اطلالة') || t.contains('بحر') || t.contains('view')) return Icons.waves_rounded;
  if (t.contains('غرف') || t.contains('room')) return Icons.room_service_rounded;
  if (t.contains('رياض') || t.contains('جيم') || t.contains('gym') || t.contains('لياق')) return Icons.fitness_center_rounded;
  if (t.contains('سبا') || t.contains('spa')) return Icons.spa_rounded;
  if (t.contains('تكييف') || t.contains('مكيف')) return Icons.ac_unit_rounded;
  if (t.contains('عائل') || t.contains('أطفال') || t.contains('اطفال')) return Icons.family_restroom_rounded;
  if (t.contains('قهوة') || t.contains('مقهى') || t.contains('cafe')) return Icons.local_cafe_rounded;
  if (t.contains('توصيل') || t.contains('delivery')) return Icons.delivery_dining_rounded;
  return Icons.check_circle_rounded;
}

/// Shared layout of a hotel / restaurant page: photo header, title block, call & map actions,
/// the Delni discount, about, amenities and the details card.
class _FacilityPage extends StatelessWidget {
  final List<String> photos;
  final String name;
  final IconData fallbackIcon;
  final List<Widget> badges;
  final int stars;
  final String city;
  final double ratingAvg;
  final int reviewsCount;
  final int discount;
  final String aboutTitle;
  final String description;
  final String featuresTitle;
  final List<String> features;
  final String phone;
  final String hours;
  final String mapsUrl;
  final String address;

  /// A short inviting line under the name.
  final String tagline;

  /// Quick facts shown as tiles (icon, label, value); empty values are skipped.
  final List<(IconData, String, String)> facts;

  const _FacilityPage({
    required this.photos,
    required this.name,
    required this.fallbackIcon,
    required this.badges,
    required this.stars,
    required this.city,
    required this.ratingAvg,
    required this.reviewsCount,
    required this.discount,
    required this.aboutTitle,
    required this.description,
    required this.featuresTitle,
    required this.features,
    required this.phone,
    required this.hours,
    required this.mapsUrl,
    required this.address,
    this.tagline = '',
    this.facts = const [],
  });

  @override
  Widget build(BuildContext context) {
    final shownFacts = facts.where((f) => f.$3.trim().isNotEmpty).toList();
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          DetailHeader(photos: photos, title: name, fallbackIcon: fallbackIcon),
          SliverToBoxAdapter(
            child: Container(
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(AppRadius.xl)),
              ),
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (badges.isNotEmpty) ...[Wrap(spacing: 8, runSpacing: 8, children: badges), const SizedBox(height: 12)],
                  Text(name, style: AppText.display.copyWith(fontSize: 24)),
                  if (tagline.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(tagline, style: AppText.bodyMuted.copyWith(fontSize: 14, height: 1.5, color: AppColors.primary)),
                  ],
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 14,
                    runSpacing: 6,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      if (stars > 0)
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: List.generate(stars.clamp(1, 5), (_) => const Icon(Icons.star_rounded, color: AppColors.gold, size: 20)),
                        ),
                      if (city.isNotEmpty) MetaItem(icon: Icons.place_rounded, text: city, color: AppColors.primary),
                      RatingLine(rating: ratingAvg, count: reviewsCount),
                    ],
                  ),
                  const SizedBox(height: Gap.lg),
                  ContactActions(phone: phone, mapsUrl: mapsUrl),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (shownFacts.isNotEmpty) ...[
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 2.6,
                      children: shownFacts.map((f) => _FactTile(icon: f.$1, label: f.$2, value: f.$3)).toList(),
                    ),
                    const SizedBox(height: Gap.lg),
                  ],
                  if (discount > 0) _DiscountBanner(discount: discount),
                  if (description.isNotEmpty) ...[
                    DetailSection(title: aboutTitle),
                    ExpandableText(description),
                  ],
                  if (features.isNotEmpty) ...[
                    DetailSection(title: featuresTitle),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 3.1,
                      children: features
                          .map((f) => Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12),
                                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(14)),
                                child: Row(
                                  children: [
                                    Icon(amenityIcon(f), size: 20, color: AppColors.primary),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(f, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 12.5, height: 1.3)),
                                    ),
                                  ],
                                ),
                              ))
                          .toList(),
                    ),
                  ],
                  if (hours.isNotEmpty || phone.isNotEmpty || address.isNotEmpty) ...[
                    DetailSection(title: context.tr('تواصل واحجز مباشرة', 'Get in touch and book directly')),
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        context.tr('الحجز يتم مباشرة مع المنشأة — اتصل بهم وأخبرهم أنك من عملاء دلّني.',
                            'Bookings are made directly with the venue — call them and mention Delni.'),
                        style: AppText.caption.copyWith(height: 1.5),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(AppRadius.lg)),
                      child: Column(
                        children: [
                          if (address.isNotEmpty) InfoRow(icon: Icons.place_outlined, label: context.tr('العنوان', 'Address'), value: address),
                          if (hours.isNotEmpty) InfoRow(icon: Icons.schedule_rounded, label: context.tr('ساعات العمل', 'Opening hours'), value: hours),
                          if (phone.isNotEmpty)
                            InfoRow(
                              icon: Icons.phone_outlined,
                              label: context.tr('الهاتف', 'Phone'),
                              value: phone,
                              ltrValue: true,
                              trailing: CallButton(phone: phone, size: 40),
                            ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FactTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _FactTile({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
      child: Row(
        children: [
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: AppColors.primary.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(12)),
            child: Icon(icon, size: 20, color: AppColors.primary),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption.copyWith(fontSize: 11.5)),
                Text(value, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 13.5, fontWeight: FontWeight.w800)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// An inviting line for a stay, from its type and city.
String _stayTagline(BuildContext context, Hotel h) {
  final type = h.propertyType.trim().toLowerCase();
  final inCity = h.city.isEmpty ? '' : context.tr(' في ${h.city}', ' in ${h.city}');
  if (type.contains('resort') || type.contains('منتجع')) {
    return context.tr('استرخِ وجدّد طاقتك في منتجع مميز$inCity', 'Unwind and recharge at a fine resort$inCity');
  }
  if (type.contains('apart') || type.contains('شقق')) {
    return context.tr('مساحتك الخاصة وراحة البيت لإقامة عائلية$inCity', 'Your own space and a home-like stay$inCity');
  }
  if (type.contains('heritage') || type.contains('camp') || type.contains('مخيم')) {
    return context.tr('ليالٍ هادئة تحت نجوم الصحراء$inCity', 'Quiet nights under the desert stars$inCity');
  }
  return context.tr('إقامة مريحة وضيافة ليبية أصيلة$inCity', 'A comfortable stay with true Libyan hospitality$inCity');
}

class _DiscountBanner extends StatelessWidget {
  final int discount;
  const _DiscountBanner({required this.discount});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.accentSoft, borderRadius: BorderRadius.circular(AppRadius.lg)),
      child: Row(
        children: [
          Container(
            width: 56,
            height: 56,
            alignment: Alignment.center,
            decoration: BoxDecoration(color: AppColors.accent, borderRadius: BorderRadius.circular(16)),
            child: Text('$discount%',
                textDirection: TextDirection.ltr, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.tr('خصم حصري لعملاء دلّني', 'Exclusive Delni discount'),
                    style: AppText.h3.copyWith(color: const Color(0xFF047857))),
                Text(
                  context.tr('اذكر أنك من عملاء دلّني عند الحجز أو الوصول.', 'Mention Delni when you book or arrive.'),
                  style: AppText.caption.copyWith(color: const Color(0xFF047857)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class HotelDetailsScreen extends StatelessWidget {
  final Hotel hotel;
  const HotelDetailsScreen({super.key, required this.hotel});

  @override
  Widget build(BuildContext context) {
    final h = hotel;
    return _FacilityPage(
      photos: h.photos,
      name: h.name,
      fallbackIcon: Icons.hotel_rounded,
      badges: [
        if (h.propertyType.isNotEmpty) StatusBadge(label: propertyTypeLabel(context, h.propertyType), tone: Tone.primary, icon: Icons.apartment_rounded),
        StatusBadge(label: context.tr('شريك معتمد', 'Verified partner'), tone: Tone.success, icon: Icons.verified_rounded),
      ],
      stars: h.starRating,
      city: h.city,
      ratingAvg: h.ratingAvg,
      reviewsCount: h.reviewsCount,
      discount: h.discountPercentage,
      tagline: _stayTagline(context, h),
      facts: [
        (Icons.apartment_rounded, context.tr('نوع الإقامة', 'Stay type'), propertyTypeLabel(context, h.propertyType)),
        (Icons.star_rounded, context.tr('التصنيف', 'Rating'), h.starRating > 0 ? context.tr('${h.starRating} نجوم', '${h.starRating} stars') : ''),
        (Icons.location_city_rounded, context.tr('المدينة', 'City'), h.city),
        (Icons.schedule_rounded, context.tr('الاستقبال', 'Reception'), h.workingHours),
      ],
      aboutTitle: context.tr('لمحة عن المكان', 'A glimpse of the place'),
      description: h.description,
      featuresTitle: context.tr('ما ينتظرك خلال إقامتك', 'What awaits you during your stay'),
      features: h.amenities,
      phone: h.phone,
      hours: h.workingHours,
      mapsUrl: h.mapsUrl,
      address: h.address,
    );
  }
}

class RestaurantDetailsScreen extends StatelessWidget {
  final Restaurant restaurant;
  const RestaurantDetailsScreen({super.key, required this.restaurant});

  @override
  Widget build(BuildContext context) {
    final r = restaurant;
    return _FacilityPage(
      photos: r.photos,
      name: r.name,
      fallbackIcon: Icons.restaurant_rounded,
      badges: [
        if (r.type.isNotEmpty) StatusBadge(label: r.type, tone: Tone.orange, icon: Icons.restaurant_menu_rounded),
        StatusBadge(label: context.tr('شريك معتمد', 'Verified partner'), tone: Tone.success, icon: Icons.verified_rounded),
      ],
      stars: 0,
      city: r.city,
      ratingAvg: r.ratingAvg,
      reviewsCount: r.reviewsCount,
      discount: r.discountPercentage,
      tagline: context.tr(
          '${r.type.isEmpty ? 'نكهات أصيلة' : 'نكهات ${r.type}'}${r.city.isEmpty ? '' : ' في قلب ${r.city}'} بانتظارك',
          'Authentic flavours${r.city.isEmpty ? '' : ' in the heart of ${r.city}'} await you'),
      aboutTitle: context.tr('عن المطعم', 'About'),
      description: r.description,
      featuresTitle: context.tr('المميزات', 'Features'),
      features: r.features,
      phone: r.phone,
      hours: r.workingHours,
      mapsUrl: r.mapsUrl,
      address: r.address,
    );
  }
}

class GuideDetailsScreen extends StatelessWidget {
  final Guide guide;
  const GuideDetailsScreen({super.key, required this.guide});

  @override
  Widget build(BuildContext context) {
    final g = guide;
    final top = MediaQuery.of(context).padding.top;
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Container(
              padding: EdgeInsets.fromLTRB(Gap.page, top + 8, Gap.page, 28),
              decoration: const BoxDecoration(
                gradient: AppGradients.sun,
                borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
              ),
              child: Column(
                children: [
                  Align(
                    alignment: AlignmentDirectional.centerStart,
                    child: IconButton(
                      tooltip: context.tr('رجوع', 'Back'),
                      style: IconButton.styleFrom(backgroundColor: Colors.white.withValues(alpha: 0.16)),
                      icon: Icon(context.isAr ? Icons.arrow_forward_rounded : Icons.arrow_back_rounded, color: Colors.white),
                      onPressed: () => Navigator.of(context).maybePop(),
                    ),
                  ),
                  DelniAvatar(path: g.avatar, name: g.name, size: 104, ring: Colors.white),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Flexible(
                        child: Text(g.name,
                            textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontSize: 21, fontWeight: FontWeight.w900)),
                      ),
                      const SizedBox(width: 6),
                      const Icon(Icons.verified_rounded, color: AppColors.onDarkSoft, size: 22),
                    ],
                  ),
                  Text(context.tr('مرشد سياحي معتمد من دلّني', 'Delni licensed tour guide'),
                      style: const TextStyle(color: Colors.white70, fontSize: 13, fontWeight: FontWeight.w600)),
                  const SizedBox(height: 10),
                  StatusBadge(
                    label: !g.isAvailable
                        ? context.tr('في إجازة حالياً', 'On leave')
                        : g.availableForPrivate
                            ? context.tr('متاح للرحلات الخاصة', 'Available for private trips')
                            : context.tr('مشغول برحلات دلّني المجدولة', 'Busy with scheduled trips'),
                    tone: g.canTakePrivate ? Tone.success : Tone.warning,
                    icon: g.canTakePrivate ? Icons.check_circle_rounded : Icons.event_busy_rounded,
                  ),
                ],
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: StatTile(
                          value: '${g.experienceYears}',
                          label: context.tr('سنوات الخبرة', 'Years exp.'),
                          icon: Icons.workspace_premium_rounded,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: StatTile(
                          value: g.reviewsCount > 0 ? g.ratingAvg.toStringAsFixed(1) : '—',
                          label: context.tr('${g.reviewsCount} تقييم', '${g.reviewsCount} reviews'),
                          icon: Icons.star_rounded,
                          tone: Tone.warning,
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: StatTile(
                          value: '${g.toursCompleted}',
                          label: context.tr('جولة مكتملة', 'Tours done'),
                          icon: Icons.flag_rounded,
                          tone: Tone.success,
                        ),
                      ),
                    ],
                  ),
                  if (g.bio.isNotEmpty) ...[
                    DetailSection(title: context.tr('نبذة', 'About')),
                    ExpandableText(g.bio),
                  ],
                  DetailSection(title: context.tr('اللغات', 'Languages')),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: guideLanguages(context, g).map((l) => StatusBadge(label: l, tone: Tone.primary, icon: Icons.translate_rounded)).toList(),
                  ),
                  if (g.places.isNotEmpty) ...[
                    DetailSection(title: context.tr('أماكن العمل', 'Works at')),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: g.places.map((p) => StatusBadge(label: p, tone: Tone.orange, icon: Icons.place_rounded)).toList(),
                    ),
                  ],
                  if (g.workingDays.isNotEmpty) ...[
                    DetailSection(title: context.tr('أيام العمل', 'Working days')),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: g.workingDays.map((d) => StatusBadge(label: context.sv(d), tone: Tone.neutral)).toList(),
                    ),
                  ],
                  if (g.pricePerDay > 0) ...[
                    DetailSection(title: context.tr('الأجر اليومي', 'Daily rate')),
                    Text(context.money(g.pricePerDay), style: AppText.price),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: BookingBar(
        price: 0,
        unit: '',
        icon: Icons.auto_awesome_rounded,
        label: context.tr('اطلب رحلة خاصة مع هذا المرشد', 'Request a private trip with this guide'),
        onPressed: g.canTakePrivate ? () => openPrivateTripRequest(context, guide: g) : null,
      ),
    );
  }
}

/// World Heritage sites are visited only on the scheduled trips, so no private trip is offered for them
/// (same rule as the platform's landmark window).
bool isUnescoSite(String name) => ['لبدة', 'صبراتة', 'غدامس', 'شحات', 'أكاكوس'].any(name.contains);

class PlaceDetailsScreen extends StatelessWidget {
  final Place place;
  const PlaceDetailsScreen({super.key, required this.place});

  @override
  Widget build(BuildContext context) {
    final p = place;
    final trips = (AppScope.of(context).catalog.trips ?? []).where((t) => t.destinations.contains(p.name)).toList();
    return Scaffold(
      backgroundColor: Colors.white,
      body: CustomScrollView(
        slivers: [
          DetailHeader(photos: [p.image], title: p.name, fallbackIcon: Icons.account_balance_rounded),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xxl),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      if (p.category.isNotEmpty) StatusBadge(label: p.category, tone: Tone.orange, icon: Icons.category_rounded),
                      if (p.region.isNotEmpty) StatusBadge(label: p.region, tone: Tone.primary, icon: Icons.map_rounded),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(p.name, style: AppText.h1),
                  if (p.description.isNotEmpty) ...[
                    DetailSection(title: context.tr('عن المعلم', 'About')),
                    ExpandableText(p.description),
                  ],
                  if (p.highlights.isNotEmpty) ...[
                    DetailSection(title: context.tr('أبرز ما فيه', 'Highlights')),
                    ...p.highlights.map((h) => Padding(
                          padding: const EdgeInsets.only(bottom: 8),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Padding(
                                padding: EdgeInsets.only(top: 3),
                                child: Icon(Icons.check_circle_rounded, size: 18, color: AppColors.accent),
                              ),
                              const SizedBox(width: 8),
                              Expanded(child: Text(h, style: AppText.body)),
                            ],
                          ),
                        )),
                  ],
                  if (p.mapsUrl.isNotEmpty) ...[
                    const SizedBox(height: Gap.lg),
                    ContactActions(phone: '', mapsUrl: p.mapsUrl),
                  ],
                  if (trips.isNotEmpty) ...[
                    DetailSection(title: context.tr('رحلات تزور هذا المعلم', 'Trips visiting this landmark')),
                    ...trips.map((t) => Padding(
                          padding: const EdgeInsets.only(bottom: Gap.lg),
                          child: TripCard(
                            trip: t,
                            onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => TripDetailsScreen(trip: t))),
                          ),
                        )),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: isUnescoSite(p.name)
          ? Container(
              padding: EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 12 + MediaQuery.of(context).padding.bottom),
              decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
              child: InlineMessage(
                tone: Tone.warning,
                icon: Icons.account_balance_rounded,
                text: context.tr(
                  'موقع تراث عالمي محمي (اليونسكو) — متاح للزيارة حصرياً عبر الرحلات المجدولة المعتمدة حفاظاً على التراث.',
                  'UNESCO protected World Heritage Site — visited only through authorized scheduled trips to preserve the heritage.',
                ),
              ),
            )
          : BookingBar(
              price: 0,
              unit: '',
              icon: Icons.auto_awesome_rounded,
              label: context.tr('خطط لرحلة خاصة إلى هنا', 'Plan a private trip here'),
              onPressed: () => openPrivateTripRequest(context, place: p),
            ),
    );
  }
}
