@echo off
title Delni - connect the phone
rem Connects the Android phone to the Delni server on this computer and opens the installed Delni app.
rem Works by USB cable (USB debugging on) or by wireless debugging (type the IP:port shown on the phone).
rem Run it whenever the app stops loading on the phone (the link drops when the cable is unplugged or the phone sleeps).
rem (English only on purpose: Arabic text inside a .bat file breaks the Windows command window.)

set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
if not exist "%ADB%" set "ADB=%USERPROFILE%\platform-tools\adb.exe"
if not exist "%ADB%" (
    echo  ADB was not found. Install Android platform-tools.
    pause
    exit /b 1
)

echo.
echo  Phone by cable: just press Enter.
echo  Phone by Wi-Fi: type the IP:port from "Wireless debugging" on the phone (example 192.168.1.197:45927)
set "PHONE="
set /p "PHONE=  IP:port (or Enter): "
if not "%PHONE%"=="" (
    "%ADB%" connect %PHONE%
    set "TARGET=-s %PHONE%"
) else (
    set "TARGET="
    echo  Waiting for the phone: connect the cable and unlock the phone ...
    "%ADB%" wait-for-device
)

"%ADB%" %TARGET% reverse tcp:8000 tcp:8000 > nul
"%ADB%" %TARGET% reverse tcp:8080 tcp:8080 > nul
"%ADB%" %TARGET% reverse tcp:5050 tcp:5050 > nul
"%ADB%" %TARGET% shell input keyevent KEYCODE_WAKEUP > nul
"%ADB%" %TARGET% shell monkey -p ly.delni.delni_app -c android.intent.category.LAUNCHER 1 > nul 2>&1
if errorlevel 1 (
    echo  The Delni app is not installed: opening the web version instead.
    "%ADB%" %TARGET% shell am start -a android.intent.action.VIEW -d http://127.0.0.1:5050/ > nul
)
echo.
echo  Done: the Delni app is open on the phone.
echo  (The server must be running: start it with Start_Delni.bat)
timeout /t 6 > nul
