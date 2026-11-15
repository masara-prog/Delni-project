/*
  Brings an existing DelniDB up to date with the 2026-11-15 database review (run once in SSMS on DelniDB after
  upgrade_2026-11-08.sql; safe to re-run). Take a backup first.

  1. guide_places.created_at removed: nothing reads it, and a junction row only says "this guide works at this landmark".
  2. places_tourist.google_maps_url removed: it was always built from latitude/longitude (a derived value, a transitive
     dependency against 3NF). The API still sends google_maps_url, computed from the coordinates by the PlaceTourist model.
  3. tourist_favorites.tourist_id now references tourists (it had no foreign key; a deleted tourist left orphan favourites).
  4. private_trips.tourist_id is NOT NULL: every private trip is requested by a tourist (the API already requires it).
  5. One review per tourist per trip, enforced by UNIQUE constraints (the API already checks it).
  6. A driver's assigned vehicle must belong to the driver's own company: composite foreign key
     drivers(assigned_vehicle_plate, contract_number) -> vehicles(plate_number, contract_number).
*/
SET NOCOUNT ON;

-- 1. guide_places.created_at
IF COL_LENGTH('dbo.guide_places', 'created_at') IS NOT NULL
BEGIN
    DECLARE @df1 SYSNAME = (SELECT d.name FROM sys.default_constraints d
        JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID('dbo.guide_places') AND c.name = 'created_at');
    IF @df1 IS NOT NULL EXEC (N'ALTER TABLE dbo.guide_places DROP CONSTRAINT ' + @df1);
    ALTER TABLE dbo.guide_places DROP COLUMN created_at;
    PRINT 'guide_places.created_at removed';
END

-- 2. places_tourist.google_maps_url
IF COL_LENGTH('dbo.places_tourist', 'google_maps_url') IS NOT NULL
BEGIN
    DECLARE @df2 SYSNAME = (SELECT d.name FROM sys.default_constraints d
        JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID('dbo.places_tourist') AND c.name = 'google_maps_url');
    IF @df2 IS NOT NULL EXEC (N'ALTER TABLE dbo.places_tourist DROP CONSTRAINT ' + @df2);
    ALTER TABLE dbo.places_tourist DROP COLUMN google_maps_url;
    PRINT 'places_tourist.google_maps_url removed';
END

-- 3. tourist_favorites.tourist_id -> tourists
IF OBJECT_ID('dbo.FK_tourist_favorites_tourist', 'F') IS NULL
BEGIN
    DELETE f FROM dbo.tourist_favorites f WHERE NOT EXISTS (SELECT 1 FROM dbo.tourists t WHERE t.tourist_id = f.tourist_id);
    ALTER TABLE dbo.tourist_favorites ADD CONSTRAINT FK_tourist_favorites_tourist
        FOREIGN KEY (tourist_id) REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE;
    PRINT 'FK_tourist_favorites_tourist added';
END

-- 4. private_trips.tourist_id NOT NULL (the foreign key is dropped and added again around the change)
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.private_trips') AND name = 'tourist_id' AND is_nullable = 1)
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.private_trips WHERE tourist_id IS NULL)
        PRINT 'private_trips has rows without a tourist: tourist_id left nullable, fix those rows and run again';
    ELSE
    BEGIN
        DECLARE @fk4 SYSNAME = (SELECT fk.name FROM sys.foreign_keys fk
            JOIN sys.foreign_key_columns fc ON fc.constraint_object_id = fk.object_id
            JOIN sys.columns c ON c.object_id = fc.parent_object_id AND c.column_id = fc.parent_column_id
            WHERE fk.parent_object_id = OBJECT_ID('dbo.private_trips') AND c.name = 'tourist_id');
        IF @fk4 IS NOT NULL EXEC (N'ALTER TABLE dbo.private_trips DROP CONSTRAINT ' + @fk4);
        ALTER TABLE dbo.private_trips ALTER COLUMN tourist_id VARCHAR(50) NOT NULL;
        ALTER TABLE dbo.private_trips ADD CONSTRAINT FK_private_trips_tourist
            FOREIGN KEY (tourist_id) REFERENCES dbo.tourists (tourist_id);
        PRINT 'private_trips.tourist_id is NOT NULL';
    END
END

-- 5. one review per tourist per trip
IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_reviews_daily_tourist_trip')
    ALTER TABLE dbo.reviews_daily_trips ADD CONSTRAINT UQ_reviews_daily_tourist_trip UNIQUE (tourist_id, daily_trip_id);
IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_reviews_weekly_tourist_trip')
    ALTER TABLE dbo.reviews_weekly_trips ADD CONSTRAINT UQ_reviews_weekly_tourist_trip UNIQUE (tourist_id, weekly_trip_id);

-- 6. a driver's vehicle belongs to the driver's company
IF NOT EXISTS (SELECT 1 FROM sys.key_constraints WHERE name = 'UQ_vehicles_plate_company')
    ALTER TABLE dbo.vehicles ADD CONSTRAINT UQ_vehicles_plate_company UNIQUE (plate_number, contract_number);
IF OBJECT_ID('dbo.FK_drivers_vehicle_same_company', 'F') IS NULL
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.drivers d JOIN dbo.vehicles v ON v.plate_number = d.assigned_vehicle_plate
               WHERE v.contract_number <> d.contract_number)
        PRINT 'some drivers hold a vehicle of another company: FK_drivers_vehicle_same_company not added';
    ELSE
    BEGIN
        ALTER TABLE dbo.drivers ADD CONSTRAINT FK_drivers_vehicle_same_company
            FOREIGN KEY (assigned_vehicle_plate, contract_number) REFERENCES dbo.vehicles (plate_number, contract_number);
        PRINT 'FK_drivers_vehicle_same_company added';
    END
END

PRINT 'upgrade_2026-11-15 done';
