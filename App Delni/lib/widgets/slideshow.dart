import 'dart:async';
import 'package:flutter/material.dart';
import 'delni_image.dart';

/// Libya photos bundled with the app, used when a trip has no pictures of its own.
const libyaSlides = [
  'assets/images/libya-sabratha-turquoise-sea.jpg',
  'assets/images/libya-ghadames-palms.jpg',
  'assets/images/libya-leptis-aerial-green.jpg',
  'assets/images/libya-acacus-rocks.jpg',
  'assets/images/libya-ubari-palm-lake.jpg',
  'assets/images/libya-nalut-red-sky.jpg',
];

/// Photos that cross-fade one after another with a slow zoom (the platform's landmark slideshow).
/// Server paths and bundled assets both work; with one photo it stays still, with none it shows [libyaSlides].
class PhotoSlideshow extends StatefulWidget {
  final List<String> photos;
  final Duration interval;
  final bool showDots;

  const PhotoSlideshow({super.key, required this.photos, this.interval = const Duration(seconds: 4), this.showDots = true});

  @override
  State<PhotoSlideshow> createState() => _PhotoSlideshowState();
}

class _PhotoSlideshowState extends State<PhotoSlideshow> {
  int _index = 0;
  Timer? _timer;

  List<String> get _photos {
    final own = widget.photos.where((p) => p.trim().isNotEmpty).toSet().toList();
    return own.isEmpty ? libyaSlides : own;
  }

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(widget.interval, (_) {
      // The phone's "reduce motion" setting keeps the picture still
      if (!mounted || MediaQuery.disableAnimationsOf(context) || _photos.length < 2) return;
      setState(() => _index = (_index + 1) % _photos.length);
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final photos = _photos;
    final i = _index % photos.length;
    return Stack(
      fit: StackFit.expand,
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 1100),
          layoutBuilder: (current, previous) => Stack(fit: StackFit.expand, children: [...previous, if (current != null) current]),
          child: TweenAnimationBuilder<double>(
            key: ValueKey('$i-${photos[i]}'),
            tween: Tween(begin: 1.0, end: 1.1),
            duration: widget.interval + const Duration(seconds: 1),
            curve: Curves.easeOut,
            builder: (_, scale, child) => Transform.scale(scale: scale, child: child),
            child: DelniImage(photos[i]),
          ),
        ),
        if (widget.showDots && photos.length > 1)
          PositionedDirectional(
            top: 12,
            end: 12,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(
                photos.length.clamp(0, 8),
                (d) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 2),
                  width: d == i ? 16 : 6,
                  height: 6,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: d == i ? 0.95 : 0.5),
                    borderRadius: BorderRadius.circular(6),
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Full-screen photos: swipe between them, pinch to zoom.
Future<void> openPhotoViewer(BuildContext context, List<String> photos, {int initial = 0}) {
  final list = photos.where((p) => p.trim().isNotEmpty).toList();
  if (list.isEmpty) return Future.value();
  return Navigator.of(context).push(PageRouteBuilder<void>(
    opaque: false,
    barrierColor: Colors.black,
    pageBuilder: (_, __, ___) => _PhotoViewer(photos: list, initial: initial.clamp(0, list.length - 1)),
    transitionsBuilder: (_, a, __, child) => FadeTransition(opacity: a, child: child),
  ));
}

class _PhotoViewer extends StatefulWidget {
  final List<String> photos;
  final int initial;
  const _PhotoViewer({required this.photos, required this.initial});

  @override
  State<_PhotoViewer> createState() => _PhotoViewerState();
}

class _PhotoViewerState extends State<_PhotoViewer> {
  late final _controller = PageController(initialPage: widget.initial);
  late int _index = widget.initial;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          PageView.builder(
            controller: _controller,
            itemCount: widget.photos.length,
            onPageChanged: (i) => setState(() => _index = i),
            itemBuilder: (_, i) => InteractiveViewer(
              minScale: 1,
              maxScale: 4,
              child: Center(child: AspectRatio(aspectRatio: 4 / 3, child: DelniImage(widget.photos[i]))),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(8),
              child: Row(
                children: [
                  IconButton(
                    style: IconButton.styleFrom(backgroundColor: Colors.white24),
                    icon: const Icon(Icons.close_rounded, color: Colors.white),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  const Spacer(),
                  if (widget.photos.length > 1)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(20)),
                      child: Text('${_index + 1} / ${widget.photos.length}',
                          textDirection: TextDirection.ltr, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
