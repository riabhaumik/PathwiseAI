'use client'

import { useState } from 'react'
import { Heart, BookOpen, TrendingUp, DollarSign, MapPin, Clock, Star, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface CareerCardProps {
  career: {
    id: string
    name: string
    description: string
    category: string
    avg_salary: string
    growth_rate: string
    skills: string[]
    education: string
    experience: string
    job_outlook: string
    work_environment: string
    top_companies?: string[]
    certifications?: string[]
    related_careers?: string[]
  }
  onSelect?: (career: any) => void
  isSelected?: boolean
}

export default function CareerCard({ career, onSelect, isSelected }: CareerCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const router = useRouter()

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsFavorited(!isFavorited)
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const formatSalary = (salary: string) => {
    if (!salary) return 'N/A'
    // Remove any non-numeric characters and format
    const num = salary.replace(/[$,]/g, '')
    if (isNaN(Number(num))) return salary
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(num))
  }

  const getGrowthRateColor = (rate: string) => {
    if (rate.includes('Much faster') || rate.includes('High')) return 'text-green-600 dark:text-green-400'
    if (rate.includes('Faster') || rate.includes('Medium')) return 'text-blue-600 dark:text-blue-400'
    if (rate.includes('Average')) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-gray-600 dark:text-gray-400'
  }

  const getGrowthRateIcon = (rate: string) => {
    if (rate.includes('Much faster') || rate.includes('High')) return '🚀'
    if (rate.includes('Faster') || rate.includes('Medium')) return '📈'
    if (rate.includes('Average')) return '➡️'
    return '📉'
  }

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl cursor-pointer ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800' 
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
      }`}
      onClick={() => onSelect?.(career)}
    >
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {career.name}
            </h3>
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded-full">
                {career.category}
              </span>
              {career.job_outlook && (
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-sm font-medium rounded-full">
                  {career.job_outlook}
                </span>
              )}
            </div>
          </div>
          
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full transition-colors ${
              isFavorited 
                ? 'text-red-500 hover:text-red-600' 
                : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Salary</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {formatSalary(career.avg_salary)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</p>
              <p className={`font-semibold ${getGrowthRateColor(career.growth_rate)}`}>
                {getGrowthRateIcon(career.growth_rate)} {career.growth_rate}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Experience</p>
              <p className="font-semibold text-gray-900 dark:text-white">
                {career.experience || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4">
          {career.description}
        </p>

        {/* Skills */}
        {career.skills && career.skills.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Key Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {career.skills.slice(0, 6).map((skill, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  {skill}
                </span>
              ))}
              {career.skills.length > 6 && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs rounded-md">
                  +{career.skills.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Education */}
        {career.education && (
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Education
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {career.education}
            </p>
          </div>
        )}

        {/* Expand/Collapse Button */}
        <button
          onClick={toggleExpanded}
          className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show Less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show More Details
            </>
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          {/* Work Environment */}
          {career.work_environment && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Work Environment
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {career.work_environment}
              </p>
            </div>
          )}

          {/* Top Companies */}
          {career.top_companies && career.top_companies.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Top Companies
              </h4>
              <div className="flex flex-wrap gap-2">
                {career.top_companies.map((company, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-800"
                  >
                    {company}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {career.certifications && career.certifications.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recommended Certifications
              </h4>
              <div className="space-y-2">
                {career.certifications.map((cert, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Careers */}
          {career.related_careers && career.related_careers.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Related Careers
              </h4>
              <div className="flex flex-wrap gap-2">
                {career.related_careers.map((relatedCareer, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                  >
                    {relatedCareer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => router.push(`/learn/${encodeURIComponent(career.name)}`)} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <BookOpen className="h-4 w-4" />
              Learn More
            </button>
            <button onClick={() => router.push(`/jobs?career=${encodeURIComponent(career.name)}`)} className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="h-4 w-4" />
              View Jobs
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 