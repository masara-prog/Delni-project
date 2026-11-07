/*
  Brings an existing DelniDB up to date with the 2026-10-28/29 changes (run once in SSMS on DelniDB; safe to re-run).
  Take a backup first. Everything runs in one transaction: if any step fails, nothing is changed.

  1. private_trips.additional_expenses      DECIMAL(10,2) NULL DEFAULT 0
  2. weekly_trips.trip_description          NVARCHAR(MAX) NULL
  3. weekly_trips.guide_approval_status     NVARCHAR(30)  NULL  (NULL = trip from before the guide-approval step)
  4. drivers.current_trip_stage             NVARCHAR(50)  NULL
  5. Landmark highlights move from places_tourist.highlights (comma-separated) to places_tourist_highlights
     (one row per highlight), then the old column is dropped
  6. places_tourist_highlights.created_at is dropped
  7. places_tourist.place_name is dropped: a landmark is named by its tourist city (places_tourist.city)
*/
SET XACT_ABORT ON;
SET NOCOUNT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.private_trips', 'additional_expenses') IS NULL
    EXEC(N'ALTER TABLE dbo.private_trips ADD additional_expenses DECIMAL(10,2) NULL DEFAULT 0');

IF COL_LENGTH('dbo.weekly_trips', 'trip_description') IS NULL
    EXEC(N'ALTER TABLE dbo.weekly_trips ADD trip_description NVARCHAR(MAX) NULL');

IF COL_LENGTH('dbo.weekly_trips', 'guide_approval_status') IS NULL
    EXEC(N'ALTER TABLE dbo.weekly_trips ADD guide_approval_status NVARCHAR(30) NULL');

IF COL_LENGTH('dbo.drivers', 'current_trip_stage') IS NULL
    EXEC(N'ALTER TABLE dbo.drivers ADD current_trip_stage NVARCHAR(50) NULL');

-- 5. Highlights: one row per highlight, for landmarks that do not have rows yet; then drop the old column
IF COL_LENGTH('dbo.places_tourist', 'highlights') IS NOT NULL
BEGIN
    EXEC(N'
    INSERT INTO dbo.places_tourist_highlights (highlight_id, place_id, highlight_name, display_order)
    SELECT p.place_id + ''-H'' + CAST(x.n AS VARCHAR(10)), p.place_id, LEFT(x.item, 250), x.n
    FROM dbo.places_tourist p
    CROSS APPLY (
        SELECT LTRIM(RTRIM(s.value)) AS item, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS n
        FROM STRING_SPLIT(REPLACE(REPLACE(p.highlights, N'','', N''،''), CHAR(10), N''،''), N''،'') s
        WHERE LTRIM(RTRIM(s.value)) <> N''''
    ) x
    WHERE LTRIM(RTRIM(ISNULL(p.highlights, N''''))) <> N''''
      AND NOT EXISTS (SELECT 1 FROM dbo.places_tourist_highlights h WHERE h.place_id = p.place_id);');
    EXEC(N'ALTER TABLE dbo.places_tourist DROP COLUMN highlights');
END;

-- 6. places_tourist_highlights.created_at (its default constraint goes first)
IF COL_LENGTH('dbo.places_tourist_highlights', 'created_at') IS NOT NULL
BEGIN
    DECLARE @df NVARCHAR(200) = (
        SELECT d.name FROM sys.default_constraints d
        JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID('dbo.places_tourist_highlights') AND c.name = 'created_at');
    IF @df IS NOT NULL EXEC(N'ALTER TABLE dbo.places_tourist_highlights DROP CONSTRAINT [' + @df + N']');
    EXEC(N'ALTER TABLE dbo.places_tourist_highlights DROP COLUMN created_at');
END;

-- 7. places_tourist.place_name (the city is the landmark's name)
IF COL_LENGTH('dbo.places_tourist', 'place_name') IS NOT NULL
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.places_tourist WHERE LTRIM(RTRIM(ISNULL(city, N''))) = N'')
        THROW 50001, N'Some landmarks have no city; fill places_tourist.city before running this script.', 1;
    DECLARE @df2 NVARCHAR(200) = (
        SELECT d.name FROM sys.default_constraints d
        JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID('dbo.places_tourist') AND c.name = 'place_name');
    IF @df2 IS NOT NULL EXEC(N'ALTER TABLE dbo.places_tourist DROP CONSTRAINT [' + @df2 + N']');
    EXEC(N'ALTER TABLE dbo.places_tourist DROP COLUMN place_name');
END;

COMMIT TRANSACTION;
PRINT N'DelniDB is up to date (2026-10-29).';
