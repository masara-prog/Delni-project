// Delni models, parsed from the Laravel API responses.
// Missing values stay empty (or 0 / null) and the screens hide them: nothing is filled with made-up data.

// --- JSON helpers ---
String jStr(dynamic v) => v == null ? '' : v.toString().trim();

int jInt(dynamic v) {
  if (v is num) return v.toInt();
  return int.tryParse(jStr(v)) ?? double.tryParse(jStr(v))?.toInt() ?? 0;
}

double jDouble(dynamic v) {
  if (v is num) return v.toDouble();
  return double.tryParse(jStr(v)) ?? 0;
}

bool jBool(dynamic v) => v == true || v == 1 || v == '1' || v == 'true';

List<Map<String, dynamic>> jMaps(dynamic v) =>
    v is List ? v.whereType<Map>().map((m) => Map<String, dynamic>.from(m)).toList() : <Map<String, dynamic>>[];

Map<String, dynamic> jMap(dynamic v) => v is Map ? Map<String, dynamic>.from(v) : <String, dynamic>{};

List<String> jStrings(dynamic v) {
  if (v is List) return v.map(jStr).where((s) => s.isNotEmpty).toList();
  final s = jStr(v);
  if (s.isEmpty) return [];
  return s.split(RegExp(r'[,،•]')).map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
}

/// First non-empty value of the given keys.
String jPick(Map<String, dynamic> j, List<String> keys) {
  for (final k in keys) {
    final s = jStr(j[k]);
    if (s.isNotEmpty) return s;
  }
  return '';
}

/// 'YYYY-MM-DD' part of a date/time value.
String jDate(dynamic v) {
  final s = jStr(v);
  return s.length >= 10 ? s.substring(0, 10) : s;
}

// --- Catalog ---

class ItineraryStep {
  final String time;
  final String title;
  final String description;
  final int dayNumber;

  ItineraryStep({required this.time, required this.title, this.description = '', this.dayNumber = 0});

  factory ItineraryStep.fromJson(Map<String, dynamic> j) => ItineraryStep(
        time: jPick(j, ['station_time', 'time']),
        title: jPick(j, ['station_title', 'title']),
        description: jPick(j, ['station_desc', 'desc']),
        dayNumber: jInt(j['day_number']),
      );
}

/// One bookable run date of a daily trip.
class DepartureDate {
  final String date;
  final String day;
  final int seatsLeft;

  /// Discount of the offer running on this date (0 = none) and the seat price after it (0 = not sent).
  final double discount;
  final double price;

  /// Why the date cannot be booked at all (the guide is away on a private trip); empty when it can.
  final String closedReason;

  DepartureDate({required this.date, required this.day, required this.seatsLeft, this.discount = 0, this.price = 0, this.closedReason = ''});

  bool get isClosed => closedReason.isNotEmpty;

  factory DepartureDate.fromJson(Map<String, dynamic> j) => DepartureDate(
        date: jStr(j['date']),
        day: jPick(j, ['day', 'weekday']),
        seatsLeft: jInt(j['seats_left'] ?? j['remaining']),
        discount: jDouble(j['discount']),
        price: jDouble(j['price']),
        closedReason: jBool(j['closed']) ? (jStr(j['reason']).isEmpty ? 'غير متاح' : jStr(j['reason'])) : '',
      );
}

/// The promotional offer a trip has now or next (active_offer): the discount applies to run dates inside its period.
class TripOffer {
  final String title;
  final double discount;
  final String startDate;
  final String endDate;

  TripOffer({required this.title, required this.discount, required this.startDate, required this.endDate});

  bool covers(String date) => date.isNotEmpty && startDate.compareTo(date) <= 0 && endDate.compareTo(date) >= 0;

  static TripOffer? fromJson(dynamic v) {
    final j = jMap(v);
    if (j.isEmpty || jDouble(j['discount']) <= 0) return null;
    return TripOffer(
      title: jStr(j['title']),
      discount: jDouble(j['discount']),
      startDate: jDate(j['start_date']),
      endDate: jDate(j['end_date']),
    );
  }
}

/// A landmark a trip visits, as linked to it in the database.
class TripPlace {
  final String id;
  final String name;
  final String city;
  final String image;
  final String category;

  TripPlace({required this.id, required this.name, this.city = '', this.image = '', this.category = ''});

  factory TripPlace.fromJson(Map<String, dynamic> j) => TripPlace(
        id: jStr(j['place_id']),
        name: jPick(j, ['place_name', 'city']),
        city: jStr(j['city']),
        image: jStr(j['place_image']),
        category: jStr(j['category']),
      );
}

