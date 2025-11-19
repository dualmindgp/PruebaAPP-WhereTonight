import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, TextInput, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { User, LogOut, Edit, Heart, Clock, Users, Settings } from 'lucide-react-native'
import { supabase } from '../lib/supabase'
import { Profile } from '../types/database.types'
import { useToastContext } from '../contexts/ToastContext'
import EditProfileModal from '../components/EditProfileModal'

interface ProfileScreenProps {
  userId: string
  onLogout: () => void
  onShowFavorites?: () => void
  onShowHistory?: () => void
  onShowFriends?: () => void
  onShowSettings?: () => void
}

export default function ProfileScreen({
  userId,
  onLogout,
  onShowFavorites,
  onShowHistory,
  onShowFriends,
  onShowSettings
}: ProfileScreenProps) {
  const toast = useToastContext()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showEditProfileModal, setShowEditProfileModal] = useState(false)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  // Helper para calcular edad desde birth_date
  const calculateAge = (birthDateString: string): number | null => {
    if (!birthDateString) return null
    
    const birthDate = new Date(birthDateString)
    const today = new Date()
    
    if (birthDate > today) return null
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      if (data) {
        setProfile(data)
        setUsername(data.username || '')
        setBio(data.bio || '')
      }
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error al cargar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido')
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          bio: bio.trim()
        })
        .eq('id', userId)

      if (error) throw error

      setProfile({
        ...profile!,
        username: username.trim(),
        bio: bio.trim()
      })
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error al actualizar perfil')
    }
  }

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      onLogout()
    } catch (error) {
      console.error('Error logging out:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark-primary justify-center items-center">
        <ActivityIndicator size="large" color="#00D9FF" />
      </SafeAreaView>
    )
  }

  // Datos del perfil (ahora dinámicos desde la BD)
  const age = profile?.birth_date ? calculateAge(profile.birth_date) : null
  const city = profile?.city
  const musicGenres = profile?.music_genres || []

  return (
    <SafeAreaView className="flex-1 bg-gray-900">
      <ScrollView className="flex-1">
        {/* Header - Diseño centrado más compacto */}
        <View className="bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 border border-purple-500/20 shadow-xl relative overflow-hidden">
          {/* Fondo con efecto blur */}
          <View className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-blue-900/10" />
          
          {/* Contenido */}
          <View className="relative z-10">
            {/* Botón editar perfil - esquina superior derecha, más separado */}
            <TouchableOpacity
              onPress={() => setShowEditProfileModal(true)}
              className="absolute -top-2 -right-2 flex-row items-center gap-2 px-3 py-2 bg-gray-800/80 rounded-lg"
            >
              <Edit size={16} color="#9CA3AF" />
              <Text className="text-gray-400 text-sm">editar</Text>
            </TouchableOpacity>

            {/* Avatar Section - Centrado */}
            <View className="flex-col items-center mb-4 mt-6">
              <View className="relative">
                {/* Foto de perfil con borde degradado morado - más pequeña */}
                <View className="p-1 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-lg shadow-purple-500/50">
                  {profile?.avatar_url ? (
                    <Image
                      source={{ uri: profile.avatar_url }}
                      className="w-28 h-28 rounded-full bg-gray-900"
                    />
                  ) : (
                    <View className="w-28 h-28 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 items-center justify-center">
                      <Text className="text-5xl font-bold text-white">
                        {(profile?.username || 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Username and Info - más compacto */}
              <View className="items-center mt-4 w-full">
                {/* Nombre grande */}
                <Text className="text-3xl font-bold text-white mb-1">
                  {username}
                </Text>
                
                {/* Username con @ - solo si es diferente al nombre o hay handle personalizado */}
                {(profile?.custom_handle || (profile?.username || 'usuario').toLowerCase().replace(/\s+/g, '_') !== (profile?.username || '').toLowerCase()) && (
                  <Text className="text-gray-400 text-base mb-2">
                    @{profile?.custom_handle || (profile?.username || 'usuario').toLowerCase().replace(/\s+/g, '_')}
                  </Text>
                )}
                
                {/* Edad · Ciudad · Géneros - más compacto */}
                <Text className="text-gray-300 text-sm">
                  {age && `${age} años`}
                  {age && city && ' · '}
                  {city && city}
                  {(age || city) && musicGenres && musicGenres.length > 0 && ' · '}
                  {musicGenres && musicGenres.length > 0 && musicGenres.slice(0, 3).join(' & ')}
                  {musicGenres && musicGenres.length > 3 && ` +${musicGenres.length - 3}`}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Edit Profile Modal */}
        <EditProfileModal
          isOpen={showEditProfileModal}
          onClose={() => setShowEditProfileModal(false)}
          userId={userId}
          currentProfile={profile ? {
            id: profile.id,
            username: profile.username || undefined,
            bio: profile.bio || undefined,
            avatar_url: profile.avatar_url || undefined,
            birth_date: profile.birth_date || undefined,
            city: profile.city || undefined,
            music_genres: profile.music_genres || undefined,
            custom_handle: profile.custom_handle || undefined
          } : {}}
          onSuccess={() => {
            loadProfile()
            toast.success('¡Perfil actualizado!')
          }}
        />

        {/* Menu Items */}
        <View className="px-4 py-6 gap-3">
          <TouchableOpacity
            onPress={onShowFavorites}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-neon-pink/20"
          >
            <Heart className="w-6 h-6 text-neon-pink" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Mis Favoritos</Text>
              <Text className="text-text-secondary text-sm">Locales guardados</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShowHistory}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-neon-cyan/20"
          >
            <Clock className="w-6 h-6 text-neon-cyan" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Historial</Text>
              <Text className="text-text-secondary text-sm">Donde has estado</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShowFriends}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-neon-blue/20"
          >
            <Users className="w-6 h-6 text-neon-blue" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Amigos</Text>
              <Text className="text-text-secondary text-sm">Tu red social</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShowSettings}
            className="flex-row items-center gap-3 px-4 py-4 bg-dark-card rounded-2xl border border-text-secondary/20"
          >
            <Settings className="w-6 h-6 text-text-secondary" />
            <View className="flex-1">
              <Text className="text-lg font-bold text-white">Configuración</Text>
              <Text className="text-text-secondary text-sm">Preferencias</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="flex-row items-center gap-3 px-4 py-4 bg-red-500/10 rounded-2xl border border-red-500/30 mt-4"
          >
            <LogOut className="w-6 h-6 text-red-500" />
            <Text className="text-lg font-bold text-red-500">Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
