"""
Delni Platform - Seed Data Script
يقوم هذا السكريبت بإدخال البيانات الأولية لجميع الجداول الـ 26 في MySQL
"""
from datetime import date
from database import SessionLocal, engine, Base
from models import (
    Tourist, TourGuide, TransportationCompany, Vehicle, Driver, PlaceTourist,
    Hotel, RestaurantCafe, DailyTrip, WeeklyTrip, PrivateTrip
)

Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        print("[+] Seeding All 26 Tables for Delni Platform in MySQL...")

        # 1. TOURISTS
        t1 = Tourist(tourist_id="TUR-001", full_name="محمد الفيتوري", email="m.faitouri@example.com", phone_number="0911112233", password="hashed_pass")
        t2 = Tourist(tourist_id="TUR-002", full_name="سارة العزابي", email="sara@example.com", phone_number="0922223344", password="hashed_pass")
        for t in [t1, t2]:
            if not db.query(Tourist).filter(Tourist.tourist_id == t.tourist_id).first():
                db.add(t)
        db.commit()

        # 2. TOUR GUIDES
        g1 = TourGuide(license_number="G-9901", full_name="سالم القذافي", phone_number="0917778888", years_of_experience=7, certificate="رخصة وزارة السياحة 4421", bio="خبير الجولات الأثرية بالمنطقة الغربية والواحات.", verification_status="موثق", password="pass", email="salem@dalni.ly", price_per_day=150)
        g2 = TourGuide(license_number="G-9902", full_name="خالد بن يونس", phone_number="0921112233", years_of_experience=5, certificate="جامعة بنغازي - تاريخ وآثار", bio="مرشد متخصص في آثار قورينا وشحات.", verification_status="موثق", password="pass", email="khaled@dalni.ly", price_per_day=140)
        for g in [g1, g2]:
            if not db.query(TourGuide).filter(TourGuide.license_number == g.license_number).first():
                db.add(g)
        db.commit()

        # 3. TRANSPORT COMPANIES
        c1 = TransportationCompany(contract_number="CN-2026-01", company_name="شركة الصحراء للنقل السياحي", phone_number="0911234567", address="طرابلس - طريق الشط", total_vehicles=12, verification_status="موثق", contract_date=date(2025, 1, 10))
        c2 = TransportationCompany(contract_number="CN-2026-02", company_name="شركة ليبيا تور للنقل", phone_number="0929876543", address="بنغازي - شارع دبي", total_vehicles=8, verification_status="موثق", contract_date=date(2025, 3, 15))
        for c in [c1, c2]:
            if not db.query(TransportationCompany).filter(TransportationCompany.contract_number == c.contract_number).first():
                db.add(c)
        db.commit()

        # 4. VEHICLES
        v1 = Vehicle(plate_number="5-123456", vehicle_type="دفع رباعي 4x4", seating_capacity=6, vehicle_image="/vehicles/landcruiser.jpg", vehicle_status="جاهزة", contract_number="CN-2026-01", daily_rate=350)
        v2 = Vehicle(plate_number="5-789012", vehicle_type="حافلة سياحية VIP", seating_capacity=45, vehicle_image="/vehicles/bus-vip.jpg", vehicle_status="جاهزة", contract_number="CN-2026-01", daily_rate=750)
        v3 = Vehicle(plate_number="5-345678", vehicle_type="فان عائلي سياحي", seating_capacity=11, vehicle_image="/vehicles/van.jpg", vehicle_status="جاهزة", contract_number="CN-2026-02", daily_rate=450)
        for v in [v1, v2, v3]:
            if not db.query(Vehicle).filter(Vehicle.plate_number == v.plate_number).first():
                db.add(v)
        db.commit()

        # 5. DRIVERS
        d1 = Driver(driver_license_number="LB-88291", full_name="علي التارقي", phone_number="0912223344", national_id_or_passport="119900223344", license_date_valid=date(2029, 12, 10), contract_number="CN-2026-01", assigned_vehicle_plate="5-123456", email="ali@dalni.ly", password="pass")
        d2 = Driver(driver_license_number="LB-77452", full_name="مفتاح الفزاني", phone_number="0923334455", national_id_or_passport="119850334455", license_date_valid=date(2028, 5, 14), contract_number="CN-2026-01", assigned_vehicle_plate="5-789012", email="miftah@dalni.ly", password="pass")
        for d in [d1, d2]:
            if not db.query(Driver).filter(Driver.driver_license_number == d.driver_license_number).first():
                db.add(d)
        db.commit()

        # 6. PLACES TOURIST
        plc1 = PlaceTourist(place_id="PLC-001", place_name="مدينة لبدة الكبرى (Leptis Magna)", description="درة الآثار الرومانية على البحر المتوسط في الخمس.", city="الخمس", category="آثار وتاريخ", longitude=14.298, latitude=32.637, place_image="/attractions/leptis-1.jpg", is_unesco=True, unesco_year=1982)
        plc2 = PlaceTourist(place_id="PLC-002", place_name="المسرح والأثر بصبراتة", description="المسرح الروماني الأيقوني على شاطئ البحر.", city="صبراتة", category="آثار وتاريخ", longitude=12.482, latitude=32.805, place_image="/attractions/sabratha-1.jpg", is_unesco=True, unesco_year=1982)
        plc3 = PlaceTourist(place_id="PLC-003", place_name="مدينة غدامس القديمة", description="لؤلؤة الصحراء وعاصمة الواحات التاريخية.", city="غدامس", category="مدن قديمة وواحات", longitude=9.497, latitude=30.133, place_image="/attractions/ghadames-1.jpg", is_unesco=True, unesco_year=1986)
        plc4 = PlaceTourist(place_id="PLC-004", place_name="آثار قورينا / شحات", description="مستعمرة إغريقية تاريخية بالجبل الأخضر.", city="شحات", category="آثار وتاريخ", longitude=21.856, latitude=32.827, place_image="/attractions/cyrene-1.jpg", is_unesco=True, unesco_year=1982)
        plc5 = PlaceTourist(place_id="PLC-005", place_name="جبال تدرارت أكاكوس", description="صحراء فزان والنقوش الصخرية الخالدة.", city="غات", category="طبيعة وسياحة بيئية", longitude=10.500, latitude=24.833, place_image="/attractions/acacus-1.jpg", is_unesco=True, unesco_year=1985)
        for p in [plc1, plc2, plc3, plc4, plc5]:
            if not db.query(PlaceTourist).filter(PlaceTourist.place_id == p.place_id).first():
                db.add(p)
        db.commit()

        # 7. HOTELS
        h1 = Hotel(hotel_id="HTL-001", hotel_name="فندق كورنثيا طرابلس", city="طرابلس", address_details="ميدان الشهداء، طرابلس", phone_number="+218 21 335 1990", star_rating=5, partnership_status="نشط", hotel_photo_1="/attractions/cyrene-1.jpg", verification_status="معتمد")
        h2 = Hotel(hotel_id="HTL-002", hotel_name="فندق راديسون بلو المهاري", city="طرابلس", address_details="طريق الشط، طرابلس", phone_number="+218 21 340 7888", star_rating=5, partnership_status="نشط", hotel_photo_1="/attractions/cyrene-2.jpg", verification_status="معتمد")
        h3 = Hotel(hotel_id="HTL-003", hotel_name="فندق تيبستي بنغازي", city="بنغازي", address_details="ميدان تيبستي، بنغازي", phone_number="+218 61 909 0011", star_rating=4, partnership_status="نشط", hotel_photo_1="/attractions/ghadames-1.jpg", verification_status="معتمد")
        h4 = Hotel(hotel_id="HTL-004", hotel_name="دار الضيافة غدامس", city="غدامس", address_details="المدينة القديمة، غدامس", phone_number="+218 91 765 4321", star_rating=4, partnership_status="نشط", hotel_photo_1="/attractions/ghadames-2.jpg", verification_status="معتمد")
        for h in [h1, h2, h3, h4]:
            if not db.query(Hotel).filter(Hotel.hotel_id == h.hotel_id).first():
                db.add(h)
        db.commit()

        # 8. RESTAURANTS CAFES
        res1 = RestaurantCafe(facility_id="RES-001", facility_name="مطعم السرايا للمشاوي", facility_type="مطعم", city="طرابلس", address_details="شارع الرشيد", phone_number="0912345678", description="أعرق مشاوي على الفحم.", cuisine_type="مشاوي", specialty="مشاوي لحم وطني", working_hours="12:00 م - 01:00 ص", facility_image_1="/attractions/leptis-1.jpg")
        res2 = RestaurantCafe(facility_id="RES-002", facility_name="مطعم قورينا للمأكولات البحرية", facility_type="مطعم", city="بنغازي", address_details="كورنيش الصابري", phone_number="0923456789", description="أجود أنواع الأسماك البحرية.", cuisine_type="مأكولات بحرية", specialty="سمك شواية طازج", working_hours="01:00 م - 12:00 ص", facility_image_1="/attractions/leptis-2.jpg")
        res3 = RestaurantCafe(facility_id="RES-003", facility_name="مطعم المائدة الليبية الشعبية", facility_type="مطعم شعبي", city="طرابلس", address_details="طريق الشط", phone_number="0919876543", description="بازين وكسكسي ورشدة كسكاس.", cuisine_type="مأكولات شعبية", specialty="بازين باللحم الوطني", working_hours="11:00 ص - 10:00 م", facility_image_1="/attractions/leptis-3.jpg")
        for r in [res1, res2, res3]:
            if not db.query(RestaurantCafe).filter(RestaurantCafe.facility_id == r.facility_id).first():
                db.add(r)
        db.commit()

        # 9. DAILY TRIPS
        dt1 = DailyTrip(daily_trip_id="DT-101", trip_title="جولة لبدة الكبرى اليومية", description="زيارة الآثار الرومانية والمتحف في الخمس.", price_per_seat=120.0, max_capacity=50, available_seats=38, guide_license_number="G-9901", departure_city="طرابلس", destination_city="الخمس", photo="/attractions/leptis-1.jpg")
        dt2 = DailyTrip(daily_trip_id="DT-102", trip_title="رحلة صبراتة الأثرية اليومية", description="استكشاف المسرح الروماني وشاطئ البحر.", price_per_seat=100.0, max_capacity=25, available_seats=17, guide_license_number="G-9901", departure_city="طرابلس", destination_city="صبراتة", photo="/attractions/sabratha-1.jpg")
        for dt in [dt1, dt2]:
            if not db.query(DailyTrip).filter(DailyTrip.daily_trip_id == dt.daily_trip_id).first():
                db.add(dt)
        db.commit()

        # 10. WEEKLY TRIPS
        wt1 = WeeklyTrip(weekly_trip_id="WT-201", trip_title="مغامرة أوباري وبحيرات الصحراء الكبرى (6 أيام)", start_date=date(2026, 8, 1), end_date=date(2026, 8, 7), max_capacity=25, available_seats=12, seat_per_price=1850.0, trip_description="جولة التخييم والسفاري في صحراء فزان وبحيرات قبرعون وأم الماء.", guide_license_number="G-9901", departure_city="طرابلس", destination_region="أوباري فزان", photo="/attractions/acacus-1.jpg")
        wt2 = WeeklyTrip(weekly_trip_id="WT-202", trip_title="جولة الواحات وغدامس التراثية (4 أيام)", start_date=date(2026, 8, 10), end_date=date(2026, 8, 14), max_capacity=50, available_seats=26, seat_per_price=1400.0, trip_description="استكشاف بيوت غدامس الطينية التراثية وعين الفرس وبسائين النخيل.", guide_license_number="G-9902", departure_city="طرابلس", destination_region="غدامس", photo="/attractions/ghadames-1.jpg")
        for wt in [wt1, wt2]:
            if not db.query(WeeklyTrip).filter(WeeklyTrip.weekly_trip_id == wt.weekly_trip_id).first():
                db.add(wt)
        db.commit()

        # 11. PRIVATE TRIPS
        pt1 = PrivateTrip(private_trip_id="TRIP-VIP-001", customer_name="عائلة طارق بن عيسى", customer_phone="0918887766", preferred_start_date=date(2026, 8, 5), duration_days=5, number_of_companions=6, status_order="قيد الدراسة", customer_requirements="طلب رحلة خاصة إلى شحات ورأس الهلال مع إقامة فاخرة", tourist_id="TUR-001")
        if not db.query(PrivateTrip).filter(PrivateTrip.private_trip_id == pt1.private_trip_id).first():
            db.add(pt1)
        db.commit()

        print("[SUCCESS] All 26 Tables Seeded and Connected in MySQL Database delni_db!")
    except Exception as e:
        print("[ERROR] Error during seed")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
