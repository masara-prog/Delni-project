/* ==============================================================================
   DELNI PLATFORM - CANONICAL DATABASE SCHEMA (MICROSOFT SQL SERVER)
   Database: DelniDB
   Target Engine: Microsoft SQL Server 2019 / 2022 / Azure SQL
   Tables: 39 Tables
   Primary Keys: 39
   Foreign Keys: 45
   Order of Execution:
     1. CREATE TABLE (All 39 tables created first)
     2. PRIMARY KEYS & UNIQUE CONSTRAINTS (All PKs created second)
     3. FOREIGN KEYS (All FKs created third, guaranteeing 0 dependency errors)
   ============================================================================== */

IF DB_ID(N'DelniDB') IS NULL
BEGIN
    CREATE DATABASE [DelniDB];
END;
GO

USE [DelniDB];
GO

/* ==============================================================================
   SECTION 1: CREATE TABLES (39 TABLES)
   ============================================================================== */

-- ----------------------------------------------------------------------------
-- Table: dbo.[bookings_daily]
-- Description: Records and manages data for bookings_daily
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[bookings_daily]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[bookings_daily] (
        [booking_daily_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [booking_date] DATETIME NOT NULL DEFAULT (getdate()),
        [number_of_seats] INT NOT NULL,
        [booking_status] NVARCHAR(50) NOT NULL DEFAULT (N'مؤكد'),
        [total_price] DECIMAL(10, 2) NOT NULL,
        [payment_status] NVARCHAR(50) NOT NULL DEFAULT (N'مدفوع'),
        [attended] BIT NOT NULL DEFAULT ((0))
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[bookings_weekly]
-- Description: Records and manages data for bookings_weekly
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[bookings_weekly]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[bookings_weekly] (
        [booking_weekly_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [booking_date] DATETIME NOT NULL DEFAULT (getdate()),
        [number_of_seats] INT NOT NULL,
        [total_price] DECIMAL(10, 2) NOT NULL,
        [booking_status] NVARCHAR(50) NOT NULL DEFAULT (N'مؤكد'),
        [payment_status] NVARCHAR(50) NOT NULL DEFAULT (N'مدفوع'),
        [attended] BIT NOT NULL DEFAULT ((0))
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[daily_trip_days]
-- Description: Records and manages data for daily_trip_days
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[daily_trip_days]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[daily_trip_days] (
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [day_of_week] NVARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[daily_trip_stations]
-- Description: Records and manages data for daily_trip_stations
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[daily_trip_stations]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[daily_trip_stations] (
        [station_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [station_order] INT NOT NULL DEFAULT ((1)),
        [station_title] NVARCHAR(150) NOT NULL,
        [station_time] VARCHAR(30) NOT NULL,
        [station_desc] NVARCHAR(MAX) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[daily_trips]
-- Description: Records and manages data for daily_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[daily_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[daily_trips] (
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [trip_title] NVARCHAR(200) NOT NULL,
        [description] NVARCHAR(MAX) NOT NULL,
        [price_per_seat] DECIMAL(10, 2) NOT NULL,
        [is_active] BIT NOT NULL DEFAULT ((1)),
        [max_capacity] INT NOT NULL,
        [available_seats] INT NOT NULL,
        [guide_license_number] VARCHAR(50) NOT NULL,
        [departure_city] NVARCHAR(100) NULL,
        [vehicle_plate] VARCHAR(30) NULL,
        [restaurant_id] NVARCHAR(50) NULL,
        [photo_1] NVARCHAR(500) NULL,
        [photo_2] NVARCHAR(500) NULL,
        [photo_3] NVARCHAR(500) NULL,
        [photo_4] NVARCHAR(500) NULL,
        [photo_5] NVARCHAR(500) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[drivers]
-- Description: Records and manages data for drivers
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[drivers]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[drivers] (
        [driver_license_number] VARCHAR(50) NOT NULL,
        [full_name] NVARCHAR(150) NOT NULL,
        [phone_number] VARCHAR(20) NOT NULL,
        [national_id_or_passport] VARCHAR(50) NOT NULL,
        [license_date_valid] DATE NOT NULL,
        [contract_number] VARCHAR(50) NOT NULL,
        [assigned_vehicle_plate] VARCHAR(30) NULL,
        [email] VARCHAR(100) NOT NULL,
        [account_status] NVARCHAR(50) NULL,
        [password] VARCHAR(255) NOT NULL,
        [operational_status] NVARCHAR(50) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[guide_operating_regions]
-- Description: Records and manages data for guide_operating_regions
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[guide_operating_regions]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[guide_operating_regions] (
        [license_number] VARCHAR(50) NOT NULL,
        [region] NVARCHAR(100) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[guide_places]
-- Description: Records and manages data for guide_places
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[guide_places]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[guide_places] (
        [license_number] VARCHAR(50) NOT NULL,
        [place_id] VARCHAR(50) NOT NULL,
        [created_at] DATETIME NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[guide_working_days]
-- Description: Records and manages data for guide_working_days
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[guide_working_days]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[guide_working_days] (
        [license_number] VARCHAR(50) NOT NULL,
        [day_of_week] NVARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[hotel_amenities]
-- Description: Records and manages data for hotel_amenities
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[hotel_amenities]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[hotel_amenities] (
        [hotel_id] VARCHAR(50) NOT NULL,
        [amenity] NVARCHAR(100) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[hotels]
-- Description: Records and manages data for hotels
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[hotels]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[hotels] (
        [hotel_id] VARCHAR(50) NOT NULL,
        [hotel_name] NVARCHAR(200) NOT NULL,
        [city] NVARCHAR(100) NOT NULL,
        [address_details] NVARCHAR(500) NOT NULL,
        [phone_number] VARCHAR(20) NOT NULL,
        [star_rating] INT NOT NULL,
        [partnership_status] NVARCHAR(100) NOT NULL,
        [hotel_photo_1] NVARCHAR(MAX) NULL,
        [hotel_photo_2] NVARCHAR(MAX) NULL,
        [hotel_photo_3] NVARCHAR(MAX) NULL,
        [hotel_photo_4] NVARCHAR(MAX) NULL,
        [hotel_photo_5] NVARCHAR(MAX) NULL,
        [property_type] NVARCHAR(100) NULL,
        [google_maps_url] NVARCHAR(500) NULL,
        [description] NVARCHAR(MAX) NULL,
        [working_hours] NVARCHAR(150) NULL,
        [discount_percentage] INT NULL,
        [contract_start_date] NVARCHAR(50) NULL,
        [contract_end_date] NVARCHAR(50) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[hotels_trip_private]
-- Description: Records and manages data for hotels_trip_private
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[hotels_trip_private]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[hotels_trip_private] (
        [private_trip_id] VARCHAR(50) NOT NULL,
        [hotel_id] VARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[hotels_trip_weekly]
-- Description: Records and manages data for hotels_trip_weekly
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[hotels_trip_weekly]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[hotels_trip_weekly] (
        [hotel_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[notifications]
-- Description: Records and manages data for notifications
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[notifications]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[notifications] (
        [id] VARCHAR(50) NOT NULL,
        [type] NVARCHAR(50) NULL DEFAULT ('system'),
        [title] NVARCHAR(255) NOT NULL,
        [body] NVARCHAR(MAX) NOT NULL,
        [recipient_role] NVARCHAR(50) NULL DEFAULT ('all'),
        [recipient_id] NVARCHAR(100) NULL,
        [link] NVARCHAR(255) NULL,
        [is_read] BIT NULL DEFAULT ((0)),
        [created_at] DATETIME NULL DEFAULT (getdate()),
        [dedupe_key] VARCHAR(100) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[offers_daily_trips]
-- Description: Records and manages data for offers_daily_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[offers_daily_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[offers_daily_trips] (
        [offer_daily_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [offer_title] NVARCHAR(250) NULL,
        [description] NVARCHAR(MAX) NULL,
        [percent_discount] DECIMAL(5, 2) NOT NULL,
        [offer_image_url] VARCHAR(255) NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [badge] NVARCHAR(100) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[offers_facilities]
-- Description: Records and manages data for offers_facilities
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[offers_facilities]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[offers_facilities] (
        [facility_offer_id] VARCHAR(50) NOT NULL,
        [facility_id] VARCHAR(50) NOT NULL,
        [description] TEXT NOT NULL,
        [offer_title] VARCHAR(100) NOT NULL,
        [offer_image_url] VARCHAR(255) NOT NULL,
        [discount_percentage] DECIMAL(5, 2) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [badge] VARCHAR(50) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[offers_hotels]
-- Description: Records and manages data for offers_hotels
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[offers_hotels]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[offers_hotels] (
        [id_offer] VARCHAR(50) NOT NULL,
        [title_offer] VARCHAR(100) NOT NULL,
        [description] TEXT NOT NULL,
        [percent_discount] INT NOT NULL,
        [offer_image] VARCHAR(255) NOT NULL,
        [hotel_id] VARCHAR(50) NOT NULL,
        [date_start] DATE NOT NULL,
        [date_end] DATE NOT NULL,
        [badge] VARCHAR(50) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[offers_weekly_trips]
-- Description: Records and manages data for offers_weekly_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[offers_weekly_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[offers_weekly_trips] (
        [offer_weekly_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [offer_title] NVARCHAR(250) NULL,
        [description] NVARCHAR(MAX) NULL,
        [discount_percentage] DECIMAL(5, 2) NOT NULL,
        [offer_image_url] VARCHAR(255) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [badge] NVARCHAR(100) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[places_tourist]
-- Description: Records and manages data for places_tourist
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[places_tourist]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[places_tourist] (
        [place_id] VARCHAR(50) NOT NULL,
        [place_name] NVARCHAR(200) NOT NULL,
        [description] NVARCHAR(MAX) NOT NULL,
        [city] NVARCHAR(100) NOT NULL,
        [longitude] DECIMAL(9, 6) NOT NULL,
        [latitude] DECIMAL(9, 6) NOT NULL,
        [category] NVARCHAR(100) NOT NULL,
        [place_image] NVARCHAR(MAX) NULL,
        [google_maps_url] NVARCHAR(MAX) NULL,
        [region] NVARCHAR(100) NULL,
        [highlights] NVARCHAR(MAX) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[places_tourist_highlights]
-- Description: Records and manages data for places_tourist_highlights
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[places_tourist_highlights]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[places_tourist_highlights] (
        [highlight_id] VARCHAR(50) NOT NULL,
        [place_id] VARCHAR(50) NOT NULL,
        [highlight_name] NVARCHAR(250) NOT NULL,
        [display_order] INT NOT NULL DEFAULT ((1)),
        [created_at] DATETIME NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[places_trip_daily]
-- Description: Records and manages data for places_trip_daily
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[places_trip_daily]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[places_trip_daily] (
        [place_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[places_trip_private]
-- Description: Records and manages data for places_trip_private
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[places_trip_private]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[places_trip_private] (
        [private_trip_id] VARCHAR(50) NOT NULL,
        [place_id] VARCHAR(50) NOT NULL,
        [visit_order] INT NULL DEFAULT ((1))
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[places_trip_weekly]
-- Description: Records and manages data for places_trip_weekly
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[places_trip_weekly]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[places_trip_weekly] (
        [place_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[private_trip_stations]
-- Description: Records and manages data for private_trip_stations
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[private_trip_stations]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[private_trip_stations] (
        [station_id] VARCHAR(50) NOT NULL,
        [private_trip_id] VARCHAR(50) NOT NULL,
        [day_number] INT NOT NULL DEFAULT ((1)),
        [station_order] INT NOT NULL DEFAULT ((1)),
        [station_title] NVARCHAR(200) NOT NULL,
        [station_time] VARCHAR(30) NULL,
        [station_desc] NVARCHAR(MAX) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[private_trips]
-- Description: Records and manages data for private_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[private_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[private_trips] (
        [private_trip_id] VARCHAR(50) NOT NULL,
        [status_order] NVARCHAR(50) NULL,
        [preferred_start_date] DATE NOT NULL,
        [duration_days] INT NOT NULL,
        [number_of_companions] INT NOT NULL,
        [quoted_price] DECIMAL(10, 2) NULL,
        [guide_license_number] VARCHAR(50) NULL,
        [tourist_id] VARCHAR(50) NULL,
        [customer_requirements] NVARCHAR(MAX) NULL,
        [vehicle_plate] VARCHAR(30) NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[restaurant_features]
-- Description: Records and manages data for restaurant_features
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[restaurant_features]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[restaurant_features] (
        [facility_id] VARCHAR(50) NOT NULL,
        [feature] NVARCHAR(100) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[restaurants_cafes]
-- Description: Records and manages data for restaurants_cafes
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[restaurants_cafes]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[restaurants_cafes] (
        [facility_id] VARCHAR(50) NOT NULL,
        [facility_name] NVARCHAR(200) NOT NULL,
        [facility_type] NVARCHAR(100) NOT NULL,
        [city] NVARCHAR(100) NOT NULL,
        [address_details] NVARCHAR(500) NOT NULL,
        [phone_number] VARCHAR(20) NULL,
        [description] NVARCHAR(MAX) NULL,
        [facility_image_1] NVARCHAR(MAX) NULL,
        [facility_image_2] NVARCHAR(MAX) NULL,
        [facility_image_3] NVARCHAR(MAX) NULL,
        [facility_image_4] NVARCHAR(MAX) NULL,
        [facility_image_5] NVARCHAR(MAX) NULL,
        [working_hours] NVARCHAR(100) NULL,
        [google_maps_url] NVARCHAR(500) NULL,
        [discount_percentage] INT NULL,
        [contract_start_date] NVARCHAR(50) NULL,
        [contract_end_date] NVARCHAR(50) NULL,
        [partnership_status] NVARCHAR(50) NULL DEFAULT ('???')
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[restaurants_trip_weekly]
-- Description: Records and manages data for restaurants_trip_weekly
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[restaurants_trip_weekly]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[restaurants_trip_weekly] (
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [facility_id] VARCHAR(50) NOT NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[reviews_daily_trips]
-- Description: Records and manages data for reviews_daily_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[reviews_daily_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[reviews_daily_trips] (
        [review_daily_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] TEXT NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[reviews_facilities]
-- Description: Records and manages data for reviews_facilities
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[reviews_facilities]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[reviews_facilities] (
        [review_facility_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [facility_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] NVARCHAR(MAX) NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[reviews_hotels]
-- Description: Records and manages data for reviews_hotels
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[reviews_hotels]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[reviews_hotels] (
        [review_hotel_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [hotel_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] NVARCHAR(MAX) NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[reviews_weekly_trips]
-- Description: Records and manages data for reviews_weekly_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[reviews_weekly_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[reviews_weekly_trips] (
        [review_weekly_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] TEXT NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[tour_guides]
-- Description: Records and manages data for tour_guides
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[tour_guides]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[tour_guides] (
        [license_number] VARCHAR(50) NOT NULL,
        [full_name] NVARCHAR(150) NOT NULL,
        [phone_number] VARCHAR(20) NOT NULL,
        [years_of_experience] INT NOT NULL,
        [bio] NVARCHAR(MAX) NULL,
        [speaks_english] BIT NOT NULL DEFAULT ((0)),
        [speaks_french] BIT NOT NULL DEFAULT ((0)),
        [speaks_italian] BIT NOT NULL DEFAULT ((0)),
        [verification_status] NVARCHAR(50) NULL DEFAULT (N'قيد المراجعة'),
        [password] VARCHAR(255) NOT NULL,
        [email] VARCHAR(100) NOT NULL,
        [gender] VARCHAR(10) NULL,
        [price_per_day] DECIMAL(10, 2) NULL,
        [avatar] NVARCHAR(MAX) NULL,
        [digital_certificate_file] NVARCHAR(MAX) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[tourist_favorites]
-- Description: Records and manages data for tourist_favorites
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[tourist_favorites]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[tourist_favorites] (
        [favorite_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [item_type] NVARCHAR(50) NOT NULL,
        [item_id] VARCHAR(50) NOT NULL,
        [created_at] DATETIME NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[tourists]
-- Description: Records and manages data for tourists
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[tourists]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[tourists] (
        [tourist_id] VARCHAR(50) NOT NULL,
        [full_name] NVARCHAR(150) NOT NULL,
        [email] VARCHAR(100) NOT NULL,
        [phone_number] VARCHAR(20) NOT NULL,
        [password] VARCHAR(255) NOT NULL,
        [account_status] NVARCHAR(50) NULL DEFAULT ('???'),
        [created_at] DATETIME NULL DEFAULT (getdate())
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[transportation_companies]
-- Description: Records and manages data for transportation_companies
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[transportation_companies]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[transportation_companies] (
        [contract_number] VARCHAR(50) NOT NULL,
        [company_name] NVARCHAR(150) NOT NULL,
        [phone_number] VARCHAR(20) NOT NULL,
        [total_vehicles] INT NOT NULL,
        [verification_status] NVARCHAR(50) NULL,
        [email] VARCHAR(100) NULL,
        [password] VARCHAR(255) NULL,
        [city] NVARCHAR(100) NULL,
        [contract_start_date] DATE NULL,
        [contract_end_date] DATE NULL,
        [google_maps_url] NVARCHAR(500) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[vehicles]
-- Description: Records and manages data for vehicles
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[vehicles]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[vehicles] (
        [plate_number] VARCHAR(30) NOT NULL,
        [vehicle_type] NVARCHAR(100) NULL,
        [seating_capacity] INT NOT NULL,
        [vehicle_status] NVARCHAR(50) NULL,
        [contract_number] VARCHAR(50) NOT NULL,
        [daily_rate] DECIMAL(10, 2) NULL,
        [category] NVARCHAR(100) NULL,
        [insurance_image] NVARCHAR(MAX) NULL,
        [vehicle_image] NVARCHAR(MAX) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[weekly_trip_stations]
-- Description: Records and manages data for weekly_trip_stations
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[weekly_trip_stations]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[weekly_trip_stations] (
        [station_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [station_order] INT NOT NULL DEFAULT ((1)),
        [day_number] INT NOT NULL DEFAULT ((1)),
        [station_title] NVARCHAR(200) NOT NULL,
        [station_desc] NVARCHAR(MAX) NULL
    );
END;
GO

-- ----------------------------------------------------------------------------
-- Table: dbo.[weekly_trips]
-- Description: Records and manages data for weekly_trips
-- ----------------------------------------------------------------------------
IF OBJECT_ID('dbo.[weekly_trips]', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.[weekly_trips] (
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [trip_title] NVARCHAR(200) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [max_capacity] INT NOT NULL,
        [available_seats] INT NOT NULL,
        [seat_per_price] DECIMAL(10, 2) NOT NULL,
        [guide_license_number] VARCHAR(50) NOT NULL,
        [is_active] BIT NOT NULL DEFAULT ((1)),
        [departure_city] NVARCHAR(100) NULL,
        [vehicle_plate] VARCHAR(30) NULL,
        [photo_1] NVARCHAR(500) NULL,
        [photo_2] NVARCHAR(500) NULL,
        [photo_3] NVARCHAR(500) NULL,
        [photo_4] NVARCHAR(500) NULL,
        [photo_5] NVARCHAR(500) NULL
    );
END;
GO

/* ==============================================================================
   SECTION 2: PRIMARY KEYS & UNIQUE CONSTRAINTS (39 PKs + UNIQUE CONSTRAINTS)
   ============================================================================== */

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__bookings__3D23616D961628F0')
    ALTER TABLE dbo.[bookings_daily] ADD CONSTRAINT [PK__bookings__3D23616D961628F0] PRIMARY KEY ([booking_daily_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__bookings__CC64685C01AD6B63')
    ALTER TABLE dbo.[bookings_weekly] ADD CONSTRAINT [PK__bookings__CC64685C01AD6B63] PRIMARY KEY ([booking_weekly_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_daily_trip_days')
    ALTER TABLE dbo.[daily_trip_days] ADD CONSTRAINT [PK_daily_trip_days] PRIMARY KEY ([daily_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_daily_trip_stations')
    ALTER TABLE dbo.[daily_trip_stations] ADD CONSTRAINT [PK_daily_trip_stations] PRIMARY KEY ([station_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__daily_tr__96C9417866F4C326')
    ALTER TABLE dbo.[daily_trips] ADD CONSTRAINT [PK__daily_tr__96C9417866F4C326] PRIMARY KEY ([daily_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__drivers__4A36048ED7FEB452')
    ALTER TABLE dbo.[drivers] ADD CONSTRAINT [PK__drivers__4A36048ED7FEB452] PRIMARY KEY ([driver_license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__drivers__9DF00BEEDDBA5A3A')
    ALTER TABLE dbo.[drivers] ADD CONSTRAINT [UQ__drivers__9DF00BEEDDBA5A3A] UNIQUE ([national_id_or_passport]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__drivers__A1936A6BAA8328F5')
    ALTER TABLE dbo.[drivers] ADD CONSTRAINT [UQ__drivers__A1936A6BAA8328F5] UNIQUE ([phone_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__drivers__AB6E616498FDD5D7')
    ALTER TABLE dbo.[drivers] ADD CONSTRAINT [UQ__drivers__AB6E616498FDD5D7] UNIQUE ([email]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_guide_operating_regions')
    ALTER TABLE dbo.[guide_operating_regions] ADD CONSTRAINT [PK_guide_operating_regions] PRIMARY KEY ([license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_guide_places')
    ALTER TABLE dbo.[guide_places] ADD CONSTRAINT [PK_guide_places] PRIMARY KEY ([license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_guide_working_days')
    ALTER TABLE dbo.[guide_working_days] ADD CONSTRAINT [PK_guide_working_days] PRIMARY KEY ([day_of_week]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_hotel_amenities')
    ALTER TABLE dbo.[hotel_amenities] ADD CONSTRAINT [PK_hotel_amenities] PRIMARY KEY ([amenity]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__hotels__45FE7E265C780494')
    ALTER TABLE dbo.[hotels] ADD CONSTRAINT [PK__hotels__45FE7E265C780494] PRIMARY KEY ([hotel_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_hotels_trip_private')
    ALTER TABLE dbo.[hotels_trip_private] ADD CONSTRAINT [PK_hotels_trip_private] PRIMARY KEY ([hotel_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__hotels_t__6E3B1DF7C3852CA5')
    ALTER TABLE dbo.[hotels_trip_weekly] ADD CONSTRAINT [PK__hotels_t__6E3B1DF7C3852CA5] PRIMARY KEY ([hotel_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__notifica__3213E83FCCA35CE5')
    ALTER TABLE dbo.[notifications] ADD CONSTRAINT [PK__notifica__3213E83FCCA35CE5] PRIMARY KEY ([id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__offers_d__2393AA988ADF9EC2')
    ALTER TABLE dbo.[offers_daily_trips] ADD CONSTRAINT [PK__offers_d__2393AA988ADF9EC2] PRIMARY KEY ([offer_daily_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__offers_f__C9723AFD917C000C')
    ALTER TABLE dbo.[offers_facilities] ADD CONSTRAINT [PK__offers_f__C9723AFD917C000C] PRIMARY KEY ([facility_offer_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__offers_h__DB2ECACE90A2BE2D')
    ALTER TABLE dbo.[offers_hotels] ADD CONSTRAINT [PK__offers_h__DB2ECACE90A2BE2D] PRIMARY KEY ([id_offer]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__offers_w__951324BBC16E3415')
    ALTER TABLE dbo.[offers_weekly_trips] ADD CONSTRAINT [PK__offers_w__951324BBC16E3415] PRIMARY KEY ([offer_weekly_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__places_t__BF2B684A3418BD98')
    ALTER TABLE dbo.[places_tourist] ADD CONSTRAINT [PK__places_t__BF2B684A3418BD98] PRIMARY KEY ([place_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_places_tourist_highlights')
    ALTER TABLE dbo.[places_tourist_highlights] ADD CONSTRAINT [PK_places_tourist_highlights] PRIMARY KEY ([highlight_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__places_t__2647FC5D9E65664D')
    ALTER TABLE dbo.[places_trip_daily] ADD CONSTRAINT [PK__places_t__2647FC5D9E65664D] PRIMARY KEY ([daily_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__places_t__1C7049889271FEB5')
    ALTER TABLE dbo.[places_trip_private] ADD CONSTRAINT [PK__places_t__1C7049889271FEB5] PRIMARY KEY ([place_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__places_t__94EE0B9B736F60D7')
    ALTER TABLE dbo.[places_trip_weekly] ADD CONSTRAINT [PK__places_t__94EE0B9B736F60D7] PRIMARY KEY ([place_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__private___44B370E9A15E57E8')
    ALTER TABLE dbo.[private_trip_stations] ADD CONSTRAINT [PK__private___44B370E9A15E57E8] PRIMARY KEY ([station_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__private___A782FF0CBBAF7AB4')
    ALTER TABLE dbo.[private_trips] ADD CONSTRAINT [PK__private___A782FF0CBBAF7AB4] PRIMARY KEY ([private_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_restaurant_features')
    ALTER TABLE dbo.[restaurant_features] ADD CONSTRAINT [PK_restaurant_features] PRIMARY KEY ([facility_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__restaura__B2E8EAAEC22F3B94')
    ALTER TABLE dbo.[restaurants_cafes] ADD CONSTRAINT [PK__restaura__B2E8EAAEC22F3B94] PRIMARY KEY ([facility_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK_restaurants_trip_weekly')
    ALTER TABLE dbo.[restaurants_trip_weekly] ADD CONSTRAINT [PK_restaurants_trip_weekly] PRIMARY KEY ([facility_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__reviews___0C52942457BD19DC')
    ALTER TABLE dbo.[reviews_daily_trips] ADD CONSTRAINT [PK__reviews___0C52942457BD19DC] PRIMARY KEY ([review_daily_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__reviews___C984FBE8503DABA1')
    ALTER TABLE dbo.[reviews_facilities] ADD CONSTRAINT [PK__reviews___C984FBE8503DABA1] PRIMARY KEY ([review_facility_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__reviews___EEA814FFE3A8777E')
    ALTER TABLE dbo.[reviews_hotels] ADD CONSTRAINT [PK__reviews___EEA814FFE3A8777E] PRIMARY KEY ([review_hotel_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__reviews___250FEE68D488C6F7')
    ALTER TABLE dbo.[reviews_weekly_trips] ADD CONSTRAINT [PK__reviews___250FEE68D488C6F7] PRIMARY KEY ([review_weekly_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__tour_gui__D482A002D12391C0')
    ALTER TABLE dbo.[tour_guides] ADD CONSTRAINT [PK__tour_gui__D482A002D12391C0] PRIMARY KEY ([license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__tour_gui__A1936A6B8EAEBEA6')
    ALTER TABLE dbo.[tour_guides] ADD CONSTRAINT [UQ__tour_gui__A1936A6B8EAEBEA6] UNIQUE ([phone_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__tour_gui__AB6E6164229088D0')
    ALTER TABLE dbo.[tour_guides] ADD CONSTRAINT [UQ__tour_gui__AB6E6164229088D0] UNIQUE ([email]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__tourist___46ACF4CB9FE6DD37')
    ALTER TABLE dbo.[tourist_favorites] ADD CONSTRAINT [PK__tourist___46ACF4CB9FE6DD37] PRIMARY KEY ([favorite_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_tourist_favorites')
    ALTER TABLE dbo.[tourist_favorites] ADD CONSTRAINT [UQ_tourist_favorites] UNIQUE ([item_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__tourists__83DD92C931AF8585')
    ALTER TABLE dbo.[tourists] ADD CONSTRAINT [PK__tourists__83DD92C931AF8585] PRIMARY KEY ([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__tourists__A1936A6BEBCAEEC5')
    ALTER TABLE dbo.[tourists] ADD CONSTRAINT [UQ__tourists__A1936A6BEBCAEEC5] UNIQUE ([phone_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__tourists__AB6E61646307851E')
    ALTER TABLE dbo.[tourists] ADD CONSTRAINT [UQ__tourists__AB6E61646307851E] UNIQUE ([email]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__transpor__1CA37CCF3BD327A9')
    ALTER TABLE dbo.[transportation_companies] ADD CONSTRAINT [PK__transpor__1CA37CCF3BD327A9] PRIMARY KEY ([contract_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ__transpor__A1936A6BCF708561')
    ALTER TABLE dbo.[transportation_companies] ADD CONSTRAINT [UQ__transpor__A1936A6BCF708561] UNIQUE ([phone_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__vehicles__87EF9F5839ED1B71')
    ALTER TABLE dbo.[vehicles] ADD CONSTRAINT [PK__vehicles__87EF9F5839ED1B71] PRIMARY KEY ([plate_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__weekly_t__44B370E9074A4FFF')
    ALTER TABLE dbo.[weekly_trip_stations] ADD CONSTRAINT [PK__weekly_t__44B370E9074A4FFF] PRIMARY KEY ([station_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'PK__weekly_t__BC563D1351FB1212')
    ALTER TABLE dbo.[weekly_trips] ADD CONSTRAINT [PK__weekly_t__BC563D1351FB1212] PRIMARY KEY ([weekly_trip_id]);
GO

/* ==============================================================================
   SECTION 3: FOREIGN KEY RELATIONSHIPS (45 FOREIGN KEYS)
   ============================================================================== */

-- ==============================================================================
-- PRIMARY KEYS, UNIQUE CONSTRAINTS & FOREIGN KEYS
-- ==============================================================================

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__bookings___daily__1332DBDC')
    ALTER TABLE dbo.[bookings_daily] ADD CONSTRAINT [FK__bookings___daily__1332DBDC] FOREIGN KEY ([daily_trip_id]) REFERENCES dbo.[daily_trips]([daily_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__bookings___touri__14270015')
    ALTER TABLE dbo.[bookings_daily] ADD CONSTRAINT [FK__bookings___touri__14270015] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__bookings___touri__151B244E')
    ALTER TABLE dbo.[bookings_weekly] ADD CONSTRAINT [FK__bookings___touri__151B244E] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__bookings___weekl__160F4887')
    ALTER TABLE dbo.[bookings_weekly] ADD CONSTRAINT [FK__bookings___weekl__160F4887] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_daily_trip_days_trip')
    ALTER TABLE dbo.[daily_trip_days] ADD CONSTRAINT [FK_daily_trip_days_trip] FOREIGN KEY ([daily_trip_id]) REFERENCES dbo.[daily_trips]([daily_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_daily_trip_stations_trips')
    ALTER TABLE dbo.[daily_trip_stations] ADD CONSTRAINT [FK_daily_trip_stations_trips] FOREIGN KEY ([daily_trip_id]) REFERENCES dbo.[daily_trips]([daily_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__daily_tri__guide__18EBB532')
    ALTER TABLE dbo.[daily_trips] ADD CONSTRAINT [FK__daily_tri__guide__18EBB532] FOREIGN KEY ([guide_license_number]) REFERENCES dbo.[tour_guides]([license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_daily_trips_vehicle')
    ALTER TABLE dbo.[daily_trips] ADD CONSTRAINT [FK_daily_trips_vehicle] FOREIGN KEY ([vehicle_plate]) REFERENCES dbo.[vehicles]([plate_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__drivers__assigne__19DFD96B')
    ALTER TABLE dbo.[drivers] ADD CONSTRAINT [FK__drivers__assigne__19DFD96B] FOREIGN KEY ([assigned_vehicle_plate]) REFERENCES dbo.[vehicles]([plate_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__drivers__contrac__1AD3FDA4')
    ALTER TABLE dbo.[drivers] ADD CONSTRAINT [FK__drivers__contrac__1AD3FDA4] FOREIGN KEY ([contract_number]) REFERENCES dbo.[transportation_companies]([contract_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_guide_operating_regions_guide')
    ALTER TABLE dbo.[guide_operating_regions] ADD CONSTRAINT [FK_guide_operating_regions_guide] FOREIGN KEY ([license_number]) REFERENCES dbo.[tour_guides]([license_number]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_guide_places_guide')
    ALTER TABLE dbo.[guide_places] ADD CONSTRAINT [FK_guide_places_guide] FOREIGN KEY ([license_number]) REFERENCES dbo.[tour_guides]([license_number]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_guide_places_place')
    ALTER TABLE dbo.[guide_places] ADD CONSTRAINT [FK_guide_places_place] FOREIGN KEY ([place_id]) REFERENCES dbo.[places_tourist]([place_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_guide_working_days_guide')
    ALTER TABLE dbo.[guide_working_days] ADD CONSTRAINT [FK_guide_working_days_guide] FOREIGN KEY ([license_number]) REFERENCES dbo.[tour_guides]([license_number]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_hotel_amenities_hotel')
    ALTER TABLE dbo.[hotel_amenities] ADD CONSTRAINT [FK_hotel_amenities_hotel] FOREIGN KEY ([hotel_id]) REFERENCES dbo.[hotels]([hotel_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_hotels_trip_private_hotel')
    ALTER TABLE dbo.[hotels_trip_private] ADD CONSTRAINT [FK_hotels_trip_private_hotel] FOREIGN KEY ([hotel_id]) REFERENCES dbo.[hotels]([hotel_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_hotels_trip_private_trip')
    ALTER TABLE dbo.[hotels_trip_private] ADD CONSTRAINT [FK_hotels_trip_private_trip] FOREIGN KEY ([private_trip_id]) REFERENCES dbo.[private_trips]([private_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__hotels_tr__hotel__1BC821DD')
    ALTER TABLE dbo.[hotels_trip_weekly] ADD CONSTRAINT [FK__hotels_tr__hotel__1BC821DD] FOREIGN KEY ([hotel_id]) REFERENCES dbo.[hotels]([hotel_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__hotels_tr__weekl__1CBC4616')
    ALTER TABLE dbo.[hotels_trip_weekly] ADD CONSTRAINT [FK__hotels_tr__weekl__1CBC4616] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__offers_da__daily__1DB06A4F')
    ALTER TABLE dbo.[offers_daily_trips] ADD CONSTRAINT [FK__offers_da__daily__1DB06A4F] FOREIGN KEY ([daily_trip_id]) REFERENCES dbo.[daily_trips]([daily_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__offers_fa__facil__1EA48E88')
    ALTER TABLE dbo.[offers_facilities] ADD CONSTRAINT [FK__offers_fa__facil__1EA48E88] FOREIGN KEY ([facility_id]) REFERENCES dbo.[restaurants_cafes]([facility_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__offers_ho__hotel__1F98B2C1')
    ALTER TABLE dbo.[offers_hotels] ADD CONSTRAINT [FK__offers_ho__hotel__1F98B2C1] FOREIGN KEY ([hotel_id]) REFERENCES dbo.[hotels]([hotel_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__offers_we__weekl__208CD6FA')
    ALTER TABLE dbo.[offers_weekly_trips] ADD CONSTRAINT [FK__offers_we__weekl__208CD6FA] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_places_highlights_place')
    ALTER TABLE dbo.[places_tourist_highlights] ADD CONSTRAINT [FK_places_highlights_place] FOREIGN KEY ([place_id]) REFERENCES dbo.[places_tourist]([place_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__places_tr__place__2180FB33')
    ALTER TABLE dbo.[places_trip_weekly] ADD CONSTRAINT [FK__places_tr__place__2180FB33] FOREIGN KEY ([place_id]) REFERENCES dbo.[places_tourist]([place_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__places_tr__weekl__22751F6C')
    ALTER TABLE dbo.[places_trip_weekly] ADD CONSTRAINT [FK__places_tr__weekl__22751F6C] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_private_trip_stations_trip')
    ALTER TABLE dbo.[private_trip_stations] ADD CONSTRAINT [FK_private_trip_stations_trip] FOREIGN KEY ([private_trip_id]) REFERENCES dbo.[private_trips]([private_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__private_t__guide__25518C17')
    ALTER TABLE dbo.[private_trips] ADD CONSTRAINT [FK__private_t__guide__25518C17] FOREIGN KEY ([guide_license_number]) REFERENCES dbo.[tour_guides]([license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__private_t__touri__2645B050')
    ALTER TABLE dbo.[private_trips] ADD CONSTRAINT [FK__private_t__touri__2645B050] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_private_trips_vehicle')
    ALTER TABLE dbo.[private_trips] ADD CONSTRAINT [FK_private_trips_vehicle] FOREIGN KEY ([vehicle_plate]) REFERENCES dbo.[vehicles]([plate_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_restaurant_features_facility')
    ALTER TABLE dbo.[restaurant_features] ADD CONSTRAINT [FK_restaurant_features_facility] FOREIGN KEY ([facility_id]) REFERENCES dbo.[restaurants_cafes]([facility_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_restaurants_trip_weekly_facility')
    ALTER TABLE dbo.[restaurants_trip_weekly] ADD CONSTRAINT [FK_restaurants_trip_weekly_facility] FOREIGN KEY ([facility_id]) REFERENCES dbo.[restaurants_cafes]([facility_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_restaurants_trip_weekly_trip')
    ALTER TABLE dbo.[restaurants_trip_weekly] ADD CONSTRAINT [FK_restaurants_trip_weekly_trip] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_d__daily__2739D489')
    ALTER TABLE dbo.[reviews_daily_trips] ADD CONSTRAINT [FK__reviews_d__daily__2739D489] FOREIGN KEY ([daily_trip_id]) REFERENCES dbo.[daily_trips]([daily_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_d__touri__282DF8C2')
    ALTER TABLE dbo.[reviews_daily_trips] ADD CONSTRAINT [FK__reviews_d__touri__282DF8C2] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_f__facil__29221CFB')
    ALTER TABLE dbo.[reviews_facilities] ADD CONSTRAINT [FK__reviews_f__facil__29221CFB] FOREIGN KEY ([facility_id]) REFERENCES dbo.[restaurants_cafes]([facility_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_f__touri__2A164134')
    ALTER TABLE dbo.[reviews_facilities] ADD CONSTRAINT [FK__reviews_f__touri__2A164134] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_h__hotel__2B0A656D')
    ALTER TABLE dbo.[reviews_hotels] ADD CONSTRAINT [FK__reviews_h__hotel__2B0A656D] FOREIGN KEY ([hotel_id]) REFERENCES dbo.[hotels]([hotel_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_h__touri__2BFE89A6')
    ALTER TABLE dbo.[reviews_hotels] ADD CONSTRAINT [FK__reviews_h__touri__2BFE89A6] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_w__touri__2CF2ADDF')
    ALTER TABLE dbo.[reviews_weekly_trips] ADD CONSTRAINT [FK__reviews_w__touri__2CF2ADDF] FOREIGN KEY ([tourist_id]) REFERENCES dbo.[tourists]([tourist_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__reviews_w__weekl__2DE6D218')
    ALTER TABLE dbo.[reviews_weekly_trips] ADD CONSTRAINT [FK__reviews_w__weekl__2DE6D218] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__vehicles__contra__2EDAF651')
    ALTER TABLE dbo.[vehicles] ADD CONSTRAINT [FK__vehicles__contra__2EDAF651] FOREIGN KEY ([contract_number]) REFERENCES dbo.[transportation_companies]([contract_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_weekly_stations_trip')
    ALTER TABLE dbo.[weekly_trip_stations] ADD CONSTRAINT [FK_weekly_stations_trip] FOREIGN KEY ([weekly_trip_id]) REFERENCES dbo.[weekly_trips]([weekly_trip_id]) ON DELETE CASCADE;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK__weekly_tr__guide__31B762FC')
    ALTER TABLE dbo.[weekly_trips] ADD CONSTRAINT [FK__weekly_tr__guide__31B762FC] FOREIGN KEY ([guide_license_number]) REFERENCES dbo.[tour_guides]([license_number]);
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_weekly_trips_vehicle')
    ALTER TABLE dbo.[weekly_trips] ADD CONSTRAINT [FK_weekly_trips_vehicle] FOREIGN KEY ([vehicle_plate]) REFERENCES dbo.[vehicles]([plate_number]);
GO
