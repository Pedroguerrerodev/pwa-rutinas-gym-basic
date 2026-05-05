import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
    MOTIVATIONAL_QUOTES,
    getDailyMotivationalQuote,
} from '../src/features/member/state/dailyMotivationalQuote'

const STORAGE_KEY = 'kinetic-daily-quote:v1'

describe('getDailyMotivationalQuote', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-05-05T10:30:00.000Z'))
        window.localStorage.clear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('stores a deterministic quote for the current day', () => {
        const quote = getDailyMotivationalQuote()
        const storedEntry = window.localStorage.getItem(STORAGE_KEY)

        expect(quote).toEqual(MOTIVATIONAL_QUOTES[8])
        expect(storedEntry).toBe('{"dayKey":"2026-05-05","index":8}')
    })

    it('reuses the stored quote when it already matches the current day', () => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dayKey: '2026-05-05', index: 4 }))

        const quote = getDailyMotivationalQuote()

        expect(quote).toEqual(MOTIVATIONAL_QUOTES[4])
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('{"dayKey":"2026-05-05","index":4}')
    })

    it('recomputes the quote when the stored index is not valid', () => {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ dayKey: '2026-05-05', index: 999 }))

        const quote = getDailyMotivationalQuote()

        expect(quote).toEqual(MOTIVATIONAL_QUOTES[8])
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('{"dayKey":"2026-05-05","index":8}')
    })
})
