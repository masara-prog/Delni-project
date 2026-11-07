// Chapter 5 – white-box unit tests: every branch of the tourist field rules and of the price / status logic
// is exercised with values chosen from the code itself (equivalence classes and boundaries).
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:delni_app/models.dart';
import 'package:delni_app/widgets/common.dart';

void result(String id, String observed) => print('RESULT|$id|$observed');

TextEditingValue fmt(TextInputFormatter f, String text) =>
    f.formatEditUpdate(TextEditingValue.empty, TextEditingValue(text: text));

void main() {
  test('W-1 isValidPhone', () {
    final cases = {
      '0912345678': true, // 09 + 8 digits
      '٠٩١٢٣٤٥٦٧٨': true, // Arabic-Indic digits are normalised first
      ' 0912345678 ': true, // trimmed
      '0812345678': false, // wrong prefix
      '091234567': false, // 9 digits (lower boundary - 1)
      '09123456789': false, // 11 digits (upper boundary + 1)
      '09-1234567': false, // separator
      '': false,
    };
    final got = {for (final k in cases.keys) k: isValidPhone(k)};
    result('W-1', got.entries.map((e) => '${e.key.trim().isEmpty ? '(empty)' : e.key.trim()}=${e.value}').join(', '));
    expect(got, cases);
  });

  test('W-2 isValidIdNumber', () {
    final cases = {
      'AB1234': true, // 6 = lower boundary
      'ab1234': true, // lower case is upper-cased
      'AB12345678': true, // 10 = upper boundary
      'AB123': false, // 5
      'AB123456789': false, // 11
      'جواز123456': false, // Arabic letters
      'AB-1234': false, // dash
    };
    final got = {for (final k in cases.keys) k: isValidIdNumber(k)};
    result('W-2', got.entries.map((e) => '${e.key}=${e.value}').join(', '));
    expect(got, cases);
  });

  test('W-3 isValidEmail', () {
    final cases = {
      'sara@delni.ly': true,
      'Sara.Ali+trip@mail.example.com': true,
      'qa5.ui@bad': false, // no top-level domain
      'sara@@delni.ly': false,
      '@delni.ly': false,
      'sara delni@delni.ly': false,
    };
    final got = {for (final k in cases.keys) k: isValidEmail(k)};
    result('W-3', got.entries.map((e) => '${e.key}=${e.value}').join(', '));
    expect(got, cases);
  });

  test('W-4 input formatters', () {
    final phone = fmt(const DigitsInputFormatter(10), 'ab٠٩12-34 56789999').text;
    final id = fmt(const IdInputFormatter(10), 'ab-12 جواز 345678901').text;
    result('W-4', 'phone field "ab٠٩12-34 56789999" -> "$phone" | id field "ab-12 جواز 345678901" -> "$id"');
    expect(phone, '0912345678');
    expect(id, 'AB12345678');
  });

  test('W-5 normalizeDigits', () {
    final out = normalizeDigits(' ٠١٢٣٤٥٦٧٨٩ ');
    result('W-5', '"٠١٢٣٤٥٦٧٨٩" -> "$out"');
    expect(out, '0123456789');
  });

  test('W-6 offer price on a weekly trip (inside / outside the offer period)', () {
    Trip weekly(String start) => Trip.fromJson({
          'weekly_trip_id': 'W',
          'trip_title': 'ت',
          'seat_per_price': 300,
          'start_date': start,
          'end_date': start,
          'active_offer': {'title': 'عرض', 'discount': 20, 'start_date': '2026-11-01', 'end_date': '2026-11-30'},
        }, 'weekly');
    final inside = weekly('2026-11-25');
    final outside = weekly('2026-12-05');
    result('W-6', 'start in offer: applies=${inside.offerAppliesNow} price=${inside.offerPrice} | start after offer: applies=${outside.offerAppliesNow}');
    expect(inside.offerAppliesNow, isTrue);
    expect(inside.offerPrice, 240);
    expect(outside.offerAppliesNow, isFalse);
  });

  test('W-7 booking status branches', () {
    Booking b(String status, String pay) => Booking.fromJson({'booking_weekly_id': 'B', 'booking_status': status, 'payment_status': pay}, 'weekly');
    final rows = {
      'مؤكدة/unpaid': [b('مؤكدة', 'unpaid').isCancelled, b('مؤكدة', 'unpaid').isPaid],
      'ملغاة من السائح/unpaid': [b('ملغاة من السائح', 'unpaid').isCancelled, b('ملغاة من السائح', 'unpaid').isPaid],
      'مؤكدة/paid': [b('مؤكدة', 'paid').isCancelled, b('مؤكدة', 'paid').isPaid],
    };
    result('W-7', rows.entries.map((e) => '${e.key}: cancelled=${e.value[0]} paid=${e.value[1]}').join(' | '));
    expect(rows['مؤكدة/unpaid'], [false, false]);
    expect(rows['ملغاة من السائح/unpaid'], [true, false]);
    expect(rows['مؤكدة/paid'], [false, true]);
  });

  test('W-8 missing or malformed fields from the server do not crash the parser', () {
    final t = Trip.fromJson({'daily_trip_id': 'D', 'price_per_seat': 'abc', 'images': null, 'open_dates': 'x'}, 'daily');
    final b = Booking.fromJson({}, 'daily');
    result('W-8', 'trip price="abc" -> ${t.price}, open dates -> ${t.openDates.length}; empty booking -> id="${b.id}" seats=${b.seats}');
    expect(t.price, 0);
    expect(b.seats, 0);
  });
}
