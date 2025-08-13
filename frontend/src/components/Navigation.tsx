'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Brain, Menu, X, Target, BookOpen, Briefcase, Calculator, Code, Home, Map } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import { useAuth } from '../lib/auth-context'

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { user } = useAuth()

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Careers', href: '/careers', icon: Target },
    { name: 'Roadmaps', href: '/roadmap', icon: Map },
    { name: 'Resources', href: '/resources', icon: BookOpen },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Practice', href: '/practice', icon: Code },
    { name: 'Math', href: '/math', icon: Calculator },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative">
                <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 animate-ping"></div>
              </div>
              <h1 className="text-xl font-bold gradient-text">Pathwise AI™</h1>
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Welcome back!
                </span>
                <button
                  onClick={() => router.push('/login')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={() => router.push('/login')}
                  className="bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-lg font-medium border border-blue-200 dark:border-blue-800 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/signup')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    router.push(item.href)
                    setIsMenuOpen(false)
                  }}
                  className={`flex items-center space-x-3 w-full px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </button>
              ))}
              
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400 px-3">
                      Welcome back!
                    </p>
                    <button
                      onClick={() => {
                        router.push('/login')
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        router.push('/login')
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900 text-blue-600 dark:text-blue-400 px-3 py-2 rounded-lg font-medium border border-blue-200 dark:border-blue-800 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        router.push('/signup')
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-medium transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
