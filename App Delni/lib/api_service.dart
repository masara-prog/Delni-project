import 'dart:convert';
import 'package:http/http.dart' as http;
import 'models.dart';

/// Result of a write operation against the Laravel API.
class ApiResult {
  final bool success;
  final String message;
  final String code;

  ApiResult(this.success, this.message, {this.code = ''});
}

class ApiService {
  // Candidate server bases:
  // 1. 127.0.0.1 (Reverse port forwarding over USB cable via ADB - highest speed & 100% reliable)
  // 2. 172.20.10.2 (Current Wi-Fi / Hotspot IP)
  // 3. 192.168.0.102 (Alternate local Wi-Fi IP)
  // 4. 10.0.2.2 (Android Emulator)
  static String baseUrl = 'http://127.0.0.1:8000/api';
  static bool isConnectedToLiveDb = true;

  static final List<String> candidateUrls = [
    'http://127.0.0.1:8000/api',
    'http://192.168.1.180:8000/api',
    'http://10.0.2.2:8000/api',
    'http://172.20.10.2:8000/api',
    'http://192.168.0.102:8000/api',
  ];

  static void setServerIp(String ipWithPort) {
    baseUrl = 'http://$ipWithPort/api';
  }

  /// Auto-probe candidate servers to connect to the active backend
  static Future<bool> testAndConnect() async {
    // First try current baseUrl
    if (await _pingUrl(baseUrl)) {
      isConnectedToLiveDb = true;
      return true;
    }

    // Otherwise probe all candidates
    for (final candidate in candidateUrls) {
      if (candidate == baseUrl) continue;
      if (await _pingUrl(candidate)) {
        baseUrl = candidate;
        isConnectedToLiveDb = true;
        return true;
      }
    }

    isConnectedToLiveDb = false;
    return false;
  }


