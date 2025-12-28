# Frontend - Système de Livraison à Deux Livreurs

## Composants créés/modifiés

### 1. **DualDeliveryAssignment.tsx** (NOUVEAU)
Composant intelligent qui détecte automatiquement si la livraison nécessite un ou deux livreurs.

**Fonctionnalités**:
- Détection automatique: même ville = 1 livreur, villes différentes = 2 livreurs
- Interface à onglets pour sélectionner pickup et delivery séparément
- Affichage des livreurs par zone géographique
- Récapitulatif visuel avant assignation
- Gestion des états de chargement et d'erreur

**Props**:
```typescript
interface DualDeliveryAssignmentProps {
  commandeId: number
  merchantEmail: string
  merchantLat: number
  merchantLon: number
  clientVille: string
  merchantVille: string
  onAssigned: (result: any) => void
}
```

### 2. **MerchantOrderManagement.tsx** (MODIFIÉ)
Mise à jour pour utiliser le nouveau composant DualDeliveryAssignment.

**Changements**:
- Import de `DualDeliveryAssignment`
- Remplacement de `DeliveryAssignment` par `DualDeliveryAssignment`
- Passage des villes client et marchand
- Gestion des résultats pour 1 ou 2 livreurs

### 3. **delivery-api.ts** (MODIFIÉ)
Ajout de la fonction API pour assigner deux livreurs.

**Nouvelle fonction**:
```typescript
async assignerDeuxLivreurs(
  commandeId: number,
  merchantEmail: string,
  livreurPickupId: number,
  livreurDeliveryId: number
)
```

## Flux utilisateur

### Scénario 1: Livraison locale (même ville)

1. Marchand clique sur "Assigner un livreur"
2. Le composant détecte que client et marchand sont dans la même ville
3. Affiche une liste simple de livreurs disponibles
4. Marchand sélectionne un livreur
5. Clic sur "Assigner le livreur"
6. Un seul livreur est assigné

### Scénario 2: Livraison inter-villes

1. Marchand clique sur "Assigner un livreur"
2. Le composant détecte que client et marchand sont dans des villes différentes
3. Affiche deux onglets:
   - **Récupération**: Livreurs dans la ville du marchand
   - **Livraison**: Livreurs dans la ville du client
4. Marchand sélectionne un livreur dans chaque onglet
5. Un récapitulatif s'affiche avec les deux livreurs
6. Clic sur "Assigner les deux livreurs"
7. Les deux livreurs sont assignés et notifiés

## Interface utilisateur

### Onglet "Récupération"
```
┌─────────────────────────────────────────┐
│ Étape 1: Sélectionnez le livreur qui   │
│ récupérera la commande chez vous à     │
│ Yaoundé                                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🚚 Ahmed Benali          [Sélectionné]  │
│ 📞 +237 6 12 34 56 78   📍 Yaoundé     │
│ ⭐ 4.8  156 livraisons  ⏱ ~20 min     │
└─────────────────────────────────────────┘
```

### Onglet "Livraison"
```
┌─────────────────────────────────────────┐
│ Étape 2: Sélectionnez le livreur qui   │
│ livrera au client à Douala             │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 🚚 Carlos Rodriguez      [Sélectionné]  │
│ 📞 +237 7 11 22 33 44   📍 Douala      │
│ ⭐ 4.9  203 livraisons  ⏱ ~45 min     │
└─────────────────────────────────────────┘
```

### Récapitulatif
```
┌─────────────────────────────────────────┐
│ Récapitulatif                           │
│                                         │
│ Récupération          →    Livraison   │
│ Ahmed Benali               Carlos R.   │
└─────────────────────────────────────────┘

[Assigner les deux livreurs]
```

## Détection automatique

Le composant utilise une comparaison simple des villes:

```typescript
const isDifferentCity = clientVille.toLowerCase() !== merchantVille.toLowerCase()
```

Si `isDifferentCity === true`:
- Affiche l'interface à deux onglets
- Appelle `assignerDeuxLivreurs()`

Si `isDifferentCity === false`:
- Affiche l'interface simple
- Appelle `assignerLivreur()` (un seul livreur)

## Données de démonstration

Le composant inclut des données de démonstration si aucun livreur réel n'est disponible:

**Livreurs Pickup (ville marchand)**:
- Ahmed Benali - Yaoundé
- Sophie Dubois - Yaoundé

**Livreurs Delivery (ville client)**:
- Carlos Rodriguez - Douala
- Marie Martin - Douala

## Notifications

Après assignation réussie, un toast s'affiche:

**Un livreur**:
```
✓ Livreur assigné
Ahmed Benali a été assigné à cette commande
```

**Deux livreurs**:
```
✓ Livreurs assignés
Ahmed Benali (pickup) et Carlos Rodriguez (delivery) ont été assignés
```

## Gestion des erreurs

- **Sélection incomplète**: Toast d'erreur si un des livreurs n'est pas sélectionné
- **Erreur API**: Toast d'erreur avec message descriptif
- **Chargement**: Spinner pendant la recherche des livreurs
- **Aucun livreur**: Message informatif avec bouton "Actualiser"

## Améliorations futures

1. **Géolocalisation automatique**: Récupérer automatiquement les coordonnées du marchand
2. **Filtres avancés**: Filtrer par note, nombre de livraisons, disponibilité
3. **Carte interactive**: Afficher les livreurs sur une carte
4. **Estimation de prix**: Calculer automatiquement les frais selon la distance
5. **Historique**: Afficher l'historique des assignations
6. **Préférences**: Sauvegarder les livreurs préférés du marchand

## Installation

Aucune installation supplémentaire requise. Les composants utilisent les dépendances existantes:
- React
- shadcn/ui components
- TanStack Query
- Lucide React icons

## Utilisation

```tsx
import DualDeliveryAssignment from '@/components/delivery/DualDeliveryAssignment'

<DualDeliveryAssignment
  commandeId={order.id}
  merchantEmail={user.email}
  merchantLat={merchantProfile.latitude}
  merchantLon={merchantProfile.longitude}
  clientVille={order.adresseLivraison.ville}
  merchantVille={merchantProfile.ville}
  onAssigned={(result) => {
    // Handle successful assignment
    console.log('Assigned:', result)
  }}
/>
```

## Tests

Pour tester la fonctionnalité:

1. Créer une commande avec un client dans une ville différente
2. Marquer la commande comme "Prête"
3. Cliquer sur "Assigner un livreur"
4. Vérifier que l'interface à deux onglets s'affiche
5. Sélectionner un livreur dans chaque onglet
6. Vérifier le récapitulatif
7. Cliquer sur "Assigner les deux livreurs"
8. Vérifier que les deux livreurs reçoivent des emails

## Support

Pour toute question ou problème, consulter:
- Backend README: `DUAL_DELIVERY_README.md`
- Documentation API: Endpoints `/commandes/{id}/assigner-livreur` et `/commandes/{id}/assigner-deux-livreurs`
