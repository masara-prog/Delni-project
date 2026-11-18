import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/common.dart';
import 'auth_widgets.dart';

/// Forgotten password by email: step 1 sends a 6-digit code to the account's email (valid 10 minutes),
/// step 2 takes the code and the new password (8 characters at least). Same server rules as the platform.
class ForgotPasswordScreen extends StatefulWidget {
  final AuthRole role;
  const ForgotPasswordScreen({super.key, required this.role});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _email = TextEditingController();
  final _code = TextEditingController();
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  bool _loading = false;
  bool _codeSent = false;
  bool _done = false;
  String? _error;
  String? _info;

  @override
  void dispose() {
    _email.dispose();
    _code.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  Future<void> _sendCode() async {
    final email = _email.text.trim();
    if (!isValidEmail(email)) {
      setState(() => _error = context.tr('يرجى إدخال البريد الإلكتروني المسجل في حسابك', 'Please enter the email of your account'));
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await ApiService.requestPasswordCode(role: widget.role.apiName, email: email);
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (res.success) {
        _codeSent = true;
        _info = res.message;
        _code.clear();
      } else {
        _error = res.message;
      }
    });
  }

  Future<void> _reset() async {
    final code = normalizeDigits(_code.text);
    String? error;
    if (!RegExp(r'^\d{6}$').hasMatch(code)) {
      error = context.tr('رمز التحقق يتكون من 6 أرقام', 'The code has 6 digits');
    } else if (_password.text.trim().length < 8) {
      error = context.tr('كلمة المرور الجديدة يجب أن تتكون من 8 خانات على الأقل', 'The new password must have at least 8 characters');
    } else if (_password.text.trim() != _confirm.text.trim()) {
      error = context.tr('كلمتا المرور غير متطابقتين', 'The passwords do not match');
    }
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await ApiService.resetPassword(
      role: widget.role.apiName,
      email: _email.text.trim(),
      code: code,
      password: _password.text.trim(),
    );
    if (!mounted) return;
    setState(() {
      _loading = false;
      if (res.success) {
        _done = true;
      } else {
        _error = res.message;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      photo: 'assets/images/dest-tripoli-medina.jpg',
      title: context.tr('استعادة كلمة المرور', 'Reset your password'),
      subtitle: context.tr(
        'يصلك رمز تحقق على بريدك الإلكتروني، تكتبه مع كلمة المرور الجديدة.',
        'A verification code reaches your email; enter it with your new password.',
      ),
      badge: RoleBadge(role: widget.role),
      children: _done ? _success(context) : (_codeSent ? _codeForm(context) : _emailForm(context)),
    );
  }

  List<Widget> _emailForm(BuildContext context) => [
        const _Steps(),
        const SizedBox(height: Gap.xl),
        AppTextField(
          label: context.tr('البريد الإلكتروني للحساب', 'Account email'),
          controller: _email,
          hint: 'name@example.com',
          icon: Icons.alternate_email_rounded,
          keyboardType: TextInputType.emailAddress,
          ltr: true,
        ),
        const SizedBox(height: Gap.lg),
        if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
        AppButton(
          label: context.tr('إرسال الرمز إلى بريدي', 'Email me a code'),
          icon: Icons.mark_email_unread_rounded,
          loading: _loading,
          onPressed: _sendCode,
        ),
      ];

  List<Widget> _codeForm(BuildContext context) => [
        if (_info != null) ...[InlineMessage(text: _info!, tone: Tone.success, icon: Icons.mark_email_read_rounded), const SizedBox(height: Gap.lg)],
        AppTextField(
          label: context.tr('رمز التحقق', 'Verification code'),
          controller: _code,
          inputFormatters: const [DigitsInputFormatter(6)],
          hint: '••••••',
          icon: Icons.pin_rounded,
          keyboardType: TextInputType.number,
          ltr: true,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('كلمة المرور الجديدة', 'New password'),
          controller: _password,
          password: true,
          icon: Icons.lock_outline_rounded,
          helper: context.tr('8 خانات على الأقل', 'At least 8 characters'),
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('تأكيد كلمة المرور', 'Confirm password'),
          controller: _confirm,
          password: true,
          icon: Icons.lock_reset_rounded,
        ),
        const SizedBox(height: Gap.lg),
        if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
        AppButton(
          label: context.tr('تغيير كلمة المرور', 'Change password'),
          icon: Icons.key_rounded,
          loading: _loading,
          onPressed: _reset,
        ),
        const SizedBox(height: Gap.md),
        AppButton(
          label: context.tr('إعادة إرسال الرمز', 'Send the code again'),
          variant: ButtonVariant.outline,
          onPressed: _loading ? null : _sendCode,
        ),
      ];

  List<Widget> _success(BuildContext context) => [
        Center(
          child: Container(
            width: 88,
            height: 88,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.accentSoft),
            child: const Icon(Icons.verified_rounded, color: AppColors.accent, size: 42),
          ),
        ),
        const SizedBox(height: Gap.lg),
        Center(child: Text(context.tr('تم تغيير كلمة المرور', 'Password changed'), style: AppText.h2)),
        const SizedBox(height: 6),
        Text(
          context.tr('يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.', 'You can now sign in with your new password.'),
          textAlign: TextAlign.center,
          style: AppText.bodyMuted,
        ),
        const SizedBox(height: Gap.xl),
        AppButton(
          label: context.tr('العودة لتسجيل الدخول', 'Back to sign in'),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ];
}

class _Steps extends StatelessWidget {
  const _Steps();

  @override
  Widget build(BuildContext context) {
    final steps = [
      (Icons.alternate_email_rounded, context.tr('اكتب بريد حسابك', 'Enter your account email')),
      (Icons.mark_email_unread_rounded, context.tr('يصلك رمز من 6 أرقام', 'Receive a 6-digit code')),
      (Icons.key_rounded, context.tr('اكتب الرمز وكلمة مرور جديدة', 'Enter the code and a new password')),
    ];
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: AppColors.background, borderRadius: BorderRadius.circular(AppRadius.md), border: Border.all(color: AppColors.border)),
      child: Column(
        children: [
          for (var i = 0; i < steps.length; i++)
            Padding(
              padding: EdgeInsets.only(bottom: i == steps.length - 1 ? 0 : 10),
              child: Row(
                children: [
                  Container(
                    width: 26,
                    height: 26,
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.primary),
                    child: Text('${i + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 12)),
                  ),
                  const SizedBox(width: 10),
                  Icon(steps[i].$1, size: 18, color: AppColors.primary),
                  const SizedBox(width: 6),
                  Expanded(child: Text(steps[i].$2, style: AppText.label)),
                ],
              ),
            ),
        ],
      ),
    );
  }
}
