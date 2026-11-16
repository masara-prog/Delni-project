import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

import '../../api_service.dart';
import '../../core/format.dart';
import '../../core/i18n.dart';
import '../../core/theme.dart';
import '../../widgets/common.dart';

/// Shown on sign-in when the admin rejected the guide's application (as on the platform): the guide sends a new
/// licence document and expiry date, with an optional note, and the application goes back to review.
/// POST /auth/guide/resubmit (saved in tour_guides; the note reaches the admin in a notification).
class GuideResubmitBox extends StatefulWidget {
  final String email;
  final String password;
  final VoidCallback onClose;
  final void Function(String message) onSent;

  const GuideResubmitBox({super.key, required this.email, required this.password, required this.onClose, required this.onSent});

  @override
  State<GuideResubmitBox> createState() => _GuideResubmitBoxState();
}

class _GuideResubmitBoxState extends State<GuideResubmitBox> {
  String? _fileName;
  String? _fileDataUrl;
  DateTime? _expiry;
  final _note = TextEditingController();
  bool _sending = false;
  String? _error;

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  static String _mimeFor(String name) {
    final ext = name.split('.').last.toLowerCase();
    return switch (ext) {
      'pdf' => 'application/pdf',
      'png' => 'image/png',
      'jpg' || 'jpeg' => 'image/jpeg',
      _ => 'application/octet-stream',
    };
  }

  void _setFile(String name, Uint8List bytes) {
    setState(() {
      _fileName = name;
      _fileDataUrl = 'data:${_mimeFor(name)};base64,${base64Encode(bytes)}';
      _error = null;
    });
  }

  Future<void> _pickFile() async {
    try {
      final result = await FilePicker.pickFiles(type: FileType.custom, allowedExtensions: ['pdf', 'png', 'jpg', 'jpeg'], withData: true);
      if (result == null || result.files.isEmpty) return;
      final file = result.files.first;
      Uint8List? bytes = file.bytes;
      if (bytes == null && file.path != null) {
        final f = File(file.path!);
        if (await f.exists()) bytes = await f.readAsBytes();
      }
      if (bytes != null) _setFile(file.name, bytes);
    } catch (_) {
      // The file picker can be restricted on some phones: a photo from the gallery instead
      try {
        final picked = await ImagePicker().pickImage(source: ImageSource.gallery, maxWidth: 1600, maxHeight: 1600, imageQuality: 80);
        if (picked == null) return;
        _setFile(picked.name, await picked.readAsBytes());
      } catch (_) {
        if (mounted) setState(() => _error = context.tr('تعذر إرفاق الملف: يرجى التحقق من أذونات التخزين', 'Could not attach the file: check storage permissions'));
      }
    }
  }

  Future<void> _pickExpiry() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _expiry ?? now.add(const Duration(days: 365)),
      firstDate: now.add(const Duration(days: 1)),
      lastDate: DateTime(now.year + 15),
      helpText: context.tr('تاريخ انتهاء الترخيص', 'Licence expiry date'),
    );
    if (picked != null) setState(() => _expiry = picked);
  }

  Future<void> _send() async {
    if (_fileDataUrl == null) {
      setState(() => _error = context.tr('يرجى إرفاق وثيقة الترخيص الجديدة.', 'Please attach the new licence document.'));
      return;
    }
    if (_expiry == null) {
      setState(() => _error = context.tr('يرجى اختيار تاريخ انتهاء الترخيص.', 'Please choose the licence expiry date.'));
      return;
    }
    setState(() {
      _sending = true;
      _error = null;
    });
    final res = await ApiService.resubmitGuide(
      login: widget.email,
      password: widget.password,
      certificate: _fileDataUrl!,
      licenseExpiryDate: isoDate(_expiry!),
      note: _note.text.trim(),
    );
    if (!mounted) return;
    setState(() => _sending = false);
    if (res.success) {
      widget.onSent(res.message);
    } else {
      setState(() => _error = res.message);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(14, 10, 14, 14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFFBEB),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFFDE68A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(context.tr('إعادة تقديم طلب الاعتماد', 'Resubmit your application'),
                    style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w800, color: Color(0xFF78350F))),
              ),
              // The guide may not want to send a new document now
              IconButton(
                tooltip: context.tr('إغلاق', 'Close'),
                visualDensity: VisualDensity.compact,
                onPressed: widget.onClose,
                icon: const Icon(Icons.close_rounded, color: Color(0xFF92400E)),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(context.tr('وثيقة الترخيص الجديدة (صورة أو PDF)', 'New licence document (photo or PDF)'), style: AppText.label),
          const SizedBox(height: 6),
          InkWell(
            borderRadius: BorderRadius.circular(14),
            onTap: _pickFile,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFFFCD34D), width: 1.5),
              ),
              child: Row(
                children: [
                  Container(
                    width: 42,
                    height: 42,
                    decoration: BoxDecoration(color: AppColors.primary, borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.upload_file_rounded, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(_fileName == null ? context.tr('اضغط لرفع الوثيقة', 'Tap to upload the document') : context.tr('تغيير الوثيقة', 'Change the document'),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.primary)),
                        Text(_fileName == null ? context.tr('صورة (JPG / PNG) أو ملف PDF', 'Photo (JPG / PNG) or PDF') : '✓ $_fileName',
                            maxLines: 1, overflow: TextOverflow.ellipsis, style: AppText.caption),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          AppTextField(
            label: context.tr('تاريخ انتهاء الترخيص', 'Licence expiry date'),
            controller: TextEditingController(text: _expiry == null ? '' : context.date(isoDate(_expiry!))),
            icon: Icons.event_rounded,
            hint: context.tr('اختر التاريخ', 'Choose a date'),
            readOnly: true,
            onTap: _pickExpiry,
          ),
          const SizedBox(height: 12),
          AppTextField(
            label: context.tr('ملاحظة للإدارة', 'Note for the team'),
            controller: _note,
            maxLines: 3,
            optional: true,
            hint: context.tr('ما الذي صححته في الوثيقة؟', 'What did you correct?'),
          ),
          if (_error != null) ...[
            const SizedBox(height: 10),
            InlineMessage(tone: Tone.danger, text: _error!),
          ],
          const SizedBox(height: 12),
          AppButton(
            label: context.tr('إرسال الطلب للمراجعة من جديد', 'Send for review again'),
            loading: _sending,
            onPressed: _sending ? null : _send,
          ),
        ],
      ),
    );
  }
}
