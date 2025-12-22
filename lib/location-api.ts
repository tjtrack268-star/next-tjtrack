const API_BASE_URL = 'http://localhost:8080/api/v1.0/locations'

export interface Ville {
  id: number
  nom: string
  region: {
    id: number
    nom: string
  }
}

export interface Quartier {
  id: number
  nom: string
  ville: {
    id: number
    nom: string
  }
}

export const locationApi = {
  async getVilles(): Promise<Ville[]> {
    const response = await fetch(`${API_BASE_URL}/villes`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des villes')
    }
    const result = await response.json()
    return result.success ? result.data : []
  },

  async getQuartiersByVille(villeId: number): Promise<Quartier[]> {
    const response = await fetch(`${API_BASE_URL}/quartiers/${villeId}`)
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des quartiers')
    }
    const result = await response.json()
    return result.success ? result.data : []
  }
}