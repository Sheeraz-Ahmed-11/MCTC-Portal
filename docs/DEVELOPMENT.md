# Development setup

## Accounts and environments

During development, **every external service must run on the developer’s own accounts**:

| Service | Purpose | Do not use |
|---------|---------|------------|
| [Neon](https://neon.tech) | Postgres database | Client/production Neon project |
| [Supabase](https://supabase.com) | **Auth only** (no Supabase DB) | Client Supabase project or DB features |
| [Vercel](https://vercel.com) | Hosting & preview deploys | `portal.mctctkd.com` until handover |

### URLs

- **Local:** `http://localhost:3000`
- **Preview:** Vercel preview URL (e.g. `https://mctc-portal-*.vercel.app`)
- **Production domain:** `https://portal.mctctkd.com` — **do not connect** until final client handover

Configure Supabase redirect URLs for localhost and your Vercel preview domain only during development.

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js (App Router) |
| Auth | Supabase Auth only |
| Database | Neon Postgres |
| ORM | Drizzle |
| Validation | Zod on all API routes |
| Hosting | Vercel |
| UI | shadcn/ui **new-york** style (Tailwind v4 registry) |
| Font | Geist via `next/font` — semibold headings, regular body |

## UI (shadcn/ui)

This project uses the **new-york** style from the shadcn/ui v4 registry (the `new-york-v4` component set). Components live under `src/components/ui/`. Add or update via:

```bash
npx shadcn@latest add <component> --overwrite
```

Do not add custom UI primitives outside shadcn unless there is no registry equivalent.

## Quick start

```bash
cp .env.example .env.local
npm install
npm run db:push
npm run dev
```

See the root [README.md](../README.md) for Supabase and Neon configuration details.
