import { StatusBar, Style } from '@capacitor/status-bar'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Capacitor } from '@capacitor/core'

/**
 * Configura la UI nativa de la aplicación
 */
export async function configureNativeUI() {
  if (!Capacitor.isNativePlatform()) return
  
  try {
    // Configurar Status Bar
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0f0f1e' }) // Fondo oscuro
    await StatusBar.setOverlaysWebView({ overlay: false })
    
    console.log('✅ Status Bar configurada')
  } catch (error) {
    console.error('Error configurando Status Bar:', error)
  }
}

/**
 * Provee feedback háptico para acciones
 */
export async function triggerHaptic(style: 'light' | 'medium' | 'heavy' = 'medium') {
  if (!Capacitor.isNativePlatform()) return
  
  try {
    const impactStyles = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy
    }
    
    await Haptics.impact({ style: impactStyles[style] })
  } catch (error) {
    // Silenciar errores de haptics ya que no es crítico
    console.debug('Haptics not available:', error)
  }
}

/**
 * Haptic notification para acciones importantes
 */
export async function triggerNotificationHaptic(type: NotificationType = NotificationType.Success) {
  if (!Capacitor.isNativePlatform()) return
  
  try {
    await Haptics.notification({ type })
  } catch (error) {
    console.debug('Haptics notification not available:', error)
  }
}

/**
 * Vibración de selección
 */
export async function triggerSelectionHaptic() {
  if (!Capacitor.isNativePlatform()) return
  
  try {
    await Haptics.selectionStart()
    setTimeout(async () => {
      await Haptics.selectionEnd()
    }, 50)
  } catch (error) {
    console.debug('Selection haptic not available:', error)
  }
}
