import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/account_widgets.dart';
import '../../widgets/cards.dart';
import '../../widgets/common.dart';
import '../../widgets/contact.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/slideshow.dart';
import '../../widgets/states.dart';
import '../shared/notifications_screen.dart';
import '../tourist/explore_tab.dart';
import '../tourist/detail_widgets.dart';
import 'guide_profile_edit.dart';
import 'guide_tools.dart';

/// Guide dashboard (GET /dashboard/guide/{licence}): assigned trips, passengers, availability, profile.
class GuideHome extends StatefulWidget {
  const GuideHome({super.key});

  @override
  State<GuideHome> createState() => _GuideHomeState();
}

class _GuideHomeState extends State<GuideHome> {
  GuideDashboard? _data;
  Guide? _public;
  bool _failed = false;
  bool _loading = false;
  bool _savingAvailability = false;
  String _filter = 'all';

  Timer? _refresh;
  ValueNotifier<int>? _tab;

  @override
  void initState() {
    super.initState();
    _load();
    // Trips the administration assigns (private trips included) appear without leaving the dashboard
    _refresh = Timer.periodic(const Duration(seconds: 45), (_) => _load());
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // The selected tab lives in the app state, so a notification can open "My trips"
    final tab = AppScope.read(context).guideTab;
    if (_tab != tab) {
      _tab?.removeListener(_onTab);
      _tab = tab..addListener(_onTab);
    }
  }

