"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Calendar } from "lucide-react"

interface MovementAnalyticsProps {
  mouvements: Array<{
    id: number
    typeMouvement: string
    quantite: number
    dateMouvement: string
    articleDesignation: string
    motif?: string
  }>
}

export function MovementAnalytics({ mouvements }: MovementAnalyticsProps) {
  const today = new Date()
  const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1)

  const getMovementsInPeriod = (startDate: Date) => {
    return mouvements.filter(m => new Date(m.dateMouvement) >= startDate)
  }

  const weekMovements = getMovementsInPeriod(thisWeek)
  const monthMovements = getMovementsInPeriod(thisMonth)

  const calculateStats = (movements: typeof mouvements) => {
    const entrees = movements.filter(m => m.typeMouvement === "ENTREE")
    const sorties = movements.filter(m => m.typeMouvement === "SORTIE")
    
    return {
      totalEntrees: entrees.reduce((sum, m) => sum + m.quantite, 0),
      totalSorties: sorties.reduce((sum, m) => sum + m.quantite, 0),
      nbEntrees: entrees.length,
      nbSorties: sorties.length,
      rotation: sorties.length > 0 ? entrees.reduce((sum, m) => sum + m.quantite, 0) / sorties.reduce((sum, m) => sum + m.quantite, 0) : 0
    }
  }

  const weekStats = calculateStats(weekMovements)
  const monthStats = calculateStats(monthMovements)

  const topArticles = mouvements
    .reduce((acc, m) => {
      const existing = acc.find(a => a.article === m.articleDesignation)
      if (existing) {
        existing.totalMouvements += Math.abs(m.quantite)
        existing.count += 1
      } else {
        acc.push({
          article: m.articleDesignation,
          totalMouvements: Math.abs(m.quantite),
          count: 1
        })
      }
      return acc
    }, [] as Array<{ article: string; totalMouvements: number; count: number }>)
    .sort((a, b) => b.totalMouvements - a.totalMouvements)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cette Semaine
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  Entrées
                </span>
                <span className="font-bold text-green-500">+{weekStats.totalEntrees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  Sorties
                </span>
                <span className="font-bold text-red-500">-{weekStats.totalSorties}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ce Mois
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3 text-green-500" />
                  Entrées
                </span>
                <span className="font-bold text-green-500">+{monthStats.totalEntrees}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3 text-red-500" />
                  Sorties
                </span>
                <span className="font-bold text-red-500">-{monthStats.totalSorties}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Tendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Ratio E/S</span>
                <Badge variant={monthStats.rotation > 1 ? "default" : "destructive"}>
                  {monthStats.rotation.toFixed(2)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Activité</span>
                <Badge variant={monthMovements.length > 10 ? "default" : "secondary"}>
                  {monthMovements.length > 20 ? "Élevée" : monthMovements.length > 10 ? "Moyenne" : "Faible"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Articles les Plus Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topArticles.map((item, index) => (
              <div key={item.article} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </div>
                  <span className="font-medium truncate">{item.article}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{item.count} mvts</Badge>
                  <span className="font-bold">{item.totalMouvements}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}