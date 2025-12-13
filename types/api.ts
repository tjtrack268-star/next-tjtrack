// API Response Types based on OpenAPI spec

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
}

export interface Adresse {
  id?: number
  adresse1: string
  adresse2?: string
  ville: string
  codePostal: string
  pays: string
}

export interface Entreprise {
  id?: number
  nom: string
  description?: string
  codeFiscal?: string
  email: string
  telephone: string
  siteWeb?: string
  adresse?: Adresse
  createdAt?: string
}

export interface Fournisseur {
  id?: number
  nom: string
  email: string
  telephone: string
  contact?: string
  adresse?: Adresse
  entreprise?: Entreprise
  statut: "ACTIF" | "INACTIF"
  createdAt?: string
}

export interface CategorieDto {
  id?: number
  code: string
  designation: string
  description?: string
  nombreArticles?: number
}

export interface ArticleDto {
  id?: number
  codeArticle: string
  designation: string
  description?: string
  prixUnitaireHt: number
  tauxTva?: number
  prixUnitaireTtc?: number
  photo?: string
  quantiteStock?: number
  seuilAlerte?: number
  stockMax?: number
  categorieId?: number
  categorieDesignation?: string
  stockFaible?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Article {
  id: number
  codeArticle: string
  designation: string
  description?: string
  prixUnitaireHt: number
  tauxTva?: number
  prixUnitaireTtc?: number
  photo?: string
  categorie?: Categorie
  quantiteStock: number
  stockReserve?: number
  seuilAlerte: number
  stockMax?: number
  statut: "ACTIF" | "INACTIF" | "DISCONTINUE"
  stockDisponible?: number
  ruptureStock?: boolean
  stockFaible?: boolean
}

export interface Categorie {
  id: number
  code: string
  designation: string
  description?: string
  articles?: Article[]
}

export interface PanierDto {
  id?: number
  userId: string
  items: PanierItemDto[]
  totalItems: number
  montantTotal: number
  montantHT: number
  montantTVA: number
}

export interface PanierItemDto {
  id?: number
  articleId: number
  articleCode: string
  articleNom: string
  articlePhoto?: string
  quantite: number
  prixUnitaire: number
  sousTotal: number
  stockDisponible: number
  disponible: boolean
}

export interface PanierRequest {
  articleId: number
  quantite: number
}

export interface ProduitEcommerceDto {
  id?: number
  nom: string
  description: string
  descriptionLongue?: string
  prix: number
  quantite: number
  categorieId: number
  categorieName?: string
  images?: string[]
  motsCles?: string
  visibleEnLigne?: boolean
  nomCommercant?: string
  nomEntreprise?: string
  villeCommercant?: string
  noteMoyenne?: number
  nombreEvaluations?: number
  nombreLikes?: number
  nombreVues?: number
  nombreVentes?: number
}

export interface ProduitDetailDto {
  id: number
  nom: string
  description: string
  descriptionLongue?: string
  prix: number
  prixOriginal?: number
  quantiteDisponible: number
  codeArticle?: string
  images: string[]
  imageprincipale?: string
  categorieId: number
  categorieNom: string
  commercant: CommercantInfo
  noteMoyenne?: number
  nombreEvaluations?: number
  nombreLikes?: number
  nombreVues?: number
  nombreVentes?: number
  evaluations?: EvaluationDto[]
  produitsSimilaires?: ProduitResumeDto[]
  produitsRecommandes?: ProduitResumeDto[]
  motsCles?: string
  dateMiseEnLigne?: string
  enStock: boolean
  favori: boolean
}

export interface CommercantInfo {
  nom: string
  entreprise: string
  ville: string
  noteCommercant?: number
  nombreVentes?: number
  telephone?: string
  adresse?: string
}

export interface EvaluationDto {
  id: number
  nomClient: string
  note: number
  commentaire: string
  dateEvaluation: string
  recommande: boolean
}

export interface ProduitResumeDto {
  id: number
  nom: string
  prix: number
  imagePrincipale?: string
  noteMoyenne?: number
  nombreEvaluations?: number
}

export interface AlerteStock {
  id: number
  article: Article
  type: "STOCK_FAIBLE" | "RUPTURE_STOCK" | "SURSTOCK"
  seuil: number
  stockActuel: number
  message: string
  lu: boolean
  createdAt: string
}

export interface MouvementStockDto {
  id: number
  articleId: number
  articleDesignation: string
  typeMouvement: "ENTREE" | "SORTIE" | "CORRECTION_POSITIVE" | "CORRECTION_NEGATIVE"
  quantite: number
  prixUnitaire?: number
  motif: string
  dateMouvement: string
  createdBy: string
}

export interface CommandeFournisseur {
  id: number
  code: string
  fournisseur: Fournisseur
  ligneCommandeFournisseurs?: LigneCommandeFournisseur[]
  dateCommande: string
  dateLivraisonPrevue?: string
  dateLivraisonReelle?: string
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EXPEDIEE" | "RECUE" | "ANNULEE"
  totalHt: number
  totalTtc: number
  entreprise?: Entreprise
}

export interface LigneCommandeFournisseur {
  id: number
  commandeFournisseur?: CommandeFournisseur
  article: Article
  quantiteCommandee: number
  quantiteRecue?: number
  prixUnitaire: number
  prixTotal: number
}

export interface Commande {
  id: number
  numeroCommande: string
  client?: UserEntity
  items?: CommandeItem[]
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE"
  montantTotal: number
  fraisLivraison?: number
  adresseLivraison?: AdresseLivraison
  modePaiement?: "CARTE_BANCAIRE" | "PAYPAL" | "VIREMENT" | "ESPECES" | "MOBILE_MONEY"
  statutPaiement?: "EN_ATTENTE" | "PAYE" | "PARTIAL" | "ECHUE"
  commentaire?: string
  dateCommande: string
  dateLivraisonPrevue?: string
  dateLivraisonEffective?: string
}

export interface Ventes {
  id: number
  code: string
  client?: Client
  ligneVentes?: LigneVente[]
  commandeClient?: CommandeClient
  commentaire?: string
  dateVente: string
  totalHt: number
  totalTva: number
  totalTtc: number
  entreprise?: Entreprise
  entrepriseId?: number
}

export interface StockStats {
  totalArticles: number
  valeurStock: number
  articlesEnAlerte: number
  articlesRupture: number
  mouvementsJour: number
}

export interface EcommerceStats {
  totalCommandes: number
  commandesEnCours: number
  chiffreAffaires: number
  panierMoyen: number
  tauxConversion: number
}

export interface ProfileResponse {
  userId: string
  name: string
  email: string
  isAccountVerified: boolean
  isApproved: boolean
  roles: string[]
  phoneNumber?: string
  enterpriseName?: string
  town?: string
  address?: string
  createdAt?: string
}

export interface ProfileRequest {
  name: string
  email: string
  password: string
  role: "CLIENT" | "COMMERCANT" | "FOURNISSEUR" | "LIVREUR" | "ADMIN" | "MANAGER"
  merchantInfo?: MerchantInfo
  supplierInfo?: SupplierInfo
  deliveryInfo?: DeliveryInfo
  clientInfo?: ClientInfo
}

export interface MerchantInfo {
  shopName: string
  town: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

export interface SupplierInfo {
  shopName: string
  town: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

export interface DeliveryInfo {
  town: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

export interface ClientInfo {
  town: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

export interface AuthRequest {
  email: string
  password: string
}

export interface ResetPasswordRequest {
  newPassword: string
  otp: string
  email: string
}

export interface UserEntity {
  id: number
  userId: string
  name: string
  email: string
  isAccountVerified: boolean
  isApproved: boolean
  approvedBy?: string
  approvedAt?: string
  roles: Roles[]
  createdAt: string
  updatedAt: string
}

export interface Roles {
  id: number
  name: string
  createdAt: string
  updatedAt: string
}

export interface MerchantProfile {
  id: number
  user: UserEntity
  shopName: string
  town: string
  address: string
  phoneNumber: string
  latitude?: number
  longitude?: number
}

export interface ProduitEcommerce {
  id: number
  article: Article
  merchant: MerchantProfile
  visibleEnLigne: boolean
  images: string[]
  descriptionLongue?: string
  motsCles?: string
  notemoyenne?: number
  nombreEvaluations?: number
  nombreLikes?: number
  nombreVues?: number
  nombreVentes?: number
  dateMiseEnLigne?: string
  dateDerniereModification?: string
}

export interface AdresseLivraison {
  nom: string
  prenom: string
  telephone: string
  adresse: string
  ville: string
  codePostal: string
  pays: string
  complementAdresse?: string
}

export interface CommandeItem {
  id: number
  commande?: Commande
  article: Article
  quantite: number
  prixUnitaire: number
  sousTotal: number
}

export interface PaiementRequest {
  montant: number
  mode: "CARTE_BANCAIRE" | "PAYPAL" | "VIREMENT" | "ESPECES" | "MOBILE_MONEY" | "CHEQUE"
  reference?: string
}

export interface Facture {
  id: number
  numeroFacture: string
  client: UserEntity
  lignes: LigneFacture[]
  dateFacture: string
  dateEcheance?: string
  montantHT: number
  montantTVA: number
  montantTTC: number
  statut: "BROUILLON" | "ENVOYEE" | "PAYEE" | "ANNULEE"
  statutPaiement: "EN_ATTENTE" | "PAYE" | "PARTIEL" | "ECHUE"
  commentaire?: string
}

export interface LigneFacture {
  id: number
  facture?: Facture
  designation: string
  quantite: number
  prixUnitaire: number
  tauxTVA: number
  montantHT: number
  montantTVA: number
  montantTTC: number
}

export interface Client {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  dateNaissance?: string
  adresse?: Adresse
  entreprise?: Entreprise
  createdAt: string
}

export interface CommandeClient {
  id: number
  code: string
  client: Client
  ligneCommandeClients?: LigneCommandeClient[]
  dateCommande: string
  dateLivraison?: string
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EXPEDIEE" | "LIVREE" | "ANNULEE"
  totalHt: number
  totalTtc: number
  statutPaiement: "EN_ATTENTE" | "PAYE" | "PARTIAL" | "ECHUE"
  entreprise?: Entreprise
}

export interface LigneCommandeClient {
  id: number
  commandeClient?: CommandeClient
  article: Article
  quantite: number
  prixUnitaire: number
  prixTotal: number
  entrepriseId?: number
}

export interface LigneVente {
  id: number
  vente?: Ventes
  article: Article
  quantite: number
  prixUnitaire: number
  prixTotal: number
  entrepriseId?: number
}

export interface StockAdjustmentRequest {
  quantite: number
  motif: string
}

export interface OrderRequest {
  commande: CommandeFournisseur
}

export interface ShipRequest {
  dateLivraison: string
}

export interface CampagnePublicitaire {
  id: number
  produit: ProduitEcommerce
  merchant: MerchantProfile
  montantPaye: number
  typeCampagne: "MISE_EN_AVANT_SIMPLE" | "MISE_EN_AVANT_PREMIUM" | "BANNIERE_PRINCIPALE" | "CARROUSEL_ACCUEIL"
  periodeTarification: "JOUR" | "SEMAINE" | "MOIS"
  dateDebut: string
  dateFin: string
  statut: "EN_ATTENTE" | "ACTIVE" | "EXPIREE" | "SUSPENDUE" | "ANNULEE"
  nombreClics: number
  nombreVues: number
  dateCreation: string
  active: boolean
}

export interface CampagneRequest {
  produitId: number
  typeCampagne: "MISE_EN_AVANT_SIMPLE" | "MISE_EN_AVANT_PREMIUM" | "BANNIERE_PRINCIPALE" | "CARROUSEL_ACCUEIL"
  periodeTarification: "JOUR" | "SEMAINE" | "MOIS"
  modePaiement: "CARTE_BANCAIRE" | "PAYPAL" | "VIREMENT" | "ESPECES" | "MOBILE_MONEY" | "CHEQUE"
  montantPaye: number
}
