import { createClient } from '@supabase/supabase-js'
import { Capacitor } from '@capacitor/core'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided!')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Para Capacitor: usar PKCE flow y detectar sesión en URL
    flowType: Capacitor.isNativePlatform() ? 'pkce' : 'implicit',
    detectSessionInUrl: true
  }
})

// Helper para obtener la redirect URL correcta según la plataforma
export const getAuthRedirectUrl = () => {
  return Capacitor.isNativePlatform() 
    ? 'com.wheretonight.app://login-callback'
    : window.location.origin
}