"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Package, Plus, Search, Eye, EyeOff, Edit, Trash2, ImagePlus, TrendingUp, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMerchantProduits, useModifierVisibiliteProduit, useAjouterProduitMerchant, useAllCategories } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buildImageUrl } from "@/lib/image-utils"
import { apiClient } from "@/lib/api"

import { ProductVariants } from "@/components/product-variants"

export default function MerchantProductsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editImages, setEditImages] = useState<File[]>([])
  const [variants, setVariants] = useState<any[]>([])
  const [editVariants, setEditVariants] = useState<any[]>([])
  const [mode, setMode] = useState<"existing" | "new">("existing")
  const [stockArticles, setStockArticles] = useState<any[]>([])
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null)
  const [articleSearchQuery, setArticleSearchQuery] = useState("")
  const [newProduct, setNewProduct] = useState({
    nom: "",
    description: "",
    descriptionLongue: "",
    prix: "",
    quantite: "",
    quantiteEnLigne: "",
    categorieId: "1",
  })
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: productsResponse, isLoading, error, refetch } = useMerchantProduits(user?.email || "")
  const { data: categoriesData } = useAllCategories()
  const modifyVisibilityMutation = useModifierVisibiliteProduit()
  const addProductMutation = useAjouterProduitMerchant()
  
  const categories = categoriesData || []
  
  // Charger les articles du stock
  const fetchStockArticles = async () => {
    try {
      const data = await apiClient.get<any>('/merchant/stock/articles')
      console.log("Articles chargés:", data)
      console.log("User email:", user?.email)
      const articles = data.data || []
      const filteredArticles = articles.filter((a: any) => a.createdBy === user?.email)
      console.log("Articles filtrés:", filteredArticles.length, "sur", articles.length)
      setStockArticles(filteredArticles)
    } catch (error) {
      console.error("Erreur chargement articles:", error)
    }
  }

  const filteredStockArticles = stockArticles.filter(
    (article) =>
      article.designation?.toLowerCase().includes(articleSearchQuery.toLowerCase()) ||
      article.codeArticle?.toLowerCase().includes(articleSearchQuery.toLowerCase())
  )

  // Extract products from response
  const products = productsResponse?.data || productsResponse || []
  
  console.log("Products response:", productsResponse)
  console.log("Extracted products:", products)

  const filteredProducts = Array.isArray(products)
    ? products.filter(
        (p) =>
          p.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.categorieName?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : []

  const toggleVisibility = async (id: number, currentVisibility: boolean) => {
    try {
      await modifyVisibilityMutation.mutateAsync({
        id,
        visible: !currentVisibility,
        merchantUserId: user?.email || "",
      })
      toast({
        title: "Visibilité modifiée",
        description: "Le statut du produit a été mis à jour",
      })
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la visibilité",
        variant: "destructive",
      })
    }
  }

  const handleAddProduct = async () => {
    try {
      if (mode === "existing") {
        // Ajouter un article existant
        if (!selectedArticle) {
          toast({ title: "Erreur", description: "Veuillez sélectionner un article", variant: "destructive" })
          return
        }
        
        console.log("Article sélectionné:", selectedArticle)
        
        await addProductMutation.mutateAsync({
          produitDto: {
            articleId: selectedArticle.id,
            nom: selectedArticle.designation,
            description: selectedArticle.description || "",
            descriptionLongue: newProduct.descriptionLongue || "",
            prix: selectedArticle.prixUnitaireTtc || 0,
            quantite: Number(newProduct.quantiteEnLigne),
            quantiteEnLigne: Number(newProduct.quantiteEnLigne),
            categorieId: selectedArticle.categorieId || 1,
            visibleEnLigne: true,
          } as any,
          images: selectedImages,
          merchantUserId: user?.email || "",
        })
      } else {
        // Créer un nouveau produit
        await addProductMutation.mutateAsync({
          produitDto: {
            nom: newProduct.nom,
            description: newProduct.description,
            descriptionLongue: newProduct.descriptionLongue,
            prix: Number(newProduct.prix),
            quantite: Number(newProduct.quantite),
            categorieId: Number(newProduct.categorieId),
            visibleEnLigne: true,
          } as any,
          images: selectedImages,
          merchantUserId: user?.email || "",
        })
      }
      toast({ title: "Produit ajouté", description: "Votre produit a été créé avec succès" })
      setIsAddDialogOpen(false)
      setMode("existing")
      setSelectedArticle(null)
      setArticleSearchQuery("")
      setNewProduct({ nom: "", description: "", descriptionLongue: "", prix: "", quantite: "", quantiteEnLigne: "", categorieId: "1" })
      setSelectedImages([])
      setVariants([])
      refetch()
    } catch (err) {
      toast({ title: "Erreur", description: "Impossible d'ajouter le produit", variant: "destructive" })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR").format(price) + " XAF"
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
        <p className="text-destructive">Erreur lors du chargement des produits</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  const onlineCount = filteredProducts.filter((p) => p.visibleEnLigne).length
  const offlineCount = filteredProducts.filter((p) => !p.visibleEnLigne).length
  const totalSales = filteredProducts.reduce((sum, p) => sum + (p.nombreVentes || 0), 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Mes Produits</h1>
          <p className="text-muted-foreground">Gérez vos produits en ligne</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open)
          if (open) fetchStockArticles()
        }}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Produit en Ligne</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Mode Selection */}
              <div className="space-y-3">
                <Label>Mode d'ajout</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={mode === "existing" ? "default" : "outline"}
                    onClick={() => setMode("existing")}
                    className="justify-start"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Article existant (Recommandé)
                  </Button>
                  <Button
                    type="button"
                    variant={mode === "new" ? "default" : "outline"}
                    onClick={() => setMode("new")}
                    className="justify-start"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau produit
                  </Button>
                </div>
              </div>

              {/* Mode: Article Existant */}
              {mode === "existing" && (
                <div className="space-y-4">
                  {/* Search */}
                  <div className="space-y-2">
                    <Label>Rechercher dans mon stock</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Nom ou code article..."
                        value={articleSearchQuery}
                        onChange={(e) => setArticleSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Articles List */}
                  <div className="space-y-2">
                    <Label>Articles disponibles ({filteredStockArticles.length} / {stockArticles.length})</Label>
                    <div className="border rounded-lg max-h-64 overflow-y-auto">
                      {filteredStockArticles.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                          <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                          <p>Aucun article trouvé</p>
                        </div>
                      ) : (
                        filteredStockArticles.map((article) => (
                          <div
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className={`p-3 border-b cursor-pointer hover:bg-accent transition ${
                              selectedArticle?.id === article.id ? "bg-primary/10 border-primary" : ""
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium">{article.designation}</h4>
                                  {selectedArticle?.id === article.id && (
                                    <Badge variant="default">Sélectionné</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{article.description}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm">
                                  <span className="text-muted-foreground">Code: {article.codeArticle}</span>
                                  <Badge variant={article.quantiteStock > 10 ? "secondary" : "destructive"}>
                                    Stock: {article.quantiteStock}
                                  </Badge>
                                  <span className="font-medium">
                                    {formatPrice(article.prixUnitaireTtc || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Selected Article Info */}
                  {selectedArticle && (
                    <>
                      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800 dark:text-blue-200">
                            <p className="font-medium mb-1">Article sélectionné</p>
                            <p>
                              Stock disponible: <strong>{selectedArticle.quantiteStock}</strong> unités
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quantité à mettre en ligne */}
                      <div className="space-y-2">
                        <Label>Quantité à mettre en ligne *</Label>
                        <Input
                          type="number"
                          placeholder="Ex: 10"
                          min="1"
                          max={selectedArticle.quantiteStock}
                          value={newProduct.quantiteEnLigne}
                          onChange={(e) => setNewProduct({ ...newProduct, quantiteEnLigne: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          Cette quantité sera déduite de votre stock et réservée pour la vente en ligne
                        </p>
                      </div>
                    </>
                  )}

                  {/* Description longue */}
                  <div className="space-y-2">
                    <Label>Description détaillée (optionnelle)</Label>
                    <Textarea
                      placeholder="Ajoutez une description plus détaillée pour la boutique en ligne..."
                      rows={3}
                      value={newProduct.descriptionLongue}
                      onChange={(e) => setNewProduct({ ...newProduct, descriptionLongue: e.target.value })}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {newProduct.descriptionLongue.length}/5000 caractères
                    </p>
                  </div>

                  {/* Images */}
                  <div className="space-y-2">
                    <Label>Images supplémentaires (optionnelles)</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setSelectedImages(files)
                      }}
                    />
                    {selectedImages.length > 0 && (
                      <p className="text-sm text-muted-foreground">{selectedImages.length} image(s) sélectionnée(s)</p>
                    )}
                  </div>

                  {/* Variantes */}
                  <div className="space-y-2">
                    <Label>Variantes du produit (couleurs, tailles...)</Label>
                    <ProductVariants
                      variants={variants}
                      onChange={setVariants}
                    />
                  </div>
                </div>
              )}

              {/* Mode: Nouveau Produit */}
              {mode === "new" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nom du produit</Label>
                      <Input
                        placeholder="Ex: iPhone 15 Pro"
                        value={newProduct.nom}
                        onChange={(e) => setNewProduct({ ...newProduct, nom: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prix (XAF)</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProduct.prix}
                        onChange={(e) => setNewProduct({ ...newProduct, prix: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description courte</Label>
                    <Input
                      placeholder="Description en quelques mots..."
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      maxLength={1000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {newProduct.description.length}/1000 caractères
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Description longue</Label>
                    <Textarea
                      placeholder="Description détaillée du produit..."
                      rows={4}
                      value={newProduct.descriptionLongue}
                      onChange={(e) => setNewProduct({ ...newProduct, descriptionLongue: e.target.value })}
                      maxLength={5000}
                    />
                    <p className="text-xs text-muted-foreground">
                      {newProduct.descriptionLongue.length}/5000 caractères
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Quantité en stock</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newProduct.quantite}
                        onChange={(e) => setNewProduct({ ...newProduct, quantite: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Catégorie</Label>
                      <Select
                        value={newProduct.categorieId}
                        onValueChange={(value) => setNewProduct({ ...newProduct, categorieId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.designation}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Images</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || [])
                        setSelectedImages(files)
                      }}
                    />
                    {selectedImages.length > 0 && (
                      <p className="text-sm text-muted-foreground">{selectedImages.length} image(s) sélectionnée(s)</p>
                    )}
                  </div>

                  {/* Variantes */}
                  <div className="space-y-2">
                    <Label>Variantes du produit (couleurs, tailles...)</Label>
                    <ProductVariants
                      variants={variants}
                      onChange={setVariants}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                className="gradient-primary text-white"
                onClick={handleAddProduct}
                disabled={
                  addProductMutation.isPending ||
                  (mode === "existing" ? (!selectedArticle || !newProduct.quantiteEnLigne || Number(newProduct.quantiteEnLigne) <= 0) : !newProduct.nom || !newProduct.prix)
                }
              >
                {addProductMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer le produit
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Product Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier le produit</DialogTitle>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Nom du produit</Label>
                  <Input
                    value={editingProduct.nom}
                    onChange={(e) => setEditingProduct({ ...editingProduct, nom: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editingProduct.description || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    rows={3}
                    maxLength={1000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(editingProduct.description || "").length}/1000 caractères
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix (XAF)</Label>
                    <Input
                      type="number"
                      value={editingProduct.prix}
                      onChange={(e) => setEditingProduct({ ...editingProduct, prix: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantité en ligne</Label>
                    <Input
                      type="number"
                      value={editingProduct.quantite}
                      onChange={(e) => setEditingProduct({ ...editingProduct, quantite: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Ajouter des images</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setEditImages(Array.from(e.target.files || []))}
                  />
                  {editImages.length > 0 && (
                    <p className="text-sm text-muted-foreground">{editImages.length} image(s) sélectionnée(s)</p>
                  )}
                </div>

                {/* Variantes */}
                <div className="space-y-2">
                  <Label>Variantes du produit</Label>
                  <ProductVariants
                    variants={editVariants}
                    onChange={setEditVariants}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button
                    className="gradient-primary text-white"
                    onClick={async () => {
                      try {
                        await apiClient.put(`/merchant/produits/${editingProduct.id}`, {
                          nom: editingProduct.nom,
                          description: editingProduct.description,
                          prix: editingProduct.prix,
                          quantiteEnLigne: editingProduct.quantite,
                        })
                        
                        if (editImages.length > 0) {
                          const formData = new FormData()
                          editImages.forEach((img) => formData.append('images', img))
                          await apiClient.post(`/merchant/produits/${editingProduct.id}/images`, formData)
                        }
                        
                        toast({
                          title: "Produit modifié",
                          description: "Les modifications ont été enregistrées",
                        })
                        setIsEditDialogOpen(false)
                        setEditImages([])
                        refetch()
                      } catch (error) {
                        toast({
                          title: "Erreur",
                          description: "Impossible de modifier le produit",
                          variant: "destructive",
                        })
                      }
                    }}
                  >
                    Enregistrer
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Produits</p>
                <p className="text-2xl font-bold">{filteredProducts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Eye className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En ligne</p>
                <p className="text-2xl font-bold">{onlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <EyeOff className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hors ligne</p>
                <p className="text-2xl font-bold">{offlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <TrendingUp className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Ventes</p>
                <p className="text-2xl font-bold">{totalSales}</p>
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
              placeholder="Rechercher un produit..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Liste des produits</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produit</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead className="text-right">Prix</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Ventes</TableHead>
                <TableHead className="text-center">Visible</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={buildImageUrl(product.images?.[0]) || "/placeholder.svg?height=48&width=48&query=product"}
                        alt={product.nom}
                        className="h-12 w-12 rounded-lg object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <div>
                        <p className="font-medium">{product.nom}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{product.categorieName || "N/A"}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatPrice(product.prix || 0)}</TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        (product.quantite || 0) === 0
                          ? "destructive"
                          : (product.quantite || 0) < 10
                            ? "outline"
                            : "secondary"
                      }
                    >
                      {product.quantite || 0}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{product.nombreVentes || 0}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={product.visibleEnLigne}
                      onCheckedChange={() => product.id && toggleVisibility(product.id, product.visibleEnLigne ?? false)}
                      disabled={modifyVisibilityMutation.isPending}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => {
                          setEditingProduct(product)
                          setEditVariants(product.variants || [])
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={async () => {
                          if (confirm(`Voulez-vous vraiment supprimer "${product.nom}" ?`)) {
                            try {
                              await apiClient.delete(`/merchant/produits/${product.id}`)
                              toast({
                                title: "Produit supprimé",
                                description: "Le produit a été supprimé avec succès",
                              })
                              refetch()
                            } catch (error) {
                              toast({
                                title: "Erreur",
                                description: "Impossible de supprimer le produit",
                                variant: "destructive",
                              })
                            }
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Aucun produit trouvé
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
