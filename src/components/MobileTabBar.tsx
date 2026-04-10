import { BarChart3, Dumbbell, LayoutGrid } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
    { to: '/', label: 'Inicio', icon: Dumbbell },
    { to: '/explorer', label: 'Explorar', icon: LayoutGrid },
    { to: '/progress', label: 'Progreso', icon: BarChart3 },
]

export function MobileTabBar() {
    return (
        <nav className="bottom-nav" aria-label="Navegación principal">
            {tabs.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    className={({ isActive }) =>
                        isActive ? 'bottom-link active' : 'bottom-link'
                    }
                    to={to}
                >
                    <Icon size={18} />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    )
}