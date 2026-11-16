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
 * Support chat stored in DelniDB: support_conversations (one per owner: an account, as a foreign key by kind of
 * account, or a visitor) and support_messages (the messages of a conversation, from_admin telling the direction).
 * The API still returns sender/recipient for each message; they follow from the conversation's owner and from_admin.
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

    // The conversation's owner column for each kind of account
    private const OWNER_COLUMNS = [
        'tourist' => 'tourist_id',
        'guide' => 'guide_license_number',
        'driver' => 'driver_license_number',
        'transport' => 'company_contract_number',
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

    // Messages with their conversation's owner
    private function messages()
    {
        return DB::table('support_messages as m')
            ->join('support_conversations as c', 'c.session_id', '=', 'm.session_id')
            ->select('m.id', 'm.session_id', 'm.from_admin', 'm.admin_id', 'm.body', 'm.is_read', 'm.created_at', 'c.owner_role',
                DB::raw('COALESCE(c.tourist_id, c.guide_license_number, c.driver_license_number, c.company_contract_number) as owner_id'));
    }

    private function row(object $m): array
    {
        $fromAdmin = (bool) $m->from_admin;
        return [
            'id' => (int) $m->id,
            'session_id' => $m->session_id,
            'sender_id' => $fromAdmin ? ($m->admin_id !== null ? (string) $m->admin_id : null) : $m->owner_id,
            'sender_role' => $fromAdmin ? 'admin' : $m->owner_role,
            'recipient_id' => $fromAdmin ? $m->owner_id : null,
            'recipient_role' => $fromAdmin ? $m->owner_role : 'admin',
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
        $messages = $this->messages()->where('m.session_id', $session)->orderBy('m.id')->limit(500)->get();
        if (!Actor::isAdmin()) {
            DB::table('support_messages')->where('session_id', $session)->where('from_admin', true)->where('is_read', false)
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
        $id = DB::transaction(function () use ($session, $role, $body) {
            // The conversation is created with its first message; its owner is a foreign key by kind of account
            if (!DB::table('support_conversations')->where('session_id', $session)->exists()) {
                $owner = $role && isset(self::OWNER_COLUMNS[$role]) ? [self::OWNER_COLUMNS[$role] => Actor::id()] : [];
                DB::table('support_conversations')->insert($owner + [
                    'session_id' => $session,
                    'owner_role' => $role ?? 'visitor',
                    'created_at' => now('Africa/Tripoli'),
                ]);
            }
            return DB::table('support_messages')->insertGetId([
                'session_id' => $session,
                'from_admin' => false,
                'body' => $body,
                'is_read' => false,
                'created_at' => now('Africa/Tripoli'),
            ]);
        });
        $name = $this->ownerName($role ?? 'visitor', $role ? Actor::id() : null);
        $this->notify("support-msg-{$id}", 'admin', null, 'chat', "💬 رسالة دعم جديدة من {$name}", Str::limit($body, 140), '/dashboard/admin?tab=chatbot');

        return response()->json(['success' => true, 'session_id' => $session,
            'data' => $this->row($this->messages()->where('m.id', $id)->first())], 201);
    }

    // GET /support/sessions (admin) — every conversation with its owner, unread count and messages
    public function sessions(): JsonResponse
    {
        $all = $this->messages()->orderBy('m.id')->get()->groupBy('session_id');
        $list = [];
        foreach ($all as $session => $messages) {
            $first = $messages->first();
            $role = $first->owner_role;
            $last = $messages->last();
            $list[] = [
                'session_id' => $session,
                'owner_role' => $role,
                'owner_id' => $first->owner_id,
                'owner_name' => $this->ownerName($role, $first->owner_id),
                'unread' => $messages->filter(fn ($m) => !$m->from_admin && !$m->is_read)->count(),
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
        $conversation = DB::table('support_conversations')->where('session_id', $sessionId)
            ->first(['owner_role', DB::raw('COALESCE(tourist_id, guide_license_number, driver_license_number, company_contract_number) as owner_id')]);
        if (!$conversation) {
            return $this->error('المحادثة غير موجودة', 404);
        }
        $adminId = Actor::user()?->getKey();
        $id = DB::table('support_messages')->insertGetId([
            'session_id' => $sessionId,
            'from_admin' => true,
            'admin_id' => is_numeric($adminId) ? (int) $adminId : null,
            'body' => $body,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
        ]);
        // Answering means the conversation was read
        DB::table('support_messages')->where('session_id', $sessionId)->where('from_admin', false)->update(['is_read' => true]);
        if ($conversation->owner_id && $conversation->owner_role !== 'visitor') {
            $role = $conversation->owner_role === 'transport' ? 'company' : $conversation->owner_role;
            $this->notify("support-reply-{$id}", $role, $conversation->owner_id, 'chat', '💬 رد جديد من إدارة دلّني', Str::limit($body, 140), '');
        }
        return response()->json(['success' => true, 'data' => $this->row($this->messages()->where('m.id', $id)->first())], 201);
    }

    // POST /support/sessions/{sessionId}/read (admin)
    public function markRead(string $sessionId): JsonResponse
    {
        DB::table('support_messages')->where('session_id', $sessionId)->where('from_admin', false)->update(['is_read' => true]);
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
