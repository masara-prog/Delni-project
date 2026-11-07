import 'package:flutter/material.dart';
import '../core/i18n.dart';
import '../core/theme.dart';
import 'common.dart';

/// Pulsing grey block used to sketch content while it loads.
class SkeletonBox extends StatefulWidget {
  final double? width;
  final double height;
  final double radius;

  const SkeletonBox({super.key, this.width, required this.height, this.radius = 12});

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox> with SingleTickerProviderStateMixin {
  late final AnimationController _c = AnimationController(vsync: this, duration: const Duration(milliseconds: 900))
    ..repeat(reverse: true);

  @override
  void dispose() {
    _c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: Tween(begin: 0.45, end: 1.0).animate(_c),
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(color: AppColors.muted, borderRadius: BorderRadius.circular(widget.radius)),
      ),
    );
  }
}

/// Card-shaped skeletons for lists.
class SkeletonList extends StatelessWidget {
  final int count;
  final double imageHeight;
  final EdgeInsetsGeometry padding;
  final bool shrinkWrap;

  const SkeletonList({
    super.key,
    this.count = 3,
    this.imageHeight = 150,
    this.padding = const EdgeInsets.all(Gap.page),
    this.shrinkWrap = false,
  });

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: padding,
      shrinkWrap: shrinkWrap,
      physics: shrinkWrap ? const NeverScrollableScrollPhysics() : null,
      itemCount: count,
      separatorBuilder: (_, __) => const SizedBox(height: Gap.lg),
      itemBuilder: (_, __) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(AppRadius.lg),
          border: Border.all(color: AppColors.border),
        ),
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SkeletonBox(height: imageHeight, radius: 14),
            const SizedBox(height: 12),
            const SkeletonBox(width: 180, height: 16),
            const SizedBox(height: 8),
            const SkeletonBox(width: 120, height: 12),
          ],
        ),
      ),
    );
  }
}

class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final String? actionLabel;
  final VoidCallback? onAction;
  final bool compact;

  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    this.actionLabel,
    this.onAction,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: 32, vertical: compact ? 24 : 48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: compact ? 72 : 96,
              height: compact ? 72 : 96,
              decoration: const BoxDecoration(shape: BoxShape.circle, gradient: AppGradients.sand),
              child: Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: compact ? 52 : 68,
                    height: compact ? 52 : 68,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: Colors.white, boxShadow: AppShadows.soft),
                  ),
                  Icon(icon, size: compact ? 26 : 32, color: AppColors.primary),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Text(title, textAlign: TextAlign.center, style: AppText.h3.copyWith(fontSize: 16)),
            const SizedBox(height: 6),
            Text(message, textAlign: TextAlign.center, style: AppText.bodyMuted),
            if (actionLabel != null) ...[
              const SizedBox(height: 18),
              AppButton(label: actionLabel!, onPressed: onAction, expand: false, height: 46, variant: ButtonVariant.ghost),
            ],
          ],
        ),
      ),
    );
  }
}

/// Could not load: offline server or an error answer, with a retry button.
class ErrorState extends StatelessWidget {
  final String? message;
  final VoidCallback onRetry;
  final bool compact;

  const ErrorState({super.key, this.message, required this.onRetry, this.compact = false});

  @override
  Widget build(BuildContext context) {
    return EmptyState(
      icon: Icons.cloud_off_rounded,
      compact: compact,
      title: context.tr('تعذر تحميل البيانات', 'Could not load data'),
      message: message ??
          context.tr('لم نتمكن من الوصول إلى خادم دلّني. تحقق من اتصالك بالشبكة ثم أعد المحاولة.',
              'We could not reach the Delni server. Check your connection and try again.'),
      actionLabel: context.tr('إعادة المحاولة', 'Try again'),
      onAction: onRetry,
    );
  }
}

/// Thin banner shown when the server could not be reached.
class OfflineBanner extends StatelessWidget {
  final VoidCallback onRetry;
  final bool busy;

  const OfflineBanner({super.key, required this.onRetry, this.busy = false});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: const Color(0xFFFFF7E6),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: Gap.page, vertical: 8),
        child: Row(
          children: [
            const Icon(Icons.wifi_off_rounded, size: 18, color: Color(0xFFB45309)),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                context.tr('غير متصل بخادم دلّني — يتم عرض ما أمكن تحميله', 'Not connected to the Delni server'),
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: Color(0xFF92400E)),
              ),
            ),
            busy
                ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Color(0xFFB45309)))
                : InkWell(
                    onTap: onRetry,
                    borderRadius: BorderRadius.circular(20),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      child: Text(
                        context.tr('إعادة الاتصال', 'Reconnect'),
                        style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w800, color: Color(0xFFB45309)),
                      ),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}

/// "Coming soon" screen for features the platform does not offer yet (no fake behaviour).
class ComingSoonView extends StatelessWidget {
  final IconData icon;
  final String title;
  final String message;
  final Widget? extra;

  const ComingSoonView({super.key, required this.icon, required this.title, required this.message, this.extra});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(Gap.page),
      children: [
        const SizedBox(height: 24),
        Center(
          child: Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(shape: BoxShape.circle, gradient: AppGradients.sun, boxShadow: AppShadows.soft),
            child: Icon(icon, size: 52, color: Colors.white),
          ),
        ),
        const SizedBox(height: 20),
        Center(child: StatusBadge(label: context.tr('قريباً', 'Coming soon'), tone: Tone.orange, icon: Icons.schedule_rounded)),
        const SizedBox(height: 12),
        Text(title, textAlign: TextAlign.center, style: AppText.h1),
        const SizedBox(height: 8),
        Text(message, textAlign: TextAlign.center, style: AppText.bodyMuted),
        if (extra != null) ...[const SizedBox(height: 24), extra!],
      ],
    );
  }
}
