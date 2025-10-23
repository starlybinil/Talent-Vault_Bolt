import React, { useState } from 'react'
import { Mail, Upload, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

export default function Contact() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [roleType, setRoleType] = useState('')
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [consentChecked, setConsentChecked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setFormError('Please upload a PDF file')
        return
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setFormError('File size must be less than 10MB')
        return
      }
      setResumeFile(file)
      setFormError(null)
    }
  }

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    if (!email || !name || !message || isSubmitting || 
        (roleType === 'candidate' && (!resumeFile || !consentChecked))) {
      setFormError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      let resumeUrl = null
      
      if (roleType === 'candidate' && resumeFile) {
        setUploadStatus('uploading')
        const fileName = `${Date.now()}-${resumeFile.name}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('temporary_resumes')
          .upload(fileName, resumeFile)

        if (uploadError) throw uploadError
        
        const { data: { publicUrl } } = supabase.storage
          .from('temporary_resumes')
          .getPublicUrl(fileName)

        resumeUrl = publicUrl
        setUploadStatus('success')
      }

      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          role_type: roleType,
          message: `${message}${resumeUrl ? `\n\nResume: ${resumeUrl}` : ''}`,
          status: 'unread'
      })

      if (error) throw error
      setShowConfirmation(true)
      setEmail('')
      setName('')
      setMessage('')
      setResumeFile(null)
      setUploadStatus('idle')
    } catch (error) {
      console.error('Error submitting contact form:', error)
      setFormError('Failed to send message. Please try again.')
      setUploadStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-asu-gold mb-4 flex items-center gap-2">
              <Mail className="w-7 h-7" />
              Request Access
            </h1>
            <p className="text-gray-300">
              Fill in the information. We will get in touch with you.
            </p>
          </div>
          
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div>
              <label className="form-label">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="form-label">Role Type</label>
              <select
                value={roleType}
                onChange={(e) => setRoleType(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Click to select</option>
                <option value="employer">Employer</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
            {roleType === 'candidate' && (
              <div>
                <label className="form-label">Resume (PDF, max 10MB) <span className="text-red-400">*</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                    required
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`flex items-center gap-2 w-full px-4 py-2 border ${
                      resumeFile ? 'border-asu-gold/50' : 'border-gray-600'
                    } rounded-md bg-asu-dark text-white cursor-pointer hover:border-asu-gold transition-colors`}
                  >
                    {uploadStatus === 'uploading' ? (
                      <Loader2 className="w-5 h-5 animate-spin text-asu-gold" />
                    ) : uploadStatus === 'success' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : uploadStatus === 'error' ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Upload className="w-5 h-5 text-asu-gold" />
                    )}
                    {resumeFile ? resumeFile.name : 'Upload Resume'}
                  </label>
                </div>
              </div>
            )}
            <div>
              {roleType === 'candidate' && (
                <div className="mb-6">
                  <label className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      className="mt-1 rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                      required
                    />
                    <span className="text-sm text-gray-300">
                      I understand and agree that by submitting my resume, I am making it available to be shared with 
                      potential employers. I acknowledge that submitting my resume does not guarantee employment, and 
                      all regular employment application procedures must be followed. I consent to having my resume 
                      reviewed by potential employers for employment consideration.
                    </span>
                  </label>
                </div>
              )}
              <label className="form-label">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="input-field"
                placeholder="Enter your message requesting access to TalentVault"
                rows={6}
                required
              />
            </div>
            {formError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400">
                {formError}
              </div>
            )}
            <button
              type="submit"
              disabled={!roleType || isSubmitting || (roleType === 'candidate' && (!resumeFile || !consentChecked))}
              className="w-full bg-asu-maroon text-white py-3 px-4 rounded-md hover:bg-asu-maroon/80 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
            {showConfirmation && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-md text-green-400">
                Thank you! We'll be in touch soon.
              </div>
            )}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}