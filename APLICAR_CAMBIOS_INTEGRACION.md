# 🔧 APLICAR CAMBIOS DE INTEGRACIÓN

Este documento te guía para aplicar **TODOS** los cambios de integración en **PruebaApp**.

---

## ✅ ARCHIVOS YA COPIADOS

- ✅ `src/lib/share.ts`
- ✅ `src/lib/push-notifications.ts`
- ✅ `src/lib/points-system.ts`
- ✅ `src/components/QRScanner.tsx`
- ✅ `src/components/PointsBadge.tsx` (NUEVO)

---

## 📝 CAMBIOS A APLICAR MANUALMENTE

### **1. src/app/page.tsx**

**Añadir import:**
```typescript
// Línea 31, después de:
import { MapPin, Edit, Home as HomeIcon, Search as SearchIcon, User as UserIcon, MessageCircle } from 'lucide-react'

// AÑADIR:
import { addPoints, PointAction } from '@/lib/points-system'
```

**Modificar función handleUseTicket:**
```typescript
// Busca esta línea (aprox línea 189):
setHasUsedTicketToday(true)

// DESPUÉS de esa línea, AÑADIR:
      
// Añadir puntos al usuario
try {
  const result = await addPoints(user.id, PointAction.TICKET_USED)
  console.log(`¡Ganaste ${result.pointsAdded} puntos! Total: ${result.newTotal}`)
} catch (error) {
  console.error('Error adding points:', error)
}
```

---

### **2. src/components/VenueSheet.tsx**

**Añadir imports:**
```typescript
// Línea 4, cambiar:
import { X, Star, DollarSign, MapPin, Globe, Image, ExternalLink, Bookmark, Navigation } from 'lucide-react'

// POR:
import { X, Star, DollarSign, MapPin, Globe, Image, ExternalLink, Bookmark, Navigation, Share2 } from 'lucide-react'
```

```typescript
// Después de la línea 11, AÑADIR:
import { shareVenue } from '@/lib/share'
import { addPoints, PointAction } from '@/lib/points-system'
```

**Añadir estado:**
```typescript
// Después de const [isSaving, setIsSaving] = useState(false)
// AÑADIR:
const [isSharing, setIsSharing] = useState(false)
```

**Añadir función handleShareVenue:**
```typescript
// Después de la función handleSaveVenue, AÑADIR:

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
```

**Modificar handleSaveVenue para añadir puntos:**
```typescript
// Busca esta línea:
toast.success('¡Guardado en favoritos!')
logger.trackEvent('venue_favorited', { venueId: venue.id, venueName: venue.name })

// DESPUÉS de esas líneas, AÑADIR:
      
// Añadir puntos
if (userId) {
  try {
    await addPoints(userId, PointAction.VENUE_SAVED)
    toast.success('¡+5 puntos! ⭐')
  } catch (error) {
    console.error('Error adding points:', error)
  }
}
```

**Añadir botón de compartir:**
```typescript
// Busca el botón de guardar (Bookmark), después de él AÑADIR:

{/* Botón de compartir */}
<button
  onClick={handleShareVenue}
  disabled={isSharing}
  className="py-3 px-4 rounded-lg transition-colors bg-dark-secondary text-text-light hover:bg-dark-hover flex items-center justify-center disabled:opacity-50"
>
  <Share2 className="w-5 h-5" />
</button>
```

---

### **3. src/components/ProfileScreen.tsx**

**Añadir imports:**
```typescript
// Línea 5, cambiar:
import { Camera, UserPlus, Users, LogOut, Edit2 } from 'lucide-react'

// POR:
import { Camera, UserPlus, Users, LogOut, Edit2, QrCode, Star, TrendingUp } from 'lucide-react'
```

```typescript
// Después de los imports, AÑADIR:
import QRScanner from './QRScanner'
import PointsBadge from './PointsBadge'
import { getUserPoints, getLevelFromPoints } from '@/lib/points-system'
```

**Añadir estados:**
```typescript
// Después de const fileInputRef = useRef<HTMLInputElement>(null)
// AÑADIR:
const [showQRScanner, setShowQRScanner] = useState(false)
const [points, setPoints] = useState(0)
const [level, setLevel] = useState(1)
```

