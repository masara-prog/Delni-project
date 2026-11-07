import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:delni_app/core/app_state.dart';
import 'package:delni_app/core/i18n.dart';
import 'package:delni_app/core/theme.dart';
import 'package:delni_app/models.dart';
import 'package:delni_app/screens/auth/role_select_screen.dart';
import 'package:delni_app/widgets/cards.dart';
import 'package:flutter_localizations/flutter_localizations.dart';

/// Wraps a screen like DelniApp does (language, app state, theme, RTL/LTR).
Widget host(Widget child, {Locale locale = AppLocale.arabic}) {
  final appLocale = AppLocale()..set(locale);
  return LocaleScope(
    locale: appLocale,
    child: AppScope(
      state: AppState(),
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

void main() {
  group('API parsing (shapes returned by the Laravel controllers)', () {
    test('daily trip from /trips/daily', () {
      final t = Trip.fromJson({
        'daily_trip_id': 'DT-1',
        'trip_title': 'لبدة الكبرى',
        'price_per_seat': '150.00',
        'departure_city': 'طرابلس',
        'images': ['/assets/dest-leptis-theater.jpg'],
        'rating_avg': 0,
        'reviews_count': 0,
        'available_seats': 12,
        'days': ['السبت', 'الأحد'],
        'open_dates': [
          {'date': '2026-11-07', 'day': 'السبت', 'seats_left': 12},
        ],
        'itinerary_steps': [
          {'station_time': '08:30:00', 'station_title': 'الانطلاق', 'station_desc': ''},
        ],
      }, 'daily');
      expect(t.id, 'DT-1');
      expect(t.price, 150);
      expect(t.openDates.single.seatsLeft, 12);
      expect(t.itinerary.single.title, 'الانطلاق');
      expect(t.reviewsCount, 0, reason: 'no invented ratings');
    });

    test('tourist bookings from /bookings/tourist/{id}', () {
      final b = Booking.fromJson({
        'booking_daily_id': 'BKD-1',
        'daily_trip_id': 'DT-1',
        'trip_title': 'لبدة الكبرى',
        'trip_date': '2026-11-07',
        'number_of_seats': 2,
        'booking_status': 'مؤكدة',
        'total_price': 300,
        'payment_status': 'unpaid',
        'daily_trip': {
          'photo': '/assets/x.jpg',
          'guide': {'full_name': 'مرشد', 'phone_number': '091'},
          'transport': {'vehicle_plate': '5-123', 'driver_name': 'سائق'},
        },
      }, 'daily');
      expect(b.id, 'BKD-1');
      expect(b.isPaid, isFalse);
      expect(b.isCancelled, isFalse);
      expect(b.guideName, 'مرشد');
      expect(b.vehiclePlate, '5-123');
    });

    test('guide dashboard from /dashboard/guide/{licence}', () {
      final d = GuideDashboard.fromJson({
        'guide': {'license_number': 'L1', 'full_name': 'م', 'availability_status': 'إجازة', 'license_expiry_date': '2027-01-01'},
        'daily_trips': [
          {
            'daily_trip_id': 'DT-1',
            'trip_title': 'ر',
            'guide_approval_status': 'بانتظار رد المرشد',
            'is_active': true,
            'bookings': [
              {'booking_daily_id': 'B1', 'number_of_seats': 3, 'booking_status': 'مؤكدة', 'tourist': {'full_name': 'س'}},
              {'booking_daily_id': 'B2', 'number_of_seats': 2, 'booking_status': 'ملغاة من السائح', 'tourist': {'full_name': 'ص'}},
            ],
          },
        ],
        'weekly_trips': [],
        'private_trips': [],
      });
      expect(d.guide.isAvailable, isFalse);
      expect(d.pendingCount, 1);
      expect(d.passengersCount, 3, reason: 'cancelled bookings are not counted');
    });

    test('trip offer, per-date prices and trip landmarks (2026-11-03 API)', () {
      final t = Trip.fromJson({
        'daily_trip_id': 'DT-2',
        'trip_title': 'صبراتة',
        'description': 'صبراتة',
        'price_per_seat': 200,
        'active_offer': {'title': 'عرض الخريف', 'discount': 25, 'start_date': '2026-11-01', 'end_date': '2026-11-30'},
        'open_dates': [
          {'date': '2026-11-07', 'day': 'السبت', 'seats_left': 5},
        ],
        'places': [
          {'place_id': 'P1', 'place_name': 'صبراتة', 'city': 'صبراتة', 'place_image': '/uploads/places/p.jpg', 'category': 'آثار'},
        ],
        'guide_years': 6,
        'guide_speaks_english': true,
        'vehicle_plate': '5-1234',
        'transport_company_phone': '0911111111',
      }, 'daily');
      expect(t.description, isEmpty, reason: 'a description that only repeats the title is not shown');
      expect(t.activeOffer!.discount, 25);
      expect(t.offerAppliesNow, isTrue);
      expect(t.offerPrice, 150);
      expect(t.places.single.image, '/uploads/places/p.jpg');
      expect(t.guideYears, 6);
      expect(t.hasVehicle, isTrue);

      final d = DepartureDate.fromJson({'date': '2026-11-07', 'day': 'السبت', 'seats_left': 5, 'discount': 25, 'price': 150});
      expect(d.price, 150);
      expect(d.discount, 25);
    });

    test('suspended partners are recognised', () {
      expect(Hotel.fromJson({'hotel_id': 'H1', 'hotel_name': 'x', 'partnership_status': 'موقوف'}).isSuspended, isTrue);
      expect(Restaurant.fromJson({'facility_id': 'R1', 'facility_name': 'y', 'partnership_status': 'نشط'}).isSuspended, isFalse);
    });

    test('empty guide / driver lists never crash', () {
      expect(GuideDashboard.fromJson({'guide': {}}).trips, isEmpty);
      final driver = DriverDashboard.fromJson({'driver': {'full_name': 'س'}, 'vehicle': null, 'trips': []});
      expect(driver.hasVehicle, isFalse);
      expect(driver.trips, isEmpty);
    });
  });

  testWidgets('role selection renders in Arabic (RTL) and English (LTR)', (tester) async {
    tester.view.physicalSize = const Size(390 * 3, 844 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);

    await tester.pumpWidget(host(const RoleSelectScreen()));
    await tester.pump();
    expect(find.text('كيف تريد استخدام دلني؟'), findsOneWidget);
    expect(Directionality.of(tester.element(find.byType(RoleSelectScreen))), TextDirection.rtl);

    await tester.pumpWidget(host(const RoleSelectScreen(), locale: AppLocale.english));
    await tester.pump();
    expect(find.text('How will you use Delni?'), findsOneWidget);
    expect(Directionality.of(tester.element(find.byType(RoleSelectScreen))), TextDirection.ltr);
  });

  testWidgets('trip card fits a small phone without overflow', (tester) async {
    tester.view.physicalSize = const Size(320 * 3, 640 * 3);
    tester.view.devicePixelRatio = 3;
    addTearDown(tester.view.reset);
    final trip = Trip(
      id: 'W1',
      type: 'weekly',
      title: 'رحلة أوباري وبحيرات الصحراء الكبرى مع التخييم تحت النجوم',
      price: 1450,
      departureCity: 'سبها',
      availableSeats: 4,
      startDate: '2026-12-01',
      endDate: '2026-12-06',
    );
    await tester.pumpWidget(host(Scaffold(body: ListView(children: [TripCard(trip: trip, onTap: () {})]))));
    await tester.pump(const Duration(milliseconds: 400));
    expect(tester.takeException(), isNull);
    expect(find.textContaining('6 أيام'), findsOneWidget);
  });
}
