import 'dart:convert';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:image_picker/image_picker.dart';
import '../../api_service.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/states.dart';
import 'auth_widgets.dart';
import 'login_screen.dart';

/// Guide application in three steps. The account stays under review until the administration approves it.
class GuideSignupScreen extends StatefulWidget {
  const GuideSignupScreen({super.key});

  @override
  State<GuideSignupScreen> createState() => _GuideSignupScreenState();
}

class _GuideSignupScreenState extends State<GuideSignupScreen> {
  int _step = 0;
  bool _loading = false;
  String? _error;

  // Step 1 — personal
  Uint8List? _avatarBytes;
  String? _avatarDataUrl;
  final _name = TextEditingController();
  String _gender = 'male';
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();

  // Step 2 — licence & experience
  final _license = TextEditingController();
  DateTime? _licenseExpiry;
  final _experience = TextEditingController();
  final _price = TextEditingController();
  final _bio = TextEditingController();
  bool _english = false;
  bool _french = false;
  bool _italian = false;
  String? _certName;
  int? _certSize;
  String? _certDataUrl;

  // Step 3 — work places & days (place_ids must be landmarks registered on Delni)
  List<Place>? _places;
  bool _placesFailed = false;
  final Set<String> _placeIds = {};
  final Set<String> _days = {};
  bool _agree = false;

