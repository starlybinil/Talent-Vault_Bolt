import React from 'react'
import { getStorageUrl } from '../lib/supabase'
import { GraduationCap, MapPin, Award } from 'lucide-react'

interface StudentCardProps {
  name: string
  degree: string
  university: string
  location: string
  skills: string[]
  achievements: string[]
  photoUrl: string
}

export default function StudentCard({
  name,
  degree,
  university,
  location,
  skills,
  achievements,
  photoUrl
}: StudentCardProps) {
  return (
    <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-2xl border border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(140,29,64,0.2)] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-asu-maroon/5 rounded-full blur-3xl group-hover:bg-asu-gold/5 transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-asu-gold/5 rounded-full blur-2xl group-hover:bg-asu-maroon/5 transition-colors duration-500" />
      
      {/* Profile section */}
      <div className="flex items-start gap-4 mb-6 relative">
        <img
          src={photoUrl}
          alt={name}
          className="w-20 h-20 rounded-2xl object-cover border-2 border-asu-gold/50 group-hover:border-asu-gold group-hover:scale-105 transition-all duration-300 shadow-lg"
        />
        <div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-asu-gold transition-colors">{name}</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-gray-400">
              <GraduationCap className="w-4 h-4 text-asu-gold/70" />
              <span className="text-sm">{degree}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MapPin className="w-4 h-4 text-asu-gold/70" />
              <span className="text-sm">{location}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Achievements section */}
      <div className="mb-6 relative">
        <div className="flex items-center gap-2 mb-3">
          <Award className="w-5 h-5 text-asu-gold" />
          <span className="text-white font-semibold">Achievements</span>
        </div>
        <ul className="space-y-2">
          {achievements.map((achievement, index) => (
            <li key={index} className="text-gray-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-asu-gold/50" />
              {achievement}
            </li>
          ))}
        </ul>
      </div>

      {/* Skills section */}
      <div className="flex flex-wrap gap-2 relative">
        {skills.map((skill) => (
          <span
            key={skill}
            className="bg-asu-maroon/20 text-asu-gold/90 px-3 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm hover:bg-asu-maroon/30 hover:text-asu-gold transition-colors duration-200"
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  )
}