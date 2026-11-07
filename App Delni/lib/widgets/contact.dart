import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:url_launcher/url_launcher.dart';
import '../core/i18n.dart';
import '../core/theme.dart';
import 'common.dart';

/// Opens the phone dialer with [phone]. When the device has no dialer the number is copied instead.
Future<void> callPhone(BuildContext context, String phone) async {
  final number = normalizeDigits(phone).replaceAll(RegExp(r'[^\d+]'), '');
  if (number.isEmpty) return;
  var opened = false;
  try {
    opened = await launchUrl(Uri(scheme: 'tel', path: number));
  } catch (_) {}
  if (!opened && context.mounted) {
    await Clipboard.setData(ClipboardData(text: number));
    if (context.mounted) {
      showAppSnack(context, context.tr('تعذر فتح الاتصال، تم نسخ الرقم: $number', 'Could not open the dialer, number copied: $number'), tone: Tone.warning);
    }
  }
}

/// Opens a link (Google Maps, a website) in its app or the browser.
Future<void> openLink(BuildContext context, String url) async {
  final uri = Uri.tryParse(url.trim());
  var opened = false;
  if (uri != null) {
    try {
      opened = await launchUrl(uri, mode: LaunchMode.externalApplication);
    } catch (_) {}
  }
  if (!opened && context.mounted) {
    await Clipboard.setData(ClipboardData(text: url));
    if (context.mounted) {
      showAppSnack(context, context.tr('تعذر فتح الرابط، تم نسخه', 'Could not open the link, it was copied'), tone: Tone.warning);
    }
  }
}

/// Round green call button: tap to call (long-press copies the number).
class CallButton extends StatelessWidget {
  final String phone;
  final double size;

  const CallButton({super.key, required this.phone, this.size = 44});

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: context.tr('اتصال بـ $phone', 'Call $phone'),
      child: Material(
        color: AppColors.accent,
        shape: const CircleBorder(),
        elevation: 0,
        child: InkWell(
          customBorder: const CircleBorder(),
          onTap: () => callPhone(context, phone),
          onLongPress: () {
            Clipboard.setData(ClipboardData(text: phone));
            showAppSnack(context, context.tr('تم نسخ الرقم: $phone', 'Number copied: $phone'), tone: Tone.success);
          },
          child: SizedBox(
            width: size,
            height: size,
            child: Icon(Icons.call_rounded, color: Colors.white, size: size * 0.48),
          ),
        ),
      ),
    );
  }
}

/// Two large actions under a place's title: call it, and open it on the map.
class ContactActions extends StatelessWidget {
  final String phone;
  final String mapsUrl;

  const ContactActions({super.key, required this.phone, required this.mapsUrl});

  @override
  Widget build(BuildContext context) {
    if (phone.isEmpty && mapsUrl.isEmpty) return const SizedBox.shrink();
    return Row(
      children: [
        if (phone.isNotEmpty)
          Expanded(
            child: AppButton(
              label: context.tr('اتصال', 'Call'),
              icon: Icons.call_rounded,
              variant: ButtonVariant.success,
              height: 50,
              onPressed: () => callPhone(context, phone),
            ),
          ),
        if (phone.isNotEmpty && mapsUrl.isNotEmpty) const SizedBox(width: 10),
        if (mapsUrl.isNotEmpty)
          Expanded(
            child: AppButton(
              label: context.tr('الخريطة', 'Map'),
              icon: Icons.map_rounded,
              variant: ButtonVariant.ghost,
              height: 50,
              onPressed: () => openLink(context, mapsUrl),
            ),
          ),
      ],
    );
  }
}
