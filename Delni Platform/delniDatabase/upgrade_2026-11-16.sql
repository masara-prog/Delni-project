/*
  Brings an existing DelniDB up to date with the 2026-11-16 changes (run once in SSMS on DelniDB after
  upgrade_2026-11-15.sql). Take a backup first.

  Removes the last "polymorphic" references (one id column whose table depends on another column), which a foreign
  key cannot protect:

  1. tourist_favorites (item_type + item_id) is replaced by six favourites tables, one per kind of item, each with a
     composite primary key and two real foreign keys (the tourist and the item):
       favorite_daily_trips, favorite_weekly_trips, favorite_hotels, favorite_restaurants, favorite_vehicles, favorite_places
  2. notifications.recipient_id is replaced by one column per kind of account (tourist_id, guide_license_number,
     driver_license_number, company_contract_number), each a foreign key; a CHECK ties them to recipient_role.
     recipient_id stays as a computed column (the filled one), so reading notifications works as before.
     Notifications of accounts that no longer exist are deleted (nobody can read them).
  3. support_messages repeated the sender and the recipient on every message. A conversation now lives in
     support_conversations (its owner as a foreign key by account kind, or a visitor), and support_messages keeps
     only the conversation, the direction (from_admin), the admin who replied, the text and the read flag.
  4. personal_access_tokens (Laravel Sanctum) keeps tokenable_type + tokenable_id as Laravel writes them; five
     computed columns read the account out of them (tourist_id, guide_license_number, driver_license_number,
     company_contract_number, admin_user_id), each a foreign key, and a CHECK limits tokenable_type to the five
     account models. Tokens of accounts that no longer exist are deleted.

  Run it with SSMS, or with sqlcmd -I (computed columns with an index need QUOTED_IDENTIFIER ON).
*/
SET NOCOUNT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

------------------------------------------------------------------------------------------------------------------
-- 1. Favourites: one table per kind of item
------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.favorite_daily_trips', 'U') IS NULL
    CREATE TABLE dbo.favorite_daily_trips (
        tourist_id    VARCHAR(50) NOT NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        daily_trip_id VARCHAR(50) NOT NULL REFERENCES dbo.daily_trips (daily_trip_id) ON DELETE CASCADE,
        created_at    DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_favorite_daily_trips PRIMARY KEY (tourist_id, daily_trip_id));
IF OBJECT_ID('dbo.favorite_weekly_trips', 'U') IS NULL
    CREATE TABLE dbo.favorite_weekly_trips (
        tourist_id     VARCHAR(50) NOT NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        weekly_trip_id VARCHAR(50) NOT NULL REFERENCES dbo.weekly_trips (weekly_trip_id) ON DELETE CASCADE,
        created_at     DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_favorite_weekly_trips PRIMARY KEY (tourist_id, weekly_trip_id));
IF OBJECT_ID('dbo.favorite_hotels', 'U') IS NULL
    CREATE TABLE dbo.favorite_hotels (
        tourist_id VARCHAR(50) NOT NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        hotel_id   VARCHAR(50) NOT NULL REFERENCES dbo.hotels (hotel_id) ON DELETE CASCADE,
        created_at DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_favorite_hotels PRIMARY KEY (tourist_id, hotel_id));
IF OBJECT_ID('dbo.favorite_restaurants', 'U') IS NULL
    CREATE TABLE dbo.favorite_restaurants (
        tourist_id  VARCHAR(50) NOT NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        facility_id VARCHAR(50) NOT NULL REFERENCES dbo.restaurants_cafes (facility_id) ON DELETE CASCADE,
        created_at  DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_favorite_restaurants PRIMARY KEY (tourist_id, facility_id));
IF OBJECT_ID('dbo.favorite_vehicles', 'U') IS NULL
    CREATE TABLE dbo.favorite_vehicles (
        tourist_id   VARCHAR(50) NOT NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        plate_number VARCHAR(30) NOT NULL REFERENCES dbo.vehicles (plate_number) ON DELETE CASCADE,
        created_at   DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_favorite_vehicles PRIMARY KEY (tourist_id, plate_number));
