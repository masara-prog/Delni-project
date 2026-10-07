<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\DailyTrip;
use App\Models\WeeklyTrip;
use App\Models\PlaceTourist;

class AiController extends Controller
{
    /**
     * Libyan destinations knowledge base
     */
    protected array $destinations = [
        'لبدة الكبرى' => [
            'city' => 'الخمس',
            'type' => 'آثار رومانية - يونسكو',
            'description' => 'واحدة من أجمل وأكبر المدن الرومانية الأثرية في حوض البحر الأبيض المتوسط، تضم المسرح والكابيتول وقوس سبتيموس سيفيروس وميدان السيفيران.',
            'best_season' => 'الربيع والخريف والشتاء',
            'trips' => ['جولة لبدة الكبرى اليومية', 'رحلة لبدة والساحل المرقبي'],
        ],
        'صبراتة' => [
            'city' => 'صبراتة',
            'type' => 'آثار فينيقية ورومانية - يونسكو',
            'description' => 'تشتهر بمسرحها الروماني الساحلي المطل على البحر المتوسط ومتحف الفسيفساء الأثري ومينائها القديم.',
            'best_season' => 'على مدار العام',
            'trips' => ['رحلة صبراتة الأثرية اليومية'],
        ],
        'بحيرات أوباري' => [
            'city' => 'أوباري - فزان',
            'type' => 'سياحة صحراوية وواحات',
            'description' => 'بحيرة قبر عون وأم الماء والطرونة بين كثبان الرمال الذهبية في الصحراء الكبرى، مثالية لرحلات التخييم والسفاري.',
            'best_season' => 'من نوفمبر حتى مارس',
            'trips' => ['مغامرة أوباري وبحيرات الصحراء (6 أيام)', 'سفاري وادي الحياة وقبر عون'],
        ],
        'غدامس' => [
            'city' => 'غدامس',
            'type' => 'تراث صحراوي ومعماري - يونسكو',
            'description' => 'لؤلؤة الصحراء بممراتها المسقوفة ونظام توزيع المياه التراثي وعين الفرس وعمارتها الطينية الفريدة.',
            'best_season' => 'من أكتوبر حتى أبريل',
            'trips' => ['رحلة غدامس لؤلؤة الصحراء الأسبوعية'],
        ],
        'قورينا وشحات' => [
            'city' => 'شحات - الجبل الأخضر',
            'type' => 'آثار إغريقية ويونانية - يونسكو',
            'description' => 'مدينة قورينا التاريخية، معبد أبولو، النوافير المقدسة، ومناظر الجبل الأخضر الخلابة وغابات وادي الكوف.',
            'best_season' => 'الربيع والصيف والخريف',
            'trips' => ['رحلة الجبل الأخضر وقورينا الأسبوعية'],
        ],
        'جبال أكاكوس' => [
            'city' => 'غات',
            'type' => 'نقوش صخرية وتراث عالمي - يونسكو',
            'description' => 'متحف مفتوح في الهواء الطلق للوحات والنقوش الصخرية التي تعود لآلاف السنين وأقواس صخرية طبيعية مهيبة.',
            'best_season' => 'من نوفمبر حتى مارس',
            'trips' => ['رحلة اكتشاف أكاكوس وغات الكبرى'],
        ],
    ];

