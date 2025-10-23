import React from 'react'
import { CircuitBoard, GraduationCap, Building2, Users, Award } from 'lucide-react'
import Footer from '../components/Footer'
import { getStorageUrl } from '../lib/supabase'

export default function About() {
  return (
    <>
      <div className="bg-asu-dark py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex justify-center items-center gap-3 mb-6">
              <CircuitBoard className="w-12 h-12 text-asu-gold" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-4">
              About TalentVault
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Connecting industry leaders with exceptional microelectronics talent from the Southwest's premier educational institutions
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-12 mb-20">
          <div>
            <h2 className="text-3xl font-bold text-asu-gold mb-6">Our Mission</h2>
            <p className="text-gray-300 mb-6">
              TalentVault is an initiative by SWAP Hub, a Department of Defense Microelectronics Consortium, led by Arizona State University,
              designed to bridge the gap between industry needs and academic excellence in microelectronics.
            </p>
            <p className="text-gray-300">
              We're committed to supporting the semiconductor industry's growth in the Southwest 
              by providing direct access to a pipeline of skilled professionals ready to contribute 
              to the next generation of technological advancement.
            </p>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-asu-gold mb-6">Why TalentVault</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <GraduationCap className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Vetted Talent Pool</h3>
                  <p className="text-gray-400">Access pre-screened candidates from top engineering programs</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Building2 className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Industry Partnerships</h3>
                  <p className="text-gray-400">Collaborate with leading institutions in the Southwest</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Specialized Focus</h3>
                  <p className="text-gray-400">Dedicated to microelectronics and semiconductor manufacturing</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Award className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold mb-1">Quality Assurance</h3>
                  <p className="text-gray-400">Rigorous screening process for all candidates</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-asu-dark p-8 rounded-lg border border-asu-maroon mb-20">
          <h2 className="text-2xl font-bold text-asu-gold mb-6 text-center">Our Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-400">Graduates Placed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">50+</div>
              <div className="text-gray-400">Industry Partners</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-gray-400">Placement Rate</div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="text-3xl font-bold text-asu-gold mb-8 text-center">Leadership Team</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <div className="bg-asu-dark p-6 rounded-lg border border-asu-maroon">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/profile-photos//bstarly.png"
                alt="Prof. Binil Starly"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-asu-gold"
              />
              <h3 className="text-xl font-bold text-white text-center mb-2">Prof. Binil Starly</h3>
              <p className="text-asu-gold text-center mb-3">SWAP-Hub Workforce Development Lead</p>
              <p className="text-gray-400 text-center text-sm">
                Leading initiatives in microelectronics workforce development and industry partnerships
              </p>
            </div>
            
            <div className="bg-asu-dark p-6 rounded-lg border border-asu-maroon">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/profile-photos//tgligori.png"
                alt="Tamara Gligoric"
                className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-2 border-asu-gold"
              />
              <h3 className="text-xl font-bold text-white text-center mb-2">Tamara Gligoric</h3>
              <p className="text-asu-gold text-center mb-3">Program Coordinator</p>
              <p className="text-gray-400 text-center text-sm">
                Coordinating program activities and facilitating industry-academic partnerships
              </p>
            </div>
          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-asu-gold mb-6">Partner With Us</h2>
          <p className="text-gray-300 mb-8">
            Join leading semiconductor companies in building the future of microelectronics. 
            Get priority access to top talent and participate in exclusive recruiting events.
          </p>
          <a href="/contact" className="btn-primary inline-block">
            Get in Touch
          </a>
        </div>
      </div>

      <Footer />
    </>
  )
}