/* ==========================================================================
   DelniDB - schema generated from the LIVE database (Microsoft SQL Server)
   Generated: 2026-10-24 from INFORMATION_SCHEMA / sys catalog
   Contains: project tables, primary keys, foreign keys, UNIQUE, CHECK, DEFAULT.
   Laravel framework tables (users, sessions, personal_access_tokens, ...)
   are created by the Laravel migrations and are not included here.
   ========================================================================== */

IF DB_ID(N'DelniDB') IS NULL CREATE DATABASE [DelniDB];
GO
USE [DelniDB];
GO

/* ---------- tourists ---------- */
CREATE TABLE [dbo].[tourists] (
    [tourist_id] [varchar](50) NOT NULL,
    [full_name] [nvarchar](150) NOT NULL,
    [email] [varchar](100) NOT NULL,
    [phone_number] [varchar](20) NOT NULL,
    [password] [varchar](255) NOT NULL,
    CONSTRAINT [PK_tourists] PRIMARY KEY CLUSTERED ([tourist_id]),
    CONSTRAINT [UQ__tourists__A1936A6B5C0DFE3D] UNIQUE ([phone_number]),
    CONSTRAINT [UQ__tourists__AB6E6164174DEA96] UNIQUE ([email])
);
GO

/* ---------- tour_guides ---------- */
CREATE TABLE [dbo].[tour_guides] (
    [license_number] [varchar](50) NOT NULL,
    [full_name] [nvarchar](150) NOT NULL,
    [phone_number] [varchar](20) NOT NULL,
    [years_of_experience] [int] NOT NULL,
    [certificate] [nvarchar](500) NULL,
    [bio] [nvarchar](max) NULL,
    [speaks_english] [bit] NOT NULL DEFAULT ((0)),
    [speaks_french] [bit] NOT NULL DEFAULT ((0)),
    [speaks_italian] [bit] NOT NULL DEFAULT ((0)),
    [verification_status] [nvarchar](50) NULL,
    [password] [varchar](255) NOT NULL,
    [email] [varchar](100) NOT NULL,
    [gender] [varchar](10) NULL,
    [working_days] [nvarchar](max) NULL,
    [operating_regions] [nvarchar](max) NULL,
    [primaryRegion] [nvarchar](50) NULL,
    [price_per_day] [decimal](10, 2) NULL,
    [avatar] [nvarchar](max) NULL,
    [title] [nvarchar](150) NULL,
    [specialties] [nvarchar](max) NULL,
    [total_tours_completed] [int] NOT NULL DEFAULT ((0)),
    [digital_certificate_file] [nvarchar](max) NULL,
    [certificate_name] [nvarchar](255) NULL,
    CONSTRAINT [PK_tour_guides] PRIMARY KEY CLUSTERED ([license_number]),
    CONSTRAINT [UQ__tour_gui__A1936A6B186E8C52] UNIQUE ([phone_number]),
    CONSTRAINT [UQ__tour_gui__AB6E6164B1FE7797] UNIQUE ([email])
);
GO

/* ---------- transportation_companies ---------- */
CREATE TABLE [dbo].[transportation_companies] (
    [contract_number] [varchar](50) NOT NULL,
    [company_name] [nvarchar](150) NOT NULL,
    [phone_number] [varchar](20) NOT NULL,
    [address] [nvarchar](255) NULL,
    [total_vehicles] [int] NOT NULL,
    [verification_status] [nvarchar](50) NULL,
    [contract_date] [date] NULL,
    [email] [varchar](100) NULL,
    [password] [varchar](255) NULL,
    [city] [nvarchar](100) NULL,
    [available_vehicles] [int] NULL,
    [contract_start_date] [date] NULL,
    [contract_end_date] [date] NULL,
    CONSTRAINT [PK_transportation_companies] PRIMARY KEY CLUSTERED ([contract_number]),
    CONSTRAINT [UQ__transpor__A1936A6BC61E37EE] UNIQUE ([phone_number])
);
GO

