import postgres from "postgres";

/**
 * Validates DATABASE_URL at module load so the app fails fast with a clear
 * error instead of passing undefined to postgres() (which can lead to
 * confusing errors or unintended behavior).
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (typeof url !== "string" || url.trim() === "") {
    throw new Error(
      "DATABASE_URL is not set or is empty. Set it in .env.local (see README or docs)."
    );
  }
  if (!/^postgres(ql)?:\/\//i.test(url.trim())) {
    throw new Error(
      "DATABASE_URL must be a valid PostgreSQL connection string (postgres:// or postgresql://)."
    );
  }
  return url.trim();
}

const sql = postgres(getDatabaseUrl(), {
  ssl: "require",
});

export default sql;
