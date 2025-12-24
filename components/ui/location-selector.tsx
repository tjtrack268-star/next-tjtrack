"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { locationApi, type Ville, type Quartier } from "@/lib/location-api"

interface LocationSelectorProps {
  selectedVille?: string
  selectedQuartier?: string
  onVilleChange: (ville: string) => void
  onQuartierChange: (quartier: string) => void
  required?: boolean
  disabled?: boolean
}

export function LocationSelector({
  selectedVille,
  selectedQuartier,
  onVilleChange,
  onQuartierChange,
  required = false,
  disabled = false
}: LocationSelectorProps) {
  const [villes, setVilles] = useState<Ville[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [selectedVilleId, setSelectedVilleId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadVilles()
  }, [])

  useEffect(() => {
    if (selectedVilleId) {
      loadQuartiers(selectedVilleId)
    } else {
      setQuartiers([])
      onQuartierChange("")
    }
  }, [selectedVilleId])

  const loadVilles = async () => {
    try {
      setLoading(true)
      const data = await locationApi.getVilles()
      setVilles(data)
    } catch (error) {
      console.error('Erreur lors du chargement des villes:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuartiers = async (villeId: number) => {
    try {
      setLoading(true)
      const data = await locationApi.getQuartiersByVille(villeId)
      setQuartiers(data)
    } catch (error) {
      console.error('Erreur lors du chargement des quartiers:', error)
      setQuartiers([])
    } finally {
      setLoading(false)
    }
  }

  const handleVilleChange = (villeName: string) => {
    onVilleChange(villeName)
    const ville = villes.find(v => v.nom === villeName)
    setSelectedVilleId(ville?.id || null)
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
          disabled={disabled || loading}
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
          disabled={disabled || loading || !selectedVilleId}
        >
          <SelectTrigger>
            <SelectValue 
              placeholder={
                selectedVilleId 
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