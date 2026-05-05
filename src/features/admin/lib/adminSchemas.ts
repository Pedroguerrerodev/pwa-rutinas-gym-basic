import { z } from 'zod'

export const routineLevelOptions = ['Principiante', 'Intermedio', 'Avanzado'] as const
export const routineDayOptions = ['1 día', '2 días', '3 días', '4 días', '5 días', '6 días', '7 días'] as const
export const routineSetOptions = [1, 2, 3, 4, 5, 6] as const
export const muscleGroupOptions = [
    'Pierna',
    'Pecho',
    'Espalda',
    'Biceps',
    'Triceps',
    'Hombro',
    'Cardio',
    'Abdomen',
    'Flexibilidad',
] as const
export const exerciseMetricOptions = ['weight', 'time', 'distance', 'calories'] as const

type ValidationSuccess<T> = {
    success: true
    data: T
}

type ValidationFailure = {
    success: false
    error: string
}

type ValidationResult<T> = ValidationSuccess<T> | ValidationFailure

const categoryDraftSchema = z.object({
    name: z.string().trim().min(1, 'El nombre de la categoría es obligatorio.'),
    sort_order: z.number().int().min(0, 'El orden debe ser un número positivo.'),
    is_active: z.boolean(),
})

const exerciseDraftSchema = z.object({
    name: z.string().trim().min(1, 'El nombre del ejercicio es obligatorio.'),
    muscle_group: z.enum(muscleGroupOptions),
    default_metric: z.enum(exerciseMetricOptions),
    instructions: z.string(),
})

const routineDraftSchema = z.object({
    category_id: z.string().trim().min(1, 'Debes seleccionar una categoría.'),
    title: z.string().trim().min(1, 'El nombre de la rutina es obligatorio.'),
    subtitle: z.string(),
    goal: z.string(),
    duration_text: z.string(),
    level: z.enum(routineLevelOptions),
    hero_gradient: z.string().trim().min(1, 'Falta el gradiente principal de la rutina.'),
    image_gradient: z.string().trim().min(1, 'Falta el gradiente secundario de la rutina.'),
    is_published: z.boolean(),
})

const routineExerciseDraftSchema = z.object({
    routine_id: z.string().trim().min(1, 'La rutina asociada es obligatoria.'),
    exercise_id: z.string().trim().min(1, 'Debes seleccionar un ejercicio válido.'),
    day_number: z.number().int().min(1).max(7),
    sort_order: z.number().int().min(1),
    sets: z.number().int().min(1).max(6),
    target: z.string(),
    metric: z.enum(exerciseMetricOptions),
    notes: z.string(),
})

export function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

export function normalizeRoutineDays(value: string) {
    const normalizedValue = value.trim().toLowerCase()
    const directMatch = routineDayOptions.find((option) => option.toLowerCase() === normalizedValue)

    if (directMatch) {
        return directMatch
    }

    const matchedDays = normalizedValue.match(/[1-7]/)?.[0]

    if (!matchedDays) {
        return routineDayOptions[0]
    }

    return routineDayOptions[Number(matchedDays) - 1] ?? routineDayOptions[0]
}

export function getRoutineDescription(subtitle: string, goal: string) {
    return subtitle || goal
}

export function getNormalizedRoutineDescription(subtitle: string, goal: string) {
    return subtitle.trim() || goal.trim()
}

export function getExerciseDescription(target: string, notes: string) {
    return notes || target
}

export function getNormalizedExerciseDescription(target: string, notes: string) {
    return notes.trim() || target.trim()
}

function toValidationResult<T>(result: z.ZodSafeParseResult<T>): ValidationResult<T> {
    if (result.success) {
        return {
            success: true,
            data: result.data,
        }
    }

    return {
        success: false,
        error: result.error.issues[0]?.message ?? 'Datos no válidos.',
    }
}

