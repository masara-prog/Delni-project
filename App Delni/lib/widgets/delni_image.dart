import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../api_service.dart';
import '../core/theme.dart';

/// Where an image path from the API is read from.
/// - '/assets/x.jpg' (the web platform's bundled photos) -> the same file in assets/images
/// - 'data:image/...;base64,' -> decoded in memory (decoded once and cached)
/// - '/uploads/...' -> the Laravel server first, then the web platform on the same host: Laravel stores uploads in
///   the website's public/uploads folder (Base64Image::store), which the website serves (port 8080 in development)
class MediaSource {
  static const webPort = 8080;
  static final Map<String, MemoryImage> _memory = {};

  static List<ImageProvider> providers(String? path) {
    final p = (path ?? '').trim();
    if (p.isEmpty) return const [];
    if (p.startsWith('data:image')) {
      final cached = _memory[p];
      if (cached != null) return [cached];
      final bytes = _decode(p);
      if (bytes == null) return const [];
      if (_memory.length > 40) _memory.remove(_memory.keys.first);
      return [_memory[p] = MemoryImage(bytes)];
    }
    if (p.startsWith('http://') || p.startsWith('https://')) return [NetworkImage(p)];
    if (p.startsWith('/assets/') || p.startsWith('assets/')) {
      return [AssetImage('assets/images/${p.split('/').last}')];
    }
    final rel = p.startsWith('/') ? p : '/$p';
    final api = Uri.parse(ApiService.serverOrigin);
    final web = api.replace(port: webPort, path: '').toString().replaceAll(RegExp(r'/$'), '');
    return [NetworkImage('${ApiService.serverOrigin}$rel'), if (web != ApiService.serverOrigin) NetworkImage('$web$rel')];
  }

  static Uint8List? _decode(String dataUrl) {
    try {
      return base64Decode(dataUrl.substring(dataUrl.indexOf(',') + 1));
    } catch (_) {
      return null;
    }
  }
}

/// Tries each source in turn, then shows [fallback].
class _ChainedImage extends StatelessWidget {
  final List<ImageProvider> sources;
  final int index;
  final BoxFit fit;
  final double? width;
  final double? height;
  final Widget fallback;
  final bool fade;

  const _ChainedImage({
    required this.sources,
    required this.fallback,
    this.index = 0,
    this.fit = BoxFit.cover,
    this.width,
    this.height,
    this.fade = true,
  });

  @override
  Widget build(BuildContext context) {
    if (index >= sources.length) return fallback;
    return Image(
      image: sources[index],
      width: width,
      height: height,
      fit: fit,
      gaplessPlayback: true,
      frameBuilder: !fade
          ? null
          : (context, child, frame, sync) {
              if (sync) return child;
              // The switcher's default layout gives the picture loose constraints, so it shrank to its own
              // size and left a gap in the frame: its stack must fill the frame like the picture itself.
              return AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                layoutBuilder: (current, previous) => Stack(
                  fit: StackFit.expand,
                  children: [...previous, if (current != null) current],
                ),
                child: frame == null ? const _Placeholder() : child,
              );
            },
      errorBuilder: (_, __, ___) => _ChainedImage(
        sources: sources,
        index: index + 1,
        fit: fit,
        width: width,
        height: height,
        fallback: fallback,
        fade: fade,
      ),
    );
  }
}

/// An image from the API with a soft placeholder while loading and a branded fallback when missing.
class DelniImage extends StatelessWidget {
  final String? path;
  final double? width;
  final double? height;
  final BoxFit fit;
  final BorderRadius? borderRadius;
  final IconData fallbackIcon;

  const DelniImage(
    this.path, {
    super.key,
    this.width,
    this.height,
    this.fit = BoxFit.cover,
    this.borderRadius,
    this.fallbackIcon = Icons.landscape_rounded,
  });

  @override
  Widget build(BuildContext context) {
    Widget child = _ChainedImage(
      sources: MediaSource.providers(path),
      width: width,
      height: height,
      fit: fit,
      fallback: _Fallback(icon: fallbackIcon),
    );
    child = SizedBox(width: width, height: height, child: child);
    return borderRadius == null ? child : ClipRRect(borderRadius: borderRadius!, child: child);
  }
}

class _Placeholder extends StatelessWidget {
  const _Placeholder();

  @override
  Widget build(BuildContext context) => const DecoratedBox(
        decoration: BoxDecoration(color: AppColors.muted),
        child: SizedBox.expand(),
      );
}

class _Fallback extends StatelessWidget {
  final IconData icon;
  const _Fallback({required this.icon});

  @override
  Widget build(BuildContext context) => DecoratedBox(
        decoration: const BoxDecoration(gradient: AppGradients.sand),
        child: SizedBox.expand(
          child: Center(child: Icon(icon, color: AppColors.primary.withValues(alpha: 0.35), size: 34)),
        ),
      );
}

/// Round avatar from an API image path, with initials when there is no photo.
class DelniAvatar extends StatelessWidget {
  final String? path;
  final String name;
  final double size;
  final Color? ring;

  const DelniAvatar({super.key, this.path, required this.name, this.size = 48, this.ring});

  @override
  Widget build(BuildContext context) {
    final sources = MediaSource.providers(path);
    final initials = name.trim().isEmpty
        ? '?'
        : name.trim().split(RegExp(r'\s+')).take(2).map((w) => w.characters.first).join();
    return Container(
      width: size,
      height: size,
      padding: ring == null ? null : const EdgeInsets.all(2),
      decoration: BoxDecoration(shape: BoxShape.circle, color: ring),
      child: ClipOval(
        child: _ChainedImage(sources: sources, fade: false, fallback: _Initials(initials: initials, size: size)),
      ),
    );
  }
}

class _Initials extends StatelessWidget {
  final String initials;
  final double size;
  const _Initials({required this.initials, required this.size});

  @override
  Widget build(BuildContext context) => Container(
        decoration: const BoxDecoration(gradient: AppGradients.sun),
        alignment: Alignment.center,
        child: Text(
          initials,
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800, fontSize: size * 0.34, height: 1),
        ),
      );
}
