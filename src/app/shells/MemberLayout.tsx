import { Bell, Settings2 } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { MobileTabBar } from '../../components/MobileTabBar'

export function MemberLayout() {
    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand">KINETIC</div>
                <div className="topbar-actions">
                    <button className="icon-button" type="button" aria-label="Avisos">
                        <Bell size={18} />
                    </button>
                    <button className="icon-button" type="button" aria-label="Ajustes">
                        <Settings2 size={18} />
                    </button>
                </div>
            </header>
            <Outlet />
            <MobileTabBar />
        </div>
    )
}