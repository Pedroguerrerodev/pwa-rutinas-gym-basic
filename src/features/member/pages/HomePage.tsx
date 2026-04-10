import {
    ArrowRight,
    BarChart3,
    Download,
    MonitorSmartphone,
    Orbit,
    Share,
    Smartphone,
    SquareStack,
    Target,
    TimerReset,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { quickLinks } from '../../../data/mock'
import { usePublicCatalog } from '../hooks/usePublicCatalog'

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function detectDevice() {
    if (typeof window === 'undefined') {
        return 'unknown'
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIos = /iphone|ipad|ipod/.test(userAgent)
    const isAndroid = /android/.test(userAgent)

    if (isIos) {
        return 'ios'
    }

    if (isAndroid) {
        return 'android'
    }

    return 'desktop'
}

function isStandaloneMode() {
    if (typeof window === 'undefined') {
        return false
    }

    const iosNavigator = window.navigator as Navigator & { standalone?: boolean }

    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        iosNavigator.standalone === true
    )
}

export function HomePage() {
    const { categories, routines } = usePublicCatalog()
    const featuredRoutine = routines[0]
    const highlightedCategories = categories.filter((category) => category !== 'Todas').slice(0, 4)
    const fastStartRoutines = routines.slice(0, 3)
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode())
    const [showInstructions, setShowInstructions] = useState(false)
    const device = useMemo(() => detectDevice(), [])

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setInstallPrompt(event as BeforeInstallPromptEvent)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setInstallPrompt(null)
            setShowInstructions(false)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [])

    const handleInstall = async () => {
        if (!installPrompt) {
            setShowInstructions(true)
            return
        }

        await installPrompt.prompt()
        const choice = await installPrompt.userChoice

        if (choice.outcome === 'accepted') {
            setInstallPrompt(null)
        }
    }

    const installTitle = isInstalled
        ? 'App instalada'
        : device === 'ios'
            ? 'Instala KINETIC en iPhone'
            : device === 'android'
                ? 'Instala KINETIC en Android'
                : 'Instala KINETIC en tu dispositivo'

    const installCopy = isInstalled
        ? 'Ya puedes abrir KINETIC como si fuera una app nativa desde tu pantalla de inicio.'
        : device === 'ios'
            ? 'Safari no muestra un botón nativo de instalación. Usa Compartir y luego Añadir a pantalla de inicio.'
            : installPrompt
                ? 'Este navegador ya permite instalar la app. Hazlo ahora para abrir las rutinas como una app real.'
                : 'Si no aparece el prompt automático, abre el menú del navegador y añade la app a la pantalla de inicio.'

    const installSteps =
        device === 'ios'
            ? [
                'Abre KINETIC en Safari.',
                'Pulsa el botón Compartir.',
                'Toca Añadir a pantalla de inicio.',
            ]
            : device === 'android'
                ? [
                    'Abre KINETIC en Chrome.',
                    'Pulsa Instalar si aparece el aviso.',
                    'Si no aparece, abre el menú y pulsa Instalar app o Añadir a pantalla de inicio.',
                ]
                : [
                    'Abre KINETIC desde un navegador compatible.',
                    'Busca Instalar app en la barra o en el menú.',
                    'Después abre la app desde el escritorio o el launcher.',
                ]

    return (
        <main>
            <div className="eyebrow">Sin registro, empieza ahora</div>
            <h1 className="hero-title">
                Supera tus <span className="accent-text">límites</span> hoy
            </h1>
            <p className="hero-copy">
                Rutinas actualizadas en tiempo real, progreso guardado en tu móvil y
                acceso inmediato desde el QR del gym.
            </p>

            {featuredRoutine ? (
                <div
                    className="hero-card"
                    style={{
                        ['--hero-gradient' as string]: featuredRoutine.heroGradient,
                        ['--image-gradient' as string]: featuredRoutine.imageGradient,
                    }}
                >
                    <div className="hero-visual" />
                    <div className="hero-content">
                        <div className="badge-row">
                            <span className="mini-pill">Acceso inmediato</span>
                            <span className="mini-pill">{featuredRoutine.duration}</span>
                            <span className="mini-pill">{featuredRoutine.level}</span>
                            {isInstalled && <span className="mini-pill">Instalada</span>}
                        </div>
                        <h2 className="workout-title">{featuredRoutine.title}</h2>
                        <p className="hero-copy">{featuredRoutine.subtitle}</p>
                        <div className="hero-actions">
                            <Link className="primary-button" to={`/routine/${featuredRoutine.slug}`}>
                                Empezar ahora
                            </Link>
                            <Link className="secondary-button" to="/explorer">
                                Ver catálogo
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <section className="hero-card panel">
                    <div className="hero-content">
                        <div className="badge-row">
                            <span className="mini-pill">Catálogo vacío</span>
                            {isInstalled && <span className="mini-pill">Instalada</span>}
                        </div>
                        <h2 className="workout-title">Todavía no hay rutinas publicadas</h2>
                        <p className="hero-copy">
                            Cuando crees nuevas rutinas desde el portal admin y las publiques,
                            aparecerán aquí automáticamente.
                        </p>
                        <div className="hero-actions">
                            <Link className="secondary-button" to="/explorer">
                                Abrir catálogo
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <section className="section panel install-panel">
                <div className="install-head">
                    <div className="quick-link-icon install-icon">
                        {device === 'ios' ? <Share size={20} /> : <Download size={20} />}
                    </div>
                    <div>
                        <div className="section-kicker">Instalación PWA</div>
                        <h2 className="section-title">{installTitle}</h2>
                    </div>
                </div>

                <p className="body-copy">{installCopy}</p>

                <div className="hero-actions install-actions">
                    {!isInstalled && (
                        <button className="primary-button" onClick={() => void handleInstall()} type="button">
                            <Download size={18} />
                            {installPrompt ? 'Instalar ahora' : 'Ver cómo instalar'}
                        </button>
                    )}
                    <button
                        className="secondary-button"
                        onClick={() => setShowInstructions((current) => !current)}
                        type="button"
                    >
                        <MonitorSmartphone size={18} />
                        {showInstructions ? 'Ocultar pasos' : 'Pasos por dispositivo'}
                    </button>
                </div>

                {(showInstructions || device === 'ios' || !installPrompt) && !isInstalled && (
                    <div className="install-guide">
                        <div className="install-device-pill">
                            <Smartphone size={16} />
                            {device === 'ios'
                                ? 'iPhone / iPad'
                                : device === 'android'
                                    ? 'Android'
                                    : 'Escritorio / otro dispositivo'}
                        </div>

                        <div className="install-steps">
                            {installSteps.map((step) => (
                                <div className="install-step" key={step}>
                                    <span className="install-step-dot" />
                                    <span>{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <section className="section panel">
                <div className="section-title">Entrena sin cuentas</div>
                <div className="quick-links">
                    {quickLinks.map((item, index) => (
                        <article className="quick-link" key={item.title}>
                            <div className="quick-link-icon">
                                {index === 0 && <ArrowRight size={20} />}
                                {index === 1 && <TimerReset size={20} />}
                                {index === 2 && <BarChart3 size={20} />}
                            </div>
                            <div>
                                <div>{item.title}</div>
                                <div className="metric-copy">{item.helper}</div>
                            </div>
                            <ArrowRight size={18} color="currentColor" />
                        </article>
                    ))}
                </div>
            </section>

            <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <h2 className="section-title">Empieza por objetivo</h2>
                    <Link className="section-kicker" to="/explorer">
                        Abrir catálogo
                    </Link>
                </div>

                {highlightedCategories.length > 0 ? (
                    <div className="launcher-grid">
                        {highlightedCategories.map((category, index) => (
                            <Link
                                className="launcher-card"
                                key={category}
                                to={`/explorer?category=${encodeURIComponent(category)}`}
                            >
                                <div className="metric-icon">
                                    {index === 0 && <Target size={22} />}
                                    {index === 1 && <SquareStack size={22} />}
                                    {index === 2 && <Orbit size={22} />}
                                    {index === 3 && <TimerReset size={22} />}
                                </div>
                                <div>
                                    <div className="card-title launcher-title">{category}</div>
                                    <div className="metric-copy">Filtra el catálogo al instante</div>
                                </div>
                                <ArrowRight size={18} color="currentColor" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">No hay categorías activas visibles todavía.</div>
                )}
            </section>

            <section className="section panel">
                <div className="topbar" style={{ marginBottom: 14 }}>
                    <h2 className="section-title">Listo para empezar</h2>
                    <Link className="section-kicker" to="/explorer">
                        Ver más
                    </Link>
                </div>

                {fastStartRoutines.length > 0 ? (
                    <div className="support-grid">
                        {fastStartRoutines.map((routine) => (
                            <Link
                                className="support-item support-item-link"
                                key={routine.id}
                                to={`/routine/${routine.slug}`}
                            >
                                <div>
                                    <div>{routine.title}</div>
                                    <div className="metric-copy">
                                        {routine.category} · {routine.duration} · {routine.level}
                                    </div>
                                </div>
                                <ArrowRight size={18} color="currentColor" />
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">
                        No hay rutinas visibles. Publica una desde admin para mostrarla al usuario.
                    </div>
                )}
            </section>
        </main>
    )
}