  void _onTab() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _refresh?.cancel();
    _tab?.removeListener(_onTab);
    super.dispose();
  }

  int get _tabIndex => _tab?.value ?? 0;
  set _tabIndex(int i) => _tab?.value = i;

  Future<void> _load() async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _failed = false;
    });
    final data = await ApiService.fetchGuideDashboard();
    Guide? public;
    if (data != null) public = await ApiService.fetchGuide(data.guide.licenseNumber);
    if (!mounted) return;
    setState(() {
      _loading = false;
      _data = data ?? _data;
      _public = public ?? _public;
      _failed = data == null;
    });
    AppScope.read(context).refreshUnread();
  }

  Future<void> _setAvailable(bool available) async {
    setState(() => _savingAvailability = true);
    final res = await ApiService.setGuideAvailability(available);
    if (!mounted) return;
    setState(() => _savingAvailability = false);
    showAppSnack(context, res.success ? (res.message.isEmpty ? context.tr('تم التحديث', 'Updated') : res.message) : res.message,
        tone: res.success ? Tone.success : Tone.danger);
    if (res.success) _load();
  }

  Future<void> _respond(GuideTrip trip, bool accept) async {
    // Same as the platform: declining asks for confirmation only (no reason), the administration is told
    if (!accept) {
      final ok = await confirmDialog(
        context,
        title: context.tr('الاعتذار عن الرحلة', 'Decline the trip'),
        message: context.tr(
          'هل تريد الاعتذار عن الرحلة «${_guideTripTitle(context, trip)}»؟ سيتم إشعار الإدارة.',
          'Decline the trip “${_guideTripTitle(context, trip)}”? The administration will be notified.',
        ),
        confirmLabel: context.tr('اعتذار', 'Decline'),
        danger: true,
        icon: Icons.event_busy_rounded,
      );
      if (!ok) return;
    }
    if (!mounted) return;
    final res = await ApiService.respondToTrip(kind: trip.kind, tripId: trip.id, accept: accept);
    if (!mounted) return;
    showAppSnack(context, res.success ? (res.message.isEmpty ? context.tr('تم إرسال ردك', 'Response sent') : res.message) : res.message,
        tone: res.success ? Tone.success : Tone.danger);
    if (res.success) _load();
  }

  void _openTrip(GuideTrip t) => Navigator.of(context).push(MaterialPageRoute(
        builder: (_) => GuideTripScreen(trip: t, onRespond: t.awaitsGuide ? (a) => _respond(t, a) : null),
      ));

  Future<void> _editProfile() async {
    final d = _data;
    if (d == null) return;
    final saved = await Navigator.of(context).push<bool>(MaterialPageRoute(
      builder: (_) => GuideProfileEditScreen(guide: d.guide, licenseExpiry: d.licenseExpiry, email: AppScope.read(context).session?.email ?? ''),
    ));
    if (saved == true) _load();
  }

  @override
  Widget build(BuildContext context) {
    final data = _data;
    final Widget body;
    if (data == null) {
      // The pages need the dashboard data, so nothing is built from it before it arrives
      body = _failed
          ? SafeArea(
              child: ErrorState(
                onRetry: _load,
                message: context.tr('تعذر تحميل لوحة المرشد من الخادم. تحقق من الاتصال ثم أعد المحاولة.', 'Could not load your guide dashboard. Check your connection and try again.'),
              ),
            )
          : const SafeArea(child: SkeletonList(count: 3, imageHeight: 80));
    } else {
      body = IndexedStack(index: _tabIndex, children: [_overview(context, data), _trips(context, data), _account(context, data)]);
    }
    return Scaffold(
      body: body,
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
        child: NavigationBar(
          selectedIndex: _tabIndex,
          onDestinationSelected: (i) => setState(() => _tabIndex = i),
          destinations: [
            NavigationDestination(icon: const Icon(Icons.dashboard_outlined), selectedIcon: const Icon(Icons.dashboard_rounded), label: context.tr('لوحتي', 'Dashboard')),
            NavigationDestination(
              icon: Badge(isLabelVisible: (data?.pendingCount ?? 0) > 0, label: Text('${data?.pendingCount ?? 0}'), child: const Icon(Icons.route_outlined)),
              selectedIcon: const Icon(Icons.route_rounded),
              label: context.tr('رحلاتي', 'My trips'),
            ),
            NavigationDestination(icon: const Icon(Icons.person_outline_rounded), selectedIcon: const Icon(Icons.person_rounded), label: context.tr('حسابي', 'Account')),
          ],
        ),
      ),
    );
  }

  // --- Overview (same blocks as the platform's guide dashboard) ---

  Widget _overview(BuildContext context, GuideDashboard d) {
    final g = d.guide;
    final pending = d.trips.where((t) => t.awaitsGuide).toList();
    final active = d.trips.where((t) => !t.awaitsGuide && t.approvalStatus != GuideTrip.declined && t.isActive).toList();
    final tours = _public?.toursCompleted ?? g.toursCompleted;
    final heroPhotos = d.trips.expand((t) => t.photos).toList();
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _GuideHero(
            guide: g,
            tours: tours,
            photos: heroPhotos,
            savingAvailability: _savingAvailability,
            onAvailability: _setAvailable,
          ),
          if (_failed) OfflineBanner(onRetry: _load, busy: _loading),
          Padding(
            padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, Gap.xxl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _StatRow(children: [
                  _StatCard(
                    label: context.tr('الرحلة النشطة الحالية', 'Current active trip'),
                    value: active.isEmpty ? context.tr('لا يوجد رحلة حالياً', 'No trip right now') : _guideTripTitle(context, active.first),
                    icon: Icons.explore_rounded,
                    color: const Color(0xFF1ABC9C),
                    small: true,
                    onTap: active.isEmpty ? null : () => _openTrip(active.first),
                  ),
                  _StatCard(
                    label: context.tr('الرحلات بانتظار القبول', 'Awaiting your reply'),
                    value: '${pending.length}',
                    icon: Icons.pending_actions_rounded,
                    color: AppColors.gold,
                    onTap: pending.isEmpty ? null : () => setState(() => _tabIndex = 1),
                  ),
                ]),
                const SizedBox(height: 12),
                _StatRow(children: [
                  _StatCard(
                    label: context.tr('أجر اليوم للرحلات الخاصة', 'Daily rate (private trips)'),
                    value: g.pricePerDay > 0 ? context.tr('${g.pricePerDay.toStringAsFixed(0)} د.ل / يوم', '${g.pricePerDay.toStringAsFixed(0)} LYD / day') : '—',
                    icon: Icons.payments_rounded,
                    color: const Color(0xFF10B981),
                    small: true,
                  ),
                  _StatCard(
                    label: context.tr('إجمالي الجولات المكتملة', 'Completed tours'),
                    value: context.tr('$tours جولة', '$tours tours'),
                    icon: Icons.emoji_events_rounded,
                    color: AppColors.brandOrange,
                  ),
                ]),
                if (pending.isNotEmpty) ...[
                  const SizedBox(height: Gap.xl),
                  SectionHeader(title: context.tr('طلبات بانتظار ردك', 'Requests awaiting you'), subtitle: context.tr('وافق أو اعتذر عن الرحلات المسندة', 'Accept or decline assigned trips')),
                  const SizedBox(height: Gap.md),
                  ...pending.map((t) => Padding(
                        padding: const EdgeInsets.only(bottom: Gap.md),
                        child: _GuideTripCard(trip: t, onTap: () => _openTrip(t), onRespond: (a) => _respond(t, a)),
                      )),
                ],
                const SizedBox(height: Gap.xl),
                SectionHeader(
                  title: context.tr('الرحلات المسندة إليك من الإدارة', 'Trips assigned to you'),
                  actionLabel: d.trips.isEmpty ? null : context.tr('عرض الكل', 'See all'),
                  onAction: () => setState(() => _tabIndex = 1),
                ),
                const SizedBox(height: Gap.md),
                if (active.isEmpty)
                  EmptyState(
                    compact: true,
                    icon: Icons.event_available_outlined,
                    title: context.tr('لا توجد رحلات مسندة حالياً', 'No assigned trips right now'),
                    message: context.tr('ستظهر هنا الرحلات التي تسندها لك إدارة دلّني.', 'Trips assigned to you by Delni will appear here.'),
                  )
                else
                  ...active.take(3).map((t) => Padding(
                        padding: const EdgeInsets.only(bottom: Gap.md),
                        child: _GuideTripCard(trip: t, onTap: () => _openTrip(t)),
                      )),
                const SizedBox(height: Gap.lg),
                _LicenseCard(guide: g, expiry: d.licenseExpiry, onManage: _editProfile),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // --- Trips ---

  Widget _trips(BuildContext context, GuideDashboard d) {
    final trips = d.trips.where((t) => _filter == 'all' || t.kind == _filter).toList();
    int count(String k) => k == 'all' ? d.trips.length : d.trips.where((t) => t.kind == k).length;
    return Scaffold(
      appBar: AppBar(centerTitle: false, title: Text(context.tr('رحلاتي', 'My trips'), style: AppText.h1), actions: const [NotificationBell(), SizedBox(width: 12)]),
      body: RefreshIndicator(
        onRefresh: _load,
        child: ListView(
          padding: const EdgeInsets.only(bottom: Gap.xxl),
          children: [
            ChoiceChipsRow<String>(
              options: [
                ('all', context.tr('الكل (${count('all')})', 'All (${count('all')})')),
                ('daily', context.tr('يومية (${count('daily')})', 'Daily (${count('daily')})')),
                ('weekly', context.tr('أسبوعية (${count('weekly')})', 'Weekly (${count('weekly')})')),
                ('private', context.tr('خاصة (${count('private')})', 'Private (${count('private')})')),
              ],
              selected: _filter,
              onSelected: (v) => setState(() => _filter = v),
            ),
            const SizedBox(height: Gap.lg),
            if (trips.isEmpty)
              EmptyState(
                icon: Icons.route_outlined,
                title: context.tr('لا توجد رحلات', 'No trips'),
                message: context.tr('لا توجد رحلات من هذا النوع مسندة إليك.', 'No trips of this kind are assigned to you.'),
              )
            else
              for (var i = 0; i < trips.length; i++)
                Padding(
                  padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.md),
                  child: _Appear(
                    index: i,
                    child: _GuideTripCard(
                      trip: trips[i],
                      onTap: () => _openTrip(trips[i]),
                      onRespond: trips[i].awaitsGuide ? (a) => _respond(trips[i], a) : null,
                    ),
                  ),
                ),
          ],
        ),
      ),
    );
  }

  // --- Account ---

  Widget _account(BuildContext context, GuideDashboard d) {
    final g = d.guide;
    final session = AppScope.of(context).session;
    void open(Widget page) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
    return Scaffold(
      appBar: AppBar(centerTitle: false, title: Text(context.tr('حسابي', 'Account'), style: AppText.h1)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          ProfileHeader(
            name: g.name.isEmpty ? (session?.name ?? '') : g.name,
            subtitle: session?.email ?? '',
            roleLabel: context.tr('مرشد سياحي معتمد', 'Licensed tour guide'),
            roleIcon: Icons.verified_rounded,
            avatar: DelniAvatar(path: g.avatar, name: g.name, size: 62, ring: Colors.white38),
          ),
          const SizedBox(height: Gap.xl),
          MenuGroup(
            title: context.tr('ملفي ورحلاتي', 'My profile & trips'),
            children: [
              MenuTile(
                icon: Icons.manage_accounts_rounded,
                title: context.tr('الملف الشخصي والشهادات', 'Profile & licence'),
                subtitle: context.tr('بياناتك وأيام وأماكن عملك وتعديلها', 'Your details, working days and places'),
                onTap: _editProfile,
              ),
              MenuTile(
                icon: Icons.calendar_month_rounded,
                title: context.tr('تقويم رحلاتي', 'My trips calendar'),
                subtitle: context.tr('أيام رحلاتك على التقويم', 'Your trip days on a calendar'),
                tone: Tone.success,
                onTap: () => open(GuideCalendarScreen(trips: d.trips, onOpen: _openTrip, titleOf: (t) => _guideTripTitle(context, t))),
              ),
              MenuTile(
                icon: Icons.fact_check_rounded,
                title: context.tr('كشف سياح الرحلة', 'Trip manifest'),
                subtitle: context.tr('المسافرون في كل رحلة وحضورهم', 'Passengers of each trip and their check-in'),
                tone: Tone.warning,
                onTap: () => open(GuideManifestScreen(trips: d.trips, onOpen: _openTrip, titleOf: (t) => _guideTripTitle(context, t))),
              ),
              MenuTile(
                icon: Icons.travel_explore_rounded,
                title: context.tr('تصفح التطبيق', 'Browse the app'),
                subtitle: context.tr('الرحلات والمعالم والفنادق المعروضة', 'Trips, landmarks and hotels on offer'),
                tone: Tone.orange,
                onTap: () {
                  final catalog = AppScope.read(context).catalog;
                  if (!catalog.loaded && !catalog.loading) catalog.load();
                  open(const ExploreTab());
                },
              ),
            ],
          ),
          const SizedBox(height: Gap.xl),
          MenuGroup(
            title: context.tr('التطبيق', 'App'),
            children: [
              MenuTile(
                icon: Icons.notifications_none_rounded,
                title: context.tr('الإشعارات', 'Notifications'),
                tone: Tone.orange,
                onTap: () => open(const NotificationsScreen()),
              ),
              const LanguageTile(),
              const SignOutTile(),
            ],
          ),
        ],
      ),
    );
  }
}

