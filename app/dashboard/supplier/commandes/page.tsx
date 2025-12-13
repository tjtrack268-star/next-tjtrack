"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ShoppingBag, Clock, CheckCircle, Truck, Package, Eye, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { useSupplierCommandesMerchants } from "@/hooks/use-api"

interface OrderLine {
  article: string
  quantite: number
  prixUnitaire: number
}

interface Order {
  id: number
  code: string
  merchant: string
  dateCommande: string
  statut: string
  totalHt: number
  lignes: OrderLine[]
}

const statusConfig = {
  EN_ATTENTE: { label: "En attente", variant: "outline" as const, icon: Clock },
  CONFIRMEE: { label: "Confirmée", variant: "default" as const, icon: CheckCircle },
  EXPEDIEE: { label: "Expédiée", variant: "secondary" as const, icon: Truck },
  RECUE: { label: "Reçue", variant: "secondary" as const, icon: Package },
}

export default function SupplierOrdersPage() {
  const { user } = useAuth()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()

  const { data: ordersResponse, isLoading, error, refetch } = useSupplierCommandesMerchants(user?.userId || "")

  // Map API response to expected format
  const orders: Order[] = ((ordersResponse as { data?: unknown[] })?.data || ordersResponse || []).map((o: unknown) => {
    const order = o as Record<string, unknown>
    return {
      id: (order.id as number) || 0,
      code: (order.code as string) || `CF-${order.id}`,
      merchant: (order.merchantNom as string) || (order.merchant as string) || "Commerçant",
      dateCommande: (order.dateCommande as string) || new Date().toISOString(),
      statut: (order.statut as string) || "EN_ATTENTE",
      totalHt: (order.totalHt as number) || (order.montantTotal as number) || 0,
      lignes: (order.lignes as OrderLine[]) || [],
    }
  })

  const formatPrice = (price: number) => new Intl.NumberFormat("fr-FR").format(price) + " XAF"

  const handleConfirm = (orderId: number) => {
    // TODO: Implement API call to confirm order
    toast({
      title: "Commande confirmée",
      description: "La commande a été confirmée avec succès",
    })
    refetch()
  }

  const handleShip = (orderId: number) => {
    // TODO: Implement API call to ship order
    toast({
      title: "Commande expédiée",
      description: "La commande a été marquée comme expédiée",
    })
    refetch()
  }

  const pendingCount = orders.filter((o) => o.statut === "EN_ATTENTE").length
  const confirmedCount = orders.filter((o) => o.statut === "CONFIRMEE").length

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
      <div>
        <h1 className="text-3xl font-bold">Commandes Reçues</h1>
        <p className="text-muted-foreground">Gérez les commandes des commerçants</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Commandes</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">En attente</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">À expédier</p>
                <p className="text-2xl font-bold">{confirmedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Truck className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expédiées</p>
                <p className="text-2xl font-bold">{orders.filter((o) => o.statut === "EXPEDIEE").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Liste des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Commande</TableHead>
                <TableHead>Commerçant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Montant HT</TableHead>
                <TableHead className="text-center">Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucune commande reçue
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const status = statusConfig[order.statut as keyof typeof statusConfig] || statusConfig.EN_ATTENTE
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono">{order.code}</TableCell>
                      <TableCell className="font-medium">{order.merchant}</TableCell>
                      <TableCell>{new Date(order.dateCommande).toLocaleDateString("fr-FR")}</TableCell>
                      <TableCell className="text-right">{formatPrice(order.totalHt)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={status.variant}>
                          <status.icon className="h-3 w-3 mr-1" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Détails
                          </Button>
                          {order.statut === "EN_ATTENTE" && (
                            <Button size="sm" onClick={() => handleConfirm(order.id)}>
                              Confirmer
                            </Button>
                          )}
                          {order.statut === "CONFIRMEE" && (
                            <Button
                              size="sm"
                              className="gradient-primary text-white"
                              onClick={() => handleShip(order.id)}
                            >
                              <Truck className="h-4 w-4 mr-1" />
                              Expédier
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Commande {selectedOrder?.code}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Commerçant</p>
                  <p className="font-medium">{selectedOrder.merchant}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-medium">{new Date(selectedOrder.dateCommande).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Articles commandés</p>
                <div className="space-y-2">
                  {selectedOrder.lignes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Aucun détail disponible</p>
                  ) : (
                    selectedOrder.lignes.map((ligne, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                        <div>
                          <p className="font-medium">{ligne.article}</p>
                          <p className="text-xs text-muted-foreground">
                            {ligne.quantite} x {formatPrice(ligne.prixUnitaire)}
                          </p>
                        </div>
                        <p className="font-medium">{formatPrice(ligne.quantite * ligne.prixUnitaire)}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="font-medium">Total HT</span>
                <span className="text-xl font-bold text-primary">{formatPrice(selectedOrder.totalHt)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
