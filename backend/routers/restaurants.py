from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import RestaurantCafe
from schemas import RestaurantOut, RestaurantCreate

router = APIRouter(prefix="/api/restaurants", tags=["Restaurants & Cafes"])

@router.get("", response_model=List[RestaurantOut])
def list_restaurants(
    city: Optional[str] = Query(None, description="تصفية حسب المدينة مثل: طرابلس، بنغازي"),
    cuisine_type: Optional[str] = Query(None, description="تصفية حسب نوع الطلبات: مشاوي، شعبي، بحري، سريع..."),
    search: Optional[str] = Query(None, description="بحث بالاسم أو العنوان"),
    db: Session = Depends(get_db)
):
    query = db.query(RestaurantCafe)
    if city and city != "all":
        query = query.filter(RestaurantCafe.city == city)
    if cuisine_type and cuisine_type != "all":
        query = query.filter(RestaurantCafe.cuisine_type == cuisine_type)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (RestaurantCafe.facility_name.ilike(search_pattern)) | 
            (RestaurantCafe.address_details.ilike(search_pattern)) |
            (RestaurantCafe.specialty.ilike(search_pattern))
        )
    return query.all()

@router.get("/{facility_id}", response_model=RestaurantOut)
def get_restaurant(facility_id: str, db: Session = Depends(get_db)):
    restaurant = db.query(RestaurantCafe).filter(RestaurantCafe.facility_id == facility_id).first()
    if not restaurant:
        raise HTTPException(status_code=404, detail="المطعم غير موجود")
    return restaurant

@router.post("", response_model=RestaurantOut, status_code=201)
def create_restaurant(payload: RestaurantCreate, db: Session = Depends(get_db)):
    existing = db.query(RestaurantCafe).filter(RestaurantCafe.facility_id == payload.facility_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="المعرف التعريفي مسجل مسبقاً")
    new_res = RestaurantCafe(**payload.model_dump())
    db.add(new_res)
    db.commit()
    db.refresh(new_res)
    return new_res

@router.delete("/{facility_id}")
def delete_restaurant(facility_id: str, db: Session = Depends(get_db)):
    res = db.query(RestaurantCafe).filter(RestaurantCafe.facility_id == facility_id).first()
    if not res:
        raise HTTPException(status_code=404, detail="المطعم غير موجود")
    db.delete(res)
    db.commit()
    return {"message": "تم حذف المرفق بنجاح"}
