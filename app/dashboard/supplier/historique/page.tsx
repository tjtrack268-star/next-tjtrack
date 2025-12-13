"use client"

import { useState } from "react"
import { Search, Calendar, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useMouvementsStock } from "@/hooks/use-api"

interface Mouvement {
  id: number
  dateMouvement: string
  articleDesignation: string
  typeMouvement: string
  quantite: number
  motif: string
  createdBy: string
}

const typeStyles = {
  ENTREE: { label: "Entrée", icon: ArrowUpRight, className: "bg-emerald-500/10 text-emerald-500" },
  SORTIE: { label: "Sortie", icon: ArrowDownRight, className: "bg-red-500/10 text-red-500" },
  CORRECTION_POSITIVE: { label: "Correction +", icon: TrendingUp, className: "bg-blue-500/10 text-blue-500" },
  CORRECTION_NEGATIVE: { label: "Correction -", icon: TrendingDown, className: "bg-amber-500/10 text-amber-500" },
}

export default function SupplierHistoriquePage() {
  const { user } = useAuth()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  const { data: mouvementsData = [], isLoading, error, refetch } = useMouvementsStock()

  const mouvements: Mouvement[] = (mouvementsData as unknown[]).map((m: unknown) => {
    const mvt = m as Record<string, unknown>
    return {
      id: (mvt.id as number) || 0,
      dateMouvement: (mvt.dateMouvement as string) || new Date().toISOString(),
      articleDesignation: (mvt.articleDesignation as string) || "Article",
      typeMouvement: (mvt.typeMouvement as string) || "ENTREE",
      quantite: (mvt.quantite as number) || 0,
      motif: (mvt.motif as string) || "",
      createdBy: (mvt.createdBy as string) || "",
    }
  })

  const filteredMouvements = mouvements.filter((mvt) => {
    const matchSearch = mvt.articleDesignation.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === "all" || mvt.typeMouvement === typeFilter
    return matchSearch && matchType
  })

  const stats = {
    entrees: mouvements.filter((m) => m.typeMouvement === "ENTREE").reduce((acc, m) => acc + m.quantite, 0),
    sorties: mouvements.filter((m) => m.typeMouvement === "SORTIE").reduce((acc, m) => acc + m.quantite, 0),
    total: mouvements.length,
  }

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
        <p className="text-destructive">Erreur lors du chargement de l'historique</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Historique des Mouvements</h1>
          <p className="text-muted-foreground">Consultez l'historique de vos mouvements de stock</p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Période
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" />
              Total Entrées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">+{stats.entrees}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <ArrowDownRight className="h-4 w-4 text-red-500" />
              Total Sorties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">-{stats.sorties}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mouvements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Type de mouvement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="ENTREE">Entrées</SelectItem>
            <SelectItem value="SORTIE">Sorties</SelectItem>
            <SelectItem value="CORRECTION_POSITIVE">Corrections +</SelectItem>
            <SelectItem value="CORRECTION_NEGATIVE">Corrections -</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Article</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-center">Quantité</TableHead>
                <TableHead>Motif</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMouvements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    Aucun mouvement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredMouvements.map((mvt) => {
                  const type = typeStyles[mvt.typeMouvement as keyof typeof typeStyles] || typeStyles.ENTREE
                  const TypeIcon = type.icon

                  return (
                    <TableRow key={mvt.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(mvt.dateMouvement).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </TableCell>
                      <TableCell className="font-medium">{mvt.articleDesignation}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${type.className}`}
                        >
                          <TypeIcon className="h-3 w-3" />
                          {type.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-center font-medium">
                        <span
                          className={
                            mvt.typeMouvement.includes("SORTIE") || mvt.typeMouvement === "CORRECTION_NEGATIVE"
                              ? "text-red-500"
                              : "text-emerald-500"
                          }
                        >
                          {mvt.typeMouvement.includes("SORTIE") || mvt.typeMouvement === "CORRECTION_NEGATIVE"
                            ? "-"
                            : "+"}
                          {mvt.quantite}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {mvt.motif || "N/A"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
