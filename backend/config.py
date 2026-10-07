import os
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "delni_db")

# Encoded password if needed
password_part = f":{DB_PASSWORD}" if DB_PASSWORD else ""
MYSQL_URL = f"mysql+pymysql://{DB_USER}{password_part}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"
SQLITE_FALLBACK_URL = f"sqlite:///{BASE_DIR / 'delni_fallback.db'}"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

CORS_ORIGINS = [
    origin.strip() 
    for origin in os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5173").split(",") 
    if origin.strip()
]
