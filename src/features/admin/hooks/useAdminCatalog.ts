import { useEffect, useState } from 'react'
import type { ExerciseMetric } from '../../../data/mock'
import { hasSupabaseEnv, supabase } from '../../../lib/supabase'

export type AdminCategory = {
    id: string
    slug: string
    name: string
    sort_order: number
    is_active: boolean
}

export type AdminExercise = {
    id: string
    slug: string
    name: string
    muscle_group: string
    default_metric: ExerciseMetric
    instructions: string
}

export type AdminRoutineExercise = {
    id: string
    routine_id: string
    exercise_id: string
    day_number: number
    sort_order: number
    sets: number
    target: string
    metric: ExerciseMetric
    notes: string
    exercises: {
        name: string
        muscle_group: string
    } | null
}

export type AdminRoutine = {
    id: string
    category_id: string
    slug: string
    title: string
    subtitle: string
    goal: string
    duration_text: string
    level: string
    hero_gradient: string
    image_gradient: string
    is_published: boolean
    categories: Array<{
        name: string
    }> | null
    routine_exercises: AdminRoutineExercise[]
}

type CategoryPayload = Omit<AdminCategory, 'id'>
type ExercisePayload = Omit<AdminExercise, 'id'>
type RoutinePayload = Omit<AdminRoutine, 'id' | 'categories' | 'routine_exercises'>
type RoutineExercisePayload = Omit<AdminRoutineExercise, 'id' | 'exercises'>

async function loadCategories() {
    const { data, error } = await supabase
        ?.from('categories')
        .select('id, slug, name, sort_order, is_active')
        .order('sort_order', { ascending: true }) ?? { data: null, error: new Error('Supabase no disponible') }

    if (error) {
        throw error
    }

    return (data ?? []) as AdminCategory[]
}

async function loadExercises() {
    const { data, error } = await supabase
        ?.from('exercises')
        .select('id, slug, name, muscle_group, default_metric, instructions')
        .order('created_at', { ascending: true }) ?? { data: null, error: new Error('Supabase no disponible') }

    if (error) {
        throw error
    }

    return (data ?? []) as AdminExercise[]
}

async function loadRoutines() {
    const { data, error } = await supabase
        ?.from('routines')
        .select(
            `
                id,
                category_id,
                slug,
                title,
                subtitle,
                goal,
                duration_text,
                level,
                hero_gradient,
                image_gradient,
                is_published,
                categories(name),
                routine_exercises(
                    id,
                    routine_id,
                    exercise_id,
                    day_number,
                    sort_order,
                    sets,
                    target,
                    metric,
                    notes,
                    exercises(name, muscle_group)
                )
            `,
        )
        .order('created_at', { ascending: true }) ?? { data: null, error: new Error('Supabase no disponible') }

    if (error) {
        throw error
    }

    return ((data ?? []) as unknown as AdminRoutine[]).map((routine) => ({
        ...routine,
        categories: routine.categories,
        routine_exercises: [...(routine.routine_exercises ?? [])].sort(
            (left, right) => {
                if ((left.day_number || 1) !== (right.day_number || 1)) {
                    return (left.day_number || 1) - (right.day_number || 1)
                }

                return left.sort_order - right.sort_order
            },
        ),
    }))
}

