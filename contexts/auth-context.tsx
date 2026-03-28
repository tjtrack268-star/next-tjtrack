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
  resendOtp: (email: string) => Promise<void>
  sendResetOtp: (email: string) => Promise<void>
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ProfileResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("tj-track-token")
    const savedUser = localStorage.getItem("tj-track-user")

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser)
        const normalizedRoles = Array.isArray(parsedUser.roles) 
          ? parsedUser.roles.map((r: any) => typeof r === 'string' ? r : r.name)
          : []
        
        const cleanUser: ProfileResponse = {
          userId: parsedUser.userId || parsedUser.email,
          name: parsedUser.name || '',
          email: parsedUser.email,
          isAccountVerified: parsedUser.isAccountVerified ?? true,
          isApproved: parsedUser.isApproved ?? true,
          roles: normalizedRoles
        }
        apiClient.setToken(token)
        setUser(cleanUser)
        document.cookie = `tj-track-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
        document.cookie = `jwt=${token}; path=/; max-age=${7 * 24 * 60 * 60}`
      } catch {
        localStorage.removeItem("tj-track-token")
        localStorage.removeItem("tj-track-user")
        document.cookie = 'tj-track-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        document.cookie = 'jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(async (credentials: AuthRequest) => {
    setIsLoading(true)

    try {
      const response = await apiClient.post<{ token: string; email: string; name: string; roles: any }>("/login", credentials)

      if (response.token) {
        const normalizedRoles = Array.isArray(response.roles) 
          ? response.roles.map(r => typeof r === 'string' ? r : r.name)
          : []
        
        const user: ProfileResponse = {
          userId: response.email,
          name: response.name,
          email: response.email,
          isAccountVerified: true,
          isApproved: true,
          roles: normalizedRoles
        }
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

    try {
      const response = await apiClient.post<{ token: string; email: string; name: string; roles: any }>("/verify-otp", { email, otp })

      if (response.token) {
        const normalizedRoles = Array.isArray(response.roles) 
          ? response.roles.map(r => typeof r === 'string' ? r : r.name)
          : []
        
        const user: ProfileResponse = {
          userId: response.email,
          name: response.name,
          email: response.email,
          isAccountVerified: true,
          isApproved: true,
          roles: normalizedRoles
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

  const resendOtp = useCallback(async (email: string) => {
    await apiClient.post("/resend-otp", { email })
  }, [])

  const sendResetOtp = useCallback(async (email: string) => {
    await apiClient.post("/send-reset-otp", undefined, { email })
  }, [])

  const resetPassword = useCallback(async (email: string, otp: string, newPassword: string) => {
    await apiClient.post("/reset-password", { email, otp, newPassword })
  }, [])

  const logout = useCallback(() => {
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
        resendOtp,
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
