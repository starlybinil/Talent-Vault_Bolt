import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { Shield, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signIn } = useAdminAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await signIn(email, password)
      // Navigation handled in signIn function
    } catch (err: any) {
      if (err?.message?.includes('locked')) {
        setError('Account temporarily locked due to multiple failed attempts. Please try again in 30 minutes.')
      } else if (err?.message?.includes('Admin privileges required')) {
        setError('Access denied: This login is for administrators only.')
      } else if (err?.message === 'Invalid login credentials') {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else {
        setError('Failed to sign in. Please try again later.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-asu-darker via-asu-dark to-asu-darker flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(140,29,64,0.1),transparent_70%)]" />
      
      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-asu-maroon/20 rounded-full border-2 border-asu-gold">
              <Shield className="h-12 w-12 text-asu-gold" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-400">
            Secure access for system administrators
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-asu-dark/80 backdrop-blur-sm rounded-2xl border border-asu-maroon/30 p-8 shadow-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-red-400 text-sm">{error}</div>
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Email Address
                </div>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-asu-gold focus:ring-1 focus:ring-asu-gold transition-colors"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </div>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-asu-gold focus:ring-1 focus:ring-asu-gold transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-asu-gold transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-asu-maroon to-asu-maroon/80 text-white py-3 px-4 rounded-lg font-semibold hover:from-asu-maroon/90 hover:to-asu-maroon/70 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Sign In to Admin Portal
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-asu-gold/10 border border-asu-gold/20 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-asu-gold flex-shrink-0 mt-0.5" />
              <div className="text-sm text-asu-gold">
                <strong>Security Notice:</strong> This portal is for authorized administrators only. 
                All login attempts are monitored and logged.
              </div>
            </div>
          </div>

          {/* Back to Main Site */}
          <div className="mt-6 text-center">
            <Link 
              to="/" 
              className="text-gray-400 hover:text-asu-gold transition-colors text-sm"
            >
              ← Back to TalentVault
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}