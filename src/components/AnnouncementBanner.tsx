import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'

export default function AnnouncementBanner() {
  return (
    <div className="bg-asu-gold text-black py-2 sm:py-3 px-3 sm:px-4 text-center text-xs sm:text-sm md:text-base font-normal fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-center gap-1.5 sm:gap-2">
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 flex-shrink-0" />
        <span>
          <span className="font-bold">Coming Soon:</span> Southwest Workforce Needs Assessment Report, exclusively for TalentVault members.{' '}
          <Link to="/contact" className="text-asu-maroon underline hover:text-asu-maroon/80 transition-colors font-bold">
            Request access today.
          </Link>
        </span>
      </div>
    </div>
  )
}
