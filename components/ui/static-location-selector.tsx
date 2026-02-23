"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"

interface StaticLocationSelectorProps {
  selectedVille?: string
  selectedQuartier?: string
  onVilleChange: (ville: string) => void
  onQuartierChange: (quartier: string) => void
  required?: boolean
  disabled?: boolean
}

export function StaticLocationSelector({
  selectedVille,
  selectedQuartier,
  onVilleChange,
  onQuartierChange,
  required = false,
  disabled = false
}: StaticLocationSelectorProps) {
  const [villes, setVilles] = useState<string[]>(["Yaoundé", "Douala"])
  const [quartiers, setQuartiers] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [villeQuery, setVilleQuery] = useState("")
  const [quartierQuery, setQuartierQuery] = useState("")

  useEffect(() => {
    apiClient.get<string[]>("/quartiers")
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVilles(data)
        }
      })
      .catch((error) => {
        console.warn("Erreur chargement villes:", error)
      })
  }, [])

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
    setQuartierQuery("")
  }

  const normalize = (value: string) =>
    value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

  const filteredVilles = villes.filter((ville) => normalize(ville).includes(normalize(villeQuery)))
  const filteredQuartiers = quartiers.filter((quartier) =>
    normalize(quartier).includes(normalize(quartierQuery)),
  )

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
            <div className="p-2">
              <Input
                value={villeQuery}
                onChange={(e) => setVilleQuery(e.target.value)}
                placeholder="Rechercher une ville..."
                className="h-9"
              />
            </div>
            {filteredVilles.map((ville) => (
              <SelectItem key={ville} value={ville}>
                {ville}
              </SelectItem>
            ))}
            {filteredVilles.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Aucune ville trouvée</div>
            )}
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
            <div className="p-2">
              <Input
                value={quartierQuery}
                onChange={(e) => setQuartierQuery(e.target.value)}
                placeholder="Rechercher un quartier..."
                className="h-9"
              />
            </div>
            {filteredQuartiers.map((quartier) => (
              <SelectItem key={quartier} value={quartier}>
                {quartier}
              </SelectItem>
            ))}
            {filteredQuartiers.length === 0 && (
              <div className="px-3 py-2 text-sm text-muted-foreground">Aucun quartier trouvé</div>
            )}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {selectedVille && quartiers.length > 0 && `${quartiers.length} quartiers disponibles`}
        </p>
      </div>
    </div>
  )
}
