const titleStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  color: "var(--text)",
  marginBottom: "8px",
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: "var(--font-mono)",
  color: "var(--text-muted)",
  fontSize: "13px",
  marginBottom: "32px",
};

export function LoginFormHeader() {
  return (
    <>
      <h1 style={titleStyle}>Admin</h1>
      <p style={subtitleStyle}>Sign in to your dashboard</p>
    </>
  );
}
