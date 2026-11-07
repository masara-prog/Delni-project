// @ts-check
/**
 * Real-time Live Support Chat System for Delni Platform
 * Synchronizes user messages and admin replies across all dashboards & pages
 */

import { notifyChatbotUserMessage, notifyAdminChatReply, recipientIdFor, type NotificationItem } from "./notifications";
import { getStoredSession, laravelRequest } from "./api";

export type ChatMessage = {
  id: string;
  from: "user" | "bot" | "admin";
  text: string;
  time: string;
};

export type ChatSession = {
  id: string;
  user_name: string;
  user_type: string;
  last_message: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
  // Who the admin's replies are sent to (the signed-in account that opened the chat)
  recipient_role?: NonNullable<NotificationItem["recipientRole"]>;
  recipient_id?: string;
  // The conversation is stored in DelniDB (support_messages); the admin's replies go through the server
  server?: boolean;
};

// The signed-in account writing to support; visitors without an account cannot receive replies as notifications
function currentRecipient(): Pick<ChatSession, "recipient_role" | "recipient_id"> {
  const session = getStoredSession();
  const id = recipientIdFor(session);
  if (!session.role || !id) return {};
  const role = (session.role === "transport" ? "company" : session.role) as NonNullable<NotificationItem["recipientRole"]>;
  return { recipient_role: role, recipient_id: id };
}

const STORAGE_KEY = "dalni_chat_sessions";
const SYNC_EVENT = "dalni_chat_sync";

const defaultSampleSessions: ChatSession[] = [];

export function getChatSessions(): ChatSession[] {
  if (typeof window === "undefined") return defaultSampleSessions;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSampleSessions));
      return defaultSampleSessions;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    return defaultSampleSessions;
  } catch {
    return defaultSampleSessions;
  }
}

export function saveChatSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT, { detail: sessions }));
  } catch {}
}

export function getOrCreateUserSession(userId: string, userName: string, userRole: string): ChatSession {
  const sessions = getChatSessions();
  const existing = sessions.find(s => s.id === userId || s.user_name === userName);
  if (existing) {
    // Conversations opened before replies were addressed by account get their owner now, so replies reach them
    if (!existing.recipient_id) {
      const owned = { ...existing, ...currentRecipient() };
      if (owned.recipient_id) {
        saveChatSessions(sessions.map(s => (s === existing ? owned : s)));
        return owned;
      }
    }
    return existing;
  }

  const newSession: ChatSession = {
    ...currentRecipient(),
    id: userId || `user-${Date.now()}`,
    user_name: userName || "مستخدم دلّني",
    user_type: userRole || "سائح",
    last_message: "بدء محادثة دعم جديدة",
    time: new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" }),
    unread: false,
    messages: [
      {
        id: `welcome-${Date.now()}`,
        from: "admin",
        text: `أهلاً بك يا ${userName} في مركز دعم منصة دَلِّني 👋 فريق الإدارة متاح لخدمتك والإجابة على أي استفسار أو مشكلة تواجهك.`,
        time: new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" })
      }
    ]
  };

  saveChatSessions([newSession, ...sessions]);
  return newSession;
}

export function sendUserMessage(sessionId: string, userName: string, userRole: string, text: string): ChatSession {
  const sessions = getChatSessions();
  const time = new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    from: "user",
    text: text.trim(),
    time
  };

  let found = false;
  const updated = sessions.map(s => {
    if (s.id === sessionId || s.user_name === userName) {
      found = true;
      return {
        ...s,
        ...currentRecipient(),
        last_message: text.trim(),
        time,
        unread: true,
        messages: [...s.messages, newMsg]
      };
    }
    return s;
  });

  if (!found) {
    const newSession: ChatSession = {
      ...currentRecipient(),
      id: sessionId,
      user_name: userName,
      user_type: userRole,
      last_message: text.trim(),
      time,
      unread: true,
      messages: [
        {
          id: `welcome-${Date.now()}`,
          from: "admin",
          text: `أهلاً بك يا ${userName} في مركز دعم منصة دَلِّني 👋 فريق الإدارة متاح لخدمتك والإجابة على أي استفسار.`,
          time
        },
        newMsg
      ]
    };
    updated.unshift(newSession);
  }

  saveChatSessions(updated);

  // Stored in DelniDB (support_messages); the server notifies the administration. The browser copy stays as a cache.
  pushUserMessage(text.trim()).then((ok) => {
    if (!ok) {
      try {
        notifyChatbotUserMessage(userName, userRole, text);
      } catch {}
    }
  });

  // Also sync ticket into dalni_support_tickets
  try {
    const tickets = JSON.parse(localStorage.getItem("dalni_support_tickets") || "[]");
    tickets.unshift({
      id: `TK-${Date.now().toString().slice(-4)}`,
      user_name: userName,
      user_role: userRole,
      subject: text.slice(0, 35),
      message: text,
      status: "جديد",
      created_at: time
    });
    localStorage.setItem("dalni_support_tickets", JSON.stringify(tickets));
  } catch {}

  return updated.find(s => s.id === sessionId || s.user_name === userName)!;
}

