"use client"

import { useMemo, useState } from "react"
import { AdminGuard } from "@/components/admin-guard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { useAdminCampagnes, useUpdateCampagneStatutAdmin } from "@/hooks/use-api"
import { useToast } from "@/hooks/use-toast"

type CampagneStatut = "EN_ATTENTE" | "ACTIVE" | "EXPIREE" | "SUSPENDUE" | "ANNULEE"

export default function AdminValidationCampagnesPage() {
  const [filtreStatut, setFiltreStatut] = useState<"ALL" | CampagneStatut>("EN_ATTENTE")
  const { toast } = useToast()
  const { data, isLoading, refetch } = useAdminCampagnes(filtreStatut === "ALL" ? undefined : filtreStatut)
  const updateStatut = useUpdateCampagneStatutAdmin()

  const campagnes = useMemo(() => {
    const payload = data?.data || data || []
    return Array.isArray(payload) ? payload : []
  }, [data])

  const applyStatut = async (campagneId: number, statut: CampagneStatut) => {
    try {
      await updateStatut.mutateAsync({ campagneId, statut })
      toast({ title: "Succès", description: `Campagne mise à jour: ${statut}` })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de mettre à jour la campagne",
        variant: "destructive",
      })
    }
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Validation Campagnes</h1>
            <p className="text-muted-foreground">Approuvez ou rejetez les campagnes publicitaires.</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filtreStatut} onValueChange={(v) => setFiltreStatut(v as "ALL" | CampagneStatut)}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous</SelectItem>
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
                <SelectItem value="ACTIVE">Actives</SelectItem>
                <SelectItem value="SUSPENDUE">Suspendues</SelectItem>
                <SelectItem value="ANNULEE">Annulées</SelectItem>
                <SelectItem value="EXPIREE">Expirées</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => refetch()}>
              Rafraîchir
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campagnes ({campagnes.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-8 flex items-center justify-center text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Chargement des campagnes...
              </div>
            ) : campagnes.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">Aucune campagne trouvée.</div>
            ) : (
              <div className="space-y-3">
                {campagnes.map((c: any) => {
                  const productName =
                    c?.produit?.nom ||
                    c?.produit?.article?.designation ||
                    c?.produitNom ||
                    "Produit"
                  const merchantName =
                    c?.merchant?.shopName ||
                    c?.merchant?.user?.name ||
                    "-"

                  return (
                    <div key={c.id} className="border rounded-lg p-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-1">
                        <div className="font-semibold">#{c.id} - {productName}</div>
                        <div className="text-sm text-muted-foreground">
                          Marchand: {merchantName} | Type: {c.typeCampagne || "-"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Montant: {Number(c.montantPaye || 0).toLocaleString("fr-FR")} XAF
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={c.statut === "ACTIVE" ? "default" : "secondary"}>{c.statut || "-"}</Badge>
                        <Button
                          size="sm"
                          onClick={() => applyStatut(c.id, "ACTIVE")}
                          disabled={updateStatut.isPending || c.statut === "ACTIVE"}
                        >
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => applyStatut(c.id, "ANNULEE")}
                          disabled={updateStatut.isPending || c.statut === "ANNULEE"}
                        >
                          Rejeter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => applyStatut(c.id, "SUSPENDUE")}
                          disabled={updateStatut.isPending || c.statut === "SUSPENDUE"}
                        >
                          Suspendre
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminGuard>
  )
}

