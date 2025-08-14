# Vercel Analytics Implementation Guide for PathwiseAI

## 🎯 **Overview**

This guide explains how to properly implement and use Vercel Analytics in your PathwiseAI application for tracking user behavior, performance metrics, and gaining insights into your application's usage.

## 📦 **Installation**

The `@vercel/analytics` package has been installed:

```bash
npm install @vercel/analytics
```

## 🔧 **Implementation**

### **1. Import Statement**

**Correct Import:**
```typescript
import { Analytics } from '@vercel/analytics/react'
```

**Common Mistake:**
```typescript
// ❌ This will cause an error
import { Analytics } from '@vercel/analytics/next'
```

### **2. Layout Integration**

The Analytics component has been added to your root layout (`frontend/src/app/layout.tsx`):

```typescript
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            {children}
            <footer>
              {/* Your footer content */}
            </footer>
            <Analytics /> {/* Analytics component */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
```

## 📊 **What Vercel Analytics Tracks**

### **Automatic Tracking:**
- **Page Views**: Every page navigation
- **Performance Metrics**: Core Web Vitals
- **User Sessions**: Visit duration and behavior
- **Geographic Data**: User locations
- **Device Information**: Browser, OS, device type
- **Referrer Sources**: How users find your site

### **Custom Events:**
- **User Actions**: Button clicks, form submissions
- **Feature Usage**: Which features are most popular
- **Conversion Tracking**: Sign-ups, purchases, etc.
- **Error Monitoring**: JavaScript errors and performance issues

## 🚀 **Advanced Usage**

### **1. Custom Event Tracking**

```typescript
import { track } from '@vercel/analytics'

// Track user actions
const handleCareerClick = (careerName: string) => {
  track('career_selected', {
    career: careerName,
    category: 'STEM',
    user_type: user?.isGuest ? 'guest' : 'registered'
  })
}

// Track practice problem completion
const handleProblemComplete = (problemId: string, difficulty: string) => {
  track('problem_completed', {
    problem_id: problemId,
    difficulty: difficulty,
    time_taken: timeSpent,
    user_level: userLevel
  })
}

// Track learning progress
const handleModuleComplete = (moduleName: string, score: number) => {
  track('module_completed', {
    module: moduleName,
    score: score,
    completion_time: new Date().toISOString()
  })
}
```

### **2. Performance Monitoring**

```typescript
import { track } from '@vercel/analytics'

// Track page load performance
useEffect(() => {
  const trackPagePerformance = () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      track('page_performance', {
        page: pathname,
        load_time: navigation.loadEventEnd - navigation.loadEventStart,
        dom_content_loaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        first_paint: performance.getEntriesByName('first-paint')[0]?.startTime || 0
      })
    }
  }

  trackPagePerformance()
}, [pathname])
```

### **3. User Journey Tracking**

```typescript
import { track } from '@vercel/analytics'

// Track user progression through the app
const trackUserJourney = (step: string, data?: any) => {
  track('user_journey', {
    step: step,
    user_id: user?.id || 'guest',
    timestamp: new Date().toISOString(),
    ...data
  })
}

// Usage examples:
trackUserJourney('career_exploration_started')
trackUserJourney('practice_problem_started', { problem_type: 'coding' })
trackUserJourney('roadmap_viewed', { career_path: 'software-engineer' })
trackUserJourney('resource_downloaded', { resource_type: 'ebook' })
```

## 📱 **Mobile-Specific Tracking**

### **1. Touch Interactions**

```typescript
import { track } from '@vercel/analytics'

// Track mobile-specific interactions
const trackMobileInteraction = (action: string, element: string) => {
  const isMobile = window.innerWidth <= 768
  
  track('mobile_interaction', {
    action: action,
    element: element,
    is_mobile: isMobile,
    screen_size: `${window.innerWidth}x${window.innerHeight}`,
    user_agent: navigator.userAgent
  })
}

// Usage in components
<button 
  onClick={() => trackMobileInteraction('tap', 'career_card')}
  className="touch-friendly-button"
>
  View Career
</button>
```

### **2. Navigation Patterns**

```typescript
import { track } from '@vercel/analytics'

// Track mobile navigation usage
const trackNavigationUsage = (navigationType: 'hamburger' | 'swipe' | 'button') => {
  track('navigation_used', {
    type: navigationType,
    is_mobile: window.innerWidth <= 768,
    current_page: pathname,
    user_experience: 'mobile_optimized'
  })
}
```

## 🎯 **Key Metrics to Track**

