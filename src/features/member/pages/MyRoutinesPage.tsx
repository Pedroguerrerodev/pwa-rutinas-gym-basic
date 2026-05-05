import { Heart, LibraryBig } from 'lucide-react'
import { Link } from 'react-router-dom'
import { RoutineCard } from '../components/RoutineCard'
import { usePublicCatalog } from '../hooks/usePublicCatalog'
import { toggleFavoriteRoutine, useFavoriteRoutines } from '../state/favoriteRoutines'

export function MyRoutinesPage() {
    const { loading, routines } = usePublicCatalog()
    const favoriteSlugs = useFavoriteRoutines()
    const favoriteSlugOrder = new Map(favoriteSlugs.map((slug, index) => [slug, index]))
    const favoriteRoutines = routines
        .filter((routine) => favoriteSlugOrder.has(routine.slug))
        .sort((left, right) => (favoriteSlugOrder.get(left.slug) ?? 0) - (favoriteSlugOrder.get(right.slug) ?? 0))

    return (
        <main className="member-page member-favorites-page">
            <div className="eyebrow">Acceso rápido</div>
            <h1 className="hero-title">
                Mis <span className="accent-text">rutinas</span>
            </h1>
            <p className="hero-copy">
                Guarda tus rutinas favoritas para entrar a entrenar sin tener que buscarlas cada vez.
            </p>

            <section className="section panel">
                <div className="status-pill">
                    <Heart fill="currentColor" size={16} />
                    Favoritas guardadas en este dispositivo
                </div>
                <div className="support-grid">
                    <div className="support-item">
                        <span>Rutinas guardadas</span>
                        <strong>{favoriteRoutines.length}</strong>
                    </div>
                </div>
            </section>

            {loading ? <p className="metric-copy">Sincronizando tus rutinas guardadas...</p> : null}

            <section className="routine-grid">
                {favoriteRoutines.length > 0 ? (
                    favoriteRoutines.map((routine) => (
                        <RoutineCard
                            isFavorite={favoriteSlugs.includes(routine.slug)}
                            key={routine.id}
                            onToggleFavorite={toggleFavoriteRoutine}
                            routine={routine}
                        />
                    ))
                ) : (
                    <div className="empty-state favorite-empty-state">
                        <div className="favorite-empty-icon">
                            <LibraryBig size={22} />
                        </div>
                        <div className="favorite-empty-title">Todavía no tienes rutinas guardadas</div>
                        <p className="metric-copy favorite-empty-copy">
                            Ve a Explorar, guarda las que más uses y aparecerán aquí siempre listas para entrenar.
                        </p>
                        <Link className="primary-button" to="/explorer">
                            Explorar rutinas
                        </Link>
                    </div>
                )}
            </section>
        </main>
    )
}