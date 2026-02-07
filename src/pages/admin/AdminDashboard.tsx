import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '../../contexts/AdminAuthContext'
import { supabase } from '../../lib/supabase'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import {
  Users,
  Building2,
  Activity,
  Settings,
  BarChart3,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  UserX,
  Mail,
  Eye,
  Download,
  Loader2,
  Calendar,
  User,
  MessageSquare,
  Archive,
  Trash2,
  Award
} from 'lucide-react'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
)

interface DashboardStats {
  totalCandidates: number;
  totalEmployers: number;
  pendingRequests: number;
  activeUsersLast24h: number;
  filterAnalytics: {
    mostCommonFilters: Array<{
      filter_type: string;
      filter_value: string;
      usage_count: number;
    }>;
    filterUsageOverTime: Array<{
      date: string;
      count: number;
    }>;
  };
  skillsAnalytics: {
    topSkills: Array<{
      skill: string;
      count: number;
      percentage: number;
    }>;
    summary: {
      totalProfiles: number;
      profilesWithSkills: number;
      totalUniqueSkills: number;
      averageSkillsPerProfile: number;
    };
  };
}

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  status: 'unread' | 'read' | 'archived';
  role_type: 'candidate' | 'employer';
  created_at: string;
}

interface RecentLogin {
  id: string;
  first_name: string;
  last_name: string;
  type: string;
  last_viewed_at: string;
  email_address: string;
  view_count: number;
}

export default function AdminDashboard() {
  const { adminUser, logActivity } = useAdminAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [recentLogins, setRecentLogins] = useState<RecentLogin[]>([])
  const [loadingRecentLogins, setLoadingRecentLogins] = useState(false)
  const [usersPagination, setUsersPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadDashboardStats()
    logActivity('admin_dashboard_view')
  }, [])

  // Load contact messages when requests tab is active
  useEffect(() => {
    console.log('Active tab changed to:', activeTab)
    if (activeTab === 'requests') {
      console.log('Loading contact messages...')
      loadContactMessages()
    } else if (activeTab === 'users') {
      console.log('Loading users...')
      loadUsers()
    } else if (activeTab === 'activity') {
      console.log('Loading recent logins...')
      loadRecentLogins()
    }
  }, [activeTab])

  const loadContactMessages = async () => {
    try {
      console.log('Starting to load contact messages...')
      setLoadingMessages(true)
      
      // Get current session for debugging
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Current session:', { session: !!session, error: sessionError })
      
      if (!session) {
        throw new Error('No active session')
      }
      
      // Call the edge function to get contact messages
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-contact-messages`
      console.log('Calling edge function:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Edge function response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Edge function error response:', errorText)
        throw new Error(`Edge function failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Edge function data:', data)

      if (Array.isArray(data)) {
        setContactMessages(data)
        console.log('Contact messages loaded successfully:', data.length)
      } else {
        console.error('Unexpected data format:', data)
        throw new Error('Invalid data format from edge function')
      }
      
    } catch (error) {
      console.error('Error loading contact messages:', error)
      // Show error to user
      setContactMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const updateMessageStatus = async (messageId: string, status: 'read' | 'archived') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-contact-messages`
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messageId, status })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update message: ${errorText}`)
      }

      // Update local state
      setContactMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, status } : msg
        )
      )

      // Update selected message if it's the one being updated
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null)
      }

      // Log the activity
      await logActivity(`message_${status}`, 'contact_message', messageId)
      
      // Reload stats to update unread count
      loadDashboardStats()
    } catch (error) {
      console.error('Error updating message status:', error)
    }
  }

