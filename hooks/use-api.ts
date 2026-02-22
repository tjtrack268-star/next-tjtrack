"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { compressImage } from "@/lib/image-compress"
import type {
  ApiResponse,
  ArticleDto,
  CategorieDto,
  PanierDto,
  PanierRequest,
  ProduitDetailDto,
  AlerteStock,
  Article,
  CommandeFournisseur,
  Fournisseur,
  MouvementStockDto,
  Commande,
  Ventes,
  ProduitEcommerce,
  ProfileResponse,
  ProfileRequest,
  AuthRequest,
  ResetPasswordRequest,
  PaiementRequest,
  Facture,
  Client,
  CommandeClient,
  Entreprise,
  CampagnePublicitaire,
  CampagneRequest,
  StockAdjustmentRequest,
  ProduitEcommerceDto,
  LigneCommandeFournisseur,
  LigneCommandeClient,
  PayoutOverview,
  PayoutTransaction,
  PayoutConfig,
  UpdatePayoutConfigRequest,
} from "@/types/api"

// Query Keys
export const queryKeys = {
  articles: ["articles"] as const,
  article: (id: number) => ["articles", id] as const,
  categories: ["categories"] as const,
  catalogue: (params?: CatalogueParams) => ["catalogue", params] as const,
  produit: (id: number) => ["produit", id] as const,
  panier: (userEmail: string) => ["panier", userEmail] as const,
  lowStock: ["lowStock"] as const,
  outOfStock: ["outOfStock"] as const,
  alerts: ["alerts"] as const,
  stockStats: ["stockStats"] as const,
  ecommerceStats: ["ecommerceStats"] as const,
  commandesFournisseur: ["commandesFournisseur"] as const,
  fournisseurs: ["fournisseurs"] as const,
  fournisseursActifs: ["fournisseursActifs"] as const,
  mouvements: ["mouvements"] as const,
  ventes: ["ventes"] as const,
  produitsEnAvant: ["produitsEnAvant"] as const,
  carrousel: ["carrousel"] as const,
  articlesPopulaires: ["articlesPopulaires"] as const,
  nouveautes: ["nouveautes"] as const,
  profile: (email: string) => ["profile", email] as const,
  pendingUsers: ["pendingUsers"] as const,
  allUsers: ["allUsers"] as const,
  clients: ["clients"] as const,
  client: (id: number) => ["clients", id] as const,
  entreprises: ["entreprises"] as const,
  entreprise: (id: number) => ["entreprises", id] as const,
  commandesClient: ["commandesClient"] as const,
  commandeClient: (id: number) => ["commandesClient", id] as const,
  factures: ["factures"] as const,
  banniereprincipale: ["bannierePrincipale"] as const,
  campagnes: (userId: string) => ["campagnes", userId] as const,
  tarifs: ["tarifs"] as const,
  merchantProduits: (userId: string) => ["merchantProduits", userId] as const,
  merchantArticles: (userId: string) => ["merchantArticles", userId] as const,
  supplierArticles: (userId: string) => ["supplierArticles", userId] as const,
  supplierCommandes: (userId: string) => ["supplierCommandes", userId] as const,
  fournisseurOrders: (id: number) => ["fournisseurOrders", id] as const,
  merchantOrders: (id: number) => ["merchantOrders", id] as const,
  commandeFournisseurLignes: (id: number) => ["commandeFournisseurLignes", id] as const,
  mouvementsByArticle: (articleId: number) => ["mouvements", "article", articleId] as const,
  mouvementsByPeriode: (debut: string, fin: string) => ["mouvements", "periode", debut, fin] as const,
  payoutOverview: ["payoutOverview"] as const,
  payoutTransactions: ["payoutTransactions"] as const,
  payoutConfig: ["payoutConfig"] as const,
}

interface CatalogueParams {
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
  categorieId?: number
  search?: string
}

// Catalogue Hooks
export function useCatalogue(params?: CatalogueParams) {
  return useQuery({
    queryKey: queryKeys.catalogue(params),
    queryFn: () =>
      apiClient.get<ProduitEcommerceDto[]>(
        "/catalogue/produits",
        params as Record<string, string | number | boolean | undefined>,
      ),
  })
}

export function useArticlesPopulaires() {
  return useQuery({
    queryKey: queryKeys.articlesPopulaires,
    queryFn: () => apiClient.get<ArticleDto[]>("/catalogue/articles/populaires"),
  })
}

export function useNouveautes() {
  return useQuery({
    queryKey: queryKeys.nouveautes,
    queryFn: () => apiClient.get<ArticleDto[]>("/catalogue/articles/nouveautes"),
  })
}

export function useProduitsEnAvant() {
  return useQuery({
    queryKey: queryKeys.produitsEnAvant,
    queryFn: () => apiClient.get<ApiResponse<unknown[]>>("/catalogue/produits-en-avant"),
  })
}

export function useCarrouselAccueil() {
  return useQuery({
    queryKey: queryKeys.carrousel,
    queryFn: () => apiClient.get<ApiResponse<unknown[]>>("/catalogue/carrousel-accueil"),
  })
}

export function useProduitDetail(id: number, userId: string) {
  return useQuery({
    queryKey: queryKeys.produit(id),
    queryFn: () => apiClient.get<ProduitDetailDto>(`/catalogue/produits/${id}`, { userId }),
    enabled: id > 0,
  })
}

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => apiClient.get<CategorieDto[]>("/catalogue/categories"),
  })
}

export function useBannierePrincipale() {
  return useQuery({
    queryKey: queryKeys.banniereprincipale,
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerce[]>>("/catalogue/banniere-principale"),
  })
}

