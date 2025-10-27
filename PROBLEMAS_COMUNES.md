# 🔧 PROBLEMAS COMUNES Y SOLUCIONES

Guía rápida para resolver los problemas más frecuentes durante las pruebas.

---

## 🚨 PROBLEMAS CRÍTICOS

### ❌ La app crashea al abrir

**Síntomas:**
- La app se abre y cierra inmediatamente
- Pantalla negra y luego vuelve al home
- Mensaje "La app ha dejado de funcionar"

**Causas posibles:**
1. Error en el código JavaScript
2. Assets no sincronizados
3. Permisos faltantes
4. Error en Supabase connection

**Soluciones:**

```bash
# 1. Ver logs para identificar el error
npx cap run android

# 2. Limpiar y rebuild
npm run build
npx cap sync
adb uninstall com.wheretonight.app
npx cap run android

# 3. Verificar .env.local
# Asegúrate de que SUPABASE_URL y SUPABASE_ANON_KEY estén correctos
```

**Si persiste:**
- Revisar Logcat en Android Studio (View → Tool Windows → Logcat)
- Buscar líneas en ROJO con "ERROR" o "FATAL"
- Copiar el stack trace y buscar en Google

---

### ❌ Pantalla blanca al abrir

**Síntomas:**
- La app abre pero solo muestra pantalla blanca
- No aparece nada después de varios segundos
- No hay errores visibles

**Causas posibles:**
1. Carpeta `out/` vacía o no generada
2. JavaScript no se está cargando
3. Error en el routing de Next.js
4. Service Worker bloqueando

**Soluciones:**

```bash
# 1. Verificar que out/ existe y tiene archivos
dir out

# 2. Rebuild completo
rm -rf out
rm -rf .next
npm run build
npx cap sync

# 3. Verificar en Chrome DevTools
# chrome://inspect → Ver Console
```

**Verificar:**
- `out/index.html` existe
- `out/_next/` tiene chunks
- No hay errores 404 en Network tab

---

### ❌ "Module not found" o imports fallando

**Síntomas:**
- Error en consola: "Cannot find module '@/...'""
- Imports con @ no funcionan
- TypeScript dice que no encuentra archivos

**Causa:**
- Paths de TypeScript no configurados para build

**Solución:**

Verificar `tsconfig.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

Luego rebuild:
```bash
npm run build
npx cap sync
```

---

## 🗺️ PROBLEMAS DEL MAPA

### ❌ El mapa no se carga

**Síntomas:**
- Área gris donde debería estar el mapa
- Tiles no aparecen
- Console muestra errores de MapLibre

**Causas posibles:**
1. No hay conexión a internet
2. API key de mapa no configurada
3. Librería MapLibre no cargada

**Soluciones:**

```bash
# 1. Verificar que el dispositivo tiene internet
# Abrir navegador en el dispositivo

# 2. Verificar instalación de maplibre-gl
npm install maplibre-gl@4.7.1

# 3. Rebuild
npm run build
npx cap copy android
```

**En Chrome DevTools:**
- Ver Network tab
- Buscar peticiones a tiles de mapa
- Si hay 404, problema con el mapa base

---

### ❌ Marcadores no aparecen

**Síntomas:**
- El mapa carga pero no hay marcadores
- Los venues existen en Supabase pero no se muestran

**Causa:**
- Error en la query de Supabase
- Venues no tienen coordenadas
- Error en el render de marcadores

**Soluciones:**

```javascript
// Verificar en Chrome DevTools Console:
// 1. Abrir console
// 2. Ejecutar:
console.log(venues)

// Debería mostrar array de venues
// Si está vacío, problema con Supabase
```

**Verificar en código:**
1. `src/lib/api/venues.ts` → función `getVenues()`
2. Verificar que la query no tiene errores
3. Verificar que venues tienen `latitude` y `longitude`

---

## 📍 PROBLEMAS DE GEOLOCALIZACIÓN

### ❌ Permisos de ubicación no aparecen

**Síntomas:**
- Presiono "Mi ubicación" y no pasa nada
- No aparece diálogo de permisos
- Console muestra "Permission denied"

**Causa:**
- Permisos no están en AndroidManifest.xml
- Ya denegué el permiso anteriormente

**Soluciones:**

```bash
# 1. Verificar AndroidManifest.xml
# Debe tener:
# <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```

