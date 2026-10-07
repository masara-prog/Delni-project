from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import PlaceTourist
from schemas import AttractionOut, AttractionCreate

router = APIRouter(prefix="/api/attractions", tags=["Tourist Attractions & Places"])

@router.get("", response_model=List[AttractionOut])
def list_attractions(
    city: Optional[str] = Query(None, description="تصفية حسب المدينة: طرابلس، شحات، غدامس، صبراتة..."),
    category: Optional[str] = Query(None, description="تصفية حسب التصنيف: آثار وتاريخ، مدن قديمة، طبيعة..."),
    is_unesco: Optional[bool] = Query(None, description="المعالم المدرجة في قائمة اليونسكو للتراث العالمي"),
    search: Optional[str] = Query(None, description="بحث بالاسم أو الوصف"),
    db: Session = Depends(get_db)
):
    query = db.query(PlaceTourist)
    if city and city != "all":
        query = query.filter(PlaceTourist.city == city)
    if category and category != "all":
        query = query.filter(PlaceTourist.category == category)
    if is_unesco is not None:
        query = query.filter(PlaceTourist.is_unesco == is_unesco)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (PlaceTourist.place_name.ilike(search_pattern)) | 
            (PlaceTourist.description.ilike(search_pattern))
        )
    return query.all()

@router.get("/{place_id}", response_model=AttractionOut)
def get_attraction(place_id: str, db: Session = Depends(get_db)):
    place = db.query(PlaceTourist).filter(PlaceTourist.place_id == place_id).first()
    if not place:
        raise HTTPException(status_code=404, detail="المعلم السياحي غير موجود")
    return place

@router.post("", response_model=AttractionOut, status_code=201)
def create_attraction(payload: AttractionCreate, db: Session = Depends(get_db)):
    existing = db.query(PlaceTourist).filter(PlaceTourist.place_id == payload.place_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="معرف المعلم مسجل مسبقاً")
    new_place = PlaceTourist(**payload.model_dump())
    db.add(new_place)
    db.commit()
    db.refresh(new_place)
    return new_place
