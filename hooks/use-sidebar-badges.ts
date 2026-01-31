import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export function useSidebarBadges() {
  const { user } = useAuth()
  const [badges, setBadges] = useState({
    validations: 0,
    communication: 0,
    support: 0,
    alertes: 0,
    nouvelles: 0,
  })

  useEffect(() => {
    if (!user) return

    const loadBadges = async () => {
      try {
        // Charger les notifications non lues
        const notificationsData = await apiClient.get<any>('/notifications')
        const notifications = Array.isArray(notificationsData) ? notificationsData : []
        const unreadCount = notifications.filter(n => !n.isRead).length

        // Pour ADMIN
        if (user.roles?.includes('ADMIN')) {
          // Validations en attente
          const pendingUsersData = await apiClient.get<any>('/admin/pending-users')
          const pendingUsers = Array.isArray(pendingUsersData) ? pendingUsersData : []
          const pendingValidations = pendingUsers.length

          setBadges({
            validations: pendingValidations,
            communication: unreadCount,
            support: 0,
            alertes: notifications.filter(n => n.type === 'ALERTE_STOCK' && !n.isRead).length,
            nouvelles: 0,
          })
        }

        // Pour LIVREUR
        if (user.roles?.includes('LIVREUR')) {
          const livraisonsData = await apiClient.get<any>('/livraisons/livreur')
          const livraisons = Array.isArray(livraisonsData) ? livraisonsData : []
          const nouvelles = livraisons.filter(l => l.statut === 'ASSIGNEE').length

          setBadges({
            ...badges,
            nouvelles,
          })
        }
      } catch (err) {
        console.error('Erreur chargement badges:', err)
      }
    }

    loadBadges()
    const interval = setInterval(loadBadges, 30000) // Refresh toutes les 30s
    return () => clearInterval(interval)
  }, [user])

  return badges
}
