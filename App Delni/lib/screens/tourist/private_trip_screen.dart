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

/// Opens the private-trip request (tourist accounts only), optionally with a landmark or guide already chosen.
Future<void> openPrivateTripRequest(BuildContext context, {Place? place, Guide? guide}) async {
  final session = ApiService.currentSession;
  if (session == null || !session.isTourist) {
    await promptTouristLogin(
      context,
      reason: context.tr('سجّل الدخول بحساب سائح لإرسال طلب رحلة خاصة.', 'Sign in with a tourist account to request a private trip.'),
    );
    return;
  }
  await Navigator.of(context).push(MaterialPageRoute(builder: (_) => PrivateTripScreen(place: place, guide: guide)));
}

/// POST /private-trips: landmarks, a start date at least 10 days ahead, duration, companions, optional guide.
class PrivateTripScreen extends StatefulWidget {
  final Place? place;
  final Guide? guide;

  const PrivateTripScreen({super.key, this.place, this.guide});

  @override
  State<PrivateTripScreen> createState() => _PrivateTripScreenState();
}

class _PrivateTripScreenState extends State<PrivateTripScreen> {
  static const _minDaysAhead = 10;

  List<Place>? _places;
  bool _placesFailed = false;
  final Set<String> _placeIds = {};
  DateTime? _start;
  int _duration = 3;
  int _companions = 2;
  String? _guideId;
  final _notes = TextEditingController();
  bool _sending = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    if (widget.place != null) _placeIds.add(widget.place!.id);
    _guideId = widget.guide?.licenseNumber;
    _places = AppScope.read(context).catalog.places;
    if (_places == null) _loadPlaces();
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _loadPlaces() async {
    setState(() => _placesFailed = false);
    final places = await ApiService.fetchPlaces();
    if (!mounted) return;
    setState(() {
      _places = places;
      _placesFailed = places == null;
    });
  }

  Future<void> _pickDate() async {
    final first = DateTime.now().add(const Duration(days: _minDaysAhead));
    final picked = await showDatePicker(
      context: context,
      initialDate: _start ?? first,
      firstDate: first,
      lastDate: DateTime.now().add(const Duration(days: 365 * 2)),
      // Earlier days are greyed out: the platform needs 10 days to prepare the programme, the bus and the guide
      helpText: context.tr('تاريخ البدء — بعد 10 أيام على الأقل من اليوم', 'Start date — at least 10 days from today'),
    );
    if (picked != null) setState(() => _start = picked);
  }

