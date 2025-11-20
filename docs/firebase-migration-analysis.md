# Análisis: Migración de Supabase a Firebase

## 📊 Resumen Ejecutivo

**Complejidad**: Media-Alta  
**Tiempo estimado**: 2-3 semanas  
**Archivos afectados**: ~8-10 archivos  
**Líneas de código a cambiar**: ~500-800 líneas

## 🎯 Ventaja de la Arquitectura DDD

Gracias a la arquitectura DDD implementada, **solo se modificaría la capa Infrastructure**. Las capas Domain, Application y Presentation permanecerían intactas.

```
✅ Domain Layer        - SIN CAMBIOS
✅ Application Layer   - SIN CAMBIOS
✅ Presentation Layer  - SIN CAMBIOS
🔄 Infrastructure     - REFACTOR COMPLETO
```

---

## 📋 Funcionalidades de Supabase Actualmente Usadas

### 1. **Autenticación** (`supabase.auth`)

- `signInWithPassword()` - Login
- `getUser()` - Obtener usuario actual
- `onAuthStateChange()` - Escuchar cambios de autenticación
- `signOut()` - Logout

### 2. **Base de Datos** (`supabase.from()`)

- `select()` - Consultas
- `insert()` - Crear registros
- `update()` - Actualizar registros
- `delete()` - Eliminar registros
- `eq()` - Filtros WHERE
- `single()` - Obtener un solo resultado
- `order()` - Ordenamiento

### 3. **Edge Functions** (`supabase.functions.invoke()`)

- `create-user` - Crear usuarios de forma segura

---

## 🔄 Mapeo Supabase → Firebase

### Autenticación

| Supabase                    | Firebase                               |
| --------------------------- | -------------------------------------- |
| `auth.signInWithPassword()` | `signInWithEmailAndPassword()`         |
| `auth.getUser()`            | `onAuthStateChanged()` + `currentUser` |
| `auth.onAuthStateChange()`  | `onAuthStateChanged()`                 |
| `auth.signOut()`            | `signOut()`                            |

**Complejidad**: Baja - APIs muy similares

### Base de Datos

| Supabase                 | Firebase                      |
| ------------------------ | ----------------------------- |
| `from('table').select()` | `collection('table').get()`   |
| `from('table').insert()` | `collection('table').add()`   |
| `from('table').update()` | `doc('id').update()`          |
| `from('table').delete()` | `doc('id').delete()`          |
| `eq('field', value)`     | `where('field', '==', value)` |
| `order('field')`         | `orderBy('field')`            |

**Complejidad**: Media - Cambios en sintaxis y modelo de datos

### Edge Functions

| Supabase                          | Firebase                             |
| --------------------------------- | ------------------------------------ |
| `functions.invoke('create-user')` | Cloud Functions HTTP call o `call()` |

**Complejidad**: Media - Requiere reescribir la función

---

## 📁 Archivos a Modificar

### 1. **Infrastructure Layer** (8 archivos)

#### Nuevos archivos a crear:

```
src/infrastructure/firebase/
├── client.ts                    # Inicialización de Firebase
├── auth.ts                      # Configuración de Auth
├── firestore.ts                 # Configuración de Firestore
└── functions.ts                 # Wrapper para Cloud Functions
```

#### Archivos a reescribir completamente:

```
src/infrastructure/auth/
└── AuthRepositoryImpl.ts        # ~150 líneas → ~180 líneas

src/infrastructure/member/
└── MemberRepositoryImpl.ts      # ~140 líneas → ~160 líneas

src/infrastructure/bioimpedance/
└── BioimpedanceRepositoryImpl.ts # ~120 líneas → ~140 líneas

src/infrastructure/user/
└── UserProfileRepositoryImpl.ts # ~100 líneas → ~120 líneas
```

#### Archivos a modificar:

```
src/core/container/
├── DIContainer.ts               # Cambiar TYPES.SupabaseClient → TYPES.FirebaseApp
└── bindings.ts                  # Cambiar bindings de Supabase → Firebase
```

