# 🔧 CONFIGURAR OAUTH DE GOOGLE EN SUPABASE

**Problema resuelto:** Login con Google funciona ahora en móvil

---

## ⚠️ IMPORTANTE: CONFIGURACIÓN EN SUPABASE

Para que el login con Google funcione en la app móvil, **debes añadir la URL de redirección en Supabase Dashboard**:

---

## 📋 PASOS A SEGUIR

### **1. Ir a Supabase Dashboard**

```
1. Abre: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a: Authentication → URL Configuration
```

### **2. Añadir Redirect URL**

En la sección **"Redirect URLs"**, añade:

```
com.wheretonight.app://login-callback
```

**Importante:**
- ✅ Incluye el `://` 
- ✅ No pongas `http://` o `https://`
- ✅ Debe ser exactamente como está arriba

### **3. Guardar cambios**

Click en **"Save"** o **"Actualizar"**

---

## ✅ VERIFICAR CONFIGURACIÓN

Después de guardar, verifica que en la lista de "Redirect URLs" aparezca:

```
Site URL:
https://tu-proyecto.supabase.co (o tu dominio)

Redirect URLs:
- http://localhost:3000/** (web development)
- com.wheretonight.app://login-callback (móvil) ← NUEVO
```

---

## 🔐 CONFIGURACIÓN DE GOOGLE OAUTH

Si aún no tienes Google OAuth configurado:

### **1. Google Cloud Console**

```
1. Ve a: https://console.cloud.google.com
2. Crea un proyecto (si no tienes)
3. APIs & Services → Credentials
4. Create Credentials → OAuth 2.0 Client ID
```

### **2. Configurar Authorized redirect URIs**

Añade estas URLs:

```
Para Web (desarrollo):
http://localhost:3000/auth/callback

Para Supabase:
https://TU-PROYECTO.supabase.co/auth/v1/callback

Para Móvil:
com.wheretonight.app://login-callback
```

### **3. Copiar credenciales a Supabase**

```
1. Copia Client ID
2. Copia Client Secret
3. Ve a Supabase → Authentication → Providers → Google
4. Pega Client ID y Client Secret
5. Enable
6. Save
```

---

## 🧪 PROBAR EN MÓVIL

### **Después de configurar:**

1. **Rebuild y sync:**
   ```bash
   npm run build
   npx cap sync
   ```

2. **Ejecutar en tablet:**
   - Android Studio → Run ▶️

3. **Probar login:**
   - Abre la app
   - Click en "Login con Google"
   - Debería abrir navegador
   - Selecciona tu cuenta Google
   - Autoriza
   - **Debería volver a la app automáticamente** ✅

---

## ⚠️ SOLUCIÓN DE PROBLEMAS

### **Problema: Sigue apareciendo "localhost rechazó la conexión"**

**Causa:** No guardaste la redirect URL en Supabase

**Solución:**
1. Verifica que `com.wheretonight.app://login-callback` esté en Supabase
2. Espera 1-2 minutos (puede tardar en actualizarse)
3. Rebuild y reinstala la app

### **Problema: "Redirect URI mismatch"**

**Causa:** La URL en Google Cloud no coincide

**Solución:**
1. Google Cloud Console → Credentials
2. Edita tu OAuth 2.0 Client ID
3. Añade: `com.wheretonight.app://login-callback`
4. Guarda

### **Problema: Se abre navegador pero no vuelve a la app**

**Causa:** Deep linking no configurado correctamente

**Solución:**
Ya está configurado en:
- ✅ `capacitor.config.ts`
- ✅ `android/app/src/main/AndroidManifest.xml`
- ✅ `src/lib/supabase.ts`

Solo necesitas hacer:
```bash
npx cap sync
```

---

## 🎯 ARCHIVOS MODIFICADOS

Los siguientes archivos ya fueron actualizados:

1. ✅ **`src/lib/supabase.ts`**
   - Añadido PKCE flow para móvil
   - Configurado redirectTo

2. ✅ **`capacitor.config.ts`**
   - Añadido appUrlScheme

3. ✅ **`android/app/src/main/AndroidManifest.xml`**
   - Añadido intent-filter para deep linking

---

## ✅ CHECKLIST FINAL

Antes de probar, verifica:

- [ ] Redirect URL añadida en Supabase Dashboard
- [ ] Google OAuth configurado con Client ID y Secret
- [ ] Authorized redirect URIs en Google Cloud
- [ ] `npm run build` ejecutado
- [ ] `npx cap sync` ejecutado
- [ ] App reinstalada en tablet

---

## 📱 FLUJO COMPLETO

**Cuando funcione correctamente:**

```
1. Usuario hace click en "Login con Google"
   ↓
2. Se abre navegador del sistema
   ↓
3. Usuario selecciona cuenta Google
   ↓
4. Google redirige a: com.wheretonight.app://login-callback
   ↓
5. Android detecta el deep link
   ↓
6. Vuelve a abrir WhereTonight
   ↓
7. Usuario logueado ✅
```

---

## 🚀 SIGUIENTE PASO

Después de configurar:

```bash
# 1. Build
npm run build

# 2. Sync
npx cap sync

# 3. Probar en Android Studio
# Run ▶️
```

---

**¡Listo! El login con Google debería funcionar ahora en móvil.** 🎉
