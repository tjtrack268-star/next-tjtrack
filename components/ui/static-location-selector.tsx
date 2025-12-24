"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StaticLocationSelectorProps {
  selectedVille?: string
  selectedQuartier?: string
  onVilleChange: (ville: string) => void
  onQuartierChange: (quartier: string) => void
  required?: boolean
  disabled?: boolean
}

// Données statiques pour test
const villes = [
  { id: 1, nom: "Yaoundé" },
  { id: 2, nom: "Douala" },
  { id: 3, nom: "Bafoussam" },
  { id: 4, nom: "Bamenda" },
  { id: 5, nom: "Garoua" }
]

const quartiersByVille: Record<string, Array<{id: number, nom: string}>> = {
  "Yaoundé": [
    { id: 1, nom: "Bastos" },
    { id: 2, nom: "Melen" },
    { id: 3, nom: "Kondengui" },
    { id: 4, nom: "Emombo" },
    { id: 5, nom: "Nlongkak" }
  ],
  "Douala": [
    { id: 6, nom: "Akwa" },
    { id: 7, nom: "Bonanjo" },
    { id: 8, nom: "Deido" },
    { id: 9, nom: "New Bell" },
    { id: 10, nom: "Bonapriso" }
  ],
  "Bafoussam": [
    { id: 11, nom: "Centre-ville" },
    { id: 12, nom: "Tamdja" },
    { id: 13, nom: "Djeleng" }
  ],
  "Bamenda": [
    { id: 14, nom: "Commercial Avenue" },
    { id: 15, nom: "Up Station" },
    { id: 16, nom: "Down Town" }
  ],
  "Garoua": [
    { id: 17, nom: "Centre" },
    { id: 18, nom: "Plateau" }
  ]
}

export function StaticLocationSelector({
  selectedVille,
  selectedQuartier,
  onVilleChange,
  onQuartierChange,
  required = false,
  disabled = false
}: StaticLocationSelectorProps) {
  const [quartiers, setQuartiers] = useState<Array<{id: number, nom: string}>>([])

  const handleVilleChange = (villeName: string) => {
    onVilleChange(villeName)
    onQuartierChange("") // Reset quartier
    setQuartiers(quartiersByVille[villeName] || [])
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
          disabled={disabled || !selectedVille}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                selectedVille 
                  ? "Sélectionnez votre quartier" 
                  : "Sélectionnez d'abord une ville"
              } 
            />
          </SelectTrigger>
          <SelectContent>
            {quartiers.map((quartier) => (
              <SelectItem key={quartier.id} value={quartier.nom}>
                {quartier.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Permet de vous localiser automatiquement pour les livraisons et services à proximité
        </p>
      </div>
    </div>
  )
}