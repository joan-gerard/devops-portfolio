# E2E Troubleshooting: Stuck `pnpm test:e2e`

Use this checklist when Playwright appears stuck, waits forever, or does not start fresh.

---

## 1) Check which ports are in use

`pnpm test:e2e` expects the E2E app server on `localhost:3001`.

Run:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
lsof -nP -iTCP:3000 -sTCP:LISTEN
lsof -nP -iTCP:9323 -sTCP:LISTEN
```

- `3001`: E2E web server (`pnpm dev:e2e` / Playwright `webServer`).
- `3000`: regular dev server (`pnpm dev`), usually fine to keep.
- `9323`: Playwright HTML report server (can look like a hang if left open).

If `3001` has a stale process, Playwright may reuse it and hang.

---

## 2) Find PIDs and related processes

List all processes:

```bash
ps -ax
```

Common filtered view:

```bash
ps -axo pid,command | rg "node|playwright|next|pnpm"
```

Find PID by specific port (recommended):

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

---

## 3) Stop stale processes

Graceful stop first:

```bash
kill <pid>
```

Example:

```bash
kill 5159
```

Force stop only if needed:

```bash
kill -9 <pid>
```

Then verify the port is free:

```bash
lsof -nP -iTCP:3001 -sTCP:LISTEN
```

If no rows are returned, the port is free.

---

## 4) Re-run E2E cleanly

```bash
pnpm test:e2e
```

If tests run but the terminal stays open showing:

`Serving HTML report at http://localhost:9323. Press Ctrl+C to quit.`

that is the report server waiting. Press `Ctrl+C` to exit.

---

## 5) Notes specific to this repository

- `playwright.config.ts` uses:
  - `url: "http://localhost:3001"`
  - `webServer.command: "pnpm dev:e2e"`
  - `reuseExistingServer: !process.env.CI`
- Because reuse is enabled locally, stale `:3001` processes are a common cause of stuck runs.
- The normal dev server on `:3000` does not block E2E by itself, but can add noise when debugging.