  Future<void> _submit() async {
    String? error;
    if (_placeIds.isEmpty) {
      error = context.tr('يرجى اختيار معلم سياحي واحد على الأقل', 'Please choose at least one landmark');
    } else if (_start == null) {
      error = context.tr('يرجى اختيار تاريخ بدء الرحلة', 'Please choose a start date');
    }
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _sending = true;
      _error = null;
    });
    final res = await ApiService.requestPrivateTrip(
      placeIds: _placeIds.toList(),
      companions: _companions,
      preferredStartDate: isoDate(_start!),
      durationDays: _duration,
      guideLicenseNumber: _guideId,
      notes: _notes.text,
    );
    if (!mounted) return;
    setState(() => _sending = false);
    if (!res.success) {
      setState(() => _error = res.message);
      return;
    }
    final state = AppScope.read(context);
    state.bookingsRevision.value++;
    await showDialog<void>(
      context: context,
      builder: (ctx) => AlertDialog(
        icon: const IconBubble(icon: Icons.auto_awesome_rounded, tone: Tone.success, size: 60),
        title: Text(ctx.tr('تم إرسال طلبك', 'Request sent'), textAlign: TextAlign.center),
        content: Text(
          res.message.isNotEmpty
              ? res.message
              : ctx.tr('تدرس الإدارة طلبك وترسل لك البرنامج والتسعيرة لتأكيدها.', 'The team will study your request and send you a program and price to confirm.'),
          textAlign: TextAlign.center,
        ),
        actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        actions: [
          AppButton(
            label: ctx.tr('متابعة طلباتي', 'Follow my requests'),
            onPressed: () => Navigator.pop(ctx),
          ),
        ],
      ),
    );
    if (!mounted) return;
    Navigator.of(context).popUntil((r) => r.isFirst);
    state.touristTab.value = 2;
  }

  @override
  Widget build(BuildContext context) {
    final guides = (AppScope.of(context).catalog.guides ?? []).where((g) => g.canTakePrivate).toList();
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('طلب رحلة خاصة', 'Private trip request'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [AppColors.navy, AppColors.primary]),
              borderRadius: BorderRadius.circular(AppRadius.lg),
            ),
            child: Row(
              children: [
                const Icon(Icons.auto_awesome_rounded, color: AppColors.gold, size: 32),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    context.tr(
                      'صمّم رحلتك: اختر المعالم والتاريخ، وتُرسل لك الإدارة البرنامج والتسعيرة لتأكيدها.',
                      'Design your trip: choose landmarks and a date, and the team sends you the program and price to confirm.',
                    ),
                    style: const TextStyle(color: Colors.white, fontSize: 13, height: 1.6, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: Gap.xl),
          Text(context.tr('المعالم التي تريد زيارتها', 'Landmarks to visit'), style: AppText.label),
          const SizedBox(height: 10),
          _placesPicker(context),
          const SizedBox(height: Gap.xl),
          AppTextField(
            label: context.tr('تاريخ بدء الرحلة', 'Start date'),
            controller: TextEditingController(text: _start == null ? '' : context.date(isoDate(_start!))),
            icon: Icons.event_rounded,
            hint: context.tr('اختر التاريخ', 'Choose a date'),
            readOnly: true,
            onTap: _pickDate,
            helper: context.tr('بعد 10 أيام على الأقل من اليوم لتجهيز البرنامج والحافلة والمرشد', 'At least 10 days from today to prepare the program, bus and guide'),
          ),
          const SizedBox(height: Gap.xl),
          _CounterRow(
            icon: Icons.schedule_rounded,
            label: context.tr('مدة الرحلة', 'Duration'),
            valueLabel: context.tr('$_duration أيام', '$_duration days'),
            onMinus: _duration > 1 ? () => setState(() => _duration--) : null,
            onPlus: _duration < 30 ? () => setState(() => _duration++) : null,
          ),
          const SizedBox(height: 12),
          _CounterRow(
            icon: Icons.groups_rounded,
            label: context.tr('عدد الأفراد', 'Travellers'),
            valueLabel: context.tr('$_companions أشخاص', '$_companions people'),
            onMinus: _companions > 1 ? () => setState(() => _companions--) : null,
            onPlus: _companions < 50 ? () => setState(() => _companions++) : null,
          ),
          if (guides.isNotEmpty) ...[
            const SizedBox(height: Gap.xl),
            Text(context.tr('المرشد المفضل', 'Preferred guide'), style: AppText.label),
            const SizedBox(height: 4),
            Text(context.tr('اختياري — يمكنك ترك الاختيار للإدارة', 'Optional — or let the team choose'), style: AppText.caption),
            const SizedBox(height: 10),
            SizedBox(
              height: 104,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _GuideOption(
                    name: context.tr('تختار الإدارة', 'Team picks'),
                    selected: _guideId == null,
                    onTap: () => setState(() => _guideId = null),
                  ),
                  ...guides.map((g) => _GuideOption(
                        name: g.name,
                        avatar: g.avatar,
                        selected: _guideId == g.licenseNumber,
                        onTap: () => setState(() => _guideId = g.licenseNumber),
                      )),
                ],
              ),
            ),
          ],
          const SizedBox(height: Gap.xl),
          AppTextField(
            label: context.tr('متطلبات وملاحظات', 'Requirements & notes'),
            controller: _notes,
            maxLines: 4,
            optional: true,
            hint: context.tr('مستوى الإقامة، الوجبات، احتياجات خاصة...', 'Accommodation level, meals, special needs...'),
          ),
          const SizedBox(height: Gap.lg),
          if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
          AppButton(
            label: context.tr('إرسال الطلب', 'Send request'),
            icon: Icons.send_rounded,
            loading: _sending,
            onPressed: _submit,
          ),
        ],
      ),
    );
  }

  Widget _placesPicker(BuildContext context) {
    if (_places == null) {
      return _placesFailed
          ? ErrorState(compact: true, onRetry: _loadPlaces)
          : const Wrap(spacing: 8, runSpacing: 8, children: [
              SkeletonBox(width: 100, height: 36, radius: 30),
              SkeletonBox(width: 130, height: 36, radius: 30),
              SkeletonBox(width: 90, height: 36, radius: 30),
            ]);
    }
    if (_places!.isEmpty) {
      return InlineMessage(tone: Tone.warning, text: context.tr('لا توجد معالم مسجلة في دلّني حالياً.', 'No landmarks on Delni yet.'));
    }
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: _places!.map((p) {
        final selected = _placeIds.contains(p.id);
        return FilterChip(
          avatar: selected ? null : const Icon(Icons.place_outlined, size: 16, color: AppColors.mutedText),
          label: Text(p.name),
          selected: selected,
          showCheckmark: true,
          checkmarkColor: Colors.white,
          selectedColor: AppColors.primary,
          labelStyle: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: selected ? Colors.white : AppColors.navy),
          side: BorderSide(color: selected ? AppColors.primary : AppColors.border),
          onSelected: (_) => setState(() => selected ? _placeIds.remove(p.id) : _placeIds.add(p.id)),
        );
      }).toList(),
    );
  }
}

