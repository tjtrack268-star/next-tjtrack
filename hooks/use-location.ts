"use client"

import { useState, useEffect } from "react"
import { locationApi, type Ville, type Quartier } from "@/lib/location-api"

export function useLocation() {
  const [villes, setVilles] = useState<Ville[]>([])
  const [quartiers, setQuartiers] = useState<Quartier[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadVilles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await locationApi.getVilles()
      setVilles(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des villes')
      console.error('Erreur lors du chargement des villes:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadQuartiersByVille = async (villeId: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await locationApi.getQuartiersByVille(villeId)
      setQuartiers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des quartiers')
      setQuartiers([])
      console.error('Erreur lors du chargement des quartiers:', err)
    } finally {
      setLoading(false)
    }
  }

  const getVilleById = (id: number): Ville | undefined => {
    return villes.find(ville => ville.id === id)
  }

  const getVilleByName = (nom: string): Ville | undefined => {
    return villes.find(ville => ville.nom === nom)
  }

  const getQuartierById = (id: number): Quartier | undefined => {
    return quartiers.find(quartier => quartier.id === id)
  }

  const getQuartierByName = (nom: string): Quartier | undefined => {
    return quartiers.find(quartier => quartier.nom === nom)
  }

  return {
    villes,
    quartiers,
    loading,
    error,
    loadVilles,
    loadQuartiersByVille,
    getVilleById,
    getVilleByName,
    getQuartierById,
    getQuartierByName
  }
}