import postgres from "postgres";

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
    const client = getClient();
    return client[prop as keyof typeof client];
  },
  apply(_target, _thisArg, args) {
    return (getClient() as unknown as (...args: unknown[]) => unknown)(...args);
  },
});

export default sql;