class Trip {
  final String id;
  final String type; // 'daily' | 'weekly'
  final String title;
  final String description;
  final double price;
  final String departureCity;
  final List<String> photos;
  final double ratingAvg;
  final int reviewsCount;
  final int bookingsCount;
  final int availableSeats;
  final int maxCapacity;
  final String guideName;
  final String guidePhone;
  final String guideAvatar;
  final String guideLicense;
  final int guideYears;
  final double guidePricePerDay;
  final String guideBio;
  final bool guideSpeaksEnglish;
  final bool guideSpeaksFrench;
  final bool guideSpeaksItalian;
  final String vehicleModel;
  final String vehiclePlate;
  final int vehicleCapacity;
  final String vehicleImage;
  final String vehicleCategory;
  final double vehicleDailyRate;
  final String vehicleStatus;
  final String transportCompany;
  final String companyPhone;
  final String driverName;
  final String driverPhone;
  final TripOffer? activeOffer;
  final List<TripPlace> places;
  final List<ItineraryStep> itinerary;
  final List<String> days;
  final List<String> destinations;
  final List<String> hotelNames;
  final String restaurantName;
  final List<DepartureDate> openDates;
  final String startDate;
  final String endDate;

  Trip({
    required this.id,
    required this.type,
    required this.title,
    this.description = '',
    this.price = 0,
    this.departureCity = '',
    this.photos = const [],
    this.ratingAvg = 0,
    this.reviewsCount = 0,
    this.bookingsCount = 0,
    this.availableSeats = 0,
    this.maxCapacity = 0,
    this.guideName = '',
    this.guidePhone = '',
    this.guideAvatar = '',
    this.guideLicense = '',
    this.guideYears = 0,
    this.guidePricePerDay = 0,
    this.guideBio = '',
    this.guideSpeaksEnglish = false,
    this.guideSpeaksFrench = false,
    this.guideSpeaksItalian = false,
    this.vehicleModel = '',
    this.vehiclePlate = '',
    this.vehicleCapacity = 0,
    this.vehicleImage = '',
    this.vehicleCategory = '',
    this.vehicleDailyRate = 0,
    this.vehicleStatus = '',
    this.transportCompany = '',
    this.companyPhone = '',
    this.driverName = '',
    this.driverPhone = '',
    this.activeOffer,
    this.places = const [],
    this.itinerary = const [],
    this.days = const [],
    this.destinations = const [],
    this.hotelNames = const [],
    this.restaurantName = '',
    this.openDates = const [],
    this.startDate = '',
    this.endDate = '',
  });

  bool get isWeekly => type == 'weekly';
  String get imageUrl => photos.isNotEmpty ? photos.first : '';
  bool get hasVehicle => vehicleModel.isNotEmpty || vehiclePlate.isNotEmpty;

  /// The offer lowers the listed price when it covers an open run date (daily) or the start date (weekly).
  bool get offerAppliesNow {
    final o = activeOffer;
    if (o == null) return false;
    if (isWeekly) return o.covers(startDate);
    return openDates.any((d) => o.covers(d.date));
  }

  double get offerPrice => activeOffer == null ? price : (price * (1 - activeOffer!.discount / 100) * 100).roundToDouble() / 100;

  /// Number of days of a weekly trip (from its dates), 0 when unknown.
  int get durationDays {
    final s = DateTime.tryParse(startDate);
    final e = DateTime.tryParse(endDate);
    if (s == null || e == null) return 0;
    return e.difference(s).inDays + 1;
  }

  factory Trip.fromJson(Map<String, dynamic> j, String type) {
    final photos = jStrings(j['images']);
    if (photos.isEmpty) {
      for (final k in ['photo', 'cover_photo', 'photo_1']) {
        final p = jStr(j[k]);
        if (p.isNotEmpty) {
          photos.add(p);
          break;
        }
      }
    }
    final title = jPick(j, ['trip_title', 'title']);
    final description = jPick(j, ['description', 'trip_description']);
    return Trip(
      id: jPick(j, ['daily_trip_id', 'weekly_trip_id', 'id']),
      type: type,
      title: title,
      // The description columns were removed from the platform (they only repeated the title)
      description: description == title ? '' : description,
      price: jDouble(j['price_per_seat'] ?? j['seat_per_price'] ?? j['price']),
      departureCity: jStr(j['departure_city']),
      photos: photos,
      ratingAvg: jDouble(j['rating_avg']),
      reviewsCount: jInt(j['reviews_count']),
      bookingsCount: jInt(j['bookings_count']),
      availableSeats: jInt(j['available_seats']),
      maxCapacity: jInt(j['max_capacity']),
      guideName: jStr(j['guide_name']),
      guidePhone: jStr(j['guide_phone']),
      guideAvatar: jStr(j['guide_avatar']),
      guideLicense: jStr(j['guide_license_number']),
      guideYears: jInt(j['guide_years']),
      guidePricePerDay: jDouble(j['guide_price_per_day']),
      guideBio: jStr(j['guide_bio']),
      guideSpeaksEnglish: jBool(j['guide_speaks_english']),
      guideSpeaksFrench: jBool(j['guide_speaks_french']),
      guideSpeaksItalian: jBool(j['guide_speaks_italian']),
      vehicleModel: jStr(j['vehicle_model']),
      vehiclePlate: jStr(j['vehicle_plate']),
      vehicleCapacity: jInt(j['vehicle_capacity']),
      vehicleImage: jStr(j['vehicle_image']),
      vehicleCategory: jStr(j['vehicle_category']),
      vehicleDailyRate: jDouble(j['vehicle_daily_rate']),
      vehicleStatus: jStr(j['vehicle_status']),
      transportCompany: jStr(j['transport_company_name']),
      companyPhone: jStr(j['transport_company_phone']),
      driverName: jStr(j['driver_name']),
      driverPhone: jStr(j['driver_phone']),
      activeOffer: TripOffer.fromJson(j['active_offer']),
      places: jMaps(j['places']).map(TripPlace.fromJson).toList(),
      itinerary: jMaps(j['itinerary_steps'] ?? j['stations']).map(ItineraryStep.fromJson).toList(),
      days: jStrings(j['days']),
      destinations: jStrings(j['destinations']),
      hotelNames: jMaps(j['hotels']).map((h) => jStr(h['hotel_name'])).where((s) => s.isNotEmpty).toList(),
      restaurantName: jStr(j['restaurant_name']),
      openDates: jMaps(j['open_dates']).map(DepartureDate.fromJson).toList(),
      startDate: jDate(j['start_date']),
      endDate: jDate(j['end_date']),
    );
  }
}