export function useAdminCatalog(enabled: boolean) {
    const [categories, setCategories] = useState<AdminCategory[]>([])
    const [exercises, setExercises] = useState<AdminExercise[]>([])
    const [routines, setRoutines] = useState<AdminRoutine[]>([])
    const [loading, setLoading] = useState(enabled && hasSupabaseEnv)
    const [error, setError] = useState<string | null>(null)
    const [feedback, setFeedback] = useState<string | null>(null)
    const [savingKey, setSavingKey] = useState<string | null>(null)

    const reload = async () => {
        if (!enabled || !supabase || !hasSupabaseEnv) {
            setLoading(false)
            return
        }

        setLoading(true)
        setError(null)

        try {
            const [nextCategories, nextExercises, nextRoutines] = await Promise.all([
                loadCategories(),
                loadExercises(),
                loadRoutines(),
            ])

            setCategories(nextCategories)
            setExercises(nextExercises)
            setRoutines(nextRoutines)
        } catch (caughtError) {
            const message = caughtError instanceof Error ? caughtError.message : 'No se pudo cargar el catálogo admin.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void reload()
    }, [enabled])

    const runMutation = async (key: string, action: () => Promise<unknown>, successMessage: string) => {
        if (!supabase || !hasSupabaseEnv) {
            return 'Supabase no está configurado.'
        }

        setSavingKey(key)
        setFeedback(null)
        setError(null)

        try {
            await action()
            await reload()
            setFeedback(successMessage)
            return null
        } catch (caughtError) {
            const message = caughtError instanceof Error ? caughtError.message : 'No se pudo guardar el cambio.'
            setError(message)
            return message
        } finally {
            setSavingKey(null)
        }
    }

    return {
        categories,
        exercises,
        routines,
        loading,
        error,
        feedback,
        savingKey,
        reload,
        createCategory: (payload: CategoryPayload) =>
            runMutation(
                'create-category',
                async () => {
                    const { error } = await supabase!.from('categories').insert(payload)

                    if (error) {
                        throw error
                    }
                },
                'Categoría creada.',
            ),
        updateCategory: (id: string, payload: CategoryPayload) =>
            runMutation(
                `category-${id}`,
                async () => {
                    const { error } = await supabase!.from('categories').update(payload).eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Categoría actualizada.',
            ),
        deleteCategory: (id: string) =>
            runMutation(
                `delete-category-${id}`,
                async () => {
                    const { error } = await supabase!.from('categories').delete().eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Categoría eliminada.',
            ),
        createExercise: (payload: ExercisePayload) =>
            runMutation(
                'create-exercise',
                async () => {
                    const { error } = await supabase!.from('exercises').insert(payload)

                    if (error) {
                        throw error
                    }
                },
                'Ejercicio creado.',
            ),
        updateExercise: (id: string, payload: ExercisePayload) =>
            runMutation(
                `exercise-${id}`,
                async () => {
                    const { error } = await supabase!.from('exercises').update(payload).eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Ejercicio actualizado.',
            ),
        deleteExercise: (id: string) =>
            runMutation(
                `delete-exercise-${id}`,
                async () => {
                    const { error } = await supabase!.from('exercises').delete().eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Ejercicio eliminado.',
            ),
        createRoutine: (payload: RoutinePayload) =>
            runMutation(
                'create-routine',
                async () => {
                    const { error } = await supabase!.from('routines').insert(payload)

                    if (error) {
                        throw error
                    }
                },
                'Rutina creada.',
            ),
        updateRoutine: (id: string, payload: RoutinePayload) =>
            runMutation(
                `routine-${id}`,
                async () => {
                    const { error } = await supabase!.from('routines').update(payload).eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Rutina actualizada.',
            ),
        deleteRoutine: (id: string) =>
            runMutation(
                `delete-routine-${id}`,
                async () => {
                    const { error } = await supabase!.from('routines').delete().eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Rutina eliminada.',
            ),
        createRoutineExercise: (payload: RoutineExercisePayload) =>
            runMutation(
                `create-routine-exercise-${payload.routine_id}`,
                async () => {
                    const { error } = await supabase!.from('routine_exercises').insert(payload)

                    if (error) {
                        throw error
                    }
                },
                'Bloque añadido a la rutina.',
            ),
        updateRoutineExercise: (id: string, payload: RoutineExercisePayload) =>
            runMutation(
                `routine-exercise-${id}`,
                async () => {
                    const { error } = await supabase!.from('routine_exercises').update(payload).eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Bloque de rutina actualizado.',
            ),
        deleteRoutineExercise: (id: string) =>
            runMutation(
                `delete-routine-exercise-${id}`,
                async () => {
                    const { error } = await supabase!.from('routine_exercises').delete().eq('id', id)

                    if (error) {
                        throw error
                    }
                },
                'Bloque eliminado de la rutina.',
            ),
    }
}