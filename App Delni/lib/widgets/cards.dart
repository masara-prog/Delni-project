import 'package:flutter/material.dart';
import '../core/format.dart';
import '../core/i18n.dart';
import '../core/theme.dart';
import '../models.dart';
import 'common.dart';
import 'delni_image.dart';

String tripKindLabel(BuildContext context, String type) =>
    type == 'weekly' ? context.tr('رحلة أسبوعية', 'Weekly trip') : context.tr('رحلة يومية', 'Day trip');

/// Seats line of a trip: daily trips count per run date, weekly trips per trip.
String tripSeatsLabel(BuildContext context, Trip t) {
  if (!t.isWeekly && t.openDates.isEmpty) return context.tr('الحجز مغلق حالياً', 'Booking closed');
  if (t.availableSeats <= 0) return context.tr('مكتملة العدد', 'Fully booked');
  return context.tr('${t.availableSeats} مقعد متاح', '${t.availableSeats} seats left');
}

/// Large trip card for vertical lists.
class TripCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;

  const TripCard({super.key, required this.trip, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    return AppCard(
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              DelniImage(
                t.imageUrl,
                height: 180,
                width: double.infinity,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
              ),
              PositionedDirectional(
                top: 12,
                start: 12,
                child: StatusBadge(
                  label: tripKindLabel(context, t.type),
                  tone: t.isWeekly ? Tone.orange : Tone.primary,
                  icon: t.isWeekly ? Icons.date_range_rounded : Icons.wb_sunny_rounded,
                ),
              ),
              if (t.reviewsCount > 0)
                PositionedDirectional(
                  top: 12,
                  end: 12,
                  child: PhotoBadge(label: context.rating(t.ratingAvg), icon: Icons.star_rounded),
                ),
              if (t.activeOffer != null)
                PositionedDirectional(bottom: 12, start: 12, child: OfferBadge(offer: t.activeOffer!)),
            ],
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(t.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3.copyWith(fontSize: 15.5)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 14,
                  runSpacing: 4,
                  children: [
                    if (t.departureCity.isNotEmpty)
                      MetaItem(icon: Icons.place_outlined, text: context.tr('من ${t.departureCity}', 'From ${t.departureCity}')),
                    if (t.isWeekly && t.durationDays > 0)
                      MetaItem(icon: Icons.schedule_rounded, text: context.tr('${t.durationDays} أيام', '${t.durationDays} days')),
                    if (!t.isWeekly && t.days.isNotEmpty)
                      MetaItem(icon: Icons.event_repeat_rounded, text: t.days.map(context.sv).join('، ')),
                    if (t.isWeekly && t.startDate.isNotEmpty)
                      MetaItem(icon: Icons.event_rounded, text: context.date(t.startDate)),
                  ],
                ),
                const SizedBox(height: 12),
                const Divider(),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Expanded(
                      child: MetaItem(
                        icon: Icons.event_seat_outlined,
                        text: tripSeatsLabel(context, t),
                        color: t.availableSeats > 0 ? AppColors.accent : AppColors.destructive,
                      ),
                    ),
                    if (t.price > 0) TripPrice(trip: t),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Featured trip card (photo with text over it) for horizontal carousels.
class TripHeroCard extends StatelessWidget {
  final Trip trip;
  final VoidCallback onTap;
  final double width;

  const TripHeroCard({super.key, required this.trip, required this.onTap, this.width = 290});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: width,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.card),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          child: Stack(
            fit: StackFit.expand,
            children: [
              DelniImage(t.imageUrl),
              const DecoratedBox(decoration: BoxDecoration(gradient: AppGradients.hero)),
              PositionedDirectional(
                top: 14,
                start: 14,
                child: StatusBadge(
                  label: tripKindLabel(context, t.type),
                  tone: t.isWeekly ? Tone.orange : Tone.primary,
                  dense: true,
                ),
              ),
              if (t.activeOffer != null)
                PositionedDirectional(top: 14, end: 14, child: OfferBadge(offer: t.activeOffer!))
              else if (t.reviewsCount > 0)
                PositionedDirectional(
                  top: 14,
                  end: 14,
                  child: PhotoBadge(label: context.rating(t.ratingAvg), icon: Icons.star_rounded),
                ),
              PositionedDirectional(
                start: 16,
                end: 16,
                bottom: 16,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w800, height: 1.35),
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (t.departureCity.isNotEmpty)
                          Expanded(
                            child: MetaItem(icon: Icons.place_outlined, text: t.departureCity, color: Colors.white70),
                          )
                        else
                          const Spacer(),
                        if (t.price > 0)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(30)),
                            child: Text(context.money(t.offerAppliesNow ? t.offerPrice : t.price),
                                style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w900, color: AppColors.primary)),
                          ),
                      ],
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

