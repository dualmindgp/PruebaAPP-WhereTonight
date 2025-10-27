const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
}

/**
 * Obtiene la URL de la foto desde Google Places via Edge Function
 * @param photoRef - Referencia de la foto de Google Places
 * @param venueType - Tipo de venue (club, bar, other)
 * @returns URL completa de la imagen
 */
export function getPhotoUrl(photoRef: string | null, venueType: string = 'other'): string {
  const functionUrl = `${SUPABASE_URL}/functions/v1/photo-proxy`
  
  if (!photoRef) {
    return `${functionUrl}?type=${venueType}`
  }
  
  return `${functionUrl}?ref=${photoRef}&type=${venueType}`
}
