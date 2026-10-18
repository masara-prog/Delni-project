@echo off
chcp 65001 > nul
title تشغيل منصة دِلني وقاعدة البيانات
color 0A
echo ======================================================================
echo           🚀 تشغيل منصة دِلني (Delni Platform & Database)
echo ======================================================================
echo.

:: 1. التحقق من مسار PHP
where php >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    if exist "C:\xampp\php\php.exe" (
        set "PATH=C:\xampp\php;%PATH%"
        echo [✓] تم تفعيل بيئة PHP من C:\xampp\php
    ) else (
        echo [!] تحذير: لم يتم العثور على PHP في المسار الافتراضي!
    )
) else (
    echo [✓] بيئة PHP جاهزة ومتاحة في النظام.
)

:: 2. التحقق من مجلد الباك إند
set "BACKEND_DIR=%~dp0delni-backend"
if not exist "%BACKEND_DIR%" (
    set "BACKEND_DIR=%~dp0..\delni-backend"
)

:: 3. التحقق من مجلد الواجهة
set "FRONTEND_DIR=%~dp0libya-journeys-pro-main"
if not exist "%FRONTEND_DIR%" (
    set "FRONTEND_DIR=%~dp0"
)

echo [✓] مسار الباك إند: "%BACKEND_DIR%"
echo [✓] مسار الواجهة:   "%FRONTEND_DIR%"
echo.

:: 4. تشغيل خادم الباك إند وربط قاعدة البيانات
echo [1/2] جاري تشغيل خادم الباك إند والربط مع قاعدة بيانات SQL Server (DelniDB)...
start "خادم دلني - الباك إند وقاعدة البيانات (Port 8000)" cmd /k "chcp 65001 >nul && cd /d "%BACKEND_DIR%" && echo جاري تشغيل الباك إند على المنفذ 8000... && php artisan serve --port=8000"

:: 5. تشغيل واجهة المستخدم
echo [2/2] جاري تشغيل خادم الواجهة الأمامية (Frontend)...
start "واجهة دلني - Frontend" cmd /k "chcp 65001 >nul && cd /d "%FRONTEND_DIR%" && npm run dev"

echo.
echo ======================================================================
echo  ✅ تم تشغيل الخوادم بنجاح!
echo  - المنصة (الواجهة الأمامية): http://localhost:8080 أو http://localhost:5173
echo  - خادم الباك إند (API):     http://127.0.0.1:8000
echo  - مستعرض قاعدة البيانات:     http://127.0.0.1:8000/db-viewer
echo ======================================================================
echo.
echo ⚠️  ملاحظة هامة: لا تقم بإغلاق النوافذ السوداء طالما أنك تستخدم المنصة.
echo.

timeout /t 3 > nul
start http://127.0.0.1:8000/db-viewer
start http://localhost:8080

pause
