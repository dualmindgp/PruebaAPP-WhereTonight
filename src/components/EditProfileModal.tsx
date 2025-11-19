'use client'

import { useState } from 'react'
import { X, Camera, Save } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  currentProfile: any
  onSuccess: () => void
}

export default function EditProfileModal({ isOpen, onClose, userId, currentProfile, onSuccess }: EditProfileModalProps) {
  const [username, setUsername] = useState(currentProfile?.username || '')
  const [bio, setBio] = useState(currentProfile?.bio || '')
  const [avatarUrl, setAvatarUrl] = useState(currentProfile?.avatar_url || '')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          bio,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (error) throw error

      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-secondary rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Editar Perfil</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Foto de perfil
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="URL de la imagen"
                className="flex-1 px-3 py-2 bg-dark-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 bg-dark-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Biografía
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-dark-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-neon-blue resize-none"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-neon-blue hover:bg-neon-blue/80 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
