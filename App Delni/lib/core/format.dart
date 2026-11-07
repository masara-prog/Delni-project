import 'package:flutter/material.dart';
import 'i18n.dart';

const _monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const _monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

extension FormatX on BuildContext {
  /// 150 د.ل / 150 LYD (decimals only when present).
  String money(double value) {
    final n = value == value.roundToDouble() ? value.toInt().toString() : value.toStringAsFixed(2);
    return isAr ? '$n د.ل' : '$n LYD';
  }

  /// '2026-11-12' -> '12 نوفمبر 2026' / '12 Nov 2026'. Unparseable values are returned as they are.
  String date(String iso) {
    final d = DateTime.tryParse(iso);
    if (d == null) return iso;
    return '${d.day} ${(isAr ? _monthsAr : _monthsEn)[d.month - 1]} ${d.year}';
  }

  /// '2026-11-12 14:30' -> '12 نوفمبر • 14:30'.
  String dateTime(String value) {
    final d = DateTime.tryParse(value.replaceFirst(' ', 'T'));
    if (d == null) return value;
    final hh = d.hour.toString().padLeft(2, '0');
    final mm = d.minute.toString().padLeft(2, '0');
    return '${d.day} ${(isAr ? _monthsAr : _monthsEn)[d.month - 1]} • $hh:$mm';
  }

  /// "منذ 5 دقائق" style relative time for recent values, otherwise the date.
  String ago(String value) {
    final d = DateTime.tryParse(value.replaceFirst(' ', 'T'));
    if (d == null) return value;
    final diff = DateTime.now().difference(d);
    if (diff.isNegative || diff.inDays > 6) return dateTime(value);
    if (diff.inMinutes < 1) return tr('الآن', 'Just now');
    if (diff.inMinutes < 60) return tr('منذ ${diff.inMinutes} د', '${diff.inMinutes}m ago');
    if (diff.inHours < 24) return tr('منذ ${diff.inHours} س', '${diff.inHours}h ago');
    return tr('منذ ${diff.inDays} يوم', '${diff.inDays}d ago');
  }

  String rating(double v) => v.toStringAsFixed(1);
}

String isoDate(DateTime d) =>
    '${d.year.toString().padLeft(4, '0')}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
