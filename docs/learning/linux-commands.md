# Linux commands – learning notes

Notes and examples as I learn Linux commands. Add entries with the command, what it does, and when to use (or avoid) it.

---

## `rm` – remove files and directories

**Example:** `rm -rf app/api/test-db`

- **`rm`** – remove (delete) files or directories.
- **`-r`** (or `--recursive`) – remove directories and their contents recursively.
- **`-f`** (or `--force`) – don’t prompt for confirmation; ignore nonexistent files.

So `rm -rf app/api/test-db` deletes the `app/api/test-db` directory and everything inside it, without asking.

**Caution:** `rm -rf` is irreversible. Double-check the path (no trailing slash typo, correct target). Avoid `rm -rf /` or `rm -rf /*` — they can wipe the system.

---

## `brew install libpq && brew link --force libpq` – install and link PostgreSQL client (libpq)

**Example:** `brew install libpq && brew link --force libpq`

- **`brew install libpq`** – installs the libpq formula (PostgreSQL client library and tools like `psql`, `pg_dump`) via Homebrew.
- **`&&`** – runs the second command only if the first succeeds.
- **`brew link --force libpq`** – links the installed libpq into Homebrew’s prefix so its binaries and headers are on your PATH; `--force` overwrites existing links (e.g. from a system PostgreSQL).

Use this when you need the PostgreSQL client tools or libpq on macOS and want them managed by Homebrew, or when system PostgreSQL conflicts and you want to use Homebrew’s version. Avoid `--force` if you intentionally want to keep another PostgreSQL installation as the default.

---

## Your notes

Add your own command notes below. Suggested format:

### Command name

**Example:** `your example here`

- What each flag/argument does.
- When to use it (and when not to).

---
