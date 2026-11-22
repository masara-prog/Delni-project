import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/favorite_heart.dart';
import '../../widgets/states.dart';
import '../auth/auth_widgets.dart';
import '../auth/login_screen.dart';
import 'detail_screens.dart';
import 'tourist_shell.dart';
import 'trip_details_screen.dart';

/// The tourist's favourites: everything saved with a heart, with filters, search, one-tap removal (with undo)
/// and «view» that opens the exact trip, hotel, restaurant or landmark.
class FavoritesScreen extends StatefulWidget {
  const FavoritesScreen({super.key});

  @override
  State<FavoritesScreen> createState() => _FavoritesScreenState();
}

/// Filter chips: key, Arabic, English, icon, the item types it shows.
const _filters = <(String, String, String, IconData, Set<String>)>[
  ('all', 'الكل', 'All', Icons.favorite_rounded, {}),
  ('trips', 'الرحلات', 'Trips', Icons.route_rounded, {'daily_trip', 'weekly_trip'}),
  ('landmark', 'المعالم', 'Landmarks', Icons.account_balance_rounded, {'landmark'}),
  ('hotel', 'الفنادق', 'Hotels', Icons.hotel_rounded, {'hotel'}),
  ('restaurant', 'المطاعم', 'Restaurants', Icons.restaurant_rounded, {'restaurant'}),
  ('vehicle', 'المركبات', 'Vehicles', Icons.directions_car_rounded, {'vehicle'}),
];

