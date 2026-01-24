"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"

interface StaticLocationSelectorProps {
  selectedVille?: string
  selectedQuartier?: string
  onVilleChange: (ville: string) => void
  onQuartierChange: (quartier: string) => void
  required?: boolean
  disabled?: boolean
}

const villes = [
  { id: 1, nom: "Yaoundé" },
  { id: 2, nom: "Douala" }
]

export function StaticLocationSelector({
  selectedVille,
  selectedQuartier,
  onVilleChange,
  onQuartierChange,
  required = false,
  disabled = false
}: StaticLocationSelectorProps) {
  const [quartiers, setQuartiers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedVille) {
      setLoading(true)
      apiClient.get<string[]>(`/quartiers/${selectedVille.toLowerCase()}`)
        .then(data => {
          setQuartiers([...new Set(data || [])])
        })
        .catch((error) => {
          console.warn('Erreur chargement quartiers:', error)
          setQuartiers([])
        })
        .finally(() => setLoading(false))
    } else {
      setQuartiers([])
    }
  }, [selectedVille])

  const handleVilleChange = (villeName: string) => {
    onVilleChange(villeName)
    onQuartierChange("") // Reset quartier
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="ville">
          Ville {required && "*"}
        </Label>
        <Select 
          value={selectedVille} 
          onValueChange={handleVilleChange}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez votre ville" />
          </SelectTrigger>
          <SelectContent>
            {villes.map((ville) => (
              <SelectItem key={ville.id} value={ville.nom}>
                {ville.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quartier">
          Quartier {required && "*"}
        </Label>
        <Select 
          value={selectedQuartier} 
          onValueChange={onQuartierChange}
          disabled={disabled || !selectedVille || loading}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                loading ? "Chargement..." :
                selectedVille 
                  ? "Sélectionnez votre quartier" 
                  : "Sélectionnez d'abord une ville"
              } 
            />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {quartiers.map((quartier) => (
              <SelectItem key={quartier} value={quartier}>
                {quartier}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {selectedVille && quartiers.length > 0 && `${quartiers.length} quartiers disponibles`}
        </p>
      </div>
    </div>
  )
}