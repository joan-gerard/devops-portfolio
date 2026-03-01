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

## Your notes

Add your own command notes below. Suggested format:

### Command name

**Example:** `your example here`

- What each flag/argument does.
- When to use it (and when not to).

---
