import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { useQuery } from '@tanstack/react-query'
import Footer from '../components/Footer'
import { 
  CircleUserRound, 
  TrendingUp, 
  ArrowRight,
  Medal,
  GraduationCap, 
  Calendar, 
  BookOpen, 
  Users, 
  Bell,
  Briefcase,
  Bookmark,
  PlayCircle
} from 'lucide-react'

interface ProfileStats {
  viewCount: number
  completeness: number
  lastResumeUpdate: string | null
  saveCount: number
  credentials: Array<{
    name: string
    issuer: string
    earnedAt: string
    badgeUrl?: string
  }>
}

interface Event {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  location: string;
  url?: string;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  category: string;
  company: string;
  duration: string;
  view_count: number;
}

interface UpcomingMicrocredential {
  id: string;
  title: string;
  description: string;
  url: string;
  start_date: string;
  duration: string;
}

export default function Dashboard() {
  const { user, isEmailVerified } = useAuth()
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<any[]>([])
  const [totalCandidates, setTotalCandidates] = useState(0)
  const [resources, setResources] = useState<Resource[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [upcomingCredentials, setUpcomingCredentials] = useState<UpcomingMicrocredential[]>([])

  // Fetch upcoming events
  const { data: events } = useQuery<Event[]>({
    queryKey: ['upcoming-events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date')
        .limit(3);

      if (error) throw error;
      return data;
    }
  });

  // Load semiconductor resources
  useEffect(() => {
    async function loadResources() {
      try {
        const { data, error } = await supabase
          .from('semiconductor_resources')
          .select('*')
          .order('published_at', { ascending: false })
          .limit(3);

        if (error) throw error;
        setResources(data || []);
      } catch (error) {
        console.error('Error loading resources:', error);
      }
    }

    loadResources();
  }, []);

  const loadSavedCandidates = async () => {
    try {
      // Get employer's profile ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user?.id)
        .single()

      if (!profile) return

      // Get saved candidates
      const { data: savedCandidates, error } = await supabase
        .from('saved_candidates')
        .select('candidate_id')
        .eq('employer_id', profile.id)

      if (error) throw error

      return savedCandidates?.map(sc => sc.candidate_id) || []
    } catch (error) {
      console.error('Error loading saved candidates:', error)
      return []
    }
  }
  
  // Fetch upcoming micro-credentials
  useEffect(() => {
    async function fetchUpcomingCredentials() {
      const { data, error } = await supabase
        .from('upcoming_microcredentials')
        .select('*')
        .gte('start_date', new Date().toISOString())
        .order('start_date')
        .limit(3);

      if (error) {
        console.error('Error fetching upcoming credentials:', error);
        return;
      }

      setUpcomingCredentials(data || []);
    }

    fetchUpcomingCredentials();
  }, []);

  if (!isEmailVerified) {
    return (
      <>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-asu-dark p-8 rounded-xl border border-asu-maroon/30 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Email Verification Required</h2>
            <p className="text-gray-300 mb-6">
              Please verify your email address to access the dashboard. Check your inbox for the verification link.
            </p>
            <p className="text-gray-400 text-sm">
              If you haven't received the verification email, you can request a new one from your profile settings.
            </p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // Helper function to get user credentials
  const getUserCredentials = async (profileId: string) => {
    const { data: credentials } = await supabase
      .from('user_credentials')
      .select(`
        credential_id,
        earned_at,
        expires_at,
        badge_url,
        micro_credentials (
          id,
          name,
          issuer
        )
      `)
      .eq('user_id', profileId)
      .order('earned_at', { ascending: false })

    return credentials?.map(cred => ({
      name: cred.micro_credentials?.name || '',
      issuer: cred.micro_credentials?.issuer || '',
      earnedAt: new Date(cred.earned_at).toLocaleDateString(),
      badgeUrl: cred.badge_url
    })) || []
  }

  useEffect(() => {
    async function fetchProfileStats() {
      if (!user) return
      setLoading(true)
      setLoading(true)

      try {
        // Get profile first
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, view_count')
          .eq('user_id', user.id)
          .single()

        if (profileError) throw profileError
        if (!profile) {
          setError('Profile not found')
          setLoading(false)
          return
        }

        // Get user's earned credentials
        const { data: credentialsData, error: credentialsError } = await supabase
          .from('user_credentials')
          .select(`
            credential_id,
            earned_at,
            expires_at,
            badge_url,
            micro_credentials (
              name,
              issuer
            )
          `)
          .eq('user_id', profile.id)

        if (credentialsError) throw credentialsError

        const credentials = credentialsData?.map(cred => ({
          name: cred.micro_credentials?.name || '',
          issuer: cred.micro_credentials?.issuer || '',
          earnedAt: new Date(cred.earned_at).toLocaleDateString(),
          badgeUrl: cred.badge_url
        })) || []

        // Get save count
        const { data: saveCount, error: saveCountError } = await supabase
          .rpc('get_profile_save_count', { profile_id: profile.id })

        if (saveCountError) throw saveCountError

        // Get profile completeness
        // Try to get profile completeness from RPC, fallback to client-side calculation
        let completeness = 0
        try {
          const { data: rpcCompleteness, error: completionError } = await supabase
            .rpc('calculate_profile_completeness', { profile_id: profile.id })
          
          if (!completionError && rpcCompleteness !== null) {
            completeness = rpcCompleteness
          } else {
            // Fallback: calculate completeness on client side
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', profile.id)
              .single()
            
            if (profileData) {
              completeness = calculateClientSideCompleteness(profileData)
            }
          }
        } catch (error) {
          console.warn('RPC completeness calculation failed, using client-side fallback:', error)
          // Fallback: calculate completeness on client side
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profile.id)
            .single()
          
          if (profileData) {
            completeness = calculateClientSideCompleteness(profileData)
          }
        }

        setStats({
          viewCount: profile.view_count || 0,
          completeness: completeness,
          lastResumeUpdate: null,
          saveCount: saveCount || 0,
          credentials: credentials
        })

      } catch (error) {
        console.error('Error fetching profile stats:', error)
        setStats(null)
      } finally {
        setLoading(false)
      }
    }

    // Client-side profile completeness calculation
    const calculateClientSideCompleteness = (profileData: any): number => {
      const fields = [
        'first_name',
        'last_name', 
        'bio',
        'experience',
        'technical_skills',
        'soft_skills',
        'education',
        'projects',
        'job_preferences',
        'photo_url'
      ]
      
      let completedFields = 0
      
      fields.forEach(field => {
        const value = profileData[field]
        if (value !== null && value !== undefined && value !== '') {
          if (typeof value === 'string' && value.trim() !== '') {
            completedFields++
          } else if (Array.isArray(value) && value.length > 0) {
            completedFields++
          } else if (typeof value === 'object' && value !== null) {
            const keys = Object.keys(value)
            if (keys.length > 0) {
              completedFields++
            }
          } else if (typeof value !== 'string' && typeof value !== 'object') {
            completedFields++
          }
        }
      })
      
      return Math.round((completedFields / fields.length) * 100)
    }
    fetchProfileStats()
  }, [user?.id])

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard</h1>
        
        {loading ? (
          <div className="text-center text-gray-400">Loading dashboard...</div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Main Stats */}
            <div className="grid md:grid-cols-4 gap-6">
              {/* Profile Views */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <CircleUserRound className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white">Profile Views</h2>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.viewCount}
                </div>
                <p className="text-gray-400">Total profile visits</p>
              </div>

              {/* Profile Saves */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <Bookmark className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white">Profile Saves</h2>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.saveCount}
                </div>
                <p className="text-gray-400">Employers saved your profile</p>
              </div>

              {/* Profile Completeness */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white">Profile Completeness</h2>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.completeness}%
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
                  <div
                    className="bg-asu-gold h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${stats.completeness}%` }}
                  ></div>
                </div>
                <Link 
                  to="/profile" 
                  className="text-sm text-asu-gold hover:text-asu-gold/80 flex items-center gap-1"
                >
                  Edit Profile
                </Link>
              </div>

              {/* Micro-credentials */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-4">
                  <Medal className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white">Micro-credentials</h2>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {stats.credentials?.length || 0}
                </div>
                <p className="text-gray-400">Earned credentials</p>
              </div>
            </div>

            {/* Learning Path & Upcoming Events */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Learning Path */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-6">
                  <GraduationCap className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white">Enhance Your Profile</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-asu-maroon/20 flex items-center justify-center group-hover:bg-asu-gold/20 transition-colors">
                      <span className="text-asu-maroon font-semibold group-hover:text-asu-gold transition-colors">1</span>
                    </div>
                    <div className="flex-1">
                      <Link to="/profile" className="flex items-center gap-2 text-white font-medium hover:text-asu-gold transition-colors">
                        <span>Complete Profile</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div
                          className="bg-asu-gold h-2 rounded-full"
                          style={{ width: `${stats.completeness}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-asu-maroon/20 flex items-center justify-center group-hover:bg-asu-gold/20 transition-colors">
                      <span className="text-asu-maroon font-semibold group-hover:text-asu-gold transition-colors">2</span>
                    </div>
                    <div className="flex-1">
                      <Link to="/profile" className="flex items-center gap-2 text-white font-medium hover:text-asu-gold transition-colors">
                        <span>Add Projects</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <p className="text-sm text-gray-400">Showcase your work</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-8 h-8 rounded-full bg-asu-maroon/20 flex items-center justify-center group-hover:bg-asu-gold/20 transition-colors">
                      <span className="text-asu-maroon font-semibold group-hover:text-asu-gold transition-colors">3</span>
                    </div>
                    <div className="flex-1">
                      <Link to="/profile" className="flex items-center gap-2 text-white font-medium hover:text-asu-gold transition-colors">
                        <span>Upload Resume</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <p className="text-sm text-gray-400">
                        {stats.lastResumeUpdate
                          ? `Last updated ${new Date(stats.lastResumeUpdate).toLocaleDateString()}`
                          : 'PDF format recommended'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Upcoming Events */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-asu-gold" />
                    <h2 className="text-lg font-semibold text-white">Upcoming Events</h2>
                  </div>
                </div>
                <div className="space-y-4">
                  {events?.length === 0 ? (
                    <div className="text-center text-gray-400">No upcoming events</div>
                  ) : (
                    events?.map(event => {
                      const date = new Date(event.start_date);
                      const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
                      const day = date.getDate();
                      
                      return (
                        <div key={event.id} className="flex items-start gap-4">
                          <div className="w-12 text-center">
                            <div className="text-asu-gold font-semibold">{month}</div>
                            <div className="text-2xl font-bold text-white">{day}</div>
                          </div>
                          <a
                            href={event.url}
                            target="_blank"
                            rel="nopener noreferrer"
                            className="flex-1 group"
                          >
                            <h3 className="text-white font-medium">{event.title}</h3>
                            <p className="text-sm text-gray-400">
                              {event.location} • {new Date(event.start_date).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                timeZone: 'America/Phoenix'
                              })} MST
                            </p>
                          </a>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Resources & Community */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Recommended Resources */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-6">
                  <BookOpen className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white">Recommended Short Courses</h2>
                </div>
                <div className="space-y-4 mt-4">
                  {upcomingCredentials.length === 0 ? (
                    <div className="text-center text-gray-400">No upcoming micro-credentials</div>
                  ) : (
                    upcomingCredentials.map(cred => (
                      <a
                        key={cred.id}
                        href={cred.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block group"
                      >
                        <h3 className="text-white font-medium group-hover:text-asu-gold">
                          {cred.title}
                        </h3>
                        {cred.description && (
                          <p className="text-sm text-gray-400 mt-1">
                            {cred.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <span>Starts {new Date(cred.start_date).toLocaleDateString()}</span>
                          {cred.duration && (
                            <>
                              <span>•</span>
                              <span>{cred.duration}</span>
                            </>
                          )}
                        </div>
                      </a>
                    ))
                  )}
                </div>
              </div>

              {/* Learning Resources */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                <div className="flex items-center gap-3 mb-6">
                  <PlayCircle className="w-5 h-5 text-asu-gold" />
                  <h2 className="text-lg font-semibold text-white"> Youtube Learning Resources</h2>
                </div>
                <div className="space-y-4 mt-4">
                  {resources.length === 0 ? (
                    <div className="text-center text-gray-400">No resources available</div>
                  ) : (
                    resources.map(resource => (
                      <a
                        key={resource.id}
                        href={resource.video_url}
                        target="_blank"
                        rel="noopener noreferrer" 
                        className="flex items-start gap-4 group"
                      >
                        <div className="flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden">
                          <img 
                            src={resource.thumbnail_url} 
                            alt={resource.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-white font-medium group-hover:text-asu-gold line-clamp-2">
                            {resource.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                            <span>{resource.company}</span>
                            <span>•</span>
                            <span>{resource.duration}</span>
                          </div>
                        </div>
                      </a>
                    )).slice(0, 3)
                  )}
                  <div className="mt-6 text-center">
                    <Link
                      to="/resources"
                      className="inline-flex items-center gap-2 text-asu-gold hover:text-asu-gold/80 transition-colors"
                    >
                      View all resources
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400">No dashboard data available</div>
        )}
      </div>
      <Footer />
    </>
  )
}