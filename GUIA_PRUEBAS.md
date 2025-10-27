# 🧪 GUÍA COMPLETA DE PRUEBAS - WhereTonight

**Versión:** 0.1.0  
**Fecha:** 27 de octubre de 2025

---

## 📱 PREPARACIÓN PARA PRUEBAS

### **Requisitos:**
- ✅ Dispositivo Android con USB debugging habilitado
- ✅ Cable USB conectado a la PC
- ✅ Android Studio instalado
- ✅ Conexión a Internet en el dispositivo
- ✅ GPS habilitado en el dispositivo
- ✅ Cuenta de Supabase activa

### **Abrir la app en Android Studio:**
```bash
cd c:\Users\guill\Desktop\PruebaApp
npx cap open android
```

### **Ejecutar en dispositivo:**
1. En Android Studio: selecciona tu dispositivo
2. Click en Run ▶️ (botón verde)
3. Espera a que compile e instale
4. La app se abrirá automáticamente

---

## 🧪 CHECKLIST DE PRUEBAS

### **1. INICIO DE LA APLICACIÓN** 🚀

#### Test 1.1: Primera apertura
- [ ] La app abre sin crashes
- [ ] Aparece splash screen (si existe)
- [ ] Se carga la pantalla principal
- [ ] No hay pantallas en blanco

#### Test 1.2: Rendimiento inicial
- [ ] La app carga en menos de 3 segundos
- [ ] No hay lag visible
- [ ] Las animaciones son fluidas

#### Test 1.3: Orientación
- [ ] La app funciona en modo vertical
- [ ] La app funciona en modo horizontal (si aplica)
- [ ] No hay problemas al rotar el dispositivo

**🐛 Problemas comunes:**
- App crashea al abrir → Ver logs en Logcat
- Pantalla blanca → Verificar que `out/` tenga archivos
- Carga lenta → Verificar conexión a Supabase

---

### **2. MAPA Y VENUES** 🗺️

#### Test 2.1: Carga del mapa
- [ ] El mapa se carga correctamente
- [ ] Los tiles del mapa aparecen
- [ ] El mapa tiene los estilos correctos
- [ ] No hay errores de MapLibre

#### Test 2.2: Marcadores de venues
- [ ] Los venues aparecen en el mapa
- [ ] Los marcadores tienen el diseño correcto
- [ ] Los números de personas se muestran
- [ ] Los colores corresponden al tipo de venue

#### Test 2.3: Interacción con el mapa
- [ ] Puedo hacer zoom in/out con pellizco
- [ ] Puedo hacer pan (arrastrar)
- [ ] Los marcadores reaccionan al zoom
- [ ] La transición de zoom es suave

#### Test 2.4: Click en venue
- [ ] Al tocar un marcador se abre el sheet
- [ ] El sheet muestra la información correcta
- [ ] Las fotos del venue se cargan
- [ ] El carousel de fotos funciona

**🐛 Problemas comunes:**
- Mapa no carga → Verificar API key de MapLibre
- Venues no aparecen → Verificar conexión a Supabase
- Marcadores desaparecen → Issue conocido de zoom, verificar código

---

### **3. GEOLOCALIZACIÓN** 📍

#### Test 3.1: Solicitud de permisos
- [ ] Al presionar botón "Mi ubicación", aparece diálogo de permisos
- [ ] El diálogo tiene el texto correcto
- [ ] Puedo aceptar o denegar

#### Test 3.2: Con permisos concedidos
- [ ] Se muestra mi ubicación en el mapa
- [ ] Aparece marcador azul/cyan en mi posición
- [ ] El mapa se centra en mi ubicación
- [ ] La animación de centrado es suave

#### Test 3.3: Sin permisos
- [ ] Aparece mensaje de error apropiado
- [ ] La app no crashea
- [ ] Puedo volver a intentarlo

#### Test 3.4: Precisión
- [ ] La ubicación es precisa (dentro de 10-20m)
- [ ] Se actualiza si me muevo
- [ ] No hay saltos bruscos en la posición

