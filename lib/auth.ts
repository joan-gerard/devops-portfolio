/**
 * Error code returned to the client when sign-in fails due to server
 * misconfiguration (e.g. missing ADMIN_PASSWORD_HASH or invalid hash).
 * Used so the UI can show a distinct message without leaking server details.
 */
export const AUTH_ERROR_SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE";
