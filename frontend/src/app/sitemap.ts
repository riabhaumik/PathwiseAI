import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pathwiseai.com'
  const currentDate = new Date().toISOString()

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/careers`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/practice`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roadmap`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/learn`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/math`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified: currentDate,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: currentDate,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
  ]

  // Dynamic career paths (you can expand this based on your data)
  const careerPaths = [
    'software-engineer',
    'data-scientist',
    'machine-learning-engineer',
    'cybersecurity-analyst',
    'data-engineer',
    'devops-engineer',
    'frontend-developer',
    'backend-developer',
    'full-stack-developer',
    'product-manager',
    'ui-ux-designer',
    'qa-engineer',
    'system-administrator',
    'network-engineer',
    'cloud-architect',
    'blockchain-developer',
    'mobile-developer',
    'game-developer',
    'embedded-systems-engineer',
    'robotics-engineer'
  ]

  const careerPages = careerPaths.map(career => ({
    url: `${baseUrl}/careers/${career}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Learning modules (you can expand this based on your data)
  const learningModules = [
    'programming-fundamentals',
    'data-structures-algorithms',
    'web-development',
    'mobile-development',
    'database-design',
    'system-design',
    'machine-learning-basics',
    'cybersecurity-fundamentals',
    'cloud-computing',
    'devops-practices',
    'agile-methodology',
    'version-control',
    'testing-strategies',
    'performance-optimization',
    'security-best-practices'
  ]

  const learningPages = learningModules.map(module => ({
    url: `${baseUrl}/learn/${module}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Practice categories
  const practiceCategories = [
    'coding-challenges',
    'system-design',
    'behavioral-questions',
    'mathematics',
    'algorithms',
    'data-structures',
    'database-questions',
    'frontend-questions',
    'backend-questions',
    'devops-questions'
  ]

  const practicePages = practiceCategories.map(category => ({
    url: `${baseUrl}/practice/${category}`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Resource categories
  const resourceCategories = [
    'books',
    'online-courses',
    'tutorials',
    'documentation',
    'tools',
    'communities',
    'newsletters',
    'podcasts',
    'youtube-channels',
    'blogs'
  ]

  const resourcePages = resourceCategories.map(category => ({
    url: `${baseUrl}/resources/${category}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Job categories
  const jobCategories = [
    'remote',
    'full-time',
    'part-time',
    'internship',
    'contract',
    'freelance',
    'entry-level',
    'mid-level',
    'senior',
    'lead',
    'manager',
    'director',
    'executive'
  ]

  const jobPages = jobCategories.map(category => ({
    url: `${baseUrl}/jobs/${category}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Math topics
  const mathTopics = [
    'algebra',
    'calculus',
    'statistics',
    'linear-algebra',
    'discrete-mathematics',
    'number-theory',
    'geometry',
    'trigonometry',
    'probability',
    'combinatorics'
  ]

  const mathPages = mathTopics.map(topic => ({
    url: `${baseUrl}/math/${topic}`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // Combine all pages
  const allPages = [
    ...staticPages,
    ...careerPages,
    ...learningPages,
    ...practicePages,
    ...resourcePages,
    ...jobPages,
    ...mathPages,
  ]

  return allPages
}