List<String> _photos(Map<String, dynamic> j, String prefix) => [
      for (var i = 1; i <= 5; i++) jStr(j['$prefix$i']),
    ].where((p) => p.isNotEmpty).toList();

class Hotel {
  final String id;
  final String name;
  final String city;
  final String address;
  final String phone;
  final int starRating;
  final String propertyType;
  final String description;
  final String workingHours;
  final int discountPercentage;
  final List<String> photos;
  final List<String> amenities;
  final double ratingAvg;
  final int reviewsCount;
  final String mapsUrl;
  final String partnershipStatus;

  Hotel({
    required this.id,
    required this.name,
    this.city = '',
    this.address = '',
    this.phone = '',
    this.starRating = 0,
    this.propertyType = '',
    this.description = '',
    this.workingHours = '',
    this.discountPercentage = 0,
    this.photos = const [],
    this.amenities = const [],
    this.ratingAvg = 0,
    this.reviewsCount = 0,
    this.mapsUrl = '',
    this.partnershipStatus = '',
  });

  String get imageUrl => photos.isNotEmpty ? photos.first : '';

  /// The administration suspended the partnership, so the platform no longer lists it.
  bool get isSuspended => partnershipStatus == 'موقوف';

  factory Hotel.fromJson(Map<String, dynamic> j) => Hotel(
        id: jPick(j, ['hotel_id', 'id']),
        name: jPick(j, ['hotel_name', 'name']),
        city: jStr(j['city']),
        address: jPick(j, ['address_details', 'address']),
        phone: jStr(j['phone_number']),
        starRating: jInt(j['star_rating']),
        propertyType: jStr(j['property_type']),
        description: jStr(j['description']),
        workingHours: jStr(j['working_hours']),
        discountPercentage: jInt(j['discount_percentage']),
        photos: _photos(j, 'hotel_photo_'),
        amenities: jStrings(j['amenities']),
        ratingAvg: jDouble(j['rating_avg']),
        reviewsCount: jInt(j['reviews_count']),
        mapsUrl: jStr(j['google_maps_url']),
        partnershipStatus: jStr(j['partnership_status']),
      );
}

class Restaurant {
  final String id;
  final String name;
  final String type;
  final String city;
  final String address;
  final String phone;
  final String description;
  final String workingHours;
  final int discountPercentage;
  final List<String> photos;
  final List<String> features;
  final double ratingAvg;
  final int reviewsCount;
  final String mapsUrl;
  final String partnershipStatus;

  Restaurant({
    required this.id,
    required this.name,
    this.type = '',
    this.city = '',
    this.address = '',
    this.phone = '',
    this.description = '',
    this.workingHours = '',
    this.discountPercentage = 0,
    this.photos = const [],
    this.features = const [],
    this.ratingAvg = 0,
    this.reviewsCount = 0,
    this.mapsUrl = '',
    this.partnershipStatus = '',
  });

  String get imageUrl => photos.isNotEmpty ? photos.first : '';

  /// The administration suspended the partnership, so the platform no longer lists it.
  bool get isSuspended => partnershipStatus == 'موقوف';

