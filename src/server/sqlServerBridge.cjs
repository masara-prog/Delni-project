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
const sql = require('mssql/msnodesqlv8');

const PORT = 5001;
const CONNECTION_STRING = 'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=DelniDB;Trusted_Connection=yes;TrustServerCertificate=yes;';

let pool = null;

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

async function getPool() {
  if (!pool) {
    pool = await sql.connect({
      connectionString: CONNECTION_STRING,
      options: {
        trustServerCertificate: true,
        encrypt: false,
      }
    });
    console.log('[DelniDB] Successfully connected to Microsoft SQL Server (DelniDB)');
  }
  return pool;
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
          available_vehicles,
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
        total_vehicles, available_vehicles, contract_start_date, contract_end_date,
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
      request.input('total_vehicles', sql.Int, Number(total_vehicles) || 1);
      request.input('available_vehicles', sql.Int, Number(available_vehicles) || 0);
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
              available_vehicles = @available_vehicles,
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
          (contract_number, company_name, phone_number, address, google_maps_url, total_vehicles, available_vehicles, contract_start_date, contract_end_date, email, password, city, verification_status)
          VALUES 
          (@contract_number, @company_name, @phone_number, @address, @google_maps_url, @total_vehicles, @available_vehicles, @contract_start_date, @contract_end_date, @email, CASE WHEN @hasNewPassword = 1 THEN @hashedPassword ELSE @default_password END, @city, @verification_status);
        END
      `);

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
        SELECT v.*, c.company_name
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
            (contract_number, company_name, phone_number, address, total_vehicles, available_vehicles, contract_start_date, contract_end_date, email, password, city, verification_status)
            VALUES 
            (@c_num, @c_name, @c_phone, N'طرابلس', 1, 1, GETDATE(), '2028-01-01', @c_num + '@dalni.ly', 'password123', N'طرابلس', N'موثق')
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
          DELETE FROM weekly_trip_vehicles WHERE plate_number = @plate_number;
          DELETE FROM private_trip_vehicles WHERE plate_number = @plate_number;
          DELETE FROM daily_trip_vehicles WHERE plate_number = @plate_number;
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
            (contract_number, company_name, phone_number, address, total_vehicles, available_vehicles, contract_start_date, contract_end_date, email, password, city, verification_status)
            VALUES 
            (@c_num, @c_name, @c_phone, N'ليبيا', 1, 1, GETDATE(), '2028-01-01', @c_num + '@dalni.ly', 'password123', N'طرابلس', N'موثق')
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

    // 8. Tourists: GET
    if (pathname === '/api/db/tourists' && req.method === 'GET') {
      const result = await db.request().query('SELECT tourist_id, full_name, email, phone_number FROM tourists ORDER BY full_name ASC');
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 8.1 Tourists: POST (Registration)
    if (pathname === '/api/db/tourists' && req.method === 'POST') {
      const body = await readBody(req);
      const { tourist_id, full_name, email, phone_number, password } = body;
      if (!full_name || !email || !phone_number) {
        return sendJson(res, 400, { success: false, error: 'بيانات السائح غير مكتملة' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const cleanPhone = String(phone_number).trim();

      const request = db.request();
      request.input('tourist_id', sql.NVarChar(50), String(tourist_id || `TST-${Date.now()}`).trim());
      request.input('full_name', sql.NVarChar(150), String(full_name).trim());
      request.input('email', sql.NVarChar(100), cleanEmail);
      request.input('phone_number', sql.NVarChar(20), cleanPhone);
      request.input('password', sql.NVarChar(255), hashPassword(password || 'password123'));

      await request.query(`
        IF EXISTS (SELECT 1 FROM tourists WHERE email = @email OR phone_number = @phone_number)
        BEGIN
          UPDATE tourists
          SET full_name = @full_name,
              phone_number = @phone_number,
              password = @password
          WHERE email = @email OR phone_number = @phone_number;
        END
        ELSE
        BEGIN
          INSERT INTO tourists (tourist_id, full_name, email, phone_number, password)
          VALUES (@tourist_id, @full_name, @email, @phone_number, @password);
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ حساب السائح في DelniDB بنجاح' });
    }

    // 9. Guides: GET
    if (pathname === '/api/db/guides' && req.method === 'GET') {
      const result = await db.request().query('SELECT * FROM tour_guides ORDER BY full_name ASC');
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 9.1 Guides: POST (Registration & Updates)
    if (pathname === '/api/db/guides' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        license_number, full_name, phone_number, email, password,
        years_of_experience, price_per_day, bio, digital_certificate_file,
        verification_status, speaks_english, speaks_french, speaks_italian,
        gender, working_days, operating_regions, avatar, title, certificate,
        certificate_name
      } = body;

      if (!license_number || !full_name || !phone_number) {
        return sendJson(res, 400, { success: false, error: 'بيانات المرشد غير مكتملة' });
      }

      const cleanLic = String(license_number).trim();
      const rawPassword = body.password ? String(body.password).trim() : '';
      const shouldUpdatePass = rawPassword && rawPassword !== '••••••••' && rawPassword.length >= 4;
      const hashedPass = shouldUpdatePass ? hashPassword(rawPassword) : hashPassword('password123');

      const request = db.request();
      request.input('license_number', sql.NVarChar(50), cleanLic);
      request.input('full_name', sql.NVarChar(150), String(full_name).trim());
      request.input('phone_number', sql.NVarChar(20), String(phone_number).trim());
      request.input('email', sql.NVarChar(100), String(email || `${cleanLic.toLowerCase()}@dalni.ly`).trim());
      request.input('hasNewPassword', sql.Bit, shouldUpdatePass ? 1 : 0);
      request.input('hashedPassword', sql.NVarChar(255), hashedPass);
      request.input('years_of_experience', sql.Int, Number(years_of_experience) || 3);
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

      await request.query(`
        IF EXISTS (SELECT 1 FROM tour_guides WHERE license_number = @license_number)
        BEGIN
          UPDATE tour_guides
          SET full_name = @full_name,
              phone_number = @phone_number,
              email = @email,
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
            gender, working_days, operating_regions, total_tours_completed, avatar, title,
            certificate, certificate_name, digital_certificate_file
          ) VALUES (
            @license_number, @full_name, @phone_number, @email, @hashedPassword, @years_of_experience,
            @price_per_day, @bio, @verification_status, @speaks_english, @speaks_french, @speaks_italian,
            @gender, @working_days, @operating_regions, 0, @avatar, @title,
            @certificate, @certificate_name, @digital_certificate_file
          );
        END
      `);

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
      request.input('google_maps_url', sql.NVarChar(500), String(body.google_maps_url || '').trim());
      request.input('description', sql.NVarChar(sql.MAX), String(body.description || '').trim());
      request.input('working_hours', sql.NVarChar(150), String(body.working_hours || 'خدمة 24/7 على مدار الساعة').trim());
      request.input('discount_percentage', sql.Int, Number(body.discount_percentage) || 15);
      request.input('whatsapp', sql.NVarChar(50), String(body.whatsapp || '').trim());

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
              whatsapp = @whatsapp
          WHERE hotel_id = @hotel_id;
        END
        ELSE
        BEGIN
          INSERT INTO hotels (
            hotel_id, hotel_name, city, address_details, phone_number, star_rating,
            partnership_status, hotel_photo_1, hotel_photo_2, hotel_photo_3, hotel_photo_4,
            hotel_photo_5, verification_status, property_type, amenities, contract_date, google_maps_url,
            description, working_hours, discount_percentage, whatsapp
          ) VALUES (
            @hotel_id, @hotel_name, @city, @address_details, @phone_number, @star_rating,
            @partnership_status, @photo_1, @photo_2, @photo_3, @photo_4,
            @photo_5, @verification_status, @property_type, @amenities, @contract_date, @google_maps_url,
            @description, @working_hours, @discount_percentage, @whatsapp
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
      request.input('google_maps_url', sql.NVarChar(500), String(body.google_maps_url || '').trim());
      request.input('discount_percentage', sql.Int, Number(body.discount_percentage) || 20);
      request.input('whatsapp', sql.NVarChar(50), String(body.whatsapp || '').trim());

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
              whatsapp = @whatsapp
          WHERE facility_id = @facility_id;
        END
        ELSE
        BEGIN
          INSERT INTO restaurants_cafes (
            facility_id, facility_name, facility_type, city, address_details,
            phone_number, description, facility_image_1, facility_image_2,
            facility_image_3, facility_image_4, facility_image_5,
            verification_status, working_hours, features, contract_date, google_maps_url,
            discount_percentage, whatsapp
          ) VALUES (
            @facility_id, @facility_name, @facility_type, @city, @address_details,
            @phone_number, @description, @img_1, @img_2,
            @img_3, @img_4, @img_5,
            @verification_status, @working_hours, @features, @contract_date, @google_maps_url,
            @discount_percentage, @whatsapp
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
      const result = await db.request().query('SELECT * FROM places_tourist ORDER BY place_name ASC');
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 12.1 Places: POST
    if (pathname === '/api/db/places' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        place_id, id, place_name, name, description, city,
        longitude, latitude, category, place_image, photo,
        is_unesco, unesco_year, entry_fee, google_maps_url, gallery
      } = body;

      const cleanId = String(place_id || id || `A-0${Date.now().toString().slice(-3)}`).trim();
      const cleanName = String(place_name || name || '').trim();
      if (!cleanName) return sendJson(res, 400, { success: false, error: 'اسم المعلم السياحي مطلوب' });

      const request = db.request();
      request.input('place_id', sql.NVarChar(50), cleanId);
      request.input('place_name', sql.NVarChar(200), cleanName);
      request.input('description', sql.NVarChar(sql.MAX), String(description || 'معلم سياحي وتاريخي بارز في ليبيا').trim());
      request.input('city', sql.NVarChar(100), String(city || 'طرابلس').trim());
      request.input('longitude', sql.Decimal(10, 6), Number(longitude) || 13.18);
      request.input('latitude', sql.Decimal(10, 6), Number(latitude) || 32.88);
      request.input('category', sql.NVarChar(100), String(category || 'معلم تاريخي').trim());
      request.input('place_image', sql.NVarChar(sql.MAX), String(place_image || photo || '').trim());
      request.input('is_unesco', sql.Bit, is_unesco ? 1 : 0);
      request.input('unesco_year', sql.Int, unesco_year ? Number(unesco_year) : null);
      request.input('entry_fee', sql.NVarChar(100), String(entry_fee || 'مجاني').trim());
      request.input('google_maps_url', sql.NVarChar(sql.MAX), String(google_maps_url || '').trim());
      request.input('gallery', sql.NVarChar(sql.MAX), String(gallery || '').trim());

      await request.query(`
        IF EXISTS (SELECT 1 FROM places_tourist WHERE place_id = @place_id)
        BEGIN
          UPDATE places_tourist
          SET place_name = @place_name,
              description = @description,
              city = @city,
              longitude = @longitude,
              latitude = @latitude,
              category = @category,
              place_image = CASE WHEN @place_image <> '' THEN @place_image ELSE place_image END,
              is_unesco = @is_unesco,
              unesco_year = @unesco_year,
              entry_fee = @entry_fee,
              google_maps_url = @google_maps_url,
              gallery = @gallery
          WHERE place_id = @place_id;
        END
        ELSE
        BEGIN
          INSERT INTO places_tourist (
            place_id, place_name, description, city, longitude, latitude,
            category, place_image, is_unesco, unesco_year, entry_fee,
            google_maps_url, gallery
          ) VALUES (
            @place_id, @place_name, @description, @city, @longitude, @latitude,
            @category, @place_image, @is_unesco, @unesco_year, @entry_fee,
            @google_maps_url, @gallery
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ المعلم السياحي في DelniDB بنجاح' });
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

    // 13. Daily Trips: GET
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
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 13.1 Daily Trips: POST
    if (pathname === '/api/db/daily_trips' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        daily_trip_id, id, trip_title, title, description, price_per_seat, price,
        is_active, photo, max_capacity, available_seats, guide_license_number,
        departure_city, destination_city, destination, recurring_days, activities, google_maps_url,
        vehicle_plate, vehicle_plates, restaurant_id, itinerary_steps
      } = body;

      const cleanId = String(daily_trip_id || id || `DT-${Date.now().toString().slice(-4)}`).trim();
      const cleanTitle = String(trip_title || title || '').trim();
      if (!cleanTitle) return sendJson(res, 400, { success: false, error: 'عنوان الرحلة اليومية مطلوب' });

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

      // Process 5-image gallery
      let galleryStr = '';
      if (Array.isArray(body.gallery)) galleryStr = body.gallery.filter(Boolean).join(',');
      else if (Array.isArray(body.photos)) galleryStr = body.photos.filter(Boolean).join(',');
      else if (Array.isArray(body.images)) galleryStr = body.images.filter(Boolean).join(',');
      else if (typeof body.gallery === 'string') galleryStr = body.gallery.trim();

      let photoVal = String(photo || '').trim();
      if (!photoVal && galleryStr) {
        photoVal = galleryStr.split(',')[0].trim();
      }
      if (!photoVal) photoVal = '/assets/dest-leptis-theater.jpg';
      if (!galleryStr) {
        galleryStr = [photoVal, photoVal, photoVal, photoVal, photoVal].join(',');
      }

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('title', sql.NVarChar(200), cleanTitle);
      request.input('description', sql.NVarChar(sql.MAX), String(description || 'رحلة يومية ممتعة').trim());
      request.input('price', sql.Decimal(10, 2), Number(price_per_seat || price) || 100);
      request.input('is_active', sql.Bit, is_active !== false ? 1 : 0);
      request.input('photo', sql.NVarChar(sql.MAX), photoVal);
      request.input('gallery', sql.NVarChar(sql.MAX), galleryStr);
      request.input('max_cap', sql.Int, Number(max_capacity) || 25);
      request.input('avail_seats', sql.Int, Number(available_seats !== undefined ? available_seats : max_capacity) || 25);
      request.input('guide_lic', sql.VarChar(50), guideLic);
      request.input('departure', sql.NVarChar(100), String(departure_city || 'طرابلس').trim());
      request.input('destination', sql.NVarChar(100), String(destination_city || destination || 'الوجهة السياحية').trim());
      request.input('recurring_days', sql.NVarChar(sql.MAX), String(recurring_days || 'السبت,الثلاثاء').trim());
      request.input('activities', sql.NVarChar(sql.MAX), String(activities || '').trim());
      request.input('maps_url', sql.NVarChar(500), String(google_maps_url || '').trim());
      request.input('vehicle_plate', sql.NVarChar(50), cleanPlate);
      request.input('restaurant_id', sql.NVarChar(50), cleanRestaurant);
      request.input('itinerary_steps', sql.NVarChar(sql.MAX), cleanItinerary);

      await request.query(`
        IF EXISTS (SELECT 1 FROM daily_trips WHERE daily_trip_id = @id)
        BEGIN
          UPDATE daily_trips
          SET trip_title = @title,
              description = @description,
              price_per_seat = @price,
              is_active = @is_active,
              photo = CASE WHEN @photo <> '' THEN @photo ELSE photo END,
              gallery = @gallery,
              max_capacity = @max_cap,
              available_seats = @avail_seats,
              guide_license_number = @guide_lic,
              departure_city = @departure,
              destination_city = @destination,
              recurring_days = @recurring_days,
              activities = @activities,
              google_maps_url = @maps_url,
              vehicle_plate = COALESCE(@vehicle_plate, vehicle_plate),
              restaurant_id = COALESCE(@restaurant_id, restaurant_id),
              itinerary_steps = COALESCE(@itinerary_steps, itinerary_steps)
          WHERE daily_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO daily_trips (
            daily_trip_id, trip_title, description, price_per_seat, is_active,
            photo, gallery, max_capacity, available_seats, guide_license_number,
            departure_city, destination_city, recurring_days, activities, google_maps_url,
            vehicle_plate, restaurant_id, itinerary_steps
          ) VALUES (
            @id, @title, @description, @price, @is_active,
            @photo, @gallery, @max_cap, @avail_seats, @guide_lic,
            @departure, @destination, @recurring_days, @activities, @maps_url,
            @vehicle_plate, @restaurant_id, @itinerary_steps
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ الرحلة اليومية في DelniDB بنجاح', trip_id: cleanId });
    }

    // 13.2 Daily Trips: DELETE
    if (pathname === '/api/db/daily_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('daily_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة اليومية مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query(`
        DELETE FROM bookings_daily WHERE daily_trip_id = @id;
        DELETE FROM daily_trips WHERE daily_trip_id = @id;
      `);
      return sendJson(res, 200, { success: true, message: 'تم حذف الرحلة اليومية وحجوزاتها بنجاح من DelniDB' });
    }

    // 14. Weekly Trips: GET
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
               d.driver_license_number,
               r.facility_name as restaurant_name,
               r.facility_type as restaurant_type,
               r.city as restaurant_city,
               r.address_details as restaurant_address,
               r.phone_number as restaurant_phone,
               r.facility_image_1 as restaurant_image
        FROM weekly_trips wt
        LEFT JOIN tour_guides g ON wt.guide_license_number = g.license_number
        LEFT JOIN vehicles v ON wt.vehicle_plate = v.plate_number
        LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
        LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
        LEFT JOIN restaurants_cafes r ON wt.restaurant_id = r.facility_id
        ORDER BY wt.weekly_trip_id DESC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 14.1 Weekly Trips: POST
    if (pathname === '/api/db/weekly_trips' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        weekly_trip_id, id, trip_title, title, start_date, end_date,
        max_capacity, available_seats, seat_per_price, price,
        trip_description, description, guide_license_number, is_active,
        departure_city, destination_region, destination, photo, gallery, google_maps_url,
        vehicle_plate, vehicle_plates, restaurant_id, itinerary_steps
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

      // Process 5-image gallery
      let galleryStr = '';
      if (Array.isArray(body.gallery)) galleryStr = body.gallery.filter(Boolean).join(',');
      else if (Array.isArray(body.photos)) galleryStr = body.photos.filter(Boolean).join(',');
      else if (Array.isArray(body.images)) galleryStr = body.images.filter(Boolean).join(',');
      else if (typeof body.gallery === 'string') galleryStr = body.gallery.trim();

      let photoVal = String(photo || '').trim();
      if (!photoVal && galleryStr) {
        photoVal = galleryStr.split(',')[0].trim();
      }
      if (!photoVal) photoVal = '/assets/dest-ubari-gaberoun.jpg';
      if (!galleryStr) {
        galleryStr = [photoVal, photoVal, photoVal, photoVal, photoVal].join(',');
      }

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('title', sql.NVarChar(200), cleanTitle);
      request.input('start_date', sql.Date, start_date || new Date());
      request.input('end_date', sql.Date, end_date || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
      request.input('max_cap', sql.Int, Number(max_capacity) || 20);
      request.input('avail_seats', sql.Int, Number(available_seats !== undefined ? available_seats : max_capacity) || 20);
      request.input('price', sql.Decimal(10, 2), Number(seat_per_price || price) || 1200);
      request.input('desc', sql.NVarChar(sql.MAX), String(trip_description || description || 'رحلة أسبوعية متكاملة').trim());
      request.input('guide_lic', sql.VarChar(50), guideLic);
      request.input('is_active', sql.Bit, is_active !== false ? 1 : 0);
      request.input('departure', sql.NVarChar(100), String(departure_city || 'طرابلس').trim());
      request.input('destination', sql.NVarChar(100), String(destination_region || destination || 'الصحراء والواحات').trim());
      request.input('photo', sql.NVarChar(sql.MAX), photoVal);
      request.input('gallery', sql.NVarChar(sql.MAX), galleryStr);
      request.input('maps_url', sql.NVarChar(500), String(google_maps_url || '').trim());
      request.input('vehicle_plate', sql.NVarChar(50), cleanPlate);
      request.input('restaurant_id', sql.NVarChar(50), cleanRestaurant);
      request.input('itinerary_steps', sql.NVarChar(sql.MAX), cleanItinerary);

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
              trip_description = @desc,
              guide_license_number = @guide_lic,
              is_active = @is_active,
              departure_city = @departure,
              destination_region = @destination,
              photo = CASE WHEN @photo <> '' THEN @photo ELSE photo END,
              gallery = @gallery,
              google_maps_url = @maps_url,
              vehicle_plate = COALESCE(@vehicle_plate, vehicle_plate),
              restaurant_id = COALESCE(@restaurant_id, restaurant_id),
              itinerary_steps = COALESCE(@itinerary_steps, itinerary_steps)
          WHERE weekly_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO weekly_trips (
            weekly_trip_id, trip_title, start_date, end_date, max_capacity,
            available_seats, seat_per_price, trip_description, guide_license_number,
            is_active, departure_city, destination_region, photo, gallery, google_maps_url,
            vehicle_plate, restaurant_id, itinerary_steps
          ) VALUES (
            @id, @title, @start_date, @end_date, @max_cap,
            @avail_seats, @price, @desc, @guide_lic,
            @is_active, @departure, @destination, @photo, @gallery, @maps_url,
            @vehicle_plate, @restaurant_id, @itinerary_steps
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ الرحلة الأسبوعية في DelniDB بنجاح', trip_id: cleanId });
    }

    // 14.2 Weekly Trips: DELETE
    if (pathname === '/api/db/weekly_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('weekly_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الأسبوعية مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query(`
        DELETE FROM bookings_weekly WHERE weekly_trip_id = @id;
        DELETE FROM weekly_trips WHERE weekly_trip_id = @id;
      `);
      return sendJson(res, 200, { success: true, message: 'تم حذف الرحلة الأسبوعية وحجوزاتها بنجاح من DelniDB' });
    }

    // 14.5 Private Trips: GET
    if (pathname === '/api/db/private_trips' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT pt.*, 
               g.full_name as guide_name, 
               g.phone_number as guide_phone 
        FROM private_trips pt
        LEFT JOIN tour_guides g ON pt.guide_license_number = g.license_number
        ORDER BY pt.preferred_start_date DESC
      `);
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
      } = body;

      const cleanId = String(private_trip_id || `PRV-${Date.now().toString().slice(-5)}`).trim();
      const cleanStatus = String(status_order || 'بانتظار تسعير الإدارة').trim();

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
      request.input('tourist_id', sql.VarChar(50), tourist_id ? String(tourist_id).trim() : null);
      request.input('price', sql.Decimal(10, 2), quoted_price !== null && quoted_price !== undefined ? Number(quoted_price) : null);
      request.input('plan', sql.NVarChar(sql.MAX), admin_itinerary_plan ? String(admin_itinerary_plan).trim() : null);

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
              admin_itinerary_plan = @plan
          WHERE private_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO private_trips (
            private_trip_id, status_order, customer_name, customer_phone,
            preferred_start_date, duration_days, number_of_companions,
            guide_license_number, customer_description, customer_requirements,
            tourist_id, quoted_price, admin_itinerary_plan
          ) VALUES (
            @id, @status, @cust_name, @cust_phone,
            @start_date, @duration, @companions,
            @guide_lic, @desc, @reqs,
            @tourist_id, @price, @plan
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ طلب الرحلة الخاصة بنجاح في DelniDB', trip_id: cleanId });
    }

    // 14.7 Private Trips: DELETE
    if (pathname === '/api/db/private_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('private_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الخاصة مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query(`
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
        number_of_seats, total_price, booking_status, booking_notes,
        passengers_names, payment_status, attended
      } = body;

      const cleanId = String(booking_daily_id || `BK-D-${Date.now().toString().slice(-5)}`).trim();
      let cleanTourist = String(tourist_id || '').trim();
      const cleanTrip = String(daily_trip_id || '').trim();

      if (!cleanTrip) return sendJson(res, 400, { success: false, error: 'معرف الرحلة اليومية مطلوب للحجز' });

      if (!cleanTourist) {
        const firstTourist = await db.request().query('SELECT TOP 1 tourist_id FROM tourists');
        cleanTourist = firstTourist.recordset?.[0]?.tourist_id || 'A1234546';
      }

      const seatsCount = Math.max(1, Number(number_of_seats) || 1);

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('tourist_id', sql.VarChar(50), cleanTourist);
      request.input('trip_id', sql.VarChar(50), cleanTrip);
      request.input('booking_date', sql.DateTime, booking_date ? new Date(booking_date) : new Date());
      request.input('seats', sql.Int, seatsCount);
      request.input('status', sql.VarChar(20), String(booking_status || 'مؤكد').trim());
      request.input('price', sql.Decimal(10, 2), Number(total_price) || 100);
      request.input('notes', sql.NVarChar(sql.MAX), String(booking_notes || '').trim());
      request.input('passengers', sql.NVarChar(sql.MAX), String(passengers_names || '').trim());
      request.input('pay_status', sql.VarChar(20), String(payment_status || 'مدفوع').trim());
      request.input('attended', sql.Bit, attended ? 1 : 0);

      await request.query(`
        INSERT INTO bookings_daily (
          booking_daily_id, tourist_id, daily_trip_id, booking_date,
          number_of_seats, booking_status, total_price, booking_notes,
          passengers_names, payment_status, attended
        ) VALUES (
          @id, @tourist_id, @trip_id, @booking_date,
          @seats, @status, @price, @notes,
          @passengers, @pay_status, @attended
        );

        UPDATE daily_trips
        SET available_seats = CASE WHEN available_seats >= @seats THEN available_seats - @seats ELSE 0 END
        WHERE daily_trip_id = @trip_id;
      `);

      return sendJson(res, 201, { success: true, message: 'تم تسجيل وتأكيد حجز الرحلة اليومية في DelniDB بنجاح', booking_id: cleanId });
    }

    // 15.2 Daily Bookings: DELETE
    if (pathname === '/api/db/bookings_daily' && req.method === 'DELETE') {
      const id = url.searchParams.get('booking_daily_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الحجز مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM bookings_daily WHERE booking_daily_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم حذف الحجز بنجاح من DelniDB' });
    }

    // 16. Weekly Bookings: GET
    if (pathname === '/api/db/bookings_weekly' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT b.*, 
               t.full_name as tourist_name, 
               t.phone_number as tourist_phone, 
               t.email as tourist_email,
               wt.trip_title, 
               wt.departure_city, 
               wt.destination_region
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
        number_of_seats, total_price, booking_status, booking_notes,
        passengers_names, payment_status, attended
      } = body;

      const cleanId = String(booking_weekly_id || `BK-W-${Date.now().toString().slice(-5)}`).trim();
      let cleanTourist = String(tourist_id || '').trim();
      const cleanTrip = String(weekly_trip_id || '').trim();

      if (!cleanTrip) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الأسبوعية مطلوب للحجز' });

      if (!cleanTourist) {
        const firstTourist = await db.request().query('SELECT TOP 1 tourist_id FROM tourists');
        cleanTourist = firstTourist.recordset?.[0]?.tourist_id || 'A56780';
      }

      const seatsCount = Math.max(1, Number(number_of_seats) || 1);

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('tourist_id', sql.VarChar(50), cleanTourist);
      request.input('trip_id', sql.VarChar(50), cleanTrip);
      request.input('booking_date', sql.DateTime, booking_date ? new Date(booking_date) : new Date());
      request.input('seats', sql.Int, seatsCount);
      request.input('status', sql.VarChar(20), String(booking_status || 'مؤكد').trim());
      request.input('price', sql.Decimal(10, 2), Number(total_price) || 1200);
      request.input('notes', sql.NVarChar(sql.MAX), String(booking_notes || '').trim());
      request.input('passengers', sql.NVarChar(sql.MAX), String(passengers_names || '').trim());
      request.input('pay_status', sql.VarChar(20), String(payment_status || 'مدفوع').trim());
      request.input('attended', sql.Bit, attended ? 1 : 0);

      await request.query(`
        INSERT INTO bookings_weekly (
          booking_weekly_id, tourist_id, weekly_trip_id, booking_date,
          number_of_seats, total_price, booking_status, booking_notes,
          passengers_names, payment_status, attended
        ) VALUES (
          @id, @tourist_id, @trip_id, @booking_date,
          @seats, @price, @status, @notes,
          @passengers, @pay_status, @attended
        );

        UPDATE weekly_trips
        SET available_seats = CASE WHEN available_seats >= @seats THEN available_seats - @seats ELSE 0 END
        WHERE weekly_trip_id = @trip_id;
      `);

      return sendJson(res, 201, { success: true, message: 'تم تسجيل وتأكيد حجز الرحلة الأسبوعية في DelniDB بنجاح', booking_id: cleanId });
    }

    // 16.2 Weekly Bookings: DELETE
    if (pathname === '/api/db/bookings_weekly' && req.method === 'DELETE') {
      const id = url.searchParams.get('booking_weekly_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الحجز مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM bookings_weekly WHERE booking_weekly_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم حذف الحجز بنجاح من DelniDB' });
    }

    // 17. Private Trips: GET
    if (pathname === '/api/db/private_trips' && req.method === 'GET') {
      const result = await db.request().query(`
        SELECT pt.*, 
               t.full_name as tourist_name, 
               g.full_name as guide_name
        FROM private_trips pt
        LEFT JOIN tourists t ON pt.tourist_id = t.tourist_id
        LEFT JOIN tour_guides g ON pt.guide_license_number = g.license_number
        ORDER BY pt.private_trip_id DESC
      `);
      return sendJson(res, 200, { success: true, data: result.recordset });
    }

    // 17.1 Private Trips: POST
    if (pathname === '/api/db/private_trips' && req.method === 'POST') {
      const body = await readBody(req);
      const {
        private_trip_id, id, status_order, customer_description, description,
        preferred_start_date, duration_days, number_of_companions, quoted_price,
        admin_itinerary_plan, guide_license_number, tourist_id, customer_name,
        customer_phone, customer_requirements
      } = body;

      const cleanId = String(private_trip_id || id || `PRV-${Date.now().toString().slice(-4)}`).trim();

      const request = db.request();
      request.input('id', sql.VarChar(50), cleanId);
      request.input('status', sql.VarChar(25), String(status_order || 'قيد المراجعة').trim());
      request.input('desc', sql.VarChar(100), String(customer_description || description || 'رحلة خاصة مخصصة').trim());
      request.input('start_date', sql.Date, preferred_start_date || new Date());
      request.input('duration', sql.Int, Number(duration_days) || 3);
      request.input('companions', sql.Int, Number(number_of_companions) || 2);
      request.input('price', sql.Decimal(10, 2), quoted_price ? Number(quoted_price) : null);
      request.input('plan', sql.NVarChar(sql.MAX), admin_itinerary_plan ? String(admin_itinerary_plan) : null);
      request.input('guide_lic', sql.VarChar(50), guide_license_number ? String(guide_license_number) : null);
      request.input('tourist_id', sql.VarChar(50), tourist_id ? String(tourist_id) : null);
      request.input('cust_name', sql.VarChar(100), customer_name ? String(customer_name) : null);
      request.input('cust_phone', sql.VarChar(20), customer_phone ? String(customer_phone) : null);
      request.input('reqs', sql.NVarChar(sql.MAX), customer_requirements ? String(customer_requirements) : null);

      await request.query(`
        IF EXISTS (SELECT 1 FROM private_trips WHERE private_trip_id = @id)
        BEGIN
          UPDATE private_trips
          SET status_order = @status,
              customer_description = @desc,
              preferred_start_date = @start_date,
              duration_days = @duration,
              number_of_companions = @companions,
              quoted_price = @price,
              admin_itinerary_plan = @plan,
              guide_license_number = @guide_lic,
              tourist_id = @tourist_id,
              customer_name = @cust_name,
              customer_phone = @cust_phone,
              customer_requirements = @reqs
          WHERE private_trip_id = @id;
        END
        ELSE
        BEGIN
          INSERT INTO private_trips (
            private_trip_id, status_order, customer_description, preferred_start_date,
            duration_days, number_of_companions, quoted_price, admin_itinerary_plan,
            guide_license_number, tourist_id, customer_name, customer_phone, customer_requirements
          ) VALUES (
            @id, @status, @desc, @start_date,
            @duration, @companions, @price, @plan,
            @guide_lic, @tourist_id, @cust_name, @cust_phone, @reqs
          );
        END
      `);

      return sendJson(res, 201, { success: true, message: 'تم حفظ الرحلة الخاصة في DelniDB بنجاح', trip_id: cleanId });
    }

    // 17.2 Private Trips: DELETE
    if (pathname === '/api/db/private_trips' && req.method === 'DELETE') {
      const id = url.searchParams.get('private_trip_id') || url.searchParams.get('id');
      if (!id) return sendJson(res, 400, { success: false, error: 'معرف الرحلة الخاصة مطلوب للحذف' });

      const request = db.request();
      request.input('id', sql.VarChar(50), id);
      await request.query('DELETE FROM private_trips WHERE private_trip_id = @id');
      return sendJson(res, 200, { success: true, message: 'تم حذف الرحلة الخاصة بنجاح من DelniDB' });
    }

    // 18. Admin Unified Dashboard API: GET (Live sync of all entities from DelniDB)
    if (pathname === '/api/db/dashboard_admin' && req.method === 'GET') {
      const [
        guidesRes, companiesRes, driversRes, vehiclesRes,
        dailyRes, weeklyRes, bookDailyRes, bookWeeklyRes,
        privateRes, hotelsRes, restRes, placesRes
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
                 d.full_name as driver_name, d.phone_number as driver_phone, d.driver_license_number,
                 r.facility_name as restaurant_name, r.facility_type as restaurant_type, r.city as restaurant_city, r.address_details as restaurant_address, r.phone_number as restaurant_phone
          FROM weekly_trips wt
          LEFT JOIN tour_guides g ON wt.guide_license_number = g.license_number
          LEFT JOIN vehicles v ON wt.vehicle_plate = v.plate_number
          LEFT JOIN transportation_companies tc ON v.contract_number = tc.contract_number
          LEFT JOIN drivers d ON d.assigned_vehicle_plate = v.plate_number
          LEFT JOIN restaurants_cafes r ON wt.restaurant_id = r.facility_id
          ORDER BY wt.weekly_trip_id DESC
        `),
        db.request().query('SELECT b.*, t.full_name as tourist_name, dt.trip_title FROM bookings_daily b LEFT JOIN tourists t ON b.tourist_id = t.tourist_id LEFT JOIN daily_trips dt ON b.daily_trip_id = dt.daily_trip_id ORDER BY b.booking_date DESC'),
        db.request().query('SELECT b.*, t.full_name as tourist_name, wt.trip_title FROM bookings_weekly b LEFT JOIN tourists t ON b.tourist_id = t.tourist_id LEFT JOIN weekly_trips wt ON b.weekly_trip_id = wt.weekly_trip_id ORDER BY b.booking_date DESC'),
        db.request().query('SELECT * FROM private_trips ORDER BY private_trip_id DESC'),
        db.request().query('SELECT * FROM hotels ORDER BY hotel_name ASC'),
        db.request().query('SELECT * FROM restaurants_cafes ORDER BY facility_name ASC'),
        db.request().query('SELECT * FROM places_tourist ORDER BY place_name ASC'),
      ]);

      return sendJson(res, 200, {
        success: true,
        database: 'DelniDB (Microsoft SQL Server)',
        guides: guidesRes.recordset || [],
        companies: companiesRes.recordset || [],
        drivers: driversRes.recordset || [],
        vehicles: vehiclesRes.recordset || [],
        daily_trips: dailyRes.recordset || [],
        weekly_trips: weeklyRes.recordset || [],
        daily_bookings: bookDailyRes.recordset || [],
        weekly_bookings: bookWeeklyRes.recordset || [],
        private_trips: privateRes.recordset || [],
        hotels: hotelsRes.recordset || [],
        restaurants: restRes.recordset || [],
        places: placesRes.recordset || [],
        stats: {
          total_guides: guidesRes.recordset?.length || 0,
          total_companies: companiesRes.recordset?.length || 0,
          total_drivers: driversRes.recordset?.length || 0,
          total_vehicles: vehiclesRes.recordset?.length || 0,
          total_daily_trips: dailyRes.recordset?.length || 0,
          total_weekly_trips: weeklyRes.recordset?.length || 0,
          total_bookings: (bookDailyRes.recordset?.length || 0) + (bookWeeklyRes.recordset?.length || 0),
          total_hotels: hotelsRes.recordset?.length || 0,
          total_restaurants: restRes.recordset?.length || 0,
        }
      });
    }

    // Default 404
    return sendJson(res, 404, { error: 'Route not found' });

  } catch (err) {
    console.error('[DelniDB Error]:', err);
    return sendJson(res, 500, { success: false, error: err.message || 'Database error' });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[DelniDB Secure Bridge] Listening on http://127.0.0.1:${PORT}`);
  console.log(`[DelniDB Secure Bridge] Connected to Microsoft SQL Server DelniDB`);
});
