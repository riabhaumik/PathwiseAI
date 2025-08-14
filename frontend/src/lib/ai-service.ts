import OpenAI from 'openai'

// Initialize OpenAI client with fallback
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true // Note: In production, use a backend API
})

export async function chatWithAI(message: string, context?: any) {
  try {
    // Check if we have a valid API key
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY === 'your_openai_api_key_here') {
      return {
        response: "I'm here to help with your STEM career journey! I can assist with career exploration, learning resources, interview preparation, and mathematics. To enable AI features, please add your OpenAI API key to the environment configuration.",
        sources: [],
        confidence: 0.8
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are Pathwise AI, a comprehensive career guidance assistant specializing in STEM fields. 
          
          Your role is to:
          1. Help users explore STEM career paths
          2. Recommend learning resources and courses
          3. Provide interview preparation guidance
          4. Answer questions about mathematics and technical concepts
          5. Offer personalized career advice
          
          Always provide specific, actionable advice and mention relevant resources when possible.`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })

    return {
      response: response.choices[0].message.content || "I'm sorry, I couldn't generate a response at this time.",
      sources: [],
      confidence: 0.9
    }
  } catch (error) {
    console.error('AI Service Error:', error)
    return {
      response: "I'm here to help with your STEM career journey! I can assist with career exploration, learning resources, interview preparation, and mathematics. What would you like to know?",
      sources: [],
      confidence: 0.7
    }
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIResponse {
  response: string
  error?: string
}

export class AIService {
  private static instance: AIService
  private conversationHistory: ChatMessage[] = []

  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async sendMessage(userMessage: string, selectedCareer?: string): Promise<AIResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage
      })

      // Create system prompt with career context
      const systemPrompt = `You are Pathwise AI, a career advisor for students interested in STEM careers. 
      
Your role is to provide helpful, encouraging, and practical career guidance. You should:

1. Be encouraging and supportive
2. Provide specific, actionable advice
3. Use markdown formatting for better readability
4. Reference the selected career when provided: ${selectedCareer || 'general STEM'}
5. Suggest relevant learning resources and next steps
6. Keep responses concise but informative
7. Use emojis and formatting to make responses engaging

Current context: ${selectedCareer ? `The user is interested in ${selectedCareer} career path.` : 'The user is exploring general STEM careers.'}

Always be helpful, encouraging, and provide practical guidance.`

      // Prepare messages for OpenAI
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        ...this.conversationHistory.slice(-10) // Keep last 10 messages for context
      ]

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini', // Using GPT-4o-mini for cost efficiency
        messages: messages,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9,
      })

      const aiResponse = completion.choices[0]?.message?.content || 'I apologize, but I couldn\'t generate a response at this time.'

      // Add AI response to conversation history
      this.conversationHistory.push({
        role: 'assistant',
        content: aiResponse
      })

      return { response: aiResponse }

    } catch (error) {
      console.error('Error calling OpenAI API:', error)
      
      // Fallback response if API fails
      const fallbackResponse = this.getFallbackResponse(userMessage, selectedCareer)
      
      return { 
        response: fallbackResponse,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private getFallbackResponse(userMessage: string, selectedCareer?: string): string {
    const careerContext = selectedCareer || "STEM"
    const inputLower = userMessage.toLowerCase()
    
    if (inputLower.includes('skill') || inputLower.includes('learn') || inputLower.includes('study')) {
      return `**Learning Path for ${careerContext}:**\n\n1. **Foundation** - Master core concepts\n2. **Specialization** - Focus on career-specific skills\n3. **Practice** - Build projects and solve problems\n4. **Networking** - Connect with professionals\n5. **Application** - Apply for internships and jobs\n\n**Recommended Resources:**\n• Online courses (Coursera, edX, Udemy)\n• Practice platforms (LeetCode, HackerRank)\n• Documentation and tutorials\n• Industry blogs and podcasts`
    } else if (inputLower.includes('interview') || inputLower.includes('prepare')) {
      return `**Interview Preparation for ${careerContext}:**\n\n**Technical Preparation:**\n• Review core concepts and algorithms\n• Practice coding problems\n• Prepare for system design questions\n\n**Behavioral Preparation:**\n• Prepare STAR method responses\n• Research the company and role\n• Practice common questions\n\n**Resources:**\n• Check our interview preparation section\n• Practice on LeetCode and HackerRank\n• Review company-specific questions`
    } else if (inputLower.includes('salary') || inputLower.includes('pay')) {
      return `**Salary Information for ${careerContext}:**\n\n**Entry Level:** $60,000 - $80,000\n**Mid Level:** $80,000 - $120,000\n**Senior Level:** $120,000 - $180,000+\n\n**Factors Affecting Salary:**\n• Location and cost of living\n• Company size and industry\n• Experience and skills\n• Education and certifications\n\n**Negotiation Tips:**\n• Research market rates\n• Highlight your value\n• Consider total compensation`
    } else {
      return `**Career Guidance for ${careerContext}:**\n\nI'm here to help you navigate your career path! Here are some areas I can assist with:\n\n• **Skills Development** - Essential skills and learning paths\n• **Learning Resources** - Courses, tutorials, and practice materials\n• **Interview Preparation** - Technical and behavioral questions\n• **Salary Information** - Compensation insights and negotiation\n• **Job Opportunities** - Current market trends and openings\n\n**Quick Actions:**\n• Select a career from the dropdown to get personalized guidance\n• Explore our learning resources\n• Check the mathematics pathway\n• Review interview preparation materials`
    }
  }

  clearHistory(): void {
    this.conversationHistory = []
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory]
  }
}

export default AIService.getInstance() 