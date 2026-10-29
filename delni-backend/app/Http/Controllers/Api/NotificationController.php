<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NotificationController extends Controller
{
    /**
     * Retrieve notifications strictly filtered for the authenticated user/role
     */
    public function index(Request $request)
    {
        $role = $request->query('role', 'all');
        $userId = $request->query('user_id');
        if ($role === 'admin') {
            \App\Support\ContractExpiryAlerts::runHourly();
        }

        $query = Notification::query();

        // Strict isolation: only show notifications targeted to this user or role-wide broadcasts
        $this->forRecipient($query, $role, $userId);

        $unreadCount = (clone $query)->where('is_read', false)->count();

        $notifications = $query->orderBy('created_at', 'desc')
            ->limit(50)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'type' => $item->type,
                    'title' => $item->title,
                    'body' => $item->body,
                    'recipient_role' => $item->recipient_role,
                    'recipient_id' => $item->recipient_id,
                    'link' => $item->link,
                    'read' => (bool)$item->is_read,
                    // Stored in Libya local time; sent without a timezone so the browser reads it as local time
                    'time' => $item->created_at ? $item->created_at->format('Y-m-d H:i') : null,
                    'created_at' => $item->created_at ? $item->created_at->format('Y-m-d\TH:i:s') : null,
                ];
            });

        return response()->json([
            'success' => true,
            'status' => 'success',
            'data' => $notifications,
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get unread notifications count
     */
    public function unreadCount(Request $request)
    {
        $role = $request->query('role', 'all');
        $userId = $request->query('user_id');

        $query = Notification::where('is_read', false);

        $this->forRecipient($query, $role, $userId);

        return response()->json([
            'success' => true,
            'status' => 'success',
            'count' => $query->count(),
        ]);
    }

    /**
     * Store and dispatch a verified notification with deduplication
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'nullable|string|max:50',
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'recipient_role' => 'nullable|string|max:50',
            'recipient_id' => 'nullable|string|max:100',
            'link' => 'nullable|string|max:255',
            'dedupe_key' => 'nullable|string|max:100',
        ]);

        // Deduplication check
        if (!empty($validated['dedupe_key'])) {
            $existing = Notification::where('dedupe_key', $validated['dedupe_key'])->first();
            if ($existing) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'الإشعار مسجل مسبقاً (تم تفادي التكرار)',
                    'data' => $existing,
                ], 200);
            }
        }

        $id = 'notif-' . (int) (microtime(true) * 1000) . '-' . random_int(100, 999);

        $notification = Notification::create([
            'id' => $id,
            'type' => $validated['type'] ?? 'system',
            'title' => $validated['title'],
            'body' => $validated['body'],
            'recipient_role' => $validated['recipient_role'] ?? 'all',
            'recipient_id' => $validated['recipient_id'] ?? null,
            'link' => $validated['link'] ?? null,
            'dedupe_key' => $validated['dedupe_key'] ?? null,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'تم إنشاء وحفظ الإشعار بنجاح',
            'data' => $notification,
        ], 201);
    }

    /**
     * Mark single or all notifications as read
     */
    public function markRead(Request $request)
    {
        $all = $request->boolean('all');
        $id = $request->input('id');
        $role = $request->input('role', 'all');
        $userId = $request->input('user_id');

        if ($all) {
            $query = Notification::where('is_read', false);
            $this->forRecipient($query, $role, $userId);
            $query->update(['is_read' => true]);

            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديد جميع الإشعارات كمقروءة بنجاح',
            ]);
        }

        if ($id) {
            Notification::where('id', $id)->update(['is_read' => true]);
            return response()->json([
                'status' => 'success',
                'message' => 'تم تحديد الإشعار كمقروء',
            ]);
        }

        return response()->json([
            'status' => 'error',
            'message' => 'مطلوب معرف الإشعار أو خيار تحديد الكل',
        ], 400);
    }

    // Personal notifications must match both the id and the role (a driver's record also carries its company's
    // contract number); role-wide broadcasts have no recipient id. A transport company's notifications use "company".
    private function forRecipient($query, string $role, ?string $userId): void
    {
        $roles = $role === 'transport' ? ['transport', 'company'] : [$role];
        $query->where(function ($q) use ($roles, $userId) {
            if ($userId) {
                $q->where(fn ($own) => $own->where('recipient_id', $userId)->whereIn('recipient_role', $roles));
            }
            $q->orWhere(fn ($all) => $all->whereNull('recipient_id')
                ->where(fn ($r) => $r->where('recipient_role', 'all')->orWhereIn('recipient_role', $roles)));
        });
    }
}
