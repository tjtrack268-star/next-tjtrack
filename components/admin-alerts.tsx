"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, Users, Bell, TrendingDown } from "lucide-react"
import { useUnreadAlerts, usePendingUsers, useOutOfStockArticles, useLowStockArticles } from "@/hooks/use-api"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

export function AdminAlerts() {
  const { data: alertesStock, isLoading: alertesLoading } = useUnreadAlerts()
  const { data: pendingUsers, isLoading: usersLoading } = usePendingUsers()
  const { data: outOfStock, isLoading: outOfStockLoading } = useOutOfStockArticles()
  const { data: lowStock, isLoading: lowStockLoading } = useLowStockArticles()

  const isLoading = alertesLoading || usersLoading || outOfStockLoading || lowStockLoading

  const alerts = [
    ...(outOfStock && outOfStock.length > 0 ? [{
      id: 'out-of-stock',
      type: 'stock',
      message: `${outOfStock.length} produit${outOfStock.length > 1 ? 's' : ''} en rupture de stock`,
      priority: 'high',
      time: 'Maintenant',
      link: '/dashboard/admin/produits'
    }] : []),
    ...(lowStock && lowStock.length > 0 ? [{
      id: 'low-stock',
      type: 'stock',
      message: `${lowStock.length} produit${lowStock.length > 1 ? 's' : ''} avec stock faible`,
      priority: 'medium',
      time: 'Maintenant',
      link: '/dashboard/admin/produits'
    }] : []),
    ...(pendingUsers && pendingUsers.length > 0 ? [{
      id: 'pending-users',
      type: 'user',
      message: `${pendingUsers.length} nouveau${pendingUsers.length > 1 ? 'x' : ''} compte${pendingUsers.length > 1 ? 's' : ''} en attente`,
      priority: 'low',
      time: 'Maintenant',
      link: '/dashboard/admin/utilisateurs'
    }] : []),
    ...(alertesStock && alertesStock.length > 0 ? [{
      id: 'stock-alerts',
      type: 'stock',
      message: `${alertesStock.length} alerte${alertesStock.length > 1 ? 's' : ''} stock non lue${alertesStock.length > 1 ? 's' : ''}`,
      priority: 'medium',
      time: 'Maintenant',
      link: '/dashboard/admin/produits'
    }] : [])
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'stock': return <Package className="h-4 w-4" />
      case 'user': return <Users className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertes Système
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3 flex-1">
                  <Skeleton className="h-4 w-4" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertes Système
        </CardTitle>
        {alerts.filter(a => a.priority === 'high').length > 0 && (
          <Badge variant="destructive">{alerts.filter(a => a.priority === 'high').length}</Badge>
        )}
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune alerte active</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getIcon(alert.type)}
                  <div>
                    <p className="font-medium">{alert.message}</p>
                    <p className="text-sm text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(alert.priority) as any}>
                    {alert.priority === 'high' ? 'Urgent' : alert.priority === 'medium' ? 'Moyen' : 'Faible'}
                  </Badge>
                  <Link href={alert.link}>
                    <Button variant="ghost" size="sm">
                      Voir
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