    /**
     * Intelligent Tourism Chat Endpoint
     */
    public function chat(Request $request)
    {
        $message = $request->input('message', '');
        if (empty($message)) {
            return response()->json([
                'reply' => 'مرحباً بك في منصة دَلِّني السياحية! 🌟 كيف يمكنني مساعدتك اليوم؟',
                'suggested_places' => ['لبدة الكبرى', 'بحيرات أوباري', 'غدامس', 'شحات'],
                'suggested_trips' => ['جولة لبدة الكبرى اليومية', 'مغامرة أوباري الصحراوية'],
                'source' => 'delni_ai_core',
            ]);
        }

        // Try proxying to Python microservice first if running
        try {
            $pyResponse = Http::timeout(2)->post('http://127.0.0.1:8001/api/ai/chat', [
                'message' => $message,
                'user_type' => $request->input('user_type', 'tourist'),
            ]);

            if ($pyResponse->successful()) {
                $data = $pyResponse->json();
                $data['source'] = 'python_fastapi';
                return response()->json($data);
            }
        } catch (\Throwable $e) {
            // Python service offline, fall back to native intelligent engine
        }

        // Native Intelligent Libyan Assistant
        $lower = mb_strtolower($message, 'UTF-8');
        $suggestedPlaces = [];
        $suggestedTrips = [];
        $reply = '';

        if (str_contains($lower, 'أوباري') || str_contains($lower, 'صحراء') || str_contains($lower, 'سفاري') || str_contains($lower, 'قبر عون')) {
            $dest = $this->destinations['بحيرات أوباري'];
            $reply = "أهلاً بك في سحر الصحراء الليبية! 🐪 بحيرات أوباري (خاصة بحيرة قبر عون وأم الماء) من أروع الوجهات الطبيعية العالمية. ننصحك بزيارتها خلال موسم الشتاء (نوفمبر - مارس). توفر المنصة رحلات أسبوعية بسيارات دفع رباعي مجهزة وسائقين محليين محترفين.";
            $suggestedPlaces = ['بحيرات أوباري', 'قبر عون', 'تكركيبة'];
            $suggestedTrips = $dest['trips'];
        } elseif (str_contains($lower, 'لبدة') || str_contains($lower, 'رومان') || str_contains($lower, 'خمس')) {
            $dest = $this->destinations['لبدة الكبرى'];
            $reply = "مرحباً بك! 🏛️ لبدة الكبرى بالخمس تعد من أكبر وأروع المدن الرومانية المحفوظة في العالم ومصنفة ضمن قائمة التراث العالمي لليونسكو. لدينا رحلات يومية تنطلق صباحاً من طرابلس تشمل الانتقال والتذكرة والإرشاد السياحي.";
            $suggestedPlaces = ['لبدة الكبرى', 'قوس سبتيموس', 'متحف لبدة'];
            $suggestedTrips = $dest['trips'];
        } elseif (str_contains($lower, 'صبراتة') || str_contains($lower, 'مسرح')) {
            $dest = $this->destinations['صبراتة'];
            $reply = "أهلاً بك! 🎭 صبراتة الأثرية تقع على الساحل الغربي وتشتهر بمسرحها الروماني الأسطوري ذي الواجهة ذات الأعمدة الرخامية البديعة المطلة على البحر. تنظم المنصة رحلات يومية إليها أسبوعياً.";
            $suggestedPlaces = ['مسرح صبراتة', 'المدينة الفينيقية', 'متحف صبراتة'];
            $suggestedTrips = $dest['trips'];
        } elseif (str_contains($lower, 'غدامس')) {
            $dest = $this->destinations['غدامس'];
            $reply = "مرحباً بك في لؤلؤة الصحراء! 🌴 غدامس تتميز بطرازها المعماري الفريد وممراتها المظللة المصممة للوقاية من حرارة الشمس وعين الفرس التاريخية. لدينا برامج رحلات أسبوعية كاملة تشمل الإقامة والوجبات التراثية.";
            $suggestedPlaces = ['غدامس القديمة', 'عين الفرس', 'متحف غدامس'];
            $suggestedTrips = $dest['trips'];
        } elseif (str_contains($lower, 'شحات') || str_contains($lower, 'قورينا') || str_contains($lower, 'جبل أخضر')) {
            $dest = $this->destinations['قورينا وشحات'];
            $reply = "أهلاً بك في الجبل الأخضر! 🌿 قورينا (شحات) كانت عاصمة الإغريق في شمال إفريقيا، وتتميز بطبيعتها الخلابة ومعابدها التاريخية كمعبد زيوس وأبولو ووادي الكوف الجميل.";
            $suggestedPlaces = ['قورينا (شحات)', 'معبد أبولو', 'وادي الكوف'];
            $suggestedTrips = $dest['trips'];
        } elseif (str_contains($lower, 'حجز') || str_contains($lower, 'سعر') || str_contains($lower, 'تكلفة')) {
            $reply = "يمكنك استعراض كافة الرحلات اليومية والأسبوعية والأسعار مباشرة من قسم 'الرحلات'. الأسعار تشمل النقل المريح والإرشاد السياحي، ويمكنك الدفع نقداً عند التجمع أو عبر المنصة.";
            $suggestedPlaces = ['طرابلس', 'لبدة الكبرى', 'أوباري'];
            $suggestedTrips = ['جولة لبدة الكبرى اليومية', 'مغامرة أوباري الصحراوية'];
        } elseif (str_contains($lower, 'مرشد') || str_contains($lower, 'دليل')) {
            $reply = "منصة دلّني توفر قائمة بمرشدين سياحيين معتمدين ومرخصين من وزارة السياحة يتحدثون لغات متعددة (عربي، إنجليزي، إيطالي، فرنسي). يمكنك اختيار المرشد الأنسب لرحلتك من تبويب 'المرشدون'.";
            $suggestedPlaces = ['لبدة الكبرى', 'شحات', 'صبراتة'];
            $suggestedTrips = ['جولة خاصة مع مرشد سياحي'];
        } else {
            $reply = "مرحباً بك في منصة دَلِّني السياحية! 🌟 أنا مساعدك السياحي الذكي الذاتي، يسعدني إرشادك لأجمل الوجهات السياحية والأثرية والصحراوية في ليبيا وتنظيم برنامج سفرك.";
            $suggestedPlaces = ['لبدة الكبرى', 'صبراتة', 'بحيرات أوباري', 'غدامس', 'قورينا'];
            $suggestedTrips = ['جولة لبدة الكبرى اليومية', 'مغامرة أوباري وبحيرات الصحراء'];
        }

        return response()->json([
            'reply' => $reply,
            'suggested_places' => $suggestedPlaces,
            'suggested_trips' => $suggestedTrips,
            'source' => 'delni_ai_native',
        ]);
    }

