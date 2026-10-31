<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Support\Actor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * File uploads as multipart/form-data (field "file"), for the mobile app and the site, instead of Base64 text.
 * The returned path is what the existing columns already store (e.g. tour_guides.avatar, vehicles.vehicle_image).
 *
 * - Pictures (avatar, vehicle, place, hotel, restaurant, trip, offer) go to the site's public/uploads/<folder>,
 *   where the existing images already are; the stored name is random and the extension comes from the real content.
 * - Documents (licences, certificates) can contain personal data, so they are kept outside any public folder
 *   (storage/app/private/documents) and are served only to the admin by GET /api/uploads/documents/{name}.
 */
class UploadController extends Controller
{
    use JsonApiResponses;

    private const IMAGE_TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    private const DOCUMENT_TYPES = self::IMAGE_TYPES + ['application/pdf' => 'pdf'];
    private const MAX_IMAGE_KB = 5120;
    private const MAX_DOCUMENT_KB = 10240;

    // kind => [folder, roles allowed to upload it]
    private const KINDS = [
        'avatar' => ['avatars', ['tourist', 'guide', 'driver', 'admin']],
        'vehicle' => ['vehicles', ['transport', 'driver', 'admin']],
        'document' => [null, ['guide', 'driver', 'transport', 'admin']],
        'place' => ['places', ['admin']],
        'hotel' => ['hotels', ['admin']],
        'restaurant' => ['restaurants', ['admin']],
        'trip' => ['trips', ['admin']],
        'offer' => ['offers', ['admin']],
    ];

    public function store(Request $request): JsonResponse
    {
        $kind = (string) $request->input('kind');
        if (!isset(self::KINDS[$kind])) {
            return $this->error('نوع الملف غير معروف. الأنواع المسموحة: ' . implode('، ', array_keys(self::KINDS)), 422);
        }
        [$folder, $roles] = self::KINDS[$kind];
        if (!in_array(Actor::role(), $roles, true)) {
            return $this->error('ليست لديك صلاحية لرفع هذا النوع من الملفات', 403);
        }

        $isDocument = $folder === null;
        $file = $request->file('file');
        if (!$file || !$file->isValid()) {
            return $this->error('يرجى اختيار ملف صالح للرفع', 422);
        }
        $maxKb = $isDocument ? self::MAX_DOCUMENT_KB : self::MAX_IMAGE_KB;
        $size = $file->getSize();
        if ($size > $maxKb * 1024) {
            return $this->error('حجم الملف أكبر من المسموح (' . ($maxKb / 1024) . ' ميغابايت)', 422);
        }

        // The real type is read from the file's bytes; the name and the declared type sent by the client are ignored
        // (a file the server cannot read, e.g. one removed by antivirus, is refused rather than failing)
        $realPath = $file->getRealPath();
        $mime = $realPath && is_readable($realPath) ? @(new \finfo(FILEINFO_MIME_TYPE))->file($realPath) : false;
        if ($mime === false) {
            return $this->error('تعذر قراءة الملف المرفوع، يرجى اختيار ملف آخر', 422);
        }
        $allowed = $isDocument ? self::DOCUMENT_TYPES : self::IMAGE_TYPES;
        if (!isset($allowed[$mime])) {
            return $this->error($isDocument ? 'يُقبل فقط: صورة JPG أو PNG أو WEBP، أو ملف PDF' : 'يُقبل فقط: صورة JPG أو PNG أو WEBP', 422);
        }
        if (str_starts_with($mime, 'image/') && @getimagesize($file->getRealPath()) === false) {
            return $this->error('الملف ليس صورة صالحة', 422);
        }

        $name = $kind . '-' . bin2hex(random_bytes(16)) . '.' . $allowed[$mime];
        $dir = $isDocument ? storage_path('app/private/documents') : base_path('../public/uploads/' . $folder);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $file->move($dir, $name);

        return response()->json([
            'success' => true,
            'message' => 'تم رفع الملف بنجاح',
            'data' => [
                'kind' => $kind,
                'path' => $isDocument ? '/api/uploads/documents/' . $name : '/uploads/' . $folder . '/' . $name,
                'mime' => $mime,
                'size' => $size,
            ],
        ], 201);
    }

    // Documents are shown to the admin only (they are reviewed when approving guides and drivers)
    public function document(string $name): Response
    {
        if (!preg_match('/^document-[a-f0-9]{32}\.(jpg|png|webp|pdf)$/', $name)) {
            abort(404);
        }
        $path = storage_path('app/private/documents/' . $name);
        if (!is_file($path)) {
            abort(404);
        }
        return response()->file($path, ['X-Content-Type-Options' => 'nosniff', 'Content-Disposition' => 'inline']);
    }
}
