import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.tjtracks.com/api/v1.0'

export async function POST(request: NextRequest) {
  try {
    const { guestId, userId, ...body } = await request.json()
    
    // Déterminer l'URL de destination
    let url = `${API_BASE_URL}/commandes/creer`
    const params = new URLSearchParams()
    
    if (guestId) {
      params.append('guestId', guestId)
    } else if (userId) {
      params.append('userId', userId)
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`
    }

    console.log('API Route: Forwarding request to:', url)
    console.log('Body:', body)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Backend error:', errorData)
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Erreur interne du serveur' },
      { status: 500 }
    )
  }
}
