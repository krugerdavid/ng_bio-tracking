# Estrategia de Refactorización - Bio Tracker

## 📋 Resumen Ejecutivo

Este documento propone una estrategia de refactorización para alinear el proyecto `bio-tracker` con las prácticas arquitectónicas del proyecto `merchant-web`, manteniendo la funcionalidad existente mientras se mejora la organización, mantenibilidad y escalabilidad del código.

## 🎯 Objetivos de la Refactorización

1. **Organización por Features**: Reorganizar el código por dominios/features en lugar de por capas técnicas
2. **Inyección de Dependencias Robusta**: Migrar de instancias directas a un sistema DI con InversifyJS
3. **Separación de Responsabilidades**: Implementar el patrón Controller/Page para separar lógica de presentación
4. **Capa Core**: Crear una capa `core` para configuraciones, tipos compartidos y utilidades
5. **Domain Services**: Introducir servicios de dominio explícitos para lógica de negocio compleja
6. **Result Pattern**: Implementar manejo de errores consistente con el patrón Result

## 📊 Comparación de Estructuras

### Estructura Actual (bio-tracker)
```
src/
├── application/
│   ├── di/container.ts (instancias directas)
│   └── use-cases/
│       ├── admin/ (CreateUser, ListUsers, DeleteUser)
│       ├── auth/ (Login, Logout, GetCurrentUser)
│       └── (RegisterMember, ListMembers, GetMemberDetails, RecordBioimpedance)
├── domain/
│   ├── entities/
│   ├── repositories/ (interfaces)
│   └── value-objects/
├── infrastructure/
│   └── repositories/ (implementaciones Supabase)
└── presentation/
    ├── components/ (Layout, ProtectedRoute)
    ├── context/ (AuthContext)
    └── pages/ (páginas planas sin controllers)
```

### Estructura Objetivo (basada en merchant-web)
```
src/
├── core/
│   ├── config/ (constants, environment, feature-flags)
│   ├── container/ (DIContainer, bindings)
│   ├── errors/ (DomainError, HttpError)
│   ├── http/ (HttpClient)
│   └── types/ (Entity, Id, Repository, Result, ValueObject)
├── application/
│   ├── member/use-cases/
│   ├── bioimpedance/use-cases/
│   ├── auth/use-cases/
│   └── admin/use-cases/
├── domain/
│   ├── member/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── MemberRepository.ts
│   │   └── MemberDomainService.ts
│   ├── bioimpedance/
│   ├── auth/
│   ├── user/
│   └── shared/
├── infrastructure/
│   ├── member/
│   ├── bioimpedance/
│   ├── auth/
│   └── user/
└── presentation/
    ├── app/
    │   ├── providers/ (AuthProvider, etc.)
    │   └── router/ (AppRouter, AppLayout, PrivateRoute)
    ├── features/
    │   ├── members/
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   └── pages/
    │   │       ├── MemberListPage.tsx
    │   │       └── MemberListPageController.tsx
    │   ├── bioimpedance/
    │   ├── auth/
    │   └── admin/
    └── shared/
        ├── components/
        ├── hooks/
        └── utils/
```

## 🔄 Plan de Refactorización por Fases

### Fase 1: Preparación y Core Layer (Semana 1)

#### 1.1 Crear Capa Core
- [ ] Crear `src/core/types/` con tipos base:
  - `Entity.ts` - Clase base para entidades
  - `ValueObject.ts` - Clase base para value objects
  - `Id.ts` - Tipo genérico para IDs
  - `Repository.ts` - Interfaz base para repositorios
  - `Result.ts` - Patrón Result para manejo de errores

- [ ] Crear `src/core/errors/`:
  - `DomainError.ts` - Errores de dominio
  - `HttpError.ts` - Errores HTTP

- [ ] Crear `src/core/config/`:
  - `constants.ts` - Constantes de la aplicación
  - `environment.ts` - Variables de entorno tipadas
  - `feature-flags.ts` - Feature flags (si aplica)

- [ ] Crear `src/core/http/`:
  - `HttpClient.ts` - Cliente HTTP genérico (si se necesita)

