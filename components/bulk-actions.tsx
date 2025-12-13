"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Square, Trash2, UserCheck, UserX, Mail } from "lucide-react"

interface BulkActionsProps {
  selectedItems: string[]
  totalItems: number
  onSelectAll: (selected: boolean) => void
  onBulkAction: (action: string) => void
}

export function BulkActions({ selectedItems, totalItems, onSelectAll, onBulkAction }: BulkActionsProps) {
  const [bulkAction, setBulkAction] = useState("")

  const isAllSelected = selectedItems.length === totalItems && totalItems > 0
  const isPartialSelected = selectedItems.length > 0 && selectedItems.length < totalItems

  const handleSelectAll = () => {
    onSelectAll(!isAllSelected)
  }

  const handleBulkAction = () => {
    if (bulkAction && selectedItems.length > 0) {
      onBulkAction(bulkAction)
      setBulkAction("")
    }
  }

  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          ref={(el) => {
            if (el) el.indeterminate = isPartialSelected
          }}
          onCheckedChange={handleSelectAll}
        />
        <span className="text-sm">
          {selectedItems.length > 0 ? (
            <Badge variant="secondary">{selectedItems.length} sélectionné(s)</Badge>
          ) : (
            "Tout sélectionner"
          )}
        </span>
      </div>

      {selectedItems.length > 0 && (
        <div className="flex items-center gap-2">
          <Select value={bulkAction} onValueChange={setBulkAction}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Actions en lot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="approve">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Approuver
                </div>
              </SelectItem>
              <SelectItem value="reject">
                <div className="flex items-center gap-2">
                  <UserX className="h-4 w-4" />
                  Rejeter
                </div>
              </SelectItem>
              <SelectItem value="email">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Envoyer email
                </div>
              </SelectItem>
              <SelectItem value="delete">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleBulkAction} disabled={!bulkAction}>
            Appliquer
          </Button>
        </div>
      )}
    </div>
  )
}