**🐛 Problemas comunes:**
- Permisos no aparecen → Verificar AndroidManifest.xml
- Ubicación imprecisa → Verificar que GPS esté habilitado
- App crashea → Verificar código de manejo de errores

---

### **4. AUTENTICACIÓN** 🔐

#### Test 4.1: Registro de usuario
- [ ] Puedo abrir el modal de registro
- [ ] Puedo ingresar email y contraseña
- [ ] Puedo registrarme exitosamente
- [ ] Recibo confirmación visual (toast)

#### Test 4.2: Login
- [ ] Puedo abrir el modal de login
- [ ] Puedo ingresar credenciales
- [ ] Puedo hacer login exitosamente
- [ ] Aparece mi perfil después del login

#### Test 4.3: Persistencia de sesión
- [ ] Si cierro y abro la app, sigo logueado
- [ ] Mi avatar aparece en el dock
- [ ] Mis datos de perfil están disponibles

#### Test 4.4: Logout
- [ ] Puedo cerrar sesión
- [ ] Me deslogueo correctamente
- [ ] El estado se actualiza en la UI

**🐛 Problemas comunes:**
- No puedo registrarme → Verificar Supabase Auth está habilitado
- Sesión no persiste → Verificar localStorage/AsyncStorage
- Errors de autenticación → Ver logs de Supabase

---

### **5. PERFIL Y CÁMARA** 📸

#### Test 5.1: Ver perfil
- [ ] Puedo abrir mi perfil desde el dock
- [ ] Se muestra mi username y bio
- [ ] Se muestra mi avatar (o iniciales)
- [ ] Se muestra mi historial de tickets

#### Test 5.2: Editar perfil
- [ ] Puedo abrir el modal de edición
- [ ] Puedo cambiar mi username
- [ ] Puedo cambiar mi bio
- [ ] Los cambios se guardan correctamente

#### Test 5.3: Cámara - Tomar foto
- [ ] Al presionar botón de cámara, aparece selector
- [ ] Puedo elegir "Tomar foto"
- [ ] Se solicita permiso de cámara
- [ ] Se abre la cámara nativa
- [ ] Puedo tomar una foto
- [ ] Puedo editar/recortar la foto
- [ ] La foto se previsualiza correctamente

#### Test 5.4: Galería - Elegir foto
- [ ] Puedo elegir "Galería" en el selector
- [ ] Se solicita permiso de almacenamiento
- [ ] Se abre la galería nativa
- [ ] Puedo seleccionar una foto
- [ ] Puedo editar/recortar la foto
- [ ] La foto se previsualiza correctamente

#### Test 5.5: Subir foto
- [ ] La foto se sube a Supabase Storage
- [ ] Aparece indicador de carga
- [ ] La foto se muestra en mi perfil
- [ ] La foto se ve en el dock
- [ ] El tamaño es apropiado (< 2MB)

**🐛 Problemas comunes:**
- Permisos de cámara no aparecen → Verificar Info.plist/AndroidManifest
- Foto no se sube → Verificar bucket de Supabase
- Foto muy grande → Verificar límite de tamaño

---

### **6. TICKETS Y ACTIVIDAD** 🎫

#### Test 6.1: Ver detalles de venue
- [ ] Puedo abrir el sheet de un venue
- [ ] Se muestran fotos, nombre, tipo
- [ ] Se muestra el contador de personas
- [ ] Se muestra el botón de ticket

#### Test 6.2: Usar ticket (primera vez del día)
- [ ] Puedo presionar el botón "Voy"
- [ ] Aparece modal de confirmación
- [ ] Puedo confirmar o cancelar
- [ ] Al confirmar, siento vibración (haptic)
- [ ] Aparece mensaje de éxito
- [ ] El contador se actualiza (+1)

#### Test 6.3: Usar ticket (segunda vez del día)
- [ ] El botón de ticket está deshabilitado
- [ ] Aparece mensaje "Ya usaste tu ticket hoy"
- [ ] No puedo usar otro ticket

