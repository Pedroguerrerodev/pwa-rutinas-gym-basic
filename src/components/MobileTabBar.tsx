import { Compass, Home, Heart, TrendingUp } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const tabs = [
    { to: '/', label: 'Inicio', icon: Home },
    { to: '/explorer', label: 'Explorar', icon: Compass },
    { to: '/my-routines', label: 'Rutinas', icon: Heart },
    { to: '/progress', label: 'Progreso', icon: TrendingUp },
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
                    <Icon size={22} strokeWidth={1.7} aria-hidden="true" />
                    <span>{label}</span>
                </NavLink>
            ))}
        </nav>
    )
}