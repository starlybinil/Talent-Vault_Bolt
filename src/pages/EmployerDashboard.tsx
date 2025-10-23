import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { 
  Search,
  Loader2,
  Filter,
  X,
  ChevronDown,
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  Shield,
  Flag,
  Download,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import CandidateCard from '../components/CandidateCard'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

const parseJsonField = (field: any): any[] => {
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const NATIONALITY_STATUS_OPTIONS = [
  'US Citizen',
  'Green Card',
  'H1-B Eligible',
  'OPT/CPT',
  'TN Visa'
]

const EDUCATION_LEVELS = [
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

interface DashboardStats {
  totalCandidates: number;
  educationBreakdown: {
    [key: string]: number;
  };
  employmentTypeBreakdown: {
    [key: string]: number;
  };
  nationalityBreakdown: {
    [key: string]: number;
  };
  veteranCount: number;
  topSkills: {
    skill: string;
    count: number;
  }[];
}

function EmployerDashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCandidates, setTotalCandidates] = useState(0)
  const ITEMS_PER_PAGE = 9
  const [filters, setFilters] = useState({
    nationality: [] as string[],
    education: [] as string[],
    employmentType: [] as string[]
  })
  const [candidates, setCandidates] = useState<any[]>([])
  const [savedCandidates, setSavedCandidates] = useState<any[]>([])
  const navigate = useNavigate()

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  //HERE
  /*
  // Load dashboard stats
  useEffect(() => {
    async function loadStats() {
      try {
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('type', 'candidate')

        if (error) throw error

        const stats: DashboardStats = {
          totalCandidates: profiles.length,
          educationBreakdown: {},
          employmentTypeBreakdown: {},
          nationalityBreakdown: {},
          veteranCount: 0,
          topSkills: []
        }

        // Process profiles for stats
        const skillsCount: { [key: string]: number } = {}

        // Initialize all counters
        EDUCATION_LEVELS.forEach(level => stats.educationBreakdown[level] = 0)
        EMPLOYMENT_TYPES.forEach(type => stats.employmentTypeBreakdown[type] = 0)
        NATIONALITY_STATUS_OPTIONS.forEach(status => stats.nationalityBreakdown[status] = 0)

        profiles.forEach(profile => {
          // Education breakdown
          if (profile.education && Array.isArray(profile.education)) {
            profile.education.forEach((edu: any) => {
              // Handle both string and object formats
              const degree = typeof edu === 'object' && edu !== null ? edu.degree : edu
              if (degree) {
                // Match degree level exactly
                const level = EDUCATION_LEVELS.find(l => {
                  const degreeUpper = degree.toUpperCase().trim()
                  return degreeUpper.startsWith(l) || degreeUpper.includes(` ${l}`)
                })
                if (level) {
                  stats.educationBreakdown[level] = (stats.educationBreakdown[level] || 0) + 1
                }
              }
            })
          }

          // Employment type breakdown
          if (profile.job_opportunity_type) {
            stats.employmentTypeBreakdown[profile.job_opportunity_type] = 
              (stats.employmentTypeBreakdown[profile.job_opportunity_type] || 0) + 1
          }

          // Nationality breakdown
          if (profile.nationality_status) {
            stats.nationalityBreakdown[profile.nationality_status] = 
              (stats.nationalityBreakdown[profile.nationality_status] || 0) + 1
          }

          // Veteran count
          if (profile.veteran_status === 'Veteran') {
            stats.veteranCount++
          }

          // Skills count
          if (profile.technical_skills && Array.isArray(profile.technical_skills)) {
            profile.technical_skills.forEach(skill => {
              skillsCount[skill] = (skillsCount[skill] || 0) + 1
            })
          }
        })

        // Get top 10 skills
        stats.topSkills = Object.entries(skillsCount)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10)

        setStats(stats)
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    }

    loadStats()
  }, [])
  */
  // Load candidates based on filters
  useEffect(() => {
    loadCandidates()
  }, [filters, debouncedSearchTerm, currentPage])

  const loadCandidates = async () => {
    setLoading(true)
    try {
      // Get employer's profile ID first
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Get saved candidates
      const { data: savedCandidates, error: savedError } = await supabase
        .from('saved_candidates')
        .select(`
          candidate_id,
          candidate:candidate_id (
            id,
            first_name,
            last_name,
            technical_skills,
            soft_skills,
            education,
            job_preferences,
            nationality_status,
            security_clearance,
            veteran_status,
            photo_url,
            email_address,
            job_opportunity_type,
            bio,
            experience,
            linkedin
          )
        `)
        .eq('employer_id', profile.id)

      if (savedError) throw savedError

      // Transform the data to get just the candidate profiles
      const candidates = savedCandidates?.map(sc => sc.candidate) || []
      setCandidates(candidates)
      setTotalCandidates(candidates.length)

    } catch (error) {
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveCandidate = async (candidateId: string) => {
    try {
      // Get employer's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Save the candidate
      const { error } = await supabase
        .from('saved_candidates')
        .insert({
          employer_id: profile.id,
          candidate_id: candidateId
        })

      if (error) throw error

      // Refresh the candidates list
      await loadCandidates()

    } catch (error) {
      console.error('Error saving candidate:', error)
    }
  }

  const deleteCandidate = async (candidateId: string) => {
    try {
      // Get employer's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      if (!profile) throw new Error('Profile not found')

      // Delete the saved candidate
      const { error: deleteError } = await supabase
        .from('saved_candidates')
        .delete()
        .eq('employer_id', profile.id)
        .eq('candidate_id', candidateId)

      if (deleteError) throw deleteError

      // Refresh the candidates list
      await loadCandidates()

    } catch (error) {
      console.error('Error deleting candidate:', error)
    }
  }

  const exportData = () => {
    if (!candidates.length) {
      setNotification({
        type: 'warning',
        message: 'No candidates to export',
        isOpen: true
      })
      return
    }

    const csvData = [
      [
        'First Name',
        'Last Name',
        'Email Address'
      ],
      ...candidates.map(candidate => [
        candidate.first_name,
        candidate.last_name,
        candidate.email_address || ''
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'saved_candidate_profiles.csv'
    a.click()
    window.URL.revokeObjectURL(url)

    setNotification({
      type: 'success',
      message: 'CSV file exported successfully',
      isOpen: true
    })
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
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Analytics Dashboard */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Candidate Analytics</h2>
            <button
              onClick={exportData}
              className="flex items-center gap-2 px-4 py-2 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon/80 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export Data
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Total Candidates */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Total Candidates</h3>
                </div>
                <div className="text-4xl font-bold text-white">{stats.totalCandidates}</div>
              </div>

              {/* Education Distribution */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <GraduationCap className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Education</h3>
                </div>
                <div className="h-32">
                  <Doughnut
                    data={{
                      labels: Object.keys(stats.educationBreakdown),
                      datasets: [
                        {
                          data: Object.values(stats.educationBreakdown),
                          backgroundColor: [
                            'rgba(255, 198, 39, 0.8)', // BS - Gold
                            'rgba(140, 29, 64, 0.8)',  // MS - Maroon
                            'rgba(255, 198, 39, 0.4)'  // PhD - Light Gold
                          ],
                          borderWidth: 0
                        }
                      ]
                    }}
                    options={{
                      maintainAspectRatio: false,
                      cutout: '60%',
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: 'white',
                            font: {
                              size: 12
                            },
                            padding: 10
                          },
                          onClick: null // Disable legend click handling
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Employment Type */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <Briefcase className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Employment Type</h3>
                </div>
                <div className="h-32">
                  <Doughnut
                    data={{
                      labels: Object.keys(stats.employmentTypeBreakdown).map(type => 
                        type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                      ),
                      datasets: [{
                        data: Object.values(stats.employmentTypeBreakdown),
                        backgroundColor: [
                          'rgba(255, 198, 39, 0.8)',
                          'rgba(140, 29, 64, 0.8)',
                          'rgba(255, 198, 39, 0.4)',
                          'rgba(140, 29, 64, 0.4)'
                        ]
                      }]
                    }}
                    options={{
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            color: 'white'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Veteran Status */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <Flag className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Veteran Status</h3>
                </div>
                <div className="text-4xl font-bold text-white mb-2">{stats.veteranCount}</div>
                <div className="text-gray-400">Veteran candidates</div>
              </div>
            </div>
          )}

          {/* Top Skills Chart */}
          {stats && stats.topSkills.length > 0 && (
            <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30 mb-8">
              <h3 className="text-lg font-semibold text-white mb-6">Top Technical Skills</h3>
              <div className="h-64">
                <Bar
                  data={{
                    labels: stats.topSkills.map(s => s.skill),
                    datasets: [{
                      label: 'Candidates',
                      data: stats.topSkills.map(s => s.count),
                      backgroundColor: 'rgba(255, 198, 39, 0.8)',
                      borderColor: 'rgba(255, 198, 39, 1)',
                      borderWidth: 1
                    }]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          color: 'white'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      },
                      x: {
                        ticks: {
                          color: 'white'
                        },
                        grid: {
                          color: 'rgba(255, 255, 255, 0.1)'
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white'
                        }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Saved Candidates Header */}
        <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6 mb-8">
          <h2 className="text-xl font-semibold text-white">
            Saved Candidates ({totalCandidates})
          </h2>
        </div>

        {/* Candidates Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map((candidate) => (
            <CandidateCard
              key={candidate.id} 
              candidate={candidate} 
              onSave={handleSaveCandidate}
              onDelete={deleteCandidate}
              isSaved={true}
              onClick={() => navigate(`/candidate/${candidate.id}`)}
            />
          ))}
          
          {candidates.length === 0 && (
            <div className="col-span-3 text-center py-12 text-gray-400">
              No saved candidates yet. Browse the <Link to="/search" className="text-asu-gold hover:text-asu-gold/80">Candidate Search</Link> to find and save candidates.
            </div>
          )}
        </div>

        {/* Premium Features Preview */}
        <div className="mt-12 bg-gradient-to-r from-asu-maroon to-asu-dark rounded-xl p-8 text-center relative overflow-hidden">
          <h2 className="text-2xl font-bold text-white mb-4">Premium Features Coming Soon</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Stay tuned for advanced analytics, AI-powered candidate matching, and more premium features to help you find the perfect candidates faster.
          </p>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard