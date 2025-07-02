// TODO: Fix typing issues
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { User, SupabaseClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  loading: boolean
  supabase: SupabaseClient<any, "public", any>  // Use explicit typing instead of ReturnType
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        
        if (event === 'SIGNED_IN') {
          router.push('/dashboard')
        }
        if (event === 'SIGNED_OUT') {
          router.push('/sign-in')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, router])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    supabase,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}