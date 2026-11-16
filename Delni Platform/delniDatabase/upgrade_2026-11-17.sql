/*
  Brings an existing DelniDB up to date with the 2026-11-17 changes (run once in SSMS on DelniDB after
  upgrade_2026-11-16.sql; safe to re-run). Take a backup first.

  Adds tour_guides.created_at: when the guide registered, so the admin's guide verification table lists the newest
  applications first. New rows get the time automatically (DEFAULT GETDATE()); guides who registered before this
  change keep NULL (their date is unknown) and are listed after the dated ones. Additive only.
  (Same column as delni-backend/database/migrations/2026_11_17_000000_add_created_at_to_tour_guides.php)
*/
SET NOCOUNT ON;

IF COL_LENGTH('dbo.tour_guides', 'created_at') IS NULL
    ALTER TABLE dbo.tour_guides ADD [created_at] DATETIME NULL CONSTRAINT [DF_tour_guides_created_at] DEFAULT (GETDATE());

SELECT CASE WHEN COL_LENGTH('dbo.tour_guides', 'created_at') IS NOT NULL THEN 'tour_guides.created_at ready' ELSE 'MISSING' END AS result;
