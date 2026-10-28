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
        // 1. Admin login handled directly via Bridge API

        // 2. Demo Tourist (tourists table)
        Tourist::updateOrCreate(
            ['email' => 'tourist@dalni.ly'],
            [
                'tourist_id' => 'T-1001',
                'full_name' => 'أحمد سالم المصراتي',
                'phone_number' => '0912223344',
                'password' => $this->hashPbkdf2('password123'),
                'account_status' => 'نشط',
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
                'bio' => 'مرشد سياحي معتمد ومحب لاستكشاف معالم ليبيا التاريخية والطبيعية. متخصص في الجولات الأثرية في لبدة وصبراتة وقورينا، وسفاري الصحراء.',
                'speaks_english' => true,
                'speaks_french' => false,
                'speaks_italian' => true,
                'verification_status' => 'موثق',
                'password' => $this->hashPbkdf2('password123'),
                'gender' => 'male',
                'price_per_day' => 150,
                'avatar' => '/assets/ai_desert.jpg',
            ]
        );

        // 3b. Tour Guide "دلني" (Requested by user)
        TourGuide::updateOrCreate(
            ['email' => 'delni@gmail.com'],
            [
                'license_number' => 'k938474',
                'full_name' => 'مرشد دلني',
                'phone_number' => '0915554433',
                'years_of_experience' => 5,
                'bio' => 'مرشد سياحي رسمي في منصة دلني لرحلات وسياحة ليبيا.',
                'speaks_english' => true,
                'speaks_french' => false,
                'speaks_italian' => false,
                'verification_status' => 'موثق',
                'password' => $this->hashPbkdf2('12345678'),
                'gender' => 'male',
                'price_per_day' => 120,
            ]
        );

        // 4. Demo Transportation Company (transportation_companies table)
        TransportationCompany::updateOrCreate(
            ['contract_number' => 'TC-501'],
            [
                'company_name' => 'شركة الصفوة لنقل الركاب والسياحة',
                'phone_number' => '0913334455',
                'email' => 'safwa@dalni.ly',
                'city' => 'طرابلس',
                'password' => $this->hashPbkdf2('password123'),
                'verification_status' => 'موثق',
                'total_vehicles' => 12,
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
                'password' => $this->hashPbkdf2('password123'),
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
                'price_per_seat' => 120,
                'max_capacity' => 50,
                'available_seats' => 42,
                'guide_license_number' => 'G-9901',
                'is_active' => true,
                'photo_1' => '/assets/dest-leptis.jpg',
            ]
        );

        DailyTrip::updateOrCreate(
            ['daily_trip_id' => 'DT-102'],
            [
                'trip_title' => 'رحلة مسرح صبراتة والساحل الغربي',
                'description' => 'زيارة المسرح الروماني التاريخي في صبراتة ومتحف الفسيفساء الأثري والميناء القديم.',
                'departure_city' => 'طرابلس',
                'price_per_seat' => 100,
                'max_capacity' => 25,
                'available_seats' => 17,
                'guide_license_number' => 'G-9901',
                'is_active' => true,
                'photo_1' => '/assets/dest-sabratah.png',
            ]
        );

        // 8. Weekly Trips
        WeeklyTrip::updateOrCreate(
            ['weekly_trip_id' => 'WT-201'],
            [
                'trip_title' => 'مغامرة أوباري وبحيرات الصحراء الكبرى (6 أيام)',
                'departure_city' => 'طرابلس / سبها',
                'start_date' => '2026-11-01',
                'end_date' => '2026-11-06',
                'seat_per_price' => 1850,
                'max_capacity' => 25,
                'available_seats' => 12,
                'guide_license_number' => 'G-9901',
                'is_active' => true,
                'photo_1' => '/assets/dest-ubari.jpg',
            ]
        );

        // 9. Tourist Places
        PlaceTourist::updateOrCreate(
            ['place_id' => 'PL-01'],
            [
                'place_name' => 'لبدة الكبرى (Leptis Magna)',
                'city' => 'الخمس',
                'category' => 'آثار رومانية',
                'description' => 'واحدة من أبرز وأجمل المدن الأثرية الرومانية في حوض المتوسط، تضم مسرحاً مهيباً وقوس سبتيموس وحمامات هادريان.',
                'place_image' => '/assets/dest-leptis.jpg',
                'latitude' => 32.6358,
                'longitude' => 14.2975,
            ]
        );

        PlaceTourist::updateOrCreate(
            ['place_id' => 'PL-02'],
            [
                'place_name' => 'مسرح صبراتة الأثري',
                'city' => 'صبراتة',
                'category' => 'آثار رومانية وفينيقية',
                'description' => 'مسرح روماني ساحلي بديع بهيكل معماري متفرد ذي ثلاثة طوابق من الأعمدة الرخامية البديعة المطلة على البحر.',
                'place_image' => '/assets/dest-sabratah.png',
                'latitude' => 32.7933,
                'longitude' => 12.4842,
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
            ]
        );
    }

    private function hashPbkdf2(string $password): string
    {
        $salt = bin2hex(random_bytes(16));
        $hash = hash_pbkdf2('sha256', $password, $salt, 1000, 128);
        return "{$salt}:{$hash}";
    }
}
