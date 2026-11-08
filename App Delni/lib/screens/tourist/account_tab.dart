import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../api_service.dart';
import '../../core/app_state.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/account_widgets.dart';
import '../../widgets/brand.dart';
import '../../widgets/common.dart';
import '../../widgets/states.dart';
import '../auth/auth_widgets.dart';
import '../auth/login_screen.dart';
import '../auth/tourist_signup_screen.dart';
import '../shared/notifications_screen.dart';
import 'private_trip_screen.dart';

class AccountTab extends StatelessWidget {
  const AccountTab({super.key});

  void _push(BuildContext context, Widget page) => Navigator.of(context).push(MaterialPageRoute(builder: (_) => page));

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final session = state.session;
    final guest = session == null || session.isGuest;
    return Scaffold(
      appBar: AppBar(centerTitle: false, title: Text(context.tr('حسابي', 'Account'), style: AppText.h1)),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          if (guest) const _GuestCard() else
            ProfileHeader(
              name: session.name,
              subtitle: session.email,
              roleLabel: context.tr('سائح مسجل', 'Registered tourist'),
              roleIcon: Icons.verified_rounded,
            ),
          const SizedBox(height: Gap.lg),
          QuickActions(actions: [
            QuickAction(
              icon: Icons.confirmation_number_rounded,
              label: context.tr('حجوزاتي', 'Bookings'),
              color: AppColors.primary,
              onTap: () => state.touristTab.value = 2,
            ),
            QuickAction(
              icon: Icons.notifications_rounded,
              label: context.tr('الإشعارات', 'Alerts'),
              color: AppColors.brandOrange,
              badge: state.unreadNotifications,
              onTap: () => _push(context, const NotificationsScreen()),
            ),
            QuickAction(
              icon: Icons.auto_awesome_rounded,
              label: context.tr('رحلة VIP', 'VIP trip'),
              color: AppColors.accent,
              onTap: () => openPrivateTripRequest(context),
            ),
          ]),
          const SizedBox(height: Gap.xl),
          if (!guest) ...[
            MenuGroup(
              title: context.tr('حسابي', 'My account'),
              children: [
                MenuTile(
                  icon: Icons.person_outline_rounded,
                  title: context.tr('الملف الشخصي', 'Personal profile'),
                  subtitle: context.tr('الاسم والبريد والهاتف وكلمة المرور', 'Name, email, phone and password'),
                  onTap: () => _push(context, const ProfileScreen()),
                ),
              ],
            ),
            const SizedBox(height: Gap.xl),
          ],
          MenuGroup(
            title: context.tr('الخدمات', 'Services'),
            children: [
              MenuTile(
                icon: Icons.auto_awesome_outlined,
                title: context.tr('طلب رحلة خاصة VIP', 'Request a private VIP trip'),
                tone: Tone.warning,
                onTap: () => openPrivateTripRequest(context),
              ),
              MenuTile(
                icon: Icons.account_balance_wallet_outlined,
                title: context.tr('الدفع', 'Payments'),
                subtitle: context.tr('طرق الدفع وحالة مدفوعاتك', 'Payment methods and your payment status'),
                tone: Tone.success,
                onTap: () => _push(context, const PaymentScreen()),
              ),
            ],
          ),
          const SizedBox(height: Gap.xl),
          MenuGroup(
            title: context.tr('التطبيق', 'App'),
            children: [
              const LanguageTile(),
              if (guest)
                MenuTile(
                  icon: Icons.swap_horiz_rounded,
                  title: context.tr('تغيير نوع الحساب', 'Switch account type'),
                  tone: Tone.neutral,
                  onTap: () => state.signOut(),
                )
              else
                const SignOutTile(),
            ],
          ),
          const SizedBox(height: Gap.xxl),
          const Center(child: DelniLogo(markSize: 34)),
        ],
      ),
    );
  }
}

