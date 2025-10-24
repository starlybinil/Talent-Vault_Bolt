import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<{ user: User | null; error: Error | null; confirmationSent: boolean }>
  signOut: () => Promise<void>
  isEmailVerified: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const navigate = useNavigate()

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsEmailVerified(session?.user?.email_confirmed_at != null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setUser(null)
        setIsEmailVerified(false)
        navigate('/login')
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setUser(session?.user ?? null)
        setIsEmailVerified(session?.user?.email_confirmed_at != null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const value = {
    user,
    loading,
    isEmailVerified,
    signIn: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      if (data.session?.user) {
        navigate('/dashboard')
      }
    },
    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })
      return { 
        user: data.user, 
        error: error || null,
        confirmationSent: false
      }
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut()
        setUser(null)
        setIsEmailVerified(false)
        navigate('/login')
      } catch (error) {
        console.error('Error during sign out:', error)
        // Clear state and navigate even if sign out fails
        setUser(null)
        setIsEmailVerified(false)
        navigate('/login')
      }
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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