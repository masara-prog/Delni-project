import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import DailyTrip, WeeklyTrip, PrivateTrip, TransportationCompany, Driver, TourGuide

router = APIRouter(prefix="/api/trips", tags=["Trips & Transportation Management"])

# --- PRIVATE TRIPS ---
@router.post("/private", status_code=201)
def create_private_trip(payload: dict, db: Session = Depends(get_db)):
    trip_id = f"TRIP-{uuid.uuid4().hex[:6].upper()}"
    new_trip = PrivateTrip(
        private_trip_id=trip_id,
        customer_name=payload.get("customer_name", "عميل دلّني VIP"),
        customer_phone=payload.get("customer_phone", "0910000000"),
        preferred_start_date=payload.get("preferred_start_date"),
        duration_days=payload.get("duration_days", 1),
        number_of_companions=payload.get("number_of_companions", 1),
        customer_requirements=payload.get("customer_requirements", ""),
        status_order="قيد الدراسة"
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip

@router.get("/private")
def list_private_trips(db: Session = Depends(get_db)):
    return db.query(PrivateTrip).order_by(PrivateTrip.created_at.desc()).all()


# --- DAILY TRIPS (الرحلات اليومية) ---
@router.get("/daily")
def list_daily_trips(city: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(DailyTrip)
    if city and city != "all":
        query = query.filter((DailyTrip.departure_city == city) | (DailyTrip.destination_city == city))
    return query.all()

@router.post("/daily", status_code=201)
def create_daily_trip(payload: dict, db: Session = Depends(get_db)):
    trip_id = payload.get("daily_trip_id") or f"DT-{uuid.uuid4().hex[:4].upper()}"
    new_trip = DailyTrip(
        daily_trip_id=trip_id,
        trip_title=payload.get("trip_title", "رحلة يومية مخصصة"),
        description=payload.get("description", ""),
        price_per_seat=float(payload.get("price_per_seat", 100)),
        max_capacity=int(payload.get("max_capacity", 25)),
        available_seats=int(payload.get("available_seats", 25)),
        departure_city=payload.get("departure_city", "طرابلس"),
        destination_city=payload.get("destination_city", "لبدة الكبرى"),
        guide_license_number=payload.get("guide_license_number"),
        photo=payload.get("photo", "/assets/ai_ruins.jpg"),
        is_active=True
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip


# --- WEEKLY TRIPS (الرحلات الأسبوعية) ---
@router.get("/weekly")
def list_weekly_trips(db: Session = Depends(get_db)):
    return db.query(WeeklyTrip).all()

@router.post("/weekly", status_code=201)
def create_weekly_trip(payload: dict, db: Session = Depends(get_db)):
    trip_id = payload.get("weekly_trip_id") or f"WT-{uuid.uuid4().hex[:4].upper()}"
    new_trip = WeeklyTrip(
        weekly_trip_id=trip_id,
        trip_title=payload.get("trip_title", "رحلة أسبوعية مخصصة"),
        start_date=payload.get("start_date"),
        end_date=payload.get("end_date"),
        seat_per_price=float(payload.get("seat_per_price", 1500)),
        max_capacity=int(payload.get("max_capacity", 30)),
        available_seats=int(payload.get("available_seats", 30)),
        trip_description=payload.get("trip_description", ""),
        departure_city=payload.get("departure_city", "طرابلس"),
        destination_region=payload.get("destination_region", "غدامس واحات"),
        guide_license_number=payload.get("guide_license_number"),
        photo=payload.get("photo", "/assets/ai_ghadames.jpg"),
        is_active=True
    )
    db.add(new_trip)
    db.commit()
    db.refresh(new_trip)
    return new_trip


# --- TRANSPORT COMPANIES (شركات النقل) ---
@router.get("/companies")
def list_companies(db: Session = Depends(get_db)):
    return db.query(TransportationCompany).all()

@router.post("/companies", status_code=201)
def create_company(payload: dict, db: Session = Depends(get_db)):
    contract_number = payload.get("contract_number") or f"CN-2026-{uuid.uuid4().hex[:4].upper()}"
    comp = TransportationCompany(
        contract_number=contract_number,
        company_name=payload.get("company_name", "شركة نقل سياحي"),
        phone_number=payload.get("phone_number", "0910000000"),
        address=payload.get("address", "طرابلس"),
        total_vehicles=int(payload.get("total_vehicles", 5)),
        verification_status="موثق",
        contract_date=payload.get("contract_date") or "2026-01-01"
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return comp
