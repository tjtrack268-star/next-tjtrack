"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Ticket, Clock, AlertCircle, CheckCircle, MoreVertical, MessageSquare, User, Store, Truck } from "lucide-react"

export function SupportTickets() {
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const tickets = [
    {
      id: "TK-001",
      title: "Problème de paiement",
      user: "Boutique ABC",
      userType: "COMMERCANT",
      priority: "high",
      status: "open",
      category: "Payment",
      created: "2024-01-15",
      lastUpdate: "Il y a 30 min"
    },
    {
      id: "TK-002", 
      title: "Produit non livré",
      user: "Jean Dupont",
      userType: "CLIENT",
      priority: "medium",
      status: "in_progress",
      category: "Delivery",
      created: "2024-01-14",
      lastUpdate: "Il y a 2h"
    },
    {
      id: "TK-003",
      title: "Demande d'intégration API",
      user: "Tech Solutions",
      userType: "FOURNISSEUR",
      priority: "low",
      status: "resolved",
      category: "Technical",
      created: "2024-01-13",
      lastUpdate: "Il y a 1 jour"
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'destructive'
      case 'in_progress': return 'default'
      case 'resolved': return 'secondary'
      default: return 'outline'
    }
  }

  const getUserIcon = (userType: string) => {
    switch (userType) {
      case 'COMMERCANT': return <Store className="h-4 w-4" />
      case 'FOURNISSEUR': return <Truck className="h-4 w-4" />
      case 'CLIENT': return <User className="h-4 w-4" />
      default: return <User className="h-4 w-4" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return 'Ouvert'
      case 'in_progress': return 'En cours'
      case 'resolved': return 'Résolu'
      default: return status
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5" />
          Tickets de Support
        </CardTitle>
        <div className="flex gap-2">
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Priorité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              <SelectItem value="high">Haute</SelectItem>
              <SelectItem value="medium">Moyenne</SelectItem>
              <SelectItem value="low">Basse</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="open">Ouvert</SelectItem>
              <SelectItem value="in_progress">En cours</SelectItem>
              <SelectItem value="resolved">Résolu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Priorité</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière MAJ</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{ticket.id}</p>
                    <p className="text-sm text-muted-foreground">{ticket.title}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getUserIcon(ticket.userType)}
                    <div>
                      <p className="font-medium">{ticket.user}</p>
                      <p className="text-xs text-muted-foreground">{ticket.userType}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{ticket.category}</TableCell>
                <TableCell>
                  <Badge variant={getPriorityColor(ticket.priority) as any}>
                    {ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusColor(ticket.status) as any}>
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {ticket.lastUpdate}
                  </div>
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
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Répondre
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Escalader
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marquer résolu
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