### 2. **Configuración** (2 archivos)

```
package.json                     # Cambiar dependencias
.env.example                     # Cambiar variables de entorno
```

### 3. **Documentación** (opcional)

```
docs/
└── firebase-setup.md            # Nueva documentación
```

---

## 🔧 Cambios Detallados por Repositorio

### AuthRepositoryImpl

**Cambios principales**:

```typescript
// ANTES (Supabase)
const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
const {
  data: { user },
} = await this.supabase.auth.getUser();
this.supabase.auth.onAuthStateChange(callback);

// DESPUÉS (Firebase)
const userCredential = await signInWithEmailAndPassword(auth, email, password);
const user = auth.currentUser;
onAuthStateChanged(auth, callback);
```

**Complejidad**: Baja - APIs muy similares

### MemberRepositoryImpl

**Cambios principales**:

```typescript
// ANTES (Supabase)
const { data, error } = await this.supabase.from("members").select("*").eq("id", id).single();

// DESPUÉS (Firebase)
const docRef = doc(db, "members", id);
const docSnap = await getDoc(docRef);
const data = docSnap.data();
```

**Complejidad**: Media - Cambio de sintaxis y manejo de errores

### BioimpedanceRepositoryImpl

Similar a MemberRepositoryImpl - cambios en sintaxis de queries.

**Complejidad**: Media

### UserProfileRepositoryImpl

**Cambios principales**:

- Edge Function `create-user` → Cloud Function
- Queries de Firestore en lugar de Supabase

**Complejidad**: Media-Alta - Requiere reescribir la Cloud Function

---

## 🗄️ Migración de Base de Datos

### Supabase (PostgreSQL) → Firebase (Firestore)

**Diferencias clave**:

1. **Modelo de datos**:
   - PostgreSQL: Relacional, con JOINs
   - Firestore: NoSQL, documentos anidados

2. **Queries**:
   - PostgreSQL: SQL-like, muy flexible
   - Firestore: Limitado a índices, menos flexible

3. **Relaciones**:
   - PostgreSQL: Foreign keys, JOINs
   - Firestore: Referencias manuales o datos anidados

### Estrategia de Migración

1. **Mapear tablas a colecciones**:

   ```
   members → members (colección)
   bioimpedances → bioimpedances (colección)
   user_profiles → user_profiles (colección)
   ```

2. **Manejar relaciones**:
   - `user_id` en members → referencia a `users/{id}`
   - `member_id` en bioimpedances → referencia a `members/{id}`

3. **Migrar datos**:
   - Script de migración para exportar de PostgreSQL e importar a Firestore
   - Validar integridad de datos

---

## ⚙️ Configuración y Setup

### Dependencias

**Eliminar**:

```json
"@supabase/supabase-js": "^2.x.x"
```

**Agregar**:

```json
"firebase": "^10.x.x"
```

### Variables de Entorno

**Antes (Supabase)**:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

**Después (Firebase)**:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### Inicialización

**Antes**:

```typescript
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(url, key);
```

**Después**:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const app = initializeApp(config);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

---

## 📊 Estimación de Esfuerzo

### Fase 1: Setup y Configuración (2-3 días)

- [ ] Instalar Firebase SDK
- [ ] Configurar proyecto Firebase
- [ ] Crear archivos de configuración
- [ ] Actualizar variables de entorno
- [ ] Configurar DI Container

### Fase 2: Migración de Autenticación (2-3 días)

- [ ] Reescribir `AuthRepositoryImpl`
- [ ] Migrar `onAuthStateChange`
- [ ] Probar login/logout
- [ ] Ajustar `AuthProvider`

### Fase 3: Migración de Repositorios (5-7 días)

- [ ] Reescribir `MemberRepositoryImpl`
- [ ] Reescribir `BioimpedanceRepositoryImpl`
- [ ] Reescribir `UserProfileRepositoryImpl`
- [ ] Migrar Edge Function a Cloud Function
- [ ] Probar todas las operaciones CRUD

