export const useAdminGlobalStats = () => {
  return {
    data: {
      orders: { total: 1247, pending: 89, processing: 156, completed: 987, cancelled: 15 },
      products: { total: 3456, active: 3201, outOfStock: 255 },
      merchants: { total: 78, active: 72, pending: 6 },
      clients: { total: 2341, active: 2198, new: 143 },
      suppliers: { total: 45, active: 42, pending: 3 }
    },
    isLoading: false
  }
}

export const useOrdersByMerchant = () => {
  return {
    data: [
      { id: "1", name: "TechStore Pro", orders: 234, revenue: 45600, status: "active" },
      { id: "2", name: "Fashion Hub", orders: 189, revenue: 38900, status: "active" },
      { id: "3", name: "Home & Garden", orders: 156, revenue: 31200, status: "active" },
      { id: "4", name: "Sports World", orders: 134, revenue: 26800, status: "pending" },
      { id: "5", name: "Beauty Corner", orders: 98, revenue: 19600, status: "active" }
    ],
    isLoading: false
  }
}

export const useOrdersByClient = () => {
  return {
    data: [
      { id: "1", name: "Marie Dubois", orders: 23, total: 2340, lastOrder: "2024-01-15" },
      { id: "2", name: "Jean Martin", orders: 19, total: 1890, lastOrder: "2024-01-14" },
      { id: "3", name: "Sophie Laurent", orders: 17, total: 1700, lastOrder: "2024-01-13" },
      { id: "4", name: "Pierre Durand", orders: 15, total: 1500, lastOrder: "2024-01-12" },
      { id: "5", name: "Emma Moreau", orders: 12, total: 1200, lastOrder: "2024-01-11" }
    ],
    isLoading: false
  }
}

export const useStockByMerchant = () => {
  return {
    data: [
      { id: "1", name: "TechStore Pro", products: 456, inStock: 423, lowStock: 28, outOfStock: 5 },
      { id: "2", name: "Fashion Hub", products: 789, inStock: 734, lowStock: 45, outOfStock: 10 },
      { id: "3", name: "Home & Garden", products: 345, inStock: 312, lowStock: 25, outOfStock: 8 },
      { id: "4", name: "Sports World", products: 234, inStock: 198, lowStock: 30, outOfStock: 6 },
      { id: "5", name: "Beauty Corner", products: 567, inStock: 523, lowStock: 35, outOfStock: 9 }
    ],
    isLoading: false
  }
}

export const useSupplierStats = () => {
  return {
    data: [
      { id: "1", name: "Global Tech Supply", orders: 89, products: 234, delivery: "2-3 jours", rating: 4.8 },
      { id: "2", name: "Fashion Wholesale", orders: 67, products: 189, delivery: "1-2 jours", rating: 4.6 },
      { id: "3", name: "Home Supplies Co", orders: 45, products: 156, delivery: "3-5 jours", rating: 4.4 },
      { id: "4", name: "Sports Equipment Ltd", orders: 34, products: 98, delivery: "2-4 jours", rating: 4.7 },
      { id: "5", name: "Beauty Products Inc", orders: 28, products: 76, delivery: "1-3 jours", rating: 4.5 }
    ],
    isLoading: false
  }
}
