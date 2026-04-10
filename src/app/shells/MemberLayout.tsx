import { Bell, Settings2 } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { MobileTabBar } from '../../components/MobileTabBar'

export function MemberLayout() {
    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand-lockup">
                    <div className="brand-mark-frame" aria-hidden="true">
                        <img className="brand-mark-image" src="/logo-kinetic.png" alt="" />
                    </div>
                    <div className="brand">KINETIC</div>
                </div>
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