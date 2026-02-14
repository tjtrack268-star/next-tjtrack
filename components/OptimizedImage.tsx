'use client'

import Image from 'next/image'
import { useState } from 'react'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallback?: string
  productId?: string // Pour gérer les sources multiples
}

export default function OptimizedImage({ 
  src, 
  alt, 
  width = 300, 
  height = 300, 
  className = '',
  fallback = '/placeholder.svg',
  productId
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src)
  const [isLoading, setIsLoading] = useState(true)
  const [attemptCount, setAttemptCount] = useState(0)

  // Sources alternatives pour les images
  const getAlternativeSources = (originalSrc: string, id?: string) => {
    if (!id) return []
    
    const sources = []
    
    // Si c'est une image produit, essayer articles
    if (originalSrc.includes('/products/')) {
      sources.push(originalSrc.replace('/products/', '/articles/'))
    }
    // Si c'est une image article, essayer produits
    else if (originalSrc.includes('/articles/')) {
      sources.push(originalSrc.replace('/articles/', '/products/'))
    }
    
    return sources
  }

  const handleError = () => {
    const alternatives = getAlternativeSources(src, productId)
    
    if (attemptCount < alternatives.length) {
      setAttemptCount(prev => prev + 1)
      setImgSrc(alternatives[attemptCount])
    } else {
      setImgSrc(fallback)
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
  }

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
      <Image
        src={imgSrc}
        alt={alt}
        width={width}
        height={height}
        className={`transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
        onError={handleError}
        onLoad={handleLoad}
        priority={false}
        loading="lazy"
        unoptimized={imgSrc === fallback}
      />
    </div>
  )
}