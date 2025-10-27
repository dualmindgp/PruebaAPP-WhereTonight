'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { VenueWithCount } from '@/lib/database.types'
import { getVenues } from '@/lib/api/venues'

interface VenueContextType {
  venues: VenueWithCount[]
  setVenues: (venues: VenueWithCount[]) => void
  loadVenues: () => Promise<void>
  isLoading: boolean
}

const VenueContext = createContext<VenueContextType | undefined>(undefined)

export function VenueProvider({ children }: { children: ReactNode }) {
  const [venues, setVenues] = useState<VenueWithCount[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadVenues = async () => {
    if (isLoading) return // Evitar cargas duplicadas
    
    try {
      setIsLoading(true)
      // Llamada directa a Supabase via función client-side
      const data = await getVenues()
      setVenues(data)
    } catch (error) {
      console.error('Error loading venues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar venues al montar el componente
  useEffect(() => {
    loadVenues()
  }, [])

  return (
    <VenueContext.Provider value={{ venues, setVenues, loadVenues, isLoading }}>
      {children}
    </VenueContext.Provider>
  )
}

export function useVenues() {
  const context = useContext(VenueContext)
  if (context === undefined) {
    throw new Error('useVenues must be used within a VenueProvider')
  }
  return context
}
