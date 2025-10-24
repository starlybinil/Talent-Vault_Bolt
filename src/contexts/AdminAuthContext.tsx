import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'

interface AdminUser {
  id: string;
  auth_user_id: string;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  is_active: boolean;
  last_login_at: string | null;
}

interface AdminAuthContextType {
  user: User | null;
  adminUser: AdminUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  logActivity: (action: string, entityType?: string, entityId?: string, details?: any) => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Load admin user data
  const loadAdminUser = async (authUser: User) => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_user_id', authUser.id)
        .eq('is_active', true)
        .maybeSingle()

      if (error) throw error
      setAdminUser(data)
    } catch (error) {
      console.error('Error loading admin user:', error)
      setAdminUser(null)
    }
  }

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      
      if (authUser) {
        loadAdminUser(authUser)
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)

      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        setAdminUser(null)
        navigate('/admin/login')
      } else if (event === 'SIGNED_IN' && authUser) {
        await loadAdminUser(authUser)
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  // Log admin activity
  const logActivity = async (
    action: string, 
    entityType?: string, 
    entityId?: string, 
    details?: any
  ) => {
    if (!adminUser) return

    try {
      await supabase.rpc('log_admin_activity', {
        p_action: action,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_details: details || {}
      })
    } catch (error) {
      console.error('Error logging admin activity:', error)
    }
  }

  const value = {
    user,
    adminUser,
    loading,
    signIn: async (email: string, password: string) => {
      // Check if user is locked
      const { data: adminCheck } = await supabase
        .from('admin_users')
        .select('locked_until, login_attempts')
        .eq('email', email)
        .maybeSingle()

      if (adminCheck?.locked_until && new Date(adminCheck.locked_until) > new Date()) {
        throw new Error('Account is temporarily locked due to too many failed login attempts')
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Increment login attempts on failure
          await supabase
            .from('admin_users')
            .update({ 
              login_attempts: (adminCheck?.login_attempts || 0) + 1,
              locked_until: (adminCheck?.login_attempts || 0) >= 4 
                ? new Date(Date.now() + 30 * 60 * 1000).toISOString() // Lock for 30 minutes
                : null
            })
            .eq('email', email)
          
          throw error
        }

        if (data.user) {
          // Verify user is admin
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('auth_user_id', data.user.id)
            .eq('is_active', true)
            .maybeSingle()

          if (adminError || !adminData) {
            await supabase.auth.signOut()
            throw new Error('Access denied: Admin privileges required')
          }

          // Reset login attempts and update last login
          await supabase
            .from('admin_users')
            .update({ 
              login_attempts: 0,
              locked_until: null,
              last_login_at: new Date().toISOString()
            })
            .eq('id', adminData.id)

          // Log successful login
          await logActivity('admin_login', 'auth', data.user.id, {
            ip_address: 'unknown', // Would need to get from request in real implementation
            success: true
          })

          navigate('/admin/dashboard')
        }
      } catch (error) {
        // Log failed login attempt
        await logActivity('admin_login_failed', 'auth', null, {
          email,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        throw error
      }
    },
    signOut: async () => {
      if (adminUser) {
        await logActivity('admin_logout', 'auth', user?.id)
      }
      
      await supabase.auth.signOut()
      setUser(null)
      setAdminUser(null)
      navigate('/admin/login')
    },
    logActivity
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {!loading && children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}