class _CounterRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String valueLabel;
  final VoidCallback? onMinus;
  final VoidCallback? onPlus;

  const _CounterRow({required this.icon, required this.label, required this.valueLabel, this.onMinus, this.onPlus});

  @override
  Widget build(BuildContext context) {
    Widget btn(IconData i, VoidCallback? onTap) => IconButton(
          tooltip: i == Icons.add_rounded ? context.tr('زيادة', 'Increase') : context.tr('إنقاص', 'Decrease'),
          onPressed: onTap,
          style: IconButton.styleFrom(backgroundColor: onTap == null ? AppColors.muted : AppColors.primarySoft, foregroundColor: AppColors.primary),
          icon: Icon(i, size: 20),
        );
    return AppCard(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      child: Row(
        children: [
          IconBubble(icon: icon, size: 38),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppText.caption),
                Text(valueLabel, style: AppText.label.copyWith(fontSize: 14)),
              ],
            ),
          ),
          btn(Icons.remove_rounded, onMinus),
          const SizedBox(width: 6),
          btn(Icons.add_rounded, onPlus),
        ],
      ),
    );
  }
}

class _GuideOption extends StatelessWidget {
  final String name;
  final String? avatar;
  final bool selected;
  final VoidCallback onTap;

  const _GuideOption({required this.name, this.avatar, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsetsDirectional.only(end: 10),
      child: InkWell(
        borderRadius: BorderRadius.circular(AppRadius.md),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          width: 92,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: selected ? AppColors.primarySoft : Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.md),
            border: Border.all(color: selected ? AppColors.primary : AppColors.border, width: selected ? 1.6 : 1),
          ),
          child: Column(
            children: [
              avatar == null
                  ? const CircleAvatar(radius: 24, backgroundColor: AppColors.muted, child: Icon(Icons.shuffle_rounded, color: AppColors.primary))
                  : DelniAvatar(path: avatar, name: name, size: 48),
              const SizedBox(height: 6),
              Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.label.copyWith(fontSize: 11.5)),
            ],
          ),
        ),
      ),
    );
  }
}
