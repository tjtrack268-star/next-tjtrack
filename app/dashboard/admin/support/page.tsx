"use client"

import { AdminGuard } from "@/components/admin-guard"
import { SupportTickets } from "@/components/support-tickets"

export default function AdminSupportPage() {
  return (
    <AdminGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Support Client</h1>
          <p className="text-muted-foreground">Gérez les tickets et demandes de support</p>
        </div>
        <SupportTickets />
      </div>
    </AdminGuard>
  )
}