/* ---------- vehicles ---------- */
CREATE TABLE [dbo].[vehicles] (
    [plate_number] [varchar](30) NOT NULL,
    [vehicle_type] [nvarchar](100) NULL,
    [seating_capacity] [int] NOT NULL,
    [vehicle_image] [varchar](255) NULL,
    [vehicle_status] [nvarchar](50) NULL,
    [insurance_details] [nvarchar](max) NULL,
    [contract_number] [varchar](50) NOT NULL,
    [daily_rate] [decimal](10, 2) NULL,
    [category] [nvarchar](50) NULL,
    [photos] [nvarchar](max) NULL,
    [insurance_image] [varchar](255) NULL,
    CONSTRAINT [PK_vehicles] PRIMARY KEY CLUSTERED ([plate_number])
);
GO

/* ---------- drivers ---------- */
CREATE TABLE [dbo].[drivers] (
    [driver_license_number] [varchar](50) NOT NULL,
    [full_name] [nvarchar](150) NOT NULL,
    [phone_number] [varchar](20) NOT NULL,
    [national_id_or_passport] [varchar](50) NOT NULL,
    [license_date_valid] [date] NOT NULL,
    [contract_number] [varchar](50) NOT NULL,
    [assigned_vehicle_plate] [varchar](30) NULL,
    [email] [varchar](100) NOT NULL,
    [account_status] [nvarchar](50) NULL,
    [password] [varchar](255) NOT NULL,
    [operational_status] [nvarchar](50) NULL,
    [experience_years] [int] NULL,
    [driver_photo] [varchar](255) NULL,
    CONSTRAINT [PK_drivers] PRIMARY KEY CLUSTERED ([driver_license_number]),
    CONSTRAINT [UQ__drivers__9DF00BEE4F84C6FA] UNIQUE ([national_id_or_passport]),
    CONSTRAINT [UQ__drivers__A1936A6B76C10A53] UNIQUE ([phone_number]),
    CONSTRAINT [UQ__drivers__AB6E61646740C456] UNIQUE ([email]),
    CONSTRAINT [UQ__drivers__C1C4A7F5ACD9F742] UNIQUE ([assigned_vehicle_plate])
);
GO

/* ---------- places_tourist ---------- */
CREATE TABLE [dbo].[places_tourist] (
    [place_id] [varchar](50) NOT NULL,
    [place_name] [nvarchar](100) NOT NULL,
    [description] [nvarchar](max) NOT NULL,
    [city] [nvarchar](50) NOT NULL,
    [longitude] [decimal](9, 6) NOT NULL,
    [latitude] [decimal](9, 6) NOT NULL,
    [category] [nvarchar](50) NOT NULL,
    [place_image] [varchar](255) NULL,
    [is_unesco] [bit] NOT NULL DEFAULT ((0)),
    [unesco_year] [int] NULL,
    [gallery] [nvarchar](max) NULL,
    [entry_fee] [nvarchar](50) NULL,
    [google_maps_url] [varchar](500) NULL,
    CONSTRAINT [PK_places_tourist] PRIMARY KEY CLUSTERED ([place_id])
);
GO

/* ---------- hotels ---------- */
CREATE TABLE [dbo].[hotels] (
    [hotel_id] [varchar](50) NOT NULL,
    [hotel_name] [nvarchar](150) NOT NULL,
    [city] [nvarchar](100) NULL,
    [address_details] [nvarchar](255) NULL,
    [phone_number] [varchar](20) NOT NULL,
    [star_rating] [int] NOT NULL,
    [partnership_status] [nvarchar](50) NULL,
    [hotel_photo_1] [nvarchar](max) NULL,
    [hotel_photo_2] [nvarchar](max) NULL,
    [hotel_photo_3] [nvarchar](max) NULL,
    [hotel_photo_4] [nvarchar](max) NULL,
    [hotel_photo_5] [nvarchar](max) NULL,
    [contract_date] [date] NULL,
    [verification_status] [nvarchar](50) NULL,
    [property_type] [nvarchar](100) NULL,
    [amenities] [nvarchar](max) NULL,
    CONSTRAINT [PK_hotels] PRIMARY KEY CLUSTERED ([hotel_id])
);
GO

