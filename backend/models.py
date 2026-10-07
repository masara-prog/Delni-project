from sqlalchemy import Column, String, Integer, Float, Boolean, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

# 1. السياح
class Tourist(Base):
    __tablename__ = "tourists"

    tourist_id = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    phone_number = Column(String(20), nullable=False, unique=True)
    password = Column(String(255), nullable=False)


# 2. المرشدين السياحيين
class TourGuide(Base):
    __tablename__ = "tour_guides"

    license_number = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False, unique=True)
    years_of_experience = Column(Integer, default=2)
    certificate = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    speaks_english = Column(Boolean, default=False)
    speaks_french = Column(Boolean, default=False)
    speaks_italian = Column(Boolean, default=False)
    verification_status = Column(String(20), default="بانتظار التوثيق")
    password = Column(String(255), nullable=False)
    email = Column(String(100), nullable=False)
    gender = Column(String(10), nullable=True)
    working_days = Column(Text, nullable=True)
    operating_regions = Column(Text, nullable=True)
    primaryRegion = Column(String(50), nullable=True)
    price_per_day = Column(Float, nullable=True)
    avatar = Column(String(255), nullable=True)
    title = Column(String(100), nullable=True)
    specialties = Column(Text, nullable=True)
    total_tours_completed = Column(Integer, default=0)


# 3. شركات النقل
class TransportationCompany(Base):
    __tablename__ = "transportation_companies"

    contract_number = Column(String(50), primary_key=True, index=True)
    company_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    address = Column(String(150), nullable=False)
    total_vehicles = Column(Integer, default=0)
    verification_status = Column(String(20), default="بانتظار التوثيق")
    contract_date = Column(Date, nullable=False)
    email = Column(String(100), nullable=True)
    password = Column(String(255), nullable=True)
    city = Column(String(50), nullable=True)
    available_vehicles = Column(Integer, default=0)
    contract_start_date = Column(Date, nullable=True)
    contract_end_date = Column(Date, nullable=True)


# 4. أسطول المركبات
class Vehicle(Base):
    __tablename__ = "vehicles"

    plate_number = Column(String(30), primary_key=True, index=True)
    vehicle_type = Column(String(50), nullable=False)
    seating_capacity = Column(Integer, nullable=False)
    vehicle_image = Column(String(255), nullable=True)
    vehicle_status = Column(String(20), default="جاهزة")
    insurance_details = Column(Text, nullable=True)
    contract_number = Column(String(50), ForeignKey("transportation_companies.contract_number"), nullable=False)
    daily_rate = Column(Float, nullable=True)
    category = Column(String(50), nullable=True)
    features = Column(Text, nullable=True)
    photos = Column(Text, nullable=True)
    insurance_image = Column(String(255), nullable=True)


# 5. السائقين
class Driver(Base):
    __tablename__ = "drivers"

    driver_license_number = Column(String(50), primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    phone_number = Column(String(20), nullable=False)
    national_id_or_passport = Column(String(50), nullable=False)
    license_date_valid = Column(Date, nullable=False)
    contract_number = Column(String(50), ForeignKey("transportation_companies.contract_number"), nullable=False)
    assigned_vehicle_plate = Column(String(30), ForeignKey("vehicles.plate_number"), nullable=True)
    email = Column(String(100), nullable=False)
    account_status = Column(String(20), default="نشط")
    password = Column(String(255), nullable=False)
    operational_status = Column(String(20), default="متاح")
    experience_years = Column(Integer, default=0)
    driver_photo = Column(String(255), nullable=True)


# 6. المعالم السياحية
class PlaceTourist(Base):
    __tablename__ = "places_tourist"

    place_id = Column(String(50), primary_key=True, index=True)
    place_name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=False)
    city = Column(String(50), nullable=False, index=True)
    longitude = Column(Float, nullable=True)
    latitude = Column(Float, nullable=True)
    category = Column(String(50), nullable=False)
    place_image = Column(String(255), nullable=True)
    is_unesco = Column(Boolean, default=False)
    unesco_year = Column(Integer, nullable=True)
    gallery = Column(Text, nullable=True)
    entry_fee = Column(String(50), nullable=True)
    best_season = Column(String(50), nullable=True)
    google_maps_url = Column(String(500), nullable=True)


