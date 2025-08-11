'use client'

import { useState } from 'react'
import { CheckCircle, Circle, Target, Trophy, Calendar, TrendingUp, Award, BookOpen, Users, Clock } from 'lucide-react'
import React from 'react'

interface Milestone {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
  category: 'learning' | 'skill' | 'project' | 'certification'
  progress: number
  priority: 'low' | 'medium' | 'high'
}

interface ProgressTrackerProps {
  careerPath: string
  milestones: Milestone[]
  overallProgress: number
  onMilestoneUpdate?: (milestoneId: string, completed: boolean) => void
}

export default function ProgressTracker({ 
  careerPath, 
  milestones, 
  overallProgress, 
  onMilestoneUpdate 
}: ProgressTrackerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'priority' | 'dueDate' | 'progress'>('priority')

  const categories = [
    { id: 'all', label: 'All', icon: Target, color: 'bg-blue-500' },
    { id: 'learning', label: 'Learning', icon: BookOpen, color: 'bg-green-500' },
    { id: 'skill', label: 'Skills', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'project', label: 'Projects', icon: Users, color: 'bg-orange-500' },
    { id: 'certification', label: 'Certifications', icon: Award, color: 'bg-red-500' }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 dark:text-red-400'
      case 'medium': return 'text-yellow-600 dark:text-yellow-400'
      case 'low': return 'text-green-600 dark:text-green-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴'
      case 'medium': return '🟡'
      case 'low': return '🟢'
      default: return '⚪'
    }
  }

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.icon : Target
  }

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category)
    return cat ? cat.color : 'bg-gray-500'
  }

  const filteredMilestones = milestones.filter(milestone => 
    selectedCategory === 'all' || milestone.category === selectedCategory
  )

  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case 'dueDate':
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case 'progress':
        return b.progress - a.progress
      default:
        return 0
    }
  })

  const completedMilestones = milestones.filter(m => m.completed).length
  const totalMilestones = milestones.length
  const upcomingMilestones = milestones.filter(m => !m.completed && m.dueDate).slice(0, 3)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Career Progress Tracker
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {careerPath} • {completedMilestones} of {totalMilestones} milestones completed
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {overallProgress}%
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Overall Progress</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </button>
        ))}
      </div>

      {/* Sort Options */}
      <div className="flex items-center gap-4 mb-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
        >
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="progress">Progress</option>
        </select>
      </div>

      {/* Milestones Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {sortedMilestones.map(milestone => (
          <div
            key={milestone.id}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
              milestone.completed
                ? 'border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            }`}
          >
            {/* Milestone Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-full ${getCategoryColor(milestone.category)}`}>
                  {React.createElement(getCategoryIcon(milestone.category), { 
                    className: 'h-4 w-4 text-white' 
                  })}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${
                    milestone.completed 
                      ? 'text-green-800 dark:text-green-200' 
                      : 'text-gray-900 dark:text-white'
                  }`}>
                    {milestone.title}
                  </h4>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs ${getPriorityColor(milestone.priority)}`}>
                      {getPriorityIcon(milestone.priority)} {milestone.priority}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => onMilestoneUpdate?.(milestone.id, !milestone.completed)}
                className={`p-1 rounded-full transition-colors ${
                  milestone.completed
                    ? 'text-green-600 hover:text-green-700'
                    : 'text-gray-400 hover:text-green-500'
                }`}
              >
                {milestone.completed ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <Circle className="h-5 w-5" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className={`text-xs mb-3 ${
              milestone.completed 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-gray-600 dark:text-gray-400'
            }`}>
              {milestone.description}
            </p>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">Progress</span>
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                  {milestone.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    milestone.completed 
                      ? 'bg-green-500' 
                      : 'bg-blue-500'
                  }`}
                  style={{ width: `${milestone.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Due Date */}
            {milestone.dueDate && (
              <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Calendar className="h-3 w-3" />
                Due: {new Date(milestone.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
            {completedMilestones}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {totalMilestones - completedMilestones}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Remaining</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {upcomingMilestones.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming</div>
        </div>
      </div>

      {/* Upcoming Milestones */}
      {upcomingMilestones.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Upcoming Deadlines
          </h4>
          <div className="space-y-2">
            {upcomingMilestones.map(milestone => (
              <div key={milestone.id} className="flex items-center justify-between text-sm">
                <span className="text-blue-700 dark:text-blue-300">{milestone.title}</span>
                <span className="text-blue-600 dark:text-blue-400 font-medium">
                  {new Date(milestone.dueDate!).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 