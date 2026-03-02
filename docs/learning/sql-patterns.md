# SQL patterns – learning notes

Notes and examples for common SQL patterns. Each section covers what the pattern does, when to use it, and practical examples.

---

## COALESCE

**Purpose:** Return the first non-NULL value from a list of expressions.

**Syntax:** `COALESCE(value1, value2, ..., valueN)`

COALESCE evaluates the arguments left to right and returns the first one that is not NULL. If every argument is NULL, it returns NULL.

### Why it matters

- **Default values:** Use COALESCE to provide a fallback when a column might be NULL (e.g. display "N/A" or 0 instead of NULL).
- **Cleaner queries:** Avoid long chains of `CASE WHEN x IS NULL THEN y ELSE x END` by expressing the same logic in one function call.
- **Aggregations:** SUM, AVG, etc. ignore NULLs; COALESCE lets you treat NULL as a specific value before aggregating (e.g. treat NULL as 0 in a sum).

### Examples

**Default for display:**

```sql
SELECT
  name,
  COALESCE(phone, 'No phone') AS phone_display
FROM contacts;
```

**Default for calculation (e.g. treat NULL as 0):**

```sql
SELECT
  order_id,
  COALESCE(quantity, 0) * unit_price AS line_total
FROM order_lines;
```

**Multiple fallbacks (first non-NULL wins):**

```sql
SELECT
  COALESCE(middle_name, nickname, first_name) AS display_name
FROM users;
```

**In aggregations:**

```sql
SELECT
  department_id,
  SUM(COALESCE(bonus, 0)) AS total_bonus
FROM employees
GROUP BY department_id;
```

**Partial update (PATCH):** Only change columns that are provided; keep existing values when the incoming value is NULL. Used in this project’s pages API (`app/api/pages/[id]/route.ts`):

```sql
UPDATE pages SET
  title     = COALESCE($title,     title),
  slug      = COALESCE($slug,      slug),
  content   = COALESCE($content,   content),
  tags      = COALESCE($tags,      tags),
  published = COALESCE($published, published)
WHERE id = $id
RETURNING *;
```

The client sends only the fields it wants to change (e.g. `{ "title": "New title" }`). For omitted fields, the parameter is NULL, so `COALESCE(param, column)` keeps the existing column value. That gives a single UPDATE that works for any subset of columns.

### When to use

- When you need a single, readable default for NULL in SELECT, WHERE, or expressions.
- When building reports or APIs where NULL should be represented as a specific value.
- When you want to normalize NULLs before joining or aggregating.
- For **partial updates (PATCH):** one UPDATE that only changes columns for which a non-NULL value is supplied, leaving the rest unchanged.

### When to be careful

- **Type consistency:** All arguments should be compatible types (e.g. don’t mix dates and strings unless your database allows and you intend it).
- **Performance:** COALESCE itself is cheap, but if arguments are expensive expressions they are still evaluated in order until one is non-NULL (in most databases). Put the cheapest or most likely non-NULL first when it matters.
- **Semantics:** Using `COALESCE(column, 0)` in a SUM changes the meaning (NULL becomes 0). Make sure that’s what you want; sometimes “no value” and “zero” are different.

### SQL standard and dialects

COALESCE is part of the SQL standard and is supported in PostgreSQL, MySQL, SQL Server, SQLite, and Oracle. Some databases also offer `IFNULL(a, b)` or `ISNULL(a, b)` for two arguments; COALESCE is more portable and works with any number of arguments.

---

## Your notes

Add more SQL patterns below. Suggested format:

### Pattern name

**Purpose:** One-line description.

**Example:** Short code snippet or query.

- When to use it.
- Caveats or alternatives.

---
