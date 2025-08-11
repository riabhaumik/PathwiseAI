'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calculator, BookOpen, Play, Star, Clock, 
  Target, ExternalLink, Award, TrendingUp,
  ChevronRight, Code, FileText, Users, X
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface MathTopic {
  id: string
  title: string
  description: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
  concepts: string[]
  exercises: number
  completionTime: string
  prerequisites: string[]
  applications: string[]
  resources: MathResource[]
}

interface MathResource {
  id: string
  title: string
  type: 'video' | 'article' | 'interactive' | 'problem_set' | 'course'
  platform: string
  duration: string
  url: string
  rating: number
  description: string
  free: boolean
}

export default function MathPage() {
  const [topics, setTopics] = useState<MathTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedTopic, setSelectedTopic] = useState<MathTopic | null>(null)
  const [showTopicModal, setShowTopicModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    loadMathTopics()
  }, [])

  const loadMathTopics = async () => {
    try {
      // Try to load from backend API first
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/math-resources`)
      if (response.ok) {
        const data = await response.json()
        // Support both backend massive JSON shape and fallback flat list
        const topicsFromBackend: any[] = Array.isArray(data)
          ? data
          : (data.topics || data.mathematics_resources?.categories
              ? Object.entries(data.mathematics_resources.categories).map(([cat, val]: any) => ({
                  id: cat,
                  title: cat,
                  description: val.description || '',
                  difficulty: 'Intermediate',
                  category: cat,
                  concepts: (val.topics || []) as string[],
                  exercises: (val.practice_problems || []).length * 20,
                  completionTime: 'Self-paced',
                  prerequisites: [],
                  applications: (val.applications || []) as string[],
                  resources: (val.courses || []).map((c: any, idx: number) => ({
                    id: `${cat}-${idx}`,
                    title: c.title,
                    type: 'course',
                    platform: c.platform,
                    duration: c.duration || 'Variable',
                    url: c.url,
                    rating: 5,
                    description: (c.topics && c.topics.join(', ')) || '',
                    free: c.certificate === false
                  })) as any[]
                }))
              : [])
        setTopics(topicsFromBackend)
      } else {
        // Fallback to local data
        const response = await fetch('/math_resources.json')
        if (response.ok) {
          const data = await response.json()
          setTopics(data)
        } else {
          // Fallback to hardcoded data
          setTopics(generateMockMathTopics())
        }
      }
    } catch (error) {
      console.error('Error loading math topics:', error)
      setTopics(generateMockMathTopics())
    } finally {
      setLoading(false)
    }
  }

  const generateMockMathTopics = (): MathTopic[] => [
    {
      id: '1',
      title: 'Calculus I - Limits and Derivatives',
      description: 'Master the fundamentals of calculus including limits, continuity, and derivatives with real-world applications',
      difficulty: 'Intermediate',
      category: 'Calculus',
      concepts: ['Limits', 'Continuity', 'Derivatives', 'Chain Rule', 'Optimization'],
      exercises: 200,
      completionTime: '8-10 weeks',
      prerequisites: ['Algebra', 'Trigonometry', 'Pre-calculus'],
      applications: ['Physics', 'Engineering', 'Economics', 'Data Science'],
      resources: [
        {
          id: '1a',
          title: 'Khan Academy Calculus',
          type: 'course',
          platform: 'Khan Academy',
          duration: '40 hours',
          url: 'https://khanacademy.org/math/calculus-1',
          rating: 4.8,
          description: 'Comprehensive calculus course with interactive exercises',
          free: true
        },
        {
          id: '1b',
          title: 'MIT 18.01 Single Variable Calculus',
          type: 'course',
          platform: 'MIT OCW',
          duration: '60 hours',
          url: 'https://ocw.mit.edu/courses/mathematics/18-01-single-variable-calculus-fall-2006/',
          rating: 4.9,
          description: 'University-level calculus course from MIT',
          free: true
        }
      ]
    },
    {
      id: '2',
      title: 'Linear Algebra',
      description: 'Essential linear algebra concepts for machine learning, computer graphics, and data science',
      difficulty: 'Intermediate',
      category: 'Linear Algebra',
      concepts: ['Vectors', 'Matrices', 'Eigenvalues', 'Linear Transformations', 'Vector Spaces'],
      exercises: 150,
      completionTime: '6-8 weeks',
      prerequisites: ['Algebra', 'Basic Calculus'],
      applications: ['Machine Learning', 'Computer Graphics', 'Quantum Computing', 'Data Analysis'],
      resources: [
        {
          id: '2a',
          title: '3Blue1Brown Linear Algebra',
          type: 'video',
          platform: 'YouTube',
          duration: '12 hours',
          url: 'https://youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
          rating: 4.9,
          description: 'Visual and intuitive approach to linear algebra',
          free: true
        },
        {
          id: '2b',
          title: 'MIT 18.06 Linear Algebra',
          type: 'course',
          platform: 'MIT OCW',
          duration: '50 hours',
          url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/',
          rating: 4.8,
          description: 'Classic linear algebra course by Gilbert Strang',
          free: true
        }
      ]
    },
    {
      id: '3',
      title: 'Statistics and Probability',
      description: 'Statistical concepts and probability theory essential for data science and research',
      difficulty: 'Intermediate',
      category: 'Statistics',
      concepts: ['Probability Distributions', 'Hypothesis Testing', 'Regression', 'Bayesian Statistics'],
      exercises: 180,
      completionTime: '10-12 weeks',
      prerequisites: ['Algebra', 'Basic Calculus'],
      applications: ['Data Science', 'Research', 'Quality Control', 'Finance'],
      resources: [
        {
          id: '3a',
          title: 'StatQuest Statistics',
          type: 'video',
          platform: 'YouTube',
          duration: '20 hours',
          url: 'https://youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9',
          rating: 4.8,
          description: 'Clear explanations of statistical concepts',
          free: true
        },
        {
          id: '3b',
          title: 'Introduction to Probability',
          type: 'course',
          platform: 'edX',
          duration: '16 weeks',
          url: 'https://edx.org/course/introduction-to-probability',
          rating: 4.7,
          description: 'Comprehensive probability course from MIT',
          free: true
        }
      ]
    },
    {
      id: '4',
      title: 'Discrete Mathematics',
      description: 'Mathematical structures and logic essential for computer science and programming',
      difficulty: 'Intermediate',
      category: 'Discrete Math',
      concepts: ['Logic', 'Set Theory', 'Graph Theory', 'Combinatorics', 'Number Theory'],
      exercises: 120,
      completionTime: '8-10 weeks',
      prerequisites: ['Algebra', 'Basic Programming'],
      applications: ['Computer Science', 'Cryptography', 'Algorithm Design', 'Network Analysis'],
      resources: [
        {
          id: '4a',
          title: 'MIT 6.042J Mathematics for Computer Science',
          type: 'course',
          platform: 'MIT OCW',
          duration: '45 hours',
          url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/6-042j-mathematics-for-computer-science-spring-2015/',
          rating: 4.8,
          description: 'Discrete math concepts for CS students',
          free: true
        }
      ]
    },
    {
      id: '5',
      title: 'Calculus II - Integration and Series',
      description: 'Advanced calculus topics including integration techniques, sequences, and series',
      difficulty: 'Advanced',
      category: 'Calculus',
      concepts: ['Integration Techniques', 'Sequences', 'Series', 'Parametric Equations', 'Polar Coordinates'],
      exercises: 180,
      completionTime: '8-10 weeks',
      prerequisites: ['Calculus I', 'Trigonometry'],
      applications: ['Physics', 'Engineering', 'Mathematical Modeling'],
      resources: [
        {
          id: '5a',
          title: 'Khan Academy Calculus II',
          type: 'course',
          platform: 'Khan Academy',
          duration: '35 hours',
          url: 'https://khanacademy.org/math/calculus-2',
          rating: 4.7,
          description: 'Complete coverage of Calculus II topics',
          free: true
        }
      ]
    },
    {
      id: '6',
      title: 'Multivariable Calculus',
      description: 'Calculus in multiple dimensions including partial derivatives and multiple integrals',
      difficulty: 'Advanced',
      category: 'Calculus',
      concepts: ['Partial Derivatives', 'Multiple Integrals', 'Vector Fields', 'Line Integrals', 'Green\'s Theorem'],
      exercises: 160,
      completionTime: '10-12 weeks',
      prerequisites: ['Calculus II', 'Linear Algebra'],
      applications: ['Physics', 'Engineering', '3D Graphics', 'Optimization'],
      resources: [
        {
          id: '6a',
          title: 'MIT 18.02 Multivariable Calculus',
          type: 'course',
          platform: 'MIT OCW',
          duration: '50 hours',
          url: 'https://ocw.mit.edu/courses/mathematics/18-02-multivariable-calculus-fall-2007/',
          rating: 4.8,
          description: 'Comprehensive multivariable calculus course',
          free: true
        }
      ]
    },
    {
      id: '7',
      title: 'Number Theory',
      description: 'Study of integers and their properties, essential for cryptography and pure mathematics',
      difficulty: 'Advanced',
      category: 'Number Theory',
      concepts: ['Prime Numbers', 'Modular Arithmetic', 'Diophantine Equations', 'Cryptographic Applications'],
      exercises: 100,
      completionTime: '6-8 weeks',
      prerequisites: ['Discrete Math', 'Abstract Algebra'],
      applications: ['Cryptography', 'Computer Security', 'Pure Mathematics'],
      resources: [
        {
          id: '7a',
          title: 'Introduction to Number Theory',
          type: 'course',
          platform: 'Coursera',
          duration: '24 hours',
          url: 'https://coursera.org/learn/number-theory',
          rating: 4.6,
          description: 'Fundamentals of number theory and applications',
          free: false
        }
      ]
    },
    {
      id: '8',
      title: 'Optimization Theory',
      description: 'Mathematical optimization techniques for machine learning and operations research',
      difficulty: 'Advanced',
      category: 'Optimization',
      concepts: ['Linear Programming', 'Convex Optimization', 'Gradient Descent', 'Lagrange Multipliers'],
      exercises: 90,
      completionTime: '8-10 weeks',
      prerequisites: ['Calculus', 'Linear Algebra', 'Statistics'],
      applications: ['Machine Learning', 'Operations Research', 'Economics', 'Engineering'],
      resources: [
        {
          id: '8a',
          title: 'Stanford Convex Optimization',
          type: 'course',
          platform: 'Stanford Online',
          duration: '40 hours',
          url: 'https://web.stanford.edu/~boyd/cvxbook/',
          rating: 4.9,
          description: 'Advanced optimization theory and applications',
          free: true
        }
      ]
    }
  ]

  const filteredTopics = topics.filter(topic => {
    const matchesCategory = selectedCategory === 'all' || topic.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || topic.difficulty === selectedDifficulty
    return matchesCategory && matchesDifficulty
  })

  const categories = ['all', ...Array.from(new Set(topics.map(t => t.category)))]
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Calculus': return '∫'
      case 'Linear Algebra': return '⎡⎤'
      case 'Statistics': return '📊'
      case 'Discrete Math': return '🔢'
      case 'Number Theory': return '🔐'
      case 'Optimization': return '⚡'
      default: return '📐'
    }
  }

  const handleTopicClick = (topic: MathTopic) => {
    setSelectedTopic(topic)
    setShowTopicModal(true)
  }

  const handleStartResource = (resource: MathResource) => {
    window.open(resource.url, '_blank')
  }

  const closeTopicModal = () => {
    setShowTopicModal(false)
    setSelectedTopic(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mathematics resources...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Mathematics <span className="gradient-text">Learning Path</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Master essential mathematical concepts for STEM careers with interactive lessons, practice problems, and real-world applications.
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-orange-500" />
                <span>{topics.length} Topics</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <span>Interactive Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                <span>Real Applications</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty === 'all' ? 'All Levels' : difficulty}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedCategory('all')
                  setSelectedDifficulty('all')
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Math Topics */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTopics.map((topic, index) => (
            <div
              key={topic.id}
              className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleTopicClick(topic)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-mono">{getCategoryIcon(topic.category)}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {topic.title}
                    </h3>
                    <p className="text-orange-600 dark:text-orange-400 font-medium text-sm">
                      {topic.category}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(topic.difficulty)}`}>
                  {topic.difficulty}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {topic.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Calculator className="h-4 w-4" />
                    <span>{topic.exercises} Problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>{topic.completionTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <BookOpen className="h-4 w-4" />
                    <span>{topic.resources.length} Resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Target className="h-4 w-4" />
                    <span>{topic.applications.length} Applications</span>
                  </div>
                </div>
              </div>

              {/* Key Concepts Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Key Concepts:</p>
                <div className="flex flex-wrap gap-1">
                  {topic.concepts.slice(0, 3).map((concept, conceptIndex) => (
                    <span
                      key={conceptIndex}
                      className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-md text-xs"
                    >
                      {concept}
                    </span>
                  ))}
                  {topic.concepts.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                      +{topic.concepts.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleTopicClick(topic)
                }}
                className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2"
              >
                <ChevronRight className="h-4 w-4" />
                Start Learning
              </button>
            </div>
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calculator className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No topics found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filter criteria.
            </p>
          </div>
        )}
      </section>

      {/* Topic Details Modal */}
      {showTopicModal && selectedTopic && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-mono">{getCategoryIcon(selectedTopic.category)}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedTopic.title}
                    </h2>
                    <p className="text-orange-600 dark:text-orange-400 font-medium">
                      {selectedTopic.category} • {selectedTopic.difficulty}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeTopicModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedTopic.description}
                </p>
              </div>

              {/* Key Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-200 mb-2">Duration</h4>
                  <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">
                    {selectedTopic.completionTime}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Exercises</h4>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {selectedTopic.exercises}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Resources</h4>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {selectedTopic.resources.length}
                  </p>
                </div>
              </div>

              {/* Concepts */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Key Concepts
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.concepts.map((concept, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded-full text-sm"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Prerequisites */}
              {selectedTopic.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Prerequisites
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTopic.prerequisites.map((prereq, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                      >
                        {prereq}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Real-World Applications
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTopic.applications.map((application, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                    >
                      {application}
                    </span>
                  ))}
                </div>
              </div>

              {/* Learning Resources */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Learning Resources
                </h3>
                <div className="space-y-3">
                  {selectedTopic.resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {resource.title}
                          </h4>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            • {resource.platform}
                          </span>
                          {resource.free && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-xs">
                              Free
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                          {resource.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {resource.duration}
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            {resource.rating}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartResource(resource)}
                        className="ml-4 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Start
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => {
                    closeTopicModal()
                    if (selectedTopic.resources.length > 0) {
                      handleStartResource(selectedTopic.resources[0])
                    }
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Start Learning Path
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
