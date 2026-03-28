"use client";

import {
  ADMIN_SIDEBAR_STORAGE_KEY,
  computeInitialSidebarOpen,
  readSidebarOpenFromStorage,
  writeSidebarCookieClient,
  writeSidebarOpenToStorage,
} from "@/lib/adminSidebarStorage";
import { useCallback, useEffect, useLayoutEffect, useState, type CSSProperties } from "react";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const ADMIN_SIDEBAR_ID = "admin-sidebar";

type AdminShellProps = {
  appVersion: string;
  /** True when the request included our sidebar cookie (so we trust `initialSidebarOpen` over localStorage). */
  hadCookie?: boolean;
  /** From server cookie so SSR matches saved preference (avoids open flash when localStorage says closed). */
  initialSidebarOpen?: boolean;
  children: React.ReactNode;
};

export function AdminShell({
  appVersion,
  hadCookie = false,
  initialSidebarOpen = true,
  children,
}: AdminShellProps) {
  const [sidebarOpen, setSidebarOpenState] = useState(() =>
    computeInitialSidebarOpen(hadCookie, initialSidebarOpen)
  );

  useLayoutEffect(() => {
    const stored = readSidebarOpenFromStorage();
    if (stored === null) {
      writeSidebarOpenToStorage(sidebarOpen);
      writeSidebarCookieClient(sidebarOpen);
      return;
    }
    if (stored !== sidebarOpen) {
      writeSidebarOpenToStorage(sidebarOpen);
      writeSidebarCookieClient(sidebarOpen);
    }
  }, [sidebarOpen]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== ADMIN_SIDEBAR_STORAGE_KEY || e.storageArea !== window.localStorage) {
        return;
      }
      if (e.newValue === "true") setSidebarOpenState(true);
      else if (e.newValue === "false") setSidebarOpenState(false);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setSidebarOpen = useCallback((update: boolean | ((prev: boolean) => boolean)) => {
    setSidebarOpenState((prev) => {
      const next = typeof update === "function" ? update(prev) : update;
      writeSidebarOpenToStorage(next);
      writeSidebarCookieClient(next);
      return next;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((open) => !open);
  }, [setSidebarOpen]);

  const sidebarOffset = sidebarOpen ? "var(--sidebar-width)" : "0px";

  return (
    <div
      suppressHydrationWarning
      style={
        {
          display: "flex",
          minHeight: "100vh",
          "--admin-sidebar-offset": sidebarOffset,
        } as CSSProperties
      }
    >
      <AdminSidebar appVersion={appVersion} open={sidebarOpen} id={ADMIN_SIDEBAR_ID} />
      <div
        className="admin-shell__main"
        style={{
          marginLeft: "var(--admin-sidebar-offset)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <AdminHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
          sidebarId={ADMIN_SIDEBAR_ID}
        />
        <main
          style={{
            marginTop: "var(--header-height)",
            padding: "32px",
            flex: 1,
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
