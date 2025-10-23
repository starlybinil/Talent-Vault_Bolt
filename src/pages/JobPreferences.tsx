import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Loader2, Save } from 'lucide-react'
import Notification from '../components/Notification'

interface JobPreferences {
  careerGoals: string;
  desiredRoles: string[];
  preferredIndustries: string[];
  preferredCompanies: string[];
  targetSalaryRange: {
    min: number | null;
    max: number | null;
    currency: string;
  };
  preferredLocations: string[];
  willingToRelocate: boolean;
  preferredCompanySize: string;
  employmentTypes: string[];
}

const EMPLOYMENT_TYPES = ['full-time', 'part-time', 'internship', 'contract', 'graduate-school'];
const COMPANY_SIZES = ['startup', 'small', 'medium', 'large', 'enterprise'];
const INDUSTRIES = [
  'Semiconductor Manufacturing',
  'Integrated Circuit Design',
  'Electronic Components',
  'Microelectronics',
  'Aerospace & Defense',
  'Automotive Electronics',
  'Consumer Electronics',
  'Research & Development'
];

export default function JobPreferences() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isOpen: boolean;
  }>({ type: 'success', message: '', isOpen: false })

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (notification.isOpen) {
      timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, isOpen: false }));
      }, 3000); // Hide after 3 seconds
    }
    return () => clearTimeout(timer);
  }, [notification.isOpen]);

  const [preferences, setPreferences] = useState<JobPreferences>({
    careerGoals: '',
    desiredRoles: [],
    preferredIndustries: [],
    preferredCompanies: [],
    targetSalaryRange: {
      min: null,
      max: null,
      currency: 'USD'
    },
    preferredLocations: [],
    willingToRelocate: false,
    preferredCompanySize: '',
    employmentTypes: []
  })

  useEffect(() => {
    async function loadPreferences() {
      if (!user) return

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('job_preferences')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        if (profile?.job_preferences) {
          // Ensure all arrays are initialized even if missing from database
          setPreferences({
            ...preferences,
            ...profile.job_preferences,
            preferredIndustries: profile.job_preferences.preferredIndustries || [],
            preferredCompanies: profile.job_preferences.preferredCompanies || [],
            desiredRoles: profile.job_preferences.desiredRoles || [],
            preferredLocations: profile.job_preferences.preferredLocations || [],
            employmentTypes: profile.job_preferences.employmentTypes || []
          })
        }
      } catch (error) {
        console.error('Error loading preferences:', error)
        setNotification({
          type: 'error',
          message: 'Failed to load preferences',
          isOpen: true
        })
      } finally {
        setLoading(false)
      }
    }

    loadPreferences()
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    console.log('Saving preferences:', preferences)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ job_preferences: preferences })
        .eq('user_id', user.id)

      if (error) throw error

      setNotification({
        type: 'success',
        message: 'Preferences saved successfully',
        isOpen: true
      })
      console.log('Preferences saved successfully')

    } catch (error) {
      console.error('Error saving preferences:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save preferences',
        isOpen: true
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof JobPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-asu-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Notification
        type={notification.type}
        message={notification.message}
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Job Preferences</h1>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-asu-maroon text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {/* Career Goals */}
          <div>
            <label className="block text-white font-medium mb-2">
              Career Goals
            </label>
            <textarea
              value={preferences.careerGoals}
              onChange={(e) => handleInputChange('careerGoals', e.target.value)}
              className="w-full px-3 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold transition-colors"
              rows={4}
              placeholder="Describe your career goals and aspirations..."
            />
          </div>

          {/* Desired Roles */}
          <div>
            <label className="block text-white font-medium mb-2">
              Desired Roles
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Add a role (e.g., VLSI Engineer)"
                className="flex-1 px-3 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    const value = input.value.trim()
                    if (value && !preferences.desiredRoles.includes(value)) {
                      handleInputChange('desiredRoles', [...preferences.desiredRoles, value])
                      input.value = ''
                    }
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.desiredRoles.map((role, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-asu-maroon/20 text-asu-gold rounded-full text-sm flex items-center gap-2"
                >
                  {role}
                  <button
                    onClick={() => handleInputChange(
                      'desiredRoles',
                      preferences.desiredRoles.filter((_, i) => i !== index)
                    )}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Industries */}
          <div>
            <label className="block text-white font-medium mb-2">
              Preferred Industries
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {INDUSTRIES.map((industry) => (
                <label key={industry} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.preferredIndustries.includes(industry)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('preferredIndustries', [...preferences.preferredIndustries, industry])
                      } else {
                        handleInputChange(
                          'preferredIndustries',
                          preferences.preferredIndustries.filter(i => i !== industry)
                        )
                      }
                    }}
                    className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                  />
                  <span className="text-gray-300">{industry}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Preferred Companies */}
          <div>
            <label className="block text-white font-medium mb-2">
              Preferred Companies
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Add a company (e.g., Intel, TSMC)"
                className="flex-1 px-3 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    const value = input.value.trim()
                    if (value && !preferences.preferredCompanies.includes(value)) {
                      handleInputChange('preferredCompanies', [...preferences.preferredCompanies, value])
                      input.value = ''
                    }
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.preferredCompanies.map((company, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-asu-maroon/20 text-asu-gold rounded-full text-sm flex items-center gap-2"
                >
                  {company}
                  <button
                    onClick={() => handleInputChange(
                      'preferredCompanies',
                      preferences.preferredCompanies.filter((_, i) => i !== index)
                    )}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>


          {/* Preferred Locations */}
          <div>
            <label className="block text-white font-medium mb-2">
              Preferred Locations
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Add a location (e.g., Phoenix, AZ)"
                className="flex-1 px-3 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    const value = input.value.trim()
                    if (value && !preferences.preferredLocations.includes(value)) {
                      handleInputChange('preferredLocations', [...preferences.preferredLocations, value])
                      input.value = ''
                    }
                  }
                }}
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {preferences.preferredLocations.map((location, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-asu-maroon/20 text-asu-gold rounded-full text-sm flex items-center gap-2"
                >
                  {location}
                  <button
                    onClick={() => handleInputChange(
                      'preferredLocations',
                      preferences.preferredLocations.filter((_, i) => i !== index)
                    )}
                    className="hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="mt-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={preferences.willingToRelocate}
                  onChange={(e) => handleInputChange('willingToRelocate', e.target.checked)}
                  className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                />
                <span className="text-gray-300">Willing to relocate</span>
              </label>
            </div>
          </div>

          {/* Employment Types */}
          <div>
            <label className="block text-white font-medium mb-2">
              Employment Types
            </label>
            <div className="flex flex-wrap gap-4">
              {EMPLOYMENT_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={preferences.employmentTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleInputChange('employmentTypes', [...preferences.employmentTypes, type])
                      } else {
                        handleInputChange(
                          'employmentTypes',
                          preferences.employmentTypes.filter(t => t !== type)
                        )
                      }
                    }}
                    className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                  />
                  <span className="text-gray-300">
                    {type === 'graduate-school' ? 'Graduate School' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}