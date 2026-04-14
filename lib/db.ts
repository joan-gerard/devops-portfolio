import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

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

type SqlTag = {
  <TRow extends object = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...params: unknown[]
  ): Promise<TRow[]>;
  query<TRow extends object = Record<string, unknown>>(
    query: string,
    params?: unknown[]
  ): Promise<TRow[]>;
  unsafe: NeonQueryFunction<false, false>["unsafe"];
  json(value: unknown): string;
};

let _sql: NeonQueryFunction<false, false> | null = null;

function getClient(): NeonQueryFunction<false, false> {
  if (!_sql) {
    _sql = neon(getDatabaseUrl());
  }
  return _sql;
}

const sql: SqlTag = Object.assign(
  <TRow extends object = Record<string, unknown>>(
    strings: TemplateStringsArray,
    ...params: unknown[]
  ): Promise<TRow[]> => getClient()(strings, ...params) as unknown as Promise<TRow[]>,
  {
    query: <TRow extends object = Record<string, unknown>>(
      query: string,
      params: unknown[] = []
    ): Promise<TRow[]> => getClient().query(query, params) as unknown as Promise<TRow[]>,
    unsafe: (rawSql: string) => getClient().unsafe(rawSql),
    json: (value: unknown): string => JSON.stringify(value),
  }
);

export default sql;