/// Fades and lifts a list item in, one after another.
class _Appear extends StatelessWidget {
  final int index;
  final Widget child;
  const _Appear({required this.index, required this.child});

  @override
  Widget build(BuildContext context) => TweenAnimationBuilder<double>(
        tween: Tween(begin: 0, end: 1),
        duration: Duration(milliseconds: 360 + index.clamp(0, 8) * 70),
        curve: Curves.easeOutCubic,
        builder: (_, v, c) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, (1 - v) * 16), child: c)),
        child: child,
      );
}

/// Header: moving Libya / trip photos under the brand blue, the guide's identity and the availability switch.
class _GuideHero extends StatelessWidget {
  final Guide guide;
  final int tours;
  final List<String> photos;
  final bool savingAvailability;
  final ValueChanged<bool> onAvailability;

  const _GuideHero({required this.guide, required this.tours, required this.photos, required this.savingAvailability, required this.onAvailability});

  @override
  Widget build(BuildContext context) {
    final g = guide;
    final langs = guideLanguages(context, g);
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(30)),
        child: Stack(
          children: [
            Positioned.fill(child: PhotoSlideshow(photos: photos, showDots: false, interval: const Duration(seconds: 5))),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [AppColors.navy.withValues(alpha: 0.78), AppColors.primary.withValues(alpha: 0.88)],
                  ),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(Gap.page, MediaQuery.of(context).padding.top + 14, Gap.page, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      DelniAvatar(path: g.avatar, name: g.name, size: 64, ring: Colors.white),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(context.tr('مرحباً بك 👋', 'Welcome 👋'), style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600)),
                            Row(
                              children: [
                                Flexible(
                                  child: Text(g.name,
                                      maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900)),
                                ),
                                const SizedBox(width: 4),
                                if (g.isVerified) const Icon(Icons.verified_rounded, color: Color(0xFF93C5FD), size: 19),
                              ],
                            ),
                            Text.rich(
                              TextSpan(children: [
                                TextSpan(text: context.tr('ترخيص: ', 'Licence: ')),
                                TextSpan(text: '\u2066${g.licenseNumber}\u2069', style: const TextStyle(color: Color(0xFFFDE2B8), fontWeight: FontWeight.w800)),
                                TextSpan(text: context.tr(' · $tours جولة منفذة', ' · $tours tours done')),
                              ]),
                              style: const TextStyle(color: Colors.white70, fontSize: 12, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                      ),
                      const NotificationBell(light: true),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      if (g.isVerified) _HeroChip(icon: Icons.verified_user_rounded, text: context.tr('موثق', 'Verified'), color: const Color(0xFF6EE7B7)),
                      if (g.experienceYears > 0) _HeroChip(icon: Icons.workspace_premium_rounded, text: context.tr('${g.experienceYears} سنوات خبرة', '${g.experienceYears} years'), color: const Color(0xFFFDE68A)),
                      if (langs.isNotEmpty) _HeroChip(icon: Icons.translate_rounded, text: langs.join('، '), color: const Color(0xFFBFDBFE)),
                    ],
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsetsDirectional.fromSTEB(14, 6, 8, 6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.14),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.white.withValues(alpha: 0.18)),
                    ),
                    child: Row(
                      children: [
                        Icon(g.isAvailable ? Icons.check_circle_rounded : Icons.beach_access_rounded, color: g.isAvailable ? const Color(0xFF6EE7B7) : AppColors.gold),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                g.isAvailable ? context.tr('متاح لاستقبال الرحلات', 'Available for trips') : context.tr('في إجازة', 'On leave'),
                                style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w800),
                              ),
                              Text(
                                g.isAvailable ? context.tr('اضغط المفتاح لتفعيل الإجازة', 'Switch off to go on leave') : context.tr('اضغط المفتاح للعودة للعمل', 'Switch on to be available again'),
                                style: const TextStyle(color: Colors.white60, fontSize: 11.5, fontWeight: FontWeight.w600),
                              ),
                            ],
                          ),
                        ),
                        savingAvailability
                            ? const Padding(
                                padding: EdgeInsets.all(12),
                                child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)),
                              )
                            : Switch(value: g.isAvailable, onChanged: onAvailability),
                      ],
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