  factory Restaurant.fromJson(Map<String, dynamic> j) => Restaurant(
        id: jPick(j, ['facility_id', 'id']),
        name: jPick(j, ['facility_name', 'name']),
        type: jStr(j['facility_type']),
        city: jStr(j['city']),
        address: jPick(j, ['address_details', 'address']),
        phone: jStr(j['phone_number']),
        description: jStr(j['description']),
        workingHours: jStr(j['working_hours']),
        discountPercentage: jInt(j['discount_percentage']),
        photos: _photos(j, 'facility_image_'),
        features: jStrings(j['features']),
        ratingAvg: jDouble(j['rating_avg']),
        reviewsCount: jInt(j['reviews_count']),
        mapsUrl: jStr(j['google_maps_url']),
        partnershipStatus: jStr(j['partnership_status']),
      );
}

class Guide {
  final String licenseNumber;
  final String name;
  final String phone;
  final String bio;
  final int experienceYears;
  final String gender;
  final String avatar;
  final bool speaksEnglish;
  final bool speaksFrench;
  final bool speaksItalian;
  final List<String> places;
  final List<String> workingDays;
  final List<String> regions;
  final double ratingAvg;
  final int reviewsCount;
  final int toursCompleted;
  final String availability;
  final double pricePerDay;
  final bool isVerified;

  /// False while the guide is assigned to a daily or weekly trip: such a guide cannot be requested for a private trip.
  final bool availableForPrivate;

  /// Ids of the Delni landmarks the guide works at (guide dashboard only).
  final List<String> placeIds;

  Guide({
    required this.licenseNumber,
    required this.name,
    this.phone = '',
    this.bio = '',
    this.experienceYears = 0,
    this.gender = '',
    this.avatar = '',
    this.speaksEnglish = false,
    this.speaksFrench = false,
    this.speaksItalian = false,
    this.places = const [],
    this.workingDays = const [],
    this.regions = const [],
    this.ratingAvg = 0,
    this.reviewsCount = 0,
    this.toursCompleted = 0,
    this.availability = '',
    this.pricePerDay = 0,
    this.isVerified = false,
    this.availableForPrivate = true,
    this.placeIds = const [],
  });

  bool get isAvailable => availability.isEmpty || availability == 'متاح';

  /// Can be chosen for a private trip (not on leave and not assigned to a scheduled trip).
  bool get canTakePrivate => isAvailable && availableForPrivate;

  factory Guide.fromJson(Map<String, dynamic> j) => Guide(
        licenseNumber: jStr(j['license_number']),
        name: jPick(j, ['full_name', 'name']),
        phone: jStr(j['phone_number']),
        bio: jStr(j['bio']),
        experienceYears: jInt(j['years_of_experience']),
        gender: jStr(j['gender']),
        avatar: jStr(j['avatar']),
        speaksEnglish: jBool(j['speaks_english']),
        speaksFrench: jBool(j['speaks_french']),
        speaksItalian: jBool(j['speaks_italian']),
        places: jMaps(j['places']).map((p) => jPick(p, ['place_name', 'city'])).where((s) => s.isNotEmpty).toList(),
        workingDays: jStrings(j['working_days']),
        regions: jStrings(j['operating_regions']),
        ratingAvg: jDouble(j['rating_avg']),
        reviewsCount: jInt(j['reviews_count']),
        toursCompleted: jInt(j['total_tours_completed']),
        availability: jStr(j['availability_status']),
        pricePerDay: jDouble(j['price_per_day']),
        isVerified: jStr(j['verification_status']) == 'موثق',
        availableForPrivate: j['available_for_private'] == null || jBool(j['available_for_private']),
        placeIds: j['place_ids'] is List ? (j['place_ids'] as List).map((e) => '$e').toList() : const [],
      );
}

/// A landmark registered on Delni (places_tourist).
class Place {
  final String id;
  final String name;
  final String description;
  final String category;
  final String region;
  final String image;
  final List<String> highlights;
  final String mapsUrl;

  Place({
    required this.id,
    required this.name,
    this.description = '',
    this.category = '',
    this.region = '',
    this.image = '',
    this.highlights = const [],
    this.mapsUrl = '',
  });

  factory Place.fromJson(Map<String, dynamic> j) => Place(
        id: jStr(j['place_id']),
        name: jPick(j, ['city', 'place_name']),
        description: jStr(j['description']),
        category: jStr(j['category']),
        region: jStr(j['region']),
        image: jStr(j['place_image']),
        highlights: jStrings(j['highlights']),
        mapsUrl: jStr(j['google_maps_url']),
      );
}

// --- Tourist account ---

class Booking {
  final String id;
  final String kind; // 'daily' | 'weekly'
  final String tripId;
  final String tripTitle;
  final String tripDate;
  final String bookingDate;
  final int seats;
  final String status;
  final double totalPrice;
  final String paymentStatus;
  final bool attended;
  final String photo;
  final String departureCity;
  final String guideName;
  final String guidePhone;
  final String departureTime;
  final String startDate;
  final String endDate;
  final String vehiclePlate;
  final String vehicleType;
  final String companyName;
  final String driverName;
  final String driverPhone;

