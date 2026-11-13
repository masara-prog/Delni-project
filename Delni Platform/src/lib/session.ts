/**
 * The signed-in account (token, role, user) belongs to the browser tab.
 *
 * It used to live only in localStorage, which every tab of the same browser shares: signing in as a guide in one
 * tab silently replaced the tourist signed in on another tab, and both tabs then acted as the last account.
 * Now each tab keeps its own copy in sessionStorage, so two tabs can stay signed in as two different accounts.
 * localStorage still holds the last account signed in on this computer, so a new tab (or a link opened in one)
 * starts signed in as that account, and a reload keeps the tab's own account.
 */
export const SESSION_KEYS = ["dalni_token", "dalni_role", "dalni_user"] as const;
const SIGNED_OUT = "dalni_tab_signed_out";

function isSessionKey(key: string) {
  return (SESSION_KEYS as readonly string[]).includes(key);
}

export function sessionGet(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const own = sessionStorage.getItem(key);
    if (own !== null || !isSessionKey(key)) return own;
    // A tab that never signed in or out by itself starts from the last account on this computer
    if (sessionStorage.getItem(SIGNED_OUT)) return null;
    const shared = localStorage.getItem(key);
    if (shared !== null) sessionStorage.setItem(key, shared);
    return shared;
  } catch {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }
}

export function sessionSet(key: string, value: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(key, value);
    sessionStorage.removeItem(SIGNED_OUT);
  } catch {}
  try {
    localStorage.setItem(key, value);
  } catch {}
}

export function sessionRemove(key: string) {
  if (typeof window === "undefined") return;
  let own: string | null = null;
  try {
    own = sessionStorage.getItem(key);
    sessionStorage.removeItem(key);
    sessionStorage.setItem(SIGNED_OUT, "1");
  } catch {}
  try {
    // Signing out here must not sign out another tab's account: clear the shared copy only when it is this tab's
    if (own === null || localStorage.getItem(key) === own) localStorage.removeItem(key);
  } catch {}
}
