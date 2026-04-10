import {
    ChevronDown,
    ChevronUp,
    LayoutDashboard,
    FolderKanban,
    Plus,
    RefreshCcw,
    Save,
    Search,
    SplinePointer,
    Trash2,
    Users,
} from 'lucide-react'
import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useAdminAuth } from '../auth/AdminAuthContext'
import {
    useAdminCatalog,
    type AdminCategory,
    type AdminExercise,
    type AdminRoutine,
    type AdminRoutineExercise,
} from '../hooks/useAdminCatalog'

const DEFAULT_HERO_GRADIENT =
    'linear-gradient(150deg, rgba(9, 24, 21, 0.55), rgba(0, 0, 0, 0.92)), radial-gradient(circle at top, rgba(255, 211, 28, 0.18), transparent 26%)'
const DEFAULT_IMAGE_GRADIENT =
    'linear-gradient(180deg, rgba(16, 40, 36, 0.6), rgba(0, 0, 0, 0.1))'

type CategoryDraft = Omit<AdminCategory, 'id'>
type ExerciseDraft = Omit<AdminExercise, 'id'>
type RoutineDraft = Omit<AdminRoutine, 'id' | 'categories' | 'routine_exercises'>
type RoutineExerciseDraft = Omit<AdminRoutineExercise, 'id' | 'exercises'> & {
    exercise_query: string
}

