const errorStyle: React.CSSProperties = {
  color: "#f87171",
  fontSize: "12px",
  fontFamily: "monospace",
  marginBottom: "16px",
};

export function LoginError({ message }: { message: string }) {
  return (
    <p style={errorStyle} role="alert" aria-live="assertive">
      {message}
    </p>
  );
}
