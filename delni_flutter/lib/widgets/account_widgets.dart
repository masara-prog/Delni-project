import 'package:flutter/material.dart';
import '../core/app_state.dart';
import '../core/i18n.dart';
import '../core/theme.dart';
import '../screens/shared/notifications_screen.dart';
import 'common.dart';

/// Bell with the unread count; opens the notifications screen.
class NotificationBell extends StatelessWidget {
  final bool light;
  const NotificationBell({super.key, this.light = false});

  @override
  Widget build(BuildContext context) {
    final state = AppScope.of(context);
    final count = state.unreadNotifications;
    return IconButton(
      tooltip: context.tr('الإشعارات', 'Notifications'),
      style: IconButton.styleFrom(
        backgroundColor: light ? Colors.white.withValues(alpha: 0.16) : Colors.white,
        side: light ? null : const BorderSide(color: AppColors.border),
      ),
      onPressed: () => Navigator.of(context).push(MaterialPageRoute(builder: (_) => const NotificationsScreen())),
      icon: Badge(
        isLabelVisible: count > 0,
        backgroundColor: AppColors.brandOrange,
        label: Text(count > 99 ? '99+' : '$count', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800)),
        child: Icon(Icons.notifications_none_rounded, color: light ? Colors.white : AppColors.navy),
      ),
    );
  }
}

/// One big, coloured shortcut (account screens).
class QuickAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final int badge;

  const QuickAction({required this.icon, required this.label, required this.color, required this.onTap, this.badge = 0});
}

/// A row of large shortcut tiles: solid colour, white icon, short label.
class QuickActions extends StatelessWidget {
  final List<QuickAction> actions;
  const QuickActions({super.key, required this.actions});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        for (var i = 0; i < actions.length; i++) ...[
          if (i > 0) const SizedBox(width: 10),
          Expanded(child: _QuickTile(action: actions[i])),
        ],
      ],
    );
  }
}

class _QuickTile extends StatefulWidget {
  final QuickAction action;
  const _QuickTile({required this.action});

  @override
  State<_QuickTile> createState() => _QuickTileState();
}

class _QuickTileState extends State<_QuickTile> {
  bool _down = false;

  @override
  Widget build(BuildContext context) {
    final a = widget.action;
    return Semantics(
      button: true,
      label: a.label,
      child: GestureDetector(
        onTapDown: (_) => setState(() => _down = true),
        onTapCancel: () => setState(() => _down = false),
        onTapUp: (_) => setState(() => _down = false),
        onTap: a.onTap,
        child: AnimatedScale(
          scale: _down ? 0.95 : 1,
          duration: const Duration(milliseconds: 120),
          child: Container(
            height: 96,
            decoration: BoxDecoration(
              color: a.color,
              borderRadius: BorderRadius.circular(AppRadius.lg),
              boxShadow: [BoxShadow(color: a.color.withValues(alpha: 0.28), blurRadius: 16, offset: const Offset(0, 8), spreadRadius: -6)],
            ),
            child: Stack(
              children: [
                PositionedDirectional(
                  end: -14,
                  bottom: -14,
                  child: Icon(a.icon, size: 72, color: Colors.white.withValues(alpha: 0.12)),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 36,
                            height: 36,
                            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(12)),
                            child: Icon(a.icon, color: Colors.white, size: 20),
                          ),
                          const Spacer(),
                          if (a.badge > 0)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
                              child: Text('${a.badge}', style: TextStyle(color: a.color, fontSize: 11, fontWeight: FontWeight.w900)),
                            ),
                        ],
                      ),
                      Text(a.label,
                          maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 13.5, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// A group of menu rows inside one rounded card.
class MenuGroup extends StatelessWidget {
  final String? title;
  final List<Widget> children;

  const MenuGroup({super.key, this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null)
          Padding(
            padding: const EdgeInsetsDirectional.only(start: 6, bottom: 8),
            child: Text(title!, style: AppText.caption.copyWith(fontWeight: FontWeight.w800, letterSpacing: 0.2)),
          ),
        Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(AppRadius.lg),
            border: Border.all(color: AppColors.border),
            boxShadow: AppShadows.card,
          ),
          child: Column(
            children: [
              for (var i = 0; i < children.length; i++) ...[
                children[i],
                if (i < children.length - 1) const Divider(indent: 64),
              ],
            ],
          ),
        ),
      ],
    );
  }
}

class MenuTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;
  final Tone tone;
  final Widget? trailing;
  final bool danger;

