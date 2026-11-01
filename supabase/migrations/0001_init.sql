-- BlushHour: saved favourites and date plans per user.
-- Run in Supabase dashboard -> SQL Editor, or with `supabase db push`.

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  place_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, place_slug)
);

create table if not exists public.date_plans (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Our date',
  date date,
  start_time text not null default '18:00',
  people int not null default 2 check (people between 1 and 20),
  stops jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists date_plans_user_idx on public.date_plans (user_id, updated_at desc);

alter table public.favorites enable row level security;
alter table public.date_plans enable row level security;

create policy "Own favourites: read" on public.favorites
  for select using (auth.uid() = user_id);
create policy "Own favourites: insert" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "Own favourites: delete" on public.favorites
  for delete using (auth.uid() = user_id);

create policy "Own plans: read" on public.date_plans
  for select using (auth.uid() = user_id);
create policy "Own plans: insert" on public.date_plans
  for insert with check (auth.uid() = user_id);
create policy "Own plans: update" on public.date_plans
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Own plans: delete" on public.date_plans
  for delete using (auth.uid() = user_id);
