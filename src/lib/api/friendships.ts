import { supabase } from '@/lib/supabase'

/**
 * Envía solicitud de amistad
 */
export async function sendFriendRequest(
  fromUserId: string,
  toUserId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .insert({
        user_id: fromUserId,
        friend_id: toUserId,
        status: 'pending'
      })

    if (error) {
      console.error('Error sending friend request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending friend request:', error)
    return false
  }
}

/**
 * Acepta solicitud de amistad
 */
export async function acceptFriendRequest(friendshipId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .update({ status: 'accepted' })
      .eq('id', friendshipId)

    if (error) {
      console.error('Error accepting friend request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error accepting friend request:', error)
    return false
  }
}

/**
 * Obtiene la lista de amigos
 */
export async function getFriends(userId: string) {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        profiles!friendships_friend_id_fkey (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted')

    if (error) {
      console.error('Error fetching friends:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching friends:', error)
    return []
  }
}
