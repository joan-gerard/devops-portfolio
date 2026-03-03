import sql from "@/lib/db";

/** Shape of a row from the pages table (as returned by getAllPages). */
export type PageRow = {
  id: string;
  title: string;
  slug: string | null;
  tags: string[] | null;
  published: boolean;
  updated_at: Date;
};

export async function getAllPages() {
  return sql<PageRow[]>`
    SELECT id, title, slug, tags, published, updated_at
    FROM pages
    ORDER BY updated_at DESC
  `;
}

export async function getPageById(id: string) {
  const [page] = await sql`
    SELECT * FROM pages WHERE id = ${id}
  `;
  return page ?? null;
}