### **1. User Engagement**
- **Session Duration**: How long users stay on your site
- **Pages per Session**: How many pages users visit
- **Bounce Rate**: Single-page sessions
- **Return Visits**: User retention

### **2. Feature Usage**
- **Most Popular Careers**: Which career paths get the most interest
- **Practice Problem Completion**: User engagement with learning content
- **Resource Downloads**: Which materials are most valuable
- **Roadmap Usage**: How users navigate learning paths

### **3. Performance Metrics**
- **Page Load Times**: Core Web Vitals
- **Mobile Performance**: Mobile-specific metrics
- **Error Rates**: JavaScript errors and crashes
- **API Response Times**: Backend performance

## 🔍 **Analytics Dashboard**

### **Accessing Your Data:**
1. **Vercel Dashboard**: Go to your Vercel project
2. **Analytics Tab**: View real-time and historical data
3. **Insights**: Understand user behavior patterns
4. **Performance**: Monitor Core Web Vitals

### **Key Dashboard Sections:**
- **Overview**: High-level metrics and trends
- **Pages**: Most visited pages and performance
- **Referrers**: Traffic sources and campaigns
- **Devices**: Mobile vs desktop usage
- **Countries**: Geographic distribution

## 🚀 **Best Practices**

### **1. Privacy Compliance**
```typescript
// Respect user privacy preferences
const trackWithConsent = (event: string, data: any) => {
  const hasConsent = localStorage.getItem('analytics_consent') === 'true'
  
  if (hasConsent) {
    track(event, data)
  }
}
```

### **2. Performance Optimization**
```typescript
// Lazy load analytics for better performance
import dynamic from 'next/dynamic'

const Analytics = dynamic(() => import('@vercel/analytics/react').then(mod => ({ default: mod.Analytics })), {
  ssr: false
})
```

### **3. Error Handling**
```typescript
// Safe tracking with error handling
const safeTrack = (event: string, data: any) => {
  try {
    track(event, data)
  } catch (error) {
    console.warn('Analytics tracking failed:', error)
    // Fallback tracking or error reporting
  }
}
```

## 📊 **Sample Tracking Implementation**

Here's a complete example of how to implement tracking in your components:

```typescript
// components/CareerCard.tsx
import { track } from '@vercel/analytics'

interface CareerCardProps {
  career: Career
}

export default function CareerCard({ career }: CareerCardProps) {
  const handleViewCareer = () => {
    track('career_viewed', {
      career_name: career.name,
      category: career.category,
      difficulty: career.difficulty,
      user_type: user?.isGuest ? 'guest' : 'registered'
    })
    
    router.push(`/careers/${career.slug}`)
  }

  const handleStartLearning = () => {
    track('learning_started', {
      career_name: career.name,
      entry_point: 'career_card',
      user_level: userLevel
    })
    
    router.push(`/roadmap/${career.slug}`)
  }

  return (
    <div className="career-card">
      <h3>{career.name}</h3>
      <p>{career.description}</p>
      <div className="actions">
        <button onClick={handleViewCareer}>
          Learn More
        </button>
        <button onClick={handleStartLearning}>
          Start Learning
        </button>
      </div>
    </div>
  )
}
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Import Error**: Make sure to use `@vercel/analytics/react`, not `@vercel/analytics/next`

2. **Analytics Not Loading**: Check that the Analytics component is in your root layout

3. **Events Not Tracking**: Verify that tracking calls are made after the component mounts

4. **Performance Impact**: Use dynamic imports for better performance

### **Debug Mode:**
```typescript
// Enable debug mode in development
if (process.env.NODE_ENV === 'development') {
  track('debug_event', { message: 'Debug mode enabled' })
}
```

## 📈 **Next Steps**

### **Immediate Actions:**
1. ✅ **Analytics Component**: Added to root layout
2. ✅ **Basic Tracking**: Automatic page view tracking enabled
3. 🔄 **Custom Events**: Implement tracking for key user actions
4. 🔄 **Performance Monitoring**: Add Core Web Vitals tracking

### **Advanced Features:**
- [ ] **A/B Testing**: Track different feature variations
- [ ] **Conversion Funnels**: Monitor user progression
- [ ] **Cohort Analysis**: Understand user retention
- [ ] **Real-time Alerts**: Get notified of performance issues

---

## 📞 **Support**

### **Resources:**
- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Next.js Analytics Integration](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Web Analytics Best Practices](https://web.dev/analytics/)

### **Contact:**
For technical support or analytics questions, please create an issue in the repository or contact the development team.

---

**Note**: Vercel Analytics provides privacy-first, GDPR-compliant analytics that respect user privacy while giving you valuable insights into your application's performance and usage patterns.