**Añadir useEffect para cargar puntos:**
```typescript
// Después de los estados, AÑADIR:

// Cargar puntos del usuario
React.useEffect(() => {
  const loadPoints = async () => {
    try {
      const totalPoints = await getUserPoints(user.id)
      setPoints(totalPoints)
      setLevel(getLevelFromPoints(totalPoints))
    } catch (error) {
      console.error('Error loading points:', error)
    }
  }
  loadPoints()
}, [user.id])
```

**Añadir handler para QR:**
```typescript
// Después del useEffect, AÑADIR:

const handleQRScan = (code: string) => {
  console.log('QR Code scanned:', code)
  toast.success(`Código escaneado: ${code}`)
  // Aquí puedes procesar el código QR
}
```

**Añadir sección de puntos y QR en la UI:**
```typescript
// Busca la sección de Friends (donde dice "Friends Section")
// ANTES de esa sección, AÑADIR:

{/* Points and QR Section */}
<div className="border-t border-neon-blue/20 pt-6 mt-6">
  <div className="grid grid-cols-2 gap-3 mb-4">
    {/* Puntos Card */}
    <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-xl p-4 border border-yellow-500/30">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-5 h-5 text-yellow-400 fill-current" />
        <span className="text-yellow-400 font-bold text-lg">{points}</span>
      </div>
      <p className="text-text-secondary text-xs">Puntos</p>
    </div>

    {/* Nivel Card */}
    <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-xl p-4 border border-orange-500/30">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp className="w-5 h-5 text-orange-400" />
        <span className="text-orange-400 font-bold text-lg">{level}</span>
      </div>
      <p className="text-text-secondary text-xs">Nivel</p>
    </div>
  </div>

  {/* QR Scanner Button */}
  <button
    onClick={() => setShowQRScanner(true)}
    className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 transition-all border border-purple-500/30"
  >
    <QrCode className="w-5 h-5 text-purple-400" />
    <span className="text-purple-400 font-semibold">Escanear Código QR</span>
  </button>
</div>
```

**Añadir componente QRScanner:**
```typescript
// Al final del componente, antes del cierre </div>, AÑADIR:

{/* QR Scanner */}
<QRScanner
  isOpen={showQRScanner}
  onClose={() => setShowQRScanner(false)}
  onScan={handleQRScan}
/>
```

---

## 🎯 RESUMEN DE CAMBIOS

| Archivo | Cambio | Qué hace |
|---------|--------|----------|
| `page.tsx` | Integrar puntos en usar ticket | +10 puntos al usar ticket |
| `VenueSheet.tsx` | Añadir botón compartir + puntos | Botón compartir + puntos al guardar/compartir |
| `ProfileScreen.tsx` | UI puntos + botón QR | Muestra puntos, nivel y botón QR |

---

## ✅ VERIFICAR DESPUÉS DE APLICAR

```bash
cd C:\Users\guill\Desktop\PruebaApp
npm run build
npx cap sync
```

Si todo compila bien, abre en Android Studio y prueba.

---

## 🧪 PROBAR EN TABLET

### **Test 1: Sistema de Puntos**
1. Usa un ticket → Debería aparecer toast "¡+10 puntos! ⭐"
2. Ve a Perfil → Deberías ver tus puntos y nivel
3. Guarda un venue → "+5 puntos!"
4. Comparte un venue → "+5 puntos!"

### **Test 2: Compartir**
1. Abre un venue
2. Click botón compartir (icono Share2)
3. Debería abrir menú de compartir del sistema

### **Test 3: QR Scanner**
1. Ve a Perfil
2. Click "Escanear Código QR"
3. Debería abrir cámara
4. Escanea un código QR
5. Debería mostrar toast con el código

---

## 📋 CHECKLIST

- [ ] Modificar `src/app/page.tsx`
- [ ] Modificar `src/components/VenueSheet.tsx`
- [ ] Modificar `src/components/ProfileScreen.tsx`
- [ ] `npm run build`
- [ ] `npx cap sync`
- [ ] Probar en tablet

---

**¡Con estos cambios TODAS las funcionalidades estarán integradas y visibles!** 🎉
