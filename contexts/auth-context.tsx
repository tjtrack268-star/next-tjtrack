"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { apiClient } from "@/lib/api"
import type { ProfileResponse, AuthRequest, ProfileRequest } from "@/types/api"

interface AuthContextType {
  user: ProfileResponse | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: AuthRequest) => Promise<void>
  register: (data: ProfileRequest) => Promise<void>
  logout: () => void
  verifyOtp: (email: string, otp: string) => Promise<void>
  sendResetOtp: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("tj-track-token")
    const savedUser = localStorage.getItem("tj-track-user")
    console.log('Auth init - token:', !!token, 'savedUser:', !!savedUser)

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        apiClient.setToken(token)
        setUser(parsedUser)
        document.cookie = `tj-track-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
        document.cookie = `jwt=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
        console.log('Auth restored:', parsedUser.email)
      } catch {
        localStorage.removeItem("tj-track-token")
        localStorage.removeItem("tj-track-user")
        document.cookie = 'tj-track-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        console.log('Auth restore failed')
      }
    }
    setIsLoading(false)
  }, [])

  // Debug: Log user state changes
  useEffect(() => {
    console.log('Auth state changed - user:', user ? user.email : 'not logged in', 'isAuthenticated:', !!user)
  }, [user])

  const login = useCallback(async (credentials: AuthRequest) => {
    setIsLoading(true)
    console.log("Login attempt with:", credentials.email)

    try {
      const response = await apiClient.post<{ token: string; email: string; name: string; roles: string[] }>("/login", credentials)

      if (response.token) {
        const user: ProfileResponse = {
          userId: response.email,
          name: response.name,
          email: response.email,
          isAccountVerified: true,
          isApproved: true,
          roles: response.roles
        }
        console.log('Setting token:', response.token.substring(0, 20) + '...')
        localStorage.setItem("tj-track-token", response.token)
        localStorage.setItem("tj-track-user", JSON.stringify(user))
        document.cookie = `tj-track-token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`
        document.cookie = `jwt=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`
        apiClient.setToken(response.token)
        setUser(user)
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: ProfileRequest) => {
    setIsLoading(true)
    console.log("Register attempt:", data.email, data.role)

    try {
      await apiClient.post("/register", data)
    } catch (error) {
      console.error("Register error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const verifyOtp = useCallback(async (email: string, otp: string) => {
    setIsLoading(true)
    console.log("Verify OTP for:", email)

    try {
      const response = await apiClient.post<{ token: string; email: string; name: string; roles: string[] }>("/verify-otp", { email, otp })

      if (response.token) {
        const user: ProfileResponse = {
          userId: response.email,
          name: response.name,
          email: response.email,
          isAccountVerified: true,
          isApproved: true,
          roles: response.roles
        }
        localStorage.setItem("tj-track-token", response.token)
        localStorage.setItem("tj-track-user", JSON.stringify(user))
        document.cookie = `tj-track-token=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`
        document.cookie = `jwt=${response.token}; path=/; max-age=${7 * 24 * 60 * 60}`
        apiClient.setToken(response.token)
        setUser(user)
      }
    } catch (error) {
      console.error("Verify OTP error:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const sendResetOtp = useCallback(async (email: string) => {
    console.log("Send reset OTP to:", email)
    await apiClient.post("/send-reset-otp", undefined, { email })
  }, [])

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    console.log("Reset password for:", email)
    await apiClient.post("/reset-password", { email, otp, newPassword })
  }, [])

  const logout = useCallback(() => {
    console.log("Logout")
    localStorage.removeItem("tj-track-token")
    localStorage.removeItem("tj-track-user")
    document.cookie = 'tj-track-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
    apiClient.setToken(null)
    setUser(null)
    
    if (typeof window !== 'undefined') {
      window.location.href = '/'
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        verifyOtp,
        sendResetOtp,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
