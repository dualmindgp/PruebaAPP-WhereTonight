import { supabase } from '@/lib/supabase'

/**
 * Usa un ticket para un venue específico
 */
export async function useTicket(userId: string, venueId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('tickets')
      .insert({
        user_id: userId,
        venue_id: venueId,
        local_date: today
      })

    if (error) {
      console.error('Error using ticket:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error using ticket:', error)
    return false
  }
}

/**
 * Verifica si el usuario ya usó su ticket hoy
 */
export async function checkTicketUsedToday(userId: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tickets')
      .select('id')
      .eq('user_id', userId)
      .eq('local_date', today)
      .limit(1)
    
    if (error) {
      console.error('Error checking ticket:', error)
      return false
    }

    return !!(data && data.length > 0)
  } catch (error) {
    console.error('Error checking ticket:', error)
    return false
  }
}

/**
 * Obtiene el historial de tickets del usuario
 */
export async function getUserTicketHistory(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        venues (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching ticket history:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching ticket history:', error)
    return []
  }
}