// Cart Hooks
export function usePanier(userEmail: string) {
  return useQuery({
    queryKey: queryKeys.panier(userEmail),
    queryFn: () => apiClient.get<PanierDto>("/panier", { userEmail }),
    enabled: !!userEmail,
  })
}

export function useAjouterAuPanier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userEmail, data }: { userEmail: string; data: PanierRequest }) =>
      apiClient.post<ApiResponse<PanierDto>>("/panier/ajouter", data, { userEmail }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.panier(variables.userEmail) })
    },
  })
}

export function useModifierPanier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userEmail, data }: { userEmail: string; data: PanierRequest }) =>
      apiClient.put<ApiResponse<PanierDto>>("/panier/modifier", data, { userEmail }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.panier(variables.userEmail) })
    },
  })
}

export function useSupprimerDuPanier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userEmail, articleId }: { userEmail: string; articleId: number }) =>
      apiClient.delete<PanierDto>(`/panier/supprimer/${articleId}`, { userEmail }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.panier(variables.userEmail) })
    },
  })
}

export function useViderPanier() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userEmail: string) => apiClient.delete<void>("/panier/vider", { userEmail }),
    onSuccess: (_, userEmail) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.panier(userEmail) })
    },
  })
}

// Like & Favorites
export function useLikeProduit() {
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: string }) =>
      apiClient.post<ApiResponse<void>>(`/catalogue/produits/${id}/like`, undefined, { userId }),
  })
}

export function useFavorisProduit() {
  return useMutation({
    mutationFn: ({ id, userId }: { id: number; userId: string }) =>
      apiClient.post<ApiResponse<void>>(`/catalogue/produits/${id}/favoris`, undefined, { userId }),
  })
}

// Order Hooks
export function useCreerCommande() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { 
      userId: string
      email?: string
      items?: Array<{
        articleId: number
        quantite: number
        prixUnitaire: number
      }>
      adresseLivraison?: {
        nom: string
        prenom: string
        telephone: string
        adresse: string
        ville: string
        codePostal?: string
        pays?: string
      }
      modePaiement?: string
      fraisLivraison?: number
    }) => apiClient.post<ApiResponse<Commande>>("/commandes/creer", data, { userId: data.userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] })
      queryClient.invalidateQueries({ queryKey: ["commandesMerchant"] })
    },
  })
}

// Stock Management Hooks
export function useLowStockArticles() {
  return useQuery({
    queryKey: queryKeys.lowStock,
    queryFn: () => apiClient.get<Article[]>("/stock/inventory/alerts/low-stock"),
  })
}

export function useOutOfStockArticles() {
  return useQuery({
    queryKey: queryKeys.outOfStock,
    queryFn: () => apiClient.get<Article[]>("/stock/inventory/alerts/out-of-stock"),
  })
}

export function useUnreadAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: () => apiClient.get<AlerteStock[]>("/stock/inventory/alerts/unread"),
  })
}

export function useStockStats() {
  return useQuery({
    queryKey: queryKeys.stockStats,
    queryFn: () => apiClient.get<Record<string, unknown>>("/stock/inventory/dashboard"),
  })
}

export function useInventoryDashboard() {
  return useQuery({
    queryKey: ["inventoryDashboard"],
    queryFn: () => apiClient.get<Record<string, unknown>>("/stock/inventory/dashboard"),
  })
}

export function useEcommerceStats() {
  return useQuery({
    queryKey: queryKeys.ecommerceStats,
    queryFn: () => apiClient.get<Record<string, unknown>>("/ecommerce/stats"),
  })
}

export function useAjusterStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: { articleId: number; quantity: number; reason: string; userId: number }) =>
      apiClient.post<ApiResponse<void>>("/stock/inventory/adjust-stock", undefined, {
        articleId: params.articleId,
        quantity: params.quantity,
        reason: params.reason,
        userId: params.userId,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
      queryClient.invalidateQueries({ queryKey: queryKeys.lowStock })
      queryClient.invalidateQueries({ queryKey: queryKeys.outOfStock })
      queryClient.invalidateQueries({ queryKey: queryKeys.stockStats })
    },
  })
}

export function useReserveStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ articleId, quantity }: { articleId: number; quantity: number }) =>
      apiClient.post<ApiResponse<void>>("/stock/inventory/reserve-stock", undefined, { articleId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
      queryClient.invalidateQueries({ queryKey: queryKeys.stockStats })
    },
  })
}

export function useReleaseStock() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ articleId, quantity }: { articleId: number; quantity: number }) =>
      apiClient.post<ApiResponse<void>>("/stock/inventory/release-stock", undefined, { articleId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
      queryClient.invalidateQueries({ queryKey: queryKeys.stockStats })
    },
  })
}

// Articles Stock
export function useArticles() {
  return useQuery({
    queryKey: queryKeys.articles,
    queryFn: () => apiClient.get<ArticleDto[]>("/stock/articles"),
  })
}

export function useArticle(id: number) {
  return useQuery({
    queryKey: queryKeys.article(id),
    queryFn: () => apiClient.get<ArticleDto>(`/stock/articles/${id}`),
    enabled: id > 0,
  })
}

export function useCreateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ArticleDto) => apiClient.post<ArticleDto>("/stock/articles", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
    },
  })
}

