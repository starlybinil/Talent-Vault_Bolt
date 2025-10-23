import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  UserCircle, 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Globe,
  Download,
  MessageCircle,
  GraduationCap,
  Briefcase,
  Award,
  Languages,
  CheckCircle2,
  Clock,
  Shield,
  Loader2,
  FileText
} from 'lucide-react'

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  bio: string;
  photo_url: string | null;
  linkedin: string | null;
  education: any[];
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current: boolean;
    description: string;
  }>;
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    startDate?: string;
    endDate?: string;
  }>;
  technical_skills: string[];
  soft_skills: string[];
  job_opportunity_type: string;
  nationality_status: string;
  security_clearance: string;
  veteran_status: string;
  credentials: string;
  job_preferences: {
    employmentTypes?: string[];
  };
  earned_credentials?: Array<{
    name: string;
    issuer: string;
    earned_at: string;
    expires_at?: string;
    badge_url?: string;
  }>;
}

interface ProfileSettings {
  showContactInfo: boolean;
  profileVisibility: string;
}

export default function ViewProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [settings, setSettings] = useState<ProfileSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completionPercentage, setCompletionPercentage] = useState(0)
  const [downloadingResume, setDownloadingResume] = useState(false)

  // Helper function to calculate profile completeness on client side
  const calculateClientSideCompleteness = (profileData: any) => {
    const fields = [
      profileData.first_name,
      profileData.last_name,
      profileData.bio,
      profileData.photo_url,
      profileData.experience && Array.isArray(profileData.experience) && profileData.experience.length > 0,
      profileData.technical_skills && Array.isArray(profileData.technical_skills) && profileData.technical_skills.length > 0,
      profileData.soft_skills && Array.isArray(profileData.soft_skills) && profileData.soft_skills.length > 0,
      profileData.education && Array.isArray(profileData.education) && profileData.education.length > 0,
      profileData.projects && Array.isArray(profileData.projects) && profileData.projects.length > 0,
      profileData.job_preferences && typeof profileData.job_preferences === 'object' && Object.keys(profileData.job_preferences).length > 0
    ]
    
    const completedFields = fields.filter(field => field).length
    return Math.round((completedFields / fields.length) * 100)
  }

  const handleDownloadResume = async () => {
    if (!user || !profile) return
    
    try {
      setDownloadingResume(true)
      
      // Get resume file from storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(`${user.id}/resume.pdf`)

      if (error) throw error
      
      // Create download link
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profile.first_name}_${profile.last_name}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading resume:', error)
      // Show error message to user
      setError('Failed to download resume. Please try again later.')
    } finally {
      setDownloadingResume(false)
    }
  }

  useEffect(() => {
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Get profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id,
          first_name,
          last_name,
          bio,
          photo_url,
          linkedin,
          projects,
          education,
          experience,
          technical_skills,
          soft_skills,
          job_opportunity_type,
          nationality_status,
          security_clearance,
          veteran_status,
          credentials,
          job_preferences
        `)
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) throw profileError
      if (!profileData) {
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
        .eq('user_id', profileData.id)
        .order('earned_at', { ascending: false })

      if (credentialsError) throw credentialsError

      const earned_credentials = credentialsData?.map(cred => ({
        name: cred.micro_credentials?.name || '',
        issuer: cred.micro_credentials?.issuer || '',
        earned_at: new Date(cred.earned_at).toLocaleDateString(),
        expires_at: cred.expires_at ? new Date(cred.expires_at).toLocaleDateString() : undefined,
        badge_url: cred.badge_url
      })) || []

      // Get profile settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('profile_settings')
        .select('showContactInfo, profileVisibility')
        .eq('user_id', profileData.id)
        .maybeSingle()

      if (settingsError) throw settingsError

      // Parse JSON fields safely first
      const parsedProfileData = {
        ...profileData,
        education: parseJsonField(profileData.education),
        projects: parseJsonField(profileData.projects, []),
        experience: parseJsonField(profileData.experience),
        technical_skills: parseJsonField(profileData.technical_skills),
        soft_skills: parseJsonField(profileData.soft_skills),
        job_preferences: parseJsonField(profileData.job_preferences, {})
      }

      // Get profile completion percentage with fallback
      let completion = 0
      try {
        const { data: completionData, error: completionError } = await supabase
          .rpc('calculate_profile_completeness', { profile_id: profileData.id })
        
        if (completionError) throw completionError
        completion = completionData || 0
      } catch (error) {
        console.warn('RPC calculate_profile_completeness failed, using client-side calculation:', error)
        completion = calculateClientSideCompleteness(parsedProfileData)
      }

      const parsedProfile = {
        ...parsedProfileData,
        earned_credentials
      }

      setProfile(parsedProfile)
      setSettings(settingsData || { showContactInfo: false, profileVisibility: 'private' })
      setCompletionPercentage(completion)
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to safely parse JSON fields
  const parseJsonField = (field: any, defaultValue: any[] = []) => {
    try {
      if (!field) return defaultValue
      if (Array.isArray(field)) return field
      if (typeof field === 'string') {
        const parsed = JSON.parse(field)
        return Array.isArray(parsed) ? parsed : defaultValue
      }
      return defaultValue
    } catch (error) {
      console.error('Error parsing JSON field:', error)
      return defaultValue
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-asu-gold animate-spin" />
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-asu-dark p-8 rounded-xl border border-asu-maroon/30 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
          <p className="text-gray-400">{error || 'Profile not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark pb-12">
      {/* Header Section */}
      <div className="relative bg-asu-dark border-b border-asu-maroon/30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(140,29,64,0.1),transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Profile Image */}
            <div className="relative flex flex-col items-center gap-4">
              {profile.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={`${profile.first_name} ${profile.last_name}`}
                  className="w-36 h-36 md:w-48 md:h-48 rounded-full object-cover border-2 border-asu-gold shadow-xl mb-2"
                />
              ) : (
                <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-asu-maroon/30 to-asu-maroon/10 flex items-center justify-center border-2 border-asu-maroon/30">
                  <UserCircle className="w-20 h-20 text-asu-gold" />
                </div>
              )}
              
              {/* Availability Indicator */}
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-2 bg-asu-dark/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-asu-maroon/30 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-white">Available for</span>
                </div>
                {profile.job_preferences?.employmentTypes && profile.job_preferences.employmentTypes.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {profile.job_preferences.employmentTypes.map((type, index) => (
                      <span
                        key={index}
                        className="text-sm bg-asu-maroon/30 text-asu-gold px-3 py-1 rounded-full border border-asu-gold/20 shadow-sm"
                      >
                        {type.split('-').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left md:py-4">
              <h1 className="text-4xl font-bold text-white mb-4">
                {profile.first_name} {profile.last_name}
              </h1>
              
              {profile.education && profile.education.length > 0 && (
                <div className="flex items-center gap-2 text-gray-300 mb-6">
                  <GraduationCap className="w-4 h-4 text-asu-gold" />
                  <span>
                    {profile.education[0].degree}
                    {profile.education[0].major && ` in ${profile.education[0].major}`}
                    {profile.education[0].field && !profile.education[0].major && ` in ${profile.education[0].field}`}
                    {profile.education[0].school && ` • ${profile.education[0].school}`}
                  </span>
                </div>
              )}

              <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-6">
                {profile.job_opportunity_type && (
                  <div className="flex items-center gap-2 text-gray-300 bg-asu-maroon/10 px-3 py-1 rounded-full">
                    <Briefcase className="w-4 h-4 text-asu-gold" />
                    <span>
                      Seeking {profile.job_opportunity_type.split('-').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </span>
                  </div>
                )}

                {profile.nationality_status && (
                  <div className="flex items-center gap-2 text-gray-300 bg-asu-maroon/10 px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4 text-asu-gold" />
                    <span>{profile.nationality_status}</span>
                  </div>
                )}

                {profile.security_clearance && (
                  <div className="flex items-center gap-2 text-gray-300 bg-asu-maroon/10 px-3 py-1 rounded-full">
                    <Shield className="w-4 h-4 text-asu-gold" />
                    <span>{profile.security_clearance}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-8">
                {settings?.showContactInfo && (
                  <button className="flex items-center gap-2 bg-asu-maroon text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span>Contact</span>
                  </button>
                )}
                
                <button 
                  onClick={handleDownloadResume}
                  disabled={downloadingResume}
                  className="flex items-center gap-2 bg-asu-dark border border-asu-maroon/30 text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {downloadingResume ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Download Resume</span>
                    </>
                  )}
                </button>

                {profile.linkedin && (
                  <a
                    href={profile.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-asu-dark border border-asu-maroon/30 text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/20 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                    <span>LinkedIn</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Bio Section */}
          {profile.bio && (
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Skills Section */}
          <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
            <h2 className="text-xl font-bold text-white mb-6">Skills</h2>
            
            {/* Technical Skills */}
            {profile.technical_skills && profile.technical_skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-asu-gold mb-4">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.technical_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-asu-maroon/20 to-asu-maroon/10 text-asu-gold text-sm border border-asu-maroon/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Soft Skills */}
            {profile.soft_skills && profile.soft_skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-asu-gold mb-4">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.soft_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 rounded-full bg-gradient-to-r from-asu-maroon/20 to-asu-maroon/10 text-asu-gold text-sm border border-asu-maroon/20"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Credentials Section */}
          {(profile.credentials || (profile.earned_credentials && profile.earned_credentials.length > 0)) && (
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Credentials</h2>
              {profile.earned_credentials && profile.earned_credentials.length > 0 && (
                <div className="space-y-4 mb-6">
                  {profile.earned_credentials.map((credential, index) => (
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
              {profile.credentials && (
                <div className="text-gray-300 whitespace-pre-wrap">
                  {profile.credentials}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="md:col-span-2 space-y-8">
          {/* Experience Section */}
          {profile.experience && profile.experience.length > 0 && (
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Experience</h2>
              <div className="space-y-8">
                {profile.experience.map((exp, index) => (
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

          {/* Education Section */}
          {profile.education && profile.education.length > 0 && (
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Education</h2>
              <div className="space-y-8">
                {profile.education.map((edu: any, index: number) => (
                  <div key={index} className="relative pl-6 border-l-2 border-asu-maroon/30 last:border-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asu-maroon border-2 border-asu-gold" />
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-lg font-semibold text-asu-gold">
                          {edu.degree}
                          {edu.major && ` in ${edu.major}`}
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
          
          {/* Projects Section */}
          {profile.projects && profile.projects.length > 0 && (
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6">Projects</h2>
              <div className="space-y-8">
                {profile.projects.map((project, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-asu-maroon/30 last:border-0">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-asu-maroon border-2 border-asu-gold" />
                    <div className="mb-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">{project.title || project.name}</h3>
                        {project.url && (
                          <a
                            href={project.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm flex items-center gap-2 text-asu-gold hover:text-asu-gold/80"
                          >
                            <Globe className="w-4 h-4" />
                            <span>View Project</span>
                          </a>
                        )}
                      </div>
                      {project.startDate && (
                        <div className="text-gray-400 text-sm">
                          {project.startDate}
                          {project.endDate && ` - ${project.endDate}`}
                        </div>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-gray-300 mb-4">{project.description}</p>
                    )}
                    {Array.isArray(project.technologies) && project.technologies.length > 0 && (
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
        </div>
      </div>
    </div>
  )
}