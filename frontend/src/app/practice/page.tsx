'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { 
  Brain, BookOpen, Target, TrendingUp, Users, Award, ArrowRight, 
  Code, Database, Cpu, Globe, Zap, Heart, Share2, Eye, Clock,
  Play, CheckCircle, XCircle, Timer, Star
} from 'lucide-react'
import Navigation from '@/components/Navigation'

interface PracticeProblem {
  id: string
  title: string
  description: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  category: string
  timeLimit: number
  points: number
  completed: boolean
  code?: string
  solution?: string
}

interface PracticeCategory {
  id: string
  name: string
  description: string
  icon: any
  problems: PracticeProblem[]
  totalProblems: number
  completedProblems: number
}

function PracticePageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const careerParam = searchParams.get('career')
  
  const [selectedCategory, setSelectedCategory] = useState<string>('coding')
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem | null>(null)
  const [userCode, setUserCode] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const [categories, setCategories] = useState<PracticeCategory[]>([])

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const params = new URLSearchParams()
        if (careerParam) params.append('career', decodeURIComponent(careerParam))
        const res = await fetch(`${baseUrl}/api/practice/problems?${params}`)
        if (res.ok) {
          const data = await res.json()
          const mapped: PracticeCategory[] = (data.categories || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            icon: c.id === 'coding' ? Code : c.id === 'system-design' ? Database : Users,
            problems: c.problems || [],
            totalProblems: c.totalProblems || (c.problems || []).length,
            completedProblems: c.completedProblems || 0,
          }))
          setCategories(mapped)
        }
      } catch (e) {
        setCategories([])
      }
    }
    fetchProblems()
  }, [careerParam])

  const startProblem = (problem: PracticeProblem) => {
    setCurrentProblem(problem)
    setUserCode(problem.code || '')
    setTimeLeft(problem.timeLimit * 60)
    setIsRunning(true)
    setShowSolution(false)
  }

  const runCode = () => {
    // Simulate code execution
    setIsRunning(false)
    // In a real app, this would send code to a backend for execution
    alert('Code executed! Check the output below.')
  }

  const submitSolution = () => {
    if (currentProblem) {
      // Mark as completed
      const updatedProblem = { ...currentProblem, completed: true }
      setCurrentProblem(updatedProblem)
      setIsRunning(false)
      alert('Solution submitted successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Practice & <span className="gradient-text">Interview Prep</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Master technical interviews and coding challenges with our comprehensive practice platform.
            </p>
            {careerParam && (
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-4 py-2 rounded-full text-lg">
                <Target className="h-5 w-5" />
                Practicing for: {decodeURIComponent(careerParam)}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {!currentProblem ? (
          <div className="space-y-8">
            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer ${
                    selectedCategory === category.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="flex items-center mb-4">
                    <category.icon className="h-8 w-8 text-blue-600 mr-3" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {category.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {category.completedProblems}/{category.totalProblems} completed
                    </span>
                    <div className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                      <div 
                        className="h-2 bg-blue-600 rounded-full"
                        style={{ width: `${(category.completedProblems / category.totalProblems) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Problems List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                   {categories.find(c => c.id === selectedCategory)?.name || 'Problems'}
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {categories
                  .find(c => c.id === selectedCategory)
                  ?.problems.map((problem) => (
                    <div
                      key={problem.id}
                      className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {problem.title}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              problem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                              problem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {problem.difficulty}
                            </span>
                            {problem.completed && (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            )}
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 mb-3">
                            {problem.description}
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Timer className="h-4 w-4" />
                              {problem.timeLimit} min
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="h-4 w-4" />
                              {problem.points} points
                            </span>
                            <span className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4" />
                              {problem.category}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => startProblem(problem)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          {problem.completed ? 'Review' : 'Start'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Problem Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentProblem.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      currentProblem.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      currentProblem.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {currentProblem.difficulty}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {currentProblem.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {timeLeft > 0 ? `${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}` : 'Time\'s up!'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentProblem(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {currentProblem.description}
              </p>
            </div>

            {/* Code Editor */}
            {currentProblem.code && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Solution</h3>
                </div>
                <div className="p-6">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full h-64 p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                    placeholder="Write your code here..."
                  />
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={runCode}
                      disabled={isRunning}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                    <button
                      onClick={submitSolution}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Submit Solution
                    </button>
                    <button
                      onClick={() => setShowSolution(!showSolution)}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {showSolution ? 'Hide' : 'Show'} Solution
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Solution */}
            {showSolution && currentProblem.solution && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Solution</h3>
                </div>
                <div className="p-6">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-gray-800 dark:text-gray-200">
                      {currentProblem.solution}
                    </code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
} 

export default function PracticePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <PracticePageInner />
    </Suspense>
  )
}