export function useUpdateArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ArticleDto }) =>
      apiClient.put<ArticleDto>(`/stock/articles/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
    },
  })
}

export function useDeleteArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/stock/articles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
    },
  })
}

export function useArticlesByCategorie(categorieId: number) {
  return useQuery({
    queryKey: ["articles", "categorie", categorieId],
    queryFn: () => apiClient.get<ArticleDto[]>(`/stock/articles/categorie/${categorieId}`),
    enabled: categorieId > 0,
  })
}

export function useAjusterStockArticle() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, utilisateur, data }: { id: number; utilisateur: string; data: StockAdjustmentRequest }) =>
      apiClient.post<ApiResponse<void>>(`/stock/articles/${id}/ajuster-stock`, data, { utilisateur }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.articles })
      queryClient.invalidateQueries({ queryKey: queryKeys.lowStock })
      queryClient.invalidateQueries({ queryKey: queryKeys.stockStats })
    },
  })
}

// Mouvements Stock
export function useMouvementsStock() {
  return useQuery({
    queryKey: queryKeys.mouvements,
    queryFn: () => apiClient.get<MouvementStockDto[]>("/stock/mouvements"),
  })
}

export function useMouvementsByArticle(articleId: number) {
  return useQuery({
    queryKey: queryKeys.mouvementsByArticle(articleId),
    queryFn: () => apiClient.get<MouvementStockDto[]>(`/stock/mouvements/article/${articleId}`),
    enabled: articleId > 0,
  })
}

export function useMouvementsByPeriode(dateDebut: string, dateFin: string) {
  return useQuery({
    queryKey: queryKeys.mouvementsByPeriode(dateDebut, dateFin),
    queryFn: () => apiClient.get<MouvementStockDto[]>("/stock/mouvements/periode", { dateDebut, dateFin }),
    enabled: !!dateDebut && !!dateFin,
  })
}

// Fournisseurs
export function useFournisseurs() {
  return useQuery({
    queryKey: queryKeys.fournisseurs,
    queryFn: () => apiClient.get<Fournisseur[]>("/stock/fournisseurs"),
  })
}

export function useFournisseursActifs() {
  return useQuery({
    queryKey: queryKeys.fournisseursActifs,
    queryFn: () => apiClient.get<Fournisseur[]>("/stock/fournisseurs/active"),
  })
}

export function useFournisseur(id: number) {
  return useQuery({
    queryKey: ["fournisseur", id],
    queryFn: () => apiClient.get<Fournisseur>(`/stock/fournisseurs/${id}`),
    enabled: id > 0,
  })
}

export function useSearchFournisseurs(nom: string) {
  return useQuery({
    queryKey: ["fournisseurs", "search", nom],
    queryFn: () => apiClient.get<Fournisseur[]>("/stock/fournisseurs/search", { nom }),
    enabled: !!nom,
  })
}

export function useCreateFournisseur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Fournisseur) => apiClient.post<Fournisseur>("/stock/fournisseurs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fournisseurs })
    },
  })
}

export function useUpdateFournisseur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Fournisseur }) =>
      apiClient.put<Fournisseur>(`/stock/fournisseurs/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fournisseurs })
    },
  })
}

