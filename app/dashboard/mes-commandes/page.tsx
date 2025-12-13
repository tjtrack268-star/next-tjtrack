"use client"

import { useState } from "react"
import {
  Search,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { useCommandesClient } from "@/hooks/use-api"

interface Commande {
  id: number
  numeroCommande: string
  dateCommande: string
  statut: "EN_ATTENTE" | "CONFIRMEE" | "EN_PREPARATION" | "EXPEDIEE" | "LIVREE" | "ANNULEE"
  montantTotal: number
  articles: number
}

const statutStyles = {
  EN_ATTENTE: { label: "En attente", variant: "secondary" as const, icon: Clock, color: "text-amber-500" },
  CONFIRMEE: { label: "Confirmée", variant: "default" as const, icon: CheckCircle, color: "text-blue-500" },
  EN_PREPARATION: { label: "En préparation", variant: "default" as const, icon: Package, color: "text-purple-500" },
  EXPEDIEE: { label: "Expédiée", variant: "default" as const, icon: Truck, color: "text-primary" },
  LIVREE: { label: "Livrée", variant: "default" as const, icon: CheckCircle, color: "text-emerald-500" },
  ANNULEE: { label: "Annulée", variant: "destructive" as const, icon: XCircle, color: "text-red-500" },
}

export default function MesCommandesPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [statutFilter, setStatutFilter] = useState("all")
  const [selectedCommande, setSelectedCommande] = useState<Commande | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch user's orders from API
  const { data: commandesData = [], isLoading, error, refetch } = useCommandesClient()

  // Map and filter for current user
  const commandes: Commande[] = (commandesData as unknown[]).map((cmd: unknown) => {
    const c = cmd as Record<string, unknown>
    return {
      id: (c.id as number) || 0,
      numeroCommande: (c.code as string) || (c.numeroCommande as string) || `CMD-${c.id}`,
      dateCommande: (c.dateCommande as string) || new Date().toISOString(),
      statut: ((c.statut as string) || "EN_ATTENTE") as Commande["statut"],
      montantTotal: (c.montantTotal as number) || (c.totalTtc as number) || 0,
      articles: (c.nombreArticles as number) || (c.articles as number) || 0,
    }
  })

  const filteredCommandes = commandes.filter((cmd) => {
    const matchSearch = cmd.numeroCommande.toLowerCase().includes(search.toLowerCase())
    const matchStatut = statutFilter === "all" || cmd.statut === statutFilter
    return matchSearch && matchStatut
  })

  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage)
  const paginatedCommandes = filteredCommandes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
        <p className="text-destructive">Erreur lors du chargement de vos commandes</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes Commandes</h1>
          <p className="text-muted-foreground">Suivez l'état de vos commandes</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{commandes.length}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4 text-primary" />
              En cours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {commandes.filter((c) => ["CONFIRMEE", "EN_PREPARATION", "EXPEDIEE"].includes(c.statut)).length}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Livrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {commandes.filter((c) => c.statut === "LIVREE").length}
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">
              {commandes.filter((c) => c.statut === "EN_ATTENTE").length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par numéro de commande..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statutFilter} onValueChange={setStatutFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filtrer par statut" />
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
                <TableHead>N° Commande</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Articles</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Montant</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCommandes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune commande trouvée
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCommandes.map((commande) => {
                  const statut = statutStyles[commande.statut] || statutStyles.EN_ATTENTE
                  const StatutIcon = statut.icon

                  return (
                    <TableRow key={commande.id}>
                      <TableCell className="font-mono font-medium">{commande.numeroCommande}</TableCell>
                      <TableCell>
                        {new Date(commande.dateCommande).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{commande.articles} article(s)</TableCell>
                      <TableCell>
                        <Badge variant={statut.variant} className="gap-1">
                          <StatutIcon className="h-3 w-3" />
                          {statut.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {commande.montantTotal.toLocaleString("fr-FR")} XAF
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedCommande(commande)}>
                          <Eye className="h-4 w-4" />
                        </Button>
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

      {/* Detail Dialog */}
      <Dialog open={!!selectedCommande} onOpenChange={() => setSelectedCommande(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
            <DialogDescription>{selectedCommande?.numeroCommande}</DialogDescription>
          </DialogHeader>
          {selectedCommande && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Date de commande</p>
                  <p className="font-medium">
                    {new Date(selectedCommande.dateCommande).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Statut</p>
                  <Badge variant={statutStyles[selectedCommande.statut].variant} className="mt-1">
                    {statutStyles[selectedCommande.statut].label}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Nombre d'articles</p>
                  <p className="font-medium">{selectedCommande.articles}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-primary">
                    {selectedCommande.montantTotal.toLocaleString("fr-FR")} XAF
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