IF OBJECT_ID('dbo.favorite_places', 'U') IS NULL
    CREATE TABLE dbo.favorite_places (
        tourist_id VARCHAR(50) NOT NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        place_id   VARCHAR(50) NOT NULL REFERENCES dbo.places_tourist (place_id) ON DELETE CASCADE,
        created_at DATETIME    NOT NULL DEFAULT GETDATE(),
        CONSTRAINT PK_favorite_places PRIMARY KEY (tourist_id, place_id));

IF OBJECT_ID('dbo.tourist_favorites', 'U') IS NOT NULL
BEGIN
    -- Only rows whose item still exists are carried over
    EXEC (N'
    INSERT INTO dbo.favorite_daily_trips (tourist_id, daily_trip_id, created_at)
        SELECT f.tourist_id, f.item_id, ISNULL(MIN(f.created_at), GETDATE()) FROM dbo.tourist_favorites f
        JOIN dbo.daily_trips x ON x.daily_trip_id = f.item_id WHERE f.item_type = ''daily_trip'' GROUP BY f.tourist_id, f.item_id;
    INSERT INTO dbo.favorite_weekly_trips (tourist_id, weekly_trip_id, created_at)
        SELECT f.tourist_id, f.item_id, ISNULL(MIN(f.created_at), GETDATE()) FROM dbo.tourist_favorites f
        JOIN dbo.weekly_trips x ON x.weekly_trip_id = f.item_id WHERE f.item_type = ''weekly_trip'' GROUP BY f.tourist_id, f.item_id;
    INSERT INTO dbo.favorite_hotels (tourist_id, hotel_id, created_at)
        SELECT f.tourist_id, f.item_id, ISNULL(MIN(f.created_at), GETDATE()) FROM dbo.tourist_favorites f
        JOIN dbo.hotels x ON x.hotel_id = f.item_id WHERE f.item_type = ''hotel'' GROUP BY f.tourist_id, f.item_id;
    INSERT INTO dbo.favorite_restaurants (tourist_id, facility_id, created_at)
        SELECT f.tourist_id, f.item_id, ISNULL(MIN(f.created_at), GETDATE()) FROM dbo.tourist_favorites f
        JOIN dbo.restaurants_cafes x ON x.facility_id = f.item_id WHERE f.item_type = ''restaurant'' GROUP BY f.tourist_id, f.item_id;
    INSERT INTO dbo.favorite_vehicles (tourist_id, plate_number, created_at)
        SELECT f.tourist_id, f.item_id, ISNULL(MIN(f.created_at), GETDATE()) FROM dbo.tourist_favorites f
        JOIN dbo.vehicles x ON x.plate_number = f.item_id WHERE f.item_type = ''vehicle'' GROUP BY f.tourist_id, f.item_id;
    INSERT INTO dbo.favorite_places (tourist_id, place_id, created_at)
        SELECT f.tourist_id, f.item_id, ISNULL(MIN(f.created_at), GETDATE()) FROM dbo.tourist_favorites f
        JOIN dbo.places_tourist x ON x.place_id = f.item_id WHERE f.item_type = ''landmark'' GROUP BY f.tourist_id, f.item_id;');
    DROP TABLE dbo.tourist_favorites;
    PRINT 'tourist_favorites replaced by six favourites tables';
END

------------------------------------------------------------------------------------------------------------------
-- 2. Notifications: one foreign key column per kind of account
------------------------------------------------------------------------------------------------------------------
IF COL_LENGTH('dbo.notifications', 'guide_license_number') IS NULL
BEGIN
    ALTER TABLE dbo.notifications ADD
        tourist_id              VARCHAR(50) NULL,
        guide_license_number    VARCHAR(50) NULL,
        driver_license_number   VARCHAR(50) NULL,
        company_contract_number VARCHAR(50) NULL;

    EXEC (N'
    UPDATE dbo.notifications SET recipient_role = ''company'' WHERE recipient_role = ''transport'';
    UPDATE dbo.notifications SET recipient_role = ''all'' WHERE recipient_role IS NULL;
    -- Notifications of accounts that no longer exist cannot be read by anyone
    DELETE n FROM dbo.notifications n WHERE n.recipient_id IS NOT NULL AND NOT (
           (n.recipient_role = ''tourist'' AND EXISTS (SELECT 1 FROM dbo.tourists t WHERE t.tourist_id = n.recipient_id))
        OR (n.recipient_role = ''guide''   AND EXISTS (SELECT 1 FROM dbo.tour_guides g WHERE g.license_number = n.recipient_id))
        OR (n.recipient_role = ''driver''  AND EXISTS (SELECT 1 FROM dbo.drivers d WHERE d.driver_license_number = n.recipient_id))
        OR (n.recipient_role = ''company'' AND EXISTS (SELECT 1 FROM dbo.transportation_companies c WHERE c.contract_number = n.recipient_id)));
    UPDATE dbo.notifications SET tourist_id = recipient_id              WHERE recipient_role = ''tourist'';
    UPDATE dbo.notifications SET guide_license_number = recipient_id    WHERE recipient_role = ''guide'';
    UPDATE dbo.notifications SET driver_license_number = recipient_id   WHERE recipient_role = ''driver'';
    UPDATE dbo.notifications SET company_contract_number = recipient_id WHERE recipient_role = ''company'';');

    IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notif_recipient' AND object_id = OBJECT_ID('dbo.notifications'))
        DROP INDEX IX_notif_recipient ON dbo.notifications;
    DECLARE @df NVARCHAR(200);
    SELECT @df = d.name FROM sys.default_constraints d JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID('dbo.notifications') AND c.name = 'recipient_id';
    IF @df IS NOT NULL EXEC (N'ALTER TABLE dbo.notifications DROP CONSTRAINT ' + @df);
    ALTER TABLE dbo.notifications DROP COLUMN recipient_id;
    SELECT @df = d.name FROM sys.default_constraints d JOIN sys.columns c ON c.object_id = d.parent_object_id AND c.column_id = d.parent_column_id
        WHERE d.parent_object_id = OBJECT_ID('dbo.notifications') AND c.name = 'recipient_role';
    IF @df IS NOT NULL EXEC (N'ALTER TABLE dbo.notifications DROP CONSTRAINT ' + @df);
    ALTER TABLE dbo.notifications ALTER COLUMN recipient_role NVARCHAR(50) NOT NULL;
    ALTER TABLE dbo.notifications ADD CONSTRAINT DF_notifications_role DEFAULT 'all' FOR recipient_role;

    -- The filled account column, so queries can still read recipient_id
    ALTER TABLE dbo.notifications ADD recipient_id AS
        CAST(COALESCE(tourist_id, guide_license_number, driver_license_number, company_contract_number) AS VARCHAR(50)) PERSISTED;

    ALTER TABLE dbo.notifications ADD
        CONSTRAINT FK_notifications_tourist FOREIGN KEY (tourist_id) REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        CONSTRAINT FK_notifications_guide FOREIGN KEY (guide_license_number) REFERENCES dbo.tour_guides (license_number) ON DELETE CASCADE,
        CONSTRAINT FK_notifications_driver FOREIGN KEY (driver_license_number) REFERENCES dbo.drivers (driver_license_number) ON DELETE CASCADE,
        CONSTRAINT FK_notifications_company FOREIGN KEY (company_contract_number) REFERENCES dbo.transportation_companies (contract_number) ON DELETE CASCADE,
        -- One account at most, and it matches the recipient role; no account = everyone in that role (or all, or the admins)
        CONSTRAINT CK_notifications_recipient CHECK (
            recipient_role IN ('all', 'admin', 'tourist', 'guide', 'driver', 'company') AND (
               (tourist_id IS NULL AND guide_license_number IS NULL AND driver_license_number IS NULL AND company_contract_number IS NULL)
            OR (recipient_role = 'tourist' AND tourist_id IS NOT NULL AND guide_license_number IS NULL AND driver_license_number IS NULL AND company_contract_number IS NULL)
            OR (recipient_role = 'guide'   AND guide_license_number IS NOT NULL AND tourist_id IS NULL AND driver_license_number IS NULL AND company_contract_number IS NULL)
            OR (recipient_role = 'driver'  AND driver_license_number IS NOT NULL AND tourist_id IS NULL AND guide_license_number IS NULL AND company_contract_number IS NULL)
            OR (recipient_role = 'company' AND company_contract_number IS NOT NULL AND tourist_id IS NULL AND guide_license_number IS NULL AND driver_license_number IS NULL)));

    CREATE INDEX IX_notif_recipient ON dbo.notifications (recipient_role, recipient_id, is_read, created_at);
    PRINT 'notifications: recipient_id replaced by four foreign keys';
END

------------------------------------------------------------------------------------------------------------------
-- 3. Support: conversations and their messages
------------------------------------------------------------------------------------------------------------------
IF OBJECT_ID('dbo.support_conversations', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.support_conversations (
        session_id              NVARCHAR(100) NOT NULL CONSTRAINT PK_support_conversations PRIMARY KEY,
        owner_role              NVARCHAR(20)  NOT NULL,
        tourist_id              VARCHAR(50)   NULL REFERENCES dbo.tourists (tourist_id) ON DELETE CASCADE,
        guide_license_number    VARCHAR(50)   NULL REFERENCES dbo.tour_guides (license_number) ON DELETE CASCADE,
        driver_license_number   VARCHAR(50)   NULL REFERENCES dbo.drivers (driver_license_number) ON DELETE CASCADE,
        company_contract_number VARCHAR(50)   NULL REFERENCES dbo.transportation_companies (contract_number) ON DELETE CASCADE,
        created_at              DATETIME      NOT NULL DEFAULT GETDATE(),
        -- The owner is exactly the account of owner_role; a visitor has no account
        CONSTRAINT CK_support_conversations_owner CHECK (
               (owner_role = 'visitor'   AND tourist_id IS NULL AND guide_license_number IS NULL AND driver_license_number IS NULL AND company_contract_number IS NULL)
            OR (owner_role = 'tourist'   AND tourist_id IS NOT NULL AND guide_license_number IS NULL AND driver_license_number IS NULL AND company_contract_number IS NULL)
            OR (owner_role = 'guide'     AND guide_license_number IS NOT NULL AND tourist_id IS NULL AND driver_license_number IS NULL AND company_contract_number IS NULL)
            OR (owner_role = 'driver'    AND driver_license_number IS NOT NULL AND tourist_id IS NULL AND guide_license_number IS NULL AND company_contract_number IS NULL)
            OR (owner_role = 'transport' AND company_contract_number IS NOT NULL AND tourist_id IS NULL AND guide_license_number IS NULL AND driver_license_number IS NULL)));

    CREATE TABLE dbo.support_messages_new (
        id         BIGINT IDENTITY(1, 1) NOT NULL CONSTRAINT PK_support_messages PRIMARY KEY,
        session_id NVARCHAR(100) NOT NULL REFERENCES dbo.support_conversations (session_id) ON DELETE CASCADE,
        from_admin BIT           NOT NULL,
        admin_id   BIGINT        NULL REFERENCES dbo.users (id),
        body       NVARCHAR(MAX) NOT NULL,
        is_read    BIT           NOT NULL DEFAULT 0,
        created_at DATETIME      NOT NULL DEFAULT GETDATE(),
        -- Only an admin's reply names an admin
        CONSTRAINT CK_support_messages_admin CHECK (from_admin = 1 OR admin_id IS NULL));

    IF OBJECT_ID('dbo.support_messages', 'U') IS NOT NULL
    BEGIN
        EXEC (N'
        INSERT INTO dbo.support_conversations (session_id, owner_role, tourist_id, guide_license_number, driver_license_number, company_contract_number, created_at)
        SELECT m.session_id, m.sender_role,
               CASE WHEN m.sender_role = ''tourist''   THEN m.sender_id END,
               CASE WHEN m.sender_role = ''guide''     THEN m.sender_id END,
               CASE WHEN m.sender_role = ''driver''    THEN m.sender_id END,
               CASE WHEN m.sender_role = ''transport'' THEN m.sender_id END,
               m.created_at
        FROM dbo.support_messages m
        WHERE m.id = (SELECT MIN(x.id) FROM dbo.support_messages x WHERE x.session_id = m.session_id AND x.sender_role <> ''admin'');
        SET IDENTITY_INSERT dbo.support_messages_new ON;
        INSERT INTO dbo.support_messages_new (id, session_id, from_admin, admin_id, body, is_read, created_at)
        SELECT m.id, m.session_id, CASE WHEN m.sender_role = ''admin'' THEN 1 ELSE 0 END,
               CASE WHEN m.sender_role = ''admin'' THEN TRY_CAST(NULLIF(m.sender_id, '''') AS BIGINT) END,
               m.body, m.is_read, m.created_at
        FROM dbo.support_messages m WHERE m.session_id IN (SELECT session_id FROM dbo.support_conversations);
        SET IDENTITY_INSERT dbo.support_messages_new OFF;');
        DROP TABLE dbo.support_messages;
    END
    EXEC sp_rename 'dbo.support_messages_new', 'support_messages';
    CREATE INDEX IX_support_messages_session ON dbo.support_messages (session_id, id);
    CREATE INDEX IX_support_messages_unread ON dbo.support_messages (from_admin, is_read);
    PRINT 'support_messages split into support_conversations and support_messages';
END

------------------------------------------------------------------------------------------------------------------
-- 4. Sign-in tokens: the account behind each token as a foreign key
------------------------------------------------------------------------------------------------------------------
IF COL_LENGTH('dbo.personal_access_tokens', 'admin_user_id') IS NULL
BEGIN
    EXEC (N'
    DELETE p FROM dbo.personal_access_tokens p WHERE NOT (
           (p.tokenable_type = N''App\Models\Tourist'' AND EXISTS (SELECT 1 FROM dbo.tourists t WHERE t.tourist_id = p.tokenable_id))
        OR (p.tokenable_type = N''App\Models\TourGuide'' AND EXISTS (SELECT 1 FROM dbo.tour_guides g WHERE g.license_number = p.tokenable_id))
        OR (p.tokenable_type = N''App\Models\Driver'' AND EXISTS (SELECT 1 FROM dbo.drivers d WHERE d.driver_license_number = p.tokenable_id))
        OR (p.tokenable_type = N''App\Models\TransportationCompany'' AND EXISTS (SELECT 1 FROM dbo.transportation_companies c WHERE c.contract_number = p.tokenable_id))
        OR (p.tokenable_type = N''App\Models\User'' AND EXISTS (SELECT 1 FROM dbo.users u WHERE CAST(u.id AS NVARCHAR(50)) = p.tokenable_id)));');

    ALTER TABLE dbo.personal_access_tokens ADD
        tourist_id              AS CAST(CASE WHEN tokenable_type = N'App\Models\Tourist' THEN tokenable_id END AS VARCHAR(50)) PERSISTED,
        guide_license_number    AS CAST(CASE WHEN tokenable_type = N'App\Models\TourGuide' THEN tokenable_id END AS VARCHAR(50)) PERSISTED,
        driver_license_number   AS CAST(CASE WHEN tokenable_type = N'App\Models\Driver' THEN tokenable_id END AS VARCHAR(50)) PERSISTED,
        company_contract_number AS CAST(CASE WHEN tokenable_type = N'App\Models\TransportationCompany' THEN tokenable_id END AS VARCHAR(50)) PERSISTED,
        admin_user_id           AS CAST(CASE WHEN tokenable_type = N'App\Models\User' THEN tokenable_id END AS BIGINT) PERSISTED;

    ALTER TABLE dbo.personal_access_tokens ADD
        CONSTRAINT FK_tokens_tourist FOREIGN KEY (tourist_id) REFERENCES dbo.tourists (tourist_id),
        CONSTRAINT FK_tokens_guide FOREIGN KEY (guide_license_number) REFERENCES dbo.tour_guides (license_number),
        CONSTRAINT FK_tokens_driver FOREIGN KEY (driver_license_number) REFERENCES dbo.drivers (driver_license_number),
        CONSTRAINT FK_tokens_company FOREIGN KEY (company_contract_number) REFERENCES dbo.transportation_companies (contract_number),
        CONSTRAINT FK_tokens_admin FOREIGN KEY (admin_user_id) REFERENCES dbo.users (id),
        CONSTRAINT CK_tokens_type CHECK (tokenable_type IN (N'App\Models\Tourist', N'App\Models\TourGuide', N'App\Models\Driver',
                                                             N'App\Models\TransportationCompany', N'App\Models\User'));
    PRINT 'personal_access_tokens: the account behind each token is a foreign key';
END

COMMIT TRANSACTION;
PRINT 'upgrade_2026-11-16 done';
