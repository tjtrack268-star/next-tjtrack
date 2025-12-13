"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from "recharts"
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, Package, DollarSign, 
  AlertTriangle, Eye, MousePointer, Star, Clock, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"
import { 
  useDashboardStats, useAllUsers, useCommandesClient, useMerchantProduits,
  useEcommerceStats, useStockStats, useSystemAlerts, useRevenueAnalytics,
  useTopProducts, useOrderAnalytics
} from "@/hooks/use-api"

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'LIVREE': '#00C49F',
    'EN_COURS': '#FFBB28', 
    'EN_ATTENTE': '#FF8042',
    'ANNULEE': '#FF6B6B'
  }
  return colors[status] || '#8884D8'
}

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState("7d")
  
  const { data: dashboardStats, isLoading: statsLoading } = useDashboardStats()
  const { data: usersData } = useAllUsers({ page: 1, limit: 1000 })
  const { data: ordersData } = useCommandesClient()
  const { data: ecommerceStats } = useEcommerceStats()
  const { data: stockStats } = useStockStats()
  const { data: systemAlerts } = useSystemAlerts()

  // Calculate metrics
  const totalUsers = usersData?.total || 0
  const totalOrders = ordersData?.length || 0
  const totalRevenue = dashboardStats?.totalRevenue || 0
  const totalProducts = dashboardStats?.totalProducts || 0

  // User distribution by role
  const usersByRole = useMemo(() => {
    if (!usersData?.users) return []
    const roleCount = usersData.users.reduce((acc, user) => {
      const role = user.roles?.[0] || 'CLIENT'
      acc[role] = (acc[role] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(roleCount).map(([role, count]) => ({
      name: role,
      value: count,
      percentage: ((count / totalUsers) * 100).toFixed(1)
    }))
  }, [usersData, totalUsers])

  // Real API data
  const { data: revenueData } = useRevenueAnalytics(timeRange)
  const { data: topProductsData } = useTopProducts(4)
  const { data: orderAnalyticsData } = useOrderAnalytics()
  
  const revenueTrend = revenueData || []
  const topProducts = topProductsData || []
  const orderStatus = orderAnalyticsData?.statusDistribution?.map(status => ({
    name: status.status,
    value: status.percentage,
    color: getStatusColor(status.status)
  })) || []

  const StatCard = ({ title, value, change, icon: Icon, trend }: {
    title: string
    value: string | number
    change: string
    icon: any
    trend: 'up' | 'down'
  }) => (
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
          <span className="text-muted-foreground ml-1">vs mois dernier</span>
        </div>
      </CardContent>
    </Card>
  )

  if (statsLoading) {
    return (
      <AdminGuard>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminGuard>
    )
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
            <p className="text-muted-foreground">Vue d'ensemble complète de votre plateforme</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Dernières 24h</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">90 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Chiffre d'Affaires"
            value={`€${totalRevenue.toLocaleString()}`}
            change="+12.5%"
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="Commandes Totales"
            value={totalOrders.toLocaleString()}
            change="+8.2%"
            icon={ShoppingCart}
            trend="up"
          />
          <StatCard
            title="Utilisateurs Actifs"
            value={totalUsers.toLocaleString()}
            change="+15.3%"
            icon={Users}
            trend="up"
          />
          <StatCard
            title="Produits en Stock"
            value={totalProducts.toLocaleString()}
            change="-2.1%"
            icon={Package}
            trend="down"
          />
        </div>

        {/* Alerts */}
        {systemAlerts && systemAlerts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                Alertes Système ({systemAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {systemAlerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                        {alert.priority}
                      </Badge>
                      <span className="text-sm">{alert.message}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{alert.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="sales">Ventes</TabsTrigger>
            <TabsTrigger value="users">Utilisateurs</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Revenue Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`€${value}`, 'CA']} />
                        <Area type="monotone" dataKey="revenue" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      Aucune donnée de revenus disponible
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatus}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}%`}
                      >
                        {orderStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Produits les Plus Performants</CardTitle>
              </CardHeader>
              <CardContent>
                {topProducts && topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{index + 1}</span>
                          </div>
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.sales} ventes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">€{Number(product.revenue).toLocaleString()}</p>
                          <div className="flex items-center gap-1">
                            {product.growth > 0 ? (
                              <TrendingUp className="h-3 w-3 text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 text-red-500" />
                            )}
                            <span className={`text-xs ${product.growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {product.growth > 0 ? '+' : ''}{product.growth.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Connectez votre base de données pour voir les produits performants
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sales" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ventes par Mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={revenueTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Métriques de Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Taux de Conversion</span>
                      <span>3.2%</span>
                    </div>
                    <Progress value={32} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Panier Moyen</span>
                      <span>€67.50</span>
                    </div>
                    <Progress value={67} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>Taux de Rétention</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par Rôle</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={usersByRole}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {usersByRole.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistiques Utilisateurs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {usersByRole.map((role, index) => (
                    <div key={role.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{role.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{role.value}</span>
                        <span className="text-xs text-muted-foreground ml-2">({role.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Stock Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalProducts}</div>
                  <p className="text-xs text-muted-foreground">Produits actifs</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Alertes Stock</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">{dashboardStats?.lowStockAlerts || 0}</div>
                  <p className="text-xs text-muted-foreground">Stock faible</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Ruptures</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-500">{dashboardStats?.outOfStockProducts || 0}</div>
                  <p className="text-xs text-muted-foreground">Produits épuisés</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}