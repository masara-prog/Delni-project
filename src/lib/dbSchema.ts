/**
 * DelniDB TypeScript Interfaces & Types
 * Corresponds 1:1 with SQL Server Schema for DelniDB
 */

/* =========================================================
   3. السياح (Tourists)
   ========================================================= */
export interface Tourist {
  tourist_id: string; // VARCHAR(50) PRIMARY KEY
  full_name: string; // VARCHAR(100)
  email: string; // VARCHAR(100) UNIQUE
  phone_number: string; // VARCHAR(20) UNIQUE
  password?: string; // VARCHAR(255)
}

/* =========================================================
   4. المرشدون السياحيون (Tour Guides)
   ========================================================= */
export interface TourGuide {
  license_number: string; // VARCHAR(50) PRIMARY KEY
  full_name: string; // VARCHAR(150)
  phone_number: string; // VARCHAR(20) UNIQUE
  years_of_experience: number; // INT (CHECK >= 2)
  bio?: string | null; // NVARCHAR(MAX) NULL
  speaks_english: boolean; // BIT DEFAULT 0
  speaks_french: boolean; // BIT DEFAULT 0
  speaks_italian: boolean; // BIT DEFAULT 0
  verification_status: "موثق" | "بانتظار التوثيق" | "قيد المراجعة" | "مرفوض"; // NVARCHAR(50)
  password?: string; // VARCHAR(255)
  email: string; // VARCHAR(100) UNIQUE
  gender?: "male" | "female" | string | null; // VARCHAR(10)
  price_per_day?: number | null; // DECIMAL(10,2)
  avatar?: string | null; // NVARCHAR(MAX)
  digital_certificate_file?: string | null; // NVARCHAR(MAX)
  total_tours_completed?: number; // INT DEFAULT 0
  // Deprecated/Virtual helpers:
  title?: string | null;
  certificate?: string;
  certificate_name?: string | null;
  primaryRegion?: string | null;
  specialties?: string | null;
  operating_regions?: string | null | string[];
  working_days?: string | null | string[];
}

export interface GuideOperatingRegion {
  license_number: string; // VARCHAR(50) PK, FK -> TourGuides
  region: string; // NVARCHAR(100) PK
}

export interface GuideWorkingDay {
  license_number: string; // VARCHAR(50) PK, FK -> TourGuides
  day_of_week: string; // NVARCHAR(50) PK
}

/* =========================================================
   5. شركات النقل (Transportation Companies)
   ========================================================= */
export interface TransportationCompany {
  contract_number: string; // VARCHAR(50) PRIMARY KEY
  company_name: string; // VARCHAR(100)
  phone_number: string; // VARCHAR(20) UNIQUE
  address: string; // VARCHAR(150)
  total_vehicles: number; // INT (CHECK >= 0)
  verification_status: "موثق" | "بانتظار" | "مرفوض"; // VARCHAR(20)
  email?: string | null; // VARCHAR(100)
  password?: string | null; // VARCHAR(255)
  city?: string | null; // VARCHAR(50)
  contract_start_date?: string | null; // DATE
  contract_end_date?: string | null; // DATE
}

/* =========================================================
   6. السيارات (Vehicles)
   ========================================================= */
export interface Vehicle {
  plate_number: string; // VARCHAR(30) PRIMARY KEY
  vehicle_type: string; // VARCHAR(50)
  seating_capacity: number; // INT (CHECK > 0)
  vehicle_status: "جاهزة" | "في رحلة" | "صيانة" | "خارج الخدمة"; // VARCHAR(20)
  contract_number: string; // VARCHAR(50) FK -> TransportationCompanies
  daily_rate?: number | null; // DECIMAL(10,2)
  category?: string | null; // VARCHAR(50)
  insurance_image?: string | null; // VARCHAR(255) - وثيقة التأمين للمراجعة والفحص
  company_name?: string; // Virtual join field for convenience
  status?: string | null;
  // Deprecated/virtual fallback fields
  vehicle_image?: string | null;
  insurance_details?: string | null;
}

/* =========================================================
   7. السائقون (Drivers)
   ========================================================= */
