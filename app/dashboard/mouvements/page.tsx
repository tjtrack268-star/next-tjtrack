"use client"

import { useState } from "react"
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMouvementsStock } from "@/hooks/use-api"
import { MovementAnalytics } from "@/components/stock/movement-analytics"

const typeStyles = {
  ENTREE: { label: "Entrée", icon: ArrowUpRight, className: "bg-emerald-500/10 text-emerald-500" },
  SORTIE: { label: "Sortie", icon: ArrowDownRight, className: "bg-red-500/10 text-red-500" },
  CORRECTION_POSITIVE: { label: "Correction +", icon: TrendingUp, className: "bg-blue-500/10 text-blue-500" },
  CORRECTION_NEGATIVE: { label: "Correction -", icon: TrendingDown, className: "bg-amber-500/10 text-amber-500" },
}

export default function MouvementsPage() {
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const { data: mouvements = [], isLoading, error, refetch } = useMouvementsStock()

  const filteredMouvements = (mouvements as Record<string, unknown>[]).filter((mvt) => {
    const designation = ((mvt.articleDesignation as string) || "").toLowerCase()
    const type = (mvt.typeMouvement as string) || ""
    const matchSearch = designation.includes(search.toLowerCase())
    const matchType = typeFilter === "all" || type === typeFilter
    return matchSearch && matchType
  })

  const totalPages = Math.ceil(filteredMouvements.length / itemsPerPage)
  const paginatedMouvements = filteredMouvements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleFilterChange = (value: string) => {
    setTypeFilter(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  // Stats
  const stats = {
    entrees: (mouvements as Record<string, unknown>[])
      .filter((m) => m.typeMouvement === "ENTREE")
      .reduce((acc, m) => acc + ((m.quantite as number) || 0), 0),
    sorties: (mouvements as Record<string, unknown>[])
      .filter((m) => m.typeMouvement === "SORTIE")
      .reduce((acc, m) => acc + ((m.quantite as number) || 0), 0),
    corrections: (mouvements as Record<string, unknown>[]).filter((m) =>
      ((m.typeMouvement as string) || "").startsWith("CORRECTION"),
    ).length,
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
        <p className="text-destructive">Erreur lors du chargement des mouvements</p>
        <Button onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mouvements de Stock</h1>
          <p className="text-muted-foreground">Historique des entrées, sorties et corrections</p>
        </div>
        <Button variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Période
        </Button>
      </div>

      {/* Analytics intégrés */}
      <MovementAnalytics mouvements={mouvements as any[]} />

      {/* Stats Cards */}
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
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <RefreshCw className="h-4 w-4 text-blue-500" />
              Corrections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.corrections}</div>
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
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={handleFilterChange}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Type" />
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
                <TableHead>Par</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedMouvements.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Aucun mouvement trouvé
                  </TableCell>
                </TableRow>
              ) : (
                paginatedMouvements.map((mvt) => {
                  const typeMouvement = (mvt.typeMouvement as string) || "ENTREE"
                  const type = typeStyles[typeMouvement as keyof typeof typeStyles] || typeStyles.ENTREE
                  const TypeIcon = type.icon

                  return (
                    <TableRow key={mvt.id as number}>
                      <TableCell className="whitespace-nowrap">
                        {mvt.dateMouvement
                          ? new Date(mvt.dateMouvement as string).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </TableCell>
                      <TableCell className="font-medium">{(mvt.articleDesignation as string) || "N/A"}</TableCell>
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
                            typeMouvement.includes("SORTIE") || typeMouvement === "CORRECTION_NEGATIVE"
                              ? "text-red-500"
                              : "text-emerald-500"
                          }
                        >
                          {typeMouvement.includes("SORTIE") || typeMouvement === "CORRECTION_NEGATIVE" ? "-" : "+"}
                          {(mvt.quantite as number) || 0}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">
                        {(mvt.motif as string) || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {(mvt.createdBy as string) || "N/A"}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t">
            <div className="text-sm text-muted-foreground">{filteredMouvements.length} mouvement(s)</div>
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
    </div>
  )
}
