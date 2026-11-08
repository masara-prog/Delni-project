// Chapter 5 – black-box tests of the tourist screens of the Delni mobile app against the running Laravel API.
// Run:  flutter test test/chapter5_live_test.dart --dart-define=QA_TOKENS=<path to tokens.json>
// Each test prints "RESULT|<id>|<observed>" so the observed behaviour can be written into the test tables.
import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:delni_app/api_service.dart';
import 'package:delni_app/core/app_state.dart';
import 'package:delni_app/core/i18n.dart';
import 'package:delni_app/core/theme.dart';
import 'package:delni_app/models.dart';
import 'package:delni_app/screens/auth/login_screen.dart';
import 'package:delni_app/screens/auth/auth_widgets.dart';
import 'package:delni_app/screens/auth/tourist_signup_screen.dart';
import 'package:delni_app/screens/tourist/account_tab.dart';
import 'package:delni_app/screens/tourist/detail_screens.dart';
import 'package:delni_app/screens/tourist/private_trip_screen.dart';
import 'package:delni_app/screens/tourist/tourist_shell.dart';
import 'package:delni_app/screens/tourist/trip_details_screen.dart';
import 'package:delni_app/widgets/common.dart';

late Map<String, String> tokens;
final rnd = Random();
final stamp = DateTime.now().millisecondsSinceEpoch % 1000000;

void result(String id, String observed) => debugPrint('RESULT|$id|$observed');

UserSession tourist(String id) => UserSession(role: 'tourist', name: 'سائح اختبار', identifier: id, token: tokens[id]);

Widget host(Widget child, AppState state, {Locale locale = AppLocale.arabic}) {
  final appLocale = AppLocale()..set(locale);
  return LocaleScope(
    locale: appLocale,
    child: AppScope(
      state: state,
      child: MaterialApp(
        locale: appLocale.locale,
        supportedLocales: const [AppLocale.arabic, AppLocale.english],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        theme: AppTheme.light(),
        home: child,
      ),
    ),
  );
}

/// Lets real network I/O complete, pumping frames until [done] holds.
Future<void> waitUntil(WidgetTester t, bool Function() done, {int seconds = 25}) async {
  for (var i = 0; i < seconds * 4; i++) {
    await t.runAsync(() => Future<void>.delayed(const Duration(milliseconds: 250)));
    await t.pump(const Duration(milliseconds: 16));
    if (done()) {
      await t.pump(const Duration(milliseconds: 300));
      return;
    }
  }
  fail('timed out');
}

bool has(String text) => find.textContaining(text).evaluate().isNotEmpty;

Future<void> phone(WidgetTester t, {double w = 390, double h = 844}) async {
  t.view.physicalSize = Size(w * 3, h * 3);
  t.view.devicePixelRatio = 3;
  addTearDown(t.view.reset);
}

Future<void> typeAt(WidgetTester t, int index, String text) async {
  await t.enterText(find.byType(TextField).at(index), text);
  await t.pump();
}

Future<void> tapF(WidgetTester t, Finder f) async {
  await Scrollable.ensureVisible(t.element(f), alignment: 0.5);
  await t.pump(const Duration(milliseconds: 300));
  await t.tap(f);
  await t.pump(const Duration(milliseconds: 300));
}

/// Scrolls the main vertical list until [f] is built (lists build their children lazily).
Future<void> reveal(WidgetTester t, Finder f) async {
  // the tallest vertical list on screen (not the small scroll area of a multi-line text field)
  Finder biggest() {
    final all = find.byWidgetPredicate((w) => w is Scrollable && w.axisDirection == AxisDirection.down).evaluate().toList();
    all.sort((a, b) => (b.size?.height ?? 0).compareTo(a.size?.height ?? 0));
    final target = all.first.widget;
    return find.byWidget(target);
  }
  for (var i = 0; i < 40 && f.evaluate().isEmpty; i++) {
    final pos = t.state<ScrollableState>(biggest()).position;
    if (pos.pixels >= pos.maxScrollExtent) break;
    pos.jumpTo((pos.pixels + 250).clamp(0, pos.maxScrollExtent));
    await t.pump(const Duration(milliseconds: 200));
  }
}

Future<void> tapText(WidgetTester t, String text) async {
  await reveal(t, find.text(text));
  await tapF(t, find.text(text).last);
}