export function parseCategoryDraft(input: {
    name: string
    sort_order: number
    is_active: boolean
}): ValidationResult<{
    slug: string
    name: string
    sort_order: number
    is_active: boolean
}> {
    const parsed = toValidationResult(categoryDraftSchema.safeParse(input))

    if (!parsed.success) {
        return parsed
    }

    const slug = slugify(parsed.data.name)

    if (!slug) {
        return {
            success: false,
            error: 'No se pudo generar un slug válido para la categoría.',
        }
    }

    return {
        success: true,
        data: {
            ...parsed.data,
            slug,
        },
    }
}

export function parseExerciseDraft(input: {
    name: string
    muscle_group: (typeof muscleGroupOptions)[number]
    default_metric: (typeof exerciseMetricOptions)[number]
    instructions: string
}): ValidationResult<{
    slug: string
    name: string
    muscle_group: (typeof muscleGroupOptions)[number]
    default_metric: (typeof exerciseMetricOptions)[number]
    instructions: string
}> {
    const parsed = toValidationResult(exerciseDraftSchema.safeParse(input))

    if (!parsed.success) {
        return parsed
    }

    const slug = slugify(parsed.data.name)

    if (!slug) {
        return {
            success: false,
            error: 'No se pudo generar un slug válido para el ejercicio.',
        }
    }

    return {
        success: true,
        data: {
            ...parsed.data,
            slug,
            name: parsed.data.name.trim(),
            instructions: parsed.data.instructions.trim(),
        },
    }
}

export function parseRoutineDraft(input: {
    category_id: string
    title: string
    subtitle: string
    goal: string
    duration_text: string
    level: (typeof routineLevelOptions)[number]
    hero_gradient: string
    image_gradient: string
    is_published: boolean
}): ValidationResult<{
    category_id: string
    slug: string
    title: string
    subtitle: string
    goal: string
    duration_text: (typeof routineDayOptions)[number]
    level: (typeof routineLevelOptions)[number]
    hero_gradient: string
    image_gradient: string
    is_published: boolean
}> {
    const parsed = toValidationResult(routineDraftSchema.safeParse(input))

    if (!parsed.success) {
        return parsed
    }

    const slug = slugify(parsed.data.title)
    const description = getNormalizedRoutineDescription(parsed.data.subtitle, parsed.data.goal)

    if (!slug) {
        return {
            success: false,
            error: 'No se pudo generar un slug válido para la rutina.',
        }
    }

    if (!description) {
        return {
            success: false,
            error: 'La rutina necesita una descripción visible.',
        }
    }

    return {
        success: true,
        data: {
            category_id: parsed.data.category_id.trim(),
            slug,
            title: parsed.data.title.trim(),
            subtitle: description,
            goal: description,
            duration_text: normalizeRoutineDays(parsed.data.duration_text),
            level: parsed.data.level,
            hero_gradient: parsed.data.hero_gradient.trim(),
            image_gradient: parsed.data.image_gradient.trim(),
            is_published: parsed.data.is_published,
        },
    }
}

export function parseRoutineExerciseDraft(input: {
    routine_id: string
    exercise_id: string
    day_number: number
    sort_order: number
    sets: number
    target: string
    metric: (typeof exerciseMetricOptions)[number]
    notes: string
}): ValidationResult<{
    routine_id: string
    exercise_id: string
    day_number: number
    sort_order: number
    sets: number
    target: string
    metric: (typeof exerciseMetricOptions)[number]
    notes: string
}> {
    const parsed = toValidationResult(routineExerciseDraftSchema.safeParse(input))

    if (!parsed.success) {
        return parsed
    }

    const description = getNormalizedExerciseDescription(parsed.data.target, parsed.data.notes)

    if (!description) {
        return {
            success: false,
            error: 'El bloque de rutina necesita un texto descriptivo.',
        }
    }

    return {
        success: true,
        data: {
            ...parsed.data,
            routine_id: parsed.data.routine_id.trim(),
            exercise_id: parsed.data.exercise_id.trim(),
            target: description,
            notes: description,
        },
    }
}