class _HeroChip extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;
  const _HeroChip({required this.icon, required this.text, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(20)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: color),
            const SizedBox(width: 4),
            Text(text, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w700)),
          ],
        ),
      );
}

/// Two stat cards side by side, both as tall as the taller one (no fixed height, so nothing overflows).
class _StatRow extends StatelessWidget {
  final List<Widget> children;
  const _StatRow({required this.children});

  @override
  Widget build(BuildContext context) => IntrinsicHeight(
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [Expanded(child: children[0]), const SizedBox(width: 12), Expanded(child: children[1])],
        ),
      );
}

class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  final bool small;
  final VoidCallback? onTap;

  const _StatCard({required this.label, required this.value, required this.icon, required this.color, this.small = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border(top: BorderSide(color: color, width: 3)),
          ),
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(child: Text(label, style: AppText.caption.copyWith(fontSize: 11.5, height: 1.35))),
                  const SizedBox(width: 6),
                  Container(
                    width: 34,
                    height: 34,
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.14), shape: BoxShape.circle),
                    child: Icon(icon, size: 18, color: color),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              TweenAnimationBuilder<double>(
                tween: Tween(begin: 0.6, end: 1),
                duration: const Duration(milliseconds: 500),
                curve: Curves.easeOutBack,
                builder: (_, v, c) => Transform.scale(scale: v, alignment: AlignmentDirectional.centerStart, child: c),
                child: Text(
                  value,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(fontSize: small ? 14 : 19, fontWeight: FontWeight.w900, color: AppColors.navy, height: 1.3),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// The guide's licence (as the platform's "licence and official documents" card).
class _LicenseCard extends StatelessWidget {
  final Guide guide;
  final String expiry;
  final VoidCallback onManage;
  const _LicenseCard({required this.guide, required this.expiry, required this.onManage});

  @override
  Widget build(BuildContext context) {
    final date = DateTime.tryParse(expiry);
    final daysLeft = date?.difference(DateTime.now()).inDays;
    final soon = daysLeft != null && daysLeft < 60;
    return AppCard(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const IconBubble(icon: Icons.workspace_premium_rounded, tone: Tone.primary, size: 40),
              const SizedBox(width: 10),
              Expanded(child: Text(context.tr('بيانات الترخيص والوثائق الرسمية', 'Licence & official documents'), style: AppText.h3)),
              StatusBadge(
                label: guide.isVerified ? context.tr('موثق', 'Verified') : context.tr('قيد المراجعة', 'Under review'),
                tone: guide.isVerified ? Tone.success : Tone.warning,
                dense: true,
              ),
            ],
          ),
          const SizedBox(height: 10),
          InfoRow(icon: Icons.badge_outlined, label: context.tr('رقم الترخيص', 'Licence number'), value: guide.licenseNumber, ltrValue: true),
          if (date != null)
            InfoRow(
              icon: Icons.event_outlined,
              label: context.tr('ينتهي الترخيص', 'Licence expires'),
              value: context.date(expiry) + (soon ? context.tr(' — يرجى تجديده قريباً', ' — renew soon') : ''),
            ),
          const SizedBox(height: 8),
          AppButton(label: context.tr('إدارة الملف والبيانات', 'Manage profile'), icon: Icons.manage_accounts_rounded, variant: ButtonVariant.secondary, height: 44, onPressed: onManage),
        ],
      ),
    );
  }
}

