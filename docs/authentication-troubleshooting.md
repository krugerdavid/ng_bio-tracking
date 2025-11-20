# Troubleshooting de Autenticación

## Problema: Loader Infinito

### Síntomas

- La aplicación muestra un loader infinito al cargar
- En la pestaña Network se ve una llamada a `/rest/v1/user_profiles?select=*&order=created_at.desc` que retorna vacío
- La aplicación no carga después del login

### Causas Posibles

#### 1. Usuario sin Perfil en `user_profiles`

Si el usuario está autenticado en `auth.users` pero no tiene un registro correspondiente en `user_profiles`, la consulta para obtener el rol falla.

**Solución**: Se ha mejorado el manejo de errores para que:

- Si no hay perfil, se usa `Role.USER` por defecto
- El usuario puede autenticarse incluso sin perfil
- Se registra un warning en consola pero no bloquea el login

#### 2. Problemas de Permisos (RLS - Row Level Security)

Si las políticas de RLS en Supabase están bloqueando las consultas, las peticiones pueden fallar silenciosamente.

**Verificación**:

```sql
-- Verificar políticas RLS en user_profiles
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
```

**Solución**: Asegúrate de que las políticas RLS permitan:

- Lectura del propio perfil: `user_id = auth.uid()`
- Lectura de todos los perfiles para admins: `role = 'admin'` (si aplica)

#### 3. Error en `AuthProvider` que no se maneja

Si hay un error en `getCurrentUser` que no se maneja correctamente, el `loading` puede quedarse en `true`.

**Solución**: Se ha mejorado el manejo de errores en `AuthProvider`:

- Siempre establece `loading = false` incluso si hay errores
- Maneja correctamente los casos donde no hay usuario autenticado
- Previene actualizaciones de estado en componentes desmontados

### Cambios Implementados

#### 1. `AuthRepositoryImpl.mapToUser()`

```typescript
// Ahora maneja errores correctamente
try {
  const { data: profile, error } = await this.supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", authUser.id)
    .single();

  if (!error && profile?.role) {
    role = profile.role as Role;
  }
} catch (error) {
  // Silently fail and use default role
  console.warn("Could not fetch user profile, using default role:", error);
}
```

#### 2. `AuthProvider`

```typescript
// Ahora maneja errores y siempre establece loading = false
getCurrentUserUseCase
  .execute()
  .then(result => {
    if (isMounted) {
      if (result.isSuccess()) {
        setUser(result.getValue());
      } else {
        setUser(null); // No autenticado
      }
      setLoading(false);
    }
  })
  .catch(error => {
    console.error("Error getting current user:", error);
    if (isMounted) {
      setUser(null);
      setLoading(false);
    }
  });
```

#### 3. `UserProfileRepositoryImpl.findAll()`

```typescript
// Ahora detecta errores de permisos específicamente
if (error.code === "PGRST301" || error.message.includes("permission")) {
  return Result.error("No tienes permisos para ver la lista de usuarios");
}
```

## Verificación

### 1. Verificar que el Usuario Tenga Perfil

```sql
-- Verificar si el usuario tiene perfil
SELECT * FROM user_profiles WHERE user_id = 'TU_USER_ID';
```

Si no existe, crear uno:

```sql
INSERT INTO user_profiles (user_id, email, role)
VALUES ('TU_USER_ID', 'email@example.com', 'user');
```

### 2. Verificar Políticas RLS

```sql
-- Ver políticas actuales
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Ejemplo de política que permite leer el propio perfil
CREATE POLICY "Users can read own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Ejemplo de política para admins
CREATE POLICY "Admins can read all profiles"
ON user_profiles FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);
```

### 3. Verificar en la Consola del Navegador

Abre las DevTools y revisa:

- **Console**: Busca warnings o errores relacionados con autenticación
- **Network**: Verifica que las peticiones a Supabase tengan el código de respuesta correcto (200, 401, 403, etc.)

## Próximos Pasos

1. **Crear Perfil Automáticamente**: Considera crear un trigger en Supabase que cree automáticamente un perfil cuando se crea un usuario en `auth.users`

2. **Mejorar Manejo de Errores**: Agregar más logging para identificar problemas específicos

3. **Validar RLS**: Asegurarse de que las políticas RLS estén correctamente configuradas
