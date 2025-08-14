// API client for Pathwise AI backend

export interface APIResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export interface ChatResponse {
  response: string;
  suggestions: string[];
  conversation_id: string;
  function_calls: any[];
  context: any;
}

export interface CareerInsights {
  career: string;
  insights: string;
  generated_at: string;
  summary: string;
}

export interface ProfileAnalysis {
  profile_analysis: string;
  skills_analyzed: number;
  interests_considered: number;
  experience_level: string;
  recommendations_count: number;
  summary: string;
}

export interface RoadmapData {
  career: string;
  skills: {
    technical: string[];
    soft_skills: string[];
    domain_specific: string[];
  };
  courses: {
    university: any[];
    online: any[];
    prerequisites: string[];
  };
  resources: {
    platforms: any[];
    books: any[];
    communities: any[];
  };
  timeline: {
    phases: any[];
    milestones: any[];
    estimated_duration: string;
  };
  market_insights: {
    demand: string;
    salary_range: string;
    growth_potential: string;
    required_skills: string[];
  };
}

class APIClient {
  private baseURL: string;

  constructor() {
    // Use environment variable or default to local development
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<APIResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // AI Chat endpoints
  async chatWithAI(message: string, context?: any): Promise<APIResponse<ChatResponse>> {
    return this.request<ChatResponse>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context }),
    });
  }

  async getCareerInsights(careerName: string): Promise<APIResponse<CareerInsights>> {
    return this.request<CareerInsights>('/ai/career-insights', {
      method: 'POST',
      body: JSON.stringify({ career_name: careerName }),
    });
  }

  async analyzeUserProfile(
    skills: string[],
    interests: string[],
    experience: string
  ): Promise<APIResponse<ProfileAnalysis>> {
    return this.request<ProfileAnalysis>('/ai/profile-analysis', {
      method: 'POST',
      body: JSON.stringify({ skills, interests, experience }),
    });
  }

  async getAISuggestions(message: string, context?: any): Promise<APIResponse<{ suggestions: string[] }>> {
    const params = new URLSearchParams({ message });
    if (context) {
      params.append('context', JSON.stringify(context));
    }
    
    return this.request<{ suggestions: string[] }>(`/ai/suggestions?${params}`);
  }

  async checkAIHealth(): Promise<APIResponse<{ status: string; test_response: string }>> {
    return this.request<{ status: string; test_response: string }>('/ai/health');
  }

  // Career Roadmap endpoints
  async generateRoadmap(careerName: string, userSkills?: string[]): Promise<APIResponse<RoadmapData>> {
    const params = new URLSearchParams({ career_name: careerName });
    if (userSkills && userSkills.length > 0) {
      params.append('user_skills', JSON.stringify(userSkills));
    }
    
    return this.request<RoadmapData>(`/roadmap/generate?${params}`);
  }

  async getCareerRecommendations(skills: string[], interests?: string[]): Promise<APIResponse<any>> {
    return this.request('/roadmap/recommendations', {
      method: 'POST',
      body: JSON.stringify({ skills, interests }),
    });
  }

  async getLearningResources(careerName: string, skillType?: string): Promise<APIResponse<any>> {
    const params = new URLSearchParams({ career_name: careerName });
    if (skillType) {
      params.append('skill_type', skillType);
    }
    
    return this.request(`/roadmap/resources?${params}`);
  }

  // Career data endpoints
  async getCareers(): Promise<APIResponse<any[]>> {
    return this.request('/careers');
  }

  async getCareerDetails(careerId: string): Promise<APIResponse<any>> {
    return this.request(`/careers/${careerId}`);
  }

  async searchCareers(query: string, filters?: any): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams({ q: query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    return this.request(`/careers/search?${params}`);
  }

  // Job opportunities endpoints
  async getJobOpportunities(careerName?: string, location?: string): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams();
    if (careerName) params.append('career', careerName);
    if (location) params.append('location', location);
    
    return this.request(`/jobs?${params}`);
  }

  async getJobDetails(jobId: string): Promise<APIResponse<any>> {
    return this.request(`/jobs/${jobId}`);
  }

  // Learning resources endpoints
  async getLearningResourcesByCategory(category: string): Promise<APIResponse<any[]>> {
    return this.request(`/resources/${category}`);
  }

  async searchResources(query: string, category?: string): Promise<APIResponse<any[]>> {
    const params = new URLSearchParams({ q: query });
    if (category) params.append('category', category);
    
    return this.request(`/resources/search?${params}`);
  }

  // User profile endpoints
  async getUserProfile(): Promise<APIResponse<any>> {
    return this.request('/user/profile');
  }

  async updateUserProfile(profileData: any): Promise<APIResponse<any>> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getUserSkills(): Promise<APIResponse<string[]>> {
    return this.request('/user/skills');
  }

  async updateUserSkills(skills: string[]): Promise<APIResponse<string[]>> {
    return this.request('/user/skills', {
      method: 'PUT',
      body: JSON.stringify({ skills }),
    });
  }

  async getUserProgress(): Promise<APIResponse<any>> {
    return this.request('/user/progress');
  }

  async updateUserProgress(progressData: any): Promise<APIResponse<any>> {
    return this.request('/user/progress', {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  }

  // Utility methods
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  getBaseURL(): string {
    return this.baseURL;
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }
}

// Create and export a singleton instance
export const apiClient = new APIClient();

// Export the class for testing or custom instances
export default APIClient; 