/**
 * React Query hooks para Venues
 * Reemplaza el VenueContext con gestión de estado optimizada
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVenues, getVenueById } from '@/lib/api/venues';
import { queryKeys } from '@/lib/query-client';
import { VenueWithCount } from '@/lib/database.types';
import { logger } from '@/lib/logger';

/**
 * Hook para obtener todos los venues
 */
export function useVenues() {
  const query = useQuery({
    queryKey: queryKeys.venues,
    queryFn: getVenues,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Log errors
  React.useEffect(() => {
    if (query.error) {
      logger.error('Error fetching venues', query.error);
    }
  }, [query.error]);

  return query;
}

/**
 * Hook para obtener un venue específico
 */
export function useVenue(venueId: string | null) {
  const query = useQuery({
    queryKey: queryKeys.venue(venueId || ''),
    queryFn: () => getVenueById(venueId!),
    enabled: !!venueId, // Solo ejecutar si hay venueId
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Log errors
  React.useEffect(() => {
    if (query.error) {
      logger.error('Error fetching venue', query.error, { venueId });
    }
  }, [query.error, venueId]);

  return query;
}

/**
 * Hook para venues filtrados (client-side filtering)
 */
export function useFilteredVenues(filters?: {
  priceRange?: string[];
  minRating?: number;
  sortBy?: 'popularity' | 'rating' | 'price';
  searchQuery?: string;
}) {
  const venuesQuery = useVenues();
  const venues = venuesQuery.data || [];

  const filteredVenues = React.useMemo(() => {
    let result = [...venues];

    // Filtrar por búsqueda
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(v => 
        v.name.toLowerCase().includes(query) ||
        v.address?.toLowerCase().includes(query)
      );
    }

    // Filtrar por precio
    if (filters?.priceRange && filters.priceRange.length > 0) {
      result = result.filter(v => {
        if (!v.avg_price_text) return false;
        return filters.priceRange!.some(price => 
          v.avg_price_text?.includes(price)
        );
      });
    }

    // Filtrar por rating
    if (filters?.minRating && filters.minRating > 0) {
      result = result.filter(v => (v.rating || 0) >= filters.minRating!);
    }

    // Ordenar
    if (filters?.sortBy === 'popularity') {
      result.sort((a, b) => b.count_today - a.count_today);
    } else if (filters?.sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (filters?.sortBy === 'price') {
      result.sort((a, b) => {
        const priceA = (a.avg_price_text?.match(/\$/g) || []).length;
        const priceB = (b.avg_price_text?.match(/\$/g) || []).length;
        return priceA - priceB;
      });
    }

    return result;
  }, [venues, filters]);

  return {
    venues: filteredVenues,
    isLoading: venuesQuery.isLoading,
    error: venuesQuery.error,
    refetch: venuesQuery.refetch,
  };
}

/**
 * Hook para actualizar el conteo de un venue (optimistic update)
 */
export function useUpdateVenueCount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ venueId, increment }: { venueId: string; increment: number }) => {
      // Esta es una actualización optimista, no hace llamada real a la API
      return { venueId, increment };
    },
    onMutate: async ({ venueId, increment }) => {
      // Cancelar queries en curso
      await queryClient.cancelQueries({ queryKey: queryKeys.venues });

      // Snapshot del estado anterior
      const previousVenues = queryClient.getQueryData<VenueWithCount[]>(queryKeys.venues);

      // Actualización optimista
      queryClient.setQueryData<VenueWithCount[]>(queryKeys.venues, (old) => {
        if (!old) return old;
        return old.map(venue =>
          venue.id === venueId
            ? { ...venue, count_today: venue.count_today + increment }
            : venue
        );
      });

      return { previousVenues };
    },
    onError: (err, variables, context) => {
      // Revertir en caso de error
      if (context?.previousVenues) {
        queryClient.setQueryData(queryKeys.venues, context.previousVenues);
      }
      logger.error('Error updating venue count', err);
    },
    onSettled: () => {
      // Refetch después de éxito o error
      queryClient.invalidateQueries({ queryKey: queryKeys.venues });
    },
  });
}

// Necesitamos importar React para useMemo
import React from 'react';