/// Orange "-X%" badge of a trip's promotional offer.
class OfferBadge extends StatelessWidget {
  final TripOffer offer;
  const OfferBadge({super.key, required this.offer});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [AppColors.brandOrange, Color(0xFFC56A3D)]),
          borderRadius: BorderRadius.circular(30),
          boxShadow: AppShadows.soft,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.local_offer_rounded, size: 13, color: Colors.white),
            const SizedBox(width: 4),
            Text(
              context.tr('عرض -${offer.discount.toStringAsFixed(0)}%', 'Offer -${offer.discount.toStringAsFixed(0)}%'),
              style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w900, height: 1.2),
            ),
          ],
        ),
      );
}

/// Seat price; when an offer covers the trip's dates: the old price struck through and the saving.
class TripPrice extends StatelessWidget {
  final Trip trip;
  const TripPrice({super.key, required this.trip});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    if (!t.offerAppliesNow) {
      return Text.rich(TextSpan(children: [
        TextSpan(text: context.money(t.price), style: AppText.price.copyWith(fontSize: 17)),
        TextSpan(text: context.tr(' / مقعد', ' / seat'), style: AppText.caption),
      ]));
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.end,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text.rich(TextSpan(children: [
          TextSpan(text: '${context.money(t.price)} ', style: AppText.caption.copyWith(decoration: TextDecoration.lineThrough)),
          TextSpan(text: context.money(t.offerPrice), style: AppText.price.copyWith(fontSize: 17)),
        ])),
        Text(context.tr('وفّر ${context.money(t.price - t.offerPrice)}', 'Save ${context.money(t.price - t.offerPrice)}'),
            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: Color(0xFF047857))),
      ],
    );
  }
}

/// The kind of stay in the app's language (the platform stores English codes such as "hotel").
String propertyTypeLabel(BuildContext context, String value) {
  const ar = {
    'hotel': 'فندق',
    'resort': 'منتجع',
    'apartment': 'شقق فندقية',
    'apartments': 'شقق فندقية',
    'hotel apartments': 'شقق فندقية',
    'guest house': 'دار ضيافة',
    'guesthouse': 'دار ضيافة',
    'hostel': 'نُزل',
    'motel': 'موتيل',
    'villa': 'فيلا',
    'chalet': 'شاليه',
    'camp': 'مخيم',
    'heritage': 'مخيم صحراوي',
    'boutique': 'فندق بوتيك',
  };
  const en = {
    'فندق': 'Hotel',
    'منتجع': 'Resort',
    'شقق فندقية': 'Hotel apartments',
    'دار ضيافة': 'Guest house',
    'مخيم': 'Camp',
    'مخيم صحراوي': 'Desert camp',
  };
  final key = value.trim().toLowerCase();
  final arabic = ar[key] ?? value.trim();
  if (context.isAr) return arabic.isEmpty ? 'فندق' : arabic;
  if (key == 'heritage') return 'Desert camp';
  return en[arabic] ?? (value.isEmpty ? 'Hotel' : value[0].toUpperCase() + value.substring(1));
}

class HotelCard extends StatelessWidget {
  final Hotel hotel;
  final VoidCallback onTap;

