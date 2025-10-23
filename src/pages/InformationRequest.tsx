import React, { useState } from 'react'
import { Mail, Send, Loader2, CheckCircle2, AlertCircle, HelpCircle, Clock, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

export default function InformationRequest() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (formError) setFormError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name: formData.name,
          email: formData.email,
          role_type: 'candidate', // Default to candidate for information requests
          message: `Subject: ${formData.subject}\n\n${formData.message}`,
          status: 'unread'
        })

      if (error) throw error

      setShowConfirmation(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      console.error('Error submitting information request:', error)
      setFormError('Failed to send your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark">
      {/* Hero Section */}
      <div className="bg-asu-dark border-b border-asu-maroon/30">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="flex justify-center items-center gap-3 mb-6">
              <Mail className="w-12 h-12 text-asu-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Request Information
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions about TalentVault, our programs, or need assistance? 
              We're here to help! Send us your inquiry and we'll get back to you promptly.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send Us Your Question</h2>
              
              {showConfirmation ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-4">Request Sent Successfully!</h3>
                  <p className="text-gray-300 mb-6">
                    Thank you for your inquiry. We've received your message and will respond within 1-2 business days.
                  </p>
                  <button
                    onClick={() => setShowConfirmation(false)}
                    className="bg-asu-maroon text-white px-6 py-3 rounded-lg hover:bg-asu-maroon/80 transition-colors"
                  >
                    Send Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="form-label">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="input-field"
                      required
                    >
                      <option value="">Select a subject</option>
                      <option value="General Information">General Information</option>
                      <option value="Account Access">Account Access</option>
                      <option value="Profile Help">Profile Help</option>
                      <option value="Technical Support">Technical Support</option>
                      <option value="Employer Services">Employer Services</option>
                      <option value="Partnership Opportunities">Partnership Opportunities</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="form-label">
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Please provide details about your question or request..."
                      rows={6}
                      required
                    />
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-asu-maroon text-white py-3 px-6 rounded-lg hover:bg-asu-maroon/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Quick Help */}
            <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-asu-gold" />
                <h3 className="text-lg font-semibold text-white">Quick Help</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-1">Account Issues</h4>
                  <p className="text-gray-400">Problems logging in or accessing your profile</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Profile Questions</h4>
                  <p className="text-gray-400">Help with completing or updating your profile</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">General Information</h4>
                  <p className="text-gray-400">Questions about TalentVault and our services</p>
                </div>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-asu-gold" />
                <h3 className="text-lg font-semibold text-white">Response Time</h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                We typically respond to information requests within 1-2 business days.
              </p>
              <p className="text-gray-400 text-sm">
                For urgent matters, please include "URGENT" in your subject line.
              </p>
            </div>

            {/* Contact Info */}
            <div className="bg-asu-dark rounded-xl border border-asu-maroon/30 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-asu-gold" />
                <h3 className="text-lg font-semibold text-white">Other Ways to Connect</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="text-white font-medium mb-1">FAQ Section</h4>
                  <p className="text-gray-400">Check our frequently asked questions for quick answers</p>
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Program Information</h4>
                  <p className="text-gray-400">Learn more about our microelectronics programs and partnerships</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}