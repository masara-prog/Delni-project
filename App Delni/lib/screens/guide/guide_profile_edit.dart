import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import '../../api_service.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../models.dart';
import '../../widgets/common.dart';
import '../../widgets/delni_image.dart';
import '../../widgets/states.dart';

/// Weekday codes stored for a guide (guide_working_days), Saturday first as on Delni.
const guideDayCodes = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

/// A working day's name ("wed" → "الأربعاء"); a day already written in Arabic stays as it is.
String weekdayName(BuildContext context, String code) {
  const ar = {'sat': 'السبت', 'sun': 'الأحد', 'mon': 'الاثنين', 'tue': 'الثلاثاء', 'wed': 'الأربعاء', 'thu': 'الخميس', 'fri': 'الجمعة'};
  const en = {'sat': 'Saturday', 'sun': 'Sunday', 'mon': 'Monday', 'tue': 'Tuesday', 'wed': 'Wednesday', 'thu': 'Thursday', 'fri': 'Friday'};
  final key = code.trim().toLowerCase();
  return (context.isAr ? ar[key] : en[key]) ?? context.sv(code);
}

/// The guide's own profile, with the platform's rules: the licence number, the email and (once verified) the name
/// are locked; the phone is a Libyan mobile; experience is 2–40 years; at least one landmark; a changed licence
/// expiry date must be in the future.
class GuideProfileEditScreen extends StatefulWidget {
  final Guide guide;
  final String licenseExpiry;
  final String email;

  const GuideProfileEditScreen({super.key, required this.guide, required this.licenseExpiry, required this.email});

  @override
  State<GuideProfileEditScreen> createState() => _GuideProfileEditScreenState();
}

class _GuideProfileEditScreenState extends State<GuideProfileEditScreen> {
  late final _name = TextEditingController(text: widget.guide.name);
  late final _phone = TextEditingController(text: widget.guide.phone);
  late final _experience = TextEditingController(text: widget.guide.experienceYears > 0 ? '${widget.guide.experienceYears}' : '');
  late final _price = TextEditingController(text: widget.guide.pricePerDay > 0 ? widget.guide.pricePerDay.toStringAsFixed(0) : '');
  late final _bio = TextEditingController(text: widget.guide.bio);
  late bool _english = widget.guide.speaksEnglish;
  late bool _french = widget.guide.speaksFrench;
  late bool _italian = widget.guide.speaksItalian;
  late final Set<String> _days = widget.guide.workingDays.map((d) => d.toLowerCase()).toSet();
  late final Set<String> _placeIds = widget.guide.placeIds.toSet();
  late DateTime? _expiry = DateTime.tryParse(widget.licenseExpiry);

  // A new profile photo, sent with the other fields when saved (the platform shows the same photo)
  Uint8List? _avatarBytes;
  String? _avatarDataUrl;

  List<Place>? _places;
  bool _placesFailed = false;
  bool _saving = false;
  String? _error;

  bool get _verified => widget.guide.isVerified;

  @override
  void initState() {
    super.initState();
    _loadPlaces();
  }

