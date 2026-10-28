# التوثيق الشامل والتفصيلي لقاعدة بيانات منصة دَلّني السياحية
## Delni Platform - Database Full Documentation (Microsoft SQL Server)

---

### أ. معلومات عامة عن قاعدة البيانات (General Information)
- **اسم قاعدة البيانات الفعلي:** `DelniDB`
- **نظام إدارة قواعد البيانات (RDBMS):** Microsoft SQL Server (Transact-SQL)
- **بروتوكول الاتصال:** Microsoft ODBC Driver 18 for SQL Server (`Driver={ODBC Driver 18 for SQL Server};Server=localhost;Database=DelniDB;Trusted_Connection=yes;TrustServerCertificate=yes;`)
- **حالة التطبيع (Normalization Level):** 100% Third Normal Form (3NF) - مع إزالة كافة الحقول المشتقة والمكررة وفصل العلاقات المتعددة (M:N) وجداول المحطات (Composition 1:N).
- **تاريخ إعداد وتحديث التوثيق:** 27 أكتوبر 2026
- **فريق العمل الهندسي:** مهندس اختبار البرمجيات وجودة النظم وقواعد البيانات (QA & Database Engineering).

---

### ب. قائمة الجداول الإجمالية وتصنيف وظائفها (All Tables Summary)
تحتوي قاعدة بيانات **DelniDB** حالياً على **39 جدولاً معتمداً** مصنفة كما يلي:

1. **جداول المستخدمين والحسابات:** `tourists` (السياح), `tour_guides` (المرشدون السياحيون), `transportation_companies` (شركات النقل), `drivers` (السائقون).
2. **جداول النقل والأسطول:** `vehicles` (المركبات والحافلات).
3. **جداول المعالم السياحية:** `places_tourist` (المعالم الرئيسية), `places_tourist_highlights` (المميزات والنقاط الفرعية).
4. **جداول الضيافة والخدمات:** `hotels` (الفنادق), `hotel_amenities` (مرافق الفنادق), `restaurants_cafes` (المطاعم والكافيهات), `restaurant_features` (مزايا المطاعم).
5. **جداول الرحلات اليومية:** `daily_trips`, `daily_trip_stations`, `daily_trip_days`, `places_trip_daily`, `bookings_daily`, `offers_daily_trips`.
6. **جداول الرحلات الأسبوعية:** `weekly_trips`, `weekly_trip_stations`, `places_trip_weekly`, `hotels_trip_weekly`, `restaurants_trip_weekly`, `bookings_weekly`, `offers_weekly_trips`.
7. **جداول الرحلات الخاصة (VIP):** `private_trips`, `private_trip_stations`, `places_trip_private`, `hotels_trip_private`.
8. **جداول التقييمات والمفضلة:** `reviews_daily_trips`, `reviews_weekly_trips`, `reviews_facilities`, `tourist_favorites`.
9. **جداول الإشعارات والتشغيل:** `notifications`, `guide_places`, `guide_operating_regions`, `guide_working_days`.

---

### ج. قاموس البيانات وتفاصيل الجداول الحيوية (Data Dictionary & Schema Details)

#### 1. جدول السياح (`dbo.tourists`)
- **الغرض:** حفظ وإدارة بيانات حسابات السياح المسجلين في المنصة.
- **الحقول:**
  - `tourist_id` (VARCHAR(50), PK): المعرف الفريد للسائح (مثل رقم الهوية أو معرف التوليد).
  - `full_name` (NVARCHAR(150), NOT NULL): الاسم الرباعي الكامل للسائح.
  - `email` (NVARCHAR(100), NOT NULL, UNIQUE): البريد الإلكتروني لتسجيل الدخول والمراسلات.
  - `phone_number` (NVARCHAR(20), NOT NULL, UNIQUE): رقم الهاتف الليبي المعتمد للتواصل وتأكيد الحجز.
  - `password` (NVARCHAR(255), NOT NULL): كلمة المرور مشفرة ومملحة بنظام PBKDF2-SHA256 (ممنوع تخزين نصوص صريحة).
  - `account_status` (NVARCHAR(50), DEFAULT 'نشط'): حالة الحساب ('نشط' للسماح بالحجز، 'مقيّد' لمنع الحجز، 'معلّق').
  - `created_at` (DATETIME, DEFAULT GETDATE()): تاريخ ووقت إنشاء الحساب.

