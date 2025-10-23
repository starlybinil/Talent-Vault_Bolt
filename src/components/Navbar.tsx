import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useLocation } from 'react-router-dom'
import { CircuitBoard, Loader2, Search, Building2, Menu, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useEffect, useState, useCallback } from 'react'
import ProfileDropdown from './ProfileDropdown'

export default function Navbar() {
  const { user, signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [swapHubLogo, setSwapHubLogo] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [userType, setUserType] = useState<string | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const loadUserType = useCallback(async () => {
    if (!user) return
    
    try {
      const { data } = await supabase
        .from('profiles')
        .select('type')
        .eq('user_id', user.id)
        .single()

      setUserType(data?.type || null)
    } catch (error) {
      console.error('Error loading user type:', error)
    }
  }, [user])

  useEffect(() => {
    loadUserType()
  }, [loadUserType])

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true)
      setIsProfileDropdownOpen(false)
      
      // Get current session before signing out
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        // If no session exists, just navigate to login
        navigate('/login')
        return
      }
      
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      navigate('/login')
    } finally { 
      setIsLoggingOut(false)
    }
  }

  useEffect(() => {
    async function getLogoUrl() {
      const { data: { publicUrl } } = supabase
        .storage
        .from('logos')
        .getPublicUrl('SWAP_hub.white.png')
      
      setSwapHubLogo(publicUrl)
    }

    getLogoUrl()
  }, [])

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-asu-dark/90 backdrop-blur-md shadow-xl border-b border-asu-maroon/30 fixed top-[48px] left-0 right-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left side: Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center space-x-4 text-xl font-bold text-asu-gold mr-8 transition-colors hover:text-white">
              <div className="flex items-center space-x-2">
                <CircuitBoard className="w-6 h-6" />
                <span>TalentVault</span>
              </div>
              {swapHubLogo && (
                <>
                  <div className="h-8 w-px bg-asu-maroon/30" />
                  <img
                    src={swapHubLogo}
                    alt="SWAP Hub Logo"
                    className="h-8 w-auto"
                  />
                </>
              )}
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-300 hover:text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Center: User actions */}
          <div className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-16 md:top-0 left-0 right-0 md:items-center flex-col md:flex-row bg-asu-dark md:bg-transparent py-4 md:py-0 space-y-4 md:space-y-0 md:space-x-6 px-4 md:px-0 border-b md:border-b-0 border-asu-maroon/30 z-30`}>
            {user ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`${location.pathname === '/dashboard' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide`}
                >
                  Dashboard
                </Link>
                {userType === 'employer' && (
                  <>
                    <Link 
                      to="/search" 
                      className={`${location.pathname === '/search' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide flex items-center gap-1`}
                    >
                      <Search className="w-4 h-4" />
                      Search Candidates
                    </Link>
                  </>
                )}
                <Link 
                  to="/faq" 
                  className={`${location.pathname === '/faq' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide`}
                >
                  FAQ
                </Link>
                {userType !== 'employer' && <ProfileDropdown 
                  isOpen={isProfileDropdownOpen}
                  setIsOpen={setIsProfileDropdownOpen}
                />}
                {isLoggingOut ? (
                  <div className="flex items-center gap-2 text-asu-gold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing out...</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSignOut}
                    className="text-gray-300 transition-all duration-200 hover:text-white tracking-wide"
                    disabled={isLoggingOut}
                  >
                    Sign Out
                  </button>
                )}
              </>
            ) : (
              <div className="flex items-center gap-6">
                <Link 
                  to="/" 
                  className={`${location.pathname === '/' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide`}
                >
                  Home
                </Link>
                <Link 
                  to="/candidate" 
                  className={`${location.pathname === '/candidate' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide`}
                >
                  Candidate
                </Link>
                <Link 
                  to="/employer" 
                  className={`${location.pathname === '/employer' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide`}
                >
                  Employer
                </Link>
                <Link 
                  to="/faq" 
                  className={`${location.pathname === '/faq' ? 'text-asu-gold font-medium' : 'text-gray-300'} transition-all duration-200 hover:text-white tracking-wide`}
                >
                  FAQ
                </Link>
                <div className="border-l border-asu-maroon/30 pl-6 flex items-center gap-4">
                  <Link
                    to="/login"
                    className="text-gray-300 transition-all duration-200 hover:text-white tracking-wide"
                  >
                    Login
                  </Link>
                  <Link
                    to="/contact"
                    className="bg-asu-maroon hover:bg-asu-maroon/90 text-white px-4 py-2 rounded-lg transition-all duration-200"
                  >
                    Request Access
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}