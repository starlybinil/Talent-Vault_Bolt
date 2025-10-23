import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Users,
  GraduationCap,
  Briefcase,
  MapPin,
  Shield,
  Bookmark,
  BookmarkCheck,
  Mail,
  Linkedin,
  Globe
} from 'lucide-react'

interface CandidateCardProps {
  candidate: {
    id: string;
    first_name: string;
    last_name: string;
    bio: string | null;
    photo_url: string | null;
    education: any[];
    experience: Array<{
      company: string;
      position: string;
      startDate: string;
      endDate?: string;
      current: boolean;
      description: string;
    }>;
    technical_skills: string[];
    soft_skills: string[];
    job_opportunity_type: string;
    nationality_status: string;
    security_clearance: string;
   email_address?: string;
    linkedin: string | null;
    projects: Array<{
      name: string;
      description: string;
      technologies: string[];
      url?: string;
    }>;
  };
  onSave: (id: string) => void;
  isSaved: boolean;
  onDelete?: (id: string) => void;
  onClick?: () => void;
  isSelected?: boolean;
}

export default function CandidateCard({ candidate, onSave, onDelete, isSaved, onClick, isSelected }: CandidateCardProps) {
  return (
    <motion.div
      layout
      className={`bg-asu-dark rounded-xl border ${
        isSelected ? 'border-asu-gold' : 'border-asu-maroon/30'
      } p-6 hover:border-asu-gold/50 transition-all duration-300 cursor-pointer group`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Basic Info */}
      <motion.div layout="position" className="flex items-start gap-4 mb-4">
        {candidate.photo_url ? (
          <img
            loading="lazy"
            src={candidate.photo_url}
            alt={`${candidate.first_name} ${candidate.last_name}`}
            className="w-16 h-16 rounded-xl object-cover border-2 border-asu-gold/50 transition-all duration-300"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-asu-maroon/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-asu-gold" />
          </div>
        )}
        <div className="flex-1">
          <motion.h3 layout="position" className="text-lg font-semibold text-white">
            {candidate.first_name} {candidate.last_name}
          </motion.h3>
          {Array.isArray(candidate.education) && candidate.education[0] && (
            <motion.div layout="position" className="flex items-center gap-2 text-sm text-gray-400">
              <GraduationCap className="w-4 h-4 text-asu-gold" />
              <span className="text-gray-300">
                {candidate.education[0].degree}
                {candidate.education[0].major && ` in ${candidate.education[0].major}`}
                {candidate.education[0].field && !candidate.education[0].major && ` in ${candidate.education[0].field}`}
                {candidate.education[0].school && ` • ${candidate.education[0].school}`}
              </span>
            </motion.div>
          )}
        </div>
        <motion.button
          layout="position"
          onClick={(e) => {
            e.stopPropagation();
            if (isSaved && onDelete) {
              onDelete(candidate.id);
            } else {
              onSave(candidate.id);
            }
          }}
          className="flex items-center gap-2 text-sm text-asu-gold hover:text-asu-gold/80 transition-colors"
        >
          {isSaved ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          <span className="hidden md:inline">
            {isSaved ? 'Saved' : 'Save Profile'}
          </span>
        </motion.button>
      </motion.div>

      {/* Basic Details */}
      <motion.div layout="position" className="space-y-3 mb-4">
       {/* Email Address */}
       {candidate.email_address && (
         <div className="flex items-center gap-2 text-sm">
           <Mail className="w-4 h-4 text-asu-gold" />
           <span className="text-gray-300 font-mono truncate">{candidate.email_address}</span>
         </div>
       )}

        {candidate.job_opportunity_type && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-asu-gold" />
            <span className="text-gray-300">
              {candidate.job_opportunity_type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
              ).join(' ')}
            </span>
          </div>
        )}

        {candidate.nationality_status && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-asu-gold" />
            <span className="text-gray-300">{candidate.nationality_status}</span>
          </div>
        )}

        {candidate.security_clearance && (
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-asu-gold" />
            <span className="text-gray-300">{candidate.security_clearance}</span>
          </div>
        )}

        {/* Experience Preview */}
        {Array.isArray(candidate.experience) && candidate.experience[0] && (
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="w-4 h-4 text-asu-gold" />
            <span className="text-gray-300">
              {candidate.experience[0].position} at {candidate.experience[0].company}
            </span>
          </div>
        )}

        {/* Bio Preview */}
        {candidate.bio && (
          <p className="text-sm text-gray-400 line-clamp-2 mt-2">
            {candidate.bio}
          </p>
        )}
      </motion.div>

      {/* Additional Links */}
      <div className="flex items-center gap-4 mt-4">
        {candidate.linkedin && (
          <a
            href={candidate.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-asu-gold transition-colors"
          >
            <Linkedin className="w-4 h-4" />
          </a>
        )}
      </div>
    </motion.div>
  )
}