/**
 * Sistema de Analytics para WhereTonight
 * Trackea eventos importantes de la aplicación
 * Preparado para integrar con Google Analytics 4, Mixpanel, o Plausible
 */

import { logger } from './logger';

/**
 * Eventos de analytics de la aplicación
 */
export enum AnalyticsEvent {
  // Eventos de autenticación
  USER_SIGNED_UP = 'user_signed_up',
  USER_LOGGED_IN = 'user_logged_in',
  USER_LOGGED_OUT = 'user_logged_out',
  
  // Eventos de tickets
  TICKET_USED = 'ticket_used',
  TICKET_ATTEMPT_FAILED = 'ticket_attempt_failed',
  
  // Eventos de venues
  VENUE_VIEWED = 'venue_viewed',
  VENUE_SHARED = 'venue_shared',
  VENUE_SAVED = 'venue_saved',
  VENUE_UNSAVED = 'venue_unsaved',
  VENUE_DIRECTIONS_CLICKED = 'venue_directions_clicked',
  
  // Eventos de búsqueda y filtros
  SEARCH_PERFORMED = 'search_performed',
  FILTER_APPLIED = 'filter_applied',
  
  // Eventos de perfil
  PROFILE_VIEWED = 'profile_viewed',
  PROFILE_UPDATED = 'profile_updated',
  AVATAR_CHANGED = 'avatar_changed',
  
  // Eventos sociales
  FRIEND_REQUEST_SENT = 'friend_request_sent',
  FRIEND_REQUEST_ACCEPTED = 'friend_request_accepted',
  SOCIAL_POST_CREATED = 'social_post_created',
  
  // Eventos de navegación
  PAGE_VIEW = 'page_view',
  SCREEN_VIEW = 'screen_view',
  
  // Eventos de mapa
  MAP_MARKER_CLICKED = 'map_marker_clicked',
  MAP_ZOOMED = 'map_zoomed',
  MAP_PANNED = 'map_panned',
  CITY_CHANGED = 'city_changed',
  
  // Eventos de engagement
  APP_OPENED = 'app_opened',
  APP_BACKGROUNDED = 'app_backgrounded',
  NOTIFICATION_RECEIVED = 'notification_received',
  NOTIFICATION_CLICKED = 'notification_clicked',
  
  // Eventos de errores
  ERROR_OCCURRED = 'error_occurred',
  API_ERROR = 'api_error',
}

/**
 * Propiedades de eventos
 */
export interface EventProperties {
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Información del usuario para analytics
 */
export interface UserProperties {
  userId?: string;
  username?: string;
  email?: string;
  signupDate?: string;
  totalTicketsUsed?: number;
  level?: number;
  [key: string]: string | number | boolean | null | undefined;
}

/**
 * Clase principal de Analytics
 */
class Analytics {
  private isInitialized = false;
  private isDevelopment = process.env.NODE_ENV === 'development';
  private userId: string | null = null;
  private userProperties: UserProperties = {};

