# 📦 CÓDIGO COMPLETO: MIGRACIÓN DE API ROUTES

Este documento contiene todo el código necesario para migrar las API Routes a funciones client-side.

---

## 📁 Estructura de carpetas a crear

```
src/lib/api/
├── index.ts           # Re-exports
├── venues.ts          # Gestión de venues
├── tickets.ts         # Sistema de tickets
├── activity.ts        # Feed de actividades
├── friendships.ts     # Sistema de amigos
├── social-posts.ts    # Posts sociales
└── photos.ts          # URLs de fotos
```

---

## 1️⃣ `src/lib/api/venues.ts`

```typescript
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
```

---

## 2️⃣ `src/lib/api/tickets.ts`

```typescript
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

/**
 * Obtiene los tickets usados en un venue específico hoy
 */
export async function getVenueTicketsToday(venueId: string) {
  try {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        profiles (username, avatar_url)
      `)
      .eq('venue_id', venueId)
      .eq('local_date', today)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching venue tickets:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching venue tickets:', error)
    return []
  }
}
```

---

## 3️⃣ `src/lib/api/activity.ts`

```typescript
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

/**
 * Obtiene actividades de un usuario específico
 */
export async function getUserActivities(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('activities')
      .select(`
        *,
        venues (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user activities:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user activities:', error)
    return []
  }
}
```

---

## 4️⃣ `src/lib/api/friendships.ts`

```typescript
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
 * Rechaza solicitud de amistad
 */
export async function rejectFriendRequest(friendshipId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('friendships')
      .delete()
      .eq('id', friendshipId)

    if (error) {
      console.error('Error rejecting friend request:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error rejecting friend request:', error)
    return false
  }
}

/**
 * Elimina una amistad
 */
export async function removeFriend(userId: string, friendId: string): Promise<boolean> {
  try {
    // Eliminar en ambas direcciones
    const { error: error1 } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id', userId)
      .eq('friend_id', friendId)

    const { error: error2 } = await supabase
      .from('friendships')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_id', userId)

    if (error1 || error2) {
      console.error('Error removing friend:', error1 || error2)
      return false
    }

    return true
  } catch (error) {
    console.error('Error removing friend:', error)
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

/**
 * Obtiene solicitudes pendientes
 */
export async function getPendingRequests(userId: string) {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select(`
        *,
        profiles!friendships_user_id_fkey (*)
      `)
      .eq('friend_id', userId)
      .eq('status', 'pending')

    if (error) {
      console.error('Error fetching pending requests:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    return []
  }
}

/**
 * Verifica si dos usuarios son amigos
 */
export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('friendships')
      .select('id')
      .or(`and(user_id.eq.${userId1},friend_id.eq.${userId2}),and(user_id.eq.${userId2},friend_id.eq.${userId1})`)
      .eq('status', 'accepted')
      .limit(1)

    if (error) {
      console.error('Error checking friendship:', error)
      return false
    }

    return !!(data && data.length > 0)
  } catch (error) {
    console.error('Error checking friendship:', error)
    return false
  }
}
```

---

## 5️⃣ `src/lib/api/social-posts.ts`

```typescript
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

/**
 * Obtiene posts de un usuario específico
 */
export async function getUserPosts(userId: string, limit: number = 50) {
  try {
    const { data, error } = await supabase
      .from('social_posts')
      .select(`
        *,
        venues (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching user posts:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user posts:', error)
    return []
  }
}

/**
 * Elimina un post
 */
export async function deletePost(postId: string, userId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('social_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', userId) // Solo el autor puede eliminar

    if (error) {
      console.error('Error deleting post:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting post:', error)
    return false
  }
}
```

---

## 6️⃣ `src/lib/api/photos.ts`

```typescript
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
```

---

## 7️⃣ `src/lib/api/index.ts`

```typescript
// Re-exports de todas las funciones API
export * from './venues'
export * from './tickets'
export * from './activity'
export * from './friendships'
export * from './social-posts'
export * from './photos'
```

---

## ✅ CÓMO ACTUALIZAR COMPONENTES

### Ejemplo: `src/contexts/VenueContext.tsx`

**ANTES:**
```typescript
const loadVenues = async () => {
  const response = await fetch('/api/venues')
  if (!response.ok) throw new Error('Failed')
  const data = await response.json()
  setVenues(data)
}
```

**DESPUÉS:**
```typescript
import { getVenues } from '@/lib/api'

const loadVenues = async () => {
  const data = await getVenues()
  setVenues(data)
}
```

### Ejemplo: `src/app/page.tsx`

**ANTES:**
```typescript
const handleUseTicket = async (venueId: string) => {
  const response = await fetch('/api/ticket', {
    method: 'POST',
    body: JSON.stringify({ userId: user.id, venueId })
  })
  return response.ok
}
```

**DESPUÉS:**
```typescript
import { useTicket, createActivity } from '@/lib/api'

const handleUseTicket = async (venueId: string) => {
  const success = await useTicket(user.id, venueId)
  if (success) {
    await createActivity(user.id, venueId, 'ticket_used')
  }
  return success
}
```

---

## 🔍 BUSCAR Y REEMPLAZAR

Usa estos comandos para encontrar todas las llamadas API:

```bash
# Buscar fetch a /api/
grep -r "fetch('/api/" src/

# Buscar fetch con /api/ en template strings
grep -r 'fetch(`/api/' src/

# Buscar fetch con variables
grep -r 'fetch.*api' src/
```

**Archivos principales a revisar:**
- `src/contexts/VenueContext.tsx`
- `src/app/page.tsx`
- `src/components/SocialFeed.tsx`
- `src/components/FriendsScreen.tsx`
- `src/components/ActivityFeed.tsx`
- `src/components/VenueSheet.tsx`
- Cualquier componente que use `fetch(`

---

## 📝 NOTAS IMPORTANTES

1. **Error handling**: Todas las funciones retornan valores por defecto (`[]` o `false`) en caso de error
2. **Logs**: Los errores se logean en consola para debugging
3. **Tipos**: Usa los tipos de `database.types.ts` cuando sea posible
4. **Async/Await**: Todas las funciones son async, recuerda usar `await`
5. **Supabase client**: Todas usan el cliente de `@/lib/supabase`
