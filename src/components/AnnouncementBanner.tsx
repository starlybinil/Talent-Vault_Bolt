import { Link } from 'react-router-dom'
import { Bell } from 'lucide-react'

export default function AnnouncementBanner() {
  return (
    <div
      className="bg-asu-gold text-black py-3 sm:py-3.5 md:py-4 px-4 sm:px-6 md:px-8 text-center text-sm sm:text-base md:text-base font-normal fixed top-0 left-0 right-0 z-[70] w-full"
      style={{
        /* Ensures banner stays visible during zoom on all devices */
        WebkitTransform: 'translateZ(0)',
        transform: 'translateZ(0)',
        willChange: 'transform',
        /* Ensure minimum height for text visibility */
        minHeight: '56px'
      }}
    >
      {/* Fixed at top with z-[70]. Navbar positioned below using top offset. Height adjusts based on content wrapping */}
      <div className="flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 leading-relaxed min-h-[48px] sm:min-h-[52px] md:min-h-[56px] w-full max-w-7xl mx-auto">
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
