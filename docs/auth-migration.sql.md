# Script SQL para Autenticación

Ejecuta este script en el SQL Editor de Supabase para agregar autenticación:

```sql
-- ============================================
-- 1. Agregar columna user_id a members
-- ============================================
ALTER TABLE members
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice
CREATE INDEX idx_members_user_id ON members(user_id);

-- ============================================
-- 2. Actualizar RLS policies para members
-- ============================================
DROP POLICY IF EXISTS "Enable all for members" ON members;

-- Solo permitir ver/editar miembros propios
CREATE POLICY "Users can view own members" ON members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own members" ON members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own members" ON members
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own members" ON members
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. Actualizar RLS policies para bioimpedances
-- ============================================
DROP POLICY IF EXISTS "Enable all for bioimpedances" ON bioimpedances;

-- Solo permitir acceso a bioimpedances de miembros propios
CREATE POLICY "Users can view own bioimpedances" ON bioimpedances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = bioimpedances.member_id 
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own bioimpedances" ON bioimpedances
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = bioimpedances.member_id 
      AND members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own bioimpedances" ON bioimpedances
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM members 
      WHERE members.id = bioimpedances.member_id 
      AND members.user_id = auth.uid()
    )
  );
```

## Verificación

Después de ejecutar el script, puedes verificar con:

```sql
-- Ver las columnas de members
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'members';

-- Ver las políticas RLS
SELECT tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('members', 'bioimpedances');
```
