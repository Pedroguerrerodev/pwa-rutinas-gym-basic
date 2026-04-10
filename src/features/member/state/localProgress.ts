import { useEffect, useState } from 'react'
import type { Routine } from '../../../data/mock'

type ExerciseProgress = {
    values: string[]
    completed: boolean[]
}

export type RoutineProgress = Record<string, ExerciseProgress>

const emptyRoutine: Routine = {
    id: 'empty-routine',
    slug: 'empty-routine',
    title: '',
    subtitle: '',
    category: '',
    goal: '',
    duration: '',
    level: '',
    heroGradient: '',
    imageGradient: '',
    exercises: [],
}

function createExerciseProgress(sets: number): ExerciseProgress {
    return {
        values: Array.from({ length: sets }, () => ''),
        completed: Array.from({ length: sets }, () => false),
    }
}

function getExerciseProgress(
    current: RoutineProgress,
    exerciseId: string,
    sets: number,
): ExerciseProgress {
    const existing = current[exerciseId]

    if (!existing) {
        return createExerciseProgress(sets)
    }

    return {
        values: Array.from({ length: sets }, (_, index) => existing.values[index] ?? ''),
        completed: Array.from({ length: sets }, (_, index) => Boolean(existing.completed[index])),
    }
}

function createInitialProgress(routine: Routine): RoutineProgress {
    return routine.exercises.reduce<RoutineProgress>((accumulator, exercise) => {
        accumulator[exercise.id] = createExerciseProgress(exercise.sets)

        return accumulator
    }, {})
}

function getStorageKey(slug: string) {
    return `kinetic-progress:v1:${slug}`
}

function readStoredProgress(routine: Routine) {
    const fallback = createInitialProgress(routine)

    if (typeof window === 'undefined') {
        return fallback
    }

    try {
        const rawValue = window.localStorage.getItem(getStorageKey(routine.slug))

        if (!rawValue) {
            return fallback
        }

        const parsedValue = JSON.parse(rawValue) as RoutineProgress

        return routine.exercises.reduce<RoutineProgress>((accumulator, exercise) => {
            const current = parsedValue[exercise.id]

            accumulator[exercise.id] = {
                values: Array.from(
                    { length: exercise.sets },
                    (_, index) => current?.values?.[index] ?? '',
                ),
                completed: Array.from(
                    { length: exercise.sets },
                    (_, index) => Boolean(current?.completed?.[index]),
                ),
            }

            return accumulator
        }, {})
    } catch {
        return fallback
    }
}

export function useRoutineProgress(routine: Routine | null) {
    const activeRoutine = routine ?? emptyRoutine
    const [progress, setProgress] = useState<RoutineProgress>(() =>
        readStoredProgress(activeRoutine),
    )

    useEffect(() => {
        setProgress(readStoredProgress(activeRoutine))
    }, [activeRoutine])

    useEffect(() => {
        if (typeof window === 'undefined' || !routine) {
            return
        }

        window.localStorage.setItem(getStorageKey(activeRoutine.slug), JSON.stringify(progress))
    }, [activeRoutine.slug, progress, routine])

    const updateValue = (exerciseId: string, setIndex: number, value: string) => {
        const exercise = activeRoutine.exercises.find((entry) => entry.id === exerciseId)

        if (!exercise) {
            return
        }

        setProgress((current) => ({
            ...current,
            [exerciseId]: {
                ...getExerciseProgress(current, exerciseId, exercise.sets),
                values: getExerciseProgress(current, exerciseId, exercise.sets).values.map((entry, index) =>
                    index === setIndex ? value : entry,
                ),
            },
        }))
    }

    const toggleCompleted = (exerciseId: string, setIndex: number) => {
        const exercise = activeRoutine.exercises.find((entry) => entry.id === exerciseId)

        if (!exercise) {
            return
        }

        setProgress((current) => ({
            ...current,
            [exerciseId]: {
                ...getExerciseProgress(current, exerciseId, exercise.sets),
                completed: getExerciseProgress(current, exerciseId, exercise.sets).completed.map((entry, index) =>
                    index === setIndex ? !entry : entry,
                ),
            },
        }))
    }

    const resetProgress = () => {
        setProgress(createInitialProgress(activeRoutine))
    }

    const totalSets = activeRoutine.exercises.reduce(
        (accumulator, exercise) => accumulator + exercise.sets,
        0,
    )
    const completedSets = Object.values(progress).reduce(
        (accumulator, entry) => accumulator + entry.completed.filter(Boolean).length,
        0,
    )

    return {
        progress,
        updateValue,
        toggleCompleted,
        resetProgress,
        totalSets,
        completedSets,
    }
}