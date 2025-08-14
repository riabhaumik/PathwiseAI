// Data service for handling API calls and data management
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export interface Career {
  id?: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  detailed_description?: string;
  skills: string[];
  degree_required: string;
  alternative_paths?: string[];
  growth_rate: string;
  avg_salary: string;
  salary_range?: {
    entry: string;
    mid: string;
    senior: string;
    expert: string;
  };
  job_outlook?: string;
  work_environment?: string[];
  industries?: string[];
  certifications?: string[];
  subjects?: {
    [key: string]: Array<{
      id: string;
      name: string;
      difficulty: number;
      importance?: number;
      prereqs?: string[];
      duration?: string;
      resources: { [key: string]: string };
    }>;
  };
}

export interface Resource {
  id?: string;
  title: string;
  description: string;
  platform: string;
  instructor?: string;
  difficulty: string;
  duration: string;
  rating: string;
  students?: string;
  price: string;
  url: string;
  image_url?: string;
  tags?: string[];
  features?: string[];
  prerequisites?: string;
  learning_outcomes?: string[];
  category?: string;
  subcategory?: string;
}

export interface InterviewQuestion {
  question: string;
  difficulty: string;
  hint?: string;
  solution_approach?: string;
  time_complexity?: string;
  space_complexity?: string;
}

export interface MathResource {
  title: string;
  description: string;
  difficulty: string;
  duration: string;
  topics: string[];
  resources: Array<{
    title: string;
    platform: string;
    url: string;
    image_url: string;
  }>;
}

export interface ChatMessage {
  message: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  sources: string[];
  confidence: number;
}

class DataService {
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Careers
  async loadCareers(category?: string, search?: string, limit?: number): Promise<{ [key: string]: Career }> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());

    const endpoint = `/api/careers${params.toString() ? `?${params.toString()}` : ''}`;
    const data = await this.makeRequest<{ careers: { [key: string]: Career }; total: number; categories: string[] }>(endpoint);
    return data.careers;
  }

  async getCareer(careerName: string): Promise<Career> {
    return this.makeRequest<Career>(`/api/careers/${encodeURIComponent(careerName)}`);
  }

  async getCareerCategories(): Promise<string[]> {
    const data = await this.makeRequest<{ categories: string[] }>('/api/careers/categories');
    return data.categories;
  }

  // Resources
  async loadResources(
    category?: string,
    difficulty?: string,
    platform?: string,
    search?: string,
    limit?: number
  ): Promise<Resource[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);
    if (platform) params.append('platform', platform);
    if (search) params.append('search', search);
    if (limit) params.append('limit', limit.toString());

    const endpoint = `/api/resources${params.toString() ? `?${params.toString()}` : ''}`;
    const data = await this.makeRequest<{ resources: Resource[]; total: number; categories: string[]; difficulties: string[]; platforms: string[] }>(endpoint);
    return data.resources;
  }

  // Interview Prep
  async loadInterviewPrep(careerName?: string): Promise<any> {
    const endpoint = careerName ? `/api/interview-prep?career_name=${encodeURIComponent(careerName)}` : '/api/interview-prep';
    return this.makeRequest<any>(endpoint);
  }

  // Math Resources
  async loadMathResources(): Promise<{ [key: string]: MathResource }> {
    return this.makeRequest<{ [key: string]: MathResource }>('/api/math-resources');
  }

  // Job Opportunities
  async loadJobOpportunities(careerName?: string, location?: string): Promise<any> {
    const params = new URLSearchParams();
    if (careerName) params.append('career_name', careerName);
    if (location) params.append('location', location);
    
    const endpoint = `/api/job-opportunities${params.toString() ? `?${params.toString()}` : ''}`;
    return this.makeRequest<any>(endpoint);
  }

  // Chat
  async sendChatMessage(message: ChatMessage): Promise<ChatResponse> {
    return this.makeRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(message),
    });
  }

  // Search
  async searchAll(query: string, type?: 'careers' | 'resources' | 'all', limit?: number): Promise<{
    careers: Array<{ name: string; category: string; description: string; avg_salary: string }>;
    resources: Array<{ title: string; platform: string; difficulty: string; url: string; category: string }>;
    total_results: number;
  }> {
    const params = new URLSearchParams({ query });
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());

    const endpoint = `/api/search?${params.toString()}`;
    return this.makeRequest(endpoint);
  }

  // Dashboard
  async getDashboardStats(): Promise<{
    stats: { total_careers: number; total_resources: number; career_categories: number; resource_categories: number };
    featured_careers: string[];
    categories: string[];
    user: { email: string; name: string };
  }> {
    return this.makeRequest('/api/dashboard');
  }

  // Roadmap
  async generateRoadmap(careerName: string, completedTopics?: string[]): Promise<{
    career: string;
    description: string;
    estimated_duration: string;
    phases: Array<{
      name: string;
      duration: string;
      topics: any[];
      completed: string[];
    }>;
  }> {
    return this.makeRequest('/api/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify({ career_name: careerName, completed_topics: completedTopics }),
    });
  }

  // Health check
  async checkHealth(): Promise<{
    status: string;
    version: string;
    openai_available: boolean;
    supabase_available: boolean;
    timestamp: string;
  }> {
    return this.makeRequest('/health');
  }
}

export const dataService = new DataService(); 