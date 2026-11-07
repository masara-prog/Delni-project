import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/i18n.dart';
import '../core/theme.dart';

// ---------------------------------------------------------------------------
// Buttons
// ---------------------------------------------------------------------------

enum ButtonVariant { primary, secondary, outline, danger, ghost, success }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool loading;
  final bool expand;
  final ButtonVariant variant;
  final double height;

  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.icon,
    this.loading = false,
    this.expand = true,
    this.variant = ButtonVariant.primary,
    this.height = 52,
  });

  @override
  Widget build(BuildContext context) {
    final (Color bg, Color fg, BorderSide? side) = switch (variant) {
      ButtonVariant.primary => (AppColors.primary, Colors.white, null),
      ButtonVariant.secondary => (AppColors.navy, Colors.white, null),
      ButtonVariant.success => (AppColors.accent, Colors.white, null),
      ButtonVariant.danger => (AppColors.destructiveSoft, AppColors.destructive, null),
      ButtonVariant.outline => (Colors.white, AppColors.primary, const BorderSide(color: AppColors.border, width: 1.4)),
      ButtonVariant.ghost => (AppColors.primarySoft, AppColors.primary, null),
    };
    final child = loading
        ? SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2.4, color: fg))
        : Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[Icon(icon, size: 19), const SizedBox(width: 8)],
              Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
            ],
          );
    final button = ElevatedButton(
      onPressed: loading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: bg,
        foregroundColor: fg,
        disabledBackgroundColor: loading ? bg : bg.withValues(alpha: 0.45),
        disabledForegroundColor: fg.withValues(alpha: 0.8),
        minimumSize: Size(expand ? double.infinity : 0, height),
        padding: const EdgeInsets.symmetric(horizontal: 18),
        side: side,
        shadowColor: Colors.transparent,
      ),
      child: child,
    );
    return variant == ButtonVariant.primary && onPressed != null && !loading
        ? DecoratedBox(
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), boxShadow: AppShadows.soft),
            child: button,
          )
        : button;
  }
}

// ---------------------------------------------------------------------------
// Form fields
// ---------------------------------------------------------------------------

/// Text field with its label above it, as in the platform forms.
class AppTextField extends StatefulWidget {
  final String label;
  final TextEditingController? controller;
  final String? hint;
  final IconData? icon;
  final bool password;
  final TextInputType? keyboardType;
  final int maxLines;
  final bool readOnly;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final String? helper;
  final String? errorText;
  final bool ltr;
  final List<TextInputFormatter>? inputFormatters;
  final TextInputAction? textInputAction;
  final Widget? suffix;
  final bool optional;
  final Iterable<String>? autofillHints;

  const AppTextField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.icon,
    this.password = false,
    this.keyboardType,
    this.maxLines = 1,
    this.readOnly = false,
    this.onTap,
    this.onChanged,
    this.onSubmitted,
    this.helper,
    this.errorText,
    this.ltr = false,
    this.inputFormatters,
    this.textInputAction,
    this.suffix,
    this.optional = false,
    this.autofillHints,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  bool _obscure = true;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(widget.label, style: AppText.label),
            if (widget.optional) ...[
              const SizedBox(width: 6),
              Text(context.tr('(اختياري)', '(optional)'), style: AppText.caption.copyWith(fontSize: 11)),
            ],
          ],
        ),
        const SizedBox(height: 8),
        TextField(
          controller: widget.controller,
          obscureText: widget.password && _obscure,
          keyboardType: widget.keyboardType,
          maxLines: widget.password ? 1 : widget.maxLines,
          readOnly: widget.readOnly,
          onTap: widget.onTap,
          onChanged: widget.onChanged,
          onSubmitted: widget.onSubmitted,
          inputFormatters: widget.inputFormatters,
          textInputAction: widget.textInputAction,
          autofillHints: widget.autofillHints,
          textDirection: widget.ltr ? TextDirection.ltr : null,
          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.navy),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintTextDirection: widget.ltr && context.isAr ? TextDirection.rtl : null,
            prefixIcon: widget.icon == null ? null : Icon(widget.icon, size: 20),
            errorText: widget.errorText,
            helperText: widget.helper,
            helperMaxLines: 3,
            helperStyle: AppText.caption.copyWith(fontSize: 11.5, fontWeight: FontWeight.w500),
            suffixIcon: widget.password
                ? IconButton(
                    tooltip: _obscure ? context.tr('إظهار', 'Show') : context.tr('إخفاء', 'Hide'),
                    icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  )
                : widget.suffix,
          ),
        ),
      ],
    );
  }
}

