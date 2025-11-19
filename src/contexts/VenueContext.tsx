'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { VenueWithCount } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'

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
      console.log('📍 Cargando venues desde Supabase...')
      
      // Cargar venues directamente desde Supabase
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name')
      
      if (error) {
        console.error('❌ Error loading venues from Supabase:', error)
        return
      }
      
      if (data) {
        console.log(`✅ Cargados ${data.length} venues`)
        setVenues(data as VenueWithCount[])
      }
    } catch (error) {
      console.error('❌ Error loading venues:', error)
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
