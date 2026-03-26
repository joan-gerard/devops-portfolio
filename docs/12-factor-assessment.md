# 12-Factor App Assessment

This document reviews how the current `devops-portfolio` repository aligns with the [12-Factor App](https://12factor.net/) methodology and highlights practical gaps to close.

Assessment scale used in this doc:

- `Aligned`: current implementation follows the factor well.
- `Partially aligned`: good baseline, but gaps or caveats remain.
- `Gap`: significant mismatch with 12-factor guidance.

---

## 1) Codebase — One codebase, many deploys

**Status:** `Aligned`

**Evidence in repo**

- Single Git repository with one deployable app (`next` app).
- Environment-specific behavior is controlled via env vars/scripts rather than separate repos.

**Notes**

- The `scripts/swap-public-pages.mjs` step introduces environment-dependent page swapping, but still within one codebase.

---

## 2) Dependencies — Explicitly declare and isolate dependencies

**Status:** `Aligned`

**Evidence in repo**

- Dependencies are explicit in `package.json` and locked in `pnpm-lock.yaml`.
- Package manager version is pinned (`"packageManager": "pnpm@10.20.0"`).
- CI installs with `pnpm install --frozen-lockfile`.

**Notes**

- Multi-stage Docker build is also dependency-aware and reproducible.

---

## 3) Config — Store config in the environment

**Status:** `Partially aligned`

**Evidence in repo**

- Runtime/build config comes from `process.env.*` in API routes, auth, DB, Sentry, Playwright, and Next config.
- Security docs explicitly require env-based secrets and avoiding committed `.env*`.

**Gaps**

- Some developer-facing docs still imply local `.env.local` setup only, but there is no single canonical env contract document for all required variables by runtime (dev, CI, prod, e2e, Docker).
- `lib/r2.ts` uses non-null assertions (`!`) at module init; `/api/media` does runtime validation, but the client construction still assumes env presence globally.

**Recommendations**

- Add `docs/environment-variables.md` with required/optional vars, scopes, defaults, and examples.
- Centralize env parsing/validation in one module (e.g., a typed config layer) and import from there.

---

## 4) Backing services — Treat backing services as attached resources

**Status:** `Aligned`

**Evidence in repo**

- Postgres and Cloudflare R2 are consumed through connection/config variables.
- Docker Compose models Postgres as an attached resource.
- Health endpoint checks DB connectivity without embedding service internals.

**Notes**

- This is broadly portable across environments if env vars are provided.

---

## 5) Build, release, run — Strictly separate stages

**Status:** `Partially aligned`

**Evidence in repo**

- CI distinguishes install/lint/test/build stages.
- Docker uses separate build (`builder`) and run (`runner`) stages.
- Runtime container is minimal and non-root.

**Gaps**

- Release metadata/versioning and promotion flow are not explicitly documented as a distinct release artifact step.
- Build-time placeholder env vars are used in CI/Docker to satisfy initialization, which works, but blurs clarity between true runtime requirements and build-only placeholders.

**Recommendations**

- Document release flow explicitly (artifact, tag/version, deploy target, rollback).
- Keep a clear table of build-time vs runtime env vars.

---

## 6) Processes — Execute app as stateless processes

**Status:** `Partially aligned`

**Evidence in repo**

- App process itself is designed as a web service with persistent state in Postgres/R2.
- NextAuth is configured for JWT session strategy (no DB session store), which supports stateless app instances.

**Gaps**

- In-memory rate limiting (`loginAttempts`) may create inconsistent behavior across horizontally scaled instances unless backed by shared storage (DB/Redis). (If already DB-backed everywhere, document it as such.)
- Any in-memory caches or transient process state should be audited and documented for horizontal scaling behavior.

**Recommendations**

- Ensure all security-sensitive counters/locks are in shared storage.
- Add a short statelessness note to operational docs (what is process memory only vs durable).

---

## 7) Port binding — Export services via port binding

**Status:** `Aligned`

**Evidence in repo**

- Next.js app runs via `next start`, binds to `PORT`/`HOSTNAME`.
- Dockerfile exposes port `3000`.
- Local and e2e dev servers use explicit port bindings (`3000`, `3001`).

---

## 8) Concurrency — Scale out via the process model

**Status:** `Partially aligned`

**Evidence in repo**

- App can run as multiple stateless web instances in principle.
- CI and e2e workflows already account for concurrent execution in test contexts.

**Gaps**

- No explicit process formation (web/worker/release process types) documented.
- Background/async workloads are not modeled as first-class process types yet (if needed later).

**Recommendations**

- Document intended scale model (web replicas, resource limits, readiness checks).
- If asynchronous jobs grow, split into dedicated worker process(es).

---

## 9) Disposability — Fast startup and graceful shutdown

**Status:** `Partially aligned`

**Evidence in repo**

- Containerized runtime is lean and starts from built standalone assets.
- Health endpoint exists for uptime checks.

**Gaps**

- No explicit readiness/liveness strategy documented for orchestrators.
- Graceful shutdown semantics (e.g., signal handling expectations, draining behavior) are not documented.

**Recommendations**

- Add deployment/runtime notes for health checks and shutdown behavior.
- Validate startup time and cold-start expectations in your target platform.

---

## 10) Dev/prod parity — Keep environments as similar as possible

**Status:** `Partially aligned`

**Evidence in repo**

- Docker and CI mimic production-like build behavior.
- Same package manager and lockfile are used consistently.

**Gaps**

- `swap-public-pages` with `TARGET_ENV` creates behavior divergence across environments.
- E2E uses a dedicated dev server (`dev:e2e`) and feature flags, which is practical but not fully prod-parity.
- Some workflows depend on placeholder env values during build.

**Recommendations**

- Minimize environment-specific source swapping; prefer config flags with identical code paths where possible.
- Keep parity-focused docs: what differs intentionally and why.

---

## 11) Logs — Treat logs as event streams

**Status:** `Partially aligned`

**Evidence in repo**

- Application errors are emitted to stdout/stderr via `console.error` and can be collected by platform log aggregation.

**Gaps**

- Logging is mostly unstructured (plain strings), making filtering/correlation harder at scale.
- No documented log schema (fields like request id, route, severity, error class).

**Recommendations**

- Adopt structured JSON logging for server routes and critical flows.
- Define a minimal log schema and include correlation ids.

---

## 12) Admin processes — Run admin/management tasks as one-off processes

**Status:** `Partially aligned`

**Evidence in repo**

- Migrations and seed flows exist (SQL migrations, compose seed job).
- CI/e2e tasks run as separate one-off commands.

**Gaps**

- No unified, documented operational command set for one-off admin tasks (e.g., migrate, seed, backfill, data fix scripts).
- Some admin actions are currently app-driven only (UI/API), which is fine for product use but not enough for ops runbooks.

**Recommendations**

- Add a small operations runbook with one-off commands and safety notes.
- Standardize script entry points (`pnpm` scripts) for repeatable admin operations.

---

## Priority gap summary

If you want the highest impact with least churn, tackle these first:

1. **Config contract**: document and type-validate all env vars in one place.
2. **Structured logging**: move from ad-hoc `console.*` messages to structured logs.
3. **Release/runbook docs**: make build/release/run and one-off admin tasks explicit.
4. **Parity simplification**: reduce environment-specific code swapping where possible.

---

## Overall scorecard

- **Aligned:** 4/12 (`Codebase`, `Dependencies`, `Backing services`, `Port binding`)
- **Partially aligned:** 8/12
- **Gap:** 0/12 (no severe anti-patterns found, but several operational maturity gaps remain)

The project already has a strong baseline for modern deployment workflows. Most remaining work is in operational clarity and consistency rather than major architectural rewrites.
