"use client";

import { useState, type CSSProperties } from "react";

import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";

const ADMIN_SIDEBAR_ID = "admin-sidebar";

type AdminShellProps = {
  appVersion: string;
  children: React.ReactNode;
};

export function AdminShell({ appVersion, children }: AdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((open) => !open);

  const sidebarOffset = sidebarOpen ? "var(--sidebar-width)" : "0px";

  return (
    <div
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
