/*
  Brings an existing DelniDB up to date with the 2026-11-08 changes (run once in SSMS on DelniDB after
  upgrade_2026-11-07.sql; safe to re-run). Take a backup first.

  Removes the two unused offer tables: offers_hotels and offers_facilities.
  The administration no longer creates offers for hotels or restaurants (each one carries its own
  discount_percentage for Dalni visitors), and nothing in the platform reads or writes these tables.
  A table is dropped only while it is empty: if it holds any row it is left as it is and reported.
*/
SET NOCOUNT ON;

IF OBJECT_ID('dbo.offers_hotels', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.offers_hotels)
        DROP TABLE dbo.offers_hotels;
    ELSE
        PRINT 'offers_hotels has rows: kept, check it before dropping';
END;

IF OBJECT_ID('dbo.offers_facilities', 'U') IS NOT NULL
BEGIN
    IF NOT EXISTS (SELECT 1 FROM dbo.offers_facilities)
        DROP TABLE dbo.offers_facilities;
    ELSE
        PRINT 'offers_facilities has rows: kept, check it before dropping';
END;

SELECT
    CASE WHEN OBJECT_ID('dbo.offers_hotels', 'U') IS NULL THEN 'removed' ELSE 'still there' END AS offers_hotels,
    CASE WHEN OBJECT_ID('dbo.offers_facilities', 'U') IS NULL THEN 'removed' ELSE 'still there' END AS offers_facilities;
