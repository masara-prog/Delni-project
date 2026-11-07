import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/brand.dart';
import '../../widgets/delni_image.dart';

/// Account types that sign in from the app.
enum AuthRole { tourist, guide, driver }

extension AuthRoleX on AuthRole {
  String get apiName => name;

  String title(BuildContext c) => switch (this) {
        AuthRole.tourist => c.tr('سائح', 'Tourist'),
        AuthRole.guide => c.tr('مرشد سياحي', 'Tour guide'),
        AuthRole.driver => c.tr('سائق نقل سياحي', 'Tour driver'),
      };

  IconData get icon => switch (this) {
        AuthRole.tourist => Icons.travel_explore_rounded,
        AuthRole.guide => Icons.badge_rounded,
        AuthRole.driver => Icons.directions_bus_rounded,
      };

  String get photo => switch (this) {
        AuthRole.tourist => 'assets/images/hero-leptis.jpg',
        AuthRole.guide => 'assets/images/guide-hero.jpg',
        AuthRole.driver => 'assets/images/transport-hero.jpg',
      };
}

/// Auth page layout: a photo header with the logo, then a white rounded sheet holding the form.
class AuthScaffold extends StatelessWidget {
  final String photo;
  final String title;
  final String subtitle;
  final Widget? badge;
  final List<Widget> children;

  const AuthScaffold({
    super.key,
    required this.photo,
    required this.title,
    required this.subtitle,
    required this.children,
    this.badge,
  });

  @override
  Widget build(BuildContext context) {
    final top = MediaQuery.of(context).padding.top;
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.light,
      child: Scaffold(
        backgroundColor: Colors.white,
        body: CustomScrollView(
          slivers: [
            SliverToBoxAdapter(
              child: SizedBox(
                height: 230 + top,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    DelniImage(photo),
                    const DecoratedBox(decoration: BoxDecoration(gradient: AppGradients.hero)),
                    PositionedDirectional(
                      top: top + 6,
                      start: 8,
                      end: 16,
                      child: Row(
                        children: [
                          if (Navigator.of(context).canPop())
                            IconButton(
                              tooltip: context.tr('رجوع', 'Back'),
                              onPressed: () => Navigator.of(context).maybePop(),
                              style: IconButton.styleFrom(backgroundColor: Colors.white.withValues(alpha: 0.18)),
                              icon: Icon(context.isAr ? Icons.arrow_forward_rounded : Icons.arrow_back_rounded, color: Colors.white),
                            ),
                          const Spacer(),
                          const LanguagePill(light: true),
                        ],
                      ),
                    ),
                    const Positioned(
                      left: 0,
                      right: 0,
                      bottom: -1,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
                        ),
                        child: SizedBox(height: 28, width: double.infinity),
                      ),
                    ),
                    PositionedDirectional(
                      start: 24,
                      end: 24,
                      bottom: 44,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Logo only over the photo, as on Delni's sign-in pages
                          const DelniMark(size: 50, framed: true),
                          if (badge != null) ...[const SizedBox(height: 12), badge!],
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(Gap.page, 4, Gap.page, 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppText.h1),
                    const SizedBox(height: 4),
                    Text(subtitle, style: AppText.bodyMuted),
                    const SizedBox(height: Gap.xl),
                    ...children,
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// AR / EN switch.
class LanguagePill extends StatelessWidget {
  final bool light;
  const LanguagePill({super.key, this.light = false});

  @override
  Widget build(BuildContext context) {
    final fg = light ? Colors.white : AppColors.navy;
    return Material(
      color: light ? Colors.white.withValues(alpha: 0.18) : Colors.white,
      shape: StadiumBorder(side: BorderSide(color: light ? Colors.white24 : AppColors.border)),
      child: InkWell(
        customBorder: const StadiumBorder(),
        onTap: () => context.appLocale.toggle(),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.language_rounded, size: 17, color: fg),
              const SizedBox(width: 6),
              Text(context.isAr ? 'English' : 'العربية', style: TextStyle(color: fg, fontSize: 12.5, fontWeight: FontWeight.w800)),
            ],
          ),
        ),
      ),
    );
  }
}

/// Role chip shown on top of the auth photo.
class RoleBadge extends StatelessWidget {
  final AuthRole role;
  const RoleBadge({super.key, required this.role});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.18),
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: Colors.white24),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(role.icon, size: 16, color: Colors.white),
            const SizedBox(width: 6),
            Text(role.title(context), style: const TextStyle(color: Colors.white, fontSize: 12.5, fontWeight: FontWeight.w800)),
          ],
        ),
      );
}
