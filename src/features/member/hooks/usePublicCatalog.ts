import { useEffect, useState } from 'react'
import {
    categories as fallbackCategories,
    routines as fallbackRoutines,
    type Exercise,
    type Routine,
} from '../../../data/mock'
import { hasSupabaseEnv, supabase } from '../../../lib/supabase'

const emptyCategories = ['Todas']
const emptyRoutines: Routine[] = []

type RoutineRow = {
    id: string
    slug: string
    title: string
    subtitle: string
    goal: string
    duration_text: string
    level: string
    hero_gradient: string
    image_gradient: string
    categories: {
        slug: string
        name: string
    } | null
    routine_exercises: Array<{
        id: string
        day_number: number
        sort_order: number
        sets: number
        target: string
        metric: Exercise['metric']
        notes: string
        exercises: {
            slug: string
            name: string
            instructions: string
        } | null
    }>
}

async function fetchPublicCategories() {
    if (!supabase || !hasSupabaseEnv) {
        return fallbackCategories
    }

    const { data, error } = await supabase
        .from('categories')
        .select('slug, name, sort_order')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

    if (error) {
        throw error
    }

    return ['Todas', ...(data ?? []).map((category) => category.name)]
}

function mapRoutineRow(row: RoutineRow): Routine {
    const subtitle = row.subtitle?.trim() ?? ''
    const goal = row.goal?.trim() ?? ''
    const normalizedGoal = subtitle && subtitle === goal ? '' : goal

    const exercises = [...(row.routine_exercises ?? [])]
        .sort((left, right) => {
            if ((left.day_number || 1) !== (right.day_number || 1)) {
                return (left.day_number || 1) - (right.day_number || 1)
            }

            return left.sort_order - right.sort_order
        })
        .map<Exercise>((entry) => {
            const target = entry.target?.trim() ?? ''
            const notes = entry.notes?.trim() || entry.exercises?.instructions?.trim() || ''
            const description = notes || target

            return {
                id: entry.id,
                name: entry.exercises?.name ?? 'Ejercicio',
                sets: entry.sets,
                target: description,
                metric: entry.metric,
                notes: description,
                day: entry.day_number || 1,
            }
        })

    return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        subtitle,
        category: row.categories?.name ?? 'General',
        goal: normalizedGoal,
        duration: row.duration_text,
        level: row.level,
        heroGradient: row.hero_gradient,
        imageGradient: row.image_gradient,
        exercises,
    }
}

async function fetchPublicRoutines() {
    if (!supabase || !hasSupabaseEnv) {
        return fallbackRoutines
    }

    const { data, error } = await supabase
        .from('routines')
        .select(
            `
                id,
                slug,
                title,
                subtitle,
                goal,
                duration_text,
                level,
                hero_gradient,
                image_gradient,
                categories!inner(
                    slug,
                    name
                ),
                routine_exercises(
                    id,
                    day_number,
                    sort_order,
                    sets,
                    target,
                    metric,
                    notes,
                    exercises!inner(
                        slug,
                        name,
                        instructions
                    )
                )
            `,
        )
        .eq('is_published', true)
        .order('created_at', { ascending: true })

    if (error) {
        throw error
    }

    return ((data ?? []) as unknown as RoutineRow[]).map(mapRoutineRow)
}

export function usePublicCatalog() {
    const [categories, setCategories] = useState(hasSupabaseEnv ? emptyCategories : fallbackCategories)
    const [routines, setRoutines] = useState<Routine[]>(hasSupabaseEnv ? emptyRoutines : fallbackRoutines)
    const [loading, setLoading] = useState(hasSupabaseEnv)
    const [source, setSource] = useState<'mock' | 'supabase'>(hasSupabaseEnv ? 'supabase' : 'mock')

    useEffect(() => {
        let isMounted = true

        const loadCatalog = async () => {
            if (!supabase || !hasSupabaseEnv) {
                setLoading(false)
                return
            }

            try {
                const [nextCategories, nextRoutines] = await Promise.all([
                    fetchPublicCategories(),
                    fetchPublicRoutines(),
                ])

                if (!isMounted) {
                    return
                }

                setCategories(nextCategories)
                setRoutines(nextRoutines)
                setSource('supabase')
            } catch {
                if (!isMounted) {
                    return
                }

                setCategories(emptyCategories)
                setRoutines(emptyRoutines)
                setSource('supabase')
            } finally {
                if (isMounted) {
                    setLoading(false)
                }
            }
        }

        void loadCatalog()

        return () => {
            isMounted = false
        }
    }, [])

    return {
        categories,
        routines,
        loading,
        source,
    }
}