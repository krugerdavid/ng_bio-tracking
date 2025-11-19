# Migración a Supabase - Plan de Implementación DDD

## 📋 Índice

1. [Introducción](#introducción)
2. [Arquitectura DDD](#arquitectura-ddd)
3. [Configuración de Supabase](#configuración-de-supabase)
4. [Scripts SQL](#scripts-sql)
5. [Implementación de Repositorios](#implementación-de-repositorios)
6. [Variables de Entorno](#variables-de-entorno)
7. [Proceso de Migración](#proceso-de-migración)
8. [Testing](#testing)

---

## Introducción

Este documento describe el proceso completo para migrar la aplicación BioTracker de una implementación Mock (localStorage) a Supabase, **manteniendo la arquitectura Domain-Driven Design (DDD)**.

### ✅ Ventajas de DDD en esta migración:

- **Cero cambios** en las capas Domain y Application
- **Solo modificamos** la capa Infrastructure
- **Fácil rollback** si es necesario
- **Testing simplificado** con mocks

---

## Arquitectura DDD

### Estructura actual:

```
src/
├── domain/              # ✅ NO SE MODIFICA
│   ├── entities/
│   └── repositories/
├── infrastructure/      # 🔄 AQUÍ AGREGAMOS SUPABASE
│   └── repositories/
│       ├── MockMemberRepository.ts
│       ├── MockBioimpedanceRepository.ts
│       ├── SupabaseMemberRepository.ts      # NUEVO
│       └── SupabaseBioimpedanceRepository.ts # NUEVO
├── application/         # ✅ NO SE MODIFICA
│   ├── use-cases/
│   └── di/
│       └── container.ts  # 🔄 SOLO CAMBIAMOS LA INYECCIÓN
└── presentation/        # ✅ NO SE MODIFICA
```

---

## Configuración de Supabase

### Paso 1: Crear un proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta o inicia sesión
3. Click en "New Project"
4. Completa:
   - **Name**: `bio-tracker`
   - **Database Password**: (guarda esta contraseña)
   - **Region**: Elige la más cercana
   - **Pricing Plan**: Free tier está bien para comenzar

### Paso 2: Obtener las credenciales

Una vez creado el proyecto:

1. Ve a **Settings** → **API**
2. Copia los siguientes valores:
   - `Project URL`
   - `anon public` key

---

## Scripts SQL

### Crear las tablas en Supabase

1. Ve a **SQL Editor** en tu proyecto Supabase
2. Crea un nuevo query
3. Ejecuta el siguiente script:

```sql
-- ============================================
-- TABLA: members
-- ============================================
CREATE TABLE members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para búsquedas por email
CREATE INDEX idx_members_email ON members(email);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_members_updated_at
  BEFORE UPDATE ON members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TABLA: bioimpedances
-- ============================================
CREATE TABLE bioimpedances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  weight DECIMAL(5,2) NOT NULL CHECK (weight > 0),
  body_fat_percentage DECIMAL(4,2) NOT NULL CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 100),
  muscle_mass_percentage DECIMAL(4,2) NOT NULL CHECK (muscle_mass_percentage >= 0 AND muscle_mass_percentage <= 100),
  water_percentage DECIMAL(4,2) NOT NULL CHECK (water_percentage >= 0 AND water_percentage <= 100),
  bmi DECIMAL(4,2) NOT NULL CHECK (bmi > 0),
  visceral_fat INTEGER NOT NULL CHECK (visceral_fat >= 1 AND visceral_fat <= 59),
  bone_mass DECIMAL(4,2) NOT NULL CHECK (bone_mass > 0),
  basal_metabolic_rate INTEGER NOT NULL CHECK (basal_metabolic_rate > 0),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX idx_bioimpedances_member_id ON bioimpedances(member_id);
CREATE INDEX idx_bioimpedances_date ON bioimpedances(date DESC);
CREATE INDEX idx_bioimpedances_member_date ON bioimpedances(member_id, date DESC);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
-- Habilitar RLS en ambas tablas
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE bioimpedances ENABLE ROW LEVEL SECURITY;

-- Políticas para members (permitir todo por ahora)
CREATE POLICY "Enable all for members" ON members
  FOR ALL USING (true);

-- Políticas para bioimpedances (permitir todo por ahora)
CREATE POLICY "Enable all for bioimpedances" ON bioimpedances
  FOR ALL USING (true);

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL)
-- ============================================
-- Descomentar si quieres datos de prueba

-- INSERT INTO members (name, email, date_of_birth, gender) VALUES
--   ('Juan Pérez', 'juan@example.com', '1990-01-15', 'male'),
--   ('María González', 'maria@example.com', '1995-05-20', 'female');
```

---

## Implementación de Repositorios

### Paso 1: Instalar Supabase Client

```bash
npm install @supabase/supabase-js
```

### Paso 2: Crear cliente de Supabase

Crea el archivo: `src/infrastructure/supabase/client.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Paso 3: Implementar SupabaseMemberRepository

Crea el archivo: `src/infrastructure/repositories/SupabaseMemberRepository.ts`

```typescript
import type { Member, CreateMemberDTO, UpdateMemberDTO } from '../../domain/entities/Member';
import type { IMemberRepository } from '../../domain/repositories/IMemberRepository';
import { supabase } from '../supabase/client';

export class SupabaseMemberRepository implements IMemberRepository {
  async create(data: CreateMemberDTO): Promise<Member> {
    const { data: member, error } = await supabase
      .from('members')
      .insert({
        name: data.name,
        email: data.email,
        date_of_birth: this.formatDate(data.dateOfBirth),
        gender: data.gender,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating member: ${error.message}`);
    }

    return this.mapToMember(member);
  }

  async findById(id: string): Promise<Member | null> {
    const { data: member, error } = await supabase
      .from('members')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(`Error finding member: ${error.message}`);
    }

    return member ? this.mapToMember(member) : null;
  }

  async findAll(): Promise<Member[]> {
    const { data: members, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching members: ${error.message}`);
    }

    return members.map(m => this.mapToMember(m));
  }

  async update(id: string, data: UpdateMemberDTO): Promise<Member> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.dateOfBirth !== undefined) updateData.date_of_birth = this.formatDate(data.dateOfBirth);
    if (data.gender !== undefined) updateData.gender = data.gender;

    const { data: member, error } = await supabase
      .from('members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating member: ${error.message}`);
    }

    return this.mapToMember(member);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting member: ${error.message}`);
    }
  }

  private mapToMember(data: any): Member {
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      dateOfBirth: new Date(data.date_of_birth),
      gender: data.gender,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

### Paso 4: Implementar SupabaseBioimpedanceRepository

Crea el archivo: `src/infrastructure/repositories/SupabaseBioimpedanceRepository.ts`

```typescript
import type { Bioimpedance, CreateBioimpedanceDTO } from '../../domain/entities/Bioimpedance';
import type { IBioimpedanceRepository } from '../../domain/repositories/IBioimpedanceRepository';
import { supabase } from '../supabase/client';

export class SupabaseBioimpedanceRepository implements IBioimpedanceRepository {
  async create(data: CreateBioimpedanceDTO): Promise<Bioimpedance> {
    const { data: bioimpedance, error } = await supabase
      .from('bioimpedances')
      .insert({
        member_id: data.memberId,
        date: this.formatDate(data.date),
        weight: data.weight,
        body_fat_percentage: data.bodyFatPercentage,
        muscle_mass_percentage: data.muscleMassPercentage,
        water_percentage: data.waterPercentage,
        bmi: data.bmi,
        visceral_fat: data.visceralFat,
        bone_mass: data.boneMass,
        basal_metabolic_rate: data.basalMetabolicRate,
        notes: data.notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating bioimpedance: ${error.message}`);
    }

    return this.mapToBioimpedance(bioimpedance);
  }

  async findById(id: string): Promise<Bioimpedance | null> {
    const { data: bioimpedance, error } = await supabase
      .from('bioimpedances')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw new Error(`Error finding bioimpedance: ${error.message}`);
    }

    return bioimpedance ? this.mapToBioimpedance(bioimpedance) : null;
  }

  async findByMemberId(memberId: string): Promise<Bioimpedance[]> {
    const { data: bioimpedances, error } = await supabase
      .from('bioimpedances')
      .select('*')
      .eq('member_id', memberId)
      .order('date', { ascending: false });

    if (error) {
      throw new Error(`Error fetching bioimpedances: ${error.message}`);
    }

    return bioimpedances.map(b => this.mapToBioimpedance(b));
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('bioimpedances')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting bioimpedance: ${error.message}`);
    }
  }

  private mapToBioimpedance(data: any): Bioimpedance {
    return {
      id: data.id,
      memberId: data.member_id,
      date: new Date(data.date),
      weight: parseFloat(data.weight),
      bodyFatPercentage: parseFloat(data.body_fat_percentage),
      muscleMassPercentage: parseFloat(data.muscle_mass_percentage),
      waterPercentage: parseFloat(data.water_percentage),
      bmi: parseFloat(data.bmi),
      visceralFat: data.visceral_fat,
      boneMass: parseFloat(data.bone_mass),
      basalMetabolicRate: data.basal_metabolic_rate,
      notes: data.notes,
      createdAt: new Date(data.created_at),
    };
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
```

### Paso 5: Actualizar el Container DI

Modifica `src/application/di/container.ts`:

```typescript
import { MockMemberRepository } from '../../infrastructure/repositories/MockMemberRepository';
import { MockBioimpedanceRepository } from '../../infrastructure/repositories/MockBioimpedanceRepository';
import { SupabaseMemberRepository } from '../../infrastructure/repositories/SupabaseMemberRepository';
import { SupabaseBioimpedanceRepository } from '../../infrastructure/repositories/SupabaseBioimpedanceRepository';
import { RegisterMemberUseCase } from '../use-cases/RegisterMemberUseCase';
import { ListMembersUseCase } from '../use-cases/ListMembersUseCase';
import { GetMemberDetailsUseCase } from '../use-cases/GetMemberDetailsUseCase';
import { RecordBioimpedanceUseCase } from '../use-cases/RecordBioimpedanceUseCase';

// Determinar qué repositorio usar según variable de entorno
const USE_SUPABASE = import.meta.env.VITE_USE_SUPABASE === 'true';

// Repository instances
const memberRepository = USE_SUPABASE 
  ? new SupabaseMemberRepository() 
  : new MockMemberRepository();

const bioimpedanceRepository = USE_SUPABASE 
  ? new SupabaseBioimpedanceRepository() 
  : new MockBioimpedanceRepository();

// Use case instances
export const registerMemberUseCase = new RegisterMemberUseCase(memberRepository);
export const listMembersUseCase = new ListMembersUseCase(memberRepository);
export const getMemberDetailsUseCase = new GetMemberDetailsUseCase(
  memberRepository,
  bioimpedanceRepository
);
export const recordBioimpedanceUseCase = new RecordBioimpedanceUseCase(
  bioimpedanceRepository,
  memberRepository
);
```

---

## Variables de Entorno

### Crear archivo `.env.local`

En la raíz del proyecto:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui

# Feature Flag - cambiar a 'true' para usar Supabase
VITE_USE_SUPABASE=false
```

### Actualizar `.gitignore`

Asegúrate de que `.env.local` esté en `.gitignore`:

```
.env.local
.env*.local
```

---

## Proceso de Migración

### Migración Gradual (Recomendado)

#### Fase 1: Setup y Testing
1. ✅ Configurar Supabase
2. ✅ Ejecutar scripts SQL
3. ✅ Instalar dependencias
4. ✅ Crear archivos de repositorio
5. ✅ Configurar variables de entorno con `VITE_USE_SUPABASE=false`

#### Fase 2: Desarrollo
6. ✅ Implementar repositorios Supabase
7. ✅ Testing local con `VITE_USE_SUPABASE=true`
8. ✅ Verificar funcionalidad completa

#### Fase 3: Producción
9. ✅ Deploy a staging con Supabase
10. ✅ Testing exhaustivo
11. ✅ Deploy a producción
12. ✅ Monitoreo

### Comandos útiles

```bash
# Desarrollo con Mock (localStorage)
VITE_USE_SUPABASE=false npm run dev

# Desarrollo con Supabase
VITE_USE_SUPABASE=true npm run dev

# Build para producción
npm run build
```

---

## Testing

### Testing de Repositorios

Crea tests para ambos repositorios:

```typescript
// tests/infrastructure/SupabaseMemberRepository.test.ts
describe('SupabaseMemberRepository', () => {
  it('should create a member', async () => {
    const repo = new SupabaseMemberRepository();
    const member = await repo.create({
      name: 'Test User',
      email: 'test@example.com',
      dateOfBirth: new Date('1990-01-01'),
      gender: 'male'
    });
    
    expect(member.id).toBeDefined();
    expect(member.name).toBe('Test User');
  });
});
```

### Checklist de Testing

- [ ] CRUD completo de Members
- [ ] CRUD completo de Bioimpedances
- [ ] Validación de email único
- [ ] Relación Member -> Bioimpedances (CASCADE DELETE)
- [ ] Ordenamiento por fecha
- [ ] Manejo de errores

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
**Solución**: Verifica que `.env.local` existe y tiene las variables correctas.

### Error: "relation does not exist"
**Solución**: Ejecuta los scripts SQL en Supabase para crear las tablas.

### Error: "new row violates row-level security policy"
**Solución**: Verifica que las políticas RLS estén configuradas correctamente.

### Datos no aparecen
**Solución**: Verifica que `VITE_USE_SUPABASE=true` en `.env.local`

---

## Próximos Pasos

1. **Autenticación**: Implementar auth con Supabase
2. **Realtime**: Agregar subscripciones en tiempo real
3. **Storage**: Subir fotos de perfil
4. **Gráficas**: Visualizar progreso con charts
5. **Export**: Exportar datos a PDF o Excel

---

## Recursos

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [TypeScript Guide](https://supabase.com/docs/guides/api/typescript-support)
