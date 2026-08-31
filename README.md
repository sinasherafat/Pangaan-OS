# Pangaan OS

Pangaan OS is Pangaan's deliberately minimal internal operating system for canonical knowledge, decisions, changes, versions, tasks, flows, contextual discussion, and search.

## Stack

- Next.js App Router + strict TypeScript
- Supabase Auth + Postgres + Row Level Security
- Mermaid (strict security mode)
- Geist
- Vitest
- Vercel Preview Deployments

## Local setup

1. Install Node.js 22+ and pnpm.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env.local` and supply the Supabase project URL and publishable key.
4. Apply the committed migrations in `supabase/migrations/` in filename order.
5. Create invited users in Supabase Auth, then assign roles through `profiles.role`; only Admin may administer roles after bootstrap.
6. Apply `supabase/seed.sql` so contextual demo comments can attach to the invited founder profile.
7. Run `pnpm dev`.

Supabase/Postgres is the only runtime source of truth. The app intentionally fails closed when its Supabase environment is unavailable; there is no bundled demo-data fallback.

## Database-backed runtime

All Overview, Handbook, Decisions, Change Log, Tasks, Flows, Search, Versions, contextual discussion, and Team reads use the authenticated Supabase SSR client under RLS. Search projections are maintained by database triggers, and Handbook revisions are appended transactionally before the page's current revision pointer changes.

Seed content exists only in `supabase/seed.sql` and committed data migrations. It is never imported by the application runtime.

## Pre-production security requirement

Supabase leaked-password protection is currently unavailable because the existing project is on the Free plan; Supabase documents this Auth control as a Pro-plan feature. Before Production, upgrade the Supabase organization to Pro or above, enable **Authentication → Password security → Leaked password protection**, and rerun the security advisor. Until then, generated high-entropy QA credentials must remain temporary and local-only.

## Required environment variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

Never expose a Supabase secret or service-role key to the browser.

## Quality gates

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

This repository must only be deployed as a Vercel Preview until the founder manually approves and merges the pull request.
