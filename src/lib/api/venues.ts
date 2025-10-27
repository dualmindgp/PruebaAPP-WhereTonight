import { supabase } from '@/lib/supabase'
import { VenueWithCount } from '@/lib/database.types'

/**
 * Obtiene todos los venues activos con conteo de tickets de hoy
 */
export async function getVenues(): Promise<VenueWithCount[]> {
  try {
    // Obtener venues activos
    const { data: venues, error: venuesError } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (venuesError) {
      console.error('Error fetching venues:', venuesError)
      return []
    }

    // Obtener fecha actual
    const today = new Date().toISOString().split('T')[0]
    
    // Consultar tickets del día
    const { data: allTickets } = await supabase
      .from('tickets')
      .select('venue_id')
      .eq('local_date', today)
    
    // Contar por venue_id
    const ticketCounts: { [key: string]: number } = {}
    if (allTickets && allTickets.length > 0) {
      allTickets.forEach((ticket: any) => {
        if (ticket.venue_id) {
          ticketCounts[ticket.venue_id] = (ticketCounts[ticket.venue_id] || 0) + 1
        }
      })
    }

    // Combinar venues con conteos
    const venuesWithCounts: VenueWithCount[] = venues.map(venue => ({
      ...venue,
      count_today: ticketCounts[venue.id] || 0
    }))

    // Ordenar por popularidad
    venuesWithCounts.sort((a, b) => b.count_today - a.count_today)

    return venuesWithCounts
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

/**
 * Obtiene un venue específico por ID
 */
export async function getVenueById(venueId: string) {
  try {
    const { data, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', venueId)
      .single()

    if (error) {
      console.error('Error fetching venue:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching venue:', error)
    return null
  }
}
