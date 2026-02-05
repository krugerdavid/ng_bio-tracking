# Validación Frontend (bio-tracker) ↔ API (ng-api)

Validación de que los datos enviados y esperados entre el frontend y la API Laravel en `ng-api` coinciden.

## Respuesta estándar de la API

La API usa `ApiResponse::success($data)` / `ApiResponse::error($message, $code)`:

- **Success:** `{ "status": "success", "message": "...", "data": ... }`
- **Error:** `{ "status": "error", "message": "...", "errors": {...} }`

El frontend (HttpClient) desenvuelve y devuelve solo `data`; en error lanza `ApiError`.

---

## Auth

| Acción       | Frontend envía           | API espera (validación)                          | Estado |
| ------------ | ------------------------ | ------------------------------------------------ | ------ |
| POST /login  | `{ email, password }`    | `email` (required, email), `password` (required) | ✅     |
| POST /logout | (sin body, Bearer token) | -                                                | ✅     |
| GET /me      | (Bearer token)           | -                                                | ✅     |

**Login response:** API devuelve `data: { user: UserResource, access_token, token_type }`. El frontend usa `data.user` (id, email, role, created_at) y `data.access_token`. Coincide con UserResource (id, user_id, name, email, role, created_at, updated_at).

---

## Members

| Acción              | Frontend envía                                                                    | API espera                                                                                                                                                                                  | Estado |
| ------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| GET /members        | Query: `search`, `page`, `page_size`                                              | `search`, `page_size` (default 15). Laravel usa `page` del request en `paginate()`.                                                                                                         | ✅     |
| POST /members       | `name`, `document_number`, `email`, `date_of_birth`, `gender` (snake_case)        | StoreMemberRequest: `name` (required), `document_number` (nullable, unique), `email` (nullable, email, unique), `date_of_birth` (nullable, date), `gender` (nullable, in:male,female,other) | ✅     |
| GET /members/:id    | -                                                                                 | -                                                                                                                                                                                           | ✅     |
| PUT /members/:id    | `name`, `document_number`, `email`, `date_of_birth`, `gender` (solo los enviados) | UpdateMemberRequest: mismos campos con `sometimes` / `nullable`, unique ignorando id                                                                                                        | ✅     |
| DELETE /members/:id | -                                                                                 | -                                                                                                                                                                                           | ✅     |

**Index response:** API devuelve `MemberResource::collection($members)->response()->getData(true)` (paginado: `{ data: [...], meta: { total, current_page, last_page }, links }`). El frontend espera `payload.data` y `payload.meta?.total`. ✅

---

## Bioimpedances

| Acción                        | Frontend envía                                                                                                                                                            | API espera                                                                          | Estado |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------ |
| GET /members/:id/bioimpedance | -                                                                                                                                                                         | -                                                                                   | ✅     |
| GET /bioimpedances/:id        | -                                                                                                                                                                         | -                                                                                   | ✅     |
| POST /bioimpedances           | `member_id`, `date` (YYYY-MM-DD), `height`, `weight`, `imc`, `body_fat_percentage`, `muscle_mass_percentage`, `kcal`, `metabolic_age`, `visceral_fat_percentage`, `notes` | Mismos campos; `date` required\|date; numéricos required\|numeric; `notes` nullable | ✅     |
| PUT /bioimpedances/:id        | Mismos campos (solo los que se actualizan)                                                                                                                                | `sometimes` en todos salvo `notes` (nullable)                                       | ✅     |
| DELETE /bioimpedances/:id     | -                                                                                                                                                                         | -                                                                                   | ✅     |

---

## Payments

| Acción                    | Frontend envía                                                                           | API espera                                                                                                                                                                                                 | Estado |
| ------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| GET /members/:id/payments | -                                                                                        | -                                                                                                                                                                                                          | ✅     |
| GET /payments/:id         | -                                                                                        | -                                                                                                                                                                                                          | ✅     |
| POST /payments            | `member_id`, `month` (YYYY-MM), `amount`, `payment_date` (YYYY-MM-DD), `status`, `notes` | `member_id` (required, exists:members), `month` (required, regex YYYY-MM), `amount` (required, numeric), `payment_date` (required, date), `status` (required, in:paid,pending,overdue), `notes` (nullable) | ✅     |
| PUT /payments/:id         | `amount`, `payment_date`, `status`, `notes`                                              | `month` (sometimes), `amount`, `payment_date`, `status`, `notes` (nullable)                                                                                                                                | ✅     |
| DELETE /payments/:id      | -                                                                                        | -                                                                                                                                                                                                          | ✅     |

**Nota:** GET /payments (listado global) no existe en la API. El frontend lo usa para “últimos 10 pagos” y, ante 404/error, devuelve lista vacía. Para soportar el dashboard, la API podría añadir `GET /payments?page=1&per_page=10`.

---

## Membership Plans

| Acción                | Frontend envía                                                                         | API espera                                             | Estado |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------ |
| GET /members/:id/plan | -                                                                                      | -                                                      | ✅     |
| POST /plans           | `member_id`, `monthly_fee`, `weekly_frequency`, `start_date` (YYYY-MM-DD), `is_active` | Mismos; `is_active` (sometimes\|boolean), default true | ✅     |
| PUT /plans/:id        | `monthly_fee`, `weekly_frequency`, `start_date`, `is_active`                           | Mismos con `sometimes`                                 | ✅     |

---

## Users

| Acción            | Frontend envía                        | API espera                                                                                                                                         | Estado |
| ----------------- | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| GET /users        | -                                     | -                                                                                                                                                  | ✅     |
| POST /users       | `name`, `email`, `password`, `role`   | `name` (nullable), `email` (required, unique), `password` (required, min:6), `role` (required, in:admin,member,user). API mapea `user` → `member`. | ✅     |
| GET /users/:id    | -                                     | id como entero en ruta                                                                                                                             | ✅     |
| PUT /users/:id    | `name`, `role`, `password` (opcional) | `name` (sometimes), `email` (sometimes), `password` (nullable, min:6), `role` (sometimes). API convierte role `user` → `member`.                   | ✅     |
| DELETE /users/:id | -                                     | -                                                                                                                                                  | ✅     |

**Index response:** API devuelve `UserResource::collection($users)->resolve()` (array plano). El frontend usa `unwrapLaravelPaginated`, que admite array directo. ✅

---

## Audit Logs

| Acción          | Frontend envía                                                      | API espera                                                                                                       | Estado |
| --------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------ |
| GET /audit-logs | Query: `page`, `page_size`, `auditable_type`, `event`, `from`, `to` | `page_size`, `auditable_type`, `auditable_id`, `event`, `user_id`, `from`, `to`. Laravel usa `page` del request. | ✅     |

---

## Resumen

- **Coinciden:** Auth, Members (CRUD + index paginado), Bioimpedances, Payments (CRUD por miembro), Plans, Users, Audit logs.
- **Opcional en API:** `GET /payments` (paginado) para “últimos pagos” del dashboard. Mientras no exista, el frontend muestra lista vacía en ese bloque.

No se requieren cambios en el frontend para que los datos enviados coincidan con la API actual.
