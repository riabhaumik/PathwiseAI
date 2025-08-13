'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navigation from '@/components/Navigation'
import Roadmap from '@/components/Roadmap'

interface CareerDetail {
  name: string
  description: string
  skills: string[]
  growth_rate?: string
  avg_salary?: string
  category?: string
}

function CareerDetailInner() {
  const params = useParams()
  const [career, setCareer] = useState<CareerDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const careerName = decodeURIComponent((params?.career as string) || '')

  useEffect(() => {
    const load = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
        const res = await fetch(`${baseUrl}/api/careers/${encodeURIComponent(careerName)}`)
        if (!res.ok) throw new Error('Failed to load career')
        const data = await res.json()
        setCareer({ name: careerName, description: data.description || '', skills: data.skills || [], growth_rate: data.growth_rate, avg_salary: data.avg_salary, category: data.category })
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load career')
      }
    }
    load()
  }, [careerName])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && <div className="text-red-600">{error}</div>}
        {career && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{career.name}</h1>
              <p className="text-gray-600 dark:text-gray-400">{career.description}</p>
            </div>
            <Roadmap careerName={career.name} />
          </div>
        )}
      </div>
    </div>
  )
}

export default function CareerDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <CareerDetailInner />
    </Suspense>
  )
}


