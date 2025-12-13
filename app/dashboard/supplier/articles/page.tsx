"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Package, Plus, Search, Edit, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useSupplierArticles, useAjouterArticleSupplier } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"

export default function SupplierArticlesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newArticle, setNewArticle] = useState({
    codeArticle: "",
    designation: "",
    description: "",
    prixUnitaireHt: "",
    quantiteStock: "",
    categorie: "",
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: articlesResponse, isLoading, error, refetch } = useSupplierArticles(user?.userId || "")
  const addArticleMutation = useAjouterArticleSupplier()

  // Extract articles from response
  const articles = articlesResponse?.data || articlesResponse || []

  const filteredArticles = Array.isArray(articles)
    ? articles.filter(
        (a) =>
          a.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.codeArticle?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const handleAddArticle = async () => {
    try {
      await addArticleMutation.mutateAsync({
        userId: user?.userId || "",
        data: {
          codeArticle: newArticle.codeArticle,
          designation: newArticle.designation,
          description: newArticle.description,
          prixUnitaireHt: Number(newArticle.prixUnitaireHt),
          quantiteStock: Number(newArticle.quantiteStock),
          categorie: newArticle.categorie,
        } as any,
      })
      toast({ title: "Article ajouté", description: "L'article a été créé avec succès" })
      setIsAddDialogOpen(false)
      setNewArticle({
        codeArticle: "",
        designation: "",
        description: "",
        prixUnitaireHt: "",
        quantiteStock: "",
        categorie: "",
      })
      refetch()
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'ajouter l'article", variant: "destructive" })
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
      <div className="text-center py-12">
        <p className="text-destructive">Erreur lors du chargement des articles</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  const totalStock = filteredArticles.reduce((sum, a) => sum + (a.quantiteStock || 0), 0)
  const totalValue = filteredArticles.reduce((sum, a) => sum + (a.quantiteStock || 0) * (a.prixUnitaireHt || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes Articles</h1>
          <p className="text-muted-foreground">Gérez votre catalogue fournisseur</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un article
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nouvel Article</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code Article</Label>
                  <Input
                    placeholder="Ex: ELEC-004"
                    value={newArticle.codeArticle}
                    onChange={(e) => setNewArticle({ ...newArticle, codeArticle: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Input
                    placeholder="Ex: Accessoires"
                    value={newArticle.categorie}
                    onChange={(e) => setNewArticle({ ...newArticle, categorie: e.target.value })}
                  />
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
                <Input
                  placeholder="Description courte"
                  value={newArticle.description}
                  onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prix unitaire HT (XAF)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newArticle.prixUnitaireHt}
                    onChange={(e) => setNewArticle({ ...newArticle, prixUnitaireHt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantité en stock</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={newArticle.quantiteStock}
                    onChange={(e) => setNewArticle({ ...newArticle, quantiteStock: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={handleAddArticle}
                disabled={addArticleMutation.isPending || !newArticle.designation || !newArticle.prixUnitaireHt}
              >
                {addArticleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer l'article
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{filteredArticles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Package className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock Total</p>
                <p className="text-2xl font-bold">{totalStock.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-xl font-bold">{formatPrice(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un article..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Catalogue</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix HT</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-mono text-sm">{article.codeArticle}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{article.designation}</p>
                      <p className="text-xs text-muted-foreground">{article.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{article.categorie || "N/A"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(article.prixUnitaireHt || 0)}</TableCell>
                  <TableCell className="text-center">{article.quantiteStock || 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredArticles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