export function sendAdminReply(sessionId: string, text: string): ChatSession | null {
  const sessions = getChatSessions();
  const time = new Date().toLocaleTimeString("ar-LY", { hour: "2-digit", minute: "2-digit" });
  const adminMsg: ChatMessage = {
    id: `admin-${Date.now()}`,
    from: "admin",
    text: text.trim(),
    time
  };

  const updated = sessions.map(s => {
    if (s.id === sessionId) {
      return {
        ...s,
        last_message: `مشرف: ${text.trim()}`,
        time,
        unread: false,
        messages: [...s.messages, adminMsg]
      };
    }
    return s;
  });

  const target = updated.find(s => s.id === sessionId) || null;
  if (target?.server) {
    // The server stores the reply and notifies the account
    saveChatSessions(updated);
    laravelRequest("POST", `/support/sessions/${encodeURIComponent(sessionId)}/reply`, { body: text.trim() }).then(() => pullAdminSessions());
    return target;
  }
  if (target) {
    saveChatSessions(updated);
    if (target.recipient_role && target.recipient_id) {
      try {
        notifyAdminChatReply(text.trim(), target.recipient_role, target.recipient_id);
      } catch {}
    }
  }
  return target;
}


/* ---------------- DelniDB sync (support_messages) ---------------- */

type ServerMessage = { id: number; session_id: string; sender_role: string; body: string; created_at: string };

const VISITOR_KEY = "dalni_visitor_chat_id";

// The conversation id on the server: an account's own "{role}-{id}", or a random id kept by a visitor's browser
function serverSessionId(): string | null {
  const session = getStoredSession();
  const id = recipientIdFor(session);
  if (session.role && session.role !== "admin" && id) return `${session.role}-${id}`;
  if (session.role === "admin") return null;
  try {
    let v = localStorage.getItem(VISITOR_KEY);
    if (!v) {
      v = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem(VISITOR_KEY, v);
    }
    return v;
  } catch {
    return null;
  }
}

const clock = (at: string) => (at || "").slice(11, 16);

function toChatMessages(rows: ServerMessage[]): ChatMessage[] {
  return rows.map((m) => ({ id: `srv-${m.id}`, from: m.sender_role === "admin" ? "admin" : "user", text: m.body, time: clock(m.created_at) }));
}

async function pushUserMessage(text: string): Promise<boolean> {
  const sid = serverSessionId();
  if (!sid) return false;
  const res = await laravelRequest("POST", "/support/messages", { session_id: sid, body: text });
  return res.ok;
}

/** Replaces the local copy of the user's conversation with the one stored on the server (keeps the welcome line). */
export async function pullUserSession(localId: string, userName: string, userRole: string): Promise<void> {
  const sid = serverSessionId();
  if (!sid) return;
  const res = await laravelRequest<ServerMessage[]>("GET", `/support/messages?session_id=${encodeURIComponent(sid)}`);
  if (!res.ok || !Array.isArray(res.data)) return;
  const sessions = getChatSessions();
  const local = sessions.find((s) => s.id === localId || s.user_name === userName);
  const welcome = (local?.messages || []).filter((m) => m.id.startsWith("welcome-"));
  const serverMessages = toChatMessages(res.data);
  if (serverMessages.length === 0 && local) return;
  const last = res.data[res.data.length - 1];
  const merged: ChatSession = {
    ...(local || { id: localId, user_name: userName, user_type: userRole, unread: false }),
    ...currentRecipient(),
    last_message: last ? last.body : local?.last_message || "",
    time: last ? clock(last.created_at) : local?.time || "",
    messages: [...welcome, ...serverMessages],
  } as ChatSession;
  const others = sessions.filter((s) => s !== local);
  saveChatSessions([merged, ...others]);
}

const ROLE_LABELS: Record<string, string> = { tourist: "سائح", guide: "مرشد سياحي", transport: "شركة نقل", driver: "سائق", visitor: "زائر" };

/** Admin: every conversation from the server, first; browser-only conversations from before stay after them. */
export async function pullAdminSessions(): Promise<void> {
  const res = await laravelRequest<any[]>("GET", "/support/sessions");
  if (!res.ok || !Array.isArray(res.data)) return;
  const fromServer: ChatSession[] = res.data.map((c: any) => ({
    id: c.session_id,
    user_name: c.owner_name || "زائر",
    user_type: ROLE_LABELS[c.owner_role] || c.owner_role,
    last_message: c.last_message,
    time: clock(c.last_at),
    unread: Number(c.unread) > 0,
    messages: toChatMessages(c.messages || []),
    recipient_role: (c.owner_role === "transport" ? "company" : c.owner_role) as ChatSession["recipient_role"],
    recipient_id: c.owner_id || undefined,
    server: true,
  }));
  const ids = new Set(fromServer.map((x) => x.id));
  const legacy = getChatSessions().filter((x) => !x.server && !ids.has(x.id));
  saveChatSessions([...fromServer, ...legacy]);
}

/** Admin opened a conversation: its messages are marked read on the server. */
export function markAdminSessionRead(sessionId: string): void {
  const s = getChatSessions().find((x) => x.id === sessionId);
  if (s?.server) laravelRequest("POST", `/support/sessions/${encodeURIComponent(sessionId)}/read`, {}).catch(() => {});
}
