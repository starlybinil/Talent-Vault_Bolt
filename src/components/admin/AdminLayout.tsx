import React from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Shield, LogOut, User, Clock } from 'lucide-react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { adminUser, signOut } = useAdminAuth()

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out of the admin portal?')) {
      await signOut()
    }
  }

  return (
    <div className="min-h-screen bg-asu-darker">
      {/* Admin Header */}
      <header className="bg-asu-dark border-b border-asu-maroon/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-asu-maroon/20 rounded-lg">
                <Shield className="w-6 h-6 text-asu-gold" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TalentVault Admin</h1>
                <p className="text-xs text-gray-400">Administrative Portal</p>
              </div>
            </div>

            {/* Admin Info & Actions */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <User className="w-4 h-4" />
                  <span>{adminUser?.username}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Shield className="w-4 h-4 text-asu-gold" />
                  <span className="capitalize">{adminUser?.role?.replace('_', ' ')}</span>
                </div>
                {adminUser?.last_login_at && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>Last: {new Date(adminUser.last_login_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-asu-gold hover:bg-asu-maroon/30 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>
    </div>
  )
}