class _FavoritesScreenState extends State<FavoritesScreen> {
  String _filter = 'all';
  String _query = '';
  final Set<String> _leaving = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final state = AppScope.read(context);
      if (state.session?.isTourist == true) state.favorites.load();
      if (!state.catalog.loaded && !state.catalog.loading) state.catalog.load();
    });
  }

  List<FavoriteItem> _visible(List<FavoriteItem> all) {
    final types = _filters.firstWhere((f) => f.$1 == _filter).$5;
    final q = _query.trim().toLowerCase();
    return all.where((f) {
      if (types.isNotEmpty && !types.contains(f.type)) return false;
      if (q.isEmpty) return true;
      return '${f.title} ${f.subtitle} ${f.extra}'.toLowerCase().contains(q);
    }).toList();
  }

  /// Heart on a card: the card shrinks away, then an «undo» bar is offered.
  Future<void> _remove(FavoriteItem f) async {
    final state = AppScope.read(context);
    HapticFeedback.lightImpact();
    setState(() => _leaving.add(f.key));
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;
    final error = await state.favorites.toggle(f.type, f.itemId);
    if (!mounted) return;
    setState(() => _leaving.remove(f.key));
    if (error != null) {
      showAppSnack(context, error, tone: Tone.danger);
      return;
    }
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(
        backgroundColor: AppColors.navy,
        duration: const Duration(seconds: 5),
        content: Row(children: [
          const Icon(Icons.heart_broken_rounded, color: Colors.white, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(context.tr('أُزيل «${_name(context, f)}» من مفضلتك', 'Removed «${_name(context, f)}» from your favourites'))),
        ]),
        action: SnackBarAction(
          label: context.tr('تراجع', 'Undo'),
          textColor: AppColors.desertSand,
          onPressed: () => state.favorites.toggle(f.type, f.itemId, display: f),
        ),
      ));
  }

  /// «View»: the item's own page, found in the catalog by its id.
  Future<void> _open(FavoriteItem f) async {
    final state = AppScope.read(context);
    final catalog = state.catalog;
    if (!catalog.loaded) await catalog.load();
    if (!mounted) return;
    Widget? page;
    switch (f.type) {
      case 'daily_trip' || 'weekly_trip':
        final kind = f.type == 'weekly_trip' ? 'weekly' : 'daily';
        final t = catalog.trips?.where((t) => t.id == f.itemId && t.type == kind).firstOrNull;
        if (t != null) page = TripDetailsScreen(trip: t);
      case 'hotel':
        final h = catalog.hotels?.where((h) => h.id == f.itemId).firstOrNull;
        if (h != null) page = HotelDetailsScreen(hotel: h);
      case 'restaurant':
        final r = catalog.restaurants?.where((r) => r.id == f.itemId).firstOrNull;
        if (r != null) page = RestaurantDetailsScreen(restaurant: r);
      case 'landmark':
        final p = catalog.places?.where((p) => p.id == f.itemId).firstOrNull;
        if (p != null) page = PlaceDetailsScreen(place: p);
      case 'vehicle':
        _showVehicle(f);
        return;
    }
    if (page == null) {
      showAppSnack(context, context.tr('هذا العنصر لم يعد متاحاً حالياً في الدليل', 'This item is no longer available in the guide'),
          tone: Tone.warning);
      return;
    }
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => page!));
  }

  void _showVehicle(FavoriteItem f) {
    showAppSheet(context, builder: (ctx) {
      return Padding(
        padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SheetHeader(title: _name(context, f)),
            DelniImage(f.image, height: 170, width: double.infinity, fallbackIcon: Icons.directions_car_rounded, borderRadius: BorderRadius.circular(AppRadius.lg)),
            const SizedBox(height: Gap.md),
            InfoRow(icon: Icons.pin_rounded, label: context.tr('رقم اللوحة', 'Plate number'), value: f.subtitle),
            if (f.extra.isNotEmpty)
              InfoRow(icon: Icons.event_seat_rounded, label: context.tr('عدد المقاعد', 'Seats'), value: f.extra),
            const SizedBox(height: Gap.sm),
            Text(context.tr('تُحجز المركبات ضمن الرحلات أو عبر طلب رحلة خاصة VIP.', 'Vehicles are booked within trips or through a private VIP trip request.'),
                style: AppText.bodyMuted),
          ],
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final session = state.session;
    final signedIn = session != null && session.isTourist;
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        centerTitle: false,
        title: Row(mainAxisSize: MainAxisSize.min, children: [
          const Icon(Icons.favorite_rounded, color: favoriteRed, size: 24),
          const SizedBox(width: 8),
          Text(context.tr('مفضلتي', 'My favourites'), style: AppText.h1),
        ]),
      ),
      body: !signedIn
          ? EmptyState(
              icon: Icons.favorite_border_rounded,
              title: context.tr('احفظ ما يعجبك', 'Save what you love'),
              message: context.tr('سجّل دخولك كسائح لتجمع رحلاتك وفنادقك ومطاعمك ومعالمك المفضلة في مكان واحد.',
                  'Sign in as a tourist to keep your favourite trips, hotels, restaurants and landmarks in one place.'),
              actionLabel: context.tr('تسجيل الدخول', 'Sign in'),
              onAction: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen(role: AuthRole.tourist))),
            )
          : ListenableBuilder(
              listenable: state.favorites,
              builder: (context, _) => _body(context, state),
            ),
    );
  }

  Widget _body(BuildContext context, AppState state) {
    final fav = state.favorites;
    final all = fav.items;
    if (all == null) {
      if (fav.failed && !fav.loading) return ErrorState(onRetry: fav.load);
      return const SkeletonList();
    }
    final shown = _visible(all);
    int count(Set<String> types) => types.isEmpty ? all.length : all.where((f) => types.contains(f.type)).length;
    return RefreshIndicator(
      color: AppColors.primary,
      onRefresh: fav.load,
      child: CustomScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        slivers: [
          SliverToBoxAdapter(child: _summary(context, all.length)),
          if (all.isNotEmpty) ...[
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(Gap.page, Gap.md, Gap.page, 0),
                child: TextField(
                  onChanged: (v) => setState(() => _query = v),
                  textInputAction: TextInputAction.search,
                  decoration: InputDecoration(
                    hintText: context.tr('ابحث في مفضلتك...', 'Search your favourites...'),
                    prefixIcon: const Icon(Icons.search_rounded),
                    filled: true,
                    fillColor: Colors.white,
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: const BorderSide(color: AppColors.border)),
                    enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(30), borderSide: const BorderSide(color: AppColors.border)),
                  ),
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: SizedBox(
                height: 58,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 6),
                  children: [
                    for (final f in _filters)
                      if (f.$1 == 'all' || count(f.$5) > 0)
                        _FilterChip(
                          icon: f.$4,
                          label: context.tr(f.$2, f.$3),
                          count: count(f.$5),
                          selected: _filter == f.$1,
                          onTap: () => setState(() => _filter = f.$1),
                        ),
                  ],
                ),
              ),
            ),
          ],
          if (all.isEmpty)
            SliverFillRemaining(
              hasScrollBody: false,
              child: EmptyState(
                icon: Icons.favorite_border_rounded,
                title: context.tr('مفضلتك فارغة', 'Your favourites are empty'),
                message: context.tr('اضغط على ❤️ في أي رحلة أو معلم أو فندق أو مطعم لتجده هنا بسرعة.',
                    'Tap ❤️ on any trip, landmark, hotel or restaurant to find it here quickly.'),
                actionLabel: context.tr('استكشف الآن', 'Explore now'),
                onAction: () {
                  Navigator.of(context).popUntil((r) => r.isFirst);
                  openExplore(context, 0);
                },
              ),
            )
          else if (shown.isEmpty)
            SliverToBoxAdapter(
              child: EmptyState(
                compact: true,
                icon: Icons.search_off_rounded,
                title: context.tr('لا نتائج', 'No results'),
                message: context.tr('لا يوجد في مفضلتك ما يطابق البحث أو التصنيف.', 'Nothing in your favourites matches this search or filter.'),
              ),
            )
          else
            SliverPadding(
              padding: const EdgeInsets.fromLTRB(Gap.page, 6, Gap.page, Gap.xxl),
              sliver: SliverGrid(
                gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                  maxCrossAxisExtent: 260,
                  mainAxisSpacing: 14,
                  crossAxisSpacing: 12,
                  mainAxisExtent: 262,
                ),
                delegate: SliverChildBuilderDelegate(
                  childCount: shown.length,
                  (context, i) {
                    final f = shown[i];
                    return _Appear(
                      key: ValueKey(f.key),
                      index: i,
                      child: AnimatedScale(
                        duration: const Duration(milliseconds: 280),
                        curve: Curves.easeInBack,
                        scale: _leaving.contains(f.key) ? 0.6 : 1,
                        child: AnimatedOpacity(
                          duration: const Duration(milliseconds: 280),
                          opacity: _leaving.contains(f.key) ? 0 : 1,
                          child: _FavoriteCard(item: f, onOpen: () => _open(f), onRemove: () => _remove(f)),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _summary(BuildContext context, int total) {
    return Container(
      margin: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, 0),
      padding: const EdgeInsets.all(Gap.lg),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        gradient: const LinearGradient(colors: [Color(0xFFE11D48), Color(0xFFF97316)], begin: AlignmentDirectional.topStart, end: AlignmentDirectional.bottomEnd),
        boxShadow: const [BoxShadow(color: Color(0x33E11D48), blurRadius: 24, offset: Offset(0, 10), spreadRadius: -8)],
      ),
      child: Row(children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white.withValues(alpha: 0.2)),
          child: const Icon(Icons.favorite_rounded, color: Colors.white, size: 28),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(
              total == 0 ? context.tr('ابدأ قائمتك', 'Start your list') : context.tr('$total عنصر محفوظ', '$total saved'),
              style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 2),
            Text(
              context.tr('كل ما أعجبك في ليبيا، في مكان واحد', 'Everything you loved in Libya, in one place'),
              style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 12.5, fontWeight: FontWeight.w600),
            ),
          ]),
        ),
      ]),
    );
  }
}

