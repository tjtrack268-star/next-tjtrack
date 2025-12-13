"use client"

import { useState } from "react"
import { Package, Search, Plus, Download, Upload, Edit, Trash2, AlertTriangle, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Spinner } from "@/components/ui/spinner"
import { useArticles, useAjusterStock } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { ArticleDto } from "@/types/api"
import { StockAnalytics } from "@/components/stock/stock-analytics"

// Mock data
const mockArticles: ArticleDto[] = [
  {
    id: 1,
    codeArticle: "ART001",
    designation: "iPhone 15 Pro Max",
    prixUnitaireHt: 650000,
    prixUnitaireTtc: 767000,
    quantiteStock: 25,
    seuilAlerte: 5,
    stockMax: 50,
    categorieDesignation: "Électronique",
    stockFaible: false,
  },
  {
    id: 2,
    codeArticle: "ART002",
    designation: "MacBook Air M3",
    prixUnitaireHt: 850000,
    prixUnitaireTtc: 1003000,
    quantiteStock: 8,
    seuilAlerte: 10,
    stockMax: 30,
    categorieDesignation: "Électronique",
    stockFaible: true,
  },
  {
    id: 3,
    codeArticle: "ART003",
    designation: "Casque Sony WH-1000XM5",
    prixUnitaireHt: 185000,
    prixUnitaireTtc: 218300,
    quantiteStock: 42,
    seuilAlerte: 10,
    stockMax: 100,
    categorieDesignation: "Audio",
    stockFaible: false,
  },
  {
    id: 4,
    codeArticle: "ART004",
    designation: "Samsung Galaxy S24 Ultra",
    prixUnitaireHt: 580000,
    prixUnitaireTtc: 684400,
    quantiteStock: 0,
    seuilAlerte: 5,
    stockMax: 40,
    categorieDesignation: "Électronique",
    stockFaible: true,
  },
  {
    id: 5,
    codeArticle: "ART005",
    designation: 'iPad Pro 12.9"',
    prixUnitaireHt: 720000,
    prixUnitaireTtc: 849600,
    quantiteStock: 15,
    seuilAlerte: 5,
    stockMax: 25,
    categorieDesignation: "Électronique",
    stockFaible: false,
  },
  {
    id: 6,
    codeArticle: "ART006",
    designation: "AirPods Pro 2",
    prixUnitaireHt: 145000,
    prixUnitaireTtc: 171100,
    quantiteStock: 58,
    seuilAlerte: 15,
    stockMax: 100,
    categorieDesignation: "Audio",
    stockFaible: false,
  },
  {
    id: 7,
    codeArticle: "ART007",
    designation: "Dell XPS 15 OLED",
    prixUnitaireHt: 980000,
    prixUnitaireTtc: 1156400,
    quantiteStock: 4,
    seuilAlerte: 5,
    stockMax: 20,
    categorieDesignation: "Électronique",
    stockFaible: true,
  },
  {
    id: 8,
    codeArticle: "ART008",
    designation: "Nintendo Switch OLED",
    prixUnitaireHt: 220000,
    prixUnitaireTtc: 259600,
    quantiteStock: 22,
    seuilAlerte: 10,
    stockMax: 50,
    categorieDesignation: "Gaming",
    stockFaible: false,
  },
]