export interface Driver {
  driver_license_number: string; // VARCHAR(50) PRIMARY KEY
  full_name: string; // VARCHAR(100)
  phone_number: string; // VARCHAR(20) UNIQUE
  national_id_or_passport: string; // VARCHAR(50) UNIQUE
  license_date_valid: string; // DATE
  contract_number: string; // VARCHAR(50) FK -> TransportationCompanies
  assigned_vehicle_plate?: string | null; // VARCHAR(30) UNIQUE NULL FK -> Vehicles
  email: string; // VARCHAR(100) UNIQUE
  account_status: "نشط" | "معلق" | "موقوف"; // VARCHAR(20)
  password?: string; // VARCHAR(255)
  operational_status?: "متاح" | "في رحلة" | "إجازة" | null; // VARCHAR(20)
  driver_photo?: string | null; // VARCHAR(255)
  company_name?: string; // Virtual join field
}

/* =========================================================
   8. الأماكن السياحية (Places Tourist)
   ========================================================= */
export interface PlaceTourist {
  place_id: string; // VARCHAR(50) PRIMARY KEY
  place_name: string; // VARCHAR(100)
  description: string; // NVARCHAR(MAX)
  city: string; // VARCHAR(100)
  region?: string | null; // NVARCHAR(100)
  longitude: number; // DECIMAL(10,6)
  latitude: number; // DECIMAL(10,6)
  category: string; // VARCHAR(100)
  highlights?: string | null; // NVARCHAR(MAX)
  place_image?: string | null; // NVARCHAR(MAX)
  google_maps_url?: string | null; // VARCHAR(500)
  visitors_count?: number; // Virtual tracking counter
}

/* =========================================================
   9. الفنادق (Hotels)
   ========================================================= */
export interface Hotel {
  hotel_id: string; // VARCHAR(50) PRIMARY KEY
  hotel_name: string; // VARCHAR(200)
  city: string; // VARCHAR(100)
  address_details: string; // VARCHAR(500)
  phone_number: string; // VARCHAR(20)
  star_rating: number; // INT (CHECK BETWEEN 1 AND 5)
  partnership_status: "نشط" | "معلق" | "موقوف" | string; // VARCHAR(100)
  hotel_photo_1?: string | null; // NVARCHAR(MAX)
  hotel_photo_2?: string | null; // NVARCHAR(MAX)
  hotel_photo_3?: string | null; // NVARCHAR(MAX)
  hotel_photo_4?: string | null; // NVARCHAR(MAX)
  hotel_photo_5?: string | null; // NVARCHAR(MAX)
  property_type?: string | null; // VARCHAR(100)
  google_maps_url?: string | null; // VARCHAR(500)
  description?: string | null; // NVARCHAR(MAX)
  working_hours?: string | null; // VARCHAR(150)
  discount_percentage?: number | null; // INT
  contract_start_date?: string | null; // VARCHAR(50)
  contract_end_date?: string | null; // VARCHAR(50)
  // Virtual / helper fields
  id?: string;
  name?: string;
  address?: string;
  phone?: string;
  stars?: number;
  bookings_count?: number;
  rating_avg?: number;
  reviews_count?: number;
  amenities?: string[] | string | null;
  whatsapp?: string | null;
}

export interface HotelAmenity {
  hotel_id: string; // VARCHAR(50) PK, FK -> Hotels
  amenity: string; // NVARCHAR(100) PK
}

/* =========================================================
   10. المطاعم والمقاهي (Restaurants & Cafes)
   ========================================================= */