export function useDeleteFournisseur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<ApiResponse<void>>(`/stock/fournisseurs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.fournisseurs })
    },
  })
}

export function useSupplierOrders(supplierId: number) {
  return useQuery({
    queryKey: queryKeys.fournisseurOrders(supplierId),
    queryFn: () => apiClient.get<CommandeFournisseur[]>(`/stock/fournisseurs/supplier/${supplierId}/orders`),
    enabled: supplierId > 0,
  })
}

export function useMerchantOrders(merchantId: number) {
  return useQuery({
    queryKey: queryKeys.merchantOrders(merchantId),
    queryFn: () => apiClient.get<CommandeFournisseur[]>(`/stock/fournisseurs/merchant/${merchantId}/orders`),
    enabled: merchantId > 0,
  })
}

// Commandes Fournisseur
export function useCommandesFournisseur() {
  return useQuery({
    queryKey: queryKeys.commandesFournisseur,
    queryFn: () => apiClient.get<CommandeFournisseur[]>("/stock/commandes-fournisseur"),
  })
}

export function useCommandeFournisseur(id: number) {
  return useQuery({
    queryKey: ["commandeFournisseur", id],
    queryFn: () => apiClient.get<CommandeFournisseur>(`/stock/commandes-fournisseur/${id}`),
    enabled: id > 0,
  })
}

export function useCommandeFournisseurByCode(code: string) {
  return useQuery({
    queryKey: ["commandeFournisseur", "code", code],
    queryFn: () => apiClient.get<CommandeFournisseur>(`/stock/commandes-fournisseur/code/${code}`),
    enabled: !!code,
  })
}

export function useCommandeFournisseurLignes(id: number) {
  return useQuery({
    queryKey: queryKeys.commandeFournisseurLignes(id),
    queryFn: () => apiClient.get<LigneCommandeFournisseur[]>(`/stock/commandes-fournisseur/${id}/lignes`),
    enabled: id > 0,
  })
}

export function useCreateCommandeFournisseur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ merchantId, supplierId, commande }: { merchantId: number; supplierId: number; commande: any }) =>
      apiClient.post<CommandeFournisseur>("/stock/commandes-fournisseur", { commande }, { merchantId, supplierId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commandesFournisseur })
    },
  })
}

export function useShipCommandeFournisseur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dateLivraison }: { id: number; dateLivraison: string }) =>
      apiClient.post<void>(`/stock/commandes-fournisseur/${id}/ship`, { dateLivraison }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commandesFournisseur })
    },
  })
}

export function useDeleteCommandeFournisseur() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/stock/commandes-fournisseur/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commandesFournisseur })
    },
  })
}

// Ventes
export function useVentes() {
  return useQuery({
    queryKey: queryKeys.ventes,
    queryFn: () => apiClient.get<Ventes[]>("/ventes"),
  })
}

export function useVente(id: number) {
  return useQuery({
    queryKey: ["vente", id],
    queryFn: () => apiClient.get<Ventes>(`/ventes/${id}`),
    enabled: id > 0,
  })
}

export function useVenteByCode(code: string) {
  return useQuery({
    queryKey: ["vente", "code", code],
    queryFn: () => apiClient.get<Ventes>(`/ventes/code/${code}`),
    enabled: !!code,
  })
}

export function useCreateVente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Ventes) => apiClient.post<Ventes>("/ventes", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventes })
    },
  })
}

export function useDeleteVente() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/ventes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.ventes })
    },
  })
}

// Finance - CA
export function useChiffreAffaires(debut: string, fin: string) {
  return useQuery({
    queryKey: ["ca", debut, fin],
    queryFn: () => apiClient.get<number>("/finance/factures/ca", { debut, fin }),
    enabled: !!debut && !!fin,
  })
}

export function useGenererFacture() {
  return useMutation({
    mutationFn: (commandeId: number) => apiClient.post<ApiResponse<Facture>>(`/finance/factures/generer/${commandeId}`),
  })
}

export function useEnregistrerPaiement() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaiementRequest }) =>
      apiClient.post<ApiResponse<void>>(`/finance/factures/${id}/paiement`, data),
  })
}

// Clients CRUD
export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: () => apiClient.get<Client[]>("/clients"),
  })
}

export function useClient(id: number) {
  return useQuery({
    queryKey: queryKeys.client(id),
    queryFn: () => apiClient.get<Client>(`/clients/${id}`),
    enabled: id > 0,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Client) => apiClient.post<Client>("/clients", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/clients/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.clients })
    },
  })
}

// Entreprises CRUD
export function useEntreprises() {
  return useQuery({
    queryKey: queryKeys.entreprises,
    queryFn: () => apiClient.get<Entreprise[]>("/entreprises"),
  })
}

export function useEntreprise(id: number) {
  return useQuery({
    queryKey: queryKeys.entreprise(id),
    queryFn: () => apiClient.get<Entreprise>(`/entreprises/${id}`),
    enabled: id > 0,
  })
}

export function useCreateEntreprise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Entreprise) => apiClient.post<Entreprise>("/entreprises", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entreprises })
    },
  })
}

export function useDeleteEntreprise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/entreprises/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.entreprises })
    },
  })
}

// Commandes Client (E-COMMERCE)
export function useCommandesClient() {
  return useQuery({
    queryKey: queryKeys.commandesClient,
    queryFn: () => apiClient.get<CommandeClient[]>("/commandes-client"),
  })
}

export function useCommandeClient(id: number) {
  return useQuery({
    queryKey: queryKeys.commandeClient(id),
    queryFn: () => apiClient.get<CommandeClient>(`/commandes-client/${id}`),
    enabled: id > 0,
  })
}

export function useCommandeClientByCode(code: string) {
  return useQuery({
    queryKey: ["commandeClient", "code", code],
    queryFn: () => apiClient.get<CommandeClient>(`/commandes-client/code/${code}`),
    enabled: !!code,
  })
}

export function useCommandeClientLignes(id: number) {
  return useQuery({
    queryKey: ["commandeClientLignes", id],
    queryFn: () => apiClient.get<LigneCommandeClient[]>(`/commandes-client/${id}/lignes`),
    enabled: id > 0,
  })
}

export function useCreateCommandeClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CommandeClient) => apiClient.post<CommandeClient>("/commandes-client", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commandesClient })
    },
  })
}

export function useDeleteCommandeClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/commandes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.commandesClient })
      queryClient.invalidateQueries({ queryKey: ["commandesMerchant"] })
    },
  })
}

export function usePayerCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PaiementRequest }) =>
      apiClient.post<ApiResponse<Commande>>(`/commandes/${id}/payer`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] })
    },
  })
}

export function useExpedierCommande() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.post<ApiResponse<Commande>>(`/commandes/${id}/expedier`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commandes"] })
      queryClient.invalidateQueries({ queryKey: ["commandesMerchant"] })
    },
  })
}

export function useUpdateCommandeStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, statut }: { id: number; statut: string }) => {
      console.log(`Updating order ${id} to status ${statut}`);
      return apiClient.put<ApiResponse<Commande>>(`/commandes/${id}/statut`, { statut });
    },
    onSuccess: (data, variables) => {
      console.log(`Order ${variables.id} status updated successfully`);
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: ["commandes"] });
      queryClient.invalidateQueries({ queryKey: ["commandesMerchant"] });
      // Force immediate refetch for better UX
      queryClient.refetchQueries({ queryKey: ["commandesMerchant"] });
    },
    onError: (error: any, variables) => {
      console.error(`Failed to update order ${variables.id}:`, error);
      const message = error?.message || "Erreur lors de la mise à jour du statut";
      // Note: toast will be shown by the component using this hook
    },
    // Reduce timeout for better UX
    retry: 2,
    retryDelay: 1000,
  })
}

export function useCommandesMerchant(merchantUserId: string) {
  return useQuery({
    queryKey: ["commandesMerchant", merchantUserId],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Commande[]>>("/commandes/merchant", { merchantUserId })
      console.log('Merchant orders API response:', JSON.stringify(response, null, 2))
      return response
    },
    enabled: !!merchantUserId,
  })
}

export function useCommandesLivreur(livreurEmail: string) {
  return useQuery({
    queryKey: ["commandesLivreur", livreurEmail],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<any[]>>("/commandes/livreur", { livreurEmail })
      console.log('Livreur orders API response:', JSON.stringify(response, null, 2))
      return response
    },
    enabled: !!livreurEmail,
  })
}

export function useCommandesAll() {
  return useQuery({
    queryKey: ["commandes"],
    queryFn: () => apiClient.get<Commande[]>("/commandes"),
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: AuthRequest) => apiClient.post<Record<string, unknown>>("/login", data),
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: ProfileRequest) => apiClient.post<Record<string, unknown>>("/register", data),
  })
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post<Record<string, unknown>>("/verify-otp", data),
  })
}

export function useRegisterOtp() {
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => apiClient.post<Record<string, unknown>>("/register-otp", data),
  })
}

export function useSendOtp() {
  return useMutation({
    mutationFn: (email: string) => apiClient.post<void>("/send-otp", undefined, { email }),
  })
}

export function useSendResetOtp() {
  return useMutation({
    mutationFn: (email: string) => apiClient.post<void>("/send-reset-otp", undefined, { email }),
  })
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => apiClient.post<void>("/reset-password", data),
  })
}

export function useIsAuthenticated(email: string) {
  return useQuery({
    queryKey: ["isAuthenticated", email],
    queryFn: () => apiClient.get<Record<string, unknown>>("/is-authenticated", { email }),
    enabled: !!email,
  })
}

export function useProfile(email: string) {
  return useQuery({
    queryKey: queryKeys.profile(email),
    queryFn: () => apiClient.get<ProfileResponse>("/profile", { email }),
    enabled: !!email,
  })
}

export function usePendingUsers() {
  return useQuery({
    queryKey: queryKeys.pendingUsers,
    queryFn: () => apiClient.get<ProfileResponse[]>("/admin/pending-users"),
  })
}

export function useAllUsers(params?: { page?: number; limit?: number; role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: [...queryKeys.allUsers, params],
    queryFn: () => apiClient.get<{ users: ProfileResponse[]; total: number; page: number }>("/admin/all-users", params),
  })
}

export function useApproveUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId }: { userId: string; approvedBy?: string }) => {
      console.log('=== APPROVE USER DEBUG ===');
      console.log('userId:', userId);
      console.log('userId type:', typeof userId);
      console.log('userId is undefined?', userId === undefined);
      console.log('userId is null?', userId === null);
      
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ Invalid userId:', userId);
        throw new Error('ID utilisateur invalide');
      }
      
      const token = localStorage.getItem('tj-track-token');
      console.log('Token available?', !!token);
      if (token) {
        console.log('Token preview:', token.substring(0, 20) + '...');
      }
      
      console.log('Calling API endpoint:', `/admin/approve-user/${userId}`);
      
      try {
        const response = await apiClient.post<Record<string, unknown>>(`/admin/approve-user/${userId}`);
        console.log('✅ API response:', response);
        return response;
      } catch (error: any) {
        console.error('❌ API error:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        throw error;
      }
    },
    onSuccess: async () => {
      console.log('✅ Approval successful, refetching queries');
      await queryClient.invalidateQueries({ queryKey: queryKeys.allUsers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.pendingUsers });
      await queryClient.invalidateQueries({ queryKey: ["userAnalytics"] });
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
    },
  });
}

export function useRejectUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ userId }: { userId: string; rejectedBy?: string }) => {
      console.log('=== REJECT USER DEBUG ===');
      console.log('userId:', userId);
      console.log('userId type:', typeof userId);
      
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ Invalid userId:', userId);
        throw new Error('ID utilisateur invalide');
      }
      
      console.log('Calling API endpoint:', `/admin/reject-user/${userId}`);
      
      try {
        const response = await apiClient.post<Record<string, unknown>>(`/admin/reject-user/${userId}`);
        console.log('✅ API response:', response);
        return response;
      } catch (error: any) {
        console.error('❌ API error:', error);
        console.error('Error message:', error.message);
        throw error;
      }
    },
    onSuccess: async () => {
      console.log('✅ Rejection successful, refetching queries');
      await queryClient.invalidateQueries({ queryKey: queryKeys.pendingUsers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.allUsers });
      await queryClient.invalidateQueries({ queryKey: ["userAnalytics"] });
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      console.log('=== DELETE USER DEBUG ===');
      console.log('userId:', userId);
      
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.error('❌ Invalid userId:', userId);
        throw new Error('ID utilisateur invalide');
      }
      
      console.log('Calling API endpoint:', `/admin/users/${userId}`);
      
      try {
        const response = await apiClient.delete<void>(`/admin/users/${userId}`);
        console.log('✅ API response:', response);
        return response;
      } catch (error: any) {
        console.error('❌ API error:', error);
        console.error('Error message:', error.message);
        throw error;
      }
    },
    onSuccess: async () => {
      console.log('✅ Deletion successful, refetching queries');
      await queryClient.invalidateQueries({ queryKey: queryKeys.pendingUsers });
      await queryClient.invalidateQueries({ queryKey: queryKeys.allUsers });
      await queryClient.invalidateQueries({ queryKey: ["userAnalytics"] });
    },
    onError: (error: any) => {
      console.error('❌ Mutation error:', error);
    },
  })
}

export function useUserDocuments(userEmail: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["userDocuments", userEmail],
    queryFn: () => apiClient.get<Array<{
      id: number
      documentType: string
      objectName: string
      status: string
      uploadedAt: string
    }>>("/profile-documents", { userEmail }),
    enabled: !!userEmail && enabled,
  })
}

export function useCategorie(id: number) {
  return useQuery({
    queryKey: ["categorie", id],
    queryFn: () => apiClient.get<CategorieDto>(`/stock/categories/${id}`),
    enabled: id > 0,
  })
}

export function useAllCategories() {
  return useQuery({
    queryKey: ["allCategories"],
    queryFn: () => apiClient.get<CategorieDto[]>("/stock/categories"),
  })
}

export function useCreateCategorie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CategorieDto) => apiClient.post<CategorieDto>("/stock/categories", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      queryClient.invalidateQueries({ queryKey: ["allCategories"] })
    },
  })
}

export function useUpdateCategorie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategorieDto }) =>
      apiClient.put<CategorieDto>(`/stock/categories/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      queryClient.invalidateQueries({ queryKey: ["allCategories"] })
    },
  })
}