String _guideTripTitle(BuildContext context, GuideTrip t) {
  if (t.kind != 'private') return t.title;
  // A private trip is named after its landmarks, like on Delni
  if (t.places.isNotEmpty) return context.tr('رحلة خاصة: ${t.places.join('، ')}', 'Private trip: ${t.places.join(', ')}');
  return context.tr('رحلة خاصة', 'Private trip') + (t.touristName.isNotEmpty ? ' — ${t.touristName}' : '');
}

String _guideTripKind(BuildContext context, GuideTrip t) => switch (t.kind) {
      'weekly' => context.tr('أسبوعية', 'Weekly'),
      'private' => context.tr('خاصة VIP', 'Private VIP'),
      _ => context.tr('يومية', 'Daily'),
    };

String _guideTripWhen(BuildContext context, GuideTrip t) {
  if (t.kind == 'daily') return t.days.isEmpty ? '' : t.days.map((d) => weekdayName(context, d)).join('، ');
  if (t.kind == 'private') {
    return [if (t.startDate.isNotEmpty) context.date(t.startDate), if (t.durationDays > 0) context.tr('${t.durationDays} أيام', '${t.durationDays} days')].join(' • ');
  }
  return [if (t.startDate.isNotEmpty) context.date(t.startDate), if (t.endDate.isNotEmpty) context.date(t.endDate)].join(' — ');
}

