# BlushHour

A Singapore date discovery and planning playground. Browse activities, food spots and hidden gems,
then mix them into a date that's yours, with timings, a route map and estimated costs.

> Don't simply give users a date. Give them the tools and inspiration to create one of their own.

## Stack

- **Next.js 15** (App Router, TypeScript) + **Tailwind CSS v4**
- **Supabase**: email/password auth, saved favourites and date plans (row-level security)
- **Leaflet + OpenStreetMap** (CARTO Voyager tiles), with no API key needed
- **dnd-kit** for drag-to-reorder (with keyboard and button alternatives)
- Deploys on **Vercel**

## Getting started

Requires **Node 22 LTS** (some Supabase packages need Node 22+).

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase URL + anon key
npm run dev
```

Open http://localhost:3000.

### Supabase setup

1. Create a project at supabase.com.
2. Copy **Project URL** and **anon public key** (Project Settings → API) into `.env.local`.
3. Open **SQL Editor** and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql),
   then [`0002_grants.sql`](supabase/migrations/0002_grants.sql), [`0003_catalogue.sql`](supabase/migrations/0003_catalogue.sql)
   and [`0004_seed.sql`](supabase/migrations/0004_seed.sql), in that order. They create the saved-dates
   tables, give signed-in users access, add the places / date ideas tables with admin-only editing and a
   photo bucket, then copy the built-in places and date ideas into the database.
4. Under **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback`
   (and your Vercel URL + `/auth/callback`) to the redirect URLs.

Without Supabase keys the app still works: favourites and plans are saved in the browser.
When someone signs in, anything saved on that device moves to their account.

### Admin

Sign in with an email listed in `public.admins` (set in `0003_catalogue.sql`; the email must be verified)
and an **Admin** link appears in the header. At `/admin` you can add, edit and delete places and date
ideas, upload photos and look up addresses. Web addresses, food vs activity, budget levels, filters,
maps and costs all update automatically. To add another admin, run
`insert into public.admins (email) values ('someone@example.com');` in the SQL Editor.

Until `0003`/`0004` are run, the site shows the built-in data from `src/data`.

### Deploying to Vercel

Import the GitHub repo in Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, and deploy.

## Project map

| Path | What it is |
| --- | --- |
| `src/data/places.ts` | The original catalogue (84 places) from `knowledge/Activities.docx` and `knowledge/Food.docx`; seeds the database and is the fallback |
| `src/lib/catalogue*.ts` | Loads places and date ideas from Supabase (cached, refreshed after admin changes) |
| `src/app/admin` | Admin dashboard and forms for places and date ideas |
| `src/data/suggested-dates.ts` | Curated date ideas that open in the builder |
| `src/data/collections.ts` | Themes (Golden hour, Rainy-day plans…) behind the home page mood tiles |
| `src/data/photos.ts` | Unsplash photo picks per category, landmark and date idea |
| `src/lib/itinerary.ts` | Scheduling, travel-time estimates, costs, nearby/alternative lookups |
| `src/components/app-state.tsx` | Client state: draft date, favourites, saved plans, auth, Supabase sync |
| `src/app/explore` | One page with Date ideas and Places tabs: search, type switch, a Refine panel with a budget slider, grid and map views |
| `src/app/places/[slug]` | Place details, map, nearby pairings |
| `src/app/dates/[slug]` | A date idea's timeline and route, plus "Remix this date" |
| `src/app/plan` | The builder: reorder, swap, durations, route map, cost summary, save |
| `src/app/saved`, `src/app/login` | Account, favourites, saved plans |

## Data notes

- Pins are placed at **neighbourhood level**, not exact addresses. Each place links to Google Maps for directions.
- **Opening hours** aren't shown; each place page links to Google Maps for hours and directions.
- **Costs** are researched per-person estimates (sources in `knowledge/price-research.md`); the admin form sets them for new places.
- Entries marked `unverified: true` had details guessed by BlushHour and need a check.
- **Photos** are the curator's own where available (uploaded through the admin), otherwise a free Unsplash photo for the category.
