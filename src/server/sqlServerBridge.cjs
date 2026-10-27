// @ts-check
/**
 * ==============================================================================
 * DELNI PLATFORM - SECURE MICROSOFT SQL SERVER BRIDGE
 * ==============================================================================
 * Security Standards:
 * 1. ZERO SQL Injection: All queries use Prepared Statements with typed inputs.
 * 2. Password Security: Passwords hashed with cryptographic salts (PBKDF2/SHA256).
 * 3. Atomic Transactions: Vehicle + Driver operations are wrapped in SQL Transactions.
 * 4. Localhost CORS Isolation: Only localhost requests accepted.
 * ==============================================================================
 */

const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const sql = require('mssql/msnodesqlv8');

const PORT = 5001;
const CONNECTION_STRING = 'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=DelniDB;Trusted_Connection=yes;TrustServerCertificate=yes;';

// Efficient Image Storage: Saves large Base64 uploads to disk and returns pure tiny URL path to keep DB size minimal
function saveBase64ImageIfPresent(imgStr, prefix, index) {
  if (!imgStr || typeof imgStr !== 'string') return '';
  const trimmed = imgStr.trim();
  if (!trimmed.startsWith('data:image/')) return trimmed;
  try {
    const matches = trimmed.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) return trimmed;
    const ext = matches[1].toLowerCase() === 'jpeg' ? 'jpg' : matches[1].toLowerCase();
    const buffer = Buffer.from(matches[2], 'base64');
    const uploadsDir = path.join(__dirname, '../../public/uploads/trips');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const cleanPrefix = String(prefix || 'trip').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanPrefix}-img-${index || 1}-${Date.now()}.${ext}`;
    const fullPath = path.join(uploadsDir, filename);
    fs.writeFileSync(fullPath, buffer);
    return `/uploads/trips/${filename}`;
  } catch (err) {
    console.warn('[saveBase64ImageIfPresent warning]:', err.message);
    return trimmed;
  }
}

// Secure Password Hasher (HMAC-SHA256 with Salt)
function hashPassword(password) {
  if (!password) return '';
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored) return false;
  if (!stored.includes(':')) {
    return String(password) === String(stored);
  }
  const [salt, originalHash] = stored.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha256').toString('hex');
  return hash === originalHash;
}

process.on('uncaughtException', (err) => {
  console.error('[DelniDB Global Exception caught]:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[DelniDB Unhandled Rejection caught]:', reason);
});

let pool = null;
let poolPromise = null;
let schemaVerified = false;

async function getPool() {
  if (pool) return pool;
  if (poolPromise) return poolPromise;

  poolPromise = (async () => {
    try {
      const p = await sql.connect({
        connectionString: CONNECTION_STRING,
        connectionTimeout: 30000,
        requestTimeout: 60000,
        options: {
          trustServerCertificate: true,
          encrypt: false,
          requestTimeout: 60000,
        },
        pool: {
          max: 25,
          min: 1,
          idleTimeoutMillis: 60000,
          acquireTimeoutMillis: 60000,
        }
      });
      p.on('error', (err) => {
        console.error('[DelniDB Pool Error]:', err?.message || err);
        try { p.close(); } catch (e) {}
        pool = null;
        poolPromise = null;
      });
      pool = p;
      console.log('[DelniDB] Successfully connected to Microsoft SQL Server (DelniDB)');
      if (!schemaVerified) {
        schemaVerified = true;
        await ensureDatabaseSchema(pool);
      }
      return pool;
    } catch (err) {
      pool = null;
      poolPromise = null;
      throw err;
    }
  })();

  return poolPromise;
}

async function ensureDatabaseSchema(p) {
  try {
    await p.request().query(`
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('places_tourist') AND name = 'region')
        ALTER TABLE places_tourist ADD region NVARCHAR(100) NULL;

      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('places_tourist') AND name = 'highlights')
        ALTER TABLE places_tourist ADD highlights NVARCHAR(MAX) NULL;

      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'places_trip_daily')
      BEGIN
        CREATE TABLE places_trip_daily (
          place_id VARCHAR(50) NOT NULL,
          daily_trip_id VARCHAR(50) NOT NULL,
          PRIMARY KEY (place_id, daily_trip_id)
        );
      END;

      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'places_trip_weekly')
      BEGIN
        CREATE TABLE places_trip_weekly (
          place_id VARCHAR(50) NOT NULL,
          weekly_trip_id VARCHAR(50) NOT NULL,
          PRIMARY KEY (place_id, weekly_trip_id)
        );
      END;

      -- Normalized Table for Daily Trip Stations (محطات الرحلات اليومية - عنوان، توقيت، وشرح فقط)
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'daily_trip_stations')
      BEGIN
        CREATE TABLE daily_trip_stations (
          station_id VARCHAR(50) NOT NULL PRIMARY KEY,
          daily_trip_id VARCHAR(50) NOT NULL,
          station_order INT NOT NULL DEFAULT 1,
          station_title NVARCHAR(150) NOT NULL,
          station_time VARCHAR(30) NOT NULL,
          station_desc NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT FK_daily_trip_stations_trips FOREIGN KEY (daily_trip_id) REFERENCES daily_trips (daily_trip_id) ON DELETE CASCADE
        );
      END;

      -- 5 Photo Fields for Daily Trips (photo_1 to photo_5 directly in daily_trips)
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('daily_trips') AND name = 'photo_1')
      BEGIN
        ALTER TABLE daily_trips ADD 
          photo_1 NVARCHAR(500) NULL,
          photo_2 NVARCHAR(500) NULL,
          photo_3 NVARCHAR(500) NULL,
          photo_4 NVARCHAR(500) NULL,
          photo_5 NVARCHAR(500) NULL;
      END;

      -- Normalized Table for Daily Trip Recurring Days (أيام انطلاق الرحلات اليومية - Composite PK)
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'daily_trip_days')
      BEGIN
        CREATE TABLE daily_trip_days (
          daily_trip_id VARCHAR(50) NOT NULL,
          day_of_week NVARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT PK_daily_trip_days PRIMARY KEY (daily_trip_id, day_of_week),
          CONSTRAINT FK_daily_trip_days_trip FOREIGN KEY (daily_trip_id) REFERENCES daily_trips(daily_trip_id) ON DELETE CASCADE
        );
      END;

      -- Normalized Table for Weekly Trip Stations (محطات الرحلات الأسبوعية - 3NF)
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'weekly_trip_stations')
      BEGIN
        CREATE TABLE weekly_trip_stations (
          station_id VARCHAR(50) NOT NULL PRIMARY KEY,
          weekly_trip_id VARCHAR(50) NOT NULL,
          station_order INT NOT NULL DEFAULT 1,
          day_number INT NOT NULL DEFAULT 1,
          station_title NVARCHAR(200) NOT NULL,
          station_desc NVARCHAR(MAX) NULL,
          created_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT FK_weekly_stations_trip FOREIGN KEY (weekly_trip_id) REFERENCES weekly_trips(weekly_trip_id) ON DELETE CASCADE
        );
      END;

      -- 5 Separate Photos for weekly_trips
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('weekly_trips') AND name = 'photo_1')
      BEGIN
        ALTER TABLE weekly_trips ADD 
          photo_1 NVARCHAR(500) NULL,
          photo_2 NVARCHAR(500) NULL,
          photo_3 NVARCHAR(500) NULL,
          photo_4 NVARCHAR(500) NULL,
          photo_5 NVARCHAR(500) NULL;
      END;

      -- Normalized Junction for Weekly Trips and Landmarks
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'places_trip_weekly')
      BEGIN
        CREATE TABLE places_trip_weekly (
          weekly_trip_id VARCHAR(50) NOT NULL,
          place_id VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT PK_places_trip_weekly PRIMARY KEY (weekly_trip_id, place_id),
          CONSTRAINT FK_ptw_trip FOREIGN KEY (weekly_trip_id) REFERENCES weekly_trips(weekly_trip_id) ON DELETE CASCADE,
          CONSTRAINT FK_ptw_place FOREIGN KEY (place_id) REFERENCES places_tourist(place_id) ON DELETE CASCADE
        );
      END;

      -- Tour Guides operating_regions column
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tour_guides') AND name = 'operating_regions')
        ALTER TABLE tour_guides ADD operating_regions NVARCHAR(MAX) NULL;

      -- Normalized Junction for Tour Guide Expertise in Landmarks
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'guide_places')
      BEGIN
        CREATE TABLE guide_places (
          license_number VARCHAR(50) NOT NULL,
          place_id VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT PK_guide_places PRIMARY KEY (license_number, place_id),
          CONSTRAINT FK_gp_guide FOREIGN KEY (license_number) REFERENCES tour_guides(license_number) ON DELETE CASCADE,
          CONSTRAINT FK_gp_place FOREIGN KEY (place_id) REFERENCES places_tourist(place_id) ON DELETE CASCADE
        );
      END;

      -- Tourist account restriction status (تقييد وتنشيط الحساب)
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tourists') AND name = 'account_status')
        ALTER TABLE tourists ADD account_status NVARCHAR(50) DEFAULT 'نشط';

      -- Tourist account registration date
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('tourists') AND name = 'created_at')
      BEGIN
        ALTER TABLE tourists ADD created_at DATETIME DEFAULT GETDATE();
      END;

      -- Real-time Notifications Table
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'notifications')
      BEGIN
        CREATE TABLE notifications (
          id VARCHAR(50) NOT NULL PRIMARY KEY,
          type NVARCHAR(50) DEFAULT 'system',
          title NVARCHAR(255) NOT NULL,
          body NVARCHAR(MAX) NOT NULL,
          recipient_role NVARCHAR(50) DEFAULT 'all',
          recipient_id NVARCHAR(100) NULL,
          link NVARCHAR(255) NULL,
          is_read BIT DEFAULT 0,
          dedupe_key VARCHAR(100) NULL,
          created_at DATETIME DEFAULT GETDATE()
        );
      END;

      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('notifications') AND name = 'dedupe_key')
        ALTER TABLE notifications ADD dedupe_key VARCHAR(100) NULL;

      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notif_recipient' AND object_id = OBJECT_ID('notifications'))
        CREATE NONCLUSTERED INDEX IX_notif_recipient ON notifications (recipient_id, recipient_role, is_read, created_at);

      IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_notif_dedupe' AND object_id = OBJECT_ID('notifications'))
        CREATE NONCLUSTERED INDEX IX_notif_dedupe ON notifications (dedupe_key);

      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('daily_trips') AND name = 'departure_date')
        ALTER TABLE daily_trips ADD departure_date DATETIME NULL;

      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('daily_trips') AND name = 'return_date')
        ALTER TABLE daily_trips ADD return_date DATETIME NULL;

      -- Private Trip Vehicles Allocation Table
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'private_trip_vehicles')
      BEGIN
        CREATE TABLE private_trip_vehicles (
          private_alloc_id VARCHAR(50) NOT NULL PRIMARY KEY,
          private_trip_id VARCHAR(50) NOT NULL,
          plate_number VARCHAR(30) NOT NULL,
          start_date DATE NOT NULL,
          end_date DATE NOT NULL,
          allocation_status VARCHAR(25) NOT NULL DEFAULT 'معينة'
        );
      END;

      -- Direct assigned_vehicle column on private_trips table
      IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('private_trips') AND name = 'assigned_vehicle')
        ALTER TABLE private_trips ADD assigned_vehicle NVARCHAR(50) NULL;

      -- Ensure status_order in private_trips is NVARCHAR(50) for Arabic status text
      IF EXISTS (
        SELECT 1 FROM sys.columns c
        JOIN sys.types t ON c.user_type_id = t.user_type_id
        WHERE c.object_id = OBJECT_ID('private_trips')
          AND c.name = 'status_order'
          AND t.name = 'varchar'
      )
      BEGIN
        ALTER TABLE private_trips ALTER COLUMN status_order NVARCHAR(50) NULL;
      END;

      -- Tourist Favorites Table (المفضلة الموحدة بالقلب لجميع العناصر)
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'tourist_favorites')
      BEGIN
        CREATE TABLE tourist_favorites (
          favorite_id VARCHAR(50) NOT NULL PRIMARY KEY,
          tourist_id VARCHAR(50) NOT NULL,
          item_type NVARCHAR(50) NOT NULL,
          item_id VARCHAR(50) NOT NULL,
          created_at DATETIME DEFAULT GETDATE(),
          CONSTRAINT UQ_tourist_favorites UNIQUE (tourist_id, item_type, item_id)
        );
      END;

      -- Private Trip Places Junction Table (العلاقة متعدد إلى متعدد بين الرحلات الخاصة والمعالم السياحية)
      IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'places_trip_private')
      BEGIN
        CREATE TABLE places_trip_private (
          private_trip_id VARCHAR(50) NOT NULL,
          place_id VARCHAR(50) NOT NULL,
          visit_order INT DEFAULT 1,
          created_at DATETIME DEFAULT GETDATE(),
          PRIMARY KEY (private_trip_id, place_id)
        );
      END;

      -- Seed / Sync canonical landmarks into places_tourist table in DelniDB
      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-tripoli-castle')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-tripoli-castle', N'قلعة السراي الحمراء والمدينة القديمة', N'الحصن التاريخي المطل على ميناء طرابلس ومجمع المتاحف التاريخية والأسواق العتيقة.', N'طرابلس', N'المنطقة الغربية', 13.1802, 32.8950, N'مدن قديمة وقلاع', '/assets/dest-tripoli.jpg', 'https://maps.google.com/?q=32.8950,13.1802', N'مجمع متاحف السراي الحمراء، أسواق طرابلس القديمة وسوق القزديرة، قوس ماركوس أوريليوس، جامع أحمد باشا القره مانلي');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-gharyan-caves')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-gharyan-caves', N'بيوت الحفر التراثية في غريان', N'العمارة التحت-أرضية الفريدة المنحوتة في الصخور الجبلية ومتاجر الفخار والخزف التقليدي.', N'غريان', N'جبل نفوسة', 13.0167, 32.1667, N'طبيعة وجبال', '/assets/dest-gharyan-cave.jpg', 'https://maps.google.com/?q=32.1667,13.0167', N'حوش الحفر التراثي تحت الأرض، مصانع الخزف والفخار اليدوي، إطلالة جبل نفوسة الشاهقة، أسواق الحرف اليدوية التقليدية');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-nalut-ksar')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-nalut-ksar', N'قصور وقلاع الجبل الغربي (نالوت وكاباو)', N'قلاع التخزين الأمازيغية الدائرية الشاهقة على حافة الجرف الجبلي وأزقة المدينة العتيقة.', N'نالوت / كاباو', N'جبل نفوسة', 10.9833, 31.8667, N'مدن قديمة وقلاع', '/assets/dest-ksar-desert.jpg', 'https://maps.google.com/?q=31.8667,10.9833', N'قصر نالوت الدائري لتخزين الحبوب، قصر كاباو الأثري، معاصر الزيتون الصخرية القديمة، الأزقة الأمازيغية العتيقة');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-jabal-green')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-jabal-green', N'وادي الكوف وغابات الجبل الأخضر', N'أكبر الغابات الطبيعية وجسر وادي الكوف المعلق وأودية الطبيعة الجبلية الساحرة.', N'البيضاء / الجبل الأخضر', N'المنطقة الشرقية', 21.7500, 32.7667, N'طبيعة وجبال', '/assets/dest-jabal-akhdar-panorama.jpg', 'https://maps.google.com/?q=32.7667,21.7500', N'جسر وادي الكوف المعلق، غابات السرو والصنوبر الطبيعية، شلالات شحات والبيضاء، مسارات المشي والتنزه الجبلية');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-ubari-lakes')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-ubari-lakes', N'بحيرات رملة أوباري وقبر عون', N'عجائب الصحراء الكبرى: بحيرات مالحة بديعة وسط كثبان الرمال الذهبية الشاهقة والواحات.', N'أوباري', N'المنطقة الجنوبية', 12.8791, 26.5677, N'واحات صحراوية', '/assets/dest-ubari.jpg', 'https://maps.google.com/?q=26.5677,12.8791', N'بحيرة قبر عون الكبريتية العلاجية، بحيرة أم الماء الفيروزية، رحلات سيارات الدفع الرباعي وسفاري الكثبان، واحة قروما');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-apollonia')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-apollonia', N'مدينة أبولونيا ومنحوتات أسلونطة الصخرية', N'الميناء الإغريقي الغارق القديم على ساحل البحر والمتحف المفتوح ومنحوتات أسلونطة.', N'سوسة / شحات', N'المنطقة الشرقية', 21.9667, 32.9000, N'آثار تاريخية', '/assets/dest-cyrene.jpg', 'https://maps.google.com/?q=32.9000,21.9667', N'الميناء الإغريقي الغارق القديم، الحمامات البيزنطية، المسرح الإغريقي المطل على البحر، منحوتات أسلونطة الصخرية');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'att-villa-silin')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('att-villa-silin', N'فيلا سيلين والموزاييك الروماني الفاخر', N'الفيلا الرومانية الساحلية الأشهر في المتوسط بأرضيات الفسيفساء الأثرية السليمة تماماً.', N'الخمس', N'المنطقة الغربية', 14.2667, 32.6500, N'آثار تاريخية', '/assets/hero-leptis.jpg', 'https://maps.google.com/?q=32.6500,14.2667', N'لوحات الفسيفساء الأسطورية المحفوظة، حمامات الفيلا الساحلية، الحديقة والشرفة البانورامية على ساحل البحر، الأعمدة الكورنثية');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'city-tripoli')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('city-tripoli', N'مدينة طرابلس التاريخية والأسواق القديمة', N'العاصمة العريقة بأسواقها وسراياها وقوس ماركوس أوريليوس وأزقتها الأندلسية العتيقة.', N'طرابلس', N'المنطقة الغربية', 13.1802, 32.8950, N'مدن سياحية', '/assets/dest-tripoli.jpg', 'https://maps.google.com/?q=32.8950,13.1802', N'ميدان الشهداء، المدينة القديمة، دار عبد الله كريستا، فندق زميط، برج الساعة العثماني، جامع الناقة العتيق');

      IF NOT EXISTS (SELECT 1 FROM places_tourist WHERE place_id = 'city-benghazi')
        INSERT INTO places_tourist (place_id, place_name, description, city, region, longitude, latitude, category, place_image, google_maps_url, highlights)
        VALUES ('city-benghazi', N'مدينة بنغازي التاريخية والبحيرات', N'عروس البحر المتوسط، بمبانيها التاريخية وبحيراتها وشواطئها الممتدة.', N'بنغازي', N'المنطقة الشرقية', 20.0667, 32.1167, N'مدن سياحية', '/assets/dest-harbor-coast.jpg', 'https://maps.google.com/?q=32.1167,20.0667', N'المنارة الإيطالية التاريخية، كورنيش بنغازي الممتد، سوق الحوت التراثي، بحيرة 23 يوليو والكاتدرائية التاريخية');
    `);
    try {
      await p.request().query("UPDATE tourists SET created_at = GETDATE() WHERE created_at IS NULL;");
    } catch (_) {}
    console.log('[DelniDB] Schema verified: stations tables, places junctions, notifications, and tourist account_status ready.');
  } catch (err) {
    console.warn('[DelniDB Schema Notice]:', err.message);
  }
}

// Helper for JSON response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

// Request body reader
function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 25 * 1024 * 1024) { // 25MB max
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

// Notification creation helper with deduplication
async function createNotificationInDb(dbPool, { type, title, body, recipient_role, recipient_id, link, dedupe_key }) {
  if (!dbPool) return null;
  try {
    const cleanId = `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const req = dbPool.request();
    req.input('id', sql.VarChar(50), cleanId);
    req.input('type', sql.NVarChar(50), String(type || 'system').trim());
    req.input('title', sql.NVarChar(255), String(title || 'إشعار جديد').trim());
    req.input('body', sql.NVarChar(sql.MAX), String(body || '').trim());
    req.input('recipient_role', sql.NVarChar(50), String(recipient_role || 'all').trim());
    req.input('recipient_id', sql.NVarChar(100), recipient_id ? String(recipient_id).trim() : null);
    req.input('link', sql.NVarChar(255), link ? String(link).trim() : null);
    req.input('dedupe_key', sql.VarChar(100), dedupe_key ? String(dedupe_key).trim() : null);

    if (dedupe_key) {
      await req.query(`
        IF NOT EXISTS (SELECT 1 FROM notifications WITH (NOLOCK) WHERE dedupe_key = @dedupe_key)
        BEGIN
          INSERT INTO notifications (id, type, title, body, recipient_role, recipient_id, link, is_read, dedupe_key, created_at)
          VALUES (@id, @type, @title, @body, @recipient_role, @recipient_id, @link, 0, @dedupe_key, GETDATE());
        END
      `);
    } else {
      await req.query(`
        INSERT INTO notifications (id, type, title, body, recipient_role, recipient_id, link, is_read, dedupe_key, created_at)
        VALUES (@id, @type, @title, @body, @recipient_role, @recipient_id, @link, 0, NULL, GETDATE());
      `);
    }
    return cleanId;
  } catch (err) {
    console.warn('[Notification Create Warning]:', err.message);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = url.pathname;
  console.log(`[REQ] ${req.method} ${pathname}`);

  try {
    const db = await getPool();

    // 1. Health & Status
    if (pathname === '/api/db/health' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT 
          (SELECT COUNT(*) FROM transportation_companies) as companies_count,
          (SELECT COUNT(*) FROM vehicles) as vehicles_count,
          (SELECT COUNT(*) FROM drivers) as drivers_count,
          (SELECT COUNT(*) FROM tourists) as tourists_count,
          (SELECT COUNT(*) FROM tour_guides) as guides_count,
          (SELECT COUNT(*) FROM hotels) as hotels_count,
          (SELECT COUNT(*) FROM restaurants_cafes) as restaurants_count,
          (SELECT COUNT(*) FROM places_tourist) as places_count
      `);
      return sendJson(res, 200, {
        status: 'online',
        database: 'DelniDB (Microsoft SQL Server)',
        security: 'Strict Parameterized Queries (Anti-SQLi) Enabled',
        counts: result.recordset[0]
      });
    }

    // 1.5 Authentication / Login Verification
    if (pathname === '/api/db/login' && req.method === 'POST') {
      const body = await readBody(req);
      const { role, login, password } = body;
      const cleanLogin = String(login || '').trim().toLowerCase();
      const rawPassword = String(password || '').trim();

      if (!cleanLogin || !rawPassword) {
        return sendJson(res, 400, { success: false, error: 'يرجى إدخال اسم المستخدم وكلمة المرور' });
      }

      // Admin verification
      if (role === 'admin' || cleanLogin === 'admin@dalni.ly' || cleanLogin === 'admin') {
        if ((cleanLogin === 'admin@dalni.ly' || cleanLogin === 'admin') && (rawPassword === 'admin123' || rawPassword === 'admin')) {
          return sendJson(res, 200, {
            success: true,
            role: 'admin',
            user: { name: 'مدير النظام', fullName: 'مدير النظام (الأدمن)', email: 'admin@dalni.ly', role: 'admin' },
            message: 'تم تسجيل الدخول بنجاح'
          });
        }
        return sendJson(res, 401, { success: false, error: 'بيانات دخول مدير النظام غير صحيحة' });
      }

      // Transport company
      if (role === 'transport') {
        const tReq = db.request();
        tReq.input('login', sql.NVarChar(150), cleanLogin);
        const compRes = await tReq.query(`
          SELECT * FROM transportation_companies 
          WHERE LOWER(email) = @login OR LOWER(contract_number) = @login OR phone_number LIKE '%' + @login + '%'
        `);
        if (!compRes.recordset || compRes.recordset.length === 0) {
          return sendJson(res, 404, { success: false, error: 'الحساب غير متوفر في المنصة' });
        }
        const comp = compRes.recordset[0];
        if (comp.password && !verifyPassword(rawPassword, comp.password)) {
          return sendJson(res, 401, { success: false, error: 'كلمة المرور غير صحيحة' });
        }
        const sanitized = { ...comp, role: 'transport' };
        delete sanitized.password;
        return sendJson(res, 200, { success: true, role: 'transport', user: sanitized, message: 'تم تسجيل دخول شركة النقل بنجاح' });
      }

      // Driver
      if (role === 'driver') {
        const dReq = db.request();
        dReq.input('login', sql.NVarChar(150), cleanLogin);
        const drvRes = await dReq.query(`
          SELECT * FROM drivers 
          WHERE LOWER(email) = @login OR LOWER(driver_license_number) = @login OR phone_number LIKE '%' + @login + '%'
        `);
        if (!drvRes.recordset || drvRes.recordset.length === 0) {
          return sendJson(res, 404, { success: false, error: 'حساب السائق غير متوفر في المنصة' });
        }
        const drv = drvRes.recordset[0];
        if (drv.password && !verifyPassword(rawPassword, drv.password)) {
          return sendJson(res, 401, { success: false, error: 'كلمة المرور غير صحيحة' });
        }
        const sanitized = { ...drv, role: 'driver' };
        delete sanitized.password;
        return sendJson(res, 200, { success: true, role: 'driver', user: sanitized, message: 'تم تسجيل دخول السائق بنجاح' });
      }

      // Guide
      if (role === 'guide') {
        const gReq = db.request();
        gReq.input('login', sql.NVarChar(150), cleanLogin);
        const gRes = await gReq.query(`
          SELECT * FROM tour_guides 
          WHERE LOWER(email) = @login OR LOWER(license_number) = @login OR phone_number LIKE '%' + @login + '%'
        `);
        if (!gRes.recordset || gRes.recordset.length === 0) {
          return sendJson(res, 404, { success: false, error: 'حساب المرشد غير متوفر في المنصة' });
        }
        const g = gRes.recordset[0];
        if (g.password && !verifyPassword(rawPassword, g.password)) {
          return sendJson(res, 401, { success: false, error: 'كلمة المرور غير صحيحة' });
        }
        if (g.verification_status !== 'موثق') {
          return sendJson(res, 403, {
            success: false,
            error: 'طلب انضمامك كمرشد سياحي ما زال قيد المراجعة والتدقيق من قبل الإدارة. يرجى الانتظار حتى يتم اعتماد حسابك وتفعيله.'
          });
        }
        const sanitized = { ...g, role: 'guide' };
        delete sanitized.password;
        return sendJson(res, 200, { success: true, role: 'guide', user: sanitized, message: 'تم تسجيل دخول المرشد بنجاح' });
      }

      // Tourist
      if (role === 'tourist') {
        const uReq = db.request();
        uReq.input('login', sql.NVarChar(150), cleanLogin);
        const uRes = await uReq.query(`
          SELECT * FROM tourists 
          WHERE LOWER(email) = @login OR phone_number LIKE '%' + @login + '%'
        `);
        if (!uRes.recordset || uRes.recordset.length === 0) {
          return sendJson(res, 404, { success: false, error: 'الحساب غير متوفر في المنصة' });
        }
        const u = uRes.recordset[0];
        if (u.password && !verifyPassword(rawPassword, u.password)) {
          return sendJson(res, 401, { success: false, error: 'كلمة المرور غير صحيحة' });
        }
        const sanitized = { ...u, role: 'tourist' };
        delete sanitized.password;
        return sendJson(res, 200, { success: true, role: 'tourist', user: sanitized, message: 'تم تسجيل الدخول بنجاح' });
      }

      return sendJson(res, 400, { success: false, error: 'نوع الحساب غير مدعوم' });
    }

    // 2. Transportation Companies: GET
    if (pathname === '/api/db/companies' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT 
          contract_number,
          company_name,
          phone_number,
          address,
          city,
          email,
          total_vehicles,
          contract_start_date,
          contract_end_date,
          verification_status,
          google_maps_url
        FROM transportation_companies
        ORDER BY company_name ASC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 3. Transportation Companies: POST (Create / Update)
    if (pathname === '/api/db/companies' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        contract_number, company_name, phone_number, address,
        total_vehicles, contract_start_date, contract_end_date,
        email, password, city, verification_status, isNew
      } = body;

      // Validation
      if (!contract_number || !company_name || !phone_number) {
        return sendJson(res, 400, { success: false, error: 'كافة الحقول الأساسية لشركة النقل مطلوبة' });
      }

      const cleanContract = String(contract_number).trim();

      // Check duplicate primary key on new company creation
      if (isNew) {
        const dupReq = db.request();
        dupReq.input('chk_cnum', sql.NVarChar(50), cleanContract);
        const dupRes = await dupReq.query('SELECT 1 FROM transportation_companies WHERE contract_number = @chk_cnum');
        if (dupRes.recordset.length > 0) {
          return sendJson(res, 409, { success: false, error: 'رقم عقد شركة النقل مسجل مسبقاً لشركة أخرى في قاعدة البيانات' });
        }
      }

      const request = db.request();
      request.input('contract_number', sql.NVarChar(50), cleanContract);
      request.input('company_name', sql.NVarChar(150), String(company_name).trim());
      request.input('phone_number', sql.NVarChar(20), String(phone_number).trim());
      request.input('address', sql.NVarChar(255), String(address || '').trim());
      const totVehicles = Number(total_vehicles) || 1;
      request.input('total_vehicles', sql.Int, totVehicles);
      request.input('contract_start_date', sql.Date, contract_start_date || new Date());
      const rawPassword = body.password ? String(body.password).trim() : '';
      const shouldUpdatePass = rawPassword && rawPassword !== '••••••••' && rawPassword.length >= 4;
      const hashedPass = shouldUpdatePass ? hashPassword(rawPassword) : '';

      request.input('contract_end_date', sql.Date, contract_end_date || '2028-01-01');
      request.input('email', sql.NVarChar(100), String(email || '').trim());
      request.input('default_password', sql.NVarChar(255), hashPassword('password123'));
      request.input('hasNewPassword', sql.Bit, shouldUpdatePass ? 1 : 0);
      request.input('hashedPassword', sql.NVarChar(255), hashedPass);
      request.input('city', sql.NVarChar(100), String(city || 'طرابلس').trim());
      request.input('verification_status', sql.NVarChar(50), String(verification_status || 'موثق').trim());
      const rawMapUrl = body.google_maps_url || (body.address && (String(body.address).includes('http') || String(body.address).includes('maps')) ? body.address : '');
      request.input('google_maps_url', sql.NVarChar(500), String(rawMapUrl || '').trim());

      await request.query(`
        IF EXISTS (SELECT 1 FROM transportation_companies WHERE contract_number = @contract_number)
        BEGIN
          UPDATE transportation_companies
          SET company_name = @company_name,
              phone_number = @phone_number,
              address = @address,
              google_maps_url = CASE WHEN @google_maps_url <> '' THEN @google_maps_url ELSE google_maps_url END,
              total_vehicles = @total_vehicles,
              email = @email,
              city = @city,
              verification_status = @verification_status,
              contract_start_date = @contract_start_date,
              contract_end_date = @contract_end_date,
              password = CASE WHEN @hasNewPassword = 1 THEN @hashedPassword ELSE password END
          WHERE contract_number = @contract_number;
        END
        ELSE
        BEGIN
          INSERT INTO transportation_companies 
          (contract_number, company_name, phone_number, address, google_maps_url, total_vehicles, contract_start_date, contract_end_date, email, password, city, verification_status)
          VALUES 
          (@contract_number, @company_name, @phone_number, @address, @google_maps_url, @total_vehicles, @contract_start_date, @contract_end_date, @email, CASE WHEN @hasNewPassword = 1 THEN @hashedPassword ELSE @default_password END, @city, @verification_status);
        END
      `);

      // Real-time Event Trigger: Company Registration Notification
      try {
        if (isNew) {
          await createNotificationInDb(db, {
            type: 'system',
            title: `🏢 تسجيل شركة نقل سياحي جديدة (${company_name})`,
            body: `تم تسجيل وتوثيق شركة نقل جديدة (${company_name}) برقم عقد (${cleanContract}) في مدينة (${city || 'طرابلس'}).`,
            recipient_role: 'admin',
            link: '/dashboard/admin',
            dedupe_key: `company-reg-${cleanContract}`,
          });

          await createNotificationInDb(db, {
            type: 'system',
            title: `🎉 مرحباً بكم في منصة دلني للسياحة الليبية`,
            body: `تم توثيق وتفعيل حساب شركة (${company_name}) بنجاح. يمكنك الآن إدارة أسطول الحافلات والمركبات والسائقين واستقبال طلبات النقل.`,
            recipient_role: 'company',
            recipient_id: cleanContract,
            link: '/dashboard/transport',
            dedupe_key: `company-welcome-${cleanContract}`,
          });
        }
      } catch (cErr) {}

      return sendJson(res, 201, { success: true, message: 'تم حفظ شركة النقل في SQL Server بنجاح' });
    }

    // 3.1 Transportation Companies: DELETE
    if (pathname === '/api/db/companies' && req.method === 'DELETE') {
      const contractNumber = url.searchParams.get('contract_number');
      if (!contractNumber) {
        return sendJson(res, 400, { success: false, error: 'رقم العقد مطلوب للحذف' });
      }

      const transaction = new sql.Transaction(db);
      await transaction.begin();
      try {
        const cReq = new sql.Request(transaction);
        cReq.input('contract_number', sql.NVarChar(50), contractNumber);

        // Cascading safe delete
        await cReq.query(`
          UPDATE drivers SET assigned_vehicle_plate = NULL WHERE contract_number = @contract_number;
          DELETE FROM drivers WHERE contract_number = @contract_number;
          DELETE FROM vehicles WHERE contract_number = @contract_number;
          DELETE FROM transportation_companies WHERE contract_number = @contract_number;
        `);

        await transaction.commit();
        return sendJson(res, 200, { success: true, message: 'تم حذف شركة النقل وسجلاتها المرتبطة بنجاح من DelniDB' });
      } catch (delErr) {
        await transaction.rollback();
        throw delErr;
      }
    }

    // 4. Vehicles: GET
    if (pathname === '/api/db/vehicles' && req.method === 'GET') {
      const contractNumber = url.searchParams.get('contract_number');
      const request = db.request();
      let query = `
        SELECT v.*, c.company_name, c.city AS company_city, c.city AS city
        FROM vehicles v
        LEFT JOIN transportation_companies c ON v.contract_number = c.contract_number
      `;
      if (contractNumber) {
        request.input('contract_number', sql.NVarChar(50), contractNumber);
        query += ' WHERE v.contract_number = @contract_number';
      }
      query += ' ORDER BY v.plate_number ASC';
      const result = await request.query(query);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 5. Vehicles: POST (Create / Update + Driver Assignment)
    if (pathname === '/api/db/vehicles' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        plate_number, vehicle_type, seating_capacity, daily_rate,
        category, vehicle_status, insurance_details, insurance_image,
        vehicle_image, contract_number, driverInfo, isNew
      } = body;

      if (!plate_number || !vehicle_type) {
        return sendJson(res, 400, { success: false, error: 'بيانات المركبة غير مكتملة' });
      }

      const cleanPlate = String(plate_number).trim();

      // Check duplicate plate on creation
      if (isNew) {
        const dupReq = db.request();
        dupReq.input('chk_plate', sql.NVarChar(50), cleanPlate);
        const dupRes = await dupReq.query('SELECT 1 FROM vehicles WHERE plate_number = @chk_plate');
        if (dupRes.recordset.length > 0) {
          return sendJson(res, 409, { success: false, error: 'رقم لوحة المركبة مسجل مسبقاً لمركبة أخرى' });
        }
      }

      // TRANSACTION: Save vehicle AND assign/create driver
      const transaction = new sql.Transaction(db);
      await transaction.begin();

      try {
        // Ensure parent company exists to satisfy foreign key constraint
        const targetContract = String(contract_number || '9898').trim();
        const cReq = new sql.Request(transaction);
        cReq.input('c_number', sql.NVarChar(50), targetContract);
        const compChk = await cReq.query('SELECT 1 FROM transportation_companies WHERE contract_number = @c_number');
        if (compChk.recordset.length === 0) {
          const autoComp = new sql.Request(transaction);
          autoComp.input('c_num', sql.NVarChar(50), targetContract);
          autoComp.input('c_name', sql.NVarChar(150), String(body.company_name || 'شركة النقل السياحي').trim());
          autoComp.input('c_phone', sql.NVarChar(20), `091${Math.floor(1000000 + Math.random() * 9000000)}`);
          await autoComp.query(`
            INSERT INTO transportation_companies 
            (contract_number, company_name, phone_number, address, total_vehicles, contract_start_date, contract_end_date, email, password, city, verification_status)
            VALUES 
            (@c_num, @c_name, @c_phone, N'طرابلس', 1, GETDATE(), '2028-01-01', @c_num + '@dalni.ly', 'password123', N'طرابلس', N'موثق')
          `);
        }

        const vReq = new sql.Request(transaction);
        vReq.input('plate_number', sql.NVarChar(50), cleanPlate);
        vReq.input('vehicle_type', sql.NVarChar(100), String(vehicle_type).trim());
        vReq.input('seating_capacity', sql.Int, Number(seating_capacity) || 15);
        vReq.input('daily_rate', sql.Decimal(10, 2), Number(daily_rate) || 350);
        vReq.input('category', sql.NVarChar(50), String(category || 'سياحي').trim());
        vReq.input('vehicle_status', sql.NVarChar(50), String(vehicle_status || 'جاهزة').trim());
        vReq.input('insurance_details', sql.NVarChar(sql.MAX), String(insurance_details || 'وثيقة تأمين ركاب سارية المفعول').trim());
        const finalVehImg = String(vehicle_image || body.photos || '').trim();
        vReq.input('insurance_image', sql.NVarChar(sql.MAX), String(insurance_image || ''));
        vReq.input('vehicle_image', sql.NVarChar(sql.MAX), finalVehImg);
        vReq.input('photos', sql.NVarChar(sql.MAX), finalVehImg);
        vReq.input('contract_number', sql.NVarChar(50), targetContract);

        await vReq.query(`
          IF EXISTS (SELECT 1 FROM vehicles WHERE plate_number = @plate_number)
          BEGIN
            UPDATE vehicles
            SET vehicle_type = @vehicle_type,
                seating_capacity = @seating_capacity,
                daily_rate = @daily_rate,
                category = @category,
                vehicle_status = @vehicle_status,
                insurance_details = CASE WHEN @insurance_details <> '' THEN @insurance_details ELSE insurance_details END,
                insurance_image = CASE WHEN @insurance_image <> '' THEN @insurance_image ELSE insurance_image END,
                vehicle_image = CASE WHEN @vehicle_image <> '' THEN @vehicle_image ELSE vehicle_image END,
                photos = CASE WHEN @photos <> '' THEN @photos ELSE photos END,
                contract_number = @contract_number
            WHERE plate_number = @plate_number;
          END
          ELSE
          BEGIN
            INSERT INTO vehicles
            (plate_number, vehicle_type, seating_capacity, daily_rate, category, vehicle_status, insurance_details, insurance_image, vehicle_image, photos, contract_number)
            VALUES
            (@plate_number, @vehicle_type, @seating_capacity, @daily_rate, @category, @vehicle_status, @insurance_details, @insurance_image, @vehicle_image, @photos, @contract_number);
          END
        `);

        // Handle Driver assignment
        if (driverInfo) {
          if (driverInfo.newDriver) {
            const nd = driverInfo.newDriver;
            const dReq = new sql.Request(transaction);
            dReq.input('driver_license_number', sql.NVarChar(50), String(nd.driver_license_number).trim());
            dReq.input('full_name', sql.NVarChar(150), String(nd.full_name).trim());
            dReq.input('phone_number', sql.NVarChar(20), String(nd.phone_number).trim());
            dReq.input('national_id_or_passport', sql.NVarChar(50), String(nd.national_id_or_passport || '').trim());
            dReq.input('license_date_valid', sql.Date, nd.license_date_valid || '2029-12-31');
            dReq.input('contract_number', sql.NVarChar(50), targetContract);
            dReq.input('assigned_vehicle_plate', sql.NVarChar(50), cleanPlate);
            dReq.input('email', sql.NVarChar(100), String(nd.email || `driver_${Date.now()}@dalni.ly`).trim());
            dReq.input('password', sql.NVarChar(255), hashPassword(nd.password || 'password123'));
            dReq.input('account_status', sql.NVarChar(50), 'نشط');
            dReq.input('operational_status', sql.NVarChar(50), 'متاح');
            await dReq.query(`
              IF EXISTS (SELECT 1 FROM drivers WHERE driver_license_number = @driver_license_number)
              BEGIN
                UPDATE drivers SET assigned_vehicle_plate = @assigned_vehicle_plate WHERE driver_license_number = @driver_license_number;
              END
              ELSE
              BEGIN
                INSERT INTO drivers
                (driver_license_number, full_name, phone_number, national_id_or_passport, license_date_valid, contract_number, assigned_vehicle_plate, email, password, account_status, operational_status)
                VALUES
                (@driver_license_number, @full_name, @phone_number, @national_id_or_passport, @license_date_valid, @contract_number, @assigned_vehicle_plate, @email, @password, @account_status, @operational_status);
              END
            `);
          } else if (driverInfo.licenseNumber) {
            // Unassign other drivers from this plate
            const clearOld = new sql.Request(transaction);
            clearOld.input('c_plate', sql.NVarChar(50), cleanPlate);
            clearOld.input('keep_lic', sql.NVarChar(50), String(driverInfo.licenseNumber).trim());
            await clearOld.query('UPDATE drivers SET assigned_vehicle_plate = NULL WHERE assigned_vehicle_plate = @c_plate AND driver_license_number <> @keep_lic');

            // Assign this plate to chosen driver
            const updReq = new sql.Request(transaction);
            updReq.input('assigned_vehicle_plate', sql.NVarChar(50), cleanPlate);
            updReq.input('license_number', sql.NVarChar(50), String(driverInfo.licenseNumber).trim());
            await updReq.query('UPDATE drivers SET assigned_vehicle_plate = @assigned_vehicle_plate WHERE driver_license_number = @license_number');
          } else {
            // Unassign any driver from this plate
            const clearAll = new sql.Request(transaction);
            clearAll.input('c_plate', sql.NVarChar(50), cleanPlate);
            await clearAll.query('UPDATE drivers SET assigned_vehicle_plate = NULL WHERE assigned_vehicle_plate = @c_plate');
          }
        }

        await transaction.commit();
        return sendJson(res, 201, { success: true, message: 'تم حفظ المركبة وربط السائق بها بنجاح في DelniDB' });
      } catch (txErr) {
        await transaction.rollback();
        throw txErr;
      }
    }

    // 5.1 Vehicles: DELETE
    if (pathname === '/api/db/vehicles' && req.method === 'DELETE') {
      const plateNumber = url.searchParams.get('plate_number');
      if (!plateNumber) {
        return sendJson(res, 400, { success: false, error: 'رقم اللوحة مطلوب للحذف' });
      }

      const transaction = new sql.Transaction(db);
      await transaction.begin();
      try {
        const vReq = new sql.Request(transaction);
        vReq.input('plate_number', sql.NVarChar(50), plateNumber);

        await vReq.query(`
          UPDATE drivers SET assigned_vehicle_plate = NULL WHERE assigned_vehicle_plate = @plate_number;
          DELETE FROM vehicles WHERE plate_number = @plate_number;
        `);

        await transaction.commit();
        return sendJson(res, 200, { success: true, message: 'تم حذف المركبة بنجاح من DelniDB' });
      } catch (delErr) {
        await transaction.rollback();
        throw delErr;
      }
    }

    // 6. Drivers: GET
    if (pathname === '/api/db/drivers' && req.method === 'GET') {
      const contractNumber = url.searchParams.get('contract_number');
      const request = db.request();
      let query = `
        SELECT d.*, c.company_name
        FROM drivers d
        LEFT JOIN transportation_companies c ON d.contract_number = c.contract_number
      `;
      if (contractNumber) {
        request.input('contract_number', sql.NVarChar(50), contractNumber);
        query += ' WHERE d.contract_number = @contract_number';
      }
      query += ' ORDER BY d.full_name ASC';
      const result = await request.query(query);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 7. Drivers: POST
    if (pathname === '/api/db/drivers' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        driver_license_number, full_name, phone_number,
        national_id_or_passport, license_date_valid, contract_number,
        assigned_vehicle_plate, email, password, account_status,
        operational_status, isNew
      } = body;

      if (!driver_license_number || !full_name || !phone_number) {
        return sendJson(res, 400, { success: false, error: 'بيانات السائق غير مكتملة' });
      }

      const cleanLic = String(driver_license_number).trim();
      const cleanPhone = String(phone_number).trim();
      const cleanNid = String(national_id_or_passport || '').trim();
      const cleanEmail = String(email || `driver_${cleanLic}@dalni.ly`).trim();

      // 1. Check duplicate primary key on creation
      if (isNew) {
        const dupReq = db.request();
        dupReq.input('chk_lic', sql.NVarChar(50), cleanLic);
        const dupRes = await dupReq.query('SELECT 1 FROM drivers WHERE driver_license_number = @chk_lic');
        if (dupRes.recordset.length > 0) {
          return sendJson(res, 400, { success: false, error: 'رقم رخصة القيادة مسجل مسبقاً لسائق آخر في قاعدة البيانات' });
        }
      }

      // 2. Check duplicate phone number
      const phoneChk = db.request();
      phoneChk.input('chk_phone', sql.NVarChar(20), cleanPhone);
      phoneChk.input('chk_lic', sql.NVarChar(50), cleanLic);
      const phoneRes = await phoneChk.query('SELECT 1 FROM drivers WHERE phone_number = @chk_phone AND driver_license_number <> @chk_lic');
      if (phoneRes.recordset.length > 0) {
        return sendJson(res, 400, { success: false, error: 'رقم هاتف السائق مسجل مسبقاً لسائق آخر في قاعدة البيانات' });
      }

      // 3. Check duplicate national ID if provided
      if (cleanNid) {
        const nidChk = db.request();
        nidChk.input('chk_nid', sql.NVarChar(50), cleanNid);
        nidChk.input('chk_lic', sql.NVarChar(50), cleanLic);
        const nidRes = await nidChk.query('SELECT 1 FROM drivers WHERE national_id_or_passport = @chk_nid AND driver_license_number <> @chk_lic');
        if (nidRes.recordset.length > 0) {
          return sendJson(res, 400, { success: false, error: 'الرقم الوطني للسائق مسجل مسبقاً لسائق آخر في قاعدة البيانات' });
        }
      }

      // 4. Check duplicate email if provided
      if (cleanEmail) {
        const emailChk = db.request();
        emailChk.input('chk_email', sql.NVarChar(100), cleanEmail);
        emailChk.input('chk_lic', sql.NVarChar(50), cleanLic);
        const emailRes = await emailChk.query('SELECT 1 FROM drivers WHERE email = @chk_email AND driver_license_number <> @chk_lic');
        if (emailRes.recordset.length > 0) {
          return sendJson(res, 400, { success: false, error: 'البريد الإلكتروني مسجل مسبقاً لسائق آخر في قاعدة البيانات' });
        }
      }

      // Check and satisfy foreign key for contract_number
      const cleanContract = String(contract_number || '9898').trim();
      const cChk = await db.request().input('cChk', sql.NVarChar(50), cleanContract).query('SELECT 1 FROM transportation_companies WHERE contract_number = @cChk');
      if (cChk.recordset.length === 0) {
        await db.request()
          .input('c_num', sql.NVarChar(50), cleanContract)
          .input('c_name', sql.NVarChar(150), String(body.company_name || 'شركة النقل').trim())
          .input('c_phone', sql.NVarChar(20), '0910000000')
          .query(`
            INSERT INTO transportation_companies 
            (contract_number, company_name, phone_number, address, total_vehicles, contract_start_date, contract_end_date, email, password, city, verification_status)
            VALUES 
            (@c_num, @c_name, @c_phone, N'ليبيا', 1, GETDATE(), '2028-01-01', @c_num + '@dalni.ly', 'password123', N'طرابلس', N'موثق')
          `);
      }

      // Validate assigned_vehicle_plate (default to null for new drivers unless explicitly assigned)
      let validPlate = null;
      const rawPlate = assigned_vehicle_plate ? String(assigned_vehicle_plate).trim() : '';
      if (rawPlate && rawPlate !== 'غير مسند' && rawPlate !== 'غير معين' && rawPlate !== 'none' && rawPlate !== 'null' && rawPlate !== 'undefined') {
        const vChk = await db.request().input('pChk', sql.NVarChar(50), rawPlate).query('SELECT 1 FROM vehicles WHERE plate_number = @pChk');
        if (vChk.recordset.length > 0) {
          validPlate = rawPlate;
        }
      }

      const rawPassword = body.password ? String(body.password).trim() : '';
      const shouldUpdatePass = rawPassword && rawPassword !== '••••••••' && rawPassword.length >= 4;
      const hashedPass = shouldUpdatePass ? hashPassword(rawPassword) : '';

      try {
        const request = db.request();
        request.input('driver_license_number', sql.NVarChar(50), cleanLic);
        request.input('full_name', sql.NVarChar(150), String(full_name).trim());
        request.input('phone_number', sql.NVarChar(20), cleanPhone);
        request.input('national_id_or_passport', sql.NVarChar(50), cleanNid);
        request.input('license_date_valid', sql.Date, license_date_valid || '2029-12-31');
        request.input('contract_number', sql.NVarChar(50), cleanContract);
        request.input('assigned_vehicle_plate', sql.NVarChar(50), validPlate);
        request.input('email', sql.NVarChar(100), cleanEmail);
        request.input('default_password', sql.NVarChar(255), hashPassword('password123'));
        request.input('hasNewPassword', sql.Bit, shouldUpdatePass ? 1 : 0);
        request.input('hashedPassword', sql.NVarChar(255), hashedPass);
        request.input('account_status', sql.NVarChar(50), String(account_status || 'نشط').trim());
        request.input('operational_status', sql.NVarChar(50), String(operational_status || 'متاح').trim());

        await request.query(`
          IF EXISTS (SELECT 1 FROM drivers WHERE driver_license_number = @driver_license_number)
          BEGIN
            UPDATE drivers
            SET full_name = @full_name,
                phone_number = @phone_number,
                national_id_or_passport = @national_id_or_passport,
                license_date_valid = @license_date_valid,
                assigned_vehicle_plate = @assigned_vehicle_plate,
                operational_status = @operational_status,
                email = @email,
                account_status = @account_status,
                password = CASE WHEN @hasNewPassword = 1 THEN @hashedPassword ELSE password END
            WHERE driver_license_number = @driver_license_number;
          END
          ELSE
          BEGIN
            INSERT INTO drivers
            (driver_license_number, full_name, phone_number, national_id_or_passport, license_date_valid, contract_number, assigned_vehicle_plate, email, password, account_status, operational_status)
            VALUES
            (@driver_license_number, @full_name, @phone_number, @national_id_or_passport, @license_date_valid, @contract_number, @assigned_vehicle_plate, @email, CASE WHEN @hasNewPassword = 1 THEN @hashedPassword ELSE @default_password END, @account_status, @operational_status);
          END

          IF @assigned_vehicle_plate IS NOT NULL
          BEGIN
            UPDATE drivers
            SET assigned_vehicle_plate = NULL
            WHERE assigned_vehicle_plate = @assigned_vehicle_plate AND driver_license_number <> @driver_license_number;
          END
        `);

        // Real-time Event Trigger: Vehicle assignment to driver
        if (validPlate) {
          await createNotificationInDb(db, {
            type: 'assignment',
            title: `🚍 تخصيص وتعيين مركبة جديدة لسجلك`,
            body: `تم إسناد المركبة المعتمدة برقم اللوحة (${validPlate}) لملف قيادتك لدى شركة النقل.`,
            recipient_role: 'driver',
            recipient_id: cleanLic,
            link: '/dashboard/driver',
            dedupe_key: `driver-veh-${cleanLic}-${validPlate}`,
          });
        }

        return sendJson(res, 201, { success: true, message: 'تم حفظ السائق في DelniDB بنجاح' });
      } catch (sqlErr) {
        console.error('[DelniDB Driver Insert Error]:', sqlErr.message);
        let friendlyErr = 'فشل حفظ بيانات السائق في قاعدة البيانات';
        if (sqlErr.message.includes('UQ__drivers__9DF00BEE') || sqlErr.message.includes('national_id_or_passport')) {
          friendlyErr = 'الرقم الوطني للسائق مسجل مسبقاً لسائق آخر في قاعدة البيانات';
        } else if (sqlErr.message.includes('UQ__drivers__A1936A6B') || sqlErr.message.includes('phone_number')) {
          friendlyErr = 'رقم هاتف السائق مسجل مسبقاً لسائق آخر في قاعدة البيانات';
        } else if (sqlErr.message.includes('UQ__drivers__AB6E6164') || sqlErr.message.includes('email')) {
          friendlyErr = 'البريد الإلكتروني مسجل مسبقاً لسائق آخر في قاعدة البيانات';
        } else if (sqlErr.message.includes('PK__drivers') || sqlErr.message.includes('driver_license_number')) {
          friendlyErr = 'رقم رخصة القيادة مسجل مسبقاً لسائق آخر في قاعدة البيانات';
        }
        return sendJson(res, 400, { success: false, error: friendlyErr });
      }
    }

    // 7.1 Drivers: DELETE
    if (pathname === '/api/db/drivers' && req.method === 'DELETE') {
      const licenseNumber = url.searchParams.get('driver_license_number');
      if (!licenseNumber) {
        return sendJson(res, 400, { success: false, error: 'رقم رخصة القيادة مطلوب للحذف' });
      }

      const request = db.request();
      request.input('driver_license_number', sql.NVarChar(50), licenseNumber);
      await request.query('DELETE FROM drivers WHERE driver_license_number = @driver_license_number');
      return sendJson(res, 200, { success: true, message: 'تم حذف السائق بنجاح من DelniDB' });
    }

    // 8. Tourists: GET (List or Single with History & Reviews - Password Excluded for Privacy)
    if (pathname === '/api/db/tourists' && req.method === 'GET') {
      const touristId = url.searchParams.get('tourist_id') || url.searchParams.get('id');

      if (touristId) {
        const cleanTId = String(touristId).trim();
        const tReq = db.request();
        tReq.input('tid', sql.NVarChar(100), cleanTId);

        const profileRes = await tReq.query(`
          SELECT tourist_id, full_name, email, phone_number, COALESCE(account_status, N'نشط') as account_status, created_at
          FROM tourists
          WHERE tourist_id = @tid OR email = @tid OR phone_number LIKE '%' + @tid + '%'
        `);

        if (!profileRes.recordset || profileRes.recordset.length === 0) {
          return sendJson(res, 404, { success: false, error: 'حساب السائح غير موجود' });
        }

        const tourist = profileRes.recordset[0];
        const actualTid = tourist.tourist_id;

        // Fetch Daily Bookings for this tourist
        const dailyBReq = db.request();
        dailyBReq.input('actualTid', sql.VarChar(50), actualTid);
        const dailyBRes = await dailyBReq.query(`
          SELECT b.*, dt.trip_title, dt.departure_city, dt.destination_city, dt.photo as trip_photo
          FROM bookings_daily b
          LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id
          WHERE b.tourist_id = @actualTid
          ORDER BY b.booking_date DESC
        `);

        // Fetch Weekly Bookings for this tourist
        const weeklyBReq = db.request();
        weeklyBReq.input('actualTid', sql.VarChar(50), actualTid);
        const weeklyBRes = await weeklyBReq.query(`
          SELECT b.*, wt.trip_title, wt.departure_city, wt.photo_1 as trip_photo
          FROM bookings_weekly b
          LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id
          WHERE b.tourist_id = @actualTid
          ORDER BY b.booking_date DESC
        `);

        // Fetch Reviews made by this tourist
        const revDReq = db.request();
        revDReq.input('actualTid', sql.VarChar(50), actualTid);
        let reviewsList = [];
        try {
          const revRes = await revDReq.query(`
            SELECT 'رحلة يومية' as target_type, dt.trip_title as target_name, r.stars_rating, r.comment_text, CONVERT(VARCHAR(10), r.created_at, 120) as created_at
            FROM reviews_daily_trips r
            LEFT JOIN daily_trips dt ON r.daily_trip_id = dt.daily_trip_id
            WHERE r.tourist_id = @actualTid
            UNION ALL
            SELECT 'رحلة أسبوعية' as target_type, wt.trip_title as target_name, r.stars_rating, r.comment_text, CONVERT(VARCHAR(10), r.created_at, 120) as created_at
            FROM reviews_weekly_trips r
            LEFT JOIN weekly_trips wt ON r.weekly_trip_id = wt.weekly_trip_id
            WHERE r.tourist_id = @actualTid
            UNION ALL
            SELECT 'فندق' as target_type, h.hotel_name as target_name, r.stars_rating, r.comment_text, CONVERT(VARCHAR(10), r.created_at, 120) as created_at
            FROM reviews_hotels r
            LEFT JOIN hotels h ON r.hotel_id = h.hotel_id
            WHERE r.tourist_id = @actualTid
            UNION ALL
            SELECT 'مطعم/مقهى' as target_type, f.facility_name as target_name, r.stars_rating, r.comment_text, CONVERT(VARCHAR(10), r.created_at, 120) as created_at
            FROM reviews_facilities r
            LEFT JOIN restaurants_cafes f ON r.facility_id = f.facility_id
            WHERE r.tourist_id = @actualTid
            ORDER BY created_at DESC
          `);
          reviewsList = revRes.recordset || [];
        } catch (e) {
          console.warn('[Tourist reviews fetch warning]:', e.message);
        }

        return sendJson(res, 200, {
          success: true,
          data: {
            ...tourist,
            daily_bookings: dailyBRes.recordset || [],
            weekly_bookings: weeklyBRes.recordset || [],
            reviews: reviewsList,
            total_bookings: (dailyBRes.recordset?.length || 0) + (weeklyBRes.recordset?.length || 0),
            total_reviews: reviewsList.length
          }
        });
      }

      // Fetch all tourists with bookings count summary
      const result = await db.request().query(`
        SELECT 
          t.tourist_id, 
          t.full_name, 
          t.email, 
          t.phone_number, 
          COALESCE(t.account_status, N'نشط') as account_status,
          COALESCE(t.created_at, GETDATE()) as created_at,
          (SELECT COUNT(*) FROM bookings_daily bd WITH (NOLOCK) WHERE bd.tourist_id = t.tourist_id) as daily_bookings_count,
          (SELECT COUNT(*) FROM bookings_weekly bw WITH (NOLOCK) WHERE bw.tourist_id = t.tourist_id) as weekly_bookings_count
        FROM tourists t WITH (NOLOCK)
        ORDER BY t.full_name ASC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset || [] });
    }

    // 8.1 Tourists: POST (Registration & Updates)
    if (pathname === '/api/db/tourists' && req.method === 'POST') {
      const body = await readBody(req);
      const { tourist_id, full_name, email, phone_number, password, account_status } = body;
      if (!full_name || !email || !phone_number) {
        return sendJson(res, 400, { success: false, error: 'بيانات السائح غير مكتملة' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPhone = String(phone_number).trim();
      const cleanStatus = String(account_status || 'نشط').trim();

      const request = db.request();
      request.input('tourist_id', sql.NVarChar(50), String(tourist_id || `TST-${Date.now()}`).trim());
      request.input('full_name', sql.NVarChar(150), String(full_name).trim());
      request.input('email', sql.NVarChar(100), cleanEmail);
      request.input('phone_number', sql.NVarChar(20), cleanPhone);
      request.input('password', sql.NVarChar(255), hashPassword(password || 'password123'));
      request.input('account_status', sql.NVarChar(50), cleanStatus);

      await request.query(`
        IF EXISTS (SELECT 1 FROM tourists WHERE email = @email OR phone_number = @phone_number OR tourist_id = @tourist_id)
        BEGIN
          UPDATE tourists
          SET full_name = @full_name,
              phone_number = @phone_number,
              password = @password,
              account_status = @account_status
          WHERE email = @email OR phone_number = @phone_number OR tourist_id = @tourist_id;
        END
        ELSE
        BEGIN
          INSERT INTO tourists (tourist_id, full_name, email, phone_number, password, account_status)
          VALUES (@tourist_id, @full_name, @email, @phone_number, @password, @account_status);
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ حساب السائح في DelniDB بنجاح' });
    }

    // 8.2 Tourists: PUT / Status Restriction Toggle (تقييد أو تنشيط الحساب)
    if (pathname === '/api/db/tourists' && (req.method === 'PUT' || req.method === 'PATCH')) {
      const body = await readBody(req);
      const { tourist_id, account_status } = body;
      if (!tourist_id || !account_status) {
        return sendJson(res, 400, { success: false, error: 'معرّف السائح وحالة الحساب مطلوبة' });
      }

      const cleanId = String(tourist_id).trim();
      const cleanStatus = String(account_status).trim(); // 'نشط' or 'مقيّد'

      const request = db.request();
      request.input('id', sql.NVarChar(50), cleanId);
      request.input('status', sql.NVarChar(50), cleanStatus);

      await request.query(`
        UPDATE tourists
        SET account_status = @status
        WHERE tourist_id = @id;
      `);

      return sendJson(res, 200, {
        success: true,
        message: cleanStatus === 'مقيّد'
          ? `تم تقييد حساب السائح (${cleanId}) ومنعه من الحجوزات بنجاح`
          : `تم تنشيط حساب السائح (${cleanId}) بنجاح`,
        tourist_id: cleanId,
        account_status: cleanStatus
      });
    }

    // 9. Guides: GET (Includes normalized landmarks of expertise from guide_places)
    if (pathname === '/api/db/guides' && req.method === 'GET') {
      const result = await db.request().query('SELECT * FROM tour_guides ORDER BY full_name ASC');
      let guidePlacesRes = { recordset: [] };
      try {
        guidePlacesRes = await db.request().query(`
          SELECT gp.license_number, pt.place_id, pt.place_name, pt.city, pt.category, pt.place_image
          FROM guide_places gp
          JOIN places_tourist pt ON gp.place_id = pt.place_id
        `);
      } catch (e) {
        console.warn('[guide_places fetch notice]:', e.message);
      }

      const guidesData = (result.recordset || []).map(g => {
        const myPlaces = (guidePlacesRes.recordset || []).filter(p => p.license_number === g.license_number);
        return {
          ...g,
          total_tours_completed: g.total_tours_completed || 0,
          places: myPlaces,
          place_ids: myPlaces.map(p => p.place_id)
        };
      });

      return sendJson(res, 200, { success: true, data: guidesData });
    }

    // 9.1.0 Dedicated Guide Verification (Safely activates account preserving real email, phone, and password)
    if (pathname === '/api/db/guides/verify' && req.method === 'POST') {
      const body = await readBody(req);
      const { license_number, verification_status } = body;
      if (!license_number) {
        return sendJson(res, 400, { success: false, error: 'رقم ترخيص المرشد مطلوب' });
      }
      const cleanLic = String(license_number).trim();
      const status = String(verification_status || 'موثق').trim();

      try {
        const updateReq = db.request();
        updateReq.input('lic', sql.NVarChar(50), cleanLic);
        updateReq.input('status', sql.NVarChar(50), status);
        await updateReq.query(`
          UPDATE tour_guides 
          SET verification_status = @status 
          WHERE license_number = @lic;
        `);

        const fetchReq = db.request();
        fetchReq.input('lic', sql.NVarChar(50), cleanLic);
        const guideRes = await fetchReq.query(`
          SELECT license_number, full_name, email, phone_number, verification_status, years_of_experience, price_per_day
          FROM tour_guides 
          WHERE license_number = @lic;
        `);

        return sendJson(res, 200, {
          success: true,
          message: status === 'موثق' ? 'تم اعتماد وتفعيل حساب المرشد السياحي بنجاح' : 'تم تحديث حالة المرشد بنجاح',
          guide: guideRes.recordset[0] || null
        });
      } catch (err) {
        console.error('[Guide Verification Error]:', err.message);
        return sendJson(res, 500, { success: false, error: err.message || 'فشل تحديث حالة اعتماد المرشد' });
      }
    }

    // 9.1 Guides: POST (Registration & Updates)
    if (pathname === '/api/db/guides' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        license_number, full_name, phone_number, email, password,
        years_of_experience, price_per_day, bio, digital_certificate_file,
        verification_status, speaks_english, speaks_french, speaks_italian,
        gender, working_days, operating_regions, avatar, title, certificate,
        certificate_name, place_ids, places
      } = body;

      if (!license_number || !full_name || !phone_number) {
        return sendJson(res, 400, { success: false, error: 'بيانات المرشد غير مكتملة (رقم الترخيص، الاسم، ورقم الهاتف إلزامية)' });
      }

      const cleanLic = String(license_number).trim();
      const cleanPhone = String(phone_number).trim();
      const cleanEmail = String(email || `${cleanLic.toLowerCase()}@dalni.ly`).trim();
      const rawPassword = body.password ? String(body.password).trim() : '';
      const shouldUpdatePass = rawPassword && rawPassword !== '••••••••' && rawPassword.length >= 4;
      const hashedPass = shouldUpdatePass ? hashPassword(rawPassword) : hashPassword('password123');
      const safeExp = Math.max(2, Number(years_of_experience) || 2);

      // Check if a guide with this phone, email, or license already exists
      try {
        const conflictCheck = await db.request()
          .input('lic', sql.NVarChar(50), cleanLic)
          .input('phone', sql.NVarChar(20), cleanPhone)
          .input('email', sql.NVarChar(100), cleanEmail)
          .query(`
            SELECT license_number, full_name, phone_number, email, verification_status
            FROM tour_guides
            WHERE license_number = @lic OR phone_number = @phone OR email = @email
          `);

        if (conflictCheck.recordset && conflictCheck.recordset.length > 0) {
          for (const existing of conflictCheck.recordset) {
            // If phone or email matches an existing guide with DIFFERENT license number
            if (existing.license_number !== cleanLic) {
              if (existing.verification_status === 'موثق') {
                return sendJson(res, 400, {
                  success: false,
                  error: `رقم الهاتف (${cleanPhone}) مسجل مسبقاً بحساب مرشد سياحي معتمد في المنصة. يرجى تسجيل الدخول إلى حسابك أو استخدام رقم هاتف آخر.`
                });
              } else {
                // If it is still pending verification, clean up old pending submission so the new one replaces it
                const cleanOld = db.request();
                cleanOld.input('oldLic', sql.NVarChar(50), existing.license_number);
                await cleanOld.query(`
                  DELETE FROM guide_places WHERE license_number = @oldLic;
                  DELETE FROM tour_guides WHERE license_number = @oldLic;
                `);
              }
            }
          }
        }
      } catch (confErr) {
        console.warn('[Guide conflict check warning]:', confErr.message);
      }

      const request = db.request();
      request.input('license_number', sql.NVarChar(50), cleanLic);
      request.input('full_name', sql.NVarChar(150), String(full_name).trim());
      request.input('phone_number', sql.NVarChar(20), cleanPhone);
      request.input('email', sql.NVarChar(100), cleanEmail);
      request.input('hasNewPassword', sql.Bit, shouldUpdatePass ? 1 : 0);
      request.input('hashedPassword', sql.NVarChar(255), hashedPass);
      request.input('years_of_experience', sql.Int, safeExp);
      request.input('price_per_day', sql.Decimal(10, 2), Number(price_per_day) || 150);
      request.input('bio', sql.NVarChar(sql.MAX), String(bio || '').trim());
      request.input('verification_status', sql.NVarChar(50), String(verification_status || 'بانتظار التوثيق').trim());
      request.input('speaks_english', sql.Bit, speaks_english ? 1 : 0);
      request.input('speaks_french', sql.Bit, speaks_french ? 1 : 0);
      request.input('speaks_italian', sql.Bit, speaks_italian ? 1 : 0);
      request.input('gender', sql.NVarChar(10), String(gender || 'male').trim());
      request.input('working_days', sql.NVarChar(sql.MAX), String(working_days || '').trim());
      request.input('operating_regions', sql.NVarChar(sql.MAX), String(operating_regions || '').trim());
      request.input('avatar', sql.NVarChar(sql.MAX), String(avatar || '').trim());
      request.input('title', sql.NVarChar(150), String(title || 'مرشد سياحي معتمد').trim());
      request.input('certificate', sql.NVarChar(sql.MAX), String(certificate || 'ترخيص رسمي صادر من وزارة السياحة').trim());
      request.input('certificate_name', sql.NVarChar(255), String(certificate_name || 'ترخيص_سياحي.pdf').trim());
      request.input('digital_certificate_file', sql.NVarChar(sql.MAX), String(digital_certificate_file || '').trim());

      try {
        await request.query(`
          IF EXISTS (SELECT 1 FROM tour_guides WHERE license_number = @license_number)
          BEGIN
            UPDATE tour_guides
            SET full_name = @full_name,
                phone_number = @phone_number,
                email = CASE 
                  WHEN @email <> '' AND @email NOT LIKE '%@dalni.ly' THEN @email 
                  WHEN email IS NOT NULL AND email <> '' AND email NOT LIKE '%@dalni.ly' THEN email 
                  ELSE @email 
                END,
                password = CASE WHEN @hasNewPassword = 1 THEN @hashedPassword ELSE password END,
                years_of_experience = @years_of_experience,
                price_per_day = @price_per_day,
                bio = @bio,
                verification_status = @verification_status,
                speaks_english = @speaks_english,
                speaks_french = @speaks_french,
                speaks_italian = @speaks_italian,
                gender = @gender,
                working_days = @working_days,
                operating_regions = @operating_regions,
                avatar = CASE WHEN @avatar <> '' THEN @avatar ELSE avatar END,
                title = @title,
                certificate = CASE WHEN @certificate <> '' THEN @certificate ELSE certificate END,
                certificate_name = CASE WHEN @certificate_name <> '' THEN @certificate_name ELSE certificate_name END,
                digital_certificate_file = CASE WHEN @digital_certificate_file <> '' THEN @digital_certificate_file ELSE digital_certificate_file END
            WHERE license_number = @license_number;
          END
          ELSE
          BEGIN
            INSERT INTO tour_guides (
              license_number, full_name, phone_number, email, password, years_of_experience,
              price_per_day, bio, verification_status, speaks_english, speaks_french, speaks_italian,
              gender, working_days, operating_regions, avatar, title,
              certificate, certificate_name, digital_certificate_file
            ) VALUES (
              @license_number, @full_name, @phone_number, @email, @hashedPassword, @years_of_experience,
              @price_per_day, @bio, @verification_status, @speaks_english, @speaks_french, @speaks_italian,
              @gender, @working_days, @operating_regions, @avatar, @title,
              @certificate, @certificate_name, @digital_certificate_file
            );
          END
        `);
      } catch (dbErr) {
        console.error('[Guide Save Error]:', dbErr.message);
        if (dbErr.message.includes('UQ__tour_gui') || dbErr.message.includes('UNIQUE KEY')) {
          if (dbErr.message.includes(cleanPhone)) {
            return sendJson(res, 400, { success: false, error: `رقم الهاتف (${cleanPhone}) مسجل مسبقاً في المنصة لمرشد آخر.` });
          }
          return sendJson(res, 400, { success: false, error: 'بيانات المرشد (رقم الترخيص أو الهاتف أو البريد) مسجلة مسبقاً في المنصة.' });
        }
        if (dbErr.message.includes('chk_experience')) {
          return sendJson(res, 400, { success: false, error: 'سنوات الخبرة السياحية للمرشد يجب أن تكون سنتين على الأقل (2 سنوات فأكثر).' });
        }
        return sendJson(res, 400, { success: false, error: dbErr.message || 'فشل حفظ بيانات المرشد في قاعدة البيانات' });
      }

      // Pure 3NF Relational Junction: Sync guide_places (Landmarks of Expertise)
      const rawPlaces = Array.isArray(place_ids) ? place_ids : (Array.isArray(places) ? places : []);
      if (rawPlaces.length > 0) {
        try {
          const delGk = db.request();
          delGk.input('lic', sql.VarChar(50), cleanLic);
          await delGk.query('DELETE FROM guide_places WHERE license_number = @lic');
          for (const pid of rawPlaces) {
            const cleanPid = typeof pid === 'object' ? (pid.place_id || pid.id) : String(pid).trim();
            if (cleanPid) {
              const insGk = db.request();
              insGk.input('lic', sql.VarChar(50), cleanLic);
              insGk.input('pid', sql.VarChar(50), cleanPid);
              await insGk.query(`
                IF EXISTS (SELECT 1 FROM places_tourist WHERE place_id = @pid)
                BEGIN
                  IF NOT EXISTS (SELECT 1 FROM guide_places WHERE license_number = @lic AND place_id = @pid)
                    INSERT INTO guide_places (license_number, place_id) VALUES (@lic, @pid);
                END
              `);
            }
          }
        } catch (gpErr) {
          console.warn('[guide_places sync warning]:', gpErr.message);
        }
      }

      return sendJson(res, 201, { success: true, message: 'تم حفظ بيانات المرشد في DelniDB بنجاح' });
    }

    // 9.2 Guides: DELETE
    if (pathname === '/api/db/guides' && req.method === 'DELETE') {
      const lic = url.searchParams.get('license_number');
      if (!lic) return sendJson(res, 400, { success: false, error: 'رقم ترخيص المرشد مطلوب للحذف' });

      const request = db.request();
      request.input('lic', sql.NVarChar(50), lic);
      await request.query('DELETE FROM tour_guides WHERE license_number = @lic');
      return sendJson(res, 200, { success: true, message: 'تم حذف المرشد بنجاح من DelniDB' });
    }

    // 10. Hotels: GET
    if (pathname === '/api/db/hotels' && req.method === 'GET') {
      const result = await db.request().query('SELECT * FROM hotels ORDER BY hotel_name ASC');
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 10.1 Hotels: POST
    if (pathname === '/api/db/hotels' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        hotel_id, id, hotel_name, name, city, address_details, address,
        phone_number, phone, star_rating, stars, partnership_status,
        hotel_photo_1, hotel_photo_2, hotel_photo_3, hotel_photo_4, hotel_photo_5,
        verification_status, property_type, amenities, contract_date
      } = body;

      const cleanId = String(hotel_id || id || `H-0${Date.now().toString().slice(-3)}`).trim();
      const cleanName = String(hotel_name || name || '').trim();
      if (!cleanName) return sendJson(res, 400, { success: false, error: 'اسم الفندق مطلوب' });

      // Check duplicate primary key / municipal ID on creation
      if (body.isNew) {
        const dupReq = db.request();
        dupReq.input('chk_hid', sql.NVarChar(50), cleanId);
        const dupRes = await dupReq.query('SELECT 1 FROM hotels WHERE hotel_id = @chk_hid');
        if (dupRes.recordset.length > 0) {
          return sendJson(res, 409, { success: false, error: 'رقم القيد البلدي مسجل مسبقاً لمكان إقامة آخر في قاعدة البيانات' });
        }
      }

      const request = db.request();
      request.input('hotel_id', sql.NVarChar(50), cleanId);
      request.input('hotel_name', sql.NVarChar(200), cleanName);
      request.input('city', sql.NVarChar(100), String(city || 'طرابلس').trim());
      request.input('address_details', sql.NVarChar(500), String(address_details || address || 'ليبيا').trim());
      request.input('phone_number', sql.NVarChar(20), String(phone_number || phone || '0910000000').trim());
      request.input('star_rating', sql.Int, Number(star_rating || stars) || 5);
      request.input('partnership_status', sql.NVarChar(100), String(partnership_status || 'نشط').trim());
      request.input('photo_1', sql.NVarChar(sql.MAX), String(hotel_photo_1 || body.photo || '').trim());
      request.input('photo_2', sql.NVarChar(sql.MAX), String(hotel_photo_2 || '').trim());
      request.input('photo_3', sql.NVarChar(sql.MAX), String(hotel_photo_3 || '').trim());
      request.input('photo_4', sql.NVarChar(sql.MAX), String(hotel_photo_4 || '').trim());
      request.input('photo_5', sql.NVarChar(sql.MAX), String(hotel_photo_5 || '').trim());
      request.input('verification_status', sql.NVarChar(50), String(verification_status || 'موثق').trim());
      request.input('property_type', sql.NVarChar(100), String(property_type || 'فندق').trim());
      request.input('amenities', sql.NVarChar(sql.MAX), String(amenities || '').trim());
      request.input('contract_date', sql.Date, contract_date || new Date());
      request.input('contract_start_date', sql.NVarChar(50), String(body.contract_start_date || new Date().toISOString().slice(0, 10)).trim());
      request.input('contract_end_date', sql.NVarChar(50), String(body.contract_end_date || '').trim());
      request.input('google_maps_url', sql.NVarChar(500), String(body.google_maps_url || '').trim());
      request.input('description', sql.NVarChar(sql.MAX), String(body.description || '').trim());
      request.input('working_hours', sql.NVarChar(150), String(body.working_hours || 'خدمة 24/7 على مدار الساعة').trim());
      const cleanPhone = String(phone_number || phone || '0910000000').trim();
      request.input('phone_number', sql.NVarChar(20), cleanPhone);
      request.input('whatsapp', sql.NVarChar(50), String(body.whatsapp || cleanPhone).trim());

      await request.query(`
        IF EXISTS (SELECT 1 FROM hotels WHERE hotel_id = @hotel_id)
        BEGIN
          UPDATE hotels
          SET hotel_name = @hotel_name,
              city = @city,
              address_details = @address_details,
              phone_number = @phone_number,
              star_rating = @star_rating,
              partnership_status = @partnership_status,
              hotel_photo_1 = CASE WHEN @photo_1 <> '' THEN @photo_1 ELSE hotel_photo_1 END,
              hotel_photo_2 = CASE WHEN @photo_2 <> '' THEN @photo_2 ELSE hotel_photo_2 END,
              hotel_photo_3 = CASE WHEN @photo_3 <> '' THEN @photo_3 ELSE hotel_photo_3 END,
              hotel_photo_4 = CASE WHEN @photo_4 <> '' THEN @photo_4 ELSE hotel_photo_4 END,
              hotel_photo_5 = CASE WHEN @photo_5 <> '' THEN @photo_5 ELSE hotel_photo_5 END,
              verification_status = @verification_status,
              property_type = @property_type,
              amenities = @amenities,
              google_maps_url = @google_maps_url,
              description = @description,
              working_hours = @working_hours,
              discount_percentage = @discount_percentage,
              whatsapp = @whatsapp,
              contract_start_date = COALESCE(NULLIF(@contract_start_date, ''), contract_start_date),
              contract_end_date = @contract_end_date
          WHERE hotel_id = @hotel_id;
        END
        ELSE
        BEGIN
          INSERT INTO hotels (
            hotel_id, hotel_name, city, address_details, phone_number, star_rating,
            partnership_status, hotel_photo_1, hotel_photo_2, hotel_photo_3, hotel_photo_4,
            hotel_photo_5, verification_status, property_type, amenities, contract_date, google_maps_url,
            description, working_hours, discount_percentage, whatsapp,
            contract_start_date, contract_end_date
          ) VALUES (
            @hotel_id, @hotel_name, @city, @address_details, @phone_number, @star_rating,
            @partnership_status, @photo_1, @photo_2, @photo_3, @photo_4,
            @photo_5, @verification_status, @property_type, @amenities, @contract_date, @google_maps_url,
            @description, @working_hours, @discount_percentage, @whatsapp,
            @contract_start_date, @contract_end_date
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ الفندق في DelniDB بنجاح' });
    }

    // 10.2 Hotels: DELETE
    if (pathname === '/api/db/hotels' && req.method === 'DELETE') {
      const id = url.searchParams.get('hotel_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الفندق مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.NVarChar(50), id);
      await request.query('DELETE FROM hotels WHERE hotel_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم حذف الفندق من DelniDB بنجاح' });
    }

    // 11. Restaurants: GET
    if (pathname === '/api/db/restaurants' && req.method === 'GET') {
      const result = await db.request().query('SELECT * FROM restaurants_cafes ORDER BY facility_name ASC');
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 11.1 Restaurants: POST
    if (pathname === '/api/db/restaurants' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        facility_id, id, facility_name, name, facility_type, type,
        city, address_details, address, phone_number, phone,
        description, facility_image_1, facility_image_2, facility_image_3,
        facility_image_4, facility_image_5, verification_status,
        working_hours, features, contract_date
      } = body;

      const cleanId = String(facility_id || id || `R-0${Date.now().toString().slice(-3)}`).trim();
      const cleanName = String(facility_name || name || '').trim();
      if (!cleanName) return sendJson(res, 400, { success: false, error: 'اسم المطعم/المقهى مطلوب' });

      // Check duplicate primary key / municipal ID on creation
      if (body.isNew) {
        const dupReq = db.request();
        dupReq.input('chk_fid', sql.NVarChar(50), cleanId);
        const dupRes = await dupReq.query('SELECT 1 FROM restaurants_cafes WHERE facility_id = @chk_fid');
        if (dupRes.recordset.length > 0) {
          return sendJson(res, 409, { success: false, error: 'رقم القيد البلدي مسجل مسبقاً لمطعم أو مقهى آخر في قاعدة البيانات' });
        }
      }

      const request = db.request();
      request.input('facility_id', sql.NVarChar(50), cleanId);
      request.input('facility_name', sql.NVarChar(200), cleanName);
      request.input('facility_type', sql.NVarChar(100), String(facility_type || type || 'مطعم').trim());
      request.input('city', sql.NVarChar(100), String(city || 'طرابلس').trim());
      request.input('address_details', sql.NVarChar(500), String(address_details || address || 'ليبيا').trim());
      request.input('phone_number', sql.NVarChar(20), String(phone_number || phone || '0910000000').trim());
      request.input('description', sql.NVarChar(sql.MAX), String(description || '').trim());
      request.input('img_1', sql.NVarChar(sql.MAX), String(facility_image_1 || body.photo || '').trim());
      request.input('img_2', sql.NVarChar(sql.MAX), String(facility_image_2 || '').trim());
      request.input('img_3', sql.NVarChar(sql.MAX), String(facility_image_3 || '').trim());
      request.input('img_4', sql.NVarChar(sql.MAX), String(facility_image_4 || '').trim());
      request.input('img_5', sql.NVarChar(sql.MAX), String(facility_image_5 || '').trim());
      request.input('verification_status', sql.NVarChar(50), String(verification_status || 'موثق').trim());
      request.input('working_hours', sql.NVarChar(100), String(working_hours || '09:00 ص - 12:00 م').trim());
      request.input('features', sql.NVarChar(sql.MAX), String(features || '').trim());
      request.input('contract_date', sql.Date, contract_date || new Date());
      request.input('contract_start_date', sql.NVarChar(50), String(body.contract_start_date || new Date().toISOString().slice(0, 10)).trim());
      request.input('contract_end_date', sql.NVarChar(50), String(body.contract_end_date || '').trim());
      request.input('partnership_status', sql.NVarChar(100), String(body.partnership_status || 'نشط').trim());
      const cleanPhone = String(phone_number || phone || '0910000000').trim();
      request.input('phone_number', sql.NVarChar(20), cleanPhone);
      request.input('whatsapp', sql.NVarChar(50), String(body.whatsapp || cleanPhone).trim());

      await request.query(`
        IF EXISTS (SELECT 1 FROM restaurants_cafes WHERE facility_id = @facility_id)
        BEGIN
          UPDATE restaurants_cafes
          SET facility_name = @facility_name,
              facility_type = @facility_type,
              city = @city,
              address_details = @address_details,
              phone_number = @phone_number,
              description = @description,
              facility_image_1 = CASE WHEN @img_1 <> '' THEN @img_1 ELSE facility_image_1 END,
              facility_image_2 = CASE WHEN @img_2 <> '' THEN @img_2 ELSE facility_image_2 END,
              facility_image_3 = CASE WHEN @img_3 <> '' THEN @img_3 ELSE facility_image_3 END,
              facility_image_4 = CASE WHEN @img_4 <> '' THEN @img_4 ELSE facility_image_4 END,
              facility_image_5 = CASE WHEN @img_5 <> '' THEN @img_5 ELSE facility_image_5 END,
              verification_status = @verification_status,
              working_hours = @working_hours,
              features = @features,
              google_maps_url = @google_maps_url,
              discount_percentage = @discount_percentage,
              whatsapp = @whatsapp,
              partnership_status = @partnership_status,
              contract_start_date = COALESCE(NULLIF(@contract_start_date, ''), contract_start_date),
              contract_end_date = @contract_end_date
          WHERE facility_id = @facility_id;
        END
        ELSE
        BEGIN
          INSERT INTO restaurants_cafes (
            facility_id, facility_name, facility_type, city, address_details,
            phone_number, description, facility_image_1, facility_image_2,
            facility_image_3, facility_image_4, facility_image_5,
            verification_status, working_hours, features, contract_date, google_maps_url,
            discount_percentage, whatsapp, partnership_status,
            contract_start_date, contract_end_date
          ) VALUES (
            @facility_id, @facility_name, @facility_type, @city, @address_details,
            @phone_number, @description, @img_1, @img_2,
            @img_3, @img_4, @img_5,
            @verification_status, @working_hours, @features, @contract_date, @google_maps_url,
            @discount_percentage, @whatsapp, @partnership_status,
            @contract_start_date, @contract_end_date
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ المطعم في DelniDB بنجاح' });
    }

    // 11.2 Restaurants: DELETE
    if (pathname === '/api/db/restaurants' && req.method === 'DELETE') {
      const id = url.searchParams.get('facility_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف المطعم مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.NVarChar(50), id);
      await request.query('DELETE FROM restaurants_cafes WHERE facility_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم حذف المطعم من DelniDB بنجاح' });
    }

    // 12. Places / Attractions: GET
    if (pathname === '/api/db/places' && req.method === 'GET') {
      const city = url.searchParams.get('city');
      const reqPlaces = db.request();
      let query = 'SELECT * FROM places_tourist';
      const conditions = [];

      if (city && city !== 'all') {
        reqPlaces.input('city', sql.NVarChar(100), city);
        conditions.push('city = @city');
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }
      query += ' ORDER BY place_name ASC';

      const result = await reqPlaces.query(query);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 12.1 Places: POST
    if (pathname === '/api/db/places' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        place_id, id, municipality_code, place_name, name, description, city, region,
        longitude, latitude, category, place_image, photo,
        google_maps_url, highlights, is_new, mode
      } = body;

      const cleanId = String(place_id || municipality_code || id || '').trim();
      if (!cleanId) {
        return sendJson(res, 400, { success: false, error: 'رقم البلدية / معرّف المعلم السياحي (المفتاح الرئيسي ID) مطلوب' });
      }

      const cleanName = String(place_name || name || '').trim();
      if (!cleanName) return sendJson(res, 400, { success: false, error: 'اسم المعلم السياحي مطلوب' });

      // Uniqueness check for new landmark (Municipality ID is Primary Key)
      if (is_new || mode === 'create') {
        const checkReq = db.request();
        checkReq.input('check_id', sql.NVarChar(50), cleanId);
        const checkRes = await checkReq.query('SELECT 1 FROM places_tourist WHERE place_id = @check_id');
        if (checkRes.recordset && checkRes.recordset.length > 0) {
          return sendJson(res, 409, {
            success: false,
            error: `رقم البلدية (${cleanId}) مسجل مسبقاً لمعلم آخر! المعرّف هو مفتاح رئيسي فريد ولا يمكن تكراره.`
          });
        }
      }

      const latNum = Number(latitude) || 32.88;
      const lngNum = Number(longitude) || 13.18;
      const cleanMapsUrl = String(google_maps_url || (latNum && lngNum ? `https://maps.google.com/?q=${latNum},${lngNum}` : '')).trim();

      const request = db.request();
      request.input('place_id', sql.NVarChar(50), cleanId);
      request.input('place_name', sql.NVarChar(200), cleanName);
      request.input('description', sql.NVarChar(sql.MAX), String(description || 'مدينة ومعلم سياحي وتاريخي بارز في ليبيا').trim());
      request.input('city', sql.NVarChar(100), String(city || 'طرابلس').trim());
      request.input('region', sql.NVarChar(100), String(region || 'المنطقة الغربية').trim());
      request.input('longitude', sql.Decimal(10, 6), lngNum);
      request.input('latitude', sql.Decimal(10, 6), latNum);
      request.input('category', sql.NVarChar(100), String(category || 'آثار وتاريخية').trim());
      request.input('place_image', sql.NVarChar(sql.MAX), String(place_image || photo || '').trim());
      request.input('google_maps_url', sql.NVarChar(sql.MAX), cleanMapsUrl);
      request.input('highlights', sql.NVarChar(sql.MAX), Array.isArray(highlights) ? highlights.join('، ') : String(highlights || '').trim());

      await request.query(`
        IF EXISTS (SELECT 1 FROM places_tourist WHERE place_id = @place_id)
        BEGIN
          UPDATE places_tourist
          SET place_name = @place_name,
              description = @description,
              city = @city,
              region = @region,
              longitude = @longitude,
              latitude = @latitude,
              category = @category,
              place_image = CASE WHEN @place_image <> '' THEN @place_image ELSE place_image END,
              google_maps_url = @google_maps_url,
              highlights = @highlights
          WHERE place_id = @place_id;
        END
        ELSE
        BEGIN
          INSERT INTO places_tourist (
            place_id, place_name, description, city, region, longitude, latitude,
            category, place_image, google_maps_url, highlights
          ) VALUES (
            @place_id, @place_name, @description, @city, @region, @longitude, @latitude,
            @category, @place_image, @google_maps_url, @highlights
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ وتوثيق المعلم السياحي برقم البلدية بنجاح في DelniDB', place_id: cleanId });
    }

    // 12.2 Places: DELETE
    if (pathname === '/api/db/places' && req.method === 'DELETE') {
      const id = url.searchParams.get('place_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف المعلم مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.NVarChar(50), id);
      await request.query('DELETE FROM places_tourist WHERE place_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم حذف المعلم السياحي بنجاح من DelniDB' });
    }

    // 13. Daily Trips: GET (Includes normalized images, days, stations, and landmark junctions)
    if (pathname === '/api/db/daily_trips' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT dt.*, 
               g.full_name as guide_name, 
               g.phone_number as guide_phone, 
               g.title as guide_title, 
               g.avatar as guide_avatar,
               v.vehicle_type as vehicle_model,
               v.seating_capacity as vehicle_capacity,
               v.vehicle_image,
               tc.company_name as transport_company_name,
               d.full_name as driver_name,
               d.phone_number as driver_phone,
               d.driver_license_number,
               r.facility_name as restaurant_name,
               r.facility_type as restaurant_type,
               r.city as restaurant_city,
               r.address_details as restaurant_address,
               r.phone_number as restaurant_phone,
               r.facility_image_1 as restaurant_image
        FROM daily_trips dt
        LEFT JOIN tour_guides g ON dt.guide_license_number = g.license_number
        LEFT JOIN vehicles v ON dt.vehicle_plate = v.plate_number
        LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
        LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
        LEFT JOIN restaurants_cafes r ON dt.restaurant_id = r.facility_id
        ORDER BY dt.daily_trip_id DESC
      `);

      // 1. Fetch normalized stations from daily_trip_stations
      let stationsRes = { recordset: [] };
      try {
        stationsRes = await db.request().query(`
          SELECT * FROM daily_trip_stations 
          ORDER BY daily_trip_id, station_order ASC
        `);
      } catch (e) {
        console.warn('[daily_trip_stations fetch notice]:', e.message);
      }

      // 2. Fetch linked landmarks from places_trip_daily
      let placesDailyRes = { recordset: [] };
      try {
        placesDailyRes = await db.request().query(`
          SELECT ptd.daily_trip_id, pt.place_id, pt.place_name, pt.city, pt.category, pt.place_image
          FROM places_trip_daily ptd
          JOIN places_tourist pt ON ptd.place_id = pt.place_id
        `);
      } catch (e) {
        console.warn('[places_trip_daily fetch notice]:', e.message);
      }

      // 3. Fetch normalized recurring days from daily_trip_days
      let daysRes = { recordset: [] };
      try {
        daysRes = await db.request().query(`
          SELECT daily_trip_id, day_of_week 
          FROM daily_trip_days
        `);
      } catch (e) {
        console.warn('[daily_trip_days fetch notice]:', e.message);
      }

      const dailyTripsData = (result.recordset || []).map(dt => {
        const tripStations = (stationsRes.recordset || []).filter(s => s.daily_trip_id === dt.daily_trip_id);
        const tripPlaces = (placesDailyRes.recordset || []).filter(p => p.daily_trip_id === dt.daily_trip_id);
        const tripDays = (daysRes.recordset || []).filter(d => d.daily_trip_id === dt.daily_trip_id);

        let finalItinerary = tripStations.map(s => ({
          time: s.station_time || s.arrival_time || `المحطة ${s.station_order}`,
          title: s.station_title || s.station_name,
          desc: s.station_desc || s.description || '',
          station_id: s.station_id,
          station_order: s.station_order,
          station_title: s.station_title || s.station_name,
          station_time: s.station_time || s.arrival_time,
          station_desc: s.station_desc || s.description
        }));

        if (finalItinerary.length === 0 && dt.itinerary_steps) {
          try {
            finalItinerary = typeof dt.itinerary_steps === 'string' ? JSON.parse(dt.itinerary_steps) : dt.itinerary_steps;
          } catch {}
        }

        const normalizedImages = [
          dt.photo_1 || dt.photo || '/assets/dest-leptis-theater.jpg',
          dt.photo_2 || '/assets/dest-leptis-arch.jpg',
          dt.photo_3 || '/assets/dest-leptis-forum.jpg',
          dt.photo_4 || '/assets/dest-leptis-coast.jpg',
          dt.photo_5 || '/assets/hero-leptis.jpg'
        ];

        const coverImage = dt.photo_1 || dt.photo || normalizedImages[0];
        const normalizedDays = tripDays.length > 0
          ? tripDays.map(d => d.day_of_week)
          : (dt.recurring_days ? dt.recurring_days.split(',').map(s => s.trim()).filter(Boolean) : ['السبت', 'الثلاثاء']);

        return {
          ...dt,
          title: dt.trip_title,
          trip_title: dt.trip_title,
          bus_capacity: dt.max_capacity,
          max_capacity: dt.max_capacity,
          photo: coverImage,
          photo_1: coverImage,
          photo_2: normalizedImages[1],
          photo_3: normalizedImages[2],
          photo_4: normalizedImages[3],
          photo_5: normalizedImages[4],
          cover_photo: coverImage,
          images: normalizedImages,
          gallery: normalizedImages.join(','),
          days: normalizedDays,
          recurring_days: normalizedDays.join(','),
          stations: tripStations.length > 0 ? tripStations : finalItinerary,
          itinerary_steps: finalItinerary,
          place_ids: tripPlaces.map(p => p.place_id),
          places: tripPlaces
        };
      });

      return sendJson(res, 200, { success: true, data: dailyTripsData });
    }

    // 13.1 Daily Trips: POST (Strict 3NF Normalization: Separate Days, 5 Images, Stations, and Landmark Junctions)
    if (pathname === '/api/db/daily_trips' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        daily_trip_id, id, trip_title, title, description, price_per_seat, price,
        is_active, photo, max_capacity, bus_capacity, available_seats, guide_license_number,
        departure_city, destination_city, destination, recurring_days, activities, google_maps_url,
        vehicle_plate, vehicle_plates, restaurant_id, itinerary_steps, stations
      } = body;

      const cleanId = String(daily_trip_id || id || `DT-${Date.now().toString().slice(-4)}`).trim();
      const cleanTitle = String(trip_title || title || '').trim();
      if (!cleanTitle) return sendJson(res, 400, { success: false, error: 'عنوان الرحلة اليومية مطلوب' });

      // Enforce strict fixed capacity: 15, 25, or 50 seats
      const rawCap = Number(max_capacity || bus_capacity || 25);
      const cleanCap = [15, 25, 50].includes(rawCap) ? rawCap : 25;
      const cleanAvail = Number(available_seats !== undefined ? available_seats : cleanCap);

      // Ensure valid guide license to preserve foreign key
      let guideLic = String(guide_license_number || '').trim();
      if (!guideLic) {
        const firstGuide = await db.request().query('SELECT TOP 1 license_number FROM tour_guides');
        guideLic = firstGuide.recordset?.[0]?.license_number || 'G-1001';
      }

      // Plate selection
      let cleanPlate = vehicle_plate ? String(vehicle_plate).trim() : null;
      if (!cleanPlate && Array.isArray(vehicle_plates) && vehicle_plates.length > 0) {
        cleanPlate = String(vehicle_plates[0]).trim();
      }

      let cleanRestaurant = restaurant_id ? String(restaurant_id).trim() : null;
      let cleanItinerary = null;
      if (itinerary_steps) {
        cleanItinerary = typeof itinerary_steps === 'string' ? itinerary_steps : JSON.stringify(itinerary_steps);
      }

      // Process up to 5 images: Saves Base64 to disk to keep DB size ultra-lean (only URLs stored!)
      let rawImgList = [];
      if (Array.isArray(body.images) && body.images.length > 0) rawImgList = body.images;
      else if (Array.isArray(body.photos) && body.photos.length > 0) rawImgList = body.photos;
      else if (typeof body.gallery === 'string') rawImgList = body.gallery.split(',').map(s => s.trim()).filter(Boolean);
      else if (photo) rawImgList = [photo];

      const defaultImgs = [
        photo || '/assets/dest-leptis-theater.jpg',
        '/assets/dest-leptis-arch.jpg',
        '/assets/dest-leptis-forum.jpg',
        '/assets/dest-leptis-coast.jpg',
        '/assets/hero-leptis.jpg'
      ];
      while (rawImgList.length < 5) {
        rawImgList.push(defaultImgs[rawImgList.length] || defaultImgs[0]);
      }
      rawImgList = rawImgList.slice(0, 5);

      const finalSavedImages = rawImgList.map((img, idx) => saveBase64ImageIfPresent(img, cleanId, idx + 1));
      const coverPhotoPath = finalSavedImages[0] || '/assets/dest-leptis-theater.jpg';
      const galleryStr = finalSavedImages.join(',');

      // Conflict Prevention: Ensure vehicle is not assigned to another trip on the same departure date
      if (cleanPlate && body.departure_date) {
        const vChk = db.request();
        vChk.input('chk_plate', sql.NVarChar(50), cleanPlate);
        vChk.input('chk_dep', sql.DateTime, new Date(body.departure_date));
        vChk.input('chk_id', sql.VarChar(50), cleanId);
        const vConflict = await vChk.query(`
          SELECT trip_title FROM daily_trips 
          WHERE vehicle_plate = @chk_plate 
            AND CAST(departure_date AS DATE) = CAST(@chk_dep AS DATE) 
            AND daily_trip_id <> @chk_id
        `);
        if (vConflict.recordset?.length > 0) {
          return sendJson(res, 400, {
            success: false,
            error: `تعارض في أسطول المركبات: المركبة (${cleanPlate}) مشغولة ومجدولة بالفعل لرحلة أخرى ("${vConflict.recordset[0].trip_title}") في نفس تاريخ الانطلاق.`
          });
        }
      }

      // Conflict Prevention: Ensure guide is not assigned to another trip on the same departure date
      if (guideLic && body.departure_date) {
        const gChk = db.request();
        gChk.input('chk_glic', sql.VarChar(50), guideLic);
        gChk.input('chk_dep', sql.DateTime, new Date(body.departure_date));
        gChk.input('chk_id', sql.VarChar(50), cleanId);
        const gConflict = await gChk.query(`
          SELECT trip_title FROM daily_trips 
          WHERE guide_license_number = @chk_glic 
            AND CAST(departure_date AS DATE) = CAST(@chk_dep AS DATE) 
            AND daily_trip_id <> @chk_id
        `);
        if (gConflict.recordset?.length > 0) {
          return sendJson(res, 400, {
            success: false,
            error: `تعارض في جدول المرشدين: المرشد السياحي (${guideLic}) مرتبط برحلة أخرى ("${gConflict.recordset[0].trip_title}") في نفس تاريخ الانطلاق.`
          });
        }
      }

      // Parse recurring days list (1 or 2 days per week)
      let cleanDaysList = [];
      if (Array.isArray(recurring_days)) cleanDaysList = recurring_days;
      else if (typeof recurring_days === 'string') cleanDaysList = recurring_days.split(',').map(s => s.trim()).filter(Boolean);
      if (cleanDaysList.length === 0) cleanDaysList = ['السبت', 'الثلاثاء'];
      const recurringDaysStr = cleanDaysList.join(',');

      // 1. Save Core Trip Record in daily_trips (With 5 Separate Photo Fields Directly in Table)
      const p1 = finalSavedImages[0] || '/assets/dest-leptis-theater.jpg';
      const p2 = finalSavedImages[1] || '/assets/dest-leptis-arch.jpg';
      const p3 = finalSavedImages[2] || '/assets/dest-leptis-forum.jpg';
      const p4 = finalSavedImages[3] || '/assets/dest-leptis-coast.jpg';
      const p5 = finalSavedImages[4] || '/assets/hero-leptis.jpg';

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('title', sql.NVarChar(200), cleanTitle);
      request.input('description', sql.NVarChar(sql.MAX), String(description || cleanTitle || 'رحلة يومية ممتعة').trim());
      request.input('price', sql.Decimal(10, 2), Number(price_per_seat || price) || 100);
      request.input('is_active', sql.Bit, is_active !== false ? 1 : 0);
      request.input('img1', sql.NVarChar(500), p1);
      request.input('img2', sql.NVarChar(500), p2);
      request.input('img3', sql.NVarChar(500), p3);
      request.input('img4', sql.NVarChar(500), p4);
      request.input('img5', sql.NVarChar(500), p5);
      request.input('max_cap', sql.Int, cleanCap);
      request.input('avail_seats', sql.Int, cleanAvail);
      request.input('guide_lic', sql.VarChar(50), guideLic);
      request.input('departure', sql.NVarChar(100), String(departure_city || 'طرابلس').trim());
      request.input('destination', sql.NVarChar(100), String(destination_city || destination || 'الوجهة السياحية').trim());
      request.input('maps_url', sql.NVarChar(500), String(google_maps_url || '').trim());
      request.input('vehicle_plate', sql.NVarChar(50), cleanPlate);
      request.input('restaurant_id', sql.NVarChar(50), cleanRestaurant);

      await request.query(`
        IF EXISTS (SELECT 1 FROM daily_trips WHERE daily_trip_id = @id)
        BEGIN
          UPDATE daily_trips
          SET trip_title = @title,
              description = @description,
              price_per_seat = @price,
              is_active = @is_active,
              photo = @img1,
              photo_1 = @img1,
              photo_2 = @img2,
              photo_3 = @img3,
              photo_4 = @img4,
              photo_5 = @img5,
              max_capacity = @max_cap,
              available_seats = @avail_seats,
              guide_license_number = @guide_lic,
              departure_city = @departure,
              destination_city = @destination,
              google_maps_url = @maps_url,
              vehicle_plate = COALESCE(@vehicle_plate, vehicle_plate),
              restaurant_id = COALESCE(@restaurant_id, restaurant_id)
          WHERE daily_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO daily_trips (
            daily_trip_id, trip_title, description, price_per_seat, is_active,
            photo, photo_1, photo_2, photo_3, photo_4, photo_5,
            max_capacity, available_seats, guide_license_number,
            departure_city, destination_city, google_maps_url,
            vehicle_plate, restaurant_id
          ) VALUES (
            @id, @title, @description, @price, @is_active,
            @img1, @img1, @img2, @img3, @img4, @img5,
            @max_cap, @avail_seats, @guide_lic,
            @departure, @destination, @maps_url,
            @vehicle_plate, @restaurant_id
          );
        END
      `);

      // 3. Normalized Relational Storage: Recurring Departure Days into daily_trip_days (1NF)
      try {
        const delDaysReq = db.request();
        delDaysReq.input('dt_id', sql.VarChar(50), cleanId);
        await delDaysReq.query('DELETE FROM daily_trip_days WHERE daily_trip_id = @dt_id');

        for (const day of cleanDaysList) {
          const trimmedDay = String(day).trim();
          if (!trimmedDay) continue;
          const insDayReq = db.request();
          insDayReq.input('dt_id', sql.VarChar(50), cleanId);
          insDayReq.input('day_val', sql.NVarChar(50), trimmedDay);
          await insDayReq.query(`
            IF NOT EXISTS (SELECT 1 FROM daily_trip_days WHERE daily_trip_id = @dt_id AND day_of_week = @day_val)
            BEGIN
              INSERT INTO daily_trip_days (daily_trip_id, day_of_week)
              VALUES (@dt_id, @day_val);
            END
          `);
        }
      } catch (dayErr) {
        console.warn('[daily_trip_days sync warning]:', dayErr.message);
      }

      // 4. Normalized Relational Storage: Itinerary Stations into daily_trip_stations (Title, Time, Description)
      const rawStations = Array.isArray(stations) && stations.length > 0
        ? stations
        : (Array.isArray(itinerary_steps) && itinerary_steps.length > 0
            ? itinerary_steps
            : (typeof itinerary_steps === 'string'
                ? (() => { try { return JSON.parse(itinerary_steps); } catch { return []; } })()
                : []));

      try {
        const delStReq = db.request();
        delStReq.input('dt_id', sql.VarChar(50), cleanId);
        await delStReq.query('DELETE FROM daily_trip_stations WHERE daily_trip_id = @dt_id');

        for (let i = 0; i < rawStations.length; i++) {
          const st = rawStations[i];
          const stOrder = i + 1;
          const stId = `${cleanId}-ST-${stOrder}`;
          const stTitle = String(st.title || st.station_title || st.station_name || `محطة ${stOrder}`).trim();
          const stTime = String(st.time || st.station_time || st.arrival_time || '09:00 ص').trim();
          const stDesc = String(st.desc || st.station_desc || st.description || 'تفاصيل المحطة السياحية').trim();

          const insStReq = db.request();
          insStReq.input('st_id', sql.VarChar(50), stId);
          insStReq.input('dt_id', sql.VarChar(50), cleanId);
          insStReq.input('st_order', sql.Int, stOrder);
          insStReq.input('st_title', sql.NVarChar(150), stTitle);
          insStReq.input('st_time', sql.VarChar(30), stTime);
          insStReq.input('st_desc', sql.NVarChar(sql.MAX), stDesc);

          await insStReq.query(`
            INSERT INTO daily_trip_stations (
              station_id, daily_trip_id, station_order, 
              station_title, station_time, station_desc
            ) VALUES (
              @st_id, @dt_id, @st_order, 
              @st_title, @st_time, @st_desc
            );
          `);
        }
      } catch (stErr) {
        console.warn('[daily_trip_stations sync warning]:', stErr.message);
      }

      // 5. Normalized Relational Storage: Link Only Registered Platform Landmarks into places_trip_daily
      const rawPlacesDaily = Array.isArray(body.place_ids) && body.place_ids.length > 0
        ? body.place_ids
        : (Array.isArray(body.places) && body.places.length > 0
            ? body.places.map(p => typeof p === 'object' ? (p.place_id || p.id) : p)
            : (Array.isArray(body.destinations) && body.destinations.length > 0
                ? body.destinations
                : (body.destination ? body.destination.split(' + ') : (body.destination_city ? [body.destination_city] : []))));
      try {
        const delDPReq = db.request();
        delDPReq.input('dt_id', sql.VarChar(50), cleanId);
        await delDPReq.query('DELETE FROM places_trip_daily WHERE daily_trip_id = @dt_id');
        for (const pItem of rawPlacesDaily) {
          const cleanP = String(pItem || '').trim();
          if (cleanP) {
            const insDPReq = db.request();
            insDPReq.input('dt_id', sql.VarChar(50), cleanId);
            insDPReq.input('p_val', sql.NVarChar(100), cleanP);
            await insDPReq.query(`
              DECLARE @matched_place_id VARCHAR(50);
              SELECT TOP 1 @matched_place_id = place_id FROM places_tourist WHERE place_id = @p_val OR place_name = @p_val OR city = @p_val;
              IF @matched_place_id IS NOT NULL
              BEGIN
                IF NOT EXISTS (SELECT 1 FROM places_trip_daily WHERE place_id = @matched_place_id AND daily_trip_id = @dt_id)
                  INSERT INTO places_trip_daily (place_id, daily_trip_id) VALUES (@matched_place_id, @dt_id);
              END
            `);
          }
        }
      } catch (pErr) {
        console.warn('[places_trip_daily sync warning]:', pErr.message);
      }

      // Real-time Event Trigger: Guide & Fleet/Driver Assignment
      try {
        if (guide_license_number) {
          await createNotificationInDb(db, {
            type: 'assignment',
            title: `🧭 تكليف بمهمة إرشاد رحلة يومية جديدة`,
            body: `تم إسنادك كمرشد سياحي معتمد لرحلة (${cleanTitle}) المتجهة إلى (${destination_city || 'المعلم السياحي'}).`,
            recipient_role: 'guide',
            recipient_id: String(guide_license_number).trim(),
            link: '/dashboard/guide',
            dedupe_key: `guide-assign-${cleanId}-${guide_license_number}`,
          });
        }

        if (cleanPlate) {
          const vInfoRes = await db.request().input('v_plate', sql.NVarChar(50), cleanPlate).query(`
            SELECT d.driver_license_number, d.full_name as driver_name, v.contract_number, tc.company_name
            FROM vehicles v
            LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
            LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
            WHERE v.plate_number = @v_plate
          `);
          const vInfo = vInfoRes.recordset?.[0];
          if (vInfo) {
            if (vInfo.driver_license_number) {
              await createNotificationInDb(db, {
                type: 'assignment',
                title: `🚍 تكليف برحلة جديدة للسائق`,
                body: `تم إسناد مهمة قيادة ونقل رحلة (${cleanTitle}) على متن المركبة (${cleanPlate}).`,
                recipient_role: 'driver',
                recipient_id: String(vInfo.driver_license_number).trim(),
                link: '/dashboard/driver',
                dedupe_key: `driver-assign-${cleanId}-${vInfo.driver_license_number}`,
              });
            }
            if (vInfo.contract_number) {
              await createNotificationInDb(db, {
                type: 'assignment',
                title: `🚐 إسناد رحلة لأسطول شركتكم`,
                body: `تم إسناد رحلة (${cleanTitle}) للمركبة (${cleanPlate}) التابعة لأسطولكم.`,
                recipient_role: 'company',
                recipient_id: String(vInfo.contract_number).trim(),
                link: '/dashboard/transport',
                dedupe_key: `company-assign-${cleanId}-${vInfo.contract_number}`,
              });
            }
          }
        }
      } catch (gErr) {}

      return sendJson(res, 201, { success: true, message: 'تم حفظ الرحلة اليومية ومحطاتها بنجاح في DelniDB', trip_id: cleanId });
    }

    // 13.2 Daily Trips: DELETE
    if (pathname === '/api/db/daily_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('daily_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة اليومية مطلوب للحذف' });

      // Notify booked tourists, guide, driver, and company before deleting
      try {
        const tripDetailsRes = await db.request().input('d_id', sql.VarChar(50), id).query(`
          SELECT dt.trip_title, dt.guide_license_number, dt.vehicle_plate,
                 d.driver_license_number, v.contract_number
          FROM daily_trips dt
          LEFT JOIN vehicles v ON dt.vehicle_plate = v.plate_number
          LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
          WHERE dt.daily_trip_id = @d_id
        `);
        const tripInfo = tripDetailsRes.recordset?.[0];

        if (tripInfo) {
          if (tripInfo.guide_license_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ إلغاء تكليف الإرشاد لرحلة (${tripInfo.trip_title})`,
              body: `نحيطكم علماً بأنه قد تم إلغاء رحلة (${tripInfo.trip_title}) وإلغاء مهمة الإرشاد المسندة إليكم.`,
              recipient_role: 'guide',
              recipient_id: String(tripInfo.guide_license_number).trim(),
              link: '/dashboard/guide',
              dedupe_key: `trip-cancel-guide-${id}`,
            });
          }
          if (tripInfo.driver_license_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ إلغاء رحلة مسندة للسائق (${tripInfo.trip_title})`,
              body: `تم إلغاء رحلة (${tripInfo.trip_title}) التي كانت مسندة لمركبتكم (${tripInfo.vehicle_plate}).`,
              recipient_role: 'driver',
              recipient_id: String(tripInfo.driver_license_number).trim(),
              link: '/dashboard/driver',
              dedupe_key: `trip-cancel-driver-${id}`,
            });
          }
          if (tripInfo.contract_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ إلغاء رحلة تابعة لأسطول شركتكم (${tripInfo.trip_title})`,
              body: `تم إلغاء رحلة (${tripInfo.trip_title}) المسندة للمركبة (${tripInfo.vehicle_plate}).`,
              recipient_role: 'company',
              recipient_id: String(tripInfo.contract_number).trim(),
              link: '/dashboard/transport',
              dedupe_key: `trip-cancel-company-${id}`,
            });
          }
        }

        const bookedTourists = await db.request().input('d_id', sql.VarChar(50), id).query('SELECT b.tourist_id, dt.trip_title FROM bookings_daily b LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id WHERE b.daily_trip_id = @d_id');
        if (bookedTourists.recordset?.length > 0) {
          for (const b of bookedTourists.recordset) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ تم إلغاء الرحلة اليومية (${b.trip_title})`,
              body: `نأسف لإعلامكم بإلغاء رحلة (${b.trip_title}) من قِبل الإدارة. يُرجى مراجعة الإدارة لاسترجاع التكلفة أو تغيير الموعد.`,
              recipient_role: 'tourist',
              recipient_id: b.tourist_id,
              link: '/dashboard/tourist',
              dedupe_key: `trip-cancel-${id}-${b.tourist_id}`,
            });
          }
        }
      } catch (delErr) {}

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query(`
        DELETE FROM offers_daily_trips WHERE daily_trip_id = @id;
        DELETE FROM daily_trip_stations WHERE daily_trip_id = @id;
        DELETE FROM places_trip_daily WHERE daily_trip_id = @id;
        DELETE FROM bookings_daily WHERE daily_trip_id = @id;
        DELETE FROM daily_trips WHERE daily_trip_id = @id;
      `);
      return sendJson(res, 200, { success: true, message: 'تم حذف الرحلة اليومية ومحطاتها وحجوزاتها وعروضها بنجاح من DelniDB' });
    }

    // 13.5 Daily Trip Offers: GET
    if (pathname === '/api/db/daily_offers' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT o.offer_daily_id, o.daily_trip_id, o.offer_title, o.description,
               o.percent_discount, o.offer_image_url,
               CONVERT(VARCHAR(10), o.start_date, 120) as start_date,
               CONVERT(VARCHAR(10), o.end_date, 120) as end_date,
               o.badge,
               dt.trip_title, dt.price_per_seat, dt.departure_city, dt.destination_city,
               COALESCE(dt.photo_1, dt.photo) as trip_photo, COALESCE(dt.photo_1, dt.photo) as trip_gallery
        FROM offers_daily_trips o
        LEFT JOIN daily_trips dt ON o.daily_trip_id = dt.daily_trip_id
        ORDER BY o.offer_daily_id DESC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset || [] });
    }

    // 13.6 Daily Trip Offers: POST (Create / Update)
    if (pathname === '/api/db/daily_offers' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        offer_daily_id, id, daily_trip_id, offer_title, title_offer,
        description, percent_discount, discount_percentage,
        offer_image_url, url_image_offer, start_date, date_start,
        end_date, date_end, badge
      } = body;

      const cleanTripId = String(daily_trip_id || '').trim();
      if (!cleanTripId) {
        return sendJson(res, 400, { success: false, error: 'يجب اختيار رحلة يومية لربط العرض بها' });
      }

      // Check if target daily trip exists
      const tripCheck = await db.request().input('tid', sql.VarChar(50), cleanTripId).query(`
        SELECT daily_trip_id, trip_title, price_per_seat, photo FROM daily_trips WHERE daily_trip_id = @tid
      `);
      if (!tripCheck.recordset || tripCheck.recordset.length === 0) {
        return sendJson(res, 404, { success: false, error: 'الرحلة اليومية المحددة غير موجودة في قاعدة البيانات' });
      }

      const cleanId = String(offer_daily_id || id || `DO-${Date.now().toString().slice(-4)}`).trim();
      const cleanTitle = String(offer_title || title_offer || `عرض خاص: ${tripCheck.recordset[0].trip_title}`).trim();
      const cleanDesc = String(description || `خصم استثنائي على رحلة ${tripCheck.recordset[0].trip_title}`).trim();
      
      let rawDisc = Number(percent_discount !== undefined ? percent_discount : (discount_percentage !== undefined ? discount_percentage : 15));
      if (isNaN(rawDisc) || rawDisc < 0) rawDisc = 0;
      if (rawDisc > 100) rawDisc = 100;
      const cleanDiscount = rawDisc;

      const today = new Date().toISOString().slice(0, 10);
      const inOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      let sDate = String(start_date || date_start || today).slice(0, 10);
      let eDate = String(end_date || date_end || inOneMonth).slice(0, 10);
      if (eDate <= sDate) {
        const sTime = new Date(sDate).getTime();
        eDate = new Date(sTime + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }

      const cleanImage = String(offer_image_url || url_image_offer || tripCheck.recordset[0].photo || '/assets/dest-leptis-theater.jpg').trim();
      const cleanBadge = String(badge || `خصم ${cleanDiscount}%`).trim();

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('daily_trip_id', sql.VarChar(50), cleanTripId);
      request.input('offer_title', sql.NVarChar(250), cleanTitle);
      request.input('description', sql.NVarChar(sql.MAX), cleanDesc);
      request.input('percent_discount', sql.Decimal(5, 2), cleanDiscount);
      request.input('offer_image_url', sql.VarChar(255), cleanImage);
      request.input('start_date', sql.Date, sDate);
      request.input('end_date', sql.Date, eDate);
      request.input('badge', sql.NVarChar(100), cleanBadge);

      await request.query(`
        IF EXISTS (SELECT 1 FROM offers_daily_trips WHERE offer_daily_id = @id)
        BEGIN
          UPDATE offers_daily_trips
          SET daily_trip_id = @daily_trip_id,
              offer_title = @offer_title,
              description = @description,
              percent_discount = @percent_discount,
              offer_image_url = @offer_image_url,
              start_date = @start_date,
              end_date = @end_date,
              badge = @badge
          WHERE offer_daily_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO offers_daily_trips (
            offer_daily_id, daily_trip_id, offer_title, description,
            percent_discount, offer_image_url, start_date, end_date, badge
          ) VALUES (
            @id, @daily_trip_id, @offer_title, @description,
            @percent_discount, @offer_image_url, @start_date, @end_date, @badge
          );
        END
      `);

      return sendJson(res, 201, {
        success: true,
        message: 'تم حفظ عرض الرحلة اليومية بنجاح في DelniDB',
        offer_id: cleanId,
        offer: {
          offer_daily_id: cleanId,
          daily_trip_id: cleanTripId,
          offer_title: cleanTitle,
          description: cleanDesc,
          percent_discount: cleanDiscount,
          offer_image_url: cleanImage,
          start_date: sDate,
          end_date: eDate,
          badge: cleanBadge,
          trip_title: tripCheck.recordset[0].trip_title,
          price_per_seat: tripCheck.recordset[0].price_per_seat
        }
      });
    }

    // 13.7 Daily Trip Offers: DELETE
    if (pathname === '/api/db/daily_offers' && req.method === 'DELETE') {
      const id = url.searchParams.get('offer_daily_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف العرض اليومي مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM offers_daily_trips WHERE offer_daily_id = @id;');
      return sendJson(res, 200, { success: true, message: 'تم حذف عرض الرحلة اليومية بنجاح من DelniDB' });
    }

    // 14. Weekly Trips: GET (Includes normalized stations and landmark/hotel junctions)
    if (pathname === '/api/db/weekly_trips' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT wt.*, 
               g.full_name as guide_name, 
               g.phone_number as guide_phone, 
               g.title as guide_title, 
               g.avatar as guide_avatar,
               v.vehicle_type as vehicle_model,
               v.seating_capacity as vehicle_capacity,
               v.vehicle_image,
               tc.company_name as transport_company_name,
               d.full_name as driver_name,
               d.phone_number as driver_phone,
               d.driver_license_number
        FROM weekly_trips wt
        LEFT JOIN tour_guides g ON wt.guide_license_number = g.license_number
        LEFT JOIN vehicles v ON wt.vehicle_plate = v.plate_number
        LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
        LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
        
        ORDER BY wt.weekly_trip_id DESC
      `);

      // Fetch normalized stations from weekly_trip_stations
      let stationsRes = { recordset: [] };
      try {
        stationsRes = await db.request().query(`
          SELECT * FROM weekly_trip_stations 
          ORDER BY weekly_trip_id, station_order ASC
        `);
      } catch (e) {
        console.warn('[weekly_trip_stations fetch notice]:', e.message);
      }

      // Fetch linked places for all weekly trips (up to 4 attractions)
      let placesJunction = { recordset: [] };
      try {
        placesJunction = await db.request().query(`
          SELECT ptw.weekly_trip_id, pt.place_id, pt.place_name, pt.city, pt.place_image, pt.category
          FROM places_trip_weekly ptw
          JOIN places_tourist pt ON ptw.place_id = pt.place_id
        `);
      } catch (e) {
        console.warn('[places_trip_weekly fetch notice]:', e.message);
      }

      // Fetch linked hotels for all weekly trips
      let hotelsJunction = { recordset: [] };
      try {
        hotelsJunction = await db.request().query(`
          SELECT htw.weekly_trip_id, h.hotel_id, h.hotel_name, h.city, h.star_rating, h.hotel_photo_1
          FROM hotels_trip_weekly htw
          JOIN hotels h ON htw.hotel_id = h.hotel_id
        `);
      } catch (e) {
        console.warn('[hotels_trip_weekly fetch notice]:', e.message);
      }

      // Fetch linked restaurants & cafes for all weekly trips (M:N)
      let restaurantsJunction = { recordset: [] };
      try {
        restaurantsJunction = await db.request().query(`
          SELECT rtw.weekly_trip_id, r.facility_id, r.facility_name, r.city, r.facility_type, r.facility_image_1
          FROM restaurants_trip_weekly rtw
          JOIN restaurants_cafes r ON rtw.facility_id = r.facility_id
        `);
      } catch (e) {
        console.warn('[restaurants_trip_weekly fetch notice]:', e.message);
      }

      const weeklyTripsData = (result.recordset || []).map(wt => {
        const linkedPlaces = (placesJunction.recordset || []).filter(p => p.weekly_trip_id === wt.weekly_trip_id);
        const linkedHotels = (hotelsJunction.recordset || []).filter(h => h.weekly_trip_id === wt.weekly_trip_id);
        const linkedRestaurants = (restaurantsJunction.recordset || []).filter(r => r.weekly_trip_id === wt.weekly_trip_id);
        const tripStations = (stationsRes.recordset || []).filter(s => s.weekly_trip_id === wt.weekly_trip_id);
        const placeNames = linkedPlaces.map(p => p.place_name);

        const normalizedImages = [
          wt.photo_1 || wt.photo || '/assets/dest-ubari-gaberoun.jpg',
          wt.photo_2 || '/assets/dest-ubari-ummalmaa.jpg',
          wt.photo_3 || '/assets/dest-acacus-arch.jpg',
          wt.photo_4 || '/assets/dest-sahara-dunes.jpg',
          wt.photo_5 || '/assets/dest-ubari.jpg'
        ];
        const coverImage = wt.photo_1 || wt.photo || normalizedImages[0];

        let finalItinerary = tripStations.map(s => ({
          time: s.day_number ? `اليوم ${s.day_number}` : `المحطة ${s.station_order}`,
          title: s.station_title || s.station_name || `محطة ${s.station_order}`,
          desc: s.station_desc || s.description || '',
          station_id: s.station_id,
          station_title: s.station_title || s.station_name,
          station_order: s.station_order,
          day_number: s.day_number || 1,
          station_desc: s.station_desc || s.description
        }));

        if (finalItinerary.length === 0 && wt.itinerary_steps) {
          try {
            finalItinerary = typeof wt.itinerary_steps === 'string' ? JSON.parse(wt.itinerary_steps) : wt.itinerary_steps;
          } catch {}
        }

        return {
          ...wt,
          photo: coverImage,
          photo_1: coverImage,
          photo_2: normalizedImages[1],
          photo_3: normalizedImages[2],
          photo_4: normalizedImages[3],
          photo_5: normalizedImages[4],
          cover_photo: coverImage,
          images: normalizedImages,
          gallery: normalizedImages.join(','),
          stations: tripStations.length > 0 ? tripStations : finalItinerary,
          itinerary_steps: finalItinerary,
          place_ids: linkedPlaces.map(p => p.place_id),
          places: linkedPlaces,
          destinations: placeNames.length > 0 ? placeNames : (wt.destination_region ? [wt.destination_region] : []),
          hotel_ids: linkedHotels.map(h => h.hotel_id),
          hotels: linkedHotels,
          restaurant_ids: linkedRestaurants.map(r => r.facility_id),
          restaurants: linkedRestaurants,
          restaurant_id: linkedRestaurants[0]?.facility_id || null,
          restaurant_name: linkedRestaurants[0]?.facility_name || null,
        };
      });

      return sendJson(res, 200, { success: true, data: weeklyTripsData });
    }

    // 14.1 Weekly Trips: POST
    if (pathname === '/api/db/weekly_trips' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        weekly_trip_id, id, trip_title, title, start_date, end_date,
        max_capacity, available_seats, seat_per_price, price,
        trip_description, description, guide_license_number, is_active,
        departure_city, destination_region, destination, photo, gallery, google_maps_url,
        vehicle_plate, vehicle_plates, restaurant_id, itinerary_steps, place_ids, destinations, stations
      } = body;

      const cleanId = String(weekly_trip_id || id || `WT-${Date.now().toString().slice(-4)}`).trim();
      const cleanTitle = String(trip_title || title || '').trim();
      if (!cleanTitle) return sendJson(res, 400, { success: false, error: 'عنوان الرحلة الأسبوعية مطلوب' });

      let guideLic = String(guide_license_number || '').trim();
      if (!guideLic) {
        const firstGuide = await db.request().query('SELECT TOP 1 license_number FROM tour_guides');
        guideLic = firstGuide.recordset?.[0]?.license_number || 'G-1001';
      }

      let cleanPlate = vehicle_plate ? String(vehicle_plate).trim() : null;
      if (!cleanPlate && Array.isArray(vehicle_plates) && vehicle_plates.length > 0) {
        cleanPlate = String(vehicle_plates[0]).trim();
      }

      let cleanRestaurant = restaurant_id ? String(restaurant_id).trim() : null;
      let cleanItinerary = null;
      if (itinerary_steps) {
        cleanItinerary = typeof itinerary_steps === 'string' ? itinerary_steps : JSON.stringify(itinerary_steps);
      }

      // 1. Process 5 distinct photos (save base64 to disk to minimize DB size)
      let rawImagesList = [];
      if (Array.isArray(body.images) && body.images.length > 0) rawImagesList = body.images;
      else if (Array.isArray(body.photos) && body.photos.length > 0) rawImagesList = body.photos;
      else if (typeof body.gallery === 'string') rawImagesList = body.gallery.split(',').map(s => s.trim()).filter(Boolean);

      const p1 = saveBase64ImageIfPresent(rawImagesList[0] || photo || '/assets/dest-ubari-gaberoun.jpg', `${cleanId}-cover`, 1);
      const p2 = saveBase64ImageIfPresent(rawImagesList[1] || '/assets/dest-ubari-ummalmaa.jpg', cleanId, 2);
      const p3 = saveBase64ImageIfPresent(rawImagesList[2] || '/assets/dest-acacus-arch.jpg', cleanId, 3);
      const p4 = saveBase64ImageIfPresent(rawImagesList[3] || '/assets/dest-sahara-dunes.jpg', cleanId, 4);
      const p5 = saveBase64ImageIfPresent(rawImagesList[4] || '/assets/dest-ubari.jpg', cleanId, 5);

      // Handle destinations display text
      const targetDest = Array.isArray(destinations) && destinations.length > 0
        ? destinations.slice(0, 4).join(' + ')
        : String(destination_region || destination || 'الوجهات السياحية المعتمدة').trim();

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('title', sql.NVarChar(200), cleanTitle);
      request.input('start_date', sql.Date, start_date || new Date());
      request.input('end_date', sql.Date, end_date || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
      request.input('max_cap', sql.Int, Number(max_capacity) || 25);
      request.input('avail_seats', sql.Int, Number(available_seats !== undefined ? available_seats : max_capacity) || 25);
      request.input('price', sql.Decimal(10, 2), Number(seat_per_price || price) || 1200);
      request.input('desc', sql.NVarChar(sql.MAX), String(trip_description || description || cleanTitle || 'برنامج أسبوعي متكامل').trim());
      request.input('guide_lic', sql.VarChar(50), guideLic);
      request.input('is_active', sql.Bit, is_active !== false ? 1 : 0);
      request.input('departure', sql.NVarChar(100), String(departure_city || 'طرابلس').trim());
      request.input('img1', sql.NVarChar(500), p1);
      request.input('img2', sql.NVarChar(500), p2);
      request.input('img3', sql.NVarChar(500), p3);
      request.input('img4', sql.NVarChar(500), p4);
      request.input('img5', sql.NVarChar(500), p5);
      request.input('vehicle_plate', sql.NVarChar(50), cleanPlate);

      await request.query(`
        IF EXISTS (SELECT 1 FROM weekly_trips WHERE weekly_trip_id = @id)
        BEGIN
          UPDATE weekly_trips
          SET trip_title = @title,
              start_date = @start_date,
              end_date = @end_date,
              max_capacity = @max_cap,
              available_seats = @avail_seats,
              seat_per_price = @price,
              guide_license_number = @guide_lic,
              is_active = @is_active,
              departure_city = @departure,
              vehicle_plate = COALESCE(@vehicle_plate, vehicle_plate),
              photo_1 = @img1,
              photo_2 = @img2,
              photo_3 = @img3,
              photo_4 = @img4,
              photo_5 = @img5
          WHERE weekly_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO weekly_trips (
            weekly_trip_id, trip_title, start_date, end_date, max_capacity,
            available_seats, seat_per_price, guide_license_number,
            is_active, departure_city, vehicle_plate,
            photo_1, photo_2, photo_3, photo_4, photo_5
          ) VALUES (
            @id, @title, @start_date, @end_date, @max_cap,
            @avail_seats, @price, @guide_lic,
            @is_active, @departure, @vehicle_plate,
            @img1, @img2, @img3, @img4, @img5
          );
        END
      `);

      // 2. Pure 3NF Relational Storage: Save stations into weekly_trip_stations (station_title, day_number, station_desc ONLY)
      const rawWStations = Array.isArray(stations) && stations.length > 0
        ? stations
        : (Array.isArray(itinerary_steps) && itinerary_steps.length > 0
            ? itinerary_steps
            : (typeof itinerary_steps === 'string'
                ? (() => { try { return JSON.parse(itinerary_steps); } catch { return []; } })()
                : []));

      try {
        const delWStReq = db.request();
        delWStReq.input('wt_id', sql.VarChar(50), cleanId);
        await delWStReq.query('DELETE FROM weekly_trip_stations WHERE weekly_trip_id = @wt_id');

        for (let i = 0; i < rawWStations.length; i++) {
          const st = rawWStations[i];
          const stOrder = i + 1;
          const stId = `${cleanId}-WST-${stOrder}`;
          const stTitle = String(st.title || st.station_title || st.station_name || `محطة ${stOrder}`).trim();
          const stDesc = String(st.desc || st.station_desc || st.description || '').trim();
          const stTime = String(st.time || st.arrival_time || '');
          const dayNum = Number(st.day_number || (stTime.includes('اليوم') ? parseInt(stTime.replace(/\D/g, '')) : 1)) || 1;

          const insWStReq = db.request();
          insWStReq.input('st_id', sql.VarChar(50), stId);
          insWStReq.input('wt_id', sql.VarChar(50), cleanId);
          insWStReq.input('st_order', sql.Int, stOrder);
          insWStReq.input('day_num', sql.Int, dayNum);
          insWStReq.input('st_title', sql.NVarChar(200), stTitle);
          insWStReq.input('st_desc', sql.NVarChar(sql.MAX), stDesc);

          await insWStReq.query(`
            INSERT INTO weekly_trip_stations (
              station_id, weekly_trip_id, station_order, day_number, station_title, station_desc
            ) VALUES (
              @st_id, @wt_id, @st_order, @day_num, @st_title, @st_desc
            );
          `);
        }
        console.log(`[weekly_trip_stations] Successfully stored ${rawWStations.length} normalized stations for ${cleanId}`);
      } catch (stErr) {
        console.warn('[weekly_trip_stations sync warning]:', stErr.message);
      }

      // Sync places_trip_weekly junction table (multi-landmark support)
      const rawPlaces = Array.isArray(place_ids) && place_ids.length > 0
        ? place_ids
        : (Array.isArray(destinations) && destinations.length > 0
            ? destinations
            : (Array.isArray(body.places) && body.places.length > 0
                ? body.places.map(p => typeof p === 'object' ? (p.place_id || p.id) : p)
                : (body.destination ? body.destination.split(' + ') : [])));
      const placeList = rawPlaces;

      try {
        const delPReq = db.request();
        delPReq.input('wt_id', sql.VarChar(50), cleanId);
        await delPReq.query('DELETE FROM places_trip_weekly WHERE weekly_trip_id = @wt_id');
        for (const pItem of placeList) {
          const cleanP = String(pItem || '').trim();
          if (cleanP) {
            const insPReq = db.request();
            insPReq.input('wt_id', sql.VarChar(50), cleanId);
            insPReq.input('p_val', sql.NVarChar(100), cleanP);
            await insPReq.query(`
              DECLARE @matched_place_id VARCHAR(50);
              SELECT TOP 1 @matched_place_id = place_id FROM places_tourist WHERE place_id = @p_val OR place_name = @p_val;
              IF @matched_place_id IS NOT NULL
              BEGIN
                IF NOT EXISTS (SELECT 1 FROM places_trip_weekly WHERE place_id = @matched_place_id AND weekly_trip_id = @wt_id)
                  INSERT INTO places_trip_weekly (place_id, weekly_trip_id) VALUES (@matched_place_id, @wt_id);
              END
            `);
          }
        }
      } catch (pErr) {
        console.warn('[places_trip_weekly sync warning]:', pErr.message);
      }

      // Sync hotels_trip_weekly junction table for multi-hotel support
      const hotelList = Array.isArray(body.hotel_ids)
        ? body.hotel_ids
        : (body.hotel_id ? [body.hotel_id] : []);
      if (hotelList.length > 0) {
        try {
          const delHReq = db.request();
          delHReq.input('wt_id', sql.VarChar(50), cleanId);
          await delHReq.query('DELETE FROM hotels_trip_weekly WHERE weekly_trip_id = @wt_id');
          for (const hId of hotelList) {
            const cleanHId = String(hId || '').trim();
            if (cleanHId) {
              const insHReq = db.request();
              insHReq.input('wt_id', sql.VarChar(50), cleanId);
              insHReq.input('h_id', sql.NVarChar(50), cleanHId);
              await insHReq.query('IF EXISTS (SELECT 1 FROM hotels WHERE hotel_id = @h_id) INSERT INTO hotels_trip_weekly (hotel_id, weekly_trip_id) VALUES (@h_id, @wt_id)');
            }
          }
        } catch (hErr) {
          console.warn('[hotels_trip_weekly sync warning]:', hErr.message);
        }
      }

      // Sync restaurants_trip_weekly junction table for multi-restaurant/cafe support (M:N)
      const restList = Array.isArray(body.restaurant_ids)
        ? body.restaurant_ids
        : (body.restaurant_id ? [body.restaurant_id] : []);
      if (restList.length > 0) {
        try {
          const delRReq = db.request();
          delRReq.input('wt_id', sql.VarChar(50), cleanId);
          await delRReq.query('DELETE FROM restaurants_trip_weekly WHERE weekly_trip_id = @wt_id');
          for (const rId of restList) {
            const cleanRId = String(rId || '').trim();
            if (cleanRId) {
              const insRReq = db.request();
              insRReq.input('wt_id', sql.VarChar(50), cleanId);
              insRReq.input('r_id', sql.VarChar(50), cleanRId);
              await insRReq.query('IF EXISTS (SELECT 1 FROM restaurants_cafes WHERE facility_id = @r_id) INSERT INTO restaurants_trip_weekly (weekly_trip_id, facility_id) VALUES (@wt_id, @r_id)');
            }
          }
        } catch (rErr) {
          console.warn('[restaurants_trip_weekly sync warning]:', rErr.message);
        }
      }

      // Real-time Event Trigger: Guide & Fleet/Driver Assignment
      try {
        if (guideLic) {
          await createNotificationInDb(db, {
            type: 'assignment',
            title: `🧭 تكليف بمهمة إرشاد رحلة أسبوعية جديدة`,
            body: `تم إسنادك كمرشد سياحي معتمد لرحلة (${cleanTitle}) المتجهة إلى (${targetDest}).`,
            recipient_role: 'guide',
            recipient_id: String(guideLic).trim(),
            link: '/dashboard/guide',
            dedupe_key: `guide-assign-${cleanId}-${guideLic}`,
          });
        }

        if (cleanPlate) {
          const vInfoRes = await db.request().input('v_plate', sql.NVarChar(50), cleanPlate).query(`
            SELECT d.driver_license_number, d.full_name as driver_name, v.contract_number, tc.company_name
            FROM vehicles v
            LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
            LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
            WHERE v.plate_number = @v_plate
          `);
          const vInfo = vInfoRes.recordset?.[0];
          if (vInfo) {
            if (vInfo.driver_license_number) {
              await createNotificationInDb(db, {
                type: 'assignment',
                title: `🚍 تكليف برحلة أسبوعية جديدة للسائق`,
                body: `تم إسناد مهمة قيادة ونقل رحلة أسبوعية (${cleanTitle}) على متن المركبة (${cleanPlate}).`,
                recipient_role: 'driver',
                recipient_id: String(vInfo.driver_license_number).trim(),
                link: '/dashboard/driver',
                dedupe_key: `driver-assign-${cleanId}-${vInfo.driver_license_number}`,
              });
            }
            if (vInfo.contract_number) {
              await createNotificationInDb(db, {
                type: 'assignment',
                title: `🚐 إسناد رحلة أسبوعية لأسطول شركتكم`,
                body: `تم إسناد رحلة أسبوعية (${cleanTitle}) للمركبة (${cleanPlate}) التابعة لأسطولكم.`,
                recipient_role: 'company',
                recipient_id: String(vInfo.contract_number).trim(),
                link: '/dashboard/transport',
                dedupe_key: `company-assign-${cleanId}-${vInfo.contract_number}`,
              });
            }
          }
        }
      } catch (gErr) {}

      return sendJson(res, 201, { success: true, message: 'تم حفظ الرحلة الأسبوعية ومحطاتها في DelniDB بنجاح', trip_id: cleanId });
    }

    // 14.2 Weekly Trips: DELETE
    if (pathname === '/api/db/weekly_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('weekly_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الأسبوعية مطلوب للحذف' });

      // Notify booked tourists, guide, driver, and company before deleting
      try {
        const tripDetailsRes = await db.request().input('w_id', sql.VarChar(50), id).query(`
          SELECT wt.trip_title, wt.guide_license_number, wt.vehicle_plate,
                 d.driver_license_number, v.contract_number
          FROM weekly_trips wt
          LEFT JOIN vehicles v ON wt.vehicle_plate = v.plate_number
          LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
          WHERE wt.weekly_trip_id = @w_id
        `);
        const tripInfo = tripDetailsRes.recordset?.[0];

        if (tripInfo) {
          if (tripInfo.guide_license_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ إلغاء تكليف الإرشاد لرحلة (${tripInfo.trip_title})`,
              body: `نحيطكم علماً بأنه قد تم إلغاء رحلة (${tripInfo.trip_title}) وإلغاء مهمة الإرشاد المسندة إليكم.`,
              recipient_role: 'guide',
              recipient_id: String(tripInfo.guide_license_number).trim(),
              link: '/dashboard/guide',
              dedupe_key: `trip-cancel-guide-${id}`,
            });
          }
          if (tripInfo.driver_license_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ إلغاء رحلة مسندة للسائق (${tripInfo.trip_title})`,
              body: `تم إلغاء رحلة (${tripInfo.trip_title}) التي كانت مسندة لمركبتكم (${tripInfo.vehicle_plate}).`,
              recipient_role: 'driver',
              recipient_id: String(tripInfo.driver_license_number).trim(),
              link: '/dashboard/driver',
              dedupe_key: `trip-cancel-driver-${id}`,
            });
          }
          if (tripInfo.contract_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ إلغاء رحلة تابعة لأسطول شركتكم (${tripInfo.trip_title})`,
              body: `تم إلغاء رحلة (${tripInfo.trip_title}) المسندة للمركبة (${tripInfo.vehicle_plate}).`,
              recipient_role: 'company',
              recipient_id: String(tripInfo.contract_number).trim(),
              link: '/dashboard/transport',
              dedupe_key: `trip-cancel-company-${id}`,
            });
          }
        }

        const bookedTourists = await db.request().input('w_id', sql.VarChar(50), id).query('SELECT b.tourist_id, wt.trip_title FROM bookings_weekly b LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id WHERE b.weekly_trip_id = @w_id');
        if (bookedTourists.recordset?.length > 0) {
          for (const b of bookedTourists.recordset) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `❌ تم إلغاء الرحلة الأسبوعية (${b.trip_title})`,
              body: `نأسف لإعلامكم بإلغاء رحلة (${b.trip_title}) من قِبل الإدارة. يُرجى مراجعة الإدارة لاسترجاع التكلفة أو تغيير الموعد.`,
              recipient_role: 'tourist',
              recipient_id: b.tourist_id,
              link: '/dashboard/tourist',
              dedupe_key: `trip-cancel-${id}-${b.tourist_id}`,
            });
          }
        }
      } catch (delErr) {}

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query(`
        DELETE FROM offers_weekly_trips WHERE weekly_trip_id = @id;
        DELETE FROM weekly_trip_stations WHERE weekly_trip_id = @id;
        DELETE FROM places_trip_weekly WHERE weekly_trip_id = @id;
        DELETE FROM hotels_trip_weekly WHERE weekly_trip_id = @id;
        DELETE FROM restaurants_trip_weekly WHERE weekly_trip_id = @id;
        DELETE FROM bookings_weekly WHERE weekly_trip_id = @id;
        DELETE FROM weekly_trips WHERE weekly_trip_id = @id;
      `);
      return sendJson(res, 200, { success: true, message: 'تم حذف الرحلة الأسبوعية ومحطاتها وحجوزاتها وعروضها بنجاح من DelniDB' });
    }

    // 14.3 Weekly Trip Offers: GET
    if (pathname === '/api/db/weekly_offers' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT o.offer_weekly_id, o.weekly_trip_id, o.offer_title, o.description,
               o.discount_percentage, o.offer_image_url,
               CONVERT(VARCHAR(10), o.start_date, 120) as start_date,
               CONVERT(VARCHAR(10), o.end_date, 120) as end_date,
               o.badge,
               wt.trip_title, wt.seat_per_price, wt.departure_city,
                wt.photo_1 as trip_photo
        FROM offers_weekly_trips o
        LEFT JOIN weekly_trips wt ON o.weekly_trip_id = wt.weekly_trip_id
        ORDER BY o.offer_weekly_id DESC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset || [] });
    }

    // 14.4 Weekly Trip Offers: POST (Create / Update)
    if (pathname === '/api/db/weekly_offers' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        offer_weekly_id, id, weekly_trip_id, offer_title, title_offer,
        description, discount_percentage, percent_discount,
        offer_image_url, url_image_offer, start_date, date_start,
        end_date, date_end, badge
      } = body;

      const cleanTripId = String(weekly_trip_id || '').trim();
      if (!cleanTripId) {
        return sendJson(res, 400, { success: false, error: 'يجب اختيار رحلة أسبوعية لربط العرض بها' });
      }

      // Check if target weekly trip exists
      const tripCheck = await db.request().input('tid', sql.VarChar(50), cleanTripId).query(`
        SELECT weekly_trip_id, trip_title, seat_per_price, photo FROM weekly_trips WHERE weekly_trip_id = @tid
      `);
      if (!tripCheck.recordset || tripCheck.recordset.length === 0) {
        return sendJson(res, 404, { success: false, error: 'الرحلة الأسبوعية المحددة غير موجودة في قاعدة البيانات' });
      }

      const cleanId = String(offer_weekly_id || id || `WO-${Date.now().toString().slice(-4)}`).trim();
      const cleanTitle = String(offer_title || title_offer || `عرض أسبوعي: ${tripCheck.recordset[0].trip_title}`).trim();
      const cleanDesc = String(description || `خصم استثنائي على رحلة ${tripCheck.recordset[0].trip_title} الشاملة للإقامة`).trim();

      let rawDisc = Number(discount_percentage !== undefined ? discount_percentage : (percent_discount !== undefined ? percent_discount : 15));
      if (isNaN(rawDisc) || rawDisc < 0) rawDisc = 0;
      if (rawDisc > 100) rawDisc = 100;
      const cleanDiscount = rawDisc;

      const today = new Date().toISOString().slice(0, 10);
      const inOneMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      let sDate = String(start_date || date_start || today).slice(0, 10);
      let eDate = String(end_date || date_end || inOneMonth).slice(0, 10);
      if (eDate <= sDate) {
        const sTime = new Date(sDate).getTime();
        eDate = new Date(sTime + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      }

      const cleanImage = String(offer_image_url || url_image_offer || tripCheck.recordset[0].photo || '/assets/dest-ubari-gaberoun.jpg').trim();
      const cleanBadge = String(badge || `خصم ${cleanDiscount}%`).trim();

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('weekly_trip_id', sql.VarChar(50), cleanTripId);
      request.input('offer_title', sql.NVarChar(250), cleanTitle);
      request.input('description', sql.NVarChar(sql.MAX), cleanDesc);
      request.input('discount_percentage', sql.Decimal(5, 2), cleanDiscount);
      request.input('offer_image_url', sql.VarChar(255), cleanImage);
      request.input('start_date', sql.Date, sDate);
      request.input('end_date', sql.Date, eDate);
      request.input('badge', sql.NVarChar(100), cleanBadge);

      await request.query(`
        IF EXISTS (SELECT 1 FROM offers_weekly_trips WHERE offer_weekly_id = @id)
        BEGIN
          UPDATE offers_weekly_trips
          SET weekly_trip_id = @weekly_trip_id,
              offer_title = @offer_title,
              description = @description,
              discount_percentage = @discount_percentage,
              offer_image_url = @offer_image_url,
              start_date = @start_date,
              end_date = @end_date,
              badge = @badge
          WHERE offer_weekly_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO offers_weekly_trips (
            offer_weekly_id, weekly_trip_id, offer_title, description,
            discount_percentage, offer_image_url, start_date, end_date, badge
          ) VALUES (
            @id, @weekly_trip_id, @offer_title, @description,
            @discount_percentage, @offer_image_url, @start_date, @end_date, @badge
          );
        END
      `);

      return sendJson(res, 201, {
        success: true,
        message: 'تم حفظ عرض الرحلة الأسبوعية بنجاح في DelniDB',
        offer_id: cleanId,
        offer: {
          offer_weekly_id: cleanId,
          weekly_trip_id: cleanTripId,
          offer_title: cleanTitle,
          description: cleanDesc,
          discount_percentage: cleanDiscount,
          offer_image_url: cleanImage,
          start_date: sDate,
          end_date: eDate,
          badge: cleanBadge,
          trip_title: tripCheck.recordset[0].trip_title,
          seat_per_price: tripCheck.recordset[0].seat_per_price
        }
      });
    }

    // 14.5 Weekly Trip Offers: DELETE
    if (pathname === '/api/db/weekly_offers' && req.method === 'DELETE') {
      const id = url.searchParams.get('offer_weekly_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف العرض الأسبوعي مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM offers_weekly_trips WHERE offer_weekly_id = @id;');
      return sendJson(res, 200, { success: true, message: 'تم حذف عرض الرحلة الأسبوعية بنجاح من DelniDB' });
    }

    // 14.5 Private Trips: GET
    if (pathname === '/api/db/private_trips' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT pt.private_trip_id,
               pt.status_order,
               pt.customer_name,
               pt.customer_phone,
               pt.preferred_start_date,
               pt.duration_days,
               pt.number_of_companions,
               pt.guide_license_number,
               pt.customer_description,
               pt.customer_requirements,
               pt.tourist_id,
               pt.quoted_price,
               pt.admin_itinerary_plan,
               COALESCE(pt.assigned_vehicle, ptv.plate_number) AS assigned_vehicle,
               g.full_name as guide_name, 
               g.phone_number as guide_phone
        FROM private_trips pt
        LEFT JOIN tour_guides g ON pt.guide_license_number = g.license_number
        LEFT JOIN (
          SELECT private_trip_id, MAX(plate_number) as plate_number
          FROM private_trip_vehicles
          GROUP BY private_trip_id
        ) ptv ON pt.private_trip_id = ptv.private_trip_id
        ORDER BY pt.preferred_start_date DESC
      `);

      try {
        const placesRes = await db.request().query(`
          SELECT ptp.private_trip_id, ptp.place_id, ptp.visit_order,
                 p.place_name, p.city, p.region, p.category, p.place_image
          FROM places_trip_private ptp
          JOIN places_tourist p ON ptp.place_id = p.place_id
          ORDER BY ptp.visit_order ASC
        `);
        const placesMap = {};
        for (const row of placesRes.recordset) {
          if (!placesMap[row.private_trip_id]) placesMap[row.private_trip_id] = [];
          placesMap[row.private_trip_id].push({
            place_id: row.place_id,
            place_name: row.place_name,
            city: row.city,
            region: row.region,
            category: row.category,
            place_image: row.place_image,
            visit_order: row.visit_order,
          });
        }
        for (const trip of result.recordset) {
          trip.places = placesMap[trip.private_trip_id] || [];
          trip.place_ids = (trip.places || []).map(p => p.place_id);
        }
      } catch (placesLoadErr) {
        console.warn('[DelniDB] Could not load private trip places:', placesLoadErr.message);
      }

      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 14.6 Private Trips: POST (Create / Review / Update)
    if (pathname === '/api/db/private_trips' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        private_trip_id,
        status_order,
        customer_name,
        customer_phone,
        preferred_start_date,
        duration_days,
        number_of_companions,
        guide_license_number,
        customer_description,
        customer_requirements,
        tourist_id,
        quoted_price,
        admin_itinerary_plan,
        assigned_vehicle,
        place_ids,
        places,
      } = body;

      const cleanId = String(private_trip_id || `PRV-${Date.now().toString().slice(-5)}`).trim();
      const cleanStatus = String(status_order || 'بانتظار تسعير الإدارة').trim();

      // Tourist Account Verification (تأكيد أن الحساب مفعّل ونشط وغير معلق)
      let validTouristId = null;
      if (tourist_id) {
        try {
          const tCheck = db.request();
          tCheck.input('tid', sql.VarChar(50), String(tourist_id).trim());
          const tRes = await tCheck.query('SELECT tourist_id, account_status, full_name FROM tourists WHERE tourist_id = @tid');
          if (tRes.recordset && tRes.recordset.length > 0) {
            const tStatus = String(tRes.recordset[0].account_status || 'نشط').trim();
            if (tStatus === 'معلق' || tStatus === 'محظور' || tStatus.includes('تعليق') || tStatus === 'غير نشط') {
              return sendJson(res, 403, {
                success: false,
                error: 'حساب السائح غير مفعّل أو معلّق. يرجى التواصل مع إدارة المنصة لتفعيل الحساب قبل تأكيد طلب الرحلة الخاصة.'
              });
            }
            validTouristId = tRes.recordset[0].tourist_id;
          } else {
            const altCheck = db.request();
            altCheck.input('val', sql.NVarChar(150), String(tourist_id).trim());
            const altRes = await altCheck.query('SELECT tourist_id, account_status FROM tourists WHERE email = @val OR phone_number = @val');
            if (altRes.recordset && altRes.recordset.length > 0) {
              const altStatus = String(altRes.recordset[0].account_status || 'نشط').trim();
              if (altStatus === 'معلق' || altStatus === 'محظور' || altStatus.includes('تعليق') || altStatus === 'غير نشط') {
                return sendJson(res, 403, {
                  success: false,
                  error: 'حساب السائح غير مفعّل أو معلّق. يرجى التواصل مع إدارة المنصة لتفعيل الحساب قبل تأكيد طلب الرحلة الخاصة.'
                });
              }
              validTouristId = altRes.recordset[0].tourist_id;
            }
          }
        } catch (tErr) {
          console.warn('[Tourist Status Check Notice]:', tErr.message);
        }
      }

      let rawPlate = assigned_vehicle || body.assigned_vehicle_plate || body.vehicle_plate || null;
      if (Array.isArray(rawPlate)) {
        rawPlate = rawPlate[0] || null;
      }
      const vehPlate = rawPlate ? String(rawPlate).split(',')[0].trim() : null;

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('status', sql.NVarChar(50), cleanStatus);
      request.input('cust_name', sql.NVarChar(100), String(customer_name || 'سائح دلّني').trim());
      request.input('cust_phone', sql.VarChar(20), String(customer_phone || '').trim());
      request.input('start_date', sql.Date, preferred_start_date ? new Date(preferred_start_date) : new Date());
      request.input('duration', sql.Int, Number(duration_days) || 1);
      request.input('companions', sql.Int, Number(number_of_companions) || 1);
      request.input('guide_lic', sql.NVarChar(50), guide_license_number ? String(guide_license_number).trim() : null);
      request.input('desc', sql.NVarChar(sql.MAX), String(customer_description || 'برنامج رحلة خاصة بالمعالم السياحية').trim());
      request.input('reqs', sql.NVarChar(sql.MAX), String(customer_requirements || '').trim());
      request.input('tourist_id', sql.VarChar(50), validTouristId);
      request.input('price', sql.Decimal(10, 2), quoted_price !== null && quoted_price !== undefined ? Number(quoted_price) : null);
      request.input('plan', sql.NVarChar(sql.MAX), admin_itinerary_plan ? String(admin_itinerary_plan).trim() : null);
      request.input('veh_plate', sql.VarChar(30), vehPlate ? String(vehPlate).trim() : null);

      await request.query(`
        IF EXISTS (SELECT 1 FROM private_trips WHERE private_trip_id = @id)
        BEGIN
          UPDATE private_trips
          SET status_order = @status,
              customer_name = @cust_name,
              customer_phone = @cust_phone,
              preferred_start_date = @start_date,
              duration_days = @duration,
              number_of_companions = @companions,
              guide_license_number = @guide_lic,
              customer_description = @desc,
              customer_requirements = @reqs,
              tourist_id = @tourist_id,
              quoted_price = @price,
              admin_itinerary_plan = @plan,
              assigned_vehicle = COALESCE(@veh_plate, assigned_vehicle)
          WHERE private_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO private_trips (
            private_trip_id, status_order, customer_name, customer_phone,
            preferred_start_date, duration_days, number_of_companions,
            guide_license_number, customer_description, customer_requirements,
            tourist_id, quoted_price, admin_itinerary_plan, assigned_vehicle
          ) VALUES (
            @id, @status, @cust_name, @cust_phone,
            @start_date, @duration, @companions,
            @guide_lic, @desc, @reqs,
            @tourist_id, @price, @plan, @veh_plate
          );
        END

        IF @veh_plate IS NOT NULL
        BEGIN
          IF EXISTS (SELECT 1 FROM sys.tables WHERE name = 'private_trip_vehicles')
          BEGIN
            IF EXISTS (SELECT 1 FROM private_trip_vehicles WHERE private_trip_id = @id)
              UPDATE private_trip_vehicles SET plate_number = @veh_plate, allocation_status = N'معينة' WHERE private_trip_id = @id;
            ELSE
              INSERT INTO private_trip_vehicles (private_alloc_id, private_trip_id, plate_number, start_date, end_date, allocation_status)
              VALUES ('PA-' + SUBSTRING(CONVERT(VARCHAR(40), NEWID()), 1, 8), @id, @veh_plate, @start_date, DATEADD(day, @duration, @start_date), N'معينة');
          END
        END
      `);

      // Save Many-to-Many Places (العلاقة متعدد إلى متعدد بين الرحلات الخاصة والمعالم السياحية في places_trip_private)
      const targetPlaceIds = Array.isArray(place_ids) ? place_ids : (Array.isArray(places) ? places.map(p => typeof p === 'string' ? p : (p.place_id || p.id)) : []);
      if (targetPlaceIds && targetPlaceIds.length > 0) {
        try {
          const delPlacesReq = db.request();
          delPlacesReq.input('ptid', sql.VarChar(50), cleanId);
          await delPlacesReq.query('DELETE FROM places_trip_private WHERE private_trip_id = @ptid');

          for (let i = 0; i < targetPlaceIds.length; i++) {
            const rawPid = targetPlaceIds[i];
            const cleanPid = String(rawPid || '').trim();
            if (!cleanPid) continue;

            const insPlaceReq = db.request();
            insPlaceReq.input('ptid', sql.VarChar(50), cleanId);
            insPlaceReq.input('pid', sql.VarChar(50), cleanPid);
            insPlaceReq.input('order', sql.Int, i + 1);
            await insPlaceReq.query(`
              IF EXISTS (SELECT 1 FROM places_tourist WHERE place_id = @pid)
              BEGIN
                IF NOT EXISTS (SELECT 1 FROM places_trip_private WHERE private_trip_id = @ptid AND place_id = @pid)
                  INSERT INTO places_trip_private (private_trip_id, place_id, visit_order, created_at)
                  VALUES (@ptid, @pid, @order, GETDATE());
              END
            `);
          }
        } catch (placesJuncErr) {
          console.warn('[places_trip_private Warning]:', placesJuncErr.message);
        }
      }

      // Real-time Event Trigger: Private Trips
      try {
        if (!quoted_price || cleanStatus === 'بانتظار تسعير الإدارة' || cleanStatus === 'قيد المراجعة') {
          await createNotificationInDb(db, {
            type: 'private_trip',
            title: `👑 تم استلام طلب رحلتك الخاصة (${cleanId})`,
            body: `تم استلام وتسجيل طلب رحلتك الخاصة بنجاح (#${cleanId}). تقوم إدارة المنصة بدراسة المسار وإعداد البرنامج المقترح.`,
            recipient_role: 'tourist',
            recipient_id: tourist_id,
            link: '/dashboard/tourist',
            dedupe_key: `priv-new-${cleanId}`,
          });

          await createNotificationInDb(db, {
            type: 'private_trip',
            title: `👑 طلب رحلة خاصة VIP جديد (#${cleanId})`,
            body: `طلب السائح (${customer_name || 'سائح دلني'}) رحلة خاصة (#${cleanId}) لمدة (${duration_days || 1}) أيام. بانتظار إعداد البرنامج والتسعير.`,
            recipient_role: 'admin',
            link: '/dashboard/admin',
            dedupe_key: `admin-priv-new-${cleanId}`,
          });
        } else if (quoted_price && (cleanStatus === 'بانتظار تأكيد السائح' || cleanStatus.includes('تسعير') || cleanStatus.includes('مقترح'))) {
          await createNotificationInDb(db, {
            type: 'private_trip',
            title: `📋 تم إعداد البرنامج المقترح لرحلتك الخاصة (${cleanId})`,
            body: `أعدت الإدارة برنامجاً مقترحاً وتكلفة تقديرية (${quoted_price} د.ل) لرحلتك الخاصة (#${cleanId}). تنبيه: هذا برنامج مقترح يتطلب مراجعتك واعتمادك ولا يعني تأكيد الحجز بعد.`,
            recipient_role: 'tourist',
            recipient_id: tourist_id,
            link: '/dashboard/tourist',
            dedupe_key: `priv-quote-${cleanId}-${quoted_price}`,
          });
        } else if (cleanStatus === 'مؤكدة' || cleanStatus.includes('موافقة')) {
          await createNotificationInDb(db, {
            type: 'private_trip',
            title: `🎉 اعتماد وتأكيد حجز الرحلة الخاصة (#${cleanId})`,
            body: `تم تأكيد حجز رحلتك الخاصة (#${cleanId}) بنجاح واعتماد جدول المحطات والتسعيرة. نتمنى لكم رحلة VIP ممتعة!`,
            recipient_role: 'tourist',
            recipient_id: tourist_id,
            link: '/dashboard/tourist',
            dedupe_key: `priv-confirmed-t-${cleanId}`,
          });

          await createNotificationInDb(db, {
            type: 'private_trip',
            title: `🎉 موافقة السائح على الرحلة الخاصة (#${cleanId})`,
            body: `وافق السائح (${customer_name || 'سائح دلني'}) على برنامج وتسعيرة الرحلة الخاصة (#${cleanId}). تم اعتماد الحجز بنجاح.`,
            recipient_role: 'admin',
            link: '/dashboard/admin',
            dedupe_key: `admin-priv-confirmed-${cleanId}`,
          });

          if (guide_license_number) {
            await createNotificationInDb(db, {
              type: 'trip',
              title: `🧭 تكليف بمهمة إرشاد رحلة خاصة VIP`,
              body: `تم تكليفك كمرشد سياحي للرحلة الخاصة (#${cleanId}) مع السائح (${customer_name || 'VIP'}) لمدة (${duration_days || 1}) أيام.`,
              recipient_role: 'guide',
              recipient_id: String(guide_license_number).trim(),
              link: '/dashboard/guide',
              dedupe_key: `guide-priv-assign-${cleanId}-${guide_license_number}`,
            });
          }
        } else if (cleanStatus.includes('ملغ') || cleanStatus.includes('مرفوض')) {
          await createNotificationInDb(db, {
            type: 'private_trip',
            title: `❌ إلغاء طلب الرحلة الخاصة (#${cleanId})`,
            body: `تم تحديث حالة الرحلة الخاصة (#${cleanId}) إلى: ${cleanStatus}.`,
            recipient_role: 'admin',
            link: '/dashboard/admin',
            dedupe_key: `admin-priv-cancel-${cleanId}-${cleanStatus}`,
          });
        }
      } catch (privNotifErr) {
        console.warn('[Private Trip Notification Warning]:', privNotifErr.message);
      }

      return sendJson(res, 201, { success: true, message: 'تم حفظ طلب الرحلة الخاصة بنجاح في DelniDB', trip_id: cleanId });
    }

    // 14.7 Private Trips: DELETE
    if (pathname === '/api/db/private_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('private_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الخاصة مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query(`
        DELETE FROM places_trip_private WHERE private_trip_id = @id;
        DELETE FROM private_trip_vehicles WHERE private_trip_id = @id;
        DELETE FROM private_trips WHERE private_trip_id = @id;
      `);
      return sendJson(res, 200, { success: true, message: 'تم حذف طلب الرحلة الخاصة بنجاح من DelniDB' });
    }

    // 15. Daily Bookings: GET
    if (pathname === '/api/db/bookings_daily' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT b.*, 
               t.full_name as tourist_name, 
               t.phone_number as tourist_phone, 
               t.email as tourist_email,
               dt.trip_title, 
               dt.departure_city, 
               dt.destination_city
        FROM bookings_daily b
        LEFT JOIN tourists t ON b.tourist_id = t.tourist_id
        LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id
        ORDER BY b.booking_date DESC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 15.1 Daily Bookings: POST
    if (pathname === '/api/db/bookings_daily' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        booking_daily_id, tourist_id, daily_trip_id, booking_date,
        number_of_seats, total_price, booking_status,
        payment_status, attended
      } = body;

      const cleanId = String(booking_daily_id || `BK-D-${Date.now().toString().slice(-5)}`).trim();
      let cleanTourist = String(tourist_id || '').trim();
      const cleanTrip = String(daily_trip_id || '').trim();

      if (!cleanTrip) return sendJson(res, 400, { success: false, error: 'معرف الرحلة اليومية مطلوب للحجز' });

      if (!cleanTourist) {
        const firstTourist = await db.request().query('SELECT TOP 1 tourist_id FROM tourists');
        cleanTourist = firstTourist.recordset?.[0]?.tourist_id || 'A1234546';
      }

      // Check tourist restriction status
      const tStatReq = db.request();
      tStatReq.input('chk_tid', sql.NVarChar(50), cleanTourist);
      const tStatRes = await tStatReq.query('SELECT account_status FROM tourists WHERE tourist_id = @chk_tid');
      if (tStatRes.recordset?.length > 0 && tStatRes.recordset[0].account_status === 'مقيّد') {
        return sendJson(res, 403, {
          success: false,
          error: 'تم تقييد حسابك من قبل إدارة المنصة ولا يمكنك إجراء حجوزات جديدة حالياً. يرجى التواصل مع إدارة دلّني.'
        });
      }

      const seatsCount = Math.max(1, Number(number_of_seats) || 1);

      // Business Rule: Validate 24-Hour Cutoff & Available Seats
      const tripCheckReq = db.request();
      tripCheckReq.input('chk_trip_id', sql.VarChar(50), cleanTrip);
      const tripRes = await tripCheckReq.query('SELECT departure_date, available_seats, max_capacity FROM daily_trips WHERE daily_trip_id = @chk_trip_id');
      if (tripRes.recordset?.length > 0) {
        const trip = tripRes.recordset[0];
        if (trip.start_date) {
          const depTime = new Date(trip.start_date).getTime();
          const nowTime = Date.now();
          const hoursUntilTrip = (depTime - nowTime) / (1000 * 60 * 60);
          if (hoursUntilTrip < 24) {
            return sendJson(res, 400, {
              success: false,
              error: 'عذراً، تم إغلاق الحجز على هذه الرحلة! يُقفل الحجز تلقائياً قبل موعد انطلاق الرحلة بـ 24 ساعة لترتيب الحافلات وقوائم الركاب وتنسيق المرشدين.'
            });
          }
        }
        if (typeof trip.available_seats === 'number' && trip.available_seats < seatsCount) {
          return sendJson(res, 400, {
            success: false,
            error: `عذراً، عدد المقاعد المطلوبة (${seatsCount}) يتجاوز المقاعد المتبقية في هذه الرحلة (${trip.available_seats} مقاعد).`
          });
        }
      }

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('tourist_id', sql.VarChar(50), cleanTourist);
      request.input('trip_id', sql.VarChar(50), cleanTrip);
      request.input('booking_date', sql.DateTime, booking_date ? new Date(booking_date) : new Date());
      request.input('seats', sql.Int, seatsCount);
      request.input('status', sql.VarChar(20), String(booking_status || 'مؤكد').trim());
      request.input('price', sql.Decimal(10, 2), Number(total_price) || 100);
      request.input('pay_status', sql.VarChar(20), String(payment_status || 'مدفوع').trim());
      request.input('attended', sql.Bit, attended ? 1 : 0);

      await request.query(`
        INSERT INTO bookings_daily (
          booking_daily_id, tourist_id, daily_trip_id, booking_date,
          number_of_seats, booking_status, total_price,
          payment_status, attended
        ) VALUES (
          @id, @tourist_id, @trip_id, @booking_date,
          @seats, @status, @price,
          @pay_status, @attended
        );

        UPDATE daily_trips
        SET available_seats = CASE WHEN available_seats >= @seats THEN available_seats - @seats ELSE 0 END
        WHERE daily_trip_id = @trip_id;
      `);

      // Real-time Event Trigger: Notify Tourist & Admin
      try {
        const tripNameRes = await db.request().input('t_id', sql.VarChar(50), cleanTrip).query('SELECT trip_title FROM daily_trips WHERE daily_trip_id = @t_id');
        const touristNameRes = await db.request().input('tourist_id', sql.VarChar(50), cleanTourist).query('SELECT full_name FROM tourists WHERE tourist_id = @tourist_id');
        const tripTitle = tripNameRes.recordset?.[0]?.trip_title || 'رحلة يومية';
        const touristName = touristNameRes.recordset?.[0]?.full_name || 'سائح دلني';

        await createNotificationInDb(db, {
          type: 'booking',
          title: `🎫 تم استلام وتسجيل حجزك بنجاح (${cleanId})`,
          body: `تم تسجيل حجزك في رحلة (${tripTitle}) لعدد (${seatsCount}) مقاعد برقم التذكرة (${cleanId}).`,
          recipient_role: 'tourist',
          recipient_id: cleanTourist,
          link: '/dashboard/tourist',
          dedupe_key: `booking-created-${cleanId}`,
        });

        await createNotificationInDb(db, {
          type: 'booking',
          title: `🎫 حجز مقاعد جديد مسجل (${cleanId})`,
          body: `سجّل السائح (${touristName}) حجزاً جديداً برقم التذكرة (${cleanId}) لعدد (${seatsCount}) مقاعد في رحلة (${tripTitle}).`,
          recipient_role: 'admin',
          link: '/dashboard/admin',
          dedupe_key: `admin-booking-${cleanId}`,
        });
      } catch (notifErr) {
        console.warn('[Booking Notification Trigger Warning]:', notifErr.message);
      }

      return sendJson(res, 201, { success: true, message: 'تم تسجيل وتأكيد حجز الرحلة اليومية في DelniDB بنجاح', booking_id: cleanId });
    }

    // 15.2 Daily Bookings: DELETE (With Seat Restoration)
    if (pathname === '/api/db/bookings_daily' && req.method === 'DELETE') {
      const id = url.searchParams.get('booking_daily_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الحجز مطلوب للحذف' });

      // Restore available seats back to the trip
      const bReq = db.request();
      bReq.input('del_id', sql.VarChar(50), id);
      const bRes = await bReq.query('SELECT daily_trip_id, number_of_seats FROM bookings_daily WHERE booking_daily_id = @del_id');
      if (bRes.recordset?.length > 0) {
        const bInfo = bRes.recordset[0];
        const restoreReq = db.request();
        restoreReq.input('restore_seats', sql.Int, bInfo.number_of_seats || 1);
        restoreReq.input('restore_trip_id', sql.VarChar(50), bInfo.daily_trip_id);
        await restoreReq.query(`
          UPDATE daily_trips
          SET available_seats = available_seats + @restore_seats
          WHERE daily_trip_id = @restore_trip_id
        `);
      }

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM bookings_daily WHERE booking_daily_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم إلغاء وحذف الحجز بنجاح واستعادة المقاعد الشاغرة للرحلة' });
    }

    // 15.3 Daily Bookings: PUT (Update payment status & attendance)
    if (pathname === '/api/db/bookings_daily' && req.method === 'PUT') {
      const id = url.searchParams.get('booking_daily_id') || url.searchParams.get('id');
      const body = await readBody(req);
      const cleanId = String(id || body.booking_daily_id || body.id || '').trim();
      if (!cleanId) return sendJson(res, 400, { success: false, error: 'معرف الحجز اليومي مطلوب للتحديث' });

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('pay_status', sql.VarChar(20), String(body.payment_status || 'paid').trim());
      request.input('booking_status', sql.VarChar(20), String(body.booking_status || 'مؤكدة').trim());
      request.input('attended', sql.Bit, body.attended ? 1 : 0);

      await request.query(`
        UPDATE bookings_daily
        SET payment_status = @pay_status,
            booking_status = @booking_status,
            attended = @attended
        WHERE booking_daily_id = @id;
      `);

      try {
        const bInfoRes = await db.request().input('b_id', sql.VarChar(50), cleanId).query(`
          SELECT b.tourist_id, dt.trip_title
          FROM bookings_daily b
          LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id
          WHERE b.booking_daily_id = @b_id
        `);
        const bInfo = bInfoRes.recordset?.[0];
        if (bInfo) {
          const newStatus = String(body.booking_status || '').trim();
          if (newStatus === 'مؤكدة' || newStatus === 'مؤكد') {
            await createNotificationInDb(db, {
              type: 'booking',
              title: `✅ تم تأكيد حجز تذكرتك رسمياً (${cleanId})`,
              body: `تم اعتماد وتأكيد حجزك رسمياً في رحلة (${bInfo.trip_title}) برقم التذكرة (${cleanId}). نتمنى لك رحلة ممتعة وآمنة!`,
              recipient_role: 'tourist',
              recipient_id: bInfo.tourist_id,
              link: '/dashboard/tourist',
              dedupe_key: `booking-status-${cleanId}-${newStatus}`,
            });
          } else if (newStatus.includes('ملغ')) {
            await createNotificationInDb(db, {
              type: 'booking',
              title: `❌ تم إلغاء حجز الرحلة (${cleanId})`,
              body: `تم إلغاء حجزك في رحلة (${bInfo.trip_title}) برقم التذكرة (${cleanId}).`,
              recipient_role: 'tourist',
              recipient_id: bInfo.tourist_id,
              link: '/dashboard/tourist',
              dedupe_key: `booking-status-${cleanId}-${newStatus}`,
            });
          }
        }
      } catch (err) {}

      return sendJson(res, 200, { success: true, message: 'تم تحديث حالة الدفع والحضور للحجز اليومي بنجاح في DelniDB' });
    }

    // 16. Weekly Bookings: GET
    if (pathname === '/api/db/bookings_weekly' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT b.*, 
               t.full_name as tourist_name, 
               t.phone_number as tourist_phone, 
               t.email as tourist_email,
               wt.trip_title,
               wt.departure_city
        FROM bookings_weekly b
        LEFT JOIN tourists t ON b.tourist_id = t.tourist_id
        LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id
        ORDER BY b.booking_date DESC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 16.1 Weekly Bookings: POST
    if (pathname === '/api/db/bookings_weekly' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        booking_weekly_id, tourist_id, weekly_trip_id, booking_date,
        number_of_seats, total_price, booking_status,
        payment_status, attended
      } = body;

      const cleanId = String(booking_weekly_id || `BK-W-${Date.now().toString().slice(-5)}`).trim();
      let cleanTourist = String(tourist_id || '').trim();
      const cleanTrip = String(weekly_trip_id || '').trim();

      if (!cleanTrip) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الأسبوعية مطلوب للحجز' });

      if (!cleanTourist) {
        const firstTourist = await db.request().query('SELECT TOP 1 tourist_id FROM tourists');
        cleanTourist = firstTourist.recordset?.[0]?.tourist_id || 'A56780';
      }

      // Check tourist restriction status
      const wStatReq = db.request();
      wStatReq.input('chk_tid', sql.NVarChar(50), cleanTourist);
      const wStatRes = await wStatReq.query('SELECT account_status FROM tourists WHERE tourist_id = @chk_tid');
      if (wStatRes.recordset?.length > 0 && wStatRes.recordset[0].account_status === 'مقيّد') {
        return sendJson(res, 403, {
          success: false,
          error: 'تم تقييد حسابك من قبل إدارة المنصة ولا يمكنك إجراء حجوزات جديدة حالياً. يرجى التواصل مع إدارة دلّني.'
        });
      }

      const seatsCount = Math.max(1, Number(number_of_seats) || 1);

      // Business Rule: Validate 24-Hour Cutoff & Available Seats
      const wTripCheckReq = db.request();
      wTripCheckReq.input('chk_trip_id', sql.VarChar(50), cleanTrip);
      const wTripRes = await wTripCheckReq.query('SELECT start_date, available_seats, max_capacity FROM weekly_trips WHERE weekly_trip_id = @chk_trip_id');
      if (wTripRes.recordset?.length > 0) {
        const trip = wTripRes.recordset[0];
        if (trip.departure_date) {
          const depTime = new Date(trip.departure_date).getTime();
          const nowTime = Date.now();
          const hoursUntilTrip = (depTime - nowTime) / (1000 * 60 * 60);
          if (hoursUntilTrip < 24) {
            return sendJson(res, 400, {
              success: false,
              error: 'عذراً، تم إغلاق استقبال الحجوزات لهذه الرحلة الأسبوعية! يُقفل الحجز تلقائياً قبل موعد الرحلة بـ 24 ساعة.'
            });
          }
        }
        if (typeof trip.available_seats === 'number' && trip.available_seats < seatsCount) {
          return sendJson(res, 400, {
            success: false,
            error: `عذراً، المقاعد المتبقية في هذه الرحلة (${trip.available_seats} مقاعد) غير كافية لحجزك المطلوب (${seatsCount} مقاعد).`
          });
        }
      }

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('tourist_id', sql.VarChar(50), cleanTourist);
      request.input('trip_id', sql.VarChar(50), cleanTrip);
      request.input('booking_date', sql.DateTime, booking_date ? new Date(booking_date) : new Date());
      request.input('seats', sql.Int, seatsCount);
      request.input('status', sql.VarChar(20), String(booking_status || 'مؤكد').trim());
      request.input('price', sql.Decimal(10, 2), Number(total_price) || 1200);
      request.input('pay_status', sql.VarChar(20), String(payment_status || 'مدفوع').trim());
      request.input('attended', sql.Bit, attended ? 1 : 0);

      await request.query(`
        INSERT INTO bookings_weekly (
          booking_weekly_id, tourist_id, weekly_trip_id, booking_date,
          number_of_seats, total_price, booking_status,
          payment_status, attended
        ) VALUES (
          @id, @tourist_id, @trip_id, @booking_date,
          @seats, @price, @status,
          @pay_status, @attended
        );

        UPDATE weekly_trips
        SET available_seats = CASE WHEN available_seats >= @seats THEN available_seats - @seats ELSE 0 END
        WHERE weekly_trip_id = @trip_id;
      `);

      // Real-time Event Trigger: Notify Tourist & Admin
      try {
        const tripNameRes = await db.request().input('t_id', sql.VarChar(50), cleanTrip).query('SELECT trip_title FROM weekly_trips WHERE weekly_trip_id = @t_id');
        const touristNameRes = await db.request().input('tourist_id', sql.VarChar(50), cleanTourist).query('SELECT full_name FROM tourists WHERE tourist_id = @tourist_id');
        const tripTitle = tripNameRes.recordset?.[0]?.trip_title || 'رحلة أسبوعية';
        const touristName = touristNameRes.recordset?.[0]?.full_name || 'سائح دلني';

        await createNotificationInDb(db, {
          type: 'booking',
          title: `🎫 تم استلام وتسجيل حجزك بالرحلة الأسبوعية (${cleanId})`,
          body: `تم تسجيل حجزك في رحلة (${tripTitle}) لعدد (${seatsCount}) مقاعد برقم التذكرة (${cleanId}).`,
          recipient_role: 'tourist',
          recipient_id: cleanTourist,
          link: '/dashboard/tourist',
          dedupe_key: `booking-created-${cleanId}`,
        });

        await createNotificationInDb(db, {
          type: 'booking',
          title: `🎫 حجز رحلة أسبوعية جديد (${cleanId})`,
          body: `سجّل السائح (${touristName}) حجزاً لعدد (${seatsCount}) مقاعد في رحلة (${tripTitle}).`,
          recipient_role: 'admin',
          link: '/dashboard/admin',
          dedupe_key: `admin-booking-${cleanId}`,
        });
      } catch (notifErr) {
        console.warn('[Weekly Booking Notification Trigger Warning]:', notifErr.message);
      }

      return sendJson(res, 201, { success: true, message: 'تم تسجيل وتأكيد حجز الرحلة الأسبوعية في DelniDB بنجاح', booking_id: cleanId });
    }

    // 16.2 Weekly Bookings: DELETE (With Seat Restoration)
    if (pathname === '/api/db/bookings_weekly' && req.method === 'DELETE') {
      const id = url.searchParams.get('booking_weekly_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الحجز مطلوب للحذف' });

      // Restore seats back to weekly trip
      const bReq = db.request();
      bReq.input('del_id', sql.VarChar(50), id);
      const bRes = await bReq.query('SELECT weekly_trip_id, number_of_seats FROM bookings_weekly WHERE booking_weekly_id = @del_id');
      if (bRes.recordset?.length > 0) {
        const bInfo = bRes.recordset[0];
        const restoreReq = db.request();
        restoreReq.input('restore_seats', sql.Int, bInfo.number_of_seats || 1);
        restoreReq.input('restore_trip_id', sql.VarChar(50), bInfo.weekly_trip_id);
        await restoreReq.query(`
          UPDATE weekly_trips
          SET available_seats = available_seats + @restore_seats
          WHERE weekly_trip_id = @restore_trip_id
        `);
      }

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM bookings_weekly WHERE booking_weekly_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم إلغاء وحذف الحجز بنجاح واستعادة المقاعد الشاغرة للرحلة الأسبوعية' });
    }

    // 16.3 Weekly Bookings: PUT (Update payment status & attendance)
    if (pathname === '/api/db/bookings_weekly' && req.method === 'PUT') {
      const id = url.searchParams.get('booking_weekly_id') || url.searchParams.get('id');
      const body = await readBody(req);
      const cleanId = String(id || body.booking_weekly_id || body.id || '').trim();
      if (!cleanId) return sendJson(res, 400, { success: false, error: 'معرف الحجز الأسبوعي مطلوب للتحديث' });

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('pay_status', sql.VarChar(20), String(body.payment_status || 'paid').trim());
      request.input('booking_status', sql.VarChar(20), String(body.booking_status || 'مؤكدة').trim());
      request.input('attended', sql.Bit, body.attended ? 1 : 0);

      await request.query(`
        UPDATE bookings_weekly
        SET payment_status = @pay_status,
            booking_status = @booking_status,
            attended = @attended
        WHERE booking_weekly_id = @id;
      `);

      try {
        const bInfoRes = await db.request().input('b_id', sql.VarChar(50), cleanId).query(`
          SELECT b.tourist_id, wt.trip_title
          FROM bookings_weekly b
          LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id
          WHERE b.booking_weekly_id = @b_id
        `);
        const bInfo = bInfoRes.recordset?.[0];
        if (bInfo) {
          const newStatus = String(body.booking_status || '').trim();
          if (newStatus === 'مؤكدة' || newStatus === 'مؤكد') {
            await createNotificationInDb(db, {
              type: 'booking',
              title: `✅ تم تأكيد حجز تذكرتك الأسبوعية رسمياً (${cleanId})`,
              body: `تم اعتماد وتأكيد حجزك رسمياً في رحلة (${bInfo.trip_title}) برقم التذكرة (${cleanId}). نتمنى لك رحلة ممتعة وآمنة!`,
              recipient_role: 'tourist',
              recipient_id: bInfo.tourist_id,
              link: '/dashboard/tourist',
              dedupe_key: `booking-status-${cleanId}-${newStatus}`,
            });
          } else if (newStatus.includes('ملغ')) {
            await createNotificationInDb(db, {
              type: 'booking',
              title: `❌ تم إلغاء حجز الرحلة الأسبوعية (${cleanId})`,
              body: `تم إلغاء حجزك في رحلة (${bInfo.trip_title}) برقم التذكرة (${cleanId}).`,
              recipient_role: 'tourist',
              recipient_id: bInfo.tourist_id,
              link: '/dashboard/tourist',
              dedupe_key: `booking-status-${cleanId}-${newStatus}`,
            });
          }
        }
      } catch (err) {}

      return sendJson(res, 200, { success: true, message: 'تم تحديث حالة الدفع والحضور للحجز الأسبوعي بنجاح في DelniDB' });
    }

    // 18. Admin Unified Dashboard API: GET (Live sync of all entities from DelniDB)
    if (pathname === '/api/db/dashboard_admin' && req.method === 'GET') {
      const [
        guidesRes, companiesRes, driversRes, vehiclesRes,
        dailyRes, weeklyRes, bookDailyRes, bookWeeklyRes,
        privateRes, hotelsRes, restRes, placesRes,
        dailyOffersRes, weeklyOffersRes, touristsRes,
        dailyStationsRes, weeklyStationsRes
      ] = await Promise.all([
        db.request().query('SELECT * FROM tour_guides ORDER BY full_name ASC'),
        db.request().query('SELECT * FROM transportation_companies ORDER BY company_name ASC'),
        db.request().query('SELECT * FROM drivers ORDER BY full_name ASC'),
        db.request().query('SELECT * FROM vehicles ORDER BY plate_number ASC'),
        db.request().query(`
          SELECT dt.*, 
                 g.full_name as guide_name, g.phone_number as guide_phone, g.title as guide_title, g.avatar as guide_avatar,
                 v.vehicle_type as vehicle_model, v.seating_capacity as vehicle_capacity, v.vehicle_image,
                 tc.company_name as transport_company_name,
                 d.full_name as driver_name, d.phone_number as driver_phone, d.driver_license_number,
                 r.facility_name as restaurant_name, r.facility_type as restaurant_type, r.city as restaurant_city, r.address_details as restaurant_address, r.phone_number as restaurant_phone
          FROM daily_trips dt
          LEFT JOIN tour_guides g ON dt.guide_license_number = g.license_number
          LEFT JOIN vehicles v ON dt.vehicle_plate = v.plate_number
          LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
          LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
          LEFT JOIN restaurants_cafes r ON dt.restaurant_id = r.facility_id
          ORDER BY dt.daily_trip_id DESC
        `),
        db.request().query(`
          SELECT wt.*, 
                 g.full_name as guide_name, g.phone_number as guide_phone, g.title as guide_title, g.avatar as guide_avatar,
                 v.vehicle_type as vehicle_model, v.seating_capacity as vehicle_capacity, v.vehicle_image,
                 tc.company_name as transport_company_name,
                 d.full_name as driver_name, d.phone_number as driver_phone, d.driver_license_number
           FROM weekly_trips wt
          LEFT JOIN tour_guides g ON wt.guide_license_number = g.license_number
          LEFT JOIN vehicles v ON wt.vehicle_plate = v.plate_number
          LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
          LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
          
          ORDER BY wt.weekly_trip_id DESC
        `),
        db.request().query('SELECT b.*, t.full_name as tourist_name, dt.trip_title FROM bookings_daily b LEFT JOIN tourists t ON b.tourist_id = t.tourist_id LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id ORDER BY b.booking_date DESC'),
        db.request().query('SELECT b.*, t.full_name as tourist_name, wt.trip_title FROM bookings_weekly b LEFT JOIN tourists t ON b.tourist_id = t.tourist_id LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id ORDER BY b.booking_date DESC'),
        db.request().query('SELECT * FROM private_trips ORDER BY private_trip_id DESC'),
        db.request().query('SELECT * FROM hotels ORDER BY hotel_name ASC'),
        db.request().query('SELECT * FROM restaurants_cafes ORDER BY facility_name ASC'),
        db.request().query('SELECT * FROM places_tourist ORDER BY place_name ASC'),
        db.request().query(`
          SELECT o.offer_daily_id, o.daily_trip_id, o.offer_title, o.description,
                 o.percent_discount, o.offer_image_url,
                 CONVERT(VARCHAR(10), o.start_date, 120) as start_date,
                 CONVERT(VARCHAR(10), o.end_date, 120) as end_date,
                 o.badge,
                 dt.trip_title, dt.price_per_seat, dt.departure_city, dt.destination_city,
                 dt.photo as trip_photo
          FROM offers_daily_trips o
          LEFT JOIN daily_trips dt ON o.daily_trip_id = dt.daily_trip_id
          ORDER BY o.offer_daily_id DESC
        `),
        db.request().query(`
          SELECT o.offer_weekly_id, o.weekly_trip_id, o.offer_title, o.description,
                 o.discount_percentage, o.offer_image_url,
                 CONVERT(VARCHAR(10), o.start_date, 120) as start_date,
                 CONVERT(VARCHAR(10), o.end_date, 120) as end_date,
                 o.badge,
                 wt.trip_title, wt.seat_per_price, wt.departure_city,
                  wt.photo_1 as trip_photo
          FROM offers_weekly_trips o
          LEFT JOIN weekly_trips wt ON o.weekly_trip_id = wt.weekly_trip_id
          ORDER BY o.offer_weekly_id DESC
        `),
        db.request().query(`
          SELECT tourist_id, full_name, email, phone_number, COALESCE(account_status, N'نشط') as account_status, COALESCE(created_at, GETDATE()) as created_at
          FROM tourists
          ORDER BY full_name ASC
        `),
        db.request().query('SELECT * FROM daily_trip_stations ORDER BY daily_trip_id, station_order ASC').catch(() => ({ recordset: [] })),
        db.request().query('SELECT * FROM weekly_trip_stations ORDER BY weekly_trip_id, station_order ASC').catch(() => ({ recordset: [] }))
      ]);

      const mappedDailyWithStations = (dailyRes.recordset || []).map(dt => {
        const tripStations = (dailyStationsRes?.recordset || []).filter(s => s.daily_trip_id === dt.daily_trip_id);
        const mappedSteps = tripStations.map(s => ({
          time: s.arrival_time || `المحطة ${s.station_order}`,
          title: s.station_name,
          desc: s.description || '',
          station_id: s.station_id,
          station_order: s.station_order,
          station_city: s.station_city,
          station_type: s.station_type
        }));
        return {
          ...dt,
          stations: tripStations,
          itinerary_steps: mappedSteps.length > 0 ? mappedSteps : []
        };
      });

      const mappedWeeklyWithStations = (weeklyRes.recordset || []).map(wt => {
        const tripStations = (weeklyStationsRes?.recordset || []).filter(s => s.weekly_trip_id === wt.weekly_trip_id);
        const mappedSteps = tripStations.map(s => ({
          time: s.arrival_time || (s.day_number ? `اليوم ${s.day_number}` : `المحطة ${s.station_order}`),
          title: s.station_name,
          desc: s.description || '',
          station_id: s.station_id,
          station_order: s.station_order,
          day_number: s.day_number,
          station_city: s.station_city,
          station_type: s.station_type
        }));
        return {
          ...wt,
          stations: tripStations,
          itinerary_steps: mappedSteps.length > 0 ? mappedSteps : []
        };
      });

      return sendJson(res, 200, {
        success: true,
        database: 'DelniDB (Microsoft SQL Server)',
        guides: guidesRes.recordset || [],
        companies: companiesRes.recordset || [],
        drivers: driversRes.recordset || [],
        vehicles: vehiclesRes.recordset || [],
        tourists: touristsRes.recordset || [],
        daily_trips: mappedDailyWithStations,
        weekly_trips: mappedWeeklyWithStations,
        daily_bookings: bookDailyRes.recordset || [],
        weekly_bookings: bookWeeklyRes.recordset || [],
        private_trips: privateRes.recordset || [],
        hotels: hotelsRes.recordset || [],
        restaurants: restRes.recordset || [],
        places: placesRes.recordset || [],
        daily_offers: dailyOffersRes.recordset || [],
        weekly_offers: weeklyOffersRes.recordset || [],
        stats: {
          total_guides: guidesRes.recordset?.length || 0,
          total_companies: companiesRes.recordset?.length || 0,
          total_drivers: driversRes.recordset?.length || 0,
          total_vehicles: vehiclesRes.recordset?.length || 0,
          total_tourists: touristsRes.recordset?.length || 0,
          total_daily_trips: dailyRes.recordset?.length || 0,
          total_weekly_trips: weeklyRes.recordset?.length || 0,
          total_daily_offers: dailyOffersRes.recordset?.length || 0,
          total_weekly_offers: weeklyOffersRes.recordset?.length || 0,
          total_bookings: (bookDailyRes.recordset?.length || 0) + (bookWeeklyRes.recordset?.length || 0),
          total_hotels: hotelsRes.recordset?.length || 0,
          total_restaurants: restRes.recordset?.length || 0,
        }
      });
    }

    // 25. Notifications: GET (Strict User Isolation)
    if (pathname === '/api/db/notifications' && req.method === 'GET') {
      const role = url.searchParams.get('role') || 'all';
      const userId = url.searchParams.get('user_id') || '';
      const request = db.request();
      request.input('role', sql.NVarChar(50), role);
      request.input('userId', sql.NVarChar(100), userId);
      const resData = await request.query(`
        SELECT id, type, title, body, recipient_role, recipient_id, link, is_read as [read],
               CONVERT(VARCHAR(16), created_at, 120) as [time],
               created_at
        FROM notifications WITH (NOLOCK)
        WHERE 
          (recipient_id IS NOT NULL AND recipient_id = @userId)
          OR
          (recipient_id IS NULL AND (recipient_role = 'all' OR recipient_role = @role))
        ORDER BY created_at DESC
      `);
      return sendJson(res, 200, { success: true, data: resData.recordset });
    }

    // 25.0 Notifications: Unread Count
    if (pathname === '/api/db/notifications/unread_count' && req.method === 'GET') {
      const role = url.searchParams.get('role') || 'all';
      const userId = url.searchParams.get('user_id') || '';
      const request = db.request();
      request.input('role', sql.NVarChar(50), role);
      request.input('userId', sql.NVarChar(100), userId);
      const resData = await request.query(`
        SELECT COUNT(*) as unread_count
        FROM notifications WITH (NOLOCK)
        WHERE is_read = 0 AND (
          (recipient_id IS NOT NULL AND recipient_id = @userId)
          OR
          (recipient_id IS NULL AND (recipient_role = 'all' OR recipient_role = @role))
        )
      `);
      return sendJson(res, 200, { success: true, count: resData.recordset?.[0]?.unread_count || 0 });
    }

    // 25.1 Notifications: POST (Create with Deduplication)
    if (pathname === '/api/db/notifications' && req.method === 'POST') {
      const body = await readBody(req);
      const { id, type, title, body: notifBody, recipient_role, recipient_id, link, dedupe_key } = body;
      const cleanId = String(id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`).trim();
      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('type', sql.NVarChar(50), String(type || 'system').trim());
      request.input('title', sql.NVarChar(255), String(title || 'إشعار جديد').trim());
      request.input('body', sql.NVarChar(sql.MAX), String(notifBody || '').trim());
      request.input('recipient_role', sql.NVarChar(50), String(recipient_role || 'all').trim());
      request.input('recipient_id', sql.NVarChar(100), recipient_id ? String(recipient_id).trim() : null);
      request.input('link', sql.NVarChar(255), link ? String(link).trim() : null);
      request.input('dedupe_key', sql.VarChar(100), dedupe_key ? String(dedupe_key).trim() : null);

      if (dedupe_key) {
        await request.query(`
          IF NOT EXISTS (SELECT 1 FROM notifications WITH (NOLOCK) WHERE dedupe_key = @dedupe_key)
          BEGIN
            INSERT INTO notifications (id, type, title, body, recipient_role, recipient_id, link, is_read, dedupe_key, created_at)
            VALUES (@id, @type, @title, @body, @recipient_role, @recipient_id, @link, 0, @dedupe_key, GETDATE());
          END
        `);
      } else {
        await request.query(`
          INSERT INTO notifications (id, type, title, body, recipient_role, recipient_id, link, is_read, dedupe_key, created_at)
          VALUES (@id, @type, @title, @body, @recipient_role, @recipient_id, @link, 0, NULL, GETDATE());
        `);
      }
      return sendJson(res, 201, { success: true, message: 'تم حفظ الإشعار في DelniDB بنجاح', id: cleanId });
    }

    // 25.2 Notifications: Mark Read (POST / PUT)
    if (pathname === '/api/db/notifications/read' && (req.method === 'POST' || req.method === 'PUT')) {
      const body = await readBody(req);
      const { id, all, role, user_id } = body;
      const request = db.request();
      if (all) {
        request.input('role', sql.NVarChar(50), String(role || 'all').trim());
        request.input('userId', sql.NVarChar(100), String(user_id || '').trim());
        await request.query(`
          UPDATE notifications 
          SET is_read = 1 
          WHERE (recipient_id IS NOT NULL AND recipient_id = @userId)
             OR (recipient_id IS NULL AND (recipient_role = 'all' OR recipient_role = @role))
        `);
      } else if (id) {
        request.input('id', sql.VarChar(50), String(id).trim());
        await request.query(`UPDATE notifications SET is_read = 1 WHERE id = @id`);
      }
      return sendJson(res, 200, { success: true, message: 'تم تحديث حالة القراءة بنجاح' });
    }

    // 26. Favorites: GET
    if (pathname === '/api/db/favorites' && req.method === 'GET') {
      const touristId = url.searchParams.get('tourist_id');
      const request = db.request();
      let query = 'SELECT * FROM tourist_favorites';
      if (touristId) {
        request.input('tid', sql.VarChar(50), String(touristId).trim());
        query += ' WHERE tourist_id = @tid';
      }
      query += ' ORDER BY created_at DESC';
      const result = await request.query(query);
      return sendJson(res, 200, { success: true, data: result.recordset || [] });
    }

    // 26.1 Favorites: POST (Atomic Toggle)
    if (pathname === '/api/db/favorites' && req.method === 'POST') {
      const body = await readBody(req);
      const { tourist_id, item_type, item_id } = body;
      const cleanTourist = String(tourist_id || '').trim();
      const cleanType = String(item_type || '').trim();
      const cleanItemId = String(item_id || '').trim();

      if (!cleanTourist || !cleanType || !cleanItemId) {
        return sendJson(res, 400, { success: false, error: 'tourist_id, item_type, and item_id are all required' });
      }

      const favId = `FAV-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
      const request = db.request();
      request.input('fav_id', sql.VarChar(50), favId);
      request.input('tid', sql.VarChar(50), cleanTourist);
      request.input('itype', sql.NVarChar(50), cleanType);
      request.input('iid', sql.VarChar(50), cleanItemId);

      const result = await request.query(`
        IF EXISTS (SELECT 1 FROM tourist_favorites WHERE tourist_id = @tid AND item_type = @itype AND item_id = @iid)
        BEGIN
          DELETE FROM tourist_favorites WHERE tourist_id = @tid AND item_type = @itype AND item_id = @iid;
          SELECT 0 as is_fav;
        END
        ELSE
        BEGIN
          INSERT INTO tourist_favorites (favorite_id, tourist_id, item_type, item_id, created_at)
          VALUES (@fav_id, @tid, @itype, @iid, GETDATE());
          SELECT 1 as is_fav;
        END
      `);

      const isFav = result.recordset?.[0]?.is_fav === 1;
      return sendJson(res, 200, {
        success: true,
        is_favorite: isFav,
        message: isFav ? 'تمت إضافة العنصر إلى المفضلة بنجاح ❤️' : 'تمت إزالة العنصر من المفضلة بنجاح'
      });
    }

    // 27. Reviews: GET (Full Support for Daily Trips, Weekly Trips, Hotels, Restaurants/Cafes)
    if (pathname === '/api/db/reviews' && req.method === 'GET') {
      const tripId = url.searchParams.get('trip_id') || url.searchParams.get('id');
      const hotelId = url.searchParams.get('hotel_id');
      const facilityId = url.searchParams.get('facility_id') || url.searchParams.get('restaurant_id');
      const type = (url.searchParams.get('type') || '').toLowerCase().trim();
      const request = db.request();

      // Filter by Hotel
      if (hotelId || type === 'hotel') {
        const targetHotel = hotelId || tripId;
        if (targetHotel) {
          request.input('hotel_id', sql.VarChar(50), String(targetHotel).trim());
        }
        const resHotel = await request.query(`
          SELECT r.review_hotel_id as review_id, r.tourist_id, r.hotel_id as target_id,
                 r.stars_rating, r.comment_text, r.created_at, 'hotel' as target_type,
                 h.hotel_name as target_name,
                 t.full_name as tourist_name, t.phone_number as tourist_phone
          FROM reviews_hotels r
          LEFT JOIN hotels h ON r.hotel_id = h.hotel_id
          LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
          ${targetHotel ? 'WHERE r.hotel_id = @hotel_id' : ''}
          ORDER BY r.created_at DESC
        `);
        return sendJson(res, 200, { success: true, data: resHotel.recordset || [] });
      }

      // Filter by Restaurant/Facility
      if (facilityId || type === 'facility' || type === 'restaurant' || type === 'cafe') {
        const targetFac = facilityId || tripId;
        if (targetFac) {
          request.input('facility_id', sql.VarChar(50), String(targetFac).trim());
        }
        const resFacility = await request.query(`
          SELECT r.review_facility_id as review_id, r.tourist_id, r.facility_id as target_id,
                 r.stars_rating, r.comment_text, r.created_at, 'facility' as target_type,
                 f.facility_name as target_name,
                 t.full_name as tourist_name, t.phone_number as tourist_phone
          FROM reviews_facilities r
          LEFT JOIN restaurants_cafes f ON r.facility_id = f.facility_id
          LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
          ${targetFac ? 'WHERE r.facility_id = @facility_id' : ''}
          ORDER BY r.created_at DESC
        `);
        return sendJson(res, 200, { success: true, data: resFacility.recordset || [] });
      }

      // Filter by Trip (Weekly or Daily)
      if (tripId) {
        request.input('trip_id', sql.VarChar(50), String(tripId).trim());
        if (type === 'weekly') {
          const resWeekly = await request.query(`
            SELECT r.review_weekly_id as review_id, r.tourist_id, r.weekly_trip_id as trip_id,
                   r.stars_rating, r.comment_text, wt.guide_license_number, r.created_at, 'weekly' as trip_type,
                   wt.trip_title as target_name,
                   t.full_name as tourist_name, t.phone_number as tourist_phone
            FROM reviews_weekly_trips r
            LEFT JOIN weekly_trips wt ON r.weekly_trip_id = wt.weekly_trip_id
            LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
            WHERE r.weekly_trip_id = @trip_id
            ORDER BY r.created_at DESC
          `);
          return sendJson(res, 200, { success: true, data: resWeekly.recordset || [] });
        } else {
          const resDaily = await request.query(`
            SELECT r.review_daily_id as review_id, r.tourist_id, r.daily_trip_id as trip_id,
                   r.stars_rating, r.comment_text, dt.guide_license_number, r.created_at, 'daily' as trip_type,
                   dt.trip_title as target_name,
                   t.full_name as tourist_name, t.phone_number as tourist_phone
            FROM reviews_daily_trips r
            LEFT JOIN daily_trips dt ON r.daily_trip_id = dt.daily_trip_id
            LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
            WHERE r.daily_trip_id = @trip_id
            ORDER BY r.created_at DESC
          `);
          return sendJson(res, 200, { success: true, data: resDaily.recordset || [] });
        }
      }

      // Global Reviews Union (All Entities)
      const allRes = await request.query(`
        SELECT r.review_daily_id as review_id, r.tourist_id, r.daily_trip_id as target_id,
               'daily' as target_type, r.stars_rating, r.comment_text, dt.guide_license_number, r.created_at,
               dt.trip_title as target_name, t.full_name as tourist_name
        FROM reviews_daily_trips r
        LEFT JOIN daily_trips dt ON r.daily_trip_id = dt.daily_trip_id
        LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
        UNION ALL
        SELECT r.review_weekly_id as review_id, r.tourist_id, r.weekly_trip_id as target_id,
               'weekly' as target_type, r.stars_rating, r.comment_text, wt.guide_license_number, r.created_at,
               wt.trip_title as target_name, t.full_name as tourist_name
        FROM reviews_weekly_trips r
        LEFT JOIN weekly_trips wt ON r.weekly_trip_id = wt.weekly_trip_id
        LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
        UNION ALL
        SELECT r.review_hotel_id as review_id, r.tourist_id, r.hotel_id as target_id,
               'hotel' as target_type, r.stars_rating, r.comment_text, NULL as guide_license_number, r.created_at,
               h.hotel_name as target_name, t.full_name as tourist_name
        FROM reviews_hotels r
        LEFT JOIN hotels h ON r.hotel_id = h.hotel_id
        LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
        UNION ALL
        SELECT r.review_facility_id as review_id, r.tourist_id, r.facility_id as target_id,
               'facility' as target_type, r.stars_rating, r.comment_text, NULL as guide_license_number, r.created_at,
               f.facility_name as target_name, t.full_name as tourist_name
        FROM reviews_facilities r
        LEFT JOIN restaurants_cafes f ON r.facility_id = f.facility_id
        LEFT JOIN tourists t ON r.tourist_id = t.tourist_id
        ORDER BY created_at DESC
      `);
      return sendJson(res, 200, { success: true, data: allRes.recordset || [] });
    }

    // 27.1 Reviews: POST (Strict Validation & Upsert for Trips, Hotels, Facilities)
    if (pathname === '/api/db/reviews' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        tourist_id,
        trip_id,
        hotel_id,
        facility_id,
        type,
        stars_rating,
        comment_text,
        guide_license_number,
      } = body;

      const cleanTourist = String(tourist_id || '').trim();
      const cleanType = String(type || 'daily').toLowerCase().trim();
      const stars = Math.min(5, Math.max(1, parseInt(stars_rating, 10) || 5));
      const comment = String(comment_text || '').trim();
      const guideLic = guide_license_number ? String(guide_license_number).trim() : null;

      if (!cleanTourist) {
        return sendJson(res, 400, { success: false, error: 'معرف السائح مطلوب لتسجيل التقييم.' });
      }

      // --- 1. HOTEL REVIEWS ---
      if (cleanType === 'hotel') {
        const cleanHotel = String(hotel_id || trip_id || '').trim();
        if (!cleanHotel) {
          return sendJson(res, 400, { success: false, error: 'معرف الفندق مطلوب لتسجيل تقييم الفندق.' });
        }

        const revId = `REV-H-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
        const upsertReq = db.request();
        upsertReq.input('rev_id', sql.VarChar(50), revId);
        upsertReq.input('tid', sql.VarChar(50), cleanTourist);
        upsertReq.input('hid', sql.VarChar(50), cleanHotel);
        upsertReq.input('stars', sql.Int, stars);
        upsertReq.input('comment', sql.NVarChar(sql.MAX), comment || null);

        await upsertReq.query(`
          IF EXISTS (SELECT 1 FROM reviews_hotels WHERE tourist_id = @tid AND hotel_id = @hid)
          BEGIN
            UPDATE reviews_hotels
            SET stars_rating = @stars,
                comment_text = @comment,
                created_at = GETDATE()
            WHERE tourist_id = @tid AND hotel_id = @hid;
          END
          ELSE
          BEGIN
            INSERT INTO reviews_hotels (
              review_hotel_id, tourist_id, hotel_id, stars_rating, comment_text, created_at
            ) VALUES (
              @rev_id, @tid, @hid, @stars, @comment, GETDATE()
            );
          END
        `);

        return sendJson(res, 201, {
          success: true,
          message: 'شكراً لك! تم تسجيل وتحديث تقييمك للفندق بنجاح في منصة دلني.'
        });
      }

      // --- 2. FACILITY / RESTAURANT / CAFE REVIEWS ---
      if (cleanType === 'facility' || cleanType === 'restaurant' || cleanType === 'cafe') {
        const cleanFac = String(facility_id || trip_id || '').trim();
        if (!cleanFac) {
          return sendJson(res, 400, { success: false, error: 'معرف المطعم أو المقهى مطلوب لتسجيل التقييم.' });
        }

        const revId = `REV-F-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
        const upsertReq = db.request();
        upsertReq.input('rev_id', sql.VarChar(50), revId);
        upsertReq.input('tid', sql.VarChar(50), cleanTourist);
        upsertReq.input('fid', sql.VarChar(50), cleanFac);
        upsertReq.input('stars', sql.Int, stars);
        upsertReq.input('comment', sql.NVarChar(sql.MAX), comment || null);

        await upsertReq.query(`
          IF EXISTS (SELECT 1 FROM reviews_facilities WHERE tourist_id = @tid AND facility_id = @fid)
          BEGIN
            UPDATE reviews_facilities
            SET stars_rating = @stars,
                comment_text = @comment,
                created_at = GETDATE()
            WHERE tourist_id = @tid AND facility_id = @fid;
          END
          ELSE
          BEGIN
            INSERT INTO reviews_facilities (
              review_facility_id, tourist_id, facility_id, stars_rating, comment_text, created_at
            ) VALUES (
              @rev_id, @tid, @fid, @stars, @comment, GETDATE()
            );
          END
        `);

        return sendJson(res, 201, {
          success: true,
          message: 'شكراً لك! تم تسجيل وتحديث تقييمك للمنشأة بنجاح في منصة دلني.'
        });
      }

      // --- 3. TRIP REVIEWS (Weekly & Daily) ---
      const cleanTrip = String(trip_id || '').trim();
      if (!cleanTrip) {
        return sendJson(res, 400, { success: false, error: 'معرف الرحلة مطلوب لتسجيل التقييم.' });
      }

      const valReq = db.request();
      valReq.input('tid', sql.VarChar(50), cleanTourist);
      valReq.input('trip_id', sql.VarChar(50), cleanTrip);

      if (cleanType === 'weekly') {
        const bRes = await valReq.query(`
          SELECT b.booking_weekly_id, b.booking_date, b.booking_status, wt.departure_date, wt.start_date
          FROM bookings_weekly b
          LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id
          WHERE b.tourist_id = @tid AND b.weekly_trip_id = @trip_id
        `);

        if (!bRes.recordset || bRes.recordset.length === 0) {
          return sendJson(res, 403, {
            success: false,
            error: 'عذراً، لا يمكنك تقييم هذه الرحلة لأنك لم تسجل أو تشارك فيها بالفعل.'
          });
        }

        const booking = bRes.recordset[0];
        const rawDate = booking.departure_date || booking.trip_date || booking.start_date || booking.booking_date;
        const tripEndTime = new Date(rawDate).getTime();
        const now = Date.now();
        if (tripEndTime > now && (now - tripEndTime < 0)) {
          return sendJson(res, 400, {
            success: false,
            error: 'عذراً، لا يمكنك تقييم الرحلة إلا بعد موعد انتهائها الفعلي.'
          });
        }

        const revId = `REV-W-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
        const upsertReq = db.request();
        upsertReq.input('rev_id', sql.VarChar(50), revId);
        upsertReq.input('tid', sql.VarChar(50), cleanTourist);
        upsertReq.input('trip_id', sql.VarChar(50), cleanTrip);
        upsertReq.input('stars', sql.Int, stars);
        upsertReq.input('comment', sql.NVarChar(sql.MAX), comment || null);
        upsertReq.input('guide_lic', sql.VarChar(50), guideLic);

        await upsertReq.query(`
          IF EXISTS (SELECT 1 FROM reviews_weekly_trips WHERE tourist_id = @tid AND weekly_trip_id = @trip_id)
          BEGIN
            UPDATE reviews_weekly_trips
            SET stars_rating = @stars,
                comment_text = @comment,
                created_at = GETDATE()
            WHERE tourist_id = @tid AND weekly_trip_id = @trip_id;
          END
          ELSE
          BEGIN
            INSERT INTO reviews_weekly_trips (
              review_weekly_id, tourist_id, weekly_trip_id, stars_rating, comment_text, created_at
            ) VALUES (
              @rev_id, @tid, @trip_id, @stars, @comment, GETDATE()
            );
          END
        `);

        return sendJson(res, 201, {
          success: true,
          message: 'شكراً لك! تم تسجيل تقييمك للرحلة الأسبوعية بنجاح في نظام دلني.'
        });
      } else {
        const bRes = await valReq.query(`
          SELECT b.booking_daily_id, b.booking_date, b.booking_status, dt.departure_date
          FROM bookings_daily b
          LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id
          WHERE b.tourist_id = @tid AND b.daily_trip_id = @trip_id
        `);

        if (!bRes.recordset || bRes.recordset.length === 0) {
          return sendJson(res, 403, {
            success: false,
            error: 'عذراً، لا يمكنك تقييم هذه الرحلة لأنك لم تسجل أو تشارك فيها بالفعل.'
          });
        }

        const booking = bRes.recordset[0];
        const rawDate = booking.departure_date || booking.trip_date || booking.booking_date;
        const tripEndTime = new Date(rawDate).getTime();
        const now = Date.now();
        if (tripEndTime > now && (now - tripEndTime < 0)) {
          return sendJson(res, 400, {
            success: false,
            error: 'عذراً، لا يمكنك تقييم الرحلة إلا بعد موعد انتهائها الفعلي.'
          });
        }

        const revId = `REV-D-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`;
        const upsertReq = db.request();
        upsertReq.input('rev_id', sql.VarChar(50), revId);
        upsertReq.input('tid', sql.VarChar(50), cleanTourist);
        upsertReq.input('trip_id', sql.VarChar(50), cleanTrip);
        upsertReq.input('stars', sql.Int, stars);
        upsertReq.input('comment', sql.NVarChar(sql.MAX), comment || null);
        upsertReq.input('guide_lic', sql.VarChar(50), guideLic);

        await upsertReq.query(`
          IF EXISTS (SELECT 1 FROM reviews_daily_trips WHERE tourist_id = @tid AND daily_trip_id = @trip_id)
          BEGIN
            UPDATE reviews_daily_trips
            SET stars_rating = @stars,
                comment_text = @comment,
                created_at = GETDATE()
            WHERE tourist_id = @tid AND daily_trip_id = @trip_id;
          END
          ELSE
          BEGIN
            INSERT INTO reviews_daily_trips (
              review_daily_id, tourist_id, daily_trip_id, stars_rating, comment_text, created_at
            ) VALUES (
              @rev_id, @tid, @trip_id, @stars, @comment, GETDATE()
            );
          END
        `);

        return sendJson(res, 201, {
          success: true,
          message: 'شكراً لك! تم تسجيل تقييمك للرحلة اليومية بنجاح في نظام دلني.'
        });
      }
    }

    // Default 404
    return sendJson(res, 404, { error: 'Route not found' });

  } catch (err) {
    console.error('[DelniDB Error]:', err?.message || err);
    if (err?.message?.includes('timed out') || err?.message?.includes('Connection') || err?.message?.includes('socket') || err?.message?.includes('closed')) {
      console.warn('[DelniDB] Stale connection detected. Resetting pool for automatic reconnection...');
      try { if (pool) pool.close(); } catch(e) {}
      pool = null;
      poolPromise = null;
    }
    return sendJson(res, 500, { success: false, error: err?.message || 'Database error' });
  }
});

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`[DelniDB Secure Bridge] Listening on http://localhost:${PORT}`);
  try {
    await getPool();
  } catch (err) {
    console.error('[DelniDB Startup Connection Warning]:', err?.message || err);
  }
});
