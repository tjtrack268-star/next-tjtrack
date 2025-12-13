"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  MessageSquare, 
  Percent, 
  Ticket, 
  Search,
  FileText,
  ShieldCheck
} from "lucide-react"

export function AdminQuickNav() {
  const quickActions = [
    { 
      label: "Utilisateurs", 
      href: "/dashboard/admin/utilisateurs", 
      icon: Users, 
      count: 1234,
      description: "Gérer les comptes"
    },
    { 
      label: "Validations", 
      href: "/dashboard/admin/validations", 
      icon: ShieldCheck, 
      count: 12,
      description: "En attente",
      urgent: true
    },
    { 
      label: "Produits", 
      href: "/dashboard/admin/produits", 
      icon: Package, 
      count: 5678,
      description: "Catalogue complet"
    },
    { 
      label: "Commandes", 
      href: "/dashboard/admin/commandes", 
      icon: ShoppingCart, 
      count: 89,
      description: "Nouvelles commandes"
    },
    { 
      label: "Messages", 
      href: "/dashboard/admin/communication", 
      icon: MessageSquare, 
      count: 6,
      description: "Non lus",
      urgent: true
    },
    { 
      label: "Support", 
      href: "/dashboard/admin/support", 
      icon: Ticket, 
      count: 8,
      description: "Tickets ouverts"
    },
    { 
      label: "Analytics", 
      href: "/dashboard/admin/analytics", 
      icon: BarChart3, 
      count: null,
      description: "Rapports"
    },
    { 
      label: "Promotions", 
      href: "/dashboard/admin/promotions", 
      icon: Percent, 
      count: 5,
      description: "Actives"
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Rapide</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto p-4 flex-col gap-2 relative"
              asChild
            >
              <a href={action.href}>
                <div className="flex items-center gap-2 w-full">
                  <action.icon className="h-5 w-5" />
                  <span className="font-medium">{action.label}</span>
                  {action.urgent && (
                    <Badge variant="destructive" className="text-xs">
                      !
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between w-full text-xs text-muted-foreground">
                  <span>{action.description}</span>
                  {action.count !== null && (
                    <Badge variant="secondary" className="text-xs">
                      {action.count}
                    </Badge>
                  )}
                </div>
              </a>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}