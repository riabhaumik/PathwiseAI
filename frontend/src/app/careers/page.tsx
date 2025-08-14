'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, Filter, TrendingUp, DollarSign, GraduationCap, 
  MapPin, Users, Award, ArrowRight, BookOpen, Target, 
  Heart, Share2, X, ChevronRight, ExternalLink, Map
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
      setLoading(true)
      
      // Try to load from backend API first
      const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      console.log('Attempting to fetch from:', `${baseUrl}/api/careers`)
      
      const response = await fetch(`${baseUrl}/api/careers`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000)
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Backend response:', data)
        
        if (data.careers && Object.keys(data.careers).length > 0) {
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
          console.log(`Loaded ${careersArray.length} careers from backend`)
          setCareers(careersArray)
          setLoading(false)
          return
        }
      }
      
      // Fallback to local STEM careers data
      console.log('Falling back to local data...')
      const localResponse = await fetch('/careers_stem.json')
      if (localResponse.ok) {
        const data = await localResponse.json()
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
        console.log(`Loaded ${careersArray.length} careers from local data`)
        setCareers(careersArray)
      } else {
        throw new Error('Failed to load local data')
      }
    } catch (error) {
      console.error('Error loading careers:', error)
      
      // Final fallback with comprehensive STEM careers
      const fallbackCareers = [
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
        },
        {
          id: 4,
          name: "Cybersecurity Analyst",
          description: "Protects computer systems and networks from security threats using advanced security tools and techniques",
          skills: ["Network Security", "Incident Response", "Risk Assessment", "Security Tools", "Compliance"],
          degree_required: "Bachelor's in Cybersecurity, Computer Science, or related field",
          growth_rate: "35% (Much faster than average)",
          avg_salary: "$102,600",
          category: "Computer Science"
        },
        {
          id: 5,
          name: "DevOps Engineer",
          description: "Manages the development and operations infrastructure using automation and cloud technologies",
          skills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Cloud Platforms"],
          degree_required: "Bachelor's in Computer Science or related field",
          growth_rate: "30% (Much faster than average)",
          avg_salary: "$115,000",
          category: "Computer Science"
        },
        {
          id: 6,
          name: "Machine Learning Engineer",
          description: "Builds and deploys machine learning models and systems for production use",
          skills: ["Python", "Machine Learning", "Deep Learning", "MLOps", "Data Engineering"],
          degree_required: "Bachelor's in Computer Science, AI, or related field",
          growth_rate: "38% (Much faster than average)",
          avg_salary: "$125,000",
          category: "Computer Science"
        },
        {
          id: 7,
          name: "Civil Engineer",
          description: "Designs and oversees construction of infrastructure projects like roads, bridges, and buildings",
          skills: ["Structural Analysis", "CAD Software", "Project Management", "Construction Methods", "Materials Science"],
          degree_required: "Bachelor's in Civil Engineering",
          growth_rate: "8% (As fast as average)",
          avg_salary: "$88,050",
          category: "Engineering"
        },
        {
          id: 8,
          name: "Mechanical Engineer",
          description: "Designs and builds mechanical devices, engines, and machines",
          skills: ["Mechanical Design", "Thermodynamics", "CAD/CAM", "Manufacturing Processes", "Materials"],
          degree_required: "Bachelor's in Mechanical Engineering",
          growth_rate: "7% (As fast as average)",
          avg_salary: "$95,300",
          category: "Engineering"
        },
        {
          id: 9,
          name: "Electrical Engineer",
          description: "Designs and develops electrical systems, circuits, and electronic devices",
          skills: ["Circuit Design", "Electronics", "Power Systems", "Control Systems", "Signal Processing"],
          degree_required: "Bachelor's in Electrical Engineering",
          growth_rate: "7% (As fast as average)",
          avg_salary: "$101,780",
          category: "Engineering"
        },
        {
          id: 10,
          name: "Chemical Engineer",
          description: "Develops chemical manufacturing processes and designs chemical plants",
          skills: ["Chemistry", "Process Design", "Thermodynamics", "Safety Protocols", "Equipment Design"],
          degree_required: "Bachelor's in Chemical Engineering",
          growth_rate: "9% (As fast as average)",
          avg_salary: "$105,550",
          category: "Engineering"
        },
        {
          id: 11,
          name: "Biomedical Engineer",
          description: "Combines engineering principles with biological sciences to develop medical devices and technologies",
          skills: ["Biomechanics", "Medical Device Design", "Biology", "Regulatory Compliance", "Clinical Testing"],
          degree_required: "Bachelor's in Biomedical Engineering",
          growth_rate: "10% (As fast as average)",
          avg_salary: "$97,410",
          category: "Engineering"
        },
        {
          id: 12,
          name: "Aerospace Engineer",
          description: "Designs aircraft, spacecraft, satellites, and missiles",
          skills: ["Aerodynamics", "Flight Mechanics", "Propulsion Systems", "Materials Science", "Control Systems"],
          degree_required: "Bachelor's in Aerospace Engineering",
          growth_rate: "8% (As fast as average)",
          avg_salary: "$118,610",
          category: "Engineering"
        },
        {
          id: 13,
          name: "Robotics Engineer",
          description: "Designs and builds robots and automated systems for various applications",
          skills: ["Robotics", "Control Systems", "Computer Vision", "Mechanical Design", "Programming"],
          degree_required: "Bachelor's in Robotics, Mechanical, or Electrical Engineering",
          growth_rate: "15% (Faster than average)",
          avg_salary: "$110,000",
          category: "Engineering"
        },
        {
          id: 14,
          name: "Statistician",
          description: "Collects, analyzes, and interprets data to help solve real-world problems",
          skills: ["Statistics", "Data Analysis", "Statistical Software", "Research Methods", "Mathematics"],
          degree_required: "Master's in Statistics or related field",
          growth_rate: "33% (Much faster than average)",
          avg_salary: "$95,570",
          category: "Mathematics"
        },
        {
          id: 15,
          name: "Mathematician",
          description: "Develops mathematical theories and applies mathematical techniques to solve problems",
          skills: ["Advanced Mathematics", "Mathematical Modeling", "Research", "Problem Solving", "Analysis"],
          degree_required: "Master's or PhD in Mathematics",
          growth_rate: "31% (Much faster than average)",
          avg_salary: "$112,110",
          category: "Mathematics"
        },
        {
          id: 16,
          name: "Actuary",
          description: "Analyzes financial costs of risk and uncertainty using mathematics and statistics",
          skills: ["Statistics", "Probability", "Financial Mathematics", "Risk Assessment", "Business Acumen"],
          degree_required: "Bachelor's in Mathematics, Statistics, or Actuarial Science",
          growth_rate: "24% (Much faster than average)",
          avg_salary: "$111,030",
          category: "Mathematics"
        },
        {
          id: 17,
          name: "Operations Research Analyst",
          description: "Uses mathematical and analytical methods to help organizations solve complex problems",
          skills: ["Operations Research", "Mathematical Modeling", "Optimization", "Data Analysis", "Problem Solving"],
          degree_required: "Bachelor's in Operations Research, Mathematics, or related field",
          growth_rate: "25% (Much faster than average)",
          avg_salary: "$84,810",
          category: "Mathematics"
        },
        {
          id: 18,
          name: "Physicist",
          description: "Studies the fundamental nature of matter, energy, and the universe",
          skills: ["Physics", "Mathematics", "Research Methods", "Laboratory Techniques", "Computer Modeling"],
          degree_required: "PhD in Physics",
          growth_rate: "8% (As fast as average)",
          avg_salary: "$142,850",
          category: "Physics"
        },
        {
          id: 19,
          name: "Astronomer",
          description: "Studies celestial objects and phenomena in the universe",
          skills: ["Astronomy", "Physics", "Mathematics", "Observational Techniques", "Data Analysis"],
          degree_required: "PhD in Astronomy or Physics",
          growth_rate: "6% (As fast as average)",
          avg_salary: "$119,730",
          category: "Physics"
        },
        {
          id: 20,
          name: "Quantum Physicist",
          description: "Studies quantum mechanics and quantum phenomena for applications in computing and technology",
          skills: ["Quantum Mechanics", "Physics", "Mathematics", "Research", "Computer Science"],
          degree_required: "PhD in Physics with focus on Quantum Mechanics",
          growth_rate: "12% (Faster than average)",
          avg_salary: "$130,000",
          category: "Physics"
        },
        {
          id: 21,
          name: "Chemist",
          description: "Studies the composition, structure, and properties of matter",
          skills: ["Chemistry", "Laboratory Techniques", "Analytical Methods", "Research", "Safety Protocols"],
          degree_required: "Bachelor's in Chemistry",
          growth_rate: "6% (As fast as average)",
          avg_salary: "$79,430",
          category: "Chemistry"
        },
        {
          id: 22,
          name: "Biochemist",
          description: "Studies the chemical processes and substances that occur in living organisms",
          skills: ["Biochemistry", "Biology", "Chemistry", "Laboratory Techniques", "Research Methods"],
          degree_required: "Bachelor's in Biochemistry or related field",
          growth_rate: "15% (Faster than average)",
          avg_salary: "$102,270",
          category: "Chemistry"
        },
        {
          id: 23,
          name: "Materials Chemist",
          description: "Develops new materials with specific properties for various applications",
          skills: ["Materials Science", "Chemistry", "Characterization Techniques", "Synthesis", "Testing"],
          degree_required: "Bachelor's in Chemistry or Materials Science",
          growth_rate: "10% (As fast as average)",
          avg_salary: "$89,000",
          category: "Chemistry"
        },
        {
          id: 24,
          name: "Blockchain Developer",
          description: "Develops decentralized applications and smart contracts using blockchain technology",
          skills: ["Blockchain", "Smart Contracts", "Cryptography", "Programming", "Distributed Systems"],
          degree_required: "Bachelor's in Computer Science or related field",
          growth_rate: "45% (Much faster than average)",
          avg_salary: "$140,000",
          category: "Computer Science"
        }
      ]
      
      console.log(`Using fallback data with ${fallbackCareers.length} careers`)
      setCareers(fallbackCareers)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading careers...</p>
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
              Explore <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">STEM Careers</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Discover {careers.length}+ detailed STEM career paths with comprehensive information about skills, salaries, and growth potential.
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search careers (e.g., 'data scientist', 'engineer')..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 text-lg focus:outline-none"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Filter className="h-5 w-5 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-slate-100 text-lg focus:outline-none"
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
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {filteredCareers.length}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Career Paths</div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {categories.length - 1}
            </div>
            <div className="text-slate-600 dark:text-slate-400">Categories</div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              $100K+
            </div>
            <div className="text-slate-600 dark:text-slate-400">Avg Salary</div>
          </div>
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg text-center border border-slate-200/50 dark:border-slate-700/50">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              30%+
            </div>
            <div className="text-slate-600 dark:text-slate-400">Growth Rate</div>
          </div>
        </div>
      </section>

      {/* Careers Grid */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCareers.map((career, index) => (
            <div
              key={career.id || index}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-slate-200/50 dark:border-slate-700/50 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl hover:-translate-y-2 animate-slide-up focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleCareerClick(career)}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {career.name}
                </h3>
                <div className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-slate-400 hover:text-red-500 transition-colors" />
                  <Share2 className="h-5 w-5 text-slate-400 hover:text-blue-500 transition-colors" />
                </div>
              </div>
              
              <p className="text-slate-600 dark:text-slate-400 mb-4 line-clamp-3 leading-relaxed">
                {career.description}
              </p>
              
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <GraduationCap className="h-4 w-4" />
                  <span>{career.degree_required}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <TrendingUp className="h-4 w-4" />
                  <span>{career.growth_rate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <DollarSign className="h-4 w-4" />
                  <span>{career.avg_salary}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                  {career.category}
                </span>
                <button className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm font-medium">
                  Learn More
                  <ChevronRight className="h-4 w-4" />
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
          <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-slate-200/50 dark:border-slate-700/50">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {selectedCareer.name}
                </h2>
                <button
                  onClick={closeCareerModal}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 rounded-lg p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                {selectedCareer.category}
              </p>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                  Description
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {selectedCareer.detailed_description || selectedCareer.description}
                </p>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">Average Salary</h4>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    {selectedCareer.avg_salary}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">Growth Rate</h4>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {selectedCareer.growth_rate}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold text-purple-800 dark:text-purple-200 mb-2">Education</h4>
                  <p className="text-lg font-medium text-purple-900 dark:text-purple-100">
                    {selectedCareer.degree_required}
                  </p>
                </div>
              </div>

              {/* Skills */}
              {selectedCareer.skills && selectedCareer.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Key Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm border border-slate-200 dark:border-slate-600"
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Work Environment
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                    {selectedCareer.work_environment}
                  </p>
                </div>
              )}

              {/* Top Companies */}
              {selectedCareer.top_companies && selectedCareer.top_companies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Recommended Certifications
                  </h3>
                  <div className="space-y-2">
                    {selectedCareer.certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Learning Subjects
                  </h3>
                  <div className="space-y-4">
                    {Object.entries(selectedCareer.subjects).map(([subjectName, subjectData]: [string, any]) => (
                      <div key={subjectName} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600">
                        <h4 className="font-medium text-slate-900 dark:text-slate-100 mb-2">{subjectName}</h4>
                        {Array.isArray(subjectData) && subjectData.map((topic: any, index: number) => (
                          <div key={index} className="mb-3 p-3 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-600">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-slate-900 dark:text-slate-100">{topic.name}</h5>
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
                                <p className="text-sm text-slate-600 dark:text-slate-400">Resources:</p>
                                <div className="flex flex-wrap gap-2">
                                  {Object.entries(topic.resources).map(([platform, url]: [string, unknown]) => (
                                    <a
                                      key={platform}
                                      href={typeof url === 'string' ? url : '#'}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors border border-blue-200 dark:border-blue-800"
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

              {/* Personalized Career Roadmap */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  🗺️ Personalized Learning Roadmap
                </h3>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4 text-center">
                    {selectedCareer.name} Learning Path
                  </h4>
                  
                  {/* Phase 1: Foundation */}
                  <div className="space-y-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        Foundation & Fundamentals
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📚 Courses</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Introduction to {selectedCareer.category}</li>
                            <li>• Basic Mathematics & Statistics</li>
                            <li>• Programming Fundamentals</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📖 Articles</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Career Overview & Trends</li>
                            <li>• Essential Skills Guide</li>
                            <li>• Industry Insights</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">🎥 YouTube</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Day in the Life</li>
                            <li>• Skill Tutorials</li>
                            <li>• Industry Experts</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Phase 2: Intermediate */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        Intermediate Skills
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📚 Courses</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Advanced {selectedCareer.category}</li>
                            <li>• Specialized Tools & Technologies</li>
                            <li>• Project-Based Learning</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📖 Articles</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Best Practices</li>
                            <li>• Case Studies</li>
                            <li>• Advanced Techniques</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">🎥 YouTube</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Advanced Tutorials</li>
                            <li>• Project Walkthroughs</li>
                            <li>• Technical Deep Dives</li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Phase 3: Advanced */}
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-green-200 dark:border-green-700">
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        Advanced & Specialization
                      </h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📚 Courses</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Expert-Level Training</li>
                            <li>• Specialization Tracks</li>
                            <li>• Industry Certifications</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">📖 Articles</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Research Papers</li>
                            <li>• Industry Reports</li>
                            <li>• Expert Opinions</li>
                          </ul>
                        </div>
                        <div>
                          <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-2">🎥 YouTube</h6>
                          <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <li>• Expert Interviews</li>
                            <li>• Conference Talks</li>
                            <li>• Research Presentations</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Links */}
                  <div className="mt-6 pt-4 border-t border-blue-200 dark:border-blue-700">
                    <div className="flex flex-wrap gap-3 justify-center">
                      <a
                        href={`/roadmap?career=${encodeURIComponent(selectedCareer.name)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <Map className="h-4 w-4" />
                        View Full Roadmap
                      </a>
                      <a
                        href={`/practice?career=${encodeURIComponent(selectedCareer.name)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <Target className="h-4 w-4" />
                        Practice Problems
                      </a>
                      <a
                        href={`/resources?career=${encodeURIComponent(selectedCareer.name)}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        <BookOpen className="h-4 w-4" />
                        Browse Resources
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Related Careers */}
              {selectedCareer.related_careers && selectedCareer.related_careers.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Related Careers
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCareer.related_careers.map((relatedCareer, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full text-sm hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors border border-slate-200 dark:border-slate-600"
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
              <div className="flex gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button 
                  onClick={() => {
                    closeCareerModal()
                    router.push(`/roadmap`)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <BookOpen className="h-5 w-5" />
                  Start Learning Path
                </button>
                <button 
                  onClick={() => {
                    closeCareerModal()
                    handleStartPracticing(selectedCareer)
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
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
