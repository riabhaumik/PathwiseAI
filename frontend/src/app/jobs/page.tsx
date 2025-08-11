'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Search, Filter, MapPin, DollarSign, Calendar, 
  Briefcase, Clock, Users, ExternalLink, 
  Play, Star, Building, X, CheckCircle, Globe
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface Job {
  id: string
  title: string
  company: string
  location: string
  salary: string
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship'
  posted: string
  description: string
  requirements: string[]
  benefits: string[]
  applyUrl: string
  videoUrl?: string
  companyLogo?: string
  category: string
  experience: string
  remote: boolean
  verified: boolean
}

function JobsPageInner() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLocation, setSelectedLocation] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showJobModal, setShowJobModal] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const careerParam = searchParams.get('career')

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      // Try to load from backend API first
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const params = new URLSearchParams()
      if (careerParam) params.append('career', decodeURIComponent(careerParam))
      const response = await fetch(`${baseUrl}/api/jobs?${params}`)
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs || [])
      } else {
        // Fallback to local data
        const response = await fetch('/job_opportunities.json')
        if (response.ok) {
          const data = await response.json()
          setJobs(data)
        } else {
          // Fallback to hardcoded data
          setJobs(generateMockJobs())
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error)
      setJobs(generateMockJobs())
    } finally {
      setLoading(false)
    }
  }

  const generateMockJobs = (): Job[] => [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      salary: '$150,000 - $200,000',
      type: 'Full-time',
      posted: '2 days ago',
      description: 'Join our team to build scalable systems and innovative products that impact billions of users worldwide. Work with cutting-edge technologies and collaborate with world-class engineers.',
      requirements: [
        '5+ years of software development experience',
        'Proficiency in Python, Java, or C++',
        'Experience with system design and architecture',
        'Knowledge of cloud platforms (GCP preferred)',
        'Strong problem-solving and communication skills'
      ],
      benefits: [
        'Competitive salary and equity',
        'Comprehensive health insurance',
        '401(k) with company matching',
        'Free meals and snacks',
        'Flexible work arrangements',
        'Professional development budget'
      ],
      applyUrl: 'https://careers.google.com/jobs/results/123456',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      companyLogo: '🔍',
      category: 'Software Development',
      experience: '5+ years',
      remote: true,
      verified: true
    },
    {
      id: '2',
      title: 'Data Scientist',
      company: 'Microsoft',
      location: 'Seattle, WA',
      salary: '$130,000 - $180,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Analyze large datasets and build machine learning models to drive business insights and improve user experiences across Microsoft products.',
      requirements: [
        'MS/PhD in Statistics, Computer Science, or related field',
        'Proficiency in Python and R',
        'Experience with machine learning frameworks',
        'Strong statistical analysis skills',
        'Experience with SQL and big data technologies'
      ],
      benefits: [
        'Competitive compensation package',
        'Health, dental, and vision insurance',
        'Stock purchase plan',
        'Flexible time off',
        'Learning and development opportunities'
      ],
      applyUrl: 'https://careers.microsoft.com/us/en/job/123456',
      companyLogo: '🪟',
      category: 'Data Science',
      experience: '3+ years',
      remote: true,
      verified: true
    },
    {
      id: '3',
      title: 'AI Research Engineer',
      company: 'OpenAI',
      location: 'San Francisco, CA',
      salary: '$180,000 - $250,000',
      type: 'Full-time',
      posted: '3 days ago',
      description: 'Research and develop cutting-edge AI models and algorithms. Contribute to breakthrough research in artificial general intelligence.',
      requirements: [
        'PhD in AI, ML, Computer Science, or related field',
        'Experience with PyTorch or TensorFlow',
        'Strong research background with publications',
        'Deep understanding of neural networks',
        'Excellent mathematical and programming skills'
      ],
      benefits: [
        'Highly competitive salary',
        'Equity participation',
        'Research freedom and autonomy',
        'Conference travel budget',
        'State-of-the-art compute resources'
      ],
      applyUrl: 'https://openai.com/careers/123456',
      companyLogo: '🤖',
      category: 'AI/ML',
      experience: '3+ years',
      remote: false,
      verified: true
    },
    {
      id: '4',
      title: 'Frontend Developer',
      company: 'Netflix',
      location: 'Los Gatos, CA',
      salary: '$120,000 - $160,000',
      type: 'Full-time',
      posted: '5 days ago',
      description: 'Build beautiful and performant user interfaces for Netflix applications used by millions of viewers worldwide.',
      requirements: [
        '4+ years of frontend development experience',
        'Expert knowledge of React and TypeScript',
        'Experience with modern build tools',
        'Understanding of web performance optimization',
        'Experience with testing frameworks'
      ],
      benefits: [
        'Competitive salary and stock options',
        'Unlimited vacation policy',
        'Premium health insurance',
        'Free Netflix subscription',
        'Catered meals and snacks'
      ],
      applyUrl: 'https://jobs.netflix.com/jobs/123456',
      companyLogo: '📺',
      category: 'Web Development',
      experience: '4+ years',
      remote: true,
      verified: true
    },
    {
      id: '5',
      title: 'DevOps Engineer',
      company: 'Tesla',
      location: 'Palo Alto, CA',
      salary: '$140,000 - $190,000',
      type: 'Full-time',
      posted: '1 week ago',
      description: 'Build and maintain infrastructure for Tesla\'s autonomous driving and energy systems. Work on mission-critical systems.',
      requirements: [
        '3+ years of DevOps/SRE experience',
        'Experience with Kubernetes and Docker',
        'Proficiency in AWS/GCP',
        'Infrastructure as Code (Terraform preferred)',
        'Experience with CI/CD pipelines'
      ],
      benefits: [
        'Stock options and competitive salary',
        'Comprehensive benefits package',
        'Free charging for Tesla vehicles',
        'Employee vehicle purchase program',
        'Innovative work environment'
      ],
      applyUrl: 'https://www.tesla.com/careers/job/123456',
      companyLogo: '⚡',
      category: 'DevOps',
      experience: '3+ years',
      remote: false,
      verified: true
    },
    {
      id: '6',
      title: 'Product Manager',
      company: 'Apple',
      location: 'Cupertino, CA',
      salary: '$160,000 - $220,000',
      type: 'Full-time',
      posted: '4 days ago',
      description: 'Lead product strategy and development for next-generation Apple devices and services. Shape the future of technology.',
      requirements: [
        '5+ years of product management experience',
        'Experience in consumer technology products',
        'Strong analytical and strategic thinking',
        'Excellent communication and leadership skills',
        'Technical background preferred'
      ],
      benefits: [
        'Competitive compensation and equity',
        'Comprehensive health benefits',
        'Employee purchase program',
        'Wellness and fitness programs',
        'Professional development opportunities'
      ],
      applyUrl: 'https://jobs.apple.com/en-us/details/123456',
      companyLogo: '🍎',
      category: 'Product Management',
      experience: '5+ years',
      remote: false,
      verified: true
    },
    {
      id: '7',
      title: 'Cybersecurity Analyst',
      company: 'Amazon',
      location: 'Seattle, WA',
      salary: '$110,000 - $150,000',
      type: 'Full-time',
      posted: '6 days ago',
      description: 'Protect Amazon\'s infrastructure and customer data by identifying threats and implementing security measures.',
      requirements: [
        '3+ years of cybersecurity experience',
        'Knowledge of security frameworks and standards',
        'Experience with threat detection tools',
        'Understanding of network security',
        'Security certifications preferred (CISSP, CEH)'
      ],
      benefits: [
        'Competitive salary and RSUs',
        'Medical, dental, and vision coverage',
        'Retirement savings plan',
        'Career advancement opportunities',
        'Continuous learning programs'
      ],
      applyUrl: 'https://amazon.jobs/en/jobs/123456',
      companyLogo: '📦',
      category: 'Cybersecurity',
      experience: '3+ years',
      remote: true,
      verified: true
    },
    {
      id: '8',
      title: 'Mobile App Developer',
      company: 'Spotify',
      location: 'New York, NY',
      salary: '$125,000 - $175,000',
      type: 'Full-time',
      posted: '3 days ago',
      description: 'Develop and maintain Spotify\'s mobile applications for iOS and Android platforms, reaching millions of music lovers.',
      requirements: [
        '4+ years of mobile development experience',
        'Proficiency in Swift/Kotlin or React Native',
        'Experience with mobile app architecture',
        'Knowledge of mobile UI/UX best practices',
        'Experience with app store deployment'
      ],
      benefits: [
        'Competitive salary and equity',
        'Premium health insurance',
        'Spotify Premium and concert tickets',
        'Flexible work arrangements',
        'Learning and development budget'
      ],
      applyUrl: 'https://www.lifeatspotify.com/jobs/123456',
      companyLogo: '🎵',
      category: 'Mobile Development',
      experience: '4+ years',
      remote: true,
      verified: true
    }
  ]

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = selectedLocation === 'all' || 
                           job.location.toLowerCase().includes(selectedLocation.toLowerCase()) ||
                           (selectedLocation === 'remote' && job.remote)
    const matchesType = selectedType === 'all' || job.type === selectedType
    const matchesCategory = selectedCategory === 'all' || job.category === selectedCategory
    return matchesSearch && matchesLocation && matchesType && matchesCategory
  })

  const locations = ['all', 'remote', ...Array.from(new Set(jobs.map(j => j.location.split(',')[1]?.trim() || j.location)))]
  const types = ['all', 'Full-time', 'Part-time', 'Contract', 'Internship']
  const categories = ['all', ...Array.from(new Set(jobs.map(j => j.category)))]

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowJobModal(true)
  }

  const handleApplyJob = (job: Job) => {
    window.open(job.applyUrl, '_blank')
  }

  const handleWatchVideo = (job: Job) => {
    if (job.videoUrl) {
      window.open(job.videoUrl, '_blank')
    }
  }

  const closeJobModal = () => {
    setShowJobModal(false)
    setSelectedJob(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading job opportunities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              STEM <span className="gradient-text">Job Opportunities</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Discover {jobs.length}+ opportunities at top tech companies. Apply directly and take the next step in your career.
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>Updated daily</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Verified employers</span>
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-4 w-4" />
                <span>Remote-friendly</span>
              </div>
            </div>
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
              placeholder="Search jobs (e.g., 'software engineer', 'data scientist', 'google')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
            />
          </div>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {locations.map(location => (
                  <option key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location === 'remote' ? 'Remote' : location}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Job Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {types.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Types' : type}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedLocation('all')
                  setSelectedType('all')
                  setSelectedCategory('all')
                }}
                className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Job Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              {filteredJobs.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Jobs Found</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {Array.from(new Set(jobs.map(j => j.company))).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Companies</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
              {jobs.filter(j => j.remote).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Remote Jobs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
              {jobs.filter(j => j.verified).length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">Verified</div>
          </div>
        </div>
      </section>

      {/* Jobs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job, index) => (
            <div
              key={job.id}
              className="card-hover bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleJobClick(job)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="text-3xl flex-shrink-0">{job.companyLogo}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {job.title}
                    </h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium">
                      {job.company}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {job.verified && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {job.remote && (
                    <Globe className="h-5 w-5 text-blue-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.location}
                  {job.remote && <span className="ml-1 text-blue-500">(Remote OK)</span>}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {job.salary}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {job.type} • {job.experience}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Posted {job.posted}
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                {job.description}
              </p>

              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  {job.category}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.type === 'Full-time' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  job.type === 'Part-time' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                  job.type === 'Contract' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                }`}>
                  {job.type}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleApplyJob(job)
                  }}
                  className="flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                >
                  Apply Now
                </button>
                {job.videoUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleWatchVideo(job)
                    }}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    title="Watch company video"
                  >
                    <Play className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Briefcase className="h-16 w-16 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No jobs found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter criteria.
            </p>
          </div>
        )}
      </section>

      {/* Job Details Modal */}
      {showJobModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">{selectedJob.companyLogo}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {selectedJob.title}
                    </h2>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-lg">
                      {selectedJob.company}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeJobModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Job Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-2" />
                  {selectedJob.location}
                  {selectedJob.remote && <span className="ml-1 text-blue-500">(Remote OK)</span>}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <DollarSign className="h-4 w-4 mr-2" />
                  {selectedJob.salary}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  Posted {selectedJob.posted}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Briefcase className="h-4 w-4 mr-2" />
                  {selectedJob.type} • {selectedJob.experience}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Job Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {selectedJob.description}
                </p>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Requirements
                </h3>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
                  {selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>

              {/* Benefits */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Benefits & Perks
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {selectedJob.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => handleApplyJob(selectedJob)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  Apply Now
                </button>
                {selectedJob.videoUrl && (
                  <button 
                    onClick={() => handleWatchVideo(selectedJob)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    Watch Video
                  </button>
                )}
                <button 
                  onClick={closeJobModal}
                  className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>}>
      <JobsPageInner />
    </Suspense>
  )
}
