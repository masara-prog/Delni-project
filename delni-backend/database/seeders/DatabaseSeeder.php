<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tourist;
use App\Models\TourGuide;
use App\Models\TransportationCompany;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use App\Models\PlaceTourist;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database with authentic Libyan initial data.
     */
    public function run(): void
    {
        // 1. Admin User (users table)
        User::updateOrCreate(
            ['email' => 'admin@dalni.ly'],
            [
                'name' => 'مدير النظام (الأدمن)',
                'password' => Hash::make('admin123'),
            ]
        );

        // 2. Demo Tourist (tourists table)
        Tourist::updateOrCreate(
            ['email' => 'tourist@dalni.ly'],
            [
                'tourist_id' => 'T-1001',
                'full_name' => 'أحمد سالم المصراتي',
                'phone_number' => '0912223344',
                'password' => Hash::make('password123'),
            ]
        );

        // 3. Demo Tour Guide (tour_guides table)
        TourGuide::updateOrCreate(
            ['email' => 'salem@dalni.ly'],
            [
                'license_number' => 'G-9901',
                'full_name' => 'سالم القذافي',
                'phone_number' => '0917778888',
                'years_of_experience' => 7,
                'certificate' => 'ترخيص وزارة السياحة والآثار رقم 4421',
                'bio' => 'مرشد سياحي معتمد ومحب لاستكشاف معالم ليبيا التاريخية والطبيعية. متخصص في الجولات الأثرية في لبدة وصبراتة وقورينا، وسفاري الصحراء.',
                'speaks_english' => true,
                'speaks_french' => false,
                'speaks_italian' => true,
                'verification_status' => 'موثق',
                'password' => Hash::make('password123'),
                'gender' => 'male',
                'working_days' => json_encode(['sat', 'sun', 'mon', 'tue', 'wed', 'thu']),
                'operating_regions' => json_encode(['tripoli', 'leptis', 'sabratha']),
                'primaryRegion' => 'طرابلس والساحل الغربي',
                'price_per_day' => 150,
                'avatar' => '/assets/ai_desert.jpg',
                'title' => 'خبير الإرشاد الأثري والصحراوي',
                'specialties' => 'آثار رومانية، سفاري الواحات، جولات تاريخية',
                'total_tours_completed' => 48,
            ]
        );

        // 4. Demo Transportation Company (transportation_companies table)
        TransportationCompany::updateOrCreate(
            ['contract_number' => 'TC-501'],
            [
                'company_name' => 'شركة الصفوة لنقل الركاب والسياحة',
                'phone_number' => '0913334455',
                'email' => 'safwa@dalni.ly',
                'address' => 'طرابلس - طريق الشط',
                'city' => 'طرابلس',
                'password' => Hash::make('password123'),
                'verification_status' => 'موثق',
                'total_vehicles' => 12,
                'available_vehicles' => 8,
                'contract_date' => '2025-01-15',
                'contract_start_date' => '2025-01-15',
                'contract_end_date' => '2028-01-15',
            ]
        );

        // 5. Vehicles (Created BEFORE Drivers due to foreign key)
        Vehicle::updateOrCreate(
            ['plate_number' => 'TRIPOLI-4517'],
            [
                'contract_number' => 'TC-501',
                'vehicle_type' => 'حافلة مرسيدس سياحية فاخرة (50 راكب)',
                'seating_capacity' => 50,
                'daily_rate' => 600,
                'vehicle_status' => 'جاهزة',
            ]
        );

        // 6. Demo Driver (drivers table)
        Driver::updateOrCreate(
            ['driver_license_number' => 'DL-901'],
            [
                'full_name' => 'طارق عبد السلام الزاوي',
                'phone_number' => '0925556677',
                'license_date_valid' => '2028-12-31',
                'national_id_or_passport' => '119900334455',
                'contract_number' => 'TC-501',
                'assigned_vehicle_plate' => 'TRIPOLI-4517',
                'email' => 'tariq@dalni.ly',
                'password' => Hash::make('password123'),
                'account_status' => 'نشط',
            ]
        );

        // 7. Daily Trips
        DailyTrip::updateOrCreate(
            ['daily_trip_id' => 'DT-101'],
            [
                'trip_title' => 'جولة لبدة الكبرى الأثرية المتكاملة',
                'description' => 'استكشاف معالم لبدة الكبرى، المسرح الروماني، قوس سبتيموس سيفيروس، وحمامات هادريان برفقة مرشد سياحي معتمد.',
                'departure_city' => 'طرابلس',
                'destination_city' => 'الخمس',
                'price_per_seat' => 120,
                'max_capacity' => 50,
                'available_seats' => 42,
                'guide_license_number' => 'G-9901',
                'is_active' => true,
                'photo' => '/assets/dest-leptis.jpg',
                'recurring_days' => 'الأحد,الثلاثاء,الخميس',
            ]
        );

        DailyTrip::updateOrCreate(
            ['daily_trip_id' => 'DT-102'],
            [
                'trip_title' => 'رحلة مسرح صبراتة والساحل الغربي',
                'description' => 'زيارة المسرح الروماني التاريخي في صبراتة ومتحف الفسيفساء الأثري والميناء القديم.',
                'departure_city' => 'طرابلس',
                'destination_city' => 'صبراتة',
                'price_per_seat' => 100,
                'max_capacity' => 25,
                'available_seats' => 17,
                'guide_license_number' => 'G-9901',
                'is_active' => true,
                'photo' => '/assets/dest-sabratah.png',
                'recurring_days' => 'السبت,الأربعاء',
            ]
        );

        // 8. Weekly Trips
        WeeklyTrip::updateOrCreate(
            ['weekly_trip_id' => 'WT-201'],
            [
                'trip_title' => 'مغامرة أوباري وبحيرات الصحراء الكبرى (6 أيام)',
                'trip_description' => 'سفاري الكثبان الرملية الذهبية، التخييم في واحات بحيرة قبر عون وأم الماء، وجولات سيارات الدفع الرباعي 4x4.',
                'departure_city' => 'طرابلس / سبها',
                'destination_region' => 'فزان والصحراء الكبرى',
                'start_date' => '2026-11-01',
                'end_date' => '2026-11-06',
                'seat_per_price' => 1850,
                'max_capacity' => 25,
                'available_seats' => 12,
                'guide_license_number' => 'G-9901',
                'is_active' => true,
                'photo' => '/assets/dest-ubari.jpg',
            ]
        );

        // 9. Tourist Places
        PlaceTourist::updateOrCreate(
            ['place_id' => 'PL-01'],
            [
                'place_name' => 'لبدة الكبرى (Leptis Magna)',
                'city' => 'الخمس',
                'category' => 'آثار رومانية - يونسكو',
                'description' => 'واحدة من أبرز وأجمل المدن الأثرية الرومانية في حوض المتوسط، تضم مسرحاً مهيباً وقوس سبتيموس وحمامات هادريان.',
                'place_image' => '/assets/dest-leptis.jpg',
                'latitude' => 32.6358,
                'longitude' => 14.2975,
                'is_unesco' => true,
                'unesco_year' => 1982,
            ]
        );

        PlaceTourist::updateOrCreate(
            ['place_id' => 'PL-02'],
            [
                'place_name' => 'مسرح صبراتة الأثري',
                'city' => 'صبراتة',
                'category' => 'آثار رومانية وفينيقية - يونسكو',
                'description' => 'مسرح روماني ساحلي بديع بهيكل معماري متفرد ذي ثلاثة طوابق من الأعمدة الرخامية البديعة المطلة على البحر.',
                'place_image' => '/assets/dest-sabratah.png',
                'latitude' => 32.7933,
                'longitude' => 12.4842,
                'is_unesco' => true,
                'unesco_year' => 1982,
            ]
        );

        PlaceTourist::updateOrCreate(
            ['place_id' => 'PL-03'],
            [
                'place_name' => 'بحيرات أوباري وقبر عون',
                'city' => 'أوباري - فزان',
                'category' => 'سياحة صحراوية وواحات طبيعية',
                'description' => 'بحيرات مائية عذبة ومالحة تحتضنها كثبان الرمال الذهبية الشاهقة في واحدة من أندر الظواهر الطبيعية في الصحراء الكبرى.',
                'place_image' => '/assets/dest-ubari.jpg',
                'latitude' => 26.5833,
                'longitude' => 12.7667,
                'is_unesco' => false,
            ]
        );
    }
}
