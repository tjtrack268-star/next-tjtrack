"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Image, Video, Globe, Edit, Trash2 } from "lucide-react"

export function ContentManagement() {
  const contentItems = [
    { id: 1, title: "Page d'accueil", type: "page", status: "published", lastModified: "2024-01-15" },
    { id: 2, title: "Bannière promo", type: "banner", status: "draft", lastModified: "2024-01-14" },
    { id: 3, title: "Newsletter janvier", type: "email", status: "scheduled", lastModified: "2024-01-13" },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gestion du Contenu</CardTitle>
        <Button size="sm">
          <FileText className="h-4 w-4 mr-2" />
          Nouveau contenu
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {contentItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {item.type === 'page' && <Globe className="h-4 w-4" />}
                {item.type === 'banner' && <Image className="h-4 w-4" />}
                {item.type === 'email' && <FileText className="h-4 w-4" />}
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">Modifié le {item.lastModified}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={item.status === 'published' ? 'default' : item.status === 'draft' ? 'secondary' : 'outline'}>
                  {item.status}
                </Badge>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}