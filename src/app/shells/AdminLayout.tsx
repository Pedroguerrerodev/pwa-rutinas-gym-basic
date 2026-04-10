import { ArrowLeft, LogOut, ShieldCheck } from 'lucide-react'
import { Link, Navigate, Outlet } from 'react-router-dom'
import { ADMIN_LOGIN_ROUTE } from '../routes'
import { useAdminAuth } from '../../features/admin/auth/AdminAuthContext'

export function AdminLayout() {
    const { isAdmin, loading, session, signOut, user } = useAdminAuth()

    if (loading) {
        return (
            <div className="app-shell admin-shell">
                <div className="empty-state">Validando acceso del panel admin...</div>
            </div>
        )
    }

    if (!session || !isAdmin) {
        return <Navigate replace to={ADMIN_LOGIN_ROUTE} />
    }

    return (
        <div className="app-shell admin-shell">
            <header className="topbar">
                <div>
                    <div className="eyebrow">Dashboard operativo</div>
                    <div className="brand">KINETIC ADMIN</div>
                    <div className="metric-copy">{user?.email ?? 'sesión activa'}</div>
                </div>
                <div className="topbar-actions">
                    <Link className="icon-button" to="/" aria-label="Volver a la app">
                        <ArrowLeft size={18} />
                    </Link>
                    <button
                        aria-label="Cerrar sesión admin"
                        className="icon-button"
                        onClick={() => {
                            void signOut()
                        }}
                        type="button"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </header>
            <div className="status-pill" style={{ marginBottom: 18 }}>
                <ShieldCheck size={16} /> Sesión protegida
            </div>
            <Outlet />
        </div>
    )
}