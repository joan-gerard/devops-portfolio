import { isAllowedProjectUrlScheme, normalizeProjectUrl } from "../validateProjectUrl";

describe("isAllowedProjectUrlScheme", () => {
  it("returns true for https URLs", () => {
    expect(isAllowedProjectUrlScheme("https://github.com/foo")).toBe(true);
    expect(isAllowedProjectUrlScheme("https://example.com")).toBe(true);
  });

  it("returns true for http URLs", () => {
    expect(isAllowedProjectUrlScheme("http://localhost:3000")).toBe(true);
  });

  it("returns false for empty string or non-string", () => {
    expect(isAllowedProjectUrlScheme("")).toBe(false);
    expect(isAllowedProjectUrlScheme("   ")).toBe(false);
    expect(isAllowedProjectUrlScheme(null as unknown as string)).toBe(false);
    expect(isAllowedProjectUrlScheme(123 as unknown as string)).toBe(false);
  });

  it("returns false for disallowed schemes (XSS vectors)", () => {
    expect(isAllowedProjectUrlScheme("javascript:alert(1)")).toBe(false);
    expect(isAllowedProjectUrlScheme("data:text/html,<script>alert(1)</script>")).toBe(false);
    expect(isAllowedProjectUrlScheme("file:///etc/passwd")).toBe(false);
  });

  it("returns false for invalid URL strings", () => {
    expect(isAllowedProjectUrlScheme("not a url")).toBe(false);
    expect(isAllowedProjectUrlScheme("://missing-scheme")).toBe(false);
  });

  it("trims input before parsing", () => {
    expect(isAllowedProjectUrlScheme("  https://example.com  ")).toBe(true);
  });

  it("returns false when URL exceeds max length (2048)", () => {
    const longUrl = "https://example.com/" + "a".repeat(2048);
    expect(isAllowedProjectUrlScheme(longUrl)).toBe(false);
  });
});

describe("normalizeProjectUrl", () => {
  it("returns null for null and undefined", () => {
    expect(normalizeProjectUrl(null)).toBe(null);
    expect(normalizeProjectUrl(undefined)).toBe(null);
  });

  it("returns null for blank or whitespace-only string", () => {
    expect(normalizeProjectUrl("")).toBe(null);
    expect(normalizeProjectUrl("   ")).toBe(null);
  });

  it("returns trimmed string for non-blank input", () => {
    expect(normalizeProjectUrl("https://github.com/foo")).toBe("https://github.com/foo");
    expect(normalizeProjectUrl("  https://example.com  ")).toBe("https://example.com");
  });

  it("returns null for non-string (defensive)", () => {
    expect(normalizeProjectUrl(123 as unknown as string)).toBe(null);
  });
});