export default function InventairePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<ArticleDto | null>(null)
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("")
  const [adjustmentReason, setAdjustmentReason] = useState("")
  const [isAdjustDialogOpen, setIsAdjustDialogOpen] = useState(false)
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStock, setFilterStock] = useState("all")

  const { data: apiArticles, isLoading } = useArticles()
  const adjustStock = useAjusterStock()

  const articles = apiArticles?.length ? apiArticles : mockArticles

  // Filter articles
  const filteredArticles = articles.filter((article) => {
    if (
      searchQuery &&
      !article.designation.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !article.codeArticle.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    if (filterCategory !== "all" && article.categorieDesignation !== filterCategory) {
      return false
    }
    if (filterStock === "low" && !article.stockFaible) return false
    if (filterStock === "out" && (article.quantiteStock || 0) > 0) return false
    if (filterStock === "normal" && (article.stockFaible || (article.quantiteStock || 0) === 0)) return false
    return true
  })

  const categories = [...new Set(articles.map((a) => a.categorieDesignation).filter(Boolean))]

  const handleAdjustStock = async () => {
    if (!selectedArticle || !adjustmentQuantity || !adjustmentReason) return

    try {
      await adjustStock.mutateAsync({
        articleId: selectedArticle.id!,
        quantity: Number.parseInt(adjustmentQuantity),
        reason: adjustmentReason,
        userId: 1,
      })
      setIsAdjustDialogOpen(false)
      setSelectedArticle(null)
      setAdjustmentQuantity("")
      setAdjustmentReason("")
    } catch (error) {
      console.error("Erreur ajustement stock:", error)
    }
  }

  const openAdjustDialog = (article: ArticleDto) => {
    setSelectedArticle(article)
    setIsAdjustDialogOpen(true)
  }

  const getStockStatus = (article: ArticleDto) => {
    const stock = article.quantiteStock || 0
    const seuil = article.seuilAlerte || 0

    if (stock === 0) return { label: "Rupture", variant: "destructive" as const, color: "destructive" }
    if (stock <= seuil) return { label: "Stock faible", variant: "warning" as const, color: "warning" }
    return { label: "En stock", variant: "success" as const, color: "success" }
  }

  const getStockPercentage = (article: ArticleDto) => {
    const max = article.stockMax || 100
    const current = article.quantiteStock || 0
    return Math.min((current / max) * 100, 100)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Inventaire</h1>
          <p className="text-muted-foreground">Gérez votre stock en temps réel</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button className="gradient-primary text-white" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel article
          </Button>
        </div>
      </div>

      {/* Analytics intégrés */}
      <StockAnalytics articles={articles} />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total articles</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Package className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En stock</p>
                <p className="text-2xl font-bold">
                  {articles.filter((a) => (a.quantiteStock || 0) > (a.seuilAlerte || 0)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold">
                  {articles.filter((a) => a.stockFaible && (a.quantiteStock || 0) > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ruptures</p>
                <p className="text-2xl font-bold">{articles.filter((a) => (a.quantiteStock || 0) === 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom ou code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-0"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px] bg-secondary/50 border-0">
                <SelectValue placeholder="Catégorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat!}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStock} onValueChange={setFilterStock}>
              <SelectTrigger className="w-[180px] bg-secondary/50 border-0">
                <SelectValue placeholder="État stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="normal">En stock</SelectItem>
                <SelectItem value="low">Stock faible</SelectItem>
                <SelectItem value="out">Rupture</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Article</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead className="text-right">Prix TTC</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => {
                  const status = getStockStatus(article)
                  const stockPercent = getStockPercentage(article)

                  return (
                    <TableRow key={article.id} className="hover:bg-secondary/30">
                      <TableCell className="font-medium">{article.designation}</TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">{article.codeArticle}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{article.categorieDesignation}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {article.prixUnitaireTtc?.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>{article.quantiteStock}</span>
                            <span className="text-muted-foreground">/ {article.stockMax || "-"}</span>
                          </div>
                          <Progress
                            value={stockPercent}
                            className={cn(
                              "h-2",
                              status.color === "destructive" && "[&>div]:bg-destructive",
                              status.color === "warning" && "[&>div]:bg-warning",
                              status.color === "success" && "[&>div]:bg-success",
                            )}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            status.color === "destructive" && "border-destructive/50 text-destructive",
                            status.color === "warning" && "border-warning/50 text-warning",
                            status.color === "success" && "border-success/50 text-success",
                          )}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openAdjustDialog(article)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Ajuster stock
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Package className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={isAdjustDialogOpen} onOpenChange={setIsAdjustDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Ajuster le stock</DialogTitle>
            <DialogDescription>
              {selectedArticle?.designation} - Stock actuel: {selectedArticle?.quantiteStock}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité (+ ou -)</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Ex: +10 ou -5"
                value={adjustmentQuantity}
                onChange={(e) => setAdjustmentQuantity(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Motif</Label>
              <Select value={adjustmentReason} onValueChange={setAdjustmentReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un motif" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Réception commande fournisseur">Réception commande fournisseur</SelectItem>
                  <SelectItem value="Correction inventaire">Correction inventaire</SelectItem>
                  <SelectItem value="Produit défectueux">Produit défectueux</SelectItem>
                  <SelectItem value="Vol/Perte">Vol/Perte</SelectItem>
                  <SelectItem value="Retour client">Retour client</SelectItem>
                  <SelectItem value="Autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className="gradient-primary text-white"
              onClick={handleAdjustStock}
              disabled={!adjustmentQuantity || !adjustmentReason || adjustStock.isPending}
            >
              {adjustStock.isPending ? <Spinner size="sm" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
