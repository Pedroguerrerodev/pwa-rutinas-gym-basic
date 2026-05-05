import { describe, expect, it } from 'vitest'
import {
    parseCategoryDraft,
    parseExerciseDraft,
    parseRoutineDraft,
    parseRoutineExerciseDraft,
    slugify,
} from '../src/features/admin/lib/adminSchemas'

describe('adminSchemas', () => {
    it('slugify normalizes accents and separators', () => {
        expect(slugify('Pérdida de peso avanzada')).toBe('perdida-de-peso-avanzada')
    })

    it('parses a valid category draft', () => {
        const result = parseCategoryDraft({
            name: 'Fuerza',
            sort_order: 2,
            is_active: true,
        })

        expect(result).toEqual({
            success: true,
            data: {
                name: 'Fuerza',
                slug: 'fuerza',
                sort_order: 2,
                is_active: true,
            },
        })
    })

    it('rejects an exercise draft without a visible name', () => {
        const result = parseExerciseDraft({
            name: '   ',
            muscle_group: 'Pierna',
            default_metric: 'weight',
            instructions: '',
        })

        expect(result).toEqual({
            success: false,
            error: 'El nombre del ejercicio es obligatorio.',
        })
    })

    it('normalizes a valid routine draft into a persisted payload', () => {
        const result = parseRoutineDraft({
            category_id: 'category-1',
            title: 'Push Pull Base',
            subtitle: 'Rutina de fuerza',
            goal: '',
            duration_text: '3 días',
            level: 'Intermedio',
            hero_gradient: 'hero',
            image_gradient: 'image',
            is_published: true,
        })

        expect(result).toEqual({
            success: true,
            data: {
                category_id: 'category-1',
                slug: 'push-pull-base',
                title: 'Push Pull Base',
                subtitle: 'Rutina de fuerza',
                goal: 'Rutina de fuerza',
                duration_text: '3 días',
                level: 'Intermedio',
                hero_gradient: 'hero',
                image_gradient: 'image',
                is_published: true,
            },
        })
    })

    it('rejects a routine exercise draft without selected exercise', () => {
        const result = parseRoutineExerciseDraft({
            routine_id: 'routine-1',
            exercise_id: '',
            day_number: 1,
            sort_order: 1,
            sets: 3,
            target: '10 reps',
            metric: 'weight',
            notes: '',
        })

        expect(result).toEqual({
            success: false,
            error: 'Debes seleccionar un ejercicio válido.',
        })
    })
})