### Fase 4: Migración de Datos (2-3 días)

- [ ] Exportar datos de Supabase
- [ ] Transformar formato (PostgreSQL → Firestore)
- [ ] Importar a Firestore
- [ ] Validar integridad

### Fase 5: Testing y Ajustes (3-4 días)

- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Testing manual completo
- [ ] Ajustes y bug fixes

**Total**: 14-20 días laborables (2.5-4 semanas)

---

## ⚠️ Consideraciones Importantes

### 1. **Modelo de Datos**

- Firestore es NoSQL, no tiene JOINs
- Necesitarás reestructurar algunas queries
- Considera denormalización para mejorar performance

### 2. **Seguridad**

- Firestore usa Security Rules (similar a RLS de Supabase)
- Necesitarás reescribir las reglas de seguridad
- Más verboso que RLS de Supabase

### 3. **Costos**

- Firestore: Pay-as-you-go, puede ser más caro con mucho tráfico
- Supabase: Plan gratuito más generoso
- Evalúa el costo según tu uso

### 4. **Performance**

- Firestore: Optimizado para lectura, escritura puede ser más lenta
- Supabase: PostgreSQL es muy rápido para ambos
- Considera índices en Firestore

### 5. **Funcionalidades Perdidas**

- **PostgreSQL features**: JOINs complejos, transacciones ACID completas
- **RLS más simple**: Supabase tiene RLS más fácil de configurar
- **Edge Functions**: Supabase es más simple, Firebase más potente pero complejo

---

## ✅ Ventajas de Migrar a Firebase

1. **Ecosistema Google**: Integración con otros servicios de Google
2. **Real-time mejorado**: Firestore tiene mejor soporte para real-time
3. **Cloud Functions**: Más potentes que Edge Functions
4. **Analytics**: Firebase Analytics integrado
5. **Crashlytics**: Mejor debugging en producción

## ❌ Desventajas de Migrar a Firebase

1. **Modelo de datos**: NoSQL puede ser menos intuitivo
2. **Costos**: Puede ser más caro con mucho tráfico
3. **Queries limitadas**: Menos flexible que SQL
4. **Curva de aprendizaje**: Diferente a SQL tradicional
5. **Migración de datos**: Requiere transformación de datos

---

## 🎯 Recomendación

### ¿Cuándo migrar a Firebase?

**Migra si**:

- Necesitas integración con otros servicios de Google
- Requieres real-time más avanzado
- Tu modelo de datos es simple y no requiere JOINs complejos
- Estás dispuesto a reestructurar queries

**Quédate con Supabase si**:

- Tu modelo de datos es relacional complejo
- Necesitas SQL completo
- Prefieres RLS más simple
- El costo es una preocupación
- Ya tienes todo funcionando bien

---

## 📝 Checklist de Migración

Si decides migrar, aquí está el checklist completo:

### Pre-migración

- [ ] Evaluar costos (Firebase vs Supabase)
- [ ] Diseñar nuevo modelo de datos Firestore
- [ ] Planificar migración de datos
- [ ] Backup completo de Supabase

### Durante migración

- [ ] Setup Firebase proyecto
- [ ] Configurar Security Rules
- [ ] Reescribir repositorios
- [ ] Migrar Cloud Function
- [ ] Actualizar tests

### Post-migración

- [ ] Validar todos los flujos
- [ ] Monitorear costos
- [ ] Optimizar queries
- [ ] Documentar cambios
- [ ] Plan de rollback (por si acaso)

---

**Conclusión**: El refactor es **moderado** gracias a la arquitectura DDD. Solo la capa Infrastructure se modifica, pero requiere reescribir ~500-800 líneas de código y migrar la base de datos. El tiempo estimado es de **2-4 semanas** dependiendo de la complejidad de la migración de datos.