/* ---------- restaurants_cafes ---------- */
CREATE TABLE [dbo].[restaurants_cafes] (
    [facility_id] [varchar](50) NOT NULL,
    [facility_name] [nvarchar](150) NOT NULL,
    [facility_type] [nvarchar](50) NULL,
    [city] [nvarchar](100) NULL,
    [address_details] [nvarchar](255) NULL,
    [phone_number] [varchar](20) NULL,
    [description] [nvarchar](max) NULL,
    [facility_image_1] [nvarchar](max) NULL,
    [facility_image_2] [nvarchar](max) NULL,
    [facility_image_3] [nvarchar](max) NULL,
    [facility_image_4] [nvarchar](max) NULL,
    [facility_image_5] [nvarchar](max) NULL,
    [contract_date] [date] NULL,
    [verification_status] [nvarchar](50) NULL,
    [working_hours] [nvarchar](100) NULL,
    [features] [nvarchar](max) NULL,
    CONSTRAINT [PK_restaurants_cafes] PRIMARY KEY CLUSTERED ([facility_id])
);
GO

/* ---------- daily_trips ---------- */
CREATE TABLE [dbo].[daily_trips] (
    [daily_trip_id] [varchar](50) NOT NULL,
    [trip_title] [nvarchar](200) NOT NULL,
    [description] [nvarchar](max) NULL,
    [price_per_seat] [decimal](10, 2) NOT NULL,
    [is_active] [bit] NOT NULL DEFAULT ((1)),
    [photo] [nvarchar](max) NULL,
    [max_capacity] [int] NOT NULL,
    [available_seats] [int] NOT NULL,
    [guide_license_number] [varchar](50) NULL,
    [departure_city] [nvarchar](100) NULL,
    [destination_city] [nvarchar](100) NULL,
    [recurring_days] [nvarchar](max) NULL,
    [activities] [nvarchar](max) NULL,
    [gallery] [nvarchar](max) NULL,
    CONSTRAINT [PK_daily_trips] PRIMARY KEY CLUSTERED ([daily_trip_id])
);
GO

/* ---------- weekly_trips ---------- */
CREATE TABLE [dbo].[weekly_trips] (
    [weekly_trip_id] [varchar](50) NOT NULL,
    [trip_title] [nvarchar](200) NOT NULL,
    [start_date] [date] NOT NULL,
    [end_date] [date] NOT NULL,
    [max_capacity] [int] NOT NULL,
    [available_seats] [int] NOT NULL,
    [seat_per_price] [decimal](10, 2) NOT NULL,
    [trip_description] [nvarchar](max) NULL,
    [guide_license_number] [varchar](50) NULL,
    [is_active] [bit] NOT NULL DEFAULT ((1)),
    [departure_city] [nvarchar](100) NULL,
    [destination_region] [nvarchar](100) NULL,
    [photo] [nvarchar](max) NULL,
    [gallery] [nvarchar](max) NULL,
    CONSTRAINT [PK_weekly_trips] PRIMARY KEY CLUSTERED ([weekly_trip_id])
);
GO

/* ---------- private_trips ---------- */
CREATE TABLE [dbo].[private_trips] (
    [private_trip_id] [varchar](50) NOT NULL,
    [status_order] [nvarchar](50) NULL,
    [customer_description] [nvarchar](max) NULL,
    [preferred_start_date] [date] NOT NULL,
    [duration_days] [int] NOT NULL,
    [number_of_companions] [int] NOT NULL,
    [quoted_price] [decimal](10, 2) NULL,
    [admin_itinerary_plan] [nvarchar](max) NULL,
    [guide_license_number] [varchar](50) NULL,
    [tourist_id] [varchar](50) NULL,
    [customer_name] [nvarchar](150) NULL,
    [customer_phone] [varchar](20) NULL,
    [customer_requirements] [nvarchar](max) NULL,
    CONSTRAINT [PK_private_trips] PRIMARY KEY CLUSTERED ([private_trip_id])
);
GO

/* ---------- bookings_daily ---------- */
CREATE TABLE [dbo].[bookings_daily] (
    [booking_daily_id] [varchar](50) NOT NULL,
    [tourist_id] [varchar](50) NOT NULL,
    [daily_trip_id] [varchar](50) NOT NULL,
    [booking_date] [datetime] NOT NULL DEFAULT (getdate()),
    [number_of_seats] [int] NOT NULL,
    [booking_status] [nvarchar](100) NULL,
    [total_price] [decimal](10, 2) NOT NULL,
    [trip_date] [date] NULL,
    CONSTRAINT [PK_bookings_daily] PRIMARY KEY CLUSTERED ([booking_daily_id])
);
GO

