/**
 * Obtiene la URL de la foto desde Google Places
 * En web usa /api/photo (Next.js API route)
 * En móvil usará Edge Function de Supabase (cuando esté desplegada)
 * 
 * @param photoRef - Referencia de la foto de Google Places
 * @param venueType - Tipo de venue (club, bar, other)
 * @returns URL completa de la imagen
 */
export function getPhotoUrl(photoRef: string | null, venueType: string = 'other'): string {
  // SIEMPRE usar /api/photo en web (localhost o producción Next.js)
  // Solo cambiar a Edge Function cuando sea Capacitor (detectado por capacitor:// protocol)
  const isCapacitor = typeof window !== 'undefined' && window.location.protocol === 'capacitor:'
  
  if (isCapacitor) {
    // En Capacitor, usar Edge Function de Supabase
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!SUPABASE_URL) {
      console.warn('SUPABASE_URL no definida en Capacitor')
      // Fallback directo a Unsplash
      const fallbacks = {
        club: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800&h=600&fit=crop',
        bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
        other: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop'
      }
      return fallbacks[venueType as keyof typeof fallbacks] || fallbacks.other
    }
    
    const functionUrl = `${SUPABASE_URL}/functions/v1/photo-proxy`
    if (!photoRef) {
      return `${functionUrl}?type=${venueType}`
    }
    return `${functionUrl}?ref=${photoRef}&type=${venueType}`
  }
  
  // En web (localhost o producción Next.js), usar API route
  if (!photoRef) {
    return `/api/photo?type=${venueType}&fallback=true`
  }
  return `/api/photo?ref=${photoRef}&type=${venueType}`
}
