"use client"

import { useState } from "react"
import {
  FileText,
  Download,
  Calendar,
  BarChart3,
  Package,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  FilePieChart,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { useEcommerceStats, useStockStats } from "@/hooks/use-api"

const reportTypes = [
  {
    id: "ventes",
    title: "Rapport des Ventes",
    description: "Analyse détaillée des ventes par période, produit et catégorie",
    icon: DollarSign,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    id: "stock",
    title: "État des Stocks",
    description: "Inventaire complet avec valorisation et alertes",
    icon: Package,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    formats: ["PDF", "Excel"],
  },
  {
    id: "mouvements",
    title: "Mouvements de Stock",
    description: "Historique des entrées, sorties et corrections",
    icon: TrendingUp,
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
    formats: ["PDF", "Excel", "CSV"],
  },
  {
    id: "commandes",
    title: "Rapport des Commandes",
    description: "Suivi des commandes clients et fournisseurs",
    icon: FileSpreadsheet,
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    formats: ["PDF", "Excel"],
  },
  {
    id: "performance",
    title: "Performance Commerciale",
    description: "KPIs, taux de conversion et analyse des tendances",
    icon: BarChart3,
    color: "text-primary",
    bgColor: "bg-primary/10",
    formats: ["PDF"],
  },
  {
    id: "categorie",
    title: "Analyse par Catégorie",
    description: "Répartition des ventes et stocks par catégorie",
    icon: FilePieChart,
    color: "text-pink-500",
    bgColor: "bg-pink-500/10",
    formats: ["PDF", "Excel"],
  },
]

interface RecentReport {
  name: string
  date: string
  format: string
  size: string
}

export default function RapportsPage() {
  const { toast } = useToast()
  const [periode, setPeriode] = useState("month")
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)

  const { data: ecommerceStats } = useEcommerceStats()
  const { data: stockStats } = useStockStats()

  const recentReports: RecentReport[] = [
    {
      name: `Rapport des Ventes - ${new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`,
      date: new Date().toISOString(),
      format: "PDF",
      size: "2.4 MB",
    },
    {
      name: `État des Stocks - Semaine ${Math.ceil(new Date().getDate() / 7)}`,
      date: new Date().toISOString(),
      format: "Excel",
      size: "1.8 MB",
    },
    {
      name: `Mouvements de Stock - ${new Date().toLocaleDateString("fr-FR", { month: "long" })}`,
      date: new Date().toISOString(),
      format: "CSV",
      size: "856 KB",
    },
  ]

  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReport(reportId)
    try {
      // Simulate report generation - in real app, call API endpoint
      await new Promise((resolve) => setTimeout(resolve, 2000))
      toast({
        title: "Rapport généré",
        description: "Votre rapport est prêt à être téléchargé",
      })
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de générer le rapport",
        variant: "destructive",
      })
    } finally {
      setGeneratingReport(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rapports</h1>
          <p className="text-muted-foreground">Générez et téléchargez vos rapports d'activité</p>
        </div>
        <div className="flex gap-2">
          <Select value={periode} onValueChange={setPeriode}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Cette semaine</SelectItem>
              <SelectItem value="month">Ce mois</SelectItem>
              <SelectItem value="quarter">Ce trimestre</SelectItem>
              <SelectItem value="year">Cette année</SelectItem>
              <SelectItem value="custom">Personnalisé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Report Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isGenerating = generatingReport === report.id
          return (
            <Card key={report.id} className="glass-card hover:border-primary/50 transition-colors group">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg ${report.bgColor}`}>
                    <Icon className={`h-6 w-6 ${report.color}`} />
                  </div>
                  <div className="flex gap-1">
                    {report.formats.map((format) => (
                      <Badge key={format} variant="secondary" className="text-xs">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>
                <CardTitle className="text-lg mt-4">{report.title}</CardTitle>
                <CardDescription>{report.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full bg-transparent"
                  variant="outline"
                  disabled={isGenerating}
                  onClick={() => handleGenerateReport(report.id)}
                >
                  {isGenerating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isGenerating ? "Génération..." : "Générer le rapport"}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Reports */}
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-lg">Rapports Récents</CardTitle>
          <CardDescription>Derniers rapports générés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentReports.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucun rapport récent</p>
            ) : (
              recentReports.map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(report.date).toLocaleDateString("fr-FR")} • {report.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{report.format}</Badge>
                    <Button size="icon" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
