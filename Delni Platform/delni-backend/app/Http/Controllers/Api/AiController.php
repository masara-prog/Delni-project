<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
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
     * «ذكاء دلني»: a question (and optionally a photo) answered by Google Gemini.
     * Body: message (text), image (optional data URL: jpeg / png / webp), history (optional [{role: user|model, text}]).
     * Gemini may search Google for current facts (weather, opening times); the answer is in the visitor's language.
     */
    public function chat(Request $request)
    {
        $data = $request->validate([
            'message' => 'nullable|string|max:2000',
            'image' => 'nullable|string|max:8000000',
            'history' => 'nullable|array|max:12',
            'history.*.role' => 'required_with:history|string|in:user,model',
            'history.*.text' => 'required_with:history|string|max:4000',
        ], [
            'message.max' => 'الرسالة طويلة جداً (2000 حرف على الأكثر)',
            'image.max' => 'الصورة كبيرة جداً',
        ]);
        $message = trim((string) ($data['message'] ?? ''));
        $image = $data['image'] ?? null;
        if ($message === '' && !$image) {
            return response()->json(['success' => false, 'message' => 'يرجى كتابة سؤال أو إرفاق صورة'], 422);
        }

        $key = (string) config('services.gemini.key');
        if ($key === '') {
            return response()->json(['success' => false, 'message' => 'لم يُضبط مفتاح Google Gemini بعد في ملف .env للخادم (GEMINI_API_KEY).'], 503);
        }

        // The photo: only real raster images, sent as inline data
        $parts = [];
        if ($image) {
            if (!preg_match('/^data:image\/(jpeg|png|webp);base64,(.+)$/s', $image, $m) || ($bytes = base64_decode($m[2], true)) === false) {
                return response()->json(['success' => false, 'message' => 'صيغة الصورة غير مدعومة؛ يرجى رفع صورة JPG أو PNG أو WEBP'], 422);
            }
            $mime = (new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes);
            if (!in_array($mime, ['image/jpeg', 'image/png', 'image/webp'], true)) {
                return response()->json(['success' => false, 'message' => 'صيغة الصورة غير مدعومة؛ يرجى رفع صورة JPG أو PNG أو WEBP'], 422);
            }
            $parts[] = ['inline_data' => ['mime_type' => $mime, 'data' => base64_encode($bytes)]];
        }
        $parts[] = ['text' => $message !== '' ? $message : 'ما الذي يظهر في هذه الصورة؟ وإن كان معلماً أو زياً أو طعاماً ليبياً فعرّفني به.'];

        $contents = [];
        foreach ($data['history'] ?? [] as $turn) {
            $contents[] = ['role' => $turn['role'], 'parts' => [['text' => $turn['text']]]];
        }
        $contents[] = ['role' => 'user', 'parts' => $parts];

        // Several attempts may be needed (search quota, busy models): more time than PHP's default 30 s
        set_time_limit(150);
        $instructions = $this->systemPrompt();
        // The configured model first, then current Flash models; each is tried with Google Search, then without it
        $models = array_values(array_unique(array_filter([
            (string) config('services.gemini.model'), 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash',
        ])));
        $res = null;
        $searched = false;
        $offline = false;
        foreach ($models as $model) {
            // After Google refuses search for this key (free keys), skip the search attempt for 10 minutes
            foreach (Cache::store('file')->get('gemini_no_search') ? [false] : [true, false] as $withSearch) {
                // A timeout or a dropped connection counts as one failed attempt, like an error status
                try {
                    $res = $this->askGemini($key, $model, $instructions, $contents, $withSearch);
                    $offline = false;
                } catch (\Throwable $e) {
                    $res = null;
                    $offline = true;
                    continue;
                }
                if ($res->successful()) {
                    $searched = $withSearch;
                    break 2;
                }
                // No search quota (free keys): the same model without search; any other failure: the next model
                if ($withSearch && $res->status() === 429) {
                    Cache::store('file')->put('gemini_no_search', true, now()->addMinutes(10));
                }
                if (!($withSearch && $res->status() === 429)) {
                    break;
                }
            }
            if ($res?->successful()) {
                break;
            }
            // A wrong key will fail on every model: stop here
            if ($res && in_array($res->status(), [400, 401, 403], true) && str_contains((string) $res->body(), 'API key')) {
                break;
            }
        }
        if (!$res && $offline) {
            return response()->json(['success' => false, 'message' => 'تعذر الاتصال بخدمة Google للذكاء الاصطناعي. تحقق من اتصال الخادم بالإنترنت.'], 502);
        }

        if (!$res || !$res->successful()) {
            $status = $res?->status();
            $msg = match (true) {
                $status === 429 => 'تم تجاوز الحد المسموح من الطلبات على مفتاح Gemini مؤقتاً. حاول بعد قليل.',
                in_array($status, [400, 401, 403], true) && str_contains((string) $res->body(), 'API key') => 'مفتاح Google Gemini غير صالح. تحقق من GEMINI_API_KEY في ملف .env.',
                $status === 503 => 'خدمة Google مشغولة الآن. حاول بعد لحظات.',
                default => 'لم تتمكن خدمة الذكاء الاصطناعي من الإجابة الآن. حاول مرة أخرى.',
            };
            return response()->json(['success' => false, 'message' => $msg], 502);
        }

        $reply = collect($res->json('candidates.0.content.parts') ?? [])->pluck('text')->filter()->implode("\n");
        if (trim($reply) === '') {
            return response()->json(['success' => false, 'message' => 'لم يصل رد من الذكاء الاصطناعي لهذا السؤال. جرّب صياغة أخرى.'], 502);
        }
        $sources = collect($res->json('candidates.0.groundingMetadata.groundingChunks') ?? [])
            ->map(fn ($c) => ['title' => $c['web']['title'] ?? '', 'url' => $c['web']['uri'] ?? ''])
            ->filter(fn ($c) => $c['url'] !== '')->take(3)->values();

        return response()->json(['success' => true, 'reply' => trim($reply), 'sources' => $sources, 'source' => 'gemini', 'live_search' => $searched]);
    }

    // One generateContent call; without Google Search the model is told it has no live data (weather = usual climate)
    private function askGemini(string $key, string $model, string $instructions, array $contents, bool $withSearch)
    {
        $note = $withSearch ? '' : "\n- لا يتوفر لديك بحث مباشر الآن: للطقس اذكر المناخ المعتاد في هذا الشهر ووضّح أنه ليس طقس اليوم الفعلي.";
        $body = [
            'systemInstruction' => ['parts' => [['text' => $instructions . $note]]],
            'contents' => $contents,
            'generationConfig' => ['temperature' => 0.6, 'maxOutputTokens' => 1200],
        ];
        if ($withSearch) {
            $body['tools'] = [['google_search' => (object) []]];
        }
        return Http::timeout($withSearch ? 25 : 40)
            // PHP on Windows often has no CA bundle configured: verify Google's certificate with the system store
            ->withOptions(defined('CURLSSLOPT_NATIVE_CA') ? ['curl' => [CURLOPT_SSL_OPTIONS => CURLSSLOPT_NATIVE_CA]] : [])
            ->withHeaders(['x-goog-api-key' => $key])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", $body);
    }

    // Who «ذكاء دلني» is, and what is on the platform today (read only: landmarks and open trips)
    private function systemPrompt(): string
    {
        $today = now('Africa/Tripoli');
        // A landmark is named by its tourist city (places_tourist has no name column)
        $places = PlaceTourist::query()->limit(40)->get(['city', 'category'])
            ->map(fn ($p) => $p->category ? "{$p->city} ({$p->category})" : $p->city)->implode('، ');
        $weekly = \DB::table('weekly_trips')->where('is_active', true)->where('end_date', '>=', $today->toDateString())
            ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', 'وافق المرشد'))
            ->limit(15)->get(['trip_title', 'start_date', 'seat_per_price', 'departure_city'])
            ->map(fn ($t) => "رحلة أسبوعية «{$t->trip_title}» من {$t->departure_city} تبدأ " . substr((string) $t->start_date, 0, 10) . " بسعر {$t->seat_per_price} د.ل للمقعد");
        $daily = \DB::table('daily_trips')->where('is_active', true)
            ->where(fn ($q) => $q->whereNull('guide_approval_status')->orWhere('guide_approval_status', 'وافق المرشد'))
            ->limit(15)->get(['trip_title', 'price_per_seat', 'departure_city'])
            ->map(fn ($t) => "رحلة يومية «{$t->trip_title}» من {$t->departure_city} بسعر {$t->price_per_seat} د.ل للمقعد");
        $trips = $weekly->concat($daily)->implode("\n");

        return <<<PROMPT
أنت «ذكاء دلني»، المساعد السياحي الذكي لمنصة «دلني» للسياحة الداخلية في ليبيا.
- أجب بلغة السائل نفسها (العربية، الإنجليزية، الإيطالية، الفرنسية أو غيرها)، وبأسلوب ودود وواضح ومختصر.
- تخصصك ليبيا: المعالم والمدن والتاريخ والتراث والزي التقليدي والأكلات والعادات واللهجة الليبية والطقس وأفضل أوقات الزيارة ونصائح السفر داخل ليبيا.
- للمعلومات الحديثة مثل طقس اليوم أو الأحداث الجارية استخدم بحث Google، واذكر أن المعلومة قد تتغير.
- إذا أرفق المستخدم صورة: صف ما فيها، وإن كانت لمعلم أو زي أو طعام أو منطقة في ليبيا فعرّف بها وبتاريخها، وإن لم تكن متأكداً فقل ذلك بوضوح ولا تخمّن.
- عند الحديث عن الحجز: الحجز يتم من صفحة الرحلات في منصة دلني، والدفع نقداً في مكتب الشركة في طرابلس أو بنغازي، ويؤكد الموظف الدفع برقم التذكرة. لا تخترع رحلات أو أسعاراً غير المذكورة أدناه.
- إذا سُئلت عن موضوع لا علاقة له بالسفر أو بليبيا فأجب باختصار ثم أعد الحديث بلطف إلى السياحة في ليبيا.
- تاريخ اليوم: {$today->toDateString()}.

المعالم المسجلة في منصة دلني: {$places}

الرحلات المتاحة للحجز الآن في منصة دلني:
{$trips}
PROMPT;
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