/* ---------- bookings_weekly ---------- */
CREATE TABLE [dbo].[bookings_weekly] (
    [booking_weekly_id] [varchar](50) NOT NULL,
    [tourist_id] [varchar](50) NOT NULL,
    [weekly_trip_id] [varchar](50) NOT NULL,
    [booking_date] [datetime] NOT NULL DEFAULT (getdate()),
    [number_of_seats] [int] NOT NULL,
    [total_price] [decimal](10, 2) NOT NULL,
    [booking_status] [nvarchar](100) NULL,
    CONSTRAINT [PK_bookings_weekly] PRIMARY KEY CLUSTERED ([booking_weekly_id])
);
GO

/* ---------- daily_trip_vehicles ---------- */
CREATE TABLE [dbo].[daily_trip_vehicles] (
    [daily_alloc_id] [varchar](50) NOT NULL,
    [daily_trip_id] [varchar](50) NOT NULL,
    [plate_number] [varchar](30) NOT NULL,
    [allocation_date] [date] NOT NULL,
    [status] [nvarchar](20) NOT NULL,
    CONSTRAINT [PK_daily_trip_vehicles] PRIMARY KEY CLUSTERED ([daily_alloc_id])
);
GO

/* ---------- weekly_trip_vehicles ---------- */
CREATE TABLE [dbo].[weekly_trip_vehicles] (
    [weekly_alloc_id] [varchar](50) NOT NULL,
    [weekly_trip_id] [varchar](50) NOT NULL,
    [plate_number] [varchar](30) NOT NULL,
    [start_date] [date] NOT NULL,
    [end_date] [date] NOT NULL,
    [status] [nvarchar](20) NOT NULL,
    CONSTRAINT [PK_weekly_trip_vehicles] PRIMARY KEY CLUSTERED ([weekly_alloc_id])
);
GO

/* ---------- private_trip_vehicles ---------- */
CREATE TABLE [dbo].[private_trip_vehicles] (
    [private_alloc_id] [varchar](50) NOT NULL,
    [private_trip_id] [varchar](50) NOT NULL,
    [plate_number] [varchar](30) NOT NULL,
    [start_date] [date] NOT NULL,
    [end_date] [date] NOT NULL,
    [allocation_status] [nvarchar](25) NOT NULL,
    CONSTRAINT [PK_private_trip_vehicles] PRIMARY KEY CLUSTERED ([private_alloc_id])
);
GO

/* ---------- hotels_trip_weekly ---------- */
CREATE TABLE [dbo].[hotels_trip_weekly] (
    [hotel_id] [varchar](50) NOT NULL,
    [weekly_trip_id] [varchar](50) NOT NULL,
    CONSTRAINT [PK_hotels_trip_weekly] PRIMARY KEY CLUSTERED ([hotel_id], [weekly_trip_id])
);
GO

/* ---------- places_trip_weekly ---------- */
CREATE TABLE [dbo].[places_trip_weekly] (
    [place_id] [varchar](50) NOT NULL,
    [weekly_trip_id] [varchar](50) NOT NULL,
    CONSTRAINT [PK_places_trip_weekly] PRIMARY KEY CLUSTERED ([place_id], [weekly_trip_id])
);
GO

/* ---------- offers_daily_trips ---------- */
CREATE TABLE [dbo].[offers_daily_trips] (
    [offer_daily_id] [varchar](50) NOT NULL,
    [daily_trip_id] [varchar](50) NOT NULL,
    [offer_title] [nvarchar](100) NOT NULL,
    [description] [nvarchar](max) NOT NULL,
    [percent_discount] [decimal](5, 2) NOT NULL,
    [offer_image_url] [varchar](255) NULL,
    [start_date] [date] NOT NULL,
    [end_date] [date] NOT NULL,
    [badge] [nvarchar](50) NULL,
    CONSTRAINT [PK_offers_daily_trips] PRIMARY KEY CLUSTERED ([offer_daily_id])
);
GO

