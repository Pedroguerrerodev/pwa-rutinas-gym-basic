create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    sort_order integer not null default 0,
    is_active boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.routines (
    id uuid primary key default gen_random_uuid(),
    category_id uuid not null references public.categories(id) on delete restrict,
    slug text not null unique,
    title text not null,
    subtitle text not null default '',
    goal text not null default '',
    duration_text text not null default '',
    level text not null default '',
    hero_gradient text not null default '',
    image_gradient text not null default '',
    is_published boolean not null default true,
    created_at timestamptz not null default now()
);

create table if not exists public.exercises (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    name text not null,
    default_metric text not null check (default_metric in ('weight', 'time', 'distance', 'calories')),
    instructions text not null default '',
    created_at timestamptz not null default now()
);

create table if not exists public.routine_exercises (
    id uuid primary key default gen_random_uuid(),
    routine_id uuid not null references public.routines(id) on delete cascade,
    exercise_id uuid not null references public.exercises(id) on delete restrict,
    sort_order integer not null,
    sets integer not null check (sets > 0),
    target text not null default '',
    metric text not null check (metric in ('weight', 'time', 'distance', 'calories')),
    notes text not null default '',
    created_at timestamptz not null default now(),
    unique (routine_id, sort_order)
);

create index if not exists routines_category_id_idx on public.routines(category_id);
create index if not exists routines_is_published_idx on public.routines(is_published);
create index if not exists routine_exercises_routine_id_idx on public.routine_exercises(routine_id);
create index if not exists routine_exercises_exercise_id_idx on public.routine_exercises(exercise_id);
create index if not exists categories_sort_order_idx on public.categories(sort_order);

alter table public.categories enable row level security;
alter table public.routines enable row level security;
alter table public.exercises enable row level security;
alter table public.routine_exercises enable row level security;

drop policy if exists "public read active categories" on public.categories;
create policy "public read active categories"
on public.categories
for select
to anon, authenticated
using (is_active);

drop policy if exists "public read published routines" on public.routines;
create policy "public read published routines"
on public.routines
for select
to anon, authenticated
using (is_published);

drop policy if exists "public read exercises" on public.exercises;
create policy "public read exercises"
on public.exercises
for select
to anon, authenticated
using (true);

drop policy if exists "public read routine exercises" on public.routine_exercises;
create policy "public read routine exercises"
on public.routine_exercises
for select
to anon, authenticated
using (
    exists (
        select 1
        from public.routines
        where public.routines.id = routine_exercises.routine_id
          and public.routines.is_published = true
    )
);

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.routines, public.exercises, public.routine_exercises to anon, authenticated;

insert into public.categories (slug, name, sort_order)
values
    ('fuerza', 'Fuerza', 1),
    ('hipertrofia', 'Hipertrofia', 2),
    ('perdida-peso', 'Pérdida de peso', 3),
    ('funcional', 'Funcional', 4),
    ('hyrox', 'Hyrox', 5),
    ('cardio', 'Cardio', 6),
    ('core', 'Core', 7)
on conflict (slug) do update
set
    name = excluded.name,
    sort_order = excluded.sort_order,
    is_active = true;

insert into public.exercises (slug, name, default_metric, instructions)
values
    ('back-squat', 'Back Squat', 'weight', 'Controla la bajada y mantén la espalda firme.'),
    ('bench-press', 'Bench Press', 'weight', 'Pies firmes y pausa corta al tocar el pecho.'),
    ('air-bike-finisher', 'Air Bike Finisher', 'time', 'Esfuerzo alto, recupera respiración en la bajada.'),
    ('run-block', 'Run Block', 'distance', 'Ritmo constante, última vuelta más agresiva.'),
    ('sled-push', 'Sled Push', 'distance', 'Tronco inclinado y zancada corta.'),
    ('ski-erg', 'Ski Erg', 'calories', 'Usa cadera y lat al tirar, no solo brazos.'),
    ('rower-sprint', 'Rower Sprint', 'time', 'Intensidad alta, técnica limpia en el tirón.'),
    ('walking-lunges', 'Walking Lunges', 'weight', 'Puedes hacerlas con peso o al cuerpo.'),
    ('plank-hold', 'Plank Hold', 'time', 'Costillas abajo y glúteos activos.'),
    ('bear-crawl', 'Bear Crawl', 'distance', 'Mantén rodillas bajas y core apretado.'),
    ('sandbag-clean', 'Sandbag Clean', 'weight', 'Abraza la carga y extiende con potencia.'),
    ('dead-bug', 'Dead Bug', 'weight', 'Controla pelvis y espalda baja contra el suelo.')
on conflict (slug) do update
set
    name = excluded.name,
    default_metric = excluded.default_metric,
    instructions = excluded.instructions;

