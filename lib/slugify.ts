/**
 * Produces a URL slug from a title (e.g. for new notes/projects).
 * Trims, lowercases, keeps only word chars and hyphens, collapses hyphens, max 80 chars.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special characters
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/-+/g, "-") // collapse multiple hyphens
    .substring(0, 80); // max 80 characters
}

/**
 * Sanitises raw input for use as a slug (e.g. while typing in the slug field).
 * Lowercases, allows only a-z0-9-, replaces other chars with hyphen, collapses hyphens.
 * Single source of truth for slug input rules; use in both editor and project slug fields.
 */
export function sanitiseSlugForInput(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
}
