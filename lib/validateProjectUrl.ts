/**
 * Validates project URLs (e.g. github_url, live_url) to prevent XSS when
 * rendered as href. Only http: and https: schemes are allowed.
 */

const ALLOWED_SCHEMES = ["https:", "http:"] as const;
const MAX_URL_LENGTH = 2048;

/**
 * Returns true if the given string is a valid URL with an allowed scheme
 * (http: or https:). Used before storing project URLs to reject javascript:,
 * data:, or other schemes that could lead to XSS when rendered as links.
 */
export function isAllowedProjectUrlScheme(value: string): boolean {
  if (typeof value !== "string" || value.length === 0 || value.length > MAX_URL_LENGTH) {
    return false;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  try {
    const url = new URL(trimmed);
    return ALLOWED_SCHEMES.includes(url.protocol as (typeof ALLOWED_SCHEMES)[number]);
  } catch {
    return false;
  }
}

/**
 * Normalizes a project URL field from the API: null, undefined, or blank
 * string become null; otherwise the string is trimmed. Does not validate
 * scheme; use isAllowedProjectUrlScheme after normalizing when non-null.
 */
export function normalizeProjectUrl(value: string | null | undefined): string | null {
  if (value == null) return null;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}
