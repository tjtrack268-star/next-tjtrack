"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminGuard } from "@/components/admin-guard"
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package, Eye, MousePointer } from "lucide-react"

export default function AdminAnalyticsPage() {
  const metrics = [
    { title: "Chiffre d'Affaires", value: "€45,231", change: "+12.5%", trend: "up", icon: DollarSign },
    { title: "Commandes", value: "1,234", change: "+8.2%", trend: "up", icon: ShoppingCart },
    { title: "Nouveaux Clients", value: "89", change: "-2.1%", trend: "down", icon: Users },
    { title: "Taux de Conversion", value: "3.2%", change: "+0.5%", trend: "up", icon: MousePointer },
  ]

  const topProducts = [
    { name: "T-shirt Rouge", sales: 234, revenue: "€6,786" },
    { name: "Jeans Bleu", sales: 189, revenue: "€15,111" },
    { name: "Sneakers", sales: 156, revenue: "€20,280" },
    { name: "Veste Noire", sales: 134, revenue: "€13,400" },
  ]

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics & Rapports</h1>
          <p className="text-muted-foreground">Analysez les performances de votre e-commerce</p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className={`text-xs flex items-center ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                  {metric.trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                  {metric.change} ce mois
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produits les Plus Vendus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.sales} ventes</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Sources de Trafic</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Recherche Organique</span>
                  </div>
                  <span className="font-medium">45.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Réseaux Sociaux</span>
                  </div>
                  <span className="font-medium">23.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span>Publicité Payante</span>
                  </div>
                  <span className="font-medium">18.5%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Email Marketing</span>
                  </div>
                  <span className="font-medium">12.5%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Graphique des revenus</p>
                <p className="text-sm text-muted-foreground">Intégration Chart.js à venir</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}