String _name(BuildContext context, FavoriteItem f) {
  if (f.title.isNotEmpty) return f.title;
  return _typeLabel(context, f.type);
}

String _typeLabel(BuildContext context, String type) => switch (type) {
      'daily_trip' => context.tr('رحلة يومية', 'Day trip'),
      'weekly_trip' => context.tr('رحلة أسبوعية', 'Weekly trip'),
      'hotel' => context.tr('فندق وإقامة', 'Hotel'),
      'restaurant' => context.tr('مطعم ومقهى', 'Restaurant'),
      'landmark' => context.tr('معلم سياحي', 'Landmark'),
      'vehicle' => context.tr('مركبة', 'Vehicle'),
      _ => type,
    };

(IconData, Color) _typeStyle(String type) => switch (type) {
      'daily_trip' => (Icons.wb_sunny_rounded, AppColors.primary),
      'weekly_trip' => (Icons.date_range_rounded, AppColors.brandOrange),
      'hotel' => (Icons.hotel_rounded, const Color(0xFF6D28D9)),
      'restaurant' => (Icons.restaurant_rounded, const Color(0xFFB45309)),
      'landmark' => (Icons.account_balance_rounded, AppColors.accent),
      _ => (Icons.directions_car_rounded, AppColors.navy),
    };

/// The detail line under the name (price, stars, category, seats...).
String _extraLine(BuildContext context, FavoriteItem f) {
  final e = f.extra.trim();
  if (e.isEmpty) return '';
  return switch (f.type) {
    'daily_trip' => context.tr('$e د.ل للمقعد', '$e LYD per seat'),
    'weekly_trip' => context.tr('تبدأ $e', 'Starts $e'),
    'hotel' => (int.tryParse(e) ?? 0) > 0 ? '★' * (int.tryParse(e)!.clamp(1, 5)) : '',
    'vehicle' => context.tr('$e مقعد', '$e seats'),
    _ => e,
  };
}

class _FavoriteCard extends StatelessWidget {
  final FavoriteItem item;
  final VoidCallback onOpen;
  final VoidCallback onRemove;

