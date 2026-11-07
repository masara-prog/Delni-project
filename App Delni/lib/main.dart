import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'core/app_state.dart';
import 'core/i18n.dart';
import 'core/theme.dart';
import 'screens/auth/role_select_screen.dart';
import 'screens/driver/driver_home.dart';
import 'screens/guide/guide_home.dart';
import 'screens/splash_screen.dart';
import 'screens/tourist/tourist_shell.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.dark,
  ));
  runApp(DelniApp());
}

class DelniApp extends StatelessWidget {
  DelniApp({super.key});

  final AppLocale _locale = AppLocale();
  final AppState _state = AppState();

  @override
  Widget build(BuildContext context) {
    return LocaleScope(
      locale: _locale,
      child: AppScope(
        state: _state,
        child: ListenableBuilder(
          listenable: _locale,
          builder: (context, _) => MaterialApp(
            title: 'Delni',
            debugShowCheckedModeBanner: false,
            locale: _locale.locale,
            supportedLocales: const [AppLocale.arabic, AppLocale.english],
            localizationsDelegates: const [
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            theme: AppTheme.light(),
            home: const SplashScreen(next: RootGate()),
          ),
        ),
      ),
    );
  }
}

/// Shows the auth flow, or the home of the signed-in role.
class RootGate extends StatelessWidget {
  const RootGate({super.key});

  @override
  Widget build(BuildContext context) {
    final session = AppScope.of(context).session;
    final Widget child;
    if (session == null) {
      child = const RoleSelectScreen();
    } else if (session.role == 'guide') {
      child = const GuideHome();
    } else if (session.role == 'driver') {
      child = const DriverHome();
    } else {
      child = const TouristShell();
    }
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 350),
      child: KeyedSubtree(key: ValueKey('${session?.role}-${session?.isGuest}-${session?.identifier}'), child: child),
    );
  }
}
