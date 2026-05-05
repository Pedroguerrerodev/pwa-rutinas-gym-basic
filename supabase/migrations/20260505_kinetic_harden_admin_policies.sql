revoke insert, update, delete on public.categories from authenticated;
revoke insert, update, delete on public.routines from authenticated;
revoke insert, update, delete on public.exercises from authenticated;
revoke insert, update, delete on public.routine_exercises from authenticated;

grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.routines to authenticated;
grant insert, update, delete on public.exercises to authenticated;
grant insert, update, delete on public.routine_exercises to authenticated;

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
