import { beforeEach, describe, expect, it } from "vitest";

import { computeInitialSidebarOpen, parseSidebarCookie } from "../adminSidebarStorage";

describe("adminSidebarStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe("computeInitialSidebarOpen", () => {
    it("returns fromServer when localStorage has no value", () => {
      expect(computeInitialSidebarOpen(false, true)).toBe(true);
      expect(computeInitialSidebarOpen(false, false)).toBe(false);
    });

    it("when hadCookie is false, prefers localStorage when set", () => {
      localStorage.setItem("devops-portfolio/admin-sidebar-open", "false");
      expect(computeInitialSidebarOpen(false, true)).toBe(false);
    });

    it("when hadCookie is true, prefers fromServer over localStorage", () => {
      localStorage.setItem("devops-portfolio/admin-sidebar-open", "true");
      expect(computeInitialSidebarOpen(true, false)).toBe(false);
    });
  });

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
