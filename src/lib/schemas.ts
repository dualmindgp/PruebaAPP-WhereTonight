import { z } from 'zod';

/**
 * Schemas de validación para tipos de datos de la aplicación
 * Proporciona type-safety y validación en runtime
 */

// Schema para coordenadas geográficas
export const CoordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

// Schema para Venue
export const VenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  type: z.enum(['club', 'bar', 'restaurant', 'other']),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().nullable(),
  rating: z.number().min(0).max(5).optional().nullable(),
  avg_price_text: z.string().nullable(),
  photo_ref: z.string().optional().nullable(),
  photo_refs: z.array(z.string()).optional().nullable(),
  count_today: z.number().int().min(0).default(0),
  place_id: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  opening_hours: z.any().optional().nullable(),
  tickets_url: z.string().nullable(),
  maps_url: z.string().nullable(),
  is_active: z.boolean().default(true),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}).passthrough(); // Permite campos adicionales sin fallar

export const VenueArraySchema = z.array(VenueSchema);

// Schema para Ticket
export const TicketSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  used_at: z.string(),
  created_at: z.string(),
});

// Schema para Profile
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  username: z.string().min(3).max(30).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatar_url: z.string().url().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

// Schema para Activity
export const ActivitySchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  venue_id: z.string().uuid(),
  activity_type: z.enum(['ticket_used', 'venue_saved', 'venue_shared', 'check_in']),
  created_at: z.string(),
});

// Schema para Friendship
export const FriendshipSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  friend_id: z.string().uuid(),
  status: z.enum(['pending', 'accepted', 'rejected']),
  created_at: z.string(),
  updated_at: z.string().optional(),
});

// Schema para Social Post
export const SocialPostSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  venue_id: z.string().uuid().optional().nullable(),
  content: z.string().min(1).max(1000),
  image_url: z.string().url().optional().nullable(),
  created_at: z.string(),
});

// Schema para User Points
export const UserPointsSchema = z.object({
  user_id: z.string().uuid(),
  total_points: z.number().int().min(0),
  level: z.number().int().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});

// Schema para Points Transaction
export const PointsTransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  action: z.string(),
  points: z.number().int(),
  metadata: z.any().optional().nullable(),
  created_at: z.string(),
});

// Tipos TypeScript inferidos de los schemas
export type ValidatedVenue = z.infer<typeof VenueSchema>;
export type ValidatedTicket = z.infer<typeof TicketSchema>;
export type ValidatedProfile = z.infer<typeof ProfileSchema>;
export type ValidatedActivity = z.infer<typeof ActivitySchema>;
export type ValidatedFriendship = z.infer<typeof FriendshipSchema>;
export type ValidatedSocialPost = z.infer<typeof SocialPostSchema>;
export type ValidatedUserPoints = z.infer<typeof UserPointsSchema>;
export type ValidatedPointsTransaction = z.infer<typeof PointsTransactionSchema>;

/**
 * Helper para validar datos de manera segura
 * Retorna los datos validados o null si falla
 */
export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error('Validation error:', error);
    return null;
  }
}

/**
 * Helper para validar arrays de manera segura
 * Filtra elementos inválidos en lugar de fallar completamente
 */
export function safeValidateArray<T>(schema: z.ZodSchema<T>, data: unknown[]): T[] {
  return data
    .map(item => safeValidate(schema, item))
    .filter((item): item is T => item !== null);
}