/// Converts Arabic-Indic digits to Latin and trims (phones, passports, numbers).
String normalizeDigits(String input) {
  const arabic = '٠١٢٣٤٥٦٧٨٩';
  var out = input;
  for (var i = 0; i < arabic.length; i++) {
    out = out.replaceAll(arabic[i], '$i');
  }
  return out.trim();
}

bool isValidEmail(String email) => RegExp(r'^[\w\-.+]+@([\w-]+\.)+[\w-]{2,}$').hasMatch(email.trim());

// --- Field rules, the same as the platform's forms (auth.signup.tsx) ---

/// Libyan mobile number: 09 followed by 8 digits.
bool isValidPhone(String phone) => RegExp(r'^09\d{8}$').hasMatch(normalizeDigits(phone));

/// Passport or national ID: 6 to 10 letters or digits.
bool isValidIdNumber(String value) => RegExp(r'^[A-Z0-9]{6,10}$').hasMatch(normalizeDigits(value).toUpperCase());

const int minPasswordLength = 8;
const int phoneLength = 10;
const int idMaxLength = 10;

/// Digits only (Arabic-Indic digits become Latin), at most [maxLength]: the field stops accepting input at the limit.
class DigitsInputFormatter extends TextInputFormatter {
  final int maxLength;
  const DigitsInputFormatter(this.maxLength);

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    var text = normalizeDigits(newValue.text).replaceAll(RegExp(r'[^0-9]'), '');
    if (text.length > maxLength) text = text.substring(0, maxLength);
    return TextEditingValue(text: text, selection: TextSelection.collapsed(offset: text.length));
  }
}

/// Letters and digits in upper case, at most [maxLength] (passport / national ID, licence numbers).
class IdInputFormatter extends TextInputFormatter {
  final int maxLength;
  final bool allowDash;
  const IdInputFormatter(this.maxLength, {this.allowDash = false});

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    var text = normalizeDigits(newValue.text).toUpperCase().replaceAll(RegExp(allowDash ? r'[^A-Z0-9-]' : r'[^A-Z0-9]'), '');
    if (text.length > maxLength) text = text.substring(0, maxLength);
    return TextEditingValue(text: text, selection: TextSelection.collapsed(offset: text.length));
  }
}

// ---------------------------------------------------------------------------
// Layout pieces
// ---------------------------------------------------------------------------

class AppCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final VoidCallback? onTap;
  final Color color;
  final bool bordered;

  const AppCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(Gap.lg),
    this.onTap,
    this.color = Colors.white,
    this.bordered = true,
  });

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppRadius.lg);
    return Container(
      decoration: BoxDecoration(
        color: color,
        borderRadius: radius,
        border: bordered ? Border.all(color: AppColors.border) : null,
        boxShadow: AppShadows.card,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: radius,
        child: InkWell(
          borderRadius: radius,
          onTap: onTap,
          child: Padding(padding: padding, child: child),
        ),
      ),
    );
  }
}

class SectionHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final String? actionLabel;
  final VoidCallback? onAction;

  const SectionHeader({super.key, required this.title, this.subtitle, this.actionLabel, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.end,
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppText.h2),
              if (subtitle != null) Text(subtitle!, style: AppText.caption),
            ],
          ),
        ),
        if (actionLabel != null)
          TextButton(
            onPressed: onAction,
            style: TextButton.styleFrom(padding: const EdgeInsets.symmetric(horizontal: 8), minimumSize: const Size(0, 36)),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(actionLabel!),
                const SizedBox(width: 2),
                Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, size: 18),
              ],
            ),
          ),
      ],
    );
  }
}

enum Tone { primary, success, warning, danger, neutral, orange }

(Color, Color) toneColors(Tone tone) => switch (tone) {
      Tone.primary => (AppColors.primarySoft, AppColors.primary),
      Tone.success => (AppColors.accentSoft, const Color(0xFF047857)),
      Tone.warning => (AppColors.goldSoft, const Color(0xFFB45309)),
      Tone.danger => (AppColors.destructiveSoft, const Color(0xFFB91C1C)),
      Tone.neutral => (AppColors.muted, AppColors.mutedText),
      Tone.orange => (AppColors.orangeSoft, AppColors.brandOrange),
    };