#### 1.2 Configurar InversifyJS
- [ ] Instalar dependencias:
  ```bash
  npm install inversify reflect-metadata
  npm install --save-dev @types/inversify
  ```

- [ ] Crear `src/core/container/DIContainer.ts`:
  - Definir símbolos TYPES para todas las dependencias
  - Crear container de Inversify

- [ ] Crear `src/core/container/bindings.ts`:
  - Configurar bindings de repositorios
  - Configurar bindings de use cases
  - Configurar bindings de domain services

#### 1.3 Actualizar tsconfig.json
- [ ] Habilitar decoradores y metadata:
  ```json
  {
    "compilerOptions": {
      "experimentalDecorators": true,
      "emitDecoratorMetadata": true
    }
  }
  ```

### Fase 2: Reorganización del Domain Layer (Semana 2)

#### 2.1 Reorganizar por Features
- [ ] Crear `src/domain/member/`:
  - Mover `Member.ts` a `entities/Member.ts`
  - Crear `MemberRepository.ts` (mover desde `repositories/IMemberRepository.ts`)
  - Crear `MemberDomainService.ts` (nuevo, para lógica de negocio)
  - Crear `value-objects/` si hay value objects relacionados

- [ ] Crear `src/domain/bioimpedance/`:
  - Mover `Bioimpedance.ts` a `entities/Bioimpedance.ts`
  - Crear `BioimpedanceRepository.ts`
  - Crear `BioimpedanceDomainService.ts`

- [ ] Crear `src/domain/auth/`:
  - Crear `AuthRepository.ts` (mover desde `repositories/IAuthRepository.ts`)
  - Crear `AuthDomain.ts` (servicio de dominio para lógica de autenticación)
  - Crear `types.ts` para tipos relacionados

- [ ] Crear `src/domain/user/`:
  - Mover `User.ts` y `UserProfile.ts` a `entities/`
  - Crear `UserRepository.ts` y `UserProfileRepository.ts`
  - Crear `UserDomain.ts`

- [ ] Crear `src/domain/shared/`:
  - Mover `Role.ts` a `value-objects/Role.ts`
  - Crear otros value objects compartidos

#### 2.2 Implementar Result Pattern
- [ ] Actualizar todos los repositorios para retornar `Result<T, Error>`
- [ ] Actualizar todos los use cases para usar `Result`

### Fase 3: Reorganización del Application Layer (Semana 3)

#### 3.1 Reorganizar Use Cases por Feature
- [ ] Crear `src/application/member/use-cases/`:
  - Mover `RegisterMemberUseCase.ts`
  - Mover `ListMembersUseCase.ts`
  - Mover `GetMemberDetailsUseCase.ts`

- [ ] Crear `src/application/bioimpedance/use-cases/`:
  - Mover `RecordBioimpedanceUseCase.ts`

- [ ] Crear `src/application/auth/use-cases/`:
  - Mover `LoginUseCase.ts`
  - Mover `LogoutUseCase.ts`
  - Mover `GetCurrentUserUseCase.ts`

- [ ] Crear `src/application/admin/use-cases/`:
  - Mover `CreateUserUseCase.ts`
  - Mover `ListUsersUseCase.ts`
  - Mover `DeleteUserUseCase.ts`

#### 3.2 Actualizar Use Cases para usar DI Container
- [ ] Actualizar todos los use cases para recibir dependencias del container
- [ ] Actualizar constructores para usar `@inject()` decorators

### Fase 4: Reorganización del Infrastructure Layer (Semana 4)

#### 4.1 Reorganizar por Features
- [ ] Crear `src/infrastructure/member/`:
  - Mover `SupabaseMemberRepository.ts` a `MemberRepositoryImpl.ts`
  - Crear `MemberApiService.ts` (si aplica)
  - Crear `MemberMapper.ts` (si hay mapeo de DTOs)

- [ ] Crear `src/infrastructure/bioimpedance/`:
  - Mover `SupabaseBioimpedanceRepository.ts` a `BioimpedanceRepositoryImpl.ts`
  - Crear `BioimpedanceApiService.ts` (si aplica)

