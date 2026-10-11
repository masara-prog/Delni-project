USE [DelniDB]
GO
/****** Object:  Table [dbo].[bookings_daily]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bookings_daily](
	[booking_daily_id] [varchar](50) NOT NULL,
	[tourist_id] [varchar](50) NOT NULL,
	[daily_trip_id] [varchar](50) NOT NULL,
	[booking_date] [datetime] NOT NULL,
	[number_of_seats] [int] NOT NULL,
	[booking_status] [varchar](20) NOT NULL,
	[total_price] [decimal](10, 2) NOT NULL,
	[booking_notes] [text] NULL,
	[passengers_names] [nvarchar](max) NULL,
	[payment_status] [varchar](20) NOT NULL,
	[attended] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[booking_daily_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[bookings_weekly]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[bookings_weekly](
	[booking_weekly_id] [varchar](50) NOT NULL,
	[tourist_id] [varchar](50) NOT NULL,
	[weekly_trip_id] [varchar](50) NOT NULL,
	[booking_date] [datetime] NOT NULL,
	[number_of_seats] [int] NOT NULL,
	[total_price] [decimal](10, 2) NOT NULL,
	[booking_status] [varchar](20) NOT NULL,
	[booking_notes] [text] NULL,
	[passengers_names] [nvarchar](max) NULL,
	[payment_status] [varchar](20) NOT NULL,
	[attended] [bit] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[booking_weekly_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[daily_trip_vehicles]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[daily_trip_vehicles](
	[daily_alloc_id] [varchar](50) NOT NULL,
	[daily_trip_id] [varchar](50) NOT NULL,
	[plate_number] [varchar](30) NOT NULL,
	[allocation_date] [date] NOT NULL,
	[status] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[daily_alloc_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[daily_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[daily_trips](
	[daily_trip_id] [varchar](50) NOT NULL,
	[trip_title] [varchar](150) NOT NULL,
	[description] [text] NOT NULL,
	[price_per_seat] [decimal](10, 2) NOT NULL,
	[is_active] [bit] NOT NULL,
	[photo] [varchar](255) NULL,
	[max_capacity] [int] NOT NULL,
	[available_seats] [int] NOT NULL,
	[guide_license_number] [varchar](50) NOT NULL,
	[departure_city] [varchar](50) NULL,
	[destination_city] [varchar](50) NULL,
	[recurring_days] [nvarchar](max) NULL,
	[activities] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[daily_trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[drivers]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[drivers](
	[driver_license_number] [varchar](50) NOT NULL,
	[full_name] [varchar](100) NOT NULL,
	[phone_number] [varchar](20) NOT NULL,
	[national_id_or_passport] [varchar](50) NOT NULL,
	[license_date_valid] [date] NOT NULL,
	[contract_number] [varchar](50) NOT NULL,
	[assigned_vehicle_plate] [varchar](30) NULL,
	[email] [varchar](100) NOT NULL,
	[account_status] [varchar](20) NOT NULL,
	[password] [varchar](255) NOT NULL,
	[operational_status] [varchar](20) NULL,
	[experience_years] [int] NULL,
	[driver_photo] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[driver_license_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[hotels]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[hotels](
	[hotel_id] [varchar](50) NOT NULL,
	[hotel_name] [varchar](100) NOT NULL,
	[city] [varchar](50) NOT NULL,
	[address_details] [varchar](255) NOT NULL,
	[phone_number] [varchar](20) NOT NULL,
	[star_rating] [int] NOT NULL,
	[partnership_status] [varchar](20) NOT NULL,
	[hotel_photo_1] [varchar](255) NULL,
	[hotel_photo_2] [varchar](255) NULL,
	[hotel_photo_3] [varchar](255) NULL,
	[hotel_photo_4] [varchar](255) NULL,
	[hotel_photo_5] [varchar](255) NULL,
	[contract_date] [date] NULL,
	[verification_status] [varchar](20) NULL,
	[property_type] [varchar](50) NULL,
	[amenities] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[hotel_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[hotels_trip_weekly]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[hotels_trip_weekly](
	[hotel_id] [varchar](50) NOT NULL,
	[weekly_trip_id] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[hotel_id] ASC,
	[weekly_trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[offers_daily_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[offers_daily_trips](
	[offer_daily_id] [varchar](50) NOT NULL,
	[daily_trip_id] [varchar](50) NOT NULL,
	[offer_title] [varchar](100) NOT NULL,
	[description] [text] NOT NULL,
	[percent_discount] [decimal](5, 2) NOT NULL,
	[offer_image_url] [varchar](255) NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[badge] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[offer_daily_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[offers_facilities]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[offers_facilities](
	[facility_offer_id] [varchar](50) NOT NULL,
	[facility_id] [varchar](50) NOT NULL,
	[description] [text] NOT NULL,
	[offer_title] [varchar](100) NOT NULL,
	[offer_image_url] [varchar](255) NOT NULL,
	[discount_percentage] [decimal](5, 2) NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[badge] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[facility_offer_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[offers_hotels]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[offers_hotels](
	[id_offer] [varchar](50) NOT NULL,
	[title_offer] [varchar](100) NOT NULL,
	[description] [text] NOT NULL,
	[percent_discount] [int] NOT NULL,
	[offer_image] [varchar](255) NOT NULL,
	[hotel_id] [varchar](50) NOT NULL,
	[date_start] [date] NOT NULL,
	[date_end] [date] NOT NULL,
	[badge] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[id_offer] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[offers_weekly_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[offers_weekly_trips](
	[offer_weekly_id] [varchar](50) NOT NULL,
	[weekly_trip_id] [varchar](50) NOT NULL,
	[offer_title] [varchar](100) NOT NULL,
	[description] [text] NOT NULL,
	[discount_percentage] [decimal](5, 2) NOT NULL,
	[offer_image_url] [varchar](255) NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[badge] [varchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[offer_weekly_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[places_tourist]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[places_tourist](
	[place_id] [varchar](50) NOT NULL,
	[place_name] [varchar](100) NOT NULL,
	[description] [text] NOT NULL,
	[city] [varchar](50) NOT NULL,
	[longitude] [decimal](9, 6) NOT NULL,
	[latitude] [decimal](9, 6) NOT NULL,
	[category] [varchar](50) NOT NULL,
	[place_image] [varchar](255) NULL,
	[is_unesco] [bit] NOT NULL,
	[unesco_year] [int] NULL,
	[gallery] [nvarchar](max) NULL,
	[entry_fee] [varchar](50) NULL,
	[google_maps_url] [varchar](500) NULL,
PRIMARY KEY CLUSTERED 
(
	[place_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[places_trip_weekly]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[places_trip_weekly](
	[place_id] [varchar](50) NOT NULL,
	[weekly_trip_id] [varchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[place_id] ASC,
	[weekly_trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[private_trip_vehicles]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[private_trip_vehicles](
	[private_alloc_id] [varchar](50) NOT NULL,
	[private_trip_id] [varchar](50) NOT NULL,
	[plate_number] [varchar](30) NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[allocation_status] [varchar](25) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[private_alloc_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[private_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[private_trips](
	[private_trip_id] [varchar](50) NOT NULL,
	[status_order] [varchar](25) NOT NULL,
	[customer_description] [varchar](100) NOT NULL,
	[preferred_start_date] [date] NOT NULL,
	[duration_days] [int] NOT NULL,
	[number_of_companions] [int] NOT NULL,
	[quoted_price] [decimal](10, 2) NULL,
	[admin_itinerary_plan] [text] NULL,
	[guide_license_number] [varchar](50) NULL,
	[tourist_id] [varchar](50) NULL,
	[customer_name] [varchar](100) NULL,
	[customer_phone] [varchar](20) NULL,
	[customer_requirements] [text] NULL,
PRIMARY KEY CLUSTERED 
(
	[private_trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[restaurants_cafes]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[restaurants_cafes](
	[facility_id] [varchar](50) NOT NULL,
	[facility_name] [varchar](100) NOT NULL,
	[facility_type] [varchar](50) NOT NULL,
	[city] [varchar](50) NOT NULL,
	[address_details] [varchar](255) NOT NULL,
	[phone_number] [varchar](20) NULL,
	[description] [text] NULL,
	[facility_image_1] [varchar](255) NULL,
	[facility_image_2] [varchar](255) NULL,
	[facility_image_3] [varchar](255) NULL,
	[facility_image_4] [varchar](255) NULL,
	[facility_image_5] [varchar](255) NULL,
	[contract_date] [date] NULL,
	[verification_status] [varchar](20) NULL,
	[working_hours] [varchar](100) NULL,
	[features] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[facility_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reviews_daily_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reviews_daily_trips](
	[review_daily_id] [varchar](50) NOT NULL,
	[tourist_id] [varchar](50) NOT NULL,
	[daily_trip_id] [varchar](50) NOT NULL,
	[stars_rating] [int] NOT NULL,
	[comment_text] [text] NULL,
	[created_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[review_daily_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reviews_facilities]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reviews_facilities](
	[review_facility_id] [varchar](50) NOT NULL,
	[tourist_id] [varchar](50) NOT NULL,
	[facility_id] [varchar](50) NOT NULL,
	[stars_rating] [int] NOT NULL,
	[comment_text] [text] NULL,
	[created_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[review_facility_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reviews_hotels]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reviews_hotels](
	[review_hotel_id] [varchar](50) NOT NULL,
	[tourist_id] [varchar](50) NOT NULL,
	[hotel_id] [varchar](50) NOT NULL,
	[stars_rating] [int] NOT NULL,
	[comment_text] [text] NULL,
	[created_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[review_hotel_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[reviews_weekly_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[reviews_weekly_trips](
	[review_weekly_id] [varchar](50) NOT NULL,
	[tourist_id] [varchar](50) NOT NULL,
	[weekly_trip_id] [varchar](50) NOT NULL,
	[stars_rating] [int] NOT NULL,
	[comment_text] [text] NULL,
	[created_at] [datetime] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[review_weekly_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tour_guides]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tour_guides](
	[license_number] [varchar](50) NOT NULL,
	[full_name] [varchar](100) NOT NULL,
	[phone_number] [varchar](20) NOT NULL,
	[years_of_experience] [int] NOT NULL,
	[certificate] [varchar](255) NOT NULL,
	[bio] [text] NULL,
	[speaks_english] [bit] NOT NULL,
	[speaks_french] [bit] NOT NULL,
	[speaks_italian] [bit] NOT NULL,
	[verification_status] [varchar](20) NOT NULL,
	[password] [varchar](255) NOT NULL,
	[email] [varchar](100) NOT NULL,
	[gender] [varchar](10) NULL,
	[working_days] [nvarchar](max) NULL,
	[operating_regions] [nvarchar](max) NULL,
	[primaryRegion] [varchar](50) NULL,
	[price_per_day] [decimal](10, 2) NULL,
	[avatar] [varchar](255) NULL,
	[title] [varchar](100) NULL,
	[specialties] [nvarchar](max) NULL,
	[total_tours_completed] [int] NOT NULL,
	[digital_certificate_file] [nvarchar](max) NULL,
	[certificate_name] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[license_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[tourists]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[tourists](
	[tourist_id] [varchar](50) NOT NULL,
	[full_name] [varchar](100) NOT NULL,
	[email] [varchar](100) NOT NULL,
	[phone_number] [varchar](20) NOT NULL,
	[password] [varchar](255) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[tourist_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[transportation_companies]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[transportation_companies](
	[contract_number] [varchar](50) NOT NULL,
	[company_name] [varchar](100) NOT NULL,
	[phone_number] [varchar](20) NOT NULL,
	[address] [varchar](150) NOT NULL,
	[total_vehicles] [int] NOT NULL,
	[verification_status] [varchar](20) NOT NULL,
	[contract_date] [date] NULL,
	[email] [varchar](100) NULL,
	[password] [varchar](255) NULL,
	[city] [varchar](50) NULL,
	[available_vehicles] [int] NULL,
	[contract_start_date] [date] NULL,
	[contract_end_date] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[contract_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[vehicles]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[vehicles](
	[plate_number] [varchar](30) NOT NULL,
	[vehicle_type] [varchar](50) NOT NULL,
	[seating_capacity] [int] NOT NULL,
	[vehicle_image] [varchar](255) NULL,
	[vehicle_status] [varchar](20) NOT NULL,
	[insurance_details] [text] NULL,
	[contract_number] [varchar](50) NOT NULL,
	[daily_rate] [decimal](10, 2) NULL,
	[category] [varchar](50) NULL,
	[photos] [nvarchar](max) NULL,
	[insurance_image] [varchar](255) NULL,
PRIMARY KEY CLUSTERED 
(
	[plate_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[weekly_trip_vehicles]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[weekly_trip_vehicles](
	[weekly_alloc_id] [varchar](50) NOT NULL,
	[weekly_trip_id] [varchar](50) NOT NULL,
	[plate_number] [varchar](30) NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[status] [varchar](20) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[weekly_alloc_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[weekly_trips]    Script Date: 10/7/2026 12:36:01 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[weekly_trips](
	[weekly_trip_id] [varchar](50) NOT NULL,
	[trip_title] [varchar](150) NOT NULL,
	[start_date] [date] NOT NULL,
	[end_date] [date] NOT NULL,
	[max_capacity] [int] NOT NULL,
	[available_seats] [int] NOT NULL,
	[seat_per_price] [decimal](10, 2) NOT NULL,
	[trip_description] [text] NOT NULL,
	[guide_license_number] [varchar](50) NOT NULL,
	[is_active] [bit] NOT NULL,
	[departure_city] [varchar](50) NULL,
	[destination_region] [varchar](100) NULL,
	[photo] [varchar](255) NULL,
	[gallery] [nvarchar](max) NULL,
PRIMARY KEY CLUSTERED 
(
	[weekly_trip_id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__drivers__9DF00BEE4F84C6FA]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[drivers] ADD UNIQUE NONCLUSTERED 
(
	[national_id_or_passport] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__drivers__A1936A6B76C10A53]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[drivers] ADD UNIQUE NONCLUSTERED 
(
	[phone_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__drivers__AB6E61646740C456]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[drivers] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__drivers__C1C4A7F5ACD9F742]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[drivers] ADD UNIQUE NONCLUSTERED 
(
	[assigned_vehicle_plate] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__tour_gui__A1936A6B186E8C52]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[tour_guides] ADD UNIQUE NONCLUSTERED 
(
	[phone_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__tour_gui__AB6E6164B1FE7797]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[tour_guides] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__tourists__A1936A6B5C0DFE3D]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[tourists] ADD UNIQUE NONCLUSTERED 
(
	[phone_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__tourists__AB6E6164174DEA96]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[tourists] ADD UNIQUE NONCLUSTERED 
(
	[email] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__transpor__A1936A6BC61E37EE]    Script Date: 10/7/2026 12:36:01 PM ******/
