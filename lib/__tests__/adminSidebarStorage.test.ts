import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ADMIN_SIDEBAR_COOKIE_NAME,
  computeInitialSidebarOpen,
  parseSidebarCookie,
  writeSidebarCookieClient,
} from "../adminSidebarStorage";

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

  describe("writeSidebarCookieClient", () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      Reflect.deleteProperty(document, "cookie");
    });

    it("sets cookie without Secure on http", () => {
      vi.stubGlobal("location", { protocol: "http:" } as Location);
      let written = "";
      Object.defineProperty(document, "cookie", {
        configurable: true,
        set(value: string) {
          written = value;
        },
        get() {
          return "";
        },
      });
      writeSidebarCookieClient(true);
      expect(written).toBe(
        `${ADMIN_SIDEBAR_COOKIE_NAME}=1; Path=/; Max-Age=31536000; SameSite=Lax`
      );
    });

    it("appends Secure on https", () => {
      vi.stubGlobal("location", { protocol: "https:" } as Location);
      let written = "";
      Object.defineProperty(document, "cookie", {
        configurable: true,
        set(value: string) {
          written = value;
        },
        get() {
          return "";
        },
      });
      writeSidebarCookieClient(false);
      expect(written).toBe(
        `${ADMIN_SIDEBAR_COOKIE_NAME}=0; Path=/; Max-Age=31536000; SameSite=Lax; Secure`
      );
    });
  });
});
