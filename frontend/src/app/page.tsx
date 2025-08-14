'use client'

import { useAuth } from '../lib/auth-context'
import { useRouter } from 'next/navigation'
import { Brain, Target, BookOpen, ArrowRight, Star, ChevronRight, Calculator, Briefcase, Award, Globe, ExternalLink, Map } from 'lucide-react'
import Navigation from '@/components/Navigation'

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()

  const handleGetStarted = () => {
    router.push('/careers')
  }

  const features = [
    {
      icon: Target,
      title: "STEM Career Explorer",
      description: "Explore 30+ detailed STEM career paths in Computer Science, Engineering, Mathematics, Physics, and Chemistry with salary data and growth projections",
      color: "text-blue-600 dark:text-blue-400",
      href: "/careers"
    },
    {
      icon: Map,
      title: "Career Roadmaps",
      description: "Follow structured learning paths with detailed phases, skills, and resources for each STEM career",
      color: "text-purple-600 dark:text-purple-400",
      href: "/roadmap"
    },
    {
      icon: BookOpen,
      title: "Learning Resources",
      description: "Access curated courses, tutorials, and materials from top educational platforms and institutions",
      color: "text-green-600 dark:text-green-400",
      href: "/resources"
    },
    {
      icon: Briefcase,
      title: "Job Opportunities",
      description: "Browse real job openings from leading tech companies with direct application links",
      color: "text-purple-600 dark:text-purple-400",
      href: "/jobs"
    },
    {
      icon: Calculator,
      title: "Mathematics Foundation",
      description: "Master essential math concepts for STEM careers with structured learning paths and practice",
      color: "text-orange-600 dark:text-orange-400",
      href: "/math"
    },
    {
      icon: Award,
      title: "Interview Practice",
      description: "Prepare for technical interviews with coding challenges and system design problems",
      color: "text-indigo-600 dark:text-indigo-400",
      href: "/practice"
    }
  ]

  const stats = [
    { number: "30+", label: "STEM Careers", icon: Briefcase },
    { number: "100+", label: "Learning Resources", icon: BookOpen },
    { number: "5", label: "Career Categories", icon: Globe },
    { number: "10+", label: "Top Companies", icon: ExternalLink }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 font-inter">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-60"></div>
        <div className="absolute top-40 right-20 w-1 h-1 bg-purple-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-3 h-3 bg-green-400 rounded-full animate-float opacity-50" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-60 left-1/2 w-1 h-1 bg-pink-400 rounded-full animate-float opacity-30" style={{ animationDelay: '3s' }}></div>
        <div className="absolute bottom-60 right-1/3 w-2 h-2 bg-yellow-400 rounded-full animate-float opacity-40" style={{ animationDelay: '1.5s' }}></div>
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-black text-gray-900 dark:text-white mb-6 tracking-tight">
            <span className="block mb-4 font-extrabold" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
              PATHWISE AI
            </span>
            <span className="block text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Your Personalized STEM Career Navigator
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover 30+ STEM careers in Computer Science, Engineering, Mathematics, Physics, and Chemistry with AI-powered guidance to build your dream career path.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <button
              onClick={handleGetStarted}
              className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore Careers
              <ArrowRight className="inline-block ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
              <Star className="h-5 w-5 text-yellow-400 fill-current" />
              <span className="font-medium">Comprehensive STEM guidance</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center mb-3">
                    <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything You Need for STEM Success
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Comprehensive tools and resources to explore, learn, and advance your STEM career journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-up cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => router.push(feature.href)}
            >
              <div className={`inline-flex p-3 rounded-lg bg-gray-100 dark:bg-gray-700 mb-6 ${feature.color}`}>
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {feature.description}
              </p>
              <div className="flex items-center text-blue-600 dark:text-blue-400 font-medium">
                <span>Explore</span>
                <ChevronRight className="h-4 w-4 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-center animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of students discovering their perfect STEM career path in Computer Science, Engineering, Mathematics, Physics, and Chemistry with Pathwise AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/careers')}
              className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Explore Careers
              <ArrowRight className="inline-block ml-2 h-5 w-5" />
            </button>
            <button
              onClick={() => router.push('/resources')}
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 hover:bg-white hover:text-blue-600 transform hover:-translate-y-1"
            >
              Start Learning
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Brain className="h-8 w-8 text-blue-400 mr-3" />
              <h3 className="text-3xl font-black tracking-tight" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                PATHWISE AI
              </h3>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering the next generation of STEM professionals with AI-powered career guidance.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 