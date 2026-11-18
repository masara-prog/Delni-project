import 'dart:convert';
import 'package:http/http.dart' as http;

/// English mode for content typed in Arabic (trip titles, descriptions, names, notifications, server messages).
/// The texts are translated by the server (POST /translate, Gemini, cached there) and kept here for this run.
/// Only display fields are translated: statuses, days, kinds and ids keep their Arabic values, because the app
/// compares them and sends them back to the server.
class ContentTranslator {
  static final Map<String, String> _cache = {};
  static final RegExp _arabicWord = RegExp(r'[ء-ي]{2,}');

  /// Fields whose value is only shown to people.
  static const Set<String> displayKeys = {
    'title', 'trip_title', 'description', 'place_name', 'name', 'full_name', 'hotel_name', 'facility_name',
    'restaurant_name', 'company_name', 'transport_company_name', 'guide_name', 'driver_name', 'tourist_name',
    'city', 'departure_city', 'region', 'message', 'body', 'notes', 'highlight_name', 'station_title',
    'station_desc', 'station_description', 'offer_title', 'guide_bio', 'bio', 'customer_requirements',
    'customer_description', 'reason', 'working_hours', 'amenity', 'feature', 'subject', 'comment_text',
    'vehicle_model', 'address', 'error',
  };

  /// Fields that hold a list of display texts (place names, highlights, amenities...).
  static const Set<String> listKeys = {'places', 'place_names', 'highlights', 'amenities', 'features', 'cities', 'regions'};

  static bool hasArabic(String s) => _arabicWord.hasMatch(s);

  static Future<void> _fetch(Set<String> texts, String baseUrl) async {
    final missing = texts.where((t) => !_cache.containsKey(t) && t.length <= 1500).toList();
    for (var i = 0; i < missing.length; i += 60) {
      final chunk = missing.sublist(i, i + 60 > missing.length ? missing.length : i + 60);
      try {
        final res = await http
            .post(Uri.parse('$baseUrl/translate'),
                headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
                body: json.encode({'texts': chunk}))
            .timeout(const Duration(seconds: 8));
        if (res.statusCode != 200) continue;
        final data = json.decode(utf8.decode(res.bodyBytes));
        final got = data is Map ? data['translations'] : null;
        if (got is Map) {
          got.forEach((k, v) {
            if (k is String && v is String && v.isNotEmpty) _cache[k] = v;
          });
        }
      } catch (_) {
        // no translation now: the Arabic text is shown and asked again next time
      }
    }
  }

  static void _collect(dynamic node, Set<String> out, Set<String> skip) {
    if (node is Map) {
      node.forEach((k, v) {
        if (skip.contains(k)) return;
        if (v is String && displayKeys.contains(k) && hasArabic(v)) {
          out.add(v.trim());
        } else if (v is List && listKeys.contains(k)) {
          for (final x in v) {
            if (x is String && hasArabic(x)) out.add(x.trim());
            if (x is Map || x is List) _collect(x, out, skip);
          }
        } else if (v is Map || v is List) {
          _collect(v, out, skip);
        }
      });
    } else if (node is List) {
      for (final x in node) {
        _collect(x, out, skip);
      }
    }
  }

  static dynamic _apply(dynamic node, Set<String> skip) {
    if (node is Map) {
      final copy = <String, dynamic>{};
      node.forEach((k, v) {
        final key = k.toString();
        if (skip.contains(key)) {
          copy[key] = v;
        } else if (v is String && displayKeys.contains(key)) {
          copy[key] = _cache[v.trim()] ?? v;
        } else if (v is List && listKeys.contains(key)) {
          copy[key] = v.map((x) => x is String ? (_cache[x.trim()] ?? x) : _apply(x, skip)).toList();
        } else {
          copy[key] = _apply(v, skip);
        }
      });
      return copy;
    }
    if (node is List) return node.map((x) => _apply(x, skip)).toList();
    return node;
  }

  /// The JSON with its display texts in English (the same JSON when nothing needs translating).
  static Future<dynamic> translateJson(dynamic data, String baseUrl, {Set<String> skipKeys = const {}}) async {
    final found = <String>{};
    _collect(data, found, skipKeys);
    if (found.isEmpty) return data;
    await _fetch(found, baseUrl);
    return _apply(data, skipKeys);
  }

  /// The translation already received for this text, if any (no request).
  static String? cached(String s) => _cache[s.trim()];

  /// One sentence (a server message) in English.
  static Future<String> text(String s, String baseUrl) async {
    final key = s.trim();
    if (!hasArabic(key)) return s;
    if (!_cache.containsKey(key)) await _fetch({key}, baseUrl);
    return _cache[key] ?? s;
  }
}