#### Test 6.4: Nuevo día
- [ ] Al día siguiente, puedo usar ticket de nuevo
- [ ] El estado se reinicia correctamente
- [ ] Mi historial se guarda

#### Test 6.5: Feed de actividad
- [ ] Mi uso de ticket aparece en el feed
- [ ] Veo actividad de mis amigos
- [ ] Las timestamps son correctas

**🐛 Problemas comunes:**
- Ticket no se registra → Verificar función useTicket()
- Contador no actualiza → Verificar refresh de venues
- Haptic no funciona → Normal en algunos dispositivos/emuladores

---

### **7. HAPTIC FEEDBACK** 📳

#### Test 7.1: Vibración en tickets
- [ ] Siento vibración al usar ticket exitosamente
- [ ] Vibración de éxito es distintiva
- [ ] Siento vibración si hay error

#### Test 7.2: Otros haptics
- [ ] Vibración en botones importantes (si aplica)
- [ ] Vibración es apropiada (no muy fuerte)
- [ ] Vibración no molesta la experiencia

**🐛 Problemas comunes:**
- No vibra → Normal en emuladores
- Vibra demasiado → Ajustar intensidad en código
- No vibra en iOS → Verificar permisos

---

### **8. STATUS BAR** 📱

#### Test 8.1: Apariencia
- [ ] Status bar tiene estilo oscuro
- [ ] Color de fondo es correcto (#0f0f1e)
- [ ] Hora e iconos son visibles
- [ ] No hay overlap con contenido

#### Test 8.2: Comportamiento
- [ ] Status bar persiste en todas las pantallas
- [ ] No cambia de color inesperadamente
- [ ] Se adapta a notificaciones

**🐛 Problemas comunes:**
- Status bar blanca → Verificar configuración de StatusBar
- Overlap con contenido → Ajustar padding superior

---

### **9. NAVEGACIÓN Y UI** 🧭

#### Test 9.1: Dock inferior
- [ ] El dock es visible siempre
- [ ] Los iconos son claros
- [ ] Puedo navegar entre tabs
- [ ] Las transiciones son suaves

#### Test 9.2: Barra superior
- [ ] Puedo ver y buscar ciudades
- [ ] El selector de ciudad funciona
- [ ] Puedo aplicar filtros
- [ ] Los filtros funcionan correctamente

#### Test 9.3: Modales y sheets
- [ ] Los modales se abren correctamente
- [ ] Puedo cerrarlos con botón X
- [ ] Puedo cerrarlos con gesto de deslizar
- [ ] No hay problemas de z-index

#### Test 9.4: Búsqueda
- [ ] Puedo buscar venues
- [ ] Los resultados aparecen en tiempo real
- [ ] Puedo limpiar la búsqueda
- [ ] La búsqueda es rápida

**🐛 Problemas comunes:**
- Dock desaparece → Verificar z-index
- Modales no cierran → Verificar event handlers
- Búsqueda lenta → Optimizar queries

---

### **10. PERFORMANCE Y ESTABILIDAD** ⚡

#### Test 10.1: Uso de memoria
- [ ] La app no consume memoria excesiva
- [ ] No hay memory leaks visibles
- [ ] La app no se vuelve lenta con el tiempo

#### Test 10.2: Uso de batería
- [ ] El consumo de batería es razonable
- [ ] No hay uso excesivo de GPS
- [ ] El dispositivo no se calienta

#### Test 10.3: Conexión de red
- [ ] La app funciona con WiFi
- [ ] La app funciona con datos móviles
- [ ] Maneja bien pérdida de conexión
- [ ] Reconecta automáticamente

#### Test 10.4: Casos extremos
- [ ] Funciona con muchos venues (100+)
- [ ] Funciona con 0 venues
- [ ] Funciona sin sesión de usuario
- [ ] Funciona en modo avión (con limitaciones)

**🐛 Problemas comunes:**
- App lenta → Verificar renders innecesarios
- Consume batería → Verificar polling continuo
- Crashea con muchos datos → Optimizar queries

---

### **11. COMPATIBILIDAD** 📲

#### Test 11.1: Versiones de Android
- [ ] Funciona en Android 10
- [ ] Funciona en Android 11
- [ ] Funciona en Android 12
- [ ] Funciona en Android 13+

#### Test 11.2: Tamaños de pantalla
- [ ] Funciona en pantallas pequeñas (5")
- [ ] Funciona en pantallas medianas (6")
- [ ] Funciona en pantallas grandes (6.5"+)
- [ ] Funciona en tablets (si aplica)

#### Test 11.3: Fabricantes
- [ ] Funciona en Samsung
- [ ] Funciona en Xiaomi
- [ ] Funciona en Huawei
- [ ] Funciona en Google Pixel

**🐛 Problemas comunes:**
- Problemas en Samsung → Verificar One UI
- Problemas en Xiaomi → Verificar MIUI permisos
- Fuentes diferentes → Usar fuentes del sistema

---

## 🐛 DEBUGGING Y LOGS

### **Ver logs en tiempo real:**

#### Android Studio - Logcat:
1. View → Tool Windows → Logcat
2. Filtrar por nombre de paquete: `com.wheretonight.app`
3. Buscar errores en rojo

#### Chrome DevTools:
1. Conectar dispositivo
2. Abrir Chrome en PC
3. Ir a `chrome://inspect`
4. Click en "Inspect" bajo tu dispositivo
5. Ver Console para logs JavaScript

### **Comandos útiles:**

```bash
# Ver logs en tiempo real
npx cap run android

# Ver solo errores
adb logcat *:E

# Limpiar logs
adb logcat -c

# Ver logs de Capacitor
adb logcat | grep "Capacitor"
```

---

## 📊 CRITERIOS DE ÉXITO

### **Funcionalidades Críticas (MUST WORK):**
- ✅ La app abre sin crashes
- ✅ El mapa se carga y muestra venues
- ✅ Puedo usar mi ticket diario
- ✅ Puedo hacer login/registro
- ✅ La geolocalización funciona

### **Funcionalidades Importantes (SHOULD WORK):**
- ✅ La cámara funciona
- ✅ Puedo editar mi perfil
- ✅ Puedo ver mi historial
- ✅ El haptic feedback funciona
- ✅ El feed de actividad se actualiza

### **Funcionalidades Opcionales (NICE TO HAVE):**
- ✅ Las animaciones son fluidas
- ✅ La búsqueda es instantánea
- ✅ Los filtros funcionan perfectamente
- ✅ El rendimiento es óptimo

---

## 📝 REPORTE DE BUGS

### **Template para reportar bugs:**

```markdown
**Título:** [Descripción breve del bug]

**Severidad:** 🔴 Crítico / 🟡 Importante / 🟢 Menor

**Pasos para reproducir:**
1. Abrir la app
2. Ir a [pantalla]
3. Tocar [botón]
4. Observar [comportamiento]

**Comportamiento esperado:**
[Qué debería pasar]

**Comportamiento actual:**
[Qué pasa realmente]

**Dispositivo:**
- Marca: [Samsung/Xiaomi/etc]
- Modelo: [Galaxy S21/Mi 11/etc]
- Android: [Versión]

**Logs:**
```
[Copiar logs relevantes de Logcat]
```

**Screenshots:**
[Si aplica]
```

---

## ✅ CHECKLIST FINAL

Antes de considerar las pruebas completas:

- [ ] Todas las funcionalidades críticas funcionan
- [ ] No hay crashes reproducibles
- [ ] Los permisos se solicitan correctamente
- [ ] La performance es aceptable
- [ ] Probado en al menos 2 dispositivos diferentes
- [ ] Probado con y sin conexión
- [ ] Probado con y sin sesión de usuario
- [ ] Todos los bugs críticos están resueltos
- [ ] La experiencia de usuario es fluida

---

## 🎯 SIGUIENTE PASO

Cuando todas las pruebas sean exitosas:
- Documentar cualquier bug encontrado
- Corregir bugs críticos
- Re-probar después de correcciones
- Proceder a ETAPA 9: Publicación

---

**¡Buena suerte con las pruebas!** 🚀
