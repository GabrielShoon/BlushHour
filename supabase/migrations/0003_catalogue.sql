-- BlushHour catalogue: places and date ideas, managed by admins.
-- Anyone can read them. Only a verified admin email can change them.
-- Run 0001 and 0002 first, then this file, then 0004_seed.sql. Safe to run again.

-- Admins -------------------------------------------------------------------

create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- No policies, so the admin list stays private.

insert into public.admins (email) values ('gabrielshoonxd@gmail.com')
on conflict (email) do nothing;

-- True when the signed-in user is a verified admin.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admins a
    join auth.users u on lower(u.email) = lower(a.email)
    where u.id = auth.uid()
      and u.email_confirmed_at is not null
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Places -------------------------------------------------------------------

create table if not exists public.places (
  slug text primary key,
  name text not null,
  category text not null,
  area text not null,
  lat double precision,
  lng double precision,
  cost_per_person integer not null default 0 check (cost_per_person >= 0),
  duration_mins integer not null default 60 check (duration_mins > 0),
  blurb text not null default '',
  cuisine text,
  vibes text[] not null default '{}',
  time_of_day text not null default 'any',
  indoor boolean not null default true,
  branches text[],
  status text not null default 'open',
  source text not null default 'curator',
  unverified boolean not null default false,
  photo_url text,
  photo_width integer,
  photo_height integer,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Date ideas ---------------------------------------------------------------

create table if not exists public.date_ideas (
  slug text primary key,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  moods text[] not null default '{}',
  occasions text[] not null default '{}',
  start_time text not null default '18:00',
  -- e.g. [{ "slug": "place-slug", "durationMins": 90 }]
  stops jsonb not null default '[]'::jsonb,
  photo_url text,
  photo_width integer,
  photo_height integer,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

-- Access -------------------------------------------------------------------

alter table public.places enable row level security;
alter table public.date_ideas enable row level security;

grant select on public.places, public.date_ideas to anon, authenticated;
grant insert, update, delete on public.places, public.date_ideas to authenticated;

drop policy if exists "Anyone can read places" on public.places;
create policy "Anyone can read places" on public.places for select using (true);
drop policy if exists "Admins add places" on public.places;
create policy "Admins add places" on public.places for insert with check (public.is_admin());
drop policy if exists "Admins edit places" on public.places;
create policy "Admins edit places" on public.places for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins remove places" on public.places;
create policy "Admins remove places" on public.places for delete using (public.is_admin());

drop policy if exists "Anyone can read date ideas" on public.date_ideas;
create policy "Anyone can read date ideas" on public.date_ideas for select using (true);
drop policy if exists "Admins add date ideas" on public.date_ideas;
create policy "Admins add date ideas" on public.date_ideas for insert with check (public.is_admin());
drop policy if exists "Admins edit date ideas" on public.date_ideas;
create policy "Admins edit date ideas" on public.date_ideas for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "Admins remove date ideas" on public.date_ideas;
create policy "Admins remove date ideas" on public.date_ideas for delete using (public.is_admin());

-- Photo uploads --------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('catalogue', 'catalogue', true)
on conflict (id) do nothing;

drop policy if exists "Admins upload catalogue photos" on storage.objects;
create policy "Admins upload catalogue photos" on storage.objects
  for insert to authenticated with check (bucket_id = 'catalogue' and public.is_admin());
drop policy if exists "Admins replace catalogue photos" on storage.objects;
create policy "Admins replace catalogue photos" on storage.objects
  for update to authenticated using (bucket_id = 'catalogue' and public.is_admin());
drop policy if exists "Admins remove catalogue photos" on storage.objects;
create policy "Admins remove catalogue photos" on storage.objects
  for delete to authenticated using (bucket_id = 'catalogue' and public.is_admin());