  Booking({
    required this.id,
    required this.kind,
    this.tripId = '',
    this.tripTitle = '',
    this.tripDate = '',
    this.bookingDate = '',
    this.seats = 0,
    this.status = '',
    this.totalPrice = 0,
    this.paymentStatus = '',
    this.attended = false,
    this.photo = '',
    this.departureCity = '',
    this.guideName = '',
    this.guidePhone = '',
    this.departureTime = '',
    this.startDate = '',
    this.endDate = '',
    this.vehiclePlate = '',
    this.vehicleType = '',
    this.companyName = '',
    this.driverName = '',
    this.driverPhone = '',
  });

  bool get isCancelled => status.startsWith('ملغ');
  bool get isPaid => paymentStatus == 'paid';

  /// The day the trip runs (daily run date, or the weekly trip's start).
  String get travelDate => tripDate.isNotEmpty ? tripDate : startDate;

  bool get isPast {
    final d = DateTime.tryParse(endDate.isNotEmpty ? endDate : travelDate);
    if (d == null) return false;
    final today = DateTime.now();
    return d.isBefore(DateTime(today.year, today.month, today.day));
  }

  factory Booking.fromJson(Map<String, dynamic> j, String kind) {
    final trip = jMap(j[kind == 'weekly' ? 'weekly_trip' : 'daily_trip']);
    final guide = jMap(trip['guide']);
    final transport = jMap(trip['transport']);
    return Booking(
      id: jPick(j, ['booking_daily_id', 'booking_weekly_id']),
      kind: kind,
      tripId: jPick(j, ['daily_trip_id', 'weekly_trip_id']),
      tripTitle: jPick(j, ['trip_title']).isNotEmpty ? jStr(j['trip_title']) : jStr(trip['trip_title']),
      tripDate: jDate(j['trip_date']),
      bookingDate: jDate(j['booking_date']),
      seats: jInt(j['number_of_seats']),
      status: jStr(j['booking_status']),
      totalPrice: jDouble(j['total_price']),
      paymentStatus: jStr(j['payment_status']),
      attended: jBool(j['attended']),
      photo: jPick(trip, ['photo', 'photo_1']),
      departureCity: jStr(trip['departure_city']),
      guideName: jStr(guide['full_name']),
      guidePhone: jStr(guide['phone_number']),
      departureTime: jStr(trip['first_station_time']),
      startDate: jDate(trip['start_date']),
      endDate: jDate(trip['end_date']),
      vehiclePlate: jStr(transport['vehicle_plate']),
      vehicleType: jStr(transport['vehicle_type']),
      companyName: jStr(transport['company_name']),
      driverName: jStr(transport['driver_name']),
      driverPhone: jStr(transport['driver_phone']),
    );
  }
}

class PrivateTripRequest {
  final String id;
  final String status;
  final String startDate;
  final int durationDays;
  final int companions;
  final double quotedPrice;
  final double additionalExpenses;
  final String requirements;
  final String description;
  final String guideName;
  final String guidePhone;
  final String vehicleModel;
  final String createdAt;
  final List<String> places;
  final List<String> hotels;
  final List<ItineraryStep> stations;

  PrivateTripRequest({
    required this.id,
    required this.status,
    this.startDate = '',
    this.durationDays = 0,
    this.companions = 0,
    this.quotedPrice = 0,
    this.additionalExpenses = 0,
    this.requirements = '',
    this.description = '',
    this.guideName = '',
    this.guidePhone = '',
    this.vehicleModel = '',
    this.createdAt = '',
    this.places = const [],
    this.hotels = const [],
    this.stations = const [],
  });

  static const quoted = 'بانتظار تأكيد السائح';
  static const confirmed = 'مؤكدة';
  static const cancelledByTourist = 'ملغاة من السائح';

  bool get awaitsTouristDecision => status == quoted;
  bool get isClosed => status.startsWith('ملغ') || status.startsWith('مرفوض');

  factory PrivateTripRequest.fromJson(Map<String, dynamic> j) => PrivateTripRequest(
        id: jStr(j['private_trip_id']),
        status: jStr(j['status_order']),
        startDate: jDate(j['preferred_start_date']),
        durationDays: jInt(j['duration_days']),
        companions: jInt(j['number_of_companions']),
        quotedPrice: jDouble(j['quoted_price']),
        additionalExpenses: jDouble(j['additional_expenses']),
        requirements: jStr(j['customer_requirements']),
        description: jStr(j['customer_description']),
        guideName: jStr(j['guide_name']),
        guidePhone: jStr(j['guide_phone']),
        vehicleModel: jStr(j['vehicle_model']),
        createdAt: jStr(j['created_at']),
        places: jMaps(j['places']).map((p) => jPick(p, ['place_name', 'city'])).where((s) => s.isNotEmpty).toList(),
        hotels: jMaps(j['hotels']).map((h) => jPick(h, ['hotel_name', 'name'])).where((s) => s.isNotEmpty).toList(),
        stations: jMaps(j['stations']).map(ItineraryStep.fromJson).toList(),
      );
}

