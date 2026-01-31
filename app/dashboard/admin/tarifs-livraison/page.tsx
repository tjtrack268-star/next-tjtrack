"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Truck, Plus, Edit, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { AdminGuard } from "@/components/admin-guard"
import { apiClient } from "@/lib/api"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface TarifLivraison {
  id?: number
  ville: string | null
  typeLivraison: "STANDARD" | "EXPRESS"
  zoneLivraison: "URBAINE" | "INTERURBAINE"
  distanceMinKm?: number
  distanceMaxKm?: number
  tarif: number
  delaiJoursOuvres: number
  seuilGratuite?: number
  actif: boolean
}

export default function TarifsLivraisonPage() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTarif, setEditingTarif] = useState<TarifLivraison | null>(null)
  
  const [formData, setFormData] = useState<TarifLivraison>({
    ville: "Douala",
    typeLivraison: "STANDARD",
    zoneLivraison: "URBAINE",
    tarif: 1500,
    delaiJoursOuvres: 1,
    seuilGratuite: 30000,
    actif: true
  })

  const { data: tarifs = [] } = useQuery({
    queryKey: ["tarifsLivraison"],
    queryFn: () => apiClient.get<TarifLivraison[]>("/delivery/tarifs")
  })

  const createMutation = useMutation({
    mutationFn: (data: TarifLivraison) => apiClient.post("/delivery/tarifs", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifsLivraison"] })
      toast({ title: "Tarif créé", description: "Le tarif a été ajouté avec succès" })
      setDialogOpen(false)
      resetForm()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: TarifLivraison) => apiClient.put(`/delivery/tarifs/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifsLivraison"] })
      toast({ title: "Tarif modifié", description: "Le tarif a été mis à jour" })
      setDialogOpen(false)
      resetForm()
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiClient.delete(`/delivery/tarifs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tarifsLivraison"] })
      toast({ title: "Tarif supprimé", description: "Le tarif a été supprimé" })
    }
  })

  const resetForm = () => {
    setFormData({
      ville: "Douala",
      typeLivraison: "STANDARD",
      zoneLivraison: "URBAINE",
      tarif: 1500,
      delaiJoursOuvres: 1,
      seuilGratuite: 30000,
      actif: true
    })
    setEditingTarif(null)
  }

  const handleSubmit = () => {
    if (editingTarif) {
      updateMutation.mutate({ ...formData, id: editingTarif.id })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleEdit = (tarif: TarifLivraison) => {
    setEditingTarif(tarif)
    setFormData(tarif)
    setDialogOpen(true)
  }

  const VILLES = ["Douala", "Yaoundé", "Garoua", "Bamenda", "Limbe", "Bafoussam", "Buea", "Kumba", "Foumban", "Ebolowa"]

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tarifs de Livraison</h1>
            <p className="text-muted-foreground">Gérez les tarifs standard et express par ville</p>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gradient-primary text-white">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau tarif
          </Button>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Tarifs configurés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone</TableHead>
                  <TableHead>Ville/Distance</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Tarif</TableHead>
                  <TableHead>Délai</TableHead>
                  <TableHead>Seuil gratuit</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tarifs.map((tarif) => (
                  <TableRow key={tarif.id}>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${tarif.zoneLivraison === 'URBAINE' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                        {tarif.zoneLivraison}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {tarif.zoneLivraison === 'URBAINE' 
                        ? tarif.ville 
                        : `${tarif.distanceMinKm}-${tarif.distanceMaxKm} km`}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${tarif.typeLivraison === 'EXPRESS' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                        {tarif.typeLivraison}
                      </span>
                    </TableCell>
                    <TableCell>{tarif.tarif.toLocaleString()} FCFA</TableCell>
                    <TableCell>{tarif.delaiJoursOuvres} jour{tarif.delaiJoursOuvres > 1 ? 's' : ''}</TableCell>
                    <TableCell>{tarif.seuilGratuite ? `${tarif.seuilGratuite.toLocaleString()} FCFA` : '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs ${tarif.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {tarif.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(tarif)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(tarif.id!)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTarif ? "Modifier" : "Nouveau"} tarif de livraison</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Zone de livraison</Label>
                <Select value={formData.zoneLivraison} onValueChange={(v: any) => setFormData({...formData, zoneLivraison: v, ville: v === 'URBAINE' ? 'Douala' : null})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URBAINE">Urbaine (dans la ville)</SelectItem>
                    <SelectItem value="INTERURBAINE">Interurbaine (entre villes)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.zoneLivraison === 'URBAINE' ? (
                <div>
                  <Label>Ville</Label>
                  <Select value={formData.ville || ''} onValueChange={(v) => setFormData({...formData, ville: v})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VILLES.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Distance min (km)</Label>
                    <Input type="number" value={formData.distanceMinKm || ''} onChange={(e) => setFormData({...formData, distanceMinKm: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Distance max (km)</Label>
                    <Input type="number" value={formData.distanceMaxKm || ''} onChange={(e) => setFormData({...formData, distanceMaxKm: Number(e.target.value)})} />
                  </div>
                </div>
              )}
              <div>
                <Label>Type de livraison</Label>
                <Select value={formData.typeLivraison} onValueChange={(v: any) => setFormData({...formData, typeLivraison: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STANDARD">Standard</SelectItem>
                    <SelectItem value="EXPRESS">Express</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Tarif (FCFA)</Label>
                <Input type="number" value={formData.tarif} onChange={(e) => setFormData({...formData, tarif: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Délai (jours ouvrés)</Label>
                <Input type="number" value={formData.delaiJoursOuvres} onChange={(e) => setFormData({...formData, delaiJoursOuvres: Number(e.target.value)})} />
              </div>
              <div>
                <Label>Seuil livraison gratuite (FCFA)</Label>
                <Input type="number" value={formData.seuilGratuite || ''} onChange={(e) => setFormData({...formData, seuilGratuite: e.target.value ? Number(e.target.value) : undefined})} placeholder="Optionnel" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {editingTarif ? "Modifier" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminGuard>
  )
}
