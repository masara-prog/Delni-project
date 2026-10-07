from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base, CURRENT_DB_TYPE
from config import CORS_ORIGINS
import models

# Import routers
from routers import restaurants, hotels, attractions, transport, trips, ai_assistant

# Create database tables automatically
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning during table creation: {e}")

app = FastAPI(
    title="منصة دلّني للسياحة الليبية - Delni API",
    description="واجهة برمجة التطبيقات الرسمية لمنصة دلّني (Delni) - السياحة، الفنادق، المطاعم، المعالم، النقل، والذكاء الاصطناعي.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS setup for Frontend (Vite)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allow all in development, or CORS_ORIGINS
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(restaurants.router)
app.include_router(hotels.router)
app.include_router(attractions.router)
app.include_router(transport.router)
app.include_router(trips.router)
app.include_router(ai_assistant.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "platform": "منصة دلّني - Delni Tourism Platform",
        "database": CURRENT_DB_TYPE,
        "docs": "/docs",
        "api_endpoints": [
            "/api/restaurants",
            "/api/hotels",
            "/api/attractions",
            "/api/vehicles",
            "/api/trips/private",
            "/api/ai/chat",
            "/api/ai/vision"
        ]
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database_type": CURRENT_DB_TYPE
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
