import { apiClient } from './api'

export const deliveryApi = {
  async getLivreursDisponibles(lat: number, lon: number) {
    return apiClient.get(`/commandes/livreurs-disponibles?lat=${lat}&lon=${lon}`)
  },

  async assignerLivreur(commandeId: number, clientId: number, merchantId: number) {
    return apiClient.post(`/commandes/${commandeId}/assigner-livreur?clientId=${clientId}&merchantId=${merchantId}`)
  },

  async getCommandesMerchant() {
    return apiClient.get('/commandes/merchant')
  },

  async trackDelivery(commandeId: number, lat: number, lon: number) {
    return apiClient.post(`/delivery/track/${commandeId}?lat=${lat}&lon=${lon}`)
  }
}