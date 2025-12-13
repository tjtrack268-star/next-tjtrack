"use client"

import { AdminGuard } from "@/components/admin-guard"
import { AdminAnalytics } from "@/components/admin-analytics"
import { AdminAlerts } from "@/components/admin-alerts"
import { ContentManagement } from "@/components/content-management"
import { PromotionManager } from "@/components/promotion-manager"
import { SEOManager } from "@/components/seo-manager"
import { MerchantRelations } from "@/components/merchant-relations"
import { SupportTickets } from "@/components/support-tickets"
import { AdminQuickNav } from "@/components/admin-quick-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Users, Package, ShoppingCart, Settings, FileText, TrendingUp, MessageSquare } from "lucide-react"

export default function AdminDashboard() {
  const quickActions = [
    { label: "Dashboard Complet", icon: BarChart3, href: "/dashboard/admin/dashboard" },
    { label: "Gérer les utilisateurs", icon: Users, href: "/dashboard/admin/utilisateurs" },
    { label: "Gérer les produits", icon: Package, href: "/dashboard/admin/produits" },
    { label: "Voir les commandes", icon: ShoppingCart, href: "/dashboard/admin/commandes" },
    { label: "Analytics", icon: TrendingUp, href: "/dashboard/admin/analytics" },
    { label: "Communication", icon: MessageSquare, href: "/dashboard/admin/communication" },
    { label: "Contenu", icon: FileText, href: "/dashboard/admin/contenu" },
    { label: "Paramètres", icon: Settings, href: "/dashboard/admin/parametres" },
  ]

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrateur</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre plateforme e-commerce</p>
        </div>

        {/* Analytics Cards */}
        <AdminAnalytics />

        {/* Quick Navigation */}
        <AdminQuickNav />

        <div className="grid gap-6 md:grid-cols-2">
          {/* Alerts */}
          <AdminAlerts />
          
          {/* Content Management */}
          <ContentManagement />
        </div>

        {/* Promotions */}
        <PromotionManager />

        {/* SEO Tools */}
        <SEOManager />

        {/* Business Relations */}
        <div className="grid gap-6 md:grid-cols-1">
          <MerchantRelations />
          <SupportTickets />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Activité Récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Nouvelle commande #1234</p>
                  <p className="text-sm text-muted-foreground">Client: Jean Dupont - €89.99</p>
                </div>
                <span className="text-sm text-muted-foreground">Il y a 2 min</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Nouveau compte marchand</p>
                  <p className="text-sm text-muted-foreground">Boutique ABC en attente d'approbation</p>
                </div>
                <span className="text-sm text-muted-foreground">Il y a 15 min</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Stock faible détecté</p>
                  <p className="text-sm text-muted-foreground">Produit "T-shirt Rouge" - 3 unités restantes</p>
                </div>
                <span className="text-sm text-muted-foreground">Il y a 1h</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}