- [ ] Crear `src/infrastructure/auth/`:
  - Mover `SupabaseAuthRepository.ts` a `AuthRepositoryImpl.ts`
  - Crear `AuthApiService.ts` (si aplica)

- [ ] Crear `src/infrastructure/user/`:
  - Mover `SupabaseUserProfileRepository.ts` a `UserProfileRepositoryImpl.ts`
  - Crear `UserApiService.ts` (si aplica)

#### 4.2 Actualizar Bindings
- [ ] Actualizar `bindings.ts` para usar las nuevas ubicaciones

### Fase 5: Reorganización del Presentation Layer (Semana 5)

#### 5.1 Crear Estructura de App
- [ ] Crear `src/presentation/app/providers/`:
  - Mover `AuthContext.tsx` a `AuthProvider.tsx`
  - Crear estructura similar a merchant-web

- [ ] Crear `src/presentation/app/router/`:
  - Crear `AppRouter.tsx` (mover lógica de `App.tsx`)
  - Crear `AppLayout.tsx` (mover desde `Layout.tsx`)
  - Crear `PrivateRoute.tsx` (mover desde `ProtectedRoute.tsx`)

#### 5.2 Reorganizar por Features
- [ ] Crear `src/presentation/features/members/`:
  - Crear `components/` (componentes específicos de members)
  - Crear `hooks/` (custom hooks relacionados)
  - Crear `pages/`:
    - `MemberListPage.tsx` (componente de presentación)
    - `MemberListPageController.tsx` (lógica y estado)
    - `MemberDetailPage.tsx`
    - `MemberDetailPageController.tsx`
    - `RegisterMemberPage.tsx`
    - `RegisterMemberPageController.tsx`

- [ ] Crear `src/presentation/features/bioimpedance/`:
  - Componentes y hooks relacionados con bioimpedance

- [ ] Crear `src/presentation/features/auth/`:
  - `LoginPage.tsx`
  - `LoginPageController.tsx`

- [ ] Crear `src/presentation/features/admin/`:
  - `UserManagementPage.tsx`
  - `UserManagementPageController.tsx`

#### 5.3 Crear Shared Components
- [ ] Crear `src/presentation/shared/components/`:
  - Mover componentes reutilizables
  - Organizar por tipo (Button, Input, Modal, etc.)

- [ ] Crear `src/presentation/shared/hooks/`:
  - Mover hooks reutilizables
  - Crear `useAuth.ts` (wrapper del contexto)

- [ ] Crear `src/presentation/shared/utils/`:
  - Utilidades de presentación

#### 5.4 Implementar Page Controllers
- [ ] Separar lógica de presentación en controllers:
  - Estado y efectos en Controller
  - Componente Page solo recibe props y renderiza
  - Controller obtiene use cases del DI container

### Fase 6: Actualización de Tests (Semana 6)

#### 6.1 Actualizar Tests de Use Cases
- [ ] Actualizar tests para usar DI container mock
- [ ] Actualizar tests para usar Result pattern

#### 6.2 Actualizar Tests de Componentes
- [ ] Actualizar tests para usar nueva estructura
- [ ] Actualizar mocks para nueva organización

#### 6.3 Actualizar Tests de Repositorios
- [ ] Actualizar tests para usar Result pattern

### Fase 7: Limpieza y Documentación (Semana 7)

#### 7.1 Limpieza
- [ ] Eliminar archivos obsoletos
- [ ] Actualizar imports en todo el proyecto
- [ ] Verificar que no haya referencias rotas

#### 7.2 Documentación
- [ ] Actualizar README.md con nueva estructura
- [ ] Crear `docs/ARCHITECTURE.md` similar a merchant-web
- [ ] Documentar decisiones arquitectónicas
- [ ] Actualizar guías de desarrollo

## 📝 Detalles de Implementación

### 1. Result Pattern