  @override
  void dispose() {
    for (final c in [_name, _phone, _experience, _price, _bio]) {
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

  Future<void> _pickExpiry() async {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    final picked = await showDatePicker(
      context: context,
      initialDate: _expiry != null && _expiry!.isAfter(tomorrow) ? _expiry! : tomorrow,
      firstDate: DateTime(tomorrow.year, tomorrow.month, tomorrow.day),
      lastDate: DateTime.now().add(const Duration(days: 365 * 10)),
      helpText: context.tr('تاريخ انتهاء الترخيص', 'Licence expiry date'),
    );
    if (picked != null) setState(() => _expiry = picked);
  }

  String? _validate() {
    if (!_verified && _name.text.trim().length < 3) return context.tr('يرجى إدخال الاسم الكامل', 'Please enter your full name');
    if (!isValidPhone(_phone.text.trim())) {
      return context.tr('رقم الهاتف يجب أن يبدأ بـ 09 ويتكون من 10 أرقام (مثال: 0912345678)', 'The phone must start with 09 and have 10 digits');
    }
    final years = int.tryParse(_experience.text.trim()) ?? 0;
    if (years < 2 || years > 40) return context.tr('سنوات الخبرة يجب أن تكون بين سنتين و40 سنة', 'Experience must be between 2 and 40 years');
    if (_placeIds.isEmpty) return context.tr('يرجى اختيار معلم سياحي واحد على الأقل من أماكن العمل', 'Please choose at least one landmark you work at');
    if (_days.isEmpty) return context.tr('يرجى تحديد أيام العمل المتاحة', 'Please choose your working days');
    final oldExpiry = widget.licenseExpiry.length >= 10 ? widget.licenseExpiry.substring(0, 10) : widget.licenseExpiry;
    if (_expiry != null && isoDate(_expiry!) != oldExpiry && !_expiry!.isAfter(DateTime.now())) {
      return context.tr('تاريخ انتهاء الترخيص يجب أن يكون تاريخاً قادماً', 'The licence expiry date must be in the future');
    }
    return null;
  }

  Future<void> _save() async {
    final error = _validate();
    if (error != null) {
      setState(() => _error = error);
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _saving = true;
      _error = null;
    });
    final res = await ApiService.updateGuideProfile({
      if (!_verified) 'full_name': _name.text.trim(),
      'phone_number': _phone.text.trim(),
      'years_of_experience': int.parse(_experience.text.trim()),
      'price_per_day': double.tryParse(_price.text.trim()) ?? 0,
      'bio': _bio.text.trim(),
      'speaks_english': _english,
      'speaks_french': _french,
      'speaks_italian': _italian,
      'working_days': guideDayCodes.where(_days.contains).toList(),
      'place_ids': _placeIds.toList(),
      if (_expiry != null) 'license_expiry_date': isoDate(_expiry!),
      if (_avatarDataUrl != null) 'avatar': _avatarDataUrl,
    });
    if (!mounted) return;
    setState(() => _saving = false);
    if (res.success) {
      showAppSnack(context, context.tr('تم حفظ التعديلات وتحديث ملفك بنجاح', 'Your profile was saved'), tone: Tone.success);
      Navigator.of(context).pop(true);
    } else {
      setState(() => _error = res.message);
    }
  }

  Future<void> _pickAvatar() async {
    try {
      // Shrunk before upload like the sign-up form (at most 800 px)
      final picked = await ImagePicker().pickImage(source: ImageSource.gallery, maxWidth: 800, maxHeight: 800, imageQuality: 80);
      if (picked == null) return;
      final bytes = await picked.readAsBytes();
      setState(() {
        _avatarBytes = bytes;
        _avatarDataUrl = 'data:image/jpeg;base64,${base64Encode(bytes)}';
        _error = null;
      });
    } catch (_) {
      if (mounted) setState(() => _error = context.tr('تعذر فتح الصور: يرجى التحقق من أذونات الهاتف', 'Could not open photos: check app permissions'));
    }
  }

  Widget _avatar(BuildContext context) => Center(
        child: Column(
          children: [
            Semantics(
              button: true,
              label: context.tr('تغيير الصورة الشخصية', 'Change profile photo'),
              child: InkWell(
                onTap: _pickAvatar,
                customBorder: const CircleBorder(),
                child: Stack(
                  children: [
                    Container(
                      width: 104,
                      height: 104,
                      decoration: BoxDecoration(shape: BoxShape.circle, color: AppColors.muted, border: Border.all(color: Colors.white, width: 4), boxShadow: AppShadows.card),
                      clipBehavior: Clip.antiAlias,
                      child: _avatarBytes != null
                          ? Image.memory(_avatarBytes!, fit: BoxFit.cover)
                          : DelniImage(widget.guide.avatar.isEmpty ? null : widget.guide.avatar, fallbackIcon: Icons.person_rounded),
                    ),
                    PositionedDirectional(
                      bottom: 2,
                      end: 2,
                      child: Container(
                        padding: const EdgeInsets.all(7),
                        decoration: BoxDecoration(color: AppColors.primary, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 2)),
                        child: const Icon(Icons.photo_camera_rounded, size: 16, color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 8),
            Text(
              _avatarBytes != null ? context.tr('اضغط «حفظ التعديلات» لاعتماد الصورة', 'Tap “Save changes” to keep this photo') : context.tr('اضغط لتغيير الصورة الشخصية', 'Tap to change your profile photo'),
              style: AppText.caption,
            ),
          ],
        ),
      );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('تعديل ملفي', 'Edit my profile'))),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(Gap.page, Gap.sm, Gap.page, Gap.xxl),
        children: [
          _avatar(context),
          const SizedBox(height: Gap.lg),
          _section(context, Icons.lock_outline_rounded, context.tr('الهوية والترخيص', 'Identity & licence'),
              context.tr('بيانات معتمدة لا تتغير إلا عن طريق الإدارة', 'Verified details change only through the team')),
          AppTextField(
            label: context.tr('الاسم الكامل', 'Full name'),
            controller: _name,
            icon: Icons.person_outline_rounded,
            readOnly: _verified,
            suffix: _verified ? const _LockMark() : null,
          ),
          const SizedBox(height: Gap.md),
          AppTextField(
            label: context.tr('رقم ترخيص مزاولة الإرشاد', 'Guide licence number'),
            controller: TextEditingController(text: widget.guide.licenseNumber),
            icon: Icons.badge_outlined,
            readOnly: true,
            ltr: true,
            suffix: const _LockMark(),
          ),
          const SizedBox(height: Gap.md),
          AppTextField(
            label: context.tr('البريد الإلكتروني', 'Email'),
            controller: TextEditingController(text: widget.email),
            icon: Icons.alternate_email_rounded,
            readOnly: true,
            ltr: true,
            suffix: const _LockMark(),
          ),
          const SizedBox(height: Gap.md),
          AppTextField(
            label: context.tr('تاريخ انتهاء الترخيص', 'Licence expiry date'),
            controller: TextEditingController(text: _expiry == null ? '' : context.date(isoDate(_expiry!))),
            icon: Icons.event_rounded,
            hint: context.tr('اختر التاريخ', 'Choose a date'),
            readOnly: true,
            onTap: _pickExpiry,
          ),
          _section(context, Icons.work_outline_rounded, context.tr('التواصل والعمل', 'Contact & work'), null),
          AppTextField(
            label: context.tr('رقم الهاتف المحمول', 'Mobile phone'),
            controller: _phone,
            icon: Icons.phone_outlined,
            hint: '0912345678',
            keyboardType: TextInputType.phone,
            inputFormatters: const [DigitsInputFormatter(phoneLength)],
            ltr: true,
          ),
          const SizedBox(height: Gap.md),
          Row(
            children: [
              Expanded(
                child: AppTextField(
                  label: context.tr('سنوات الخبرة', 'Experience (years)'),
                  controller: _experience,
                  icon: Icons.workspace_premium_outlined,
                  hint: '2 - 40',
                  keyboardType: TextInputType.number,
                  inputFormatters: const [DigitsInputFormatter(2)],
                  ltr: true,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AppTextField(
                  label: context.tr('الأجر اليومي (د.ل)', 'Daily rate (LYD)'),
                  controller: _price,
                  icon: Icons.payments_outlined,
                  keyboardType: TextInputType.number,
                  inputFormatters: const [DigitsInputFormatter(5)],
                  ltr: true,
                ),
              ),
            ],
          ),
          const SizedBox(height: Gap.md),
          AppTextField(
            label: context.tr('نبذة تعريفية', 'Short bio'),
            controller: _bio,
            maxLines: 3,
            optional: true,
            hint: context.tr('خبرتك والمعالم التي تتقن شرحها...', 'Your experience and the sites you know best...'),
          ),
          _section(context, Icons.translate_rounded, context.tr('اللغات (إضافة إلى العربية)', 'Languages (besides Arabic)'), null),
          Wrap(spacing: 8, runSpacing: 8, children: [
            _chip(context.tr('الإنجليزية', 'English'), _english, () => setState(() => _english = !_english)),
            _chip(context.tr('الفرنسية', 'French'), _french, () => setState(() => _french = !_french)),
            _chip(context.tr('الإيطالية', 'Italian'), _italian, () => setState(() => _italian = !_italian)),
          ]),
          _section(context, Icons.event_repeat_rounded, context.tr('أيام العمل', 'Working days'), null),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final d in guideDayCodes)
                _chip(weekdayName(context, d), _days.contains(d), () => setState(() => _days.contains(d) ? _days.remove(d) : _days.add(d))),
            ],
          ),
          _section(
            context,
            Icons.account_balance_outlined,
            context.tr('أماكن العمل', 'Work places'),
            context.tr('${_placeIds.length} معالم مختارة من معالم دلّني', '${_placeIds.length} Delni landmarks chosen'),
          ),
          if (_places == null && !_placesFailed)
            const Wrap(spacing: 8, runSpacing: 8, children: [
              SkeletonBox(width: 90, height: 36, radius: 30),
              SkeletonBox(width: 120, height: 36, radius: 30),
              SkeletonBox(width: 100, height: 36, radius: 30),
            ])
          else if (_placesFailed)
            ErrorState(compact: true, onRetry: _loadPlaces)
          else
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: _places!
                  .map((p) => _chip(p.name, _placeIds.contains(p.id),
                      () => setState(() => _placeIds.contains(p.id) ? _placeIds.remove(p.id) : _placeIds.add(p.id))))
                  .toList(),
            ),
          if (_error != null) ...[
            const SizedBox(height: Gap.lg),
            InlineMessage(text: _error!, tone: Tone.danger),
          ],
          const SizedBox(height: Gap.xl),
          AppButton(label: context.tr('حفظ التعديلات', 'Save changes'), icon: Icons.check_rounded, loading: _saving, onPressed: _saving ? null : _save),
        ],
      ),
    );
  }

  Widget _section(BuildContext context, IconData icon, String title, String? subtitle) => Padding(
        padding: const EdgeInsets.only(top: Gap.xl, bottom: Gap.md),
        child: Row(
          children: [
            IconBubble(icon: icon, tone: Tone.primary, size: 34),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppText.h3),
                  if (subtitle != null) Text(subtitle, style: AppText.caption.copyWith(fontSize: 11.5)),
                ],
              ),
            ),
          ],
        ),
      );

  Widget _chip(String label, bool selected, VoidCallback onTap) => FilterChip(
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

class _LockMark extends StatelessWidget {
  const _LockMark();

  @override
  Widget build(BuildContext context) => const Padding(
        padding: EdgeInsets.symmetric(horizontal: 12),
        child: Icon(Icons.lock_rounded, size: 18, color: AppColors.mutedText),
      );
}
