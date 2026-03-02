# Authentication

This document describes the admin authentication setup introduced on the `set-up-authentication` branch: NextAuth with credentials provider, protected admin routes, and related UI and error handling.

## Overview

- **Provider**: [NextAuth.js](https://next-auth.js.org/) with the **Credentials** provider.
- **Session**: JWT-based (`strategy: "jwt"`); no database session store.
- **Credentials**: Single admin user defined via environment variables (`ADMIN_EMAIL` and a bcrypt-hashed `ADMIN_PASSWORD_HASH`).
- **Routes**: `/admin/login` (sign-in page), `/admin/dashboard` (protected). Unauthenticated access to the dashboard redirects to login; authenticated access to login redirects to the dashboard.

## Environment variables

| Variable              | Description                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `ADMIN_EMAIL`         | Email used to sign in (must match the value submitted in the form).                                                                |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash of the admin password. Generate with e.g. `node -e "require('bcryptjs').hash('your-password', 10).then(console.log)"`. |

These must be set in `.env.local` (or your deployment environment). If `ADMIN_PASSWORD_HASH` is missing or empty, sign-in is rejected and the user sees a generic “Sign-in is temporarily unavailable” message (no server details are exposed).

## Architecture

### API route: `app/api/auth/[...nextauth]/route.ts`

- Defines **`authOptions`** (NextAuth `AuthOptions`) and exports it so Server Components and other server code can call `getServerSession(authOptions)`.
- Registers the Credentials provider: compares submitted email to `ADMIN_EMAIL` and password to `ADMIN_PASSWORD_HASH` via `bcrypt.compare`. On success returns a user object `{ id: "1", email }`.
- If `ADMIN_PASSWORD_HASH` is missing/empty or bcrypt comparison throws, the route throws an error with the code `AUTH_ERROR_SERVICE_UNAVAILABLE` (from `lib/auth`) so the client can show a distinct message without leaking configuration details.
- Custom sign-in page: `pages.signIn: "/admin/login"`.
- Exports `GET` and `POST` handlers by wrapping `NextAuth(authOptions)`.

### Shared auth constants: `lib/auth.ts`

- **`AUTH_ERROR_SERVICE_UNAVAILABLE`**: String constant (`"SERVICE_UNAVAILABLE"`) used when sign-in fails due to server misconfiguration or bcrypt errors. The client maps this to a user-friendly message and never exposes server details.

### Client login logic: `lib/login.ts`

- **`submitLogin(email, password)`**: Calls `signIn("credentials", { email, password, redirect: false })`. Returns a `LoginResult`: either `{ ok: true }` or `{ ok: false, error: string }`.
- Never throws: network and other errors are caught and turned into a failed result with a safe message. If the server returns `AUTH_ERROR_SERVICE_UNAVAILABLE`, the message is “Sign-in is temporarily unavailable. Please try again later.”; otherwise “Invalid email or password”.
- Intended for client components (e.g. the login form). The form sets loading state and uses try/catch/finally to clear it.

### Admin layout and session: `app/(admin)/admin/layout.tsx`

- Server Component that calls `getServerSession(authOptions)` and wraps children in **`AuthSessionProvider`** with that session so client components under `/admin` can use `useSession()`.

### Auth session provider: `components/providers/AuthSessionProvider.tsx`

- Client-only wrapper around NextAuth’s `SessionProvider`. The layout fetches the session on the server and passes it in, so the session is available to client components without extra round-trips.

### Pages

- **`app/(admin)/admin/login/page.tsx`**: Server Component. If the user has a session, redirects to `/admin/dashboard`; otherwise renders **`LoginForm`**.
- **`app/(admin)/admin/dashboard/page.tsx`**: Server Component. If there is no session, redirects to `/admin/login`; otherwise renders the dashboard and **`SignOutButton`**.

### Auth UI components: `components/auth/`

- **`LoginForm`** (`app/(admin)/admin/login/LoginForm.tsx`): Client form that collects email/password, calls `submitLogin`, and on success navigates to `/admin/dashboard`. Uses loading and error state; errors are shown via **`LoginError`** (with `role="alert"` and `aria-live="assertive"` for screen readers).
- **`LoginError`**: Renders a single error message with `role="alert"` and `aria-live="assertive"` for accessibility.
- **`LoginFormField`**: Labeled email/password input with optional show/hide password toggle (aria-labeled).
- **`LoginFormHeader`**: “Admin” title and “Sign in to your dashboard” subtitle.
- **`LoginLayout`**: Centered full-height layout for the login form.
- **`LoginSubmitButton`**: Submit button with loading state (disabled and “Signing in...” when loading).
- **`SignOutButton`**: Client button that calls `signOut({ callbackUrl: "/admin/login" })` with hover styles; no form submission.

All of these are re-exported from `components/auth/index.ts`.

## Key decisions

1. **Exporting `authOptions`**: The NextAuth route exports `authOptions` so that `getServerSession(authOptions)` can be used in Server Components (dashboard, login page, admin layout) for consistent session checks and redirects.
2. **Centralized login logic**: Submit logic lives in `lib/login.ts` (`submitLogin`) so the form stays thin and the same error handling and result contract can be reused or tested.
3. **Distinct messages for misconfiguration**: When `ADMIN_PASSWORD_HASH` is missing or bcrypt fails, the server returns `AUTH_ERROR_SERVICE_UNAVAILABLE` and the client shows “Sign-in is temporarily unavailable” instead of a credential error or stack trace.
4. **Accessibility**: Auth error messages are announced via `role="alert"` and `aria-live="assertive"` on **`LoginError`**.
5. **SignOutButton**: Uses `type="button"` and explicit hover handlers (no form) so behavior is clear and predictable.

## Commit history (set-up-authentication branch)

The following commits are the ones that belong only to this branch (not in `main`), in chronological order:

| Commit    | Summary                                                                                                                                                           |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `4644e38` | Add admin auth with NextAuth (credentials + protected dashboard): route, auth components, dashboard, login page, layout, `AuthSessionProvider`, and dependencies. |
| `9d15006` | Refactor admin login: extract `LoginForm` component and redirect signed-in users from the login page.                                                             |
| `b44ac18` | Remove debug logs from the NextAuth route.                                                                                                                        |
| `c51bccd` | Export `authOptions` from the NextAuth route and use it in `getServerSession()` in dashboard, layout, and login page.                                             |
| `d89be14` | Handle auth misconfiguration and bcrypt errors with distinct user-facing messages; introduce `AUTH_ERROR_SERVICE_UNAVAILABLE` in `lib/auth.ts`.                   |
| `7aaa6bb` | Update Cursor command (non-auth change in this branch).                                                                                                           |
| `82375a5` | fix(auth): SignOutButton type and hover handlers (explicit `type="button"`, inline hover handlers).                                                               |
| `09d44b6` | Add live-region semantics for auth errors (`role="alert"`, `aria-live="assertive"` on `LoginError`).                                                              |
| `5f571a2` | Harden login form with try/catch/finally and move submit logic to `lib/login.ts` (`submitLogin`).                                                                 |

## Related documentation

- [Security](security.md): General security practices; admin credentials and auth are covered there as well.