export interface RestaurantCafe {
  facility_id: string; // VARCHAR(50) PRIMARY KEY
  facility_name: string; // VARCHAR(200)
  facility_type: string; // VARCHAR(100)
  city: string; // VARCHAR(100)
  address_details: string; // VARCHAR(500)
  phone_number?: string | null; // VARCHAR(20)
  description?: string | null; // NVARCHAR(MAX)
  facility_image_1?: string | null; // NVARCHAR(MAX)
  facility_image_2?: string | null; // NVARCHAR(MAX)
  facility_image_3?: string | null; // NVARCHAR(MAX)
  facility_image_4?: string | null; // NVARCHAR(MAX)
  facility_image_5?: string | null; // NVARCHAR(MAX)
  working_hours?: string | null; // VARCHAR(100)
  google_maps_url?: string | null; // VARCHAR(500)
  discount_percentage?: number | null; // INT
  contract_start_date?: string | null; // VARCHAR(50)
  contract_end_date?: string | null; // VARCHAR(50)
  partnership_status?: "نشط" | "معلق" | "موقوف" | string; // VARCHAR(50) DEFAULT 'نشط'
  // Normalized features and virtual / helper fields
  features?: string[] | string | null;
  whatsapp?: string | null; // Deprecated fallback
  contract_date?: string | null; // Deprecated fallback
  verification_status?: string | null; // Deprecated fallback
  rating_avg?: number; // Virtual stat
  reviews_count?: number; // Virtual stat
}

export interface RestaurantFeature {
  facility_id: string; // VARCHAR(50) PK, FK -> RestaurantsCafes
  feature: string; // NVARCHAR(100) PK
}

/* =========================================================
   11. الرحلات اليومية (Daily Trips)
   ========================================================= */
export interface DailyTrip {
  daily_trip_id: string; // VARCHAR(50) PRIMARY KEY
  trip_title: string; // VARCHAR(150)
  description: string; // TEXT
  price_per_seat: number; // DECIMAL(10,2) (CHECK > 0)
  is_active: boolean; // BIT DEFAULT 1
  photo_1?: string | null;
  photo_2?: string | null;
  photo_3?: string | null;
  photo_4?: string | null;
  photo_5?: string | null;
  max_capacity: number; // INT (CHECK > 0)
  available_seats: number; // INT (CHECK >= 0 AND <= max_capacity)
  guide_license_number: string; // VARCHAR(50) FK -> TourGuides
  departure_city?: string | null; // VARCHAR(50)
  vehicle_plate?: string | null; // VARCHAR(30) FK -> Vehicles
  restaurant_id?: string | null; // VARCHAR(50) FK -> RestaurantsCafes
  recurring_days?: string | null;
  activities?: string | null;
  // Virtual / helper fields
  bookings_count?: number;
  rating_avg?: number;
  assigned_vehicle_plates?: string[];
}

/* =========================================================
   12. الرحلات الأسبوعية (Weekly Trips)
   ========================================================= */
export interface WeeklyTrip {
  weekly_trip_id: string; // VARCHAR(50) PRIMARY KEY
  trip_title: string; // VARCHAR(150)
  start_date: string; // DATE
  end_date: string; // DATE
  max_capacity: number; // INT (CHECK > 0)
  available_seats: number; // INT (CHECK >= 0 AND <= max_capacity)
  seat_per_price: number; // DECIMAL(10,2) (CHECK > 0)
  trip_description: string; // TEXT
  guide_license_number: string; // VARCHAR(50) FK -> TourGuides
  is_active: boolean; // BIT DEFAULT 1
  departure_city?: string | null; // VARCHAR(50)
  destination_region?: string | null; // VARCHAR(100)
  photo?: string | null; // VARCHAR(255)
  gallery?: string | null; // NVARCHAR(MAX)
  // Virtual / helper fields
  bookings_count?: number;
  rating_avg?: number;
  assigned_vehicle_plates?: string[];
  weekly_day?: string;
  hotel_ids?: string[];
  place_ids?: string[];
}

/* =========================================================
   13. الرحلات الخاصة (Private Trips)
   ========================================================= */
export interface PrivateTripStation {
  station_id: string; // VARCHAR(50) PRIMARY KEY
  private_trip_id: string; // VARCHAR(50) FK -> PrivateTrips
  day_number: number; // INT (DEFAULT 1)
  station_order: number; // INT (DEFAULT 1)
  station_title: string; // NVARCHAR(200)
  station_time?: string | null; // VARCHAR(30)
  station_desc?: string | null; // NVARCHAR(MAX)
}

