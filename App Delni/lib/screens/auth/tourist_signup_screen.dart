import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/common.dart';
import 'auth_widgets.dart';

class TouristSignupScreen extends StatefulWidget {
  const TouristSignupScreen({super.key});

  @override
  State<TouristSignupScreen> createState() => _TouristSignupScreenState();
}

class _TouristSignupScreenState extends State<TouristSignupScreen> {
  final _name = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _passport = TextEditingController();
  final _password = TextEditingController();
  bool _agree = false;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [_name, _phone, _email, _passport, _password]) {
      c.dispose();
    }
    super.dispose();
  }

  String? _validate() {
    if (_name.text.trim().length < 3) return context.tr('يرجى إدخال الاسم بالكامل بشكل صحيح (3 أحرف على الأقل)', 'Please enter your full name (3+ letters)');
    if (!isValidPhone(_phone.text)) {
      return context.tr('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)', 'The phone must start with 09 and have 10 digits (e.g. 0912345678)');
    }
    if (!isValidIdNumber(_passport.text)) {
      return context.tr('رقم جواز السفر / الرقم الوطني يجب أن يتكون من 6 إلى 10 خانات (أحرف إنجليزية أو أرقام)', 'The passport / national ID must have 6 to 10 letters or digits');
    }
    if (!isValidEmail(_email.text)) return context.tr('يرجى إدخال بريد إلكتروني صحيح ومعتمد', 'Please enter a valid email');
    if (_password.text.length < minPasswordLength) {
      return context.tr('كلمة المرور يجب ألا تقل عن 8 خانات للحفاظ على أمان حسابك', 'The password must be at least 8 characters');
    }
    if (!_agree) return context.tr('يجب الموافقة على الشروط وسياسة الخصوصية لإتمام التسجيل', 'Please accept the terms and privacy policy');
    return null;
  }

  Future<void> _submit() async {
    final error = _validate();
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await ApiService.registerTourist(
      fullName: _name.text,
      email: _email.text,
      phone: normalizeDigits(_phone.text),
      passportNumber: normalizeDigits(_passport.text).toUpperCase(),
      password: _password.text,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (res.success && res.session != null) {
      final messenger = ScaffoldMessenger.of(context);
      final welcome = context.tr('تم إنشاء حسابك بنجاح، مرحباً بك في دلني', 'Your account is ready — welcome to Delni');
      AppScope.read(context).signIn(res.session!);
      Navigator.of(context).popUntil((r) => r.isFirst);
      messenger.showSnackBar(SnackBar(backgroundColor: const Color(0xFF047857), content: Text(welcome)));
    } else {
      setState(() => _error = res.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      photo: 'assets/images/dest-ghadames-alleys.jpg',
      title: context.tr('إنشاء حساب سائح', 'Create a tourist account'),
      subtitle: context.tr('حساب واحد للحجز ومتابعة تذاكرك وطلب الرحلات الخاصة.', 'One account to book, follow tickets and request private trips.'),
      badge: const RoleBadge(role: AuthRole.tourist),
      children: [
        AppTextField(
          label: context.tr('الاسم الكامل', 'Full name'),
          controller: _name,
          inputFormatters: [LengthLimitingTextInputFormatter(150)],
          icon: Icons.person_outline_rounded,
          hint: context.tr('كما في جواز السفر', 'As in your passport'),
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('رقم الهاتف', 'Phone number'),
          controller: _phone,
          inputFormatters: const [DigitsInputFormatter(phoneLength)],
          icon: Icons.phone_outlined,
          hint: '09XXXXXXXX',
          keyboardType: TextInputType.phone,
          ltr: true,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('البريد الإلكتروني', 'Email'),
          controller: _email,
          icon: Icons.alternate_email_rounded,
          hint: 'name@example.com',
          keyboardType: TextInputType.emailAddress,
          ltr: true,
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('رقم جواز السفر / الرقم الوطني', 'Passport / national ID'),
          controller: _passport,
          inputFormatters: const [IdInputFormatter(idMaxLength)],
          icon: Icons.badge_outlined,
          ltr: true,
          helper: context.tr('من 6 إلى 10 خانات، ويُستخدم كمعرّف لحسابك ولا يمكن تغييره لاحقاً', '6 to 10 characters; your account ID, it cannot be changed later'),
          textInputAction: TextInputAction.next,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('كلمة المرور', 'Password'),
          controller: _password,
          icon: Icons.lock_outline_rounded,
          password: true,
          helper: context.tr('8 خانات على الأقل', 'At least 8 characters'),
        ),
        const SizedBox(height: Gap.md),
        InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () => setState(() => _agree = !_agree),
          child: Row(
            children: [
              Checkbox(value: _agree, onChanged: (v) => setState(() => _agree = v ?? false)),
              Expanded(
                child: Text(
                  context.tr('أوافق على شروط الاستخدام وسياسة الخصوصية لتطبيق دلّني', 'I agree to the Delni terms of use and privacy policy'),
                  style: AppText.bodyMuted.copyWith(fontSize: 12.5),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: Gap.md),
        if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
        AppButton(
          label: context.tr('إنشاء الحساب', 'Create account'),
          icon: Icons.person_add_alt_1_rounded,
          loading: _loading,
          onPressed: _submit,
        ),
        const SizedBox(height: Gap.md),
        Center(
          child: TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(context.tr('لديك حساب بالفعل؟ سجّل الدخول', 'Already have an account? Sign in')),
          ),
        ),
      ],
    );
  }
}
