# AI Agent Onboarding

## Language used
- japanese

## Project snapshot
- Next.js 15 App Router with RSC; route files live in `src/app`, and client components opt in via `'use client'`.
- State and models are typed in TypeScript; shared shapes sit in `src/types/index.ts`.
- Content comes from microCMS through `src/lib/microcms.ts`, then flows through `src/lib/adapters.ts` and `src/lib/api.ts` before reaching components.
- `src/components` holds page-level composites and shadcn-based UI primitives in `src/components/ui/*`.

## Environment & configuration
- `src/lib/env.ts` currently validates only `MICROCMS_SERVICE_DOMAIN` and `MICROCMS_API_KEY`; add new variables there before reading them.
- `.env.example` lists the required keys; design docs mention extra secrets, but they are not wired up yet—verify before assuming they exist.
- Remote images are whitelisted via `next.config.ts` `images.remotePatterns`; keep new assets under those domains or extend the list deliberately.

## Styling & theming
- Tailwind CSS v4 is configured entirely in `src/app/globals.css` using `@import "tailwindcss"` and `@theme`; there is no `tailwind.config.js`.
- Layout fonts use `next/font` (`Inter`, `Noto_Sans_JP`) in `src/app/layout.tsx`; reuse the existing CSS variables `--font-sans` and `--font-ui`.
- Light/dark mode is handled by `ThemeProvider` (`src/components/theme-provider.tsx`) and the `ModeToggle` dropdown; honor CSS tokens instead of hard-coding colors.
- Prefer shadcn primitives (`src/components/ui`) plus the `cn` helper for styling; they already include focus rings and aria defaults.

## Data & rendering conventions
- `getBlogPosts` in `src/lib/api.ts` returns `{ contents, totalCount, offset, limit }` and powers `BlogPostsList`; keep that contract when extending APIs.
- Tag filters build microCMS strings like `tags[contains]${tagId}`; always use tag IDs when linking to `/blog?tag=...`.
- Blog cards link to `/blog/${post.id}` because detail pages resolve posts by microCMS ID (`src/app/blog/[id]/page.tsx`); preserve IDs even if you add slugs elsewhere.
- `PrevNextPosts` (`src/components/prev-next-posts.tsx`) derives neighbors by pulling the first 100 posts; adjust it if you change sort order or pagination size.
- Async UI is wrapped in Suspense fallbacks; favor server components that fit this pattern instead of introducing client-only loaders.
- `adaptBlog` (`src/lib/adapters.ts`) assumes `custom_body` contains `related_blogs`; sync that mapping whenever the CMS schema evolves.

## Media handling
- Use `FallbackImage` (`src/components/fallback-image.tsx`) for remote imagery so failures gracefully swap to `/placeholder.svg`.
- Above-the-fold images (home hero, blog cover) mark LCP assets with `priority` and explicit `sizes`; follow that pattern for new hero sections.

## Pages & routing notes
- Next 15 passes `params` and `searchParams` as `Promise`; resolve them with `await` like in `src/app/blog/page.tsx` and `src/app/blog/[id]/page.tsx`.
- The contact page (`src/app/contact/page.tsx`) still simulates submissions client-side; add route handlers under `src/app/contact` before hooking up real APIs.
- Accessibility helpers—skip link, focus styles, reduced-motion rules—are centralized in `src/app/layout.tsx` and `globals.css`; keep them intact when adjusting layout.

## Local workflows
- Standard flow: `bun install`, `bun dev` for local, `bun run build` for verification, plus `bun run lint` / `bun run typecheck` before committing.
- `bun test` exists but no suites ship yet; write Bun-compatible tests under `tests/**` if you add coverage.
- Playwright is available via `bunx playwright test`; run `bunx playwright install --with-deps` after installing dependencies.
- Formatting uses `.prettierrc` with `prettier-plugin-organize-imports`; ensure the plugin stays installed or remove it before running `bun run format`.

## Cross-checks with docs
- `docs/design.md` and `docs/requirements.md` outline future enhancements (native fetch, ISR, CSP, contact API); confirm actual code paths before following those blueprints.