ALTER TABLE [dbo].[transportation_companies] ADD UNIQUE NONCLUSTERED 
(
	[phone_number] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[bookings_daily] ADD  DEFAULT (getdate()) FOR [booking_date]
GO
ALTER TABLE [dbo].[bookings_daily] ADD  DEFAULT ('unpaid') FOR [payment_status]
GO
ALTER TABLE [dbo].[bookings_daily] ADD  DEFAULT ((0)) FOR [attended]
GO
ALTER TABLE [dbo].[bookings_weekly] ADD  DEFAULT (getdate()) FOR [booking_date]
GO
ALTER TABLE [dbo].[bookings_weekly] ADD  DEFAULT ('unpaid') FOR [payment_status]
GO
ALTER TABLE [dbo].[bookings_weekly] ADD  DEFAULT ((0)) FOR [attended]
GO
ALTER TABLE [dbo].[daily_trips] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[places_tourist] ADD  DEFAULT ((0)) FOR [is_unesco]
GO
ALTER TABLE [dbo].[reviews_daily_trips] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reviews_facilities] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reviews_hotels] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[reviews_weekly_trips] ADD  DEFAULT (getdate()) FOR [created_at]
GO
ALTER TABLE [dbo].[tour_guides] ADD  DEFAULT ((0)) FOR [speaks_english]
GO
ALTER TABLE [dbo].[tour_guides] ADD  DEFAULT ((0)) FOR [speaks_french]
GO
ALTER TABLE [dbo].[tour_guides] ADD  DEFAULT ((0)) FOR [speaks_italian]
GO
ALTER TABLE [dbo].[tour_guides] ADD  DEFAULT ((0)) FOR [total_tours_completed]
GO
ALTER TABLE [dbo].[weekly_trips] ADD  DEFAULT ((1)) FOR [is_active]
GO
ALTER TABLE [dbo].[bookings_daily]  WITH CHECK ADD FOREIGN KEY([daily_trip_id])
REFERENCES [dbo].[daily_trips] ([daily_trip_id])
GO
ALTER TABLE [dbo].[bookings_daily]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[bookings_weekly]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[bookings_weekly]  WITH CHECK ADD FOREIGN KEY([weekly_trip_id])
REFERENCES [dbo].[weekly_trips] ([weekly_trip_id])
GO
ALTER TABLE [dbo].[daily_trip_vehicles]  WITH CHECK ADD FOREIGN KEY([daily_trip_id])
REFERENCES [dbo].[daily_trips] ([daily_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[daily_trip_vehicles]  WITH CHECK ADD FOREIGN KEY([plate_number])
REFERENCES [dbo].[vehicles] ([plate_number])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[daily_trips]  WITH CHECK ADD FOREIGN KEY([guide_license_number])
REFERENCES [dbo].[tour_guides] ([license_number])
GO
ALTER TABLE [dbo].[drivers]  WITH CHECK ADD FOREIGN KEY([assigned_vehicle_plate])
REFERENCES [dbo].[vehicles] ([plate_number])
GO
ALTER TABLE [dbo].[drivers]  WITH CHECK ADD FOREIGN KEY([contract_number])
REFERENCES [dbo].[transportation_companies] ([contract_number])
GO
ALTER TABLE [dbo].[hotels_trip_weekly]  WITH CHECK ADD FOREIGN KEY([hotel_id])
REFERENCES [dbo].[hotels] ([hotel_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[hotels_trip_weekly]  WITH CHECK ADD FOREIGN KEY([weekly_trip_id])
REFERENCES [dbo].[weekly_trips] ([weekly_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[offers_daily_trips]  WITH CHECK ADD FOREIGN KEY([daily_trip_id])
REFERENCES [dbo].[daily_trips] ([daily_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[offers_facilities]  WITH CHECK ADD FOREIGN KEY([facility_id])
REFERENCES [dbo].[restaurants_cafes] ([facility_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[offers_hotels]  WITH CHECK ADD FOREIGN KEY([hotel_id])
REFERENCES [dbo].[hotels] ([hotel_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[offers_weekly_trips]  WITH CHECK ADD FOREIGN KEY([weekly_trip_id])
REFERENCES [dbo].[weekly_trips] ([weekly_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[places_trip_weekly]  WITH CHECK ADD FOREIGN KEY([place_id])
REFERENCES [dbo].[places_tourist] ([place_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[places_trip_weekly]  WITH CHECK ADD FOREIGN KEY([weekly_trip_id])
REFERENCES [dbo].[weekly_trips] ([weekly_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[private_trip_vehicles]  WITH CHECK ADD FOREIGN KEY([plate_number])
REFERENCES [dbo].[vehicles] ([plate_number])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[private_trip_vehicles]  WITH CHECK ADD FOREIGN KEY([private_trip_id])
REFERENCES [dbo].[private_trips] ([private_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[private_trips]  WITH CHECK ADD FOREIGN KEY([guide_license_number])
REFERENCES [dbo].[tour_guides] ([license_number])
ON DELETE SET NULL
GO
ALTER TABLE [dbo].[private_trips]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[reviews_daily_trips]  WITH CHECK ADD FOREIGN KEY([daily_trip_id])
REFERENCES [dbo].[daily_trips] ([daily_trip_id])
GO
ALTER TABLE [dbo].[reviews_daily_trips]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[reviews_facilities]  WITH CHECK ADD FOREIGN KEY([facility_id])
REFERENCES [dbo].[restaurants_cafes] ([facility_id])
GO
ALTER TABLE [dbo].[reviews_facilities]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[reviews_hotels]  WITH CHECK ADD FOREIGN KEY([hotel_id])
REFERENCES [dbo].[hotels] ([hotel_id])
GO
ALTER TABLE [dbo].[reviews_hotels]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[reviews_weekly_trips]  WITH CHECK ADD FOREIGN KEY([tourist_id])
REFERENCES [dbo].[tourists] ([tourist_id])
GO
ALTER TABLE [dbo].[reviews_weekly_trips]  WITH CHECK ADD FOREIGN KEY([weekly_trip_id])
REFERENCES [dbo].[weekly_trips] ([weekly_trip_id])
GO
ALTER TABLE [dbo].[vehicles]  WITH CHECK ADD FOREIGN KEY([contract_number])
REFERENCES [dbo].[transportation_companies] ([contract_number])
GO
ALTER TABLE [dbo].[weekly_trip_vehicles]  WITH CHECK ADD FOREIGN KEY([plate_number])
REFERENCES [dbo].[vehicles] ([plate_number])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[weekly_trip_vehicles]  WITH CHECK ADD FOREIGN KEY([weekly_trip_id])
REFERENCES [dbo].[weekly_trips] ([weekly_trip_id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[weekly_trips]  WITH CHECK ADD FOREIGN KEY([guide_license_number])
REFERENCES [dbo].[tour_guides] ([license_number])
GO
ALTER TABLE [dbo].[bookings_daily]  WITH CHECK ADD  CONSTRAINT [chk_daily_booking_seats] CHECK  (([number_of_seats]>(0)))
GO
ALTER TABLE [dbo].[bookings_daily] CHECK CONSTRAINT [chk_daily_booking_seats]
GO
ALTER TABLE [dbo].[bookings_daily]  WITH CHECK ADD  CONSTRAINT [chk_daily_total] CHECK  (([total_price]>=(0)))
GO
ALTER TABLE [dbo].[bookings_daily] CHECK CONSTRAINT [chk_daily_total]
GO
ALTER TABLE [dbo].[bookings_weekly]  WITH CHECK ADD  CONSTRAINT [chk_weekly_booking_seats] CHECK  (([number_of_seats]>(0)))
GO
ALTER TABLE [dbo].[bookings_weekly] CHECK CONSTRAINT [chk_weekly_booking_seats]
GO
ALTER TABLE [dbo].[bookings_weekly]  WITH CHECK ADD  CONSTRAINT [chk_weekly_total] CHECK  (([total_price]>=(0)))
GO
ALTER TABLE [dbo].[bookings_weekly] CHECK CONSTRAINT [chk_weekly_total]
GO
ALTER TABLE [dbo].[daily_trips]  WITH CHECK ADD  CONSTRAINT [chk_daily_capacity] CHECK  (([max_capacity]>(0)))
GO
ALTER TABLE [dbo].[daily_trips] CHECK CONSTRAINT [chk_daily_capacity]
GO
ALTER TABLE [dbo].[daily_trips]  WITH CHECK ADD  CONSTRAINT [chk_daily_price] CHECK  (([price_per_seat]>(0)))
GO
ALTER TABLE [dbo].[daily_trips] CHECK CONSTRAINT [chk_daily_price]
GO
ALTER TABLE [dbo].[daily_trips]  WITH CHECK ADD  CONSTRAINT [chk_daily_seats] CHECK  (([available_seats]>=(0) AND [available_seats]<=[max_capacity]))
GO
ALTER TABLE [dbo].[daily_trips] CHECK CONSTRAINT [chk_daily_seats]
GO
ALTER TABLE [dbo].[hotels]  WITH CHECK ADD  CONSTRAINT [chk_stars] CHECK  (([star_rating]>=(1) AND [star_rating]<=(5)))
GO
ALTER TABLE [dbo].[hotels] CHECK CONSTRAINT [chk_stars]
GO
ALTER TABLE [dbo].[offers_daily_trips]  WITH CHECK ADD  CONSTRAINT [chk_daily_discount] CHECK  (([percent_discount]>=(0) AND [percent_discount]<=(100)))
GO
ALTER TABLE [dbo].[offers_daily_trips] CHECK CONSTRAINT [chk_daily_discount]
GO
ALTER TABLE [dbo].[offers_daily_trips]  WITH CHECK ADD  CONSTRAINT [chk_offer_daily_dates] CHECK  (([end_date]>[start_date]))
GO
ALTER TABLE [dbo].[offers_daily_trips] CHECK CONSTRAINT [chk_offer_daily_dates]
GO
ALTER TABLE [dbo].[offers_facilities]  WITH CHECK ADD  CONSTRAINT [chk_facility_discount] CHECK  (([discount_percentage]>=(0) AND [discount_percentage]<=(100)))
GO
ALTER TABLE [dbo].[offers_facilities] CHECK CONSTRAINT [chk_facility_discount]
GO
ALTER TABLE [dbo].[offers_facilities]  WITH CHECK ADD  CONSTRAINT [chk_offer_facility_dates] CHECK  (([end_date]>=[start_date]))
GO
ALTER TABLE [dbo].[offers_facilities] CHECK CONSTRAINT [chk_offer_facility_dates]
GO
ALTER TABLE [dbo].[offers_hotels]  WITH CHECK ADD  CONSTRAINT [chk_hotel_discount] CHECK  (([percent_discount]>=(0) AND [percent_discount]<=(100)))
GO
ALTER TABLE [dbo].[offers_hotels] CHECK CONSTRAINT [chk_hotel_discount]
GO
ALTER TABLE [dbo].[offers_hotels]  WITH CHECK ADD  CONSTRAINT [chk_offer_hotel_dates] CHECK  (([date_end]>[date_start]))
GO
ALTER TABLE [dbo].[offers_hotels] CHECK CONSTRAINT [chk_offer_hotel_dates]
GO
ALTER TABLE [dbo].[offers_weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_offer_weekly_dates] CHECK  (([end_date]>[start_date]))
GO
ALTER TABLE [dbo].[offers_weekly_trips] CHECK CONSTRAINT [chk_offer_weekly_dates]
GO
ALTER TABLE [dbo].[offers_weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_weekly_discount] CHECK  (([discount_percentage]>=(0) AND [discount_percentage]<=(100)))
GO
ALTER TABLE [dbo].[offers_weekly_trips] CHECK CONSTRAINT [chk_weekly_discount]
GO
ALTER TABLE [dbo].[private_trip_vehicles]  WITH CHECK ADD  CONSTRAINT [chk_private_veh_dates] CHECK  (([end_date]>=[start_date]))
GO
ALTER TABLE [dbo].[private_trip_vehicles] CHECK CONSTRAINT [chk_private_veh_dates]
GO
ALTER TABLE [dbo].[private_trips]  WITH CHECK ADD  CONSTRAINT [chk_private_companions] CHECK  (([number_of_companions]>=(0)))
GO
ALTER TABLE [dbo].[private_trips] CHECK CONSTRAINT [chk_private_companions]
GO
ALTER TABLE [dbo].[private_trips]  WITH CHECK ADD  CONSTRAINT [chk_private_days] CHECK  (([duration_days]>(0)))
GO
ALTER TABLE [dbo].[private_trips] CHECK CONSTRAINT [chk_private_days]
GO
ALTER TABLE [dbo].[private_trips]  WITH CHECK ADD  CONSTRAINT [chk_quoted_price] CHECK  (([quoted_price]>=(0)))
GO
ALTER TABLE [dbo].[private_trips] CHECK CONSTRAINT [chk_quoted_price]
GO
ALTER TABLE [dbo].[reviews_daily_trips]  WITH CHECK ADD  CONSTRAINT [chk_daily_stars] CHECK  (([stars_rating]>=(1) AND [stars_rating]<=(5)))
GO
ALTER TABLE [dbo].[reviews_daily_trips] CHECK CONSTRAINT [chk_daily_stars]
GO
ALTER TABLE [dbo].[reviews_facilities]  WITH CHECK ADD  CONSTRAINT [chk_facility_review_stars] CHECK  (([stars_rating]>=(1) AND [stars_rating]<=(5)))
GO
ALTER TABLE [dbo].[reviews_facilities] CHECK CONSTRAINT [chk_facility_review_stars]
GO
ALTER TABLE [dbo].[reviews_hotels]  WITH CHECK ADD  CONSTRAINT [chk_hotel_review_stars] CHECK  (([stars_rating]>=(1) AND [stars_rating]<=(5)))
GO
ALTER TABLE [dbo].[reviews_hotels] CHECK CONSTRAINT [chk_hotel_review_stars]
GO
ALTER TABLE [dbo].[reviews_weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_weekly_stars] CHECK  (([stars_rating]>=(1) AND [stars_rating]<=(5)))
GO
ALTER TABLE [dbo].[reviews_weekly_trips] CHECK CONSTRAINT [chk_weekly_stars]
GO
ALTER TABLE [dbo].[tour_guides]  WITH CHECK ADD  CONSTRAINT [chk_experience] CHECK  (([years_of_experience]>=(2)))
GO
ALTER TABLE [dbo].[tour_guides] CHECK CONSTRAINT [chk_experience]
GO
ALTER TABLE [dbo].[transportation_companies]  WITH CHECK ADD  CONSTRAINT [chk_total_vehicles] CHECK  (([total_vehicles]>=(0)))
GO
ALTER TABLE [dbo].[transportation_companies] CHECK CONSTRAINT [chk_total_vehicles]
GO
ALTER TABLE [dbo].[vehicles]  WITH CHECK ADD  CONSTRAINT [chk_seating] CHECK  (([seating_capacity]>(0)))
GO
ALTER TABLE [dbo].[vehicles] CHECK CONSTRAINT [chk_seating]
GO
ALTER TABLE [dbo].[weekly_trip_vehicles]  WITH CHECK ADD  CONSTRAINT [chk_weekly_veh_dates] CHECK  (([end_date]>=[start_date]))
GO
ALTER TABLE [dbo].[weekly_trip_vehicles] CHECK CONSTRAINT [chk_weekly_veh_dates]
GO
ALTER TABLE [dbo].[weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_weekly_capacity] CHECK  (([max_capacity]>(0)))
GO
ALTER TABLE [dbo].[weekly_trips] CHECK CONSTRAINT [chk_weekly_capacity]
GO
ALTER TABLE [dbo].[weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_weekly_dates] CHECK  (([end_date]>[start_date]))
GO
ALTER TABLE [dbo].[weekly_trips] CHECK CONSTRAINT [chk_weekly_dates]
GO
ALTER TABLE [dbo].[weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_weekly_price] CHECK  (([seat_per_price]>(0)))
GO
ALTER TABLE [dbo].[weekly_trips] CHECK CONSTRAINT [chk_weekly_price]
GO
ALTER TABLE [dbo].[weekly_trips]  WITH CHECK ADD  CONSTRAINT [chk_weekly_seats] CHECK  (([available_seats]>=(0) AND [available_seats]<=[max_capacity]))
GO
ALTER TABLE [dbo].[weekly_trips] CHECK CONSTRAINT [chk_weekly_seats]
GO
USE [master]
GO
ALTER DATABASE [DelniDB] SET  READ_WRITE 
GO
