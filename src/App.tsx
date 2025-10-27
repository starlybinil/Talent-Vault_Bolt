import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import CandidateSearch from './pages/CandidateSearch'
import Resources from './pages/Resources'
import Contact from './pages/Contact'
import Employer from './pages/Employer'
import Dashboard from './pages/Dashboard'
import CandidateProfile from './pages/CandidateProfile'
import EmployerDashboard from './pages/EmployerDashboard'
import TalentPool from './pages/TalentPool'
import ViewProfile from './pages/ViewProfile'
import Candidate from './pages/Candidate'
import About from './pages/About'
import JobPreferences from './pages/JobPreferences'
import Profile from './pages/Profile'
import ProfileSettings from './pages/ProfileSettings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import FAQ from './pages/FAQ'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import InformationRequest from './pages/InformationRequest'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminLayout from './components/admin/AdminLayout'
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute'
import { AdminAuthProvider } from './contexts/AdminAuthContext'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import { checkIsAdmin } from './lib/api'

function CandidateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [userType, setUserType] = useState<string | null>(null)
  const navigate = useNavigate()
  
  useEffect(() => {
    async function getUserType() {
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('type')
        .eq('user_id', user.id)
        .single()

      setUserType(data?.type || null)
    }

    getUserType()
  }, [user])

  if (loading || !userType) return null
  
  if (userType === 'employer') {
    return <Navigate to="/dashboard" />
  }
  
  return <>{children}</>
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return null
  
  if (!user) {
    return <Navigate to="/login" />
  }
  
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  useEffect(() => {
    async function checkAdmin() {
      if (!user) return
      
      const adminStatus = await checkIsAdmin()
      setIsAdmin(adminStatus)
      setIsChecking(false)
    }

    checkAdmin()
  }, [user])

  if (loading || isChecking) return null
  
  if (!user || !isAdmin) {
    return <Navigate to="/" />
  }
  
  return <>{children}</>
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  
  if (loading) return null
  
  if (user) {
    return <Navigate to="/dashboard" />
  }
  
  return <>{children}</>
}

function App() {
  return (
    <AuthProvider>
      <AdminAuthProvider>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedAdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedAdminRoute>
          } />
          
          {/* Regular App Routes */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/employer" element={<Employer />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/information-request" element={<InformationRequest />} />
                <Route path="/talent" element={<TalentPool />} />
                <Route path="/search" element={
                  <ProtectedRoute>
                    <CandidateSearch />
                  </ProtectedRoute>
                } />
                <Route path="/candidate/:id" element={<CandidateProfile />} />
                <Route path="/candidate" element={<Candidate />} />
                <Route path="/login" element={
                  <AuthRoute>
                    <Login />
                  </AuthRoute>
                } />
                <Route path="/signup" element={
                  <AuthRoute>
                    <Signup />
                  </AuthRoute>
                } />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <DashboardRouter />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <CandidateRoute>
                    <Profile />
                  </CandidateRoute>
                } />
                <Route path="/profile/view" element={
                  <CandidateRoute>
                    <ViewProfile />
                  </CandidateRoute>
                } />
                <Route path="/profile/preferences" element={
                  <CandidateRoute>
                    <JobPreferences />
                  </CandidateRoute>
                } />
                <Route path="/profile/settings" element={
                  <CandidateRoute>
                    <ProfileSettings />
                  </CandidateRoute>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AdminAuthProvider>
    </AuthProvider>
  )
}

function DashboardRouter() {
  const { user } = useAuth()
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    async function getUserType() {
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('type')
        .eq('user_id', user.id)
        .single()

      setUserType(data?.type || null)
    }

    getUserType()
  }, [user])

  if (!userType) return null

  return userType === 'employer' ? <EmployerDashboard /> : <Dashboard />
}

export default App