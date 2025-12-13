"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Percent, Calendar, MoreVertical, Edit, Trash2, Plus, Eye } from "lucide-react"

export function PromotionManager() {
  const promotions = [
    { id: 1, name: "Soldes d'Hiver", type: "percentage", value: 20, code: "WINTER20", status: "active", uses: 45, limit: 100, expires: "2024-02-28" },
    { id: 2, name: "Livraison Gratuite", type: "shipping", value: 0, code: "FREESHIP", status: "active", uses: 123, limit: 500, expires: "2024-03-15" },
    { id: 3, name: "Première Commande", type: "fixed", value: 10, code: "FIRST10", status: "inactive", uses: 67, limit: 200, expires: "2024-04-01" },
  ]

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'default' : 'secondary'
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'percentage': return 'Pourcentage'
      case 'fixed': return 'Montant fixe'
      case 'shipping': return 'Livraison'
      default: return type
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Gestion des Promotions
        </CardTitle>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle promo
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Utilisations</TableHead>
              <TableHead>Expire</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((promo) => (
              <TableRow key={promo.id}>
                <TableCell className="font-medium">{promo.name}</TableCell>
                <TableCell>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{promo.code}</code>
                </TableCell>
                <TableCell>{getTypeLabel(promo.type)}</TableCell>
                <TableCell>
                  {promo.type === 'percentage' ? `${promo.value}%` : 
                   promo.type === 'fixed' ? `€${promo.value}` : 'Gratuit'}
                </TableCell>
                <TableCell>{promo.uses}/{promo.limit}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(promo.expires).toLocaleDateString('fr-FR')}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(promo.status) as any}>
                    {promo.status === 'active' ? 'Actif' : 'Inactif'}
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
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
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
  )
}