export interface PrivateTrip {
  private_trip_id: string; // VARCHAR(50) PRIMARY KEY
  status_order: "قيد الدراسة" | "بانتظار موافقة السائح" | "مؤكدة" | "مرفوضة من الأدمن" | "مرفوضة من السائح" | "ملغية" | string;
  preferred_start_date: string; // DATE (at least 10 days in future)
  duration_days: number; // INT (CHECK > 0)
  number_of_companions: number; // INT (CHECK >= 0)
  quoted_price?: number | null; // DECIMAL(10,2) NULL
  guide_license_number?: string | null; // VARCHAR(50) NULL FK -> TourGuides
  tourist_id: string; // VARCHAR(50) FK -> Tourists (Mandatory)
  customer_requirements?: string | null; // NVARCHAR(MAX)
  vehicle_plate?: string | null; // VARCHAR(30) NULL FK -> Vehicles
  created_at?: string; // DATETIME
  // Joined / Virtual Fields from Tourists
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  customer_description?: string; // Backwards-compatible alias for customer_requirements
  assigned_vehicle?: string | null; // Alias for vehicle_plate
  assigned_vehicle_plate?: string | null;
  guide_name?: string | null;
  guide_phone?: string | null;
  // Relational Child Collections
  places?: Array<{
    place_id: string;
    place_name: string;
    city?: string;
    region?: string;
    category?: string;
    place_image?: string;
    visit_order?: number;
  }>;
  place_ids?: string[];
  hotels?: Array<{
    hotel_id: string;
    hotel_name: string;
    city?: string;
    star_rating?: number;
    price_per_night?: number;
    photo_url?: string;
  }>;
  additional_expenses?: number | null;
  admin_itinerary_plan?: string | null;
  vehicle_model?: string | null;
  vehicle_capacity?: number | null;
  vehicle_daily_rate?: number | null;
  vehicle_image?: string | null;
  vehicle_status?: string | null;
  transport_company_name?: string | null;
  transport_company_phone?: string | null;
  stations?: PrivateTripStation[];
}

/* =========================================================
   14. عروض الرحلات اليومية (Offers Daily Trips)
   ========================================================= */
export interface OfferDailyTrip {
  offer_daily_id: string; // VARCHAR(50) PRIMARY KEY
  daily_trip_id: string; // VARCHAR(50) FK -> DailyTrips
  offer_title: string; // VARCHAR(100)
  description: string; // TEXT
  percent_discount: number; // DECIMAL(5,2) (CHECK 0..100)
  offer_image_url?: string | null; // VARCHAR(255)
  start_date: string; // DATE
  end_date: string; // DATE
  badge?: string | null; // VARCHAR(50)
}

/* =========================================================
   15. عروض الرحلات الأسبوعية (Offers Weekly Trips)
   ========================================================= */
export interface OfferWeeklyTrip {
  offer_weekly_id: string; // VARCHAR(50) PRIMARY KEY
  weekly_trip_id: string; // VARCHAR(50) FK -> WeeklyTrips
  offer_title: string; // VARCHAR(100)
  description: string; // TEXT
  discount_percentage: number; // DECIMAL(5,2) (CHECK 0..100)
  offer_image_url: string; // VARCHAR(255) NOT NULL
  start_date: string; // DATE
  end_date: string; // DATE
  badge?: string | null; // VARCHAR(50)
}

/* =========================================================
   16. عروض الفنادق (Offers Hotels)
   ========================================================= */
export interface OfferHotel {
  id_offer: string; // VARCHAR(50) PRIMARY KEY
  title_offer: string; // VARCHAR(100)
  description: string; // TEXT
  percent_discount: number; // INT (CHECK 0..100)
  offer_image: string; // VARCHAR(255)
  hotel_id: string; // VARCHAR(50) FK -> Hotels
  date_start: string; // DATE
  date_end: string; // DATE
  badge?: string | null; // VARCHAR(50)
}

/* =========================================================
   17. عروض المطاعم والمقاهي (Offers Facilities)
   ========================================================= */
