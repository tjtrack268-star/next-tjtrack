"use client"

import { AdminGuard } from "@/components/admin-guard"
import { PromotionManager } from "@/components/promotion-manager"

export default function AdminPromotionsPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Gestion des Promotions</h1>
          <p className="text-muted-foreground">Créez et gérez vos codes promo et réductions</p>
        </div>
        <PromotionManager />
      </div>
    </AdminGuard>
  )
}