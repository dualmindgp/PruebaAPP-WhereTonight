import { supabase } from '@/lib/supabase'

export type ActivityType = 'ticket_used' | 'venue_favorited' | 'post_created' | 'friend_added'

/**
 * Crea una actividad en el feed
 */
export async function createActivity(
  userId: string,
  venueId: string | null,
  type: ActivityType,
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('activities')
      .insert({
        user_id: userId,
        venue_id: venueId,
        type: type,
        metadata: metadata
      })

    if (error) {
      console.error('Error creating activity:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating activity:', error)
    return false
  }
}

/**
 * Obtiene las actividades del feed (amigos + propias)
 */
export async function getFeedActivities(userId: string, limit: number = 50) {
  try {
    // Obtener IDs de amigos
    const { data: friendships } = await supabase
      .from('friendships')
      .select('friend_id')
      .eq('user_id', userId)
      .eq('status', 'accepted')

    const friendIds = friendships?.map(f => f.friend_id) || []
    const userIds = [userId, ...friendIds]

    // Obtener actividades
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles!activities_user_id_fkey (*),
        venues (*)
      `)
      .in('user_id', userIds)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching activities:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching activities:', error)
    return []
  }
}
