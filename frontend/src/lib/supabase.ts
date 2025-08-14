import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create a mock client for development when Supabase is not configured
let supabase: any

if (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'your_supabase_url_here') {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Mock Supabase client for development
  console.warn('Supabase not configured - using mock authentication. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local for real authentication.')
  
  supabase = {
    auth: {
      signInWithPassword: async (credentials: any) => {
        console.log('Mock login attempt:', credentials.email)
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: credentials.email,
              user_metadata: { name: credentials.email.split('@')[0] }
            },
            session: {
              access_token: 'mock-access-token'
            }
          },
          error: null
        }
      },
      signUp: async (credentials: any) => {
        console.log('Mock signup attempt:', credentials.email)
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: credentials.email,
              user_metadata: { name: credentials.options?.data?.name || credentials.email.split('@')[0] }
            },
            session: {
              access_token: 'mock-access-token'
            }
          },
          error: null
        }
      },
      signOut: async () => {
        console.log('Mock logout')
        return { error: null }
      },
      getUser: async () => {
        return {
          data: {
            user: {
              id: 'mock-user-id',
              email: 'demo@pathwise.ai',
              user_metadata: { name: 'Demo User' }
            }
          },
          error: null
        }
      }
    }
  }
}

export { supabase }

// Database types (you can generate these from Supabase)
export interface Database {
  public: {
    Tables: {
      careers: {
        Row: {
          id: number
          name: string
          description: string
          skills: string[]
          degree_required: string
          growth_rate: string
          avg_salary: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description: string
          skills: string[]
          degree_required: string
          growth_rate: string
          avg_salary: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string
          skills?: string[]
          degree_required?: string
          growth_rate?: string
          avg_salary?: string
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: number
          title: string
          description: string
          url: string
          platform: string
          difficulty: string
          duration: string
          rating: string
          career_id: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          description: string
          url: string
          platform: string
          difficulty: string
          duration: string
          rating: string
          career_id?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          description?: string
          url?: string
          platform?: string
          difficulty?: string
          duration?: string
          rating?: string
          career_id?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
