@echo off
title Delni - platform and app
rem Starts the Delni platform (Laravel API + website) and the mobile app (web build), then opens them.
rem If an Android phone is connected by USB with USB debugging on, the app is also opened on the phone.
rem (English only on purpose: Arabic text inside a .bat file breaks the Windows command window.)

set "ROOT=%~dp0"
set "BACKEND=%ROOT%Delni Platform\delni-backend"
set "WEBSITE=%ROOT%Delni Platform"
set "APPWEB=%ROOT%App Delni\build\web"
set "ADB=%USERPROFILE%\platform-tools\adb.exe"

echo.
echo  ==========================================================
echo     Delni: starting the platform and the app
echo  ==========================================================
echo.

echo  [1/3] Server (Laravel) on port 8000 ...
curl -s -m 3 -o nul http://127.0.0.1:8000/api/health
if errorlevel 1 (
    start "Delni API - 8000 - keep open" /d "%BACKEND%" cmd /k php artisan serve --host=0.0.0.0 --port=8000
) else (
    echo        already running
)

echo  [2/3] Website on port 8080 ...
curl -s -m 3 -o nul http://127.0.0.1:8080/
if errorlevel 1 (
    start "Delni Website - 8080 - keep open" /d "%WEBSITE%" cmd /k npx vite --port 8080 --strictPort --host 127.0.0.1
) else (
    echo        already running
)

echo  [3/3] App on port 5050 ...
curl -s -m 3 -o nul http://127.0.0.1:5050/
if errorlevel 1 (
    start "Delni App - 5050 - keep open" /d "%APPWEB%" cmd /k python -m http.server 5050 --bind 0.0.0.0
) else (
    echo        already running
)

echo.
echo  Waiting for the servers to be ready ...
timeout /t 12 > nul

start "" http://localhost:8080
start "" msedge.exe --app=http://127.0.0.1:5050/ --window-size=420,880 --user-data-dir="%TEMP%\delni-app-preview"

if exist "%ADB%" (
    "%ADB%" get-state > nul 2>&1
    if not errorlevel 1 (
        echo  Phone found on USB: opening the app on it ...
        "%ADB%" reverse tcp:5050 tcp:5050 > nul
        "%ADB%" reverse tcp:8000 tcp:8000 > nul
        "%ADB%" reverse tcp:8080 tcp:8080 > nul
        "%ADB%" shell am start -a android.intent.action.VIEW -d http://127.0.0.1:5050/ > nul
    )
)

echo.
echo  ==========================================================
echo   Done:
echo    - Platform (website):   http://localhost:8080
echo    - App:                  http://127.0.0.1:5050
echo    - App on the USB phone: http://127.0.0.1:5050
echo.
echo   Keep the three black windows open while you use Delni.
echo  ==========================================================
pause
