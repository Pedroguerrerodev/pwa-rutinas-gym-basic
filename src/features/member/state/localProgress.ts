import { useEffect, useState } from 'react'
import type { Routine } from '../../../data/mock'

type ExerciseProgress = {
    values: string[]
    completed: boolean[]
    prs: boolean[]
}

export type RoutineProgress = Record<string, ExerciseProgress>

export type RoutineSessionSnapshot = {
    savedAt: string
    progress: RoutineProgress
}

export type PersonalRecord = {
    routineId: string
    routineTitle: string
    routineSlug: string
    exerciseId: string
    exerciseKey: string
    exerciseName: string
    muscleGroup: string
    setNumber: number
    value: string
    updatedAt: string
}

const PERSONAL_RECORDS_STORAGE_KEY = 'kinetic-personal-records:v1'
export const MAX_PROGRESS_VALUE_LENGTH = 40

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
        prs: Array.from({ length: sets }, () => false),
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
        prs: Array.from({ length: sets }, (_, index) => Boolean(existing.prs?.[index])),
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

function getLastSessionStorageKey(slug: string) {
    return `kinetic-progress-last:v1:${slug}`
}

function getExerciseKey(exerciseName: string) {
    return exerciseName.trim().toLowerCase()
}

function normalizeProgressValue(value: string) {
    return value.slice(0, MAX_PROGRESS_VALUE_LENGTH)
}

function buildRoutineProgress(routine: Routine, source?: RoutineProgress | null): RoutineProgress {
    return routine.exercises.reduce<RoutineProgress>((accumulator, exercise) => {
        const current = source?.[exercise.id]

        accumulator[exercise.id] = {
            values: Array.from(
                { length: exercise.sets },
                (_, index) => normalizeProgressValue(current?.values?.[index] ?? ''),
            ),
            completed: Array.from(
                { length: exercise.sets },
                (_, index) => Boolean(current?.completed?.[index]),
            ),
            prs: Array.from(
                { length: exercise.sets },
                (_, index) => Boolean(current?.prs?.[index]),
            ),
        }

        return accumulator
    }, {})
}

function hasMeaningfulProgress(progress: RoutineProgress) {
    return Object.values(progress).some((entry) =>
        entry.values.some((value) => value.trim().length > 0) ||
        entry.completed.some(Boolean) ||
        entry.prs.some(Boolean),
    )
}

function readPersonalRecordsStorage(): PersonalRecord[] {
    if (typeof window === 'undefined') {
        return []
    }

    try {
        const rawValue = window.localStorage.getItem(PERSONAL_RECORDS_STORAGE_KEY)

        if (!rawValue) {
            return []
        }

        const parsedValue = JSON.parse(rawValue) as PersonalRecord[]

        if (!Array.isArray(parsedValue)) {
            return []
        }

        return parsedValue
            .filter(
                (record) =>
                    typeof record?.exerciseKey === 'string' &&
                    typeof record?.exerciseName === 'string' &&
                    typeof record?.value === 'string',
            )
            .map((record) => ({
                routineId: record.routineId ?? '',
                routineTitle: record.routineTitle ?? 'Rutina guardada',
                routineSlug: record.routineSlug ?? '',
                exerciseId: record.exerciseId ?? record.exerciseKey,
                exerciseKey: record.exerciseKey,
                exerciseName: record.exerciseName,
                muscleGroup: typeof record.muscleGroup === 'string' ? record.muscleGroup : '',
                setNumber: typeof record.setNumber === 'number' ? record.setNumber : 1,
                value: normalizeProgressValue(record.value),
                updatedAt:
                    typeof record.updatedAt === 'string' && record.updatedAt.length > 0
                        ? record.updatedAt
                        : new Date(0).toISOString(),
            }))
    } catch {
        return []
    }
}

function writePersonalRecordsStorage(records: PersonalRecord[]) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(PERSONAL_RECORDS_STORAGE_KEY, JSON.stringify(records))
}