#### 2. جدول الرحلات الخاصة (`dbo.private_trips`)
- **الغرض:** إدارة طلبات الرحلات الخاصة المصممة حسب رغبة السائح من البداية وحتى الاعتماد.
- **الحقول:**
  - `private_trip_id` (VARCHAR(50), PK): المعرف الفريد لطلب الرحلة الخاصة (مثل `PRV-1002`).
  - `tourist_id` (VARCHAR(50), FK -> `tourists.tourist_id`, NOT NULL): السائح صاحب الطلب (تم حذف الاسم والهاتف لمنع التكرار وتحقيق الـ 3NF).
  - `status_order` (NVARCHAR(50), DEFAULT 'بانتظار تسعير الإدارة'): دورة حالة الطلب ('قيد الدراسة'، 'بانتظار موافقة السائح'، 'مؤكدة'، 'ملغاة').
  - `preferred_start_date` (DATE, NOT NULL): تاريخ الانطلاق المرغوب (مفروض شرط 10 أيام مسبقاً على الأقل).
  - `duration_days` (INT, DEFAULT 1): مدة الرحلة بالأيام.
  - `number_of_companions` (INT, DEFAULT 1): عدد الأفراد والمرافقين في الرحلة.
  - `quoted_price` (DECIMAL(10,2), NULL): السعر النهائي المحدد والمقترح من قبل إدارة المنصة بعد دراسة المسار.
  - `vehicle_plate` (VARCHAR(30), FK -> `vehicles.plate_number`, NULL): الحافلة أو المركبة المعتمدة المخصصة للرحلة.
  - `guide_license_number` (NVARCHAR(50), FK -> `tour_guides.license_number`, NULL): المرشد السياحي المرخص المخصص.
  - `customer_requirements` (NVARCHAR(MAX), NULL): متطلبات السائح الخاصة وتفاصيل المسار وملاحظات الإدارة.
  - `created_at` (DATETIME, DEFAULT GETDATE()): تاريخ ووقت تقديم الطلب.

#### 3. جدول محطات الرحلات الخاصة (`dbo.private_trip_stations`)
- **الغرض:** تمثيل البرنامج الزمني لمحطات الرحلة الخاصة ككيانات علائقية مستقلة (1:N) بدلاً من النصوص العشوائية.
- **الحقول:**
  - `station_id` (VARCHAR(50), PK): معرف المحطة الفريد.
  - `private_trip_id` (VARCHAR(50), FK -> `private_trips.private_trip_id`, NOT NULL, ON DELETE CASCADE): معرف الرحلة التابعة لها.
  - `day_number` (INT, NOT NULL): رقم اليوم في برنامج الرحلة (اليوم 1، اليوم 2، إلخ).
  - `station_order` (INT, NOT NULL): ترتيب المحطة خلال اليوم.
  - `station_title` (NVARCHAR(200), NOT NULL): عنوان المحطة (مثل "زيارة قلعة طرابلس السرايا الحمراء").
  - `station_time` (VARCHAR(30), NULL): وقت الوصول المتوقع (مثل "09:30 ص").
  - `station_desc` (NVARCHAR(MAX), NULL): شرح النشاط السياحي داخل المحطة.

#### 4. جدول ربط فنادق الرحلات الخاصة (`dbo.hotels_trip_private`)
- **الغرض:** جدول وسيط علائقي (Junction Table M:N) يسمح للإدارة بربط أكثر من فندق للرحلة الخاصة المتعددة الأيام.
- **الحقول:**
  - `private_trip_id` (VARCHAR(50), FK -> `private_trips.private_trip_id`, ON DELETE CASCADE).
  - `hotel_id` (VARCHAR(50), FK -> `hotels.hotel_id`, ON DELETE CASCADE).
  - **المفتاح الأساسي المركب:** `PK (private_trip_id, hotel_id)`.

#### 5. جدول ربط معالم الرحلات الخاصة (`dbo.places_trip_private`)
- **الغرض:** جدول وسيط (M:N) لتوثيق المعالم السياحية المختارة من المنصة التي يرغب السائح في زيارتها.
- **الحقول:**
  - `private_trip_id` (VARCHAR(50), FK -> `private_trips.private_trip_id`, ON DELETE CASCADE).
  - `place_id` (VARCHAR(50), FK -> `places_tourist.place_id`, ON DELETE CASCADE).
  - `visit_order` (INT, DEFAULT 1): ترتيب الزيارة المفضل.
  - **المفتاح الأساسي المركب:** `PK (private_trip_id, place_id)`.

#### 6. جدول المركبات والأسطول (`dbo.vehicles`)
- **الغرض:** إدارة الحافلات والسيارات السياحية التابعة لشركات النقل المرخصة.
- **الحقول:**
  - `plate_number` (VARCHAR(30), PK): رقم لوحة المركبة المعتمدة من المرور الليبي.
  - `company_contract_number` (VARCHAR(50), FK -> `transportation_companies.contract_number`): شركة النقل المالكة.
  - `vehicle_type` (NVARCHAR(50)): نوع المركبة (حافلة كبيرة، ميني باص، دفع رباعي صحراوي).
  - `passenger_capacity` (INT): سعة الركاب المقاعدية.
  - `vehicle_condition` (NVARCHAR(50)): الحالة الفنية (ممتازة، جيدة جداً).
  - `operational_status` (NVARCHAR(50)): الحالة التشغيلية ('جاهزة للعمل'، 'في الصيانة').