    /**
     * Automated VIP Itinerary Planning Endpoint
     */
    public function planTrip(Request $request)
    {
        $durationDays = (int) $request->input('duration_days', 3);
        $companions = (int) $request->input('companions_count', 1);

        $plans = [];
        for ($i = 1; $i <= $durationDays; $i++) {
            if ($i === 1) {
                $plans[] = [
                    'day_number' => 1,
                    'title' => 'طرابلس العاصمة والمدينة القديمة',
                    'morning' => 'جولة في السرايا الحمراء وأسواق الصاغة وسوق القزدارة بالمدينة القديمة',
                    'afternoon' => 'غداء بمطعم بحري مطل على الميناء وزيارة قوس ماركوس أوريليوس',
                    'evening' => 'استراحة بمقهى تراثي في زنقة الفرنسيس وممشى كورنيش طرابلس',
                    'stay_city' => 'طرابلس',
                ];
            } elseif ($i === 2) {
                $plans[] = [
                    'day_number' => 2,
                    'title' => 'عجائب لبدة الكبرى والتراث الروماني',
                    'morning' => 'الانطلاق صباحاً نحو الخمس وزيارة مدرج لبدة وقوس سبتيموس سيفيروس',
                    'afternoon' => 'جولة في حمامات هادريان والميدان السيفيري ومتحف لبدة',
                    'evening' => 'تناول وجبة غداء تقليدية والعودة إلى طرابلس وقت الغروب',
                    'stay_city' => 'طرابلس',
                ];
            } elseif ($i === 3) {
                $plans[] = [
                    'day_number' => 3,
                    'title' => 'صبراتة الساحلية ومسرحها الأثري',
                    'morning' => 'زيارة مسرح صبراتة الروماني المطل على الشاطئ ومعبد هرقل',
                    'afternoon' => 'جولة في متحف الفسيفساء والميناء الفينيقي القديم',
                    'evening' => 'استراحة شاطئية وتذوق المأكولات البحرية الطازجة',
                    'stay_city' => 'صبراتة / طرابلس',
                ];
            } else {
                $plans[] = [
                    'day_number' => $i,
                    'title' => "يوم استكشافي إضافي {$i} (سفاري أو جبل نفوسة)",
                    'morning' => 'جولة جبلية أو صحراوية في قلاع يفرن ونالوت ومعاصر الزيتون التراثية',
                    'afternoon' => 'غداء تقليدي جبلي واستكشاف القرى المعلقة وقصر الحج',
                    'evening' => 'سهرة تراثية تحت النجوم في الصحراء أو المرتفعات',
                    'stay_city' => 'غريان / نالوت',
                ];
            }
        }

        $estimatedCost = ($durationDays * 220) + ($companions * $durationDays * 90);

        return response()->json([
            'summary' => "برنامج سياحي مقترح ومخصص لمدة {$durationDays} أيام لعدد {$companions} أفراد يشمل الانتقالات وأبرز المعالم الأثرية والتراثية.",
            'estimated_cost_lyd' => $estimatedCost,
            'days_plan' => $plans,
            'source' => 'delni_itinerary_engine',
        ]);
    }
}
