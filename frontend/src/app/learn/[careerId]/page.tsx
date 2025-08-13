'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Navigation from '@/components/Navigation'
import Roadmap from '@/components/Roadmap'

function LearnCareerInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [level, setLevel] = useState('beginner')
  const careerId = decodeURIComponent((params?.careerId as string) || '')

  useEffect(() => {
    const lvl = searchParams.get('level')
    if (lvl) setLevel(lvl)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Roadmap careerName={careerId} userLevel={level} />
      </div>
    </div>
  )
}

export default function LearnCareerPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <LearnCareerInner />
    </Suspense>
  )
}


