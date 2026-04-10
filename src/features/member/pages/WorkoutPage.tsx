import { Award, Check, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { usePublicCatalog } from '../hooks/usePublicCatalog'
import { useRoutineProgress } from '../state/localProgress'

function getRoutineDayCount(duration: string, exerciseDays: number[]) {
    const parsedDurationDays = Number(duration.match(/[1-7]/)?.[0] ?? '1')
    const maxExerciseDay = exerciseDays.length > 0 ? Math.max(...exerciseDays) : 1

    return Math.max(parsedDurationDays, maxExerciseDay, 1)
}

export function WorkoutPage() {
    const { slug } = useParams()
    const [searchParams, setSearchParams] = useSearchParams()
    const { loading, routines } = usePublicCatalog()
    const routine = routines.find((entry) => entry.slug === slug) ?? null
    const { progress, resetProgress, toggleCompleted, togglePr, updateValue } = useRoutineProgress(routine)
    const [recentPrKey, setRecentPrKey] = useState('')
    const [prFeedbackMessage, setPrFeedbackMessage] = useState('')
    const prFeedbackTimeoutRef = useRef<number | null>(null)

    useEffect(() => {
        return () => {
            if (prFeedbackTimeoutRef.current) {
                window.clearTimeout(prFeedbackTimeoutRef.current)
            }
        }
    }, [])

    if (loading && !routine) {
        return (
            <main>
                <div className="empty-state">Cargando rutina...</div>
            </main>
        )
    }

    if (!routine) {
        return (
            <main>
                <div className="empty-state">
                    La rutina no existe o todavía no está publicada.
                </div>
            </main>
        )
    }

    const exerciseDays = routine.exercises.map((exercise) => exercise.day ?? 1)
    const totalDays = getRoutineDayCount(routine.duration, exerciseDays)
    const availableDays = Array.from({ length: totalDays }, (_, index) => index + 1)
    const selectedDayParam = Number(searchParams.get('day'))
    const activeDay =
        totalDays === 1
            ? 1
            : availableDays.includes(selectedDayParam)
                ? selectedDayParam
                : null
    const visibleExercises = routine.exercises.filter((exercise) => (exercise.day ?? 1) === (activeDay ?? 1))
    const totalSets = visibleExercises.reduce((accumulator, exercise) => accumulator + exercise.sets, 0)
    const completedSets = visibleExercises.reduce((accumulator, exercise) => {
        const entry = progress[exercise.id]

        return accumulator + (entry?.completed.filter(Boolean).length ?? 0)
    }, 0)
    const progressPercentage = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0

    const handleSelectDay = (day: number) => {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.set('day', String(day))
        setSearchParams(nextParams, { replace: true })
    }

    const handleClearDay = () => {
        const nextParams = new URLSearchParams(searchParams)
        nextParams.delete('day')
        setSearchParams(nextParams, { replace: true })
    }

    const handleSavePr = (exerciseId: string, setIndex: number, exerciseName: string) => {
        const saved = togglePr(exerciseId, setIndex)

        if (!saved) {
            return
        }

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(35)
        }

        const key = `${exerciseId}-${setIndex}`
        setRecentPrKey(key)
        setPrFeedbackMessage(`PR guardado en ${exerciseName} · serie ${setIndex + 1}`)

        if (prFeedbackTimeoutRef.current) {
            window.clearTimeout(prFeedbackTimeoutRef.current)
        }

        prFeedbackTimeoutRef.current = window.setTimeout(() => {
            setRecentPrKey('')
            setPrFeedbackMessage('')
        }, 1400)
    }

    return (
        <main>
            <div className="eyebrow">Rutina activa</div>
            <h1 className="hero-title">
                {routine.title.split(' ').slice(0, 2).join(' ')}{' '}
                <span className="accent-text">{routine.title.split(' ').slice(2).join(' ')}</span>
            </h1>
            <div className="workout-meta">
                <span>{routine.category}</span>
                <span>{routine.duration}</span>
                <span>{routine.level}</span>
            </div>

            {totalDays > 1 ? (
                <section className="section panel">
                    <div className="topbar" style={{ marginBottom: 14 }}>
                        <div>
                            <div className="section-kicker">Rutina multidía</div>
                            <div className="section-title">
                                {activeDay ? `Día ${activeDay} seleccionado` : 'Elige qué día quieres empezar'}
                            </div>
                        </div>
                        {activeDay ? (
                            <button className="secondary-button" onClick={handleClearDay} type="button">
                                Ver todos los días
                            </button>
                        ) : null}
                    </div>

                    {routine.subtitle ? (
                        <div className="workout-description-shell">
                            <p className="hero-copy workout-description">{routine.subtitle}</p>
                        </div>
                    ) : null}

                    <div className="support-grid day-picker-grid">
                        {availableDays.map((day) => {
                            const dayExercises = routine.exercises.filter((exercise) => (exercise.day ?? 1) === day)

                            return (
                                <button
                                    className={activeDay === day ? 'support-item day-picker-button is-active' : 'support-item day-picker-button'}
                                    key={day}
                                    onClick={() => handleSelectDay(day)}
                                    type="button"
                                >
                                    <div>
                                        <div>Día {day}</div>
                                        <div className="metric-copy">
                                            {dayExercises.length > 0
                                                ? `${dayExercises.length} ejercicios listos`
                                                : 'Todavía sin ejercicios asignados'}
                                        </div>
                                    </div>
                                    <span className="mini-pill">Empezar</span>
                                </button>
                            )
                        })}
                    </div>
                </section>
            ) : null}

            {totalDays > 1 && !activeDay ? (
                <div className="hero-actions">
                    <Link className="secondary-button" to="/explorer">
                        Volver al explorador
                    </Link>
                </div>
            ) : null}

            {(totalDays === 1 || activeDay) ? (
                <section className="panel progress-shell">
                    <div className="topbar" style={{ marginBottom: 0 }}>
                        <div>
                            <div className="section-kicker">Progreso local</div>
                            <div className="section-title">{progressPercentage}% completado</div>
                        </div>
                        <button className="icon-button" onClick={resetProgress} type="button" aria-label="Reiniciar progreso">
                            <RotateCcw size={16} />
                        </button>
                    </div>
                    <div className="progress-bar">
                        <span style={{ width: `${progressPercentage}%` }} />
                    </div>
                    <p className="metric-copy">
                        {completedSets} de {totalSets} series marcadas en este dispositivo.
                    </p>
                </section>
            ) : null}

            {(totalDays === 1 || activeDay) ? (
                <section className="exercise-list">
                    <div className="sr-only" aria-live="polite">
                        {prFeedbackMessage}
                    </div>
                    {visibleExercises.length > 0 ? visibleExercises.map((exercise) => (
                        <article className="exercise-card" key={exercise.id}>
                            <div className="exercise-head">
                                <div className="exercise-badge">{exercise.sets}x</div>
                                <div>
                                    <h2 className="section-title">{exercise.name}</h2>
                                    {exercise.muscleGroup ? (
                                        <div className="badge-row">
                                            <span className="mini-pill">{exercise.muscleGroup}</span>
                                        </div>
                                    ) : null}
                                    {exercise.notes ? <p className="exercise-note">{exercise.notes}</p> : null}
                                </div>
                            </div>

                            <div className="exercise-table">
                                {Array.from({ length: exercise.sets }, (_, setIndex) => {
                                    const entry = progress[exercise.id] ?? {
                                        values: Array.from({ length: exercise.sets }, () => ''),
                                        completed: Array.from({ length: exercise.sets }, () => false),
                                        prs: Array.from({ length: exercise.sets }, () => false),
                                    }
                                    const isCompleted = entry.completed[setIndex]
                                    const hasValue = entry.values[setIndex]?.trim().length > 0
                                    const prKey = `${exercise.id}-${setIndex}`
                                    const isPrSaved = recentPrKey === prKey

                                    return (
                                        <div className="exercise-row" key={`${exercise.id}-${setIndex}`}>
                                            <div className="set-index">{setIndex + 1}</div>
                                            <input
                                                aria-label={`${exercise.name} serie ${setIndex + 1}`}
                                                className="data-input"
                                                onChange={(event) =>
                                                    updateValue(exercise.id, setIndex, event.target.value)
                                                }
                                                placeholder="Tu marca"
                                                value={entry.values[setIndex]}
                                            />
                                            <button
                                                aria-label={`Marcar ${exercise.name} serie ${setIndex + 1} como récord personal`}
                                                className={isPrSaved ? 'set-pr is-saved' : 'set-pr'}
                                                disabled={!hasValue}
                                                onClick={() => handleSavePr(exercise.id, setIndex, exercise.name)}
                                                type="button"
                                            >
                                                <Award size={16} />
                                                <span>{isPrSaved ? 'Guardado' : 'PR'}</span>
                                            </button>
                                            <button
                                                className={isCompleted ? 'set-check is-complete' : 'set-check'}
                                                onClick={() => toggleCompleted(exercise.id, setIndex)}
                                                type="button"
                                            >
                                                <Check size={18} />
                                            </button>
                                        </div>
                                    )
                                })}
                            </div>
                        </article>
                    )) : (
                        <div className="empty-state">Este día todavía no tiene ejercicios asignados.</div>
                    )}
                </section>
            ) : null}

            {totalDays === 1 || activeDay ? (
                <div className="hero-actions">
                    <Link className="secondary-button" to="/explorer">
                        Volver al explorador
                    </Link>
                </div>
            ) : null}
        </main>
    )
}