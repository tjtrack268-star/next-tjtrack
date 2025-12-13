"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ShoppingCart, Clock, CheckCircle, Truck, Package, MoreVertical, Eye, Edit } from "lucide-react"
import { AdminGuard } from "@/components/admin-guard"

export default function AdminOrdersPage() {
  const orders = [
    { id: "CMD-001", customer: "Jean Dupont", total: 89.99, status: "pending", date: "2024-01-15", items: 3 },
    { id: "CMD-002", customer: "Marie Martin", total: 156.50, status: "processing", date: "2024-01-15", items: 2 },
    { id: "CMD-003", customer: "Pierre Durand", total: 45.00, status: "shipped", date: "2024-01-14", items: 1 },
    { id: "CMD-004", customer: "Sophie Bernard", total: 234.99, status: "delivered", date: "2024-01-14", items: 4 },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'secondary'
      case 'processing': return 'default'
      case 'shipped': return 'outline'
      case 'delivered': return 'default'
      default: return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'processing': return 'En cours'
      case 'shipped': return 'Expédiée'
      case 'delivered': return 'Livrée'
      default: return status
    }
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Commandes</h1>
          <p className="text-muted-foreground">Suivez et gérez toutes les commandes</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En attente</p>
                  <p className="text-2xl font-bold">23</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Package className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">En cours</p>
                  <p className="text-2xl font-bold">45</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Expédiées</p>
                  <p className="text-2xl font-bold">67</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Livrées</p>
                  <p className="text-2xl font-bold">234</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card>
          <CardHeader>
            <CardTitle>Commandes Récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Articles</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.items} articles</TableCell>
                    <TableCell>€{order.total}</TableCell>
                    <TableCell>{new Date(order.date).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(order.status) as any}>
                        {getStatusLabel(order.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            Voir détails
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Modifier statut
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Truck className="h-4 w-4 mr-2" />
                            Marquer expédiée
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}