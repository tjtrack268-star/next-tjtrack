import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "@/lib/api"
import { toast } from "sonner"
import type { ProduitEcommerceDto } from "@/types/api"

export function useFavorites() {
  const queryClient = useQueryClient()

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => apiClient.get<ProduitEcommerceDto[]>("/ecommerce/favoris"),
  })

  const addMutation = useMutation({
    mutationFn: (produitId: number) => {
      console.log('🔵 Adding to favorites, produitId:', produitId)
      return apiClient.post(`/ecommerce/favoris/${produitId}`)
    },
    onSuccess: () => {
      console.log('✅ Added to favorites successfully')
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      toast.success("Ajouté aux favoris")
    },
    onError: (error) => {
      console.error('❌ Error adding to favorites:', error)
      toast.error("Erreur lors de l'ajout aux favoris")
    },
  })

  const removeMutation = useMutation({
    mutationFn: (produitId: number) => {
      console.log('🔴 Removing from favorites, produitId:', produitId)
      return apiClient.delete(`/ecommerce/favoris/${produitId}`)
    },
    onSuccess: () => {
      console.log('✅ Removed from favorites successfully')
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
      toast.success("Retiré des favoris")
    },
    onError: (error) => {
      console.error('❌ Error removing from favorites:', error)
      toast.error("Erreur lors du retrait des favoris")
    },
  })

  const isFavorite = (produitId: number) => {
    return favorites.some((fav) => fav.id === produitId)
  }

  const toggleFavorite = (produitId: number) => {
    console.log('🔄 Toggle favorite, produitId:', produitId, 'isFavorite:', isFavorite(produitId))
    if (isFavorite(produitId)) {
      removeMutation.mutate(produitId)
    } else {
      addMutation.mutate(produitId)
    }
  }

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addToFavorites: addMutation.mutate,
    removeFromFavorites: removeMutation.mutate,
  }
}
