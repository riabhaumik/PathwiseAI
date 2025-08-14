import { supabase } from './supabase'

export interface User {
  id: string
  email: string
  name?: string
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials {
  email: string
  password: string
  name?: string
}

// Real Supabase auth client
class AuthClient {
  private token: string | null = null

  setToken(token: string) {
    this.token = token
    localStorage.setItem('auth_token', token)
    localStorage.setItem('auth_timestamp', Date.now().toString())
    try {
      // Optional: decode email from JWT if available for progress persistence
      const [, payload] = token.split('.')
      const decoded = JSON.parse(atob(payload))
      if (decoded?.sub) {
        localStorage.setItem('user_email', decoded.sub)
      }
      if (decoded?.exp) {
        localStorage.setItem('auth_expires', decoded.exp.toString())
      }
    } catch {}
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  removeToken() {
    this.token = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_timestamp')
    localStorage.removeItem('auth_expires')
    localStorage.removeItem('user_email')
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    if (!token) return false
    
    // Check if token is expired
    const expires = localStorage.getItem('auth_expires')
    if (expires) {
      const expiryTime = parseInt(expires) * 1000 // Convert to milliseconds
      if (Date.now() >= expiryTime) {
        this.removeToken()
        return false
      }
    }
    
    return true
  }

  async login(credentials: LoginCredentials): Promise<{ access_token: string; user: User }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user || !data.session) {
        throw new Error('Login failed')
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || ''
      }

      return {
        access_token: data.session.access_token,
        user
      }
    } catch (error) {
      // Fallback: try backend login route for structured errors
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const resp = await fetch(`${baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password })
        })
        
        if (!resp.ok) {
          const json = await resp.json().catch(() => ({}))
          throw new Error(json?.detail || `Login failed (${resp.status})`)
        }
        
        const json = await resp.json()
        const user: User = {
          id: json?.user?.id || 'backend-user',
          email: json?.user?.email || credentials.email,
          name: json?.user?.name || credentials.email.split('@')[0]
        }
        return { access_token: json?.access_token, user }
      } catch (e) {
        // Provide more specific error messages
        if (e instanceof Error) {
          if (e.message.includes('fetch')) {
            throw new Error('Unable to connect to server. Please check your internet connection and try again.')
          }
          throw new Error(e.message)
        }
        throw new Error('Login failed. Please try again.')
      }
    }
  }

  async signUp(credentials: SignUpCredentials): Promise<{ access_token: string; user: User }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || credentials.email.split('@')[0]
          }
        }
      })

      if (error) {
        throw new Error(error.message)
      }

      if (!data.user || !data.session) {
        throw new Error('Sign up failed')
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || credentials.name || data.user.email?.split('@')[0] || ''
      }

      return {
        access_token: data.session.access_token,
        user
      }
    } catch (error) {
      // Fallback: try backend signup route
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const resp = await fetch(`${baseUrl}/api/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: credentials.email, password: credentials.password, name: credentials.name })
        })
        
        if (!resp.ok) {
          const json = await resp.json().catch(() => ({}))
          throw new Error(json?.detail || `Sign up failed (${resp.status})`)
        }
        
        const json = await resp.json()
        const user: User = {
          id: json?.user?.id || 'backend-user',
          email: json?.user?.email || credentials.email,
          name: json?.user?.name || credentials.name || credentials.email.split('@')[0]
        }
        return { access_token: json?.access_token, user }
      } catch (e) {
        // Provide more specific error messages
        if (e instanceof Error) {
          if (e.message.includes('fetch')) {
            throw new Error('Unable to connect to server. Please check your internet connection and try again.')
          }
          throw new Error(e.message)
        }
        throw new Error('Sign up failed. Please try again.')
      }
    }
  }

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw new Error(error.message)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      this.removeToken()
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        throw new Error(error.message)
      }

      if (!user) {
        throw new Error('No user found')
      }

      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || ''
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user')
    }
  }
}

export const authClient = new AuthClient()

// Supabase auth (placeholder for future implementation)
export const supabaseAuth = {
  // Add Supabase implementation here when needed
} 