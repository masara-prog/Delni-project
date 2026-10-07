-- ========================================================
-- Delni Platform Complete Database Schema (MySQL Compatible)
-- منصة دلّني للسياحة الليبية - سكريبت إنشاء جميع الجداول الـ 26 والعلاقات كاملة
-- ========================================================

CREATE DATABASE IF NOT EXISTS `delni_db` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `delni_db`;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. جدول السياح (Tourists)
CREATE TABLE IF NOT EXISTS `tourists` (
    `tourist_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. جدول المرشدين السياحيين (Tour Guides)
CREATE TABLE IF NOT EXISTS `tour_guides` (
    `license_number` VARCHAR(50) NOT NULL PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL UNIQUE,
    `years_of_experience` INT NOT NULL DEFAULT 2,
    `certificate` VARCHAR(255) NOT NULL,
    `bio` TEXT NULL,
    `speaks_english` BOOLEAN NOT NULL DEFAULT FALSE,
    `speaks_french` BOOLEAN NOT NULL DEFAULT FALSE,
    `speaks_italian` BOOLEAN NOT NULL DEFAULT FALSE,
    `verification_status` VARCHAR(20) NOT NULL DEFAULT 'بانتظار التوثيق',
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(100) NOT NULL,
    `gender` VARCHAR(10) NULL,
    `working_days` TEXT NULL,
    `operating_regions` TEXT NULL,
    `primaryRegion` VARCHAR(50) NULL,
    `price_per_day` DECIMAL(10, 2) NULL,
    `avatar` VARCHAR(255) NULL,
    `title` VARCHAR(100) NULL,
    `specialties` TEXT NULL,
    `total_tours_completed` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. جدول شركات النقل (Transportation Companies)
CREATE TABLE IF NOT EXISTS `transportation_companies` (
    `contract_number` VARCHAR(50) NOT NULL PRIMARY KEY,
    `company_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `address` VARCHAR(150) NOT NULL,
    `total_vehicles` INT NOT NULL DEFAULT 0,
    `verification_status` VARCHAR(20) NOT NULL DEFAULT 'بانتظار التوثيق',
    `contract_date` DATE NOT NULL,
    `email` VARCHAR(100) NULL,
    `password` VARCHAR(255) NULL,
    `city` VARCHAR(50) NULL,
    `available_vehicles` INT NULL DEFAULT 0,
    `contract_start_date` DATE NULL,
    `contract_end_date` DATE NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. جدول أسطول المركبات (Vehicles)
CREATE TABLE IF NOT EXISTS `vehicles` (
    `plate_number` VARCHAR(30) NOT NULL PRIMARY KEY,
    `vehicle_type` VARCHAR(50) NOT NULL,
    `seating_capacity` INT NOT NULL,
    `vehicle_image` VARCHAR(255) NULL,
    `vehicle_status` VARCHAR(20) NOT NULL DEFAULT 'جاهزة',
    `insurance_details` TEXT NULL,
    `contract_number` VARCHAR(50) NOT NULL,
    `daily_rate` DECIMAL(10, 2) NULL,
    `category` VARCHAR(50) NULL,
    `features` TEXT NULL,
    `photos` TEXT NULL,
    `insurance_image` VARCHAR(255) NULL,
    CONSTRAINT `fk_vehicles_company` FOREIGN KEY (`contract_number`) REFERENCES `transportation_companies` (`contract_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. جدول السائقين (Drivers)
CREATE TABLE IF NOT EXISTS `drivers` (
    `driver_license_number` VARCHAR(50) NOT NULL PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `national_id_or_passport` VARCHAR(50) NOT NULL,
    `license_date_valid` DATE NOT NULL,
    `contract_number` VARCHAR(50) NOT NULL,
    `assigned_vehicle_plate` VARCHAR(30) NULL,
    `email` VARCHAR(100) NOT NULL,
    `account_status` VARCHAR(20) NOT NULL DEFAULT 'نشط',
    `password` VARCHAR(255) NOT NULL,
    `operational_status` VARCHAR(20) NULL DEFAULT 'متاح',
    `experience_years` INT NULL DEFAULT 0,
    `driver_photo` VARCHAR(255) NULL,
    CONSTRAINT `fk_drivers_company` FOREIGN KEY (`contract_number`) REFERENCES `transportation_companies` (`contract_number`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_drivers_vehicle` FOREIGN KEY (`assigned_vehicle_plate`) REFERENCES `vehicles` (`plate_number`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. جدول المعالم السياحية (Places Tourist)
CREATE TABLE IF NOT EXISTS `places_tourist` (
    `place_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `place_name` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `longitude` DECIMAL(9, 6) NULL,
    `latitude` DECIMAL(9, 6) NULL,
    `category` VARCHAR(50) NOT NULL,
    `place_image` VARCHAR(255) NULL,
    `is_unesco` BOOLEAN NOT NULL DEFAULT FALSE,
    `unesco_year` INT NULL,
    `gallery` TEXT NULL,
    `entry_fee` VARCHAR(50) NULL,
    `best_season` VARCHAR(50) NULL,
    `google_maps_url` VARCHAR(500) NULL,
    INDEX `idx_place_city` (`city`),
    INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. جدول الفنادق (Hotels)
CREATE TABLE IF NOT EXISTS `hotels` (
    `hotel_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `hotel_name` VARCHAR(100) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `address_details` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NOT NULL,
    `star_rating` INT NOT NULL DEFAULT 4,
    `partnership_status` VARCHAR(20) NOT NULL DEFAULT 'نشط',
    `hotel_photo_1` VARCHAR(255) NULL,
    `hotel_photo_2` VARCHAR(255) NULL,
    `hotel_photo_3` VARCHAR(255) NULL,
    `hotel_photo_4` VARCHAR(255) NULL,
    `hotel_photo_5` VARCHAR(255) NULL,
    `contract_date` DATE NULL,
    `verification_status` VARCHAR(20) NULL DEFAULT 'معتمد',
    `price_per_night` DECIMAL(10, 2) NULL,
    `property_type` VARCHAR(50) NULL DEFAULT 'فندق فاخر',
    `amenities` TEXT NULL,
    INDEX `idx_hotel_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. جدول المطاعم والمقاهي (Restaurants Cafes)
CREATE TABLE IF NOT EXISTS `restaurants_cafes` (
    `facility_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `facility_name` VARCHAR(100) NOT NULL,
    `facility_type` VARCHAR(50) NOT NULL,
    `city` VARCHAR(50) NOT NULL,
    `address_details` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20) NULL,
    `description` TEXT NULL,
    `facility_image_1` VARCHAR(255) NULL,
    `facility_image_2` VARCHAR(255) NULL,
    `facility_image_3` VARCHAR(255) NULL,
    `facility_image_4` VARCHAR(255) NULL,
    `facility_image_5` VARCHAR(255) NULL,
    `contract_date` DATE NULL,
    `verification_status` VARCHAR(20) NULL DEFAULT 'معتمد',
    `price_range` VARCHAR(50) NULL,
    `working_hours` VARCHAR(100) NULL,
    `signature_dishes` TEXT NULL,
    `cuisine_type` VARCHAR(100) NULL,
    `specialty` VARCHAR(150) NULL,
    `features` TEXT NULL,
    INDEX `idx_facility_city` (`city`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. جدول الرحلات اليومية (Daily Trips)
CREATE TABLE IF NOT EXISTS `daily_trips` (
    `daily_trip_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `trip_title` VARCHAR(150) NOT NULL,
    `description` TEXT NOT NULL,
    `price_per_seat` DECIMAL(10, 2) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `photo` VARCHAR(255) NULL,
    `max_capacity` INT NOT NULL,
    `available_seats` INT NOT NULL,
    `guide_license_number` VARCHAR(50) NULL,
    `departure_city` VARCHAR(50) NULL,
    `destination_city` VARCHAR(50) NULL,
    `recurring_days` TEXT NULL,
    `activities` TEXT NULL,
    CONSTRAINT `fk_daily_trips_guide` FOREIGN KEY (`guide_license_number`) REFERENCES `tour_guides` (`license_number`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. جدول الرحلات الأسبوعية (Weekly Trips)
CREATE TABLE IF NOT EXISTS `weekly_trips` (
    `weekly_trip_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `trip_title` VARCHAR(150) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `max_capacity` INT NOT NULL,
    `available_seats` INT NOT NULL,
    `seat_per_price` DECIMAL(10, 2) NOT NULL,
    `trip_description` TEXT NOT NULL,
    `guide_license_number` VARCHAR(50) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `departure_city` VARCHAR(50) NULL,
    `destination_region` VARCHAR(100) NULL,
    `photo` VARCHAR(255) NULL,
    `gallery` TEXT NULL,
    CONSTRAINT `fk_weekly_trips_guide` FOREIGN KEY (`guide_license_number`) REFERENCES `tour_guides` (`license_number`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. جدول الرحلات الخاصة VIP (Private Trips)
CREATE TABLE IF NOT EXISTS `private_trips` (
    `private_trip_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `status_order` VARCHAR(25) NOT NULL DEFAULT 'قيد الدراسة',
    `customer_description` TEXT NULL,
    `preferred_start_date` DATE NOT NULL,
    `duration_days` INT NOT NULL DEFAULT 1,
    `number_of_companions` INT NOT NULL DEFAULT 1,
    `quoted_price` DECIMAL(10, 2) NULL,
    `admin_itinerary_plan` TEXT NULL,
    `guide_license_number` VARCHAR(50) NULL,
    `tourist_id` VARCHAR(50) NULL,
    `customer_name` VARCHAR(100) NULL,
    `customer_phone` VARCHAR(20) NULL,
    `customer_requirements` TEXT NULL,
    `assigned_guide_license` VARCHAR(50) NULL,
    `assigned_vehicle_plate` VARCHAR(30) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_private_trips_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_private_trips_guide` FOREIGN KEY (`assigned_guide_license`) REFERENCES `tour_guides` (`license_number`) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT `fk_private_trips_vehicle` FOREIGN KEY (`assigned_vehicle_plate`) REFERENCES `vehicles` (`plate_number`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. جدول عروض الرحلات اليومية (Offers Daily Trips)
CREATE TABLE IF NOT EXISTS `offers_daily_trips` (
    `offer_daily_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `daily_trip_id` VARCHAR(50) NOT NULL,
    `offer_title` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `percent_discount` DECIMAL(5, 2) NOT NULL,
    `offer_image_url` VARCHAR(255) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `badge` VARCHAR(50) NULL,
    CONSTRAINT `fk_offers_daily_trip` FOREIGN KEY (`daily_trip_id`) REFERENCES `daily_trips` (`daily_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. جدول عروض الرحلات الأسبوعية (Offers Weekly Trips)
CREATE TABLE IF NOT EXISTS `offers_weekly_trips` (
    `offer_weekly_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `weekly_trip_id` VARCHAR(50) NOT NULL,
    `offer_title` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `discount_percentage` DECIMAL(5, 2) NOT NULL,
    `offer_image_url` VARCHAR(255) NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `badge` VARCHAR(50) NULL,
    CONSTRAINT `fk_offers_weekly_trip` FOREIGN KEY (`weekly_trip_id`) REFERENCES `weekly_trips` (`weekly_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. جدول عروض الفنادق (Offers Hotels)
CREATE TABLE IF NOT EXISTS `offers_hotels` (
    `id_offer` VARCHAR(50) NOT NULL PRIMARY KEY,
    `title_offer` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `percent_discount` INT NOT NULL,
    `offer_image` VARCHAR(255) NOT NULL,
    `hotel_id` VARCHAR(50) NOT NULL,
    `date_start` DATE NOT NULL,
    `date_end` DATE NOT NULL,
    `badge` VARCHAR(50) NULL,
    CONSTRAINT `fk_offers_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. جدول عروض المرافق والمطاعم (Offers Facilities)
CREATE TABLE IF NOT EXISTS `offers_facilities` (
    `facility_offer_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `facility_id` VARCHAR(50) NOT NULL,
    `description` TEXT NOT NULL,
    `offer_title` VARCHAR(100) NOT NULL,
    `offer_image_url` VARCHAR(255) NOT NULL,
    `discount_percentage` DECIMAL(5, 2) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `badge` VARCHAR(50) NULL,
    CONSTRAINT `fk_offers_facility` FOREIGN KEY (`facility_id`) REFERENCES `restaurants_cafes` (`facility_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 16. جدول تخصيص مركبات الرحلات اليومية (Daily Trip Vehicles)
CREATE TABLE IF NOT EXISTS `daily_trip_vehicles` (
    `daily_alloc_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `daily_trip_id` VARCHAR(50) NOT NULL,
    `plate_number` VARCHAR(30) NOT NULL,
    `allocation_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'مخصصة',
    CONSTRAINT `fk_dtv_daily_trip` FOREIGN KEY (`daily_trip_id`) REFERENCES `daily_trips` (`daily_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_dtv_vehicle` FOREIGN KEY (`plate_number`) REFERENCES `vehicles` (`plate_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 17. جدول تخصيص مركبات الرحلات الأسبوعية (Weekly Trip Vehicles)
CREATE TABLE IF NOT EXISTS `weekly_trip_vehicles` (
    `weekly_alloc_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `weekly_trip_id` VARCHAR(50) NOT NULL,
    `plate_number` VARCHAR(30) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'مخصصة',
    CONSTRAINT `fk_wtv_weekly_trip` FOREIGN KEY (`weekly_trip_id`) REFERENCES `weekly_trips` (`weekly_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_wtv_vehicle` FOREIGN KEY (`plate_number`) REFERENCES `vehicles` (`plate_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 18. جدول تخصيص مركبات الرحلات الخاصة (Private Trip Vehicles)
CREATE TABLE IF NOT EXISTS `private_trip_vehicles` (
    `private_alloc_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `private_trip_id` VARCHAR(50) NOT NULL,
    `plate_number` VARCHAR(30) NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `allocation_status` VARCHAR(25) NOT NULL DEFAULT 'مخصصة',
    CONSTRAINT `fk_ptv_private_trip` FOREIGN KEY (`private_trip_id`) REFERENCES `private_trips` (`private_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ptv_vehicle` FOREIGN KEY (`plate_number`) REFERENCES `vehicles` (`plate_number`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 19. جدول حجوزات الرحلات اليومية (Bookings Daily)
CREATE TABLE IF NOT EXISTS `bookings_daily` (
    `booking_daily_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tourist_id` VARCHAR(50) NOT NULL,
    `daily_trip_id` VARCHAR(50) NOT NULL,
    `booking_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `number_of_seats` INT NOT NULL DEFAULT 1,
    `booking_status` VARCHAR(20) NOT NULL DEFAULT 'مؤكد',
    `total_price` DECIMAL(10, 2) NOT NULL,
    `booking_notes` TEXT NULL,
    `passengers_names` TEXT NULL,
    `payment_status` VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    `attended` BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT `fk_bd_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bd_daily_trip` FOREIGN KEY (`daily_trip_id`) REFERENCES `daily_trips` (`daily_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 20. جدول حجوزات الرحلات الأسبوعية (Bookings Weekly)
CREATE TABLE IF NOT EXISTS `bookings_weekly` (
    `booking_weekly_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tourist_id` VARCHAR(50) NOT NULL,
    `weekly_trip_id` VARCHAR(50) NOT NULL,
    `booking_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `number_of_seats` INT NOT NULL DEFAULT 1,
    `total_price` DECIMAL(10, 2) NOT NULL,
    `booking_status` VARCHAR(20) NOT NULL DEFAULT 'مؤكد',
    `booking_notes` TEXT NULL,
    `passengers_names` TEXT NULL,
    `payment_status` VARCHAR(20) NOT NULL DEFAULT 'unpaid',
    `attended` BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT `fk_bw_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_bw_weekly_trip` FOREIGN KEY (`weekly_trip_id`) REFERENCES `weekly_trips` (`weekly_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 21. جدول ربط فنادق الرحلات الأسبوعية (Hotels Trip Weekly)
CREATE TABLE IF NOT EXISTS `hotels_trip_weekly` (
    `hotel_id` VARCHAR(50) NOT NULL,
    `weekly_trip_id` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`hotel_id`, `weekly_trip_id`),
    CONSTRAINT `fk_htw_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_htw_weekly_trip` FOREIGN KEY (`weekly_trip_id`) REFERENCES `weekly_trips` (`weekly_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 22. جدول ربط معالم الرحلات الأسبوعية (Places Trip Weekly)
CREATE TABLE IF NOT EXISTS `places_trip_weekly` (
    `place_id` VARCHAR(50) NOT NULL,
    `weekly_trip_id` VARCHAR(50) NOT NULL,
    PRIMARY KEY (`place_id`, `weekly_trip_id`),
    CONSTRAINT `fk_ptw_place` FOREIGN KEY (`place_id`) REFERENCES `places_tourist` (`place_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_ptw_weekly_trip` FOREIGN KEY (`weekly_trip_id`) REFERENCES `weekly_trips` (`weekly_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 23. جدول تقييمات الرحلات اليومية (Reviews Daily Trips)
CREATE TABLE IF NOT EXISTS `reviews_daily_trips` (
    `review_daily_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tourist_id` VARCHAR(50) NOT NULL,
    `daily_trip_id` VARCHAR(50) NOT NULL,
    `stars_rating` INT NOT NULL DEFAULT 5,
    `comment_text` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rdt_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rdt_daily_trip` FOREIGN KEY (`daily_trip_id`) REFERENCES `daily_trips` (`daily_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 24. جدول تقييمات الرحلات الأسبوعية (Reviews Weekly Trips)
CREATE TABLE IF NOT EXISTS `reviews_weekly_trips` (
    `review_weekly_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tourist_id` VARCHAR(50) NOT NULL,
    `weekly_trip_id` VARCHAR(50) NOT NULL,
    `stars_rating` INT NOT NULL DEFAULT 5,
    `comment_text` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rwt_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rwt_weekly_trip` FOREIGN KEY (`weekly_trip_id`) REFERENCES `weekly_trips` (`weekly_trip_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 25. جدول تقييمات الفنادق (Reviews Hotels)
CREATE TABLE IF NOT EXISTS `reviews_hotels` (
    `review_hotel_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tourist_id` VARCHAR(50) NOT NULL,
    `hotel_id` VARCHAR(50) NOT NULL,
    `stars_rating` INT NOT NULL DEFAULT 5,
    `comment_text` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rh_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rh_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`hotel_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 26. جدول تقييمات المطاعم والمرافق (Reviews Facilities)
CREATE TABLE IF NOT EXISTS `reviews_facilities` (
    `review_facility_id` VARCHAR(50) NOT NULL PRIMARY KEY,
    `tourist_id` VARCHAR(50) NOT NULL,
    `facility_id` VARCHAR(50) NOT NULL,
    `stars_rating` INT NOT NULL DEFAULT 5,
    `comment_text` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rf_tourist` FOREIGN KEY (`tourist_id`) REFERENCES `tourists` (`tourist_id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `fk_rf_facility` FOREIGN KEY (`facility_id`) REFERENCES `restaurants_cafes` (`facility_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
