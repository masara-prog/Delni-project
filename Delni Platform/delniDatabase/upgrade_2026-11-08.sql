/*
  Brings an existing DelniDB up to date with the 2026-11-08 changes (run once in SSMS on DelniDB after
  upgrade_2026-11-07.sql; safe to re-run). Take a backup first.

  Removes five unused tables:
    - offers_hotels, offers_facilities: the administration no longer creates offers for hotels or
      restaurants (each one carries its own discount_percentage for Dalni visitors).
    - reviews_hotels, reviews_facilities: no page in the platform or the app lets a tourist rate a hotel or
      a restaurant (the platform does not book them, so a visit cannot be confirmed). Trip reviews stay.
    - guide_operating_regions: nothing sends it any more; a guide's regions are now the cities of the
      landmarks the guide works at (guide_places).
  A table is dropped only while it is empty: if it holds any row it is left as it is and reported.
*/
SET NOCOUNT ON;

DECLARE @tables TABLE (name SYSNAME);
INSERT INTO @tables VALUES ('offers_hotels'), ('offers_facilities'), ('reviews_hotels'), ('reviews_facilities'), ('guide_operating_regions');

DECLARE @name SYSNAME, @rows INT, @sql NVARCHAR(400);
DECLARE c CURSOR LOCAL FAST_FORWARD FOR SELECT name FROM @tables;
OPEN c;
FETCH NEXT FROM c INTO @name;
WHILE @@FETCH_STATUS = 0
BEGIN
    IF OBJECT_ID('dbo.' + QUOTENAME(@name), 'U') IS NOT NULL
    BEGIN
        SET @sql = N'SELECT @n = COUNT(*) FROM dbo.' + QUOTENAME(@name);
        EXEC sp_executesql @sql, N'@n INT OUTPUT', @n = @rows OUTPUT;
        IF @rows = 0
        BEGIN
            SET @sql = N'DROP TABLE dbo.' + QUOTENAME(@name);
            EXEC sp_executesql @sql;
        END
        ELSE
            PRINT @name + ' has ' + CAST(@rows AS NVARCHAR(10)) + ' rows: kept, check it before dropping';
    END;
    FETCH NEXT FROM c INTO @name;
END;
CLOSE c;
DEALLOCATE c;

SELECT t.name AS [table], CASE WHEN OBJECT_ID('dbo.' + QUOTENAME(t.name), 'U') IS NULL THEN 'removed' ELSE 'still there' END AS result
FROM @tables t;
