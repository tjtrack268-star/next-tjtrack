"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Package, AlertTriangle, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useDashboardStats, useAllUsers, useStockStats } from "@/hooks/use-api"

export function AdminAnalytics() {
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats()
  const { data: usersData, isLoading: usersLoading } = useAllUsers({ page: 1, limit: 1 })
  const { data: stockStats, isLoading: stockLoading } = useStockStats()

  const StatCard = ({ title, value, change, icon: Icon, trend, isLoading }: {
    title: string
    value: string | number
    change: string
    icon: any
    trend: 'up' | 'down'
    isLoading?: boolean
  }) => {
    if (isLoading) {
      return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <div className="flex items-center text-xs">
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
            )}
            <span className={trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {change}
            </span>
            <span className="text-muted-foreground ml-1">ce mois</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="CA Total"
        value={`€${(dashboardStats?.totalRevenue || 0).toLocaleString()}`}
        change="+12.5%"
        icon={DollarSign}
        trend="up"
        isLoading={statsLoading}
      />
      
      <StatCard
        title="Commandes"
        value={(dashboardStats?.totalOrders || 0).toLocaleString()}
        change="+8.2%"
        icon={ShoppingCart}
        trend="up"
        isLoading={statsLoading}
      />
      
      <StatCard
        title="Utilisateurs"
        value={(usersData?.total || 0).toLocaleString()}
        change="+15.3%"
        icon={Users}
        trend="up"
        isLoading={usersLoading}
      />
      
      <StatCard
        title="Alertes Stock"
        value={dashboardStats?.lowStockAlerts || 0}
        change="-2.1%"
        icon={AlertTriangle}
        trend="down"
        isLoading={statsLoading}
      />
    </div>
  )
}