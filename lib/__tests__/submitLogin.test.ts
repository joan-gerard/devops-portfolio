import { AUTH_ERROR_SERVICE_UNAVAILABLE } from "@/lib/auth";
import { signIn } from "next-auth/react";
import { describe, expect, it, vi } from "vitest";
import { submitLogin } from "../submitLogin";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

const mockedSignIn = signIn as unknown as ReturnType<typeof vi.fn>;

describe("submitLogin", () => {
  it("returns ok: true when signIn succeeds without error", async () => {
    mockedSignIn.mockResolvedValueOnce({ error: null });

    const result = await submitLogin("test@example.com", "password");

    expect(result).toEqual({ ok: true });
    expect(mockedSignIn).toHaveBeenCalledWith("credentials", {
      email: "test@example.com",
      password: "password",
      redirect: false,
    });
  });

  it("maps AUTH_ERROR_SERVICE_UNAVAILABLE to a friendly message", async () => {
    mockedSignIn.mockResolvedValueOnce({ error: AUTH_ERROR_SERVICE_UNAVAILABLE });

    const result = await submitLogin("test@example.com", "password");

    expect(result.ok).toBe(false);
    expect(result).toEqual({
      ok: false,
      error: "Sign-in is temporarily unavailable. Please try again later.",
    });
  });

  it("decodes other error messages via decodeURIComponent", async () => {
    const rawError = "Something%20went%20wrong";
    mockedSignIn.mockResolvedValueOnce({ error: rawError });

    const result = await submitLogin("test@example.com", "password");

    expect(result).toEqual({
      ok: false,
      error: "Something went wrong",
    });
  });

  it("returns default error message when signIn throws", async () => {
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockedSignIn.mockRejectedValueOnce(new Error("network error"));

    const result = await submitLogin("test@example.com", "password");

    expect(result).toEqual({ ok: false, error: "Sign in failed" });
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
