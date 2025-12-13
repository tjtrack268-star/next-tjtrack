"use client"

import { useState } from "react"
import { Users, Plus, Search, Mail, Phone, MapPin, MoreHorizontal, Edit, Trash2, Eye, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { useFournisseurs } from "@/hooks/use-api"
import { cn } from "@/lib/utils"
import type { Fournisseur } from "@/types/api"



export default function FournisseursPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const { data: apiFournisseurs, isLoading } = useFournisseurs()

  const fournisseurs = apiFournisseurs || []

  // Filter
  const filteredFournisseurs = fournisseurs.filter((f) => {
    if (
      searchQuery &&
      !f.nom.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !f.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }
    return true
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Fournisseurs
          </h1>
          <p className="text-muted-foreground">Gérez vos partenaires fournisseurs</p>
        </div>
        <Button className="gradient-primary text-white" onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un fournisseur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{fournisseurs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <Users className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Actifs</p>
                <p className="text-2xl font-bold">{fournisseurs.filter((f) => f.statut === "ACTIF").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactifs</p>
                <p className="text-2xl font-bold">{fournisseurs.filter((f) => f.statut === "INACTIF").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Commandes actives</p>
                <p className="text-2xl font-bold">0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un fournisseur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-secondary/50 border-0"
        />
      </div>

      {/* Suppliers Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFournisseurs.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">Aucun fournisseur trouvé</p>
              <Button 
                className="gradient-primary text-white" 
                onClick={() => setIsCreateDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter votre premier fournisseur
              </Button>
            </div>
          ) : (
            filteredFournisseurs.map((fournisseur, index) => (
            <Card
              key={fournisseur.id}
              className="glass-card hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 bg-gradient-to-br from-primary to-primary-hover">
                      <AvatarFallback className="bg-transparent text-white font-semibold">
                        {getInitials(fournisseur.nom)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{fournisseur.nom}</h3>
                      <p className="text-sm text-muted-foreground">{fournisseur.contact}</p>
                    </div>
                  </div>
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
                      <DropdownMenuItem>
                        <Package className="h-4 w-4 mr-2" />
                        Commandes
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground truncate">{fournisseur.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{fournisseur.telephone}</span>
                  </div>
                  {fournisseur.adresse && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {fournisseur.adresse.ville}, {fournisseur.adresse.pays}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Badge
                    variant="outline"
                    className={cn(
                      fournisseur.statut === "ACTIF"
                        ? "border-success/50 text-success"
                        : "border-muted-foreground/50 text-muted-foreground",
                    )}
                  >
                    {fournisseur.statut === "ACTIF" ? "Actif" : "Inactif"}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Commander
                  </Button>
                </div>
              </CardContent>
            </Card>
            ))
          )}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="glass-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Ajouter un fournisseur</DialogTitle>
            <DialogDescription>Enregistrez un nouveau partenaire fournisseur</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de l'entreprise</Label>
              <Input placeholder="Ex: TechSupply Pro" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" placeholder="contact@exemple.com" />
              </div>
              <div className="space-y-2">
                <Label>Téléphone</Label>
                <Input placeholder="+225 XX XX XX XX" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Personne de contact</Label>
              <Input placeholder="Nom du contact" />
            </div>
            <div className="space-y-2">
              <Label>Adresse</Label>
              <Input placeholder="Adresse complète" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input placeholder="Abidjan" />
              </div>
              <div className="space-y-2">
                <Label>Pays</Label>
                <Input placeholder="Côte d'Ivoire" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annuler
            </Button>
            <Button className="gradient-primary text-white">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
