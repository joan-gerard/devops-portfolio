/** Key for persisting admin sidebar open/closed in localStorage. */
export const ADMIN_SIDEBAR_STORAGE_KEY = "devops-portfolio/admin-sidebar-open";

/** Cookie name: mirrors localStorage so the server can render the correct initial layout (avoids flash on refresh). */
export const ADMIN_SIDEBAR_COOKIE_NAME = "devops-portfolio_admin_sidebar";

/** Cookie values (ASCII, no encoding needed). */
const COOKIE_OPEN = "1";
const COOKIE_CLOSED = "0";

export function parseSidebarCookie(value: string | undefined): boolean | null {
  if (value === COOKIE_CLOSED) return false;
  if (value === COOKIE_OPEN) return true;
  return null;
}

export function writeSidebarCookieClient(open: boolean): void {
  if (typeof document === "undefined") return;
  const v = open ? COOKIE_OPEN : COOKIE_CLOSED;
  let cookie = `${ADMIN_SIDEBAR_COOKIE_NAME}=${v}; Path=/; Max-Age=31536000; SameSite=Lax`;
  if (typeof window !== "undefined" && window.location.protocol === "https:") {
    cookie += "; Secure";
  }
  document.cookie = cookie;
}

/**
 * Initial open/closed for the admin shell. When no cookie was sent, prefer localStorage if set
 * (legacy). When a cookie exists, it wins over localStorage so SSR matches the request.
 */
export function computeInitialSidebarOpen(hadCookie: boolean, fromServer: boolean): boolean {
  if (typeof window === "undefined") return fromServer;
  const stored = readSidebarOpenFromStorage();
  if (stored === null) return fromServer;
  if (!hadCookie) return stored;
  return fromServer;
}

export function readSidebarOpenFromStorage(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
  } catch {
    /* private mode / quota */
  }
  return null;
}

export function writeSidebarOpenToStorage(open: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, open ? "true" : "false");
  } catch {
    /* ignore */
  }
}
