import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react'
import { hasSupabaseEnv, supabase } from '../../../lib/supabase'

type AdminAuthContextValue = {
    session: Session | null
    user: User | null
    loading: boolean
    isConfigured: boolean
    isAdmin: boolean
    signIn: (email: string, password: string) => Promise<string | null>
    signOut: () => Promise<string | null>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function AdminAuthProvider({ children }: PropsWithChildren) {
    const [session, setSession] = useState<Session | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(hasSupabaseEnv)

    useEffect(() => {
        let isMounted = true

        const syncAccess = async (nextSession: Session | null) => {
            if (!supabase || !hasSupabaseEnv || !nextSession) {
                if (isMounted) {
                    setIsAdmin(false)
                    setLoading(false)
                }
                return
            }

            const { data: adminRows, error: selectError } = await supabase
                .from('admin_users')
                .select('user_id')
                .eq('user_id', nextSession.user.id)
                .limit(1)

            if (adminRows && adminRows.length > 0) {
                if (isMounted) {
                    setIsAdmin(true)
                    setLoading(false)
                }
                return
            }

            const { error: insertError } = await supabase.from('admin_users').insert({
                user_id: nextSession.user.id,
                email: nextSession.user.email ?? '',
            })

            if (isMounted) {
                setIsAdmin(!insertError && !selectError)
                setLoading(false)
            }
        }

        if (!supabase || !hasSupabaseEnv) {
            setLoading(false)
            return
        }

        void supabase.auth.getSession().then(({ data, error }) => {
            if (!isMounted) {
                return
            }

            if (!error) {
                setSession(data.session)
                void syncAccess(data.session)
                return
            }

            setLoading(false)
        })

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            if (!isMounted) {
                return
            }

            setSession(nextSession)
            setLoading(true)
            void syncAccess(nextSession)
        })

        return () => {
            isMounted = false
            subscription.unsubscribe()
        }
    }, [])

    const value = useMemo<AdminAuthContextValue>(
        () => ({
            session,
            user: session?.user ?? null,
            loading,
            isConfigured: hasSupabaseEnv,
            isAdmin,
            signIn: async (email, password) => {
                if (!supabase || !hasSupabaseEnv) {
                    return 'Faltan las credenciales de Supabase en el entorno.'
                }

                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })

                return error?.message ?? null
            },
            signOut: async () => {
                if (!supabase || !hasSupabaseEnv) {
                    return 'Supabase no está configurado.'
                }

                const { error } = await supabase.auth.signOut()

                return error?.message ?? null
            },
        }),
        [isAdmin, loading, session],
    )

    return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
    const context = useContext(AdminAuthContext)

    if (!context) {
        throw new Error('useAdminAuth debe usarse dentro de AdminAuthProvider')
    }

    return context
}