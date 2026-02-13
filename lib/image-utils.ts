/**
 * Utilitaire pour construire les URLs d'images depuis l'API Spring Boot et MinIO
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tjtracks.com/api/v1.0'

/**
 * Construit l'URL complète d'une image via l'API Spring Boot
 * @param imagePath - Le chemin de l'image (ex: "articles/abc-123.jpg" ou "articles/uuid.jpg")
 * @returns L'URL complète de l'image ou null si pas d'image
 */
export function buildImageUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  if (imagePath.startsWith('/api/v1.0/')) {
    const baseHost = API_BASE_URL.replace('/api/v1.0', '')
    return `${baseHost}${imagePath}`
  }
  
  if (!imagePath.startsWith('/')) {
    return `${API_BASE_URL}/images/${imagePath}`
  }
  
  return `${API_BASE_URL}${imagePath}`
}

/**
 * Construit les URLs pour un tableau d'images
 * @param imagePaths - Tableau de chemins d'images
 * @returns Tableau d'URLs complètes
 */
export function buildImageUrls(imagePaths: (string | null | undefined)[]): string[] {
  return imagePaths
    .map(buildImageUrl)
    .filter((url): url is string => url !== null)
}
