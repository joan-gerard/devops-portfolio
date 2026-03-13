import {
  getSlugValidationError,
  isValidSlug,
  MAX_SLUG_LENGTH,
  normalizeSlug,
} from "../validateSlug";

describe("normalizeSlug", () => {
  it("trims whitespace and lowercases", () => {
    expect(normalizeSlug("  Foo-Bar ")).toBe("foo-bar");
  });

  it("returns empty string when only whitespace", () => {
    expect(normalizeSlug("   ")).toBe("");
  });
});

describe("isValidSlug", () => {
  it("returns true for valid slugs", () => {
    expect(isValidSlug("my-project")).toBe(true);
    expect(isValidSlug("abc123")).toBe(true);
    expect(isValidSlug("a")).toBe(true);
  });

  it("returns false for empty string", () => {
    expect(isValidSlug("")).toBe(false);
  });

  it("returns false when over max length", () => {
    expect(isValidSlug("a".repeat(MAX_SLUG_LENGTH + 1))).toBe(false);
    expect(isValidSlug("a".repeat(MAX_SLUG_LENGTH))).toBe(true);
  });

  it("returns false for invalid format", () => {
    expect(isValidSlug("My-Project")).toBe(false);
    expect(isValidSlug("--bad")).toBe(false);
    expect(isValidSlug("bad--slug")).toBe(false);
    expect(isValidSlug("bad slug")).toBe(false);
    expect(isValidSlug("-leading")).toBe(false);
    expect(isValidSlug("trailing-")).toBe(false);
  });

  it("returns false for non-string", () => {
    expect(isValidSlug(null as unknown as string)).toBe(false);
    expect(isValidSlug(undefined as unknown as string)).toBe(false);
    expect(isValidSlug(123 as unknown as string)).toBe(false);
  });
});

describe("getSlugValidationError", () => {
  it("returns null for valid slug", () => {
    expect(getSlugValidationError("my-project")).toBe(null);
  });

  it("returns message for empty slug", () => {
    expect(getSlugValidationError("")).toBe("Slug is required");
  });

  it("returns message for too long slug", () => {
    expect(getSlugValidationError("a".repeat(MAX_SLUG_LENGTH + 1))).toBe(
      `Slug must be at most ${MAX_SLUG_LENGTH} characters`
    );
  });

  it("returns format message for invalid format", () => {
    const candidate = "Bad Slug";
    const normalised = normalizeSlug(candidate);

    expect(getSlugValidationError(normalised)).toBe(
      "Slug must be lowercase letters, numbers, and hyphens only (e.g. my-project), with no leading or trailing hyphens"
    );
  });
});
