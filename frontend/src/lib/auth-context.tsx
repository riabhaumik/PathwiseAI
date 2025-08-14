'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthState, LoginCredentials, SignUpCredentials } from './auth'
import { authClient, supabaseAuth } from './auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: SignUpCredentials) => Promise<void>
  logout: () => Promise<void>
  isGuest: boolean
  setGuestMode: (guest: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  })
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    // Check for existing token on mount
    const checkAuth = async () => {
      try {
        if (authClient.isAuthenticated()) {
          const user = await authClient.getCurrentUser()
          setState({ user, loading: false, error: null })
          setIsGuest(false)
        } else {
          // Check if there's a stored user email for guest mode
          const storedEmail = localStorage.getItem('user_email')
          if (storedEmail) {
            setState({ 
              user: { id: 'guest', email: storedEmail, name: storedEmail.split('@')[0] }, 
              loading: false, 
              error: null 
            })
            setIsGuest(true)
          } else {
            setState({ user: null, loading: false, error: null })
          }
        }
      } catch (error) {
        console.error('Auth check error:', error)
        // Clear invalid token
        authClient.removeToken()
        setState({ user: null, loading: false, error: null })
      }
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const { access_token, user } = await authClient.login(credentials)
      authClient.setToken(access_token)
      setState({ user, loading: false, error: null })
      setIsGuest(false)
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      }))
      throw error
    }
  }

  const signUp = async (credentials: SignUpCredentials) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const { access_token, user } = await authClient.signUp(credentials)
      authClient.setToken(access_token)
      setState({ user, loading: false, error: null })
      setIsGuest(false)
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      }))
      throw error
    }
  }

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      await authClient.logout()
      authClient.removeToken()
      setState({ user: null, loading: false, error: null })
      setIsGuest(false)
    } catch (error) {
      // Even if logout fails, clear local state
      authClient.removeToken()
      setState({ user: null, loading: false, error: null })
      setIsGuest(false)
    }
  }

  const setGuestMode = (guest: boolean) => {
    setIsGuest(guest)
    if (guest) {
      setState({ user: null, loading: false, error: null })
    }
  }

  const value: AuthContextType = {
    ...state,
    login,
    signUp,
    logout,
    isGuest,
    setGuestMode,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 