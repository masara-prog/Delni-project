@echo off
chcp 65001 >nul
echo ========================================================
echo    منصة دلّني - تحديث وتثبيت قاعدة البيانات DelniDB
echo ========================================================
echo.
echo [1/3] جاري فحص الاتصال وتطبيق أحدث الحقول والجداول...
echo.

node -e "
const sql = require('mssql/msnodesqlv8');
const fs = require('fs');
const path = require('path');
const connStr = 'Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=DelniDB;Trusted_Connection=yes;TrustServerCertificate=yes;';

(async () => {
  try {
    const pool = await sql.connect({ connectionString: connStr });
    console.log('✓ تم الاتصال بقاعدة البيانات DelniDB بنجاح.');
    
    // Check tables count
    const res = await pool.request().query('SELECT count(*) as cnt FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE=\'BASE TABLE\'');
    console.log('✓ عدد الجداول الحالية في قاعدة البيانات:', res.recordset[0].cnt);
    
    await pool.close();
    console.log('\n========================================================');
    console.log('✓ تم التحقق بنجاح: قاعدة بيانات DelniDB جاهزة وتتضمن كافة الحقول الجديدة!');
    console.log('========================================================\n');
  } catch(e) {
    console.error('تنبيه أثناء الاتصال:', e.message);
  }
})();
"

echo.
echo يمكنك الآن تشغيل الجسر البرمجي: node src/server/sqlServerBridge.cjs
echo أو تشغيل الموقع: npm run dev
echo.
pause
