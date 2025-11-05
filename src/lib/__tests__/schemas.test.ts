/**
 * Tests para los schemas de validación Zod
 */

import { 
  VenueSchema, 
  ProfileSchema, 
  TicketSchema,
  safeValidate,
  safeValidateArray 
} from '../schemas';

describe('Schemas', () => {
  describe('VenueSchema', () => {
    it('should validate a valid venue', () => {
      const validVenue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Club',
        type: 'club',
        lat: 52.2297,
        lng: 21.0122,
        address: 'Test Street 123',
        rating: 4.5,
        avg_price_text: '$$',
        count_today: 10,
        tickets_url: null,
        maps_url: null,
        is_active: true,
      };

      const result = VenueSchema.safeParse(validVenue);
      expect(result.success).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      const invalidVenue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Club',
        type: 'club',
        lat: 100, // Invalid: > 90
        lng: 21.0122,
        address: null,
        avg_price_text: null,
        count_today: 0,
        tickets_url: null,
        maps_url: null,
        is_active: true,
      };

      const result = VenueSchema.safeParse(invalidVenue);
      expect(result.success).toBe(false);
    });

    it('should reject invalid venue type', () => {
      const invalidVenue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Place',
        type: 'invalid_type',
        lat: 52.2297,
        lng: 21.0122,
        address: null,
        avg_price_text: null,
        count_today: 0,
        tickets_url: null,
        maps_url: null,
        is_active: true,
      };

      const result = VenueSchema.safeParse(invalidVenue);
      expect(result.success).toBe(false);
    });

    it('should accept optional fields as null', () => {
      const venue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Club',
        type: 'club',
        lat: 52.2297,
        lng: 21.0122,
        address: null,
        rating: null,
        avg_price_text: null,
        photo_ref: null,
        count_today: 0,
        tickets_url: null,
        maps_url: null,
        is_active: true,
      };

      const result = VenueSchema.safeParse(venue);
      expect(result.success).toBe(true);
    });
  });

  describe('ProfileSchema', () => {
    it('should validate a valid profile', () => {
      const validProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg',
      };

      const result = ProfileSchema.safeParse(validProfile);
      expect(result.success).toBe(true);
    });

    it('should reject username shorter than 3 characters', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'ab',
        bio: null,
        avatar_url: null,
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });

    it('should reject invalid avatar URL', () => {
      const invalidProfile = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        bio: null,
        avatar_url: 'not-a-url',
      };

      const result = ProfileSchema.safeParse(invalidProfile);
      expect(result.success).toBe(false);
    });
  });

  describe('TicketSchema', () => {
    it('should validate a valid ticket', () => {
      const validTicket = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        venue_id: '123e4567-e89b-12d3-a456-426614174002',
        used_at: '2025-11-05T00:00:00Z',
        created_at: '2025-11-05T00:00:00Z',
      };

      const result = TicketSchema.safeParse(validTicket);
      expect(result.success).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      const invalidTicket = {
        id: 'not-a-uuid',
        user_id: '123e4567-e89b-12d3-a456-426614174001',
        venue_id: '123e4567-e89b-12d3-a456-426614174002',
        used_at: '2025-11-05T00:00:00Z',
        created_at: '2025-11-05T00:00:00Z',
      };

      const result = TicketSchema.safeParse(invalidTicket);
      expect(result.success).toBe(false);
    });
  });

  describe('safeValidate', () => {
    it('should return validated data on success', () => {
      const data = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        username: 'testuser',
        bio: null,
        avatar_url: null,
      };

      const result = safeValidate(ProfileSchema, data);
      expect(result).not.toBeNull();
      expect(result?.username).toBe('testuser');
    });

    it('should return null on validation failure', () => {
      const invalidData = {
        id: 'not-a-uuid',
        username: 'ab', // Too short
        bio: null,
        avatar_url: null,
      };

      const result = safeValidate(ProfileSchema, invalidData);
      expect(result).toBeNull();
    });
  });

  describe('safeValidateArray', () => {
    it('should filter out invalid items', () => {
      const data = [
        {
          id: '123e4567-e89b-12d3-a456-426614174000',
          username: 'user1',
          bio: null,
          avatar_url: null,
        },
        {
          id: 'invalid-uuid',
          username: 'user2',
          bio: null,
          avatar_url: null,
        },
        {
          id: '123e4567-e89b-12d3-a456-426614174001',
          username: 'user3',
          bio: null,
          avatar_url: null,
        },
      ];

      const result = safeValidateArray(ProfileSchema, data);
      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('user1');
      expect(result[1].username).toBe('user3');
    });

    it('should return empty array if all items are invalid', () => {
      const invalidData = [
        { id: 'invalid', username: 'ab' },
        { id: 'invalid2', username: 'x' },
      ];

      const result = safeValidateArray(ProfileSchema, invalidData);
      expect(result).toHaveLength(0);
    });
  });
});
