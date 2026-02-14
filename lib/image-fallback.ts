export interface ImageSource {
  url: string
  type: 'products' | 'articles'
  priority: number
}

export function getImageSources(originalUrl: string, itemId?: string): ImageSource[] {
  const sources: ImageSource[] = []
  
  // URL originale en priorité
  if (originalUrl.includes('/products/')) {
    sources.push({ url: originalUrl, type: 'products', priority: 1 })
    // Alternative articles
    sources.push({ 
      url: originalUrl.replace('/products/', '/articles/'), 
      type: 'articles', 
      priority: 2 
    })
  } else if (originalUrl.includes('/articles/')) {
    sources.push({ url: originalUrl, type: 'articles', priority: 1 })
    // Alternative produits
    sources.push({ 
      url: originalUrl.replace('/articles/', '/products/'), 
      type: 'products', 
      priority: 2 
    })
  } else {
    sources.push({ url: originalUrl, type: 'products', priority: 1 })
  }
  
  return sources.sort((a, b) => a.priority - b.priority)
}

export function validateImageUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new window.Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
    
    // Timeout après 5 secondes
    setTimeout(() => resolve(false), 5000)
  })
}

export async function findWorkingImageUrl(sources: ImageSource[]): Promise<string | null> {
  for (const source of sources) {
    const isValid = await validateImageUrl(source.url)
    if (isValid) return source.url
  }
  return null
}