# 🚀 ETAPAS DE MIGRACIÓN: WhereTonight → iOS/Android

**Tiempo total estimado:** 9-13 horas  
**Tecnología:** Capacitor 6.x

---

## 📋 ÍNDICE

1. [ETAPA 1: Preparación](#etapa-1) (30 min)
2. [ETAPA 2: Migración de API Routes](#etapa-2) (3-4 h)
3. [ETAPA 3: Edge Function para fotos](#etapa-3) (1-2 h)
4. [ETAPA 4: Instalación Capacitor](#etapa-4) (30 min)
5. [ETAPA 5: Funcionalidades nativas](#etapa-5) (2-3 h)
6. [ETAPA 6: Permisos](#etapa-6) (30 min)
7. [ETAPA 7: Build y sync](#etapa-7) (15 min)
8. [ETAPA 8: Pruebas](#etapa-8) (2-3 h)
9. [ETAPA 9: Publicación](#etapa-9) (variable)

---

<a name="etapa-1"></a>
## 📍 ETAPA 1: PREPARACIÓN (30 min)

### 1.1 Modificar `next.config.js`

```javascript
const nextConfig = {
  output: 'export', // ← CRÍTICO
  images: { unoptimized: true },
  experimental: {
    serverComponentsExternalPackages: ['maplibre-gl']
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'maplibre-gl': 'maplibre-gl/dist/maplibre-gl.js'
    }
    return config
  }
};
```

### 1.2 Verificar build

```bash
npm run build
```

✅ Debe crear carpeta `out/` con archivos estáticos

---

<a name="etapa-2"></a>
## 📍 ETAPA 2: MIGRACIÓN API ROUTES (3-4 h)

### 2.1 Crear estructura

```bash
mkdir src/lib/api
```

### 2.2 Migrar cada ruta

#### `src/lib/api/venues.ts`

```typescript
import { supabase } from '@/lib/supabase'
import { VenueWithCount } from '@/lib/database.types'

export async function getVenues(): Promise<VenueWithCount[]> {
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')
    .eq('is_active', true)

  if (error) return []

  const today = new Date().toISOString().split('T')[0]
  const { data: tickets } = await supabase
    .from('tickets')
    .select('venue_id')
    .eq('local_date', today)

  const counts: { [key: string]: number } = {}
  tickets?.forEach(t => counts[t.venue_id] = (counts[t.venue_id] || 0) + 1)

  return venues.map(v => ({ ...v, count_today: counts[v.id] || 0 }))
    .sort((a, b) => b.count_today - a.count_today)
}
```

#### `src/lib/api/tickets.ts`

```typescript
import { supabase } from '@/lib/supabase'

export async function useTicket(userId: string, venueId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const { error } = await supabase
    .from('tickets')
    .insert({ user_id: userId, venue_id: venueId, local_date: today })
  return !error
}

export async function checkTicketUsedToday(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('tickets')
    .select('id')
    .eq('user_id', userId)
    .eq('local_date', today)
    .limit(1)
  return !!data && data.length > 0
}
```

#### `src/lib/api/activity.ts`

```typescript
import { supabase } from '@/lib/supabase'

export async function createActivity(
  userId: string,
  venueId: string | null,
  type: string
): Promise<boolean> {
  const { error } = await supabase
    .from('activities')
    .insert({ user_id: userId, venue_id: venueId, type })
  return !error
}
```

#### `src/lib/api/friendships.ts`

```typescript
import { supabase } from '@/lib/supabase'

export async function sendFriendRequest(from: string, to: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: from, friend_id: to, status: 'pending' })
  return !error
}

export async function acceptFriendRequest(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('friendships')
    .update({ status: 'accepted' })
    .eq('id', id)
  return !error
}
```

#### `src/lib/api/social-posts.ts`

```typescript
import { supabase } from '@/lib/supabase'

export async function createPost(
  userId: string,
  content: string,
  venueId?: string
): Promise<boolean> {
  const { error } = await supabase
    .from('social_posts')
    .insert({ user_id: userId, content, venue_id: venueId })
  return !error
}

export async function getSocialPosts(limit = 50) {
  const { data } = await supabase
    .from('social_posts')
    .select('*, profiles(*), venues(*)')
    .order('created_at', { ascending: false })
    .limit(limit)
  return data || []
}
```

### 2.3 Actualizar componentes

Buscar: `fetch('/api/`
Reemplazar por imports de las nuevas funciones.

**Archivos clave:**
- `src/contexts/VenueContext.tsx`
- `src/app/page.tsx`
- `src/components/SocialFeed.tsx`

---

<a name="etapa-3"></a>
## 📍 ETAPA 3: EDGE FUNCTION FOTOS (1-2 h)

### 3.1 Instalar CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref TU_PROJECT_REF
```

### 3.2 Crear función

```bash
supabase functions new photo-proxy
```

### 3.3 Implementar `supabase/functions/photo-proxy/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

const FALLBACKS = {
  club: 'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?w=800',
  bar: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800',
  other: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const photoRef = url.searchParams.get('ref')
  const type = url.searchParams.get('type') || 'other'
  
  try {
    if (!photoRef) throw new Error('No ref')
    
    const apiKey = Deno.env.get('GOOGLE_MAPS_API_KEY')
    if (!apiKey) throw new Error('No API key')
    
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoRef}&key=${apiKey}`
    const response = await fetch(photoUrl)
    
    if (!response.ok) throw new Error('API error')
    
    return new Response(await response.arrayBuffer(), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=604800'
      }
    })
  } catch (error) {
    const fallback = await fetch(FALLBACKS[type as keyof typeof FALLBACKS])
    return new Response(await fallback.arrayBuffer(), {
      headers: { ...corsHeaders, 'Content-Type': 'image/jpeg' }
    })
  }
})
```

### 3.4 Configurar y desplegar

```bash
supabase secrets set GOOGLE_MAPS_API_KEY=tu_key
supabase functions deploy photo-proxy
```

### 3.5 Crear helper `src/lib/api/photos.ts`

```typescript
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

export function getPhotoUrl(photoRef: string | null, type = 'other'): string {
  if (!photoRef) return `${SUPABASE_URL}/functions/v1/photo-proxy?type=${type}`
  return `${SUPABASE_URL}/functions/v1/photo-proxy?ref=${photoRef}&type=${type}`
}
```

### 3.6 Actualizar componentes

Buscar: `/api/photo`
Reemplazar: `import { getPhotoUrl } from '@/lib/api/photos'`

---

<a name="etapa-4"></a>
## 📍 ETAPA 4: INSTALACIÓN CAPACITOR (30 min)

### 4.1 Instalar

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
```

Responder:
- App name: `WhereTonight`
- App ID: `com.wheretonight.app`
- Web dir: `out`

### 4.2 Añadir plataformas

```bash
npm install @capacitor/android @capacitor/ios
npx cap add android
npx cap add ios
```

### 4.3 Instalar plugins

```bash
npm install @capacitor/geolocation @capacitor/camera @capacitor/haptics @capacitor/status-bar @capacitor/keyboard
```

---

<a name="etapa-5"></a>
## 📍 ETAPA 5: FUNCIONALIDADES NATIVAS (2-3 h)

### 5.1 Geolocalización

En `src/components/Map.tsx`:

```typescript
import { Geolocation } from '@capacitor/geolocation'

const goToUserLocation = async () => {
  await Geolocation.requestPermissions()
  const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true })
  // Usar pos.coords.latitude y pos.coords.longitude
}
```

### 5.2 Cámara

En `src/components/EditProfileModal.tsx`:

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'

const takePhoto = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: CameraResultType.Base64,
    source: CameraSource.Prompt
  })
  // Subir image.base64String a Supabase
}
```

### 5.3 Status Bar

Crear `src/lib/capacitor-config.ts`:

```typescript
import { StatusBar, Style } from '@capacitor/status-bar'
import { Capacitor } from '@capacitor/core'

export async function configureNativeUI() {
  if (!Capacitor.isNativePlatform()) return
  await StatusBar.setStyle({ style: Style.Dark })
  await StatusBar.setBackgroundColor({ color: '#0f0f1e' })
}
```

Llamar en `layout.tsx` con `useEffect`.

### 5.4 Haptics

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics'

// En acciones importantes
await Haptics.impact({ style: ImpactStyle.Medium })
```

---

<a name="etapa-6"></a>
## 📍 ETAPA 6: PERMISOS (30 min)

### 6.1 Android

`android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
```

### 6.2 iOS

`ios/App/App/Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Para mostrarte locales cercanos</string>
<key>NSCameraUsageDescription</key>
<string>Para foto de perfil</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Para elegir foto de perfil</string>
```

---

<a name="etapa-7"></a>
## 📍 ETAPA 7: BUILD Y SYNC (15 min)

```bash
npm run build
npx cap sync
npx cap open android
npx cap open ios
```

---

<a name="etapa-8"></a>
## 📍 ETAPA 8: PRUEBAS (2-3 h)

### Checklist

- [ ] Mapa carga y muestra venues
- [ ] Geolocalización funciona
- [ ] Login/registro funciona
- [ ] Usar tickets funciona
- [ ] Fotos cargan correctamente
- [ ] Cambiar avatar funciona
- [ ] Feed social carga
- [ ] Búsqueda funciona
- [ ] Navegación entre secciones

### Android

1. Conectar dispositivo USB
2. Habilitar depuración USB
3. Android Studio → ▶️ Run

### iOS

1. Conectar iPhone
2. Xcode → Seleccionar dispositivo → ▶️

---

<a name="etapa-9"></a>
## 📍 ETAPA 9: PUBLICACIÓN

### Android (Google Play)

```bash
cd android
./gradlew bundleRelease
```

AAB en: `android/app/build/outputs/bundle/release/`

Subir a: https://play.google.com/console

### iOS (App Store)

Xcode → Product → Archive → Distribute

Configurar en: https://appstoreconnect.apple.com

---

## 📊 COMANDOS RESUMEN

```bash
# Preparación
npm run build

# Capacitor
npx cap sync
npx cap open android
npx cap open ios

# Supabase
supabase functions deploy photo-proxy
```

## ✅ CHECKLIST FINAL

- [ ] `output: 'export'` en next.config.js
- [ ] Todas las API routes migradas
- [ ] Edge Function desplegada
- [ ] Plugins nativos instalados
- [ ] Permisos configurados
- [ ] Pruebas en dispositivo real
- [ ] Screenshots preparados
- [ ] Metadata de tiendas completa