const routineLevelOptions = ['Principiante', 'Intermedio', 'Avanzado'] as const
const routineDayOptions = ['1 día', '2 días', '3 días', '4 días', '5 días', '6 días', '7 días'] as const
const muscleGroupOptions = [
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

function slugify(value: string) {
    return value
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

function buildCategoryDraft(): CategoryDraft {
    return {
        slug: '',
        name: '',
        sort_order: 1,
        is_active: true,
    }
}

function buildExerciseDraft(): ExerciseDraft {
    return {
        slug: '',
        name: '',
        muscle_group: 'Pierna',
        default_metric: 'weight',
        instructions: '',
    }
}

function buildRoutineDraft(categoryId = ''): RoutineDraft {
    return {
        category_id: categoryId,
        slug: '',
        title: '',
        subtitle: '',
        goal: '',
        duration_text: routineDayOptions[0],
        level: 'Intermedio',
        hero_gradient: DEFAULT_HERO_GRADIENT,
        image_gradient: DEFAULT_IMAGE_GRADIENT,
        is_published: true,
    }
}

function normalizeRoutineDays(value: string) {
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

function getRoutineDescription(subtitle: string, goal: string) {
    return subtitle || goal
}

function getNormalizedRoutineDescription(subtitle: string, goal: string) {
    return subtitle.trim() || goal.trim()
}

function getExerciseDescription(target: string, notes: string) {
    return notes || target
}

function getNormalizedExerciseDescription(target: string, notes: string) {
    return notes.trim() || target.trim()
}

function getRoutineTotalDays(durationText: string, entries: Array<{ day_number: number }>) {
    const parsedDurationDays = Number(durationText.match(/[1-7]/)?.[0] ?? '1')
    const maxEntryDay = entries.length > 0 ? Math.max(...entries.map((entry) => entry.day_number || 1)) : 1

    return Math.max(parsedDurationDays, maxEntryDay, 1)
}

function getRoutineDayOptions(durationText: string, entries: Array<{ day_number: number }>) {
    const totalDays = getRoutineTotalDays(durationText, entries)

    return Array.from({ length: totalDays }, (_, index) => index + 1)
}

function getExerciseOptionLabel(exercise: { name: string; muscle_group: string } | null | undefined) {
    if (!exercise) {
        return ''
    }

    return `${exercise.name} · ${exercise.muscle_group}`
}

function getSuggestedExercises(query: string, exercises: AdminExercise[]) {
    const normalizedQuery = query.trim().toLowerCase()

    return exercises
        .map((exercise) => {
            const name = exercise.name.toLowerCase()
            const group = exercise.muscle_group.toLowerCase()
            const label = getExerciseOptionLabel(exercise).toLowerCase()
            const terms = normalizedQuery.split(/\s+/).filter(Boolean)

            let score = 0

            if (!normalizedQuery) {
                score = 1
            } else if (name === normalizedQuery || label === normalizedQuery) {
                score = 6
            } else if (name.startsWith(normalizedQuery)) {
                score = 5
            } else if (name.includes(normalizedQuery)) {
                score = 4
            } else if (group.startsWith(normalizedQuery) || label.includes(normalizedQuery)) {
                score = 3
            } else if (terms.length > 0 && terms.every((term) => label.includes(term))) {
                score = 2
            }

            return { exercise, score }
        })
        .filter((entry) => entry.score > 0)
        .sort((left, right) => {
            if (right.score !== left.score) {
                return right.score - left.score
            }

            return left.exercise.name.localeCompare(right.exercise.name, 'es')
        })
        .slice(0, 8)
        .map((entry) => entry.exercise)
}

function findExerciseFromQuery(query: string, exercises: AdminExercise[]) {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
        return null
    }

    return exercises.find((exercise) => {
        const label = getExerciseOptionLabel(exercise).toLowerCase()

        return label === normalizedQuery || exercise.name.toLowerCase() === normalizedQuery
    }) ?? null
}

function buildRoutineExerciseDraft(routineId: string, sortOrder: number): RoutineExerciseDraft {
    return {
        routine_id: routineId,
        exercise_id: '',
        exercise_query: '',
        day_number: 1,
        sort_order: sortOrder,
        sets: 3,
        target: '',
        metric: 'weight',
        notes: '',
    }
}

function DashboardStat({ label, value, helper }: { label: string; value: string; helper: string }) {
    return (
        <article className="metric-card">
            <div className="section-kicker">Métrica viva</div>
            <div className="stat-value">{value}</div>
            <div className="card-title">{label}</div>
            <div className="metric-copy">{helper}</div>
        </article>
    )
}

export function AdminDashboardPage() {
    const { isAdmin, user } = useAdminAuth()
    const {
        categories,
        exercises,
        routines,
        loading,
        error,
        feedback,
        savingKey,
        reload,
        createCategory,
        updateCategory,
        deleteCategory,
        createExercise,
        updateExercise,
        deleteExercise,
        createRoutine,
        updateRoutine,
        deleteRoutine,
        createRoutineExercise,
        updateRoutineExercise,
        deleteRoutineExercise,
    } = useAdminCatalog(Boolean(user && isAdmin))
    const [categoryDraft, setCategoryDraft] = useState<CategoryDraft>(buildCategoryDraft)
    const [exerciseDraft, setExerciseDraft] = useState<ExerciseDraft>(buildExerciseDraft)
    const [routineDraft, setRoutineDraft] = useState<RoutineDraft>(buildRoutineDraft)
    const [editableCategories, setEditableCategories] = useState<AdminCategory[]>([])
    const [editableExercises, setEditableExercises] = useState<AdminExercise[]>([])
    const [editableRoutines, setEditableRoutines] = useState<AdminRoutine[]>([])
    const [routineExerciseDrafts, setRoutineExerciseDrafts] = useState<Record<string, RoutineExerciseDraft>>({})
    const [activePanel, setActivePanel] = useState<'overview' | 'categories' | 'exercises' | 'routines'>('overview')
    const [expandedRoutineId, setExpandedRoutineId] = useState<string | null>(null)
    const [exerciseSearch, setExerciseSearch] = useState('')
    const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('Todas')
    const [routineSearch, setRoutineSearch] = useState('')
    const [routineExerciseSearch, setRoutineExerciseSearch] = useState<Record<string, string>>({})
    const deferredExerciseSearch = useDeferredValue(exerciseSearch)
    const deferredRoutineSearch = useDeferredValue(routineSearch)

    useEffect(() => {
        setEditableCategories(categories)
        setRoutineDraft((current) =>
            current.category_id || categories.length === 0
                ? current
                : { ...current, category_id: categories[0].id },
        )
    }, [categories])

    useEffect(() => {
        setEditableExercises(exercises)
    }, [exercises])

    useEffect(() => {
        setEditableRoutines(routines)
        setExpandedRoutineId((current) => {
            if (current && routines.some((routine) => routine.id === current)) {
                return current
            }

            return routines[0]?.id ?? null
        })

        setRoutineExerciseDrafts((current) => {
            const nextDrafts = { ...current }

            for (const routine of routines) {
                nextDrafts[routine.id] = current[routine.id] ??
                    buildRoutineExerciseDraft(routine.id, routine.routine_exercises.length + 1)

                if (!nextDrafts[routine.id].exercise_query) {
                    nextDrafts[routine.id] = {
                        ...nextDrafts[routine.id],
                        exercise_query: '',
                    }
                }
            }

            return nextDrafts
        })
    }, [routines])

    const filteredRoutines = useMemo(() => {
        const normalizedSearch = deferredRoutineSearch.trim().toLowerCase()

        if (!normalizedSearch) {
            return editableRoutines
        }

        return editableRoutines.filter((routine) => {
            const categoryName = categories.find((category) => category.id === routine.category_id)?.name ?? ''

            return [routine.title, routine.subtitle, routine.level, categoryName]
                .join(' ')
                .toLowerCase()
                .includes(normalizedSearch)
        })
    }, [categories, deferredRoutineSearch, editableRoutines])

    const filteredExercises = useMemo(() => {
        const normalizedSearch = deferredExerciseSearch.trim().toLowerCase()

        return editableExercises.filter((exercise) => {
            const matchesGroup =
                selectedMuscleGroup === 'Todas' || exercise.muscle_group === selectedMuscleGroup
            const matchesSearch =
                normalizedSearch.length === 0 || exercise.name.toLowerCase().includes(normalizedSearch)

            return matchesGroup && matchesSearch
        })
    }, [deferredExerciseSearch, editableExercises, selectedMuscleGroup])

    const handleCreateCategory = async () => {
        const name = categoryDraft.name.trim()
        const slug = slugify(name)

        if (!name || !slug) {
            return
        }

        const nextError = await createCategory({
            ...categoryDraft,
            name,
            slug,
        })

        if (!nextError) {
            setCategoryDraft(buildCategoryDraft())
        }
    }

    const handleCreateExercise = async () => {
        const name = exerciseDraft.name.trim()
        const slug = slugify(name)

        if (!name || !slug) {
            return
        }

        const nextError = await createExercise({
            ...exerciseDraft,
            name,
            slug,
            instructions: '',
        })

        if (!nextError) {
            setExerciseDraft(buildExerciseDraft())
        }
    }

    const handleCreateRoutine = async () => {
        const title = routineDraft.title.trim()
        const slug = slugify(title)
        const description = getNormalizedRoutineDescription(routineDraft.subtitle, routineDraft.goal)

        if (!title || !slug || !routineDraft.category_id) {
            return
        }

        const nextError = await createRoutine({
            ...routineDraft,
            title,
            slug,
            subtitle: description,
            goal: description,
            duration_text: normalizeRoutineDays(routineDraft.duration_text),
            level: routineDraft.level.trim(),
        })

        if (!nextError) {
            setRoutineDraft(buildRoutineDraft(categories[0]?.id ?? ''))
        }
    }

    const dashboardStats = [
        {
            label: 'Categorías activas',
            value: String(categories.filter((category) => category.is_active).length),
            helper: 'Visibles en el catálogo público',
        },
        {
            label: 'Rutinas publicadas',
            value: String(routines.filter((routine) => routine.is_published).length),
            helper: 'Disponibles para socios ahora mismo',
        },
        {
            label: 'Ejercicios base',
            value: String(exercises.length),
            helper: 'Biblioteca lista para enlazar',
        },
    ]

    return (
        <main>
            <div className="eyebrow">Dashboard conectado a Supabase</div>
            <h1 className="hero-title">
                Control total del <span className="accent-text">catálogo</span>
            </h1>
            <p className="admin-copy">
                El portal ya escribe en la base real. Desde aquí puedes crear, editar y retirar
                categorías, rutinas, ejercicios y los ejercicios que componen cada rutina.
            </p>

            <div className="inline-actions section">
                <button className="secondary-button" onClick={() => void reload()} type="button">
                    <RefreshCcw size={18} /> Recargar datos
                </button>
                <div className="status-pill">{user?.email ?? 'admin'}</div>
            </div>

            <div className="section-tabs section">
                <button
                    className={activePanel === 'overview' ? 'section-tab is-active' : 'section-tab'}
                    onClick={() => setActivePanel('overview')}
                    type="button"
                >
                    <LayoutDashboard size={16} /> Resumen
                </button>
                <button
                    className={activePanel === 'categories' ? 'section-tab is-active' : 'section-tab'}
                    onClick={() => setActivePanel('categories')}
                    type="button"
                >
                    <Users size={16} /> Categorías
                </button>
                <button
                    className={activePanel === 'exercises' ? 'section-tab is-active' : 'section-tab'}
                    onClick={() => setActivePanel('exercises')}
                    type="button"
                >
                    <SplinePointer size={16} /> Ejercicios
                </button>
                <button
                    className={activePanel === 'routines' ? 'section-tab is-active' : 'section-tab'}
                    onClick={() => setActivePanel('routines')}
                    type="button"
                >
                    <FolderKanban size={16} /> Rutinas
                </button>
            </div>

            {error ? <div className="admin-feedback is-error section">{error}</div> : null}
            {feedback ? <div className="admin-feedback section">{feedback}</div> : null}
            {loading ? <div className="empty-state section">Sincronizando panel admin...</div> : null}

            {activePanel === 'overview' && (
                <section className="stats-grid section">
                    {dashboardStats.map((stat) => <DashboardStat key={stat.label} {...stat} />)}
                </section>
            )}

            {activePanel === 'categories' && (
                <section className="admin-grid section">
                    <article className="admin-card">
                        <div className="section-kicker">Nueva categoría</div>
                        <h2 className="section-title">Ordena el catálogo</h2>
                        <div className="form-grid">
                            <input
                                className="data-input"
                                onChange={(event) =>
                                    setCategoryDraft((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Categoría"
                                value={categoryDraft.name}
                            />
                            <input
                                className="data-input"
                                inputMode="numeric"
                                onChange={(event) =>
                                    setCategoryDraft((current) => ({
                                        ...current,
                                        sort_order: Number(event.target.value || 0),
                                    }))
                                }
                                placeholder="Orden"
                                type="number"
                                value={categoryDraft.sort_order}
                            />
                            <label className="admin-toggle-row">
                                <input
                                    checked={categoryDraft.is_active}
                                    onChange={(event) =>
                                        setCategoryDraft((current) => ({ ...current, is_active: event.target.checked }))
                                    }
                                    type="checkbox"
                                />
                                Visible para socios
                            </label>
                            <div className="inline-actions">
                                <button className="primary-button" onClick={() => void handleCreateCategory()} type="button">
                                    <Plus size={18} /> Añadir categoría
                                </button>
                            </div>
                        </div>
                    </article>

                </section>
            )}

            {activePanel === 'exercises' && (
                <section className="admin-grid section">
                    <article className="admin-card">
                        <div className="section-kicker">Biblioteca de ejercicios</div>
                        <h2 className="section-title">Nuevo ejercicio</h2>
                        <div className="form-grid">
                            <input
                                className="data-input"
                                onChange={(event) =>
                                    setExerciseDraft((current) => ({
                                        ...current,
                                        name: event.target.value,
                                    }))
                                }
                                placeholder="Nombre del ejercicio"
                                value={exerciseDraft.name}
                            />
                            <select
                                className="search-select"
                                onChange={(event) =>
                                    setExerciseDraft((current) => ({
                                        ...current,
                                        muscle_group: event.target.value,
                                    }))
                                }
                                value={exerciseDraft.muscle_group}
                            >
                                {muscleGroupOptions.map((group) => (
                                    <option key={group} value={group}>
                                        {group}
                                    </option>
                                ))}
                            </select>
                            <div className="inline-actions">
                                <button className="primary-button" onClick={() => void handleCreateExercise()} type="button">
                                    <Plus size={18} /> Añadir ejercicio
                                </button>
                            </div>
                        </div>
                    </article>
                </section>
            )}

            {activePanel === 'categories' && <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <h2 className="section-title">Categorías</h2>
                    <div className="section-kicker">Edición en vivo</div>
                </div>

                <div className="admin-record-list">
                    {editableCategories.map((category, index) => (
                        <div className="admin-record" key={category.id}>
                            <div className="admin-record-grid compact-grid">
                                <input
                                    className="data-input"
                                    onChange={(event) =>
                                        setEditableCategories((current) => {
                                            const next = [...current]
                                            next[index] = { ...next[index], name: event.target.value }
                                            return next
                                        })
                                    }
                                    value={category.name}
                                />
                                <input
                                    className="data-input"
                                    inputMode="numeric"
                                    onChange={(event) =>
                                        setEditableCategories((current) => {
                                            const next = [...current]
                                            next[index] = {
                                                ...next[index],
                                                sort_order: Number(event.target.value || 0),
                                            }
                                            return next
                                        })
                                    }
                                    type="number"
                                    value={category.sort_order}
                                />
                            </div>
                            <div className="inline-actions admin-inline-actions">
                                <label className="admin-toggle-row">
                                    <input
                                        checked={category.is_active}
                                        onChange={(event) =>
                                            setEditableCategories((current) => {
                                                const next = [...current]
                                                next[index] = {
                                                    ...next[index],
                                                    is_active: event.target.checked,
                                                }
                                                return next
                                            })
                                        }
                                        type="checkbox"
                                    />
                                    Activa
                                </label>
                                <button
                                    className="secondary-button"
                                    onClick={() =>
                                        void updateCategory(category.id, {
                                            slug: slugify(category.name),
                                            name: category.name,
                                            sort_order: category.sort_order,
                                            is_active: category.is_active,
                                        })
                                    }
                                    type="button"
                                >
                                    <Save size={18} />
                                    {savingKey === `category-${category.id}` ? 'Guardando...' : 'Guardar'}
                                </button>
                                <button
                                    className="ghost-button"
                                    onClick={() => void deleteCategory(category.id)}
                                    type="button"
                                >
                                    <Trash2 size={18} /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>}

            {activePanel === 'exercises' && <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <h2 className="section-title">Ejercicios base</h2>
                    <div className="section-kicker">Guardar o eliminar</div>
                </div>

                <section className="search-shell admin-routine-toolbar">
                    <label
                        className="search-input"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '20px 1fr',
                            gap: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Search size={18} color="currentColor" />
                        <input
                            aria-label="Buscar ejercicio en admin"
                            className="search-input"
                            onChange={(event) => setExerciseSearch(event.target.value)}
                            placeholder="Buscar ejercicio por nombre"
                            style={{ padding: 0, border: 0, background: 'transparent' }}
                            value={exerciseSearch}
                        />
                    </label>

                    <div className="admin-filter-row" role="tablist" aria-label="Filtro de grupos musculares">
                        {['Todas', ...muscleGroupOptions].map((group) => (
                            <button
                                key={group}
                                className={group === selectedMuscleGroup ? 'category-chip active' : 'category-chip'}
                                onClick={() => setSelectedMuscleGroup(group)}
                                type="button"
                            >
                                {group}
                            </button>
                        ))}
                    </div>

                    <div className="results-summary">
                        <span>{filteredExercises.length} ejercicios visibles</span>
                        <span>{selectedMuscleGroup === 'Todas' ? 'Todos los grupos' : selectedMuscleGroup}</span>
                    </div>
                </section>

                <div className="admin-record-list">
                    {filteredExercises.map((exercise) => {
                        const index = editableExercises.findIndex((entry) => entry.id === exercise.id)

                        return (
                            <div className="admin-record" key={exercise.id}>
                                <div className="admin-record-grid">
                                    <input
                                        className="data-input"
                                        onChange={(event) =>
                                            setEditableExercises((current) => {
                                                const next = [...current]
                                                next[index] = { ...next[index], name: event.target.value }
                                                return next
                                            })
                                        }
                                        value={exercise.name}
                                    />
                                    <select
                                        className="search-select"
                                        onChange={(event) =>
                                            setEditableExercises((current) => {
                                                const next = [...current]
                                                next[index] = {
                                                    ...next[index],
                                                    muscle_group: event.target.value,
                                                }
                                                return next
                                            })
                                        }
                                        value={exercise.muscle_group}
                                    >
                                        {muscleGroupOptions.map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="inline-actions admin-inline-actions">
                                    <button
                                        className="secondary-button"
                                        onClick={() =>
                                            void updateExercise(exercise.id, {
                                                slug: slugify(exercise.name),
                                                name: exercise.name,
                                                muscle_group: exercise.muscle_group,
                                                default_metric: exercise.default_metric,
                                                instructions: exercise.instructions,
                                            })
                                        }
                                        type="button"
                                    >
                                        <Save size={18} />
                                        {savingKey === `exercise-${exercise.id}` ? 'Guardando...' : 'Guardar'}
                                    </button>
                                    <button
                                        className="ghost-button"
                                        onClick={() => void deleteExercise(exercise.id)}
                                        type="button"
                                    >
                                        <Trash2 size={18} /> Eliminar
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {filteredExercises.length === 0 ? (
                    <div className="empty-state section">No hay ejercicios para ese filtro.</div>
                ) : null}
            </section>}

            {activePanel === 'routines' && <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <h2 className="section-title">Rutinas y ejercicios</h2>
                    <div className="section-kicker">Edición compacta</div>
                </div>

                <section className="search-shell admin-routine-toolbar">
                    <label
                        className="search-input"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '20px 1fr',
                            gap: 12,
                            alignItems: 'center',
                        }}
                    >
                        <Search size={18} color="currentColor" />
                        <input
                            aria-label="Buscar rutina en admin"
                            className="search-input"
                            onChange={(event) => setRoutineSearch(event.target.value)}
                            placeholder="Buscar rutina por nombre, nivel o categoría"
                            style={{ padding: 0, border: 0, background: 'transparent' }}
                            value={routineSearch}
                        />
                    </label>

                    <div className="results-summary">
                        <span>{filteredRoutines.length} rutinas</span>
                        <span>Solo una abierta a la vez</span>
                    </div>
                </section>

                <div className="admin-record-list">
                    {filteredRoutines.map((routine) => {
                        const index = editableRoutines.findIndex((entry) => entry.id === routine.id)
                        const isExpanded = expandedRoutineId === routine.id
                        const routineDayOptions = getRoutineDayOptions(
                            routine.duration_text,
                            routine.routine_exercises,
                        )

                        return (
                            <div className="admin-record admin-record-large" key={routine.id}>
                                <button
                                    className={isExpanded ? 'admin-routine-summary is-open' : 'admin-routine-summary'}
                                    onClick={() => setExpandedRoutineId((current) => (current === routine.id ? null : routine.id))}
                                    type="button"
                                >
                                    <div className="admin-routine-summary-copy">
                                        <div className="section-kicker">{categories.find((category) => category.id === routine.category_id)?.name ?? 'Sin categoría'}</div>
                                        <h3 className="section-title admin-routine-title">{routine.title}</h3>
                                        {!isExpanded ? (
                                            <p className="metric-copy admin-routine-subtitle">
                                                {routine.subtitle || 'Sin texto visible todavía.'}
                                            </p>
                                        ) : null}
                                    </div>
                                    <div className="admin-routine-meta">
                                        <span className="mini-pill">{routine.level}</span>
                                        <span className="mini-pill">{routine.duration_text || 'Sin duración'}</span>
                                        {routine.routine_exercises.length > 0 ? (
                                            <span className="mini-pill">{routine.routine_exercises.length} ejercicios</span>
                                        ) : null}
                                        <span className={routine.is_published ? 'mini-pill admin-pill-live' : 'mini-pill'}>
                                            {routine.is_published ? 'Publicada' : 'Borrador'}
                                        </span>
                                        <span className="admin-routine-toggle" aria-hidden="true">
                                            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </span>
                                    </div>
                                </button>

                                {isExpanded ? (
                                    <div className="admin-routine-body">
                                        <div className="admin-record-grid">
                                            <input
                                                className="data-input"
                                                onChange={(event) =>
                                                    setEditableRoutines((current) => {
                                                        const next = [...current]
                                                        next[index] = { ...next[index], title: event.target.value }
                                                        return next
                                                    })
                                                }
                                                value={routine.title}
                                            />
                                            <select
                                                className="search-select"
                                                onChange={(event) =>
                                                    setEditableRoutines((current) => {
                                                        const next = [...current]
                                                        next[index] = { ...next[index], category_id: event.target.value }
                                                        return next
                                                    })
                                                }
                                                value={routine.category_id}
                                            >
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <textarea
                                                className="data-textarea"
                                                onChange={(event) =>
                                                    setEditableRoutines((current) => {
                                                        const next = [...current]
                                                        next[index] = {
                                                            ...next[index],
                                                            subtitle: event.target.value,
                                                            goal: event.target.value,
                                                        }
                                                        return next
                                                    })
                                                }
                                                rows={4}
                                                value={getRoutineDescription(routine.subtitle, routine.goal)}
                                            />
                                            <div className="admin-two-columns">
                                                <select
                                                    className="search-select"
                                                    onChange={(event) =>
                                                        setEditableRoutines((current) => {
                                                            const next = [...current]
                                                            next[index] = {
                                                                ...next[index],
                                                                duration_text: event.target.value,
                                                            }
                                                            return next
                                                        })
                                                    }
                                                    value={normalizeRoutineDays(routine.duration_text)}
                                                >
                                                    {routineDayOptions.map((dayOption) => (
                                                        <option key={dayOption} value={dayOption}>
                                                            {dayOption}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="admin-two-columns">
                                                <select
                                                    className="search-select"
                                                    onChange={(event) =>
                                                        setEditableRoutines((current) => {
                                                            const next = [...current]
                                                            next[index] = { ...next[index], level: event.target.value }
                                                            return next
                                                        })
                                                    }
                                                    value={routine.level}
                                                >
                                                    {routineLevelOptions.map((level) => (
                                                        <option key={level} value={level}>
                                                            {level}
                                                        </option>
                                                    ))}
                                                </select>
                                                <label className="admin-toggle-row">
                                                    <input
                                                        checked={routine.is_published}
                                                        onChange={(event) =>
                                                            setEditableRoutines((current) => {
                                                                const next = [...current]
                                                                next[index] = {
                                                                    ...next[index],
                                                                    is_published: event.target.checked,
                                                                }
                                                                return next
                                                            })
                                                        }
                                                        type="checkbox"
                                                    />
                                                    Publicada
                                                </label>
                                            </div>
                                        </div>

                                        <div className="inline-actions admin-inline-actions">
                                            <button
                                                className="secondary-button"
                                                onClick={() => {
                                                    const description = getNormalizedRoutineDescription(routine.subtitle, routine.goal)

                                                    return void updateRoutine(routine.id, {
                                                        category_id: routine.category_id,
                                                        slug: slugify(routine.title),
                                                        title: routine.title,
                                                        subtitle: description,
                                                        goal: description,
                                                        duration_text: normalizeRoutineDays(routine.duration_text),
                                                        level: routine.level,
                                                        hero_gradient: routine.hero_gradient,
                                                        image_gradient: routine.image_gradient,
                                                        is_published: routine.is_published,
                                                    })
                                                }}
                                                type="button"
                                            >
                                                <Save size={18} />
                                                {savingKey === `routine-${routine.id}` ? 'Guardando...' : 'Guardar rutina'}
                                            </button>
                                            <button
                                                className="ghost-button"
                                                onClick={() => void deleteRoutine(routine.id)}
                                                type="button"
                                            >
                                                <Trash2 size={18} /> Eliminar rutina
                                            </button>
                                        </div>

                                        <div className="section">
                                            <div className="section-kicker">Ejercicios asignados</div>
                                            <div className="support-grid admin-block-list">
                                                {routineDayOptions.map((dayNumber) => {
                                                    const dayEntries = routine.routine_exercises.filter(
                                                        (routineExercise) => (routineExercise.day_number || 1) === dayNumber,
                                                    )

                                                    return (
                                                        <section className="admin-day-section" key={`${routine.id}-day-${dayNumber}`}>
                                                            <div className="admin-day-header">
                                                                <div>
                                                                    <div className="section-title admin-day-title">Día {dayNumber}</div>
                                                                    <div className="metric-copy">
                                                                        {dayEntries.length > 0
                                                                            ? `${dayEntries.length} ejercicios en este día`
                                                                            : 'Todavía sin ejercicios asignados'}
                                                                    </div>
                                                                </div>
                                                                <span className="mini-pill">Día {dayNumber}</span>
                                                            </div>

                                                            {dayEntries.length > 0 ? (
                                                                <div className="support-grid admin-block-list">
                                                                    {dayEntries.map((routineExercise) => {
                                                                        const entryIndex = routine.routine_exercises.findIndex(
                                                                            (currentEntry) => currentEntry.id === routineExercise.id,
                                                                        )

                                                                        return (
                                                                            <details className="admin-block-details" key={routineExercise.id}>
                                                                                <summary className="admin-block-summary">
                                                                                    <div>
                                                                                        <div className="card-title admin-block-title">Ejercicio {routineExercise.sort_order}</div>
                                                                                        <div className="metric-copy">
                                                                                            {routineExercise.exercises?.name ?? 'Ejercicio'} · {routineExercise.exercises?.muscle_group ?? 'Grupo'} · {routineExercise.sets} series
                                                                                        </div>
                                                                                    </div>
                                                                                </summary>

                                                                                <div className="admin-block-body">
                                                                                    <div className="admin-record-grid compact-grid">
                                                                                        <div>
                                                                                            <input
                                                                                                className="data-input"
                                                                                                list={`routine-exercise-options-${routineExercise.id}`}
                                                                                                onChange={(event) => {
                                                                                                    const nextQuery = event.target.value
                                                                                                    const matchedExercise = findExerciseFromQuery(nextQuery, exercises)

                                                                                                    setRoutineExerciseSearch((current) => ({
                                                                                                        ...current,
                                                                                                        [routineExercise.id]: nextQuery,
                                                                                                    }))

                                                                                                    setEditableRoutines((current) => {
                                                                                                        const next = [...current]
                                                                                                        const routineExercises = [...next[index].routine_exercises]
                                                                                                        routineExercises[entryIndex] = {
                                                                                                            ...routineExercises[entryIndex],
                                                                                                            exercise_id:
                                                                                                                matchedExercise?.id ?? routineExercises[entryIndex].exercise_id,
                                                                                                            exercises: matchedExercise
                                                                                                                ? {
                                                                                                                    name: matchedExercise.name,
                                                                                                                    muscle_group: matchedExercise.muscle_group,
                                                                                                                }
                                                                                                                : routineExercises[entryIndex].exercises,
                                                                                                        }
                                                                                                        next[index] = {
                                                                                                            ...next[index],
                                                                                                            routine_exercises: routineExercises,
                                                                                                        }
                                                                                                        return next
                                                                                                    })
                                                                                                }}
                                                                                                placeholder="Busca ejercicio"
                                                                                                value={
                                                                                                    routineExerciseSearch[routineExercise.id] ??
                                                                                                    getExerciseOptionLabel({
                                                                                                        name: routineExercise.exercises?.name ?? 'Ejercicio',
                                                                                                        muscle_group: routineExercise.exercises?.muscle_group ?? 'Grupo',
                                                                                                    })
                                                                                                }
                                                                                            />
                                                                                            <datalist id={`routine-exercise-options-${routineExercise.id}`}>
                                                                                                {getSuggestedExercises(
                                                                                                    routineExerciseSearch[routineExercise.id] ?? routineExercise.exercises?.name ?? '',
                                                                                                    exercises,
                                                                                                ).map((exercise) => (
                                                                                                    <option
                                                                                                        key={exercise.id}
                                                                                                        value={getExerciseOptionLabel(exercise)}
                                                                                                    />
                                                                                                ))}
                                                                                            </datalist>
                                                                                        </div>
                                                                                        <select
                                                                                            className="search-select"
                                                                                            onChange={(event) =>
                                                                                                setEditableRoutines((current) => {
                                                                                                    const next = [...current]
                                                                                                    const routineExercises = [...next[index].routine_exercises]
                                                                                                    routineExercises[entryIndex] = {
                                                                                                        ...routineExercises[entryIndex],
                                                                                                        day_number: Number(event.target.value),
                                                                                                    }
                                                                                                    next[index] = {
                                                                                                        ...next[index],
                                                                                                        routine_exercises: routineExercises,
                                                                                                    }
                                                                                                    return next
                                                                                                })
                                                                                            }
                                                                                            value={routineExercise.day_number || 1}
                                                                                        >
                                                                                            {routineDayOptions.map((optionDay) => (
                                                                                                <option key={optionDay} value={optionDay}>
                                                                                                    Día {optionDay}
                                                                                                </option>
                                                                                            ))}
                                                                                        </select>
                                                                                        <input
                                                                                            className="data-input"
                                                                                            inputMode="numeric"
                                                                                            onChange={(event) =>
                                                                                                setEditableRoutines((current) => {
                                                                                                    const next = [...current]
                                                                                                    const routineExercises = [...next[index].routine_exercises]
                                                                                                    routineExercises[entryIndex] = {
                                                                                                        ...routineExercises[entryIndex],
                                                                                                        sets: Number(event.target.value || 1),
                                                                                                    }
                                                                                                    next[index] = {
                                                                                                        ...next[index],
                                                                                                        routine_exercises: routineExercises,
                                                                                                    }
                                                                                                    return next
                                                                                                })
                                                                                            }
                                                                                            type="number"
                                                                                            value={routineExercise.sets}
                                                                                        />
                                                                                        <textarea
                                                                                            className="data-textarea"
                                                                                            onChange={(event) =>
                                                                                                setEditableRoutines((current) => {
                                                                                                    const next = [...current]
                                                                                                    const routineExercises = [...next[index].routine_exercises]
                                                                                                    routineExercises[entryIndex] = {
                                                                                                        ...routineExercises[entryIndex],
                                                                                                        target: event.target.value,
                                                                                                        notes: event.target.value,
                                                                                                    }
                                                                                                    next[index] = {
                                                                                                        ...next[index],
                                                                                                        routine_exercises: routineExercises,
                                                                                                    }
                                                                                                    return next
                                                                                                })
                                                                                            }
                                                                                            placeholder="Texto del ejercicio"
                                                                                            rows={3}
                                                                                            value={getExerciseDescription(routineExercise.target, routineExercise.notes)}
                                                                                        />
                                                                                    </div>

                                                                                    <div className="inline-actions admin-inline-actions">
                                                                                        <button
                                                                                            className="secondary-button"
                                                                                            onClick={() => {
                                                                                                const description = getNormalizedExerciseDescription(routineExercise.target, routineExercise.notes)

                                                                                                return void updateRoutineExercise(routineExercise.id, {
                                                                                                    routine_id: routineExercise.routine_id,
                                                                                                    exercise_id: routineExercise.exercise_id,
                                                                                                    day_number: routineExercise.day_number || 1,
                                                                                                    sort_order: routineExercise.sort_order,
                                                                                                    sets: routineExercise.sets,
                                                                                                    target: description,
                                                                                                    metric: routineExercise.metric,
                                                                                                    notes: description,
                                                                                                })
                                                                                            }}
                                                                                            type="button"
                                                                                        >
                                                                                            <Save size={18} /> Guardar ejercicio
                                                                                        </button>
                                                                                        <button
                                                                                            className="ghost-button"
                                                                                            onClick={() => void deleteRoutineExercise(routineExercise.id)}
                                                                                            type="button"
                                                                                        >
                                                                                            <Trash2 size={18} /> Eliminar ejercicio
                                                                                        </button>
                                                                                    </div>
                                                                                </div>
                                                                            </details>
                                                                        )
                                                                    })}
                                                                </div>
                                                            ) : (
                                                                <div className="empty-state compact-state">Este día todavía no tiene ejercicios.</div>
                                                            )}
                                                        </section>
                                                    )
                                                })}
                                            </div>

                                            <div className="admin-subsection">
                                                <div className="section-kicker">Añadir ejercicio</div>
                                                <div className="admin-record-grid compact-grid">
                                                    <div>
                                                        <input
                                                            className="data-input"
                                                            list={`routine-draft-options-${routine.id}`}
                                                            onChange={(event) => {
                                                                const nextQuery = event.target.value
                                                                const matchedExercise = findExerciseFromQuery(nextQuery, exercises)

                                                                setRoutineExerciseDrafts((current) => ({
                                                                    ...current,
                                                                    [routine.id]: {
                                                                        ...(current[routine.id] ??
                                                                            buildRoutineExerciseDraft(
                                                                                routine.id,
                                                                                routine.routine_exercises.length + 1,
                                                                            )),
                                                                        exercise_query: nextQuery,
                                                                        exercise_id: matchedExercise?.id ?? current[routine.id]?.exercise_id ?? '',
                                                                    },
                                                                }))
                                                            }}
                                                            placeholder="Busca ejercicio"
                                                            value={routineExerciseDrafts[routine.id]?.exercise_query ?? ''}
                                                        />
                                                        <datalist id={`routine-draft-options-${routine.id}`}>
                                                            {getSuggestedExercises(
                                                                routineExerciseDrafts[routine.id]?.exercise_query ?? '',
                                                                exercises,
                                                            ).map((exercise) => (
                                                                <option key={exercise.id} value={getExerciseOptionLabel(exercise)} />
                                                            ))}
                                                        </datalist>
                                                    </div>
                                                    <select
                                                        className="search-select"
                                                        onChange={(event) =>
                                                            setRoutineExerciseDrafts((current) => ({
                                                                ...current,
                                                                [routine.id]: {
                                                                    ...(current[routine.id] ??
                                                                        buildRoutineExerciseDraft(
                                                                            routine.id,
                                                                            routine.routine_exercises.length + 1,
                                                                        )),
                                                                    day_number: Number(event.target.value),
                                                                },
                                                            }))
                                                        }
                                                        value={routineExerciseDrafts[routine.id]?.day_number ?? 1}
                                                    >
                                                        {routineDayOptions.map((dayNumber) => (
                                                            <option key={dayNumber} value={dayNumber}>
                                                                Día {dayNumber}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        className="data-input"
                                                        inputMode="numeric"
                                                        onChange={(event) =>
                                                            setRoutineExerciseDrafts((current) => ({
                                                                ...current,
                                                                [routine.id]: {
                                                                    ...(current[routine.id] ??
                                                                        buildRoutineExerciseDraft(
                                                                            routine.id,
                                                                            routine.routine_exercises.length + 1,
                                                                        )),
                                                                    sets: Number(event.target.value || 1),
                                                                },
                                                            }))
                                                        }
                                                        type="number"
                                                        value={routineExerciseDrafts[routine.id]?.sets ?? 3}
                                                    />
                                                    <textarea
                                                        className="data-textarea"
                                                        onChange={(event) =>
                                                            setRoutineExerciseDrafts((current) => ({
                                                                ...current,
                                                                [routine.id]: {
                                                                    ...(current[routine.id] ??
                                                                        buildRoutineExerciseDraft(
                                                                            routine.id,
                                                                            routine.routine_exercises.length + 1,
                                                                        )),
                                                                    target: event.target.value,
                                                                    notes: event.target.value,
                                                                },
                                                            }))
                                                        }
                                                        placeholder="Texto del ejercicio"
                                                        rows={3}
                                                        value={getExerciseDescription(
                                                            routineExerciseDrafts[routine.id]?.target ?? '',
                                                            routineExerciseDrafts[routine.id]?.notes ?? '',
                                                        )}
                                                    />
                                                </div>
                                                <div className="inline-actions admin-inline-actions">
                                                    <button
                                                        className="primary-button"
                                                        onClick={async () => {
                                                            const draft =
                                                                routineExerciseDrafts[routine.id] ??
                                                                buildRoutineExerciseDraft(
                                                                    routine.id,
                                                                    routine.routine_exercises.length + 1,
                                                                )
                                                            const description = getNormalizedExerciseDescription(draft.target, draft.notes)

                                                            if (!draft.exercise_id || !description) {
                                                                return
                                                            }

                                                            const nextError = await createRoutineExercise({
                                                                routine_id: draft.routine_id,
                                                                exercise_id: draft.exercise_id,
                                                                day_number: draft.day_number || 1,
                                                                sets: draft.sets,
                                                                target: description,
                                                                metric: draft.metric,
                                                                notes: description,
                                                                sort_order: routine.routine_exercises.length + 1,
                                                            })

                                                            if (!nextError) {
                                                                setRoutineExerciseDrafts((current) => ({
                                                                    ...current,
                                                                    [routine.id]: buildRoutineExerciseDraft(
                                                                        routine.id,
                                                                        routine.routine_exercises.length + 2,
                                                                    ),
                                                                }))
                                                            }
                                                        }}
                                                        type="button"
                                                    >
                                                        <Plus size={18} /> Añadir ejercicio
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        )
                    })}
                </div>

                {filteredRoutines.length === 0 ? (
                    <div className="empty-state section">Todavía no hay rutinas creadas en el panel.</div>
                ) : null}
            </section>}

            {activePanel === 'routines' && (
                <section className="admin-grid section">
                    <article className="admin-card">
                        <div className="section-kicker">Constructor de rutinas</div>
                        <h2 className="section-title">Nueva rutina</h2>
                        <div className="form-grid">
                            <input
                                className="data-input"
                                onChange={(event) =>
                                    setRoutineDraft((current) => ({
                                        ...current,
                                        title: event.target.value,
                                    }))
                                }
                                placeholder="Nombre de la rutina"
                                value={routineDraft.title}
                            />
                            <select
                                className="search-select"
                                onChange={(event) =>
                                    setRoutineDraft((current) => ({ ...current, category_id: event.target.value }))
                                }
                                value={routineDraft.category_id}
                            >
                                <option value="">Selecciona categoría</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            <textarea
                                className="data-textarea"
                                onChange={(event) =>
                                    setRoutineDraft((current) => ({
                                        ...current,
                                        subtitle: event.target.value,
                                        goal: event.target.value,
                                    }))
                                }
                                placeholder="Texto visible de la rutina"
                                rows={4}
                                value={getRoutineDescription(routineDraft.subtitle, routineDraft.goal)}
                            />
                            <div className="admin-two-columns">
                                <select
                                    className="search-select"
                                    onChange={(event) =>
                                        setRoutineDraft((current) => ({ ...current, duration_text: event.target.value }))
                                    }
                                    value={normalizeRoutineDays(routineDraft.duration_text)}
                                >
                                    {routineDayOptions.map((dayOption) => (
                                        <option key={dayOption} value={dayOption}>
                                            {dayOption}
                                        </option>
                                    ))}
                                </select>
                                <select
                                    className="search-select"
                                    onChange={(event) =>
                                        setRoutineDraft((current) => ({ ...current, level: event.target.value }))
                                    }
                                    value={routineDraft.level}
                                >
                                    {routineLevelOptions.map((level) => (
                                        <option key={level} value={level}>
                                            {level}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <label className="admin-toggle-row">
                                <input
                                    checked={routineDraft.is_published}
                                    onChange={(event) =>
                                        setRoutineDraft((current) => ({ ...current, is_published: event.target.checked }))
                                    }
                                    type="checkbox"
                                />
                                Publicada
                            </label>
                            <div className="inline-actions">
                                <button className="primary-button" onClick={() => void handleCreateRoutine()} type="button">
                                    <FolderKanban size={18} /> Crear rutina
                                </button>
                            </div>
                        </div>
                    </article>
                </section>
            )}

            {activePanel === 'overview' && <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <h2 className="section-title">Vista rápida</h2>
                    <div className="section-kicker">Estado actual</div>
                </div>

                {routines.filter((routine) => routine.is_published).length > 0 ? (
                    <div className="support-grid">
                        {routines
                            .filter((routine) => routine.is_published)
                            .map((routine) => (
                                <div className="support-item" key={routine.id}>
                                    <div>
                                        <div>{routine.title}</div>
                                        <div className="metric-copy">
                                            {categories.find((category) => category.id === routine.category_id)?.name ?? 'Sin categoría'} · {routine.duration_text} · {routine.level}
                                        </div>
                                    </div>
                                    <Users size={18} color="currentColor" />
                                </div>
                            ))}
                    </div>
                ) : (
                    <div className="empty-state">No hay rutinas activas visibles ahora mismo.</div>
                )}
            </section>}
        </main>
    )
}