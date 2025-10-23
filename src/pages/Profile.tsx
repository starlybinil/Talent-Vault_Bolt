import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, Upload, FileText, Download, Trash2, Award, Calendar, ExternalLink, UserCircle, Camera } from 'lucide-react'
import { supabase } from '../lib/supabase'
import SkillsAccordion from '../components/SkillsAccordion'
import Notification from '../components/Notification'
import { technicalSkills, softSkills } from '../lib/skills'
import { states, universities, majors } from '../lib/universities'

const DEFAULT_SECTION = 'basic'

interface Education {
  state: string;
  university: string;
  degree: string;
  major: string;
  graduationDate: string;
}

interface ProfileData {
  id: string
  firstName: string
  lastName: string
  bio: string
  linkedin: string
  nationalityStatus: string
  emailAddress: string
  securityClearance: string
  veteranStatus: string
  photoUrl: string | null
  type: string
  jobPreferences: {
    opportunityType: string[]
  }
}

export default function Profile() {
  const [activeSection, setActiveSection] = useState(DEFAULT_SECTION)
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [selectedSoftSkills, setSelectedSoftSkills] = useState<string[]>([])
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [educationEntries, setEducationEntries] = useState<Education[]>([])
  const [selectedState, setSelectedState] = useState<string>('')
  const [experienceEntries, setExperienceEntries] = useState([])
  const [projectEntries, setProjectEntries] = useState([])
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<any[]>([])
  const [availableCredentials, setAvailableCredentials] = useState<any[]>([])
  const [selectedCredential, setSelectedCredential] = useState('')
  const [earnedDate, setEarnedDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [badgeUrl, setBadgeUrl] = useState('')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning'
    message: string
    isOpen: boolean
  }>({ type: 'success', message: '', isOpen: false })

  const emptyProfile = {
    firstName: '',
    lastName: '',
    photoUrl: null,
    bio: '',
    linkedin: '',
    nationalityStatus: '',
    emailAddress: '',
    securityClearance: '',
    veteranStatus: '',
    type: 'candidate',
    jobPreferences: {
      opportunityType: [] as string[]
    }
  }

  const emptyEducation: Education = {
    state: '',
    university: '',
    degree: '',
    major: '',
    graduationDate: ''
  }

  const emptyExperience = {
    company: '',
    position: '',
    startDate: '',
    endDate: '',
    current: false,
    description: ''
  }

  const emptyProject = {
    title: '',
    description: '',
    technologies: '',
    link: '',
    startDate: '',
    endDate: ''
  }

  useEffect(() => {
    async function loadProfile() {
      if (!user) return
      try {
        setLoading(true)
        
        // Check if we have an active session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError
        if (!session) {
          throw new Error('No active session')
        }

        // First check if the resume file exists
        const { data: fileExists, error: fileError } = await supabase.storage
          .from('resumes')
          .list(`${user.id}`, {
            limit: 1,
            search: 'resume.pdf'
          })

        // Only try to get signed URL if file exists
        if (fileExists && fileExists.length > 0) {
          const { data: resumeData } = await supabase.storage
            .from('resumes')
            .createSignedUrl(`${user.id}/resume.pdf`, 3600)

          if (resumeData) {
            setResumeUrl(resumeData.signedUrl)
          }
        }
        
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          setProfile({
            id: profile.id,
            firstName: profile.first_name || '',
            lastName: profile.last_name || '',
            photoUrl: profile.photo_url || null,
            bio: profile.bio || '',
            linkedin: profile.linkedin || '',
            nationalityStatus: profile.nationality_status || '',
            emailAddress: profile.email_address || '',
            securityClearance: profile.security_clearance || '',
            veteranStatus: profile.veteran_status || '',
            type: profile.type || 'candidate',
            jobPreferences: profile.job_preferences || { opportunityType: [] }
          })

          if (profile.technical_skills) {
            if (Array.isArray(profile.technical_skills)) {
              // Already an array, use it directly
              setSelectedSkills(profile.technical_skills);
            } else {
              // Not an array — wrap it in one
              setSelectedSkills([profile.technical_skills]);
            }
          }


          
          if (profile.soft_skills) {
            setSelectedSoftSkills(Array.isArray(profile.soft_skills)
              ? profile.soft_skills
              : [profile.soft_skills]);
          }

          if (profile.projects) {
            try {
              const projects = JSON.parse(profile.projects)
              setProjectEntries(Array.isArray(projects) ? projects : [])
            } catch (e) {
              setProjectEntries([])
            }
          }

          if (profile.experience) {
            try {
              const exp = JSON.parse(profile.experience)
              setExperienceEntries(Array.isArray(exp) ? exp : [])
            } catch (e) {
              setExperienceEntries([])
            }
          }
          
          if (profile.education) {
            try {
              const edu = JSON.parse(profile.education)
              setEducationEntries(Array.isArray(edu) ? edu : [])
            } catch (e) {
              setEducationEntries([])
            }
          }
        } else {
          setProfile(emptyProfile)
        }

        if (profile.education) {
          // Directly use it if it's already an array
          setEducationEntries(Array.isArray(profile.education) ? profile.education : []);
        } else {
          setProfile(emptyProfile);
        }
                
        
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
      } catch (error) {
        console.error('Error loading profile:', error)
        setNotification({
          type: 'error',
          message: 'Failed to load profile',
          isOpen: true
        })
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [user])

  const handleSave = async () => {
    setSaving(true)
    try {
      if (!user || !profile) throw new Error('No user or profile data')

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      const profileData = {
          user_id: user.id,
          first_name: profile.firstName,
          last_name: profile.lastName,
          photo_url: profile.photoUrl,
          bio: profile.bio,
          linkedin: profile.linkedin,
          nationality_status: profile.nationalityStatus,
          email_address: profile.emailAddress,
          security_clearance: profile.securityClearance,
          veteran_status: profile.veteranStatus,
          job_preferences: profile.jobPreferences,
          projects: JSON.stringify(projectEntries),
          experience: JSON.stringify(experienceEntries),
          technical_skills: selectedSkills,
          soft_skills: selectedSoftSkills,
          education: educationEntries,
          updated_at: new Date().toISOString(),
          type: profile.type
      }

      const { error } = existingProfile
        ? await supabase
            .from('profiles')
            .update(profileData)
            .eq('user_id', user.id)
        : await supabase
            .from('profiles')
            .insert([profileData])

      if (error) throw error

      setNotification({
        type: 'success',
        message: 'Profile saved successfully',
        isOpen: true
      })
    } catch (error) {
      console.error('Error saving:', error)
      setNotification({
        type: 'error',
        message: 'Failed to save profile',
        isOpen: true
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Notification
        type={notification.type}
        message={notification.message}
        isOpen={notification.isOpen}
        onClose={() => setNotification(prev => ({ ...prev, isOpen: false }))}
      />

      <h1 className="text-3xl font-bold text-white mb-8">Profile</h1>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-asu-gold" />
        </div>
      ) : (
        <>
          {/* Navigation */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveSection('basic')} 
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'basic' 
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveSection('education')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'education'
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Education
            </button>
            <button
              onClick={() => setActiveSection('experience')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'experience'
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Experience
            </button>
            <button
              onClick={() => setActiveSection('projects')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'projects'
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Projects
            </button>
            <button
              onClick={() => setActiveSection('skills')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'skills'
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Skills
            </button>
            <button
              onClick={() => setActiveSection('credentials')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'credentials'
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Credentials
            </button>
            <button
              onClick={() => setActiveSection('resume')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === 'resume' 
                  ? 'bg-asu-gold text-black' 
                  : 'bg-asu-dark text-gray-300 hover:text-asu-gold'
              }`}
            >
              Resume
            </button>
          </div>

          {/* Basic Info Section */}
          {activeSection === 'basic' && profile && (
            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt="Profile"
                      className="w-32 h-32 rounded-full object-cover border-2 border-asu-gold"
                    />
                  ) : (
                    <UserCircle className="w-32 h-32 text-asu-gold" />
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-asu-maroon rounded-full cursor-pointer hover:bg-asu-maroon/80 transition-colors">
                    <Camera className="w-5 h-5 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        if (!file.type.startsWith('image/')) {
                          setNotification({
                            type: 'error',
                            message: 'Please upload an image file',
                            isOpen: true
                          })
                          return
                        }

                        if (file.size > 5 * 1024 * 1024) {
                          setNotification({
                            type: 'error',
                            message: 'File size must be less than 5MB',
                            isOpen: true
                          })
                          return
                        }

                        try {
                          const fileName = `${user?.id}/profile.${file.name.split('.').pop()}`
                          const { error: uploadError } = await supabase.storage
                            .from('profile-photos')
                            .upload(fileName, file, {
                              cacheControl: '3600',
                              upsert: true
                            })

                          if (uploadError) throw uploadError

                          const { data: { publicUrl } } = supabase
                            .storage
                            .from('profile-photos')
                            .getPublicUrl(fileName)

                          setProfile({ ...profile, photoUrl: publicUrl })
                          setNotification({
                            type: 'success',
                            message: 'Photo uploaded successfully',
                            isOpen: true
                          })
                        } catch (error) {
                          console.error('Error uploading photo:', error)
                          setNotification({
                            type: 'error',
                            message: 'Failed to upload photo',
                            isOpen: true
                          })
                        }
                      }}
                    />
                  </label>
                </div>
                {profile.photoUrl && (
                  <button
                    onClick={async () => {
                      try {
                        const fileName = `${user?.id}/profile.${profile.photoUrl.split('.').pop()}`
                        const { error } = await supabase.storage
                          .from('profile-photos')
                          .remove([fileName])

                        if (error) throw error

                        setProfile({ ...profile, photoUrl: null })
                        setNotification({
                          type: 'success',
                          message: 'Photo removed successfully',
                          isOpen: true
                        })
                      } catch (error) {
                        console.error('Error removing photo:', error)
                        setNotification({
                          type: 'error',
                          message: 'Failed to remove photo',
                          isOpen: true
                        })
                      }
                    }}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove photo
                  </button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    className="input-field"
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    className="input-field"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Bio</label>
                <textarea
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="input-field h-32"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div>
                <label className="form-label">LinkedIn Profile or Personal Website</label>
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                  className="input-field"
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              
              <div>
                <label className="form-label">Contact Email Address (Required)</label>
                <input
                  type="email"
                  required
                  value={profile.emailAddress}
                  onChange={(e) => setProfile({ ...profile, emailAddress: e.target.value })}
                  className="input-field"
                  placeholder="@.edu"
                />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="form-label">U.S. Nationality Status</label>
                  <select
                    value={profile.nationalityStatus}
                    onChange={(e) => setProfile({ ...profile, nationalityStatus: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="US Citizen">U.S. Citizen</option>
                    <option value="Green Card">Green Card</option>
                    <option value="H1-B Eligible">H1-B Eligible</option>
                    <option value="OPT/CPT">OPT/CPT</option>
                    <option value="TN Visa">TN Visa</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">U.S. Security Clearance</label>
                  <select
                    value={profile.securityClearance}
                    onChange={(e) => setProfile({ ...profile, securityClearance: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select clearance level</option>
                    <option value="none">None</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Secret">Secret</option>
                    <option value="Top_Secret">Top Secret</option>
                    <option value="TS_SCI">TS/SCI</option>
                    <option value="Q_Clearance">Q Clearance</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">U.S. Military Veteran Status</label>
                  <select
                    value={profile.veteranStatus}
                    onChange={(e) => setProfile({ ...profile, veteranStatus: e.target.value })}
                    className="input-field"
                  >
                    <option value="">Select status</option>
                    <option value="not_veteran">Not a Veteran</option>
                    <option value="veteran">Veteran</option>
                    <option value="active_duty">Active Duty</option>
                    <option value="reserve">Reserve</option>
                    <option value="national_guard">National Guard</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Education Section */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Education</h3>
              {educationEntries.map((edu, index) => (
                <div key={index} className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30 space-y-4">
                  <div className="flex justify-between items-start">
                    <h4 className="text-white font-medium">Education Entry {index + 1}</h4>
                    <button
                      onClick={() => {
                        const newEntries = [...educationEntries]
                        newEntries.splice(index, 1)
                        setEducationEntries(newEntries)
                      }}
                      className="text-gray-400 hover:text-red-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">State</label>
                      <select
                        value={edu.state}
                        onChange={(e) => {
                          const newEntries = [...educationEntries]
                          newEntries[index] = { ...edu, state: e.target.value, university: '' }
                          setEducationEntries(newEntries)
                        }}
                        className="input-field"
                        required
                      >
                        <option value="">Select State</option>
                        {states.map(state => (
                          <option key={state} value={state}>{state}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">University/College</label>
                      <select
                        value={edu.university}
                        onChange={(e) => {
                          const newEntries = [...educationEntries]
                          newEntries[index] = { ...edu, university: e.target.value }
                          setEducationEntries(newEntries)
                        }}
                        className="input-field"
                        required
                        disabled={!edu.state}
                      >
                        <option value="">Select University</option>
                        {universities
                          .filter(uni => uni.state === edu.state)
                          .map(uni => (
                            <option key={uni.name} value={uni.name}>{uni.name}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Degree</label>
                      <select
                        value={edu.degree}
                        onChange={(e) => {
                          const newEntries = [...educationEntries]
                          newEntries[index] = { ...edu, degree: e.target.value }
                          setEducationEntries(newEntries)
                        }}
                        className="input-field"
                        required
                      >
                        <option value="">Select Degree</option>
                        <option value="AS">Associate of Science (AS)</option>
                        <option value="BS">Bachelor of Science (BS)</option>
                        <option value="MS">Master of Science (MS)</option>
                        <option value="PhD">Doctor of Philosophy (PhD)</option>
                        <option value="Other">Other Degree</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Major</label>
                      <select
                        value={edu.major}
                        onChange={(e) => {
                          const newEntries = [...educationEntries]
                          newEntries[index] = { ...edu, major: e.target.value }
                          setEducationEntries(newEntries)
                        }}
                        className="input-field"
                        required
                      >
                        <option value="">Select Major</option>
                        <optgroup label="Engineering">
                          {majors.engineering.map(major => (
                            <option key={major} value={major}>{major}</option>
                          ))}
                        </optgroup>
                        <optgroup label="Science">
                          {majors.science.map(major => (
                            <option key={major} value={major}>{major}</option>
                          ))}
                        </optgroup>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Graduation Date</label>
                    <input
                      type="month"
                      value={edu.graduationDate}
                      onChange={(e) => {
                        const newEntries = [...educationEntries]
                        newEntries[index] = { ...edu, graduationDate: e.target.value }
                        setEducationEntries(newEntries)
                      }}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setEducationEntries([...educationEntries, emptyEducation])}
                className="w-full py-3 border-2 border-dashed border-asu-maroon/30 rounded-lg text-asu-gold hover:border-asu-gold/50 hover:text-asu-gold/80 transition-colors"
              >
                + Add Another Education Entry
              </button>
            </div>
          )}

          {/* Experience Section */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Work Experience</h3>
              {experienceEntries.map((exp, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const newEntries = [...experienceEntries]
                        newEntries.splice(index, 1)
                        setExperienceEntries(newEntries)
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete experience"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Company</label>
                          <input
                            type="text"
                            value={exp.company}
                            onChange={(e) => {
                              const newEntries = [...experienceEntries]
                              newEntries[index] = { ...exp, company: e.target.value }
                              setExperienceEntries(newEntries)
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Position</label>
                          <input
                            type="text"
                            value={exp.position}
                            onChange={(e) => {
                              const newEntries = [...experienceEntries]
                              newEntries[index] = { ...exp, position: e.target.value }
                              setExperienceEntries(newEntries)
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            value={exp.startDate}
                            onChange={(e) => {
                              const newEntries = [...experienceEntries]
                              newEntries[index] = { ...exp, startDate: e.target.value }
                              setExperienceEntries(newEntries)
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            value={exp.endDate}
                            onChange={(e) => {
                              const newEntries = [...experienceEntries]
                              newEntries[index] = { 
                                ...exp,
                
                                endDate: e.target.value,
                                current: false
                              }
                              setExperienceEntries(newEntries)
                            }}
                            className="input-field"
                            disabled={exp.current}
                            required={!exp.current}
                          />
                          <label className="flex items-center gap-2 text-sm text-gray-400">
                            <input
                              type="checkbox"
                              checked={exp.current}
                              onChange={(e) => {
                                const newEntries = [...experienceEntries]
                                
                                newEntries[index] = { 
                                  ...exp, 
                                  current: e.target.checked,
                                  endDate: e.target.checked ? '' : exp.endDate 
                                }
                                setExperienceEntries(newEntries)
                              }}
                              className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                            />
                            Currently working here
                          </label>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => {
                          const newEntries = [...experienceEntries]
                          newEntries[index] = { ...exp, description: e.target.value }
                          setExperienceEntries(newEntries)
                        }}
                        className="input-field h-32"
                        placeholder="Describe your responsibilities and achievements..."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setExperienceEntries([...experienceEntries, emptyExperience])}
                className="w-full py-3 border-2 border-dashed border-asu-maroon/30 rounded-lg text-asu-gold hover:border-asu-gold/50 hover:text-asu-gold/80 transition-colors"
              >
                + Add Another Experience Entry
              </button>
            </div>
          )}

          {/* Projects Section */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-white mb-4">Projects</h3>
              {projectEntries.map((project, index) => (
                <div key={index} className="space-y-4">
                  <div className="flex justify-end">
                    <button
                      onClick={() => {
                        const newProjects = [...projectEntries]
                        newProjects.splice(index, 1)
                        setProjectEntries(newProjects)
                      }}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="form-label">Project Title</label>
                          <input
                            type="text"
                            value={project.title}
                            onChange={(e) => {
                              const newProjects = [...projectEntries]
                              newProjects[index] = { ...project, title: e.target.value }
                              setProjectEntries(newProjects)
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">Technologies Used</label>
                          <input
                            type="text"
                            value={project.technologies}
                            onChange={(e) => {
                              const newProjects = [...projectEntries]
                              newProjects[index] = { ...project, technologies: e.target.value }
                              setProjectEntries(newProjects)
                            }}
                            className="input-field"
                            placeholder="e.g., React, Node.js, Python"
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            value={project.startDate}
                            onChange={(e) => {
                              const newProjects = [...projectEntries]
                              newProjects[index] = { ...project, startDate: e.target.value }
                              setProjectEntries(newProjects)
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                        <div>
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            value={project.endDate}
                            onChange={(e) => {
                              const newProjects = [...projectEntries]
                              newProjects[index] = { ...project, endDate: e.target.value }
                              setProjectEntries(newProjects)
                            }}
                            className="input-field"
                            required
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <label className="form-label">Project Link</label>
                        <input
                          type="url"
                          value={project.link}
                          onChange={(e) => {
                            const newProjects = [...projectEntries]
                            newProjects[index] = { ...project, link: e.target.value }
                            setProjectEntries(newProjects)
                          }}
                          className="input-field"
                          placeholder="https://github.com/yourusername/project"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Description</label>
                      <textarea
                        value={project.description}
                        onChange={(e) => {
                          const newProjects = [...projectEntries]
                          newProjects[index] = { ...project, description: e.target.value }
                          setProjectEntries(newProjects)
                        }}
                        className="input-field h-32"
                        placeholder="Describe your project, its goals, and your role..."
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setProjectEntries([...projectEntries, emptyProject])}
                className="w-full py-3 border-2 border-dashed border-asu-maroon/30 rounded-lg text-asu-gold hover:border-asu-gold/50 hover:text-asu-gold/80 transition-colors"
              >
                + Add Another Project
              </button>
            </div>
          )}

          {/* Credentials Section */}
          {activeSection === 'credentials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Micro-credentials</h3>
                <button
                  onClick={async (e) => {
                    e.preventDefault()
                    if (!selectedCredential || !earnedDate || !profile?.id) return

                    try {
                      // Add new credential
                      const { error } = await supabase
                        .from('user_credentials')
                        .insert({
                          user_id: profile.id,
                          credential_id: selectedCredential,
                          earned_at: earnedDate,
                          expires_at: expiryDate || null,
                          badge_url: badgeUrl || null
                        })

                      if (error) throw error

                      // Fetch updated credentials list
                      const { data: newCreds, error: fetchError } = await supabase
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

                      if (fetchError) throw fetchError
                      
                      // Update credentials state with new data
                      setCredentials(newCreds || [])

                      // Reset form
                      setSelectedCredential('')
                      setEarnedDate('')
                      setExpiryDate('')
                      setBadgeUrl('')

                      setNotification({
                        type: 'success',
                        message: 'Credential added successfully',
                        isOpen: true
                      })
                    } catch (error) {
                      console.error('Error adding credential:', error)
                      setNotification({
                        type: 'error',
                        message: 'Failed to add credential',
                        isOpen: true
                      })
                    }
                  }}
                  disabled={!selectedCredential || !earnedDate || !profile?.id}
                  className="bg-asu-maroon text-white px-4 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Credential
                </button>
              </div>

              {/* Add New Credential Form */}
              <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Select Credential</label>
                    <select
                      value={selectedCredential}
                      onChange={(e) => setSelectedCredential(e.target.value)}
                      className="input-field"
                    >
                      <option value="">Choose a credential</option>
                      {availableCredentials.map((cred) => (
                        <option key={cred.id} value={cred.id}>
                          {cred.name} - {cred.issuer}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Date Earned</label>
                    <input
                      type="date"
                      value={earnedDate}
                      onChange={(e) => setEarnedDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Expiry Date (Optional)</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="form-label">Badge URL (Optional)</label>
                    <input
                      type="url"
                      value={badgeUrl}
                      onChange={(e) => setBadgeUrl(e.target.value)}
                      className="input-field"
                      placeholder="https://example.com/badge.png"
                    />
                  </div>
                </div>
              </div>

              {/* Earned Credentials List */}
              <div className="space-y-4 mt-8">
                <h4 className="text-lg font-semibold text-white">Earned Credentials</h4>
                {credentials.length > 0 ? (
                  credentials.map((cred) => (
                    <div key={cred.credential_id} className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="p-2 bg-asu-maroon/20 rounded-lg">
                            <Award className="w-6 h-6 text-asu-gold" />
                          </div>
                          <div>
                            <h5 className="text-white font-medium">{cred.micro_credentials.name}</h5>
                            <p className="text-sm text-gray-400">{cred.micro_credentials.issuer}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Earned: {new Date(cred.earned_at).toLocaleDateString()}</span>
                              </div>
                              {cred.expires_at && (
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Expires: {new Date(cred.expires_at).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>
                            {cred.badge_url && (
                              <a
                                href={cred.badge_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-asu-gold hover:text-asu-gold/80 mt-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                View Badge
                              </a>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={async () => {
                            try {
                              const { error } = await supabase
                                .from('user_credentials')
                                .delete()
                                .eq('user_id', profile?.id)
                                .eq('credential_id', cred.credential_id)

                              if (error) throw error

                              setCredentials(credentials.filter(c => c.credential_id !== cred.credential_id))
                              setNotification({
                                type: 'success',
                                message: 'Credential removed successfully',
                                isOpen: true
                              })
                            } catch (error) {
                              console.error('Error removing credential:', error)
                              setNotification({
                                type: 'error',
                                message: 'Failed to remove credential',
                                isOpen: true
                              })
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Remove credential"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    No credentials earned yet
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills Section */}
          {activeSection === 'skills' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Technical Skills</h3>
                <div className="space-y-4">
                  {technicalSkills.map((category) => (
                    <SkillsAccordion
                      key={category.name}
                      category={category}
                      selectedSkills={selectedSkills}
                      onSkillToggle={(skill) => {
                        if (selectedSkills.includes(skill)) {
                          setSelectedSkills(selectedSkills.filter(s => s !== skill))
                        } else {
                          setSelectedSkills([...selectedSkills, skill])
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-6">Soft Skills</h3>
                <div className="space-y-4">
                  {softSkills.map((category) => (
                    <SkillsAccordion
                      key={category.name}
                      category={category}
                      selectedSkills={selectedSoftSkills}
                      onSkillToggle={(skill) => {
                        if (selectedSoftSkills.includes(skill)) {
                          setSelectedSoftSkills(selectedSoftSkills.filter(s => s !== skill))
                        } else {
                          setSelectedSoftSkills([...selectedSoftSkills, skill])
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Resume Section */}
          {activeSection === 'resume' && (
            <div className="space-y-6">
              {resumeUrl && (
                <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-6 h-6 text-asu-gold" />
                      <div>
                        <h4 className="text-white font-medium">Current Resume</h4>
                        <p className="text-sm text-gray-400">PDF document</p>
                      </div>
                    </div>
                    <a
                      href={resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-asu-maroon/20 text-asu-gold px-4 py-2 rounded-lg hover:bg-asu-maroon/30 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </a>
                    <button
                      onClick={async () => {
                        try {
                          const { error } = await supabase.storage
                            .from('resumes')
                            .remove([`${user?.id}/resume.pdf`])

                          if (error) throw error

                          setResumeUrl(null)
                          setNotification({
                            type: 'success',
                            message: 'Resume deleted successfully',
                            isOpen: true
                          })
                        } catch (error) {
                          console.error('Error deleting resume:', error)
                          setNotification({
                            type: 'error',
                            message: 'Failed to delete resume',
                            isOpen: true
                          })
                        }
                      }}
                      className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
              <div className="bg-asu-dark p-6 rounded-xl border-2 border-dashed border-asu-maroon/30 transition-all duration-300 hover:border-asu-gold/50">
                <div className="flex flex-col items-center justify-center py-12 px-6">
                  <Upload className="w-12 h-12 text-asu-gold mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Your Resume</h3>
                  <p className="text-gray-400 text-center mb-6">
                    {resumeUrl ? 'Upload a new version or' : 'Click the button below to select a file'}
                  </p>
                  <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                    <p>Accepted format: PDF only</p>
                    <p>Maximum file size: 10MB</p>
                  </div>
                  <label className="mt-6">
                    <button
                      onClick={() => document.getElementById('resume-upload')?.click()}
                      type="button"
                      className="bg-asu-maroon text-white px-6 py-2 rounded-lg hover:bg-asu-maroon/80 transition-colors"
                    >
                      Select PDF File
                    </button>
                    <input
                      id="resume-upload"
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        if (file.type !== 'application/pdf') {
                          setNotification({
                            type: 'error',
                            message: 'Please upload a PDF file',
                            isOpen: true
                          })
                          return
                        }

                        if (file.size > 10 * 1024 * 1024) {
                          setNotification({
                            type: 'error',
                            message: 'File size must be less than 10MB',
                            isOpen: true
                          })
                          return
                        }

                        try {
                          const fileName = `${user?.id}/resume.pdf`
                          const { error: uploadError } = await supabase.storage
                            .from('resumes')
                            .upload(fileName, file, {
                              cacheControl: '3600',
                              upsert: true
                            })

                          if (uploadError) throw uploadError

                          setNotification({
                            type: 'success',
                            message: 'Resume uploaded successfully',
                            isOpen: true
                          })

                          // Get the new URL
                          const { data: newResumeData } = await supabase.storage
                            .from('resumes')
                            .createSignedUrl(`${user?.id}/resume.pdf`, 3600)

                          if (newResumeData) {
                            setResumeUrl(newResumeData.signedUrl)
                          }
                          
                          // Clear the input
                          e.target.value = ''
                        } catch (error) {
                          console.error('Error uploading resume:', error)
                          setNotification({
                            type: 'error',
                            message: 'Failed to upload resume',
                            isOpen: true
                          })
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-asu-gold text-black font-medium rounded hover:bg-asu-gold/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}