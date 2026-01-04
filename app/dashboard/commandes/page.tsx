"use client"

import React, { useState } from "react"
import {
  Search,
  Filter,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  CreditCard,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Phone,
  MapPin,
  Trash2,
  Edit,
  Printer,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCommandesMerchant, useDeleteCommandeClient, useExpedierCommande, useUpdateCommandeStatus } from "@/hooks/use-api"
import { useAuth } from "@/contexts/auth-context"

interface Commande {
  id: number
  numeroCommande: string
  client: string
  email: string
  telephone: string
  ville: string
  adresse: string
  codePostal: string
  modePaiement: string
  dateCommande: string
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE"
  statutPaiement: "EN_ATTENTE" | "PAYE" | "ECHEC" | "REMBOURSE"
  montantTotal: number
  fraisLivraison: number
  articles: number
  livreurNom?: string
  livreurTelephone?: string
  merchantNom?: string
  merchantVille?: string
  items?: Array<{
    id: number
    article: {
      designation: string
      prixUnitaireTtc: number
    }
    quantite: number
    prixUnitaire: number
    sousTotal: number
  }>
}

const statutStyles = {
  EN_ATTENTE: { label: "En attente", variant: "secondary" as const, icon: Clock },
  CONFIRMEE: { label: "Confirmée", variant: "default" as const, icon: CheckCircle },
  EN_PREPARATION: { label: "En préparation", variant: "default" as const, icon: Package },
  EXPEDIEE: { label: "Expédiée", variant: "default" as const, icon: Truck },
  LIVREE: { label: "Livrée", variant: "default" as const, icon: CheckCircle },
  ANNULEE: { label: "Annulée", variant: "destructive" as const, icon: XCircle },
}

const paiementStyles = {
  EN_ATTENTE: { label: "En attente", className: "bg-amber-500/10 text-amber-500" },
  PAYE: { label: "Payé", className: "bg-emerald-500/10 text-emerald-500" },
  ECHEC: { label: "Échec", className: "bg-red-500/10 text-red-500" },
  REMBOURSE: { label: "Remboursé", className: "bg-blue-500/10 text-blue-500" },
}