Tone _statusTone(GuideTrip t) {
  if (t.awaitsGuide) return Tone.orange;
  if (t.approvalStatus == GuideTrip.declined) return Tone.danger;
  return Tone.success;
}

/// A trip card with its landmark photo, kind, status, dates and people.
class _GuideTripCard extends StatelessWidget {
  final GuideTrip trip;
  final VoidCallback onTap;
  final ValueChanged<bool>? onRespond;

  const _GuideTripCard({required this.trip, required this.onTap, this.onRespond});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final seats = t.kind == 'private' ? t.companions : t.bookedSeats;
    final photo = t.photos.isNotEmpty ? t.photos.first : libyaSlides[t.id.hashCode.abs() % libyaSlides.length];
    final (_, fg) = toneColors(_statusTone(t));
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(AppRadius.lg),
        border: Border.all(color: t.awaitsGuide ? AppColors.brandOrange.withValues(alpha: 0.45) : AppColors.border),
        boxShadow: AppShadows.card,
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          child: Column(
            children: [
              SizedBox(
                height: 120,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    DelniImage(photo),
                    const DecoratedBox(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0x00000000), Color(0xCC0F172A)]),
                      ),
                    ),
                    PositionedDirectional(
                      top: 10,
                      start: 10,
                      child: _PhotoChip(text: _guideTripKind(context, t), color: AppColors.primary),
                    ),
                    if (t.approvalStatus.isNotEmpty)
                      PositionedDirectional(top: 10, end: 10, child: _PhotoChip(text: context.sv(t.approvalStatus), color: fg)),
                    PositionedDirectional(
                      start: 12,
                      end: 12,
                      bottom: 10,
                      child: Text(
                        _guideTripTitle(context, t),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(color: Colors.white, fontSize: 15.5, fontWeight: FontWeight.w900, height: 1.35),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                child: Column(
                  children: [
                    Row(
                      children: [
                        if (_guideTripWhen(context, t).isNotEmpty)
                          Expanded(child: MetaItem(icon: Icons.event_rounded, text: _guideTripWhen(context, t)))
                        else
                          const Spacer(),
                        const SizedBox(width: 8),
                        MetaItem(
                          icon: Icons.groups_rounded,
                          text: t.kind == 'private' ? context.tr('$seats أشخاص', '$seats people') : context.tr('$seats مقعد', '$seats seats'),
                        ),
                        const SizedBox(width: 6),
                        Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: AppColors.mutedText),
                      ],
                    ),
                    if (onRespond != null) ...[
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(child: AppButton(label: context.tr('اعتذار', 'Decline'), variant: ButtonVariant.danger, height: 42, onPressed: () => onRespond!(false))),
                          const SizedBox(width: 10),
                          Expanded(
                            child: AppButton(
                              label: context.tr('موافقة', 'Accept'),
                              icon: Icons.check_rounded,
                              variant: ButtonVariant.success,
                              height: 42,
                              onPressed: () => onRespond!(true),
                            ),
                          ),
                        ],
                      ),
                    ],
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

class _PhotoChip extends StatelessWidget {
  final String text;
  final Color color;
  const _PhotoChip({required this.text, required this.color});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.94), borderRadius: BorderRadius.circular(20)),
        child: Text(text, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w900)),
      );
}

