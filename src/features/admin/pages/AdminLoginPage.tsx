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
                <div className="empty-state">Validando sesión del portal admin...</div>
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
                        <ShieldCheck size={16} /> Acceso restringido
                    </div>
                    <h1 className="hero-title">
                        Portal <span className="accent-text">admin</span>
                    </h1>
                    <p className="hero-copy">
                        Entra con una cuenta de Supabase Auth para gestionar el catálogo real.
                    </p>

                    <form className="form-grid section" onSubmit={handleSubmit}>
                        <input
                            autoComplete="email"
                            className="data-input"
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="Email de administrador"
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
                                Falta configurar Supabase en el entorno de Vite.
                            </div>
                        ) : null}

                        {error ? <div className="admin-feedback is-error">{error}</div> : null}
                        {session && !isAdmin ? (
                            <div className="admin-feedback is-error">
                                Esta cuenta no tiene permisos de administrador para este proyecto.
                            </div>
                        ) : null}

                        <div className="inline-actions">
                            <button className="primary-button" disabled={submitting || !isConfigured} type="submit">
                                <LockKeyhole size={18} />
                                {submitting ? 'Entrando...' : 'Entrar al portal'}
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
                                <ArrowLeft size={18} /> Volver a la app
                            </Link>
                        </div>
                    </form>

                    <div className="install-guide section">
                        <div className="section-kicker">Setup mínimo</div>
                        <p className="metric-copy" style={{ marginBottom: 0 }}>
                            Si todavía no existe el usuario admin, créalo primero en Supabase Auth y confirma su email si tu proyecto lo exige.
                        </p>
                    </div>
                </div>
            </section>
        </main>
    )
}