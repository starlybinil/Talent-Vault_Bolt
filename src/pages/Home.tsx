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
      <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Image Grid */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-2">
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
        <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-8">
            Connecting Top Talent with
            <span className="block mt-2 text-asu-gold">
              Leading Semiconductor Employers
            </span>
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/candidate"
              className="bg-asu-maroon hover:bg-asu-maroon/90 text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              For Candidates
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/employer"
              className="bg-asu-maroon hover:bg-asu-maroon/90 text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              For Employers
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Description text centered between banner and WHO CAN ACCESS */}
      <div className="py-20 bg-gradient-to-b from-asu-darker to-transparent w-full">
        <div className="container mx-auto px-4">
          <p className="text-xl md:text-2xl text-white text-center max-w-[100%]">
            TalentVault is a specialized platform connecting top microelectronics talent with leading semiconductor companies. We bridge the gap between job-seeking candidates and hiring employers, facilitating meaningful career connections.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* What is TalentVault */}
        <div className="mb-20">
          <div className="section-title">
            <h2>WHAT IS TALENTVAULT</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            TalentVault is a specialized platform connecting skilled microelectronics professionals with leading semiconductor companies.
          </p>
          <div className="aspect-video w-full max-w-4xl mx-auto mb-8 rounded-xl overflow-hidden">
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
        <div className="mb-20">
          <div className="section-title">
            <h2>WHY USE TALENTVAULT</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Whether you're a talented professional or an industry leader, TalentVault provides the tools and connections you need to succeed.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Search className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Smart Matching</h3>
                    <p className="text-gray-400 text-sm">Where qualified candidates meet the right opportunities in the semiconductor industry.</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <LineChart className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Industry Focus</h3>
                    <p className="text-gray-400 text-sm">Built for semiconductors—where experts showcase their skills and companies find specialized talent.</p>
                  </div>
                </div>
              </div>
              
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Clock className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">Efficient Process</h3>
                    <p className="text-gray-400 text-sm">Job seekers get noticed faster. Employers hire smarter with pre-vetted candidates.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/241120%20ASU%20Polytechnic%20campus%20-%20SIM%20190%20Lab%20Photos%20-%20%20663A0254.JPG%20-%20%20SM.jpg"
                alt="Advanced semiconductor manufacturing facility"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-asu-darker via-transparent to-transparent" />
            </div>
          </div>
        </div>

        {/* Industry Facts */}
        <div className="relative py-20 px-8 rounded-2xl bg-gradient-to-br from-asu-maroon/20 to-asu-darker border-2 border-asu-maroon/30">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(140,29,64,0.2),transparent_70%)]" />
          <div className="relative">
            <div className="section-title mb-12">
              <h2>INDUSTRY FACTS</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Market Growth */}
              <div className="bg-asu-dark/50 backdrop-blur-sm p-8 rounded-xl border border-asu-maroon/30 hover:border-asu-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <ChartBar className="w-8 h-8 text-asu-gold group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-white">Market Growth</h3>
                </div>
                <p className="text-gray-300 text-lg">The global semiconductor market is projected to reach $1 trillion by 2030, with a CAGR of 7%.</p>
              </div>

              {/* Job Demand */}
              <div className="bg-asu-dark/50 backdrop-blur-sm p-8 rounded-xl border border-asu-maroon/30 hover:border-asu-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-asu-gold group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-white">Job Demand</h3>
                </div>
                <p className="text-gray-300 text-lg">Over 67,000 new semiconductor jobs are expected by 2030 in the United States alone.</p>
              </div>

              {/* Innovation */}
              <div className="bg-asu-dark/50 backdrop-blur-sm p-8 rounded-xl border border-asu-maroon/30 hover:border-asu-gold/30 transition-all duration-300 group">
                <div className="flex items-center gap-3 mb-6">
                  <Zap className="w-8 h-8 text-asu-gold group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-semibold text-white">Innovation</h3>
                </div>
                <p className="text-gray-300 text-lg">The semiconductor industry invests over $50 billion annually in research and development.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}