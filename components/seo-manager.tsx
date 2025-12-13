"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Search, Globe, FileText, Image, AlertCircle, CheckCircle } from "lucide-react"

export function SEOManager() {
  const seoPages = [
    { page: "Accueil", title: "TJ-Track - Plateforme E-commerce", description: "Découvrez notre plateforme...", score: 85, status: "good" },
    { page: "Produits", title: "Nos Produits - TJ-Track", description: "Explorez notre catalogue...", score: 72, status: "warning" },
    { page: "Contact", title: "Contact", description: "", score: 45, status: "error" },
  ]

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning': return <AlertCircle className="h-4 w-4 text-orange-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return null
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Optimisation SEO
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {seoPages.map((page) => (
              <div key={page.page} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  {getStatusIcon(page.status)}
                  <div>
                    <h4 className="font-medium">{page.page}</h4>
                    <p className="text-sm text-muted-foreground">{page.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-medium ${getScoreColor(page.score)}`}>Score: {page.score}/100</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Optimiser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Éditeur Meta Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta-title">Titre (Title Tag)</Label>
            <Input id="meta-title" placeholder="Titre de la page..." />
            <p className="text-xs text-muted-foreground mt-1">0/60 caractères</p>
          </div>
          <div>
            <Label htmlFor="meta-description">Description</Label>
            <Textarea id="meta-description" placeholder="Description de la page..." rows={3} />
            <p className="text-xs text-muted-foreground mt-1">0/160 caractères</p>
          </div>
          <div>
            <Label htmlFor="meta-keywords">Mots-clés</Label>
            <Input id="meta-keywords" placeholder="mot-clé1, mot-clé2, mot-clé3..." />
          </div>
          <Button>Sauvegarder les Meta Tags</Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sitemap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>sitemap.xml</span>
                <Badge variant="default">Généré</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Dernière mise à jour</span>
                <span className="text-sm text-muted-foreground">Il y a 2 jours</span>
              </div>
              <Button variant="outline" className="w-full">
                Régénérer Sitemap
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Robots.txt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>robots.txt</span>
                <Badge variant="default">Configuré</Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>User-agent: *</p>
                <p>Allow: /</p>
                <p>Sitemap: /sitemap.xml</p>
              </div>
              <Button variant="outline" className="w-full">
                Modifier Robots.txt
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}