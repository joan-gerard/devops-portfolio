type LoginSubmitButtonProps = {
  loading: boolean;
};

const baseButtonStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderRadius: "4px",
  padding: "10px",
  fontFamily: "monospace",
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
        background: loading ? "#1a1e28" : "#00e5a0",
        color: loading ? "#6b7280" : "#0d0f14",
        cursor: loading ? "not-allowed" : "pointer",
      }}
    >
      {loading ? "Signing in..." : "Sign in"}
    </button>
  );
}
