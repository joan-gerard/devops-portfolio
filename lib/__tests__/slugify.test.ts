import { slugify } from "../slugify";

describe("slugify", () => {
  it("lowercases and trims the title", () => {
    expect(slugify("  Hello World  ")).toBe("hello-world");
  });

  it("removes special characters but preserves spaces and hyphens", () => {
    expect(slugify("Hello, World! #1")).toBe("hello-world-1");
  });

  it("collapses multiple spaces and hyphens into single hyphens", () => {
    expect(slugify("Hello   world -- next")).toBe("hello-world-next");
  });

  it("enforces a maximum length of 80 characters", () => {
    const longTitle = "a".repeat(100);
    expect(slugify(longTitle)).toBe("a".repeat(80));
  });
});
