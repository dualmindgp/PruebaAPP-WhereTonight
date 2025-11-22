# 🚀 GUÍA RÁPIDA DE IMPLEMENTACIÓN

Esta guía te muestra cómo integrar el sistema de incentivos en tu app **paso a paso con código real**.

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

```
[ ] 1. Migrar base de datos
[ ] 2. Integrar en registro/signup
[ ] 3. Integrar en login
[ ] 4. Integrar al crear historias
[ ] 5. Integrar al usar tickets
[ ] 6. Mostrar en perfil de usuario
[ ] 7. Crear página de invitación
[ ] 8. Configurar deep links
[ ] 9. Testear flujo completo
[ ] 10. Lanzar y monitorear
```

---

## 1️⃣ MIGRAR BASE DE DATOS

### **Supabase Dashboard → SQL Editor**

```sql
-- Copiar y ejecutar:
database/incentives-system-migration.sql
```

### **Verificar instalación:**

```sql
-- Verificar badges
SELECT COUNT(*) FROM badges;
-- Debe retornar ~15

-- Verificar challenges
SELECT COUNT(*) FROM challenges;
-- Debe retornar 3

-- Verificar funciones
SELECT proname FROM pg_proc WHERE proname LIKE '%referral%';
```

---

## 2️⃣ INTEGRAR EN REGISTRO/SIGNUP

### **Archivo: `src/app/signup/page.tsx` o similar**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { applyReferralCode } from '@/lib/referral-system'

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [referralCode, setReferralCode] = useState('')

  useEffect(() => {
    // Capturar código de referido de la URL
    const codeFromUrl = searchParams.get('ref') || searchParams.get('code')
    if (codeFromUrl) {
      setReferralCode(codeFromUrl)
    }
  }, [searchParams])

  const handleSignup = async (email: string, password: string, username: string) => {
    try {
      // 1. Registrar usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('No user ID')

      // 2. Aplicar código de referido si existe
      if (referralCode) {
        const result = await applyReferralCode(userId, referralCode)
        
        if (result.success) {
          // Mostrar notificación de éxito
          alert('¡50 puntos de bienvenida! 🎉')
        }
      }

      // 3. Redireccionar a onboarding
      router.push('/onboarding')

    } catch (error) {
      console.error('Error en signup:', error)
    }
  }

  return (
    <div>
      {/* Tu UI de registro */}
      
      {/* Mostrar si viene de referido */}
      {referralCode && (
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-4 rounded-lg mb-4">
          <p className="text-white font-bold">
            🎁 ¡Código de invitación aplicado!
          </p>
          <p className="text-white/80 text-sm">
            Ganarás 50 puntos al registrarte
          </p>
        </div>
      )}

      {/* Formulario de registro */}
    </div>
  )
}
```

---

## 3️⃣ INTEGRAR EN LOGIN

### **Archivo: `src/components/AuthWrapper.tsx` o `src/app/layout.tsx`**

```typescript
'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { handleDailyLogin } from '@/lib/incentives-helper'
import { usePointsNotification } from '@/components/PointsRewardNotification'

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { showNotification } = usePointsNotification()

  useEffect(() => {
    if (user) {
      checkDailyLogin()
    }
  }, [user])

  const checkDailyLogin = async () => {
    if (!user?.id) return

    try {
      const result = await handleDailyLogin(user.id)
      
      // Si ganó puntos, mostrar notificación
      if (result.pointsEarned > 0) {
        showNotification(
          result.pointsEarned,
          `Racha de ${result.streak} días`,
          'streak'
        )
      }

      // Si desbloqueó bonus
      if (result.bonusUnlocked) {
        showNotification(
          result.pointsEarned,
          `¡Bonus de racha desbloqueado! 🔥`,
          'streak'
        )
      }

    } catch (error) {
      console.error('Error checking daily login:', error)
    }
  }

  return <>{children}</>
}
```

---

## 4️⃣ INTEGRAR AL CREAR HISTORIAS

### **Archivo: `src/components/CreateStoryModal.tsx` o similar**

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { handleStoryCreated } from '@/lib/incentives-helper'
import { usePointsNotification } from '@/components/PointsRewardNotification'
import PointsRewardNotification from '@/components/PointsRewardNotification'

export default function CreateStoryModal() {
  const { user } = useAuth()
  const { notification, showNotification, hideNotification } = usePointsNotification()
  const [content, setContent] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!user?.id) return

    try {
      // 1. Subir imagen si existe
      let imageUrl = null
      if (image) {
        const { data: uploadData } = await supabase.storage
          .from('stories')
          .upload(`${user.id}/${Date.now()}.jpg`, image)
        
        imageUrl = uploadData?.path
      }

      // 2. Crear post en BD
      const { data: post, error } = await supabase
        .from('social_posts')
        .insert({
          user_id: user.id,
          content: content,
          image_url: imageUrl,
          venue_id: selectedVenue,
          venue_name: selectedVenue ? 'Venue Name' : null, // Obtener del venue
          audience: 'public'
        })
        .select()
        .single()

      if (error) throw error

      // 3. PROCESAR PUNTOS Y BADGES
      const result = await handleStoryCreated(user.id, {
        hasPhoto: !!image,
        hasVenue: !!selectedVenue,
        venueId: selectedVenue || undefined
      })

      // 4. Mostrar notificación de puntos
      const message = result.isFirstStory 
        ? '¡Tu primera historia!' 
        : 'Historia compartida'

      showNotification(
        result.totalPoints,
        message,
        result.isFirstStory ? 'badge' : 'default'
      )

      // 5. Mostrar badges desbloqueados
      if (result.badges.length > 0) {
        setTimeout(() => {
          result.badges.forEach((badge, index) => {
            setTimeout(() => {
              showNotification(
                badge.points_reward,
                `Badge desbloqueado: ${badge.name}`,
                'badge'
              )
            }, index * 2000)
          })
        }, 2000)
      }

      // 6. Cerrar modal
      onClose()

    } catch (error) {
      console.error('Error creating story:', error)
    }
  }

  return (
    <>
      {/* Modal de creación */}
      <div className="modal">
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Comparte algo increíble..."
        />
        
        {/* Botón de submit */}
        <button onClick={handleSubmit}>
          Publicar (+15 pts)
        </button>
      </div>

      {/* Notificación de puntos */}
      <PointsRewardNotification
        {...notification}
        onClose={hideNotification}
      />
    </>
  )
}
```

