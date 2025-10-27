import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function AnnouncementBanner() {
  const { user } = useAuth()

  if (user) {
    return null
  }

  return (
    <div
      className="bg-asu-gold text-black py-2 sm:py-2.5 md:py-3 px-4 sm:px-6 md:px-8 text-center text-sm sm:text-base md:text-base font-normal fixed top-0 left-0 right-0 z-[70] w-full"
      style={{
        /* Ensures banner stays visible during zoom on all devices */
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'transform'
      }}
    >
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 leading-tight w-full max-w-7xl mx-auto">
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 flex-shrink-0" aria-hidden="true" />
        <span className="inline-block max-w-full break-words text-center">
          <span className="font-bold whitespace-nowrap">Coming Soon:</span>{' '}
          <span className="inline">Southwest Workforce Needs Assessment Report, exclusively for TalentVault members.{' '}</span>
          <Link
            to="/contact"
            className="text-asu-maroon underline hover:text-asu-maroon/80 transition-colors font-bold whitespace-nowrap inline-block"
            aria-label="Request access to Southwest Workforce Needs Assessment Report"
          >
            Request access today.
          </Link>
        </span>
      </div>
    </div>
  )
}
