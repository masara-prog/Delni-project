/**
 * Delni Platform - Universal API Client & Integration Bridge
 * Connects the React Frontend with the Laravel Backend & Python AI Service.
 * Implements a Safe-Fallback strategy to guarantee 100% UI stability.
 */

export const LARAVEL_API_URL = "http://127.0.0.1:8000/api";
export const AI_SERVICE_URL = "http://127.0.0.1:8001/api/ai";

export interface ApiResponse<T = any> {
  status: "success" | "error" | "online";
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * Check if the Laravel backend is online
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/health`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * User Authentication (Login)
 */
export async function apiLogin(params: {
  role: "tourist" | "guide" | "transport" | "driver" | "admin";
  login: string;
  password: string;
}): Promise<ApiResponse> {
  try {
    const res = await fetch(`${LARAVEL_API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (res.ok && data.token) {
      localStorage.setItem("dalni_token", data.token);
      localStorage.setItem("dalni_role", data.role);
      localStorage.setItem("dalni_user", JSON.stringify(data.user));
    }
    return data;
  } catch (err: any) {
    return {
      status: "error",
      message: "تعذر الاتصال بخادم المنصة. يرجى التأكد من تشغيل الخادم.",
    };
  }
}

/**
 * Logout
 */
export function apiLogout() {
  localStorage.removeItem("dalni_token");
  localStorage.removeItem("dalni_role");
  localStorage.removeItem("dalni_user");
}

/**
 * Get stored session
 */
export function getStoredSession() {
  const token = localStorage.getItem("dalni_token");
  const role = localStorage.getItem("dalni_role");
  const userJson = localStorage.getItem("dalni_user");
  let user = null;
  try {
    if (userJson) user = JSON.parse(userJson);
  } catch {}
  return { token, role, user };
}

/**
 * Intelligent Tourism AI Chat (Python FastAPI Microservice)
 */
export async function sendAIChatMessage(message: string): Promise<{
  reply: string;
  suggested_places?: string[];
  suggested_trips?: string[];
}> {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (res.ok) {
      return await res.json();
    }
    throw new Error("AI service returned non-200");
  } catch {
    // Intelligent Fallback with Authentic Libyan Knowledge if Python microservice is in offline mode
    const lower = message.toLowerCase();
    if (lower.includes("أوباري") || lower.includes("صحراء") || lower.includes("سفاري")) {
      return {
        reply: "أهلاً بك! 🐪 بحيرات أوباري وصحراء فزان وجهة عالمية فريدة للتخييم وسفاري الكثبان الذهبية (أفضل موسم: نوفمبر - مارس). لدينا رحلات أسبوعية بسيارات دفع رباعي وسائقين محترفين.",
        suggested_places: ["بحيرات أوباري", "قبر عون", "أكاكوس"],
        suggested_trips: ["مغامرة أوباري وبحيرات الصحراء (6 أيام)"],
      };
    }
    if (lower.includes("لبدة") || lower.includes("رومان") || lower.includes("صبراتة")) {
      return {
        reply: "مرحباً بك! 🏛️ لبدة الكبرى وصبراتة هما درتا التراث الروماني على البحر المتوسط المصنفتان في اليونسكو. نوفر رحلات يومية بحافلات مكيفة ومرشدين معتمدين.",
        suggested_places: ["لبدة الكبرى", "مسرح صبراتة"],
        suggested_trips: ["جولة لبدة الكبرى اليومية", "رحلة صبراتة الأثرية"],
      };
    }
    return {
      reply: "مرحباً بك في منصة دَلِّني السياحية! 🌟 أنا مساعدك السياحي الذكي. يسعدني إرشادك لأفضل الرحلات والمعالم الأثرية والصحراوية في ليبيا. ما هي وجهتك المفضلة؟",
      suggested_places: ["لبدة الكبرى", "أوباري", "غدامس", "قورينا"],
      suggested_trips: ["جولة لبدة الكبرى اليومية", "مغامرة أوباري الصحراوية"],
    };
  }
}