---

## 5️⃣ INTEGRAR AL USAR TICKETS

### **Archivo: `src/components/TicketPurchaseButton.tsx` o similar**

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { handleTicketUsed } from '@/lib/incentives-helper'
import { usePointsNotification } from '@/components/PointsRewardNotification'

export default function TicketPurchaseButton({ 
  venueId, 
  venueName 
}: { 
  venueId: string
  venueName: string 
}) {
  const { user } = useAuth()
  const { showNotification } = usePointsNotification()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // 1. Crear ticket en BD
      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert({
          user_id: user.id,
          venue_id: venueId,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error

      // 2. PROCESAR PUNTOS
      const result = await handleTicketUsed(user.id, venueId)

      // 3. Mostrar notificación
      const message = result.isFirstTicket
        ? '¡Tu primer ticket! 🎉'
        : 'Ticket comprado'

      showNotification(
        result.totalPoints,
        message,
        result.isFirstTicket ? 'badge' : 'default'
      )

      // 4. Crear historia automática (opcional)
      await createTicketStory(user.id, venueId, venueName)

    } catch (error) {
      console.error('Error purchasing ticket:', error)
    } finally {
      setLoading(false)
    }
  }

  const createTicketStory = async (
    userId: string, 
    venueId: string, 
    venueName: string
  ) => {
    try {
      await supabase
        .from('social_posts')
        .insert({
          user_id: userId,
          content: `Acabo de conseguir entrada para ${venueName}! 🎉`,
          venue_id: venueId,
          venue_name: venueName,
          is_ticket_story: true,
          audience: 'friends'
        })

      // Dar puntos por la historia automática
      const storyResult = await handleStoryCreated(userId, {
        hasVenue: true,
        venueId: venueId
      })

      showNotification(
        storyResult.totalPoints,
        'Historia automática creada',
        'default'
      )

    } catch (error) {
      console.error('Error creating ticket story:', error)
    }
  }

  return (
    <button 
      onClick={handlePurchase}
      disabled={loading}
      className="btn-primary"
    >
      {loading ? 'Procesando...' : 'Comprar Ticket (+10 pts)'}
    </button>
  )
}
```

---

## 6️⃣ MOSTRAR EN PERFIL

### **Archivo: `src/app/profile/page.tsx` o similar**

```typescript
'use client'

