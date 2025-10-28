# 🔧 APLICAR TODOS LOS CAMBIOS - GUÍA PASO A PASO

**Tiempo estimado:** 10-15 minutos  
**Archivos a modificar:** 3

---

## ✅ CHECKLIST RÁPIDO

- [ ] Modificar `src/app/page.tsx`
- [ ] Modificar `src/components/VenueSheet.tsx`
- [ ] Modificar `src/components/ProfileScreen.tsx`
- [ ] Build: `npm run build`
- [ ] Sync: `npx cap sync`
- [ ] Probar en tablet

---

## 📝 ARCHIVO 1: src/app/page.tsx

### **Paso 1.1 - Añadir import**

**Ubicación:** Línea ~31, después de:
```typescript
import { MapPin, Edit, Home as HomeIcon, Search as SearchIcon, User as UserIcon, MessageCircle } from 'lucide-react'
```

**Añadir:**
```typescript
import { addPoints, PointAction } from '@/lib/points-system'
```

### **Paso 1.2 - Integrar puntos en usar ticket**

**Ubicación:** Busca la función `handleUseTicket`, dentro de ella busca:
```typescript
setHasUsedTicketToday(true)
```

**Después de esa línea, añadir:**
```typescript

// Añadir puntos al usuario
try {
  const result = await addPoints(user.id, PointAction.TICKET_USED)
  console.log(`¡Ganaste ${result.pointsAdded} puntos! Total: ${result.newTotal}`)
} catch (error) {
  console.error('Error adding points:', error)
}
```

✅ **Guarda el archivo**

---

## 📝 ARCHIVO 2: src/components/VenueSheet.tsx

### **Paso 2.1 - Modificar import de Lucide**

**Ubicación:** Línea ~4

**Cambiar:**
```typescript
import { X, Star, DollarSign, MapPin, Globe, Image, ExternalLink, Bookmark, Navigation } from 'lucide-react'
```

**Por:**
```typescript
import { X, Star, DollarSign, MapPin, Globe, Image, ExternalLink, Bookmark, Navigation, Share2 } from 'lucide-react'
```

### **Paso 2.2 - Añadir nuevos imports**

**Ubicación:** Después de la línea ~11 (después de imports existentes)

**Añadir:**
```typescript
import { shareVenue } from '@/lib/share'
import { addPoints, PointAction } from '@/lib/points-system'
```

### **Paso 2.3 - Añadir estado isSharing**

**Ubicación:** Busca `const [isSaving, setIsSaving] = useState(false)`

**Después de esa línea, añadir:**
```typescript
const [isSharing, setIsSharing] = useState(false)
```

### **Paso 2.4 - Añadir función handleShareVenue**

**Ubicación:** Después de la función `handleSaveVenue` (después de su cierre `}`), ANTES de `handleOpenNavigation`

**Añadir:**
```typescript

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

### **Paso 2.5 - Añadir puntos al guardar**

**Ubicación:** Dentro de `handleSaveVenue`, busca estas 2 líneas:
```typescript
toast.success('¡Guardado en favoritos!')
logger.trackEvent('venue_favorited', { venueId: venue.id, venueName: venue.name })
```

**Después de esas líneas, añadir:**
```typescript

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

### **Paso 2.6 - Añadir botón compartir**

**Ubicación:** Busca el botón de guardar (el que tiene `<Bookmark`), después de su cierre `</button>`

**Añadir:**
```typescript

{/* Botón de compartir */}
<button
  onClick={handleShareVenue}
  disabled={isSharing}
  className="py-3 px-4 rounded-lg transition-colors bg-dark-secondary text-text-light hover:bg-dark-hover flex items-center justify-center disabled:opacity-50"
>
  <Share2 className="w-5 h-5" />
</button>
```

✅ **Guarda el archivo**

---

## 📝 ARCHIVO 3: src/components/ProfileScreen.tsx

### **Paso 3.1 - Modificar import de Lucide**

