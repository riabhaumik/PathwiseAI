'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
}

export default function SEO({
  title,
  description,
  keywords = [],
  image = '/og-image.jpg',
  type = 'website',
  author = 'PathwiseAI',
  publishedTime,
  modifiedTime,
  section,
  tags = []
}: SEOProps) {
  const pathname = usePathname()
  
  // Default values based on current page
  const getDefaultValues = () => {
    switch (pathname) {
      case '/':
        return {
          title: 'PathwiseAI - Your AI-Powered STEM Career Navigator',
          description: 'Discover your perfect STEM career path with AI-powered guidance, practice problems, learning roadmaps, and expert resources. Start your journey today!',
          keywords: ['STEM careers', 'AI career guidance', 'coding practice', 'interview prep', 'learning roadmap', 'STEM education', 'career development', 'tech jobs'],
          section: 'Home'
        }
      case '/careers':
        return {
          title: 'STEM Careers - Explore Career Paths | PathwiseAI',
          description: 'Explore diverse STEM career opportunities in software engineering, data science, AI/ML, cybersecurity, and more. Get personalized career guidance and insights.',
          keywords: ['STEM careers', 'software engineering', 'data science', 'AI careers', 'ML engineering', 'cybersecurity', 'career paths', 'tech jobs'],
          section: 'Careers'
        }
      case '/practice':
        return {
          title: 'Practice Problems & Interview Prep | PathwiseAI',
          description: 'Master coding challenges, system design problems, behavioral questions, and mathematics. Prepare for technical interviews with our comprehensive practice platform.',
          keywords: ['coding practice', 'interview prep', 'system design', 'coding problems', 'technical interview', 'programming challenges', 'math problems'],
          section: 'Practice'
        }
      case '/roadmap':
        return {
          title: 'Learning Roadmaps & Career Paths | PathwiseAI',
          description: 'Follow structured learning roadmaps for software engineering, data science, AI/ML, and other STEM careers. Track your progress and achieve your goals.',
          keywords: ['learning roadmap', 'career path', 'skill development', 'learning plan', 'progress tracking', 'STEM education'],
          section: 'Roadmap'
        }
      case '/learn':
        return {
          title: 'Interactive Learning Modules | PathwiseAI',
          description: 'Learn STEM concepts through interactive modules, hands-on projects, and real-world applications. Master new skills at your own pace.',
          keywords: ['interactive learning', 'STEM education', 'hands-on projects', 'skill building', 'online learning', 'educational modules'],
          section: 'Learn'
        }
      case '/math':
        return {
          title: 'Mathematics Resources & Tools | PathwiseAI',
          description: 'Access comprehensive mathematics resources, tools, and practice problems. From basic algebra to advanced calculus and statistics.',
          keywords: ['mathematics', 'math resources', 'math tools', 'algebra', 'calculus', 'statistics', 'math practice'],
          section: 'Math'
        }
      case '/resources':
        return {
          title: 'Educational Resources & Materials | PathwiseAI',
          description: 'Discover curated educational resources, study materials, and learning tools for STEM subjects. Enhance your knowledge and skills.',
          keywords: ['educational resources', 'study materials', 'learning tools', 'STEM resources', 'educational content'],
          section: 'Resources'
        }
      case '/jobs':
        return {
          title: 'STEM Job Opportunities | PathwiseAI',
          description: 'Find the latest STEM job opportunities, internships, and career openings. Connect with top employers in technology and science.',
          keywords: ['STEM jobs', 'job opportunities', 'career openings', 'internships', 'tech jobs', 'science careers'],
          section: 'Jobs'
        }
      default:
        return {
          title: 'PathwiseAI - STEM Career Navigation Platform',
          description: 'Your comprehensive platform for STEM career development, learning, and growth.',
          keywords: ['STEM', 'careers', 'education', 'learning', 'technology', 'science'],
          section: 'Platform'
        }
    }
  }

  const defaults = getDefaultValues()
  const finalTitle = title || defaults.title
  const finalDescription = description || defaults.description
  const finalKeywords = [...new Set([...keywords, ...defaults.keywords])]
  const finalSection = section || defaults.section

  // Base URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://pathwiseai.com'
  const canonicalUrl = `${baseUrl}${pathname}`

  // Structured data for rich snippets
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type === 'article' ? 'Article' : 'WebSite',
    "name": finalTitle,
    "description": finalDescription,
    "url": canonicalUrl,
    "logo": `${baseUrl}/logo.png`,
    "sameAs": [
      "https://twitter.com/pathwiseai",
      "https://linkedin.com/company/pathwiseai",
      "https://github.com/pathwiseai"
    ],
    "publisher": {
      "@type": "Organization",
      "name": "PathwiseAI",
      "description": "AI-powered STEM career navigation platform",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  }

  // Article structured data
  if (type === 'article') {
    Object.assign(structuredData, {
      "author": {
        "@type": "Person",
        "name": author
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "articleSection": finalSection,
      "keywords": finalKeywords.join(', '),
      "image": image.startsWith('http') ? image : `${baseUrl}${image}`
    })
  }

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="PathwiseAI" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@pathwiseai" />
      <meta name="twitter:creator" content="@pathwiseai" />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `${baseUrl}${image}`} />
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#3B82F6" />
      <meta name="msapplication-TileColor" content="#3B82F6" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="PathwiseAI" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      {/* Additional SEO Meta Tags */}
      <meta name="application-name" content="PathwiseAI" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Mobile-specific meta tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="HandheldFriendly" content="true" />
      
      {/* Security meta tags */}
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      
      {/* Performance meta tags */}
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Social Media Meta Tags */}
      <meta property="og:image:alt" content="PathwiseAI - STEM Career Navigation Platform" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:secure_url" content={image.startsWith('https') ? image : `${baseUrl}${image}`} />
      
      {/* Additional Open Graph tags */}
      <meta property="og:determiner" content="the" />
      <meta property="og:locale:alternate" content="es_ES" />
      <meta property="og:locale:alternate" content="fr_FR" />
      <meta property="og:locale:alternate" content="de_DE" />
      
      {/* Twitter additional meta tags */}
      <meta name="twitter:image:alt" content="PathwiseAI - STEM Career Navigation Platform" />
      <meta name="twitter:label1" content="Est. reading time" />
      <meta name="twitter:data1" content="5 minutes" />
      
      {/* Verification meta tags for search engines */}
      <meta name="google-site-verification" content="your-google-verification-code" />
      <meta name="msvalidate.01" content="your-bing-verification-code" />
      <meta name="yandex-verification" content="your-yandex-verification-code" />
      
      {/* Business/Organization meta tags */}
      <meta property="business:contact_data:street_address" content="123 Tech Street" />
      <meta property="business:contact_data:locality" content="San Francisco" />
      <meta property="business:contact_data:region" content="CA" />
      <meta property="business:contact_data:postal_code" content="94105" />
      <meta property="business:contact_data:country_name" content="USA" />
      <meta property="business:contact_data:phone_number" content="+1-555-123-4567" />
      <meta property="business:contact_data:email" content="contact@pathwiseai.com" />
      <meta property="business:contact_data:website" content={baseUrl} />
      
      {/* Article specific meta tags */}
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime || publishedTime} />
          <meta property="article:author" content={author} />
          <meta property="article:section" content={finalSection} />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
    </Head>
  )
}
