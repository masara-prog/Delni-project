<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Models\PlaceTourist;
use App\Support\Base64Image;
use App\Support\ListInput;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Tourist landmarks (replaces the bridge's /places and /attractions). Landmarks are never deleted.
 * A landmark is a tourist city (there is no separate name column; the API sends place_name = city), and its highlights (the sites to visit there) are rows
 * of places_tourist_highlights, one per highlight (first normal form).
 */
class PlaceController extends Controller
{
    use JsonApiResponses;

    public const REGIONS = [
        'المنطقة الغربية (ساحل البحر المتوسط)',
        'المنطقة الشرقية (الجبل الأخضر والساحل)',
        'المنطقة الجنوبية (الصحراء الكبرى والواحات)',
    ];

    public function index(Request $request): JsonResponse
    {
        $query = PlaceTourist::query()->orderBy('city');
        foreach (['city', 'category', 'region'] as $filter) {
            if ($request->filled($filter) && $request->input($filter) !== 'all') {
                $query->where($filter, $request->input($filter));
            }
        }
        $places = $query->get();
        $highlights = $this->highlights($places->pluck('place_id')->all());
        $data = $places->map(fn ($p) => ['highlights' => $highlights[$p->place_id] ?? []] + $p->toArray())->values();
        return response()->json(['success' => true, 'data' => $data]);
    }

    public function save(Request $request): JsonResponse
    {
        $id = trim((string) ($request->input('place_id') ?: $request->input('municipality_code')));
        $request->merge(['place_id' => $id, 'highlights' => ListInput::parse($request->input('highlights'))]);
        $existing = $id !== '' ? PlaceTourist::find($id) : null;
        if ($existing && $request->boolean('isNew')) {
            return $this->error("رمز المعلم ({$id}) مستخدم لمعلم آخر، يرجى اختيار رمز مختلف.", 409);
        }

        // Every field is required when adding; nothing is filled with default text, images or coordinates
        $required = $existing ? 'sometimes|required' : 'required';
        $data = $this->validateArabic($request, [
            'place_id' => 'required|string|max:50',
            'city' => "{$required}|string|max:100",
            'description' => "{$required}|string|min:20",
            'category' => "{$required}|string|max:100",
            'region' => "{$required}|string|in:" . implode(',', self::REGIONS),
            'highlights' => "{$required}|array|min:1",
            'highlights.*' => 'string|max:500',
            'latitude' => "{$required}|numeric|between:-90,90",
            'longitude' => "{$required}|numeric|between:-180,180",
            'place_image' => "{$required}|string",
        ], [
            'place_id' => 'رمز المعلم', 'description' => 'وصف المعلم', 'city' => 'المدينة السياحية',
            'category' => 'التصنيف السياحي', 'region' => 'المنطقة', 'highlights' => 'أبرز المحطات',
            'latitude' => 'خط العرض', 'longitude' => 'خط الطول', 'place_image' => 'صورة المعلم',
        ]);
        if ($data instanceof JsonResponse) {
            return $data;
        }

        $values = [];
        foreach (['description', 'category', 'region'] as $column) {
            if (isset($data[$column])) {
                $values[$column] = trim($data[$column]);
            }
        }
        if (isset($data['city'])) {
            $values['city'] = trim($data['city']);
        }
        if (!empty($data['place_image'])) {
            $values['place_image'] = Base64Image::store($data['place_image'], "place-{$id}", 'places');
        }
        if (isset($data['latitude'], $data['longitude'])) {
            $values['latitude'] = $data['latitude'];
            $values['longitude'] = $data['longitude'];
            $values['google_maps_url'] = "https://maps.google.com/?q={$data['latitude']},{$data['longitude']}";
        }

        DB::transaction(function () use ($id, $values, $data) {
            PlaceTourist::updateOrCreate(['place_id' => $id], $values);
            if (isset($data['highlights'])) {
                // The landmark's highlight list is replaced as a whole when edited
                DB::table('places_tourist_highlights')->where('place_id', $id)->delete();
                foreach (array_values($data['highlights']) as $i => $name) {
                    DB::table('places_tourist_highlights')->insert([
                        'highlight_id' => "{$id}-H" . ($i + 1),
                        'place_id' => $id,
                        'highlight_name' => trim($name),
                        'display_order' => $i + 1,
                    ]);
                }
            }
        });

        $place = PlaceTourist::find($id);
        return response()->json([
            'success' => true,
            'message' => $existing ? 'تم تعديل بيانات المعلم السياحي بنجاح' : 'تمت إضافة المعلم السياحي بنجاح',
            'data' => ['highlights' => $this->highlights([$id])[$id] ?? []] + $place->toArray(),
        ], $existing ? 200 : 201);
    }

    // place_id => [highlight names in display order]
    private function highlights(array $placeIds): array
    {
        return DB::table('places_tourist_highlights')->whereIn('place_id', $placeIds)
            ->orderBy('display_order')->get(['place_id', 'highlight_name'])
            ->groupBy('place_id')->map(fn ($rows) => $rows->pluck('highlight_name')->all())->all();
    }
}
