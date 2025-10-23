import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SkillsAccordionProps {
  category: {
    name: string;
    skills: string[];
  };
  selectedSkills: string[];
  onSkillToggle: (skill: string) => void;
}

export default function SkillsAccordion({ category, selectedSkills, onSkillToggle }: SkillsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  return (
    <div className="bg-asu-dark p-6 rounded-xl border border-asu-maroon/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <h4 className="text-asu-gold font-medium">{category.name}</h4>
        <ChevronDown 
          className={`w-5 h-5 text-asu-gold transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>
      
      <div
        className={`grid grid-cols-2 md:grid-cols-3 gap-3 transition-all duration-200 ${
          isOpen ? 'mt-4 opacity-100' : 'h-0 opacity-0 overflow-hidden'
        }`}
      >
        {category.skills.map((skill) => (
          <label key={skill} className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedSkills.includes(skill)}
              onChange={() => onSkillToggle(skill)}
              className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
            />
            <span className="text-gray-300">{skill}</span>
          </label>
        ))}
      </div>
    </div>
  )
}