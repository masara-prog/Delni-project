import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/account_widgets.dart';
import '../../widgets/common.dart';
import '../../widgets/contact.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/slideshow.dart';
import '../../widgets/states.dart';
import '../shared/notifications_screen.dart';
import '../tourist/detail_widgets.dart';

/// Driver dashboard (GET /dashboard/driver/{licence}): vehicle, assigned trips and the trip stage.
/// The stage is changed from a trip's "Trip stages" button, which works only on the trip's own day(s),
/// one stage at a time and after a confirmation, so a stray tap changes nothing.
class DriverHome extends StatefulWidget {
  const DriverHome({super.key});

  @override
  State<DriverHome> createState() => _DriverHomeState();
}

class _DriverHomeState extends State<DriverHome> {
  int _tab = 0;
  DriverDashboard? _data;
  bool _failed = false;
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    if (_loading) return;
    setState(() {
      _loading = true;
      _failed = false;
    });
    final data = await ApiService.fetchDriverDashboard();
    if (!mounted) return;
    setState(() {
      _loading = false;
      _data = data ?? _data;
      _failed = data == null;
    });
    AppScope.read(context).refreshUnread();
  }

  /// Saves a stage; returns whether the server accepted it.
  Future<bool> _setStage(String stage) async {
    final res = await ApiService.updateDriverTripStage(stage);
    if (!mounted) return false;
    showAppSnack(context, res.success ? (res.message.isEmpty ? context.tr('تم التحديث', 'Updated') : res.message) : res.message,
        tone: res.success ? Tone.success : Tone.danger);
    if (res.success) await _load();
    return res.success;
  }

  void _openDetails(DriverTrip t) {
    final d = _data;
    if (d == null) return;
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => _DriverTripScreen(trip: t, data: d, onStages: () => _openStages(t))));
  }

  void _openStages(DriverTrip t) {
    final d = _data;
    if (d == null) return;
    if (!t.runsToday) {
      showAppSnack(
        context,
        t.daysUntilStart > 0
            ? context.tr('تتفعل مراحل الرحلة يوم الرحلة (بعد ${t.daysUntilStart} يوم).', 'Trip stages open on the trip day (in ${t.daysUntilStart} days).')
            : context.tr('تتفعل مراحل الرحلة يوم الرحلة فقط.', 'Trip stages open on the trip day only.'),
        tone: Tone.warning,
      );
      return;
    }
    Navigator.of(context).push(MaterialPageRoute(
      builder: (_) => _StagesScreen(trip: t, initialStage: d.currentStage, onSave: _setStage),
    ));
  }

  @override
  Widget build(BuildContext context) {
    final d = _data;
    return Scaffold(
      body: d == null
          ? (_failed
              ? SafeArea(
                  child: ErrorState(
                    onRetry: _load,
                    message: context.tr('تعذر تحميل لوحة السائق من الخادم. تحقق من الاتصال ثم أعد المحاولة.', 'Could not load your driver dashboard. Check your connection and try again.'),
                  ),
                )
              : const SafeArea(child: SkeletonList(count: 3, imageHeight: 80)))
          : IndexedStack(index: _tab, children: [_overview(context, d), _trips(context, d), _account(context, d)]),
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(border: Border(top: BorderSide(color: AppColors.border))),
        child: NavigationBar(
          selectedIndex: _tab,
          onDestinationSelected: (i) => setState(() => _tab = i),
          destinations: [
            NavigationDestination(icon: const Icon(Icons.dashboard_outlined), selectedIcon: const Icon(Icons.dashboard_rounded), label: context.tr('لوحتي', 'Dashboard')),
            NavigationDestination(icon: const Icon(Icons.route_outlined), selectedIcon: const Icon(Icons.route_rounded), label: context.tr('رحلاتي', 'My trips')),
            NavigationDestination(icon: const Icon(Icons.person_outline_rounded), selectedIcon: const Icon(Icons.person_rounded), label: context.tr('حسابي', 'Account')),
          ],
        ),
      ),
    );
  }

  // --- Overview ---

  Widget _overview(BuildContext context, DriverDashboard d) {
    final today = d.trips.where((t) => t.runsToday).toList();
    final upcoming = d.trips.where((t) => !t.runsToday).toList()..sort((a, b) => a.daysUntilStart.compareTo(b.daysUntilStart));
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        padding: EdgeInsets.zero,
        children: [
          _Hero(data: d),
          if (_failed) OfflineBanner(onRetry: _load, busy: _loading),
          Padding(
            padding: const EdgeInsets.fromLTRB(Gap.page, Gap.xl, Gap.page, Gap.xxl),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _VehicleCard(data: d, onDetails: () => showAppSheet<void>(context, builder: (_) => _VehicleSheet(data: d))),
                const SizedBox(height: Gap.xl),
                if (today.isNotEmpty) ...[
                  SectionHeader(title: context.tr('رحلة اليوم', "Today's trip"), subtitle: context.tr('حدّث مراحلها أثناء الرحلة', 'Update its stages during the trip')),
                  const SizedBox(height: Gap.md),
                  for (final t in today)
                    Padding(
                      padding: const EdgeInsets.only(bottom: Gap.md),
                      child: _TodayCard(trip: t, stage: d.currentStage, onStages: () => _openStages(t), onDetails: () => _openDetails(t)),
                    ),
                ] else if (d.trips.isNotEmpty)
                  InlineMessage(
                    tone: Tone.neutral,
                    icon: Icons.lock_clock_rounded,
                    text: context.tr('لا توجد رحلة اليوم. تتفعل مراحل الرحلة تلقائياً في يوم الرحلة المحدد.', 'No trip today. The trip stages open automatically on the trip day.'),
                  ),
                const SizedBox(height: Gap.xl),
                SectionHeader(
                  title: context.tr('رحلاتك القادمة', 'Upcoming trips'),
                  actionLabel: upcoming.length > 2 ? context.tr('عرض الكل', 'See all') : null,
                  onAction: () => setState(() => _tab = 1),
                ),
                const SizedBox(height: Gap.md),
                if (d.trips.isEmpty)
                  _noTrips(context)
                else if (upcoming.isEmpty)
                  Text(context.tr('لا توجد رحلات قادمة أخرى.', 'No other upcoming trips.'), style: AppText.bodyMuted)
                else
                  ...upcoming.take(2).map((t) => Padding(
                        padding: const EdgeInsets.only(bottom: Gap.md),
                        child: _DriverTripCard(trip: t, onDetails: () => _openDetails(t), onStages: () => _openStages(t)),
                      )),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _noTrips(BuildContext context) => EmptyState(
        compact: true,
        icon: Icons.event_available_outlined,
        title: context.tr('لا توجد رحلات مسندة', 'No assigned trips'),
        message: context.tr('ستظهر هنا الرحلات المسندة لمركبتك من إدارة دلّني.', 'Trips assigned to your vehicle will appear here.'),
      );

  // --- Trips ---

  Widget _trips(BuildContext context, DriverDashboard d) {
    final trips = [...d.trips]..sort((a, b) => a.daysUntilStart.compareTo(b.daysUntilStart));
    return Scaffold(
      appBar: AppBar(centerTitle: false, title: Text(context.tr('رحلاتي', 'My trips'), style: AppText.h1), actions: const [NotificationBell(), SizedBox(width: 12)]),
      body: RefreshIndicator(
        onRefresh: _load,
        child: trips.isEmpty
            ? ListView(children: [_noTrips(context)])
            : ListView.separated(
                padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
                itemCount: trips.length,
                separatorBuilder: (_, __) => const SizedBox(height: Gap.md),
                itemBuilder: (_, i) => TweenAnimationBuilder<double>(
                  tween: Tween(begin: 0, end: 1),
                  duration: Duration(milliseconds: 360 + i.clamp(0, 8) * 70),
                  curve: Curves.easeOutCubic,
                  builder: (_, v, c) => Opacity(opacity: v, child: Transform.translate(offset: Offset(0, (1 - v) * 16), child: c)),
                  child: _DriverTripCard(trip: trips[i], onDetails: () => _openDetails(trips[i]), onStages: () => _openStages(trips[i])),
                ),
              ),
      ),
    );
  }

  // --- Account: options only; the details open on their own pages ---

  Widget _account(BuildContext context, DriverDashboard d) {
    void open(Widget page) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));
    return Scaffold(
      appBar: AppBar(centerTitle: false, title: Text(context.tr('حسابي', 'Account'), style: AppText.h1)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          ProfileHeader(
            name: d.name,
            subtitle: d.email,
            roleLabel: context.tr('سائق نقل سياحي', 'Tour driver'),
            roleIcon: Icons.directions_bus_rounded,
          ),
          const SizedBox(height: Gap.xl),
          MenuGroup(
            title: context.tr('حسابي', 'My account'),
            children: [
              MenuTile(
                icon: Icons.badge_rounded,
                title: context.tr('بياناتي', 'My details'),
                subtitle: context.tr('الرخصة والهاتف والشركة والمركبة', 'Licence, phone, company and vehicle'),
                onTap: () => open(_DriverInfoScreen(data: d)),
              ),
              MenuTile(
                icon: Icons.lock_reset_rounded,
                title: context.tr('تغيير كلمة المرور', 'Change password'),
                subtitle: context.tr('بعد إدخال كلمة المرور الحالية', 'After entering your current password'),
                tone: Tone.warning,
                onTap: () => open(const _DriverPasswordScreen()),
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

/// Header with moving Libya photos, the driver and their company.
class _Hero extends StatelessWidget {
  final DriverDashboard data;
  const _Hero({required this.data});

  @override
  Widget build(BuildContext context) {
    final d = data;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(30)),
        child: Stack(
          children: [
            Positioned.fill(child: PhotoSlideshow(photos: [if (d.vehicleImage.isNotEmpty) d.vehicleImage], showDots: false, interval: const Duration(seconds: 5))),
            Positioned.fill(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [const Color(0xFF064E3B).withValues(alpha: 0.82), const Color(0xFF0D9488).withValues(alpha: 0.88)],
                  ),
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.fromLTRB(Gap.page, MediaQuery.of(context).padding.top + 14, Gap.page, 24),
              child: Row(
                children: [
                  DelniAvatar(name: d.name, size: 58, ring: Colors.white),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(context.tr('أهلاً بك 👋', 'Welcome 👋'), style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600)),
                        Text(d.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 19, fontWeight: FontWeight.w900)),
                        if (d.companyName.isNotEmpty)
                          Text(d.companyName, style: const TextStyle(color: Color(0xFFD1FAE5), fontSize: 12, fontWeight: FontWeight.w700)),
                      ],
                    ),
                  ),
                  const NotificationBell(light: true),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _VehicleCard extends StatelessWidget {
  final DriverDashboard data;
  final VoidCallback onDetails;
  const _VehicleCard({required this.data, required this.onDetails});

  @override
  Widget build(BuildContext context) {
    final d = data;
    if (!d.hasVehicle) {
      return AppCard(
        child: Row(
          children: [
            const IconBubble(icon: Icons.no_transfer_rounded, tone: Tone.neutral, size: 48),
            const SizedBox(width: 12),
            Expanded(
              child: Text(context.tr('لم تُسند إليك مركبة بعد. تواصل مع شركتك.', 'No vehicle assigned yet. Contact your company.'), style: AppText.bodyMuted),
            ),
          ],
        ),
      );
    }
    return AppCard(
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          if (d.vehicleImage.isNotEmpty)
            GestureDetector(
              onTap: () => openPhotoViewer(context, [d.vehicleImage]),
              child: DelniImage(d.vehicleImage,
                  height: 150, width: double.infinity, fallbackIcon: Icons.directions_bus_rounded, borderRadius: const BorderRadius.vertical(top: Radius.circular(AppRadius.lg))),
            ),
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                const IconBubble(icon: Icons.directions_bus_rounded, size: 48),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(d.vehicleType.isEmpty ? context.tr('المركبة المسندة', 'Assigned vehicle') : d.vehicleType, style: AppText.h3),
                      if (d.vehicleSeats > 0) Text(context.tr('${d.vehicleSeats} مقعد', '${d.vehicleSeats} seats'), style: AppText.caption),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: AppColors.goldSoft, borderRadius: BorderRadius.circular(8), border: Border.all(color: AppColors.gold)),
                  child: Text(d.vehiclePlate, textDirection: TextDirection.ltr, style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: AppColors.navy)),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
            child: Row(
              children: [
                if (d.vehicleStatus.isNotEmpty)
                  StatusBadge(label: context.sv(d.vehicleStatus), tone: d.vehicleStatus == 'جاهزة' ? Tone.success : Tone.warning, dense: true),
                const Spacer(),
                AppButton(
                  label: context.tr('تفاصيل المركبة', 'Vehicle details'),
                  icon: Icons.visibility_rounded,
                  height: 40,
                  expand: false,
                  onPressed: onDetails,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Everything stored about the vehicle and its company, as in the platform's vehicle window.
class _VehicleSheet extends StatelessWidget {
  final DriverDashboard data;
  const _VehicleSheet({required this.data});

  @override
  Widget build(BuildContext context) {
    final d = data;
    final facts = <(IconData, String, String)>[
      (Icons.pin_rounded, context.tr('رقم اللوحة', 'Plate'), d.vehiclePlate),
      (Icons.event_seat_rounded, context.tr('عدد المقاعد', 'Seats'), d.vehicleSeats > 0 ? context.tr('${d.vehicleSeats} مقعد', '${d.vehicleSeats} seats') : ''),
      (Icons.category_rounded, context.tr('الفئة', 'Category'), d.vehicleCategory),
      (Icons.verified_rounded, context.tr('الحالة', 'Status'), context.sv(d.vehicleStatus)),
      (Icons.timeline_rounded, context.tr('مرحلة الرحلة', 'Trip stage'), context.sv(d.currentStage)),
    ].where((f) => f.$3.trim().isNotEmpty).toList();
    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const IconBubble(icon: Icons.directions_bus_rounded, size: 46),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(d.vehicleType.isEmpty ? context.tr('المركبة المسندة', 'Assigned vehicle') : d.vehicleType, style: AppText.h2),
                    Text(context.tr('رقم اللوحة: ', 'Plate: ') + d.vehiclePlate, style: AppText.caption),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: Gap.md),
          ClipRRect(
            borderRadius: BorderRadius.circular(AppRadius.lg),
            child: SizedBox(
              height: 200,
              width: double.infinity,
              child: d.vehicleImage.isEmpty
                  ? Container(
                      color: AppColors.background,
                      alignment: Alignment.center,
                      child: Text(context.tr('🚍 لا توجد صورة مسجلة لهذه المركبة', '🚍 No photo of this vehicle'), style: AppText.bodyMuted),
                    )
                  : GestureDetector(
                      onTap: () => openPhotoViewer(context, [d.vehicleImage]),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          DelniImage(d.vehicleImage),
                          if (d.vehicleSeats > 0)
                            PositionedDirectional(
                              bottom: 10,
                              start: 10,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                decoration: BoxDecoration(color: Colors.black54, borderRadius: BorderRadius.circular(12)),
                                child: Text(context.tr('👥 ${d.vehicleSeats} راكب', '👥 ${d.vehicleSeats} passengers'),
                                    style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w800)),
                              ),
                            ),
                          const PositionedDirectional(top: 10, end: 10, child: Icon(Icons.zoom_out_map_rounded, color: Colors.white)),
                        ],
                      ),
                    ),
            ),
          ),
          const SizedBox(height: Gap.md),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 2.5,
            children: [
              for (final f in facts)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
                  child: Row(
                    children: [
                      Icon(f.$1, size: 18, color: AppColors.primary),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(f.$2, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption.copyWith(fontSize: 11)),
                            Text(f.$3, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 13)),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
          if (d.companyName.isNotEmpty) ...[
            const SizedBox(height: Gap.md),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppColors.primarySoft, borderRadius: BorderRadius.circular(AppRadius.lg)),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(context.tr('شركة النقل المشغلة', 'Operating company'), style: AppText.caption.copyWith(fontSize: 11)),
                        Text(d.companyName, style: AppText.h3),
                        if (d.companyPhone.isNotEmpty) Text(d.companyPhone, textDirection: TextDirection.ltr, style: AppText.caption),
                      ],
                    ),
                  ),
                  if (d.companyPhone.isNotEmpty) CallButton(phone: d.companyPhone),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

Tone _kindTone(String kind) => switch (kind) { 'أسبوعية' => Tone.orange, 'خاصة' => Tone.warning, _ => Tone.primary };

String _when(BuildContext context, DriverTrip t) {
  if (t.startDate.isEmpty) return t.schedule;
  if (t.endDate.isEmpty || t.endDate == t.startDate) return context.date(t.startDate);
  return '${context.date(t.startDate)} — ${context.date(t.endDate)}';
}

/// "Today" / "in 3 days" chip.
Widget _dueChip(BuildContext context, DriverTrip t) {
  if (t.runsToday) return StatusBadge(label: context.tr('اليوم', 'Today'), tone: Tone.success, icon: Icons.play_circle_rounded, dense: true);
  if (t.daysUntilStart > 0) {
    return StatusBadge(
      label: t.daysUntilStart == 1 ? context.tr('غداً', 'Tomorrow') : context.tr('بعد ${t.daysUntilStart} أيام', 'In ${t.daysUntilStart} days'),
      tone: Tone.neutral,
      icon: Icons.schedule_rounded,
      dense: true,
    );
  }
  return const SizedBox.shrink();
}

/// Today's trip, with its current stage and the button that opens the stages.
class _TodayCard extends StatelessWidget {
  final DriverTrip trip;
  final String stage;
  final VoidCallback onStages;
  final VoidCallback onDetails;
  const _TodayCard({required this.trip, required this.stage, required this.onStages, required this.onDetails});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final stages = DriverDashboard.stages;
    final index = stages.indexOf(stage).clamp(0, stages.length - 1);
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(colors: [Color(0xFF0D9488), Color(0xFF0F766E)]),
        borderRadius: BorderRadius.circular(AppRadius.lg),
        boxShadow: AppShadows.soft,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.18), borderRadius: BorderRadius.circular(20)),
                child: Text(context.tr('🟢 رحلة اليوم • ${context.sv(t.kind)}', '🟢 Today • ${context.sv(t.kind)}'),
                    style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w800)),
              ),
              const Spacer(),
              TextButton(
                onPressed: onDetails,
                style: TextButton.styleFrom(foregroundColor: Colors.white),
                child: Text(context.tr('التفاصيل', 'Details')),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(t.title.isEmpty ? t.id : t.title, style: const TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900, height: 1.35)),
          const SizedBox(height: 4),
          Text(
            context.tr('${t.passengers} راكب', '${t.passengers} passengers') + (t.departureCity.isEmpty ? '' : ' • ${t.departureCity}'),
            style: const TextStyle(color: Color(0xFFCCFBF1), fontSize: 12.5, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 14),
          // Progress through the five stages
          Row(
            children: [
              for (var i = 0; i < stages.length; i++)
                Expanded(
                  child: Container(
                    height: 6,
                    margin: const EdgeInsets.symmetric(horizontal: 2),
                    decoration: BoxDecoration(color: i <= index ? Colors.white : Colors.white24, borderRadius: BorderRadius.circular(6)),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          Text(context.tr('المرحلة الحالية: ${context.sv(stages[index])}', 'Current stage: ${context.sv(stages[index])}'),
              style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w800)),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: FilledButton.icon(
              onPressed: onStages,
              style: FilledButton.styleFrom(backgroundColor: Colors.white, foregroundColor: const Color(0xFF0F766E)),
              icon: const Icon(Icons.timeline_rounded),
              label: Text(context.tr('مراحل الرحلة', 'Trip stages'), style: const TextStyle(fontWeight: FontWeight.w900)),
            ),
          ),
        ],
      ),
    );
  }
}

/// A trip in the list: a few facts, "Details", and "Trip stages" (locked until the trip day).
class _DriverTripCard extends StatelessWidget {
  final DriverTrip trip;
  final VoidCallback onDetails;
  final VoidCallback onStages;
  const _DriverTripCard({required this.trip, required this.onDetails, required this.onStages});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final tone = _kindTone(t.kind);
    return AppCard(
      padding: const EdgeInsets.all(14),
      onTap: onDetails,
      child: Column(
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(14),
                child: SizedBox(
                  width: 74,
                  height: 74,
                  child: DelniImage(t.allPhotos.isNotEmpty ? t.allPhotos.first : libyaSlides[t.id.hashCode.abs() % libyaSlides.length]),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(spacing: 6, runSpacing: 4, children: [
                      StatusBadge(label: context.sv(t.kind), tone: tone, dense: true),
                      _dueChip(context, t),
                    ]),
                    const SizedBox(height: 6),
                    Text(t.title.isEmpty ? t.id : t.title, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppText.h3),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 12,
                      runSpacing: 4,
                      children: [
                        if (_when(context, t).isNotEmpty) MetaItem(icon: Icons.event_rounded, text: _when(context, t)),
                        MetaItem(icon: Icons.groups_rounded, text: context.tr('${t.passengers} راكب', '${t.passengers} passengers')),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: AppButton(label: context.tr('التفاصيل', 'Details'), icon: Icons.info_outline_rounded, variant: ButtonVariant.outline, height: 42, onPressed: onDetails),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Opacity(
                  opacity: t.runsToday ? 1 : 0.55,
                  child: AppButton(
                    label: t.runsToday ? context.tr('مراحل الرحلة', 'Trip stages') : context.tr('يوم الرحلة', 'On trip day'),
                    icon: t.runsToday ? Icons.timeline_rounded : Icons.lock_clock_rounded,
                    variant: t.runsToday ? ButtonVariant.success : ButtonVariant.secondary,
                    height: 42,
                    onPressed: onStages,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// The trip's details, like the guide's trip page: its photos and landmarks moving in the header, the facts,
/// the guide to coordinate with, the landmarks (tap a picture to open it) and the program.
class _DriverTripScreen extends StatelessWidget {
  final DriverTrip trip;
  final DriverDashboard data;
  final VoidCallback onStages;
  const _DriverTripScreen({required this.trip, required this.data, required this.onStages});

  @override
  Widget build(BuildContext context) {
    final t = trip;
    final top = MediaQuery.of(context).padding.top;
    final photos = t.allPhotos;
    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            pinned: true,
            expandedHeight: 280 - top.clamp(0, 40),
            backgroundColor: const Color(0xFF0F766E),
            foregroundColor: Colors.white,
            systemOverlayStyle: SystemUiOverlayStyle.light,
            title: Text(context.sv(t.kind), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 16)),
            actions: [
              if (photos.isNotEmpty)
                IconButton(
                  tooltip: context.tr('عرض الصور', 'View photos'),
                  icon: const Icon(Icons.photo_library_rounded, color: Colors.white),
                  onPressed: () => openPhotoViewer(context, photos),
                ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: GestureDetector(
                onTap: () => openPhotoViewer(context, photos),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    PhotoSlideshow(photos: photos),
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
                          _dueChip(context, t),
                          const SizedBox(height: 8),
                          Text(t.title.isEmpty ? t.id : t.title,
                              maxLines: 3, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w900, height: 1.35)),
                          const SizedBox(height: 6),
                          Text(
                            [_when(context, t), context.tr('${t.passengers} راكب', '${t.passengers} passengers'), if (t.departureCity.isNotEmpty) t.departureCity].where((x) => x.isNotEmpty).join(' • '),
                            style: const TextStyle(color: Color(0xFFCCFBF1), fontSize: 12.5, fontWeight: FontWeight.w700),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.fromLTRB(Gap.page, Gap.lg, Gap.page, Gap.xxl),
            sliver: SliverList.list(
              children: [
                AppCard(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  child: Column(
                    children: [
                      InfoRow(icon: Icons.confirmation_number_outlined, label: context.tr('رقم الرحلة', 'Trip number'), value: t.id, ltrValue: true),
                      if (_when(context, t).isNotEmpty) InfoRow(icon: Icons.event_rounded, label: context.tr('الموعد', 'When'), value: _when(context, t)),
                      if (t.kind == 'يومية' && t.schedule.isNotEmpty)
                        InfoRow(icon: Icons.event_repeat_rounded, label: context.tr('أيام التشغيل', 'Runs on'), value: t.schedule.split(' — ').first),
                      if (t.departureCity.isNotEmpty) InfoRow(icon: Icons.place_outlined, label: context.tr('الانطلاق', 'Departs from'), value: t.departureCity),
                      InfoRow(icon: Icons.groups_rounded, label: context.tr('الركاب', 'Passengers'), value: context.tr('${t.passengers} راكب', '${t.passengers} passengers')),
                      if (data.hasVehicle)
                        InfoRow(icon: Icons.directions_bus_rounded, label: context.tr('المركبة', 'Vehicle'), value: [data.vehicleType, data.vehiclePlate].where((s) => s.isNotEmpty).join(' • ')),
                      if (t.guideName.isNotEmpty)
                        InfoRow(
                          icon: Icons.explore_outlined,
                          label: context.tr('المرشد السياحي', 'Tour guide'),
                          value: t.guideName,
                          trailing: t.guidePhone.isEmpty ? null : CallButton(phone: t.guidePhone),
                        ),
                      if (t.runsToday) InfoRow(icon: Icons.timeline_rounded, label: context.tr('المرحلة الحالية', 'Current stage'), value: context.sv(data.currentStage)),
                    ],
                  ),
                ),
                if (t.places.isNotEmpty) ...[
                  DetailSection(title: context.tr('المعالم (${t.places.length})', 'Landmarks (${t.places.length})')),
                  SizedBox(
                    height: 150,
                    child: ListView.separated(
                      scrollDirection: Axis.horizontal,
                      itemCount: t.places.length,
                      separatorBuilder: (_, __) => const SizedBox(width: 10),
                      itemBuilder: (_, i) {
                        final p = t.places[i];
                        final images = t.places.map((x) => x.image).where((x) => x.isNotEmpty).toList();
                        return GestureDetector(
                          onTap: p.image.isEmpty ? null : () => openPhotoViewer(context, images, initial: images.indexOf(p.image)),
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(AppRadius.lg),
                            child: SizedBox(
                              width: 140,
                              child: Stack(
                                fit: StackFit.expand,
                                children: [
                                  DelniImage(p.image.isEmpty ? libyaSlides[i % libyaSlides.length] : p.image),
                                  const DecoratedBox(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(begin: Alignment.topCenter, end: Alignment.bottomCenter, colors: [Color(0x00000000), Color(0xCC0F172A)]),
                                    ),
                                  ),
                                  PositionedDirectional(
                                    start: 10,
                                    end: 10,
                                    bottom: 10,
                                    child: Text(p.name, maxLines: 2, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 13)),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
                if (t.stations.isNotEmpty) ...[
                  DetailSection(title: context.tr('برنامج الرحلة', 'Itinerary')),
                  Timeline(steps: t.stations),
                ],
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        padding: EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 12 + MediaQuery.of(context).padding.bottom),
        decoration: const BoxDecoration(color: Colors.white, border: Border(top: BorderSide(color: AppColors.border))),
        child: t.runsToday
            ? AppButton(
                label: context.tr('مراحل الرحلة', 'Trip stages'),
                icon: Icons.timeline_rounded,
                variant: ButtonVariant.success,
                onPressed: onStages,
              )
            : InlineMessage(
                tone: Tone.neutral,
                icon: Icons.lock_clock_rounded,
                text: t.daysUntilStart > 0
                    ? context.tr('تتفعل مراحل الرحلة يوم الرحلة (بعد ${t.daysUntilStart} يوم).', 'The trip stages open on the trip day (in ${t.daysUntilStart} days).')
                    : context.tr('تتفعل مراحل الرحلة يوم الرحلة فقط.', 'The trip stages open on the trip day only.'),
              ),
      ),
    );
  }
}

/// The five stages as a timeline: only the stages that may follow the current one can be chosen, after a confirmation.
class _StagesScreen extends StatefulWidget {
  final DriverTrip trip;
  final String initialStage;
  final Future<bool> Function(String) onSave;
  const _StagesScreen({required this.trip, required this.initialStage, required this.onSave});

  @override
  State<_StagesScreen> createState() => _StagesScreenState();
}

class _StagesScreenState extends State<_StagesScreen> {
  late String _stage = widget.initialStage;
  String? _saving;

  static const _icons = [Icons.hourglass_empty_rounded, Icons.directions_bus_rounded, Icons.local_cafe_rounded, Icons.flag_rounded, Icons.task_alt_rounded];

  Future<void> _choose(String next) async {
    final ok = await confirmDialog(
      context,
      title: context.tr('تأكيد المرحلة', 'Confirm the stage'),
      message: context.tr('تحديث مرحلة الرحلة إلى «${context.sv(next)}»؟ ستظهر للشركة وإدارة دلّني.', 'Set the trip stage to “${context.sv(next)}”? Your company and the Delni team will see it.'),
      confirmLabel: context.tr('تأكيد', 'Confirm'),
      icon: _icons[DriverDashboard.stages.indexOf(next).clamp(0, 4)],
    );
    if (!ok || !mounted) return;
    setState(() => _saving = next);
    final saved = await widget.onSave(next);
    if (!mounted) return;
    setState(() {
      _saving = null;
      if (saved) _stage = next;
    });
  }

  @override
  Widget build(BuildContext context) {
    final stages = DriverDashboard.stages;
    final current = stages.indexOf(_stage.isEmpty ? stages.first : _stage).clamp(0, stages.length - 1);
    // The same order as the server (Driver::STAGE_TRANSITIONS)
    final allowed = DriverDashboard.stageTransitions[stages[current]] ?? const <String>[];
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('مراحل الرحلة', 'Trip stages'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          Text(widget.trip.title.isEmpty ? widget.trip.id : widget.trip.title, style: AppText.h2),
          const SizedBox(height: 4),
          Text(context.tr('اضغط على إحدى المراحل المتاحة (باللون الأزرق) عند الوصول إليها، وتأكد قبل الحفظ.', 'Tap one of the available stages (in blue) when you reach it, and confirm before saving.'), style: AppText.bodyMuted),
          const SizedBox(height: Gap.lg),
          for (var i = 0; i < stages.length; i++)
            _StageRow(
              icon: _icons[i],
              label: context.sv(stages[i]),
              done: i < current && !allowed.contains(stages[i]),
              current: i == current,
              isNext: allowed.contains(stages[i]),
              last: i == stages.length - 1,
              saving: _saving == stages[i],
              onTap: allowed.contains(stages[i]) && _saving == null ? () => _choose(stages[i]) : null,
            ),
        ],
      ),
    );
  }
}

class _StageRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool done;
  final bool current;
  final bool isNext;
  final bool last;
  final bool saving;
  final VoidCallback? onTap;

  const _StageRow({
    required this.icon,
    required this.label,
    required this.done,
    required this.current,
    required this.isNext,
    required this.last,
    required this.saving,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final color = current ? AppColors.accent : (done ? AppColors.accent.withValues(alpha: 0.55) : (isNext ? AppColors.primary : AppColors.border));
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SizedBox(
            width: 44,
            child: Column(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: current || done ? color : Colors.white,
                    border: Border.all(color: color, width: 2),
                  ),
                  child: saving
                      ? const Padding(padding: EdgeInsets.all(9), child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Icon(done ? Icons.check_rounded : icon, size: 20, color: current || done ? Colors.white : color),
                ),
                if (!last) Expanded(child: Container(width: 2, color: done || current ? AppColors.accent.withValues(alpha: 0.5) : AppColors.border)),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: Material(
                color: current ? AppColors.accentSoft : (isNext ? AppColors.primarySoft : Colors.white),
                borderRadius: BorderRadius.circular(14),
                child: InkWell(
                  borderRadius: BorderRadius.circular(14),
                  onTap: onTap,
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text(label,
                              style: AppText.label.copyWith(fontSize: 14.5, color: current || isNext ? AppColors.navy : AppColors.mutedText)),
                        ),
                        if (current) StatusBadge(label: context.tr('الحالية', 'Current'), tone: Tone.success, dense: true),
                        if (isNext && !current)
                          StatusBadge(label: context.tr('اضغط للانتقال', 'Tap to move'), tone: Tone.primary, icon: Icons.touch_app_rounded, dense: true),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// The driver's details: read-only (they are kept by the transport company), as on the platform.
class _DriverInfoScreen extends StatelessWidget {
  final DriverDashboard data;
  const _DriverInfoScreen({required this.data});

  @override
  Widget build(BuildContext context) {
    final d = data;
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('بياناتي', 'My details'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          InlineMessage(
            tone: Tone.neutral,
            icon: Icons.lock_outline_rounded,
            text: context.tr('هذه بيانات رسمية تسجلها شركة النقل ولا يمكن تعديلها من حسابك. يمكنك تغيير كلمة المرور فقط.',
                'These official details are kept by your transport company and cannot be edited here. You can only change your password.'),
          ),
          const SizedBox(height: Gap.lg),
          AppCard(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            child: Column(
              children: [
                InfoRow(icon: Icons.person_outline_rounded, label: context.tr('الاسم', 'Name'), value: d.name),
                if (d.email.isNotEmpty) InfoRow(icon: Icons.alternate_email_rounded, label: context.tr('البريد الإلكتروني', 'Email'), value: d.email, ltrValue: true),
                InfoRow(icon: Icons.badge_outlined, label: context.tr('رقم رخصة القيادة', 'Driving licence'), value: d.licenseNumber, ltrValue: true),
                if (d.licenseValidUntil.isNotEmpty)
                  InfoRow(icon: Icons.event_outlined, label: context.tr('صلاحية الرخصة', 'Licence valid until'), value: context.date(d.licenseValidUntil)),
                if (d.phone.isNotEmpty) InfoRow(icon: Icons.phone_outlined, label: context.tr('الهاتف', 'Phone'), value: d.phone, ltrValue: true),
                if (d.companyName.isNotEmpty) InfoRow(icon: Icons.business_rounded, label: context.tr('شركة النقل', 'Transport company'), value: d.companyName),
                if (d.operationalStatus.isNotEmpty)
                  InfoRow(icon: Icons.info_outline_rounded, label: context.tr('الحالة التشغيلية', 'Operational status'), value: context.sv(d.operationalStatus)),
                if (d.hasVehicle)
                  InfoRow(icon: Icons.directions_bus_rounded, label: context.tr('المركبة', 'Vehicle'), value: [d.vehicleType, d.vehiclePlate].where((s) => s.isNotEmpty).join(' • ')),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// Password change: the current password, then the new one twice (6 characters at least), as on the platform.
class _DriverPasswordScreen extends StatefulWidget {
  const _DriverPasswordScreen();

  @override
  State<_DriverPasswordScreen> createState() => _DriverPasswordScreenState();
}

class _DriverPasswordScreenState extends State<_DriverPasswordScreen> {
  final _current = TextEditingController();
  final _next = TextEditingController();
  final _confirm = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _current.dispose();
    _next.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    String? error;
    if (_current.text.isEmpty) {
      error = context.tr('يرجى كتابة كلمة المرور الحالية لتأكيد أنك صاحب الحساب.', 'Please enter your current password.');
    } else if (_next.text.trim().length < 6) {
      error = context.tr('كلمة المرور الجديدة يجب أن تتكون من 6 خانات على الأقل.', 'The new password must have at least 6 characters.');
    } else if (_next.text != _confirm.text) {
      error = context.tr('كلمتا المرور غير متطابقتين.', 'The passwords do not match.');
    }
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _error = null;
    });
    final res = await ApiService.changeDriverPassword(current: _current.text, next: _next.text.trim());
    if (!mounted) return;
    setState(() => _saving = false);
    if (res.success) {
      showAppSnack(context, context.tr('تم تغيير كلمة المرور بنجاح', 'Your password was changed'), tone: Tone.success);
      Navigator.of(context).pop();
    } else {
      setState(() => _error = res.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('تغيير كلمة المرور', 'Change password'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          AppTextField(label: context.tr('كلمة المرور الحالية', 'Current password'), controller: _current, icon: Icons.lock_outline_rounded, password: true),
          const SizedBox(height: Gap.lg),
          AppTextField(
            label: context.tr('كلمة المرور الجديدة', 'New password'),
            controller: _next,
            icon: Icons.lock_reset_rounded,
            password: true,
            helper: context.tr('6 خانات على الأقل', 'At least 6 characters'),
          ),
          const SizedBox(height: Gap.lg),
          AppTextField(label: context.tr('تأكيد كلمة المرور', 'Confirm password'), controller: _confirm, icon: Icons.lock_reset_rounded, password: true, onSubmitted: (_) => _save()),
          if (_error != null) ...[
            const SizedBox(height: Gap.lg),
            InlineMessage(text: _error!, tone: Tone.danger),
          ],
          const SizedBox(height: Gap.xl),
          AppButton(label: context.tr('تغيير كلمة المرور', 'Change password'), icon: Icons.check_rounded, loading: _saving, onPressed: _saving ? null : _save),
        ],
      ),
    );
  }
}
