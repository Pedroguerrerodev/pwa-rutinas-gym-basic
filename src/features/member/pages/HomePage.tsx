import {
    ArrowRight,
    ClipboardList,
    Download,
    CloudOff,
    Orbit,
    Search,
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

const progressHighlights = [
    {
        number: '01',
        title: 'Tus marcas se guardan',
        description:
            'Cada serie que completes se queda guardada en este dispositivo para que puedas retomar donde lo dejaste.',
        icon: Search,
    },
    {
        number: '02',
        title: 'Avanza a tu ritmo',
        description:
            'Marca tus series, apunta tu marca y consulta tu avance sin depender de cuentas ni registros externos.',
        icon: CloudOff,
    },
    {
        number: '03',
        title: 'Todo queda en tu móvil',
        description:
            'Tu progreso se guarda en tu propio móvil para que entrenes con continuidad cada vez que vuelvas a la app.',
        icon: ClipboardList,
    },
]

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
    const highlightedCategories = categories.filter((category) => category !== 'Todas').slice(0, 4)
    const fastStartRoutines = routines.slice(0, 3)
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(() => isStandaloneMode())
    const device = useMemo(() => detectDevice(), [])

    useEffect(() => {
        const handleBeforeInstallPrompt = (event: Event) => {
            event.preventDefault()
            setInstallPrompt(event as BeforeInstallPromptEvent)
        }

        const handleAppInstalled = () => {
            setIsInstalled(true)
            setInstallPrompt(null)
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
            ? 'Puedes poner KINETIC en la pantalla de inicio del iPhone directamente desde Safari, sin pasar por la App Store.'
            : installPrompt
                ? 'Puedes instalar KINETIC directamente desde el navegador, sin pasar por Play Store, y abrirla como una app más en tu móvil.'
                : 'Puedes instalar KINETIC directamente desde el navegador, sin pasar por la tienda, añadiéndola a la pantalla de inicio.'

    const installGuides = [
        {
            id: 'ios',
            label: 'iPhone / iPad',
            icon: <Share size={16} />,
            title: 'En iPhone o iPad con Safari',
            helper:
                'Si no te aparece ninguna ventana automática, hazlo tú en unos segundos desde Safari.',
            steps: [
                'Abre KINETIC en Safari.',
                'Toca Compartir, el botón del cuadrado con la flecha hacia arriba.',
                'Baja un poco y pulsa Añadir a la pantalla de inicio.',
                'Confirma y verás el icono en tu pantalla como si fuera una app normal.',
            ],
        },
        {
            id: 'android',
            label: 'Android',
            icon: <Smartphone size={16} />,
            title: 'En Android con Chrome',
            helper:
                'Si no salta la ventana de instalar, puedes hacerlo manualmente desde el menú del navegador.',
            steps: [
                'Abre KINETIC en Chrome.',
                'Toca los 3 puntos de la esquina superior derecha.',
                'Pulsa Añadir a pantalla de inicio o Instalar aplicación.',
                'Después toca Añadir para confirmar.',
                'El icono aparecerá en tu escritorio y la abrirás como una app más.',
            ],
        },
    ]

    return (
        <main>
            <div className="eyebrow">Sin registro, empieza ahora</div>
            <h1 className="hero-title">
                Supera tus <span className="accent-text">límites</span> hoy
            </h1>
            <p className="hero-copy">
                Instala la app en tu móvil y empieza a usar las rutinas del gym de la forma más
                rápida, clara y cómoda desde el primer acceso.
            </p>

            <section className="hero-card install-panel">
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
                            Instalar
                        </button>
                    )}
                </div>

                {!isInstalled && (
                    <>
                        <p className="metric-copy install-help">
                            No te ha saltado la ventana de instalar? Debajo te dejamos los pasos claros
                            para hacerlo manualmente.
                        </p>

                        <div className="install-guide">
                            <div className="install-guide-intro">
                                Puedes instalarla sin pasar por Play Store ni App Store. Solo necesitas abrir
                                la web y seguir estos pasos.
                            </div>

                            <div className="install-guide-grid">
                                {installGuides.map((guide) => (
                                    <section className="install-guide-card" key={guide.id}>
                                        <div className="install-device-pill">
                                            {guide.icon}
                                            {guide.label}
                                        </div>

                                        <h3 className="install-guide-title">{guide.title}</h3>
                                        <p className="metric-copy install-guide-helper">{guide.helper}</p>

                                        {guide.id === 'android' && (
                                            <div className="install-route">
                                                3 puntos {'>'} Añadir a pantalla de inicio
                                            </div>
                                        )}

                                        <div className="install-steps">
                                            {guide.steps.map((step) => (
                                                <div className="install-step" key={step}>
                                                    <span className="install-step-dot" />
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </section>

            <section className="step-list">
                {progressHighlights.map(({ number, title, description, icon: Icon }) => (
                    <article className="step-card" key={number}>
                        <div className="step-number">{number}</div>
                        <div className="quick-link-icon" style={{ marginBottom: 12 }}>
                            <Icon size={20} />
                        </div>
                        <h2 className="section-title">{title}</h2>
                        <p className="body-copy">{description}</p>
                    </article>
                ))}
            </section>

            <section className="section panel">
                <div className="section-title">Entrena sin cuentas</div>
                <div className="quick-links">
                    {quickLinks.map((item, index) => (
                        <article className="quick-link" key={item.title}>
                            <div className="quick-link-icon">
                                {index === 0 && <ArrowRight size={20} />}
                                {index === 1 && <TimerReset size={20} />}
                                {index === 2 && <TimerReset size={20} />}
                            </div>
                            <div>
                                <div>{item.title}</div>
                                <div className="metric-copy">{item.helper}</div>
                            </div>
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