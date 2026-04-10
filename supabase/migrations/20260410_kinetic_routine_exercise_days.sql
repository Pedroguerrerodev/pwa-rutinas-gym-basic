alter table public.routine_exercises
add column if not exists day_number integer;

update public.routine_exercises
set day_number = 1
where day_number is null;

alter table public.routine_exercises
alter column day_number set default 1;

alter table public.routine_exercises
alter column day_number set not null;

create index if not exists routine_exercises_routine_day_sort_idx
on public.routine_exercises (routine_id, day_number, sort_order);

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'routine_exercises_day_number_check'
    ) then
        alter table public.routine_exercises
        add constraint routine_exercises_day_number_check
        check (day_number between 1 and 7);
    end if;
end
$$;