function upsertPersonalRecord(record: PersonalRecord) {
    const currentRecords = readPersonalRecordsStorage()
    const nextRecords = currentRecords.filter((entry) => entry.exerciseKey !== record.exerciseKey)

    nextRecords.unshift(record)
    writePersonalRecordsStorage(nextRecords)
}

function readLastSessionSnapshot(routine: Routine): RoutineSessionSnapshot | null {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        const rawValue = window.localStorage.getItem(getLastSessionStorageKey(routine.slug))

        if (!rawValue) {
            return null
        }

        const parsedValue = JSON.parse(rawValue) as RoutineSessionSnapshot

        if (!parsedValue || typeof parsedValue !== 'object' || typeof parsedValue.savedAt !== 'string') {
            return null
        }

        return {
            savedAt: parsedValue.savedAt,
            progress: buildRoutineProgress(routine, parsedValue.progress),
        }
    } catch {
        return null
    }
}

function writeLastSessionSnapshot(slug: string, snapshot: RoutineSessionSnapshot) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(getLastSessionStorageKey(slug), JSON.stringify(snapshot))
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

        return buildRoutineProgress(routine, parsedValue)
    } catch {
        return fallback
    }
}

export function useRoutineProgress(routine: Routine | null) {
    const activeRoutine = routine ?? emptyRoutine
    const [progress, setProgress] = useState<RoutineProgress>(() =>
        readStoredProgress(activeRoutine),
    )
    const [lastSessionSnapshot, setLastSessionSnapshot] = useState<RoutineSessionSnapshot | null>(() =>
        readLastSessionSnapshot(activeRoutine),
    )

    useEffect(() => {
        setProgress(readStoredProgress(activeRoutine))
        setLastSessionSnapshot(readLastSessionSnapshot(activeRoutine))
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

        const nextValue = normalizeProgressValue(value)

        setProgress((current) => ({
            ...current,
            [exerciseId]: {
                ...getExerciseProgress(current, exerciseId, exercise.sets),
                values: getExerciseProgress(current, exerciseId, exercise.sets).values.map((entry, index) =>
                    index === setIndex ? nextValue : entry,
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

    const togglePr = (exerciseId: string, setIndex: number) => {
        const exercise = activeRoutine.exercises.find((entry) => entry.id === exerciseId)

        if (!exercise) {
            return false
        }

        const currentExerciseProgress = getExerciseProgress(progress, exerciseId, exercise.sets)
        const currentValue = normalizeProgressValue(currentExerciseProgress.values[setIndex] ?? '').trim()
        const exerciseKey = getExerciseKey(exercise.name)

        if (!currentValue) {
            return false
        }

        // PR acts as a one-tap save action: always keep the latest pressed value per exercise.
        upsertPersonalRecord({
            routineId: activeRoutine.id,
            routineTitle: activeRoutine.title,
            routineSlug: activeRoutine.slug,
            exerciseId: exercise.id,
            exerciseKey,
            exerciseName: exercise.name,
            muscleGroup: exercise.muscleGroup ?? '',
            setNumber: setIndex + 1,
            value: currentValue,
            updatedAt: new Date().toISOString(),
        })

        setProgress((current) => ({
            ...current,
            [exerciseId]: {
                ...getExerciseProgress(current, exerciseId, exercise.sets),
                prs: getExerciseProgress(current, exerciseId, exercise.sets).prs.map((_, index) => index === setIndex),
            },
        }))

        return true
    }

    const resetProgress = () => {
        if (hasMeaningfulProgress(progress)) {
            const snapshot = {
                savedAt: new Date().toISOString(),
                progress: buildRoutineProgress(activeRoutine, progress),
            }

            writeLastSessionSnapshot(activeRoutine.slug, snapshot)
            setLastSessionSnapshot(snapshot)
        }

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
        lastSessionSnapshot,
        updateValue,
        toggleCompleted,
        togglePr,
        resetProgress,
        totalSets,
        completedSets,
    }
}

export function getStoredPersonalRecords() {
    return readPersonalRecordsStorage().sort((left, right) =>
        right.updatedAt.localeCompare(left.updatedAt),
    )
}