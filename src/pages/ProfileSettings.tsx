import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import Notification from '../components/Notification'
import { Loader2, Save, Briefcase, Lock, AlertTriangle, Trash2, Eye } from 'lucide-react'

export default function ProfileSettings() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showFinalConfirm, setShowFinalConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showDeletionMessage, setShowDeletionMessage] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [nextLocation, setNextLocation] = useState<string | null>(null)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning';
    message: string;
    isOpen: boolean;
  }>({ type: 'warning', message: '', isOpen: false })
  const [profile, setProfile] = useState<{ id: string } | null>(null)
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    emailNotifications: true,
    allowMessages: true,
    showphoto: true,
    showContactInfo: false,
    jobStatus: '',
    companyName: '',
    jobTitle: ''
  })
  const [showJobForm, setShowJobForm] = useState(false)

  const isFormValid = () => {
    if (settings.profileVisibility !== 'hidden') return true
    if (!settings.jobStatus) return false
    if (settings.jobStatus === 'accepted' && (!settings.companyName || !settings.jobTitle)) return false
    return true
  }

  // Handle navigation attempts
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (settings.profileVisibility === 'hidden' && !isFormValid()) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [settings, isFormValid])

  // Custom navigation function
  const handleNavigation = (to: string) => {
    if (settings.profileVisibility === 'hidden' && !isFormValid()) {
      const proceed = window.confirm(
        "You need to complete the job status information before leaving. Are you sure you want to leave without saving?"
      )
      if (proceed) {
        navigate(to)
      }
    } else {
      navigate(to)
    }
  }

  // Load existing settings
  useEffect(() => {
    async function loadSettings() {
      if (!user) return

      try {
        // First get the profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) throw profileError
        if (!profileData) throw new Error('No profile found')

        setProfile(profileData)

        // Then get settings
        const { data: settingsData, error: settingsError } = await supabase
          .from('profile_settings')
          .select('*')
          .eq('user_id', profileData.id)
          .maybeSingle()

        if (settingsError) {
          throw settingsError
        }

        if (settingsData) {
          setSettings(settingsData)
          setShowJobForm(settingsData.profileVisibility === 'hidden')
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        setNotification({
          type: 'error',
          message: 'Failed to load settings',
          isOpen: true
        })
      }
    }

    loadSettings()
  }, [user])

  const handleSave = async () => {
    if (!user || !profile) return
    
    // Validate required fields when profile is hidden
    if (settings.profileVisibility === 'hidden') {
      if (!settings.jobStatus) {
        setNotification({
          type: 'warning',
          message: 'Please select a job status before hiding your profile',
          isOpen: true
        });
        return;
      }
      if (settings.jobStatus === 'accepted' && (!settings.companyName || !settings.jobTitle)) {
        setNotification({
          type: 'warning',
          message: 'Please enter both company name and job title',
          isOpen: true
        });
        return;
      }
    }
    
    try {
      setLoading(true)

      const { error } = await supabase
        .from('profile_settings')
        .upsert({
          user_id: profile.id,
          ...settings
        })

      if (error) throw error

      setHasUnsavedChanges(false)
      setNotification({
        type: 'success',
        message: 'Settings saved successfully',
        isOpen: true
      })

    } catch (error) {
      console.error('Error saving settings:', error)
      setNotification({
        type: 'error',
        message: 'Failed to save settings',
        isOpen: true
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (changingPassword) return

    // Validate passwords match
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotification({
        type: 'error',
        message: 'New passwords do not match',
        isOpen: true
      })
      return
    }

    // Validate password length
    if (passwordForm.newPassword.length < 6) {
      setNotification({
        type: 'error',
        message: 'Password must be at least 6 characters',
        isOpen: true
      })
      return
    }

    setChangingPassword(true)
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: passwordForm.currentPassword
      });

      if (signInError) {
        throw new Error('Current password is incorrect');
      }

      // If current password is correct, update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (updateError) throw updateError

      setNotification({
        type: 'success',
        message: 'Password updated successfully',
        isOpen: true
      })

      // Clear form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      console.error('Error updating password:', error)
      const message = error instanceof Error && error.message === 'Current password is incorrect'
        ? 'Current password is incorrect'
        : 'Failed to update password. Please try again.'
      
      setNotification({
        type: 'error',
        message,
        isOpen: true
      })
    } finally {
      setChangingPassword(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!user || deleting) return
    
    if (!showFinalConfirm) {
      setShowFinalConfirm(true)
      return
    }
    
    setDeleting(true)
    setShowDeletionMessage(true)
    
    try {
      const { data: session } = await supabase.auth.getSession()
      if (!session?.session?.access_token) {
        throw new Error('No valid session')
      }

      // Call the edge function to delete the account
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account/`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      // Sign out and redirect
      await supabase.auth.signOut()
      navigate('/', {
        state: { 
          message: 'Your account has been successfully deleted. Thank you for using TalentVault.'
        }
      })
    } catch (error) {
      console.error('Error during account deletion process:', error)
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete account. Please try again or contact support.',
        isOpen: true
      })
      setDeleting(false)
      setShowDeleteConfirm(false)
      setShowFinalConfirm(false)
      setShowDeletionMessage(false)
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
      {showDeletionMessage && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <Loader2 className="w-8 h-8 text-asu-gold animate-spin" />
            </div>
            <p className="text-center text-white">
              Processing account deletion request...
            </p>
            <p className="text-center text-gray-400 mt-2">
              You will be redirected once the process is complete.
            </p>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>

      <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6">
        <div className="space-y-6">
          {/* Profile Visibility */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Eye className="w-5 h-5 text-asu-gold" />
              <h3 className="text-lg font-semibold text-white">Profile Visibility</h3>
            </div>
            <select
              value={settings.profileVisibility}
              onChange={(e) => {
                const newVisibility = e.target.value
                setSettings({ ...settings, profileVisibility: newVisibility })
                setHasUnsavedChanges(true)
                setShowJobForm(newVisibility === 'hidden')
              }}
              className="input-field"
            >
              <option value="public">Public - Visible to all employers</option>
              <option value="private">Private - Only visible to approved employers</option>
              <option value="hidden">Hidden - Not visible in search results</option>
            </select>
          </div>

          {/* Notification Settings */}
          {/*          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => {
                  setSettings({ ...settings, emailNotifications: e.target.checked })
                  setHasUnsavedChanges(true)
                }}
                className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
              />
              <span className="text-gray-300">Receive email notifications about new job matches</span>
            </label>
          </div>
          */}
          
          {/* Communication Preferences */}
          {/*          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Communication Preferences</h3>
            <label className="flex items-center gap-2 mb-3">
              <input
                type="checkbox"
                checked={settings.allowMessages}
                onChange={(e) => {
                  setSettings({ ...settings, allowMessages: e.target.checked })
                  setHasUnsavedChanges(true)
                }}
                className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
              />
              <span className="text-gray-300">Allow employers to send direct messages</span>
            </label>
          </div>
          */}
          
          {/* Job Status Form */}
          {showJobForm && (
            <div className="mt-6 p-4 bg-asu-maroon/10 rounded-lg border border-asu-maroon/30">
              <div className="flex items-center gap-2 mb-4">
                <Briefcase className="w-5 h-5 text-asu-gold" />
                <h3 className="text-lg font-semibold text-white">Have you found a job?</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="form-label">Job Status</label>
                  <select
                    value={settings.jobStatus}
                    onChange={(e) => {
                      setSettings({ ...settings, jobStatus: e.target.value })
                      setHasUnsavedChanges(true)
                    }}
                    className="input-field required"
                    required
                  >
                    <option value="">Select status</option>
                    <option value="accepted">Accepted a job offer</option>
                    <option value="other">Other reason</option>
                  </select>
                </div>

                {settings.jobStatus === 'accepted' && (
                  <>
                    <div>
                      <label className="form-label">Company Name</label>
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => {
                          setSettings({ ...settings, companyName: e.target.value })
                          setHasUnsavedChanges(true)
                        }}
                        className="input-field"
                        required
                        placeholder="Enter company name"
                      />
                    </div>
                    <div>
                      <label className="form-label">Job Title</label>
                      <input
                        type="text"
                        value={settings.jobTitle}
                        onChange={(e) => {
                          setSettings({ ...settings, jobTitle: e.target.value })
                          setHasUnsavedChanges(true)
                        }}
                        className="input-field"
                        required
                        placeholder="Enter job title"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Password Change Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-asu-gold" />
            <h3 className="text-lg font-semibold text-white">Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="form-label">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  currentPassword: e.target.value
                }))}
                className="input-field"
                required
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="form-label">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  newPassword: e.target.value
                }))}
                className="input-field"
                required
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({
                  ...prev,
                  confirmPassword: e.target.value
                }))}
                className="input-field"
                required
                placeholder="Confirm new password"
              />
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="flex items-center gap-2 px-6 py-2 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {changingPassword ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Password...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Update Password
                </>
              )}
            </button>
          </form>
        </div>

        {/* Delete Account Section */}
        <div className="mt-8 pt-8 border-t border-asu-maroon/30">
          <div className="flex items-center gap-2 mb-6">
            <Trash2 className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Delete Account</h3>
          </div>
          
          <p className="text-gray-400 mb-4">
            Warning: This action cannot be undone. All your data will be permanently deleted.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-6 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              Request Account Deletion
            </button>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-red-400 font-semibold mb-2">
                    {showFinalConfirm 
                      ? "Final confirmation required"
                      : "Are you sure you want to proceed?"
                    }
                  </h4>
                  <p className="text-gray-400 text-sm">
                    {showFinalConfirm
                      ? "This will permanently delete your account and all associated data. This action cannot be undone."
                      : "Your account and all associated data will be permanently deleted. This action cannot be undone."
                    }
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting}
                  className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      {showFinalConfirm ? "Yes, Delete My Account" : "Proceed"}
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setShowFinalConfirm(false)
                  }}
                  disabled={deleting}
                  className="text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-asu-maroon text-white rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}