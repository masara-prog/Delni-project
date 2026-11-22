import 'package:flutter/material.dart';
import '../api_service.dart';
import '../models.dart';
import 'session_store.dart';

/// The public catalog shown to tourists, loaded from the Laravel API.
/// A list stays null until it loads; [failed] tells the screens the server could not be reached.
class CatalogStore extends ChangeNotifier {
  List<Trip>? trips;
  List<Hotel>? hotels;
  List<Restaurant>? restaurants;
  List<Guide>? guides;
  List<Place>? places;

  bool loading = false;
  bool failed = false;
  bool get loaded => trips != null;

  Future<void> load() async {
    if (loading) return;
    loading = true;
    notifyListeners();
    final connected = await ApiService.testAndConnect();
    if (connected) {
      final results = await Future.wait([
        ApiService.fetchDailyTrips(),
        ApiService.fetchWeeklyTrips(),
        ApiService.fetchHotels(),
        ApiService.fetchRestaurants(),
        ApiService.fetchGuides(),
        ApiService.fetchPlaces(),
      ]);
      final daily = results[0] as List<Trip>?;
      final weekly = results[1] as List<Trip>?;
      if (daily != null || weekly != null) trips = [...?daily, ...?weekly];
      // Suspended partners are not listed (same as the platform's hotels / restaurants pages)
      hotels = (results[2] as List<Hotel>?)?.where((h) => !h.isSuspended).toList() ?? hotels;
      restaurants = (results[3] as List<Restaurant>?)?.where((r) => !r.isSuspended).toList() ?? restaurants;
      guides = (results[4] as List<Guide>?) ?? guides;
      places = (results[5] as List<Place>?) ?? places;
      failed = daily == null && weekly == null;
    } else {
      failed = true;
    }
    loading = false;
    notifyListeners();
  }
}

/// The tourist's favourites. [keys] ("hotel:12") answers "is this saved?" for every heart in the app;
/// [items] holds the names and pictures for the favourites screen. A heart changes at once and goes back
/// if the server refuses.
class FavoritesStore extends ChangeNotifier {
  final Set<String> keys = {};
  List<FavoriteItem>? items;
  bool loading = false;
  bool failed = false;

  bool isSaved(String type, String id) => keys.contains('$type:$id');

  void clear() {
    keys.clear();
    items = null;
    failed = false;
    notifyListeners();
  }

  Future<void> load() async {
    if (loading) return;
    loading = true;
    notifyListeners();
    final list = await ApiService.fetchFavorites();
    loading = false;
    failed = list == null;
    if (list != null) {
      items = list;
      keys
        ..clear()
        ..addAll(list.map((f) => f.key));
    }
    notifyListeners();
  }

  /// Saves or removes the item. Returns the message to show when it failed, or null.
  Future<String?> toggle(String type, String id, {FavoriteItem? display}) async {
    final key = '$type:$id';
    final wasSaved = keys.contains(key);
    final before = items == null ? null : List<FavoriteItem>.of(items!);
    if (wasSaved) {
      keys.remove(key);
      items?.removeWhere((f) => f.key == key);
    } else {
      keys.add(key);
      if (display != null) items?.insert(0, display);
    }
    notifyListeners();
    final res = await ApiService.toggleFavorite(type, id);
    if (!res.ok || res.isFavorite == wasSaved) {
      // refused (or already changed elsewhere): show what the server has
      if (!res.ok) {
        wasSaved ? keys.add(key) : keys.remove(key);
        items = before;
        notifyListeners();
        return res.message;
      }
      await load();
      return null;
    }
    // added without the display details: fetch them for the favourites screen
    if (!wasSaved && display == null) load();
    return null;
  }
}

/// Signed-in account, catalog and unread notifications, shared by every screen.
class AppState extends ChangeNotifier {
  UserSession? session;
  final catalog = CatalogStore();
  final favorites = FavoritesStore();
  int unreadNotifications = 0;

  /// Selected tab of the tourist home (pages pushed on top can switch it, e.g. "view my tickets").
  final touristTab = ValueNotifier<int>(0);

  /// Selected section of the Explore tab (trips, landmarks, hotels, restaurants, guides).
  final exploreSection = ValueNotifier<int>(0);

  /// Section of the bookings tab to show: 0 tickets, 1 private trips (a notification can open either one).
  final bookingsSegment = ValueNotifier<int>(0);

  /// Selected tab of the guide dashboard (a trip notification opens "My trips").
  final guideTab = ValueNotifier<int>(0);

  /// Bumped after a booking or a private-trip request so the bookings tab reloads.
  final bookingsRevision = ValueNotifier<int>(0);

  void signIn(UserSession s) {
    session = s;
    ApiService.currentSession = s;
    unreadNotifications = 0;
    touristTab.value = 0;
    notifyListeners();
    refreshUnread();
    favorites.clear();
    if (s.isTourist) favorites.load();
    // Kept on the phone: closing the app does not sign the user out
    SessionStore.save(s);
  }

  /// After the profile was saved on the server.
  void updateSession(UserSession s) {
    session = s;
    ApiService.currentSession = s;
    notifyListeners();
    SessionStore.save(s);
  }

  Future<void> signOut() async {
    session = null;
    unreadNotifications = 0;
    favorites.clear();
    notifyListeners();
    await SessionStore.clear();
    await ApiService.logout();
  }

  /// At start-up: the account saved on the phone, if its token is still accepted by the server.
  /// A rejected token (expired, or the account signed out elsewhere) is forgotten; with no server reachable
  /// the saved account is kept, so the app still opens where the user left it.
  Future<void> restoreSession() async {
    final saved = await SessionStore.load();
    if (saved == null) return;
    if (!saved.isGuest && saved.token != null) {
      final valid = await ApiService.isTokenValid(saved.token!);
      if (valid == false) {
        await SessionStore.clear();
        return;
      }
    }
    session = saved;
    ApiService.currentSession = saved;
    notifyListeners();
    refreshUnread();
    if (saved.isTourist) favorites.load();
  }

  Future<void> refreshUnread() async {
    if (session == null || session!.isGuest) return;
    final count = await ApiService.fetchUnreadCount();
    if (count != unreadNotifications) {
      unreadNotifications = count;
      notifyListeners();
    }
  }

  void setUnread(int count) {
    unreadNotifications = count;
    notifyListeners();
  }
}

class AppScope extends InheritedNotifier<AppState> {
  const AppScope({super.key, required AppState state, required super.child}) : super(notifier: state);

  static AppState of(BuildContext context) => context.dependOnInheritedWidgetOfExactType<AppScope>()!.notifier!;

  /// Without listening for changes (inside callbacks).
  static AppState read(BuildContext context) => context.getInheritedWidgetOfExactType<AppScope>()!.notifier!;
}
