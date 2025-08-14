'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Filter, TrendingUp, DollarSign, GraduationCap, 
  MapPin, Users, Award, ArrowRight, BookOpen, Target, 
  Heart, Share2, X, ChevronRight, ExternalLink
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface Career {
  id?: number
  name: string
  description: string
  skills: string[]
  degree_required: string
  growth_rate: string
  avg_salary: string
  category?: string
  subjects?: any
  detailed_description?: string
  work_environment?: string
  top_companies?: string[]
  certifications?: string[]
  related_careers?: string[]
}

export default function CareersPage() {
  const [careers, setCareers] = useState<Career[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null)
  const [showCareerModal, setShowCareerModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadCareers()
  }, [])

  const loadCareers = async () => {
    try {
      // Try to load from backend API first
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/careers`)
      if (response.ok) {
        const data = await response.json()
        if (data.careers) {
          const careersArray = Object.entries(data.careers).map(([name, careerData]: [string, any]) => ({
            id: careerData.id || Math.random(),
            name: name,
            description: careerData.description || '',
            skills: careerData.skills || [],
            degree_required: careerData.degree_required || '',
            growth_rate: careerData.growth_rate || '',
            avg_salary: careerData.avg_salary || '',
            category: careerData.category || 'STEM',
            subjects: careerData.subjects || {},
            detailed_description: careerData.detailed_description || '',
            work_environment: careerData.work_environment || '',
            top_companies: careerData.top_companies || [],
            certifications: careerData.certifications || [],
            related_careers: careerData.related_careers || []
          }))
          setCareers(careersArray)
        }
      } else {
        // Fallback to local STEM careers data
        const response = await fetch('/careers_stem.json')
        if (response.ok) {
          const data = await response.json()
          const careersArray = Object.entries(data).map(([name, careerData]: [string, any]) => ({
            id: Math.random(),
            name: name,
            description: careerData.description || '',
            skills: careerData.skills || [],
            degree_required: careerData.degree_required || '',
            growth_rate: careerData.growth_rate || '',
            avg_salary: careerData.avg_salary || '',
            category: careerData.category || 'STEM',
            subjects: careerData.subjects || {},
            detailed_description: careerData.detailed_description || '',
            work_environment: careerData.work_environment || '',
            top_companies: careerData.top_companies || [],
            certifications: careerData.certifications || [],
            related_careers: careerData.related_careers || []
          }))
          setCareers(careersArray)
        }
      }
    } catch (error) {
      console.error('Error loading careers:', error)
      // Fallback to STEM careers data
      setCareers([
        {
          id: 1,
          name: "Software Engineer",
          description: "Develops software applications and systems using programming languages and development tools",
          skills: ["Programming", "Problem Solving", "System Design", "Testing", "Version Control"],
          degree_required: "Bachelor's in Computer Science or related field",
          growth_rate: "25% (Much faster than average)",
          avg_salary: "$120,730",
          category: "Computer Science"
        },
        {
          id: 2,
          name: "Data Scientist",
          description: "Analyzes complex data to help organizations make informed decisions using statistical methods and machine learning",
          skills: ["Statistics", "Machine Learning", "Python", "Data Visualization", "SQL"],
          degree_required: "Bachelor's in Data Science, Statistics, or related field",
          growth_rate: "36% (Much faster than average)",
          avg_salary: "$100,560",
          category: "Computer Science"
        },
        {
          id: 3,
          name: "AI Engineer",
          description: "Develops artificial intelligence systems and machine learning models for various applications",
          skills: ["Machine Learning", "Deep Learning", "Python", "Neural Networks", "TensorFlow"],
          degree_required: "Bachelor's in Computer Science, AI, or related field",
          growth_rate: "40% (Much faster than average)",
          avg_salary: "$130,000",
          category: "Computer Science"
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || career.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', ...Array.from(new Set(careers.map(c => c.category || 'General')))]

  const handleCareerClick = (career: Career) => {
    setSelectedCareer(career)
    setShowCareerModal(true)
  }

  const closeCareerModal = () => {
    setShowCareerModal(false)
    setSelectedCareer(null)
  }

  const handleStartLearning = (career: Career) => {
    router.push(`/roadmap`)
  }

  const handleStartPracticing = (career: Career) => {
    router.push(`/practice?career=${encodeURIComponent(career.name)}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading careers...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Explore <span className="gradient-text">STEM Careers</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover {careers.length}+ detailed STEM career paths with comprehensive information about skills, salaries, and growth potential.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search careers (e.g., 'data scientist', 'engineer')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Career Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {filteredCareers.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Career Paths</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              $100K+
            </div>
            <div className="text-gray-600 dark:text-gray-400">Avg Salary</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              30%+
            </div>
            <div className="text-gray-600 dark:text-gray-400">Growth Rate</div>
          </div>
        </div>
      </section>

      {/* Careers Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCareers.map((career, index) => (
            <div
              key={career.id || index}
              className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleCareerClick(career)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
                  {career.name}
                </h3>
                <div className="flex gap-2 flex-shrink-0 ml-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle favorites
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle sharing
                    }}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {career.description}
              </p>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Growth:</span>
                  <span className="ml-1">{career.growth_rate}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2 text-green-500" />
                  <span className="font-medium">Salary:</span>
                  <span className="ml-1">{career.avg_salary}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <GraduationCap className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="font-medium">Skills:</span>
                  <span className="ml-1">{career.skills.length} required</span>
                </div>
              </div>

              {/* Skills Preview */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {career.skills.slice(0, 3).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {career.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                      +{career.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartLearning(career)
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Start Learning
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleStartPracticing(career)
                  }}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Practice
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Target className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No careers found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </section>

      {/* Career Details Modal */}
      {showCareerModal && selectedCareer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedCareer.name}
                </h2>
                <button
                  onClick={closeCareerModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {selectedCareer.category}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedCareer.detailed_description || selectedCareer.description}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Average Salary</h4>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {selectedCareer.avg_salary}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Growth Rate</h4>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {selectedCareer.growth_rate}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Education</h4>
                  <p className="text-lg font-medium text-purple-900 dark:text-purple-100">
                    {selectedCareer.degree_required}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {selectedCareer.skills && selectedCareer.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Key Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Work Environment */}
              {selectedCareer.work_environment && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Work Environment
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedCareer.work_environment}
                  </p>
                </div>
              )}

              {/* Top Companies */}
              {selectedCareer.top_companies && selectedCareer.top_companies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Top Companies
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.top_companies.map((company, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm border border-blue-200 dark:border-blue-800"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {selectedCareer.certifications && selectedCareer.certifications.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Recommended Certifications
                  </h3>
                  <div className="space-y-2">
                    {selectedCareer.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {cert}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Subjects */}
              {selectedCareer.subjects && Object.keys(selectedCareer.subjects).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Learning Subjects
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedCareer.subjects).map(([subjectName, subjectData]: [string, any]) => (
                      <div key={subjectName} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">{subjectName}</h4>
                        {Array.isArray(subjectData) && subjectData.map((topic: any, index: number) => (
                          <div key={index} className="mb-3 p-3 bg-white dark:bg-gray-800 rounded border">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900 dark:text-white">{topic.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs ${
                                topic.difficulty <= 3 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                topic.difficulty <= 5 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}>
                                {topic.difficulty <= 3 ? 'Beginner' : topic.difficulty <= 5 ? 'Intermediate' : 'Advanced'}
                              </span>
                            </div>
                            {topic.resources && (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600 dark:text-gray-400">Resources:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(topic.resources).map(([platform, url]: [string, unknown]) => (
                                    <a
                                      key={platform}
                                      href={typeof url === 'string' ? url : '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                                    >
                                      {platform}
                                      <ExternalLink className="h-3 w-3 ml-1" />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Careers */}
              {selectedCareer.related_careers && selectedCareer.related_careers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Related Careers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.related_careers.map((relatedCareer, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                        onClick={() => {
                          // Find and show related career
                          const related = careers.find(c => c.name === relatedCareer)
                          if (related) {
                            setSelectedCareer(related)
                          }
                        }}
                      >
                        {relatedCareer}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => {
                    closeCareerModal()
                    router.push(`/roadmap`)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Start Learning Path
                </button>
                <button 
                  onClick={() => {
                    closeCareerModal()
                    handleStartPracticing(selectedCareer)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="h-5 w-5" />
                  Practice Interviews
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