class AppNotification {
  final String id;
  final String type;
  final String title;
  final String body;
  final bool read;
  final String time;

  AppNotification({
    required this.id,
    required this.type,
    required this.title,
    required this.body,
    required this.read,
    required this.time,
  });

  AppNotification copyWith({bool? read}) =>
      AppNotification(id: id, type: type, title: title, body: body, read: read ?? this.read, time: time);

  factory AppNotification.fromJson(Map<String, dynamic> j) => AppNotification(
        id: jStr(j['id']),
        type: jStr(j['type']),
        title: jStr(j['title']),
        body: jStr(j['body']),
        read: jBool(j['read']),
        time: jPick(j, ['time', 'created_at']),
      );
}

// --- Guide dashboard ---

class Passenger {
  final String bookingId;
  final String name;
  final String phone;
  final int seats;
  final String tripDate;
  final String status;
  final bool attended;
  final bool paid;

  Passenger({
    required this.bookingId,
    required this.name,
    this.phone = '',
    this.seats = 0,
    this.tripDate = '',
    this.status = '',
    this.attended = false,
    this.paid = false,
  });

  bool get isCancelled => status.startsWith('ملغ');

  factory Passenger.fromJson(Map<String, dynamic> j) {
    final t = jMap(j['tourist']);
    return Passenger(
      bookingId: jPick(j, ['booking_daily_id', 'booking_weekly_id']),
      name: jStr(t['full_name']),
      phone: jStr(t['phone_number']),
      seats: jInt(j['number_of_seats']),
      tripDate: jDate(j['trip_date']),
      status: jStr(j['booking_status']),
      attended: jBool(j['attended']),
      paid: jStr(j['payment_status']) == 'paid',
    );
  }
}

/// A daily, weekly or private trip assigned to the signed-in guide.
class GuideTrip {
  final String id;
  final String kind; // 'daily' | 'weekly' | 'private'
  final String title;
  final String approvalStatus;
  final bool isActive;
  final String departureCity;
  final String startDate;
  final String endDate;
  final int durationDays;
  final List<String> days;
  final int maxCapacity;
  final List<String> places;
  final List<ItineraryStep> stations;
  final List<Passenger> passengers;
  final String vehicle;
  final String driverName;
  final String driverPhone;
  final String touristName;
  final String touristPhone;
  final int companions;
  final String requirements;
  final String photo;

  /// Pictures of the trip's landmarks (the header slideshow, as on Delni).
  final List<String> placePhotos;
  final double quotedPrice;

  GuideTrip({
    required this.id,
    required this.kind,
    required this.title,
    this.approvalStatus = '',
    this.isActive = true,
    this.departureCity = '',
    this.startDate = '',
    this.endDate = '',
    this.durationDays = 0,
    this.days = const [],
    this.maxCapacity = 0,
    this.places = const [],
    this.stations = const [],
    this.passengers = const [],
    this.vehicle = '',
    this.driverName = '',
    this.driverPhone = '',
    this.touristName = '',
    this.touristPhone = '',
    this.companions = 0,
    this.requirements = '',
    this.photo = '',
    this.placePhotos = const [],
    this.quotedPrice = 0,
  });

  /// Photos for this trip: its landmarks first, then its own photo.
  List<String> get photos => [...placePhotos, if (photo.isNotEmpty) photo];

  static const pending = 'بانتظار رد المرشد';
  static const approved = 'وافق المرشد';
  static const declined = 'اعتذر المرشد';

  bool get awaitsGuide => approvalStatus == pending;
  int get bookedSeats => passengers.where((p) => !p.isCancelled).fold(0, (s, p) => s + p.seats);

  factory GuideTrip.fromJson(Map<String, dynamic> j, String kind) {
    final vehicle = jMap(j['vehicle']);
    final driver = jMap(vehicle['driver']);
    final tourist = jMap(j['tourist']);
    final isPrivate = kind == 'private';
    return GuideTrip(
      id: jPick(j, ['daily_trip_id', 'weekly_trip_id', 'private_trip_id']),
      kind: kind,
      title: isPrivate ? '' : jStr(j['trip_title']),
      approvalStatus: jStr(isPrivate ? j['status_order'] : j['guide_approval_status']),
      isActive: isPrivate ? true : jBool(j['is_active']),
      departureCity: jStr(j['departure_city']),
      startDate: jDate(j['start_date'] ?? j['preferred_start_date']),
      endDate: jDate(j['end_date']),
      durationDays: jInt(j['duration_days']),
      days: jMaps(j['days']).map((d) => jStr(d['day_of_week'])).where((s) => s.isNotEmpty).toList(),
      maxCapacity: jInt(j['max_capacity']),
      places: jMaps(j['places']).map((p) => jPick(p, ['city', 'place_name'])).where((s) => s.isNotEmpty).toList(),
      stations: jMaps(j['stations']).map(ItineraryStep.fromJson).toList(),
      passengers: jMaps(j['bookings']).map(Passenger.fromJson).toList(),
      vehicle: [jStr(vehicle['vehicle_type']), jStr(vehicle['plate_number'])].where((s) => s.isNotEmpty).join(' • '),
      driverName: jStr(driver['full_name']),
      driverPhone: jStr(driver['phone_number']),
      touristName: jStr(tourist['full_name']),
      touristPhone: jStr(tourist['phone_number']),
      companions: jInt(j['number_of_companions']),
      requirements: jStr(j['customer_requirements']),
      photo: jStr(j['photo_1']),
      placePhotos: jMaps(j['places']).map((p) => jStr(p['place_image'])).where((s) => s.isNotEmpty).toList(),
      quotedPrice: jDouble(j['quoted_price']),
    );
  }
}

