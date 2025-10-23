import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { 
  UserCircle, 
  MapPin, 
  Mail,
  Copy,
  Check,
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
  ArrowLeft,
  AlertCircle
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
}

// Helper function to safely parse JSON fields
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

export default function CandidateProfile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [viewTracked, setViewTracked] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadingResume, setDownloadingResume] = useState(false)
  const [showEmail, setShowEmail] = useState(false)
  const [copied, setCopied] = useState(false)
  const [resumeError, setResumeError] = useState<string | null>(null)

  useEffect(() => {
    loadProfile()
  }, [id])

  const handleDownloadResume = async () => {
    if (!id) return
    try {
      setDownloadingResume(true)
      setResumeError(null)
      
      // Get the user_id for the candidate
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name')
        .eq('id', id)
        .single()

      if (profileError) throw profileError
      if (!profileData?.user_id) {
        setResumeError('Could not find user profile')
        return
      }
      
      // Get resume file from storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(`${profileData.user_id}/resume.pdf`)

      if (error) throw error
      
      // Create download link
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profileData.first_name}_${profileData.last_name}_Resume.pdf`
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
    
    /*
    try {
      setDownloadingResume(true)
      setResumeError(null)
      
      // Get the user_id for the candidate
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', id)
        .single()

      if (profileError) throw profileError
      if (!profileData?.user_id) {
        setResumeError('Could not find user profile')
        return
      }

      // Check if resume exists
      const { data: files, error: listError } = await supabase.storage
        .from('resumes')
        .list(`${profileData.user_id}`)

      if (listError) throw listError

      const resumeExists = files?.some(file => file.name === 'resume.pdf')
      
      if (!resumeExists) {
        setResumeError('Resume is not available for this candidate')
        return
      }

      // Get resume file from storage
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(`${profileData.user_id}/resume.pdf`)

      if (error) throw error
      
      // Create download link
      const url = window.URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = `${profile?.first_name}_${profile?.last_name}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading resume:', error)
      setResumeError('Failed to download resume. Please try again later.')
    } finally {
      setDownloadingResume(false)
    }
    */
  }

  const loadProfile = async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      // Only track view once per session
      if (!viewTracked) {
        const { error: trackError } = await supabase
          .rpc('track_profile_view', { profile_id: id })
        
        if (trackError) {
          console.error('Error tracking profile view:', trackError)
        } else {
          setViewTracked(true)
        }
      }

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
          email_address,
          technical_skills,
          soft_skills,
          job_opportunity_type,
          nationality_status,
          security_clearance,
          veteran_status,
          credentials,
          job_preferences
        `)
        .eq('id', id)
        .single()

        // After profile is loaded, fetch credentials data
        if (profile?.id) {
          // Load available micro-credentials
          const { data: microCredentials, error: credError } = await supabase
            .from('micro_credentials')
            .select('*')
            .order('name')

          if (credError) throw credError
          setAvailableCredentials(microCredentials || [])

          // Load user's earned credentials
          const { data: userCreds, error: userCredError } = await supabase
            .from('user_credentials')
            .select(`
              credential_id,
              earned_at,
              expires_at,
              badge_url,
              micro_credentials (
                id,
                name,
                issuer,
                description
              )
            `)
            .eq('user_id', profile.id)

          if (userCredError) throw userCredError
          setCredentials(userCreds || [])
        }
      
      if (profileError) throw profileError
      if (!profileData) {
        setError('Profile not found')
        return
      }

      // Parse JSON fields to ensure they're arrays
      const parsedProfile = {
        ...profileData,
        technical_skills: parseJsonField(profileData.technical_skills),
        soft_skills: parseJsonField(profileData.soft_skills),
        projects: parseJsonField(profileData.projects).map((project: any) => ({
          ...project,
          technologies: Array.isArray(project.technologies) ? project.technologies : []
        })),
        education: parseJsonField(profileData.education),
        experience: parseJsonField(profileData.experience),
        job_preferences: profileData.job_preferences || {},
        earned_credentials: profileData.user_credentials?.map(cred => ({
          name: cred.micro_credentials?.name || '',
          issuer: cred.micro_credentials?.issuer || '',
          earned_at: new Date(cred.earned_at).toLocaleDateString(),
          expires_at: cred.expires_at ? new Date(cred.expires_at).toLocaleDateString() : undefined,
          badge_url: cred.badge_url
        })) || []
      };

      setProfile(parsedProfile)
    } catch (error) {
      console.error('Error loading profile:', error)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
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
        {/* Back Button */}
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-asu-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Saved Profiles</span>
          </button>
        </div>

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
                {profile.email_address ? (
                  <div className="relative">
                    <button
                      onClick={() => {
                        if (showEmail) {
                          navigator.clipboard.writeText(profile.email_address!)
                            .then(() => {
                              setCopied(true)
                              setTimeout(() => setCopied(false), 2000)
                            })
                            .catch(err => console.error('Failed to copy:', err))
                        } else {
                          setShowEmail(true)
                        }
                      }}
                      className="flex items-center gap-2 bg-asu-maroon text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors"
                    >
                      {showEmail ? (
                        <>
                          <span className="font-mono">{profile.email_address}</span>
                          {copied ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Copy className="w-5 h-5" />
                          )}
                        </>
                      ) : (
                        <>
                          <Mail className="w-5 h-5" />
                          <span>Contact</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    disabled
                    className="flex items-center gap-2 bg-asu-maroon/50 text-white px-4 py-2 rounded-lg cursor-not-allowed"
                  >
                    <Mail className="w-5 h-5" />
                    <span>Contact Unavailable</span>
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
                      <Download className="w-5 h-5" />
                      <span>Download Resume</span>
                    </>
                  )}
                </button>

                {resumeError && (
                  <div className="flex items-center gap-2 text-red-400 px-4 py-2">
                    <AlertCircle className="w-5 h-5" />
                    <span>{resumeError}</span>
                  </div>
                )}

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
                  {profile.technical_skills.map((skill, index) => (
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
            {profile.soft_skills && profile.soft_skills.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-asu-gold mb-4">Soft Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.soft_skills.map((skill, index) => (
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
              <div className="text-gray-300 whitespace-pre-wrap">
                {profile.credentials}
              </div>
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