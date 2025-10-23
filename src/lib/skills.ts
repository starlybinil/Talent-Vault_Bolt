export interface SkillCategory {
  name: string;
  skills: string[];
  type: 'technical' | 'soft';
}

export const technicalSkills: SkillCategory[] = [
  {
    name: 'Process Technologies',
    type: 'technical',
    skills: [
      'Photolithography',
      'Etching Wet/Dry',
      'Ion Implantation',
      'Chemical Vapor Deposition',
      'Physical Vapor Deposition',
      'Plasma Processing',
      'Wafer Cleaning',
      'Chemical Mechanical Planarization'
    ]
  },
  {
    name: 'Equipment & Tools',
    type: 'technical',
    skills: [
      'Scanning Electron Microscopy',
      'Atomic Force Microscopy',
      'Ellipsometer',
      'Profilometer',
      'Mass Spectrometer',
      'Process Control Equipment',
      'Automated Test Equipment',
      'Industrial Robotics/Automation'
    ]
  },
  {
    name: 'Software & Analysis',
    type: 'technical',
    skills: [
      'TCAD Tools',
      'Statistical Process Control',
      'Design of Experiments',
      'Data Analysis Software',
      'Yield Management Systems',
      'CAD/CAM Software',
      'SPICE Simulation',
      'AI/ML',
      'Programming Languages-C++|Java|Python'
    ]
  },
  {
    name: 'Quality & Safety',
    type: 'technical',
    skills: [
      'ISO Standards',
      'Clean Room Protocols',
      'ESD Controls',
      'Hazardous Materials Handling',
      'Quality Management Systems',
      'Six Sigma Methods',
      'Root Cause Analysis'
    ]
  },
  {
    name: 'Manufacturing Systems',
    type: 'technical',
    skills: [
      'SCADA Systems',
      'MES Implementation',
      'Industry 4.0 Technologies',
      'Lean Manufacturing',
      'Process Automation',
      'Supply Chain Management'
    ]
  }
];

export const softSkills: SkillCategory[] = [
  {
    name: 'Leadership & Management',
    type: 'soft',
    skills: [
      'Project Management',
      'Team Leadership',
      'Strategic Planning',
      'Decision Making',
      'Mentoring',
      'Change Management',
      'Resource Allocation'
    ]
  },
  {
    name: 'Communication',
    type: 'soft',
    skills: [
      'Technical Writing',
      'Presentation Skills',
      'Cross-functional Communication',
      'Client Interaction',
      'Documentation',
      'Active Listening',
      'Stakeholder Management'
    ]
  },
  {
    name: 'Professional Skills',
    type: 'soft',
    skills: [
      'Problem Solving',
      'Critical Thinking',
      'Time Management',
      'Adaptability',
      'Attention to Detail',
      'Analytical Thinking',
      'Innovation',
      'Continuous Learning'
    ]
  }
];