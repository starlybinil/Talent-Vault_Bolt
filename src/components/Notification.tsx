import React, { useEffect } from 'react'
import { AlertCircle, CheckCircle2, X } from 'lucide-react'

interface NotificationProps {
  type: 'success' | 'error' | 'warning'
  message: string
  isOpen: boolean
  onClose: () => void
}

const Notification = React.memo(function Notification({ type, message, isOpen, onClose }: NotificationProps) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000)
      return () => clearTimeout(timer)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertCircle
  }

  const colors = {
    success: 'bg-asu-maroon/10 border-asu-maroon/30 text-asu-gold',
    error: 'bg-red-500/10 border-red-500/20 text-red-400',
    warning: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
  }

  const Icon = icons[type]

  const baseClasses = "fixed bottom-4 right-4 max-w-md w-full p-4 rounded-lg border backdrop-blur-sm shadow-lg transform transition-all duration-300 z-50"
  const visibilityClasses = isOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"

  return (
    <div className={`${baseClasses} ${colors[type]} ${visibilityClasses}`}>
      <div className="flex items-center justify-between gap-3">
        <Icon className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium flex-1">{message}</p>
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
})

export default Notification