import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Loader2 } from 'lucide-react'

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireSuperAdmin?: boolean;
}

export default function ProtectedAdminRoute({ 
  children, 
  requireSuperAdmin = false 
}: ProtectedAdminRouteProps) {
  const { user, adminUser, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-asu-darker flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-asu-gold animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // Redirect to admin login if not authenticated
  if (!user || !adminUser) {
    return <Navigate to="/admin/login" replace />
  }

  // Check if user is active
  if (!adminUser.is_active) {
    return (
      <div className="min-h-screen bg-asu-darker flex items-center justify-center">
        <div className="bg-asu-dark p-8 rounded-xl border border-red-500/30 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Account Disabled</h2>
          <p className="text-gray-300 mb-6">
            Your admin account has been disabled. Please contact a system administrator.
          </p>
          <button
            onClick={() => window.location.href = '/admin/login'}
            className="bg-asu-maroon text-white px-6 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    )
  }

  // Check super admin requirement
  if (requireSuperAdmin && adminUser.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-asu-darker flex items-center justify-center">
        <div className="bg-asu-dark p-8 rounded-xl border border-asu-maroon/30 text-center max-w-md">
          <h2 className="text-2xl font-bold text-asu-gold mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">
            This section requires super administrator privileges.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-asu-maroon text-white px-6 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}