/// Types into the AppTextField whose label is [label].
Future<void> typeLabel(WidgetTester t, String label, String text) async {
  final f = find.descendant(of: find.byWidgetPredicate((w) => w is AppTextField && w.label == label), matching: find.byType(TextField));
  await reveal(t, f);
  await Scrollable.ensureVisible(t.element(f), alignment: 0.5);
  await t.enterText(f, text);
  await t.pump();
}

Future<void> typeLabelTap(WidgetTester t, String label) async {
  final f = find.descendant(of: find.byWidgetPredicate((w) => w is AppTextField && w.label == label), matching: find.byType(TextField));
  await reveal(t, f);
  await tapF(t, f);
}

/// Error shown in red inside the screen (InlineMessage with the danger tone).
String dangerText() {
  final m = find.byWidgetPredicate((w) => w is InlineMessage && w.tone == Tone.danger).evaluate().map((e) => (e.widget as InlineMessage).text).toList();
  return m.isEmpty ? '' : m.last;
}

/// Layout overflows are recorded (they are a compatibility finding), other errors still fail the test.
final layoutErrors = <String>[];

void liveTest(String name, Future<void> Function(WidgetTester t) body) {
  testWidgets(name, (t) async {
    final old = FlutterError.onError;
    final mine = <String>[];
    FlutterError.onError = (d) {
      final msg = d.exceptionAsString().split('\n').first;
      if (msg.contains('overflowed')) {
        mine.add(msg);
      } else {
        old?.call(d);
      }
    };
    try {
      await body(t);
    } finally {
      FlutterError.onError = old;
      if (mine.isNotEmpty) debugPrint('LAYOUT|$name|${mine.toSet().join(' ; ')}');
      layoutErrors.addAll(mine);
      await t.pumpWidget(const SizedBox());
      await t.pump(const Duration(seconds: 20)); // let request time-outs and snackbars expire
    }
  });
}

Future<void> loadFonts() async {
  final dir = Directory('assets/fonts');
  final families = <String, FontLoader>{'Cairo': FontLoader('Cairo'), 'Tajawal': FontLoader('Tajawal'), 'Roboto': FontLoader('Roboto')};
  for (final file in dir.listSync().whereType<File>()) {
    final name = file.uri.pathSegments.last;
    final bytes = file.readAsBytes().then((b) => ByteData.view(b.buffer));
    if (name.startsWith('Cairo')) {
      families['Cairo']!.addFont(bytes);
      if (name.contains('400')) families['Roboto']!.addFont(file.readAsBytes().then((b) => ByteData.view(b.buffer)));
    } else if (name.startsWith('Tajawal')) {
      families['Tajawal']!.addFont(bytes);
    }
  }
  final icons = File('${Platform.environment['FLUTTER_ROOT']}/bin/cache/artifacts/material_fonts/MaterialIcons-Regular.otf');
  if (icons.existsSync()) {
    families['MaterialIcons'] = FontLoader('MaterialIcons')..addFont(icons.readAsBytes().then((b) => ByteData.view(b.buffer)));
  }
  for (final l in families.values) {
    await l.load();
  }
}

Future<Trip> loadTrip(WidgetTester t, String id, bool weekly) async {
  final trips = await t.runAsync(() => weekly ? ApiService.fetchWeeklyTrips() : ApiService.fetchDailyTrips());
  return trips!.firstWhere((x) => x.id == id);
}