  const _FavoriteCard({required this.item, required this.onOpen, required this.onRemove});

  @override
  Widget build(BuildContext context) {
    final f = item;
    final (icon, color) = _typeStyle(f.type);
    final extra = _extraLine(context, f);
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      clipBehavior: Clip.antiAlias,
      elevation: 0,
      child: InkWell(
        onTap: onOpen,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SizedBox(
                height: 128,
                child: Stack(fit: StackFit.expand, children: [
                  Hero(tag: 'fav-${f.key}', child: DelniImage(f.image, fallbackIcon: icon)),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        stops: [0.45, 1],
                        colors: [Colors.transparent, Color(0x880F172A)],
                      ),
                    ),
                  ),
                  PositionedDirectional(
                    top: 8,
                    start: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.95), borderRadius: BorderRadius.circular(30)),
                      child: Row(mainAxisSize: MainAxisSize.min, children: [
                        Icon(icon, size: 13, color: color),
                        const SizedBox(width: 4),
                        Text(_typeLabel(context, f.type), style: TextStyle(color: color, fontSize: 10.5, fontWeight: FontWeight.w800)),
                      ]),
                    ),
                  ),
                  PositionedDirectional(
                    top: 6,
                    end: 6,
                    child: _RemoveHeart(onTap: onRemove),
                  ),
                  if (extra.isNotEmpty)
                    PositionedDirectional(
                      bottom: 8,
                      start: 10,
                      end: 10,
                      child: Text(extra,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
                    ),
                ]),
              ),
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(10, 10, 10, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(_name(context, f), maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3.copyWith(fontSize: 14, height: 1.35)),
                      const SizedBox(height: 4),
                      if (f.subtitle.isNotEmpty)
                        Row(children: [
                          Icon(f.type == 'vehicle' ? Icons.pin_rounded : Icons.location_on_rounded, size: 14, color: AppColors.brandOrange),
                          const SizedBox(width: 3),
                          Expanded(child: Text(f.subtitle, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption)),
                        ]),
                      const Spacer(),
                      SizedBox(
                        width: double.infinity,
                        height: 34,
                        child: FilledButton.icon(
                          onPressed: onOpen,
                          style: FilledButton.styleFrom(
                            backgroundColor: AppColors.primarySoft,
                            foregroundColor: AppColors.primary,
                            padding: EdgeInsets.zero,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                            textStyle: const TextStyle(fontFamily: AppTheme.fontFamily, fontSize: 12.5, fontWeight: FontWeight.w800),
                          ),
                          icon: const Icon(Icons.visibility_rounded, size: 16),
                          label: Text(context.tr('عرض في الدليل', 'View in guide')),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RemoveHeart extends StatelessWidget {
  final VoidCallback onTap;
  const _RemoveHeart({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: context.tr('إزالة من المفضلة', 'Remove from favourites'),
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          width: 34,
          height: 34,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            boxShadow: [BoxShadow(color: Color(0x330F172A), blurRadius: 10, offset: Offset(0, 3))],
          ),
          child: const Icon(Icons.favorite_rounded, color: favoriteRed, size: 19),
        ),
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final int count;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({required this.icon, required this.label, required this.count, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.only(end: 8),
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          curve: Curves.easeOut,
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            color: selected ? AppColors.primary : Colors.white,
            borderRadius: BorderRadius.circular(30),
            border: Border.all(color: selected ? AppColors.primary : AppColors.border),
            boxShadow: selected ? AppShadows.glow : null,
          ),
          child: Row(mainAxisSize: MainAxisSize.min, children: [
            Icon(icon, size: 16, color: selected ? Colors.white : AppColors.mutedText),
            const SizedBox(width: 6),
            Text(label, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800, color: selected ? Colors.white : AppColors.navy)),
            const SizedBox(width: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 1),
              decoration: BoxDecoration(
                color: selected ? Colors.white.withValues(alpha: 0.22) : AppColors.muted,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text('$count', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w800, color: selected ? Colors.white : AppColors.mutedText)),
            ),
          ]),
        ),
      ),
    );
  }
}

/// Cards rise and fade in one after another when the list appears.
class _Appear extends StatelessWidget {
  final int index;
  final Widget child;
  const _Appear({super.key, required this.index, required this.child});

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: Duration(milliseconds: 360 + 60 * index.clamp(0, 8)),
      curve: Curves.easeOutCubic,
      builder: (_, v, child) => Opacity(
        opacity: v,
        child: Transform.translate(offset: Offset(0, 24 * (1 - v)), child: child),
      ),
      child: child,
    );
  }
}