  /**
   * Inicializa el sistema de analytics
   */
  initialize(config?: { userId?: string; userProperties?: UserProperties }): void {
    if (this.isInitialized) {
      logger.warn('Analytics already initialized');
      return;
    }

    if (config?.userId) {
      this.userId = config.userId;
    }

    if (config?.userProperties) {
      this.userProperties = config.userProperties;
    }

    this.isInitialized = true;
    logger.info('Analytics initialized', { userId: this.userId });

    // TODO: Inicializar Google Analytics 4
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('config', 'GA_MEASUREMENT_ID', {
    //     user_id: this.userId,
    //     ...this.userProperties
    //   });
    // }
  }

  /**
   * Identifica al usuario actual
   */
  identify(userId: string, properties?: UserProperties): void {
    this.userId = userId;
    
    if (properties) {
      this.userProperties = { ...this.userProperties, ...properties };
    }

    logger.info('User identified', { userId, properties });

    // TODO: Enviar a analytics provider
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('set', 'user_properties', {
    //     user_id: userId,
    //     ...properties
    //   });
    // }
  }

  /**
   * Trackea un evento
   */
  track(event: AnalyticsEvent, properties?: EventProperties): void {
    if (!this.isInitialized) {
      logger.warn('Analytics not initialized, call initialize() first');
      return;
    }

    const eventData = {
      event,
      properties: {
        ...properties,
        userId: this.userId,
        timestamp: new Date().toISOString(),
        platform: this.getPlatform(),
      },
    };

    // Log en desarrollo
    if (this.isDevelopment) {
      logger.info(`[ANALYTICS] ${event}`, eventData.properties);
    }

    // TODO: Enviar a Google Analytics 4
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('event', event, properties);
    // }

    // TODO: Enviar a Mixpanel
    // if (typeof window !== 'undefined' && window.mixpanel) {
    //   window.mixpanel.track(event, properties);
    // }
  }

  /**
   * Trackea una vista de página
   */
  pageView(pageName: string, properties?: EventProperties): void {
    this.track(AnalyticsEvent.PAGE_VIEW, {
      page_name: pageName,
      ...properties,
    });
  }

  /**
   * Trackea una vista de pantalla (para móvil)
   */
  screenView(screenName: string, properties?: EventProperties): void {
    this.track(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Actualiza las propiedades del usuario
   */
  updateUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
    
    // TODO: Enviar a analytics provider
    // if (typeof window !== 'undefined' && window.gtag) {
    //   window.gtag('set', 'user_properties', properties);
    // }
  }

  /**
   * Resetea el usuario (al hacer logout)
   */
  reset(): void {
    this.userId = null;
    this.userProperties = {};
    logger.info('Analytics user reset');
  }

  /**
   * Obtiene la plataforma actual
   */
  private getPlatform(): string {
    if (typeof window === 'undefined') {
      return 'server';
    }

    // Detectar si es Capacitor (móvil nativo)
    if ((window as any).Capacitor) {
      const platform = (window as any).Capacitor.getPlatform();
      return platform === 'ios' ? 'ios' : 'android';
    }

    return 'web';
  }

  /**
   * Mide el tiempo de una operación
   */
  timeEvent(eventName: string): () => void {
    const startTime = Date.now();
    
    return () => {
      const duration = Date.now() - startTime;
      this.track(eventName as AnalyticsEvent, {
        duration_ms: duration,
      });
    };
  }
}

// Exportar instancia singleton
export const analytics = new Analytics();

/**
 * Helpers para eventos comunes
 */
export const trackEvent = {
  // Autenticación
  signUp: (method: string) => 
    analytics.track(AnalyticsEvent.USER_SIGNED_UP, { method }),
  
  login: (method: string) => 
    analytics.track(AnalyticsEvent.USER_LOGGED_IN, { method }),
  
  logout: () => 
    analytics.track(AnalyticsEvent.USER_LOGGED_OUT),

  // Tickets
  ticketUsed: (venueId: string, venueName: string) =>
    analytics.track(AnalyticsEvent.TICKET_USED, { venue_id: venueId, venue_name: venueName }),
  
  ticketFailed: (venueId: string, reason: string) =>
    analytics.track(AnalyticsEvent.TICKET_ATTEMPT_FAILED, { venue_id: venueId, reason }),

  // Venues
  venueViewed: (venueId: string, venueName: string, venueType: string) =>
    analytics.track(AnalyticsEvent.VENUE_VIEWED, { 
      venue_id: venueId, 
      venue_name: venueName,
      venue_type: venueType 
    }),
  
  venueShared: (venueId: string, method: string) =>
    analytics.track(AnalyticsEvent.VENUE_SHARED, { venue_id: venueId, method }),
  
  venueSaved: (venueId: string) =>
    analytics.track(AnalyticsEvent.VENUE_SAVED, { venue_id: venueId }),

  // Búsqueda
  search: (query: string, resultsCount: number) =>
    analytics.track(AnalyticsEvent.SEARCH_PERFORMED, { query, results_count: resultsCount }),
  
  filterApplied: (filters: Record<string, any>) =>
    analytics.track(AnalyticsEvent.FILTER_APPLIED, filters),

  // Perfil
  profileViewed: (profileUserId: string) =>
    analytics.track(AnalyticsEvent.PROFILE_VIEWED, { profile_user_id: profileUserId }),
  
  profileUpdated: (fields: string[]) =>
    analytics.track(AnalyticsEvent.PROFILE_UPDATED, { fields: fields.join(',') }),

  // Social
  friendRequestSent: (friendId: string) =>
    analytics.track(AnalyticsEvent.FRIEND_REQUEST_SENT, { friend_id: friendId }),
  
  socialPostCreated: (hasImage: boolean, hasVenue: boolean) =>
    analytics.track(AnalyticsEvent.SOCIAL_POST_CREATED, { has_image: hasImage, has_venue: hasVenue }),

  // Mapa
  mapMarkerClicked: (venueId: string) =>
    analytics.track(AnalyticsEvent.MAP_MARKER_CLICKED, { venue_id: venueId }),
  
  cityChanged: (cityName: string, country: string) =>
    analytics.track(AnalyticsEvent.CITY_CHANGED, { city_name: cityName, country }),

  // Errores
  error: (errorCode: string, errorMessage: string, context?: Record<string, any>) =>
    analytics.track(AnalyticsEvent.ERROR_OCCURRED, { 
      error_code: errorCode, 
      error_message: errorMessage,
      ...context 
    }),
};

/**
 * Hook para trackear tiempo en pantalla
 */
export function useScreenTracking(screenName: string) {
  const startTime = Date.now();

  return () => {
    const duration = Date.now() - startTime;
    analytics.track(AnalyticsEvent.SCREEN_VIEW, {
      screen_name: screenName,
      duration_ms: duration,
    });
  };
}
