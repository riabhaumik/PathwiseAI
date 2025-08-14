'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Map, Target, BookOpen, Clock, Star, 
  ChevronLeft, ExternalLink, CheckCircle, 
  Play, Users, Award, TrendingUp
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface RoadmapPhase {
  name: string
  duration: string
  description: string
  topics: string[]
  difficulty: string
  resources?: any[]
}

interface RoadmapMilestone {
  name: string
  description: string
  target_date: string
  criteria: string[]
}

interface CareerRoadmap {
  career: string
  overview: string
  estimated_duration: string
  skill_domains: {
    math: string[]
    programming: string[]
    soft_skills: string[]
  }
  phases: RoadmapPhase[]
  milestones: RoadmapMilestone[]
  resources?: any[]
}

export default function RoadmapDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [roadmap, setRoadmap] = useState<CareerRoadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPhase, setSelectedPhase] = useState<number>(0)

  useEffect(() => {
    const fetchRoadmap = async () => {
      try {
        setLoading(true)
        const careerName = decodeURIComponent(params.career as string).replace(/-/g, ' ')
        
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${baseUrl}/api/roadmap?career_name=${encodeURIComponent(careerName)}&user_level=beginner`)
        
        if (response.ok) {
          const data = await response.json()
          setRoadmap(data)
        } else {
          setError('Failed to load roadmap')
        }
      } catch (err) {
        setError('Error loading roadmap')
        console.error('Error fetching roadmap:', err)
      } finally {
        setLoading(false)
      }
    }

    if (params.career) {
      fetchRoadmap()
    }
  }, [params.career])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading roadmap...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Map className="h-16 w-16 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              {error || 'Roadmap not found'}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Unable to load the roadmap for this career.
            </p>
            <button
              onClick={() => router.push('/roadmap')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Roadmaps
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Header */}
      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.push('/roadmap')}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Roadmaps
            </button>
          </div>
          
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              {roadmap.career} <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Roadmap</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              {roadmap.overview}
            </p>
            
            <div className="flex justify-center items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span>{roadmap.estimated_duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <span>{roadmap.phases.length} Phases</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span>{roadmap.milestones.length} Milestones</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Content */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Phases Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 sticky top-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
                Learning Phases
              </h3>
              <div className="space-y-3">
                {roadmap.phases.map((phase, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhase(index)}
                    className={`w-full text-left p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      selectedPhase === index
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">Phase {index + 1}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-slate-200 dark:bg-slate-600">
                        {phase.difficulty}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {phase.name}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {phase.duration}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Phase Content */}
          <div className="lg:col-span-2">
            {roadmap.phases[selectedPhase] && (
              <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {selectedPhase + 1}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {roadmap.phases[selectedPhase].name}
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400">
                        {roadmap.phases[selectedPhase].duration} • {roadmap.phases[selectedPhase].difficulty}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                    {roadmap.phases[selectedPhase].description}
                  </p>
                </div>

                {/* Topics */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Learning Topics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roadmap.phases[selectedPhase].topics.map((topic, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600"
                      >
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resources */}
                {roadmap.phases[selectedPhase].resources && roadmap.phases[selectedPhase].resources!.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
                      Learning Resources
                    </h3>
                    <div className="space-y-3">
                      {roadmap.phases[selectedPhase].resources!.map((resource, index) => (
                        <a
                          key={index}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
                        >
                          <ExternalLink className="h-5 w-5 text-blue-600 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="font-medium text-blue-800 dark:text-blue-200">
                              {resource.title}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                              {resource.platform} • {resource.duration}
                            </div>
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {resource.rating}★
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Milestones */}
        <div className="mt-12">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Learning Milestones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {roadmap.milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-700 dark:to-slate-800 rounded-xl border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {milestone.target_date}
                    </span>
                  </div>
                  
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                    {milestone.name}
                  </h4>
                  
                  <p className="text-slate-600 dark:text-slate-400 mb-4 text-sm">
                    {milestone.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Success Criteria:
                    </div>
                    <ul className="space-y-1">
                      {milestone.criteria.map((criterion, cIndex) => (
                        <li key={cIndex} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                          {criterion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skill Domains */}
        <div className="mt-12">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Skill Domains
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(roadmap.skill_domains).map(([domain, skills]) => (
                <div key={domain} className="p-6 bg-slate-50 dark:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-600">
                  <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3 capitalize">
                    {domain.replace('_', ' ')}
                  </h4>
                  <div className="space-y-2">
                    {skills.map((skill, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"
                      >
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
