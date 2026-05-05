import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { KineticBackground } from '../../components/KineticBackground'
import { MobileTabBar } from '../../components/MobileTabBar'

export function MemberLayout() {
    const location = useLocation()

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
    }, [location.pathname])

    return (
        <div className="app-shell member-shell">
            <KineticBackground />
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