// Chapter 8 – unit tests of the driver's app logic: the stage map must match the server's, the trip day decides
// when the stage buttons work, and a driver without a vehicle is read as such. Each test prints RESULT|id|observed.
import 'package:flutter_test/flutter_test.dart';

import 'package:delni_app/models.dart';

// ignore: avoid_print (the chapter 8 results are read from this output)
void result(String id, String observed) => print('RESULT|$id|$observed');

String ymd(DateTime d) => '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';

void main() {
  test('A-STAGES app stage map equals the server map (Driver::STAGE_TRANSITIONS)', () {
    // Copied from app/Models/Driver.php: the app must offer exactly the moves the server accepts
    const server = {
      'في الانتظار': ['تم الانطلاق'],
      'تم الانطلاق': ['في الطريق - استراحة', 'وصلنا الوجهة'],
      'في الطريق - استراحة': ['تم الانطلاق', 'وصلنا الوجهة'],
      'وصلنا الوجهة': ['تم الانطلاق', 'مكتملة'],
      'مكتملة': ['في الانتظار'],
    };
    final same = server.keys.every((k) => (DriverDashboard.stageTransitions[k] ?? const []).join('|') == server[k]!.join('|')) &&
        DriverDashboard.stageTransitions.length == server.length;
    result('A-STAGES', 'خريطة المراحل في التطبيق مطابقة للخادم: ${same ? 'نعم' : 'لا'} (${DriverDashboard.stageTransitions.length} مراحل)');
    expect(same, isTrue);
  });

  test('A-DAY runsToday and daysUntilStart around the trip dates', () {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    DriverTrip trip(DateTime s, DateTime e) => DriverTrip(id: 'x', kind: 'weekly', title: 't', startDate: ymd(s), endDate: ymd(e));
    final cases = {
      'رحلة بدأت أمس وتنتهي غداً': trip(today.subtract(const Duration(days: 1)), today.add(const Duration(days: 1))),
      'رحلة تبدأ اليوم': trip(today, today),
      'رحلة تبدأ غداً': trip(today.add(const Duration(days: 1)), today.add(const Duration(days: 3))),
      'رحلة انتهت أمس': trip(today.subtract(const Duration(days: 3)), today.subtract(const Duration(days: 1))),
    };
    final seen = cases.entries.map((e) => '${e.key}: أزرار المراحل ${e.value.runsToday ? 'تعمل' : 'معطلة'}، الأيام المتبقية ${e.value.daysUntilStart}');
    result('A-DAY', seen.join('؛ '));
    expect(cases.values.map((t) => t.runsToday).toList(), [true, true, false, false]);
    expect(cases['رحلة تبدأ غداً']!.daysUntilStart, 1);
    expect(DriverTrip(id: 'x', kind: 'daily', title: 't').daysUntilStart, -1);
  });

  test('A-NOVEHICLE driver without a vehicle', () {
    final d = DriverDashboard.fromJson({
      'driver': {'driver_license_number': '656560', 'full_name': 'سائق', 'license_date_valid': '2027-05-01'},
      'vehicle': <String, dynamic>{},
      'trips': [],
    });
    final withV = DriverDashboard.fromJson({
      'driver': {'driver_license_number': '656560', 'full_name': 'سائق'},
      'vehicle': {'plate_number': '34343', 'seating_capacity': '25'},
    });
    result('A-NOVEHICLE', 'بدون مركبة: لديه مركبة = ${d.hasVehicle}، عدد الرحلات = ${d.trips.length}، صلاحية الرخصة = ${d.licenseValidUntil}؛ '
        'مع مركبة 34343: لديه مركبة = ${withV.hasVehicle}، المقاعد = ${withV.vehicleSeats}');
    expect(d.hasVehicle, isFalse);
    expect(withV.hasVehicle, isTrue);
    expect(withV.vehicleSeats, 25);
  });
}
