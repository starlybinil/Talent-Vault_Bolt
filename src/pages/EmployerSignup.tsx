import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { CircuitBoard, Building2, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function EmployerSignup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [industry, setIndustry] = useState('')
  const [hiringNeeds, setHiringNeeds] = useState('')
  const [website, setWebsite] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    
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
      if (!user) throw new Error('No user returned after signup')
      
      // Create employer profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          type: 'employer',
          first_name: firstName,
          last_name: lastName
        })
        .select()
        .single()

      if (profileError) throw profileError

      // Create employer details
      const { error: detailsError } = await supabase
        .from('employer_details')
        .insert({
          profile_id: profileData.id,
          company_name: companyName,
          company_size: companySize,
          industry,
          hiring_needs: hiringNeeds,
          website
        })

      if (detailsError) throw detailsError

      navigate('/login', { 
        state: { message: 'Account created successfully! Please log in.' }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      console.error('Signup error:', err)
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
          <h2 className="mt-6 text-center text-3xl font-bold text-white mb-2">
            Create Employer Account
          </h2>
          <p className="text-center text-gray-400">
            Access top microelectronics talent
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
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-asu-gold" />
                Personal Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="form-label">First Name</label>
                  <input
                    id="firstName"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="form-label">Last Name</label>
                  <input
                    id="lastName"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="form-label">Work Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-asu-gold" />
                Company Information
              </h3>
              
              <div>
                <label htmlFor="companyName" className="form-label">Company Name</label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="website" className="form-label">Company Website</label>
                <input
                  id="website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="companySize" className="form-label">Company Size</label>
                <select
                  id="companySize"
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select company size</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-500">201-500 employees</option>
                  <option value="501-1000">501-1000 employees</option>
                  <option value="1001+">1001+ employees</option>
                </select>
              </div>

              <div>
                <label htmlFor="industry" className="form-label">Industry</label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select industry</option>
                  <option value="Semiconductor Manufacturing">Semiconductor Manufacturing</option>
                  <option value="Integrated Circuit Design">Integrated Circuit Design</option>
                  <option value="Electronic Components">Electronic Components</option>
                  <option value="Aerospace & Defense">Aerospace & Defense</option>
                  <option value="Automotive Electronics">Automotive Electronics</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Research & Development">Research & Development</option>
                </select>
              </div>

              <div>
                <label htmlFor="hiringNeeds" className="form-label">Hiring Needs</label>
                <textarea
                  id="hiringNeeds"
                  value={hiringNeeds}
                  onChange={(e) => setHiringNeeds(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Briefly describe your hiring needs and requirements"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-asu-maroon text-white py-3 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Employer Account'}
          </button>
        </form>
      </div>
    </div>
  )
}