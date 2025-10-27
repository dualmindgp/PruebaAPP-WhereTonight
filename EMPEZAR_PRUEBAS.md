# 🚀 CÓMO EMPEZAR LAS PRUEBAS - GUÍA RÁPIDA

**5 minutos para empezar a probar tu app en Android** 📱

---

## ⚡ START RÁPIDO

### **1. Preparar el dispositivo Android (2 min)**

```
1. En tu Android:
   Settings → About Phone
   → Tap "Build Number" 7 veces
   → Aparece "You are now a developer!"

2. Regresar a Settings:
   Settings → Developer Options
   → USB Debugging → ON

3. Conectar cable USB a la PC

4. En el dispositivo, aparecerá:
   "Allow USB debugging?"
   → ✅ ALWAYS ALLOW
```

### **2. Verificar conexión (30 segundos)**

```bash
# En la terminal de la PC:
cd c:\Users\guill\Desktop\PruebaApp

# Ver si el dispositivo está conectado:
adb devices

# Deberías ver:
# List of devices attached
# ABC123XYZ    device

# Si no aparece, desconecta y vuelve a conectar el cable
```

### **3. Abrir en Android Studio (1 min)**

```bash
# Abrir el proyecto Android:
npx cap open android

# Esto abrirá Android Studio
# Espera a que cargue (primera vez tarda ~1-2 min)
```

### **4. Ejecutar la app (1 min)**

```
1. En Android Studio:
   - Arriba, al lado del martillo 🔨
   - Hay un dropdown con dispositivos
   - Selecciona tu dispositivo (no "Emulator")

2. Click en el botón RUN ▶️ (verde)

3. Espera a que compile (~1-2 min)

4. ¡La app se abrirá en tu dispositivo!
```

---

## 🧪 PRIMERAS PRUEBAS (5 min)

### **Test Básico #1: La app abre**
- [ ] La app abre sin crashear
- [ ] Veo la pantalla principal
- [ ] Veo el mapa

✅ **FUNCIONA** → Continúa  
❌ **NO FUNCIONA** → Ver `PROBLEMAS_COMUNES.md`

---

### **Test Básico #2: El mapa funciona**
- [ ] El mapa se carga y veo tiles
- [ ] Aparecen marcadores de venues
- [ ] Puedo hacer zoom con pellizco
- [ ] Puedo arrastrar el mapa

✅ **FUNCIONA** → Continúa  
❌ **NO FUNCIONA** → Ver sección "Mapa no carga" en `PROBLEMAS_COMUNES.md`

---

### **Test Básico #3: Geolocalización**
1. Toca el botón de "Mi ubicación" (GPS icon)
2. Debe aparecer diálogo: "Permitir ubicación?"
3. Toca "Permitir" o "Mientras uso la app"
4. El mapa se debe centrar en tu ubicación

- [ ] Aparece el diálogo de permisos
- [ ] El mapa se centra en mi ubicación
- [ ] Veo un marcador azul/cyan en mi posición

✅ **FUNCIONA** → Continúa  
❌ **NO FUNCIONA** → Ver sección "Geolocalización" en `PROBLEMAS_COMUNES.md`

---

### **Test Básico #4: Autenticación**
1. Toca el botón de perfil (abajo a la derecha)
2. Si no has iniciado sesión, toca "Login"
3. Ingresa email y contraseña (o regístrate)
4. Toca "Sign In"

- [ ] Puedo abrir el modal de login
- [ ] Puedo ingresar credenciales
- [ ] Puedo hacer login exitosamente

✅ **FUNCIONA** → Continúa  
❌ **NO FUNCIONA** → Ver sección "Autenticación" en `PROBLEMAS_COMUNES.md`

---

### **Test Básico #5: Usar un ticket**
1. Toca un marcador en el mapa
2. Se abre un sheet con info del venue
3. Toca el botón "Voy" (o "I'm Going")
4. Confirma en el modal
5. Deberías sentir vibración

- [ ] Se abre el sheet correctamente
- [ ] Puedo usar el ticket
- [ ] Siento vibración (haptic)
- [ ] Aparece mensaje de éxito
- [ ] El contador se actualiza (+1)