import { useAuth } from '@/contexts/AuthContext'
import PointsBadge from '@/components/PointsBadge'
import ReferralCard from '@/components/ReferralCard'
import BadgesShowcase from '@/components/BadgesShowcase'

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header con puntos */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mi Perfil</h1>
        <PointsBadge userId={user.id} />
      </div>

      {/* Información del usuario */}
      <div className="bg-dark-secondary rounded-2xl p-6">
        {/* Avatar, username, etc */}
      </div>

      {/* Sistema de Referidos */}
      <ReferralCard userId={user.id} />

      {/* Badges */}
      <BadgesShowcase userId={user.id} variant="full" />

      {/* Estadísticas adicionales */}
      <StatsGrid userId={user.id} />

    </div>
  )
}

function StatsGrid({ userId }: { userId: string }) {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    loadStats()
  }, [userId])

  const loadStats = async () => {
    const summary = await getUserPointsSummary(userId)
    setStats(summary)
  }

  if (!stats) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard 
        icon="⭐"
        label="Nivel"
        value={stats.level}
      />
      <StatCard 
        icon="🏆"
        label="Badges"
        value={stats.badges}
      />
      <StatCard 
        icon="🔥"
        label="Racha"
        value={`${stats.streak} días`}
      />
      <StatCard 
        icon="👥"
        label="Referidos"
        value={stats.referrals}
      />
    </div>
  )
}
```

---

## 7️⃣ PÁGINA DE INVITACIÓN

### **Archivo: `src/app/invite/[code]/page.tsx`**

```typescript
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { validateReferralCode } from '@/lib/referral-system'

export default function InvitePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get('code') || ''
  const [valid, setValid] = useState<boolean | null>(null)

  useEffect(() => {
    checkCode()
  }, [code])

  const checkCode = async () => {
    const isValid = await validateReferralCode(code)
    setValid(isValid)

    if (isValid) {
      // Guardar código en localStorage para usar al registrarse
      localStorage.setItem('referral_code', code)
    }
  }

  if (valid === null) {
    return <div>Verificando código...</div>
  }

  if (!valid) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">
            Código Inválido
          </h1>
          <p className="text-gray-400">
            Este código de invitación no es válido o ha expirado
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
      <div className="max-w-md w-full p-8 bg-dark-secondary rounded-2xl shadow-2xl">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🎁</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            ¡Te invitaron a WhereTonight!
          </h1>
          <p className="text-gray-400">
            Código de invitación: <code className="text-pink-400 font-bold">{code}</code>
          </p>
        </div>

        {/* Benefits */}
        <div className="space-y-4 mb-8">
          <div className="flex items-start gap-3 bg-black/20 p-4 rounded-lg">
            <span className="text-2xl">⭐</span>
            <div>
              <h3 className="font-bold text-white mb-1">50 Puntos de Bienvenida</h3>
              <p className="text-sm text-gray-400">
                Comienza con puntos para canjear por tickets gratis
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-black/20 p-4 rounded-lg">
            <span className="text-2xl">🎉</span>
            <div>
              <h3 className="font-bold text-white mb-1">Descubre la Vida Nocturna</h3>
              <p className="text-sm text-gray-400">
                Encuentra los mejores clubs, bares y eventos
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-black/20 p-4 rounded-lg">
            <span className="text-2xl">👥</span>
            <div>
              <h3 className="font-bold text-white mb-1">Conecta con Amigos</h3>
              <p className="text-sm text-gray-400">
                Ve dónde están tus amigos y únete a la diversión
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => router.push('/signup?ref=' + code)}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold rounded-lg transition-all"
        >
          Registrarme y Ganar 50 Puntos
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Al registrarte, aceptas nuestros términos y condiciones
        </p>

      </div>
    </div>
  )
}
```

---

## 8️⃣ CONFIGURAR DEEP LINKS (Mobile)

### **Archivo: `capacitor.config.ts`**

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.wheretonight.app',
  appName: 'WhereTonight',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    // Configurar deep links
    App: {
      scheme: 'wheretonight'
    }
  }
};

export default config;
```

