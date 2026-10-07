import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import MYSQL_URL, SQLITE_FALLBACK_URL

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("delni_backend")

Base = declarative_base()

CURRENT_DB_TYPE = "mysql"

def create_db_engine():
    global CURRENT_DB_TYPE
    try:
        # Attempt MySQL connection
        eng = create_engine(
            MYSQL_URL,
            pool_recycle=3600,
            pool_pre_ping=True
        )
        with eng.connect() as conn:
            pass
        logger.info("Successfully connected to MySQL Database!")
        CURRENT_DB_TYPE = "mysql"
        return eng
    except Exception as e:
        logger.warning(
            f"⚠️ Could not connect to MySQL server ({e}). "
            "Falling back to local SQLite database so the app can start without crashing. "
            "To use MySQL, make sure MySQL/XAMPP is running on port 3306 and create 'delni_db'."
        )
        CURRENT_DB_TYPE = "sqlite"
        return create_engine(
            SQLITE_FALLBACK_URL,
            connect_args={"check_same_thread": False}
        )

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
