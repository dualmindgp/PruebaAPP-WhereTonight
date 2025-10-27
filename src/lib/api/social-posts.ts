import { supabase } from '@/lib/supabase'

/**
 * Crea un post en el feed social
 */
export async function createPost(
  userId: string,
  content: string,
  venueId?: string | null
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('social_posts')
      .insert({
        user_id: userId,
        content: content,
        venue_id: venueId || null
      })

    if (error) {
      console.error('Error creating post:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error creating post:', error)
    return false
  }
}

/**
 * Obtiene posts del feed social
 */
export async function getSocialPosts(userId?: string, limit: number = 50) {
  try {
    let query = supabase
      .from('social_posts')
      .select(`
        *,
        profiles (*),
        venues (*)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Si hay userId, filtrar por amigos + propios
    if (userId) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('friend_id')
        .eq('user_id', userId)
        .eq('status', 'accepted')

      const friendIds = friendships?.map(f => f.friend_id) || []
      const userIds = [userId, ...friendIds]
      
      query = query.in('user_id', userIds)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching posts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}
