import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { v4 as uuidv4 } from 'uuid'
import { 
  Search,
  Filter, 
  AlertCircle,
  X,
  ChevronDown,
  MapPin,
  GraduationCap,
  Briefcase,
  Shield,
  Users,
  Mail,
  Award
} from 'lucide-react'
import CandidateCard from '../components/CandidateCard'
import Notification from '../components/Notification'
import SkillsDropdown from '../components/SkillsDropdown'

const NATIONALITY_STATUS_OPTIONS = [
  'US Citizen',
  'Green Card',
  'H1-B Eligible',
  'OPT/CPT',
  'TN Visa'
]

const EDUCATION_LEVELS = [
  'AS',
  'BS',
  'MS',
  'PhD'
]

const EMPLOYMENT_TYPES = [
  'full-time',
  'part-time',
  'internship',
  'contract'
]

function CandidateSearch() {
  const navigate = useNavigate()
  const [employerProfileId, setEmployerProfileId] = useState<string | null>(null)
  const [sessionId] = useState(() => uuidv4())
  const [searchInstanceId] = useState(() => uuidv4())
  const [loading, setLoading] = useState(true)
  const [savedCandidates, setSavedCandidates] = useState<string[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<any[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    isOpen: boolean;
  }>({ type: 'error', message: '', isOpen: false })
  const [viewedProfiles, setViewedProfiles] = useState<Set<string>>(new Set())
  const ITEMS_PER_PAGE = 10
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    keywords: '',
    nationality_status: [] as string[],
    employment_type: [] as string[],
    educationLevel: [] as string[],
    technical_skills: [] as string[],
    lastActive: null as number | null
  })
  const [availableSkills, setAvailableSkills] = useState<string[]>([])
  const [loadingSkills, setLoadingSkills] = useState(false)

  useEffect(() => {
    loadCandidates()
    loadSavedCandidates()
    loadEmployerProfile()
    loadAvailableSkills()
  }, [filters, currentPage])

  const loadAvailableSkills = async () => {
    try {
      setLoadingSkills(true)
      
      // Fetch unique skills from the database
      const { data, error } = await supabase
        .from('profiles')
        .select('technical_skills')
        .eq('type', 'candidate')
        .not('technical_skills', 'is', null)
      
      if (error) throw error
      
      // Extract unique skills from all profiles
      const uniqueSkills = new Set<string>()
      
      data?.forEach(profile => {
        if (Array.isArray(profile.technical_skills)) {
          profile.technical_skills.forEach((skill: string) => {
            if (typeof skill === 'string' && skill.trim()) {
              uniqueSkills.add(skill)
            }
          })
        }
      })
      
      // Convert to array and sort alphabetically
      setAvailableSkills(Array.from(uniqueSkills).sort())
    } catch (error) {
      console.error('Error loading skills:', error)
    } finally {
      setLoadingSkills(false)
    }
  }

  const loadEmployerProfile = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('type', 'employer')
        .single()

      if (profile) {
        setEmployerProfileId(profile.id)
      }
    } catch (error) {
      console.error('Error loading employer profile:', error)
    }
  }

  const trackFilterChange = async (newFilters: typeof filters) => {
    if (!employerProfileId) return

    try {
      await supabase
        .from('filter_tracking')
        .insert({
          employer_id: employerProfileId,
          filter_combination: newFilters,
          session_id: sessionId,
          search_instance_id: searchInstanceId
        })
    } catch (error) {
      console.error('Error tracking filter change:', error)
      // Continue with filter update even if tracking fails
    }
  }

  const loadSavedCandidates = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile) return

      const { data: saved } = await supabase
        .from('saved_candidates')
        .select('candidate_id')
        .eq('employer_id', profile.id)

      if (saved) {
        setSavedCandidates(saved.map(s => s.candidate_id))
      }
    } catch (error) {
      console.error('Error loading saved candidates:', error)
    }
  }

  const handleSaveCandidate = async (candidateId: string) => {
    try {
      // Get employer's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()
      if (profileError) {
        throw new Error('Could not find employer profile. Please ensure you are logged in as an employer.')
      }

      if (!profile) return

      if (savedCandidates.includes(candidateId)) {
        // Unsave candidate
        const { error: deleteError } = await supabase
          .from('saved_candidates')
          .delete()
          .eq('employer_id', profile.id)
          .eq('candidate_id', candidateId)

        if (deleteError) {
          throw new Error(deleteError.message || 'Failed to remove candidate from saved list')
        }

        setSavedCandidates(prev => prev.filter(id => id !== candidateId))
        setNotification({
          type: 'success',
          message: 'Candidate removed from saved list',
          isOpen: true
        })
      } else {
        // Save candidate
        const { error: insertError } = await supabase
          .from('saved_candidates')
          .insert({
            employer_id: profile.id,
            candidate_id: candidateId
          })

        if (insertError) {
          if (insertError.code === '23505') {
            throw new Error('You have already saved this candidate')
          }
          throw new Error(insertError.message || 'Failed to save candidate')
        }

        setSavedCandidates(prev => [...prev, candidateId])
        setNotification({
          type: 'success',
          message: 'Candidate saved successfully',
          isOpen: true
        })
      }
    } catch (error) {
      console.error('Error saving candidate:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to save candidate',
        isOpen: true
      })
      // Refresh saved candidates list to ensure UI is in sync with database
      await loadSavedCandidates()
    }
  }

  const handleCandidateClick = async (candidateId: string) => {
    // Only track view if we haven't viewed this profile in this session
    if (!viewedProfiles.has(candidateId)) {
      try {
        const { error } = await supabase.rpc('track_profile_view', {
          profile_id: candidateId
        })

        if (error) throw error

        // Add to viewed profiles set
        setViewedProfiles(prev => new Set([...prev, candidateId]))
      } catch (error) {
        console.error('Error tracking profile view:', error)
      }
    }

    // Set as selected candidate
    setSelectedCandidate(candidateId)
  }

  const loadCandidates = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          photo_url,
          bio,
          linkedin,
          credentials,
          veteran_status,
          projects,
          education,
          experience,
          technical_skills,
          soft_skills,
          nationality_status,
          security_clearance,
          job_preferences,
          view_count,
          last_viewed_at,
          updated_at,
          email_address
        `, { count: 'exact' })
        .eq('type', 'candidate')
        .order('updated_at', { ascending: false })
    
      // Apply nationality status filter
      if (filters.nationality_status.length > 0) {
        query = query.in('nationality_status', filters.nationality_status)
      }
      
      // Apply employment type filter
      if (filters.employment_type.length > 0) {
        const employmentTypeArray = JSON.stringify(filters.employment_type);
        query = query.filter('job_preferences->employmentTypes', 'cs', employmentTypeArray)
      }

      /*
      // Apply technical skills filter
      if (filters.technical_skills.length > 0) {
        // Use OR logic for technical skills
        const skillsFilter = filters.technical_skills.map(skill => 
          `technical_skills::text ILIKE '%${skill}%'`
        ).join(' OR ')
        
        query = query.or(skillsFilter)
      }
      */
      
      // Match a row that contains *any* of the selected skills (OR logic)
      if (filters.technical_skills.length) {
        const orList = filters.technical_skills
          .map(s => {
            // escape any quotes inside the skill text, then wrap it:
            // ["Chemical Vapor Deposition (CVD)"]
            const json = `["${s.replace(/"/g, '\\"')}"]`;
            return `technical_skills.cs.${json}`;   // cs = "contains" operator
          })
          .join(',');                               // skill1 OR skill2 …
      
        query = query.or(orList);
      }
      

      if (filters.lastActive) {
        const cutoffDate = new Date()
        cutoffDate.setDate(cutoffDate.getDate() - filters.lastActive)
        query = query.gte('updated_at', cutoffDate.toISOString())
      }

      // Pagination
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + (ITEMS_PER_PAGE - 1)
      query = query.range(from, to)

      const { data: candidates, error, count } = await query

      if (error) throw error

      // Update state
      const parsedCandidates = (candidates || []).map(candidate => ({
        ...candidate,
        education: parseJsonField(candidate.education),
        experience: parseJsonField(candidate.experience),
        projects: parseJsonField(candidate.projects),
        technical_skills: parseJsonField(candidate.technical_skills),
        soft_skills: parseJsonField(candidate.soft_skills),
        job_preferences: candidate.job_preferences || {},
        earned_credentials: candidate.earned_credentials?.map(cred => ({
          name: cred.micro_credentials?.name || '',
          issuer: cred.micro_credentials?.issuer || '',
          earned_at: new Date(cred.earned_at).toLocaleDateString(),
          expires_at: cred.expires_at ? new Date(cred.expires_at).toLocaleDateString() : undefined,
          badge_url: cred.badge_url
        })) || []
      }))
      
      setCandidates(parsedCandidates)
      setTotalResults(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
      
    } catch (error) {
      console.error('Error loading candidates:', error)
      setNotification({
        type: 'error',
        message: 'Failed to load candidates. Please try again.',
        isOpen: true
      })
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely parse JSON fields
  const parseJsonField = (field: any): any[] => {
    if (Array.isArray(field)) return field
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    trackFilterChange(newFilters)
    setCurrentPage(1) // Reset pagination when filters change
  }

  const clearFilters = () => {
    const newFilters = {
      keywords: '',
      nationality_status: [],
      employment_type: [],
      educationLevel: [],
      technical_skills: [],
      lastActive: null
    }
    setFilters(newFilters)
    trackFilterChange(newFilters)
    setCurrentPage(1)
  }

  const selectedCandidateData = selectedCandidate ? candidates.find(c => c.id === selectedCandidate) : null

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark">
      <Notification
        type={notification.type}
        message={notification.message}
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />
      
      {/* Search Filters */}
      <div className="sticky top-16 z-10 bg-asu-dark border-b border-asu-maroon/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4">
            {/* Nationality Status */}
            <div className="w-48">
              <select
                value={filters.nationality_status[0] || ''}
                onChange={(e) => handleFilterChange('nationality_status', e.target.value ? [e.target.value] : [])}
                className="w-full px-4 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold"
              >
                <option value="">Work Authorization</option>
                {NATIONALITY_STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Employment Type */}
            <div className="w-48">
              <select
                value={filters.employment_type[0] || ''}
                onChange={(e) => handleFilterChange('employment_type', e.target.value ? [e.target.value] : [])}
                className="w-full px-4 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold"
              >
                <option value="">Seeking Employment Type</option>
                {EMPLOYMENT_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Education Level */}
            <div className="w-48">
              <select
                value={filters.educationLevel[0] || ''}
                onChange={(e) => handleFilterChange('educationLevel', [e.target.value])}
                className="w-full px-4 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold"
              >
                <option value="">Recent Education</option>
                {EDUCATION_LEVELS.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            {/* Last Active */}
            <div className="w-48">
              <select
                value={filters.lastActive || ''}
                onChange={(e) => handleFilterChange('lastActive', e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 bg-asu-darker border border-asu-maroon/30 rounded-lg text-white focus:outline-none focus:border-asu-gold"
              >
                <option value="">Last Active</option>
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-white rounded-lg hover:bg-asu-maroon/30 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </button>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-white rounded-lg hover:bg-asu-maroon/30 transition-colors"
              >
                <X className="w-4 h-4" />
                Clear
              </button>
            </div>
          </div>
          
          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 border-t border-asu-maroon/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Technical Skills Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Technical Skills
                  </label>
                  <SkillsDropdown
                    skills={availableSkills}
                    selectedSkills={filters.technical_skills}
                    onSkillsChange={(skills) => handleFilterChange('technical_skills', skills)}
                    isLoading={loadingSkills}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Layout */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Left Column - Results List */}
          <div className="w-1/3 space-y-4">
            <div className="text-gray-300 mb-4">
              {totalResults} candidates found
            </div>

            <div 
              className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-4 custom-scrollbar"
            >
              {candidates.map(candidate => (
                <div
                  key={candidate.id}
                  onClick={() => handleCandidateClick(candidate.id)}
                  className="cursor-pointer"
                >
                  <CandidateCard
                    candidate={candidate}
                    onSave={handleSaveCandidate}
                    isSaved={savedCandidates.includes(candidate.id)}
                    onClick={() => handleCandidateClick(candidate.id)}
                    isSelected={selectedCandidate === candidate.id}
                  />
                </div>
              ))}

              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-asu-gold mx-auto"></div>
                </div>
              )}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 sticky bottom-0 bg-asu-darker p-4 border-t border-asu-maroon/30">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-gray-300">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Detailed View */}
          <div className="w-2/3">
            {selectedCandidateData ? (
              <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6 overflow-y-auto max-h-[calc(100vh-200px)] custom-scrollbar">
                {/* Profile Header */}
                <div className="flex items-start gap-8 mb-8">
                  {/* Profile Image */}
                  <div className="relative flex flex-col items-center gap-4">
                    {selectedCandidateData.photo_url ? (
                      <img
                        src={selectedCandidateData.photo_url}
                        alt={`${selectedCandidateData.first_name} ${selectedCandidateData.last_name}`}
                        className="w-36 h-36 rounded-full object-cover border-2 border-asu-gold shadow-xl mb-2"
                      />
                    ) : (
                      <div className="w-36 h-36 rounded-full bg-gradient-to-br from-asu-maroon/30 to-asu-maroon/10 flex items-center justify-center border-2 border-asu-maroon/30">
                        <Users className="w-20 h-20 text-asu-gold" />
                      </div>
                    )}
                   
                    {/* Availability Indicator */}
                    {selectedCandidateData.job_opportunity_type && (
                      <div className="flex flex-col items-center gap-2 mt-2">
                        <div className="flex items-center gap-2 bg-asu-dark/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-asu-maroon/30 shadow-lg">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-medium text-white">Available for</span>
                        </div>
                        <span className="text-sm bg-asu-maroon/30 text-asu-gold px-3 py-1 rounded-full border border-asu-gold/20 shadow-sm">
                          {selectedCandidateData.job_opportunity_type.split('-').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-3xl font-bold text-white mb-4">
                        {selectedCandidateData.first_name} {selectedCandidateData.last_name} 
                        {selectedCandidateData.email_address && (
                          <div className="flex items-center gap-2 text-gray-300 mt-2 text-base font-normal">
                            <Mail className="w-4 h-4 text-asu-gold" />
                            <span className="font-mono">{selectedCandidateData.email_address}</span>
                          </div>
                        )}
                      </h2>
                      <button
                        onClick={() => handleSaveCandidate(selectedCandidateData.id)}
                        className="flex items-center gap-2 bg-asu-dark border border-asu-maroon/30 text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/20 transition-colors"
                      >
                        {savedCandidates.includes(selectedCandidateData.id) ? 'Unsave' : 'Save'}
                      </button>
                    </div>

                    {/* Education Summary */}
                    {Array.isArray(selectedCandidateData.education) && selectedCandidateData.education[0] && (
                      <div className="flex items-center gap-2 text-gray-300 mb-6">
                        <GraduationCap className="w-4 h-4 text-asu-gold" />
                        <span>
                          {selectedCandidateData.education[0].degree}
                          {selectedCandidateData.education[0].major && ` in ${selectedCandidateData.education[0].major}`}
                          {selectedCandidateData.education[0].field && !selectedCandidateData.education[0].major && ` in ${selectedCandidateData.education[0].field}`}
                          {selectedCandidateData.education[0].school && ` • ${selectedCandidateData.education[0].school}`}
                        </span>
                      </div>
                    )}

                    {/* Status Badges */}
                    <div className="flex flex-wrap gap-3 mb-6">
                      {selectedCandidateData.nationality_status && (
                        <div className="flex items-center gap-2 text-gray-300 bg-asu-maroon/10 px-3 py-1 rounded-full">
                          <MapPin className="w-4 h-4 text-asu-gold" />
                          <span>{selectedCandidateData.nationality_status}</span>
                        </div>
                      )}

                      {selectedCandidateData.security_clearance && (
                        <div className="flex items-center gap-2 text-gray-300 bg-asu-maroon/10 px-3 py-1 rounded-full">
                          <Shield className="w-4 h-4 text-asu-gold" />
                          <span>{selectedCandidateData.security_clearance}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedCandidateData.bio && (
                  <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">About</h2>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedCandidateData.bio}</p>
                  </div>
                )}

                {/* Skills Section */}
                <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6 mb-8">
                  <h2 className="text-xl font-bold text-white mb-6">Skills</h2>
                  
                  {/* Technical Skills */}
                  {Array.isArray(selectedCandidateData.technical_skills) && selectedCandidateData.technical_skills.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-lg font-semibold text-asu-gold mb-4">Technical Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidateData.technical_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-asu-maroon/20 to-asu-maroon/10 text-asu-gold text-sm border border-asu-maroon/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Soft Skills */}
                  {Array.isArray(selectedCandidateData.soft_skills) && selectedCandidateData.soft_skills.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-asu-gold mb-4">Soft Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedCandidateData.soft_skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1.5 rounded-full bg-gradient-to-r from-asu-maroon/20 to-asu-maroon/10 text-asu-gold text-sm border border-asu-maroon/20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Experience Section */}
                {Array.isArray(selectedCandidateData.experience) && selectedCandidateData.experience.length > 0 && (
                  <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Experience</h2>
                    <div className="space-y-8">
                      {selectedCandidateData.experience.map((exp, index) => (
                        <div key={index} className="relative pl-6 border-l-2 border-asu-maroon/30 last:border-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asu-maroon border-2 border-asu-gold" />
                          <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white">{exp.position}</h3>
                            <p className="text-asu-gold">{exp.company}</p>
                            <div className="text-gray-400 text-sm mt-1">
                              {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                            </div>
                          </div>
                          <p className="text-gray-300 whitespace-pre-wrap">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Projects Section */}
                {Array.isArray(selectedCandidateData.projects) && selectedCandidateData.projects.length > 0 && (
                  <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Projects</h2>
                    <div className="space-y-8">
                      {selectedCandidateData.projects.map((project, index) => (
                        <div key={index} className="relative pl-6 border-l-2 border-asu-maroon/30 last:border-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asu-maroon border-2 border-asu-gold" />
                          <div className="mb-2">
                            <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                            {(project.startDate || project.endDate) && (
                              <div className="text-gray-400 text-sm">
                                {project.startDate}
                                {project.endDate && ` - ${project.endDate}`}
                              </div>
                            )}
                          </div>
                          <p className="text-gray-300 mb-4">{project.description}</p>
                          {project.technologies && Array.isArray(project.technologies) && project.technologies.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {project.technologies.map((tech, techIndex) => (
                                <span
                                  key={techIndex}
                                  className="px-2 py-1 text-sm bg-asu-maroon/20 text-asu-gold rounded-full"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Credentials Section */}
                {selectedCandidateData.credentials && (
                  <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Credentials</h2>
                    {selectedCandidateData.earned_credentials && selectedCandidateData.earned_credentials.length > 0 && (
                      <div className="space-y-4 mb-6">
                        {selectedCandidateData.earned_credentials.map((credential, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-asu-maroon/20 flex items-center justify-center">
                              {credential.badge_url ? (
                
                                <img
                                  src={credential.badge_url}
                                  alt={credential.name}
                                  className="w-8 h-8"
                                />
                              ) : (
                                <Award className="w-6 h-6 text-asu-gold" />
                              )}
                            </div>
                            <div>
                              <h3 className="text-white font-medium">{credential.name}</h3>
                              <p className="text-sm text-gray-400">
                                {credential.issuer} • Earned {credential.earned_at}
                                {credential.expires_at && ` • Expires ${credential.expires_at}`}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {selectedCandidateData.credentials}
                    </div>
                  </div>
                )}

                {/* Education Section */}
                {Array.isArray(selectedCandidateData.education) && selectedCandidateData.education.length > 0 && (
                  <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Education</h2>
                
                    <div className="space-y-8">
                      {selectedCandidateData.education.map((edu: any, index: number) => (
                        <div key={index} className="relative pl-6 border-l-2 border-asu-maroon/30 last:border-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asu-maroon border-2 border-asu-gold" />
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-lg font-semibold text-asu-gold">
                                {edu.degree}
                                {edu.major &&   ` in ${edu.major}`}
                                {edu.field && !edu.major && ` in ${edu.field}`}
                              </div>
                              <div className="text-white text-base mt-1">
                                {edu.school}
                              </div>
                            </div>
                            {edu.graduationDate && (
                              <span className="text-gray-400 text-sm">{edu.graduationDate}</span>
                            )}
                          </div>
                          {edu.description && (
                            <p className="text-gray-300 mt-2">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Select a candidate to view their full profile
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CandidateSearch