  const HotelCard({super.key, required this.hotel, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final h = hotel;
    return AppCard(
      padding: EdgeInsets.zero,
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Stack(
            children: [
              DelniImage(
                h.imageUrl,
                height: 170,
                width: double.infinity,
                fallbackIcon: Icons.hotel_rounded,
                borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg)),
              ),
              if (h.starRating > 0)
                PositionedDirectional(
                  top: 12,
                  start: 12,
                  child: PhotoBadge(label: '★' * h.starRating.clamp(1, 5)),
                ),
              if (h.discountPercentage > 0)
                PositionedDirectional(
                  top: 12,
                  end: 12,
                  child: StatusBadge(
                    label: context.tr('خصم ${h.discountPercentage}%', '${h.discountPercentage}% off'),
                    tone: Tone.success,
                    icon: Icons.local_offer_rounded,
                  ),
                ),
            ],
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(h.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.h3),
                const SizedBox(height: 4),
                Row(
                  children: [
                    if (h.city.isNotEmpty) Flexible(child: MetaItem(icon: Icons.place_outlined, text: h.city)),
                    if (h.propertyType.isNotEmpty) ...[
                      const SizedBox(width: 12),
                      Flexible(child: MetaItem(icon: Icons.apartment_rounded, text: propertyTypeLabel(context, h.propertyType))),
                    ],
                  ],
                ),
                if (h.description.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(h.description, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.bodyMuted.copyWith(fontSize: 12.5, height: 1.5)),
                ],
                const SizedBox(height: 8),
                RatingLine(rating: h.ratingAvg, count: h.reviewsCount),
                if (h.amenities.isNotEmpty) ...[
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      ...h.amenities.take(4).map((a) => StatusBadge(label: a, tone: Tone.neutral, dense: true)),
                      if (h.amenities.length > 4) StatusBadge(label: '+${h.amenities.length - 4}', tone: Tone.primary, dense: true),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class RestaurantCard extends StatelessWidget {
  final Restaurant restaurant;
  final VoidCallback onTap;

  const RestaurantCard({super.key, required this.restaurant, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final r = restaurant;
    return AppCard(
      padding: const EdgeInsets.all(10),
      onTap: onTap,
      child: Row(
        children: [
          DelniImage(r.imageUrl, width: 104, height: 104, fallbackIcon: Icons.restaurant_rounded, borderRadius: BorderRadius.circular(14)),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (r.type.isNotEmpty) StatusBadge(label: r.type, tone: Tone.orange, dense: true),
                const SizedBox(height: 6),
                Text(r.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.h3),
                const SizedBox(height: 4),
                if (r.city.isNotEmpty) MetaItem(icon: Icons.place_outlined, text: r.city),
                if (r.workingHours.isNotEmpty) ...[
                  const SizedBox(height: 2),
                  MetaItem(icon: Icons.schedule_rounded, text: r.workingHours),
                ],
                const SizedBox(height: 6),
                RatingLine(rating: r.ratingAvg, count: r.reviewsCount),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

List<String> guideLanguages(BuildContext context, Guide g) => [
      context.tr('العربية', 'Arabic'),
      if (g.speaksEnglish) context.tr('الإنجليزية', 'English'),
      if (g.speaksFrench) context.tr('الفرنسية', 'French'),
      if (g.speaksItalian) context.tr('الإيطالية', 'Italian'),
    ];

class GuideCard extends StatelessWidget {
  final Guide guide;
  final VoidCallback onTap;

  const GuideCard({super.key, required this.guide, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final g = guide;
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Stack(
                children: [
                  DelniAvatar(path: g.avatar, name: g.name, size: 60, ring: AppColors.primarySoft),
                  PositionedDirectional(
                    bottom: 0,
                    end: 0,
                    child: Container(
                      width: 16,
                      height: 16,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: g.isAvailable ? AppColors.accent : AppColors.gold,
                        border: Border.all(color: Colors.white, width: 2.5),
                      ),
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
                        Flexible(child: Text(g.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.h3)),
                        const SizedBox(width: 4),
                        const Icon(Icons.verified_rounded, size: 17, color: AppColors.primaryGlow),
                      ],
                    ),
                    Text(context.tr('مرشد سياحي معتمد', 'Licensed tour guide'), style: AppText.caption),
                    const SizedBox(height: 4),
                    RatingLine(rating: g.ratingAvg, count: g.reviewsCount),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              if (g.experienceYears > 0)
                StatusBadge(
                  label: context.tr('${g.experienceYears} سنوات خبرة', '${g.experienceYears} yrs experience'),
                  tone: Tone.primary,
                  icon: Icons.workspace_premium_rounded,
                  dense: true,
                ),
              StatusBadge(label: guideLanguages(context, g).join(' • '), tone: Tone.neutral, icon: Icons.translate_rounded, dense: true),
              if (g.toursCompleted > 0)
                StatusBadge(
                  label: context.tr('${g.toursCompleted} جولة مكتملة', '${g.toursCompleted} tours done'),
                  tone: Tone.success,
                  dense: true,
                ),
            ],
          ),
        ],
      ),
    );
  }
}

class PlaceCard extends StatelessWidget {
  final Place place;
  final VoidCallback onTap;
  final double? width;

  const PlaceCard({super.key, required this.place, required this.onTap, this.width});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: place.name,
      child: Material(
        color: AppColors.muted,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: SizedBox(
            width: width,
            child: Stack(
              fit: StackFit.expand,
              children: [
                DelniImage(place.image, fallbackIcon: Icons.account_balance_rounded),
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      stops: [0.4, 1],
                      colors: [Colors.transparent, Color(0xE00F172A)],
                    ),
                  ),
                ),
                if (place.category.isNotEmpty)
                  PositionedDirectional(
                    top: 10,
                    start: 10,
                    end: 10,
                    child: Align(
                      alignment: AlignmentDirectional.centerStart,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.94), borderRadius: BorderRadius.circular(30)),
                        child: Text(place.category,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: AppColors.primary, fontSize: 10.5, fontWeight: FontWeight.w800)),
                      ),
                    ),
                  ),
                PositionedDirectional(
                  start: 12,
                  end: 12,
                  bottom: 12,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Text(place.name,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900, height: 1.25)),
                      ),
                      Container(
                        width: 28,
                        height: 28,
                        decoration: const BoxDecoration(color: AppColors.brandOrange, shape: BoxShape.circle),
                        child: Icon(context.isAr ? Icons.arrow_back_rounded : Icons.arrow_forward_rounded, color: Colors.white, size: 16),
                      ),
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
