/* ==============================================================================
   DELNI PLATFORM - COMPLETE DATABASE SCHEMA (DelniDB)
   Platform: Microsoft SQL Server 2019 / 2022+ / Azure SQL
   Generated: 2026-10-27T11:09:22.919Z
   Status: 100% Up-To-Date with all relational tables, constraints & new fields
   ============================================================================== */

IF DB_ID(N'DelniDB') IS NULL
BEGIN
    CREATE DATABASE [DelniDB];
END;
GO

USE [DelniDB];
GO

/* ------------------------------------------------------------
   Table: [tourists]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[tourists]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[tourists] (
        [tourist_id] VARCHAR(50) NOT NULL,
        [full_name] NVARCHAR(150) NOT NULL,
        [email] VARCHAR(100) NOT NULL,
        [phone_number] VARCHAR(20) NOT NULL,
        [password] VARCHAR(255) NOT NULL,
        [account_status] NVARCHAR(50) NULL DEFAULT ('???'),
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_tourists] PRIMARY KEY CLUSTERED ([tourist_id]),
        CONSTRAINT [UQ_tourists_phone_number] UNIQUE ([phone_number]),
        CONSTRAINT [UQ_tourists_email] UNIQUE ([email])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [tour_guides]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[tour_guides]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[tour_guides] (
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
        [digital_certificate_file] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_tour_guides] PRIMARY KEY CLUSTERED ([license_number]),
        CONSTRAINT [UQ_tour_guides_phone_number] UNIQUE ([phone_number]),
        CONSTRAINT [UQ_tour_guides_email] UNIQUE ([email]),
        CONSTRAINT [chk_experience] CHECK ([years_of_experience]>=(2))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [transportation_companies]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[transportation_companies]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[transportation_companies] (
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
        [google_maps_url] NVARCHAR(500) NULL,
        CONSTRAINT [PK_transportation_companies] PRIMARY KEY CLUSTERED ([contract_number]),
        CONSTRAINT [UQ_transportation_companies_phone_number] UNIQUE ([phone_number]),
        CONSTRAINT [chk_total_vehicles] CHECK ([total_vehicles]>=(0))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [places_tourist]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[places_tourist]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[places_tourist] (
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
        [highlights] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_places_tourist] PRIMARY KEY CLUSTERED ([place_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [vehicles]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[vehicles]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[vehicles] (
        [plate_number] VARCHAR(30) NOT NULL,
        [vehicle_type] NVARCHAR(100) NULL,
        [seating_capacity] INT NOT NULL,
        [vehicle_status] NVARCHAR(50) NULL,
        [contract_number] VARCHAR(50) NOT NULL,
        [daily_rate] DECIMAL(10, 2) NULL,
        [category] NVARCHAR(100) NULL,
        [insurance_image] NVARCHAR(MAX) NULL,
        [vehicle_image] NVARCHAR(MAX) NULL,
        CONSTRAINT [PK_vehicles] PRIMARY KEY CLUSTERED ([plate_number]),
        CONSTRAINT [chk_seating] CHECK ([seating_capacity]>(0))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [drivers]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[drivers]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[drivers] (
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
        [operational_status] NVARCHAR(50) NULL,
        CONSTRAINT [PK_drivers] PRIMARY KEY CLUSTERED ([driver_license_number]),
        CONSTRAINT [UQ_drivers_national_id_or_passport] UNIQUE ([national_id_or_passport]),
        CONSTRAINT [UQ_drivers_phone_number] UNIQUE ([phone_number]),
        CONSTRAINT [UQ_drivers_email] UNIQUE ([email])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [daily_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[daily_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[daily_trips] (
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [trip_title] NVARCHAR(200) NOT NULL,
        [description] NVARCHAR(MAX) NOT NULL,
        [price_per_seat] DECIMAL(10, 2) NOT NULL,
        [is_active] BIT NOT NULL DEFAULT ((1)),
        [max_capacity] INT NOT NULL,
        [available_seats] INT NOT NULL,
        [guide_license_number] VARCHAR(50) NOT NULL,
        [departure_city] NVARCHAR(100) NULL,
        [destination_city] NVARCHAR(100) NULL,
        [google_maps_url] NVARCHAR(500) NULL,
        [vehicle_plate] NVARCHAR(50) NULL,
        [restaurant_id] NVARCHAR(50) NULL,
        [departure_date] DATETIME NULL,
        [return_date] DATETIME NULL,
        [photo_1] NVARCHAR(500) NULL,
        [photo_2] NVARCHAR(500) NULL,
        [photo_3] NVARCHAR(500) NULL,
        [photo_4] NVARCHAR(500) NULL,
        [photo_5] NVARCHAR(500) NULL,
        CONSTRAINT [PK_daily_trips] PRIMARY KEY CLUSTERED ([daily_trip_id]),
        CONSTRAINT [chk_daily_capacity] CHECK ([max_capacity]>(0)),
        CONSTRAINT [chk_daily_price] CHECK ([price_per_seat]>(0)),
        CONSTRAINT [chk_daily_seats] CHECK ([available_seats]>=(0) AND [available_seats]<=[max_capacity]),
        CONSTRAINT [CK_daily_trips_capacity] CHECK ([max_capacity]=(50) OR [max_capacity]=(25) OR [max_capacity]=(15))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [weekly_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[weekly_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[weekly_trips] (
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
        [vehicle_plate] NVARCHAR(50) NULL,
        [photo_1] NVARCHAR(500) NULL,
        [photo_2] NVARCHAR(500) NULL,
        [photo_3] NVARCHAR(500) NULL,
        [photo_4] NVARCHAR(500) NULL,
        [photo_5] NVARCHAR(500) NULL,
        CONSTRAINT [PK_weekly_trips] PRIMARY KEY CLUSTERED ([weekly_trip_id]),
        CONSTRAINT [chk_weekly_capacity] CHECK ([max_capacity]>(0)),
        CONSTRAINT [chk_weekly_dates] CHECK ([end_date]>[start_date]),
        CONSTRAINT [chk_weekly_price] CHECK ([seat_per_price]>(0)),
        CONSTRAINT [chk_weekly_seats] CHECK ([available_seats]>=(0) AND [available_seats]<=[max_capacity])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [private_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[private_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[private_trips] (
        [private_trip_id] VARCHAR(50) NOT NULL,
        [status_order] NVARCHAR(50) NULL,
        [customer_description] VARCHAR(100) NOT NULL,
        [preferred_start_date] DATE NOT NULL,
        [duration_days] INT NOT NULL,
        [number_of_companions] INT NOT NULL,
        [quoted_price] DECIMAL(10, 2) NULL,
        [admin_itinerary_plan] TEXT NULL,
        [guide_license_number] VARCHAR(50) NULL,
        [tourist_id] VARCHAR(50) NULL,
        [customer_name] VARCHAR(100) NULL,
        [customer_phone] VARCHAR(20) NULL,
        [customer_requirements] TEXT NULL,
        [assigned_vehicle] NVARCHAR(50) NULL,
        CONSTRAINT [PK_private_trips] PRIMARY KEY CLUSTERED ([private_trip_id]),
        CONSTRAINT [chk_private_companions] CHECK ([number_of_companions]>=(0)),
        CONSTRAINT [chk_private_days] CHECK ([duration_days]>(0)),
        CONSTRAINT [chk_quoted_price] CHECK ([quoted_price]>=(0))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [hotels]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[hotels]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[hotels] (
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
        [contract_end_date] NVARCHAR(50) NULL,
        CONSTRAINT [PK_hotels] PRIMARY KEY CLUSTERED ([hotel_id]),
        CONSTRAINT [chk_stars] CHECK ([star_rating]>=(1) AND [star_rating]<=(5))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [hotel_amenities]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[hotel_amenities]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[hotel_amenities] (
        [hotel_id] VARCHAR(50) NOT NULL,
        [amenity] NVARCHAR(100) NOT NULL,
        CONSTRAINT [PK_hotel_amenities] PRIMARY KEY CLUSTERED ([hotel_id], [amenity])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [restaurants_cafes]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[restaurants_cafes]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[restaurants_cafes] (
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
        [partnership_status] NVARCHAR(50) NULL DEFAULT (N'نشط'),
        CONSTRAINT [PK_restaurants_cafes] PRIMARY KEY CLUSTERED ([facility_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [restaurant_features]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[restaurant_features]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[restaurant_features] (
        [facility_id] VARCHAR(50) NOT NULL,
        [feature] NVARCHAR(100) NOT NULL,
        CONSTRAINT [PK_restaurant_features] PRIMARY KEY CLUSTERED ([facility_id], [feature])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [notifications]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[notifications]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[notifications] (
        [id] VARCHAR(50) NOT NULL,
        [type] NVARCHAR(50) NULL DEFAULT ('system'),
        [title] NVARCHAR(255) NOT NULL,
        [body] NVARCHAR(MAX) NOT NULL,
        [recipient_role] NVARCHAR(50) NULL DEFAULT ('all'),
        [recipient_id] NVARCHAR(100) NULL,
        [link] NVARCHAR(255) NULL,
        [is_read] BIT NULL DEFAULT ((0)),
        [created_at] DATETIME NULL DEFAULT (getdate()),
        [dedupe_key] VARCHAR(100) NULL,
        CONSTRAINT [PK_notifications] PRIMARY KEY CLUSTERED ([id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [tourist_favorites]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[tourist_favorites]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[tourist_favorites] (
        [favorite_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [item_type] NVARCHAR(50) NOT NULL,
        [item_id] VARCHAR(50) NOT NULL,
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_tourist_favorites] PRIMARY KEY CLUSTERED ([favorite_id]),
        CONSTRAINT [UQ_tourist_favorites_tourist_id] UNIQUE ([tourist_id]),
        CONSTRAINT [UQ_tourist_favorites_item_type] UNIQUE ([item_type]),
        CONSTRAINT [UQ_tourist_favorites_item_id] UNIQUE ([item_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [guide_places]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[guide_places]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[guide_places] (
        [license_number] VARCHAR(50) NOT NULL,
        [place_id] VARCHAR(50) NOT NULL,
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_guide_places] PRIMARY KEY CLUSTERED ([license_number], [place_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [daily_trip_stations]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[daily_trip_stations]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[daily_trip_stations] (
        [station_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [station_order] INT NOT NULL DEFAULT ((1)),
        [station_title] NVARCHAR(150) NOT NULL,
        [station_time] VARCHAR(30) NOT NULL,
        [station_desc] NVARCHAR(MAX) NULL,
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_daily_trip_stations] PRIMARY KEY CLUSTERED ([station_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [daily_trip_days]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[daily_trip_days]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[daily_trip_days] (
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [day_of_week] NVARCHAR(50) NOT NULL,
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_daily_trip_days] PRIMARY KEY CLUSTERED ([daily_trip_id], [day_of_week])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [weekly_trip_stations]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[weekly_trip_stations]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[weekly_trip_stations] (
        [station_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [station_order] INT NOT NULL DEFAULT ((1)),
        [day_number] INT NOT NULL DEFAULT ((1)),
        [station_title] NVARCHAR(200) NOT NULL,
        [station_desc] NVARCHAR(MAX) NULL,
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_weekly_trip_stations] PRIMARY KEY CLUSTERED ([station_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [places_trip_daily]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[places_trip_daily]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[places_trip_daily] (
        [place_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        CONSTRAINT [PK_places_trip_daily] PRIMARY KEY CLUSTERED ([place_id], [daily_trip_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [places_trip_weekly]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[places_trip_weekly]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[places_trip_weekly] (
        [place_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        CONSTRAINT [PK_places_trip_weekly] PRIMARY KEY CLUSTERED ([place_id], [weekly_trip_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [places_trip_private]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[places_trip_private]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[places_trip_private] (
        [private_trip_id] VARCHAR(50) NOT NULL,
        [place_id] VARCHAR(50) NOT NULL,
        [visit_order] INT NULL DEFAULT ((1)),
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_places_trip_private] PRIMARY KEY CLUSTERED ([private_trip_id], [place_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [private_trip_vehicles]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[private_trip_vehicles]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[private_trip_vehicles] (
        [private_alloc_id] VARCHAR(50) NOT NULL,
        [private_trip_id] VARCHAR(50) NOT NULL,
        [plate_number] VARCHAR(30) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [allocation_status] VARCHAR(25) NOT NULL DEFAULT ('?????'),
        CONSTRAINT [PK_private_trip_vehicles] PRIMARY KEY CLUSTERED ([private_alloc_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [hotels_trip_weekly]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[hotels_trip_weekly]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[hotels_trip_weekly] (
        [hotel_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        CONSTRAINT [PK_hotels_trip_weekly] PRIMARY KEY CLUSTERED ([hotel_id], [weekly_trip_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [restaurants_trip_weekly]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[restaurants_trip_weekly]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[restaurants_trip_weekly] (
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [facility_id] VARCHAR(50) NOT NULL,
        CONSTRAINT [PK_restaurants_trip_weekly] PRIMARY KEY CLUSTERED ([weekly_trip_id], [facility_id])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [offers_daily_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[offers_daily_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[offers_daily_trips] (
        [offer_daily_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [offer_title] NVARCHAR(250) NULL,
        [description] NVARCHAR(MAX) NULL,
        [percent_discount] DECIMAL(5, 2) NOT NULL,
        [offer_image_url] VARCHAR(255) NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [badge] NVARCHAR(100) NULL,
        CONSTRAINT [PK_offers_daily_trips] PRIMARY KEY CLUSTERED ([offer_daily_id]),
        CONSTRAINT [chk_daily_discount] CHECK ([percent_discount]>=(0) AND [percent_discount]<=(100)),
        CONSTRAINT [chk_offer_daily_dates] CHECK ([end_date]>[start_date])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [offers_weekly_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[offers_weekly_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[offers_weekly_trips] (
        [offer_weekly_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [offer_title] NVARCHAR(250) NULL,
        [description] NVARCHAR(MAX) NULL,
        [discount_percentage] DECIMAL(5, 2) NOT NULL,
        [offer_image_url] VARCHAR(255) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [badge] NVARCHAR(100) NULL,
        CONSTRAINT [PK_offers_weekly_trips] PRIMARY KEY CLUSTERED ([offer_weekly_id]),
        CONSTRAINT [chk_offer_weekly_dates] CHECK ([end_date]>[start_date]),
        CONSTRAINT [chk_weekly_discount] CHECK ([discount_percentage]>=(0) AND [discount_percentage]<=(100))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [offers_hotels]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[offers_hotels]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[offers_hotels] (
        [id_offer] VARCHAR(50) NOT NULL,
        [title_offer] VARCHAR(100) NOT NULL,
        [description] TEXT NOT NULL,
        [percent_discount] INT NOT NULL,
        [offer_image] VARCHAR(255) NOT NULL,
        [hotel_id] VARCHAR(50) NOT NULL,
        [date_start] DATE NOT NULL,
        [date_end] DATE NOT NULL,
        [badge] VARCHAR(50) NULL,
        CONSTRAINT [PK_offers_hotels] PRIMARY KEY CLUSTERED ([id_offer]),
        CONSTRAINT [chk_hotel_discount] CHECK ([percent_discount]>=(0) AND [percent_discount]<=(100)),
        CONSTRAINT [chk_offer_hotel_dates] CHECK ([date_end]>[date_start])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [offers_facilities]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[offers_facilities]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[offers_facilities] (
        [facility_offer_id] VARCHAR(50) NOT NULL,
        [facility_id] VARCHAR(50) NOT NULL,
        [description] TEXT NOT NULL,
        [offer_title] VARCHAR(100) NOT NULL,
        [offer_image_url] VARCHAR(255) NOT NULL,
        [discount_percentage] DECIMAL(5, 2) NOT NULL,
        [start_date] DATE NOT NULL,
        [end_date] DATE NOT NULL,
        [badge] VARCHAR(50) NULL,
        CONSTRAINT [PK_offers_facilities] PRIMARY KEY CLUSTERED ([facility_offer_id]),
        CONSTRAINT [chk_facility_discount] CHECK ([discount_percentage]>=(0) AND [discount_percentage]<=(100)),
        CONSTRAINT [chk_offer_facility_dates] CHECK ([end_date]>=[start_date])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [reviews_daily_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[reviews_daily_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[reviews_daily_trips] (
        [review_daily_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] TEXT NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate()),
        CONSTRAINT [PK_reviews_daily_trips] PRIMARY KEY CLUSTERED ([review_daily_id]),
        CONSTRAINT [chk_daily_stars] CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [reviews_weekly_trips]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[reviews_weekly_trips]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[reviews_weekly_trips] (
        [review_weekly_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] TEXT NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate()),
        CONSTRAINT [PK_reviews_weekly_trips] PRIMARY KEY CLUSTERED ([review_weekly_id]),
        CONSTRAINT [chk_weekly_stars] CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [reviews_hotels]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[reviews_hotels]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[reviews_hotels] (
        [review_hotel_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [hotel_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] NVARCHAR(MAX) NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate()),
        CONSTRAINT [PK_reviews_hotels] PRIMARY KEY CLUSTERED ([review_hotel_id]),
        CONSTRAINT [chk_hotel_review_stars] CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [reviews_facilities]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[reviews_facilities]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[reviews_facilities] (
        [review_facility_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [facility_id] VARCHAR(50) NOT NULL,
        [stars_rating] INT NOT NULL,
        [comment_text] NVARCHAR(MAX) NULL,
        [created_at] DATETIME NOT NULL DEFAULT (getdate()),
        CONSTRAINT [PK_reviews_facilities] PRIMARY KEY CLUSTERED ([review_facility_id]),
        CONSTRAINT [chk_facility_review_stars] CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [bookings_daily]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[bookings_daily]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[bookings_daily] (
        [booking_daily_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [daily_trip_id] VARCHAR(50) NOT NULL,
        [booking_date] DATETIME NOT NULL DEFAULT (getdate()),
        [number_of_seats] INT NOT NULL,
        [booking_status] NVARCHAR(50) NOT NULL DEFAULT (N'مؤكد'),
        [total_price] DECIMAL(10, 2) NOT NULL,
        [payment_status] NVARCHAR(50) NOT NULL DEFAULT (N'مدفوع'),
        [attended] BIT NOT NULL DEFAULT ((0)),
        CONSTRAINT [PK_bookings_daily] PRIMARY KEY CLUSTERED ([booking_daily_id]),
        CONSTRAINT [chk_daily_booking_seats] CHECK ([number_of_seats]>(0)),
        CONSTRAINT [chk_daily_total] CHECK ([total_price]>=(0))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [bookings_weekly]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[bookings_weekly]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[bookings_weekly] (
        [booking_weekly_id] VARCHAR(50) NOT NULL,
        [tourist_id] VARCHAR(50) NOT NULL,
        [weekly_trip_id] VARCHAR(50) NOT NULL,
        [booking_date] DATETIME NOT NULL DEFAULT (getdate()),
        [number_of_seats] INT NOT NULL,
        [total_price] DECIMAL(10, 2) NOT NULL,
        [booking_status] NVARCHAR(50) NOT NULL DEFAULT (N'مؤكد'),
        [payment_status] NVARCHAR(50) NOT NULL DEFAULT (N'مدفوع'),
        [attended] BIT NOT NULL DEFAULT ((0)),
        CONSTRAINT [PK_bookings_weekly] PRIMARY KEY CLUSTERED ([booking_weekly_id]),
        CONSTRAINT [chk_weekly_booking_seats] CHECK ([number_of_seats]>(0)),
        CONSTRAINT [chk_weekly_total] CHECK ([total_price]>=(0))
    );
END;
GO

/* ------------------------------------------------------------
   Table: [guide_working_days]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[guide_working_days]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[guide_working_days] (
        [license_number] VARCHAR(50) NOT NULL,
        [day_of_week] NVARCHAR(50) NOT NULL,
        CONSTRAINT [PK_guide_working_days] PRIMARY KEY CLUSTERED ([license_number], [day_of_week])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [guide_operating_regions]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[guide_operating_regions]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[guide_operating_regions] (
        [license_number] VARCHAR(50) NOT NULL,
        [region] NVARCHAR(100) NOT NULL,
        CONSTRAINT [PK_guide_operating_regions] PRIMARY KEY CLUSTERED ([license_number], [region])
    );
END;
GO

/* ------------------------------------------------------------
   Table: [places_tourist_highlights]
   ------------------------------------------------------------ */
