import 'package:flutter/material.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/cards.dart';
import '../../widgets/common.dart';
import '../../widgets/states.dart';
import 'detail_screens.dart';
import 'trip_details_screen.dart';

/// Browse the platform catalog: trips, landmarks, hotels, restaurants and guides.
class ExploreTab extends StatefulWidget {
  const ExploreTab({super.key});

  @override
  State<ExploreTab> createState() => _ExploreTabState();
}

class _ExploreTabState extends State<ExploreTab> with SingleTickerProviderStateMixin {
  late final TabController _tabs;
  late final ValueNotifier<int> _section;

  @override
  void initState() {
    super.initState();
    _section = AppScope.read(context).exploreSection;
    _tabs = TabController(length: 5, vsync: this, initialIndex: _section.value);
    _section.addListener(_syncSection);
    _tabs.addListener(() {
      if (!_tabs.indexIsChanging) _section.value = _tabs.index;
    });
  }

  void _syncSection() {
    if (_tabs.index != _section.value) _tabs.animateTo(_section.value);
  }

  @override
  void dispose() {
    _section.removeListener(_syncSection);
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final catalog = AppScope.of(context).catalog;
    return Scaffold(
      appBar: AppBar(
        centerTitle: false,
        title: Text(context.tr('استكشف', 'Explore'), style: AppText.h1),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          indicatorSize: TabBarIndicatorSize.label,
          indicatorWeight: 3,
          padding: const EdgeInsets.symmetric(horizontal: 8),
          tabs: [
            Tab(text: context.tr('الرحلات', 'Trips')),
            Tab(text: context.tr('المعالم', 'Landmarks')),
            Tab(text: context.tr('الفنادق', 'Hotels')),
            Tab(text: context.tr('المطاعم', 'Dining')),
            Tab(text: context.tr('المرشدون', 'Guides')),
          ],
        ),
      ),
      body: ListenableBuilder(
        listenable: catalog,
        builder: (context, _) => TabBarView(
          controller: _tabs,
          children: [
            _CatalogList<Trip>(
              items: catalog.trips,
              catalog: catalog,
              icon: Icons.route_rounded,
              emptyTitle: context.tr('لا توجد رحلات متاحة', 'No trips available'),
              searchHint: context.tr('ابحث في الرحلات...', 'Search trips...'),
              city: (t) => t.departureCity,
              matches: (t, q) => t.title.contains(q) || t.departureCity.contains(q) || t.destinations.any((d) => d.contains(q)),
              kind: (t) => t.type,
              kindLabel: (k) => k == 'weekly' ? context.tr('أسبوعية', 'Weekly') : context.tr('يومية', 'Daily'),
              itemBuilder: (t) => TripCard(
                trip: t,
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => TripDetailsScreen(trip: t))),
              ),
            ),
            _CatalogList<Place>(
              items: catalog.places,
              catalog: catalog,
              icon: Icons.account_balance_rounded,
              emptyTitle: context.tr('لا توجد معالم مسجلة', 'No landmarks yet'),
              searchHint: context.tr('ابحث عن معلم...', 'Search landmarks...'),
              city: (p) => p.region,
              matches: (p, q) => p.name.contains(q) || p.category.contains(q) || p.description.contains(q),
              grid: true,
              itemBuilder: (p) => PlaceCard(
                place: p,
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => PlaceDetailsScreen(place: p))),
              ),
            ),
            _CatalogList<Hotel>(
              items: catalog.hotels,
              catalog: catalog,
              icon: Icons.hotel_rounded,
              emptyTitle: context.tr('لا توجد فنادق مسجلة', 'No hotels yet'),
              searchHint: context.tr('ابحث عن فندق أو مدينة...', 'Search a hotel or city...'),
              city: (h) => h.city,
              matches: (h, q) => h.name.contains(q) || h.city.contains(q) || h.name.toLowerCase().contains(q.toLowerCase()),
              // Same wording as the cards: hotel, resort, hotel apartments, desert camp...
              kind: (h) => propertyTypeLabel(context, h.propertyType),
              kindLabel: (k) => k,
              itemBuilder: (h) => HotelCard(
                hotel: h,
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => HotelDetailsScreen(hotel: h))),
              ),
            ),
            _CatalogList<Restaurant>(
              items: catalog.restaurants,
              catalog: catalog,
              icon: Icons.restaurant_rounded,
              emptyTitle: context.tr('لا توجد مطاعم مسجلة', 'No restaurants yet'),
              searchHint: context.tr('ابحث عن مطعم أو مقهى...', 'Search a restaurant or café...'),
              city: (r) => r.city,
              matches: (r, q) => r.name.contains(q) || r.city.contains(q) || r.type.contains(q),
              itemBuilder: (r) => RestaurantCard(
                restaurant: r,
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => RestaurantDetailsScreen(restaurant: r))),
              ),
            ),
            _CatalogList<Guide>(
              items: catalog.guides,
              catalog: catalog,
              icon: Icons.badge_rounded,
              emptyTitle: context.tr('لا يوجد مرشدون معتمدون بعد', 'No licensed guides yet'),
              searchHint: context.tr('ابحث عن مرشد...', 'Search a guide...'),
              city: null,
              matches: (g, q) => g.name.contains(q) || g.places.any((p) => p.contains(q)),
              itemBuilder: (g) => GuideCard(
                guide: g,
                onTap: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => GuideDetailsScreen(guide: g))),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Search box + city chips + list (or grid) with loading, error and empty states.
