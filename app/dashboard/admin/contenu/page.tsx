"use client"

import { AdminGuard } from "@/components/admin-guard"
import { ContentManagement } from "@/components/content-management"

export default function AdminContentPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion du Contenu</h1>
          <p className="text-muted-foreground">Gérez les pages, bannières et contenus du site</p>
        </div>
        <ContentManagement />
      </div>
    </AdminGuard>
  )
}