export default function CommandesPage() {
  const [search, setSearch] = useState("")
  const [statutFilter, setStatutFilter] = useState("all")
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { user } = useAuth()
  const { data: commandesResponse, isLoading, error, refetch } = useCommandesMerchant(user?.userId || "")
  const deleteCommandeMutation = useDeleteCommandeClient()
  const expedierCommandeMutation = useExpedierCommande()
  const updateStatusMutation = useUpdateCommandeStatus()
  const commandesData = Array.isArray(commandesResponse?.data) ? commandesResponse.data : []

  // Map API response to expected format
  const commandes: Commande[] = (commandesData as unknown[]).map((cmd: unknown) => {
    const c = cmd as Record<string, unknown>
    console.log('Raw command data:', JSON.stringify(c, null, 2))
    console.log('AdresseLivraison structure:', JSON.stringify(c.adresseLivraison, null, 2))
    return {
      id: Number(c.id) || 0,
      numeroCommande: String(c.code || c.numeroCommande || `CMD-${c.id}`),
      client: String((c.client as any)?.name || ""),
      email: String((c.client as any)?.email || ""),
      telephone: String(
        (c.adresseLivraison as any)?.telephone || 
        (c.client as any)?.telephone ||
        (c.client as any)?.phoneNumber ||
        c.telephone ||
        "N/A"
      ),
      ville: String(
        (c.adresseLivraison as any)?.ville || 
        (c.client as any)?.ville ||
        (c.client as any)?.town ||
        c.ville ||
        "N/A"
      ),
      adresse: String(
        (c.adresseLivraison as any)?.adresse || 
        (c.adresseLivraison as any)?.adresse1 ||
        (c.client as any)?.adresse ||
        (c.client as any)?.address ||
        c.adresse ||
        "N/A"
      ),
      codePostal: String(
        (c.adresseLivraison as any)?.codePostal || 
        (c.adresseLivraison as any)?.code_postal || 
        c.codePostal || 
        c.code_postal || 
        ""
      ),
      modePaiement: String(c.modePaiement || ""),
      dateCommande: String(c.dateCommande || new Date().toISOString()),
      statut: String(c.statut || "EN_ATTENTE") as Commande["statut"],
      statutPaiement: String(c.statutPaiement || "EN_ATTENTE") as Commande["statutPaiement"],
      montantTotal: Number(c.montantTotal || c.totalTtc) || 0,
      fraisLivraison: Number(c.fraisLivraison) || 0,
      articles: (c.items as any[])?.length || 0,
      items: (c.items as any[]) || [],
    }
  })

  const filteredCommandes = commandes.filter((cmd) => {
    const matchSearch =
      cmd.numeroCommande.toLowerCase().includes(search.toLowerCase()) ||
      cmd.client.toLowerCase().includes(search.toLowerCase())
    const matchStatut = statutFilter === "all" || cmd.statut === statutFilter
    return matchSearch && matchStatut
  })

  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage)
  const paginatedCommandes = filteredCommandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDeleteCommande = async (id: number, statut: string) => {
    // Vérifier que la commande peut être supprimée
    if (statut === "EXPEDIEE" || statut === "LIVREE") {
      alert("Impossible de supprimer une commande expédiée ou livrée");
      return;
    }
    
    if (confirm("Êtes-vous sûr de vouloir supprimer cette commande ?")) {
      try {
        await deleteCommandeMutation.mutateAsync(id)
        refetch()
      } catch (error) {
        console.error("Erreur lors de la suppression:", error)
      }
    }
  }

  const handleExpedierCommande = async (id: number) => {
    try {
      await expedierCommandeMutation.mutateAsync(id)
      refetch()
    } catch (error) {
      console.error("Erreur lors de l'expédition:", error)
    }
  }

  const handleUpdateStatus = async (id: number, statut: string) => {
    try {
      console.log(`Updating order ${id} to status ${statut}`);
      await updateStatusMutation.mutateAsync({ id, statut });
      await refetch();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      alert(`Erreur: ${errorMessage}`);
    }
  }

  const handleSendNotification = (id: number) => {
    // TODO: Implement customer notification
    console.log("Sending notification for order:", id)
  }

  const handlePreparerCommande = async (id: number) => {
    try {
      await updateStatusMutation.mutateAsync({ id, statut: "EN_PREPARATION" })
      refetch()
    } catch (error) {
      console.error("Erreur lors de la préparation:", error)
    }
  }

  const handlePrintInvoice = (commande: Commande) => {
  //  window.open(`${process.env.NEXT_PUBLIC_API_URL}/commandes/${commande.id}/facture`, '_blank')
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8"/>
        <title>Facture de Livraison - ${commande.numeroCommande}</title>
        <style>
          @page { size: A4; margin: 10mm; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #2c3e50; }
          
          /* Filigrane */
          .watermark {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px; color: #e5e7eb; opacity: 0.2; font-weight: bold; z-index: -1; pointer-events: none; white-space: nowrap;
          }

          /* Header */
          .header-table { width: 100%; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 20px; }
          .logo-text { font-size: 32px; font-weight: bold; color: #2c3e50; margin: 0; }
          .company-info { text-align: right; color: #7f8c8d; font-size: 13px; }

          .invoice-title { text-align: center; font-size: 28px; font-weight: bold; margin: 20px 0; text-transform: uppercase; }

          /* Blocs d'informations (Grid style) */
          .details-container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .detail-box { background-color: rgba(248, 249, 250, 0.1); padding: 15px; border-radius: 8px; border-left: 4px solid #3498db; }
          .detail-box h3 { margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; color: #2c3e50; border-bottom: 1px solid #dee2e6; padding-bottom: 5px; }
          .detail-box p { margin: 5px 0; font-size: 13px; line-height: 1.4; }

          /* Tableau des articles */
          .items-table { width: 100%; border-collapse: collapse; margin: 25px 0; }
          .items-table thead { background-color: #2c3e50; color: white; }
          .items-table th, .items-table td { padding: 12px; border-bottom: 1px solid #bdc3c7; text-align: left; font-size: 13px; }
          .text-right { text-align: right; }

          /* Section Totaux */
          .total-section { margin-left: auto; width: 300px; margin-top: 20px; }
          .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
          .grand-total { border-top: 2px solid #2c3e50; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 18px; color: #e67e22; }

          /* Signatures */
          .signature-section { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 60px; text-align: center; }
          .signature-box p { font-weight: bold; margin-bottom: 60px; text-decoration: underline; }
          .signature-line { border-top: 1px dashed #2c3e50; width: 80%; margin: 0 auto; }

          .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #95a5a6; border-top: 1px solid #ecf0f1; padding-top: 20px; }
          
          @media print {
            body { padding: 0; }
            .detail-box { background-color: #f8f9fa !important; -webkit-print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="watermark">TJ-TRACK</div>

        <table class="header-table">
          <tr>
            <td>
              <div class="logo-text">TJ-TRACK</div>
              <div style="color: #3498db; font-weight: bold; font-size: 14px;">Logistics & Delivery</div>
            </td>
            <td class="company-info">
              <p><strong>TJ-TRACK Sarl</strong></p>
              <p>Plateforme de Livraison Digitale</p>
              <p>Douala / Yaoundé, Cameroun</p>
              <p>Email: tj-track268@gmail.com</p>
            </td>
          </tr>
        </table>

        <div class="invoice-title">Bon de Livraison / Facture</div>

        <div class="details-container">
          <div class="detail-box">
            <h3>Commande</h3>
            <p><strong>N° :</strong> ${commande.numeroCommande}</p>
            <p><strong>Date Commande :</strong> ${new Date(commande.dateCommande).toLocaleString('fr-FR')}</p>
            <p><strong>Paiement :</strong> ${commande.statutPaiement || 'En attente'}</p>
          </div>
          <div class="detail-box">
            <h3>Destinataire (Client)</h3>
            <p><strong>Nom :</strong> ${commande.client}</p>
            <p><strong>Tél :</strong> ${commande.telephone}</p>
            <p><strong>Adresse :</strong> ${commande.adresse}, ${commande.ville}</p>
          </div>
          <div class="detail-box">
            <h3>Livreur</h3>
            <p><strong>Nom :</strong> ${commande.livreurNom || 'Non assigné'}</p>
            <p><strong>Contact :</strong> ${commande.livreurTelephone || '-'}</p>
          </div>
          <div class="detail-box">
            <h3>Expéditeur (Marchand)</h3>
            <p><strong>Boutique :</strong> ${commande.merchantNom || 'TJ-Track Central'}</p>
            <p><strong>Ville :</strong> ${commande.merchantVille || 'Cameroun'}</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th>Désignation de l'article</th>
              <th class="text-right">Qté</th>
              <th class="text-right">Prix Unitaire</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${commande.items?.map(item => `
              <tr>
                <td>${item.article.designation}</td>
                <td class="text-right">${item.quantite}</td>
                <td class="text-right">${item.prixUnitaire.toLocaleString('fr-FR')} FCFA</td>
                <td class="text-right">${item.sousTotal.toLocaleString('fr-FR')} FCFA</td>
              </tr>
            `).join('') || '<tr><td colspan="4">Aucun article</td></tr>'}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Sous-total:</span>
            <span>${(commande.montantTotal - (commande.fraisLivraison || 0)).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div class="total-row">
            <span>Frais de livraison:</span>
            <span>${(commande.fraisLivraison || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div class="total-row grand-total">
            <span>TOTAL À PAYER:</span>
            <span>${commande.montantTotal.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <p>Signature & Cachet Livreur</p>
            <div class="signature-line"></div>
          </div>
          <div class="signature-box">
            <p>Signature Client (Réception)</p>
            <div class="signature-line"></div>
          </div>
        </div>

        <div class="footer">
          <p>Merci d'avoir choisi <strong>TJ-Track</strong> pour vos achats et livraisons.</p>
          <p>Ce document certifie la passation de propriété des biens listés ci-dessus.</p>
          <p><em>Généré numériquement le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}</em></p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            window.onafterprint = function() { window.close(); }
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(invoiceHTML);
  printWindow.document.close();

  }

  // Stats
  const stats = {
    total: commandes.length,
    enAttente: commandes.filter((c) => c.statut === "EN_ATTENTE").length,
    enCours: commandes.filter((c) => ["CONFIRMEE", "EN_PREPARATION", "EXPEDIEE"].includes(c.statut)).length,
    livrees: commandes.filter((c) => c.statut === "LIVREE").length,
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
        <p className="text-destructive">Erreur lors du chargement des commandes</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Commandes Clients</h1>
          <p className="text-muted-foreground">Gérez et suivez les commandes de vos clients</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commandes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.enAttente}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">En Cours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.enCours}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Livrées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{stats.livrees}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro ou client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="EN_ATTENTE">En attente</SelectItem>
            <SelectItem value="CONFIRMEE">Confirmée</SelectItem>
            <SelectItem value="EN_PREPARATION">En préparation</SelectItem>
            <SelectItem value="EXPEDIEE">Expédiée</SelectItem>
            <SelectItem value="LIVREE">Livrée</SelectItem>
            <SelectItem value="ANNULEE">Annulée</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Commande</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Paiement</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-12">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCommandes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCommandes.map((commande) => {
                  const statut = statutStyles[commande.statut] || statutStyles.EN_ATTENTE
                  const paiement = paiementStyles[commande.statutPaiement] || paiementStyles.EN_ATTENTE
                  const StatutIcon = statut.icon

                  return (
                    <TableRow key={commande.id}>
                      <TableCell>
                        <div className="font-medium">{String(commande.numeroCommande)}</div>
                        <div className="text-xs text-muted-foreground">{String(commande.articles)} article(s)</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{String(commande.client)}</div>
                        <div className="text-xs text-muted-foreground">{String(commande.email)}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="text-xs text-muted-foreground">
                            Tel: {String(commande.telephone) || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Ville: {String(commande.ville) || "N/A"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(commande.dateCommande).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statut.variant} className="gap-1">
                          <StatutIcon className="h-3 w-3" />
                          {statut.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${paiement.className}`}
                        >
                          <CreditCard className="h-3 w-3" />
                          {paiement.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {commande.montantTotal.toLocaleString("fr-FR")} XAF
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setSelectedCommande(commande)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {commande.statut === "EN_ATTENTE" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(commande.id, "CONFIRMEE")}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Accepter
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleUpdateStatus(commande.id, "ANNULEE")}>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Rejeter
                                  </DropdownMenuItem>
                                </>
                              )}
                              {commande.statut === "CONFIRMEE" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(commande.id, "EN_PREPARATION")}>
                                  <Package className="h-4 w-4 mr-2" />
                                  Préparer
                                </DropdownMenuItem>
                              )}
                              {commande.statut === "EN_PREPARATION" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(commande.id, "EXPEDIEE")}>
                                  <Truck className="h-4 w-4 mr-2" />
                                  Expédier
                                </DropdownMenuItem>
                              )}
                              {commande.statut === "EXPEDIEE" && (
                                <DropdownMenuItem onClick={() => handleUpdateStatus(commande.id, "LIVREE")}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Marquer livrée
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem onClick={() => handleSendNotification(commande.id)}>
                                <Phone className="h-4 w-4 mr-2" />
                                Contacter client
                              </DropdownMenuItem>
                              {/* Afficher l'option supprimer seulement si la commande peut être supprimée */}
                              {!['EXPEDIEE', 'LIVREE'].includes(commande.statut) && (
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={() => handleDeleteCommande(commande.id, commande.statut)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Supprimer
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">{filteredCommandes.length} commande(s)</div>
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

      {/* Enhanced Order Details Dialog */}
      <Dialog open={!!selectedCommande} onOpenChange={() => setSelectedCommande(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl">Détails de la commande</DialogTitle>
                <DialogDescription className="text-lg font-medium">{selectedCommande?.numeroCommande}</DialogDescription>
              </div>
              <Button
                onClick={() => selectedCommande && window.open(`${process.env.NEXT_PUBLIC_API_URL}/commandes/${selectedCommande.id}/facture`, '_blank')}
                className="gap-2"
                variant="outline"
              >
                <FileText className="h-4 w-4" />
                Télécharger la facture PDF
              </Button>
            </div>
          </DialogHeader>
          
          {selectedCommande && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Order Status & Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Statut commande</p>
                          <Badge variant={statutStyles[selectedCommande.statut]?.variant || "secondary"} className="gap-1">
                            {React.createElement(statutStyles[selectedCommande.statut]?.icon || Clock, { className: "h-3 w-3" })}
                            {statutStyles[selectedCommande.statut]?.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <div>
                          <p className="text-sm text-muted-foreground">Statut paiement</p>
                          <Badge className={paiementStyles[selectedCommande.statutPaiement]?.className}>
                            {paiementStyles[selectedCommande.statutPaiement]?.label}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Customer Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Informations client
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Nom complet</p>
                        <p className="font-medium">{String(selectedCommande.client) || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{String(selectedCommande.email) || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Téléphone</p>
                        <p className="font-medium">{String(selectedCommande.telephone) || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ville</p>
                        <p className="font-medium">{String(selectedCommande.ville) || "-"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Adresse de livraison</p>
                      <p className="font-medium">{String(selectedCommande.adresse) || "-"}</p>
                      {selectedCommande.codePostal && (
                        <p className="text-sm text-muted-foreground">Code postal: {String(selectedCommande.codePostal)}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Articles commandés
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedCommande.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{item.article.designation}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.quantite} x {item.prixUnitaire.toLocaleString("fr-FR")} FCFA
                            </p>
                          </div>
                          <p className="font-semibold">{item.sousTotal.toLocaleString("fr-FR")} FCFA</p>
                        </div>
                      )) || (
                        <p className="text-muted-foreground text-center py-4">Aucun article disponible</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Order Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Résumé de la commande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Date de commande</span>
                        <span>{new Date(selectedCommande.dateCommande).toLocaleDateString("fr-FR")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Nombre d'articles</span>
                        <span>{selectedCommande.articles}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Méthode de paiement</span>
                        <span>{String(selectedCommande.modePaiement) || "-"}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Sous-total</span>
                        <span>{(selectedCommande.montantTotal - selectedCommande.fraisLivraison).toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frais de livraison</span>
                        <span>{selectedCommande.fraisLivraison.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total</span>
                        <span className="text-primary">{selectedCommande.montantTotal.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    </div>
                    
                    <div className="pt-4 space-y-2">
                      <Button
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/commandes/${selectedCommande.id}/facture`, '_blank')}
                        className="w-full gap-2"
                        variant="outline"
                      >
                        <FileText className="h-4 w-4" />
                        Télécharger la facture PDF
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
