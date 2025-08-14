'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { 
  Brain, BookOpen, Target, TrendingUp, Users, Award, ArrowRight, 
  Code, Database, Cpu, Globe, Zap, Heart, Share2, Eye, Clock,
  Play, CheckCircle, XCircle, Timer, Star, Calculator, BarChart3,
  Lightbulb, MessageSquare, Settings, Rocket, Shield, 
  Layers, GitBranch, Cloud, Smartphone, Gamepad2, ExternalLink
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
  careers?: string[]
  language?: string
  testcases?: any[]
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

interface InterviewPrepData {
  title: string
  description: string
  careers: {
    [key: string]: {
      description: string
      categories: {
        [key: string]: {
          description: string
          questions: Array<{
            question: string
            difficulty?: string
            category: string
            hint?: string
            solution_approach?: string
            time_complexity?: string
            space_complexity?: string
            star_method?: {
              situation: string
              task: string
              action: string
              result: string
            }
            key_points?: string[]
            follow_up?: string
            scale_considerations?: string
            best_practice?: string
          }>
          resources: {
            [key: string]: string
          }
        }
      }
    }
  }
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
  const [loading, setLoading] = useState(true)
  const [showInterviewPrep, setShowInterviewPrep] = useState(false)
  const [interviewPrepData, setInterviewPrepData] = useState<InterviewPrepData | null>(null)
  const [selectedCareer, setSelectedCareer] = useState<string>('')
  const [selectedPrepCategory, setSelectedPrepCategory] = useState<string>('')

