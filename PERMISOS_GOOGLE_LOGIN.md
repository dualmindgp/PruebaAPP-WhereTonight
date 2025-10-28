# 🔐 PERMISOS DE GOOGLE LOGIN - ES NORMAL

**Esto es NORMAL y ESPERADO** ✅

---

## ✅ ¿QUÉ ESTÁ PASANDO?

Cuando intentas hacer login con Google, aparece un mensaje que dice que **necesitas permisos**. Esto puede ser uno de estos dos casos:

---

## 📱 CASO 1: La app pide permisos de Google (NORMAL)

### **Mensaje típico:**
```
"WhereTonight quiere acceder a tu cuenta de Google"

Permitirá que la app pueda:
- Ver tu información personal
- Ver tu dirección de email
```

### **¿Por qué pasa esto?**
✅ **ES COMPLETAMENTE NORMAL**

Google SIEMPRE pide autorización la primera vez que usas OAuth en una app. Esto es una medida de seguridad.

### **¿Qué hacer?**
1. ✅ **Click en "Permitir"** o **"Continuar"**
2. ✅ Selecciona tu cuenta de Google
3. ✅ Autoriza los permisos
4. ✅ Deberías volver a la app automáticamente

### **¿Es seguro?**
✅ **SÍ, totalmente seguro**

Solo pedimos acceso a:
- Tu nombre
- Tu email
- Tu foto de perfil

NO pedimos:
- ❌ Acceso a Drive
- ❌ Acceso a Gmail
- ❌ Acceso a Calendar
- ❌ Ningún otro dato

---

## ⚠️ CASO 2: OAuth no está configurado en Google Cloud (ERROR)

### **Mensaje típico:**
```
"Error: redirect_uri_mismatch"
"Access blocked: This app's request is invalid"
"Error 400: admin_policy_enforced"
```

### **¿Por qué pasa esto?**
❌ OAuth de Google NO está configurado correctamente en Google Cloud Console

### **Solución: Configurar Google Cloud Console**

#### **Paso 1: Ir a Google Cloud Console**
```
1. Ve a: https://console.cloud.google.com
2. Selecciona tu proyecto (o crea uno)
```

#### **Paso 2: Habilitar Google+ API**
```
1. APIs & Services → Library
2. Busca "Google+ API"
3. Click en "Enable"
```

#### **Paso 3: Crear OAuth 2.0 Client ID**
```
1. APIs & Services → Credentials
2. Create Credentials → OAuth 2.0 Client ID
3. Application type: Web application
4. Name: WhereTonight
```

#### **Paso 4: Configurar Authorized redirect URIs**

Añade TODAS estas URLs:

**Para desarrollo web:**
```
http://localhost:3000
http://localhost:3000/auth/callback
```

**Para Supabase:**
```
https://TU-PROYECTO.supabase.co/auth/v1/callback
```
*Reemplaza TU-PROYECTO con el nombre de tu proyecto de Supabase*

**Para móvil (Deep Link):**
```
com.wheretonight.app://login-callback
```

#### **Paso 5: Copiar credenciales**
```
1. Copia "Client ID"
2. Copia "Client Secret"
```

#### **Paso 6: Configurar en Supabase**
```
1. Ve a Supabase Dashboard
2. Authentication → Providers → Google
3. Pega Client ID
4. Pega Client Secret
5. Enable = ON
6. Save
```

#### **Paso 7: Configurar Redirect URLs en Supabase**
```
1. Supabase Dashboard
2. Authentication → URL Configuration
3. Site URL: https://tu-dominio.com (o tu proyecto)
4. Redirect URLs: Añade
   - http://localhost:3000/**
   - com.wheretonight.app://login-callback
5. Save
```

---

## 🧪 PROBAR QUE FUNCIONA

### **Test en móvil:**

1. **Rebuild la app:**
   ```bash
   npm run build
   npx cap sync
   ```

2. **Ejecutar en tablet:**
   ```
   Android Studio → Run ▶️
   ```

3. **Intentar login:**
   - Click en "Login con Google"
   - Se abre navegador
   - Selecciona tu cuenta Google
   - Acepta permisos (primera vez)
   - **Debe volver a la app automáticamente** ✅

### **Flujo esperado:**

