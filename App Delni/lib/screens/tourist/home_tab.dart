import 'dart:async';
import 'package:flutter/material.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/account_widgets.dart';
import '../../widgets/brand.dart';
import '../../widgets/cards.dart';
import '../../widgets/common.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/states.dart';
import 'detail_screens.dart';
import 'private_trip_screen.dart';
import 'tourist_shell.dart';
import 'trip_details_screen.dart';

class HomeTab extends StatefulWidget {
  const HomeTab({super.key});

  @override
  State<HomeTab> createState() => _HomeTabState();
}

class _HomeTabState extends State<HomeTab> {
  String _type = 'all';
  String _query = '';
  final _search = TextEditingController();

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  void _openTrip(Trip t) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => TripDetailsScreen(trip: t)));

  List<Trip> _filtered(List<Trip> trips) {
    final q = _query.trim();
    return trips.where((t) {
      if (_type != 'all' && t.type != _type) return false;
      if (q.isEmpty) return true;
      return t.title.contains(q) ||
          t.departureCity.contains(q) ||
          t.destinations.any((d) => d.contains(q)) ||
          t.title.toLowerCase().contains(q.toLowerCase());
    }).toList();
  }

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final catalog = state.catalog;
    return ListenableBuilder(
      listenable: catalog,
      builder: (context, _) {
        final trips = catalog.trips;
        return RefreshIndicator(
          onRefresh: catalog.load,
          child: CustomScrollView(
            slivers: [
              SliverToBoxAdapter(child: _Header(session: state.session)),
              if (catalog.failed && !catalog.loading)
                SliverToBoxAdapter(child: OfflineBanner(onRetry: catalog.load, busy: catalog.loading)),
              SliverToBoxAdapter(child: _SearchCard(controller: _search, onChanged: (v) => setState(() => _query = v))),
              if (_query.trim().isEmpty) ...[
                SliverToBoxAdapter(child: _Categories(onTap: (section) => openExplore(context, section))),
                if (trips == null)
                  SliverToBoxAdapter(
                    child: catalog.loading || !catalog.failed
                        ? const SizedBox(
                            height: 240,
                            child: Padding(
                              padding: EdgeInsets.symmetric(horizontal: Gap.page),
                              child: SkeletonBox(height: 220, radius: AppRadius.xl),
                            ),
                          )
                        : ErrorState(onRetry: catalog.load, compact: true),
                  )
                else ...[
                  if (trips.isNotEmpty) ..._featured(context, trips),
                  SliverToBoxAdapter(child: _PrivateTripBanner()),
                  if ((catalog.places ?? []).isNotEmpty) ..._places(context, catalog.places!),
                ],
              ],
              ..._tripList(context, catalog),
              if (_query.trim().isEmpty && (catalog.guides ?? []).isNotEmpty) ..._guides(context, catalog.guides!),
              const SliverToBoxAdapter(child: SizedBox(height: 28)),
            ],
          ),
        );
      },
    );
  }

  List<Widget> _featured(BuildContext context, List<Trip> trips) {
    final featured = [...trips]..sort((a, b) {
        final byRating = b.ratingAvg.compareTo(a.ratingAvg);
        return byRating != 0 ? byRating : b.bookingsCount.compareTo(a.bookingsCount);
      });
    final list = featured.take(6).toList();
    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, Gap.md),
          child: SectionHeader(
            title: context.tr('رحلات مميزة', 'Featured trips'),
            subtitle: context.tr('الأعلى تقييماً وحجزاً', 'Top rated and most booked'),
            actionLabel: context.tr('عرض الكل', 'See all'),
            onAction: () => openExplore(context, 0),
          ),
        ),
      ),
      SliverToBoxAdapter(
        child: SizedBox(
          height: 230,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: Gap.page),
            itemCount: list.length,
            separatorBuilder: (_, __) => const SizedBox(width: 14),
            itemBuilder: (_, i) => TripHeroCard(
              trip: list[i],
              width: MediaQuery.of(context).size.width * 0.78,
              onTap: () => _openTrip(list[i]),
            ),
          ),
        ),
      ),
    ];
  }

  List<Widget> _places(BuildContext context, List<Place> places) => [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, Gap.md),
            child: SectionHeader(
              title: context.tr('معالم ليبيا', 'Landmarks of Libya'),
              actionLabel: context.tr('عرض الكل', 'See all'),
              onAction: () => openExplore(context, 1),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: 190,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: Gap.page),
              itemCount: places.length.clamp(0, 10),
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, i) => PlaceCard(
                place: places[i],
                width: 150,
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => PlaceDetailsScreen(place: places[i]))),
              ),
            ),
          ),
        ),
      ];

  List<Widget> _tripList(BuildContext context, CatalogStore catalog) {
    final trips = catalog.trips;
    if (trips == null) return const [];
    final searching = _query.trim().isNotEmpty;
    final filtered = _filtered(trips);
    final shown = searching ? filtered : filtered.take(4).toList();
    return [
      SliverToBoxAdapter(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, Gap.md),
          child: SectionHeader(
            title: searching ? context.tr('نتائج البحث', 'Search results') : context.tr('رحلات متاحة للحجز', 'Trips open for booking'),
            subtitle: context.tr('${filtered.length} رحلة', '${filtered.length} trips'),
            actionLabel: searching || filtered.length <= 4 ? null : context.tr('عرض الكل', 'See all'),
            onAction: () => openExplore(context, 0),
          ),
        ),
      ),
      SliverToBoxAdapter(
        child: ChoiceChipsRow<String>(
          options: [
            ('all', context.tr('الكل', 'All')),
            ('daily', context.tr('رحلات يومية', 'Day trips')),
            ('weekly', context.tr('رحلات أسبوعية', 'Weekly trips')),
          ],
          selected: _type,
          onSelected: (v) => setState(() => _type = v),
        ),
      ),
      const SliverToBoxAdapter(child: SizedBox(height: Gap.md)),
      if (shown.isEmpty)
        SliverToBoxAdapter(
          child: EmptyState(
            compact: true,
            icon: Icons.travel_explore_rounded,
            title: context.tr('لا توجد رحلات مطابقة', 'No matching trips'),
            message: searching
                ? context.tr('جرّب كلمة بحث أخرى أو غيّر نوع الرحلة.', 'Try another search or trip type.')
                : context.tr('لا توجد رحلات متاحة حالياً، تابعنا قريباً.', 'No trips are open right now. Check back soon.'),
          ),
        )
      else
        SliverPadding(
          padding: const EdgeInsets.symmetric(horizontal: Gap.page),
          sliver: SliverList.separated(
            itemCount: shown.length,
            separatorBuilder: (_, __) => const SizedBox(height: Gap.lg),
            itemBuilder: (_, i) => TripCard(trip: shown[i], onTap: () => _openTrip(shown[i])),
          ),
        ),
    ];
  }

  List<Widget> _guides(BuildContext context, List<Guide> guides) => [
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, Gap.md),
            child: SectionHeader(
              title: context.tr('مرشدون معتمدون', 'Licensed guides'),
              actionLabel: context.tr('عرض الكل', 'See all'),
              onAction: () => openExplore(context, 4),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: SizedBox(
            height: 128,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: Gap.page),
              itemCount: guides.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (_, i) {
                final g = guides[i];
                return InkWell(
                  borderRadius: BorderRadius.circular(AppRadius.md),
                  onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => GuideDetailsScreen(guide: g))),
                  child: Container(
                    width: 104,
                    padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(AppRadius.md),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Column(
                      children: [
                        DelniAvatar(path: g.avatar, name: g.name, size: 54, ring: AppColors.primarySoft),
                        const SizedBox(height: 8),
                        Text(g.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 12)),
                        if (g.reviewsCount > 0)
                          Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.star_rounded, size: 13, color: AppColors.gold),
                              Text(g.ratingAvg.toStringAsFixed(1), style: AppText.caption.copyWith(fontSize: 11)),
                            ],
                          )
                        else
                          Text(context.tr('مرشد معتمد', 'Licensed'), style: AppText.caption.copyWith(fontSize: 10.5)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ),
      ];
}

