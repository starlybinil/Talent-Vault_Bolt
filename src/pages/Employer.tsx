import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import AnimatedHeroBanner from '../components/AnimatedHeroBanner'
import { 
  CircuitBoard,
  Building2,
  Users,
  Search,
  ArrowRight,
  Briefcase,
  LineChart,
  Clock,
  CheckCircle2,
  FileText,
  Bell,
  MessageSquare,
  Target,
  Rocket,
  Shield,
  UserCheck,
  GraduationCap,
  Cpu,
  RefreshCw
} from 'lucide-react'

export default function Employer() {
  const messages = [
    {
      title: "Access Elite Talent in",
      subtitle: "Microelectronics"
    },
    {
      title: "Build Your Future",
      subtitle: "Workforce"
    },
    {
      title: "Connect with Top",
      subtitle: "Engineering Talent"
    }
  ]

  return (
    <>
      {/* Floating CTA Button */}
      <div className="fixed bottom-8 right-8 z-50 animate-bounce">
        <Link
          to="/contact"
          className="flex items-center gap-2 bg-asu-maroon hover:bg-asu-maroon/90 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group"
        >
          Request Access
          <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <AnimatedHeroBanner
        messages={messages}
        backgroundImage="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/Facility/mtw3.png"
      />

      {/* Description text centered between banner and WHO CAN ACCESS */}
      <div className="py-20 bg-gradient-to-b from-asu-darker to-transparent w-full">
        <div className="container mx-auto px-4">
          <p className="text-xl md:text-2xl text-white text-center max-w-[100%]">
            Connect with highly qualified candidates specializing in semiconductor manufacturing and microelectronics engineering.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* WHO CAN ACCESS section */}
        <div className="mb-20">
          <div className="section-title">
            <h2>WHO CAN ACCESS</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            TalentVault is exclusively available to verified employers in the semiconductor and microelectronics industry.
          </p>

          {/* Access categories */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Industry Partners */}
            <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-8 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-asu-gold text-center mb-6">Industry Partners</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Semiconductor Companies</p>
                    <p className="text-gray-400 text-sm">Manufacturing, design, and equipment companies</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Verified Status</p>
                    <p className="text-gray-400 text-sm">Confirmed industry presence and operations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <UserCheck className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Active Hiring</p>
                    <p className="text-gray-400 text-sm">Current job openings in relevant fields</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Research Institutions */}
            <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-8 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-asu-gold text-center mb-6">Research Labs</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <GraduationCap className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Academic Partners</p>
                    <p className="text-gray-400 text-sm">University and research institution labs</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Research Focus</p>
                    <p className="text-gray-400 text-sm">Microelectronics and semiconductor research</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Collaboration</p>
                    <p className="text-gray-400 text-sm">Industry-academic partnerships</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Government Agencies */}
            <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-8 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
              <h3 className="text-2xl font-bold text-asu-gold text-center mb-6">Government</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Federal Agencies</p>
                    <p className="text-gray-400 text-sm">Defense and research organizations</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Strategic Focus</p>
                    <p className="text-gray-400 text-sm">National security and innovation</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Rocket className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Development</p>
                    <p className="text-gray-400 text-sm">Advanced technology initiatives</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Use TalentVault */}
        <div className="mb-20">
          <div className="section-title">
            <h2>WHY USE TALENTVAULT</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Access a curated pool of qualified candidates specializing in microelectronics and semiconductor manufacturing.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Search className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Pre-Screened Talent</h3>
                    <p className="text-gray-400 text-sm">Access verified candidates with specialized skills in semiconductor technology.</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <LineChart className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Skill Assessment</h3>
                    <p className="text-gray-400 text-sm">Detailed technical proficiency data and verified credentials.</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Time Efficiency</h3>
                    <p className="text-gray-400 text-sm">Reduce hiring time with our streamlined recruitment process.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/MSN-Lab-Shoot-2024-AK2-1424-a.jpg"
                alt="Advanced semiconductor manufacturing facility"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-asu-darker via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div>
          <div className="section-title">
            <h2>HOW DOES IT WORK</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Start accessing top microelectronics talent in just a few simple steps.
          </p>
          <div className="bg-asu-dark p-8 rounded-xl border border-asu-maroon/30">
            <div className="relative">
              {/* Vertical dotted line connecting steps */}
              <div 
                className="absolute left-[22px] top-16 bottom-16 border-l-2 border-dotted border-asu-gold"
                style={{
                  borderLeftStyle: 'dotted',
                  borderLeftWidth: '3px'
                }}
              />
              
              <div className="space-y-12">
                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">1</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CheckCircle2 className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">Sign Up & Verify Account</h3>
                    </div>
                    <p className="text-gray-300">Create an employer account to access the candidate pool.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">2</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Search className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">Search Candidates</h3>
                    </div>
                    <p className="text-gray-300">Filter through pre-vetted candidates based on education, skills, experience, and location.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">3</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <MessageSquare className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">Connect Directly</h3>
                    </div>
                    <p className="text-gray-300">Engage with candidates through our secure messaging system.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">4</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <RefreshCw className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">Keep Employer Profile Up to Date</h3>
                    </div>
                    <p className="text-gray-300">Monitor hiring status and candidate interactions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}