class StatusBadge extends StatelessWidget {
  final String label;
  final Tone tone;
  final IconData? icon;
  final bool dense;

  const StatusBadge({super.key, required this.label, this.tone = Tone.primary, this.icon, this.dense = false});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(tone);
    return Container(
      padding: EdgeInsets.symmetric(horizontal: dense ? 8 : 10, vertical: dense ? 3 : 5),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(30)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: dense ? 12 : 14, color: fg), const SizedBox(width: 4)],
          Flexible(
            child: Text(
              label,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: dense ? 10.5 : 11.5, fontWeight: FontWeight.w800, color: fg, height: 1.3),
            ),
          ),
        ],
      ),
    );
  }
}

/// Badge on top of photos (white glass).
class PhotoBadge extends StatelessWidget {
  final String label;
  final IconData? icon;
  final Color iconColor;

  const PhotoBadge({super.key, required this.label, this.icon, this.iconColor = AppColors.gold});

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.94), borderRadius: BorderRadius.circular(30)),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[Icon(icon, size: 14, color: iconColor), const SizedBox(width: 3)],
            Text(label, style: const TextStyle(fontSize: 11.5, fontWeight: FontWeight.w800, color: AppColors.navy, height: 1.2)),
          ],
        ),
      );
}

class MetaItem extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color color;

  const MetaItem({super.key, required this.icon, required this.text, this.color = AppColors.mutedText});

  @override
  Widget build(BuildContext context) => Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: color),
          const SizedBox(width: 4),
          Flexible(
            child: Text(text,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: color, height: 1.3)),
          ),
        ],
      );
}

/// Stars + count, shown only when the item has real reviews.
class RatingLine extends StatelessWidget {
  final double rating;
  final int count;
  const RatingLine({super.key, required this.rating, required this.count});

  @override
  Widget build(BuildContext context) {
    if (count <= 0) {
      return Text(context.tr('لا توجد تقييمات بعد', 'No reviews yet'), style: AppText.caption.copyWith(fontSize: 11.5));
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        const Icon(Icons.star_rounded, size: 16, color: AppColors.gold),
        const SizedBox(width: 2),
        Text(rating.toStringAsFixed(1), style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.w800)),
        const SizedBox(width: 4),
        Text(context.tr('($count تقييم)', '($count reviews)'), style: AppText.caption.copyWith(fontSize: 11.5)),
      ],
    );
  }
}

class IconBubble extends StatelessWidget {
  final IconData icon;
  final Tone tone;
  final double size;

  const IconBubble({super.key, required this.icon, this.tone = Tone.primary, this.size = 42});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(tone);
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(size * 0.32)),
      child: Icon(icon, color: fg, size: size * 0.5),
    );
  }
}

class InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Widget? trailing;
  final bool ltrValue;

  const InfoRow({super.key, required this.icon, required this.label, required this.value, this.trailing, this.ltrValue = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: [
          IconBubble(icon: icon, size: 36),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppText.caption.copyWith(fontSize: 11.5)),
                Text(value,
                    textDirection: ltrValue ? TextDirection.ltr : null,
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: AppColors.navy, height: 1.45)),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

/// A coloured message box (form errors, notes, success).
class InlineMessage extends StatelessWidget {
  final String text;
  final Tone tone;
  final IconData? icon;

  const InlineMessage({super.key, required this.text, this.tone = Tone.danger, this.icon});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(tone);
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: fg.withValues(alpha: 0.18)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon ??
                switch (tone) {
                  Tone.danger => Icons.error_outline_rounded,
                  Tone.success => Icons.check_circle_outline_rounded,
                  Tone.warning => Icons.info_outline_rounded,
                  _ => Icons.info_outline_rounded,
                },
            color: fg,
            size: 19,
          ),
          const SizedBox(width: 8),
          Expanded(child: Text(text, style: TextStyle(fontSize: 12.5, fontWeight: FontWeight.w600, color: fg, height: 1.55))),
        ],
      ),
    );
  }
}

/// Horizontal list of selectable chips (filters).
class ChoiceChipsRow<T> extends StatelessWidget {
  final List<(T, String)> options;
  final T selected;
  final ValueChanged<T> onSelected;
  final EdgeInsetsGeometry padding;

