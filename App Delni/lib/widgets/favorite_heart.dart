import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/app_state.dart';
import '../core/i18n.dart';
import '../models.dart';
import 'common.dart';

const favoriteRed = Color(0xFFE11D48);

/// Heart that saves an item to the tourist's favourites. Only tourists see it: guides and drivers get
/// nothing (the server refuses them anyway). A visitor without an account sees it and is asked to sign in.
/// [type] is the server's item_type (daily_trip, weekly_trip, hotel, restaurant, landmark, vehicle).
class FavoriteHeart extends StatefulWidget {
  final String type;
  final String itemId;
  final double size;
  /// Name and picture for the favourites screen, so a new heart shows there at once.
  final FavoriteItem? display;
  /// Plain icon (on a dark app bar) instead of the white round button used on photos.
  final bool flat;

  const FavoriteHeart({super.key, required this.type, required this.itemId, this.size = 36, this.display, this.flat = false});

  /// item_type of a trip (Trip.type is 'daily' or 'weekly').
  static String tripType(Trip t) => t.isWeekly ? 'weekly_trip' : 'daily_trip';

  @override
  State<FavoriteHeart> createState() => _FavoriteHeartState();
}

class _FavoriteHeartState extends State<FavoriteHeart> with SingleTickerProviderStateMixin {
  late final AnimationController _pop = AnimationController(vsync: this, duration: const Duration(milliseconds: 420));

  @override
  void dispose() {
    _pop.dispose();
    super.dispose();
  }

  Future<void> _tap(AppState state, bool saved) async {
    final session = state.session;
    if (session == null || session.isGuest) {
      showAppSnack(context, context.tr('سجّل دخولك كسائح لحفظ ما يعجبك في المفضلة ❤️', 'Sign in as a tourist to save favourites ❤️'),
          tone: Tone.warning);
      return;
    }
    HapticFeedback.lightImpact();
    if (!saved) _pop.forward(from: 0);
    final added = context.tr('أُضيف إلى مفضلتك ❤️', 'Added to your favourites ❤️');
    final removed = context.tr('أُزيل من مفضلتك', 'Removed from your favourites');
    final error = await state.favorites.toggle(widget.type, widget.itemId, display: widget.display);
    if (!mounted) return;
    if (error != null) {
      showAppSnack(context, error, tone: Tone.danger);
    } else {
      showAppSnack(context, saved ? removed : added, tone: saved ? Tone.neutral : Tone.success);
    }
  }

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final session = state.session;
    // Hearts are for tourists only (signed in, or visiting before signing up)
    if (session != null && session.role != 'tourist') return const SizedBox.shrink();
    return ListenableBuilder(
      listenable: state.favorites,
      builder: (context, _) {
        final saved = state.favorites.isSaved(widget.type, widget.itemId);
        final icon = AnimatedBuilder(
          animation: _pop,
          builder: (_, child) {
            // quick swell and settle when added
            final t = _pop.value;
            final scale = t == 0 ? 1.0 : 1 + 0.45 * Curves.easeOut.transform((t < 0.4 ? t / 0.4 : (1 - t) / 0.6).clamp(0.0, 1.0));
            return Transform.scale(scale: scale, child: child);
          },
          child: AnimatedSwitcher(
            duration: const Duration(milliseconds: 220),
            transitionBuilder: (c, a) => ScaleTransition(scale: a, child: c),
            child: Icon(
              saved ? Icons.favorite_rounded : Icons.favorite_border_rounded,
              key: ValueKey(saved),
              size: widget.size * 0.56,
              color: saved ? favoriteRed : (widget.flat ? Colors.white : const Color(0xFF334155)),
            ),
          ),
        );
        return Semantics(
          button: true,
          toggled: saved,
          label: saved ? context.tr('إزالة من المفضلة', 'Remove from favourites') : context.tr('إضافة إلى المفضلة', 'Add to favourites'),
          child: GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: () => _tap(state, saved),
            child: widget.flat
                ? SizedBox(width: widget.size + 8, height: widget.size + 8, child: Center(child: icon))
                : AnimatedContainer(
                    duration: const Duration(milliseconds: 220),
                    width: widget.size,
                    height: widget.size,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: saved ? const Color(0xFFFFF1F2) : Colors.white.withValues(alpha: 0.92),
                      boxShadow: const [BoxShadow(color: Color(0x330F172A), blurRadius: 10, offset: Offset(0, 3))],
                    ),
                    child: Center(child: icon),
                  ),
          ),
        );
      },
    );
  }
}
