# MCTC Portal

Full-stack web portal for managing athlete rosters for the **Midwest Collegiate Taekwondo Championship (MCTC)** — held twice each year (Spring and Fall).

## Tech stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js (App Router) |
| Auth | **Supabase Auth only** (no Supabase database) |
| Database | Neon Postgres |
| ORM | Drizzle |
| Validation | Zod on all API routes |
| Hosting | Vercel |
| UI | shadcn/ui **new-york** style (v4 / Tailwind v4 registry) |
| Font | Geist via `next/font` — semibold headings, regular body |

## Development setup

**Read [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) before you start.**

- Use **your own** Neon, Supabase, and Vercel accounts during development.
- Run locally at `http://localhost:3000` or deploy to a **Vercel preview** URL.
- **Do not** connect the production domain `portal.mctctkd.com` until final client handover.

## Quick start

```bash
npm install
cp .env.example .env.local
# Fill in DATABASE_URL + Supabase keys (see below)
npm run db:push
npm run dev
```

### Neon (database)

1. Create a project at [neon.tech](https://neon.tech) on **your** account.
2. Set `DATABASE_URL` in `.env.local`.
3. Apply schema: `npm run db:push` (or run `drizzle/0000_init.sql` in the SQL editor).

### Supabase (auth only)

1. Create a project at [supabase.com](https://supabase.com) on **your** account.
2. Use **only** Authentication — do not enable or rely on the Supabase Postgres database.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
4. **Authentication → URL configuration:**
   - Site URL: `http://localhost:3000` (and your Vercel preview URL when deployed)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://*.vercel.app/auth/callback`
5. Enable the Email provider (optional email confirmation for local dev).
6. Configure branded auth emails and **info@mctctkd.com** as sender — see [docs/EMAIL_SETUP.md](docs/EMAIL_SETUP.md).

### Vercel (hosting)

1. Import the repo into **your** Vercel team.
2. Add the same environment variables as `.env.local`.
3. Use preview deployments for development; avoid attaching `portal.mctctkd.com` until handover.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (`localhost:3000`) |
| `npm run build` | Production build |
| `npm run db:push` | Push Drizzle schema to Neon |
| `npm run db:studio` | Drizzle Studio |

## UI components

shadcn/ui is configured with `style: "new-york"` in `components.json` (the **new-york-v4** registry on Tailwind v4). Add components with:

```bash
npx shadcn@latest add <component> --overwrite
```

Form `<select>` elements use `NativeSelect` (`src/components/ui/native-select.tsx`) so they work with native form posts while matching shadcn input styling.

## Project structure

```
src/
  app/
    (auth)/          # Login & signup
    (portal)/        # Dashboard, tournaments, athletes
    api/             # REST API (Zod-validated)
    auth/callback/   # Supabase session callback
  components/ui/     # shadcn/ui (new-york)
  lib/
    db/              # Drizzle + Neon
    supabase/        # Auth clients
    format.ts        # Date/age helpers
    validations.ts   # Zod schemas
docs/
  DEVELOPMENT.md     # Environment & handover rules
```

## License

Private / club use.