  const [categories, setCategories] = useState<PracticeCategory[]>([])
  const [mathRefs, setMathRefs] = useState<{ level: string, links: { title: string, url: string }[] }[]>([])

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true)
        
        // Try to load from backend API first
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        console.log('Attempting to fetch practice problems from:', `${baseUrl}/api/practice/problems`)
        
        const params = new URLSearchParams()
        if (careerParam) params.append('career', decodeURIComponent(careerParam))
        
        const res = await fetch(`${baseUrl}/api/practice/problems?${params}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(5000)
        })
        
        if (res.ok) {
          const data = await res.json()
          console.log('Backend practice response:', data)
          
          const mapped: PracticeCategory[] = (data.categories || []).map((c: any) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            icon: getCategoryIcon(c.id),
            problems: c.problems || [],
            totalProblems: c.totalProblems || (c.problems || []).length,
            completedProblems: c.completedProblems || 0,
          }))
          
          if (mapped.length > 0) {
            setCategories(mapped)
            setLoading(false)
            return
          }
        }
        
        // Fallback to comprehensive practice problems
        console.log('Using enhanced fallback practice problems...')
        const fallbackCategories: PracticeCategory[] = [
          {
            id: 'coding',
            name: 'Coding Challenges',
            description: 'Practice coding problems and algorithms',
            icon: Code,
            problems: [
              {
                id: 'two-sum',
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                difficulty: 'Easy',
                category: 'Arrays',
                timeLimit: 15,
                points: 100,
                completed: false,
                code: 'def two_sum(nums, target):\n    # Your solution here\n    pass',
                solution: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []',
                careers: ['Software Engineer', 'Data Scientist', 'AI Engineer']
              },
              {
                id: 'reverse-string',
                title: 'Reverse String',
                description: 'Write a function that reverses a string. The input string is given as an array of characters.',
                difficulty: 'Easy',
                category: 'Strings',
                timeLimit: 10,
                points: 80,
                completed: false,
                code: 'def reverse_string(s):\n    # Your solution here\n    pass',
                solution: 'def reverse_string(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        s[left], s[right] = s[right], s[left]\n        left += 1\n        right -= 1',
                careers: ['Software Engineer', 'DevOps Engineer']
              },
              {
                id: 'valid-palindrome',
                title: 'Valid Palindrome',
                description: 'Given a string s, return true if it is a palindrome, or false otherwise.',
                difficulty: 'Easy',
                category: 'Strings',
                timeLimit: 12,
                points: 90,
                completed: false,
                code: 'def is_palindrome(s):\n    # Your solution here\n    pass',
                solution: 'def is_palindrome(s):\n    s = "".join(c.lower() for c in s if c.isalnum())\n    return s == s[::-1]',
                careers: ['Software Engineer', 'Data Scientist']
              },
              {
                id: 'binary-search',
                title: 'Binary Search',
                description: 'Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums.',
                difficulty: 'Medium',
                category: 'Search',
                timeLimit: 20,
                points: 150,
                completed: false,
                code: 'def binary_search(nums, target):\n    # Your solution here\n    pass',
                solution: 'def binary_search(nums, target):\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1',
                careers: ['Software Engineer', 'AI Engineer', 'Data Scientist']
              },
              {
                id: 'linked-list-cycle',
                title: 'Linked List Cycle',
                description: 'Given head, the head of a linked list, determine if the linked list has a cycle in it.',
                difficulty: 'Medium',
                category: 'Linked Lists',
                timeLimit: 25,
                points: 180,
                completed: false,
                code: 'def has_cycle(head):\n    # Your solution here\n    pass',
                solution: 'def has_cycle(head):\n    if not head or not head.next:\n        return False\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow == fast:\n            return True\n    return False',
                careers: ['Software Engineer', 'DevOps Engineer']
              },
              {
                id: 'merge-sorted-arrays',
                title: 'Merge Sorted Arrays',
                description: 'Merge two sorted arrays into one sorted array efficiently.',
                difficulty: 'Medium',
                category: 'Arrays',
                timeLimit: 20,
                points: 150,
                completed: false,
                code: 'def merge(nums1, m, nums2, n):\n    # Your solution here\n    pass',
                solution: 'def merge(nums1, m, nums2, n):\n    i, j, k = m - 1, n - 1, m + n - 1\n    while j >= 0:\n        if i >= 0 and nums1[i] > nums2[j]:\n            nums1[k] = nums1[i]\n            i -= 1\n        else:\n            nums1[k] = nums2[j]\n            j -= 1\n        k -= 1',
                careers: ['Software Engineer', 'Data Scientist']
              },
              {
                id: 'max-subarray',
                title: 'Maximum Subarray (Kadane\'s Algorithm)',
                description: 'Find the contiguous subarray with the largest sum and return its sum.',
                difficulty: 'Medium',
                category: 'Dynamic Programming',
                timeLimit: 30,
                points: 200,
                completed: false,
                code: 'def max_subarray(nums):\n    # Your solution here\n    pass',
                solution: 'def max_subarray(nums):\n    max_sum = current_sum = nums[0]\n    for num in nums[1:]:\n        current_sum = max(num, current_sum + num)\n        max_sum = max(max_sum, current_sum)\n    return max_sum',
                careers: ['Software Engineer', 'AI Engineer', 'Data Scientist']
              }
            ],
            totalProblems: 7,
            completedProblems: 0
          },
          {
            id: 'system-design',
            name: 'System Design',
            description: 'Practice system design and architecture problems',
            icon: Database,
            problems: [
              {
                id: 'url-shortener',
                title: 'Design URL Shortener',
                description: 'Design a URL shortening service like TinyURL or Bitly. Consider scalability, storage, and URL generation.',
                difficulty: 'Medium',
                category: 'System Design',
                timeLimit: 45,
                points: 300,
                completed: false,
                solution: 'Key components:\n1. URL shortening algorithm (hash-based)\n2. Database for URL mappings\n3. Rate limiting\n4. Analytics tracking\n5. Caching layer (Redis)\n6. Load balancer\n7. CDN for global distribution',
                careers: ['Software Engineer', 'DevOps Engineer', 'System Architect']
              },
              {
                id: 'chat-system',
                title: 'Design Chat System',
                description: 'Design a real-time chat system like WhatsApp or Slack. Consider message delivery, online presence, and push notifications.',
                difficulty: 'Hard',
                category: 'System Design',
                timeLimit: 60,
                points: 400,
                completed: false,
                solution: 'Key components:\n1. WebSocket connections for real-time\n2. Message queue (Kafka/RabbitMQ)\n3. Database for message history\n4. Push notifications\n5. File sharing service\n6. User presence tracking\n7. Message encryption',
                careers: ['Software Engineer', 'DevOps Engineer', 'System Architect']
              },
              {
                id: 'recommendation-system',
                title: 'Design Recommendation System',
                description: 'Design a recommendation system for an e-commerce platform. Discuss collaborative filtering, content-based filtering, and scalability.',
                difficulty: 'Hard',
                category: 'System Design',
                timeLimit: 50,
                points: 350,
                completed: false,
                solution: 'Key components:\n1. Data collection and preprocessing\n2. Feature engineering\n3. Model training pipeline\n4. Real-time serving layer\n5. A/B testing framework\n6. Monitoring and feedback loop\n7. Scalable infrastructure',
                careers: ['Data Scientist', 'AI Engineer', 'Software Engineer', 'ML Engineer']
              },
              {
                id: 'data-pipeline',
                title: 'Design Data Processing Pipeline',
                description: 'Design a real-time data processing pipeline for analytics. Consider data ingestion, processing, storage, and monitoring.',
                difficulty: 'Medium',
                category: 'System Design',
                timeLimit: 40,
                points: 250,
                completed: false,
                solution: 'Key components:\n1. Data ingestion (Kafka/Pulsar)\n2. Stream processing (Spark/Flink)\n3. Data storage (Data Lake/Warehouse)\n4. Real-time analytics\n5. Monitoring and alerting\n6. Data quality checks\n7. Backup and recovery',
                careers: ['Data Engineer', 'DevOps Engineer', 'Data Scientist']
              }
            ],
            totalProblems: 4,
            completedProblems: 0
          },
          {
            id: 'behavioral',
            name: 'Behavioral Questions',
            description: 'Practice common behavioral interview questions',
            icon: Users,
            problems: [
              {
                id: 'leadership',
                title: 'Leadership Experience',
                description: 'Tell me about a time when you had to lead a team through a difficult situation.',
                difficulty: 'Medium',
                category: 'Behavioral',
                timeLimit: 30,
                points: 200,
                completed: false,
                solution: 'Use STAR method:\n- Situation: Describe the context\n- Task: Explain your responsibility\n- Action: Detail what you did\n- Result: Share the outcome and lessons learned',
                careers: ['Software Engineer', 'Product Manager', 'Data Scientist', 'Team Lead']
              },
              {
                id: 'conflict',
                title: 'Conflict Resolution',
                description: 'Describe a situation where you had a conflict with a colleague and how you resolved it.',
                difficulty: 'Medium',
                category: 'Behavioral',
                timeLimit: 25,
                points: 180,
                completed: false,
                solution: 'Focus on:\n- Understanding the other person\'s perspective\n- Finding common ground\n- Compromising when possible\n- Learning from the experience',
                careers: ['Software Engineer', 'Product Manager', 'Data Scientist', 'DevOps Engineer']
              },
              {
                id: 'technical-decision',
                title: 'Technical Decision Making',
                description: 'Explain a difficult technical decision you made and the trade-offs you considered.',
                difficulty: 'Hard',
                category: 'Behavioral',
                timeLimit: 35,
                points: 250,
                completed: false,
                solution: 'Structure your response:\n- Context and problem\n- Available options\n- Trade-offs considered\n- Decision criteria\n- Outcome and lessons',
                careers: ['Software Engineer', 'DevOps Engineer', 'AI Engineer', 'System Architect']
              },
              {
                id: 'failure-learning',
                title: 'Failure and Learning',
                description: 'Tell me about a time you failed and what you learned from it.',
                difficulty: 'Medium',
                category: 'Behavioral',
                timeLimit: 30,
                points: 200,
                completed: false,
                solution: 'Key points:\n- Honest description of failure\n- What you learned\n- How you applied lessons\n- Growth mindset\n- Future prevention',
                careers: ['Software Engineer', 'Product Manager', 'Data Scientist', 'AI Engineer']
              },
              {
                id: 'innovation',
                title: 'Innovation and Creativity',
                description: 'Describe a time when you had to think outside the box to solve a problem.',
                difficulty: 'Medium',
                category: 'Behavioral',
                timeLimit: 25,
                points: 180,
                completed: false,
                solution: 'Structure:\n- Problem description\n- Conventional approaches tried\n- Creative solution developed\n- Implementation process\n- Results and impact',
                careers: ['Software Engineer', 'Product Manager', 'Data Scientist', 'AI Engineer', 'Innovation Lead']
              }
            ],
            totalProblems: 5,
            completedProblems: 0
          },
          {
            id: 'mathematics',
            name: 'Mathematics & Statistics',
            description: 'Mathematical concepts essential for STEM careers',
            icon: Calculator,
            problems: [
              {
                id: 'linear-algebra',
                title: 'Matrix Operations',
                description: 'Implement matrix multiplication and verify dimension compatibility.',
                difficulty: 'Medium',
                category: 'Linear Algebra',
                timeLimit: 25,
                points: 200,
                completed: false,
                solution: 'Key concepts:\n- Matrix dimensions (m×n × n×p = m×p)\n- Element-wise multiplication and summation\n- Time complexity: O(mnp)\n- Space complexity: O(mp)',
                careers: ['Data Scientist', 'AI Engineer', 'ML Engineer', 'Quantitative Analyst']
              },
              {
                id: 'statistics',
                title: 'Hypothesis Testing',
                description: 'Design and conduct a t-test to determine if two sample means are significantly different.',
                difficulty: 'Medium',
                category: 'Statistics',
                timeLimit: 30,
                points: 250,
                completed: false,
                solution: 'Steps:\n1. State null and alternative hypotheses\n2. Choose significance level (α)\n3. Calculate test statistic\n4. Determine critical value\n5. Make decision\n6. Interpret results',
                careers: ['Data Scientist', 'Product Manager', 'Research Analyst', 'ML Engineer']
              },
              {
                id: 'calculus',
                title: 'Gradient Descent',
                description: 'Implement gradient descent algorithm to minimize a quadratic function.',
                difficulty: 'Hard',
                category: 'Calculus & Optimization',
                timeLimit: 35,
                points: 300,
                completed: false,
                solution: 'Algorithm:\n1. Initialize parameters\n2. Calculate gradients\n3. Update parameters: θ = θ - α∇J(θ)\n4. Repeat until convergence\n5. Monitor learning rate',
                careers: ['AI Engineer', 'Data Scientist', 'ML Engineer', 'Research Scientist']
              },
              {
                id: 'probability',
                title: 'Bayes\' Theorem',
                description: 'Apply Bayes\' theorem to solve a real-world classification problem.',
                difficulty: 'Medium',
                category: 'Probability',
                timeLimit: 20,
                points: 200,
                completed: false,
                solution: 'Formula: P(A|B) = P(B|A)P(A)/P(B)\n- Prior probability P(A)\n- Likelihood P(B|A)\n- Evidence P(B)\n- Posterior probability P(A|B)',
                careers: ['Data Scientist', 'AI Engineer', 'ML Engineer', 'Quantitative Analyst']
              }
            ],
            totalProblems: 4,
            completedProblems: 0
          }
        ]
        
        setCategories(fallbackCategories)
        
        // Enhanced math references per level
        setMathRefs([
          {
            level: 'Beginner',
            links: [
              { title: 'Khan Academy Algebra I', url: 'https://www.khanacademy.org/math/algebra' },
              { title: 'Coursera: Precalculus', url: 'https://www.coursera.org/learn/precalculus' },
              { title: 'edX: College Algebra', url: 'https://www.edx.org/course/college-algebra' },
              { title: 'MIT OCW: 18.01 Calculus', url: 'https://ocw.mit.edu/courses/mathematics/18-01sc-single-variable-calculus-fall-2010/' }
            ]
          },
          {
            level: 'Intermediate',
            links: [
              { title: 'MIT OCW: 18.06 Linear Algebra', url: 'https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/' },
              { title: 'Khan: Probability & Statistics', url: 'https://www.khanacademy.org/math/statistics-probability' },
              { title: 'Coursera: Calculus I', url: 'https://www.coursera.org/learn/calculus1' },
              { title: 'Stanford: CS229 Machine Learning', url: 'https://cs229.stanford.edu/' }
            ]
          },
          {
            level: 'Advanced',
            links: [
              { title: 'edX: Probability (MITx 6.431x)', url: 'https://www.edx.org/course/introduction-to-probability' },
              { title: 'Stanford: Convex Optimization', url: 'https://web.stanford.edu/~boyd/cvxbook/' },
              { title: '3Blue1Brown: Linear Algebra', url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab' },
              { title: 'MIT: 6.042 Discrete Mathematics', url: 'https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-spring-2015/' }
            ]
          }
        ])
        
      } catch (e) {
        console.error('Error loading practice problems:', e)
        // Use the same fallback data
        const fallbackCategories: PracticeCategory[] = [
          {
            id: 'coding',
            name: 'Coding Challenges',
            description: 'Practice coding problems and algorithms',
            icon: Code,
            problems: [
              {
                id: 'two-sum',
                title: 'Two Sum',
                description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
                difficulty: 'Easy',
                category: 'Arrays',
                timeLimit: 15,
                points: 100,
                completed: false,
                code: 'def two_sum(nums, target):\n    # Your solution here\n    pass',
                solution: 'def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []'
              }
            ],
            totalProblems: 1,
            completedProblems: 0
          }
        ]
        setCategories(fallbackCategories)
      } finally {
        setLoading(false)
      }
    }

    const fetchInterviewPrep = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const response = await fetch(`${baseUrl}/api/interview-prep`)
        
        if (response.ok) {
          const data = await response.json()
          setInterviewPrepData(data.interview_preparation)
          
          // Set default career if available
          if (data.interview_preparation?.careers) {
            const careerKeys = Object.keys(data.interview_preparation.careers)
            if (careerKeys.length > 0) {
              setSelectedCareer(careerKeys[0])
              const categoryKeys = Object.keys(data.interview_preparation.careers[careerKeys[0]].categories)
              if (categoryKeys.length > 0) {
                setSelectedPrepCategory(categoryKeys[0])
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching interview prep data:', error)
      }
    }

    fetchProblems()
    fetchInterviewPrep()
  }, [careerParam])

  const getCategoryIcon = (categoryId: string) => {
    const iconMap: { [key: string]: any } = {
      'coding': Code,
      'system-design': Database,
      'behavioral': Users,
      'mathematics': Calculator
    }
    return iconMap[categoryId] || Code
  }

  const startProblem = (problem: PracticeProblem) => {
    setCurrentProblem(problem)
    setUserCode(problem.code || '')
    setTimeLeft(problem.timeLimit * 60)
    setIsRunning(true)
    setShowSolution(false)
  }

  const runCode = () => {
    setIsRunning(true)
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    fetch(`${baseUrl}/api/practice/run-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language: 'python', code: userCode, testcases: [] })
    }).then(() => {
      setIsRunning(false)
      alert('Code executed!')
    }).catch(() => setIsRunning(false))
  }

  const submitSolution = () => {
    if (currentProblem) {
      const updatedProblem = { ...currentProblem, completed: true }
      setCurrentProblem(updatedProblem)
      setIsRunning(false)
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const email = typeof window !== 'undefined' ? localStorage.getItem('user_email') : null
        fetch(`${baseUrl}/api/practice/save-progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, problem_id: currentProblem.id, completed: true, career: careerParam ? decodeURIComponent(careerParam) : undefined })
        })
      } catch {}
      alert('Solution submitted successfully!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading practice problems...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <Navigation />

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Practice & <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Interview Prep</span>
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
            
            {/* Interview Prep Toggle */}
            <div className="mt-6">
              <button
                onClick={() => setShowInterviewPrep(!showInterviewPrep)}
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <MessageSquare className="h-5 w-5" />
                {showInterviewPrep ? 'Hide' : 'Show'} Interview Prep Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Interview Prep Section */}
      {showInterviewPrep && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
              🎯 Career-Specific Interview Preparation
            </h2>
            
            {interviewPrepData ? (
              <div className="space-y-8">
                {/* Career Selection */}
                <div className="flex flex-wrap gap-3 justify-center">
                  {Object.keys(interviewPrepData.careers).map((career) => (
                    <button
                      key={career}
                      onClick={() => {
                        setSelectedCareer(career)
                        const categoryKeys = Object.keys(interviewPrepData.careers[career].categories)
                        if (categoryKeys.length > 0) {
                          setSelectedPrepCategory(categoryKeys[0])
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedCareer === career
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {career}
                    </button>
                  ))}
                </div>

                {/* Category Selection */}
                {selectedCareer && (
                  <div className="flex flex-wrap gap-3 justify-center">
                    {Object.keys(interviewPrepData.careers[selectedCareer].categories).map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedPrepCategory(category)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedPrepCategory === category
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                )}

                {/* Questions and Resources */}
                {selectedCareer && selectedPrepCategory && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Questions */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        {selectedPrepCategory} Questions
                      </h3>
                      <div className="space-y-4 max-h-96 overflow-y-auto">
                        {interviewPrepData.careers[selectedCareer].categories[selectedPrepCategory].questions.map((q, idx) => (
                          <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {q.question}
                            </h4>
                            {q.difficulty && (
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                                q.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                                q.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {q.difficulty}
                              </span>
                            )}
                            {q.hint && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <strong>Hint:</strong> {q.hint}
                              </div>
                            )}
                            {q.solution_approach && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                <strong>Approach:</strong> {q.solution_approach}
                              </div>
                            )}
                            {q.star_method && (
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                <div className="font-medium mb-1">STAR Method:</div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div><strong>S:</strong> {q.star_method.situation}</div>
                                  <div><strong>T:</strong> {q.star_method.task}</div>
                                  <div><strong>A:</strong> {q.star_method.action}</div>
                                  <div><strong>R:</strong> {q.star_method.result}</div>
                                </div>
                              </div>
                            )}
                            {q.key_points && (
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                <strong>Key Points:</strong>
                                <ul className="list-disc list-inside mt-1">
                                  {q.key_points.map((point, pIdx) => (
                                    <li key={pIdx}>{point}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Resources */}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Learning Resources
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(interviewPrepData.careers[selectedCareer].categories[selectedPrepCategory].resources).map(([title, url]) => (
                          <a
                            key={title}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                          >
                            <ExternalLink className="h-5 w-5 text-blue-600" />
                            <span className="text-blue-800 dark:text-blue-200 font-medium">{title}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                Loading interview preparation data...
              </div>
            )}
          </div>
        </section>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {!currentProblem ? (
          <div className="space-y-8">
            {/* Category Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                          
                          {/* Career Tags */}
                          {problem.careers && problem.careers.length > 0 && (
                            <div className="mt-3">
                              <div className="flex flex-wrap gap-2">
                                {problem.careers.map((career, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs"
                                  >
                                    {career}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
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
            {/* Quick Math References */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Math References</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mathRefs.map(ref => (
                  <div key={ref.level} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="mb-2 text-sm font-medium">{ref.level}</div>
                    <ul className="space-y-1 text-sm">
                      {ref.links.map(l => (
                        <li key={l.url}>
                          <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">
                            {l.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            
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