### **Archivo: `src/app/layout.tsx` - Listener de deep links**

```typescript
'use client'

import { useEffect } from 'react'
import { App as CapApp } from '@capacitor/app'
import { useRouter } from 'next/navigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  useEffect(() => {
    // Listener para deep links
    CapApp.addListener('appUrlOpen', ({ url }) => {
      // wheretonight://invite/GUILLE2024
      if (url.includes('invite/')) {
        const code = url.split('invite/')[1]
        router.push(`/invite/${code}`)
      }
    })

    return () => {
      CapApp.removeAllListeners()
    }
  }, [])

  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
```

---

## 9️⃣ TESTEAR FLUJO COMPLETO

### **Checklist de Testing:**

```bash
# 1. Crear usuario de prueba
# Ir a /signup?ref=TEST2024

# 2. Verificar puntos iniciales
# Debería tener 50 puntos

# 3. Completar perfil
# Debería ganar +20 puntos = 70 total

# 4. Crear primera historia
# Debería ganar +45 puntos (15 base + 30 bonus)

# 5. Verificar badge "Primera Historia"
# Debería aparecer en /profile

# 6. Verificar código de referido propio
# Debería tener código generado automáticamente

# 7. Probar invitación
# Copiar código y abrir en incógnito: /invite/[tu_código]

# 8. Registrar nuevo usuario con código
# Verificar que ambos ganan puntos

# 9. Verificar streak
# Login al día siguiente, verificar +2 pts
```

---

## 🔟 LANZAR Y MONITOREAR

### **Métricas a Trackear en Supabase:**

```sql
-- Registros con código de referido
SELECT 
  DATE(created_at) as date,
  COUNT(*) as signups_with_code
FROM referrals
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Historias creadas por día
SELECT 
  DATE(created_at) as date,
  COUNT(*) as stories
FROM social_posts
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Top referrers
SELECT 
  r.referrer_id,
  p.username,
  COUNT(*) as total_referrals,
  SUM(r.referrer_reward_points) as total_points_earned
FROM referrals r
JOIN profiles p ON p.id = r.referrer_id
GROUP BY r.referrer_id, p.username
ORDER BY total_referrals DESC
LIMIT 10;

-- Badges más desbloqueados
SELECT 
  b.name,
  b.rarity,
  COUNT(*) as times_unlocked
FROM user_badges ub
JOIN badges b ON b.id = ub.badge_id
GROUP BY b.id, b.name, b.rarity
ORDER BY times_unlocked DESC;
```

---

## ✅ RESUMEN

Has implementado:
- ✅ Sistema de referidos viral
- ✅ Badges y logros automáticos
- ✅ Streaks de engagement
- ✅ Recompensas por contenido
- ✅ Deep links para invitaciones
- ✅ UI completa de incentivos

**¡Tu app ahora tiene un motor de crecimiento incorporado!** 🚀

---

## 🆘 TROUBLESHOOTING

### **Los puntos no se dan:**
```typescript
// Verificar permisos RLS en Supabase
// Ir a Authentication > Policies
// Asegurar que user_points y points_transactions tienen políticas correctas
```

### **Código de referido no se genera:**
```typescript
// Verificar trigger en Supabase
// SELECT * FROM referral_codes WHERE user_id = 'tu_user_id';
// Si no existe, ejecutar manualmente:
SELECT generate_referral_code('user_id', 'username');
```

### **Badges no se desbloquean:**
```typescript
// Llamar manualmente:
import { checkAndUnlockBadges } from '@/lib/badge-system'
await checkAndUnlockBadges(userId)
```

---

**¿Preguntas?** Revisa `ESTRATEGIA_INCENTIVOS.md` para más detalles.
