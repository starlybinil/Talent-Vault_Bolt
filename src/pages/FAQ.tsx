import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import { HelpCircle, Plus, Minus, Search } from 'lucide-react'
import { useSearchFaqs } from '../lib/faq'

export default function FAQ() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Use the search hook
  const filteredFaqs = useSearchFaqs(searchQuery)

  return (
    <div className="min-h-screen bg-gradient-to-b from-asu-darker to-asu-dark">
      {/* Hero Banner */}
      <div 
        className="relative h-[300px] bg-cover bg-center"
        style={{ 
          backgroundImage: `url(https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/Chips/210817-Building-AEP-809.jpg)`
        }}
      >
        {/* Dark overlay with reduced opacity for brighter background */}
        <div className="absolute inset-0 bg-gradient-to-b from-asu-darker/70 to-asu-darker/55"></div>
        
        {/* Content */}
        <div className="relative h-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center">
          <h1 className="text-5xl font-bold text-white mb-6 text-center">
            Frequently Asked Questions
          </h1>
          
          {/* Search Bar */}
          <div className="w-full max-w-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search frequently asked questions..."
                className="w-full pl-12 pr-4 py-3 bg-asu-dark/50 backdrop-blur-sm border border-asu-maroon/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-asu-gold transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-6">
          {filteredFaqs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg mb-4">No questions found matching "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery('')}
                className="text-asu-gold hover:text-asu-gold/80 transition-colors"
              >
                Clear search
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-asu-dark/50 backdrop-blur-sm border border-asu-maroon/30 rounded-xl overflow-hidden transition-all duration-300 hover:border-asu-gold/50"
              >
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-asu-maroon/10 transition-colors"
                >
                  <span className="text-white font-medium">{faq.question}</span>
                  {openFaqIndex === index ? (
                    <Minus className="w-5 h-5 text-asu-gold flex-shrink-0" />
                  ) : (
                    <Plus className="w-5 h-5 text-asu-gold flex-shrink-0" />
                  )}
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 py-4 text-gray-300 border-t border-asu-maroon/30 bg-asu-maroon/5">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 mb-6">
            Still have questions? We're here to help!
          </p>
          <Link
            to="/information-request"
            className="inline-flex items-center gap-2 bg-asu-maroon hover:bg-asu-maroon/90 text-white px-6 py-3 rounded-lg transition-colors"
          >
            <HelpCircle className="w-5 h-5" />
            Request Information
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  )
}