# 7. الفنادق
class Hotel(Base):
    __tablename__ = "hotels"

    hotel_id = Column(String(50), primary_key=True, index=True)
    hotel_name = Column(String(100), nullable=False, index=True)
    city = Column(String(50), nullable=False, index=True)
    address_details = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=False)
    star_rating = Column(Integer, nullable=False, default=4)
    partnership_status = Column(String(20), nullable=False, default="نشط")
    description = Column(Text, nullable=True)
    google_maps_url = Column(String(500), nullable=True)
    working_hours = Column(String(100), nullable=True)
    hotel_photo_1 = Column(String(255), nullable=True)
    hotel_photo_2 = Column(String(255), nullable=True)
    hotel_photo_3 = Column(String(255), nullable=True)
    hotel_photo_4 = Column(String(255), nullable=True)
    hotel_photo_5 = Column(String(255), nullable=True)
    contract_date = Column(Date, nullable=True)
    verification_status = Column(String(20), default="معتمد")
    price_per_night = Column(Float, nullable=True)
    property_type = Column(String(50), default="فندق فاخر")
    amenities = Column(Text, nullable=True)


# 8. المطاعم والمقاهي
class RestaurantCafe(Base):
    __tablename__ = "restaurants_cafes"

    facility_id = Column(String(50), primary_key=True, index=True)
    facility_name = Column(String(100), nullable=False, index=True)
    facility_type = Column(String(50), nullable=False)
    city = Column(String(50), nullable=False, index=True)
    address_details = Column(String(255), nullable=False)
    phone_number = Column(String(20), nullable=True)
    description = Column(Text, nullable=True)
    google_maps_url = Column(String(500), nullable=True)
    facility_image_1 = Column(String(255), nullable=True)
    facility_image_2 = Column(String(255), nullable=True)
    facility_image_3 = Column(String(255), nullable=True)
    facility_image_4 = Column(String(255), nullable=True)
    facility_image_5 = Column(String(255), nullable=True)
    contract_date = Column(Date, nullable=True)
    verification_status = Column(String(20), default="معتمد")
    price_range = Column(String(50), nullable=True)
    working_hours = Column(String(100), nullable=True)
    signature_dishes = Column(Text, nullable=True)
    cuisine_type = Column(String(100), nullable=True, index=True)
    specialty = Column(String(150), nullable=True)
    features = Column(Text, nullable=True)


# 9. الرحلات اليومية
class DailyTrip(Base):
    __tablename__ = "daily_trips"

    daily_trip_id = Column(String(50), primary_key=True, index=True)
    trip_title = Column(String(150), nullable=False)
    description = Column(Text, nullable=False)
    price_per_seat = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)
    photo = Column(String(255), nullable=True)
    max_capacity = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    guide_license_number = Column(String(50), ForeignKey("tour_guides.license_number"), nullable=True)
    departure_city = Column(String(50), nullable=True)
    destination_city = Column(String(50), nullable=True)
    recurring_days = Column(Text, nullable=True)
    activities = Column(Text, nullable=True)


# 10. الرحلات الأسبوعية
class WeeklyTrip(Base):
    __tablename__ = "weekly_trips"

    weekly_trip_id = Column(String(50), primary_key=True, index=True)
    trip_title = Column(String(150), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    max_capacity = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)
    seat_per_price = Column(Float, nullable=False)
    trip_description = Column(Text, nullable=False)
    guide_license_number = Column(String(50), ForeignKey("tour_guides.license_number"), nullable=True)
    is_active = Column(Boolean, default=True)
    departure_city = Column(String(50), nullable=True)
    destination_region = Column(String(100), nullable=True)
    photo = Column(String(255), nullable=True)
    gallery = Column(Text, nullable=True)


