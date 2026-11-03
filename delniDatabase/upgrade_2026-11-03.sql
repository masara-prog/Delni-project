/*
  Brings an existing DelniDB up to date with the 2026-11-03 changes (run once in SSMS on DelniDB after
  upgrade_2026-10-30.sql; safe to re-run). Take a backup first.

  1. Removes columns that only duplicated other data or are no longer used:
     - daily_trips.description       (was always a copy of trip_title)
     - weekly_trips.trip_description (same)
     - tour_guides.rejection_reason  (the admin no longer records a reason when rejecting a guide)
     - hotels.address_details, restaurants_cafes.address_details (the Google Maps link gives the location)
  2. Images stored as "data:image/...;base64," text (hotels, vehicles, ...) become files under public/uploads:
     run from delni-backend after this script:   php database/scripts/move_images_to_files.php DelniDB
     (needs extension=gd enabled in php.ini; guides' licence documents stay in the table, they are private)
*/
SET NOCOUNT ON;

IF COL_LENGTH('dbo.daily_trips', 'description') IS NOT NULL
    ALTER TABLE dbo.daily_trips DROP COLUMN description;

IF COL_LENGTH('dbo.weekly_trips', 'trip_description') IS NOT NULL
    ALTER TABLE dbo.weekly_trips DROP COLUMN trip_description;

IF COL_LENGTH('dbo.tour_guides', 'rejection_reason') IS NOT NULL
    ALTER TABLE dbo.tour_guides DROP COLUMN rejection_reason;

IF COL_LENGTH('dbo.hotels', 'address_details') IS NOT NULL
    ALTER TABLE dbo.hotels DROP COLUMN address_details;

IF COL_LENGTH('dbo.restaurants_cafes', 'address_details') IS NOT NULL
    ALTER TABLE dbo.restaurants_cafes DROP COLUMN address_details;

SELECT
    CASE WHEN COL_LENGTH('dbo.daily_trips', 'description') IS NULL THEN 'removed' ELSE 'STILL THERE' END AS daily_trips_description,
    CASE WHEN COL_LENGTH('dbo.weekly_trips', 'trip_description') IS NULL THEN 'removed' ELSE 'STILL THERE' END AS weekly_trips_trip_description,
    CASE WHEN COL_LENGTH('dbo.tour_guides', 'rejection_reason') IS NULL THEN 'removed' ELSE 'STILL THERE' END AS tour_guides_rejection_reason,
    CASE WHEN COL_LENGTH('dbo.hotels', 'address_details') IS NULL AND COL_LENGTH('dbo.restaurants_cafes', 'address_details') IS NULL
         THEN 'removed' ELSE 'STILL THERE' END AS facilities_address_details;
