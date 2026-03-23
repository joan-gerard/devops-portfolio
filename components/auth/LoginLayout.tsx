import { type ReactNode } from "react";

const mainStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--bg)",
};

export function LoginLayout({ children }: { children: ReactNode }) {
  return <main style={mainStyle}>{children}</main>;
}
