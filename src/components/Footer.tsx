import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { CircuitBoard, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useEffect, useState } from 'react'

export default function Footer() {
  const location = useLocation()
  const [swapHubLogo, setSwapHubLogo] = useState<string | null>(null)

  return (
    <footer className="bg-asu-dark border-t border-asu-maroon/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex flex-col space-y-4 mb-4">
              <div className="flex items-center space-x-2 text-xl font-bold text-asu-gold">
                <CircuitBoard className="w-6 h-6" />
                <span>TalentVault</span>
              </div>
            </Link>
            <p className="text-gray-400">
              Connecting microelectronics talent with industry opportunities
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">For Students</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/contact" className="hover:text-asu-gold">Create Profile</Link></li>
              <li><Link to="/resources" className="hover:text-asu-gold">Resources</Link></li>
              <li><Link to="/faq" className="hover:text-asu-gold">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">For Employers</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link to="/talent" className="hover:text-asu-gold">Search Talent</Link></li>
              <li><Link to="/employer" className="hover:text-asu-gold">Employer Benefits</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link to="/about" className="hover:text-asu-gold">About Us</Link>
              </li>
              <li>
                <Link 
                  to="/contact"
                  className="hover:text-asu-gold"
                >
                  Request Access
                </Link>
              </li>
              <li>
                <a 
                  href="https://www.semiconductors.org/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-asu-gold flex items-center gap-1"
                >
                  Industry Resources
                  <ChevronRight className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-asu-maroon/30 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} TalentVault. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link to="/faq" className="text-gray-500 hover:text-asu-gold text-sm">
              FAQ
            </Link>
            <span className="text-gray-600">|</span>
            <Link to="/information-request" className="text-gray-500 hover:text-asu-gold text-sm">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}