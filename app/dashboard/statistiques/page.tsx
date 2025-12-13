"use client"

import { TrendingUp, ShoppingCart, DollarSign, Package, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { useEcommerceStats, useStockStats, useCommandesMerchant } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"

// Fallback data if API returns empty
const defaultRevenueData = [
  { month: "Jan", revenue: 0, orders: 0 },
  { month: "Fév", revenue: 0, orders: 0 },
  { month: "Mar", revenue: 0, orders: 0 },
  { month: "Avr", revenue: 0, orders: 0 },
  { month: "Mai", revenue: 0, orders: 0 },
  { month: "Juin", revenue: 0, orders: 0 },
]

const defaultCategoryData = [
  { name: "Électronique", value: 35, color: "#1fad9f" },
  { name: "Mode", value: 25, color: "#166f69" },
  { name: "Maison", value: 20, color: "#f59e0b" },
  { name: "Beauté", value: 12, color: "#8b5cf6" },
  { name: "Autres", value: 8, color: "#6b7280" },
]

export default function StatistiquesPage() {
  const { user } = useAuth()
  const { data: ecommerceStats, isLoading: isLoadingEcommerce, error: errorEcommerce, refetch: refetchEcommerce } = useEcommerceStats()
  const { data: stockStats, isLoading: isLoadingStock, error: errorStock, refetch: refetchStock } = useStockStats()
  const { data: commandesResponse, isLoading: isLoadingCommandes } = useCommandesMerchant(user?.userId || "")

  const isLoading = isLoadingEcommerce || isLoadingStock || isLoadingCommandes
  const error = errorEcommerce || errorStock

  // Calculer les statistiques à partir des vraies commandes
  const commandesData = Array.isArray(commandesResponse?.data) ? commandesResponse.data : []
  const commandes = (commandesData as unknown[]).map((cmd: unknown) => {
    const c = cmd as Record<string, unknown>
    return {
      id: Number(c.id) || 0,
      statut: String(c.statut || "EN_ATTENTE"),
      montantTotal: Number(c.montantTotal || c.totalTtc) || 0,
      dateCommande: String(c.dateCommande || new Date().toISOString())
    }
  })

  const totalOrders = commandes.length
  const totalRevenue = commandes.reduce((sum, c) => sum + c.montantTotal, 0)
  const averageCart = totalOrders > 0 ? totalRevenue / totalOrders : 0
  const conversionRate = 2.5 // Valeur par défaut

  // Générer des données de revenus par mois basées sur les vraies commandes
  const revenueData = defaultRevenueData.map((month, index) => {
    const monthCommandes = commandes.filter(c => {
      const date = new Date(c.dateCommande)
      return date.getMonth() === index
    })
    return {
      ...month,
      revenue: monthCommandes.reduce((sum, c) => sum + c.montantTotal, 0),
      orders: monthCommandes.length
    }
  })

  const categoryData = defaultCategoryData
  const topProducts: { name: string; sales: number; revenue: number }[] = []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-destructive">Erreur lors du chargement des statistiques</p>
        <Button onClick={() => { refetchEcommerce(); refetchStock(); }}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Statistiques E-commerce</h1>
          <p className="text-muted-foreground">Analysez les performances de votre boutique</p>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">7 derniers jours</SelectItem>
            <SelectItem value="30days">30 derniers jours</SelectItem>
            <SelectItem value="6months">6 derniers mois</SelectItem>
            <SelectItem value="1year">1 an</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Chiffre d'affaires</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} XAF</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +12.5% vs période préc.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Commandes</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +8.2% vs période préc.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Panier Moyen</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageCart).toLocaleString()} XAF</div>
            <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3" />
              -2.3% vs période préc.
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Taux Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-emerald-500 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3" />
              +0.8% vs période préc.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="glass-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Évolution du Chiffre d'Affaires</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1fad9f" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#1fad9f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    formatter={(value: number) => [`${value.toLocaleString()} XAF`, "CA"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#1fad9f" strokeWidth={2} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Ventes par Catégorie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    formatter={(value: number) => [`${value}%`, "Part"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Chart & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Commandes par Mois</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" />
                  <Tooltip contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }} />
                  <Bar dataKey="orders" fill="#1fad9f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Top Produits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Aucune donnée disponible</p>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} ventes</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.revenue.toLocaleString()} XAF</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
