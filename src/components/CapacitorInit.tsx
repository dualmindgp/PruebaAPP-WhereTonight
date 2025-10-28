'use client'

import { useEffect } from 'react'
import { configureNativeUI } from '@/lib/capacitor-config'
import { App } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

/**
 * Componente para inicializar Capacitor al montar la app
 */
export default function CapacitorInit() {
  useEffect(() => {
    // Configurar UI nativa cuando la app se monte
    configureNativeUI()

    // Listener para deep links (OAuth callback)
    if (Capacitor.isNativePlatform()) {
      let listenerHandle: any = null
      
      App.addListener('appUrlOpen', (data) => {
        console.log('App opened with URL:', data.url)
        
        // Si la URL contiene el hash de autenticación de Supabase
        if (data.url.includes('login-callback')) {
          // Redirigir a la página principal con el hash
          const url = new URL(data.url)
          const hash = url.hash || url.search
          
          if (hash) {
            // Recargar la página con el hash para que Supabase lo procese
            window.location.href = '/' + hash
          }
        }
      }).then(handle => {
        listenerHandle = handle
      })

      // Cleanup
      return () => {
        if (listenerHandle) {
          listenerHandle.remove()
        }
      }
    }
  }, [])

  return null // No renderiza nada
}