insert into public.routines (
    category_id,
    slug,
    title,
    subtitle,
    goal,
    duration_text,
    level,
    hero_gradient,
    image_gradient,
    is_published
)
values
    (
        (select id from public.categories where slug = 'fuerza'),
        'onyx-power-foundation',
        'Onyx Power Foundation',
        'Acceso inmediato · 45 min · avanzado',
        'Fuerza base',
        '45 min',
        'Avanzado',
        'linear-gradient(150deg, rgba(9, 24, 21, 0.55), rgba(0, 0, 0, 0.92)), radial-gradient(circle at top, rgba(255, 211, 28, 0.18), transparent 26%)',
        'linear-gradient(180deg, rgba(16, 40, 36, 0.6), rgba(0, 0, 0, 0.1))',
        true
    ),
    (
        (select id from public.categories where slug = 'hyrox'),
        'explosive-hyrox-engine',
        'Explosive Hyrox Engine',
        'Carrera + estaciones · 52 min',
        'Resistencia híbrida',
        '52 min',
        'Intermedio',
        'linear-gradient(160deg, rgba(67, 44, 3, 0.4), rgba(0, 0, 0, 0.92)), radial-gradient(circle at left, rgba(255, 211, 28, 0.22), transparent 24%)',
        'linear-gradient(180deg, rgba(66, 44, 10, 0.58), rgba(0, 0, 0, 0.08))',
        true
    ),
    (
        (select id from public.categories where slug = 'perdida-peso'),
        'metabolic-rush',
        'Metabolic Rush',
        'Circuito HIIT · sin pausas largas',
        'Condicionamiento',
        '30 min',
        'Principiante',
        'linear-gradient(155deg, rgba(45, 11, 11, 0.42), rgba(0, 0, 0, 0.92)), radial-gradient(circle at top right, rgba(255, 211, 28, 0.18), transparent 28%)',
        'linear-gradient(180deg, rgba(48, 14, 14, 0.6), rgba(0, 0, 0, 0.12))',
        true
    ),
    (
        (select id from public.categories where slug = 'funcional'),
        'mobility-core-flow',
        'Mobility Core Flow',
        'Bloque funcional para mover mejor',
        'Movilidad y control',
        '40 min',
        'Todos',
        'linear-gradient(150deg, rgba(11, 37, 50, 0.48), rgba(0, 0, 0, 0.9)), radial-gradient(circle at top left, rgba(255, 211, 28, 0.15), transparent 22%)',
        'linear-gradient(180deg, rgba(11, 43, 58, 0.58), rgba(0, 0, 0, 0.08))',
        true
    )
on conflict (slug) do update
set
    category_id = excluded.category_id,
    title = excluded.title,
    subtitle = excluded.subtitle,
    goal = excluded.goal,
    duration_text = excluded.duration_text,
    level = excluded.level,
    hero_gradient = excluded.hero_gradient,
    image_gradient = excluded.image_gradient,
    is_published = excluded.is_published;

insert into public.routine_exercises (routine_id, exercise_id, sort_order, sets, target, metric, notes)
values
    ((select id from public.routines where slug = 'onyx-power-foundation'), (select id from public.exercises where slug = 'back-squat'), 1, 4, '6 reps', 'weight', 'Controla la bajada y mantén la espalda firme.'),
    ((select id from public.routines where slug = 'onyx-power-foundation'), (select id from public.exercises where slug = 'bench-press'), 2, 4, '8 reps', 'weight', 'Pies firmes y pausa corta al tocar el pecho.'),
    ((select id from public.routines where slug = 'onyx-power-foundation'), (select id from public.exercises where slug = 'air-bike-finisher'), 3, 3, '45 seg', 'time', 'Esfuerzo alto, recupera respiración en la bajada.'),
    ((select id from public.routines where slug = 'explosive-hyrox-engine'), (select id from public.exercises where slug = 'run-block'), 1, 4, '800 m', 'distance', 'Ritmo constante, última vuelta más agresiva.'),
    ((select id from public.routines where slug = 'explosive-hyrox-engine'), (select id from public.exercises where slug = 'sled-push'), 2, 4, '20 m', 'distance', 'Tronco inclinado y zancada corta.'),
    ((select id from public.routines where slug = 'explosive-hyrox-engine'), (select id from public.exercises where slug = 'ski-erg'), 3, 3, '60 cal', 'calories', 'Usa cadera y lat al tirar, no solo brazos.'),
    ((select id from public.routines where slug = 'metabolic-rush'), (select id from public.exercises where slug = 'rower-sprint'), 1, 5, '30 seg', 'time', 'Intensidad alta, técnica limpia en el tirón.'),
    ((select id from public.routines where slug = 'metabolic-rush'), (select id from public.exercises where slug = 'walking-lunges'), 2, 4, '16 reps', 'weight', 'Puedes hacerlas con peso o al cuerpo.'),
    ((select id from public.routines where slug = 'metabolic-rush'), (select id from public.exercises where slug = 'plank-hold'), 3, 3, '50 seg', 'time', 'Costillas abajo y glúteos activos.'),
    ((select id from public.routines where slug = 'mobility-core-flow'), (select id from public.exercises where slug = 'bear-crawl'), 1, 4, '20 m', 'distance', 'Mantén rodillas bajas y core apretado.'),
    ((select id from public.routines where slug = 'mobility-core-flow'), (select id from public.exercises where slug = 'sandbag-clean'), 2, 5, '5 reps', 'weight', 'Abraza la carga y extiende con potencia.'),
    ((select id from public.routines where slug = 'mobility-core-flow'), (select id from public.exercises where slug = 'dead-bug'), 3, 3, '12 reps', 'weight', 'Controla pelvis y espalda baja contra el suelo.')
on conflict (routine_id, sort_order) do update
set
    exercise_id = excluded.exercise_id,
    sets = excluded.sets,
    target = excluded.target,
    metric = excluded.metric,
    notes = excluded.notes;