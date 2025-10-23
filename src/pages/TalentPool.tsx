import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  Filter, 
  GraduationCap, 
  Briefcase, 
  MapPin, 
  Shield, 
  UserCircle,
  Loader2,
  X,
  ChevronDown,
  Award
} from 'lucide-react'

interface Candidate {
  id: string;
  education: any[];
  experience: any[];
  technical_skills: string[];
  job_opportunity_type: string;
  nationality_status: string;
  job_preferences: {
    preferredIndustries: string[];
  };
}

interface FilterState {
  workAuth: string[];
  education: string[];
  employmentType: string[];
}

const WORK_AUTH_OPTIONS = [
  'US Citizen',
  'Green Card',
  'H1-B Eligible',
  'OPT/CPT',
  'TN Visa'
];

const EDUCATION_OPTIONS = [
  'AS',
  'BS',
  'MS',
  'PhD'
];

const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'internship'
];

export default function TalentPool() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    workAuth: [],
    education: [], 
    employmentType: []
  })
  const [filters, setFilters] = useState<FilterState>({
    workAuth: [],
    education: [],
    employmentType: []
  })

  useEffect(() => {
    loadCandidates()
  }, [activeFilters])

  const loadCandidates = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          photo_url,
          education,
          experience,
          technical_skills,
          soft_skills,
          job_opportunity_type,
          nationality_status,
          job_preferences,
          veteran_status,
          security_clearance
        `, { count: 'exact' })
        .eq('type', 'candidate')
        .order('created_at', { ascending: false })
        .limit(18)

      // Apply work authorization filter
      if (activeFilters.workAuth.length > 0) {
        query = query.in('nationality_status', activeFilters.workAuth)
      }

      // Apply employment type filter
      if (activeFilters.employmentType.length > 0) {
        query = query.in('job_opportunity_type', activeFilters.employmentType)
      }

      const { data: candidates, error, count } = await query

      if (error) throw error

      const parsedCandidates = (candidates || []).map(candidate => ({
        ...candidate,
        education: parseJsonField(candidate.education),
        experience: parseJsonField(candidate.experience),
        technical_skills: parseJsonField(candidate.technical_skills),
        soft_skills: parseJsonField(candidate.soft_skills),
        job_preferences: parseJsonField(candidate.job_preferences)
      }))

      // Filter by education level
      let filteredCandidates = parsedCandidates
      if (activeFilters.education.length > 0) {
        filteredCandidates = parsedCandidates.filter(candidate => {
          if (!candidate.education || !Array.isArray(candidate.education)) return false
          return candidate.education.some(edu => 
            activeFilters.education.includes(edu.degree)
          )
        })
      }

      setCandidates(filteredCandidates)
      setTotalCandidates(count || 0)
    } catch (error) {
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  // Helper function to parse JSON fields safely
  const parseJsonField = (field: any, defaultValue: any = []) => {
    if (Array.isArray(field)) return field
    if (typeof field === 'string' && field.trim() === '') return defaultValue
    try {
      return field && typeof field === 'string' ? JSON.parse(field) : field || defaultValue
    } catch (e) {
      console.error('Error parsing JSON field:', e)
      return defaultValue
    }
  }

  const handleFilterChange = (category: keyof FilterState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }))
  }

  const applyFilters = () => {
    setActiveFilters(filters)
    setShowFilters(false)
  }

  const clearFilters = () => {
    setFilters({
      workAuth: [],
      education: [],
      employmentType: []
    })
    setActiveFilters({
      workAuth: [],
      education: [],
      employmentType: []
    })
  }

  const handleRequestAccess = () => {
    navigate('/contact')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-asu-gold animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark pb-12">
      {/* Hero Section */}
      <div className="relative bg-asu-dark border-b border-asu-maroon/30 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(140,29,64,0.1),transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 py-16 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Access Elite Microelectronics Talent
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Connect with {totalCandidates.toLocaleString()}+ pre-vetted candidates with specialized skills in semiconductor manufacturing and design. Showing up to 18 profiles.
            </p>
            <button
              onClick={handleRequestAccess}
              className="bg-asu-gold text-asu-dark px-8 py-4 rounded-full text-lg font-semibold hover:bg-asu-gold/90 transition-all duration-300 transform hover:scale-105"
            >
              Request Access
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-white">Filter Candidates</h2>
              {Object.values(activeFilters).some(arr => arr.length > 0) && (
                <span className="bg-asu-maroon text-white px-2 py-1 text-sm rounded-full">
                  {Object.values(activeFilters).reduce((acc, arr) => acc + arr.length, 0)} active
                </span>
              )}
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-asu-gold rounded-lg hover:bg-asu-maroon/30 transition-colors"
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-asu-maroon/30 pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={clearFilters}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    Reset Filters
                  </button>
                  <button
                    onClick={applyFilters}
                    className="bg-asu-maroon text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Employment Type */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Briefcase className="w-5 h-5 text-asu-gold" />
                    <h4 className="text-asu-gold font-medium">Employment Type</h4>
                  </div>
                  <div className="space-y-2">
                    {EMPLOYMENT_TYPES.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.employmentType.includes(option)}
                          onChange={() => handleFilterChange('employmentType', option)}
                          className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                        />
                        <span className="text-gray-300">
                          {option.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Work Authorization */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-5 h-5 text-asu-gold" />
                    <h4 className="text-asu-gold font-medium">Work Authorization</h4>
                  </div>
                  <div className="space-y-2">
                    {WORK_AUTH_OPTIONS.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.workAuth.includes(option)}
                          onChange={() => handleFilterChange('workAuth', option)}
                          className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Education Level */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <GraduationCap className="w-5 h-5 text-asu-gold" />
                    <h4 className="text-asu-gold font-medium">Education Level</h4>
                  </div>
                  <div className="space-y-2">
                    {EDUCATION_OPTIONS.map((option) => (
                      <label key={option} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.education.includes(option)}
                          onChange={() => handleFilterChange('education', option)}
                          className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                        />
                        <span className="text-gray-300">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {Object.values(filters).some(arr => arr.length > 0) && (
                <div className="mt-6 pt-6 border-t border-asu-maroon/30 text-sm text-gray-400">
                  {Object.values(filters).reduce((acc, arr) => acc + arr.length, 0)} filters selected
                </div>
              )}
            </div>
          )}
        </div>

        {/* Candidate Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {candidates.map((candidate, index) => (
            <div
              key={candidate.id}
              className={`group rounded-xl border border-asu-maroon/30 p-6 hover:border-asu-gold/50 transition-all duration-300 relative overflow-hidden ${
                index % 2 === 0
                  ? "bg-gradient-to-br from-asu-dark to-asu-darker"
                  : "bg-gradient-to-br from-asu-darker to-[#0A0A0A]"
              }`}
            >
              {/* Job Type Badge */}
              {candidate.job_opportunity_type && (
                <div className="absolute top-4 right-4">
                  <span className="bg-asu-maroon/30 text-asu-gold px-3 py-1 rounded-full text-sm font-medium border border-asu-gold/30 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {candidate.job_opportunity_type.split('-').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </span>
                </div>
              )}

              {/* Background decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-colors duration-500 ${
                index % 2 === 0
                  ? "bg-asu-maroon/5 group-hover:bg-asu-gold/5"
                  : "bg-asu-maroon/10 group-hover:bg-asu-gold/10"
              }`} />
              
              {/* Profile Photo */}
              <div className="flex items-center gap-4 mb-4">
                {candidate.photo_url ? (
                  <img
                    src={candidate.photo_url}
                    alt="Profile"
                    className="w-16 h-16 rounded-xl object-cover border-2 border-asu-gold/50 blur-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-asu-maroon/30 to-asu-maroon/10 flex items-center justify-center">
                    <UserCircle className="w-8 h-8 text-asu-gold" />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-asu-gold transition-colors">
                    {candidate.first_name?.[0]}.{candidate.last_name?.[0]}.
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-asu-gold/90 mt-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>
                      {candidate.education?.[0]?.degree}
                      {candidate.education?.[0]?.major && (
                        <span className="text-gray-400">
                          {' '}in {candidate.education[0].major}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Work Authorization */}
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-asu-gold flex-shrink-0" />
                <span className="text-sm text-gray-300 truncate">{candidate.nationality_status}</span>
              </div>

              {/* Security Clearance & Veteran Status */}
              {(candidate.security_clearance || candidate.veteran_status) && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {candidate.security_clearance && (
                      <span className="bg-asu-maroon/20 px-2 py-1 rounded-full text-gray-300 text-sm flex items-center gap-1">
                        <Shield className="w-4 h-4 text-asu-gold" />
                        {candidate.security_clearance}
                      </span>
                    )}
                    {candidate.veteran_status && (
                      <span className="bg-asu-maroon/20 px-2 py-1 rounded-full text-gray-300 text-sm flex items-center gap-1">
                        <Award className="w-4 h-4 text-asu-gold" />
                        {candidate.veteran_status}
                      </span>
                    )}
                </div>
              )}

              {/* Skills */}
              {candidate.technical_skills && candidate.technical_skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-auto">
                  {candidate.technical_skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-asu-maroon/20 text-asu-gold/90 rounded-full text-sm border border-asu-maroon/30 group-hover:border-asu-gold/30 transition-colors"
                    >
                      {skill}
                    </span>
                  ))}
                  {candidate.technical_skills.length > 3 && (
                    <span className="px-2 py-1 bg-asu-maroon/10 text-gray-400 rounded-full text-sm">
                      +{candidate.technical_skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Premium Features Preview */}
        <div className="mt-12 bg-gradient-to-r from-asu-maroon to-asu-dark rounded-xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(140,29,64,0.2),transparent_70%)]" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-4">
              Unlock Full Access to Top Microelectronics Talent
            </h2>
            <p className="text-xl text-gray-300 mb-6 max-w-2xl mx-auto">
              Get direct access to candidate contact information, detailed work history, and advanced search features.
            </p>
            <button
              onClick={handleRequestAccess}
              className="bg-asu-gold text-asu-dark px-8 py-4 rounded-full text-lg font-semibold hover:bg-asu-gold/90 transition-all duration-300"
            >
              Request Access Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}