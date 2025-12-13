"use client"

import { AdminGuard } from "@/components/admin-guard"
import { SEOManager } from "@/components/seo-manager"

export default function AdminSEOPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">SEO Manager</h1>
          <p className="text-muted-foreground">Optimisez le référencement de votre plateforme</p>
        </div>
        <SEOManager />
      </div>
    </AdminGuard>
  )
}