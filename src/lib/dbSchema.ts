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
  full_name: string; // VARCHAR(100)
  phone_number: string; // VARCHAR(20) UNIQUE
  years_of_experience: number; // INT (CHECK >= 2)
  certificate: string; // VARCHAR(255)
  bio?: string | null; // TEXT NULL
  speaks_english: boolean; // BIT DEFAULT 0
  speaks_french: boolean; // BIT DEFAULT 0
  speaks_italian: boolean; // BIT DEFAULT 0
  verification_status: "موثق" | "بانتظار التوثيق" | "مرفوض"; // VARCHAR(20)
  password?: string; // VARCHAR(255)
  email: string; // VARCHAR(100) UNIQUE
  gender?: "male" | "female" | string | null; // VARCHAR(10)
  working_days?: string | null; // NVARCHAR(MAX) (JSON or comma-separated)
  operating_regions?: string | null; // NVARCHAR(MAX) (JSON or comma-separated)
  primaryRegion?: string | null; // VARCHAR(50)
  price_per_day?: number | null; // DECIMAL(10,2)
  avatar?: string | null; // VARCHAR(255)
  title?: string | null; // VARCHAR(100)
  specialties?: string | null; // NVARCHAR(MAX)
  total_tours_completed: number; // INT DEFAULT 0
  digital_certificate_file?: string; // Supporting document attachment
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
  contract_date?: string | null; // DATE
  email?: string | null; // VARCHAR(100)
  password?: string | null; // VARCHAR(255)
  city?: string | null; // VARCHAR(50)
  available_vehicles?: number | null; // INT
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
  vehicle_image?: string | null; // VARCHAR(255)
  vehicle_status: "جاهزة" | "في رحلة" | "صيانة" | "خارج الخدمة"; // VARCHAR(20)
  insurance_details?: string | null; // TEXT
  contract_number: string; // VARCHAR(50) FK -> TransportationCompanies
  daily_rate?: number | null; // DECIMAL(10,2)
  category?: string | null; // VARCHAR(50)
  photos?: string | null; // NVARCHAR(MAX)
  insurance_image?: string | null; // VARCHAR(255)
  company_name?: string; // Virtual join field for convenience
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
  experience_years?: number | null; // INT
  driver_photo?: string | null; // VARCHAR(255)
  company_name?: string; // Virtual join field
}

/* =========================================================
   8. الأماكن السياحية (Places Tourist)
   ========================================================= */
export interface PlaceTourist {
  place_id: string; // VARCHAR(50) PRIMARY KEY
  place_name: string; // VARCHAR(100)
  description: string; // TEXT
  city: string; // VARCHAR(50)
  longitude: number; // DECIMAL(9,6)
  latitude: number; // DECIMAL(9,6)
  category: string; // VARCHAR(50)
  place_image?: string | null; // VARCHAR(255)
  is_unesco: boolean; // BIT DEFAULT 0
  unesco_year?: number | null; // INT
  gallery?: string | null; // NVARCHAR(MAX)
  entry_fee?: string | null; // VARCHAR(50)
  google_maps_url?: string | null; // VARCHAR(500)
  visitors_count?: number; // Virtual tracking counter
}

/* =========================================================
   9. الفنادق (Hotels)
   ========================================================= */
export interface Hotel {
  hotel_id: string; // VARCHAR(50) PRIMARY KEY
  hotel_name: string; // VARCHAR(100)
  city: string; // VARCHAR(50)
  address_details: string; // VARCHAR(255)
  phone_number: string; // VARCHAR(20)
  star_rating: number; // INT (CHECK BETWEEN 1 AND 5)
  partnership_status: "نشط" | "معلق" | "موقوف"; // VARCHAR(20)
  hotel_photo_1?: string | null; // VARCHAR(255)
  hotel_photo_2?: string | null; // VARCHAR(255)
  hotel_photo_3?: string | null; // VARCHAR(255)
  hotel_photo_4?: string | null; // VARCHAR(255)
  hotel_photo_5?: string | null; // VARCHAR(255)
  contract_date?: string | null; // DATE
  verification_status?: string | null; // VARCHAR(20)
  property_type?: string | null; // VARCHAR(50)
  amenities?: string | null; // NVARCHAR(MAX)
  bookings_count?: number; // Virtual stat
  rating_avg?: number; // Virtual stat
}