/* ---------- offers_weekly_trips ---------- */
CREATE TABLE [dbo].[offers_weekly_trips] (
    [offer_weekly_id] [varchar](50) NOT NULL,
    [weekly_trip_id] [varchar](50) NOT NULL,
    [offer_title] [nvarchar](100) NOT NULL,
    [description] [nvarchar](max) NOT NULL,
    [discount_percentage] [decimal](5, 2) NOT NULL,
    [offer_image_url] [varchar](255) NOT NULL,
    [start_date] [date] NOT NULL,
    [end_date] [date] NOT NULL,
    [badge] [nvarchar](50) NULL,
    CONSTRAINT [PK_offers_weekly_trips] PRIMARY KEY CLUSTERED ([offer_weekly_id])
);
GO

/* ---------- offers_hotels ---------- */
CREATE TABLE [dbo].[offers_hotels] (
    [id_offer] [varchar](50) NOT NULL,
    [title_offer] [nvarchar](100) NOT NULL,
    [description] [nvarchar](max) NOT NULL,
    [percent_discount] [int] NOT NULL,
    [offer_image] [varchar](255) NOT NULL,
    [hotel_id] [varchar](50) NOT NULL,
    [date_start] [date] NOT NULL,
    [date_end] [date] NOT NULL,
    [badge] [nvarchar](50) NULL,
    CONSTRAINT [PK_offers_hotels] PRIMARY KEY CLUSTERED ([id_offer])
);
GO

/* ---------- offers_facilities ---------- */
CREATE TABLE [dbo].[offers_facilities] (
    [facility_offer_id] [varchar](50) NOT NULL,
    [facility_id] [varchar](50) NOT NULL,
    [description] [nvarchar](max) NOT NULL,
    [offer_title] [nvarchar](100) NOT NULL,
    [offer_image_url] [varchar](255) NOT NULL,
    [discount_percentage] [decimal](5, 2) NOT NULL,
    [start_date] [date] NOT NULL,
    [end_date] [date] NOT NULL,
    [badge] [nvarchar](50) NULL,
    CONSTRAINT [PK_offers_facilities] PRIMARY KEY CLUSTERED ([facility_offer_id])
);
GO

/* ---------- reviews_daily_trips ---------- */
CREATE TABLE [dbo].[reviews_daily_trips] (
    [review_daily_id] [varchar](50) NOT NULL,
    [tourist_id] [varchar](50) NOT NULL,
    [daily_trip_id] [varchar](50) NOT NULL,
    [stars_rating] [int] NOT NULL,
    [comment_text] [nvarchar](max) NULL,
    [created_at] [datetime] NOT NULL DEFAULT (getdate()),
    [is_hidden] [bit] NOT NULL DEFAULT ((0)),
    [guide_license_number] [varchar](50) NULL,
    CONSTRAINT [PK_reviews_daily_trips] PRIMARY KEY CLUSTERED ([review_daily_id]),
    CONSTRAINT [UQ_reviews_daily_trips_tourist_item] UNIQUE ([tourist_id], [daily_trip_id])
);
GO

/* ---------- reviews_weekly_trips ---------- */
CREATE TABLE [dbo].[reviews_weekly_trips] (
    [review_weekly_id] [varchar](50) NOT NULL,
    [tourist_id] [varchar](50) NOT NULL,
    [weekly_trip_id] [varchar](50) NOT NULL,
    [stars_rating] [int] NOT NULL,
    [comment_text] [nvarchar](max) NULL,
    [created_at] [datetime] NOT NULL DEFAULT (getdate()),
    [is_hidden] [bit] NOT NULL DEFAULT ((0)),
    [guide_license_number] [varchar](50) NULL,
    CONSTRAINT [PK_reviews_weekly_trips] PRIMARY KEY CLUSTERED ([review_weekly_id]),
    CONSTRAINT [UQ_reviews_weekly_trips_tourist_item] UNIQUE ([tourist_id], [weekly_trip_id])
);
GO

/* ---------- reviews_hotels ---------- */
CREATE TABLE [dbo].[reviews_hotels] (
    [review_hotel_id] [varchar](50) NOT NULL,
    [tourist_id] [varchar](50) NOT NULL,
    [hotel_id] [varchar](50) NOT NULL,
    [stars_rating] [int] NOT NULL,
    [comment_text] [nvarchar](max) NULL,
    [created_at] [datetime] NOT NULL DEFAULT (getdate()),
    [is_hidden] [bit] NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK_reviews_hotels] PRIMARY KEY CLUSTERED ([review_hotel_id]),
    CONSTRAINT [UQ_reviews_hotels_tourist_item] UNIQUE ([tourist_id], [hotel_id])
);
GO