export interface OfferFacility {
  facility_offer_id: string; // VARCHAR(50) PRIMARY KEY
  facility_id: string; // VARCHAR(50) FK -> RestaurantsCafes
  description: string; // TEXT
  offer_title: string; // VARCHAR(100)
  offer_image_url: string; // VARCHAR(255)
  discount_percentage: number; // DECIMAL(5,2) (CHECK 0..100)
  start_date: string; // DATE
  end_date: string; // DATE
  badge?: string | null; // VARCHAR(50)
}

// Note: Multi-vehicle trip allocation tables (daily_trip_vehicles, weekly_trip_vehicles, private_trip_vehicles) were removed as each trip directly assigns single vehicles.

/* =========================================================
   21, 22. الحجوزات (Bookings)
   ========================================================= */
export interface BookingDaily {
  booking_daily_id: string; // VARCHAR(50) PRIMARY KEY
  tourist_id: string; // VARCHAR(50) FK
  daily_trip_id: string; // VARCHAR(50) FK
  booking_date: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  number_of_seats: number; // INT (CHECK > 0)
  booking_status: "مؤكدة" | "بانتظار التأكيد" | "ملغية"; // VARCHAR(20)
  total_price: number; // DECIMAL(10,2) (CHECK >= 0)
  payment_status: "paid" | "unpaid" | "cash_at_office"; // VARCHAR(20) DEFAULT 'unpaid'
  attended: boolean; // BIT DEFAULT 0
}

export interface BookingWeekly {
  booking_weekly_id: string; // VARCHAR(50) PRIMARY KEY
  tourist_id: string; // VARCHAR(50) FK
  weekly_trip_id: string; // VARCHAR(50) FK
  booking_date: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  number_of_seats: number; // INT (CHECK > 0)
  total_price: number; // DECIMAL(10,2) (CHECK >= 0)
  booking_status: "مؤكدة" | "بانتظار التأكيد" | "ملغية"; // VARCHAR(20)
  payment_status: "paid" | "unpaid" | "cash_at_office"; // VARCHAR(20) DEFAULT 'unpaid'
  attended: boolean; // BIT DEFAULT 0
}

/* =========================================================
   23, 24. ربط الفنادق والمعالم بالرحلات الأسبوعية
   ========================================================= */
export interface HotelTripWeekly {
  hotel_id: string; // FK
  weekly_trip_id: string; // FK
}

export interface PlaceTripWeekly {
  place_id: string; // FK
  weekly_trip_id: string; // FK
}

/* =========================================================
   25, 26, 27, 28. التقييمات (Reviews)
   ========================================================= */
export interface ReviewDailyTrip {
  review_daily_id: string; // VARCHAR(50) PRIMARY KEY
  tourist_id: string; // VARCHAR(50) FK
  daily_trip_id: string; // VARCHAR(50) FK
  stars_rating: number; // INT (CHECK 1..5)
  comment_text?: string | null; // TEXT NULL
  created_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  // Join helpers
  tourist_name?: string;
  trip_title?: string;
}

export interface ReviewWeeklyTrip {
  review_weekly_id: string; // VARCHAR(50) PRIMARY KEY
  tourist_id: string; // VARCHAR(50) FK
  weekly_trip_id: string; // VARCHAR(50) FK
  stars_rating: number; // INT (CHECK 1..5)
  comment_text?: string | null; // TEXT NULL
  created_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  tourist_name?: string;
  trip_title?: string;
}

export interface ReviewHotel {
  review_hotel_id: string; // VARCHAR(50) PRIMARY KEY
  tourist_id: string; // VARCHAR(50) FK
  hotel_id: string; // VARCHAR(50) FK
  stars_rating: number; // INT (CHECK 1..5)
  comment_text?: string | null; // TEXT NULL
  created_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  tourist_name?: string;
  hotel_name?: string;
}

export interface ReviewFacility {
  review_facility_id: string; // VARCHAR(50) PRIMARY KEY
  tourist_id: string; // VARCHAR(50) FK
  facility_id: string; // VARCHAR(50) FK
  stars_rating: number; // INT (CHECK 1..5)
  comment_text?: string | null; // TEXT NULL
  created_at: string; // DATETIME DEFAULT CURRENT_TIMESTAMP
  tourist_name?: string;
  facility_name?: string;
}
