"use client"

import { useState } from "react"
import {
  Search,
  Plus,
  Filter,
  Edit,
  Trash2,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { useArticles, useCategories, useCreateArticle, useDeleteArticle } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface Article {
  id: number
  codeArticle: string
  designation: string
  description: string
  prixUnitaireHt: number
  tauxTva: number
  prixUnitaireTtc: number
  quantiteStock: number
  seuilAlerte: number
  categorieDesignation: string
  categorieId?: number
  stockFaible: boolean
}

export default function ArticlesPage() {
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const [newArticle, setNewArticle] = useState({
    codeArticle: "",
    designation: "",
    description: "",
    prixUnitaireHt: "",
    tauxTva: "20",
    quantiteStock: "",
    seuilAlerte: "10",
    categorieId: "",
  })

  const { data: articlesData = [], isLoading, error, refetch } = useArticles()
  const { data: categoriesData = [] } = useCategories()
  const createArticle = useCreateArticle()
  const deleteArticle = useDeleteArticle()

  const articles: Article[] = (articlesData as unknown[]).map((a: unknown) => {
    const art = a as Record<string, unknown>
    const prixHt = (art.prixUnitaireHt as number) || 0
    const tva = (art.tauxTva as number) || 20
    const quantite = (art.quantiteStock as number) || 0
    const seuil = (art.seuilAlerte as number) || 10
    return {
      id: (art.id as number) || 0,
      codeArticle: (art.codeArticle as string) || "",
      designation: (art.designation as string) || "",
      description: (art.description as string) || "",
      prixUnitaireHt: prixHt,
      tauxTva: tva,
      prixUnitaireTtc: (art.prixUnitaireTtc as number) || prixHt * (1 + tva / 100),
      quantiteStock: quantite,
      seuilAlerte: seuil,
      categorieDesignation: (art.categorieDesignation as string) || "",
      categorieId: art.categorieId as number,
      stockFaible: quantite <= seuil && quantite > 0,
    }
  })

  const categories = [...new Set(articles.map((a) => a.categorieDesignation).filter(Boolean))]

  const filteredArticles = articles.filter((article) => {
    const matchSearch =
      article.codeArticle.toLowerCase().includes(search.toLowerCase()) ||
      article.designation.toLowerCase().includes(search.toLowerCase())
    const matchCategory = categoryFilter === "all" || article.categorieDesignation === categoryFilter
    const matchStock =
      stockFilter === "all" ||
      (stockFilter === "low" && article.stockFaible) ||
      (stockFilter === "out" && article.quantiteStock === 0) ||
      (stockFilter === "ok" && !article.stockFaible && article.quantiteStock > 0)
    return matchSearch && matchCategory && matchStock
  })

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage)
  const paginatedArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (setter: (value: string) => void, value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleCreateArticle = async () => {
    try {
      await createArticle.mutateAsync({
        codeArticle: newArticle.codeArticle,
        designation: newArticle.designation,
        description: newArticle.description,
        prixUnitaireHt: Number.parseFloat(newArticle.prixUnitaireHt),
        tauxTva: Number.parseFloat(newArticle.tauxTva),
        quantiteStock: Number.parseInt(newArticle.quantiteStock),
        seuilAlerte: Number.parseInt(newArticle.seuilAlerte),
        categorieId: newArticle.categorieId ? Number.parseInt(newArticle.categorieId) : undefined,
      })
      toast({ title: "Article créé", description: "L'article a été ajouté avec succès" })
      setIsAddDialogOpen(false)
      setNewArticle({
        codeArticle: "",
        designation: "",
        description: "",
        prixUnitaireHt: "",
        tauxTva: "20",
        quantiteStock: "",
        seuilAlerte: "10",
        categorieId: "",
      })
      refetch()
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer l'article", variant: "destructive" })
    }
  }

  const handleDeleteArticle = async (id: number) => {
    try {
      await deleteArticle.mutateAsync(id)
      toast({ title: "Article supprimé", description: "L'article a été supprimé avec succès" })
      refetch()
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer l'article", variant: "destructive" })
    }
  }

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
        <p className="text-destructive">Erreur lors du chargement des articles</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Articles</h1>
          <p className="text-muted-foreground">Gérez votre catalogue d'articles</p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)} className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Article
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => handleFilterChange(setSearch, e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={(v) => handleFilterChange(setCategoryFilter, v)}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes catégories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={stockFilter} onValueChange={(v) => handleFilterChange(setStockFilter, v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Stock" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tout stock</SelectItem>
            <SelectItem value="ok">Stock OK</SelectItem>
            <SelectItem value="low">Stock faible</SelectItem>
            <SelectItem value="out">Rupture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix HT</TableHead>
                <TableHead className="text-right">Prix TTC</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paginatedArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-mono text-sm">{article.codeArticle}</TableCell>
                    <TableCell>
                      <div className="font-medium">{article.designation}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">{article.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{article.categorieDesignation || "N/A"}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {article.prixUnitaireHt.toLocaleString("fr-FR", { style: "currency", currency: "XAF" })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {article.prixUnitaireTtc.toLocaleString("fr-FR", { style: "currency", currency: "XAF" })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={
                            article.quantiteStock === 0
                              ? "text-red-500 font-medium"
                              : article.stockFaible
                                ? "text-amber-500 font-medium"
                                : ""
                          }
                        >
                          {article.quantiteStock}
                        </span>
                        {article.quantiteStock === 0 ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : article.stockFaible ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDeleteArticle(article.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">{filteredArticles.length} article(s)</div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                Page {currentPage} sur {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Article Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvel Article</DialogTitle>
            <DialogDescription>Ajoutez un nouvel article à votre catalogue</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Code Article</Label>
                <Input
                  placeholder="ART-XXX"
                  value={newArticle.codeArticle}
                  onChange={(e) => setNewArticle({ ...newArticle, codeArticle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select
                  value={newArticle.categorieId}
                  onValueChange={(v) => setNewArticle({ ...newArticle, categorieId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    {(categoriesData as { id: number; designation: string }[]).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Désignation</Label>
              <Input
                placeholder="Nom de l'article"
                value={newArticle.designation}
                onChange={(e) => setNewArticle({ ...newArticle, designation: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Description de l'article"
                value={newArticle.description}
                onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prix HT</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={newArticle.prixUnitaireHt}
                  onChange={(e) => setNewArticle({ ...newArticle, prixUnitaireHt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>TVA (%)</Label>
                <Input
                  type="number"
                  placeholder="20"
                  value={newArticle.tauxTva}
                  onChange={(e) => setNewArticle({ ...newArticle, tauxTva: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock initial</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={newArticle.quantiteStock}
                  onChange={(e) => setNewArticle({ ...newArticle, quantiteStock: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              className="gradient-primary"
              onClick={handleCreateArticle}
              disabled={createArticle.isPending || !newArticle.designation || !newArticle.prixUnitaireHt}
            >
              {createArticle.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer l'article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
