import { beforeEach, describe, expect, it } from 'vitest'
import { toggleFavoriteRoutine } from '../src/features/member/state/favoriteRoutines'

const STORAGE_KEY = 'kinetic-favorite-routines:v1'

describe('toggleFavoriteRoutine', () => {
    beforeEach(() => {
        window.localStorage.clear()
    })

    it('adds a routine to favorites when it is not stored yet', () => {
        const becameFavorite = toggleFavoriteRoutine('onyx-power-foundation')

        expect(becameFavorite).toBe(true)
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('["onyx-power-foundation"]')
    })

    it('removes a routine from favorites when toggled twice', () => {
        toggleFavoriteRoutine('onyx-power-foundation')

        const becameFavorite = toggleFavoriteRoutine('onyx-power-foundation')

        expect(becameFavorite).toBe(false)
        expect(window.localStorage.getItem(STORAGE_KEY)).toBe('[]')
    })

    it('deduplicates invalid stored data before inserting a new favorite', () => {
        window.localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(['metabolic-rush', 'metabolic-rush', '', 'explosive-hyrox-engine']),
        )

        toggleFavoriteRoutine('onyx-power-foundation')

        expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
            '["onyx-power-foundation","metabolic-rush","explosive-hyrox-engine"]',
        )
    })
})
