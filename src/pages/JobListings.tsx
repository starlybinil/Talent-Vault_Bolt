import React from 'react'

export default function JobListings() {
  const jobs = [
    {
      id: 1,
      title: 'VLSI Design Engineer',
      company: 'TechSemi Corp',
      location: 'San Jose, CA',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'Looking for an experienced VLSI Design Engineer...'
    },
    {
      id: 2,
      title: 'Process Integration Engineer',
      company: 'Chip Solutions',
      location: 'Austin, TX',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Join our team developing next-gen semiconductor processes...'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Listings</h1>
        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search jobs..."
            className="input-field max-w-xs"
          />
          <select className="input-field max-w-xs">
            <option value="">All Locations</option>
            <option>San Jose, CA</option>
            <option>Austin, TX</option>
            <option>Phoenix, AZ</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {jobs.map(job => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{job.title}</h2>
                <p className="text-gray-600">{job.company}</p>
              </div>
              <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-sm">
                {job.type}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{job.location}</span>
                <span>Posted {job.posted}</span>
              </div>
              <button className="btn-primary">Apply Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}