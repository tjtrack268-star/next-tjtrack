"use client"

import type React from "react"

import {
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCcw,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useStockStats, useLowStockArticles, useEcommerceStats, useUnreadAlerts, useCommandesMerchant } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import type { AlerteStock, Article } from "@/types/api"

interface KpiCardProps {
  title: string
  value: string | number
  change?: number
  changeLabel?: string
  icon: React.ElementType
  color: "primary" | "success" | "warning" | "destructive"
}

function KpiCard({ title, value, change, changeLabel, icon: Icon, color }: KpiCardProps) {
  const colorClasses = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    destructive: "bg-destructive/10 text-destructive",
  }

  return (
    <Card className="glass-card hover-lift">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={cn("p-3 rounded-xl", colorClasses[color])}>
            <Icon className="h-6 w-6" />
          </div>
          {change !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                change >= 0 ? "border-success/50 text-success" : "border-destructive/50 text-destructive",
              )}
            >
              {change >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {Math.abs(change)}%
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {changeLabel && <p className="text-xs text-muted-foreground mt-1">{changeLabel}</p>}
        </div>
      </CardContent>
    </Card>
  )
}

interface AlertItemProps {
  alert: AlerteStock
}

function AlertItem({ alert }: AlertItemProps) {
  const typeConfig = {
    STOCK_FAIBLE: { color: "warning", label: "Stock faible" },
    RUPTURE_STOCK: { color: "destructive", label: "Rupture" },
    SURSTOCK: { color: "primary", label: "Surstock" },
  }

  const config = typeConfig[alert.type]

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors">
      <div
        className={cn(
          "h-2 w-2 rounded-full",
          config.color === "warning" && "bg-warning",
          config.color === "destructive" && "bg-destructive",
          config.color === "primary" && "bg-primary",
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{alert.article.designation}</p>
        <p className="text-xs text-muted-foreground">
          Stock: {alert.stockActuel} / Seuil: {alert.seuil}
        </p>
      </div>
      <Badge
        variant="outline"
        className={cn(
          config.color === "warning" && "border-warning/50 text-warning",
          config.color === "destructive" && "border-destructive/50 text-destructive",
          config.color === "primary" && "border-primary/50 text-primary",
        )}
      >
        {config.label}
      </Badge>
    </div>
  )
}

interface LowStockItemProps {
  article: Article
}

function LowStockItem({ article }: LowStockItemProps) {
  const percentage = article.seuilAlerte > 0 ? Math.min((article.quantiteStock / article.seuilAlerte) * 100, 100) : 0

  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium truncate">{article.designation}</p>
          <span className="text-xs text-muted-foreground">
            {article.quantiteStock} / {article.seuilAlerte}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
      </div>
    </div>
  )
}

export function StockDashboard() {
  const { user } = useAuth()
  const { data: stockStats, isLoading: isLoadingStats, refetch: refetchStats } = useStockStats()
  const { data: ecommerceStats, isLoading: isLoadingEcommerce } = useEcommerceStats()
  const { data: lowStockArticles, isLoading: isLoadingLowStock } = useLowStockArticles()
  const { data: alerts, isLoading: isLoadingAlerts } = useUnreadAlerts()
  const { data: commandesResponse, isLoading: isLoadingCommandes } = useCommandesMerchant(user?.userId || "")

  const isLoading = isLoadingStats || isLoadingEcommerce || isLoadingCommandes
  
  // Calculer les statistiques réelles à partir des commandes
  const commandesData = Array.isArray(commandesResponse?.data) ? commandesResponse.data : []
  const commandes = (commandesData as unknown[]).map((cmd: unknown) => {
    const c = cmd as Record<string, unknown>
    return {
      statut: String(c.statut || "EN_ATTENTE"),
      montantTotal: Number(c.montantTotal || c.totalTtc) || 0
    }
  })
  
  const totalCommandes = commandes.length
  const commandesEnCours = commandes.filter(c => ['CONFIRMEE', 'EN_PREPARATION', 'EXPEDIEE'].includes(c.statut)).length
  const chiffreAffaires = commandes.reduce((sum, c) => sum + c.montantTotal, 0)
  const panierMoyen = totalCommandes > 0 ? chiffreAffaires / totalCommandes : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!stockStats || !ecommerceStats) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Erreur lors du chargement des données</p>
        <Button variant="outline" onClick={() => refetchStats()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tableau de bord</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetchStats()} disabled={isLoading}>
          <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Chiffre d'Affaires"
          value={`${(chiffreAffaires / 1000).toFixed(0)}k FCFA`}
          changeLabel="vs mois dernier"
          icon={DollarSign}
          color="primary"
        />
        <KpiCard
          title="Commandes"
          value={totalCommandes}
          changeLabel={`${commandesEnCours} en cours`}
          icon={ShoppingCart}
          color="success"
        />
        <KpiCard
          title="Articles en Stock"
          value={stockStats.totalArticles}
          changeLabel={`${stockStats.mouvementsJour} mouvements/jour`}
          icon={Package}
          color="primary"
        />
        <KpiCard
          title="Alertes Stock"
          value={stockStats.articlesEnAlerte}
          changeLabel={`${stockStats.articlesRupture} ruptures`}
          icon={AlertTriangle}
          color={stockStats.articlesRupture > 0 ? "destructive" : "warning"}
        />
      </div>

      {/* Charts & Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Alertes Stock
              </CardTitle>
              <CardDescription>Articles nécessitant attention</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/alertes">Voir tout</a>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingAlerts ? (
              <div className="flex items-center justify-center h-40">
                <Spinner />
              </div>
            ) : alerts && alerts.length > 0 ? (
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune alerte active</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Progress */}
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Stock Critique
              </CardTitle>
              <CardDescription>Articles en dessous du seuil</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/inventaire">Gérer</a>
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingLowStock ? (
              <div className="flex items-center justify-center h-40">
                <Spinner />
              </div>
            ) : lowStockArticles && lowStockArticles.length > 0 ? (
              <div className="space-y-3">
                {lowStockArticles.slice(0, 5).map((article) => (
                  <LowStockItem key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Tous les stocks sont à niveau</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Panier moyen</p>
              <p className="text-lg font-semibold">{Math.round(panierMoyen).toLocaleString()} FCFA</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <ShoppingCart className="h-4 w-4 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taux conversion</p>
              <p className="text-lg font-semibold">2.5%</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <Package className="h-4 w-4 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Valeur stock</p>
              <p className="text-lg font-semibold">{(Number(stockStats.valeurStock) / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </Card>
        <Card className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Ruptures</p>
              <p className="text-lg font-semibold">{stockStats.articlesRupture} articles</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
