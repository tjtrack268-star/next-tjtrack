"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingCart, Clock, AlertTriangle } from "lucide-react"

interface ReorderSuggestionsProps {
  articles: Array<{
    id: number
    designation: string
    quantiteStock: number
    seuilAlerte: number
    stockMax?: number
    delaiLivraison?: number
    consommationMoyenne?: number
  }>
}

export function ReorderSuggestions({ articles }: ReorderSuggestionsProps) {
  const calculateReorderPoint = (article: any) => {
    const delai = article.delaiLivraison || 7
    const consommation = article.consommationMoyenne || 2
    const stockSecurite = article.seuilAlerte || 5
    return (delai * consommation) + stockSecurite
  }

  const calculateOrderQuantity = (article: any) => {
    const stockMax = article.stockMax || 100
    const currentStock = article.quantiteStock
    const reorderPoint = calculateReorderPoint(article)
    
    if (currentStock <= reorderPoint) {
      return stockMax - currentStock
    }
    return 0
  }

  const articlesToReorder = articles
    .map(article => ({
      ...article,
      reorderPoint: calculateReorderPoint(article),
      orderQuantity: calculateOrderQuantity(article),
      priority: article.quantiteStock === 0 ? 'URGENT' : 
                article.quantiteStock <= article.seuilAlerte ? 'HIGH' : 'MEDIUM'
    }))
    .filter(article => article.orderQuantity > 0)
    .sort((a, b) => {
      const priorityOrder = { URGENT: 3, HIGH: 2, MEDIUM: 1 }
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder]
    })

  const totalOrderValue = articlesToReorder.reduce((sum, article) => 
    sum + (article.orderQuantity * (article.prixUnitaireHt || 0)), 0)

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT': return <Badge variant="destructive">Urgent</Badge>
      case 'HIGH': return <Badge variant="outline" className="border-orange-500 text-orange-500">Priorité</Badge>
      default: return <Badge variant="secondary">Normal</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Articles à Commander</p>
                <p className="text-2xl font-bold">{articlesToReorder.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-muted-foreground">Commandes Urgentes</p>
                <p className="text-2xl font-bold">
                  {articlesToReorder.filter(a => a.priority === 'URGENT').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Valeur Totale</p>
                <p className="text-xl font-bold">{totalOrderValue.toLocaleString()} XAF</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suggestions de Réapprovisionnement</CardTitle>
        </CardHeader>
        <CardContent>
          {articlesToReorder.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Aucun réapprovisionnement nécessaire pour le moment
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead className="text-center">Stock Actuel</TableHead>
                  <TableHead className="text-center">Point de Commande</TableHead>
                  <TableHead className="text-center">Qté à Commander</TableHead>
                  <TableHead className="text-center">Priorité</TableHead>
                  <TableHead className="text-right">Valeur</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articlesToReorder.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.designation}</TableCell>
                    <TableCell className="text-center">
                      <span className={article.quantiteStock === 0 ? "text-red-500 font-bold" : ""}>
                        {article.quantiteStock}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">{article.reorderPoint}</TableCell>
                    <TableCell className="text-center font-bold text-blue-600">
                      {article.orderQuantity}
                    </TableCell>
                    <TableCell className="text-center">
                      {getPriorityBadge(article.priority)}
                    </TableCell>
                    <TableCell className="text-right">
                      {(article.orderQuantity * (article.prixUnitaireHt || 0)).toLocaleString()} XAF
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline">
                        Commander
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}