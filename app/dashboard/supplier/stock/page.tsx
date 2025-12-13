"use client"

import { useState } from "react"
import { Search, Plus, Package, AlertTriangle, Loader2, Edit, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { useSupplierArticles, useAjusterStockSupplier } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

interface Article {
  id: number
  designation: string
  reference: string
  quantiteStock: number
  seuilAlerte: number
  prixAchat: number
  categorie?: string
}

export default function SupplierStockPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [search, setSearch] = useState("")
  const [adjustDialog, setAdjustDialog] = useState<Article | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustMotif, setAdjustMotif] = useState("")

  const { data: articlesResponse, isLoading, error, refetch } = useSupplierArticles(user?.userId || "")
  const ajusterStock = useAjusterStockSupplier()

  const articles: Article[] = ((articlesResponse as { data?: unknown[] })?.data || articlesResponse || []).map(
    (a: unknown) => {
      const art = a as Record<string, unknown>
      return {
        id: (art.id as number) || 0,
        designation: (art.designation as string) || "Article",
        reference: (art.reference as string) || "",
        quantiteStock: (art.quantiteStock as number) || 0,
        seuilAlerte: (art.seuilAlerte as number) || 10,
        prixAchat: (art.prixAchat as number) || 0,
        categorie: art.categorie as string,
      }
    },
  )

  const filteredArticles = articles.filter(
    (a) =>
      a.designation.toLowerCase().includes(search.toLowerCase()) ||
      a.reference.toLowerCase().includes(search.toLowerCase()),
  )

  const lowStockCount = articles.filter((a) => a.quantiteStock > 0 && a.quantiteStock <= a.seuilAlerte).length
  const outOfStockCount = articles.filter((a) => a.quantiteStock === 0).length
  const totalValue = articles.reduce((sum, a) => sum + a.quantiteStock * a.prixAchat, 0)

  const handleAdjustStock = async () => {
    if (!adjustDialog || !adjustQuantity || !user?.userId) return

    try {
      await ajusterStock.mutateAsync({
        id: adjustDialog.id,
        quantite: Number.parseInt(adjustQuantity),
        motif: adjustMotif || "Ajustement manuel",
        userId: user.userId,
      })
      toast({
        title: "Stock ajusté",
        description: `Le stock de ${adjustDialog.designation} a été mis à jour`,
      })
      setAdjustDialog(null)
      setAdjustQuantity("")
      setAdjustMotif("")
      refetch()
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible d'ajuster le stock",
        variant: "destructive",
      })
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
        <p className="text-destructive">Erreur lors du chargement du stock</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon Stock</h1>
          <p className="text-muted-foreground">Gérez votre inventaire fournisseur</p>
        </div>
        <Button className="gradient-primary">
          <Plus className="h-4 w-4 mr-2" />
          Nouvel Article
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Articles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{articles.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Stock Faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{lowStockCount}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Rupture
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{outOfStockCount}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Valeur Totale</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalValue.toLocaleString("fr-FR")} XAF</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un article..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Article</TableHead>
                <TableHead>Référence</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-right">Prix Achat</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.designation}</TableCell>
                    <TableCell className="font-mono text-sm">{article.reference || "N/A"}</TableCell>
                    <TableCell>
                      {article.categorie ? (
                        <Badge variant="secondary">{article.categorie}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant={
                          article.quantiteStock === 0
                            ? "destructive"
                            : article.quantiteStock <= article.seuilAlerte
                              ? "secondary"
                              : "default"
                        }
                      >
                        {article.quantiteStock}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{article.prixAchat.toLocaleString("fr-FR")} XAF</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setAdjustDialog(article)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Ajuster le stock
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Adjust Stock Dialog */}
      <Dialog open={!!adjustDialog} onOpenChange={() => setAdjustDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajuster le stock</DialogTitle>
          </DialogHeader>
          {adjustDialog && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Article: <span className="font-medium text-foreground">{adjustDialog.designation}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Stock actuel: <span className="font-medium text-foreground">{adjustDialog.quantiteStock}</span>
              </p>
              <div className="space-y-2">
                <Label>Nouvelle quantité</Label>
                <Input
                  type="number"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(e.target.value)}
                  placeholder="Ex: 50"
                />
              </div>
              <div className="space-y-2">
                <Label>Motif</Label>
                <Textarea
                  value={adjustMotif}
                  onChange={(e) => setAdjustMotif(e.target.value)}
                  placeholder="Raison de l'ajustement..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog(null)}>
              Annuler
            </Button>
            <Button onClick={handleAdjustStock} disabled={!adjustQuantity || ajusterStock.isPending}>
              {ajusterStock.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