export function useDeleteCategorie() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.delete<void>(`/stock/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories })
      queryClient.invalidateQueries({ queryKey: ["allCategories"] })
    },
  })
}

export function useMerchantProduits(merchantUserId: string) {
  return useQuery({
    queryKey: queryKeys.merchantProduits(merchantUserId),
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerceDto[]>>("/merchant/produits"),
    enabled: !!merchantUserId,
  })
}

export function useAjouterProduitMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      produitDto,
      images,
      merchantUserId,
    }: {
      produitDto: ProduitEcommerceDto
      images: File[]
      merchantUserId: string
    }) => {
      const token = localStorage.getItem("tj-track-token")
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"
      const formData = new FormData()
      
      // Ajouter chaque champ du DTO séparément
      formData.append("nom", produitDto.nom || "")
      formData.append("description", produitDto.description || "")
      formData.append("descriptionLongue", produitDto.descriptionLongue || "")
      formData.append("prix", produitDto.prix?.toString() || "0")
      formData.append("quantite", produitDto.quantite?.toString() || "0")
      formData.append("categorieId", produitDto.categorieId?.toString() || "1")
      formData.append("visibleEnLigne", produitDto.visibleEnLigne?.toString() || "true")
      formData.append("merchantUserId", merchantUserId)
      
      // Ajouter l'articleId pour que le backend puisse récupérer la photo de l'article
      if (produitDto.articleId) {
        formData.append("articleId", produitDto.articleId.toString())
      }
      
      // Ajouter quantiteEnLigne si fourni
      if (produitDto.quantiteEnLigne) {
        formData.append("quantiteEnLigne", produitDto.quantiteEnLigne.toString())
      }
      
      // Compresser et ajouter les images
      for (const img of images) {
        const compressed = await compressImage(img)
        formData.append("images", compressed)
      }
      
      const response = await fetch(`${API_BASE_URL}/merchant/produits`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        // Try to parse as JSON to get the error message
        try {
          const errorJson = JSON.parse(errorText)
          const errorMessage = errorJson.message || errorJson.error || errorText
          throw new Error(errorMessage)
        } catch (parseError) {
          // If not JSON, use the text directly
          throw new Error(errorText || `HTTP error! status: ${response.status}`)
        }
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantProduits"] })
      queryClient.invalidateQueries({ queryKey: ["merchantArticles"] })
      queryClient.invalidateQueries({ queryKey: queryKeys.stockStats })
    },
  })
}

export function useModifierVisibiliteProduit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, visible, merchantUserId }: { id: number; visible: boolean; merchantUserId: string }) =>
      apiClient.put<ApiResponse<ProduitEcommerceDto>>(`/merchant/produits/${id}/visibilite`, undefined, {
        visible,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantProduits"] })
    },
  })
}

// Product Variants
export function useProductVariants(produitId: number) {
  return useQuery({
    queryKey: ["productVariants", produitId],
    queryFn: () => apiClient.get<ApiResponse<any[]>>(`/merchant/produits/${produitId}/variants`),
    enabled: produitId > 0,
  })
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ produitId, variant }: { produitId: number; variant: any }) =>
      apiClient.post<ApiResponse<any>>(`/merchant/produits/${produitId}/variants`, variant),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productVariants", variables.produitId] })
      queryClient.invalidateQueries({ queryKey: ["merchantProduits"] })
    },
  })
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ produitId, variantId, variant }: { produitId: number; variantId: number; variant: any }) =>
      apiClient.put<ApiResponse<any>>(`/merchant/produits/${produitId}/variants/${variantId}`, variant),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productVariants", variables.produitId] })
      queryClient.invalidateQueries({ queryKey: ["merchantProduits"] })
    },
  })
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ produitId, variantId }: { produitId: number; variantId: number }) =>
      apiClient.delete<ApiResponse<void>>(`/merchant/produits/${produitId}/variants/${variantId}`),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["productVariants", variables.produitId] })
      queryClient.invalidateQueries({ queryKey: ["merchantProduits"] })
    },
  })
}

export function useMerchantArticles(userId: string) {
  return useQuery({
    queryKey: queryKeys.merchantArticles(userId),
    queryFn: () => apiClient.get<ApiResponse<ArticleDto[]>>("/merchant/stock/articles", { userId }),
    enabled: !!userId,
  })
}

export function useMerchantStockFaible(userId: string) {
  return useQuery({
    queryKey: ["merchantStockFaible", userId],
    queryFn: () => apiClient.get<ApiResponse<ArticleDto[]>>("/merchant/stock/articles/stock-faible", { userId }),
    enabled: !!userId,
  })
}

export function useAjouterArticleMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ArticleDto }) =>
      apiClient.post<ApiResponse<ArticleDto>>("/merchant/stock/articles/json", data, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantArticles"] })
    },
  })
}

export function useAjouterArticleMerchantAvecImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      articleData,
      image,
      userId,
    }: {
      articleData: {
        designation: string
        description: string
        prixUnitaireHt: string
        prixUnitaireTtc?: string
        quantiteStock: string
        categorieId: string
        seuilAlerte?: string
      }
      image?: File
      userId: string
    }) => {
      const token = localStorage.getItem("tj-track-token")
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.tjtracks.com/api/v1.0"
      const formData = new FormData()
      
      // Ajouter les champs de l'article
      formData.append("designation", articleData.designation)
      formData.append("description", articleData.description)
      formData.append("prixUnitaireHt", articleData.prixUnitaireHt)
      if (articleData.prixUnitaireTtc) {
        formData.append("prixUnitaireTtc", articleData.prixUnitaireTtc)
      }
      formData.append("quantiteStock", articleData.quantiteStock)
      formData.append("categorieId", articleData.categorieId)
      formData.append("seuilAlerte", articleData.seuilAlerte || "5")
      
      if (image) {
        formData.append("image", image)
      }
      
      const response = await fetch(`${API_BASE_URL}/merchant/stock/articles`, {
        method: "POST",
        headers: {
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: formData,
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantArticles"] })
    },
  })
}

export function useAjusterStockMerchant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantite, motif, userId }: { id: number; quantite: number; motif: string; userId: string }) =>
      apiClient.put<ApiResponse<void>>(`/merchant/stock/articles/${id}/stock`, undefined, { quantite, motif, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantArticles"] })
    },
  })
}

export function useSupplierArticles(userId: string) {
  return useQuery({
    queryKey: queryKeys.supplierArticles(userId),
    queryFn: () => apiClient.get<ApiResponse<ArticleDto[]>>("/supplier/stock/articles", { userId }),
    enabled: !!userId,
  })
}

export function useAjouterArticleSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: ArticleDto }) =>
      apiClient.post<ApiResponse<ArticleDto>>("/supplier/stock/articles", data, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierArticles"] })
    },
  })
}

export function useAjusterStockSupplier() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantite, motif, userId }: { id: number; quantite: number; motif: string; userId: string }) =>
      apiClient.put<ApiResponse<void>>(`/supplier/stock/articles/${id}/stock`, undefined, { quantite, motif, userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supplierArticles"] })
    },
  })
}

export function useSupplierCommandesMerchants(userId: string) {
  return useQuery({
    queryKey: queryKeys.supplierCommandes(userId),
    queryFn: () => apiClient.get<ApiResponse<unknown[]>>("/supplier/stock/commandes-merchants", { userId }),
    enabled: !!userId,
  })
}

export function usePubliciteProduitsEnAvant() {
  return useQuery({
    queryKey: ["publiciteProduitsEnAvant"],
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerce[]>>("/api/publicite/produits-en-avant"),
  })
}

export function usePubliciteProduitsEnAvantParType(type: string) {
  return useQuery({
    queryKey: ["publiciteProduitsEnAvant", type],
    queryFn: () => apiClient.get<ApiResponse<ProduitEcommerce[]>>(`/api/publicite/produits-en-avant/${type}`),
    enabled: !!type,
  })
}

export function useCalculerTarif(type: string, periode: string) {
  return useQuery({
    queryKey: ["tarif", type, periode],
    queryFn: () => apiClient.get<ApiResponse<number>>("/api/publicite/tarif", { type, periode }),
    enabled: !!type && !!periode,
  })
}

export function useIncrementerVues() {
  return useMutation({
    mutationFn: (campagneId: number) => apiClient.post<ApiResponse<void>>(`/api/publicite/campagne/${campagneId}/vue`),
  })
}

export function useIncrementerClics() {
  return useMutation({
    mutationFn: (campagneId: number) => apiClient.post<ApiResponse<void>>(`/api/publicite/campagne/${campagneId}/clic`),
  })
}

export function useAdminCampagnes(statut?: "EN_ATTENTE" | "ACTIVE" | "EXPIREE" | "SUSPENDUE" | "ANNULEE") {
  return useQuery({
    queryKey: ["adminCampagnes", statut || "ALL"],
    queryFn: () =>
      apiClient.get<ApiResponse<CampagnePublicitaire[]>>("/api/publicite/admin/campagnes", statut ? { statut } : undefined),
  })
}

export function useUpdateCampagneStatutAdmin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ campagneId, statut }: { campagneId: number; statut: "EN_ATTENTE" | "ACTIVE" | "EXPIREE" | "SUSPENDUE" | "ANNULEE" }) =>
      apiClient.put<ApiResponse<CampagnePublicitaire>>(`/api/publicite/admin/campagnes/${campagneId}/statut`, undefined, { statut }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCampagnes"] })
      queryClient.invalidateQueries({ queryKey: ["publiciteAdminDashboard"] })
      queryClient.invalidateQueries({ queryKey: ["campagnes"] })
    },
  })
}

// Merchant Publicite
export function useMesCampagnes(userId: string) {
  return useQuery({
    queryKey: queryKeys.campagnes(userId),
    queryFn: () =>
      apiClient.get<ApiResponse<CampagnePublicitaire[]>>("/api/merchant/publicite/mes-campagnes", { userId }),
    enabled: !!userId,
  })
}

export function useMerchantCalculerTarif(type: string, periode: string) {
  return useQuery({
    queryKey: ["merchantTarif", type, periode],
    queryFn: () => apiClient.get<ApiResponse<number>>("/api/merchant/publicite/tarifs", { type, periode }),
    enabled: !!type && !!periode,
  })
}

export function useCreerCampagne() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: CampagneRequest }) =>
      apiClient.post<ApiResponse<string>>("/api/merchant/publicite/campagne", data, { userId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campagnes"] })
    },
  })
}

export function useAddRole() {
  return useMutation({
    mutationFn: (name: string) => apiClient.post<{ id: number; name: string }>("/roles", name),
  })
}

// Analytics & Dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => apiClient.get<{
      totalRevenue: number
      totalOrders: number
      totalProducts: number
      lowStockAlerts: number
      outOfStockProducts: number
      recentActivity: Array<{ id: string; message: string; time: string }>
    }>("/admin/dashboard-stats"),
  })
}

export function useRevenueAnalytics(timeRange: string) {
  return useQuery({
    queryKey: ["revenueAnalytics", timeRange],
    queryFn: () => apiClient.get<Array<{
      period: string
      revenue: number
      orders: number
      growth: number
    }>>("/api/admin/analytics/revenue", { timeRange }),
  })
}

export function useTopProducts(limit: number = 10) {
  return useQuery({
    queryKey: ["topProducts", limit],
    queryFn: () => apiClient.get<Array<{
      id: number
      name: string
      sales: number
      revenue: number
      growth: number
    }>>("/api/admin/analytics/top-products", { limit }),
  })
}

export function useOrderAnalytics() {
  return useQuery({
    queryKey: ["orderAnalytics"],
    queryFn: () => apiClient.get<{
      statusDistribution: Array<{ status: string; count: number; percentage: number }>
      dailyOrders: Array<{ date: string; orders: number }>
      averageOrderValue: number
    }>("/api/admin/analytics/orders"),
  })
}

export function useUserAnalytics() {
  return useQuery({
    queryKey: ["userAnalytics"],
    queryFn: () => apiClient.get<{
      roleDistribution: Array<{ role: string; count: number; percentage: number }>
      registrationTrend: Array<{ date: string; registrations: number }>
      activeUsers: number
      retentionRate: number
    }>("/api/admin/analytics/users"),
  })
}

export function usePerformanceMetrics() {
  return useQuery({
    queryKey: ["performanceMetrics"],
    queryFn: () => apiClient.get<{
      conversionRate: number
      averageOrderValue: number
      customerLifetimeValue: number
      returnCustomerRate: number
      cartAbandonmentRate: number
    }>("/api/admin/analytics/performance"),
  })
}

export function useSystemAlerts() {
  return useQuery({
    queryKey: ["systemAlerts"],
    queryFn: () => apiClient.get<Array<{
      id: string
      type: string
      message: string
      priority: 'high' | 'medium' | 'low'
      time: string
    }>>("/admin/alerts"),
  })
}

export function usePayoutOverview() {
  return useQuery({
    queryKey: queryKeys.payoutOverview,
    queryFn: () => apiClient.get<PayoutOverview>("/admin/payouts/overview"),
  })
}

export function usePayoutTransactions() {
  return useQuery({
    queryKey: queryKeys.payoutTransactions,
    queryFn: () => apiClient.get<PayoutTransaction[]>("/admin/payouts/transactions"),
  })
}

export function useProcessPendingPayouts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (limit: number = 50) => apiClient.post<{ processed: number; limit: number }>(`/admin/payouts/process-pending?limit=${limit}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payoutOverview })
      queryClient.invalidateQueries({ queryKey: queryKeys.payoutTransactions })
    },
  })
}