  static Future<bool> _pingUrl(String url) async {
    try {
      final res = await http.get(Uri.parse('$url/health')).timeout(const Duration(milliseconds: 1500));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  /// The server root (baseUrl without /api), where uploaded files are served (/uploads/...).
  static String get serverOrigin => baseUrl.endsWith('/api') ? baseUrl.substring(0, baseUrl.length - 4) : baseUrl;

  /// Set by the app's language switch so the app's own fallback messages follow the chosen language.
  static bool english = false;
  static String _m(String ar, String en) => english ? en : ar;

  // --- Authentication & Actors ---
  static UserSession? currentSession;

  static bool get _isTourist =>
      currentSession != null && currentSession!.role == 'tourist' && !currentSession!.isGuest && currentSession!.token != null;

  /// Headers for authenticated Laravel requests (Sanctum bearer token).
  static Map<String, String> _authHeaders() => {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        if (currentSession?.token != null) 'Authorization': 'Bearer ${currentSession!.token}',
      };

  /// Readable message from a Laravel error body (validation errors listed field by field).
  static String _errorMessage(http.Response res) {
    try {
      final dynamic data = json.decode(res.body);
      if (data is Map && data['errors'] is Map) {
        final messages = (data['errors'] as Map).values.expand((v) => v is List ? v : [v]).join(' - ');
        if (messages.isNotEmpty) return messages;
      }
      if (data is Map && data['message'] != null) return data['message'].toString();
      if (data is Map && data['error'] != null) return data['error'].toString();
    } catch (_) {}
    if (res.statusCode == 401) return _m('انتهت الجلسة أو لم يتم تسجيل الدخول، يرجى تسجيل الدخول من جديد', 'Your session has ended, please sign in again');
    if (res.statusCode == 403) return _m('ليست لديك صلاحية لتنفيذ هذا الإجراء', 'You are not allowed to do this');
    return _m('تعذر إتمام العملية على خادم دلّني', 'The Delni server could not complete the request');
  }

  static String get _offlineMessage =>
      _m('تعذر الاتصال بخادم دلّني، تحقق من اتصالك ثم أعد المحاولة', 'Could not reach the Delni server. Check your connection and try again');

  /// GET a JSON body. Returns null when the server cannot be reached or answers with an error.
  static Future<dynamic> _getJson(String path, {bool auth = false, int seconds = 6}) async {
    try {
      final res = await http
          .get(Uri.parse('$baseUrl$path'), headers: auth ? _authHeaders() : {'Accept': 'application/json'})
          .timeout(Duration(seconds: seconds));
      if (res.statusCode == 200) {
        isConnectedToLiveDb = true;
        return json.decode(res.body);
      }
    } catch (_) {}
    return null;
  }

  /// A list endpoint answering {data: [...]} or a bare list. Null on failure.
  static Future<List<T>?> _getList<T>(String path, T Function(Map<String, dynamic>) parse, {bool auth = false}) async {
    final decoded = await _getJson(path, auth: auth);
    if (decoded == null) return null;
    final list = decoded is List ? decoded : (decoded is Map ? decoded['data'] : null);
    return jMaps(list).map(parse).toList();
  }

  /// POST/PUT with the session token. [okCodes] are the success statuses of that endpoint.
  static Future<ApiResult> _send(String method, String path, Map<String, dynamic> body,
      {List<int> okCodes = const [200, 201], String Function(dynamic data)? code}) async {
    try {
      final uri = Uri.parse('$baseUrl$path');
      final encoded = json.encode(body);
      final res = await (method == 'PUT'
              ? http.put(uri, headers: _authHeaders(), body: encoded)
              : http.post(uri, headers: _authHeaders(), body: encoded))
          .timeout(const Duration(seconds: 12));
      if (okCodes.contains(res.statusCode)) {
        final dynamic data = json.decode(res.body);
        final ok = data is! Map || (data['status'] != 'error' && data['success'] != false);
        if (ok) {
          return ApiResult(true, data is Map ? jStr(data['message']) : '', code: code != null ? code(data) : '');
        }
      }
      return ApiResult(false, _errorMessage(res));
    } catch (_) {
      return ApiResult(false, _offlineMessage);
    }
  }

  // --- Public catalog (null = could not load) ---
  static Future<List<Trip>?> fetchDailyTrips() => _getList('/trips/daily', (j) => Trip.fromJson(j, 'daily'));

  static Future<List<Trip>?> fetchWeeklyTrips() => _getList('/trips/weekly', (j) => Trip.fromJson(j, 'weekly'));

  static Future<List<Hotel>?> fetchHotels() => _getList('/hotels', Hotel.fromJson);

  static Future<List<Restaurant>?> fetchRestaurants() => _getList('/restaurants', Restaurant.fromJson);

  static Future<List<Guide>?> fetchGuides() => _getList('/guides', Guide.fromJson);

  static Future<List<Place>?> fetchPlaces() => _getList('/places', Place.fromJson);

  /// Public profile of one verified guide (rating and completed tours).
  static Future<Guide?> fetchGuide(String licenseNumber) async {
    final data = await _getJson('/guides/${Uri.encodeComponent(licenseNumber)}');
    return data is Map && data['data'] is Map ? Guide.fromJson(jMap(data['data'])) : null;
  }

  // --- Bookable run dates of a daily trip (GET /trips/daily/{id}/availability) ---
  /// Null when the server cannot be reached or the trip is no longer open.
  static Future<List<DepartureDate>?> fetchDailyDepartures(String dailyTripId) async {
    final data = await _getJson('/trips/daily/${Uri.encodeComponent(dailyTripId)}/availability');
    if (data is! Map) return null;
    return jMaps(data['data']).map(DepartureDate.fromJson).toList();
  }

  // --- Booking (signed-in tourist only) ---
  /// Daily trips need [tripDate] (one of fetchDailyDepartures dates).
  static Future<ApiResult> createBooking({
    required String tripId,
    required String tripType,
    required int seats,
    String? tripDate,
  }) async {
    if (!_isTourist) {
      return ApiResult(false, _m('يجب تسجيل الدخول بحساب سائح لإتمام الحجز', 'Sign in with a tourist account to book'));
    }
    final isWeekly = tripType == 'weekly';
    if (!isWeekly && (tripDate == null || tripDate.isEmpty)) {
      return ApiResult(false, _m('يرجى اختيار يوم الانطلاق قبل الحجز', 'Please choose a departure day first'));
    }
    return _send(
      'POST',
      isWeekly ? '/bookings/weekly' : '/bookings/daily',
      {
        isWeekly ? 'weekly_trip_id' : 'daily_trip_id': tripId,
        if (!isWeekly) 'trip_date': tripDate,
        'number_of_seats': seats,
      },
      okCodes: [201],
      code: (d) => d is Map ? jStr(d['booking_id']) : '',
    );
  }

  /// The tourist's own daily and weekly bookings (GET /bookings/tourist/{id}). Null on failure.
  static Future<List<Booking>?> fetchMyBookings() async {
    if (!_isTourist || currentSession!.identifier == null) return null;
    final data = await _getJson('/bookings/tourist/${Uri.encodeComponent(currentSession!.identifier!)}', auth: true);
    if (data is! Map) return null;
    final list = [
      ...jMaps(data['daily']).map((j) => Booking.fromJson(j, 'daily')),
      ...jMaps(data['weekly']).map((j) => Booking.fromJson(j, 'weekly')),
    ];
    list.sort((a, b) => b.bookingDate.compareTo(a.bookingDate));
    return list;
  }

  static Future<ApiResult> cancelBooking(Booking b) =>
      _send('POST', '/bookings/${b.kind}/${Uri.encodeComponent(b.id)}/cancel', {});

  // --- Private (VIP) trips (signed-in tourist only) ---
  static Future<ApiResult> requestPrivateTrip({
    required List<String> placeIds,
    required int companions,
    required String preferredStartDate,
    required int durationDays,
    String? guideLicenseNumber,
    String notes = '',
  }) async {
    if (!_isTourist) {
      return ApiResult(false, _m('يجب تسجيل الدخول بحساب سائح لإرسال طلب الرحلة الخاصة', 'Sign in with a tourist account to request a private trip'));
    }
    return _send(
      'POST',
      '/private-trips',
      {
        'place_ids': placeIds,
        'preferred_start_date': preferredStartDate,
        'duration_days': durationDays,
        'number_of_companions': companions,
        if (guideLicenseNumber != null && guideLicenseNumber.isNotEmpty) 'guide_license_number': guideLicenseNumber,
        if (notes.trim().isNotEmpty) 'customer_requirements': notes.trim(),
      },
      okCodes: [201],
      code: (d) => d is Map ? jStr(d['trip_id']) : '',
    );
  }

  static Future<List<PrivateTripRequest>?> fetchMyPrivateTrips() async {
    if (!_isTourist) return null;
    return _getList('/private-trips', PrivateTripRequest.fromJson, auth: true);
  }

  /// Confirm a quoted private trip or cancel it ([decision] is PrivateTripRequest.confirmed / cancelledByTourist).
  static Future<ApiResult> decidePrivateTrip(String tripId, String decision) =>
      _send('POST', '/private-trips/${Uri.encodeComponent(tripId)}/decision', {'decision': decision});

  // --- Notifications (recipient = the signed-in account) ---
  static Future<List<AppNotification>?> fetchNotifications() =>
      _getList('/notifications', AppNotification.fromJson, auth: true);

  static Future<int> fetchUnreadCount() async {
    final data = await _getJson('/notifications/unread-count', auth: true, seconds: 4);
    return data is Map ? jInt(data['count']) : 0;
  }

  static Future<ApiResult> markNotificationRead(String id) => _send('POST', '/notifications/read', {'id': id});

  static Future<ApiResult> markAllNotificationsRead() => _send('POST', '/notifications/read', {'all': true});

  /// A message to the platform administration (the server always addresses it to the admin).
  static Future<ApiResult> sendSupportMessage({required String subject, required String message, String contact = ''}) {
    final who = currentSession == null || currentSession!.isGuest
        ? _m('زائر', 'Visitor')
        : '${currentSession!.name} (${currentSession!.role})';
    return _send('POST', '/notifications', {
      'type': 'support',
      'title': '📩 $subject',
      'body': [
        '${_m('من', 'From')}: $who',
        if (contact.trim().isNotEmpty) '${_m('للتواصل', 'Contact')}: ${contact.trim()}',
        message.trim(),
      ].join('\n'),
    });
  }

  // --- Tourist profile (POST /auth/tourist/update-profile) ---
  static Future<ApiResult> updateTouristProfile({
    required String fullName,
    required String email,
    required String phone,
    String? newPassword,
  }) async {
    if (!_isTourist) {
      return ApiResult(false, _m('يجب تسجيل الدخول بحساب سائح', 'Sign in with a tourist account'));
    }
    final result = await _send('POST', '/auth/tourist/update-profile', {
      'tourist_id': currentSession!.identifier,
      'full_name': fullName.trim(),
      'email': email.trim().toLowerCase(),
      'phone_number': phone.trim(),
      if (newPassword != null && newPassword.isNotEmpty) 'password': newPassword,
    });
    if (result.success) {
      currentSession = currentSession!.copyWith(name: fullName.trim(), email: email.trim().toLowerCase(), phone: phone.trim());
    }
    return result;
  }

  // --- Guide dashboard ---
  static Future<GuideDashboard?> fetchGuideDashboard() async {
    final id = currentSession?.identifier;
    if (id == null) return null;
    final data = await _getJson('/dashboard/guide/${Uri.encodeComponent(id)}', auth: true, seconds: 10);
    return data is Map && data['guide'] is Map ? GuideDashboard.fromJson(jMap(data)) : null;
  }

  /// [available] true = 'متاح', false = 'إجازة' (TourGuide::AVAILABILITY).
  static Future<ApiResult> setGuideAvailability(bool available) {
    final id = currentSession?.identifier ?? '';
    return _send('PUT', '/dashboard/guide/${Uri.encodeComponent(id)}', {'availability_status': available ? 'متاح' : 'إجازة'});
  }

  /// Saves the guide's own profile (PUT /dashboard/guide/{licence}); the server keeps a verified guide's identity locked.
  static Future<ApiResult> updateGuideProfile(Map<String, dynamic> fields) {
    final id = currentSession?.identifier ?? '';
    return _send('PUT', '/dashboard/guide/${Uri.encodeComponent(id)}', fields);
  }

  /// Accept or decline a trip assigned to the guide ([kind] daily / weekly / private).
  static Future<ApiResult> respondToTrip({required String kind, required String tripId, required bool accept, String reason = ''}) {
    final path = kind == 'private' ? '/private-trips/${Uri.encodeComponent(tripId)}/guide-response' : '/trips/$kind/${Uri.encodeComponent(tripId)}/guide-response';
    return _send('POST', path, {
      'license_number': currentSession?.identifier,
      'decision': accept ? 'accept' : 'decline',
      if (reason.trim().isNotEmpty) 'reason': reason.trim(),
    });
  }

  // --- Driver dashboard ---
  static Future<DriverDashboard?> fetchDriverDashboard() async {
    final id = currentSession?.identifier;
    if (id == null) return null;
    final data = await _getJson('/dashboard/driver/${Uri.encodeComponent(id)}', auth: true, seconds: 10);
    return data is Map && data['driver'] is Map ? DriverDashboard.fromJson(jMap(data)) : null;
  }

  /// The driver changes their own password (the current one is required), as on the platform.
  static Future<ApiResult> changeDriverPassword({required String current, required String next}) {
    final id = currentSession?.identifier ?? '';
    return _send('POST', '/transport/drivers/${Uri.encodeComponent(id)}/password', {'current_password': current, 'new_password': next});
  }

  static Future<ApiResult> updateDriverTripStage(String stage) {
    final id = currentSession?.identifier ?? '';
    return _send('POST', '/transport/drivers/${Uri.encodeComponent(id)}/trip-stage', {'stage': stage});
  }

  // --- Sign in / sign up ---
  static Future<AuthResult> login({
    required String role,
    required String login,
    required String password,
  }) async {
    try {
      if (!isConnectedToLiveDb) {
        await testAndConnect();
      }
      final res = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({
          'role': role,
          'login': login.trim(),
          'password': password.trim(),
        }),
      ).timeout(const Duration(seconds: 8));

      final dynamic data = json.decode(res.body);
      if (res.statusCode == 200 && data['status'] == 'success') {
        final user = jMap(data['user']);
        final session = UserSession(
          role: role,
          name: jPick(user, ['full_name', 'name']),
          email: jStr(user['email']).isNotEmpty ? jStr(user['email']) : login.trim(),
          phone: jStr(user['phone_number']),
          identifier: jPick(user, ['tourist_id', 'license_number', 'driver_license_number']),
          token: data['token'],
        );
        currentSession = session;
        return AuthResult(success: true, message: _m('تم تسجيل الدخول بنجاح', 'Signed in'), session: session);
      }
      if (data is Map && data['errors'] is Map) {
        return AuthResult(success: false, message: _errorMessage(res));
      }
      return AuthResult(
        success: false,
        message: data is Map && data['message'] != null
            ? data['message'].toString()
            : _m('بيانات الدخول غير صحيحة، يرجى المحاولة ثانية', 'Incorrect sign-in details, please try again'),
      );
    } catch (e) {
      return AuthResult(success: false, message: _offlineMessage);
    }
  }

  static Future<AuthResult> registerTourist({
    required String fullName,
    required String email,
    required String phone,
    required String passportNumber,
    required String password,
  }) async {
    try {
      if (!isConnectedToLiveDb) {
        await testAndConnect();
      }
      final touristId = passportNumber.trim().toUpperCase();
      final res = await http.post(
        Uri.parse('$baseUrl/auth/register/tourist'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({
          'tourist_id': touristId,
          'full_name': fullName.trim(),
          'email': email.trim().toLowerCase(),
          'phone_number': phone.trim(),
          'password': password.trim(),
        }),
      ).timeout(const Duration(seconds: 8));

      final dynamic data = json.decode(res.body);
      if ((res.statusCode == 200 || res.statusCode == 201) && data['status'] == 'success') {
        final session = UserSession(
          role: 'tourist',
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          identifier: touristId,
          token: data['token'],
        );
        currentSession = session;
        return AuthResult(success: true, message: jStr(data['message']), session: session);
      }
      return AuthResult(success: false, message: _errorMessage(res));
    } catch (e) {
      return AuthResult(success: false, message: _offlineMessage);
    }
  }

  /// The account stays «قيد المراجعة» until the admin approves it (no token is issued).
  static Future<AuthResult> registerGuide({
    required String fullName,
    required String licenseNumber,
    required String licenseExpiryDate,
    required String phone,
    required String email,
    required String password,
    required double pricePerDay,
    required int experienceYears,
    required String gender,
    required String bio,
    required List<String> placeIds,
    required List<String> workingDays,
    required bool speaksEnglish,
    required bool speaksFrench,
    required bool speaksItalian,
    String? avatar,
    String? digitalCertificateFile,
  }) async {
    try {
      if (!isConnectedToLiveDb) {
        await testAndConnect();
      }

      final res = await http.post(
        Uri.parse('$baseUrl/auth/register/guide'),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: json.encode({
          'license_number': licenseNumber.trim().toUpperCase(),
          'license_expiry_date': licenseExpiryDate,
          'full_name': fullName.trim(),
          'phone_number': phone.trim(),
          'email': email.trim().toLowerCase(),
          'password': password.trim(),
          'price_per_day': pricePerDay,
          'years_of_experience': experienceYears,
          'gender': gender,
          'bio': bio.trim(),
          'place_ids': placeIds,
          'working_days': workingDays,
          'speaks_english': speaksEnglish,
          'speaks_french': speaksFrench,
          'speaks_italian': speaksItalian,
          'avatar': avatar,
          'digital_certificate_file': digitalCertificateFile,
        }),
      ).timeout(const Duration(seconds: 20));

      final dynamic data = json.decode(res.body);
      if ((res.statusCode == 200 || res.statusCode == 201) && data['status'] == 'success') {
        return AuthResult(success: true, message: jStr(data['message']));
      }
      return AuthResult(success: false, message: _errorMessage(res));
    } catch (e) {
      return AuthResult(success: false, message: _offlineMessage);
    }
  }

  /// Ends the session on the server too (POST /auth/logout expires the token), then forgets it locally.
  static Future<void> logout() async {
    final session = currentSession;
    currentSession = null;
    if (session?.token == null) return;
    try {
      await http.post(
        Uri.parse('$baseUrl/auth/logout'),
        headers: {'Accept': 'application/json', 'Authorization': 'Bearer ${session!.token}'},
      ).timeout(const Duration(seconds: 4));
    } catch (_) {}
  }
}
