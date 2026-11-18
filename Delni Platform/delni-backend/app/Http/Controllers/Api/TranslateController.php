<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/**
 * English mode for content typed in Arabic (trip titles, descriptions, names, server messages).
 * The platform and the app send the Arabic texts their own dictionaries do not cover; each text is translated once by
 * Google Gemini and kept in the server cache, so the next visitor gets it at once and nothing is stored in DelniDB.
 */
class TranslateController extends Controller
{
    private const MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest', 'gemini-3.8-flash'];

    public function translate(Request $request)
    {
        $data = $request->validate([
            'texts' => 'required|array|max:60',
            'texts.*' => 'required|string|max:1500',
        ]);
        $texts = array_values(array_unique(array_filter(array_map('trim', $data['texts']),
            fn ($t) => $t !== '' && preg_match('/\p{Arabic}/u', $t))));

        $out = [];
        $missing = [];
        foreach ($texts as $t) {
            $hit = Cache::store('file')->get($this->key($t));
            if (is_string($hit)) {
                $out[$t] = $hit;
            } else {
                $missing[] = $t;
            }
        }
        if ($missing) {
            foreach ($this->ask($missing) as $ar => $en) {
                Cache::store('file')->forever($this->key($ar), $en);
                $out[$ar] = $en;
            }
        }
        return response()->json(['translations' => (object) $out]);
    }

    private function key(string $t): string
    {
        return 'tr_en:' . md5($t);
    }

    /** One Gemini call for all the missing texts; [] when no model answers (the page keeps the Arabic). */
    private function ask(array $texts): array
    {
        $key = (string) config('services.gemini.key');
        if ($key === '') {
            return [];
        }
        $prompt = "Translate each Arabic text below into natural English for a Libyan tourism platform (trips, landmarks, hotels, restaurants, guides, transport).\n"
            . "Rules: keep numbers, dates, times, codes, emoji, URLs and Latin text exactly as they are; write people's and companies' names in Latin letters (e.g. مصطفى احمد → Mustafa Ahmed, شركة المدى لنقل الركاب → Al-Mada Passenger Transport Company); use the usual English names of Libyan places (طرابلس → Tripoli, غدامس → Ghadames, لبدة → Leptis Magna, شحات → Shahat (Cyrene)); keep the meaning and tone; never add notes.\n"
            . "Answer with a JSON array of strings, one translation per text, in the same order.\n\n"
            . json_encode(array_values($texts), JSON_UNESCAPED_UNICODE);
        $body = [
            'contents' => [['role' => 'user', 'parts' => [['text' => $prompt]]]],
            'generationConfig' => [
                'temperature' => 0.2,
                'maxOutputTokens' => 8192,
                'responseMimeType' => 'application/json',
                'responseSchema' => ['type' => 'ARRAY', 'items' => ['type' => 'STRING']],
                'thinkingConfig' => ['thinkingLevel' => 'minimal'],
            ],
        ];
        $deadline = microtime(true) + 20;
        foreach (self::MODELS as $model) {
            if (microtime(true) > $deadline - 5) {
                break;
            }
            try {
                $res = $this->send($key, $model, $body);
                if ($res->status() === 400 && str_contains((string) $res->body(), 'Thinking level')) {
                    $b = $body;
                    $b['generationConfig']['thinkingConfig'] = ['thinkingLevel' => 'low'];
                    $res = $this->send($key, $model, $b);
                }
            } catch (\Throwable $e) {
                \Log::warning("Delni translate: {$model} failed: " . $e->getMessage());
                continue;
            }
            if (!$res->successful()) {
                \Log::warning("Delni translate: {$model} answered " . $res->status());
                continue;
            }
            $text = collect($res->json('candidates.0.content.parts') ?? [])
                ->reject(fn ($p) => !empty($p['thought']))->pluck('text')->implode('');
            $list = json_decode($text, true);
            if (!is_array($list) || count($list) !== count($texts)) {
                \Log::warning("Delni translate: {$model} gave " . (is_array($list) ? count($list) : 'no') . ' items for ' . count($texts));
                continue;
            }
            $out = [];
            foreach (array_values($texts) as $i => $ar) {
                $en = is_string($list[$i] ?? null) ? trim($list[$i]) : '';
                // A reply that is still Arabic is not a translation: the text is asked again next time
                if ($en !== '' && !preg_match('/\p{Arabic}/u', $en)) {
                    $out[$ar] = $en;
                }
            }
            return $out;
        }
        return [];
    }

    private function send(string $key, string $model, array $body)
    {
        return Http::timeout(12)
            // PHP on Windows often has no CA bundle configured: verify Google's certificate with the system store
            ->withOptions(defined('CURLSSLOPT_NATIVE_CA') ? ['curl' => [CURLOPT_SSL_OPTIONS => CURLSSLOPT_NATIVE_CA]] : [])
            ->withHeaders(['x-goog-api-key' => $key])
            ->post("https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent", $body);
    }
}
