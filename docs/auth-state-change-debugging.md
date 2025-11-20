# Debugging: Auth State Change Timeout

## Problema

El warning "Auth state change did not fire within timeout, setting loading to false" aparece cuando el callback de `onAuthStateChange` no se ejecuta dentro del tiempo esperado.

## Posibles Causas

### 1. `getUser()` está tardando mucho

- `getUser()` hace una llamada a Supabase que puede tardar si hay problemas de red
- Si tarda más de 3 segundos, el timeout se activa

### 2. `mapToUser()` está tardando

- `mapToUser()` hace una consulta a `user_profiles` para obtener el rol
- Si esta consulta falla o tarda, el callback no se ejecuta a tiempo

### 3. Problemas de red o CORS

- Si hay problemas de red, las llamadas a Supabase pueden fallar silenciosamente
- CORS mal configurado puede bloquear las peticiones

### 4. Variables de entorno incorrectas

- Si `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` están mal configuradas
- El cliente de Supabase no puede conectarse

## Soluciones Implementadas

### 1. Manejo de Estado Inicial Mejorado

- Se usa una bandera `hasReceivedInitialState` para asegurar que el callback solo se ejecute una vez
- Se maneja tanto `getUser()` como el evento `INITIAL_SESSION` de `onAuthStateChange`

### 2. Timeout Aumentado

- Se aumentó el timeout de 2 a 3 segundos para dar más tiempo a las llamadas de red

### 3. Dependencias del useEffect Corregidas

- Se removió `loading` de las dependencias para evitar re-renders innecesarios
- Solo `authRepository` está en las dependencias

### 4. Manejo de Eventos de Supabase

- Se verifica el evento `INITIAL_SESSION` para evitar callbacks duplicados
- Se asegura que el callback se ejecute al menos una vez

## Cómo Debuggear

### 1. Verificar en la Consola del Navegador

```javascript
// Abre la consola y verifica:
// - ¿Hay errores de red?
// - ¿Hay errores de CORS?
// - ¿Las variables de entorno están correctas?
console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing");
```

### 2. Verificar en Network Tab

- Abre DevTools > Network
- Filtra por "supabase"
- Verifica que las peticiones a Supabase se estén haciendo
- Revisa los códigos de respuesta (200, 401, 403, etc.)

### 3. Agregar Logging Temporal

```typescript
// En AuthRepositoryImpl.onAuthStateChange
console.log("onAuthStateChange called");
console.log("getUser() started");
this.supabase.auth.getUser().then(result => {
  console.log("getUser() completed:", result);
  // ...
});
```

### 4. Verificar Variables de Entorno

```bash
# En el build, verifica que las variables estén disponibles
npm run build
# Revisa que no haya errores relacionados con variables de entorno
```

## Próximos Pasos si el Problema Persiste

1. **Verificar configuración de Supabase**
   - Asegúrate de que el proyecto de Supabase esté activo
   - Verifica que las credenciales sean correctas

2. **Verificar políticas RLS**
   - Asegúrate de que las políticas permitan leer `user_profiles`
   - Verifica que el usuario autenticado tenga permisos

3. **Considerar usar localStorage para cache**
   - Cachear el estado de autenticación en localStorage
   - Reducir la dependencia de llamadas de red en cada refresh

4. **Implementar retry logic**
   - Si `getUser()` falla, reintentar después de un delay
   - Manejar errores de red de forma más robusta
