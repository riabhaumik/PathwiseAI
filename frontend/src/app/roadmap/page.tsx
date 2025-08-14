'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Map, Target, BookOpen, Clock, Star, 
  ChevronRight, Search, Filter, TrendingUp,
  Calculator, Code, Brain, Zap, Award,
  Users, Calendar, ExternalLink
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface CareerRoadmap {
  name: string
  category: string
  difficulty: string
  duration: string
  description: string
  skills: string[]
  phases: number
  resources: number
  icon: string
}

export default function RoadmapPage() {
  const [careers, setCareers] = useState<CareerRoadmap[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const router = useRouter()

  useEffect(() => {
    loadCareerRoadmaps()
  }, [])

  const loadCareerRoadmaps = async () => {
    try {
      // Try to load from backend API first
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${baseUrl}/api/careers`)
      if (response.ok) {
        const data = await response.json()
        if (data.careers) {
          const roadmaps = Object.entries(data.careers).map(([name, careerData]: [string, any]) => ({
            name: name,
            category: careerData.category || 'STEM',
            difficulty: careerData.difficulty || 'Intermediate',
            duration: careerData.duration || '2-4 years',
            description: careerData.description || '',
            skills: careerData.skills || [],
            phases: 5,
            resources: 20,
            icon: getCareerIcon(name)
          }))
          setCareers(roadmaps)
        }
      } else {
        // Fallback to hardcoded roadmaps
        setCareers(generateMockRoadmaps())
      }
    } catch (error) {
      console.error('Error loading career roadmaps:', error)
      setCareers(generateMockRoadmaps())
    } finally {
      setLoading(false)
    }
  }

  const generateMockRoadmaps = (): CareerRoadmap[] => [
    {
      name: 'Software Engineer',
      category: 'Computer Science',
      difficulty: 'Intermediate',
      duration: '2-4 years',
      description: 'Comprehensive roadmap covering programming fundamentals, data structures, algorithms, web development, and system design.',
      skills: ['Programming', 'Data Structures', 'Algorithms', 'Web Development', 'System Design', 'Version Control', 'Testing', 'CI/CD'],
      phases: 6,
      resources: 35,
      icon: '💻'
    },
    {
      name: 'Data Scientist',
      category: 'Data Science',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Complete learning path from mathematics and statistics to machine learning, deep learning, and production deployment.',
      skills: ['Mathematics', 'Statistics', 'Programming', 'Machine Learning', 'Deep Learning', 'Data Visualization', 'Big Data', 'MLOps'],
      phases: 7,
      resources: 40,
      icon: '📊'
    },
    {
      name: 'AI Engineer',
      category: 'Artificial Intelligence',
      difficulty: 'Advanced',
      duration: '4-6 years',
      description: 'Advanced AI specialization covering neural networks, deep learning frameworks, and production AI systems.',
      skills: ['AI Fundamentals', 'Deep Learning', 'Neural Networks', 'Production AI', 'MLOps'],
      phases: 7,
      resources: 35,
      icon: '🤖'
    },
    {
      name: 'Machine Learning Engineer',
      category: 'Machine Learning',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Specialized path focusing on ML algorithms, model deployment, and production machine learning systems.',
      skills: ['Machine Learning', 'Deep Learning', 'MLOps', 'Model Deployment', 'Production Systems'],
      phases: 6,
      resources: 28,
      icon: '🧠'
    },
    {
      name: 'Data Engineer',
      category: 'Data Engineering',
      difficulty: 'Intermediate',
      duration: '2-4 years',
      description: 'Data infrastructure and pipeline development covering databases, big data technologies, and ETL processes.',
      skills: ['Databases', 'Big Data', 'ETL', 'Data Pipelines', 'Cloud Computing'],
      phases: 5,
      resources: 22,
      icon: '🔧'
    },
    {
      name: 'DevOps Engineer',
      category: 'DevOps',
      difficulty: 'Intermediate',
      duration: '2-4 years',
      description: 'Infrastructure automation, CI/CD pipelines, and cloud-native development practices.',
      skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Cloud Platforms'],
      phases: 5,
      resources: 24,
      icon: '🚀'
    },
    {
      name: 'Cybersecurity Engineer',
      category: 'Cybersecurity',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Security fundamentals, ethical hacking, network security, and incident response.',
      skills: ['Network Security', 'Ethical Hacking', 'Incident Response', 'Security Tools', 'Compliance'],
      phases: 6,
      resources: 26,
      icon: '🔒'
    },
    {
      name: 'Full Stack Developer',
      category: 'Web Development',
      difficulty: 'Intermediate',
      duration: '2-4 years',
      description: 'Complete web development covering frontend, backend, databases, and deployment.',
      skills: ['Frontend', 'Backend', 'Databases', 'APIs', 'Deployment'],
      phases: 5,
      resources: 23,
      icon: '🌐'
    },
    {
      name: 'Mobile Developer',
      category: 'Mobile Development',
      difficulty: 'Intermediate',
      duration: '2-4 years',
      description: 'Mobile app development for iOS and Android platforms with modern frameworks.',
      skills: ['Mobile UI/UX', 'Native Development', 'Cross-platform', 'App Store', 'Performance'],
      phases: 5,
      resources: 21,
      icon: '📱'
    },
    {
      name: 'Cloud Architect',
      category: 'Cloud Computing',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Cloud infrastructure design, multi-cloud strategies, and cloud-native architecture.',
      skills: ['AWS', 'Azure', 'GCP', 'Cloud Architecture', 'Serverless'],
      phases: 6,
      resources: 27,
      icon: '☁️'
    },
    {
      name: 'Blockchain Developer',
      category: 'Blockchain',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Blockchain fundamentals, smart contracts, DeFi protocols, and Web3 development.',
      skills: ['Blockchain', 'Smart Contracts', 'Solidity', 'DeFi', 'Web3'],
      phases: 6,
      resources: 25,
      icon: '⛓️'
    },
    {
      name: 'Game Developer',
      category: 'Game Development',
      difficulty: 'Intermediate',
      duration: '2-4 years',
      description: 'Game development covering game engines, graphics programming, and game design principles.',
      skills: ['Game Engines', 'Graphics Programming', 'Game Design', 'Physics', 'Audio'],
      phases: 5,
      resources: 24,
      icon: '🎮'
    },
    {
      name: 'Embedded Systems Engineer',
      category: 'Embedded Systems',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Hardware-software integration, real-time systems, and IoT device development.',
      skills: ['Embedded C', 'Real-time Systems', 'Hardware', 'IoT', 'Firmware'],
      phases: 6,
      resources: 26,
      icon: '🔌'
    },
    {
      name: 'Computer Vision Engineer',
      category: 'Computer Vision',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Image processing, computer vision algorithms, and deep learning for visual tasks.',
      skills: ['Computer Vision', 'Image Processing', 'Deep Learning', 'OpenCV', 'Neural Networks'],
      phases: 6,
      resources: 28,
      icon: '👁️'
    },
    {
      name: 'NLP Engineer',
      category: 'Natural Language Processing',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Natural language processing, text analysis, and language model development.',
      skills: ['NLP', 'Text Processing', 'Language Models', 'Transformers', 'Linguistics'],
      phases: 6,
      resources: 27,
      icon: '💬'
    },
    {
      name: 'Robotics Engineer',
      category: 'Robotics',
      difficulty: 'Advanced',
      duration: '4-6 years',
      description: 'Robotics fundamentals, control systems, and autonomous robot development.',
      skills: ['Robotics', 'Control Systems', 'Mechanics', 'Electronics', 'AI'],
      phases: 7,
      resources: 30,
      icon: '🤖'
    },
    {
      name: 'Quantum Computing Engineer',
      category: 'Quantum Computing',
      difficulty: 'Expert',
      duration: '5-7 years',
      description: 'Quantum mechanics, quantum algorithms, and quantum software development.',
      skills: ['Quantum Mechanics', 'Quantum Algorithms', 'Linear Algebra', 'Quantum Software', 'Physics'],
      phases: 8,
      resources: 35,
      icon: '⚛️'
    },
    {
      name: 'Bioinformatics Engineer',
      category: 'Bioinformatics',
      difficulty: 'Advanced',
      duration: '4-6 years',
      description: 'Biological data analysis, computational biology, and bioinformatics tools development.',
      skills: ['Biology', 'Data Analysis', 'Programming', 'Statistics', 'Genomics'],
      phases: 7,
      resources: 32,
      icon: '🧬'
    },
    {
      name: 'Financial Technology Engineer',
      category: 'FinTech',
      difficulty: 'Advanced',
      duration: '3-5 years',
      description: 'Financial systems, algorithmic trading, and fintech application development.',
      skills: ['Finance', 'Algorithms', 'Risk Management', 'Trading Systems', 'Regulations'],
      phases: 6,
      resources: 29,
      icon: '💰'
    },
    {
      name: 'Space Systems Engineer',
      category: 'Aerospace',
      difficulty: 'Expert',
      duration: '5-7 years',
      description: 'Spacecraft design, orbital mechanics, and space mission planning.',
      skills: ['Aerospace', 'Orbital Mechanics', 'Systems Engineering', 'Physics', 'Mission Planning'],
      phases: 8,
      resources: 38,
      icon: '🚀'
    }
  ]

  const getCareerIcon = (careerName: string): string => {
    const iconMap: { [key: string]: string } = {
      'Software Engineer': '💻',
      'Data Scientist': '📊',
      'AI Engineer': '🤖',
      'Machine Learning Engineer': '🧠',
      'Data Engineer': '🔧',
      'DevOps Engineer': '🚀',
      'Cybersecurity Engineer': '🔒',
      'Full Stack Developer': '🌐',
      'Mobile Developer': '📱',
      'Cloud Architect': '☁️',
      'Blockchain Developer': '⛓️',
      'Game Developer': '🎮',
      'Embedded Systems Engineer': '🔌',
      'Computer Vision Engineer': '👁️',
      'NLP Engineer': '💬',
      'Robotics Engineer': '🤖',
      'Quantum Computing Engineer': '⚛️',
      'Bioinformatics Engineer': '🧬',
      'Financial Technology Engineer': '💰',
      'Space Systems Engineer': '🚀'
    }
    return iconMap[careerName] || '🎯'
  }

  const filteredCareers = careers.filter(career => {
    const matchesSearch = career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         career.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || career.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || career.difficulty === selectedDifficulty
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const categories = ['all', ...Array.from(new Set(careers.map(c => c.category)))]
  const difficulties = ['all', 'Intermediate', 'Advanced', 'Expert']

  const handleStartRoadmap = (career: CareerRoadmap) => {
    // Navigate to roadmap detail page with career parameter
    router.push(`/roadmap/${encodeURIComponent(career.name.toLowerCase().replace(/\s+/g, '-'))}`)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Intermediate': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Advanced': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'Expert': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryColor = (category: string) => {
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
    ]
    const index = categories.indexOf(category) % colors.length
    return colors[index]
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading career roadmaps...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-100 mb-6">
              Career <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Roadmaps</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover comprehensive learning paths for {careers.length}+ STEM careers with detailed phases, skills, and resources.
            </p>
            <div className="flex justify-center items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-purple-500" />
                <span>{careers.length} Career Paths</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-500" />
                <span>Structured Learning</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-green-500" />
                <span>Curated Resources</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search career roadmaps (e.g., 'software engineer', 'data scientist')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 text-lg focus:outline-none"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 focus:outline-none"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Difficulty</label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 focus:outline-none"
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
                  setSelectedDifficulty('all')
                }}
                className="w-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Stats */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {careers.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Career Paths</div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Categories</div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {careers.reduce((sum, c) => sum + c.phases, 0)}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Total Phases</div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {careers.reduce((sum, c) => sum + c.resources, 0)}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Resources</div>
          </div>
        </div>
      </section>

      {/* Featured Roadmaps */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            Featured Career Roadmaps
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Start with these popular career paths
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {careers.slice(0, 6).map((career, index) => (
            <div
              key={career.name}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer animate-slide-up focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleStartRoadmap(career)}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-3">{career.icon}</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                  {career.name}
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(career.category)}`}>
                  {career.category}
                </span>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 text-center mb-4 line-clamp-3">
                {career.description}
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Difficulty:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(career.difficulty)}`}>
                    {career.difficulty}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Duration:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{career.duration}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Phases:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{career.phases}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">Resources:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{career.resources}</span>
                </div>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartRoadmap(career)
                }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <Map className="h-4 w-4" />
                Start Roadmap
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* All Roadmaps Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            All Career Roadmaps
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Explore all available learning paths
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCareers.map((career, index) => (
            <div
              key={career.name}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer animate-slide-up focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleStartRoadmap(career)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{career.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                      {career.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(career.category)}`}>
                      {career.category}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(career.difficulty)}`}>
                  {career.difficulty}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3">
                {career.description}
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="h-4 w-4" />
                    <span>{career.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Target className="h-4 w-4" />
                    <span>{career.phases} phases</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <BookOpen className="h-4 w-4" />
                    <span>{career.resources} resources</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Star className="h-4 w-4" />
                    <span>4.8★</span>
                  </div>
                </div>
              </div>

              {/* Key Skills Preview */}
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Key Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {career.skills.slice(0, 3).map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-md text-xs"
                    >
                      {skill}
                    </span>
                  ))}
                  {career.skills.length > 3 && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-xs">
                      +{career.skills.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartRoadmap(career)
                }}
                className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <ChevronRight className="h-4 w-4" />
                Start Learning
              </button>
            </div>
          ))}
        </div>

        {filteredCareers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Map className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No roadmaps found
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