class GuideDashboard {
  final Guide guide;
  final String licenseExpiry;
  final List<GuideTrip> trips;

  GuideDashboard({required this.guide, required this.licenseExpiry, required this.trips});

  int get pendingCount => trips.where((t) => t.awaitsGuide).length;
  int get passengersCount =>
      trips.expand((t) => t.passengers).where((p) => !p.isCancelled).fold(0, (s, p) => s + p.seats);

  factory GuideDashboard.fromJson(Map<String, dynamic> j) {
    final g = jMap(j['guide']);
    return GuideDashboard(
      guide: Guide.fromJson(g),
      licenseExpiry: jDate(g['license_expiry_date']),
      trips: [
        ...jMaps(j['daily_trips']).map((t) => GuideTrip.fromJson(t, 'daily')),
        ...jMaps(j['weekly_trips']).map((t) => GuideTrip.fromJson(t, 'weekly')),
        ...jMaps(j['private_trips']).map((t) => GuideTrip.fromJson(t, 'private')),
      ],
    );
  }
}

// --- Driver dashboard ---

class DriverTrip {
  final String id;
  final String kind; // Arabic label sent by the server: يومية / أسبوعية / خاصة
  final String title;
  final String schedule;
  final String departureCity;
  final int passengers;

  /// First and last day of the run the stages apply to (Y-m-d; a daily trip's next run day).
  final String startDate;
  final String endDate;

  final List<String> photos;
  final List<TripPlace> places;
  final List<ItineraryStep> stations;
  final String guideName;
  final String guidePhone;

  DriverTrip({
    required this.id,
    required this.kind,
    required this.title,
    this.schedule = '',
    this.departureCity = '',
    this.passengers = 0,
    this.startDate = '',
    this.endDate = '',
    this.photos = const [],
    this.places = const [],
    this.stations = const [],
    this.guideName = '',
    this.guidePhone = '',
  });

  /// The landmarks' pictures first, then the trip's own photos (the header slideshow).
  List<String> get allPhotos => [...places.map((p) => p.image).where((s) => s.isNotEmpty), ...photos];

  DateTime? get start => DateTime.tryParse(startDate);
  DateTime? get end => DateTime.tryParse(endDate.isEmpty ? startDate : endDate);

  /// Today is one of the trip's days: the stage buttons work only then.
  bool get runsToday {
    final s = start, e = end;
    if (s == null || e == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    return !today.isBefore(DateTime(s.year, s.month, s.day)) && !today.isAfter(DateTime(e.year, e.month, e.day));
  }

  /// Whole days until the trip starts (0 = today or already running, -1 = unknown).
  int get daysUntilStart {
    final s = start;
    if (s == null) return -1;
    final now = DateTime.now();
    final d = DateTime(s.year, s.month, s.day).difference(DateTime(now.year, now.month, now.day)).inDays;
    return d < 0 ? 0 : d;
  }

  factory DriverTrip.fromJson(Map<String, dynamic> j) => DriverTrip(
        id: jStr(j['id']),
        kind: jStr(j['kind']),
        title: jStr(j['title']),
        schedule: jStr(j['schedule']),
        departureCity: jStr(j['departure_city']),
        passengers: jInt(j['passengers']),
        startDate: jDate(j['start_date']),
        endDate: jDate(j['end_date']),
        photos: jStrings(j['photos']),
        places: jMaps(j['places'])
            .map((p) => TripPlace(id: '', name: jPick(p, ['place_name', 'city']), city: jStr(p['city']), image: jStr(p['place_image'])))
            .where((p) => p.name.isNotEmpty)
            .toList(),
        stations: jMaps(j['stations']).map(ItineraryStep.fromJson).toList(),
        guideName: jStr(jMap(j['guide'])['full_name']),
        guidePhone: jStr(jMap(j['guide'])['phone_number']),
      );
}

class DriverDashboard {
  final String licenseNumber;
  final String name;
  final String phone;
  final String email;
  final String companyName;
  final String licenseValidUntil;
  final String operationalStatus;
  final String currentStage;
  final String vehiclePlate;
  final String vehicleType;
  final int vehicleSeats;
  final String vehicleStatus;
  final String vehicleImage;
  final String vehicleCategory;
  final double vehicleDailyRate;
  final String companyPhone;
  final bool hasVehicle;
  final List<DriverTrip> trips;

