from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

# --- RESTAURANTS SCHEMAS ---
class RestaurantBase(BaseModel):
    facility_id: str
    facility_name: str
    facility_type: str = "مطعم"
    city: str
    address_details: str
    phone_number: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = "مشاوي" # نوع الطلبات: مشاوي، بحري، شعبي، سريع...
    specialty: Optional[str] = None      # التخصص الرئيسي
    working_hours: Optional[str] = None
    facility_image_1: Optional[str] = None
    facility_image_2: Optional[str] = None
    facility_image_3: Optional[str] = None
    facility_image_4: Optional[str] = None
    facility_image_5: Optional[str] = None
    contract_date: Optional[date] = None
    verification_status: Optional[str] = "معتمد"

class RestaurantCreate(RestaurantBase):
    pass

class RestaurantOut(RestaurantBase):
    class Config:
        from_attributes = True


# --- HOTELS SCHEMAS ---
class HotelBase(BaseModel):
    hotel_id: str
    hotel_name: str
    city: str
    address_details: str
    phone_number: str
    star_rating: int = Field(default=4, ge=1, le=5)
    partnership_status: str = "شريك موثوق"
    property_type: Optional[str] = "فندق فاخر"
    amenities: Optional[str] = None
    hotel_photo_1: Optional[str] = None
    hotel_photo_2: Optional[str] = None
    hotel_photo_3: Optional[str] = None
    hotel_photo_4: Optional[str] = None
    hotel_photo_5: Optional[str] = None
    contract_date: Optional[date] = None
    verification_status: Optional[str] = "معتمد"

class HotelCreate(HotelBase):
    pass

class HotelOut(HotelBase):
    class Config:
        from_attributes = True


# --- ATTRACTIONS SCHEMAS ---
class AttractionBase(BaseModel):
    place_id: str
    place_name: str
    description: str
    city: str
    category: str
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    place_image: Optional[str] = None
    gallery: Optional[str] = None
    is_unesco: bool = False
    unesco_year: Optional[int] = None
    entry_fee: Optional[str] = None
    google_maps_url: Optional[str] = None

class AttractionCreate(AttractionBase):
    pass

class AttractionOut(AttractionBase):
    class Config:
        from_attributes = True


# --- VEHICLES SCHEMAS ---
class VehicleBase(BaseModel):
    plate_number: str
    vehicle_type: str
    category: Optional[str] = None
    seating_capacity: int
    vehicle_image: Optional[str] = None
    vehicle_status: str = "متاح"
    contract_number: Optional[str] = None
    daily_rate: Optional[float] = None

class VehicleCreate(VehicleBase):
    pass

class VehicleOut(VehicleBase):
    class Config:
        from_attributes = True


# --- PRIVATE TRIPS SCHEMAS ---
class PrivateTripCreate(BaseModel):
    customer_name: str
    customer_phone: str
    preferred_start_date: date
    duration_days: int = 1
    number_of_companions: int = 1
    customer_requirements: Optional[str] = None

class PrivateTripOut(BaseModel):
    private_trip_id: str
    customer_name: str
    customer_phone: str
    preferred_start_date: date
    duration_days: int
    number_of_companions: int
    customer_requirements: Optional[str] = None
    status_order: str
    quoted_price: Optional[float] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- AI ASSISTANT ("ذكاء دلّني") SCHEMAS ---
class AIChatMessage(BaseModel):
    role: str # "user" or "model" / "assistant"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: Optional[List[AIChatMessage]] = []

class AIChatResponse(BaseModel):
    reply: str
    suggested_actions: Optional[List[str]] = []
    source: str = "gemini" # or "rule-based-fallback"
