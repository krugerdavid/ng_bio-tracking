# Roles: root, admin y miembro

En el frontend están implementados tres niveles:

- **root**: puede crear usuarios **admin** y **miembro**. Solo root debe poder crear admins.
- **admin**: puede crear usuarios **miembro** (rol `user` en API). No puede crear otros admins.
- **miembro** (rol `user` en API): usuarios normales que gestionan sus deportistas.

## Frontend

- Login: toggle para mostrar/ocultar contraseña.
- Gestión de usuarios (`/users`): visible para admin y root. Solo root ve el selector de rol (Admin / Miembro); los admins solo pueden crear miembros.
- La ruta `/users` está protegida: si un usuario sin rol admin ni root accede, se redirige a inicio.
- El repositorio de usuarios llama a la **API Laravel** (misma base URL que el resto de la app).

## API Laravel

El frontend espera estos endpoints (base: `VITE_API_URL` + prefijo que use tu `ApiClient`, ej. `/api`):

| Método | Ruta         | Descripción                       | Body (POST/PUT)                   |
| ------ | ------------ | --------------------------------- | --------------------------------- |
| GET    | `/users`     | Listar usuarios (solo admin/root) | —                                 |
| POST   | `/users`     | Crear usuario (admin o root)      | `{ "email", "password", "role" }` |
| GET    | `/users/:id` | Obtener un usuario por `user_id`  | —                                 |
| PUT    | `/users/:id` | Actualizar usuario (ej. rol)      | `{ "role" }`                      |
| DELETE | `/users/:id` | Eliminar usuario                  | —                                 |

Formato de respuesta estándar Laravel (`ApiResponse::success`):

- Lista: `{ "status": "success", "data": [ { "id", "user_id", "email", "role", "created_by", "created_at", "updated_at" }, ... ] }`
- Un recurso: `{ "status": "success", "data": { "id", "user_id", "email", "role", "created_by", "created_at", "updated_at" } }`

Reglas que debe aplicar el backend:

1. **Roles**: El backend debe soportar al menos `root`, `admin` y `user`. El primer usuario **root** se crea manualmente (migración o seeder).
2. **Crear admins**: Solo un usuario con rol `root` puede crear usuarios con rol `admin`. Si un `admin` intenta crear con rol `admin`, devolver **403**.
3. **Crear miembros**: Usuarios con rol `root` o `admin` pueden crear usuarios con rol `user` (miembro).
4. **Listar usuarios**: Solo `root` y `admin` pueden llamar a `GET /users`. Para otros roles devolver **403** (el frontend devuelve lista vacía en ese caso).

## Resumen

| Rol en API     | Quién puede crearlo   | Quién ve "Usuarios"                 |
| -------------- | --------------------- | ----------------------------------- |
| root           | Manual (no desde app) | Sí                                  |
| admin          | Solo root             | Sí                                  |
| user (miembro) | root o admin          | No (solo admin/root ven la sección) |
