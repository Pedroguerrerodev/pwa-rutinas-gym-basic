import { AlertTriangle, ArrowLeft, Home } from 'lucide-react'
import { Link, isRouteErrorResponse, useRouteError } from 'react-router-dom'

function getErrorMessage(error: unknown) {
    if (isRouteErrorResponse(error)) {
        if (error.status === 404) {
            return 'La pantalla que buscas no existe o ya no está disponible.'
        }

        return error.statusText || 'Se ha producido un error inesperado en la navegación.'
    }

    if (error instanceof Error && error.message) {
        return error.message
    }

    return 'Se ha producido un error inesperado en la aplicación.'
}

export function RouteErrorPage() {
    const error = useRouteError()

    return (
        <RouteStatusPage
            message={getErrorMessage(error)}
            titleLeading="No hemos podido abrir esta"
            titleTrailing=""
        />
    )
}

export function RouteFallbackPage() {
    return (
        <RouteStatusPage
            message="La pantalla que buscas no existe o ya no está disponible."
            titleLeading="Esta"
            titleTrailing="no existe"
        />
    )
}

function RouteStatusPage({
    message,
    titleLeading,
    titleTrailing,
}: {
    message: string
    titleLeading: string
    titleTrailing: string
}) {

    return (
        <main>
            <section className="section panel">
                <div className="status-pill">
                    <AlertTriangle size={16} />
                    Error de navegación
                </div>
                <h1 className="hero-title">
                    {titleLeading}{' '}
                    <span className="accent-text">pantalla</span>
                    {titleTrailing ? ` ${titleTrailing}` : ''}
                </h1>
                <p className="hero-copy">{message}</p>

                <div className="inline-actions section">
                    <Link className="primary-button" to="/">
                        <Home size={18} />
                        Volver al inicio
                    </Link>
                    <Link className="secondary-button" to="/explorer">
                        <ArrowLeft size={18} />
                        Ir a explorar
                    </Link>
                </div>
            </section>
        </main>
    )
}