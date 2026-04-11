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
            </header>
            <Outlet />
            <MobileTabBar />
        </div>
    )
}