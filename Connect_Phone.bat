@echo off
title Delni - connect the phone
rem Reconnects an Android phone (USB cable, USB debugging on) to the Delni servers on this computer and opens the app.
rem Run it whenever the app stops loading on the phone (the link drops when the cable is unplugged or the phone sleeps).
rem (English only on purpose: Arabic text inside a .bat file breaks the Windows command window.)

set "ADB=%USERPROFILE%\platform-tools\adb.exe"
if not exist "%ADB%" (
    echo  ADB was not found in %USERPROFILE%\platform-tools
    pause
    exit /b 1
)

echo  Waiting for the phone: connect the cable and unlock the phone ...
"%ADB%" wait-for-device
"%ADB%" reverse tcp:5050 tcp:5050 > nul
"%ADB%" reverse tcp:8000 tcp:8000 > nul
"%ADB%" reverse tcp:8080 tcp:8080 > nul
"%ADB%" shell am start -a android.intent.action.VIEW -d http://127.0.0.1:5050/ > nul
echo.
echo  Done: the app is open on the phone at http://127.0.0.1:5050
echo  (The servers must be running: start them with Start_Delni.bat)
timeout /t 5 > nul
