@echo off
chcp 65001 >nul
title Delni - run the app on the phone

rem Honor Suite keeps the phone on its own (older) ADB and disconnects Flutter's ADB.
rem So the app is installed and the ports are forwarded through Honor Suite's ADB when it is installed;
rem otherwise through the Android SDK's ADB. No administrator rights are needed.
set "HWADB=C:\Program Files (x86)\HonorSuite\hwtools\hwtransport.exe"
set "SDKADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
set "ADB=%SDKADB%"
if exist "%HWADB%" set "ADB=%HWADB%"
rem The platform (website + Laravel) is the "Delni Platform" folder next to this app
for %%I in ("%~dp0..\Delni Platform") do set "PLATFORM=%%~fI"

echo.
echo [1/5] Checking the Laravel server on port 8000 and the website on port 8080...
curl -s -m 3 -o nul http://127.0.0.1:8000/api/health
if %errorlevel% neq 0 (
    echo       Starting the Laravel server...
    start "Delni API - port 8000" cmd /k "cd /d "%PLATFORM%\delni-backend\public" && C:\xampp\php\php.exe -S 127.0.0.1:8000 ..\vendor\laravel\framework\src\Illuminate\Foundation\resources\server.php"
) else (
    echo       Laravel server is already running.
)
curl -s -m 3 -o nul http://127.0.0.1:8080/
if %errorlevel% neq 0 (
    echo       Starting the website for uploaded images...
    start "Delni Web - port 8080" cmd /k "cd /d "%PLATFORM%" && npm run dev"
) else (
    echo       Website is already running.
)

echo.
echo [2/5] Building the app...
cd /d "%~dp0"
call flutter build apk --debug
if %errorlevel% neq 0 (
    echo       The build failed, see the messages above.
    pause
    exit /b 1
)

echo.
echo [3/5] Waiting for the phone: connect the USB cable, unlock it and tap "Allow" if asked...
"%ADB%" wait-for-device

echo.
echo [4/5] Installing Delni and forwarding ports 8000 and 8080...
"%ADB%" install -r build\app\outputs\flutter-apk\app-debug.apk
"%ADB%" reverse tcp:8000 tcp:8000
"%ADB%" reverse tcp:8080 tcp:8080

echo.
echo [5/5] Opening Delni on the phone...
"%ADB%" shell monkey -p ly.delni.delni_app -c android.intent.category.LAUNCHER 1 >nul 2>&1

echo.
echo Done. Keep this computer on and the cable connected while you use the app.
pause