/* =========================================================
   10. المطاعم والمقاهي (Restaurants & Cafes)
   ========================================================= */
export interface RestaurantCafe {
  facility_id: string; // VARCHAR(50) PRIMARY KEY
  facility_name: string; // VARCHAR(100)
  facility_type: string; // VARCHAR(50)
  city: string; // VARCHAR(50)
  address_details: string; // VARCHAR(255)
  phone_number?: string | null; // VARCHAR(20)
  description?: string | null; // TEXT
  facility_image_1?: string | null; // VARCHAR(255)
  facility_image_2?: string | null; // VARCHAR(255)
  facility_image_3?: string | null; // VARCHAR(255)
  facility_image_4?: string | null; // VARCHAR(255)
  facility_image_5?: string | null; // VARCHAR(255)
  contract_date?: string | null; // DATE
  verification_status?: string | null; // VARCHAR(20)
  working_hours?: string | null; // VARCHAR(100)
  features?: string | null; // NVARCHAR(MAX)
  rating_avg?: number; // Virtual stat
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
  photo?: string | null; // VARCHAR(255)
  max_capacity: number; // INT (CHECK > 0)
  available_seats: number; // INT (CHECK >= 0 AND <= max_capacity)
  guide_license_number: string; // VARCHAR(50) FK -> TourGuides
  departure_city?: string | null; // VARCHAR(50)
  destination_city?: string | null; // VARCHAR(50)
  recurring_days?: string | null; // NVARCHAR(MAX)
  activities?: string | null; // NVARCHAR(MAX)
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
export interface PrivateTrip {
  private_trip_id: string; // VARCHAR(50) PRIMARY KEY
  status_order: "قيد الدراسة" | "مؤكدة" | "مرفوضة من الأدمن" | "ملغية"; // VARCHAR(25)
  customer_description: string; // VARCHAR(100)
  preferred_start_date: string; // DATE
  duration_days: number; // INT (CHECK > 0)
  number_of_companions: number; // INT (CHECK >= 0)
  quoted_price?: number | null; // DECIMAL(10,2) NULL
  admin_itinerary_plan?: string | null; // TEXT NULL
  guide_license_number?: string | null; // VARCHAR(50) NULL FK -> TourGuides
  tourist_id?: string | null; // VARCHAR(50) NULL FK -> Tourists
  customer_name?: string | null; // VARCHAR(100)
  customer_phone?: string | null; // VARCHAR(20)
  customer_requirements?: string | null; // TEXT
  assigned_guide_license?: string | null; // VARCHAR(50) NULL FK -> TourGuides
  assigned_vehicle_plate?: string | null; // VARCHAR(30) NULL FK -> Vehicles
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

/* =========================================================
   18, 19, 20. ربط السيارات بالرحلات (Vehicle Allocations)
   ========================================================= */
export interface DailyTripVehicle {
  daily_alloc_id: string; // VARCHAR(50) PRIMARY KEY
  daily_trip_id: string; // VARCHAR(50) FK
  plate_number: string; // VARCHAR(30) FK
  allocation_date: string; // DATE
  status: string; // VARCHAR(20)
}

export interface WeeklyTripVehicle {
  weekly_alloc_id: string; // VARCHAR(50) PRIMARY KEY
  weekly_trip_id: string; // VARCHAR(50) FK
  plate_number: string; // VARCHAR(30) FK
  start_date: string; // DATE
  end_date: string; // DATE
  status: string; // VARCHAR(20)
}

export interface PrivateTripVehicle {
  private_alloc_id: string; // VARCHAR(50) PRIMARY KEY
  private_trip_id: string; // VARCHAR(50) FK
  plate_number: string; // VARCHAR(30) FK
  start_date: string; // DATE
  end_date: string; // DATE
  allocation_status: string; // VARCHAR(25)
}

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
  booking_notes?: string | null; // TEXT NULL
  passengers_names?: string | null; // NVARCHAR(MAX) NULL
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
  booking_notes?: string | null; // TEXT NULL
  passengers_names?: string | null; // NVARCHAR(MAX) NULL
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
