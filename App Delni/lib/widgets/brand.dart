import 'dart:ui' show ImageFilter;
import 'package:flutter/material.dart';
import '../core/i18n.dart';
import '../core/theme.dart';

/// The Delni mark with the brand name and tagline, as in the platform header (components/Logo.tsx).
class DelniLogo extends StatelessWidget {
  final double markSize;
  final bool light;
  final bool showText;
  final bool showTagline;
  final bool vertical;

  const DelniLogo({
    super.key,
    this.markSize = 44,
    this.light = false,
    this.showText = true,
    this.showTagline = true,
    this.vertical = false,
  });

  @override
  Widget build(BuildContext context) {
    final mark = DelniMark(size: markSize, framed: light);
    if (!showText) return mark;
    final nameSize = markSize * (vertical ? 0.62 : 0.5);
    final text = Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: vertical ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      children: [
        Text(
          'دَلِّــنِي',
          style: TextStyle(
            fontFamily: AppTheme.fontFamily,
            fontSize: nameSize,
            fontWeight: FontWeight.w900,
            height: 1.15,
            color: light ? Colors.white : AppColors.navy,
          ),
        ),
        if (showTagline)
          Text(
            context.tr('دليلُك لاكتشاف ليبيا', 'Your guide to discover Libya'),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: (nameSize * 0.42).clamp(10, 16).toDouble(),
              fontWeight: FontWeight.w700,
              height: 1.3,
              color: light ? const Color(0xFFFDE2B8) : AppColors.brandOrange,
            ),
          ),
      ],
    );
    return vertical
        ? Column(mainAxisSize: MainAxisSize.min, children: [mark, const SizedBox(height: 14), text])
        : Row(mainAxisSize: MainAxisSize.min, children: [mark, const SizedBox(width: 10), Flexible(child: text)]);
  }
}

class DelniMark extends StatelessWidget {
  final double size;

  /// On dark or photo backgrounds: no tile behind the mark (transparent), only a soft shadow so it stays readable.
  final bool framed;

  const DelniMark({super.key, this.size = 44, this.framed = false});

  @override
  Widget build(BuildContext context) {
    final image = Image.asset('assets/images/logo_mark.png', width: size, height: size, fit: BoxFit.contain);
    if (!framed) return image;
    return SizedBox(
      width: size,
      height: size,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned.fill(
            top: size * 0.04,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: size * 0.08, sigmaY: size * 0.08),
              child: ColorFiltered(
                colorFilter: ColorFilter.mode(Colors.black.withValues(alpha: 0.45), BlendMode.srcIn),
                child: Image.asset('assets/images/logo_mark.png', fit: BoxFit.contain),
              ),
            ),
          ),
          image,
        ],
      ),
    );
  }
}
