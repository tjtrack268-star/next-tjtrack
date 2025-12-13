"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, AlertCircle, BarChart3 } from "lucide-react"

interface StockAnalyticsProps {
  articles: Array<{
    id: number
    designation: string
    quantiteStock: number
    seuilAlerte: number
    prixUnitaireHt: number
    mouvements?: Array<{ quantite: number; dateCreation: string }>
  }>
}

export function StockAnalytics({ articles }: StockAnalyticsProps) {
  const getRotationClass = (article: any) => {
    const mouvements = article.mouvements || []
    const totalSorties = mouvements.filter(m => m.quantite < 0).reduce((sum, m) => sum + Math.abs(m.quantite), 0)
    const stockMoyen = article.quantiteStock
    const rotation = stockMoyen > 0 ? totalSorties / stockMoyen : 0
    
    if (rotation > 4) return { class: "A", color: "bg-green-500", label: "Forte rotation" }
    if (rotation > 2) return { class: "B", color: "bg-yellow-500", label: "Rotation moyenne" }
    return { class: "C", color: "bg-red-500", label: "Faible rotation" }
  }

  const analyseABC = articles.map(article => ({
    ...article,
    rotation: getRotationClass(article)
  }))

  const classA = analyseABC.filter(a => a.rotation.class === "A")
  const classB = analyseABC.filter(a => a.rotation.class === "B")
  const classC = analyseABC.filter(a => a.rotation.class === "C")

  const articlesPerimes = articles.filter(a => a.quantiteStock === 0).length
  const rotationMoyenne = analyseABC.reduce((sum, a) => sum + (a.rotation.class === "A" ? 3 : a.rotation.class === "B" ? 2 : 1), 0) / articles.length

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Rotation Moyenne</p>
                <p className="text-2xl font-bold">{rotationMoyenne.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Articles Classe A</p>
                <p className="text-2xl font-bold">{classA.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Stock Dormant</p>
                <p className="text-2xl font-bold">{classC.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Taux Rupture</p>
                <p className="text-2xl font-bold">{((articlesPerimes / articles.length) * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyse ABC - Rotation des Stocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Classe A - Forte rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{classA.length} articles</span>
                <Progress value={(classA.length / articles.length) * 100} className="w-20" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Classe B - Rotation moyenne</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{classB.length} articles</span>
                <Progress value={(classB.length / articles.length) * 100} className="w-20" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Classe C - Faible rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{classC.length} articles</span>
                <Progress value={(classC.length / articles.length) * 100} className="w-20" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}