class _Header extends StatelessWidget {
  final UserSession? session;
  const _Header({required this.session});

  @override
  Widget build(BuildContext context) {
    final guest = session?.isGuest ?? true;
    final firstName = guest ? '' : (session?.name.trim().split(RegExp(r'\s+')).first ?? '');
    final hour = DateTime.now().hour;
    final greeting = hour < 12 ? context.tr('صباح الخير', 'Good morning') : context.tr('مساء الخير', 'Good evening');
    return SafeArea(
      bottom: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 0),
        child: Row(
          children: [
            const DelniMark(size: 44),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    firstName.isEmpty ? greeting : '$greeting، $firstName',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: AppText.h3.copyWith(fontSize: 16),
                  ),
                  Text(
                    guest ? context.tr('أنت تتصفح كزائر', 'You are browsing as a visitor') : context.tr('إلى أين وجهتك القادمة؟', 'Where to next?'),
                    style: AppText.caption,
                  ),
                ],
              ),
            ),
            if (!guest) const NotificationBell(),
          ],
        ),
      ),
    );
  }
}

/// Bright Libya photos that cross-fade with a slow zoom (the platform's home slideshow).
class _LibyaSlideshow extends StatefulWidget {
  const _LibyaSlideshow();

  @override
  State<_LibyaSlideshow> createState() => _LibyaSlideshowState();
}

class _LibyaSlideshowState extends State<_LibyaSlideshow> {
  static const _slides = [
    'assets/images/libya-sabratha-turquoise-sea.jpg',
    'assets/images/libya-ubari-palm-lake.jpg',
    'assets/images/libya-nalut-red-sky.jpg',
    'assets/images/libya-ghadames-palms.jpg',
    'assets/images/libya-leptis-aerial-green.jpg',
    'assets/images/libya-acacus-rocks.jpg',
  ];
  int _index = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      // Respect the phone's "reduce motion" setting: the slideshow stays still
      if (mounted && !MediaQuery.disableAnimationsOf(context)) setState(() => _index = (_index + 1) % _slides.length);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 1200),
      child: TweenAnimationBuilder<double>(
        key: ValueKey(_index),
        tween: Tween(begin: 1.0, end: 1.12),
        duration: const Duration(seconds: 6),
        curve: Curves.easeOut,
        builder: (_, scale, child) => Transform.scale(scale: scale, child: child),
        child: Image.asset(_slides[_index], fit: BoxFit.cover, width: double.infinity, height: double.infinity, cacheWidth: 900),
      ),
    );
  }
}

