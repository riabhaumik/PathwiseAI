'use client'

import { useState } from 'react'
import { 
  BookOpen, Play, FileText, Code, Award, 
  Star, Clock, ExternalLink, ChevronRight,
  TrendingUp, Users, Calendar, Target
} from 'lucide-react'

interface ResourceWidgetProps {
  title: string
  resources: any[]
  type: 'courses' | 'videos' | 'articles' | 'books' | 'practice' | 'certifications'
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface CourseWidgetProps {
  courses: any[]
  title: string
  subtitle?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface VideoWidgetProps {
  videos: any[]
  title: string
  subtitle?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface ArticleWidgetProps {
  articles: any[]
  title: string
  subtitle?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface BookWidgetProps {
  books: any[]
  title: string
  subtitle?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface PracticeWidgetProps {
  problems: any[]
  title: string
  subtitle?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

interface CertificationWidgetProps {
  certifications: any[]
  title: string
  subtitle?: string
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

// Generic Resource Widget
export function ResourceWidget({ 
  title, 
  resources, 
  type, 
  maxItems = 3, 
  showViewAll = true,
  onViewAll 
}: ResourceWidgetProps) {
  const getTypeIcon = (resourceType: string) => {
    switch (resourceType) {
      case 'course': return BookOpen
      case 'video': return Play
      case 'article': return FileText
      case 'book': return FileText
      case 'practice': return Code
      case 'certification': return Award
      default: return BookOpen
    }
  }

  const getTypeColor = (resourceType: string) => {
    switch (resourceType) {
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'article': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'book': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'practice': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'certification': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const displayedResources = resources.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {resources.length} {type} available
          </p>
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedResources.map((resource, index) => {
          const TypeIcon = getTypeIcon(resource.type || type)
          return (
            <div
              key={resource.id || index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              onClick={() => window.open(resource.url, '_blank')}
            >
              <div className={`p-2 rounded-lg ${getTypeColor(resource.type || type)}`}>
                <TypeIcon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">
                  {resource.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {resource.platform && (
                    <span>{resource.platform}</span>
                  )}
                  {resource.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {resource.duration}
                    </div>
                  )}
                  {resource.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 text-yellow-400 fill-current" />
                      {resource.rating}
                    </div>
                  )}
                </div>
              </div>
              <ExternalLink className="h-4 w-4 text-gray-400" />
            </div>
          )
        })}
      </div>

      {resources.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No {type} available yet</p>
        </div>
      )}
    </div>
  )
}

// Course Widget
export function CourseWidget({ 
  courses, 
  title, 
  subtitle, 
  maxItems = 4, 
  showViewAll = true,
  onViewAll 
}: CourseWidgetProps) {
  const displayedCourses = courses.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedCourses.map((course, index) => (
          <div
            key={course.id || index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => window.open(course.url, '_blank')}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                {course.title}
              </h4>
              {course.free && (
                <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-md text-xs font-medium">
                  Free
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              {course.platform && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Platform:</span>
                  <span>{course.platform}</span>
                </div>
              )}
              {course.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.duration}</span>
                </div>
              )}
              {course.rating && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  <span>{course.rating}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No courses available yet</p>
        </div>
      )}
    </div>
  )
}

// Video Widget
export function VideoWidget({ 
  videos, 
  title, 
  subtitle, 
  maxItems = 3, 
  showViewAll = true,
  onViewAll 
}: VideoWidgetProps) {
  const displayedVideos = videos.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Play className="h-6 w-6 text-red-600" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayedVideos.map((video, index) => (
          <div
            key={video.id || index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => window.open(video.url, '_blank')}
          >
            <div className="relative flex-shrink-0">
              <div className="w-20 h-16 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-gray-400" />
              </div>
              {video.duration && (
                <div className="absolute bottom-1 right-1 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded">
                  {video.duration}
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                {video.title}
              </h4>
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {video.platform && <span>{video.platform}</span>}
                {video.views && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {video.views}
                  </div>
                )}
                {video.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    {video.rating}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {videos.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Play className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No videos available yet</p>
        </div>
      )}
    </div>
  )
}

// Article Widget
export function ArticleWidget({ 
  articles, 
  title, 
  subtitle, 
  maxItems = 4, 
  showViewAll = true,
  onViewAll 
}: ArticleWidgetProps) {
  const displayedArticles = articles.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-3">
        {displayedArticles.map((article, index) => (
          <div
            key={article.id || index}
            className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => window.open(article.url, '_blank')}
          >
            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
              {article.title}
            </h4>
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {article.platform && <span>{article.platform}</span>}
              {article.readTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </div>
              )}
              {article.date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {article.date}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No articles available yet</p>
        </div>
      )}
    </div>
  )
}

// Book Widget
export function BookWidget({ 
  books, 
  title, 
  subtitle, 
  maxItems = 3, 
  showViewAll = true,
  onViewAll 
}: BookWidgetProps) {
  const displayedBooks = books.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-green-600" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayedBooks.map((book, index) => (
          <div
            key={book.id || index}
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            onClick={() => window.open(book.url, '_blank')}
          >
            <div className="w-16 h-20 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-1">
                {book.title}
              </h4>
              {book.author && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  by {book.author}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {book.price && <span className="font-medium text-green-600">{book.price}</span>}
                {book.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    {book.rating}
                  </div>
                )}
                {book.format && <span>{book.format}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No books available yet</p>
        </div>
      )}
    </div>
  )
}

// Practice Problems Widget
export function PracticeWidget({ 
  problems, 
  title, 
  subtitle, 
  maxItems = 4, 
  showViewAll = true,
  onViewAll 
}: PracticeWidgetProps) {
  const displayedProblems = problems.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Code className="h-6 w-6 text-orange-600" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {displayedProblems.map((problem, index) => (
          <div
            key={problem.id || index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => window.open(problem.url, '_blank')}
          >
            <h4 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">
              {problem.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {problem.difficulty && (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                  problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {problem.difficulty}
                </span>
              )}
              {problem.platform && <span>{problem.platform}</span>}
            </div>
          </div>
        ))}
      </div>

      {problems.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Code className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No practice problems available yet</p>
        </div>
      )}
    </div>
  )
}

// Certification Widget
export function CertificationWidget({ 
  certifications, 
  title, 
  subtitle, 
  maxItems = 3, 
  showViewAll = true,
  onViewAll 
}: CertificationWidgetProps) {
  const displayedCertifications = certifications.slice(0, maxItems)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-600" />
            {title}
          </h3>
          {subtitle && (
            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{subtitle}</p>
          )}
        </div>
        {showViewAll && onViewAll && (
          <button
            onClick={onViewAll}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
          >
            View All <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="space-y-4">
        {displayedCertifications.map((cert, index) => (
          <div
            key={cert.id || index}
            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            onClick={() => window.open(cert.url, '_blank')}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                {cert.title}
              </h4>
              {cert.price && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-md text-xs font-medium">
                  {cert.price}
                </span>
              )}
            </div>
            
            <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
              {cert.platform && (
                <div className="flex items-center gap-1">
                  <span className="font-medium">Provider:</span>
                  <span>{cert.platform}</span>
                </div>
              )}
              {cert.duration && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{cert.duration}</span>
                </div>
              )}
              {cert.validity && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Valid for {cert.validity}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {certifications.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No certifications available yet</p>
        </div>
      )}
    </div>
  )
}

// Stats Widget
export function StatsWidget({ stats }: { stats: { label: string; value: string | number; icon: any; color: string }[] }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Learning Statistics</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="text-center">
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-2`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Featured Resources Widget
export function FeaturedResourcesWidget({ resources, title }: { resources: any[]; title: string }) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <div className="space-y-3">
        {resources.slice(0, 3).map((resource, index) => (
          <div
            key={resource.id || index}
            className="flex items-center gap-3 p-3 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-colors cursor-pointer"
            onClick={() => window.open(resource.url, '_blank')}
          >
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-sm line-clamp-1">{resource.title}</h4>
              <p className="text-xs text-blue-100 opacity-80">{resource.platform}</p>
            </div>
            <ExternalLink className="h-4 w-4 opacity-80" />
          </div>
        ))}
      </div>
    </div>
  )
}
