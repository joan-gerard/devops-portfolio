import { describe, expect, it } from "vitest";

import { parseSidebarCookie } from "../adminSidebarStorage";

describe("adminSidebarStorage", () => {
  describe("parseSidebarCookie", () => {
    it("returns false for 0", () => {
      expect(parseSidebarCookie("0")).toBe(false);
    });

    it("returns true for 1", () => {
      expect(parseSidebarCookie("1")).toBe(true);
    });

    it("returns null for missing or unknown", () => {
      expect(parseSidebarCookie(undefined)).toBeNull();
      expect(parseSidebarCookie("")).toBeNull();
      expect(parseSidebarCookie("yes")).toBeNull();
    });
  });
});
