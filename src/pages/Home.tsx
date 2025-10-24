import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import AnimatedHeroBanner from '../components/AnimatedHeroBanner'
import { CircuitBoard, Building2, Users, Search, ArrowRight, Briefcase, LineChart, Clock, CheckCircle2, FileText, Bell, MessageSquare, Target, Rocket, Shield, UserCheck, GraduationCap, Cpu, RefreshCw, BarChart as ChartBar, TrendingUp, Zap } from 'lucide-react'

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && videoRef.current) {
          videoRef.current.play();
        } else if (videoRef.current) {
          videoRef.current.pause();
        }
      });
    }, options);

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => {
      if (videoRef.current) {
        observer.unobserve(videoRef.current);
      }
    };
  }, []);

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
      {/* Hero Section with Image Grid */}
      <div className="relative min-h-[70vh] md:min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Image Grid */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-1 md:gap-2">
          <div className="relative h-full">
            <div className="absolute inset-0">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/MSN-Lab-Shoot-2024-AK2-1424-a.jpg"
                alt="Students working in semiconductor lab"
                className="w-full h-full object-cover object-[center_30%]"
              />
            </div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="relative h-full">
            <div className="absolute inset-0">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/Facility/210627-ASU-Semiconductors-MacroTechnology-4316.jpg"
                alt="Engineers collaborating in clean room"
                className="w-full h-full object-cover object-[center_30%]"
              />
            </div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="relative h-full">
            <div className="absolute inset-0">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/241120%20ASU%20Polytechnic%20campus%20-%20SIM%20190%20Lab%20Photos%20-%20%20663A0612.JPG%20-%20%20SM.jpg"
                alt="Team working on semiconductor equipment"
                className="w-full h-full object-cover object-[center_30%]"
              />
            </div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
          <div className="relative h-full">
            <div className="absolute inset-0">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/240101_asu_thrive_winter_2024_issue_-_our_secret_weapon_2400x1350_asu_news_article_lead_photo_-_headline_on_top_1.jpeg"
                alt="Engineers in clean room suits"
                className="w-full h-full object-cover object-[center_30%]"
              />
            </div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-asu-darker/80 via-asu-darker/75 to-asu-darker/80"></div>

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 md:mb-8 leading-tight">
            Connecting Top Talent with
            <span className="block mt-2 text-asu-gold">
              Leading Semiconductor Employers
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/candidate"
              className="bg-asu-maroon hover:bg-asu-maroon/90 text-white px-6 sm:px-8 py-3 sm:py-2.5 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group touch-manipulation"
            >
              For Candidates
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/employer"
              className="bg-asu-maroon hover:bg-asu-maroon/90 text-white px-6 sm:px-8 py-3 sm:py-2.5 rounded-full text-base sm:text-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 group touch-manipulation"
            >
              For Employers
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Description text centered between banner and WHO CAN ACCESS */}
      <div className="py-12 md:py-20 bg-gradient-to-b from-asu-darker to-transparent w-full">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white text-center max-w-[100%] leading-relaxed">
            TalentVault is a specialized platform connecting top microelectronics talent with leading semiconductor companies. We bridge the gap between job-seeking candidates and hiring employers, facilitating meaningful career connections.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 md:pb-12">
        {/* What is TalentVault */}
        <div className="mb-12 md:mb-20">
          <div className="section-title">
            <h2 className="text-2xl sm:text-3xl md:text-4xl">WHAT IS TALENTVAULT</h2>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto text-center px-2">
            TalentVault is a specialized platform connecting skilled microelectronics professionals with leading semiconductor companies.
          </p>
          <div className="aspect-video w-full max-w-4xl mx-auto mb-6 md:mb-8 rounded-lg md:rounded-xl overflow-hidden">
            <video 
              ref={videoRef}
              controls
              muted
              playsInline
              className="w-full h-full object-cover"
              src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics-videos/TalentVault%20Final%20Video.mp4"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>

        {/* Why Use TalentVault */}
        <div className="mb-12 md:mb-20">
          <div className="section-title">
            <h2 className="text-2xl sm:text-3xl md:text-4xl">WHY USE TALENTVAULT</h2>
          </div>
          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-6 md:mb-8 max-w-3xl mx-auto text-center px-2">
            Whether you're a talented professional or an industry leader, TalentVault provides the tools and connections you need to succeed.
          </p>
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            <div className="space-y-4 md:space-y-8">
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Smart Matching</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Where qualified candidates meet the right opportunities in the semiconductor industry.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Industry Focus</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Built for semiconductors—where experts showcase their skills and companies find specialized talent.</p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-4 sm:p-5 md:p-6 rounded-lg md:rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 sm:mb-2">Efficient Process</h3>
                    <p className="text-gray-400 text-xs sm:text-sm">Job seekers get noticed faster. Employers hire smarter with pre-vetted candidates.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg md:rounded-xl mt-6 md:mt-0">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/241120%20ASU%20Polytechnic%20campus%20-%20SIM%20190%20Lab%20Photos%20-%20%20663A0254.JPG%20-%20%20SM.jpg"
                alt="Advanced semiconductor manufacturing facility"
                className="w-full h-full object-cover rounded-lg md:rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-asu-darker via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Industry Facts */}
        <div className="relative py-8 sm:py-12 md:py-20 px-4 sm:px-6 md:px-8 rounded-xl md:rounded-2xl bg-gradient-to-br from-asu-maroon/20 to-asu-darker border-2 border-asu-maroon/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(140,29,64,0.2),transparent_70%)]" />
          <div className="relative">
            <div className="section-title mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl">INDUSTRY FACTS</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
              {/* Market Growth */}
              <div className="bg-asu-dark/50 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-lg md:rounded-xl border border-asu-maroon/30 hover:border-asu-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <ChartBar className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-asu-gold group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Market Growth</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg">The global semiconductor market is projected to reach $1 trillion by 2030, with a CAGR of 7%.</p>
              </div>

              {/* Job Demand */}
              <div className="bg-asu-dark/50 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-lg md:rounded-xl border border-asu-maroon/30 hover:border-asu-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-asu-gold group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Job Demand</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg">Over 67,000 new semiconductor jobs are expected by 2030 in the United States alone.</p>
              </div>

              {/* Innovation */}
              <div className="bg-asu-dark/50 backdrop-blur-sm p-5 sm:p-6 md:p-8 rounded-lg md:rounded-xl border border-asu-maroon/30 hover:border-asu-gold/30 transition-all duration-300 group sm:col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <Zap className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-asu-gold group-hover:scale-110 transition-transform" />
                  <h3 className="text-base sm:text-lg md:text-xl font-semibold text-white">Innovation</h3>
                </div>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg">The semiconductor industry invests over $50 billion annually in research and development.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}