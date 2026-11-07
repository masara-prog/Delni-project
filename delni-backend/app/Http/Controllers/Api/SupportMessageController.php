<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Controller;
use App\Support\Actor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Support chat stored in DelniDB (support_messages), replacing the copy kept in each browser.
 * Conversation ids: an account always writes in its own conversation "{role}-{id}" (set here, never by the client);
 * a visitor without an account writes in a random "visitor-..." conversation kept by their browser.
 * Only the administration sees every conversation and answers.
 */
class SupportMessageController extends Controller
{
    use JsonApiResponses;

    private const ACCOUNT_NAMES = [
        'tourist' => ['tourists', 'tourist_id', 'full_name'],
        'guide' => ['tour_guides', 'license_number', 'full_name'],
        'transport' => ['transportation_companies', 'contract_number', 'company_name'],
        'driver' => ['drivers', 'driver_license_number', 'full_name'],
    ];

    // The conversation the caller may use: their own for an account, a visitor id for a visitor; null = not allowed
    private function ownSession(?string $requested): ?string
    {
        $role = Actor::role();
        if ($role === 'admin') {
            return $requested ?: null;
        }
        if ($role !== null) {
            return "{$role}-" . Actor::id();
        }
        return $requested && Str::startsWith($requested, 'visitor-') && strlen($requested) <= 100 ? $requested : null;
    }

    private function row(object $m): array
    {
        return [
            'id' => (int) $m->id,
            'session_id' => $m->session_id,
            'sender_id' => $m->sender_id,
            'sender_role' => $m->sender_role,
            'recipient_id' => $m->recipient_id,
            'recipient_role' => $m->recipient_role,
            'body' => $m->body,
            'is_read' => (bool) $m->is_read,
            'created_at' => substr((string) $m->created_at, 0, 19),
        ];
    }

    // GET /support/messages?session_id=  — the caller's conversation (admin replies in it are marked read)
    public function index(Request $request): JsonResponse
    {
        $session = $this->ownSession($request->query('session_id'));
        if ($session === null) {
            return $this->error('المحادثة غير متاحة', 403);
        }
        $messages = DB::table('support_messages')->where('session_id', $session)->orderBy('id')->limit(500)->get();
        if (!Actor::isAdmin()) {
            DB::table('support_messages')->where('session_id', $session)->where('sender_role', 'admin')->where('is_read', false)
                ->update(['is_read' => true]);
        }
        return response()->json(['success' => true, 'session_id' => $session, 'data' => $messages->map(fn ($m) => $this->row($m))->values()]);
    }

    // POST /support/messages {session_id?, body} — a message from an account or a visitor to the administration
    public function store(Request $request): JsonResponse
    {
        $body = trim((string) $request->input('body', ''));
        if ($body === '' || mb_strlen($body) > 2000) {
            return $this->error('نص الرسالة مطلوب (2000 حرف كحد أقصى)', 422);
        }
        $role = Actor::role();
        if ($role === 'admin') {
            return $this->error('ردود الإدارة تُرسل من صفحة المحادثات', 422);
        }
        $session = $this->ownSession($request->input('session_id'));
        if ($session === null) {
            return $this->error('المحادثة غير متاحة', 403);
        }
        $id = DB::table('support_messages')->insertGetId([
            'session_id' => $session,
            'sender_id' => $role ? Actor::id() : null,
            'sender_role' => $role ?? 'visitor',
            'recipient_id' => null,
            'recipient_role' => 'admin',
            'body' => $body,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
        ]);
        $name = $this->ownerName($role ?? 'visitor', $role ? Actor::id() : null);
        $this->notify("support-msg-{$id}", 'admin', null, 'chat', "💬 رسالة دعم جديدة من {$name}", Str::limit($body, 140), '/dashboard/admin?tab=chatbot');

        return response()->json(['success' => true, 'session_id' => $session,
            'data' => $this->row(DB::table('support_messages')->where('id', $id)->first())], 201);
    }

    // GET /support/sessions (admin) — every conversation with its owner, unread count and messages
    public function sessions(): JsonResponse
    {
        $all = DB::table('support_messages')->orderBy('id')->get()->groupBy('session_id');
        $list = [];
        foreach ($all as $session => $messages) {
            $owner = $messages->firstWhere('sender_role', '<>', 'admin');
            $role = $owner->sender_role ?? 'visitor';
            $last = $messages->last();
            $list[] = [
                'session_id' => $session,
                'owner_role' => $role,
                'owner_id' => $owner->sender_id ?? null,
                'owner_name' => $this->ownerName($role, $owner->sender_id ?? null),
                'unread' => $messages->where('recipient_role', 'admin')->where('is_read', false)->count(),
                'last_message' => $last->body,
                'last_at' => substr((string) $last->created_at, 0, 19),
                'messages' => $messages->take(-200)->map(fn ($m) => $this->row($m))->values(),
            ];
        }
        usort($list, fn ($a, $b) => strcmp($b['last_at'], $a['last_at']));
        return response()->json(['success' => true, 'data' => $list]);
    }

    // POST /support/sessions/{sessionId}/reply (admin) {body}
    public function reply(Request $request, string $sessionId): JsonResponse
    {
        $body = trim((string) $request->input('body', ''));
        if ($body === '' || mb_strlen($body) > 2000) {
            return $this->error('نص الرد مطلوب (2000 حرف كحد أقصى)', 422);
        }
        $owner = DB::table('support_messages')->where('session_id', $sessionId)->where('sender_role', '<>', 'admin')->orderBy('id')->first();
        if (!$owner) {
            return $this->error('المحادثة غير موجودة', 404);
        }
        $id = DB::table('support_messages')->insertGetId([
            'session_id' => $sessionId,
            'sender_id' => (string) (Actor::user()?->getKey() ?? ''),
            'sender_role' => 'admin',
            'recipient_id' => $owner->sender_id,
            'recipient_role' => $owner->sender_role,
            'body' => $body,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
        ]);
        // Answering means the conversation was read
        DB::table('support_messages')->where('session_id', $sessionId)->where('recipient_role', 'admin')->update(['is_read' => true]);
        if ($owner->sender_id && $owner->sender_role !== 'visitor') {
            $role = $owner->sender_role === 'transport' ? 'company' : $owner->sender_role;
            $this->notify("support-reply-{$id}", $role, $owner->sender_id, 'chat', '💬 رد جديد من إدارة دلّني', Str::limit($body, 140), '');
        }
        return response()->json(['success' => true, 'data' => $this->row(DB::table('support_messages')->where('id', $id)->first())], 201);
    }

    // POST /support/sessions/{sessionId}/read (admin)
    public function markRead(string $sessionId): JsonResponse
    {
        DB::table('support_messages')->where('session_id', $sessionId)->where('recipient_role', 'admin')->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }

    private function ownerName(string $role, ?string $id): string
    {
        if ($role === 'visitor' || !$id || !isset(self::ACCOUNT_NAMES[$role])) {
            return 'زائر';
        }
        [$table, $key, $column] = self::ACCOUNT_NAMES[$role];
        return (string) (DB::table($table)->where($key, $id)->value($column) ?: $id);
    }
}