IF OBJECT_ID(N'dbo.[places_tourist_highlights]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[places_tourist_highlights] (
        [highlight_id] VARCHAR(50) NOT NULL,
        [place_id] VARCHAR(50) NOT NULL,
        [highlight_name] NVARCHAR(250) NOT NULL,
        [display_order] INT NOT NULL DEFAULT ((1)),
        [created_at] DATETIME NULL DEFAULT (getdate()),
        CONSTRAINT [PK_places_tourist_highlights] PRIMARY KEY CLUSTERED ([highlight_id])
    );
END;
GO

/* ==============================================================================
   FOREIGN KEY RELATIONSHIPS
   ============================================================================== */
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__bookings___daily__1332DBDC' AND parent_object_id = OBJECT_ID(N'dbo.[bookings_daily]'))
BEGIN
    ALTER TABLE [dbo].[bookings_daily] WITH CHECK ADD CONSTRAINT [FK__bookings___daily__1332DBDC] FOREIGN KEY ([daily_trip_id])
    REFERENCES [dbo].[daily_trips] ([daily_trip_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__bookings___touri__14270015' AND parent_object_id = OBJECT_ID(N'dbo.[bookings_daily]'))
BEGIN
    ALTER TABLE [dbo].[bookings_daily] WITH CHECK ADD CONSTRAINT [FK__bookings___touri__14270015] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__bookings___touri__151B244E' AND parent_object_id = OBJECT_ID(N'dbo.[bookings_weekly]'))
BEGIN
    ALTER TABLE [dbo].[bookings_weekly] WITH CHECK ADD CONSTRAINT [FK__bookings___touri__151B244E] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__bookings___weekl__160F4887' AND parent_object_id = OBJECT_ID(N'dbo.[bookings_weekly]'))
BEGIN
    ALTER TABLE [dbo].[bookings_weekly] WITH CHECK ADD CONSTRAINT [FK__bookings___weekl__160F4887] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_daily_trip_days_trip' AND parent_object_id = OBJECT_ID(N'dbo.[daily_trip_days]'))
BEGIN
    ALTER TABLE [dbo].[daily_trip_days] WITH CHECK ADD CONSTRAINT [FK_daily_trip_days_trip] FOREIGN KEY ([daily_trip_id])
    REFERENCES [dbo].[daily_trips] ([daily_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_daily_trip_stations_trips' AND parent_object_id = OBJECT_ID(N'dbo.[daily_trip_stations]'))
BEGIN
    ALTER TABLE [dbo].[daily_trip_stations] WITH CHECK ADD CONSTRAINT [FK_daily_trip_stations_trips] FOREIGN KEY ([daily_trip_id])
    REFERENCES [dbo].[daily_trips] ([daily_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__daily_tri__guide__18EBB532' AND parent_object_id = OBJECT_ID(N'dbo.[daily_trips]'))
BEGIN
    ALTER TABLE [dbo].[daily_trips] WITH CHECK ADD CONSTRAINT [FK__daily_tri__guide__18EBB532] FOREIGN KEY ([guide_license_number])
    REFERENCES [dbo].[tour_guides] ([license_number]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__drivers__assigne__19DFD96B' AND parent_object_id = OBJECT_ID(N'dbo.[drivers]'))
BEGIN
    ALTER TABLE [dbo].[drivers] WITH CHECK ADD CONSTRAINT [FK__drivers__assigne__19DFD96B] FOREIGN KEY ([assigned_vehicle_plate])
    REFERENCES [dbo].[vehicles] ([plate_number]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__drivers__contrac__1AD3FDA4' AND parent_object_id = OBJECT_ID(N'dbo.[drivers]'))
BEGIN
    ALTER TABLE [dbo].[drivers] WITH CHECK ADD CONSTRAINT [FK__drivers__contrac__1AD3FDA4] FOREIGN KEY ([contract_number])
    REFERENCES [dbo].[transportation_companies] ([contract_number]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_guide_places_guide' AND parent_object_id = OBJECT_ID(N'dbo.[guide_places]'))
BEGIN
    ALTER TABLE [dbo].[guide_places] WITH CHECK ADD CONSTRAINT [FK_guide_places_guide] FOREIGN KEY ([license_number])
    REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_guide_places_place' AND parent_object_id = OBJECT_ID(N'dbo.[guide_places]'))
BEGIN
    ALTER TABLE [dbo].[guide_places] WITH CHECK ADD CONSTRAINT [FK_guide_places_place] FOREIGN KEY ([place_id])
    REFERENCES [dbo].[places_tourist] ([place_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_guide_working_days_guide' AND parent_object_id = OBJECT_ID(N'dbo.[guide_working_days]'))
BEGIN
    ALTER TABLE [dbo].[guide_working_days] WITH CHECK ADD CONSTRAINT [FK_guide_working_days_guide] FOREIGN KEY ([license_number])
    REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_guide_operating_regions_guide' AND parent_object_id = OBJECT_ID(N'dbo.[guide_operating_regions]'))
BEGIN
    ALTER TABLE [dbo].[guide_operating_regions] WITH CHECK ADD CONSTRAINT [FK_guide_operating_regions_guide] FOREIGN KEY ([license_number])
    REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__hotels_tr__hotel__1BC821DD' AND parent_object_id = OBJECT_ID(N'dbo.[hotels_trip_weekly]'))
BEGIN
    ALTER TABLE [dbo].[hotels_trip_weekly] WITH CHECK ADD CONSTRAINT [FK__hotels_tr__hotel__1BC821DD] FOREIGN KEY ([hotel_id])
    REFERENCES [dbo].[hotels] ([hotel_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_hotel_amenities_hotel' AND parent_object_id = OBJECT_ID(N'dbo.[hotel_amenities]'))
BEGIN
    ALTER TABLE [dbo].[hotel_amenities] WITH CHECK ADD CONSTRAINT [FK_hotel_amenities_hotel] FOREIGN KEY ([hotel_id])
    REFERENCES [dbo].[hotels] ([hotel_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__hotels_tr__weekl__1CBC4616' AND parent_object_id = OBJECT_ID(N'dbo.[hotels_trip_weekly]'))
BEGIN
    ALTER TABLE [dbo].[hotels_trip_weekly] WITH CHECK ADD CONSTRAINT [FK__hotels_tr__weekl__1CBC4616] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__offers_da__daily__1DB06A4F' AND parent_object_id = OBJECT_ID(N'dbo.[offers_daily_trips]'))
BEGIN
    ALTER TABLE [dbo].[offers_daily_trips] WITH CHECK ADD CONSTRAINT [FK__offers_da__daily__1DB06A4F] FOREIGN KEY ([daily_trip_id])
    REFERENCES [dbo].[daily_trips] ([daily_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__offers_fa__facil__1EA48E88' AND parent_object_id = OBJECT_ID(N'dbo.[offers_facilities]'))
BEGIN
    ALTER TABLE [dbo].[offers_facilities] WITH CHECK ADD CONSTRAINT [FK__offers_fa__facil__1EA48E88] FOREIGN KEY ([facility_id])
    REFERENCES [dbo].[restaurants_cafes] ([facility_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_restaurant_features_facility' AND parent_object_id = OBJECT_ID(N'dbo.[restaurant_features]'))
BEGIN
    ALTER TABLE [dbo].[restaurant_features] WITH CHECK ADD CONSTRAINT [FK_restaurant_features_facility] FOREIGN KEY ([facility_id])
    REFERENCES [dbo].[restaurants_cafes] ([facility_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__offers_ho__hotel__1F98B2C1' AND parent_object_id = OBJECT_ID(N'dbo.[offers_hotels]'))
BEGIN
    ALTER TABLE [dbo].[offers_hotels] WITH CHECK ADD CONSTRAINT [FK__offers_ho__hotel__1F98B2C1] FOREIGN KEY ([hotel_id])
    REFERENCES [dbo].[hotels] ([hotel_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__offers_we__weekl__208CD6FA' AND parent_object_id = OBJECT_ID(N'dbo.[offers_weekly_trips]'))
BEGIN
    ALTER TABLE [dbo].[offers_weekly_trips] WITH CHECK ADD CONSTRAINT [FK__offers_we__weekl__208CD6FA] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_places_highlights_place' AND parent_object_id = OBJECT_ID(N'dbo.[places_tourist_highlights]'))
BEGIN
    ALTER TABLE [dbo].[places_tourist_highlights] WITH CHECK ADD CONSTRAINT [FK_places_highlights_place] FOREIGN KEY ([place_id])
    REFERENCES [dbo].[places_tourist] ([place_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__places_tr__place__2180FB33' AND parent_object_id = OBJECT_ID(N'dbo.[places_trip_weekly]'))
BEGIN
    ALTER TABLE [dbo].[places_trip_weekly] WITH CHECK ADD CONSTRAINT [FK__places_tr__place__2180FB33] FOREIGN KEY ([place_id])
    REFERENCES [dbo].[places_tourist] ([place_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__places_tr__weekl__22751F6C' AND parent_object_id = OBJECT_ID(N'dbo.[places_trip_weekly]'))
BEGIN
    ALTER TABLE [dbo].[places_trip_weekly] WITH CHECK ADD CONSTRAINT [FK__places_tr__weekl__22751F6C] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__private_t__guide__25518C17' AND parent_object_id = OBJECT_ID(N'dbo.[private_trips]'))
BEGIN
    ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CONSTRAINT [FK__private_t__guide__25518C17] FOREIGN KEY ([guide_license_number])
    REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE SET NULL;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__private_t__touri__2645B050' AND parent_object_id = OBJECT_ID(N'dbo.[private_trips]'))
BEGIN
    ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CONSTRAINT [FK__private_t__touri__2645B050] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_restaurants_trip_weekly_facility' AND parent_object_id = OBJECT_ID(N'dbo.[restaurants_trip_weekly]'))
BEGIN
    ALTER TABLE [dbo].[restaurants_trip_weekly] WITH CHECK ADD CONSTRAINT [FK_restaurants_trip_weekly_facility] FOREIGN KEY ([facility_id])
    REFERENCES [dbo].[restaurants_cafes] ([facility_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_restaurants_trip_weekly_trip' AND parent_object_id = OBJECT_ID(N'dbo.[restaurants_trip_weekly]'))
BEGIN
    ALTER TABLE [dbo].[restaurants_trip_weekly] WITH CHECK ADD CONSTRAINT [FK_restaurants_trip_weekly_trip] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_d__daily__2739D489' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_daily_trips]'))
BEGIN
    ALTER TABLE [dbo].[reviews_daily_trips] WITH CHECK ADD CONSTRAINT [FK__reviews_d__daily__2739D489] FOREIGN KEY ([daily_trip_id])
    REFERENCES [dbo].[daily_trips] ([daily_trip_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_d__touri__282DF8C2' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_daily_trips]'))
BEGIN
    ALTER TABLE [dbo].[reviews_daily_trips] WITH CHECK ADD CONSTRAINT [FK__reviews_d__touri__282DF8C2] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_f__facil__29221CFB' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_facilities]'))
BEGIN
    ALTER TABLE [dbo].[reviews_facilities] WITH CHECK ADD CONSTRAINT [FK__reviews_f__facil__29221CFB] FOREIGN KEY ([facility_id])
    REFERENCES [dbo].[restaurants_cafes] ([facility_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_f__touri__2A164134' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_facilities]'))
BEGIN
    ALTER TABLE [dbo].[reviews_facilities] WITH CHECK ADD CONSTRAINT [FK__reviews_f__touri__2A164134] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_h__hotel__2B0A656D' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_hotels]'))
BEGIN
    ALTER TABLE [dbo].[reviews_hotels] WITH CHECK ADD CONSTRAINT [FK__reviews_h__hotel__2B0A656D] FOREIGN KEY ([hotel_id])
    REFERENCES [dbo].[hotels] ([hotel_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_h__touri__2BFE89A6' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_hotels]'))
BEGIN
    ALTER TABLE [dbo].[reviews_hotels] WITH CHECK ADD CONSTRAINT [FK__reviews_h__touri__2BFE89A6] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_w__touri__2CF2ADDF' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_weekly_trips]'))
BEGIN
    ALTER TABLE [dbo].[reviews_weekly_trips] WITH CHECK ADD CONSTRAINT [FK__reviews_w__touri__2CF2ADDF] FOREIGN KEY ([tourist_id])
    REFERENCES [dbo].[tourists] ([tourist_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__reviews_w__weekl__2DE6D218' AND parent_object_id = OBJECT_ID(N'dbo.[reviews_weekly_trips]'))
BEGIN
    ALTER TABLE [dbo].[reviews_weekly_trips] WITH CHECK ADD CONSTRAINT [FK__reviews_w__weekl__2DE6D218] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__vehicles__contra__2EDAF651' AND parent_object_id = OBJECT_ID(N'dbo.[vehicles]'))
BEGIN
    ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CONSTRAINT [FK__vehicles__contra__2EDAF651] FOREIGN KEY ([contract_number])
    REFERENCES [dbo].[transportation_companies] ([contract_number]);
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_weekly_stations_trip' AND parent_object_id = OBJECT_ID(N'dbo.[weekly_trip_stations]'))
BEGIN
    ALTER TABLE [dbo].[weekly_trip_stations] WITH CHECK ADD CONSTRAINT [FK_weekly_stations_trip] FOREIGN KEY ([weekly_trip_id])
    REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
END;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK__weekly_tr__guide__31B762FC' AND parent_object_id = OBJECT_ID(N'dbo.[weekly_trips]'))
BEGIN
    ALTER TABLE [dbo].[weekly_trips] WITH CHECK ADD CONSTRAINT [FK__weekly_tr__guide__31B762FC] FOREIGN KEY ([guide_license_number])
    REFERENCES [dbo].[tour_guides] ([license_number]);
END;
GO

