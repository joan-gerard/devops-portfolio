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

let _sql: ReturnType<typeof postgres> | null = null;

function getClient(): ReturnType<typeof postgres> {
  if (!_sql) {
    _sql = postgres(getDatabaseUrl(), { ssl: "require" });
  }
  return _sql;
}

const sql = new Proxy({} as ReturnType<typeof postgres>, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
  apply(_target, _thisArg, args) {
    return (getClient() as any)(...args);
  },
});

export default sql;
