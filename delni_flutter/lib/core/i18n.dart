import 'package:flutter/material.dart';
import '../api_service.dart';

/// The app language (Arabic RTL by default, English LTR), switchable at runtime.
class AppLocale extends ChangeNotifier {
  static const arabic = Locale('ar', 'LY');
  static const english = Locale('en', 'US');

  Locale _locale = arabic;
  Locale get locale => _locale;
  bool get isArabic => _locale.languageCode == 'ar';

  void set(Locale locale) {
    if (locale == _locale) return;
    _locale = locale;
    ApiService.english = !isArabic;
    notifyListeners();
  }

  void toggle() => set(isArabic ? english : arabic);
}

class LocaleScope extends InheritedNotifier<AppLocale> {
  const LocaleScope({super.key, required AppLocale locale, required super.child}) : super(notifier: locale);

  static AppLocale of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<LocaleScope>()!.notifier!;
}

extension L10nX on BuildContext {
  bool get isAr => Localizations.localeOf(this).languageCode == 'ar';

  /// The text in the current language (UI copy lives next to the widget that shows it).
  String tr(String ar, String en) => isAr ? ar : en;

  AppLocale get appLocale => LocaleScope.of(this);
}

/// English labels for the Arabic values the server stores (statuses, days, trip kinds).
const Map<String, String> _serverValuesEn = {
  'مؤكدة': 'Confirmed',
  'ملغاة من السائح': 'Cancelled by you',
  'ملغاة من الإدارة': 'Cancelled by admin',
  'ملغية': 'Cancelled',
  'قيد الدراسة': 'Under review',
  'بانتظار رد المرشد': 'Awaiting guide',
  'اعتذر المرشد': 'Guide declined',
  'وافق المرشد': 'Guide accepted',
  'بانتظار تأكيد السائح': 'Awaiting your confirmation',
  'مرفوضة من الأدمن': 'Rejected by admin',
  'مرفوضة من السائح': 'Rejected by you',
  'متاح': 'Available',
  'إجازة': 'On leave',
  'في الانتظار': 'Waiting',
  'تم الانطلاق': 'Departed',
  'في الطريق - استراحة': 'On the road – break',
  'وصلنا الوجهة': 'Arrived',
  'مكتملة': 'Completed',
  'يومية': 'Daily',
  'أسبوعية': 'Weekly',
  'خاصة': 'Private',
  'السبت': 'Saturday',
  'الأحد': 'Sunday',
  'الاثنين': 'Monday',
  'الثلاثاء': 'Tuesday',
  'الأربعاء': 'Wednesday',
  'الخميس': 'Thursday',
  'الجمعة': 'Friday',
  'موثق': 'Verified',
  'قيد المراجعة': 'Under review',
  'مرفوض': 'Rejected',
};

extension ServerValueX on BuildContext {
  /// A server value shown in the current language (unknown values are shown as they are).
  String sv(String value) => isAr ? value : (_serverValuesEn[value] ?? value);
}
