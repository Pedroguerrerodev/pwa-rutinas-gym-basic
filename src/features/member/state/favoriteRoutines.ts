import { useEffect, useState } from 'react'

const FAVORITE_ROUTINES_STORAGE_KEY = 'kinetic-favorite-routines:v1'
const FAVORITE_ROUTINES_EVENT = 'kinetic:favorites-changed'

function readFavoriteRoutineSlugs() {
    if (typeof window === 'undefined') {
        return [] as string[]
    }

    try {
        const rawValue = window.localStorage.getItem(FAVORITE_ROUTINES_STORAGE_KEY)

        if (!rawValue) {
            return []
        }

        const parsedValue = JSON.parse(rawValue) as string[]

        if (!Array.isArray(parsedValue)) {
            return []
        }

        return [...new Set(parsedValue.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0))]
    } catch {
        return []
    }
}

function writeFavoriteRoutineSlugs(favoriteSlugs: string[]) {
    if (typeof window === 'undefined') {
        return
    }

    window.localStorage.setItem(FAVORITE_ROUTINES_STORAGE_KEY, JSON.stringify(favoriteSlugs))
    window.dispatchEvent(new CustomEvent(FAVORITE_ROUTINES_EVENT))
}

export function toggleFavoriteRoutine(slug: string) {
    const currentFavorites = readFavoriteRoutineSlugs()
    const isFavorite = currentFavorites.includes(slug)
    const nextFavorites = isFavorite
        ? currentFavorites.filter((entry) => entry !== slug)
        : [slug, ...currentFavorites]

    writeFavoriteRoutineSlugs(nextFavorites)

    return !isFavorite
}

export function useFavoriteRoutines() {
    const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>(() => readFavoriteRoutineSlugs())

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        const syncFavorites = () => {
            setFavoriteSlugs(readFavoriteRoutineSlugs())
        }

        const handleStorage = (event: StorageEvent) => {
            if (event.key === FAVORITE_ROUTINES_STORAGE_KEY) {
                syncFavorites()
            }
        }

        window.addEventListener('storage', handleStorage)
        window.addEventListener(FAVORITE_ROUTINES_EVENT, syncFavorites)

        return () => {
            window.removeEventListener('storage', handleStorage)
            window.removeEventListener(FAVORITE_ROUTINES_EVENT, syncFavorites)
        }
    }, [])

    return favoriteSlugs
}