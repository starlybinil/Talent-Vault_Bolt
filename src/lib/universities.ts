interface University {
  name: string;
  state: string;
}

// Default list of universities for initial loading
export const universities: University[] = [
  { name: 'Arizona State University', state: 'Arizona' },
  { name: 'University of Arizona', state: 'Arizona' },
  { name: 'Northern Arizona University', state: 'Arizona' },
  { name: 'Maricopa Community Colleges', state: 'Arizona' },
  { name: 'Pima Community College', state: 'Arizona' },
  { name: 'University of Utah', state: 'Utah' },
  { name: 'Brigham Young University', state: 'Utah' },
  { name: 'Utah State University', state: 'Utah' },
  { name: 'New Mexico State University', state: 'New Mexico' },
  { name: 'University of New Mexico', state: 'New Mexico' },
  { name: 'University of Colorado, Boulder', state: 'Colorado' },
  { name: 'Colorado State University', state: 'Colorado' },
  { name: 'University of Nevada, Reno', state: 'Nevada' },
  { name: 'Other', state: 'Other' },
];

export const states = [
  'Arizona', 'California', 'Colorado', 'Nevada', 'New Mexico', 'Utah','Other'
];

export async function getUniversities(state: string): Promise<University[]> {
  const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/universities?state=${encodeURIComponent(state)}`
  
  const response = await fetch(apiUrl, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch universities')
  }

  return response.json()
}

export const majors = {
  engineering: [
    'General Engineering',
    'Robotics & Autonomous Systems',
    'Manufacturing Engineering',
    'Electrical Engineering',
    'Computer Engineering',
    'Mechanical Engineering',
    'Chemical Engineering',
    'Materials Science and Engineering',
    'Industrial Engineering',
    'Aerospace Engineering',
    'Biomedical Engineering',
    'Civil Engineering',
    'Software Engineering',
    'Engineering Physics'
  ],
  science: [
    'Information Technology',
    'Computer Science',
    'Physics',
    'Chemistry',
    'Mathematics',
    'Data Science',
    'Applied Mathematics',
    'Materials Science',
    'Biochemistry',
    'Applied Physics',
    'Other'
  ]
};