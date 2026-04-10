import { Search } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePublicCatalog } from '../hooks/usePublicCatalog'

export function ExplorerPage() {
    const { categories, loading, routines } = usePublicCatalog()
    const [searchParams, setSearchParams] = useSearchParams()
    const initialCategory = searchParams.get('category') || 'Todas'
    const initialSearch = searchParams.get('q') || ''
    const [selectedCategory, setSelectedCategory] = useState(initialCategory)
    const [search, setSearch] = useState(initialSearch)
    const deferredSearch = useDeferredValue(search)
    const normalizedSearch = deferredSearch.trim().toLowerCase()

    useEffect(() => {
        const nextParams = new URLSearchParams()

        if (selectedCategory !== 'Todas') {
            nextParams.set('category', selectedCategory)
        }

        if (search.trim()) {
            nextParams.set('q', search.trim())
        }

        setSearchParams(nextParams, { replace: true })
    }, [search, selectedCategory, setSearchParams])

    const filteredRoutines = routines.filter((routine) => {
        const matchesCategory =
            selectedCategory === 'Todas' || routine.category === selectedCategory
        const matchesSearch =
            normalizedSearch.length === 0 ||
            routine.title.toLowerCase().includes(normalizedSearch)

        return matchesCategory && matchesSearch
    })

    return (
        <main>
            <div className="eyebrow">Explorador de rutinas</div>
            <h1 className="hero-title">
                Encuentra tu <span className="accent-text">rutina</span>
            </h1>
            <p className="hero-copy">
                Descubre rutinas para fuerza, pérdida de peso, funcional, hyrox y más objetivos,
                todas supervisadas por profesionales para entrenar con confianza.
            </p>

            {loading && <p className="metric-copy">Sincronizando catálogo...</p>}

            <section className="search-shell">
                <div className="explorer-search-card">
                    <div className="section-kicker">Encuentra tu rutina por nombre o por objetivo</div>

                    <label className="search-input-shell">
                        <Search size={18} color="currentColor" />
                        <input
                            aria-label="Buscar rutina por nombre"
                            className="search-input-field"
                            onChange={(event) => {
                                const nextValue = event.target.value
                                startTransition(() => setSearch(nextValue))
                            }}
                            placeholder="Ejemplo: pecho, fuerza, mujer..."
                            value={search}
                        />
                    </label>

                    <div className="category-grid" role="tablist" aria-label="Categorías">
                        {categories.map((category) => (
                            <button
                                key={category}
                                className={
                                    category === selectedCategory
                                        ? 'category-chip active'
                                        : 'category-chip'
                                }
                                onClick={() => setSelectedCategory(category)}
                                type="button"
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="results-summary">
                        <span>{filteredRoutines.length} rutinas visibles</span>
                        <span>
                            {selectedCategory === 'Todas' ? 'Todas las categorías' : selectedCategory}
                        </span>
                    </div>
                </div>
            </section>

            <section className="routine-grid">
                {filteredRoutines.length > 0 ? (
                    filteredRoutines.map((routine) => (
                        <article
                            className="routine-card"
                            key={routine.id}
                            style={{ ['--hero-gradient' as string]: routine.heroGradient }}
                        >
                            <div className="routine-card-content">
                                <div className="badge-row">
                                    <span className="mini-pill">{routine.category}</span>
                                    <span className="mini-pill">{routine.level}</span>
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
                    ))
                ) : (
                    <div className="empty-state">
                        No hay rutinas para ese filtro. Prueba otra categoría o limpia la
                        búsqueda.
                    </div>
                )}
            </section>
        </main>
    )
}