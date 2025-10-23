import React, { useState, useEffect, useRef } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

interface SkillsDropdownProps {
  skills: string[];
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  isLoading?: boolean;
}

export default function SkillsDropdown({ 
  skills, 
  selectedSkills, 
  onSkillsChange,
  isLoading = false 
}: SkillsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter skills based on search term
  const filteredSkills = skills.filter(skill =>
    skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle skill selection
  const toggleSkill = (skill: string) => {
    const newSelection = selectedSkills.includes(skill)
      ? selectedSkills.filter(s => s !== skill)
      : [...selectedSkills, skill];
    onSkillsChange(newSelection);
  };

  // Select/Clear all visible skills
  const handleSelectAll = () => {
    onSkillsChange([...new Set([...selectedSkills, ...filteredSkills])]);
  };

  const handleClearAll = () => {
    onSkillsChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-2 bg-asu-darker border ${
          isOpen ? 'border-asu-gold' : 'border-asu-maroon/30'
        } rounded-lg text-white hover:border-asu-gold/50 transition-colors`}
      >
        <span>
          {selectedSkills.length === 0
            ? 'Select Technical Skills'
            : `${selectedSkills.length} skill${selectedSkills.length === 1 ? '' : 's'} selected`}
        </span>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Selected Skills Tags */}
      {selectedSkills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedSkills.map(skill => (
            <span
              key={skill}
              className="flex items-center gap-1 px-2 py-1 bg-asu-maroon/20 text-asu-gold rounded-full text-sm"
            >
              {skill}
              <button
                onClick={() => toggleSkill(skill)}
                className="hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-asu-darker border border-asu-maroon/30 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-2 border-b border-asu-maroon/30">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search skills..."
                className="w-full pl-9 pr-4 py-2 bg-asu-dark border border-asu-maroon/30 rounded-md text-white focus:outline-none focus:border-asu-gold"
              />
            </div>
          </div>

          {/* Select All / Clear All */}
          <div className="flex justify-between p-2 border-b border-asu-maroon/30">
            <button
              onClick={handleSelectAll}
              className="text-sm text-asu-gold hover:text-asu-gold/80"
            >
              Select All
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-asu-gold hover:text-asu-gold/80"
            >
              Clear All
            </button>
          </div>

          {/* Skills List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-4 text-center text-gray-400">
                Loading skills...
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No skills found
              </div>
            ) : (
              filteredSkills.map(skill => (
                <label
                  key={skill}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-asu-maroon/20 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedSkills.includes(skill)}
                    onChange={() => toggleSkill(skill)}
                    className="rounded border-gray-600 bg-asu-dark text-asu-gold focus:ring-asu-gold"
                  />
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {skill}
                  </span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}