export function useRetryPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => apiClient.post<PayoutTransaction>(`/admin/payouts/retry/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payoutOverview })
      queryClient.invalidateQueries({ queryKey: queryKeys.payoutTransactions })
    },
  })
}

export function usePayoutConfig() {
  return useQuery({
    queryKey: queryKeys.payoutConfig,
    queryFn: () => apiClient.get<PayoutConfig>("/admin/payout-config"),
  })
}

export function useUpdatePayoutConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ data, updatedBy }: { data: UpdatePayoutConfigRequest; updatedBy?: string }) =>
      apiClient.put<{ message: string }>(`/admin/payout-config?updatedBy=${encodeURIComponent(updatedBy || "admin")}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payoutConfig })
    },
  })
}

export function useTestCinetPayConnection() {
  return useMutation({
    mutationFn: () => apiClient.post<{ success: boolean; message: string }>("/admin/payout-config/test-cinetpay"),
  })
}

// Content Management
export function useContentItems() {
  return useQuery({
    queryKey: ["contentItems"],
    queryFn: () => apiClient.get<Array<{
      id: string
      title: string
      type: string
      status: string
      lastModified: string
    }>>("/admin/content"),
  })
}

export function useBulkUserActions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userIds, action }: { userIds: string[]; action: 'approve' | 'reject' | 'suspend' }) =>
      apiClient.post<void>("/admin/bulk-user-actions", { userIds, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.allUsers })
      queryClient.invalidateQueries({ queryKey: queryKeys.pendingUsers })
    },
  })
}

