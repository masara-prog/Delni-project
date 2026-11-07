/*
  Brings an existing DelniDB up to date with the 2026-10-30 changes (run once in SSMS on DelniDB after upgrade_2026-10-29.sql; safe to re-run).
  Take a backup first. Everything runs in one transaction: if any step fails, nothing is changed.

  1. bookings_daily.trip_date   DATE NULL
     A daily trip runs every week on its days, so a booking is for one date; seats are counted per date.
     Bookings made before this change keep NULL (date unknown).
  2. Booking defaults match the values the API writes: booking_status N'مؤكدة' (was N'مؤكد'),
     payment_status 'unpaid' (was N'مدفوع', which marked a booking paid before any cash was received).
  3. Columns that hold Arabic become NVARCHAR (VARCHAR stored every Arabic letter as '?'):
     daily_trip_stations.station_time, private_trip_stations.station_time  NVARCHAR(30)  (e.g. N'09:00 ص')
     notifications.dedupe_key  NVARCHAR(100)  (keys built from Arabic text collapsed into '???' and suppressed other notifications)
  4. Tour guide fields:
     tour_guides.license_expiry_date    DATE NULL           guiding licence expiry (no assignments after it, alert 30 days before)
     tour_guides.rejection_reason       NVARCHAR(1000) NULL the admin's reason when the application is rejected
     tour_guides.availability_status    NVARCHAR(30) NULL DEFAULT N'متاح'   (متاح / إجازة) a guide on leave gets no new assignments
     daily_trips.guide_approval_status  NVARCHAR(30) NULL   like weekly_trips: بانتظار رد المرشد / وافق المرشد / اعتذر المرشد
                                                            (NULL = trip from before the guide-approval step)
*/
SET XACT_ABORT ON;
SET NOCOUNT ON;
BEGIN TRANSACTION;

IF COL_LENGTH('dbo.bookings_daily', 'trip_date') IS NULL
    EXEC(N'ALTER TABLE dbo.bookings_daily ADD trip_date DATE NULL');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_bookings_daily_trip_date' AND object_id = OBJECT_ID('dbo.bookings_daily'))
    EXEC(N'CREATE INDEX IX_bookings_daily_trip_date ON dbo.bookings_daily (daily_trip_id, trip_date)');

-- 2. Defaults: drop the current default of each column, then add the new one
DECLARE @t SYSNAME, @c SYSNAME, @v NVARCHAR(50), @df SYSNAME;
DECLARE defaults_cursor CURSOR LOCAL FOR
    SELECT t, c, v FROM (VALUES
        (N'bookings_daily', N'booking_status', N'N''مؤكدة'''),
        (N'bookings_weekly', N'booking_status', N'N''مؤكدة'''),
        (N'bookings_daily', N'payment_status', N'''unpaid'''),
        (N'bookings_weekly', N'payment_status', N'''unpaid''')
    ) d(t, c, v);
OPEN defaults_cursor;
FETCH NEXT FROM defaults_cursor INTO @t, @c, @v;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @df = NULL;
    SELECT @df = d.name FROM sys.default_constraints d
    JOIN sys.columns col ON col.object_id = d.parent_object_id AND col.column_id = d.parent_column_id
    WHERE d.parent_object_id = OBJECT_ID(N'dbo.' + @t) AND col.name = @c;
    IF @df IS NOT NULL EXEC(N'ALTER TABLE dbo.' + @t + N' DROP CONSTRAINT [' + @df + N']');
    EXEC(N'ALTER TABLE dbo.' + @t + N' ADD DEFAULT (' + @v + N') FOR ' + @c);
    FETCH NEXT FROM defaults_cursor INTO @t, @c, @v;
END;
CLOSE defaults_cursor;
DEALLOCATE defaults_cursor;

-- 3. Arabic text columns
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.daily_trip_stations') AND name = 'station_time' AND system_type_id = TYPE_ID('varchar'))
    EXEC(N'ALTER TABLE dbo.daily_trip_stations ALTER COLUMN station_time NVARCHAR(30) NOT NULL');
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.private_trip_stations') AND name = 'station_time' AND system_type_id = TYPE_ID('varchar'))
    EXEC(N'ALTER TABLE dbo.private_trip_stations ALTER COLUMN station_time NVARCHAR(30) NULL');
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('dbo.notifications') AND name = 'dedupe_key' AND system_type_id = TYPE_ID('varchar'))
BEGIN
    -- an index on the column (if any) is dropped first and recreated after the change
    DECLARE @ix SYSNAME = (SELECT TOP 1 i.name FROM sys.indexes i
        JOIN sys.index_columns ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
        WHERE i.object_id = OBJECT_ID('dbo.notifications') AND COL_NAME(ic.object_id, ic.column_id) = 'dedupe_key');
    IF @ix IS NOT NULL EXEC(N'DROP INDEX [' + @ix + N'] ON dbo.notifications');
    EXEC(N'ALTER TABLE dbo.notifications ALTER COLUMN dedupe_key NVARCHAR(100) NULL');
    IF @ix IS NOT NULL EXEC(N'CREATE INDEX [' + @ix + N'] ON dbo.notifications (dedupe_key)');
END;

-- 4. Tour guide fields
IF COL_LENGTH('dbo.tour_guides', 'license_expiry_date') IS NULL
    EXEC(N'ALTER TABLE dbo.tour_guides ADD license_expiry_date DATE NULL');
IF COL_LENGTH('dbo.tour_guides', 'rejection_reason') IS NULL
    EXEC(N'ALTER TABLE dbo.tour_guides ADD rejection_reason NVARCHAR(1000) NULL');
IF COL_LENGTH('dbo.tour_guides', 'availability_status') IS NULL
    EXEC(N'ALTER TABLE dbo.tour_guides ADD availability_status NVARCHAR(30) NULL DEFAULT N''متاح'' WITH VALUES');
IF COL_LENGTH('dbo.daily_trips', 'guide_approval_status') IS NULL
    EXEC(N'ALTER TABLE dbo.daily_trips ADD guide_approval_status NVARCHAR(30) NULL');

COMMIT TRANSACTION;
PRINT N'DelniDB is up to date (2026-10-30).';
