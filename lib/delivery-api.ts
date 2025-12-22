import { apiClient } from './api'

export const deliveryApi = {
  // Get available delivery personnel near a location
  async getLivreursDisponibles(lat: number, lon: number, radius: number = 10) {
    try {
      const response = await apiClient.get(`/livreurs/disponibles?lat=${lat}&lon=${lon}&radius=${radius}`)
      return response
    } catch (error) {
      console.error('Error fetching available delivery personnel:', error)
      return apiClient.get(`/ecommerce/livreur/disponibles?lat=${lat}&lon=${lon}`)
    }
  },

  // Assign a delivery person to an order
  async assignerLivreur(commandeId: number, livreurId: number, merchantId: number) {
    try {
      const response = await apiClient.post('/livraisons/assigner', {
        commandeId,
        livreurId,
        merchantId,
        dateAssignation: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error assigning delivery person:', error)
      return apiClient.post(`/commandes/${commandeId}/assigner-livreur?clientId=1&merchantId=${merchantId}`)
    }
  },

  // Get delivery orders for a specific delivery person
  async getCommandesLivreur(livreurId: string) {
    try {
      const response = await apiClient.get(`/livraisons/livreur/${livreurId}`)
      return response
    } catch (error) {
      console.error('Error fetching delivery orders:', error)
      throw error
    }
  },

  // Accept a delivery assignment
  async accepterCommande(commandeId: number, livreurId: string) {
    try {
      const response = await apiClient.put(`/livraisons/${commandeId}/accepter`, {
        livreurId,
        dateAcceptation: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error accepting delivery:', error)
      throw error
    }
  },

  // Refuse a delivery assignment with reason
  async refuserCommande(commandeId: number, livreurId: string, motif: string) {
    try {
      const response = await apiClient.put(`/livraisons/${commandeId}/refuser`, {
        livreurId,
        motif,
        dateRefus: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error refusing delivery:', error)
      throw error
    }
  },

  // Start delivery (when delivery person picks up the order)
  async demarrerLivraison(commandeId: number, livreurId: string) {
    try {
      const response = await apiClient.put(`/livraisons/${commandeId}/demarrer`, {
        livreurId,
        dateDepart: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error starting delivery:', error)
      throw error
    }
  },

  // Complete delivery
  async terminerLivraison(commandeId: number, livreurId: string, commentaire?: string) {
    try {
      const response = await apiClient.put(`/livraisons/${commandeId}/terminer`, {
        livreurId,
        dateLivraison: new Date().toISOString(),
        commentaire
      })
      return response
    } catch (error) {
      console.error('Error completing delivery:', error)
      throw error
    }
  },

  // Get merchant orders that need delivery assignment
  async getCommandesMerchant(merchantId?: string) {
    try {
      const endpoint = merchantId ? `/commandes/merchant/${merchantId}` : '/commandes/merchant'
      return await apiClient.get(endpoint)
    } catch (error) {
      console.error('Error fetching merchant orders:', error)
      return apiClient.get('/commandes/merchant')
    }
  },

  // Track delivery
  async trackDelivery(commandeId: number, lat: number, lon: number) {
    try {
      return await apiClient.post(`/livraisons/${commandeId}/track`, {
        latitude: lat,
        longitude: lon,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error tracking delivery:', error)
      return apiClient.post(`/delivery/track/${commandeId}?lat=${lat}&lon=${lon}`)
    }
  },

  // Update delivery person location
  async updateLocation(livreurId: string, lat: number, lon: number) {
    try {
      const response = await apiClient.put(`/livreurs/${livreurId}/location`, {
        latitude: lat,
        longitude: lon,
        timestamp: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error updating location:', error)
      throw error
    }
  },

  // Send notification to delivery person
  async notifierLivreur(livreurId: string, type: string, message: string, commandeId?: number) {
    try {
      const response = await apiClient.post('/notifications/livreur', {
        livreurId,
        type,
        message,
        commandeId,
        timestamp: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error sending notification:', error)
      throw error
    }
  },

  // Mark order as ready for delivery
  async marquerPrete(commandeId: number, merchantId: string) {
    try {
      const response = await apiClient.put(`/commandes/${commandeId}/prete`, {
        merchantId,
        datePrete: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error marking order as ready:', error)
      throw error
    }
  },

  // Update delivery person status
  async updateStatutLivreur(livreurId: string, statut: 'DISPONIBLE' | 'OCCUPE' | 'HORS_LIGNE') {
    try {
      const response = await apiClient.put(`/livreurs/${livreurId}/statut`, {
        statut,
        timestamp: new Date().toISOString()
      })
      return response
    } catch (error) {
      console.error('Error updating delivery person status:', error)
      throw error
    }
  }
}