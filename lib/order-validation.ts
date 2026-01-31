/**
 * Utilitaires de validation pour les commandes
 */

export interface OrderValidationResult {
  isValid: boolean
  message?: string
  requiredAction?: string
}

export interface Order {
  id: string
  status: string
  livreurId?: number | null
  [key: string]: any
}

/**
 * Valide si une commande peut être marquée comme expédiée
 */
export function validateShipmentStatus(order: Order): OrderValidationResult {
  // Vérifier si un livreur est assigné
  if (!order.livreurId) {
    return {
      isValid: false,
      message: "Impossible de marquer cette commande comme expédiée : aucun livreur n'est assigné.",
      requiredAction: "Veuillez d'abord affecter un livreur à cette commande."
    }
  }

  // Vérifier le statut actuel
  if (order.status === 'EXPEDIEE' || order.status === 'LIVREE') {
    return {
      isValid: false,
      message: "Cette commande a déjà été expédiée ou livrée."
    }
  }

  return {
    isValid: true
  }
}

/**
 * Valide les transitions de statut autorisées
 */
export function validateStatusTransition(currentStatus: string, newStatus: string, order: Order): OrderValidationResult {
  const validTransitions: Record<string, string[]> = {
    'EN_ATTENTE': ['CONFIRMEE', 'ANNULEE'],
    'CONFIRMEE': ['EN_PREPARATION', 'ANNULEE'],
    'EN_PREPARATION': ['EXPEDIEE', 'ANNULEE'],
    'EXPEDIEE': ['LIVREE'],
    'LIVREE': [], 
    'ANNULEE': [] 
  }

  // Vérifier si la transition est autorisée
  if (!validTransitions[currentStatus]?.includes(newStatus)) {
    return {
      isValid: false,
      message: `Transition de statut non autorisée : ${currentStatus} → ${newStatus}`
    }
  }

  // Validation spéciale pour le statut "expédié"
  if (newStatus === 'EXPEDIEE') {
    return validateShipmentStatus(order)
  }

  return {
    isValid: true
  }
}

/**
 * Obtient les actions disponibles pour une commande selon son statut
 */
export function getAvailableActions(order: Order): Array<{
  action: string
  label: string
  enabled: boolean
  reason?: string
}> {
  const actions = []

  switch (order.status) {
    case 'EN_ATTENTE':
      actions.push(
        { action: 'CONFIRMEE', label: 'Confirmer', enabled: true },
        { action: 'ANNULEE', label: 'Annuler', enabled: true }
      )
      break

    case 'CONFIRMEE':
      actions.push(
        { action: 'EN_PREPARATION', label: 'Mettre en préparation', enabled: true },
        { action: 'ANNULEE', label: 'Annuler', enabled: true }
      )
      break

    case 'EN_PREPARATION':
      const canShip = validateShipmentStatus(order)
      actions.push(
        { 
          action: 'EXPEDIEE', 
          label: 'Marquer expédiée', 
          enabled: canShip.isValid,
          reason: canShip.message
        },
        { action: 'ANNULEE', label: 'Annuler', enabled: true }
      )
      
      if (!order.livreurId) {
        actions.push({
          action: 'assign_delivery',
          label: 'Affecter livreur',
          enabled: true
        })
      }
      break

    case 'EXPEDIEE':
      actions.push(
        { action: 'LIVREE', label: 'Marquer livrée', enabled: true }
      )
      break

    case 'LIVREE':
    case 'ANNULEE':
      // Aucune action disponible pour les statuts finaux
      break
  }

  return actions
}
