import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CircuitBoard, ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (resetError) {
        if (resetError.message.includes('rate limit')) {
          setError('Too many reset requests. Please try again in an hour.')
        } else {
          setError('Unable to process your request. Please try again.')
        }
        return
      }

      setSuccess(true)
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-asu-darker flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-asu-dark p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-asu-maroon/30">
          <div>
            <div className="flex justify-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <Mail className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
            </div>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-white">
              Check your email
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
              We've sent a password reset link to <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          <div className="bg-asu-maroon/10 border border-asu-maroon/30 p-4 rounded-lg">
            <p className="text-sm text-gray-300 space-y-2">
              <span className="block font-medium text-white">Next steps:</span>
              <span className="block">1. Check your inbox (and spam folder)</span>
              <span className="block">2. Click the password reset link in the email</span>
              <span className="block">3. The link will expire in 24 hours</span>
              <span className="block mt-3 text-gray-400">You should receive the email within 5 minutes.</span>
            </p>
          </div>

          <div className="space-y-3">
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 bg-asu-maroon text-white py-3 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors text-base font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
            <button
              onClick={() => setSuccess(false)}
              className="w-full text-asu-gold hover:text-asu-gold/80 py-2 text-sm transition-colors"
            >
              Didn't receive the email? Try again
            </button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-xs text-gray-400 text-center">
              If you continue to have issues, please{' '}
              <Link to="/contact" className="text-asu-gold hover:text-asu-gold/80">
                contact support
              </Link>
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-asu-darker flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-asu-dark p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-asu-maroon/30">
        <div>
          <div className="flex justify-center">
            <CircuitBoard className="h-10 w-10 sm:h-12 sm:w-12 text-asu-gold" />
          </div>
          <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="form-label">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-asu-maroon text-white py-3 sm:py-3.5 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-medium"
            >
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>

          <div>
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
