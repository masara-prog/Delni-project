// @ts-check
/**
 * Real-time Live Support Chat System for Delni Platform
 * Synchronizes user messages and admin replies across all dashboards & pages
 */

import { notifyChatbotUserMessage, notifyAdminChatReply } from "./notifications";

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
};

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
  if (existing) return existing;

  const newSession: ChatSession = {
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

  // Trigger admin notification for new user chatbot message
  try {
    notifyChatbotUserMessage(userName, userRole, text);
  } catch {}

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
  if (target) {
    saveChatSessions(updated);
    try {
      notifyAdminChatReply(target.user_name, text, target.id);
    } catch {}
  }
  return target;
}
