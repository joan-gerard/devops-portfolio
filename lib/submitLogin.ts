import { AUTH_ERROR_SERVICE_UNAVAILABLE } from "@/lib/auth";
import { signIn } from "next-auth/react";

/**
 * Result of a login attempt. Either success (ok: true) or failure with a
 * user-visible error message (ok: false, error: string).
 */
export type LoginResult = { ok: true } | { ok: false; error: string };

const DEFAULT_ERROR_MESSAGE = "Sign in failed";

/**
 * Attempts to sign in with the given credentials. Never throws: network
 * errors and other exceptions are caught and returned as a failed result
 * with a user-visible error message.
 *
 * Intended for use from client components (e.g. login form). Caller should
 * set loading state before calling and clear it in a finally block.
 */
export async function submitLogin(email: string, password: string): Promise<LoginResult> {
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      const message =
        result.error === AUTH_ERROR_SERVICE_UNAVAILABLE
          ? "Sign-in is temporarily unavailable. Please try again later."
          : decodeURIComponent(result.error);
      return { ok: false, error: message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : DEFAULT_ERROR_MESSAGE;
    return { ok: false, error: message };
  }
}
