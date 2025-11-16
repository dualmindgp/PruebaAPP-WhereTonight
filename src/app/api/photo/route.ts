import { NextRequest, NextResponse } from 'next/server'

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Fallback images por tipo de venue
const FALLBACK_IMAGES = {
  club: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
  other: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const photoRef = searchParams.get('ref')
  const venueType = searchParams.get('type') || 'other'
  const fallback = searchParams.get('fallback') === 'true'

  // Si se solicita fallback directamente
  if (fallback || !photoRef) {
    const fallbackUrl = FALLBACK_IMAGES[venueType as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.other
    return NextResponse.redirect(fallbackUrl)
  }

  // Si no hay API key, usar fallback
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key not configured')
    const fallbackUrl = FALLBACK_IMAGES[venueType as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.other
    return NextResponse.redirect(fallbackUrl)
  }

  try {
    // Verificar que el photoRef tenga el formato correcto de la NEW Places API
    if (!photoRef.includes('places/')) {
      console.warn(`Photo reference in old format: ${photoRef.substring(0, 50)}... - using fallback`)
      // Usar fallback para referencias en formato antiguo
      const fallbackUrl = FALLBACK_IMAGES[venueType as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.other
      return NextResponse.redirect(fallbackUrl)
    }

    // Usar la NEW Google Places API (v1) para fotos
    const photoUrl = `https://places.googleapis.com/v1/${photoRef}/media?maxHeightPx=800&maxWidthPx=800`
    
    const response = await fetch(photoUrl, {
      headers: {
        'X-Goog-Api-Key': GOOGLE_MAPS_API_KEY
      }
    })

    if (!response.ok) {
      console.error('Google Places API error:', response.status)
      // Usar fallback en lugar de devolver error
      const fallbackUrl = FALLBACK_IMAGES[venueType as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.other
      return NextResponse.redirect(fallbackUrl)
    }

    // Obtener la imagen como buffer
    const imageBuffer = await response.arrayBuffer()

    // Retornar la imagen con headers apropiados
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=604800, immutable', // Cache por 7 días
      },
    })
  } catch (error) {
    console.error('Error fetching photo from Google:', error)
    
    // En caso de error, redirigir a fallback
    const fallbackUrl = FALLBACK_IMAGES[venueType as keyof typeof FALLBACK_IMAGES] || FALLBACK_IMAGES.other
    return NextResponse.redirect(fallbackUrl)
  }
}
