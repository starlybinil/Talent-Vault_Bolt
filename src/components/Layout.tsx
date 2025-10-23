import React, { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import AnnouncementBanner from './AnnouncementBanner'

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [location.pathname])

  useEffect(() => {
    // Intercept navigation events
    const handleNavigation = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const link = target.closest('a')
      
      if (link && link.getAttribute('href')?.startsWith('/')) {
        event.preventDefault()
        const to = link.getAttribute('href') || '/'
        
        // Dispatch a custom event that components can listen for
        const navigationEvent = new CustomEvent('navigationAttempt', {
          detail: { to },
          cancelable: true
        })
        
        if (document.dispatchEvent(navigationEvent)) {
          navigate(to)
        }
      }
    }

    document.addEventListener('click', handleNavigation)
    return () => document.removeEventListener('click', handleNavigation)
  }, [navigate])

  return (
    <div className="min-h-screen bg-asu-darker relative">
      <AnnouncementBanner />
      <Navbar />
      <main className="pt-[116px]">
        {children}
      </main>
    </div>
  )
}