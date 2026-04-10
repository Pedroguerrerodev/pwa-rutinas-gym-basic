import { ArrowLeft, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ADMIN_ROUTE } from '../../../app/routes'
import { useAdminAuth } from '../auth/AdminAuthContext'

export function AdminLoginPage() {
    const { isAdmin, isConfigured, loading, session, signIn, signOut } = useAdminAuth()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (loading) {
        return (
            <main>
                <div className="empty-state">Preparando acceso al panel del gym...</div>
            </main>
        )
    }

    if (session && isAdmin) {
        return <Navigate replace to={ADMIN_ROUTE} />
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setSubmitting(true)
        setError(null)

        const nextError = await signIn(email.trim(), password)

        setSubmitting(false)
        setError(nextError)
    }

    return (
        <main>
            <section className="hero-card admin-login-card">
                <div className="hero-visual" />
                <div className="hero-content">
                    <div className="status-pill">
                        <ShieldCheck size={16} /> Acceso del equipo
                    </div>
                    <h1 className="hero-title">
                        Panel de <span className="accent-text">gestión</span>
                    </h1>
                    <p className="hero-copy">
                        Accede para gestionar rutinas, ejercicios y categorías del gimnasio desde un solo lugar.
                    </p>

                    <form className="form-grid section" onSubmit={handleSubmit}>
                        <input
                            autoComplete="email"
                            className="data-input"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Email del equipo"
                            type="email"
                            value={email}
                        />
                        <input
                            autoComplete="current-password"
                            className="data-input"
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Contraseña"
                            type="password"
                            value={password}
                        />

                        {!isConfigured ? (
                            <div className="empty-state compact-state">
                                El acceso al panel no está disponible todavía en este entorno.
                            </div>
                        ) : null}

                        {error ? <div className="admin-feedback is-error">{error}</div> : null}
                        {session && !isAdmin ? (
                            <div className="admin-feedback is-error">
                                Esta cuenta no tiene acceso al panel de gestión.
                            </div>
                        ) : null}

                        <div className="inline-actions">
                            <button className="primary-button" disabled={submitting || !isConfigured} type="submit">
                                <LockKeyhole size={18} />
                                {submitting ? 'Entrando...' : 'Entrar al panel'}
                            </button>
                            {session && !isAdmin ? (
                                <button
                                    className="ghost-button"
                                    onClick={() => {
                                        void signOut()
                                    }}
                                    type="button"
                                >
                                    Salir de esta cuenta
                                </button>
                            ) : null}
                            <Link className="secondary-button" to="/">
                                <ArrowLeft size={18} /> Volver al inicio
                            </Link>
                        </div>
                    </form>

                    <div className="install-guide section">
                        <div className="section-kicker">Acceso interno</div>
                        <p className="metric-copy" style={{ marginBottom: 0 }}>
                            Usa una cuenta autorizada del equipo para entrar y gestionar el contenido del gimnasio.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}