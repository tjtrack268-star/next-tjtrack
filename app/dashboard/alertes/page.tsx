"use client"

import { useState } from "react"
import { AlertTriangle, Bell, BellOff, Check, TrendingDown, TrendingUp, RefreshCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Spinner } from "@/components/ui/spinner"
import { useUnreadAlerts, useLowStockArticles, useOutOfStockArticles } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { AlerteStock, Article } from "@/types/api"

// Mock alerts
const mockAlerts: AlerteStock[] = [
  {
    id: 1,
    article: {
      id: 2,
      codeArticle: "ART002",
      designation: "MacBook Air M3",
      quantiteStock: 8,
      seuilAlerte: 10,
    } as Article,
    type: "STOCK_FAIBLE",
    seuil: 10,
    stockActuel: 8,
    message: "Stock en dessous du seuil d'alerte",
    lu: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    article: {
      id: 4,
      codeArticle: "ART004",
      designation: "Samsung Galaxy S24 Ultra",
      quantiteStock: 0,
      seuilAlerte: 5,
    } as Article,
    type: "RUPTURE_STOCK",
    seuil: 5,
    stockActuel: 0,
    message: "Rupture de stock",
    lu: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 3,
    article: {
      id: 7,
      codeArticle: "ART007",
      designation: "Dell XPS 15 OLED",
      quantiteStock: 4,
      seuilAlerte: 5,
    } as Article,
    type: "STOCK_FAIBLE",
    seuil: 5,
    stockActuel: 4,
    message: "Stock en dessous du seuil d'alerte",
    lu: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 4,
    article: {
      id: 6,
      codeArticle: "ART006",
      designation: "AirPods Pro 2",
      quantiteStock: 95,
      seuilAlerte: 15,
    } as Article,
    type: "SURSTOCK",
    seuil: 80,
    stockActuel: 95,
    message: "Surstock détecté",
    lu: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

const mockLowStock: Article[] = [
  {
    id: 2,
    codeArticle: "ART002",
    designation: "MacBook Air M3",
    quantiteStock: 8,
    seuilAlerte: 10,
    prixUnitaireHt: 850000,
    statut: "ACTIF",
  } as Article,
  {
    id: 7,
    codeArticle: "ART007",
    designation: "Dell XPS 15 OLED",
    quantiteStock: 4,
    seuilAlerte: 5,
    prixUnitaireHt: 980000,
    statut: "ACTIF",
  } as Article,
]

const mockOutOfStock: Article[] = [
  {
    id: 4,
    codeArticle: "ART004",
    designation: "Samsung Galaxy S24 Ultra",
    quantiteStock: 0,
    seuilAlerte: 5,
    prixUnitaireHt: 580000,
    statut: "ACTIF",
  } as Article,
]

export default function AlertesPage() {
  const [selectedAlerts, setSelectedAlerts] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState("all")

  const { data: apiAlerts, isLoading: isLoadingAlerts, refetch: refetchAlerts } = useUnreadAlerts()
  const { data: apiLowStock, isLoading: isLoadingLow } = useLowStockArticles()
  const { data: apiOutOfStock, isLoading: isLoadingOut } = useOutOfStockArticles()

  const alerts = apiAlerts?.length ? apiAlerts : mockAlerts
  const lowStock = apiLowStock?.length ? apiLowStock : mockLowStock
  const outOfStock = apiOutOfStock?.length ? apiOutOfStock : mockOutOfStock

  const isLoading = isLoadingAlerts || isLoadingLow || isLoadingOut

  const unreadCount = alerts.filter((a) => !a.lu).length
  const lowStockCount = alerts.filter((a) => a.type === "STOCK_FAIBLE").length
  const outOfStockCount = alerts.filter((a) => a.type === "RUPTURE_STOCK").length
  const overstockCount = alerts.filter((a) => a.type === "SURSTOCK").length

  const filteredAlerts =
    activeTab === "all"
      ? alerts
      : alerts.filter((a) => {
          if (activeTab === "low") return a.type === "STOCK_FAIBLE"
          if (activeTab === "out") return a.type === "RUPTURE_STOCK"
          if (activeTab === "over") return a.type === "SURSTOCK"
          return true
        })

  const toggleAlertSelection = (alertId: number) => {
    setSelectedAlerts((prev) => (prev.includes(alertId) ? prev.filter((id) => id !== alertId) : [...prev, alertId]))
  }

  const selectAll = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([])
    } else {
      setSelectedAlerts(filteredAlerts.map((a) => a.id))
    }
  }

  const getAlertIcon = (type: AlerteStock["type"]) => {
    switch (type) {
      case "RUPTURE_STOCK":
        return <TrendingDown className="h-5 w-5" />
      case "STOCK_FAIBLE":
        return <AlertTriangle className="h-5 w-5" />
      case "SURSTOCK":
        return <TrendingUp className="h-5 w-5" />
    }
  }

  const getAlertColor = (type: AlerteStock["type"]) => {
    switch (type) {
      case "RUPTURE_STOCK":
        return "destructive"
      case "STOCK_FAIBLE":
        return "warning"
      case "SURSTOCK":
        return "primary"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return "Il y a moins d'1 heure"
    if (diffHours < 24) return `Il y a ${diffHours}h`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Hier"
    return `Il y a ${diffDays} jours`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-6 w-6 text-primary" />
            Alertes Stock
          </h1>
          <p className="text-muted-foreground">
            {unreadCount} alerte{unreadCount > 1 ? "s" : ""} non lue{unreadCount > 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetchAlerts()}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {selectedAlerts.length > 0 && (
            <Button variant="outline" size="sm">
              <Check className="h-4 w-4 mr-2" />
              Marquer comme lu ({selectedAlerts.length})
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className="glass-card cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setActiveTab("all")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Toutes</p>
                <p className="text-2xl font-bold">{alerts.length}</p>
              </div>
              <Bell className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="glass-card cursor-pointer hover:border-destructive/50 transition-colors"
          onClick={() => setActiveTab("out")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ruptures</p>
                <p className="text-2xl font-bold text-destructive">{outOfStockCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="glass-card cursor-pointer hover:border-warning/50 transition-colors"
          onClick={() => setActiveTab("low")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card
          className="glass-card cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setActiveTab("over")}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Surstock</p>
                <p className="text-2xl font-bold text-primary">{overstockCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts List */}
      <Card className="glass-card">
        <CardHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <CardTitle>Liste des alertes</CardTitle>
            <div className="flex items-center gap-2">
              <Checkbox
                checked={selectedAlerts.length === filteredAlerts.length && filteredAlerts.length > 0}
                onCheckedChange={selectAll}
              />
              <span className="text-sm text-muted-foreground">Tout sélectionner</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-medium mb-1">Aucune alerte</h3>
              <p className="text-sm text-muted-foreground">Toutes vos alertes ont été traitées</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAlerts.map((alert, index) => {
                const color = getAlertColor(alert.type)
                const isSelected = selectedAlerts.includes(alert.id)

                return (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex items-start gap-4 p-4 transition-colors animate-fade-in",
                      !alert.lu && "bg-secondary/30",
                      isSelected && "bg-primary/5",
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleAlertSelection(alert.id)} />
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        color === "destructive" && "bg-destructive/10 text-destructive",
                        color === "warning" && "bg-warning/10 text-warning",
                        color === "primary" && "bg-primary/10 text-primary",
                      )}
                    >
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium">{alert.article.designation}</h4>
                          <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            color === "destructive" && "border-destructive/50 text-destructive",
                            color === "warning" && "border-warning/50 text-warning",
                            color === "primary" && "border-primary/50 text-primary",
                          )}
                        >
                          {alert.type === "RUPTURE_STOCK" && "Rupture"}
                          {alert.type === "STOCK_FAIBLE" && "Stock faible"}
                          {alert.type === "SURSTOCK" && "Surstock"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          Stock: <span className="font-medium text-foreground">{alert.stockActuel}</span> / Seuil:{" "}
                          {alert.seuil}
                        </span>
                        <span className="text-muted-foreground">{formatDate(alert.createdAt)}</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Commander
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-destructive" />
              Articles en rupture
            </CardTitle>
            <CardDescription>Actions rapides pour réapprovisionner</CardDescription>
          </CardHeader>
          <CardContent>
            {outOfStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Aucune rupture de stock</p>
            ) : (
              <div className="space-y-3">
                {outOfStock.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                  >
                    <div>
                      <p className="font-medium">{article.designation}</p>
                      <p className="text-sm text-muted-foreground">{article.codeArticle}</p>
                    </div>
                    <Button size="sm" className="gradient-primary text-white">
                      Commander
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Stock critique
            </CardTitle>
            <CardDescription>Articles nécessitant un réapprovisionnement</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Tous les stocks sont à niveau</p>
            ) : (
              <div className="space-y-3">
                {lowStock.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-warning/5 border border-warning/20"
                  >
                    <div>
                      <p className="font-medium">{article.designation}</p>
                      <p className="text-sm text-muted-foreground">
                        Stock: {article.quantiteStock} / Seuil: {article.seuilAlerte}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      Ajuster
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
