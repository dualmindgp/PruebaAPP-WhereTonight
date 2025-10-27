import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers para permitir peticiones desde tu app
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Imágenes de fallback por tipo de venue
const FALLBACK_IMAGES: { [key: string]: string } = {
  club: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&q=80',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80',
  other: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80'
}

async function fetchFallbackImage(venueType: string): Promise<Response> {
  const fallbackUrl = FALLBACK_IMAGES[venueType] || FALLBACK_IMAGES.other
  const response = await fetch(fallbackUrl)
  const imageData = await response.arrayBuffer()
  
  return new Response(imageData, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'public, max-age=604800',
    },
  })
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const photoRef = url.searchParams.get('ref')
    const venueType = url.searchParams.get('type') || 'other'
    
    // Si no hay referencia, devolver fallback
    if (!photoRef) {
      return await fetchFallbackImage(venueType)
    }

    // Obtener API key desde variables de entorno de Supabase
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    
    if (!apiKey) {
      console.error('Google Maps API key not configured')
      return await fetchFallbackImage(venueType)
    }

    // Fetch desde Google Places API
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`
    const response = await fetch(photoUrl)

    if (!response.ok) {
      console.error('Google Places API error:', response.status)
      return await fetchFallbackImage(venueType)
    }

    const imageData = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    return new Response(imageData, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, immutable',
      },
    })

  } catch (error) {
    console.error('Error fetching photo:', error)
    
    // Devolver imagen de fallback en caso de error
    try {
      const url = new URL(req.url)
      const venueType = url.searchParams.get('type') || 'other'
      return await fetchFallbackImage(venueType)
    } catch (fallbackError) {
      return new Response('Image not found', { 
        status: 500,
        headers: corsHeaders 
      })
    }
  }
})
