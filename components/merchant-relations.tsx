"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Store, MoreVertical, Eye, MessageSquare, DollarSign, Package, TrendingUp, AlertTriangle } from "lucide-react"

export function MerchantRelations() {
  const merchants = [
    { 
      id: 1, 
      name: "Boutique Mode", 
      status: "active", 
      products: 45, 
      revenue: 12500, 
      commission: 8.5,
      lastActivity: "Il y a 2h",
      issues: 0,
      rating: 4.8
    },
    { 
      id: 2, 
      name: "Tech Store", 
      status: "pending", 
      products: 23, 
      revenue: 8900, 
      commission: 10,
      lastActivity: "Il y a 1 jour",
      issues: 2,
      rating: 4.2
    },
    { 
      id: 3, 
      name: "Sports Plus", 
      status: "suspended", 
      products: 67, 
      revenue: 15600, 
      commission: 7.5,
      lastActivity: "Il y a 5 jours",
      issues: 5,
      rating: 3.9
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default'
      case 'pending': return 'secondary'
      case 'suspended': return 'destructive'
      default: return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif'
      case 'pending': return 'En attente'
      case 'suspended': return 'Suspendu'
      default: return status
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Relations Commerçants
        </CardTitle>
        <Button variant="outline" size="sm">
          Rapport Mensuel
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Commerçant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Produits</TableHead>
              <TableHead>CA Mensuel</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Note</TableHead>
              <TableHead>Problèmes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {merchants.map((merchant) => (
              <TableRow key={merchant.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{merchant.name}</p>
                    <p className="text-sm text-muted-foreground">{merchant.lastActivity}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(merchant.status) as any}>
                    {getStatusLabel(merchant.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Package className="h-3 w-3" />
                    {merchant.products}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    €{merchant.revenue.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>{merchant.commission}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    {merchant.rating}/5
                  </div>
                </TableCell>
                <TableCell>
                  {merchant.issues > 0 ? (
                    <Badge variant="destructive" className="gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      {merchant.issues}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Aucun</Badge>
                  )}
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
                        Voir profil
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Contacter
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <DollarSign className="h-4 w-4 mr-2" />
                        Ajuster commission
                      </DropdownMenuItem>
                      {merchant.status === 'active' ? (
                        <DropdownMenuItem className="text-destructive">
                          Suspendre
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem className="text-green-600">
                          Activer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}