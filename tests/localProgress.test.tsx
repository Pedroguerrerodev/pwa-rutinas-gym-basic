import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import type { Routine } from '../src/data/mock'
import {
    MAX_PROGRESS_VALUE_LENGTH,
    getStoredPersonalRecords,
    useRoutineProgress,
} from '../src/features/member/state/localProgress'

const sampleRoutine: Routine = {
    id: 'routine-1',
    slug: 'routine-1',
    title: 'Routine 1',
    subtitle: 'Demo',
    category: 'Fuerza',
    goal: 'Fuerza',
    duration: '2 dias',
    level: 'Intermedio',
    heroGradient: '',
    imageGradient: '',
    exercises: [
        {
            id: 'back-squat',
            name: 'Back Squat',
            muscleGroup: 'Pierna',
            sets: 2,
            target: '6 reps',
            metric: 'weight',
            notes: 'Mantener tecnica',
            day: 1,
        },
    ],
}

describe('useRoutineProgress', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('truncates stored values to the configured maximum length', () => {
        const { result } = renderHook(() => useRoutineProgress(sampleRoutine))

        act(() => {
            result.current.updateValue('back-squat', 0, 'x'.repeat(MAX_PROGRESS_VALUE_LENGTH + 8))
        })

        expect(result.current.progress['back-squat'].values[0]).toHaveLength(MAX_PROGRESS_VALUE_LENGTH)
    })

    it('keeps only the latest personal record for the same exercise', () => {
        const { result } = renderHook(() => useRoutineProgress(sampleRoutine))

        act(() => {
            result.current.updateValue('back-squat', 0, '100 kg')
        })
        act(() => {
            result.current.togglePr('back-squat', 0)
        })
        act(() => {
            result.current.updateValue('back-squat', 1, '110 kg')
        })
        act(() => {
            result.current.togglePr('back-squat', 1)
        })

        expect(result.current.progress['back-squat'].prs).toEqual([false, true])
        expect(getStoredPersonalRecords()).toEqual([
            expect.objectContaining({
                exerciseId: 'back-squat',
                value: '110 kg',
                setNumber: 2,
            }),
        ])
    })

    it('stores the last session snapshot before resetting the routine progress', () => {
        const { result } = renderHook(() => useRoutineProgress(sampleRoutine))

        act(() => {
            result.current.updateValue('back-squat', 0, '95 kg')
        })
        act(() => {
            result.current.toggleCompleted('back-squat', 0)
        })
        act(() => {
            result.current.resetProgress()
        })

        expect(result.current.lastSessionSnapshot).not.toBeNull()
        expect(result.current.lastSessionSnapshot?.progress['back-squat']).toEqual({
            values: ['95 kg', ''],
            completed: [true, false],
            prs: [false, false],
        })
        expect(result.current.progress['back-squat']).toEqual({
            values: ['', ''],
            completed: [false, false],
            prs: [false, false],
        })
    })
})
