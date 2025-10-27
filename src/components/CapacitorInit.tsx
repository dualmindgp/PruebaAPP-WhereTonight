'use client'

import { useEffect } from 'react'
import { configureNativeUI } from '@/lib/capacitor-config'

/**
 * Componente para inicializar Capacitor al montar la app
 */
export default function CapacitorInit() {
  useEffect(() => {
    // Configurar UI nativa cuando la app se monte
    configureNativeUI()
  }, [])

  return null // No renderiza nada
}
