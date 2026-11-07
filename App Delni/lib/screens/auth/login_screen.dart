import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/common.dart';
import 'auth_widgets.dart';
import 'forgot_password_screen.dart';
import 'guide_signup_screen.dart';
import 'tourist_signup_screen.dart';

class LoginScreen extends StatefulWidget {
  final AuthRole role;
  final String? initialEmail;
  final String? notice;

  const LoginScreen({super.key, required this.role, this.initialEmail, this.notice});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  late final _email = TextEditingController(text: widget.initialEmail);
  final _password = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _email.text.trim();
    final pass = _password.text.trim();
    String? error;
    if (email.isEmpty) {
      error = context.tr('يرجى إدخال البريد الإلكتروني', 'Please enter your email');
    } else if (!isValidEmail(email)) {
      error = context.tr('يرجى إدخال بريد إلكتروني صحيح (example@delni.ly)', 'Please enter a valid email (example@delni.ly)');
    } else if (pass.isEmpty) {
      error = context.tr('يرجى إدخال كلمة المرور', 'Please enter your password');
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
    final res = await ApiService.login(role: widget.role.apiName, login: email, password: pass);
    if (!mounted) return;
    setState(() => _loading = false);
    if (res.success && res.session != null) {
      AppScope.read(context).signIn(res.session!);
      Navigator.of(context).popUntil((r) => r.isFirst);
    } else {
      setState(() => _error = res.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final role = widget.role;
    final subtitle = switch (role) {
      AuthRole.tourist => context.tr('سجّل دخولك لحجز الرحلات ومتابعة تذاكرك.', 'Sign in to book trips and follow your tickets.'),
      AuthRole.guide => context.tr('ادخل إلى لوحة المرشد لمتابعة رحلاتك المسندة.', 'Open your guide dashboard and assigned trips.'),
      AuthRole.driver => context.tr('ادخل إلى لوحة السائق لمتابعة مركبتك ورحلاتك.', 'Open your driver dashboard, vehicle and trips.'),
    };
    return AuthScaffold(
      photo: role.photo,
      title: context.tr('مرحباً بعودتك', 'Welcome back'),
      subtitle: subtitle,
      badge: RoleBadge(role: role),
      children: [
        if (widget.notice != null) ...[
          InlineMessage(text: widget.notice!, tone: Tone.success),
          const SizedBox(height: Gap.lg),
        ],
        AutofillGroup(
          child: Column(
            children: [
              AppTextField(
                label: context.tr('البريد الإلكتروني', 'Email'),
                controller: _email,
                hint: 'name@example.com',
                icon: Icons.alternate_email_rounded,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                autofillHints: const [AutofillHints.email],
                ltr: true,
              ),
              const SizedBox(height: Gap.lg),
              AppTextField(
                label: context.tr('كلمة المرور', 'Password'),
                controller: _password,
                hint: '••••••••',
                icon: Icons.lock_outline_rounded,
                password: true,
                textInputAction: TextInputAction.done,
                autofillHints: const [AutofillHints.password],
                onSubmitted: (_) => _submit(),
              ),
            ],
          ),
        ),
        Align(
          alignment: AlignmentDirectional.centerEnd,
          child: TextButton(
            onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => ForgotPasswordScreen(role: role))),
            child: Text(context.tr('نسيت كلمة المرور؟', 'Forgot password?')),
          ),
        ),
        if (_error != null) ...[
          InlineMessage(text: _error!, tone: Tone.danger),
          const SizedBox(height: Gap.lg),
        ] else
          const SizedBox(height: Gap.sm),
        AppButton(
          label: context.tr('تسجيل الدخول', 'Sign in'),
          icon: Icons.login_rounded,
          loading: _loading,
          onPressed: _submit,
        ),
        const SizedBox(height: Gap.xl),
        if (role == AuthRole.driver)
          InlineMessage(
            tone: Tone.neutral,
            icon: Icons.info_outline_rounded,
            text: context.tr(
              'حسابات السائقين تُنشأ من قبل شركات النقل المتعاقدة مع دلّني. تواصل مع شركتك إن لم تكن لديك بيانات الدخول.',
              'Driver accounts are created by the transport companies partnered with Delni. Ask your company for your sign-in details.',
            ),
          )
        else
          Center(
            child: Wrap(
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Text(context.tr('ليس لديك حساب؟', "Don't have an account?"), style: AppText.bodyMuted),
                TextButton(
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(
                    builder: (_) => role == AuthRole.guide ? const GuideSignupScreen() : const TouristSignupScreen(),
                  )),
                  child: Text(role == AuthRole.guide
                      ? context.tr('قدّم طلب اعتماد كمرشد', 'Apply as a guide')
                      : context.tr('أنشئ حساباً جديداً', 'Create an account')),
                ),
              ],
            ),
          ),
        const SizedBox(height: Gap.sm),
        Center(
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                ApiService.isConnectedToLiveDb ? Icons.cloud_done_rounded : Icons.cloud_off_rounded,
                size: 15,
                color: ApiService.isConnectedToLiveDb ? AppColors.accent : AppColors.gold,
              ),
              const SizedBox(width: 6),
              Text(
                ApiService.isConnectedToLiveDb
                    ? context.tr('متصل بخادم دلّني', 'Connected to the Delni server')
                    : context.tr('لم يتم الوصول إلى الخادم بعد', 'Server not reached yet'),
                style: AppText.caption.copyWith(fontSize: 11.5),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
