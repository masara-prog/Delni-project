from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Vehicle
from schemas import VehicleOut, VehicleCreate

router = APIRouter(prefix="/api/vehicles", tags=["Transportation & Vehicles"])

@router.get("", response_model=List[VehicleOut])
def list_vehicles(
    vehicle_type: Optional[str] = Query(None, description="نوع المركبة: دفع رباعي، حافلة VIP، صالون..."),
    status: Optional[str] = Query(None, description="حالة المركبة: متاح، في رحلة"),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if vehicle_type and vehicle_type != "all":
        query = query.filter(Vehicle.vehicle_type == vehicle_type)
    if status:
        query = query.filter(Vehicle.vehicle_status == status)
    return query.all()

@router.get("/{plate_number}", response_model=VehicleOut)
def get_vehicle(plate_number: str, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.plate_number == plate_number).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail="المركبة غير مسجلة")
    return vehicle

@router.post("", response_model=VehicleOut, status_code=201)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(Vehicle).filter(Vehicle.plate_number == payload.plate_number).first()
    if existing:
        raise HTTPException(status_code=400, detail="لوحة المركبة مسجلة مسبقاً")
    new_vehicle = Vehicle(**payload.model_dump())
    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)
    return new_vehicle
