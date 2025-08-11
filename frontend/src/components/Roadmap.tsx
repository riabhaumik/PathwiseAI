'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen, Target, TrendingUp, Clock, CheckCircle, 
  Play, ExternalLink, Star, Calendar, Award,
  ChevronDown, ChevronRight, MapPin, Users, Zap
} from 'lucide-react'

interface Resource {
  title: string
  description: string
  url: string
  platform: string
  duration: string
  rating: string
  instructor?: string
  image_url?: string
}

interface Phase {
  name: string
  duration: string
  description: string
  topics: string[]
  difficulty: string
  resources: Resource[]
  completed_topics?: string[]
  completion_percentage?: number
}

interface Milestone {
  name: string
  description: string
  target_date: string
  criteria: string[]
}

interface Roadmap {
  career: string
  overview: string
  estimated_duration: string
  skill_domains: {
    math: string[]
    programming: string[]
    soft_skills: string[]
  }
  phases: Phase[]
  milestones: Milestone[]
}

interface RoadmapProps {
  careerName: string
  userLevel?: string
  onPhaseComplete?: (phaseName: string, topic: string) => void
  onResourceClick?: (resource: Resource) => void
}

export default function Roadmap({ 
  careerName, 
  userLevel = "beginner",
  onPhaseComplete,
  onResourceClick 
}: RoadmapProps) {
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set())
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null)

  useEffect(() => {
    fetchRoadmap()
  }, [careerName, userLevel])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      setError(null)
      
              const response = await fetch(`http://localhost:8000/api/roadmap/preview/${encodeURIComponent(careerName)}?user_level=${userLevel}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch roadmap: ${response.status}`)
      }
      
      const data = await response.json()
      setRoadmap(data)
      
      // Expand first phase by default
      if (data.phases && data.phases.length > 0) {
        setExpandedPhases(new Set([data.phases[0].name]))
        setSelectedPhase(data.phases[0].name)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch roadmap')
    } finally {
      setLoading(false)
    }
  }

  const togglePhase = (phaseName: string) => {
    const newExpanded = new Set(expandedPhases)
    if (newExpanded.has(phaseName)) {
      newExpanded.delete(phaseName)
    } else {
      newExpanded.add(phaseName)
    }
    setExpandedPhases(newExpanded)
    setSelectedPhase(phaseName)
  }

  const handleTopicComplete = (phaseName: string, topic: string) => {
    if (onPhaseComplete) {
      onPhaseComplete(phaseName, topic)
    }
  }

  const handleResourceClick = (resource: Resource) => {
    if (onResourceClick) {
      onResourceClick(resource)
    } else {
      window.open(resource.url, '_blank')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPlatformIcon = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (platformLower.includes('youtube')) return '🎥'
    if (platformLower.includes('coursera')) return '📚'
    if (platformLower.includes('khan')) return '🎓'
    if (platformLower.includes('edx')) return '🏛️'
    if (platformLower.includes('udemy')) return '💻'
    return '📖'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your personalized roadmap...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-4">
          <Target className="h-12 w-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Roadmap</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchRoadmap}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No roadmap available for this career.</p>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Learning Roadmap: {roadmap.career}
        </h1>
        <p className="text-lg text-gray-600 mb-4">{roadmap.overview}</p>
        <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{roadmap.estimated_duration}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Level: {userLevel}</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{roadmap.phases.length} phases</span>
          </div>
        </div>
      </div>

      {/* Skill Domains */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Mathematics
          </h3>
          <ul className="space-y-2">
            {roadmap.skill_domains.math.map((skill, index) => (
              <li key={index} className="flex items-center gap-2 text-blue-800">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Programming
          </h3>
          <ul className="space-y-2">
            {roadmap.skill_domains.programming.map((skill, index) => (
              <li key={index} className="flex items-center gap-2 text-green-800">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                {skill}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Soft Skills
          </h3>
          <ul className="space-y-2">
            {roadmap.skill_domains.soft_skills.map((skill, index) => (
              <li key={index} className="flex items-center gap-2 text-purple-800">
                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                {skill}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Learning Phases */}
      <div className="space-y-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Learning Phases</h2>
        
        {roadmap.phases.map((phase, phaseIndex) => (
          <div key={phase.name} className="border border-gray-200 rounded-lg overflow-hidden">
            <div 
              className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={() => togglePhase(phase.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {phaseIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{phase.name}</h3>
                      <p className="text-sm text-gray-600">{phase.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(phase.difficulty)}`}>
                    {phase.difficulty}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {phase.duration}
                  </div>
                  {expandedPhases.has(phase.name) ? (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-gray-500" />
                  )}
                </div>
              </div>
            </div>

            {expandedPhases.has(phase.name) && (
              <div className="p-6 bg-white">
                {/* Topics */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 mb-3">Topics to Cover</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.topics.map((topic, topicIndex) => {
                      const isCompleted = phase.completed_topics?.includes(topic) || false
                      return (
                        <div 
                          key={topicIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <button
                            onClick={() => handleTopicComplete(phase.name, topic)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              isCompleted 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                          >
                            {isCompleted && <CheckCircle className="h-3 w-3" />}
                          </button>
                          <span className={`text-sm ${isCompleted ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                            {topic}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Resources */}
                {phase.resources && phase.resources.length > 0 && (
                  <div>
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Recommended Resources</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {phase.resources.map((resource, resourceIndex) => (
                        <div 
                          key={resourceIndex}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => handleResourceClick(resource)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="text-2xl">{getPlatformIcon(resource.platform)}</div>
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                {resource.title}
                              </h5>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {resource.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {resource.duration}
                                </span>
                                {resource.rating !== 'N/A' && (
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 text-yellow-500" />
                                    {resource.rating}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 text-xs text-blue-600 font-medium">
                                {resource.platform}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Milestones */}
      {roadmap.milestones && roadmap.milestones.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Milestones & Goals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmap.milestones.map((milestone, index) => (
              <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">{milestone.name}</h3>
                    <p className="text-gray-700 mb-3">{milestone.description}</p>
                    <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>{milestone.target_date}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Success Criteria:</h4>
                      <ul className="space-y-1">
                        {milestone.criteria.map((criterion, criterionIndex) => (
                          <li key={criterionIndex} className="flex items-center gap-2 text-sm text-blue-700">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            {criterion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Summary */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {roadmap.phases.length}
            </div>
            <div className="text-sm text-gray-600">Total Phases</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {roadmap.phases.reduce((total, phase) => total + (phase.completed_topics?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Topics Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {roadmap.phases.reduce((total, phase) => total + (phase.resources?.length || 0), 0)}
            </div>
            <div className="text-sm text-gray-600">Resources Available</div>
          </div>
        </div>
      </div>
    </div>
  )
} 