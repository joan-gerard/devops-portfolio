This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The public homepage is at `app/(public)/page.tsx` and is composed of section components in `components/public/home/` (Hero, Recent Notes, Featured Projects, Roadmap, Tech Stack). Data is loaded via `lib/queries/home.ts`; types and constants live in `types/home.ts` and `lib/constants/home.ts`. If the data fetch fails, the page falls back to empty notes/projects (sections show “No notes/projects published yet”); uncaught errors in the segment are caught by `app/(public)/error.tsx`. The page auto-updates as you edit.

The public projects list is at `app/(public)/projects/page.tsx`. It uses `getAllPublishedProjects()` from `lib/queries/project.ts` and is composed of `components/public/projects/` (ProjectsPageHeader, ProjectsGrid, ProjectCard). Shared styles for the projects page live in `components/public/projects/projectStyles.ts`.

The public About page is at `app/(public)/about/page.tsx`. It fetches the `about` note via `getNoteBySlug("about")` from `lib/queries/page.ts` and delegates rendering (header + rich text content/fallback) to `components/public/about/AboutPageContent.tsx`. A dedicated redirect route at `app/(public)/notes/about/page.tsx` ensures `/notes/about` requests are redirected to `/about`.

The public note detail route is `app/(public)/notes/[slug]/page.tsx`. It is published-only (`includeUnpublished: false`) so anonymous traffic can be cached with ISR. Unpublished slugs return 404 on this public route. Draft previews are available on the authenticated admin route `app/(admin)/admin/notes/preview/[slug]/page.tsx`.

Notes content editing/rendering uses TipTap shared extensions (`lib/tipTapExtensions.ts`) for consistency between admin and public views. The editor supports code blocks (with language metadata), images, tables (insert row/column/header controls in the toolbar), and heading levels H2-H4 (the page title remains the single H1). A live table of contents is powered by `@tiptap/extension-table-of-contents`, and public note rendering applies syntax token colors, a small language badge on each code block, plus a right-side TOC that uses the same heading ID generation logic as the editor.

## Branding and Theme

Global theme tokens are defined in `app/globals.css` and should be used through semantic CSS variables (`var(--...)`) instead of hardcoded hex values.

- Background surfaces use near-black tokens (`--bg`, `--surface`, `--surface-2`).
- Primary text and headings use white (`--text`), with supporting text in grays (`--text-dim`, `--text-muted`).
- Accent color is `#E8FF00` (`--accent`) and is intentionally limited to small emphasis UI such as buttons, badges, and interactive highlights.
- Neutral/default and disabled states should prefer gray tokens over accent colors.

### Code style (Prettier)

Format all files:

```bash
npm run format
```

Check formatting without writing:

```bash
npm run format:check
```

A **pre-commit hook** (Husky + lint-staged) runs Prettier on staged files before each commit. After `pnpm install`, the hook is set up automatically via the `prepare` script.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# devops-portfolio

## Security

See [docs/security.md](docs/security.md) for security practices and review notes.

## Architecture and Operations

- 12-factor alignment review: [docs/12-factor-assessment.md](docs/12-factor-assessment.md)