/// One assigned trip, laid out like the platform's guide trip window: the landmarks' photos moving in the header,
/// the key facts, the tourist's needs and the administration's notes, the landmarks, the program and the passengers.
class GuideTripScreen extends StatelessWidget {
  final GuideTrip trip;
  final ValueChanged<bool>? onRespond;

  const GuideTripScreen({super.key, required this.trip, this.onRespond});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final passengers = t.passengers.where((p) => !p.isCancelled).toList();
    final byDate = <String, List<Passenger>>{};
    for (final p in passengers) {
      byDate.putIfAbsent(p.tripDate, () => []).add(p);
    }
    final dates = byDate.keys.toList()..sort();
    final notes = splitTripNotes(t.requirements);
    final top = MediaQuery.of(context).padding.top;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 280 - top.clamp(0, 40),
            backgroundColor: AppColors.navy,
            foregroundColor: Colors.white,
            systemOverlayStyle: SystemUiOverlayStyle.light,
            title: Text(_guideTripKind(context, t), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            flexibleSpace: FlexibleSpaceBar(
              collapseMode: CollapseMode.parallax,
              background: Stack(
                fit: StackFit.expand,
                children: [
                  PhotoSlideshow(photos: t.photos),
                  const DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [Color(0x990F172A), Color(0x220F172A), Color(0xE60F172A)],
                        stops: [0, 0.4, 1],
                      ),
                    ),
                  ),
                  PositionedDirectional(
                    start: 18,
                    end: 18,
                    bottom: 18,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (t.approvalStatus.isNotEmpty) ...[
                          _PhotoChip(text: context.sv(t.approvalStatus), color: toneColors(_statusTone(t)).$2),
                          const SizedBox(height: 8),
                        ],
                        Text(
                          _guideTripTitle(context, t),
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, height: 1.35),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            if (_guideTripWhen(context, t).isNotEmpty) _HeroChip(icon: Icons.event_rounded, text: _guideTripWhen(context, t), color: const Color(0xFFFDE68A)),
                            if (t.kind == 'private' && t.companions > 0)
                              _HeroChip(icon: Icons.groups_rounded, text: context.tr('${t.companions} أشخاص', '${t.companions} people'), color: const Color(0xFFBFDBFE)),
                            if (t.departureCity.isNotEmpty) _HeroChip(icon: Icons.place_rounded, text: t.departureCity, color: const Color(0xFF6EE7B7)),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xxl),
            sliver: SliverList.list(
              children: [
                if (onRespond != null) ...[
                  InlineMessage(
                    tone: Tone.warning,
                    icon: Icons.hourglass_top_rounded,
                    text: context.tr('أسندت إليك الإدارة هذه الرحلة وتنتظر ردك. راجع التفاصيل ثم وافق أو اعتذر من الأسفل.',
                        'The team assigned you this trip and waits for your reply. Review it, then accept or decline below.'),
                  ),
                  const SizedBox(height: Gap.lg),
                ],
                AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  child: Column(
                    children: [
                      InfoRow(icon: Icons.category_outlined, label: context.tr('نوع الرحلة', 'Trip type'), value: _guideTripKind(context, t)),
                      if (_guideTripWhen(context, t).isNotEmpty) InfoRow(icon: Icons.event_rounded, label: context.tr('الموعد', 'When'), value: _guideTripWhen(context, t)),
                      if (t.departureCity.isNotEmpty) InfoRow(icon: Icons.place_outlined, label: context.tr('الانطلاق', 'Departs from'), value: t.departureCity),
                      if (t.vehicle.isNotEmpty) InfoRow(icon: Icons.directions_bus_rounded, label: context.tr('المركبة', 'Vehicle'), value: t.vehicle),
                      if (t.driverName.isNotEmpty)
                        InfoRow(
                          icon: Icons.person_pin_circle_outlined,
                          label: context.tr('السائق', 'Driver'),
                          value: t.driverName,
                          trailing: t.driverPhone.isEmpty ? null : CallButton(phone: t.driverPhone),
                        ),
                      if (t.kind == 'private' && t.touristName.isNotEmpty)
                        InfoRow(
                          icon: Icons.person_outline_rounded,
                          label: context.tr('السائح', 'Tourist'),
                          value: '${t.touristName} • ${context.tr('${t.companions} أشخاص', '${t.companions} people')}',
                          trailing: t.touristPhone.isEmpty ? null : CallButton(phone: t.touristPhone),
                        ),
                    ],
                  ),
                ),
                if (notes.needs.isNotEmpty) ...[
                  DetailSection(title: context.tr('احتياجات السائح', "The tourist's needs")),
                  _NotesCard(items: notes.needs, color: AppColors.gold, icon: Icons.edit_note_rounded),
                ],
                if (notes.adminNotes.isNotEmpty) ...[
                  DetailSection(title: context.tr('ملاحظات الإدارة', 'Notes from the team')),
                  _NotesCard(items: notes.adminNotes, color: AppColors.primary, icon: Icons.sticky_note_2_outlined),
                ],
                if (t.places.isNotEmpty) ...[
                  DetailSection(title: context.tr('المعالم (${t.places.length})', 'Landmarks (${t.places.length})')),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: t.places.map((p) => StatusBadge(label: p, tone: Tone.orange, icon: Icons.account_balance_rounded)).toList(),
                  ),
                ],
                if (t.stations.isNotEmpty) ...[
                  DetailSection(title: context.tr('برنامج الرحلة', 'Itinerary')),
                  Timeline(steps: t.stations),
                ],
                if (t.kind != 'private') ...[
                  DetailSection(
                    title: context.tr('قائمة المسافرين', 'Passenger manifest'),
                    subtitle: context.tr('${passengers.length} حجز • ${t.bookedSeats} مقعد', '${passengers.length} bookings • ${t.bookedSeats} seats'),
                  ),
                  if (passengers.isEmpty)
                    EmptyState(
                      compact: true,
                      icon: Icons.groups_outlined,
                      title: context.tr('لا توجد حجوزات بعد', 'No bookings yet'),
                      message: context.tr('ستظهر هنا أسماء المسافرين فور حجزهم.', 'Passengers will appear here once they book.'),
                    )
                  else
                    for (final date in dates) ...[
                      if (date.isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(bottom: 8, top: 4),
                          child: StatusBadge(label: context.date(date), tone: Tone.primary, icon: Icons.event_rounded),
                        ),
                      ...byDate[date]!.map((p) => Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: AppCard(
                              padding: const EdgeInsets.all(12),
                              child: Row(
                                children: [
                                  DelniAvatar(name: p.name, size: 40),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(p.name.isEmpty ? p.bookingId : p.name, style: AppText.label),
                                        Text(context.tr('${p.seats} مقعد • ${p.bookingId}', '${p.seats} seats • ${p.bookingId}'),
                                            style: AppText.caption.copyWith(fontSize: 11)),
                                        const SizedBox(height: 4),
                                        Wrap(spacing: 6, children: [
                                          StatusBadge(label: p.paid ? context.tr('مدفوع', 'Paid') : context.tr('غير مدفوع', 'Unpaid'), tone: p.paid ? Tone.success : Tone.warning, dense: true),
                                          if (p.attended) StatusBadge(label: context.tr('حضر', 'Checked in'), tone: Tone.primary, dense: true),
                                        ]),
                                      ],
                                    ),
                                  ),
                                  if (p.phone.isNotEmpty) CallButton(phone: p.phone),
                                ],
                              ),
                            ),
                          )),
                    ],
                ],
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: onRespond == null
          ? null
          : Container(
              padding: EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 12 + MediaQuery.of(context).padding.bottom),
              decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
              child: Row(
                children: [
                  Expanded(
                    child: AppButton(
                      label: context.tr('اعتذار', 'Decline'),
                      variant: ButtonVariant.danger,
                      onPressed: () {
                        Navigator.pop(context);
                        onRespond!(false);
                      },
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: AppButton(
                      label: context.tr('موافقة', 'Accept'),
                      icon: Icons.check_rounded,
                      variant: ButtonVariant.success,
                      onPressed: () {
                        Navigator.pop(context);
                        onRespond!(true);
                      },
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}

/// A short list of notes, one per line, with a coloured marker.
class _NotesCard extends StatelessWidget {
  final List<String> items;
  final Color color;
  final IconData icon;
  const _NotesCard({required this.items, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Column(
          children: [
            for (final it in items)
              Container(
                margin: const EdgeInsets.only(bottom: 6),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(icon, size: 18, color: color),
                    const SizedBox(width: 8),
                    Expanded(child: Text(it, style: AppText.body.copyWith(fontSize: 13.5, height: 1.55))),
                  ],
                ),
              ),
          ],
        ),
      );
}
