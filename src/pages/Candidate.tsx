import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import AnimatedHeroBanner from '../components/AnimatedHeroBanner';
import {
  CircuitBoard,
  Cpu,
  GraduationCap,
  Users,
  Microscope,
  Briefcase,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Star,
  Medal,
  BookOpen,
  FlaskConical,
  Wrench,
  Building2,
  Code,
  Factory,
  FileText,
  Bell,
  RefreshCw,
  Search,
  Settings,
} from 'lucide-react';

export default function Candidate() {
  const messages = [
    {
      title: 'Join the Microelectronics',
      subtitle: 'Revolution',
    },
    {
      title: 'Launch Your Career in',
      subtitle: 'Semiconductor Manufacturing',
    },
    {
      title: 'Connect with Industry',
      subtitle: 'Leaders',
    },
  ];

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
        backgroundImage="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/People/241120%20ASU%20Polytechnic%20campus%20-%20SIM%20190%20Lab%20Photos%20-%20%20663A0221.JPG%20-%20%20SM.jpg"
      />

      {/* Description text centered between banner and WHO CAN APPLY */}
      <div className="py-20 bg-gradient-to-b from-asu-darker to-transparent w-full">
        <div className="container mx-auto px-4">
          <p className="text-xl md:text-2xl text-white text-center max-w-[100%]">
            Launch your career in semiconductor manufacturing and
            microelectronics with industry-leading training and direct
            connections to employers.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-12">
        {/* WHO CAN APPLY section */}
        <div className="mb-20">
          <div className="section-title">
            <h2>WHO CAN APPLY</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            The resume repository is designed for highly qualified students
            seeking opportunities in the microelectronics and semiconductor
            industry. To be eligible, candidates must meet at least one of the
            following criteria:
          </p>

          {/* Applicant categories */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Student */}
            <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-8 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-asu-gold text-center mb-6">
                Current Student
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BookOpen className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">STEM Focus</p>
                    <p className="text-gray-400 text-sm">
                      Pursuing an Associate's degree or above in Science,
                      Technology, Engineering, or Mathematics
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FlaskConical className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">
                      Hands-On Experience
                    </p>
                    <p className="text-gray-400 text-sm">
                      Lab research, internships, microcredentials, or relevant
                      projects
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Medal className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Leadership</p>
                    <p className="text-gray-400 text-sm">
                      Active in student organizations and technical clubs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Graduate */}
            <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-8 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-asu-gold text-center mb-6">
                Recent Graduate
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">
                      Technical Expertise
                    </p>
                    <p className="text-gray-400 text-sm">
                      Microelectronics-Semiconductor Manufacturing and Fab
                      Operation related experience
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Microscope className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">
                      Industry Knowledge
                    </p>
                    <p className="text-gray-400 text-sm">
                      Understanding of semiconductor devices, microsystems and
                      fabrication
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Wrench className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Lab Experience</p>
                    <p className="text-gray-400 text-sm">
                      Clean room and equipment operation proficiency
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional */}
            <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-8 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
              <h3 className="text-xl font-bold text-asu-gold text-center mb-6">
                Career Transitioner
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">
                      Industry Background
                    </p>
                    <p className="text-gray-400 text-sm">
                      Experience in electronics or related field
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Code className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Technical Skills</p>
                    <p className="text-gray-400 text-sm">
                      Circuit design and testing capabilities
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Factory className="w-5 h-5 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-white font-semibold">Manufacturing</p>
                    <p className="text-gray-400 text-sm">
                      Understanding of production processes
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why Join */}
        <div className="mb-20">
          <div className="section-title">
            <h2>WHY JOIN TALENTVAULT</h2>
          </div>
          <p className="text-gray-300 mb-8 max-w-3xl mx-auto text-center">
            Connect with leading semiconductor companies and launch your career
            in microelectronics through our comprehensive platform.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Search className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Visibility
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Top semiconductor companies browse the repository for
                      talent.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Briefcase className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Opportunities
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Get noticed for internships, full-time jobs, and research
                      roles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="group bg-gradient-to-br from-asu-dark to-asu-darker p-6 rounded-xl border-2 border-asu-maroon/30 hover:border-asu-gold/50 transition-all duration-300">
                <div className="flex items-start gap-3">
                  <Settings className="w-6 h-6 text-asu-gold flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Profile Management
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Manage your resume, set visibility preferences, and
                      connect with potential employers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-xl">
              <img
                src="https://afbcrezsfwvwwdzjiuvn.supabase.co/storage/v1/object/public/microelectronics.photos/Facility/210627-ASU-Semiconductors-MacroTechnology-4316.jpg"
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
            Getting started with TalentVault is easy. Follow these five simple
            steps to begin your journey in the semiconductor industry.
          </p>
          <div className="bg-asu-dark p-8 rounded-xl border border-asu-maroon/30">
            <div className="relative">
              {/* Vertical dotted line connecting steps */}
              <div
                className="absolute left-[22px] top-16 bottom-16 border-l-2 border-dotted border-asu-gold"
                style={{
                  borderLeftStyle: 'dotted',
                  borderLeftWidth: '3px',
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
                      <h3 className="text-xl font-semibold text-white">
                        Create an Account
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Sign up and verify your eligibility to join our talent
                      pool.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">2</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">
                        Complete your profile
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Provide a detailed resume highlighting your skills and
                      experience in microelectronics.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">3</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Star className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">
                        Get Discovered
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Leading semiconductor companies actively search our talent
                      pool to find candidates like you.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">4</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Bell className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">
                        Receive Interest Notifications
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Get instant alerts when employers view or download your
                      resume.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 group relative">
                  <div className="w-12 h-12 rounded-full bg-asu-gold flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 relative z-10 border-2 border-asu-gold">
                    <span className="text-asu-dark font-bold">5</span>
                  </div>
                  <div className="bg-asu-maroon/5 p-4 rounded-lg border border-asu-maroon/30 flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <RefreshCw className="w-6 h-6 text-asu-gold" />
                      <h3 className="text-xl font-semibold text-white">
                        Keep Profile Up-to-date
                      </h3>
                    </div>
                    <p className="text-gray-300">
                      Keep your profile current and maintain control over your
                      information.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}