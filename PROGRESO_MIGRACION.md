# 📊 PROGRESO DE MIGRACIÓN - PruebaApp

**Fecha inicio:** 26 de octubre de 2025  
**Proyecto origen:** WhereTonight  
**Proyecto destino:** PruebaApp

---

## ✅ COMPLETADO

### ETAPA 1: Preparación del Proyecto ✅
- [x] Carpeta PruebaApp creada
- [x] `next.config.js` modificado con `output: 'export'`
- [x] `images.unoptimized: true` agregado
- [x] Verificado: Configuración lista para export estático

### ETAPA 2: Migración de API Routes ✅ (Archivos creados)
- [x] Estructura de carpetas `src/lib/api/` creada
- [x] `src/lib/api/venues.ts` - Gestión de venues
- [x] `src/lib/api/tickets.ts` - Sistema de tickets
- [x] `src/lib/api/activity.ts` - Feed de actividades
- [x] `src/lib/api/friendships.ts` - Sistema de amigos
- [x] `src/lib/api/social-posts.ts` - Posts sociales
- [x] `src/lib/api/photos.ts` - URLs de fotos
- [x] `src/lib/api/index.ts` - Re-exports

---

## 🔄 EN PROGRESO

### ETAPA 4: Instalación de Capacitor
- [ ] Instalar `@capacitor/core` y `@capacitor/cli`
- [ ] `npx cap init`
- [ ] Añadir plataformas Android/iOS

---

## ✅ COMPLETADO (CONTINUACIÓN)

### ETAPA 2: Migración de API Routes ✅ (COMPLETADA)
- [x] Copiar archivos fuente desde WhereTonight
- [x] Actualizar `src/contexts/VenueContext.tsx` - ✅ Migrado a getVenues()
- [x] Actualizar `src/app/page.tsx` - ✅ Migrado a useTicket(), checkTicketUsedToday(), createActivity()
- [x] Verificar que no quedan llamadas a `/api/*` - ✅ Sin resultados en búsqueda

### ETAPA 3: Edge Function para Fotos ✅ (COMPLETADA)
- [x] Crear carpeta `supabase/functions/photo-proxy/`
- [x] Implementar Edge Function con fallbacks
- [x] Actualizar `VenueImageCarousel.tsx` - ✅ Usa getPhotoUrl()
- [x] Actualizar `PhotoCarousel.tsx` - ✅ Usa getPhotoUrl()
- [x] Función lista para desplegar (pendiente: `supabase functions deploy`)

---

## 📋 PENDIENTE

### ETAPA 3: Edge Function para Fotos
- [ ] Instalar Supabase CLI
- [ ] Crear función `photo-proxy`
- [ ] Configurar secrets
- [ ] Desplegar función

### ETAPA 4: Instalación de Capacitor
- [ ] Instalar `@capacitor/core` y `@capacitor/cli`
- [ ] `npx cap init`
- [ ] Añadir plataformas Android/iOS
- [ ] Instalar plugins nativos

### ETAPA 5: Funcionalidades Nativas
- [ ] Implementar geolocalización
- [ ] Implementar cámara
- [ ] Configurar Status Bar
- [ ] Agregar Haptics

### ETAPA 6: Permisos
- [ ] Configurar permisos Android
- [ ] Configurar permisos iOS

### ETAPA 7: Build y Sincronización
- [ ] `npm run build`
- [ ] `npx cap sync`
- [ ] Abrir en Android Studio
- [ ] Abrir en Xcode

### ETAPA 8: Pruebas
- [ ] Pruebas en dispositivo Android
- [ ] Pruebas en dispositivo iOS
- [ ] Verificar todas las funcionalidades

### ETAPA 9: Publicación
- [ ] Generar AAB para Android
- [ ] Generar IPA para iOS
- [ ] Subir a tiendas

---

## 📝 NOTAS

- El proceso de copia con xcopy está en background copiando node_modules
- Los archivos de API se crearon manualmente adelantándonos al proceso
- Siguiente paso: Copiar archivos fuente necesarios y actualizar imports

---

## 🚀 PRÓXIMOS PASOS INMEDIATOS

1. Copiar componentes y contextos desde WhereTonight
2. Actualizar imports en componentes principales
3. Continuar con ETAPA 3 (Edge Function)