**Si ya denegué el permiso:**
1. Ir a Ajustes del dispositivo
2. Apps → WhereTonight
3. Permisos
4. Ubicación → Permitir

**O reinstalar la app:**
```bash
adb uninstall com.wheretonight.app
npx cap run android
```

---

### ❌ Ubicación muy imprecisa

**Síntomas:**
- Me ubica a varios km de distancia
- La ubicación salta constantemente
- Marcador se mueve erráticamente

**Causa:**
- GPS no está habilitado
- Usando solo WiFi/Red móvil
- `enableHighAccuracy: false`

**Soluciones:**

1. **Habilitar GPS** en el dispositivo
2. **Ir al exterior** (GPS funciona mejor fuera)
3. **Verificar código** en `src/components/Map.tsx`:

```typescript
Geolocation.getCurrentPosition({
  enableHighAccuracy: true,  // ← Debe ser true
  timeout: 10000,
  maximumAge: 0
})
```

---

## 📸 PROBLEMAS DE CÁMARA

### ❌ Permisos de cámara no aparecen

**Síntoma:**
- Presiono botón de cámara y no pasa nada
- No aparece diálogo de permisos

**Soluciones:**

```bash
# 1. Verificar AndroidManifest.xml
# Debe tener:
# <uses-permission android:name="android.permission.CAMERA" />

# 2. Verificar que Camera plugin está instalado
npm list @capacitor/camera

# 3. Si no está:
npm install @capacitor/camera
npx cap sync
```

---

### ❌ La foto no se sube

**Síntomas:**
- Tomo la foto correctamente
- La veo en preview
- Al guardar, no aparece en mi perfil
- Console muestra error de Supabase

**Causa:**
- Bucket de Supabase no existe
- Políticas de storage incorrectas
- Foto muy grande (> 2MB)

**Soluciones:**

1. **Verificar bucket en Supabase:**
   - Ir a Supabase Dashboard
   - Storage → Buckets
   - Debe existir bucket `avatars`
   - Debe ser público

2. **Verificar políticas:**
   - Storage → Policies
   - Debe permitir INSERT y SELECT para usuarios autenticados

3. **Verificar tamaño:**
   ```javascript
   // En EditProfileModal.tsx
   if (file.size > 2 * 1024 * 1024) {
     // Error: archivo muy grande
   }
   ```

---

## 🎫 PROBLEMAS DE TICKETS

### ❌ No puedo usar mi ticket

**Síntomas:**
- Botón "Voy" está deshabilitado
- Dice "Ya usaste tu ticket hoy" pero no lo he usado
- El ticket no se registra

**Causa:**
- Fecha/hora del dispositivo incorrecta
- Error en función `checkTicketUsedToday()`
- Row ya existe en base de datos

**Soluciones:**

```bash
# 1. Verificar fecha del dispositivo
# Settings → Date & Time → Automatic

# 2. Verificar en Supabase
# Ir a Table Editor → tickets
# Buscar tu user_id con local_date = hoy
# Si existe y no debería, eliminar el row
```

**En código:**
```javascript
// Verificar en Chrome DevTools:
console.log(new Date().toISOString().split('T')[0])
// Debe mostrar: "2025-10-27" (fecha de hoy)
```

---

### ❌ El contador no se actualiza

**Síntomas:**
- Uso mi ticket
- Aparece mensaje de éxito
- El contador sigue igual (no suma +1)

**Causa:**
- Venues no se recargan
- Cache del VenueContext
- Error en `loadVenues()`

**Solución:**

```javascript
// Verificar que después de usar ticket se llama:
await loadVenues()

// En src/app/page.tsx, función handleUseTicket
```

**Workaround temporal:**
- Cerrar y abrir la app
- El contador debería actualizarse

---

## 📳 PROBLEMAS DE HAPTICS

### ❌ No siento vibraciones

**Síntomas:**
- Uso ticket pero no vibra
- Todas las funciones de haptic no responden

**Causas:**
- Normal en emuladores (no tienen vibración)
- Modo "No molestar" activo
- Vibración deshabilitada en ajustes

**Verificaciones:**

