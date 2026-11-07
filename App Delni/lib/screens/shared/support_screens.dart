import 'package:flutter/material.dart';
import '../../api_service.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/common.dart';
import '../../widgets/states.dart';
import '../auth/auth_widgets.dart';
import '../auth/login_screen.dart';

/// Message to the platform administration (reports, complaints, questions).
/// Sent with POST /notifications, which the server always addresses to the admin; replies arrive as notifications.
class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  int _topic = 0;
  final _message = TextEditingController();
  final _contact = TextEditingController();
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _message.dispose();
    _contact.dispose();
    super.dispose();
  }

  List<(IconData, String, Tone)> _topics(BuildContext c) => [
        (Icons.help_outline_rounded, c.tr('استفسار', 'Question'), Tone.primary),
        (Icons.report_gmailerrorred_rounded, c.tr('بلاغ طارئ', 'Urgent report'), Tone.danger),
        (Icons.sentiment_dissatisfied_outlined, c.tr('شكوى', 'Complaint'), Tone.warning),
        (Icons.lightbulb_outline_rounded, c.tr('اقتراح', 'Suggestion'), Tone.success),
      ];

  Future<void> _send() async {
    final text = _message.text.trim();
    if (text.length < 10) {
      setState(() => _error = context.tr('يرجى كتابة تفاصيل الرسالة (10 أحرف فأكثر)', 'Please describe your message (10+ characters)'));
      return;
    }
    FocusScope.of(context).unfocus();
    setState(() {
      _loading = true;
      _error = null;
    });
    final res = await ApiService.sendSupportMessage(
      subject: _topics(context)[_topic].$2,
      message: text,
      contact: _contact.text,
    );
    if (!mounted) return;
    setState(() => _loading = false);
    if (res.success) {
      _message.clear();
      showAppSnack(
        context,
        context.tr('تم إرسال رسالتك إلى إدارة دلّني، وسيصلك الرد في الإشعارات', 'Your message was sent. The reply will arrive in your notifications'),
        tone: Tone.success,
      );
      Navigator.of(context).pop();
    } else {
      setState(() => _error = res.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isGuest = ApiService.currentSession?.isGuest ?? true;
    final topics = _topics(context);
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('الدعم والبلاغات', 'Support & reports'))),
      body: ListView(
        padding: const EdgeInsets.all(Gap.page),
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(gradient: AppGradients.sea, borderRadius: BorderRadius.circular(AppRadius.lg)),
            child: Row(
              children: [
                const Icon(Icons.support_agent_rounded, color: Colors.white, size: 36),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    context.tr('فريق إدارة دلني يتابع رسائلك ويرد عليها عبر الإشعارات.', 'The Delni team reads your messages and replies through notifications.'),
                    style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.w700, height: 1.55),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: Gap.xl),
          Text(context.tr('نوع الرسالة', 'Message type'), style: AppText.label),
          const SizedBox(height: 10),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 2.6,
            children: [
              for (var i = 0; i < topics.length; i++)
                _TopicTile(
                  icon: topics[i].$1,
                  label: topics[i].$2,
                  tone: topics[i].$3,
                  selected: _topic == i,
                  onTap: () => setState(() => _topic = i),
                ),
            ],
          ),
          const SizedBox(height: Gap.xl),
          AppTextField(
            label: context.tr('تفاصيل الرسالة', 'Details'),
            controller: _message,
            maxLines: 5,
            hint: context.tr('اكتب ما تريد إبلاغ الإدارة به...', 'Write what you want the team to know...'),
          ),
          if (isGuest) ...[
            const SizedBox(height: Gap.lg),
            AppTextField(
              label: context.tr('رقم هاتف أو بريد للتواصل', 'Phone or email to reach you'),
              controller: _contact,
              icon: Icons.contact_phone_outlined,
              ltr: true,
              helper: context.tr('بدون حساب، لن تصلك الردود كإشعارات', 'Without an account, replies cannot reach you as notifications'),
            ),
          ],
          const SizedBox(height: Gap.lg),
          if (_error != null) ...[InlineMessage(text: _error!), const SizedBox(height: Gap.lg)],
          AppButton(label: context.tr('إرسال', 'Send'), icon: Icons.send_rounded, loading: _loading, onPressed: _send),
        ],
      ),
    );
  }
}

class _TopicTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final Tone tone;
  final bool selected;
  final VoidCallback onTap;

  const _TopicTile({required this.icon, required this.label, required this.tone, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final (bg, fg) = toneColors(tone);
    return Material(
      color: selected ? bg : Colors.white,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(horizontal: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: selected ? fg : AppColors.border, width: selected ? 1.6 : 1),
          ),
          child: Row(
            children: [
              Icon(icon, color: fg, size: 20),
              const SizedBox(width: 8),
              Expanded(child: Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: selected ? fg : AppColors.navy))),
            ],
          ),
        ),
      ),
    );
  }
}

/// Messages with the trip team: the platform has no chat service yet.
class MessagesScreen extends StatelessWidget {
  const MessagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(context.tr('الرسائل', 'Messages'))),
      body: ComingSoonView(
        icon: Icons.forum_outlined,
        title: context.tr('المحادثات المباشرة', 'Live conversations'),
        message: context.tr(
          'نعمل على إتاحة المحادثة المباشرة مع إدارة الرحلات والمرشدين. حتى ذلك الحين يمكنك مراسلة الإدارة وسيصلك الرد في الإشعارات.',
          'Live chat with the trips team and guides is on its way. Meanwhile, message the team and the reply will arrive in your notifications.',
        ),
        extra: AppButton(
          label: context.tr('مراسلة الإدارة', 'Message the team'),
          icon: Icons.support_agent_rounded,
          variant: ButtonVariant.ghost,
          onPressed: () => Navigator.of(context).pushReplacement(MaterialPageRoute(builder: (_) => const SupportScreen())),
        ),
      ),
    );
  }
}

/// Asks a visitor to sign in with a tourist account (booking, private trips, tickets).
Future<void> promptTouristLogin(BuildContext context, {String? reason}) {
  return showAppSheet<void>(
    context,
    builder: (ctx) => Padding(
      padding: const EdgeInsets.fromLTRB(Gap.page, 0, Gap.page, Gap.xl),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const IconBubble(icon: Icons.lock_person_outlined, size: 64),
          const SizedBox(height: Gap.lg),
          Text(ctx.tr('سجّل الدخول للمتابعة', 'Sign in to continue'), style: AppText.h2),
          const SizedBox(height: 6),
          Text(
            reason ?? ctx.tr('هذه الخدمة متاحة للسياح المسجلين في دلّني.', 'This service is available to registered Delni tourists.'),
            textAlign: TextAlign.center,
            style: AppText.bodyMuted,
          ),
          const SizedBox(height: Gap.xl),
          AppButton(
            label: ctx.tr('تسجيل الدخول / إنشاء حساب', 'Sign in / Create account'),
            icon: Icons.login_rounded,
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.of(context).push(MaterialPageRoute(builder: (_) => const LoginScreen(role: AuthRole.tourist)));
            },
          ),
          const SizedBox(height: 8),
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text(ctx.tr('ليس الآن', 'Not now'))),
        ],
      ),
    ),
  );
}