void main() {
  setUpAll(() async {
    await loadFonts();
    HttpOverrides.global = null; // real HTTP to the Laravel API
    tokens = Map<String, String>.from(json.decode(File(const String.fromEnvironment('QA_TOKENS')).readAsStringSync()));
  });
  setUp(() => ApiService.currentSession = null);

  // ------------------------------------------------------------------ sign up
  group('M-1 sign up', () {
    final email = 'qa7.m$stamp@delni.ly';
    final passport = 'QM${stamp.toString().padLeft(6, '0')}';
    final mobile = '0917${(stamp % 1000000).toString().padLeft(6, '0')}';

    Future<AppState> open(WidgetTester t) async {
      await phone(t);
      final state = AppState();
      await t.pumpWidget(host(const TouristSignupScreen(), state));
      await t.pump();
      return state;
    }

    Future<void> fill(WidgetTester t, {String name = 'سائحة تطبيق الهاتف', String? ph, String? mail, String? id, String pwd = 'Mobile#2026', bool agree = true}) async {
      await typeAt(t, 0, name);
      await typeAt(t, 1, ph ?? mobile);
      await typeAt(t, 2, mail ?? email);
      await typeAt(t, 3, id ?? passport);
      await typeAt(t, 4, pwd);
      if (agree) {
        await tapF(t, find.byType(Checkbox));
      }
    }

    Future<String> submit(WidgetTester t, AppState s, {bool server = false}) async {
      await tapText(t, 'إنشاء الحساب');
      if (server) await waitUntil(t, () => s.session != null || find.byType(InlineMessage).evaluate().isNotEmpty);
      final msgs = find.byType(InlineMessage).evaluate().map((e) => (e.widget as InlineMessage).text).toList();
      return msgs.isEmpty ? '' : msgs.last;
    }

    liveTest('M-1.1 valid data creates the account', (t) async {
      final s = await open(t);
      await fill(t);
      final msg = await submit(t, s, server: true);
      result('M-1.1', s.session != null ? 'signed in as ${s.session!.identifier} ${has('تم إنشاء حسابك بنجاح') ? '+ welcome snackbar' : ''}' : msg);
      expect(s.session, isNotNull);
    });
    liveTest('M-1.2 e-mail already registered', (t) async {
      final s = await open(t);
      await fill(t, mail: email.toUpperCase(), id: 'QN${stamp.toString().padLeft(6, '0')}', ph: '0927${(stamp % 1000000).toString().padLeft(6, '0')}');
      final msg = await submit(t, s, server: true);
      result('M-1.2', msg);
      expect(s.session, isNull);
    });
    liveTest('M-1.3 empty form', (t) async {
      final s = await open(t);
      final msg = await submit(t, s);
      result('M-1.3', msg);
      expect(msg, isNotEmpty);
    });
    liveTest('M-1.4 phone 12345 and letters', (t) async {
      final s = await open(t);
      await fill(t, ph: '12345');
      final msg = await submit(t, s);
      await typeAt(t, 1, 'abcdef');
      final typed = (t.widget(find.byType(TextField).at(1)) as TextField).controller!.text;
      result('M-1.4', '$msg | letters typed in phone field -> "$typed"');
      expect(msg, contains('09'));
    });
    liveTest('M-1.5 password 7 / 8 characters (boundary)', (t) async {
      final s = await open(t);
      await fill(t, pwd: '1234567');
      final m7 = await submit(t, s);
      result('M-1.5', '7 chars: $m7');
      expect(m7, contains('8'));
    });
    liveTest('M-1.6 passport 5 / 11 characters (boundary)', (t) async {
      final s = await open(t);
      await fill(t, id: 'AB123');
      final m5 = await submit(t, s);
      await typeAt(t, 3, 'AB123456789');
      final typed = (t.widget(find.byType(TextField).at(3)) as TextField).controller!.text;
      result('M-1.6', '5 chars: $m5 | 11 typed -> "$typed" (${typed.length})');
      expect(typed.length, lessThanOrEqualTo(10));
    });
    liveTest('M-1.7 bad e-mail', (t) async {
      final s = await open(t);
      await fill(t, mail: 'qa7.ui@bad');
      final msg = await submit(t, s);
      result('M-1.7', msg);
    });
    liveTest('M-1.8 terms not accepted', (t) async {
      final s = await open(t);
      await fill(t, agree: false);
      final msg = await submit(t, s);
      result('M-1.8', msg);
      expect(s.session, isNull);
    });
  });

  // ------------------------------------------------------------------ login
  group('M-2 login', () {
    Future<(AppState, String)> login(WidgetTester t, String email, String pwd, {bool server = true}) async {
      await phone(t);
      final s = AppState();
      await t.pumpWidget(host(const LoginScreen(role: AuthRole.tourist), s));
      await t.pump();
      await typeAt(t, 0, email);
      await typeAt(t, 1, pwd);
      await tapText(t, 'تسجيل الدخول');
      if (server) await waitUntil(t, () => s.session != null || find.byType(InlineMessage).evaluate().isNotEmpty);
      final msgs = find.byType(InlineMessage).evaluate().map((e) => (e.widget as InlineMessage).text).toList();
      return (s, msgs.isEmpty ? '' : msgs.last);
    }

    liveTest('M-2.1 correct e-mail and password', (t) async {
      final (s, msg) = await login(t, 'qa7.load5@delni.ly', 'QaLoad#2026');
      result('M-2.1', s.session != null ? 'signed in, role=${s.session!.role}, token received=${s.session!.token != null}' : msg);
      expect(s.session, isNotNull);
    });
    liveTest('M-2.2 wrong password', (t) async {
      final (s, msg) = await login(t, 'qa7.load5@delni.ly', 'Wrong#2026');
      result('M-2.2', msg);
      expect(s.session, isNull);
    });
    liveTest('M-2.3 e-mail not registered', (t) async {
      final (s, msg) = await login(t, 'qa7.nobody$stamp@delni.ly', 'Wrong#2026');
      result('M-2.3', msg);
      expect(s.session, isNull);
    });
    liveTest('M-2.4 empty fields', (t) async {
      final (s, msg) = await login(t, '', '', server: false);
      result('M-2.4', msg);
      expect(s.session, isNull);
    });
    liveTest('M-2.5 server unreachable', (t) async {
      final saved = ApiService.baseUrl;
      ApiService.baseUrl = 'http://127.0.0.1:8999/api';
      ApiService.candidateUrls.clear();
      try {
        final (s, msg) = await login(t, 'qa7.load5@delni.ly', 'QaLoad#2026');
        result('M-2.5', msg);
        expect(s.session, isNull);
      } finally {
        ApiService.baseUrl = saved;
        ApiService.isConnectedToLiveDb = true;
      }
    });
  });

  // ------------------------------------------------------------------ trips and search
  group('M-3 trips', () {
    liveTest('M-3.1 home lists the daily and weekly trips from the server', (t) async {
      await phone(t);
      final s = AppState()..signIn(tourist('QAL00006'));
      final watch = Stopwatch()..start();
      await t.pumpWidget(host(const TouristShell(), s));
      await waitUntil(t, () => s.catalog.loaded);
      watch.stop();
      final ids = s.catalog.trips!.map((x) => x.id).toList();
      result('M-3.1', 'trips loaded in ~${watch.elapsedMilliseconds} ms: ${ids.join(', ')} | places=${s.catalog.places?.length} hotels=${s.catalog.hotels?.length}');
      expect(ids, containsAll(['QA-DT-1', 'QA-WT-1']));
    });
    liveTest('M-3.2 search', (t) async {
      await phone(t);
      final s = AppState()..signIn(tourist('QAL00006'));
      await t.pumpWidget(host(const TouristShell(), s));
      await waitUntil(t, () => s.catalog.loaded);
      final field = find.byType(TextField).first;
      await t.ensureVisible(field);
      await t.enterText(field, 'غدامس');
      await t.pump(const Duration(milliseconds: 400));
      final found = has('رحلة اختبار غدامس الأسبوعية');
      final other = has('رحلة اختبار صبراتة اليومية');
      await t.enterText(field, 'زززز');
      await t.pump(const Duration(milliseconds: 400));
      result('M-3.2', '"غدامس": weekly shown=$found, daily shown=$other | "زززز": empty message=${has('لا توجد رحلات مطابقة')}');
      expect(found, isTrue);
    });
    liveTest('M-3.3 trip details', (t) async {
      await phone(t);
      final trip = await loadTrip(t, 'QA-WT-1', true);
      await t.pumpWidget(host(TripDetailsScreen(trip: trip), AppState()));
      await t.pump(const Duration(milliseconds: 600));
      result('M-3.3', 'title=${has(trip.title)} price300=${has('300')} city=${has('طرابلس')} seats=${trip.availableSeats}');
      expect(has(trip.title), isTrue);
    });
  });

  // ------------------------------------------------------------------ booking
  group('M-4 booking', () {
    Future<AppState> openTrip(WidgetTester t, Trip trip, String? who) async {
      await phone(t);
      final s = AppState();
      if (who != null) s.signIn(tourist(who));
      await t.pumpWidget(host(TripDetailsScreen(trip: trip), s));
      await t.pump(const Duration(milliseconds: 600));
      return s;
    }

    Future<void> openSheet(WidgetTester t) async {
      await tapF(t, find.text('احجز الآن').last);
      await t.pump(const Duration(milliseconds: 600));
    }

    liveTest('M-4.1 weekly trip, 2 seats', (t) async {
      final trip = await loadTrip(t, 'QA-WT-1', true);
      await openTrip(t, trip, 'QAL00006');
      await openSheet(t);
      await tapF(t, find.byTooltip('زيادة مقعد'));
      await t.pump();
      final total = has('600');
      await tapText(t, 'تأكيد الحجز');
      await waitUntil(t, () => has('تم تأكيد حجزك') || dangerText().isNotEmpty);
      final after = await loadTrip(t, 'QA-WT-1', true);
      result('M-4.1', 'dialog=${has('تم تأكيد حجزك')} ${dangerText()} total600=$total seats ${trip.availableSeats} -> ${after.availableSeats}');
      expect(after.availableSeats, trip.availableSeats - 2);
    });
    liveTest('M-4.2 seats cannot exceed the seats left', (t) async {
      final trip = await loadTrip(t, 'QA-WT-1', true);
      await openTrip(t, trip, 'QAL00007');
      await openSheet(t);
      for (var i = 0; i < 15; i++) {
        final plus = t.widget<IconButton>(find.widgetWithIcon(IconButton, Icons.add_rounded).last);
        if (plus.onPressed == null) break;
        await tapF(t, find.byTooltip('زيادة مقعد'));
        await t.pump();
      }
      final shown = (t.widget<Text>(find.descendant(of: find.byType(SizedBox), matching: find.byWidgetPredicate((w) => w is Text && RegExp(r'^\d+$').hasMatch(w.data ?? ''))).last)).data;
      result('M-4.2', 'available ${trip.availableSeats}, stepper stopped at $shown');
      expect(int.parse(shown!), trip.availableSeats);
    });
    liveTest('M-4.3 full trip', (t) async {
      final trip = await loadTrip(t, 'QA-WT-2', true);
      await openTrip(t, trip, 'QAL00007');
      final sheetOpened = find.text('احجز الآن').evaluate().isNotEmpty;
      if (sheetOpened) await openSheet(t);
      final btns = find.widgetWithText(ElevatedButton, 'تأكيد الحجز');
      final disabled = btns.evaluate().isEmpty || t.widget<ElevatedButton>(btns.last).onPressed == null;
      result('M-4.3', 'button=${has('الحجز مغلق') ? 'الحجز مغلق' : 'احجز الآن'} no-seats text=${has('لا توجد مقاعد')} confirm disabled=$disabled');
      expect(disabled, isTrue);
    });
    liveTest('M-4.4 daily trip with a departure day', (t) async {
      final trip = await loadTrip(t, 'QA-DT-1', false);
      await openTrip(t, trip, 'QAL00008');
      await openSheet(t);
      final confirm = find.ancestor(of: find.text('تأكيد الحجز'), matching: find.byType(ElevatedButton));
      bool enabled() => confirm.evaluate().any((e) => (e.widget as ElevatedButton).onPressed != null);
      await waitUntil(t, enabled); // the departure days are loaded from the server
      final rows = find.textContaining('مقعد متاح').evaluate().length;
      await tapText(t, 'تأكيد الحجز');
      await waitUntil(t, () => has('تم تأكيد حجزك') || dangerText().isNotEmpty);
      result('M-4.4', 'date rows=$rows dialog=${has('تم تأكيد حجزك')} ${dangerText()}');
      expect(has('تم تأكيد حجزك'), isTrue);
    });
    liveTest('M-4.5 visitor without an account taps book', (t) async {
      final trip = await loadTrip(t, 'QA-WT-1', true);
      await openTrip(t, trip, null);
      await openSheet(t);
      result('M-4.5', 'login prompt=${has('سجّل الدخول بحساب سائح')}, booking sheet=${has('تأكيد الحجز')}');
      expect(has('سجّل الدخول'), isTrue);
    });
  });

  // ------------------------------------------------------------------ bookings and tickets
  group('M-5 bookings', () {
    Future<AppState> openBookings(WidgetTester t, String who) async {
      await phone(t);
      final s = AppState()..signIn(tourist(who));
      s.touristTab.value = 2;
      await t.pumpWidget(host(const TouristShell(), s));
      await waitUntil(t, () => has('القادمة') || has('لا توجد حجوزات بعد'));
      return s;
    }

    liveTest('M-5.1 my bookings', (t) async {
      await openBookings(t, 'QAL00006');
      result('M-5.1', 'upcoming=${has('القادمة')} trip=${has('رحلة اختبار غدامس')} unpaid=${has('غير مدفوع')}');
      expect(has('رحلة اختبار غدامس'), isTrue);
    });
    liveTest('M-5.2 open the e-ticket', (t) async {
      await openBookings(t, 'QAL00006');
      await tapText(t, 'اضغط لعرض التذكرة كاملة');
      await t.pump(const Duration(milliseconds: 800));
      final numberShown = find.textContaining('BKW-').evaluate().isNotEmpty;
      result('M-5.2', 'ticket-number label=${has('رقم التذكرة')} number shown=$numberShown QR shown=${find.textContaining('QR').evaluate().isNotEmpty} guide row=${has('المرشد السياحي')} seats=${has('مقاعد')}');
      expect(has('رقم التذكرة') && numberShown, isTrue);
    });
    liveTest('M-5.3 cancel a booking', (t) async {
      final before = await loadTrip(t, 'QA-WT-1', true);
      await openBookings(t, 'QAL00006');
      await tapText(t, 'اضغط لعرض التذكرة كاملة');
      await t.pump(const Duration(milliseconds: 800));
      await tapText(t, 'إلغاء الحجز');
      await t.pump(const Duration(milliseconds: 500));
      await tapText(t, 'نعم، ألغِ الحجز');
      await waitUntil(t, () => has('تم إلغاء الحجز') || has('ملغ'));
      final after = await loadTrip(t, 'QA-WT-1', true);
      result('M-5.3', 'message=${has('تم إلغاء الحجز') || has('إلغاء')} seats ${before.availableSeats} -> ${after.availableSeats}');
      expect(after.availableSeats, before.availableSeats + 2);
    });
    liveTest('M-5.4 tourist with no bookings', (t) async {
      await openBookings(t, 'QAL00011');
      result('M-5.4', 'empty state=${has('لا توجد حجوزات بعد')}');
      expect(has('لا توجد حجوزات بعد'), isTrue);
    });
  });

  // ------------------------------------------------------------------ private trip
  group('M-6 private trip', () {
    Future<AppState> open(WidgetTester t) async {
      await phone(t);
      final s = AppState()..signIn(tourist('QAL00012'));
      await t.pumpWidget(host(const PrivateTripScreen(), s));
      await waitUntil(t, () => find.byType(FilterChip).evaluate().isNotEmpty);
      return s;
    }

    String msg() {
      final m = find.byType(InlineMessage).evaluate().map((e) => (e.widget as InlineMessage).text).toList();
      return m.isEmpty ? '' : m.last;
    }

    liveTest('M-6.1 no landmark chosen', (t) async {
      await open(t);
      await tapText(t, 'إرسال الطلب');
      result('M-6.1', msg());
      expect(msg(), contains('معلم'));
    });
    liveTest('M-6.2 landmark but no date', (t) async {
      await open(t);
      await tapF(t, find.byType(FilterChip).first);
      await tapText(t, 'إرسال الطلب');
      result('M-6.2', msg());
      expect(msg(), contains('تاريخ'));
    });
    liveTest('M-6.3 date picker blocks the next 10 days and a valid request is sent', (t) async {
      await open(t);
      await tapF(t, find.byType(FilterChip).first);
      await typeLabelTap(t, 'تاريخ بدء الرحلة');
      await t.pump(const Duration(milliseconds: 500));
      final picker = t.widget<CalendarDatePicker>(find.byType(CalendarDatePicker));
      final days = picker.firstDate.difference(DateTime.now()).inHours / 24;
      await t.tap(find.text('حسنًا').evaluate().isNotEmpty ? find.text('حسنًا') : find.byType(TextButton).last);
      await t.pump(const Duration(milliseconds: 500));
      await tapText(t, 'إرسال الطلب');
      await waitUntil(t, () => has('تم إرسال طلبك') || msg().isNotEmpty);
      result('M-6.3', 'first selectable date after ${days.toStringAsFixed(1)} days | sent dialog=${has('تم إرسال طلبك')} ${msg()}');
      expect(has('تم إرسال طلبك'), isTrue);
    });
  });

  // ------------------------------------------------------------------ explore (guide)
  group('M-7 explore', () {
    Future<AppState> open(WidgetTester t, int section) async {
      await phone(t);
      final s = AppState()..signIn(tourist('QAL00012'));
      s.touristTab.value = 1;
      s.exploreSection.value = section;
      await t.pumpWidget(host(const TouristShell(), s));
      await waitUntil(t, () => s.catalog.loaded);
      await t.pump(const Duration(milliseconds: 500));
      return s;
    }

    liveTest('M-7.1 landmarks', (t) async {
      final s = await open(t, 1);
      result('M-7.1', 'landmarks loaded=${s.catalog.places!.length}');
      expect(s.catalog.places, isNotEmpty);
    });
    liveTest('M-7.2 hotel details has contact, no booking', (t) async {
      final s = await open(t, 2);
      final h = s.catalog.hotels!.firstWhere((x) => x.id == 'QA-H-1');
      await t.pumpWidget(host(HotelDetailsScreen(hotel: h), s));
      await t.pump(const Duration(milliseconds: 600));
      result('M-7.2', 'name=${has('فندق اختبار دلني')} note=${has('الحجز يتم مباشرة مع المنشأة')} booking button=${find.ancestor(of: find.textContaining('احجز'), matching: find.byWidgetPredicate((w) => w is ButtonStyleButton)).evaluate().isNotEmpty}');
      expect(has('الحجز يتم مباشرة مع المنشأة'), isTrue);
    });
    liveTest('M-7.3 cafés and restaurants', (t) async {
      final s = await open(t, 3);
      result('M-7.3', 'restaurants loaded=${s.catalog.restaurants!.map((r) => r.name).join(', ')} shown=${has('مقهى اختبار دلني')}');
      expect(has('مقهى اختبار دلني'), isTrue);
    });
  });

  // ------------------------------------------------------------------ profile
  group('M-8 profile', () {
    Future<void> open(WidgetTester t) async {
      await phone(t);
      final s = AppState()..signIn(UserSession(role: 'tourist', name: 'سائح اختبار الحمل 13', email: 'qa7.load13@delni.ly', phone: '0918000013', identifier: 'QAL00013', token: tokens['QAL00013']));
      await t.pumpWidget(host(const Scaffold(body: ProfileScreen()), s));
      await t.pump(const Duration(milliseconds: 400));
    }

    String msg() {
      final m = find.byType(InlineMessage).evaluate().map((e) => (e.widget as InlineMessage).text).toList();
      return m.isEmpty ? '' : m.last;
    }

    int field(String label) {
      final all = find.byType(TextField).evaluate().toList();
      for (var i = 0; i < all.length; i++) {
        final tf = all[i].widget as TextField;
        if ((tf.decoration?.labelText ?? '') == label || (tf.decoration?.hintText ?? '') == label) return i;
      }
      return -1;
    }

    liveTest('M-8.1 valid change is saved', (t) async {
      await open(t);
      final n = find.byType(TextField).evaluate().length;
      await typeLabel(t, 'الاسم الكامل', 'سائح اختبار معدل');
      await tapText(t, 'حفظ التغييرات');
      await waitUntil(t, () => has('تم حفظ') || has('تم تحديث') || dangerText().isNotEmpty);
      result('M-8.1', 'fields=$n saved message=${has('تم حفظ') || has('تم تحديث')} ${dangerText()}');
      expect(has('تم حفظ') || has('تم تحديث'), isTrue);
    });
    liveTest('M-8.2 empty name', (t) async {
      await open(t);
      await typeLabel(t, 'الاسم الكامل', '');
      await tapText(t, 'حفظ التغييرات');
      await t.pump(const Duration(milliseconds: 300));
      result('M-8.2', msg());
      expect(msg(), contains('الاسم'));
    });
    liveTest('M-8.3 new password and confirmation differ', (t) async {
      await open(t);
      await typeLabel(t, 'كلمة المرور الجديدة', 'NewPass#2026');
      await typeLabel(t, 'تأكيد كلمة المرور', 'Other#2026');
      await tapText(t, 'حفظ التغييرات');
      await t.pump(const Duration(milliseconds: 300));
      result('M-8.3', '${msg()} | current-password field=${find.byWidgetPredicate((w) => w is AppTextField && w.label.contains('الحالية')).evaluate().isNotEmpty}');
      expect(msg(), contains('مطابق'));
    });
    liveTest('M-8.4 new password without the current one', (t) async {
      await open(t);
      await typeLabel(t, 'كلمة المرور الجديدة', 'NewPass#2026');
      await typeLabel(t, 'تأكيد كلمة المرور', 'NewPass#2026');
      await tapText(t, 'حفظ التغييرات');
      await t.pump(const Duration(milliseconds: 300));
      result('M-8.4', msg());
      expect(msg(), contains('الحالية'));
    });
    liveTest('M-8.5 wrong current password', (t) async {
      await open(t);
      await typeLabel(t, 'كلمة المرور الجديدة', 'NewPass#2026');
      await typeLabel(t, 'تأكيد كلمة المرور', 'NewPass#2026');
      await typeLabel(t, 'كلمة المرور الحالية', 'Wrong#2026');
      await tapText(t, 'حفظ التغييرات');
      await waitUntil(t, () => dangerText().isNotEmpty || has('تم حفظ') || has('تم تحديث'));
      result('M-8.5', dangerText());
      expect(dangerText(), contains('الحالية غير صحيحة'));
    });
    liveTest('M-8.6 correct current password ends the other sessions', (t) async {
      // a second session of the same account, as if signed in on another phone
      final other = await t.runAsync(() async {
        final r = await HttpClient().postUrl(Uri.parse('${ApiService.baseUrl}/auth/login'));
        r.headers.contentType = ContentType.json;
        r.headers.set('Accept', 'application/json');
        r.write(json.encode({'role': 'tourist', 'login': 'qa7.load13@delni.ly', 'password': 'QaLoad#2026'}));
        final res = await r.close();
        return json.decode(await res.transform(utf8.decoder).join())['token'] as String;
      });
      Future<int> statusWith(String token) async => (await t.runAsync(() async {
            final r = await HttpClient().getUrl(Uri.parse('${ApiService.baseUrl}/bookings/tourist/QAL00013'));
            r.headers.set('Accept', 'application/json');
            r.headers.set('Authorization', 'Bearer $token');
            return (await r.close()).statusCode;
          }))!;
      final before = await statusWith(other!);
      await open(t);
      await typeLabel(t, 'كلمة المرور الجديدة', 'NewPass#2026');
      await typeLabel(t, 'تأكيد كلمة المرور', 'NewPass#2026');
      await typeLabel(t, 'كلمة المرور الحالية', 'QaLoad#2026');
      await tapText(t, 'حفظ التغييرات');
      await waitUntil(t, () => dangerText().isNotEmpty || has('تم حفظ') || has('تم تحديث'));
      final saved = has('تم حفظ') || has('تم تحديث');
      final after = await statusWith(other);
      final thisDevice = await statusWith(tokens['QAL00013']!);
      result('M-8.6', 'saved=$saved ${dangerText()} | other session before=$before after=$after | this device after=$thisDevice');
      expect(saved && after == 401 && thisDevice == 200, isTrue);
    });
  });

  // ------------------------------------------------------------------ compatibility
  group('M-9 compatibility', () {
    liveTest('M-9.1 English switches the layout to LTR', (t) async {
      await phone(t);
      final s = AppState()..signIn(tourist('QAL00012'));
      await t.pumpWidget(host(const TouristShell(), s, locale: AppLocale.english));
      await waitUntil(t, () => s.catalog.loaded);
      final dir = Directionality.of(t.element(find.byType(TouristShell)));
      result('M-9.1', 'direction=$dir tabs: Home=${has('Home')} Explore=${has('Explore')} Bookings=${has('Bookings')}');
      expect(dir, TextDirection.ltr);
    });
    for (final size in const [Size(320, 640), Size(360, 800), Size(412, 915), Size(800, 1280)]) {
      liveTest('M-9.2 screens fit ${size.width.toInt()}x${size.height.toInt()}', (t) async {
        await phone(t, w: size.width, h: size.height);
        final s = AppState()..signIn(tourist('QAL00006'));
        final errors = <String>[];
        var screen = '';
        final old = FlutterError.onError;
        FlutterError.onError = (d) => errors.add('$screen: ${d.exceptionAsString().split('\n').first}');
        try {
          for (final tab in [0, 1, 2, 3]) {
            screen = const ['الرئيسية', 'استكشف', 'حجوزاتي', 'حسابي'][tab];
            s.touristTab.value = tab;
            await t.pumpWidget(host(const TouristShell(), s));
            await waitUntil(t, () => s.catalog.loaded, seconds: 20);
            await t.pump(const Duration(milliseconds: 600));
          }
          final trip = await loadTrip(t, 'QA-WT-1', true);
          screen = 'تفاصيل الرحلة';
          await t.pumpWidget(host(TripDetailsScreen(trip: trip), s));
          await t.pump(const Duration(milliseconds: 600));
        } finally {
          FlutterError.onError = old;
        }
        result('M-9.2-${size.width.toInt()}', errors.isEmpty ? 'no layout errors' : errors.toSet().join(' ; '));
        expect(errors, isEmpty);
      });
    }
  });
}
