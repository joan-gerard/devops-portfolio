/**
 * Validates slug format and length for projects and pages.
 * Used to avoid very long or invalid slugs that could cause issues in DB, URLs, or caches.
 */

/** Maximum allowed slug length (characters). */
export const MAX_SLUG_LENGTH = 200;

/**
 * Slug must be lowercase letters, digits, and single hyphens between segments.
 * No leading/trailing hyphens, no consecutive hyphens.
 */
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Normalises a slug candidate before validation — trims whitespace and lowercases.
 * Always call this before isValidSlug or getSlugValidationError so the validated
 * value matches what will be stored.
 */
export function normalizeSlug(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Returns true if the value is a valid slug: non-empty, within length limit,
 * and matching format (lowercase alphanumeric and hyphens, no leading/trailing/consecutive hyphens).
 *
 * Note: the typeof guard is intentional — this function may be called from
 * JavaScript contexts where the type cannot be guaranteed at compile time.
 */
export function isValidSlug(value: string): boolean {
  if (typeof value !== "string") return false;
  if (value.length === 0 || value.length > MAX_SLUG_LENGTH) return false;
  return SLUG_REGEX.test(value);
}

/**
 * Returns an error message describing slug rules, or null if the slug is valid.
 * Use when you need to return a 400 with a clear message.
 * Expects a normalised value — call normalizeSlug() before this.
 */
export function getSlugValidationError(value: string): string | null {
  if (isValidSlug(value)) return null;
  if (value.length === 0) return "Slug is required";
  if (value.length > MAX_SLUG_LENGTH) {
    return `Slug must be at most ${MAX_SLUG_LENGTH} characters`;
  }
  return "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-project), with no leading or trailing hyphens";
}
