import { lazy, Suspense, type ReactNode } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { ADMIN_ROUTE } from './routes'
import { AdminLayout } from './shells/AdminLayout'
import { MemberLayout } from './shells/MemberLayout'
import { AdminAuthProvider } from '../features/admin/auth/AdminAuthContext'
import { RouteErrorPage, RouteFallbackPage } from './RouteErrorPage'

const HomePage = lazy(async () => {
    const module = await import('../features/member/pages/HomePage')

    return { default: module.HomePage }
})

const ExplorerPage = lazy(async () => {
    const module = await import('../features/member/pages/ExplorerPage')

    return { default: module.ExplorerPage }
})

const HowItWorksPage = lazy(async () => {
    const module = await import('../features/member/pages/HowItWorksPage')

    return { default: module.HowItWorksPage }
})

const WorkoutPage = lazy(async () => {
    const module = await import('../features/member/pages/WorkoutPage')

    return { default: module.WorkoutPage }
})

const AdminDashboardPage = lazy(async () => {
    const module = await import('../features/admin/pages/AdminDashboardPage')

    return { default: module.AdminDashboardPage }
})

const AdminLoginPage = lazy(async () => {
    const module = await import('../features/admin/pages/AdminLoginPage')

    return { default: module.AdminLoginPage }
})

function withSuspense(node: ReactNode) {
    return (
        <Suspense fallback={<main><div className="empty-state">Cargando...</div></main>}>
            {node}
        </Suspense>
    )
}

function AdminAuthRoot() {
    return (
        <AdminAuthProvider>
            <Outlet />
        </AdminAuthProvider>
    )
}

export const router = createBrowserRouter([
    {
        element: <MemberLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: '/', element: withSuspense(<HomePage />) },
            { path: '/explorer', element: withSuspense(<ExplorerPage />) },
            { path: '/progress', element: withSuspense(<HowItWorksPage />) },
            { path: '/how-it-works', element: withSuspense(<HowItWorksPage />) },
            { path: '/routine/:slug', element: withSuspense(<WorkoutPage />) },
            { path: '*', element: <RouteFallbackPage /> },
        ],
    },
    {
        path: ADMIN_ROUTE,
        element: <AdminAuthRoot />,
        errorElement: <RouteErrorPage />,
        children: [
            { path: 'login', element: withSuspense(<AdminLoginPage />) },
            {
                element: <AdminLayout />,
                children: [{ index: true, element: withSuspense(<AdminDashboardPage />) }],
            },
        ],
    },
])