# 11. الرحلات الخاصة VIP
class PrivateTrip(Base):
    __tablename__ = "private_trips"

    private_trip_id = Column(String(50), primary_key=True, index=True)
    status_order = Column(String(25), default="قيد الدراسة")
    customer_description = Column(Text, nullable=True)
    preferred_start_date = Column(Date, nullable=False)
    duration_days = Column(Integer, nullable=False, default=1)
    number_of_companions = Column(Integer, nullable=False, default=1)
    quoted_price = Column(Float, nullable=True)
    admin_itinerary_plan = Column(Text, nullable=True)
    guide_license_number = Column(String(50), nullable=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=True)
    customer_name = Column(String(100), nullable=True)
    customer_phone = Column(String(20), nullable=True)
    customer_requirements = Column(Text, nullable=True)
    assigned_guide_license = Column(String(50), ForeignKey("tour_guides.license_number"), nullable=True)
    assigned_vehicle_plate = Column(String(30), ForeignKey("vehicles.plate_number"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 12. عروض الرحلات اليومية
class OfferDailyTrip(Base):
    __tablename__ = "offers_daily_trips"

    offer_daily_id = Column(String(50), primary_key=True, index=True)
    daily_trip_id = Column(String(50), ForeignKey("daily_trips.daily_trip_id"), nullable=False)
    offer_title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    percent_discount = Column(Float, nullable=False)
    offer_image_url = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    badge = Column(String(50), nullable=True)


# 13. عروض الرحلات الأسبوعية
class OfferWeeklyTrip(Base):
    __tablename__ = "offers_weekly_trips"

    offer_weekly_id = Column(String(50), primary_key=True, index=True)
    weekly_trip_id = Column(String(50), ForeignKey("weekly_trips.weekly_trip_id"), nullable=False)
    offer_title = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    discount_percentage = Column(Float, nullable=False)
    offer_image_url = Column(String(255), nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    badge = Column(String(50), nullable=True)


# 14. عروض الفنادق
class OfferHotel(Base):
    __tablename__ = "offers_hotels"

    id_offer = Column(String(50), primary_key=True, index=True)
    title_offer = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    percent_discount = Column(Integer, nullable=False)
    offer_image = Column(String(255), nullable=False)
    hotel_id = Column(String(50), ForeignKey("hotels.hotel_id"), nullable=False)
    date_start = Column(Date, nullable=False)
    date_end = Column(Date, nullable=False)
    badge = Column(String(50), nullable=True)


# 15. عروض المرافق والمطاعم
class OfferFacility(Base):
    __tablename__ = "offers_facilities"

    facility_offer_id = Column(String(50), primary_key=True, index=True)
    facility_id = Column(String(50), ForeignKey("restaurants_cafes.facility_id"), nullable=False)
    description = Column(Text, nullable=False)
    offer_title = Column(String(100), nullable=False)
    offer_image_url = Column(String(255), nullable=False)
    discount_percentage = Column(Float, nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    badge = Column(String(50), nullable=True)


# 16. تخصيص مركبات الرحلات اليومية
class DailyTripVehicle(Base):
    __tablename__ = "daily_trip_vehicles"

    daily_alloc_id = Column(String(50), primary_key=True, index=True)
    daily_trip_id = Column(String(50), ForeignKey("daily_trips.daily_trip_id"), nullable=False)
    plate_number = Column(String(30), ForeignKey("vehicles.plate_number"), nullable=False)
    allocation_date = Column(Date, nullable=False)
    status = Column(String(20), default="مخصصة")


# 17. تخصيص مركبات الرحلات الأسبوعية
class WeeklyTripVehicle(Base):
    __tablename__ = "weekly_trip_vehicles"

    weekly_alloc_id = Column(String(50), primary_key=True, index=True)
    weekly_trip_id = Column(String(50), ForeignKey("weekly_trips.weekly_trip_id"), nullable=False)
    plate_number = Column(String(30), ForeignKey("vehicles.plate_number"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="مخصصة")


# 18. تخصيص مركبات الرحلات الخاصة
class PrivateTripVehicle(Base):
    __tablename__ = "private_trip_vehicles"

    private_alloc_id = Column(String(50), primary_key=True, index=True)
    private_trip_id = Column(String(50), ForeignKey("private_trips.private_trip_id"), nullable=False)
    plate_number = Column(String(30), ForeignKey("vehicles.plate_number"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    allocation_status = Column(String(25), default="مخصصة")


# 19. حجوزات الرحلات اليومية
class BookingDaily(Base):
    __tablename__ = "bookings_daily"

    booking_daily_id = Column(String(50), primary_key=True, index=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=False)
    daily_trip_id = Column(String(50), ForeignKey("daily_trips.daily_trip_id"), nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)
    number_of_seats = Column(Integer, default=1)
    booking_status = Column(String(20), default="مؤكد")
    total_price = Column(Float, nullable=False)
    booking_notes = Column(Text, nullable=True)
    passengers_names = Column(Text, nullable=True)
    payment_status = Column(String(20), default="unpaid")
    attended = Column(Boolean, default=False)


# 20. حجوزات الرحلات الأسبوعية
class BookingWeekly(Base):
    __tablename__ = "bookings_weekly"

    booking_weekly_id = Column(String(50), primary_key=True, index=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=False)
    weekly_trip_id = Column(String(50), ForeignKey("weekly_trips.weekly_trip_id"), nullable=False)
    booking_date = Column(DateTime, default=datetime.utcnow)
    number_of_seats = Column(Integer, default=1)
    total_price = Column(Float, nullable=False)
    booking_status = Column(String(20), default="مؤكد")
    booking_notes = Column(Text, nullable=True)
    passengers_names = Column(Text, nullable=True)
    payment_status = Column(String(20), default="unpaid")
    attended = Column(Boolean, default=False)


# 21. فنادق الرحلات الأسبوعية
class HotelTripWeekly(Base):
    __tablename__ = "hotels_trip_weekly"

    hotel_id = Column(String(50), ForeignKey("hotels.hotel_id"), primary_key=True)
    weekly_trip_id = Column(String(50), ForeignKey("weekly_trips.weekly_trip_id"), primary_key=True)


# 22. معالم الرحلات الأسبوعية
class PlaceTripWeekly(Base):
    __tablename__ = "places_trip_weekly"

    place_id = Column(String(50), ForeignKey("places_tourist.place_id"), primary_key=True)
    weekly_trip_id = Column(String(50), ForeignKey("weekly_trips.weekly_trip_id"), primary_key=True)


# 23. تقييمات الرحلات اليومية
class ReviewDailyTrip(Base):
    __tablename__ = "reviews_daily_trips"

    review_daily_id = Column(String(50), primary_key=True, index=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=False)
    daily_trip_id = Column(String(50), ForeignKey("daily_trips.daily_trip_id"), nullable=False)
    stars_rating = Column(Integer, default=5)
    comment_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 24. تقييمات الرحلات الأسبوعية
class ReviewWeeklyTrip(Base):
    __tablename__ = "reviews_weekly_trips"

    review_weekly_id = Column(String(50), primary_key=True, index=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=False)
    weekly_trip_id = Column(String(50), ForeignKey("weekly_trips.weekly_trip_id"), nullable=False)
    stars_rating = Column(Integer, default=5)
    comment_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 25. تقييمات الفنادق
class ReviewHotel(Base):
    __tablename__ = "reviews_hotels"

    review_hotel_id = Column(String(50), primary_key=True, index=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=False)
    hotel_id = Column(String(50), ForeignKey("hotels.hotel_id"), nullable=False)
    stars_rating = Column(Integer, default=5)
    comment_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# 26. تقييمات المطاعم والمرافق
class ReviewFacility(Base):
    __tablename__ = "reviews_facilities"

    review_facility_id = Column(String(50), primary_key=True, index=True)
    tourist_id = Column(String(50), ForeignKey("tourists.tourist_id"), nullable=False)
    facility_id = Column(String(50), ForeignKey("restaurants_cafes.facility_id"), nullable=False)
    stars_rating = Column(Integer, default=5)
    comment_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
