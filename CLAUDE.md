# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

A people/records management app built on Next.js 16 (App Router). Two roles:

- **USER** — can create records and can only view/edit/delete the records they created themselves.
- **ADMIN** — can view all records (with a "created by" column) and manage users (`/admin/users`).

The record entity (`PersonRecord`) currently has: `cardId`, `name`, `address`, `dob`, `registeredAt`. There is no self-signup — an ADMIN creates accounts from `/admin/users`; the very first admin comes from the seed script.

## Commands

```bash
npm run dev          # start dev server (Turbopack)
npm run build         # production build
npm run lint          # ESLint

npm run db:push       # sync prisma/schema.prisma to the database (no migration history — see below)
npm run db:seed       # create the first admin user from SEED_ADMIN_USERNAME/SEED_ADMIN_PASSWORD in .env
npm run db:studio     # Prisma Studio GUI
npx prisma generate   # regenerate the Prisma client after editing schema.prisma
```

There is no test suite yet.

## Environment

Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `AUTH_SECRET` (`openssl rand -base64 32`). `.env` is gitignored — never commit real credentials.

## Database: isolated schema, not `public`

The project was originally pointed at a shared Postgres instance whose `public` schema already held unrelated tables/data from other projects (`prisma db push`/`migrate dev` tried to drop them — caught before that happened). `DATABASE_URL` has since moved to its own dedicated database, but the isolated-schema setup was kept regardless, since it costs nothing and is the safer default if `DATABASE_URL` ever points at a shared instance again:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["people_management"]
}
```

Every model has `@@schema("people_management")`. **Do not remove the `schemas` array or the per-model `@@schema` attributes**, and do not run `prisma migrate reset` / `prisma db push --accept-data-loss` against this database — either can drop tables this project does not own. There is no migration history (`prisma/migrations`) by design; `db:push` is the only schema-sync command in use.

## Prisma is pinned to v6, not v7

`prisma` and `@prisma/client` are pinned to `6.19.3` (classic `prisma-client-js` generator, default output to `node_modules/@prisma/client`, `datasource { url = env(...) }`). Prisma 7 removes the `url` field from the datasource block and requires a driver adapter (`@prisma/adapter-pg`) passed to the `PrismaClient` constructor — a bigger architectural change than this app needs. Don't upgrade past v6 without deliberately migrating to the adapter model across `src/lib/prisma.ts` and `prisma/schema.prisma`.

## Next.js 16 specifics (this is not the Next.js in most training data)

Read `node_modules/next/dist/docs/` for anything unfamiliar before assuming API knowledge — this major version renamed/changed several conventions:

- **`src/proxy.ts`** replaces `middleware.ts` (the file convention was renamed). It does the *optimistic* auth check (reads the JWT cookie, redirects unauthenticated requests to `/login` and authenticated requests away from `/login`).
- Dynamic `params`/`searchParams` are `Promise`s and must be `await`ed (see `records/[id]/edit/page.tsx`).
- `cacheComponents` is **not** enabled in `next.config.ts`. That's deliberate — this is a straightforward per-request CRUD app, and enabling Cache Components would require wrapping runtime-data reads in `<Suspense>` / `"use cache"` throughout. If you enable it later, re-read `01-app/01-getting-started/08-caching.md` first.
- Server Actions (`"use server"`) are the only mutation path — there is no separate REST API beyond NextAuth's own route handler.

## Authorization model — the actual security boundary

`src/proxy.ts` is only a cookie-presence check (optimistic, first line of defense). **The real authorization happens in `src/lib/dal.ts` (`requireUser`/`requireAdmin`) and inside every Server Action**, per the Next.js data-security guidance: never trust that a page simply not rendering a button is enough, since Server Actions are POST-reachable directly.

Pattern used everywhere a record is mutated (see `src/app/(app)/records/actions.ts`):
1. `requireUser()` — must be logged in.
2. Re-fetch the record from the DB by id (never trust a client-supplied row).
3. If `user.role !== "ADMIN"`, the record's `createdById` must equal `user.id`, else reject.

The list query in `records/page.tsx` scopes by `createdById` for non-admins and fetches everything for admins — but that query-level scoping is a UX convenience, not the security check; the action-level ownership check above is what actually prevents a user from editing another user's record by guessing its id.

## Structure

- `src/auth.ts` — NextAuth (Auth.js v5) config: Credentials provider (username + bcrypt), JWT session strategy, `role` propagated into the JWT/session, `trustHost: true` (required for self-hosting on an arbitrary port — without it Auth.js rejects requests with `UntrustedHost`).
- `src/lib/dal.ts` — `requireUser()` / `requireAdmin()`, the authorization boundary described above. Both redirect via `@/i18n/navigation`'s locale-aware `redirect()`, resolving the current locale with `getLocale()` first.
- `src/lib/prisma.ts` — Prisma client singleton (dev-mode global caching to survive HMR).
- `src/lib/validations.ts` — Zod schemas as **factory functions** (`buildPersonRecordSchema(t)`, `buildCreateUserSchema(t)`) that take a translator so validation messages come out in the request's locale; called from the corresponding Server Action with the `t` it already has from `getTranslations(...)`.
- `src/app/[locale]/(app)/` — authenticated route group; its `layout.tsx` calls `requireUser()` and renders `Nav`.
  - `records/` — list (with pagination), `new/`, `[id]/edit/`, plus co-located `actions.ts` (create/update/delete) and `record-form.tsx` (shared client form used by both new/edit via `useActionState`).
  - `admin/users/` — ADMIN-only user creation/listing (`requireAdmin()`), co-located `actions.ts`.
- `src/app/[locale]/login/` — public login page + `actions.ts` calling `signIn("credentials", …)`.
- `src/app/api/auth/[...nextauth]/route.ts` — NextAuth's route handler, deliberately **outside** `[locale]` (it's an API endpoint, not a localized page; the proxy matcher already excludes `/api`).
- `prisma/schema.prisma` — `User` (role: `ADMIN`/`USER`) and `PersonRecord` (`createdBy` relation, indexed on `(createdById, createdAt)` and `createdAt` for pagination at scale).
- `prisma/seed.mts` — creates the first admin; run with `npm run db:seed`. It's `.mts` (not `.ts`) so `tsx` runs it as ESM — the classic Prisma client import doesn't resolve correctly under `tsx`'s CJS mode otherwise.

## i18n (English + Khmer) via next-intl

Routes are locale-prefixed (`/en/records`, `/km/records`) using next-intl's App Router routing integration:

- `src/i18n/routing.ts` — `defineRouting({ locales: ["en", "km"], defaultLocale: "en" })`.
- `src/i18n/navigation.ts` — locale-aware `Link`/`redirect`/`usePathname`/`useRouter` wrappers (`createNavigation`). **Use these, not `next/link` / `next/navigation`, everywhere in the app** — the plain Next.js versions won't carry the locale prefix.
- `src/i18n/request.ts` — `getRequestConfig` using the classic `requestLocale` (awaited) pattern, not the newer Next 16.3 `next/root-params` auto-detection shown in next-intl's latest docs. That newer pattern is unnecessary complexity here since every route under `(app)` is dynamic anyway (session-gated); only `/login` and the `/` redirect page are statically generated.
- `src/proxy.ts` — combines the auth check with `next-intl/middleware`'s `createMiddleware(routing)`: it computes the pathname *without* the locale prefix to decide public-vs-protected, builds any auth redirect with the detected locale (`/${locale}/login`), and otherwise delegates to the intl middleware for locale negotiation/redirects.
- `messages/en.json` / `messages/km.json` — flat namespaced catalogs (`Nav`, `Login`, `Records`, `Pagination`, `Users`). Server Components use `getTranslations(namespace)` (from `next-intl/server`); Client Components use `useTranslations(namespace)` (from `next-intl`, via `NextIntlClientProvider` set up in `src/app/[locale]/layout.tsx`).

**Gotcha that already bit us once:** for any Server Component that is statically generated (has `generateStaticParams` upstream, e.g. `/login`), you must call `setRequestLocale(locale)` in **that specific page**, not just in the root `[locale]/layout.tsx` — next-intl's docs are explicit that Next.js can render layouts and pages in isolation during static generation, so locale doesn't automatically propagate from a parent layout's call. Skipping this caused `/km/login` to silently render English. Routes under `(app)` are all dynamic (they read the session), so this doesn't apply there, but keep it in mind for any new static page.

Mutating Server Actions must build locale-aware paths manually for anything NextAuth or `revalidatePath` touches directly (they don't go through `@/i18n/navigation`): `getLocale()` first, then e.g. `signIn(..., { redirectTo: `/${locale}/records` })` or `revalidatePath(`/${locale}/records`)`.

## Pagination

`records/page.tsx` reads `page`/`pageSize` from `searchParams` (a `Promise` — must `await`), clamps `pageSize` to one of `PAGE_SIZE_OPTIONS` (`records/records-pagination.tsx`), and runs a `count()` + `findMany({ skip, take })` scoped by the same `where` used for role-based visibility. The controls (showing X–Y of Z, rows-per-page, prev/next) render inside a `<TableFooter>` row in `records-table.tsx` (`colSpan` matches the visible column count) as plain links — no client JS needed, so it works with JS disabled. Add a search/filter later by extending the same `searchParams`-driven pattern rather than introducing client-side state.

## Data export (destructive — read before touching)

The "Export data" button (`records/export-button.tsx`, action in `records/actions.ts`'s `exportRecords`) exports every record in the current user's scope (all records for ADMIN, only their own for USER) as a CSV — not just the current page. The confirmation dialog then gives the user a choice: **keep** the records, or **delete all of them from the database** right after the export completes. The delete uses the exact same `where` scope as the export query (`deleteMany`), so a USER can only ever bulk-delete their own records this way, never another user's. If you touch this action, keep the export query, the CSV columns, and the delete's `where` clause using the *same* scope — a mismatch between what's exported and what's deleted would silently lose data. `src/lib/csv.ts`'s `toCsv` handles RFC 4180 escaping and prepends a UTF-8 BOM (required for Excel to render Khmer text correctly).

## Working in this repo: don't rebuild while a server is running

`npm run build` overwrites `.next` in place. If a `next start` process (e.g. on port 5000) is already running against this same directory, overwriting `.next` out from under it breaks that live process — it keeps serving stale HTML that references CSS/JS chunk hashes and route manifests that no longer exist on disk (symptom: pages that 404, or pages that load with no styling at all). This has already happened twice in this project. Before running a verification build, check `netstat`/process list for anything already serving from this directory; if found, either ask before rebuilding, or verify by starting a **second** instance on a different port against the *same already-built* `.next` (fine — reading `.next` concurrently is safe, only overwriting it while something else reads it is the problem).

## UI

Tailwind v4 + shadcn/ui, but the installed shadcn registry style (`base-nova`) is built on **`@base-ui/react`**, not Radix. Notably `Button` has no `asChild` prop — for a link that should look like a button, import `buttonVariants` from `@/components/ui/button` and apply it directly to a `Link`'s `className` instead of wrapping `Button` around the link (see `records/records-table.tsx`). Use the `Link` from `@/i18n/navigation`, not `next/link`, so locale prefixes are preserved.