#### 7. جدول السائقين (`dbo.drivers`)
- **الغرض:** إدارة بيانات السائقين المحترفين التابعين لشركات النقل.
- **الحقول:**
  - `driver_license_number` (VARCHAR(50), PK): رقم رخصة القيادة المهنية.
  - `company_contract_number` (VARCHAR(50), FK -> `transportation_companies.contract_number`): الشركة التابع لها.
  - `assigned_vehicle_plate` (VARCHAR(30), FK -> `vehicles.plate_number`): الحافلة المخصصة للسائق.
  - `full_name` (NVARCHAR(150), NOT NULL): الاسم الكامل للسائق.
  - `phone_number` (NVARCHAR(20), NOT NULL): رقم الهاتف المباشر.
  - `driver_status` (NVARCHAR(50)): الحالة ('متاح'، 'في رحلة'، 'إجازة').

#### 8. جدول الإشعارات الموحدة (`dbo.notifications`)
- **الغرض:** تخزين وإدارة الإشعارات الفورية لكافة أطراف المنصة مع دعم عزل الصلاحيات ومنع التكرار (Deduplication).
- **الحقول:**
  - `id` (VARCHAR(50), PK): المعرف الفريد للإشعار.
  - `type` (NVARCHAR(50)): نوع الإشعار ('private_trip', 'booking', 'system').
  - `title` (NVARCHAR(255), NOT NULL): عنوان الإشعار.
  - `body` (NVARCHAR(MAX), NOT NULL): نص وتفاصيل الإشعار.
  - `recipient_role` (NVARCHAR(50), NOT NULL): دور المستلم ('tourist', 'admin', 'guide', 'company', 'all').
  - `recipient_id` (NVARCHAR(100), NULL): معرف المستخدم المستلم (لعزل الإشعارات الشخصية).
  - `is_read` (BIT, DEFAULT 0): حالة القراءة (0 = غير مقروء، 1 = مقروء).
  - `dedupe_key` (VARCHAR(100), NULL, INDEX): مفتاح منع التكرار البرمجي.
  - `created_at` (DATETIME, DEFAULT GETDATE()): وقت إرسال الإشعار.

---

### د. خريطة العلاقات ونزاهة المفاتيح الخارجية (Referential Integrity Map)
1. **السائح -> الرحلة الخاصة (1:N):** `private_trips.tourist_id -> tourists.tourist_id` (ON DELETE CASCADE).
2. **الرحلة الخاصة -> المحطات (1:N):** `private_trip_stations.private_trip_id -> private_trips.private_trip_id` (ON DELETE CASCADE).
3. **الرحلة الخاصة -> الفنادق (M:N):** عبر `hotels_trip_private` بمفاتيح خارجية صريحة لكلا الجدولين.
4. **الرحلة الخاصة -> المعالم (M:N):** عبر `places_trip_private`.
5. **الرحلة الخاصة -> الحافلة (N:1):** `private_trips.vehicle_plate -> vehicles.plate_number`.
6. **المركبة -> شركة النقل (N:1):** `vehicles.company_contract_number -> transportation_companies.contract_number`.
7. **السائق -> المركبة (1:1 / N:1):** `drivers.assigned_vehicle_plate -> vehicles.plate_number`.
8. **التقييمات -> السياح (N:1):** كل تقييم في `reviews_daily_trips`, `reviews_weekly_trips`, `reviews_facilities` مرتبط بمفتاح أجنبي بـ `tourists.tourist_id`.

---

### هـ. قواعد العمل المنطقية (Business Logic Rules)
1. **عزل الصلاحيات في الحجز:** يمنع منعاً باتاً حجز أي رحلة خاصة أو عامة إلا من خلال حساب سائح نشط (`account_status = 'نشط'`).
2. **قاعدة الـ 10 أيام المسبقة:** لا يمكن قبول أو تقديم أي طلب رحلة خاصة يكون تاريخ انطلاقها خلال أقل من 10 أيام من تاريخ اليوم، لإتاحة الوقت لدراسة المسار واعتماده والتنسيق مع شركة النقل والمرشد.
3. **حماية التقييم المزدوج:** يمنع السائح من تقديم أكثر من تقييم لنفس الرحلة أو المنشأة عبر قيد `UNIQUE (tourist_id, entity_id)`، مع السماح بتحديث التقييم السابق (Upsert).
4. **العزل التام للرحلات الخاصة:** لا تظهر الرحلات الخاصة نهائياً في جداول أو استعلامات أو صفحات الرحلات العامة اليومية أو الأسبوعية.
