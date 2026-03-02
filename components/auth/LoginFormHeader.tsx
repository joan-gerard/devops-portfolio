const titleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  color: "#e8eaf0",
  marginBottom: "8px",
};

const subtitleStyle: React.CSSProperties = {
  fontFamily: "monospace",
  color: "#6b7280",
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
