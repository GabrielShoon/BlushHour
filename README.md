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
3. Open **SQL Editor** and run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates the `favorites` and `date_plans` tables with row-level security.
4. Under **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback`
   (and your Vercel URL + `/auth/callback`) to the redirect URLs.

Without Supabase keys the app still works: favourites and plans are saved in the browser.
When someone signs in, anything saved on that device moves to their account.

### Deploying to Vercel

Import the GitHub repo in Vercel, add the two `NEXT_PUBLIC_SUPABASE_*` env vars, and deploy.

## Project map

| Path | What it is |
| --- | --- |
| `src/data/places.ts` | The catalogue (84 places) from `knowledge/Activities.docx` and `knowledge/Food.docx`, plus a few BlushHour additions |
| `src/data/suggested-dates.ts` | Curated date ideas that open in the builder |
| `src/data/collections.ts` | Themed shelves (Golden hour, Rainy-day plans…) used on Explore and the home page |
| `src/data/photos.ts` | Unsplash photo picks per category, landmark and date idea |
| `src/lib/itinerary.ts` | Scheduling, travel-time estimates, costs, nearby/alternative lookups |
| `src/components/app-state.tsx` | Client state: draft date, favourites, saved plans, auth, Supabase sync |
| `src/app/explore` | One page with Date ideas and Places tabs: curated shelves, search, a Refine panel, grid and map views |
| `src/app/places/[slug]` | Place details, map, nearby pairings |
| `src/app/dates/[slug]` | A date idea's timeline and route, plus "Remix this date" |
| `src/app/plan` | The builder: reorder, swap, durations, route map, cost summary, save |
| `src/app/saved`, `src/app/login` | Account, favourites, saved plans |

## Data notes

- Pins are placed at **neighbourhood level**, not exact addresses. Each place links to Google Maps for directions.
- **Opening hours** aren't filled in yet; the UI asks people to check with the venue.
- **Costs** are rough per-person estimates from the $–$$$$ levels (about $15 / $40 / $85 / $180).
- Entries marked `unverified: true` had details guessed by BlushHour and need a check.
- Photos are free Unsplash images chosen per category or landmark. Most show the mood, not the exact venue; swap in your own in `src/data/photos.ts`.
