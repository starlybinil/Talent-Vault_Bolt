import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, UserCircle, Settings, Eye, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ProfileDropdownProps {
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
}

export default function ProfileDropdown({ isOpen, setIsOpen }: ProfileDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [userType, setUserType] = useState<string | null>(null)

  useEffect(() => {
    async function getUserType() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const { data } = await supabase
        .from('profiles')
        .select('type')
        .eq('user_id', user.id)
        .single()

      setUserType(data?.type || null)
    }

    getUserType()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [setIsOpen])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-gray-300 hover:text-asu-gold"
      >
        Profile
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-asu-dark/95 backdrop-blur-sm rounded-lg shadow-xl border border-asu-maroon/30 py-2 z-50">
          <Link
            to="/profile/preferences"
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-asu-maroon/30 hover:text-asu-gold transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Briefcase className="w-4 h-4" />
            Job Preferences
          </Link>
          {userType === 'candidate' && (
            <Link
              to="/profile"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-asu-maroon/30 hover:text-asu-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <UserCircle className="w-4 h-4" />
              Edit Profile
            </Link>
          )}
          {userType === 'candidate' && (
            <Link
              to="/profile/view"
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-asu-maroon/30 hover:text-asu-gold transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Link>
          )}
          <Link
            to="/profile/settings"
            className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-asu-maroon/30 hover:text-asu-gold transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            Profile Settings
          </Link>
        </div>
      )}
    </div>
  )
}