```typescript
// core/types/Result.ts
export class Result<T, E = Error> {
  private constructor(
    private readonly _value?: T,
    private readonly _error?: E
  ) {}

  static ok<T>(value: T): Result<T> {
    return new Result(value, undefined);
  }

  static fail<E>(error: E): Result<never, E> {
    return new Result(undefined, error);
  }

  isError(): boolean {
    return this._error !== undefined;
  }

  getValue(): T {
    if (this.isError()) {
      throw new Error('Cannot get value from error result');
    }
    return this._value!;
  }

  getError(): E {
    if (!this.isError()) {
      throw new Error('Cannot get error from success result');
    }
    return this._error!;
  }
}
```

### 2. DI Container Setup

```typescript
// core/container/DIContainer.ts
import { Container } from 'inversify';

export const TYPES = {
  // Repositories
  MemberRepository: Symbol.for('MemberRepository'),
  BioimpedanceRepository: Symbol.for('BioimpedanceRepository'),
  AuthRepository: Symbol.for('AuthRepository'),
  UserProfileRepository: Symbol.for('UserProfileRepository'),
  
  // Use Cases
  RegisterMemberUseCase: Symbol.for('RegisterMemberUseCase'),
  ListMembersUseCase: Symbol.for('ListMembersUseCase'),
  // ... más use cases
} as const;

export const container = new Container();
```

### 3. Page Controller Pattern

```typescript
// presentation/features/members/pages/MemberListPageController.tsx
import { container } from '@/core/container/bindings';
import { TYPES } from '@/core/container/DIContainer';
import type { ListMembersUseCase } from '@/application/member/use-cases/ListMembersUseCase';
import { MemberListPage } from './MemberListPage';

export const MemberListPageController = () => {
  const listMembersUseCase = container.get<ListMembersUseCase>(TYPES.ListMembersUseCase);
  
  // Lógica y estado aquí
  // ...
  
  return <MemberListPage {...props} />;
};
```

### 4. Domain Service Example

```typescript
// domain/member/MemberDomainService.ts
export class MemberDomainService {
  validateMemberAge(dateOfBirth: Date): boolean {
    const age = this.calculateAge(dateOfBirth);
    return age >= 18 && age <= 100;
  }

  private calculateAge(dateOfBirth: Date): number {
    // Lógica de cálculo
  }
}
```

## ⚠️ Consideraciones y Riesgos

### Riesgos
1. **Tiempo de desarrollo**: La refactorización completa puede tomar 6-7 semanas
2. **Riesgo de regresiones**: Cambios extensos pueden introducir bugs
3. **Curva de aprendizaje**: El equipo necesita entender InversifyJS y nuevos patrones

### Mitigaciones
1. **Refactorización incremental**: Hacer cambios por feature, no todo de una vez
2. **Tests exhaustivos**: Asegurar cobertura de tests antes de refactorizar
3. **Feature flags**: Usar feature flags para desplegar gradualmente
4. **Code reviews**: Revisar cada cambio cuidadosamente

### Recomendaciones
1. **Empezar con un feature pequeño**: Comenzar con `auth` o `member` como piloto
2. **Mantener compatibilidad temporal**: Crear adaptadores si es necesario
3. **Documentar decisiones**: Registrar por qué se tomaron ciertas decisiones
4. **Pair programming**: Trabajar en parejas para compartir conocimiento

## 📊 Métricas de Éxito

- [ ] Todos los tests pasan después de la refactorización
- [ ] Código organizado por features en todas las capas
- [ ] DI container configurado y funcionando
- [ ] Page controllers implementados para todas las páginas
- [ ] Result pattern implementado en repositorios y use cases
- [ ] Documentación actualizada
- [ ] No hay regresiones funcionales
- [ ] Mejora en métricas de mantenibilidad (complejidad ciclomática, acoplamiento)

## 🚀 Próximos Pasos

1. Revisar y aprobar esta estrategia
2. Crear issues/tickets para cada fase
3. Asignar recursos y establecer timeline
4. Comenzar con Fase 1 (Core Layer)

---

**Nota**: Esta estrategia es un plan guía. Debe ajustarse según las necesidades específicas del proyecto y el feedback del equipo.