```
1. Usuario click "Login con Google"
   ↓
2. Se abre Chrome/navegador del sistema
   ↓
3. Pantalla de Google: "Elige una cuenta"
   ↓
4. Seleccionas tu cuenta
   ↓
5. Google pregunta: "¿Permitir que WhereTonight acceda...?"
   ↓
6. Click en "Permitir" ✅
   ↓
7. Google redirige a: com.wheretonight.app://login-callback
   ↓
8. Android detecta el deep link
   ↓
9. Vuelve a abrir WhereTonight
   ↓
10. ¡Usuario logueado! ✅
```

---

## ❓ PROBLEMAS COMUNES

### **Problema: "Access blocked"**

**Causa:** OAuth Client no está configurado

**Solución:**
1. Sigue "CASO 2" arriba
2. Configura Google Cloud Console
3. Añade redirect URIs
4. Configura Supabase

---

### **Problema: "Redirect URI mismatch"**

**Causa:** Las URLs en Google Cloud no coinciden con Supabase

**Solución:**
Verifica que en Google Cloud Console tengas:
```
✅ https://TU-PROYECTO.supabase.co/auth/v1/callback
✅ com.wheretonight.app://login-callback
```

---

### **Problema: Se abre navegador pero no vuelve a la app**

**Causa:** Deep linking no funciona

**Verificar:**
1. ✅ `capacitor.config.ts` tiene `appUrlScheme`
2. ✅ `AndroidManifest.xml` tiene intent-filter
3. ✅ Hiciste `npx cap sync`

**Solución:**
```bash
npx cap sync
# Reinstalar app
adb uninstall com.wheretonight.app
npx cap run android
```

---

### **Problema: "This app hasn't been verified by Google"**

**Causa:** App en modo desarrollo (normal)

**¿Es problema?** ❌ NO

**Qué hacer:**
1. Aparece pantalla: "This app hasn't been verified"
2. Click en "Advanced"
3. Click en "Go to WhereTonight (unsafe)"
4. Continúa normalmente

**Nota:** Esto es normal en desarrollo. Cuando publiques la app, puedes solicitar verificación de Google.

---

## 🎯 RESUMEN RÁPIDO

### **Si Google pide permisos:**
✅ **Es NORMAL** → Click en "Permitir"

### **Si sale "Access blocked" o "Error 400":**
❌ **OAuth no configurado** → Seguir "CASO 2"

### **Si todo está configurado pero no funciona:**
1. Verifica redirect URIs en Google Cloud
2. Verifica redirect URLs en Supabase
3. Haz `npx cap sync`
4. Reinstala la app

---

## 📋 CHECKLIST CONFIGURACIÓN COMPLETA

Antes de probar, verifica:

**Google Cloud Console:**
- [ ] Proyecto creado
- [ ] Google+ API habilitada
- [ ] OAuth 2.0 Client ID creado
- [ ] Redirect URIs configuradas:
  - [ ] `https://TU-PROYECTO.supabase.co/auth/v1/callback`
  - [ ] `com.wheretonight.app://login-callback`

**Supabase Dashboard:**
- [ ] Google provider habilitado
- [ ] Client ID configurado
- [ ] Client Secret configurado
- [ ] Redirect URLs añadidas:
  - [ ] `com.wheretonight.app://login-callback`

**Código:**
- [ ] `src/lib/supabase.ts` tiene PKCE flow
- [ ] `src/components/AuthModal.tsx` usa `getAuthRedirectUrl()`
- [ ] `capacitor.config.ts` tiene `appUrlScheme`
- [ ] `AndroidManifest.xml` tiene intent-filter

**Build:**
- [ ] `npm run build` ejecutado
- [ ] `npx cap sync` ejecutado
- [ ] App instalada en dispositivo

---

## 🆘 SI SIGUE SIN FUNCIONAR

Envíame **exactamente**:

1. **El mensaje de error completo** (screenshot si es posible)
2. **¿En qué momento aparece?** (al abrir navegador, al volver, etc.)
3. **¿Vuelve a la app o se queda en el navegador?**

Con esa info puedo darte una solución exacta.

---

## ✅ ESTADO ESPERADO

**Cuando funcione correctamente:**

1. ✅ Click en "Login con Google"
2. ✅ Se abre navegador
3. ✅ Seleccionas cuenta
4. ✅ Aceptas permisos (solo primera vez)
5. ✅ Vuelve a WhereTonight automáticamente
6. ✅ Usuario logueado

**Tiempo total:** ~5-10 segundos

---

**¿Cuál es el mensaje exacto que ves cuando dices "necesito permisos"?** Dímelo y te doy la solución específica. 🔧
