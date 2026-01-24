/**
 * Utilitaire pour construire les URLs d'images depuis l'API Spring Boot et MinIO
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://147.93.9.170:8080/api/v1.0'

/**
 * Construit l'URL complète d'une image via l'API Spring Boot
 * @param imagePath - Le chemin de l'image (ex: "articles/abc-123.jpg" ou "articles/uuid.jpg")
 * @returns L'URL complète de l'image ou null si pas d'image
 */
export function buildImageUrl(imagePath: string | null | undefined): string | null {
  console.log('buildImageUrl called with:', { imagePath, type: typeof imagePath })
  
  if (!imagePath) return null
  
  // Si c'est déjà une URL complète (http/https), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // Si c'est une URL d'API commençant par /api/v1.0, construire l'URL complète avec le host
  if (imagePath.startsWith('/api/v1.0/')) {
    const baseHost = API_BASE_URL.replace('/api/v1.0', '')
    return `${baseHost}${imagePath}`
  }
  
  // Si c'est un chemin relatif (articles/file.jpg ou products/file.jpg), construire l'URL via l'API d'images
  if (!imagePath.startsWith('/')) {
    const url = `${API_BASE_URL}/images/${imagePath}`
    console.log('Building image URL:', { imagePath, url, API_BASE_URL })
    return url
  }
  
  // Si c'est un chemin absolu sans /api/v1.0, ajouter le base API URL
  const url = `${API_BASE_URL}${imagePath}`
  console.log('Building image URL:', { imagePath, url, API_BASE_URL })
  return url
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