  DriverDashboard({
    required this.licenseNumber,
    required this.name,
    this.phone = '',
    this.email = '',
    this.companyName = '',
    this.licenseValidUntil = '',
    this.operationalStatus = '',
    this.currentStage = '',
    this.vehiclePlate = '',
    this.vehicleType = '',
    this.vehicleSeats = 0,
    this.vehicleStatus = '',
    this.vehicleImage = '',
    this.vehicleCategory = '',
    this.vehicleDailyRate = 0,
    this.companyPhone = '',
    this.hasVehicle = false,
    this.trips = const [],
  });

  /// Stages accepted by POST /transport/drivers/{license}/trip-stage (Driver::TRIP_STAGES).
  static const stages = ['في الانتظار', 'تم الانطلاق', 'في الطريق - استراحة', 'وصلنا الوجهة', 'مكتملة'];

  /// Stage => the stages that may follow it (Driver::STAGE_TRANSITIONS on the server): a rest or the destination can
  /// lead back to driving, and a completed trip starts over.
  static const stageTransitions = {
    'في الانتظار': ['تم الانطلاق'],
    'تم الانطلاق': ['في الطريق - استراحة', 'وصلنا الوجهة'],
    'في الطريق - استراحة': ['تم الانطلاق', 'وصلنا الوجهة'],
    'وصلنا الوجهة': ['تم الانطلاق', 'مكتملة'],
    'مكتملة': ['في الانتظار'],
  };

  factory DriverDashboard.fromJson(Map<String, dynamic> j) {
    final d = jMap(j['driver']);
    final v = jMap(j['vehicle']);
    return DriverDashboard(
      licenseNumber: jStr(d['driver_license_number']),
      name: jStr(d['full_name']),
      phone: jStr(d['phone_number']),
      email: jStr(d['email']),
      companyName: jStr(d['company_name']),
      licenseValidUntil: jDate(d['license_date_valid']),
      operationalStatus: jStr(d['operational_status']),
      currentStage: jStr(d['current_trip_stage']),
      vehiclePlate: jStr(v['plate_number']),
      vehicleType: jStr(v['vehicle_type']),
      vehicleSeats: jInt(v['seating_capacity']),
      vehicleStatus: jStr(v['vehicle_status']),
      vehicleImage: jStr(v['vehicle_image']),
      vehicleCategory: jStr(v['category']),
      vehicleDailyRate: jDouble(v['daily_rate']),
      companyPhone: jStr(d['company_phone']),
      hasVehicle: v.isNotEmpty,
      trips: jMaps(j['trips']).map(DriverTrip.fromJson).toList(),
    );
  }
}

// --- Session ---

class UserSession {
  final String role; // 'tourist', 'guide', 'driver'
  final String name;
  final String email;
  final String phone;
  final String? identifier; // tourist_id, license_number or driver_license_number
  final String? token;
  final bool isGuest;

  UserSession({
    required this.role,
    required this.name,
    this.email = '',
    this.phone = '',
    this.identifier,
    this.token,
    this.isGuest = false,
  });

  bool get isTourist => role == 'tourist' && !isGuest;

  UserSession copyWith({String? name, String? email, String? phone}) => UserSession(
        role: role,
        name: name ?? this.name,
        email: email ?? this.email,
        phone: phone ?? this.phone,
        identifier: identifier,
        token: token,
        isGuest: isGuest,
      );
}

class AuthResult {
  final bool success;
  final String message;
  final UserSession? session;

  AuthResult({
    required this.success,
    required this.message,
    this.session,
  });
}


/// A private trip's "customer_requirements" keeps the tourist's words and the admin's notes together
/// ("need - need - ملاحظات الإدارة: note"). Older requests also carried the stations as JSON there; that is never shown.
({List<String> needs, List<String> adminNotes}) splitTripNotes(String raw) {
  final text = raw.replaceAll(RegExp(r'ملاحظات الإدارة:\s*[\[{][\s\S]*[\]}]'), ' ');
  bool looksLikeData(String x) => RegExp(r'^[\[{]|[\]}]$|"\s*:|\{"').hasMatch(x);
  final parts = <String>[];
  for (final x in text.split(RegExp(r'\s+-\s+'))) {
    final t = x.trim();
    if (t.isNotEmpty && !looksLikeData(t) && !parts.contains(t)) parts.add(t);
  }
  bool isAdmin(String x) => x.startsWith('ملاحظات الإدارة');
  return (
    needs: parts.where((x) => !isAdmin(x)).toList(),
    adminNotes: parts.where(isAdmin).map((x) => x.replaceFirst(RegExp(r'^ملاحظات الإدارة:?\s*'), '')).where((x) => x.isNotEmpty).toList(),
  );
}
