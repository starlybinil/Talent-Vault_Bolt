import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CircuitBoard, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { validatePasswordStrength, getPasswordStrengthLabel } from '../lib/passwordValidation'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const navigate = useNavigate()

  const passwordStrength = validatePasswordStrength(password)
  const strengthLabel = getPasswordStrengthLabel(passwordStrength.score)
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
      setIsValidToken(false)
    } else {
      setIsValidToken(true)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!passwordStrength.isValid) {
      setError('Please ensure your password meets all requirements.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      })

      if (updateError) {
        setError('Failed to update password. Please try requesting a new reset link.')
        return
      }

      await supabase.auth.signOut()

      setSuccess(true)
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password updated successfully. Please sign in with your new password.' }
        })
      }, 3000)
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isValidToken === false) {
    return (
      <div className="min-h-screen bg-asu-darker flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-asu-dark p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-asu-maroon/30">
          <div>
            <div className="flex justify-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
              </div>
            </div>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-white">
              Invalid or expired link
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
              This password reset link is invalid or has expired. Password reset links are only valid for 24 hours.
            </p>
          </div>

          <div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="w-full bg-asu-maroon text-white py-3 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors text-base font-medium"
            >
              Request a new reset link
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-asu-darker flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6 sm:space-y-8 bg-asu-dark p-6 sm:p-8 rounded-xl sm:rounded-2xl border border-asu-maroon/30">
          <div>
            <div className="flex justify-center">
              <div className="h-12 w-12 sm:h-16 sm:w-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
            </div>
            <h2 className="mt-4 sm:mt-6 text-center text-2xl sm:text-3xl font-bold text-white">
              Password updated successfully
            </h2>
            <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
              Your password has been updated. You can now sign in with your new password.
            </p>
            <p className="mt-4 text-center text-sm text-gray-500">
              Redirecting to login page...
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
            Set new password
          </h2>
          <p className="mt-2 text-center text-sm sm:text-base text-gray-400">
            Choose a strong password for your account
          </p>
        </div>

        <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="form-label">
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {password && (
              <div className="mt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Password strength:</span>
                  <span className={`text-xs font-medium ${strengthLabel.color}`}>
                    {strengthLabel.label}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      passwordStrength.score < 40
                        ? 'bg-red-500'
                        : passwordStrength.score < 60
                        ? 'bg-orange-500'
                        : passwordStrength.score < 80
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {password && passwordStrength.feedback.length > 0 && (
            <div className="bg-gray-800/50 border border-gray-700 p-3 rounded-md">
              <p className="text-xs font-medium text-gray-300 mb-2">Password requirements:</p>
              <ul className="space-y-1">
                {passwordStrength.feedback.map((item, index) => (
                  <li key={index} className="text-xs text-gray-400 flex items-start gap-2">
                    <span className="text-gray-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {password && passwordStrength.isValid && (
            <div className="bg-gray-800/50 border border-gray-700 p-3 rounded-md">
              <p className="text-xs font-medium text-green-400 mb-2">All requirements met:</p>
              <ul className="space-y-1">
                <li className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  At least 8 characters
                </li>
                <li className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  Uppercase and lowercase letters
                </li>
                <li className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  At least one number
                </li>
                <li className="text-xs text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="h-3 w-3 text-green-400" />
                  At least one special character
                </li>
              </ul>
            </div>
          )}

          <div>
            <label htmlFor="confirmPassword" className="form-label">
              Confirm new password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field pr-10"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {confirmPassword && (
              <div className="mt-2 flex items-center gap-2">
                {passwordsMatch ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-green-400">Passwords match</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-red-400">Passwords do not match</span>
                  </>
                )}
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || !passwordStrength.isValid || !passwordsMatch}
              className="w-full bg-asu-maroon text-white py-3 sm:py-3.5 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-medium"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </button>
          </div>
        </form>

        <div className="border-t border-gray-700 pt-4">
          <p className="text-xs text-gray-400 text-center">
            For your security, you'll be logged out from all devices after changing your password.
          </p>
        </div>
      </div>
    </div>
  )
}
