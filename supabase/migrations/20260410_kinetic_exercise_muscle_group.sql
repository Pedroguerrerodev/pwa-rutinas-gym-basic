alter table public.exercises
add column if not exists muscle_group text;

update public.exercises
set muscle_group = case
    when slug in (
        'back-squat',
        'walking-lunges',
        'hip-thrust-con-barra',
        'sentadilla-libre',
        'prensa-inclinada',
        'zancadas-caminando-con-mancuernas',
        'extension-de-cuadriceps',
        'abductor-en-maquina',
        'peso-muerto-rumano',
        'hip-thrust',
        'curl-femoral-tumbado',
        'patada-gluteo',
        'abductores-en-maquina',
        'gemelos-en-maquina',
        'sentadilla-goblet-o-hack-squad',
        'peso-muerto-sumo',
        'step-ups',
        'abductor'
    ) then 'Pierna'
    when slug in (
        'bench-press'
    ) then 'Pecho'
    when slug in (
        'jalon-al-pecho',
        'remo-con-barra',
        'remo-una-mano'
    ) then 'Espalda'
    when slug in (
        'curl-biceps-barra-z',
        'curl-inclinado-mancuernas'
    ) then 'Biceps'
    when slug in (
        'extension-de-triceps',
        'press-frances-con-mancuernas'
    ) then 'Triceps'
    when slug in (
        'press-militar-con-mancuernas',
        'elevaciones-laterales',
        'elevaciones-laterales-en-polea',
        'deltoides',
        'elevaciones-frontales',
        'face-pull'
    ) then 'Hombro'
    when slug in (
        'air-bike-finisher',
        'run-block',
        'sled-push',
        'ski-erg',
        'rower-sprint',
        'bicicleta-estatica'
    ) then 'Cardio'
    when slug in (
        'plancha-abdominal',
        'elevaciones-de-piernas',
        'dead-bug'
    ) then 'Abdomen'
    else 'Flexibilidad'
end
where muscle_group is null;

update public.exercises
set muscle_group = 'Flexibilidad'
where muscle_group is null;

alter table public.exercises
alter column muscle_group set default 'Flexibilidad';

alter table public.exercises
drop constraint if exists exercises_muscle_group_check;

alter table public.exercises
add constraint exercises_muscle_group_check
check (muscle_group in ('Pierna', 'Pecho', 'Espalda', 'Biceps', 'Triceps', 'Hombro', 'Cardio', 'Abdomen', 'Flexibilidad'));

alter table public.exercises
alter column muscle_group set not null;