"use client"

import { StockDashboard } from "@/components/dashboard/stock-dashboard"
import { ClientDashboard } from "@/components/dashboard/client-dashboard"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user } = useAuth()
  
  // Show different dashboard based on user role
  if (user?.roles?.includes("CLIENT")) {
    return <ClientDashboard />
  }
  
  return <StockDashboard />
}
