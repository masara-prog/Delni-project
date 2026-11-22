import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../models.dart';

/// Keeps the signed-in account on the phone, so closing the app does not sign the user out.
/// The server token lasts 30 days (SANCTUM_EXPIRATION); signing out removes the saved account.
class SessionStore {
  static const _key = 'delni_session_v1';

  static Future<void> save(UserSession s) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_key, json.encode({
        'role': s.role,
        'name': s.name,
        'email': s.email,
        'phone': s.phone,
        'identifier': s.identifier,
        'token': s.token,
        'isGuest': s.isGuest,
      }));
    } catch (_) {
      // storage unavailable: the session still works until the app is closed
    }
  }

  static Future<UserSession?> load() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_key);
      if (raw == null) return null;
      final j = json.decode(raw) as Map<String, dynamic>;
      return UserSession(
        role: (j['role'] ?? '').toString(),
        name: (j['name'] ?? '').toString(),
        email: (j['email'] ?? '').toString(),
        phone: (j['phone'] ?? '').toString(),
        identifier: j['identifier']?.toString(),
        token: j['token']?.toString(),
        isGuest: j['isGuest'] == true,
      );
    } catch (_) {
      return null;
    }
  }

  static Future<void> clear() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove(_key);
    } catch (_) {}
  }
}