class _GuestCard extends StatelessWidget {
  const _GuestCard();

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(gradient: AppGradients.sun, borderRadius: BorderRadius.circular(AppRadius.xl), boxShadow: AppShadows.soft),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(context.tr('أنت تتصفح كزائر', 'You are browsing as a visitor'), style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w900)),
          const SizedBox(height: 4),
          Text(
            context.tr('أنشئ حساباً لحجز الرحلات ومتابعة تذاكرك وطلب الرحلات الخاصة.', 'Create an account to book trips, follow tickets and request private trips.'),
            style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.55, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppColors.primary, minimumSize: const Size(0, 46)),
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen(role: AuthRole.tourist))),
                  child: Text(context.tr('تسجيل الدخول', 'Sign in')),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: const BorderSide(color: Colors.white54),
                    minimumSize: const Size(0, 46),
                  ),
                  onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const TouristSignupScreen())),
                  child: Text(context.tr('حساب جديد', 'New account')),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Edit the tourist profile (POST /auth/tourist/update-profile).
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final UserSession _session = AppScope.read(context).session!;
  late final _name = TextEditingController(text: _session.name);
  late final _email = TextEditingController(text: _session.email);
  late final _phone = TextEditingController(text: _session.phone);
  final _password = TextEditingController();
  final _confirm = TextEditingController();
  final _current = TextEditingController();
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    for (final c in [_name, _email, _phone, _password, _confirm, _current]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    String? error;
    if (_name.text.trim().length < 3) {
      error = context.tr('يرجى إدخال الاسم بالكامل', 'Please enter your full name');
    } else if (!isValidEmail(_email.text)) {
      error = context.tr('صيغة البريد الإلكتروني غير صحيحة', 'Invalid email');
    } else if (!isValidPhone(_phone.text)) {
      error = context.tr('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)', 'The phone must start with 09 and have 10 digits');
    } else if (_password.text.isNotEmpty && _password.text.length < minPasswordLength) {
      error = context.tr('كلمة المرور الجديدة يجب ألا تقل عن 8 خانات', 'The new password must be at least 8 characters');
    } else if (_password.text != _confirm.text) {
      error = context.tr('تأكيد كلمة المرور غير مطابق', 'Passwords do not match');
    } else if (_password.text.isNotEmpty && _current.text.isEmpty) {
      error = context.tr('يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور', 'Enter your current password to change it');
    }
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _error = null;
    });
    final res = await ApiService.updateTouristProfile(
      fullName: _name.text,
      email: _email.text,
      phone: normalizeDigits(_phone.text),
      newPassword: _password.text.isEmpty ? null : _password.text,
      currentPassword: _current.text,
    );
    if (!mounted) return;
    setState(() => _saving = false);
    if (res.success) {
      AppScope.read(context).updateSession(ApiService.currentSession!);
      showAppSnack(context, res.message.isEmpty ? context.tr('تم حفظ بياناتك', 'Profile saved') : res.message, tone: Tone.success);
      Navigator.of(context).pop();
    } else {
      setState(() => _error = res.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('الملف الشخصي', 'Personal profile'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          ProfileHeader(
            name: _session.name,
            subtitle: _session.email,
            roleLabel: context.tr('سائح مسجل', 'Registered tourist'),
            roleIcon: Icons.verified_rounded,
          ),
          const SizedBox(height: Gap.xl),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.tr('البيانات الأساسية', 'Basic details'), style: AppText.h3),
                const SizedBox(height: Gap.lg),
                AppTextField(
                  label: context.tr('رقم الجواز / الرقم الوطني', 'Passport / national ID'),
                  controller: TextEditingController(text: _session.identifier ?? ''),
                  icon: Icons.badge_outlined,
                  readOnly: true,
                  ltr: true,
                  helper: context.tr('معرّف الحساب ولا يمكن تعديله', 'Account ID — cannot be changed'),
                ),
                const SizedBox(height: Gap.lg),
                AppTextField(
                  label: context.tr('الاسم الكامل', 'Full name'),
                  controller: _name,
                  icon: Icons.person_outline_rounded,
                  inputFormatters: [LengthLimitingTextInputFormatter(150)],
                ),
                const SizedBox(height: Gap.lg),
                AppTextField(
                  label: context.tr('البريد الإلكتروني', 'Email'),
                  controller: _email,
                  icon: Icons.alternate_email_rounded,
                  keyboardType: TextInputType.emailAddress,
                  ltr: true,
                ),
                const SizedBox(height: Gap.lg),
                AppTextField(
                  label: context.tr('رقم الهاتف', 'Phone number'),
                  controller: _phone,
                  inputFormatters: const [DigitsInputFormatter(phoneLength)],
                  icon: Icons.phone_outlined,
                  keyboardType: TextInputType.phone,
                  ltr: true,
                ),
              ],
            ),
          ),
          const SizedBox(height: Gap.lg),
          AppCard(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(context.tr('تغيير كلمة المرور', 'Change password'), style: AppText.h3),
                Text(context.tr('اتركها فارغة للإبقاء على كلمة المرور الحالية', 'Leave empty to keep your current password'), style: AppText.caption),
                const SizedBox(height: Gap.lg),
                AppTextField(label: context.tr('كلمة المرور الجديدة', 'New password'), controller: _password, icon: Icons.lock_outline_rounded, password: true),
                const SizedBox(height: Gap.lg),
                AppTextField(label: context.tr('تأكيد كلمة المرور', 'Confirm password'), controller: _confirm, icon: Icons.lock_outline_rounded, password: true),
                const SizedBox(height: Gap.lg),
                AppTextField(
                  label: context.tr('كلمة المرور الحالية', 'Current password'),
                  controller: _current,
                  icon: Icons.key_rounded,
                  password: true,
                  helper: context.tr('مطلوبة عند تغيير كلمة المرور فقط', 'Needed only when you change the password'),
                ),
              ],
            ),
          ),
          const SizedBox(height: Gap.lg),
          if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
          AppButton(label: context.tr('حفظ التغييرات', 'Save changes'), icon: Icons.save_outlined, loading: _saving, onPressed: _save),
        ],
      ),
    );
  }
}

