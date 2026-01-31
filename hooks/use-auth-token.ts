"use client"

import { useEffect } from 'react'
import { apiClient } from '@/lib/api'

export function useAuthToken() {
  useEffect(() => {
    // Fonction pour mettre à jour le token
    const updateToken = () => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('tj-track-token')
        if (token) {
          apiClient.setToken(token)
          console.log('Token JWT configuré:', token.substring(0, 20) + '...')
        } else {
          console.log('Aucun token JWT trouvé dans localStorage')
        }
      }
    }

    // Mettre à jour le token au montage
    updateToken()

    // Écouter les changements dans localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'tj-track-token') {
        updateToken()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
}
