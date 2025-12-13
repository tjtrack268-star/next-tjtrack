"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Package, CreditCard, Users, Bell } from "lucide-react"

export function AdminAlerts() {
  const alerts = [
    { id: 1, type: "stock", message: "23 produits en rupture de stock", priority: "high", time: "Il y a 5 min" },
    { id: 2, type: "payment", message: "3 paiements échoués à traiter", priority: "medium", time: "Il y a 15 min" },
    { id: 3, type: "user", message: "12 nouveaux comptes en attente", priority: "low", time: "Il y a 1h" },
    { id: 4, type: "order", message: "Commande #1234 en retard de livraison", priority: "high", time: "Il y a 2h" },
  ]

  const getIcon = (type: string) => {
    switch (type) {
      case 'stock': return <Package className="h-4 w-4" />
      case 'payment': return <CreditCard className="h-4 w-4" />
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertes Système
        </CardTitle>
        <Badge variant="destructive">{alerts.filter(a => a.priority === 'high').length}</Badge>
      </CardHeader>
      <CardContent>
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
                  {alert.priority}
                </Badge>
                <Button variant="ghost" size="sm">
                  Traiter
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}