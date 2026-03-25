type LoginSubmitButtonProps = {
  loading: boolean;
};

const baseButtonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: "4px",
  padding: "10px",
  fontFamily: "var(--font-mono)",
  fontSize: "13px",
  fontWeight: "600",
};

export function LoginSubmitButton({ loading }: LoginSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        ...baseButtonStyle,
        background: loading ? "var(--surface-2)" : "var(--accent)",
        color: loading ? "var(--text-muted)" : "var(--bg)",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Signing in..." : "Sign in"}
    </button>
  );
}
