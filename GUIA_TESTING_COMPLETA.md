# 🧪 GUÍA DE TESTING COMPLETA - PRUEBAAPP

**Versión:** 1.0  
**Última actualización:** 7 de noviembre de 2025

**NOTA:** Esta es una copia de la guía de WhereTonight. Todos los tests aplican igual.

---

Ver documentación completa en:
`WhereTonight/GUIA_TESTING_COMPLETA.md`

---

## 🚀 TESTS RÁPIDOS PARA PRUEBAAPP

### **1. Verificar Migraciones (5 min)**
```sql
-- En Supabase:
SELECT * FROM user_points LIMIT 5;
SELECT * FROM affiliate_partners;
```

### **2. Test Sistema de Puntos (10 min)**
```
1. Login
2. Ir a Perfil → Ver "0 Puntos", "Nivel 1"
3. Guardar venue → Ver "5 Puntos"
4. Compartir venue → Ver "10 Puntos"

✅ Funciona
```

### **3. Test QR Scanner (5 min)**
```
1. Ir a Perfil
2. Click "Escanear Código QR"
3. Permisos de cámara
4. Click "Probar Escáner (Demo)"

✅ Funciona
```

### **4. Test Compartir (5 min)**
```
1. Abrir venue
2. Click compartir
3. Seleccionar app

✅ Funciona
```

---

## 📊 DIFERENCIAS CON WHERETONIGHT

- Base de datos: Separada (Supabase project diferente)
- Firebase: Configuración separada necesaria
- Assets: Puede usar diferentes logos/colores para identificar

---

## ✅ CHECKLIST MÍNIMO

- [ ] Migraciones SQL ejecutadas
- [ ] App compila sin errores
- [ ] Login funciona
- [ ] Puntos funcionan
- [ ] QR scanner funciona
- [ ] No crashes en uso básico

---

**¡PruebaApp lista para development!** 🚀
