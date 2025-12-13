"use client"

import { usePermissions } from "@/hooks/use-permissions"
import { Card, CardContent } from "@/components/ui/card"
import { ShieldX } from "lucide-react"

interface AdminGuardProps {
  children: React.ReactNode
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin } = usePermissions()

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <ShieldX className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-muted-foreground">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return <>{children}</>
}