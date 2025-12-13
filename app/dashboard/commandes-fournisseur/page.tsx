"use client"

import { useState } from "react"
import { Truck, Plus, Search, Eye, Check, X, Clock, Package, MoreHorizontal, Calendar, FileText } from "lucide-react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useCommandesFournisseur, useFournisseursActifs } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { CommandeFournisseur, Fournisseur } from "@/types/api"



export default function CommandesFournisseurPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedFournisseur, setSelectedFournisseur] = useState("")

  const { data: apiCommandes, isLoading: isLoadingCommandes } = useCommandesFournisseur()
  const { data: apiFournisseurs, isLoading: isLoadingFournisseurs } = useFournisseursActifs()

  const commandes = apiCommandes || []
  const fournisseurs = apiFournisseurs || []

  const isLoading = isLoadingCommandes

  // Filter commandes
  const filteredCommandes = commandes.filter((cmd) => {
    if (
      searchQuery &&
      !cmd.code.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !cmd.fournisseur.nom.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    if (filterStatus !== "all" && cmd.statut !== filterStatus) {
      return false
    }
    return true
  })

  // Stats
  const stats = {
    total: commandes.length,
    enAttente: commandes.filter((c) => c.statut === "EN_ATTENTE").length,
    confirmees: commandes.filter((c) => c.statut === "CONFIRMEE").length,
    expediees: commandes.filter((c) => c.statut === "EXPEDIEE").length,
    recues: commandes.filter((c) => c.statut === "RECUE").length,
    totalMontant: commandes.reduce((sum, c) => sum + c.totalTtc, 0),
  }

  const getStatusConfig = (statut: CommandeFournisseur["statut"]) => {
    switch (statut) {
      case "EN_ATTENTE":
        return { label: "En attente", color: "warning", icon: Clock }
      case "CONFIRMEE":
        return { label: "Confirmée", color: "primary", icon: Check }
      case "EXPEDIEE":
        return { label: "Expédiée", color: "success", icon: Truck }
      case "RECUE":
        return { label: "Reçue", color: "success", icon: Package }
      case "ANNULEE":
        return { label: "Annulée", color: "destructive", icon: X }
      default:
        return { label: statut, color: "secondary", icon: Clock }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Commandes Fournisseurs
          </h1>
          <p className="text-muted-foreground">Gérez vos commandes d'approvisionnement</p>
        </div>
        <Button className="gradient-primary text-white" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle commande
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{stats.enAttente}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confirmées</p>
                <p className="text-2xl font-bold">{stats.confirmees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Truck className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En transit</p>
                <p className="text-2xl font-bold">{stats.expediees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div>
              <p className="text-sm text-muted-foreground">Montant total</p>
              <p className="text-xl font-bold text-primary">{(stats.totalMontant / 1000000).toFixed(1)}M FCFA</p>
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
                placeholder="Rechercher par code ou fournisseur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-secondary/50 border-0"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px] bg-secondary/50 border-0">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="CONFIRMEE">Confirmée</SelectItem>
                <SelectItem value="EXPEDIEE">Expédiée</SelectItem>
                <SelectItem value="RECUE">Reçue</SelectItem>
                <SelectItem value="ANNULEE">Annulée</SelectItem>
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
                  <TableHead>Référence</TableHead>
                  <TableHead>Fournisseur</TableHead>
                  <TableHead>Date commande</TableHead>
                  <TableHead>Livraison prévue</TableHead>
                  <TableHead className="text-right">Montant TTC</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommandes.map((commande, index) => {
                  const statusConfig = getStatusConfig(commande.statut)
                  const StatusIcon = statusConfig.icon

                  return (
                    <TableRow
                      key={commande.id}
                      className="hover:bg-secondary/30 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TableCell>
                        <span className="font-mono font-medium">{commande.code}</span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{commande.fournisseur.nom}</p>
                          <p className="text-xs text-muted-foreground">{commande.fournisseur.email}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(commande.dateCommande)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {commande.dateLivraisonPrevue ? formatDate(commande.dateLivraisonPrevue) : "-"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {commande.totalTtc.toLocaleString()} FCFA
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "flex items-center gap-1 w-fit",
                            statusConfig.color === "warning" && "border-warning/50 text-warning",
                            statusConfig.color === "primary" && "border-primary/50 text-primary",
                            statusConfig.color === "success" && "border-success/50 text-success",
                            statusConfig.color === "destructive" && "border-destructive/50 text-destructive",
                          )}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Voir détails
                            </DropdownMenuItem>
                            {commande.statut === "EN_ATTENTE" && (
                              <DropdownMenuItem>
                                <Check className="h-4 w-4 mr-2" />
                                Confirmer
                              </DropdownMenuItem>
                            )}
                            {commande.statut === "CONFIRMEE" && (
                              <DropdownMenuItem>
                                <Truck className="h-4 w-4 mr-2" />
                                Marquer expédiée
                              </DropdownMenuItem>
                            )}
                            {commande.statut === "EXPEDIEE" && (
                              <DropdownMenuItem>
                                <Package className="h-4 w-4 mr-2" />
                                Marquer reçue
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <X className="h-4 w-4 mr-2" />
                              Annuler
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
          {!isLoading && filteredCommandes.length === 0 && (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Aucune commande fournisseur trouvée</p>
              <Button 
                className="mt-4 gradient-primary text-white" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer votre première commande
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Nouvelle commande fournisseur</DialogTitle>
            <DialogDescription>Créez une commande d'approvisionnement auprès d'un fournisseur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fournisseur</Label>
              <Select value={selectedFournisseur} onValueChange={setSelectedFournisseur}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un fournisseur" />
                </SelectTrigger>
                <SelectContent>
                  {fournisseurs.map((f) => (
                    <SelectItem key={f.id} value={String(f.id)}>
                      {f.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date de livraison souhaitée</Label>
              <Input type="date" />
            </div>
            <div className="p-4 rounded-lg bg-secondary/30 text-sm text-muted-foreground">
              <p>Après création, vous pourrez ajouter les articles à commander.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="gradient-primary text-white" disabled={!selectedFournisseur}>
              Créer la commande
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