  static const _dayCodes = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];
  static const _dayNamesAr = ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  static const _dayNamesEn = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

  @override
  void initState() {
    super.initState();
    _loadPlaces();
  }

  @override
  void dispose() {
    for (final c in [_name, _phone, _email, _password, _license, _experience, _price, _bio]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _loadPlaces() async {
    setState(() => _placesFailed = false);
    final places = await ApiService.fetchPlaces();
    if (!mounted) return;
    setState(() {
      _places = places;
      _placesFailed = places == null;
    });
  }

  // --- Pickers ---

  Future<void> _pickAvatar() async {
    final source = await showAppSheet<ImageSource>(
      context,
      builder: (ctx) => Padding(
        padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SheetHeader(
              title: ctx.tr('الصورة الشخصية', 'Profile photo'),
              subtitle: ctx.tr('صورة حديثة وواضحة تظهر للسياح في ملفك', 'A recent, clear photo shown to tourists'),
              icon: Icons.add_a_photo_outlined,
            ),
            const SizedBox(height: Gap.lg),
            Row(
              children: [
                Expanded(
                  child: AppButton(
                    label: ctx.tr('الكاميرا', 'Camera'),
                    icon: Icons.photo_camera_outlined,
                    variant: ButtonVariant.ghost,
                    onPressed: () => Navigator.pop(ctx, ImageSource.camera),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: AppButton(
                    label: ctx.tr('ألبوم الصور', 'Gallery'),
                    icon: Icons.photo_library_outlined,
                    onPressed: () => Navigator.pop(ctx, ImageSource.gallery),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
    if (source == null) return;
    try {
      // Shrunk before upload like the platform (avatars at most 800 px)
      final picked = await ImagePicker().pickImage(source: source, maxWidth: 800, maxHeight: 800, imageQuality: 80);
      if (picked == null) return;
      final bytes = await picked.readAsBytes();
      setState(() {
        _avatarBytes = bytes;
        _avatarDataUrl = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        _error = null;
      });
    } catch (e) {
      if (mounted) setState(() => _error = context.tr('تعذر فتح الصور: يرجى التحقق من أذونات الهاتف', 'Could not open photos: check app permissions'));
    }
  }

  static String _mimeFor(String name) {
    final ext = name.split('.').last.toLowerCase();
    return switch (ext) {
      'pdf' => 'application/pdf',
      'png' => 'image/png',
      'jpg' || 'jpeg' => 'image/jpeg',
      'doc' => 'application/msword',
      'docx' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      _ => 'application/octet-stream',
    };
  }

  void _setCertificate(String name, Uint8List bytes) {
    setState(() {
      _certName = name;
      _certSize = bytes.length;
      _certDataUrl = 'data:${_mimeFor(name)};base64,${base64Encode(bytes)}';
      _error = null;
    });
  }

  Future<void> _pickCertificate() async {
    try {
      final result = await FilePicker.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg', 'doc', 'docx'],
        withData: true,
      );
      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;
      Uint8List? bytes = file.bytes;
      if (bytes == null && file.path != null) {
        final f = File(file.path!);
        if (await f.exists()) bytes = await f.readAsBytes();
      }
      if (bytes != null) _setCertificate(file.name, bytes);
    } catch (_) {
      // Fallback: pick an image from the gallery when the file picker is restricted
      try {
        final picked = await ImagePicker().pickImage(source: ImageSource.gallery, maxWidth: 1600, maxHeight: 1600, imageQuality: 80);
        if (picked == null) return;
        _setCertificate(picked.name, await picked.readAsBytes());
      } catch (e) {
        if (mounted) setState(() => _error = context.tr('تعذر إرفاق الملف: يرجى التحقق من أذونات التخزين', 'Could not attach the file: check storage permissions'));
      }
    }
  }

  Future<void> _pickExpiry() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _licenseExpiry ?? now.add(const Duration(days: 365)),
      firstDate: now.add(const Duration(days: 1)),
      lastDate: DateTime(now.year + 15),
      helpText: context.tr('تاريخ انتهاء الترخيص', 'Licence expiry date'),
    );
    if (picked != null) setState(() => _licenseExpiry = picked);
  }

  // --- Validation per step ---

  String? _validateStep(int step) {
    switch (step) {
      case 0:
        if (_name.text.trim().length < 3) return context.tr('يرجى إدخال الاسم بالكامل للمرشد (3 أحرف على الأقل)', 'Please enter your full name (3+ letters)');
        if (!isValidPhone(_phone.text)) {
          return context.tr('رقم هاتف المرشد يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)', 'The phone must start with 09 and have 10 digits');
        }
        if (!isValidEmail(_email.text)) return context.tr('يرجى إدخال بريد إلكتروني صحيح ومعتمد للمرشد', 'Please enter a valid email');
        if (_password.text.length < minPasswordLength) {
          return context.tr('كلمة المرور يجب ألا تقل عن 8 خانات للحفاظ على أمان حسابك', 'The password must be at least 8 characters');
        }
        return null;
      case 1:
        if (normalizeDigits(_license.text).length < 3) {
          return context.tr('يرجى إدخال رقم ترخيص مزاولة المهنة', 'Please enter your licence number');
        }
        if (_licenseExpiry == null) return context.tr('يرجى تحديد تاريخ انتهاء الترخيص (تاريخ قادم)', 'Please choose the licence expiry date');
        final years = int.tryParse(normalizeDigits(_experience.text));
        if (years == null || years < 2 || years > 40) {
          return context.tr('سنوات الخبرة يجب أن تكون بين 2 و 40 سنة', 'Experience must be between 2 and 40 years');
        }
        final price = double.tryParse(normalizeDigits(_price.text));
        if (price == null || price < 50) return context.tr('التكلفة اليومية للمرشد يجب أن تكون 50 د.ل على الأقل', 'The daily rate must be at least 50 LYD');
        if (_bio.text.trim().length < 15) {
          return context.tr('يرجى كتابة نبذة تعريفية وافية عن خبرتك السياحية (15 حرفاً على الأقل)', 'Please write a bio about your experience (15+ characters)');
        }
        if (_certDataUrl == null) return context.tr('يرجى إرفاق صورة أو ملف وثيقة الترخيص الرسمية', 'Please attach your official licence document');
        return null;
      default:
        if (_placeIds.isEmpty) return context.tr('يرجى اختيار مكان عمل واحد على الأقل من المعالم المسجلة', 'Please choose at least one work place');
        if (_days.isEmpty) return context.tr('يرجى تحديد أيام العمل المتاحة', 'Please choose your working days');
        if (!_agree) return context.tr('يجب الإقرار بصحة بيانات الترخيص والموافقة على شروط العمل', 'Please confirm your details and accept the terms');
        return null;
    }
  }

  void _next() {
    final error = _validateStep(_step);
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    if (_step < 2) {
      setState(() {
        _step++;
        _error = null;
      });
    } else {
      _submit();
    }
  }

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    final email = _email.text.trim();
    final res = await ApiService.registerGuide(
      fullName: _name.text,
      licenseNumber: normalizeDigits(_license.text),
      licenseExpiryDate: isoDate(_licenseExpiry!),
      phone: normalizeDigits(_phone.text),
      email: email,
      password: _password.text,
      pricePerDay: double.parse(normalizeDigits(_price.text)),
      experienceYears: int.parse(normalizeDigits(_experience.text)),
      gender: _gender,
      bio: _bio.text,
      placeIds: _placeIds.toList(),
      workingDays: _dayCodes.where(_days.contains).toList(),
      speaksEnglish: _english,
      speaksFrench: _french,
      speaksItalian: _italian,
      avatar: _avatarDataUrl,
      digitalCertificateFile: _certDataUrl,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (!res.success) {
      setState(() => _error = res.message);
      return;
    }
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        icon: const IconBubble(icon: Icons.verified_rounded, tone: Tone.success, size: 56),
        title: Text(ctx.tr('تم تقديم طلبك بنجاح', 'Application sent'), textAlign: TextAlign.center),
        content: Text(
          res.message.isNotEmpty
              ? res.message
              : ctx.tr('طلبك قيد مراجعة الإدارة، وسيتم إشعارك فور اعتماده.', 'Your application is under review. You will be notified once approved.'),
          textAlign: TextAlign.center,
        ),
        actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
        actions: [
          AppButton(label: ctx.tr('حسناً', 'OK'), onPressed: () => Navigator.pop(ctx)),
        ],
      ),
    );
    if (!mounted) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute(
      builder: (_) => LoginScreen(
        role: AuthRole.guide,
        initialEmail: email,
        notice: context.tr(
          'يمكنك تسجيل الدخول بعد أن تعتمد إدارة دلّني حسابك.',
          'You can sign in once the Delni team approves your account.',
        ),
      ),
    ));
  }

  // --- UI ---

  @override
  Widget build(BuildContext context) {
    final titles = [
      context.tr('البيانات الشخصية', 'Personal details'),
      context.tr('الترخيص والخبرة', 'Licence & experience'),
      context.tr('أماكن وأيام العمل', 'Work places & days'),
    ];
    return PopScope(
      canPop: _step == 0,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) setState(() => _step--);
      },
      child: AuthScaffold(
        photo: AuthRole.guide.photo,
        title: context.tr('طلب اعتماد مرشد سياحي', 'Tour guide application'),
        subtitle: context.tr('يراجع فريق دلّني طلبك ووثيقة الترخيص قبل تفعيل حسابك.', 'The Delni team reviews your application and licence before activation.'),
        badge: const RoleBadge(role: AuthRole.guide),
        children: [
          _StepIndicator(step: _step, titles: titles),
          const SizedBox(height: Gap.xl),
          AnimatedSwitcher(
            duration: const Duration(milliseconds: 250),
            child: KeyedSubtree(
              key: ValueKey(_step),
              child: switch (_step) {
                0 => _personal(context),
                1 => _professional(context),
                _ => _work(context),
              },
            ),
          ),
          const SizedBox(height: Gap.lg),
          if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
          Row(
            children: [
              if (_step > 0) ...[
                Expanded(
                  child: AppButton(
                    label: context.tr('السابق', 'Back'),
                    variant: ButtonVariant.outline,
                    onPressed: _loading ? null : () => setState(() {
                      _step--;
                      _error = null;
                    }),
                  ),
                ),
                const SizedBox(width: 10),
              ],
              Expanded(
                flex: 2,
                child: AppButton(
                  label: _step < 2 ? context.tr('التالي', 'Next') : context.tr('إرسال طلب الاعتماد', 'Submit application'),
                  icon: _step < 2 ? null : Icons.send_rounded,
                  loading: _loading,
                  onPressed: _next,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _personal(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Center(
          child: GestureDetector(
            onTap: _pickAvatar,
            child: Stack(
              children: [
                Container(
                  width: 96,
                  height: 96,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: AppColors.muted,
                    border: Border.all(color: AppColors.border, width: 2),
                    image: _avatarBytes == null ? null : DecorationImage(image: MemoryImage(_avatarBytes!), fit: BoxFit.cover),
                  ),
                  child: _avatarBytes == null ? const Icon(Icons.person_rounded, size: 46, color: AppColors.mutedText) : null,
                ),
                PositionedDirectional(
                  bottom: 0,
                  end: 0,
                  child: Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.primary,
                      border: Border.all(color: Colors.white, width: 2.5),
                    ),
                    child: const Icon(Icons.photo_camera_rounded, size: 16, color: Colors.white),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 6),
        Center(child: Text(context.tr('الصورة الشخصية (اختياري)', 'Profile photo (optional)'), style: AppText.caption)),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('الاسم الكامل', 'Full name'),
          controller: _name,
          icon: Icons.person_outline_rounded,
          inputFormatters: [LengthLimitingTextInputFormatter(150)],
        ),
        const SizedBox(height: Gap.lg),
        Text(context.tr('الجنس', 'Gender'), style: AppText.label),
        const SizedBox(height: 8),
        SegmentedButton<String>(
          showSelectedIcon: false,
          style: SegmentedButton.styleFrom(
            selectedBackgroundColor: AppColors.primary,
            selectedForegroundColor: Colors.white,
            side: const BorderSide(color: AppColors.border),
            textStyle: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w700),
          ),
          segments: [
            ButtonSegment(value: 'male', label: Text(context.tr('ذكر', 'Male')), icon: const Icon(Icons.male_rounded)),
            ButtonSegment(value: 'female', label: Text(context.tr('أنثى', 'Female')), icon: const Icon(Icons.female_rounded)),
          ],
          selected: {_gender},
          onSelectionChanged: (s) => setState(() => _gender = s.first),
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
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('البريد الإلكتروني', 'Email'),
          controller: _email,
          icon: Icons.alternate_email_rounded,
          hint: 'name@example.com',
          keyboardType: TextInputType.emailAddress,
          ltr: true,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('كلمة المرور', 'Password'),
          controller: _password,
          icon: Icons.lock_outline_rounded,
          password: true,
          helper: context.tr('8 خانات على الأقل', 'At least 8 characters'),
        ),
      ],
    );
  }

  Widget _professional(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        AppTextField(
          label: context.tr('رقم ترخيص مزاولة المهنة', 'Guide licence number'),
          controller: _license,
          inputFormatters: const [IdInputFormatter(30, allowDash: true)],
          icon: Icons.badge_outlined,
          hint: 'LY-TG-2026-001',
          ltr: true,
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('تاريخ انتهاء الترخيص', 'Licence expiry date'),
          controller: TextEditingController(text: _licenseExpiry == null ? '' : context.date(isoDate(_licenseExpiry!))),
          icon: Icons.event_rounded,
          hint: context.tr('اختر التاريخ', 'Choose a date'),
          readOnly: true,
          onTap: _pickExpiry,
        ),
        const SizedBox(height: Gap.lg),
        Row(
          children: [
            Expanded(
              child: AppTextField(
                label: context.tr('سنوات الخبرة', 'Years of experience'),
                controller: _experience,
                inputFormatters: const [DigitsInputFormatter(2)],
                icon: Icons.workspace_premium_outlined,
                keyboardType: TextInputType.number,
                hint: '2 - 40',
                ltr: true,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: AppTextField(
                label: context.tr('الأجر اليومي (د.ل)', 'Daily rate (LYD)'),
                controller: _price,
                inputFormatters: const [DigitsInputFormatter(5)],
                icon: Icons.payments_outlined,
                keyboardType: TextInputType.number,
                ltr: true,
              ),
            ),
          ],
        ),
        const SizedBox(height: Gap.lg),
        AppTextField(
          label: context.tr('نبذة تعريفية', 'Short bio'),
          controller: _bio,
          helper: context.tr('15 حرفاً على الأقل', 'At least 15 characters'),
          maxLines: 4,
          hint: context.tr('خبرتك والمعالم التي تتقن شرحها...', 'Your experience and the sites you know best...'),
        ),
        const SizedBox(height: Gap.lg),
        Text(context.tr('اللغات (إضافة إلى العربية)', 'Languages (besides Arabic)'), style: AppText.label),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            _toggleChip(context.tr('الإنجليزية', 'English'), _english, () => setState(() => _english = !_english)),
            _toggleChip(context.tr('الفرنسية', 'French'), _french, () => setState(() => _french = !_french)),
            _toggleChip(context.tr('الإيطالية', 'Italian'), _italian, () => setState(() => _italian = !_italian)),
          ],
        ),
        const SizedBox(height: Gap.lg),
        Text(context.tr('وثيقة الترخيص الرسمية', 'Official licence document'), style: AppText.label),
        const SizedBox(height: 8),
        InkWell(
          onTap: _pickCertificate,
          borderRadius: BorderRadius.circular(AppRadius.md),
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _certName == null ? AppColors.background : AppColors.accentSoft,
              borderRadius: BorderRadius.circular(AppRadius.md),
              border: Border.all(color: _certName == null ? AppColors.border : AppColors.accent.withValues(alpha: 0.4), width: 1.4),
            ),
            child: Row(
              children: [
                IconBubble(
                  icon: _certName == null ? Icons.upload_file_rounded : Icons.task_alt_rounded,
                  tone: _certName == null ? Tone.primary : Tone.success,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _certName ?? context.tr('اضغط لإرفاق الوثيقة', 'Tap to attach the document'),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppText.label,
                      ),
                      Text(
                        _certSize == null ? 'PDF • JPG • PNG • DOC' : '${(_certSize! / 1024).toStringAsFixed(0)} KB',
                        style: AppText.caption.copyWith(fontSize: 11.5),
                      ),
                    ],
                  ),
                ),
                if (_certName != null) Text(context.tr('تغيير', 'Change'), style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.w800, fontSize: 12.5)),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _work(BuildContext context) {
    final names = context.isAr ? _dayNamesAr : _dayNamesEn;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(context.tr('أماكن العمل (المعالم السياحية)', 'Work places (landmarks)'), style: AppText.label),
        const SizedBox(height: 4),
        Text(context.tr('اختر المعالم التي تعمل بها من المعالم المسجلة في دلّني.', 'Choose the Delni landmarks where you work.'), style: AppText.caption),
        const SizedBox(height: 10),
        if (_places == null && !_placesFailed)
          const Wrap(spacing: 8, runSpacing: 8, children: [
            SkeletonBox(width: 90, height: 36, radius: 30),
            SkeletonBox(width: 120, height: 36, radius: 30),
            SkeletonBox(width: 100, height: 36, radius: 30),
          ])
        else if (_placesFailed)
          ErrorState(compact: true, onRetry: _loadPlaces)
        else if (_places!.isEmpty)
          InlineMessage(
            tone: Tone.warning,
            text: context.tr('لا توجد معالم مسجلة في دلّني حالياً.', 'There are no landmarks on Delni yet.'),
          )
        else
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _places!
                .map((p) => _toggleChip(
                      p.category.isEmpty ? p.name : '${p.name} • ${p.category}',
                      _placeIds.contains(p.id),
                      () => setState(() => _placeIds.contains(p.id) ? _placeIds.remove(p.id) : _placeIds.add(p.id)),
                    ))
                .toList(),
          ),
        const SizedBox(height: Gap.xl),
        Text(context.tr('أيام العمل', 'Working days'), style: AppText.label),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (var i = 0; i < _dayCodes.length; i++)
              _toggleChip(names[i], _days.contains(_dayCodes[i]),
                  () => setState(() => _days.contains(_dayCodes[i]) ? _days.remove(_dayCodes[i]) : _days.add(_dayCodes[i]))),
          ],
        ),
        const SizedBox(height: Gap.lg),
        InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: () => setState(() => _agree = !_agree),
          child: Row(
            children: [
              Checkbox(value: _agree, onChanged: (v) => setState(() => _agree = v ?? false)),
              Expanded(
                child: Text(
                  context.tr('أقر بصحة بيانات الترخيص وأوافق على شروط العمل في دلّني', 'I confirm my licence details and accept the Delni work terms'),
                  style: AppText.bodyMuted.copyWith(fontSize: 12.5),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _toggleChip(String label, bool selected, VoidCallback onTap) {
    return FilterChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      showCheckmark: true,
      checkmarkColor: Colors.white,
      selectedColor: AppColors.primary,
      labelStyle: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w700, color: selected ? Colors.white : AppColors.navy),
      side: BorderSide(color: selected ? AppColors.primary : AppColors.border),
    );
  }
}

class _StepIndicator extends StatelessWidget {
  final int step;
  final List<String> titles;
  const _StepIndicator({required this.step, required this.titles});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            for (var i = 0; i < titles.length; i++) ...[
              Expanded(
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 6,
                  decoration: BoxDecoration(
                    color: i <= step ? AppColors.primary : AppColors.muted,
                    borderRadius: BorderRadius.circular(10),
                  ),
                ),
              ),
              if (i < titles.length - 1) const SizedBox(width: 6),
            ],
          ],
        ),
        const SizedBox(height: 10),
        Text(
          context.tr('الخطوة ${step + 1} من ${titles.length}', 'Step ${step + 1} of ${titles.length}'),
          style: AppText.caption,
        ),
        Text(titles[step], style: AppText.h3.copyWith(fontSize: 16)),
      ],
    );
  }
}
