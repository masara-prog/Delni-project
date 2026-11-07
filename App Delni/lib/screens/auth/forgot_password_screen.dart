import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/common.dart';
import 'auth_widgets.dart';

/// The platform has no password-reset endpoint: this screen sends the request to the administration
/// (POST /notifications, which always reaches the admin) so support can reset the password.
class ForgotPasswordScreen extends StatefulWidget {
  final AuthRole role;
  const ForgotPasswordScreen({super.key, required this.role});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _email = TextEditingController();
  final _phone = TextEditingController();
  final _note = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _phone.dispose();
    _note.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final phone = normalizeDigits(_phone.text);
    if (!isValidEmail(email)) {
      setState(() => _error = context.tr('يرجى إدخال البريد الإلكتروني المسجل في حسابك', 'Please enter the email of your account'));
      return;
    }
    if (!isValidPhone(phone)) {
      setState(() => _error = context.tr('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام ليتواصل معك الدعم', 'The phone must start with 09 and have 10 digits'));
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await ApiService.sendSupportMessage(
      subject: context.tr('طلب استعادة كلمة المرور', 'Password reset request'),
      contact: '$email • $phone',
      message: [
        '${context.tr('نوع الحساب', 'Account type')}: ${widget.role.title(context)}',
        if (_note.text.trim().isNotEmpty) _note.text.trim(),
      ].join('\n'),
    );
    if (!mounted) return;
    setState(() {
      _loading = false;
      _sent = res.success;
      _error = res.success ? null : res.message;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AuthScaffold(
      photo: 'assets/images/dest-tripoli-medina.jpg',
      title: context.tr('استعادة كلمة المرور', 'Reset your password'),
      subtitle: context.tr(
        'إعادة تعيين كلمة المرور تتم حالياً عن طريق فريق دعم دلّني بعد التحقق من هويتك.',
        'Passwords are currently reset by the Delni support team after verifying your identity.',
      ),
      badge: RoleBadge(role: widget.role),
      children: _sent ? _success(context) : _form(context),
    );
  }

  List<Widget> _form(BuildContext context) => [
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
        AppTextField(
          label: context.tr('رقم الهاتف للتواصل', 'Phone for contact'),
          controller: _phone,
          inputFormatters: const [DigitsInputFormatter(phoneLength)],
          hint: '09XXXXXXXX',
          icon: Icons.phone_outlined,
          keyboardType: TextInputType.phone,
          ltr: true,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('ملاحظة للدعم', 'Note for support'),
          controller: _note,
          hint: context.tr('أي تفاصيل تساعدنا في التحقق من حسابك', 'Anything that helps us verify your account'),
          maxLines: 3,
          optional: true,
        ),
        const SizedBox(height: Gap.lg),
        if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
        AppButton(
          label: context.tr('إرسال الطلب إلى الدعم', 'Send request to support'),
          icon: Icons.support_agent_rounded,
          loading: _loading,
          onPressed: _submit,
        ),
      ];

  List<Widget> _success(BuildContext context) => [
        Center(
          child: Container(
            width: 88,
            height: 88,
            decoration: const BoxDecoration(shape: BoxShape.circle, color: AppColors.accentSoft),
            child: const Icon(Icons.mark_email_read_rounded, color: AppColors.accent, size: 42),
          ),
        ),
        const SizedBox(height: Gap.lg),
        Center(child: Text(context.tr('تم إرسال طلبك', 'Request sent'), style: AppText.h2)),
        const SizedBox(height: 6),
        Text(
          context.tr(
            'وصل طلبك إلى إدارة دلّني. سيتواصل معك فريق الدعم على رقم هاتفك أو بريدك لإعادة تعيين كلمة المرور.',
            'Your request reached the Delni administration. Support will contact you by phone or email to reset your password.',
          ),
          textAlign: TextAlign.center,
          style: AppText.bodyMuted,
        ),
        const SizedBox(height: Gap.xl),
        AppButton(
          label: context.tr('العودة لتسجيل الدخول', 'Back to sign in'),
          variant: ButtonVariant.outline,
          onPressed: () => Navigator.of(context).pop(),
        ),
      ];
}

class _Steps extends StatelessWidget {
  const _Steps();

  @override
  Widget build(BuildContext context) {
    final steps = [
      (Icons.edit_note_rounded, context.tr('أرسل بيانات حسابك', 'Send your account details')),
      (Icons.verified_user_outlined, context.tr('يتحقق الدعم من هويتك', 'Support verifies your identity')),
      (Icons.key_rounded, context.tr('تستلم كلمة مرور جديدة', 'You receive a new password')),
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