  const ChoiceChipsRow({
    super.key,
    required this.options,
    required this.selected,
    required this.onSelected,
    this.padding = const EdgeInsets.symmetric(horizontal: Gap.page),
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 40,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: padding,
        itemCount: options.length,
        separatorBuilder: (_, __) => const SizedBox(width: 8),
        itemBuilder: (_, i) {
          final (value, label) = options[i];
          final isSelected = value == selected;
          return ChoiceChip(
            label: Text(label),
            selected: isSelected,
            onSelected: (_) => onSelected(value),
            labelStyle: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w700,
              color: isSelected ? Colors.white : AppColors.navy,
            ),
            side: BorderSide(color: isSelected ? AppColors.primary : AppColors.border),
          );
        },
      ),
    );
  }
}

/// Small stat tile (number + label).
class StatTile extends StatelessWidget {
  final String value;
  final String label;
  final IconData icon;
  final Tone tone;

  const StatTile({super.key, required this.value, required this.label, required this.icon, this.tone = Tone.primary});

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          IconBubble(icon: icon, tone: tone, size: 34),
          const SizedBox(height: 10),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppColors.navy, height: 1.1)),
          const SizedBox(height: 2),
          Text(label, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption.copyWith(fontSize: 11.5)),
        ],
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Feedback: snack bars, dialogs, sheets
// ---------------------------------------------------------------------------

void showAppSnack(BuildContext context, String message, {Tone tone = Tone.neutral}) {
  final (Color bg, IconData icon) = switch (tone) {
    Tone.success => (const Color(0xFF047857), Icons.check_circle_rounded),
    Tone.danger => (const Color(0xFFB91C1C), Icons.error_rounded),
    Tone.warning => (const Color(0xFFB45309), Icons.info_rounded),
    _ => (AppColors.navy, Icons.info_rounded),
  };
  ScaffoldMessenger.of(context)
    ..hideCurrentSnackBar()
    ..showSnackBar(SnackBar(
      backgroundColor: bg,
      duration: Duration(milliseconds: message.length > 70 ? 5000 : 3200),
      content: Row(
        children: [
          Icon(icon, color: Colors.white, size: 20),
          const SizedBox(width: 10),
          Expanded(child: Text(message)),
        ],
      ),
    ));
}

Future<bool> confirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  bool danger = false,
  IconData icon = Icons.help_outline_rounded,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      icon: IconBubble(icon: icon, tone: danger ? Tone.danger : Tone.primary, size: 52),
      title: Text(title, textAlign: TextAlign.center),
      content: Text(message, textAlign: TextAlign.center),
      actionsPadding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
      actions: [
        Row(
          children: [
            Expanded(
              child: AppButton(
                label: ctx.tr('تراجع', 'Cancel'),
                variant: ButtonVariant.outline,
                height: 46,
                onPressed: () => Navigator.pop(ctx, false),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: AppButton(
                label: confirmLabel,
                variant: danger ? ButtonVariant.danger : ButtonVariant.primary,
                height: 46,
                onPressed: () => Navigator.pop(ctx, true),
              ),
            ),
          ],
        ),
      ],
    ),
  );
  return result ?? false;
}

/// Bottom sheet with the app's look; [builder] gets the sheet context.
Future<T?> showAppSheet<T>(BuildContext context, {required WidgetBuilder builder, bool expand = false}) {
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (ctx) {
      final content = Padding(
        padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom),
        child: builder(ctx),
      );
      return expand ? FractionallySizedBox(heightFactor: 0.92, child: content) : content;
    },
  );
}

/// Title block at the top of a bottom sheet.
class SheetHeader extends StatelessWidget {
  final String title;
  final String? subtitle;
  final IconData? icon;
  final Tone tone;

  const SheetHeader({super.key, required this.title, this.subtitle, this.icon, this.tone = Tone.primary});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        if (icon != null) ...[IconBubble(icon: icon!, tone: tone, size: 44), const SizedBox(width: 12)],
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: AppText.h2),
              if (subtitle != null) Text(subtitle!, style: AppText.bodyMuted.copyWith(fontSize: 12.5, height: 1.5)),
            ],
          ),
        ),
      ],
    );
  }
}