1. **¿Estás en un emulador?**
   - Los emuladores NO pueden vibrar
   - Probar en dispositivo físico real

2. **Verificar ajustes del dispositivo:**
   - Settings → Sound & Vibration
   - Touch vibration → ON
   - No molestar → OFF

3. **Verificar código:**
   ```javascript
   // En src/lib/capacitor-config.ts
   // Las funciones de haptic deben tener try/catch
   ```

---

## 🔌 PROBLEMAS DE CONEXIÓN

### ❌ "Network request failed"

**Síntomas:**
- Error al cargar venues
- Error al hacer login
- Console: "Network request failed"

**Causas:**
1. No hay internet en el dispositivo
2. Supabase URL incorrecta
3. Firewall bloqueando

**Soluciones:**

```bash
# 1. Verificar internet en dispositivo
# Abrir navegador y cargar google.com

# 2. Verificar .env.local
cat .env.local

# 3. Verificar que las variables lleguen a la app
# En Chrome DevTools Console:
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)
```

**Si las variables no aparecen:**
- Rebuild necesario cuando cambias .env
```bash
npm run build
npx cap sync
```

---

## 🐛 PROBLEMAS DE PERFORMANCE

### ❌ La app va lenta

**Síntomas:**
- Lag al hacer scroll
- Animaciones entrecortadas
- Se congela por momentos

**Causas:**
- Demasiados re-renders
- Imágenes muy pesadas
- Listeners no limpiados

**Soluciones:**

1. **Optimizar imágenes:**
   - Usar `width` y `height` en imágenes
   - Lazy loading

2. **React Developer Tools:**
   ```bash
   # Instalar extensión en Chrome
   # Usar Profiler para ver re-renders
   ```

3. **Verificar memory leaks:**
   - Chrome DevTools → Performance
   - Record durante 10 segundos
   - Ver si memory crece constantemente

---

## 🔄 PROBLEMAS DE BUILD

### ❌ "Build failed"

**Síntomas:**
- `npm run build` falla
- Errores de TypeScript
- Errores de lint

**Soluciones:**

```bash
# 1. Ver el error completo
npm run build 2>&1 | more

# 2. Limpiar y rebuild
rm -rf .next
rm -rf out
npm install
npm run build

# 3. Si es error de tipos:
# Verificar tsconfig.json
# Comentar temporalmente strict: false
```

---

## 📱 PROBLEMAS POR DISPOSITIVO

### Samsung (One UI)

**Problema:** Permisos se niegan automáticamente
**Solución:** Settings → Apps → WhereTonight → Permissions → Establecer manualmente

**Problema:** App se cierra en background
**Solución:** Settings → Battery → App power management → WhereTonight → Sin optimizar

### Xiaomi (MIUI)

**Problema:** Permisos adicionales requeridos
**Solución:** Settings → Additional Settings → Privacy → Special permissions

**Problema:** GPS no funciona bien
**Solución:** Settings → Additional Settings → Battery & Performance → Manage apps battery → WhereTonight → No restrictions

### Huawei

**Problema:** No tiene Google Services
**Solución:** MapLibre funciona sin Google Services ✅

---

## 🆘 ÚLTIMO RECURSO

Si nada funciona:

```bash
# 1. Desinstalar completamente
adb uninstall com.wheretonight.app

# 2. Limpiar todo
rm -rf .next
rm -rf out
rm -rf node_modules
rm -rf android
rm -rf ios

# 3. Reinstalar todo
npm install
npm run build
npx cap add android
npx cap sync

# 4. Abrir en Android Studio
npx cap open android

# 5. En Android Studio: Build → Clean Project
# 6. Luego: Build → Rebuild Project
# 7. Run ▶️
```

---

## 📞 OBTENER AYUDA

### Logs completos:
```bash
npx cap run android > logs.txt 2>&1
# Enviar logs.txt
```

### Información del sistema:
```bash
npx cap doctor > system-info.txt
npm list > packages.txt
# Enviar ambos archivos
```

### Screenshots:
- Chrome DevTools → Console (con errores visibles)
- Android Studio → Logcat (con filtro de errores)
- El dispositivo mostrando el problema

---

**¡Buena suerte!** Si encuentras un nuevo problema no listado aquí, documéntalo para ayudar a otros. 🚀
