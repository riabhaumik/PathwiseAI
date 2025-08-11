'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, X, TrendingUp, DollarSign, Target, MapPin, Star } from 'lucide-react'

export interface FilterState {
  search: string
  category: string
  salaryRange: string
  growthRate: string
  skills: string[]
  experienceLevel: string
  location: string
  sortBy: string
}

interface CareerFilterProps {
  onFilterChange: (filters: FilterState) => void
  categories: string[]
  careers: any[]
}

export default function CareerFilter({ onFilterChange, categories, careers }: CareerFilterProps) {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    category: 'all',
    salaryRange: 'all',
    growthRate: 'all',
    skills: [],
    experienceLevel: 'all',
    location: 'all',
    sortBy: 'name'
  })

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [availableSkills, setAvailableSkills] = useState<string[]>([])

  // Extract unique skills from careers
  useEffect(() => {
    const skills = new Set<string>()
    careers.forEach(career => {
      if (career.skills) {
        career.skills.forEach((skill: string) => skills.add(skill))
      }
    })
    setAvailableSkills(Array.from(skills).sort())
  }, [careers])

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const clearedFilters: FilterState = {
      search: '',
      category: 'all',
      salaryRange: 'all',
      growthRate: 'all',
      skills: [],
      experienceLevel: 'all',
      location: 'all',
      sortBy: 'name'
    }
    setFilters(clearedFilters)
    onFilterChange(clearedFilters)
  }

  const toggleSkill = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill]
    handleFilterChange('skills', newSkills)
  }

  const salaryRanges = [
    { value: 'all', label: 'All Salaries' },
    { value: '0-50k', label: 'Under $50K' },
    { value: '50k-80k', label: '$50K - $80K' },
    { value: '80k-120k', label: '$80K - $120K' },
    { value: '120k-200k', label: '$120K - $200K' },
    { value: '200k+', label: '$200K+' }
  ]

  const growthRates = [
    { value: 'all', label: 'All Growth Rates' },
    { value: 'high', label: 'High Growth (20%+)' },
    { value: 'medium', label: 'Medium Growth (10-20%)' },
    { value: 'low', label: 'Low Growth (<10%)' }
  ]

  const experienceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'lead', label: 'Lead/Management' }
  ]

  const sortOptions = [
    { value: 'name', label: 'Name A-Z' },
    { value: 'salary', label: 'Salary High-Low' },
    { value: 'growth', label: 'Growth Rate' },
    { value: 'demand', label: 'Demand Level' }
  ]

  const activeFiltersCount = Object.values(filters).filter(value => 
    value !== 'all' && value !== '' && (Array.isArray(value) ? value.length > 0 : true)
  ).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
      {/* Basic Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search careers by name, skills, or description..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[200px]"
        >
          <option value="all">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>

        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            showAdvancedFilters 
              ? 'bg-blue-600 text-white hover:bg-blue-700' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Filter className="h-4 w-4" />
          Advanced Filters
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-6">
          {/* Salary and Growth Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <DollarSign className="inline h-4 w-4 mr-1" />
                Salary Range
              </label>
              <select
                value={filters.salaryRange}
                onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {salaryRanges.map(range => (
                  <option key={range.value} value={range.value}>{range.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <TrendingUp className="inline h-4 w-4 mr-1" />
                Growth Rate
              </label>
              <select
                value={filters.growthRate}
                onChange={(e) => handleFilterChange('growthRate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {growthRates.map(rate => (
                  <option key={rate.value} value={rate.value}>{rate.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Target className="inline h-4 w-4 mr-1" />
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                {experienceLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Locations</option>
                <option value="remote">Remote</option>
                <option value="onsite">On-site</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Skills Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              <Star className="inline h-4 w-4 mr-1" />
              Required Skills
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableSkills.map(skill => (
                <button
                  key={skill}
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    filters.skills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex justify-end">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center gap-2">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:text-blue-600 dark:hover:text-blue-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            
            {filters.category !== 'all' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm flex items-center gap-2">
                Category: {filters.category}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="hover:text-green-600 dark:hover:text-green-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {filters.skills.map(skill => (
              <span key={skill} className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm flex items-center gap-2">
                Skill: {skill}
                <button
                  onClick={() => toggleSkill(skill)}
                  className="hover:text-purple-600 dark:hover:text-purple-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 