/* ---------- reviews_facilities ---------- */
CREATE TABLE [dbo].[reviews_facilities] (
    [review_facility_id] [varchar](50) NOT NULL,
    [tourist_id] [varchar](50) NOT NULL,
    [facility_id] [varchar](50) NOT NULL,
    [stars_rating] [int] NOT NULL,
    [comment_text] [nvarchar](max) NULL,
    [created_at] [datetime] NOT NULL DEFAULT (getdate()),
    [is_hidden] [bit] NOT NULL DEFAULT ((0)),
    CONSTRAINT [PK_reviews_facilities] PRIMARY KEY CLUSTERED ([review_facility_id]),
    CONSTRAINT [UQ_reviews_facilities_tourist_item] UNIQUE ([tourist_id], [facility_id])
);
GO

/* ---------- CHECK constraints ---------- */
ALTER TABLE [dbo].[bookings_daily] WITH CHECK ADD CHECK ([number_of_seats]>(0));
ALTER TABLE [dbo].[bookings_daily] WITH CHECK ADD CHECK ([total_price]>=(0));
ALTER TABLE [dbo].[bookings_weekly] WITH CHECK ADD CHECK ([number_of_seats]>(0));
ALTER TABLE [dbo].[bookings_weekly] WITH CHECK ADD CHECK ([total_price]>=(0));
ALTER TABLE [dbo].[daily_trips] WITH CHECK ADD CHECK ([max_capacity]>(0));
ALTER TABLE [dbo].[daily_trips] WITH CHECK ADD CHECK ([price_per_seat]>(0));
ALTER TABLE [dbo].[daily_trips] WITH CHECK ADD CHECK ([available_seats]>=(0) AND [available_seats]<=[max_capacity]);
ALTER TABLE [dbo].[hotels] WITH CHECK ADD CHECK ([star_rating]>=(1) AND [star_rating]<=(5));
ALTER TABLE [dbo].[offers_daily_trips] WITH CHECK ADD CHECK ([percent_discount]>=(0) AND [percent_discount]<=(100));
ALTER TABLE [dbo].[offers_daily_trips] WITH CHECK ADD CHECK ([end_date]>[start_date]);
ALTER TABLE [dbo].[offers_facilities] WITH CHECK ADD CHECK ([discount_percentage]>=(0) AND [discount_percentage]<=(100));
ALTER TABLE [dbo].[offers_facilities] WITH CHECK ADD CHECK ([end_date]>=[start_date]);
ALTER TABLE [dbo].[offers_hotels] WITH CHECK ADD CHECK ([percent_discount]>=(0) AND [percent_discount]<=(100));
ALTER TABLE [dbo].[offers_hotels] WITH CHECK ADD CHECK ([date_end]>[date_start]);
ALTER TABLE [dbo].[offers_weekly_trips] WITH CHECK ADD CHECK ([end_date]>[start_date]);
ALTER TABLE [dbo].[offers_weekly_trips] WITH CHECK ADD CHECK ([discount_percentage]>=(0) AND [discount_percentage]<=(100));
ALTER TABLE [dbo].[private_trip_vehicles] WITH CHECK ADD CHECK ([end_date]>=[start_date]);
ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CHECK ([number_of_companions]>=(0));
ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CHECK ([duration_days]>(0));
ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CHECK ([quoted_price]>=(0));
ALTER TABLE [dbo].[reviews_daily_trips] WITH CHECK ADD CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5));
ALTER TABLE [dbo].[reviews_facilities] WITH CHECK ADD CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5));
ALTER TABLE [dbo].[reviews_hotels] WITH CHECK ADD CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5));
ALTER TABLE [dbo].[reviews_weekly_trips] WITH CHECK ADD CHECK ([stars_rating]>=(1) AND [stars_rating]<=(5));
ALTER TABLE [dbo].[tour_guides] WITH CHECK ADD CHECK ([years_of_experience]>=(2));
ALTER TABLE [dbo].[transportation_companies] WITH CHECK ADD CHECK ([total_vehicles]>=(0));
ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CHECK ([seating_capacity]>(0));
ALTER TABLE [dbo].[weekly_trip_vehicles] WITH CHECK ADD CHECK ([end_date]>=[start_date]);
ALTER TABLE [dbo].[weekly_trips] WITH CHECK ADD CHECK ([max_capacity]>(0));
ALTER TABLE [dbo].[weekly_trips] WITH CHECK ADD CHECK ([end_date]>[start_date]);
ALTER TABLE [dbo].[weekly_trips] WITH CHECK ADD CHECK ([seat_per_price]>(0));
ALTER TABLE [dbo].[weekly_trips] WITH CHECK ADD CHECK ([available_seats]>=(0) AND [available_seats]<=[max_capacity]);
GO

