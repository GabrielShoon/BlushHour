-- BlushHour: let signed-in users reach their own rows.
-- Newer Supabase projects don't grant table access to the API roles by default,
-- so saving failed with "permission denied" (42501). Row-level security from
-- 0001_init.sql still limits each user to their own favourites and plans.
-- Run in Supabase dashboard -> SQL Editor.

grant usage on schema public to authenticated;

grant select, insert, update, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.date_plans to authenticated;
