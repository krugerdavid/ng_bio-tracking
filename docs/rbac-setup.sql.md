# RBAC Database Setup - User Profiles

Ejecuta este script en el **SQL Editor** de Supabase para configurar el sistema de roles.

## Script SQL Completo

```sql
-- ============================================
-- 1. Crear tipo ENUM para roles
-- ============================================
CREATE TYPE user_role AS ENUM ('admin', 'user');

-- ============================================
-- 2. Crear tabla user_profiles
-- ============================================
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para optimizar queries
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_created_by ON user_profiles(created_by);

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. Row Level Security (RLS)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Admins pueden ver todos los profiles
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Users pueden ver su propio profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Solo admins pueden crear profiles (vía Edge Function)
CREATE POLICY "Admins can insert profiles" ON user_profiles
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden actualizar profiles
CREATE POLICY "Admins can update profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Solo admins pueden eliminar profiles
CREATE POLICY "Admins can delete profiles" ON user_profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================
-- 4. Función helper para verificar si es admin
-- ============================================
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 5. Actualizar policies de members
-- ============================================
-- Admins pueden ver todos los members
DROP POLICY IF EXISTS "Users can view own members" ON members;

CREATE POLICY "Users and admins can view members" ON members
  FOR SELECT USING (
    auth.uid() = user_id OR is_admin()
  );

-- Similar para otras operaciones
CREATE POLICY "Users and admins can insert members" ON members
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR is_admin()
  );

CREATE POLICY "Users and admins can update members" ON members
  FOR UPDATE USING (
    auth.uid() = user_id OR is_admin()
  );

CREATE POLICY "Users and admins can delete members" ON members
  FOR DELETE USING (
    auth.uid() = user_id OR is_admin()
  );

-- ============================================
-- 6. Actualizar policies de bioimpedances
-- ============================================
DROP POLICY IF EXISTS "Users can view own bioimpedances" ON bioimpedances;
DROP POLICY IF EXISTS "Users can insert own bioimpedances" ON bioimpedances;
DROP POLICY IF EXISTS "Users can delete own bioimpedances" ON bioimpedances;

CREATE POLICY "Users and admins can view bioimpedances" ON bioimpedances
  FOR SELECT USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = bioimpedances.member_id 
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users and admins can insert bioimpedances" ON bioimpedances
  FOR INSERT WITH CHECK (
    is_admin() OR EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = bioimpedances.member_id 
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users and admins can delete bioimpedances" ON bioimpedances
  FOR DELETE USING (
    is_admin() OR EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = bioimpedances.member_id 
      AND members.user_id = auth.uid()
    )
  );
```

---

## ⚠️ IMPORTANTE: Crear Primer Usuario Admin

Después de ejecutar el script anterior, necesitas crear tu primer usuario admin **manualmente**:

### Paso 1: Crear usuario en Supabase Dashboard

1. Ve a **Authentication** → **Users**
2. Click en **Add user** → **Create new user**
3. Completa:
   - Email: `admin@biotracker.com` (o tu email preferido)
   - Password: (una contraseña segura)
4. Click **Create user**
5. **Copia el UUID** del usuario creado

### Paso 2: Asignar rol de admin

Ejecuta este SQL reemplazando el UUID:

```sql
-- Reemplaza 'USUARIO-UUID-AQUI' con el UUID real copiado
INSERT INTO user_profiles (user_id, email, role, created_by)
VALUES (
  'USUARIO-UUID-AQUI',
  'admin@biotracker.com',
  'admin',
  NULL
);
```

---

## 🔍 Verificación

Puedes verificar que todo está correcto con estas queries:

```sql
-- Ver todos los user_profiles
SELECT * FROM user_profiles;

-- Ver las políticas RLS
SELECT tablename, policyname, permissive, roles, cmd
FROM pg_policies
WHERE tablename IN ('user_profiles', 'members', 'bioimpedances')
ORDER BY tablename, policyname;

-- Verificar función is_admin
SELECT is_admin();  -- Debe retornar true si estás logueado como admin
```

---

## 📝 Próximo Paso

Después de completar esta configuración, el siguiente paso será crear la **Supabase Edge Function** para permitir que admins creen usuarios de forma segura.
