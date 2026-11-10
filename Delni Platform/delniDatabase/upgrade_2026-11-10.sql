/*
  Brings an existing DelniDB up to date with the 2026-11-10 changes (run once in SSMS on DelniDB after
  upgrade_2026-11-08.sql; safe to re-run). Take a backup first.

  Adds private_trips.departure_city: the city the tourist's private trip leaves from (طرابلس or بنغازي, where
  the platform has its offices). Existing requests keep NULL (not chosen). Additive only.
  (Same column as delni-backend/database/migrations/2026_11_10_000000_add_departure_city_to_private_trips.php)
*/
SET NOCOUNT ON;

IF COL_LENGTH('dbo.private_trips', 'departure_city') IS NULL
    ALTER TABLE dbo.private_trips ADD [departure_city] NVARCHAR(50) NULL;   -- طرابلس | بنغازي

SELECT CASE WHEN COL_LENGTH('dbo.private_trips', 'departure_city') IS NOT NULL THEN 'private_trips.departure_city ready' ELSE 'MISSING' END AS result;