// Communication & Relations
export function useConversations() {
  return useQuery({
    queryKey: ["conversations"],
    queryFn: () => apiClient.get<Array<{
      id: string
      user: string
      role: string
      subject: string
      status: string
      lastMessage: string
      unread: number
    }>>("/admin/conversations"),
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, message, type }: { userId: string; message: string; type: 'direct' | 'broadcast' }) =>
      apiClient.post<void>("/admin/send-message", { userId, message, type }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] })
    },
  })
}

export function useMerchantRelations() {
  return useQuery({
    queryKey: ["merchantRelations"],
    queryFn: () => apiClient.get<Array<{
      id: string
      name: string
      status: string
      products: number
      revenue: number
      commission: number
      rating: number
      issues: number
    }>>("/admin/merchant-relations"),
  })
}

export function useUpdateMerchantStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ merchantId, status }: { merchantId: string; status: 'active' | 'suspended' | 'pending' }) =>
      apiClient.put<void>(`/admin/merchants/${merchantId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["merchantRelations"] })
    },
  })
}

export function useSupportTickets() {
  return useQuery({
    queryKey: ["supportTickets"],
    queryFn: () => apiClient.get<Array<{
      id: string
      title: string
      user: string
      userType: string
      priority: string
      status: string
      category: string
      created: string
    }>>("/admin/support-tickets"),
  })
}

export function useUpdateTicketStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: 'open' | 'in_progress' | 'resolved' }) =>
      apiClient.put<void>(`/admin/tickets/${ticketId}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["supportTickets"] })
    },
  })
}
