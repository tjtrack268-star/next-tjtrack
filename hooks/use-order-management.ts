import { useState, useCallback } from 'react'
import { useToast } from './use-toast'
import { validateStatusTransition, validateShipmentStatus, Order } from '@/lib/order-validation'

export function useOrderManagement(initialOrders: Order[] = []) {
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const { toast } = useToast()

  const updateOrderStatus = useCallback((orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId)
    if (!order) {
      toast({
        title: "Erreur",
        description: "Commande introuvable",
        variant: "destructive"
      })
      return false
    }

    const validation = validateStatusTransition(order.status, newStatus, order)
    
    if (!validation.isValid) {
      toast({
        title: "Action impossible",
        description: validation.message,
        variant: "destructive"
      })
      return false
    }

    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, status: newStatus } : o
    ))

    toast({
      title: "Statut mis à jour",
      description: `La commande ${orderId} a été mise à jour.`
    })

    return true
  }, [orders, toast])

  const assignDelivery = useCallback((orderId: string, livreurId: number) => {
    setOrders(prev => prev.map(o => 
      o.id === orderId ? { ...o, livreurId } : o
    ))

    toast({
      title: "Livreur assigné",
      description: `Un livreur a été assigné à la commande ${orderId}.`
    })
  }, [toast])

  const markAsShipped = useCallback((orderId: string) => {
    return updateOrderStatus(orderId, 'EXPEDIEE')
  }, [updateOrderStatus])

  const canMarkAsShipped = useCallback((order: Order) => {
    return validateShipmentStatus(order).isValid
  }, [])

  return {
    orders,
    updateOrderStatus,
    assignDelivery,
    markAsShipped,
    canMarkAsShipped
  }
}
