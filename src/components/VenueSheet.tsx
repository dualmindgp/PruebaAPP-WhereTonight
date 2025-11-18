'use client'

import React, { useState, useEffect } from 'react'
import { X, Star, DollarSign, MapPin, Globe, Image, ExternalLink, Bookmark, Navigation, Share2 } from 'lucide-react'
import { VenueWithCount } from '@/lib/database.types'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase'
import PhotoCarousel from './PhotoCarousel'
import ConfirmTicketModal from './ConfirmTicketModal'
import { logger, withErrorHandling } from '@/lib/logger'
import { useToastContext } from '@/contexts/ToastContext'
import { shareVenue } from '@/lib/share'
import { addPoints, PointAction } from '@/lib/points-system'
import { getPhotoUrl } from '@/lib/api/photos'

interface VenueSheetProps {
  venue: VenueWithCount
  isOpen: boolean
  onClose: () => void
  onUseTicket: (venueId: string) => Promise<boolean>
  hasUsedTicketToday: boolean
  userId?: string | null
}

export default function VenueSheet({ 
  venue, 
  isOpen, 
  onClose,
  onUseTicket,
  hasUsedTicketToday,
  userId
}: VenueSheetProps) {
  const { t } = useLanguage()
  const toast = useToastContext()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSharing, setIsSharing] = useState(false)

  // Verificar si el venue está guardado
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!userId || !venue.id) return
      
      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userId)
          .eq('venue_id', venue.id)
          .single()
        
        setIsSaved(!!data)
      } catch (error) {
        // No está guardado
        setIsSaved(false)
      }
    }

    if (isOpen) {
      checkIfSaved()
    }
  }, [userId, venue.id, isOpen])
  
  // Si no está abierto, no renderizamos nada
  if (!isOpen) return null

  const handleClickGoingButton = () => {
    // TESTING MODE: Permitir múltiples tickets
    // if (hasUsedTicketToday || isSubmitting) return
    if (isSubmitting) return
    setShowConfirmModal(true)
  }

  const handleConfirmTicket = async (shareToStory: boolean) => {
    setShowConfirmModal(false)
    setIsSubmitting(true)
    
    logger.info('Usuario usando ticket', { venueId: venue.id, userId, shareToStory })
    
    try {
      const success = await onUseTicket(venue.id)
      
      console.log('onUseTicket result:', success)
      
      if (success) {
        toast.success('¡Nos vemos allí!')
        logger.trackEvent('ticket_used', { venueId: venue.id, venueName: venue.name })
        
        // Si el usuario quiere compartir en historia, crear el post automático
        if (shareToStory && userId) {
          console.log('✓ Conditions met: shareToStory=true, userId=', userId)
          try {
            await createTicketStory(venue, userId)
            toast.success('¡Historia compartida! 🎉')
            
            // IMPORTANTE: Esperar un momento para que la BD procese el insert
            await new Promise(resolve => setTimeout(resolve, 500))
            
            // Recargar la página para que aparezca la nueva historia
            // Nota: Idealmente esto debería actualizarse automáticamente, 
            // pero como fix rápido recargamos
            console.log('Story created! Reloading to show it...')
            window.location.reload()
          } catch (error) {
            console.error('Error creating ticket story:', error)
            toast.error('No se pudo compartir la historia, pero tu entrada está confirmada')
          }
        } else {
          console.log('✗ Conditions NOT met: shareToStory=', shareToStory, 'userId=', userId)
        }
      } else {
        console.error('✗ onUseTicket returned FALSE - ticket creation failed')
        toast.error('No se pudo usar el ticket')
      }
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Función para crear historia automática al comprar entrada
  const createTicketStory = async (venue: VenueWithCount, userId: string) => {
    try {
      // Obtener la primera foto del venue usando el helper centralizado
      const photos = (venue as any).photos as string[] | undefined
      const photoRef = photos && photos.length > 0 ? photos[0] : venue.photo_ref || null
      const photoUrl = photoRef ? getPhotoUrl(photoRef, venue.type || 'other') : getPhotoUrl(null, venue.type || 'other')
      
      const city = (venue as any).city || 'Madrid'
      
      // Obtener coordenadas del venue o usar coordenadas por defecto
      const cityLat = (venue as any).lat || venue.lat || 40.4168 // Madrid por defecto
      const cityLng = (venue as any).lng || venue.lng || -3.7038
      
      console.log('Creating ticket story with data:', {
        userId,
        venueName: venue.name,
        venueId: venue.id,
        photoUrl,
        city,
        cityLat,
        cityLng
      })
      
      // Crear post con formato predefinido especial
      // NOTA: Si falla, puede ser que los campos nuevos no existan en la BD
      // Primero intenta con todos los campos nuevos
      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          content: `¡Voy a ${venue.name} esta noche! 🎉`,
          venue_id: venue.id,
          venue_name: venue.name,
          venue_photo: photoUrl,
          audience: 'public',
          is_ticket_story: true,
          city: city,
          city_lat: cityLat,
          city_lng: cityLng
        })
        .select()
      
      if (error) {
        console.error('Error creating ticket story (with new fields):', error)
        
        // Si falla por campos inexistentes, crear sin los campos nuevos
        console.log('Trying to create story without new fields...')
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('social_posts')
          .insert({
            user_id: userId,
            content: `¡Voy a ${venue.name} esta noche! 🎉 (${venue.id})`,
            audience: 'public',
            city: city,
            city_lat: cityLat,
            city_lng: cityLng
          })
          .select()
        
        if (fallbackError) {
          console.error('Error creating ticket story (fallback):', fallbackError)
          throw fallbackError
        }
        
        console.log('Story created successfully (fallback mode):', fallbackData)
        return
      }
      
      console.log('Story created successfully:', data)
    } catch (error) {
      console.error('Unexpected error in createTicketStory:', error)
      throw error
    }
  }

  const handleCancelTicket = () => {
    setShowConfirmModal(false)
  }

  const handleSaveVenue = async () => {
    if (!userId) {
      toast.warning('Debes iniciar sesión para guardar favoritos')
      return
    }

    setIsSaving(true)

    const action = isSaved ? 'remove' : 'add'
    
    const success = await withErrorHandling(
      async () => {
        if (isSaved) {
          // Quitar de favoritos
          const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('venue_id', venue.id)

          if (error) throw error
          return 'removed'
        } else {
          // Añadir a favoritos
          const { error } = await supabase
            .from('favorites')
            .insert({
              user_id: userId,
              venue_id: venue.id
            })

          if (error) throw error
          return 'added'
        }
      },
      `Error al ${action === 'add' ? 'guardar' : 'quitar'} favorito`,
      { userId, venueId: venue.id, action }
    )

    setIsSaving(false)

    if (success === 'added') {
      setIsSaved(true)
      toast.success('¡Guardado en favoritos!')
      logger.trackEvent('venue_favorited', { venueId: venue.id, venueName: venue.name })
      
      // Añadir puntos
      if (userId) {
        try {
          await addPoints(userId, PointAction.VENUE_SAVED)
          toast.success('¡+5 puntos! ⭐')
        } catch (error) {
          console.error('Error adding points:', error)
        }
      }
    } else if (success === 'removed') {
      setIsSaved(false)
      toast.info('Quitado de favoritos')
      logger.trackEvent('venue_unfavorited', { venueId: venue.id })
    } else {
      toast.error('Error al guardar el local')
    }
  }

  const handleOpenNavigation = () => {
    // Abrir Google Maps con navegación
    const destination = `${venue.lat},${venue.lng}`
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination}`
    window.open(mapsUrl, '_blank')
  }

  const handleShareVenue = async () => {
    setIsSharing(true)
    try {
      const shared = await shareVenue({
        venueName: venue.name,
        venueType: venue.type || undefined,
        address: venue.address || undefined
      })
      
      if (shared) {
        toast.success(t('venue.shared'))
        
        // Añadir puntos
        if (userId) {
          try {
            await addPoints(userId, PointAction.VENUE_SHARED)
            toast.success('¡+5 puntos! ⭐')
          } catch (error) {
            console.error('Error adding points:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error sharing venue:', error)
    } finally {
      setIsSharing(false)
    }
  }

  // Manejar errores de carga de imagen
  const handleImageError = () => {
    setImageError(true)
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
  }
  
  // Renderizar estrellas para el rating
  const renderStars = (rating?: number) => {
    if (!rating) return null
    
    const fullStars = Math.floor(rating)
    const halfStar = rating % 1 >= 0.5
    const stars = []
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)
    }
    
    if (halfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="absolute w-4 h-4 text-gray-300" />
          <div className="absolute overflow-hidden w-2 h-4">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }
    
    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }
    
    return stars
  }
  
  // Renderizar nivel de precio
  const renderPriceLevel = (priceLevel?: number | null) => {
    if (priceLevel === undefined || priceLevel === null) return null
    
    const dollars = []
    for (let i = 0; i < 4; i++) {
      dollars.push(
        <DollarSign 
          key={i} 
          className={`w-4 h-4 ${i < priceLevel ? 'text-green-500' : 'text-gray-300'}`}
        />
      )
    }
    
    return dollars
  }
  
  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm sm:flex sm:justify-end">
      {/* Mobile: Bottom sheet | Desktop: Side panel */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 
          sm:static sm:w-[420px]
          h-[75vh] sm:h-screen
          bg-dark-card rounded-t-2xl sm:rounded-none
          shadow-lg flex flex-col
          transform transition-transform duration-300
          ${isOpen ? 'translate-y-0' : 'translate-y-full sm:translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 border-b border-neon-blue/20">
          <h2 className="text-xl font-bold text-text-light">{t('venue.details')}</h2>
          <button 
            onClick={onClose}
            className="rounded-full p-1 hover:bg-dark-secondary"
          >
            <X className="w-6 h-6 text-text-light" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Photo Carousel */}
          <div className="mb-4">
            <PhotoCarousel 
              photos={venue.photo_refs || (venue.photo_ref ? [venue.photo_ref] : [])} 
              venueName={venue.name}
              venueType={venue.type}
            />
          </div>
          
          {/* Venue details */}
          <h1 className="text-2xl font-bold text-text-light mb-2">{venue.name}</h1>
          
          {/* Rating and price level */}
          <div className="flex items-center space-x-4 mb-3">
            {venue.rating && (
              <div className="flex items-center space-x-1">
                {renderStars(venue.rating)}
                <span className="text-text-light ml-1">{venue.rating.toFixed(1)}</span>
              </div>
            )}
            
            {venue.price_level !== undefined && (
              <div className="flex items-center space-x-1">
                {renderPriceLevel(venue.price_level)}
              </div>
            )}
          </div>
          
          {/* Address */}
          <div className="flex items-start space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-neon-blue mt-0.5" />
            <p className="text-text-secondary">{venue.address}</p>
          </div>
          
          {/* People count */}
          <div className="bg-dark-secondary rounded-lg p-3 mb-4">
            <div className="text-text-light">
              {venue.count_today === 1 ? (
                <>
                  <span className="text-neon-pink font-bold">{venue.count_today}</span> {t('venue.personUsedTicket')}
                </>
              ) : (
                <>
                  <span className="text-neon-pink font-bold">{venue.count_today || 0}</span> {t('venue.peopleUsedTicket')}
                </>
              )}
            </div>
          </div>
          
          {/* Venue type and avg price */}
          {venue.avg_price_text && (
            <div className="mb-4">
              <p className="text-text-secondary">{venue.avg_price_text}</p>
            </div>
          )}
        </div>
        
        {/* Action buttons */}
        <div className="p-4 pb-20 border-t border-neon-blue/20">
          {/* Botones principales */}
          <div className="flex space-x-3 mb-4">
            {/* I'm going button */}
            <button
              onClick={handleClickGoingButton}
              disabled={isSubmitting}
              className={`
                flex-1 py-3 px-6 rounded-lg
                bg-neon-pink text-white hover:bg-opacity-90
                font-medium transition-colors
                flex items-center justify-center
              `}
            >
              {isSubmitting ? t('venue.processing') : t('venue.imGoing')}
            </button>
            
            {/* Botón de guardar */}
            <button
              onClick={handleSaveVenue}
              disabled={isSaving}
              className="py-3 px-4 rounded-lg transition-colors bg-dark-secondary text-text-light hover:bg-dark-hover flex items-center justify-center disabled:opacity-50"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current text-yellow-400' : ''}`} />
            </button>
            
            {/* Botón de compartir */}
            <button
              onClick={handleShareVenue}
              disabled={isSharing}
              className="py-3 px-4 rounded-lg transition-colors bg-dark-secondary text-text-light hover:bg-dark-hover flex items-center justify-center disabled:opacity-50"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          
          {/* External links */}
          <div className="flex space-x-3">
            {/* Botón de navegación */}
            <button
              onClick={handleOpenNavigation}
              className="flex-1 py-2 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover text-center flex items-center justify-center"
            >
              <Navigation className="w-4 h-4 mr-2" />
              Ir en Google Maps 🚀🚀🚀
            </button>
            
            {venue.website && (
              <a 
                href={venue.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-4 rounded-lg bg-dark-secondary text-text-light hover:bg-dark-hover text-center flex items-center justify-center"
              >
                <Globe className="w-4 h-4 mr-2" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>
      

      {/* Confirmation Modal */}
      <ConfirmTicketModal
        isOpen={showConfirmModal}
        venueName={venue.name}
        onConfirm={handleConfirmTicket}
        onCancel={handleCancelTicket}
      />
    </div>
  )
}