/* ---------- Foreign keys ---------- */
ALTER TABLE [dbo].[bookings_daily] WITH CHECK ADD CONSTRAINT [FK_bookings_daily_daily_trip_id] FOREIGN KEY ([daily_trip_id]) REFERENCES [dbo].[daily_trips] ([daily_trip_id]);
ALTER TABLE [dbo].[bookings_daily] WITH CHECK ADD CONSTRAINT [FK_bookings_daily_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[bookings_weekly] WITH CHECK ADD CONSTRAINT [FK_bookings_weekly_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[bookings_weekly] WITH CHECK ADD CONSTRAINT [FK_bookings_weekly_weekly_trip_id] FOREIGN KEY ([weekly_trip_id]) REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]);
ALTER TABLE [dbo].[daily_trip_vehicles] WITH CHECK ADD CONSTRAINT [FK_daily_trip_vehicles_daily_trip_id] FOREIGN KEY ([daily_trip_id]) REFERENCES [dbo].[daily_trips] ([daily_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[daily_trip_vehicles] WITH CHECK ADD CONSTRAINT [FK_daily_trip_vehicles_plate_number] FOREIGN KEY ([plate_number]) REFERENCES [dbo].[vehicles] ([plate_number]) ON DELETE CASCADE;
ALTER TABLE [dbo].[daily_trips] WITH CHECK ADD CONSTRAINT [FK_daily_trips_guide_license_number] FOREIGN KEY ([guide_license_number]) REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE SET NULL;
ALTER TABLE [dbo].[drivers] WITH CHECK ADD CONSTRAINT [FK_drivers_assigned_vehicle_plate] FOREIGN KEY ([assigned_vehicle_plate]) REFERENCES [dbo].[vehicles] ([plate_number]);
ALTER TABLE [dbo].[drivers] WITH CHECK ADD CONSTRAINT [FK_drivers_contract_number] FOREIGN KEY ([contract_number]) REFERENCES [dbo].[transportation_companies] ([contract_number]);
ALTER TABLE [dbo].[hotels_trip_weekly] WITH CHECK ADD CONSTRAINT [FK_hotels_trip_weekly_hotel_id] FOREIGN KEY ([hotel_id]) REFERENCES [dbo].[hotels] ([hotel_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[hotels_trip_weekly] WITH CHECK ADD CONSTRAINT [FK_hotels_trip_weekly_weekly_trip_id] FOREIGN KEY ([weekly_trip_id]) REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[offers_daily_trips] WITH CHECK ADD CONSTRAINT [FK_offers_daily_trips_daily_trip_id] FOREIGN KEY ([daily_trip_id]) REFERENCES [dbo].[daily_trips] ([daily_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[offers_facilities] WITH CHECK ADD CONSTRAINT [FK_offers_facilities_facility_id] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[restaurants_cafes] ([facility_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[offers_hotels] WITH CHECK ADD CONSTRAINT [FK_offers_hotels_hotel_id] FOREIGN KEY ([hotel_id]) REFERENCES [dbo].[hotels] ([hotel_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[offers_weekly_trips] WITH CHECK ADD CONSTRAINT [FK_offers_weekly_trips_weekly_trip_id] FOREIGN KEY ([weekly_trip_id]) REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[places_trip_weekly] WITH CHECK ADD CONSTRAINT [FK_places_trip_weekly_place_id] FOREIGN KEY ([place_id]) REFERENCES [dbo].[places_tourist] ([place_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[places_trip_weekly] WITH CHECK ADD CONSTRAINT [FK_places_trip_weekly_weekly_trip_id] FOREIGN KEY ([weekly_trip_id]) REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[private_trip_vehicles] WITH CHECK ADD CONSTRAINT [FK_private_trip_vehicles_plate_number] FOREIGN KEY ([plate_number]) REFERENCES [dbo].[vehicles] ([plate_number]) ON DELETE CASCADE;
ALTER TABLE [dbo].[private_trip_vehicles] WITH CHECK ADD CONSTRAINT [FK_private_trip_vehicles_private_trip_id] FOREIGN KEY ([private_trip_id]) REFERENCES [dbo].[private_trips] ([private_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CONSTRAINT [FK_private_trips_guide_license_number] FOREIGN KEY ([guide_license_number]) REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE SET NULL;
ALTER TABLE [dbo].[private_trips] WITH CHECK ADD CONSTRAINT [FK_private_trips_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[reviews_daily_trips] WITH CHECK ADD CONSTRAINT [FK_reviews_daily_trips_daily_trip_id] FOREIGN KEY ([daily_trip_id]) REFERENCES [dbo].[daily_trips] ([daily_trip_id]);
ALTER TABLE [dbo].[reviews_daily_trips] WITH CHECK ADD CONSTRAINT [FK_reviews_daily_trips_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[reviews_daily_trips] WITH CHECK ADD CONSTRAINT [FK_reviews_daily_trips_guide_license_number] FOREIGN KEY ([guide_license_number]) REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE SET NULL;
ALTER TABLE [dbo].[reviews_facilities] WITH CHECK ADD CONSTRAINT [FK_reviews_facilities_facility_id] FOREIGN KEY ([facility_id]) REFERENCES [dbo].[restaurants_cafes] ([facility_id]);
ALTER TABLE [dbo].[reviews_facilities] WITH CHECK ADD CONSTRAINT [FK_reviews_facilities_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[reviews_hotels] WITH CHECK ADD CONSTRAINT [FK_reviews_hotels_hotel_id] FOREIGN KEY ([hotel_id]) REFERENCES [dbo].[hotels] ([hotel_id]);
ALTER TABLE [dbo].[reviews_hotels] WITH CHECK ADD CONSTRAINT [FK_reviews_hotels_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[reviews_weekly_trips] WITH CHECK ADD CONSTRAINT [FK_reviews_weekly_trips_tourist_id] FOREIGN KEY ([tourist_id]) REFERENCES [dbo].[tourists] ([tourist_id]);
ALTER TABLE [dbo].[reviews_weekly_trips] WITH CHECK ADD CONSTRAINT [FK_reviews_weekly_trips_weekly_trip_id] FOREIGN KEY ([weekly_trip_id]) REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]);
ALTER TABLE [dbo].[reviews_weekly_trips] WITH CHECK ADD CONSTRAINT [FK_reviews_weekly_trips_guide_license_number] FOREIGN KEY ([guide_license_number]) REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE SET NULL;
ALTER TABLE [dbo].[vehicles] WITH CHECK ADD CONSTRAINT [FK_vehicles_contract_number] FOREIGN KEY ([contract_number]) REFERENCES [dbo].[transportation_companies] ([contract_number]);
ALTER TABLE [dbo].[weekly_trip_vehicles] WITH CHECK ADD CONSTRAINT [FK_weekly_trip_vehicles_plate_number] FOREIGN KEY ([plate_number]) REFERENCES [dbo].[vehicles] ([plate_number]) ON DELETE CASCADE;
ALTER TABLE [dbo].[weekly_trip_vehicles] WITH CHECK ADD CONSTRAINT [FK_weekly_trip_vehicles_weekly_trip_id] FOREIGN KEY ([weekly_trip_id]) REFERENCES [dbo].[weekly_trips] ([weekly_trip_id]) ON DELETE CASCADE;
ALTER TABLE [dbo].[weekly_trips] WITH CHECK ADD CONSTRAINT [FK_weekly_trips_guide_license_number] FOREIGN KEY ([guide_license_number]) REFERENCES [dbo].[tour_guides] ([license_number]) ON DELETE SET NULL;
GO

/* ---------- Indexes ---------- */
CREATE INDEX [IX_bookings_daily_trip_date] ON [dbo].[bookings_daily] ([daily_trip_id], [trip_date]);
GO
