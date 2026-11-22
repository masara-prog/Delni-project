import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../api_service.dart';
import '../core/app_state.dart';
import '../core/i18n.dart';
import '../core/theme.dart';
import '../widgets/brand.dart';

/// First screen: white with the Delni logo (continues the Android launch screen). A moment later the name
/// «Delni» rises under the logo letter by letter, then the whole screen fades into the app.
/// The animation runs while the app finds the server and restores the saved account, so it adds no waiting:
/// the hand-over happens as soon as both the work and the animation (about 1.9 s) are done.
class SplashScreen extends StatefulWidget {
  final Widget next;
  const SplashScreen({super.key, required this.next});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> with TickerProviderStateMixin {
  // 0 → 1 over the whole intro: logo settles, then the name appears
  late final AnimationController _intro = AnimationController(vsync: this, duration: const Duration(milliseconds: 1500))..forward();
  // the closing fade, played once everything is ready
  late final AnimationController _out = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));

  static const _name = 'Delni';

  @override
  void initState() {
    super.initState();
    // after the first frame: the scopes above this screen can be read safely
    WidgetsBinding.instance.addPostFrameCallback((_) => _start());
  }

  Future<void> _start() async {
    final state = AppScope.read(context);
    final locale = LocaleScope.of(context);
    await Future.wait([
      locale.restore(),
      ApiService.testAndConnect().then((_) => state.restoreSession()),
      Future.delayed(const Duration(milliseconds: 1500)),
    ]);
    if (!mounted) return;
    await _out.forward();
    if (!mounted) return;
    Navigator.of(context).pushReplacement(PageRouteBuilder(
      transitionDuration: const Duration(milliseconds: 380),
      pageBuilder: (_, __, ___) => widget.next,
      transitionsBuilder: (_, a, __, child) => FadeTransition(opacity: a, child: child),
    ));
  }

  @override
  void dispose() {
    _intro.dispose();
    _out.dispose();
    super.dispose();
  }

  // part of the intro between [a] and [b] (0..1), eased
  Animation<double> _part(double a, double b, [Curve curve = Curves.easeOutCubic]) =>
      CurvedAnimation(parent: _intro, curve: Interval(a, b, curve: curve));

  @override
  Widget build(BuildContext context) {
    final logoLift = _part(0.0, 0.45);
    final glow = _part(0.30, 0.75, Curves.easeInOut);
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle.dark.copyWith(statusBarColor: Colors.transparent),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: AnimatedBuilder(
          animation: Listenable.merge([_intro, _out]),
          builder: (context, _) {
            final out = Curves.easeInCubic.transform(_out.value);
            return Opacity(
              opacity: 1 - out,
              child: Transform.scale(
                scale: 1 + 0.06 * out,
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Logo: starts exactly where the Android launch screen left it, then moves up a little
                      Transform.translate(
                        offset: Offset(0, 46 * (1 - logoLift.value)),
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.primaryGlow.withValues(alpha: 0.28 * glow.value * (1 - glow.value) * 4 * 0.6),
                                blurRadius: 40,
                                spreadRadius: 6,
                              ),
                            ],
                          ),
                          child: const DelniMark(size: 150),
                        ),
                      ),
                      const SizedBox(height: 18),
                      // The name: each letter rises and fades in a little after the one before it
                      Directionality(
                        textDirection: TextDirection.ltr,
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            for (var i = 0; i < _name.length; i++)
                              Builder(builder: (_) {
                                final start = 0.42 + i * 0.07;
                                final p = _part(start, (start + 0.30).clamp(0.0, 1.0), Curves.easeOutBack).value;
                                final o = _part(start, (start + 0.22).clamp(0.0, 1.0)).value;
                                return Opacity(
                                  opacity: o.clamp(0.0, 1.0),
                                  child: Transform.translate(
                                    offset: Offset(0, 22 * (1 - p)),
                                    child: i == 0
                                        // The «D» in the brand's bright desert orange, a touch larger than the rest
                                        ? ShaderMask(
                                            blendMode: BlendMode.srcIn,
                                            shaderCallback: (r) => const LinearGradient(
                                              begin: Alignment.topCenter,
                                              end: Alignment.bottomCenter,
                                              colors: [Color(0xFFFB923C), Color(0xFFEA580C)],
                                            ).createShader(r),
                                            child: Text(
                                              _name[i],
                                              style: const TextStyle(
                                                fontFamily: 'Cairo',
                                                fontSize: 54,
                                                fontWeight: FontWeight.w900,
                                                height: 1.0,
                                                letterSpacing: 1.5,
                                                color: Colors.white,
                                              ),
                                            ),
                                          )
                                        : Text(
                                            _name[i],
                                            style: const TextStyle(
                                              fontFamily: 'Cairo',
                                              fontSize: 46,
                                              fontWeight: FontWeight.w800,
                                              height: 1.1,
                                              letterSpacing: 1.5,
                                              color: AppColors.primary,
                                            ),
                                          ),
                                  ),
                                );
                              }),
                          ],
                        ),
                      ),
                    ],
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