**Ubicación:** Línea ~5

**Cambiar:**
```typescript
import { Camera, UserPlus, Users, LogOut, Edit2 } from 'lucide-react'
```

**Por:**
```typescript
import { Camera, UserPlus, Users, LogOut, Edit2, QrCode, Star, TrendingUp } from 'lucide-react'
```

### **Paso 3.2 - Añadir nuevos imports**

**Ubicación:** Después de `import { useToastContext } from '@/contexts/ToastContext'`

**Añadir:**
```typescript
import QRScanner from './QRScanner'
import PointsBadge from './PointsBadge'
import { getUserPoints, getLevelFromPoints } from '@/lib/points-system'
```

### **Paso 3.3 - Añadir estados**

**Ubicación:** Busca `const fileInputRef = useRef<HTMLInputElement>(null)`

**Después de esa línea, añadir:**
```typescript
const [showQRScanner, setShowQRScanner] = useState(false)
const [points, setPoints] = useState(0)
const [level, setLevel] = useState(1)
```

### **Paso 3.4 - Añadir useEffect y handler**

**Ubicación:** Después de los estados, ANTES de la función `uploadAvatar`

**Añadir:**
```typescript

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

const handleQRScan = (code: string) => {
  console.log('QR Code scanned:', code)
  toast.success(`Código escaneado: ${code}`)
  // Aquí puedes procesar el código QR
}
```

### **Paso 3.5 - Añadir UI de puntos y QR**

**Ubicación:** Busca el comentario `{/* Friends Section */}`

**ANTES de ese comentario, añadir:**
```typescript

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

### **Paso 3.6 - Añadir componente QRScanner**

**Ubicación:** Al final del componente, busca el último `</div>` antes del cierre de la función

**ANTES de ese cierre, añadir:**
```typescript

{/* QR Scanner */}
<QRScanner
  isOpen={showQRScanner}
  onClose={() => setShowQRScanner(false)}
  onScan={handleQRScan}
/>
```

✅ **Guarda el archivo**

---

## 🚀 BUILD Y SYNC

Una vez aplicados todos los cambios:

```bash
cd C:\Users\guill\Desktop\PruebaApp

# Build
npm run build

# Debería compilar sin errores ✅

# Sync
npx cap sync

# Abrir Android Studio
npx cap open android

# Luego Run ▶️
```

---

## ✅ VERIFICAR QUE TODO FUNCIONA

1. **Build exitoso:** Sin errores de compilación
2. **App abre:** Se inicia correctamente
3. **Perfil:** Se ven puntos y botón QR
4. **VenueSheet:** Se ve botón compartir
5. **Usar ticket:** Ganas 10 puntos
6. **Guardar venue:** Ganas 5 puntos
7. **Compartir venue:** Ganas 5 puntos
8. **QR Scanner:** Se abre la cámara

---

## 🎯 RESULTADO ESPERADO

Después de aplicar estos cambios, **PruebaApp estará al 100%** igual que WhereTonight, con todas las funcionalidades integradas y funcionando.

---

## ❓ SI HAY ERRORES

### **Error: Cannot find module '@/lib/points-system'**
```bash
# Verificar que exista el archivo
dir src\lib\points-system.ts
# Si no existe, copiar de WhereTonight
```

### **Error: Cannot find module '@/lib/share'**
```bash
# Verificar que exista el archivo
dir src\lib\share.ts
# Si no existe, copiar de WhereTonight
```

### **Error: Cannot find module './QRScanner'**
```bash
# Verificar que exista el archivo
dir src\components\QRScanner.tsx
# Si no existe, copiar de WhereTonight
```

### **Error de tipos en Buffer o Timeout**
```
# Aplicar los mismos fixes que en WhereTonight:
# - Buffer: añadir "as any"
# - Timeout: cambiar a ReturnType<typeof setTimeout>
```

---

**¡Sigue esta guía paso a paso y tendrás PruebaApp al 100%!** 🎉