class _SearchCard extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;

  const _SearchCard({required this.controller, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, 0),
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.soft),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        child: Stack(
          children: [
            const Positioned.fill(child: _LibyaSlideshow()),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: AlignmentDirectional.topStart,
                    end: AlignmentDirectional.bottomEnd,
                    colors: [AppColors.primary.withValues(alpha: 0.82), AppColors.navy.withValues(alpha: 0.55)],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    context.tr('اكتشف ليبيا مع دلني', 'Discover Libya with Delni'),
                    style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    context.tr('من لبدة وصبراتة إلى غدامس وأكاكوس', 'From Leptis and Sabratha to Ghadames and Acacus'),
                    style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 14),
                  TextField(
                    controller: controller,
                    onChanged: onChanged,
                    textInputAction: TextInputAction.search,
                    style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                    decoration: InputDecoration(
                      hintText: context.tr('ابحث عن رحلة، مدينة أو وجهة...', 'Search a trip, city or destination...'),
                      prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
                      suffixIcon: controller.text.isEmpty
                          ? null
                          : IconButton(
                              tooltip: context.tr('مسح البحث', 'Clear search'),
                              icon: const Icon(Icons.close_rounded, size: 19),
                              onPressed: () {
                                controller.clear();
                                onChanged('');
                              },
                            ),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide.none),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// The sections of the app shown as real Libya photographs: the places themselves are the navigation.
class _Categories extends StatelessWidget {
  final ValueChanged<int> onTap;
  const _Categories({required this.onTap});

  @override
  Widget build(BuildContext context) {
    final items = [
      ('assets/images/libya-sabratha-turquoise-sea.jpg', context.tr('الرحلات', 'Trips'), Icons.route_rounded, 0),
      ('assets/images/dest-leptis-arch.jpg', context.tr('المعالم', 'Landmarks'), Icons.account_balance_rounded, 1),
      ('assets/images/hotel_resort.jpg', context.tr('الفنادق', 'Hotels'), Icons.hotel_rounded, 2),
      ('assets/images/restaurant-libya.jpg', context.tr('المطاعم', 'Dining'), Icons.restaurant_rounded, 3),
      ('assets/images/guide-hero.jpg', context.tr('المرشدون', 'Guides'), Icons.badge_rounded, 4),
    ];
    return Padding(
      padding: const EdgeInsets.only(top: Gap.xl),
      child: SizedBox(
        height: 132,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: Gap.page),
          itemCount: items.length,
          separatorBuilder: (_, __) => const SizedBox(width: 10),
          itemBuilder: (_, i) {
            final c = items[i];
            return Semantics(
              button: true,
              label: c.$2,
              child: GestureDetector(
                onTap: () => onTap(c.$4),
                child: Container(
                  width: 108,
                  decoration: BoxDecoration(borderRadius: BorderRadius.circular(AppRadius.lg), boxShadow: AppShadows.card),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(AppRadius.lg),
                    child: Stack(
                      fit: StackFit.expand,
                      children: [
                        Image.asset(c.$1, fit: BoxFit.cover, cacheWidth: 360),
                        const DecoratedBox(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              stops: [0.35, 1],
                              colors: [Colors.transparent, Color(0xD90F172A)],
                            ),
                          ),
                        ),
                        PositionedDirectional(
                          top: 10,
                          start: 10,
                          child: Container(
                            width: 30,
                            height: 30,
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.92), shape: BoxShape.circle),
                            child: Icon(c.$3, size: 17, color: AppColors.primary),
                          ),
                        ),
                        PositionedDirectional(
                          start: 10,
                          end: 8,
                          bottom: 10,
                          child: Text(c.$2,
                              maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 14.5, fontWeight: FontWeight.w900)),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class _PrivateTripBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, 0),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(AppRadius.xl),
          onTap: () => openPrivateTripRequest(context),
          child: Ink(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(AppRadius.xl),
              gradient: const LinearGradient(colors: [AppColors.navy, AppColors.primary]),
              boxShadow: AppShadows.card,
            ),
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(color: AppColors.gold.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(16)),
                    child: const Icon(Icons.auto_awesome_rounded, color: AppColors.gold, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(context.tr('رحلة خاصة VIP', 'Private VIP trip'),
                            style: const TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900)),
                        const SizedBox(height: 2),
                        Text(
                          context.tr('اختر المعالم والتاريخ، وتصمم لك الإدارة البرنامج والتسعيرة.',
                              'Pick the landmarks and date — the team designs your program and price.'),
                          style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.5, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                    child: Icon(context.isAr ? Icons.arrow_back_rounded : Icons.arrow_forward_rounded, color: AppColors.primary, size: 18),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
