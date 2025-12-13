"use client"

import { useAuth } from "@/contexts/auth-context"

export function usePermissions() {
  const { user } = useAuth()

  const hasPermission = (permission: string): boolean => {
    if (!user?.roles) return false
    
    const adminRoles = ['ADMIN', 'MANAGER']
    return user.roles.some(role => adminRoles.includes(role)) || user.roles.includes(permission)
  }

  const requireAdmin = (): boolean => {
    return hasPermission('ADMIN')
  }

  return { hasPermission, requireAdmin, isAdmin: requireAdmin() }
}