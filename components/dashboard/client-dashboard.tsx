"use client"

import { useQuery } from "@tanstack/react-query"
import { 
  ShoppingBag, 
  Heart, 
  Package, 
  Clock, 
  CheckCircle, 
  Truck,
  Star,
  TrendingUp,
  ArrowRight
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import type { Commande, ProduitEcommerceDto } from "@/types/api"

function useClientDashboard() {
  return useQuery({
    queryKey: ["clientDashboard"],
    queryFn: () => apiClient.get("/dashboard/client"),
  })
}

function useUserOrders() {
  return useQuery({
    queryKey: ["userOrders"],
    queryFn: () => apiClient.get<Commande[]>("/commandes/client"),
  })
}

function useFavorites() {
  return useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiClient.get<ProduitEcommerceDto[]>("/ecommerce/favoris"),
  })
}

const statusConfig = {
  "EN_ATTENTE": { label: "En attente", color: "bg-yellow-500", icon: Clock },
  "CONFIRMEE": { label: "Confirmée", color: "bg-blue-500", icon: CheckCircle },
  "EN_PREPARATION": { label: "En préparation", color: "bg-orange-500", icon: Package },
  "EXPEDIEE": { label: "Expédiée", color: "bg-purple-500", icon: Truck },
  "LIVREE": { label: "Livrée", color: "bg-green-500", icon: CheckCircle },
  "ANNULEE": { label: "Annulée", color: "bg-red-500", icon: Package },
}

export function ClientDashboard() {
  const { user } = useAuth()
  const { data: dashboardData, isLoading: isDashboardLoading } = useClientDashboard()
  const { data: orders, isLoading: isOrdersLoading } = useUserOrders()
  const { data: favorites, isLoading: isFavoritesLoading } = useFavorites()

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"
  const formatDate = (date: string) => new Date(date).toLocaleDateString("fr-FR")

  if (isDashboardLoading || isOrdersLoading || isFavoritesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : []
  const totalSpent = Array.isArray(orders) ? orders.reduce((sum, order) => sum + order.montantTotal, 0) : 0
  const ordersInProgress = Array.isArray(orders) ? orders.filter(order => 
    ["EN_ATTENTE", "CONFIRMEE", "EN_PREPARATION", "EXPEDIEE"].includes(order.statut)
  ).length : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-muted-foreground">Voici un aperçu de votre activité</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Mes commandes</p>
              <p className="text-2xl font-bold mt-1">{Array.isArray(orders) ? orders.length : 0}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {ordersInProgress} en cours
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-red-500/10 text-red-500">
                <Heart className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Mes favoris</p>
              <p className="text-2xl font-bold mt-1">{favorites?.length || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">produits sauvés</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Total dépensé</p>
              <p className="text-2xl font-bold mt-1">{formatPrice(totalSpent)}</p>
              <p className="text-xs text-muted-foreground mt-1">depuis le début</p>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-500">
                <Star className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Avis donnés</p>
              <p className="text-2xl font-bold mt-1">0</p>
              <p className="text-xs text-muted-foreground mt-1">évaluations</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders & Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Commandes récentes
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/mes-commandes">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingBag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune commande</p>
                <Button className="mt-4" asChild>
                  <a href="/">Découvrir nos produits</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const StatusIcon = statusConfig[order.statut]?.icon || Package
                  const statusColor = statusConfig[order.statut]?.color || "bg-gray-500"
                  const statusLabel = statusConfig[order.statut]?.label || order.statut

                  return (
                    <div key={order.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium">#{order.numeroCommande}</p>
                          <Badge className={`${statusColor} text-white`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusLabel}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.dateCommande)} • {formatPrice(order.montantTotal)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorites */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Mes favoris
              </CardTitle>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/favoris">
                Voir tout
                <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </CardHeader>
          <CardContent>
            {!favorites || favorites.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucun favori</p>
                <Button className="mt-4" asChild>
                  <a href="/catalogue">Parcourir le catalogue</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.slice(0, 4).map((product) => (
                  <div key={product.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                    <img
                      src={product.images?.[0] || "/placeholder.svg"}
                      alt={product.nom}
                      className="h-12 w-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.nom}</p>
                      <p className="text-sm text-primary font-semibold">
                        {formatPrice(product.prix || 0)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/catalogue">
                <Package className="h-6 w-6" />
                Parcourir
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/mes-commandes">
                <ShoppingBag className="h-6 w-6" />
                Mes commandes
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/favoris">
                <Heart className="h-6 w-6" />
                Mes favoris
              </a>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-2" asChild>
              <a href="/dashboard/parametres">
                <Star className="h-6 w-6" />
                Paramètres
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}