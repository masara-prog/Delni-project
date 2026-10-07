@echo off
chcp 65001 > nul
echo ===================================================
echo 🚀 تشغيل الباك إند لمنصة دلّني للسياحة (FastAPI + MySQL)
echo ===================================================
echo.

if not exist ".env" (
    echo [تنبيه] لم يتم العثور على .env، جاري نسخه من .env.example...
    copy .env.example .env
)

echo [1/2] زراعة البيانات الأولية (Seeding Data)...
python seed_data.py

echo.
echo [2/2] بدء خادم API على http://localhost:8000 ...
echo [توثيق Swagger التفاعلي]: http://localhost:8000/docs
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
pause