/// How payment works on Delni (cash at the office) and the status of the tourist's own bookings.
class PaymentScreen extends StatefulWidget {
  const PaymentScreen({super.key});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  List<Booking>? _bookings;
  bool _failed = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _failed = false);
    final list = await ApiService.fetchMyBookings();
    if (!mounted) return;
    setState(() {
      _bookings = list;
      _failed = list == null;
    });
  }

  @override
  Widget build(BuildContext context) {
    final active = (_bookings ?? []).where((b) => !b.isCancelled).toList();
    final unpaid = active.where((b) => !b.isPaid).toList();
    final paid = active.where((b) => b.isPaid).toList();
    double sum(List<Booking> l) => l.fold(0, (s, b) => s + b.totalPrice);
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('الدفع', 'Payments'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          AppCard(
            child: Row(
              children: [
                const IconBubble(icon: Icons.storefront_rounded, tone: Tone.success, size: 48),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(context.tr('الدفع نقداً بمقر الشركة', 'Cash at the office'), style: AppText.h3),
                      Text(
                        context.tr('تُسدد تكلفة الحجز نقداً بمقر الشركة قبل موعد الرحلة، ويُحدَّث حجزك إلى «مدفوع».',
                            'Bookings are paid in cash at the office before the trip, then marked as paid.'),
                        style: AppText.caption,
                      ),
                    ],
                  ),
                ),
                StatusBadge(label: context.tr('متاح', 'Available'), tone: Tone.success, dense: true),
              ],
            ),
          ),
          const SizedBox(height: 10),
          AppCard(
            child: Row(
              children: [
                const IconBubble(icon: Icons.credit_card_rounded, tone: Tone.neutral, size: 48),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(context.tr('الدفع الإلكتروني', 'Online payment'), style: AppText.h3),
                      Text(context.tr('البطاقات والمحافظ الإلكترونية', 'Cards and e-wallets'), style: AppText.caption),
                    ],
                  ),
                ),
                StatusBadge(label: context.tr('قريباً', 'Coming soon'), tone: Tone.orange, dense: true),
              ],
            ),
          ),
          const SizedBox(height: Gap.xl),
          SectionHeader(title: context.tr('ملخص مدفوعاتك', 'Your payments')),
          const SizedBox(height: Gap.md),
          if (_bookings == null)
            _failed ? ErrorState(compact: true, onRetry: _load) : const SkeletonBox(height: 110, radius: AppRadius.lg)
          else
            Row(
              children: [
                Expanded(
                  child: StatTile(
                    value: context.tr('${sum(unpaid).toStringAsFixed(0)} د.ل', '${sum(unpaid).toStringAsFixed(0)} LYD'),
                    label: context.tr('${unpaid.length} حجز بانتظار الدفع', '${unpaid.length} awaiting payment'),
                    icon: Icons.hourglass_bottom_rounded,
                    tone: Tone.warning,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: StatTile(
                    value: context.tr('${sum(paid).toStringAsFixed(0)} د.ل', '${sum(paid).toStringAsFixed(0)} LYD'),
                    label: context.tr('${paid.length} حجز مدفوع', '${paid.length} paid'),
                    icon: Icons.verified_rounded,
                    tone: Tone.success,
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
