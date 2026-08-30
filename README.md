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
4. Apply `supabase/migrations/20260831010000_pangaan_os_foundation.sql` and then `supabase/seed.sql`.
5. Create invited users in Supabase Auth. Assign roles through `profiles.role`; only Admin may administer roles after bootstrap.
6. Run `pnpm dev`.

Without Supabase environment variables, the app intentionally starts in read-only preview-data mode. This is only a visual and navigation fallback; mutations and authorization are never simulated client-side.

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

