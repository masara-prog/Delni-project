/*
  Brings an existing DelniDB up to date with the second 2026-11-17 change (run once in SSMS on DelniDB after
  upgrade_2026-11-17.sql; safe to re-run). Take a backup first.

  A vehicle is driven by one driver at a time: drivers.assigned_vehicle_plate becomes unique among the drivers that
  have a vehicle (a filtered unique index, so any number of drivers may still have no vehicle, NULL).
  The API already moves a vehicle off its previous driver before giving it to another one, so it keeps working.
  The index is refused if two drivers share a vehicle; the check below lists them first.
  (Same change as delni-backend/database/migrations/2026_11_17_000001_unique_assigned_vehicle_on_drivers.php)
*/
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

SELECT assigned_vehicle_plate AS shared_vehicle, COUNT(*) AS drivers
FROM dbo.drivers
WHERE assigned_vehicle_plate IS NOT NULL
GROUP BY assigned_vehicle_plate
HAVING COUNT(*) > 1;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.drivers') AND name = 'UQ_drivers_assigned_vehicle_plate')
    CREATE UNIQUE NONCLUSTERED INDEX UQ_drivers_assigned_vehicle_plate
        ON dbo.drivers (assigned_vehicle_plate)
        WHERE assigned_vehicle_plate IS NOT NULL;

SELECT CASE WHEN EXISTS (SELECT 1 FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.drivers') AND name = 'UQ_drivers_assigned_vehicle_plate')
            THEN 'drivers.assigned_vehicle_plate is unique' ELSE 'MISSING' END AS result;
