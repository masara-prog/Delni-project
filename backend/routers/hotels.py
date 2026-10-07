from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Hotel
from schemas import HotelOut, HotelCreate

router = APIRouter(prefix="/api/hotels", tags=["Hotels & Accommodations"])

@router.get("", response_model=List[HotelOut])
def list_hotels(
    city: Optional[str] = Query(None, description="تصفية حسب المدينة: طرابلس، بنغازي، مصراتة..."),
    min_stars: Optional[int] = Query(None, ge=1, le=5, description="الحد الأدنى لتقييم النجوم"),
    search: Optional[str] = Query(None, description="بحث بالاسم أو العنوان"),
    db: Session = Depends(get_db)
):
    query = db.query(Hotel)
    if city and city != "all":
        query = query.filter(Hotel.city == city)
    if min_stars:
        query = query.filter(Hotel.star_rating >= min_stars)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (Hotel.hotel_name.ilike(search_pattern)) | 
            (Hotel.address_details.ilike(search_pattern))
        )
    return query.all()

@router.get("/{hotel_id}", response_model=HotelOut)
def get_hotel(hotel_id: str, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="الفندق غير موجود")
    return hotel

@router.post("", response_model=HotelOut, status_code=201)
def create_hotel(payload: HotelCreate, db: Session = Depends(get_db)):
    existing = db.query(Hotel).filter(Hotel.hotel_id == payload.hotel_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="معرف الفندق مسجل مسبقاً")
    new_hotel = Hotel(**payload.model_dump())
    db.add(new_hotel)
    db.commit()
    db.refresh(new_hotel)
    return new_hotel

@router.delete("/{hotel_id}")
def delete_hotel(hotel_id: str, db: Session = Depends(get_db)):
    hotel = db.query(Hotel).filter(Hotel.hotel_id == hotel_id).first()
    if not hotel:
        raise HTTPException(status_code=404, detail="الفندق غير موجود")
    db.delete(hotel)
    db.commit()
    return {"message": "تم حذف الفندق بنجاح"}
