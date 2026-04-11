import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Routine } from '../../../data/mock'

type RoutineCardProps = {
    routine: Routine
    isFavorite: boolean
    onToggleFavorite: (slug: string) => void
}

export function RoutineCard({ routine, isFavorite, onToggleFavorite }: RoutineCardProps) {
    return (
        <article
            className="routine-card"
            style={{ ['--hero-gradient' as string]: routine.heroGradient }}
        >
            <div className="routine-card-content">
                <div className="routine-card-head">
                    <div className="badge-row">
                        <span className="mini-pill">{routine.category}</span>
                        <span className="mini-pill">{routine.level}</span>
                    </div>
                    <button
                        aria-label={isFavorite ? `Quitar ${routine.title} de Mis rutinas` : `Guardar ${routine.title} en Mis rutinas`}
                        aria-pressed={isFavorite}
                        className={isFavorite ? 'routine-favorite-button is-active' : 'routine-favorite-button'}
                        onClick={() => onToggleFavorite(routine.slug)}
                        type="button"
                    >
                        <Heart fill={isFavorite ? 'currentColor' : 'none'} size={18} />
                    </button>
                </div>
                <h2 className="card-title">{routine.title}</h2>
                <div className="routine-meta">
                    <span>{routine.duration}</span>
                    {routine.goal ? <span>{routine.goal}</span> : null}
                </div>
                <p className="card-copy">{routine.subtitle}</p>
                <div className="card-footer">
                    <Link className="ghost-button" to={`/routine/${routine.slug}`}>
                        Empezar
                    </Link>
                </div>
            </div>
        </article>
    )
}