✅ **FUNCIONA** → ¡Todo bien!  
❌ **NO FUNCIONA** → Ver sección "Tickets" en `PROBLEMAS_COMUNES.md`

---

## ✅ SI TODO FUNCIONA

**¡Felicidades! Las funcionalidades básicas funcionan.** 🎉

### **Siguiente paso:**

Abre `GUIA_PRUEBAS.md` para hacer pruebas más exhaustivas:
- Cámara
- Edición de perfil
- Casos edge
- Performance
- Compatibilidad

**Tiempo estimado:** 1-2 horas para pruebas completas

---

## ❌ SI ALGO NO FUNCIONA

### **Ver logs en tiempo real:**

```bash
# Opción 1: Script helper
debug-helper.bat
# Selecciona opción 1

# Opción 2: Manual
npx cap run android
```

### **Consultar documentación:**

1. **Para problemas comunes:**
   - Abre `PROBLEMAS_COMUNES.md`
   - Busca tu problema
   - Sigue la solución paso a paso

2. **Para debugging avanzado:**
   - Abre `GUIA_PRUEBAS.md`
   - Ve a la sección "Debugging y Logs"

3. **Chrome DevTools:**
   ```
   1. Dispositivo conectado, app abierta
   2. Chrome en PC → chrome://inspect
   3. Click "Inspect"
   4. Ver Console, Network, etc.
   ```

---

## 🛠️ COMANDOS ÚTILES

```bash
# Ver dispositivos conectados
adb devices

# Desinstalar app
adb uninstall com.wheretonight.app

# Reinstalar app
npx cap run android

# Rebuild rápido
npm run build && npx cap copy android

# Ver solo errores
adb logcat *:E

# Abrir Android Studio
npx cap open android
```

---

## 📱 TROUBLESHOOTING RÁPIDO

### Dispositivo no aparece en `adb devices`
```bash
# 1. Desconectar y reconectar cable
# 2. En el dispositivo: revocar autorizaciones USB
# Settings → Developer Options → Revoke USB Debugging authorizations
# 3. Volver a conectar y autorizar
```

### App crashea inmediatamente
```bash
# Ver el error:
npx cap run android

# O en Android Studio:
# View → Tool Windows → Logcat
# Filtrar por: *:E (solo errores)
```

### Cambié el código pero no se refleja
```bash
# Rebuild completo:
npm run build
npx cap sync

# Luego en Android Studio:
# Build → Clean Project
# Build → Rebuild Project
# Run ▶️
```

---

## 📚 DOCUMENTACIÓN COMPLETA

### **Documentos disponibles:**

1. **EMPEZAR_PRUEBAS.md** (este archivo)
   - Guía rápida para empezar

2. **GUIA_PRUEBAS.md**
   - Checklist exhaustivo (+100 tests)
   - 11 categorías de pruebas
   - Criterios de éxito

3. **PROBLEMAS_COMUNES.md**
   - 15+ problemas frecuentes
   - Soluciones paso a paso
   - Problemas por fabricante

4. **debug-helper.bat**
   - Script interactivo
   - 8 opciones útiles
   - Simplifica debugging

5. **ETAPA_8_COMPLETADA.md**
   - Resumen de la etapa
   - Métricas de calidad
   - Template para bugs

---

## 🎯 OBJETIVO

**Probar que todas las funcionalidades principales funcionan en tu dispositivo antes de publicar.**

**Funcionalidades críticas:**
- ✅ App abre
- ✅ Mapa funciona
- ✅ Geolocalización
- ✅ Login/Registro
- ✅ Usar tickets

**Si estas 5 funcionan, puedes publicar.** El resto son mejoras.

---

## ⏱️ TIEMPO ESTIMADO

- **Pruebas básicas:** 5-10 minutos
- **Pruebas completas:** 1-2 horas
- **Corrección de bugs:** Variable

---

## 🚀 ¡EMPECEMOS!

**Paso 1:** Conecta tu Android  
**Paso 2:** `npx cap open android`  
**Paso 3:** Run ▶️  
**Paso 4:** ¡Prueba!

**¡Buena suerte!** 📱✨
