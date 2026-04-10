grant insert, update, delete on public.categories to authenticated;
grant insert, update, delete on public.routines to authenticated;
grant insert, update, delete on public.exercises to authenticated;
grant insert, update, delete on public.routine_exercises to authenticated;

drop policy if exists "admin manage categories" on public.categories;
create policy "admin manage categories"
on public.categories
for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin manage routines" on public.routines;
create policy "admin manage routines"
on public.routines
for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin manage exercises" on public.exercises;
create policy "admin manage exercises"
on public.exercises
for all
to authenticated
using (true)
with check (true);

drop policy if exists "admin manage routine exercises" on public.routine_exercises;
create policy "admin manage routine exercises"
on public.routine_exercises
for all
to authenticated
using (true)
with check (true);