const loadUsers = async () => {
  try {
    console.log('Starting to load users...')
    setLoadingUsers(true)

    let session

    try {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw error
      }

      session = data.session
    } catch (err) {
      console.error('Failed to get session:', err)
      throw new Error('Authentication failed')
    }
      
      if (!session) {
        throw new Error('No active session')
      }
      
      // Call the edge function to get users
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users?page=${usersPagination.page}&limit=${usersPagination.limit}`
      console.log('Calling users edge function:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Users edge function response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Users edge function error response:', errorText)
        throw new Error(`Edge function failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Users edge function data:', data)

      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users)
        setUsersPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          totalPages: data.pagination.totalPages
        }))
        console.log('Users loaded successfully:', data.users.length)
      } else {
        console.error('Unexpected users data format:', data)
        throw new Error('Invalid data format from edge function')
      }
      
    } catch (error) {
      console.error('Error loading users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadRecentLogins = async () => {
    try {
      console.log('Starting to load recent logins...')
      setLoadingRecentLogins(true)
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      console.log('Current session for recent logins:', { session: !!session, error: sessionError })
      
      if (!session) {
        throw new Error('No active session')
      }
      
      // Call the edge function to get recent logins
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-recent-logins`
      console.log('Calling recent logins edge function:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Recent logins edge function response:', { 
        status: response.status, 
        statusText: response.statusText,
        ok: response.ok 
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Recent logins edge function error response:', errorText)
        throw new Error(`Edge function failed: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('Recent logins edge function data:', data)

      if (Array.isArray(data)) {
        setRecentLogins(data)
        console.log('Recent logins loaded successfully:', data.length)
      } else {
        console.error('Unexpected recent logins data format:', data)
        throw new Error('Invalid data format from edge function')
      }
      
    } catch (error) {
      console.error('Error loading recent logins:', error)
      setRecentLogins([])
    } finally {
      setLoadingRecentLogins(false)
    }
  }

  const updateUserStatus = async (userId: string, action: 'activate' | 'deactivate') => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('No active session')

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-users`
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, action })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update user: ${errorText}`)
      }

      // Reload users list
      await loadUsers()
      
      // Log the activity
      await logActivity(`user_${action}`, 'user', userId)
      
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handlePageChange = (newPage: number) => {
    setUsersPagination(prev => ({ ...prev, page: newPage }))
  }

  // Reload users when pagination changes
  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    }
  }, [usersPagination.page])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatAction = (action: string) => {
    return action
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatMessagePreview = (message: string) => {
    // Extract subject if it exists
    const subjectMatch = message.match(/^Subject:\s*(.+?)(?:\n|$)/i)
    if (subjectMatch) {
      return subjectMatch[1].trim()
    }
    // Otherwise return first 50 characters
    return message.length > 50 ? message.substring(0, 50) + '...' : message
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return 'text-yellow-400 bg-yellow-400/10'
      case 'read': return 'text-green-400 bg-green-400/10'
      case 'archived': return 'text-gray-400 bg-gray-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'candidate': return 'text-blue-400 bg-blue-400/10'
      case 'employer': return 'text-purple-400 bg-purple-400/10'
      default: return 'text-gray-400 bg-gray-400/10'
    }
  }

  const loadDashboardStats = async () => {
    try {
      setLoading(true)

      // Get user counts and filter analytics
      const [
        candidatesResult,
        employersResult,
        filterAnalyticsResult,
        skillsAnalyticsResult
      ] = await Promise.all([
        supabase.rpc('get_candidate_count'),
        supabase.rpc('get_employer_count'),
        loadFilterAnalytics(),
        loadSkillsAnalytics()
      ])

      const totalCandidates = candidatesResult.data || 0
      const totalEmployers = employersResult.data || 0

      // Get unread messages count from edge function
      let pendingRequests = 0
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-contact-messages`
          const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json'
            }
          })
          
          if (response.ok) {
            const messages = await response.json()
            pendingRequests = messages.filter((msg: any) => msg.status === 'unread').length
          }
        }
      } catch (error) {
        console.error('Error getting unread messages count:', error)
      }

      setStats({
        totalCandidates: totalCandidates || 0,
        totalEmployers: totalEmployers || 0,
        pendingRequests,
        activeUsersLast24h: skillsAnalyticsResult.summary?.activeUsersLast24h || 0,
        filterAnalytics: filterAnalyticsResult,
        skillsAnalytics: skillsAnalyticsResult
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadFilterAnalytics = async () => {
    try {
      // Get the current session to call edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Call edge function to get filter analytics
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-filter-analytics`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Filter analytics error:', errorText)
        throw new Error(`Failed to load filter analytics: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error loading filter analytics:', error)
      return {
        mostCommonFilters: [],
        filterUsageOverTime: []
      }
    }
  }

  const loadSkillsAnalytics = async () => {
    try {
      // Get the current session to call edge function
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No active session')
      }

      // Call edge function to get skills analytics
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-skills-analytics`
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Skills analytics error:', errorText)
        throw new Error(`Failed to load skills analytics: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error loading skills analytics:', error)
      return {
        topSkills: [],
        summary: {
          totalProfiles: 0,
          profilesWithSkills: 0,
          totalUniqueSkills: 0,
          averageSkillsPerProfile: 0
        }
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-asu-gold/30 border-t-asu-gold rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark">
      {/* Header */}
      <div className="bg-asu-dark border-b border-asu-maroon/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-gray-400 mt-1">
                Welcome back, {adminUser?.username} ({adminUser?.role})
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Shield className="w-4 h-4 text-asu-gold" />
              <span>Secure Admin Session</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-8 bg-asu-dark/50 p-1 rounded-lg border border-asu-maroon/30">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'requests', label: 'Access Requests', icon: Mail },
            { id: 'activity', label: 'Activity Logs', icon: Activity },
            { id: 'settings', label: 'System Settings', icon: Settings }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-asu-maroon text-white'
                    : 'text-gray-400 hover:text-white hover:bg-asu-maroon/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <UserCheck className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Candidates</h3>
                </div>
                <div className="text-3xl font-bold text-white">{stats.totalCandidates}</div>
                <p className="text-gray-400 text-sm mt-1">Job seekers</p>
              </div>

              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Employers</h3>
                </div>
                <div className="text-3xl font-bold text-white">{stats.totalEmployers}</div>
                <p className="text-gray-400 text-sm mt-1">Companies</p>
              </div>

              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Active Users</h3>
                </div>
                <div className="text-3xl font-bold text-white">{stats.activeUsersLast24h}</div>
                <p className="text-gray-400 text-sm mt-1">Last 24 hours</p>
              </div>

              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-8 h-8 text-asu-gold" />
                  <h3 className="text-lg font-semibold text-white">Unread Messages</h3>
                </div>
                <div className="text-3xl font-bold text-white">{stats.pendingRequests}</div>
                <p className="text-gray-400 text-sm mt-1">Contact messages</p>
              </div>
            </div>

            {/* Filter Analytics */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Most Common Filters */}
              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <BarChart3 className="w-6 h-6 text-asu-gold" />
                  Most Used Search Filters
                </h3>
                {stats.filterAnalytics.mostCommonFilters.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No filter usage data available</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <Bar
                      data={{
                        labels: stats.filterAnalytics.mostCommonFilters.map(f => 
                          `${f.filter_type}: ${f.filter_value}`
                        ),
                        datasets: [{
                          label: 'Usage Count',
                          data: stats.filterAnalytics.mostCommonFilters.map(f => f.usage_count),
                          backgroundColor: 'rgba(255, 198, 39, 0.8)',
                          borderColor: 'rgba(255, 198, 39, 1)',
                          borderWidth: 1
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        scales: {
                          x: {
                            beginAtZero: true,
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                          },
                          y: {
                            ticks: { 
                              color: 'white',
                              font: { size: 10 }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: { color: 'white' }
                          },
                          tooltip: {
                            callbacks: {
                              title: (context) => {
                                const item = stats.filterAnalytics.mostCommonFilters[context[0].dataIndex]
                                return `${item.filter_type}: ${item.filter_value}`
                              },
                              label: (context) => `Used ${context.parsed.x} times`
                            }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Filter Usage Over Time */}
              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-asu-gold" />
                  Filter Usage Trends
                </h3>
                {stats.filterAnalytics.filterUsageOverTime.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No usage trend data available</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <Line
                      data={{
                        labels: stats.filterAnalytics.filterUsageOverTime.map(d => d.date),
                        datasets: [{
                          label: 'Filter Usage',
                          data: stats.filterAnalytics.filterUsageOverTime.map(d => d.count),
                          borderColor: 'rgba(255, 198, 39, 1)',
                          backgroundColor: 'rgba(255, 198, 39, 0.1)',
                          fill: true,
                          tension: 0.4
                        }]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          x: {
                            type: 'time',
                            time: {
                              unit: 'day',
                              displayFormats: {
                                day: 'MMM dd'
                              }
                            },
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                          },
                          y: {
                            beginAtZero: true,
                            ticks: { color: 'white' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                          }
                        },
                        plugins: {
                          legend: {
                            labels: { color: 'white' }
                          }
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Top Technical Skills - Full Width Below */}
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-asu-gold" />
                Top 20 Technical Skills
              </h3>
              {stats.skillsAnalytics.topSkills.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No skills data available</p>
                </div>
              ) : (
                <div>
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-asu-darker/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-asu-gold">{stats.skillsAnalytics.summary.totalUniqueSkills}</div>
                      <div className="text-gray-400 text-sm">Unique Skills</div>
                    </div>
                    <div className="bg-asu-darker/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-asu-gold">{stats.skillsAnalytics.summary.averageSkillsPerProfile}</div>
                      <div className="text-gray-400 text-sm">Avg per Profile</div>
                    </div>
                    <div className="bg-asu-darker/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-asu-gold">{stats.skillsAnalytics.summary.profilesWithSkills}</div>
                      <div className="text-gray-400 text-sm">Profiles with Skills</div>
                    </div>
                    <div className="bg-asu-darker/50 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-asu-gold">{stats.skillsAnalytics.summary.totalProfiles}</div>
                      <div className="text-gray-400 text-sm">Total Profiles</div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {stats.skillsAnalytics.topSkills.map((skillData, index) => (
                      <div key={skillData.skill} className="flex items-center justify-between p-3 bg-asu-darker/30 rounded-lg border border-asu-maroon/20 hover:border-asu-gold/30 transition-colors">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-asu-maroon/30 flex items-center justify-center text-xs text-asu-gold font-bold flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="text-white text-sm font-medium truncate" title={skillData.skill}>
                            {skillData.skill}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                          <span className="text-asu-gold font-semibold text-sm">{skillData.count}</span>
                          <span className="text-gray-400 text-xs">({skillData.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Users className="w-6 h-6 text-asu-gold" />
                  User Management ({usersPagination.total} total users)
                </h3>
                <button
                  onClick={loadUsers}
                  disabled={loadingUsers}
                  className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-asu-gold rounded-lg hover:bg-asu-maroon/30 transition-colors disabled:opacity-50"
                >
                  {loadingUsers ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Refresh Users
                </button>
              </div>
            </div>

            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 overflow-hidden">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-asu-gold animate-spin" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No users found</p>
                  <p className="text-sm mt-2">Check console for debugging information</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-asu-darker border-b border-asu-maroon/30">
                      <tr>
                        <th className="text-left p-4 text-asu-gold font-semibold">User</th>
                        <th className="text-left p-4 text-asu-gold font-semibold">Type</th>
                        <th className="text-left p-4 text-asu-gold font-semibold">Email Status</th>
                        <th className="text-left p-4 text-asu-gold font-semibold">Last Login</th>
                        <th className="text-left p-4 text-asu-gold font-semibold">Profile Views</th>
                        <th className="text-left p-4 text-asu-gold font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.id} className={`border-b border-asu-maroon/20 ${index % 2 === 0 ? 'bg-asu-darker/30' : ''}`}>
                          <td className="p-4">
                            <div>
                              <div className="text-white font-medium">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-gray-400 text-sm font-mono">
                                {user.user_id}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              user.type === 'candidate' 
                                ? 'bg-blue-500/20 text-blue-400' 
                                : 'bg-purple-500/20 text-purple-400'
                            }`}>
                              {user.type}
                            </span>
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="text-gray-300 text-sm">{user.auth_email || user.email_address}</div>
                              <div className="flex items-center gap-2 mt-1">
                                {user.email_confirmed ? (
                                  <>
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-xs">Verified</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                    <span className="text-yellow-400 text-xs">Unverified</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            {user.last_sign_in_at ? (
                              <div>
                                <div className="text-gray-300 text-sm">
                                  {formatDate(user.last_sign_in_at)}
                                </div>
                                <div className="text-gray-500 text-xs">
                                  {Math.floor((Date.now() - new Date(user.last_sign_in_at).getTime()) / (1000 * 60 * 60 * 24))} days ago
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">Never</span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="text-white font-medium">{user.view_count || 0}</div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateUserStatus(user.user_id, user.is_active ? 'deactivate' : 'activate')}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                  user.is_active 
                                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                                    : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                                }`}
                              >
                                {user.is_active ? (
                                  <>
                                    <UserX className="w-4 h-4 inline mr-1" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 inline mr-1" />
                                    Activate
                                  </>
                                )}
                              </button>
                              <a
                                href={`/candidate/${user.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1 bg-asu-maroon/20 text-asu-gold rounded-lg hover:bg-asu-maroon/30 transition-colors text-sm"
                              >
                                <Eye className="w-4 h-4 inline mr-1" />
                                View
                              </a>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {usersPagination.totalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-asu-maroon/30">
                  <div className="text-gray-400 text-sm">
                    Showing {((usersPagination.page - 1) * usersPagination.limit) + 1} to {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of {usersPagination.total} users
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(usersPagination.page - 1)}
                      disabled={usersPagination.page === 1 || loadingUsers}
                      className="flex items-center gap-2 px-3 py-2 bg-asu-maroon/20 text-white rounded-lg hover:bg-asu-maroon/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    
                    <span className="text-gray-300 px-4">
                      Page {usersPagination.page} of {usersPagination.totalPages}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(usersPagination.page + 1)}
                      disabled={usersPagination.page === usersPagination.totalPages || loadingUsers}
                      className="flex items-center gap-2 px-3 py-2 bg-asu-maroon/20 text-white rounded-lg hover:bg-asu-maroon/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Access Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-6 h-6 text-asu-gold" />
                  Unread Access Requests ({contactMessages.length})
                </h3>
                <button
                  onClick={loadContactMessages}
                  disabled={loadingMessages}
                  className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-asu-gold rounded-lg hover:bg-asu-maroon/30 transition-colors disabled:opacity-50"
                >
                  {loadingMessages ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  Refresh
                </button>
              </div>
            </div>

            {/* Messages Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Messages List */}
              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Unread Messages</h4>
                
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-asu-gold animate-spin" />
                  </div>
                ) : contactMessages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No unread messages</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {contactMessages.map(message => (
                      <div
                        key={message.id}
                        onClick={() => setSelectedMessage(message)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedMessage?.id === message.id
                            ? 'border-asu-gold bg-asu-maroon/10'
                            : 'border-asu-maroon/30 hover:border-asu-gold/50 hover:bg-asu-maroon/5'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{message.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${getRoleColor(message.role_type)}`}>
                              {message.role_type}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{message.email}</p>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {formatMessagePreview(message.message)}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {formatDate(message.created_at)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Message Detail */}
              <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
                <h4 className="text-lg font-semibold text-white mb-4">Message Details</h4>
                
                {selectedMessage ? (
                  <div className="space-y-6">
                    {/* Message Header */}
                    <div className="bg-asu-darker/50 rounded-lg p-4 border border-asu-maroon/20">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">From:</span>
                          <p className="text-white font-medium">{selectedMessage.name}</p>
                          <p className="text-gray-300">{selectedMessage.email}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Date:</span>
                          <p className="text-white">{formatDate(selectedMessage.created_at)}</p>
                        </div>
                        <div>
                          <span className="text-gray-400">Role:</span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getRoleColor(selectedMessage.role_type)}`}>
                            {selectedMessage.role_type}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Status:</span>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(selectedMessage.status)}`}>
                            {selectedMessage.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div>
                      <h5 className="text-white font-medium mb-3">Message:</h5>
                      <div className="bg-asu-darker/50 rounded-lg p-4 border border-asu-maroon/20">
                        <p className="text-gray-300 whitespace-pre-wrap">
                          {selectedMessage.message.split('\n\nResume:')[0]}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      {selectedMessage.status === 'unread' && (
                        <button
                          onClick={() => updateMessageStatus(selectedMessage.id, 'read')}
                          className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          Mark as Read
                        </button>
                      )}
                      
                      {selectedMessage.status !== 'archived' && (
                        <button
                          onClick={() => updateMessageStatus(selectedMessage.id, 'archived')}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          Archive
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a message to view details</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity' && (
          <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-6 h-6 text-asu-gold" />
                Recent User Activity
              </h3>
              <button
                onClick={loadRecentLogins}
                disabled={loadingRecentLogins}
                className="flex items-center gap-2 px-4 py-2 bg-asu-maroon/20 text-asu-gold rounded-lg hover:bg-asu-maroon/30 transition-colors disabled:opacity-50"
              >
                {loadingRecentLogins ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                Refresh
              </button>
            </div>
            
            {loadingRecentLogins ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-asu-gold animate-spin" />
              </div>
            ) : recentLogins.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent user activity</p>
                <p className="text-sm mt-2">Users will appear here when they log in and view profiles</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-asu-darker border-b border-asu-maroon/30">
                    <tr>
                      <th className="text-left p-4 text-asu-gold font-semibold">User</th>
                      <th className="text-left p-4 text-asu-gold font-semibold">Type</th>
                      <th className="text-left p-4 text-asu-gold font-semibold">Email</th>
                      <th className="text-left p-4 text-asu-gold font-semibold">Last Activity</th>
                      <th className="text-left p-4 text-asu-gold font-semibold">Profile Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogins.map((user, index) => (
                      <tr key={user.id} className={`border-b border-asu-maroon/20 ${index % 2 === 0 ? 'bg-asu-darker/30' : ''}`}>
                        <td className="p-4">
                          <div className="text-white font-medium">
                            {user.first_name} {user.last_name}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            user.type === 'candidate' 
                              ? 'bg-blue-500/20 text-blue-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {user.type}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-gray-300 text-sm font-mono">{user.email_address || 'N/A'}</div>
                        </td>
                        <td className="p-4">
                          <div>
                            <div className="text-gray-300 text-sm">
                              {formatDate(user.last_viewed_at)}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {Math.floor((Date.now() - new Date(user.last_viewed_at).getTime()) / (1000 * 60 * 60))} hours ago
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="text-white font-medium">{user.view_count || 0}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* System Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-asu-dark/50 backdrop-blur-sm rounded-xl border border-asu-maroon/30 p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Settings className="w-6 h-6 text-asu-gold" />
              System Settings
            </h3>
            <div className="text-center py-12 text-gray-400">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>System configuration coming soon</p>
              <p className="text-sm mt-2">This will include platform settings, feature toggles, and maintenance controls</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}