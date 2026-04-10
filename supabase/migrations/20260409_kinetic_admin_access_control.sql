create table if not exists public.admin_users (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text not null default '',
    created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

grant select, insert on public.admin_users to authenticated;

drop policy if exists "admins read own membership" on public.admin_users;
create policy "admins read own membership"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "bootstrap first admin" on public.admin_users;
create policy "bootstrap first admin"
on public.admin_users
for insert
to authenticated
with check (
    user_id = auth.uid()
    and email = auth.email()
    and not exists (select 1 from public.admin_users)
);

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories"
on public.categories
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin manage routines" on public.routines;
create policy "admin manage routines"
on public.routines
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin manage exercises" on public.exercises;
create policy "admin manage exercises"
on public.exercises
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));

drop policy if exists "admin manage routine exercises" on public.routine_exercises;
create policy "admin manage routine exercises"
on public.routine_exercises
for all
to authenticated
using (exists (select 1 from public.admin_users where user_id = auth.uid()))
with check (exists (select 1 from public.admin_users where user_id = auth.uid()));