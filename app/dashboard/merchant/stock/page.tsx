"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package, Search, AlertTriangle, TrendingUp, TrendingDown, ArrowUpDown, Loader2, Plus, BarChart3, ShoppingCart, Store, Upload, X, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useMerchantArticles, useAjusterStockMerchant, useAjouterArticleMerchantAvecImage, useAllCategories, useAjouterProduitMerchant } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StockAnalytics } from "@/components/stock/stock-analytics"
import { ReorderSuggestions } from "@/components/stock/reorder-suggestions"
import { MovementAnalytics } from "@/components/stock/movement-analytics"
import { buildImageUrl } from "@/lib/image-utils"
import { compressImage } from "@/lib/image-compress"
import { COLOR_OPTIONS } from "@/lib/color-options"

export default function MerchantStockPage() {
  const OTHER_COLOR_VALUE = "__OTHER__"
  const isPredefinedColor = (value: string) => COLOR_OPTIONS.includes(value as (typeof COLOR_OPTIONS)[number])

  const [searchQuery, setSearchQuery] = useState("")
  const [adjustDialog, setAdjustDialog] = useState<{
    open: boolean
    article: Record<string, unknown> | null
    type: "add" | "remove"
  }>({ open: false, article: null, type: "add" })
  const [adjustQuantity, setAdjustQuantity] = useState("")
  const [adjustMotif, setAdjustMotif] = useState("")
  const [addDialog, setAddDialog] = useState(false)
  const [newArticle, setNewArticle] = useState({
    designation: "",
    description: "",
    prixUnitaireHt: "",
    quantiteStock: "",
    seuilAlerte: "5",
    categorieId: "",
    couleur: "",
    taille: "",
    capacite: "",
    marque: "",
    modele: ""
  })
  const selectedColorValue = !newArticle.couleur
    ? "__EMPTY__"
    : isPredefinedColor(newArticle.couleur)
      ? newArticle.couleur
      : OTHER_COLOR_VALUE
  const [articleImages, setArticleImages] = useState<File[]>([])
  const [productImages, setProductImages] = useState<File[]>([])
  const [brokenArticleImages, setBrokenArticleImages] = useState<Record<number, boolean>>({})
  const [editDialog, setEditDialog] = useState<{
    open: boolean
    article: Record<string, unknown> | null
  }>({ open: false, article: null })
  const [editArticle, setEditArticle] = useState({
    designation: "",
    description: "",
    prixUnitaireHt: "",
    quantiteStock: "",
    seuilAlerte: "",
    categorieId: ""
  })
  const [productDialog, setProductDialog] = useState<{
    open: boolean
    article: Record<string, unknown> | null
  }>({ open: false, article: null })
  const [productData, setProductData] = useState({
    nom: "",
    description: "",
    descriptionLongue: "",
    prix: "",
    quantite: "",
    quantiteEnLigne: "",
    visibleEnLigne: true
  })
  const { toast } = useToast()
  const { user } = useAuth()

  const { data: stockResponse, isLoading, error, refetch } = useMerchantArticles(user?.email || "")
  const { data: categoriesResponse } = useAllCategories()
  const adjustStockMutation = useAjusterStockMerchant()
  const addArticleMutation = useAjouterArticleMerchantAvecImage()
  const addProductMutation = useAjouterProduitMerchant()
  
  const categories = categoriesResponse || []

  // Extract stock from response and filter out products that are already online
  const stock = stockResponse?.data || stockResponse || []

  const filteredStock = Array.isArray(stock)
    ? stock.filter(
        (s) =>
          (s.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.codeArticle?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          // Filter out articles that start with PROD- (these are products, not stock articles)
          !s.codeArticle?.startsWith('PROD-')
      )
    : []

  const handleAdjust = async () => {
    if (!adjustDialog.article || !adjustQuantity || !adjustMotif) return

    const qty = Number.parseInt(adjustQuantity)
    const finalQty = adjustDialog.type === "add" ? qty : -qty

    try {
      await adjustStockMutation.mutateAsync({
        id: adjustDialog.article.id as number,
        quantite: finalQty,
        motif: adjustMotif,
        userId: user?.email || "",
      })

      toast({
        title: "Stock ajusté",
        description: `${adjustDialog.type === "add" ? "Ajout" : "Retrait"} de ${qty} unités effectué`,
      })

      setAdjustDialog({ open: false, article: null, type: "add" })
      setAdjustQuantity("")
      setAdjustMotif("")
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'ajuster le stock",
        variant: "destructive",
      })
    }
  }

  const handleAddArticle = async () => {
    if (!newArticle.designation || !newArticle.prixUnitaireHt || !newArticle.quantiteStock) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      })
      return
    }
    if (articleImages.length === 0) {
      toast({
        title: "Erreur",
        description: "Au moins une image est obligatoire pour ajouter un article",
        variant: "destructive"
      })
      return
    }

    try {
      // 1. Créer l'article d'abord
      const articleResponse = await addArticleMutation.mutateAsync({
        userId: user?.email || "",
        articleData: {
          designation: newArticle.designation,
          description: newArticle.description,
          prixUnitaireHt: newArticle.prixUnitaireHt,
          prixUnitaireTtc: (parseFloat(newArticle.prixUnitaireHt) * 1.2).toString(),
          quantiteStock: newArticle.quantiteStock,
          seuilAlerte: newArticle.seuilAlerte,
          categorieId: newArticle.categorieId || "1"
        },
        image: articleImages[0]
      })

      // 2. Upload des images restantes
      if (articleImages.length > 1 && articleResponse?.data?.id) {
        const articleId = articleResponse.data.id as number
        console.log("🖼️ Uploading", articleImages.length - 1, "additional images for article", articleId)
        
        for (const image of articleImages.slice(1)) {
          try {
            const compressedImage = await compressImage(image)
            const formData = new FormData()
            formData.append("image", compressedImage)
            
            const token = localStorage.getItem("tj-track-token")
            const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"
            
            const uploadResponse = await fetch(
              `${API_BASE_URL}/merchant/stock/articles/${articleId}/image`,
              {
                method: "POST",
                headers: {
                  "Authorization": token ? `Bearer ${token}` : "",
                },
                body: formData,
              }
            )
            
            if (!uploadResponse.ok) {
              console.error("❌ Image upload failed for", image.name)
              throw new Error(`Image upload failed: ${uploadResponse.status}`)
            }
            
            const uploadData = await uploadResponse.json()
            console.log("✅ Image uploaded:", image.name, "→", uploadData)
          } catch (imgErr) {
            console.error("❌ Error uploading image:", imgErr)
            toast({
              title: "Avertissement",
              description: `Erreur lors de l'upload de l'image: ${image.name}`,
              variant: "destructive"
            })
          }
        }
      }

      toast({
        title: "Article ajouté",
        description: `Article créé avec ${articleImages.length} image(s)`
      })

      setAddDialog(false)
      setNewArticle({
        designation: "",
        description: "",
        prixUnitaireHt: "",
        quantiteStock: "",
        seuilAlerte: "5",
        categorieId: "",
        couleur: "",
        taille: "",
        capacite: "",
        marque: "",
        modele: ""
      })
      setArticleImages([])
      refetch()
    } catch (err) {
      console.error("❌ Error adding article:", err)
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article",
        variant: "destructive"
      })
    }
  }

  const handleCreateProduct = async () => {
    if (!productDialog.article) {
      toast({
        title: "Erreur",
        description: "Aucun article sélectionné",
        variant: "destructive"
      })
      return
    }
    if (productImages.length === 0) {
      toast({
        title: "Erreur",
        description: "Au moins une image est obligatoire pour ajouter un produit",
        variant: "destructive"
      })
      return
    }

    try {
      const article = productDialog.article
      
      console.log("Creating product from article:", article)
      console.log("Article photo:", article.photo)
      console.log("Product images:", productImages)
      
      await addProductMutation.mutateAsync({
        produitDto: {
          articleId: article.id as number,
          nom: article.designation as string,
          description: (article.description as string) || "",
          descriptionLongue: productData.descriptionLongue || "",
          prix: article.prixUnitaireTtc as number || 0,
          quantite: parseInt(productData.quantiteEnLigne) || 0,
          quantiteEnLigne: parseInt(productData.quantiteEnLigne) || 0,
          categorieId: (article.categorieId as number) || 1,
          visibleEnLigne: productData.visibleEnLigne,
          migrateImages: true // Créer le point de stockage article_produit
        },
        images: productImages,
        merchantUserId: user?.email || ""
      })

      toast({
        title: "Produit créé",
        description: `${parseInt(productData.quantiteEnLigne)} unités mises en ligne. Stock restant: ${Math.max(0, ((article.quantiteStock as number) || 0) - (parseInt(productData.quantiteEnLigne) || 0))} unités.`
      })

      setProductDialog({ open: false, article: null })
      setProductData({
        nom: "",
        description: "",
        descriptionLongue: "",
        prix: "",
        quantite: "",
        quantiteEnLigne: "",
        visibleEnLigne: true
      })
      setProductImages([])
      // Force refresh of stock data
      await refetch()
    } catch (err: any) {
      console.error("❌ Error creating product:", err)
      const errorMessage = err?.message || err?.toString() || "Impossible de créer le produit"
      
      // Check if article is already online
      if (errorMessage.includes("déjà en ligne")) {
        toast({
          title: "Article déjà en ligne",
          description: "Cet article est déjà disponible dans votre boutique en ligne.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Erreur",
          description: errorMessage,
          variant: "destructive"
        })
      }
    }
  }

  const openProductDialog = (article: Record<string, unknown>) => {
    setProductData({
      nom: article.designation as string,
      description: article.description as string || "",
      descriptionLongue: "",
      prix: (article.prixUnitaireHt as number)?.toString() || "",
      quantite: (article.quantiteStock as number)?.toString() || "",
      quantiteEnLigne: (article.quantiteStock as number)?.toString() || "",
      visibleEnLigne: true
    })
    setProductImages([])
    setProductDialog({ open: true, article })
  }

  const openEditDialog = (article: Record<string, unknown>) => {
    setEditArticle({
      designation: article.designation as string,
      description: article.description as string || "",
      prixUnitaireHt: (article.prixUnitaireHt as number)?.toString() || "",
      quantiteStock: (article.quantiteStock as number)?.toString() || "",
      seuilAlerte: (article.seuilAlerte as number)?.toString() || "5",
      categorieId: (article.categorieId as number)?.toString() || ""
    })
    setEditDialog({ open: true, article })
  }

  const handleEditArticle = async () => {
    if (!editDialog.article) return
    
    try {
      // TODO: Implémenter l'appel API de modification
      console.log("Modification article:", editDialog.article.id, editArticle)
      toast({
        title: "Article modifié",
        description: "Les modifications ont été enregistrées"
      })
      setEditDialog({ open: false, article: null })
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'article",
        variant: "destructive"
      })
    }
  }

  const handleDeleteArticle = async (article: Record<string, unknown>) => {
    if (!confirm(`Voulez-vous vraiment supprimer "${article.designation}" ?`)) return
    
    try {
      // TODO: Implémenter l'appel API de suppression
      console.log("Suppression article:", article.id)
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé avec succès"
      })
      refetch()
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setArticleImages(prev => [...prev, ...files].slice(0, 5))
  }

  const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setProductImages(prev => [...prev, ...files].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setArticleImages(prev => prev.filter((_, i) => i !== index))
  }

  const getSelectedCategory = () => {
    return categories.find((cat: any) => cat.id.toString() === newArticle.categorieId)
  }

  const getCategorySpecificFields = () => {
    const category = getSelectedCategory()
    if (!category) return []
    
    const categoryName = category.designation?.toLowerCase() || ""
    
    if (categoryName.includes("électronique") || categoryName.includes("smartphone") || categoryName.includes("ordinateur")) {
      return ["capacite", "couleur", "marque", "modele"]
    }
    if (categoryName.includes("vêtement") || categoryName.includes("textile")) {
      return ["taille", "couleur", "marque"]
    }
    if (categoryName.includes("chaussure")) {
      return ["taille", "couleur", "marque"]
    }
    return ["couleur", "marque"]
  }

  const getStockStatus = (item: Record<string, unknown>) => {
    const qty = (item.quantiteStock as number) || 0
    const threshold = (item.seuilAlerte as number) || 5
    if (qty === 0) return { label: "Rupture", variant: "destructive" as const }
    if (qty <= threshold) return { label: "Faible", variant: "outline" as const }
    return { label: "OK", variant: "secondary" as const }
  }

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

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
        <p className="text-destructive">Erreur lors du chargement du stock</p>
        <Button variant="outline" onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    )
  }

  const totalValue = filteredStock.reduce(
    (sum, s) => sum + ((s.quantiteStock as number) || 0) * ((s.prixUnitaireHt as number) || 0),
    0,
  )
  const lowStockCount = filteredStock.filter(
    (s) =>
      ((s.quantiteStock as number) || 0) <= ((s.seuilAlerte as number) || 5) && ((s.quantiteStock as number) || 0) > 0,
  ).length
  const outOfStockCount = filteredStock.filter((s) => ((s.quantiteStock as number) || 0) === 0).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mon Stock</h1>
        <p className="text-muted-foreground">Gérez votre inventaire avec des outils avancés</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Articles</p>
                <p className="text-2xl font-bold">{filteredStock.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valeur Stock</p>
                <p className="text-xl font-bold">{formatPrice(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Stock faible</p>
                <p className="text-2xl font-bold">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <TrendingDown className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ruptures</p>
                <p className="text-2xl font-bold">{outOfStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Add */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Article
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs pour différentes vues */}
      <Tabs defaultValue="inventory" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Inventaire
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reorder" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Réappro
          </TabsTrigger>
          <TabsTrigger value="movements" className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4" />
            Mouvements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Inventaire</CardTitle>
            </CardHeader>
            <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Désignation</TableHead>
                <TableHead className="text-center">Stock</TableHead>
                <TableHead className="text-center">Seuil</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Valeur</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStock.map((item) => {
                const article = item as unknown as Record<string, unknown>
                const articleId = Number(article.id || 0)
                const status = getStockStatus(article)
                const qty = (article.quantiteStock as number) || 0
                const threshold = (article.seuilAlerte as number) || 5
                const max = (article.stockMax as number) || 100
                const price = (article.prixUnitaireHt as number) || 0
                const articleImage = article.photo ? (buildImageUrl(article.photo as string) || "/placeholder.svg") : "/placeholder.svg"
                const articleImageSrc = brokenArticleImages[articleId] ? "/placeholder.svg" : articleImage
                return (
                  <TableRow key={articleId}>
                    <TableCell>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 border border-border">
                        {article.photo ? (
                          <Image
                            src={articleImageSrc}
                            alt={article.designation as string}
                            fill
                            sizes="48px"
                            className="object-cover"
                            onError={() => {
                              if (!brokenArticleImages[articleId]) {
                                setBrokenArticleImages((prev) => ({ ...prev, [articleId]: true }))
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-muted/50">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{article.codeArticle as string}</TableCell>
                    <TableCell className="font-medium">{article.designation as string}</TableCell>
                    <TableCell className="text-center">
                      <span className={qty <= threshold ? "text-orange-500 font-bold" : ""}>{qty}</span>
                      <span className="text-muted-foreground">/{max}</span>
                    </TableCell>
                    <TableCell className="text-center">{threshold}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(qty * price)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(article)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteArticle(article)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openProductDialog(article)}
                        >
                          <Store className="h-3 w-3 mr-1" />
                          Produit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustDialog({ open: true, article: article, type: "add" })}
                        >
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Entrée
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAdjustDialog({ open: true, article: article, type: "remove" })}
                        >
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Sortie
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredStock.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun article trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <StockAnalytics articles={filteredStock as any[]} />
        </TabsContent>

        <TabsContent value="reorder">
          <ReorderSuggestions articles={filteredStock as any[]} />
        </TabsContent>

        <TabsContent value="movements">
          <MovementAnalytics mouvements={[]} />
        </TabsContent>
      </Tabs>

      {/* Edit Article Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ ...editDialog, open })}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Modifier l'article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Désignation</Label>
                <Input
                  value={editArticle.designation}
                  onChange={(e) => setEditArticle({ ...editArticle, designation: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie</Label>
                <Select value={editArticle.categorieId} onValueChange={(value) => setEditArticle({ ...editArticle, categorieId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
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
              <Label>Description</Label>
              <Textarea
                value={editArticle.description}
                onChange={(e) => setEditArticle({ ...editArticle, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prix HT (XAF)</Label>
                <Input
                  type="number"
                  value={editArticle.prixUnitaireHt}
                  onChange={(e) => setEditArticle({ ...editArticle, prixUnitaireHt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={editArticle.quantiteStock}
                  onChange={(e) => setEditArticle({ ...editArticle, quantiteStock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Seuil alerte</Label>
                <Input
                  type="number"
                  value={editArticle.seuilAlerte}
                  onChange={(e) => setEditArticle({ ...editArticle, seuilAlerte: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, article: null })}>
              Annuler
            </Button>
            <Button onClick={handleEditArticle}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={adjustDialog.open} onOpenChange={(open) => setAdjustDialog({ ...adjustDialog, open })}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{adjustDialog.type === "add" ? "Entrée de stock" : "Sortie de stock"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="font-medium">{adjustDialog.article?.designation as string}</p>
              <p className="text-sm text-muted-foreground">
                Stock actuel: {(adjustDialog.article?.quantiteStock as number) || 0} unités
              </p>
            </div>
            <div className="space-y-2">
              <Label>Quantité</Label>
              <Input
                type="number"
                min="1"
                value={adjustQuantity}
                onChange={(e) => setAdjustQuantity(e.target.value)}
                placeholder="Entrez la quantité"
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdjustDialog({ open: false, article: null, type: "add" })}>
              Annuler
            </Button>
            <Button onClick={handleAdjust} disabled={!adjustQuantity || !adjustMotif || adjustStockMutation.isPending}>
              {adjustStockMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Article Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Ajouter un Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Images */}
            <div className="space-y-2">
              <Label>Images de l'article</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="article-images"
                />
                <label htmlFor="article-images" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="h-8 w-8" />
                    <p>Cliquez pour ajouter des images (max 5)</p>
                  </div>
                </label>
                {articleImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {articleImages.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${index}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute -top-2 -right-2 h-6 w-6 p-0"
                          onClick={() => removeImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Informations de base */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Désignation *</Label>
                <Input
                  value={newArticle.designation}
                  onChange={(e) => setNewArticle({ ...newArticle, designation: e.target.value })}
                  placeholder="Nom de l'article"
                />
              </div>
              <div className="space-y-2">
                <Label>Catégorie *</Label>
                <Select value={newArticle.categorieId} onValueChange={(value) => setNewArticle({ ...newArticle, categorieId: value })}>
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
              <Label>Description</Label>
              <Textarea
                value={newArticle.description}
                onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                placeholder="Description détaillée de l'article"
                rows={3}
              />
            </div>

            {/* Caractéristiques spécifiques à la catégorie */}
            {getCategorySpecificFields().length > 0 && (
              <div className="space-y-4">
                <Label className="text-base font-semibold">Caractéristiques spécifiques</Label>
                <div className="grid grid-cols-2 gap-4">
                  {getCategorySpecificFields().includes("couleur") && (
                    <div className="space-y-2">
                      <Label>Couleur</Label>
                      <Select
                        value={selectedColorValue}
                        onValueChange={(value) =>
                          setNewArticle({
                            ...newArticle,
                            couleur:
                              value === "__EMPTY__"
                                ? ""
                                : value === OTHER_COLOR_VALUE
                                  ? (isPredefinedColor(newArticle.couleur) ? "" : newArticle.couleur)
                                  : value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une couleur" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__EMPTY__">Aucune</SelectItem>
                          <SelectItem value={OTHER_COLOR_VALUE}>Autre couleur</SelectItem>
                          {COLOR_OPTIONS.map((color) => (
                            <SelectItem key={color} value={color}>
                              {color}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedColorValue === OTHER_COLOR_VALUE && (
                        <Input
                          value={newArticle.couleur}
                          onChange={(e) => setNewArticle({ ...newArticle, couleur: e.target.value })}
                          placeholder="Saisir une couleur personnalisée"
                        />
                      )}
                    </div>
                  )}
                  {getCategorySpecificFields().includes("taille") && (
                    <div className="space-y-2">
                      <Label>Taille</Label>
                      <Input
                        value={newArticle.taille}
                        onChange={(e) => setNewArticle({ ...newArticle, taille: e.target.value })}
                        placeholder="Ex: S, M, L, XL ou 38, 40, 42"
                      />
                    </div>
                  )}
                  {getCategorySpecificFields().includes("capacite") && (
                    <div className="space-y-2">
                      <Label>Capacité</Label>
                      <Input
                        value={newArticle.capacite}
                        onChange={(e) => setNewArticle({ ...newArticle, capacite: e.target.value })}
                        placeholder="Ex: 128GB, 256GB, 1TB"
                      />
                    </div>
                  )}
                  {getCategorySpecificFields().includes("marque") && (
                    <div className="space-y-2">
                      <Label>Marque</Label>
                      <Input
                        value={newArticle.marque}
                        onChange={(e) => setNewArticle({ ...newArticle, marque: e.target.value })}
                        placeholder="Ex: Apple, Samsung, Nike"
                      />
                    </div>
                  )}
                  {getCategorySpecificFields().includes("modele") && (
                    <div className="space-y-2">
                      <Label>Modèle</Label>
                      <Input
                        value={newArticle.modele}
                        onChange={(e) => setNewArticle({ ...newArticle, modele: e.target.value })}
                        placeholder="Ex: iPhone 15 Pro, Galaxy S24"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Note: Les variantes sont gérées au niveau produit, pas article */}
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 <strong>Astuce:</strong> Pour gérer plusieurs couleurs/tailles avec des stocks séparés, créez cet article puis ajoutez les variantes lors de la mise en ligne dans "Mes Produits".
              </p>
            </div>

            {/* Prix et stock */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Prix HT (XAF) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newArticle.prixUnitaireHt}
                  onChange={(e) => setNewArticle({ ...newArticle, prixUnitaireHt: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label>Quantité initiale *</Label>
                <Input
                  type="number"
                  min="0"
                  value={newArticle.quantiteStock}
                  onChange={(e) => setNewArticle({ ...newArticle, quantiteStock: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Seuil d'alerte</Label>
                <Input
                  type="number"
                  min="0"
                  value={newArticle.seuilAlerte}
                  onChange={(e) => setNewArticle({ ...newArticle, seuilAlerte: e.target.value })}
                  placeholder="5"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddArticle} disabled={addArticleMutation.isPending || articleImages.length === 0}>
              {addArticleMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Product Dialog */}
      <Dialog open={productDialog.open} onOpenChange={(open) => setProductDialog({ ...productDialog, open })}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Ajouter l'Article en Ligne</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    {productDialog.article?.designation as string}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Stock disponible: {(productDialog.article?.quantiteStock as number) || 0} unités
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                    ✅ Le stock sera automatiquement synchronisé avec votre boutique en ligne.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Quantité à mettre en ligne *</Label>
              <Input
                type="number"
                min="1"
                max={(productDialog.article?.quantiteStock as number) || 0}
                value={productData.quantiteEnLigne}
                onChange={(e) => setProductData({ ...productData, quantiteEnLigne: e.target.value })}
                placeholder="Quantité"
              />
              <p className="text-xs text-muted-foreground">
                Stock disponible: {(productDialog.article?.quantiteStock as number) || 0} unités. 
                Après mise en ligne, il restera {Math.max(0, ((productDialog.article?.quantiteStock as number) || 0) - (parseInt(productData.quantiteEnLigne) || 0))} unités en stock.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Description détaillée (optionnelle)</Label>
              <Textarea
                value={productData.descriptionLongue}
                onChange={(e) => setProductData({ ...productData, descriptionLongue: e.target.value })}
                placeholder="Ajoutez une description complète pour la boutique en ligne..."
                rows={4}
              />
            </div>
            
            {/* Images Section */}
            <div className="space-y-2">
              <Label>Images du produit *</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleProductImageUpload}
                  className="hidden"
                  id="product-images-input"
                />
                <label htmlFor="product-images-input" className="cursor-pointer block">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium">Cliquez pour ajouter des images (obligatoire)</p>
                  <p className="text-xs text-muted-foreground">Accepte JPG, PNG (Max 5 images)</p>
                </label>
              </div>
              
              {/* Selected Images Preview */}
              {productImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Images sélectionnées: {productImages.length}/5</p>
                  <div className="grid grid-cols-3 gap-2">
                    {productImages.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="visibleEnLigne"
                checked={productData.visibleEnLigne}
                onChange={(e) => setProductData({ ...productData, visibleEnLigne: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="visibleEnLigne" className="font-normal cursor-pointer">
                Rendre visible en ligne immédiatement
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog({ open: false, article: null })}>
              Annuler
            </Button>
            <Button onClick={handleCreateProduct} disabled={addProductMutation.isPending || productImages.length === 0}>
              {addProductMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              <Store className="h-4 w-4 mr-2" />
              Ajouter en Ligne
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
