/**
 * Configuración de React Query
 * Gestión optimizada de estado del servidor
 */

import { QueryClient } from '@tanstack/react-query';
import { logger } from './logger';

/**
 * Configuración del QueryClient
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Tiempo que los datos se consideran "frescos"
      staleTime: 1000 * 60 * 5, // 5 minutos
      
      // Tiempo que los datos se mantienen en caché
      gcTime: 1000 * 60 * 30, // 30 minutos (antes cacheTime)
      
      // Reintentar en caso de error
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch automático
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Reintentar mutaciones fallidas
      retry: 1,
    },
  },
});

/**
 * Query Keys - Centraliza las keys para consistencia
 */
export const queryKeys = {
  // Venues
  venues: ['venues'] as const,
  venue: (id: string) => ['venues', id] as const,
  venuesFiltered: (filters: any) => ['venues', 'filtered', filters] as const,
  
  // User
  user: ['user'] as const,
  profile: (userId: string) => ['profile', userId] as const,
  
  // Tickets
  tickets: (userId: string) => ['tickets', userId] as const,
  ticketStatus: (userId: string) => ['tickets', 'status', userId] as const,
  ticketHistory: (userId: string) => ['tickets', 'history', userId] as const,
  
  // Social
  socialFeed: ['social', 'feed'] as const,
  socialPosts: (userId: string) => ['social', 'posts', userId] as const,
  
  // Friends
  friends: (userId: string) => ['friends', userId] as const,
  friendRequests: (userId: string) => ['friends', 'requests', userId] as const,
  friendProfile: (friendId: string) => ['friends', 'profile', friendId] as const,
  
  // Activity
  activityFeed: (userId: string) => ['activity', 'feed', userId] as const,
  
  // Favorites
  favorites: (userId: string) => ['favorites', userId] as const,
  
  // Points
  userPoints: (userId: string) => ['points', userId] as const,
  pointsHistory: (userId: string) => ['points', 'history', userId] as const,
  leaderboard: ['points', 'leaderboard'] as const,
};

/**
 * Helpers para invalidar queries
 */
export const invalidateQueries = {
  venues: () => queryClient.invalidateQueries({ queryKey: queryKeys.venues }),
  
  venue: (id: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.venue(id) }),
  
  userProfile: (userId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.profile(userId) }),
  
  tickets: (userId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.tickets(userId) }),
  
  friends: (userId: string) => 
    queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId) }),
  
  socialFeed: () => 
    queryClient.invalidateQueries({ queryKey: queryKeys.socialFeed }),
  
  all: () => queryClient.invalidateQueries(),
};

/**
 * Helpers para prefetch (cargar datos antes de que se necesiten)
 */
export const prefetchQueries = {
  venues: async () => {
    const { getVenues } = await import('./api/venues');
    await queryClient.prefetchQuery({
      queryKey: queryKeys.venues,
      queryFn: getVenues,
    });
  },
  
  userProfile: async (userId: string) => {
    const { supabase } = await import('./supabase');
    await queryClient.prefetchQuery({
      queryKey: queryKeys.profile(userId),
      queryFn: async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        return data;
      },
    });
  },
};

/**
 * Helpers para setear datos en caché manualmente
 */
export const setQueryData = {
  venue: (id: string, data: any) => 
    queryClient.setQueryData(queryKeys.venue(id), data),
  
  userProfile: (userId: string, data: any) => 
    queryClient.setQueryData(queryKeys.profile(userId), data),
  
  // Optimistic update para venues
  updateVenueCount: (venueId: string, increment: number) => {
    queryClient.setQueryData(queryKeys.venues, (old: any) => {
      if (!old) return old;
      return old.map((venue: any) => 
        venue.id === venueId 
          ? { ...venue, count_today: venue.count_today + increment }
          : venue
      );
    });
  },
};