  const MenuTile({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.onTap,
    this.tone = Tone.primary,
    this.trailing,
    this.danger = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(AppRadius.lg),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        child: Row(
          children: [
            IconBubble(icon: icon, tone: danger ? Tone.danger : tone, size: 38),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppText.label.copyWith(fontSize: 14, color: danger ? AppColors.destructive : AppColors.navy)),
                  if (subtitle != null) Text(subtitle!, style: AppText.caption.copyWith(fontSize: 11.5)),
                ],
              ),
            ),
            trailing ??
                (onTap == null
                    ? const SizedBox.shrink()
                    : Icon(context.isAr ? Icons.chevron_left_rounded : Icons.chevron_right_rounded, color: AppColors.mutedText)),
          ],
        ),
      ),
    );
  }
}

/// Language row with an AR / EN segmented switch.
class LanguageTile extends StatelessWidget {
  const LanguageTile({super.key});

  @override
  Widget build(BuildContext context) {
    final locale = context.appLocale;
    return MenuTile(
      icon: Icons.translate_rounded,
      title: context.tr('لغة التطبيق', 'App language'),
      subtitle: context.tr('العربية أو الإنجليزية', 'Arabic or English'),
      tone: Tone.neutral,
      trailing: SegmentedButton<bool>(
        showSelectedIcon: false,
        style: SegmentedButton.styleFrom(
          visualDensity: VisualDensity.compact,
          selectedBackgroundColor: AppColors.primary,
          selectedForegroundColor: Colors.white,
          side: const BorderSide(color: AppColors.border),
          textStyle: const TextStyle(fontFamily: AppTheme.fontFamily, fontWeight: FontWeight.w800, fontSize: 12),
        ),
        segments: const [
          ButtonSegment(value: true, label: Text('ع')),
          ButtonSegment(value: false, label: Text('EN')),
        ],
        selected: {locale.isArabic},
        onSelectionChanged: (s) => locale.set(s.first ? AppLocale.arabic : AppLocale.english),
      ),
    );
  }
}

/// Sign-out row with confirmation.
class SignOutTile extends StatelessWidget {
  const SignOutTile({super.key});

  @override
  Widget build(BuildContext context) {
    return MenuTile(
      icon: Icons.logout_rounded,
      title: context.tr('تسجيل الخروج', 'Sign out'),
      subtitle: context.tr('العودة لاختيار نوع الحساب', 'Back to choosing an account type'),
      danger: true,
      onTap: () async {
        final ok = await confirmDialog(
          context,
          title: context.tr('تسجيل الخروج', 'Sign out'),
          message: context.tr('هل تريد تسجيل الخروج من حسابك على هذا الجهاز؟', 'Sign out of your account on this device?'),
          confirmLabel: context.tr('خروج', 'Sign out'),
          danger: true,
          icon: Icons.logout_rounded,
        );
        if (ok && context.mounted) await AppScope.read(context).signOut();
      },
    );
  }
}

/// Gradient header at the top of the account pages.
class ProfileHeader extends StatelessWidget {
  final String name;
  final String subtitle;
  final String roleLabel;
  final IconData roleIcon;
  final Widget? avatar;

  const ProfileHeader({
    super.key,
    required this.name,
    required this.subtitle,
    required this.roleLabel,
    required this.roleIcon,
    this.avatar,
  });

  @override
  Widget build(BuildContext context) {
    final initials = name.trim().isEmpty ? '?' : name.trim().split(RegExp(r'\s+')).take(2).map((w) => w.characters.first).join();
    // A real Libya photograph under the brand blue, so the card carries a place, not only a gradient
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        image: const DecorationImage(image: AssetImage('assets/images/libya-ghadames-palms.jpg'), fit: BoxFit.cover),
        boxShadow: AppShadows.soft,
      ),
      child: Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(AppRadius.xl),
        gradient: LinearGradient(
          begin: AlignmentDirectional.centerStart,
          end: AlignmentDirectional.centerEnd,
          colors: [AppColors.primary.withValues(alpha: 0.95), AppColors.navy.withValues(alpha: 0.6)],
        ),
      ),
      child: Row(
        children: [
          avatar ??
              Container(
                width: 62,
                height: 62,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.16),
                  border: Border.all(color: Colors.white38, width: 2),
                ),
                child: Text(initials, style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w900)),
              ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, maxLines: 1, overflow: TextOverflow.ellipsis, style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w800)),
                if (subtitle.isNotEmpty)
                  Text(subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textDirection: TextDirection.ltr,
                      style: const TextStyle(color: Colors.white70, fontSize: 12.5, fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.16), borderRadius: BorderRadius.circular(30)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(roleIcon, size: 14, color: const Color(0xFFFDE2B8)),
                      const SizedBox(width: 5),
                      Text(roleLabel, style: const TextStyle(color: Colors.white, fontSize: 11.5, fontWeight: FontWeight.w800)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      ),
    );
  }
}
