import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Clock, 
  Calendar,
  Eye,
  ExternalLink,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import Footer from '../components/Footer'

interface Resource {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  category: string
  company: string
  duration: string
  published_at: string
  view_count: number
}

const CATEGORIES = {
  manufacturing_overview: 'Manufacturing Process Overview',
  fabrication_technology: 'Fabrication Technology',
  industry_innovation: 'Industry Leaders & Innovation',
  equipment_tools: 'Equipment & Tools',
  quality_control: 'Quality Control & Testing'
}

const SORT_OPTIONS = {
  newest: 'Newest First',
  views: 'Most Viewed',
  title: 'Alphabetical'
}

export default function Resources() {
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'views' | 'title'>('newest')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadResources()
  }, [selectedCategory, sortBy])

  const loadResources = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('semiconductor_resources')
        .select('*')

      // Apply category filter
      if (selectedCategory) {
        query = query.eq('category', selectedCategory)
      }

      // Apply sorting
      switch (sortBy) {
        case 'newest':
          query = query.order('published_at', { ascending: false })
          break
        case 'views':
          query = query.order('view_count', { ascending: false })
          break
        case 'title':
          query = query.order('title')
          break
      }

      const { data, error } = await query

      if (error) throw error

      setResources(data || [])
    } catch (error) {
      console.error('Error loading resources:', error)
      setError('Failed to load resources')
    } finally {
      setLoading(false)
    }
  }

  const handleVideoClick = async (resource: Resource) => {
    try {
      // Track view
      await supabase.rpc('track_video_view', { resource_id: resource.id })
      
      // Open video in new tab
      window.open(resource.video_url, '_blank')
    } catch (error) {
      console.error('Error tracking video view:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark">
      {/* Header */}
      <div className="bg-asu-dark border-b border-asu-maroon/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Educational Resources
          </h1>
          <p className="text-xl text-gray-300">
            Explore curated videos about semiconductor manufacturing from industry leaders
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-10 bg-asu-dark border-b border-asu-maroon/30 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <Filter className="w-5 h-5 text-asu-gold" />
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="bg-asu-darker border border-asu-maroon/30 rounded-lg text-white px-4 py-2 focus:outline-none focus:border-asu-gold"
              >
                <option value="">All Categories</option>
                {Object.entries(CATEGORIES).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <ArrowUpDown className="w-5 h-5 text-asu-gold" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'views' | 'title')}
                className="bg-asu-darker border border-asu-maroon/30 rounded-lg text-white px-4 py-2 focus:outline-none focus:border-asu-gold"
              >
                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {error ? (
          <div className="text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg p-4">
            {error}
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-asu-gold"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group bg-asu-dark rounded-xl border border-asu-maroon/30 overflow-hidden hover:border-asu-gold/50 transition-all duration-300 cursor-pointer"
                onClick={() => handleVideoClick(resource)}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={resource.thumbnail_url}
                    alt={resource.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {resource.duration}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-asu-gold transition-colors">
                      {resource.title}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-asu-gold flex-shrink-0" />
                  </div>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {resource.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(resource.published_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      <span>{resource.view_count}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="text-sm bg-asu-maroon/20 text-asu-gold px-2 py-1 rounded-full">
                      {resource.company}
                    </span>
                    <span className="text-sm bg-asu-maroon/20 text-asu-gold px-2 py-1 rounded-full">
                      {CATEGORIES[resource.category as keyof typeof CATEGORIES]}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}