class _CatalogList<T> extends StatefulWidget {
  final List<T>? items;
  final CatalogStore catalog;
  final IconData icon;
  final String emptyTitle;
  final String searchHint;
  final String Function(T)? city;
  final bool Function(T, String) matches;
  final Widget Function(T) itemBuilder;
  final bool grid;

  /// Optional second filter (trip type, accommodation type); its chips list the kinds present in the data.
  final String Function(T)? kind;
  final String Function(String)? kindLabel;

  const _CatalogList({
    super.key,
    required this.items,
    required this.catalog,
    required this.icon,
    required this.emptyTitle,
    required this.searchHint,
    required this.city,
    required this.matches,
    required this.itemBuilder,
    this.grid = false,
    this.kind,
    this.kindLabel,
  });

  @override
  State<_CatalogList<T>> createState() => _CatalogListState<T>();
}

class _CatalogListState<T> extends State<_CatalogList<T>> with AutomaticKeepAliveClientMixin {
  String _query = '';
  String _city = '';
  String _type = 'all';

  @override
  bool get wantKeepAlive => true;

  @override
  Widget build(BuildContext context) {
    super.build(context);
    final items = widget.items;
    if (items == null) {
      return widget.catalog.failed && !widget.catalog.loading
          ? ErrorState(onRetry: widget.catalog.load)
          : SkeletonList(imageHeight: widget.grid ? 120 : 150);
    }
    final cities = widget.city == null
        ? <String>[]
        : (items.map(widget.city!).where((c) => c.isNotEmpty).toSet().toList()..sort());
    final kinds = widget.kind == null
        ? <String>[]
        : (items.map(widget.kind!).where((k) => k.isNotEmpty).toSet().toList()..sort());
    final q = _query.trim();
    final filtered = items.where((it) {
      if (_city.isNotEmpty && widget.city != null && widget.city!(it) != _city) return false;
      if (widget.kind != null && _type != 'all' && widget.kind!(it) != _type) return false;
      return q.isEmpty || widget.matches(it, q);
    }).toList();

    return RefreshIndicator(
      onRefresh: widget.catalog.load,
      child: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.md),
              child: TextField(
                onChanged: (v) => setState(() => _query = v),
                decoration: InputDecoration(
                  hintText: widget.searchHint,
                  prefixIcon: const Icon(Icons.search_rounded),
                  isDense: true,
                ),
              ),
            ),
          ),
          if (kinds.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(bottom: Gap.sm),
                child: ChoiceChipsRow<String>(
                  options: [
                    ('all', context.tr('كل الأنواع', 'All types')),
                    ...kinds.map((k) => (k, widget.kindLabel?.call(k) ?? k)),
                  ],
                  selected: _type,
                  onSelected: (v) => setState(() => _type = v),
                ),
              ),
            ),
          if (cities.isNotEmpty)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(bottom: Gap.md),
                child: ChoiceChipsRow<String>(
                  options: [('', context.tr('كل المدن', 'All cities')), ...cities.map((c) => (c, c))],
                  selected: _city,
                  onSelected: (v) => setState(() => _city = v),
                ),
              ),
            ),
          if (filtered.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: widget.icon,
                title: items.isEmpty ? widget.emptyTitle : context.tr('لا توجد نتائج مطابقة', 'No matching results'),
                message: items.isEmpty
                    ? context.tr('ستظهر هنا فور إضافتها في دلّني.', 'They will appear here once added on Delni.')
                    : context.tr('جرّب كلمة بحث أخرى أو مدينة مختلفة.', 'Try another search or city.'),
              ),
            )
          else if (widget.grid)
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 220,
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 0.74,
                ),
                delegate: SliverChildBuilderDelegate((_, i) => widget.itemBuilder(filtered[i]), childCount: filtered.length),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
              sliver: SliverList.separated(
                itemCount: filtered.length,
                separatorBuilder: (_, __) => const SizedBox(height: Gap.lg),
                itemBuilder: (_, i) => widget.itemBuilder(filtered[i]),
              ),
            ),
        ],
      ),
    );
  }
}
