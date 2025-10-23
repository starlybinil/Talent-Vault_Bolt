import React, { useState, useEffect } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CircuitBoard } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => {
        setCooldown(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before trying again`)
      return
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError('First name and last name are required')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }
    
    setLoading(true)

    try {
      const { user, error: signUpError } = await signUp(email, password)
      
      if (signUpError) throw signUpError
      if (!user) {
        throw new Error('No user returned after signup')
      }
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          type: 'candidate',
          first_name: firstName,
          last_name: lastName,
          technical_skills: [],
          soft_skills: [],
          projects: [],
          job_preferences: {
            opportunityType: [],
            preferredRegions: [],
            preferredCompanies: [],
            willingToRelocate: false
          },
          view_count: 0
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Failed to create profile. Please try again.')
      }

      navigate('/login', { 
        state: { message: 'Account created successfully! Please verify email and then log in.' }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request account. Please try again.')
      console.error('Signup error:', err)
      
      if (err instanceof Error && err.message.includes('rate limit')) {
        setCooldown(5)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-asu-darker flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-asu-dark p-8 rounded-2xl border border-asu-maroon/30">
        <div>
          <div className="flex justify-center">
            <CircuitBoard className="h-12 w-12 text-asu-gold" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-white">
            Create Your TalentVault Account
          </h2>
          <p className="text-center text-gray-400">
            Join TalentVault to connect with leading semiconductor companies
          </p>
          <p className="mt-2 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-asu-gold hover:text-asu-gold/80">
              Login here
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                placeholder="Enter your first name"
              />
            </div>
            
            <div>
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="Enter your last name"
              />
            </div>

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
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="form-label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || cooldown > 0}
              className="w-full bg-asu-maroon text-white py-3 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account...' : 
               cooldown > 0 ? `Try again in ${cooldown}s` : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}