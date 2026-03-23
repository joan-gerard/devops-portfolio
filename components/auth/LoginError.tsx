const errorStyle: React.CSSProperties = {
  color: "var(--red)",
  fontSize: "12px",
  fontFamily: "var(--font-mono)",
  marginBottom: "16px",
};

export function LoginError({ message }: { message: string }) {
  return (
    <p style={errorStyle} role="alert" aria-live="assertive">
      {message}
    </p>
  );
}
