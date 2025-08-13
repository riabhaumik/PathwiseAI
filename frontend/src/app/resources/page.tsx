'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Filter, BookOpen, Star, Clock, Target, 
  ExternalLink, Play, FileText, Code, Monitor,
  Youtube, Globe, Award, TrendingUp, Calculator,
  Users, Calendar, TrendingUp as TrendingUpIcon
} from 'lucide-react'
import Navigation from '@/components/Navigation'
import {
  CourseWidget,
  VideoWidget,
  ArticleWidget,
  BookWidget,
  PracticeWidget,
  CertificationWidget,
  StatsWidget,
  FeaturedResourcesWidget
} from '@/components/ResourceWidgets'

interface LearningResource {
  id: string
  title: string
  type: 'course' | 'video' | 'book' | 'article' | 'project' | 'certification'
  platform: string
  duration: string
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced'
  rating: number
  url: string
  description: string
  topics: string[]
  price?: string
  instructor?: string
  language?: string
  category: string
}

function ResourcesPageInner() {
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const router = useRouter()
  const searchParams = useSearchParams()
  const careerParam = searchParams.get('career')

  useEffect(() => {
    loadResources()
  }, [])

  const loadResources = async () => {
    try {
      // Try to load from backend API first
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const params = new URLSearchParams()
      if (careerParam) params.append('career', decodeURIComponent(careerParam))
      params.append('validate', 'true')
      const response = await fetch(`${baseUrl}/api/resources?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setResources((data.resources || []).map((r: any, idx: number) => ({
          id: r.id || `${idx}`,
          title: r.title,
          type: (r.type || (r.platform && r.platform.toLowerCase().includes('youtube') ? 'video' : 'course')) as any,
          platform: r.platform || 'Resource',
          duration: r.duration || 'Variable',
          difficulty: r.difficulty || 'Beginner',
          rating: parseFloat(r.rating || '4.7'),
          url: r.url,
          description: r.description || '',
          topics: r.topics || [],
          price: r.price,
          instructor: r.instructor,
          language: r.language,
          category: r.category || 'General'
        })))
      } else {
        // Fallback to local data
        const response = await fetch('/resources.json')
        if (response.ok) {
          const data = await response.json()
          setResources(data)
        } else {
          // Fallback to hardcoded data
          setResources(generateMockResources())
        }
      }
    } catch (error) {
      console.error('Error loading resources:', error)
      setResources(generateMockResources())
    } finally {
      setLoading(false)
    }
  }

  const generateMockResources = (): LearningResource[] => [
    {
      id: '1',
      title: 'Essence of Linear Algebra - 3Blue1Brown',
      type: 'video',
      platform: 'YouTube',
      duration: '12 hours',
      difficulty: 'Intermediate',
      rating: 4.9,
      url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
      description: 'Master linear algebra through beautiful visualizations and intuitive explanations. Essential for machine learning, computer graphics, and data science.',
      topics: ['Linear Algebra', 'Vectors', 'Matrices', 'Eigenvalues', 'Linear Transformations'],
      price: 'Free',
      instructor: '3Blue1Brown',
      language: 'English',
      category: 'Mathematics'
    },
    {
      id: '2',
      title: 'Complete Python Bootcamp',
      type: 'course',
      platform: 'Udemy',
      duration: '22 hours',
      difficulty: 'Beginner',
      rating: 4.7,
      url: 'https://udemy.com/course/python-bootcamp',
      description: 'Learn Python programming from scratch with hands-on projects and real-world applications',
      topics: ['Python', 'Programming', 'Web Development', 'Data Analysis'],
      price: '$19.99',
      instructor: 'Jose Portilla',
      language: 'English',
      category: 'Programming'
    },
    {
      id: '3',
      title: 'Machine Learning Specialization',
      type: 'course',
      platform: 'Coursera',
      duration: '3 months',
      difficulty: 'Intermediate',
      rating: 4.8,
      url: 'https://coursera.org/specializations/machine-learning',
      description: 'Comprehensive machine learning course by Andrew Ng covering algorithms and practical applications',
      topics: ['Machine Learning', 'Deep Learning', 'Neural Networks', 'Python'],
      price: '$49/month',
      instructor: 'Andrew Ng',
      language: 'English',
      category: 'Machine Learning'
    },
    {
      id: '4',
      title: 'System Design Interview Preparation',
      type: 'video',
      platform: 'YouTube',
      duration: '4 hours',
      difficulty: 'Advanced',
      rating: 4.9,
      url: 'https://youtube.com/playlist?list=system-design',
      description: 'Complete system design interview preparation covering scalability, databases, and architecture',
      topics: ['System Design', 'Architecture', 'Scalability', 'Databases'],
      price: 'Free',
      instructor: 'Gaurav Sen',
      language: 'English',
      category: 'System Design'
    },
    {
      id: '5',
      title: 'Data Structures and Algorithms in Python',
      type: 'course',
      platform: 'edX',
      duration: '8 weeks',
      difficulty: 'Intermediate',
      rating: 4.6,
      url: 'https://edx.org/course/data-structures-algorithms',
      description: 'Master essential data structures and algorithms with Python implementations',
      topics: ['Data Structures', 'Algorithms', 'Python', 'Problem Solving'],
      price: '$99',
      instructor: 'MIT Faculty',
      language: 'English',
      category: 'Computer Science'
    },
    {
      id: '6',
      title: 'AWS Certified Solutions Architect',
      type: 'certification',
      platform: 'AWS',
      duration: '3 months',
      difficulty: 'Advanced',
      rating: 4.7,
      url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      description: 'Industry-recognized certification for cloud architecture and AWS services',
      topics: ['Cloud Computing', 'AWS', 'Architecture', 'DevOps'],
      price: '$150',
      instructor: 'AWS Training',
      language: 'English',
      category: 'Cloud Computing'
    },
    {
      id: '7',
      title: 'Linear Algebra for Machine Learning',
      type: 'course',
      platform: 'Khan Academy',
      duration: '6 weeks',
      difficulty: 'Intermediate',
      rating: 4.5,
      url: 'https://khanacademy.org/math/linear-algebra',
      description: 'Essential linear algebra concepts for machine learning and data science',
      topics: ['Linear Algebra', 'Mathematics', 'Vectors', 'Matrices'],
      price: 'Free',
      instructor: 'Sal Khan',
      language: 'English',
      category: 'Mathematics'
    },
    {
      id: '8',
      title: 'React Complete Developer Course',
      type: 'course',
      platform: 'Udemy',
      duration: '30 hours',
      difficulty: 'Intermediate',
      rating: 4.6,
      url: 'https://udemy.com/course/react-2nd-edition',
      description: 'Build modern web applications with React, Redux, and modern JavaScript',
      topics: ['React', 'JavaScript', 'Web Development', 'Redux'],
      price: '$24.99',
      instructor: 'Andrew Mead',
      language: 'English',
      category: 'Web Development'
    },
    {
      id: '9',
      title: 'Introduction to Computer Science',
      type: 'course',
      platform: 'MIT OCW',
      duration: '12 weeks',
      difficulty: 'Beginner',
      rating: 4.8,
      url: 'https://ocw.mit.edu/courses/electrical-engineering-and-computer-science/',
      description: 'Comprehensive introduction to computer science fundamentals and programming',
      topics: ['Computer Science', 'Programming', 'Algorithms', 'Problem Solving'],
      price: 'Free',
      instructor: 'MIT Faculty',
      language: 'English',
      category: 'Computer Science'
    }
  ]

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.topics.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory
    const matchesType = selectedType === 'all' || resource.type === selectedType
    const matchesDifficulty = selectedDifficulty === 'all' || resource.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty
  })

  const categories = ['all', ...Array.from(new Set(resources.map(r => r.category)))]
  const types = ['all', 'course', 'video', 'book', 'article', 'project', 'certification']
  const difficulties = ['all', 'Beginner', 'Intermediate', 'Advanced']

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'course': return BookOpen
      case 'video': return Play
      case 'book': return FileText
      case 'article': return FileText
      case 'project': return Code
      case 'certification': return Award
      default: return BookOpen
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'book': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'article': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'project': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'certification': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleStartLearning = (resource: LearningResource) => {
    window.open(resource.url, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading learning resources...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Learning <span className="gradient-text">Resources</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Access {resources.length}+ curated courses, tutorials, and materials from top platforms to accelerate your STEM career.
            </p>
            {careerParam && (
              <div className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-4 py-2 rounded-full text-lg">
                <Target className="h-5 w-5" />
                Learning resources for: {decodeURIComponent(careerParam)}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search resources (e.g., 'machine learning', 'python', 'react')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedType('all')
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

      {/* Resource Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <StatsWidget 
          stats={[
            { label: 'Resources Found', value: filteredResources.length, icon: BookOpen, color: 'bg-green-500' },
            { label: 'Categories', value: categories.length - 1, icon: Target, color: 'bg-blue-500' },
            { label: 'Resource Types', value: types.length - 1, icon: TrendingUpIcon, color: 'bg-purple-500' },
            { label: 'Avg Rating', value: '4.7★', icon: Star, color: 'bg-orange-500' }
          ]} 
        />
      </section>

      {/* Resource Widgets */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Featured Courses */}
          <CourseWidget
            courses={filteredResources.filter(r => r.type === 'course').slice(0, 6)}
            title="Featured Courses"
            subtitle="Top-rated courses from leading platforms"
            maxItems={4}
            showViewAll={true}
            onViewAll={() => {
              setSelectedType('course')
              setSearchTerm('')
            }}
          />

          {/* Featured Videos */}
          <VideoWidget
            videos={filteredResources.filter(r => r.type === 'video').slice(0, 4)}
            title="Featured Videos"
            subtitle="Educational videos and tutorials"
            maxItems={3}
            showViewAll={true}
            onViewAll={() => {
              setSelectedType('video')
              setSearchTerm('')
            }}
          />

          {/* Featured Articles */}
          <ArticleWidget
            articles={filteredResources.filter(r => r.type === 'article').slice(0, 5)}
            title="Featured Articles"
            subtitle="In-depth articles and guides"
            maxItems={4}
            showViewAll={true}
            onViewAll={() => {
              setSelectedType('article')
              setSearchTerm('')
            }}
          />

          {/* Featured Books */}
          <BookWidget
            books={filteredResources.filter(r => r.type === 'book').slice(0, 4)}
            title="Featured Books"
            subtitle="Comprehensive textbooks and references"
            maxItems={3}
            showViewAll={true}
            onViewAll={() => {
              setSelectedType('book')
              setSearchTerm('')
            }}
          />

          {/* Practice Problems */}
          <PracticeWidget
            problems={filteredResources.filter(r => r.type === 'project').slice(0, 6)}
            title="Practice Problems"
            subtitle="Hands-on exercises and projects"
            maxItems={4}
            showViewAll={true}
            onViewAll={() => {
              setSelectedType('project')
              setSearchTerm('')
            }}
          />

          {/* Certifications */}
          <CertificationWidget
            certifications={filteredResources.filter(r => r.type === 'certification').slice(0, 4)}
            title="Certifications"
            subtitle="Industry-recognized credentials"
            maxItems={3}
            showViewAll={true}
            onViewAll={() => {
              setSelectedType('certification')
              setSearchTerm('')
            }}
          />
        </div>
      </section>

      {/* Featured Resources */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <FeaturedResourcesWidget
          resources={filteredResources.slice(0, 3)}
          title="Featured Resources"
        />
      </section>

      {/* Resources Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredResources.map((resource, index) => {
            const TypeIcon = getTypeIcon(resource.type)
            return (
              <div
                key={resource.id}
                className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getTypeColor(resource.type)}`}>
                      <TypeIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {resource.title}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-400 font-medium text-sm">
                        {resource.platform}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {resource.rating}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                  {resource.description}
                </p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>{resource.duration}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(resource.difficulty)}`}>
                      {resource.difficulty}
                    </span>
                  </div>
                  
                  {resource.price && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Price:</span>
                      <span className="font-semibold text-green-600 dark:text-green-400">
                        {resource.price}
                      </span>
                    </div>
                  )}

                  {resource.instructor && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Instructor:</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {resource.instructor}
                      </span>
                    </div>
                  )}
                </div>

                {/* Topics */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {resource.topics.slice(0, 3).map((topic, topicIndex) => (
                      <span
                        key={topicIndex}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs"
                      >
                        {topic}
                      </span>
                    ))}
                    {resource.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                        +{resource.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleStartLearning(resource)}
                  className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Start Learning
                </button>
              </div>
            )
          })}
        </div>

        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BookOpen className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No resources found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
      <ResourcesPageInner />
    </Suspense>
  )
}
