import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/brand.dart';
import '../../widgets/common.dart';
import 'auth_widgets.dart';
import 'login_screen.dart';

/// First screen: pick how to use Delni (tourist, guide, driver) or browse as a visitor.
class RoleSelectScreen extends StatefulWidget {
  const RoleSelectScreen({super.key});

  @override
  State<RoleSelectScreen> createState() => _RoleSelectScreenState();
}

class _RoleSelectScreenState extends State<RoleSelectScreen> {
  static const _photos = [
    'assets/images/hero-leptis.jpg',
    'assets/images/dest-ubari-gaberoun.jpg',
    'assets/images/dest-sabratha-theater.jpg',
    'assets/images/dest-ghadames-oasis.jpg',
    'assets/images/dest-jabal-akhdar.jpg',
  ];
  int _index = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 5), (_) {
      // Respect the phone's "reduce motion" setting: the slideshow stays still
      if (mounted && !MediaQuery.disableAnimationsOf(context)) setState(() => _index = (_index + 1) % _photos.length);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _openLogin(AuthRole role) {
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => LoginScreen(role: role)));
  }

  void _enterAsGuest() {
    AppScope.read(context).signIn(UserSession(
      role: 'tourist',
      name: context.tr('زائر', 'Visitor'),
      isGuest: true,
    ));
  }

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: AppColors.navy,
        body: Stack(
          fit: StackFit.expand,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 1200),
              child: Image.asset(
                _photos[_index],
                key: ValueKey(_index),
                fit: BoxFit.cover,
                width: double.infinity,
                height: double.infinity,
              ),
            ),
            const DecoratedBox(decoration: BoxDecoration(gradient: AppGradients.hero)),
            SafeArea(
              bottom: false,
              child: LayoutBuilder(
                builder: (context, constraints) => SingleChildScrollView(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(minHeight: constraints.maxHeight),
                    child: IntrinsicHeight(
                      child: Column(
                children: [
                  Padding(
                    padding: const EdgeInsets.fromLTRB(Gap.page, 12, Gap.page, 0),
                    // Only the language button on the photo; the full logo sits on the white sheet below
                    child: const Align(alignment: AlignmentDirectional.centerEnd, child: LanguagePill(light: true)),
                  ),
                  const Spacer(),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: Gap.page),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          context.tr('اكتشف ليبيا\nكما لم تعرفها من قبل', 'Discover Libya\nlike never before'),
                          style: const TextStyle(color: Colors.white, fontSize: 30, fontWeight: FontWeight.w800, height: 1.3),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          context.tr(
                            'رحلات يومية وأسبوعية، مرشدون معتمدون، فنادق ومطاعم شريكة — في تطبيق واحد.',
                            'Day and weekly trips, licensed guides, partner hotels and restaurants — in one place.',
                          ),
                          style: const TextStyle(color: Colors.white70, fontSize: 14, height: 1.6, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: List.generate(
                            _photos.length,
                            (i) => AnimatedContainer(
                              duration: const Duration(milliseconds: 300),
                              margin: const EdgeInsetsDirectional.only(end: 6),
                              width: i == _index ? 22 : 7,
                              height: 7,
                              decoration: BoxDecoration(
                                color: i == _index ? AppColors.desertSand : Colors.white38,
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: top > 0 ? 20 : 24),
                  Container(
                    width: double.infinity,
                    decoration: const BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.vertical(top: Radius.circular(32)),
                      boxShadow: [BoxShadow(color: Color(0x330B1B2B), blurRadius: 30, offset: Offset(0, -8))],
                    ),
                    padding: EdgeInsets.fromLTRB(Gap.page, 18, Gap.page, 12 + MediaQuery.of(context).padding.bottom),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        // Compact header (title + small full logo) so the photos above keep most of the screen
                        Row(
                          children: [
                            Expanded(child: Text(context.tr('كيف تريد استخدام دلّني؟', 'How will you use Delni?'), style: AppText.h2)),
                            const SizedBox(width: 8),
                            Semantics(
                              label: context.tr('دلّني، دليلك لاكتشاف ليبيا', 'Delni, your guide to Libya'),
                              image: true,
                              child: Image.asset('assets/images/logo_full_clear.png', height: 46, fit: BoxFit.contain),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        _RoleTile(
                          role: AuthRole.tourist,
                          subtitle: context.tr('احجز الرحلات وتابع تذاكرك', 'Book trips and follow your tickets'),
                          tone: Tone.primary,
                          onTap: () => _openLogin(AuthRole.tourist),
                        ),
                        const SizedBox(height: 10),
                        _RoleTile(
                          role: AuthRole.guide,
                          subtitle: context.tr('رحلاتك المسندة وقوائم المسافرين', 'Your assigned trips and passengers'),
                          tone: Tone.orange,
                          onTap: () => _openLogin(AuthRole.guide),
                        ),
                        const SizedBox(height: 10),
                        _RoleTile(
                          role: AuthRole.driver,
                          subtitle: context.tr('مركبتك ورحلاتك ومرحلة الرحلة', 'Your vehicle, trips and trip stage'),
                          tone: Tone.success,
                          onTap: () => _openLogin(AuthRole.driver),
                        ),
                        const SizedBox(height: 12),
                        OutlinedButton.icon(
                          onPressed: _enterAsGuest,
                          icon: const Icon(Icons.explore_outlined, size: 20),
                          label: Text(context.tr('تصفح التطبيق كزائر', 'Browse as a visitor')),
                        ),
                      ],
                    ),
                  ),
                ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _RoleTile extends StatelessWidget {
  final AuthRole role;
  final String subtitle;
  final Tone tone;
  final VoidCallback onTap;

  const _RoleTile({required this.role, required this.subtitle, required this.tone, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppRadius.md);
    return DecoratedBox(
      decoration: BoxDecoration(
        borderRadius: radius,
        border: Border.all(color: AppColors.border.withValues(alpha: 0.7)),
        boxShadow: AppShadows.card,
      ),
      child: Material(
        color: Colors.white,
        borderRadius: radius,
        child: InkWell(
          borderRadius: radius,
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
            child: Row(
              children: [
                IconBubble(icon: role.icon, tone: tone, size: 44),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(role.title(context), style: AppText.h3),
                      const SizedBox(height: 2),
                      Text(subtitle, style: AppText.caption),
                    ],
                  ),
                ),
                Container(
                  width: 32,
                  height: 32,
                  decoration: const BoxDecoration(color: AppColors.muted, shape: BoxShape.circle),
                  child: Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: AppColors.navy, size: 20),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
